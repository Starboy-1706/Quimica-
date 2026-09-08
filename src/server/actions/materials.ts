"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  contentStatusEnum,
  courseMaterials,
  courses,
  materialTypeEnum,
  type ContentStatus,
  type MaterialType,
} from "@/db/schema";
import {
  actionError,
  actionSuccess,
  type ActionState,
} from "@/lib/action-state";
import { AUDIT_ACTIONS, recordAuditLog } from "@/lib/audit";
import { requireActionUser } from "@/lib/auth/session";
import { MATERIAL_TYPE_LABELS } from "@/lib/format";
import { snapshotContentVersion } from "@/lib/versions";

function revalidateMaterials(): void {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/materiales");
}

type UploadedRef = {
  fileKey: string | null;
  fileName: string | null;
  fileSize: number | null;
};

/** El formulario puede traer un archivo subido (ocultos) o una URL externa. */
function parseUploadedRef(formData: FormData): UploadedRef {
  const fileKey = String(formData.get("fileKey") ?? "").trim();
  const fileName = String(formData.get("fileName") ?? "").trim();
  const fileSizeRaw = String(formData.get("fileSize") ?? "").trim();
  const fileSize = fileSizeRaw ? Number.parseInt(fileSizeRaw, 10) : NaN;
  if (!fileKey) return { fileKey: null, fileName: null, fileSize: null };
  if (fileKey.includes("..") || fileKey.startsWith("/")) {
    return { fileKey: null, fileName: null, fileSize: null };
  }
  return {
    fileKey,
    fileName: fileName || null,
    fileSize: Number.isFinite(fileSize) ? fileSize : null,
  };
}

export async function createMaterialAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const actor = await requireActionUser();

    const courseId = String(formData.get("courseId") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const type = String(formData.get("type") ?? "apunte") as MaterialType;
    const rawUrl = String(formData.get("url") ?? "").trim();
    const unit = String(formData.get("unit") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const publish = formData.get("publish") === "on";
    const uploaded = parseUploadedRef(formData);

    if (!courseId) return actionError("Selecciona la asignatura del material.");
    if (!title) return actionError("El título del material es obligatorio.");
    if (!materialTypeEnum.enumValues.includes(type)) {
      return actionError("Categoría de material no válida.");
    }

    // La URL efectiva se decide en el servidor: Storage interno o externa https.
    let url: string;
    if (uploaded.fileKey) {
      url = `/archivos/${uploaded.fileKey}`;
    } else {
      if (!rawUrl) {
        return actionError("Sube un archivo o indica una URL externa.");
      }
      if (!/^https?:\/\//i.test(rawUrl)) {
        return actionError("La URL externa debe empezar por http:// o https://.");
      }
      url = rawUrl;
    }

    const [course] = await db
      .select({ id: courses.id, code: courses.code })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    if (!course) return actionError("La asignatura seleccionada no existe.");

    const status: ContentStatus = publish ? "publicado" : "borrador";

    const [material] = await db
      .insert(courseMaterials)
      .values({
        courseId,
        title,
        type,
        url,
        fileKey: uploaded.fileKey,
        fileName: uploaded.fileName,
        fileSize: uploaded.fileSize,
        unit: unit || null,
        description: description || null,
        status,
        publishedAt: publish ? new Date() : null,
        createdBy: actor.id,
        updatedBy: actor.id,
      })
      .returning();

    await snapshotContentVersion({
      entity: "course_material",
      entityId: material.id,
      version: 1,
      data: { ...material },
      changedBy: actor.id,
      changeNote: "Creación del material",
    });

    await recordAuditLog({
      actor,
      action: AUDIT_ACTIONS.MATERIAL_CREATED,
      entity: "course_material",
      entityId: material.id,
      summary: `${actor.fullName} subió «${title}» (${MATERIAL_TYPE_LABELS[type]}) a ${course.code}`,
      metadata: {
        courseCode: course.code,
        type,
        title,
        fuente: uploaded.fileKey ? "storage" : "url-externa",
        archivo: uploaded.fileName ?? undefined,
        tamano: uploaded.fileSize ?? undefined,
      },
    });

    revalidateMaterials();
    return actionSuccess();
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "No se pudo crear el material.",
    );
  }
}

export async function setMaterialStatusAction(
  materialId: string,
  status: ContentStatus,
): Promise<void> {
  if (!contentStatusEnum.enumValues.includes(status)) return;
  const actor = await requireActionUser();

  const [material] = await db
    .select()
    .from(courseMaterials)
    .where(eq(courseMaterials.id, materialId))
    .limit(1);
  if (!material || material.deletedAt || material.status === status) return;

  const nextVersion = material.version + 1;
  const [updated] = await db
    .update(courseMaterials)
    .set({
      status,
      publishedAt:
        status === "publicado"
          ? (material.publishedAt ?? new Date())
          : material.publishedAt,
      updatedAt: new Date(),
      updatedBy: actor.id,
      version: nextVersion,
    })
    .where(eq(courseMaterials.id, materialId))
    .returning();

  await snapshotContentVersion({
    entity: "course_material",
    entityId: materialId,
    version: nextVersion,
    data: { ...updated },
    changedBy: actor.id,
    changeNote: `Cambio de estado: ${material.status} → ${status}`,
  });

  await recordAuditLog({
    actor,
    action: AUDIT_ACTIONS.MATERIAL_STATUS,
    entity: "course_material",
    entityId: materialId,
    summary: `${actor.fullName} cambió «${material.title}» de «${material.status}» a «${status}»`,
    metadata: { from: material.status, to: status, title: material.title },
  });

  revalidateMaterials();
}

export async function softDeleteMaterialAction(
  materialId: string,
): Promise<void> {
  const actor = await requireActionUser();

  const [material] = await db
    .select()
    .from(courseMaterials)
    .where(eq(courseMaterials.id, materialId))
    .limit(1);
  if (!material || material.deletedAt) return;

  const nextVersion = material.version + 1;
  const [updated] = await db
    .update(courseMaterials)
    .set({
      deletedAt: new Date(),
      status: "archivado",
      updatedAt: new Date(),
      updatedBy: actor.id,
      version: nextVersion,
    })
    .where(eq(courseMaterials.id, materialId))
    .returning();

  await snapshotContentVersion({
    entity: "course_material",
    entityId: materialId,
    version: nextVersion,
    data: { ...updated },
    changedBy: actor.id,
    changeNote: "Enviado a la papelera (borrado lógico)",
  });

  await recordAuditLog({
    actor,
    action: AUDIT_ACTIONS.MATERIAL_DELETED,
    entity: "course_material",
    entityId: materialId,
    summary: `${actor.fullName} envió a la papelera «${material.title}»`,
    metadata: { title: material.title },
  });

  revalidateMaterials();
  revalidatePath("/admin/papelera");
}

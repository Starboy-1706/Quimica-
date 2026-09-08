import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  courseMaterials,
  courses,
  materialTypeEnum,
  type MaterialType,
} from "@/db/schema";
import { AUDIT_ACTIONS, recordAuditLog } from "@/lib/audit";
import { getSessionUser } from "@/lib/auth/session";
import { MATERIAL_TYPE_LABELS } from "@/lib/format";
import {
  buildStorageKey,
  passesMagicSniff,
  storeFile,
} from "@/lib/storage";
import { validateUploadMeta, MAX_BULK_FILES } from "@/lib/upload-rules";
import { snapshotContentVersion } from "@/lib/versions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function prettyTitle(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "");
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * POST /api/admin/materiales/bulk — carga masiva y segura.
 * Recibe varios archivos (hasta 20), los valida uno a uno, los sube a
 * Storage y crea un material (borrador o publicado) por cada archivo
 * válido, con su snapshot de versión y su firma en la bitácora.
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const courseId = String(formData.get("courseId") ?? "");
  const type = String(formData.get("type") ?? "apunte") as MaterialType;
  const unit = String(formData.get("unit") ?? "").trim();
  const publish = formData.get("publish") === "on";
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (!courseId) {
    return NextResponse.json(
      { error: "Selecciona la asignatura de destino." },
      { status: 422 },
    );
  }
  if (!materialTypeEnum.enumValues.includes(type)) {
    return NextResponse.json(
      { error: "Categoría no válida." },
      { status: 422 },
    );
  }
  if (files.length === 0) {
    return NextResponse.json(
      { error: "Adjunta al menos un archivo." },
      { status: 422 },
    );
  }
  if (files.length > MAX_BULK_FILES) {
    return NextResponse.json(
      { error: `Máximo ${MAX_BULK_FILES} archivos por lote.` },
      { status: 422 },
    );
  }

  const [course] = await db
    .select({ id: courses.id, code: courses.code })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);
  if (!course) {
    return NextResponse.json(
      { error: "La asignatura no existe." },
      { status: 422 },
    );
  }

  const created: Array<{ name: string; title: string }> = [];
  const failed: Array<{ name: string; error: string }> = [];

  for (const file of files) {
    const meta = validateUploadMeta(file.name, file.type, file.size);
    if (!meta.ok) {
      failed.push({ name: file.name, error: meta.error });
      continue;
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!passesMagicSniff(meta.ext, buffer)) {
      failed.push({
        name: file.name,
        error: "El contenido no coincide con la extensión.",
      });
      continue;
    }

    const key = buildStorageKey(file.name);
    try {
      await storeFile(key, buffer, file.type || "application/octet-stream");
    } catch (error) {
      failed.push({
        name: file.name,
        error:
          error instanceof Error ? error.message : "Error de almacenamiento.",
      });
      continue;
    }

    const title = prettyTitle(file.name);
    const [material] = await db
      .insert(courseMaterials)
      .values({
        courseId,
        title,
        type,
        url: `/archivos/${key}`,
        fileKey: key,
        fileName: file.name,
        fileSize: file.size,
        unit: unit || null,
        status: publish ? "publicado" : "borrador",
        publishedAt: publish ? new Date() : null,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning();

    await snapshotContentVersion({
      entity: "course_material",
      entityId: material.id,
      version: 1,
      data: { ...material },
      changedBy: user.id,
      changeNote: "Creación por carga masiva",
    });

    await recordAuditLog({
      actor: user,
      action: AUDIT_ACTIONS.MATERIAL_CREATED,
      entity: "course_material",
      entityId: material.id,
      summary: `${user.fullName} subió «${title}» (${MATERIAL_TYPE_LABELS[type]}) a ${course.code} · carga masiva`,
      metadata: {
        courseCode: course.code,
        type,
        title,
        fuente: "storage",
        archivo: file.name,
        tamano: file.size,
        cargaMasiva: true,
      },
    });

    created.push({ name: file.name, title });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/materiales");

  return NextResponse.json({ created, failed });
}

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  courseAnnouncements,
  courseMaterials,
  courses,
} from "@/db/schema";
import { AUDIT_ACTIONS, recordAuditLog } from "@/lib/audit";
import { requireActionUser } from "@/lib/auth/session";
import { removeFile } from "@/lib/storage";
import { snapshotContentVersion } from "@/lib/versions";

/**
 * Papelera lógica — restauración y purgado definitivo.
 * ------------------------------------------------------------------
 * Restaurar: deletedAt = NULL y el contenido vuelve como «borrador»
 * (nunca reaparece publicado sin revisión).
 * Purgar: eliminación física, solo Administrador; los archivos subidos
 * se borran también del Storage y el evento queda en la bitácora.
 */
export type TrashEntity = "course" | "course_material" | "course_announcement";

const ENTITY_TABLE = {
  course: courses,
  course_material: courseMaterials,
  course_announcement: courseAnnouncements,
} as const;

const ENTITY_NOUN: Record<TrashEntity, string> = {
  course: "el curso",
  course_material: "el material",
  course_announcement: "el aviso",
};

function revalidateTrash(): void {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/papelera");
  revalidatePath("/admin/cursos");
  revalidatePath("/admin/materiales");
  revalidatePath("/admin/avisos");
}

async function fetchRow(entity: TrashEntity, id: string) {
  const table = ENTITY_TABLE[entity];
  const [row] = await db.select().from(table).where(eq(table.id, id)).limit(1);
  return row ?? null;
}

function rowLabel(entity: TrashEntity, row: Record<string, unknown>): string {
  if (entity === "course") return String(row.code ?? row.title ?? "—");
  return `«${String(row.title ?? "—")}»`;
}

export async function restoreContentAction(
  entity: TrashEntity,
  id: string,
): Promise<void> {
  if (!(entity in ENTITY_TABLE)) return;
  const actor = await requireActionUser();

  const row = await fetchRow(entity, id);
  if (!row || !row.deletedAt) return;

  const nextVersion = row.version + 1;
  const table = ENTITY_TABLE[entity];
  const [updated] = await db
    .update(table)
    .set({
      deletedAt: null,
      status: "borrador", // vuelve a revisión editorial
      updatedAt: new Date(),
      updatedBy: actor.id,
      version: nextVersion,
    })
    .where(eq(table.id, id))
    .returning();

  await snapshotContentVersion({
    entity,
    entityId: id,
    version: nextVersion,
    data: { ...updated },
    changedBy: actor.id,
    changeNote: "Restaurado desde la papelera (como borrador)",
  });

  await recordAuditLog({
    actor,
    action: AUDIT_ACTIONS.CONTENT_RESTORED,
    entity,
    entityId: id,
    summary: `${actor.fullName} restauró de la papelera ${ENTITY_NOUN[entity]} ${rowLabel(entity, row)}`,
    metadata: { entity },
  });

  revalidateTrash();
}

export async function purgeContentAction(
  entity: TrashEntity,
  id: string,
): Promise<void> {
  if (!(entity in ENTITY_TABLE)) return;
  const actor = await requireActionUser(["administrador"]);

  const row = await fetchRow(entity, id);
  if (!row || !row.deletedAt) return; // solo se purga desde la papelera

  // Archivo asociado en Storage (materiales subidos).
  if (entity === "course_material") {
    const fileKey = (row as { fileKey?: string | null }).fileKey;
    if (fileKey) await removeFile(fileKey);
  }

  const table = ENTITY_TABLE[entity];
  await db.delete(table).where(eq(table.id, id));

  await recordAuditLog({
    actor,
    action: AUDIT_ACTIONS.CONTENT_PURGED,
    entity,
    entityId: id,
    summary: `${actor.fullName} purgó definitivamente ${ENTITY_NOUN[entity]} ${rowLabel(entity, row)} (estaba en v${row.version})`,
    metadata: { entity, snapshot: row as Record<string, unknown> },
  });

  revalidateTrash();
}

import { db } from "@/db";
import { contentVersions } from "@/db/schema";

/**
 * Versionado de contenido.
 * Cada alta o modificación relevante guarda un snapshot inmutable en
 * `content_versions`, identificado por (entity, entityId, version).
 */
export async function snapshotContentVersion(options: {
  entity: "course" | "course_material" | "course_announcement";
  entityId: string;
  version: number;
  data: Record<string, unknown>;
  changedBy?: string | null;
  changeNote?: string;
}): Promise<void> {
  await db.insert(contentVersions).values({
    entity: options.entity,
    entityId: options.entityId,
    version: options.version,
    data: options.data,
    changedBy: options.changedBy ?? null,
    changeNote: options.changeNote ?? null,
  });
}

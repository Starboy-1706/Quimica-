"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  announcementKindEnum,
  contentStatusEnum,
  courseAnnouncements,
  courses,
  type AnnouncementKind,
  type ContentStatus,
} from "@/db/schema";
import {
  actionError,
  actionSuccess,
  type ActionState,
} from "@/lib/action-state";
import { AUDIT_ACTIONS, recordAuditLog } from "@/lib/audit";
import { requireActionUser } from "@/lib/auth/session";
import { ANNOUNCEMENT_KIND_LABELS } from "@/lib/format";
import { snapshotContentVersion } from "@/lib/versions";

function revalidateAnnouncements(): void {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/avisos");
}

function parseEventDate(raw: string): Date | null | "invalid" {
  if (!raw.trim()) return null;
  const date = new Date(`${raw.trim()}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "invalid" : date;
}

export async function createAnnouncementAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const actor = await requireActionUser();

    const rawCourseId = String(formData.get("courseId") ?? "");
    const courseId = rawCourseId || null;
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    const kind = String(formData.get("kind") ?? "general") as AnnouncementKind;
    const pinned = formData.get("pinned") === "on";
    const publish = formData.get("publish") === "on";

    if (!title) return actionError("El título del aviso es obligatorio.");
    if (!body) return actionError("El contenido del aviso es obligatorio.");
    if (!announcementKindEnum.enumValues.includes(kind)) {
      return actionError("Tipo de aviso no válido.");
    }

    const eventDate = parseEventDate(String(formData.get("eventDate") ?? ""));
    if (eventDate === "invalid") {
      return actionError("La fecha del evento no es válida.");
    }

    let courseCode: string | null = null;
    if (courseId) {
      const [course] = await db
        .select({ code: courses.code })
        .from(courses)
        .where(eq(courses.id, courseId))
        .limit(1);
      if (!course) return actionError("La asignatura seleccionada no existe.");
      courseCode = course.code;
    }

    const status: ContentStatus = publish ? "publicado" : "borrador";

    const [announcement] = await db
      .insert(courseAnnouncements)
      .values({
        courseId,
        title,
        body,
        kind,
        eventDate,
        pinned,
        status,
        publishedAt: publish ? new Date() : null,
        createdBy: actor.id,
        updatedBy: actor.id,
      })
      .returning();

    await snapshotContentVersion({
      entity: "course_announcement",
      entityId: announcement.id,
      version: 1,
      data: { ...announcement },
      changedBy: actor.id,
      changeNote: "Creación del aviso",
    });

    await recordAuditLog({
      actor,
      action: AUDIT_ACTIONS.ANNOUNCEMENT_CREATED,
      entity: "course_announcement",
      entityId: announcement.id,
      summary: `${actor.fullName} creó el aviso «${title}» (${ANNOUNCEMENT_KIND_LABELS[kind]}, ${courseCode ?? "general"})`,
      metadata: { title, course: courseCode ?? "general", kind, pinned, status },
    });

    revalidateAnnouncements();
    return actionSuccess();
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "No se pudo crear el aviso.",
    );
  }
}

export async function setAnnouncementStatusAction(
  announcementId: string,
  status: ContentStatus,
): Promise<void> {
  if (!contentStatusEnum.enumValues.includes(status)) return;
  const actor = await requireActionUser();

  const [announcement] = await db
    .select()
    .from(courseAnnouncements)
    .where(eq(courseAnnouncements.id, announcementId))
    .limit(1);
  if (!announcement || announcement.deletedAt || announcement.status === status) {
    return;
  }

  const nextVersion = announcement.version + 1;
  const [updated] = await db
    .update(courseAnnouncements)
    .set({
      status,
      publishedAt:
        status === "publicado"
          ? (announcement.publishedAt ?? new Date())
          : announcement.publishedAt,
      updatedAt: new Date(),
      updatedBy: actor.id,
      version: nextVersion,
    })
    .where(eq(courseAnnouncements.id, announcementId))
    .returning();

  await snapshotContentVersion({
    entity: "course_announcement",
    entityId: announcementId,
    version: nextVersion,
    data: { ...updated },
    changedBy: actor.id,
    changeNote: `Cambio de estado: ${announcement.status} → ${status}`,
  });

  await recordAuditLog({
    actor,
    action: AUDIT_ACTIONS.ANNOUNCEMENT_STATUS,
    entity: "course_announcement",
    entityId: announcementId,
    summary: `${actor.fullName} cambió el aviso «${announcement.title}» de «${announcement.status}» a «${status}»`,
    metadata: { from: announcement.status, to: status },
  });

  revalidateAnnouncements();
}

export async function toggleAnnouncementPinnedAction(
  announcementId: string,
): Promise<void> {
  const actor = await requireActionUser();

  const [announcement] = await db
    .select()
    .from(courseAnnouncements)
    .where(eq(courseAnnouncements.id, announcementId))
    .limit(1);
  if (!announcement || announcement.deletedAt) return;

  const nextVersion = announcement.version + 1;
  const [updated] = await db
    .update(courseAnnouncements)
    .set({
      pinned: !announcement.pinned,
      updatedAt: new Date(),
      updatedBy: actor.id,
      version: nextVersion,
    })
    .where(eq(courseAnnouncements.id, announcementId))
    .returning();

  await snapshotContentVersion({
    entity: "course_announcement",
    entityId: announcementId,
    version: nextVersion,
    data: { ...updated },
    changedBy: actor.id,
    changeNote: updated.pinned ? "Aviso fijado" : "Aviso desfijado",
  });

  await recordAuditLog({
    actor,
    action: AUDIT_ACTIONS.ANNOUNCEMENT_PINNED,
    entity: "course_announcement",
    entityId: announcementId,
    summary: `${actor.fullName} ${updated.pinned ? "fijó" : "desfijó"} el aviso «${announcement.title}»`,
    metadata: { pinned: updated.pinned },
  });

  revalidateAnnouncements();
}

export async function softDeleteAnnouncementAction(
  announcementId: string,
): Promise<void> {
  const actor = await requireActionUser();

  const [announcement] = await db
    .select()
    .from(courseAnnouncements)
    .where(eq(courseAnnouncements.id, announcementId))
    .limit(1);
  if (!announcement || announcement.deletedAt) return;

  const nextVersion = announcement.version + 1;
  const [updated] = await db
    .update(courseAnnouncements)
    .set({
      deletedAt: new Date(),
      status: "archivado",
      updatedAt: new Date(),
      updatedBy: actor.id,
      version: nextVersion,
    })
    .where(eq(courseAnnouncements.id, announcementId))
    .returning();

  await snapshotContentVersion({
    entity: "course_announcement",
    entityId: announcementId,
    version: nextVersion,
    data: { ...updated },
    changedBy: actor.id,
    changeNote: "Enviado a la papelera (borrado lógico)",
  });

  await recordAuditLog({
    actor,
    action: AUDIT_ACTIONS.ANNOUNCEMENT_DELETED,
    entity: "course_announcement",
    entityId: announcementId,
    summary: `${actor.fullName} envió a la papelera el aviso «${announcement.title}»`,
  });

  revalidateAnnouncements();
  revalidatePath("/admin/papelera");
}

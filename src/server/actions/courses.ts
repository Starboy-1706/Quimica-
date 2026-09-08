"use server";

import { and, eq, like, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  contentStatusEnum,
  courseLevelEnum,
  courses,
  type ContentStatus,
  type CourseLevel,
  type CourseSession,
} from "@/db/schema";
import {
  actionError,
  actionSuccess,
  type ActionState,
} from "@/lib/action-state";
import { AUDIT_ACTIONS, recordAuditLog } from "@/lib/audit";
import { requireActionUser } from "@/lib/auth/session";
import { COURSE_LEVEL_LABELS, slugify } from "@/lib/format";
import { snapshotContentVersion } from "@/lib/versions";

function revalidateCourses(courseId?: string): void {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/cursos");
  if (courseId) revalidatePath(`/admin/cursos/${courseId}`);
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = base || "curso";
  const existing = await db
    .select({ slug: courses.slug })
    .from(courses)
    .where(
      excludeId
        ? and(like(courses.slug, `${root}%`), ne(courses.id, excludeId))
        : like(courses.slug, `${root}%`),
    );
  const taken = new Set(existing.map((row) => row.slug));
  if (!taken.has(root)) return root;
  let index = 2;
  while (taken.has(`${root}-${index}`)) index += 1;
  return `${root}-${index}`;
}

/** Horario semanal codificado como JSON en un campo oculto del formulario. */
function parseSchedule(raw: string): CourseSession[] | null {
  if (!raw.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const sessions: CourseSession[] = [];
    for (const item of parsed.slice(0, 14)) {
      if (typeof item !== "object" || item === null) continue;
      const record = item as Record<string, unknown>;
      const day = String(record.day ?? "").trim();
      const start = String(record.start ?? "").trim();
      const end = String(record.end ?? "").trim();
      const room = String(record.room ?? "").trim();
      if (!day || !start || !end) continue;
      sessions.push({ day, start, end, room: room || undefined });
    }
    return sessions;
  } catch {
    return null;
  }
}

type ParsedCourse = {
  code: string;
  title: string;
  term: string | null;
  credits: number | null;
  level: CourseLevel;
  room: string | null;
  description: string | null;
  schedule: CourseSession[];
};

function parseCoursePayload(
  formData: FormData,
): { ok: true; data: ParsedCourse } | { ok: false; error: string } {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const title = String(formData.get("title") ?? "").trim();
  const term = String(formData.get("term") ?? "").trim();
  const level = String(formData.get("level") ?? "grado") as CourseLevel;
  const room = String(formData.get("room") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const creditsRaw = String(formData.get("credits") ?? "").trim();

  if (!code) return { ok: false, error: "El código de la asignatura es obligatorio." };
  if (!title) return { ok: false, error: "El título de la asignatura es obligatorio." };

  const credits = creditsRaw ? Number.parseInt(creditsRaw, 10) : null;
  if (creditsRaw && (Number.isNaN(credits) || credits! < 0)) {
    return { ok: false, error: "Los créditos deben ser un número válido." };
  }
  if (!courseLevelEnum.enumValues.includes(level)) {
    return { ok: false, error: "Nivel universitario no válido." };
  }

  const schedule = parseSchedule(String(formData.get("schedule") ?? ""));
  if (schedule === null) {
    return { ok: false, error: "El horario semanal no tiene un formato válido." };
  }

  return {
    ok: true,
    data: {
      code,
      title,
      term: term || null,
      credits,
      level,
      room: room || null,
      description: description || null,
      schedule,
    },
  };
}

export async function createCourseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const actor = await requireActionUser();
    const parsed = parseCoursePayload(formData);
    if (!parsed.ok) return actionError(parsed.error);
    const { data } = parsed;

    const duplicated = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.code, data.code))
      .limit(1);
    if (duplicated.length > 0) {
      return actionError(`Ya existe una asignatura con el código ${data.code}.`);
    }

    const slug = await uniqueSlug(slugify(data.title));
    const publish = formData.get("publish") === "on";
    const status: ContentStatus = publish ? "publicado" : "borrador";

    const [course] = await db
      .insert(courses)
      .values({
        ...data,
        slug,
        status,
        publishedAt: publish ? new Date() : null,
        createdBy: actor.id,
        updatedBy: actor.id,
      })
      .returning();

    await snapshotContentVersion({
      entity: "course",
      entityId: course.id,
      version: 1,
      data: { ...course },
      changedBy: actor.id,
      changeNote: "Creación de la asignatura",
    });

    await recordAuditLog({
      actor,
      action: AUDIT_ACTIONS.COURSE_CREATED,
      entity: "course",
      entityId: course.id,
      summary: `${actor.fullName} creó ${course.code} — ${course.title} (${COURSE_LEVEL_LABELS[course.level]})`,
      metadata: { code: course.code, level: course.level, status },
    });

    revalidateCourses();
    return actionSuccess();
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "No se pudo crear el curso.",
    );
  }
}

/** Edición completa de la asignatura (con nueva versión + snapshot). */
export async function updateCourseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const actor = await requireActionUser();
    const courseId = String(formData.get("courseId") ?? "");
    if (!courseId) return actionError("Falta el identificador del curso.");

    const [existing] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    if (!existing) return actionError("La asignatura no existe.");
    if (existing.deletedAt) {
      return actionError("La asignatura está en la papelera. Restáurala antes de editarla.");
    }

    const parsed = parseCoursePayload(formData);
    if (!parsed.ok) return actionError(parsed.error);
    const { data } = parsed;

    const duplicated = await db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.code, data.code), ne(courses.id, courseId)))
      .limit(1);
    if (duplicated.length > 0) {
      return actionError(`Otra asignatura ya usa el código ${data.code}.`);
    }

    // Campos efectivamente modificados (para nota de versión y bitácora).
    const changed: string[] = [];
    if (existing.code !== data.code) changed.push("código");
    if (existing.title !== data.title) changed.push("título");
    if ((existing.term ?? null) !== data.term) changed.push("período");
    if ((existing.credits ?? null) !== data.credits) changed.push("créditos");
    if (existing.level !== data.level) changed.push("nivel");
    if ((existing.room ?? null) !== data.room) changed.push("aula");
    if ((existing.description ?? null) !== data.description) changed.push("descripción");
    if (JSON.stringify(existing.schedule ?? []) !== JSON.stringify(data.schedule)) {
      changed.push("horario");
    }

    const nextVersion = existing.version + 1;
    const [updated] = await db
      .update(courses)
      .set({
        ...data,
        updatedAt: new Date(),
        updatedBy: actor.id,
        version: nextVersion,
      })
      .where(eq(courses.id, courseId))
      .returning();

    await snapshotContentVersion({
      entity: "course",
      entityId: courseId,
      version: nextVersion,
      data: { ...updated },
      changedBy: actor.id,
      changeNote:
        changed.length > 0
          ? `Edición: ${changed.join(", ")}`
          : "Edición sin cambios efectivos",
    });

    await recordAuditLog({
      actor,
      action: AUDIT_ACTIONS.COURSE_UPDATED,
      entity: "course",
      entityId: courseId,
      summary: `${actor.fullName} editó ${updated.code} — ${updated.title}`,
      metadata: { code: updated.code, changed },
    });

    revalidateCourses(courseId);
    return actionSuccess();
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "No se pudo guardar el curso.",
    );
  }
}

export async function setCourseStatusAction(
  courseId: string,
  status: ContentStatus,
): Promise<void> {
  if (!contentStatusEnum.enumValues.includes(status)) return;
  const actor = await requireActionUser();

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);
  if (!course || course.deletedAt || course.status === status) return;

  const nextVersion = course.version + 1;
  const publishedAt =
    status === "publicado" ? (course.publishedAt ?? new Date()) : course.publishedAt;

  const [updated] = await db
    .update(courses)
    .set({
      status,
      publishedAt,
      updatedAt: new Date(),
      updatedBy: actor.id,
      version: nextVersion,
    })
    .where(eq(courses.id, courseId))
    .returning();

  await snapshotContentVersion({
    entity: "course",
    entityId: courseId,
    version: nextVersion,
    data: { ...updated },
    changedBy: actor.id,
    changeNote: `Cambio de estado: ${course.status} → ${status}`,
  });

  await recordAuditLog({
    actor,
    action: AUDIT_ACTIONS.COURSE_STATUS,
    entity: "course",
    entityId: courseId,
    summary: `${actor.fullName} cambió ${course.code} de «${course.status}» a «${status}»`,
    metadata: { from: course.status, to: status, code: course.code },
  });

  revalidateCourses(courseId);
}

export async function softDeleteCourseAction(courseId: string): Promise<void> {
  const actor = await requireActionUser(["administrador"]);

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);
  if (!course || course.deletedAt) return;

  const nextVersion = course.version + 1;
  const [updated] = await db
    .update(courses)
    .set({
      deletedAt: new Date(),
      status: "archivado",
      updatedAt: new Date(),
      updatedBy: actor.id,
      version: nextVersion,
    })
    .where(eq(courses.id, courseId))
    .returning();

  await snapshotContentVersion({
    entity: "course",
    entityId: courseId,
    version: nextVersion,
    data: { ...updated },
    changedBy: actor.id,
    changeNote: "Enviado a la papelera (borrado lógico)",
  });

  await recordAuditLog({
    actor,
    action: AUDIT_ACTIONS.COURSE_DELETED,
    entity: "course",
    entityId: courseId,
    summary: `${actor.fullName} envió a la papelera el curso ${course.code}`,
    metadata: { code: course.code },
  });

  revalidateCourses(courseId);
  revalidatePath("/admin/papelera");
}

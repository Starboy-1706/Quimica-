import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import {
  Archive,
  ArrowLeft,
  CalendarClock,
  Clock3,
  Globe,
  History,
  MapPin,
  PackageOpen,
} from "lucide-react";
import { db } from "@/db";
import { contentVersions, courses, users } from "@/db/schema";
import { setCourseStatusAction } from "@/server/actions/courses";
import { requirePageUser } from "@/lib/auth/session";
import {
  COURSE_LEVEL_LABELS,
  COURSE_LEVEL_TONES,
  formatDate,
  formatDateTime,
} from "@/lib/format";
import { EditCourseForm } from "@/components/admin/forms";
import {
  ActionFormButton,
  Badge,
  Card,
  StatusBadge,
  VersionBadge,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Editar asignatura" };
export const dynamic = "force-dynamic";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageUser();
  const { id } = await params;

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);
  if (!course) notFound();

  const versions = await db
    .select({
      version: contentVersions.version,
      changeNote: contentVersions.changeNote,
      createdAt: contentVersions.createdAt,
      editorEmail: users.email,
    })
    .from(contentVersions)
    .leftJoin(users, eq(users.id, contentVersions.changedBy))
    .where(
      and(
        eq(contentVersions.entity, "course"),
        eq(contentVersions.entityId, id),
      ),
    )
    .orderBy(desc(contentVersions.version))
    .limit(10);

  return (
    <div>
      <Link
        href="/admin/cursos"
        className="inline-flex items-center gap-2 text-sm text-sand transition hover:text-brass"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a asignaturas
      </Link>

      <div className="mb-8 mt-5 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold text-cream">
          {course.code} — {course.title}
        </h1>
        <StatusBadge status={course.status} />
        <Badge tone={COURSE_LEVEL_TONES[course.level]}>
          {COURSE_LEVEL_LABELS[course.level]}
        </Badge>
        <VersionBadge version={course.version} />
        {course.deletedAt ? (
          <Badge tone="red">En la papelera</Badge>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Edición */}
        <Card
          title="Datos de la asignatura"
          description="Al guardar se registra una nueva versión con snapshot completo y su firma en la bitácora."
        >
          <EditCourseForm course={course} />
        </Card>

        <div className="space-y-6">
          {/* Ciclo editorial */}
          <Card title="Ciclo editorial">
            {course.status === "publicado" && !course.deletedAt ? (
              <Link
                href={`/cursos/${course.slug}`}
                target="_blank"
                className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-brass transition hover:underline"
              >
                Ver página pública del curso ↗
              </Link>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {course.status !== "publicado" && !course.deletedAt ? (
                <form
                  action={setCourseStatusAction.bind(null, course.id, "publicado")}
                >
                  <ActionFormButton title="Publicar">
                    <Globe className="h-3.5 w-3.5" /> Publicar
                  </ActionFormButton>
                </form>
              ) : null}
              {course.status !== "archivado" && !course.deletedAt ? (
                <form
                  action={setCourseStatusAction.bind(null, course.id, "archivado")}
                >
                  <ActionFormButton title="Archivar">
                    <Archive className="h-3.5 w-3.5" /> Archivar
                  </ActionFormButton>
                </form>
              ) : null}
              {course.status === "archivado" && !course.deletedAt ? (
                <form
                  action={setCourseStatusAction.bind(null, course.id, "borrador")}
                >
                  <ActionFormButton title="Volver a borrador">
                    <PackageOpen className="h-3.5 w-3.5" /> A borrador
                  </ActionFormButton>
                </form>
              ) : null}
            </div>
            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-xs text-muted">
              <div className="flex justify-between">
                <dt>Creada</dt>
                <dd>{formatDateTime(course.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Actualizada</dt>
                <dd>{formatDateTime(course.updatedAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Publicada</dt>
                <dd>{formatDateTime(course.publishedAt)}</dd>
              </div>
              {course.room ? (
                <div className="flex justify-between">
                  <dt>Aula</dt>
                  <dd className="inline-flex items-center gap-1 text-sand">
                    <MapPin className="h-3 w-3" /> {course.room}
                  </dd>
                </div>
              ) : null}
            </dl>
          </Card>

          {/* Horario */}
          <Card title="Horario semanal">
            {course.schedule && course.schedule.length > 0 ? (
              <ul className="space-y-2">
                {course.schedule.map((session, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 rounded-xl border border-line bg-lift/40 px-3.5 py-2.5 text-xs"
                  >
                    <CalendarClock className="h-3.5 w-3.5 shrink-0 text-brass" />
                    <span className="font-medium text-cream">{session.day}</span>
                    <span className="text-sand">
                      {session.start} – {session.end}
                    </span>
                    {session.room ? (
                      <span className="ml-auto text-muted">{session.room}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs italic text-muted">
                Sin sesiones definidas. Añádelas desde el formulario de edición.
              </p>
            )}
          </Card>

          {/* Historial de versiones */}
          <Card
            title="Historial de versiones"
            description="Snapshots inmutables en content_versions."
          >
            {versions.length === 0 ? (
              <p className="text-xs italic text-muted">Aún no hay versiones.</p>
            ) : (
              <ul className="space-y-3">
                {versions.map((entry) => (
                  <li key={entry.version} className="flex gap-3 text-xs">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lift font-mono text-[10px] text-brass">
                      v{entry.version}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sand">
                        {entry.changeNote ?? "Cambio registrado"}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted">
                        <Clock3 className="h-2.5 w-2.5" />
                        {formatDateTime(entry.createdAt)} ·{" "}
                        {entry.editorEmail ?? "—"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 flex items-center gap-1.5 border-t border-line pt-3 text-[10px] text-muted">
              <History className="h-3 w-3" /> Última modificación:{" "}
              {formatDate(course.updatedAt)}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

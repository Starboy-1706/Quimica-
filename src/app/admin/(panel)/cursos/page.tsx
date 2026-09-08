import type { Metadata } from "next";
import Link from "next/link";
import { desc, isNull } from "drizzle-orm";
import {
  Archive,
  BookOpen,
  Globe,
  MapPin,
  PackageOpen,
  Pencil,
  Trash2,
} from "lucide-react";
import { db } from "@/db";
import { courses } from "@/db/schema";
import {
  setCourseStatusAction,
  softDeleteCourseAction,
} from "@/server/actions/courses";
import { requirePageUser } from "@/lib/auth/session";
import {
  COURSE_LEVEL_LABELS,
  COURSE_LEVEL_TONES,
  formatDate,
} from "@/lib/format";
import { CreateCourseForm } from "@/components/admin/forms";
import {
  ActionFormButton,
  Badge,
  EmptyState,
  PageHeader,
  StatusBadge,
  TableShell,
  Td,
  Th,
  THead,
  Tr,
  VersionBadge,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Asignaturas" };
export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const user = await requirePageUser();
  const allCourses = await db.query.courses.findMany({
    where: isNull(courses.deletedAt),
    orderBy: [desc(courses.updatedAt)],
    with: {
      materials: { columns: { id: true } },
    },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Contenido · Asignaturas"
        title="Asignaturas"
        description="Materias de química de grado, máster y doctorado, con códigos, semestres, horarios y aulas. Cada edición genera una nueva versión y su firma en la bitácora."
      />

      <CreateCourseForm />

      {allCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Todavía no hay asignaturas"
          description="Registra la primera asignatura del período con el botón «Nueva asignatura»."
        />
      ) : (
        <TableShell>
          <THead>
            <Th>Asignatura</Th>
            <Th>Nivel</Th>
            <Th>Período</Th>
            <Th>Materiales</Th>
            <Th>Estado</Th>
            <Th>Versión</Th>
            <Th>Acciones</Th>
          </THead>
          <tbody>
            {allCourses.map((course) => (
              <Tr key={course.id}>
                <Td>
                  <Link
                    href={`/admin/cursos/${course.id}`}
                    className="font-medium text-cream transition hover:text-brass"
                  >
                    {course.title}
                  </Link>
                  <p className="mt-0.5 font-mono text-[11px] text-muted">
                    {course.code}
                    {course.room ? (
                      <span className="inline-flex items-center gap-1">
                        {" "}· <MapPin className="inline h-3 w-3" />
                        {course.room}
                      </span>
                    ) : null}
                    {course.schedule && course.schedule.length > 0
                      ? ` · ${course.schedule.length} sesiones semanales`
                      : ""}
                  </p>
                </Td>
                <Td>
                  <Badge tone={COURSE_LEVEL_TONES[course.level]}>
                    {COURSE_LEVEL_LABELS[course.level]}
                  </Badge>
                </Td>
                <Td className="text-sand">{course.term ?? "—"}</Td>
                <Td className="text-sand">{course.materials.length}</Td>
                <Td>
                  <StatusBadge status={course.status} />
                </Td>
                <Td>
                  <VersionBadge version={course.version} />
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/admin/cursos/${course.id}`}
                      title="Editar asignatura"
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[11px] font-medium text-sand transition hover:border-brass/50 hover:text-brass"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Link>
                    {course.status !== "publicado" ? (
                      <form
                        action={setCourseStatusAction.bind(null, course.id, "publicado")}
                      >
                        <ActionFormButton title="Publicar">
                          <Globe className="h-3.5 w-3.5" />
                        </ActionFormButton>
                      </form>
                    ) : null}
                    {course.status !== "archivado" ? (
                      <form
                        action={setCourseStatusAction.bind(null, course.id, "archivado")}
                      >
                        <ActionFormButton title="Archivar">
                          <Archive className="h-3.5 w-3.5" />
                        </ActionFormButton>
                      </form>
                    ) : (
                      <form
                        action={setCourseStatusAction.bind(null, course.id, "borrador")}
                      >
                        <ActionFormButton title="Volver a borrador">
                          <PackageOpen className="h-3.5 w-3.5" />
                        </ActionFormButton>
                      </form>
                    )}
                    {user.role === "administrador" ? (
                      <form action={softDeleteCourseAction.bind(null, course.id)}>
                        <ActionFormButton title="Enviar a la papelera" danger>
                          <Trash2 className="h-3.5 w-3.5" />
                        </ActionFormButton>
                      </form>
                    ) : null}
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <p className="mt-5 text-[11px] text-muted">
        Última edición: {allCourses[0] ? formatDate(allCourses[0].updatedAt) : "—"}
        {" "}· El borrado es lógico: las asignaturas eliminadas se recuperan desde{" "}
        <Link href="/admin/papelera" className="text-brass hover:underline">
          la papelera
        </Link>
        .
      </p>
    </div>
  );
}

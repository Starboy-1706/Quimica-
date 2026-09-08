import type { Metadata } from "next";
import Link from "next/link";
import { isNotNull, desc } from "drizzle-orm";
import {
  BookOpen,
  FileStack,
  Megaphone,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { db } from "@/db";
import {
  courseAnnouncements,
  courseMaterials,
  courses,
} from "@/db/schema";
import {
  purgeContentAction,
  restoreContentAction,
  type TrashEntity,
} from "@/server/actions/trash";
import { requirePageUser } from "@/lib/auth/session";
import { COURSE_LEVEL_LABELS, formatDateTime } from "@/lib/format";
import { PurgeButton } from "@/components/admin/forms";
import {
  ActionFormButton,
  Badge,
  EmptyState,
  PageHeader,
  VersionBadge,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Papelera" };
export const dynamic = "force-dynamic";

const ENTITY_META: Record<
  TrashEntity,
  { label: string; icon: typeof BookOpen; tone: "gold" | "green" | "slate" | "red" | "blue" }
> = {
  course: { label: "Asignatura", icon: BookOpen, tone: "green" },
  course_material: { label: "Material", icon: FileStack, tone: "blue" },
  course_announcement: { label: "Aviso", icon: Megaphone, tone: "gold" },
};

type TrashItem = {
  entity: TrashEntity;
  id: string;
  title: string;
  detail: string;
  deletedAt: Date;
  version: number;
};

export default async function AdminTrashPage() {
  const user = await requirePageUser();

  const [deletedCourses, deletedMaterials, deletedAnnouncements] =
    await Promise.all([
      db.query.courses.findMany({
        where: isNotNull(courses.deletedAt),
        orderBy: [desc(courses.deletedAt)],
      }),
      db.query.courseMaterials.findMany({
        where: isNotNull(courseMaterials.deletedAt),
        orderBy: [desc(courseMaterials.deletedAt)],
        with: { course: { columns: { code: true } } },
      }),
      db.query.courseAnnouncements.findMany({
        where: isNotNull(courseAnnouncements.deletedAt),
        orderBy: [desc(courseAnnouncements.deletedAt)],
        with: { course: { columns: { code: true } } },
      }),
    ]);

  const items: TrashItem[] = [
    ...deletedCourses.map((course) => ({
      entity: "course" as const,
      id: course.id,
      title: `${course.code} — ${course.title}`,
      detail: [COURSE_LEVEL_LABELS[course.level], course.term]
        .filter(Boolean)
        .join(" · "),
      deletedAt: course.deletedAt!,
      version: course.version,
    })),
    ...deletedMaterials.map((material) => ({
      entity: "course_material" as const,
      id: material.id,
      title: material.title,
      detail: `Asignatura: ${material.course.code}`,
      deletedAt: material.deletedAt!,
      version: material.version,
    })),
    ...deletedAnnouncements.map((announcement) => ({
      entity: "course_announcement" as const,
      id: announcement.id,
      title: announcement.title,
      detail: announcement.course
        ? `Asignatura: ${announcement.course.code}`
        : "Aviso general",
      deletedAt: announcement.deletedAt!,
      version: announcement.version,
    })),
  ].sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());

  return (
    <div>
      <PageHeader
        eyebrow="Contenido · Recuperación"
        title="Papelera lógica"
        description="Todo el «borrado» del panel es reversible (deletedAt): restaura cualquier elemento —vuelve como borrador— o púrgalo definitivamente si eres administrador."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="La papelera está vacía"
          description="Cuando envíes cursos, materiales o avisos a la papelera aparecerán aquí, con opción de restauración."
        />
      ) : (
        <>
          <div className="dark-scroll overflow-x-auto rounded-2xl border border-line bg-panel">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  <th className="px-5 py-3.5 font-medium">Elemento</th>
                  <th className="px-5 py-3.5 font-medium">Tipo</th>
                  <th className="px-5 py-3.5 font-medium">Versión</th>
                  <th className="px-5 py-3.5 font-medium">En papelera desde</th>
                  <th className="px-5 py-3.5 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const meta = ENTITY_META[item.entity];
                  return (
                    <tr
                      key={`${item.entity}-${item.id}`}
                      className="border-b border-line/60 transition last:border-0 hover:bg-lift/40"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-cream">{item.title}</p>
                        {item.detail ? (
                          <p className="mt-0.5 text-[11px] text-muted">
                            {item.detail}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={meta.tone}>
                          <meta.icon className="h-3 w-3" />
                          {meta.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <VersionBadge version={item.version} />
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {formatDateTime(item.deletedAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <form
                            action={restoreContentAction.bind(null, item.entity, item.id)}
                          >
                            <ActionFormButton title="Restaurar como borrador">
                              <RotateCcw className="h-3.5 w-3.5" /> Restaurar
                            </ActionFormButton>
                          </form>
                          {user.role === "administrador" ? (
                            <form
                              action={purgeContentAction.bind(null, item.entity, item.id)}
                            >
                              <PurgeButton />
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-[11px] leading-relaxed text-muted">
            Al restaurar, el contenido vuelve al estado{" "}
            <strong className="text-sand">borrador</strong> — nunca reaparece
            publicado sin revisión. El purgado elimina el registro físicamente
            (y su archivo del Storage, si lo tiene) y queda firmado en la
            bitácora con snapshot completo.{" "}
            <Link href="/admin/auditoria" className="text-brass hover:underline">
              Ver auditoría
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

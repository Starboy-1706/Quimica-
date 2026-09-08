import type { Metadata } from "next";
import { desc, isNull } from "drizzle-orm";
import {
  Archive,
  CalendarClock,
  Globe,
  Megaphone,
  PackageOpen,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import { db } from "@/db";
import { courseAnnouncements, courses } from "@/db/schema";
import {
  setAnnouncementStatusAction,
  softDeleteAnnouncementAction,
  toggleAnnouncementPinnedAction,
} from "@/server/actions/announcements";
import { requirePageUser } from "@/lib/auth/session";
import {
  ANNOUNCEMENT_KIND_LABELS,
  ANNOUNCEMENT_KIND_TONES,
  formatDate,
} from "@/lib/format";
import { CreateAnnouncementForm } from "@/components/admin/forms";
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

export const metadata: Metadata = { title: "Avisos" };
export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  await requirePageUser();

  const [allAnnouncements, courseOptions] = await Promise.all([
    db.query.courseAnnouncements.findMany({
      where: isNull(courseAnnouncements.deletedAt),
      orderBy: [
        desc(courseAnnouncements.pinned),
        desc(courseAnnouncements.createdAt),
      ],
      with: { course: { columns: { code: true, title: true } } },
    }),
    db.query.courses.findMany({
      where: isNull(courses.deletedAt),
      columns: { id: true, code: true, title: true },
      orderBy: (fields, { asc }) => [asc(fields.code)],
    }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Contenido · Avisos y novedades"
        title="Avisos"
        description="Publicación rápida por asignatura: exámenes, cambios de aula y entregas, con fecha del evento y tipología editorial."
      />

      <CreateAnnouncementForm courses={courseOptions} />

      {allAnnouncements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Tablón vacío"
          description="Publica el primer aviso del período: exámenes, cambios de aula, entregas…"
        />
      ) : (
        <TableShell>
          <THead>
            <Th>Aviso</Th>
            <Th>Tipo</Th>
            <Th>Alcance</Th>
            <Th>Estado</Th>
            <Th>Versión</Th>
            <Th>Acciones</Th>
          </THead>
          <tbody>
            {allAnnouncements.map((announcement) => (
              <Tr key={announcement.id}>
                <Td>
                  <p className="flex items-center gap-2 font-medium text-cream">
                    {announcement.pinned ? (
                      <Pin className="h-3.5 w-3.5 shrink-0 text-brass" />
                    ) : null}
                    <span className="line-clamp-1 max-w-64">
                      {announcement.title}
                    </span>
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                    {announcement.eventDate ? (
                      <span className="inline-flex items-center gap-1 text-sand">
                        <CalendarClock className="h-3 w-3" />
                        {formatDate(announcement.eventDate)}
                      </span>
                    ) : null}
                    <span>{formatDate(announcement.createdAt)}</span>
                  </p>
                </Td>
                <Td>
                  <Badge tone={ANNOUNCEMENT_KIND_TONES[announcement.kind]}>
                    {ANNOUNCEMENT_KIND_LABELS[announcement.kind]}
                  </Badge>
                </Td>
                <Td>
                  <Badge tone={announcement.course ? "blue" : "slate"}>
                    {announcement.course?.code ?? "General"}
                  </Badge>
                </Td>
                <Td>
                  <StatusBadge status={announcement.status} />
                </Td>
                <Td>
                  <VersionBadge version={announcement.version} />
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <form
                      action={toggleAnnouncementPinnedAction.bind(null, announcement.id)}
                    >
                      <ActionFormButton
                        title={announcement.pinned ? "Desfijar" : "Fijar"}
                      >
                        {announcement.pinned ? (
                          <PinOff className="h-3.5 w-3.5" />
                        ) : (
                          <Pin className="h-3.5 w-3.5" />
                        )}
                      </ActionFormButton>
                    </form>
                    {announcement.status !== "publicado" ? (
                      <form
                        action={setAnnouncementStatusAction.bind(null, announcement.id, "publicado")}
                      >
                        <ActionFormButton title="Publicar">
                          <Globe className="h-3.5 w-3.5" />
                        </ActionFormButton>
                      </form>
                    ) : null}
                    {announcement.status !== "archivado" ? (
                      <form
                        action={setAnnouncementStatusAction.bind(null, announcement.id, "archivado")}
                      >
                        <ActionFormButton title="Archivar">
                          <Archive className="h-3.5 w-3.5" />
                        </ActionFormButton>
                      </form>
                    ) : (
                      <form
                        action={setAnnouncementStatusAction.bind(null, announcement.id, "borrador")}
                      >
                        <ActionFormButton title="Volver a borrador">
                          <PackageOpen className="h-3.5 w-3.5" />
                        </ActionFormButton>
                      </form>
                    )}
                    <form
                      action={softDeleteAnnouncementAction.bind(null, announcement.id)}
                    >
                      <ActionFormButton title="Enviar a la papelera" danger>
                        <Trash2 className="h-3.5 w-3.5" />
                      </ActionFormButton>
                    </form>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}

import Link from "next/link";
import { and, count, desc, eq, gt, isNull } from "drizzle-orm";
import {
  ArrowRight,
  BookOpen,
  FileStack,
  History,
  Inbox,
  Megaphone,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { db } from "@/db";
import {
  auditLogs,
  contactMessages,
  contentVersions,
  courseAnnouncements,
  courseMaterials,
  courses,
  userSessions,
  users,
} from "@/db/schema";
import { AUDIT_ACTION_LABELS } from "@/lib/audit";
import { requirePageUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { PageHeader, StatCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await requirePageUser();

  const [
    [coursesTotal],
    [coursesPublished],
    [materialsPublished],
    [announcementsPublished],
    [activeUsers],
    [activeSessions],
    [versionsTotal],
    [newMessages],
    recentAudit,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(courses)
      .where(isNull(courses.deletedAt)),
    db
      .select({ value: count() })
      .from(courses)
      .where(and(eq(courses.status, "publicado"), isNull(courses.deletedAt))),
    db
      .select({ value: count() })
      .from(courseMaterials)
      .where(
        and(
          eq(courseMaterials.status, "publicado"),
          isNull(courseMaterials.deletedAt),
        ),
      ),
    db
      .select({ value: count() })
      .from(courseAnnouncements)
      .where(
        and(
          eq(courseAnnouncements.status, "publicado"),
          isNull(courseAnnouncements.deletedAt),
        ),
      ),
    db.select({ value: count() }).from(users).where(eq(users.status, "activo")),
    db
      .select({ value: count() })
      .from(userSessions)
      .where(
        and(
          isNull(userSessions.revokedAt),
          gt(userSessions.expiresAt, new Date()),
        ),
      ),
    db.select({ value: count() }).from(contentVersions),
    db
      .select({ value: count() })
      .from(contactMessages)
      .where(eq(contactMessages.status, "nuevo")),
    db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(8),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow={`Sesión · ${user.role === "administrador" ? "Administrador" : "Editor / Ayudante"}`}
        title={`Hola, ${user.fullName.split(" ")[0]}`}
        description="Resumen vivo del aula docente: contenido publicado, cuentas activas y la bitácora de auditoría en tiempo real."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={BookOpen}
          label="Asignaturas"
          value={coursesTotal.value}
          hint={`${coursesPublished.value} publicadas`}
        />
        <StatCard
          icon={FileStack}
          label="Materiales"
          value={materialsPublished.value}
          hint="visibles en el sitio"
        />
        <StatCard
          icon={Megaphone}
          label="Avisos"
          value={announcementsPublished.value}
          hint="vigentes en el tablón"
        />
        <StatCard
          icon={Inbox}
          label="Consultas nuevas"
          value={newMessages.value}
          hint="bandeja estudiantil"
        />
        <StatCard
          icon={Users}
          label="Cuentas activas"
          value={activeUsers.value}
          hint={`${activeSessions.value} sesiones vigentes`}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Bitácora reciente */}
        <section className="rounded-2xl border border-line bg-panel">
          <header className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="flex items-center gap-2 font-display text-lg font-medium text-cream">
              <History className="h-4 w-4 text-brass" />
              Actividad reciente
            </h2>
            <Link
              href="/admin/auditoria"
              className="inline-flex items-center gap-1 text-xs text-sand transition hover:text-brass"
            >
              Ver bitácora completa <ArrowRight className="h-3 w-3" />
            </Link>
          </header>
          <ul className="divide-y divide-line/60">
            {recentAudit.length === 0 ? (
              <li className="px-6 py-10 text-center text-sm text-muted">
                Aún no hay eventos registrados.
              </li>
            ) : (
              recentAudit.map((entry) => (
                <li key={entry.id} className="flex items-start gap-4 px-6 py-3.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-cream">
                      {entry.summary ??
                        AUDIT_ACTION_LABELS[entry.action] ??
                        entry.action}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {entry.actorEmail ?? "sistema"} ·{" "}
                      {AUDIT_ACTION_LABELS[entry.action] ?? entry.action}
                    </p>
                  </div>
                  <time className="shrink-0 text-[11px] text-muted">
                    {formatDateTime(entry.createdAt)}
                  </time>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Panel lateral */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-panel p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-medium text-cream">
              <ScrollText className="h-4 w-4 text-brass" />
              Versionado
            </h2>
            <p className="mt-3 font-display text-4xl font-semibold text-cream">
              {versionsTotal.value}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              snapshots inmutables registrados en{" "}
              <code className="rounded bg-lift px-1.5 py-0.5 font-mono text-[10px]">
                content_versions
              </code>{" "}
              para cursos, materiales y avisos.
            </p>
          </section>

          <section className="rounded-2xl border border-brass/25 bg-brass/[0.06] p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-medium text-cream">
              <ShieldCheck className="h-4 w-4 text-brass" />
              Acceso controlado
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-sand">
              Cada acción administrativa queda firmada con la cuenta
              individual de su autor, su rol, la IP y el navegador.
            </p>
            <Link
              href="/admin/auditoria"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brass transition hover:gap-2.5"
            >
              Revisar auditoría <ArrowRight className="h-3 w-3" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

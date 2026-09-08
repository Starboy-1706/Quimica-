import type { Metadata } from "next";
import { and, count, desc, eq, gte, type SQL } from "drizzle-orm";
import {
  AlertTriangle,
  Filter,
  ScrollText,
  Waypoints,
} from "lucide-react";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { AUDIT_ACTION_LABELS, AUDIT_ACTIONS } from "@/lib/audit";
import { requirePageUser } from "@/lib/auth/session";
import { formatDateTime, initials } from "@/lib/format";
import {
  Badge,
  EmptyState,
  PageHeader,
  StatCard,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Auditoría" };
export const dynamic = "force-dynamic";

const ENTITY_LABELS: Record<string, string> = {
  course: "Asignaturas",
  course_material: "Materiales",
  course_announcement: "Avisos",
  site_setting: "Ajustes",
  professor_profile: "Perfil",
  session: "Sesiones",
  user: "Cuentas",
  system: "Sistema",
};

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entidad?: string }>;
}) {
  await requirePageUser();
  const { entidad } = await searchParams;

  const activeFilter =
    entidad && entidad in ENTITY_LABELS ? entidad : undefined;
  const where = activeFilter
    ? eq(auditLogs.entity, activeFilter)
    : undefined;

  const filterClauses: SQL[] = activeFilter
    ? [eq(auditLogs.entity, activeFilter)]
    : [];

  const today = startOfToday();

  const [[totalCount], [todayCount], [failedCount], entries] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(auditLogs)
        .where(filterClauses.length ? and(...filterClauses) : undefined),
      db
        .select({ value: count() })
        .from(auditLogs)
        .where(
          filterClauses.length
            ? and(...filterClauses, gte(auditLogs.createdAt, today))
            : gte(auditLogs.createdAt, today),
        ),
      db
        .select({ value: count() })
        .from(auditLogs)
        .where(
          filterClauses.length
            ? and(
                ...filterClauses,
                eq(auditLogs.action, AUDIT_ACTIONS.LOGIN_FAILED),
              )
            : eq(auditLogs.action, AUDIT_ACTIONS.LOGIN_FAILED),
        ),
      db
        .select()
        .from(auditLogs)
        .where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(100),
    ]);

  return (
    <div>
      <PageHeader
        eyebrow="Trazabilidad · Bitácora"
        title="Auditoría"
        description="Registro inmutable de cada acción administrativa: quién la ejecutó, con qué rol, cuándo, desde qué IP y con qué navegador."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={ScrollText}
          label="Eventos registrados"
          value={totalCount.value}
          hint={activeFilter ? `filtrado: ${ENTITY_LABELS[activeFilter]}` : "histórico completo"}
        />
        <StatCard
          icon={Waypoints}
          label="Eventos de hoy"
          value={todayCount.value}
        />
        <StatCard
          icon={AlertTriangle}
          label="Intentos fallidos"
          value={failedCount.value}
          hint="accesos rechazados"
        />
      </div>

      {/* Filtro por entidad */}
      <form
        method="get"
        className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-panel px-5 py-4"
      >
        <Filter className="h-4 w-4 text-muted" />
        <label htmlFor="entidad" className="text-xs text-sand">
          Filtrar por entidad
        </label>
        <select
          id="entidad"
          name="entidad"
          defaultValue={activeFilter ?? ""}
          className="rounded-lg border border-line bg-lift px-3 py-2 text-xs text-cream focus:border-brass/60 focus:outline-none"
        >
          <option value="">Todas</option>
          {Object.entries(ENTITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-brass px-3.5 py-2 text-xs font-semibold text-night transition hover:bg-brass/90"
        >
          Aplicar
        </button>
      </form>

      {entries.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Sin eventos para este filtro"
          description="La bitácora se alimenta automáticamente de las acciones del panel y de los inicios de sesión."
        />
      ) : (
        <div className="dark-scroll overflow-x-auto rounded-2xl border border-line bg-panel">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                <th className="px-5 py-3.5 font-medium">Fecha</th>
                <th className="px-5 py-3.5 font-medium">Actor</th>
                <th className="px-5 py-3.5 font-medium">Acción</th>
                <th className="px-5 py-3.5 font-medium">Entidad</th>
                <th className="px-5 py-3.5 font-medium">Resumen</th>
                <th className="px-5 py-3.5 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-line/60 align-top transition last:border-0 hover:bg-lift/40"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-muted">
                    {formatDateTime(entry.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lift text-[10px] font-semibold text-brass">
                        {entry.actorEmail
                          ? initials(entry.actorEmail.split("@")[0] ?? "?")
                          : "—"}
                      </span>
                      <div className="leading-tight">
                        <p className="max-w-44 truncate text-cream">
                          {entry.actorEmail ?? "anónimo / sistema"}
                        </p>
                        {entry.actorRole ? (
                          <p className="text-[10px] uppercase tracking-wider text-muted">
                            {entry.actorRole}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      tone={
                        entry.action === AUDIT_ACTIONS.LOGIN_FAILED
                          ? "red"
                          : entry.action.startsWith("auth.")
                            ? "blue"
                            : "gold"
                      }
                    >
                      {AUDIT_ACTION_LABELS[entry.action] ?? entry.action}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-[11px] text-sand">
                      {ENTITY_LABELS[entry.entity] ?? entry.entity}
                    </span>
                  </td>
                  <td className="max-w-md px-5 py-4 text-sand">
                    <span className="line-clamp-2 text-xs leading-relaxed">
                      {entry.summary ?? "—"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-[11px] text-muted">
                    {entry.ipAddress ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

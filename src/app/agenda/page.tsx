import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, isNotNull, isNull, eq } from "drizzle-orm";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  ChevronRight,
} from "lucide-react";
import { db } from "@/db";
import {
  courseAnnouncements,
  courses,
  type AnnouncementKind,
} from "@/db/schema";
import {
  addMonths,
  buildMonthGrid,
  currentDay,
  formatLongDate,
  MONTH_NAMES,
  startOfDay,
  toDateKey,
  WEEKDAY_LONG,
  WEEKDAY_SHORT,
} from "@/lib/calendar";
import { ANNOUNCEMENT_KIND_LABELS } from "@/lib/format";
import {
  getProfessorPublicProfile,
  getSiteSettingsMap,
} from "@/server/queries";
import {
  brandVars,
  PublicFooter,
  PublicNav,
} from "@/components/public/chrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agenda académica",
  description:
    "Calendario público con las fechas clave del período: exámenes, entregas de proyectos, seminarios y cambios de aula del Departamento de Química.",
};

const KIND_DOT: Record<AnnouncementKind, string> = {
  examen: "bg-clay",
  entrega: "bg-(--brand-2)",
  cambio_aula: "bg-steel",
  general: "bg-ink/40",
};

const KIND_CHIP: Record<AnnouncementKind, string> = {
  examen: "bg-clay/10 text-clay",
  entrega: "bg-(--brand-2)/15 text-(--brand)",
  cambio_aula: "bg-steel/10 text-steel",
  general: "border border-ink/15 text-ink-soft",
};

type AgendaEvent = {
  id: string;
  key: string;
  date: Date;
  kind: AnnouncementKind;
  title: string;
  courseCode: string | null;
  courseSlug: string | null;
};

export default async function PublicAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; mes?: string }>;
}) {
  const { anio, mes } = await searchParams;
  const today = startOfDay(currentDay());

  const rawYear = Number.parseInt(anio ?? "", 10);
  const rawMonth = Number.parseInt(mes ?? "", 10);
  const cursor = {
    year:
      Number.isFinite(rawYear) && rawYear >= 2000 && rawYear <= 2100
        ? rawYear
        : today.getFullYear(),
    month:
      Number.isFinite(rawMonth) && rawMonth >= 1 && rawMonth <= 12
        ? rawMonth
        : today.getMonth() + 1,
  };

  const [settings, profile, publicCourses, rawEvents] = await Promise.all([
    getSiteSettingsMap(),
    getProfessorPublicProfile(),
    db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.status, "publicado"), isNull(courses.deletedAt))),
    db.query.courseAnnouncements.findMany({
      where: and(
        eq(courseAnnouncements.status, "publicado"),
        isNull(courseAnnouncements.deletedAt),
        isNotNull(courseAnnouncements.eventDate),
      ),
      with: { course: { columns: { code: true, slug: true } } },
      orderBy: [asc(courseAnnouncements.eventDate)],
    }),
  ]);

  const publicCourseIds = new Set(publicCourses.map((course) => course.id));

  const events: AgendaEvent[] = rawEvents
    .filter(
      (announcement) =>
        announcement.eventDate &&
        (announcement.courseId === null ||
          publicCourseIds.has(announcement.courseId)),
    )
    .map((announcement) => {
      const date = announcement.eventDate!;
      return {
        id: announcement.id,
        key: toDateKey(date),
        date,
        kind: announcement.kind,
        title: announcement.title,
        courseCode: announcement.course?.code ?? null,
        courseSlug: announcement.course?.slug ?? null,
      };
    });

  const byDate = new Map<string, AgendaEvent[]>();
  for (const event of events) {
    const list = byDate.get(event.key) ?? [];
    list.push(event);
    byDate.set(event.key, list);
  }

  const grid = buildMonthGrid(cursor);
  const prev = addMonths(cursor, -1);
  const next = addMonths(cursor, 1);
  const todayKey = toDateKey(today);

  const upcoming = events.filter((event) => event.date >= today).slice(0, 12);
  const past = events
    .filter((event) => event.date < today)
    .slice(-6)
    .reverse();

  function monthHref({ year, month }: { year: number; month: number }): string {
    return `/agenda?anio=${year}&mes=${month}`;
  }

  return (
    <div className="min-h-screen bg-paper text-ink" style={brandVars(settings)}>
      <PublicNav active="agenda" profile={profile} />

      <main id="contenido" className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <header className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-(--brand)">
            Departamento de Química
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            Agenda académica
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Fechas clave del período: exámenes, entregas de proyectos,
            seminarios y sesiones reprogramadas. Hoy es{" "}
            <strong className="font-medium text-ink">{formatLongDate(today)}</strong>.
          </p>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          {/* Calendario mensual */}
          <section aria-labelledby="cal-h">
            <div className="flex items-center justify-between">
              <h2 id="cal-h" className="font-display text-2xl font-semibold capitalize">
                {MONTH_NAMES[cursor.month - 1]} {cursor.year}
              </h2>
              <div className="flex items-center gap-1.5">
                <Link
                  href={monthHref(prev)}
                  aria-label={`Mes anterior: ${MONTH_NAMES[prev.month - 1]} ${prev.year}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 transition hover:border-(--brand) hover:text-(--brand)"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/agenda"
                  className="rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-medium transition hover:border-(--brand) hover:text-(--brand)"
                >
                  Hoy
                </Link>
                <Link
                  href={monthHref(next)}
                  aria-label={`Mes siguiente: ${MONTH_NAMES[next.month - 1]} ${next.year}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 transition hover:border-(--brand) hover:text-(--brand)"
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10">
              <table className="w-full table-fixed border-collapse">
                <caption className="sr-only">
                  Calendario de {MONTH_NAMES[cursor.month - 1]} de {cursor.year}
                </caption>
                <thead>
                  <tr className="border-b border-ink/10 bg-paper-deep/70">
                    {WEEKDAY_SHORT.map((day, index) => (
                      <th
                        key={day}
                        scope="col"
                        abbr={WEEKDAY_LONG[index]}
                        className="px-1 py-2.5 text-center font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft"
                      >
                        <span aria-hidden="true">{day}</span>
                        <span className="sr-only">{WEEKDAY_LONG[index]}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grid.map((week, weekIndex) => (
                    <tr
                      key={weekIndex}
                      className="border-b border-ink/10 last:border-0"
                    >
                      {week.map((cell, dayIndex) => {
                        if (!cell) {
                          return (
                            <td
                              key={dayIndex}
                              className="border-r border-ink/5 bg-paper-deep/30 p-1 last:border-0"
                            />
                          );
                        }
                        const dayEvents = byDate.get(cell.key) ?? [];
                        const isToday = cell.key === todayKey;
                        return (
                          <td
                            key={dayIndex}
                            className={`h-16 border-r border-ink/5 p-1.5 align-top last:border-0 sm:h-20 ${
                              cell.inMonth ? "" : "bg-paper-deep/30 text-ink-soft/60"
                            } ${isToday ? "bg-(--brand-2)/10" : ""}`}
                          >
                            <div
                              className={`mx-auto flex h-6 w-6 items-center justify-center font-mono text-[11px] ${
                                isToday
                                  ? "rounded-full bg-(--brand) font-bold text-paper"
                                  : ""
                              }`}
                              aria-label={
                                isToday
                                  ? `${cell.date.getDate()}, hoy`
                                  : `${cell.date.getDate()}`
                              }
                            >
                              {cell.date.getDate()}
                            </div>
                            <div className="mt-1 space-y-1">
                              {/* Puntos (siempre) — compañeros accesibles de las etiquetas */}
                              <div className="flex flex-wrap justify-center gap-1 sm:hidden">
                                {dayEvents.slice(0, 4).map((event) => (
                                  <span
                                    key={event.id}
                                    className={`h-1.5 w-1.5 rounded-full ${KIND_DOT[event.kind]}`}
                                    title={`${ANNOUNCEMENT_KIND_LABELS[event.kind]}: ${event.title}`}
                                  />
                                ))}
                              </div>
                              <ul className="hidden space-y-1 sm:block">
                                {dayEvents.slice(0, 2).map((event) => (
                                  <li
                                    key={event.id}
                                    className={`truncate rounded px-1 py-0.5 text-[9.5px] font-medium leading-tight ${KIND_CHIP[event.kind]}`}
                                    title={`${ANNOUNCEMENT_KIND_LABELS[event.kind]}: ${event.title}${event.courseCode ? ` · ${event.courseCode}` : ""}`}
                                  >
                                    {event.courseCode
                                      ? `${event.courseCode} · `
                                      : ""}
                                    {event.title}
                                  </li>
                                ))}
                                {dayEvents.length > 2 ? (
                                  <li className="px-1 text-[9px] text-ink-soft">
                                    +{dayEvents.length - 2} más
                                  </li>
                                ) : null}
                              </ul>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Leyenda */}
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-ink-soft" aria-label="Leyenda">
              {(["examen", "entrega", "cambio_aula", "general"] as const).map(
                (kind) => (
                  <li key={kind} className="inline-flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${KIND_DOT[kind]}`} aria-hidden="true" />
                    {ANNOUNCEMENT_KIND_LABELS[kind]}
                  </li>
                ),
              )}
            </ul>
          </section>

          {/* Próximas fechas */}
          <section aria-labelledby="prox-h">
            <h2 id="prox-h" className="flex items-center gap-2 font-display text-2xl font-semibold">
              <CalendarClock className="h-5 w-5 text-(--brand)" aria-hidden="true" />
              Próximas fechas
            </h2>
            {upcoming.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-dashed border-ink/15 px-5 py-10 text-center text-sm italic text-ink-soft">
                No hay eventos programados próximamente.
              </p>
            ) : (
              <ol className="mt-5 space-y-3">
                {upcoming.map((event) => (
                  <li
                    key={event.id}
                    className="flex items-start gap-4 rounded-2xl border border-ink/10 bg-paper px-5 py-4"
                  >
                    <div className="w-12 shrink-0 text-center">
                      <p className="font-display text-2xl font-semibold leading-none">
                        {event.date.getDate()}
                      </p>
                      <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-ink-soft">
                        {event.date.toLocaleDateString("es", { month: "short" })}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1 border-l border-ink/10 pl-4">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${KIND_CHIP[event.kind]}`}>
                        {ANNOUNCEMENT_KIND_LABELS[event.kind]}
                      </span>
                      <p className="mt-1.5 text-sm font-medium leading-snug">
                        {event.title}
                      </p>
                      {event.courseSlug ? (
                        <Link
                          href={`/cursos/${event.courseSlug}`}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink-soft transition hover:text-(--brand)"
                        >
                          {event.courseCode}
                          <ChevronRight className="h-3 w-3" aria-hidden="true" />
                        </Link>
                      ) : (
                        <p className="mt-1 text-[11px] text-ink-soft">
                          Aviso general
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {past.length > 0 ? (
              <details className="group mt-6 rounded-2xl border border-ink/10">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-sm font-medium text-ink-soft transition hover:text-ink [&::-webkit-details-marker]:hidden">
                  Fechas ya celebradas
                  <ChevronRight
                    className="h-4 w-4 transition-transform group-open:rotate-90"
                    aria-hidden="true"
                  />
                </summary>
                <ol className="divide-y divide-ink/10 border-t border-ink/10 px-5">
                  {past.map((event) => (
                    <li key={event.id} className="flex items-center gap-3 py-3 text-sm">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${KIND_DOT[event.kind]}`} aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate text-ink-soft">
                        {event.title}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-ink-soft/70">
                        {event.key.split("-").reverse().join("/")}
                      </span>
                    </li>
                  ))}
                </ol>
              </details>
            ) : null}
          </section>
        </div>
      </main>

      <PublicFooter profile={profile} />
    </div>
  );
}

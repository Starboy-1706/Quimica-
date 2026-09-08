import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { and, asc, desc, eq, gte, isNotNull, isNull } from "drizzle-orm";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Clock,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  Pin,
} from "lucide-react";
import { db } from "@/db";
import { courseAnnouncements, courses } from "@/db/schema";
import {
  ANNOUNCEMENT_KIND_LABELS,
  COURSE_LEVEL_LABELS,
  currentTimestampMs,
  formatDate,
} from "@/lib/format";
import { startOfDay, currentDay } from "@/lib/calendar";
import { renderRichText } from "@/lib/rich-text";
import {
  getProfessorPublicProfile,
  getSiteSettingsMap,
} from "@/server/queries";
import {
  brandVars,
  PublicFooter,
  PublicNav,
} from "@/components/public/chrome";
import { ContactForm } from "@/components/admin/forms";

export const dynamic = "force-dynamic";

const DEFAULT_LAB_HERO_URL =
  "https://images.pexels.com/photos/5427673/pexels-photo-5427673.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
const DEFAULT_LAB_GLASSWARE_URL =
  "https://images.pexels.com/photos/8927674/pexels-photo-8927674.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettingsMap();
  const title = settings.site_title ?? "Aula Docente";
  return {
    title: { absolute: `${title} — Prof. Wilmer Molina` },
    description:
      settings.site_tagline ??
      "Asignaturas, avisos, agenda de evaluaciones y repositorio de materiales.",
  };
}

function courseHref(slug: string): string {
  return `/cursos/${slug}`;
}

export default async function PublicHomePage() {
  const today = startOfDay(currentDay());

  const [settings, profile, activeCourses, announcements, upcoming] =
    await Promise.all([
      getSiteSettingsMap(),
      getProfessorPublicProfile(),
      db.query.courses.findMany({
        where: and(eq(courses.status, "publicado"), isNull(courses.deletedAt)),
        orderBy: [asc(courses.code)],
        with: {
          materials: {
            where: isNull(courses.deletedAt),
            columns: { id: true },
          },
        },
      }),
      db.query.courseAnnouncements.findMany({
        where: and(
          eq(courseAnnouncements.status, "publicado"),
          isNull(courseAnnouncements.deletedAt),
        ),
        with: { course: true },
        orderBy: [
          desc(courseAnnouncements.pinned),
          desc(courseAnnouncements.publishedAt),
        ],
        limit: 6,
      }),
      db.query.courseAnnouncements.findMany({
        where: and(
          eq(courseAnnouncements.status, "publicado"),
          isNull(courseAnnouncements.deletedAt),
          isNotNull(courseAnnouncements.eventDate),
          gte(courseAnnouncements.eventDate, today),
        ),
        with: { course: { columns: { code: true, slug: true } } },
        orderBy: [asc(courseAnnouncements.eventDate)],
        limit: 4,
      }),
    ]);

  const teacherName = profile?.user.fullName ?? "Prof. Wilmer Molina";
  const departmentName =
    profile?.department ?? settings.institution_name ?? "Departamento de Química";
  const siteTitle = settings.site_title || "La química, explicada con rigor";
  const siteTagline =
    settings.site_tagline ||
    "Asignaturas, prácticas de laboratorio y material de estudio del Prof. Wilmer Molina.";
  const academicTerm = settings.academic_term ?? "2026-I";

  const heroBgWord = settings.hero_bg_word || "Química";
  const heroBadge =
    settings.hero_badge ||
    (academicTerm
      ? `${departmentName} · Período ${academicTerm}`
      : departmentName);
  const heroImageUrl = settings.hero_image_url || DEFAULT_LAB_HERO_URL;
  const aboutImageUrl =
    settings.about_image_url || DEFAULT_LAB_GLASSWARE_URL;

  const sectionCoursesTitle =
    settings.section_courses_title || "Asignaturas activas";
  const sectionCoursesSubtitle =
    settings.section_courses_subtitle ||
    "Guías de prácticas, ejercicios resueltos, presentaciones y programas, organizados por curso y descarga segura.";

  const sectionAgendaTitle =
    settings.section_agenda_title || "Próximas evaluaciones";
  const sectionAgendaSubtitle =
    settings.section_agenda_subtitle ||
    "Exámenes, entregas y sesiones reprogramadas con fecha confirmada. Consulta la agenda completa para todo el período.";

  const sectionAnnouncementsTitle =
    settings.section_announcements_title || "Tablón de avisos";
  const sectionAboutTitle = settings.section_about_title || "El docente";
  const sectionContactTitle =
    settings.section_contact_title || "Consulta directa";
  const sectionContactSubtitle =
    settings.section_contact_subtitle ||
    "¿Dudas con un ejercicio, una práctica de laboratorio o el programa? Escríbeme desde aquí: tu mensaje llega a la bandeja interna del aula y te respondo a tu correo institucional.";

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: teacherName,
    jobTitle: profile?.headline ?? "Docente universitario",
    affiliation: {
      "@type": "CollegeOrUniversity",
      name: departmentName,
    },
    email: profile?.contactEmail ?? undefined,
    url: "/",
  };

  const contactCourseOptions = activeCourses.map((course) => ({
    id: course.id,
    code: course.code,
    title: course.title,
  }));

  return (
    <div className="min-h-screen bg-paper text-ink" style={brandVars(settings)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <PublicNav active="inicio" profile={profile} settings={settings} />

      <main id="contenido">
        {/* ── Portada / Presentación ─────────────────────────────── */}
        <section className="relative overflow-hidden" aria-label="Presentación del docente">
          <div
            className="pointer-events-none absolute inset-x-0 top-6 select-none overflow-hidden"
            aria-hidden="true"
          >
            <p className="text-center font-display text-[22vw] font-black italic leading-none text-(--brand)/[0.05]">
              {heroBgWord}
            </p>
          </div>
          <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:pt-24">
            <div>
              {heroBadge ? (
                <p className="animate-rise font-mono text-[11px] uppercase tracking-[0.3em] text-(--brand)">
                  {heroBadge}
                </p>
              ) : null}
              <h1
                className="animate-rise mt-6 font-display text-5xl font-semibold leading-[1.02] sm:text-7xl"
                style={{ animationDelay: "80ms" }}
              >
                {siteTitle}
                <span className="italic text-(--brand)">.</span>
              </h1>
              <p
                className="animate-rise mt-6 max-w-xl text-lg leading-relaxed text-ink-soft"
                style={{ animationDelay: "160ms" }}
              >
                {siteTagline}
              </p>
              <div
                className="animate-rise mt-8 flex flex-wrap gap-3"
                style={{ animationDelay: "220ms" }}
              >
                <Link
                  href="/asignaturas"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition hover:bg-(--brand)"
                >
                  Ver asignaturas <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/agenda"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold transition hover:border-(--brand) hover:text-(--brand)"
                >
                  <CalendarClock className="h-4 w-4" aria-hidden="true" />
                  Agenda académica
                </Link>
              </div>
              <dl
                className="animate-rise mt-12 flex flex-wrap gap-10 border-t border-ink/15 pt-8"
                style={{ animationDelay: "280ms" }}
              >
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-soft">
                    Asignaturas activas
                  </dt>
                  <dd className="mt-1 font-display text-4xl font-medium">
                    {activeCourses.length}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-soft">
                    Próximos eventos
                  </dt>
                  <dd className="mt-1 font-display text-4xl font-medium">
                    {upcoming.length}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Retrato de laboratorio + tarjeta de atención */}
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-ink/10">
                <Image
                  src={heroImageUrl}
                  alt="Fotografía principal del aula"
                  fill
                  priority
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" aria-hidden="true" />
              </div>
              <div className="relative z-10 mx-4 -mt-14 rounded-2xl border border-ink/10 bg-paper p-5 shadow-[0_18px_50px_-20px_rgba(27,23,16,0.45)] sm:mx-6">
                <p className="font-display text-lg font-semibold">
                  {teacherName}
                </p>
                <p className="mt-0.5 text-xs italic text-ink-soft">
                  {profile?.headline ?? departmentName}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
                  {profile?.office ? (
                    <li className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 shrink-0 text-(--brand)" aria-hidden="true" />
                      <span>
                        <span className="font-medium text-ink">Despacho:</span>{" "}
                        {profile.office}
                      </span>
                    </li>
                  ) : null}
                  {profile?.officeHours ? (
                    <li className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4 shrink-0 text-(--brand)" aria-hidden="true" />
                      <span>
                        <span className="font-medium text-ink">Atención a estudiantes:</span>{" "}
                        {profile.officeHours}
                      </span>
                    </li>
                  ) : null}
                  {profile?.contactEmail ? (
                    <li>
                      <a
                        href={`mailto:${profile.contactEmail}`}
                        className="flex items-center gap-2.5 transition hover:text-(--brand)"
                      >
                        <Mail className="h-4 w-4 shrink-0 text-(--brand)" aria-hidden="true" />
                        {profile.contactEmail}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Accesos directos a asignaturas activas ─────────────── */}
        <section
          className="mx-auto max-w-6xl px-5 pb-24 sm:px-8"
          aria-labelledby="activas"
        >
          <div className="flex items-end justify-between border-b-2 border-ink pb-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.3em] text-(--brand-2)">
                01
              </p>
              <h2 id="activas" className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                {sectionCoursesTitle}
              </h2>
            </div>
            <Link
              href="/asignaturas"
              className="hidden items-center gap-1.5 text-sm text-ink-soft transition hover:text-ink sm:inline-flex"
            >
              Listado completo <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          {sectionCoursesSubtitle ? (
            <p className="mt-2 text-sm text-ink-soft">{sectionCoursesSubtitle}</p>
          ) : null}

          {activeCourses.length === 0 ? (
            <p className="border-b border-ink/15 py-14 text-center font-display text-2xl italic text-ink-soft">
              Las asignaturas del nuevo período se publicarán próximamente.
            </p>
          ) : (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2">
              {activeCourses.map((course) => (
                <li key={course.id}>
                  <Link
                    href={courseHref(course.slug)}
                    className="group flex h-full flex-col rounded-2xl border border-ink/10 bg-paper p-6 transition hover:-translate-y-1 hover:border-(--brand)/50 hover:shadow-[0_24px_50px_-24px_rgba(27,23,16,0.35)]"
                  >
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="rounded-full border border-(--brand)/40 px-3 py-1 font-mono font-medium tracking-wider text-(--brand)">
                        {course.code}
                      </span>
                      <span className="rounded-full bg-ink/5 px-3 py-1 font-medium text-ink-soft">
                        {COURSE_LEVEL_LABELS[course.level]}
                      </span>
                      {course.term ? (
                        <span className="ml-auto font-mono text-ink-soft">
                          {course.term}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-medium leading-tight">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-xs text-ink-soft">
                      {[
                        course.credits ? `${course.credits} créditos` : null,
                        course.room,
                        course.schedule && course.schedule.length > 0
                          ? `${course.schedule.length} sesiones semanales`
                          : null,
                        `${course.materials.length} materiales`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-(--brand)">
                      Entrar al aula
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 text-center sm:hidden">
            <Link href="/asignaturas" className="text-sm font-medium text-(--brand) underline underline-offset-4">
              Ver listado completo de asignaturas
            </Link>
          </p>
        </section>

        {/* ── Agenda próxima ─────────────────────────────────────── */}
        {upcoming.length > 0 ? (
          <section
            className="border-y border-ink/10 bg-paper-deep/60"
            aria-labelledby="proximas"
          >
            <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-[1fr_1.6fr]">
              <div>
                <p className="font-mono text-[11px] tracking-[0.3em] text-(--brand-2)">
                  02
                </p>
                <h2 id="proximas" className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                  {sectionAgendaTitle}
                </h2>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
                  {sectionAgendaSubtitle}
                </p>
                <Link
                  href="/agenda"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold transition hover:border-(--brand) hover:text-(--brand)"
                >
                  Abrir agenda <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <ol className="space-y-3">
                {upcoming.map((event) => {
                  const date = event.eventDate!;
                  return (
                    <li
                      key={event.id}
                      className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-paper px-5 py-4"
                    >
                      <div className="w-14 shrink-0 text-center">
                        <p className="font-display text-3xl font-semibold leading-none">
                          {date.getDate()}
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                          {date.toLocaleDateString("es", { month: "short" })}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1 border-l border-ink/10 pl-4">
                        <p className="truncate font-medium">{event.title}</p>
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {ANNOUNCEMENT_KIND_LABELS[event.kind]}
                          {event.course ? ` · ${event.course.code}` : " · General"}
                        </p>
                      </div>
                      {event.course ? (
                        <Link
                          href={courseHref(event.course.slug)}
                          className="shrink-0 rounded-full border border-ink/15 px-3 py-1.5 text-[11px] font-medium text-ink-soft transition hover:border-(--brand) hover:text-(--brand)"
                        >
                          Ver curso
                        </Link>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        ) : null}

        {/* ── Tablón de avisos ───────────────────────────────────── */}
        <section id="avisos" className="bg-ink text-paper" aria-labelledby="avisos-h">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <div className="flex items-end justify-between border-b border-paper/25 pb-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.3em] text-(--brand-2)">
                  03
                </p>
                <h2 id="avisos-h" className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                  {sectionAnnouncementsTitle}
                </h2>
              </div>
              <Megaphone className="hidden h-6 w-6 text-paper/40 sm:block" aria-hidden="true" />
            </div>

            {announcements.length === 0 ? (
              <p className="py-14 text-center font-display text-2xl italic text-paper/50">
                Sin avisos por el momento.
              </p>
            ) : (
              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {announcements.map((announcement) => (
                  <article
                    key={announcement.id}
                    className="rounded-2xl border border-paper/15 bg-white/[0.03] p-6 transition hover:border-(--brand-2)/60"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      {announcement.pinned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-(--brand-2)/15 px-2.5 py-1 font-medium text-(--brand-2)">
                          <Pin className="h-3 w-3" aria-hidden="true" /> Fijado
                        </span>
                      ) : null}
                      <span
                        className={`rounded-full px-2.5 py-1 font-medium ${
                          announcement.kind === "examen"
                            ? "bg-clay/15 text-clay"
                            : announcement.kind === "cambio_aula"
                              ? "bg-steel/15 text-steel"
                              : announcement.kind === "entrega"
                                ? "bg-(--brand-2)/15 text-(--brand-2)"
                                : "border border-paper/20 text-paper/70"
                        }`}
                      >
                        {ANNOUNCEMENT_KIND_LABELS[announcement.kind]}
                      </span>
                      <span className="rounded-full border border-paper/20 px-2.5 py-1 font-mono tracking-wide text-paper/70">
                        {announcement.course?.code ?? "General"}
                      </span>
                      <time
                        className="ml-auto text-paper/50"
                        dateTime={(announcement.eventDate ?? announcement.publishedAt ?? announcement.createdAt).toISOString()}
                      >
                        {formatDate(announcement.eventDate ?? announcement.publishedAt)}
                      </time>
                    </div>
                    <h3 className="mt-4 font-display text-xl font-medium leading-snug">
                      {announcement.title}
                    </h3>
                    <div
                      className="rich mt-2 text-sm leading-relaxed text-paper/65"
                      dangerouslySetInnerHTML={{
                        __html: renderRichText(announcement.body),
                      }}
                    />
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── El docente ─────────────────────────────────────────── */}
        {profile ? (
          <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8" aria-labelledby="docente-h">
            <div className="grid gap-10 border-b-2 border-ink pb-4 md:grid-cols-[1fr_2fr]">
              <div>
                <p className="font-mono text-[11px] tracking-[0.3em] text-(--brand-2)">
                  04
                </p>
                <h2 id="docente-h" className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                  {sectionAboutTitle}
                </h2>
                <div className="relative mt-6 hidden aspect-[4/3] overflow-hidden rounded-2xl border border-ink/10 md:block">
                  <Image
                    src={aboutImageUrl}
                    alt="Fotografía de la sección docente"
                    fill
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <p className="font-display text-2xl font-medium italic">
                  {profile.headline}
                </p>
                {departmentName ? (
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-(--brand)">
                    {departmentName}
                  </p>
                ) : null}
                {profile.bio ? (
                  <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
                    {profile.bio}
                  </p>
                ) : null}
                <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-soft">
                  {profile.officeHours ? (
                    <li className="inline-flex items-center gap-2">
                      <Clock className="h-4 w-4 text-(--brand)" aria-hidden="true" />
                      {profile.officeHours}
                    </li>
                  ) : null}
                  {profile.office ? (
                    <li className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-(--brand)" aria-hidden="true" />
                      {profile.office}
                    </li>
                  ) : null}
                  {profile.contactEmail ? (
                    <li>
                      <a
                        href={`mailto:${profile.contactEmail}`}
                        className="inline-flex items-center gap-2 transition hover:text-(--brand)"
                      >
                        <Mail className="h-4 w-4 text-(--brand)" aria-hidden="true" />
                        {profile.contactEmail}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        {/* ── Consulta directa ───────────────────────────────────── */}
        <section
          id="consultas"
          className="mx-auto max-w-6xl px-5 pb-24 sm:px-8"
          aria-labelledby="consultas-h"
        >
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="font-mono text-[11px] tracking-[0.3em] text-(--brand-2)">
                05
              </p>
              <h2 id="consultas-h" className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                {sectionContactTitle}
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
                {sectionContactSubtitle}
              </p>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-ink/15 px-3.5 py-1.5 text-[11px] text-ink-soft">
                <Lock className="h-3 w-3 text-(--brand)" aria-hidden="true" />
                Protegido con antispam, sin captchas que estorben.
              </p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-paper-deep/50 p-6 sm:p-8">
              <ContactForm
                courses={contactCourseOptions}
                issuedAt={currentTimestampMs()}
              />
            </div>
          </div>
        </section>
      </main>

      <PublicFooter profile={profile} settings={settings} />
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { and, asc, desc, eq, gte, isNotNull, isNull } from "drizzle-orm";
import {
  ArrowRight,
  ArrowUpRight,
  Atom,
  Beaker,
  CalendarClock,
  Clock,
  FlaskConical,
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
import { SimulationsSection } from "@/components/public/simulations";

export const dynamic = "force-dynamic";

/** Solo se renderizan imágenes importadas desde el panel administrativo. */
function managedImageUrl(value: string | undefined): string | null {
  return value?.startsWith("/imagenes/") ? value : null;
}

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
  const heroImageUrl = managedImageUrl(settings.hero_image_url);
  const aboutImageUrl = managedImageUrl(settings.about_image_url);
  const avatarUrl = managedImageUrl(profile?.avatarUrl ?? undefined);

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
  const sectionSimulationsTitle =
    settings.section_simulations_title || "Simulaciones de compuestos";
  const sectionSimulationsSubtitle =
    settings.section_simulations_subtitle ||
    "Explora en 3D las moléculas clave del laboratorio: geometría, enlaces y colores CPK, directamente en esta página.";
  const simGoogleSitesUrl = settings.sim_google_sites_url?.trim() ?? "";
  const simGoogleSitesTitle =
    settings.sim_google_sites_title || "Simulaciones externas (Google Sites)";

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
          <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:pt-24">
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
                    Materiales del período
                  </dt>
                  <dd className="mt-1 font-display text-4xl font-medium">
                    {activeCourses.reduce((acc, course) => acc + course.materials.length, 0)}
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
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-ink/10 ring-1 ring-(--brand)/25 ring-inset">
                {heroImageUrl ? (
                  <>
                    <Image
                      src={heroImageUrl}
                      alt="Fotografía principal del aula importada por el docente"
                      fill
                      priority
                      unoptimized
                      sizes="(min-width: 1024px) 42vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-(--brand)/15 mix-blend-multiply" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" aria-hidden="true" />
                    <p className="absolute bottom-3 right-4 font-mono text-[9px] uppercase tracking-[0.22em] text-paper/80">
                      Aula docente · {departmentName}
                    </p>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_28%_24%,color-mix(in_srgb,var(--brand)_24%,transparent),transparent_28%),linear-gradient(145deg,#ece3cd,#f8f3e8)]">
                    <Atom className="absolute left-[12%] top-[14%] h-16 w-16 text-(--brand)/20" strokeWidth={1} aria-hidden="true" />
                    <Beaker className="absolute bottom-[15%] right-[12%] h-20 w-20 text-(--brand-2)/25" strokeWidth={1} aria-hidden="true" />
                    <div className="flex h-32 w-32 items-center justify-center rounded-full border border-(--brand)/20 bg-paper/60 shadow-sm backdrop-blur">
                      <FlaskConical className="h-16 w-16 text-(--brand)" strokeWidth={1.25} aria-hidden="true" />
                    </div>
                    <p className="absolute bottom-5 inset-x-5 text-center font-mono text-[9px] uppercase tracking-[0.24em] text-ink-soft">
                      Imagen pendiente · impórtala desde el panel
                    </p>
                  </div>
                )}
              </div>
              <div className="relative z-10 mx-4 -mt-14 rounded-2xl border border-ink/10 bg-paper p-5 shadow-[0_18px_50px_-20px_rgba(27,23,16,0.45)] sm:mx-6">
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-paper ring-1 ring-(--brand)/30">
                      <Image
                        src={avatarUrl}
                        alt={`Fotografía de ${teacherName}`}
                        fill
                        unoptimized
                        sizes="48px"
                        className="object-cover"
                      />
                    </span>
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--brand)/10 text-(--brand)">
                      <FlaskConical className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                  <div>
                    <p className="font-display text-lg font-semibold">
                      {teacherName}
                    </p>
                    <p className="mt-0.5 text-xs italic text-ink-soft">
                      {profile?.headline ?? departmentName}
                    </p>
                  </div>
                </div>
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

        {/* ── Índice de secciones (correlación de contenidos) ───── */}
        <nav
          aria-label="Índice de la portada"
          className="border-b border-ink/10 bg-paper-deep/40"
        >
          <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 sm:px-8" role="list">
            {[
              ["01", "Asignaturas", "#activas"],
              ["02", "Agenda", "#proximas"],
              ["03", "Simulaciones", "#simulaciones"],
              ["04", "Avisos", "#avisos"],
              ["05", "Docente", "#docente-h"],
              ["06", "Consulta", "#consultas"],
            ].map(([num, label, href]) => (
              <li key={href} className="shrink-0">
                <a
                  href={href}
                  className="group flex items-center gap-2.5 px-4 py-4 transition hover:bg-paper-deep/70"
                >
                  <span className="font-mono text-[11px] font-medium tracking-widest text-(--brand-2)">
                    {num}
                  </span>
                  <span className="text-xs font-medium text-ink-soft transition group-hover:text-ink">
                    {label}
                  </span>
                  <span className="h-px w-6 bg-transparent transition group-hover:bg-(--brand)" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

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
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 py-16 sm:px-8 md:grid-cols-[1fr_1.6fr]">
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
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            event.kind === "examen"
                              ? "bg-clay/10 text-clay"
                              : event.kind === "cambio_aula"
                                ? "bg-steel/10 text-steel"
                                : event.kind === "entrega"
                                  ? "bg-(--brand-2)/15 text-(--brand)"
                                  : "border border-ink/15 text-ink-soft"
                          }`}
                        >
                          {ANNOUNCEMENT_KIND_LABELS[event.kind]}
                        </span>
                        <p className="mt-1.5 truncate font-medium">{event.title}</p>
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {event.course ? event.course.code : "Aviso general"}
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

        {/* ── Simulaciones de compuestos (3D nativo + Google Sites) ── */}
        <section
          id="simulaciones"
          className="border-y border-ink/10 bg-night text-cream"
          aria-labelledby="simulaciones-h"
        >
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <div className="flex items-end justify-between border-b border-paper/25 pb-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.3em] text-(--brand-2)">
                  03
                </p>
                <h2 id="simulaciones-h" className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                  {sectionSimulationsTitle}
                </h2>
              </div>
              <Atom className="hidden h-6 w-6 text-paper/40 sm:block" aria-hidden="true" />
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-paper/65">
              {sectionSimulationsSubtitle}
            </p>
            <div className="mt-8">
              <SimulationsSection
                embedUrl={simGoogleSitesUrl.startsWith("https://") ? simGoogleSitesUrl : ""}
                embedTitle={simGoogleSitesTitle}
              />
            </div>
          </div>
        </section>

        {/* ── Tablón de avisos ───────────────────────────────────── */}
        <section id="avisos" className="bg-ink text-paper" aria-labelledby="avisos-h">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <div className="flex items-end justify-between border-b border-paper/25 pb-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.3em] text-(--brand-2)">
                  04
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
                      {announcement.course ? (
                        <Link
                          href={courseHref(announcement.course.slug)}
                          className="transition hover:text-(--brand-2)"
                        >
                          {announcement.title}
                        </Link>
                      ) : (
                        announcement.title
                      )}
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
            <div className="grid grid-cols-1 gap-10 border-b-2 border-ink pb-4 md:grid-cols-[1fr_2fr]">
              <div>
                <p className="font-mono text-[11px] tracking-[0.3em] text-(--brand-2)">
                  05
                </p>
                <h2 id="docente-h" className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                  {sectionAboutTitle}
                </h2>
                <div className="relative mt-6 hidden aspect-[4/3] overflow-hidden rounded-2xl border border-ink/10 bg-paper-deep/50 md:block">
                  {aboutImageUrl ? (
                    <Image
                      src={aboutImageUrl}
                      alt="Fotografía de la actividad docente importada desde el panel"
                      fill
                      unoptimized
                      sizes="(min-width: 768px) 30vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_center,color-mix(in_srgb,var(--brand)_18%,transparent)_1px,transparent_1px)] [background-size:18px_18px]" />
                      <Beaker className="relative h-16 w-16 text-(--brand)/50" strokeWidth={1.2} aria-hidden="true" />
                    </div>
                  )}
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
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_1.4fr]">
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

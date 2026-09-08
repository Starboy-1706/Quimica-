import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  FlaskConical,
  Link2,
  Lock,
  MapPin,
  Megaphone,
  Pin,
  ScrollText,
  BookMarked,
  GraduationCap,
  Presentation,
  PencilRuler,
} from "lucide-react";
import { db } from "@/db";
import {
  courseAnnouncements,
  courseMaterials,
  courses,
  type MaterialType,
} from "@/db/schema";
import {
  ANNOUNCEMENT_KIND_LABELS,
  COURSE_LEVEL_LABELS,
  formatDate,
  MATERIAL_TYPE_LABELS,
} from "@/lib/format";
import { renderRichText, richTextToPlain } from "@/lib/rich-text";
import { formatBytes } from "@/lib/upload-rules";
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

type Params = { params: Promise<{ slug: string }> };

async function getPublicCourse(slug: string) {
  return db.query.courses.findFirst({
    where: and(
      eq(courses.slug, slug),
      eq(courses.status, "publicado"),
      isNull(courses.deletedAt),
    ),
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublicCourse(slug);
  if (!course) return { title: "Asignatura no disponible" };

  const plain = course.description
    ? richTextToPlain(course.description).slice(0, 158)
    : `${COURSE_LEVEL_LABELS[course.level]} · ${course.term ?? ""} · ${course.title}`;
  return {
    title: { absolute: `${course.code} · ${course.title}` },
    description: plain,
    openGraph: { type: "article", title: `${course.code} — ${course.title}`, description: plain },
  };
}

const CATEGORY_ORDER: MaterialType[] = [
  "syllabus",
  "presentacion",
  "laboratorio",
  "guia",
  "ejercicios",
  "apunte",
  "enlace",
];

const CATEGORY_ICONS = {
  apunte: FileText,
  guia: BookMarked,
  laboratorio: FlaskConical,
  presentacion: Presentation,
  ejercicios: PencilRuler,
  syllabus: ScrollText,
  enlace: Link2,
} as const;

export default async function PublicCoursePage({ params }: Params) {
  const { slug } = await params;
  const course = await getPublicCourse(slug);
  if (!course) notFound();

  const [settings, profile, materials, announcements] = await Promise.all([
    getSiteSettingsMap(),
    getProfessorPublicProfile(),
    db.query.courseMaterials.findMany({
      where: and(
        eq(courseMaterials.courseId, course.id),
        eq(courseMaterials.status, "publicado"),
        isNull(courseMaterials.deletedAt),
      ),
      orderBy: [
        asc(courseMaterials.sortOrder),
        asc(courseMaterials.unit),
        asc(courseMaterials.title),
      ],
    }),
    db.query.courseAnnouncements.findMany({
      where: and(
        eq(courseAnnouncements.courseId, course.id),
        eq(courseAnnouncements.status, "publicado"),
        isNull(courseAnnouncements.deletedAt),
      ),
      orderBy: [
        desc(courseAnnouncements.pinned),
        desc(courseAnnouncements.publishedAt),
      ],
      limit: 6,
    }),
  ]);

  const syllabus = materials.find((material) => material.type === "syllabus");
  const grouped = CATEGORY_ORDER.map((type) => ({
    type,
    items: materials.filter((material) => material.type === type),
  })).filter((group) => group.items.length > 0);

  const scheduleSummary = (course.schedule ?? [])
    .map((session) =>
      [session.day, `${session.start}–${session.end}`, session.room]
        .filter(Boolean)
        .join(" "),
    )
    .join("; ");

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    courseCode: course.code,
    description: course.description
      ? richTextToPlain(course.description)
      : undefined,
    provider: {
      "@type": "CollegeOrUniversity",
      name: profile?.department ?? "Departamento de Química",
    },
    instructor: {
      "@type": "Person",
      name: profile?.user.fullName ?? "Wilmer Molina",
      jobTitle: profile?.headline ?? undefined,
      affiliation: {
        "@type": "CollegeOrUniversity",
        name: profile?.department ?? "Departamento de Química",
      },
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "onsite",
      location: course.room ?? undefined,
      courseWorkload: scheduleSummary || undefined,
    },
  };

  return (
    <div className="min-h-screen bg-paper text-ink" style={brandVars(settings)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <PublicNav active="asignaturas" profile={profile} />

      <main id="contenido" className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        {/* Migas de pan */}
        <nav aria-label="Migas de pan" className="text-sm text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition hover:text-ink">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <Link href="/asignaturas" className="transition hover:text-ink">
                Asignaturas
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li aria-current="page" className="font-mono text-xs font-medium text-ink">
              {course.code}
            </li>
          </ol>
        </nav>

        {/* Cabecera del curso */}
        <header className="mt-8 border-b-2 border-ink pb-8">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full border border-(--brand)/40 px-3 py-1 font-mono font-medium tracking-wider text-(--brand)">
              {course.code}
            </span>
            <span className="rounded-full bg-ink/5 px-3 py-1 font-medium text-ink-soft">
              {COURSE_LEVEL_LABELS[course.level]}
            </span>
            {course.term ? (
              <span className="rounded-full border border-ink/15 px-3 py-1 font-mono text-ink-soft">
                Semestre {course.term}
              </span>
            ) : null}
            {course.credits ? (
              <span className="rounded-full border border-ink/15 px-3 py-1 text-ink-soft">
                {course.credits} créditos
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-6xl">
            {course.title}
          </h1>
          {course.room ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-ink-soft">
              <MapPin className="h-4 w-4 text-(--brand)" aria-hidden="true" />
              Aula principal: <span className="font-medium text-ink">{course.room}</span>
            </p>
          ) : null}
        </header>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.7fr_1fr]">
          {/* Columna principal */}
          <div>
            {/* Información general */}
            {course.description ? (
              <section aria-labelledby="info-g">
                <h2 id="info-g" className="font-display text-2xl font-semibold">
                  Información general
                </h2>
                <div
                  className="rich mt-4 max-w-2xl text-[15px] text-ink-soft"
                  dangerouslySetInnerHTML={{
                    __html: renderRichText(course.description),
                  }}
                />
              </section>
            ) : null}

            {/* Avisos recientes del curso */}
            <section aria-labelledby="avisos-c" className="mt-12">
              <div className="flex items-center justify-between border-b border-ink/15 pb-3">
                <h2 id="avisos-c" className="flex items-center gap-2.5 font-display text-2xl font-semibold">
                  <Megaphone className="h-5 w-5 text-(--brand)" aria-hidden="true" />
                  Avisos de la asignatura
                </h2>
                <Link
                  href={`/agenda?curso=${encodeURIComponent(course.code)}`}
                  className="inline-flex items-center gap-1 text-xs text-ink-soft transition hover:text-(--brand)"
                  title="Ver la agenda filtrada por esta asignatura"
                >
                  Ver agenda del curso <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
              {announcements.length === 0 ? (
                <p className="py-6 text-sm italic text-ink-soft">
                  No hay avisos publicados para esta asignatura.
                </p>
              ) : (
                <ol className="divide-y divide-ink/10">
                  {announcements.map((announcement) => (
                    <li key={announcement.id} className="py-5">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        {announcement.pinned ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-(--brand-2)/15 px-2.5 py-1 font-medium text-(--brand)">
                            <Pin className="h-3 w-3" aria-hidden="true" /> Fijado
                          </span>
                        ) : null}
                        <span
                          className={`rounded-full px-2.5 py-1 font-medium ${
                            announcement.kind === "examen"
                              ? "bg-clay/10 text-clay"
                              : announcement.kind === "cambio_aula"
                                ? "bg-steel/10 text-steel"
                                : announcement.kind === "entrega"
                                  ? "bg-(--brand-2)/15 text-(--brand)"
                                  : "border border-ink/15 text-ink-soft"
                          }`}
                        >
                          {ANNOUNCEMENT_KIND_LABELS[announcement.kind]}
                        </span>
                        <time
                          className="ml-auto text-ink-soft"
                          dateTime={(announcement.eventDate ?? announcement.publishedAt ?? announcement.createdAt).toISOString()}
                        >
                          {formatDate(announcement.eventDate ?? announcement.publishedAt)}
                        </time>
                      </div>
                      <h3 className="mt-2.5 font-display text-lg font-medium leading-snug">
                        {announcement.title}
                      </h3>
                      <div
                        className="rich mt-1.5 text-sm text-ink-soft"
                        dangerouslySetInnerHTML={{
                          __html: renderRichText(announcement.body),
                        }}
                      />
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {/* Repositorio descargable */}
            <section aria-labelledby="repo-c" className="mt-12">
              <div className="flex items-center justify-between border-b border-ink/15 pb-3">
                <h2 id="repo-c" className="flex items-center gap-2.5 font-display text-2xl font-semibold">
                  <Download className="h-5 w-5 text-(--brand)" aria-hidden="true" />
                  Repositorio descargable
                </h2>
                <span className="text-xs text-ink-soft">
                  {materials.length}{" "}
                  {materials.length === 1 ? "documento" : "documentos"}
                </span>
              </div>

              {grouped.length === 0 ? (
                <p className="py-6 text-sm italic text-ink-soft">
                  El profesor aún no ha publicado materiales para esta
                  asignatura. Vuelve pronto.
                </p>
              ) : (
                <div className="space-y-8 pt-2">
                  {grouped.map((group) => {
                    const Icon = CATEGORY_ICONS[group.type];
                    return (
                      <section key={group.type} aria-labelledby={`cat-${group.type}`}>
                        <h3
                          id={`cat-${group.type}`}
                          className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-(--brand)"
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          {MATERIAL_TYPE_LABELS[group.type]}
                          <span className="text-ink-soft">({group.items.length})</span>
                        </h3>
                        <ul className="mt-3 divide-y divide-ink/10 rounded-xl border border-ink/10">
                          {group.items.map((material) => (
                            <li key={material.id}>
                              <a
                                href={material.url}
                                target="_blank"
                                rel="noreferrer"
                                className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-paper-deep/60"
                              >
                                <Download
                                  className="h-4 w-4 shrink-0 text-ink-soft transition group-hover:text-(--brand)"
                                  aria-hidden="true"
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-medium">
                                    {material.title}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                                    {material.unit ? (
                                      <span>{material.unit}</span>
                                    ) : null}
                                    {material.fileSize ? (
                                      <span>· {formatBytes(material.fileSize)}</span>
                                    ) : null}
                                    {material.fileKey ? (
                                      <Lock className="h-2.5 w-2.5" aria-label="Entrega protegida" />
                                    ) : null}
                                  </span>
                                </span>
                                <ArrowUpRight
                                  className="h-3.5 w-3.5 shrink-0 text-ink-soft transition group-hover:text-(--brand)"
                                  aria-hidden="true"
                                />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </section>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Barra lateral */}
          <div className="space-y-6">
            {/* Syllabus destacado */}
            {syllabus ? (
              <aside
                aria-labelledby="syllabus-c"
                className="rounded-2xl border-2 border-(--brand) bg-paper p-6"
              >
                <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-(--brand)">
                  <ScrollText className="h-3.5 w-3.5" aria-hidden="true" />
                  Programa oficial
                </p>
                <h2 id="syllabus-c" className="mt-3 font-display text-xl font-semibold leading-snug">
                  {syllabus.title}
                </h2>
                <a
                  href={syllabus.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper transition hover:bg-(--brand)"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Descargar syllabus
                  {syllabus.fileSize ? (
                    <span className="font-normal opacity-70">
                      ({formatBytes(syllabus.fileSize)})
                    </span>
                  ) : null}
                </a>
              </aside>
            ) : null}

            {/* Horario semanal */}
            <aside
              aria-labelledby="horario-c"
              className="rounded-2xl border border-ink/10 bg-paper-deep/50 p-6"
            >
              <h2 id="horario-c" className="flex items-center gap-2 font-display text-lg font-semibold">
                <Clock3 className="h-4 w-4 text-(--brand)" aria-hidden="true" />
                Horario semanal
              </h2>
              {course.schedule && course.schedule.length > 0 ? (
                <ul className="mt-4 space-y-2.5">
                  {course.schedule.map((session, index) => (
                    <li
                      key={index}
                      className="rounded-xl border border-ink/10 bg-paper px-3.5 py-2.5 text-sm"
                    >
                      <p className="font-medium">{session.day}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        {session.start} – {session.end}
                        {session.room ? ` · ${session.room}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm italic text-ink-soft">
                  Horario por confirmar.
                </p>
              )}
            </aside>

            {/* Agenda del curso */}
            <Link
              href={`/agenda?curso=${encodeURIComponent(course.code)}`}
              className="group flex items-center justify-between rounded-2xl border border-ink/10 px-6 py-4 transition hover:border-(--brand)/50 hover:bg-paper-deep/50"
            >
              <span className="flex items-center gap-2.5 text-sm font-medium">
                <CalendarClock className="h-4 w-4 text-(--brand)" aria-hidden="true" />
                Agenda de esta asignatura
              </span>
              <ArrowUpRight className="h-4 w-4 text-ink-soft transition group-hover:text-(--brand)" aria-hidden="true" />
            </Link>

            {/* Ficha rápida */}
            <aside
              aria-labelledby="ficha-c"
              className="rounded-2xl border border-ink/10 p-6"
            >
              <h2 id="ficha-c" className="flex items-center gap-2 font-display text-lg font-semibold">
                <GraduationCap className="h-4 w-4 text-(--brand)" aria-hidden="true" />
                Ficha del curso
              </h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                {[
                  ["Código", course.code],
                  ["Nivel", COURSE_LEVEL_LABELS[course.level]],
                  ["Semestre", course.term],
                  ["Créditos", course.credits ? String(course.credits) : null],
                  ["Aula", course.room],
                ]
                  .filter(([, value]) => Boolean(value))
                  .map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <dt className="text-ink-soft">{label}</dt>
                      <dd className="text-right font-medium">{value}</dd>
                    </div>
                  ))}
              </dl>
            </aside>

            <div className="rounded-2xl border border-ink/10 bg-paper-deep/40 p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-(--brand-2)">
                Continuar explorando
              </p>
              <div className="mt-3 flex flex-col gap-2.5">
                <Link
                  href="/asignaturas"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-ink transition hover:text-(--brand)"
                >
                  <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" aria-hidden="true" />
                  Listado completo de asignaturas
                </Link>
                <Link
                  href="/#consultas"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-ink transition hover:text-(--brand)"
                >
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  Enviar una consulta al docente
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter profile={profile} />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq, isNull } from "drizzle-orm";
import { ChevronRight, GraduationCap } from "lucide-react";
import { db } from "@/db";
import { courses, type CourseLevel } from "@/db/schema";
import { COURSE_LEVEL_LABELS } from "@/lib/format";
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
  title: "Asignaturas",
  description:
    "Listado de asignaturas agrupadas por nivel y semestre, con acceso a cada aula, programa, horarios y repositorio descargable.",
};

const LEVEL_ORDER: CourseLevel[] = ["grado", "master", "doctorado"];

const LEVEL_DESCRIPTIONS: Record<CourseLevel, string> = {
  grado: "Cursos de pregrado del plan de estudios.",
  master: "Seminarios y cursos de profundización del programa de máster.",
  doctorado: "Seminarios avanzados y trabajos de investigación doctoral.",
};

export default async function PublicCoursesPage() {
  const [settings, profile, activeCourses] = await Promise.all([
    getSiteSettingsMap(),
    getProfessorPublicProfile(),
    db.query.courses.findMany({
      where: and(eq(courses.status, "publicado"), isNull(courses.deletedAt)),
      orderBy: [asc(courses.term), asc(courses.code)],
      with: {
        materials: {
          where: isNull(courses.deletedAt),
          columns: { id: true },
        },
      },
    }),
  ]);

  const institutionName =
    profile?.department ?? settings.institution_name ?? "Departamento de Química";
  const academicTerm = settings.academic_term ?? "";

  // Agrupación: nivel → semestre → cursos
  const grouped = LEVEL_ORDER.map((level) => {
    const ofLevel = activeCourses.filter((course) => course.level === level);
    const terms = [...new Set(ofLevel.map((course) => course.term ?? "—"))].sort();
    return {
      level,
      terms: terms.map((term) => ({
        term,
        courses: ofLevel.filter((course) => (course.term ?? "—") === term),
      })),
    };
  }).filter((group) => group.terms.length > 0);

  return (
    <div className="min-h-screen bg-paper text-ink" style={brandVars(settings)}>
      <PublicNav active="asignaturas" profile={profile} settings={settings} />

      <main id="contenido" className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <header className="relative max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-(--brand)">
            {institutionName}
            {academicTerm ? ` · Período ${academicTerm}` : ""}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-6xl">
            Asignaturas
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Materias activas del período, agrupadas por nivel y semestre.
            Entra a cada aula para consultar el programa, los horarios, los
            avisos y el repositorio descargable.
          </p>
          <p className="pointer-events-none absolute -top-4 right-0 hidden select-none font-display text-[7rem] font-black italic leading-none text-(--brand)/[0.05] lg:block" aria-hidden="true">
            Cursos
          </p>
        </header>

        {grouped.length === 0 ? (
          <p className="mt-16 text-center font-display text-2xl italic text-ink-soft">
            No hay asignaturas publicadas en este momento.
          </p>
        ) : (
          grouped.map((group, groupIndex) => (
            <section
              key={group.level}
              aria-labelledby={`nivel-${group.level}`}
              className="mt-14"
            >
              <div className="flex items-end justify-between border-b-2 border-ink pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] tracking-[0.3em] text-(--brand-2)">
                    {String(groupIndex + 1).padStart(2, "0")}
                  </span>
                  <GraduationCap
                    className="h-5 w-5 text-(--brand)"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <h2
                    id={`nivel-${group.level}`}
                    className="font-display text-2xl font-semibold sm:text-3xl"
                  >
                    {COURSE_LEVEL_LABELS[group.level]}
                  </h2>
                </div>
                <p className="hidden max-w-xs text-right text-xs text-ink-soft sm:block">
                  {LEVEL_DESCRIPTIONS[group.level]}
                </p>
              </div>

              {group.terms.map(({ term, courses: termCourses }) => (
                <div key={`${group.level}-${term}`} className="mt-6">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.28em] text-(--brand-2)">
                    Semestre {term}
                  </h3>
                  <ul className="mt-3 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-paper">
                    {termCourses.map((course) => (
                      <li key={course.id}>
                        <Link
                          href={`/cursos/${course.slug}`}
                          className="group flex items-center gap-4 px-5 py-4 transition hover:translate-x-1 hover:bg-paper-deep/60 sm:gap-6 sm:px-6 sm:py-5"
                        >
                          <span className="hidden shrink-0 rounded-full border border-(--brand)/40 px-3 py-1 font-mono text-[11px] font-medium tracking-wider text-(--brand) sm:inline">
                            {course.code}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-display text-lg font-medium sm:text-xl">
                              {course.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-ink-soft">
                              {[
                                course.credits
                                  ? `${course.credits} créditos`
                                  : null,
                                course.room,
                                course.schedule && course.schedule.length > 0
                                  ? `${course.schedule.length} sesiones / semana`
                                  : null,
                                `${course.materials.length} ${
                                  course.materials.length === 1
                                    ? "material"
                                    : "materiales"
                                }`,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </span>
                          <ChevronRight
                            className="h-4 w-4 shrink-0 text-ink-soft transition-transform group-hover:translate-x-1 group-hover:text-(--brand)"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))
        )}
      </main>

      <PublicFooter profile={profile} settings={settings} />
    </div>
  );
}

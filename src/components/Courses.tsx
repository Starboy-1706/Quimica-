import { motion } from "framer-motion";
import { ArrowUpRight, Award, BookOpen, Clock3, DoorOpen, Layers } from "lucide-react";
import type { Course, Level } from "../data/content";
import { useStore } from "../context/StoreContext";
import SectionHeader from "./SectionHeader";

const ease = [0.22, 1, 0.36, 1] as const;

const accentMap = {
  cyan: {
    text: "text-cyan-300", bg: "bg-cyan-400/10", border: "border-cyan-400/20",
    glow: "group-hover:shadow-[0_0_60px_-14px_rgba(34,211,238,0.45)]", dot: "bg-cyan-400",
  },
  violet: {
    text: "text-violet-300", bg: "bg-violet-400/10", border: "border-violet-400/20",
    glow: "group-hover:shadow-[0_0_60px_-14px_rgba(139,92,246,0.5)]", dot: "bg-violet-400",
  },
  emerald: {
    text: "text-emerald-300", bg: "bg-emerald-400/10", border: "border-emerald-400/20",
    glow: "group-hover:shadow-[0_0_60px_-14px_rgba(52,211,153,0.45)]", dot: "bg-emerald-400",
  },
  amber: {
    text: "text-amber-300", bg: "bg-amber-400/10", border: "border-amber-400/20",
    glow: "group-hover:shadow-[0_0_60px_-14px_rgba(251,191,36,0.4)]", dot: "bg-amber-400",
  },
} as const;

function CourseCard({ course, index }: { course: Course; index: number }) {
  const a = accentMap[course.accent];
  return (
    <motion.article
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, ease, delay: index * 0.09 }}
      whileHover={{ y: -8 }}
      className={`group glass glass-edge relative flex flex-col rounded-3xl p-7 transition-shadow duration-500 ${a.glow}`}
    >
      {/* halo interior */}
      <div className={`pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100 ${a.bg}`} />

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`grid h-11 w-11 place-items-center rounded-xl border font-mono text-sm font-medium ${a.bg} ${a.border} ${a.text}`}>
            {course.code.slice(4)}
          </span>
          <div>
            <p className="font-mono text-[11px] tracking-[0.2em] text-slate-500">{course.code}</p>
            <span className={`glass-chip mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${a.text}`}>
              {course.level}
            </span>
          </div>
        </div>
        <span className="font-mono text-xs text-slate-500">{course.semester}</span>
      </div>

      <h3 className="font-display text-[22px] font-semibold tracking-tight text-white">
        {course.title}
      </h3>
      <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-slate-400">
        {course.description}
      </p>

      {/* fórmula */}
      <div className="glass-soft mt-5 rounded-xl px-4 py-2.5">
        <code className={`font-mono text-[13px] ${a.text}`}>{course.formula}</code>
      </div>

      <div className="mt-5 space-y-2 border-t border-white/[0.06] pt-5 text-[12.5px] text-slate-400">
        <p className="flex items-center gap-2.5">
          <Clock3 className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.8} /> {course.schedule}
        </p>
        <p className="flex items-center gap-2.5">
          <DoorOpen className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.8} /> {course.room}
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
            <Award className="h-3 w-3" /> {course.credits} ECTS
          </span>
        </p>
      </div>

      <button className={`mt-5 flex items-center justify-between rounded-xl border px-4 py-3 text-[13.5px] font-semibold transition-all duration-300 ${a.bg} ${a.border} text-white hover:brightness-125`}>
        <span className="flex items-center gap-2">
          <Layers className={`h-4 w-4 ${a.text}`} strokeWidth={1.8} />
          {course.materials} materiales
        </span>
        <span className="flex items-center gap-1">
          Entrar al aula
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
        </span>
      </button>
    </motion.article>
  );
}

export default function Courses() {
  const { courses } = useStore();
  const levels: Level[] = ["Grado", "Máster", "Doctorado"];
  return (
    <section id="asignaturas" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          icon={BookOpen}
          eyebrow="Asignaturas · 2026"
          title="Aulas abiertas, de Grado a"
          highlight="Doctorado"
          description="Información general, syllabus destacado, horarios semanales y el repositorio descargable de cada materia."
        />

        <div className="space-y-14">
          {levels.map((level) => {
            const list = courses.filter((c) => c.level === level);
            if (!list.length) return null;
            return (
              <div key={level}>
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease }}
                  className="mb-6 flex items-center gap-4"
                >
                  <span className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">
                    {level}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
                  <span className="font-mono text-[11px] text-slate-500">{list.length} {list.length === 1 ? "curso" : "cursos"}</span>
                </motion.div>
                <div className="grid gap-5 md:grid-cols-2">
                  {list.map((c, i) => (
                    <CourseCard key={c.code} course={c} index={i} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

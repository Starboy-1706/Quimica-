import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Atom, BookOpen, CalendarClock, FileText, Sparkles } from "lucide-react";
import { periodicElements } from "../data/content";
import { useStore } from "../context/StoreContext";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const { courses, materials } = useStore();

  const stats = [
    { icon: BookOpen, value: String(courses.length), label: "Asignaturas activas", tint: "text-cyan-300" },
    { icon: FileText, value: String(materials.length), label: "Materiales publicados", tint: "text-violet-300" },
    { icon: Atom, value: "12", label: "Prácticas de laboratorio", tint: "text-emerald-300" },
    { icon: CalendarClock, value: "22", label: "Años de docencia", tint: "text-amber-300" },
  ];
  const { scrollY } = useScroll();
  const yCards = useTransform(scrollY, [0, 500], [0, -70]);
  const opacity = useTransform(scrollY, [0, 420], [1, 0]);

  return (
    <section id="inicio" className="relative flex min-h-screen flex-col justify-center px-4 pb-16 pt-32 sm:px-6 sm:pt-36">
      <div className="mx-auto w-full max-w-6xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.15 }}
          className="mb-8 flex justify-center"
        >
          <span className="glass-chip inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[13px] text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" strokeWidth={1.8} />
            Curso 2025 — 2026 · Segundo cuatrimestre en marcha
            <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
            <span className="hidden font-mono text-[11px] tracking-widest text-cyan-300/80 sm:block">H₂O · ΔG · pH</span>
          </span>
        </motion.div>

        {/* Titular */}
        <div className="relative text-center">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.28 }}
            className="mx-auto max-w-4xl font-display text-[13.5vw] font-semibold leading-[0.98] tracking-[-0.03em] text-white sm:text-7xl lg:text-[86px]"
          >
            La química se
            <br />
            <span className="text-iridescent">comprende</span>, no se
            <br className="sm:hidden" /> memoriza
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.45 }}
            className="mx-auto mt-7 max-w-xl text-[15.5px] leading-relaxed text-slate-400 sm:text-lg"
          >
            Plataforma del <span className="font-medium text-slate-200">Prof. Wilmer</span>: apuntes, guías de
            laboratorio, ejercicios resueltos y avisos — todo el material del aula, cristalino y al alcance de la mano.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.58 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a
              href="#asignaturas"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-7 py-4 text-[15px] font-semibold text-ink-950 shadow-[0_14px_44px_-10px_rgba(34,211,238,0.6)] transition-all duration-300 hover:shadow-[0_18px_54px_-8px_rgba(139,92,246,0.7)]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              Explorar asignaturas
              <ArrowUpRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.4} />
            </a>
            <a
              href="#repositorio"
              className="glass inline-flex items-center gap-2.5 rounded-2xl px-7 py-4 text-[15px] font-semibold text-slate-100 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.09]"
            >
              <FileText className="h-4.5 w-4.5 text-cyan-300" strokeWidth={1.8} />
              Ver repositorio
            </a>
          </motion.div>
        </div>

        {/* Tarjetas periódicas flotantes */}
        <motion.div style={{ y: yCards, opacity }} className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
          {[
            { el: periodicElements[0], pos: "left-[2%] top-[16%]", rot: "-8deg", delay: "0s", dur: "animate-float" },
            { el: periodicElements[1], pos: "right-[3%] top-[12%]", rot: "7deg", delay: "-2.5s", dur: "animate-float-slow" },
            { el: periodicElements[2], pos: "left-[6%] bottom-[24%]", rot: "6deg", delay: "-4s", dur: "animate-float-slow" },
            { el: periodicElements[4], pos: "right-[5%] bottom-[30%]", rot: "-7deg", delay: "-1.2s", dur: "animate-float" },
          ].map(({ el, pos, rot, delay, dur }) => (
            <motion.div
              key={el.symbol}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease, delay: 0.85 }}
              className={`absolute ${pos}`}
            >
              <div
                className={`glass glass-edge pointer-events-auto w-28 rounded-2xl p-3.5 ${dur} transition-transform duration-500 hover:scale-110`}
                style={{ ["--float-rot" as string]: rot, animationDelay: delay }}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] text-slate-400">{el.number}</span>
                  <span className="font-mono text-[9px] text-slate-500">{el.mass}</span>
                </div>
                <div className={`mt-1 font-display text-3xl font-bold ${el.accent}`}>{el.symbol}</div>
                <div className="mt-0.5 text-[10.5px] tracking-wide text-slate-400">{el.name}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Panel de estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.75 }}
          className="glass glass-edge mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/[0.07] sm:mt-24 lg:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="group flex flex-col items-center gap-1.5 bg-ink-950/30 px-4 py-6 text-center backdrop-blur-sm transition-colors duration-300 hover:bg-white/[0.04] sm:py-7">
              <s.icon className={`mb-1 h-4.5 w-4.5 ${s.tint}`} strokeWidth={1.6} />
              <span className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {s.value}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Indicador scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="mt-14 flex justify-center"
        >
          <a href="#asignaturas" aria-label="Bajar a asignaturas" className="glass-chip grid h-11 w-11 place-items-center rounded-full text-slate-300 transition-colors hover:text-white">
            <ArrowDown className="h-4.5 w-4.5 animate-bounce" strokeWidth={1.8} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Atom, FlaskConical, Heart } from "lucide-react";

function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.04.77 2.1 0 1.52-.01 2.75-.01 3.12 0 .3.2.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="relative px-4 pb-10 pt-6 sm:px-6"
    >
      <div className="glass glass-edge mx-auto max-w-6xl rounded-3xl p-7 sm:p-9">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="glass-chip grid h-10 w-10 place-items-center rounded-xl">
              <FlaskConical className="h-5 w-5 text-cyan-300" strokeWidth={1.8} />
            </span>
            <div className="leading-tight">
              <p className="font-display text-[15px] font-semibold text-white">Aula Docente</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">
                Química · Prof. Wilmer
              </p>
            </div>
          </div>

          <nav aria-label="Enlaces del pie" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-slate-400">
            <a href="#asignaturas" className="transition-colors hover:text-cyan-300">Asignaturas</a>
            <a href="#repositorio" className="transition-colors hover:text-cyan-300">Repositorio</a>
            <a href="#avisos" className="transition-colors hover:text-cyan-300">Avisos</a>
            <a href="#agenda" className="transition-colors hover:text-cyan-300">Agenda</a>
            <a href="#contacto" className="transition-colors hover:text-cyan-300">Contacto</a>
          </nav>

          <a
            href="https://github.com/Starboy-1706/aula-docente-glass"
            target="_blank"
            rel="noreferrer"
            className="glass-chip group flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px] text-slate-300 transition-all duration-300 hover:border-white/25 hover:text-white"
          >
            <GithubMark className="h-4 w-4" />
            Código fuente
          </a>
        </div>

        <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 sm:flex-row">
          <p className="font-mono text-[10.5px] tracking-[0.18em] text-slate-500">
            © 2026 AULA DOCENTE · MMXXVI
          </p>
          <p className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
            <Atom className="h-3.5 w-3.5 text-violet-300/80" strokeWidth={1.8} />
            Sintetizado con
            <Heart className="h-3 w-3 fill-rose-400/70 text-rose-400" />
            y rigor científico
          </p>
        </div>
      </div>
    </motion.footer>
  );
}

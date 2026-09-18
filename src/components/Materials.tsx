import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, FileArchive, FileText, FlaskConical, Presentation, ScrollText, Sigma } from "lucide-react";
import type { MaterialCategory } from "../data/content";
import { useStore } from "../context/StoreContext";
import SectionHeader from "./SectionHeader";

const ease = [0.22, 1, 0.36, 1] as const;

const categories: (MaterialCategory | "Todos")[] = [
  "Todos",
  "Apuntes",
  "Guías de laboratorio",
  "Ejercicios resueltos",
  "Presentaciones",
  "Programas",
];

const categoryIcon: Record<MaterialCategory, typeof FileText> = {
  "Apuntes": FileText,
  "Guías de laboratorio": FlaskConical,
  "Ejercicios resueltos": Sigma,
  "Presentaciones": Presentation,
  "Programas": ScrollText,
};

const formatTint: Record<string, string> = {
  PDF: "text-rose-300 bg-rose-400/10 border-rose-400/20",
  PPTX: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  XLSX: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
  DOCX: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
};

export default function Materials() {
  const { materials } = useStore();
  const [active, setActive] = useState<(typeof categories)[number]>("Todos");
  const [downloaded, setDownloaded] = useState<number | null>(null);

  const filtered = useMemo(
    () => (active === "Todos" ? materials : materials.filter((m) => m.category === active)),
    [active, materials],
  );

  const handleDownload = (id: number) => {
    const mat = materials.find((m) => m.id === id);
    if (mat) {
      // Simula descarga de archivo real
      const content = `%PDF-1.4\n1 0 obj\n<< /Title (${mat.title}) /Author (Prof. Wilmer) >>\nendobj\nAula Docente · Química · ${mat.title}`;
      const blob = new Blob([content], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${mat.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${mat.format.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setDownloaded(id);
    setTimeout(() => setDownloaded(null), 1600);
  };

  return (
    <section id="repositorio" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          icon={FileArchive}
          eyebrow="Repositorio"
          title="Todo el material, en"
          highlight="cristal"
          description="Apuntes, guías de prácticas, ejercicios resueltos y presentaciones. Descarga directa, sin registros ni contraseñas."
        />

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="mb-10 flex flex-wrap justify-center gap-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`relative rounded-full px-4.5 py-2.5 text-[13px] font-medium transition-all duration-300 ${
                active === cat
                  ? "text-ink-950"
                  : "glass-chip text-slate-300 hover:bg-white/[0.09] hover:text-white"
              }`}
            >
              {active === cat && (
                <motion.span
                  layoutId="material-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 shadow-[0_8px_26px_-8px_rgba(34,211,238,0.6)]"
                  transition={{ type: "spring", bounce: 0.22, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </motion.div>

        {/* Lista */}
        <motion.div layout className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((m, i) => {
              const Icon = categoryIcon[m.category];
              return (
                <motion.article
                  layout
                  key={m.id}
                  initial={{ opacity: 0, y: 26, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.22 } }}
                  transition={{ duration: 0.55, ease, delay: i * 0.04 }}
                  className="group glass glass-edge flex items-center gap-4 rounded-2xl p-5 transition-colors duration-300 hover:bg-white/[0.07]"
                >
                  <span className="glass-chip grid h-12 w-12 shrink-0 place-items-center rounded-xl text-cyan-300">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[14.5px] font-medium text-slate-100 transition-colors group-hover:text-white" title={m.title}>
                      {m.title}
                    </h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-slate-500">
                      <span className="font-mono text-cyan-300/80">{m.course}</span>
                      <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-slate-600" />
                      <span>{m.category}</span>
                      <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-slate-600" />
                      <span>{m.updated}</span>
                    </p>
                  </div>

                  <span className={`hidden rounded-lg border px-2 py-1 font-mono text-[10px] font-semibold sm:block ${formatTint[m.format]}`}>
                    {m.format}
                  </span>

                  <button
                    onClick={() => handleDownload(m.id)}
                    aria-label={`Descargar ${m.title}`}
                    className={`relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border transition-all duration-300 ${
                      downloaded === m.id
                        ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                        : "glass-chip text-slate-300 hover:text-cyan-300 hover:border-cyan-400/30"
                    }`}
                  >
                    <Download
                      className={`h-4.5 w-4.5 transition-transform duration-300 ${
                        downloaded === m.id ? "translate-y-8" : "group-hover:translate-y-0.5"
                      }`}
                      strokeWidth={1.9}
                    />
                    <svg viewBox="0 0 24 24" className={`absolute h-4.5 w-4.5 transition-all duration-300 ${downloaded === m.id ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </button>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-8 text-center font-mono text-[11.5px] tracking-wide text-slate-500"
        >
          {filtered.length} de {materials.length} materiales · archivos servidos con firma temporal de 5 minutos
        </motion.p>
      </div>
    </section>
  );
}

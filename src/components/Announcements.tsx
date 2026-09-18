import { motion } from "framer-motion";
import { Bell, CalendarClock, Megaphone, Pin, UploadCloud, TriangleAlert } from "lucide-react";
import type { NoticeType } from "../data/content";
import { useStore } from "../context/StoreContext";
import SectionHeader from "./SectionHeader";

const ease = [0.22, 1, 0.36, 1] as const;

const typeConfig: Record<NoticeType, { label: string; icon: typeof Bell; chip: string; bar: string }> = {
  examen: {
    label: "Examen",
    icon: TriangleAlert,
    chip: "text-rose-300 bg-rose-400/10 border-rose-400/25",
    bar: "from-rose-400/70 via-rose-400/20 to-transparent",
  },
  entrega: {
    label: "Entrega",
    icon: UploadCloud,
    chip: "text-amber-300 bg-amber-400/10 border-amber-400/25",
    bar: "from-amber-400/70 via-amber-400/20 to-transparent",
  },
  cambio: {
    label: "Cambio de aula",
    icon: CalendarClock,
    chip: "text-cyan-300 bg-cyan-400/10 border-cyan-400/25",
    bar: "from-cyan-400/70 via-cyan-400/20 to-transparent",
  },
  general: {
    label: "General",
    icon: Megaphone,
    chip: "text-emerald-300 bg-emerald-400/10 border-emerald-400/25",
    bar: "from-emerald-400/70 via-emerald-400/20 to-transparent",
  },
};

export default function Announcements() {
  const { notices } = useStore();
  // Ordena: fijados primero
  const sorted = [...notices].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <section id="avisos" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          icon={Bell}
          eyebrow="Tablón"
          title="Avisos que no se"
          highlight="evaporan"
          description="Exámenes, entregas y cambios de aula publicados con su fecha de evento. Los fijados permanecen arriba."
        />

        <div className="grid gap-5 md:grid-cols-2">
          {sorted.map((n, i) => {
            const cfg = typeConfig[n.type];
            const Icon = cfg.icon;
            return (
              <motion.article
                key={n.id}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, ease, delay: i * 0.08 }}
                whileHover={{ y: -5 }}
                className="group glass glass-edge relative overflow-hidden rounded-3xl p-6 sm:p-7"
              >
                {/* barra luminosa lateral */}
                <span className={`absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b ${cfg.bar}`} />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl border ${cfg.chip}`}>
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                    </span>
                    <div>
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${cfg.chip}`}>
                        {cfg.label}
                      </span>
                      <p className="mt-1 font-mono text-[10.5px] tracking-[0.16em] text-slate-500">
                        {n.course} · {n.date}
                      </p>
                    </div>
                  </div>
                  {n.pinned && (
                    <span className="glass-chip grid h-8 w-8 place-items-center rounded-lg text-amber-300" title="Aviso fijado">
                      <Pin className="h-3.5 w-3.5 fill-amber-300/30" strokeWidth={1.8} />
                    </span>
                  )}
                </div>

                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-white">
                  {n.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-slate-400">{n.body}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

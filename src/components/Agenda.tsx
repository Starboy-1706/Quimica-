import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { agendaEvents, type NoticeType } from "../data/content";
import SectionHeader from "./SectionHeader";

const ease = [0.22, 1, 0.36, 1] as const;

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

const dot: Record<NoticeType, string> = {
  examen: "bg-rose-400 shadow-[0_0_8px_2px_rgba(251,113,133,0.5)]",
  entrega: "bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.45)]",
  cambio: "bg-cyan-400 shadow-[0_0_8px_2px_rgba(34,211,238,0.45)]",
  general: "bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.45)]",
};

const ring: Record<NoticeType, string> = {
  examen: "text-rose-300", entrega: "text-amber-300", cambio: "text-cyan-300", general: "text-emerald-300",
};

export default function Agenda() {
  const today = new Date();
  const [cursor, setCursor] = useState({ month: 1, year: 2026 }); // febrero 2026
  const [selected, setSelected] = useState<number | null>(24);

  const firstDay = useMemo(() => {
    const d = new Date(cursor.year, cursor.month, 1).getDay();
    return (d + 6) % 7; // lunes = 0
  }, [cursor]);

  const daysInMonth = useMemo(
    () => new Date(cursor.year, cursor.month + 1, 0).getDate(),
    [cursor],
  );

  const monthEvents = useMemo(
    () =>
      agendaEvents
        .filter((e) => e.month === cursor.month && e.year === cursor.year)
        .sort((a, b) => a.day - b.day),
    [cursor],
  );

  const eventsByDay = useMemo(() => {
    const map: Record<number, typeof monthEvents> = {};
    monthEvents.forEach((e) => {
      map[e.day] = [...(map[e.day] ?? []), e];
    });
    return map;
  }, [monthEvents]);

  const move = (dir: -1 | 1) => {
    setSelected(null);
    setCursor((c) => {
      const m = c.month + dir;
      if (m < 0) return { month: 11, year: c.year - 1 };
      if (m > 11) return { month: 0, year: c.year + 1 };
      return { month: m, year: c.year };
    });
  };

  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === cursor.month && today.getFullYear() === cursor.year;

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <section id="agenda" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          icon={CalendarDays}
          eyebrow="Agenda académica"
          title="El mes, visto como una"
          highlight="reacción"
          description="Exámenes, entregas y eventos con su tipología. Navega el calendario y toca un día para ver qué ocurre."
        />

        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          {/* Calendario */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease }}
            className="glass glass-edge rounded-3xl p-6 sm:p-8"
          >
            {/* cabecera mes */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold tracking-tight text-white">
                {MONTHS[cursor.month]}{" "}
                <span className="font-mono text-base font-normal text-slate-500">{cursor.year}</span>
              </h3>
              <div className="flex gap-2">
                <button onClick={() => move(-1)} aria-label="Mes anterior" className="glass-chip grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition-colors hover:text-cyan-300">
                  <ChevronLeft className="h-4.5 w-4.5" strokeWidth={2} />
                </button>
                <button onClick={() => move(1)} aria-label="Mes siguiente" className="glass-chip grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition-colors hover:text-cyan-300">
                  <ChevronRight className="h-4.5 w-4.5" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* días semana */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <span key={d} className="py-1 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  {d}
                </span>
              ))}
            </div>

            {/* celdas */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (day === null) return <span key={`empty-${i}`} className="aspect-square" />;
                const evts = eventsByDay[day] ?? [];
                const active = selected === day;
                return (
                  <button
                    key={`d-${i}`}
                    onClick={() => setSelected(active ? null : day)}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-[13.5px] font-medium transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-br from-cyan-400/25 to-violet-500/25 text-white ring-1 ring-cyan-300/40"
                        : isToday(day)
                          ? "bg-white/[0.08] text-white ring-1 ring-white/20"
                          : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                    } ${evts.length ? "cursor-pointer" : ""}`}
                  >
                    {day}
                    {evts.length > 0 && (
                      <span className="absolute bottom-1.5 flex gap-1">
                        {evts.slice(0, 3).map((e, k) => (
                          <span key={k} className={`h-1 w-1 rounded-full ${dot[e.type]}`} />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* leyenda */}
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.06] pt-5">
              {(Object.keys(dot) as NoticeType[]).map((t) => (
                <span key={t} className="flex items-center gap-2 text-[11.5px] capitalize text-slate-400">
                  <span className={`h-1.5 w-1.5 rounded-full ${dot[t]}`} />
                  {t === "cambio" ? "Cambio de aula" : t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Eventos del mes */}
          <motion.aside
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease, delay: 0.12 }}
            className="glass glass-edge flex flex-col rounded-3xl p-6 sm:p-8"
          >
            <h3 className="mb-1 font-display text-lg font-semibold text-white">
              {selected && eventsByDay[selected]
                ? `${selected} de ${MONTHS[cursor.month].toLowerCase()}`
                : `Próximos en ${MONTHS[cursor.month].toLowerCase()}`}
            </h3>
            <p className="mb-5 font-mono text-[11px] tracking-[0.18em] text-slate-500">
              {monthEvents.length} {monthEvents.length === 1 ? "EVENTO" : "EVENTOS"} ESTE MES
            </p>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {(selected && eventsByDay[selected] ? eventsByDay[selected] : monthEvents).map((e, k) => (
                <motion.div
                  key={`${e.day}-${e.title}`}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, ease, delay: k * 0.06 }}
                  className="glass-soft group flex items-center gap-4 rounded-2xl p-4 transition-colors duration-300 hover:bg-white/[0.07]"
                >
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl glass-chip">
                    <span className="font-display text-lg font-bold leading-none text-white">{e.day}</span>
                    <span className="font-mono text-[8.5px] uppercase tracking-widest text-slate-500">
                      {MONTHS[e.month].slice(0, 3)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-slate-100">{e.title}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-[11.5px] text-slate-500">
                      <span className={`font-mono ${ring[e.type]}`}>{e.course}</span>
                      {e.time && (
                        <span className="flex items-center gap-1">
                          <Clock3 className="h-3 w-3" /> {e.time}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className={`h-2 w-2 shrink-0 rounded-full ${dot[e.type]}`} />
                </motion.div>
              ))}

              {monthEvents.length === 0 && (
                <div className="grid flex-1 place-items-center rounded-2xl border border-dashed border-white/10 p-10 text-center">
                  <p className="text-[13.5px] text-slate-500">
                    Mes en equilibrio: sin eventos previstos.
                  </p>
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}

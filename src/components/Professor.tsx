import { motion } from "framer-motion";
import { Building2, Clock3, Mail, MapPin, UserRound } from "lucide-react";
import { useStore } from "../context/StoreContext";
import SectionHeader from "./SectionHeader";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Professor() {
  const { profile } = useStore();

  const facts = [
    { icon: MapPin, label: "Despacho", value: profile.office },
    { icon: Clock3, label: "Tutorías", value: profile.officeHours },
    { icon: Mail, label: "Correo", value: profile.email },
    { icon: Building2, label: "Departamento", value: profile.department },
  ];
  return (
    <section id="profesor" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          icon={UserRound}
          eyebrow="Tu profesor"
          title="Detrás del matraz,"
          highlight="una persona"
          description={profile.department}
        />

        <div className="grid items-stretch gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Retrato */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease }}
            className="glass glass-edge group relative overflow-hidden rounded-3xl"
          >
            <img
              src="/images/professor.jpg"
              alt="Retrato del Prof. Wilmer en el laboratorio"
              className="h-full min-h-[420px] w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.045]"
            />
            {/* degradado glass */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent" />
            <div className="absolute inset-x-5 bottom-5">
              <div className="glass rounded-2xl p-4">
                <p className="font-display text-lg font-semibold text-white">{profile.name}</p>
                <p className="text-[12.5px] text-cyan-300/90">{profile.role}</p>
              </div>
            </div>
            {/* brillo superior */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease, delay: 0.1 }}
            className="glass glass-edge flex flex-col justify-between rounded-3xl p-7 sm:p-9"
          >
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                {profile.specialties.map((s) => (
                  <span key={s} className="glass-chip rounded-full px-3.5 py-1.5 text-[12px] font-medium text-slate-200">
                    {s}
                  </span>
                ))}
              </div>

              <blockquote className="relative border-l-2 border-cyan-400/40 pl-5">
                <p className="font-display text-xl font-medium leading-relaxed text-slate-100 sm:text-[23px]">
                  «{profile.bio}»
                </p>
              </blockquote>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {facts.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, ease, delay: 0.15 + i * 0.07 }}
                  className="glass-soft group flex items-start gap-3.5 rounded-2xl p-4 transition-colors duration-300 hover:bg-white/[0.07]"
                >
                  <span className="glass-chip grid h-9 w-9 shrink-0 place-items-center rounded-lg text-cyan-300">
                    <f.icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">{f.label}</p>
                    <p className="mt-1 text-[13px] font-medium leading-snug text-slate-200">{f.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

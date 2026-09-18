import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Mail, Send, ShieldCheck } from "lucide-react";
import { useStore } from "../context/StoreContext";
import SectionHeader from "./SectionHeader";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Contact() {
  const { courses, submitInquiry } = useStore();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const nombre = (formData.get("nombre") as string) || "";
    const correo = (formData.get("correo") as string) || "";
    const asignatura = (formData.get("asignatura") as string) || "General";
    const mensaje = (formData.get("mensaje") as string) || "";

    setSending(true);
    setTimeout(() => {
      submitInquiry({
        name: nombre,
        email: correo,
        course: asignatura,
        message: mensaje,
      });
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 4200);
      form.reset();
    }, 900);
  };

  const field =
    "glass-soft w-full rounded-xl px-4 py-3.5 text-[14px] text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-cyan-300/40 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]";

  return (
    <section id="contacto" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeader
          icon={Mail}
          eyebrow="Consultas"
          title="Una duda nunca es una"
          highlight="salida de error"
          description="Escríbeme desde aquí y la consulta llegará a mi bandeja con aviso por correo. Respondo en horario de tutoría."
        />

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.85, ease }}
          className="glass glass-edge relative rounded-3xl p-7 sm:p-9"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="nombre" className="mb-2 block font-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-500">
                Nombre
              </label>
              <input id="nombre" name="nombre" required placeholder="Ada Lovelace" className={field} />
            </div>
            <div>
              <label htmlFor="correo" className="mb-2 block font-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-500">
                Correo
              </label>
              <input id="correo" name="correo" type="email" required placeholder="ada@estudiante.edu" className={field} />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="asignatura" className="mb-2 block font-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-500">
              Asignatura
            </label>
            <select id="asignatura" name="asignatura" className={`${field} appearance-none [&>option]:bg-ink-900`}>
              <option>Consulta general</option>
              {courses.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label htmlFor="mensaje" className="mb-2 block font-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-500">
              Mensaje
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              required
              rows={5}
              placeholder="Profesor, no entiendo por qué el mecanismo SN2 invierte la configuración…"
              className={`${field} resize-none`}
            />
          </div>

          {/* honeypot antispam */}
          <input type="text" name="empresa" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="flex items-center gap-2 text-[11.5px] text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-400/80" strokeWidth={1.8} />
              Protegido con antispam · sin datos de terceros
            </p>

            <button
              type="submit"
              disabled={sending}
              className="group relative inline-flex min-w-[190px] items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-7 py-3.5 text-[14.5px] font-semibold text-ink-950 shadow-[0_12px_38px_-10px_rgba(52,211,153,0.55)] transition-all duration-300 hover:brightness-110 disabled:opacity-70"
            >
              <AnimatePresence mode="wait" initial={false}>
                {sent ? (
                  <motion.span key="ok" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5" strokeWidth={2.2} />
                    ¡Consulta enviada!
                  </motion.span>
                ) : sending ? (
                  <motion.span key="sending" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-2.5">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950" />
                    Enviando…
                  </motion.span>
                ) : (
                  <motion.span key="send" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-2">
                    Enviar consulta
                    <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.2} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}

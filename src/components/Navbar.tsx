import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Menu, X, Lock, ShieldCheck } from "lucide-react";
import { useStore } from "../context/StoreContext";

const links = [
  { href: "#inicio", label: "Inicio" },
  { href: "#asignaturas", label: "Asignaturas" },
  { href: "#repositorio", label: "Repositorio" },
  { href: "#avisos", label: "Avisos" },
  { href: "#agenda", label: "Agenda" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, setIsLoginOpen, setIsAdminOpen } = useStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6"
    >
      <nav
        className={`glass glass-edge flex w-full max-w-6xl items-center justify-between gap-4 rounded-2xl px-4 py-3 transition-all duration-500 sm:px-5 ${
          scrolled ? "shadow-[0_18px_50px_-20px_rgba(2,8,23,0.95)]" : ""
        }`}
        aria-label="Navegación principal"
      >
        {/* Marca */}
        <a href="#inicio" className="group flex items-center gap-3">
          <span className="relative grid h-10 w-10 place-items-center rounded-xl glass-chip">
            <FlaskConical className="h-5 w-5 text-cyan-300 transition-transform duration-500 group-hover:rotate-12" strokeWidth={1.8} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)] animate-pulse-soft" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[15px] font-semibold tracking-tight text-white">
              Aula Docente
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">
              Química · Prof. Wilmer
            </span>
          </span>
        </a>

        {/* Links escritorio */}
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="relative rounded-full px-4 py-2 text-[13.5px] font-medium text-slate-300/90 transition-all duration-300 hover:text-white hover:bg-white/[0.06]"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => setIsAdminOpen(true)}
              className="group hidden items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400/90 to-emerald-400/90 px-4 py-2 text-[13px] font-semibold text-ink-950 shadow-[0_8px_30px_-8px_rgba(34,211,238,0.55)] transition-all duration-300 hover:brightness-110 sm:flex"
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={2.2} />
              Panel Docente ({user.name.split(" ")[0]})
            </button>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="group hidden items-center gap-2 rounded-xl glass-chip px-3.5 py-2 text-[13px] font-medium text-slate-200 transition-all duration-300 hover:text-white hover:border-cyan-400/40 sm:flex"
            >
              <Lock className="h-3.5 w-3.5 text-cyan-300" strokeWidth={1.8} />
              Acceso Docente
            </button>
          )}

          {/* Botón móvil */}
          <button
            onClick={() => setOpen(!open)}
            className="glass-chip grid h-10 w-10 place-items-center rounded-xl text-slate-200 lg:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Menú móvil */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="glass glass-edge absolute inset-x-0 top-[calc(100%+10px)] rounded-2xl p-3 lg:hidden"
            >
              <ul className="flex flex-col">
                {[...links, { href: "#contacto", label: "Contacto" }].map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                  >
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium text-slate-200 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      {l.label}
                      <span className="h-1 w-1 rounded-full bg-cyan-400/70" />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}

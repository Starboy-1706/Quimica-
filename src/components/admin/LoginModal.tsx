import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, KeyRound, Lock, Sparkles, User, X, AlertCircle } from "lucide-react";
import { useStore } from "../../context/StoreContext";

export default function LoginModal() {
  const { isLoginOpen, setIsLoginOpen, login, setIsAdminOpen } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isLoginOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      setLoading(false);
      if (res.ok) {
        setIsLoginOpen(false);
        setIsAdminOpen(true);
        setEmail("");
        setPassword("");
      } else {
        setError(res.error || "Credenciales inválidas");
      }
    } catch {
      setLoading(false);
      setError("Error al conectar con el servicio de autenticación");
    }
  };

  const fillCredentials = (role: "admin" | "editor") => {
    if (role === "admin") {
      setEmail("wilmer@aula.edu");
      setPassword("Aula#2026");
    } else {
      setEmail("ayudante@aula.edu");
      setPassword("Ayudante#2026");
    }
    setError(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsLoginOpen(false)}
          className="absolute inset-0 bg-ink-950/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="glass glass-edge relative z-10 w-full max-w-md rounded-3xl p-7 shadow-2xl sm:p-8"
        >
          {/* Close button */}
          <button
            onClick={() => setIsLoginOpen(false)}
            className="glass-chip absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="text-center">
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl glass-chip text-cyan-300">
              <Lock className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
              Panel del Docente
            </h2>
            <p className="mt-1 text-[13px] text-slate-400">
              Acceso administrativo al aula y repositorio
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-[12.5px] text-rose-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            <div>
              <label className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.2em] text-slate-400">
                Correo institucional
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="wilmer@aula.edu"
                  className="glass-soft w-full rounded-xl pl-10 pr-4 py-3 text-[13.5px] text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30"
                />
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" strokeWidth={1.8} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.2em] text-slate-400">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-soft w-full rounded-xl pl-10 pr-10 py-3 text-[13.5px] text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30"
                />
                <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" strokeWidth={1.8} />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 py-3.5 text-[14px] font-semibold text-ink-950 shadow-[0_8px_24px_-6px_rgba(34,211,238,0.5)] transition-all duration-300 hover:brightness-110 disabled:opacity-70"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950" />
              ) : (
                "Entrar al panel"
              )}
            </button>
          </form>

          {/* Quick Credential Helpers */}
          <div className="mt-6 border-t border-white/[0.06] pt-4">
            <p className="mb-2.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              <Sparkles className="h-3 w-3 text-cyan-300" />
              Cuentas de demostración iniciales:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials("admin")}
                className="glass-chip flex flex-col rounded-xl p-2.5 text-left transition-colors hover:bg-white/[0.09]"
              >
                <span className="text-[12px] font-semibold text-cyan-300">Prof. Wilmer</span>
                <span className="font-mono text-[9.5px] text-slate-400">Administrador</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("editor")}
                className="glass-chip flex flex-col rounded-xl p-2.5 text-left transition-colors hover:bg-white/[0.09]"
              >
                <span className="text-[12px] font-semibold text-violet-300">Dra. Sofía Ramos</span>
                <span className="font-mono text-[9.5px] text-slate-400">Editor / Ayudante</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

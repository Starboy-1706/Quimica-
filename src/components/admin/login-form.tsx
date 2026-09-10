"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { idleActionState } from "@/lib/action-state";
import { loginAction } from "@/server/actions/auth";

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative flex min-h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-brass px-5 text-[15px] font-semibold text-night shadow-[0_14px_38px_-14px_rgba(220,166,63,0.8)] transition hover:bg-[#e7b44d] focus-visible:ring-4 focus-visible:ring-brass/25 active:scale-[0.985] disabled:cursor-wait disabled:opacity-75"
    >
      {/* Barrido de luz al pasar el cursor */}
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full group-disabled:hidden"
        aria-hidden="true"
      />
      {pending ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      ) : (
        <KeyRound className="h-5 w-5" aria-hidden="true" />
      )}
      {pending ? "Verificando credenciales…" : "Entrar al panel"}
      {!pending ? (
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}

/** Formulario de acceso de paso único, optimizado para teclado y móvil. */
export function IntuitiveLoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(loginAction, idleActionState);
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const hasError = state.status === "error";

  // Tras un intento fallido: seleccionar la contraseña para reescribir rápido.
  useEffect(() => {
    if (hasError) {
      passwordRef.current?.focus();
      passwordRef.current?.select();
    }
  }, [hasError]);

  return (
    <form action={formAction} className="mt-7 space-y-4" noValidate={false}>
      <input type="hidden" name="next" value={next} />

      <div className={hasError ? "animate-shake" : undefined} key={hasError ? "error" : "idle"}>
        <label
          htmlFor="admin-password"
          className="mb-2 block text-sm font-medium text-cream"
        >
          Contraseña de acceso
        </label>
        <div className="relative">
          <KeyRound
            className={`pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 transition-colors ${
              hasError ? "text-clay" : "text-muted"
            }`}
            aria-hidden="true"
          />
          <input
            ref={passwordRef}
            id="admin-password"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            autoFocus
            required
            aria-invalid={hasError}
            aria-describedby="password-help password-status"
            placeholder="Escribe tu contraseña"
            onKeyUp={(event) => setCapsLock(event.getModifierState("CapsLock"))}
            onBlur={() => setCapsLock(false)}
            className={`min-h-14 w-full rounded-2xl border bg-lift pl-12 pr-14 text-base text-cream placeholder:text-muted transition focus:outline-none focus:ring-4 ${
              hasError
                ? "border-clay/60 focus:border-clay focus:ring-clay/15"
                : "border-line focus:border-brass focus:ring-brass/10"
            }`}
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Ocultar clave" : "Mostrar clave"}
            aria-pressed={visible}
            className="touch-target absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-xl text-muted transition hover:bg-panel hover:text-cream"
          >
            {visible ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
        <div
          id="password-help"
          className="mt-2 flex items-center justify-between gap-3 text-[11px] text-muted"
        >
          <span>La sesión caduca y se registra en la bitácora.</span>
          {capsLock ? (
            <span className="shrink-0 font-medium text-brass">
              Bloq Mayús activado
            </span>
          ) : null}
        </div>
      </div>

      <div id="password-status" aria-live="polite">
        {hasError ? (
          <p
            role="alert"
            className="animate-login-rise flex items-start gap-2 rounded-xl border border-clay/40 bg-clay/10 px-3.5 py-3 text-sm leading-relaxed text-clay"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{state.status === "error" ? state.error : ""}</span>
          </p>
        ) : null}
      </div>

      <LoginButton />

      <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] text-muted">
        <ShieldCheck className="h-3.5 w-3.5 text-sage" aria-hidden="true" />
        Sesión protegida y actividad registrada en auditoría
      </p>
    </form>
  );
}

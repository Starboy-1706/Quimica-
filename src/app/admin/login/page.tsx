import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardCheck,
  FileStack,
  FlaskConical,
  LockKeyhole,
  Users,
} from "lucide-react";
import { IntuitiveLoginForm } from "@/components/admin/login-form";
import { LoginAtmosphere } from "@/components/admin/login-atmosphere";
import {
  getProfessorPublicProfile,
  getSiteSettingsMap,
} from "@/server/queries";

export const metadata: Metadata = {
  title: "Acceso al panel docente",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, settings, profile] = await Promise.all([
    searchParams,
    getSiteSettingsMap(),
    getProfessorPublicProfile(),
  ]);

  const teacherName = profile?.user.fullName ?? "Wilmer Molina";
  const institution =
    profile?.department ??
    settings.institution_name ??
    "Departamento de Química";
  const siteTitle = settings.site_title ?? "Aula Docente";
  const brand = settings.brand_primary || "#0f5e5b";

  const firstName = teacherName.trim().split(/\s+/)[0] ?? teacherName;

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-night text-cream"
      style={{ "--login-brand": brand } as CSSProperties}
    >
      {/* ── Atmósfera: laboratorio en ebullición (canvas) ─────────────── */}
      <LoginAtmosphere brandColor={brand} />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        {/* Resplandor de marca inferior y viñeta cinematográfica */}
        <div className="absolute bottom-[-14rem] left-1/2 h-[30rem] w-[52rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,var(--login-brand),transparent_70%)] opacity-[0.16]" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_55%,rgba(16,14,9,0.75)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col">
        {/* ── Barra superior flotante ─────────────────────────────────── */}
        <header className="flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-6">
          <Link
            href="/"
            className="animate-login-rise inline-flex min-h-11 items-center gap-2 rounded-full border border-cream/10 bg-coal/60 px-4 text-sm text-sand backdrop-blur-md transition hover:border-brass/40 hover:text-cream"
            style={{ animationDelay: "80ms" }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Volver al sitio público</span>
            <span className="sm:hidden">Sitio público</span>
          </Link>
          <p
            className="animate-login-rise hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-muted sm:flex"
            style={{ animationDelay: "140ms" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sage" aria-hidden="true" />
            Acceso interno · auditado
          </p>
        </header>

        {/* ── Cuerpo: editorial + tarjeta ─────────────────────────────── */}
        <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-10 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Columna editorial */}
          <section className="hidden lg:block" aria-label="Presentación del panel">
            <div className="animate-login-rise" style={{ animationDelay: "160ms" }}>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brass text-night shadow-[0_14px_34px_-12px_rgba(220,166,63,0.8)]">
                  <FlaskConical className="h-5.5 w-5.5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="leading-tight">
                  <p className="font-display text-lg font-semibold">{siteTitle}</p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-muted">
                    {institution}
                  </p>
                </div>
              </div>

              <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.32em] text-brass">
                Área privada · {teacherName}
              </p>
              <h1 className="mt-4 max-w-md font-display text-5xl font-semibold leading-[1.05]">
                Tu laboratorio
                <span className="block italic text-brass">digital, en orden.</span>
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted sm:text-base">
                Asignaturas, materiales, avisos y consultas: todo el portal se
                administra desde aquí, con cada acción firmada en la bitácora.
              </p>

              <ul className="mt-10 grid max-w-md grid-cols-3 gap-2.5" role="list">
                {[
                  { icon: FileStack, label: "Contenido", detail: "Cursos y archivos" },
                  { icon: Users, label: "Cuentas", detail: "Roles académicos" },
                  { icon: ClipboardCheck, label: "Bitácora", detail: "Historial total" },
                ].map((item, i) => (
                  <li
                    key={item.label}
                    className="animate-login-rise rounded-2xl border border-cream/10 bg-coal/50 p-3.5 backdrop-blur-md"
                    style={{ animationDelay: `${260 + i * 90}ms` }}
                  >
                    <item.icon className="h-4 w-4 text-brass" aria-hidden="true" />
                    <p className="mt-2.5 text-xs font-medium text-cream">{item.label}</p>
                    <p className="mt-0.5 text-[10px] text-muted">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Tarjeta de acceso */}
          <section
            className="animate-login-rise mx-auto w-full max-w-md"
            style={{ animationDelay: "220ms" }}
            aria-label="Formulario de acceso"
          >
            <div className="relative rounded-[1.9rem] border border-cream/10 bg-coal/70 p-6 shadow-[0_36px_90px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8">
              {/* Línea de luz superior */}
              <div
                className="absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-(--login-brand) to-transparent opacity-80"
                aria-hidden="true"
              />

              <div className="flex items-start justify-between gap-4">
                <div>
                  {/* Identidad en móvil (columna editorial oculta) */}
                  <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted lg:hidden">
                    {siteTitle} · {institution}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-brass lg:mt-0">
                    Consola docente
                  </p>
                  <h2 className="mt-2.5 font-display text-[2rem] font-semibold leading-tight sm:text-[2.1rem]">
                    Buenas, {firstName}.
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Escribe tu contraseña para continuar. Un solo paso, sin
                    correo ni usuario.
                  </p>
                </div>
                <span className="animate-float relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brass/25 bg-brass/[0.08] text-brass">
                  <span
                    className="absolute inset-0 rounded-2xl border border-brass/15 blur-[6px]"
                    aria-hidden="true"
                  />
                  <LockKeyhole className="h-5.5 w-5.5" aria-hidden="true" />
                </span>
              </div>

              <IntuitiveLoginForm
                next={typeof next === "string" ? next : ""}
              />
            </div>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-muted">
              ¿Olvidaste la clave? Se restablece con acceso al servidor:
              cualquier administrador puede cambiarla desde{" "}
              <span className="font-medium text-sand">Cuentas</span>.
            </p>
          </section>
        </div>

        {/* ── Pie sutil ──────────────────────────────────────────────── */}
        <footer className="safe-bottom px-5 pb-5 text-center">
          <p className="animate-login-rise font-mono text-[9px] uppercase tracking-[0.28em] text-muted/70" style={{ animationDelay: "420ms" }}>
            {institution} · Sesiones firmadas y cifradas
          </p>
        </footer>
      </div>
    </main>
  );
}

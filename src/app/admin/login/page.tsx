import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FlaskConical,
  LockKeyhole,
  Palette,
  ShieldCheck,
} from "lucide-react";
import { IntuitiveLoginForm } from "@/components/admin/login-form";
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

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-night text-cream"
      style={{ "--login-brand": brand } as CSSProperties}
    >
      {/* Fondo abstracto: no usa ninguna imagen externa */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full border border-brass/10" />
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full border border-brass/10" />
        <div className="absolute bottom-[-10rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,var(--login-brand),transparent_68%)] opacity-20" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(circle,#f2ead4_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <div className="relative mx-auto grid min-h-dvh max-w-7xl grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Contexto e identidad */}
        <section className="flex flex-col px-5 pb-10 pt-5 sm:px-10 sm:pt-8 lg:justify-between lg:px-16 lg:py-12">
          <Link
            href="/"
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-line px-4 text-sm text-sand transition hover:border-brass/50 hover:text-cream"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver al sitio público
          </Link>

          <div className="mt-12 max-w-xl lg:mt-0">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brass text-night shadow-[0_12px_30px_-12px_rgba(220,166,63,0.7)]">
                <FlaskConical className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <div className="leading-tight">
                <p className="font-display text-xl font-semibold">{siteTitle}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em] text-muted">
                  {institution}
                </p>
              </div>
            </div>

            <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.3em] text-brass">
              Área privada · {teacherName}
            </p>
            <h1 className="mt-4 max-w-lg font-display text-4xl font-semibold leading-[1.08] sm:text-5xl">
              Todo tu portal docente,
              <span className="block italic text-brass">en un solo lugar.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              Publica asignaturas, organiza materiales, responde consultas y
              personaliza la experiencia de tus estudiantes.
            </p>

            <ul className="mt-8 hidden grid-cols-3 gap-3 sm:grid" role="list">
              {[
                {
                  icon: CheckCircle2,
                  title: "Contenido",
                  text: "Cursos y materiales",
                },
                {
                  icon: Palette,
                  title: "Diseño",
                  text: "Textos e imágenes",
                },
                {
                  icon: ShieldCheck,
                  title: "Control",
                  text: "Acceso auditado",
                },
              ].map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-line bg-panel/50 p-4"
                >
                  <item.icon className="h-4 w-4 text-brass" aria-hidden="true" />
                  <p className="mt-3 text-xs font-medium text-cream">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-10 hidden font-mono text-[9px] uppercase tracking-[0.25em] text-muted lg:block">
            Consola docente · Acceso seguro
          </p>
        </section>

        {/* Acción principal */}
        <section className="flex items-center justify-center px-5 pb-10 sm:px-10 lg:border-l lg:border-line lg:bg-coal/55 lg:py-12">
          <div className="w-full max-w-md rounded-[1.75rem] border border-line bg-coal p-5 shadow-[0_28px_80px_-32px_rgba(0,0,0,0.85)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-brass">
                  Paso único
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold">
                  Bienvenido
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Escribe tu contraseña para continuar.
                </p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-lift text-brass">
                <LockKeyhole className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>

            <IntuitiveLoginForm
              next={typeof next === "string" ? next : ""}
            />

            <div className="mt-6 border-t border-line pt-5 text-center">
              <p className="text-[11px] leading-relaxed text-muted">
                Puedes cambiar la clave después desde{" "}
                <span className="font-medium text-sand">Ajustes → Contraseña</span>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

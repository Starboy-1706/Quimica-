import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  History,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { LoginForm } from "@/components/admin/forms";

export const metadata: Metadata = { title: "Acceso al panel docente" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="grid min-h-screen bg-night text-cream lg:grid-cols-[1.1fr_1fr]">
      {/* Panel identitario */}
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-coal p-12 lg:flex">
        <p className="pointer-events-none absolute -bottom-10 left-6 select-none font-display text-[11rem] font-black italic leading-none text-cream/[0.04]">
          Aula
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-sand transition hover:text-cream"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al sitio público
        </Link>

        <div className="relative">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brass text-night">
            <GraduationCap className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <h1 className="mt-8 max-w-md font-display text-4xl font-semibold leading-tight">
            Panel de administración{" "}
            <span className="italic text-brass">del docente</span>.
          </h1>
          <ul className="mt-10 space-y-5 text-sm text-sand">
            {[
              {
                icon: KeyRound,
                title: "Acceso directo por contraseña",
                body: "Ingresa con tu clave maestra de forma rápida sin requerir correo.",
              },
              {
                icon: Sparkles,
                title: "Personalización completa",
                body: "Edita textos, imágenes, títulos, horarios y colores institucionales.",
              },
              {
                icon: ShieldCheck,
                title: "Gestión de correo y avisos",
                body: "Configura Resend, alertas estudiantiles y publicaciones al instante.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brass" strokeWidth={1.75} />
                <div>
                  <p className="font-medium text-cream">{title}</p>
                  <p className="mt-1 leading-relaxed text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          Consola Docente · Control Total
        </p>
      </section>

      {/* Formulario de contraseña */}
      <section className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-sm text-sand transition hover:text-cream lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" /> Sitio público
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brass">
            Acceso interno
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold">
            Entrar al panel
          </h2>
          <p className="mt-2 text-sm text-muted">
            Introduce la contraseña de acceso.
          </p>

          <LoginForm next={typeof next === "string" ? next : ""} />

          <div className="mt-8 rounded-xl border border-line bg-panel p-4 text-xs leading-relaxed text-muted">
            <p className="font-medium text-sand">Contraseña inicial</p>
            <p className="mt-1">
              Clave de acceso por defecto:
            </p>
            <p className="mt-2 font-mono text-[12px] text-brass font-bold">
              Aula#2026
            </p>
            <p className="mt-1.5 text-[11px] text-muted">
              Puedes cambiar esta contraseña en cualquier momento desde el menú <strong>Ajustes</strong> del panel.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

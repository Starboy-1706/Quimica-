import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight, FlaskConical, LogIn } from "lucide-react";
import { MobileMenu } from "@/components/public/mobile-menu";
import type { ProfessorProfile, User } from "@/db/schema";

export type PublicNavSection = "inicio" | "asignaturas" | "agenda";

/** Variables de marca (colores institucionales de site_settings). */
export function brandVars(settings: Record<string, string>): CSSProperties {
  return {
    "--brand": settings.brand_primary || "#0f5e5b",
    "--brand-2": settings.brand_accent || "#c9a03a",
  } as CSSProperties;
}

const NAV_LINKS: Array<{
  id: PublicNavSection;
  href: string;
  label: string;
}> = [
  { id: "inicio", href: "/", label: "Inicio" },
  { id: "asignaturas", href: "/asignaturas", label: "Asignaturas" },
  { id: "agenda", href: "/agenda", label: "Agenda" },
];

type ProfessorInfo = (ProfessorProfile & { user: User }) | undefined;

/**
 * Cabecera pública accesible: landmarks semánticos, enlace de salto al
 * contenido y estado de navegación con aria-current.
 */
export function PublicNav({
  active,
  profile,
  settings,
}: {
  active: PublicNavSection;
  profile: ProfessorInfo;
  settings?: Record<string, string>;
}) {
  const teacherName = profile?.user.fullName ?? "Prof. Wilmer Molina";
  const departmentName =
    profile?.department ?? settings?.institution_name ?? "Departamento de Química";

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
      >
        Saltar al contenido principal
      </a>
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Inicio — Aula docente"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--brand) text-paper">
              <FlaskConical className="h-4.5 w-4.5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-base font-semibold">
                {teacherName}
              </span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
                {departmentName}
              </span>
            </span>
          </Link>
          <nav aria-label="Navegación principal">
            <ul className="flex items-center gap-1 text-sm sm:gap-2">
              {/* Escritorio y tablet: enlaces directos */}
              {NAV_LINKS.map((link) => (
                <li key={link.id} className="hidden sm:block">
                  <Link
                    href={link.href}
                    aria-current={active === link.id ? "page" : undefined}
                    className={`rounded-full px-3.5 py-1.5 transition ${
                      active === link.id
                        ? "bg-ink text-paper"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="hidden sm:block">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-medium transition hover:border-(--brand) hover:text-(--brand)"
                >
                  <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                  Acceso interno
                </Link>
              </li>
              {/* Celular (iPhone / Android): cajón deslizante */}
              <li className="sm:hidden">
                <MobileMenu
                  teacherName={teacherName}
                  departmentName={departmentName}
                />
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}

export function PublicFooter({
  profile,
  settings,
}: {
  profile: ProfessorInfo;
  settings?: Record<string, string>;
}) {
  const year = new Date().getFullYear();
  const defaultText = `© ${year} ${profile?.user.fullName ?? "Prof. Wilmer Molina"} · ${
    profile?.department ?? settings?.institution_name ?? "Departamento de Química"
  } · Aula docente con gestión auditada de contenidos.`;

  const footerLinks = [
    { href: "/", label: "Inicio" },
    { href: "/asignaturas", label: "Asignaturas" },
    { href: "/agenda", label: "Agenda" },
    { href: "/#simulaciones", label: "Simulaciones" },
    { href: "/#avisos", label: "Avisos" },
    { href: "/#consultas", label: "Consulta directa" },
  ];

  return (
    <footer className="border-t border-ink/10" role="contentinfo">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <nav aria-label="Mapa del sitio" className="mb-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition hover:text-(--brand)"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col items-start justify-between gap-4 border-t border-ink/10 pt-6 text-xs text-ink-soft sm:flex-row sm:items-center">
          <p>{settings?.footer_text || defaultText}</p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 transition hover:text-ink"
          >
            Panel docente <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

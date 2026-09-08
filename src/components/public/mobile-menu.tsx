"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarClock,
  FlaskConical,
  Home,
  LogIn,
  Megaphone,
  Menu,
  MessageSquare,
  X,
} from "lucide-react";

const MENU_LINKS = [
  { href: "/", label: "Inicio", desc: "Portada y presentación", icon: Home },
  {
    href: "/asignaturas",
    label: "Asignaturas",
    desc: "Aulas, programas y materiales",
    icon: BookOpen,
  },
  {
    href: "/agenda",
    label: "Agenda",
    desc: "Exámenes y fechas clave",
    icon: CalendarClock,
  },
  {
    href: "/#avisos",
    label: "Avisos",
    desc: "Últimos anuncios del aula",
    icon: Megaphone,
  },
  {
    href: "/#consultas",
    label: "Consulta directa",
    desc: "Envía tu duda al docente",
    icon: MessageSquare,
  },
] as const;

/**
 * Menú móvil del sitio público: botón hamburguesa + cajón deslizante
 * estilo app nativa (áreas táctiles ≥44px, safe-areas, scroll lock y
 * cierre con overlay, Escape o navegación).
 */
export function MobileMenu({
  teacherName,
  departmentName,
}: {
  teacherName: string;
  departmentName: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Cerrar al cambiar de ruta (patrón oficial: ajustar estado durante el render).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Scroll lock + foco accesible al abrir.
  useEffect(() => {
    if (open) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      panelRef.current?.focus();
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [open]);

  // Cerrar con Escape.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú de navegación"
        aria-expanded={open}
        className="touch-target -mr-2 inline-flex items-center justify-center rounded-full border border-ink/15 text-ink transition hover:border-(--brand) hover:text-(--brand) sm:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 sm:hidden" role="dialog" aria-modal="true" aria-label="Menú de navegación">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-night/60 backdrop-blur-[2px]"
          />
          {/* Cajón deslizante */}
          <div
            ref={panelRef}
            tabIndex={-1}
            className="safe-bottom absolute bottom-0 right-0 top-0 flex w-80 max-w-[86vw] animate-[slideIn_0.25s_ease-out] flex-col border-l border-line bg-night text-cream outline-none"
            style={{ animationName: "menuIn" }}
          >
            <style>{`@keyframes menuIn { from { transform: translateX(24px); opacity: 0.4; } to { transform: none; opacity: 1; } }`}</style>
            {/* Cabecera del cajón */}
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brass text-night">
                <FlaskConical className="h-4.5 w-4.5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate font-display text-base font-semibold">
                  {teacherName}
                </p>
                <p className="truncate font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                  {departmentName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú de navegación"
                className="touch-target inline-flex items-center justify-center rounded-full border border-line text-sand transition hover:border-clay/50 hover:text-clay"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Enlaces principales */}
            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Menú móvil">
              <ul className="space-y-1" role="list">
                {MENU_LINKS.map((link, index) => {
                  const active =
                    link.href === "/"
                      ? pathname === "/"
                      : link.href.startsWith("/#")
                        ? false
                        : pathname.startsWith(link.href);
                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition active:scale-[0.99] ${
                          active
                            ? "bg-lift text-brass"
                            : "text-cream/90 active:bg-lift"
                        }`}
                      >
                        <link.icon
                          className={`h-5 w-5 shrink-0 ${active ? "text-brass" : "text-sand"}`}
                          strokeWidth={1.75}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-medium">
                            {link.label}
                          </span>
                          <span className="block text-[11px] text-muted">
                            {link.desc}
                          </span>
                        </span>
                        <span className="font-mono text-[10px] text-muted">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* CTA de acceso interno */}
            <div className="border-t border-line p-4">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-brass text-sm font-semibold text-night transition active:scale-[0.99]"
              >
                <LogIn className="h-4 w-4" />
                Panel docente
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

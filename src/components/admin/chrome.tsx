"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  DatabaseBackup,
  FileStack,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  ScrollText,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import { logoutAction } from "@/server/actions/auth";
import { initials, ROLE_LABELS } from "@/lib/format";
import type { SessionUser } from "@/lib/auth/session";

const NAV_ITEMS = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/admin/cursos", label: "Asignaturas", icon: BookOpen },
  { href: "/admin/materiales", label: "Materiales", icon: FileStack },
  { href: "/admin/avisos", label: "Avisos", icon: Megaphone },
  { href: "/admin/consultas", label: "Consultas", icon: Inbox },
  {
    href: "/admin/usuarios",
    label: "Cuentas",
    icon: Users,
    adminOnly: true,
  },
  { href: "/admin/auditoria", label: "Auditoría", icon: ScrollText },
  { href: "/admin/papelera", label: "Papelera", icon: Trash2 },
  {
    href: "/admin/transferencia",
    label: "Carga y respaldos",
    icon: DatabaseBackup,
    adminOnly: true,
  },
  {
    href: "/admin/ajustes",
    label: "Ajustes",
    icon: Settings,
    adminOnly: true,
  },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function PanelSidebar({
  user,
  newMessages = 0,
}: {
  user: SessionUser;
  newMessages?: number;
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter(
    (item) => !("adminOnly" in item && item.adminOnly) || user.role === "administrador",
  );

  return (
    <>
      {/* Escritorio */}
      <aside className="dark-scroll fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-line bg-coal lg:flex">
        <div className="flex items-center gap-3 border-b border-line px-6 py-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brass text-night">
            <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold text-cream">
              Aula Docente
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted">
              Química · Consola docente
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {items.map((item) => {
            const active = isActive(pathname, item.href, "exact" in item && item.exact);
            const showBadge = item.href === "/admin/consultas" && newMessages > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition ${
                  active
                    ? "bg-lift font-medium text-brass"
                    : "text-sand hover:bg-lift/60 hover:text-cream"
                }`}
              >
                <item.icon className="h-4 w-4" strokeWidth={1.75} />
                {item.label}
                {showBadge ? (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brass px-1.5 font-mono text-[10px] font-bold text-night">
                    {newMessages > 99 ? "99+" : newMessages}
                  </span>
                ) : "adminOnly" in item && item.adminOnly ? (
                  <span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-muted">
                    admin
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3 rounded-xl bg-lift/60 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brass/15 font-display text-sm font-semibold text-brass">
              {initials(user.fullName)}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium text-cream">
                {user.fullName}
              </p>
              <p className="text-[11px] text-muted">
                {ROLE_LABELS[user.role] ?? user.role}
              </p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                title="Cerrar sesión"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-sand transition hover:border-clay/50 hover:text-clay"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Móvil */}
      <header className="sticky top-0 z-20 border-b border-line bg-coal/95 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass text-night">
            <GraduationCap className="h-4 w-4" />
          </span>
          <p className="font-display text-base font-semibold text-cream">
            Aula Docente
          </p>
          <form action={logoutAction} className="ml-auto">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-xs text-sand"
            >
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          </form>
        </div>
        <nav className="dark-scroll flex gap-1 overflow-x-auto px-3 pb-2">
          {items.map((item) => {
            const active = isActive(pathname, item.href, "exact" in item && item.exact);
            const showBadge = item.href === "/admin/consultas" && newMessages > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${
                  active ? "bg-lift text-brass" : "text-sand"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
                {showBadge ? (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brass px-1 font-mono text-[9px] font-bold text-night">
                    {newMessages}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}

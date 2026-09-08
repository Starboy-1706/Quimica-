import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { ContentStatus } from "@/db/schema";
import {
  ROLE_LABELS,
  STATUS_LABELS,
  STATUS_TONES,
  type BadgeTone,
} from "@/lib/format";

/** Primitivas visuales del panel (componentes de servidor). */

const TONE_CLASSES: Record<BadgeTone, string> = {
  gold: "border-brass/40 bg-brass/10 text-brass",
  green: "border-sage/40 bg-sage/10 text-sage",
  slate: "border-line bg-lift text-sand",
  red: "border-clay/40 bg-clay/10 text-clay",
  blue: "border-steel/40 bg-steel/10 text-steel",
};

export function Badge({
  tone = "slate",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <Badge tone={role === "administrador" ? "gold" : "blue"}>
      {ROLE_LABELS[role] ?? role}
    </Badge>
  );
}

export function VersionBadge({ version }: { version: number }) {
  return (
    <span className="font-mono text-[11px] text-muted">v{version}</span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-brass">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-cream sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function Card({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-line bg-panel ${className}`}
    >
      {title ? (
        <header className="border-b border-line px-6 py-4">
          <h2 className="font-display text-lg font-medium text-cream">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-xs text-muted">{description}</p>
          ) : null}
        </header>
      ) : null}
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="animate-rise rounded-2xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
          {label}
        </p>
        <Icon className="h-4 w-4 text-brass" strokeWidth={1.75} />
      </div>
      <p className="mt-3 font-display text-4xl font-semibold text-cream">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
      <Icon className="h-6 w-6 text-muted" strokeWidth={1.5} />
      <p className="font-display text-xl italic text-sand">{title}</p>
      <p className="max-w-sm text-sm text-muted">{description}</p>
    </div>
  );
}

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="dark-scroll overflow-x-auto rounded-2xl border border-line bg-panel">
      <table className="w-full min-w-[720px] text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        {children}
      </tr>
    </thead>
  );
}

export function Th({ children }: { children?: ReactNode }) {
  return <th className="px-5 py-3.5 font-medium">{children}</th>;
}

export function Tr({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-line/60 align-middle transition last:border-0 hover:bg-lift/40">
      {children}
    </tr>
  );
}

export function Td({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <td className={`px-5 py-4 ${className}`}>{children}</td>;
}

export function ActionFormButton({
  children,
  title,
  danger = false,
}: {
  children: ReactNode;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="submit"
      title={title}
      className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium transition ${
        danger
          ? "border-clay/40 text-clay hover:bg-clay/10"
          : "border-line text-sand hover:border-brass/50 hover:text-brass"
      }`}
    >
      {children}
    </button>
  );
}

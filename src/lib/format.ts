import type {
  AnnouncementKind,
  ContactStatus,
  ContentStatus,
  CourseLevel,
  MaterialType,
} from "@/db/schema";

/** Utilidades de presentación compartidas por el panel y el sitio público. */

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

const dateFormatter = new Intl.DateTimeFormat("es", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(
  value: Date | string | null | undefined,
): string {
  if (!value) return "—";
  return dateTimeFormatter.format(new Date(value));
}

/**
 * Marca temporal actual en ms (utilidad opaca para el render:
 * la emite el servidor de forma dinámica, p. ej. trampas antispam).
 */
export function currentTimestampMs(): number {
  return Date.now();
}

export function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/* ── Tipos de insignia ─────────────────────────────────────────────── */

export type BadgeTone = "gold" | "green" | "slate" | "red" | "blue";

/* ── Estado editorial ──────────────────────────────────────────────── */

export const STATUS_LABELS: Record<ContentStatus, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
  archivado: "Archivado",
};

export const STATUS_TONES: Record<ContentStatus, BadgeTone> = {
  borrador: "gold",
  publicado: "green",
  archivado: "slate",
};

export const ROLE_LABELS: Record<string, string> = {
  administrador: "Administrador",
  editor: "Editor / Ayudante",
};

/* ── Categorías del repositorio de materiales ─────────────────────── */

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  apunte: "Apunte",
  guia: "Guía",
  laboratorio: "Guía de prácticas",
  presentacion: "Presentación",
  ejercicios: "Ejercicios resueltos",
  syllabus: "Programa / Syllabus",
  enlace: "Enlace",
};

/* ── Nivel universitario ───────────────────────────────────────────── */

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  grado: "Grado",
  master: "Máster",
  doctorado: "Doctorado",
};

export const COURSE_LEVEL_TONES: Record<CourseLevel, BadgeTone> = {
  grado: "green",
  master: "blue",
  doctorado: "gold",
};

/* ── Tipología de avisos ───────────────────────────────────────────── */

export const ANNOUNCEMENT_KIND_LABELS: Record<AnnouncementKind, string> = {
  general: "General",
  examen: "Examen",
  cambio_aula: "Cambio de aula",
  entrega: "Entrega",
};

export const ANNOUNCEMENT_KIND_TONES: Record<AnnouncementKind, BadgeTone> = {
  general: "slate",
  examen: "red",
  cambio_aula: "blue",
  entrega: "gold",
};

/* ── Bandeja de consultas ──────────────────────────────────────────── */

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  nuevo: "Nueva",
  leido: "Leída",
  respondido: "Respondida",
  archivado: "Archivada",
};

export const CONTACT_STATUS_TONES: Record<ContactStatus, BadgeTone> = {
  nuevo: "gold",
  leido: "blue",
  respondido: "green",
  archivado: "slate",
};

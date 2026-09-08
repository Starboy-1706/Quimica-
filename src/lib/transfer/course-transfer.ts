/**
 * Transferencia de estructuras de cursos — módulo PURO.
 * ------------------------------------------------------------------
 * Formato JSON canónico (`aula-docente/cursos` v1) y variante CSV
 * plana (solo cursos) para reutilizar configuraciones de semestres
 * anteriores. Toda la validación y normalización ocurre aquí, sin
 * dependencias de Node ni de la base de datos.
 */
import type {
  AnnouncementKind,
  CourseLevel,
  CourseSession,
  MaterialType,
} from "@/db/schema";

export const TRANSFER_FORMAT = "aula-docente/cursos";
export const TRANSFER_VERSION = 1;
export const BACKUP_FORMAT = "aula-docente/respaldo";
export const BACKUP_VERSION = 1;
export const MAX_IMPORT_BYTES = 512 * 1024; // 512 KB

const LEVELS: CourseLevel[] = ["grado", "master", "doctorado"];
const MATERIAL_TYPES: MaterialType[] = [
  "apunte",
  "guia",
  "laboratorio",
  "presentacion",
  "ejercicios",
  "syllabus",
  "enlace",
];
const ANNOUNCEMENT_KINDS: AnnouncementKind[] = [
  "general",
  "examen",
  "cambio_aula",
  "entrega",
];

/* ------------------------------------------------------------------ */
/* Tipos del paquete                                                   */
/* ------------------------------------------------------------------ */

export interface ExportedMaterial {
  titulo: string;
  categoria: MaterialType;
  unidad?: string;
  descripcion?: string;
  url: string;
  /** true → el binario vive en el Storage del portal (url interna). */
  esArchivo: boolean;
  nombreArchivo?: string;
  tamanoArchivo?: number;
  estado: string;
  orden: number;
}

export interface ExportedAnnouncement {
  titulo: string;
  cuerpo: string;
  tipo: AnnouncementKind;
  fechaEvento?: string;
  fijado: boolean;
  estado: string;
}

export interface ExportedCourse {
  codigo: string;
  titulo: string;
  nivel: CourseLevel;
  periodo?: string;
  creditos?: number;
  aula?: string;
  horario: CourseSession[];
  descripcion?: string;
  estado: string;
  materiales: ExportedMaterial[];
  avisos: ExportedAnnouncement[];
}

export interface CourseBundle {
  formato: typeof TRANSFER_FORMAT;
  version: number;
  exportadoEn: string;
  incluye: string[];
  cursos: ExportedCourse[];
}

/* ------------------------------------------------------------------ */
/* Normalización de importaciones                                      */
/* ------------------------------------------------------------------ */

export interface NormalizedCourse {
  codigo: string;
  titulo: string;
  nivel: CourseLevel;
  periodo: string | null;
  creditos: number | null;
  aula: string | null;
  horario: CourseSession[];
  descripcion: string | null;
  materiales: ExportedMaterial[];
  avisos: ExportedAnnouncement[];
}

export interface NormalizedImport {
  cursos: NormalizedCourse[];
  resumen: {
    cursos: number;
    materiales: number;
    avisos: number;
    /** Materiales que enlazan archivos del portal de origen. */
    referenciasArchivos: number;
    advertencias: string[];
    codigos: string[];
  };
}

export type NormalizeResult =
  | { ok: true; data: NormalizedImport }
  | { ok: false; error: string };

function asText(value: unknown, max: number): string {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, max);
}

function asCredits(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 40 ? Math.trunc(n) : null;
}

function normalizeHorario(value: unknown): CourseSession[] {
  if (!Array.isArray(value)) return [];
  const sessions: CourseSession[] = [];
  for (const item of value.slice(0, 14)) {
    if (typeof item !== "object" || item === null) continue;
    const record = item as Record<string, unknown>;
    const day = asText(record.day, 20);
    const start = asText(record.start, 5);
    const end = asText(record.end, 5);
    const room = asText(record.room, 60);
    if (!day || !start || !end) continue;
    sessions.push({ day, start, end, room: room || undefined });
  }
  return sessions;
}

function normalizeMaterial(value: unknown): ExportedMaterial | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const titulo = asText(record.titulo, 160);
  if (!titulo) return null;
  const categoriaRaw = asText(record.categoria, 20) as MaterialType;
  const categoria = MATERIAL_TYPES.includes(categoriaRaw)
    ? categoriaRaw
    : "apunte";
  const esArchivo = record.esArchivo === true;
  let url = asText(record.url, 600);
  if (esArchivo) {
    const key = asText(record.url, 600).replace(/^\/archivos\//, "");
    url = key && !key.includes("..") ? `/archivos/${key}` : "";
  } else if (url && !/^https?:\/\//i.test(url)) {
    url = "";
  }
  const tamano = Number(record.tamanoArchivo);
  return {
    titulo,
    categoria,
    unidad: asText(record.unidad, 60) || undefined,
    descripcion: asText(record.descripcion, 600) || undefined,
    url,
    esArchivo,
    nombreArchivo: asText(record.nombreArchivo, 200) || undefined,
    tamanoArchivo:
      Number.isFinite(tamano) && tamano > 0 ? Math.trunc(tamano) : undefined,
    estado: "borrador",
    orden: Number.isFinite(Number(record.orden))
      ? Math.trunc(Number(record.orden))
      : 0,
  };
}

function normalizeAnnouncement(value: unknown): ExportedAnnouncement | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const titulo = asText(record.titulo, 160);
  const cuerpo = asText(record.cuerpo, 2000);
  if (!titulo || !cuerpo) return null;
  const tipoRaw = asText(record.tipo, 20) as AnnouncementKind;
  const fechaRaw = asText(record.fechaEvento, 40);
  let fechaEvento: string | undefined;
  if (fechaRaw) {
    const date = new Date(fechaRaw);
    if (!Number.isNaN(date.getTime())) fechaEvento = date.toISOString();
  }
  return {
    titulo,
    cuerpo,
    tipo: ANNOUNCEMENT_KINDS.includes(tipoRaw) ? tipoRaw : "general",
    fechaEvento,
    fijado: record.fijado === true,
    estado: "borrador",
  };
}

/** Normaliza un paquete JSON del formato `aula-docente/cursos` v1. */
export function normalizeJsonImport(raw: unknown): NormalizeResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "El archivo no contiene un objeto JSON válido." };
  }
  const bundle = raw as Partial<CourseBundle>;
  if (bundle.formato !== TRANSFER_FORMAT) {
    return {
      ok: false,
      error: `Formato no reconocido. Se esperaba «${TRANSFER_FORMAT}». Exporta la estructura desde esta misma herramienta.`,
    };
  }
  if (typeof bundle.version !== "number" || bundle.version > TRANSFER_VERSION) {
    return {
      ok: false,
      error: "Versión del paquete no soportada por esta instalación.",
    };
  }
  if (!Array.isArray(bundle.cursos)) {
    return { ok: false, error: "El paquete no contiene la lista «cursos»." };
  }

  const advertencias: string[] = [];
  const vistos = new Set<string>();
  const cursos: NormalizedCourse[] = [];
  const rawCourses: unknown[] = bundle.cursos;

  for (const item of rawCourses.slice(0, 100)) {
    if (typeof item !== "object" || item === null) continue;
    const record = item as Record<string, unknown>;
    const codigo = asText(record.codigo, 20).toUpperCase();
    const titulo = asText(record.titulo, 160);
    if (!codigo || !titulo) {
      advertencias.push("Se omitió un curso sin código o sin título.");
      continue;
    }
    if (vistos.has(codigo)) {
      advertencias.push(`Código duplicado dentro del archivo: ${codigo}.`);
      continue;
    }
    vistos.add(codigo);

    const nivelRaw = asText(record.nivel, 20) as CourseLevel;
    const nivel = LEVELS.includes(nivelRaw) ? nivelRaw : "grado";
    if (!LEVELS.includes(nivelRaw)) {
      advertencias.push(`${codigo}: nivel «${nivelRaw}» no válido, se usó «grado».`);
    }

    const materiales = (Array.isArray(record.materiales)
      ? record.materiales
      : []
    )
      .map(normalizeMaterial)
      .filter((m): m is ExportedMaterial => m !== null);

    const avisos = (Array.isArray(record.avisos) ? record.avisos : [])
      .map(normalizeAnnouncement)
      .filter((a): a is ExportedAnnouncement => a !== null);

    cursos.push({
      codigo,
      titulo,
      nivel,
      periodo: asText(record.periodo, 20) || null,
      creditos: asCredits(record.creditos),
      aula: asText(record.aula, 60) || null,
      horario: normalizeHorario(record.horario),
      descripcion: asText(record.descripcion, 2000) || null,
      materiales,
      avisos,
    });
  }

  if (cursos.length === 0) {
    return { ok: false, error: "El paquete no contiene cursos aprovechables." };
  }

  return {
    ok: true,
    data: {
      cursos,
      resumen: {
        cursos: cursos.length,
        materiales: cursos.reduce((acc, c) => acc + c.materiales.length, 0),
        avisos: cursos.reduce((acc, c) => acc + c.avisos.length, 0),
        referenciasArchivos: cursos.reduce(
          (acc, c) => acc + c.materiales.filter((m) => m.esArchivo).length,
          0,
        ),
        advertencias,
        codigos: cursos.map((c) => c.codigo),
      },
    },
  };
}

/* ------------------------------------------------------------------ */
/* CSV (solo cursos, separador «;»)                                    */
/* ------------------------------------------------------------------ */

export const CSV_HEADER = [
  "codigo",
  "titulo",
  "nivel",
  "periodo",
  "creditos",
  "aula",
  "horario",
  "descripcion",
] as const;

export function horarioTexto(sessions: CourseSession[]): string {
  return sessions
    .map((session) =>
      `${session.day} ${session.start}-${session.end}${session.room ? ` @ ${session.room}` : ""}`,
    )
    .join(" | ");
}

export function parseHorarioTexto(texto: string): CourseSession[] {
  const sessions: CourseSession[] = [];
  for (const chunk of texto.split("|").slice(0, 14)) {
    const match = chunk
      .trim()
      .match(/^(\S+)\s+(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})(?:\s*@\s*(.+))?$/);
    if (!match) continue;
    const [, day, start, end, room] = match;
    sessions.push({
      day: day.slice(0, 20),
      start,
      end,
      room: room?.trim().slice(0, 60) || undefined,
    });
  }
  return sessions;
}

function csvCell(value: string): string {
  const needsQuote = /[";\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}

/** Genera el CSV de cursos (una fila por asignatura, sin materiales). */
export function bundleToCsv(cursos: ExportedCourse[]): string {
  const rows = [CSV_HEADER.join(";")];
  for (const course of cursos) {
    rows.push(
      [
        csvCell(course.codigo),
        csvCell(course.titulo),
        csvCell(course.nivel),
        csvCell(course.periodo ?? ""),
        csvCell(course.creditos !== undefined ? String(course.creditos) : ""),
        csvCell(course.aula ?? ""),
        csvCell(horarioTexto(course.horario)),
        csvCell(course.descripcion ?? ""),
      ].join(";"),
    );
  }
  return rows.join("\r\n") + "\r\n";
}

/** Parsea texto CSV respetando comillas y separador «;». */
export function splitCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  const normalized = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i];
    if (inQuotes) {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ";") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && normalized[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

/** Normaliza un CSV de cursos al mismo formato intermedio que el JSON. */
export function parseCsvImport(text: string): NormalizeResult {
  const rows = splitCsvRows(text);
  if (rows.length < 2) {
    return {
      ok: false,
      error: "El CSV no tiene datos (se esperan cabecera + filas).",
    };
  }
  const header = rows[0].map((cell) => asText(cell, 30).toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  if (idx("codigo") === -1 || idx("titulo") === -1) {
    return {
      ok: false,
      error: "El CSV debe incluir al menos las columnas «codigo» y «titulo».",
    };
  }

  const advertencias: string[] = [];
  const vistos = new Set<string>();
  const cursos: NormalizedCourse[] = [];

  for (const row of rows.slice(1, 101)) {
    const codigo = asText(row[idx("codigo")], 20).toUpperCase();
    const titulo = asText(row[idx("titulo")], 160);
    if (!codigo || !titulo) {
      advertencias.push("Fila omitida por falta de código o título.");
      continue;
    }
    if (vistos.has(codigo)) {
      advertencias.push(`Código duplicado dentro del CSV: ${codigo}.`);
      continue;
    }
    vistos.add(codigo);

    const nivelIdx = idx("nivel");
    const nivelRaw = (
      nivelIdx >= 0 ? asText(row[nivelIdx], 20) : ""
    ) as CourseLevel;
    cursos.push({
      codigo,
      titulo,
      nivel: LEVELS.includes(nivelRaw) ? nivelRaw : "grado",
      periodo:
        (idx("periodo") >= 0 ? asText(row[idx("periodo")], 20) : "") || null,
      creditos:
        idx("creditos") >= 0 ? asCredits(row[idx("creditos")]) : null,
      aula: (idx("aula") >= 0 ? asText(row[idx("aula")], 60) : "") || null,
      horario:
        idx("horario") >= 0
          ? parseHorarioTexto(asText(row[idx("horario")], 300))
          : [],
      descripcion:
        (idx("descripcion") >= 0
          ? asText(row[idx("descripcion")], 2000)
          : "") || null,
      materiales: [],
      avisos: [],
    });
  }

  if (cursos.length === 0) {
    return { ok: false, error: "Ninguna fila del CSV produjo un curso válido." };
  }

  return {
    ok: true,
    data: {
      cursos,
      resumen: {
        cursos: cursos.length,
        materiales: 0,
        avisos: 0,
        referenciasArchivos: 0,
        advertencias,
        codigos: cursos.map((c) => c.codigo),
      },
    },
  };
}

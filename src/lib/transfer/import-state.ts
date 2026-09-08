import type { NormalizedImport } from "@/lib/transfer/course-transfer";

/**
 * Estados del asistente de importación — módulo PURO.
 * (Las Server Actions solo pueden exportar funciones async, por eso los
 * estados iniciales y tipos viven aquí y no en el archivo «use server».)
 */
export type ImportPreviewState = {
  status: "idle" | "error" | "preview";
  error: string | null;
  fileName?: string;
  resumen?: NormalizedImport["resumen"];
  /** Paquete normalizado (JSON string) para el paso de ejecución. */
  payload?: string;
};

export type ImportExecuteState = {
  status: "idle" | "error" | "done";
  error: string | null;
  creados?: Array<{ codigo: string; titulo: string }>;
  omitidos?: Array<{ codigo: string; motivo: string }>;
  materiales?: number;
  avisos?: number;
};

export const idlePreview: ImportPreviewState = { status: "idle", error: null };
export const idleExecute: ImportExecuteState = { status: "idle", error: null };

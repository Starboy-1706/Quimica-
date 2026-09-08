/**
 * Reglas de validación de subida de archivos — módulo PURO.
 * Se comparte entre el navegador (UX) y el servidor (validación real).
 * No importar nada de node:* aquí.
 */

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_BULK_FILES = 20;

/** Extensiones permitidas → MIME types aceptados. */
export const ALLOWED_UPLOAD_TYPES: Record<string, string[]> = {
  pdf: ["application/pdf"],
  pptx: [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  ppt: ["application/vnd.ms-powerpoint"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  doc: ["application/msword"],
  xlsx: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  xls: ["application/vnd.ms-excel"],
  zip: ["application/zip", "application/x-zip-compressed"],
  csv: ["text/csv", "text/plain", "application/vnd.ms-excel"],
  txt: ["text/plain"],
  md: ["text/plain", "text/markdown"],
  py: ["text/plain", "text/x-python"],
  ipynb: ["application/json", "text/plain"],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
};

export const ALLOWED_UPLOAD_EXTENSIONS = Object.keys(ALLOWED_UPLOAD_TYPES);

/** MIME a usar al SERVIR el archivo (Content-Type de respuesta). */
export const SERVE_MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  zip: "application/zip",
  csv: "text/csv; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  py: "text/plain; charset=utf-8",
  ipynb: "application/json",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

/**
 * Firmas mágicas exigibles por extensión (verificación de contenido
 * real, no solo del nombre declarado). Si la extensión no está aquí,
 * no se exige firma (formatos de texto).
 */
export const MAGIC_SIGNATURES: Array<{ ext: string[]; bytes: number[] }> = [
  { ext: ["pdf"], bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { ext: ["pptx", "docx", "xlsx", "zip"], bytes: [0x50, 0x4b, 0x03, 0x04] }, // PK\x03\x04
  { ext: ["ppt", "doc", "xls"], bytes: [0xd0, 0xcf, 0x11, 0xe0] }, // OLE Compound
  { ext: ["png"], bytes: [0x89, 0x50, 0x4e, 0x47] }, // ‰PNG
  { ext: ["jpg", "jpeg"], bytes: [0xff, 0xd8, 0xff] }, // JFIF
];

export function fileExtension(name: string): string {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? (parts.pop() ?? "") : "";
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateUploadMeta(
  name: string,
  mime: string,
  size: number,
): { ok: true; ext: string } | { ok: false; error: string } {
  const ext = fileExtension(name);
  if (!ext || !(ext in ALLOWED_UPLOAD_TYPES)) {
    return {
      ok: false,
      error: `Extensión «.${ext}» no permitida. Admitidas: ${ALLOWED_UPLOAD_EXTENSIONS.join(", ")}.`,
    };
  }
  if (size <= 0) {
    return { ok: false, error: "El archivo está vacío." };
  }
  if (size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `«${name}» supera el límite de ${formatBytes(MAX_UPLOAD_BYTES)}.`,
    };
  }
  const acceptedMimes = ALLOWED_UPLOAD_TYPES[ext];
  if (mime && !acceptedMimes.includes(mime)) {
    return {
      ok: false,
      error: `El tipo MIME «${mime}» no corresponde a un archivo .${ext}.`,
    };
  }
  return { ok: true, ext };
}

import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { slugify } from "@/lib/format";
import {
  MAGIC_SIGNATURES,
  SERVE_MIME_BY_EXT,
  fileExtension,
} from "@/lib/upload-rules";

/**
 * Capa de almacenamiento de archivos académicos.
 * ------------------------------------------------------------------
 * Driver activo:
 *  - **Supabase Storage** si existen `NEXT_PUBLIC_SUPABASE_URL` y
 *    `SUPABASE_SERVICE_ROLE_KEY` (bucket privado, entrega con URLs
 *    firmadas de 5 minutos → nada de enlaces directos permanentes).
 *  - **Local** (`.storage/`) como reserva para desarrollo/preview.
 *
 * En AMBOS casos los archivos se sirven únicamente a través de la ruta
 * protegida `/archivos/[...key]`, que aplica el control de acceso:
 * contenido publicado = público; borrador/archivado = solo personal
 * del aula autenticado.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "materiales";
const LOCAL_DIR = process.env.STORAGE_DIR ?? path.join(process.cwd(), ".storage");

export function usingSupabaseStorage(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

export function storageDriverLabel(): string {
  return usingSupabaseStorage()
    ? `Supabase Storage (bucket «${STORAGE_BUCKET}»)`
    : `Almacenamiento local (${LOCAL_DIR})`;
}

async function supabaseClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(SUPABASE_URL!, SUPABASE_KEY!, {
    auth: { persistSession: false },
  });
}

/** Clave de almacenamiento única, segura, plana (sin directorios) y legible. */
export function buildStorageKey(originalName: string): string {
  const ext = fileExtension(originalName);
  const base =
    slugify(originalName.replace(new RegExp(`\\.${ext}$`, "i"), "")) ||
    "archivo";
  const stamp = new Date().toISOString().slice(0, 10);
  const rand = randomBytes(4).toString("hex");
  return `${stamp}-${rand}-${base}.${ext}`;
}

/** Verificación de firma mágica (contenido real vs. extensión declarada). */
export function passesMagicSniff(ext: string, data: Buffer): boolean {
  const signature = MAGIC_SIGNATURES.find((sig) => sig.ext.includes(ext));
  if (!signature) return true; // formatos de texto: sin firma exigible
  if (data.length < signature.bytes.length) return false;
  return signature.bytes.every((byte, index) => data[index] === byte);
}

/** Persiste el binario validado bajo `key`. */
export async function storeFile(
  key: string,
  data: Buffer,
  contentType: string,
): Promise<void> {
  if (usingSupabaseStorage()) {
    const client = await supabaseClient();
    const { error } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(key, data, { contentType, upsert: false });
    if (error) {
      throw new Error(`Supabase Storage: ${error.message}`);
    }
    return;
  }
  const target = path.join(LOCAL_DIR, key);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, data);
}

export type ServedFile =
  | { kind: "redirect"; url: string }
  | { kind: "inline"; data: Buffer; contentType: string };

/**
 * Entrega el archivo. En Supabase firma una URL temporal (bucket
 * privado) y redirige; en local lee el binario del disco.
 */
export async function serveFile(key: string): Promise<ServedFile> {
  const ext = fileExtension(key);
  if (usingSupabaseStorage()) {
    const client = await supabaseClient();
    const { data, error } = await client.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(key, 300); // 5 minutos
    if (error || !data?.signedUrl) {
      throw new Error(`Supabase Storage: ${error?.message ?? "sin URL"}`);
    }
    return { kind: "redirect", url: data.signedUrl };
  }
  const data = await readFile(path.join(LOCAL_DIR, key));
  return {
    kind: "inline",
    data,
    contentType: SERVE_MIME_BY_EXT[ext] ?? "application/octet-stream",
  };
}

/** Eliminación física (purgado desde la papelera). Mejor esfuerzo. */
export async function removeFile(key: string): Promise<void> {
  try {
    if (usingSupabaseStorage()) {
      const client = await supabaseClient();
      await client.storage.from(STORAGE_BUCKET).remove([key]);
      return;
    }
    await unlink(path.join(LOCAL_DIR, key));
  } catch {
    /* mejor esfuerzo */
  }
}

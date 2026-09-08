import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  buildStorageKey,
  passesMagicSniff,
  storeFile,
} from "@/lib/storage";
import { validateUploadMeta, MAX_UPLOAD_BYTES } from "@/lib/upload-rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/upload — subida individual de archivos académicos.
 * Requiere sesión activa. Validación en tres capas:
 * extensión + MIME declarado, límite de tamaño y firma mágica.
 * El archivo NO queda expuesto directamente: solo se sirve vía
 * /archivos/[key] con control de acceso.
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la petición inválido." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Falta el archivo (campo «file»)." },
      { status: 400 },
    );
  }

  const meta = validateUploadMeta(file.name, file.type, file.size);
  if (!meta.ok) {
    return NextResponse.json({ error: meta.error }, { status: 422 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "El archivo supera el límite permitido." },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!passesMagicSniff(meta.ext, buffer)) {
    return NextResponse.json(
      {
        error:
          "El contenido del archivo no coincide con su extensión (firmas inválidas).",
      },
      { status: 422 },
    );
  }

  const key = buildStorageKey(file.name);
  try {
    await storeFile(key, buffer, file.type || "application/octet-stream");
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo almacenar el archivo.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    key,
    url: `/archivos/${key}`,
    name: file.name,
    size: file.size,
  });
}

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  buildStorageKey,
  passesMagicSniff,
  storeFile,
} from "@/lib/storage";
import { validateSiteImageMeta } from "@/lib/upload-rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/site-image
 * Subida explícita de una imagen editorial desde el dispositivo del
 * administrador. No acepta URLs remotas ni formatos ajenos a imágenes web.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (user.role !== "administrador") {
    return NextResponse.json(
      { error: "Solo el administrador puede cambiar imágenes del portal." },
      { status: 403 },
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Selecciona una imagen desde tu dispositivo." },
      { status: 400 },
    );
  }

  const meta = validateSiteImageMeta(file.name, file.type, file.size);
  if (!meta.ok) {
    return NextResponse.json({ error: meta.error }, { status: 422 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!passesMagicSniff(meta.ext, buffer)) {
    return NextResponse.json(
      { error: "El archivo no contiene una imagen válida del formato indicado." },
      { status: 422 },
    );
  }

  const key = buildStorageKey(`imagen-sitio-${file.name}`);
  try {
    await storeFile(key, buffer, file.type);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo almacenar la imagen.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    key,
    url: `/imagenes/${key}`,
    name: file.name,
    size: file.size,
  });
}

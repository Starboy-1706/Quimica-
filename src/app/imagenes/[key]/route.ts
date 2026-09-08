import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { professorProfile, siteSettings } from "@/db/schema";
import { serveFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function notFound(): Response {
  return new Response("Imagen no encontrada.", { status: 404 });
}

function settingString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Entrega pública de imágenes editoriales.
 * Solo permite archivos actualmente referenciados por la portada o el
 * perfil docente; una clave arbitraria de Storage nunca queda expuesta.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  if (
    !key ||
    key.includes("..") ||
    key.includes("/") ||
    key.includes("\\") ||
    key.length > 300 ||
    !/^[a-zA-Z0-9._-]+$/.test(key)
  ) {
    return notFound();
  }

  const expectedUrl = `/imagenes/${key}`;
  const [settingsRows, profiles] = await Promise.all([
    db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(
        inArray(siteSettings.key, ["hero_image_url", "about_image_url"]),
      ),
    db.select({ avatarUrl: professorProfile.avatarUrl }).from(professorProfile),
  ]);

  const isReferenced =
    settingsRows.some((row) => settingString(row.value) === expectedUrl) ||
    profiles.some((profile) => profile.avatarUrl === expectedUrl);
  if (!isReferenced) return notFound();

  try {
    const served = await serveFile(key);
    if (served.kind === "redirect") {
      return Response.redirect(served.url, 307);
    }
    return new Response(new Uint8Array(served.data), {
      headers: {
        "Content-Type": served.contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return notFound();
  }
}

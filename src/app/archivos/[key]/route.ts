import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { courseMaterials } from "@/db/schema";
import { getSessionUser } from "@/lib/auth/session";
import { serveFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function notFound(): Response {
  return new Response("Recurso no encontrado.", { status: 404 });
}

/**
 * GET /archivos/[key] — entrega protegida de archivos académicos.
 * ------------------------------------------------------------------
 * Nunca se exponen enlaces directos al Storage:
 *  - Material **publicado** y fuera de la papelera → acceso público.
 *  - Borrador / archivado → solo personal autenticado del aula.
 *  - Claves inexistentes o no registradas como material → 404
 *    (no se filtra ninguna información del almacenamiento).
 * En Supabase el bucket es privado y se entrega con URL firmada (307).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;

  // Anti path-traversal y claves malformadas.
  if (
    !key ||
    key.includes("..") ||
    key.includes("/") ||
    key.includes("\\") ||
    key.length > 300
  ) {
    return notFound();
  }

  const [material] = await db
    .select()
    .from(courseMaterials)
    .where(
      and(eq(courseMaterials.fileKey, key), isNull(courseMaterials.deletedAt)),
    )
    .limit(1);

  if (!material) return notFound();

  const isPublic = material.status === "publicado";
  if (!isPublic) {
    const user = await getSessionUser();
    if (!user) return notFound();
  }

  let served;
  try {
    served = await serveFile(key);
  } catch {
    return notFound();
  }

  if (served.kind === "redirect") {
    return Response.redirect(served.url, 307);
  }

  const fileName = (material.fileName ?? "archivo").replace(/[\r\n"]/g, "_");
  return new Response(new Uint8Array(served.data), {
    headers: {
      "Content-Type": served.contentType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
      "Cache-Control": isPublic
        ? "private, max-age=60"
        : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

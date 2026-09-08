import { NextResponse, type NextRequest } from "next/server";
import { asc, isNull } from "drizzle-orm";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { AUDIT_ACTIONS, recordAuditLog } from "@/lib/audit";
import { getSessionUser } from "@/lib/auth/session";
import {
  bundleToCsv,
  TRANSFER_FORMAT,
  TRANSFER_VERSION,
  type CourseBundle,
  type ExportedCourse,
} from "@/lib/transfer/course-transfer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function stamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

/**
 * GET /api/admin/export/cursos?formato=json|csv
 * Descarga la estructura completa de asignaturas (con materiales y
 * avisos, incluidos los metadatos de archivos) para reutilizarla en
 * próximos ciclolectivos. Solo Administrador.
 */
export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (user.role !== "administrador") {
    return NextResponse.json(
      { error: "Solo el administrador puede exportar la estructura." },
      { status: 403 },
    );
  }

  const formato = request.nextUrl.searchParams.get("formato") === "csv"
    ? "csv"
    : "json";

  const allCourses = await db.query.courses.findMany({
    where: isNull(courses.deletedAt),
    orderBy: [asc(courses.code)],
    with: {
      materials: {
        where: (fields, { isNull: isNullOp }) => isNullOp(fields.deletedAt),
        orderBy: (fields, { asc: ascOp }) => [
          ascOp(fields.sortOrder),
          ascOp(fields.title),
        ],
      },
      announcements: {
        where: (fields, { isNull: isNullOp }) => isNullOp(fields.deletedAt),
        orderBy: (fields, { desc: descOp }) => [descOp(fields.pinned)],
      },
    },
  });

  const exportedCourses: ExportedCourse[] = allCourses.map((course) => ({
    codigo: course.code,
    titulo: course.title,
    nivel: course.level,
    periodo: course.term ?? undefined,
    creditos: course.credits ?? undefined,
    aula: course.room ?? undefined,
    horario: course.schedule ?? [],
    descripcion: course.description ?? undefined,
    estado: course.status,
    materiales: course.materials.map((material) => ({
      titulo: material.title,
      categoria: material.type,
      unidad: material.unit ?? undefined,
      descripcion: material.description ?? undefined,
      url: material.url,
      esArchivo: Boolean(material.fileKey),
      nombreArchivo: material.fileName ?? undefined,
      tamanoArchivo: material.fileSize ?? undefined,
      estado: material.status,
      orden: material.sortOrder,
    })),
    avisos: course.announcements.map((announcement) => ({
      titulo: announcement.title,
      cuerpo: announcement.body,
      tipo: announcement.kind,
      fechaEvento: announcement.eventDate
        ? announcement.eventDate.toISOString()
        : undefined,
      fijado: announcement.pinned,
      estado: announcement.status,
    })),
  }));

  const bundle: CourseBundle = {
    formato: TRANSFER_FORMAT,
    version: TRANSFER_VERSION,
    exportadoEn: new Date().toISOString(),
    incluye:
      formato === "json"
        ? ["cursos", "materiales", "avisos", "metadatos-archivos"]
        : ["cursos"],
    cursos: exportedCourses,
  };

  await recordAuditLog({
    actor: user,
    action: AUDIT_ACTIONS.EXPORT_COURSES,
    entity: "course",
    summary: `${user.fullName} exportó la estructura de ${exportedCourses.length} cursos en formato ${formato.toUpperCase()}`,
    metadata: {
      formato,
      cursos: exportedCourses.length,
      materiales: exportedCourses.reduce((acc, c) => acc + c.materiales.length, 0),
      avisos: exportedCourses.reduce((acc, c) => acc + c.avisos.length, 0),
    },
  });

  if (formato === "csv") {
    const csv = bundleToCsv(exportedCourses);
    return new Response(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="aula-cursos-${stamp()}.csv"`,
      },
    });
  }

  return new Response(JSON.stringify(bundle, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="aula-cursos-${stamp()}.json"`,
    },
  });
}

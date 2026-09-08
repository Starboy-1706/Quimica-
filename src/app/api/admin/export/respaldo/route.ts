import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  auditLogs,
  contactMessages,
  contentVersions,
  courseAnnouncements,
  courseMaterials,
  courses,
  professorProfile,
  siteSettings,
  userSessions,
  users,
} from "@/db/schema";
import { AUDIT_ACTIONS, recordAuditLog } from "@/lib/audit";
import { getSessionUser } from "@/lib/auth/session";
import { BACKUP_FORMAT, BACKUP_VERSION } from "@/lib/transfer/course-transfer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function stamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

/**
 * GET /api/admin/export/respaldo — respaldo completo del portal.
 * Serializa todas las tablas de contenido y configuración (incluidos
 * los METADATOS de los archivos subidos; los binarios viven en el
 * Storage y se respaldan aparte).
 *
 * Sensible: incluye los hashes de contraseña (scrypt, no reversibles)
 * para permitir una restauración funcional. Manipular con cuidado.
 * Solo Administrador.
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (user.role !== "administrador") {
    return NextResponse.json(
      { error: "Solo el administrador puede generar respaldos." },
      { status: 403 },
    );
  }

  const [
    usersR,
    sessionsR,
    profileR,
    coursesR,
    materialsR,
    announcementsR,
    settingsR,
    messagesR,
    versionsR,
    auditR,
  ] = await Promise.all([
    db.select().from(users),
    db.select().from(userSessions),
    db.select().from(professorProfile),
    db.select().from(courses),
    db.select().from(courseMaterials),
    db.select().from(courseAnnouncements),
    db.select().from(siteSettings),
    db.select().from(contactMessages),
    db.select().from(contentVersions),
    db.select().from(auditLogs),
  ]);

  // Las sesiones se respaldan sin el hash del token (no reutilizable).
  const sessionsSafe = sessionsR.map(
    ({ id, userId, userAgent, ipAddress, createdAt, lastSeenAt, expiresAt, revokedAt }) => ({
      id,
      userId,
      userAgent,
      ipAddress,
      createdAt,
      lastSeenAt,
      expiresAt,
      revokedAt,
    }),
  );

  const backup = {
    formato: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    generadoEn: new Date().toISOString(),
    generadoPor: user.email,
    advertencias: [
      "Contiene hashes de contraseñas (scrypt): almacena este archivo en un lugar seguro.",
      "Los binarios de los archivos subidos NO se incluyen; aquí constan solo sus metadatos (fileKey, nombre, tamaño).",
    ],
    conteos: {
      users: usersR.length,
      user_sessions: sessionsSafe.length,
      professor_profile: profileR.length,
      courses: coursesR.length,
      course_materials: materialsR.length,
      course_announcements: announcementsR.length,
      site_settings: settingsR.length,
      contact_messages: messagesR.length,
      content_versions: versionsR.length,
      audit_logs: auditR.length,
    },
    datos: {
      users: usersR,
      user_sessions: sessionsSafe,
      professor_profile: profileR,
      courses: coursesR,
      course_materials: materialsR,
      course_announcements: announcementsR,
      site_settings: settingsR,
      contact_messages: messagesR,
      content_versions: versionsR,
      audit_logs: auditR,
    },
  };

  const payload = JSON.stringify(backup);

  await recordAuditLog({
    actor: user,
    action: AUDIT_ACTIONS.EXPORT_BACKUP,
    entity: "system",
    summary: `${user.fullName} generó el respaldo completo del portal (${backup.conteos.courses} cursos, ${backup.conteos.course_materials} materiales, ${backup.conteos.content_versions} versiones)`,
    metadata: {
      bytes: Buffer.byteLength(payload, "utf8"),
      conteos: backup.conteos,
    },
  });

  return new Response(payload, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="aula-respaldo-${stamp()}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}

import { headers } from "next/headers";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import type { SessionUser } from "@/lib/auth/session";

/**
 * Sistema de auditoría — helper global.
 * ------------------------------------------------------------------
 * Toda acción administrativa (subir material, modificar un curso,
 * publicar un aviso, responder consultas, gestionar la papelera…) debe
 * registrarse llamando a `recordAuditLog`. El helper captura de forma
 * automática: quién actuó, su rol, la acción, la entidad afectada,
 * un resumen legible, metadatos, IP y user-agent.
 *
 * La auditoría nunca interrumpe el flujo principal: un fallo al
 * registrar se reporta por consola y no rompe la acción del usuario.
 */
export const AUDIT_ACTIONS = {
  // Autenticación
  LOGIN: "auth.iniciar_sesion",
  LOGIN_FAILED: "auth.intento_fallido",
  LOGIN_BLOCKED: "auth.cuenta_suspendida",
  LOGOUT: "auth.cerrar_sesion",
  // Cursos
  COURSE_CREATED: "curso.crear",
  COURSE_UPDATED: "curso.actualizar",
  COURSE_STATUS: "curso.cambiar_estado",
  COURSE_DELETED: "curso.eliminar",
  // Materiales
  MATERIAL_CREATED: "material.crear",
  MATERIAL_STATUS: "material.cambiar_estado",
  MATERIAL_DELETED: "material.eliminar",
  // Avisos
  ANNOUNCEMENT_CREATED: "aviso.crear",
  ANNOUNCEMENT_STATUS: "aviso.cambiar_estado",
  ANNOUNCEMENT_PINNED: "aviso.fijar",
  ANNOUNCEMENT_DELETED: "aviso.eliminar",
  // Papelera lógica
  CONTENT_RESTORED: "contenido.restaurar",
  CONTENT_PURGED: "contenido.purgar",
  // Bandeja de consultas
  MESSAGE_RECEIVED: "consulta.recibida",
  MESSAGE_SPAM: "consulta.descartada_antispam",
  MESSAGE_READ: "consulta.leida",
  MESSAGE_REPLIED: "consulta.respondida",
  MESSAGE_ARCHIVED: "consulta.archivada",
  // Usuarios
  USER_CREATED: "usuario.crear",
  USER_STATUS: "usuario.cambiar_estado",
  // Configuración
  SETTINGS_UPDATED: "ajustes.actualizar",
  PROFILE_UPDATED: "perfil.actualizar",
  // Transferencia y respaldos
  EXPORT_COURSES: "exportacion.cursos",
  EXPORT_BACKUP: "exportacion.respaldo",
  IMPORT_COURSES: "importacion.cursos",
  // Notificaciones por correo
  NOTIFICATION_TEST: "notificacion.prueba",
  // Sistema (semilla)
  SYSTEM_SEED: "sistema.inicializar",
} as const;

export type AuditAction =
  (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

/** Etiquetas en español para mostrar en la bitácora del panel. */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  [AUDIT_ACTIONS.LOGIN]: "Inicio de sesión",
  [AUDIT_ACTIONS.LOGIN_FAILED]: "Intento fallido",
  [AUDIT_ACTIONS.LOGIN_BLOCKED]: "Cuenta suspendida",
  [AUDIT_ACTIONS.LOGOUT]: "Cierre de sesión",
  [AUDIT_ACTIONS.COURSE_CREATED]: "Curso creado",
  [AUDIT_ACTIONS.COURSE_UPDATED]: "Curso actualizado",
  [AUDIT_ACTIONS.COURSE_STATUS]: "Estado de curso",
  [AUDIT_ACTIONS.COURSE_DELETED]: "Curso a la papelera",
  [AUDIT_ACTIONS.MATERIAL_CREATED]: "Material creado",
  [AUDIT_ACTIONS.MATERIAL_STATUS]: "Estado de material",
  [AUDIT_ACTIONS.MATERIAL_DELETED]: "Material a la papelera",
  [AUDIT_ACTIONS.ANNOUNCEMENT_CREATED]: "Aviso creado",
  [AUDIT_ACTIONS.ANNOUNCEMENT_STATUS]: "Estado de aviso",
  [AUDIT_ACTIONS.ANNOUNCEMENT_PINNED]: "Aviso fijado",
  [AUDIT_ACTIONS.ANNOUNCEMENT_DELETED]: "Aviso a la papelera",
  [AUDIT_ACTIONS.CONTENT_RESTORED]: "Contenido restaurado",
  [AUDIT_ACTIONS.CONTENT_PURGED]: "Contenido purgado",
  [AUDIT_ACTIONS.MESSAGE_RECEIVED]: "Consulta recibida",
  [AUDIT_ACTIONS.MESSAGE_SPAM]: "Spam descartado",
  [AUDIT_ACTIONS.MESSAGE_READ]: "Consulta leída",
  [AUDIT_ACTIONS.MESSAGE_REPLIED]: "Consulta respondida",
  [AUDIT_ACTIONS.MESSAGE_ARCHIVED]: "Consulta archivada",
  [AUDIT_ACTIONS.USER_CREATED]: "Cuenta creada",
  [AUDIT_ACTIONS.USER_STATUS]: "Estado de cuenta",
  [AUDIT_ACTIONS.SETTINGS_UPDATED]: "Ajustes del sitio",
  [AUDIT_ACTIONS.PROFILE_UPDATED]: "Perfil docente",
  [AUDIT_ACTIONS.EXPORT_COURSES]: "Exportación de cursos",
  [AUDIT_ACTIONS.EXPORT_BACKUP]: "Respaldo completo",
  [AUDIT_ACTIONS.IMPORT_COURSES]: "Importación de cursos",
  [AUDIT_ACTIONS.NOTIFICATION_TEST]: "Correo de prueba",
  [AUDIT_ACTIONS.SYSTEM_SEED]: "Inicialización",
};

export type AuditActor = Pick<SessionUser, "id" | "email" | "role"> | null;

export type AuditEntry = {
  actor: AuditActor;
  action: AuditAction | string;
  entity:
    | "course"
    | "course_material"
    | "course_announcement"
    | "contact_message"
    | "site_setting"
    | "professor_profile"
    | "session"
    | "user"
    | "system";
  entityId?: string | null;
  summary?: string;
  metadata?: Record<string, unknown>;
};

/** IP y user-agent de la request actual (si existe contexto HTTP). */
export async function getRequestMeta(): Promise<{
  ipAddress: string | null;
  userAgent: string | null;
}> {
  try {
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    const ip =
      forwarded?.split(",")[0]?.trim() ?? headerList.get("x-real-ip") ?? null;
    return { ipAddress: ip, userAgent: headerList.get("user-agent") };
  } catch {
    return { ipAddress: null, userAgent: null };
  }
}

export async function recordAuditLog(entry: AuditEntry): Promise<void> {
  try {
    const meta = await getRequestMeta();
    await db.insert(auditLogs).values({
      actorId: entry.actor?.id ?? null,
      actorEmail: entry.actor?.email ?? null,
      actorRole: entry.actor?.role ?? null,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId ?? null,
      summary: entry.summary ?? null,
      metadata: entry.metadata ?? null,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
  } catch (error) {
    console.error("[audit] No se pudo registrar el evento:", error);
  }
}

"use server";

import { and, count, eq, gte } from "drizzle-orm";
import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { contactMessages, courses } from "@/db/schema";
import {
  actionError,
  actionSuccess,
  type ActionState,
} from "@/lib/action-state";
import {
  AUDIT_ACTIONS,
  getRequestMeta,
  recordAuditLog,
} from "@/lib/audit";
import { requireActionUser } from "@/lib/auth/session";
import { getProfessorPublicProfile } from "@/server/queries";
import {
  buildNewMessageEmail,
  buildStudentConfirmationEmail,
  getNotifyEmail,
  sendEmail,
  type NotificationStatus,
} from "@/lib/email/resend";

/* ------------------------------------------------------------------ */
/* Recepción pública con protección antispam                           */
/* ------------------------------------------------------------------ */

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora
const RATE_LIMIT_MAX = 5;
const MIN_FILL_TIME_MS = 2500; // los humanos tardan más de 2,5 s

function revalidateConsultas(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/consultas");
}

/**
 * Formulario público de consultas. Defensa en tres capas:
 *   1. Honeypot invisible (`website`) — los bots lo rellenan.
 *   2. Trampa temporal — descarta envíos < 2,5 s desde el render.
 *   3. Límite de frecuencia por IP (hash SHA-256, sin guardar la IP).
 * El spam se descarta en silencio (respuesta de éxito) y queda
 * registrado en la bitácora como `consulta.descartada_antispam`.
 */
export async function submitContactMessageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const meta = await getRequestMeta();
  const ipHash = createHash("sha256")
    .update(meta.ipAddress ?? "desconocida")
    .digest("hex");

  const honeypot = String(formData.get("website") ?? "").trim();
  const issuedAt = Number(formData.get("issuedAt") ?? "0");
  const elapsed = Date.now() - (Number.isFinite(issuedAt) ? issuedAt : 0);

  const discardAsSpam = async (motivo: string): Promise<ActionState> => {
    await recordAuditLog({
      actor: null,
      action: AUDIT_ACTIONS.MESSAGE_SPAM,
      entity: "contact_message",
      summary: `Consulta descartada por antispam (${motivo})`,
      metadata: { motivo, ipHash: ipHash.slice(0, 12) },
    });
    return actionSuccess(); // silencio deliberado ante bots
  };

  if (honeypot) return discardAsSpam("honeypot");
  if (!issuedAt || elapsed < MIN_FILL_TIME_MS) {
    return discardAsSpam("envio-instantaneo");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const courseId = String(formData.get("courseId") ?? "") || null;
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || name.length > 90) return actionError("Indica tu nombre.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return actionError("Indica un correo válido para responderte.");
  }
  if (message.length < 10 || message.length > 2000) {
    return actionError("La consulta debe tener entre 10 y 2000 caracteres.");
  }

  // Límite de frecuencia por IP.
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const [recent] = await db
    .select({ value: count() })
    .from(contactMessages)
    .where(
      and(
        eq(contactMessages.ipHash, ipHash),
        gte(contactMessages.createdAt, since),
      ),
    );
  if (recent.value >= RATE_LIMIT_MAX) {
    return discardAsSpam("limite-de-frecuencia");
  }

  let courseLabel = "No aplica / otra";
  if (courseId) {
    const [course] = await db
      .select({ id: courses.id, code: courses.code })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    if (!course) return actionError("La asignatura indicada no existe.");
    courseLabel = course.code;
  }

  const [saved] = await db
    .insert(contactMessages)
    .values({
      name,
      email,
      courseId,
      subject: subject || null,
      message,
      ipHash,
      userAgent: meta.userAgent,
    })
    .returning();

  /*
   * Notificaciones automáticas (Resend desde el servidor):
   *  1. Alerta al profesor con `reply_to` = correo del estudiante, para
   *     contestar la duda con solo pulsar «Responder» en su buzón.
   *  2. Confirmación automática al estudiante de que su mensaje llegó.
   */
  let notificacion: NotificationStatus = "sin-destinatario";
  let confirmacion: NotificationStatus = "sin-destinatario";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const notifyTo = await getNotifyEmail();

  if (notifyTo) {
    const template = buildNewMessageEmail({
      name,
      email,
      subject: subject || null,
      message,
      courseLabel,
      panelUrl: `${siteUrl}/admin/consultas`,
    });
    const result = await sendEmail({
      to: notifyTo,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: email,
    });
    notificacion = result.ok
      ? result.simulated
        ? "simulada"
        : "enviada"
      : "fallida";
    if (!result.ok) {
      console.error("[email] No se pudo notificar la consulta:", result.error);
    }

    /* Confirmación al estudiante (mismo estado operativo del servicio). */
    try {
      const teacherName =
        (await getProfessorPublicProfile())?.user.fullName ??
        "El equipo docente";
      const confirmation = buildStudentConfirmationEmail({
        name,
        courseLabel,
        subject: subject || null,
        siteUrl,
        teacherName,
      });
      const confirmationResult = await sendEmail({
        to: email,
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
      });
      confirmacion = confirmationResult.ok
        ? confirmationResult.simulated
          ? "simulada"
          : "enviada"
        : "fallida";
      if (!confirmationResult.ok) {
        console.error(
          "[email] No se pudo confirmar al estudiante:",
          confirmationResult.error,
        );
      }
    } catch (error) {
      console.error("[email] Error preparando la confirmación:", error);
    }
  }

  await recordAuditLog({
    actor: null,
    action: AUDIT_ACTIONS.MESSAGE_RECEIVED,
    entity: "contact_message",
    entityId: saved.id,
    summary: `Nueva consulta de ${name} (${email})`,
    metadata: {
      subject: subject || null,
      courseId,
      notificacion,
      notificadaA: notificacion !== "sin-destinatario" ? "profesor" : null,
      confirmacion,
    },
  });

  revalidateConsultas();
  return actionSuccess();
}

/* ------------------------------------------------------------------ */
/* Gestión interna (panel)                                             */
/* ------------------------------------------------------------------ */

export async function markMessageReadAction(messageId: string): Promise<void> {
  const actor = await requireActionUser();

  const [message] = await db
    .select()
    .from(contactMessages)
    .where(eq(contactMessages.id, messageId))
    .limit(1);
  if (!message || message.status !== "nuevo") return;

  await db
    .update(contactMessages)
    .set({ status: "leido", readAt: new Date() })
    .where(eq(contactMessages.id, messageId));

  await recordAuditLog({
    actor,
    action: AUDIT_ACTIONS.MESSAGE_READ,
    entity: "contact_message",
    entityId: messageId,
    summary: `${actor.fullName} marcó como leída la consulta de ${message.name}`,
  });

  revalidateConsultas();
}

export async function replyToMessageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const actor = await requireActionUser();

    const messageId = String(formData.get("messageId") ?? "");
    const reply = String(formData.get("reply") ?? "").trim();
    if (!messageId) return actionError("Falta el identificador de la consulta.");
    if (reply.length < 2 || reply.length > 2000) {
      return actionError("La respuesta debe tener entre 2 y 2000 caracteres.");
    }

    const [message] = await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.id, messageId))
      .limit(1);
    if (!message) return actionError("La consulta no existe.");
    if (message.status === "archivado") {
      return actionError("La consulta está archivada.");
    }

    await db
      .update(contactMessages)
      .set({
        reply,
        status: "respondido",
        repliedAt: new Date(),
        repliedBy: actor.id,
        readAt: message.readAt ?? new Date(),
      })
      .where(eq(contactMessages.id, messageId));

    await recordAuditLog({
      actor,
      action: AUDIT_ACTIONS.MESSAGE_REPLIED,
      entity: "contact_message",
      entityId: messageId,
      summary: `${actor.fullName} respondió la consulta de ${message.name}`,
      metadata: { para: message.email },
    });

    revalidateConsultas();
    return actionSuccess();
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "No se pudo guardar la respuesta.",
    );
  }
}

export async function archiveMessageAction(messageId: string): Promise<void> {
  const actor = await requireActionUser();

  const [message] = await db
    .select()
    .from(contactMessages)
    .where(eq(contactMessages.id, messageId))
    .limit(1);
  if (!message || message.status === "archivado") return;

  await db
    .update(contactMessages)
    .set({ status: "archivado" })
    .where(eq(contactMessages.id, messageId));

  await recordAuditLog({
    actor,
    action: AUDIT_ACTIONS.MESSAGE_ARCHIVED,
    entity: "contact_message",
    entityId: messageId,
    summary: `${actor.fullName} archivó la consulta de ${message.name}`,
  });

  revalidateConsultas();
}

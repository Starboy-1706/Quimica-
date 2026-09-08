import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Sistema de notificaciones por correo — Resend operado desde el servidor.
 * ------------------------------------------------------------------
 * - La clave vive SOLO en el servidor: `RESEND_API_KEY` (nunca en DB).
 * - Remitente: `RESEND_FROM` (o el valor por defecto de abajo).
 * - Destinatario de alertas: clave editable `notify_email` en
 *   site_settings (respaldo: correo institucional del perfil).
 * - Si NO hay clave configurada, el modo **simulado** registra el
 *   envío por consola y devuelve éxito: la funcionalidad queda
 *   probada sin credenciales y la integración se activa con una
 *   sola variable de entorno.
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM =
  process.env.RESEND_FROM ?? "Aula Docente <notificaciones@aula-docente.dev>";

export type SendResult =
  | { ok: true; simulated: boolean; id?: string }
  | { ok: false; error: string };

export type NotificationStatus =
  | "enviada"
  | "simulada"
  | "fallida"
  | "sin-destinatario";

export function resendConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

export function resendSenderLabel(): string {
  return RESEND_FROM;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    console.info(
      `[email:simulado] Para: ${options.to} · Asunto: ${options.subject}`,
    );
    return { ok: true, simulated: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      return {
        ok: false,
        error: `Resend ${response.status}: ${body?.message ?? "error desconocido"}`,
      };
    }
    const body = (await response.json()) as { id?: string };
    return { ok: true, simulated: false, id: body.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Fallo de red con Resend",
    };
  }
}

/* ------------------------------------------------------------------ */
/* Destinatario de alertas                                             */
/* ------------------------------------------------------------------ */

export async function getNotifyEmail(): Promise<string | null> {
  const [row] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, "notify_email"))
    .limit(1);

  let value: unknown = row?.value;
  if (typeof value !== "string") value = JSON.stringify(value);
  const candidate = String(value ?? "").trim();
  return candidate && candidate !== '""' ? candidate.replace(/^"|"$/g, "") : null;
}

/* ------------------------------------------------------------------ */
/* Plantillas                                                          */
/* ------------------------------------------------------------------ */

function escapeForEmail(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function emailShell(title: string, bodyRows: string, footnote: string): string {
  return `<!doctype html><html lang="es"><body style="margin:0;padding:0;background:#f4efe3;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:#17130e;border-radius:16px 16px 0 0;padding:22px 28px;">
      <p style="margin:0;color:#dca63f;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Aula Docente</p>
      <h1 style="margin:8px 0 0;color:#f2ead4;font-size:22px;font-weight:600;">${title}</h1>
    </div>
    <div style="background:#fffcf5;border:1px solid #e3dac4;border-top:0;padding:24px 28px;">
      ${bodyRows}
    </div>
    <div style="background:#ece5d3;border:1px solid #e3dac4;border-top:0;border-radius:0 0 16px 16px;padding:14px 28px;">
      <p style="margin:0;color:#7a7259;font-size:11px;">${footnote}</p>
    </div>
  </div>
</body></html>`;
}

function fieldRow(label: string, value: string): string {
  return `<p style="margin:0 0 10px;font-size:13px;color:#4a4433;">
    <span style="display:inline-block;min-width:110px;color:#8b8064;font-family:ui-monospace,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;">${label}</span>
    <strong style="color:#1b1710;">${escapeForEmail(value)}</strong>
  </p>`;
}

function actionButton(url: string, label: string): string {
  return `<p style="margin:22px 0 4px;text-align:center;">
    <a href="${url}" style="display:inline-block;background:#17130e;color:#f2ead4;text-decoration:none;padding:12px 26px;border-radius:999px;font-size:14px;">${label}</a>
  </p>`;
}

/** Correo de alerta: nueva consulta estudiantil recibida en la web. */
export function buildNewMessageEmail(input: {
  name: string;
  email: string;
  subject: string | null;
  message: string;
  courseLabel: string;
  panelUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Nueva consulta de ${input.name} · Aula Docente`;
  const html = emailShell(
    "Nueva consulta estudiantil",
    [
      fieldRow("De", input.name),
      fieldRow("Correo", input.email),
      fieldRow("Asignatura", input.courseLabel),
      fieldRow("Asunto", input.subject ?? "—"),
      `<div style="margin:16px 0;padding:14px 16px;background:#f6f1e2;border-left:3px solid #dca63f;border-radius:8px;">
        <p style="margin:0;font-size:14px;line-height:1.6;color:#1b1710;white-space:pre-line;">${escapeForEmail(input.message)}</p>
      </div>`,
      actionButton(input.panelUrl, "Abrir la bandeja de consultas"),
    ].join(""),
    "Enviado automáticamente por el aula docente cuando un estudiante envía una consulta desde la web.",
  );
  const text = [
    `Nueva consulta estudiantil`,
    ``,
    `De: ${input.name} <${input.email}>`,
    `Asignatura: ${input.courseLabel}`,
    `Asunto: ${input.subject ?? "—"}`,
    ``,
    input.message,
    ``,
    `Gestionar en: ${input.panelUrl}`,
  ].join("\n");
  return { subject, html, text };
}

export function buildTestEmail(input: {
  panelUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = "Correo de prueba · Aula Docente";
  const html = emailShell(
    "Correo de prueba",
    `<p style="margin:0;font-size:14px;line-height:1.7;color:#1b1710;">
      Las notificaciones del aula docente están funcionando. Recibirás en este
      buzón una alerta cada vez que un estudiante envíe una consulta desde la web.
    </p>
    ${actionButton(input.panelUrl, "Ir al panel docente")}`,
    "Si no esperabas este correo, puedes ignorarlo: se generó desde Ajustes → Notificaciones.",
  );
  const text = [
    "Correo de prueba del aula docente",
    "",
    "Las notificaciones están funcionando correctamente.",
    `Panel: ${input.panelUrl}`,
  ].join("\n");
  return { subject, html, text };
}

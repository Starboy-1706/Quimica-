import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Sistema de notificaciones por correo — Resend operado desde el servidor.
 * ------------------------------------------------------------------
 * - La API Key y el remitente se pueden configurar directamente desde el
 *   panel de administración (en `site_settings`) o mediante variables de
 *   entorno (`RESEND_API_KEY`, `RESEND_FROM`).
 * - Destinatario de alertas: clave editable `notify_email` en
 *   site_settings (respaldo: correo institucional del perfil).
 * - Las alertas al profesor llevan `reply_to` con el correo del
 *   estudiante: se responde la duda con solo pulsar «Responder» en el
 *   cliente de correo. El estudiante, además, recibe una confirmación
 *   automática de recepción.
 * - Envío robusto: timeout de 10 s por intento y un reintento automático
 *   con espera ante fallos de red, 429 o 5xx de la API de Resend.
 * - Si NO hay clave configurada, el modo **simulado** registra el
 *   envío por consola y devuelve éxito: la funcionalidad queda
 *   probada sin credenciales.
 */

export type SendResult =
  | { ok: true; simulated: boolean; id?: string }
  | { ok: false; error: string };

export type NotificationStatus =
  | "enviada"
  | "simulada"
  | "fallida"
  | "sin-destinatario";

export type ResendStatus = {
  /** Hay clave disponible (panel o entorno). */
  configured: boolean;
  /** De dónde sale la clave: ajustes del panel, variable de entorno o nada. */
  source: "panel" | "entorno" | null;
  /** El formato de la clave parece válido (`re_…`). */
  keyValid: boolean;
  /** El remitente tiene formato `Nombre <correo>` o correo simple válido. */
  fromValid: boolean;
  /** Remitente efectivo que se usaría ahora mismo. */
  from: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const KEY_PATTERN = /^re_[A-Za-z0-9_-]{8,}$/;
const FROM_PATTERN =
  /^([^<>{}"']+\s+)?<?[^\s@<>{}]+@[^\s@<>{}]+\.[^\s@<>{}]+>?$/;

async function readSetting(key: string): Promise<string | null> {
  try {
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .limit(1);

    let value: unknown = row?.value;
    if (typeof value !== "string") value = JSON.stringify(value);
    const candidate = String(value ?? "").trim().replace(/^"|"$/g, "");
    return candidate || null;
  } catch {
    return null;
  }
}

export async function getResendApiKey(): Promise<string | null> {
  const fromPanel = await readSetting("resend_api_key");
  return fromPanel ?? process.env.RESEND_API_KEY ?? null;
}

export async function getResendFrom(): Promise<string> {
  const fromPanel = await readSetting("resend_from");
  return (
    fromPanel ??
    process.env.RESEND_FROM ??
    "Aula Docente <onboarding@resend.dev>"
  );
}

export async function resendConfigured(): Promise<boolean> {
  const key = await getResendApiKey();
  return Boolean(key);
}

export async function resendSenderLabel(): Promise<string> {
  return getResendFrom();
}

/** Diagnóstico completo para la tarjeta de Ajustes del panel. */
export async function getResendStatus(): Promise<ResendStatus> {
  const panelKey = await readSetting("resend_api_key");
  const envKey = process.env.RESEND_API_KEY || null;
  const key = panelKey ?? envKey;
  const from = await getResendFrom();

  return {
    configured: Boolean(key),
    source: panelKey ? "panel" : envKey ? "entorno" : null,
    keyValid: key ? KEY_PATTERN.test(key) : false,
    fromValid: FROM_PATTERN.test(from),
    from,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Responder-a real del mensaje (p. ej. el correo del estudiante). */
  replyTo?: string;
}): Promise<SendResult> {
  const apiKey = await getResendApiKey();
  const from = await getResendFrom();

  if (!apiKey) {
    console.info(
      `[email:simulado] Para: ${options.to} · Asunto: ${options.subject}${
        options.replyTo ? ` · Responder a: ${options.replyTo}` : ""
      }`,
    );
    return { ok: true, simulated: true };
  }

  const payload = JSON.stringify({
    from,
    to: [options.to],
    subject: options.subject,
    html: options.html,
    text: options.text,
    ...(options.replyTo ? { reply_to: options.replyTo } : {}),
  });

  const MAX_ATTEMPTS = 2; // intento inicial + un reintento con espera
  let lastError = "error desconocido";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) await sleep(700);

    try {
      const response = await fetch(RESEND_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: payload,
        signal: AbortSignal.timeout(10_000),
      });

      if (response.ok) {
        const body = (await response.json()) as { id?: string };
        return { ok: true, simulated: false, id: body.id };
      }

      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      lastError = `Resend ${response.status}: ${body?.message ?? "error desconocido"}`;

      // 4xx (salvo 429) no se soluciona reintentando: clave, dominio o payload.
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return { ok: false, error: lastError };
      }
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Fallo de red con Resend";
    }
  }

  return { ok: false, error: lastError };
}

/* ------------------------------------------------------------------ */
/* Destinatario de alertas                                             */
/* ------------------------------------------------------------------ */

export async function getNotifyEmail(): Promise<string | null> {
  return readSetting("notify_email");
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

function emailShell(
  title: string,
  preheader: string,
  bodyRows: string,
  footnote: string,
): string {
  return `<!doctype html><html lang="es"><body style="margin:0;padding:0;background:#f4efe3;font-family:Georgia,serif;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeForEmail(preheader)}</span>
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
    `${input.name} te escribió desde la web (${input.courseLabel}). Responde directamente a este correo.`,
    [
      fieldRow("De", input.name),
      fieldRow("Correo", input.email),
      fieldRow("Asignatura", input.courseLabel),
      fieldRow("Asunto", input.subject ?? "—"),
      `<div style="margin:16px 0;padding:14px 16px;background:#f6f1e2;border-left:3px solid #dca63f;border-radius:8px;">
        <p style="margin:0;font-size:14px;line-height:1.6;color:#1b1710;white-space:pre-line;">${escapeForEmail(input.message)}</p>
      </div>`,
      `<p style="margin:14px 0 0;font-size:12px;line-height:1.5;color:#6f684f;">
        Consejo: al pulsar <strong>Responder</strong> en tu correo, la respuesta le
        llegará directamente a ${escapeForEmail(input.email)}.
      </p>`,
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
    `Responde directamente a este correo para contestar al estudiante.`,
    `Gestionar en: ${input.panelUrl}`,
  ].join("\n");
  return { subject, html, text };
}

/** Confirmación automática al estudiante que acaba de enviar su duda. */
export function buildStudentConfirmationEmail(input: {
  name: string;
  courseLabel: string;
  subject: string | null;
  siteUrl: string;
  teacherName: string;
}): { subject: string; html: string; text: string } {
  const firstName = input.name.trim().split(/\s+/)[0] || input.name;
  const subject = "Recibimos tu consulta · Aula Docente";
  const html = emailShell(
    `¡Gracias, ${escapeForEmail(firstName)}!`,
    `${input.teacherName} recibió tu consulta sobre ${input.courseLabel} y te responderá pronto.`,
    [
      `<p style="margin:0;font-size:14px;line-height:1.7;color:#1b1710;">
        Tu mensaje sobre <strong>${escapeForEmail(input.courseLabel)}</strong>${
          input.subject
            ? ` (asunto: <strong>${escapeForEmail(input.subject)}</strong>)`
            : ""
        }
        ya está en la bandeja del aula docente. ${escapeForEmail(input.teacherName)}
        te responderá a este mismo correo lo antes posible.
      </p>`,
      `<div style="margin:16px 0;padding:12px 16px;background:#f6f1e2;border-radius:8px;">
        <p style="margin:0;font-size:12px;line-height:1.6;color:#6f684f;">
          Mientras tanto puedes volver al aula para consultar materiales, avisos
          y la agenda de evaluaciones.
        </p>
      </div>`,
      actionButton(input.siteUrl, "Volver al aula"),
    ].join(""),
    "Confirmación automática del aula docente. No necesitas responder a este correo.",
  );
  const text = [
    `¡Gracias, ${firstName}!`,
    ``,
    `Tu consulta sobre ${input.courseLabel} ya está en la bandeja del aula.`,
    `${input.teacherName} te responderá a este mismo correo lo antes posible.`,
    ``,
    `Aula: ${input.siteUrl}`,
  ].join("\n");
  return { subject, html, text };
}

export function buildTestEmail(input: {
  panelUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = "Correo de prueba · Aula Docente";
  const html = emailShell(
    "Correo de prueba",
    "Las notificaciones del aula docente están funcionando correctamente.",
    `<p style="margin:0;font-size:14px;line-height:1.7;color:#1b1710;">
      Las notificaciones del aula docente están funcionando correctamente. Recibirás en este
      buzón una alerta cada vez que un estudiante envíe una consulta desde la web, y el
      estudiante recibirá una confirmación automática de recepción.
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

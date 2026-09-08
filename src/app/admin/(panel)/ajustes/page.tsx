import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import {
  Database,
  KeyRound,
  Mail,
  Palette,
  Sliders,
  UserCheck,
} from "lucide-react";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { requirePageUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { storageDriverLabel } from "@/lib/storage";
import {
  getNotifyEmail,
  resendConfigured,
  resendSenderLabel,
} from "@/lib/email/resend";
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  formatBytes,
  MAX_BULK_FILES,
  MAX_UPLOAD_BYTES,
} from "@/lib/upload-rules";
import {
  getProfessorPublicProfile,
  getSiteSettingsMap,
} from "@/server/queries";
import {
  ChangePasswordForm,
  ProfessorProfileForm,
  SiteSettingsForm,
  TestEmailButton,
} from "@/components/admin/forms";
import { Badge, Card, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Ajustes y Personalización" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const currentUser = await requirePageUser(["administrador"]);

  const [values, profile, lastTouched, notifyEmail, isResendReady, senderFrom] =
    await Promise.all([
      getSiteSettingsMap(),
      getProfessorPublicProfile(),
      db
        .select({ updatedAt: siteSettings.updatedAt })
        .from(siteSettings)
        .orderBy(desc(siteSettings.updatedAt))
        .limit(1),
      getNotifyEmail(),
      resendConfigured(),
      resendSenderLabel(),
    ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Configuración Total · Personalización"
        title="Ajustes y Personalización del Portal"
        description="Modifica todos los textos, imágenes, títulos de secciones, colores institucionales, configuración de Resend y contraseña de acceso al panel."
      />

      {/* ── SECCIÓN 1: Perfil del docente ── */}
      <Card
        title="Perfil del Docente Titular"
        description="Sección «El docente» de la portada y nombre principal visible en todo el portal."
      >
        <div className="mb-4 flex items-center gap-2 text-xs text-sand">
          <UserCheck className="h-4 w-4 text-brass" />
          <span>
            Edita tu nombre, departamento, biografía y datos de atención a estudiantes.
          </span>
        </div>
        <ProfessorProfileForm profile={profile ?? null} user={profile?.user ?? currentUser as any} />
      </Card>

      {/* ── SECCIÓN 2: Seguridad y Cambio de Contraseña de Acceso ── */}
      <Card
        title="Contraseña de Acceso al Panel"
        description="Cambia la clave maestra de acceso para entrar al panel de administración sin necesitar correo."
      >
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-brass/25 bg-brass/[0.06] p-3 text-xs text-sand">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
          <div>
            <p className="font-medium text-cream">Acceso simplificado por contraseña</p>
            <p className="mt-0.5 text-muted">
              El panel ahora pide únicamente esta contraseña para ingresar.
              Guárdala en un lugar seguro.
            </p>
          </div>
        </div>
        <ChangePasswordForm />
      </Card>

      {/* ── SECCIÓN 3: Personalización completa de la web ── */}
      <Card
        title="Personalización Completa de la Web Pública"
        description="Controla todos los textos, títulos de secciones, imágenes y colores de la portada."
      >
        <div className="mb-4 flex items-center gap-2 text-xs text-sand">
          <Palette className="h-4 w-4 text-brass" />
          <span>
            Los cambios se reflejan inmediatamente en la web de estudiantes al guardar.
          </span>
        </div>
        <SiteSettingsForm values={values} />
        {lastTouched[0] ? (
          <p className="mt-4 border-t border-line pt-3 text-[11px] text-muted">
            Última actualización de ajustes:{" "}
            {formatDateTime(lastTouched[0].updatedAt)}
          </p>
        ) : null}
      </Card>

      {/* ── SECCIÓN 4: Estado de Notificaciones y Almacenamiento ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Notificaciones y Alertas (Resend)"
          description="Alerta automática al profesor cuando un estudiante envía una duda desde la web."
        >
          <dl className="space-y-2.5 text-xs text-muted">
            <div className="flex items-center justify-between gap-4">
              <dt>Estado del servicio</dt>
              <dd>
                {isResendReady ? (
                  <Badge tone="green">Resend conectado</Badge>
                ) : (
                  <Badge tone="gold">Modo simulado</Badge>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Remitente activo</dt>
              <dd className="text-right font-mono text-[10px] text-sand">
                {senderFrom}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Alertas dirigidas a</dt>
              <dd className="text-right text-sand">
                {notifyEmail ?? "sin configurar"}
              </dd>
            </div>
          </dl>

          <p className="mt-4 rounded-xl border border-line bg-lift/40 px-3.5 py-2.5 text-[11px] leading-relaxed text-muted">
            <Mail className="inline h-3 w-3 text-brass mr-1" />
            Puedes ingresar tu <strong className="text-cream">Resend API Key</strong>{" "}
            directamente en el formulario de arriba (Grupo 5) sin tocar variables de entorno ni hacer redeploy.
          </p>

          <div className="mt-4 border-t border-line pt-4">
            <TestEmailButton />
          </div>
        </Card>

        <Card
          title="Almacenamiento de Archivos"
          description="Entrega protegida por la ruta /archivos/[key] según el estado del material."
        >
          <dl className="space-y-2.5 text-xs text-muted">
            <div className="flex justify-between gap-4">
              <dt>Driver activo</dt>
              <dd className="text-right text-sand">{storageDriverLabel()}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Límite por archivo</dt>
              <dd className="text-sand">{formatBytes(MAX_UPLOAD_BYTES)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Lote máximo</dt>
              <dd className="text-sand">{MAX_BULK_FILES} archivos</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Extensiones</dt>
              <dd className="text-right font-mono text-[10px] text-sand">
                {ALLOWED_UPLOAD_EXTENSIONS.join(" ")}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-lift/40 p-3 text-xs text-muted">
            <Database className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" />
            <p>
              En Supabase el bucket <code className="text-cream">materiales</code> es privado y los enlaces se firman automáticamente.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

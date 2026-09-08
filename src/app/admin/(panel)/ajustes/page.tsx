import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { Database, Settings } from "lucide-react";
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
  ProfessorProfileForm,
  SiteSettingsForm,
  TestEmailButton,
} from "@/components/admin/forms";
import { Badge, Card, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Ajustes" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requirePageUser(["administrador"]);

  const [values, profile, lastTouched, notifyEmail] = await Promise.all([
    getSiteSettingsMap(),
    getProfessorPublicProfile(),
    db
      .select({ updatedAt: siteSettings.updatedAt })
      .from(siteSettings)
      .orderBy(desc(siteSettings.updatedAt))
      .limit(1),
    getNotifyEmail(),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Configuración · Ajustes"
        title="Ajustes del sitio"
        description="Contenido global del sitio público almacenado en site_settings y el perfil docente publicado en la portada."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Identidad del sitio"
          description="Claves persistentes clave → valor (JSON), con updatedAt y updatedBy automáticos."
        >
          <SiteSettingsForm values={values} />
          {lastTouched[0] ? (
            <p className="mt-4 border-t border-line pt-3 text-[11px] text-muted">
              Última actualización:{" "}
              {formatDateTime(lastTouched[0].updatedAt)}
            </p>
          ) : null}
        </Card>

        <Card
          title="Perfil docente público"
          description="Sección «El docente» de la portada. Asociado a la cuenta del administrador titular."
        >
          <ProfessorProfileForm profile={profile ?? null} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card
          title="Almacenamiento de archivos"
          description="Subida validada por extensión, MIME, tamaño y firma mágica; entrega solo por la ruta protegida /archivos."
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
        </Card>

        <Card
          title="Notificaciones por correo"
          description="Alerta automática al profesor (Resend, operado desde el servidor) cuando un estudiante envía una consulta."
        >
          <dl className="space-y-2.5 text-xs text-muted">
            <div className="flex items-center justify-between gap-4">
              <dt>Estado del servicio</dt>
              <dd>
                {resendConfigured() ? (
                  <Badge tone="green">Resend conectado</Badge>
                ) : (
                  <Badge tone="gold">Modo simulado</Badge>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Remitente</dt>
              <dd className="text-right font-mono text-[10px] text-sand">
                {resendSenderLabel()}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Alertas dirigidas a</dt>
              <dd className="text-right text-sand">
                {notifyEmail ?? "sin configurar"}
              </dd>
            </div>
          </dl>
          {!resendConfigured() ? (
            <p className="mt-4 rounded-xl border border-brass/25 bg-brass/[0.06] px-3.5 py-2.5 text-[11px] leading-relaxed text-sand">
              Define <code className="rounded bg-lift px-1 font-mono">RESEND_API_KEY</code>{" "}
              (y <code className="rounded bg-lift px-1 font-mono">RESEND_FROM</code>) en el
              entorno para enviar correos reales; mientras tanto los envíos se
              registran en consola.
            </p>
          ) : null}
          <div className="mt-4 border-t border-line pt-4">
            <TestEmailButton />
          </div>
        </Card>

        <div className="flex items-start gap-4 rounded-2xl border border-line bg-panel p-5">
          <Database className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
          <p className="text-xs leading-relaxed text-muted">
          <span className="font-medium text-sand">Nota de arquitectura:</span>{" "}
          los cambios de ajustes y perfil se registran en la bitácora de
          auditoría (<Settings className="inline h-3 w-3" /> acciones{" "}
          <code className="rounded bg-lift px-1 font-mono text-[10px]">
            ajustes.actualizar
          </code>{" "}
          y{" "}
          <code className="rounded bg-lift px-1 font-mono text-[10px]">
            perfil.actualizar
          </code>
          ). Los contenidos versionados (cursos, materiales, avisos) guardan
          además snapshots completos en{" "}
          <code className="rounded bg-lift px-1 font-mono text-[10px]">
            content_versions
          </code>
          .
        </p>
        </div>
      </div>
    </div>
  );
}

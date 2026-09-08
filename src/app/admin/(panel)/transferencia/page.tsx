import type { Metadata } from "next";
import {
  DatabaseBackup,
  FileDown,
  FileJson,
  FileSpreadsheet,
  ShieldCheck,
} from "lucide-react";
import { requirePageUser } from "@/lib/auth/session";
import { ImportPanel } from "@/components/admin/import-panel";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Carga y respaldos" };
export const dynamic = "force-dynamic";

export default async function AdminTransferPage() {
  // Solo el Administrador exporta/importa estructuras y genera respaldos.
  await requirePageUser(["administrador"]);

  return (
    <div>
      <PageHeader
        eyebrow="Herramientas · Transferencia"
        title="Carga y respaldos"
        description="Reutiliza la estructura de semestres anteriores (CSV/JSON), importa cursos completos como borradores y genera el respaldo total del portal."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Exportar estructura */}
        <Card
          title="Exportar estructura de cursos"
          description="Descarga las asignaturas actuales (con materiales, avisos y metadatos de archivos) para reutilizarlas en el próximo ciclo."
        >
          <p className="text-xs leading-relaxed text-muted">
            El formato canónico del portal es el JSON{" "}
            <code className="rounded bg-lift px-1.5 py-0.5 font-mono text-[10px]">
              aula-docente/cursos
            </code>{" "}
            v1. El CSV resume las asignaturas en una tabla plana compatible
            con Excel.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/api/admin/export/cursos?formato=json"
              className="inline-flex items-center gap-2 rounded-xl bg-brass px-4 py-2.5 text-sm font-semibold text-night transition hover:bg-brass/90"
            >
              <FileJson className="h-4 w-4" />
              Descargar JSON
            </a>
            <a
              href="/api/admin/export/cursos?formato=csv"
              className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-sand transition hover:border-brass/50 hover:text-brass"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Descargar CSV
            </a>
          </div>
          <p className="mt-4 text-[11px] text-muted">
            Cada descarga queda firmada en la bitácora de auditoría.
          </p>
        </Card>

        {/* Respaldo completo */}
        <Card
          title="Respaldo completo del portal"
          description="Todas las tablas: cursos, materiales (metadatos de archivos), avisos, ajustes, perfil, consultas, versiones, bitácora y cuentas."
        >
          <ul className="space-y-1.5 text-xs text-muted">
            <li className="flex gap-2">
              <DatabaseBackup className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" />
              Incluye los metadatos de cada archivo subido (clave, nombre,
              tamaño); los binarios viven en el Storage.
            </li>
            <li className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clay" />
              Contiene hashes de contraseña (scrypt, no reversibles):
              almacénalo en un lugar seguro.
            </li>
          </ul>
          <div className="mt-5">
            <a
              href="/api/admin/export/respaldo"
              className="inline-flex items-center gap-2 rounded-xl bg-brass px-4 py-2.5 text-sm font-semibold text-night transition hover:bg-brass/90"
            >
              <FileDown className="h-4 w-4" />
              Generar respaldo completo
            </a>
          </div>
        </Card>
      </div>

      {/* Importación */}
      <div className="mt-8">
        <ImportPanel />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-panel p-5 text-xs leading-relaxed text-muted">
        <p className="font-medium text-sand">Cómo funciona la importación</p>
        <p className="mt-1.5">
          El asistente valida el archivo <em>antes</em> de escribir nada
          (formato, niveles, categorías, horarios y duplicados). Todo lo
          importado entra como <strong className="text-brass">borrador</strong>,
          con sus versiones iniciales y la firma{" "}
          <code className="rounded bg-lift px-1 font-mono text-[10px]">
            importacion.cursos
          </code>{" "}
          en la bitácora. Los cursos con códigos ya existentes se omiten sin
          tocar el contenido actual — ideal para repetir la estructura de un
          semestre anterior cambiando solo el período.
        </p>
      </div>
    </div>
  );
}

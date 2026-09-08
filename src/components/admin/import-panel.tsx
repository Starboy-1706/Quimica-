"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleDashed,
  FileJson,
  Loader2,
  UploadCloud,
} from "lucide-react";
import {
  executeImportAction,
  previewImportAction,
} from "@/server/actions/transfer";
import {
  idleExecute,
  idlePreview,
} from "@/lib/transfer/import-state";

const inputClasses =
  "w-full rounded-xl border border-line bg-lift px-3.5 py-2.5 text-sm text-cream placeholder:text-muted/70 transition focus:border-brass/60 focus:outline-none focus:ring-2 focus:ring-brass/20";

function PreviewSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl bg-brass px-4 py-2.5 text-sm font-semibold text-night transition hover:bg-brass/90 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileJson className="h-4 w-4" />
      )}
      {pending ? "Analizando…" : "Analizar archivo"}
    </button>
  );
}

function ExecuteSubmit({ count }: { count: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl bg-brass px-4 py-2.5 text-sm font-semibold text-night transition hover:bg-brass/90 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UploadCloud className="h-4 w-4" />
      )}
      {pending ? "Importando…" : `Importar ${count} ${count === 1 ? "curso" : "cursos"}`}
    </button>
  );
}

/**
 * Panel envoltorio: cada «round» remonta el asistente para empezar
 * una nueva importación con el estado limpio.
 */
export function ImportPanel() {
  const [round, setRound] = useState(0);
  const router = useRouter();
  return (
    <ImportWizard
      key={round}
      onReset={() => {
        router.refresh();
        setRound((value) => value + 1);
      }}
    />
  );
}

/**
 * Asistente de importación en 3 pasos:
 *   ① elegir archivo · ② vista previa validada · ③ ejecutar y ver resultado.
 */
function ImportWizard({ onReset }: { onReset: () => void }) {
  const [previewState, previewAction] = useActionState(
    previewImportAction,
    idlePreview,
  );
  const [executeState, executeAction] = useActionState(
    executeImportAction,
    idleExecute,
  );

  const steps = [
    "Elegir archivo",
    "Vista previa",
    "Resultado",
  ];
  const activeStep =
    executeState.status === "done"
      ? 2
      : previewState.status === "preview"
        ? 1
        : 0;

  return (
    <div className="rounded-2xl border border-line bg-panel">
      {/* Cabecera con pasos */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line px-6 py-4">
        <h2 className="font-display text-lg font-medium text-cream">
          Importar estructura
        </h2>
        <ol className="flex items-center gap-2 text-[11px]">
          {steps.map((step, index) => (
            <li key={step} className="flex items-center gap-2">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] ${
                  index < activeStep
                    ? "bg-sage/20 text-sage"
                    : index === activeStep
                      ? "bg-brass text-night"
                      : "bg-lift text-muted"
                }`}
              >
                {index < activeStep ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className={index === activeStep ? "text-cream" : "text-muted"}>
                {step}
              </span>
              {index < steps.length - 1 ? (
                <ArrowRight className="h-3 w-3 text-muted" aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <div className="px-6 py-5">
        {/* ── Paso 3: resultado ── */}
        {executeState.status === "done" ? (
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-sm font-medium text-sage">
              <CheckCircle2 className="h-4 w-4" />
              Importación completada — todo lo creado quedó como{" "}
              <strong>borrador</strong> para revisión.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-lift/40 p-4 text-center">
                <p className="font-display text-3xl font-semibold text-cream">
                  {executeState.creados?.length ?? 0}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                  Cursos creados
                </p>
              </div>
              <div className="rounded-xl border border-line bg-lift/40 p-4 text-center">
                <p className="font-display text-3xl font-semibold text-cream">
                  {executeState.materiales ?? 0}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                  Materiales
                </p>
              </div>
              <div className="rounded-xl border border-line bg-lift/40 p-4 text-center">
                <p className="font-display text-3xl font-semibold text-cream">
                  {executeState.avisos ?? 0}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                  Avisos
                </p>
              </div>
            </div>

            {executeState.creados && executeState.creados.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium text-sand">Creados:</p>
                <div className="flex flex-wrap gap-1.5">
                  {executeState.creados.map((item) => (
                    <span
                      key={item.codigo}
                      className="rounded-full border border-sage/40 bg-sage/10 px-3 py-1 font-mono text-[11px] text-sage"
                      title={item.titulo}
                    >
                      {item.codigo}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {executeState.omitidos && executeState.omitidos.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium text-sand">
                  Omitidos (sin cambios):
                </p>
                <ul className="space-y-1">
                  {executeState.omitidos.map((item, index) => (
                    <li
                      key={`${item.codigo}-${index}`}
                      className="text-xs text-muted"
                    >
                      <span className="font-mono text-clay">{item.codigo}</span>{" "}
                      — {item.motivo}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/admin/cursos"
                className="inline-flex items-center gap-2 rounded-xl bg-brass px-4 py-2.5 text-sm font-semibold text-night transition hover:bg-brass/90"
              >
                Revisar las asignaturas importadas
              </Link>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm text-sand transition hover:border-brass/50 hover:text-brass"
              >
                Nueva importación
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Paso 1: archivo ── */}
            <form action={previewAction} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-sand">
                  Archivo de estructura
                </span>
                <input
                  type="file"
                  name="file"
                  accept=".json,.csv,application/json,text/csv"
                  required
                  className="block w-full text-sm text-sand file:mr-4 file:rounded-xl file:border-0 file:bg-lift file:px-4 file:py-2.5 file:text-sm file:text-cream hover:file:bg-line"
                />
              </label>
              <p className="text-[11px] leading-relaxed text-muted">
                Acepta el <strong className="text-sand">JSON</strong> canónico
                exportado aquí (con materiales y avisos) o un{" "}
                <strong className="text-sand">CSV</strong> con columnas
                codigo;titulo;nivel;periodo;creditos;aula;horario;descripcion.
                Nada se escribe todavía: primero verás la vista previa.
              </p>
              <PreviewSubmit />
              {previewState.status === "error" ? (
                <p className="flex items-start gap-2 rounded-xl border border-clay/40 bg-clay/10 px-3.5 py-2.5 text-xs text-clay">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {previewState.error}
                </p>
              ) : null}
            </form>

            {/* ── Paso 2: vista previa + ejecución ── */}
            {previewState.status === "preview" && previewState.resumen ? (
              <form
                action={executeAction}
                className="mt-6 space-y-4 border-t border-line pt-5"
              >
                <input
                  type="hidden"
                  name="payload"
                  value={previewState.payload ?? ""}
                />

                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    ["Cursos", previewState.resumen.cursos],
                    ["Materiales", previewState.resumen.materiales],
                    ["Avisos", previewState.resumen.avisos],
                    ["Enlaces a archivos", previewState.resumen.referenciasArchivos],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-line bg-lift/40 p-3.5 text-center"
                    >
                      <p className="font-display text-2xl font-semibold text-cream">
                        {value}
                      </p>
                      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-muted">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-sand">
                    Códigos del paquete ({previewState.fileName}):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {previewState.resumen.codigos.map((codigo) => (
                      <span
                        key={codigo}
                        className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-sand"
                      >
                        <CircleDashed className="h-3 w-3" />
                        {codigo}
                      </span>
                    ))}
                  </div>
                </div>

                {previewState.resumen.advertencias.length > 0 ? (
                  <div className="rounded-xl border border-brass/25 bg-brass/[0.06] px-4 py-3">
                    <p className="text-xs font-medium text-brass">
                      Advertencias de validación
                    </p>
                    <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-[11px] text-sand">
                      {previewState.resumen.advertencias.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {previewState.resumen.referenciasArchivos > 0 ? (
                  <p className="text-[11px] leading-relaxed text-muted">
                    Nota: los {previewState.resumen.referenciasArchivos}{" "}
                    materiales subidos como archivo enlazarán al documento
                    original del portal (misma ruta protegida /archivos).
                    Re-súbelos si estás migrando entre portales distintos.
                  </p>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr_1fr]">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-sand">
                      Período destino
                    </span>
                    <input
                      name="nuevoPeriodo"
                      placeholder="2026-II (vacío = conservar)"
                      className={inputClasses}
                    />
                  </label>
                  <label className="flex items-center gap-2.5 self-end rounded-xl border border-line bg-lift/50 px-3.5 py-3">
                    <input
                      type="checkbox"
                      name="incluirMateriales"
                      defaultChecked
                      className="h-4 w-4 rounded border-line bg-lift accent-[#dca63f]"
                    />
                    <span className="text-sm text-cream">Incluir materiales</span>
                  </label>
                  <label className="flex items-center gap-2.5 self-end rounded-xl border border-line bg-lift/50 px-3.5 py-3">
                    <input
                      type="checkbox"
                      name="incluirAvisos"
                      defaultChecked
                      className="h-4 w-4 rounded border-line bg-lift accent-[#dca63f]"
                    />
                    <span className="text-sm text-cream">Incluir avisos</span>
                  </label>
                </div>

                <ExecuteSubmit count={previewState.resumen.cursos} />
                {executeState.status === "error" ? (
                  <p className="flex items-start gap-2 rounded-xl border border-clay/40 bg-clay/10 px-3.5 py-2.5 text-xs text-clay">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {executeState.error}
                  </p>
                ) : null}
              </form>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  Atom,
  ExternalLink,
  Globe2,
  Info,
  Loader2,
  MonitorPlay,
  MousePointer2,
  Sigma,
} from "lucide-react";
import { MOLECULE_PRESETS } from "@/lib/molecules/presets";

const MoleculeViewer = dynamic(
  () => import("@/components/public/molecule-viewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[340px] items-center justify-center text-sm text-paper/50">
        <span className="animate-pulse font-mono text-[11px] uppercase tracking-[0.3em]">
          Cargando modelo 3D…
        </span>
      </div>
    ),
  },
);

/**
 * Sección «Simulaciones de compuestos».
 * Visor molecular 3D nativo (Three.js) + conector opcional a Google Sites.
 */
export function SimulationsSection({
  embedUrl,
  embedTitle,
}: {
  embedUrl: string;
  embedTitle: string;
}) {
  const [activeId, setActiveId] = useState(MOLECULE_PRESETS[0].id);
  const active =
    MOLECULE_PRESETS.find((preset) => preset.id === activeId) ??
    MOLECULE_PRESETS[0];

  return (
    <div>
      {/* Pestañas de compuestos */}
      <div
        className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        role="tablist"
        aria-label="Elegir compuesto para simular"
      >
        {MOLECULE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            role="tab"
            aria-selected={preset.id === activeId}
            onClick={() => setActiveId(preset.id)}
            className={`flex shrink-0 flex-col rounded-2xl border px-4 py-3 text-left transition active:scale-[0.98] ${
              preset.id === activeId
                ? "border-(--brand-2) bg-(--brand-2)/10 text-cream"
                : "border-paper/15 bg-white/[0.02] text-paper/70 hover:border-paper/30"
            }`}
          >
            <span className="font-display text-lg leading-none">{preset.formula}</span>
            <span className="mt-1.5 text-[11px] opacity-70">{preset.name}</span>
          </button>
        ))}
      </div>

      {/* Visor + panel informativo */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="relative min-h-[340px] overflow-hidden rounded-3xl border border-paper/15 bg-night sm:min-h-[420px]">
          <MoleculeViewer key={active.id} preset={active} />
          <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-paper/15 bg-night/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-paper/70 backdrop-blur">
            <MousePointer2 className="h-3 w-3 text-(--brand-2)" aria-hidden="true" />
            Arrastra para girar · pellizca para acercar
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-paper/15 bg-white/[0.02] p-6">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-(--brand-2)">
              <Atom className="h-3.5 w-3.5" aria-hidden="true" />
              Ficha del compuesto
            </p>
            <h3 className="mt-3 font-display text-3xl font-semibold">
              {active.name}
            </h3>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-paper/50">Fórmula</dt>
                <dd className="font-medium">{active.formula}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper/50">Geometría</dt>
                <dd className="text-right font-medium">{active.geometry}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper/50">SMILES</dt>
                <dd className="font-mono text-xs text-(--brand-2)">{active.smiles}</dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-paper/10 pt-4 text-sm leading-relaxed text-paper/65">
              {active.fact}
            </p>
          </div>

          <div className="rounded-3xl border border-(--brand-2)/25 bg-(--brand-2)/[0.06] p-5">
            <p className="flex items-start gap-2.5 text-xs leading-relaxed text-paper/70">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-(--brand-2)" aria-hidden="true" />
              <span>
                Los enlaces se calculan con radios covalentes y se rinden en
                Three.js con esferas CPK. Gira la molécula con el dedo o el ratón.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Conector opcional a Google Sites (carga diferida por privacidad) */}
      {embedUrl ? <GoogleSitesEmbed url={embedUrl} title={embedTitle} /> : null}
    </div>
  );
}

/**
 * Embebido de Google Sites con carga diferida: el iframe solo se monta
 * cuando el estudiante lo pide (privacidad + rendimiento), con estado de
 * carga accesible y alternativa de apertura en pestaña nueva.
 */
function GoogleSitesEmbed({ url, title }: { url: string; title: string }) {
  const [state, setState] = useState<"idle" | "loading" | "ready">("idle");

  return (
    <div className="mt-10">
      <div className="flex items-end justify-between gap-4 border-b border-paper/20 pb-3">
        <h3 className="flex items-center gap-2.5 font-display text-2xl font-semibold">
          <Globe2 className="h-5 w-5 text-(--brand-2)" aria-hidden="true" />
          {title}
        </h3>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs text-paper/60 transition hover:text-(--brand-2)"
        >
          Abrir en pestaña nueva
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>

      {state === "idle" ? (
        <div className="relative mt-5 flex aspect-video flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-paper/25 bg-gradient-to-b from-paper/[0.04] to-transparent p-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-(--brand-2)/30 bg-(--brand-2)/10 text-(--brand-2)">
            <MonitorPlay className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/70">
            Esta simulación se reproduce desde{" "}
            <strong className="font-medium text-paper">Google Sites</strong>.
            Al cargarla, tu navegador conectará con los servidores de Google.
          </p>
          <button
            type="button"
            onClick={() => setState("loading")}
            className="touch-target mt-5 inline-flex items-center gap-2 rounded-full bg-(--brand-2) px-6 py-3 text-sm font-semibold text-night transition hover:brightness-110 active:scale-[0.98]"
          >
            <MonitorPlay className="h-4 w-4" aria-hidden="true" />
            Cargar simulación
          </button>
          <p className="mt-3 text-[11px] text-paper/45">
            También puedes abrirla directamente en una pestaña nueva.
          </p>
        </div>
      ) : (
        <div className="relative mt-5 overflow-hidden rounded-3xl border border-paper/15 bg-paper/5">
          {state === "loading" ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-night/80 text-paper/70 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-(--brand-2)" aria-hidden="true" />
              <p className="font-mono text-[10px] uppercase tracking-[0.25em]">
                Conectando con Google Sites…
              </p>
            </div>
          ) : null}
          <iframe
            src={url}
            title={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-popups"
            className="aspect-video w-full bg-paper"
            allowFullScreen
            onLoad={() => setState("ready")}
          />
        </div>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-paper/45">
        <Sigma className="h-3 w-3" aria-hidden="true" />
        Simulaciones externas publicadas por el docente en Google Sites. Si no
        carga, ábrela en una pestaña nueva.
      </p>
    </div>
  );
}

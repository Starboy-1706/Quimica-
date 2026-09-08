"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  Atom,
  ExternalLink,
  Globe2,
  Info,
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

      {/* Conector opcional a Google Sites */}
      {embedUrl ? (
        <div className="mt-10">
          <div className="flex items-end justify-between border-b border-paper/20 pb-3">
            <h3 className="flex items-center gap-2.5 font-display text-2xl font-semibold">
              <Globe2 className="h-5 w-5 text-(--brand-2)" aria-hidden="true" />
              {embedTitle}
            </h3>
            <a
              href={embedUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-paper/60 transition hover:text-(--brand-2)"
            >
              Abrir en pestaña nueva
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
          <div className="mt-5 overflow-hidden rounded-3xl border border-paper/15 bg-paper/5">
            <iframe
              src={embedUrl}
              title={embedTitle}
              loading="lazy"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-popups"
              className="aspect-video w-full bg-paper"
              allowFullScreen
            />
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-paper/45">
            <Sigma className="h-3 w-3" aria-hidden="true" />
            Simulaciones externas publicadas por el docente en Google Sites.
          </p>
        </div>
      ) : null}
    </div>
  );
}

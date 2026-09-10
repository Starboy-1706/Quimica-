"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRightLeft, CircleHelp, Sigma } from "lucide-react";
import { AVOGADRO } from "@/lib/chemistry/elements";
import { parseFormula, type FormulaToken } from "@/lib/chemistry/formula";

const EXAMPLES = [
  "H2O",
  "H2SO4",
  "NaCl",
  "Ca(OH)2",
  "CuSO4·5H2O",
  "C6H12O6",
  "Na2CO3",
  "K4[Fe(CN)6]",
];

type Unit = "g" | "mol" | "particulas";

const UNIT_META: Record<Unit, { label: string; symbol: string }> = {
  g: { label: "Gramos", symbol: "g" },
  mol: { label: "Moles", symbol: "mol" },
  particulas: { label: "Partículas", symbol: "partículas" },
};

/** Formato amable en es-ES: notación científica para magnitudes extremas. */
function formatNumber(value: number): React.ReactNode {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e21 || abs < 0.001) {
    const [mantissa, exp] = value.toExponential(3).split("e");
    const mantissaEs = mantissa.replace(".", ",");
    return (
      <>
        {mantissaEs} × 10<sup>{exp.replace("+", "")}</sup>
      </>
    );
  }
  return new Intl.NumberFormat("es-ES", {
    maximumSignificantDigits: 6,
  }).format(value);
}

function renderFormula(tokens: FormulaToken[], baseKey: string): React.ReactNode[] {
  return tokens.map((token, i) => {
    const key = `${baseKey}-${i}`;
    if (token.kind === "subscript") {
      return (
        <sub key={key} className="text-[0.62em] font-semibold">
          {token.text}
        </sub>
      );
    }
    if (token.kind === "separator") {
      return (
        <span key={key} className="mx-0.5 opacity-70">
          ·
        </span>
      );
    }
    if (token.kind === "mult") {
      return (
        <span key={key} className="mr-0.5 text-(--brand)">
          {token.text}
        </span>
      );
    }
    return <span key={key}>{token.text}</span>;
  });
}

/**
 * Calculadora de masa molar + conversor gramos ↔ moles ↔ partículas.
 * Todo se calcula en el navegador: sin peticiones, sin esperas.
 */
export function MolarCalculator() {
  const [formulaInput, setFormulaInput] = useState("H2SO4");
  const [amountInput, setAmountInput] = useState("1");
  const [unit, setUnit] = useState<Unit>("mol");

  const parsed = useMemo(() => parseFormula(formulaInput), [formulaInput]);

  const amount = useMemo(() => {
    const normalized = amountInput.trim().replace(",", ".");
    const value = Number(normalized);
    return Number.isFinite(value) && value >= 0 ? value : null;
  }, [amountInput]);

  const conversions = useMemo(() => {
    if (!parsed.ok || amount === null) return null;
    const M = parsed.totalMass;
    let grams: number;
    let moles: number;
    let particles: number;
    if (unit === "g") {
      grams = amount;
      moles = amount / M;
      particles = moles * AVOGADRO;
    } else if (unit === "mol") {
      moles = amount;
      grams = amount * M;
      particles = moles * AVOGADRO;
    } else {
      particles = amount;
      moles = amount / AVOGADRO;
      grams = moles * M;
    }
    return { grams, moles, particles };
  }, [parsed, amount, unit]);

  return (
    <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* ── Entrada y masa molar ──────────────────────────────────────── */}
      <section aria-labelledby="calc-formula-h" className="min-w-0">
        <div className="rounded-2xl border border-ink/10 bg-white/50 p-6 sm:p-7">
          <h2 id="calc-formula-h" className="flex items-center gap-2 font-display text-xl font-semibold">
            <Sigma className="h-5 w-5 text-(--brand)" aria-hidden="true" />
            Unidad fórmula
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Escribe la fórmula con la capitalización exacta de los símbolos
            (mayúscula + minúscula): <code className="rounded bg-ink/[0.06] px-1 py-0.5 font-mono text-xs">Ca(OH)2</code>, hidratos con «·» como <code className="rounded bg-ink/[0.06] px-1 py-0.5 font-mono text-xs">CuSO4·5H2O</code>.
          </p>

          <label htmlFor="formula" className="sr-only">
            Fórmula química
          </label>
          <input
            id="formula"
            type="text"
            value={formulaInput}
            onChange={(event) => setFormulaInput(event.target.value)}
            placeholder="p. ej. H2SO4"
            autoComplete="off"
            spellCheck={false}
            inputMode="text"
            className="touch-target mt-4 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 font-mono text-lg tracking-wide text-ink placeholder:text-ink-soft/50 focus:border-(--brand) focus:outline-none"
          />

          <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Ejemplos rápidos">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setFormulaInput(example)}
                className="rounded-full border border-ink/15 px-3 py-1 font-mono text-[11px] text-ink-soft transition hover:border-(--brand) hover:text-(--brand)"
              >
                {example}
              </button>
            ))}
          </div>

          <div aria-live="polite">
            {!parsed.ok ? (
              <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-clay/30 bg-clay/[0.08] p-4 text-sm leading-relaxed text-clay">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {parsed.message}
              </p>
            ) : (
              <div className="animate-rise mt-6">
                <p className="border-b border-ink/10 pb-4 font-mono text-3xl font-semibold tracking-tight">
                  {renderFormula(parsed.tokens, "pretty")}
                </p>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-ink p-4 text-paper">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-paper/60">
                      Masa molar
                    </p>
                    <p className="mt-1 font-display text-xl font-bold leading-tight sm:text-2xl">
                      {parsed.totalMass.toLocaleString("es-ES", {
                        maximumFractionDigits: 3,
                        minimumFractionDigits: 3,
                      })}
                    </p>
                    <p className="font-mono text-[9px] text-paper/60">g/mol</p>
                  </div>
                  <div className="rounded-xl border border-ink/10 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-soft">
                      Átomos
                    </p>
                    <p className="mt-1 font-display text-xl font-bold leading-tight sm:text-2xl">
                      {parsed.atomCount}
                    </p>
                    <p className="font-mono text-[9px] text-ink-soft">por unidad</p>
                  </div>
                  <div className="rounded-xl border border-ink/10 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-soft">
                      Elementos
                    </p>
                    <p className="mt-1 font-display text-xl font-bold leading-tight sm:text-2xl">
                      {parsed.parts.length}
                    </p>
                    <p className="font-mono text-[9px] text-ink-soft">distintos</p>
                  </div>
                </div>

                {/* Desglose por elemento */}
                <h3 className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
                  Composición porcentual
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {parsed.parts.map((part) => (
                    <li key={part.symbol}>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <p className="min-w-0">
                          <span className="font-mono font-bold">{part.symbol}</span>{" "}
                          <span className="text-ink-soft">{part.name}</span>
                          <span className="ml-2 font-mono text-xs text-(--brand)">
                            ×{part.count}
                          </span>
                        </p>
                        <p className="shrink-0 font-mono text-xs text-ink-soft">
                          {part.contribution.toLocaleString("es-ES", {
                            maximumFractionDigits: 3,
                          })}{" "}
                          g/mol ·{" "}
                          <strong className="font-semibold text-ink">
                            {part.percent.toLocaleString("es-ES", {
                              maximumFractionDigits: 1,
                            })}
                            %
                          </strong>
                        </p>
                      </div>
                      <div
                        className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]"
                        role="presentation"
                      >
                        <div
                          className="h-full rounded-full bg-(--brand) transition-all duration-500"
                          style={{ width: `${Math.max(1.5, part.percent)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-soft">
          <CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--brand)" aria-hidden="true" />
          Masas atómicas estándar de la IUPAC redondeadas a tres decimales.
          La masa molar numéricamente coincide con la masa de un mol de
          unidades fórmula del compuesto.
        </p>
      </section>

      {/* ── Conversor ─────────────────────────────────────────────────── */}
      <section aria-labelledby="calc-conv-h" className="min-w-0">
        <div className="rounded-2xl border border-ink/10 bg-white/50 p-6 sm:p-7">
          <h2 id="calc-conv-h" className="flex items-center gap-2 font-display text-xl font-semibold">
            <ArrowRightLeft className="h-5 w-5 text-(--brand)" aria-hidden="true" />
            Conversor g ↔ mol ↔ partículas
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Con la masa molar calculada, convierte cualquier cantidad. Usa la
            constante de Avogadro N<sub>A</sub> = 6,022 × 10²³ mol⁻¹.
          </p>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row">
            <label htmlFor="amount" className="block flex-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                Cantidad
              </span>
              <input
                id="amount"
                type="text"
                value={amountInput}
                onChange={(event) => setAmountInput(event.target.value)}
                placeholder="p. ej. 2,5"
                inputMode="decimal"
                autoComplete="off"
                disabled={!parsed.ok}
                className="touch-target mt-1.5 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 font-mono text-lg text-ink placeholder:text-ink-soft/50 focus:border-(--brand) focus:outline-none disabled:opacity-40"
              />
            </label>
            <fieldset className="sm:w-44">
              <legend className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                Unidad de entrada
              </legend>
              <div className="mt-1.5 flex rounded-xl border border-ink/15 p-1">
                {(Object.keys(UNIT_META) as Unit[]).map((candidate) => (
                  <button
                    key={candidate}
                    type="button"
                    onClick={() => setUnit(candidate)}
                    aria-pressed={unit === candidate}
                    disabled={!parsed.ok}
                    className={`flex-1 rounded-lg px-2 py-2 font-mono text-[10.5px] font-medium transition disabled:opacity-40 ${
                      unit === candidate
                        ? "bg-ink text-paper"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {UNIT_META[candidate].symbol}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-6 space-y-3" aria-live="polite">
            {!parsed.ok ? (
              <p className="rounded-xl border border-dashed border-ink/25 p-5 text-center text-sm text-ink-soft">
                Primero escribe una fórmula válida a la izquierda.
              </p>
            ) : amount === null ? (
              <p className="rounded-xl border border-dashed border-ink/25 p-5 text-center text-sm text-ink-soft">
                Introduce una cantidad (número positivo) para convertir.
              </p>
            ) : conversions ? (
              (Object.keys(UNIT_META) as Unit[]).map((targetUnit) => {
                const isSource = targetUnit === unit;
                const value =
                  targetUnit === "g"
                    ? conversions.grams
                    : targetUnit === "mol"
                      ? conversions.moles
                      : conversions.particles;
                return (
                  <div
                    key={targetUnit}
                    className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition ${
                      isSource
                        ? "border-ink/10 bg-paper-deep/40 opacity-60"
                        : "border-ink/15 bg-ink text-paper shadow-[0_16px_35px_-20px_rgba(27,23,16,0.7)]"
                    }`}
                  >
                    <div>
                      <p className={`font-mono text-[9.5px] uppercase tracking-[0.18em] ${isSource ? "text-ink-soft" : "text-paper/55"}`}>
                        {UNIT_META[targetUnit].label}
                        {isSource ? " · entrada" : ""}
                      </p>
                      <p className="mt-1 font-display text-xl font-bold leading-tight sm:text-2xl">
                        {formatNumber(value)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 font-mono text-[10px] font-medium ${
                        isSource ? "bg-ink/[0.06] text-ink-soft" : "bg-paper/10 text-paper/80"
                      }`}
                    >
                      {targetUnit === "g"
                        ? "g"
                        : targetUnit === "mol"
                          ? "mol"
                          : "unid. fórmula"}
                    </span>
                  </div>
                );
              })
            ) : null}
          </div>

          <div className="mt-6 rounded-xl bg-paper-deep/50 p-4 text-xs leading-relaxed text-ink-soft">
            <p className="font-semibold text-ink">Datos para tu cuaderno</p>
            <ul className="mt-1.5 space-y-1 font-mono text-[11px]">
              <li>n (mol) = m (g) ÷ M (g/mol)</li>
              <li>m (g) = n (mol) × M (g/mol)</li>
              <li>N (partículas) = n (mol) × 6,022×10²³</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

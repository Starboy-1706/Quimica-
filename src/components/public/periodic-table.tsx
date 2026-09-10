"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Calculator, GraduationCap, Search, X } from "lucide-react";
import {
  CATEGORIES,
  CATEGORY_MAP,
  ELEMENTS,
  categoryLabel,
  type ElementCategory,
  type PeriodicElement,
} from "@/lib/chemistry/elements";

/** Coordenadas de pantalla: bloque f en filas propias (8–9, columnas 4–17). */
function displayCoords(el: PeriodicElement): { col: number; row: number } {
  if (el.category === "lantanido") return { col: 4 + (el.z - 57), row: 8 };
  if (el.category === "actinido") return { col: 4 + (el.z - 89), row: 9 };
  return { col: el.group ?? 1, row: el.period };
}

const COORDS = new Map(ELEMENTS.map((el) => [el.z, displayCoords(el)]));

const F_MARKERS = [
  { label: "57–71", sub: "La–Lu", col: 3, row: 6, category: "lantanido" as ElementCategory },
  { label: "89–103", sub: "Ac–Lr", col: 3, row: 7, category: "actinido" as ElementCategory },
];

function normalizeQuery(q: string): string {
  return q
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const SEARCHABLE = new Map(
  ELEMENTS.map((el) => [
    el.z,
    normalizeQuery(el.name + el.symbol + String(el.z)),
  ]),
);

function matchesQuery(el: PeriodicElement, query: string): boolean {
  if (!query) return true;
  return SEARCHABLE.get(el.z)!.includes(normalizeQuery(query));
}

/**
 * Tabla periódica interactiva: búsqueda, filtro por familia, navegación
 * con flechas de teclado y ficha detallada de cada elemento.
 */
export function PeriodicTable() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ElementCategory | null>(null);
  const [selectedZ, setSelectedZ] = useState<number | null>(1);
  const gridRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => ELEMENTS.find((el) => el.z === selectedZ) ?? null,
    [selectedZ],
  );

  const matchCount = useMemo(
    () => ELEMENTS.filter((el) => matchesQuery(el, query)).length,
    [query],
  );

  const toggleCategory = (id: ElementCategory) =>
    setCategory((current) => (current === id ? null : id));

  /** Navegación con flechas dentro de la cuadrícula (accesibilidad). */
  function onTileKeyDown(event: React.KeyboardEvent, el: PeriodicElement) {
    const { col, row } = COORDS.get(el.z)!;
    let target: PeriodicElement | null = null;

    if (event.key === "ArrowRight") {
      target =
        ELEMENTS.find((c) => {
          const cc = COORDS.get(c.z)!;
          return cc.row === row && cc.col === col + 1;
        }) ??
        ELEMENTS.find((c) => {
          const cc = COORDS.get(c.z)!;
          return cc.row === row + 1 && cc.col === 1;
        }) ??
        null;
    } else if (event.key === "ArrowLeft") {
      target =
        ELEMENTS.find((c) => {
          const cc = COORDS.get(c.z)!;
          return cc.row === row && cc.col === col - 1;
        }) ??
        [...ELEMENTS].reverse().find((c) => {
          const cc = COORDS.get(c.z)!;
          return cc.row === row - 1;
        }) ??
        null;
    } else if (event.key === "ArrowDown") {
      target =
        ELEMENTS.filter((c) => {
          const cc = COORDS.get(c.z)!;
          return cc.col === col && cc.row > row;
        }).sort(
          (a, b) => COORDS.get(a.z)!.row - COORDS.get(b.z)!.row,
        )[0] ?? null;
    } else if (event.key === "ArrowUp") {
      target =
        ELEMENTS.filter((c) => {
          const cc = COORDS.get(c.z)!;
          return cc.col === col && cc.row < row;
        }).sort(
          (a, b) => COORDS.get(b.z)!.row - COORDS.get(a.z)!.row,
        )[0] ?? null;
    }

    if (target) {
      event.preventDefault();
      gridRef.current
        ?.querySelector<HTMLButtonElement>(`[data-z="${target.z}"]`)
        ?.focus();
    }
  }

  return (
    <div className="mt-10">
      {/* ── Herramientas: búsqueda + familias ─────────────────────────── */}
      <div className="flex flex-col gap-4 border-b-2 border-ink pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block max-w-md flex-1">
            <span className="sr-only">Buscar elemento por nombre, símbolo o número atómico</span>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar: hierro, Fe, 26…"
              className="touch-target w-full rounded-full border border-ink/15 bg-paper py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-ink-soft/70 focus:border-(--brand) focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpiar búsqueda"
                className="touch-target absolute right-1 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full text-ink-soft transition hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </label>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft" aria-live="polite">
            {query ? `${matchCount} de 118 elementos` : "118 elementos · 10 familias"}
          </p>
        </div>

        <ul className="flex flex-wrap gap-1.5" aria-label="Filtrar por familia química">
          {CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                    active
                      ? "border-transparent text-ink shadow-[inset_0_0_0_1px_rgba(27,23,16,0.35)]"
                      : "border-ink/15 text-ink-soft hover:border-ink/35 hover:text-ink"
                  }`}
                  style={active ? { backgroundColor: cat.color } : undefined}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                    aria-hidden="true"
                  />
                  {cat.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
        {/* ── Cuadrícula ──────────────────────────────────────────────── */}
        <div className="min-w-0">
          <div className="overflow-x-auto pb-3" role="group" aria-label="Tabla periódica de los elementos">
            <div ref={gridRef} className="min-w-[980px]">
              {/* Cabecera de grupos */}
              <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1" aria-hidden="true">
                {Array.from({ length: 18 }, (_, i) => (
                  <span
                    key={i}
                    className="pb-1 text-center font-mono text-[9px] font-medium tracking-wider text-ink-soft"
                  >
                    {i + 1}
                  </span>
                ))}
              </div>

              {/* Bloque principal (filas 1–7) + bloque f (filas 8–9) */}
              <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] grid-rows-[repeat(9,auto)] gap-1">
                {ELEMENTS.map((el) => {
                  const { col, row } = COORDS.get(el.z)!;
                  const catInfo = CATEGORY_MAP.get(el.category)!;
                  const dimmedQuery = query && !matchesQuery(el, query);
                  const dimmedCategory = category && el.category !== category;
                  const dimmed = Boolean(dimmedQuery || dimmedCategory);
                  const isSelected = selectedZ === el.z;

                  return (
                    <button
                      key={el.z}
                      type="button"
                      data-z={el.z}
                      onClick={() => setSelectedZ(isSelected ? null : el.z)}
                      onKeyDown={(event) => onTileKeyDown(event, el)}
                      aria-pressed={isSelected}
                      aria-label={`${el.name}, símbolo ${el.symbol}, número atómico ${el.z}`}
                      className={`group relative flex aspect-square flex-col items-center justify-center rounded-md px-0.5 text-ink transition duration-150 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:ring-offset-1 focus-visible:outline-none ${
                        dimmed ? "opacity-15 saturate-50" : "hover:z-10 hover:scale-110 hover:shadow-[0_8px_20px_-6px_rgba(27,23,16,0.45)]"
                      } ${isSelected ? "z-10 scale-110 shadow-[0_10px_24px_-6px_rgba(27,23,16,0.5)] ring-2 ring-ink" : ""}`}
                      style={{
                        gridColumnStart: col,
                        gridRowStart: row,
                        backgroundColor: catInfo.color,
                        marginTop: row === 8 ? "1.1rem" : undefined,
                      }}
                    >
                      <span className="absolute left-1 top-0.5 font-mono text-[7px] font-medium opacity-70">
                        {el.z}
                      </span>
                      <span className="font-display text-sm font-bold leading-none tracking-tight sm:text-base">
                        {el.symbol}
                      </span>
                      <span className="mt-0.5 hidden max-w-full truncate px-0.5 text-[6.5px] leading-tight opacity-80 xl:block">
                        {el.name}
                      </span>
                    </button>
                  );
                })}

                {/* Marcadores del bloque f */}
                {F_MARKERS.map((marker) => (
                  <button
                    key={marker.label}
                    type="button"
                    onClick={() => toggleCategory(marker.category)}
                    aria-label={`Ver ${categoryLabel(marker.category)}, elementos ${marker.sub}`}
                    className="flex aspect-square flex-col items-center justify-center rounded-md border border-dashed border-ink/30 text-ink-soft transition hover:border-(--brand) hover:text-(--brand)"
                    style={{
                      gridColumnStart: marker.col,
                      gridRowStart: marker.row,
                    }}
                  >
                    <span className="font-mono text-[8px] font-semibold tracking-tight">
                      {marker.label}
                    </span>
                    <span className="text-[6.5px] opacity-80">{marker.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-2 flex items-center gap-2 text-xs text-ink-soft lg:hidden">
            <span aria-hidden="true">←</span> Desliza horizontalmente para ver
            toda la tabla <span aria-hidden="true">→</span>
          </p>
        </div>

        {/* ── Ficha del elemento ──────────────────────────────────────── */}
        <aside aria-live="polite" aria-label="Detalle del elemento seleccionado">
          {selected ? (
            <ElementCard element={selected} onClose={() => setSelectedZ(null)} />
          ) : (
            <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-ink/25 bg-paper-deep/40 p-8 text-center">
              <GraduationCap className="h-7 w-7 text-(--brand)" strokeWidth={1.5} aria-hidden="true" />
              <p className="mt-3 font-display text-lg font-medium">
                Toca cualquier elemento
              </p>
              <p className="mt-1 max-w-52 text-xs leading-relaxed text-ink-soft">
                Verás su masa atómica, configuración electrónica,
                electronegatividad y familia química.
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* ── Cruces con las otras herramientas ─────────────────────────── */}
      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-6">
        <p className="mr-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          Sigue estudiando:
        </p>
        <Link
          href="/estudio/calculadora"
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-xs font-medium transition hover:border-(--brand) hover:text-(--brand)"
        >
          <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
          Calcula una masa molar
        </Link>
        <Link
          href="/estudio/quiz"
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-xs font-medium transition hover:border-(--brand) hover:text-(--brand)"
        >
          <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
          Pon a prueba la tabla
        </Link>
      </div>
    </div>
  );
}

function ElementCard({
  element,
  onClose,
}: {
  element: PeriodicElement;
  onClose: () => void;
}) {
  const catInfo = CATEGORY_MAP.get(element.category)!;

  const rows: Array<{ label: string; value: React.ReactNode; mono?: boolean }> = [
    {
      label: "Masa atómica",
      value: element.isotopeMass ? (
        <>
          [{element.mass}]{" "}
          <span className="text-[10px] text-ink-soft">isótopo más estable · g/mol</span>
        </>
      ) : (
        <>
          {element.mass.toLocaleString("es-ES")}{" "}
          <span className="text-[10px] text-ink-soft">g/mol</span>
        </>
      ),
    },
    {
      label: "Configuración electrónica",
      value: element.config,
      mono: true,
    },
    {
      label: "Electronegatividad",
      value:
        element.eneg !== null ? (
          <>
            {element.eneg.toLocaleString("es-ES")}{" "}
            <span className="text-[10px] text-ink-soft">escala de Pauling</span>
          </>
        ) : (
          "Sin definir"
        ),
    },
    {
      label: "Periodo",
      value: `${element.period} · ${element.period}ª fila`,
    },
    {
      label: "Grupo",
      value:
        element.group !== null
          ? `Grupo ${element.group}`
          : `Bloque f (${catInfo.label.toLowerCase()})`,
    },
    {
      label: "Bloque",
      value: `Orbital ${element.block}`,
      mono: true,
    },
  ];

  return (
    <div
      className="animate-rise overflow-hidden rounded-2xl text-ink shadow-[0_22px_55px_-28px_rgba(27,23,16,0.55)] lg:sticky lg:top-24"
      key={element.z}
    >
      <div
        className="relative flex items-end justify-between p-5"
        style={{ backgroundColor: catInfo.color }}
      >
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] opacity-75">
            Z = {element.z}
          </p>
          <p className="mt-1 font-display text-5xl font-black leading-none">
            {element.symbol}
          </p>
          <p className="mt-1.5 text-lg font-semibold">{element.name}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ficha del elemento"
          className="touch-target -m-2 inline-flex items-center justify-center rounded-full text-ink/60 transition hover:bg-ink/10 hover:text-ink"
        >
          <X className="h-4.5 w-4.5" aria-hidden="true" />
        </button>
      </div>

      <div className="border-x border-b border-ink/10 bg-white/60 p-5">
        <p
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-ink"
          style={{ backgroundColor: `${catInfo.color}66` }}
        >
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: catInfo.color }} aria-hidden="true" />
          {catInfo.label}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          {catInfo.description}
        </p>

        <dl className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-soft">
                {row.label}
              </dt>
              <dd className={`text-right text-[13px] font-semibold ${row.mono ? "font-mono" : ""}`}>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        {element.fact ? (
          <p className="mt-4 rounded-xl bg-paper-deep/70 p-3.5 text-xs leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">¿Sabías que…? </span>
            {element.fact}
          </p>
        ) : null}
      </div>
    </div>
  );
}

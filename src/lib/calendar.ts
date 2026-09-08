/**
 * Utilidades de calendario para la agenda académica pública.
 * Módulo de dominio (las páginas lo usan desde Server Components).
 */

export type MonthCursor = { year: number; month: number };

export function currentDay(): Date {
  return new Date();
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Clave local yyyy-mm-dd (sin desfases de zona horaria). */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addMonths({ year, month }: MonthCursor, delta: number): MonthCursor {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

export const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

/** Semana en español (empieza en lunes). */
export const WEEKDAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"] as const;
export const WEEKDAY_LONG = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
] as const;

export type CalendarCell = { date: Date; key: string; inMonth: boolean } | null;

/** Rejilla de 6 semanas × 7 días para pintar el mes (lunes primero). */
export function buildMonthGrid({ year, month }: MonthCursor): CalendarCell[][] {
  const first = new Date(year, month - 1, 1);
  // 0 (domingo) → 6; 1 (lunes) → 0 …
  const lead = (first.getDay() + 6) % 7;
  const grid: CalendarCell[][] = [];
  let cursor = new Date(year, month - 1, 1 - lead);

  for (let week = 0; week < 6; week += 1) {
    const row: CalendarCell[] = [];
    for (let day = 0; day < 7; day += 1) {
      const current = new Date(cursor);
      const inMonth = current.getMonth() === month - 1;
      row.push(
        inMonth || (week === 0 && day >= lead) || (week > 0)
          ? { date: current, key: toDateKey(current), inMonth }
          : null,
      );
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
    }
    grid.push(row);
  }
  return grid;
}

const longDateFormatter = new Intl.DateTimeFormat("es", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatLongDate(date: Date): string {
  return longDateFormatter.format(date);
}

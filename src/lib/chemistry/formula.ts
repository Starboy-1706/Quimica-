/**
 * Analizador de fórmulas químicas para la calculadora de masa molar.
 *
 * Soporta la sintaxis habitual de un curso de química:
 *   · Símbolos de elemento con su capitalización correcta: H, O, Na, Fe…
 *   · Subíndices enteros: H2O, C6H12O6
 *   · Paréntesis anidados con multiplicador: Ca(OH)2, K4[Fe(CN)6]·3H2O
 *   · Hidratos/separadores con «·», «.» o «*»: CuSO4·5H2O
 *   · Corchetes y llaves equivalentes a paréntesis
 *
 * Los subíndices son enteros (nivel escolar): «Fe0.94O» se interpreta
 * como hidrato; orienta al estudiante a redondear subíndices.
 *
 * Todo el análisis es local: no hay dependencias ni efectos secundarios.
 */

import { elementBySymbol } from "./elements";

export type FormulaPart = {
  symbol: string;
  name: string;
  z: number;
  count: number;
  mass: number;
  /** Contribución en masa (g/mol) dentro de la molécula. */
  contribution: number;
  /** Porcentaje en masa (0–100). */
  percent: number;
};

export type ParseSuccess = {
  ok: true;
  /** Tokens normalizados para renderizar con subíndices. */
  tokens: FormulaToken[];
  parts: FormulaPart[];
  totalMass: number;
  /** Total de átomos de la unidad fórmula (suma de subíndices). */
  atomCount: number;
};

export type ParseError = {
  ok: false;
  message: string;
  position?: number;
};

export type ParseResult = ParseSuccess | ParseError;

export type FormulaToken = {
  text: string;
  kind: "element" | "subscript" | "mult" | "separator" | "delimiter";
};

/** Normaliza la entrada: sin espacios, hidratos con «·», separadores unificados. */
function normalize(input: string): string {
  return input
    .replace(/\s+/g, "")
    .replace(/\*(?=\d)/g, "·") // Al2(SO4)3*18H2O
    .replace(/\.(?=\d)/g, "·") // CuSO4.5H2O (punto solo como hidrato antes de dígito)
    .replace(/([\]\}])/g, ")")
    .replace(/[\[\{]/g, "(");
}

/** Sugerencia amable cuando el símbolo no existe (p. ej. co → Co). */
function suggestSymbol(raw: string): string | null {
  const candidate =
    raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  if (candidate !== raw && elementBySymbol(candidate)) return candidate;
  // También prueba quitando la última letra (NaCl → «Nacl» suele ser error).
  const shorter = raw.slice(0, -1);
  if (shorter && shorter.charAt(0).toUpperCase() === shorter.charAt(0)) {
    const alt = shorter.charAt(0).toUpperCase() + shorter.slice(1).toLowerCase();
    if (elementBySymbol(alt)) return alt;
  }
  return null;
}

/**
 * Analiza `input` como unidad fórmula y devuelve masa molar y desglose.
 * El coeficiente estequiométrico inicial (p. ej. «2» en «2H2O») se acepta
 * pero no altera la masa molar: se informa aparte.
 */
export function parseFormula(rawInput: string): ParseResult {
  const input = normalize(rawInput.trim());

  if (!input) {
    return { ok: false, message: "Escribe una fórmula, por ejemplo H2SO4." };
  }

  // Coeficiente estequiométrico inicial por parte de hidrato: «2H2O».
  const ambiguousMatch = /^(\d+)/.exec(input);
  if (ambiguousMatch) {
    return {
      ok: false,
      message: `El coeficiente inicial «${ambiguousMatch[1]}» no cambia la masa molar: escribe la unidad fórmula sin él (${input.slice(
        ambiguousMatch[1].length,
      )}).`,
      position: 0,
    };
  }

  // Partes separadas por hidrato (CuSO4·5H2O): cada sub-parte puede tener
  // multiplicador propio que sí cuenta (5H2O).
  const hydrateParts = input.split("·");
  const accumulator = new Map<string, number>();

  for (const part of hydrateParts) {
    if (!part) {
      return { ok: false, message: "Hay un separador «·» sin fórmula alrededor." };
    }
    const innerResult = parseGroup(part, accumulator);
    if (!innerResult.ok) return innerResult;
  }

  return buildResult(input, accumulator);
}

type GroupResult = { ok: true } | ParseError;

/** Analiza una parte (sin separadores «·») y acumula en el mapa. */
function parseGroup(
  part: string,
  accumulator: Map<string, number>,
): GroupResult {
  // Multiplicador de hidrato: «5H2O» multiplica todo lo que sigue.
  const multiplierMatch = /^(\d+)/.exec(part);
  const multiplier = multiplierMatch ? Number(multiplierMatch[1]) : 1;
  const body = multiplierMatch ? part.slice(multiplierMatch[1].length) : part;

  if (multiplierMatch && Number(multiplierMatch[1]) === 0) {
    return { ok: false, message: "El multiplicador no puede ser 0.", position: 0 };
  }
  if (!body) {
    return { ok: false, message: `El multiplicador ${multiplierMatch?.[1]} no tiene fórmula detrás.` };
  }

  // Pila de mapas para paréntesis anidados.
  const stack: Map<string, number>[] = [new Map()];
  let i = 0;

  const addTo = (target: Map<string, number>, sym: string, n: number) => {
    target.set(sym, (target.get(sym) ?? 0) + n);
  };

  while (i < body.length) {
    const ch = body[i];

    if (/[A-Z]/.test(ch)) {
      let sym = ch;
      i++;
      if (i < body.length && /[a-z]/.test(body[i])) {
        sym += body[i];
        i++;
      }
      if (!elementBySymbol(sym)) {
        const suggestion = suggestSymbol(sym);
        return {
          ok: false,
          message: suggestion
            ? `«${sym}» no es un elemento conocido. ¿Quisiste decir ${suggestion}? Recuerda: mayúscula inicial y minúscula después (Co ≠ co).`
            : `«${sym}» no corresponde a ningún elemento de la tabla periódica.`,
          position: i - sym.length,
        };
      }
      const numMatch = /^(\d+)/.exec(body.slice(i));
      const count = numMatch ? Number(numMatch[1]) : 1;
      if (numMatch) i += numMatch[1].length;
      if (count === 0) {
        return { ok: false, message: `El subíndice de ${sym} no puede ser 0.`, position: i };
      }
      addTo(stack[stack.length - 1], sym, count);
      continue;
    }

    if (/[a-z]/.test(ch)) {
      return {
        ok: false,
        message: `La minúscula «${ch}» aparece sin su mayúscula previa. Los símbolos empiezan en mayúscula: Cl, no cl; Na, no na.`,
        position: i,
      };
    }

    if (ch === "(") {
      stack.push(new Map());
      i++;
      continue;
    }

    if (ch === ")") {
      if (stack.length === 1) {
        return { ok: false, message: "Hay un paréntesis de cierre sin apertura.", position: i };
      }
      const groupMap = stack.pop()!;
      if (groupMap.size === 0) {
        return { ok: false, message: "Hay un paréntesis vacío «()».", position: i };
      }
      i++;
      const numMatch = /^(\d+)/.exec(body.slice(i));
      const groupMult = numMatch ? Number(numMatch[1]) : 1;
      if (numMatch) i += numMatch[1].length;
      for (const [sym, n] of groupMap) {
        addTo(stack[stack.length - 1], sym, n * groupMult);
      }
      continue;
    }

    return {
      ok: false,
      message: `El carácter «${ch}» no es válido en una fórmula (usa elementos, números y paréntesis).`,
      position: i,
    };
  }

  if (stack.length !== 1) {
    return { ok: false, message: "Falta cerrar un paréntesis «)»." };
  }

  for (const [sym, n] of stack[0]) {
    accumulator.set(sym, (accumulator.get(sym) ?? 0) + n * multiplier);
  }
  return { ok: true };
}

function buildResult(input: string, accumulator: Map<string, number>): ParseResult {
  const parts: FormulaPart[] = [];
  let totalMass = 0;
  let atomCount = 0;

  for (const [symbol, count] of accumulator) {
    const el = elementBySymbol(symbol)!;
    const contribution = el.mass * count;
    totalMass += contribution;
    atomCount += count;
    parts.push({
      symbol,
      name: el.name,
      z: el.z,
      count,
      mass: el.mass,
      contribution,
      percent: 0, // Se rellena tras conocer totalMass.
    });
  }

  if (parts.length === 0) {
    return { ok: false, message: "No encontré ningún elemento en la fórmula." };
  }

  for (const part of parts) {
    part.percent = (part.contribution / totalMass) * 100;
  }

  const tokens = buildDisplayTokens(input);
  return { ok: true, tokens, parts, totalMass, atomCount };
}

/** Genera los tokens de visualización (dígitos → subíndice, coeficiente → multiplicador). */
export function buildDisplayTokens(input: string): FormulaToken[] {
  const tokens: FormulaToken[] = [];
  let atStartOfPart = true;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "·") {
      tokens.push({ text: "·", kind: "separator" });
      atStartOfPart = true;
      continue;
    }
    if (/[A-Z]/.test(ch)) {
      let text = ch;
      if (i + 1 < input.length && /[a-z]/.test(input[i + 1])) {
        text += input[i + 1];
        i++;
      }
      tokens.push({ text, kind: "element" });
      atStartOfPart = false;
      continue;
    }
    if (/\d/.test(ch) || ch === ".") {
      let num = ch;
      while (i + 1 < input.length && /[\d.]/.test(input[i + 1])) {
        num += input[i + 1];
        i++;
      }
      tokens.push({ text: num, kind: atStartOfPart ? "mult" : "subscript" });
      atStartOfPart = false;
      continue;
    }
    if (ch === "(" || ch === ")") {
      tokens.push({ text: ch, kind: "delimiter" });
      atStartOfPart = false;
      continue;
    }
    tokens.push({ text: ch, kind: "delimiter" });
  }
  return tokens;
}

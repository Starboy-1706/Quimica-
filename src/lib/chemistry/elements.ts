/**
 * Base de datos local de los 118 elementos químicos.
 *
 * Pensada para herramientas de estudio 100 % en el navegador: tabla
 * periódica interactiva, calculadora de masa molar y quiz de práctica.
 * No requiere base de datos ni red: los datos viven en este módulo.
 *
 * Masas atómicas: pesos atómicos estándar IUPAC (redondeados). Para los
 * elementos sintéticos se indica la masa del isótopo más estable (marcada
 * visualmente con corchetes en la interfaz).
 */

export type ElementCategory =
  | "no-metal"
  | "halogeno"
  | "gas-noble"
  | "alcalino"
  | "alcalinoterreo"
  | "metaloide"
  | "transicion"
  | "post-transicion"
  | "lantanido"
  | "actinido";

export type PeriodicElement = {
  /** Número atómico (protones). */
  z: number;
  /** Símbolo químico (p. ej. "Fe"). */
  symbol: string;
  /** Nombre en español (p. ej. "Hierro"). */
  name: string;
  /** Masa atómica estándar (g/mol) o masa del isótopo más estable. */
  mass: number;
  category: ElementCategory;
  period: number;
  /** Grupo IUPAC 1–18; null para lantánidos/actínidos (bloque f). */
  group: number | null;
  /** Electronegatividad de Pauling; null si no está definida. */
  eneg: number | null;
  /** Configuración electrónica abreviada (notación gas noble). */
  config: string;
  /** Bloque orbital derivado. */
  block: "s" | "p" | "d" | "f";
  /** true si la masa corresponde al isótopo más estable (elemento sintético). */
  isotopeMass: boolean;
  /** Dato curioso breve, cuando existe. */
  fact?: string;
};

type RawElement = [
  z: number,
  symbol: string,
  name: string,
  mass: number,
  category: ElementCategory,
  period: number,
  group: number | null,
  eneg: number | null,
  config: string,
];

const RAW: RawElement[] = [
  // Periodo 1 ─────────────────────────────────────────────────────────
  [1, "H", "Hidrógeno", 1.008, "no-metal", 1, 1, 2.2, "1s¹"],
  [2, "He", "Helio", 4.003, "gas-noble", 1, 18, null, "1s²"],
  // Periodo 2 ─────────────────────────────────────────────────────────
  [3, "Li", "Litio", 6.94, "alcalino", 2, 1, 0.98, "[He] 2s¹"],
  [4, "Be", "Berilio", 9.012, "alcalinoterreo", 2, 2, 1.57, "[He] 2s²"],
  [5, "B", "Boro", 10.81, "metaloide", 2, 13, 2.04, "[He] 2s² 2p¹"],
  [6, "C", "Carbono", 12.011, "no-metal", 2, 14, 2.55, "[He] 2s² 2p²"],
  [7, "N", "Nitrógeno", 14.007, "no-metal", 2, 15, 3.04, "[He] 2s² 2p³"],
  [8, "O", "Oxígeno", 15.999, "no-metal", 2, 16, 3.44, "[He] 2s² 2p⁴"],
  [9, "F", "Flúor", 18.998, "halogeno", 2, 17, 3.98, "[He] 2s² 2p⁵"],
  [10, "Ne", "Neón", 20.18, "gas-noble", 2, 18, null, "[He] 2s² 2p⁶"],
  // Periodo 3 ─────────────────────────────────────────────────────────
  [11, "Na", "Sodio", 22.99, "alcalino", 3, 1, 0.93, "[Ne] 3s¹"],
  [12, "Mg", "Magnesio", 24.305, "alcalinoterreo", 3, 2, 1.31, "[Ne] 3s²"],
  [13, "Al", "Aluminio", 26.982, "post-transicion", 3, 13, 1.61, "[Ne] 3s² 3p¹"],
  [14, "Si", "Silicio", 28.085, "metaloide", 3, 14, 1.9, "[Ne] 3s² 3p²"],
  [15, "P", "Fósforo", 30.974, "no-metal", 3, 15, 2.19, "[Ne] 3s² 3p³"],
  [16, "S", "Azufre", 32.06, "no-metal", 3, 16, 2.58, "[Ne] 3s² 3p⁴"],
  [17, "Cl", "Cloro", 35.45, "halogeno", 3, 17, 3.16, "[Ne] 3s² 3p⁵"],
  [18, "Ar", "Argón", 39.948, "gas-noble", 3, 18, null, "[Ne] 3s² 3p⁶"],
  // Periodo 4 ─────────────────────────────────────────────────────────
  [19, "K", "Potasio", 39.098, "alcalino", 4, 1, 0.82, "[Ar] 4s¹"],
  [20, "Ca", "Calcio", 40.078, "alcalinoterreo", 4, 2, 1.0, "[Ar] 4s²"],
  [21, "Sc", "Escandio", 44.956, "transicion", 4, 3, 1.36, "[Ar] 3d¹ 4s²"],
  [22, "Ti", "Titanio", 47.867, "transicion", 4, 4, 1.54, "[Ar] 3d² 4s²"],
  [23, "V", "Vanadio", 50.942, "transicion", 4, 5, 1.63, "[Ar] 3d³ 4s²"],
  [24, "Cr", "Cromo", 51.996, "transicion", 4, 6, 1.66, "[Ar] 3d⁵ 4s¹"],
  [25, "Mn", "Manganeso", 54.938, "transicion", 4, 7, 1.55, "[Ar] 3d⁵ 4s²"],
  [26, "Fe", "Hierro", 55.845, "transicion", 4, 8, 1.83, "[Ar] 3d⁶ 4s²"],
  [27, "Co", "Cobalto", 58.933, "transicion", 4, 9, 1.88, "[Ar] 3d⁷ 4s²"],
  [28, "Ni", "Níquel", 58.693, "transicion", 4, 10, 1.91, "[Ar] 3d⁸ 4s²"],
  [29, "Cu", "Cobre", 63.546, "transicion", 4, 11, 1.9, "[Ar] 3d¹⁰ 4s¹"],
  [30, "Zn", "Zinc", 65.38, "transicion", 4, 12, 1.65, "[Ar] 3d¹⁰ 4s²"],
  [31, "Ga", "Galio", 69.723, "post-transicion", 4, 13, 1.81, "[Ar] 3d¹⁰ 4s² 4p¹"],
  [32, "Ge", "Germanio", 72.63, "metaloide", 4, 14, 2.01, "[Ar] 3d¹⁰ 4s² 4p²"],
  [33, "As", "Arsénico", 74.922, "metaloide", 4, 15, 2.18, "[Ar] 3d¹⁰ 4s² 4p³"],
  [34, "Se", "Selenio", 78.971, "no-metal", 4, 16, 2.55, "[Ar] 3d¹⁰ 4s² 4p⁴"],
  [35, "Br", "Bromo", 79.904, "halogeno", 4, 17, 2.96, "[Ar] 3d¹⁰ 4s² 4p⁵"],
  [36, "Kr", "Kriptón", 83.798, "gas-noble", 4, 18, 3.0, "[Ar] 3d¹⁰ 4s² 4p⁶"],
  // Periodo 5 ─────────────────────────────────────────────────────────
  [37, "Rb", "Rubidio", 85.468, "alcalino", 5, 1, 0.82, "[Kr] 5s¹"],
  [38, "Sr", "Estroncio", 87.62, "alcalinoterreo", 5, 2, 0.95, "[Kr] 5s²"],
  [39, "Y", "Itrio", 88.906, "transicion", 5, 3, 1.22, "[Kr] 4d¹ 5s²"],
  [40, "Zr", "Circonio", 91.224, "transicion", 5, 4, 1.33, "[Kr] 4d² 5s²"],
  [41, "Nb", "Niobio", 92.906, "transicion", 5, 5, 1.6, "[Kr] 4d⁴ 5s¹"],
  [42, "Mo", "Molibdeno", 95.95, "transicion", 5, 6, 2.16, "[Kr] 4d⁵ 5s¹"],
  [43, "Tc", "Tecnecio", 98, "transicion", 5, 7, 1.9, "[Kr] 4d⁵ 5s²"],
  [44, "Ru", "Rutenio", 101.07, "transicion", 5, 8, 2.2, "[Kr] 4d⁷ 5s¹"],
  [45, "Rh", "Rodio", 102.91, "transicion", 5, 9, 2.28, "[Kr] 4d⁸ 5s¹"],
  [46, "Pd", "Paladio", 106.42, "transicion", 5, 10, 2.2, "[Kr] 4d¹⁰"],
  [47, "Ag", "Plata", 107.87, "transicion", 5, 11, 1.93, "[Kr] 4d¹⁰ 5s¹"],
  [48, "Cd", "Cadmio", 112.41, "transicion", 5, 12, 1.69, "[Kr] 4d¹⁰ 5s²"],
  [49, "In", "Indio", 114.82, "post-transicion", 5, 13, 1.78, "[Kr] 4d¹⁰ 5s² 5p¹"],
  [50, "Sn", "Estaño", 118.71, "post-transicion", 5, 14, 1.96, "[Kr] 4d¹⁰ 5s² 5p²"],
  [51, "Sb", "Antimonio", 121.76, "metaloide", 5, 15, 2.05, "[Kr] 4d¹⁰ 5s² 5p³"],
  [52, "Te", "Telurio", 127.6, "metaloide", 5, 16, 2.1, "[Kr] 4d¹⁰ 5s² 5p⁴"],
  [53, "I", "Yodo", 126.9, "halogeno", 5, 17, 2.66, "[Kr] 4d¹⁰ 5s² 5p⁵"],
  [54, "Xe", "Xenón", 131.29, "gas-noble", 5, 18, 2.6, "[Kr] 4d¹⁰ 5s² 5p⁶"],
  // Periodo 6 ─────────────────────────────────────────────────────────
  [55, "Cs", "Cesio", 132.91, "alcalino", 6, 1, 0.79, "[Xe] 6s¹"],
  [56, "Ba", "Bario", 137.33, "alcalinoterreo", 6, 2, 0.89, "[Xe] 6s²"],
  [57, "La", "Lantano", 138.91, "lantanido", 6, null, 1.1, "[Xe] 5d¹ 6s²"],
  [58, "Ce", "Cerio", 140.12, "lantanido", 6, null, 1.12, "[Xe] 4f¹ 5d¹ 6s²"],
  [59, "Pr", "Praseodimio", 140.91, "lantanido", 6, null, 1.13, "[Xe] 4f³ 6s²"],
  [60, "Nd", "Neodimio", 144.24, "lantanido", 6, null, 1.14, "[Xe] 4f⁴ 6s²"],
  [61, "Pm", "Prometio", 145, "lantanido", 6, null, 1.13, "[Xe] 4f⁵ 6s²"],
  [62, "Sm", "Samario", 150.36, "lantanido", 6, null, 1.17, "[Xe] 4f⁶ 6s²"],
  [63, "Eu", "Europio", 151.96, "lantanido", 6, null, 1.2, "[Xe] 4f⁷ 6s²"],
  [64, "Gd", "Gadolinio", 157.25, "lantanido", 6, null, 1.2, "[Xe] 4f⁷ 5d¹ 6s²"],
  [65, "Tb", "Terbio", 158.93, "lantanido", 6, null, 1.1, "[Xe] 4f⁹ 6s²"],
  [66, "Dy", "Disprosio", 162.5, "lantanido", 6, null, 1.22, "[Xe] 4f¹⁰ 6s²"],
  [67, "Ho", "Holmio", 164.93, "lantanido", 6, null, 1.23, "[Xe] 4f¹¹ 6s²"],
  [68, "Er", "Erbio", 167.26, "lantanido", 6, null, 1.24, "[Xe] 4f¹² 6s²"],
  [69, "Tm", "Tulio", 168.93, "lantanido", 6, null, 1.25, "[Xe] 4f¹³ 6s²"],
  [70, "Yb", "Iterbio", 173.05, "lantanido", 6, null, 1.1, "[Xe] 4f¹⁴ 6s²"],
  [71, "Lu", "Lutecio", 174.97, "lantanido", 6, null, 1.27, "[Xe] 4f¹⁴ 5d¹ 6s²"],
  [72, "Hf", "Hafnio", 178.49, "transicion", 6, 4, 1.3, "[Xe] 4f¹⁴ 5d² 6s²"],
  [73, "Ta", "Tántalo", 180.95, "transicion", 6, 5, 1.5, "[Xe] 4f¹⁴ 5d³ 6s²"],
  [74, "W", "Wolframio", 183.84, "transicion", 6, 6, 2.36, "[Xe] 4f¹⁴ 5d⁴ 6s²"],
  [75, "Re", "Renio", 186.21, "transicion", 6, 7, 1.9, "[Xe] 4f¹⁴ 5d⁵ 6s²"],
  [76, "Os", "Osmio", 190.23, "transicion", 6, 8, 2.2, "[Xe] 4f¹⁴ 5d⁶ 6s²"],
  [77, "Ir", "Iridio", 192.22, "transicion", 6, 9, 2.2, "[Xe] 4f¹⁴ 5d⁷ 6s²"],
  [78, "Pt", "Platino", 195.08, "transicion", 6, 10, 2.28, "[Xe] 4f¹⁴ 5d⁹ 6s¹"],
  [79, "Au", "Oro", 196.97, "transicion", 6, 11, 2.54, "[Xe] 4f¹⁴ 5d¹⁰ 6s¹"],
  [80, "Hg", "Mercurio", 200.59, "transicion", 6, 12, 2.0, "[Xe] 4f¹⁴ 5d¹⁰ 6s²"],
  [81, "Tl", "Talio", 204.38, "post-transicion", 6, 13, 1.62, "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹"],
  [82, "Pb", "Plomo", 207.2, "post-transicion", 6, 14, 2.33, "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²"],
  [83, "Bi", "Bismuto", 208.98, "post-transicion", 6, 15, 2.02, "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³"],
  [84, "Po", "Polonio", 209, "post-transicion", 6, 16, 2.0, "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴"],
  [85, "At", "Astato", 210, "halogeno", 6, 17, 2.2, "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵"],
  [86, "Rn", "Radón", 222, "gas-noble", 6, 18, null, "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶"],
  // Periodo 7 ─────────────────────────────────────────────────────────
  [87, "Fr", "Francio", 223, "alcalino", 7, 1, 0.7, "[Rn] 7s¹"],
  [88, "Ra", "Radio", 226, "alcalinoterreo", 7, 2, 0.9, "[Rn] 7s²"],
  [89, "Ac", "Actinio", 227, "actinido", 7, null, 1.1, "[Rn] 6d¹ 7s²"],
  [90, "Th", "Torio", 232.04, "actinido", 7, null, 1.3, "[Rn] 6d² 7s²"],
  [91, "Pa", "Protactinio", 231.04, "actinido", 7, null, 1.5, "[Rn] 5f² 6d¹ 7s²"],
  [92, "U", "Uranio", 238.03, "actinido", 7, null, 1.38, "[Rn] 5f³ 6d¹ 7s²"],
  [93, "Np", "Neptunio", 237, "actinido", 7, null, 1.36, "[Rn] 5f⁴ 6d¹ 7s²"],
  [94, "Pu", "Plutonio", 244, "actinido", 7, null, 1.28, "[Rn] 5f⁶ 7s²"],
  [95, "Am", "Americio", 243, "actinido", 7, null, 1.3, "[Rn] 5f⁷ 7s²"],
  [96, "Cm", "Curio", 247, "actinido", 7, null, 1.3, "[Rn] 5f⁷ 6d¹ 7s²"],
  [97, "Bk", "Berkelio", 247, "actinido", 7, null, 1.3, "[Rn] 5f⁹ 7s²"],
  [98, "Cf", "Californio", 251, "actinido", 7, null, 1.3, "[Rn] 5f¹⁰ 7s²"],
  [99, "Es", "Einstenio", 252, "actinido", 7, null, 1.3, "[Rn] 5f¹¹ 7s²"],
  [100, "Fm", "Fermio", 257, "actinido", 7, null, 1.3, "[Rn] 5f¹² 7s²"],
  [101, "Md", "Mendelevio", 258, "actinido", 7, null, 1.3, "[Rn] 5f¹³ 7s²"],
  [102, "No", "Nobelio", 259, "actinido", 7, null, 1.3, "[Rn] 5f¹⁴ 7s²"],
  [103, "Lr", "Laurencio", 266, "actinido", 7, null, 1.3, "[Rn] 5f¹⁴ 7s² 7p¹"],
  [104, "Rf", "Rutherfordio", 267, "transicion", 7, 4, null, "[Rn] 5f¹⁴ 6d² 7s²"],
  [105, "Db", "Dubnio", 268, "transicion", 7, 5, null, "[Rn] 5f¹⁴ 6d³ 7s²"],
  [106, "Sg", "Seaborgio", 269, "transicion", 7, 6, null, "[Rn] 5f¹⁴ 6d⁴ 7s²"],
  [107, "Bh", "Bohrio", 270, "transicion", 7, 7, null, "[Rn] 5f¹⁴ 6d⁵ 7s²"],
  [108, "Hs", "Hassio", 277, "transicion", 7, 8, null, "[Rn] 5f¹⁴ 6d⁶ 7s²"],
  [109, "Mt", "Meitnerio", 278, "transicion", 7, 9, null, "[Rn] 5f¹⁴ 6d⁷ 7s²"],
  [110, "Ds", "Darmstadtio", 281, "transicion", 7, 10, null, "[Rn] 5f¹⁴ 6d⁸ 7s²"],
  [111, "Rg", "Roentgenio", 282, "transicion", 7, 11, null, "[Rn] 5f¹⁴ 6d⁹ 7s²"],
  [112, "Cn", "Copernicio", 285, "transicion", 7, 12, null, "[Rn] 5f¹⁴ 6d¹⁰ 7s²"],
  [113, "Nh", "Nihonio", 286, "post-transicion", 7, 13, null, "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹"],
  [114, "Fl", "Flerovio", 289, "post-transicion", 7, 14, null, "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²"],
  [115, "Mc", "Moscovio", 290, "post-transicion", 7, 15, null, "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³"],
  [116, "Lv", "Livermorio", 293, "post-transicion", 7, 16, null, "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴"],
  [117, "Ts", "Teneso", 294, "halogeno", 7, 17, null, "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵"],
  [118, "Og", "Oganesón", 294, "gas-noble", 7, 18, null, "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶"],
];

/** Elementos sin isótopos estables: la masa mostrada es la del isótopo más estable. */
const ISOTOPE_MASS_SYMBOLS = new Set([
  "Tc", "Pm", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Np", "Pu", "Am", "Cm",
  "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs",
  "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og",
]);

/** Datos curiosos breves para enriquecer la ficha de los elementos más usados. */
const FACTS: Record<string, string> = {
  H: "Es el elemento más abundante del universo: forma cerca del 75 % de su masa visible.",
  He: "Descubierto en el Sol antes que en la Tierra, por las líneas espectrales del eclipse de 1868.",
  C: "Base de la química orgánica; sus alótropos van del grafito de los lápices al diamante.",
  N: "Constituye ~78 % del aire que respiras, pero casi no reacciona en condiciones normales.",
  O: "El elemento más abundante de la corteza terrestre; esencial para la respiración celular.",
  F: "El elemento más electronegativo de la tabla: reacciona prácticamente con todo.",
  Na: "Reacciona violentamente con agua, pero combinado con cloro es simplemente sal de mesa.",
  Cl: "Gas verdoso empleado para desinfectar el agua potable y las piscinas.",
  Ca: "Quinto elemento más abundante del cuerpo humano: huesos, dientes y señalización celular.",
  Fe: "El núcleo terrestre es mayoritariamente hierro; también transporta el O₂ en tu sangre.",
  Cu: "Segundo mejor conductor eléctrico tras la plata; usado por la humanidad desde hace 10 000 años.",
  Ag: "El mejor conductor eléctrico y térmico de todos los metales.",
  Au: "Tan maleable que 1 g puede estirarse en una lámina de 1 m²; no se oxida jamás.",
  Hg: "Único metal líquido a temperatura ambiente; los alquimistas lo consideraban casi mágico.",
  Pb: "Usado desde Roma (tuberías = «plumbum»), hoy protege contra la radiación en hospitales.",
  Si: "Segundo elemento más abundante de la corteza; la base de arenas, cuarzo y chips.",
  I: "Esencial para la hormona tiroidea; su vapor violeta da nombre al color en griego.",
  U: "El elemento natural más pesado; su fisión libera millones de veces más energía que quemar carbón.",
  W: "El punto de fusión más alto de todos los metales (3 422 °C): por eso iba en las bombillas.",
  Pu: "Sintético y altamente radiactivo; un kilogramo se usó para nombrar al planeta enano Plutón… al revés: el símbolo honra al dios romano.",
};

function deriveBlock(
  category: ElementCategory,
  group: number | null,
): "s" | "p" | "d" | "f" {
  if (category === "lantanido" || category === "actinido") return "f";
  if (group === null) return "f";
  if (group <= 2) return "s";
  if (group <= 12) return "d";
  return "p";
}

/** Listado completo de los 118 elementos, ordenados por Z. */
export const ELEMENTS: PeriodicElement[] = RAW.map(
  ([z, symbol, name, mass, category, period, group, eneg, config]) => ({
    z,
    symbol,
    name,
    mass,
    category,
    period,
    group,
    eneg,
    config,
    block: deriveBlock(category, group),
    isotopeMass: ISOTOPE_MASS_SYMBOLS.has(symbol),
    fact: FACTS[symbol],
  }),
);

const BY_SYMBOL = new Map(ELEMENTS.map((el) => [el.symbol, el]));
const BY_Z = new Map(ELEMENTS.map((el) => [el.z, el]));

export function elementBySymbol(symbol: string): PeriodicElement | undefined {
  return BY_SYMBOL.get(symbol);
}

export function elementByZ(z: number): PeriodicElement | undefined {
  return BY_Z.get(z);
}

export type CategoryInfo = {
  id: ElementCategory;
  label: string;
  /** Color fijo por familia (la leyenda de una tabla periódica es semántica). */
  color: string;
  description: string;
};

/** Familias de la tabla en el orden visual habitual de las leyendas. */
export const CATEGORIES: CategoryInfo[] = [
  { id: "no-metal", label: "No metales", color: "#8fbf6a", description: "Aceptan o comparten electrones; forman la mayoría de los compuestos de la vida." },
  { id: "halogeno", label: "Halógenos", color: "#f0c05a", description: "Grupo 17: muy reactivos, forman sales con los metales («formadores de sal»)." },
  { id: "gas-noble", label: "Gases nobles", color: "#6fb6c9", description: "Grupo 18: capa electrónica completa, apenas reaccionan." },
  { id: "alcalino", label: "Alcalinos", color: "#e07a5f", description: "Grupo 1: metales blandos muy reactivos; arden con llama característica." },
  { id: "alcalinoterreo", label: "Alcalinotérreos", color: "#e8a87c", description: "Grupo 2: metales menos reactivos que los alcalinos, presentes en minerales." },
  { id: "metaloide", label: "Metaloides", color: "#9d8dc0", description: "Escalera diagonal con propiedades intermedias: base de los semiconductores." },
  { id: "transicion", label: "Metales de transición", color: "#7ba1c4", description: "Bloque d: conductores, duros, con estados de oxidación variables y colores." },
  { id: "post-transicion", label: "Metales del bloque p", color: "#a8a892", description: "Metales más blandos y de menor fusión tras el bloque d (estaño, plomo…)." },
  { id: "lantanido", label: "Lantánidos", color: "#d88a9e", description: "«Tierras raras»: imanes potentes, pantallas y láseres." },
  { id: "actinido", label: "Actínidos", color: "#b87bb0", description: "Todos radiactivos; del torio en adelante, combustibles y física nuclear." },
];

export const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.id, c]));

export function categoryLabel(id: ElementCategory): string {
  return CATEGORY_MAP.get(id)?.label ?? id;
}

/** Constante de Avogadro exacta (SI 2019). */
export const AVOGADRO = 6.02214076e23;

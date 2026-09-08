/**
 * Biblioteca de simulaciones moleculares — módulo PURO.
 * Geometrías reales (aprox. experimental) para el visor 3D con Three.js.
 * Las distancias se usan, sin enlaces explícitos, para inferir enlaces
 * por umbral de radios covalentes; o se indica enlace explícito doble.
 */

export type ElementKey = "H" | "C" | "N" | "O" | "S" | "Cl" | "P";

export const ELEMENTS: Record<
  ElementKey,
  { color: string; radius: number; covalent: number; name: string }
> = {
  H: { color: "#E8E2DA", radius: 0.25, covalent: 0.31, name: "Hidrógeno" },
  C: { color: "#3B3B42", radius: 0.70, covalent: 0.76, name: "Carbono" },
  N: { color: "#3050F8", radius: 0.65, covalent: 0.71, name: "Nitrógeno" },
  O: { color: "#FF0D0D", radius: 0.60, covalent: 0.66, name: "Oxígeno" },
  S: { color: "#E9C33B", radius: 1.00, covalent: 1.05, name: "Azufre" },
  Cl: { color: "#1FB51F", radius: 1.10, covalent: 1.02, name: "Cloro" },
  P: { color: "#FF8000", radius: 1.00, covalent: 1.07, name: "Fósforo" },
};

export type MoleculeAtom = { el: ElementKey; pos: [number, number, number] };
export type ExplicitBond = { a: number; b: number; order: 1 | 2 };

export type MoleculePreset = {
  id: string;
  name: string;
  formula: string;
  geometry: string;
  smiles: string;
  fact: string;
  atoms: MoleculeAtom[];
  bonds?: ExplicitBond[];
};

export function computeBonds(
  atoms: MoleculeAtom[],
): Array<{ a: number; b: number; order: 1 | 2 }> {
  const result: Array<{ a: number; b: number; order: 1 | 2 }> = [];
  for (let i = 0; i < atoms.length; i += 1) {
    for (let j = i + 1; j < atoms.length; j += 1) {
      const [x1, y1, z1] = atoms[i].pos;
      const [x2, y2, z2] = atoms[j].pos;
      const distance = Math.hypot(x2 - x1, y2 - y1, z2 - z1);
      const threshold =
        ELEMENTS[atoms[i].el].covalent + ELEMENTS[atoms[j].el].covalent + 0.30;
      if (distance > 0.1 && distance <= threshold) {
        result.push({ a: i, b: j, order: 1 });
      }
    }
  }
  return result;
}

export const MOLECULE_PRESETS: MoleculePreset[] = [
  {
    id: "agua",
    name: "Agua",
    formula: "H₂O",
    geometry: "Angular · 104,5°",
    smiles: "O",
    fact: "El ángulo H–O–H de 104,5° explica su polaridad y la formación de puentes de hidrógeno.",
    atoms: [
      { el: "O", pos: [0, 0, 0] },
      { el: "H", pos: [0.759, 0.586, 0] },
      { el: "H", pos: [-0.759, 0.586, 0] },
    ],
  },
  {
    id: "dioxido_carbono",
    name: "Dióxido de carbono",
    formula: "CO₂",
    geometry: "Lineal · 180°",
    smiles: "O=C=O",
    fact: "Dos enlaces dobles C=O lo vuelven lineal y sin momento dipolar total, aunque polar en cada enlace.",
    atoms: [
      { el: "O", pos: [-1.16, 0, 0] },
      { el: "C", pos: [0, 0, 0] },
      { el: "O", pos: [1.16, 0, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 1, b: 2, order: 2 },
    ],
  },
  {
    id: "amoniaco",
    name: "Amoniaco",
    formula: "NH₃",
    geometry: "Piramidal trigonal",
    smiles: "N",
    fact: "El par libre del nitrógeno produce la geometría piramidal y su carácter básico en agua.",
    atoms: [
      { el: "N", pos: [0, 0.12, 0] },
      { el: "H", pos: [0.94, -0.22, 0.34] },
      { el: "H", pos: [-0.47, -0.22, -0.85] },
      { el: "H", pos: [-0.47, -0.22, 0.85] },
    ],
  },
  {
    id: "metano",
    name: "Metano",
    formula: "CH₄",
    geometry: "Tetraédrica · 109,5°",
    smiles: "C",
    fact: "La geometría tetraédrica perfecta minimiza las repulsiones entre pares de electrones (VSEPR).",
    atoms: [
      { el: "C", pos: [0, 0, 0] },
      { el: "H", pos: [0.63, 0.63, 0.63] },
      { el: "H", pos: [0.63, -0.63, -0.63] },
      { el: "H", pos: [-0.63, 0.63, -0.63] },
      { el: "H", pos: [-0.63, -0.63, 0.63] },
    ],
  },
  {
    id: "etanol",
    name: "Etanol",
    formula: "C₂H₆O",
    geometry: "Grupo –OH en cadena",
    smiles: "CCO",
    fact: "El grupo hidroxilo explica su miscibilidad en agua y su uso común como disolvente y desinfectante.",
    atoms: [
      { el: "C", pos: [-0.75, 0, 0] },
      { el: "C", pos: [0.75, 0, 0] },
      { el: "O", pos: [1.42, 1.1, 0] },
      { el: "H", pos: [-1.84, 0, 0] },
      { el: "H", pos: [-0.42, 1.02, 0] },
      { el: "H", pos: [-0.42, -0.55, 0.95] },
      { el: "H", pos: [1.18, -0.9, 0.42] },
      { el: "H", pos: [1.29, 0.72, 0.83] },
      { el: "H", pos: [2.38, 1.1, 0] },
    ],
  },
  {
    id: "benceno",
    name: "Benceno",
    formula: "C₆H₆",
    geometry: "Anillo aromático plano",
    smiles: "c1ccccc1",
    fact: "Sus 6 electrones π deslocalizados hacen que los seis enlaces C–C tengan exactamente la misma longitud.",
    atoms: Array.from({ length: 12 }, (_, index) => {
      const angle = ((index % 6) * 60 * Math.PI) / 180;
      const radius = index < 6 ? 1.4 : 2.49;
      return {
        el: index < 6 ? ("C" as ElementKey) : ("H" as ElementKey),
        pos: [
          radius * Math.cos(angle),
          radius * Math.sin(angle),
          0,
        ] as [number, number, number],
      };
    }),
  },
];

export type Level = "Grado" | "Máster" | "Doctorado";

export interface Course {
  code: string;
  slug: string;
  title: string;
  level: Level;
  semester: string;
  credits: number;
  room: string;
  schedule: string;
  description: string;
  formula: string;
  materials: number;
  accent: "cyan" | "violet" | "emerald" | "amber";
}

export const courses: Course[] = [
  {
    code: "QUI-101",
    slug: "quimica-general-i",
    title: "Química General I",
    level: "Grado",
    semester: "1.º semestre",
    credits: 6,
    room: "Aula B-204",
    schedule: "Lun y Mié · 09:00 – 11:00",
    description:
      "Estequiometría, estructura atómica y enlace químico. La base sobre la que se construye todo lo demás.",
    formula: "n = m / M",
    materials: 14,
    accent: "cyan",
  },
  {
    code: "QUI-205",
    slug: "quimica-organica",
    title: "Química Orgánica",
    level: "Grado",
    semester: "3.º semestre",
    credits: 5,
    room: "Aula C-112",
    schedule: "Mar y Jue · 11:00 – 13:00",
    description:
      "Grupos funcionales, mecanismos de reacción y síntesis orgánica con prácticas de laboratorio semanales.",
    formula: "SN2 · E1 · E2",
    materials: 18,
    accent: "violet",
  },
  {
    code: "QUI-510",
    slug: "fisicoquimica-avanzada",
    title: "Fisicoquímica Avanzada",
    level: "Máster",
    semester: "1.º semestre",
    credits: 4,
    room: "Lab. F-301",
    schedule: "Mié · 16:00 – 19:00",
    description:
      "Termodinámica estadística, cinética de estado de transición y electrocatalizadores de nueva generación.",
    formula: "ΔG = ΔH − TΔS",
    materials: 9,
    accent: "emerald",
  },
  {
    code: "QUI-720",
    slug: "metodos-espectroscopicos",
    title: "Métodos Espectroscópicos",
    level: "Doctorado",
    semester: "Curso anual",
    credits: 3,
    room: "Sala NMR-1",
    schedule: "Vie · 10:00 – 13:00",
    description:
      "RMN multinuclear, IR-Raman y espectrometría de masas de alta resolución aplicadas a la elucidación estructural.",
    formula: "δ (ppm) · m/z",
    materials: 7,
    accent: "amber",
  },
];

export type MaterialCategory =
  | "Apuntes"
  | "Guías de laboratorio"
  | "Ejercicios resueltos"
  | "Presentaciones"
  | "Programas";

export interface Material {
  id: number;
  title: string;
  course: string;
  category: MaterialCategory;
  format: "PDF" | "PPTX" | "XLSX" | "DOCX";
  size: string;
  updated: string;
  downloads: number;
}

export const materials: Material[] = [
  { id: 1, title: "Tema 3 · Enlace químico y teoría de orbitales moleculares", course: "QUI-101", category: "Apuntes", format: "PDF", size: "4,2 MB", updated: "12 feb 2026", downloads: 342 },
  { id: 2, title: "Práctica 5 · Valoración ácido-base con indicadores mixtos", course: "QUI-101", category: "Guías de laboratorio", format: "PDF", size: "1,8 MB", updated: "09 feb 2026", downloads: 214 },
  { id: 3, title: "Colección de estequiometría · 40 problemas con solución", course: "QUI-101", category: "Ejercicios resueltos", format: "PDF", size: "6,1 MB", updated: "02 feb 2026", downloads: 508 },
  { id: 4, title: "Mecanismos SN1 / SN2 · esquemas paso a paso", course: "QUI-205", category: "Apuntes", format: "PDF", size: "3,4 MB", updated: "10 feb 2026", downloads: 289 },
  { id: 5, title: "Práctica 2 · Síntesis de aspirina y rendimiento", course: "QUI-205", category: "Guías de laboratorio", format: "PDF", size: "2,2 MB", updated: "05 feb 2026", downloads: 176 },
  { id: 6, title: "Espectroscopía IR · tabla de bandas características", course: "QUI-720", category: "Presentaciones", format: "PPTX", size: "11 MB", updated: "08 feb 2026", downloads: 96 },
  { id: 7, title: "Programa oficial y criterios de evaluación 2026", course: "QUI-510", category: "Programas", format: "PDF", size: "0,6 MB", updated: "20 ene 2026", downloads: 154 },
  { id: 8, title: "Hoja de cálculo · cinética enzimática Michaelis-Menten", course: "QUI-510", category: "Ejercicios resueltos", format: "XLSX", size: "0.9 MB", updated: "11 feb 2026", downloads: 87 },
];

export type NoticeType = "examen" | "entrega" | "cambio" | "general";

export interface Notice {
  id: number;
  type: NoticeType;
  course: string;
  title: string;
  body: string;
  date: string;
  pinned?: boolean;
}

export const notices: Notice[] = [
  {
    id: 1,
    type: "examen",
    course: "QUI-101",
    title: "Primer parcial · Temas 1 a 4",
    body: "El examen se realizará en el aula B-204. Permitido el uso de tabla periódica y calculadora no programable.",
    date: "24 feb 2026",
    pinned: true,
  },
  {
    id: 2,
    type: "entrega",
    course: "QUI-205",
    title: "Entrega del informe de la Práctica 2",
    body: "Subir el informe de síntesis de aspirina en PDF antes de las 23:59. Se valorará el cálculo de rendimiento.",
    date: "20 feb 2026",
    pinned: true,
  },
  {
    id: 3,
    type: "cambio",
    course: "QUI-510",
    title: "La sesión del miércoles pasa al Lab. F-302",
    body: "Por calibración del calorímetro, la sesión de fisicoquímica se traslada al laboratorio contiguo durante febrero.",
    date: "18 feb 2026",
  },
  {
    id: 4,
    type: "general",
    course: "General",
    title: "Jornada de puertas abiertas del laboratorio",
    body: "Visitas guiadas cada 30 minutos: sala NMR, espectrometría de masas y el nuevo banco de electroquímica.",
    date: "27 feb 2026",
  },
];

export interface AgendaEvent {
  day: number;
  month: number; // 0-indexed
  year: number;
  type: NoticeType;
  title: string;
  course: string;
  time?: string;
}

export const agendaEvents: AgendaEvent[] = [
  { day: 17, month: 1, year: 2026, type: "entrega", title: "Cuestionario Tema 3", course: "QUI-101", time: "23:59" },
  { day: 20, month: 1, year: 2026, type: "entrega", title: "Informe Práctica 2", course: "QUI-205", time: "23:59" },
  { day: 24, month: 1, year: 2026, type: "examen", title: "Primer parcial", course: "QUI-101", time: "09:00" },
  { day: 27, month: 1, year: 2026, type: "general", title: "Puertas abiertas", course: "Laboratorio", time: "10:00" },
  { day: 3, month: 2, year: 2026, type: "cambio", title: "Nueva aula asignada", course: "QUI-510", time: "16:00" },
  { day: 10, month: 2, year: 2026, type: "examen", title: "Parcial espectroscopía", course: "QUI-720", time: "10:00" },
  { day: 18, month: 2, year: 2026, type: "entrega", title: "Propuesta de TFM", course: "QUI-510", time: "14:00" },
];

export const profile = {
  name: "Prof. Wilmer",
  role: "Profesor titular de Química",
  department: "Dpto. de Química Física y Analítica",
  office: "Despacho 3.12 · Edificio de Ciencias",
  officeHours: "Mar y Jue · 15:00 – 17:00 (con cita)",
  email: "wilmer@aula.edu",
  bio: "Veintidós años frente a la pizarra y el matraz. Investigador en electrocatálisis y docente convencido de que la química se aprende preguntando «por qué» una y otra vez, hasta que el modelo se vuelve intuición.",
  specialties: ["Electroquímica", "Espectroscopía", "Didáctica de la ciencia"],
};

export const periodicElements = [
  { symbol: "H", name: "Hidrógeno", number: 1, mass: "1.008", accent: "text-cyan-300" },
  { symbol: "O", name: "Oxígeno", number: 8, mass: "15.999", accent: "text-rose-300" },
  { symbol: "Fe", name: "Hierro", number: 26, mass: "55.845", accent: "text-amber-300" },
  { symbol: "Na", name: "Sodio", number: 11, mass: "22.990", accent: "text-violet-300" },
  { symbol: "Cu", name: "Cobre", number: 29, mass: "63.546", accent: "text-emerald-300" },
];

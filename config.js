const CONFIG = {
  site: {
    name: 'QuímicaU',
    tagline: 'Plataforma de Química Universitaria',
    description: 'Plataforma educativa de Química General universitaria: simulaciones interactivas, contenido teórico completo, guías de laboratorio y videos explicativos.',
    url: 'https://quimicau.vercel.app',
    analyticsId: 'G-XXXXXXXXXX',
    year: 2024,
    version: '2.0.0'
  },
  hero: {
    badge: 'Actualizado 2024',
    title: 'Domina la <span class="grad">Química Universitaria</span> con Ciencia Interactiva',
    subtitle: 'La plataforma educativa más completa para estudiantes de ciencias e ingeniería.',
    cta: [
      { text: '🚀 Explorar Temas', target: 'topics', style: 'primary' },
      { text: '🧪 Simuladores', target: 'simulations', style: 'ghost' }
    ],
    cards: [
      { icon: '🧮', title: 'Estequiometría', desc: 'Cálculos de masa, moles y reactivo limitante.' },
      { icon: '🌡️', title: 'Termoquímica', desc: 'Entalpía, entropía y leyes de la termodinámica.' },
      { icon: '⚡', title: 'Electroquímica', desc: 'Celdas galvánicas y potenciales de reducción.' },
      { icon: '⚖️', title: 'Equilibrio', desc: 'Le Chatelier y constantes de equilibrio.' }
    ]
  },
  sections: {
    topics: { tag: 'Currículo Académico', title: 'Contenido Teórico', desc: 'Módulos estructurados por niveles de complejidad, desde fundamentos hasta química avanzada.', tagColor: 'rgba(20,184,166,.1)', tagText: 'var(--teal)' },
    simulations: { tag: 'Entorno Virtual', title: 'Laboratorio de Simulaciones', desc: 'Experimenta con variables en tiempo real y visualiza fenómenos microscópicos.', tagColor: 'rgba(139,92,246,.1)', tagText: 'var(--purple)', bg: 'var(--slate-50)' },
    labs: { tag: 'Práctica Real', title: 'Guías de Laboratorio', desc: 'Protocolos detallados, seguridad química y formatos de informe.', tagColor: 'rgba(245,158,11,.1)', tagText: 'var(--amber)' },
    periodic: { tag: 'Herramientas', title: 'Tabla Periódica Dinámica', desc: 'Consulta propiedades atómicas y configuraciones electrónicas.', tagColor: 'rgba(6,182,212,.1)', tagText: 'var(--cyan)', bg: 'var(--slate-50)' },
    videos: { tag: 'Multimedia', title: 'Clases en Video', desc: 'Explicaciones paso a paso de los conceptos más complejos.', tagColor: 'rgba(244,63,94,.1)', tagText: 'var(--rose)' }
  },
  topics: [
    { title: 'Estructura Atómica', icon: '⚛️', desc: 'Partículas subatómicas, modelos atómicos y configuración electrónica.', lessons: ['Modelos Atómicos', 'Números Cuánticos', 'Orbitales y Configuración'], tag: 'Fundamentos', color: 'var(--teal)' },
    { title: 'Enlace Químico', icon: '🤝', desc: 'Iónico, covalente y metálico. Fuerzas intermoleculares y geometría.', lessons: ['Teoría de Octeto', 'Estructura de Lewis', 'VSEPR y Geometría'], tag: 'Propiedades', color: 'var(--cyan)' },
    { title: 'Estequiometría', icon: '🧮', desc: 'Leyes ponderales, reactivo limitante, rendimiento y pureza.', lessons: ['Cálculos Mol-Mol', 'Reactivo Limitante', 'Rendimiento de Reacción'], tag: 'Cálculos', color: 'var(--blue)' },
    { title: 'Disoluciones', icon: '💧', desc: 'Unidades de concentración, solubilidad y propiedades coligativas.', lessons: ['Molaridad y Molalidad', 'Diluciones', 'Propiedades Coligativas'], tag: 'Sistemas', color: 'var(--indigo)' },
    { title: 'Termoquímica', icon: '🔥', desc: 'Entalpía de reacción, ley de Hess y espontaneidad.', lessons: ['Leyes de Termodinámica', 'Entalpía y Calorimetría', 'Energía Libre de Gibbs'], tag: 'Energía', color: 'var(--rose)' },
    { title: 'Equilibrio Químico', icon: '⚖️', desc: 'Constantes Kc y Kp, principio de Le Chatelier.', lessons: ['Constante de Equilibrio', 'Factores de Alteración', 'Equilibrio de Gases'], tag: 'Dinámica', color: 'var(--amber)' }
  ],
  lessonContent: {
    'Modelos Atómicos': [
      { t: 'Fundamentos', c: 'La historia del átomo es la historia de la búsqueda de la unidad fundamental de la materia. Desde los filósofos griegos hasta la mecánica cuántica moderna.\n\n**Dalton (1803):** Imaginó el átomo como esferas sólidas e indivisibles.\n**Thomson (1904):** Descubrió el electrón (modelo de "budín de pasas").\n**Rutherford (1911):** Demostró que existe un núcleo denso y positivo.' },
      { t: 'Modelo de Bohr', c: 'Niels Bohr propuso en 1913 que los electrones giran en órbitas circulares definidas alrededor del núcleo.\n\n- Cada órbita tiene una **energía específica**.\n- Los electrones pueden "saltar" entre niveles absorbiendo o emitiendo fotones.\n- Este modelo explicó con éxito el espectro del Hidrógeno pero falló en átomos multielectrónicos.' },
      { t: 'Modelo Cuántico Actual', c: 'Desarrollado por Schrödinger y Heisenberg. Ya no hablamos de órbitas, sino de **orbitales**.\n\nUn orbital es la región del espacio donde existe una alta probabilidad (90%+) de encontrar un electrón. Se definen mediante 4 números cuánticos: n, l, m y s.' }
    ],
    '_default': [
      { t: 'Introducción', c: 'Contenido teórico en proceso de redacción académica. Pronto disponible para consulta completa.' },
      { t: 'Conceptos Clave', c: '- Definición fundamental\n- Ecuaciones principales\n- Ejemplos resueltos\n- Casos especiales' },
      { t: 'Conclusión', c: 'Resumen de los puntos más importantes tratados en esta unidad de aprendizaje.' }
    ]
  },
  quizzes: {
    'Modelos Atómicos': [
      { q: '¿Quién descubrió el electrón?', opts: ['Dalton', 'Thomson', 'Rutherford', 'Bohr'], correct: 1, exp: 'J.J. Thomson descubrió el electrón en 1897.' },
      { q: '¿Qué demostró el experimento de Rutherford?', opts: ['Átomo indivisible', 'Núcleo denso y positivo', 'Órbitas fijas', 'Electrones ondas'], correct: 1, exp: 'El experimento mostró un núcleo pequeño, denso y positivo.' },
      { q: '¿Qué representa un orbital?', opts: ['Trayectoria exacta', 'Región de probabilidad del electrón', 'Energía del núcleo', 'Número de protones'], correct: 1, exp: 'Un orbital es la región donde hay ~90% probabilidad de encontrar un electrón.' }
    ],
    '_default': [
      { q: '¿Comprendiste los conceptos?', opts: ['Sí', 'Necesito repasar', 'No'], correct: 0, exp: '¡Excelente! Continúa con la siguiente lección.' }
    ]
  },
  simulations: [
    { id: 'sim-ph', title: 'Medidor de pH', icon: '🌡️', desc: 'Mide el pH de diversas sustancias.', tag: 'Ácido-Base', color: 'var(--rose)' },
    { id: 'sim-tit', title: 'Titulación Visual', icon: '🧪', desc: 'Valoración ácido-base con curva.', tag: 'Analítica', color: 'var(--purple)' },
    { id: 'sim-estequio', title: 'Estequiometría', icon: '🧮', desc: 'Relaciones masa y moles.', tag: 'General', color: 'var(--blue)' },
    { id: 'sim-dilucion', title: 'Diluciones', icon: '💧', desc: 'Calcula volúmenes de soluciones.', tag: 'Soluciones', color: 'var(--teal)' },
    { id: 'sim-coligativas', title: 'Coligativas', icon: '❄️', desc: 'Ebullición y congelación.', tag: 'Soluciones', color: 'var(--indigo)' },
    { id: 'sim-config', title: 'Config. Electrónica', icon: '⚛️', desc: 'Configuración según Aufbau.', tag: 'Átomo', color: 'var(--amber)' },
    { id: 'sim-nox', title: 'Estado Oxidación', icon: '⚡', desc: 'Estados de oxidación.', tag: 'Redox', color: 'var(--emerald)' }
  ],
  labs: [
    { title: 'Preparación de Soluciones', icon: '⚖️', tag: 'Práctica 1', color: 'var(--teal)', desc: 'Técnicas de pesada y aforo para soluciones patrón.' },
    { title: 'Cinética Química', icon: '⏱️', tag: 'Práctica 5', color: 'var(--rose)', desc: 'Estudio de la velocidad de reacción del tiosulfato.' },
    { title: 'Valoración Redox', icon: '🧪', tag: 'Práctica 8', color: 'var(--purple)', desc: 'Determinación de hierro por permanganometría.' }
  ],
  labGuides: {
    'lab-0': {
      safety: ['Uso obligatorio de bata y gafas.', 'Manipulación de ácidos en campana.', 'Etiquetado inmediato de soluciones.'],
      materials: ['Matraz aforado 100mL', 'Balanza analítica', 'Vidrio de reloj', 'Espátula', 'Agua destilada'],
      procedure: [
        { n: 1, p: 'Calcular la masa necesaria de soluto para la concentración requerida.' },
        { n: 2, p: 'Pesar el soluto en la balanza con precisión de 0.001g.' },
        { n: 3, p: 'Disolver el sólido en un vaso de precipitados con aprox. 50mL de agua.' },
        { n: 4, p: 'Trasvasar cuantitativamente al matraz aforado.' },
        { n: 5, p: 'Aforar hasta la marca del menisco y homogeneizar.' }
      ],
      obs: 'La disolución de algunos sólidos puede ser exotérmica o endotérmica. Anotar cambios de temperatura.',
      questions: ['¿Por qué no se debe pesar directamente en el matraz?', '¿Qué error se introduce si se sobrepasa el aforo?']
    }
  },
  elements: [
    { z: 1, sym: 'H', name: 'Hidrógeno', mass: 1.008, cat: 'nonmetal', row: 1, col: 1, config: '1s¹' },
    { z: 2, sym: 'He', name: 'Helio', mass: 4.002, cat: 'noble', row: 1, col: 18, config: '1s²' },
    { z: 3, sym: 'Li', name: 'Litio', mass: 6.941, cat: 'alkali', row: 2, col: 1, config: '[He] 2s¹' },
    { z: 4, sym: 'Be', name: 'Berilio', mass: 9.012, cat: 'alkaline', row: 2, col: 2, config: '[He] 2s²' },
    { z: 5, sym: 'B', name: 'Boro', mass: 10.81, cat: 'metalloid', row: 2, col: 13 },
    { z: 6, sym: 'C', name: 'Carbono', mass: 12.01, cat: 'nonmetal', row: 2, col: 14 },
    { z: 7, sym: 'N', name: 'Nitrógeno', mass: 14.01, cat: 'nonmetal', row: 2, col: 15 },
    { z: 8, sym: 'O', name: 'Oxígeno', mass: 16.00, cat: 'nonmetal', row: 2, col: 16 },
    { z: 9, sym: 'F', name: 'Flúor', mass: 19.00, cat: 'halogen', row: 2, col: 17 },
    { z: 10, sym: 'Ne', name: 'Neón', mass: 20.18, cat: 'noble', row: 2, col: 18 },
    { z: 11, sym: 'Na', name: 'Sodio', mass: 22.99, cat: 'alkali', row: 3, col: 1, config: '[Ne] 3s¹' },
    { z: 12, sym: 'Mg', name: 'Magnesio', mass: 24.31, cat: 'alkaline', row: 3, col: 2, config: '[Ne] 3s²' },
    { z: 13, sym: 'Al', name: 'Aluminio', mass: 26.98, cat: 'post-trans', row: 3, col: 13 },
    { z: 14, sym: 'Si', name: 'Silicio', mass: 28.09, cat: 'metalloid', row: 3, col: 14 },
    { z: 15, sym: 'P', name: 'Fósforo', mass: 30.97, cat: 'nonmetal', row: 3, col: 15 },
    { z: 16, sym: 'S', name: 'Azufre', mass: 32.06, cat: 'nonmetal', row: 3, col: 16 },
    { z: 17, sym: 'Cl', name: 'Cloro', mass: 35.45, cat: 'halogen', row: 3, col: 17 },
    { z: 18, sym: 'Ar', name: 'Argón', mass: 39.95, cat: 'noble', row: 3, col: 18 },
    { z: 19, sym: 'K', name: 'Potasio', mass: 39.10, cat: 'alkali', row: 4, col: 1 },
    { z: 20, sym: 'Ca', name: 'Calcio', mass: 40.08, cat: 'alkaline', row: 4, col: 2 },
    { z: 21, sym: 'Sc', name: 'Escandio', mass: 44.96, cat: 'transition', row: 4, col: 3 },
    { z: 22, sym: 'Ti', name: 'Titanio', mass: 47.87, cat: 'transition', row: 4, col: 4 },
    { z: 23, sym: 'V', name: 'Vanadio', mass: 50.94, cat: 'transition', row: 4, col: 5 },
    { z: 24, sym: 'Cr', name: 'Cromo', mass: 52.00, cat: 'transition', row: 4, col: 6 },
    { z: 25, sym: 'Mn', name: 'Manganeso', mass: 54.94, cat: 'transition', row: 4, col: 7 },
    { z: 26, sym: 'Fe', name: 'Hierro', mass: 55.85, cat: 'transition', row: 4, col: 8 },
    { z: 27, sym: 'Co', name: 'Cobalto', mass: 58.93, cat: 'transition', row: 4, col: 9 },
    { z: 28, sym: 'Ni', name: 'Níquel', mass: 58.69, cat: 'transition', row: 4, col: 10 },
    { z: 29, sym: 'Cu', name: 'Cobre', mass: 63.55, cat: 'transition', row: 4, col: 11 },
    { z: 30, sym: 'Zn', name: 'Zinc', mass: 65.38, cat: 'transition', row: 4, col: 12 },
    { z: 31, sym: 'Ga', name: 'Galio', mass: 69.72, cat: 'post-trans', row: 4, col: 13 },
    { z: 32, sym: 'Ge', name: 'Germanio', mass: 72.63, cat: 'metalloid', row: 4, col: 14 },
    { z: 33, sym: 'As', name: 'Arsénico', mass: 74.92, cat: 'metalloid', row: 4, col: 15 },
    { z: 34, sym: 'Se', name: 'Selenio', mass: 78.96, cat: 'nonmetal', row: 4, col: 16 },
    { z: 35, sym: 'Br', name: 'Bromo', mass: 79.90, cat: 'halogen', row: 4, col: 17 },
    { z: 36, sym: 'Kr', name: 'Kriptón', mass: 83.80, cat: 'noble', row: 4, col: 18 }
  ],
  catColors: { alkali: '#fecaca', alkaline: '#fed7aa', transition: '#bfdbfe', 'post-trans': '#bbf7d0', metalloid: '#e9d5ff', nonmetal: '#a7f3d0', halogen: '#f5d0fe', noble: '#bae6fd' },
  catLabels: { alkali: 'Alcalinos', alkaline: 'Alcalinotérreos', transition: 'Transición', 'post-trans': 'Post-transición', metalloid: 'Metaloides', nonmetal: 'No Metales', halogen: 'Halógenos', noble: 'Gases Nobles' },
  videos: [
    { title: 'Configuración Electrónica: Regla de las Diagonales', youtubeId: '4MMWZeY-mU0', duration: '12:45', category: 'Átomo', description: 'Aprende a llenar orbitales usando el diagrama de Moeller paso a paso.' },
    { title: 'Estequiometría: Reactivo Limitante', youtubeId: '_H2_Uu1mGAs', duration: '18:20', category: 'Cálculos', description: 'Cómo identificar qué reactivo se agota primero en una reacción.' },
    { title: 'Geometría Molecular VSEPR', youtubeId: 'nxebQZUVvTg', duration: '15:10', category: 'Enlace', description: 'Predice la forma de las moléculas según la repulsión de pares electrónicos.' },
    { title: 'Equilibrio: Principio de Le Chatelier', youtubeId: 'dId0o77YwS0', duration: '10:30', category: 'Dinámica', description: 'Qué sucede cuando perturbamos un sistema en equilibrio.' }
  ],
  faqs: [
    { q: '¿Cómo se calcula la masa molar?', a: 'Suma las masas atómicas de cada elemento presente en la fórmula molecular, multiplicadas por sus respectivos subíndices.' },
    { q: '¿Cuál es la diferencia entre molaridad y molalidad?', a: 'La Molaridad (M) son moles por litro de solución, mientras que la Molalidad (m) son moles por kilogramo de disolvente.' },
    { q: '¿Qué es un reactivo limitante?', a: 'Es el reactivo que se consume totalmente en una reacción química y determina la cantidad máxima de producto que se puede formar.' }
  ],
  footer: {
    description: 'Plataforma dedicada a la enseñanza de la química con rigor académico y herramientas modernas.',
    columns: [
      { title: 'Académico', links: ['Temario Completo', 'Simuladores', 'Bibliografía', 'Ejercicios PDF'] },
      { title: 'Recursos', links: ['Tabla Periódica', 'Calculadora Molar', 'Glosario', 'Normas APA'] },
      { title: 'Soporte', links: ['Preguntas Frecuentes', 'Contacto', 'Política de Privacidad'] }
    ],
    socials: [
      { label: '𝕏', url: '#' },
      { label: 'f', url: '#' },
      { label: 'in', url: '#' },
      { label: 'y', url: '#' }
    ]
  },
  nav: [
    { label: 'Temas', href: '#topics', icon: '📚' },
    { label: 'Simuladores', href: '#simulations', icon: '🧪' },
    { label: 'Laboratorios', href: '#labs', icon: '🔬' },
    { label: 'Videos', href: '#videos', icon: '🎬' },
    { label: 'Tabla Periódica', href: '#periodic', icon: '⚛️' }
  ],
  admin: { password: 'quimicau2024' }
};

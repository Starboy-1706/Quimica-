const CONFIG = {
  site: {
    name: 'Química UNESUR',
    tagline: 'Plataforma de Química General — UNESUR',
    description: 'Plataforma educativa de Química General — UNESUR. Simulaciones interactivas, contenido teórico, guías de laboratorio y videos explicativos.',
    url: 'https://quimicau.vercel.app',
    analyticsId: 'G-XXXXXXXXXX',
    year: 2024,
    version: '2.0.0'
  },
  hero: {
    badge: 'Prof. Wilmer Molina · Química General',
    title: 'Tu laboratorio de <span class="grad">Química</span> en un clic',
    subtitle: 'Teoría, simuladores y prácticas de laboratorio para dominar Química General universitaria.',
    cta: [
      { text: '🚀 Explorar Temas', target: 'topics', style: 'primary' },
      { text: '🧪 Simuladores', target: 'simulations', style: 'ghost' }
    ],
    cards: [
      { icon: '🧪', title: 'Introducción', desc: 'Historia, modelos atómicos y tabla periódica.' },
      { icon: '🧮', title: 'Estequiometría', desc: 'Mol, balance, cálculos y rendimiento.' },
      { icon: '💧', title: 'Disoluciones', desc: 'Concentración, unidades y diluciones.' },
      { icon: '⚗️', title: 'Valoración', desc: 'Ácido-base, pH, titulación y aplicaciones.' }
    ]
  },
  sections: {
    topics: { tag: 'Temas', title: 'Temas', desc: 'Contenido teórico organizado por unidades, desde introducción hasta valoración ácido-base.' },
    simulations: { tag: 'Simuladores', title: 'Simuladores', desc: 'Calculadoras y herramientas interactivas para experimentar con variables en tiempo real.' },
    labs: { tag: 'Experimentos', title: 'Guías de Experimentos', desc: 'Protocolos paso a paso, normas de seguridad y formatos para prácticas de laboratorio.' },
    periodic: { tag: 'Tabla Periódica', title: 'Tabla Periódica', desc: 'Consulta propiedades atómicas y configuraciones electrónicas.' },
    videos: { tag: 'Videos', title: 'Clases en Video', desc: 'Explicaciones paso a paso de los conceptos más importantes.' }
  },
  topics: [
    { title: 'Introducción a la Química', icon: '🧪', desc: 'Historia de la química, modelos atómicos, tabla periódica, formación y nomenclatura de compuestos inorgánicos, y propiedades de la materia.', lessons: ['Historia de la Química', 'Modelos Atómicos', 'Tabla Periódica', 'Formación de Compuestos', 'Nomenclatura Inorgánica', 'Propiedades de la Materia'], tag: 'Tema 1', color: 'var(--teal)' },
    { title: 'Estequiometría', icon: '🧮', desc: 'Concepto de mol, masa molar, leyes ponderales, balance de reacciones, cálculos mol-mol, mol-masa, masa-masa, reactivo limitante, rendimiento y tipos de reacciones.', lessons: ['Fundamentos y Concepto de Mol', 'Masa Molar y Leyes Ponderales', 'Balance de Reacciones', 'Cálculos Básicos: Mol-Mol, Mol-Masa, Masa-Masa', 'Relación con Gases', 'Tipos de Reacciones Químicas', 'Reactivo Limitante y en Exceso', 'Rendimiento de Reacción'], tag: 'Tema 2', color: 'var(--blue)' },
    { title: 'Disoluciones', icon: '💧', desc: 'Soluto, solvente, concentración, unidades físicas (%m/m, %m/V, %v/v), unidades químicas (M, N, m, ppm), diluciones y preparación experimental.', lessons: ['Soluto, Solvente y Solución', 'Unidades Físicas de Concentración', 'Unidades Químicas de Concentración', 'Diluciones', 'Parte Experimental: NaOH'], tag: 'Tema 3', color: 'var(--indigo)' },
    { title: 'Valoración Ácido-Base', icon: '⚗️', desc: 'Reacciones ácido-base, ácidos y bases de Arrhenius, pH, valoración, curva de titulación, punto de equivalencia, indicadores y aplicaciones prácticas.', lessons: ['Reacción Ácido-Base', 'Ácidos y Bases: Fuertes, Débiles y Arrhenius', 'pH y su Relación con Acidez y Basicidad', 'Valoración Ácido-Base', 'Curva de Valoración y Punto de Equivalencia', 'Indicadores y Zona de Viraje', 'Aplicaciones: Acidez de Leche y Dureza del Agua'], tag: 'Tema 4', color: 'var(--purple)' },
    { title: 'Nomenclatura', icon: '🏷️', desc: 'Nomenclatura sistemática, tradicional y Stock para óxidos, ácidos, bases, sales e hidruros inorgánicos.', lessons: ['Reglas IUPAC', 'Óxidos y Anhídridos', 'Ácidos e Hidróxidos', 'Sales y Nomenclatura Stock'], tag: 'Referencia', color: 'var(--amber)' },
    { title: 'Experimentos', icon: '🔬', desc: 'Guías de prácticas de laboratorio: materiales, técnicas de medición, seguridad química y separación de mezclas.', lessons: ['Materiales de Laboratorio', 'Técnicas de Medición', 'Normas de Seguridad', 'Separación de Mezclas', 'Cálculos de Recuperación'], tag: 'Prácticas', color: 'var(--emerald)' }
  ],
  lessonContent: {
    'Materiales de Laboratorio': [
      { t: 'Material de vidrio', c: '**Vaso de precipitado (Beaker):** Recipiente cilíndrico con pico vertedor. Se usa para calentar líquidos, preparar mezclas y reacciones. No es volumétrico — su escala es aproximada (±5%).\n\n**Matraz Erlenmeyer:** Recipiente cónico con cuello estrecho. Ideal para titulaciones porque evita salpicaduras al agitar.\n\n**Matraz aforado:** Recipiente de fondo plano con cuello largo y una marca de aforo. Se usa exclusivamente para preparar soluciones de concentración exacta. **Precisión:** ±0.1 mL en matraces de 100 mL.\n\n**Probeta graduada:** Cilindro con escala grabada para medir volúmenes. Se lee al nivel del **menisco inferior**.\n\n**Bureta:** Tubo graduado con llave en la parte inferior. Es el instrumento más preciso para dispensar volúmenes variables. Precisión: ±0.05 mL.\n\n**Pipeta volumétrica:** Mide un volumen fijo con alta precisión. Se usa con **propipeta** (nunca succionar con la boca).' },
      { t: 'Otros materiales esenciales', c: '**Vidrio de reloj:** Se usa para pesar sólidos o cubrir vasos durante reacciones.\n\n**Cápsula de porcelana:** Resistente a altas temperaturas. Se usa para evaporar solventes.\n\n**Balanza analítica:** Precisión de ±0.0001 g.\n- Verificar que esté nivelada\n- **Tarar** antes de cada pesada\n- Nunca colocar reactivos directamente\n\n**Mechero Bunsen:** La llama azul (oxidante) es la más caliente (~1500°C). **⚠️ Verificar que no haya solventes inflamables cerca.**' }
    ],
    'Modelos Atómicos': [
      { t: 'Fundamentos', c: '**Dalton (1803):** Imaginó el átomo como esferas sólidas e indivisibles.\n**Thomson (1904):** Descubrió el electrón (modelo de "budín de pasas").\n**Rutherford (1911):** Demostró que existe un núcleo denso y positivo.' },
      { t: 'Modelo de Bohr', c: 'Niels Bohr propuso en 1913 que los electrones giran en órbitas circulares definidas alrededor del núcleo.\n\n- Cada órbita tiene una **energía específica**.\n- Los electrones pueden "saltar" entre niveles absorbiendo o emitiendo fotones.' },
      { t: 'Modelo Cuántico Actual', c: 'Desarrollado por Schrödinger y Heisenberg. Ya no hablamos de órbitas, sino de **orbitales**.\n\nUn orbital es la región del espacio donde existe una alta probabilidad (90%+) de encontrar un electrón.' }
    ],
    'Normas de Seguridad': [
      { t: 'Reglas fundamentales', c: '**⚠️ EPP obligatorio:**\n- Bata de laboratorio\n- Lentes de seguridad\n- Guantes de nitrilo\n- Calzado cerrado\n\n**⚠️ Manejo de reactivos:**\n- Al diluir ácido: **agregar ÁCIDO sobre AGUA** (nunca al revés)\n- Etiquetar toda solución preparada\n\n**⚠️ En caso de accidente:**\n- Derrame de ácido: neutralizar con bicarbonato de sodio\n- Quemadura: lavar con agua fría 15 minutos' }
    ],
    'Separación de Mezclas': [
      { t: 'Métodos de separación', c: '**Filtración:** Separa sólido insoluble de líquido.\n\n**Decantación:** Separa líquidos inmiscibles.\n\n**Evaporación:** Elimina el solvente aplicando calor.\n\n**Destilación:** Separa líquidos miscibles con diferentes puntos de ebullición.\n\n**Cristalización:** Se disuelve el sólido en caliente hasta saturación, luego se enfría.' }
    ],
    'Cálculos de Recuperación': [
      { t: 'Fórmulas', c: '**% Arena** = (Mₐ / Mₘ) × 100\n**% Sal** = (Mₛ / Mₘ) × 100\n**% Eficiencia** = ((Mₐ + Mₛ) / Mₘ) × 100\n\n**Ejemplo:**\nMezcla: 10.000 g | Arena: 6.245 g | Sal: 3.510 g\n% Eficiencia = 97.55%' }
    ],
    'Técnicas de Medición': [
      { t: 'Lectura del menisco', c: 'La lectura siempre se toma en la parte inferior del **menisco**, con los ojos al nivel del líquido.\n\n**Error de paralaje:** Se produce cuando el ojo no está al mismo nivel que la escala.' },
      { t: 'Aforar y enrasar', c: '**Aforar:** Llenar un matraz aforado exactamente hasta la marca de aforo.\n\n**Curar:** Enjuagar el instrumento con el mismo líquido que se va a medir (2-3 veces).' }
    ]
  },
  quizData: {
    'Modelos Atómicos': [
      { q: '¿Qué modelo atómico propuso la existencia de un núcleo?', opts: ['Dalton', 'Thomson', 'Rutherford', 'Bohr'], correct: 2, exp: 'Rutherford demostró que el átomo tiene un núcleo pequeño, denso y positivo.' },
      { q: '¿Qué descubrió Thomson?', opts: ['El protón', 'El electrón', 'El neutrón', 'El núcleo'], correct: 1, exp: 'Thomson descubrió el electrón en 1897.' },
      { q: '¿Qué modelo explica los electrones como "nubes de probabilidad"?', opts: ['Dalton', 'Bohr', 'Mecánico-cuántico', 'Rutherford'], correct: 2, exp: 'El modelo mecánico-cuántico describe electrones mediante orbitales.' }
    ],
    '_default': [
      { q: '¿Comprendiste los conceptos?', opts: ['Sí', 'Necesito repasar', 'No'], correct: 0, exp: '¡Excelente! Continúa con la siguiente lección.' }
    ]
  },
  simulations: [
    { id: 'sim-ph', title: 'Medidor de pH', icon: '🌡️', desc: 'Mide el pH de diversas sustancias y clasifica su carácter.', tag: 'Ácido-Base', color: 'var(--rose)' },
    { id: 'sim-tit', title: 'Curva de Titulación', icon: '🧪', desc: 'Simula una valoración ácido-base y grafica la curva de pH.', tag: 'Valoración', color: 'var(--purple)' },
    { id: 'sim-estequio', title: 'Calculadora Estequiométrica', icon: '🧮', desc: 'Calcula moles, masa de producto y partículas a partir de un reactivo.', tag: 'Estequiometría', color: 'var(--blue)' },
    { id: 'sim-dilucion', title: 'Calculadora de Diluciones', icon: '💧', desc: 'Determina el volumen necesario para preparar una dilución (M₁V₁=M₂V₂).', tag: 'Disoluciones', color: 'var(--teal)' },
    { id: 'sim-config', title: 'Configuración Electrónica', icon: '⚛️', desc: 'Genera la configuración electrónica de cualquier elemento (Z=1 a 36).', tag: 'Introducción', color: 'var(--amber)' },
    { id: 'sim-nox', title: 'Estados de Oxidación', icon: '⚡', desc: 'Determina y verifica los números de oxidación en compuestos.', tag: 'Nomenclatura', color: 'var(--emerald)' },
    { id: 'sim-disol', title: 'Calculadora de Concentración', icon: '🧫', desc: 'Calcula Molaridad, Normalidad y Molalidad.', tag: 'Disoluciones', color: 'var(--orange)' },
    { id: 'sim-valor', title: 'Valoración Ácido-Base', icon: '⚗️', desc: 'Punto de equivalencia, acidez de leche (°D) y dureza del agua.', tag: 'Valoración', color: 'var(--rose)' },
    { id: 'sim-glosario', title: 'Glosario de Química', icon: '📖', desc: 'Definiciones de ácidos, bases, pH, valoración, indicadores y más.', tag: 'Referencia', color: 'var(--indigo)' }
  ],
  labs: [
    { title: 'Preparación de Soluciones', icon: '⚖️', tag: 'Experimento 1', color: 'var(--teal)', desc: 'Técnicas de pesada y aforo para soluciones patrón.' },
    { title: 'Cinética Química', icon: '⏱️', tag: 'Experimento 2', color: 'var(--rose)', desc: 'Estudio de la velocidad de reacción del tiosulfato.' },
    { title: 'Valoración Redox', icon: '🧪', tag: 'Experimento 3', color: 'var(--purple)', desc: 'Determinación de hierro por permanganometría.' }
  ],
  labGuides: {
    'lab-0': {
      safety: ['Uso obligatorio de bata y gafas.', 'Manipulación de ácidos en campana.', 'Etiquetado inmediato de soluciones.'],
      materials: ['Matraz aforado 100mL', 'Balanza analítica', 'Vidrio de reloj', 'Espátula', 'Agua destilada'],
      procedure: [
        { n: 1, p: 'Calcular la masa necesaria de soluto para la concentración requerida.' },
        { n: 2, p: 'Pesar el soluto en la balanza con precisión de 0.001g.' },
        { n: 3, p: 'Disolver el sólido en un vaso con aprox. 50mL de agua.' },
        { n: 4, p: 'Trasvasar cuantitativamente al matraz aforado.' },
        { n: 5, p: 'Aforar hasta la marca del menisco y homogeneizar.' }
      ],
      obs: 'La disolución de algunos sólidos puede ser exotérmica o endotérmica.',
      questions: ['¿Por qué no se debe pesar directamente en el matraz?', '¿Qué error se introduce si se sobrepasa el aforo?']
    }
  },
  elements: [
    {z:1,sym:'H',name:'Hidrógeno',mass:1.008,cat:'nonmetal',row:1,col:1,config:'1s¹'},
    {z:2,sym:'He',name:'Helio',mass:4.003,cat:'noble',row:1,col:18,config:'1s²'},
    {z:3,sym:'Li',name:'Litio',mass:6.941,cat:'alkali',row:2,col:1,config:'[He] 2s¹'},
    {z:4,sym:'Be',name:'Berilio',mass:9.012,cat:'alkaline',row:2,col:2,config:'[He] 2s²'},
    {z:5,sym:'B',name:'Boro',mass:10.81,cat:'metalloid',row:2,col:13},
    {z:6,sym:'C',name:'Carbono',mass:12.01,cat:'nonmetal',row:2,col:14},
    {z:7,sym:'N',name:'Nitrógeno',mass:14.01,cat:'nonmetal',row:2,col:15},
    {z:8,sym:'O',name:'Oxígeno',mass:16.00,cat:'nonmetal',row:2,col:16},
    {z:9,sym:'F',name:'Flúor',mass:19.00,cat:'halogen',row:2,col:17},
    {z:10,sym:'Ne',name:'Neón',mass:20.18,cat:'noble',row:2,col:18},
    {z:11,sym:'Na',name:'Sodio',mass:22.99,cat:'alkali',row:3,col:1,config:'[Ne] 3s¹'},
    {z:12,sym:'Mg',name:'Magnesio',mass:24.31,cat:'alkaline',row:3,col:2,config:'[Ne] 3s²'},
    {z:13,sym:'Al',name:'Aluminio',mass:26.98,cat:'post-trans',row:3,col:13},
    {z:14,sym:'Si',name:'Silicio',mass:28.09,cat:'metalloid',row:3,col:14},
    {z:15,sym:'P',name:'Fósforo',mass:30.97,cat:'nonmetal',row:3,col:15},
    {z:16,sym:'S',name:'Azufre',mass:32.07,cat:'nonmetal',row:3,col:16},
    {z:17,sym:'Cl',name:'Cloro',mass:35.45,cat:'halogen',row:3,col:17},
    {z:18,sym:'Ar',name:'Argón',mass:39.95,cat:'noble',row:3,col:18},
    {z:19,sym:'K',name:'Potasio',mass:39.10,cat:'alkali',row:4,col:1},
    {z:20,sym:'Ca',name:'Calcio',mass:40.08,cat:'alkaline',row:4,col:2},
    {z:21,sym:'Sc',name:'Escandio',mass:44.96,cat:'transition',row:4,col:3},
    {z:22,sym:'Ti',name:'Titanio',mass:47.87,cat:'transition',row:4,col:4},
    {z:23,sym:'V',name:'Vanadio',mass:50.94,cat:'transition',row:4,col:5},
    {z:24,sym:'Cr',name:'Cromo',mass:52.00,cat:'transition',row:4,col:6},
    {z:25,sym:'Mn',name:'Manganeso',mass:54.94,cat:'transition',row:4,col:7},
    {z:26,sym:'Fe',name:'Hierro',mass:55.85,cat:'transition',row:4,col:8},
    {z:27,sym:'Co',name:'Cobalto',mass:58.93,cat:'transition',row:4,col:9},
    {z:28,sym:'Ni',name:'Níquel',mass:58.69,cat:'transition',row:4,col:10},
    {z:29,sym:'Cu',name:'Cobre',mass:63.55,cat:'transition',row:4,col:11},
    {z:30,sym:'Zn',name:'Zinc',mass:65.38,cat:'transition',row:4,col:12},
    {z:31,sym:'Ga',name:'Galio',mass:69.72,cat:'post-trans',row:4,col:13},
    {z:32,sym:'Ge',name:'Germanio',mass:72.63,cat:'metalloid',row:4,col:14},
    {z:33,sym:'As',name:'Arsénico',mass:74.92,cat:'metalloid',row:4,col:15},
    {z:34,sym:'Se',name:'Selenio',mass:78.97,cat:'nonmetal',row:4,col:16},
    {z:35,sym:'Br',name:'Bromo',mass:79.90,cat:'halogen',row:4,col:17},
    {z:36,sym:'Kr',name:'Criptón',mass:83.80,cat:'noble',row:4,col:18},
    {z:37,sym:'Rb',name:'Rubidio',mass:85.47,cat:'alkali',row:5,col:1},
    {z:38,sym:'Sr',name:'Estroncio',mass:87.62,cat:'alkaline',row:5,col:2},
    {z:39,sym:'Y',name:'Itrio',mass:88.91,cat:'transition',row:5,col:3},
    {z:40,sym:'Zr',name:'Zirconio',mass:91.22,cat:'transition',row:5,col:4},
    {z:41,sym:'Nb',name:'Niobio',mass:92.91,cat:'transition',row:5,col:5},
    {z:42,sym:'Mo',name:'Molibdeno',mass:95.95,cat:'transition',row:5,col:6},
    {z:43,sym:'Tc',name:'Tecnecio',mass:98,cat:'transition',row:5,col:7},
    {z:44,sym:'Ru',name:'Rutenio',mass:101.07,cat:'transition',row:5,col:8},
    {z:45,sym:'Rh',name:'Rodio',mass:102.91,cat:'transition',row:5,col:9},
    {z:46,sym:'Pd',name:'Paladio',mass:106.42,cat:'transition',row:5,col:10},
    {z:47,sym:'Ag',name:'Plata',mass:107.87,cat:'transition',row:5,col:11},
    {z:48,sym:'Cd',name:'Cadmio',mass:112.41,cat:'transition',row:5,col:12},
    {z:49,sym:'In',name:'Indio',mass:114.82,cat:'post-trans',row:5,col:13},
    {z:50,sym:'Sn',name:'Estaño',mass:118.71,cat:'post-trans',row:5,col:14},
    {z:51,sym:'Sb',name:'Antimonio',mass:121.76,cat:'metalloid',row:5,col:15},
    {z:52,sym:'Te',name:'Telurio',mass:127.60,cat:'metalloid',row:5,col:16},
    {z:53,sym:'I',name:'Yodo',mass:126.90,cat:'halogen',row:5,col:17},
    {z:54,sym:'Xe',name:'Xenón',mass:131.29,cat:'noble',row:5,col:18},
    {z:55,sym:'Cs',name:'Cesio',mass:132.91,cat:'alkali',row:6,col:1},
    {z:56,sym:'Ba',name:'Bario',mass:137.33,cat:'alkaline',row:6,col:2},
    {z:57,sym:'La',name:'Lantano',mass:138.91,cat:'lanthanide',row:9,col:3},
    {z:58,sym:'Ce',name:'Cerio',mass:140.12,cat:'lanthanide',row:9,col:4},
    {z:59,sym:'Pr',name:'Praseodimio',mass:140.91,cat:'lanthanide',row:9,col:5},
    {z:60,sym:'Nd',name:'Neodimio',mass:144.24,cat:'lanthanide',row:9,col:6},
    {z:61,sym:'Pm',name:'Prometio',mass:145,cat:'lanthanide',row:9,col:7},
    {z:62,sym:'Sm',name:'Samario',mass:150.36,cat:'lanthanide',row:9,col:8},
    {z:63,sym:'Eu',name:'Europio',mass:151.96,cat:'lanthanide',row:9,col:9},
    {z:64,sym:'Gd',name:'Gadolinio',mass:157.25,cat:'lanthanide',row:9,col:10},
    {z:65,sym:'Tb',name:'Terbio',mass:158.93,cat:'lanthanide',row:9,col:11},
    {z:66,sym:'Dy',name:'Disprosio',mass:162.50,cat:'lanthanide',row:9,col:12},
    {z:67,sym:'Ho',name:'Holmio',mass:164.93,cat:'lanthanide',row:9,col:13},
    {z:68,sym:'Er',name:'Erbio',mass:167.26,cat:'lanthanide',row:9,col:14},
    {z:69,sym:'Tm',name:'Tulio',mass:168.93,cat:'lanthanide',row:9,col:15},
    {z:70,sym:'Yb',name:'Iterbio',mass:173.05,cat:'lanthanide',row:9,col:16},
    {z:71,sym:'Lu',name:'Lutecio',mass:174.97,cat:'lanthanide',row:9,col:17},
    {z:72,sym:'Hf',name:'Hafnio',mass:178.49,cat:'transition',row:6,col:4},
    {z:73,sym:'Ta',name:'Tantalio',mass:180.95,cat:'transition',row:6,col:5},
    {z:74,sym:'W',name:'Tungsteno',mass:183.84,cat:'transition',row:6,col:6},
    {z:75,sym:'Re',name:'Renio',mass:186.21,cat:'transition',row:6,col:7},
    {z:76,sym:'Os',name:'Osmio',mass:190.23,cat:'transition',row:6,col:8},
    {z:77,sym:'Ir',name:'Iridio',mass:192.22,cat:'transition',row:6,col:9},
    {z:78,sym:'Pt',name:'Platino',mass:195.08,cat:'transition',row:6,col:10},
    {z:79,sym:'Au',name:'Oro',mass:196.97,cat:'transition',row:6,col:11},
    {z:80,sym:'Hg',name:'Mercurio',mass:200.59,cat:'transition',row:6,col:12},
    {z:81,sym:'Tl',name:'Talio',mass:204.38,cat:'post-trans',row:6,col:13},
    {z:82,sym:'Pb',name:'Plomo',mass:207.2,cat:'post-trans',row:6,col:14},
    {z:83,sym:'Bi',name:'Bismuto',mass:208.98,cat:'post-trans',row:6,col:15},
    {z:84,sym:'Po',name:'Polonio',mass:209,cat:'post-trans',row:6,col:16},
    {z:85,sym:'At',name:'Astato',mass:210,cat:'halogen',row:6,col:17},
    {z:86,sym:'Rn',name:'Radón',mass:222,cat:'noble',row:6,col:18},
    {z:87,sym:'Fr',name:'Francio',mass:223,cat:'alkali',row:7,col:1},
    {z:88,sym:'Ra',name:'Radio',mass:226,cat:'alkaline',row:7,col:2},
    {z:89,sym:'Ac',name:'Actinio',mass:227,cat:'actinide',row:10,col:3},
    {z:90,sym:'Th',name:'Torio',mass:232.04,cat:'actinide',row:10,col:4},
    {z:91,sym:'Pa',name:'Protactinio',mass:231.04,cat:'actinide',row:10,col:5},
    {z:92,sym:'U',name:'Uranio',mass:238.03,cat:'actinide',row:10,col:6},
    {z:93,sym:'Np',name:'Neptunio',mass:237,cat:'actinide',row:10,col:7},
    {z:94,sym:'Pu',name:'Plutonio',mass:244,cat:'actinide',row:10,col:8},
    {z:95,sym:'Am',name:'Americio',mass:243,cat:'actinide',row:10,col:9},
    {z:96,sym:'Cm',name:'Curio',mass:247,cat:'actinide',row:10,col:10},
    {z:97,sym:'Bk',name:'Berkelio',mass:247,cat:'actinide',row:10,col:11},
    {z:98,sym:'Cf',name:'Californio',mass:251,cat:'actinide',row:10,col:12},
    {z:99,sym:'Es',name:'Einsteinio',mass:252,cat:'actinide',row:10,col:13},
    {z:100,sym:'Fm',name:'Fermio',mass:257,cat:'actinide',row:10,col:14},
    {z:101,sym:'Md',name:'Mendelevio',mass:258,cat:'actinide',row:10,col:15},
    {z:102,sym:'No',name:'Nobelio',mass:259,cat:'actinide',row:10,col:16},
    {z:103,sym:'Lr',name:'Lawrencio',mass:266,cat:'actinide',row:10,col:17},
    {z:104,sym:'Rf',name:'Rutherfordio',mass:267,cat:'transition',row:7,col:4},
    {z:105,sym:'Db',name:'Dubnio',mass:268,cat:'transition',row:7,col:5},
    {z:106,sym:'Sg',name:'Seaborgio',mass:269,cat:'transition',row:7,col:6},
    {z:107,sym:'Bh',name:'Bohrio',mass:270,cat:'transition',row:7,col:7},
    {z:108,sym:'Hs',name:'Hasio',mass:277,cat:'transition',row:7,col:8},
    {z:109,sym:'Mt',name:'Meitnerio',mass:278,cat:'transition',row:7,col:9},
    {z:110,sym:'Ds',name:'Darmstatio',mass:281,cat:'transition',row:7,col:10},
    {z:111,sym:'Rg',name:'Roentgenio',mass:282,cat:'transition',row:7,col:11},
    {z:112,sym:'Cn',name:'Copernicio',mass:285,cat:'transition',row:7,col:12},
    {z:113,sym:'Nh',name:'Nihonio',mass:286,cat:'post-trans',row:7,col:13},
    {z:114,sym:'Fl',name:'Flerovio',mass:289,cat:'post-trans',row:7,col:14},
    {z:115,sym:'Mc',name:'Moscovio',mass:290,cat:'post-trans',row:7,col:15},
    {z:116,sym:'Lv',name:'Livermorio',mass:293,cat:'post-trans',row:7,col:16},
    {z:117,sym:'Ts',name:'Teneso',mass:294,cat:'halogen',row:7,col:17},
    {z:118,sym:'Og',name:'Oganesón',mass:294,cat:'noble',row:7,col:18}
  ],
  catColors: { alkali:'#fecaca', alkaline:'#fed7aa', transition:'#bfdbfe', 'post-trans':'#bbf7d0', metalloid:'#e9d5ff', nonmetal:'#a7f3d0', halogen:'#f5d0fe', noble:'#bae6fd', lanthanide:'#fde68a', actinide:'#fdba74' },
  catLabels: { alkali:'Alcalinos', alkaline:'Alcalinotérreos', transition:'Transición', 'post-trans':'Post-transición', metalloid:'Metaloides', nonmetal:'No Metales', halogen:'Halógenos', noble:'Gases Nobles', lanthanide:'Lantánidos', actinide:'Actínidos' },
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
    description: 'Cátedra del Prof. Wilmer Molina. Desarrollado por Jimmy Bracho.',
    columns: [
      { title: 'Temas', links: ['Introducción a la Química', 'Estequiometría', 'Disoluciones', 'Valoración Ácido-Base'] },
      { title: 'Herramientas', links: ['Simuladores', 'Tabla Periódica', 'Glosario', 'Nomenclatura'] },
      { title: 'Prácticas', links: ['Experimentos', 'Guías de Lab', 'Videos', 'Preguntas Frecuentes'] }
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
    { label: 'Experimentos', href: '#labs', icon: '🔬' },
    { label: 'Videos', href: '#videos', icon: '🎬' },
    { label: 'Tabla Periódica', href: '#periodic', icon: '⚛️' }
  ],
  customSims: [
    {
      id: 'custom-ejemplo',
      title: 'Calculadora de Densidad',
      icon: '⚖️',
      desc: 'Calcula densidad, masa o volumen.',
      tag: 'Ejemplo',
      color: 'var(--orange)',
      inputs: [
        { label: 'Masa', key: 'masa', unit: 'g', min: 0.1, max: 1000, step: 0.1, default: 100 },
        { label: 'Volumen', key: 'vol', unit: 'mL', min: 0.1, max: 1000, step: 0.1, default: 50 }
      ],
      outputs: [
        { label: 'Densidad', formula: 'masa / vol', unit: 'g/mL', color: 'var(--teal)', decimals: 4 },
        { label: 'Masa (si dens=1)', formula: '1 * vol', unit: 'g', color: 'var(--blue)', decimals: 2 }
      ],
      info: 'ρ = m / V. La densidad del agua es aproximadamente 1 g/mL a 25°C.'
    }
  ],
  admin: { password: 'quimicau2024' }
};


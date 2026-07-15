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
    { title: 'Disoluciones', icon: '💧', desc: 'Clasificación de sustancias, tipos de disoluciones, unidades de concentración físicas y químicas, y preparación experimental. Basado en la Práctica 5.', lessons: ['Fundamento y Clasificación', 'Componentes y Tipos', 'Concentración: Unidades Físicas', 'Concentración: Unidades Químicas', 'Parte Experimental: NaOH'], tag: 'Práctica 5', color: 'var(--indigo)' },
    { title: 'Termoquímica', icon: '🔥', desc: 'Entalpía de reacción, ley de Hess y espontaneidad.', lessons: ['Leyes de Termodinámica', 'Entalpía y Calorimetría', 'Energía Libre de Gibbs'], tag: 'Energía', color: 'var(--rose)' },
    { title: 'Equilibrio Químico', icon: '⚖️', desc: 'Constantes Kc y Kp, principio de Le Chatelier.', lessons: ['Constante de Equilibrio', 'Factores de Alteración', 'Equilibrio de Gases'], tag: 'Dinámica', color: 'var(--amber)' }
  ],
  lessonContent: {
    'Modelos Atómicos': [
      { t: 'Fundamentos', c: 'La historia del átomo es la historia de la búsqueda de la unidad fundamental de la materia. Desde los filósofos griegos hasta la mecánica cuántica moderna.\n\n**Dalton (1803):** Imaginó el átomo como esferas sólidas e indivisibles.\n**Thomson (1904):** Descubrió el electrón (modelo de "budín de pasas").\n**Rutherford (1911):** Demostró que existe un núcleo denso y positivo.' },
      { t: 'Modelo de Bohr', c: 'Niels Bohr propuso en 1913 que los electrones giran en órbitas circulares definidas alrededor del núcleo.\n\n- Cada órbita tiene una **energía específica**.\n- Los electrones pueden "saltar" entre niveles absorbiendo o emitiendo fotones.\n- Este modelo explicó con éxito el espectro del Hidrógeno pero falló en átomos multielectrónicos.' },
      { t: 'Modelo Cuántico Actual', c: 'Desarrollado por Schrödinger y Heisenberg. Ya no hablamos de órbitas, sino de **orbitales**.\n\nUn orbital es la región del espacio donde existe una alta probabilidad (90%+) de encontrar un electrón. Se definen mediante 4 números cuánticos: n, l, m y s.' }
    ],
    'Fundamento y Clasificación': [
      { t: 'Clasificación de la materia', c: 'Toda la materia se clasifica en dos grandes categorías:\n\n**Sustancias puras:** Tienen composición definida y constante.\n- **Elementos:** No pueden descomponerse en sustancias más simples. Ejemplos: hierro (Fe), oxígeno (O₂), oro (Au).\n- **Compuestos:** Formados por dos o más elementos en proporción fija. Ejemplos: agua (H₂O), sal (NaCl), glucosa (C₆H₁₂O₆).\n\n**Mezclas:** Combinaciones de dos o más sustancias que conservan sus propiedades individuales.\n- **Homogéneas (Soluciones):** Una sola fase visible. No se distinguen sus componentes. Ejemplo: agua con sal disuelta, aire, aleaciones.\n- **Heterogéneas:** Dos o más fases visibles. Se distinguen sus componentes. Ejemplo: agua con aceite, arena con limaduras de hierro.' },
      { t: 'Conceptos clave', c: 'Para comprender las disoluciones es fundamental dominar estos términos:\n\n**Fase:** Porción de materia con propiedades intensivas uniformes (temperatura, presión, composición, densidad). Una solución tiene UNA sola fase.\n\n**Miscible:** Sustancias que se mezclan en cualquier proporción formando una solución homogénea. Ejemplo: agua y etanol son miscibles en todas las proporciones.\n\n**Inmiscible:** Sustancias que NO se mezclan y forman fases separadas. Ejemplo: agua y aceite son inmiscibles. Al agitarlos se forma una emulsión temporal, pero eventualmente se separan.\n\n**Solvatación:** Proceso por el cual las moléculas de solvente rodean y estabilizan las partículas de soluto. Cuando el solvente es agua, se llama **hidratación**. Es el mecanismo fundamental por el cual un sólido "desaparece" al disolverse.\n\n**Solubilidad:** Cantidad máxima de soluto que puede disolverse en una cantidad determinada de solvente a una temperatura específica. Se expresa generalmente en g/100 mL.' }
    ],
    'Componentes y Tipos': [
      { t: 'Soluto y Solvente', c: 'Toda disolución tiene dos componentes principales:\n\n**Soluto:** Componente que se encuentra en MENOR proporción. Es la sustancia que se disuelve. Puede ser sólido, líquido o gaseoso.\n\n**Solvente (Disolvente):** Componente que se encuentra en MAYOR proporción. Es la sustancia que disuelve al soluto. El solvente más importante en química y biología es el **agua**, razón por la cual las soluciones acuosas son las más estudiadas.\n\nCuando ambos componentes están en la misma fase (ej: dos líquidos miscibles), el solvente es el que está en mayor cantidad.' },
      { t: 'Tipos de disoluciones', c: 'Las disoluciones se clasifican según el estado físico del solvente:\n\n**Disoluciones Gaseosas (solvente = gas):**\n- Gas en gas: Aire (N₂ + O₂ + otros gases)\n- Líquido en gas: Humedad en el aire\n- Sólido en gas: Naftalina sublimada en aire\n\n**Disoluciones Líquidas/Acuosas (solvente = líquido):**\n- Gas en líquido: CO₂ en agua (bebidas carbonatadas)\n- Líquido en líquido: Etanol en agua (bebidas alcohólicas)\n- Sólido en líquido: NaCl en agua (agua de mar), azúcar en café\n\n**Disoluciones Sólidas (solvente = sólido):**\n- Gas en sólido: Hidrógeno en paladio\n- Líquido en sólido: Mercurio en plata (amalgama dental)\n- Sólido en sólido: Aleaciones (bronce = Cu + Sn, acero = Fe + C)\n\nLas **soluciones acuosas** son las más importantes en la naturaleza (fluidos biológicos, océanos) y en la industria (farmacéutica, alimentaria, textil).' },
      { t: 'Clasificación por concentración', c: 'Las disoluciones pueden describirse cualitativamente según la cantidad de soluto:\n\n**Diluida:** Contiene una pequeña cantidad de soluto respecto al solvente. Ejemplo: una pizca de sal en un litro de agua.\n\n**Concentrada:** Contiene una gran cantidad de soluto respecto al solvente. Ejemplo: jarabe de azúcar.\n\n**Insaturada:** Contiene MENOS soluto del máximo que puede disolver a esa temperatura. Si se agrega más soluto, este se disuelve.\n\n**Saturada:** Contiene la cantidad MÁXIMA de soluto que puede disolverse a esa temperatura. Si se agrega más, queda sin disolver en el fondo.\n\n**Sobresaturada:** Contiene MÁS soluto del que debería disolverse a esa temperatura. Es un estado inestable que se logra calentando una solución saturada, disolviendo más soluto, y luego enfriando lentamente. Cualquier perturbación provoca la cristalización del exceso.' }
    ],
    'Concentración: Unidades Físicas': [
      { t: 'Porcentaje masa/masa (% m/m)', c: 'Indica los gramos de soluto por cada 100 gramos de solución.\n\n**Fórmula:**\n% m/m = (masa de soluto / masa de solución) × 100\n\nDonde: masa de solución = masa de soluto + masa de solvente\n\n**Ejemplo:** Si disuelves 5 g de NaCl en 95 g de agua:\n% m/m = (5 / 100) × 100 = 5%\n\nSignifica que por cada 100 g de solución, hay 5 g de sal.' },
      { t: 'Porcentaje masa/volumen (% m/v)', c: 'Indica los gramos de soluto por cada 100 mL de solución. Es la unidad más usada en farmacia y medicina.\n\n**Fórmula:**\n% m/v = (masa de soluto en g / volumen de solución en mL) × 100\n\n**Ejemplo:** Suero fisiológico al 0.9% m/v significa que hay 0.9 g de NaCl por cada 100 mL de solución.\n\nPara preparar 500 mL de suero fisiológico:\nmasa = (0.9 × 500) / 100 = 4.5 g de NaCl' },
      { t: 'Porcentaje volumen/volumen (% v/v) y ppm', c: '**% v/v:** Se usa cuando soluto y solvente son líquidos. Indica los mL de soluto por cada 100 mL de solución.\n\n**Fórmula:**\n% v/v = (volumen de soluto / volumen de solución) × 100\n\n**Ejemplo:** Una bebida alcohólica de 12% v/v tiene 12 mL de etanol por cada 100 mL de bebida.\n\n---\n\n**Partes por millón (ppm):** Se usa para concentraciones muy pequeñas (contaminantes, trazas).\n\n**Fórmula:**\nppm = (masa de soluto / masa de solución) × 10⁶\n\nEquivalencia práctica: 1 ppm ≈ 1 mg/L (para soluciones acuosas diluidas)\n\n**Ejemplo:** El agua potable no debe tener más de 0.5 ppm de cloro residual, es decir, 0.5 mg de cloro por cada litro de agua.' }
    ],
    'Concentración: Unidades Químicas': [
      { t: 'Molaridad (M) y Molalidad (m)', c: '**Molaridad (M):** Moles de soluto por litro de SOLUCIÓN.\n\nM = n / V(L) = (masa / PM) / V(L)\n\nDonde:\n- n = moles de soluto\n- PM = peso molecular del soluto (g/mol)\n- V = volumen de la solución en litros\n\n**Ejemplo:** Disolver 4 g de NaOH (PM = 40) en agua hasta completar 500 mL:\nM = (4/40) / 0.5 = 0.1 / 0.5 = 0.2 M\n\n---\n\n**Molalidad (m):** Moles de soluto por kilogramo de SOLVENTE (no de solución).\n\nm = n / kg de solvente\n\nDonde: kg de solvente = (masa total de solución − masa de soluto) / 1000\n\n**Ventaja:** La molalidad NO varía con la temperatura porque depende de la masa (no del volumen). Es fundamental para calcular propiedades coligativas.' },
      { t: 'Fracción molar (X)', c: '**Fracción molar:** Proporción de moles de un componente respecto al total de moles en la solución.\n\nX_soluto = n_soluto / (n_soluto + n_solvente)\nX_solvente = n_solvente / (n_soluto + n_solvente)\n\n**Propiedad fundamental:** X_soluto + X_solvente = 1 (siempre)\n\n**Ejemplo:** 18 g de glucosa (PM=180) en 90 g de agua (PM=18):\n- n_glucosa = 18/180 = 0.1 mol\n- n_agua = 90/18 = 5 mol\n- X_glucosa = 0.1 / (0.1 + 5) = 0.0196\n- X_agua = 5 / 5.1 = 0.9804\n- Verificación: 0.0196 + 0.9804 = 1 ✓\n\nLa fracción molar es adimensional y se usa especialmente en termodinámica y equilibrio de fases.' },
      { t: 'Normalidad (N) y Peso Equivalente', c: '**Normalidad (N):** Número de equivalentes de soluto por litro de solución.\n\nN = n° de equivalentes / V(L)\n\nDonde: n° de equivalentes = masa / Peso Equivalente (PE)\n\n**Peso Equivalente (PE):** Depende del tipo de sustancia:\n\n- **Para ácidos:** PE = PM / n° de H⁺ ionizables\n  · HCl: PE = 36.5 / 1 = 36.5\n  · H₂SO₄: PE = 98 / 2 = 49\n  · H₃PO₄: PE = 98 / 3 = 32.67\n\n- **Para bases:** PE = PM / n° de OH⁻\n  · NaOH: PE = 40 / 1 = 40\n  · Ca(OH)₂: PE = 74 / 2 = 37\n\n**Relación M-N:** N = M × factor de equivalencia\n\n**Ejemplo:** H₂SO₄ 0.5 M → N = 0.5 × 2 = 1 N\n\nLa Normalidad es especialmente útil en reacciones de neutralización y titulaciones porque 1 equivalente de ácido reacciona exactamente con 1 equivalente de base.' }
    ],
    'Parte Experimental: NaOH': [
      { t: 'Materiales y equipos', c: 'Para la preparación de la disolución de NaOH se requieren:\n\n**Materiales de vidrio:**\n- Matraz aforado de 100 mL\n- Vaso de precipitados de 250 mL\n- Probeta de 100 mL\n- Varilla de agitación\n- Vidrio de reloj\n\n**Equipos:**\n- Balanza analítica (precisión ± 0.001 g)\n- Agitador magnético (opcional)\n\n**Reactivos:**\n- Hidróxido de Sodio (NaOH) en lentejas o escamas\n- Agua destilada\n\n**Elementos de seguridad:**\n- Bata de laboratorio\n- Lentes de seguridad\n- Guantes de nitrilo\n\n⚠️ El NaOH es altamente corrosivo (causa quemaduras severas). La disolución es fuertemente exotérmica: el matraz se calienta considerablemente al disolverlo.' },
      { t: 'Procedimiento paso a paso', c: '**Objetivo:** Preparar 100 mL de solución de NaOH 0.1 M\n\n**Paso 1 — Cálculo de la masa necesaria:**\nn = M × V = 0.1 mol/L × 0.1 L = 0.01 mol\nmasa = n × PM = 0.01 × 40 g/mol = 0.4 g de NaOH\n\n**Paso 2 — Pesada:**\nColocar un vidrio de reloj sobre la balanza, tarar, y pesar 0.400 g de NaOH. Trabajar rápidamente: el NaOH absorbe humedad del aire (higroscópico).\n\n**Paso 3 — Disolución:**\nTransferir el NaOH al vaso de precipitados. Agregar aproximadamente 50 mL de agua destilada. Agitar con la varilla hasta disolución completa. ¡PRECAUCIÓN! La reacción es exotérmica.\n\n**Paso 4 — Transferencia:**\nDejar enfriar la solución a temperatura ambiente. Trasvasar cuantitativamente al matraz aforado de 100 mL. Enjuagar el vaso con pequeñas porciones de agua destilada y agregar los lavados al matraz.\n\n**Paso 5 — Aforo:**\nCompletar con agua destilada hasta la marca de aforo (100 mL). El menisco inferior debe tocar exactamente la línea. Tapar y homogeneizar invirtiendo el matraz varias veces.\n\n**Paso 6 — Etiquetado:**\nRotular el matraz: NaOH 0.1 M, fecha, nombre del preparador.' },
      { t: 'Ecuaciones y tabla de referencia', c: 'Resumen de las ecuaciones fundamentales utilizadas en esta práctica:\n\n**Concentración:**\n- M = n / V(L) = (g / PM) / V(L)\n- m = n / kg solvente\n- N = eq / V(L) = g / (PE × V(L))\n- X = n_componente / n_total\n\n**Porcentuales:**\n- % m/m = (g soluto / g solución) × 100\n- % m/v = (g soluto / mL solución) × 100\n- % v/v = (mL soluto / mL solución) × 100\n- ppm = (mg soluto / L solución)\n\n**Dilución:**\nC₁ × V₁ = C₂ × V₂\n(la cantidad de soluto se conserva)\n\n**Densidad:**\nρ = masa / volumen (g/mL o g/cm³)\nmasa de solución = ρ × V\nmasa de solvente = masa de solución − masa de soluto\n\n**Relaciones útiles:**\n- N = M × factor de equivalencia\n- PM de NaOH = 40 g/mol\n- PM de HCl = 36.5 g/mol\n- PM de H₂SO₄ = 98 g/mol\n- PM de NaCl = 58.5 g/mol\n- Densidad del agua ≈ 1.00 g/mL a 25°C' }
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
    'Fundamento y Clasificación': [
      { q: '¿Cuál es la diferencia entre una mezcla homogénea y una heterogénea?', opts: ['El color', 'El número de fases visibles', 'La temperatura', 'El peso'], correct: 1, exp: 'Una mezcla homogénea tiene UNA sola fase (no se distinguen componentes), mientras que la heterogénea tiene dos o más fases visibles.' },
      { q: '¿Qué significa que dos líquidos sean "miscibles"?', opts: ['No se mezclan', 'Se mezclan en cualquier proporción', 'Solo se mezclan en caliente', 'Forman un sólido al mezclarse'], correct: 1, exp: 'Miscible significa que se mezclan homogéneamente en cualquier proporción, como agua y etanol.' },
      { q: '¿Qué es la solvatación?', opts: ['Evaporación del solvente', 'Proceso donde el solvente rodea al soluto', 'Precipitación del soluto', 'Cambio de color'], correct: 1, exp: 'La solvatación es el proceso por el cual las moléculas de solvente rodean y estabilizan las partículas de soluto. En agua se llama hidratación.' }
    ],
    'Componentes y Tipos': [
      { q: '¿Qué componente de una disolución está en menor proporción?', opts: ['El solvente', 'El soluto', 'Ambos están en igual proporción', 'Depende de la temperatura'], correct: 1, exp: 'El soluto es el componente en menor proporción; el solvente es el que está en mayor proporción.' },
      { q: '¿Cuál es un ejemplo de disolución sólida?', opts: ['Agua con sal', 'Aire', 'Bronce (Cu + Sn)', 'Refresco'], correct: 2, exp: 'El bronce es una aleación (disolución sólido-sólido) de cobre y estaño.' },
      { q: '¿Qué ocurre si agregas más soluto a una solución saturada?', opts: ['Se disuelve todo', 'El exceso queda sin disolver', 'Explota', 'Cambia de color'], correct: 1, exp: 'En una solución saturada, el soluto adicional no se disuelve y queda como sólido en el fondo.' }
    ],
    'Concentración: Unidades Físicas': [
      { q: '¿Qué significa una solución al 5% m/v?', opts: ['5 mL de soluto en 100 g', '5 g de soluto en 100 mL de solución', '5 g en 100 g de solvente', '5% de pureza'], correct: 1, exp: '% m/v indica gramos de soluto por cada 100 mL de solución. 5% m/v = 5 g en 100 mL.' },
      { q: '¿Cuántos mg/L equivale 1 ppm en solución acuosa diluida?', opts: ['0.001', '0.1', '1', '1000'], correct: 2, exp: 'En soluciones acuosas diluidas, 1 ppm equivale aproximadamente a 1 mg/L.' },
      { q: '¿Para qué tipo de sustancias se usa el % v/v?', opts: ['Sólido en líquido', 'Líquido en líquido', 'Gas en sólido', 'Sólido en sólido'], correct: 1, exp: 'El % v/v se usa cuando tanto el soluto como el solvente son líquidos, como en bebidas alcohólicas.' }
    ],
    'Concentración: Unidades Químicas': [
      { q: '¿Cuál es el peso equivalente del H₂SO₄ (PM=98)?', opts: ['98', '49', '32.67', '196'], correct: 1, exp: 'PE = PM / n° de H⁺ ionizables = 98 / 2 = 49 g/eq. El H₂SO₄ puede donar 2 protones.' },
      { q: '¿Cuál es la Normalidad de una solución de H₂SO₄ 0.5 M?', opts: ['0.25 N', '0.5 N', '1 N', '2 N'], correct: 2, exp: 'N = M × factor = 0.5 × 2 = 1 N. El factor es 2 porque el H₂SO₄ dona 2 H⁺.' },
      { q: '¿Qué ventaja tiene la molalidad sobre la molaridad?', opts: ['Es más fácil de calcular', 'No varía con la temperatura', 'Siempre es mayor', 'Se usa solo en gases'], correct: 1, exp: 'La molalidad depende de la masa del solvente (no del volumen), por lo que no cambia con la temperatura.' },
      { q: '¿Cuánto suman las fracciones molares de todos los componentes?', opts: ['0', '0.5', '1', 'Depende'], correct: 2, exp: 'La suma de todas las fracciones molares siempre es exactamente 1.' }
    ],
    'Parte Experimental: NaOH': [
      { q: '¿Cuántos gramos de NaOH se necesitan para 100 mL de solución 0.1 M?', opts: ['0.1 g', '0.4 g', '4 g', '40 g'], correct: 1, exp: 'masa = M × V × PM = 0.1 × 0.1 × 40 = 0.4 g de NaOH.' },
      { q: '¿Por qué se debe trabajar rápido al pesar NaOH?', opts: ['Se evapora', 'Es explosivo', 'Absorbe humedad del aire', 'Cambia de color'], correct: 2, exp: 'El NaOH es higroscópico: absorbe agua del aire, lo que altera el peso real y la concentración final.' },
      { q: '¿Por qué la disolución de NaOH en agua es peligrosa?', opts: ['Produce gases tóxicos', 'Es fuertemente exotérmica', 'Genera electricidad', 'Congela el agua'], correct: 1, exp: 'La disolución de NaOH es muy exotérmica (libera mucho calor). El recipiente se calienta significativamente.' }
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
    { id: 'sim-nox', title: 'Estado Oxidación', icon: '⚡', desc: 'Estados de oxidación.', tag: 'Redox', color: 'var(--emerald)' },
    { id: 'sim-disol', title: 'Calculadora de Disoluciones', icon: '🧫', desc: 'Calcula Molaridad, Normalidad y Molalidad con procedimiento paso a paso.', tag: 'Práctica 5', color: 'var(--orange)' },
    { id: 'sim-valor', title: 'Módulo de Valoraciones', icon: '⚗️', desc: 'Punto de equivalencia, acidez de leche (°D) y dureza del agua (ppm CaCO₃).', tag: 'Analítica', color: 'var(--rose)' },
    { id: 'sim-glosario', title: 'Glosario Técnico', icon: '📖', desc: 'Definiciones de ácidos, bases, pH, valoración y más conceptos clave.', tag: 'Referencia', color: 'var(--slate-600)' }
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
    description: 'Cátedra del Prof. Wilmer Molina. Desarrollado por Jimmy Bracho.',
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

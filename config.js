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
    simulations: { tag: 'Ejemplos', title: 'Ejemplos de Laboratorio', desc: 'Calculadoras y herramientas interactivas para experimentar con variables en tiempo real.' },
    labs: { tag: 'Guías', title: 'Guías de Laboratorio', desc: 'Protocolos paso a paso, normas de seguridad y formatos para prácticas de laboratorio.' },
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
    'Historia de la Química': [
      { t: 'Orígenes', c: '**Alquimia (siglos III-XVII):** Búsqueda de la piedra filosofal y el elixir de la vida. Aunque no era ciencia moderna, sentó bases experimentales.\n\n**Robert Boyle (1661):** Publicó "The Sceptical Chymist", separando la química de la alquimia. Definió elemento como sustancia que no puede descomponerse.\n\n**Antoine Lavoisier (1789):** Padre de la química moderna. Formuló la **Ley de Conservación de la Masa**: la materia no se crea ni se destruye, solo se transforma. Demostró el papel del oxígeno en la combustión.' },
      { t: 'Desarrollo moderno', c: '**Dmitri Mendeléyev (1869):** Organizó los elementos por masa atómica y predijo elementos desconocidos.\n\n**Marie Curie (1898):** Descubrió el polonio y el radio. Primera persona en ganar dos premios Nobel (Física y Química).\n\n**Linus Pauling (1954):** Pionero en enlace químico y bioquímica. Su escala de electronegatividad sigue vigente.' }
    ],
    'Tabla Periódica': [
      { t: 'Organización', c: '**Períodos:** Filas horizontales (1-7). Indican el número de niveles de energía.\n\n**Grupos:** Columnas verticales (1-18). Elementos del mismo grupo tienen propiedades químicas similares porque tienen la misma configuración de electrones de valencia.\n\n**Grupos principales:**\n- Grupo 1: Alcalinos (Li, Na, K...)\n- Grupo 2: Alcalinotérreos (Be, Mg, Ca...)\n- Grupos 3-12: Metales de transición\n- Grupo 17: Halógenos (F, Cl, Br...)\n- Grupo 18: Gases nobles (He, Ne, Ar...)' },
      { t: 'Propiedades periódicas', c: '**Radio atómico:** Aumenta hacia abajo y hacia la izquierda.\n\n**Energía de ionización:** Energía para arrancar un electrón. Aumenta hacia arriba y hacia la derecha.\n\n**Electronegatividad:** Capacidad de atraer electrones en un enlace. El flúor (F) es el más electronegativo (4.0). Aumenta hacia arriba y hacia la derecha.\n\n**Afinidad electrónica:** Energía liberada al ganar un electrón. Los halógenos tienen la mayor afinidad.' }
    ],
    'Formación de Compuestos': [
      { t: 'Tipos de compuestos', c: '**Compuestos iónicos:** Formados por transferencia de electrones entre un metal y un no metal. Ejemplo: NaCl (Na⁺ + Cl⁻).\n- Altos puntos de fusión\n- Conducen electricidad en solución\n- Cristales duros y frágiles\n\n**Compuestos covalentes:** Formados por compartición de electrones entre no metales. Ejemplo: H₂O, CO₂.\n- Puntos de fusión más bajos\n- No conducen electricidad\n- Pueden ser gases, líquidos o sólidos blandos\n\n**Compuestos metálicos:** Enlace entre átomos metálicos. Los electrones se deslocalizan formando un "mar de electrones".' }
    ],
    'Nomenclatura Inorgánica': [
      { t: 'Sistemas de nomenclatura', c: '**Nomenclatura sistemática (IUPAC):** Usa prefijos griegos para indicar la cantidad de átomos.\n- mono-, di-, tri-, tetra-, penta-, hexa-\n- Ejemplo: CO₂ = dióxido de carbono\n\n**Nomenclatura Stock:** Indica la valencia del metal en números romanos.\n- Ejemplo: FeCl₃ = cloruro de hierro(III)\n\n**Nomenclatura tradicional:** Usa sufijos -oso (menor valencia) e -ico (mayor valencia).\n- Ejemplo: FeCl₂ = cloruro ferroso, FeCl₃ = cloruro férrico\n\n**Regla general:** Metal + no metal → nombre del no metal con sufijo -uro + "de" + nombre del metal.' }
    ],
    'Propiedades de la Materia': [
      { t: 'Clasificación', c: '**Propiedades extensivas:** Dependen de la cantidad de materia. Ejemplos: masa, volumen, longitud.\n\n**Propiedades intensivas:** NO dependen de la cantidad. Ejemplos: densidad, punto de fusión, color, temperatura.\n\n**Propiedades físicas:** Se observan sin cambiar la composición. Ejemplos: color, densidad, punto de ebullición, solubilidad.\n\n**Propiedades químicas:** Implican un cambio en la composición. Ejemplos: inflamabilidad, reactividad con ácidos, oxidación.\n\n**Cambios de estado:** Sólido ↔ Líquido (fusión/solidificación), Líquido ↔ Gas (evaporación/condensación), Sólido ↔ Gas (sublimación/deposición).' }
    ],
    'Fundamentos y Concepto de Mol': [
      { t: 'El mol como unidad fundamental', c: '**Definición SI (2019):** Un mol contiene exactamente **6.02214076 × 10²³** entidades elementales (número de Avogadro, Nₐ). Esta definición es independiente de la masa del carbono-12.\n\n**Importancia:** El mol conecta el mundo macroscópico (gramos, litros) con el microscópico (átomos, moléculas). Sin esta unidad, sería imposible realizar cálculos estequiométricos.\n\n**Equivalencias fundamentales:**\n- 1 mol de átomos = Nₐ átomos = masa atómica en gramos\n- 1 mol de moléculas = Nₐ moléculas = masa molecular en gramos\n- 1 mol de iones = Nₐ iones\n- 1 mol de electrones = 96485 C (constante de Faraday)\n- 1 mol de gas ideal a CNPT (0°C, 1 atm) = **22.414 L** (volumen molar)' },
      { t: 'Masa molar y conversiones', c: '**Masa molar (M):** Masa de 1 mol de sustancia, en g/mol. Numéricamente igual a la masa atómica relativa (Ar) o masa molecular relativa (Mr).\n\n**Conversiones clave:**\n- Masa → Moles: **n = m / M**\n- Moles → Masa: **m = n × M**\n- Moles → Partículas: **N = n × Nₐ**\n- Partículas → Moles: **n = N / Nₐ**\n- Moles → Volumen gas (CNPT): **V = n × 22.4 L**\n\n**Ejemplo resuelto:** ¿Cuántas moléculas hay en 36 g de H₂O?\n- M(H₂O) = 2(1.008) + 16.00 = 18.016 g/mol\n- n = 36 / 18.016 = 1.998 mol\n- N = 1.998 × 6.022×10²³ = **1.203 × 10²⁴ moléculas**\n\n**Nota:** La masa molar de un elemento es la masa promedio ponderada de sus isótopos naturales.' }
    ],
    'Masa Molar y Leyes Ponderales': [
      { t: 'Cálculo de masa molar', c: '**Procedimiento:** Sumar las masas atómicas de todos los átomos en la fórmula.\n\n**Ejemplo: H₂SO₄**\n- H: 1.008 × 2 = 2.016\n- S: 32.07 × 1 = 32.07\n- O: 16.00 × 4 = 64.00\n- **M = 98.09 g/mol**\n\n**Leyes ponderales:**\n- **Ley de Lavoisier:** La masa total de los reactivos = masa total de los productos.\n- **Ley de Proust:** Un compuesto siempre tiene la misma proporción en masa de sus elementos.\n- **Ley de Dalton:** Cuando dos elementos forman más de un compuesto, las masas de uno que se combinan con una masa fija del otro están en relación de números enteros.' }
    ],
    'Balance de Reacciones': [
      { t: 'Métodos de balanceo', c: '**Método de tanteo:** Ajustar coeficientes uno por uno hasta igualar átomos de cada elemento.\n\n**Pasos:**\n- 1. Escribir la ecuación sin balancear\n- 2. Contar átomos de cada elemento\n- 3. Empezar por el elemento que aparece en menos compuestos\n- 4. Ajustar coeficientes (nunca subíndices)\n- 5. Verificar que todos los átomos estén balanceados\n\n**Ejemplo:**\nFe + O₂ → Fe₂O₃\n4Fe + 3O₂ → 2Fe₂O₃ ✅\n\n**Método algebraico:** Asignar variables (a, b, c...) como coeficientes, plantear ecuaciones por cada elemento y resolver.' }
    ],
    'Cálculos Básicos: Mol-Mol, Mol-Masa, Masa-Masa': [
      { t: 'Relaciones estequiométricas', c: '**Mol-Mol:** Usar directamente los coeficientes de la ecuación balanceada.\n- 2H₂ + O₂ → 2H₂O\n- 2 mol H₂ producen 2 mol H₂O\n\n**Mol-Masa:** Convertir moles a gramos usando la masa molar.\n- n = m / M\n- m = n × M\n\n**Masa-Masa:** Convertir masa de reactivo → moles → moles de producto → masa de producto.\n\n**Ejemplo:** ¿Cuántos gramos de H₂O se producen con 4 g de H₂?\n- n(H₂) = 4/2.016 = 1.984 mol\n- n(H₂O) = 1.984 mol (relación 1:1)\n- m(H₂O) = 1.984 × 18.015 = 35.73 g' }
    ],
    'Relación con Gases': [
      { t: 'Estequiometría de gases', c: '**Ley de Avogadro:** Volúmenes iguales de gases a las mismas condiciones contienen el mismo número de moléculas.\n\n**CNPT (Condiciones Normales):** T = 273.15 K (0°C), P = 1 atm.\n- 1 mol de gas ideal a CNPT = **22.4 L**\n\n**Ecuación del gas ideal:** PV = nRT\n- P = presión (atm)\n- V = volumen (L)\n- n = moles\n- R = 0.08206 L·atm/mol·K (NIST CODATA)\n- T = temperatura (K)\n\n**Ejemplo:** ¿Qué volumen ocupa 0.5 mol de O₂ a CNPT?\nV = 0.5 × 22.4 = **11.2 L**' }
    ],
    'Tipos de Reacciones Químicas': [
      { t: 'Clasificación', c: '**Síntesis (combinación):** A + B → AB\n- 2Na + Cl₂ → 2NaCl\n\n**Descomposición:** AB → A + B\n- 2H₂O → 2H₂ + O₂\n\n**Sustitución simple:** A + BC → AC + B\n- Zn + 2HCl → ZnCl₂ + H₂\n\n**Doble sustitución (metátesis):** AB + CD → AD + CB\n- NaCl + AgNO₃ → AgCl↓ + NaNO₃\n\n**Combustión:** Sustancia + O₂ → CO₂ + H₂O\n- CH₄ + 2O₂ → CO₂ + 2H₂O\n\n**Neutralización:** Ácido + Base → Sal + Agua\n- HCl + NaOH → NaCl + H₂O' }
    ],
    'Reactivo Limitante y en Exceso': [
      { t: 'Determinación del reactivo limitante', c: '**Definición formal:** En una reacción con cantidades no estequiométricas de reactivos, el **reactivo limitante** es el que se agota primero y determina la cantidad teórica máxima de producto. El **reactivo en exceso** es el que sobra parcialmente sin reaccionar.\n\n**Método del cociente molar:**\n- 1. Calcular n (moles) de cada reactivo: n = m/M\n- 2. Dividir n entre su coeficiente estequiométrico\n- 3. El **menor cociente** corresponde al reactivo limitante\n- 4. Usar los moles del limitante para calcular productos\n\n**Ejemplo detallado:**\nReacción: 2Al + 3Cl₂ → 2AlCl₃\nDatos: 10.0 g de Al (M=26.98) y 35.0 g de Cl₂ (M=70.90)\n\n- n(Al) = 10.0/26.98 = 0.3707 mol → 0.3707/2 = **0.1854**\n- n(Cl₂) = 35.0/70.90 = 0.4937 mol → 0.4937/3 = **0.1646** ← menor\n\n**Cl₂ es el reactivo limitante.**\n\n- mol AlCl₃ producido = 0.4937 × (2/3) = 0.3291 mol\n- m(AlCl₃) = 0.3291 × 133.34 = **43.88 g** (rendimiento teórico)\n\n**Exceso de Al:**\n- Al consumido = 0.4937 × (2/3) = 0.3291 mol = 8.88 g\n- Al sobrante = 10.0 - 8.88 = **1.12 g**' }
    ],
    'Rendimiento de Reacción': [
      { t: 'Rendimiento', c: '**Rendimiento teórico:** Cantidad máxima de producto según la estequiometría (100% eficiencia).\n\n**Rendimiento real:** Cantidad obtenida experimentalmente. Siempre es menor o igual al teórico.\n\n**% Rendimiento = (Real / Teórico) × 100**\n\n**Causas de bajo rendimiento:**\n- Reacciones incompletas\n- Reacciones secundarias\n- Pérdidas mecánicas en la manipulación\n- Impurezas en los reactivos\n\n**Ejemplo:** Si el rendimiento teórico de NaCl es 50 g y se obtienen 42 g:\n% Rendimiento = (42/50) × 100 = **84%**' }
    ],
    'Soluto, Solvente y Solución': [
      { t: 'Conceptos básicos', c: '**Soluto:** Componente en menor proporción. Se disuelve.\n\n**Solvente:** Componente en mayor proporción. Disuelve al soluto. El agua es el "solvente universal".\n\n**Solución:** Mezcla homogénea de soluto + solvente.\n\n**Tipos según concentración:**\n- **Diluida:** Poco soluto respecto al solvente\n- **Concentrada:** Mucho soluto\n- **Saturada:** Máxima cantidad de soluto a esa temperatura\n- **Sobresaturada:** Más soluto del que debería disolverse (inestable)\n\n**Factores que afectan la solubilidad:** Temperatura (↑T = ↑solubilidad para sólidos), presión (para gases), naturaleza del soluto y solvente.' }
    ],
    'Unidades Físicas de Concentración': [
      { t: 'Porcentajes', c: '**% masa/masa (%m/m):**\n%m/m = (masa soluto / masa solución) × 100\n\n**% masa/volumen (%m/v):**\n%m/v = (masa soluto en g / volumen solución en mL) × 100\n\n**% volumen/volumen (%v/v):**\n%v/v = (volumen soluto / volumen solución) × 100\n\n**Partes por millón (ppm):**\nppm = (masa soluto / masa solución) × 10⁶\nEn soluciones acuosas diluidas: 1 ppm ≈ 1 mg/L\n\n**Ejemplo:** 5 g de NaCl en 100 mL de solución:\n%m/v = (5/100) × 100 = **5% m/v**' }
    ],
    'Unidades Químicas de Concentración': [
      { t: 'Molaridad y Normalidad', c: '**Molaridad (M):** Moles de soluto por litro de solución.\n**M = n / V(L) = m / (M_molar × V)**\n\nLa molaridad depende de la temperatura porque el volumen cambia con T.\n\n**Normalidad (N):** Número de equivalentes-gramo por litro de solución.\n**N = M × f** donde f es el factor de equivalencia:\n- Para ácidos: f = número de H⁺ ionizables\n- Para bases: f = número de OH⁻ disociables\n- Para redox: f = número de electrones transferidos\n\n**Ejemplos:**\n- HCl (monoprótico): N = M × 1, entonces 0.5M = 0.5N\n- H₂SO₄ (diprótico): N = M × 2, entonces 0.5M = **1.0N**\n- H₃PO₄ (triprótico): N = M × 3, entonces 0.5M = 1.5N\n- Ca(OH)₂ (2 OH⁻): N = M × 2\n\n**Peso equivalente (PE):** PE = PM / f\n- PE(H₂SO₄) = 98/2 = **49 g/eq**\n- PE(NaOH) = 40/1 = 40 g/eq' },
      { t: 'Molalidad y Fracción molar', c: '**Molalidad (m):** Moles de soluto por kilogramo de **solvente** (no solución).\n**m = n_soluto / masa_solvente(kg)**\n\n**Ventaja fundamental:** No varía con la temperatura ni la presión, porque depende de masa (no volumen). Esencial en propiedades coligativas.\n\n**Fracción molar (X):**\n**X_i = n_i / Σn_total**\n- Σ X_i = 1 (la suma de todas las fracciones molares siempre es 1)\n- Es adimensional\n\n**Ejemplo completo:** Preparar solución de NaOH (PM=40):\n- 4 g NaOH en 500 mL de solución (densidad ≈ 1 g/mL)\n- n = 4/40 = 0.1 mol\n- **M = 0.1/0.5 = 0.2 M**\n- **N = 0.2 × 1 = 0.2 N** (NaOH tiene 1 OH⁻)\n- Masa solvente ≈ 500 - 4 = 496 g = 0.496 kg\n- **m = 0.1/0.496 = 0.2016 mol/kg**\n- n_agua = 496/18 = 27.56 mol\n- **X_NaOH = 0.1/(0.1+27.56) = 0.00362**\n\n**Relación M-m:** En soluciones diluidas acuosas, M ≈ m (porque 1L solución ≈ 1kg solvente).' }
    ],
    'Diluciones': [
      { t: 'Ley de dilución', c: '**Fórmula fundamental:** M₁V₁ = M₂V₂\n\nDonde:\n- M₁ = concentración inicial\n- V₁ = volumen inicial\n- M₂ = concentración final (siempre menor)\n- V₂ = volumen final (siempre mayor)\n\n**Procedimiento:**\n- 1. Medir V₁ de la solución concentrada\n- 2. Trasvasar a un matraz aforado de V₂\n- 3. Completar con solvente hasta el aforo\n- 4. Homogeneizar\n\n**Ejemplo:** Preparar 250 mL de HCl 0.1M a partir de HCl 1M:\nV₁ = (0.1 × 250) / 1 = **25 mL**\nTomar 25 mL de HCl 1M y aforar a 250 mL.' }
    ],
    'Parte Experimental: NaOH': [
      { t: 'Preparación de NaOH', c: '**Objetivo:** Preparar 100 mL de solución de NaOH 0.1 M.\n\n**Cálculo:** m = M × V × PM = 0.1 × 0.1 × 40 = **0.4 g de NaOH**\n\n**Procedimiento:**\n- 1. Pesar 0.4 g de NaOH en vidrio de reloj (trabajar rápido — es higroscópico)\n- 2. Disolver en ~50 mL de agua destilada en vaso de precipitados\n- 3. **⚠️ La reacción es exotérmica** — el vaso se calienta\n- 4. Dejar enfriar a temperatura ambiente\n- 5. Trasvasar al matraz aforado de 100 mL\n- 6. Aforar con agua destilada\n- 7. Tapar y homogeneizar invirtiendo 10 veces\n- 8. Etiquetar: NaOH 0.1M, fecha, autor' }
    ],
    'Reacción Ácido-Base': [
      { t: 'Fundamentos', c: '**Reacción de neutralización:** Ácido + Base → Sal + Agua\nHCl + NaOH → NaCl + H₂O\n\n**Teorías:**\n- **Arrhenius:** Ácido produce H⁺ en agua; base produce OH⁻\n- **Brønsted-Lowry:** Ácido dona protones; base acepta protones\n- **Lewis:** Ácido acepta par de electrones; base dona par de electrones\n\n**Pares conjugados:** Cuando un ácido dona un H⁺, se convierte en su base conjugada.\nHCl → H⁺ + Cl⁻ (Cl⁻ es la base conjugada de HCl)' }
    ],
    'Ácidos y Bases: Fuertes, Débiles y Arrhenius': [
      { t: 'Clasificación', c: '**Ácidos fuertes:** Se ionizan completamente en agua.\n- HCl, HNO₃, H₂SO₄, HClO₄, HBr, HI\n\n**Ácidos débiles:** Se ionizan parcialmente.\n- CH₃COOH (acético), H₂CO₃ (carbónico), HF\n\n**Bases fuertes:** Se disocian completamente.\n- NaOH, KOH, Ca(OH)₂, Ba(OH)₂\n\n**Bases débiles:** Se disocian parcialmente.\n- NH₃ (amoníaco), aminas\n\n**Constante de disociación:**\n- Ka (ácidos): Mayor Ka = ácido más fuerte\n- Kb (bases): Mayor Kb = base más fuerte\n- Ka × Kb = Kw = 1 × 10⁻¹⁴ a 25°C' }
    ],
    'pH y su Relación con Acidez y Basicidad': [
      { t: 'Fundamento termodinámico del pH', c: '**Definición rigurosa (IUPAC Gold Book P04524):** pH = −log₁₀(a_H⁺), donde a es la **actividad** del ion hidronio. En soluciones diluidas (< 0.1M), actividad ≈ concentración molar:\n**pH = −log[H⁺]**\n\n**Producto iónico del agua (Kw):**\n2H₂O ⇌ H₃O⁺ + OH⁻\n**Kw = [H⁺][OH⁻] = 1.0 × 10⁻¹⁴** a 25°C\n\nDe aquí: **pH + pOH = pKw = 14** (solo a 25°C)\n\n**⚠️ Kw depende de la temperatura:**\n- 0°C: Kw = 1.14×10⁻¹⁵, pH neutro = 7.47\n- 25°C: Kw = 1.01×10⁻¹⁴, pH neutro = 7.00\n- 37°C: Kw = 2.42×10⁻¹⁴, pH neutro = 6.81\n- 100°C: Kw = 5.13×10⁻¹³, pH neutro = 6.14' },
      { t: 'Cálculos de pH', c: '**Ácidos fuertes** (ionización completa):\nHCl 0.01M → [H⁺] = 0.01M → pH = −log(0.01) = **2.00**\n\n**Bases fuertes:**\nNaOH 0.001M → [OH⁻] = 0.001M → pOH = 3.00 → pH = **11.00**\n\n**Ácidos débiles** (requiere Ka):\nCH₃COOH 0.10M, Ka = 1.8×10⁻⁵\nKa = x²/(C₀−x) ≈ x²/C₀\nx = √(Ka × C₀) = √(1.8×10⁻⁶) = 1.34×10⁻³ M\npH = −log(1.34×10⁻³) = **2.87**\n\n**Soluciones buffer (Henderson-Hasselbalch):**\n**pH = pKa + log([A⁻]/[HA])**\n\n**Escala logarítmica:** Cada unidad de pH = factor de **10×** en [H⁺].' }
    ],
    'Valoración Ácido-Base': [
      { t: 'Técnica', c: '**Objetivo:** Determinar la concentración desconocida de un ácido o base.\n\n**Equipo:** Bureta, matraz Erlenmeyer, indicador, soporte.\n\n**Procedimiento:**\n- 1. Llenar la bureta con la solución de concentración conocida (titulante)\n- 2. Medir un volumen exacto del analito (solución desconocida) con pipeta\n- 3. Agregar 2-3 gotas de indicador\n- 4. Adicionar titulante gota a gota desde la bureta\n- 5. Agitar constantemente\n- 6. Observar el cambio de color del indicador\n- 7. Anotar el volumen gastado\n\n**Cálculo:** C_ácido × V_ácido = C_base × V_base' }
    ],
    'Curva de Valoración y Punto de Equivalencia': [
      { t: 'Interpretación', c: '**Curva de valoración:** Gráfica de pH vs. volumen de titulante agregado.\n\n**Punto de equivalencia:** Donde mol ácido = mol base.\n- Ácido fuerte + Base fuerte: pH = 7\n- Ácido débil + Base fuerte: pH > 7\n- Ácido fuerte + Base débil: pH < 7\n\n**Punto de inflexión:** El cambio más brusco de pH en la curva. Coincide con el punto de equivalencia.\n\n**Zona buffer:** Región antes del punto de equivalencia donde el pH cambia lentamente.' }
    ],
    'Indicadores y Zona de Viraje': [
      { t: 'Indicadores ácido-base', c: '**Indicador:** Sustancia que cambia de color según el pH del medio.\n\n**Zona de viraje:** Rango de pH donde ocurre el cambio de color.\n\n**Indicadores comunes:**\n- **Fenolftaleína:** Incolora (pH<8.2) → Rosa (pH>10). Zona: 8.2-10\n- **Anaranjado de metilo:** Rojo (pH<3.1) → Amarillo (pH>4.4). Zona: 3.1-4.4\n- **Azul de bromotimol:** Amarillo (pH<6.0) → Azul (pH>7.6)\n- **Tornasol:** Rojo en ácido, azul en base\n\n**Selección:** El indicador debe tener su zona de viraje cerca del punto de equivalencia de la titulación.' }
    ],
    'Aplicaciones: Acidez de Leche y Dureza del Agua': [
      { t: 'Aplicaciones prácticas', c: '**Acidez de la leche (°Dornic):**\nSe valora la leche con NaOH N/9 usando fenolftaleína.\n°D = mL de NaOH × 10\n- Leche fresca: 14-18 °D\n- Leche ácida: > 22 °D (no apta para consumo)\n\n**Dureza del agua (ppm CaCO₃):**\nSe valora el agua con EDTA usando indicador negro de eriocromo T.\n- Agua blanda: < 60 ppm\n- Moderadamente dura: 60-120 ppm\n- Dura: 120-180 ppm\n- Muy dura: > 180 ppm' }
    ],
    'Reglas IUPAC': [
      { t: 'Nomenclatura IUPAC', c: '**Principios:**\n- Usar prefijos griegos: mono, di, tri, tetra, penta, hexa, hepta, octa\n- El elemento más electronegativo va al final con sufijo -uro\n- Se omite "mono" en el primer elemento\n\n**Ejemplos:**\n- CO = monóxido de carbono\n- CO₂ = dióxido de carbono\n- N₂O₅ = pentaóxido de dinitrógeno\n- PCl₃ = tricloruro de fósforo\n- SF₆ = hexafluoruro de azufre' }
    ],
    'Óxidos y Anhídridos': [
      { t: 'Óxidos', c: '**Óxidos básicos (metálicos):** Metal + O₂\n- 4Na + O₂ → 2Na₂O (óxido de sodio)\n- 2Ca + O₂ → 2CaO (óxido de calcio)\n- Al reaccionar con agua forman bases: Na₂O + H₂O → 2NaOH\n\n**Óxidos ácidos (anhídridos):** No metal + O₂\n- C + O₂ → CO₂ (dióxido de carbono)\n- S + O₂ → SO₂ (dióxido de azufre)\n- Al reaccionar con agua forman ácidos: SO₃ + H₂O → H₂SO₄\n\n**Óxidos anfóteros:** Se comportan como ácido o base según el medio. Ejemplos: Al₂O₃, ZnO, PbO.' }
    ],
    'Ácidos e Hidróxidos': [
      { t: 'Formación', c: '**Hidrácidos:** H + No metal (sin oxígeno)\n- HCl = ácido clorhídrico\n- HBr = ácido bromhídrico\n- H₂S = ácido sulfhídrico\n\n**Oxoácidos:** Anhídrido + H₂O\n- SO₃ + H₂O → H₂SO₄ (ácido sulfúrico)\n- N₂O₅ + H₂O → 2HNO₃ (ácido nítrico)\n- CO₂ + H₂O → H₂CO₃ (ácido carbónico)\n\n**Hidróxidos (bases):** Óxido básico + H₂O\n- Na₂O + H₂O → 2NaOH (hidróxido de sodio)\n- CaO + H₂O → Ca(OH)₂ (hidróxido de calcio)\n\n**Nomenclatura:** hidróxido de + nombre del metal.' }
    ],
    'Sales y Nomenclatura Stock': [
      { t: 'Sales', c: '**Formación:** Ácido + Base → Sal + Agua\n- HCl + NaOH → NaCl + H₂O (cloruro de sodio)\n- H₂SO₄ + 2KOH → K₂SO₄ + 2H₂O (sulfato de potasio)\n\n**Nomenclatura Stock:** nombre del anión + "de" + metal(valencia en romanos)\n- FeCl₂ = cloruro de hierro(II)\n- FeCl₃ = cloruro de hierro(III)\n- Cu₂O = óxido de cobre(I)\n- CuO = óxido de cobre(II)\n\n**Aniones comunes:**\n- Cl⁻ = cloruro | SO₄²⁻ = sulfato\n- NO₃⁻ = nitrato | CO₃²⁻ = carbonato\n- PO₄³⁻ = fosfato | OH⁻ = hidróxido' }
    ],
    'Materiales de Laboratorio': [
      { t: 'Material de vidrio', c: '**Vaso de precipitado (Beaker):** Recipiente cilíndrico con pico vertedor. Se usa para calentar líquidos, preparar mezclas y reacciones. No es volumétrico — su escala es aproximada (±5%). Material: vidrio borosilicatado (Pyrex/Duran), resistente a choque térmico. Norma ISO 3819.\n\n**Matraz Erlenmeyer:** Recipiente cónico con cuello estrecho. Ideal para titulaciones porque evita salpicaduras al agitar.\n\n**Matraz aforado:** Recipiente de fondo plano con cuello largo y una marca de aforo. Se usa exclusivamente para preparar soluciones de concentración exacta. **Precisión:** ±0.1 mL en matraces de 100 mL. Norma ISO 1042.\n\n**Probeta graduada:** Cilindro con escala grabada para medir volúmenes. Se lee al nivel del **menisco inferior**.\n\n**Bureta:** Tubo graduado con llave en la parte inferior. Es el instrumento más preciso para dispensar volúmenes variables. Precisión: ±0.05 mL.\n\n**Pipeta volumétrica:** Mide un volumen fijo con alta precisión. Se usa con **propipeta** (nunca succionar con la boca).' },
      { t: 'Otros materiales esenciales', c: '**Balanza analítica:** Precisión de ±0.0001 g (0.1 mg). Reglas de uso:\n- Verificar que esté nivelada (burbuja centrada)\n- **Tarar** antes de cada pesada\n- Nunca colocar reactivos directamente — usar vidrio de reloj o papel\n- Evitar corrientes de aire al pesar\n\n**Mechero Bunsen:** Fuente de calor con llama regulable. La llama azul (oxidante) es la más caliente (~1500°C). La llama amarilla indica combustión incompleta. **⚠️ Verificar que no haya solventes inflamables cerca antes de encender.**\n\n**Soporte universal, aro y rejilla:** Sistema de sujeción para calentar recipientes. La rejilla con centro de asbesto distribuye el calor uniformemente.' }
    ],
    'Técnicas de Medición': [
      { t: 'Lectura del menisco', c: 'Al medir volúmenes en recipientes de vidrio, el líquido forma una curvatura llamada **menisco** debido a la tensión superficial.\n\n**Regla fundamental:** La lectura siempre se toma en la parte inferior del menisco, con los ojos al nivel del líquido (posición perpendicular). Leer por encima causa **error de paralaje** — el volumen parece mayor de lo real.\n\n**Tipos de menisco:**\n- **Cóncavo** (curvatura hacia abajo): Ocurre con agua y la mayoría de solventes polares en vidrio. Se lee en la parte más baja.\n- **Convexo** (curvatura hacia arriba): Ocurre con mercurio en vidrio. Se lee en la parte más alta.' },
      { t: 'Aforar y enrasar', c: '**Aforar:** Llenar un matraz aforado exactamente hasta la marca de aforo con el solvente (generalmente agua destilada). El menisco inferior debe tocar la línea. Si se sobrepasa, la solución debe descartarse.\n\n**Enrasar:** Ajustar el nivel de líquido en una bureta o pipeta hasta que coincida exactamente con la marca cero o la marca deseada.\n\n**Curar (ambientar):** Enjuagar el instrumento con pequeñas porciones del mismo líquido que se va a medir. Se realiza 2-3 veces antes de usar.\n\n**Procedimiento para aforar:**\n- 1. Agregar solvente hasta ~1 cm debajo de la marca\n- 2. Usar una pipeta Pasteur o piseta para agregar gota a gota\n- 3. Verificar que el menisco inferior toque la marca\n- 4. Tapar y homogeneizar invirtiendo el matraz 10 veces' }
    ],
    'Normas de Seguridad': [
      { t: 'Reglas fundamentales', c: '**⚠️ Equipo de protección personal (EPP) obligatorio:**\n- Bata de laboratorio (manga larga, algodón)\n- Lentes de seguridad (no gafas de sol)\n- Guantes de nitrilo (para ácidos/bases)\n- Calzado cerrado (no sandalias)\n- Cabello recogido\n\n**⚠️ Manejo de reactivos:**\n- Nunca probar ni oler directamente un reactivo\n- Para oler: abanicar los vapores hacia la nariz con la mano\n- Los ácidos concentrados se manipulan SIEMPRE en campana de extracción\n- Al diluir ácido: **agregar ÁCIDO sobre AGUA** (nunca al revés — la reacción es muy exotérmica)\n- Etiquetar toda solución preparada: nombre, concentración, fecha, autor\n\n**⚠️ En caso de accidente:**\n- Derrame de ácido: neutralizar con bicarbonato de sodio\n- Derrame de base: neutralizar con ácido acético diluido\n- Quemadura: lavar con agua fría abundante durante 15 minutos\n- Contacto con ojos: usar lavaojos durante 15 minutos mínimo' }
    ],
    'Separación de Mezclas': [
      { t: 'Métodos de separación', c: 'Los métodos de separación se basan en las **diferencias de propiedades físicas** entre los componentes de una mezcla.\n\n**Filtración:** Separa un sólido insoluble de un líquido usando un medio poroso (papel de filtro). El sólido queda retenido (**residuo**) y el líquido pasa (**filtrado**).\n\n**Decantación:** Separa líquidos inmiscibles o un sólido sedimentado de un líquido. Se usa el embudo de separación.\n\n**Evaporación:** Elimina el solvente aplicando calor, dejando el soluto sólido.\n\n**Destilación:** Separa líquidos miscibles con diferentes puntos de ebullición.\n\n**Cristalización:** Se disuelve el sólido en caliente hasta saturación, luego se enfría lentamente. El soluto forma cristales puros al precipitar.\n\n**Cromatografía:** Separa componentes basándose en su diferente afinidad por una fase estacionaria y una fase móvil.' }
    ],
    'Cálculos de Recuperación': [
      { t: 'Fórmulas de cálculo', c: '**Porcentaje de recuperación de arena:**\n% Arena = (Mₐ / Mₘ) × 100\n\n**Porcentaje de recuperación de sal:**\n% Sal = (Mₛ / Mₘ) × 100\n\n**Porcentaje de eficiencia global:**\n% Eficiencia = ((Mₐ + Mₛ) / Mₘ) × 100\n\nUna eficiencia del **95-100%** indica un procedimiento bien ejecutado.\n\n**Ejemplo resuelto:**\nMezcla inicial: 10.000 g\nArena recuperada: 6.245 g\nSal recuperada: 3.510 g\n\n% Arena = (6.245 / 10.000) × 100 = **62.45%**\n% Sal = (3.510 / 10.000) × 100 = **35.10%**\n% Eficiencia = ((6.245 + 3.510) / 10.000) × 100 = **97.55%**\n% Pérdida = 100 - 97.55 = **2.45%** (aceptable)' }
    ],
    'Modelos Atómicos': [
      { t: 'Fundamentos', c: '**Demócrito (~400 a.C.):** Propuso el concepto de átomo (indivisible), sin base experimental.\n\n**Dalton (1803):** Primer modelo científico. Átomos como esferas sólidas e indivisibles. Explicó las leyes ponderales.\n\n**Thomson (1897):** Descubrió el electrón mediante tubos de rayos catódicos (e/m = 1.76×10⁸ C/g). Modelo del "budín de pasas".\n\n**Rutherford (1911):** Experimento de la lámina de oro con partículas α. Demostró que el átomo tiene un **núcleo** (~10⁻¹⁵ m) denso y positivo. El átomo es mayormente espacio vacío (~10⁻¹⁰ m).\n\n**Millikan (1909):** Midió la carga del electrón: e = 1.602×10⁻¹⁹ C.' },
      { t: 'Modelo de Bohr (1913)', c: '**Postulados:**\n- 1. Electrones en órbitas circulares estacionarias sin emitir radiación\n- 2. Solo órbitas donde L = nℏ están permitidas (n = 1, 2, 3...)\n- 3. Emisión/absorción de fotón al transitar: **ΔE = hν**\n\n**Energía de los niveles (átomo de H):**\n**Eₙ = −13.6/n² eV**\n\n**Radio de las órbitas:**\n**rₙ = 0.529 × n² Å**\n\n**Series espectrales del H:**\n- Lyman (n→1): ultravioleta\n- Balmer (n→2): visible\n- Paschen (n→3): infrarrojo\n\n**Limitación:** Falló para átomos multielectrónicos.' },
      { t: 'Modelo Cuántico Actual', c: '**De Broglie (1924):** Dualidad onda-partícula: **λ = h/(mv)**\n\n**Heisenberg (1927):** Principio de incertidumbre: **Δx·Δp ≥ ℏ/2**\n\n**Schrödinger (1926):** Ecuación de onda **Ĥψ = Eψ**. |ψ|² = densidad de probabilidad.\n\n**Orbital:** Región donde |ψ|² ≥ 90%. 4 números cuánticos:\n- **n** (principal): 1,2,3... Energía y tamaño\n- **l** (azimutal): 0 a n−1. Forma: s(0), p(1), d(2), f(3)\n- **mₗ** (magnético): −l a +l. Orientación\n- **mₛ** (espín): +½ o −½\n\n**Principio de exclusión de Pauli:** Máximo 2 e⁻ por orbital con espines opuestos.\n\n**Regla de Hund:** En orbitales degenerados, los e⁻ se distribuyen individualmente antes de emparejarse.\n\n**Aufbau:** Llenado en orden creciente de energía: 1s→2s→2p→3s→3p→4s→3d→4p...' }
    ]
  },
  quizData: {
    'Historia de la Química': [
      { q: '¿Quién es considerado el padre de la química moderna?', opts: ['Dalton', 'Lavoisier', 'Boyle', 'Mendeléyev'], correct: 1, exp: 'Lavoisier formuló la Ley de Conservación de la Masa y demostró el papel del oxígeno en la combustión.' }
    ],
    'Modelos Atómicos': [
      { q: '¿Qué modelo atómico propuso la existencia de un núcleo?', opts: ['Dalton', 'Thomson', 'Rutherford', 'Bohr'], correct: 2, exp: 'Rutherford demostró con el experimento de la lámina de oro que el átomo tiene un núcleo denso y positivo.' },
      { q: '¿Qué descubrió Thomson?', opts: ['El protón', 'El electrón', 'El neutrón', 'El núcleo'], correct: 1, exp: 'Thomson descubrió el electrón en 1897 (e/m = 1.76×10⁸ C/g).' },
      { q: '¿Qué modelo describe electrones mediante orbitales?', opts: ['Dalton', 'Bohr', 'Mecánico-cuántico', 'Rutherford'], correct: 2, exp: 'El modelo mecánico-cuántico (Schrödinger) usa funciones de onda ψ para describir orbitales.' }
    ],
    'Tabla Periódica': [
      { q: '¿Qué indica el número de período?', opts: ['Electrones de valencia', 'Niveles de energía', 'Número atómico', 'Masa atómica'], correct: 1, exp: 'El período indica cuántos niveles de energía tiene el átomo.' },
      { q: '¿Cuál es el elemento más electronegativo?', opts: ['Oxígeno', 'Cloro', 'Flúor', 'Nitrógeno'], correct: 2, exp: 'El flúor (F) tiene χ = 4.0 en la escala de Pauling.' }
    ],
    'Fundamentos y Concepto de Mol': [
      { q: '¿Cuántas entidades hay en 1 mol?', opts: ['6.022×10²⁰', '6.022×10²³', '3.011×10²³', '1.602×10¹⁹'], correct: 1, exp: 'Número de Avogadro Nₐ = 6.02214076×10²³ (BIPM SI 2019, valor exacto).' },
      { q: '¿Qué volumen ocupa 1 mol de gas ideal a CNPT?', opts: ['11.2 L', '22.4 L', '44.8 L', '1.0 L'], correct: 1, exp: 'A 0°C y 1 atm, el volumen molar es 22.414 L/mol.' }
    ],
    'Balance de Reacciones': [
      { q: 'Al balancear una ecuación, ¿qué NUNCA se modifica?', opts: ['Coeficientes', 'Subíndices', 'Productos', 'Orden'], correct: 1, exp: 'Modificar subíndices cambiaría la identidad de las sustancias. Solo se ajustan coeficientes.' }
    ],
    'Reactivo Limitante y en Exceso': [
      { q: '¿Qué determina el reactivo limitante?', opts: ['La velocidad', 'La cantidad máxima de producto', 'El color', 'La temperatura'], correct: 1, exp: 'El reactivo limitante se agota primero y fija la cantidad teórica máxima de producto.' }
    ],
    'Rendimiento de Reacción': [
      { q: 'Si el rendimiento teórico es 50 g y se obtienen 40 g, ¿% rendimiento?', opts: ['125%', '80%', '90%', '40%'], correct: 1, exp: '%Rendimiento = (40/50)×100 = 80%.' }
    ],
    'Unidades Físicas de Concentración': [
      { q: '¿Qué significa 5% m/v?', opts: ['5 mL en 100 g', '5 g en 100 mL de solución', '5 g en 100 g de solvente', '5 mol en 100 L'], correct: 1, exp: '%m/v indica gramos de soluto por cada 100 mL de solución.' }
    ],
    'Unidades Químicas de Concentración': [
      { q: '¿Cuál es la Normalidad de H₂SO₄ 0.5 M?', opts: ['0.25 N', '0.5 N', '1.0 N', '2.0 N'], correct: 2, exp: 'N = M × factor. H₂SO₄ tiene factor 2 (dona 2 H⁺), entonces N = 0.5×2 = 1.0 N.' },
      { q: '¿Ventaja de la molalidad sobre la molaridad?', opts: ['Es más fácil', 'No varía con la temperatura', 'Siempre es mayor', 'Solo se usa para gases'], correct: 1, exp: 'La molalidad depende de la masa del solvente (no del volumen), no cambia con T.' }
    ],
    'pH y su Relación con Acidez y Basicidad': [
      { q: 'Si [H⁺] = 10⁻³ M, ¿cuál es el pH?', opts: ['1', '3', '11', '7'], correct: 1, exp: 'pH = −log(10⁻³) = 3. Es una solución ácida.' },
      { q: '¿Cuánto suman pH + pOH a 25°C?', opts: ['7', '10', '14', '1'], correct: 2, exp: 'A 25°C, Kw = 10⁻¹⁴, por lo que pH + pOH = pKw = 14.' }
    ],
    'Indicadores y Zona de Viraje': [
      { q: '¿En qué rango de pH cambia la fenolftaleína?', opts: ['0-2', '3.1-4.4', '8.2-10', '12-14'], correct: 2, exp: 'La fenolftaleína es incolora por debajo de pH 8.2 y rosa por encima de pH 10.' }
    ],
    'Separación de Mezclas': [
      { q: '¿Qué método separa líquidos inmiscibles?', opts: ['Filtración', 'Decantación', 'Evaporación', 'Cristalización'], correct: 1, exp: 'La decantación con embudo de separación aprovecha la diferencia de densidad.' }
    ],
    'Normas de Seguridad': [
      { q: 'Al diluir ácido, ¿qué se agrega sobre qué?', opts: ['Agua sobre ácido', 'Ácido sobre agua', 'Da igual', 'Solo si es fuerte'], correct: 1, exp: 'Siempre ÁCIDO sobre AGUA. Al revés la reacción de hidratación es violentamente exotérmica.' }
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
    { id: 'sim-disol', title: 'Calculadora de Concentración', icon: '🧫', desc: 'Calcula Molaridad, Normalidad y Molalidad con procedimiento paso a paso.', tag: 'Disoluciones', color: 'var(--orange)' },
    { id: 'sim-valor', title: 'Valoración Ácido-Base', icon: '⚗️', desc: 'Punto de equivalencia, acidez de leche (°D) y dureza del agua (ppm CaCO₃).', tag: 'Valoración', color: 'var(--rose)' },
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
        { n: 3, p: 'Disolver el sólido en un vaso de precipitados con aprox. 50mL de agua.' },
        { n: 4, p: 'Trasvasar cuantitativamente al matraz aforado.' },
        { n: 5, p: 'Aforar hasta la marca del menisco y homogeneizar.' }
      ],
      obs: 'La disolución de algunos sólidos puede ser exotérmica o endotérmica. Anotar cambios de temperatura.',
      questions: ['¿Por qué no se debe pesar directamente en el matraz?', '¿Qué error se introduce si se sobrepasa el aforo?']
    },
    'lab-1': {
      safety: ['Usar guantes al manipular tiosulfato.', 'No calentar directamente con mechero — usar baño de María.', 'Trabajar en área ventilada.'],
      materials: ['Na₂S₂O₃ 0.1M', 'HCl 1M', 'Cronómetro', 'Termómetro', 'Vasos de precipitado 250mL', 'Probeta 50mL', 'Baño de María'],
      procedure: [
        { n: 1, p: 'Preparar 5 tubos con 10 mL de Na₂S₂O₃ 0.1M cada uno.' },
        { n: 2, p: 'Calentar cada tubo a diferente temperatura: 20°C, 30°C, 40°C, 50°C, 60°C.' },
        { n: 3, p: 'Agregar 5 mL de HCl 1M a cada tubo e iniciar cronómetro.' },
        { n: 4, p: 'Medir el tiempo hasta que aparezca turbidez (precipitado de azufre).' },
        { n: 5, p: 'Registrar tiempo vs temperatura. Graficar.' }
      ],
      obs: 'Se espera que al aumentar la temperatura, el tiempo de reacción disminuya (mayor velocidad).',
      questions: ['¿Cómo afecta la temperatura a la velocidad de reacción?', '¿Qué relación tiene esto con la energía de activación?']
    },
    'lab-2': {
      safety: ['KMnO₄ mancha la piel — usar guantes.', 'H₂SO₄ concentrado se manipula en campana.', 'Lavar inmediatamente cualquier derrame con abundante agua.'],
      materials: ['Bureta 50mL', 'KMnO₄ 0.02M', 'Sal de Mohr (FeSO₄)', 'H₂SO₄ 1M', 'Matraz Erlenmeyer 250mL', 'Pipeta volumétrica 25mL'],
      procedure: [
        { n: 1, p: 'Pesar exactamente la muestra de sal de Mohr y disolverla en 50 mL de agua.' },
        { n: 2, p: 'Agregar 10 mL de H₂SO₄ 1M para acidificar.' },
        { n: 3, p: 'Llenar la bureta con KMnO₄ 0.02M y enrasar.' },
        { n: 4, p: 'Titular agregando KMnO₄ gota a gota hasta que persista el color rosa por 30 segundos.' },
        { n: 5, p: 'Anotar el volumen gastado. Calcular el % de hierro en la muestra.' }
      ],
      obs: 'El KMnO₄ actúa como autoindicador — el punto final se detecta cuando la solución adquiere color rosa permanente.',
      questions: ['¿Por qué el KMnO₄ no necesita indicador externo?', '¿Qué sucedería si no se acidifica la solución?']
    }
  },
  elements: [
    {z:1,sym:'H',name:'Hidrógeno',mass:1.008,cat:'nonmetal',row:1,col:1,config:'1s¹'},{z:2,sym:'He',name:'Helio',mass:4.003,cat:'noble',row:1,col:18,config:'1s²'},{z:3,sym:'Li',name:'Litio',mass:6.941,cat:'alkali',row:2,col:1,config:'[He] 2s¹'},{z:4,sym:'Be',name:'Berilio',mass:9.012,cat:'alkaline',row:2,col:2,config:'[He] 2s²'},{z:5,sym:'B',name:'Boro',mass:10.81,cat:'metalloid',row:2,col:13},{z:6,sym:'C',name:'Carbono',mass:12.01,cat:'nonmetal',row:2,col:14},{z:7,sym:'N',name:'Nitrógeno',mass:14.01,cat:'nonmetal',row:2,col:15},{z:8,sym:'O',name:'Oxígeno',mass:16.00,cat:'nonmetal',row:2,col:16},{z:9,sym:'F',name:'Flúor',mass:19.00,cat:'halogen',row:2,col:17},{z:10,sym:'Ne',name:'Neón',mass:20.18,cat:'noble',row:2,col:18},{z:11,sym:'Na',name:'Sodio',mass:22.99,cat:'alkali',row:3,col:1,config:'[Ne] 3s¹'},{z:12,sym:'Mg',name:'Magnesio',mass:24.31,cat:'alkaline',row:3,col:2,config:'[Ne] 3s²'},{z:13,sym:'Al',name:'Aluminio',mass:26.98,cat:'post-trans',row:3,col:13},{z:14,sym:'Si',name:'Silicio',mass:28.09,cat:'metalloid',row:3,col:14},{z:15,sym:'P',name:'Fósforo',mass:30.97,cat:'nonmetal',row:3,col:15},{z:16,sym:'S',name:'Azufre',mass:32.07,cat:'nonmetal',row:3,col:16},{z:17,sym:'Cl',name:'Cloro',mass:35.45,cat:'halogen',row:3,col:17},{z:18,sym:'Ar',name:'Argón',mass:39.95,cat:'noble',row:3,col:18},{z:19,sym:'K',name:'Potasio',mass:39.10,cat:'alkali',row:4,col:1},{z:20,sym:'Ca',name:'Calcio',mass:40.08,cat:'alkaline',row:4,col:2},{z:21,sym:'Sc',name:'Escandio',mass:44.96,cat:'transition',row:4,col:3},{z:22,sym:'Ti',name:'Titanio',mass:47.87,cat:'transition',row:4,col:4},{z:23,sym:'V',name:'Vanadio',mass:50.94,cat:'transition',row:4,col:5},{z:24,sym:'Cr',name:'Cromo',mass:52.00,cat:'transition',row:4,col:6},{z:25,sym:'Mn',name:'Manganeso',mass:54.94,cat:'transition',row:4,col:7},{z:26,sym:'Fe',name:'Hierro',mass:55.85,cat:'transition',row:4,col:8},{z:27,sym:'Co',name:'Cobalto',mass:58.93,cat:'transition',row:4,col:9},{z:28,sym:'Ni',name:'Níquel',mass:58.69,cat:'transition',row:4,col:10},{z:29,sym:'Cu',name:'Cobre',mass:63.55,cat:'transition',row:4,col:11},{z:30,sym:'Zn',name:'Zinc',mass:65.38,cat:'transition',row:4,col:12},{z:31,sym:'Ga',name:'Galio',mass:69.72,cat:'post-trans',row:4,col:13},{z:32,sym:'Ge',name:'Germanio',mass:72.63,cat:'metalloid',row:4,col:14},{z:33,sym:'As',name:'Arsénico',mass:74.92,cat:'metalloid',row:4,col:15},{z:34,sym:'Se',name:'Selenio',mass:78.97,cat:'nonmetal',row:4,col:16},{z:35,sym:'Br',name:'Bromo',mass:79.90,cat:'halogen',row:4,col:17},{z:36,sym:'Kr',name:'Criptón',mass:83.80,cat:'noble',row:4,col:18},{z:37,sym:'Rb',name:'Rubidio',mass:85.47,cat:'alkali',row:5,col:1},{z:38,sym:'Sr',name:'Estroncio',mass:87.62,cat:'alkaline',row:5,col:2},{z:39,sym:'Y',name:'Itrio',mass:88.91,cat:'transition',row:5,col:3},{z:40,sym:'Zr',name:'Zirconio',mass:91.22,cat:'transition',row:5,col:4},{z:41,sym:'Nb',name:'Niobio',mass:92.91,cat:'transition',row:5,col:5},{z:42,sym:'Mo',name:'Molibdeno',mass:95.95,cat:'transition',row:5,col:6},{z:43,sym:'Tc',name:'Tecnecio',mass:98,cat:'transition',row:5,col:7},{z:44,sym:'Ru',name:'Rutenio',mass:101.07,cat:'transition',row:5,col:8},{z:45,sym:'Rh',name:'Rodio',mass:102.91,cat:'transition',row:5,col:9},{z:46,sym:'Pd',name:'Paladio',mass:106.42,cat:'transition',row:5,col:10},{z:47,sym:'Ag',name:'Plata',mass:107.87,cat:'transition',row:5,col:11},{z:48,sym:'Cd',name:'Cadmio',mass:112.41,cat:'transition',row:5,col:12},{z:49,sym:'In',name:'Indio',mass:114.82,cat:'post-trans',row:5,col:13},{z:50,sym:'Sn',name:'Estaño',mass:118.71,cat:'post-trans',row:5,col:14},{z:51,sym:'Sb',name:'Antimonio',mass:121.76,cat:'metalloid',row:5,col:15},{z:52,sym:'Te',name:'Telurio',mass:127.60,cat:'metalloid',row:5,col:16},{z:53,sym:'I',name:'Yodo',mass:126.90,cat:'halogen',row:5,col:17},{z:54,sym:'Xe',name:'Xenón',mass:131.29,cat:'noble',row:5,col:18},{z:55,sym:'Cs',name:'Cesio',mass:132.91,cat:'alkali',row:6,col:1},{z:56,sym:'Ba',name:'Bario',mass:137.33,cat:'alkaline',row:6,col:2},{z:57,sym:'La',name:'Lantano',mass:138.91,cat:'lanthanide',row:9,col:3},{z:58,sym:'Ce',name:'Cerio',mass:140.12,cat:'lanthanide',row:9,col:4},{z:59,sym:'Pr',name:'Praseodimio',mass:140.91,cat:'lanthanide',row:9,col:5},{z:60,sym:'Nd',name:'Neodimio',mass:144.24,cat:'lanthanide',row:9,col:6},{z:61,sym:'Pm',name:'Prometio',mass:145,cat:'lanthanide',row:9,col:7},{z:62,sym:'Sm',name:'Samario',mass:150.36,cat:'lanthanide',row:9,col:8},{z:63,sym:'Eu',name:'Europio',mass:151.96,cat:'lanthanide',row:9,col:9},{z:64,sym:'Gd',name:'Gadolinio',mass:157.25,cat:'lanthanide',row:9,col:10},{z:65,sym:'Tb',name:'Terbio',mass:158.93,cat:'lanthanide',row:9,col:11},{z:66,sym:'Dy',name:'Disprosio',mass:162.50,cat:'lanthanide',row:9,col:12},{z:67,sym:'Ho',name:'Holmio',mass:164.93,cat:'lanthanide',row:9,col:13},{z:68,sym:'Er',name:'Erbio',mass:167.26,cat:'lanthanide',row:9,col:14},{z:69,sym:'Tm',name:'Tulio',mass:168.93,cat:'lanthanide',row:9,col:15},{z:70,sym:'Yb',name:'Iterbio',mass:173.05,cat:'lanthanide',row:9,col:16},{z:71,sym:'Lu',name:'Lutecio',mass:174.97,cat:'lanthanide',row:9,col:17},{z:72,sym:'Hf',name:'Hafnio',mass:178.49,cat:'transition',row:6,col:4},{z:73,sym:'Ta',name:'Tantalio',mass:180.95,cat:'transition',row:6,col:5},{z:74,sym:'W',name:'Tungsteno',mass:183.84,cat:'transition',row:6,col:6},{z:75,sym:'Re',name:'Renio',mass:186.21,cat:'transition',row:6,col:7},{z:76,sym:'Os',name:'Osmio',mass:190.23,cat:'transition',row:6,col:8},{z:77,sym:'Ir',name:'Iridio',mass:192.22,cat:'transition',row:6,col:9},{z:78,sym:'Pt',name:'Platino',mass:195.08,cat:'transition',row:6,col:10},{z:79,sym:'Au',name:'Oro',mass:196.97,cat:'transition',row:6,col:11},{z:80,sym:'Hg',name:'Mercurio',mass:200.59,cat:'transition',row:6,col:12},{z:81,sym:'Tl',name:'Talio',mass:204.38,cat:'post-trans',row:6,col:13},{z:82,sym:'Pb',name:'Plomo',mass:207.2,cat:'post-trans',row:6,col:14},{z:83,sym:'Bi',name:'Bismuto',mass:208.98,cat:'post-trans',row:6,col:15},{z:84,sym:'Po',name:'Polonio',mass:209,cat:'post-trans',row:6,col:16},{z:85,sym:'At',name:'Astato',mass:210,cat:'halogen',row:6,col:17},{z:86,sym:'Rn',name:'Radón',mass:222,cat:'noble',row:6,col:18},{z:87,sym:'Fr',name:'Francio',mass:223,cat:'alkali',row:7,col:1},{z:88,sym:'Ra',name:'Radio',mass:226,cat:'alkaline',row:7,col:2},{z:89,sym:'Ac',name:'Actinio',mass:227,cat:'actinide',row:10,col:3},{z:90,sym:'Th',name:'Torio',mass:232.04,cat:'actinide',row:10,col:4},{z:91,sym:'Pa',name:'Protactinio',mass:231.04,cat:'actinide',row:10,col:5},{z:92,sym:'U',name:'Uranio',mass:238.03,cat:'actinide',row:10,col:6},{z:93,sym:'Np',name:'Neptunio',mass:237,cat:'actinide',row:10,col:7},{z:94,sym:'Pu',name:'Plutonio',mass:244,cat:'actinide',row:10,col:8},{z:95,sym:'Am',name:'Americio',mass:243,cat:'actinide',row:10,col:9},{z:96,sym:'Cm',name:'Curio',mass:247,cat:'actinide',row:10,col:10},{z:97,sym:'Bk',name:'Berkelio',mass:247,cat:'actinide',row:10,col:11},{z:98,sym:'Cf',name:'Californio',mass:251,cat:'actinide',row:10,col:12},{z:99,sym:'Es',name:'Einsteinio',mass:252,cat:'actinide',row:10,col:13},{z:100,sym:'Fm',name:'Fermio',mass:257,cat:'actinide',row:10,col:14},{z:101,sym:'Md',name:'Mendelevio',mass:258,cat:'actinide',row:10,col:15},{z:102,sym:'No',name:'Nobelio',mass:259,cat:'actinide',row:10,col:16},{z:103,sym:'Lr',name:'Lawrencio',mass:266,cat:'actinide',row:10,col:17},{z:104,sym:'Rf',name:'Rutherfordio',mass:267,cat:'transition',row:7,col:4},{z:105,sym:'Db',name:'Dubnio',mass:268,cat:'transition',row:7,col:5},{z:106,sym:'Sg',name:'Seaborgio',mass:269,cat:'transition',row:7,col:6},{z:107,sym:'Bh',name:'Bohrio',mass:270,cat:'transition',row:7,col:7},{z:108,sym:'Hs',name:'Hasio',mass:277,cat:'transition',row:7,col:8},{z:109,sym:'Mt',name:'Meitnerio',mass:278,cat:'transition',row:7,col:9},{z:110,sym:'Ds',name:'Darmstatio',mass:281,cat:'transition',row:7,col:10},{z:111,sym:'Rg',name:'Roentgenio',mass:282,cat:'transition',row:7,col:11},{z:112,sym:'Cn',name:'Copernicio',mass:285,cat:'transition',row:7,col:12},{z:113,sym:'Nh',name:'Nihonio',mass:286,cat:'post-trans',row:7,col:13},{z:114,sym:'Fl',name:'Flerovio',mass:289,cat:'post-trans',row:7,col:14},{z:115,sym:'Mc',name:'Moscovio',mass:290,cat:'post-trans',row:7,col:15},{z:116,sym:'Lv',name:'Livermorio',mass:293,cat:'post-trans',row:7,col:16},{z:117,sym:'Ts',name:'Teneso',mass:294,cat:'halogen',row:7,col:17},{z:118,sym:'Og',name:'Oganesón',mass:294,cat:'noble',row:7,col:18}
  ],
  catColors: { alkali: '#fecaca', alkaline: '#fed7aa', transition: '#bfdbfe', 'post-trans': '#bbf7d0', metalloid: '#e9d5ff', nonmetal: '#a7f3d0', halogen: '#f5d0fe', noble: '#bae6fd', lanthanide: '#fde68a', actinide: '#fdba74' },
  catLabels: { alkali: 'Alcalinos', alkaline: 'Alcalinotérreos', transition: 'Transición', 'post-trans': 'Post-transición', metalloid: 'Metaloides', nonmetal: 'No Metales', halogen: 'Halógenos', noble: 'Gases Nobles', lanthanide: 'Lantánidos', actinide: 'Actínidos' },
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
    { label: 'Ejemplos de Lab', href: '#simulations', icon: '🧪' },
    { label: 'Guías de Lab', href: '#labs', icon: '🔬' },
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


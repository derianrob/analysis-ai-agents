/**
 * STEP 1: Extracción Granular de Verbatims
 * Analiza CADA respuesta individualmente y extrae TODOS los verbatims mencionados
 * SIN filtros, SIN normalización, SIN generalización
 */
export const PROMPT_STEP1_EXTRACT_VERBATIMS = ({
  answers,
  productContext = "un producto",
}) => {
  return `
    Analiza cada respuesta de forma individual sobre ${productContext}:

    Respuestas:
    ${answers.map((a, i) => `${i + 1}. "${a}"`).join("\n")}

    TAREA: Extrae TODOS los verbatims (beneficios, características, ingredientes, atributos) mencionados en cada respuesta.

    INSTRUCCIONES CRÍTICAS:
    - SÉ EXHAUSTIVO: Extrae CADA elemento mencionado, incluso si parece relacionado con otro
    - NO generalices: "calcio" es diferente a "fortalece", aunque uno implique al otro - extrae ambos si están en la respuesta
    - NO normalices aún: Mantén el lenguaje tal como aparece en la respuesta
    - NO filtres: Incluso elementos que parecen triviales deben incluirse
    - Ingredientes: Si se mencionan calcio, biotina, vitaminas, etc., extrae cada uno por separado
    - Características técnicas: Secado rápido, duración de X días, etc. - todos van
    - Beneficios: Fortalece uñas, protege, etc. - todos van
    - Conceptos experienciales: Fácil de aplicar, práctico, etc. - todos van

    IMPORTANTE: Esta es una extracción RAW, puede haber variaciones del mismo concepto. Eso es OK, se normaliza después.

    Formato JSON esperado:
      {
        "mapping": [
          {
            "answer_index": 1,
            "answer": "respuesta 1",
            "concepts": ["concepto 1", "concepto 2"]
          },
          {
            "answer_index": 2,
            "answer": "respuesta 2",
            "concepts": ["concepto 2"]
          }
        ]
      }
    `;
};

/**
 * STEP 2: Consolidación y Normalización de Verbatims
 * Recibe TODOS los verbatims extraídos y los consolida en conceptos únicos
 * Identifica variaciones del mismo concepto y las normaliza
 */
export const PROMPT_STEP2_CONSOLIDATE_VERBATIMS = (
  allVerbatims,
  productContext = "un producto"
) => {
  const verbatimsText = allVerbatims
    .map((v, i) => `${i + 1}. "${v}"`)
    .join("\n");

  return `
        Analiza estos verbatims extraídos sobre ${productContext} y consolídalos en conceptos únicos normalizados.

        TODOS los verbatims extraídos:
        ${verbatimsText}

        TAREA:
        1. Identifica verbatims que son variaciones del MISMO concepto
        2. Consolida cada grupo en UN concepto normalizado
        3. Mantén la especificidad (no generalices)
        4. Crea un mapa de consolidación que muestre qué verbatims convergen en cada concepto

        INSTRUCCIONES IMPORTANTES SOBRE CONSOLIDACIÓN:
        - SÉ ESPECÍFICO Y GRANULAR: Si mencionan elementos concretos (ingredientes, componentes, características técnicas), créalos como conceptos separados
        - NO GENERALICES: Mantén la especificidad. Si mencionan "ingrediente X" e "ingrediente Y", créalos por separado, no los agrupes bajo un beneficio genérico
        - Mantén el contexto completo: si aparecen múltiples conceptos juntos, sepáralos en conceptos individuales
        - No combines conceptos que aparecen juntos pero son diferentes
        - Normaliza variaciones comunes: diferentes formas de expresar lo mismo deben converger en un solo concepto
        - Para elementos específicos (ingredientes, materiales, tecnologías), normaliza las variaciones:
          Ejemplo: "con ingrediente X", "tiene ingrediente X", "ingrediente X" → "Contiene [ingrediente X]"
        - Elimina conceptos triviales o vacíos, PERO mantén elementos específicos aunque parezcan técnicos
        - Para CADA respuesta, identifica TODOS los conceptos que se relacionan o son mencionados en ella
        - Un concepto aplica a una respuesta si está explícitamente mencionado o está fuertemente implícito
        - Busca variaciones semánticas (sinónimos, paráfrasis, formas diferentes de expresar la misma idea)
        - Si una respuesta no encuentra coincidencia con los conceptos generados, AJUSTA los conceptos para cubrirla
        - Responde SOLO con JSON válido sin comentarios adicionales

        PRINCIPIO CLAVE: ESPECIFICIDAD SOBRE GENERALIZACIÓN
        ✅ Correcto: "con ingrediente A y B" → conceptos separados: ["Contiene [ingrediente A]", "Contiene [ingrediente B]", "Beneficio relacionado"]
        ❌ Incorrecto: "con ingrediente A y B" → solo beneficio genérico: ["Beneficio relacionado"]
        
        ✅ Correcto: "característica X y característica Y" → conceptos separados para cada característica
        ❌ Incorrecto: "característica X y característica Y" → un solo concepto genérico

        PRINCIPIO: Cuando tengas dudas, SEPARA en lugar de AGRUPAR. Es mejor tener conceptos específicos que perder detalle.

        Formato JSON esperado:
        {
          "concepts": [
            "Concepto normalizado 1",
            "Concepto normalizado 2",
            "Concepto normalizado 3"
          ],
          "consolidation_map": {
            "verbatim_original_1": "Concepto normalizado 1",
            "verbatim_original_2": "Concepto normalizado 1",
            "verbatim_original_3": "Concepto normalizado 2"
          }
        }

        Responde SOLO con JSON válido.`;
};

/**
 * STEP 3: Mapping Final
 * Mapea cada respuesta original a los conceptos consolidados
 */
export const PROMPT_STEP3_FINAL_MAPPING = (
  answers,
  concepts,
  consolidationMap,
  productContext = "un producto"
) => {
  const conceptsList = concepts.map((c, i) => `${i + 1}. "${c}"`).join("\n");
  const answersText = answers.map((a, i) => `${i + 1}. "${a}"`).join("\n");
  const mapText = Object.entries(consolidationMap)
    .map(([original, normalized]) => `"${original}" → "${normalized}"`)
    .join("\n");

  return `
        Mapea cada respuesta original sobre ${productContext} a los conceptos consolidados.

        Conceptos finales disponibles:
        ${conceptsList}

        Respuestas originales:
        ${answersText}

        Mapa de consolidación (verbatims → conceptos):
        ${mapText}

        TAREA: Para cada respuesta, identifica TODOS los conceptos que le aplican, usando el mapa de consolidación como referencia.

        INSTRUCCIONES:
        - Usa el mapa de consolidación para vincular verbatims a conceptos
        - Si la respuesta contiene múltiples verbatims, incluye TODOS los conceptos aplicables
        - GARANTÍA: TODAS las respuestas DEBEN tener al menos un concepto (revisa la consolidación anterior si alguna no lo tiene)
        - GARANTÍA: SOLO usa conceptos de la lista de conceptos finales

        Formato JSON esperado:
        {
          "mapping": [
            {
              "answer_index": 1,
              "answer": "respuesta original 1",
              "concepts": ["concepto 1", "concepto 2"]
            },
            {
              "answer_index": 2,
              "answer": "respuesta original 2",
              "concepts": ["concepto 3"]
            }
          ]
        }

        Responde SOLO con JSON válido.`;
};

// DEPRECATED: Mantener para compatibilidad hacia atrás
export const PROMPT_UNIFIED = (answers, productContext = "un producto") => {
  return `
      Analiza estas respuestas sobre ${productContext}.
      
      Respuestas:
      ${answers.map((a, i) => `${i + 1}. "${a}"`).join("\n")}

      TAREA:
      1. Extrae SOLO los beneficios/características mencionados como frases cortas (2-5 palabras)
      2. Asigna cada respuesta a los conceptos que le aplican
      3. GARANTÍAS OBLIGATORIAS:
         - TODAS las respuestas DEBEN tener al menos un concepto asignado
         - SOLO se pueden usar conceptos que fueron generados
         - No pueden haber conceptos en el mapping que no existan en la lista de conceptos

      INSTRUCCIONES IMPORTANTES SOBRE EXTRACCIÓN DE CONCEPTOS:
      - SÉ ESPECÍFICO Y GRANULAR: Si mencionan elementos concretos (ingredientes, componentes, características técnicas), créalos como conceptos separados
      - NO GENERALICES: Mantén la especificidad. Si mencionan "ingrediente X" e "ingrediente Y", créalos por separado, no los agrupes bajo un beneficio genérico
      - Mantén el contexto completo: si aparecen múltiples conceptos juntos, sepáralos en conceptos individuales
      - No combines conceptos que aparecen juntos pero son diferentes
      - Normaliza variaciones comunes: diferentes formas de expresar lo mismo deben converger en un solo concepto
      - Para elementos específicos (ingredientes, materiales, tecnologías), normaliza las variaciones:
        Ejemplo: "con ingrediente X", "tiene ingrediente X", "ingrediente X" → "Contiene [ingrediente X]"
      - Elimina conceptos triviales o vacíos, PERO mantén elementos específicos aunque parezcan técnicos
      - Para CADA respuesta, identifica TODOS los conceptos que se relacionan o son mencionados en ella
      - Un concepto aplica a una respuesta si está explícitamente mencionado o está fuertemente implícito
      - Busca variaciones semánticas (sinónimos, paráfrasis, formas diferentes de expresar la misma idea)
      - Si una respuesta no encuentra coincidencia con los conceptos generados, AJUSTA los conceptos para cubrirla
      - Responde SOLO con JSON válido sin comentarios adicionales

      PRINCIPIO CLAVE: ESPECIFICIDAD SOBRE GENERALIZACIÓN
      ✅ Correcto: "con ingrediente A y B" → conceptos separados: ["Contiene [ingrediente A]", "Contiene [ingrediente B]", "Beneficio relacionado"]
      ❌ Incorrecto: "con ingrediente A y B" → solo beneficio genérico: ["Beneficio relacionado"]
      
      ✅ Correcto: "característica X y característica Y" → conceptos separados para cada característica
      ❌ Incorrecto: "característica X y característica Y" → un solo concepto genérico

      Formato JSON esperado:
      {
        "concepts": [
          "Concepto específico 1",
          "Concepto específico 2",
          "Concepto genérico 1"
        ],
        "mapping": [
          {
            "answer_index": 1,
            "answer": "respuesta 1",
            "concepts": ["concepto 1", "concepto 2"]
          },
          {
            "answer_index": 2,
            "answer": "respuesta 2",
            "concepts": ["concepto 2"]
          }
        ]
      }`;
};

export const PROMPT_1 = (answers, productContext) => {
  return PROMPT_UNIFIED(answers, productContext);
};

export const PROMPT_2 = ({
  concepts,
  answers,
  productContext = "un producto",
}) => {
  return `
      Analiza cada respuesta sobre ${productContext} y asigna los conceptos que le aplican.
      
      Conceptos disponibles:
      ${concepts.map((c, i) => `${i + 1}. "${c}"`).join("\n")}
      
      Respuestas a analizar:
      ${answers.map((a, i) => `${i + 1}. "${a}"`).join("\n")}
      
      INSTRUCCIONES:
      - Para CADA respuesta, identifica TODOS los conceptos que se relacionan o son mencionados en ella.
      - Un concepto aplica a una respuesta si está explícitamente mencionado o está fuertemente implícito en el contenido.
      - Si una respuesta no menciona ningún concepto, devuelve un array vacío.
      - Si múltiples conceptos aplican a una respuesta, incluye todos ellos.
      - Busca variaciones semánticas (sinónimos, paráfrasis, formas diferentes de expresar la misma idea).
      - Responde SOLO con JSON válido sin comentarios adicionales.

      Formato JSON esperado:
      {
        "mapping": [
          {
            "answer_index": 1,
            "answer": "respuesta 1",
            "concepts": ["concepto 1", "concepto 2"]
          },
          {
            "answer_index": 2,
            "answer": "respuesta 2",
            "concepts": ["concepto 3"]
          }
        ]
      }`;
};

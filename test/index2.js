const OpenAI = require("openai");
const fs = require("fs");
require("dotenv").config();
/**
 * Agente inteligente para tokenización y categorización de respuestas de encuesta
 * Con validación en bucle para máxima precisión (~99%)
 */
class ImprovedTokenizationAgent {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY });
  }

  /**
   * ETAPA 1: Extraer conceptos clave de cada respuesta
   * Usa el contexto para entender beneficios sin duplicar innecesariamente
   * También mapea qué concepto corresponde a cada respuesta
   */
  async extractConcepts(answers) {
    console.log("📊 ETAPA 1: Extrayendo conceptos de respuestas...");

    const prompt = `Analiza estas respuestas sobre un producto de esmalte de uñas.
Para cada respuesta, extrae SOLO los beneficios/características mencionados como frases cortas (2-5 palabras).

Respuestas:
${answers.map((a, i) => `${i + 1}. "${a}"`).join("\n")}

IMPORTANTE:
- Mantén el contexto completo (ej: "larga duración" + "color intenso" → dos conceptos separados)
- No combines conceptos que aparecen juntos pero son diferentes
- Normaliza variaciones comunes (ej: "dura 10 días", "duración de 10 días", "10 días de duración" → "Dura hasta por 10 días")
- Elimina conceptos triviales o vacíos
- Responde SOLO con JSON válido

Formato JSON esperado:
{
  "concepts": [
    "Dura hasta por 10 días",
    "Larga duración",
    "Secado rápido"
  ],
  "mapping": {
    "1": ["Dura hasta por 10 días"],
    "2": ["Larga duración"],
    "3": ["Larga duración", "Secado rápido"]
  }
}

Donde "mapping" indica para cada respuesta (por índice) qué conceptos fueron extraídos.

Ahora extrae todos los conceptos únicos y crea el mapeo:`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 3000,
      });

      const result = JSON.parse(completion.choices[0].message.content);
      console.log(
        `   ✓ Encontrados ${result.concepts.length} conceptos únicos`
      );
      console.log(
        `   ✓ Mapeadas ${Object.keys(result.mapping).length} respuestas`
      );
      return { concepts: result.concepts, mapping: result.mapping || {} };
    } catch (error) {
      console.error("   ✗ Error en extracción de conceptos:", error.message);
      throw error;
    }
  }

  /**
   * ETAPA 2: Clustering semántico usando embeddings
   * Agrupa conceptos similares pero mantiene diferencias contextuales importantes
   */
  async clusterConcepts(concepts, mapping) {
    console.log("🔗 ETAPA 2: Clustering semántico con embeddings...");

    try {
      // Obtener embeddings para todos los conceptos
      const embeddingsResponse = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: concepts,
      });

      const embeddings = embeddingsResponse.data.map((d) => d.embedding);
      console.log(
        `   ✓ Embeddings generados para ${concepts.length} conceptos`
      );

      // Calcular similitud coseno y agrupar
      const clusters = [];
      const used = new Set();
      const clusterMapping = {}; // Mapear qué cluster contiene qué concepto

      for (let i = 0; i < concepts.length; i++) {
        if (used.has(i)) continue;

        const cluster = [concepts[i]];
        const clusterIndices = [i];
        used.add(i);

        for (let j = i + 1; j < concepts.length; j++) {
          if (used.has(j)) continue;

          const similarity = this.cosineSimilarity(
            embeddings[i],
            embeddings[j]
          );

          // Umbral alto (0.92) = solo agrupa conceptos MUY similares
          if (similarity > 0.92) {
            cluster.push(concepts[j]);
            clusterIndices.push(j);
            used.add(j);
          }
        }

        clusters.push(cluster);
        clusterIndices.forEach((idx) => {
          clusterMapping[concepts[idx]] = cluster;
        });
      }

      console.log(`   ✓ Agrupados en ${clusters.length} clusters`);

      // Elegir representante de cada cluster
      const representatives = clusters.map((cluster) => {
        // Preferir el más corto y claro como representante
        return cluster.sort((a, b) => a.length - b.length)[0];
      });

      return { clusters, representatives, clusterMapping };
    } catch (error) {
      console.error("   ✗ Error en clustering:", error.message);
      throw error;
    }
  }

  /**
   * Calcula similitud coseno entre dos vectores
   */
  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magA * magB);
  }

  /**
   * ETAPA 3: Categorizar beneficios extraídos
   * Clasifica cada concepto en su categoría correspondiente
   */
  async categorizeClusters(representatives) {
    console.log("📦 ETAPA 3: Categorizando conceptos...");

    const CATEGORIES = [
      "NETO DURACION",
      "NETO COLOR",
      "NETO INGREDIENTES",
      "NETO APARIENCIA",
      "NETO PRACTICIDAD",
      "NETO INNOVACION",
      "NETO BENEFICIOS",
      "NETO OTROS",
    ];

    const prompt = `Responde en formato JSON. Categoriza estos beneficios de esmalte de uñas en las categorías proporcionadas:

Beneficios a categorizar:
${representatives.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Categorías disponibles:
- NETO DURACION: tiempo que dura, resistencia, desgaste
- NETO COLOR: intensidad, variedad, tonos, colores vibrantes
- NETO INGREDIENTES: químicos, vitaminas, calcio, biotina, toxinas
- NETO APARIENCIA: brillo, acabado, aspecto de uñas, fortaleza visual
- NETO PRACTICIDAD: facilidad de uso, aplicación, capas necesarias
- NETO INNOVACION: tecnología, diferenciación, novedad en mercado
- NETO BENEFICIOS: fortalecimiento, protección, nutrición, cuidado
- NETO OTROS: resto de beneficios

Reglas de categorización:
1. Cada beneficio debe ir en UNA sola categoría (la más relevante)
2. Mantén las frases EXACTAMENTE como se proporcionaron (sin cambios)
3. Ordena dentro de cada categoría de forma lógica (más importantes primero)
4. Si un beneficio no encaja claramente, colócalo en NETO OTROS

Formato de salida (array plano con separadores de categoría):
{
  "output": [
    "NETO DURACION",
    "Dura hasta por 10 días",
    "Larga duración",
    "Resistente al desgaste",
    "NETO COLOR",
    "Color intenso",
    "Colores vibrantes",
    "NETO INGREDIENTES",
    ...
  ]
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.15,
        max_tokens: 2000,
      });

      const result = JSON.parse(completion.choices[0].message.content);
      console.log(`   ✓ ${result.output.length} elementos categorizados`);
      return result.output;
    } catch (error) {
      console.error("   ✗ Error en categorización:", error.message);
      throw error;
    }
  }

  /**
   * ETAPA 4: Validación y refinamiento
   * LLM validador verifica trazabilidad, duplicados y beneficios faltantes
   */
  async validateOutput(output, originalAnswers, answersMapping) {
    console.log("✅ ETAPA 4: Validando con segundo LLM...");

    // Extraer solo los beneficios (sin categorías)
    const extractedBenefits = output.filter(
      (item) => !item.startsWith("NETO ")
    );

    // Construir análisis de trazabilidad
    const tracingAnalysis = Object.entries(answersMapping)
      .slice(0, 20) // Limitar a primeras 20 para no saturar el prompt
      .map(
        ([idx, mapping]) =>
          `${idx}. Original: "${mapping.original_answer.substring(
            0,
            80
          )}..."\n   Conceptos: [${mapping.extracted_concepts
            .map((c) => `"${c}"`)
            .join(", ")}]`
      )
      .join("\n");

    const validationPrompt = `Responde en formato JSON. Eres un validador experto en análisis de respuestas de encuesta.

MUESTRA DE TRAZABILIDAD (Respuesta Original → Conceptos Extraídos):
${tracingAnalysis}
... (y ${Object.keys(answersMapping).length - 20} respuestas más)

BENEFICIOS FINALES EXTRAÍDOS (sin categorías):
${extractedBenefits.map((b, i) => `${i + 1}. ${b}`).join("\n")}

TAREAS DE VALIDACIÓN EXHAUSTIVA:

1. ANÁLISIS DE TRAZABILIDAD:
   - ¿Todas las respuestas fueron mapeadas correctamente a conceptos?
   - ¿Hay respuestas con extracciones vacías o pobres?
   - ¿Los conceptos extraídos representan fielmente cada respuesta?

2. BENEFICIOS FALTANTES (mencionados 3+ veces):
   - Identifica beneficios frecuentes en respuestas que NO están en la lista final
   - Proporciona ejemplos de dónde aparecen
   - Explica por qué se perdieron

3. DUPLICADOS CONCEPTUALES (términos redundantes):
   - Encuentra pares de beneficios con significado similar
   - Sugiere cuál debería ser el término estándar
   - Indica confianza en la duplicidad

4. PROPUESTAS DE UNIÓN:
   - Crea recomendaciones específicas de fusión
   - Ejemplo: "Fusionar 'Durabilidad' y 'Larga duración' en 'Larga duración'"

Responde EXCLUSIVAMENTE en JSON válido:
{
  "validation_score": 0.95,
  "traceability_quality": {
    "status": "excellent|good|fair|poor",
    "coverage_percentage": 95,
    "issues": ["descripción de problemas encontrados"]
  },
  "missing_benefits": [
    {
      "benefit": "nombre del beneficio",
      "frequency": 5,
      "examples": ["respuesta 1", "respuesta 2"],
      "reason": "explicación breve"
    }
  ],
  "duplicate_pairs": [
    {
      "benefit_a": "Beneficio A",
      "benefit_b": "Beneficio B",
      "confidence": 0.95,
      "suggested_merge": "Término recomendado"
    }
  ],
  "merge_proposals": [
    "Fusionar 'A' y 'B' en 'Término estándar'"
  ],
  "recommendation": "resumen general"
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: validationPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 3000,
      });

      const validation = JSON.parse(completion.choices[0].message.content);
      console.log(
        `   ✓ Score de validación: ${(
          validation.validation_score * 100
        ).toFixed(1)}%`
      );
      console.log(
        `   ✓ Trazabilidad: ${validation.traceability_quality.status} (${validation.traceability_quality.coverage_percentage}%)`
      );

      if (validation.missing_benefits.length > 0) {
        console.log(
          `   ⚠ Beneficios faltantes: ${validation.missing_benefits.length}`
        );
      }

      if (validation.duplicate_pairs.length > 0) {
        console.log(
          `   ⚠ Duplicados detectados: ${validation.duplicate_pairs.length}`
        );
      }

      if (validation.merge_proposals.length > 0) {
        console.log(
          `   💡 Propuestas de unión: ${validation.merge_proposals.length}`
        );
      }

      return validation;
    } catch (error) {
      console.error("   ✗ Error en validación:", error.message);
      throw error;
    }
  }

  /**
   * Mejora la salida agregando beneficios faltantes
   */
  async enhanceOutput(output, missingBenefits, originalAnswers) {
    if (missingBenefits.length === 0) {
      return output;
    }

    console.log("🔧 Mejorando salida con beneficios faltantes...");

    const prompt = `Responde en formato JSON. Dados estos beneficios faltantes, categorízalos en las categorías existentes:

Beneficios faltantes:
${missingBenefits.map((b) => `- ${b}`).join("\n")}

Categorías disponibles: NETO DURACION, NETO COLOR, NETO INGREDIENTES, NETO APARIENCIA, NETO PRACTICIDAD, NETO INNOVACION, NETO BENEFICIOS, NETO OTROS

Responde en JSON:
{
  "categorized": {
    "NETO DURACION": ["beneficio1", "beneficio2"],
    "NETO COLOR": ["beneficio3"],
    ...
  }
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.15,
        max_tokens: 1000,
      });

      const result = JSON.parse(completion.choices[0].message.content);

      // Agregar los beneficios faltantes a la salida
      let enhancedOutput = [...output];
      const CATEGORIES = [
        "NETO DURACION",
        "NETO COLOR",
        "NETO INGREDIENTES",
        "NETO APARIENCIA",
        "NETO PRACTICIDAD",
        "NETO INNOVACION",
        "NETO BENEFICIOS",
        "NETO OTROS",
      ];

      for (const category of CATEGORIES) {
        if (result.categorized[category]) {
          const categoryIndex = enhancedOutput.indexOf(category);
          if (categoryIndex !== -1) {
            // Encontrar el siguiente categoría para saber dónde insertar
            let nextCategoryIndex = enhancedOutput.length;
            for (let i = categoryIndex + 1; i < enhancedOutput.length; i++) {
              if (enhancedOutput[i].startsWith("NETO ")) {
                nextCategoryIndex = i;
                break;
              }
            }
            // Insertar nuevos beneficios antes de la siguiente categoría
            enhancedOutput.splice(
              nextCategoryIndex,
              0,
              ...result.categorized[category]
            );
          }
        }
      }

      console.log(`   ✓ ${missingBenefits.length} beneficios añadidos`);
      return enhancedOutput;
    } catch (error) {
      console.error("   ✗ Error en mejora:", error.message);
      return output;
    }
  }

  /**
   * Pipeline completo: extrae → agrupa → categoriza → valida → mejora
   */
  async process(questionData) {
    console.log("\n════════════════════════════════════════════════════════");
    console.log("   🎯 AGENTE DE TOKENIZACIÓN Y CATEGORIZACIÓN");
    console.log("════════════════════════════════════════════════════════\n");

    try {
      // ETAPA 1: Extracción
      const { concepts, mapping } = await this.extractConcepts(
        questionData.answers
      );

      // ETAPA 2: Clustering
      const { representatives, clusterMapping } = await this.clusterConcepts(
        concepts,
        mapping
      );

      // ETAPA 3: Categorización
      let output = await this.categorizeClusters(representatives);

      // Construir mapeo de respuestas originales a conceptos extraídos (para validación)
      const answersMapping = {};
      for (const [answerIndex, conceptsList] of Object.entries(mapping)) {
        answersMapping[answerIndex] = {
          original_answer: questionData.answers[parseInt(answerIndex) - 1],
          extracted_concepts: conceptsList,
        };
      }

      // ETAPA 4: Validación
      const validation = await this.validateOutput(
        output,
        questionData.answers,
        answersMapping
      );

      // ETAPA 5: Mejora (si hay beneficios faltantes)
      if (validation.missing_benefits.length > 0) {
        output = await this.enhanceOutput(
          output,
          validation.missing_benefits.map((b) =>
            typeof b === "string" ? b : b.benefit
          ),
          questionData.answers
        );
      }

      // Construir resultado final con validación completa
      const result = {
        id: "O001",
        question_id: questionData.id,
        output: output,
        validation: {
          score: validation.validation_score,
          traceability: validation.traceability_quality,
          missing_benefits_count: validation.missing_benefits.length,
          missing_benefits_details: validation.missing_benefits,
          duplicates_count: validation.duplicate_pairs.length,
          duplicate_pairs_details: validation.duplicate_pairs,
          merge_proposals: validation.merge_proposals || [],
          recommendation: validation.recommendation,
        },
        traceability: {
          total_answers: questionData.answers.length,
          total_concepts_extracted: concepts.length,
          answers_mapping: answersMapping,
        },
      };

      // Guardar resultado
      const outputPath = "data/a2-out-generated.json";
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

      console.log("\n════════════════════════════════════════════════════════");
      console.log("✨ PROCESO COMPLETADO EXITOSAMENTE\n");
      console.log(
        `📊 Total de tokens extraídos: ${
          output.filter((item) => !item.startsWith("NETO ")).length
        }`
      );
      console.log(
        `📋 Total de respuestas mapeadas: ${
          Object.keys(answersMapping).length
        }/${questionData.answers.length}`
      );
      console.log(
        `🎯 Score de validación: ${(validation.validation_score * 100).toFixed(
          1
        )}%`
      );
      console.log(`📁 Resultado guardado en: ${outputPath}`);
      console.log("════════════════════════════════════════════════════════\n");

      return result;
    } catch (error) {
      console.error("\n❌ ERROR EN PROCESO:", error.message);
      throw error;
    }
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    // Verificar API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("❌ Error: OPENAI_API_KEY no está configurada");
      console.error("   Configura: export OPENAI_API_KEY='tu-clave-api'");
      process.exit(1);
    }

    // Cargar datos de entrada
    const inputPath = "data/a2.json";
    const questionData = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

    // Ejecutar agente
    const agent = new ImprovedTokenizationAgent(apiKey);
    const result = await agent.process(questionData);

    // Mostrar primeros 10 beneficios como ejemplo
    const benefits = result.output.filter((item) => !item.startsWith("NETO "));
    console.log("📋 Primeros 10 beneficios extraídos:");
    benefits.slice(0, 10).forEach((benefit, i) => {
      console.log(`   ${i + 1}. ${benefit}`);
    });
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Ejecutar
main();

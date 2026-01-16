const { generateObject } = require("ai");
const { openai } = require("@ai-sdk/openai");
const { z } = require("zod");
const {
  PROMPT_STEP1_EXTRACT_VERBATIMS,
  PROMPT_STEP2_CONSOLIDATE_VERBATIMS,
  PROMPT_STEP3_FINAL_MAPPING,
} = require("./config/prompts");
const fs = require("fs");

require("dotenv").config();

/**
 * STEP 1: Extrae verbatims individuales de cada respuesta (por lotes)
 * Procesa respuestas en lotes para optimizar costo y velocidad
 */
const step1ExtractVerbatims = async (
  answers,
  productContext = "un producto"
) => {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini", { apiKey: process.env.OPENAI_API_KEY }),
    schema: z.object({
      mapping: z.array(
        z.object({
          answer_index: z.number(),
          answer: z.string(),
          concepts: z.array(z.string()),
        })
      ),
    }),
    prompt: PROMPT_STEP1_EXTRACT_VERBATIMS({
      answers: answers,
      productContext,
    }),
  });

  const verbatims = object.mapping.map((m) => m.concepts).flat();
  return verbatims;
};

/**
 * STEP 2: Consolida y normaliza los verbatims
 */
const step2ConsolidateVerbatims = async (
  verbatims,
  productContext = "un producto"
) => {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini", { apiKey: process.env.OPENAI_API_KEY }),
    schema: z.object({
      concepts: z.array(z.string()),
      consolidation_map: z.record(z.string(), z.string()),
    }),
    prompt: PROMPT_STEP2_CONSOLIDATE_VERBATIMS(verbatims, productContext),
  });

  return object;
};

/**
 * STEP 3: Mapea respuestas originales a conceptos consolidados
 */
const step3FinalMapping = async (
  answers,
  concepts,
  consolidationMap,
  productContext = "un producto"
) => {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini", { apiKey: process.env.OPENAI_API_KEY }),
    schema: z.object({
      mapping: z.array(
        z.object({
          answer_index: z.number(),
          answer: z.string(),
          concepts: z.array(z.string()),
        })
      ),
    }),
    prompt: PROMPT_STEP3_FINAL_MAPPING(
      answers,
      concepts,
      consolidationMap,
      productContext
    ),
  });

  return object;
};

const main = async () => {
  // Cargar datos de entrada
  const inputPath = "data/a2.json";
  const questionData = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  const productContext = "un esmalte de uñas";

  try {
    // STEP 1: Extrae verbatims (en lotes de 20 respuestas)
    const verbatims = await step1ExtractVerbatims(
      questionData.answers,
      productContext
    );

    // STEP 2: Consolida verbatims
    const { concepts, consolidation_map } = await step2ConsolidateVerbatims(
      verbatims,
      productContext
    );

    // STEP 3: Mapea respuestas
    const finalResult = await step3FinalMapping(
      questionData.answers,
      concepts,
      consolidation_map,
      productContext
    );

    // Resultado final
    const output = {
      summary: {
        total_answers: questionData.answers.length,
        total_concepts: concepts.length,
        answers_with_concepts: finalResult.mapping.filter(
          (m) => m.concepts.length > 0
        ).length,
      },
      concepts,
      mapping: finalResult.mapping,
    };

    // Guardar resultado en archivo
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    console.error("❌ Error en el análisis:", error.message);
    throw error;
  }
};

main();

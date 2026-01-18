// Types for concept analysis template

export interface ConceptMapping {
  answer_index: number;
  answer: string;
  concepts: string[];
}

export interface ConceptAnalysisResult {
  concepts: string[];
  mapping: ConceptMapping[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface SingleQuestionWizardState {
  step: number;
  question: string;
  answers: string[];
  analysisResult: ConceptAnalysisResult | null;
  editedConcepts: string[];
  editedMapping: ConceptMapping[];
}

export const TEMPLATES: Template[] = [
  {
    id: 'single-question',
    name: 'Análisis de una única pregunta',
    description: 'Analiza respuestas abiertas y extrae conceptos clave (verbatims) con IA',
    icon: 'MessageSquareText',
    color: 'from-blue-500 to-indigo-600',
  },
];

// Mock data for AI analysis simulation
export const MOCK_ANALYSIS_RESULT: ConceptAnalysisResult = {
  concepts: [
    "Máxima duración",
    "Dura hasta por 10 días",
    "Sin desgaste del color",
    "Duración del producto",
    "Aplicación en uñas",
    "Brillo intenso",
    "Color intenso",
    "Contiene calcio",
    "Fortalece las uñas",
    "Secado super rápido",
    "Secado rápido",
    "Color intacto",
    "Libres de químicos tóxicos",
    "Esmalte",
    "Practicidad",
    "Uñas intactas",
    "Protección",
    "Larga duración",
    "Esmalte de larga duración",
    "Fórmula premium",
    "Biotina",
    "Dureza en las uñas",
    "Acabado firme",
    "Acabado resistente",
    "Elem. seguro",
    "Beneficios del producto",
    "Vegan",
    "Libre de crueldad",
    "Ahorro en tiempo",
    "Ahorro en dinero",
    "Innovación",
    "Calidad",
    "Resistente al desgaste diario",
    "No daña las uñas",
    "Dura por mucho más tiempo",
    "Cuidado de uñas",
    "Beneficios múltiples",
    "Dureza del esmalte",
    "Libre de más de 20 sustancias tóxicas",
    "Esmalte que protegerá las uñas",
    "Secado rápido en segundos",
    "Pincel de precisión",
    "Un solo producto"
  ],
  mapping: [
    {
      answer_index: 1,
      answer: "Maxima duración del esmalte hasta por 10 días sin desgaste del color",
      concepts: ["Máxima duración", "Dura hasta por 10 días", "Sin desgaste del color"]
    },
    {
      answer_index: 2,
      answer: "La duración del producto en tus uñas",
      concepts: ["Duración del producto"]
    },
    {
      answer_index: 3,
      answer: "Más beneficios dura mas y más brillo",
      concepts: ["Beneficios múltiples"]
    },
    {
      answer_index: 4,
      answer: "La duración del esmalte",
      concepts: ["Duración del producto"]
    },
    {
      answer_index: 5,
      answer: "Color intenso, calcio para fortalecer mis uñas",
      concepts: ["Color intenso", "Contiene calcio", "Fortalece las uñas"]
    },
    {
      answer_index: 6,
      answer: "Un esmalte de secado super rápido",
      concepts: ["Secado super rápido", "Esmalte"]
    },
    {
      answer_index: 7,
      answer: "Que es un esmalte de secado rápido y te da un color intacto por 10 dias",
      concepts: ["Secado rápido", "Color intacto", "Dura hasta por 10 días"]
    }
  ]
};

// Example data for the spreadsheet
export const EXAMPLE_DATA = {
  question: "¿Qué es lo que más te llamó la atención del producto?",
  answers: [
    "Maxima duración del esmalte hasta por 10 días sin desgaste del color",
    "La duración del producto en tus uñas",
    "Más beneficios dura mas y más brillo",
    "La duración del esmalte",
    "Color intenso, calcio para fortalecer mis uñas",
    "Un esmalte de secado super rápido",
    "Que es un esmalte de secado rápido y te da un color intacto por 10 dias"
  ]
};

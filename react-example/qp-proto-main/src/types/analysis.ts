// Core types for the Q&A Analysis System

export interface QuestionData {
  id: string;
  text: string;
  analysis_code: string;
  answers: string[];
}

export interface UploadedFile {
  id: string;
  name: string;
  metadata?: {
    source?: string;
    version?: string;
  };
  questions: QuestionData[];
  uploadedAt: Date;
}

export interface AnalysisParameter {
  name: string;
  type: 'number' | 'select' | 'tags' | 'text';
  label: string;
  required?: boolean;
  min?: number;
  max?: number;
  default?: any;
  options?: string[];
}

export interface AnalysisType {
  code: string;
  name: string;
  description: string;
  icon: string;
  parameters: AnalysisParameter[];
}

export interface QuestionConfig {
  questionId: string;
  questionText: string;
  answers: string[];
  analysisCode: string;
  parameters: Record<string, any>;
  isComplete: boolean;
}

export interface AnalysisResult {
  questionId: string;
  questionText: string;
  analysisCode: string;
  analysisName: string;
  result: any;
}

export interface AnalysisProject {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'completed' | 'in_progress' | 'error';
  sourceFiles: string[];
  totalQuestions: number;
  analysisTypes: string[];
  questionsConfig: QuestionConfig[];
  results: AnalysisResult[] | null;
}

export type ProjectStatus = 'completed' | 'in_progress' | 'error';
export type SortBy = 'date' | 'name' | 'questions';
export type FilterBy = 'all' | 'completed' | 'in_progress' | 'error';

// Analysis Types Registry
export const ANALYSIS_TYPES: Record<string, AnalysisType> = {
  'ANL-01': {
    code: 'ANL-01',
    name: 'Análisis de Sentimiento',
    description: 'Detecta sentimiento positivo, neutral o negativo en respuestas',
    icon: 'Heart',
    parameters: [
      { name: 'threshold', type: 'number', min: 0, max: 1, default: 0.7, label: 'Umbral de confianza' },
      { name: 'language', type: 'select', options: ['es', 'en'], default: 'es', label: 'Idioma' },
    ],
  },
  'ANL-02': {
    code: 'ANL-02',
    name: 'Palabras Clave',
    description: 'Extrae keywords más relevantes',
    icon: 'Key',
    parameters: [
      { name: 'min_frequency', type: 'number', min: 1, default: 2, label: 'Frecuencia mínima' },
      { name: 'max_keywords', type: 'number', min: 5, max: 50, default: 10, label: 'Máximo de keywords' },
      { name: 'stopwords', type: 'tags', default: ['el', 'la', 'de', 'que'], label: 'Palabras a ignorar' },
    ],
  },
  'ANL-03': {
    code: 'ANL-03',
    name: 'Clasificación de Temas',
    description: 'Categoriza respuestas en temas predefinidos',
    icon: 'Tags',
    parameters: [
      { name: 'categories', type: 'tags', required: true, label: 'Categorías', default: [] },
      { name: 'model', type: 'select', options: ['basic', 'advanced'], default: 'basic', label: 'Modelo' },
    ],
  },
  'ANL-04': {
    code: 'ANL-04',
    name: 'Análisis de Longitud',
    description: 'Estadísticas sobre la extensión de respuestas',
    icon: 'Ruler',
    parameters: [
      { name: 'unit', type: 'select', options: ['words', 'chars'], default: 'words', label: 'Unidad de medida' },
    ],
  },
};

export const getAnalysisType = (code: string): AnalysisType | undefined => {
  return ANALYSIS_TYPES[code];
};

export const getDefaultParameters = (code: string): Record<string, any> => {
  const analysisType = ANALYSIS_TYPES[code];
  if (!analysisType) return {};
  
  const defaults: Record<string, any> = {};
  analysisType.parameters.forEach(param => {
    defaults[param.name] = param.default;
  });
  return defaults;
};

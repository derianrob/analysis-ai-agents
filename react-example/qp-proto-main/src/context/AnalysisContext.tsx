import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  AnalysisProject, 
  UploadedFile, 
  QuestionConfig, 
  AnalysisResult,
  FilterBy,
  SortBy,
  getDefaultParameters,
  ANALYSIS_TYPES
} from '@/types/analysis';

// State interface
interface AppState {
  projects: AnalysisProject[];
  currentProject: AnalysisProject | null;
  currentFile: UploadedFile | null;
  wizardState: {
    currentQuestionIndex: number;
    questionsConfig: QuestionConfig[];
    isAccumulative: boolean;
  } | null;
  searchQuery: string;
  filterBy: FilterBy;
  sortBy: SortBy;
  isProcessing: boolean;
}

// Action types
type AppAction =
  | { type: 'SET_PROJECTS'; payload: AnalysisProject[] }
  | { type: 'ADD_PROJECT'; payload: AnalysisProject }
  | { type: 'UPDATE_PROJECT'; payload: AnalysisProject }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_CURRENT_PROJECT'; payload: AnalysisProject | null }
  | { type: 'SET_CURRENT_FILE'; payload: UploadedFile | null }
  | { type: 'INIT_WIZARD'; payload: { questionsConfig: QuestionConfig[]; isAccumulative: boolean } }
  | { type: 'UPDATE_WIZARD_QUESTION'; payload: { index: number; config: Partial<QuestionConfig> } }
  | { type: 'SET_WIZARD_INDEX'; payload: number }
  | { type: 'CLEAR_WIZARD' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTER'; payload: FilterBy }
  | { type: 'SET_SORT'; payload: SortBy }
  | { type: 'SET_PROCESSING'; payload: boolean };

// Initial state
const initialState: AppState = {
  projects: [],
  currentProject: null,
  currentFile: null,
  wizardState: null,
  searchQuery: '',
  filterBy: 'all',
  sortBy: 'date',
  isProcessing: false,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [action.payload, ...state.projects] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
        currentProject: state.currentProject?.id === action.payload.id 
          ? action.payload 
          : state.currentProject,
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
      };
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    case 'SET_CURRENT_FILE':
      return { ...state, currentFile: action.payload };
    case 'INIT_WIZARD':
      return {
        ...state,
        wizardState: {
          currentQuestionIndex: 0,
          questionsConfig: action.payload.questionsConfig,
          isAccumulative: action.payload.isAccumulative,
        },
      };
    case 'UPDATE_WIZARD_QUESTION':
      if (!state.wizardState) return state;
      const updatedConfigs = [...state.wizardState.questionsConfig];
      updatedConfigs[action.payload.index] = {
        ...updatedConfigs[action.payload.index],
        ...action.payload.config,
      };
      return {
        ...state,
        wizardState: {
          ...state.wizardState,
          questionsConfig: updatedConfigs,
        },
      };
    case 'SET_WIZARD_INDEX':
      if (!state.wizardState) return state;
      return {
        ...state,
        wizardState: {
          ...state.wizardState,
          currentQuestionIndex: action.payload,
        },
      };
    case 'CLEAR_WIZARD':
      return { ...state, wizardState: null, currentFile: null };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_FILTER':
      return { ...state, filterBy: action.payload };
    case 'SET_SORT':
      return { ...state, sortBy: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    default:
      return state;
  }
}

// Context
interface AnalysisContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  initializeWizard: (file: UploadedFile, existingProject?: AnalysisProject) => void;
  runAnalysis: () => Promise<void>;
  saveProject: (name: string) => void;
  getFilteredProjects: () => AnalysisProject[];
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

// Storage key
const STORAGE_KEY = 'qa-analysis-projects';

// Provider component
export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load projects from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const projects = JSON.parse(stored).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));
        dispatch({ type: 'SET_PROJECTS', payload: projects });
      } catch (e) {
        console.error('Failed to load projects:', e);
      }
    }
  }, []);

  // Save projects to localStorage when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.projects));
  }, [state.projects]);

  // Initialize wizard from file
  const initializeWizard = (file: UploadedFile, existingProject?: AnalysisProject) => {
    dispatch({ type: 'SET_CURRENT_FILE', payload: file });
    
    const questionsConfig: QuestionConfig[] = file.questions.map(q => ({
      questionId: q.id,
      questionText: q.text,
      answers: q.answers,
      analysisCode: q.analysis_code,
      parameters: getDefaultParameters(q.analysis_code),
      isComplete: false,
    }));

    dispatch({
      type: 'INIT_WIZARD',
      payload: {
        questionsConfig,
        isAccumulative: !!existingProject,
      },
    });

    if (existingProject) {
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: existingProject });
    }
  };

  // Run mock analysis
  const runAnalysis = async () => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!state.wizardState || !state.currentFile) {
      dispatch({ type: 'SET_PROCESSING', payload: false });
      return;
    }

    const results: AnalysisResult[] = state.wizardState.questionsConfig.map(config => {
      const analysisType = ANALYSIS_TYPES[config.analysisCode];
      return {
        questionId: config.questionId,
        questionText: config.questionText,
        analysisCode: config.analysisCode,
        analysisName: analysisType?.name || 'Unknown',
        result: generateMockResult(config.analysisCode, config.answers, config.parameters),
      };
    });

    // Update or create project
    const now = new Date();
    const project: AnalysisProject = state.currentProject
      ? {
          ...state.currentProject,
          updatedAt: now,
          sourceFiles: [...state.currentProject.sourceFiles, state.currentFile.name],
          totalQuestions: state.currentProject.totalQuestions + state.currentFile.questions.length,
          results: [...(state.currentProject.results || []), ...results],
        }
      : {
          id: `proj_${Date.now()}`,
          name: `Análisis de ${state.currentFile.name}`,
          createdAt: now,
          updatedAt: now,
          status: 'completed',
          sourceFiles: [state.currentFile.name],
          totalQuestions: state.currentFile.questions.length,
          analysisTypes: [...new Set(state.wizardState.questionsConfig.map(q => q.analysisCode))],
          questionsConfig: state.wizardState.questionsConfig,
          results,
        };

    if (state.currentProject) {
      dispatch({ type: 'UPDATE_PROJECT', payload: project });
    } else {
      dispatch({ type: 'ADD_PROJECT', payload: project });
    }
    
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
    dispatch({ type: 'SET_PROCESSING', payload: false });
  };

  // Save/rename project
  const saveProject = (name: string) => {
    if (!state.currentProject) return;
    const updated = { ...state.currentProject, name, updatedAt: new Date() };
    dispatch({ type: 'UPDATE_PROJECT', payload: updated });
  };

  // Get filtered and sorted projects
  const getFilteredProjects = (): AnalysisProject[] => {
    let filtered = [...state.projects];

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.sourceFiles.some(f => f.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (state.filterBy !== 'all') {
      filtered = filtered.filter(p => p.status === state.filterBy);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'date':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'questions':
          return b.totalQuestions - a.totalQuestions;
        default:
          return 0;
      }
    });

    return filtered;
  };

  return (
    <AnalysisContext.Provider value={{ 
      state, 
      dispatch, 
      initializeWizard, 
      runAnalysis, 
      saveProject,
      getFilteredProjects,
    }}>
      {children}
    </AnalysisContext.Provider>
  );
}

// Hook to use context
export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
}

// Generate mock analysis results
function generateMockResult(code: string, answers: string[], parameters: Record<string, any>): any {
  switch (code) {
    case 'ANL-01': // Sentiment
      const positive = Math.floor(Math.random() * 50) + 30;
      const neutral = Math.floor(Math.random() * 30) + 10;
      const negative = 100 - positive - neutral;
      return {
        summary: { positive, neutral, negative },
        details: answers.map(answer => ({
          answer,
          sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)],
          score: Math.random().toFixed(2),
        })),
      };
    
    case 'ANL-02': // Keywords
      const words = answers.join(' ').toLowerCase().split(/\s+/);
      const wordCount: Record<string, number> = {};
      words.forEach(word => {
        if (word.length > 3) {
          wordCount[word] = (wordCount[word] || 0) + 1;
        }
      });
      const keywords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, parameters.max_keywords || 10)
        .map(([word, count]) => ({ word, count }));
      return { keywords };
    
    case 'ANL-03': // Classification
      const categories = parameters.categories || ['General', 'Servicio', 'Producto'];
      const distribution: Record<string, number> = {};
      categories.forEach((cat: string) => {
        distribution[cat] = Math.floor(Math.random() * 30) + 5;
      });
      return { distribution, categorizedAnswers: answers.map(a => ({
        answer: a,
        category: categories[Math.floor(Math.random() * categories.length)],
        confidence: (Math.random() * 0.5 + 0.5).toFixed(2),
      })) };
    
    case 'ANL-04': // Length
      const unit = parameters.unit || 'words';
      const lengths = answers.map(a => 
        unit === 'words' ? a.split(/\s+/).length : a.length
      );
      return {
        unit,
        min: Math.min(...lengths),
        max: Math.max(...lengths),
        avg: (lengths.reduce((a, b) => a + b, 0) / lengths.length).toFixed(1),
        median: lengths.sort((a, b) => a - b)[Math.floor(lengths.length / 2)],
        distribution: lengths.map((len, i) => ({ answer: i + 1, length: len })),
      };
    
    default:
      return { message: 'Unknown analysis type' };
  }
}

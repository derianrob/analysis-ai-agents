import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpreadsheetEditor } from "@/components/spreadsheet/SpreadsheetEditor";
import { ConfirmationStep } from "@/components/wizard/steps/ConfirmationStep";
import { AnalyzingStep } from "@/components/wizard/steps/AnalyzingStep";
import { ConceptEditor } from "@/components/wizard/steps/ConceptEditor";
import { FrequencyTable } from "@/components/wizard/steps/FrequencyTable";
import { MOCK_ANALYSIS_RESULT, ConceptMapping } from "@/types/concepts";
import { cn } from "@/lib/utils";

type WizardStep = 'spreadsheet' | 'confirmation' | 'analyzing' | 'editor' | 'frequency';

const STEP_LABELS: Record<WizardStep, string> = {
  spreadsheet: 'Ingresar datos',
  confirmation: 'Confirmar',
  analyzing: 'Análisis IA',
  editor: 'Editar conceptos',
  frequency: 'Resultados',
};

const STEPS: WizardStep[] = ['spreadsheet', 'confirmation', 'analyzing', 'editor', 'frequency'];

export default function SingleQuestionWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>('spreadsheet');
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ConceptMapping[]>([]);

  const handleSpreadsheetConfirm = useCallback((q: string, a: string[]) => {
    setQuestion(q);
    setAnswers(a);
    setCurrentStep('confirmation');
  }, []);

  const handleStartAnalysis = useCallback(() => {
    setCurrentStep('analyzing');
  }, []);

  const handleAnalysisComplete = useCallback(() => {
    // Use mock data but with actual answers from user
    const mockConcepts = [...MOCK_ANALYSIS_RESULT.concepts];
    
    // Create mapping using user's answers
    const mockMapping: ConceptMapping[] = answers.map((answer, index) => {
      // Find matching mock or create random assignment
      const mockItem = MOCK_ANALYSIS_RESULT.mapping.find(m => m.answer_index === index + 1);
      return {
        answer_index: index + 1,
        answer,
        concepts: mockItem?.concepts || mockConcepts.slice(0, Math.floor(Math.random() * 3) + 1)
      };
    });

    setConcepts(mockConcepts);
    setMapping(mockMapping);
    setCurrentStep('editor');
  }, [answers]);

  const handleSaveConcepts = useCallback((newConcepts: string[], newMapping: ConceptMapping[]) => {
    setConcepts(newConcepts);
    setMapping(newMapping);
    setCurrentStep('frequency');
  }, []);

  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const currentStepIndex = STEPS.indexOf(currentStep);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 sticky top-0 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoHome}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Button>

        <div className="flex-1 flex items-center justify-center gap-2">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
                  index < currentStepIndex && "text-emerald-600",
                  index === currentStepIndex && "bg-primary/10 text-primary font-medium",
                  index > currentStepIndex && "text-muted-foreground"
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium",
                  index < currentStepIndex && "bg-emerald-500 text-white",
                  index === currentStepIndex && "bg-primary text-primary-foreground",
                  index > currentStepIndex && "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </span>
                <span className="hidden sm:inline">{STEP_LABELS[step]}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  "w-8 h-0.5 mx-1",
                  index < currentStepIndex ? "bg-emerald-500" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoHome}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </Button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {currentStep === 'spreadsheet' && (
          <SpreadsheetEditor onConfirm={handleSpreadsheetConfirm} />
        )}

        {currentStep === 'confirmation' && (
          <ConfirmationStep
            question={question}
            answers={answers}
            onConfirm={handleStartAnalysis}
            onBack={() => setCurrentStep('spreadsheet')}
          />
        )}

        {currentStep === 'analyzing' && (
          <AnalyzingStep
            totalAnswers={answers.length}
            onComplete={handleAnalysisComplete}
          />
        )}

        {currentStep === 'editor' && (
          <ConceptEditor
            concepts={concepts}
            mapping={mapping}
            onSave={handleSaveConcepts}
          />
        )}

        {currentStep === 'frequency' && (
          <FrequencyTable
            question={question}
            concepts={concepts}
            mapping={mapping}
            onBack={() => setCurrentStep('editor')}
            onGoHome={handleGoHome}
          />
        )}
      </main>
    </div>
  );
}

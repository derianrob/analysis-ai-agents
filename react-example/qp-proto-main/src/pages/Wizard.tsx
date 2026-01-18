import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WizardSidebar } from "@/components/wizard/WizardSidebar";
import { WizardStep } from "@/components/wizard/WizardStep";
import { useAnalysis } from "@/context/AnalysisContext";
import { useEffect } from "react";
import { ANALYSIS_TYPES } from "@/types/analysis";

export default function Wizard() {
  const navigate = useNavigate();
  const { state, dispatch, runAnalysis } = useAnalysis();
  const { wizardState, isProcessing } = state;

  useEffect(() => {
    if (!wizardState) {
      navigate('/');
    }
  }, [wizardState, navigate]);

  if (!wizardState) return null;

  const { currentQuestionIndex, questionsConfig } = wizardState;
  const currentConfig = questionsConfig[currentQuestionIndex];
  const completedCount = questionsConfig.filter(q => q.isComplete).length;
  const progress = (completedCount / questionsConfig.length) * 100;

  const validateCurrentQuestion = (): boolean => {
    const analysisType = ANALYSIS_TYPES[currentConfig.analysisCode];
    if (!analysisType) return true;

    // Check required parameters
    return analysisType.parameters.every(param => {
      if (!param.required) return true;
      const value = currentConfig.parameters[param.name];
      if (param.type === 'tags') return Array.isArray(value) && value.length > 0;
      return value !== undefined && value !== '';
    });
  };

  const handleNext = () => {
    // Mark current as complete
    dispatch({
      type: 'UPDATE_WIZARD_QUESTION',
      payload: { index: currentQuestionIndex, config: { isComplete: true } },
    });

    if (currentQuestionIndex < questionsConfig.length - 1) {
      dispatch({ type: 'SET_WIZARD_INDEX', payload: currentQuestionIndex + 1 });
    } else {
      // Last question - go to review
      navigate('/review');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      dispatch({ type: 'SET_WIZARD_INDEX', payload: currentQuestionIndex - 1 });
    }
  };

  const handleSelectQuestion = (index: number) => {
    dispatch({ type: 'SET_WIZARD_INDEX', payload: index });
  };

  const handleUpdateParameters = (parameters: Record<string, any>) => {
    dispatch({
      type: 'UPDATE_WIZARD_QUESTION',
      payload: { index: currentQuestionIndex, config: { parameters } },
    });
  };

  const handleCancel = () => {
    dispatch({ type: 'CLEAR_WIZARD' });
    navigate('/');
  };

  const isValid = validateCurrentQuestion();
  const isLastQuestion = currentQuestionIndex === questionsConfig.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Configuración del Análisis
              </h1>
              <p className="text-sm text-muted-foreground">
                Pregunta {currentQuestionIndex + 1} de {questionsConfig.length}
              </p>
            </div>
            <Button variant="ghost" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
          <Progress value={progress} className="mt-3 h-1" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <WizardSidebar
            questions={questionsConfig}
            currentIndex={currentQuestionIndex}
            onSelectQuestion={handleSelectQuestion}
          />
        </div>

        {/* Step Content */}
        <WizardStep
          config={currentConfig}
          totalQuestions={questionsConfig.length}
          currentIndex={currentQuestionIndex}
          onUpdateParameters={handleUpdateParameters}
        />
      </div>

      {/* Footer Navigation */}
      <footer className="sticky bottom-0 border-t border-border bg-card p-4">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="hidden sm:flex items-center gap-1">
            {questionsConfig.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === currentQuestionIndex
                    ? 'bg-primary'
                    : questionsConfig[i].isComplete
                      ? 'bg-success'
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={!isValid}
            className="gap-2 gradient-primary"
          >
            {isLastQuestion ? (
              <>
                Revisar
                <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}

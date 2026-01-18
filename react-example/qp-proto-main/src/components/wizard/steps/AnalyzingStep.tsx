import { useEffect, useState } from "react";
import { Loader2, Brain, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyzingStepProps {
  totalAnswers: number;
  onComplete: () => void;
}

const ANALYSIS_STEPS = [
  { id: 1, label: "Procesando respuestas", duration: 800 },
  { id: 2, label: "Extrayendo conceptos clave", duration: 1200 },
  { id: 3, label: "Mapeando verbatims", duration: 1000 },
  { id: 4, label: "Generando resumen", duration: 800 },
];

export function AnalyzingStep({ totalAnswers, onComplete }: AnalyzingStepProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const runStep = (stepIndex: number) => {
      if (stepIndex >= ANALYSIS_STEPS.length) {
        // All steps complete
        setTimeout(onComplete, 500);
        return;
      }

      setCurrentStep(stepIndex);
      
      timeout = setTimeout(() => {
        setCompletedSteps(prev => [...prev, stepIndex]);
        runStep(stepIndex + 1);
      }, ANALYSIS_STEPS[stepIndex].duration);
    };

    runStep(0);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="max-w-md w-full text-center">
        {/* Animated icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-primary/30 rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
              <Brain className="w-10 h-10 text-primary-foreground animate-pulse" />
            </div>
          </div>
          {/* Sparkles */}
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-bounce" />
          <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-primary/60 animate-bounce delay-100" />
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Analizando con IA
        </h2>
        <p className="text-muted-foreground mb-8">
          Procesando {totalAnswers} respuestas...
        </p>

        {/* Progress steps */}
        <div className="space-y-3 text-left">
          {ANALYSIS_STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = currentStep === index && !isCompleted;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
                  isCompleted && "bg-emerald-500/10",
                  isCurrent && "bg-primary/10"
                )}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm transition-colors",
                    isCompleted && "text-emerald-600 font-medium",
                    isCurrent && "text-foreground font-medium",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

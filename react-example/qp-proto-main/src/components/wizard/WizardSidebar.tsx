import { Check, Circle, Loader2 } from "lucide-react";
import { QuestionConfig, ANALYSIS_TYPES } from "@/types/analysis";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WizardSidebarProps {
  questions: QuestionConfig[];
  currentIndex: number;
  onSelectQuestion: (index: number) => void;
}

export function WizardSidebar({ questions, currentIndex, onSelectQuestion }: WizardSidebarProps) {
  return (
    <div className="w-64 border-r border-border bg-secondary/30 flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Preguntas</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {questions.filter(q => q.isComplete).length} de {questions.length} completadas
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {questions.map((question, index) => {
            const analysisType = ANALYSIS_TYPES[question.analysisCode];
            const isActive = index === currentIndex;
            const isComplete = question.isComplete;
            
            return (
              <button
                key={question.questionId}
                onClick={() => onSelectQuestion(index)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all",
                  "hover:bg-secondary",
                  isActive && "bg-primary/10 border border-primary/20"
                )}
              >
                {/* Status Icon */}
                <div className={cn(
                  "flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  isComplete 
                    ? "bg-success text-success-foreground" 
                    : isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                )}>
                  {isComplete ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : isActive ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                {/* Question Info */}
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {question.questionId}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {analysisType?.name || question.analysisCode}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

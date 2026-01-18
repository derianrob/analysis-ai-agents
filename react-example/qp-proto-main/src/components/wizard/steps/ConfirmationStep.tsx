import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageSquare, List, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationStepProps {
  question: string;
  answers: string[];
  onConfirm: () => void;
  onBack: () => void;
}

export function ConfirmationStep({ question, answers, onConfirm, onBack }: ConfirmationStepProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border bg-muted/30">
        <h2 className="text-xl font-semibold mb-1">Confirmar datos</h2>
        <p className="text-muted-foreground">
          Revisa la información antes de continuar con el análisis de IA
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Question Card */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pregunta detectada
                </span>
                <p className="mt-1 text-lg font-medium text-foreground">
                  {question}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {answers.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Respuestas a analizar
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <div className="text-3xl font-bold text-emerald-500 mb-1">
                ≈ {Math.ceil(answers.length / 3)}s
              </div>
              <div className="text-sm text-muted-foreground">
                Tiempo estimado
              </div>
            </div>
          </div>

          {/* Answers Preview */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <List className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">Vista previa de respuestas</span>
            </div>
            <div className="max-h-64 overflow-auto">
              {answers.map((answer, index) => (
                <div
                  key={index}
                  className={cn(
                    "px-4 py-3 flex gap-3 text-sm",
                    index !== answers.length - 1 && "border-b border-border"
                  )}
                >
                  <span className="text-muted-foreground font-mono text-xs w-6 flex-shrink-0">
                    {index + 1}.
                  </span>
                  <span className="text-foreground">{answer}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Info */}
          <div className="rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">
                  El análisis de IA extraerá:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Lista global de conceptos (verbatims) mencionados</li>
                  <li>• Mapeo de conceptos por cada respuesta</li>
                  <li>• Resumen ejecutivo de hallazgos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-background flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver a editar
        </Button>
        <Button onClick={onConfirm} className="gap-2">
          Iniciar análisis de IA
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

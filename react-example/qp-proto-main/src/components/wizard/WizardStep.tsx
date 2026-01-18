import { QuestionConfig, ANALYSIS_TYPES, AnalysisParameter } from "@/types/analysis";
import { ParameterInput } from "./ParameterInput";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, MessageSquare } from "lucide-react";
import { useState } from "react";

interface WizardStepProps {
  config: QuestionConfig;
  totalQuestions: number;
  currentIndex: number;
  onUpdateParameters: (parameters: Record<string, any>) => void;
}

export function WizardStep({ 
  config, 
  totalQuestions, 
  currentIndex, 
  onUpdateParameters 
}: WizardStepProps) {
  const [answersOpen, setAnswersOpen] = useState(false);
  const analysisType = ANALYSIS_TYPES[config.analysisCode];

  const handleParameterChange = (paramName: string, value: any) => {
    onUpdateParameters({
      ...config.parameters,
      [paramName]: value,
    });
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>Pregunta {currentIndex + 1} de {totalQuestions}</span>
          <Badge variant="outline">{config.analysisCode}</Badge>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {config.questionText}
        </h2>
        <p className="text-sm text-muted-foreground">
          {config.answers.length} respuestas asociadas
        </p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-2xl space-y-6">
          {/* Answers Preview */}
          <Collapsible open={answersOpen} onOpenChange={setAnswersOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">
                        Respuestas ({config.answers.length})
                      </CardTitle>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${answersOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {config.answers.map((answer, i) => (
                      <div 
                        key={i} 
                        className="p-3 rounded-lg bg-secondary/50 text-sm text-foreground"
                      >
                        {answer}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Analysis Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  📊
                </div>
                <div>
                  <CardTitle className="text-base">
                    {analysisType?.name || config.analysisCode}
                  </CardTitle>
                  <CardDescription>
                    {analysisType?.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {analysisType?.parameters.map((param: AnalysisParameter) => (
                <ParameterInput
                  key={param.name}
                  parameter={param}
                  value={config.parameters[param.name]}
                  onChange={(value) => handleParameterChange(param.name, value)}
                />
              ))}

              {!analysisType && (
                <p className="text-sm text-muted-foreground">
                  Tipo de análisis no reconocido: {config.analysisCode}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}

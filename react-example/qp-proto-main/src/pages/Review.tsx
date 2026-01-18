import { useNavigate } from "react-router-dom";
import { ChevronLeft, Play, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysis } from "@/context/AnalysisContext";
import { useEffect } from "react";
import { ANALYSIS_TYPES } from "@/types/analysis";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Review() {
  const navigate = useNavigate();
  const { state, dispatch, runAnalysis } = useAnalysis();
  const { wizardState, isProcessing, currentFile } = state;

  useEffect(() => {
    if (!wizardState) {
      navigate('/');
    }
  }, [wizardState, navigate]);

  if (!wizardState) return null;

  const { questionsConfig } = wizardState;

  const handleEditQuestion = (index: number) => {
    dispatch({ type: 'SET_WIZARD_INDEX', payload: index });
    navigate('/wizard');
  };

  const handleRunAnalysis = async () => {
    await runAnalysis();
    const projectId = state.currentProject?.id || `proj_${Date.now()}`;
    dispatch({ type: 'CLEAR_WIZARD' });
    navigate(`/project/${projectId}`);
  };

  const handleBack = () => {
    navigate('/wizard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Revisar Configuración
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentFile?.name} • {questionsConfig.length} preguntas
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-4 pr-4">
            {questionsConfig.map((config, index) => {
              const analysisType = ANALYSIS_TYPES[config.analysisCode];
              return (
                <Card key={config.questionId} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {config.questionId}
                          </Badge>
                          <Badge className="text-xs bg-primary/10 text-primary border-0">
                            {config.analysisCode}
                          </Badge>
                        </div>
                        <CardTitle className="text-base font-medium">
                          {config.questionText}
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditQuestion(index)}
                        className="shrink-0"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <p className="text-sm font-medium text-foreground mb-3">
                        {analysisType?.name || config.analysisCode}
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {Object.entries(config.parameters).map(([key, value]) => {
                          const param = analysisType?.parameters.find(p => p.name === key);
                          const displayValue = Array.isArray(value) 
                            ? value.join(', ') || 'Ninguno'
                            : value?.toString() || 'N/A';
                          return (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground">
                                {param?.label || key}:
                              </span>
                              <span className="font-medium text-foreground truncate max-w-[150px]">
                                {displayValue}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {config.answers.length} respuestas para analizar
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={handleRunAnalysis}
            disabled={isProcessing}
            className="gap-2 gradient-primary px-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Ejecutar Análisis
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}

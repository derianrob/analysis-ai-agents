import { BarChart3, FileUp, Settings, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateFirst: () => void;
}

export function EmptyState({ onCreateFirst }: EmptyStateProps) {
  const steps = [
    {
      icon: FileUp,
      title: "Sube un archivo",
      description: "Carga tu JSON con preguntas y respuestas",
    },
    {
      icon: Settings,
      title: "Configura el análisis",
      description: "Ajusta los parámetros para cada pregunta",
    },
    {
      icon: TrendingUp,
      title: "Visualiza resultados",
      description: "Obtén insights con gráficos interactivos",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <BarChart3 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3">
          ¡Bienvenido al Sistema de Análisis!
        </h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Aún no tienes ningún análisis. Comienza subiendo tu primer archivo de preguntas y respuestas.
        </p>
      </div>

      {/* CTA Button */}
      <Button 
        onClick={onCreateFirst} 
        size="lg" 
        className="gap-2 gradient-primary shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6 mb-16"
      >
        <Plus className="h-5 w-5" />
        Crear tu primer análisis
      </Button>

      {/* How it works */}
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            ¿Cómo funciona?
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border shadow-card"
            >
              {/* Step number */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {index + 1}
              </div>
              
              {/* Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
                <step.icon className="h-6 w-6" />
              </div>
              
              {/* Content */}
              <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

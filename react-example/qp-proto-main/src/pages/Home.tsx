import { useNavigate } from "react-router-dom";
import { BarChart3, Sparkles, FileSpreadsheet, Zap } from "lucide-react";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TEMPLATES } from "@/types/concepts";

export default function Home() {
  const navigate = useNavigate();

  const handleTemplateClick = (templateId: string) => {
    if (templateId === 'single-question') {
      navigate('/wizard/single-question');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">QP Research</h1>
              <p className="text-xs text-muted-foreground">Análisis de insights</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Análisis potenciado con IA
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 max-w-3xl mx-auto leading-tight">
            Transforma respuestas abiertas en{" "}
            <span className="text-primary">insights accionables</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Selecciona una plantilla de análisis para comenzar. Nuestra IA extraerá 
            conceptos clave y te ayudará a visualizar patrones en tus datos.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-16 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileSpreadsheet className="w-4 h-4 text-primary" />
              Pega datos desde Excel
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-4 h-4 text-primary" />
              Análisis instantáneo
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BarChart3 className="w-4 h-4 text-primary" />
              Visualización de frecuencias
            </div>
          </div>
        </div>
      </section>

      {/* Templates section */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              Plantillas de análisis
            </h3>
            <p className="text-muted-foreground">
              Selecciona el tipo de análisis que necesitas realizar
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid gap-4">
            {TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={() => handleTemplateClick(template.id)}
              />
            ))}

            {/* Coming soon placeholder */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-border bg-muted/30 text-center">
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-muted-foreground mb-1">
                Más plantillas próximamente
              </h4>
              <p className="text-sm text-muted-foreground/70">
                Análisis comparativo, tracking de marca, y más
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 QP Research. Herramienta de análisis de insights.</p>
        </div>
      </footer>
    </div>
  );
}

import { Search, Plus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAnalysis } from "@/context/AnalysisContext";

interface HeaderProps {
  onNewAnalysis: () => void;
}

export function Header({ onNewAnalysis }: HeaderProps) {
  const { state, dispatch } = useAnalysis();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">
                Sistema de Análisis Q&A
              </h1>
              <p className="text-xs text-muted-foreground">
                Analiza preguntas y respuestas
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar análisis..."
              value={state.searchQuery}
              onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
              className="pl-10 bg-secondary/50 border-transparent focus:border-primary focus:bg-card"
            />
          </div>

          {/* Actions */}
          <Button onClick={onNewAnalysis} className="gap-2 gradient-primary shadow-md hover:shadow-lg transition-shadow">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Análisis</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

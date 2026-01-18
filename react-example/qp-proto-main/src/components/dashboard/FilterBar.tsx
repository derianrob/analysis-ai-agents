import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnalysis } from "@/context/AnalysisContext";
import { FilterBy, SortBy } from "@/types/analysis";

interface FilterBarProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalProjects: number;
}

export function FilterBar({ viewMode, onViewModeChange, totalProjects }: FilterBarProps) {
  const { state, dispatch } = useAnalysis();

  const handleFilterChange = (value: string) => {
    dispatch({ type: 'SET_FILTER', payload: value as FilterBy });
  };

  const handleSortChange = (value: string) => {
    dispatch({ type: 'SET_SORT', payload: value as SortBy });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {totalProjects} análisis
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Filter by status */}
        <Select value={state.filterBy} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="completed">Completados</SelectItem>
            <SelectItem value="in_progress">En proceso</SelectItem>
            <SelectItem value="error">Con errores</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort by */}
        <Select value={state.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Fecha</SelectItem>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="questions">Preguntas</SelectItem>
          </SelectContent>
        </Select>

        {/* View mode toggle */}
        <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => onViewModeChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

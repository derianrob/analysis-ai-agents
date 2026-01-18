import { useState } from "react";
import { 
  Eye, 
  Plus, 
  Pencil, 
  Trash2, 
  Download, 
  MoreVertical,
  FileText,
  Calendar,
  BarChart2
} from "lucide-react";
import { AnalysisProject, ANALYSIS_TYPES } from "@/types/analysis";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AnalysisCardProps {
  project: AnalysisProject;
  onView: (project: AnalysisProject) => void;
  onAddFile: (project: AnalysisProject) => void;
  onRename: (project: AnalysisProject) => void;
  onDelete: (project: AnalysisProject) => void;
  onDownload: (project: AnalysisProject) => void;
}

export function AnalysisCard({
  project,
  onView,
  onAddFile,
  onRename,
  onDelete,
  onDownload,
}: AnalysisCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  // Get first 3 analysis types for preview
  const analysisPreview = project.analysisTypes.slice(0, 3);

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-card p-5 transition-all duration-300",
        "hover:shadow-card-hover hover:border-primary/20",
        isHovered && "shadow-card-hover border-primary/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BarChart2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate" title={project.name}>
              {project.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(project.updatedAt)}
            </div>
          </div>
        </div>
        
        {/* Status Badge */}
        <StatusBadge status={project.status} size="sm" />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{project.sourceFiles.length} archivo{project.sourceFiles.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="font-medium text-foreground">{project.totalQuestions}</span>
          <span>preguntas</span>
        </div>
      </div>

      {/* Analysis Types Preview */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {analysisPreview.map((code) => {
          const type = ANALYSIS_TYPES[code];
          return (
            <span
              key={code}
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
              title={type?.name}
            >
              {code}
            </span>
          );
        })}
        {project.analysisTypes.length > 3 && (
          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
            +{project.analysisTypes.length - 3}
          </span>
        )}
      </div>

      {/* Source Files Preview */}
      <div className="text-xs text-muted-foreground truncate mb-4">
        {project.sourceFiles.slice(0, 2).join(', ')}
        {project.sourceFiles.length > 2 && ` +${project.sourceFiles.length - 2} más`}
      </div>

      {/* Actions */}
      <div className={cn(
        "flex items-center gap-2 pt-4 border-t border-border transition-opacity duration-200",
        isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => onView(project)}
        >
          <Eye className="h-3.5 w-3.5" />
          Ver
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => onAddFile(project)}
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onRename(project)}>
              <Pencil className="mr-2 h-4 w-4" />
              Renombrar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(project)}>
              <Download className="mr-2 h-4 w-4" />
              Descargar JSON
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(project)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

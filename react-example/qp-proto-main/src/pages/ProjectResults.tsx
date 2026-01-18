import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Download, Plus, Pencil, FileText, Calendar, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResultsView } from "@/components/results/ResultsView";
import { useAnalysis } from "@/context/AnalysisContext";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUploader } from "@/components/upload/FileUploader";
import { UploadedFile } from "@/types/analysis";

export default function ProjectResults() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, initializeWizard } = useAnalysis();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const project = state.projects.find(p => p.id === projectId) || state.currentProject;

  useEffect(() => {
    if (!project) {
      navigate('/');
    } else {
      setEditedName(project.name);
    }
  }, [project, navigate]);

  if (!project) return null;

  const handleBack = () => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: null });
    navigate('/');
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      dispatch({
        type: 'UPDATE_PROJECT',
        payload: { ...project, name: editedName.trim(), updatedAt: new Date() },
      });
      setIsEditing(false);
      toast.success("Nombre actualizado");
    }
  };

  const handleDownload = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const data = JSON.stringify(project, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    toast.success("Archivo descargado");
  };

  const handleAddFile = (file: UploadedFile) => {
    setUploadOpen(false);
    initializeWizard(file, project);
    navigate('/wizard');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="max-w-xs"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveName}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold text-foreground truncate">
                      {project.name}
                    </h1>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="shrink-0 h-7 w-7"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <StatusBadge status={project.status} size="sm" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownload('json')}
                className="gap-1.5"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Descargar</span>
              </Button>
              <Button 
                size="sm"
                onClick={() => setUploadOpen(true)}
                className="gap-1.5 gradient-primary"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Agregar Archivo</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Metadata */}
      <div className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Actualizado: {formatDate(project.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{project.sourceFiles.length} archivo{project.sourceFiles.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">{project.totalQuestions}</span> preguntas analizadas
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="container mx-auto px-4 py-8">
        {project.results && project.results.length > 0 ? (
          <ResultsView results={project.results} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay resultados disponibles</p>
          </div>
        )}
      </main>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar Archivo</DialogTitle>
          </DialogHeader>
          <FileUploader
            onFileAccepted={handleAddFile}
            existingProjectName={project.name}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

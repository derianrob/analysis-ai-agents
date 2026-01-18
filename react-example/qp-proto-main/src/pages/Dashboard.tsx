import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { AnalysisCard } from "@/components/dashboard/AnalysisCard";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { FileUploader } from "@/components/upload/FileUploader";
import { useAnalysis } from "@/context/AnalysisContext";
import { AnalysisProject, UploadedFile } from "@/types/analysis";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { state, dispatch, getFilteredProjects, initializeWizard } = useAnalysis();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteProject, setDeleteProject] = useState<AnalysisProject | null>(null);
  const [renameProject, setRenameProject] = useState<AnalysisProject | null>(null);
  const [newName, setNewName] = useState("");
  const [targetProject, setTargetProject] = useState<AnalysisProject | null>(null);

  const filteredProjects = getFilteredProjects();

  const handleNewAnalysis = () => {
    setTargetProject(null);
    setUploadOpen(true);
  };

  const handleAddFile = (project: AnalysisProject) => {
    setTargetProject(project);
    setUploadOpen(true);
  };

  const handleFileAccepted = (file: UploadedFile) => {
    setUploadOpen(false);
    initializeWizard(file, targetProject || undefined);
    navigate('/wizard');
  };

  const handleView = (project: AnalysisProject) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
    navigate(`/project/${project.id}`);
  };

  const handleDelete = () => {
    if (deleteProject) {
      dispatch({ type: 'DELETE_PROJECT', payload: deleteProject.id });
      toast.success("Proyecto eliminado correctamente");
      setDeleteProject(null);
    }
  };

  const handleRename = () => {
    if (renameProject && newName.trim()) {
      dispatch({
        type: 'UPDATE_PROJECT',
        payload: { ...renameProject, name: newName.trim(), updatedAt: new Date() },
      });
      toast.success("Proyecto renombrado");
      setRenameProject(null);
      setNewName("");
    }
  };

  const handleDownload = (project: AnalysisProject) => {
    const data = JSON.stringify(project, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Archivo descargado");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNewAnalysis={handleNewAnalysis} />

      <main className="container mx-auto px-4 py-8">
        {filteredProjects.length === 0 && !state.searchQuery ? (
          <EmptyState onCreateFirst={handleNewAnalysis} />
        ) : (
          <>
            <FilterBar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalProjects={filteredProjects.length}
            />

            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No se encontraron resultados para "{state.searchQuery}"
                </p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {filteredProjects.map((project, index) => (
                  <div 
                    key={project.id} 
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <AnalysisCard
                      project={project}
                      onView={handleView}
                      onAddFile={handleAddFile}
                      onRename={(p) => {
                        setRenameProject(p);
                        setNewName(p.name);
                      }}
                      onDelete={setDeleteProject}
                      onDownload={handleDownload}
                    />
                  </div>
                ))}
                
                {/* Add new card */}
                <button
                  onClick={handleNewAnalysis}
                  className="flex flex-col items-center justify-center min-h-[220px] rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-secondary/50 transition-all text-muted-foreground hover:text-primary"
                >
                  <Plus className="h-10 w-10 mb-2" />
                  <span className="font-medium">Crear Nuevo Análisis</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {targetProject ? "Agregar Archivo" : "Nuevo Análisis"}
            </DialogTitle>
          </DialogHeader>
          <FileUploader
            onFileAccepted={handleFileAccepted}
            existingProjectName={targetProject?.name}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProject} onOpenChange={() => setDeleteProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este análisis?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los resultados
              asociados a "{deleteProject?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameProject} onOpenChange={() => setRenameProject(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renombrar Análisis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre del análisis"
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRenameProject(null)}>
                Cancelar
              </Button>
              <Button onClick={handleRename} disabled={!newName.trim()}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

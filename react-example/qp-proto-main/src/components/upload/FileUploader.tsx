import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileJson, AlertCircle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadedFile, QuestionData, ANALYSIS_TYPES } from "@/types/analysis";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFileAccepted: (file: UploadedFile) => void;
  existingProjectName?: string;
}

interface ParsedPreview {
  isValid: boolean;
  fileName: string;
  questionsCount: number;
  analysisSummary: { code: string; count: number }[];
  error?: string;
}

export function FileUploader({ onFileAccepted, existingProjectName }: FileUploaderProps) {
  const [preview, setPreview] = useState<ParsedPreview | null>(null);
  const [parsedFile, setParsedFile] = useState<UploadedFile | null>(null);

  const parseFile = async (file: File): Promise<{ preview: ParsedPreview; parsed?: UploadedFile }> => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      // Validate structure
      if (!json.questions || !Array.isArray(json.questions)) {
        return {
          preview: {
            isValid: false,
            fileName: file.name,
            questionsCount: 0,
            analysisSummary: [],
            error: 'El archivo debe contener un array "questions"',
          },
        };
      }

      const questions: QuestionData[] = json.questions;
      
      // Validate each question has required fields
      const invalidQuestions = questions.filter(
        q => !q.id || !q.text || !q.analysis_code || !Array.isArray(q.answers)
      );

      if (invalidQuestions.length > 0) {
        return {
          preview: {
            isValid: false,
            fileName: file.name,
            questionsCount: questions.length,
            analysisSummary: [],
            error: `${invalidQuestions.length} preguntas tienen formato inválido`,
          },
        };
      }

      // Count analysis types
      const analysisCount: Record<string, number> = {};
      questions.forEach(q => {
        analysisCount[q.analysis_code] = (analysisCount[q.analysis_code] || 0) + 1;
      });

      const analysisSummary = Object.entries(analysisCount).map(([code, count]) => ({
        code,
        count,
      }));

      const uploadedFile: UploadedFile = {
        id: `file_${Date.now()}`,
        name: file.name,
        metadata: json.metadata,
        questions,
        uploadedAt: new Date(),
      };

      return {
        preview: {
          isValid: true,
          fileName: file.name,
          questionsCount: questions.length,
          analysisSummary,
        },
        parsed: uploadedFile,
      };
    } catch (e) {
      return {
        preview: {
          isValid: false,
          fileName: file.name,
          questionsCount: 0,
          analysisSummary: [],
          error: 'Error al parsear el archivo JSON',
        },
      };
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const result = await parseFile(file);
    setPreview(result.preview);
    if (result.parsed) {
      setParsedFile(result.parsed);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    maxFiles: 1,
  });

  const handleClear = () => {
    setPreview(null);
    setParsedFile(null);
  };

  const handleContinue = () => {
    if (parsedFile) {
      onFileAccepted(parsedFile);
    }
  };

  return (
    <div className="space-y-6">
      {existingProjectName && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <p className="text-sm text-primary">
            <span className="font-medium">Agregando archivo a:</span> {existingProjectName}
          </p>
        </div>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-secondary/50",
          preview && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className={cn(
          "flex h-16 w-16 items-center justify-center rounded-2xl mb-4 transition-colors",
          isDragActive ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
        )}>
          {isDragActive ? (
            <FileJson className="h-8 w-8" />
          ) : (
            <Upload className="h-8 w-8" />
          )}
        </div>

        <p className="text-center text-foreground font-medium mb-1">
          {isDragActive ? "Suelta el archivo aquí" : "Arrastra tu archivo aquí"}
        </p>
        <p className="text-sm text-muted-foreground">
          o haz clic para seleccionar
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Formato soportado: JSON
        </p>
      </div>

      {/* Preview */}
      {preview && (
        <div className={cn(
          "rounded-xl border p-5 animate-scale-in",
          preview.isValid ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
        )}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                preview.isValid ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              )}>
                {preview.isValid ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {preview.isValid ? "Archivo válido" : "Archivo inválido"}
                </p>
                <p className="text-sm text-muted-foreground">{preview.fileName}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {preview.isValid ? (
            <>
              <div className="mb-4 p-3 rounded-lg bg-card">
                <p className="text-sm font-medium text-foreground mb-2">
                  📊 {preview.questionsCount} preguntas detectadas
                </p>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground mb-2">Análisis requeridos:</p>
                  {preview.analysisSummary.map(({ code, count }) => (
                    <div key={code} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        • {ANALYSIS_TYPES[code]?.name || code}
                      </span>
                      <span className="font-medium text-foreground">
                        {count} pregunta{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleContinue} className="w-full gradient-primary">
                Iniciar Configuración
              </Button>
            </>
          ) : (
            <div className="p-3 rounded-lg bg-card">
              <p className="text-sm text-destructive">{preview.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

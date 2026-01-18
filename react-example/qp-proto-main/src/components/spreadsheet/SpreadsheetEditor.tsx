import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, HelpCircle, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { EXAMPLE_DATA } from "@/types/concepts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SpreadsheetEditorProps {
  onConfirm: (question: string, answers: string[]) => void;
}

interface CellSelection {
  type: 'question' | 'answer' | null;
  row: number | null;
}

export function SpreadsheetEditor({ onConfirm }: SpreadsheetEditorProps) {
  // Initialize with example data
  const [cells, setCells] = useState<string[]>(() => [
    EXAMPLE_DATA.question,
    ...EXAMPLE_DATA.answers,
  ]);
  
  const [questionRow, setQuestionRow] = useState<number | null>(0);
  const [answerRows, setAnswerRows] = useState<Set<number>>(
    new Set(EXAMPLE_DATA.answers.map((_, i) => i + 1))
  );
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  const handleCellChange = (index: number, value: string) => {
    const newCells = [...cells];
    newCells[index] = value;
    setCells(newCells);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Move to next cell
      if (index < cells.length - 1) {
        setActiveCell(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (index < cells.length - 1) {
        setActiveCell(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index > 0) {
        setActiveCell(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const toggleQuestionSelection = (index: number) => {
    if (questionRow === index) {
      setQuestionRow(null);
    } else {
      setQuestionRow(index);
      // Remove from answers if it was there
      const newAnswerRows = new Set(answerRows);
      newAnswerRows.delete(index);
      setAnswerRows(newAnswerRows);
    }
  };

  const toggleAnswerSelection = (index: number) => {
    if (index === questionRow) return; // Can't be both
    
    const newAnswerRows = new Set(answerRows);
    if (newAnswerRows.has(index)) {
      newAnswerRows.delete(index);
    } else {
      newAnswerRows.add(index);
    }
    setAnswerRows(newAnswerRows);
  };

  const addRow = () => {
    setCells([...cells, '']);
  };

  const deleteRow = (index: number) => {
    if (cells.length <= 2) return; // Keep at least 2 rows
    
    const newCells = cells.filter((_, i) => i !== index);
    setCells(newCells);
    
    // Adjust selections
    if (questionRow === index) {
      setQuestionRow(null);
    } else if (questionRow !== null && questionRow > index) {
      setQuestionRow(questionRow - 1);
    }
    
    const newAnswerRows = new Set<number>();
    answerRows.forEach(row => {
      if (row !== index) {
        newAnswerRows.add(row > index ? row - 1 : row);
      }
    });
    setAnswerRows(newAnswerRows);
  };

  const handleConfirm = () => {
    if (questionRow === null || answerRows.size === 0) return;
    
    const question = cells[questionRow];
    const answers = Array.from(answerRows)
      .sort((a, b) => a - b)
      .map(i => cells[i])
      .filter(a => a.trim() !== '');
    
    if (question.trim() && answers.length > 0) {
      onConfirm(question, answers);
    }
  };

  const isValid = questionRow !== null && answerRows.size > 0 && 
    cells[questionRow]?.trim() !== '' &&
    Array.from(answerRows).some(i => cells[i]?.trim() !== '');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Editor de datos</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <HelpCircle className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Pega o edita tus datos. Usa los botones de la izquierda para marcar cuál es la pregunta (P) y cuáles son las respuestas (R).</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">P</span>
              Pregunta
            </span>
            <span className="flex items-center gap-1">
              <span className="w-6 h-6 rounded bg-emerald-500 text-white flex items-center justify-center text-xs font-medium">R</span>
              Respuestas
            </span>
          </div>
        </div>
      </div>

      {/* Spreadsheet */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[600px]">
          {/* Column headers */}
          <div className="flex items-center border-b border-border bg-muted/50 sticky top-0 z-10">
            <div className="w-12 p-2 text-center text-xs font-medium text-muted-foreground border-r border-border">
              #
            </div>
            <div className="w-14 p-2 text-center text-xs font-medium text-muted-foreground border-r border-border">
              Tipo
            </div>
            <div className="flex-1 p-2 text-xs font-medium text-muted-foreground">
              Contenido
            </div>
            <div className="w-12 p-2 text-center text-xs font-medium text-muted-foreground">
              
            </div>
          </div>

          {/* Rows */}
          {cells.map((cell, index) => {
            const isQuestion = questionRow === index;
            const isAnswer = answerRows.has(index);
            
            return (
              <div
                key={index}
                className={cn(
                  "flex items-stretch border-b border-border transition-colors",
                  isQuestion && "bg-primary/5",
                  isAnswer && "bg-emerald-500/5",
                  activeCell === index && "ring-2 ring-inset ring-primary/50"
                )}
              >
                {/* Row number */}
                <div className="w-12 p-2 text-center text-xs text-muted-foreground border-r border-border flex items-center justify-center">
                  {index + 1}
                </div>
                
                {/* Type toggles */}
                <div className="w-14 p-1 border-r border-border flex items-center justify-center gap-1">
                  <button
                    onClick={() => toggleQuestionSelection(index)}
                    className={cn(
                      "w-6 h-6 rounded text-xs font-medium transition-all",
                      isQuestion
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                    )}
                  >
                    P
                  </button>
                  <button
                    onClick={() => toggleAnswerSelection(index)}
                    disabled={isQuestion}
                    className={cn(
                      "w-6 h-6 rounded text-xs font-medium transition-all",
                      isAnswer
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-emerald-500/20 hover:text-emerald-600",
                      isQuestion && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    R
                  </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-0">
                  <textarea
                    ref={el => inputRefs.current[index] = el}
                    value={cell}
                    onChange={(e) => handleCellChange(index, e.target.value)}
                    onFocus={() => setActiveCell(index)}
                    onBlur={() => setActiveCell(null)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={cn(
                      "w-full h-full min-h-[44px] px-3 py-2 bg-transparent resize-none",
                      "focus:outline-none text-sm leading-relaxed",
                      "placeholder:text-muted-foreground/50"
                    )}
                    placeholder={index === 0 ? "Escribe la pregunta aquí..." : "Escribe una respuesta..."}
                    rows={1}
                    style={{ height: 'auto' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                  />
                </div>
                
                {/* Delete button */}
                <div className="w-12 p-1 flex items-center justify-center">
                  <button
                    onClick={() => deleteRow(index)}
                    disabled={cells.length <= 2}
                    className={cn(
                      "p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
                      cells.length <= 2 && "opacity-30 cursor-not-allowed"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          
          {/* Add row button */}
          <button
            onClick={addRow}
            className="w-full p-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar fila
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-background flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {questionRow !== null ? (
            <span className="text-foreground">1 pregunta seleccionada</span>
          ) : (
            <span className="text-amber-500">Selecciona una pregunta (P)</span>
          )}
          <span className="mx-2">•</span>
          {answerRows.size > 0 ? (
            <span className="text-foreground">{answerRows.size} respuestas seleccionadas</span>
          ) : (
            <span className="text-amber-500">Selecciona las respuestas (R)</span>
          )}
        </div>
        <Button
          onClick={handleConfirm}
          disabled={!isValid}
          className="gap-2"
        >
          <Check className="w-4 h-4" />
          Confirmar selección
        </Button>
      </div>
    </div>
  );
}

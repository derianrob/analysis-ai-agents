import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Plus,
  X,
  GripVertical,
  Edit2,
  Check,
  Trash2,
  Search,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConceptMapping } from "@/types/concepts";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConceptEditorProps {
  concepts: string[];
  mapping: ConceptMapping[];
  onSave: (concepts: string[], mapping: ConceptMapping[]) => void;
}

export function ConceptEditor({ concepts: initialConcepts, mapping: initialMapping, onSave }: ConceptEditorProps) {
  const [concepts, setConcepts] = useState<string[]>(initialConcepts);
  const [mapping, setMapping] = useState<ConceptMapping[]>(initialMapping);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingConcept, setEditingConcept] = useState<{ index: number; value: string } | null>(null);
  const [newConceptName, setNewConceptName] = useState("");
  const [draggedConcept, setDraggedConcept] = useState<string | null>(null);

  // Filter concepts based on search
  const filteredConcepts = concepts.filter(c =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update concept globally (in both concepts list and all mappings)
  const updateConceptGlobally = (oldName: string, newName: string) => {
    if (!newName.trim() || newName === oldName) {
      setEditingConcept(null);
      return;
    }

    // Update concepts list
    setConcepts(prev => prev.map(c => c === oldName ? newName : c));

    // Update all mappings
    setMapping(prev => prev.map(m => ({
      ...m,
      concepts: m.concepts.map(c => c === oldName ? newName : c)
    })));

    setEditingConcept(null);
  };

  // Delete concept globally
  const deleteConceptGlobally = (conceptName: string) => {
    setConcepts(prev => prev.filter(c => c !== conceptName));
    setMapping(prev => prev.map(m => ({
      ...m,
      concepts: m.concepts.filter(c => c !== conceptName)
    })));
  };

  // Remove concept from specific answer only
  const removeConceptFromAnswer = (answerIndex: number, conceptName: string) => {
    setMapping(prev => prev.map(m =>
      m.answer_index === answerIndex
        ? { ...m, concepts: m.concepts.filter(c => c !== conceptName) }
        : m
    ));
  };

  // Add new concept
  const addNewConcept = () => {
    if (!newConceptName.trim() || concepts.includes(newConceptName.trim())) {
      return;
    }
    setConcepts(prev => [...prev, newConceptName.trim()]);
    setNewConceptName("");
  };

  // Add concept to answer via drag & drop
  const handleDrop = (e: React.DragEvent, answerIndex: number) => {
    e.preventDefault();
    if (!draggedConcept) return;

    setMapping(prev => prev.map(m => {
      if (m.answer_index === answerIndex && !m.concepts.includes(draggedConcept)) {
        return { ...m, concepts: [...m.concepts, draggedConcept] };
      }
      return m;
    }));
    setDraggedConcept(null);
  };

  // Add concept to answer via click
  const addConceptToAnswer = (answerIndex: number, conceptName: string) => {
    setMapping(prev => prev.map(m => {
      if (m.answer_index === answerIndex && !m.concepts.includes(conceptName)) {
        return { ...m, concepts: [...m.concepts, conceptName] };
      }
      return m;
    }));
  };

  const handleSave = () => {
    onSave(concepts, mapping);
  };

  return (
    <div className="flex h-full">
      {/* Left column - Concepts list */}
      <div className="w-80 border-r border-border flex flex-col bg-muted/20">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm mb-3">Conceptos globales</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conceptos..."
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Add new concept */}
        <div className="p-3 border-b border-border">
          <div className="flex gap-2">
            <Input
              value={newConceptName}
              onChange={(e) => setNewConceptName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNewConcept()}
              placeholder="Nuevo concepto..."
              className="h-8 text-sm"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={addNewConcept}
              disabled={!newConceptName.trim()}
              className="h-8 px-2"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Concepts list */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConcepts.map((concept, index) => (
              <div
                key={`${concept}-${index}`}
                draggable
                onDragStart={() => setDraggedConcept(concept)}
                onDragEnd={() => setDraggedConcept(null)}
                className={cn(
                  "group flex items-center gap-2 p-2 rounded-lg cursor-grab",
                  "hover:bg-accent/50 transition-colors",
                  draggedConcept === concept && "opacity-50"
                )}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                
                {editingConcept?.index === index ? (
                  <div className="flex-1 flex items-center gap-1">
                    <Input
                      value={editingConcept.value}
                      onChange={(e) => setEditingConcept({ index, value: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') updateConceptGlobally(concept, editingConcept.value);
                        if (e.key === 'Escape') setEditingConcept(null);
                      }}
                      className="h-7 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => updateConceptGlobally(concept, editingConcept.value)}
                      className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-sm truncate">{concept}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingConcept({ index, value: concept })}
                        className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteConceptGlobally(concept)}
                        className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-border text-xs text-muted-foreground text-center">
          {concepts.length} conceptos • Arrastra para asignar
        </div>
      </div>

      {/* Right column - Answers with concepts */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Respuestas y conceptos asignados</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Arrastra conceptos de la izquierda o haz clic en + para asignarlos
            </p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Guardar y continuar
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {mapping.map((item) => (
              <div
                key={item.answer_index}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, item.answer_index)}
                className={cn(
                  "rounded-xl border border-border bg-card p-4 transition-all",
                  draggedConcept && "border-dashed border-primary/50 bg-primary/5"
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded flex-shrink-0">
                    #{item.answer_index}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[32px]">
                  {item.concepts.map((concept) => (
                    <Badge
                      key={concept}
                      variant="secondary"
                      className="gap-1 pr-1 bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      {concept}
                      <button
                        onClick={() => removeConceptFromAnswer(item.answer_index, concept)}
                        className="ml-1 p-0.5 rounded hover:bg-primary/20"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  
                  {/* Add concept dropdown trigger */}
                  <div className="relative group">
                    <button className="h-6 px-2 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      Agregar
                    </button>
                    
                    {/* Quick add dropdown */}
                    <div className="absolute left-0 top-full mt-1 z-20 hidden group-hover:block">
                      <div className="bg-popover border border-border rounded-lg shadow-lg p-2 max-h-48 overflow-auto w-48">
                        {concepts
                          .filter(c => !item.concepts.includes(c))
                          .slice(0, 10)
                          .map(concept => (
                            <button
                              key={concept}
                              onClick={() => addConceptToAnswer(item.answer_index, concept)}
                              className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-accent truncate"
                            >
                              {concept}
                            </button>
                          ))}
                        {concepts.filter(c => !item.concepts.includes(c)).length === 0 && (
                          <span className="text-xs text-muted-foreground px-2 py-1">
                            Todos asignados
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

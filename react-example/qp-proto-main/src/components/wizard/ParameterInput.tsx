import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { AnalysisParameter } from "@/types/analysis";
import { cn } from "@/lib/utils";

interface ParameterInputProps {
  parameter: AnalysisParameter;
  value: any;
  onChange: (value: any) => void;
}

export function ParameterInput({ parameter, value, onChange }: ParameterInputProps) {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() && !value.includes(tagInput.trim())) {
      onChange([...value, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter((tag: string) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  switch (parameter.type) {
    case "number":
      const isSlider = parameter.min !== undefined && parameter.max !== undefined;
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{parameter.label}</Label>
            <span className="text-sm font-medium text-primary">{value}</span>
          </div>
          {isSlider ? (
            <Slider
              value={[value]}
              onValueChange={([v]) => onChange(v)}
              min={parameter.min}
              max={parameter.max}
              step={parameter.max! <= 1 ? 0.1 : 1}
              className="py-2"
            />
          ) : (
            <Input
              type="number"
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              min={parameter.min}
              max={parameter.max}
            />
          )}
          {parameter.min !== undefined && parameter.max !== undefined && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{parameter.min}</span>
              <span>{parameter.max}</span>
            </div>
          )}
        </div>
      );

    case "select":
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{parameter.label}</Label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {parameter.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "es" ? "Español" : 
                   option === "en" ? "English" : 
                   option === "words" ? "Palabras" :
                   option === "chars" ? "Caracteres" :
                   option === "basic" ? "Básico" :
                   option === "advanced" ? "Avanzado" :
                   option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "tags":
      return (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {parameter.label}
            {parameter.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          
          {/* Tags display */}
          <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 rounded-lg border border-input bg-background">
            {value.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1 pr-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAddTag}
              placeholder="Escribe y presiona Enter..."
              className="flex-1 min-w-[150px] border-0 p-0 h-6 focus-visible:ring-0"
            />
          </div>
          
          <p className="text-xs text-muted-foreground">
            Presiona Enter para agregar cada elemento
          </p>
        </div>
      );

    case "text":
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{parameter.label}</Label>
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Ingresa ${parameter.label.toLowerCase()}`}
          />
        </div>
      );

    default:
      return null;
  }
}

import { ArrowRight, MessageSquareText, FileSpreadsheet, BarChart3, Tags } from "lucide-react";
import { Template } from "@/types/concepts";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  template: Template;
  onClick: () => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  MessageSquareText,
  FileSpreadsheet,
  BarChart3,
  Tags,
};

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  const Icon = iconMap[template.icon] || MessageSquareText;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full text-left p-6 rounded-2xl border border-border/50",
        "bg-card hover:bg-accent/5 transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30",
        "focus:outline-none focus:ring-2 focus:ring-primary/50"
      )}
    >
      {/* Icon with gradient background */}
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
        "bg-gradient-to-br shadow-lg",
        template.color
      )}>
        <Icon className="w-7 h-7 text-white" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {template.name}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {template.description}
      </p>

      {/* Arrow indicator */}
      <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Comenzar</span>
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Decorative gradient */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity",
        "bg-gradient-to-br pointer-events-none",
        template.color
      )} />
    </button>
  );
}

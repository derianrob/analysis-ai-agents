import { cn } from "@/lib/utils";
import { Check, Loader2, AlertCircle, Clock } from "lucide-react";

type Status = 'completed' | 'in_progress' | 'error' | 'pending';

interface StatusBadgeProps {
  status: Status;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig: Record<Status, { label: string; icon: React.ElementType; className: string }> = {
  completed: {
    label: 'Completado',
    icon: Check,
    className: 'bg-success/10 text-success border-success/20',
  },
  in_progress: {
    label: 'En proceso',
    icon: Loader2,
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  error: {
    label: 'Error',
    icon: AlertCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  pending: {
    label: 'Pendiente',
    icon: Clock,
    className: 'bg-muted text-muted-foreground border-border',
  },
};

export function StatusBadge({ status, className, showIcon = true, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === 'sm' ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        config.className,
        className
      )}
    >
      {showIcon && (
        <Icon 
          className={cn(
            size === 'sm' ? "h-3 w-3" : "h-4 w-4",
            status === 'in_progress' && "animate-spin"
          )} 
        />
      )}
      {config.label}
    </span>
  );
}

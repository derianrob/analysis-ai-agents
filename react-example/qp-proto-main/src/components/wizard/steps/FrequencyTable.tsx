import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Home, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConceptMapping } from "@/types/concepts";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface FrequencyTableProps {
  question: string;
  concepts: string[];
  mapping: ConceptMapping[];
  onBack: () => void;
  onGoHome: () => void;
}

export function FrequencyTable({ question, concepts, mapping, onBack, onGoHome }: FrequencyTableProps) {
  // Calculate frequency for each concept
  const frequencyData = useMemo(() => {
    const freq: Record<string, number> = {};
    
    // Initialize all concepts with 0
    concepts.forEach(c => freq[c] = 0);
    
    // Count occurrences in mapping
    mapping.forEach(m => {
      m.concepts.forEach(c => {
        freq[c] = (freq[c] || 0) + 1;
      });
    });
    
    // Convert to array and sort by frequency
    return Object.entries(freq)
      .map(([concept, count]) => ({
        concept,
        count,
        percentage: ((count / mapping.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);
  }, [concepts, mapping]);

  // Top 10 for chart
  const chartData = frequencyData.slice(0, 10);

  // Download as CSV
  const handleDownload = () => {
    const headers = ["Concepto", "Frecuencia", "Porcentaje"];
    const rows = frequencyData.map(d => [d.concept, d.count.toString(), `${d.percentage}%`]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "frecuencia_conceptos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--primary) / 0.9)",
    "hsl(var(--primary) / 0.8)",
    "hsl(var(--primary) / 0.7)",
    "hsl(var(--primary) / 0.6)",
    "hsl(var(--primary) / 0.5)",
    "hsl(var(--primary) / 0.4)",
    "hsl(var(--primary) / 0.35)",
    "hsl(var(--primary) / 0.3)",
    "hsl(var(--primary) / 0.25)",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">Tabla de frecuencias</h2>
            <p className="text-muted-foreground text-sm max-w-2xl">
              {question}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Total conceptos:</span>
            <span className="font-semibold">{concepts.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Respuestas analizadas:</span>
            <span className="font-semibold">{mapping.length}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Chart */}
        <div className="w-1/2 p-6 border-r border-border">
          <h3 className="text-sm font-medium mb-4">Top 10 conceptos más frecuentes</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="concept"
                  width={150}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.length > 20 ? value.slice(0, 20) + "..." : value}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} (${((value / mapping.length) * 100).toFixed(1)}%)`,
                    "Frecuencia"
                  ]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="text-sm font-medium">Tabla completa de frecuencias</h3>
          </div>
          <ScrollArea className="flex-1">
            <table className="w-full">
              <thead className="sticky top-0 bg-muted/50">
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Concepto
                  </th>
                  <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-24">
                    Frec.
                  </th>
                  <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-24">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {frequencyData.map((item, index) => (
                  <tr
                    key={item.concept}
                    className={cn(
                      "border-b border-border/50 hover:bg-muted/30 transition-colors",
                      index < 3 && "bg-primary/5"
                    )}
                  >
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        {index < 3 && (
                          <span className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white",
                            index === 0 && "bg-amber-500",
                            index === 1 && "bg-slate-400",
                            index === 2 && "bg-amber-700"
                          )}>
                            {index + 1}
                          </span>
                        )}
                        <span className={cn(index < 3 && "font-medium")}>
                          {item.concept}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-center font-mono">
                      {item.count}
                    </td>
                    <td className="p-3 text-sm text-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        parseFloat(item.percentage) >= 20
                          ? "bg-emerald-500/10 text-emerald-600"
                          : parseFloat(item.percentage) >= 10
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {item.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-background flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver a editar
        </Button>
        <Button onClick={onGoHome} className="gap-2">
          <Home className="w-4 h-4" />
          Ir al inicio
        </Button>
      </div>
    </div>
  );
}

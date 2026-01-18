import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface ClassificationChartProps {
  data: {
    distribution: Record<string, number>;
    categorizedAnswers: { answer: string; category: string; confidence: string }[];
  };
}

const COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(160, 84%, 39%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 67%, 58%)',
  'hsl(0, 84%, 60%)',
  'hsl(190, 90%, 50%)',
];

export function ClassificationChart({ data }: ClassificationChartProps) {
  const chartData = Object.entries(data.distribution).map(([category, count]) => ({
    category,
    count,
  }));

  return (
    <div className="space-y-6">
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis 
              dataKey="category" 
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Categorized answers preview */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">Respuestas categorizadas</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {data.categorizedAnswers.slice(0, 5).map((item, i) => (
            <div 
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
            >
              <span 
                className="shrink-0 px-2 py-0.5 rounded text-xs font-medium"
                style={{ 
                  backgroundColor: `${COLORS[Object.keys(data.distribution).indexOf(item.category) % COLORS.length]}20`,
                  color: COLORS[Object.keys(data.distribution).indexOf(item.category) % COLORS.length],
                }}
              >
                {item.category}
              </span>
              <p className="text-sm text-foreground flex-1 truncate">{item.answer}</p>
              <span className="text-xs text-muted-foreground">{item.confidence}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface KeywordsChartProps {
  data: {
    keywords: { word: string; count: number }[];
  };
}

export function KeywordsChart({ data }: KeywordsChartProps) {
  // Sort and take top 10
  const chartData = [...data.keywords]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="word" 
              tick={{ fontSize: 12 }}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`hsl(217, 91%, ${60 - index * 3}%)`} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Word cloud style tags */}
      <div className="flex flex-wrap gap-2 p-4 rounded-lg bg-secondary/50">
        {data.keywords.map((kw, i) => (
          <span
            key={kw.word}
            className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium"
            style={{
              fontSize: `${Math.max(12, Math.min(20, 12 + kw.count * 2))}px`,
            }}
          >
            {kw.word}
          </span>
        ))}
      </div>
    </div>
  );
}

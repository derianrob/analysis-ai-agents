import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SentimentChartProps {
  data: {
    summary: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
}

const COLORS = {
  positive: 'hsl(160, 84%, 39%)',
  neutral: 'hsl(217, 91%, 60%)',
  negative: 'hsl(0, 84%, 60%)',
};

const LABELS = {
  positive: 'Positivo',
  neutral: 'Neutral',
  negative: 'Negativo',
};

export function SentimentChart({ data }: SentimentChartProps) {
  const chartData = Object.entries(data.summary).map(([key, value]) => ({
    name: LABELS[key as keyof typeof LABELS],
    value,
    color: COLORS[key as keyof typeof COLORS],
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value}%`, 'Porcentaje']}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface LengthChartProps {
  data: {
    unit: string;
    min: number;
    max: number;
    avg: string;
    median: number;
    distribution: { answer: number; length: number }[];
  };
}

export function LengthChart({ data }: LengthChartProps) {
  const unitLabel = data.unit === 'words' ? 'palabras' : 'caracteres';

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-secondary/50 text-center">
          <p className="text-2xl font-bold text-foreground">{data.min}</p>
          <p className="text-xs text-muted-foreground">Mínimo</p>
        </div>
        <div className="p-4 rounded-lg bg-secondary/50 text-center">
          <p className="text-2xl font-bold text-foreground">{data.max}</p>
          <p className="text-xs text-muted-foreground">Máximo</p>
        </div>
        <div className="p-4 rounded-lg bg-primary/10 text-center">
          <p className="text-2xl font-bold text-primary">{data.avg}</p>
          <p className="text-xs text-muted-foreground">Promedio</p>
        </div>
        <div className="p-4 rounded-lg bg-secondary/50 text-center">
          <p className="text-2xl font-bold text-foreground">{data.median}</p>
          <p className="text-xs text-muted-foreground">Mediana</p>
        </div>
      </div>

      {/* Distribution Chart */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">
          Distribución de longitud ({unitLabel})
        </h4>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.distribution}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis 
                dataKey="answer" 
                tick={{ fontSize: 12 }}
                label={{ value: 'Respuesta #', position: 'bottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: unitLabel, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                labelFormatter={(value) => `Respuesta ${value}`}
                formatter={(value: number) => [`${value} ${unitLabel}`, 'Longitud']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="length" radius={[4, 4, 0, 0]}>
                {data.distribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.length > parseFloat(data.avg) 
                      ? 'hsl(160, 84%, 39%)' 
                      : 'hsl(217, 91%, 60%)'
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

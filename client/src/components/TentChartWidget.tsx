import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Thermometer, Droplets, Sun, Beaker, Zap } from "lucide-react";

interface DataPoint {
  date: string;
  temp?: number;
  rh?: number;
  ppfd?: number;
  ph?: number;
  ec?: number;
}

interface TentChartWidgetProps {
  tentId: string;
  tentName: string;
  data: DataPoint[];
}

// Ideal values for each parameter
const idealValues = {
  temp: 24, // °C - ideal temperature
  rh: 60, // % - ideal humidity
  ppfd: 600, // µmol/m²/s - ideal light intensity
  ph: 6.0, // ideal pH
  ec: 1.8, // mS/cm - ideal EC
};

const parameterConfig = {
  temp: {
    key: "temp",
    label: "Temperatura",
    color: "#f97316", // orange-500
    icon: Thermometer,
    unit: "°C",
    domain: [15, 35] as [number, number],
  },
  rh: {
    key: "rh",
    label: "Umidade",
    color: "#3b82f6", // blue-500
    icon: Droplets,
    unit: "%",
    domain: [30, 90] as [number, number],
  },
  ppfd: {
    key: "ppfd",
    label: "PPFD",
    color: "#eab308", // yellow-500
    icon: Sun,
    unit: "µmol",
    domain: [0, 1000] as [number, number],
  },
  ph: {
    key: "ph",
    label: "pH",
    color: "#a855f7", // purple-500
    icon: Beaker,
    unit: "",
    domain: [5, 8] as [number, number],
  },
  ec: {
    key: "ec",
    label: "EC",
    color: "#22c55e", // green-500
    icon: Zap,
    unit: "mS/cm",
    domain: [0, 3] as [number, number],
  },
};

type Parameter = keyof typeof parameterConfig;

export function TentChartWidget({ tentId, tentName, data }: TentChartWidgetProps) {
  // Check if there's insufficient data
  const hasInsufficientData = data.length > 0 && data.length < 3;

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border p-4 mt-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-foreground">
            {tentName}
          </h3>
          <span className="text-xs text-muted-foreground">Última Semana</span>
        </div>
      </div>

      {/* No Data Message */}
      {data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Nenhum registro na última semana
        </div>
      )}

      {/* Individual Parameter Charts */}
      {data.length > 0 && (
        <div className="space-y-4">
          {(Object.keys(parameterConfig) as Parameter[]).map((param) => {
            const config = parameterConfig[param];
            const Icon = config.icon;
            const ideal = idealValues[param];

            return (
              <div key={param} className="border border-border rounded-lg p-3">
                {/* Parameter Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                    <span className="text-sm font-semibold text-foreground">
                      {config.label}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Ideal: {ideal}{config.unit}
                  </div>
                </div>

                {/* Mini Chart */}
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 9 }}
                      stroke="currentColor"
                      className="text-muted-foreground"
                      hide
                    />
                    <YAxis
                      domain={config.domain}
                      tick={{ fontSize: 9 }}
                      stroke="currentColor"
                      className="text-muted-foreground"
                      width={35}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        fontSize: "11px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))", fontSize: "10px" }}
                      formatter={(value: number | undefined) => {
                        if (value === undefined) return ['--', config.label];
                        return [`${value.toFixed(1)}${config.unit}`, config.label];
                      }}
                    />
                    
                    {/* Ideal Reference Line */}
                    <ReferenceLine
                      y={ideal}
                      stroke={config.color}
                      strokeDasharray="3 3"
                      strokeOpacity={0.5}
                      strokeWidth={1.5}
                    />
                    
                    {/* Data Line */}
                    <Line
                      type="monotone"
                      dataKey={config.key}
                      stroke={config.color}
                      strokeWidth={2}
                      dot={{ r: 2, fill: config.color }}
                      activeDot={{ r: 4 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      )}

      {/* Insufficient Data Warning */}
      {hasInsufficientData && (
        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-xs text-yellow-600 dark:text-yellow-500 text-center">
            ⚠️ Dados insuficientes ({data.length} {data.length === 1 ? 'dia' : 'dias'}). Recomendado pelo menos 3 dias para análise confiável.
          </p>
        </div>
      )}
    </div>
  );
}

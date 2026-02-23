import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Thermometer, Droplets, Sun, Beaker, Zap } from "lucide-react";

type Parameter = "all" | "temp" | "rh" | "ppfd" | "ph" | "ec";

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
  },
  rh: {
    key: "rh",
    label: "Umidade",
    color: "#3b82f6", // blue-500
    icon: Droplets,
    unit: "%",
  },
  ppfd: {
    key: "ppfd",
    label: "PPFD",
    color: "#eab308", // yellow-500
    icon: Sun,
    unit: "µmol",
  },
  ph: {
    key: "ph",
    label: "pH",
    color: "#a855f7", // purple-500
    icon: Beaker,
    unit: "",
  },
  ec: {
    key: "ec",
    label: "EC",
    color: "#22c55e", // green-500
    icon: Zap,
    unit: "mS/cm",
  },
};

export function TentChartWidget({ tentId, tentName, data }: TentChartWidgetProps) {
  const [selectedParam, setSelectedParam] = useState<Parameter>("all");

  const visibleParams =
    selectedParam === "all"
      ? (["temp", "rh", "ppfd", "ph", "ec"] as const)
      : [selectedParam];

  // Calculate dynamic Y-axis domain based on visible data
  const yAxisDomain = useMemo(() => {
    if (data.length === 0) return [0, 100];

    let min = Infinity;
    let max = -Infinity;

    // Collect all values from visible parameters
    data.forEach(point => {
      visibleParams.forEach(param => {
        const value = point[param];
        if (value !== undefined && value !== null) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });

    // Include ideal values in the range calculation
    visibleParams.forEach(param => {
      const ideal = idealValues[param];
      if (ideal !== undefined) {
        min = Math.min(min, ideal);
        max = Math.max(max, ideal);
      }
    });

    // If no valid data found, return default
    if (!isFinite(min) || !isFinite(max)) return [0, 100];

    // Add 10% padding to avoid lines touching edges
    const range = max - min;
    const padding = range * 0.1;
    
    return [
      Math.floor((min - padding) * 10) / 10, // Round down to 1 decimal
      Math.ceil((max + padding) * 10) / 10,  // Round up to 1 decimal
    ];
  }, [data, visibleParams]);

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

      {/* Parameter Selector */}
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={() => setSelectedParam("all")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            selectedParam === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Todos
        </button>
        <div className="flex gap-1">
          {(Object.keys(parameterConfig) as Array<keyof typeof parameterConfig>).map((key) => {
            const config = parameterConfig[key];
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedParam(key as Parameter)}
                className={`p-1.5 rounded-md transition-colors ${
                  selectedParam === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                title={config.label}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            stroke="currentColor"
            className="text-muted-foreground"
          />
          <YAxis
            domain={yAxisDomain}
            tick={{ fontSize: 11 }}
            stroke="currentColor"
            className="text-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              fontSize: "11px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontSize: "10px" }}
            formatter={(value: number | undefined, name: string | undefined) => {
              if (value === undefined || !name) return ['--', name || ''];
              const param = name as keyof typeof parameterConfig;
              const config = parameterConfig[param];
              return [`${value.toFixed(1)}${config.unit}`, config.label];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px" }}
            formatter={(value) => {
              const param = value as keyof typeof parameterConfig;
              return parameterConfig[param]?.label || value;
            }}
          />

          {/* Ideal Reference Lines */}
          {visibleParams.map((param) => {
            const config = parameterConfig[param];
            const ideal = idealValues[param];
            return (
              <ReferenceLine
                key={`ideal-${param}`}
                y={ideal}
                stroke={config.color}
                strokeDasharray="5 5"
                strokeOpacity={0.4}
                strokeWidth={1.5}
              />
            );
          })}

          {/* Data Lines */}
          {visibleParams.map((param) => {
            const config = parameterConfig[param];
            return (
              <Line
                key={param}
                type="monotone"
                dataKey={config.key}
                name={config.key}
                stroke={config.color}
                strokeWidth={2}
                dot={{ r: 3, fill: config.color }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {/* No Data Message */}
      {data.length === 0 && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Nenhum registro na última semana
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

      {/* Ideal Values Legend */}
      {data.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Valores Ideais (linhas pontilhadas):</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5" style={{ color: parameterConfig.temp.color }} />
              <span className="text-muted-foreground">{idealValues.temp}°C</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5" style={{ color: parameterConfig.rh.color }} />
              <span className="text-muted-foreground">{idealValues.rh}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5" style={{ color: parameterConfig.ppfd.color }} />
              <span className="text-muted-foreground">{idealValues.ppfd}µmol</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Beaker className="w-3.5 h-3.5" style={{ color: parameterConfig.ph.color }} />
              <span className="text-muted-foreground">pH {idealValues.ph}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" style={{ color: parameterConfig.ec.color }} />
              <span className="text-muted-foreground">{idealValues.ec}mS/cm</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

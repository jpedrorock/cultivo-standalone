import { useState } from "react";
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

// Normalization ranges for each parameter
const normalizationRanges = {
  temp: { min: 15, max: 35 }, // °C
  rh: { min: 30, max: 90 }, // %
  ppfd: { min: 0, max: 1000 }, // µmol/m²/s
  ph: { min: 5, max: 8 },
  ec: { min: 0, max: 3 }, // mS/cm
};

// Ideal values for each parameter (will be normalized for display)
const idealValues = {
  temp: 24, // °C - ideal temperature
  rh: 60, // % - ideal humidity
  ppfd: 600, // µmol/m²/s - ideal light intensity
  ph: 6.0, // ideal pH
  ec: 1.8, // mS/cm - ideal EC
};

// Normalize value to 0-100% scale
function normalizeValue(value: number | undefined, param: keyof typeof normalizationRanges): number | undefined {
  if (value === undefined || value === null) return undefined;
  const range = normalizationRanges[param];
  const normalized = ((value - range.min) / (range.max - range.min)) * 100;
  return Math.max(0, Math.min(100, normalized)); // Clamp to 0-100
}

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

  // Normalize data for better visualization
  const normalizedData = data.map(point => ({
    date: point.date,
    temp: normalizeValue(point.temp, 'temp'),
    rh: normalizeValue(point.rh, 'rh'),
    ppfd: normalizeValue(point.ppfd, 'ppfd'),
    ph: normalizeValue(point.ph, 'ph'),
    ec: normalizeValue(point.ec, 'ec'),
    // Keep original values for tooltip
    tempRaw: point.temp,
    rhRaw: point.rh,
    ppfdRaw: point.ppfd,
    phRaw: point.ph,
    ecRaw: point.ec,
  }));

  const visibleParams =
    selectedParam === "all"
      ? (["temp", "rh", "ppfd", "ph", "ec"] as const)
      : [selectedParam];

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
        
        {/* Parameter Selector */}
        <div className="flex gap-1">
          <button
            onClick={() => setSelectedParam("all")}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              selectedParam === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Todos
          </button>
          {Object.entries(parameterConfig).map(([key, config]) => {
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
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={normalizedData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            stroke="currentColor"
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="currentColor"
            className="text-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value: number | undefined, name: string | undefined, props: any) => {
              if (value === undefined || name === undefined) return ['--', name || ''];
              // Extract parameter key from name (e.g., "Temperatura (°C)" -> "temp")
              const paramKey = Object.entries(parameterConfig).find(
                ([_, config]) => name.startsWith(config.label)
              )?.[0] as keyof typeof parameterConfig | undefined;
              
              if (!paramKey) return [value.toFixed(1) + '%', name];
              
              const rawValue = props.payload[`${paramKey}Raw`];
              const config = parameterConfig[paramKey];
              
              if (rawValue !== undefined && rawValue !== null) {
                return [
                  `${rawValue.toFixed(1)}${config.unit} (${value.toFixed(0)}%)`,
                  config.label
                ];
              }
              
              return [value.toFixed(1) + '%', name];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px" }}
            iconType="line"
          />
          
          {/* Ideal Reference Lines */}
          {visibleParams.map((param) => {
            const idealNormalized = normalizeValue(idealValues[param], param);
            if (idealNormalized === undefined) return null;
            return (
              <ReferenceLine
                key={`ideal-${param}`}
                y={idealNormalized}
                stroke={parameterConfig[param].color}
                strokeDasharray="5 5"
                strokeOpacity={0.4}
                strokeWidth={1.5}
              />
            );
          })}
          
          {visibleParams.map((param) => {
            const config = parameterConfig[param];
            return (
              <Line
                key={param}
                type="monotone"
                dataKey={config.key}
                stroke={config.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name={`${config.label} (${config.unit})`}
                connectNulls
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {/* No Data Message */}
      {data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
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

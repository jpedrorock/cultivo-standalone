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

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border p-4 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-foreground">
          Última Semana
        </h4>
        
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
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
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
          />
          <Legend
            wrapperStyle={{ fontSize: "11px" }}
            iconType="line"
          />
          
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
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LogData {
  id: number;
  date: string;
  shift: string;
  tentName: string;
  temperature: number | null;
  humidity: number | null;
  ppfd: number | null;
  ph: number | null;
  ec: number | null;
  notes: string | null;
}

interface AnalyticsChartsProps {
  logs: LogData[];
}

export function AnalyticsCharts({ logs }: AnalyticsChartsProps) {
  // Preparar dados para os gráficos
  const chartData = logs
    .filter(log => log.temperature !== null || log.humidity !== null || log.ppfd !== null)
    .map(log => ({
      date: format(new Date(log.date), 'dd/MM', { locale: ptBR }),
      fullDate: format(new Date(log.date), 'dd/MM/yyyy', { locale: ptBR }),
      shift: log.shift === 'AM' ? 'Manhã' : 'Tarde',
      tent: log.tentName,
      temp: log.temperature,
      rh: log.humidity,
      ppfd: log.ppfd,
      ph: log.ph,
      ec: log.ec,
    }))
    .reverse(); // Mais antigo primeiro para melhor visualização

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-1">{data.fullDate} - {data.shift}</p>
          <p className="text-xs text-muted-foreground mb-2">{data.tent}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span>
              {entry.dataKey === 'temp' && '°C'}
              {entry.dataKey === 'rh' && '%'}
              {entry.dataKey === 'ppfd' && ' µmol/m²/s'}
              {entry.dataKey === 'ph' && ''}
              {entry.dataKey === 'ec' && ' mS/cm'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 Análise de Dados</CardTitle>
          <CardDescription>Visualize a evolução dos parâmetros ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nenhum dado disponível para análise. Adicione registros com valores de Temperatura, Umidade ou PPFD para ver os gráficos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Temperatura */}
      {chartData.some(d => d.temp !== null) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🌡️</span>
              Temperatura ao Longo do Tempo
            </CardTitle>
            <CardDescription>Evolução da temperatura (°C) nos registros</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => value === 'temp' ? 'Temperatura (°C)' : value}
                />
                <Line 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Umidade Relativa */}
      {chartData.some(d => d.rh !== null) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💧</span>
              Umidade Relativa ao Longo do Tempo
            </CardTitle>
            <CardDescription>Evolução da umidade relativa (%) nos registros</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => value === 'rh' ? 'Umidade Relativa (%)' : value}
                />
                <Line 
                  type="monotone" 
                  dataKey="rh" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* PPFD */}
      {chartData.some(d => d.ppfd !== null) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">☀️</span>
              PPFD ao Longo do Tempo
            </CardTitle>
            <CardDescription>Evolução da intensidade de luz (µmol/m²/s) nos registros</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  domain={['dataMin - 50', 'dataMax + 50']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => value === 'ppfd' ? 'PPFD (µmol/m²/s)' : value}
                />
                <Line 
                  type="monotone" 
                  dataKey="ppfd" 
                  stroke="#eab308" 
                  strokeWidth={2}
                  dot={{ fill: '#eab308', r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* pH e EC combinados */}
      {(chartData.some(d => d.ph !== null) || chartData.some(d => d.ec !== null)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⚗️</span>
              pH e EC ao Longo do Tempo
            </CardTitle>
            <CardDescription>Evolução do pH e condutividade elétrica (EC) nos registros</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  yAxisId="left"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  domain={[0, 14]}
                  label={{ value: 'pH', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'EC (mS/cm)', angle: 90, position: 'insideRight', style: { fill: 'hsl(var(--muted-foreground))' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => {
                    if (value === 'ph') return 'pH';
                    if (value === 'ec') return 'EC (mS/cm)';
                    return value;
                  }}
                />
                {chartData.some(d => d.ph !== null) && (
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="ph" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                )}
                {chartData.some(d => d.ec !== null) && (
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="ec" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

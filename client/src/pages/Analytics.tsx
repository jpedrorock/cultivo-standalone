import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Droplets, Sun, Thermometer } from "lucide-react";

export default function Analytics() {
  const [selectedTent, setSelectedTent] = useState<number | undefined>(undefined);
  const [days, setDays] = useState(30);

  const { data: tents } = trpc.tents.list.useQuery();
  const { data: historicalData, isLoading } = trpc.analytics.getHistoricalData.useQuery({
    tentId: selectedTent,
    days,
  });
  const { data: stats } = trpc.analytics.getStats.useQuery({
    tentId: selectedTent,
    days,
  });

  // Preparar dados para o gráfico
  const chartData = historicalData?.map((log) => ({
    date: new Date(log.logDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    temperatura: parseFloat(log.tempC || "0"),
    umidade: parseFloat(log.rhPct || "0"),
    ppfd: parseInt(String(log.ppfd || "0")),
  })).reverse() || [];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 Dashboard de Análise</h1>
          <p className="text-muted-foreground">Evolução temporal dos parâmetros das estufas</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={selectedTent?.toString() || "all"}
            onValueChange={(value) => setSelectedTent(value === "all" ? undefined : parseInt(value))}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Todas as Estufas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Estufas</SelectItem>
              {tents?.map((tent) => (
                <SelectItem key={tent.id} value={tent.id.toString()}>
                  {tent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={days.toString()} onValueChange={(value) => setDays(parseInt(value))}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperatura Média</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.temperature.avg.toFixed(1) || "--"}°C</div>
            <p className="text-xs text-muted-foreground">
              Min: {stats?.temperature.min.toFixed(1) || "--"}°C | Max: {stats?.temperature.max.toFixed(1) || "--"}°C
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Umidade Média</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.humidity.avg.toFixed(1) || "--"}%</div>
            <p className="text-xs text-muted-foreground">
              Min: {stats?.humidity.min.toFixed(1) || "--"}% | Max: {stats?.humidity.max.toFixed(1) || "--"}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PPFD Médio</CardTitle>
            <Sun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.ppfd.avg.toFixed(0) || "--"}</div>
            <p className="text-xs text-muted-foreground">
              Min: {stats?.ppfd.min.toFixed(0) || "--"} | Max: {stats?.ppfd.max.toFixed(0) || "--"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Temperatura */}
      <Card>
        <CardHeader>
          <CardTitle>🌡️ Evolução da Temperatura</CardTitle>
          <CardDescription>Temperatura (°C) ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Carregando dados...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível para o período selecionado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temperatura" stroke="#ef4444" strokeWidth={2} name="Temperatura (°C)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Umidade */}
      <Card>
        <CardHeader>
          <CardTitle>💧 Evolução da Umidade</CardTitle>
          <CardDescription>Umidade relativa (%) ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Carregando dados...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível para o período selecionado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="umidade" stroke="#3b82f6" strokeWidth={2} name="Umidade (%)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de PPFD */}
      <Card>
        <CardHeader>
          <CardTitle>☀️ Evolução do PPFD</CardTitle>
          <CardDescription>Intensidade luminosa (µmol/m²/s) ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Carregando dados...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível para o período selecionado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ppfd" stroke="#10b981" strokeWidth={2} name="PPFD" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

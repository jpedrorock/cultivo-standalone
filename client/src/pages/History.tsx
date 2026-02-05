import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, Calendar } from "lucide-react";
import { Link } from "wouter";
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

export default function History() {
  const [selectedTentId, setSelectedTentId] = useState<number>(2); // Default to Estufa B
  const [days, setDays] = useState<number>(30);

  const { data: tents, isLoading: tentsLoading } = trpc.tents.list.useQuery();
  const { data: historicalData, isLoading: dataLoading } = trpc.dailyLogs.getHistoricalData.useQuery(
    { tentId: selectedTentId, days },
    { enabled: !!selectedTentId }
  );

  if (tentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedTent = tents?.find((t) => t.id === selectedTentId);

  // Process data for charts
  const chartData = historicalData?.logs
    .map((log) => ({
      date: new Date(log.logDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      temp: log.tempC ? parseFloat(log.tempC) : null,
      rh: log.rhPct ? parseFloat(log.rhPct) : null,
      ppfd: log.ppfd || null,
      ph: log.ph ? parseFloat(log.ph) : null,
      ec: log.ec ? parseFloat(log.ec) : null,
    }))
    .reverse() || [];

  // Get target ranges for reference lines
  const getTargetRange = (param: string) => {
    if (!historicalData?.cycle || !historicalData?.targets) return null;

    const now = new Date();
    const startDate = new Date(historicalData.cycle.startDate);
    const floraStartDate = historicalData.cycle.floraStartDate
      ? new Date(historicalData.cycle.floraStartDate)
      : null;

    let currentPhase: "CLONING" | "VEGA" | "FLORA" | "MAINTENANCE";
    let weekNumber: number;

    if (selectedTent?.tentType === "A") {
      currentPhase = "MAINTENANCE";
      weekNumber = 1;
    } else if (selectedTent?.tentType === "B") {
      currentPhase = "VEGA";
      const weeksSinceStart = Math.floor(
        (now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      weekNumber = weeksSinceStart + 1;
    } else {
      currentPhase = "FLORA";
      const weeksSinceStart = floraStartDate
        ? Math.floor((now.getTime() - floraStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
        : Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      weekNumber = weeksSinceStart + 1;
    }

    const target = historicalData.targets.find(
      (t) => t.phase === currentPhase && t.weekNumber === weekNumber
    );

    if (!target) return null;

    switch (param) {
      case "temp":
        return {
          min: target.tempMin ? parseFloat(target.tempMin) : null,
          max: target.tempMax ? parseFloat(target.tempMax) : null,
        };
      case "rh":
        return {
          min: target.rhMin ? parseFloat(target.rhMin) : null,
          max: target.rhMax ? parseFloat(target.rhMax) : null,
        };
      case "ppfd":
        return { min: target.ppfdMin, max: target.ppfdMax };
      case "ph":
        return {
          min: target.phMin ? parseFloat(target.phMin) : null,
          max: target.phMax ? parseFloat(target.phMax) : null,
        };
      case "ec":
        return {
          min: target.ecMin ? parseFloat(target.ecMin) : null,
          max: target.ecMax ? parseFloat(target.ecMax) : null,
        };
      default:
        return null;
    }
  };

  const tempTarget = getTargetRange("temp");
  const rhTarget = getTargetRange("rh");
  const ppfdTarget = getTargetRange("ppfd");
  const phTarget = getTargetRange("ph");
  const ecTarget = getTargetRange("ec");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary" />
                Histórico
              </h1>
              <p className="text-gray-600 mt-1">Evolução dos parâmetros ao longo do tempo</p>
            </div>
            <Link href="/">
              <button className="text-sm text-gray-600 hover:text-gray-900">← Voltar</button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Selecione a estufa e o período para visualizar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Estufa</label>
                <Select value={selectedTentId.toString()} onValueChange={(v) => setSelectedTentId(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tents?.map((tent) => (
                      <SelectItem key={tent.id} value={tent.id.toString()}>
                        {tent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Período</label>
                <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="14">Últimos 14 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="60">Últimos 60 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !historicalData?.cycle ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Nenhum ciclo ativo para esta estufa</p>
            </CardContent>
          </Card>
        ) : chartData.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Nenhum registro encontrado para o período selecionado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Temperature Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Temperatura (°C)</CardTitle>
                <CardDescription>
                  Evolução da temperatura ao longo do tempo
                  {tempTarget && ` • Ideal: ${tempTarget.min}-${tempTarget.max}°C`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                    <Tooltip />
                    <Legend />
                    {tempTarget?.min && (
                      <ReferenceLine y={tempTarget.min} stroke="#10b981" strokeDasharray="3 3" label="Min" />
                    )}
                    {tempTarget?.max && (
                      <ReferenceLine y={tempTarget.max} stroke="#10b981" strokeDasharray="3 3" label="Max" />
                    )}
                    <Line
                      type="monotone"
                      dataKey="temp"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Temperatura"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Humidity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Umidade Relativa (%)</CardTitle>
                <CardDescription>
                  Evolução da umidade ao longo do tempo
                  {rhTarget && ` • Ideal: ${rhTarget.min}-${rhTarget.max}%`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    {rhTarget?.min && (
                      <ReferenceLine y={rhTarget.min} stroke="#10b981" strokeDasharray="3 3" label="Min" />
                    )}
                    {rhTarget?.max && (
                      <ReferenceLine y={rhTarget.max} stroke="#10b981" strokeDasharray="3 3" label="Max" />
                    )}
                    <Line
                      type="monotone"
                      dataKey="rh"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Umidade"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* PPFD Chart */}
            <Card>
              <CardHeader>
                <CardTitle>PPFD (µmol/m²/s)</CardTitle>
                <CardDescription>
                  Evolução do PPFD ao longo do tempo
                  {ppfdTarget && ` • Ideal: ${ppfdTarget.min}-${ppfdTarget.max} µmol/m²/s`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={["dataMin - 50", "dataMax + 50"]} />
                    <Tooltip />
                    <Legend />
                    {ppfdTarget?.min && (
                      <ReferenceLine y={ppfdTarget.min} stroke="#10b981" strokeDasharray="3 3" label="Min" />
                    )}
                    {ppfdTarget?.max && (
                      <ReferenceLine y={ppfdTarget.max} stroke="#10b981" strokeDasharray="3 3" label="Max" />
                    )}
                    <Line
                      type="monotone"
                      dataKey="ppfd"
                      stroke="#eab308"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="PPFD"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* pH Chart */}
            <Card>
              <CardHeader>
                <CardTitle>pH</CardTitle>
                <CardDescription>
                  Evolução do pH ao longo do tempo
                  {phTarget && ` • Ideal: ${phTarget.min}-${phTarget.max}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 14]} />
                    <Tooltip />
                    <Legend />
                    {phTarget?.min && (
                      <ReferenceLine y={phTarget.min} stroke="#10b981" strokeDasharray="3 3" label="Min" />
                    )}
                    {phTarget?.max && (
                      <ReferenceLine y={phTarget.max} stroke="#10b981" strokeDasharray="3 3" label="Max" />
                    )}
                    <Line
                      type="monotone"
                      dataKey="ph"
                      stroke="#a855f7"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="pH"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* EC Chart */}
            <Card>
              <CardHeader>
                <CardTitle>EC (mS/cm)</CardTitle>
                <CardDescription>
                  Evolução da condutividade elétrica ao longo do tempo
                  {ecTarget && ` • Ideal: ${ecTarget.min}-${ecTarget.max} mS/cm`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={["dataMin - 0.2", "dataMax + 0.2"]} />
                    <Tooltip />
                    <Legend />
                    {ecTarget?.min && (
                      <ReferenceLine y={ecTarget.min} stroke="#10b981" strokeDasharray="3 3" label="Min" />
                    )}
                    {ecTarget?.max && (
                      <ReferenceLine y={ecTarget.max} stroke="#10b981" strokeDasharray="3 3" label="Max" />
                    )}
                    <Line
                      type="monotone"
                      dataKey="ec"
                      stroke="#ec4899"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="EC"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

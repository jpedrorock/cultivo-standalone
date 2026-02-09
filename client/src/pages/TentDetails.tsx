import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sprout, ThermometerSun, Droplets, Sun, ArrowLeft, Calendar, FileDown } from "lucide-react";
import { Link, useParams } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Printer } from "lucide-react";

export default function TentDetails() {
  const { id } = useParams<{ id: string }>();
  const tentId = parseInt(id || "0");

  const [dateRange, setDateRange] = useState(7); // 7, 14, 30 days

  const { data: tent, isLoading: tentLoading } = trpc.tents.getById.useQuery({ id: tentId });
  const { data: cycle } = trpc.cycles.getByTent.useQuery({ tentId });
  
  // Memoize dates to prevent infinite re-renders
  const dateFilter = useMemo(() => {
    const now = new Date();
    return {
      startDate: subDays(now, dateRange),
      endDate: now,
    };
  }, [dateRange]);

  const { data: logs, isLoading: logsLoading } = trpc.dailyLogs.list.useQuery({
    tentId,
    ...dateFilter,
  });

  if (tentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Estufa não encontrada</p>
            <Button asChild className="mt-4">
              <Link href="/">Voltar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPhaseInfo = () => {
    if (!cycle) {
      return { phase: "Inativo", color: "bg-muted0" };
    }

    if (tent.tentType === "A") {
      return { phase: "Manutenção", color: "bg-blue-500/100" };
    }

    if (cycle.floraStartDate) {
      return { phase: "Floração", color: "bg-purple-500" };
    }

    return { phase: "Vegetativa", color: "bg-primary/100" };
  };

  const phaseInfo = getPhaseInfo();

  const handlePrint = () => {
    window.print();
  };

  // Prepare chart data
  const chartData = logs?.map((log) => ({
    date: format(new Date(log.logDate), "dd/MM", { locale: ptBR }),
    fullDate: format(new Date(log.logDate), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    turn: log.turn,
    temp: log.tempC ? parseFloat(log.tempC) : null,
    rh: log.rhPct ? parseFloat(log.rhPct) : null,
    ppfd: log.ppfd || null,
  })) || [];

  // Calculate averages
  const avgTemp = logs?.length
    ? (logs.reduce((sum, log) => sum + (log.tempC ? parseFloat(log.tempC) : 0), 0) / logs.filter(l => l.tempC).length).toFixed(1)
    : "--";
  const avgRh = logs?.length
    ? (logs.reduce((sum, log) => sum + (log.rhPct ? parseFloat(log.rhPct) : 0), 0) / logs.filter(l => l.rhPct).length).toFixed(1)
    : "--";
  const avgPpfd = logs?.length
    ? Math.round(logs.reduce((sum, log) => sum + (log.ppfd || 0), 0) / logs.filter(l => l.ppfd).length)
    : "--";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="icon">
                <Link href="/">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2 md:gap-3">
                  <Sprout className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                  {tent.name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Tipo {tent.tentType} • {tent.width}×{tent.depth}×{tent.height}cm
                </p>
              </div>
              <Badge className={`${phaseInfo.color} text-white border-0 text-xs md:text-sm`}>{phaseInfo.phase}</Badge>
            </div>
            <div className="flex gap-2 md:ml-auto">
              <Button variant="outline" onClick={handlePrint} className="flex-1 md:flex-none">
                <Printer className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Imprimir</span>
              </Button>
              <Button asChild className="flex-1 md:flex-none">
                <Link href={`/tent/${tentId}/log`}>Novo Registro</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-7xl">
        {/* Cycle Info */}
        {cycle && (
          <Card className="bg-card/90 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ciclo Ativo</p>
                  <p className="text-lg font-semibold text-foreground">
                    Semana{" "}
                    {Math.floor(
                      (Date.now() - new Date(cycle.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)
                    ) + 1}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Início</p>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(cycle.startDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dias Decorridos</p>
                  <p className="text-lg font-semibold text-foreground">
                    {Math.floor((Date.now() - new Date(cycle.startDate).getTime()) / (24 * 60 * 60 * 1000))}{" "}
                    dias
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold text-foreground">{cycle.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-card/90 backdrop-blur-sm border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <ThermometerSun className="w-4 h-4 text-orange-600" />
                    Temperatura Média
                  </p>
                  <p className="text-3xl font-bold text-foreground">{avgTemp}°C</p>
                  <p className="text-xs text-muted-foreground mt-1">Últimos {dateRange} dias</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <ThermometerSun className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-sm border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    Umidade Média
                  </p>
                  <p className="text-3xl font-bold text-foreground">{avgRh}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Últimos {dateRange} dias</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-sm border-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Sun className="w-4 h-4 text-yellow-600" />
                    PPFD Médio
                  </p>
                  <p className="text-3xl font-bold text-foreground">{avgPpfd}</p>
                  <p className="text-xs text-muted-foreground mt-1">Últimos {dateRange} dias</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Período:</span>
          <div className="flex gap-2">
            <Button
              variant={dateRange === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(7)}
            >
              7 dias
            </Button>
            <Button
              variant={dateRange === 14 ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(14)}
            >
              14 dias
            </Button>
            <Button
              variant={dateRange === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(30)}
            >
              30 dias
            </Button>
          </div>
        </div>

        {/* Charts and History */}
        <Tabs defaultValue="charts" className="space-y-6" id="charts-container">
          <TabsList className="bg-card/90 backdrop-blur-sm">
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-6">
            {logsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : chartData.length === 0 ? (
              <Card className="bg-card/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Nenhum registro encontrado para este período</p>
                  <Button asChild className="mt-4">
                    <Link href={`/tent/${tentId}/log`}>Criar Primeiro Registro</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Temperature Chart */}
                <Card className="bg-card/90 backdrop-blur-sm border-orange-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ThermometerSun className="w-5 h-5 text-orange-600" />
                      Evolução da Temperatura
                    </CardTitle>
                    <CardDescription>Temperatura em °C ao longo do tempo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" domain={[15, 30]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="temp"
                          stroke="#ea580c"
                          strokeWidth={2}
                          dot={{ fill: "#ea580c", r: 4 }}
                          name="Temperatura (°C)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Humidity Chart */}
                <Card className="bg-card/90 backdrop-blur-sm border-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-blue-600" />
                      Evolução da Umidade
                    </CardTitle>
                    <CardDescription>Umidade relativa em % ao longo do tempo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" domain={[40, 80]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="rh"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={{ fill: "#2563eb", r: 4 }}
                          name="Umidade (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* PPFD Chart */}
                <Card className="bg-card/90 backdrop-blur-sm border-yellow-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sun className="w-5 h-5 text-yellow-600" />
                      Evolução do PPFD
                    </CardTitle>
                    <CardDescription>PPFD em µmol/m²/s ao longo do tempo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" domain={[200, 700]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="ppfd"
                          stroke="#ca8a04"
                          strokeWidth={2}
                          dot={{ fill: "#ca8a04", r: 4 }}
                          name="PPFD (µmol/m²/s)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="history">
            {logsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : logs && logs.length > 0 ? (
              <div className="space-y-4">
                {logs.map((log) => (
                  <Card key={log.id} className="bg-card/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-semibold text-foreground">
                            {format(new Date(log.logDate), "EEEE, dd 'de' MMMM 'de' yyyy", {
                              locale: ptBR,
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(log.logDate), "HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <Badge variant={log.turn === "AM" ? "default" : "secondary"}>
                          {log.turn === "AM" ? "Manhã" : "Noite"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-orange-500/10 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                            <ThermometerSun className="w-3 h-3" />
                            Temperatura
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {log.tempC ? `${log.tempC}°C` : "--"}
                          </p>
                        </div>
                        <div className="bg-blue-500/10 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                            <Droplets className="w-3 h-3" />
                            Umidade
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {log.rhPct ? `${log.rhPct}%` : "--"}
                          </p>
                        </div>
                        <div className="bg-yellow-500/10 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                            <Sun className="w-3 h-3" />
                            PPFD
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {log.ppfd || "--"}
                          </p>
                        </div>
                      </div>

                      {log.notes && (
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Observações</p>
                          <p className="text-sm text-foreground">{log.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Nenhum registro encontrado para este período</p>
                  <Button asChild className="mt-4">
                    <Link href={`/tent/${tentId}/log`}>Criar Primeiro Registro</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

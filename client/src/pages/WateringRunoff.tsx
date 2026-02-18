import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Droplets, TrendingUp, TrendingDown, Minus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function WateringRunoff() {
  // Estado da calculadora
  const [calcMode, setCalcMode] = useState<"daily" | "weekly">("daily");
  const [numPlants, setNumPlants] = useState<number>(4);
  const [potSize, setPotSize] = useState<number>(11);
  const [wateringFreq, setWateringFreq] = useState<number>(2);
  const [desiredRunoff, setDesiredRunoff] = useState<number>(20);

  // Estado do registro de rega
  const [registerDialog, setRegisterDialog] = useState(false);
  const [selectedTent, setSelectedTent] = useState<number | undefined>();
  const [logTime, setLogTime] = useState<string>("");
  const [volumeIn, setVolumeIn] = useState<string>("");
  const [volumeOut, setVolumeOut] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Estado do filtro de histórico
  const [historyPeriod, setHistoryPeriod] = useState<"today" | "week" | "month">("today");

  const { data: tents } = trpc.tents.list.useQuery();
  const { data: wateringLogs, refetch } = trpc.watering.list.useQuery(
    {
      tentId: selectedTent!,
      startDate: getStartDate(historyPeriod),
    },
    { enabled: !!selectedTent }
  );

  const utils = trpc.useUtils();
  const logWatering = trpc.watering.log.useMutation({
    onSuccess: () => {
      toast.success("Rega registrada com sucesso!");
      setRegisterDialog(false);
      setLogTime("");
      setVolumeIn("");
      setVolumeOut("");
      setNotes("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao registrar rega: ${error.message}`);
    },
  });

  const deleteWatering = trpc.watering.delete.useMutation({
    onSuccess: () => {
      toast.success("Registro deletado!");
      refetch();
    },
  });

  // Cálculos da calculadora
  const calculations = useMemo(() => {
    const volumePerPlant = potSize * 0.33; // 33% do tamanho do vaso
    const volumeWithRunoff = volumePerPlant * (1 + desiredRunoff / 100);
    const wateringsPerWeek = 7 / wateringFreq;
    const totalWeekly = volumeWithRunoff * numPlants * wateringsPerWeek;
    const tankMinimum = totalWeekly * 1.1; // +10% margem

    return {
      volumePerPlant: volumeWithRunoff.toFixed(2),
      wateringsPerWeek: wateringsPerWeek.toFixed(1),
      totalWeekly: totalWeekly.toFixed(1),
      tankMinimum: tankMinimum.toFixed(1),
    };
  }, [numPlants, potSize, wateringFreq, desiredRunoff]);

  // Calcular runoff% e recomendação
  const calculateRunoffInfo = (volIn: number, volOut: number) => {
    const runoffPercent = (volOut / volIn) * 100;
    const difference = runoffPercent - desiredRunoff;
    
    let recommendation = "";
    let icon = null;
    let color = "";

    if (Math.abs(difference) <= 3) {
      recommendation = "Perfeito! Mantenha o volume";
      icon = <Minus className="w-4 h-4" />;
      color = "text-green-600";
    } else if (difference < 0) {
      const increase = Math.abs(difference) * volIn / 100;
      recommendation = `Aumente ${increase.toFixed(1)}L na próxima rega`;
      icon = <TrendingUp className="w-4 h-4" />;
      color = "text-orange-600";
    } else {
      const decrease = difference * volIn / 100;
      recommendation = `Diminua ${decrease.toFixed(1)}L na próxima rega`;
      icon = <TrendingDown className="w-4 h-4" />;
      color = "text-blue-600";
    }

    return { runoffPercent: runoffPercent.toFixed(1), recommendation, icon, color };
  };

  const handleRegisterWatering = () => {
    if (!selectedTent || !logTime || !volumeIn || !volumeOut) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    logWatering.mutate({
      tentId: selectedTent,
      logTime,
      volumeIn: parseFloat(volumeIn),
      volumeOut: parseFloat(volumeOut),
      notes: notes || undefined,
    });
  };

  function getStartDate(period: "today" | "week" | "month"): string {
    const now = new Date();
    switch (period) {
      case "today":
        return now.toISOString().split("T")[0];
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return weekAgo.toISOString().split("T")[0];
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return monthAgo.toISOString().split("T")[0];
    }
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rega e Runoff</h1>
          <p className="text-muted-foreground">
            Calcule volumes ideais e registre suas regas
          </p>
        </div>
      </div>

      {/* Calculadora de Rega */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5" />
            Calculadora de Rega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle Modo */}
          <Tabs value={calcMode} onValueChange={(v) => setCalcMode(v as "daily" | "weekly")}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="daily">Por Rega (Diário)</TabsTrigger>
              <TabsTrigger value="weekly">Semanal (Tank)</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Campos de entrada */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numPlants">Número de Plantas</Label>
              <Input
                id="numPlants"
                type="number"
                value={numPlants}
                onChange={(e) => setNumPlants(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="potSize">Tamanho do Vaso (L)</Label>
              <Input
                id="potSize"
                type="number"
                value={potSize}
                onChange={(e) => setPotSize(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wateringFreq">Frequência (dias)</Label>
              <Input
                id="wateringFreq"
                type="number"
                value={wateringFreq}
                onChange={(e) => setWateringFreq(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desiredRunoff">Runoff Desejado (%)</Label>
              <Input
                id="desiredRunoff"
                type="number"
                value={desiredRunoff}
                onChange={(e) => setDesiredRunoff(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Resultados */}
          <div className="p-6 rounded-lg bg-primary/5 border-2 border-primary/20">
            <h3 className="font-semibold text-lg mb-4">
              {calcMode === "daily" ? "📊 Volume por Rega" : "📊 Totais Semanais"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Volume por planta</p>
                <p className="text-2xl font-bold">{calculations.volumePerPlant}L</p>
              </div>
              {calcMode === "weekly" && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Regas por semana</p>
                    <p className="text-2xl font-bold">{calculations.wateringsPerWeek}x</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total semanal</p>
                    <p className="text-2xl font-bold">{calculations.totalWeekly}L</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tank mínimo</p>
                    <p className="text-2xl font-bold text-primary">{calculations.tankMinimum}L</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registro de Runoff */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              💧 Registro de Runoff
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={selectedTent?.toString()} onValueChange={(v) => setSelectedTent(parseInt(v))}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecione a estufa" />
                </SelectTrigger>
                <SelectContent>
                  {tents?.map((tent) => (
                    <SelectItem key={tent.id} value={tent.id.toString()}>
                      {tent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setRegisterDialog(true)} disabled={!selectedTent}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Rega
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedTent ? (
            <div className="py-12 text-center text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p>Selecione uma estufa para ver o histórico de regas</p>
            </div>
          ) : wateringLogs && wateringLogs.length > 0 ? (
            <div className="space-y-4">
              {/* Filtro de período */}
              <Tabs value={historyPeriod} onValueChange={(v) => setHistoryPeriod(v as any)}>
                <TabsList>
                  <TabsTrigger value="today">Hoje</TabsTrigger>
                  <TabsTrigger value="week">Semana</TabsTrigger>
                  <TabsTrigger value="month">Mês</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Lista de regas */}
              {wateringLogs.map((log) => {
                const volIn = parseFloat(log.volumeIn.toString());
                const volOut = parseFloat(log.volumeOut.toString());
                const info = calculateRunoffInfo(volIn, volOut);
                
                return (
                  <Card key={log.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              {new Date(log.logDate).toLocaleDateString("pt-BR")} às {log.logTime}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Volume Entrada</p>
                              <p className="font-semibold">{volIn.toFixed(1)}L</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Volume Saída</p>
                              <p className="font-semibold">{volOut.toFixed(1)}L</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Runoff</p>
                              <p className="font-semibold">{info.runoffPercent}%</p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-2 ${info.color} font-medium`}>
                            {info.icon}
                            <span className="text-sm">{info.recommendation}</span>
                          </div>
                          {log.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteWatering.mutate({ id: log.id })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Droplets className="w-12 h-12 mx-auto mb-4" />
              <p>Nenhuma rega registrada ainda</p>
              <p className="text-sm mt-2">Clique em "Registrar Rega" para começar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Registro */}
      <Dialog open={registerDialog} onOpenChange={setRegisterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Rega</DialogTitle>
            <DialogDescription>
              Informe os volumes de entrada e saída para calcular o runoff
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logTime">Horário (HH:MM)</Label>
              <Input
                id="logTime"
                type="time"
                value={logTime}
                onChange={(e) => setLogTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volumeIn">Volume de Entrada (L)</Label>
              <Input
                id="volumeIn"
                type="number"
                step="0.1"
                value={volumeIn}
                onChange={(e) => setVolumeIn(e.target.value)}
                placeholder="Ex: 17.6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volumeOut">Volume de Saída/Runoff (L)</Label>
              <Input
                id="volumeOut"
                type="number"
                step="0.1"
                value={volumeOut}
                onChange={(e) => setVolumeOut(e.target.value)}
                placeholder="Ex: 3.5"
              />
            </div>
            {volumeIn && volumeOut && (
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm font-medium">
                  Runoff calculado:{" "}
                  <span className="text-lg font-bold">
                    {((parseFloat(volumeOut) / parseFloat(volumeIn)) * 100).toFixed(1)}%
                  </span>
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre a rega..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegisterWatering} disabled={logWatering.isPending}>
              {logWatering.isPending ? "Salvando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

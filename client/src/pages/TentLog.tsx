import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sprout, ThermometerSun, Droplets, Sun, ArrowLeft, Save, Beaker, FlaskConical, Clock } from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

export default function TentLog() {
  const { id } = useParams<{ id: string }>();
  const tentId = parseInt(id || "0");

  const { data: tent, isLoading: tentLoading } = trpc.tents.getById.useQuery({ id: tentId });
  const { data: cycle } = trpc.cycles.getByTent.useQuery({ tentId });

  const [turn, setTurn] = useState<"AM" | "PM">("AM");
  const [tempC, setTempC] = useState("");
  const [rhPct, setRhPct] = useState("");
  const [ppfd, setPpfd] = useState("");
  const [photoperiod, setPhotoperiod] = useState("");
  const [ph, setPh] = useState("");
  const [ec, setEc] = useState("");
  const [notes, setNotes] = useState("");

  // Função de validação em tempo real
  const getValidationState = (value: string, min?: number | string | null, max?: number | string | null): "valid" | "warning" | "invalid" | "neutral" => {
    if (!value || !min || !max) return "neutral";
    
    const numValue = parseFloat(value);
    const numMin = typeof min === "string" ? parseFloat(min) : min;
    const numMax = typeof max === "string" ? parseFloat(max) : max;
    
    if (isNaN(numValue) || isNaN(numMin) || isNaN(numMax)) return "neutral";
    
    // Verde: dentro da faixa ideal
    if (numValue >= numMin && numValue <= numMax) return "valid";
    
    // Amarelo: próximo da faixa (10% de tolerância)
    const range = numMax - numMin;
    const tolerance = range * 0.1;
    if (numValue >= numMin - tolerance && numValue <= numMax + tolerance) return "warning";
    
    // Vermelho: fora da faixa
    return "invalid";
  };

  // Calcular fase e semana atual
  const currentPhaseInfo = useMemo(() => {
    if (!cycle || !tent) return null;

    const now = new Date();
    const startDate = new Date(cycle.startDate);
    const floraStartDate = cycle.floraStartDate ? new Date(cycle.floraStartDate) : null;

    let phase: "VEGA" | "FLORA" | "MAINTENANCE" | "CLONING" = "VEGA";
    let weekNumber = 1;

    if (tent.tentType === "A") {
      // Estufa A: Manutenção ou Clonagem (simplificado para MAINTENANCE)
      phase = "MAINTENANCE";
      weekNumber = 1;
    } else if (floraStartDate && now >= floraStartDate) {
      phase = "FLORA";
      const weeksSinceFlora = Math.floor((now.getTime() - floraStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      weekNumber = Math.min(weeksSinceFlora + 1, 8);
    } else {
      phase = "VEGA";
      const weeksSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      weekNumber = Math.min(weeksSinceStart + 1, 6);
    }

    return { phase, weekNumber };
  }, [cycle, tent]);

  // Buscar targets da semana atual por strainId do ciclo
  const { data: weeklyTargets = [] } = trpc.weeklyTargets.getByStrain.useQuery(
    { strainId: cycle?.strainId || 0 },
    { enabled: !!cycle?.strainId }
  );

  const currentTargets = useMemo(() => {
    if (!currentPhaseInfo || weeklyTargets.length === 0) return null;

    return weeklyTargets.find(
      (t: any) => t.phase === currentPhaseInfo.phase && t.weekNumber === currentPhaseInfo.weekNumber
    );
  }, [weeklyTargets, currentPhaseInfo]);

  // Estados de validação
  const ppfdValidation = getValidationState(ppfd, currentTargets?.ppfdMin, currentTargets?.ppfdMax);
  const tempValidation = getValidationState(tempC, currentTargets?.tempMin, currentTargets?.tempMax);
  const rhValidation = getValidationState(rhPct, currentTargets?.rhMin, currentTargets?.rhMax);
  const phValidation = getValidationState(ph, currentTargets?.phMin, currentTargets?.phMax);
  const ecValidation = getValidationState(ec, currentTargets?.ecMin, currentTargets?.ecMax);

  const utils = trpc.useUtils();
  const createLog = trpc.dailyLogs.create.useMutation({
    onSuccess: () => {
      toast.success("Registro salvo com sucesso!");
      // Limpar formulário
      setTempC("");
      setRhPct("");
      setPpfd("");
      setPhotoperiod("");
      setPh("");
      setEc("");
      setNotes("");
      // Invalidar cache
      utils.dailyLogs.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  // Helper para classes de validação
  const getValidationClasses = (state: "valid" | "warning" | "invalid" | "neutral") => {
    switch (state) {
      case "valid":
        return "border-green-500 focus-visible:ring-green-500";
      case "warning":
        return "border-yellow-500 focus-visible:ring-yellow-500";
      case "invalid":
        return "border-red-500 focus-visible:ring-red-500";
      default:
        return "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tempC && !rhPct && !ppfd) {
      toast.error("Preencha pelo menos um campo de medição");
      return;
    }

    createLog.mutate({
      tentId,
      logDate: new Date(),
      turn,
      tempC: tempC ? tempC : undefined,
      rhPct: rhPct ? rhPct : undefined,
      ppfd: ppfd ? parseInt(ppfd) : undefined,
      notes: notes || undefined,
    });
  };

  if (tentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Estufa não encontrada</p>
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
      return { phase: "Inativo", color: "bg-gray-500" };
    }

    if (tent.tentType === "A") {
      return { phase: "Manutenção", color: "bg-blue-500" };
    }

    if (cycle.floraStartDate) {
      return { phase: "Floração", color: "bg-purple-500" };
    }

    return { phase: "Vegetativa", color: "bg-green-500" };
  };

  const phaseInfo = getPhaseInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Sprout className="w-7 h-7 text-primary" />
                Registro - {tent.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Tipo {tent.tentType} • {tent.width}×{tent.depth}×{tent.height}cm
              </p>
            </div>
            <Badge className={`${phaseInfo.color} text-white border-0`}>{phaseInfo.phase}</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-5xl">
        {/* Cycle Info */}
        {cycle && currentPhaseInfo && (
          <Card className="bg-white/90 backdrop-blur-sm border-green-100 mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Ciclo Ativo</p>
                  <p className="text-lg font-semibold text-gray-900">
                    Semana {currentPhaseInfo.weekNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fase</p>
                  <p className="text-lg font-semibold text-gray-900">{phaseInfo.phase}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data de Início</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(cycle.startDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dias Decorridos</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {Math.floor((Date.now() - new Date(cycle.startDate).getTime()) / (24 * 60 * 60 * 1000))}{" "}
                    dias
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Valores de Referência */}
        {currentTargets && (
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 mb-6">
            <CardHeader>
              <CardTitle className="text-blue-900">📊 Valores Ideais da Semana</CardTitle>
              <CardDescription className="text-blue-700">
                Targets de referência para comparação com suas medições
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white/80 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Sun className="w-4 h-4 text-orange-600" />
                    <p className="text-xs font-medium text-gray-700">PPFD</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {currentTargets.ppfdMin}-{currentTargets.ppfdMax}
                  </p>
                  <p className="text-xs text-gray-600">µmol/m²/s</p>
                </div>

                <div className="bg-white/80 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-cyan-600" />
                    <p className="text-xs font-medium text-gray-700">Fotoperíodo</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{currentTargets.photoperiod}</p>
                  <p className="text-xs text-gray-600">Luz/Escuro</p>
                </div>

                <div className="bg-white/80 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <ThermometerSun className="w-4 h-4 text-red-600" />
                    <p className="text-xs font-medium text-gray-700">Temperatura</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {currentTargets.tempMin}-{currentTargets.tempMax}
                  </p>
                  <p className="text-xs text-gray-600">°C</p>
                </div>

                <div className="bg-white/80 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-medium text-gray-700">Umidade</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {currentTargets.rhMin}-{currentTargets.rhMax}
                  </p>
                  <p className="text-xs text-gray-600">%</p>
                </div>

                <div className="bg-white/80 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Beaker className="w-4 h-4 text-purple-600" />
                    <p className="text-xs font-medium text-gray-700">pH</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {currentTargets.phMin}-{currentTargets.phMax}
                  </p>
                  <p className="text-xs text-gray-600">Ideal</p>
                </div>

                <div className="bg-white/80 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <FlaskConical className="w-4 h-4 text-pink-600" />
                    <p className="text-xs font-medium text-gray-700">EC</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {currentTargets.ecMin}-{currentTargets.ecMax}
                  </p>
                  <p className="text-xs text-gray-600">mS/cm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Log Form */}
        <Card className="bg-white/90 backdrop-blur-sm border-green-100">
          <CardHeader>
            <CardTitle>Novo Registro</CardTitle>
            <CardDescription>
              Registre as medições ambientais da estufa. Data:{" "}
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Turn Selection */}
              <div className="space-y-2">
                <Label>Turno</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={turn === "AM" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setTurn("AM")}
                  >
                    Manhã (AM)
                  </Button>
                  <Button
                    type="button"
                    variant={turn === "PM" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setTurn("PM")}
                  >
                    Noite (PM)
                  </Button>
                </div>
              </div>

              {/* Measurements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* PPFD */}
                <div className="space-y-2">
                  <Label htmlFor="ppfd" className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-orange-600" />
                    PPFD (µmol/m²/s)
                  </Label>
                  <Input
                    id="ppfd"
                    type="number"
                    placeholder="Ex: 550"
                    value={ppfd}
                    onChange={(e) => setPpfd(e.target.value)}
                    className={`text-lg ${getValidationClasses(ppfdValidation)}`}
                  />
                  {currentTargets && (
                    <p className="text-xs text-blue-600 font-medium">
                      ✓ Ideal: {currentTargets.ppfdMin}-{currentTargets.ppfdMax}
                    </p>
                  )}
                </div>

                {/* Photoperiod */}
                <div className="space-y-2">
                  <Label htmlFor="photoperiod" className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-600" />
                    Fotoperíodo
                  </Label>
                  <Input
                    id="photoperiod"
                    type="text"
                    placeholder="Ex: 18/6"
                    value={photoperiod}
                    onChange={(e) => setPhotoperiod(e.target.value)}
                    className="text-lg"
                  />
                  {currentTargets && (
                    <p className="text-xs text-blue-600 font-medium">
                      ✓ Ideal: {currentTargets.photoperiod}
                    </p>
                  )}
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <Label htmlFor="temp" className="flex items-center gap-2">
                    <ThermometerSun className="w-4 h-4 text-red-600" />
                    Temperatura (°C)
                  </Label>
                  <Input
                    id="temp"
                    type="text"
                    placeholder="Ex: 24.5"
                    value={tempC}
                    onChange={(e) => setTempC(e.target.value)}
                    className={`text-lg ${getValidationClasses(tempValidation)}`}
                  />
                  {currentTargets && (
                    <p className="text-xs text-blue-600 font-medium">
                      ✓ Ideal: {currentTargets.tempMin}-{currentTargets.tempMax}°C
                    </p>
                  )}
                </div>

                {/* Humidity */}
                <div className="space-y-2">
                  <Label htmlFor="rh" className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    Umidade Relativa (%)
                  </Label>
                  <Input
                    id="rh"
                    type="text"
                    placeholder="Ex: 65.0"
                    value={rhPct}
                    onChange={(e) => setRhPct(e.target.value)}
                    className={`text-lg ${getValidationClasses(rhValidation)}`}
                  />
                  {currentTargets && (
                    <p className="text-xs text-blue-600 font-medium">
                      ✓ Ideal: {currentTargets.rhMin}-{currentTargets.rhMax}%
                    </p>
                  )}
                </div>

                {/* pH */}
                <div className="space-y-2">
                  <Label htmlFor="ph" className="flex items-center gap-2">
                    <Beaker className="w-4 h-4 text-purple-600" />
                    pH
                  </Label>
                  <Input
                    id="ph"
                    type="text"
                    placeholder="Ex: 6.2"
                    value={ph}
                    onChange={(e) => setPh(e.target.value)}
                    className={`text-lg ${getValidationClasses(phValidation)}`}
                  />
                  {currentTargets && (
                    <p className="text-xs text-blue-600 font-medium">
                      ✓ Ideal: {currentTargets.phMin}-{currentTargets.phMax}
                    </p>
                  )}
                </div>

                {/* EC */}
                <div className="space-y-2">
                  <Label htmlFor="ec" className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-pink-600" />
                    EC (mS/cm)
                  </Label>
                  <Input
                    id="ec"
                    type="text"
                    placeholder="Ex: 1.6"
                    value={ec}
                    onChange={(e) => setEc(e.target.value)}
                    className={`text-lg ${getValidationClasses(ecValidation)}`}
                  />
                  {currentTargets && (
                    <p className="text-xs text-blue-600 font-medium">
                      ✓ Ideal: {currentTargets.ecMin}-{currentTargets.ecMax}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações (Opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione observações sobre o estado das plantas, ajustes realizados, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={createLog.isPending}>
                  {createLog.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Registro
                    </>
                  )}
                </Button>
                <Button asChild type="button" variant="outline">
                  <Link href="/">Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="mt-6 bg-blue-50/80 backdrop-blur-sm border-blue-100">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-3">💡 Dicas de Medição</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Realize medições sempre nos mesmos horários para consistência</li>
              <li>• Aguarde alguns minutos após abrir a estufa para medições precisas</li>
              <li>• Compare seus valores com os ideais exibidos acima</li>
              <li>• Registre observações sobre mudanças no crescimento ou problemas</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

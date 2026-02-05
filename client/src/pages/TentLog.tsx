import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sprout, ThermometerSun, Droplets, Sun, ArrowLeft, Save } from "lucide-react";
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
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();
  const createLog = trpc.dailyLogs.create.useMutation({
    onSuccess: () => {
      toast.success("Registro salvo com sucesso!");
      // Limpar formulário
      setTempC("");
      setRhPct("");
      setPpfd("");
      setNotes("");
      // Invalidar cache
      utils.dailyLogs.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

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
      <main className="container py-8 max-w-4xl">
        {/* Cycle Info */}
        {cycle && (
          <Card className="bg-white/90 backdrop-blur-sm border-green-100 mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Ciclo Ativo</p>
                  <p className="text-lg font-semibold text-gray-900">
                    Semana{" "}
                    {Math.floor(
                      (Date.now() - new Date(cycle.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)
                    ) + 1}
                  </p>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Temperature */}
                <div className="space-y-2">
                  <Label htmlFor="temp" className="flex items-center gap-2">
                    <ThermometerSun className="w-4 h-4 text-orange-600" />
                    Temperatura (°C)
                  </Label>
                  <Input
                    id="temp"
                    type="text"
                    placeholder="Ex: 24.5"
                    value={tempC}
                    onChange={(e) => setTempC(e.target.value)}
                    className="text-lg"
                  />
                  <p className="text-xs text-gray-500">Faixa ideal: 20-26°C</p>
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
                    className="text-lg"
                  />
                  <p className="text-xs text-gray-500">Faixa ideal: 50-70%</p>
                </div>

                {/* PPFD */}
                <div className="space-y-2">
                  <Label htmlFor="ppfd" className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-yellow-600" />
                    PPFD (µmol/m²/s)
                  </Label>
                  <Input
                    id="ppfd"
                    type="number"
                    placeholder="Ex: 450"
                    value={ppfd}
                    onChange={(e) => setPpfd(e.target.value)}
                    className="text-lg"
                  />
                  <p className="text-xs text-gray-500">Faixa ideal: 300-600</p>
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
              <li>• Registre observações sobre mudanças no crescimento ou problemas</li>
              <li>• Valores fora da faixa ideal gerarão alertas automáticos</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

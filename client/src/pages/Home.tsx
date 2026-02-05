import { trpc } from "@/lib/trpc";
import { useState } from "react";
import StartCycleModal from "@/components/StartCycleModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Sprout, Droplets, Sun, ThermometerSun, Wind } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Home() {
  const [cycleModalOpen, setCycleModalOpen] = useState(false);
  const [selectedTent, setSelectedTent] = useState<{ id: number; name: string } | null>(null);
  
  const { data: tents, isLoading } = trpc.tents.list.useQuery();
  const { data: activeCycles } = trpc.cycles.listActive.useQuery();
  const { data: weeklyTargets } = trpc.weeklyTargets.getCurrentWeekTargets.useQuery();

  const handleStartCycle = (tentId: number, tentName: string) => {
    setSelectedTent({ id: tentId, name: tentName });
    setCycleModalOpen(true);
  };

  const utils = trpc.useUtils();
  const startFlora = trpc.cycles.startFlora.useMutation({
    onSuccess: () => {
      utils.cycles.listActive.invalidate();
      utils.tents.list.invalidate();
    },
  });

  const handleStartFlora = (cycleId: number, tentName: string) => {
    startFlora.mutate(
      {
        cycleId,
        floraStartDate: new Date(),
      },
      {
        onSuccess: () => {
          toast.success(`Fase de floração iniciada na ${tentName}!`);
        },
        onError: (error) => {
          toast.error(`Erro ao iniciar floração: ${error.message}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getTentCycle = (tentId: number) => {
    return activeCycles?.find((c) => c.tentId === tentId);
  };

  const getPhaseInfo = (tentType: string, cycle: any) => {
    if (!cycle) {
      return { phase: "Inativo", color: "bg-gray-500", icon: Wind };
    }

    if (tentType === "A") {
      // Estufa A: Clonagem ou Manutenção
      return {
        phase: "Manutenção",
        color: "bg-blue-500",
        icon: Sprout,
      };
    }

    // Estufas B/C: Vega ou Flora
    if (cycle.floraStartDate) {
      return {
        phase: "Floração",
        color: "bg-purple-500",
        icon: Sprout,
      };
    }

    return {
      phase: "Vegetativa",
      color: "bg-green-500",
      icon: Sprout,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sprout className="w-8 h-8 text-primary" />
                App Cultivo
              </h1>
              <p className="text-gray-600 mt-1">Gerenciamento de Estufas</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1.5 text-sm">
                <Droplets className="w-4 h-4 mr-2" />
                Sistema Ativo
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Valores Ideais (Targets) */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Valores Ideais da Semana</h2>
          <p className="text-sm text-gray-600 mt-1">Targets baseados na fase e semana atual dos ciclos ativos</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {/* PPFD */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide mb-1">PPFD</p>
              <p className="text-2xl font-bold text-orange-900">
                {weeklyTargets && weeklyTargets.length > 0
                  ? `${weeklyTargets[0].ppfdMin}-${weeklyTargets[0].ppfdMax}`
                  : "--"}
              </p>
              <p className="text-xs text-orange-700 mt-1">
                {weeklyTargets && weeklyTargets.length > 0 ? "µmol" : "Sem ciclo ativo"}
              </p>
              <p className="text-xs text-orange-600 mt-2">Ideal</p>
            </CardContent>
          </Card>

          {/* Fotoperíodo */}
          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide mb-1">FOTOPERÍODO</p>
              <p className="text-2xl font-bold text-teal-900">
                {weeklyTargets && weeklyTargets.length > 0 ? weeklyTargets[0].photoperiod : "--"}
              </p>
              <p className="text-xs text-teal-700 mt-1">
                {weeklyTargets && weeklyTargets.length > 0 ? "H" : "Sem ciclo ativo"}
              </p>
              <p className="text-xs text-teal-600 mt-2">Ideal</p>
            </CardContent>
          </Card>

          {/* Temperatura */}
          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-pink-800 uppercase tracking-wide mb-1">TEMP</p>
              <p className="text-2xl font-bold text-pink-900">
                {weeklyTargets && weeklyTargets.length > 0
                  ? `${weeklyTargets[0].tempMin}-${weeklyTargets[0].tempMax}`
                  : "--"}
              </p>
              <p className="text-xs text-pink-700 mt-1">
                {weeklyTargets && weeklyTargets.length > 0 ? "°C" : "Sem ciclo ativo"}
              </p>
              <p className="text-xs text-pink-600 mt-2">Ideal</p>
            </CardContent>
          </Card>

          {/* Umidade */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">UMIDADE</p>
              <p className="text-2xl font-bold text-blue-900">
                {weeklyTargets && weeklyTargets.length > 0
                  ? `${weeklyTargets[0].rhMin}-${weeklyTargets[0].rhMax}`
                  : "--"}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {weeklyTargets && weeklyTargets.length > 0 ? "%" : "Sem ciclo ativo"}
              </p>
              <p className="text-xs text-blue-600 mt-2">Ideal</p>
            </CardContent>
          </Card>

          {/* pH */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-purple-800 uppercase tracking-wide mb-1">pH</p>
              <p className="text-2xl font-bold text-purple-900">
                {weeklyTargets && weeklyTargets.length > 0
                  ? `${weeklyTargets[0].phMin}-${weeklyTargets[0].phMax}`
                  : "--"}
              </p>
              <p className="text-xs text-purple-700 mt-1">
                {weeklyTargets && weeklyTargets.length > 0 ? "" : "Sem ciclo ativo"}
              </p>
              <p className="text-xs text-purple-600 mt-2">Ideal</p>
            </CardContent>
          </Card>

          {/* EC */}
          <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-rose-800 uppercase tracking-wide mb-1">EC</p>
              <p className="text-2xl font-bold text-rose-900">
                {weeklyTargets && weeklyTargets.length > 0
                  ? `${weeklyTargets[0].ecMin}-${weeklyTargets[0].ecMax}`
                  : "--"}
              </p>
              <p className="text-xs text-rose-700 mt-1">
                {weeklyTargets && weeklyTargets.length > 0 ? "mS/cm" : "Sem ciclo ativo"}
              </p>
              <p className="text-xs text-rose-600 mt-2">Ideal</p>
            </CardContent>
          </Card>
        </div>

        {/* Tents Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Estufas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tents?.map((tent) => {
            const cycle = getTentCycle(tent.id);
            const phaseInfo = getPhaseInfo(tent.tentType, cycle);
            const PhaseIcon = phaseInfo.icon;

            return (
              <Card
                key={tent.id}
                className="bg-white/90 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {tent.name}
                        <Badge className={`${phaseInfo.color} text-white border-0`}>
                          <PhaseIcon className="w-3 h-3 mr-1" />
                          {phaseInfo.phase}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Tipo {tent.tentType} • {tent.width}×{tent.depth}×{tent.height}cm
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Cycle Info */}
                    {cycle ? (
                      <div className="bg-green-50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Ciclo Ativo</span>
                          <span className="font-medium text-gray-900">
                            Semana {Math.floor((Date.now() - new Date(cycle.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Início</span>
                          <span className="font-medium text-gray-900">
                            {new Date(cycle.startDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600">Nenhum ciclo ativo</p>
                      </div>
                    )}

                    {/* Environment Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-orange-50 rounded-lg p-3 text-center">
                        <ThermometerSun className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Temp</p>
                        <p className="text-sm font-bold text-gray-900">--°C</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <Droplets className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">RH</p>
                        <p className="text-sm font-bold text-gray-900">--%</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3 text-center">
                        <Sun className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">PPFD</p>
                        <p className="text-sm font-bold text-gray-900">--</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button asChild variant="default" className="flex-1">
                        <Link href={`/tent/${tent.id}`}>Ver Detalhes</Link>
                      </Button>
                      {!cycle && (tent.tentType === "B" || tent.tentType === "C") ? (
                        <Button 
                          onClick={() => handleStartCycle(tent.id, tent.name)}
                          variant="outline" 
                          className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                        >
                          Iniciar Ciclo
                        </Button>
                      ) : cycle && !cycle.floraStartDate && (tent.tentType === "B" || tent.tentType === "C") ? (
                        <Button 
                          onClick={() => handleStartFlora(cycle.id, tent.name)}
                          variant="outline" 
                          className="flex-1 border-purple-500 text-purple-600 hover:bg-purple-50"
                        >
                          Iniciar Floração
                        </Button>
                      ) : (
                        <Button asChild variant="outline" className="flex-1">
                          <Link href={`/tent/${tent.id}/log`}>Registrar</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-lg border border-green-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link href="/strains">
                <Sprout className="w-6 h-6" />
                <span>Gerenciar Strains</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link href="/tasks">
                <Wind className="w-6 h-6" />
                <span>Tarefas</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link href="/alerts">
                <ThermometerSun className="w-6 h-6" />
                <span>Alertas</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link href="/analytics">
                <Sun className="w-6 h-6" />
                <span>Análise</span>
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Start Cycle Modal */}
      {selectedTent && (
        <StartCycleModal
          tentId={selectedTent.id}
          tentName={selectedTent.name}
          open={cycleModalOpen}
          onOpenChange={setCycleModalOpen}
        />
      )}
    </div>
  );
}

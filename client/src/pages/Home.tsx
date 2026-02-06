import { trpc } from "@/lib/trpc";
import { useState } from "react";
import StartCycleModal from "@/components/StartCycleModal";
import { InitiateCycleModal } from "@/components/InitiateCycleModal";
import { EditCycleModal } from "@/components/EditCycleModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Sprout, Droplets, Sun, ThermometerSun, Wind, BookOpen, CheckCircle2, Calculator } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { generateCycleReport } from "@/lib/pdfExport";

export default function Home() {
  const [cycleModalOpen, setCycleModalOpen] = useState(false);
  const [selectedTent, setSelectedTent] = useState<{ id: number; name: string } | null>(null);
  const [initiateModalOpen, setInitiateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<any>(null);
  
  const { data: tents, isLoading } = trpc.tents.list.useQuery();
  const { data: activeCycles } = trpc.cycles.listActive.useQuery();

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

  const finalizeCycle = trpc.cycles.finalize.useMutation({
    onSuccess: () => {
      toast.success("Ciclo finalizado com sucesso!");
      utils.cycles.listActive.invalidate();
      utils.cycles.getByTent.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao finalizar ciclo: ${error.message}`);
    },
  });

  const handleFinalizeCycle = (cycleId: number, tentName: string) => {
    if (confirm(`Tem certeza que deseja finalizar o ciclo da ${tentName}?`)) {
      finalizeCycle.mutate({ cycleId });
    }
  };

  const handleInitiateCycle = (tentId: number, tentName: string) => {
    setSelectedTent({ id: tentId, name: tentName });
    setInitiateModalOpen(true);
  };

  const handleEditCycle = (cycle: any, tent: any) => {
    setSelectedCycle(cycle);
    setSelectedTent({ id: tent.id, name: tent.name });
    setEditModalOpen(true);
  };

  const handleExportPDF = async (cycleId: number) => {
    try {
      toast.info("Gerando relatório PDF...");
      // Usar fetch direto para buscar dados
      const response = await fetch(`/api/trpc/cycles.getReportData?input=${encodeURIComponent(JSON.stringify({ cycleId }))}`);
      const result = await response.json();
      const data = result.result.data;
      await generateCycleReport(data);
      toast.success("Relatório exportado com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao exportar relatório: ${error.message}`);
    }
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
              <TentCard
                key={tent.id}
                tent={tent}
                cycle={cycle}
                phaseInfo={phaseInfo}
                PhaseIcon={PhaseIcon}
                onStartCycle={handleStartCycle}
                onStartFlora={handleStartFlora}
                onInitiateCycle={handleInitiateCycle}
                onEditCycle={handleEditCycle}
                onFinalizeCycle={handleFinalizeCycle}
                onExportPDF={handleExportPDF}
              />
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-lg border border-green-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link href="/manage-strains">
                <Sprout className="w-6 h-6" />
                <span>Gerenciar Strains</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2" disabled>
              <Link href="/calculators">
                <Calculator className="w-6 h-6" />
                <span>Calculadoras</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link href="/history">
                <Wind className="w-6 h-6" />
                <span>Histórico</span>
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

      {/* Initiate Cycle Modal */}
      {selectedTent && (
        <InitiateCycleModal
          open={initiateModalOpen}
          onOpenChange={setInitiateModalOpen}
          tentId={selectedTent.id}
          tentName={selectedTent.name}
        />
      )}

      {/* Edit Cycle Modal */}
      {selectedTent && selectedCycle && (
        <EditCycleModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          cycleId={selectedCycle.id}
          tentId={selectedTent.id}
          tentName={selectedTent.name}
          currentStartDate={selectedCycle.startDate}
          currentFloraStartDate={selectedCycle.floraStartDate}
        />
      )}
    </div>
  );
}

// Separate component for Tent Card with Tasks
function TentCard({ tent, cycle, phaseInfo, PhaseIcon, onStartCycle, onStartFlora, onInitiateCycle, onEditCycle, onFinalizeCycle, onExportPDF }: any) {
  const { data: tasks, isLoading: tasksLoading } = trpc.tasks.getTasksByTent.useQuery(
    { tentId: tent.id },
    { enabled: !!cycle } // Only fetch if there's an active cycle
  );
  
  const { data: latestLog } = trpc.dailyLogs.getLatestByTent.useQuery(
    { tentId: tent.id }
  );

  const utils = trpc.useUtils();
  const toggleTask = trpc.tasks.toggleTask.useMutation({
    onSuccess: () => {
      utils.tasks.getTasksByTent.invalidate({ tentId: tent.id });
      toast.success("Tarefa atualizada!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar tarefa: ${error.message}`);
    },
  });

  const handleToggleTask = (taskId: number) => {
    toggleTask.mutate({ taskId });
  };

  const completedTasks = tasks?.filter((t) => t.isDone).length || 0;
  const totalTasks = tasks?.length || 0;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Ciclo Ativo</span>
                <span className="text-sm font-semibold text-green-700">
                  Semana {(() => {
                    const now = new Date();
                    const start = new Date(cycle.startDate);
                    const floraStart = cycle.floraStartDate ? new Date(cycle.floraStartDate) : null;
                    
                    if (floraStart && now >= floraStart) {
                      return Math.floor((now.getTime() - floraStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
                    }
                    return Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Início</span>
                <span className="text-xs font-medium text-gray-700">
                  {new Date(cycle.startDate).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Nenhum ciclo ativo</p>
            </div>
          )}

          {/* Weekly Tasks */}
          {cycle && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Tarefas da Semana
                </h4>
                {totalTasks > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {completedTasks}/{totalTasks}
                  </Badge>
                )}
              </div>

              {tasksLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              ) : tasks && tasks.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.isDone}
                        onCheckedChange={() => handleToggleTask(task.id)}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={`task-${task.id}`}
                        className={`text-sm cursor-pointer flex-1 ${
                          task.isDone ? "line-through text-gray-500" : "text-gray-700"
                        }`}
                      >
                        {task.title}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-2">
                  Nenhuma tarefa para esta semana
                </p>
              )}
            </div>
          )}

          {/* Latest Readings */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t">
            <div className="text-center">
              <ThermometerSun className="w-5 h-5 mx-auto text-orange-500 mb-1" />
              <p className="text-xs text-gray-600">Temp</p>
              <p className="text-sm font-semibold text-gray-900">
                {latestLog?.tempC ? `${latestLog.tempC}°C` : "--°C"}
              </p>
            </div>
            <div className="text-center">
              <Droplets className="w-5 h-5 mx-auto text-blue-500 mb-1" />
              <p className="text-xs text-gray-600">RH</p>
              <p className="text-sm font-semibold text-gray-900">
                {latestLog?.rhPct ? `${latestLog.rhPct}%` : "--%"}
              </p>
            </div>
            <div className="text-center">
              <Sun className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
              <p className="text-xs text-gray-600">PPFD</p>
              <p className="text-sm font-semibold text-gray-900">
                {latestLog?.ppfd || "--"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-4">
            <div key={`actions-primary-${tent.id}`} className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href={`/tent/${tent.id}`}>Ver Detalhes</Link>
              </Button>
              {!cycle ? (
                <Button
                  onClick={() => onInitiateCycle(tent.id, tent.name)}
                  variant="outline"
                  className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                >
                  Novo Ciclo
                </Button>
              ) : (
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/tent/${tent.id}/log`}>Registrar</Link>
                </Button>
              )}
            </div>
            {cycle && (
              <>
                <div key={`actions-secondary-${tent.id}`} className="flex gap-2">
                  <Button
                    onClick={() => onEditCycle(cycle, tent)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Editar Ciclo
                  </Button>
                  <Button
                    onClick={() => onExportPDF(cycle.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    Exportar PDF
                  </Button>
                </div>
                <Button
                  onClick={() => onFinalizeCycle(cycle.id, tent.name)}
                  variant="outline"
                  size="sm"
                  className="w-full border-red-500 text-red-600 hover:bg-red-50"
                >
                  Finalizar Ciclo
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

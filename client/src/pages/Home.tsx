import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { WeatherWidget } from "@/components/WeatherWidget";
import StartCycleModal from "@/components/StartCycleModal";
import { InitiateCycleModal } from "@/components/InitiateCycleModal";
import { EditCycleModal } from "@/components/EditCycleModal";
import { CreateTentModal } from "@/components/CreateTentModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Sprout, Droplets, Sun, ThermometerSun, Wind, BookOpen, CheckCircle2, Calculator, Bell, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";


export default function Home() {
  const [, setLocation] = useLocation();
  const [cycleModalOpen, setCycleModalOpen] = useState(false);
  const [selectedTent, setSelectedTent] = useState<{ id: number; name: string } | null>(null);
  const [initiateModalOpen, setInitiateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<any>(null);
  const [createTentModalOpen, setCreateTentModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tentToDelete, setTentToDelete] = useState<{ id: number; name: string } | null>(null);

  
  const { data: tents, isLoading } = trpc.tents.list.useQuery();
  const { data: activeCycles } = trpc.cycles.listActive.useQuery();

  const handleStartCycle = (tentId: number, tentName: string) => {
    setSelectedTent({ id: tentId, name: tentName });
    setCycleModalOpen(true);
  };

  const deleteTent = trpc.tents.delete.useMutation({
    onSuccess: () => {
      utils.tents.list.invalidate();
      toast.success("Estufa excluída com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeleteTent = (tentId: number, tentName: string) => {
    setTentToDelete({ id: tentId, name: tentName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTent = () => {
    if (tentToDelete) {
      deleteTent.mutate({ id: tentToDelete.id });
      setDeleteDialogOpen(false);
      setTentToDelete(null);
    }
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



  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      description: 'Criar Nova Estufa',
      action: () => {
        setCreateTentModalOpen(true);
        toast.success('Atalho acionado: Criar Nova Estufa');
      },
    },
    {
      key: 'h',
      ctrl: true,
      description: 'Ir para Histórico',
      action: () => {
        setLocation('/history');
        toast.success('Atalho acionado: Histórico');
      },
    },
    {
      key: 'c',
      ctrl: true,
      description: 'Ir para Calculadoras',
      action: () => {
        setLocation('/calculators');
        toast.success('Atalho acionado: Calculadoras');
      },
    },
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getTentCycle = (tentId: number) => {
    return activeCycles?.find((c) => c.tentId === tentId);
  };

  const getPhaseInfo = (tentType: string, cycle: any) => {
    if (!cycle) {
      return { phase: "Inativo", color: "bg-muted0", icon: Wind };
    }

    if (tentType === "A") {
      // Estufa A: Clonagem ou Manutenção
      return {
        phase: "Manutenção",
        color: "bg-blue-500/100",
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
      color: "bg-primary/100",
      icon: Sprout,
    };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Sprout className="w-8 h-8 text-primary" />
                App Cultivo
              </h1>
              <p className="text-muted-foreground mt-1">Gerenciamento de Estufas</p>
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
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Estufas</h2>
          <Button onClick={() => setCreateTentModalOpen(true)} className="gap-2">
            <Sprout className="w-4 h-4" />
            Criar Nova Estufa
          </Button>
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
                onDeleteTent={handleDeleteTent}
              />
            );
          })}
        </div>

        {/* Weather Widget */}
        <div className="mt-8">
          <WeatherWidget />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-card/80 backdrop-blur-sm rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link href="/manage-strains">
                <Sprout className="w-6 h-6" />
                <span>Gerenciar Strains</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
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
                <Bell className="w-6 h-6" />
                <span>Alertas</span>
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
          currentStrainId={selectedCycle.strainId}
        />
      )}

      {/* Create Tent Modal */}
      <CreateTentModal
        open={createTentModalOpen}
        onOpenChange={setCreateTentModalOpen}
      />

      {/* Delete Tent Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a estufa "{tentToDelete?.name}"? 
              Esta ação não pode ser desfeita e todos os dados relacionados (ciclos finalizados, registros, tarefas) serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTent}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Estufa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Separate component for Tent Card with Tasks
function TentCard({ tent, cycle, phaseInfo, PhaseIcon, onStartCycle, onStartFlora, onInitiateCycle, onEditCycle, onFinalizeCycle, onDeleteTent }: any) {
  const { data: tasks, isLoading: tasksLoading } = trpc.tasks.getTasksByTent.useQuery(
    { tentId: tent.id },
    { enabled: !!cycle } // Only fetch if there's an active cycle
  );
  
  const { data: latestLog } = trpc.dailyLogs.getLatestByTent.useQuery(
    { tentId: tent.id }
  );
  
  // Buscar targets ideais - usa média das strains das plantas na estufa
  const currentWeek = cycle ? (() => {
    const now = new Date();
    const start = new Date(cycle.startDate);
    const floraStart = cycle.floraStartDate ? new Date(cycle.floraStartDate) : null;
    
    if (floraStart && now >= floraStart) {
      return Math.floor((now.getTime() - floraStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    }
    return Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
  })() : null;
  
  const currentPhase = cycle ? (cycle.floraStartDate ? "FLORA" : "VEGA") : null;
  
  const { data: targets } = trpc.weeklyTargets.getTargetsByTent.useQuery(
    { tentId: tent.id, phase: currentPhase! as any, weekNumber: currentWeek! },
    { enabled: !!cycle && !!currentPhase && !!currentWeek }
  );
  
  // Função para determinar cor baseada no valor e target
  const getValueColor = (value: number | null | undefined, min: string | number | null | undefined, max: string | number | null | undefined) => {
    if (!value || !min || !max) return "text-foreground";
    
    // Converter strings para números
    const minNum = typeof min === 'string' ? parseFloat(min) : min;
    const maxNum = typeof max === 'string' ? parseFloat(max) : max;
    
    if (isNaN(minNum) || isNaN(maxNum)) return "text-foreground";
    
    // Verde: dentro da faixa ideal
    if (value >= minNum && value <= maxNum) {
      return "text-green-600 font-bold";
    }
    
    // Amarelo: próximo (±10% de tolerância)
    const tolerance = 0.1;
    const lowerBound = minNum * (1 - tolerance);
    const upperBound = maxNum * (1 + tolerance);
    
    if (value >= lowerBound && value <= upperBound) {
      return "text-yellow-600 font-bold";
    }
    
    // Vermelho: fora da faixa
    return "text-red-600 font-bold";
  };

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
    <Card className="bg-card/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
            <CardDescription className="mt-2 space-y-1">
              <div className="flex items-center gap-3">
                <span>Tipo {tent.tentType} • {tent.width}×{tent.depth}×{tent.height}cm</span>
                {tent.plantCount !== undefined && (
                  <Link href={`/plants?tent=${tent.id}`}>
                    <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors">
                      <Sprout className="w-3 h-3" />
                      {tent.plantCount} {tent.plantCount === 1 ? 'planta' : 'plantas'}
                    </Badge>
                  </Link>
                )}
              </div>
              {tent.tentStrains && tent.tentStrains.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {tent.tentStrains.map((s: any) => (
                    <Badge key={s.id} variant="secondary" className="text-xs px-2 py-0">
                      {s.name}
                    </Badge>
                  ))}
                  {tent.tentStrains.length > 1 && (
                    <span className="text-xs text-muted-foreground italic">(média)</span>
                  )}
                </div>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Cycle Info */}
          {cycle ? (
            <div className="bg-primary/10 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Ciclo Ativo</span>
                <span className="text-sm font-semibold text-primary">
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
                <span className="text-xs text-muted-foreground">Semana Atual</span>
                <span className="text-xs font-medium text-foreground">
                  {(() => {
                    const now = new Date();
                    const start = new Date(cycle.startDate);
                    const floraStart = cycle.floraStartDate ? new Date(cycle.floraStartDate) : null;
                    
                    // Calcular a data de início da semana atual
                    let weekStart;
                    if (floraStart && now >= floraStart) {
                      const weeksSinceFlora = Math.floor((now.getTime() - floraStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
                      weekStart = new Date(floraStart.getTime() + (weeksSinceFlora * 7 * 24 * 60 * 60 * 1000));
                    } else {
                      const weeksSinceStart = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
                      weekStart = new Date(start.getTime() + (weeksSinceStart * 7 * 24 * 60 * 60 * 1000));
                    }
                    
                    return weekStart.toLocaleDateString("pt-BR");
                  })()}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Nenhum ciclo ativo</p>
            </div>
          )}

          {/* Weekly Tasks */}
          {cycle && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
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
                      className="flex items-start gap-2 p-2 rounded hover:bg-muted transition-colors"
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
                          task.isDone ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Nenhuma tarefa para esta semana
                </p>
              )}
            </div>
          )}

          {/* Latest Readings */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t">
            <div className="text-center">
              <ThermometerSun className="w-5 h-5 mx-auto text-orange-500 mb-1" />
              <p className="text-xs text-muted-foreground">Temp</p>
              <p className={`text-sm font-semibold ${
                latestLog?.tempC 
                  ? getValueColor(parseFloat(latestLog.tempC), targets?.tempMin, targets?.tempMax)
                  : "text-foreground"
              }`}>
                {latestLog?.tempC ? `${latestLog.tempC}°C` : "--°C"}
              </p>
            </div>
            <div className="text-center">
              <Droplets className="w-5 h-5 mx-auto text-blue-500 mb-1" />
              <p className="text-xs text-muted-foreground">RH</p>
              <p className={`text-sm font-semibold ${
                latestLog?.rhPct 
                  ? getValueColor(parseFloat(latestLog.rhPct), targets?.rhMin, targets?.rhMax)
                  : "text-foreground"
              }`}>
                {latestLog?.rhPct ? `${latestLog.rhPct}%` : "--%"}
              </p>
            </div>
            <div className="text-center">
              <Sun className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
              <p className="text-xs text-muted-foreground">PPFD</p>
              <p className={`text-sm font-semibold ${
                latestLog?.ppfd 
                  ? getValueColor(latestLog.ppfd, targets?.ppfdMin, targets?.ppfdMax)
                  : "text-foreground"
              }`}>
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
                  className="flex-1 border-green-500 text-green-600 hover:bg-primary/10"
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
                    className="w-full"
                  >
                    Editar Ciclo
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
            {!cycle && (
              <Button
                onClick={() => onDeleteTent(tent.id, tent.name)}
                variant="outline"
                size="sm"
                className="w-full border-red-500 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Estufa
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

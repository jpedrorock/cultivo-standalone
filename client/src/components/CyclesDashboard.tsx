import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, Leaf, Sprout, ArrowRight, Scissors } from "lucide-react";
import { StartFloraModal } from "@/components/StartFloraModal";
import { StartDryingModal } from "@/components/StartDryingModal";
import { StartCloningModal } from "@/components/StartCloningModal";
import { ReturnToMaintenanceModal } from "@/components/ReturnToMaintenanceModal";

export function CyclesDashboard() {
  const { data: cycles, isLoading } = trpc.cycles.getActiveCyclesWithProgress.useQuery();
  const [floraModalOpen, setFloraModalOpen] = useState(false);
  const [dryingModalOpen, setDryingModalOpen] = useState(false);
  const [cloningModalOpen, setCloningModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<{ id: number; name: string } | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Ciclos Ativos</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-2 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!cycles || cycles.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Ciclos Ativos</h2>
        <Card className="p-8 text-center text-muted-foreground">
          <Sprout className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum ciclo ativo no momento</p>
          <p className="text-sm mt-2">Inicie um novo ciclo para começar o cultivo</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Ciclos Ativos</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {cycles.map((cycle: any) => {
          // Determinar ícone, cor e badge baseado na fase
          let PhaseIcon = Sprout;
          let phaseColor = 'text-green-600';
          let phaseBg = 'bg-green-50';
          let phaseBorder = 'border-green-200';
          let phaseLabel = 'Vegetativa';
          
          if (cycle.phase === 'MAINTENANCE') {
            PhaseIcon = Leaf;
            phaseColor = 'text-blue-600';
            phaseBg = 'bg-blue-50';
            phaseBorder = 'border-blue-200';
            phaseLabel = 'Manutenção';
          } else if (cycle.phase === 'CLONING') {
            PhaseIcon = Scissors;
            phaseColor = 'text-cyan-600';
            phaseBg = 'bg-cyan-50';
            phaseBorder = 'border-cyan-200';
            phaseLabel = 'Clonagem';
          } else if (cycle.phase === 'FLORA') {
            PhaseIcon = Leaf;
            phaseColor = 'text-purple-600';
            phaseBg = 'bg-purple-50';
            phaseBorder = 'border-purple-200';
            phaseLabel = 'Floração';
          } else {
            // VEGA (padrão)
            phaseLabel = 'Vegetativa';
          }

          return (
            <Card key={cycle.id} className={`p-6 border-2 ${phaseBorder}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${phaseBg}`}>
                    <PhaseIcon className={`w-5 h-5 ${phaseColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{cycle.tentName}</h3>
                    <p className="text-sm text-muted-foreground">{cycle.strainName}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${phaseBg} ${phaseColor}`}>
                  {phaseLabel}
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {cycle.phase === 'MAINTENANCE' && 'Manutenção'}
                    {cycle.phase === 'CLONING' && `Clonagem - Semana ${cycle.currentWeek}`}
                    {(cycle.phase === 'VEGA' || cycle.phase === 'FLORA') && `Semana ${cycle.currentWeek} de ${cycle.totalWeeks}`}
                  </span>
                  {(cycle.phase === 'VEGA' || cycle.phase === 'FLORA') && (
                    <span className="text-muted-foreground">{cycle.progress}%</span>
                  )}
                </div>
                {(cycle.phase === 'VEGA' || cycle.phase === 'FLORA') && (
                  <Progress value={cycle.progress} className="h-2" />
                )}
              </div>

              {/* Harvest Date (apenas para VEGA/FLORA) ou Clones Produzidos (MAINTENANCE) */}
              {(cycle.phase === 'VEGA' || cycle.phase === 'FLORA') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Colheita estimada:{" "}
                    <span className="font-medium text-foreground">
                      {new Date(cycle.estimatedHarvestDate).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    {cycle.daysUntilHarvest > 0 && (
                      <span className="ml-1">
                        ({cycle.daysUntilHarvest} dias)
                      </span>
                    )}
                  </span>
                </div>
              )}
              {cycle.phase === 'MAINTENANCE' && cycle.clonesProduced && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Scissors className="w-4 h-4" />
                  <span>
                    Última clonagem:{" "}
                    <span className="font-medium text-foreground">
                      {cycle.clonesProduced} clones produzidos
                    </span>
                  </span>
                </div>
              )}

              {/* Transition Button */}
              <div className="mt-4 pt-4 border-t border-border">
                {cycle.phase === 'VEGA' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedCycle({ id: cycle.id, name: cycle.tentName });
                      setFloraModalOpen(true);
                    }}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Iniciar Floração
                  </Button>
                )}
                {cycle.phase === 'FLORA' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedCycle({ id: cycle.id, name: cycle.tentName });
                      setDryingModalOpen(true);
                    }}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Iniciar Secagem
                  </Button>
                )}
                {cycle.phase === 'MAINTENANCE' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedCycle({ id: cycle.id, name: cycle.tentName });
                      setCloningModalOpen(true);
                    }}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Iniciar Clonagem
                  </Button>
                )}
                {cycle.phase === 'CLONING' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedCycle({ id: cycle.id, name: cycle.tentName });
                      setMaintenanceModalOpen(true);
                    }}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Retornar para Manutenção
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modals */}
      {selectedCycle && (
        <>
          <StartFloraModal
            open={floraModalOpen}
            onClose={() => {
              setFloraModalOpen(false);
              setSelectedCycle(null);
            }}
            cycleId={selectedCycle.id}
            cycleName={selectedCycle.name}
          />
          <StartDryingModal
            open={dryingModalOpen}
            onClose={() => {
              setDryingModalOpen(false);
              setSelectedCycle(null);
            }}
            cycleId={selectedCycle.id}
            cycleName={selectedCycle.name}
          />
          <StartCloningModal
            open={cloningModalOpen}
            onClose={() => {
              setCloningModalOpen(false);
              setSelectedCycle(null);
            }}
            cycleId={selectedCycle.id}
            cycleName={selectedCycle.name}
          />
          <ReturnToMaintenanceModal
            open={maintenanceModalOpen}
            onClose={() => {
              setMaintenanceModalOpen(false);
              setSelectedCycle(null);
            }}
            cycleId={selectedCycle.id}
            cycleName={selectedCycle.name}
          />
        </>
      )}
    </div>
  );
}

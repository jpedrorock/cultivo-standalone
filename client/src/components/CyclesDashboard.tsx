import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, Leaf, Sprout, ArrowRight } from "lucide-react";
import { StartFloraModal } from "@/components/StartFloraModal";
import { StartDryingModal } from "@/components/StartDryingModal";

export function CyclesDashboard() {
  const { data: cycles, isLoading } = trpc.cycles.getActiveCyclesWithProgress.useQuery();
  const [floraModalOpen, setFloraModalOpen] = useState(false);
  const [dryingModalOpen, setDryingModalOpen] = useState(false);
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
          const isVega = cycle.phase === 'VEGA';
          const PhaseIcon = isVega ? Sprout : Leaf;
          const phaseColor = isVega ? 'text-green-600' : 'text-purple-600';
          const phaseBg = isVega ? 'bg-green-50' : 'bg-purple-50';
          const phaseBorder = isVega ? 'border-green-200' : 'border-purple-200';

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
                  {isVega ? 'Vegetativa' : 'Floração'}
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    Semana {cycle.currentWeek} de {cycle.totalWeeks}
                  </span>
                  <span className="text-muted-foreground">{cycle.progress}%</span>
                </div>
                <Progress value={cycle.progress} className="h-2" />
              </div>

              {/* Harvest Date */}
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

              {/* Transition Button */}
              <div className="mt-4 pt-4 border-t border-border">
                {isVega ? (
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
                ) : (
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
        </>
      )}
    </div>
  );
}

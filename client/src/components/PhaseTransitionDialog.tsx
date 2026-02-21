import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PhaseTransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleId: number;
  currentPhase: "MAINTENANCE" | "CLONING" | "VEGA" | "FLORA";
  tentName: string;
}

export function PhaseTransitionDialog({
  open,
  onOpenChange,
  cycleId,
  currentPhase,
  tentName,
}: PhaseTransitionDialogProps) {
  const utils = trpc.useUtils();

  // State for transition inputs
  const [targetTentId, setTargetTentId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [clonesProduced, setClonesProduced] = useState("");
  const [transitionDate, setTransitionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Get available tents for selection
  const { data: tents } = trpc.tents.list.useQuery();

  // Mutations for each transition type
  const transitionToCloning = trpc.cycles.transitionToCloning.useMutation({
    onSuccess: () => {
      toast.success("Transição para clonagem iniciada");
      utils.cycles.getActiveCyclesWithProgress.invalidate();
      utils.tents.list.invalidate();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const transitionToMaintenance = trpc.cycles.transitionToMaintenance.useMutation({
    onSuccess: () => {
      toast.success("Retornado para manutenção");
      utils.cycles.getActiveCyclesWithProgress.invalidate();
      utils.tents.list.invalidate();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const transitionToFlora = trpc.cycles.transitionToFlora.useMutation({
    onSuccess: () => {
      toast.success("Floração iniciada");
      utils.cycles.getActiveCyclesWithProgress.invalidate();
      utils.tents.list.invalidate();
      utils.plants.list.invalidate();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const transitionToDrying = trpc.cycles.transitionToDrying.useMutation({
    onSuccess: () => {
      toast.success("Secagem iniciada");
      utils.cycles.getActiveCyclesWithProgress.invalidate();
      utils.tents.list.invalidate();
      utils.plants.list.invalidate();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const resetForm = () => {
    setTargetTentId("");
    setNotes("");
    setClonesProduced("");
    setTransitionDate(new Date().toISOString().split("T")[0]);
  };

  const handleTransition = (targetPhase: string) => {
    const tentId = targetTentId ? parseInt(targetTentId) : undefined;

    switch (targetPhase) {
      case "CLONING":
        transitionToCloning.mutate({
          cycleId,
          cloningStartDate: new Date(transitionDate),
        });
        break;

      case "MAINTENANCE":
        transitionToMaintenance.mutate({
          cycleId,
          clonesProduced: clonesProduced ? parseInt(clonesProduced) : undefined,
        });
        break;

      case "FLORA":
        transitionToFlora.mutate({
          cycleId,
          floraStartDate: new Date(transitionDate),
          targetTentId: tentId,
        });
        break;

      case "DRYING":
        transitionToDrying.mutate({
          cycleId,
          dryingStartDate: new Date(transitionDate),
          harvestNotes: notes,
          targetTentId: tentId,
        });
        break;
    }
  };

  // Determine available transitions based on current phase
  const getAvailableTransitions = () => {
    switch (currentPhase) {
      case "MAINTENANCE":
        return [{ label: "Iniciar Clonagem", value: "CLONING", icon: ArrowRight }];
      case "CLONING":
        return [{ label: "Retornar para Manutenção", value: "MAINTENANCE", icon: ArrowRight }];
      case "VEGA":
        return [{ label: "Iniciar Floração", value: "FLORA", icon: ArrowRight }];
      case "FLORA":
        return [{ label: "Iniciar Secagem", value: "DRYING", icon: ArrowRight }];
      default:
        return [];
    }
  };

  const transitions = getAvailableTransitions();

  if (transitions.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transição de Fase - {tentName}</DialogTitle>
          <DialogDescription>
            Escolha a transição desejada e configure os parâmetros
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Transition Buttons */}
          <div className="space-y-2">
            <Label>Transição Disponível</Label>
            {transitions.map((transition) => (
              <Button
                key={transition.value}
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleTransition(transition.value)}
              >
                <span>{transition.label}</span>
                <transition.icon className="w-4 h-4" />
              </Button>
            ))}
          </div>

          {/* Date Input (for CLONING, FLORA, DRYING) */}
          {(currentPhase === "MAINTENANCE" || currentPhase === "VEGA" || currentPhase === "FLORA") && (
            <div className="space-y-2">
              <Label htmlFor="transitionDate">Data de Início</Label>
              <Input
                id="transitionDate"
                type="date"
                value={transitionDate}
                onChange={(e) => setTransitionDate(e.target.value)}
              />
            </div>
          )}

          {/* Clones Produced Input (for CLONING → MAINTENANCE) */}
          {currentPhase === "CLONING" && (
            <div className="space-y-2">
              <Label htmlFor="clonesProduced">Quantidade de Clones Produzidos (opcional)</Label>
              <Input
                id="clonesProduced"
                type="number"
                min="0"
                placeholder="Ex: 18"
                value={clonesProduced}
                onChange={(e) => setClonesProduced(e.target.value)}
              />
            </div>
          )}

          {/* Notes Input (for FLORA → DRYING) */}
          {currentPhase === "FLORA" && (
            <div className="space-y-2">
              <Label htmlFor="notes">Notas de Colheita (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Ex: Peso seco, observações..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}

          {/* Target Tent Selection (optional for all transitions) */}
          <div className="space-y-2">
            <Label htmlFor="targetTent">Mover plantas para estufa (opcional)</Label>
            <Select value={targetTentId} onValueChange={setTargetTentId}>
              <SelectTrigger id="targetTent">
                <SelectValue placeholder="Manter na estufa atual" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Manter na estufa atual</SelectItem>
                {tents?.map((tent) => (
                  <SelectItem key={tent.id} value={tent.id.toString()}>
                    {tent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

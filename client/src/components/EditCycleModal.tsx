import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
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
import { toast } from "sonner";

interface EditCycleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleId: number;
  tentId: number;
  tentName: string;
  currentStartDate: Date;
  currentFloraStartDate?: Date | null;
  currentStrainId?: number | null;
}

export function EditCycleModal({
  open,
  onOpenChange,
  cycleId,
  tentId,
  tentName,
  currentStartDate,
  currentFloraStartDate,
  currentStrainId,
}: EditCycleModalProps) {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [phase, setPhase] = useState<"CLONING" | "MAINTENANCE" | "VEGA" | "FLORA">("VEGA");
  const [weekNumber, setWeekNumber] = useState(1);
  const [strainId, setStrainId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: strains } = trpc.strains.list.useQuery();
  const edit = trpc.cycles.edit.useMutation({
    onSuccess: () => {
      toast.success("Ciclo atualizado com sucesso!");
      utils.cycles.listActive.invalidate();
      utils.cycles.getByTent.invalidate();
      utils.tents.list.invalidate();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar ciclo: ${error.message}`);
    },
  });

  useEffect(() => {
    if (open) {
      setStartDate(new Date().toISOString().split("T")[0]);
      setStrainId(currentStrainId ?? null);
      // Determinar fase atual baseada em floraStartDate
      if (currentFloraStartDate) {
        setPhase("FLORA");
      } else if (tentId === 1) {
        setPhase("CLONING");
      } else if (tentId === 2) {
        setPhase("VEGA");
      } else {
        setPhase("FLORA");
      }
      setWeekNumber(1);
    }
  }, [open, currentFloraStartDate, tentId, currentStrainId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    edit.mutate({
      cycleId,
      strainId: strainId || undefined,
      startDate: new Date(startDate),
      phase,
      weekNumber,
    });
  };

  const getMaxWeek = () => {
    switch (phase) {
      case "CLONING":
        return 2;
      case "MAINTENANCE":
        return 1;
      case "VEGA":
        return 6;
      case "FLORA":
        return 8;
      default:
        return 1;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Ciclo - {tentName}</DialogTitle>
          <DialogDescription>
            Ajuste a fase e semana atual do ciclo. A strain é opcional.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="strain">Strain (Opcional)</Label>
              <Select
                value={strainId?.toString() || "none"}
                onValueChange={(value) => setStrainId(value === "none" ? null : parseInt(value))}
              >
                <SelectTrigger id="strain">
                  <SelectValue placeholder="Usar strains das plantas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Usar strains das plantas</SelectItem>
                  {strains?.map((strain) => (
                    <SelectItem key={strain.id} value={strain.id.toString()}>
                      {strain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Se não selecionar, os targets serão a média das strains das plantas ativas na estufa.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phase">Fase Atual</Label>
              <Select
                value={phase}
                onValueChange={(value: any) => {
                  setPhase(value);
                  setWeekNumber(1);
                }}
              >
                <SelectTrigger id="phase">
                  <SelectValue placeholder="Selecione a fase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLONING">Clonagem</SelectItem>
                  <SelectItem value="MAINTENANCE">Manutencao</SelectItem>
                  <SelectItem value="VEGA">Vegetativa</SelectItem>
                  <SelectItem value="FLORA">Floracao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="weekNumber">Semana Atual</Label>
              <Select
                value={weekNumber.toString()}
                onValueChange={(value) => setWeekNumber(parseInt(value))}
              >
                <SelectTrigger id="weekNumber">
                  <SelectValue placeholder="Selecione a semana" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: getMaxWeek() }, (_, i) => i + 1).map((week) => (
                    <SelectItem key={week} value={week.toString()}>
                      Semana {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="startDate">Data Atual (Referência)</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                O sistema recalculará a data de início do ciclo baseado na fase e semana selecionadas.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={edit.isPending}>
              {edit.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

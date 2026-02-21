import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface StartFloraModalProps {
  open: boolean;
  onClose: () => void;
  cycleId: number;
  cycleName: string;
}

export function StartFloraModal({ open, onClose, cycleId, cycleName }: StartFloraModalProps) {
  const [floraStartDate, setFloraStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [targetTentId, setTargetTentId] = useState<string>("");

  const { data: tents } = trpc.tents.list.useQuery();
  const utils = trpc.useUtils();

  const transitionToFlora = trpc.cycles.transitionToFlora.useMutation({
    onSuccess: () => {
      toast.success("Ciclo iniciado em floração!");
      utils.cycles.getActiveCyclesWithProgress.invalidate();
      utils.cycles.listActive.invalidate();
      utils.tents.list.invalidate();
      onClose();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    transitionToFlora.mutate({
      cycleId,
      floraStartDate: new Date(floraStartDate),
      targetTentId: targetTentId ? parseInt(targetTentId) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Iniciar Floração</DialogTitle>
          <DialogDescription>
            Marcar o ciclo "{cycleName}" como em floração
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Data de início */}
          <div className="space-y-2">
            <Label htmlFor="floraStartDate">Data de Início da Floração</Label>
            <Input
              id="floraStartDate"
              type="date"
              value={floraStartDate}
              onChange={(e) => setFloraStartDate(e.target.value)}
            />
          </div>

          {/* Estufa de destino (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="targetTent">
              Mover plantas para estufa? (opcional)
            </Label>
            <Select value={targetTentId} onValueChange={setTargetTentId}>
              <SelectTrigger>
                <SelectValue placeholder="Manter na estufa atual" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Manter na estufa atual</SelectItem>
                {tents?.map((tent) => (
                  <SelectItem key={tent.id} value={tent.id.toString()}>
                    {tent.name} ({tent.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Se selecionado, todas as plantas serão movidas para a estufa escolhida
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={transitionToFlora.isPending}
          >
            {transitionToFlora.isPending ? "Processando..." : "Iniciar Floração"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

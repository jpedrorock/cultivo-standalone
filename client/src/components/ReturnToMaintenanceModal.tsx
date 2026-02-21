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
import { toast } from "sonner";

interface ReturnToMaintenanceModalProps {
  open: boolean;
  onClose: () => void;
  cycleId: number;
  cycleName: string;
}

export function ReturnToMaintenanceModal({ open, onClose, cycleId, cycleName }: ReturnToMaintenanceModalProps) {
  const utils = trpc.useUtils();

  const transitionToMaintenance = trpc.cycles.transitionToMaintenance.useMutation({
    onSuccess: () => {
      toast.success("Retornado para manutenção!");
      utils.cycles.getActiveCyclesWithProgress.invalidate();
      utils.cycles.listActive.invalidate();
      onClose();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    transitionToMaintenance.mutate({
      cycleId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Retornar para Manutenção</DialogTitle>
          <DialogDescription>
            Finalizar clonagem e retornar "{cycleName}" para manutenção
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            O ciclo de clonagem será finalizado e as plantas mãe retornarão para o estado de manutenção contínua.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={transitionToMaintenance.isPending}
          >
            {transitionToMaintenance.isPending ? "Processando..." : "Retornar para Manutenção"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

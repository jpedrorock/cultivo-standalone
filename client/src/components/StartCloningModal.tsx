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
import { toast } from "sonner";

interface StartCloningModalProps {
  open: boolean;
  onClose: () => void;
  cycleId: number;
  cycleName: string;
}

export function StartCloningModal({ open, onClose, cycleId, cycleName }: StartCloningModalProps) {
  const [cloningStartDate, setCloningStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const utils = trpc.useUtils();

  const transitionToCloning = trpc.cycles.transitionToCloning.useMutation({
    onSuccess: () => {
      toast.success("Clonagem iniciada!");
      utils.cycles.getActiveCyclesWithProgress.invalidate();
      utils.cycles.listActive.invalidate();
      onClose();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    transitionToCloning.mutate({
      cycleId,
      cloningStartDate: new Date(cloningStartDate),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Iniciar Clonagem</DialogTitle>
          <DialogDescription>
            Marcar o ciclo "{cycleName}" como em clonagem
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Data de início */}
          <div className="space-y-2">
            <Label htmlFor="cloningStartDate">Data de Início da Clonagem</Label>
            <Input
              id="cloningStartDate"
              type="date"
              value={cloningStartDate}
              onChange={(e) => setCloningStartDate(e.target.value)}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            As plantas mãe entrarão em processo de clonagem. Após 2 semanas, você poderá retornar para manutenção.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={transitionToCloning.isPending}
          >
            {transitionToCloning.isPending ? "Processando..." : "Iniciar Clonagem"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

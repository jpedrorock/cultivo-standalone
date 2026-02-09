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
import { Loader2 } from "lucide-react";

interface StartCycleModalProps {
  tentId: number;
  tentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StartCycleModal({ tentId, tentName, open, onOpenChange }: StartCycleModalProps) {
  const [strainId, setStrainId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [vegaWeeks, setVegaWeeks] = useState<string>("4");
  const [floraWeeks, setFloraWeeks] = useState<string>("8");

  const { data: strains, isLoading: strainsLoading } = trpc.strains.list.useQuery();
  const utils = trpc.useUtils();
  
  const createCycle = trpc.cycles.create.useMutation({
    onSuccess: () => {
      toast.success("Ciclo iniciado com sucesso!");
      utils.cycles.listActive.invalidate();
      utils.tents.list.invalidate();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao iniciar ciclo: ${error.message}`);
    },
  });

  const resetForm = () => {
    setStrainId("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setVegaWeeks("4");
    setFloraWeeks("8");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!strainId) {
      toast.error("Por favor, selecione uma strain");
      return;
    }

    createCycle.mutate({
      tentId,
      strainId: parseInt(strainId),
      startDate: new Date(startDate),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Iniciar Ciclo - {tentName}</DialogTitle>
          <DialogDescription>
            Configure o novo ciclo de cultivo para esta estufa. Selecione a strain e defina as durações das fases.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strain">Strain *</Label>
            <Select value={strainId} onValueChange={setStrainId} disabled={strainsLoading}>
              <SelectTrigger id="strain">
                <SelectValue placeholder={strainsLoading ? "Carregando..." : "Selecione uma strain"} />
              </SelectTrigger>
              <SelectContent>
                {strains?.map((strain) => (
                  <SelectItem key={strain.id} value={strain.id.toString()}>
                    {strain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Data de Início *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vegaWeeks">Fase Vegetativa (semanas)</Label>
              <Input
                id="vegaWeeks"
                type="number"
                min="1"
                max="12"
                value={vegaWeeks}
                onChange={(e) => setVegaWeeks(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Duração da fase de crescimento</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="floraWeeks">Fase de Floração (semanas)</Label>
              <Input
                id="floraWeeks"
                type="number"
                min="1"
                max="16"
                value={floraWeeks}
                onChange={(e) => setFloraWeeks(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Duração da fase de floração</p>
            </div>
          </div>

          <div className="bg-blue-500/100/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-400">
            <p className="font-medium mb-1">📅 Resumo do Ciclo</p>
            <p>
              • Início: {new Date(startDate).toLocaleDateString("pt-BR")}<br />
              • Vegetativa: {vegaWeeks} semanas<br />
              • Floração: {floraWeeks} semanas<br />
              • Duração total: {parseInt(vegaWeeks) + parseInt(floraWeeks)} semanas
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createCycle.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createCycle.isPending}>
              {createCycle.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Iniciar Ciclo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

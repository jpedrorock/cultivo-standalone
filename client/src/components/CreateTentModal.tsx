import { useState } from "react";
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


interface CreateTentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTentModal({ open, onOpenChange }: CreateTentModalProps) {

  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    name: "",
    tentType: "A" as "A" | "B" | "C",
    width: "",
    depth: "",
    height: "",
    powerW: "",
    initialPhase: "Vegetativa" as "Manutenção" | "Vegetativa" | "Floração",
  });

  const createTent = trpc.tents.create.useMutation({
    onSuccess: () => {
      toast.success("Estufa criada com sucesso!");
      utils.tents.list.invalidate();
      onOpenChange(false);
      // Resetar formulário
      setFormData({
        name: "",
        tentType: "A",
        width: "",
        depth: "",
        height: "",
        powerW: "",
        initialPhase: "Vegetativa",
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar estufa: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.name || !formData.width || !formData.depth || !formData.height) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    createTent.mutate({
      name: formData.name,
      tentType: formData.tentType,
      width: parseInt(formData.width),
      depth: parseInt(formData.depth),
      height: parseInt(formData.height),
      powerW: formData.powerW ? parseInt(formData.powerW) : undefined,
      initialPhase: formData.initialPhase,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Nova Estufa</DialogTitle>
            <DialogDescription>
              Adicione uma nova estufa ao sistema. Preencha as dimensões em centímetros.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Nome */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: Estufa Principal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Tipo */}
            <div className="grid gap-2">
              <Label htmlFor="tentType">Tipo *</Label>
              <Select
                value={formData.tentType}
                onValueChange={(value: "A" | "B" | "C") =>
                  setFormData({ ...formData, tentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Tipo A (Manutenção/Clonagem)</SelectItem>
                  <SelectItem value="B">Tipo B (Vegetativo)</SelectItem>
                  <SelectItem value="C">Tipo C (Floração)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dimensões */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="width">Largura (cm) *</Label>
                <Input
                  id="width"
                  type="number"
                  placeholder="45"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="depth">Profundidade (cm) *</Label>
                <Input
                  id="depth"
                  type="number"
                  placeholder="75"
                  value={formData.depth}
                  onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="height">Altura (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="90"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Fase Inicial */}
            <div className="grid gap-2">
              <Label htmlFor="initialPhase">Fase Inicial do Ciclo *</Label>
              <Select
                value={formData.initialPhase}
                onValueChange={(value: "Manutenção" | "Vegetativa" | "Floração") =>
                  setFormData({ ...formData, initialPhase: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manutenção">🌱 Manutenção (Plantas-mãe/Clonagem)</SelectItem>
                  <SelectItem value="Vegetativa">🌿 Vegetativa (Crescimento)</SelectItem>
                  <SelectItem value="Floração">🌸 Floração (Produção)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Define os parâmetros iniciais e tarefas apropriadas para o ciclo
              </p>
            </div>

            {/* Potência (opcional) */}
            <div className="grid gap-2">
              <Label htmlFor="powerW">Potência da Luz (W)</Label>
              <Input
                id="powerW"
                type="number"
                placeholder="Ex: 600"
                value={formData.powerW}
                onChange={(e) => setFormData({ ...formData, powerW: e.target.value })}
              />
            </div>

            {/* Info calculada */}
            {formData.width && formData.depth && formData.height && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <strong>Volume calculado:</strong>{" "}
                {((parseInt(formData.width) * parseInt(formData.depth) * parseInt(formData.height)) / 1000).toFixed(1)} litros
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createTent.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createTent.isPending}>
              {createTent.isPending ? "Criando..." : "Criar Estufa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

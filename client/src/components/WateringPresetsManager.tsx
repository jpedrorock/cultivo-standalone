import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, Trash2, Upload, Edit } from "lucide-react";
import { toast } from "sonner";

interface WateringPresetsManagerProps {
  currentValues: {
    plantCount: string;
    potSize: string;
    targetRunoff: string;
    phase?: "VEGA" | "FLORA";
    weekNumber?: number;
  };
  onLoadPreset: (preset: any) => void;
}

export function WateringPresetsManager({
  currentValues,
  onLoadPreset,
}: WateringPresetsManagerProps) {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [editingPreset, setEditingPreset] = useState<any>(null);
  const [editValues, setEditValues] = useState({
    name: "",
    plantCount: "",
    potSize: "",
    targetRunoff: "",
  });

  const { data: presets, refetch } = trpc.wateringPresets.list.useQuery();

  const createPreset = trpc.wateringPresets.create.useMutation({
    onSuccess: () => {
      toast.success("Predefinição salva!");
      setIsSaveDialogOpen(false);
      setPresetName("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  const deletePreset = trpc.wateringPresets.delete.useMutation({
    onSuccess: () => {
      toast.success("Predefinição excluída!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const updatePreset = trpc.wateringPresets.update.useMutation({
    onSuccess: () => {
      toast.success("Predefinição atualizada!");
      setIsEditDialogOpen(false);
      setEditingPreset(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error("Digite um nome para a predefinição");
      return;
    }

    const plantCount = parseInt(currentValues.plantCount);
    const potSize = parseFloat(currentValues.potSize);
    const targetRunoff = parseFloat(currentValues.targetRunoff);

    if (isNaN(plantCount) || isNaN(potSize) || isNaN(targetRunoff)) {
      toast.error("Preencha todos os campos");
      return;
    }

    createPreset.mutate({
      name: presetName,
      plantCount,
      potSize,
      targetRunoff,
      phase: currentValues.phase,
      weekNumber: currentValues.weekNumber,
    });
  };

  const handleLoadPreset = (preset: any) => {
    onLoadPreset({
      plantCount: preset.plantCount.toString(),
      potSize: preset.potSize,
      targetRunoff: preset.targetRunoff,
      phase: preset.phase,
      weekNumber: preset.weekNumber,
    });
    toast.success(`Predefinição "${preset.name}" carregada!`);
  };

  const handleDeletePreset = (id: number, name: string) => {
    if (confirm(`Excluir predefinição "${name}"?`)) {
      deletePreset.mutate({ id });
    }
  };

  const handleEditPreset = (preset: any) => {
    setEditingPreset(preset);
    setEditValues({
      name: preset.name,
      plantCount: preset.plantCount.toString(),
      potSize: preset.potSize,
      targetRunoff: preset.targetRunoff,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePreset = () => {
    if (!editValues.name.trim()) {
      toast.error("Digite um nome para a predefinição");
      return;
    }

    const plantCount = parseInt(editValues.plantCount);
    const potSize = parseFloat(editValues.potSize);
    const targetRunoff = parseFloat(editValues.targetRunoff);

    if (isNaN(plantCount) || isNaN(potSize) || isNaN(targetRunoff)) {
      toast.error("Preencha todos os campos corretamente");
      return;
    }

    updatePreset.mutate({
      id: editingPreset.id,
      name: editValues.name,
      plantCount,
      potSize,
      targetRunoff,
      phase: editingPreset.phase,
      weekNumber: editingPreset.weekNumber,
    });
  };

  return (
    <div className="space-y-4">
      {/* Botão Salvar Predefinição */}
      <Button
        onClick={() => setIsSaveDialogOpen(true)}
        variant="outline"
        className="w-full"
      >
        <Save className="w-4 h-4 mr-2" />
        💾 Salvar Predefinição
      </Button>

      {/* Lista de Predefinições */}
      {presets && presets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Minhas Predefinições</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {presets.map((preset: any) => (
              <div
                key={preset.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{preset.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {preset.plantCount} plantas · {preset.potSize}L · Runoff {preset.targetRunoff}%
                    {preset.phase && ` · ${preset.phase} Sem ${preset.weekNumber}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLoadPreset(preset)}
                    title="Carregar predefinição"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditPreset(preset)}
                    title="Editar predefinição"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePreset(preset.id, preset.name)}
                    title="Excluir predefinição"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Dialog Salvar */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Predefinição</DialogTitle>
            <DialogDescription>
              Dê um nome para esta configuração de rega
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="presetName">Nome da Predefinição</Label>
              <Input
                id="presetName"
                placeholder="Ex: Vega 6 plantas - Vasos 11L"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>🌱 {currentValues.plantCount} plantas</p>
              <p>🪴 Vasos de {currentValues.potSize}L</p>
              <p>💧 Runoff desejado: {currentValues.targetRunoff}%</p>
              {currentValues.phase && (
                <p>
                  📅 {currentValues.phase} Semana {currentValues.weekNumber}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePreset} disabled={createPreset.isPending}>
              {createPreset.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Predefinição</DialogTitle>
            <DialogDescription>
              Atualize os valores da predefinição de rega
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Nome da Predefinição</Label>
              <Input
                id="editName"
                value={editValues.name}
                onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPlantCount">Número de Plantas</Label>
              <Input
                id="editPlantCount"
                type="number"
                value={editValues.plantCount}
                onChange={(e) => setEditValues({ ...editValues, plantCount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPotSize">Tamanho do Vaso (L)</Label>
              <Input
                id="editPotSize"
                type="number"
                step="0.1"
                value={editValues.potSize}
                onChange={(e) => setEditValues({ ...editValues, potSize: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTargetRunoff">Runoff Desejado (%)</Label>
              <Input
                id="editTargetRunoff"
                type="number"
                step="1"
                value={editValues.targetRunoff}
                onChange={(e) => setEditValues({ ...editValues, targetRunoff: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePreset} disabled={updatePreset.isPending}>
              {updatePreset.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Trash2, Upload, Edit } from "lucide-react";
import { toast } from "sonner";

interface FertilizationPresetsManagerProps {
  currentValues: {
    waterVolume: string;
    targetEC: string;
    phase?: "VEGA" | "FLORA";
    weekNumber?: number;
    irrigationsPerWeek?: string;
    calculationMode: "per-irrigation" | "per-week";
  };
  onLoadPreset: (preset: any) => void;
}

export function FertilizationPresetsManager({
  currentValues,
  onLoadPreset,
}: FertilizationPresetsManagerProps) {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [editingPreset, setEditingPreset] = useState<any>(null);
  const [editValues, setEditValues] = useState({
    name: "",
    waterVolume: "",
    targetEC: "",
    irrigationsPerWeek: "",
    calculationMode: "per-irrigation" as "per-irrigation" | "per-week",
  });

  const { data: presets, refetch } = trpc.fertilizationPresets.list.useQuery();

  const createPreset = trpc.fertilizationPresets.create.useMutation({
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

  const deletePreset = trpc.fertilizationPresets.delete.useMutation({
    onSuccess: () => {
      toast.success("Predefinição excluída!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const updatePreset = trpc.fertilizationPresets.update.useMutation({
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

    const waterVolume = parseFloat(currentValues.waterVolume);
    const targetEC = parseFloat(currentValues.targetEC);
    const irrigationsPerWeek = currentValues.irrigationsPerWeek
      ? parseInt(currentValues.irrigationsPerWeek)
      : undefined;

    if (isNaN(waterVolume) || isNaN(targetEC)) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (
      currentValues.calculationMode === "per-week" &&
      (!irrigationsPerWeek || isNaN(irrigationsPerWeek))
    ) {
      toast.error("Preencha o número de irrigações por semana");
      return;
    }

    createPreset.mutate({
      name: presetName,
      waterVolume,
      targetEC,
      phase: currentValues.phase,
      weekNumber: currentValues.weekNumber,
      irrigationsPerWeek,
      calculationMode: currentValues.calculationMode,
    });
  };

  const handleLoadPreset = (preset: any) => {
    onLoadPreset({
      waterVolume: preset.waterVolume,
      targetEC: preset.targetEC,
      phase: preset.phase,
      weekNumber: preset.weekNumber,
      irrigationsPerWeek: preset.irrigationsPerWeek,
      calculationMode: preset.calculationMode,
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
      waterVolume: preset.waterVolume,
      targetEC: preset.targetEC,
      irrigationsPerWeek: preset.irrigationsPerWeek || "",
      calculationMode: preset.calculationMode,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePreset = () => {
    if (!editValues.name.trim()) {
      toast.error("Digite um nome para a predefinição");
      return;
    }

    const waterVolume = parseFloat(editValues.waterVolume);
    const targetEC = parseFloat(editValues.targetEC);
    const irrigationsPerWeek = editValues.irrigationsPerWeek
      ? parseInt(editValues.irrigationsPerWeek)
      : undefined;

    if (isNaN(waterVolume) || isNaN(targetEC)) {
      toast.error("Preencha todos os campos corretamente");
      return;
    }

    if (
      editValues.calculationMode === "per-week" &&
      (!irrigationsPerWeek || isNaN(irrigationsPerWeek))
    ) {
      toast.error("Preencha o número de irrigações por semana");
      return;
    }

    updatePreset.mutate({
      id: editingPreset.id,
      name: editValues.name,
      waterVolume,
      targetEC,
      phase: editingPreset.phase,
      weekNumber: editingPreset.weekNumber,
      irrigationsPerWeek,
      calculationMode: editValues.calculationMode,
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
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{preset.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {preset.waterVolume}L · EC {preset.targetEC}
                    {preset.irrigationsPerWeek &&
                      ` · ${preset.irrigationsPerWeek}x/semana`}
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
              Dê um nome para esta configuração de fertilização
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="presetName">Nome da Predefinição</Label>
              <Input
                id="presetName"
                placeholder="Ex: Vega Semana 3 - EC 1.2"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>💧 Volume: {currentValues.waterVolume}L</p>
              <p>⚡ EC Alvo: {currentValues.targetEC}</p>
              {currentValues.irrigationsPerWeek && (
                <p>🔄 {currentValues.irrigationsPerWeek} irrigações/semana</p>
              )}
              <p>
                📊 Modo: {currentValues.calculationMode === "per-irrigation" ? "Por irrigação" : "Por semana"}
              </p>
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
              Atualize os valores da predefinição de fertilização
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
              <Label htmlFor="editWaterVolume">Volume de Água (L)</Label>
              <Input
                id="editWaterVolume"
                type="number"
                step="0.1"
                value={editValues.waterVolume}
                onChange={(e) =>
                  setEditValues({ ...editValues, waterVolume: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTargetEC">EC Alvo</Label>
              <Input
                id="editTargetEC"
                type="number"
                step="0.1"
                value={editValues.targetEC}
                onChange={(e) =>
                  setEditValues({ ...editValues, targetEC: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCalculationMode">Modo de Cálculo</Label>
              <Select
                value={editValues.calculationMode}
                onValueChange={(value: "per-irrigation" | "per-week") =>
                  setEditValues({ ...editValues, calculationMode: value })
                }
              >
                <SelectTrigger id="editCalculationMode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per-irrigation">Por Irrigação</SelectItem>
                  <SelectItem value="per-week">Por Semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editValues.calculationMode === "per-week" && (
              <div className="space-y-2">
                <Label htmlFor="editIrrigationsPerWeek">Irrigações por Semana</Label>
                <Input
                  id="editIrrigationsPerWeek"
                  type="number"
                  value={editValues.irrigationsPerWeek}
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      irrigationsPerWeek: e.target.value,
                    })
                  }
                />
              </div>
            )}
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

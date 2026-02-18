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
import { Save, Trash2, Upload } from "lucide-react";
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
  const [presetName, setPresetName] = useState("");

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
                    {preset.plantCount} plantas · {preset.potSize}L · Runoff {preset.targetRunoff}%
                    {preset.phase && ` · ${preset.phase} Sem ${preset.weekNumber}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLoadPreset(preset)}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePreset(preset.id, preset.name)}
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
    </div>
  );
}

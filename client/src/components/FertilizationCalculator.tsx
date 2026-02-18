import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2, BookmarkPlus, Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function FertilizationCalculator() {
  const [phase, setPhase] = useState<"vega" | "flora">("vega");
  const [weekNumber, setWeekNumber] = useState(1);
  const [volume, setVolume] = useState(10);
  const [useCustomEC, setUseCustomEC] = useState(false);
  const [customEC, setCustomEC] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareCode, setShareCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importCode, setImportCode] = useState("");

  // Buscar EC recomendado do backend
  const { data: weeklyTarget } = trpc.weeklyTargets.get.useQuery({
    phase,
    weekNumber,
  });

  const targetEC = useCustomEC && customEC !== null ? customEC : (weeklyTarget?.targetEC || 0);

  // Calcular automaticamente quando valores mudam
  useEffect(() => {
    if (volume > 0 && targetEC > 0) {
      const npk = {
        nitrogen: (targetEC * volume * 0.4).toFixed(2),
        phosphorus: (targetEC * volume * 0.3).toFixed(2),
        potassium: (targetEC * volume * 0.3).toFixed(2),
      };
      setResult({
        volume,
        ec: targetEC,
        npk,
        phase: phase === "vega" ? "🌱 Vega" : "🌸 Flora",
        weekNumber,
      });
    } else {
      setResult(null);
    }
  }, [volume, targetEC, phase, weekNumber]);

  // Mutations para predefinições
  const createPreset = trpc.fertilizationPresets.create.useMutation({
    onSuccess: () => {
      toast.success("Predefinição salva com sucesso!");
      setShowSaveDialog(false);
      setPresetName("");
      presetsList.refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  const deletePreset = trpc.fertilizationPresets.delete.useMutation({
    onSuccess: () => {
      toast.success("Predefinição excluída!");
      presetsList.refetch();
    },
  });

  const presetsList = trpc.fertilizationPresets.list.useQuery();

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error("Digite um nome para a predefinição");
      return;
    }

    createPreset.mutate({
      name: presetName,
      waterVolume: volume,
      targetEC: targetEC,
      phase,
      weekNumber,
      irrigationsPerWeek: null,
      calculationMode: "per-irrigation",
    });
  };

  const handleLoadPreset = (preset: any) => {
    setPhase(preset.phase);
    setWeekNumber(preset.weekNumber);
    setVolume(parseFloat(preset.waterVolume));
    setCustomEC(preset.targetEC);
    toast.success(`Predefinição "${preset.name}" carregada!`);
  };

  const handleSharePreset = (preset: any) => {
    const recipeData = {
      name: preset.name,
      phase: preset.phase,
      weekNumber: preset.weekNumber,
      waterVolume: preset.waterVolume,
      targetEC: preset.targetEC,
    };
    const code = btoa(JSON.stringify(recipeData)); // Encode to base64
    setShareCode(code);
    setShowShareDialog(true);
    setCopied(false);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
      toast.success("Código copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar código");
    }
  };

  const handleImportRecipe = () => {
    try {
      const decoded = atob(importCode.trim());
      const recipeData = JSON.parse(decoded);
      
      setPhase(recipeData.phase);
      setWeekNumber(recipeData.weekNumber);
      setVolume(parseFloat(recipeData.waterVolume));
      setCustomEC(recipeData.targetEC);
      
      toast.success(`Receita "${recipeData.name}" importada com sucesso!`);
      setShowImportDialog(false);
      setImportCode("");
    } catch (error) {
      toast.error("Código inválido! Verifique e tente novamente.");
    }
  };



  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">🧪 Calculadora de Fertilização</h2>
        <p className="text-muted-foreground mb-6">
          Calcule a dosagem de reagentes NPK necessária para atingir o EC desejado
        </p>

        <div className="space-y-4">
          {/* Seletor de Fase */}
          <div>
            <Label htmlFor="phase">Fase do Cultivo</Label>
            <Select value={phase} onValueChange={(v) => setPhase(v as "vega" | "flora")}>
              <SelectTrigger id="phase">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vega">🌱 Vegetativa (Vega)</SelectItem>
                <SelectItem value="flora">🌸 Floração (Flora)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seletor de Semana */}
          <div>
            <Label htmlFor="week">Semana</Label>
            <Select value={weekNumber.toString()} onValueChange={(v) => setWeekNumber(parseInt(v))}>
              <SelectTrigger id="week">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <SelectItem key={w} value={w.toString()}>
                    Semana {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Volume */}
          <div>
            <Label htmlFor="volume">Volume de Preparo (litros)</Label>
            <Input
              id="volume"
              type="number"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value) || 0)}
              placeholder="Ex: 10"
            />
          </div>

          {/* EC */}
          <div className="space-y-3">
            <div>
              <Label>EC Desejado (mS/cm)</Label>
              {weeklyTarget && !useCustomEC && (
                <div className="mt-2 p-3 bg-accent/50 rounded-lg">
                  <p className="text-sm font-medium">
                    💡 EC Pré-definido: <span className="text-lg font-bold">{weeklyTarget.targetEC} mS/cm</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {phase === "vega" ? "Vega" : "Flora"} Semana {weekNumber}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useCustomEC"
                checked={useCustomEC}
                onChange={(e) => {
                  setUseCustomEC(e.target.checked);
                  if (!e.target.checked) {
                    setCustomEC(null);
                  }
                }}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="useCustomEC" className="cursor-pointer">
                Usar EC personalizado
              </Label>
            </div>

            {useCustomEC && (
              <Input
                id="ec"
                type="number"
                step="0.1"
                value={customEC || ""}
                onChange={(e) => setCustomEC(parseFloat(e.target.value) || null)}
                placeholder="Digite o EC desejado"
              />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={() => setShowSaveDialog(true)}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <BookmarkPlus className="mr-2 h-4 w-4" />
                Salvar Predefinição
              </Button>
              <Button
                onClick={() => setShowImportDialog(true)}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Importar Receita
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Resultado */}
      {result && (
        <Card className="p-6 bg-green-50 dark:bg-green-950">
          <h3 className="text-xl font-bold mb-4">📋 Receita Calculada</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Volume Total:</span>
              <span className="font-bold">{result.totalVolume} litros</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">EC Alvo:</span>
              <span className="font-bold">{result.targetEC} mS/cm</span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between">
              <span className="font-medium">Nitrogênio (N):</span>
              <span className="font-bold text-blue-600">{result.nitrogen}g</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Fósforo (P):</span>
              <span className="font-bold text-purple-600">{result.phosphorus}g</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Potássio (K):</span>
              <span className="font-bold text-orange-600">{result.potassium}g</span>
            </div>
          </div>
        </Card>
      )}

      {/* Modal de Salvar Predefinição */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Predefinição</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="preset-name">Nome da Predefinição</Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Ex: Vega Semana 3 - 10L"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Fase:</strong> {phase === "vega" ? "Vegetativa" : "Floração"}</p>
              <p><strong>Semana:</strong> {weekNumber}</p>
              <p><strong>Volume:</strong> {volume}L</p>
              <p><strong>EC:</strong> {targetEC} mS/cm</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePreset} disabled={createPreset.isPending}>
              {createPreset.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lista de Predefinições Salvas */}
      {presetsList.data && presetsList.data.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">📚 Minhas Predefinições</h3>
          <div className="space-y-3">
            {presetsList.data.map((preset: any) => (
              <div
                key={preset.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{preset.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {preset.phase === "vega" ? "🌱 Vega" : "🌸 Flora"} Semana {preset.weekNumber} • {preset.waterVolume}L • {preset.targetEC} mS/cm
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLoadPreset(preset)}
                  >
                    Carregar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSharePreset(preset)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Excluir predefinição "${preset.name}"?`)) {
                        deletePreset.mutate({ id: preset.id });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal de Compartilhar Receita */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🔗 Compartilhar Receita</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Copie o código abaixo e envie para outras pessoas. Elas poderão importar esta receita na calculadora delas!
            </p>
            <div className="relative">
              <Input
                value={shareCode}
                readOnly
                className="pr-10 font-mono text-xs"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={handleCopyCode}
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowShareDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Importar Receita */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>📥 Importar Receita Compartilhada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="import-code">Código da Receita</Label>
              <Input
                id="import-code"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="Cole o código aqui"
                className="font-mono text-xs"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Cole o código que você recebeu e clique em Importar para carregar a receita na calculadora.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImportRecipe} disabled={!importCode.trim()}>
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

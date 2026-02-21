import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2, BookmarkPlus, Share2, Copy, Check, Edit } from "lucide-react";
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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPreset, setEditingPreset] = useState<any>(null);
  const [editPresetName, setEditPresetName] = useState("");

  // Buscar EC recomendado do backend
  const { data: weeklyTarget } = trpc.weeklyTargets.get.useQuery({
    phase,
    weekNumber,
  });

  const targetEC = useCustomEC && customEC !== null ? customEC : (Number(weeklyTarget?.targetEC) || 0);

  // Calcular automaticamente quando valores mudam
  useEffect(() => {
    if (volume > 0 && targetEC > 0) {
      // Cálculo baseado em EC (mS/cm) e volume (L)
      // Fórmulas aproximadas para converter EC em gramas de nutrientes
      const calciumNitrate = (targetEC * volume * 0.45).toFixed(2); // 45% do EC
      const potassiumNitrate = (targetEC * volume * 0.20).toFixed(2); // 20% do EC
      const mkp = (targetEC * volume * 0.10).toFixed(2); // 10% do EC (Fosfato Monopotássico)
      const magnesiumSulfate = (targetEC * volume * 0.20).toFixed(2); // 20% do EC
      const micronutrients = (targetEC * volume * 0.05).toFixed(2); // 5% do EC
      
      // PPM aproximado (1 mS/cm ≈ 500-700 ppm, usamos 640 como média)
      const ppmApprox = Math.round(targetEC * 640);
      
      setResult({
        volume,
        ec: targetEC,
        calciumNitrate: {
          total: calciumNitrate,
          perLiter: (parseFloat(calciumNitrate) / volume).toFixed(2)
        },
        potassiumNitrate: {
          total: potassiumNitrate,
          perLiter: (parseFloat(potassiumNitrate) / volume).toFixed(2)
        },
        mkp: {
          total: mkp,
          perLiter: (parseFloat(mkp) / volume).toFixed(2)
        },
        magnesiumSulfate: {
          total: magnesiumSulfate,
          perLiter: (parseFloat(magnesiumSulfate) / volume).toFixed(2)
        },
        micronutrients: {
          total: micronutrients,
          perLiter: (parseFloat(micronutrients) / volume).toFixed(2)
        },
        ppmApprox,
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

  const updatePreset = trpc.fertilizationPresets.update.useMutation({
    onSuccess: () => {
      toast.success("Predefinição atualizada!");
      setShowEditDialog(false);
      setEditingPreset(null);
      presetsList.refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const presetsList = trpc.fertilizationPresets.list.useQuery();

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error("Digite um nome para a predefinição");
      return;
    }

    const phaseValue = phase === "vega" ? "VEGA" : "FLORA";
    createPreset.mutate({
      name: presetName,
      waterVolume: volume,
      targetEC: targetEC,
      phase: phaseValue as "VEGA" | "FLORA",
      weekNumber,
      irrigationsPerWeek: undefined,
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

  const handleEditPreset = (preset: any) => {
    setEditingPreset(preset);
    setEditPresetName(preset.name);
    setShowEditDialog(true);
  };

  const handleUpdatePreset = () => {
    if (!editPresetName.trim()) {
      toast.error("Digite um nome para a predefinição");
      return;
    }

    updatePreset.mutate({
      id: editingPreset.id,
      name: editPresetName,
      waterVolume: parseFloat(editingPreset.waterVolume),
      targetEC: parseFloat(editingPreset.targetEC),
      phase: editingPreset.phase,
      weekNumber: editingPreset.weekNumber,
      irrigationsPerWeek: editingPreset.irrigationsPerWeek,
      calculationMode: editingPreset.calculationMode,
    });
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
              value={volume || ''}
              onChange={(e) => setVolume(e.target.value === '' ? 0 : parseFloat(e.target.value))}
              placeholder="Ex: 10"
              min="0"
              step="0.1"
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

          {/* Botão Calcular Receita */}
          <Button
            onClick={() => {
              // Força recalcular (useEffect já faz isso automaticamente, mas o botão dá feedback visual)
              if (volume > 0 && targetEC > 0) {
                toast.success("✅ Receita calculada com sucesso!");
                // Scroll suave até o resultado
                setTimeout(() => {
                  const resultElement = document.querySelector('[data-result-card]');
                  if (resultElement) {
                    resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }
                }, 100);
              } else {
                toast.error("⚠️ Preencha volume e EC para calcular");
              }
            }}
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-6"
          >
            🧪 Calcular Receita
          </Button>

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
        <Card data-result-card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            🧪 Receita de Fertilização para {result.volume}L:
          </h3>
          
          <div className="space-y-3">
            {/* Nitrato de Cálcio */}
            <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg border-2 border-orange-300 dark:border-orange-700">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-200">Nitrato de Cálcio:</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{result.calciumNitrate.total} g</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">({result.calciumNitrate.perLiter} g/L)</div>
                </div>
              </div>
            </div>

            {/* Nitrato de Potássio */}
            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg border-2 border-purple-300 dark:border-purple-700">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-200">Nitrato de Potássio:</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{result.potassiumNitrate.total} g</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">({result.potassiumNitrate.perLiter} g/L)</div>
                </div>
              </div>
            </div>

            {/* MKP */}
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border-2 border-blue-300 dark:border-blue-700">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-200">MKP (Fosfato Monopotássico):</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.mkp.total} g</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">({result.mkp.perLiter} g/L)</div>
                </div>
              </div>
            </div>

            {/* Sulfato de Magnésio */}
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border-2 border-green-300 dark:border-green-700">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-200">Sulfato de Magnésio:</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{result.magnesiumSulfate.total} g</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">({result.magnesiumSulfate.perLiter} g/L)</div>
                </div>
              </div>
            </div>

            {/* Micronutrientes */}
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-200">Micronutrientes:</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{result.micronutrients.total} g</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">({result.micronutrients.perLiter} g/L)</div>
                </div>
              </div>
            </div>

            {/* EC Resultante */}
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border-2 border-blue-300 dark:border-blue-700 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-200">EC Resultante:</span>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{result.ec} mS/cm</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">PPM Aproximado: {result.ppmApprox} ppm</div>
                </div>
              </div>
            </div>

            {/* Botão Exportar TXT */}
            <Button
              onClick={() => {
                const now = new Date();
                const dateStr = now.toLocaleDateString('pt-BR');
                
                const txtContent = `RECEITA DE FERTILIZAÇÃO - APP CULTIVO
================================================

DATA: ${dateStr}

PARÂMETROS:
- Volume de preparo: ${result.volume}L
- EC desejado: ${result.ec} mS/cm
- PPM aproximado: ${result.ppmApprox} ppm
- Fase: ${result.phase}
- Semana: ${result.weekNumber}

RECEITA (g/L):
- Nitrato de Cálcio: ${result.calciumNitrate.perLiter} g/L
- Nitrato de Potássio: ${result.potassiumNitrate.perLiter} g/L
- MKP (Fosfato Monopotássico): ${result.mkp.perLiter} g/L
- Sulfato de Magnésio: ${result.magnesiumSulfate.perLiter} g/L
- Micronutrientes: ${result.micronutrients.perLiter} g/L

QUANTIDADES TOTAIS:
- Nitrato de Cálcio: ${result.calciumNitrate.total} g
- Nitrato de Potássio: ${result.potassiumNitrate.total} g
- MKP: ${result.mkp.total} g
- Sulfato de Magnésio: ${result.magnesiumSulfate.total} g
- Micronutrientes: ${result.micronutrients.total} g

DICA:
Dissolva cada reagente separadamente e misture na ordem:
Cálcio → Potássio → MKP → Magnésio → Micronutrientes

NUNCA misture Cálcio diretamente com Sulfato ou Fosfato!
Aguarde cada reagente dissolver completamente antes de adicionar o próximo.

---
Gerado por App Cultivo em ${now.toLocaleString('pt-BR')}
`;
                
                // Criar blob e download
                const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `receita-fertilizacao-${result.volume}L-${result.ec}mS.txt`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                toast.success('✅ Receita exportada para TXT!');
              }}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              💾 Exportar Receita (TXT)
            </Button>
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
                    title="Carregar predefinição"
                  >
                    Carregar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditPreset(preset)}
                    title="Editar predefinição"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSharePreset(preset)}
                    title="Compartilhar predefinição"
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
                    title="Excluir predefinição"
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

      {/* Modal de Editar Predefinição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Predefinição</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-preset-name">Nome da Predefinição</Label>
              <Input
                id="edit-preset-name"
                value={editPresetName}
                onChange={(e) => setEditPresetName(e.target.value)}
                placeholder="Ex: Vega Semana 3 - 10L"
              />
            </div>
            {editingPreset && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>🌱 Fase: {editingPreset.phase === "vega" ? "Vegetativa" : "Floração"}</p>
                <p>📅 Semana: {editingPreset.weekNumber}</p>
                <p>💧 Volume: {editingPreset.waterVolume}L</p>
                <p>⚡ EC: {editingPreset.targetEC} mS/cm</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Nota: Apenas o nome pode ser editado. Para alterar os valores, crie uma nova predefinição.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
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

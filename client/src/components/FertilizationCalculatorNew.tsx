import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, Sprout } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function FertilizationCalculatorNew() {
  // Estados
  const [calculationMode, setCalculationMode] = useState<"per-irrigation" | "per-week">("per-irrigation");
  const [waterVolume, setWaterVolume] = useState<string>("");
  const [targetEC, setTargetEC] = useState<string>("");
  const [irrigationsPerWeek, setIrrigationsPerWeek] = useState<string>("3.5");
  const [usePreset, setUsePreset] = useState<boolean>(true);
  const [selectedPhase, setSelectedPhase] = useState<"VEGA" | "FLORA">("VEGA");
  const [selectedWeek, setSelectedWeek] = useState<string>("1");

  // Query para buscar valores recomendados
  const { data: strains } = trpc.strains.list.useQuery();
  const { data: weeklyTarget } = trpc.weeklyTargets.get.useQuery(
    {
      strainId: strains?.[0]?.id ?? 0,
      phase: selectedPhase,
      weekNumber: parseInt(selectedWeek) || 1,
    },
    { enabled: usePreset && !!strains?.[0]?.id }
  );

  // Atualizar EC quando mudar preset
  useEffect(() => {
    if (usePreset && weeklyTarget?.ecMax) {
      setTargetEC(weeklyTarget.ecMax.toString());
    }
  }, [usePreset, weeklyTarget]);

  const [result, setResult] = useState<{
    calciumNitrate: number;
    potassiumNitrate: number;
    mkp: number;
    magnesiumSulfate: number;
    weeklyTotal?: {
      calciumNitrate: number;
      potassiumNitrate: number;
      mkp: number;
      magnesiumSulfate: number;
    };
  } | null>(null);

  const calculateFertilization = () => {
    const volume = parseFloat(waterVolume);
    const ec = parseFloat(targetEC);

    if (isNaN(volume) || volume <= 0 || isNaN(ec) || ec <= 0) return;

    // Fórmula simplificada (baseada em EC target)
    const calciumNitrate = (ec * 0.4 * volume).toFixed(2);
    const potassiumNitrate = (ec * 0.3 * volume).toFixed(2);
    const mkp = (ec * 0.2 * volume).toFixed(2);
    const magnesiumSulfate = (ec * 0.1 * volume).toFixed(2);

    if (calculationMode === "per-week") {
      const irrigations = parseFloat(irrigationsPerWeek);
      if (isNaN(irrigations) || irrigations <= 0) return;

      setResult({
        calciumNitrate: parseFloat(calciumNitrate),
        potassiumNitrate: parseFloat(potassiumNitrate),
        mkp: parseFloat(mkp),
        magnesiumSulfate: parseFloat(magnesiumSulfate),
        weeklyTotal: {
          calciumNitrate: parseFloat(calciumNitrate) * irrigations,
          potassiumNitrate: parseFloat(potassiumNitrate) * irrigations,
          mkp: parseFloat(mkp) * irrigations,
          magnesiumSulfate: parseFloat(magnesiumSulfate) * irrigations,
        },
      });
    } else {
      setResult({
        calciumNitrate: parseFloat(calciumNitrate),
        potassiumNitrate: parseFloat(potassiumNitrate),
        mkp: parseFloat(mkp),
        magnesiumSulfate: parseFloat(magnesiumSulfate),
      });
    }
  };

  return (
    <Card className="bg-card/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-green-500" />
          🌿 Nova Calculadora de Fertilização
        </CardTitle>
        <CardDescription>
          Calcule a dosagem de fertilizantes NPK para atingir o EC desejado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Modo de Cálculo */}
        <div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setCalculationMode("per-irrigation")}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              calculationMode === "per-irrigation"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Por Rega
          </button>
          <button
            onClick={() => setCalculationMode("per-week")}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              calculationMode === "per-week"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Por Semana
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Volume de Água */}
          <div className="space-y-2">
            <Label htmlFor="waterVolume">
              {calculationMode === "per-irrigation" ? "Volume de Preparo (litros)" : "Volume por Rega (litros)"}
            </Label>
            <Input
              id="waterVolume"
              type="number"
              placeholder="Ex: 10"
              value={waterVolume}
              onChange={(e) => setWaterVolume(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {calculationMode === "per-irrigation" ? "Quantidade total de solução a preparar" : "Volume usado em cada rega"}
            </p>
          </div>

          {/* EC Desejado com Preset */}
          <div className="space-y-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="usePreset"
                checked={usePreset}
                onChange={(e) => setUsePreset(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="usePreset" className="cursor-pointer">
                ✅ Usar EC recomendado por fase/semana
              </Label>
            </div>

            {usePreset && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="phase">Fase</Label>
                  <select
                    id="phase"
                    value={selectedPhase}
                    onChange={(e) => setSelectedPhase(e.target.value as "VEGA" | "FLORA")}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="VEGA">Vegetativa (Vega)</option>
                    <option value="FLORA">Floração (Flora)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="week">Semana</Label>
                  <select
                    id="week"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
                      <option key={week} value={week}>
                        Semana {week}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="targetEC">
                EC Desejado (mS/cm)
                {usePreset && weeklyTarget && (
                  <span className="ml-2 text-xs text-green-600">
                    (Recomendado: {weeklyTarget.ecMin} - {weeklyTarget.ecMax})
                  </span>
                )}
              </Label>
              <Input
                id="targetEC"
                type="number"
                step="0.1"
                placeholder="Ex: 2.0"
                value={targetEC}
                onChange={(e) => setTargetEC(e.target.value)}
                disabled={usePreset}
              />
              <p className="text-xs text-muted-foreground">
                {usePreset
                  ? "EC preenchido automaticamente baseado na fase/semana selecionada"
                  : "Digite manualmente o EC desejado"}
              </p>
            </div>
          </div>

          {/* Regas por Semana (apenas no modo semanal) */}
          {calculationMode === "per-week" && (
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="irrigationsPerWeek">Regas por Semana</Label>
              <Input
                id="irrigationsPerWeek"
                type="number"
                step="0.5"
                placeholder="Ex: 3.5"
                value={irrigationsPerWeek}
                onChange={(e) => setIrrigationsPerWeek(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Quantas vezes você rega por semana</p>
            </div>
          )}
        </div>

        <Button onClick={calculateFertilization} className="w-full">
          <Calculator className="w-4 h-4 mr-2" />
          Calcular Receita
        </Button>

        {/* Resultado */}
        {result && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-bold text-foreground">
              📊 Receita {calculationMode === "per-week" ? "Semanal" : "por Rega"}:
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Nitrato de Cálcio:</span>
                <span className="text-lg font-bold text-green-600">{result.calciumNitrate}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Nitrato de Potássio:</span>
                <span className="text-lg font-bold text-green-600">{result.potassiumNitrate}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">MKP:</span>
                <span className="text-lg font-bold text-green-600">{result.mkp}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sulfato de Magnésio:</span>
                <span className="text-lg font-bold text-green-600">{result.magnesiumSulfate}g</span>
              </div>

              {result.weeklyTotal && (
                <>
                  <hr className="my-4 border-green-500/20" />
                  <h4 className="text-md font-bold text-foreground">📦 Total Semanal:</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Nitrato de Cálcio:</span>
                    <span className="text-xl font-bold text-green-600">{result.weeklyTotal.calciumNitrate.toFixed(2)}g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Nitrato de Potássio:</span>
                    <span className="text-xl font-bold text-green-600">{result.weeklyTotal.potassiumNitrate.toFixed(2)}g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">MKP:</span>
                    <span className="text-xl font-bold text-green-600">{result.weeklyTotal.mkp.toFixed(2)}g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sulfato de Magnésio:</span>
                    <span className="text-xl font-bold text-green-600">{result.weeklyTotal.magnesiumSulfate.toFixed(2)}g</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

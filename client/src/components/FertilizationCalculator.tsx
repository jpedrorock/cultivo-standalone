import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function FertilizationCalculator() {
  const [phase, setPhase] = useState<"vega" | "flora">("vega");
  const [weekNumber, setWeekNumber] = useState(1);
  const [volume, setVolume] = useState(10);
  const [customEC, setCustomEC] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);

  // Buscar EC recomendado do backend
  const { data: weeklyTarget } = trpc.weeklyTargets.get.useQuery({
    phase,
    weekNumber,
  });

  const targetEC = customEC !== null ? customEC : (weeklyTarget?.targetEC || 0);

  const handleCalculate = () => {
    if (volume <= 0) {
      toast.error("Volume deve ser maior que zero");
      return;
    }

    if (targetEC <= 0) {
      toast.error("EC deve ser maior que zero");
      return;
    }

    // Fórmulas simplificadas (ajustar conforme necessário)
    const nitrogenGrams = (targetEC * volume * 0.4).toFixed(2);
    const phosphorusGrams = (targetEC * volume * 0.3).toFixed(2);
    const potassiumGrams = (targetEC * volume * 0.3).toFixed(2);

    setResult({
      nitrogen: nitrogenGrams,
      phosphorus: phosphorusGrams,
      potassium: potassiumGrams,
      totalVolume: volume,
      targetEC: targetEC,
    });

    toast.success("Receita calculada com sucesso!");
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
          <div>
            <Label htmlFor="ec">EC Desejado (mS/cm)</Label>
            {weeklyTarget && (
              <p className="text-sm text-muted-foreground mb-2">
                💡 EC recomendado para {phase === "vega" ? "Vega" : "Flora"} Semana {weekNumber}: {weeklyTarget.targetEC} mS/cm
              </p>
            )}
            <Input
              id="ec"
              type="number"
              step="0.1"
              value={customEC !== null ? customEC : (weeklyTarget?.targetEC || "")}
              onChange={(e) => setCustomEC(parseFloat(e.target.value) || null)}
              placeholder="Ex: 2.0"
            />
          </div>

          <Button onClick={handleCalculate} className="w-full" size="lg">
            📊 Calcular Receita
          </Button>
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
    </div>
  );
}

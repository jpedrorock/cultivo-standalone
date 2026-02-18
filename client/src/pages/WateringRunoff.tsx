import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Droplets, Calculator, AlertCircle, CheckCircle2 } from "lucide-react";

export default function WateringRunoff() {
  // Calculadora de Rega
  const [numPlants, setNumPlants] = useState<number>(4);
  const [potSize, setPotSize] = useState<number>(11);
  const [desiredRunoff, setDesiredRunoff] = useState<number>(20);
  const [lastRunoff, setLastRunoff] = useState<string>("");
  
  // Calculadora de Runoff
  const [volumeIn, setVolumeIn] = useState<string>("");
  const [volumeOut, setVolumeOut] = useState<string>("");

  // Cálculos da Calculadora de Rega
  const calculateWatering = () => {
    // Volume base por planta (33% da capacidade do vaso)
    const baseVolume = potSize * 0.33;
    
    // Volume com runoff desejado
    const volumeWithRunoff = baseVolume * (1 + desiredRunoff / 100);
    
    // Se forneceu runoff da última rega, ajustar
    let adjustedVolume = volumeWithRunoff;
    let adjustment = "";
    
    if (lastRunoff && parseFloat(lastRunoff) > 0) {
      const lastRunoffNum = parseFloat(lastRunoff);
      const diff = desiredRunoff - lastRunoffNum;
      
      if (Math.abs(diff) > 2) {
        // Ajustar proporcionalmente
        const adjustmentFactor = 1 + (diff / 100);
        adjustedVolume = volumeWithRunoff * adjustmentFactor;
        
        if (diff > 0) {
          adjustment = `Aumentado ${diff.toFixed(1)}% para atingir ${desiredRunoff}%`;
        } else {
          adjustment = `Reduzido ${Math.abs(diff).toFixed(1)}% para atingir ${desiredRunoff}%`;
        }
      }
    }
    
    return {
      baseVolume: volumeWithRunoff.toFixed(2),
      adjustedVolume: adjustedVolume.toFixed(2),
      totalVolume: (adjustedVolume * numPlants).toFixed(2),
      adjustment,
      isAdjusted: !!adjustment
    };
  };

  // Cálculos da Calculadora de Runoff
  const calculateRunoff = () => {
    if (!volumeIn || !volumeOut) return null;
    
    const volIn = parseFloat(volumeIn);
    const volOut = parseFloat(volumeOut);
    
    if (volIn <= 0 || volOut < 0) return null;
    
    const runoffPercent = (volOut / volIn) * 100;
    const diff = runoffPercent - desiredRunoff;
    
    let status: "ideal" | "low" | "high" = "ideal";
    let recommendation = "";
    
    if (Math.abs(diff) <= 2) {
      status = "ideal";
      recommendation = "Perfeito! Mantenha esse volume.";
    } else if (diff < 0) {
      status = "low";
      recommendation = `Runoff abaixo do ideal. Aumente o volume em aproximadamente ${Math.abs(diff * 2).toFixed(0)}%.`;
    } else {
      status = "high";
      recommendation = `Runoff acima do ideal. Reduza o volume em aproximadamente ${(diff * 2).toFixed(0)}%.`;
    }
    
    return {
      runoffPercent: runoffPercent.toFixed(1),
      status,
      recommendation
    };
  };

  const wateringResult = calculateWatering();
  const runoffResult = calculateRunoff();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <Droplets className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Rega e Runoff</h1>
              <p className="text-muted-foreground">Calculadoras para otimizar sua rega</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Calculadora de Rega */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Calculadora de Rega
              </CardTitle>
              <CardDescription>
                Calcule o volume ideal de água para suas plantas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="numPlants">Número de Plantas</Label>
                  <Input
                    id="numPlants"
                    type="number"
                    value={numPlants}
                    onChange={(e) => setNumPlants(parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="potSize">Tamanho do Vaso (L)</Label>
                  <Input
                    id="potSize"
                    type="number"
                    value={potSize}
                    onChange={(e) => setPotSize(parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desiredRunoff">Runoff Desejado (%)</Label>
                  <Input
                    id="desiredRunoff"
                    type="number"
                    value={desiredRunoff}
                    onChange={(e) => setDesiredRunoff(parseInt(e.target.value) || 0)}
                    min="0"
                    max="50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastRunoff">
                    Runoff Real da Última Rega (%) - Opcional
                  </Label>
                  <Input
                    id="lastRunoff"
                    type="number"
                    value={lastRunoff}
                    onChange={(e) => setLastRunoff(e.target.value)}
                    placeholder="Ex: 16"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    Se fornecido, o volume será ajustado automaticamente
                  </p>
                </div>
              </div>

              {/* Resultados */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-foreground">Resultados:</h3>
                
                {wateringResult.isAdjusted ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{wateringResult.adjustment}</span>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Volume base:</span>
                        <span className="font-medium">{wateringResult.baseVolume}L por planta</span>
                      </div>
                      <div className="flex justify-between text-primary">
                        <span className="text-sm font-semibold">Volume ajustado:</span>
                        <span className="font-bold">{wateringResult.adjustedVolume}L por planta</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sm font-semibold">Total para {numPlants} plantas:</span>
                        <span className="font-bold text-lg">{wateringResult.totalVolume}L</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Volume por planta:</span>
                      <span className="font-medium">{wateringResult.baseVolume}L</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-sm font-semibold">Total para {numPlants} plantas:</span>
                      <span className="font-bold text-lg">{wateringResult.totalVolume}L</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Calculadora de Runoff */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                Calculadora de Runoff
              </CardTitle>
              <CardDescription>
                Meça o runoff real após regar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="volumeIn">Volume Regado (L)</Label>
                  <Input
                    id="volumeIn"
                    type="number"
                    step="0.1"
                    value={volumeIn}
                    onChange={(e) => setVolumeIn(e.target.value)}
                    placeholder="Ex: 17.6"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volumeOut">Volume Coletado no Copo (L)</Label>
                  <Input
                    id="volumeOut"
                    type="number"
                    step="0.1"
                    value={volumeOut}
                    onChange={(e) => setVolumeOut(e.target.value)}
                    placeholder="Ex: 3.5"
                  />
                </div>

                <Button 
                  onClick={() => calculateRunoff()}
                  className="w-full"
                  disabled={!volumeIn || !volumeOut}
                >
                  Calcular Runoff
                </Button>
              </div>

              {/* Resultados */}
              {runoffResult && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-foreground">Resultados:</h3>
                  
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Runoff Real:</span>
                      <span className="font-bold text-2xl text-foreground">
                        {runoffResult.runoffPercent}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Runoff Desejado:</span>
                      <span className="font-medium">{desiredRunoff}%</span>
                    </div>
                  </div>

                  {/* Status e Recomendação */}
                  <div className={`p-4 rounded-lg flex items-start gap-3 ${
                    runoffResult.status === "ideal" 
                      ? "bg-green-500/10 border border-green-500/30" 
                      : "bg-amber-500/10 border border-amber-500/30"
                  }`}>
                    {runoffResult.status === "ideal" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className={`font-semibold ${
                        runoffResult.status === "ideal" ? "text-green-600" : "text-amber-600"
                      }`}>
                        {runoffResult.status === "ideal" ? "✅ Ideal!" : "⚠️ Ajuste Necessário"}
                      </p>
                      <p className="text-sm text-foreground">
                        {runoffResult.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dicas */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>💡 Dicas de Uso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Calculadora de Rega:</strong> Use para calcular quanto regar. 
              Se informar o runoff da última rega, o sistema ajusta automaticamente o volume para atingir o ideal.
            </p>
            <p>
              <strong className="text-foreground">Calculadora de Runoff:</strong> Após regar, meça o volume 
              coletado no copo e calcule o runoff real. Use esse valor na próxima rega para ajuste automático.
            </p>
            <p>
              <strong className="text-foreground">Runoff Ideal:</strong> Geralmente entre 15-25%. 
              Runoff muito baixo pode causar acúmulo de sais, muito alto desperdiça água e nutrientes.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

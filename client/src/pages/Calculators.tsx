import { useState, useEffect } from "react";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Droplets, Sprout, Sun, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Funções de exportação de receitas
function exportIrrigationRecipe(potVolume: string, substrate: string, result: { volume: number; frequency: string }) {
  const substrateNames: Record<string, string> = {
    soil: "Solo/Terra",
    coco: "Fibra de Coco",
    hidro: "Hidroponia"
  };

  const content = `
===========================================
       RECEITA DE REGA - APP CULTIVO
===========================================

DATA: ${new Date().toLocaleDateString('pt-BR')}

PARÂMETROS:
- Volume do vaso: ${potVolume}L
- Tipo de substrato: ${substrateNames[substrate] || substrate}

RESULTADO:
- Volume por rega: ${result.volume}L
- Frequência: ${result.frequency}

DICA:
Regue até ver 10-20% de drenagem no fundo do vaso
para evitar acúmulo de sais.

===========================================
  `;

  downloadTextFile(content, `receita-rega-${Date.now()}.txt`);
}

function exportFertilizationRecipe(waterVolume: string, targetEC: string, _unused: string, result: { calciumNitrate: number; potassiumNitrate: number; mkp: number; magnesiumSulfate: number; micronutrients: number; totalPPM: number }) {
  const content = `
===========================================
   RECEITA DE FERTILIZAÇÃO - APP CULTIVO
===========================================

DATA: ${new Date().toLocaleDateString('pt-BR')}

PARÂMETROS:
- Volume de preparo: ${waterVolume}L
- EC desejado: ${targetEC} mS/cm
- PPM aproximado: ${result.totalPPM} ppm

RECEITA (g/L):
- Nitrato de Cálcio: ${result.calciumNitrate} g/L
- Nitrato de Potássio: ${result.potassiumNitrate} g/L
- MKP (Fosfato Monopotássico): ${result.mkp} g/L
- Sulfato de Magnésio: ${result.magnesiumSulfate} g/L
- Micronutrientes: ${result.micronutrients} g/L

QUANTIDADES TOTAIS:
- Nitrato de Cálcio: ${(result.calciumNitrate * parseFloat(waterVolume)).toFixed(2)} g
- Nitrato de Potássio: ${(result.potassiumNitrate * parseFloat(waterVolume)).toFixed(2)} g
- MKP: ${(result.mkp * parseFloat(waterVolume)).toFixed(2)} g
- Sulfato de Magnésio: ${(result.magnesiumSulfate * parseFloat(waterVolume)).toFixed(2)} g
- Micronutrientes: ${(result.micronutrients * parseFloat(waterVolume)).toFixed(2)} g

DICA:
Dissolva cada reagente separadamente e misture na ordem:
Cálcio → Potássio → MKP → Magnésio → Micronutrientes

===========================================
  `;

  downloadTextFile(content, `receita-fertilizacao-${Date.now()}.txt`);
}

function exportLuxPPFDRecipe(lux: string, lightType: string, result: number) {
  const lightTypeNames: Record<string, string> = {
    "led-white": "LED Branco",
    "led-full-spectrum": "LED Full Spectrum",
    "hps": "HPS (Alta Pressão de Sódio)",
    "mh": "MH (Metal Halide)",
    "sunlight": "Luz Solar"
  };

  const content = `
===========================================
   CONVERSÃO LUX → PPFD - APP CULTIVO
===========================================

DATA: ${new Date().toLocaleDateString('pt-BR')}

PARÂMETROS:
- Leitura em Lux: ${lux}
- Tipo de luz: ${lightTypeNames[lightType] || lightType}

RESULTADO:
- PPFD estimado: ${result} µmol/m²/s

REFERÊNCIAS DE PPFD POR FASE:
- Clonagem: 100-200 µmol/m²/s
- Vegetativa: 400-600 µmol/m²/s
- Floração: 600-900 µmol/m²/s
- Máximo: 1000-1200 µmol/m²/s

DICA:
Esta é uma estimativa. Para medições precisas,
use um medidor PPFD (quantum sensor).

===========================================
  `;

  downloadTextFile(content, `conversao-lux-ppfd-${Date.now()}.txt`);
}

function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

import { useRoute, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Calculators() {
  const [, params] = useRoute("/calculators/:id");
  const [, setLocation] = useLocation();
  const calculatorId = params?.id || "irrigation";

  const calculatorTitles: Record<string, string> = {
    "watering-runoff": "Rega e Runoff",
    fertilization: "Calculadora de Fertilização",
    "lux-ppfd": "Conversor Lux → PPFD",
    "ppm-ec": "Conversor PPM ↔ EC",
    "ph-adjust": "Calculadora de pH",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/calculators")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Calculator className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {calculatorTitles[calculatorId] || "Calculadora"}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">Ferramenta prática para cultivo</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs value={calculatorId} className="w-full">

          {/* Rega e Runoff */}
          <TabsContent value="watering-runoff">
            <WateringRunoffCalculator />
          </TabsContent>

          {/* Calculadora de Fertilização */}
          <TabsContent value="fertilization">
            <FertilizationCalculator />
          </TabsContent>

          {/* Calculadora Lux → PPFD */}
          <TabsContent value="lux-ppfd">
            <LuxPPFDCalculator />
          </TabsContent>
          
          {/* Calculadora PPM ↔ EC */}
          <TabsContent value="ppm-ec">
            <PPMECConverter />
          </TabsContent>
          
          {/* Calculadora de Ajuste de pH */}
          <TabsContent value="ph-adjust">
            <PHAdjustCalculator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Rega e Runoff (Integrado)
function WateringRunoffCalculator() {
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
    <div className="space-y-8">
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
      <Card>
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
            Runoff muito baixo pode causar acúmulo de sais, muito alto desperdíça água e nutrientes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// REMOVIDO: Calculadora de Runoff antiga
// REMOVIDO: Calculadora de Rega antiga

// Placeholder para manter numeração
function RunoffCalculator() {
  const [volumeIn, setVolumeIn] = useState<string>("");
  const [volumeOut, setVolumeOut] = useState<string>("");
  const [phase, setPhase] = useState<string>("vega");
  const [substrate, setSubstrate] = useState<string>("coco");
  const [result, setResult] = useState<{ runoffPercent: number; status: string; recommendation: string; color: string } | null>(null);

  const calculateRunoff = () => {
    const volIn = parseFloat(volumeIn);
    const volOut = parseFloat(volumeOut);

    if (isNaN(volIn) || isNaN(volOut) || volIn <= 0) return;

    const runoffPercent = Math.round((volOut / volIn) * 100);

    // Determinar status e recomendação
    let status = "";
    let recommendation = "";
    let color = "";

    if (runoffPercent < 10) {
      status = "Runoff Muito Baixo";
      recommendation = "Risco de acúmulo de sais! Aumente o volume de água ou a frequência de rega. Ideal: 15-20%.";
      color = "red";
    } else if (runoffPercent >= 10 && runoffPercent < 15) {
      status = "Runoff Baixo";
      recommendation = "Runoff um pouco abaixo do ideal. Considere aumentar ligeiramente o volume de água.";
      color = "yellow";
    } else if (runoffPercent >= 15 && runoffPercent <= 25) {
      status = "Runoff Ideal";
      recommendation = "Perfeito! Você está na faixa ideal de drenagem. Continue assim.";
      color = "green";
    } else if (runoffPercent > 25 && runoffPercent <= 35) {
      status = "Runoff Alto";
      recommendation = "Runoff um pouco acima do ideal. Você pode estar desperdiçando água e nutrientes.";
      color = "yellow";
    } else {
      status = "Runoff Muito Alto";
      recommendation = "Desperdício excessivo de água e nutrientes! Reduza o volume de rega.";
      color = "red";
    }

    setResult({
      runoffPercent,
      status,
      recommendation,
      color,
    });
  };

  return (
    <Card className="bg-card/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-cyan-500" />
          Calculadora de Runoff
        </CardTitle>
        <CardDescription>
          Calcule o % de runoff (drenagem) e verifique se está na faixa ideal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="volumeIn">Volume de Entrada (litros)</Label>
            <Input
              id="volumeIn"
              type="number"
              placeholder="Ex: 10"
              value={volumeIn}
              onChange={(e) => setVolumeIn(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Quantidade de água que você regou</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="volumeOut">Volume de Saída (litros)</Label>
            <Input
              id="volumeOut"
              type="number"
              placeholder="Ex: 2"
              value={volumeOut}
              onChange={(e) => setVolumeOut(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Quantidade que drenou no prato</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phase">Fase do Ciclo</Label>
            <select
              id="phase"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
            >
              <option value="vega">Vegetativa</option>
              <option value="flora">Floração</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="substrate">Tipo de Substrato</Label>
            <select
              id="substrate"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={substrate}
              onChange={(e) => setSubstrate(e.target.value)}
            >
              <option value="soil">Solo/Terra</option>
              <option value="coco">Fibra de Coco</option>
              <option value="hidro">Hidroponia</option>
            </select>
          </div>
        </div>

        <Button onClick={calculateRunoff} className="w-full">
          <Calculator className="w-4 h-4 mr-2" />
          Calcular Runoff
        </Button>

        {result && (
          <div className={`border-2 rounded-lg p-6 space-y-3 ${
            result.color === "green" ? "bg-green-500/10 border-green-500/30" :
            result.color === "yellow" ? "bg-yellow-500/10 border-yellow-500/30" :
            "bg-red-500/10 border-red-500/30"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Runoff:</span>
              <span className={`text-3xl font-bold ${
                result.color === "green" ? "text-green-600" :
                result.color === "yellow" ? "text-yellow-600" :
                "text-red-600"
              }`}>{result.runoffPercent}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Status:</span>
              <span className={`text-lg font-semibold ${
                result.color === "green" ? "text-green-600" :
                result.color === "yellow" ? "text-yellow-600" :
                "text-red-600"
              }`}>{result.status}</span>
            </div>
            <div className="bg-background/50 rounded-lg p-3 mt-3">
              <p className="text-sm text-foreground">
                <strong>💡 Recomendação:</strong> {result.recommendation}
              </p>
            </div>
            <div className="text-xs text-muted-foreground mt-4 space-y-1">
              <p><strong>Faixas de Referência:</strong></p>
              <p>🔴 &lt;10%: Muito baixo (risco de acúmulo de sais)</p>
              <p>🟡 10-15%: Baixo</p>
              <p>🟢 15-25%: Ideal</p>
              <p>🟡 25-35%: Alto</p>
              <p>🔴 &gt;35%: Muito alto (desperdício)</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// REMOVIDO: Movido para WateringRunoffCalculator
function IrrigationCalculator() {
  const [calculationMode, setCalculationMode] = useState<"daily" | "weekly">("daily");
  const [potVolume, setPotVolume] = useState<string>("");
  const [substrate, setSubstrate] = useState<string>("coco");
  const [numPlants, setNumPlants] = useState<string>("1");
  const [irrigationFrequency, setIrrigationFrequency] = useState<string>("2");
  const [runoffPercent, setRunoffPercent] = useState<string>("20");
  const [runoffReal, setRunoffReal] = useState<string>("");
  const [result, setResult] = useState<{ volume: number; frequency: string; weeklyTotal?: number; irrigationsPerWeek?: number; tankSize?: number; adjustment?: string; adjustmentPercent?: number } | null>(null);

  const calculateIrrigation = () => {
    const volume = parseFloat(potVolume);
    const plants = parseFloat(numPlants);
    const freqDays = parseFloat(irrigationFrequency);
    const runoff = parseFloat(runoffPercent) / 100;

    if (isNaN(volume) || volume <= 0) return;
    if (calculationMode === "weekly" && (isNaN(plants) || plants <= 0 || isNaN(freqDays) || freqDays <= 0)) return;

    // Fórmulas baseadas em práticas comuns de cultivo
    let waterPercentage = 0.25; // 25% do volume do vaso (padrão para solo)
    let frequency = "a cada 2-3 dias";

    if (substrate === "coco") {
      waterPercentage = 0.33; // 33% para coco (retém menos água)
      frequency = "diariamente";
    } else if (substrate === "hidro") {
      waterPercentage = 0.15; // 15% para hidroponia (sistema recirculante)
      frequency = "múltiplas vezes ao dia";
    }

    const waterPerPlant = volume * waterPercentage * (1 + runoff);

    // Calcular ajuste baseado no runoff real
    let adjustment = "";
    let adjustmentPercent = 0;
    const realRunoff = parseFloat(runoffReal);
    
    if (!isNaN(realRunoff) && realRunoff > 0) {
      const targetRunoff = parseFloat(runoffPercent);
      const diff = targetRunoff - realRunoff;
      
      if (Math.abs(diff) > 2) { // Só sugerir ajuste se diferença > 2%
        adjustmentPercent = Math.round((diff / targetRunoff) * 100);
        
        if (diff > 0) {
          // Runoff real menor que desejado → aumentar volume
          adjustment = `Aumente o volume em ~${Math.abs(adjustmentPercent)}% (runoff atual: ${realRunoff}%)`;
        } else {
          // Runoff real maior que desejado → diminuir volume
          adjustment = `Diminua o volume em ~${Math.abs(adjustmentPercent)}% (runoff atual: ${realRunoff}%)`;
        }
      } else {
        adjustment = `Volume adequado! Runoff atual (${realRunoff}%) está dentro da faixa ideal.`;
      }
    }

    if (calculationMode === "daily") {
      setResult({
        volume: Math.round(waterPerPlant * 100) / 100,
        frequency,
        adjustment,
        adjustmentPercent,
      });
    } else {
      // Cálculo semanal
      const irrigationsPerWeek = 7 / freqDays;
      const weeklyTotalPerPlant = waterPerPlant * irrigationsPerWeek;
      const weeklyTotal = weeklyTotalPerPlant * plants;
      const tankSize = Math.ceil(weeklyTotal * 1.1); // +10% margem de segurança

      setResult({
        volume: Math.round(waterPerPlant * 100) / 100,
        frequency: `a cada ${freqDays} dias`,
        irrigationsPerWeek: Math.round(irrigationsPerWeek * 10) / 10,
        weeklyTotal: Math.round(weeklyTotal * 100) / 100,
        tankSize,
        adjustment,
        adjustmentPercent,
      });
    }
  };

  return (
    <Card className="bg-card/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          Calculadora de Rega
        </CardTitle>
        <CardDescription>
          Calcule o volume ideal de água por planta baseado no tamanho do vaso e tipo de substrato
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Modo de Cálculo */}
        <div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setCalculationMode("daily")}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              calculationMode === "daily"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Por Rega (Diário)
          </button>
          <button
            onClick={() => setCalculationMode("weekly")}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              calculationMode === "weekly"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Por Semana (Tank)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="potVolume">Volume do Vaso (litros)</Label>
            <Input
              id="potVolume"
              type="number"
              placeholder="Ex: 11"
              value={potVolume}
              onChange={(e) => setPotVolume(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="substrate">Tipo de Substrato</Label>
            <select
              id="substrate"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={substrate}
              onChange={(e) => setSubstrate(e.target.value)}
            >
              <option value="soil">Solo/Terra</option>
              <option value="coco">Fibra de Coco</option>
              <option value="hidro">Hidroponia</option>
            </select>
          </div>

          {calculationMode === "weekly" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="numPlants">Número de Plantas</Label>
                <Input
                  id="numPlants"
                  type="number"
                  placeholder="Ex: 4"
                  value={numPlants}
                  onChange={(e) => setNumPlants(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="irrigationFrequency">Frequência de Rega (dias)</Label>
                <Input
                  id="irrigationFrequency"
                  type="number"
                  placeholder="Ex: 2"
                  value={irrigationFrequency}
                  onChange={(e) => setIrrigationFrequency(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="runoffPercent">% Runoff Desejado</Label>
                <Input
                  id="runoffPercent"
                  type="number"
                  placeholder="Ex: 20"
                  value={runoffPercent}
                  onChange={(e) => setRunoffPercent(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="runoffReal">% Runoff Real Medido (opcional)</Label>
            <Input
              id="runoffReal"
              type="number"
              placeholder="Ex: 15 (medido na última rega)"
              value={runoffReal}
              onChange={(e) => setRunoffReal(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              💡 Meça o runoff real para ajustar o volume de rega. Se runoff real &lt; desejado → aumente volume. Se runoff real &gt; desejado → diminua volume.
            </p>
          </div>
        </div>

        <Button onClick={calculateIrrigation} className="w-full">
          <Calculator className="w-4 h-4 mr-2" />
          Calcular Volume de Rega
        </Button>

        {result && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 space-y-3">
            {calculationMode === "daily" ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Volume por rega:</span>
                  <span className="text-2xl font-bold text-blue-600">{result.volume}L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Frequência recomendada:</span>
                  <span className="text-lg font-semibold text-blue-600">{result.frequency}</span>
                </div>
                {result.adjustment && (
                  <div className={`mt-4 p-3 rounded-lg border ${
                    result.adjustment.includes('adequado') 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-yellow-500/10 border-yellow-500/20'
                  }`}>
                    <p className="text-sm font-medium">
                      🎯 <strong>Recomendação:</strong> {result.adjustment}
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-4">
                  💡 <strong>Dica:</strong> Regue até ver 10-20% de drenagem no fundo do vaso para evitar acúmulo de sais.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-foreground mb-4">📊 Resultado (7 dias):</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Regas por semana:</span>
                    <span className="text-lg font-bold text-blue-600">{result.irrigationsPerWeek}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Volume por rega:</span>
                    <span className="text-lg font-bold text-blue-600">{result.volume}L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Total semanal:</span>
                    <span className="text-2xl font-bold text-blue-600">{result.weeklyTotal}L</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-blue-500/20 pt-2 mt-2">
                    <span className="text-sm font-medium text-foreground">Tank mínimo recomendado:</span>
                    <span className="text-2xl font-bold text-green-600">{result.tankSize}L</span>
                  </div>
                </div>
                {result.adjustment && (
                  <div className={`mt-4 p-3 rounded-lg border ${
                    result.adjustment.includes('adequado') 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-yellow-500/10 border-yellow-500/20'
                  }`}>
                    <p className="text-sm font-medium">
                      🎯 <strong>Recomendação:</strong> {result.adjustment}
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-4">
                  💡 <strong>Dica:</strong> O tank recomendado inclui +10% de margem de segurança. Prepare a solução nutritiva uma vez por semana.
                </p>
              </>
            )}
            <Button 
              onClick={() => exportIrrigationRecipe(potVolume, substrate, result)} 
              variant="outline" 
              className="w-full mt-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Receita
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Calculadora de Fertilização (Receita por Reagente)
function FertilizationCalculator() {
  const [calculationMode, setCalculationMode] = useState<"per-irrigation" | "per-week">("per-irrigation");
  const [waterVolume, setWaterVolume] = useState<string>("");
  const [targetEC, setTargetEC] = useState<string>("");
  const [irrigationsPerWeek, setIrrigationsPerWeek] = useState<string>("3.5");
  const [usePreset, setUsePreset] = useState<boolean>(true);
  const [selectedPhase, setSelectedPhase] = useState<"VEGA" | "FLORA">("VEGA");
  const [selectedWeek, setSelectedWeek] = useState<string>("1");
  
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
  React.useEffect(() => {
    if (usePreset && weeklyTarget?.ecMax) {
      setTargetEC(weeklyTarget.ecMax.toString());
    }
  }, [usePreset, weeklyTarget]);
  
  const [result, setResult] = useState<{ 
    calciumNitrate: number;
    potassiumNitrate: number;
    mkp: number;
    magnesiumSulfate: number;
    micronutrients: number;
    totalPPM: number;
    weeklyCalciumNitrate?: number;
    weeklyPotassiumNitrate?: number;
    weeklyMKP?: number;
    weeklyMagnesiumSulfate?: number;
    weeklyMicronutrients?: number;
    weeklyCost?: number;
  } | null>(null);
  
  // Preços médios dos reagentes (R$/kg)
  const prices = {
    calciumNitrate: 15.00,
    potassiumNitrate: 18.00,
    mkp: 25.00,
    magnesiumSulfate: 12.00,
    micronutrients: 80.00
  };

  const calculateFertilization = () => {
    const water = parseFloat(waterVolume);
    const ec = parseFloat(targetEC);
    const irrigations = parseFloat(irrigationsPerWeek);

    if (isNaN(water) || isNaN(ec) || water <= 0 || ec <= 0) return;
    if (calculationMode === "per-week" && (isNaN(irrigations) || irrigations <= 0)) return;

    // Proporções base da receita (g/L para EC = 2.0)
    // Baseado na planilha fornecida
    const baseEC = 2.0;
    const baseRecipe = {
      calciumNitrate: 0.90,      // Nitrato de Cálcio
      potassiumNitrate: 0.40,    // Nitrato de Potássio
      mkp: 0.19,                 // MKP (Fosfato Monopotássico)
      magnesiumSulfate: 0.64,    // Sulfato de Magnésio
      micronutrients: 0.05       // Micronutrientes
    };

    // Ajustar proporções para o EC desejado
    const ratio = ec / baseEC;
    
    const perLiterAmounts = {
      calciumNitrate: Math.round(baseRecipe.calciumNitrate * ratio * 100) / 100,
      potassiumNitrate: Math.round(baseRecipe.potassiumNitrate * ratio * 100) / 100,
      mkp: Math.round(baseRecipe.mkp * ratio * 100) / 100,
      magnesiumSulfate: Math.round(baseRecipe.magnesiumSulfate * ratio * 100) / 100,
      micronutrients: Math.round(baseRecipe.micronutrients * ratio * 100) / 100,
    };

    if (calculationMode === "per-irrigation") {
      setResult({
        ...perLiterAmounts,
        totalPPM: Math.round(ec * 500)
      });
    } else {
      // Cálculo semanal
      const weeklyWater = water * irrigations;
      const weeklyCalciumNitrate = Math.round(perLiterAmounts.calciumNitrate * weeklyWater * 100) / 100;
      const weeklyPotassiumNitrate = Math.round(perLiterAmounts.potassiumNitrate * weeklyWater * 100) / 100;
      const weeklyMKP = Math.round(perLiterAmounts.mkp * weeklyWater * 100) / 100;
      const weeklyMagnesiumSulfate = Math.round(perLiterAmounts.magnesiumSulfate * weeklyWater * 100) / 100;
      const weeklyMicronutrients = Math.round(perLiterAmounts.micronutrients * weeklyWater * 100) / 100;
      
      // Cálculo de custo semanal
      const weeklyCost = Math.round((
        (weeklyCalciumNitrate / 1000) * prices.calciumNitrate +
        (weeklyPotassiumNitrate / 1000) * prices.potassiumNitrate +
        (weeklyMKP / 1000) * prices.mkp +
        (weeklyMagnesiumSulfate / 1000) * prices.magnesiumSulfate +
        (weeklyMicronutrients / 1000) * prices.micronutrients
      ) * 100) / 100;
      
      setResult({
        ...perLiterAmounts,
        totalPPM: Math.round(ec * 500),
        weeklyCalciumNitrate,
        weeklyPotassiumNitrate,
        weeklyMKP,
        weeklyMagnesiumSulfate,
        weeklyMicronutrients,
        weeklyCost
      });
    }
  };

  return (
    <Card className="bg-card/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-green-500" />
          Calculadora de Fertilização
        </CardTitle>
        <CardDescription>
          Calcule a quantidade de fertilizante necessária para atingir o EC desejado
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
                Usar EC recomendado por fase/semana
              </Label>
            </div>
            
            {usePreset ? (
              <div className="grid grid-cols-2 gap-4">
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
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(week => (
                      <option key={week} value={week}>Semana {week}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}
            
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

          {calculationMode === "per-week" && (
            <div className="space-y-2">
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

        {result && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 space-y-4">
            <h4 className="font-semibold text-foreground mb-3">🧪 Receita de Fertilização (g/L):</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-green-200 pb-2">
                <span className="text-sm font-medium text-foreground">Nitrato de Cálcio:</span>
                <span className="text-xl font-bold text-green-600">{result.calciumNitrate} g/L</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-green-200 pb-2">
                <span className="text-sm font-medium text-foreground">Nitrato de Potássio:</span>
                <span className="text-xl font-bold text-green-600">{result.potassiumNitrate} g/L</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-green-200 pb-2">
                <span className="text-sm font-medium text-foreground">MKP (Fosfato Monopotássico):</span>
                <span className="text-xl font-bold text-green-600">{result.mkp} g/L</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-green-200 pb-2">
                <span className="text-sm font-medium text-foreground">Sulfato de Magnésio:</span>
                <span className="text-xl font-bold text-green-600">{result.magnesiumSulfate} g/L</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-green-200 pb-2">
                <span className="text-sm font-medium text-foreground">Micronutrientes:</span>
                <span className="text-xl font-bold text-green-600">{result.micronutrients} g/L</span>
              </div>
            </div>

            {calculationMode === "per-week" && result.weeklyCalciumNitrate && (
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mt-4">
                <h5 className="font-semibold text-foreground mb-3">📊 Total Semanal (para o tank):</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Nitrato de Cálcio:</span>
                    <span className="font-bold text-blue-700">{result.weeklyCalciumNitrate} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nitrato de Potássio:</span>
                    <span className="font-bold text-blue-700">{result.weeklyPotassiumNitrate} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MKP:</span>
                    <span className="font-bold text-blue-700">{result.weeklyMKP} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sulfato de Magnésio:</span>
                    <span className="font-bold text-blue-700">{result.weeklyMagnesiumSulfate} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Micronutrientes:</span>
                    <span className="font-bold text-blue-700">{result.weeklyMicronutrients} g</span>
                  </div>
                  <div className="flex justify-between pt-2 mt-2 border-t border-blue-300">
                    <span className="font-semibold">Custo Semanal Estimado:</span>
                    <span className="font-bold text-xl text-blue-900">R$ {result.weeklyCost?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-green-50 border border-green-300 rounded-lg p-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">EC Resultante:</span>
                <span className="text-2xl font-bold text-green-700">{targetEC} mS/cm</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">PPM Aproximado:</span>
                <span className="text-sm font-semibold text-green-700">{result.totalPPM} ppm</span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              💡 <strong>Dica:</strong> Dissolva cada reagente separadamente e misture na ordem: Cálcio → Potássio → MKP → Magnésio → Micronutrientes
            </p>
            <Button 
              onClick={() => exportFertilizationRecipe(waterVolume, targetEC, targetEC, result)} 
              variant="outline" 
              className="w-full mt-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Receita
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Calculadora Lux ↔ PPFD (Bidirecional)
function LuxPPFDCalculator() {
  const [conversionMode, setConversionMode] = useState<"lux-to-ppfd" | "ppfd-to-lux">("lux-to-ppfd");
  const [lux, setLux] = useState<string>("");
  const [ppfd, setPpfd] = useState<string>("");
  const [lightType, setLightType] = useState<string>("led-white");
  const [result, setResult] = useState<number | null>(null);

  // Cálculo automático em tempo real
  const calculate = () => {
    // Fatores de conversão baseados no tipo de luz
    let conversionFactor = 0.015; // LED branco (padrão)

    if (lightType === "led-full-spectrum") {
      conversionFactor = 0.017;
    } else if (lightType === "hps") {
      conversionFactor = 0.012;
    } else if (lightType === "mh") {
      conversionFactor = 0.014;
    } else if (lightType === "sunlight") {
      conversionFactor = 0.0185;
    }

    if (conversionMode === "lux-to-ppfd") {
      const luxValue = parseFloat(lux);
      if (isNaN(luxValue) || luxValue <= 0) {
        setResult(null);
        return;
      }
      const ppfdResult = luxValue * conversionFactor;
      setResult(Math.round(ppfdResult));
    } else {
      const ppfdValue = parseFloat(ppfd);
      if (isNaN(ppfdValue) || ppfdValue <= 0) {
        setResult(null);
        return;
      }
      const luxResult = ppfdValue / conversionFactor;
      setResult(Math.round(luxResult));
    }
  };

  // Recalcular automaticamente
  useEffect(() => {
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lux, ppfd, lightType, conversionMode]);

  return (
    <Card className="bg-card/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="w-8 h-8 text-yellow-500" />
          Calculadora Lux ↔ PPFD
        </CardTitle>
        <CardDescription>
          Converta entre Lux (luxímetro) e PPFD (µmol/m²/s) baseado no tipo de luz
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seletor de modo de conversão */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <button
            onClick={() => {
              setConversionMode("lux-to-ppfd");
              setPpfd("");
              setResult(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              conversionMode === "lux-to-ppfd"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Lux → PPFD
          </button>
          <button
            onClick={() => {
              setConversionMode("ppfd-to-lux");
              setLux("");
              setResult(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              conversionMode === "ppfd-to-lux"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            PPFD → Lux
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conversionMode === "lux-to-ppfd" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="lux">Leitura em Lux</Label>
                <Input
                  id="lux"
                  type="number"
                  placeholder="Ex: 50000"
                  value={lux}
                  onChange={(e) => setLux(e.target.value)}
                />
              </div>
              
              {/* Visual Slider para Lux */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="lux-slider">Intensidade de Luz (Visual)</Label>
                <div className="space-y-3">
                  <input
                    id="lux-slider"
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={lux || 0}
                    onChange={(e) => setLux(e.target.value)}
                    className="w-full h-6 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-300 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-300 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        #3b82f6 0%, #3b82f6 16.67%,
                        #10b981 16.67%, #10b981 50%,
                        #eab308 50%, #eab308 75%,
                        #ef4444 75%, #ef4444 100%
                      )`
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex flex-col items-center">
                      <span className="font-medium text-blue-500">🌱</span>
                      <span>7k-14k</span>
                      <span>Clonagem</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="font-medium text-green-500">🌿</span>
                      <span>28k-42k</span>
                      <span>Vegetativa</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="font-medium text-yellow-500">🌸</span>
                      <span>42k-63k</span>
                      <span>Floração</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="font-medium text-red-500">⚡</span>
                      <span>70k-84k</span>
                      <span>Máximo</span>
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="ppfd">Leitura em PPFD (µmol/m²/s)</Label>
                <Input
                  id="ppfd"
                  type="number"
                  placeholder="Ex: 750"
                  value={ppfd}
                  onChange={(e) => setPpfd(e.target.value)}
                />
              </div>
              
              {/* Visual Slider */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ppfd-slider">Intensidade de Luz (Visual)</Label>
                <div className="space-y-3">
                  <input
                    id="ppfd-slider"
                    type="range"
                    min="0"
                    max="1200"
                    step="10"
                    value={ppfd || 0}
                    onChange={(e) => setPpfd(e.target.value)}
                    className="w-full h-6 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-300 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-300 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        #3b82f6 0%, #3b82f6 16.67%,
                        #10b981 16.67%, #10b981 50%,
                        #eab308 50%, #eab308 75%,
                        #ef4444 75%, #ef4444 100%
                      )`
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex flex-col items-center">
                      <span className="font-medium text-blue-500">🌱</span>
                      <span>100-200</span>
                      <span>Clonagem</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="font-medium text-green-500">🌿</span>
                      <span>400-600</span>
                      <span>Vegetativa</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="font-medium text-yellow-500">🌸</span>
                      <span>600-900</span>
                      <span>Floração</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="font-medium text-red-500">⚡</span>
                      <span>1000-1200</span>
                      <span>Máximo</span>
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="lightType">Tipo de Luz</Label>
            <select
              id="lightType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={lightType}
              onChange={(e) => setLightType(e.target.value)}
            >
              <option value="led-white">LED Branco</option>
              <option value="led-full-spectrum">LED Full Spectrum</option>
              <option value="hps">HPS (Alta Pressão de Sódio)</option>
              <option value="mh">MH (Metal Halide)</option>
              <option value="sunlight">Luz Solar</option>
            </select>
          </div>
        </div>



        {result !== null && (
          <div className="bg-yellow-500/100/10 border border-yellow-500/20 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {conversionMode === "lux-to-ppfd" ? "PPFD estimado:" : "Lux estimado:"}
              </span>
              <span className="text-3xl font-bold text-yellow-600">
                {result} {conversionMode === "lux-to-ppfd" ? "µmol/m²/s" : "lux"}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Referências de PPFD por fase:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted p-2 rounded">
                  <span className="font-medium">Clonagem:</span> 100-200
                </div>
                <div className="bg-muted p-2 rounded">
                  <span className="font-medium">Vegetativa:</span> 400-600
                </div>
                <div className="bg-muted p-2 rounded">
                  <span className="font-medium">Floração:</span> 600-900
                </div>
                <div className="bg-muted p-2 rounded">
                  <span className="font-medium">Máximo:</span> 1000-1200
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              💡 <strong>Dica:</strong> Esta é uma estimativa. Para medições precisas, use um medidor PPFD (quantum sensor).
            </p>
            <Button 
              onClick={() => exportLuxPPFDRecipe(lux, lightType, result)} 
              variant="outline" 
              className="w-full mt-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Receita
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


// Calculadora PPM ↔ EC
function PPMECConverter() {
  const [conversionType, setConversionType] = useState<"ppm-to-ec" | "ec-to-ppm">("ppm-to-ec");
  const [scale, setScale] = useState<"500" | "700">("500");
  const [inputValue, setInputValue] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);

  // Cálculo automático em tempo real
  useEffect(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value) || value <= 0) {
      setResult(null);
      return;
    }

    // Escalas de conversão:
    // 500 scale: 1 EC = 500 PPM (Europa, padrão)
    // 700 scale: 1 EC = 700 PPM (EUA, Hanna)
    const scaleFactor = scale === "500" ? 500 : 700;

    if (conversionType === "ppm-to-ec") {
      // PPM → EC: dividir por escala
      setResult(Math.round((value / scaleFactor) * 100) / 100);
    } else {
      // EC → PPM: multiplicar por escala
      setResult(Math.round(value * scaleFactor));
    }
  }, [inputValue, conversionType, scale]);

  return (
    <Card className="bg-card/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-500" />
          Conversão PPM ↔ EC
        </CardTitle>
        <CardDescription>
          Converta entre PPM (partes por milhão) e EC (condutividade elétrica)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de Conversão */}
        <div className="space-y-2">
          <Label>Tipo de Conversão</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={conversionType === "ppm-to-ec" ? "default" : "outline"}
              onClick={() => setConversionType("ppm-to-ec")}
              className="w-full"
            >
              PPM → EC
            </Button>
            <Button
              variant={conversionType === "ec-to-ppm" ? "default" : "outline"}
              onClick={() => setConversionType("ec-to-ppm")}
              className="w-full"
            >
              EC → PPM
            </Button>
          </div>
        </div>

        {/* Escala */}
        <div className="space-y-2">
          <Label>Escala de Conversão</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={scale === "500" ? "default" : "outline"}
              onClick={() => setScale("500")}
              className="w-full"
            >
              500 (Europa)
            </Button>
            <Button
              variant={scale === "700" ? "default" : "outline"}
              onClick={() => setScale("700")}
              className="w-full"
            >
              700 (EUA/Hanna)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Escala 500: 1 EC = 500 PPM | Escala 700: 1 EC = 700 PPM
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Label htmlFor="conversionInput">
            {conversionType === "ppm-to-ec" ? "Valor em PPM" : "Valor em EC (mS/cm)"}
          </Label>
          <Input
            id="conversionInput"
            type="number"
            step={conversionType === "ppm-to-ec" ? "1" : "0.1"}
            placeholder={conversionType === "ppm-to-ec" ? "Ex: 1000" : "Ex: 2.0"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        {/* Resultado */}
        {result !== null && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
            <h4 className="font-semibold text-foreground mb-3">Resultado:</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {conversionType === "ppm-to-ec" ? "EC (mS/cm):" : "PPM:"}
              </span>
              <span className="text-3xl font-bold text-purple-600">
                {result} {conversionType === "ppm-to-ec" ? "mS/cm" : "PPM"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              📊 <strong>Referência:</strong> Vega: 1.0-1.8 EC (500-900 PPM) | Flora: 1.8-2.4 EC (900-1200 PPM)
            </p>
          </div>
        )}

        {/* Tabela de Referência */}
        <div className="bg-muted border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-foreground mb-3">📋 Tabela de Referência (Escala {scale}):</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground">Clonagem:</span>
              <span className="font-medium">0.4-0.8 EC ({scale === "500" ? "200-400" : "280-560"} PPM)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">Vegetativo:</span>
              <span className="font-medium">1.0-1.8 EC ({scale === "500" ? "500-900" : "700-1260"} PPM)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">Floração:</span>
              <span className="font-medium">1.8-2.4 EC ({scale === "500" ? "900-1200" : "1260-1680"} PPM)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">Flush Final:</span>
              <span className="font-medium">0.0-0.4 EC ({scale === "500" ? "0-200" : "0-280"} PPM)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


// Calculadora de Ajuste de pH
function PHAdjustCalculator() {
  const [waterVolume, setWaterVolume] = useState<string>("");
  const [currentPH, setCurrentPH] = useState<string>("");
  const [targetPH, setTargetPH] = useState<string>("");
  const [adjustmentType, setAdjustmentType] = useState<"down" | "up">("down");
  const [result, setResult] = useState<{ amount: number; product: string } | null>(null);

  const calculatePHAdjustment = () => {
    const volume = parseFloat(waterVolume);
    const current = parseFloat(currentPH);
    const target = parseFloat(targetPH);

    if (isNaN(volume) || isNaN(current) || isNaN(target) || volume <= 0) return;

    const phDifference = Math.abs(current - target);
    
    // Determinar se precisa aumentar ou diminuir pH
    const needsDecrease = current > target;
    setAdjustmentType(needsDecrease ? "down" : "up");

    // Fórmulas aproximadas (variam conforme produto e dureza da água):
    // pH Down (ácido fosfórico 85%): ~1ml por 10L reduz 0.5 pH
    // pH Up (hidróxido de potássio): ~1ml por 10L aumenta 0.5 pH
    
    let mlPerLiter: number;
    let productName: string;

    if (needsDecrease) {
      // pH Down - ácido fosfórico
      mlPerLiter = 0.2; // 0.2ml por litro por unidade de pH
      productName = "pH Down (Ácido Fosfórico 85%)";
    } else {
      // pH Up - hidróxido de potássio
      mlPerLiter = 0.25; // 0.25ml por litro por unidade de pH (menos eficiente)
      productName = "pH Up (Hidróxido de Potássio)";
    }

    const totalML = phDifference * mlPerLiter * volume;

    setResult({
      amount: Math.round(totalML * 10) / 10,
      product: productName,
    });
  };

  return (
    <Card className="bg-card/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          Calculadora de Ajuste de pH
        </CardTitle>
        <CardDescription>
          Calcule quanto ácido ou base adicionar para atingir o pH ideal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="waterVolumePH">Volume de Água (litros)</Label>
            <Input
              id="waterVolumePH"
              type="number"
              placeholder="Ex: 10"
              value={waterVolume}
              onChange={(e) => setWaterVolume(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentPH">pH Atual</Label>
            <Input
              id="currentPH"
              type="number"
              step="0.1"
              placeholder="Ex: 7.5"
              value={currentPH}
              onChange={(e) => setCurrentPH(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetPH">pH Alvo</Label>
            <Input
              id="targetPH"
              type="number"
              step="0.1"
              placeholder="Ex: 6.0"
              value={targetPH}
              onChange={(e) => setTargetPH(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={calculatePHAdjustment} className="w-full">
          <Calculator className="w-4 h-4 mr-2" />
          Calcular Ajuste
        </Button>

        {result && (
          <div className="bg-blue-500/100/10 border border-blue-500/20 rounded-lg p-6 space-y-3">
            <h4 className="font-semibold text-foreground mb-3">Receita de Ajuste:</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Produto:</span>
              <span className="text-lg font-bold text-blue-600">{result.product}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Quantidade:</span>
              <span className="text-3xl font-bold text-blue-600">{result.amount} ml</span>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              ⚠️ <strong>Importante:</strong> Adicione aos poucos, misture bem e meça novamente. Nunca adicione tudo de uma vez!
            </p>
          </div>
        )}

        {/* Tabela de Referência */}
        <div className="bg-muted border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-foreground mb-3">📋 pH Ideal por Substrato:</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground">Solo/Terra:</span>
              <span className="font-medium">6.0 - 7.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">Fibra de Coco:</span>
              <span className="font-medium">5.5 - 6.5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">Hidroponia:</span>
              <span className="font-medium">5.5 - 6.0</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            💡 <strong>Dica:</strong> pH fora da faixa ideal bloqueia absorção de nutrientes, causando deficiências mesmo com fertilização adequada.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

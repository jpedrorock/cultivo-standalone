import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Sprout, Calculator, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FertilizationResult {
  calciumNitrate: number;
  potassiumNitrate: number;
  mkp: number;
  magnesiumSulfate: number;
  micronutrients: number;
  totalPPM: number;
}

export default function FertilizationCalculator() {
  const [waterVolume, setWaterVolume] = useState<string>("");
  const [targetEC, setTargetEC] = useState<string>("");
  const [result, setResult] = useState<FertilizationResult | null>(null);

  const calculateFertilization = () => {
    const water = parseFloat(waterVolume);
    const ec = parseFloat(targetEC);

    if (isNaN(water) || isNaN(ec) || water <= 0 || ec <= 0) return;

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
    
    setResult({
      calciumNitrate: Math.round(baseRecipe.calciumNitrate * ratio * 100) / 100,
      potassiumNitrate: Math.round(baseRecipe.potassiumNitrate * ratio * 100) / 100,
      mkp: Math.round(baseRecipe.mkp * ratio * 100) / 100,
      magnesiumSulfate: Math.round(baseRecipe.magnesiumSulfate * ratio * 100) / 100,
      micronutrients: Math.round(baseRecipe.micronutrients * ratio * 100) / 100,
      totalPPM: Math.round(ec * 500) // Conversão aproximada EC → PPM (escala 500)
    });
  };

  const exportRecipe = () => {
    if (!result) return;

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

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receita-fertilizacao-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <Link href="/calculators">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <Sprout className="w-8 h-8 text-green-500" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Calculadora de Fertilização
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Calcule a dosagem de reagentes NPK por EC
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-500" />
              Calculadora de Fertilização
            </CardTitle>
            <CardDescription>
              Calcule a quantidade de cada reagente sólido necessária para atingir o EC desejado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="waterVolume">Volume de Preparo (litros)</Label>
                <Input
                  id="waterVolume"
                  type="number"
                  placeholder="Ex: 10"
                  value={waterVolume}
                  onChange={(e) => setWaterVolume(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Quantidade total de solução a preparar</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetEC">EC Desejado (mS/cm)</Label>
                <Input
                  id="targetEC"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 2.0"
                  value={targetEC}
                  onChange={(e) => setTargetEC(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Condutividade elétrica alvo da solução</p>
              </div>
            </div>

            <Button onClick={calculateFertilization} className="w-full">
              <Calculator className="w-4 h-4 mr-2" />
              Calcular Receita
            </Button>

            {result && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 space-y-4">
                <h4 className="font-semibold text-foreground mb-3">🧪 Receita de Fertilização para {waterVolume}L:</h4>
                
                {/* Quantidades Totais - DESTAQUE */}
                <div className="space-y-3">
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Nitrato de Cálcio:</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-orange-600">{(result.calciumNitrate * parseFloat(waterVolume)).toFixed(2)} g</span>
                        <span className="text-xs text-muted-foreground block">({result.calciumNitrate} g/L)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Nitrato de Potássio:</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-purple-600">{(result.potassiumNitrate * parseFloat(waterVolume)).toFixed(2)} g</span>
                        <span className="text-xs text-muted-foreground block">({result.potassiumNitrate} g/L)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">MKP (Fosfato Monopotássico):</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">{(result.mkp * parseFloat(waterVolume)).toFixed(2)} g</span>
                        <span className="text-xs text-muted-foreground block">({result.mkp} g/L)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Sulfato de Magnésio:</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-green-600">{(result.magnesiumSulfate * parseFloat(waterVolume)).toFixed(2)} g</span>
                        <span className="text-xs text-muted-foreground block">({result.magnesiumSulfate} g/L)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Micronutrientes:</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-yellow-600">{(result.micronutrients * parseFloat(waterVolume)).toFixed(2)} g</span>
                        <span className="text-xs text-muted-foreground block">({result.micronutrients} g/L)</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* EC e PPM */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">EC Resultante:</span>
                    <span className="text-2xl font-bold text-blue-700">{targetEC} mS/cm</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">PPM Aproximado:</span>
                    <span className="text-sm font-semibold text-blue-700">{result.totalPPM} ppm</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  💡 <strong>Dica:</strong> Dissolva cada reagente separadamente e misture na ordem: Cálcio → Potássio → MKP → Magnésio → Micronutrientes
                </p>
                <Button 
                  onClick={exportRecipe} 
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
      </main>
    </div>
  );
}

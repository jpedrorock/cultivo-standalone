import { useState, useEffect } from "react";
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

function exportFertilizationRecipe(waterVolume: string, npkConcentration: string, targetEC: string, result: { fertilizer: number; water: number }) {
  const content = `
===========================================
   RECEITA DE FERTILIZAÇÃO - APP CULTIVO
===========================================

DATA: ${new Date().toLocaleDateString('pt-BR')}

PARÂMETROS:
- Volume de água: ${waterVolume}L
- Concentração NPK: ${npkConcentration} g/L
- EC alvo: ${targetEC} mS/cm

RECEITA:
- Fertilizante: ${result.fertilizer} ml
- Água: ${result.water} L

DICA:
Sempre adicione o fertilizante à água (nunca o contrário)
e misture bem antes de aplicar.

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

export default function Calculators() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <Calculator className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calculadoras</h1>
              <p className="text-gray-600 mt-1">Ferramentas práticas para cultivo</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs defaultValue="irrigation" className="w-full">
          {/* Mobile: Dropdown Select */}
          <div className="md:hidden mb-6">
            <select 
              className="w-full p-3 border-2 border-gray-200 rounded-lg bg-white text-base font-medium"
              onChange={(e) => {
                const tabs = document.querySelectorAll('[role="tab"]');
                const targetTab = Array.from(tabs).find(tab => tab.getAttribute('value') === e.target.value) as HTMLElement;
                if (targetTab) targetTab.click();
              }}
              defaultValue="irrigation"
            >
              <option value="irrigation">💧 Calculadora de Rega</option>
              <option value="fertilization">🌱 Fertilização (NPK + Micronutrientes)</option>
              <option value="lux-ppfd">☀️ Conversão Lux → PPFD</option>
              <option value="ppm-ec">🧮 Conversão PPM ↔ EC</option>
              <option value="ph-adjust">💧 Ajuste de pH</option>
            </select>
          </div>

          {/* Desktop: Tabs */}
          <TabsList className="hidden md:grid md:grid-cols-5 mb-6">
            <TabsTrigger value="irrigation" className="flex-col gap-1 h-20 md:flex-row md:h-auto md:gap-2">
              <Droplets className="w-5 h-5 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm">Rega</span>
            </TabsTrigger>
            <TabsTrigger value="fertilization" className="flex-col gap-1 h-20 md:flex-row md:h-auto md:gap-2">
              <Sprout className="w-5 h-5 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm">Fertilização</span>
            </TabsTrigger>
            <TabsTrigger value="lux-ppfd" className="flex-col gap-1 h-20 md:flex-row md:h-auto md:gap-2">
              <Sun className="w-5 h-5 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm">Lux → PPFD</span>
            </TabsTrigger>
            <TabsTrigger value="ppm-ec" className="flex-col gap-1 h-20 md:flex-row md:h-auto md:gap-2">
              <Calculator className="w-5 h-5 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm">PPM ↔ EC</span>
            </TabsTrigger>
            <TabsTrigger value="ph-adjust" className="flex-col gap-1 h-20 md:flex-row md:h-auto md:gap-2">
              <Droplets className="w-5 h-5 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm">Ajuste pH</span>
            </TabsTrigger>
          </TabsList>

          {/* Calculadora de Rega */}
          <TabsContent value="irrigation">
            <IrrigationCalculator />
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

// Calculadora de Rega (Volume por Planta)
function IrrigationCalculator() {
  const [potVolume, setPotVolume] = useState<string>("");
  const [substrate, setSubstrate] = useState<string>("coco");
  const [result, setResult] = useState<{ volume: number; frequency: string } | null>(null);

  const calculateIrrigation = () => {
    const volume = parseFloat(potVolume);
    if (isNaN(volume) || volume <= 0) return;

    // Fórmulas baseadas em práticas comuns de cultivo
    let waterPercentage = 0.25; // 25% do volume do vaso (padrão para solo)
    let frequency = "a cada 2-3 dias";

    if (substrate === "coco") {
      waterPercentage = 0.3; // 30% para coco (retém menos água)
      frequency = "diariamente";
    } else if (substrate === "hidro") {
      waterPercentage = 0.15; // 15% para hidroponia (sistema recirculante)
      frequency = "múltiplas vezes ao dia";
    }

    const waterVolume = volume * waterPercentage;

    setResult({
      volume: Math.round(waterVolume * 100) / 100,
      frequency,
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-green-100">
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
        </div>

        <Button onClick={calculateIrrigation} className="w-full">
          <Calculator className="w-4 h-4 mr-2" />
          Calcular Volume de Rega
        </Button>

        {result && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Volume por rega:</span>
              <span className="text-2xl font-bold text-blue-600">{result.volume}L</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Frequência recomendada:</span>
              <span className="text-lg font-semibold text-blue-600">{result.frequency}</span>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              💡 <strong>Dica:</strong> Regue até ver 10-20% de drenagem no fundo do vaso para evitar acúmulo de sais.
            </p>
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

// Calculadora de Fertilização (Diluição NPK)
function FertilizationCalculator() {
  // NPK Principal
  const [waterVolume, setWaterVolume] = useState<string>("");
  const [npkConcentration, setNpkConcentration] = useState<string>("");
  const [targetEC, setTargetEC] = useState<string>("");
  
  // Micronutrientes
  const [calciumPPM, setCalciumPPM] = useState<string>("");
  const [magnesiumPPM, setMagnesiumPPM] = useState<string>("");
  const [ironPPM, setIronPPM] = useState<string>("");
  
  const [result, setResult] = useState<{ 
    fertilizer: number; 
    water: number;
    calcium?: number;
    magnesium?: number;
    iron?: number;
  } | null>(null);

  const calculateFertilization = () => {
    const water = parseFloat(waterVolume);
    const concentration = parseFloat(npkConcentration);
    const ec = parseFloat(targetEC);

    if (isNaN(water) || isNaN(concentration) || isNaN(ec) || water <= 0 || concentration <= 0 || ec <= 0) return;

    // Fórmula corrigida: cada 1g/L de fertilizante aumenta EC em ~1.0-1.5 mS/cm (média 1.2)
    const ecConversionFactor = 1.2; // mS/cm por g/L
    const fertilizerGrams = (ec * water) / ecConversionFactor;
    const fertilizerML = (fertilizerGrams / concentration) * 1000;

    // Calcular micronutrientes (se fornecidos)
    let calciumML: number | undefined;
    let magnesiumML: number | undefined;
    let ironML: number | undefined;

    // Cálcio (Ca) - Concentração típica: 150-200 ppm (mg/L)
    // Fórmula: (PPM desejado × volume) / 1000 = gramas de Ca
    // Assumindo produto com 15% Ca (150g/L), converter para ml
    if (calciumPPM && parseFloat(calciumPPM) > 0) {
      const ca = parseFloat(calciumPPM);
      const caGrams = (ca * water) / 1000;
      calciumML = (caGrams / 150) * 1000; // Produto com 15% Ca (150g/L)
    }

    // Magnésio (Mg) - Concentração típica: 50-75 ppm
    // Assumindo produto com 10% Mg (100g/L)
    if (magnesiumPPM && parseFloat(magnesiumPPM) > 0) {
      const mg = parseFloat(magnesiumPPM);
      const mgGrams = (mg * water) / 1000;
      magnesiumML = (mgGrams / 100) * 1000; // Produto com 10% Mg (100g/L)
    }

    // Ferro (Fe) - Concentração típica: 2-5 ppm
    // Assumindo produto com 5% Fe (50g/L)
    if (ironPPM && parseFloat(ironPPM) > 0) {
      const fe = parseFloat(ironPPM);
      const feGrams = (fe * water) / 1000;
      ironML = (feGrams / 50) * 1000; // Produto com 5% Fe (50g/L)
    }

    setResult({
      fertilizer: Math.round(fertilizerML * 10) / 10,
      water: water,
      calcium: calciumML ? Math.round(calciumML * 10) / 10 : undefined,
      magnesium: magnesiumML ? Math.round(magnesiumML * 10) / 10 : undefined,
      iron: ironML ? Math.round(ironML * 10) / 10 : undefined,
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-green-100">
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="waterVolume">Volume de Água (litros)</Label>
            <Input
              id="waterVolume"
              type="number"
              placeholder="Ex: 10"
              value={waterVolume}
              onChange={(e) => setWaterVolume(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="npkConcentration">Concentração NPK (g/L)</Label>
            <Input
              id="npkConcentration"
              type="number"
              step="0.1"
              placeholder="Ex: 2.0"
              value={npkConcentration}
              onChange={(e) => setNpkConcentration(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetEC">EC Alvo (mS/cm)</Label>
            <Input
              id="targetEC"
              type="number"
              step="0.1"
              placeholder="Ex: 1.8"
              value={targetEC}
              onChange={(e) => setTargetEC(e.target.value)}
            />
          </div>
        </div>

        {/* Micronutrientes (Opcional) */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">🧪 Micronutrientes (Opcional)</h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="calciumPPM">Cálcio (Ca) - PPM</Label>
              <Input
                id="calciumPPM"
                type="number"
                placeholder="Ex: 180 (150-200)"
                value={calciumPPM}
                onChange={(e) => setCalciumPPM(e.target.value)}
              />
              <p className="text-xs text-gray-500">Ideal: 150-200 ppm</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="magnesiumPPM">Magnésio (Mg) - PPM</Label>
              <Input
                id="magnesiumPPM"
                type="number"
                placeholder="Ex: 60 (50-75)"
                value={magnesiumPPM}
                onChange={(e) => setMagnesiumPPM(e.target.value)}
              />
              <p className="text-xs text-gray-500">Ideal: 50-75 ppm</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ironPPM">Ferro (Fe) - PPM</Label>
              <Input
                id="ironPPM"
                type="number"
                placeholder="Ex: 3 (2-5)"
                value={ironPPM}
                onChange={(e) => setIronPPM(e.target.value)}
              />
              <p className="text-xs text-gray-500">Ideal: 2-5 ppm</p>
            </div>
          </div>
        </div>

        <Button onClick={calculateFertilization} className="w-full">
          <Calculator className="w-4 h-4 mr-2" />
          Calcular Diluição
        </Button>

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
            <h4 className="font-semibold text-gray-900 mb-3">Receita de Fertilização:</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Fertilizante:</span>
              <span className="text-2xl font-bold text-green-600">{result.fertilizer} ml</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Água:</span>
              <span className="text-2xl font-bold text-green-600">{result.water} L</span>
            </div>
            
            {/* Micronutrientes */}
            {(result.calcium || result.magnesium || result.iron) && (
              <div className="border-t border-green-300 pt-3 mt-3">
                <h5 className="text-sm font-semibold text-gray-800 mb-2">🧪 Micronutrientes:</h5>
                {result.calcium && (
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">Cálcio (Ca):</span>
                    <span className="text-lg font-bold text-green-600">{result.calcium} ml</span>
                  </div>
                )}
                {result.magnesium && (
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">Magnésio (Mg):</span>
                    <span className="text-lg font-bold text-green-600">{result.magnesium} ml</span>
                  </div>
                )}
                {result.iron && (
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">Ferro (Fe):</span>
                    <span className="text-lg font-bold text-green-600">{result.iron} ml</span>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-xs text-gray-600 mt-4">
              💡 <strong>Dica:</strong> Sempre adicione o fertilizante à água (nunca o contrário) e misture bem antes de aplicar.
            </p>
            <Button 
              onClick={() => exportFertilizationRecipe(waterVolume, npkConcentration, targetEC, result)} 
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

// Calculadora Lux → PPFD
function LuxPPFDCalculator() {
  const [lux, setLux] = useState<string>("");
  const [lightType, setLightType] = useState<string>("led-white");
  const [result, setResult] = useState<number | null>(null);

  // Cálculo automático em tempo real
  const calculatePPFD = () => {
    const luxValue = parseFloat(lux);
    if (isNaN(luxValue) || luxValue <= 0) {
      setResult(null);
      return;
    }

    // Fatores de conversão baseados no tipo de luz
    // Fonte: estudos de horticultura e especificações de fabricantes
    let conversionFactor = 0.015; // LED branco (padrão)

    if (lightType === "led-full-spectrum") {
      conversionFactor = 0.017; // LED full spectrum
    } else if (lightType === "hps") {
      conversionFactor = 0.012; // HPS (alta pressão de sódio)
    } else if (lightType === "mh") {
      conversionFactor = 0.014; // MH (metal halide)
    } else if (lightType === "sunlight") {
      conversionFactor = 0.0185; // Luz solar
    }

    const ppfd = luxValue * conversionFactor;
    setResult(Math.round(ppfd));
  };

  // Recalcular automaticamente quando lux ou lightType mudar
  useEffect(() => {
    calculatePPFD();
  }, [lux, lightType]);

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-green-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-yellow-500" />
          Calculadora Lux → PPFD
        </CardTitle>
        <CardDescription>
          Converta medições de Lux (luxímetro) para PPFD (µmol/m²/s) baseado no tipo de luz
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">PPFD estimado:</span>
              <span className="text-3xl font-bold text-yellow-600">{result} µmol/m²/s</span>
            </div>

            <div className="mt-4 space-y-2 text-xs text-gray-600">
              <p className="font-semibold text-gray-900">Referências de PPFD por fase:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded">
                  <span className="font-medium">Clonagem:</span> 100-200
                </div>
                <div className="bg-white p-2 rounded">
                  <span className="font-medium">Vegetativa:</span> 400-600
                </div>
                <div className="bg-white p-2 rounded">
                  <span className="font-medium">Floração:</span> 600-900
                </div>
                <div className="bg-white p-2 rounded">
                  <span className="font-medium">Máximo:</span> 1000-1200
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-4">
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
    <Card className="bg-white/90 backdrop-blur-sm border-green-100">
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
          <p className="text-xs text-gray-600">
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
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Resultado:</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {conversionType === "ppm-to-ec" ? "EC (mS/cm):" : "PPM:"}
              </span>
              <span className="text-3xl font-bold text-purple-600">
                {result} {conversionType === "ppm-to-ec" ? "mS/cm" : "PPM"}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              📊 <strong>Referência:</strong> Vega: 1.0-1.8 EC (500-900 PPM) | Flora: 1.8-2.4 EC (900-1200 PPM)
            </p>
          </div>
        )}

        {/* Tabela de Referência */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-gray-800 mb-3">📋 Tabela de Referência (Escala {scale}):</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Clonagem:</span>
              <span className="font-medium">0.4-0.8 EC ({scale === "500" ? "200-400" : "280-560"} PPM)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Vegetativo:</span>
              <span className="font-medium">1.0-1.8 EC ({scale === "500" ? "500-900" : "700-1260"} PPM)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Floração:</span>
              <span className="font-medium">1.8-2.4 EC ({scale === "500" ? "900-1200" : "1260-1680"} PPM)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Flush Final:</span>
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
    <Card className="bg-white/90 backdrop-blur-sm border-green-100">
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
            <h4 className="font-semibold text-gray-900 mb-3">Receita de Ajuste:</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Produto:</span>
              <span className="text-lg font-bold text-blue-600">{result.product}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Quantidade:</span>
              <span className="text-3xl font-bold text-blue-600">{result.amount} ml</span>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              ⚠️ <strong>Importante:</strong> Adicione aos poucos, misture bem e meça novamente. Nunca adicione tudo de uma vez!
            </p>
          </div>
        )}

        {/* Tabela de Referência */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-gray-800 mb-3">📋 pH Ideal por Substrato:</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Solo/Terra:</span>
              <span className="font-medium">6.0 - 7.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Fibra de Coco:</span>
              <span className="font-medium">5.5 - 6.5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Hidroponia:</span>
              <span className="font-medium">5.5 - 6.0</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            💡 <strong>Dica:</strong> pH fora da faixa ideal bloqueia absorção de nutrientes, causando deficiências mesmo com fertilização adequada.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

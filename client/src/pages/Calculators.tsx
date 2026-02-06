import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Droplets, Sprout, Sun } from "lucide-react";

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
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="irrigation">
              <Droplets className="w-4 h-4 mr-2" />
              Rega
            </TabsTrigger>
            <TabsTrigger value="fertilization">
              <Sprout className="w-4 h-4 mr-2" />
              Fertilização
            </TabsTrigger>
            <TabsTrigger value="lux-ppfd">
              <Sun className="w-4 h-4 mr-2" />
              Lux → PPFD
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Calculadora de Fertilização (Diluição NPK)
function FertilizationCalculator() {
  const [waterVolume, setWaterVolume] = useState<string>("");
  const [npkConcentration, setNpkConcentration] = useState<string>("");
  const [targetEC, setTargetEC] = useState<string>("");
  const [result, setResult] = useState<{ fertilizer: number; water: number } | null>(null);

  const calculateFertilization = () => {
    const water = parseFloat(waterVolume);
    const concentration = parseFloat(npkConcentration);
    const ec = parseFloat(targetEC);

    if (isNaN(water) || isNaN(concentration) || isNaN(ec) || water <= 0 || concentration <= 0 || ec <= 0) return;

    // Fórmula simplificada: EC alvo / concentração do fertilizante * volume de água
    // (Esta é uma aproximação; ajustes podem ser necessários baseados no fertilizante específico)
    const fertilizerAmount = (ec / concentration) * water * 1000; // em ml

    setResult({
      fertilizer: Math.round(fertilizerAmount * 10) / 10,
      water: water,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <p className="text-xs text-gray-600 mt-4">
              💡 <strong>Dica:</strong> Sempre adicione o fertilizante à água (nunca o contrário) e misture bem antes de aplicar.
            </p>
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

  const calculatePPFD = () => {
    const luxValue = parseFloat(lux);
    if (isNaN(luxValue) || luxValue <= 0) return;

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

        <Button onClick={calculatePPFD} className="w-full">
          <Calculator className="w-4 h-4 mr-2" />
          Converter para PPFD
        </Button>

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
          </div>
        )}
      </CardContent>
    </Card>
  );
}

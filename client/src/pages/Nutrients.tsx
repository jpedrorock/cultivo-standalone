import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast as showToast } from "sonner";
import { Beaker, Download } from "lucide-react";

type Phase = "CLONING" | "VEGA" | "FLORA" | "MAINTENANCE" | "DRYING";

// Produtos (sais minerais) pré-definidos por fase/semana com quantidades em g/L
const getProductsByPhaseWeek = (phase: Phase, week: number) => {
  if (phase === "CLONING") {
    return [
      { name: "Nitrato de Cálcio", gPerLiter: 0.3, npk: "15.5-0-0", ca: 19, mg: 0, fe: 0, s: 0 },
      { name: "Nitrato de Potássio", gPerLiter: 0.2, npk: "13-0-38", ca: 0, mg: 0, fe: 0, s: 0 },
      { name: "MKP (Fosfato Monopotássico)", gPerLiter: 0.1, npk: "0-22-28", ca: 0, mg: 0, fe: 0, s: 0 },
      { name: "Sulfato de Magnésio", gPerLiter: 0.2, npk: "0-0-0", ca: 0, mg: 10, fe: 0, s: 13 },
    ];
  }
  
  if (phase === "VEGA") {
    const vegaWeek = Math.min(week, 4);
    const multiplier = 0.7 + (vegaWeek / 4) * 0.3; // 0.7 a 1.0
    
    return [
      { name: "Nitrato de Cálcio", gPerLiter: 0.9 * multiplier, npk: "15.5-0-0", ca: 19, mg: 0, fe: 0, s: 0 },
      { name: "Nitrato de Potássio", gPerLiter: 0.4 * multiplier, npk: "13-0-38", ca: 0, mg: 0, fe: 0, s: 0 },
      { name: "MKP (Fosfato Monopotássico)", gPerLiter: 0.19 * multiplier, npk: "0-22-28", ca: 0, mg: 0, fe: 0, s: 0 },
      { name: "Sulfato de Magnésio", gPerLiter: 0.64 * multiplier, npk: "0-0-0", ca: 0, mg: 10, fe: 0, s: 13 },
      { name: "Micronutrientes", gPerLiter: 0.05 * multiplier, npk: "0-0-0", ca: 0, mg: 0, fe: 6, s: 0 },
    ];
  }
  
  if (phase === "FLORA") {
    const floraWeek = Math.min(week, 8);
    const multiplier = 0.8 + (floraWeek / 8) * 0.4; // 0.8 a 1.2
    
    return [
      { name: "Nitrato de Cálcio", gPerLiter: 0.6 * multiplier, npk: "15.5-0-0", ca: 19, mg: 0, fe: 0, s: 0 },
      { name: "Nitrato de Potássio", gPerLiter: 0.6 * multiplier, npk: "13-0-38", ca: 0, mg: 0, fe: 0, s: 0 },
      { name: "MKP (Fosfato Monopotássico)", gPerLiter: 0.4 * multiplier, npk: "0-22-28", ca: 0, mg: 0, fe: 0, s: 0 },
      { name: "Sulfato de Magnésio", gPerLiter: 0.5 * multiplier, npk: "0-0-0", ca: 0, mg: 10, fe: 0, s: 13 },
      { name: "Micronutrientes", gPerLiter: 0.05 * multiplier, npk: "0-0-0", ca: 0, mg: 0, fe: 6, s: 0 },
    ];
  }
  
  if (phase === "MAINTENANCE") {
    return [
      { name: "Nitrato de Cálcio", gPerLiter: 0.5, npk: "15.5-0-0", ca: 19, mg: 0, fe: 0, s: 0 },
      { name: "Nitrato de Potássio", gPerLiter: 0.3, npk: "13-0-38", ca: 0, mg: 0, fe: 0, s: 0 },
      { name: "MKP (Fosfato Monopotássico)", gPerLiter: 0.15, npk: "0-22-28", ca: 0, mg: 0, fe: 0, s: 0 },
      { name: "Sulfato de Magnésio", gPerLiter: 0.3, npk: "0-0-0", ca: 0, mg: 10, fe: 0, s: 13 },
    ];
  }
  
  // DRYING - apenas flush
  return [];
};

export default function Nutrients() {
  const [phase, setPhase] = useState<Phase>("VEGA");
  const [week, setWeek] = useState(1);
  const [volumeL, setVolumeL] = useState(10);
  
  const products = getProductsByPhaseWeek(phase, week);
  
  // Calcular quantidades totais em gramas
  const calculatedProducts = products.map(p => ({
    ...p,
    totalG: p.gPerLiter * volumeL,
  }));
  
  // Calcular NPK total
  const calculateNPK = () => {
    let n = 0, p = 0, k = 0;
    calculatedProducts.forEach(prod => {
      const [nVal, pVal, kVal] = prod.npk.split("-").map(Number);
      const gPerLiter = prod.gPerLiter;
      
      // Converter % para ppm: (% / 100) * g/L * 1000
      n += (nVal / 100) * gPerLiter * 1000;
      p += (pVal / 100) * gPerLiter * 1000;
      k += (kVal / 100) * gPerLiter * 1000;
    });
    
    return {
      n: Math.round(n),
      p: Math.round(p),
      k: Math.round(k),
    };
  };
  
  // Calcular micronutrientes
  const calculateMicros = () => {
    let ca = 0, mg = 0, fe = 0, s = 0;
    calculatedProducts.forEach(prod => {
      const gPerLiter = prod.gPerLiter;
      
      ca += (prod.ca / 100) * gPerLiter * 1000;
      mg += (prod.mg / 100) * gPerLiter * 1000;
      fe += (prod.fe / 100) * gPerLiter * 1000;
      s += (prod.s / 100) * gPerLiter * 1000;
    });
    
    return {
      ca: Math.round(ca),
      mg: Math.round(mg),
      fe: Math.round(fe),
      s: Math.round(s),
    };
  };
  
  // Calcular EC estimado
  const calculateEC = () => {
    const npk = calculateNPK();
    const micros = calculateMicros();
    const totalPPM = npk.n + npk.p + npk.k + micros.ca + micros.mg;
    const ec = Math.round((totalPPM / 700) * 100) / 100;
    return ec;
  };
  
  const npkTotal = calculateNPK();
  const microsTotal = calculateMicros();
  const ecEstimated = calculateEC();
  const ppmApprox = Math.round(ecEstimated * 640);
  
  // Mutation para salvar receita
  const recordApplication = trpc.nutrients.recordApplication.useMutation({
    onSuccess: () => {
      showToast.success("Receita salva com sucesso!");
    },
    onError: (error) => {
      showToast.error(`Erro ao salvar receita: ${error.message}`);
    },
  });
  
  // Exportar receita para TXT
  const exportRecipe = () => {
    const phaseNames = {
      CLONING: "Clonagem",
      VEGA: "Vegetativa",
      FLORA: "Floração",
      MAINTENANCE: "Manutenção",
      DRYING: "Secagem",
    };
    
    let txt = `Receita de Fertilização - ${phaseNames[phase]} Semana ${week}\n`;
    txt += `Volume Total: ${volumeL}L\n`;
    txt += `EC Estimado: ${ecEstimated} mS/cm (${ppmApprox} ppm)\n\n`;
    txt += `Produtos:\n`;
    calculatedProducts.forEach(p => {
      txt += `- ${p.name}: ${p.totalG.toFixed(2)}g (${p.gPerLiter.toFixed(2)} g/L)\n`;
      txt += `  NPK: ${p.npk}`;
      if (p.ca > 0) txt += ` | Ca: ${p.ca}%`;
      if (p.mg > 0) txt += ` | Mg: ${p.mg}%`;
      if (p.fe > 0) txt += ` | Fe: ${p.fe}%`;
      if (p.s > 0) txt += ` | S: ${p.s}%`;
      txt += `\n`;
    });
    txt += `\nNPK Total:\n`;
    txt += `- Nitrogênio (N): ${npkTotal.n} ppm\n`;
    txt += `- Fósforo (P): ${npkTotal.p} ppm\n`;
    txt += `- Potássio (K): ${npkTotal.k} ppm\n`;
    txt += `\nMicronutrientes:\n`;
    txt += `- Cálcio (Ca): ${microsTotal.ca} ppm\n`;
    txt += `- Magnésio (Mg): ${microsTotal.mg} ppm\n`;
    txt += `- Ferro (Fe): ${microsTotal.fe} ppm\n`;
    txt += `- Enxofre (S): ${microsTotal.s} ppm\n`;
    
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receita_${phase.toLowerCase()}_sem${week}_${volumeL}L.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast.success("Receita exportada!");
  };
  
  // Salvar receita
  const saveRecipe = () => {
    const phaseNames = {
      CLONING: "Clonagem",
      VEGA: "Vegetativa",
      FLORA: "Floração",
      MAINTENANCE: "Manutenção",
      DRYING: "Secagem",
    };
    
    recordApplication.mutate({
      tentId: 1, // ID fixo da estufa padrão
      cycleId: null,
      recipeTemplateId: null,
      recipeName: `${phaseNames[phase]} Semana ${week}`,
      phase: phase,
      weekNumber: week,
      volumeTotalL: volumeL,
      ecTarget: ecEstimated,
      ecActual: null,
      phTarget: 6.0,
      phActual: null,
      products: calculatedProducts.map(p => ({
        name: p.name,
        amountMl: p.totalG, // Usando campo amountMl para gramas temporariamente
        npk: p.npk,
        ca: p.ca,
        mg: p.mg,
        fe: p.fe,
      })),
      notes: `Receita gerada automaticamente para ${phaseNames[phase]} Semana ${week}`,
    });
  };
  
  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Beaker className="w-8 h-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">Calculadora de Fertilização</h1>
          <p className="text-muted-foreground">Calcule automaticamente as quantidades de nutrientes baseado em fase e semana</p>
        </div>
      </div>
      
      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">🧪 Calculadora</TabsTrigger>
          <TabsTrigger value="history">📋 Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator" className="space-y-6">
          {/* Seletor de Fase e Semana */}
          <Card>
            <CardHeader>
              <CardTitle>1. Selecione a Fase e Semana</CardTitle>
              <CardDescription>O sistema calculará automaticamente os produtos e quantidades</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fase</Label>
                <Select value={phase} onValueChange={(v) => setPhase(v as Phase)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLONING">🌱 Clonagem</SelectItem>
                    <SelectItem value="VEGA">🌿 Vegetativa</SelectItem>
                    <SelectItem value="FLORA">🌸 Floração</SelectItem>
                    <SelectItem value="MAINTENANCE">🔧 Manutenção</SelectItem>
                    <SelectItem value="DRYING">💨 Secagem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Semana</Label>
                <Select value={week.toString()} onValueChange={(v) => setWeek(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                      <SelectItem key={w} value={w.toString()}>Semana {w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Campo de Volume */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">2. Quantos litros você vai preparar?</CardTitle>
              <CardDescription>Digite o volume total da solução nutritiva</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={volumeL}
                  onChange={(e) => setVolumeL(Number(e.target.value))}
                  className="text-6xl h-24 text-center font-bold"
                  min={1}
                  max={1000}
                />
                <span className="text-4xl font-bold text-muted-foreground">Litros</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Receita Calculada */}
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧪 Receita de Fertilização para {volumeL}L
              </CardTitle>
              <CardDescription>Quantidades calculadas automaticamente baseadas no volume total</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Produtos */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Produtos</h3>
                {calculatedProducts.length === 0 ? (
                  <p className="text-muted-foreground">Flush (apenas água)</p>
                ) : (
                  <div className="grid gap-3">
                    {calculatedProducts.map((prod, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{prod.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {prod.gPerLiter.toFixed(2)}g/L × {volumeL}L
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            NPK: {prod.npk}
                            {prod.ca > 0 && ` | Ca: ${prod.ca}%`}
                            {prod.mg > 0 && ` | Mg: ${prod.mg}%`}
                            {prod.fe > 0 && ` | Fe: ${prod.fe}%`}
                            {prod.s > 0 && ` | S: ${prod.s}%`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{prod.totalG.toFixed(1)} g</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* NPK Total */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">NPK Total</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Nitrogênio (N):</p>
                      <p className="text-2xl font-bold text-purple-700">{npkTotal.n} ppm</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Fósforo (P):</p>
                      <p className="text-2xl font-bold text-blue-700">{npkTotal.p} ppm</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Potássio (K):</p>
                      <p className="text-2xl font-bold text-green-700">{npkTotal.k} ppm</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Micronutrientes */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Micronutrientes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Cálcio (Ca):</p>
                      <p className="text-xl font-bold text-orange-700">{microsTotal.ca} ppm</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Magnésio (Mg):</p>
                      <p className="text-xl font-bold text-emerald-700">{microsTotal.mg} ppm</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Ferro (Fe):</p>
                      <p className="text-xl font-bold text-yellow-700">{microsTotal.fe} ppm</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Enxofre (S):</p>
                      <p className="text-xl font-bold text-amber-700">{microsTotal.s} ppm</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* EC */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">EC Estimado:</p>
                  <p className="text-3xl font-bold text-blue-700">{ecEstimated} mS/cm</p>
                  <p className="text-sm text-muted-foreground mt-1">PPM Aproximado: {ppmApprox} ppm</p>
                </CardContent>
              </Card>
              
              {/* Ações */}
              <div className="flex gap-3">
                <Button onClick={exportRecipe} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Receita (TXT)
                </Button>
                <Button onClick={saveRecipe} className="flex-1 bg-green-600 hover:bg-green-700">
                  Salvar Receita
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Receitas</CardTitle>
              <CardDescription>Receitas salvas anteriormente</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

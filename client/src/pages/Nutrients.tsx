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

// Produtos pré-definidos por fase/semana com quantidades em ml/L
const getProductsByPhaseWeek = (phase: Phase, week: number) => {
  if (phase === "CLONING") {
    return [
      { name: "Enraizador", mlPerLiter: 2, npk: "1-2-1", ca: 0, mg: 0, fe: 0 },
      { name: "CalMag", mlPerLiter: 1, npk: "0-0-0", ca: 3, mg: 1, fe: 0 },
    ];
  }
  
  if (phase === "VEGA") {
    if (week <= 2) {
      return [
        { name: "Grow (Vega)", mlPerLiter: 3, npk: "7-4-10", ca: 0, mg: 0, fe: 0 },
        { name: "CalMag", mlPerLiter: 2, npk: "0-0-0", ca: 3, mg: 1, fe: 0 },
        { name: "Micronutrientes", mlPerLiter: 1, npk: "0-0-0", ca: 0, mg: 0, fe: 0.5 },
      ];
    } else {
      return [
        { name: "Grow (Vega)", mlPerLiter: 4, npk: "7-4-10", ca: 0, mg: 0, fe: 0 },
        { name: "CalMag", mlPerLiter: 3, npk: "0-0-0", ca: 3, mg: 1, fe: 0 },
        { name: "Micronutrientes", mlPerLiter: 1.5, npk: "0-0-0", ca: 0, mg: 0, fe: 0.5 },
      ];
    }
  }
  
  if (phase === "FLORA") {
    if (week <= 2) {
      return [
        { name: "Bloom (Flora)", mlPerLiter: 3, npk: "2-8-12", ca: 0, mg: 0, fe: 0 },
        { name: "CalMag", mlPerLiter: 2.5, npk: "0-0-0", ca: 3, mg: 1, fe: 0 },
        { name: "Micronutrientes", mlPerLiter: 1, npk: "0-0-0", ca: 0, mg: 0, fe: 0.5 },
      ];
    } else if (week <= 5) {
      return [
        { name: "Bloom (Flora)", mlPerLiter: 4, npk: "2-8-12", ca: 0, mg: 0, fe: 0 },
        { name: "PK Booster", mlPerLiter: 2, npk: "0-13-14", ca: 0, mg: 0, fe: 0 },
        { name: "CalMag", mlPerLiter: 3, npk: "0-0-0", ca: 3, mg: 1, fe: 0 },
        { name: "Micronutrientes", mlPerLiter: 1.5, npk: "0-0-0", ca: 0, mg: 0, fe: 0.5 },
      ];
    } else if (week <= 7) {
      return [
        { name: "Bloom (Flora)", mlPerLiter: 3, npk: "2-8-12", ca: 0, mg: 0, fe: 0 },
        { name: "PK Booster", mlPerLiter: 1.5, npk: "0-13-14", ca: 0, mg: 0, fe: 0 },
        { name: "CalMag", mlPerLiter: 2, npk: "0-0-0", ca: 3, mg: 1, fe: 0 },
        { name: "Micronutrientes", mlPerLiter: 1, npk: "0-0-0", ca: 0, mg: 0, fe: 0.5 },
      ];
    } else {
      // Flush (semana 8+)
      return [];
    }
  }
  
  if (phase === "MAINTENANCE") {
    return [
      { name: "Manutenção", mlPerLiter: 2.5, npk: "5-5-5", ca: 0, mg: 0, fe: 0 },
      { name: "CalMag", mlPerLiter: 1.5, npk: "0-0-0", ca: 3, mg: 1, fe: 0 },
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
  
  // Calcular quantidades totais
  const calculatedProducts = products.map(p => ({
    ...p,
    totalMl: p.mlPerLiter * volumeL,
  }));
  
  // Calcular NPK total
  const calculateNPK = () => {
    let n = 0, p = 0, k = 0;
    calculatedProducts.forEach(prod => {
      const [nVal, pVal, kVal] = prod.npk.split("-").map(Number);
      n += (nVal * prod.totalMl) / volumeL;
      p += (pVal * prod.totalMl) / volumeL;
      k += (kVal * prod.totalMl) / volumeL;
    });
    return { n: Math.round(n * 100), p: Math.round(p * 100), k: Math.round(k * 100) };
  };
  
  // Calcular micronutrientes
  const calculateMicros = () => {
    let ca = 0, mg = 0, fe = 0;
    calculatedProducts.forEach(prod => {
      ca += (prod.ca * prod.totalMl) / volumeL;
      mg += (prod.mg * prod.totalMl) / volumeL;
      fe += (prod.fe * prod.totalMl) / volumeL;
    });
    return { 
      ca: Math.round(ca * 100), 
      mg: Math.round(mg * 100), 
      fe: Math.round(fe * 100) 
    };
  };
  
  // Calcular EC estimado
  const calculateEC = () => {
    const npk = calculateNPK();
    const totalPPM = npk.n + npk.p + npk.k;
    return (totalPPM / 640).toFixed(2);
  };
  
  const npk = calculateNPK();
  const micros = calculateMicros();
  const ec = calculateEC();
  
  const createApplication = trpc.nutrients.recordApplication.useMutation({
    onSuccess: () => {
      showToast.success("✅ Receita salva no histórico!");
    },
    onError: (error: any) => {
      showToast.error(`❌ Erro ao salvar: ${error.message}`);
    },
  });
  
  const handleSave = () => {
    createApplication.mutate({
      tentId: 0,
      cycleId: null,
      recipeTemplateId: null,
      recipeName: `${phase} Semana ${week}`,
      phase,
      weekNumber: week,
      volumeTotalL: volumeL,
      ecTarget: parseFloat(ec),
      ecActual: null,
      phTarget: 6.0,
      phActual: null,
      products: calculatedProducts.map(p => ({
        name: p.name,
        amountMl: p.totalMl,
        npk: p.npk,
        ca: p.ca,
        mg: p.mg,
        fe: p.fe,
      })),
      notes: undefined,
    });
  };
  
  const exportRecipe = () => {
    const text = `
RECEITA DE FERTILIZAÇÃO
========================
Fase: ${phase}
Semana: ${week}
Volume Total: ${volumeL}L

PRODUTOS:
${calculatedProducts.map(p => `- ${p.name}: ${p.totalMl.toFixed(1)}ml (${p.mlPerLiter}ml/L)`).join("\n")}

NPK TOTAL:
- Nitrogênio (N): ${npk.n} ppm
- Fósforo (P): ${npk.p} ppm
- Potássio (K): ${npk.k} ppm

MICRONUTRIENTES:
- Cálcio (Ca): ${micros.ca} ppm
- Magnésio (Mg): ${micros.mg} ppm
- Ferro (Fe): ${micros.fe} ppm

EC ESTIMADO: ${ec} mS/cm (${Math.round(parseFloat(ec) * 640)} ppm)
    `.trim();
    
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receita_${phase}_semana${week}_${volumeL}L.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast.success("📥 Receita exportada!");
  };
  
  const applicationsQuery = trpc.nutrients.listApplications.useQuery();
  
  return (
    <div className="container py-8">
      <div className="flex items-center gap-3 mb-6">
        <Beaker className="w-8 h-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">Calculadora de Fertilização</h1>
          <p className="text-muted-foreground">
            Calcule automaticamente as quantidades de nutrientes baseado em fase e semana
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="calculator">🧪 Calculadora</TabsTrigger>
          <TabsTrigger value="history">📋 Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator" className="space-y-6">
          {/* Seletor de Fase e Semana */}
          <Card>
            <CardHeader>
              <CardTitle>1. Selecione a Fase e Semana</CardTitle>
              <CardDescription>
                O sistema calculará automaticamente os produtos e quantidades
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Fase</Label>
                <Select value={phase} onValueChange={(v) => setPhase(v as Phase)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLONING">🌱 Clonagem</SelectItem>
                    <SelectItem value="VEGA">🌿 Vegetativa</SelectItem>
                    <SelectItem value="FLORA">🌺 Floração</SelectItem>
                    <SelectItem value="MAINTENANCE">🔧 Manutenção</SelectItem>
                    <SelectItem value="DRYING">💨 Secagem (Flush)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Semana</Label>
                <Select value={week.toString()} onValueChange={(v) => setWeek(parseInt(v))}>
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
              <CardDescription>
                Digite o volume total da solução nutritiva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={volumeL}
                  onChange={(e) => setVolumeL(parseFloat(e.target.value) || 0)}
                  className="text-6xl h-24 text-center font-bold"
                  min={0}
                  step={0.5}
                />
                <span className="text-4xl font-bold text-muted-foreground">Litros</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Receita Calculada */}
          <Card className="border-cyan-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧪 Receita de Fertilização para {volumeL}L
              </CardTitle>
              <CardDescription>
                Quantidades calculadas automaticamente baseadas no volume total
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {calculatedProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg">💧 Flush (apenas água)</p>
                  <p className="text-sm">Não adicione nutrientes nesta fase</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground">Produtos</h3>
                    {calculatedProducts.map((prod, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div>
                          <p className="font-semibold">{prod.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {prod.mlPerLiter}ml/L × {volumeL}L
                          </p>
                          <p className="text-xs text-muted-foreground">
                            NPK: {prod.npk} | Ca: {prod.ca}% | Mg: {prod.mg}% | Fe: {prod.fe}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {prod.totalMl.toFixed(1)} ml
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* NPK Total */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">NPK Total</h3>
                    <div className="grid gap-2 md:grid-cols-3">
                      <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <p className="text-sm text-purple-700 font-medium">Nitrogênio (N):</p>
                        <p className="text-2xl font-bold text-purple-900">{npk.n} ppm</p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-sm text-blue-700 font-medium">Fósforo (P):</p>
                        <p className="text-2xl font-bold text-blue-900">{npk.p} ppm</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-sm text-green-700 font-medium">Potássio (K):</p>
                        <p className="text-2xl font-bold text-green-900">{npk.k} ppm</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Micronutrientes */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">Micronutrientes</h3>
                    <div className="grid gap-2 md:grid-cols-3">
                      <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                        <p className="text-sm text-orange-700 font-medium">Cálcio (Ca):</p>
                        <p className="text-2xl font-bold text-orange-900">{micros.ca} ppm</p>
                      </div>
                      <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                        <p className="text-sm text-emerald-700 font-medium">Magnésio (Mg):</p>
                        <p className="text-2xl font-bold text-emerald-900">{micros.mg} ppm</p>
                      </div>
                      <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                        <p className="text-sm text-yellow-700 font-medium">Ferro (Fe):</p>
                        <p className="text-2xl font-bold text-yellow-900">{micros.fe} ppm</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* EC Estimado */}
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">EC Estimado:</p>
                    <p className="text-3xl font-bold text-blue-900">{ec} mS/cm</p>
                    <p className="text-sm text-blue-600">
                      PPM Aproximado: {Math.round(parseFloat(ec) * 640)} ppm
                    </p>
                  </div>
                </>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button onClick={exportRecipe} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Receita (TXT)
                </Button>
                <Button 
                  onClick={handleSave} 
                  className="flex-1"
                  disabled={createApplication.isPending}
                >
                  {createApplication.isPending ? "Salvando..." : "Salvar Receita"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Receitas</CardTitle>
              <CardDescription>
                Receitas salvas anteriormente para consulta
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applicationsQuery.isLoading ? (
                <p className="text-center text-muted-foreground py-8">Carregando...</p>
              ) : applicationsQuery.data && applicationsQuery.data.length > 0 ? (
                <div className="space-y-3">
                  {applicationsQuery.data.map((app: any) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{app.recipeName}</p>
                          <p className="text-sm text-muted-foreground">
                            Volume: {app.volumeL}L | EC: {app.ecTarget} mS/cm
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(app.appliedAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma receita salva ainda
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

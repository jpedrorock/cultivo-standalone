import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Beaker, Droplets, TestTube, Download } from "lucide-react";
import { toast as showToast } from "sonner";

interface NutrientProduct {
  name: string;
  amountMl: number;
  npk?: string;
  ca?: number;
  mg?: number;
  fe?: number;
}

interface CalculatedResults {
  npkTotal: { n: number; p: number; k: number };
  micronutrients: { ca: number; mg: number; fe: number };
  ecEstimated: number;
  ppmEstimated: number;
  phEstimated: number;
}

export default function Nutrients() {
  // State para seleção de receita
  const [selectedPhase, setSelectedPhase] = useState<"CLONING" | "VEGA" | "FLORA" | "MAINTENANCE" | "DRYING">("VEGA");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedTentId, setSelectedTentId] = useState<number>(1);
  
  // State para editor de receita
  const [recipeName, setRecipeName] = useState("");
  const [volumeTotalL, setVolumeTotalL] = useState(10);
  const [products, setProducts] = useState<NutrientProduct[]>([]);
  const [phTarget, setPhTarget] = useState(6.0);
  const [phActual, setPhActual] = useState(6.0);
  const [ecActual, setEcActual] = useState(0);
  
  // State para cálculos
  const [calculated, setCalculated] = useState<CalculatedResults>({
    npkTotal: { n: 0, p: 0, k: 0 },
    micronutrients: { ca: 0, mg: 0, fe: 0 },
    ecEstimated: 0,
    ppmEstimated: 0,
    phEstimated: 6.0,
  });
  
  // Queries tRPC
  const { data: templates } = trpc.nutrients.listTemplates.useQuery({ phase: selectedPhase });
  const { data: tents } = trpc.tents.list.useQuery();
  const { data: applications } = trpc.nutrients.listApplications.useQuery({ tentId: selectedTentId });
  
  // Mutations tRPC
  const recordApplication = trpc.nutrients.recordApplication.useMutation({
    onSuccess: () => {
      showToast.success("Aplicação registrada com sucesso!");
    },
    onError: (error) => {
      showToast.error(`Erro ao registrar aplicação: ${error.message}`);
    },
  });
  
  // Função para calcular nutrientes em tempo real
  const calculateNutrients = () => {
    let nTotal = 0;
    let pTotal = 0;
    let kTotal = 0;
    let caTotal = 0;
    let mgTotal = 0;
    let feTotal = 0;
    
    for (const product of products) {
      if (product.npk) {
        const [n, p, k] = product.npk.split('-').map(Number);
        const mlPerLiter = product.amountMl / volumeTotalL;
        
        nTotal += (n / 100) * mlPerLiter * 10000;
        pTotal += (p / 100) * mlPerLiter * 10000;
        kTotal += (k / 100) * mlPerLiter * 10000;
      }
      
      if (product.ca) {
        const mlPerLiter = product.amountMl / volumeTotalL;
        caTotal += (product.ca / 100) * mlPerLiter * 10000;
      }
      
      if (product.mg) {
        const mlPerLiter = product.amountMl / volumeTotalL;
        mgTotal += (product.mg / 100) * mlPerLiter * 10000;
      }
      
      if (product.fe) {
        const mlPerLiter = product.amountMl / volumeTotalL;
        feTotal += (product.fe / 100) * mlPerLiter * 10000;
      }
    }
    
    const totalPPM = (nTotal + pTotal + kTotal + caTotal + mgTotal + feTotal) / 10;
    const ecEstimated = Math.round((totalPPM / 640) * 100) / 100;
    
    setCalculated({
      npkTotal: {
        n: Math.round(nTotal),
        p: Math.round(pTotal),
        k: Math.round(kTotal),
      },
      micronutrients: {
        ca: Math.round(caTotal),
        mg: Math.round(mgTotal),
        fe: Math.round(feTotal),
      },
      ecEstimated,
      ppmEstimated: Math.round(totalPPM),
      phEstimated: 6.0,
    });
  };
  
  // Recalcular quando produtos ou volume mudarem
  useEffect(() => {
    calculateNutrients();
  }, [products, volumeTotalL]);
  
  // Carregar receita selecionada
  const loadTemplate = (templateId: number) => {
    const template = templates?.find((t: any) => t.id === templateId);
    if (!template) return;
    
    setRecipeName(template.name);
    setVolumeTotalL(Number(template.volumeTotalL));
    setPhTarget(Number(template.phTarget || 6.0));
    
    try {
      const productsJson = JSON.parse(template.productsJson);
      setProducts(productsJson);
    } catch (error) {
      console.error("Erro ao parsear produtos:", error);
    }
  };
  
  // Adicionar produto
  const addProduct = () => {
    setProducts([...products, { name: "", amountMl: 0 }]);
  };
  
  // Remover produto
  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };
  
  // Atualizar produto
  const updateProduct = (index: number, field: keyof NutrientProduct, value: any) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);
  };
  
  // Salvar aplicação
  const handleSaveApplication = () => {
    recordApplication.mutate({
      tentId: selectedTentId,
      cycleId: null,
      recipeTemplateId: null,
      recipeName,
      phase: selectedPhase,
      weekNumber: selectedWeek,
      volumeTotalL,
      ecTarget: calculated.ecEstimated,
      ecActual,
      phTarget,
      phActual,
      products,
      notes: "",
    });
  };
  
  // Exportar receita como TXT
  const handleExportRecipe = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    
    const txtContent = `RECEITA DE FERTILIZAÇÃO - APP CULTIVO
================================================

DATA: ${dateStr}

PARÂMETROS:
- Nome da receita: ${recipeName}
- Volume de preparo: ${volumeTotalL}L
- EC estimado: ${calculated.ecEstimated} mS/cm
- PPM aproximado: ${calculated.ppmEstimated} ppm
- Fase: ${selectedPhase}
- Semana: ${selectedWeek}

PRODUTOS:
${products.map((p, i) => `${i + 1}. ${p.name}: ${p.amountMl} ml (${(p.amountMl / volumeTotalL).toFixed(2)} ml/L)`).join('\n')}

NPK TOTAL:
- Nitrogênio (N): ${calculated.npkTotal.n} ppm
- Fósforo (P): ${calculated.npkTotal.p} ppm
- Potássio (K): ${calculated.npkTotal.k} ppm

MICRONUTRIENTES:
- Cálcio (Ca): ${calculated.micronutrients.ca} ppm
- Magnésio (Mg): ${calculated.micronutrients.mg} ppm
- Ferro (Fe): ${calculated.micronutrients.fe} ppm

pH:
- pH Target: ${phTarget}
- pH Atual: ${phActual}

DICA:
Dissolva cada produto separadamente e misture gradualmente.
Aguarde cada produto dissolver completamente antes de adicionar o próximo.

---
Gerado por App Cultivo em ${now.toLocaleString('pt-BR')}
`;
    
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receita-${recipeName.replace(/\s+/g, '-').toLowerCase()}-${volumeTotalL}L.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast.success('✅ Receita exportada para TXT!');
  };
  
  // Calcular ajuste de pH
  const phDiff = phTarget - phActual;
  const phAdjustmentMl = Math.abs(phDiff) * volumeTotalL;
  const phDirection = phDiff > 0 ? "up" : "down";
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Beaker className="w-8 h-8 text-primary" />
          Receitas de Nutrientes
        </h1>
        <p className="text-muted-foreground mt-2">
          Sistema completo de fertilização com NPK, micronutrientes, EC/PPM e ajuste de pH
        </p>
      </div>
      
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">🧪 Calculadora</TabsTrigger>
          <TabsTrigger value="history">📋 Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator" className="space-y-6">
          {/* Seletor de Receita Base */}
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Receita Base</CardTitle>
              <CardDescription>Escolha uma receita pré-configurada por fase e semana</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="phase">Fase</Label>
                  <Select value={selectedPhase} onValueChange={(v: any) => setSelectedPhase(v)}>
                    <SelectTrigger id="phase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLONING">🌱 Clonagem</SelectItem>
                      <SelectItem value="VEGA">🌿 Vegetativa</SelectItem>
                      <SelectItem value="FLORA">🌺 Floração</SelectItem>
                      <SelectItem value="MAINTENANCE">🔧 Manutenção</SelectItem>
                      <SelectItem value="DRYING">🍂 Secagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="week">Semana</Label>
                  <Select value={selectedWeek.toString()} onValueChange={(v) => setSelectedWeek(parseInt(v))}>
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
                
                <div>
                  <Label htmlFor="template">Receita</Label>
                  <Select onValueChange={(v) => loadTemplate(parseInt(v))}>
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Selecione uma receita" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((t: any) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Input Principal: Volume Total */}
          <Card className="border-4 border-primary/30 shadow-2xl bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <Droplets className="w-10 h-10 text-primary" />
                Quantos litros você vai preparar?
              </CardTitle>
              <CardDescription className="text-base">
                Digite o volume total da solução nutritiva que deseja preparar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Input
                  id="volume"
                  type="number"
                  value={volumeTotalL}
                  onChange={(e) => setVolumeTotalL(parseFloat(e.target.value) || 0)}
                  placeholder="10"
                  className="text-6xl font-bold h-32 text-center border-4 border-primary/50 focus:border-primary"
                />
                <div className="text-5xl font-bold text-muted-foreground">Litros</div>
              </div>
            </CardContent>
          </Card>

          
          {/* Resultados: Receita Gerada */}
          {products.length > 0 && (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  🧪 Receita de Fertilização para {volumeTotalL}L
                </CardTitle>
                <CardDescription className="text-foreground/80">
                  Quantidades calculadas automaticamente baseadas no volume total
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Produtos com Quantidades Totais */}
                <div>
                  <h4 className="font-semibold text-lg mb-3">Produtos</h4>
                  <div className="grid gap-3">
                    {products.map((product, idx) => (
                      <div key={idx} className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-lg">{product.name}</span>
                          <span className="text-3xl font-bold text-primary">
                            {(product.amountMl / volumeTotalL * volumeTotalL).toFixed(1)} ml
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(product.amountMl / volumeTotalL).toFixed(2)} ml/L × {volumeTotalL}L
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          NPK: {product.npk || "N/A"} | Ca: {product.ca || 0}% | Mg: {product.mg || 0}% | Fe: {product.fe || 0}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <hr className="border-green-300 dark:border-green-700" />
                
                {/* NPK Total */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">NPK Total</h4>
                  
                  {/* Nitrogênio (N) - Roxo */}
                  <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg border-2 border-purple-300 dark:border-purple-700">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-200">Nitrogênio (N):</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {calculated.npkTotal.n} ppm
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Fósforo (P) - Azul */}
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-200">Fósforo (P):</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {calculated.npkTotal.p} ppm
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Potássio (K) - Verde */}
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border-2 border-green-300 dark:border-green-700">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-200">Potássio (K):</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {calculated.npkTotal.k} ppm
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Micronutrientes */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">Micronutrientes</h4>
                  
                  {/* Cálcio (Ca) - Laranja */}
                  <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg border-2 border-orange-300 dark:border-orange-700">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-200">Cálcio (Ca):</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {calculated.micronutrients.ca} ppm
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Magnésio (Mg) - Verde Escuro */}
                  <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border-2 border-emerald-300 dark:border-emerald-700">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-200">Magnésio (Mg):</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {calculated.micronutrients.mg} ppm
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ferro (Fe) - Amarelo */}
                  <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-200">Ferro (Fe):</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {calculated.micronutrients.fe} ppm
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* EC e PPM */}
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border-2 border-blue-300 dark:border-blue-700 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-200">EC Estimado:</span>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {calculated.ecEstimated} mS/cm
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        PPM Aproximado: {calculated.ppmEstimated} ppm
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Botões de Ação */}
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleExportRecipe}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Receita (TXT)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Ajustes Avançados (Accordion Colapsado) */}
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Ajustes Avançados</CardTitle>
              <CardDescription>Edite produtos, NPK, micronutrientes e ajuste de pH (opcional)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Nome da Receita */}
                <div>
                  <Label htmlFor="recipeName">Nome da Receita</Label>
                  <Input
                    id="recipeName"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    placeholder="Ex: Vega Semana 3 Custom"
                  />
                </div>
                
                {/* Editor de Produtos */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Produtos</Label>
                    <Button onClick={addProduct} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Produto
                    </Button>
                  </div>
                  
                  {products.map((product, index) => (
                    <div key={index} className="grid gap-3 md:grid-cols-6 items-end p-3 bg-muted/50 rounded-lg border">
                      <div className="md:col-span-2">
                        <Label className="text-xs">Nome</Label>
                        <Input
                          value={product.name}
                          onChange={(e) => updateProduct(index, "name", e.target.value)}
                          placeholder="Ex: Grow (Vega)"
                          size={1}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">ml/L</Label>
                        <Input
                          type="number"
                          value={product.amountMl / volumeTotalL}
                          onChange={(e) => updateProduct(index, "amountMl", (parseFloat(e.target.value) || 0) * volumeTotalL)}
                          placeholder="30"
                          size={1}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">NPK</Label>
                        <Input
                          value={product.npk || ""}
                          onChange={(e) => updateProduct(index, "npk", e.target.value)}
                          placeholder="7-4-10"
                          size={1}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Ca/Mg/Fe (%)</Label>
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            step="0.1"
                            value={product.ca || ""}
                            onChange={(e) => updateProduct(index, "ca", parseFloat(e.target.value) || undefined)}
                            placeholder="Ca"
                            size={1}
                            className="w-full"
                          />
                          <Input
                            type="number"
                            step="0.1"
                            value={product.mg || ""}
                            onChange={(e) => updateProduct(index, "mg", parseFloat(e.target.value) || undefined)}
                            placeholder="Mg"
                            size={1}
                            className="w-full"
                          />
                          <Input
                            type="number"
                            step="0.1"
                            value={product.fe || ""}
                            onChange={(e) => updateProduct(index, "fe", parseFloat(e.target.value) || undefined)}
                            placeholder="Fe"
                            size={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Button
                          onClick={() => removeProduct(index)}
                          variant="destructive"
                          size="sm"
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <hr className="my-4" />
                
                {/* Ajuste de pH */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    Ajuste de pH
                  </h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="phTarget">pH Target</Label>
                      <Input
                        id="phTarget"
                        type="number"
                        step="0.1"
                        value={phTarget}
                        onChange={(e) => setPhTarget(parseFloat(e.target.value) || 6.0)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phActual">pH Atual</Label>
                      <Input
                        id="phActual"
                        type="number"
                        step="0.1"
                        value={phActual}
                        onChange={(e) => setPhActual(parseFloat(e.target.value) || 6.0)}
                      />
                    </div>
                    
                    <div>
                      <Label>Ajuste Necessário</Label>
                      <div className="p-2 bg-muted rounded-md text-center font-medium">
                        {Math.abs(phDiff) < 0.1 ? (
                          <span className="text-green-600">✓ pH OK</span>
                        ) : (
                          <span className={phDirection === "up" ? "text-blue-600" : "text-orange-600"}>
                            {phAdjustmentMl.toFixed(1)} ml pH {phDirection === "up" ? "Up" : "Down"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Salvar Aplicação */}
          <Card>
            <CardHeader>
              <CardTitle>Registrar Aplicação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="tent">Estufa</Label>
                  <Select value={selectedTentId.toString()} onValueChange={(v) => setSelectedTentId(parseInt(v))}>
                    <SelectTrigger id="tent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tents?.map((t: any) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="ecActual">EC Medido (mS/cm)</Label>
                  <Input
                    id="ecActual"
                    type="number"
                    step="0.1"
                    value={ecActual}
                    onChange={(e) => setEcActual(parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 1.2"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSaveApplication}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-6"
                size="lg"
              >
                <Droplets className="mr-2 h-5 w-5" />
                Salvar Aplicação
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Aplicações</CardTitle>
              <CardDescription>Registro de todas as fertilizações realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {applications?.map((app: any) => (
                  <div key={app.id} className="p-4 bg-muted/50 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{app.recipeName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(app.appliedAt).toLocaleDateString('pt-BR')} - {app.volumeTotalL}L
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          EC: {app.ecActual} mS/cm
                        </div>
                        <div className="text-sm text-muted-foreground">
                          pH: {app.phActual}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {!applications || applications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma aplicação registrada ainda
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

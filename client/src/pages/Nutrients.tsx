import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Beaker, Droplets, TestTube } from "lucide-react";
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
  // Toast notifications
  
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
  
  // Calcular ajuste de pH
  const phDiff = phTarget - phActual;
  const phAdjustmentMl = Math.abs(phDiff) * volumeTotalL;
  const phDirection = phDiff > 0 ? "up" : "down";
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Receitas de Nutrientes</h1>
        <p className="text-muted-foreground">
          Calculadora avançada de fertilização com NPK, micronutrientes, EC/PPM e ajuste de pH
        </p>
      </div>
      
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator" className="space-y-6">
          {/* Seletor de Receita Base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="w-5 h-5" />
                Seletor de Receita Base
              </CardTitle>
              <CardDescription>Escolha uma receita pré-configurada para começar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Fase</Label>
                  <Select value={selectedPhase} onValueChange={(v: any) => setSelectedPhase(v)}>
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
                
                {(selectedPhase === "VEGA" || selectedPhase === "FLORA") && (
                  <div className="space-y-2">
                    <Label>Semana</Label>
                    <Select value={selectedWeek.toString()} onValueChange={(v) => setSelectedWeek(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: selectedPhase === "VEGA" ? 4 : 8 }, (_, i) => i + 1).map((week: number) => (
                          <SelectItem key={week} value={week.toString()}>Semana {week}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Receita</Label>
                  <Select onValueChange={(v) => loadTemplate(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma receita" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((template: any) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Editor de Receita */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Editor de Receita
              </CardTitle>
              <CardDescription>Ajuste quantidades e produtos em tempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Receita</Label>
                  <Input 
                    value={recipeName} 
                    onChange={(e) => setRecipeName(e.target.value)}
                    placeholder="Ex: Vega Semana 2 Custom"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Volume Total (L)</Label>
                  <Input 
                    type="number" 
                    value={volumeTotalL} 
                    onChange={(e) => setVolumeTotalL(Number(e.target.value))}
                    min={1}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Produtos</Label>
                  <Button size="sm" variant="outline" onClick={addProduct}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </div>
                
                {products.map((product: NutrientProduct, index: number) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-3">
                      <Input 
                        placeholder="Nome do produto"
                        value={product.name}
                        onChange={(e) => updateProduct(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input 
                        type="number"
                        placeholder="ml"
                        value={product.amountMl}
                        onChange={(e) => updateProduct(index, "amountMl", Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input 
                        placeholder="NPK (7-4-10)"
                        value={product.npk || ""}
                        onChange={(e) => updateProduct(index, "npk", e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input 
                        type="number"
                        placeholder="Ca%"
                        value={product.ca || ""}
                        onChange={(e) => updateProduct(index, "ca", e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input 
                        type="number"
                        placeholder="Mg%"
                        value={product.mg || ""}
                        onChange={(e) => updateProduct(index, "mg", e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input 
                        type="number"
                        placeholder="Fe%"
                        value={product.fe || ""}
                        onChange={(e) => updateProduct(index, "fe", e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => removeProduct(index)}
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Painel de Cálculos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">NPK Total (ppm)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nitrogênio (N):</span>
                  <span className="font-bold">{calculated.npkTotal.n} ppm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fósforo (P):</span>
                  <span className="font-bold">{calculated.npkTotal.p} ppm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potássio (K):</span>
                  <span className="font-bold">{calculated.npkTotal.k} ppm</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Micronutrientes (ppm)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cálcio (Ca):</span>
                  <span className="font-bold">{calculated.micronutrients.ca} ppm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Magnésio (Mg):</span>
                  <span className="font-bold">{calculated.micronutrients.mg} ppm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ferro (Fe):</span>
                  <span className="font-bold">{calculated.micronutrients.fe} ppm</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Droplets className="w-5 h-5" />
                  EC / pH
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">EC Estimado:</span>
                  <span className="font-bold">{calculated.ecEstimated} mS/cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PPM Estimado:</span>
                  <span className="font-bold">{calculated.ppmEstimated} ppm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">pH Estimado:</span>
                  <span className="font-bold">{calculated.phEstimated}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Ajuste de pH e Salvamento */}
          <Card>
            <CardHeader>
              <CardTitle>Ajuste de pH e Registro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>pH Target</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={phTarget} 
                    onChange={(e) => setPhTarget(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>pH Atual</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={phActual} 
                    onChange={(e) => setPhActual(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Ajuste Necessário</Label>
                  <div className="h-10 flex items-center px-3 border rounded-md bg-muted">
                    {Math.abs(phDiff) < 0.1 ? (
                      <span className="text-green-600 font-medium">✓ pH OK</span>
                    ) : (
                      <span className="font-medium">
                        {phAdjustmentMl.toFixed(1)} ml pH {phDirection === "up" ? "Up ↑" : "Down ↓"}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>EC Atual</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={ecActual} 
                    onChange={(e) => setEcActual(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estufa</Label>
                  <Select value={selectedTentId.toString()} onValueChange={(v) => setSelectedTentId(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tents?.map(tent => (
                        <SelectItem key={tent.id} value={tent.id.toString()}>
                          {tent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    className="w-full" 
                    onClick={handleSaveApplication}
                    disabled={!recipeName || products.length === 0}
                  >
                    Salvar Aplicação
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Aplicações</CardTitle>
              <CardDescription>Registro de fertilizações anteriores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications?.map((app: any) => (
                  <div key={app.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{app.recipeName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {app.phase} {app.weekNumber && `- Semana ${app.weekNumber}`}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(app.applicationDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="ml-2 font-medium">{app.volumeTotalL} L</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">EC Target:</span>
                        <span className="ml-2 font-medium">{app.ecTarget || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">EC Atual:</span>
                        <span className="ml-2 font-medium">{app.ecActual || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">pH:</span>
                        <span className="ml-2 font-medium">
                          {app.phTarget} → {app.phActual || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!applications || applications.length === 0) && (
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

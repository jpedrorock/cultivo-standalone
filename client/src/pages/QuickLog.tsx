import { useState, useEffect, useMemo } from "react";
import { useSwipeable } from "react-swipeable";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Home, ThermometerSun, Droplets, Sprout, Droplet, TestTube, Zap, Sun, Check, ArrowLeft, ArrowRight, Heart, SkipForward, Activity, Camera, Upload } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// LST Techniques data
const LST_TECHNIQUES = [
  { id: "LST", name: "LST", icon: "🌿", description: "Low Stress Training - Dobrar e amarrar galhos" },
  { id: "TOPPING", name: "Topping", icon: "✂️", description: "Cortar o topo principal para criar 2 colas" },
  { id: "FIM", name: "FIM", icon: "🔪", description: "Fuck I Missed - Corte parcial do topo" },
  { id: "SUPER_CROPPING", name: "Super Cropping", icon: "💪", description: "Dobrar galhos até quebrar fibras internas" },
  { id: "LOLLIPOPPING", name: "Lollipopping", icon: "🍭", description: "Remover folhas e galhos inferiores" },
  { id: "DEFOLIATION", name: "Defoliação", icon: "🍂", description: "Remover folhas para melhorar penetração de luz" },
  { id: "MAINLINING", name: "Mainlining", icon: "🌳", description: "Criar estrutura simétrica com topping múltiplo" },
  { id: "SCROG", name: "ScrOG", icon: "🕸️", description: "Screen of Green - Treliça para distribuir colas" },
];

type TrichomeStatus = "clear" | "cloudy" | "amber" | "mixed";

export default function QuickLog() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [turn, setTurn] = useState<"AM" | "PM">("AM");
  
  // Form state - Daily Log
  const [tentId, setTentId] = useState<number | null>(null);
  
  // Detect tentId from URL parameter and pre-select tent
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tentIdParam = params.get('tentId');
    if (tentIdParam) {
      const parsedTentId = parseInt(tentIdParam, 10);
      if (!isNaN(parsedTentId)) {
        setTentId(parsedTentId);
      }
    }
  }, []);
  const [tempC, setTempC] = useState("");
  const [rhPct, setRhPct] = useState("");
  const [wateringVolume, setWateringVolume] = useState("");
  const [runoffCollected, setRunoffCollected] = useState("");
  const [ph, setPh] = useState("");
  const [ec, setEc] = useState("");
  const [ppfd, setPpfd] = useState(0);

  // Plant health state - expanded
  const [recordPlantHealth, setRecordPlantHealth] = useState<boolean | null>(null);
  const [currentPlantIndex, setCurrentPlantIndex] = useState(0);
  const [plantHealthRecords, setPlantHealthRecords] = useState<Map<number, {
    status: string;
    symptoms: string;
    notes: string;
    photoBase64?: string;
    trichomeStatus?: TrichomeStatus;
    trichomeClear?: number;
    trichomeCloudy?: number;
    trichomeAmber?: number;
    lstTechniques?: string[];
    lstResponse?: string;
  }>>(new Map());

  // Fetch tents for selection
  const { data: tents = [], isLoading: tentsLoading } = trpc.tents.list.useQuery();

  // Fetch plants for selected tent (load when reaching step 9)
  const { data: plants = [] } = trpc.plants.list.useQuery(
    {},
    { 
      enabled: !!tentId && currentStep >= 9,
      select: (data) => data.filter(p => p.currentTentId === tentId)
    }
  );

  // Calculate runoff percentage
  const runoffPercentage = useMemo(() => {
    const watering = parseFloat(wateringVolume);
    const runoff = parseFloat(runoffCollected);
    if (!watering || !runoff || watering === 0) return null;
    return ((runoff / watering) * 100).toFixed(1);
  }, [wateringVolume, runoffCollected]);

  // Save daily log mutation
  const saveDailyLogMutation = trpc.dailyLogs.create.useMutation({
    onSuccess: () => {
      if (recordPlantHealth === false || plants.length === 0) {
        // Skip plant health or no plants
        toast.success("✅ Registro salvo com sucesso!");
        resetForm();
        setTimeout(() => setLocation("/"), 1500);
      } else {
        // Continue to plant health
        setCurrentStep(9); // Go to first plant health step
      }
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  // Save plant health mutation (now includes photo, trichomes, LST)
  const savePlantHealthMutation = trpc.plantHealth.create.useMutation({
    onSuccess: () => {
      // Move to next plant or finish
      if (currentPlantIndex < plants.length - 1) {
        setCurrentPlantIndex(currentPlantIndex + 1);
      } else {
        // All plants done
        toast.success("✅ Registros salvos com sucesso!");
        resetForm();
        setTimeout(() => setLocation("/"), 1500);
      }
    },
    onError: (error: any) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  // Upload photo mutation
  const uploadPhotoMutation = trpc.plantPhotos.upload.useMutation();

  // Save trichomes mutation
  const saveTrichomesMutation = trpc.plantTrichomes.create.useMutation();

  // Save LST mutation
  const saveLSTMutation = trpc.plantLST.create.useMutation();

  const resetForm = () => {
    setCurrentStep(0);
    setTentId(null);
    setTempC("");
    setRhPct("");
    setWateringVolume("");
    setRunoffCollected("");
    setPh("");
    setEc("");
    setPpfd(0);
    setRecordPlantHealth(null);
    setCurrentPlantIndex(0);
    setPlantHealthRecords(new Map());
  };

  const updatePlantHealthRecord = (plantId: number, field: string, value: any) => {
    setPlantHealthRecords((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(plantId) || {
        status: "healthy",
        symptoms: "",
        notes: "",
      };
      newMap.set(plantId, { ...existing, [field]: value });
      return newMap;
    });
  };

  const toggleLSTTechnique = (plantId: number, techniqueId: string) => {
    setPlantHealthRecords((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(plantId) || {
        status: "healthy",
        symptoms: "",
        notes: "",
        lstTechniques: [],
      };
      const techniques = existing.lstTechniques || [];
      const newTechniques = techniques.includes(techniqueId)
        ? techniques.filter((t) => t !== techniqueId)
        : [...techniques, techniqueId];
      newMap.set(plantId, { ...existing, lstTechniques: newTechniques });
      return newMap;
    });
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Foto muito grande! Máximo 5MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      updatePlantHealthRecord(plants[currentPlantIndex].id, "photoBase64", base64);
      toast.success("📸 Foto adicionada!");
    };
    reader.readAsDataURL(file);
  };

  const handleSavePlantHealth = async () => {
    const plant = plants[currentPlantIndex];
    const record = plantHealthRecords.get(plant.id);

    if (!record) {
      toast.error("Nenhum dado para salvar");
      return;
    }

    try {
      // 1. Save health status
      const healthStatusMap: Record<string, "HEALTHY" | "STRESSED" | "SICK"> = {
        healthy: "HEALTHY",
        attention: "STRESSED",
        sick: "SICK",
      };

      await savePlantHealthMutation.mutateAsync({
        plantId: plant.id,
        healthStatus: healthStatusMap[record.status] || "HEALTHY",
        symptoms: record.symptoms || undefined,
        treatment: undefined,
        notes: record.notes || undefined,
      });

      // 2. Upload photo if exists
      if (record.photoBase64) {
        // Convert base64 to buffer and upload to S3
        const base64Data = record.photoBase64.replace(/^data:image\/\w+;base64,/, "");
        const response = await fetch(record.photoBase64);
        const blob = await response.blob();
        
        // For now, we'll use the plantHealth photo upload via backend
        // The backend will handle S3 upload
        await uploadPhotoMutation.mutateAsync({
          plantId: plant.id,
          photoUrl: record.photoBase64, // Backend will process base64
          description: "Foto do QuickLog",
        });
      }

      // 3. Save trichomes if exists
      if (record.trichomeStatus) {
        await saveTrichomesMutation.mutateAsync({
          plantId: plant.id,
          weekNumber: 1, // Default week number for QuickLog
          trichomeStatus: record.trichomeStatus.toUpperCase() as "CLEAR" | "CLOUDY" | "AMBER" | "MIXED",
          clearPercent: record.trichomeClear || undefined,
          cloudyPercent: record.trichomeCloudy || undefined,
          amberPercent: record.trichomeAmber || undefined,
          notes: undefined,
          photoBase64: undefined,
        });
      }

      // 4. Save LST if exists
      if (record.lstTechniques && record.lstTechniques.length > 0) {
        await saveLSTMutation.mutateAsync({
          plantId: plant.id,
          technique: record.lstTechniques.join(", "),
          response: record.lstResponse || undefined,
          notes: undefined,
        });
      }

      // Success handled by mutation onSuccess
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  const handleSkipPlantHealth = () => {
    if (currentPlantIndex < plants.length - 1) {
      setCurrentPlantIndex(currentPlantIndex + 1);
    } else {
      // Last plant - finish
      toast.success("✅ Registro salvo com sucesso!");
      resetForm();
      setTimeout(() => setLocation("/"), 1500);
    }
  };

  const handleSaveDailyLog = () => {
    if (!tentId) {
      toast.error("Selecione uma estufa");
      return;
    }

    saveDailyLogMutation.mutate({
      tentId,
      logDate: new Date(),
      turn,
      tempC: tempC || undefined,
      rhPct: rhPct || undefined,
      wateringVolume: wateringVolume ? parseFloat(wateringVolume) : undefined,
      runoffCollected: runoffCollected ? parseFloat(runoffCollected) : undefined,
      ph: ph || undefined,
      ec: ec || undefined,
      ppfd: ppfd || undefined,
    });
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return tentId !== null;
      default:
        return true;
    }
  };

  const steps = [
    { id: 0, title: "Estufa", icon: Home, gradient: "from-blue-500 to-cyan-600" },
    { id: 1, title: "Temperatura", icon: ThermometerSun, gradient: "from-orange-500 to-red-600" },
    { id: 2, title: "Umidade", icon: Droplets, gradient: "from-blue-400 to-blue-600" },
    { id: 3, title: "Volume de Rega", icon: Sprout, gradient: "from-green-500 to-emerald-600" },
    { id: 4, title: "Runoff Coletado", icon: Droplet, gradient: "from-teal-500 to-cyan-600" },
    { id: 5, title: "pH", icon: TestTube, gradient: "from-purple-500 to-pink-600" },
    { id: 6, title: "EC", icon: Zap, gradient: "from-yellow-500 to-orange-600" },
    { id: 7, title: "PPFD", icon: Sun, gradient: "from-yellow-400 to-amber-600" },
    { id: 8, title: "Resumo", icon: Check, gradient: "from-green-500 to-emerald-600" },
  ];

  const currentStepData = steps[currentStep];

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentStep < 8 && canGoNext()) {
        setCurrentStep(currentStep + 1);
      }
    },
    onSwipedRight: () => {
      if (currentStep > 0 && currentStep < 9) {
        setCurrentStep(currentStep - 1);
      }
    },
    trackMouse: false,
  });

  if (tentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-32" {...swipeHandlers}>
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Registro Rápido</h1>
            {currentStep < 9 && (
              <p className="text-sm text-gray-500">Passo {currentStep + 1} de 9</p>
            )}
            {currentStep >= 9 && recordPlantHealth === null && (
              <p className="text-sm text-gray-500">Passo 10 de 9</p>
            )}
            {currentStep >= 9 && recordPlantHealth === true && plants[currentPlantIndex] && (
              <p className="text-sm text-gray-500">Passo {10 + currentPlantIndex} de {9 + plants.length}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="rounded-full"
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 min-h-[500px] relative overflow-hidden">
          {/* Decorative animated circle */}
          {currentStep < 9 && currentStepData && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-dashed border-gray-200 rounded-full opacity-30 animate-[spin_20s_linear_infinite] pointer-events-none" />
          )}

          {/* Step content */}
          <div className="relative z-10 space-y-6 animate-[fade-in_0.5s_ease-out]">
            {/* Icon */}
            {currentStep < 9 && currentStepData && (
              <div className="flex justify-center mb-6">
                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${currentStepData.gradient} flex items-center justify-center shadow-xl animate-[slide-in-from-bottom_0.6s_ease-out]`}>
                  <currentStepData.icon className="w-16 h-16 text-white" />
                </div>
              </div>
            )}

            {currentStep === 9 && recordPlantHealth === null && (
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-xl animate-[slide-in-from-bottom_0.6s_ease-out]">
                  <Heart className="w-16 h-16 text-white" />
                </div>
              </div>
            )}

            {currentStep >= 9 && recordPlantHealth === true && plants[currentPlantIndex] && (
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl animate-[slide-in-from-bottom_0.6s_ease-out]">
                  <Activity className="w-16 h-16 text-white" />
                </div>
              </div>
            )}

            {/* Title */}
            {currentStep < 9 && currentStepData && (
              <div className="text-center space-y-2 animate-[slide-in-from-bottom_0.7s_ease-out]">
                <h2 className="text-3xl font-bold text-gray-900">{currentStepData.title}</h2>
                <p className="text-lg text-gray-500">
                  {currentStep === 0 && "Selecione a estufa"}
                  {currentStep === 1 && "Qual a temperatura atual?"}
                  {currentStep === 2 && "Qual a umidade relativa?"}
                  {currentStep === 3 && "Quanto de água foi aplicado?"}
                  {currentStep === 4 && "Quanto de runoff foi coletado?"}
                  {currentStep === 5 && "Qual o pH da solução?"}
                  {currentStep === 6 && "Qual a condutividade elétrica?"}
                  {currentStep === 7 && "Qual a intensidade de luz?"}
                  {currentStep === 8 && "Revise os dados registrados"}
                </p>
              </div>
            )}

            {currentStep === 9 && recordPlantHealth === null && (
              <div className="text-center space-y-2 animate-[slide-in-from-bottom_0.7s_ease-out]">
                <h2 className="text-3xl font-bold text-gray-900">Saúde das Plantas</h2>
                <p className="text-lg text-gray-500">Deseja registrar a saúde das plantas?</p>
                <p className="text-sm text-gray-400">Você pode registrar a saúde das plantas desta estufa agora ou pular esta etapa.</p>
              </div>
            )}

            {currentStep >= 9 && recordPlantHealth === true && plants[currentPlantIndex] && (
              <div className="text-center space-y-2 animate-[slide-in-from-bottom_0.7s_ease-out]">
                <h2 className="text-3xl font-bold text-gray-900">{plants[currentPlantIndex].name}</h2>
                <p className="text-lg text-gray-500">Como está a saúde?</p>
              </div>
            )}

            {/* Step 0: Tent selection */}
            {currentStep === 0 && (
              <div className="space-y-3 animate-[slide-in-from-bottom_0.8s_ease-out]">
                {tents.map((tent) => (
                  <button
                    key={tent.id}
                    onClick={() => setTentId(tent.id)}
                    className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                      tentId === tent.id
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500 shadow-xl scale-105"
                        : "bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:shadow-lg"
                    }`}
                  >
                    <div className="font-bold text-xl">{tent.name}</div>
                    <div className="text-sm opacity-90">
                      {tent.category === "MAINTENANCE" ? "Manutenção" : 
                       tent.category === "VEGA" ? "Vegetativa" : 
                       tent.category === "FLORA" ? "Floração" : 
                       tent.category === "DRYING" ? "Secagem" : tent.category} • {tent.width}×{tent.depth}×{tent.height}cm
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 1: Temperature */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-[slide-in-from-bottom_0.8s_ease-out]">
                <div className="flex items-center justify-center gap-4">
                  <Input
                    type="number"
                    value={tempC}
                    onChange={(e) => setTempC(e.target.value)}
                    placeholder="25"
                    className="text-center text-4xl h-20 border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-orange-100"
                  />
                  <span className="text-4xl font-bold text-gray-400">°C</span>
                </div>
              </div>
            )}

            {/* Step 2: Humidity */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-[slide-in-from-bottom_0.8s_ease-out]">
                <div className="flex items-center justify-center gap-4">
                  <Input
                    type="number"
                    value={rhPct}
                    onChange={(e) => setRhPct(e.target.value)}
                    placeholder="60"
                    className="text-center text-4xl h-20 border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-blue-100"
                  />
                  <span className="text-4xl font-bold text-gray-400">%</span>
                </div>
              </div>
            )}

            {/* Step 3: Watering volume */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-[slide-in-from-bottom_0.8s_ease-out]">
                <div className="flex items-center justify-center gap-4">
                  <Input
                    type="number"
                    value={wateringVolume}
                    onChange={(e) => setWateringVolume(e.target.value)}
                    placeholder="2000"
                    className="text-center text-4xl h-20 border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-green-100"
                  />
                  <span className="text-4xl font-bold text-gray-400">ml</span>
                </div>
              </div>
            )}

            {/* Step 4: Runoff collected */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-[slide-in-from-bottom_0.8s_ease-out]">
                <div className="flex items-center justify-center gap-4">
                  <Input
                    type="number"
                    value={runoffCollected}
                    onChange={(e) => setRunoffCollected(e.target.value)}
                    placeholder="300"
                    className="text-center text-4xl h-20 border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-teal-100"
                  />
                  <span className="text-4xl font-bold text-gray-400">ml</span>
                </div>
                {runoffPercentage && (
                  <div className="text-center p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200 animate-[slide-in-from-bottom_0.9s_ease-out]">
                    <div className="text-sm text-gray-600">Porcentagem de Runoff</div>
                    <div className="text-3xl font-bold text-teal-600">{runoffPercentage}%</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {parseFloat(runoffPercentage) >= 15 && parseFloat(runoffPercentage) <= 20
                        ? "✓ Ideal"
                        : parseFloat(runoffPercentage) < 15
                        ? "⚠️ Baixo"
                        : "⚠️ Alto"}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: pH */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-[slide-in-from-bottom_0.8s_ease-out]">
                <div className="flex items-center justify-center gap-4">
                  <Input
                    type="number"
                    step="0.1"
                    value={ph}
                    onChange={(e) => setPh(e.target.value)}
                    placeholder="6.0"
                    className="text-center text-4xl h-20 border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-purple-100"
                  />
                  <span className="text-4xl font-bold text-gray-400">pH</span>
                </div>
              </div>
            )}

            {/* Step 6: EC */}
            {currentStep === 6 && (
              <div className="space-y-4 animate-[slide-in-from-bottom_0.8s_ease-out]">
                <div className="flex items-center justify-center gap-4">
                  <Input
                    type="number"
                    step="0.1"
                    value={ec}
                    onChange={(e) => setEc(e.target.value)}
                    placeholder="1.5"
                    className="text-center text-4xl h-20 border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-yellow-100"
                  />
                  <span className="text-4xl font-bold text-gray-400">mS/cm</span>
                </div>
              </div>
            )}

            {/* Step 7: PPFD */}
            {currentStep === 7 && (
              <div className="space-y-6 animate-[slide-in-from-bottom_0.8s_ease-out]">
                {/* Toggle AM/PM */}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setTurn("AM")}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      turn === "AM"
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105"
                        : "bg-white text-gray-600 border-2 border-gray-200"
                    }`}
                  >
                    ☀️ AM
                  </button>
                  <button
                    onClick={() => setTurn("PM")}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      turn === "PM"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105"
                        : "bg-white text-gray-600 border-2 border-gray-200"
                    }`}
                  >
                    🌙 PM
                  </button>
                </div>

                {/* PPFD Slider */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900">{ppfd}</div>
                    <div className="text-sm text-gray-500">μmol/m²/s</div>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="1500"
                      step="10"
                      value={ppfd}
                      onChange={(e) => setPpfd(parseInt(e.target.value))}
                      className="w-full h-10 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #fbbf24 0%, #f59e0b ${(ppfd / 1500) * 100}%, #e5e7eb ${(ppfd / 1500) * 100}%, #e5e7eb 100%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 8: Summary */}
            {currentStep === 8 && (
              <div className="space-y-3 animate-[slide-in-from-bottom_0.8s_ease-out]">
                {tempC && (
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-l-4 border-orange-500">
                    <div className="text-sm text-gray-600">Temperatura</div>
                    <div className="text-2xl font-bold text-gray-900">{tempC}°C</div>
                  </div>
                )}
                {rhPct && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-l-4 border-blue-500">
                    <div className="text-sm text-gray-600">Umidade</div>
                    <div className="text-2xl font-bold text-gray-900">{rhPct}%</div>
                  </div>
                )}
                {wateringVolume && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-500">
                    <div className="text-sm text-gray-600">Volume de Rega</div>
                    <div className="text-2xl font-bold text-gray-900">{wateringVolume} ml</div>
                  </div>
                )}
                {runoffCollected && (
                  <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border-l-4 border-teal-500">
                    <div className="text-sm text-gray-600">Runoff Coletado</div>
                    <div className="text-2xl font-bold text-gray-900">{runoffCollected} ml ({runoffPercentage}%)</div>
                  </div>
                )}
                {ph && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-l-4 border-purple-500">
                    <div className="text-sm text-gray-600">pH</div>
                    <div className="text-2xl font-bold text-gray-900">{ph}</div>
                  </div>
                )}
                {ec && (
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-l-4 border-yellow-500">
                    <div className="text-sm text-gray-600">EC</div>
                    <div className="text-2xl font-bold text-gray-900">{ec} mS/cm</div>
                  </div>
                )}
                {ppfd > 0 && (
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border-l-4 border-amber-500">
                    <div className="text-sm text-gray-600">PPFD ({turn})</div>
                    <div className="text-2xl font-bold text-gray-900">{ppfd} μmol/m²/s</div>
                  </div>
                )}
              </div>
            )}

            {/* Step 9: Plant health question */}
            {currentStep === 9 && recordPlantHealth === null && (
              <div className="space-y-4 animate-[slide-in-from-bottom_0.8s_ease-out]">
                <Button
                  onClick={() => setRecordPlantHealth(true)}
                  className="w-full h-16 text-lg font-semibold rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-lg"
                >
                  <Heart className="mr-2 h-6 w-6" />
                  Registrar Saúde das Plantas
                </Button>
                <Button
                  onClick={handleSaveDailyLog}
                  disabled={saveDailyLogMutation.isPending}
                  variant="outline"
                  className="w-full h-16 text-lg font-semibold rounded-2xl border-2"
                >
                  {saveDailyLogMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <SkipForward className="mr-2 h-6 w-6" />
                      Pular e Finalizar
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 10+: Plant health form (expanded) */}
            {currentStep >= 9 && recordPlantHealth === true && plants[currentPlantIndex] && (
              <div className="space-y-4">
                {/* Plant info */}
                <div className="p-4 bg-white rounded-xl shadow-lg border-l-4 border-emerald-500 mb-6">
                  <div className="text-sm text-gray-500">Planta {currentPlantIndex + 1} de {plants.length}</div>
                  <div className="font-bold text-lg text-gray-900">{plants[currentPlantIndex].name}</div>
                  <div className="text-sm text-gray-600">{plants[currentPlantIndex].code}</div>
                </div>

                <Accordion type="multiple" defaultValue={["health"]} className="space-y-3">
                  {/* Health Status Section */}
                  <AccordionItem value="health" className="border rounded-xl bg-white shadow-sm">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-emerald-600" />
                        <span className="font-semibold">Status de Saúde</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      {/* Status selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <div className="grid grid-cols-3 gap-2">
                          {["healthy", "attention", "sick"].map((status) => (
                            <button
                              key={status}
                              onClick={() => updatePlantHealthRecord(plants[currentPlantIndex].id, "status", status)}
                              className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                                (plantHealthRecords.get(plants[currentPlantIndex].id)?.status || "healthy") === status
                                  ? status === "healthy"
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                                    : status === "attention"
                                    ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg"
                                    : "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg"
                                  : "bg-white text-gray-600 border-2 border-gray-200"
                              }`}
                            >
                              {status === "healthy" ? "✓ Saudável" : status === "attention" ? "⚠️ Atenção" : "✗ Doente"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Symptoms */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sintomas (opcional)</label>
                        <Input
                          value={plantHealthRecords.get(plants[currentPlantIndex].id)?.symptoms || ""}
                          onChange={(e) => updatePlantHealthRecord(plants[currentPlantIndex].id, "symptoms", e.target.value)}
                          placeholder="Ex: Folhas amareladas, manchas..."
                          className="h-12 border-2 border-gray-300 rounded-xl bg-white shadow-sm"
                        />
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                        <Textarea
                          value={plantHealthRecords.get(plants[currentPlantIndex].id)?.notes || ""}
                          onChange={(e) => updatePlantHealthRecord(plants[currentPlantIndex].id, "notes", e.target.value)}
                          placeholder="Observações gerais..."
                          className="min-h-[80px] border-2 border-gray-300 rounded-xl bg-white shadow-sm"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Photo Section */}
                  <AccordionItem value="photo" className="border rounded-xl bg-white shadow-sm">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Foto (opcional)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      <div className="space-y-3">
                        {plantHealthRecords.get(plants[currentPlantIndex].id)?.photoBase64 ? (
                          <div className="relative">
                            <img
                              src={plantHealthRecords.get(plants[currentPlantIndex].id)?.photoBase64}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-xl"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => updatePlantHealthRecord(plants[currentPlantIndex].id, "photoBase64", undefined)}
                              className="absolute top-2 right-2"
                            >
                              Remover
                            </Button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Tirar foto ou selecionar</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handlePhotoCapture}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Trichomes Section */}
                  <AccordionItem value="trichomes" className="border rounded-xl bg-white shadow-sm">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold">Tricomas (opcional)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      {/* Trichome status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(["clear", "cloudy", "amber", "mixed"] as TrichomeStatus[]).map((status) => (
                            <button
                              key={status}
                              onClick={() => updatePlantHealthRecord(plants[currentPlantIndex].id, "trichomeStatus", status)}
                              className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                                plantHealthRecords.get(plants[currentPlantIndex].id)?.trichomeStatus === status
                                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                                  : "bg-white text-gray-600 border-2 border-gray-200"
                              }`}
                            >
                              {status === "clear" ? "💧 Clear" : status === "cloudy" ? "☁️ Cloudy" : status === "amber" ? "🟠 Amber" : "🌈 Mixed"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Percentages (only if mixed) */}
                      {plantHealthRecords.get(plants[currentPlantIndex].id)?.trichomeStatus === "mixed" && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Clear %</label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={plantHealthRecords.get(plants[currentPlantIndex].id)?.trichomeClear || ""}
                              onChange={(e) => updatePlantHealthRecord(plants[currentPlantIndex].id, "trichomeClear", parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="h-10"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Cloudy %</label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={plantHealthRecords.get(plants[currentPlantIndex].id)?.trichomeCloudy || ""}
                              onChange={(e) => updatePlantHealthRecord(plants[currentPlantIndex].id, "trichomeCloudy", parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="h-10"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Amber %</label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={plantHealthRecords.get(plants[currentPlantIndex].id)?.trichomeAmber || ""}
                              onChange={(e) => updatePlantHealthRecord(plants[currentPlantIndex].id, "trichomeAmber", parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="h-10"
                            />
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* LST Section */}
                  <AccordionItem value="lst" className="border rounded-xl bg-white shadow-sm">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-green-600" />
                        <span className="font-semibold">Técnicas LST (opcional)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      {/* LST techniques grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {LST_TECHNIQUES.map((technique) => {
                          const isSelected = (plantHealthRecords.get(plants[currentPlantIndex].id)?.lstTechniques || []).includes(technique.id);
                          return (
                            <button
                              key={technique.id}
                              onClick={() => toggleLSTTechnique(plants[currentPlantIndex].id, technique.id)}
                              className={`p-3 rounded-xl text-left transition-all duration-300 ${
                                isSelected
                                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                                  : "bg-white text-gray-700 border-2 border-gray-200"
                              }`}
                            >
                              <div className="text-2xl mb-1">{technique.icon}</div>
                              <div className="font-semibold text-sm">{technique.name}</div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Plant response */}
                      {(plantHealthRecords.get(plants[currentPlantIndex].id)?.lstTechniques || []).length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Resposta da Planta (opcional)</label>
                          <Textarea
                            value={plantHealthRecords.get(plants[currentPlantIndex].id)?.lstResponse || ""}
                            onChange={(e) => updatePlantHealthRecord(plants[currentPlantIndex].id, "lstResponse", e.target.value)}
                            placeholder="Como a planta respondeu à técnica?"
                            className="min-h-[60px]"
                          />
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress dots - only show for daily log steps */}
      {currentStep < 9 && (
        <div className="flex justify-center gap-2 py-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-8 bg-green-500"
                  : index < currentStep
                  ? "w-2 bg-green-300"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200 flex gap-3">
        {/* Back button - only for daily log steps */}
        {currentStep > 0 && currentStep < 9 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="flex-1 h-14 text-lg font-medium rounded-xl"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar
          </Button>
        )}

        {/* Next/Save button for daily log */}
        {currentStep < 8 && (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canGoNext()}
            className="flex-1 h-14 text-lg font-medium rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            Próximo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}

        {/* Continue button on summary */}
        {currentStep === 8 && (
          <Button
            onClick={() => setCurrentStep(9)}
            className="flex-1 h-14 text-lg font-medium rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Check className="mr-2 h-5 w-5" />
            Continuar
          </Button>
        )}

        {/* Plant health navigation */}
        {currentStep >= 9 && recordPlantHealth === true && plants[currentPlantIndex] && (
          <>
            <Button
              onClick={handleSkipPlantHealth}
              variant="outline"
              className="flex-1 h-14 text-lg font-medium rounded-xl"
            >
              <SkipForward className="mr-2 h-5 w-5" />
              Pular
            </Button>
            <Button
              onClick={handleSavePlantHealth}
              disabled={savePlantHealthMutation.isPending || uploadPhotoMutation.isPending}
              className="flex-1 h-14 text-lg font-medium rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {(savePlantHealthMutation.isPending || uploadPhotoMutation.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : currentPlantIndex < plants.length - 1 ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Próxima Planta
                </>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Finalizar
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

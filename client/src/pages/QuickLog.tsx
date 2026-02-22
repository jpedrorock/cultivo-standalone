import { useState, useMemo } from "react";
import { useSwipeable } from "react-swipeable";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Home, ThermometerSun, Droplets, Sprout, Droplet, TestTube, Zap, Sun, Check, ArrowLeft, ArrowRight, Heart, SkipForward, Activity } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function QuickLog() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [turn, setTurn] = useState<"AM" | "PM">("AM");
  
  // Form state - Daily Log
  const [tentId, setTentId] = useState<number | null>(null);
  const [tempC, setTempC] = useState("");
  const [rhPct, setRhPct] = useState("");
  const [wateringVolume, setWateringVolume] = useState("");
  const [runoffCollected, setRunoffCollected] = useState("");
  const [ph, setPh] = useState("");
  const [ec, setEc] = useState("");
  const [ppfd, setPpfd] = useState(0);

  // Plant health state
  const [recordPlantHealth, setRecordPlantHealth] = useState<boolean | null>(null);
  const [currentPlantIndex, setCurrentPlantIndex] = useState(0);
  const [plantHealthRecords, setPlantHealthRecords] = useState<Map<number, { status: string; symptoms: string; notes: string }>>(new Map());

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

  // Save plant health mutation
  const savePlantHealthMutation = trpc.plantHealth.create.useMutation({
    onSuccess: () => {
      // Move to next plant or finish
      if (currentPlantIndex < plants.length - 1) {
        setCurrentPlantIndex(currentPlantIndex + 1);
      } else {
        // All plants done
        toast.success("✅ Registros de saúde salvos com sucesso!");
        resetForm();
        setTimeout(() => setLocation("/"), 1500);
      }
    },
    onError: (error: any) => {
      toast.error(`Erro ao salvar saúde: ${error.message}`);
    },
  });

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

  const handleSaveDailyLog = () => {
    if (!tentId) {
      toast.error("Selecione uma estufa");
      return;
    }

    saveDailyLogMutation.mutate({
      tentId,
      logDate: new Date(),
      turn,
      tempC: tempC && tempC.trim() !== "" ? tempC : undefined,
      rhPct: rhPct && rhPct.trim() !== "" ? rhPct : undefined,
      ppfd: ppfd > 0 ? ppfd : undefined,
      ph: ph && ph.trim() !== "" ? ph : undefined,
      ec: ec && ec.trim() !== "" ? ec : undefined,
      wateringVolume: wateringVolume && wateringVolume.trim() !== "" ? parseInt(wateringVolume) : undefined,
      runoffCollected: runoffCollected && runoffCollected.trim() !== "" ? parseInt(runoffCollected) : undefined,
      notes: undefined,
    });
  };

  const handleSavePlantHealth = () => {
    const plant = plants[currentPlantIndex];
    if (!plant) return;

    const record = plantHealthRecords.get(plant.id) || { status: "healthy", symptoms: "", notes: "" };

    // Map status to healthStatus enum
    const healthStatus = record.status === "healthy" ? "HEALTHY" : record.status === "attention" ? "STRESSED" : "SICK";

    savePlantHealthMutation.mutate({
      plantId: plant.id,
      healthStatus: healthStatus as "HEALTHY" | "STRESSED" | "SICK" | "RECOVERING",
      symptoms: record.symptoms || undefined,
      treatment: undefined,
      notes: record.notes || undefined,
    });
  };

  const handleSkipPlantHealth = () => {
    if (currentPlantIndex < plants.length - 1) {
      setCurrentPlantIndex(currentPlantIndex + 1);
    } else {
      toast.success("✅ Registro diário salvo!");
      resetForm();
      setTimeout(() => setLocation("/"), 1500);
    }
  };

  const updatePlantHealthRecord = (plantId: number, field: string, value: string) => {
    const current = plantHealthRecords.get(plantId) || { status: "healthy", symptoms: "", notes: "" };
    setPlantHealthRecords(new Map(plantHealthRecords.set(plantId, { ...current, [field]: value })));
  };

  // Steps configuration
  const steps = [
    {
      id: 0,
      icon: Home,
      title: "Selecione a Estufa",
      subtitle: "Qual estufa você vai registrar?",
      color: "from-emerald-400 to-green-500",
    },
    {
      id: 1,
      icon: ThermometerSun,
      title: "Temperatura",
      subtitle: "Digite a temperatura da estufa",
      color: "from-orange-400 to-red-500",
    },
    {
      id: 2,
      icon: Droplets,
      title: "Umidade",
      subtitle: "Digite a umidade relativa",
      color: "from-blue-400 to-cyan-500",
    },
    {
      id: 3,
      icon: Sprout,
      title: "Volume Regado",
      subtitle: "Quanto você regou?",
      color: "from-green-400 to-emerald-500",
    },
    {
      id: 4,
      icon: Droplet,
      title: "Runoff Coletado",
      subtitle: "Quanto runoff foi coletado?",
      color: "from-cyan-400 to-blue-500",
    },
    {
      id: 5,
      icon: TestTube,
      title: "pH",
      subtitle: "Meça e registre o pH",
      color: "from-purple-400 to-pink-500",
    },
    {
      id: 6,
      icon: Zap,
      title: "EC",
      subtitle: "Meça e registre a EC",
      color: "from-yellow-400 to-orange-500",
    },
    {
      id: 7,
      icon: Sun,
      title: "PPFD",
      subtitle: "Meça o PPFD com o medidor",
      color: "from-amber-400 to-yellow-500",
    },
    {
      id: 8,
      icon: Check,
      title: "Resumo",
      subtitle: "Confira os dados antes de salvar",
      color: "from-green-400 to-emerald-600",
    },
  ];

  // Determine current step data
  let currentStepData: { id: number; icon: any; title: string; subtitle: string; color: string };
  let Icon: any;

  if (currentStep < 9) {
    currentStepData = steps[currentStep];
    Icon = currentStepData.icon;
  } else if (currentStep === 9 && recordPlantHealth === null) {
    // Step 9: Ask if user wants to record plant health
    currentStepData = {
      id: 9,
      icon: Heart,
      title: "Saúde das Plantas",
      subtitle: "Deseja registrar a saúde das plantas?",
      color: "from-pink-400 to-rose-500",
    };
    Icon = currentStepData.icon;
  } else {
    // Step 10+: Plant health for each plant
    const plant = plants[currentPlantIndex];
    currentStepData = {
      id: 10 + currentPlantIndex,
      icon: Activity,
      title: plant?.name || "Planta",
      subtitle: `${plant?.code || ""} - Como está a saúde?`,
      color: "from-emerald-400 to-teal-500",
    };
    Icon = currentStepData.icon;
  }

  const canGoNext = () => {
    if (currentStep === 0) return tentId !== null;
    return true; // All other steps are optional
  };

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentStep < steps.length - 1 && canGoNext()) {
        setCurrentStep(currentStep + 1);
      }
    },
    onSwipedRight: () => {
      if (currentStep > 0 && currentStep < 9) {
        setCurrentStep(currentStep - 1);
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
    delta: 50,
  });

  // Calculate total steps for progress indicator
  const totalSteps = recordPlantHealth === true ? 9 + plants.length : 9;
  const currentStepNumber = currentStep >= 9 && recordPlantHealth === true ? 9 + currentPlantIndex : currentStep;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col">
      {/* Header with back button */}
      <div className="p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium text-gray-600">
          Passo {currentStepNumber + 1} de {totalSteps}
        </span>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Main content */}
      <div
        {...(currentStep < 9 ? swipeHandlers : {})}
        className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full"
      >
        {/* Icon with dashed circle */}
        <div className="relative mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${currentStepData.color} flex items-center justify-center shadow-2xl`}>
            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon className="w-14 h-14 text-white stroke-[1.5]" />
            </div>
          </div>
          {/* Dashed circle decoration */}
          <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-dashed border-green-300/40 animate-spin" style={{ animationDuration: "20s" }} />
        </div>

        {/* Title and subtitle */}
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          {currentStepData.title}
        </h2>
        <p className="text-lg text-gray-500 mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-900">
          {currentStepData.subtitle}
        </p>

        {/* Step content */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Step 0: Tent selection */}
          {currentStep === 0 && (
            <div className="space-y-3">
              {tentsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </div>
              ) : (
                tents.map((tent) => (
                  <button
                    key={tent.id}
                    onClick={() => setTentId(tent.id)}
                    className={`w-full p-6 rounded-2xl shadow-lg transition-all duration-300 text-left ${
                      tentId === tent.id
                        ? "bg-white border-2 border-green-500 ring-4 ring-green-100"
                        : "bg-white border-2 border-gray-200 hover:border-green-300 hover:shadow-xl"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-lg text-gray-900">{tent.name}</div>
                        <div className="text-sm text-gray-500">{tent.width}x{tent.depth}x{tent.height}cm</div>
                      </div>
                      {tentId === tent.id && (
                        <Check className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Step 1: Temperature */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setTurn("AM")}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    turn === "AM"
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg"
                      : "bg-white text-gray-600 border-2 border-gray-200"
                  }`}
                >
                  ☀️ Manhã
                </button>
                <button
                  onClick={() => setTurn("PM")}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    turn === "PM"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                      : "bg-white text-gray-600 border-2 border-gray-200"
                  }`}
                >
                  🌙 Tarde
                </button>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={tempC}
                  onChange={(e) => setTempC(e.target.value)}
                  placeholder="24"
                  className="h-20 text-4xl text-center font-bold border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-green-100"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl text-gray-400">°C</span>
              </div>
              <p className="text-sm text-gray-500 text-center">Ideal: 20-28°C</p>
            </div>
          )}

          {/* Step 2: Humidity */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="number"
                  step="1"
                  value={rhPct}
                  onChange={(e) => setRhPct(e.target.value)}
                  placeholder="60"
                  className="h-20 text-4xl text-center font-bold border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-green-100"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl text-gray-400">%</span>
              </div>
              <p className="text-sm text-gray-500 text-center">Ideal: 50-70%</p>
            </div>
          )}

          {/* Step 3: Watering Volume */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="number"
                  value={wateringVolume}
                  onChange={(e) => setWateringVolume(e.target.value)}
                  placeholder="1000"
                  className="h-20 text-4xl text-center font-bold border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-green-100"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl text-gray-400">ml</span>
              </div>
            </div>
          )}

          {/* Step 4: Runoff */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="number"
                  value={runoffCollected}
                  onChange={(e) => setRunoffCollected(e.target.value)}
                  placeholder="200"
                  className="h-20 text-4xl text-center font-bold border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-green-100"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl text-gray-400">ml</span>
              </div>
              {runoffPercentage && (
                <div className="p-4 bg-white rounded-xl shadow-lg text-center">
                  <div className="text-3xl font-bold text-green-600">{runoffPercentage}%</div>
                  <div className="text-sm text-gray-500">Runoff calculado</div>
                  <div className="text-xs text-gray-400 mt-1">✓ Ideal: 10-20%</div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: pH */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                  placeholder="6.0"
                  className="h-20 text-4xl text-center font-bold border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-green-100"
                />
              </div>
              <p className="text-sm text-gray-500 text-center">Ideal: 5.5-6.5</p>
            </div>
          )}

          {/* Step 6: EC */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={ec}
                  onChange={(e) => setEc(e.target.value)}
                  placeholder="1.5"
                  className="h-20 text-4xl text-center font-bold border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-green-100"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl text-gray-400">mS/cm</span>
              </div>
            </div>
          )}

          {/* Step 7: PPFD */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="number"
                  value={ppfd}
                  onChange={(e) => setPpfd(parseInt(e.target.value) || 0)}
                  placeholder="600"
                  className="h-20 text-4xl text-center font-bold border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-green-100"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl text-gray-400">µmol/m²/s</span>
              </div>
              <input
                type="range"
                min="0"
                max="1500"
                step="50"
                value={ppfd}
                onChange={(e) => setPpfd(parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 rounded-full appearance-none cursor-pointer"
              />
            </div>
          )}

          {/* Step 8: Summary */}
          {currentStep === 8 && (
            <div className="space-y-3">
              {tentId && (
                <div className="p-4 bg-white rounded-xl shadow-lg border-l-4 border-green-500">
                  <div className="text-sm text-gray-500">Estufa</div>
                  <div className="font-semibold text-gray-900">{tents.find(t => t.id === tentId)?.name}</div>
                </div>
              )}
              {tempC && (
                <div className="p-4 bg-white rounded-xl shadow-lg border-l-4 border-orange-500">
                  <div className="text-sm text-gray-500">Temperatura ({turn})</div>
                  <div className="font-semibold text-gray-900">{tempC}°C</div>
                </div>
              )}
              {rhPct && (
                <div className="p-4 bg-white rounded-xl shadow-lg border-l-4 border-blue-500">
                  <div className="text-sm text-gray-500">Umidade</div>
                  <div className="font-semibold text-gray-900">{rhPct}%</div>
                </div>
              )}
              {wateringVolume && (
                <div className="p-4 bg-white rounded-xl shadow-lg border-l-4 border-green-500">
                  <div className="text-sm text-gray-500">Volume Regado</div>
                  <div className="font-semibold text-gray-900">{wateringVolume}ml</div>
                </div>
              )}
              {runoffCollected && (
                <div className="p-4 bg-white rounded-xl shadow-lg border-l-4 border-cyan-500">
                  <div className="text-sm text-gray-500">Runoff ({runoffPercentage}%)</div>
                  <div className="font-semibold text-gray-900">{runoffCollected}ml</div>
                </div>
              )}
              {ph && (
                <div className="p-4 bg-white rounded-xl shadow-lg border-l-4 border-purple-500">
                  <div className="text-sm text-gray-500">pH</div>
                  <div className="font-semibold text-gray-900">{ph}</div>
                </div>
              )}
              {ec && (
                <div className="p-4 bg-white rounded-xl shadow-lg border-l-4 border-yellow-500">
                  <div className="text-sm text-gray-500">EC</div>
                  <div className="font-semibold text-gray-900">{ec} mS/cm</div>
                </div>
              )}
              {ppfd > 0 && (
                <div className="p-4 bg-white rounded-xl shadow-lg border-l-4 border-amber-500">
                  <div className="text-sm text-gray-500">PPFD</div>
                  <div className="font-semibold text-gray-900">{ppfd} µmol/m²/s</div>
                </div>
              )}
            </div>
          )}

          {/* Step 9: Ask about plant health */}
          {currentStep === 9 && recordPlantHealth === null && (
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-6">
                Você pode registrar a saúde das plantas desta estufa agora ou pular esta etapa.
              </p>
              <Button
                onClick={() => {
                  setRecordPlantHealth(true);
                  if (plants.length > 0) {
                    setCurrentStep(9); // Stay on step 9 but show first plant
                  } else {
                    toast.info("Nenhuma planta nesta estufa");
                    setRecordPlantHealth(false);
                    handleSaveDailyLog();
                  }
                }}
                className="w-full h-16 text-lg font-medium rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
              >
                <Heart className="mr-2 h-6 w-6" />
                Registrar Saúde das Plantas
              </Button>
              <Button
                onClick={() => {
                  setRecordPlantHealth(false);
                  handleSaveDailyLog();
                }}
                variant="outline"
                className="w-full h-16 text-lg font-medium rounded-xl"
              >
                <SkipForward className="mr-2 h-6 w-6" />
                Pular e Finalizar
              </Button>
            </div>
          )}

          {/* Step 10+: Plant health for each plant */}
          {currentStep >= 9 && recordPlantHealth === true && plants[currentPlantIndex] && (
            <div className="space-y-4">
              {/* Plant info */}
              <div className="p-4 bg-white rounded-xl shadow-lg border-l-4 border-emerald-500 mb-6">
                <div className="text-sm text-gray-500">Planta {currentPlantIndex + 1} de {plants.length}</div>
                <div className="font-bold text-lg text-gray-900">{plants[currentPlantIndex].name}</div>
                <div className="text-sm text-gray-600">{plants[currentPlantIndex].code}</div>
              </div>

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
                  className="h-12 border-2 border-gray-300 rounded-xl bg-white shadow-lg focus:ring-4 focus:ring-green-100"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                <Textarea
                  value={plantHealthRecords.get(plants[currentPlantIndex].id)?.notes || ""}
                  onChange={(e) => updatePlantHealthRecord(plants[currentPlantIndex].id, "notes", e.target.value)}
                  placeholder="Observações gerais..."
                  className="min-h-[80px] border-2 border-gray-300 rounded-xl bg-white shadow-lg focus:ring-4 focus:ring-green-100"
                />
              </div>
            </div>
          )}
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
      <div className="p-6 bg-white border-t border-gray-200 flex gap-3">
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
              disabled={savePlantHealthMutation.isPending}
              className="flex-1 h-14 text-lg font-medium rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {savePlantHealthMutation.isPending ? (
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

import { useState, useMemo } from "react";
import { useSwipeable } from "react-swipeable";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Home, ThermometerSun, Droplets, Sprout, Droplet, TestTube, Zap, Sun, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function QuickLog() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [turn, setTurn] = useState<"AM" | "PM">("AM");
  
  // Form state
  const [tentId, setTentId] = useState<number | null>(null);
  const [tempC, setTempC] = useState("");
  const [rhPct, setRhPct] = useState("");
  const [wateringVolume, setWateringVolume] = useState("");
  const [runoffCollected, setRunoffCollected] = useState("");
  const [ph, setPh] = useState("");
  const [ec, setEc] = useState("");
  const [ppfd, setPpfd] = useState(0);

  // Fetch tents for selection
  const { data: tents = [], isLoading: tentsLoading } = trpc.tents.list.useQuery();

  // Calculate runoff percentage
  const runoffPercentage = useMemo(() => {
    const watering = parseFloat(wateringVolume);
    const runoff = parseFloat(runoffCollected);
    if (!watering || !runoff || watering === 0) return null;
    return ((runoff / watering) * 100).toFixed(1);
  }, [wateringVolume, runoffCollected]);

  // Save mutation
  const saveMutation = trpc.dailyLogs.create.useMutation({
    onSuccess: () => {
      toast.success("✅ Registro salvo com sucesso!");
      setCurrentStep(0);
      setTentId(null);
      setTempC("");
      setRhPct("");
      setWateringVolume("");
      setRunoffCollected("");
      setPh("");
      setEc("");
      setPpfd(0);
      setTimeout(() => setLocation("/"), 1500);
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  const handleSave = () => {
    if (!tentId) {
      toast.error("Selecione uma estufa");
      return;
    }

    saveMutation.mutate({
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

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

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
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
    delta: 50,
  });

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
          Passo {currentStep + 1} de {steps.length}
        </span>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Main content */}
      <div
        {...swipeHandlers}
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
          {currentStepData.title}
        </h2>
        <p className="text-lg text-gray-500 mb-12 text-center animate-in fade-in slide-in-from-bottom-6 duration-900">
          {currentStepData.subtitle}
        </p>

        {/* Step content */}
        <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-7 duration-1000">
          {/* Step 0: Tent Selection */}
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
                    className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 bg-white shadow-lg hover:shadow-xl ${
                      tentId === tent.id
                        ? "border-green-500 ring-4 ring-green-100"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <div className="font-semibold text-lg text-gray-900">{tent.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{tent.category}</div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Step 1: Temperature */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setTurn("AM")}
                  className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all duration-300 ${
                    turn === "AM"
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg"
                      : "bg-white text-gray-600 border-2 border-gray-200"
                  }`}
                >
                  ☀️ Manhã
                </button>
                <button
                  onClick={() => setTurn("PM")}
                  className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all duration-300 ${
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
                  value={tempC}
                  onChange={(e) => setTempC(e.target.value)}
                  placeholder="25.0"
                  className="h-20 text-4xl text-center font-bold border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-green-100"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl text-gray-400">°C</span>
              </div>
              <p className="text-center text-sm text-gray-500">Ideal: 20-28°C</p>
            </div>
          )}

          {/* Step 2: Humidity */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="number"
                  value={rhPct}
                  onChange={(e) => setRhPct(e.target.value)}
                  placeholder="60"
                  className="h-20 text-4xl text-center font-bold border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-green-100"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl text-gray-400">%</span>
              </div>
              <p className="text-center text-sm text-gray-500">Ideal: 50-70%</p>
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
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl text-gray-400">ml</span>
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
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl text-gray-400">ml</span>
              </div>
              {runoffPercentage && (
                <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                  <div className="text-3xl font-bold text-green-600">{runoffPercentage}%</div>
                  <div className="text-sm text-gray-500 mt-1">Runoff calculado</div>
                  <div className="text-xs text-gray-400 mt-2">✓ Ideal: 10-20%</div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: pH */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <Input
                type="number"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(e.target.value)}
                placeholder="6.0"
                className="h-20 text-4xl text-center font-bold border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-green-100"
              />
              <p className="text-center text-sm text-gray-500">Ideal: 5.5-6.5</p>
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
        </div>
      </div>

      {/* Progress dots */}
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

      {/* Navigation buttons */}
      <div className="p-6 bg-white border-t border-gray-200 flex gap-3">
        {currentStep > 0 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="flex-1 h-14 text-lg font-medium rounded-xl"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar
          </Button>
        )}
        {currentStep < steps.length - 1 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canGoNext()}
            className="flex-1 h-14 text-lg font-medium rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            Próximo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex-1 h-14 text-lg font-medium rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Salvar Registro
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

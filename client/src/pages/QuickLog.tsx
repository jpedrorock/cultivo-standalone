import { useState, useMemo } from "react";
import { useSwipeable } from "react-swipeable";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, ThermometerSun, Droplets, Sun, Beaker, FlaskConical, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Link, useLocation } from "wouter";
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

  // Swipe handlers for touch navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      // Swipe left = next step
      if (currentStep < steps.length - 1 && canGoNext()) {
        setCurrentStep(currentStep + 1);
      }
    },
    onSwipedRight: () => {
      // Swipe right = previous step
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true, // Enable mouse swipe for desktop testing
    delta: 50, // Minimum swipe distance
  });

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
      // Reset form
      setCurrentStep(0);
      setTentId(null);
      setTempC("");
      setRhPct("");
      setWateringVolume("");
      setRunoffCollected("");
      setPh("");
      setEc("");
      setPpfd(0);
      // Navigate to home
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

  const steps = [
    {
      id: 0,
      title: "Selecione a Estufa",
      icon: "🏠",
      description: "Qual estufa você vai registrar?",
      content: (
        <div className="space-y-4">
          {tentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-3">
              {tents.map((tent: any) => (
                <button
                  key={tent.id}
                  onClick={() => setTentId(tent.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    tentId === tent.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{tent.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {tent.category === "MAINTENANCE" && "Manutenção"}
                        {tent.category === "VEGA" && "Vegetativa"}
                        {tent.category === "FLORA" && "Floração"}
                      </p>
                    </div>
                    {tentId === tent.id && (
                      <Check className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 1,
      title: "Temperatura",
      icon: "🌡️",
      description: "Digite a temperatura da estufa",
      content: (
        <div className="space-y-4">
          <div className="flex justify-center gap-2 mb-6">
            <Button
              variant={turn === "AM" ? "default" : "outline"}
              onClick={() => setTurn("AM")}
              className="flex-1"
            >
              ☀️ Manhã
            </Button>
            <Button
              variant={turn === "PM" ? "default" : "outline"}
              onClick={() => setTurn("PM")}
              className="flex-1"
            >
              🌙 Noite
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="temp" className="text-lg">Temperatura (°C)</Label>
            <Input
              id="temp"
              type="number"
              step="0.1"
              placeholder="Ex: 25.0"
              value={tempC}
              onChange={(e) => setTempC(e.target.value)}
              className="text-2xl h-16 text-center"
              autoFocus
            />
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Umidade",
      icon: "💧",
      description: "Digite a umidade relativa",
      content: (
        <div className="space-y-4">
          <Label htmlFor="rh" className="text-lg">Umidade Relativa (%)</Label>
          <Input
            id="rh"
            type="number"
            step="0.1"
            placeholder="Ex: 65.0"
            value={rhPct}
            onChange={(e) => setRhPct(e.target.value)}
            className="text-2xl h-16 text-center"
            autoFocus
          />
        </div>
      ),
    },
    {
      id: 3,
      title: "Volume Regado",
      icon: "🚿",
      description: "Qual foi o volume regado?",
      content: (
        <div className="space-y-4">
          <Label htmlFor="watering" className="text-lg">Volume Regado (ml)</Label>
          <Input
            id="watering"
            type="number"
            placeholder="Ex: 1000"
            value={wateringVolume}
            onChange={(e) => setWateringVolume(e.target.value)}
            className="text-2xl h-16 text-center"
            autoFocus
          />
        </div>
      ),
    },
    {
      id: 4,
      title: "Runoff Coletado",
      icon: "💦",
      description: "Quanto runoff foi coletado?",
      content: (
        <div className="space-y-4">
          <Label htmlFor="runoff" className="text-lg">Runoff Coletado (ml)</Label>
          <Input
            id="runoff"
            type="number"
            placeholder="Ex: 200"
            value={runoffCollected}
            onChange={(e) => setRunoffCollected(e.target.value)}
            className="text-2xl h-16 text-center"
            autoFocus
          />
          {runoffPercentage && (
            <div className="bg-cyan-500/10 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Runoff Calculado</p>
              <p className="text-3xl font-bold text-cyan-600">{runoffPercentage}%</p>
              <p className="text-xs text-muted-foreground mt-1">✓ Ideal: 10-20%</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 5,
      title: "pH",
      icon: "🧪",
      description: "Meça e registre o pH",
      content: (
        <div className="space-y-4">
          <Label htmlFor="ph" className="text-lg">pH</Label>
          <Input
            id="ph"
            type="number"
            step="0.1"
            placeholder="Ex: 6.2"
            value={ph}
            onChange={(e) => setPh(e.target.value)}
            className="text-2xl h-16 text-center"
            autoFocus
          />
        </div>
      ),
    },
    {
      id: 6,
      title: "EC",
      icon: "⚡",
      description: "Meça e registre a EC",
      content: (
        <div className="space-y-4">
          <Label htmlFor="ec" className="text-lg">EC (mS/cm)</Label>
          <Input
            id="ec"
            type="number"
            step="0.1"
            placeholder="Ex: 1.6"
            value={ec}
            onChange={(e) => setEc(e.target.value)}
            className="text-2xl h-16 text-center"
            autoFocus
          />
        </div>
      ),
    },
    {
      id: 7,
      title: "PPFD",
      icon: "☀️",
      description: "Meça o PPFD com o medidor",
      content: (
        <div className="space-y-4">
          <Label htmlFor="ppfd" className="text-lg">PPFD (µmol/m²/s)</Label>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-yellow-600">{ppfd}</p>
          </div>
          <input
            id="ppfd"
            type="range"
            min="0"
            max="1000"
            step="10"
            value={ppfd}
            onChange={(e) => setPpfd(parseInt(e.target.value))}
            className="w-full h-10 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>500</span>
            <span>1000</span>
          </div>
        </div>
      ),
    },
    {
      id: 8,
      title: "Resumo",
      icon: "✅",
      description: "Confira os dados antes de salvar",
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-500/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">🌡️ Temperatura</p>
              <p className="text-lg font-bold">{tempC || "--"}°C</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">💧 Umidade</p>
              <p className="text-lg font-bold">{rhPct || "--"}%</p>
            </div>
            <div className="bg-cyan-500/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">🚿 Regado</p>
              <p className="text-lg font-bold">{wateringVolume || "--"}ml</p>
            </div>
            <div className="bg-cyan-500/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">💦 Runoff</p>
              <p className="text-lg font-bold">{runoffCollected || "--"}ml</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">🧪 pH</p>
              <p className="text-lg font-bold">{ph || "--"}</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">⚡ EC</p>
              <p className="text-lg font-bold">{ec || "--"} mS/cm</p>
            </div>
            <div className="bg-yellow-500/10 rounded-lg p-3 col-span-2">
              <p className="text-xs text-muted-foreground mb-1">☀️ PPFD</p>
              <p className="text-lg font-bold">{ppfd} µmol/m²/s</p>
            </div>
          </div>
          {runoffPercentage && (
            <div className="bg-cyan-500/10 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Runoff Calculado</p>
              <p className="text-2xl font-bold text-cyan-600">{runoffPercentage}%</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const canGoNext = () => {
    if (currentStep === 0) return tentId !== null;
    return true; // Allow skipping optional fields
  };

  return (
    <div {...swipeHandlers} className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Registro Rápido</h1>
              <p className="text-sm text-muted-foreground">
                Passo {currentStep + 1} de {steps.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="container py-4">
        <div className="flex gap-1">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`h-2 flex-1 rounded-full transition-all ${
                index <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container py-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{currentStepData.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </div>

            <div className="min-h-[200px]">
              {currentStepData.content}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 z-50">
        <div className="container max-w-md mx-auto flex gap-3">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          {!isLastStep ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canGoNext()}
              className="flex-1"
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex-1"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Salvar Registro
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

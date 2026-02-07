import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Beaker, Droplets, FlaskConical, Leaf, Box, Zap, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Phase = "vegetativa" | "floracao";

interface NutrientResult {
  ca: number; // Cálcio (ppm)
  mg: number; // Magnésio (ppm)
  fe: number; // Ferro (ppm)
  caMl: number; // Cálcio em ml/L
  mgMl: number; // Magnésio em ml/L
  feMl: number; // Ferro em ml/L
}

interface NutrientInfo {
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  function: string;
  deficiencySymptoms: string[];
  applicationTips: string;
}

export default function FertilizationCalculator() {
  const [volume, setVolume] = useState<string>("");
  const [phase, setPhase] = useState<Phase>("vegetativa");
  const [result, setResult] = useState<NutrientResult | null>(null);

  // Concentrações ideais por fase (ppm)
  const targetConcentrations = {
    vegetativa: {
      ca: 200, // Cálcio: 180-220 ppm
      mg: 50,  // Magnésio: 40-60 ppm
      fe: 3,   // Ferro: 2-5 ppm
    },
    floracao: {
      ca: 180, // Cálcio: 160-200 ppm
      mg: 60,  // Magnésio: 50-70 ppm
      fe: 4,   // Ferro: 3-6 ppm
    },
  };

  // Concentração dos produtos comerciais (exemplo: ml para atingir X ppm em 1L)
  // Estes valores são aproximados e devem ser ajustados conforme o produto usado
  const productConcentration = {
    ca: 10, // 1ml de Ca em 1L = 10 ppm
    mg: 5,  // 1ml de Mg em 1L = 5 ppm
    fe: 2,  // 1ml de Fe em 1L = 2 ppm
  };

  // Informações detalhadas sobre cada nutriente
  const nutrientInfo: Record<'ca' | 'mg' | 'fe', NutrientInfo> = {
    ca: {
      name: "Cálcio (Ca)",
      icon: <Box className="w-6 h-6" />,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      function: "Estrutura celular, transporte de nutrientes e fortalecimento das paredes celulares",
      deficiencySymptoms: [
        "Pontas das folhas novas queimadas ou necróticas",
        "Folhas jovens deformadas ou enroladas",
        "Podridão apical em frutos",
        "Crescimento atrofiado"
      ],
      applicationTips: "Adicione primeiro, antes dos outros nutrientes. Não misture diretamente com sulfatos."
    },
    mg: {
      name: "Magnésio (Mg)",
      icon: <Leaf className="w-6 h-6" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      function: "Centro da molécula de clorofila, essencial para fotossíntese e produção de energia",
      deficiencySymptoms: [
        "Clorose internerval (amarelamento entre nervuras)",
        "Folhas mais velhas afetadas primeiro",
        "Bordas das folhas podem ficar roxas/avermelhadas",
        "Redução na produção de flores"
      ],
      applicationTips: "Adicione após o cálcio. Especialmente importante durante a floração."
    },
    fe: {
      name: "Ferro (Fe)",
      icon: <Zap className="w-6 h-6" />,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      function: "Produção de clorofila, respiração celular e transporte de oxigênio",
      deficiencySymptoms: [
        "Clorose severa em folhas novas (amarelo brilhante)",
        "Nervuras permanecem verdes",
        "Folhas pequenas e pálidas",
        "Crescimento lento e fraco"
      ],
      applicationTips: "Adicione por último. Use quelatos de ferro para melhor absorção. Sensível ao pH alto."
    }
  };

  const calculateNutrients = () => {
    const vol = parseFloat(volume);
    if (isNaN(vol) || vol <= 0) {
      alert("Por favor, insira um volume válido");
      return;
    }

    const targets = targetConcentrations[phase];

    // Calcular ml necessário para atingir concentração alvo
    const caMl = (targets.ca / productConcentration.ca) * vol;
    const mgMl = (targets.mg / productConcentration.mg) * vol;
    const feMl = (targets.fe / productConcentration.fe) * vol;

    setResult({
      ca: targets.ca,
      mg: targets.mg,
      fe: targets.fe,
      caMl: parseFloat(caMl.toFixed(2)),
      mgMl: parseFloat(mgMl.toFixed(2)),
      feMl: parseFloat(feMl.toFixed(2)),
    });
  };

  // Calcular porcentagem para barra de progresso (baseado em valores típicos)
  const getProgressPercentage = (nutrient: 'ca' | 'mg' | 'fe', value: number) => {
    const maxValues = { ca: 250, mg: 80, fe: 6 };
    return Math.min((value / maxValues[nutrient]) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/calculators">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Beaker className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Calculadora de Fertilização</h1>
                <p className="text-sm text-muted-foreground">Micronutrientes por fase</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Calcular Dosagem de Micronutrientes</CardTitle>
            <CardDescription>
              Insira o volume de rega e a fase do ciclo para calcular as dosagens ideais de Ca, Mg e Fe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Volume Input */}
            <div className="grid gap-2">
              <Label htmlFor="volume">Volume de Rega (Litros)</Label>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="volume"
                  type="number"
                  placeholder="Ex: 10"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="pl-10"
                  min="0"
                  step="0.1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Volume total de água para preparar a solução nutritiva
              </p>
            </div>

            {/* Phase Selector */}
            <div className="grid gap-2">
              <Label htmlFor="phase">Fase do Ciclo</Label>
              <Select value={phase} onValueChange={(value: Phase) => setPhase(value)}>
                <SelectTrigger id="phase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetativa">🌿 Vegetativa (Crescimento)</SelectItem>
                  <SelectItem value="floracao">🌸 Floração (Produção)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Cada fase tem necessidades nutricionais diferentes
              </p>
            </div>

            {/* Calculate Button */}
            <Button onClick={calculateNutrients} className="w-full" size="lg">
              <FlaskConical className="w-4 h-4 mr-2" />
              Calcular Dosagens
            </Button>

            {/* Results */}
            {result && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Beaker className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Resultados</h3>
                </div>

                <TooltipProvider>
                  {/* Nutrient Cards */}
                  <div className="grid gap-4">
                    {/* Cálcio */}
                    <Card className={`${nutrientInfo.ca.bgColor} ${nutrientInfo.ca.borderColor}`}>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-foreground">{nutrientInfo.ca.name}</p>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-4 h-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="font-semibold mb-1">Função:</p>
                                  <p className="text-xs mb-2">{nutrientInfo.ca.function}</p>
                                  <p className="font-semibold mb-1">Dica:</p>
                                  <p className="text-xs">{nutrientInfo.ca.applicationTips}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{result.caMl} ml</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Concentração alvo: {result.ca} ppm
                            </p>
                          </div>
                          <div className={`w-14 h-14 rounded-full ${nutrientInfo.ca.bgColor} flex items-center justify-center ${nutrientInfo.ca.color}`}>
                            {nutrientInfo.ca.icon}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Concentração</span>
                            <span>{result.ca} / 250 ppm</span>
                          </div>
                          <Progress value={getProgressPercentage('ca', result.ca)} className="h-2" />
                        </div>

                        {/* Deficiency Symptoms */}
                        <details className="text-xs">
                          <summary className="cursor-pointer font-medium text-foreground flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Sintomas de Deficiência
                          </summary>
                          <ul className="mt-2 space-y-1 text-muted-foreground pl-4">
                            {nutrientInfo.ca.deficiencySymptoms.map((symptom, idx) => (
                              <li key={idx}>• {symptom}</li>
                            ))}
                          </ul>
                        </details>
                      </CardContent>
                    </Card>

                    {/* Magnésio */}
                    <Card className={`${nutrientInfo.mg.bgColor} ${nutrientInfo.mg.borderColor}`}>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-foreground">{nutrientInfo.mg.name}</p>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-4 h-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="font-semibold mb-1">Função:</p>
                                  <p className="text-xs mb-2">{nutrientInfo.mg.function}</p>
                                  <p className="font-semibold mb-1">Dica:</p>
                                  <p className="text-xs">{nutrientInfo.mg.applicationTips}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{result.mgMl} ml</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Concentração alvo: {result.mg} ppm
                            </p>
                          </div>
                          <div className={`w-14 h-14 rounded-full ${nutrientInfo.mg.bgColor} flex items-center justify-center ${nutrientInfo.mg.color}`}>
                            {nutrientInfo.mg.icon}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Concentração</span>
                            <span>{result.mg} / 80 ppm</span>
                          </div>
                          <Progress value={getProgressPercentage('mg', result.mg)} className="h-2" />
                        </div>

                        {/* Deficiency Symptoms */}
                        <details className="text-xs">
                          <summary className="cursor-pointer font-medium text-foreground flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Sintomas de Deficiência
                          </summary>
                          <ul className="mt-2 space-y-1 text-muted-foreground pl-4">
                            {nutrientInfo.mg.deficiencySymptoms.map((symptom, idx) => (
                              <li key={idx}>• {symptom}</li>
                            ))}
                          </ul>
                        </details>
                      </CardContent>
                    </Card>

                    {/* Ferro */}
                    <Card className={`${nutrientInfo.fe.bgColor} ${nutrientInfo.fe.borderColor}`}>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-foreground">{nutrientInfo.fe.name}</p>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-4 h-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="font-semibold mb-1">Função:</p>
                                  <p className="text-xs mb-2">{nutrientInfo.fe.function}</p>
                                  <p className="font-semibold mb-1">Dica:</p>
                                  <p className="text-xs">{nutrientInfo.fe.applicationTips}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{result.feMl} ml</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Concentração alvo: {result.fe} ppm
                            </p>
                          </div>
                          <div className={`w-14 h-14 rounded-full ${nutrientInfo.fe.bgColor} flex items-center justify-center ${nutrientInfo.fe.color}`}>
                            {nutrientInfo.fe.icon}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Concentração</span>
                            <span>{result.fe} / 6 ppm</span>
                          </div>
                          <Progress value={getProgressPercentage('fe', result.fe)} className="h-2" />
                        </div>

                        {/* Deficiency Symptoms */}
                        <details className="text-xs">
                          <summary className="cursor-pointer font-medium text-foreground flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Sintomas de Deficiência
                          </summary>
                          <ul className="mt-2 space-y-1 text-muted-foreground pl-4">
                            {nutrientInfo.fe.deficiencySymptoms.map((symptom, idx) => (
                              <li key={idx}>• {symptom}</li>
                            ))}
                          </ul>
                        </details>
                      </CardContent>
                    </Card>
                  </div>
                </TooltipProvider>

                {/* Instructions */}
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <span>💡</span>
                      Instruções de Uso
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Adicione os nutrientes na ordem: Ca → Mg → Fe</li>
                      <li>• Misture bem após cada adição</li>
                      <li>• Aguarde 5 minutos entre adições</li>
                      <li>• Meça o pH final e ajuste se necessário (5.5-6.5)</li>
                      <li>• Use a solução em até 24 horas</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Beaker className="w-4 h-4 text-primary" />
              Sobre os Micronutrientes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <div>
              <strong className="text-foreground">Cálcio (Ca):</strong> Essencial para estrutura celular e transporte de nutrientes. Previne podridão apical.
            </div>
            <div>
              <strong className="text-foreground">Magnésio (Mg):</strong> Centro da molécula de clorofila. Crucial para fotossíntese e produção de energia.
            </div>
            <div>
              <strong className="text-foreground">Ferro (Fe):</strong> Fundamental para produção de clorofila e respiração celular. Deficiência causa clorose.
            </div>
            <div className="pt-2 border-t border-border text-xs">
              <strong>Nota:</strong> Os valores são baseados em concentrações comerciais típicas. Ajuste conforme especificações do seu produto.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

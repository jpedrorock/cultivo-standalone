import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Bell, Save, Loader2, Sprout, Flower2, Droplets, Wind } from "lucide-react";
import { toast } from "sonner";

const PHASE_INFO = {
  MAINTENANCE: {
    label: "Manutenção",
    icon: "🔧",
    color: "text-blue-600",
    description: "Margens para estufas em manutenção ou sem ciclo ativo",
  },
  CLONING: {
    label: "Clonagem",
    icon: "🌱",
    color: "text-green-600",
    description: "Margens para estufas com clones/mudas",
  },
  VEGA: {
    label: "Vegetativa",
    icon: "🌿",
    color: "text-emerald-600",
    description: "Margens para estufas em fase vegetativa",
  },
  FLORA: {
    label: "Floração",
    icon: "🌺",
    color: "text-purple-600",
    description: "Margens para estufas em fase de floração",
  },
  DRYING: {
    label: "Secagem",
    icon: "🍂",
    color: "text-orange-600",
    description: "Margens para estufas em processo de secagem (controle mais rigoroso)",
  },
};

type Phase = keyof typeof PHASE_INFO;

export function AlertSettings() {
  const { data: phaseMargins, isLoading } = trpc.alerts.getPhaseMargins.useQuery();
  const utils = trpc.useUtils();
  
  const updateMargin = trpc.alerts.updatePhaseMargin.useMutation({
    onSuccess: () => {
      toast.success("Margens atualizadas com sucesso!");
      utils.alerts.getPhaseMargins.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const [editedMargins, setEditedMargins] = useState<Record<Phase, any>>({
    MAINTENANCE: {},
    CLONING: {},
    VEGA: {},
    FLORA: {},
    DRYING: {},
  });

  useEffect(() => {
    if (phaseMargins) {
      const margins: Record<Phase, any> = {
        MAINTENANCE: {},
        CLONING: {},
        VEGA: {},
        FLORA: {},
        DRYING: {},
      };
      
      phaseMargins.forEach((margin: any) => {
        margins[margin.phase as Phase] = {
          tempMargin: margin.tempMargin ? parseFloat(String(margin.tempMargin)) : null,
          rhMargin: margin.rhMargin ? parseFloat(String(margin.rhMargin)) : null,
          ppfdMargin: margin.ppfdMargin || null,
          phMargin: margin.phMargin ? parseFloat(String(margin.phMargin)) : null,
        };
      });
      
      setEditedMargins(margins);
    }
  }, [phaseMargins]);

  const handleMarginChange = (phase: Phase, field: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setEditedMargins(prev => ({
      ...prev,
      [phase]: {
        ...prev[phase],
        [field]: numValue,
      },
    }));
  };

  const handleSave = async (phase: Phase) => {
    const margins = editedMargins[phase];
    await updateMargin.mutateAsync({
      phase,
      tempMargin: margins.tempMargin ?? undefined,
      rhMargin: margins.rhMargin ?? undefined,
      ppfdMargin: margins.ppfdMargin ?? undefined,
      phMargin: margins.phMargin ?? undefined,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Margens de Alertas por Fase</CardTitle>
        </div>
        <CardDescription>
          Configure as margens de tolerância para cada fase do cultivo. O sistema gera alertas quando valores reais ultrapassam (ideal ± margem).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {(Object.keys(PHASE_INFO) as Phase[]).map((phase) => {
            const info = PHASE_INFO[phase];
            const margins = editedMargins[phase] || {};
            
            return (
              <AccordionItem key={phase} value={phase} className="border rounded-lg mb-3 px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.icon}</span>
                    <div className="text-left">
                      <div className={`font-semibold ${info.color}`}>{info.label}</div>
                      <div className="text-sm text-muted-foreground">{info.description}</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2">
                  <div className="space-y-4">
                    {/* Temperatura */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${phase}-temp`} className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-red-500" />
                          Margem de Temperatura (±°C)
                        </Label>
                        <Input
                          id={`${phase}-temp`}
                          type="number"
                          step="0.1"
                          value={margins.tempMargin ?? ''}
                          onChange={(e) => handleMarginChange(phase, 'tempMargin', e.target.value)}
                          placeholder="Ex: 2.0"
                        />
                        <p className="text-xs text-muted-foreground">
                          Alerta se temp real {'<'} (ideal - margem) ou {'>'} (ideal + margem)
                        </p>
                      </div>

                      {/* Umidade */}
                      <div className="space-y-2">
                        <Label htmlFor={`${phase}-rh`} className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          Margem de Umidade (±%)
                        </Label>
                        <Input
                          id={`${phase}-rh`}
                          type="number"
                          step="0.1"
                          value={margins.rhMargin ?? ''}
                          onChange={(e) => handleMarginChange(phase, 'rhMargin', e.target.value)}
                          placeholder="Ex: 5.0"
                        />
                        <p className="text-xs text-muted-foreground">
                          Alerta se RH real {'<'} (ideal - margem) ou {'>'} (ideal + margem)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* PPFD */}
                      <div className="space-y-2">
                        <Label htmlFor={`${phase}-ppfd`} className="flex items-center gap-2">
                          <Flower2 className="w-4 h-4 text-yellow-500" />
                          Margem de PPFD (±µmol/m²/s)
                        </Label>
                        <Input
                          id={`${phase}-ppfd`}
                          type="number"
                          step="10"
                          value={margins.ppfdMargin ?? ''}
                          onChange={(e) => handleMarginChange(phase, 'ppfdMargin', e.target.value)}
                          placeholder="Ex: 50"
                        />
                        <p className="text-xs text-muted-foreground">
                          {phase === "DRYING" ? "Secagem não usa PPFD (luz apagada)" : "Alerta se PPFD real < (ideal - margem) ou > (ideal + margem)"}
                        </p>
                      </div>

                      {/* pH */}
                      <div className="space-y-2">
                        <Label htmlFor={`${phase}-ph`} className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-purple-500" />
                          Margem de pH (±)
                        </Label>
                        <Input
                          id={`${phase}-ph`}
                          type="number"
                          step="0.1"
                          value={margins.phMargin ?? ''}
                          onChange={(e) => handleMarginChange(phase, 'phMargin', e.target.value)}
                          placeholder={phase === "DRYING" ? "N/A" : "Ex: 0.2"}
                          disabled={phase === "DRYING"}
                        />
                        <p className="text-xs text-muted-foreground">
                          {phase === "DRYING" ? "Secagem não monitora pH" : "Alerta se pH real < (ideal - margem) ou > (ideal + margem)"}
                        </p>
                      </div>
                    </div>

                    {/* Botão Salvar */}
                    <div className="pt-2 flex justify-end">
                      <Button 
                        onClick={() => handleSave(phase)}
                        disabled={updateMargin.isPending}
                        size="sm"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {updateMargin.isPending ? "Salvando..." : `Salvar ${info.label}`}
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Como funciona:</strong> O sistema compara os valores reais (dailyLogs) com os valores ideais (weeklyTargets da strain ativa). 
            Se o valor real ultrapassar a faixa (ideal ± margem), um alerta é gerado com mensagem contextual.
          </p>
          <p className="text-sm text-blue-900 dark:text-blue-100 mt-2">
            <strong>Exemplo:</strong> Se o ideal de temperatura é 24°C e a margem é ±2°C, alertas são gerados se a temperatura real for {'<'} 22°C ou {'>'} 26°C.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

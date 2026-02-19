import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Save } from "lucide-react";
import { toast } from "sonner";

interface AlertConfig {
  enabled: boolean;
  min?: number;
  max?: number;
}

interface AlertSettings {
  temperature: AlertConfig;
  humidity: AlertConfig;
  ph: AlertConfig;
  ppfd: AlertConfig;
}

export function AlertSettings() {
  const [settings, setSettings] = useState<AlertSettings>({
    temperature: { enabled: true, min: 18, max: 28 },
    humidity: { enabled: true, min: 40, max: 70 },
    ph: { enabled: true, min: 5.5, max: 6.5 },
    ppfd: { enabled: true, min: 400, max: undefined },
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof AlertSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled }
    }));
  };

  const handleValueChange = (key: keyof AlertSettings, field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: numValue }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implementar salvamento no backend via tRPC
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulação
      toast.success("Configurações de alertas salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações de alertas");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Configurações de Alertas</CardTitle>
        </div>
        <CardDescription>
          Configure notificações para eventos críticos no ambiente das estufas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Temperatura */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Temperatura</Label>
              <p className="text-sm text-muted-foreground">
                Alertar quando temperatura estiver fora do range
              </p>
            </div>
            <Switch
              checked={settings.temperature.enabled}
              onCheckedChange={() => handleToggle('temperature')}
            />
          </div>
          {settings.temperature.enabled && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                <Label htmlFor="temp-min" className="text-sm">Mínima (°C)</Label>
                <Input
                  id="temp-min"
                  type="number"
                  step="0.1"
                  value={settings.temperature.min ?? ''}
                  onChange={(e) => handleValueChange('temperature', 'min', e.target.value)}
                  placeholder="Ex: 18"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temp-max" className="text-sm">Máxima (°C)</Label>
                <Input
                  id="temp-max"
                  type="number"
                  step="0.1"
                  value={settings.temperature.max ?? ''}
                  onChange={(e) => handleValueChange('temperature', 'max', e.target.value)}
                  placeholder="Ex: 28"
                />
              </div>
            </div>
          )}
        </div>

        {/* Umidade */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Umidade Relativa</Label>
              <p className="text-sm text-muted-foreground">
                Alertar quando umidade estiver fora do range
              </p>
            </div>
            <Switch
              checked={settings.humidity.enabled}
              onCheckedChange={() => handleToggle('humidity')}
            />
          </div>
          {settings.humidity.enabled && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                <Label htmlFor="hum-min" className="text-sm">Mínima (%)</Label>
                <Input
                  id="hum-min"
                  type="number"
                  step="1"
                  value={settings.humidity.min ?? ''}
                  onChange={(e) => handleValueChange('humidity', 'min', e.target.value)}
                  placeholder="Ex: 40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hum-max" className="text-sm">Máxima (%)</Label>
                <Input
                  id="hum-max"
                  type="number"
                  step="1"
                  value={settings.humidity.max ?? ''}
                  onChange={(e) => handleValueChange('humidity', 'max', e.target.value)}
                  placeholder="Ex: 70"
                />
              </div>
            </div>
          )}
        </div>

        {/* pH */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">pH</Label>
              <p className="text-sm text-muted-foreground">
                Alertar quando pH estiver fora do range ideal
              </p>
            </div>
            <Switch
              checked={settings.ph.enabled}
              onCheckedChange={() => handleToggle('ph')}
            />
          </div>
          {settings.ph.enabled && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                <Label htmlFor="ph-min" className="text-sm">Mínimo</Label>
                <Input
                  id="ph-min"
                  type="number"
                  step="0.1"
                  value={settings.ph.min ?? ''}
                  onChange={(e) => handleValueChange('ph', 'min', e.target.value)}
                  placeholder="Ex: 5.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ph-max" className="text-sm">Máximo</Label>
                <Input
                  id="ph-max"
                  type="number"
                  step="0.1"
                  value={settings.ph.max ?? ''}
                  onChange={(e) => handleValueChange('ph', 'max', e.target.value)}
                  placeholder="Ex: 6.5"
                />
              </div>
            </div>
          )}
        </div>

        {/* PPFD */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">PPFD (Luz)</Label>
              <p className="text-sm text-muted-foreground">
                Alertar quando intensidade de luz estiver muito baixa
              </p>
            </div>
            <Switch
              checked={settings.ppfd.enabled}
              onCheckedChange={() => handleToggle('ppfd')}
            />
          </div>
          {settings.ppfd.enabled && (
            <div className="pl-6">
              <div className="space-y-2">
                <Label htmlFor="ppfd-min" className="text-sm">Mínimo (μmol/m²/s)</Label>
                <Input
                  id="ppfd-min"
                  type="number"
                  step="50"
                  value={settings.ppfd.min ?? ''}
                  onChange={(e) => handleValueChange('ppfd', 'min', e.target.value)}
                  placeholder="Ex: 400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Botão Salvar */}
        <div className="pt-4 border-t">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

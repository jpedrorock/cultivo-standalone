import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Check } from "lucide-react";
import { toast } from "sonner";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showNotification,
  scheduleDailyReminder,
} from "@/lib/notifications";

export default function NotificationSettings() {
  const [permission, setPermission] = useState<string>(getNotificationPermission());
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState("18");
  const [reminderMinute, setReminderMinute] = useState("00");
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setDailyReminderEnabled(settings.dailyReminderEnabled || false);
      setReminderHour(settings.reminderHour || "18");
      setReminderMinute(settings.reminderMinute || "00");
      setAlertsEnabled(settings.alertsEnabled || false);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      dailyReminderEnabled,
      reminderHour,
      reminderMinute,
      alertsEnabled,
    };
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  };

  // Schedule reminder when settings change
  useEffect(() => {
    if (dailyReminderEnabled && permission === 'granted') {
      const cleanup = scheduleDailyReminder(parseInt(reminderHour), parseInt(reminderMinute));
      return cleanup;
    }
  }, [dailyReminderEnabled, reminderHour, reminderMinute, permission]);

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    
    if (result === 'granted') {
      toast.success('Notificações ativadas!');
    } else if (result === 'denied') {
      toast.error('Permissão negada. Você pode ativar nas configurações do navegador.');
    }
  };

  const handleTestNotification = async () => {
    await showNotification('🧪 Notificação de Teste', {
      body: 'Se você viu isso, as notificações estão funcionando!',
      tag: 'test-notification',
    });
    toast.success('Notificação enviada!');
  };

  const handleSaveSettings = () => {
    saveSettings();
    toast.success('Configurações salvas!');
  };

  const handleToggleDailyReminder = (enabled: boolean) => {
    setDailyReminderEnabled(enabled);
    if (enabled && permission !== 'granted') {
      toast.error('Ative as notificações primeiro!');
      setDailyReminderEnabled(false);
    }
  };

  const handleToggleAlerts = (enabled: boolean) => {
    setAlertsEnabled(enabled);
    if (enabled && permission !== 'granted') {
      toast.error('Ative as notificações primeiro!');
      setAlertsEnabled(false);
    }
  };

  if (!isNotificationSupported()) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellOff className="w-5 h-5" />
              Notificações Não Suportadas
            </CardTitle>
            <CardDescription>
              Seu navegador não suporta notificações push. Tente usar Chrome, Firefox, Edge ou Safari.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Notificações</h1>
        <p className="text-muted-foreground">
          Configure lembretes e alertas para não perder nenhum registro ou problema nas estufas
        </p>
      </div>

      {/* Permission Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Permissão de Notificações
          </CardTitle>
          <CardDescription>
            Permita que o aplicativo envie notificações para seu dispositivo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Status:</p>
              <p className="text-sm text-muted-foreground">
                {permission === 'granted' && '✅ Ativado'}
                {permission === 'denied' && '❌ Negado'}
                {permission === 'default' && '⏸️ Não configurado'}
              </p>
            </div>
            <div className="flex gap-2">
              {permission !== 'granted' && (
                <Button onClick={handleRequestPermission}>
                  Ativar Notificações
                </Button>
              )}
              {permission === 'granted' && (
                <Button variant="outline" onClick={handleTestNotification}>
                  Testar Notificação
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Reminder Card */}
      <Card>
        <CardHeader>
          <CardTitle>Lembrete Diário</CardTitle>
          <CardDescription>
            Receba um lembrete para registrar os dados das estufas todos os dias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="daily-reminder">Ativar lembrete diário</Label>
            <Switch
              id="daily-reminder"
              checked={dailyReminderEnabled}
              onCheckedChange={handleToggleDailyReminder}
              disabled={permission !== 'granted'}
            />
          </div>

          {dailyReminderEnabled && (
            <div className="space-y-2">
              <Label>Horário do lembrete</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={reminderHour}
                  onChange={(e) => setReminderHour(e.target.value)}
                  className="w-20"
                  placeholder="HH"
                />
                <span>:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={reminderMinute}
                  onChange={(e) => setReminderMinute(e.target.value)}
                  className="w-20"
                  placeholder="MM"
                />
                <span className="text-sm text-muted-foreground ml-2">
                  ({reminderHour}:{reminderMinute.padStart(2, '0')})
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts Card */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Automáticos</CardTitle>
          <CardDescription>
            Receba notificações quando Temperatura, Umidade ou PPFD estiverem fora da faixa ideal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="alerts">Ativar alertas automáticos</Label>
            <Switch
              id="alerts"
              checked={alertsEnabled}
              onCheckedChange={handleToggleAlerts}
              disabled={permission !== 'granted'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} size="lg">
          <Check className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}

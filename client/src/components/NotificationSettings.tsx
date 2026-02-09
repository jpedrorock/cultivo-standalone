import { useState, useEffect } from "react";
import { Bell, BellOff, Clock, AlertTriangle } from "lucide-react";
import { testSound, saveSoundConfig } from "@/lib/notificationSounds";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface NotificationConfig {
  dailyReminderEnabled: boolean;
  reminderTime: string; // HH:MM format
  alertsEnabled: boolean;
  taskRemindersEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0-1
}

export function NotificationSettings() {
  const [config, setConfig] = useState<NotificationConfig>({
    dailyReminderEnabled: false,
    reminderTime: "18:00",
    alertsEnabled: false,
    taskRemindersEnabled: false,
    soundEnabled: true,
    soundVolume: 0.5,
  });
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Load saved config from localStorage
    const saved = localStorage.getItem("notificationConfig");
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        // If parsing fails, use defaults
        console.error("Error parsing notification config:", e);
      }
    }

    // Check current permission status
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    // Save config to localStorage whenever it changes
    localStorage.setItem("notificationConfig", JSON.stringify(config));
    
    // Save sound config separately
    saveSoundConfig({ enabled: config.soundEnabled, volume: config.soundVolume });

    // Setup daily reminder if enabled
    if (config.dailyReminderEnabled && permission === "granted") {
      setupDailyReminder(config.reminderTime);
    }
  }, [config, permission]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Seu navegador não suporta notificações");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        toast.success("Permissão concedida! Você receberá lembretes diários.");
        // Send a test notification with sound and vibration
        sendTestNotification();
      } else if (result === "denied") {
        toast.error("Permissão negada. Ative nas configurações do navegador.");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("Erro ao solicitar permissão");
    }
  };

  const setupDailyReminder = (time: string) => {
    // Clear any existing reminders
    const existingInterval = localStorage.getItem("reminderIntervalId");
    if (existingInterval) {
      clearInterval(Number(existingInterval));
    }

    // Calculate milliseconds until next reminder
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const msUntilReminder = scheduledTime.getTime() - now.getTime();

    // Set initial timeout
    setTimeout(() => {
      sendDailyReminder();
      // Then set daily interval (24 hours)
      const intervalId = setInterval(sendDailyReminder, 24 * 60 * 60 * 1000);
      localStorage.setItem("reminderIntervalId", String(intervalId));
    }, msUntilReminder);
  };

  const sendTestNotification = () => {
    if (permission === "granted") {
      new Notification("🧪 Teste - App Cultivo", {
        body: "Notificações ativadas com sucesso! Som e vibração funcionando. 🌱",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "test-notification",
        vibrate: [200, 100, 200], // Vibration pattern
        requireInteraction: false,
      });
    }
  };

  const sendDailyReminder = () => {
    if (permission === "granted" && config.dailyReminderEnabled) {
      new Notification("📝 Lembrete - App Cultivo", {
        body: "Hora de registrar os dados das estufas! 🌱📊",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "daily-reminder",
        vibrate: [200, 100, 200],
        requireInteraction: false,
        data: { url: "/" },
      });
    }
  };

  const handleToggleDailyReminder = (enabled: boolean) => {
    if (enabled && permission !== "granted") {
      requestPermission();
      return;
    }
    setConfig({ ...config, dailyReminderEnabled: enabled });
  };

  const handleToggleAlerts = (enabled: boolean) => {
    if (enabled && permission !== "granted") {
      requestPermission();
      return;
    }
    setConfig({ ...config, alertsEnabled: enabled });
    if (enabled) {
      toast.success("Alertas automáticos ativados! Você será notificado quando Temp/RH/PPFD estiverem fora da faixa.");
    }
  };

  const handleToggleTaskReminders = (enabled: boolean) => {
    if (enabled && permission !== "granted") {
      requestPermission();
      return;
    }
    setConfig({ ...config, taskRemindersEnabled: enabled });
    if (enabled) {
      toast.success("Lembretes de tarefas ativados! Você será notificado sobre tarefas pendentes.");
    }
  };

  const handleTimeChange = (time: string) => {
    setConfig({ ...config, reminderTime: time });
  };

  const testNotification = () => {
    if (permission === "granted") {
      sendDailyReminder();
      toast.success("Notificação de teste enviada!");
    } else {
      toast.error("Permissão de notificações necessária");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações
        </CardTitle>
        <CardDescription>
          Configure lembretes diários e alertas automáticos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        {permission === "default" && (
          <div className="p-4 bg-blue-500/100/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-900 mb-3">
              Para receber lembretes e alertas, precisamos de permissão para enviar notificações.
            </p>
            <Button onClick={requestPermission} size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Permitir Notificações
            </Button>
          </div>
        )}

        {permission === "denied" && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-900">
              Permissão negada. Para ativar, acesse as configurações do navegador e permita notificações para este site.
            </p>
          </div>
        )}

        {permission === "granted" && (
          <>
            {/* Daily Reminder Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-daily-reminder" className="text-base">
                  Lembrete Diário
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba um lembrete para registrar os dados das estufas
                </p>
              </div>
              <Switch
                id="enable-daily-reminder"
                checked={config.dailyReminderEnabled}
                onCheckedChange={handleToggleDailyReminder}
              />
            </div>

            {/* Time Picker */}
            {config.dailyReminderEnabled && (
              <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                <Label htmlFor="reminder-time" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horário do Lembrete
                </Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={config.reminderTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Você receberá um lembrete todos os dias às {config.reminderTime}
                </p>
              </div>
            )}

            {/* Alerts Toggle */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="enable-alerts" className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Alertas Automáticos
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notificações quando Temp/RH/PPFD estiverem fora da faixa ideal
                </p>
              </div>
              <Switch
                id="enable-alerts"
                checked={config.alertsEnabled}
                onCheckedChange={handleToggleAlerts}
              />
            </div>

            {/* Task Reminders Toggle */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="enable-task-reminders" className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Lembretes de Tarefas
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notificações sobre tarefas pendentes no fim da semana
                </p>
              </div>
              <Switch
                id="enable-task-reminders"
                checked={config.taskRemindersEnabled}
                onCheckedChange={handleToggleTaskReminders}
              />
            </div>

            {/* Sound Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="enable-sound" className="text-base flex items-center gap-2">
                  🔊 Sons de Notificação
                </Label>
                <p className="text-sm text-muted-foreground">
                  Tocar som quando receber notificações
                </p>
              </div>
              <Switch
                id="enable-sound"
                checked={config.soundEnabled}
                onCheckedChange={(enabled) => setConfig({ ...config, soundEnabled: enabled })}
              />
            </div>

            {/* Volume Slider */}
            {config.soundEnabled && (
              <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                <Label htmlFor="sound-volume" className="flex items-center justify-between">
                  <span>Volume</span>
                  <span className="text-sm text-muted-foreground">{Math.round(config.soundVolume * 100)}%</span>
                </Label>
                <input
                  id="sound-volume"
                  type="range"
                  min="0"
                  max="100"
                  value={config.soundVolume * 100}
                  onChange={(e) => setConfig({ ...config, soundVolume: parseInt(e.target.value) / 100 })}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => testSound("daily_reminder", config.soundVolume)}
                    variant="outline"
                    size="sm"
                  >
                    🔔 Lembrete
                  </Button>
                  <Button
                    onClick={() => testSound("environment_alert", config.soundVolume)}
                    variant="outline"
                    size="sm"
                  >
                    ⚠️ Alerta
                  </Button>
                  <Button
                    onClick={() => testSound("task_reminder", config.soundVolume)}
                    variant="outline"
                    size="sm"
                  >
                    📋 Tarefa
                  </Button>
                </div>
              </div>
            )}

            {/* Test Button */}
            <div className="pt-4 border-t">
              <Button onClick={testNotification} variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Testar Notificação
              </Button>
            </div>
          </>
        )}

        {/* Status Badge */}
        <div className="pt-4 border-t">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              {config.dailyReminderEnabled && permission === "granted" ? (
                <>
                  <Bell className="w-4 h-4 text-green-600" />
                  <span className="text-primary font-medium">Lembretes diários ativos</span>
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Lembretes diários desativados</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {config.alertsEnabled && permission === "granted" ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-primary font-medium">Alertas automáticos ativos</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Alertas automáticos desativados</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { Bell, BellOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface NotificationConfig {
  enabled: boolean;
  time: string; // HH:MM format
}

export function NotificationSettings() {
  const [config, setConfig] = useState<NotificationConfig>({
    enabled: false,
    time: "18:00",
  });
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Load saved config from localStorage
    const saved = localStorage.getItem("notificationConfig");
    if (saved) {
      setConfig(JSON.parse(saved));
    }

    // Check current permission status
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    // Save config to localStorage whenever it changes
    localStorage.setItem("notificationConfig", JSON.stringify(config));

    // Setup daily reminder if enabled
    if (config.enabled && permission === "granted") {
      setupDailyReminder(config.time);
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
        // Send a test notification
        new Notification("App Cultivo", {
          body: "Notificações ativadas com sucesso! 🌱",
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
        });
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
      sendReminder();
      // Then set daily interval (24 hours)
      const intervalId = setInterval(sendReminder, 24 * 60 * 60 * 1000);
      localStorage.setItem("reminderIntervalId", String(intervalId));
    }, msUntilReminder);
  };

  const sendReminder = () => {
    if (permission === "granted" && config.enabled) {
      new Notification("Lembrete - App Cultivo", {
        body: "Hora de registrar os dados das estufas! 🌱📊",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "daily-reminder",
        requireInteraction: false,
      });
    }
  };

  const handleToggle = (enabled: boolean) => {
    if (enabled && permission !== "granted") {
      requestPermission();
    }
    setConfig({ ...config, enabled });
  };

  const handleTimeChange = (time: string) => {
    setConfig({ ...config, time });
  };

  const testNotification = () => {
    if (permission === "granted") {
      sendReminder();
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
          Lembretes Diários
        </CardTitle>
        <CardDescription>
          Configure lembretes para registrar os dados das estufas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        {permission === "default" && (
          <div className="p-4 bg-blue-500/100/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-900 mb-3">
              Para receber lembretes, precisamos de permissão para enviar notificações.
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
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-notifications" className="text-base">
                  Ativar Lembretes
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba um lembrete diário no horário configurado
                </p>
              </div>
              <Switch
                id="enable-notifications"
                checked={config.enabled}
                onCheckedChange={handleToggle}
              />
            </div>

            {/* Time Picker */}
            {config.enabled && (
              <div className="space-y-2">
                <Label htmlFor="reminder-time" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horário do Lembrete
                </Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={config.time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Você receberá um lembrete todos os dias às {config.time}
                </p>
              </div>
            )}

            {/* Test Button */}
            {config.enabled && (
              <Button onClick={testNotification} variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Testar Notificação
              </Button>
            )}
          </>
        )}

        {/* Status Badge */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            {config.enabled && permission === "granted" ? (
              <>
                <Bell className="w-4 h-4 text-green-600" />
                <span className="text-primary font-medium">Lembretes ativos</span>
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Lembretes desativados</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

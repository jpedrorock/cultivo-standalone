import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Bell, BellOff, ThermometerSun, Droplets, Sun, History, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function Alerts() {
  const [selectedTentId, setSelectedTentId] = useState<number>(1);

  // Buscar estufas
  const { data: tents, isLoading: loadingTents } = trpc.tents.list.useQuery();

  // Buscar configurações de alertas
  const { data: settings, isLoading: loadingSettings, refetch: refetchSettings } = 
    trpc.alerts.getSettings.useQuery({ tentId: selectedTentId });

  // Buscar histórico de alertas
  const { data: history, isLoading: loadingHistory } = 
    trpc.alerts.getHistory.useQuery({ tentId: selectedTentId, limit: 20 });

  // Mutation para atualizar configurações
  const updateSettings = trpc.alerts.updateSettings.useMutation({
    onSuccess: () => {
      refetchSettings();
    },
  });

  const handleToggle = async (field: "alertsEnabled" | "tempEnabled" | "rhEnabled" | "ppfdEnabled", value: boolean) => {
    await updateSettings.mutateAsync({
      tentId: selectedTentId,
      [field]: value,
    });
  };

  if (loadingTents) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const currentTent = tents?.find(t => t.id === selectedTentId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Alertas Automáticos</h1>
            <p className="text-gray-600">Configure notificações quando valores saem da faixa ideal</p>
          </div>
          <Link href="/">
            <Button variant="outline">← Voltar</Button>
          </Link>
        </div>

        {/* Seletor de Estufa */}
        <div className="mb-6">
          <Label>Selecionar Estufa</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {tents?.map((tent) => (
              <Button
                key={tent.id}
                variant={selectedTentId === tent.id ? "default" : "outline"}
                onClick={() => setSelectedTentId(tent.id)}
                className="h-auto py-4"
              >
                <div className="text-left">
                  <div className="font-semibold">{tent.name}</div>
                  <div className="text-xs opacity-80">Tipo {tent.tentType}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurações de Alertas */}
          <Card className="bg-white/90 backdrop-blur-sm border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {settings?.alertsEnabled ? (
                  <Bell className="w-5 h-5 text-green-500" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                Configurações - {currentTent?.name}
              </CardTitle>
              <CardDescription>
                Ative ou desative alertas por métrica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingSettings ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                </div>
              ) : (
                <>
                  {/* Alertas Gerais */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-700" />
                      <div>
                        <Label htmlFor="alertsEnabled" className="text-base font-semibold">
                          Alertas Automáticos
                        </Label>
                        <p className="text-sm text-gray-600">Ativar/desativar todos os alertas</p>
                      </div>
                    </div>
                    <Switch
                      id="alertsEnabled"
                      checked={settings?.alertsEnabled ?? true}
                      onCheckedChange={(value) => handleToggle("alertsEnabled", value)}
                      disabled={updateSettings.isPending}
                    />
                  </div>

                  {/* Temperatura */}
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ThermometerSun className="w-5 h-5 text-orange-600" />
                      <div>
                        <Label htmlFor="tempEnabled" className="text-base font-semibold">
                          Temperatura
                        </Label>
                        <p className="text-sm text-gray-600">Alerta quando temp. sai da faixa</p>
                      </div>
                    </div>
                    <Switch
                      id="tempEnabled"
                      checked={settings?.tempEnabled ?? true}
                      onCheckedChange={(value) => handleToggle("tempEnabled", value)}
                      disabled={updateSettings.isPending || !settings?.alertsEnabled}
                    />
                  </div>

                  {/* Umidade */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Droplets className="w-5 h-5 text-blue-600" />
                      <div>
                        <Label htmlFor="rhEnabled" className="text-base font-semibold">
                          Umidade (RH)
                        </Label>
                        <p className="text-sm text-gray-600">Alerta quando RH sai da faixa</p>
                      </div>
                    </div>
                    <Switch
                      id="rhEnabled"
                      checked={settings?.rhEnabled ?? true}
                      onCheckedChange={(value) => handleToggle("rhEnabled", value)}
                      disabled={updateSettings.isPending || !settings?.alertsEnabled}
                    />
                  </div>

                  {/* PPFD */}
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Sun className="w-5 h-5 text-yellow-600" />
                      <div>
                        <Label htmlFor="ppfdEnabled" className="text-base font-semibold">
                          Luz (PPFD)
                        </Label>
                        <p className="text-sm text-gray-600">Alerta quando PPFD sai da faixa</p>
                      </div>
                    </div>
                    <Switch
                      id="ppfdEnabled"
                      checked={settings?.ppfdEnabled ?? true}
                      onCheckedChange={(value) => handleToggle("ppfdEnabled", value)}
                      disabled={updateSettings.isPending || !settings?.alertsEnabled}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Alertas */}
          <Card className="bg-white/90 backdrop-blur-sm border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-500" />
                Histórico de Alertas
              </CardTitle>
              <CardDescription>
                Últimos 20 alertas disparados para {currentTent?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                </div>
              ) : history && history.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {history.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          {alert.metric === "TEMP" && <ThermometerSun className="w-5 h-5 text-orange-600 mt-0.5" />}
                          {alert.metric === "RH" && <Droplets className="w-5 h-5 text-blue-600 mt-0.5" />}
                          {alert.metric === "PPFD" && <Sun className="w-5 h-5 text-yellow-600 mt-0.5" />}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(alert.createdAt).toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        {alert.notificationSent && (
                          <Badge variant="outline" className="text-xs">
                            ✉️ Enviado
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum alerta disparado ainda</p>
                  <p className="text-sm mt-1">Os alertas aparecerão aqui quando valores saírem da faixa ideal</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

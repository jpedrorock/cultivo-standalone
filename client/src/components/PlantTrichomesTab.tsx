import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Sparkles, Upload, X, ZoomIn, Calendar } from "lucide-react";
import { toast } from "sonner";
import { processImage, blobToBase64, formatFileSize } from "@/lib/imageUtils";

interface PlantTrichomesTabProps {
  plantId: number;
}

export default function PlantTrichomesTab({ plantId }: PlantTrichomesTabProps) {
  const [trichomeStatus, setTrichomeStatus] = useState<"CLEAR" | "CLOUDY" | "AMBER" | "MIXED">("CLEAR");
  const [weekNumber, setWeekNumber] = useState("");
  const [clearPercent, setClearPercent] = useState("");
  const [cloudyPercent, setCloudyPercent] = useState("");
  const [amberPercent, setAmberPercent] = useState("");
  const [notes, setNotes] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const { data: plant } = trpc.plants.getById.useQuery({ id: plantId });
  const { data: trichomeLogs, refetch } = trpc.plantTrichomes.list.useQuery({ plantId });
  const createTrichomeLog = trpc.plantTrichomes.create.useMutation({
    onSuccess: () => {
      toast.success("Registro de tricomas adicionado!");
      setWeekNumber("");
      setClearPercent("");
      setCloudyPercent("");
      setAmberPercent("");
      setNotes("");
      setPhotoPreview(null);
      setPhotoFile(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar registro: ${error.message}`);
    },
  });

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas imagens");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 10MB)");
      return;
    }

    try {
      toast.info("Processando imagem...");
      
      // Processar imagem: comprimir e ajustar para aspect ratio iPhone (3:4)
      const processedBlob = await processImage(file, {
        maxWidth: 1080,
        maxHeight: 1440,
        quality: 0.85,
        aspectRatio: 3 / 4, // iPhone aspect ratio
        format: 'image/jpeg'
      });

      // Converter para File
      const processedFile = new File([processedBlob], file.name, { type: 'image/jpeg' });
      setPhotoFile(processedFile);

      // Preview
      const base64 = await blobToBase64(processedBlob);
      setPhotoPreview(base64);

      const originalSize = formatFileSize(file.size);
      const newSize = formatFileSize(processedFile.size);
      toast.success(`Imagem otimizada: ${originalSize} → ${newSize}`);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast.error('Erro ao processar imagem');
    }
  };

  const handleSubmit = () => {
    if (!weekNumber) {
      toast.error("Informe a semana do ciclo");
      return;
    }

    if (photoFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        createTrichomeLog.mutate({
          plantId,
          weekNumber: parseInt(weekNumber),
          trichomeStatus,
          clearPercent: clearPercent ? parseInt(clearPercent) : undefined,
          cloudyPercent: cloudyPercent ? parseInt(cloudyPercent) : undefined,
          amberPercent: amberPercent ? parseInt(amberPercent) : undefined,
          notes: notes || undefined,
          photoBase64: reader.result as string, // Envia base64 para o backend fazer upload no S3
        });
      };
      reader.readAsDataURL(photoFile);
    } else {
      createTrichomeLog.mutate({
        plantId,
        weekNumber: parseInt(weekNumber),
        trichomeStatus,
        clearPercent: clearPercent ? parseInt(clearPercent) : undefined,
        cloudyPercent: cloudyPercent ? parseInt(cloudyPercent) : undefined,
        amberPercent: amberPercent ? parseInt(amberPercent) : undefined,
        notes: notes || undefined,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CLEAR":
        return "bg-gray-500/10 text-gray-600 border-gray-500/30";
      case "CLOUDY":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "AMBER":
        return "bg-orange-500/10 text-orange-600 border-orange-500/30";
      case "MIXED":
        return "bg-purple-500/10 text-purple-600 border-purple-500/30";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CLEAR":
        return "⚪ Transparente";
      case "CLOUDY":
        return "🔵 Leitoso";
      case "AMBER":
        return "🟠 Âmbar";
      case "MIXED":
        return "🟣 Misto";
      default:
        return status;
    }
  };

  const getHarvestRecommendation = (status: string, cloudyPercent?: number, amberPercent?: number) => {
    if (status === "CLEAR") {
      return { text: "Ainda cedo - aguarde mais tempo", color: "text-gray-600" };
    }
    if (status === "CLOUDY" && (cloudyPercent || 0) >= 70) {
      return { text: "Ponto ideal para efeito cerebral", color: "text-blue-600" };
    }
    if (status === "AMBER" || (amberPercent || 0) >= 30) {
      return { text: "Ponto ideal para efeito corporal", color: "text-orange-600" };
    }
    if (status === "MIXED") {
      return { text: "Efeito balanceado - colha quando preferir", color: "text-purple-600" };
    }
    return { text: "Continue monitorando", color: "text-muted-foreground" };
  };

  return (
    <div className="space-y-6">
      {/* Current Week Info */}
      {plant && (
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Planta germinada há{" "}
                <span className="font-semibold text-foreground">
                  {Math.floor(
                    (Date.now() - new Date(plant.germDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  dias
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Trichome Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Registrar Tricomas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weekNumber">Semana do Ciclo *</Label>
            <Input
              id="weekNumber"
              type="number"
              min="1"
              placeholder="Ex: 8"
              value={weekNumber}
              onChange={(e) => setWeekNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Semana atual da planta (Vega ou Flora)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trichomeStatus">Status Predominante</Label>
            <select
              id="trichomeStatus"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={trichomeStatus}
              onChange={(e) => setTrichomeStatus(e.target.value as any)}
            >
              <option value="CLEAR">⚪ Transparente</option>
              <option value="CLOUDY">🔵 Leitoso</option>
              <option value="AMBER">🟠 Âmbar</option>
              <option value="MIXED">🟣 Misto</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clearPercent">% Transparente</Label>
              <Input
                id="clearPercent"
                type="number"
                min="0"
                max="100"
                placeholder="0-100"
                value={clearPercent}
                onChange={(e) => setClearPercent(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cloudyPercent">% Leitoso</Label>
              <Input
                id="cloudyPercent"
                type="number"
                min="0"
                max="100"
                placeholder="0-100"
                value={cloudyPercent}
                onChange={(e) => setCloudyPercent(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amberPercent">% Âmbar</Label>
              <Input
                id="amberPercent"
                type="number"
                min="0"
                max="100"
                placeholder="0-100"
                value={amberPercent}
                onChange={(e) => setAmberPercent(e.target.value)}
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Foto Macro dos Tricomas</Label>
            {!photoPreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Clique para adicionar foto macro
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG até 5MB
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoFile(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre a maturação..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Button onClick={handleSubmit} disabled={createTrichomeLog.isPending}>
            {createTrichomeLog.isPending ? "Salvando..." : "Registrar"}
          </Button>
        </CardContent>
      </Card>

      {/* Trichome Logs List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Histórico de Tricomas</h3>
        {trichomeLogs && trichomeLogs.length > 0 ? (
          trichomeLogs.map((log) => {
            const recommendation = getHarvestRecommendation(
              log.trichomeStatus,
              log.cloudyPercent || undefined,
              log.amberPercent || undefined
            );
            return (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.logDate).toLocaleString("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                        {log.weekNumber && (
                          <span className="ml-2 text-sm font-medium text-foreground">
                            • Semana {log.weekNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-md text-sm font-medium border ${getStatusColor(log.trichomeStatus)}`}
                    >
                      {getStatusLabel(log.trichomeStatus)}
                    </div>
                  </div>
                </CardHeader>
              <CardContent className="space-y-3">
                {log.photoUrl && (
                  <div className="relative group aspect-[3/4] w-full max-w-md mx-auto">
                    <img
                      src={log.photoUrl}
                      alt="Foto macro dos tricomas"
                      className="w-full h-full object-cover rounded-lg cursor-pointer"
                      onClick={() => setLightboxPhoto(log.photoUrl)}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {log.clearPercent !== null && (
                      <div>
                        <p className="text-muted-foreground">Transparente:</p>
                        <p className="font-medium">{log.clearPercent}%</p>
                      </div>
                    )}
                    {log.cloudyPercent !== null && (
                      <div>
                        <p className="text-muted-foreground">Leitoso:</p>
                        <p className="font-medium">{log.cloudyPercent}%</p>
                      </div>
                    )}
                    {log.amberPercent !== null && (
                      <div>
                        <p className="text-muted-foreground">Âmbar:</p>
                        <p className="font-medium">{log.amberPercent}%</p>
                      </div>
                    )}
                  </div>

                  {/* Harvest Recommendation */}
                  <div
                    className={`p-3 rounded-lg bg-muted/50 border-l-4 ${
                      recommendation.color === "text-blue-600"
                        ? "border-blue-500"
                        : recommendation.color === "text-orange-600"
                        ? "border-orange-500"
                        : recommendation.color === "text-purple-600"
                        ? "border-purple-500"
                        : "border-gray-500"
                    }`}
                  >
                    <p className={`text-sm font-medium ${recommendation.color}`}>
                      📊 {recommendation.text}
                    </p>
                  </div>

                  {log.notes && (
                    <p className="text-sm text-muted-foreground">{log.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum registro de tricomas ainda
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Adicione fotos macro e acompanhe a maturação
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxPhoto}
              alt="Foto ampliada"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-4 right-4"
              onClick={() => setLightboxPhoto(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

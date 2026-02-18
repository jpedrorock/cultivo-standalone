import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Heart, Upload, X, ZoomIn } from "lucide-react";
import { toast } from "sonner";

interface PlantHealthTabProps {
  plantId: number;
}

export default function PlantHealthTab({ plantId }: PlantHealthTabProps) {
  const [healthStatus, setHealthStatus] = useState<"HEALTHY" | "STRESSED" | "SICK" | "RECOVERING">("HEALTHY");
  const [symptoms, setSymptoms] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const { data: healthLogs, refetch } = trpc.plantHealth.list.useQuery({ plantId });
  const createHealthLog = trpc.plantHealth.create.useMutation({
    onSuccess: () => {
      toast.success("Registro de saúde adicionado!");
      setSymptoms("");
      setTreatment("");
      setNotes("");
      setPhotoPreview(null);
      setPhotoFile(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar registro: ${error.message}`);
    },
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas imagens");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 5MB)");
      return;
    }

    setPhotoFile(file);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!photoFile && !symptoms && !treatment && !notes) {
      toast.error("Adicione pelo menos uma foto ou informação");
      return;
    }

    // Converter foto para base64 se existir
    if (photoFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        createHealthLog.mutate({
          plantId,
          healthStatus,
          symptoms: symptoms || undefined,
          treatment: treatment || undefined,
          notes: notes || undefined,
          photoUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(photoFile);
    } else {
      createHealthLog.mutate({
        plantId,
        healthStatus,
        symptoms: symptoms || undefined,
        treatment: treatment || undefined,
        notes: notes || undefined,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      case "STRESSED":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "SICK":
        return "bg-red-500/10 text-red-600 border-red-500/30";
      case "RECOVERING":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return "🟢 Saudável";
      case "STRESSED":
        return "🟡 Estressada";
      case "SICK":
        return "🔴 Doente";
      case "RECOVERING":
        return "🟣 Recuperando";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Health Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Registrar Saúde
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="healthStatus">Status de Saúde</Label>
            <select
              id="healthStatus"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={healthStatus}
              onChange={(e) => setHealthStatus(e.target.value as any)}
            >
              <option value="HEALTHY">🟢 Saudável</option>
              <option value="STRESSED">🟡 Estressada</option>
              <option value="SICK">🔴 Doente</option>
              <option value="RECOVERING">🟣 Recuperando</option>
            </select>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Foto da Planta</Label>
            {!photoPreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Clique para adicionar foto
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
            <Label htmlFor="symptoms">Sintomas</Label>
            <Textarea
              id="symptoms"
              placeholder="Deficiências, pragas, amarelamento, manchas..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Tratamento</Label>
            <Textarea
              id="treatment"
              placeholder="Ações tomadas, produtos aplicados..."
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionais</Label>
            <Textarea
              id="notes"
              placeholder="Observações gerais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Button onClick={handleSubmit} disabled={createHealthLog.isPending}>
            {createHealthLog.isPending ? "Salvando..." : "Registrar"}
          </Button>
        </CardContent>
      </Card>

      {/* Health Logs List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Histórico de Saúde</h3>
        {healthLogs && healthLogs.length > 0 ? (
          healthLogs.map((log) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.logDate).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-md text-sm font-medium border ${getStatusColor(log.healthStatus)}`}
                  >
                    {getStatusLabel(log.healthStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {log.photoUrl && (
                  <div className="relative group">
                    <img
                      src={log.photoUrl}
                      alt="Foto da planta"
                      className="w-full h-48 object-cover rounded-lg cursor-pointer"
                      onClick={() => setLightboxPhoto(log.photoUrl)}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                {log.symptoms && (
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Sintomas:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {log.symptoms}
                    </p>
                  </div>
                )}
                {log.treatment && (
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Tratamento:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {log.treatment}
                    </p>
                  </div>
                )}
                {log.notes && (
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Notas:
                    </p>
                    <p className="text-sm text-muted-foreground">{log.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum registro de saúde ainda
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Adicione fotos e informações sobre a saúde da planta
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

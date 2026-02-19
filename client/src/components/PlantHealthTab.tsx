import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Heart, Upload, X, ZoomIn, Download, ChevronLeft, ChevronRight, Edit, Trash2, Camera, Image } from "lucide-react";
import { toast } from "sonner";
import { processImage, blobToBase64, formatFileSize, isHEIC, processImageFile } from "@/lib/imageUtils";
import EditHealthLogDialog from "@/components/EditHealthLogDialog";

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
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [editingLog, setEditingLog] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: healthLogs, refetch } = trpc.plantHealth.list.useQuery({ plantId });
  
  const utils = trpc.useUtils();
  
  const createHealthLog = trpc.plantHealth.create.useMutation({
    onSuccess: () => {
      toast.success("Registro de saúde adicionado!");
      setSymptoms("");
      setTreatment("");
      setNotes("");
      setPhotoPreview(null);
      setPhotoFile(null);
      refetch();
      // Invalidar lista de plantas para atualizar foto no card
      utils.plants.list.invalidate();
      utils.plants.getById.invalidate({ id: plantId });
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar registro: ${error.message}`);
    },
  });

  const updateHealthLog = trpc.plantHealth.update.useMutation({
    onSuccess: () => {
      toast.success("Registro atualizado!");
      // Invalidar lista de plantas para atualizar foto no card
      utils.plants.list.invalidate();
      utils.plants.getById.invalidate({ id: plantId });
      setIsEditModalOpen(false);
      setEditingLog(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const handleEditSave = (data: any) => {
    updateHealthLog.mutate(data);
  };

  const deleteHealthLog = trpc.plantHealth.delete.useMutation({
    onSuccess: () => {
      toast.success("Registro excluído!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) {
      console.log("❌ Nenhum arquivo selecionado");
      return;
    }

    console.log("📸 Arquivo selecionado:", file.name, file.type, formatFileSize(file.size));

    // Validação
    if (!file.type.startsWith("image/") && !isHEIC(file)) {
      toast.error("Por favor, selecione apenas imagens");
      console.error("❌ Tipo de arquivo inválido:", file.type);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 10MB)");
      console.error("❌ Arquivo muito grande:", formatFileSize(file.size));
      return;
    }

    try {
      // Converter HEIC para JPEG se necessário
      if (isHEIC(file)) {
        toast.info("🔄 Convertendo HEIC para JPEG...");
        file = await processImageFile(file);
        toast.success("✅ Imagem convertida com sucesso!");
      }
      
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
          photoBase64: reader.result as string, // Envia base64 para o backend fazer upload no S3
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
              <div className="space-y-3">
                {/* Botão Tirar Foto (Câmera) */}
                <label className="flex items-center justify-center gap-2 w-full h-14 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors bg-primary/5 border-primary/30">
                  <Camera className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    📸 Tirar Foto
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,image/jpeg,image/jpg,image/png,image/heic,image/heif"
                    capture="environment"
                    onChange={handlePhotoSelect}
                  />
                </label>
                
                {/* Botão Escolher Arquivo */}
                <label className="flex items-center justify-center gap-2 w-full h-14 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Image className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    📁 Escolher da Galeria
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,image/jpeg,image/jpg,image/png,image/heic,image/heif"
                    onChange={handlePhotoSelect}
                  />
                </label>
                
                <p className="text-xs text-center text-muted-foreground">
                  PNG, JPG, HEIC até 10MB
                </p>
              </div>
            ) : (
              <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                          style={{ aspectRatio: '3/4' }}
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

      {/* Health Logs List with Accordion */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Histórico de Saúde</h3>
        {healthLogs && healthLogs.length > 0 ? (
          <Accordion type="multiple" className="space-y-2">
            {healthLogs.map((log) => (
              <AccordionItem key={log.id} value={`log-${log.id}`} className="border rounded-lg px-4">
                <div className="flex items-center justify-between w-full py-4">
                  <AccordionTrigger className="hover:no-underline flex-1">
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.logDate).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                      <div
                        className={`px-3 py-1 rounded-md text-sm font-medium border ${getStatusColor(log.healthStatus)}`}
                      >
                        {getStatusLabel(log.healthStatus)}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingLog(log);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm("Deseja realmente excluir este registro?")) {
                          deleteHealthLog.mutate({ id: log.id });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <AccordionContent className="pb-4">
                  <div className="flex flex-col md:flex-row gap-4 pt-2">
                    {/* Dados à esquerda */}
                    <div className="flex-1 space-y-3">
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
                    </div>
                    
                    {/* Foto à direita */}
                    {log.photoUrl && (
                      <div className="md:w-64 flex-shrink-0">
                        <div 
                          className="relative group aspect-[3/4] w-full cursor-pointer"
                          onClick={() => {
                            const photoLogs = healthLogs?.filter((l: any) => l.photoUrl) || [];
                            const index = photoLogs.findIndex((l: any) => l.id === log.id);
                            setLightboxIndex(index);
                            setLightboxPhoto(log.photoUrl);
                          }}
                        >
                          <img
                            src={log.photoUrl}
                            alt="Foto da planta"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                            <ZoomIn className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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

      {/* Lightbox Aprimorado */}
      {lightboxPhoto && (() => {
        const photoLogs = healthLogs?.filter((l: any) => l.photoUrl) || [];
        const currentLog = photoLogs[lightboxIndex];
        const totalPhotos = photoLogs.length;
        
        const handlePrevious = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (lightboxIndex > 0) {
            setLightboxIndex(lightboxIndex - 1);
            setLightboxPhoto(photoLogs[lightboxIndex - 1].photoUrl!);
          }
        };
        
        const handleNext = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (lightboxIndex < totalPhotos - 1) {
            setLightboxIndex(lightboxIndex + 1);
            setLightboxPhoto(photoLogs[lightboxIndex + 1].photoUrl!);
          }
        };
        
        const handleDownload = async (e: React.MouseEvent) => {
          e.stopPropagation();
          try {
            const response = await fetch(lightboxPhoto);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `planta-${plantId}-saude-${currentLog?.id || Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Foto baixada com sucesso!');
          } catch (error) {
            toast.error('Erro ao baixar foto');
          }
        };
        
        return (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxPhoto(null)}
          >
            <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
              {/* Imagem */}
              <img
                src={lightboxPhoto}
                alt="Foto ampliada"
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* Informações */}
              <div className="mt-4 text-center text-white" onClick={(e) => e.stopPropagation()}>
                <p className="text-sm opacity-80">
                  {new Date(currentLog?.logDate || Date.now()).toLocaleString('pt-BR')}
                </p>
                <p className="text-xs opacity-60 mt-1">
                  Foto {lightboxIndex + 1} de {totalPhotos}
                </p>
              </div>
              
              {/* Botões de controle */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 text-white" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="bg-red-500/80 hover:bg-red-500"
                  onClick={() => setLightboxPhoto(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Navegação */}
              {totalPhotos > 1 && (
                <>
                  {lightboxIndex > 0 && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                      onClick={handlePrevious}
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </Button>
                  )}
                  {lightboxIndex < totalPhotos - 1 && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                      onClick={handleNext}
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* Modal de Edição */}
      <EditHealthLogDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        healthLog={editingLog}
        onSave={handleEditSave}
        isSaving={updateHealthLog.isPending}
      />
    </div>
  );
}

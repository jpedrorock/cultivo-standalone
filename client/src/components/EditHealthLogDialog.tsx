import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Image, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { processImage, blobToBase64, isHEIC, processImageFile } from "@/lib/imageUtils";

interface HealthLog {
  id: number;
  healthStatus: "HEALTHY" | "STRESSED" | "SICK" | "RECOVERING";
  symptoms?: string | null;
  treatment?: string | null;
  notes?: string | null;
  photoUrl?: string | null;
  logDate: Date;
}

interface EditHealthLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  healthLog: HealthLog | null;
  onSave: (data: {
    id: number;
    healthStatus: "HEALTHY" | "STRESSED" | "SICK" | "RECOVERING";
    symptoms?: string;
    treatment?: string;
    notes?: string;
    photoBase64?: string;
  }) => void;
  isSaving: boolean;
}

export default function EditHealthLogDialog({
  open,
  onOpenChange,
  healthLog,
  onSave,
  isSaving
}: EditHealthLogDialogProps) {
  const [healthStatus, setHealthStatus] = useState<"HEALTHY" | "STRESSED" | "SICK" | "RECOVERING">("HEALTHY");
  const [symptoms, setSymptoms] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [newPhotoBase64, setNewPhotoBase64] = useState<string | null>(null);
  const [hasNewPhoto, setHasNewPhoto] = useState(false);

  // Preencher formulário quando o dialog abrir
  useEffect(() => {
    if (healthLog && open) {
      setHealthStatus(healthLog.healthStatus);
      setSymptoms(healthLog.symptoms || "");
      setTreatment(healthLog.treatment || "");
      setNotes(healthLog.notes || "");
      setPhotoPreview(healthLog.photoUrl || null);
      setNewPhotoBase64(null);
      setHasNewPhoto(false);
    }
  }, [healthLog, open]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

    // Validação
    if (!file.type.startsWith("image/") && !isHEIC(file)) {
      toast.error("Por favor, selecione apenas imagens");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 10MB)");
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
      
      // Processar imagem
      const processedBlob = await processImage(file, {
        maxWidth: 1080,
        maxHeight: 1440,
        quality: 0.85,
        
        
      });

      // Converter para base64 para preview
      const base64 = await blobToBase64(processedBlob);
      setPhotoPreview(base64);
      setNewPhotoBase64(base64);
      setHasNewPhoto(true);

      toast.success("Imagem processada!");
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      toast.error("Erro ao processar imagem");
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setNewPhotoBase64(null);
    setHasNewPhoto(true); // Marca que houve mudança (remoção)
  };

  const handleSave = () => {
    if (!healthLog) return;

    const data: any = {
      id: healthLog.id,
      healthStatus,
      symptoms: symptoms || undefined,
      treatment: treatment || undefined,
      notes: notes || undefined,
    };

    // Adicionar foto apenas se houver uma nova
    if (hasNewPhoto && newPhotoBase64) {
      data.photoBase64 = newPhotoBase64;
    }

    onSave(data);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!healthLog) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">✏️</span>
            Editar Registro de Saúde
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Registrado em {new Date(healthLog.logDate).toLocaleString("pt-BR")}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status de Saúde */}
          <div className="space-y-2">
            <Label htmlFor="edit-status">Status de Saúde</Label>
            <select
              id="edit-status"
              value={healthStatus}
              onChange={(e) => setHealthStatus(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="HEALTHY">🟢 Saudável</option>
              <option value="STRESSED">🟡 Estressada</option>
              <option value="SICK">🔴 Doente</option>
              <option value="RECOVERING">🟣 Recuperando</option>
            </select>
          </div>

          {/* Sintomas */}
          <div className="space-y-2">
            <Label htmlFor="edit-symptoms">Sintomas (opcional)</Label>
            <Textarea
              id="edit-symptoms"
              placeholder="Descreva os sintomas observados..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={3}
            />
          </div>

          {/* Tratamento */}
          <div className="space-y-2">
            <Label htmlFor="edit-treatment">Tratamento (opcional)</Label>
            <Textarea
              id="edit-treatment"
              placeholder="Descreva o tratamento aplicado..."
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              rows={3}
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notas Adicionais (opcional)</Label>
            <Textarea
              id="edit-notes"
              placeholder="Observações gerais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Foto */}
          <div className="space-y-2">
            <Label>Foto da Planta</Label>
            {!photoPreview ? (
              <div className="space-y-3">
                {/* Botão Tirar Foto */}
                <label className="flex items-center justify-center gap-2 w-full h-14 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors bg-primary/5 border-primary/30">
                  <Camera className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    📸 Tirar Nova Foto
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
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
                    accept="image/*,.heic,.heif"
                    onChange={handlePhotoSelect}
                  />
                </label>
                
                <p className="text-xs text-center text-muted-foreground">
                  {hasNewPhoto ? "Foto removida - Adicione uma nova ou deixe sem foto" : "Mantenha a foto atual ou adicione uma nova"}
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
                  onClick={handleRemovePhoto}
                >
                  <X className="w-4 h-4" />
                </Button>
                {hasNewPhoto && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Nova foto
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

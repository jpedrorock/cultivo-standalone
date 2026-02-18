import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Upload, X, Loader2, ZoomIn, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface PlantPhotosTabProps {
  plantId: number;
}

export default function PlantPhotosTab({ plantId }: PlantPhotosTabProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: photos, isLoading } = trpc.plantPhotos.list.useQuery({ plantId });
  const utils = trpc.useUtils();

  const uploadPhoto = trpc.plantPhotos.upload.useMutation({
    onSuccess: () => {
      utils.plantPhotos.list.invalidate({ plantId });
      toast.success("Foto enviada com sucesso!");
      resetUploadForm();
    },
    onError: (error) => {
      toast.error(`Erro ao enviar foto: ${error.message}`);
      setUploading(false);
    },
  });

  const deletePhoto = trpc.plantPhotos.delete.useMutation({
    onSuccess: () => {
      utils.plantPhotos.list.invalidate({ plantId });
      toast.success("Foto removida com sucesso!");
      setLightboxOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao remover foto: ${error.message}`);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo: 5MB");
      return;
    }

    setSelectedFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Selecione uma imagem");
      return;
    }

    setUploading(true);

    try {
      // Converter imagem para base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // Fazer upload (por enquanto salvando base64, depois integrar com S3)
        await uploadPhoto.mutateAsync({
          plantId,
          photoUrl: base64,
          description: description.trim() || undefined,
        });
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDescription("");
    setUploadDialogOpen(false);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    if (!photos) return;
    
    if (direction === "prev") {
      setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    } else {
      setSelectedPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    }
  };

  const handleDeletePhoto = () => {
    if (!photos || !photos[selectedPhotoIndex]) return;
    
    if (confirm("Tem certeza que deseja remover esta foto?")) {
      deletePhoto.mutate({ photoId: photos[selectedPhotoIndex].id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Button */}
      <div className="flex justify-end">
        <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
          <Camera className="w-4 h-4" />
          Adicionar Foto
        </Button>
      </div>

      {/* Photos Grid */}
      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <Card
              key={photo.id}
              className="cursor-pointer hover:shadow-lg transition-all group overflow-hidden"
              onClick={() => openLightbox(index)}
            >
              <CardContent className="p-0 relative">
                <img
                  src={photo.photoUrl}
                  alt={photo.description || "Plant photo"}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-3">
                  {photo.description && (
                    <p className="text-sm text-foreground line-clamp-2 mb-1">{photo.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(photo.photoDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">Nenhuma foto registrada</p>
            <p className="text-sm text-muted-foreground mb-4">
              Comece documentando a evolução da sua planta
            </p>
            <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
              <Camera className="w-4 h-4" />
              Adicionar Primeira Foto
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Foto</DialogTitle>
            <DialogDescription>
              Envie uma foto para documentar a evolução da planta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File Input */}
            <div className="space-y-2">
              <Label>Imagem</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos: JPG, PNG, WEBP. Máximo: 5MB
              </p>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-contain rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Ex: Semana 3 de vegetativo, crescimento saudável..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetUploadForm}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar Foto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0">
          {photos && photos[selectedPhotoIndex] && (
            <div className="relative">
              {/* Image */}
              <div className="relative bg-black">
                <img
                  src={photos[selectedPhotoIndex].photoUrl}
                  alt={photos[selectedPhotoIndex].description || "Plant photo"}
                  className="w-full max-h-[80vh] object-contain"
                />
                
                {/* Navigation Arrows */}
                {photos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={() => navigateLightbox("prev")}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={() => navigateLightbox("next")}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </>
                )}

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setLightboxOpen(false)}
                >
                  <X className="w-6 h-6" />
                </Button>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 left-4 bg-red-500/50 hover:bg-red-500/70 text-white"
                  onClick={handleDeletePhoto}
                  disabled={deletePhoto.isPending}
                >
                  {deletePhoto.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {/* Info */}
              <div className="p-6 bg-card">
                {photos[selectedPhotoIndex].description && (
                  <p className="text-foreground mb-2">
                    {photos[selectedPhotoIndex].description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {new Date(photos[selectedPhotoIndex].photoDate).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span>
                    {selectedPhotoIndex + 1} / {photos.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

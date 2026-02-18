import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Camera } from "lucide-react";

interface PlantPhotosTabProps {
  plantId: number;
}

export default function PlantPhotosTab({ plantId }: PlantPhotosTabProps) {
  const { data: photos } = trpc.plantPhotos.list.useQuery({ plantId });

  return (
    <div className="space-y-6">
      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id}>
              <CardContent className="p-4">
                <img
                  src={photo.photoUrl}
                  alt={photo.description || "Plant photo"}
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                {photo.description && (
                  <p className="text-sm text-muted-foreground">{photo.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(photo.photoDate).toLocaleDateString("pt-BR")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma foto registrada ainda</p>
            <p className="text-sm text-muted-foreground mt-2">Upload de fotos em breve</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

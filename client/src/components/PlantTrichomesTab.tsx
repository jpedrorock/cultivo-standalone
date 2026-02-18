import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface PlantTrichomesTabProps {
  plantId: number;
}

export default function PlantTrichomesTab({ plantId }: PlantTrichomesTabProps) {
  const [trichomeStatus, setTrichomeStatus] = useState<"CLEAR" | "CLOUDY" | "AMBER" | "MIXED">("CLEAR");
  const [clearPercent, setClearPercent] = useState("");
  const [cloudyPercent, setCloudyPercent] = useState("");
  const [amberPercent, setAmberPercent] = useState("");
  const [notes, setNotes] = useState("");
  

  const { data: trichomeLogs, refetch } = trpc.plantTrichomes.list.useQuery({ plantId });
  const createTrichomeLog = trpc.plantTrichomes.create.useMutation({
    onSuccess: () => {
      toast({ title: "Registro de tricomas adicionado!" });
      setClearPercent("");
      setCloudyPercent("");
      setAmberPercent("");
      setNotes("");
      refetch();
    },
  });

  const handleSubmit = () => {
    createTrichomeLog.mutate({
      plantId,
      trichomeStatus,
      clearPercent: clearPercent ? parseInt(clearPercent) : undefined,
      cloudyPercent: cloudyPercent ? parseInt(cloudyPercent) : undefined,
      amberPercent: amberPercent ? parseInt(amberPercent) : undefined,
      notes: notes || undefined,
    });
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
        return "Transparente";
      case "CLOUDY":
        return "Leitoso";
      case "AMBER":
        return "Âmbar";
      case "MIXED":
        return "Misto";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
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
            <Label htmlFor="trichomeStatus">Status Predominante</Label>
            <select
              id="trichomeStatus"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={trichomeStatus}
              onChange={(e) => setTrichomeStatus(e.target.value as any)}
            >
              <option value="CLEAR">Transparente</option>
              <option value="CLOUDY">Leitoso</option>
              <option value="AMBER">Âmbar</option>
              <option value="MIXED">Misto</option>
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

          <Button onClick={handleSubmit}>
            Registrar
          </Button>
        </CardContent>
      </Card>

      {/* Trichome Logs List */}
      <div className="space-y-4">
        {trichomeLogs && trichomeLogs.length > 0 ? (
          trichomeLogs.map((log) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.logDate).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-md text-sm font-medium border ${getStatusColor(log.trichomeStatus)}`}>
                    {getStatusLabel(log.trichomeStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
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
                {log.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum registro de tricomas ainda</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

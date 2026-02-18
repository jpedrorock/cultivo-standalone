import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Heart } from "lucide-react";
import { toast } from "sonner";

interface PlantHealthTabProps {
  plantId: number;
}

export default function PlantHealthTab({ plantId }: PlantHealthTabProps) {
  const [healthStatus, setHealthStatus] = useState<"HEALTHY" | "STRESSED" | "SICK" | "RECOVERING">("HEALTHY");
  const [symptoms, setSymptoms] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  

  const { data: healthLogs, refetch } = trpc.plantHealth.list.useQuery({ plantId });
  const createHealthLog = trpc.plantHealth.create.useMutation({
    onSuccess: () => {
      toast({ title: "Registro de saúde adicionado!" });
      setSymptoms("");
      setTreatment("");
      setNotes("");
      refetch();
    },
  });

  const handleSubmit = () => {
    createHealthLog.mutate({
      plantId,
      healthStatus,
      symptoms: symptoms || undefined,
      treatment: treatment || undefined,
      notes: notes || undefined,
    });
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
        return "Saudável";
      case "STRESSED":
        return "Estressada";
      case "SICK":
        return "Doente";
      case "RECOVERING":
        return "Recuperando";
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
              <option value="HEALTHY">Saudável</option>
              <option value="STRESSED">Estressada</option>
              <option value="SICK">Doente</option>
              <option value="RECOVERING">Recuperando</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Sintomas</Label>
            <Textarea
              id="symptoms"
              placeholder="Deficiências, pragas, etc..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Tratamento</Label>
            <Textarea
              id="treatment"
              placeholder="Ações tomadas..."
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais..."
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

      {/* Health Logs List */}
      <div className="space-y-4">
        {healthLogs && healthLogs.length > 0 ? (
          healthLogs.map((log) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.logDate).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-md text-sm font-medium border ${getStatusColor(log.healthStatus)}`}>
                    {getStatusLabel(log.healthStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {log.symptoms && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Sintomas:</p>
                    <p className="text-sm text-muted-foreground">{log.symptoms}</p>
                  </div>
                )}
                {log.treatment && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Tratamento:</p>
                    <p className="text-sm text-muted-foreground">{log.treatment}</p>
                  </div>
                )}
                {log.notes && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Notas:</p>
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
              <p className="text-muted-foreground">Nenhum registro de saúde ainda</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Droplets } from "lucide-react";
import { toast } from "sonner";

interface PlantRunoffTabProps {
  plantId: number;
}

export default function PlantRunoffTab({ plantId }: PlantRunoffTabProps) {
  const [volumeIn, setVolumeIn] = useState("");
  const [volumeOut, setVolumeOut] = useState("");
  const [notes, setNotes] = useState("");
  

  const { data: runoffLogs, refetch } = trpc.plantRunoff.list.useQuery({ plantId });
  const createRunoffLog = trpc.plantRunoff.create.useMutation({
    onSuccess: (data) => {
      toast({ 
        title: "Runoff registrado!", 
        description: `${data.runoffPercent.toFixed(1)}% de runoff` 
      });
      setVolumeIn("");
      setVolumeOut("");
      setNotes("");
      refetch();
    },
  });

  const handleSubmit = () => {
    const volIn = parseFloat(volumeIn);
    const volOut = parseFloat(volumeOut);
    
    if (isNaN(volIn) || isNaN(volOut) || volIn <= 0) {
      toast({ title: "Erro", description: "Valores inválidos", variant: "destructive" });
      return;
    }

    createRunoffLog.mutate({ 
      plantId, 
      volumeIn: volIn, 
      volumeOut: volOut, 
      notes: notes || undefined 
    });
  };

  const getRunoffColor = (percent: number) => {
    if (percent < 10) return "text-red-600";
    if (percent >= 10 && percent < 15) return "text-yellow-600";
    if (percent >= 15 && percent <= 25) return "text-green-600";
    if (percent > 25 && percent <= 35) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Add New Runoff Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Registrar Runoff
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="volumeIn">Volume de Entrada (L)</Label>
              <Input
                id="volumeIn"
                type="number"
                step="0.1"
                placeholder="Ex: 2.5"
                value={volumeIn}
                onChange={(e) => setVolumeIn(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volumeOut">Volume de Saída (L)</Label>
              <Input
                id="volumeOut"
                type="number"
                step="0.1"
                placeholder="Ex: 0.5"
                value={volumeOut}
                onChange={(e) => setVolumeOut(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre esta rega..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <Button onClick={handleSubmit} disabled={!volumeIn || !volumeOut}>
            Registrar
          </Button>
        </CardContent>
      </Card>

      {/* Runoff Logs List */}
      <div className="space-y-4">
        {runoffLogs && runoffLogs.length > 0 ? (
          runoffLogs.map((log) => {
            const percent = parseFloat(log.runoffPercent);
            return (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.logDate).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div className={`text-2xl font-bold ${getRunoffColor(percent)}`}>
                      {percent.toFixed(1)}%
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                    <div>
                      <span className="text-muted-foreground">Entrada:</span>
                      <span className="font-medium ml-2">{parseFloat(log.volumeIn).toFixed(2)}L</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Saída:</span>
                      <span className="font-medium ml-2">{parseFloat(log.volumeOut).toFixed(2)}L</span>
                    </div>
                  </div>
                  {log.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Droplets className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum registro de runoff ainda</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

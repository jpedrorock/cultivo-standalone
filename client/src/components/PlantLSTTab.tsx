import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Scissors } from "lucide-react";
import { toast } from "sonner";

interface PlantLSTTabProps {
  plantId: number;
}

export default function PlantLSTTab({ plantId }: PlantLSTTabProps) {
  const [technique, setTechnique] = useState("");
  const [response, setResponse] = useState("");
  const [notes, setNotes] = useState("");
  

  const { data: lstLogs, refetch } = trpc.plantLST.list.useQuery({ plantId });
  const createLSTLog = trpc.plantLST.create.useMutation({
    onSuccess: () => {
      toast({ title: "Registro de LST adicionado!" });
      setTechnique("");
      setResponse("");
      setNotes("");
      refetch();
    },
  });

  const handleSubmit = () => {
    if (!technique.trim()) {
      toast({ title: "Erro", description: "Informe a técnica aplicada", variant: "destructive" });
      return;
    }

    createLSTLog.mutate({
      plantId,
      technique,
      response: response || undefined,
      notes: notes || undefined,
    });
  };

  const commonTechniques = [
    "LST (Low Stress Training)",
    "Topping",
    "FIM",
    "Defoliação",
    "Lollipopping",
    "Super Cropping",
    "ScrOG",
    "SOG",
  ];

  return (
    <div className="space-y-6">
      {/* Add New LST Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Registrar Técnica LST
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="technique">Técnica Aplicada</Label>
            <Input
              id="technique"
              placeholder="Ex: Topping, FIM, LST..."
              value={technique}
              onChange={(e) => setTechnique(e.target.value)}
              list="techniques"
            />
            <datalist id="techniques">
              {commonTechniques.map((tech) => (
                <option key={tech} value={tech} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="response">Resposta da Planta</Label>
            <Textarea
              id="response"
              placeholder="Como a planta respondeu à técnica..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={3}
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

          <Button onClick={handleSubmit} disabled={!technique.trim()}>
            Registrar
          </Button>
        </CardContent>
      </Card>

      {/* LST Logs List */}
      <div className="space-y-4">
        {lstLogs && lstLogs.length > 0 ? (
          lstLogs.map((log) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.logDate).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="px-3 py-1 rounded-md text-sm font-medium bg-purple-500/10 text-purple-600 border border-purple-500/30">
                    {log.technique}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {log.response && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Resposta:</p>
                    <p className="text-sm text-muted-foreground">{log.response}</p>
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
              <Scissors className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum registro de LST ainda</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

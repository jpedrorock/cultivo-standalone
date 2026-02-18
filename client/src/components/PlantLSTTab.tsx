import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Scissors, Check } from "lucide-react";
import { toast } from "sonner";

interface PlantLSTTabProps {
  plantId: number;
}

const TECHNIQUES = [
  {
    id: "topping",
    name: "Topping",
    description: "Corte do broto principal para criar 2+ colas",
    icon: "✂️",
    color: "bg-red-500/10 border-red-500/30 hover:bg-red-500/20",
    selectedColor: "bg-red-500/30 border-red-500",
  },
  {
    id: "fim",
    name: "FIM",
    description: "Corte parcial do topo (75-80%)",
    icon: "🔪",
    color: "bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20",
    selectedColor: "bg-orange-500/30 border-orange-500",
  },
  {
    id: "lst",
    name: "LST",
    description: "Dobrar e amarrar galhos horizontalmente",
    icon: "🪢",
    color: "bg-green-500/10 border-green-500/30 hover:bg-green-500/20",
    selectedColor: "bg-green-500/30 border-green-500",
  },
  {
    id: "super_cropping",
    name: "Super Cropping",
    description: "Apertar e dobrar o caule até quebrar internamente",
    icon: "💪",
    color: "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20",
    selectedColor: "bg-blue-500/30 border-blue-500",
  },
  {
    id: "lollipopping",
    name: "Lollipopping",
    description: "Remover galhos e folhas do terço inferior",
    icon: "🍭",
    color: "bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20",
    selectedColor: "bg-purple-500/30 border-purple-500",
  },
  {
    id: "defoliation",
    name: "Defoliação",
    description: "Remover folhas grandes estrategicamente",
    icon: "🍃",
    color: "bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20",
    selectedColor: "bg-yellow-500/30 border-yellow-500",
  },
  {
    id: "mainlining",
    name: "Mainlining",
    description: "Topping + LST para estrutura simétrica",
    icon: "🌳",
    color: "bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20",
    selectedColor: "bg-indigo-500/30 border-indigo-500",
  },
  {
    id: "scrog",
    name: "ScrOG",
    description: "Tela horizontal para canopy uniforme",
    icon: "🕸️",
    color: "bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/20",
    selectedColor: "bg-pink-500/30 border-pink-500",
  },
  {
    id: "sog",
    name: "SOG",
    description: "Muitas plantas pequenas juntas",
    icon: "🌊",
    color: "bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20",
    selectedColor: "bg-cyan-500/30 border-cyan-500",
  },
];

export default function PlantLSTTab({ plantId }: PlantLSTTabProps) {
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [response, setResponse] = useState("");
  const [notes, setNotes] = useState("");

  const { data: lstLogs, refetch } = trpc.plantLST.list.useQuery({ plantId });
  const createLSTLog = trpc.plantLST.create.useMutation({
    onSuccess: () => {
      toast.success("Registro de LST adicionado!");
      setSelectedTechniques([]);
      setResponse("");
      setNotes("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar registro: ${error.message}`);
    },
  });

  const toggleTechnique = (techniqueId: string) => {
    setSelectedTechniques((prev) =>
      prev.includes(techniqueId)
        ? prev.filter((id) => id !== techniqueId)
        : [...prev, techniqueId]
    );
  };

  const handleSubmit = () => {
    if (selectedTechniques.length === 0) {
      toast.error("Selecione pelo menos uma técnica");
      return;
    }

    const techniqueNames = selectedTechniques
      .map((id) => TECHNIQUES.find((t) => t.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    createLSTLog.mutate({
      plantId,
      technique: techniqueNames,
      response: response || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Add New LST Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Registrar Técnica de Treinamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual Technique Selector */}
          <div className="space-y-3">
            <Label>Técnicas Aplicadas</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TECHNIQUES.map((technique) => {
                const isSelected = selectedTechniques.includes(technique.id);
                return (
                  <button
                    key={technique.id}
                    type="button"
                    onClick={() => toggleTechnique(technique.id)}
                    className={`relative p-4 border-2 rounded-lg text-left transition-all ${
                      isSelected ? technique.selectedColor : technique.color
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    <div className="text-3xl mb-2">{technique.icon}</div>
                    <h4 className="font-semibold text-sm mb-1">
                      {technique.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {technique.description}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Selecione uma ou mais técnicas aplicadas
            </p>
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
            <Label htmlFor="notes">Notas Adicionais</Label>
            <Textarea
              id="notes"
              placeholder="Observações, dificuldades, resultados..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={selectedTechniques.length === 0 || createLSTLog.isPending}
          >
            {createLSTLog.isPending ? "Salvando..." : "Registrar"}
          </Button>
        </CardContent>
      </Card>

      {/* LST Logs List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Histórico de Treinamento</h3>
        {lstLogs && lstLogs.length > 0 ? (
          lstLogs.map((log) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.logDate).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {log.technique.split(",").map((tech, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1 rounded-md text-sm font-medium bg-purple-500/10 text-purple-600 border border-purple-500/30"
                      >
                        {tech.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {log.response && (
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Resposta da Planta:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {log.response}
                    </p>
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
              <p className="text-muted-foreground">
                Nenhum registro de treinamento ainda
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Selecione técnicas e registre a resposta da planta
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Technique Guide */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">📚 Guia Rápido de Técnicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <p className="font-medium">🌱 Fase Vegetativa (Semana 2-6):</p>
            <p className="text-muted-foreground">
              Topping, FIM, LST, Super Cropping, Mainlining, ScrOG
            </p>
          </div>
          <div>
            <p className="font-medium">🌸 Transição para Floração:</p>
            <p className="text-muted-foreground">
              Última oportunidade para LST agressivo e defoliação pré-floração
            </p>
          </div>
          <div>
            <p className="font-medium">🌺 Fase de Floração (Semana 1-5):</p>
            <p className="text-muted-foreground">
              Lollipopping (semana 3-4), Defoliação seletiva (cuidado!)
            </p>
          </div>
          <div>
            <p className="font-medium">⚠️ Evite após Semana 6 de Flora:</p>
            <p className="text-muted-foreground">
              Apenas suporte, sem manipulação para não estressar
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

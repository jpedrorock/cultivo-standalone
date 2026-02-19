import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Scissors, Check, Info, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface PlantLSTTabProps {
  plantId: number;
}

const TECHNIQUES = [
  {
    id: "topping",
    name: "Topping",
    shortDesc: "Corte do broto principal",
    description:
      "Corte do broto principal acima do 3º-5º nó para criar 2+ colas principais. Aumenta rendimento ao distribuir hormônios de crescimento igualmente. Melhor aplicar na fase vegetativa quando a planta tem pelo menos 6 nós. Recuperação: 3-7 dias.",
    icon: "✏️",
    phase: "vega",
    recovery: "3-7 dias",
    color: "bg-red-500/10 border-red-500/30",
    selectedColor: "bg-red-500/25 border-red-500 ring-2 ring-red-500/40",
    badgeColor: "bg-red-500/15 text-red-700 dark:text-red-400",
  },
  {
    id: "fim",
    name: "FIM",
    shortDesc: "Corte parcial do topo",
    description:
      "Corte parcial (75-80%) do novo crescimento do topo, deixando pequena porção intacta. Resulta em 4+ colas principais ao invés de 2. Menos estressante que topping tradicional. Ideal para fase vegetativa média. Recuperação: 2-5 dias.",
    icon: "🔪",
    phase: "vega",
    recovery: "2-5 dias",
    color: "bg-orange-500/10 border-orange-500/30",
    selectedColor:
      "bg-orange-500/25 border-orange-500 ring-2 ring-orange-500/40",
    badgeColor: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  },
  {
    id: "lst",
    name: "LST",
    shortDesc: "Dobrar e amarrar galhos",
    description:
      "Técnica de baixo estresse: dobrar e amarrar galhos horizontalmente para expor mais área à luz. Use arames macios ou cordas. Comece cedo na vegetação (2-3 semanas). Ajuste diariamente conforme crescimento. Aumenta penetração de luz e cria canopy uniforme sem cortes.",
    icon: "🩢",
    phase: "vega",
    recovery: "Sem pausa",
    color: "bg-green-500/10 border-green-500/30",
    selectedColor:
      "bg-green-500/25 border-green-500 ring-2 ring-green-500/40",
    badgeColor: "bg-green-500/15 text-green-700 dark:text-green-400",
  },
  {
    id: "super_cropping",
    name: "Super Cropping",
    shortDesc: "Apertar e dobrar caule",
    description:
      "Técnica avançada: apertar suavemente o caule entre dedos até sentir fibras internas quebrarem, depois dobrar 90°. Cria 'nó' que aumenta fluxo de nutrientes. Estimula produção de resina. Aplicar no final da vegetação ou início da floração. Recuperação: 5-10 dias.",
    icon: "💪",
    phase: "vega/flora",
    recovery: "5-10 dias",
    color: "bg-blue-500/10 border-blue-500/30",
    selectedColor: "bg-blue-500/25 border-blue-500 ring-2 ring-blue-500/40",
    badgeColor: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  },
  {
    id: "lollipopping",
    name: "Lollipopping",
    shortDesc: "Limpar terço inferior",
    description:
      "Remover todo crescimento (galhos, folhas, brotos) do terço inferior da planta. Direciona energia para colas superiores que recebem mais luz. Melhora circulação de ar, reduz risco de mofo. Aplicar 2-3 semanas antes da floração ou na primeira semana de flora.",
    icon: "🍭",
    phase: "flora",
    recovery: "2-3 dias",
    color: "bg-purple-500/10 border-purple-500/30",
    selectedColor:
      "bg-purple-500/25 border-purple-500 ring-2 ring-purple-500/40",
    badgeColor: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  },
  {
    id: "defoliation",
    name: "Defoliação",
    shortDesc: "Remover folhas grandes",
    description:
      "Remover folhas grandes (especialmente leques) que bloqueiam luz dos brotos inferiores. Melhora penetração de luz e circulação de ar. Não remover mais de 20-30% de folhas por vez. Aplicar gradualmente durante vegetação e nas semanas 1 e 3 da floração.",
    icon: "🍃",
    phase: "vega/flora",
    recovery: "1-3 dias",
    color: "bg-yellow-500/10 border-yellow-500/30",
    selectedColor:
      "bg-yellow-500/25 border-yellow-500 ring-2 ring-yellow-500/40",
    badgeColor: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  },
  {
    id: "mainlining",
    name: "Mainlining",
    shortDesc: "Estrutura simétrica perfeita",
    description:
      "Técnica avançada: combina topping repetido + LST + lollipopping para criar estrutura perfeitamente simétrica com 8-16 colas principais iguais. Requer tempo (vegetação longa de 6-8 semanas). Resultado: canopy uniforme, fácil manejo, flores de tamanho consistente.",
    icon: "🌳",
    phase: "vega",
    recovery: "7-14 dias",
    color: "bg-indigo-500/10 border-indigo-500/30",
    selectedColor:
      "bg-indigo-500/25 border-indigo-500 ring-2 ring-indigo-500/40",
    badgeColor: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
  },
  {
    id: "scrog",
    name: "ScrOG",
    shortDesc: "Tela horizontal para canopy",
    description:
      "Instalar tela/rede horizontal (10-30cm acima dos vasos) e tecer galhos através dela durante vegetação. Força canopy plano e uniforme, maximiza exposição à luz. Ideal para poucas plantas (1-4) em espaço pequeno. Rendimento: muito alto por m².",
    icon: "🕸️",
    phase: "vega",
    recovery: "Sem pausa",
    color: "bg-pink-500/10 border-pink-500/30",
    selectedColor: "bg-pink-500/25 border-pink-500 ring-2 ring-pink-500/40",
    badgeColor: "bg-pink-500/15 text-pink-700 dark:text-pink-400",
  },
  {
    id: "sog",
    name: "SOG",
    shortDesc: "Muitas plantas pequenas",
    description:
      "Cultivar muitas plantas pequenas (9-16 por m²) com vegetação curta (2-3 semanas) e forçar floração cedo. Cria 'mar' de colas principais. Ciclo rápido (8-10 semanas total). Ideal para clones. Rendimento: alto por m², médio por planta.",
    icon: "🌊",
    phase: "vega",
    recovery: "Sem pausa",
    color: "bg-cyan-500/10 border-cyan-500/30",
    selectedColor: "bg-cyan-500/25 border-cyan-500 ring-2 ring-cyan-500/40",
    badgeColor: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
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
    onError: (error: any) => {
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
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="w-4 h-4" />
            Registrar Técnica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Compact Technique Selector */}
          <div className="space-y-2">
            <Label className="text-sm">Selecione as técnicas aplicadas</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              {TECHNIQUES.map((technique) => {
                const isSelected = selectedTechniques.includes(technique.id);
                return (
                  <div key={technique.id} className="relative">
                    <button
                      type="button"
                      onClick={() => toggleTechnique(technique.id)}
                      className={`w-full flex flex-col items-center gap-1 p-3 border rounded-xl text-center transition-all duration-200 ${
                        isSelected
                          ? technique.selectedColor
                          : `${technique.color} hover:scale-[1.03]`
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <span className="text-2xl leading-none">
                        {technique.icon}
                      </span>
                      <span className="text-xs font-medium leading-tight">
                        {technique.name}
                      </span>
                    </button>
                    {/* Info popover */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="absolute -top-1 -left-1 w-5 h-5 bg-muted hover:bg-muted-foreground/20 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Info className="w-3 h-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        side="top"
                        className="w-72 text-sm"
                        align="start"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{technique.icon}</span>
                            <h4 className="font-semibold">{technique.name}</h4>
                          </div>
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            {technique.description}
                          </p>
                          <div className="flex gap-2 pt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium">
                              ⏱ {technique.recovery}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium">
                              🌱{" "}
                              {technique.phase === "vega"
                                ? "Vegetação"
                                : technique.phase === "flora"
                                  ? "Floração"
                                  : "Vega/Flora"}
                            </span>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                );
              })}
            </div>
            {selectedTechniques.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedTechniques.map((id) => {
                  const tech = TECHNIQUES.find((t) => t.id === id);
                  if (!tech) return null;
                  return (
                    <span
                      key={id}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${tech.badgeColor}`}
                    >
                      {tech.icon} {tech.name}
                      <button
                        type="button"
                        onClick={() => toggleTechnique(id)}
                        className="ml-0.5 hover:opacity-70"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Response & Notes - collapsible for cleaner look */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="response" className="text-sm">
                Resposta da Planta
              </Label>
              <Textarea
                id="response"
                placeholder="Como a planta respondeu à técnica..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm">
                Notas Adicionais
              </Label>
              <Textarea
                id="notes"
                placeholder="Observações, dificuldades, resultados..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={selectedTechniques.length === 0 || createLSTLog.isPending}
            className="w-full sm:w-auto"
          >
            {createLSTLog.isPending ? "Salvando..." : "Registrar"}
          </Button>
        </CardContent>
      </Card>

      {/* LST Logs List */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Scissors className="w-4 h-4" />
          Histórico de Treinamento
        </h3>
        {lstLogs && lstLogs.length > 0 ? (
          <Accordion type="multiple" className="space-y-2">
            {lstLogs.map((log: any) => (
              <AccordionItem
                key={log.id}
                value={String(log.id)}
                className="border rounded-lg px-4 bg-card"
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.logDate).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {log.technique.split(",").map((tech: string, idx: number) => {
                        const techData = TECHNIQUES.find(
                          (t) =>
                            t.name.toLowerCase() ===
                            tech.trim().toLowerCase()
                        );
                        return (
                          <span
                            key={idx}
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                              techData?.badgeColor ||
                              "bg-purple-500/15 text-purple-700 dark:text-purple-400"
                            }`}
                          >
                            {techData?.icon || "✂️"} {tech.trim()}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-3">
                  {log.response && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Resposta da Planta
                      </p>
                      <p className="text-sm">{log.response}</p>
                    </div>
                  )}
                  {log.notes && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Notas
                      </p>
                      <p className="text-sm">{log.notes}</p>
                    </div>
                  )}
                  {!log.response && !log.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhuma observação registrada
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Scissors className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhum registro de treinamento ainda
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione técnicas acima e registre a resposta da planta
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Compact Technique Guide */}
      <Accordion type="single" collapsible>
        <AccordionItem value="guide" className="border rounded-lg bg-muted/20">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="text-sm font-medium flex items-center gap-2">
              📚 Guia Rápido de Técnicas
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20">
                <p className="font-medium text-green-700 dark:text-green-400 text-xs mb-1">
                  🌱 Vegetação (Semana 2-6)
                </p>
                <p className="text-xs text-muted-foreground">
                  Topping, FIM, LST, Super Cropping, Mainlining, ScrOG
                </p>
              </div>
              <div className="bg-yellow-500/5 rounded-lg p-3 border border-yellow-500/20">
                <p className="font-medium text-yellow-700 dark:text-yellow-400 text-xs mb-1">
                  🌸 Transição para Floração
                </p>
                <p className="text-xs text-muted-foreground">
                  Última chance para LST agressivo e defoliação pré-flora
                </p>
              </div>
              <div className="bg-purple-500/5 rounded-lg p-3 border border-purple-500/20">
                <p className="font-medium text-purple-700 dark:text-purple-400 text-xs mb-1">
                  🌺 Floração (Semana 1-5)
                </p>
                <p className="text-xs text-muted-foreground">
                  Lollipopping (sem 3-4), Defoliação seletiva (cuidado!)
                </p>
              </div>
              <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/20">
                <p className="font-medium text-red-700 dark:text-red-400 text-xs mb-1">
                  ⚠️ Após Semana 6 de Flora
                </p>
                <p className="text-xs text-muted-foreground">
                  Apenas suporte, sem manipulação para não estressar
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

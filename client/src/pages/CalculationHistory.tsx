import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Trash2, Download, Droplets, Sprout, Sun } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CalculationHistory() {
  const [filter, setFilter] = useState<"ALL" | "IRRIGATION" | "FERTILIZATION" | "LUX_PPFD">("ALL");
  
  const { data: calculations, refetch } = trpc.calculations.list.useQuery({
    calculatorType: filter === "ALL" ? undefined : filter,
    limit: 50,
  });

  const deleteCalculation = trpc.calculations.delete.useMutation({
    onSuccess: () => {
      refetch();
      alert("✅ Receita deletada!");
    },
  });

  const getCalculatorIcon = (type: string) => {
    switch (type) {
      case "IRRIGATION":
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case "FERTILIZATION":
        return <Sprout className="w-5 h-5 text-green-500" />;
      case "LUX_PPFD":
        return <Sun className="w-5 h-5 text-yellow-500" />;
      default:
        return <History className="w-5 h-5" />;
    }
  };

  const getCalculatorLabel = (type: string) => {
    switch (type) {
      case "IRRIGATION":
        return "Rega";
      case "FERTILIZATION":
        return "Fertilização";
      case "LUX_PPFD":
        return "Lux → PPFD";
      default:
        return type;
    }
  };

  const exportCalculation = (calc: any) => {
    const params = JSON.parse(calc.parametersJson);
    const result = JSON.parse(calc.resultJson);
    
    let content = `
===========================================
   ${getCalculatorLabel(calc.calculatorType).toUpperCase()} - APP CULTIVO
===========================================

DATA: ${format(new Date(calc.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
TÍTULO: ${calc.title || "Sem título"}

PARÂMETROS:
${JSON.stringify(params, null, 2)}

RESULTADO:
${JSON.stringify(result, null, 2)}

${calc.notes ? `NOTAS:\n${calc.notes}\n` : ""}
===========================================
    `;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receita-${calc.id}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <History className="w-10 h-10 text-green-600" />
            Histórico de Cálculos
          </h1>
          <p className="text-gray-600">Consulte suas receitas salvas anteriormente</p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtrar por tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={filter === "ALL" ? "default" : "outline"}
                onClick={() => setFilter("ALL")}
              >
                Todos
              </Button>
              <Button
                variant={filter === "IRRIGATION" ? "default" : "outline"}
                onClick={() => setFilter("IRRIGATION")}
              >
                <Droplets className="w-4 h-4 mr-2" />
                Rega
              </Button>
              <Button
                variant={filter === "FERTILIZATION" ? "default" : "outline"}
                onClick={() => setFilter("FERTILIZATION")}
              >
                <Sprout className="w-4 h-4 mr-2" />
                Fertilização
              </Button>
              <Button
                variant={filter === "LUX_PPFD" ? "default" : "outline"}
                onClick={() => setFilter("LUX_PPFD")}
              >
                <Sun className="w-4 h-4 mr-2" />
                Lux → PPFD
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Cálculos */}
        <div className="space-y-4">
          {!calculations || calculations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhuma receita salva ainda</p>
                <p className="text-gray-400 text-sm mt-2">
                  Salve seus cálculos nas calculadoras para consultá-los aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            calculations.map((calc) => {
              const params = JSON.parse(calc.parametersJson);
              const result = JSON.parse(calc.resultJson);

              return (
                <Card key={calc.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getCalculatorIcon(calc.calculatorType)}
                        <div>
                          <CardTitle className="text-lg">
                            {calc.title || getCalculatorLabel(calc.calculatorType)}
                          </CardTitle>
                          <CardDescription>
                            {format(new Date(calc.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportCalculation(calc)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja deletar esta receita?")) {
                              deleteCalculation.mutate({ id: calc.id });
                            }
                          }}
                          disabled={deleteCalculation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Parâmetros:</h4>
                        <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                          {Object.entries(params).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600">{key}:</span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Resultado:</h4>
                        <div className="bg-green-50 rounded p-3 text-sm space-y-1">
                          {Object.entries(result).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600">{key}:</span>
                              <span className="font-bold text-green-700">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {calc.notes && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-sm text-gray-700">
                          <strong>Notas:</strong> {calc.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

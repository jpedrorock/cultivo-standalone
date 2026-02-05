import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Droplets, Sun, Beaker, FlaskConical, Clock } from "lucide-react";

export default function Reference() {
  const { data: tents = [] } = trpc.tents.list.useQuery();
  const { data: tentATargets = [] } = trpc.weeklyTargets.getByTent.useQuery({ tentId: 1 });
  const { data: tentBTargets = [] } = trpc.weeklyTargets.getByTent.useQuery({ tentId: 2 });
  const { data: tentCTargets = [] } = trpc.weeklyTargets.getByTent.useQuery({ tentId: 3 });

  const tentA = tents.find((t) => t.id === 1);
  const tentB = tents.find((t) => t.id === 2);
  const tentC = tents.find((t) => t.id === 3);

  const phaseLabels: Record<string, string> = {
    MAINTENANCE: "Manutenção (Mães)",
    CLONING: "Clonagem",
    VEGA: "Vegetativa",
    FLORA: "Floração",
  };

  const phaseBadgeColors: Record<string, string> = {
    MAINTENANCE: "bg-gray-500",
    CLONING: "bg-blue-500",
    VEGA: "bg-green-500",
    FLORA: "bg-purple-500",
  };

  const renderTargetCard = (target: any) => (
    <Card key={`${target.phase}-${target.weekNumber}`} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Semana {target.weekNumber}
          </CardTitle>
          <Badge className={phaseBadgeColors[target.phase]}>
            {phaseLabels[target.phase]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* PPFD */}
          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <Sun className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-orange-900 mb-1">PPFD</p>
              <p className="text-lg font-bold text-orange-700">
                {target.ppfdMin}-{target.ppfdMax}
              </p>
              <p className="text-xs text-orange-600">µmol/m²/s</p>
            </div>
          </div>

          {/* Fotoperíodo */}
          <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
            <Clock className="w-5 h-5 text-cyan-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-cyan-900 mb-1">Fotoperíodo</p>
              <p className="text-lg font-bold text-cyan-700">{target.photoperiod}</p>
              <p className="text-xs text-cyan-600">Horas Luz/Escuro</p>
            </div>
          </div>

          {/* Temperatura */}
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <Thermometer className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-red-900 mb-1">Temperatura</p>
              <p className="text-lg font-bold text-red-700">
                {target.tempMin}-{target.tempMax}
              </p>
              <p className="text-xs text-red-600">°C</p>
            </div>
          </div>

          {/* Umidade */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Droplets className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-900 mb-1">Umidade</p>
              <p className="text-lg font-bold text-blue-700">
                {target.rhMin}-{target.rhMax}
              </p>
              <p className="text-xs text-blue-600">%</p>
            </div>
          </div>

          {/* pH */}
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Beaker className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-purple-900 mb-1">pH</p>
              <p className="text-lg font-bold text-purple-700">
                {target.phMin}-{target.phMax}
              </p>
              <p className="text-xs text-purple-600">Ideal</p>
            </div>
          </div>

          {/* EC */}
          <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
            <FlaskConical className="w-5 h-5 text-pink-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-pink-900 mb-1">EC</p>
              <p className="text-lg font-bold text-pink-700">
                {target.ecMin}-{target.ecMax}
              </p>
              <p className="text-xs text-pink-600">mS/cm</p>
            </div>
          </div>
        </div>

        {target.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">{target.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const groupTargetsByPhase = (targets: any[]) => {
    const grouped: Record<string, any[]> = {};
    targets.forEach((target) => {
      if (!grouped[target.phase]) {
        grouped[target.phase] = [];
      }
      grouped[target.phase].push(target);
    });
    return grouped;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            📖 Referência de Valores Ideais
          </h1>
          <p className="text-green-700">
            Consulte os valores ideais (targets) para cada estufa, fase e semana do ciclo
          </p>
        </div>

        <Tabs defaultValue="tentA" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="tentA">
              {tentA?.name || "Estufa A"}
            </TabsTrigger>
            <TabsTrigger value="tentB">
              {tentB?.name || "Estufa B"}
            </TabsTrigger>
            <TabsTrigger value="tentC">
              {tentC?.name || "Estufa C"}
            </TabsTrigger>
          </TabsList>

          {/* Estufa A */}
          <TabsContent value="tentA">
            <Card>
              <CardHeader>
                <CardTitle>{tentA?.name || "Estufa A"}</CardTitle>
                <CardDescription>
                  {tentA ? `${tentA.width}x${tentA.depth}x${tentA.height}cm` : "45x75x90cm"} • Mães e Clonagem
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.entries(groupTargetsByPhase(tentATargets)).map(
                  ([phase, targets]) => (
                    <div key={phase} className="mb-6">
                      <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
                        <Badge className={phaseBadgeColors[phase]}>
                          {phaseLabels[phase]}
                        </Badge>
                      </h3>
                      {targets.map(renderTargetCard)}
                    </div>
                  )
                )}
                {tentATargets.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum target cadastrado para esta estufa
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estufa B */}
          <TabsContent value="tentB">
            <Card>
              <CardHeader>
                <CardTitle>{tentB?.name || "Estufa B"}</CardTitle>
                <CardDescription>
                  {tentB ? `${tentB.width}x${tentB.depth}x${tentB.height}cm` : "60x60x120cm"} • Vegetativa (6 semanas)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.entries(groupTargetsByPhase(tentBTargets)).map(
                  ([phase, targets]) => (
                    <div key={phase} className="mb-6">
                      <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
                        <Badge className={phaseBadgeColors[phase]}>
                          {phaseLabels[phase]}
                        </Badge>
                      </h3>
                      {targets.map(renderTargetCard)}
                    </div>
                  )
                )}
                {tentBTargets.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum target cadastrado para esta estufa
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estufa C */}
          <TabsContent value="tentC">
            <Card>
              <CardHeader>
                <CardTitle>{tentC?.name || "Estufa C"}</CardTitle>
                <CardDescription>
                  {tentC ? `${tentC.width}x${tentC.depth}x${tentC.height}cm` : "60x120x150cm"} • Floração (8 semanas)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.entries(groupTargetsByPhase(tentCTargets)).map(
                  ([phase, targets]) => (
                    <div key={phase} className="mb-6">
                      <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
                        <Badge className={phaseBadgeColors[phase]}>
                          {phaseLabels[phase]}
                        </Badge>
                      </h3>
                      {targets.map(renderTargetCard)}
                    </div>
                  )
                )}
                {tentCTargets.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum target cadastrado para esta estufa
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

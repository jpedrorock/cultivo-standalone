import { useState } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Sprout, 
  FileText, 
  Droplets, 
  Heart, 
  Sparkles, 
  Scissors,
  Edit,
  MoveRight
} from "lucide-react";
import PlantObservationsTab from "@/components/PlantObservationsTab";
import PlantHealthTab from "@/components/PlantHealthTab";
import PlantTrichomesTab from "@/components/PlantTrichomesTab";
import PlantLSTTab from "@/components/PlantLSTTab";

export default function PlantDetail() {
  const [, params] = useRoute("/plants/:id");
  const plantId = params?.id ? parseInt(params.id) : 0;

  const { data: plant, isLoading } = trpc.plants.getById.useQuery({ id: plantId });
  const { data: strain } = trpc.strains.getById.useQuery(
    { id: plant?.strainId || 0 },
    { enabled: !!plant?.strainId }
  );
  const { data: tent } = trpc.tents.getById.useQuery(
    { id: plant?.currentTentId || 0 },
    { enabled: !!plant?.currentTentId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-2">Planta não encontrada</p>
          <Link href="/plants">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      case "HARVESTED":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "DEAD":
        return "bg-red-500/10 text-red-600 border-red-500/30";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Ativa";
      case "HARVESTED":
        return "Colhida";
      case "DEAD":
        return "Morta";
      default:
        return status;
    }
  };

  const daysOld = Math.floor(
    (new Date().getTime() - new Date(plant.germDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/plants">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{plant.name}</h1>
                {plant.code && (
                  <p className="text-sm text-muted-foreground font-mono">{plant.code}</p>
                )}
              </div>
              <div className={`px-3 py-1 rounded-md text-sm font-medium border ${getStatusColor(plant.status)}`}>
                {getStatusLabel(plant.status)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline">
                <MoveRight className="w-4 h-4 mr-2" />
                Mover Estufa
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Strain</CardDescription>
              <CardTitle className="text-xl">{strain?.name || "Unknown"}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Estufa Atual</CardDescription>
              <CardTitle className="text-xl">{tent?.name || "Unknown"}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Germinação</CardDescription>
              <CardTitle className="text-xl">
                {new Date(plant.germDate).toLocaleDateString("pt-BR")}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Idade</CardDescription>
              <CardTitle className="text-xl">{daysOld} dias</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Notes */}
        {plant.notes && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{plant.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="observations" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="observations">
              <FileText className="w-4 h-4 mr-2" />
              Observações
            </TabsTrigger>


            <TabsTrigger value="health">
              <Heart className="w-4 h-4 mr-2" />
              Saúde
            </TabsTrigger>
            <TabsTrigger value="trichomes">
              <Sparkles className="w-4 h-4 mr-2" />
              Tricomas
            </TabsTrigger>
            <TabsTrigger value="lst">
              <Scissors className="w-4 h-4 mr-2" />
              LST
            </TabsTrigger>
          </TabsList>

          <TabsContent value="observations">
            <PlantObservationsTab plantId={plantId} />
          </TabsContent>

          <TabsContent value="health">
            <PlantHealthTab plantId={plantId} />
          </TabsContent>

          <TabsContent value="trichomes">
            <PlantTrichomesTab plantId={plantId} />
          </TabsContent>

          <TabsContent value="lst">
            <PlantLSTTab plantId={plantId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

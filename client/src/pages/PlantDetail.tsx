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
  MoveRight,
  MoreVertical,
  Flower2,
  CheckCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import PlantObservationsTab from "@/components/PlantObservationsTab";
import PlantHealthTab from "@/components/PlantHealthTab";
import PlantTrichomesTab from "@/components/PlantTrichomesTab";
import PlantLSTTab from "@/components/PlantLSTTab";
import MoveTentModal from "@/components/MoveTentModal";
import { toast } from "sonner";

export default function PlantDetail() {
  const [, params] = useRoute("/plants/:id");
  const plantId = params?.id ? parseInt(params.id) : 0;
  const [moveTentModalOpen, setMoveTentModalOpen] = useState(false);

  const { data: plant, isLoading, refetch } = trpc.plants.getById.useQuery({ id: plantId });
  const { data: strain } = trpc.strains.getById.useQuery(
    { id: plant?.strainId || 0 },
    { enabled: !!plant?.strainId }
  );
  const { data: tent } = trpc.tents.getById.useQuery(
    { id: plant?.currentTentId || 0 },
    { enabled: !!plant?.currentTentId }
  );
  
  // Mutations para ações
  const transplantMutation = trpc.plants.transplantToFlora.useMutation({
    onSuccess: (data) => {
      toast.success(`Planta transplantada para ${data.tentName} com sucesso!`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao transplantar: ${error.message}`);
    },
  });
  
  const harvestMutation = trpc.plants.finish.useMutation({
    onSuccess: () => {
      toast.success('✅ Planta marcada como colhida com sucesso!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao marcar como colhida: ${error.message}`);
    },
  });
  
  // Handlers
  const handleTransplantToFlora = () => {
    if (confirm('Deseja transplantar esta planta para a estufa de Flora?')) {
      transplantMutation.mutate({ plantId });
    }
  };
  
  const handleHarvest = () => {
    if (confirm('Deseja marcar esta planta como colhida?')) {
      harvestMutation.mutate({ plantId, status: 'HARVESTED' });
    }
  };

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
          <Button variant="outline" asChild>
            <Link href="/plants">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
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



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/plants">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{plant.name}</h1>
                {plant.code && (
                  <p className="text-sm text-muted-foreground font-mono">{plant.code}</p>
                )}
              </div>
              {/* Badge de fase/semana da estufa */}
              {tent && (
                <div className="px-3 py-1 rounded-md text-sm font-medium border bg-primary/10 text-primary border-primary/30">
                  {tent.currentPhase === "VEGA" ? "🌱" : "🌺"} {tent.currentPhase === "VEGA" ? "Vega" : "Flora"} Semana {tent.currentWeek}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              
              {/* Menu de Ações Rápidas */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <MoreVertical className="w-4 h-4 mr-2" />
                    Ações
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {tent?.currentPhase === "VEGA" && (
                    <DropdownMenuItem onClick={handleTransplantToFlora}>
                      <Flower2 className="w-4 h-4 mr-2" />
                      Transplantar para Flora
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setMoveTentModalOpen(true)}>
                    <MoveRight className="w-4 h-4 mr-2" />
                    Mover para Outra Estufa
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleHarvest} className="text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Colhida
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 pb-24 md:pb-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
        <Tabs defaultValue="health" className="w-full">
          <TabsList className="flex w-full overflow-x-auto">
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
            <TabsTrigger value="observations">
              <FileText className="w-4 h-4 mr-2" />
              Observações
            </TabsTrigger>

          </TabsList>

          <TabsContent value="health">
            <PlantHealthTab plantId={plantId} />
          </TabsContent>

          <TabsContent value="trichomes">
            <PlantTrichomesTab plantId={plantId} />
          </TabsContent>

          <TabsContent value="lst">
            <PlantLSTTab plantId={plantId} />
          </TabsContent>

          <TabsContent value="observations">
            <PlantObservationsTab plantId={plantId} />
          </TabsContent>


        </Tabs>
      </main>
      
      {/* Modal de Mover Estufa */}
      <MoveTentModal
        open={moveTentModalOpen}
        onOpenChange={setMoveTentModalOpen}
        plantId={plantId}
        plantName={plant?.name || ""}
        currentTentId={plant?.currentTentId || 0}
        onSuccess={refetch}
      />
    </div>
  );
}

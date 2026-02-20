import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Sprout, Search, Filter, ChevronDown, ChevronRight, MoveRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";
import { useLocation } from "wouter";

export default function PlantsList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ACTIVE" | "HARVESTED" | "DEAD" | undefined>();
  
  // Ler query param ?tent=ID para auto-expandir estufa
  const tentParam = new URLSearchParams(window.location.search).get('tent');
  const [expandedTents, setExpandedTents] = useState<Set<number>>(
    tentParam ? new Set([parseInt(tentParam)]) : new Set()
  );
  const [movePlantDialog, setMovePlantDialog] = useState<{
    open: boolean;
    plant?: any;
    fromTentId?: number;
  }>({ open: false });
  const [targetTentId, setTargetTentId] = useState<number | undefined>();

  const { data: plants, isLoading } = trpc.plants.list.useQuery({
    status: filterStatus,
  });

  const { data: tents } = trpc.tents.list.useQuery();
  const { data: strains } = trpc.strains.list.useQuery();

  const utils = trpc.useUtils();
  const movePlant = trpc.plants.moveTent.useMutation({
    onSuccess: () => {
      utils.plants.list.invalidate();
      toast.success("Planta movida com sucesso!");
      setMovePlantDialog({ open: false });
      setTargetTentId(undefined);
    },
    onError: (error) => {
      toast.error(`Erro ao mover planta: ${error.message}`);
    },
  });

  const filteredPlants = plants?.filter((plant) =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar plantas por estufa
  const plantsByTent = filteredPlants?.reduce((acc, plant) => {
    if (!acc[plant.currentTentId]) {
      acc[plant.currentTentId] = [];
    }
    acc[plant.currentTentId].push(plant);
    return acc;
  }, {} as Record<number, typeof plants>);

  const getStrainName = (strainId: number) => {
    return strains?.find((s) => s.id === strainId)?.name || "Unknown";
  };

  const getTentName = (tentId: number) => {
    return tents?.find((t) => t.id === tentId)?.name || "Unknown";
  };

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

  const toggleTent = (tentId: number) => {
    const newExpanded = new Set(expandedTents);
    if (newExpanded.has(tentId)) {
      newExpanded.delete(tentId);
    } else {
      newExpanded.add(tentId);
    }
    setExpandedTents(newExpanded);
  };

  const handleMovePlant = (plant: any, fromTentId: number) => {
    setMovePlantDialog({ open: true, plant, fromTentId });
    setTargetTentId(undefined);
  };

  const confirmMovePlant = () => {
    if (!movePlantDialog.plant || !targetTentId) return;

    movePlant.mutate({
      plantId: movePlantDialog.plant.id,
      toTentId: targetTentId,
      reason: "Mudança de fase/estufa",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Minhas Plantas</h1>
                <p className="text-sm text-muted-foreground">Agrupadas por estufa</p>
              </div>
            </div>
            <Link href="/plants/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Planta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Nome ou código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterStatus">Status</Label>
                <select
                  id="filterStatus"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filterStatus || ""}
                  onChange={(e) => setFilterStatus(e.target.value as any || undefined)}
                >
                  <option value="">Todos</option>
                  <option value="ACTIVE">Ativa</option>
                  <option value="HARVESTED">Colhida</option>
                  <option value="DEAD">Morta</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plants Grouped by Tent */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Carregando plantas...</p>
          </div>
        ) : filteredPlants && filteredPlants.length > 0 ? (
          <div className="space-y-4">
            {tents?.map((tent) => {
              const tentPlants = plantsByTent?.[tent.id] || [];
              if (tentPlants.length === 0) return null;

              const isExpanded = expandedTents.has(tent.id);

              return (
                <Card key={tent.id} className="overflow-hidden">
                  <CardHeader
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleTent(tent.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div>
                          <CardTitle className="text-xl">{tent.name}</CardTitle>
                          <CardDescription>
                            {tentPlants.length} {tentPlants.length === 1 ? "planta" : "plantas"}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tentPlants.map((plant: any) => (
                          <Card key={plant.id} className="border-2 hover:border-primary/50 transition-all">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <Link href={`/plants/${plant.id}`} className="flex-1">
                                  <CardTitle className="text-lg hover:text-primary transition-colors cursor-pointer">
                                    {plant.name}
                                  </CardTitle>
                                  {plant.code && (
                                    <CardDescription className="text-sm font-mono">{plant.code}</CardDescription>
                                  )}
                                </Link>
                                <div className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(plant.status)}`}>
                                  {getStatusLabel(plant.status)}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {/* Última foto da planta */}
                              {plant.lastHealthPhotoUrl && (
                                <div className="w-full aspect-[3/4] rounded-lg overflow-hidden">
                                  <img
                                    src={plant.lastHealthPhotoUrl}
                                    alt={plant.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}

                              {/* Indicadores visuais */}
                              <div className="flex flex-wrap gap-2">
                                {/* Fase do Ciclo */}
                                {plant.cyclePhase && plant.cycleWeek && (
                                  <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                                    plant.cyclePhase === "VEGA" 
                                      ? "bg-green-500/10 text-green-600 border border-green-500/30" 
                                      : "bg-purple-500/10 text-purple-600 border border-purple-500/30"
                                  }`}>
                                    {plant.cyclePhase === "VEGA" ? "🌱" : "🌸"} {plant.cyclePhase === "VEGA" ? "Vega" : "Flora"} Semana {plant.cycleWeek}
                                  </div>
                                )}
                                {/* Saúde */}
                                {plant.lastHealthStatus && (
                                  <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                                    plant.lastHealthStatus === "HEALTHY" ? "bg-green-500/10 text-green-600 border border-green-500/30" :
                                    plant.lastHealthStatus === "STRESSED" ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/30" :
                                    plant.lastHealthStatus === "SICK" ? "bg-red-500/10 text-red-600 border border-red-500/30" :
                                    "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                                  }`}>
                                    {plant.lastHealthStatus === "HEALTHY" ? "💚 Saudável" :
                                     plant.lastHealthStatus === "STRESSED" ? "💛 Estressada" :
                                     plant.lastHealthStatus === "SICK" ? "❤️ Doente" :
                                     "💙 Recuperando"}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Strain:</span>
                                  <span className="font-medium">{getStrainName(plant.strainId)}</span>
                                </div>
                              </div>

                              {plant.status === "ACTIVE" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full gap-2"
                                  onClick={() => handleMovePlant(plant, tent.id)}
                                >
                                  <MoveRight className="w-4 h-4" />
                                  Mover para outra estufa
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Sprout}
            title="Nenhuma planta encontrada"
            description="Comece adicionando sua primeira planta para acompanhar o crescimento e desenvolvimento."
            actionLabel="Nova Planta"
            onAction={() => navigate("/plants/new")}
          />
        )}
      </main>

      {/* Move Plant Dialog */}
      <Dialog open={movePlantDialog.open} onOpenChange={(open) => setMovePlantDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover Planta</DialogTitle>
            <DialogDescription>
              Selecione a estufa de destino para {movePlantDialog.plant?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Estufa Atual</Label>
              <Input
                value={getTentName(movePlantDialog.fromTentId || 0)}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetTent">Estufa de Destino</Label>
              <select
                id="targetTent"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={targetTentId || ""}
                onChange={(e) => setTargetTentId(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Selecione uma estufa</option>
                {tents
                  ?.filter((t) => t.id !== movePlantDialog.fromTentId)
                  .map((tent) => (
                    <option key={tent.id} value={tent.id}>
                      {tent.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMovePlantDialog({ open: false })}
              disabled={movePlant.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmMovePlant}
              disabled={!targetTentId || movePlant.isPending}
            >
              {movePlant.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Movendo...
                </>
              ) : (
                <>
                  <MoveRight className="w-4 h-4 mr-2" />
                  Mover Planta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

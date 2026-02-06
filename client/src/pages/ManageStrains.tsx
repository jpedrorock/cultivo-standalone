import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, ArrowLeft, Copy } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ManageStrains() {
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [selectedStrain, setSelectedStrain] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [vegaWeeks, setVegaWeeks] = useState(4);
  const [floraWeeks, setFloraWeeks] = useState(8);

  const { data: strains = [], refetch } = trpc.strains.list.useQuery();
  const createStrain = trpc.strains.create.useMutation();
  const updateStrain = trpc.strains.update.useMutation();
  const deleteStrain = trpc.strains.delete.useMutation();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Nome da strain é obrigatório");
      return;
    }

    try {
      await createStrain.mutateAsync({ name, description, vegaWeeks, floraWeeks });
      toast.success("Strain criada com sucesso!");
      setIsCreateOpen(false);
      setName("");
      setDescription("");
      setVegaWeeks(4);
      setFloraWeeks(8);
      refetch();
    } catch (error) {
      toast.error("Erro ao criar strain");
    }
  };

  const handleEdit = async () => {
    if (!selectedStrain || !name.trim()) {
      toast.error("Nome da strain é obrigatório");
      return;
    }

    try {
      await updateStrain.mutateAsync({
        id: selectedStrain.id,
        name,
        description,
        vegaWeeks,
        floraWeeks,
      });
      toast.success("Strain atualizada com sucesso!");
      setIsEditOpen(false);
      setSelectedStrain(null);
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar strain");
    }
  };

  const handleDelete = async () => {
    if (!selectedStrain) return;

    try {
      await deleteStrain.mutateAsync({ id: selectedStrain.id });
      toast.success("Strain deletada com sucesso!");
      setIsDeleteOpen(false);
      setSelectedStrain(null);
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar strain");
    }
  };

  const openEditDialog = (strain: any) => {
    setSelectedStrain(strain);
    setName(strain.name);
    setDescription(strain.description || "");
    setVegaWeeks(strain.vegaWeeks);
    setFloraWeeks(strain.floraWeeks);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (strain: any) => {
    setSelectedStrain(strain);
    setIsDeleteOpen(true);
  };

  const openDuplicateDialog = (strain: any) => {
    setSelectedStrain(strain);
    setName(strain.name + " (Cópia)");
    setDescription(strain.description || "");
    setVegaWeeks(strain.vegaWeeks);
    setFloraWeeks(strain.floraWeeks);
    setIsDuplicateOpen(true);
  };

  const duplicateStrain = trpc.strains.duplicate.useMutation();

  const handleDuplicate = async () => {
    if (!selectedStrain || !name.trim()) {
      toast.error("Nome da strain é obrigatório");
      return;
    }

    try {
      await duplicateStrain.mutateAsync({
        sourceStrainId: selectedStrain.id,
        name,
        description,
        vegaWeeks,
        floraWeeks,
      });
      
      toast.success("Strain duplicada com sucesso! Todos os parâmetros ideais foram copiados.");
      setIsDuplicateOpen(false);
      setSelectedStrain(null);
      setName("");
      setDescription("");
      setVegaWeeks(4);
      setFloraWeeks(8);
      refetch();
    } catch (error) {
      toast.error("Erro ao duplicar strain");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="hover:bg-white/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Strains</h1>
              <p className="text-gray-600 mt-1">
                Crie e edite variedades de plantas com seus parâmetros ideais
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Strain
          </Button>
        </div>

        {/* Strains Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strains.map((strain) => (
            <Card key={strain.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{strain.name}</CardTitle>
                    <CardDescription className="mt-1">
                      <span className="text-xs text-gray-500">
                        Vega: {strain.vegaWeeks} semanas | Flora: {strain.floraWeeks} semanas
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDuplicateDialog(strain)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Duplicar strain"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(strain)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(strain)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {strain.description || "Sem descrição"}
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setLocation(`/strains/${strain.id}/targets`)}
                >
                  Editar Parâmetros Ideais
                </Button>
              </CardContent>
            </Card>
          ))}

          {strains.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 text-center mb-4">
                  Nenhuma strain cadastrada ainda
                </p>
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Strain
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Strain</DialogTitle>
            <DialogDescription>
              Crie uma nova variedade de planta. Você poderá definir os parâmetros ideais depois.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Blue Dream, OG Kush..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vegaWeeks">Semanas VEGA</Label>
                <Input
                  id="vegaWeeks"
                  type="number"
                  min={1}
                  max={12}
                  value={vegaWeeks}
                  onChange={(e) => setVegaWeeks(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="floraWeeks">Semanas FLORA</Label>
                <Input
                  id="floraWeeks"
                  type="number"
                  min={1}
                  max={16}
                  value={floraWeeks}
                  onChange={(e) => setFloraWeeks(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Características, efeitos, notas..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={createStrain.isPending}
            >
              {createStrain.isPending ? "Criando..." : "Criar Strain"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Strain</DialogTitle>
            <DialogDescription>Atualize as informações da strain.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-vegaWeeks">Semanas VEGA</Label>
                <Input
                  id="edit-vegaWeeks"
                  type="number"
                  min={1}
                  max={12}
                  value={vegaWeeks}
                  onChange={(e) => setVegaWeeks(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="edit-floraWeeks">Semanas FLORA</Label>
                <Input
                  id="edit-floraWeeks"
                  type="number"
                  min={1}
                  max={16}
                  value={floraWeeks}
                  onChange={(e) => setFloraWeeks(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEdit}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={updateStrain.isPending}
            >
              {updateStrain.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Strain</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar <strong>{selectedStrain?.name}</strong>? Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              disabled={deleteStrain.isPending}
            >
              {deleteStrain.isPending ? "Deletando..." : "Deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={isDuplicateOpen} onOpenChange={setIsDuplicateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar Strain</DialogTitle>
            <DialogDescription>
              Crie uma cópia de <strong>{selectedStrain?.name}</strong> com todos os parâmetros ideais.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="dup-name">Nome *</Label>
              <Input
                id="dup-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Blue Dream V2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dup-vegaWeeks">Semanas VEGA</Label>
                <Input
                  id="dup-vegaWeeks"
                  type="number"
                  min={1}
                  max={12}
                  value={vegaWeeks}
                  onChange={(e) => setVegaWeeks(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="dup-floraWeeks">Semanas FLORA</Label>
                <Input
                  id="dup-floraWeeks"
                  type="number"
                  min={1}
                  max={16}
                  value={floraWeeks}
                  onChange={(e) => setFloraWeeks(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dup-description">Descrição</Label>
              <Textarea
                id="dup-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Características, efeitos, notas..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDuplicateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleDuplicate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={duplicateStrain.isPending}
            >
              {duplicateStrain.isPending ? "Duplicando..." : "Duplicar Strain"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

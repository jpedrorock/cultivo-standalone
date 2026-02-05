import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Pencil, Trash2, Sprout } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Strains() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStrain, setEditingStrain] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    vegaWeeks: 4,
    floraWeeks: 8,
  });

  const { data: strains, isLoading } = trpc.strains.list.useQuery();
  const utils = trpc.useUtils();

  const createStrain = trpc.strains.create.useMutation({
    onSuccess: () => {
      utils.strains.list.invalidate();
      toast.success("Strain criada com sucesso!");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Erro ao criar strain: ${error.message}`);
    },
  });

  const updateStrain = trpc.strains.update.useMutation({
    onSuccess: () => {
      utils.strains.list.invalidate();
      toast.success("Strain atualizada com sucesso!");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar strain: ${error.message}`);
    },
  });

  const deleteStrain = trpc.strains.delete.useMutation({
    onSuccess: () => {
      utils.strains.list.invalidate();
      toast.success("Strain excluída com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir strain: ${error.message}`);
    },
  });

  const handleOpenDialog = (strain?: any) => {
    if (strain) {
      setEditingStrain(strain);
      setFormData({
        name: strain.name,
        description: strain.description || "",
        vegaWeeks: strain.vegaWeeks,
        floraWeeks: strain.floraWeeks,
      });
    } else {
      setEditingStrain(null);
      setFormData({
        name: "",
        description: "",
        vegaWeeks: 4,
        floraWeeks: 8,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStrain(null);
    setFormData({
      name: "",
      description: "",
      vegaWeeks: 4,
      floraWeeks: 8,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStrain) {
      updateStrain.mutate({
        id: editingStrain.id,
        ...formData,
      });
    } else {
      createStrain.mutate(formData);
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a strain "${name}"?`)) {
      deleteStrain.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors">
              <Sprout className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-bold">App Cultivo</h1>
                <p className="text-xs text-gray-600">Gerenciamento de Strains</p>
              </div>
            </button>
          </Link>
          <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Strain
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-600" />
              Variedades Cadastradas
            </CardTitle>
            <CardDescription>
              Gerencie as strains disponíveis para seus ciclos de cultivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {strains && strains.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center">Vega (semanas)</TableHead>
                    <TableHead className="text-center">Flora (semanas)</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strains.map((strain) => (
                    <TableRow key={strain.id}>
                      <TableCell className="font-medium">{strain.name}</TableCell>
                      <TableCell className="text-gray-600">
                        {strain.description || "-"}
                      </TableCell>
                      <TableCell className="text-center">{strain.vegaWeeks}</TableCell>
                      <TableCell className="text-center">{strain.floraWeeks}</TableCell>
                      <TableCell className="text-center font-medium">
                        {strain.vegaWeeks + strain.floraWeeks} semanas
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(strain)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(strain.id, strain.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Sprout className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">Nenhuma strain cadastrada</p>
                <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeira Strain
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStrain ? "Editar Strain" : "Nova Strain"}
            </DialogTitle>
            <DialogDescription>
              {editingStrain
                ? "Atualize as informações da strain"
                : "Cadastre uma nova variedade para seus ciclos"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Northern Lights"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Características da strain"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vegaWeeks">Vega (semanas) *</Label>
                  <Input
                    id="vegaWeeks"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.vegaWeeks}
                    onChange={(e) =>
                      setFormData({ ...formData, vegaWeeks: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floraWeeks">Flora (semanas) *</Label>
                  <Input
                    id="floraWeeks"
                    type="number"
                    min="1"
                    max="16"
                    value={formData.floraWeeks}
                    onChange={(e) =>
                      setFormData({ ...formData, floraWeeks: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-sm text-gray-700">
                <strong>Duração total:</strong> {formData.vegaWeeks + formData.floraWeeks} semanas
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={createStrain.isPending || updateStrain.isPending}
              >
                {(createStrain.isPending || updateStrain.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingStrain ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

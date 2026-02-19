import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Edit, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

type Phase = "VEGA" | "FLORA" | "MAINTENANCE";
type Context = "TENT_A" | "TENT_BC";

interface TaskTemplate {
  id: number;
  title: string;
  description: string | null;
  phase: Phase;
  weekNumber: number | null;
  context: Context;
}

export function TaskTemplatesManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    phase: "VEGA" as Phase,
    weekNumber: 1,
    context: "TENT_BC" as Context,
  });

  const { data: templates, isLoading } = trpc.taskTemplates.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.taskTemplates.create.useMutation({
    onSuccess: () => {
      utils.taskTemplates.list.invalidate();
      utils.tasks.getTasksByTent.invalidate();
      toast.success("Template de tarefa criado!");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Erro ao criar template: ${error.message}`);
    },
  });

  const updateMutation = trpc.taskTemplates.update.useMutation({
    onSuccess: () => {
      utils.taskTemplates.list.invalidate();
      utils.tasks.getTasksByTent.invalidate();
      toast.success("Template de tarefa atualizado!");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar template: ${error.message}`);
    },
  });

  const deleteMutation = trpc.taskTemplates.delete.useMutation({
    onSuccess: () => {
      utils.taskTemplates.list.invalidate();
      utils.tasks.getTasksByTent.invalidate();
      toast.success("Template de tarefa excluído!");
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    },
    onError: (error) => {
      toast.error(`Erro ao excluir template: ${error.message}`);
    },
  });

  const handleOpenDialog = (template?: TaskTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        title: template.title,
        description: template.description || "",
        phase: template.phase,
        weekNumber: template.weekNumber || 1,
        context: template.context,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        title: "",
        description: "",
        phase: "VEGA",
        weekNumber: 1,
        context: "TENT_BC",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
    setFormData({
      title: "",
      description: "",
      phase: "VEGA",
      weekNumber: 1,
      context: "TENT_BC",
    });
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    const payload = {
      ...formData,
      weekNumber: formData.phase === "MAINTENANCE" ? null : formData.weekNumber,
    };

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate({ id: templateToDelete });
    }
  };

  const getPhaseLabel = (phase: Phase) => {
    const labels: Record<Phase, string> = {
      VEGA: "Vegetativo",
      FLORA: "Floração",
      MAINTENANCE: "Manutenção",
    };
    return labels[phase];
  };

  const getContextLabel = (context: Context) => {
    return context === "TENT_A" ? "Estufa A" : "Estufas B/C";
  };

  // Filtrar templates por busca
  const filteredTemplates = templates?.filter((template: TaskTemplate) => {
    const query = searchQuery.toLowerCase();
    return (
      template.title.toLowerCase().includes(query) ||
      (template.description && template.description.toLowerCase().includes(query))
    );
  });

  const groupedTemplates = filteredTemplates?.reduce((acc: any, template: any) => {
    const key = `${template.phase}-${template.context}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(template);
    return acc;
  }, {} as Record<string, TaskTemplate[]>) as Record<string, TaskTemplate[]>;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Tarefas</h2>
          <p className="text-muted-foreground">
            Crie, edite ou remova templates de tarefas para cada fase e estufa
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por título ou descrição..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Accordion type="multiple" className="space-y-4">
        {groupedTemplates && Object.entries(groupedTemplates).map(([key, templates]) => {
          const [phase, context] = key.split("-") as [Phase, Context];
          return (
            <AccordionItem key={key} value={key} className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2 text-left">
                  <span className="font-semibold">{getPhaseLabel(phase)} - {getContextLabel(context)}</span>
                  <Badge variant="outline">{templates.length} tarefas</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-2">
                  {templates
                    .sort((a: any, b: any) => (a.weekNumber || 0) - (b.weekNumber || 0))
                    .map((template: any) => (
                      <div
                        key={template.id}
                        className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{template.title}</span>
                            {template.weekNumber && (
                              <Badge variant="secondary" className="text-xs">
                                Semana {template.weekNumber}
                              </Badge>
                            )}
                          </div>
                          {template.description && (
                            <p className="text-sm text-muted-foreground">
                              {template.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(template.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Editar Tarefa" : "Nova Tarefa"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? "Atualize os dados da tarefa"
                : "Crie um novo template de tarefa"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Verificar pH do solo"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes opcionais da tarefa..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phase">Fase *</Label>
                <Select
                  value={formData.phase}
                  onValueChange={(value) =>
                    setFormData({ ...formData, phase: value as Phase })
                  }
                >
                  <SelectTrigger id="phase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLONING">Clonagem</SelectItem>
                    <SelectItem value="VEGA">Vegetativo</SelectItem>
                    <SelectItem value="FLORA">Floração</SelectItem>
                    <SelectItem value="MAINTENANCE">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="context">Estufa *</Label>
                <Select
                  value={formData.context}
                  onValueChange={(value) =>
                    setFormData({ ...formData, context: value as Context })
                  }
                >
                  <SelectTrigger id="context">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TENT_A">Estufa A</SelectItem>
                    <SelectItem value="TENT_BC">Estufas B/C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.phase !== "MAINTENANCE" && (
              <div>
                <Label htmlFor="weekNumber">Semana *</Label>
                <Input
                  id="weekNumber"
                  type="number"
                  min={1}
                  max={12}
                  value={formData.weekNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, weekNumber: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingTemplate ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este template de tarefa? Esta ação também
              removerá todas as instâncias de tarefas associadas e não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

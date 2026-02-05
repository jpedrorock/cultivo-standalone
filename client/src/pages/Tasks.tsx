import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Circle, Sprout } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Tasks() {
  const { data: tasks, isLoading } = trpc.tasks.getCurrentWeekTasks.useQuery();
  const utils = trpc.useUtils();

  const markAsDone = trpc.tasks.markAsDone.useMutation({
    onSuccess: () => {
      utils.tasks.getCurrentWeekTasks.invalidate();
      toast.success("Tarefa marcada como concluída!");
    },
    onError: (error) => {
      toast.error(`Erro ao marcar tarefa: ${error.message}`);
    },
  });

  const handleToggleTask = (taskId: number, isDone: boolean) => {
    if (!isDone && taskId > 0) {
      markAsDone.mutate({ taskId });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Group tasks by tent
  const tasksByTent = tasks?.reduce((acc: Record<string, any[]>, task) => {
    const key = `${task.tentName}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(task);
    return acc;
  }, {}) || {};

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((t) => t.isDone).length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Sprout className="w-6 h-6 text-green-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tarefas Semanais</h1>
              <p className="text-sm text-gray-600">Tarefas organizadas por estufa e semana do ciclo</p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            {completedTasks}/{totalTasks} concluídas
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Card */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-green-100">
          <CardHeader>
            <CardTitle className="text-lg">Progresso Geral</CardTitle>
            <CardDescription>Acompanhe a conclusão das tarefas da semana atual de cada ciclo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progresso</span>
                <span className="font-semibold text-green-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{completedTasks} concluídas</span>
                <span>{totalTasks - completedTasks} pendentes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks by Tent */}
        {tasks && tasks.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(tasksByTent).map(([tentName, tentTasks]) => {
              const tentCompleted = tentTasks.filter((t) => t.isDone).length;
              const tentTotal = tentTasks.length;
              const firstTask = tentTasks[0];

              return (
                <Card key={tentName} className="bg-white/80 backdrop-blur-sm border-green-100">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{tentName}</CardTitle>
                        <CardDescription>
                          {firstTask?.phase === "VEGA" ? "Vegetativa" : "Floração"} • Semana {firstTask?.weekNumber} do ciclo
                        </CardDescription>
                      </div>
                      <Badge
                        variant={firstTask?.phase === "VEGA" ? "default" : "secondary"}
                        className={
                          firstTask?.phase === "VEGA"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-purple-500 hover:bg-purple-600"
                        }
                      >
                        {tentCompleted}/{tentTotal}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tentTasks.map((task) => (
                        <div
                          key={task.id || task.title}
                          className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                            task.isDone
                              ? "bg-green-50 border-green-200"
                              : "bg-white border-gray-200 hover:border-green-300"
                          }`}
                        >
                          <Checkbox
                            checked={task.isDone}
                            onCheckedChange={() => handleToggleTask(task.id, task.isDone)}
                            disabled={task.isDone || task.id === 0}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4
                                className={`font-medium ${
                                  task.isDone ? "text-gray-500 line-through" : "text-gray-900"
                                }`}
                              >
                                {task.title}
                              </h4>
                              {task.isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                              )}
                            </div>
                            {task.description && (
                              <p className={`text-sm mt-1 ${task.isDone ? "text-gray-400" : "text-gray-600"}`}>
                                {task.description}
                              </p>
                            )}
                            {task.completedAt && (
                              <p className="text-xs text-gray-500 mt-2">
                                Concluída em {new Date(task.completedAt).toLocaleDateString("pt-BR")}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-green-100">
            <CardContent className="py-12 text-center">
              <Circle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma tarefa</h3>
              <p className="text-gray-600">
                Não há ciclos ativos no momento. Inicie um ciclo para ver as tarefas semanais.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

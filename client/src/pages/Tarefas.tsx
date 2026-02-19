import { TaskTemplatesManager } from "@/components/TaskTemplatesManager";

export default function Tarefas() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gerenciar Tarefas</h1>
        <p className="text-muted-foreground">
          Crie e gerencie templates de tarefas para cada fase e estufa
        </p>
      </div>

      <TaskTemplatesManager />
    </div>
  );
}

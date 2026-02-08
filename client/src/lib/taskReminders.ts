/**
 * Task Reminder Notification Service
 * Checks for pending tasks and sends reminders
 */

import { showNotification } from "./notifications";

export interface PendingTask {
  id: number;
  tentId: number;
  tentName: string;
  title: string;
  description: string;
  occurrenceDate: Date;
}

/**
 * Check if task reminders are enabled
 */
export function areTaskRemindersEnabled(): boolean {
  const settings = localStorage.getItem('notificationConfig');
  if (!settings) return false;
  
  try {
    const config = JSON.parse(settings);
    return config.taskRemindersEnabled === true;
  } catch {
    return false;
  }
}

/**
 * Get days until end of week (Sunday)
 */
export function getDaysUntilEndOfWeek(): number {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
}

/**
 * Show notification for pending tasks
 */
export async function showTaskReminderNotification(pendingTasks: PendingTask[]): Promise<void> {
  if (pendingTasks.length === 0) return;

  const daysLeft = getDaysUntilEndOfWeek();
  let urgencyLevel: 'low' | 'medium' | 'high' = 'low';
  let icon = '📋';

  if (daysLeft === 0) {
    urgencyLevel = 'high';
    icon = '🚨';
  } else if (daysLeft === 1) {
    urgencyLevel = 'medium';
    icon = '⚠️';
  }

  // Group tasks by tent
  const tasksByTent = pendingTasks.reduce((acc, task) => {
    if (!acc[task.tentName]) {
      acc[task.tentName] = [];
    }
    acc[task.tentName].push(task);
    return {};
  }, {} as Record<string, PendingTask[]>);

  const tentNames = Object.keys(tasksByTent);
  const totalTasks = pendingTasks.length;

  let title: string;
  let body: string;

  if (daysLeft === 0) {
    title = `${icon} Último Dia! Tarefas Pendentes`;
    body = `Hoje é o último dia da semana! ${totalTasks} tarefa(s) ainda não concluída(s) em ${tentNames.length} estufa(s).`;
  } else if (daysLeft === 1) {
    title = `${icon} Lembrete: Tarefas Pendentes`;
    body = `Falta 1 dia para o fim da semana. ${totalTasks} tarefa(s) pendente(s) em ${tentNames.length} estufa(s).`;
  } else {
    title = `${icon} Tarefas Semanais Pendentes`;
    body = `Faltam ${daysLeft} dias para o fim da semana. ${totalTasks} tarefa(s) ainda não concluída(s).`;
  }

  await showNotification(title, {
    body,
    tag: 'task-reminder',
    requireInteraction: urgencyLevel === 'high',
    vibrate: urgencyLevel === 'high' ? [200, 100, 200, 100, 200] : [200, 100, 200],
    data: { url: '/' },
  });
}

/**
 * Check pending tasks and send reminder if needed
 * Should be called daily
 */
export async function checkAndNotifyPendingTasks(
  getPendingTasksFn: () => Promise<PendingTask[]>
): Promise<void> {
  if (!areTaskRemindersEnabled()) {
    return;
  }

  const daysLeft = getDaysUntilEndOfWeek();
  
  // Send reminders on: 2 days before, 1 day before, and last day
  if (daysLeft === 2 || daysLeft === 1 || daysLeft === 0) {
    const pendingTasks = await getPendingTasksFn();
    if (pendingTasks.length > 0) {
      await showTaskReminderNotification(pendingTasks);
    }
  }
}

/**
 * Schedule daily check for pending tasks
 * Checks at 9 AM every day
 */
export function scheduleDailyTaskCheck(
  getPendingTasksFn: () => Promise<PendingTask[]>
): () => void {
  const checkTime = { hour: 9, minute: 0 };
  
  const scheduleNextCheck = () => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(checkTime.hour, checkTime.minute, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const msUntilCheck = scheduledTime.getTime() - now.getTime();

    return setTimeout(async () => {
      await checkAndNotifyPendingTasks(getPendingTasksFn);
      // Schedule next check
      scheduleNextCheck();
    }, msUntilCheck);
  };

  const timeoutId = scheduleNextCheck();

  // Return cleanup function
  return () => clearTimeout(timeoutId);
}

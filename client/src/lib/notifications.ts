/**
 * Push Notification Service
 * Handles browser push notifications for daily reminders and alerts
 */

import { playNotificationSound } from './notificationSounds';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default';
export type NotificationType = 'daily_reminder' | 'environment_alert' | 'task_reminder';

/**
 * Check if push notifications are supported in this browser
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermissionStatus {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (!isNotificationSupported()) {
    console.warn('Push notifications are not supported in this browser');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Show a push notification
 */
export async function showNotification(
  title: string,
  options?: NotificationOptions,
  soundType?: NotificationType
): Promise<void> {
  if (getNotificationPermission() !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    // Play notification sound if type is provided
    if (soundType) {
      playNotificationSound(soundType);
    }

    // If service worker is available, use it
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icon-192.png',
        badge: '/icon-96.png',
        ...options,
      });
    } else {
      // Fallback to basic notification
      new Notification(title, {
        icon: '/icon-192.png',
        ...options,
      });
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Show daily reminder notification
 */
export async function showDailyReminder(): Promise<void> {
  await showNotification('📝 Hora de Registrar!', {
    body: 'Não esqueça de registrar os dados das suas estufas hoje.',
    tag: 'daily-reminder',
    requireInteraction: false,
    data: { url: '/' },
  }, 'daily_reminder');
}

/**
 * Show alert notification for out-of-range values
 */
export async function showAlertNotification(
  tentName: string,
  metric: string,
  value: number,
  target: string
): Promise<void> {
  const metricNames: Record<string, string> = {
    temp: 'Temperatura',
    rh: 'Umidade',
    ppfd: 'PPFD',
  };

  await showNotification(`⚠️ Alerta: ${tentName}`, {
    body: `${metricNames[metric] || metric}: ${value} está fora da faixa ideal (${target})`,
    tag: `alert-${tentName}-${metric}`,
    requireInteraction: true,
    data: { url: '/alerts' },
  }, 'environment_alert');
}

/**
 * Schedule multiple daily reminders at specific times
 * Note: This uses setTimeout and will be reset on page reload
 * For persistent scheduling, use a backend service or service worker
 */
export function scheduleMultipleDailyReminders(times: string[]): () => void {
  const cleanupFunctions: Array<() => void> = [];

  times.forEach((time) => {
    const [hour, minute] = time.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute)) {
      console.warn(`Invalid time format: ${time}`);
      return;
    }
    const cleanup = scheduleDailyReminder(hour, minute);
    cleanupFunctions.push(cleanup);
  });

  // Return cleanup function that clears all scheduled reminders
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
}

/**
 * Schedule daily reminder at specific time
 * Note: This uses setTimeout and will be reset on page reload
 * For persistent scheduling, use a backend service or service worker
 */
export function scheduleDailyReminder(hour: number, minute: number): () => void {
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(hour, minute, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const msUntilReminder = scheduledTime.getTime() - now.getTime();

  const timeoutId = setTimeout(() => {
    showDailyReminder();
    // Reschedule for next day
    scheduleDailyReminder(hour, minute);
  }, msUntilReminder);

  // Return cleanup function
  return () => clearTimeout(timeoutId);
}

/**
 * Migrate old single reminderTime to new reminderTimes array
 */
export function migrateReminderConfig(config: any): any {
  // If old format (reminderTime: string), convert to new format (reminderTimes: string[])
  if (config.reminderTime && !config.reminderTimes) {
    return {
      ...config,
      reminderTimes: [config.reminderTime],
      reminderTime: undefined, // Remove old field
    };
  }
  return config;
}

/**
 * Show notification for tent without recent reading (red badge)
 */
export async function showMissingReadingAlert(
  tentName: string,
  hoursSinceLastReading: number
): Promise<void> {
  await showNotification(`⚠️ ${tentName} - Sem Registro!`, {
    body: `Sem registro há ${hoursSinceLastReading}h. Clique para registrar agora.`,
    tag: `missing-reading-${tentName}`,
    requireInteraction: true,
    data: { url: '/quick-log', tentName },
  }, 'environment_alert');
}

/**
 * Check all tents for missing readings and send notifications
 * Should be called periodically (e.g., every hour)
 */
export async function checkAndNotifyMissingReadings(
  tents: Array<{ id: number; name: string; lastReadingAt: number | null }>
): Promise<void> {
  const now = Date.now();
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  const notifiedKey = 'notifiedMissingReadings';

  // Get list of already notified tents (to avoid duplicates)
  const notified = JSON.parse(localStorage.getItem(notifiedKey) || '{}');

  for (const tent of tents) {
    if (!tent.lastReadingAt) continue;

    const timeSinceReading = now - tent.lastReadingAt;
    const hoursSince = Math.floor(timeSinceReading / (60 * 60 * 1000));

    // If more than 24h and not notified yet
    if (timeSinceReading > TWENTY_FOUR_HOURS_MS && !notified[tent.id]) {
      await showMissingReadingAlert(tent.name, hoursSince);
      notified[tent.id] = now; // Mark as notified
    }

    // Reset notification flag if reading was updated (less than 24h)
    if (timeSinceReading <= TWENTY_FOUR_HOURS_MS && notified[tent.id]) {
      delete notified[tent.id];
    }
  }

  // Save updated notification state
  localStorage.setItem(notifiedKey, JSON.stringify(notified));
}

/**
 * Start periodic check for missing readings
 * Checks every hour
 */
export function startMissingReadingsMonitor(
  getTents: () => Promise<Array<{ id: number; name: string; lastReadingAt: number | null }>>
): () => void {
  const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  const check = async () => {
    try {
      const tents = await getTents();
      await checkAndNotifyMissingReadings(tents);
    } catch (error) {
      console.error('Error checking missing readings:', error);
    }
  };

  // Run first check immediately
  check();

  // Schedule periodic checks
  const intervalId = setInterval(check, CHECK_INTERVAL_MS);

  // Return cleanup function
  return () => clearInterval(intervalId);
}

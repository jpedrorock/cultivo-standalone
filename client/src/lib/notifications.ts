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

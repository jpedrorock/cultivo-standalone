// Helper para gerenciar notificações push no PWA

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Solicitar permissão para notificações push
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('[Push] Notificações não suportadas neste navegador');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('[Push] Permissão de notificações negada pelo usuário');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Registrar subscription de push no Service Worker
 */
export async function subscribeToPush(): Promise<PushSubscriptionData | null> {
  try {
    const registration = await navigator.serviceWorker.ready;

    // Verificar se já tem subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Criar nova subscription
      // VAPID public key seria necessário aqui em produção
      // Por enquanto, usar applicationServerKey vazio para teste local
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: null, // Em produção, usar VAPID key real
      });
    }

    // Converter subscription para formato JSON
    const subscriptionJSON = subscription.toJSON();

    return {
      endpoint: subscriptionJSON.endpoint!,
      keys: {
        p256dh: subscriptionJSON.keys!.p256dh!,
        auth: subscriptionJSON.keys!.auth!,
      },
    };
  } catch (error) {
    console.error('[Push] Erro ao registrar subscription:', error);
    return null;
  }
}

/**
 * Cancelar subscription de push
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Push] Erro ao cancelar subscription:', error);
    return false;
  }
}

/**
 * Verificar se notificações push estão habilitadas
 */
export function isPushEnabled(): boolean {
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    Notification.permission === 'granted'
  );
}

/**
 * Mostrar notificação local (fallback quando push não está disponível)
 */
export function showLocalNotification(title: string, body: string, url?: string) {
  if (!('Notification' in window)) {
    console.warn('[Push] Notificações não suportadas');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('[Push] Permissão de notificações não concedida');
    return;
  }

  const notification = new Notification(title, {
    body,
    icon: 'https://files.manuscdn.com/user_upload_by_module/session_file/90349683/sLzjsEnsstCyngjd.png',
    badge: 'https://files.manuscdn.com/user_upload_by_module/session_file/90349683/sLzjsEnsstCyngjd.png',
    data: url || '/',
  });

  notification.onclick = () => {
    window.focus();
    if (url) {
      window.location.href = url;
    }
    notification.close();
  };
}

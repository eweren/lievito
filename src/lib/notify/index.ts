// Lokale Push-Notifications via Service Worker.
// Web-Push ohne Server: wir scheduledn `setTimeout` im SW. Auf iOS
// funktioniert das nur in installierten PWAs ab 16.4.

import { browser } from '$app/environment';

export type NotificationSupport =
  | 'unsupported'
  | 'denied'
  | 'default'
  | 'granted';

export function getNotificationSupport(): NotificationSupport {
  if (!browser || typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission as NotificationSupport;
}

export async function requestPermission(): Promise<NotificationSupport> {
  if (!browser || typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission as NotificationSupport;
  }
  const result = await Notification.requestPermission();
  return result as NotificationSupport;
}

export async function scheduleLocalNotification(opts: {
  id: string;
  fireAt: number;
  title: string;
  body: string;
  tag?: string;
}): Promise<void> {
  if (!browser) return;
  const reg = await navigator.serviceWorker?.ready;
  if (!reg?.active) return;
  reg.active.postMessage({ type: 'SCHEDULE_NOTIFICATION', ...opts });
}

export async function cancelLocalNotification(id: string): Promise<void> {
  if (!browser) return;
  const reg = await navigator.serviceWorker?.ready;
  if (!reg?.active) return;
  reg.active.postMessage({ type: 'CANCEL_NOTIFICATION', id });
}

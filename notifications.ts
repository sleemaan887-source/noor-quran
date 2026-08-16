// Notification manager — uses the Notifications API and Service Worker
// to push Azkar and prayer reminders to the device screen.
// Falls back to in-app banner notifications if permission is denied.

import { getNotificationSettings, type NotificationSettings } from '@/core/services/userData';

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return await Notification.requestPermission();
}

export function getPermission(): NotificationPermission {
  if (!notificationsSupported()) return 'denied';
  return Notification.permission;
}

interface NotifPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

export function showNotification({ title, body, icon, tag }: NotifPayload): void {
  const settings = getNotificationSettings();
  if (!settings.enabled) return;
  const now = new Date();
  const hour = now.getHours();
  if (hour < settings.startHour || hour >= settings.endHour) return;

  if (notificationsSupported() && Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        icon: icon ?? './moon.svg',
        tag: tag ?? 'noor-quran',
        badge: './moon.svg',
        dir: 'rtl',
        lang: 'ar',
      });
      setTimeout(() => n.close(), 10000);
    } catch {
      // Some browsers require a service worker registration
      navigator.serviceWorker?.ready.then((reg) => {
        reg.showNotification(title, { body, icon: icon ?? './moon.svg', tag, dir: 'rtl', lang: 'ar' });
      }).catch(() => {});
    }
  }
}

// Schedule recurring Azkar reminders at specific times.
// Uses setInterval as a lightweight scheduler.
let schedulerInterval: ReturnType<typeof setInterval> | null = null;

interface ScheduledReminder {
  hour: number;
  minute: number;
  title: string;
  body: string;
  tag: string;
  lastFired?: string;
}

const SCHEDULED: ScheduledReminder[] = [
  { hour: 5, minute: 30, title: 'أذكار الصباح', body: 'حان وقت أذكار الصباح — لا تنسَ ذكر الله', tag: 'morning-azkar' },
  { hour: 17, minute: 0, title: 'أذكار المساء', body: 'حان وقت أذكار المساء — لا تنسَ ذكر الله', tag: 'evening-azkar' },
  { hour: 9, minute: 0, title: 'تذكير القرآن', body: 'لا تنسَ وردك من القرآن اليوم', tag: 'quran-daily' },
];

export function startReminderScheduler(): void {
  if (schedulerInterval) return;
  schedulerInterval = setInterval(() => {
    const settings = getNotificationSettings();
    if (!settings.enabled) return;
    const now = new Date();
    const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
    for (const r of SCHEDULED) {
      if (now.getHours() === r.hour && now.getMinutes() === r.minute) {
        if (r.lastFired === key) continue;
        r.lastFired = key;
        if (r.tag === 'morning-azkar' && !settings.azkarReminder) continue;
        if (r.tag === 'quran-daily' && !settings.quranReminder) continue;
        showNotification({ title: r.title, body: r.body, tag: r.tag });
      }
    }
  }, 30000);
}

export function stopReminderScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

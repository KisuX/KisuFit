export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission(): NotificationPermission {
  return notificationsSupported() ? Notification.permission : 'denied'
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  return Notification.requestPermission()
}

/** Only fires while the tab is hidden — if the user is looking at the app, the on-screen UI is enough. */
export function notify(title: string, body?: string) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  if (typeof document !== 'undefined' && !document.hidden) return
  try {
    new Notification(title, { body })
  } catch {
    // some environments (e.g. no active service worker) can throw; notification is a nice-to-have
  }
}

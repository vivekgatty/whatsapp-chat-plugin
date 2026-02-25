self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // network-first by default; can be enhanced with route-specific caching later
});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}

  const title = data.title || 'ChatMadi Notification';
  const options = {
    body: data.body || 'You have a new update.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: data.url || '/dashboard/inbox',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data || '/dashboard/inbox';
  event.waitUntil(clients.openWindow(url));
});

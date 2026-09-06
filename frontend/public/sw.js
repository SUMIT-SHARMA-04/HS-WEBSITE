self.addEventListener('push', function (event) {
  let data = { title: "High Spirits Cafe", body: "Check the dashboard for updates." };
  if (event.data) data = event.data.json();

  const options = {
    body: data.body,
    icon: '/vite.svg', 
    badge: '/vite.svg',
    vibrate: [200, 100, 200, 100, 200], 
    data: { url: '/admin' } 
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
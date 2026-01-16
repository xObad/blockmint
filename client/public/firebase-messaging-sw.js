// Firebase Cloud Messaging Service Worker
// This file handles background push notifications for Android and iOS (via PWA)

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// These values will be replaced at runtime from environment variables
firebase.initializeApp({
  apiKey: "AIzaSyCSrwJInFPYwwsaE1qGWAc0DxpXBXuJwKo",
  authDomain: "blockmine-app.firebaseapp.com",
  projectId: "blockmine-app",
  storageBucket: "blockmine-app.firebasestorage.app",
  messagingSenderId: "585026622876",
  appId: "1:585026622876:web:ca49d5ac4e5b7aaf50a66c"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: payload.data?.type || 'general',
    requireInteraction: payload.data?.priority === 'high',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Open the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window if app not open
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

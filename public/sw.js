const CACHE_NAME = 'zenpulse-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// A simple fetch handler that enables PWA installation capability
self.addEventListener('fetch', (event) => {
  // We can leave it empty or implement basic caching.
  // For now, simply respond with the network request.
  event.respondWith(fetch(event.request));
});

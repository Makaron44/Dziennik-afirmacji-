
const CACHE = 'affirmations-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE && caches.delete(k))))) ;
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // App shell: serve cached index for navigation
  if (req.mode === 'navigate') {
    event.respondWith(caches.match('./index.html'));
    return;
  }
  // Cache-first for our listed assets; network fallback for others
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      // Optionally cache same-origin GET requests
      try {
        const url = new URL(req.url);
        if (req.method === 'GET' && url.origin === location.origin) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
      } catch {}
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});

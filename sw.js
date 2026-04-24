const CACHE_NAME = 'ukex-v1';
const STATIC_ASSETS = [
  '/ukexhibitions/',
  '/ukexhibitions/index.html',
  '/ukexhibitions/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Don't cache Google API calls
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('google.com')) {
    return;
  }

  // Network-first for navigation, cache-first for static assets
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/ukexhibitions/index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

const CACHE_NAME = 'noor-quran-offline-v4';
const OFFLINE_PAGE = './index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(['./', OFFLINE_PAGE, './moon.svg', './manifest.json']))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

async function cacheAndReturn(request, response) {
  if (response && response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Same-origin application assets: cache-first.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(async (cached) => {
        if (cached) return cached;
        try {
          return await cacheAndReturn(req, await fetch(req));
        } catch {
          return caches.match(OFFLINE_PAGE);
        }
      })
    );
    return;
  }

  // Quran/audio CDN: network-first, then persistent cache.
  // Once a resource has been successfully opened/downloaded, it is available offline.
  const isContentCdn =
    url.hostname.includes('alquran.cloud') ||
    url.hostname.includes('islamic.network') ||
    url.hostname.includes('everyayah.com');

  if (isContentCdn) {
    event.respondWith(
      fetch(req)
        .then((response) => cacheAndReturn(req, response))
        .catch(() => caches.match(req).then((cached) =>
          cached || new Response('', { status: 503 })
        ))
    );
  }
});

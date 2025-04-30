// sw.js
const CACHE_NAME = 'algebra-solver-v8';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/output.css',
  '/css/styles.css',
  '/js/bundle.min.js',
  'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js',
  'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.asm.wasm',
  'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.asm.data'
];

self.addEventListener('install', async event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('Cache failed:', err))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Fetching: ${event.request.url}`);
  }
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).catch(() => {
          return caches.match('/offline.html') || new Response('Offline content unavailable', { status: 503 });
        });
      })
  );
});
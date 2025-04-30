// sw.js
const CACHE_NAME = 'algebra-solver-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/output.css',
  '/css/styles.css',
  '/js/bundle.min.js',
  'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js',
  'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.asm.wasm',
  'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.asm.data'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
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
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('/index.html'))
  );
});
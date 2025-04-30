// sw.js
const CACHE_NAME = 'algebra-solver-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/output.css',
  '/css/styles.css',
  '/js/main.js',
  '/js/solver.js',
  'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js',
  'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.asm.wasm',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
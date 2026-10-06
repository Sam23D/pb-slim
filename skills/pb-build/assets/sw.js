// sw.js — app shell cache. Data is NOT cached here; it lives in IndexedDB (outbox.js).
// Bump VERSION on every release. List every vendor file in SHELL.
// Also bump ?v=<release> on /css and /js links in the HTML (and here), or open tabs keep old code.
const VERSION = 'app-v1';
const SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/css/theme.css',
  '/css/app.css',
  '/js/app.js',
  '/js/outbox.js',
  '/js/install.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // '/vendor/basecoat-1.0.2/basecoat.cdn.min.css',
  // '/vendor/basecoat-1.0.2/basecoat.min.js',
  // '/vendor/pocketbase-0.26.0/pocketbase.umd.js',
  // '/vendor/tailwind-browser-4.x/tailwind.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function store(request, response) {
  if (response && response.ok) {
    const copy = response.clone();
    caches.open(VERSION).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_/')) return; // never cache data or admin

  if (request.mode === 'navigate') {
    // Pages: network first, cached copy when offline.
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then((response) => store(request, response))
        .catch(() => caches.match(request).then((hit) => hit || caches.match('/index.html')))
    );
    return;
  }

  // Static files: cache first.
  event.respondWith(
    caches.match(request).then((hit) => hit || fetch(request).then((response) => store(request, response)))
  );
});

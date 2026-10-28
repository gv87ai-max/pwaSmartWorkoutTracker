// sw.js - Service Worker con Network-First (Aggiornamenti automatici fluidi + Funzionamento 100% Offline)
const CACHE_NAME = 'workout-pwa-cache-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './db.js',
  './chart.umd.min.js',
  './localforage.min.js',
  './xlsx.full.min.js',
  './jspdf.umd.min.js',
  './jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Strategia: Network-First per i file dell'app (se c'è rete riceve le novità e aggiorna la cache; se offline usa la cache locale)
self.addEventListener('fetch', (evt) => {
  if (evt.request.method !== 'GET') return;
  
  // Salta chiamate esterne API a Google Gemini
  if (evt.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }

  evt.respondWith(
    fetch(evt.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(evt.request, clone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Se non c'è connessione (in palestra/offline), usa la copia salvata sul telefono
        return caches.match(evt.request);
      })
  );
});

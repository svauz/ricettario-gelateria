// Service worker minimale: rende l'app installabile e fa sì che si apra
// anche senza connessione (mostrerà comunque la schermata di sblocco,
// che poi ha bisogno di rete per scaricare le ricette aggiornate).
const CACHE_NAME = 'ricettario-shell-v1';
const APP_SHELL = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Non mettiamo mai in cache ricette.json / ricette.enc / chiamate a Graph:
// vogliamo sempre dati freschi quando c'è rete. Solo l'involucro dell'app
// (l'HTML, il manifest, le icone) viene servito dalla cache se offline.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (url.includes('graph.microsoft.com') || url.includes('ricette.json') || url.includes('ricette.enc')) {
    return; // lascia passare la richiesta di rete normale, senza cache
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

const CACHE_NAME = '6milles-cache-v5';

// Liste exacte des fichiers locaux indispensables hors ligne
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './noeuds/noeud-palomar.pdf',
  './noeuds/noeud-peixet.pdf',
  './noeuds/noeud-tataki.pdf'
];

// 1. INSTALLATION : Mise en cache initiale des fichiers
self.addEventListener('install', event => {
  self.skipWaiting(); // Force la prise en compte immédiate de la nouvelle version
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW: Mise en cache des ressources locales');
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. ACTIVATION : Nettoyage des anciens caches obsolètes
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('SW: Suppression ancien cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Prend le contrôle immédiat de la page
  );
});

// 3. INTERCEPTION RÉSEAU : Stratégie Cache-First pour le hors ligne
self.addEventListener('fetch', event => {
  // On n'intercepte que les requêtes GET locales
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // Utilise le fichier en cache s'il existe
      }
      return fetch(event.request); // Sinon tente de le télécharger sur le réseau
    })
  );
});
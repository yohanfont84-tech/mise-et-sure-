// Service worker minimal pour Mise & Sûre — sert surtout à rendre le site "installable" comme
// une application (obligatoire pour Chrome/Android), avec un peu de résilience hors-ligne en bonus :
// si la connexion coupe un instant, la dernière version chargée de la page continue de s'afficher
// plutôt qu'un message d'erreur du navigateur.
const CACHE_NAME = 'mise-et-sure-v1';
const APP_SHELL = ['./index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
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

self.addEventListener('fetch', (event) => {
  // On ne touche qu'aux requêtes de navigation (chargement de la page elle-même) — tout le
  // reste (API, images, etc.) passe normalement par le réseau, sans mise en cache, pour ne
  // jamais afficher de données de commande ou de prix périmées.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
  }
});

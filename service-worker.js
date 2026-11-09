// Mise & Sûre — service worker minimal.
// Il sert uniquement à rendre le site installable comme une application et à afficher la
// dernière version connue de la page si le téléphone perd la connexion. Il ne met JAMAIS en
// cache les appels au serveur (données, connexion, paiements) : tout passe toujours par le
// réseau, et une nouvelle version du site est visible dès qu'elle est en ligne.
const CACHE = 'mise-et-sure-shell-v2';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Seule la page elle-même (navigation, même domaine) est concernée : réseau d'abord,
  // copie locale uniquement en secours hors connexion.
  if (req.method !== 'GET' || req.mode !== 'navigate' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); }
        return res;
      })
      .catch(() => caches.match('./index.html').then(r => r || Response.error()))
  );
});

// ---------------------------------------------------------------------------------------------
// Notifications sur téléphone : affichage d'une notification reçue du serveur (même site fermé),
// et ouverture de la bonne page au toucher.
// ---------------------------------------------------------------------------------------------
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (e) { data = { body: event.data ? event.data.text() : '' }; }
  event.waitUntil(self.registration.showNotification(data.title || 'Mise & Sûre', {
    body: data.body || '',
    tag: data.tag || undefined,
    renotify: !!data.tag,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { url: data.url || './' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || './', self.registration.scope);
  const view = target.searchParams.get('vue');
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.registration.scope)) {
        if (view) client.postMessage({ type: 'open-view', view });
        return client.focus();
      }
    }
    return self.clients.openWindow(target.href);
  })());
});

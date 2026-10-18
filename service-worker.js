/* AdventureTime – offline cache. Növeld a VERSION-t, ha frissítesz egy játékot. */
const VERSION = 'adventuretime-demo-v1';
const FILES = [
  './', 'index.html', 'manifest.json',
  'Grayhaven-2.html', 'Rustglow.html', 'adventower.html', 'Mnemosyne.html',
  'icons/icon-192.png', 'icons/icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit ||
      fetch(e.request).then(res => {
        // betűtípusok (Google Fonts) futás közben is bekerülnek a gyorsítótárba
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match('index.html')))
  );
});

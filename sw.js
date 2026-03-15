// FarmLedger Service Worker
const CACHE = 'farmledger-v3-cache';

const ASSETS = [
  '/FarmLedger-V2/index.html',
  '/FarmLedger-V2/css/style.css',
  '/FarmLedger-V2/pages/admin.html',
  '/FarmLedger-V2/pages/landlord.html',
  '/FarmLedger-V2/pages/manager.html',
  '/FarmLedger-V2/manifest.json'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {

  // Skip Firebase requests
  if (e.request.url.includes('firebase')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );

});
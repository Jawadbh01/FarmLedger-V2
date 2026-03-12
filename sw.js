// FarmLedger V2 - Service Worker
const CACHE = 'farmledger-v2-cache';
const ASSETS = [
  '/FarmLedger/index.html',
  '/FarmLedger/css/style.css',
  '/FarmLedger/pages/admin.html',
  '/FarmLedger/pages/landlord.html',
  '/FarmLedger/pages/manager.html',
  '/FarmLedger/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('firestore.googleapis.com') || e.request.url.includes('firebase')) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r && r.status === 200) {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return r;
    }).catch(() => caches.match(e.request))
  );
});

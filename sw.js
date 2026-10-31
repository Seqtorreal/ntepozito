// Offline: η εφαρμογή ανοίγει χωρίς internet. Τα δεδομένα δεν περνούν από εδώ, μένουν στο IndexedDB.
const VERSION = 'ntepozito-v9';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];
const CDN = /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net)\//;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Γραμματοσειρά και αναγνώστης αποδείξεων: μία λήψη, μετά από την cache
  if (CDN.test(request.url)) {
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match(request);
      if (hit) return hit;
      const res = await fetch(request);
      if (res.ok || res.type === 'opaque') c.put(request, res.clone());
      return res;
    }));
    return;
  }

  if (url.origin !== location.origin) return;

  // Κέλυφος εφαρμογής: από την cache αμέσως, ενημέρωση στο παρασκήνιο
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(request, { ignoreSearch: true });
    const net = fetch(request).then(res => {
      if (res.ok) c.put(request, res.clone());
      return res;
    }).catch(() => hit || (request.mode === 'navigate' ? c.match('index.html') : Response.error()));
    return hit || net;
  }));
});

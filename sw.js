// Keeps the game openable offline once it has been loaded.
// The page itself is fetched fresh when online; engine and model files come from the cache.
const CACHE = 'mugwagum-20261011013409';
const CORE = ['./', './index.html', './lib/three.min.js', './lib/GLTFLoader.js', './lib/SkeletonUtils.js', './lib/BufferGeometryUtils.js',
  './icon-192.png', './icon-512.png', './manifest.webmanifest'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const keep = res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
  if (req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html')) {
    e.respondWith(fetch(req).then(keep).catch(() => caches.match(req).then(m => m || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(m => m || fetch(req).then(keep)));
});

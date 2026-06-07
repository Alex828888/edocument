const CACHE = "edocument-v1";
const FILES = [
  "./index.html",
  "./styles.css",
  "./app.js",
  "./assets/profile.jpg",
  "./assets/signature.png",
  "./assets/tab-feed.png",
  "./assets/tab-documents.png",
  "./assets/tab-services.png",
  "./assets/tab-menu.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
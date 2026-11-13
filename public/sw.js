// Network-first service worker: always tries the network, falls back to the
// cached copy only when offline. v2: same-origin pages and assets only; API
// responses, analytics and third-party requests are never cached.
const CACHE_NAME = "hisab-v2";
const OFFLINE_URLS = [
  "/",
  "/zakat",
  "/zakat-fitr",
  "/fidya",
  "/kaffarah",
  "/inheritance",
  "/find-your-school",
  "/glossary",
  "/about",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_vercel/")) return;
  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return response;
      })
      .catch(() => caches.match(req))
  );
});

const CACHE_NAME = "brth4-cache-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",

  "./fonts/cinzel-v26-latin-regular.woff2",
  "./fonts/cinzel-v26-latin-500.woff2",
  "./fonts/inter-v20-latin-300.woff2",
  "./fonts/inter-v20-latin-regular.woff2",
  "./fonts/inter-v20-latin-500.woff2"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Ignore chrome-extension://, data:, blob:, etc.
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  // Cache only GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone).catch(error => {
              console.warn(
                "[BRTH4 SW] Cache put failed:",
                event.request.url,
                error
              );
            });
          });
        }

        return response;
      });
    })
  );
});

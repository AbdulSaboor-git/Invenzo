// public/sw.js

const CACHE_NAME = "my-site-cache-v1";
const urlsToCache = ["/", "/offline"]; // List of pages or assets to cache

// Install event - cache initial assets.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event - cleanup old caches if necessary.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve cached content when offline.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Optionally, update the cache with a clone of the response
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        // If the network is unavailable, return the offline page if available.
        if (event.request.mode === "navigate") {
          return caches.match("/offline");
        }
        return caches.match(event.request);
      })
  );
});

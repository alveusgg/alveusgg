self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("alveus-assets-v1").then((cache) => {
      return cache.addAll([
        // Add some cache entries?
      ]);
    }),
  );
});

// Listen for request events
self.addEventListener("fetch", function (event) {
  const request = event.request;

  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

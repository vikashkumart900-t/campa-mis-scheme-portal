self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response("Offline mode is not available for this asset.", {
        status: 503,
        headers: {
          "Content-Type": "text/plain"
        }
      });
    })
  );
});

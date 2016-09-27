const CACHE_VERSION = 1;
const cache_name = "ionic_cache";

self.addEventListener('install', (event) => {
  // Perform any install steps here
  console.log("Service worker installed");
});

self.addEventListener('activate', (event) => {
  // Perform any activate steps here
  console.log("Service worker activated");
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response for a local resource
            // By default this service worker will not cache external resources
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have 2 stream.
            const responseToCache = response.clone();

            caches.open(cache_name)
              .then((cache) => {
                // Resource is cached here
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch((e) => {
          console.error(e);
        })
      }).catch((e) => {
        console.error(e);
      })
  );
});
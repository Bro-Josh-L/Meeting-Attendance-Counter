// Name of the cache storage
const CACHE_NAME = 'zoom-tally-v1'; 

// List of all files that need to be cached for offline use
const urlsToCache = [
  './', // Caches the index page itself
  './index.html',
  './manifest.json',
];

// Installation: Caches all required files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache, adding all core files.');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activation: Cleans up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetching: Serves content from cache first, falling back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone the response because it's a stream and can only be consumed once
            const responseToCache = response.clone();

            // Only cache GET requests that are not range requests
            if (event.request.method === 'GET' && !event.request.headers.get('range')) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          }
        );
      })
  );
});

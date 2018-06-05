self.addEventListener('install', function(event) {
  self.skipWaiting();
  console.log('Install event:', event);

  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        'index.html'
      ]);
    })
  );
});
self.addEventListener('activate', function(event) {
  console.log('Activate event:', event);

  //Deleting old caches

  var cacheWhitelist = ['v2'];

  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          if (cacheWhitelist.indexOf(key) === -1) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // caches.match() always resolves
      // but in case of success response will have value
      return (
        response ||
        fetch(event.request)
          .then(function(response) {
            // response may be used only once
            // we need to save clone to put one copy in cache
            // and serve second one
            let responseClone = response.clone();

            caches.open('v1').then(function(cache) {
              cache.put(event.request, responseClone);
            });
            return response;
          })
          .catch(function(err) {
            // Handles exceptions that arise from match() or fetch().
            console.error('Error in fetch handler:', error);

            throw error;
          })
      );
    })
  );
});

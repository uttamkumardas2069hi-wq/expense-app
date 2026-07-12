/*
  Expense App — Service Worker (Simple & Safe Version)
  =====================================================
  This version uses a simple strategy:
  - Always loads fresh files from internet when online
  - Only uses saved copy when phone has no internet
  - No version numbers, no cache deletion problems
  - Safe to update anytime without white screen issues
*/

var CACHE_NAME = 'expense-app-cache';

/* On install — activate immediately, no waiting */
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

/* On activate — take control of all pages immediately */
self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

/* On every page/file request */
self.addEventListener('fetch', function(event) {

  /* Only handle normal page loads, skip everything else */
  if (event.request.method !== 'GET') return;

  event.respondWith(

    /* ALWAYS try internet first — gets latest version every time */
    fetch(event.request)
      .then(function(freshResponse) {

        /* Got fresh file from internet — save a copy for offline use */
        var copyToSave = freshResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, copyToSave);
        });

        /* Return the fresh file to the browser */
        return freshResponse;

      })
      .catch(function() {

        /* No internet — look for saved offline copy */
        return caches.match(event.request)
          .then(function(savedCopy) {
            if (savedCopy) {
              return savedCopy;
            }
            /* Last resort fallback */
            return caches.match('./index.html');
          });
      })
  );
});

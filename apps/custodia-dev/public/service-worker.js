const CACHE_NAME = 'custodia-v1';
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/index.html',
];

// Install: precachear assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some assets could not be cached:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: limpiar caches viejos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip no-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API calls: network first, cache fallback
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Offline: return cached or offline page
          return caches.match(request).then((cached) => {
            return cached || caches.match('/offline');
          });
        })
    );
  } else {
    // Static/page requests: cache first, network fallback
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const cache = caches.open(CACHE_NAME);
                cache.then((c) => c.put(request, response.clone()));
              }
              return response;
            })
            .catch(() => caches.match('/offline'))
        );
      })
    );
  }
});

// Background sync: sincronizar cuando hay conexión
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);
  if (event.tag === 'sync-fotos') {
    event.waitUntil(syncFotos());
  }
});

async function syncFotos() {
  try {
    // Obtener fotos pendientes de Dexie
    const db = await openDB();
    const pendientes = await db.fotos.where('sincronizado').equals(false).toArray();

    console.log(`[SW] Syncing ${pendientes.length} photos...`);

    for (const foto of pendientes) {
      try {
        const response = await fetch('/api/fotos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(foto),
        });

        if (response.ok) {
          await db.fotos.update(foto.id, { sincronizado: true });
          console.log(`[SW] Photo ${foto.id} synced`);
        }
      } catch (err) {
        console.error(`[SW] Error syncing photo ${foto.id}:`, err);
      }
    }

    console.log('[SW] Sync complete');
  } catch (err) {
    console.error('[SW] Sync failed:', err);
    throw err;
  }
}

async function openDB() {
  return new Promise((resolve) => {
    const req = indexedDB.open('custodia-db', 1);
    req.onsuccess = () => resolve(req.result);
  });
}

// Message handler: responder a mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

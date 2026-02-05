// Service Worker for page caching
// Must stay in sync with CACHE_VERSION in backend/js/modules/cache-manager.js

const CACHE_NAME = 'cho-pages-v1';

self.addEventListener('install', (event) => {
  // Activate updated worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Remove old caches
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => (key === CACHE_NAME ? Promise.resolve() : caches.delete(key)))
      );
      await self.clients.claim();
    })()
  );
});

// Cache-first strategy for navigation/page requests
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  const accept = request.headers.get('accept') || '';
  const isPageRequest = accept.includes('text/html');

  if (!isPageRequest) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);

      const networkFetch = fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response && response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // If network fails, fall back to cache (if available)
          if (cached) {
            return cached;
          }
          throw new Error('Network error and no cached response available');
        });

      // Serve cached version immediately if we have it, otherwise wait for network
      return cached || networkFetch;
    })()
  );
});

// Handle messages from cache-manager.js
self.addEventListener('message', (event) => {
  const data = event.data || {};
  const type = data.type;

  if (type === 'PRELOAD_PAGE' && data.url) {
    event.waitUntil(preloadPage(data.url));
    return;
  }

  if (type === 'CLEAR_CACHE') {
    event.waitUntil(
      (async () => {
        await caches.delete(CACHE_NAME);
        // Respond back to the page via MessageChannel, if provided
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })()
    );
  }
});

async function preloadPage(url) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(url, { credentials: 'same-origin' });
    if (response.ok) {
      await cache.put(url, response.clone());
    }
  } catch (e) {
    // Silent fail for preload
    console.warn('SW preload failed for', url, e);
  }
}

// Service Worker for Page Caching
// Cache name and version
const CACHE_NAME = 'cho-pages-v2';
const MAX_CACHE_SIZE = 50; // Maximum number of pages to cache

// Install event - cache initial assets
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Skip caching for:
    // - API requests
    // - Vite dev server requests
    // - Service worker itself
    if (url.pathname.startsWith('/api/') || 
        url.pathname.includes('vite') || 
        url.pathname.includes('sw.js') ||
        url.hostname !== self.location.hostname) {
        return; // Let browser handle normally
    }
    
    // Only cache GET requests for HTML pages (PHP files and index pages)
    const isPageRequest = event.request.method === 'GET' && 
        (url.pathname.endsWith('.php') || 
         url.pathname.endsWith('/') || 
         (!url.pathname.includes('.') && url.pathname.includes('frontend/pages')));
    
    if (isPageRequest) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                // Return cached version if available (instant load)
                if (cachedResponse) {
                    // Fetch fresh version in background to update cache (stale-while-revalidate)
                    fetch(event.request)
                        .then((response) => {
                            if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                            }
                        })
                        .catch(() => {
                            // Ignore fetch errors for background updates
                        });
                    
                    return cachedResponse;
                }
                
                // Fetch from network if not cached
                return fetch(event.request).then((response) => {
                    // Don't cache non-OK responses or non-HTML responses
                    if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) {
                        return response;
                    }
                    
                    const responseClone = response.clone();
                    
                    // Store in cache
                    caches.open(CACHE_NAME).then((cache) => {
                        // Limit cache size
                        cache.keys().then((keys) => {
                            if (keys.length >= MAX_CACHE_SIZE) {
                                // Remove oldest entries (keep cache size manageable)
                                const toDelete = keys.slice(0, keys.length - MAX_CACHE_SIZE + 1);
                                toDelete.forEach(key => cache.delete(key));
                            }
                            cache.put(event.request, responseClone);
                        });
                    });
                    
                    return response;
                }).catch(() => {
                    // If fetch fails and we have a cached version, return it
                    return caches.match(event.request).then((fallbackResponse) => {
                        return fallbackResponse || new Response('Offline', { status: 503 });
                    });
                });
            })
        );
    }
});

// Message handler for cache management
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            if (event.ports && event.ports[0]) {
                event.ports[0].postMessage({ success: true });
            }
        });
    }
    
    if (event.data && event.data.type === 'PRELOAD_PAGE') {
        const url = event.data.url;
        const request = new Request(url);
        
        fetch(request)
            .then((response) => {
                if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
                    return caches.open(CACHE_NAME).then((cache) => {
                        // Limit cache size
                        return cache.keys().then((keys) => {
                            if (keys.length >= MAX_CACHE_SIZE) {
                                // Remove oldest entries
                                const toDelete = keys.slice(0, keys.length - MAX_CACHE_SIZE + 1);
                                toDelete.forEach(key => cache.delete(key));
                            }
                            return cache.put(request, response.clone());
                        });
                    });
                }
            })
            .catch(() => {
                // Ignore preload errors
            });
    }
});

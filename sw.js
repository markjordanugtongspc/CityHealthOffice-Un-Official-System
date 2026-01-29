// Service Worker for Page Caching
// Cache name and version
const CACHE_NAME = 'cho-pages-v1';
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
                            if (response.ok) {
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

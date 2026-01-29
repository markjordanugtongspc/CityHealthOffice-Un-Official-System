/**
 * Page Cache Manager
 * Manages browser cache for instant page navigation
 */

const CACHE_VERSION = 'cho-pages-v1'; // Must match CACHE_NAME in sw.js
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Register service worker for page caching
 */
export async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            // Update service worker when new version is available
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker available, reload to activate
                        console.log('New service worker available');
                    }
                });
            });
            
            return registration;
        } catch (error) {
            console.warn('Service Worker registration failed:', error);
            return null;
        }
    }
    return null;
}

/**
 * Preload a page into cache
 */
export async function preloadPage(url) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'PRELOAD_PAGE',
            url: url
        });
    } else if ('caches' in window) {
        // Fallback: preload directly if service worker not ready
        try {
            const response = await fetch(url);
            if (response.ok) {
                const cache = await caches.open(CACHE_VERSION);
                await cache.put(url, response.clone());
            }
        } catch (error) {
            // Ignore preload errors
        }
    }
}

/**
 * Check if page is cached
 */
export async function isPageCached(url) {
    if ('caches' in window) {
        const cache = await caches.open(CACHE_VERSION);
        const cachedResponse = await cache.match(url);
        return cachedResponse !== undefined;
    }
    return false;
}

/**
 * Clear all cached pages
 */
export async function clearPageCache() {
    if ('caches' in window) {
        await caches.delete(CACHE_VERSION);
        
        // Also notify service worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            return new Promise((resolve) => {
                const channel = new MessageChannel();
                channel.port1.onmessage = (event) => {
                    resolve(event.data);
                };
                navigator.serviceWorker.controller.postMessage(
                    { type: 'CLEAR_CACHE' },
                    [channel.port2]
                );
            });
        }
    }
}

/**
 * Get cached page count
 */
export async function getCachedPageCount() {
    if ('caches' in window) {
        const cache = await caches.open(CACHE_VERSION);
        const keys = await cache.keys();
        return keys.length;
    }
    return 0;
}

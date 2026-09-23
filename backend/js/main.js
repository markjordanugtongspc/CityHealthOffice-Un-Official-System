// Import Tailwind CSS
import '../../frontend/style.css';

// Initialize Flowbite
import 'flowbite';
import { Carousel, initCarousels } from 'flowbite';

// Helpers
export function getCurrentYear() {
    return new Date().getFullYear();
}

// Expose commonly needed globals for other modules / inline scripts
if (typeof window !== 'undefined') {
    window.appCurrentYear = getCurrentYear();
}

/**
 * Set favicon dynamically for all pages with circular crop
 * This ensures the favicon is set consistently across all frontend pages
 * Uses frontend/images/ch-logo.png as the favicon and crops it to a circle
 */
function setFavicon() {
    // Remove existing favicon links if any
    const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
    existingFavicons.forEach(link => link.remove());

    // Determine the correct path to the favicon
    // Strategy: Use sidebar logo path as reference if available, otherwise calculate based on URL
    let faviconPath = '';

    // Method 1: Check if sidebar logo exists and use its path as reference (most reliable)
    const sidebarLogo = document.querySelector('img[src*="ch-logo.png"]');
    if (sidebarLogo) {
        const logoSrc = sidebarLogo.getAttribute('src');
        // Extract the directory path from logo src and use same path for favicon
        const logoPath = logoSrc.substring(0, logoSrc.lastIndexOf('/'));
        faviconPath = logoPath + '/ch-logo.png';
    } else {
        // Method 2: Calculate path based on current URL structure
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/').filter(p => p && p !== 'index.php');

        // Find 'pages' in the path to determine depth
        const pagesIndex = pathParts.indexOf('pages');
        if (pagesIndex >= 0) {
            // We're in a pages subdirectory (e.g., /pages/dashboard/)
            // Need to go up: pages/dashboard -> ../../images/ch-logo.png
            const depth = pathParts.length - pagesIndex; // Number of directories after 'pages'
            faviconPath = '../'.repeat(depth) + 'images/ch-logo.png';
        } else if (pathParts.includes('frontend')) {
            // We're in frontend root directory
            faviconPath = 'images/ch-logo.png';
        } else {
            // Root level (project root/index.php)
            faviconPath = 'frontend/images/ch-logo.png';
        }
    }

    // Create circular favicon using canvas
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS if needed

    img.onload = function () {
        // Create canvas for circular favicon
        const canvas = document.createElement('canvas');
        const size = 64; // Higher resolution for better quality
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Create circular clipping path
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Calculate dimensions to maintain aspect ratio and center the image
        const imgAspect = img.width / img.height;
        let drawWidth = size;
        let drawHeight = size;
        let drawX = 0;
        let drawY = 0;

        if (imgAspect > 1) {
            // Image is wider than tall
            drawHeight = size;
            drawWidth = size * imgAspect;
            drawX = (size - drawWidth) / 2;
        } else {
            // Image is taller than wide
            drawWidth = size;
            drawHeight = size / imgAspect;
            drawY = (size - drawHeight) / 2;
        }

        // Draw white background first (for transparency handling)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // Draw the image
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // Convert canvas to data URL
        const circularFaviconUrl = canvas.toDataURL('image/png');

        // Create favicon link elements with circular version
        const faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        faviconLink.type = 'image/png';
        faviconLink.href = circularFaviconUrl;

        const shortcutLink = document.createElement('link');
        shortcutLink.rel = 'shortcut icon';
        shortcutLink.type = 'image/png';
        shortcutLink.href = circularFaviconUrl;

        const appleTouchIcon = document.createElement('link');
        appleTouchIcon.rel = 'apple-touch-icon';
        appleTouchIcon.href = circularFaviconUrl;

        // Add to head (insert at the beginning for better compatibility)
        document.head.insertBefore(faviconLink, document.head.firstChild);
        document.head.insertBefore(shortcutLink, document.head.firstChild);
        document.head.insertBefore(appleTouchIcon, document.head.firstChild);
    };

    img.onerror = function () {
        // Fallback: use original image path if canvas conversion fails
        const faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        faviconLink.type = 'image/png';
        faviconLink.href = faviconPath;

        const shortcutLink = document.createElement('link');
        shortcutLink.rel = 'shortcut icon';
        shortcutLink.type = 'image/png';
        shortcutLink.href = faviconPath;

        document.head.insertBefore(faviconLink, document.head.firstChild);
        document.head.insertBefore(shortcutLink, document.head.firstChild);
    };

    // Load the image
    img.src = faviconPath;
}

// Import modules (each module exposes its own init function)
import { init as initAuth } from './auth.js';
import { initSidebar } from './sidebar.js';
import { initAuthCheck } from './modules/auth-check.js';
import { loadUserInfo } from './modules/user-info.js';
// START: Route-based module loading
function loadPageModule(moduleLoader) {
    return moduleLoader()
        .then(({ init: moduleInit }) => moduleInit?.())
        .catch((error) => console.error('Failed to load page module:', error));
}

function initializeCurrentPageModules() {
    const pagePath = (window.location.pathname || '').toLowerCase();

    if (pagePath.includes('/dashboard/')) {
        void loadPageModule(() => import('./dashboard.js'));
        void loadPageModule(() => import('./charts.js'));
    } else if (pagePath.includes('/budget/')) {
        void loadPageModule(() => import('./budget.js'));
    } else if (pagePath.includes('/specialfund/')) {
        void loadPageModule(() => import('./specialfund.js'));
    } else if (pagePath.includes('/monthly-expenses/')) {
        void loadPageModule(() => import('./monthly-expenses.js'));
    } else if (pagePath.includes('/itemized/')) {
        void loadPageModule(() => import('./itemized.js'));
    } else if (pagePath.includes('/export/')) {
        void loadPageModule(() => import('./modules/export.js'));
    } else if (pagePath.includes('/voucher/')) {
        void loadPageModule(() => import('./modules/voucher.js'));
    } else if (pagePath.includes('/about/')) {
        void loadPageModule(() => import('./about.js'));
    } else if (pagePath.includes('/settings/')) {
        void loadPageModule(() => import('./settings.js'));
    } else if (pagePath.includes('/admin/')) {
        void loadPageModule(() => import('./admin.js'));
    }

    void loadPageModule(() => import('./modules/scroll-to-top.js'));
    // void loadPageModule(() => import('./modules/ai.js')); // Temporarily disabled AI chatbot module
}
// END: Route-based module loading

// START: Remove Page Loader with Smooth Fade and Post-Login Restriction
/**
 * Remove page loader once dashboard assets, charts, and modules are loaded.
 * Only displays for a brief smooth transition directly after a successful login (flagged via sessionStorage).
 * On subsequent refreshes, reloads, or navigation while authenticated, the overlay is removed
 * immediately without showing, as the user is already logged in.
 */
let pageLoaderStartTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

export function removePageLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;

    // Check if this is the initial arrival right after a successful login
    const isPostLogin = sessionStorage.getItem('show_connecting_overlay') === 'true';

    if (!isPostLogin) {
        // User refreshed/reloaded or navigated while already authenticated: remove instantly
        loader.style.display = 'none';
        loader.remove();
        document.body && document.body.classList.add('loaded');
        return;
    }

    // Clear the post-login flag so any subsequent reload won't trigger the overlay
    sessionStorage.removeItem('show_connecting_overlay');

    // First time after login: play overlay for 600ms for a snappy, smooth visual transition
    const minDisplayTime = 600;
    const currentTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const elapsedTime = currentTime - pageLoaderStartTime;
    const remainingDelay = Math.max(0, minDisplayTime - elapsedTime);

    setTimeout(() => {
        const activeLoader = document.getElementById('page-loader');
        if (activeLoader) {
            activeLoader.style.opacity = '0';
            activeLoader.style.transition = 'opacity 0.3s ease-out';
            setTimeout(() => {
                activeLoader.remove();
                document.body && document.body.classList.add('loaded');
            }, 300);
        }
    }, remainingDelay);
}
// END: Remove Page Loader with Smooth Fade and Post-Login Restriction

/**
 * Main application initialization
 * Conditionally initializes modules based on page context
 */
// Remove legacy page-cache workers and browser caches from older builds.
async function removeLegacyPageCaching() {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
    }
    if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.filter((name) => name.startsWith('cho-pages-')).map((name) => window.caches.delete(name)));
    }
}
export async function init() {
    removeLegacyPageCaching().catch(() => {});

    // Set favicon for all pages (must be first)
    setFavicon();

    // Initialize sidebar navigation (must be first)
    initSidebar();

    // Check authentication for protected pages (must be early)
    await initAuthCheck();

    // Load and display user info in header (for all pages)
    loadUserInfo();

    // Initialize authentication if login form exists
    initAuth();

    // START: Initialize Flowbite carousel with hover pause and smooth cycle
    const carouselEl = document.getElementById('landing-carousel');
    const carouselContainer = document.getElementById('landing-carousel-container') || carouselEl;
    if (carouselEl) {
        initCarousels();

        // Retrieve the Flowbite Carousel instance or instantiate it if needed
        setTimeout(() => {
            let carouselInstance = null;
            if (typeof window !== 'undefined' && window.FlowbiteInstances) {
                carouselInstance = window.FlowbiteInstances.getInstance('Carousel', 'landing-carousel');
            }

            if (!carouselInstance) {
                // Fallback: manual Carousel instantiation
                const itemEls = carouselEl.querySelectorAll('[data-carousel-item]');
                const items = Array.from(itemEls).map((el, position) => ({
                    position,
                    el
                }));
                if (items.length) {
                    carouselInstance = new Carousel(carouselEl, items, {
                        interval: 4000
                    });
                    carouselInstance.cycle();
                }
            }

            if (carouselInstance && carouselContainer) {
                carouselContainer.addEventListener('mouseenter', () => {
                    carouselInstance.pause();
                });
                carouselContainer.addEventListener('mouseleave', () => {
                    carouselInstance.cycle();
                });
            }
        }, 100);
    }
    // END: Initialize Flowbite carousel with hover pause and smooth cycle

    // Load only the modules required by the current page after core UI is ready.
    initializeCurrentPageModules();


    // Ensure loader is removed after all initialization
    removePageLoader();
}

// Mark body as loaded once CSS is ready (prevents FOUC)
function markBodyLoaded() {
    document.body.classList.add('loaded');
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        markBodyLoaded();
        init();
    });
} else {
    // DOM is already loaded, run immediately
    markBodyLoaded();
    init();
}

// Fallback: Mark body as loaded after a short delay if CSS hasn't loaded yet
setTimeout(() => {
    markBodyLoaded();
}, 100);

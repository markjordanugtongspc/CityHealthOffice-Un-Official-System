// Import Tailwind CSS
import '../../frontend/style.css';

// Initialize Flowbite and SweetAlert2
import 'flowbite';
import Swal from 'sweetalert2';

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
    
    img.onload = function() {
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
    
    img.onerror = function() {
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
import { init as initDashboard } from './dashboard.js';
import { init as initCharts } from './charts.js';
import { init as initBudget } from './budget.js';
import { init as initSpecialFund } from './specialfund.js';
import { init as initMonthlyExpenses } from './monthly-expenses.js';
import { init as initExport } from './modules/export.js';
import { init as initScrollToTop } from './modules/scroll-to-top.js';
import { init as initAbout } from './about.js';
import { init as initAdmin } from './admin.js';
import { initSidebar } from './sidebar.js';
import { initAuthCheck } from './modules/auth-check.js';
import { loadUserInfo } from './modules/user-info.js';

/**
 * Remove page loader once assets are loaded
 */
function removePageLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => {
            loader.remove();
        }, 300);
    }
}

/**
 * Preload page assets on link hover for smoother navigation
 * Uses service worker cache for instant navigation
 */
function initNavigationPreloading() {
    // Import cache manager
    import('./modules/cache-manager.js').then(({ preloadPage, isPageCached }) => {
        // Find all internal navigation links
        const links = document.querySelectorAll('a[href*="frontend/pages"], a[href*="index.php"]');
        const preloadedPages = new Set();
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
                return;
            }
            
            // Skip external links
            if (href.startsWith('http') && !href.includes(window.location.hostname)) {
                return;
            }
            
            // Resolve relative URLs to absolute
            const absoluteUrl = new URL(href, window.location.href).href;
            
            // Preload on hover (mouseenter) - cache the page for instant future loads
            link.addEventListener('mouseenter', async () => {
                if (!preloadedPages.has(absoluteUrl)) {
                    preloadedPages.add(absoluteUrl);
                    
                    // Check if already cached
                    try {
                        const cached = await isPageCached(absoluteUrl);
                        if (!cached) {
                            // Preload into cache (non-blocking)
                            preloadPage(absoluteUrl);
                        }
                    } catch (error) {
                        // Ignore cache errors
                    }
                }
            }, { once: true });
            
            // Handle clicks - service worker will serve cached pages instantly
            link.addEventListener('click', (e) => {
                // Only handle internal navigation
                if (href && !href.startsWith('http') && !href.startsWith('#')) {
                    // Service worker will intercept and serve from cache if available
                    // Show loader only briefly for visual feedback
                    const loader = document.createElement('div');
                    loader.id = 'page-loader';
                    loader.innerHTML = `
                        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #f4f8fb 60%, #dbeafe 100%); z-index: 9999; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                            <div style="width: 48px; height: 48px; border: 4px solid #e2e8f0; border-top-color: #224796; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                            <p style="margin-top: 1rem; color: #223557; font-weight: 500;">Loading page...</p>
                        </div>
                        <style>
                            @keyframes spin {
                                to { transform: rotate(360deg); }
                            }
                        </style>
                    `;
                    document.body.appendChild(loader);
                    
                    // If page is cached, loader will be removed quickly by main.js init()
                    // If not cached, normal navigation will occur
                }
            });
        });
    });
}

/**
 * Main application initialization
 * Conditionally initializes modules based on page context
 */
export async function init() {
    // Register service worker for page caching (must be first)
    import('./modules/cache-manager.js').then(({ registerServiceWorker }) => {
        registerServiceWorker();
    });
    
    // Remove page loader if it exists (for page transitions)
    removePageLoader();
    
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

    // Initialize dashboard if dashboard elements exist
    initDashboard();

    // Initialize charts if chart containers exist (await async function)
    await initCharts();

    // Initialize budget page if budget elements exist
    initBudget();

    // Initialize special fund page if special fund elements exist
    initSpecialFund();

    // Initialize monthly expenses page if monthly expenses elements exist
    initMonthlyExpenses();

    // Initialize export page if export elements exist
    initExport();

    // Initialize about page if about elements exist
    initAbout();

    // Initialize admin page if admin elements exist
    initAdmin();

    // Floating scroll-to-top button (mobile/desktop)
    initScrollToTop();
    
    // Initialize navigation preloading for smoother page transitions
    initNavigationPreloading();
    
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

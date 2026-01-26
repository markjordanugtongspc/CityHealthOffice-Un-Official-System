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
import { initSidebar } from './sidebar.js';

/**
 * Main application initialization
 * Conditionally initializes modules based on page context
 */
export async function init() {
    // Set favicon for all pages (must be first)
    setFavicon();
    
    // Initialize sidebar navigation (must be first)
    initSidebar();

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
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already loaded, run immediately
    init();
}

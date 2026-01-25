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

// Import modules (each module exposes its own init function)
import { init as initAuth } from './auth.js';
import { init as initDashboard } from './dashboard.js';
import { init as initCharts } from './charts.js';
import { init as initBudget } from './budget.js';
import { init as initSpecialFund } from './specialfund.js';
import { init as initExport } from './modules/export.js';
import { initSidebar } from './sidebar.js';

/**
 * Main application initialization
 * Conditionally initializes modules based on page context
 */
export async function init() {
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

    // Initialize export page if export elements exist
    initExport();
}

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', init);

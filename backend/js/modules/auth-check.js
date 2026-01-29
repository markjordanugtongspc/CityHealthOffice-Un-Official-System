/**
 * Authentication Check Module
 * Checks if user is logged in before allowing access to protected pages
 */

import { showUnauthorizedAccess, showPermissionDeniedToast } from './modal.js';

/**
 * Get API base path dynamically
 * @returns {string}
 */
function getApiBasePath() {
    const path = window.location.pathname || '/';
    const basePath = path.substring(0, path.indexOf('/frontend/') !== -1 ? path.indexOf('/frontend/') : path.lastIndexOf('/'));
    return basePath || '';
}

/**
 * Check authentication status
 * @returns {Promise<boolean>}
 */
async function checkAuth() {
    try {
        const apiBase = getApiBasePath();
        const response = await fetch(`${apiBase}/api/auth/check.php`, {
            method: 'GET',
            credentials: 'same-origin' // Include cookies for session
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.success && data.authenticated === true;
    } catch (error) {
        console.error('Auth check error:', error);
        return false;
    }
}

/**
 * Initialize authentication check for protected pages
 * Should be called on all frontend pages except login page
 */
export async function initAuthCheck() {
    // Skip auth check on login page (root index.php or root /)
    const pathname = window.location.pathname;
    const isLoginPage = pathname === '/' || 
                        pathname === '/index.php' ||
                        pathname.endsWith('/') && !pathname.includes('/frontend/pages/') ||
                        (pathname.endsWith('/index.php') && !pathname.includes('/frontend/pages/'));
    
    if (isLoginPage) {
        return;
    }

    // Check if user is authenticated
    const isAuthenticated = await checkAuth();

    if (!isAuthenticated) {
        // Show unauthorized access modal
        await showUnauthorizedAccess();
        // Modal will redirect to login page
        return;
    }

    // Check admin page access
    if (pathname.includes('/admin/')) {
        try {
            const apiBase = getApiBasePath();
            const response = await fetch(`${apiBase}/api/auth/current-user.php`, {
                credentials: 'same-origin'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    const allowedRoles = ['Administrator', 'CEO', 'Manager'];
                    if (!allowedRoles.includes(data.user.role)) {
                        // Show permission denied toast and redirect
                        await showPermissionDeniedToast();
                        window.location.href = '../dashboard/';
                    }
                }
            }
        } catch (error) {
            console.error('Error checking admin access:', error);
        }
    }
}

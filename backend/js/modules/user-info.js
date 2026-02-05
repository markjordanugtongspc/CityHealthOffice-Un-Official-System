/**
 * User Info Module
 * Loads and displays current logged-in user information
 */

/**
 * Get API base path dynamically
 * @returns {string}
 */
function getApiBasePath() {
    // Get the base path from the current URL
    const path = window.location.pathname || '/';

    // Extract base path before /frontend/ or /index.php
    // Examples:
    // /Project/frontend/pages/dashboard/ -> /Project
    // /Project/index.php -> /Project
    // /frontend/pages/dashboard/ -> (empty)
    // /index.php -> (empty)

    if (path.includes('/frontend/')) {
        // Get everything before /frontend/
        const idx = path.indexOf('/frontend/');
        return path.substring(0, idx);
    }

    // For paths like /Project/index.php or /Project/
    if (path.includes('/index.php')) {
        const idx = path.indexOf('/index.php');
        return path.substring(0, idx);
    }

    // For paths like /Project/ (with trailing slash)
    if (path !== '/' && path.endsWith('/')) {
        return path.slice(0, -1);
    }

    // For root level, return empty string
    return '';
}

/**
 * Load and display current user info in header
 */
export async function loadUserInfo() {
    try {
        const apiBase = getApiBasePath();
        const response = await fetch(`${apiBase}/api/auth/current-user.php`, {
            credentials: 'same-origin'
        });

        if (!response.ok) {
            return;
        }

        const data = await response.json();
        if (!data.success || !data.user) {
            return;
        }

        const user = data.user;
        const fullName = user.full_name || user.username || 'User';
        const username = user.username || '...';
        const role = user.role || '...';

        // Get first letter of full name or username for avatar
        const initial = (fullName.charAt(0) || username.charAt(0) || 'U').toUpperCase();

        // Update welcome text (if exists)
        const welcomeText = document.getElementById('dashboardWelcomeText');
        if (welcomeText) {
            const nameSpan = welcomeText.querySelector('.user-full-name');
            if (nameSpan) {
                nameSpan.textContent = fullName;
            } else {
                welcomeText.textContent = `Welcome back, ${fullName}`;
            }
        }

        // Update user menu (if exists)
        const userInitial = document.getElementById('userInitial');
        const userUsername = document.getElementById('userUsername');
        const userRole = document.getElementById('userRole');

        if (userInitial) {
            userInitial.textContent = initial;
        }
        if (userUsername) {
            userUsername.textContent = username;
        }
        if (userRole) {
            userRole.textContent = role;
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

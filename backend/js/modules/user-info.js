/**
 * User Info Module
 * Loads and displays current logged-in user information
 */

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

/**
 * User Management Module
 * Handles user creation, password hashing, and user management
 */

const DEFAULT_PASSWORD = 'mjUgtong2026!';

/**
 * Hash password using bcrypt-like algorithm (for PHP compatibility)
 * Note: Actual hashing should be done server-side with PHP's password_hash()
 * This is a placeholder - real implementation should call PHP API
 */
export async function hashPassword(password) {
    // In production, this should call a PHP API endpoint that uses password_hash()
    // For now, return the password (PHP backend will hash it)
    return password;
}

/**
 * Get API base path
 */
function getApiBasePath() {
    const path = window.location.pathname;
    const basePath = path.substring(0, path.indexOf('/frontend/') !== -1 ? path.indexOf('/frontend/') : path.lastIndexOf('/'));
    return basePath || '';
}

/**
 * Create a new user via API
 * @param {Object} userData User data object
 * @returns {Promise<Object>} Response from server
 */
export async function createUser(userData) {
    try {
        const apiBase = getApiBasePath();
        const response = await fetch(`${apiBase}/api/users/create.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...userData,
                password: DEFAULT_PASSWORD, // Will be hashed server-side
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create user');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

/**
 * Validate user data before submission
 * @param {Object} userData User data object
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateUserData(userData) {
    const errors = [];

    if (!userData.username || userData.username.trim().length < 3) {
        errors.push('Username must be at least 3 characters');
    }

    if (!userData.full_name || userData.full_name.trim().length < 2) {
        errors.push('Full name is required');
    }

    // Email validation: allow normal emails but block common temporary domains
    const email = (userData.email || '').trim().toLowerCase();
    const basicEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email || !basicEmailValid) {
        errors.push('Valid email address is required');
    } else {
        const domain = email.split('@')[1] || '';
        const tempDomains = [
            'tempmail.com',
            'tempmail.net',
            'yopmail.com',
            '10minutemail.com',
            'mailinator.com',
            'guerrillamail.com',
        ];

        if (tempDomains.some((d) => domain === d || domain.endsWith(`.${d}`))) {
            errors.push('Temporary email addresses are not allowed');
        }
    }

    if (!userData.role) {
        errors.push('Role is required');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

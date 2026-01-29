/**
 * Authentication module
 * Handles login with database authentication via API
 */

import { showLoginSuccess, showIncorrectCredentials, showError } from './modules/popups.js';

/**
 * Get API base path dynamically
 * @returns {string}
 */
function getApiBasePath() {
    const path = window.location.pathname || '/';
    const basePath = path.substring(0, path.indexOf('/frontend/') !== -1 ? path.indexOf('/frontend/') : path.lastIndexOf('/'));
    return basePath || '';
}

// Cookie configuration
const COOKIE_CONFIG = {
    username: 'cho_username',
    password: 'cho_password',
    rememberMe: 'cho_remember',
    expires: 30, // Days
    path: '/',
    sameSite: 'Strict'
};

// Simple encryption key (site-specific, not user-specific)
// In production, this should be more complex or server-generated
const ENCRYPTION_KEY = 'CHO_AUTH_2026_SECURE_KEY';

/**
 * Simple encryption function using XOR cipher with key
 * Note: This is basic obfuscation for client-side storage
 * For production, use proper encryption or server-side storage
 * @param {string} text - Text to encrypt
 * @param {string} key - Encryption key
 * @returns {string} - Base64 encoded encrypted string
 */
function encrypt(text, key = ENCRYPTION_KEY) {
    if (!text) return '';
    
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
    }
    
    // Encode to base64 for safe cookie storage
    return btoa(result);
}

/**
 * Simple decryption function
 * @param {string} encryptedText - Base64 encoded encrypted string
 * @param {string} key - Decryption key
 * @returns {string} - Decrypted text
 */
function decrypt(encryptedText, key = ENCRYPTION_KEY) {
    if (!encryptedText) return '';
    
    try {
        // Decode from base64
        const decoded = atob(encryptedText);
        
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }
        
        return result;
    } catch (error) {
        console.error('Decryption error:', error);
        return '';
    }
}

/**
 * Set a cookie with secure options
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Expiration days
 * @param {object} options - Additional cookie options
 */
function setCookie(name, value, days = COOKIE_CONFIG.expires, options = {}) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    let cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=${options.path || COOKIE_CONFIG.path}; SameSite=${options.sameSite || COOKIE_CONFIG.sameSite}`;
    
    // Add Secure flag if HTTPS (only set in production with HTTPS)
    if (location.protocol === 'https:') {
        cookieString += '; Secure';
    }
    
    document.cookie = cookieString;
}

/**
 * Get a cookie value
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
function getCookie(name) {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length));
        }
    }
    
    return null;
}

/**
 * Delete a cookie
 * @param {string} name - Cookie name
 */
function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${COOKIE_CONFIG.path}; SameSite=${COOKIE_CONFIG.sameSite}`;
}

/**
 * Save credentials to cookies (with encryption for password)
 * @param {string} username - Username to save
 * @param {string} password - Password to encrypt and save
 */
function saveCredentials(username, password) {
    // Save username (plain text is usually acceptable)
    setCookie(COOKIE_CONFIG.username, username);
    
    // Encrypt and save password
    const encryptedPassword = encrypt(password);
    setCookie(COOKIE_CONFIG.password, encryptedPassword);
    
    // Save remember me flag
    setCookie(COOKIE_CONFIG.rememberMe, 'true');
}

/**
 * Load saved credentials from cookies
 * @returns {object|null} - Object with username and password, or null if not found
 */
function loadCredentials() {
    const rememberMe = getCookie(COOKIE_CONFIG.rememberMe);
    
    if (rememberMe !== 'true') {
        return null;
    }
    
    const username = getCookie(COOKIE_CONFIG.username);
    const encryptedPassword = getCookie(COOKIE_CONFIG.password);
    
    if (!username || !encryptedPassword) {
        return null;
    }
    
    // Decrypt password
    const password = decrypt(encryptedPassword);
    
    return { username, password };
}

/**
 * Clear saved credentials from cookies
 */
function clearCredentials() {
    deleteCookie(COOKIE_CONFIG.username);
    deleteCookie(COOKIE_CONFIG.password);
    deleteCookie(COOKIE_CONFIG.rememberMe);
}

/**
 * Load saved credentials and populate form fields
 */
function loadSavedCredentials() {
    const credentials = loadCredentials();
    
    if (credentials) {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const rememberMeCheckbox = document.getElementById('rememberMe');
        
        if (usernameInput && passwordInput && rememberMeCheckbox) {
            usernameInput.value = credentials.username;
            passwordInput.value = credentials.password;
            rememberMeCheckbox.checked = true;
        }
    }
}

/**
 * Initialize authentication functionality
 */
export function init() {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) {
        return; // Login form not present on this page
    }

    // Load saved credentials if "Remember me" was previously checked
    loadSavedCredentials();
    
    // Handle remember me checkbox change
    const rememberMeCheckbox = document.getElementById('rememberMe');
    if (rememberMeCheckbox) {
        rememberMeCheckbox.addEventListener('change', (e) => {
            if (!e.target.checked) {
                // If unchecked, clear saved credentials
                clearCredentials();
            }
        });
    }

    loginForm.addEventListener('submit', handleLogin);
}

/**
 * Handles login form submission
 * @param {Event} e - Form submit event
 */
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;

    // Validation
    if (!username || !password) {
        await showError('Please enter both username and password');
        return;
    }

    try {
        const apiBase = getApiBasePath();
        const response = await fetch(`${apiBase}/api/auth/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'same-origin' // Include cookies for session
        });

        const data = await response.json();

        if (data.success) {
            // Save credentials if "Remember me" is checked
            if (rememberMe) {
                saveCredentials(username, password);
            } else {
                // Clear credentials if "Remember me" is unchecked
                clearCredentials();
            }
            
            // Show success message with loading animation, timer, and preload assets
            // The modal will automatically close and redirect after the timer completes
            await showLoginSuccess();
        } else {
            // Show incorrect credentials error
            await showIncorrectCredentials();
        }
    } catch (error) {
        console.error('Login error:', error);
        await showError('An error occurred during login. Please try again.');
    }
}

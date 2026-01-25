/**
 * Authentication module
 * Currently simulates login with hardcoded credentials
 * TODO: Replace with real backend API integration using fetch/AJAX
 */

import { showLoginSuccess, showIncorrectCredentials, showError } from './modules/popups.js';

/**
 * Initialize authentication functionality
 */
export function init() {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) {
        return; // Login form not present on this page
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

    // Simulated authentication
    // TODO: Replace with actual API call to backend
    // Example: const response = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    
    if (username === 'admin' && password === 'admin') {
        // Show success message with loading animation
        await showLoginSuccess();
        
        // Redirect to dashboard after success
        // TODO: Update path based on your actual project structure
        window.location.href = './frontend/pages/dashboard/index.php';
    } else {
        // Show incorrect credentials error
        await showIncorrectCredentials();
    }
}

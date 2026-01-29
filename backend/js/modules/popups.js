// SweetAlert2 modals for auth.js
import Swal from 'sweetalert2';

/**
 * Preloads dashboard assets to prevent FOUC
 */
async function preloadDashboardAssets() {
    return new Promise((resolve) => {
        const dashboardUrl = './frontend/pages/dashboard/';
        
        // Create a hidden iframe to preload the page and its assets
        const preloadFrame = document.createElement('iframe');
        preloadFrame.style.display = 'none';
        preloadFrame.style.width = '0';
        preloadFrame.style.height = '0';
        preloadFrame.src = dashboardUrl;
        
        preloadFrame.onload = () => {
            // Give extra time for CSS/JS to load in the iframe
            setTimeout(() => {
                document.body.removeChild(preloadFrame);
                resolve();
            }, 500);
        };
        
        preloadFrame.onerror = () => {
            document.body.removeChild(preloadFrame);
            resolve(); // Resolve anyway to not block navigation
        };
        
        document.body.appendChild(preloadFrame);
        
        // Fallback timeout
        setTimeout(() => {
            if (preloadFrame.parentNode) {
                document.body.removeChild(preloadFrame);
            }
            resolve();
        }, 2000);
    });
}

/**
 * Redirects to dashboard page
 */
function redirectToDashboard() {
    // Add page transition loader
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #f4f8fb 60%, #dbeafe 100%); z-index: 9999; display: flex; align-items: center; justify-content: center; flex-direction: column;">
            <div style="width: 48px; height: 48px; border: 4px solid #e2e8f0; border-top-color: #224796; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 1rem; color: #223557; font-weight: 500;">Loading dashboard...</p>
        </div>
        <style>
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(loader);
    
    // Redirect to dashboard (clean URL without index.php)
    window.location.href = './frontend/pages/dashboard/';
}

/**
 * Shows a success message when login is successful
 * Includes a loading animation with timer and preloads assets before redirecting to dashboard
 */
export async function showLoginSuccess() {
    const totalTime = 2500; // Total time in milliseconds (2.5 seconds)
    let preloadComplete = false;
    let statusUpdated = false;
    
    // Start preloading assets in parallel
    const preloadPromise = preloadDashboardAssets().then(() => {
        preloadComplete = true;
        // Update status when preload completes
        const statusEl = document.getElementById('loading-status');
        if (statusEl && !statusUpdated) {
            statusUpdated = true;
            statusEl.innerHTML = '<span style="color: #16a34a;">✓ Dashboard ready</span>';
        }
    });
    
    // Show modal with timer and progress bar
    const swalPromise = Swal.fire({
        title: '<span style="color:#224796;font-weight:600;">Login Successful</span>',
        html: '<div style="margin-top: 1rem;"><p style="margin-bottom: 0.5rem;">You have successfully logged in.</p><p id="loading-status" style="font-size: 0.875rem; color: #64748b;">Preparing dashboard...</p></div>',
        icon: 'success',
        background: 'linear-gradient(135deg, #f4f8fb 60%, #dbeafe 100%)',
        color: '#223557',
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
            popup: 'shadow-lg rounded-xl',
            title: 'text-lg',
            content: 'text-base'
        },
        didOpen: () => {
            Swal.showLoading();
        },
        timer: totalTime,
        timerProgressBar: true,
        willClose: () => {
            // Redirect when timer completes or modal closes
            redirectToDashboard();
        }
    });
    
    // Wait for preload to complete (but don't block the timer)
    await preloadPromise;
    
    return swalPromise;
}

/**
 * Shows an error message for incorrect credentials
 */
export function showIncorrectCredentials() {
    return Swal.fire({
        title: '<span style="color:#dc2626;font-weight:600;">Login Failed</span>',
        text: 'Incorrect username or password',
        icon: 'error',
        background: 'linear-gradient(135deg, #fef2f2 60%, #fee2e2 100%)',
        color: '#7f1d1d',
        confirmButtonText: 'OK',
        customClass: {
            popup: 'shadow-lg rounded-xl',
            title: 'text-lg',
            content: 'text-base',
            confirmButton:
                'inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 cursor-pointer transition-colors'
        }
    });
}

/**
 * Shows an error message when user is not found in database
 */
export function showUserNotFound() {
    return Swal.fire({
        title: '<span style="color:#dc2626;font-weight:600;">User Not Found</span>',
        text: 'No user found in the database',
        icon: 'error',
        background: 'linear-gradient(135deg, #fef2f2 60%, #fee2e2 100%)',
        color: '#7f1d1d',
        confirmButtonText: 'OK',
        customClass: {
            popup: 'shadow-lg rounded-xl',
            title: 'text-lg',
            content: 'text-base',
            confirmButton:
                'inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 cursor-pointer transition-colors'
        }
    });
}

/**
 * Generic error message helper
 * @param {string} message - Error message to display
 */
export function showError(message) {
    return Swal.fire({
        title: '<span style="color:#dc2626;font-weight:600;">Error</span>',
        text: message,
        icon: 'error',
        background: 'linear-gradient(135deg, #fef2f2 60%, #fee2e2 100%)',
        color: '#7f1d1d',
        confirmButtonText: 'OK',
        customClass: {
            popup: 'shadow-lg rounded-xl',
            title: 'text-lg',
            content: 'text-base',
            confirmButton:
                'inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 cursor-pointer transition-colors'
        }
    });
}

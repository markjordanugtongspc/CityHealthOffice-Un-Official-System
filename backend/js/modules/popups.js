// SweetAlert2 modals for auth.js
import Swal from 'sweetalert2';

/**
 * Shows a success message when login is successful
 * Includes a loading animation before redirecting to dashboard
 */
export function showLoginSuccess() {
    return Swal.fire({
        title: '<span style="color:#224796;font-weight:600;">Login Successful</span>',
        text: 'You have successfully logged in.',
        icon: 'success',
        background: 'linear-gradient(135deg, #f4f8fb 60%, #dbeafe 100%)',
        color: '#223557',
        showConfirmButton: false,
        customClass: {
            popup: 'shadow-lg rounded-xl',
            title: 'text-lg',
            content: 'text-base'
        },
        didOpen: () => {
            Swal.showLoading();
        },
        timer: 2000,
        timerProgressBar: true
    });
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

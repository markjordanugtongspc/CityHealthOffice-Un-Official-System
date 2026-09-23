// START: Redirects to dashboard page
/**
 * Redirects to dashboard page cleanly and flags overlay to display on this initial post-login transition
 */
export function redirectToDashboard() {
    sessionStorage.setItem('show_connecting_overlay', 'true');
    window.location.href = './frontend/pages/dashboard/';
}
// END: Redirects to dashboard page

// START: Shows login success sequence with success-once.gif and immediate dashboard transition
/**
 * Shows login success sequence:
 * 1. Replaces submit button content with enlarged success-once.gif (button fixed height h-[46px])
 * 2. Turns input fields into emerald theme
 * 3. Plays the GIF once through its animation cycle (~2.75s) and naturally stays paused
 * 4. Navigates directly to dashboard where the full-screen medicine overlay displays while assets load
 */
export async function showLoginSuccess() {
    // 1. Locate DOM elements
    const submitBtn = document.getElementById('loginSubmitBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameWrapper = document.getElementById('username-field-wrapper');
    const passwordWrapper = document.getElementById('password-field-wrapper');
    const usernameIconWrapper = document.getElementById('username-icon-wrapper');
    const passwordIconWrapper = document.getElementById('password-icon-wrapper');

    // 2. Turn fields into Emerald success theme
    if (usernameInput) {
        usernameInput.classList.remove('border-slate-300', 'border-rose-500', 'focus:ring-rose-500', 'focus:border-rose-500');
        usernameInput.classList.add('border-emerald-500', 'text-emerald-900', 'bg-emerald-50/40');
    }
    if (usernameWrapper) {
        usernameWrapper.classList.remove('border-rose-500', 'ring-2', 'ring-rose-200');
        usernameWrapper.classList.add('border-emerald-500', 'ring-2', 'ring-emerald-200');
    }
    if (usernameIconWrapper) {
        usernameIconWrapper.classList.remove('border-rose-500', 'text-rose-500', 'bg-rose-50');
        usernameIconWrapper.classList.add('border-emerald-500', 'text-emerald-600', 'bg-emerald-50');
    }

    if (passwordInput) {
        passwordInput.classList.remove('border-slate-300', 'border-rose-500', 'focus:ring-rose-500', 'focus:border-rose-500');
        passwordInput.classList.add('border-emerald-500', 'text-emerald-900', 'bg-emerald-50/40');
    }
    if (passwordWrapper) {
        passwordWrapper.classList.remove('border-rose-500', 'ring-2', 'ring-rose-200');
        passwordWrapper.classList.add('border-emerald-500', 'ring-2', 'ring-emerald-200');
    }
    if (passwordIconWrapper) {
        passwordIconWrapper.classList.remove('border-rose-500', 'text-rose-500', 'bg-rose-50');
        passwordIconWrapper.classList.add('border-emerald-500', 'text-emerald-600', 'bg-emerald-50');
    }

    // 3. Replace Sign In text inside button with enlarged success-once.gif (fixed height, never expands)
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.remove('bg-[#224796]', 'hover:bg-[#163473]');
        submitBtn.classList.add('bg-emerald-600', 'cursor-default', 'h-[46px]', 'max-h-[46px]', 'overflow-hidden');
        const gifSrc = `./frontend/images/login/success-once.gif?t=${Date.now()}`;
        submitBtn.innerHTML = `
            <div class="flex items-center justify-center w-full h-full">
                <img id="login-btn-success-img" src="${gifSrc}" alt="Success" class="w-11 h-11 sm:w-12 sm:h-12 object-contain drop-shadow-sm pointer-events-none" />
            </div>
        `;
    }

    // 4. Let success-once.gif play through Option B animation cycle (~1.86s to solid filled checkmark)
    await new Promise((resolve) => setTimeout(resolve, 1860));

    // 5. Automatically pause the animation on the final solid checkmark frame so it stays completely static
    const btnImg = document.getElementById('login-btn-success-img');
    if (btnImg) {
        btnImg.src = `./frontend/images/login/success-final-frame.png`;
    }

    // Short pause on static checkmark before direct navigation to dashboard
    await new Promise((resolve) => setTimeout(resolve, 400));

    // 6. Direct already to dashboard (full-screen medicine overlay renders while dashboard loads in background)
    redirectToDashboard();
}
// END: Shows login success sequence with success.gif, emerald state, and 2-grid medicine overlay

// START: Inline Rose-Red Validation Error Feedback
/**
 * Renders inline rose-red borders and helper error messages for incorrect username or password
 * @param {string} field - 'username' | 'password' | 'both'
 * @param {string} message - Error description
 */
export function showInlineFieldError(field = 'both', message = 'Incorrect credentials') {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameWrapper = document.getElementById('username-field-wrapper');
    const passwordWrapper = document.getElementById('password-field-wrapper');
    const usernameIconWrapper = document.getElementById('username-icon-wrapper');
    const passwordIconWrapper = document.getElementById('password-icon-wrapper');
    const usernameError = document.getElementById('username-error');
    const usernameErrorText = document.getElementById('username-error-text');
    const passwordError = document.getElementById('password-error');
    const passwordErrorText = document.getElementById('password-error-text');

    if (field === 'username' || field === 'both') {
        if (usernameInput) {
            usernameInput.classList.remove('border-slate-300', 'focus:ring-[#224796]', 'focus:border-[#224796]');
            usernameInput.classList.add('border-rose-500', 'focus:ring-rose-500', 'focus:border-rose-500', 'text-rose-900', 'bg-rose-50/20');
        }
        if (usernameWrapper) {
            usernameWrapper.classList.add('border-rose-500', 'ring-1', 'ring-rose-400');
        }
        if (usernameIconWrapper) {
            usernameIconWrapper.classList.remove('border-slate-300', 'text-slate-500', 'bg-slate-100');
            usernameIconWrapper.classList.add('border-rose-500', 'text-rose-600', 'bg-rose-50');
        }
        if (usernameError && usernameErrorText) {
            usernameErrorText.textContent = message;
            usernameError.classList.remove('hidden');
        }
    }

    if (field === 'password' || field === 'both') {
        if (passwordInput) {
            passwordInput.classList.remove('border-slate-300', 'focus:ring-[#224796]', 'focus:border-[#224796]');
            passwordInput.classList.add('border-rose-500', 'focus:ring-rose-500', 'focus:border-rose-500', 'text-rose-900', 'bg-rose-50/20');
        }
        if (passwordWrapper) {
            passwordWrapper.classList.add('border-rose-500', 'ring-1', 'ring-rose-400');
        }
        if (passwordIconWrapper) {
            passwordIconWrapper.classList.remove('border-slate-300', 'text-slate-500', 'bg-slate-100');
            passwordIconWrapper.classList.add('border-rose-500', 'text-rose-600', 'bg-rose-50');
        }
        if (passwordError && passwordErrorText) {
            passwordErrorText.textContent = message;
            passwordError.classList.remove('hidden');
        }
    }
}
// END: Inline Rose-Red Validation Error Feedback

// START: Clear Inline Validation Errors
/**
 * Clears rose-red error styling when user types or retries
 */
export function clearInlineFieldErrors() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameWrapper = document.getElementById('username-field-wrapper');
    const passwordWrapper = document.getElementById('password-field-wrapper');
    const usernameIconWrapper = document.getElementById('username-icon-wrapper');
    const passwordIconWrapper = document.getElementById('password-icon-wrapper');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');

    if (usernameInput) {
        usernameInput.classList.remove('border-rose-500', 'focus:ring-rose-500', 'focus:border-rose-500', 'text-rose-900', 'bg-rose-50/20');
        usernameInput.classList.add('border-slate-300', 'focus:ring-[#224796]', 'focus:border-[#224796]');
    }
    if (usernameWrapper) {
        usernameWrapper.classList.remove('border-rose-500', 'ring-1', 'ring-rose-400');
    }
    if (usernameIconWrapper) {
        usernameIconWrapper.classList.remove('border-rose-500', 'text-rose-600', 'bg-rose-50');
        usernameIconWrapper.classList.add('border-slate-300', 'text-slate-500', 'bg-slate-100');
    }
    if (usernameError) {
        usernameError.classList.add('hidden');
    }

    if (passwordInput) {
        passwordInput.classList.remove('border-rose-500', 'focus:ring-rose-500', 'focus:border-rose-500', 'text-rose-900', 'bg-rose-50/20');
        passwordInput.classList.add('border-slate-300', 'focus:ring-[#224796]', 'focus:border-[#224796]');
    }
    if (passwordWrapper) {
        passwordWrapper.classList.remove('border-rose-500', 'ring-1', 'ring-rose-400');
    }
    if (passwordIconWrapper) {
        passwordIconWrapper.classList.remove('border-rose-500', 'text-rose-600', 'bg-rose-50');
        passwordIconWrapper.classList.add('border-slate-300', 'text-slate-500', 'bg-slate-100');
    }
    if (passwordError) {
        passwordError.classList.add('hidden');
    }
}
// END: Clear Inline Validation Errors

// START: Generic SweetAlert for system / server errors
/**
 * Generic error message helper for unexpected connection/network failures
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
// END: Generic SweetAlert for system / server errors

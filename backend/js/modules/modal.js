/**
 * Custom Tailwind CSS Modal Component
 * Replaces SweetAlert2 with modern Tailwind CSS modals
 */

let modalContainer = null;

/**
 * Initialize modal container
 */
function initModalContainer() {
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'customModalContainer';
        // Transparent backdrop with blur effect (not dark/black)
        modalContainer.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 backdrop-blur-md transition-opacity duration-300';
        modalContainer.style.cssText = 'display: none; background: rgba(255, 255, 255, 0.1);';
        document.body.appendChild(modalContainer);
    }
    return modalContainer;
}

/**
 * Show a modal with custom content
 * @param {Object} options - Modal configuration
 * @param {string} options.type - Modal type: 'success', 'error', 'warning', 'info', 'loading'
 * @param {string} options.title - Modal title
 * @param {string} options.text - Modal message text
 * @param {string} options.confirmText - Confirm button text (default: 'OK')
 * @param {Function} options.onConfirm - Callback when confirm is clicked
 * @param {boolean} options.showCancel - Show cancel button (default: false)
 * @param {string} options.cancelText - Cancel button text (default: 'Cancel')
 * @param {Function} options.onCancel - Callback when cancel is clicked
 */
export function showModal(options = {}) {
    const {
        type = 'info',
        title = '',
        text = '',
        confirmText = 'OK',
        onConfirm,
        showCancel = false,
        cancelText = 'Cancel',
        onCancel
    } = options;

    const container = initModalContainer();
    
    // Icon configuration
    const icons = {
        success: {
            bg: 'bg-green-100',
            icon: `<svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        },
        error: {
            bg: 'bg-red-100',
            icon: `<svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        },
        warning: {
            bg: 'bg-yellow-100',
            icon: `<svg class="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>`
        },
        info: {
            bg: 'bg-blue-100',
            icon: `<svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        },
        loading: {
            bg: 'bg-blue-100',
            icon: `<svg class="w-10 h-10 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>`
        }
    };

    const iconConfig = icons[type] || icons.info;

    // Modal HTML
    const modalHTML = `
        <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 transform transition-all duration-300 scale-100" id="customModalContent">
            <div class="p-4 md:p-5">
                <!-- Icon and Title -->
                <div class="flex flex-col items-center text-center mb-4">
                    <div class="${iconConfig.bg} rounded-full p-2.5 mb-3">
                        ${iconConfig.icon}
                    </div>
                    ${title ? `<h3 class="text-lg font-semibold text-slate-900 mb-1.5">${title}</h3>` : ''}
                    ${text ? `<p class="text-sm text-slate-600 leading-relaxed px-2">${text}</p>` : ''}
                </div>

                <!-- Buttons -->
                <div class="flex ${showCancel ? 'gap-2' : ''} justify-center">
                    ${showCancel ? `
                        <button
                            id="customModalCancelBtn"
                            class="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1 transition-colors cursor-pointer"
                        >
                            ${cancelText}
                        </button>
                    ` : ''}
                    <button
                        id="customModalConfirmBtn"
                        class="${showCancel ? 'flex-1' : 'px-6'} px-4 py-2 text-sm font-medium text-white bg-[#224796] rounded-lg hover:bg-[#163473] focus:outline-none focus:ring-2 focus:ring-[#224796] focus:ring-offset-1 transition-colors shadow-sm cursor-pointer"
                    >
                        ${confirmText}
                    </button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = modalHTML;
    container.style.display = 'flex';
    
    // Animate in
    setTimeout(() => {
        const content = container.querySelector('#customModalContent');
        if (content) {
            content.style.transform = 'scale(1)';
        }
    }, 10);

    // Handle confirm button
    const confirmBtn = container.querySelector('#customModalConfirmBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            closeModal();
            if (onConfirm) {
                onConfirm();
            }
        });
    }

    // Handle cancel button
    if (showCancel) {
        const cancelBtn = container.querySelector('#customModalCancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                closeModal();
                if (onCancel) {
                    onCancel();
                }
            });
        }
    }

    // Close on backdrop click
    container.addEventListener('click', (e) => {
        if (e.target === container) {
            closeModal();
            if (onCancel) {
                onCancel();
            }
        }
    });

    // Close on escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            if (onCancel) {
                onCancel();
            }
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

/**
 * Show success modal (specifically for export success)
 */
export function showSuccess(title = 'Export Successful', text = 'Your file has been downloaded successfully.', onConfirm) {
    return showModal({
        type: 'success',
        title,
        text,
        confirmText: 'OK',
        onConfirm
    });
}

/**
 * Show error modal
 */
export function showError(title = 'Error', text = 'An error occurred.', onConfirm) {
    return showModal({
        type: 'error',
        title,
        text,
        confirmText: 'OK',
        onConfirm
    });
}

/**
 * Show warning modal
 */
export function showWarning(title = 'Warning', text = 'Please review your selection.', onConfirm, onCancel) {
    return showModal({
        type: 'warning',
        title,
        text,
        confirmText: 'Continue',
        showCancel: true,
        cancelText: 'Cancel',
        onConfirm,
        onCancel
    });
}

/**
 * Show loading modal
 */
export function showLoading(title = 'Processing...', text = 'Please wait while we process your request.') {
    const container = initModalContainer();
    
    const iconConfig = {
        bg: 'bg-blue-100',
        icon: `<svg class="w-12 h-12 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>`
    };
    
    const modalHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100" id="customModalContent">
            <div class="p-6">
                <div class="flex flex-col items-center text-center">
                    <div class="${iconConfig.bg} rounded-full p-4 mb-4">
                        ${iconConfig.icon}
                    </div>
                    ${title ? `<h3 class="text-xl font-semibold text-slate-900 mb-2">${title}</h3>` : ''}
                    ${text ? `<p class="text-sm text-slate-600 leading-relaxed">${text}</p>` : ''}
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = modalHTML;
    container.style.display = 'flex';
    
    setTimeout(() => {
        const content = container.querySelector('#customModalContent');
        if (content) {
            content.style.transform = 'scale(1)';
        }
    }, 10);
}

/**
 * Close modal
 */
export function closeModal() {
    const container = document.getElementById('customModalContainer');
    if (container) {
        const content = container.querySelector('#customModalContent');
        if (content) {
            content.style.transform = 'scale(0.95)';
            content.style.opacity = '0';
        }
        setTimeout(() => {
            container.style.display = 'none';
            container.innerHTML = '';
        }, 200);
    }
}

/**
 * Show export success modal with special styling
 */
export function showExportSuccess(filename, format) {
    const formatIcons = {
        'excel': '📊',
        'csv': '📄',
        'pdf': '📑',
        'docx': '📝',
        'json': '📋'
    };
    
    const icon = formatIcons[format] || '📄';
    
    return showModal({
        type: 'success',
        title: 'Export Successful! 🎉',
        text: `Your ${format.toUpperCase()} file "${filename}" has been downloaded successfully.`,
        confirmText: 'Great!',
        onConfirm: () => {
            closeModal();
        }
    });
}

// ============================================================================
// MONTHLY EXPENSES MODAL FUNCTIONS
// ============================================================================
// These functions are specifically for Monthly Expenses Summary page
// Separated from other modal functions for clarity

/**
 * Show monthly expenses add entry modal
 * Note: This is currently handled by SweetAlert2 in monthly-expenses.js
 * This function is reserved for future custom modal implementation if needed
 */
export function showMonthlyExpensesAddModal(options = {}) {
    // Reserved for future implementation
    // Currently using SweetAlert2 directly in monthly-expenses.js
    console.log('Monthly Expenses Add Modal - Reserved for future implementation');
}

/**
 * Show monthly expenses calculate results modal
 * Note: This is currently handled by SweetAlert2 in monthly-expenses.js
 * This function is reserved for future custom modal implementation if needed
 */
export function showMonthlyExpensesCalculateModal(options = {}) {
    // Reserved for future implementation
    // Currently using SweetAlert2 directly in monthly-expenses.js
    console.log('Monthly Expenses Calculate Modal - Reserved for future implementation');
}

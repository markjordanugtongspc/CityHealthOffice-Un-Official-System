/**
 * Custom Tailwind CSS Modal Component
 * Replaces SweetAlert2 with modern Tailwind CSS modals
 */

import Swal from 'sweetalert2';

let modalContainer = null;

const DEFAULT_PASSWORD = 'mjUgtong2026!';

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// Shared SweetAlert2 styling helpers
// ============================================================================

export const sweetalertPopupBaseClasses =
    'rounded-2xl shadow-xl border border-slate-200';

export const sweetalertPopupScrollableBaseClasses =
    'rounded-2xl shadow-xl border border-slate-200';

export const sweetalertHtmlLeftAlignedClasses = 'text-left';

export const sweetalertHtmlScrollableClasses =
    'text-left max-h-[85vh] overflow-y-auto';

export const sweetalertPrimaryConfirmClasses =
    'inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 cursor-pointer transition-colors';

export const sweetalertSecondaryCancelClasses =
    'inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1 cursor-pointer transition-colors';

export const sweetalertNeutralConfirmBlueClasses =
    'inline-flex items-center justify-center rounded-lg bg-[#224796] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#163473] focus:outline-none focus:ring-2 focus:ring-[#224796] focus:ring-offset-1 cursor-pointer transition-colors';

export const sweetalertNeutralCancelSlateClasses =
    'inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1 cursor-pointer transition-colors';

export const sweetalertActionsLeftAlignedClasses =
    'flex items-center justify-start gap-3 mt-4';

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
/**
 * Show permission denied toast
 * Used when user tries to access admin page without proper role
 */
export function showPermissionDeniedToast() {
    return Swal.fire({
        title: 'Access Denied',
        text: "You don't have permission or privilege to do that",
        icon: 'warning',
        iconColor: '#ef4444',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        customClass: {
            popup: `${sweetalertPopupBaseClasses} max-w-sm`,
            title: 'text-base font-semibold text-slate-900',
            htmlContainer: 'text-sm text-slate-600',
        },
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
    });
}

/**
 * Show unauthorized access warning modal
 * Used when user tries to access protected pages without login
 */
export function showUnauthorizedAccess() {
    return Swal.fire({
        title: 'Access Denied',
        html: `
            <div class="text-center">
                <div class="mb-4">
                    <svg class="mx-auto h-16 w-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                </div>
                <p class="text-base sm:text-lg font-semibold text-slate-900 mb-2">Please Login First</p>
                <p class="text-sm sm:text-base text-slate-600">You need to be logged in to access this page.</p>
            </div>
        `,
        icon: 'warning',
        iconColor: '#f59e0b',
        confirmButtonText: 'Go to Login',
        confirmButtonColor: '#224796',
        customClass: {
            popup: `${sweetalertPopupBaseClasses} max-w-sm sm:max-w-md`,
            title: 'text-xl sm:text-2xl font-bold text-slate-900 mb-2',
            htmlContainer: 'text-left px-2 sm:px-4',
            confirmButton: `${sweetalertNeutralConfirmBlueClasses} w-full sm:w-auto px-6 py-2.5 text-sm sm:text-base`,
        },
        buttonsStyling: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showClass: {
            popup: 'animate-fade-in',
        },
        hideClass: {
            popup: 'animate-fade-out',
        },
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/';
        }
    });
}

/**
 * Show admin edit user modal (SweetAlert2)
 * Fetches user data and allows editing username, full_name, and email
 * @param {string} username - Username of the user to edit
 */
export async function showAdminEditUserModal(username) {
    if (!username) {
        return;
    }

    try {
        // Get API base path
        const path = window.location.pathname || '/';
        const apiBase = path.substring(0, path.indexOf('/frontend/') !== -1 ? path.indexOf('/frontend/') : path.lastIndexOf('/')) || '';

        // Show loading
        Swal.fire({
            title: 'Loading user data...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        // Fetch user data
        const response = await fetch(`${apiBase}/api/users/get.php?username=${encodeURIComponent(username)}`, {
            credentials: 'same-origin',
        });

        if (!response.ok) {
            throw new Error('Failed to load user data');
        }

        const data = await response.json();
        if (!data.success || !data.user) {
            throw new Error('User not found');
        }

        const user = data.user;

        // Get current user's role to determine role editing permissions
        const currentUserResponse = await fetch(`${apiBase}/api/auth/current-user.php`, {
            credentials: 'same-origin',
        });
        const currentUserData = await currentUserResponse.json();
        const currentUserRole = currentUserData.success ? currentUserData.user.role : null;

        // Define role hierarchy and allowed roles for editing
        const roleHierarchy = {
            'Administrator': ['Administrator', 'CEO', 'Manager', 'Staff', 'Workmate'],
            'CEO': ['CEO', 'Manager', 'Staff', 'Workmate'],
            'Manager': ['Manager', 'Staff', 'Workmate'],
        };

        const allowedRoles = roleHierarchy[currentUserRole] || [];
        const allRoles = ['Administrator', 'CEO', 'Manager', 'Staff', 'Workmate'];

        // Format date for input (YYYY-MM-DD)
        const formattedDob = user.date_of_birth ? user.date_of_birth.split(' ')[0] : '';
        // Format phone (remove leading 0 for display)
        const displayPhone = user.phone_number && user.phone_number.startsWith('0') 
            ? user.phone_number.substring(1) 
            : (user.phone_number || '');

         // Show edit modal
     const result = await Swal.fire({
        title: 'Edit User',
        html: `
            <div class="text-left space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">Username <span class="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        id="edit-username" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#224796] focus:border-[#224796] text-sm" 
                        value="${escapeHtml(user.username)}" 
                        readonly
                        style="background-color: #f1f5f9; cursor: not-allowed;"
                    >
                    <p class="mt-1 text-xs text-slate-500">Username cannot be changed</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">Full Name <span class="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        id="edit-full-name" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#224796] focus:border-[#224796] text-sm" 
                        value="${escapeHtml(user.full_name || '')}" 
                        placeholder="e.g., John Doe"
                        required
                    >
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">Email <span class="text-red-500">*</span></label>
                    <input 
                        type="email" 
                        id="edit-email" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#224796] focus:border-[#224796] text-sm" 
                        value="${escapeHtml(user.email || '')}" 
                        placeholder="e.g., john.doe@example.com"
                        required
                    >
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                    <div class="flex items-center rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#224796] focus-within:border-[#224796]">
                        <span class="flex items-center justify-center min-w-[44px] px-2 text-sm font-medium text-slate-600 bg-slate-50 border-r border-slate-300 select-none h-full min-h-[34px] sm:min-h-[36px]">+64</span>
                        <input 
                            type="tel" 
                            id="edit-phone" 
                            inputmode="tel" 
                            class="bg-transparent border-0 text-slate-900 text-sm focus:ring-0 focus:outline-none block w-full px-2.5 h-full" 
                            value="${escapeHtml(displayPhone)}" 
                            placeholder="9XXXXXXXX"
                        >
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
                    <input 
                        type="date" 
                        id="edit-dob" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#224796] focus:border-[#224796] text-sm" 
                        value="${formattedDob}"
                    >
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
                    <select id="edit-gender" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#224796] focus:border-[#224796] text-sm cursor-pointer">
                        <option value="">Select gender...</option>
                        <option value="Male" ${user.gender === 'Male' ? 'selected' : ''}>Male</option>
                        <option value="Female" ${user.gender === 'Female' ? 'selected' : ''}>Female</option>
                        <option value="Other" ${user.gender === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">Biography</label>
                    <textarea 
                        id="edit-bio" 
                        rows="3" 
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#224796] focus:border-[#224796] text-sm" 
                        placeholder="Brief description about the user..."
                    >${escapeHtml(user.bio_graphy || '')}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">Role <span class="text-red-500">*</span></label>
                        <select id="edit-role" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#224796] focus:border-[#224796] text-sm cursor-pointer" required>
                            ${allRoles.map(function(role) {
                                const isSelected = user.role === role;
                                const isAllowed = allowedRoles.includes(role);
                                
                                // Role order for escalation check
                                const roleOrder = {
                                    'Administrator': 1,
                                    'CEO': 2,
                                    'Manager': 3,
                                    'Staff': 4,
                                    'Workmate': 5,
                                };
                                
                                const currentUserRoleLevel = roleOrder[currentUserRole] || 999;
                                const newRoleLevel = roleOrder[role] || 999;
                                const currentUserRoleLevel_beingEdited = roleOrder[user.role] || 999;
                                
                                // Disable if role is higher than current user's role
                                // or if target user has higher role than current user
                                const isEscalation = newRoleLevel < currentUserRoleLevel || currentUserRoleLevel_beingEdited < currentUserRoleLevel;
                                const shouldDisable = !isAllowed || isEscalation;
                                
                                const roleEscaped = escapeHtml(role);
                                const selectedAttr = isSelected ? 'selected' : '';
                                const disabledAttr = shouldDisable ? 'disabled' : '';
                                // Add inline styles for disabled options to prevent selection
                                const styleAttr = shouldDisable ? 'style="user-select: none; pointer-events: none; opacity: 0.5;"' : '';
                                let notAllowedText = '';
                                if (!isAllowed) {
                                    notAllowedText = ' (Not allowed)';
                                } else if (isEscalation) {
                                    notAllowedText = ' (Cannot escalate)';
                                }
                                
                                return '<option value="' + roleEscaped + '" ' + selectedAttr + ' ' + disabledAttr + ' ' + styleAttr + '>' + roleEscaped + notAllowedText + '</option>';
                            }).join('')}
                        </select>
                        ${allowedRoles.length < allRoles.length ? '<p class="mt-1 text-xs text-slate-500">You can only assign roles: ' + allowedRoles.join(', ') + '</p>' : ''}
                </div>
            </div>
        `,
        icon: 'info',
        iconColor: '#224796',
        showCancelButton: true,
        confirmButtonText: 'Update User',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#224796',
        cancelButtonColor: '#64748b',
        customClass: {
        popup: `${sweetalertPopupBaseClasses} max-w-lg`,
        title: 'text-xl font-semibold text-slate-900 mb-4',
        htmlContainer: 'text-left',
        confirmButton: `${sweetalertNeutralConfirmBlueClasses} px-6 py-2.5`,
        cancelButton: `${sweetalertNeutralCancelSlateClasses} px-6 py-2.5`,
    },
    buttonsStyling: false,
    focusConfirm: false,
    preConfirm: async () => {
        const fullName = document.getElementById('edit-full-name')?.value.trim();
        const email = document.getElementById('edit-email')?.value.trim();
        const phone = document.getElementById('edit-phone')?.value.trim();
        const dob = document.getElementById('edit-dob')?.value;
        const gender = document.getElementById('edit-gender')?.value;
        const bio = document.getElementById('edit-bio')?.value.trim();
        const role = document.getElementById('edit-role')?.value;

                // Validation
                if (!fullName) {
                    Swal.showValidationMessage('Full name is required');
                    return false;
                }

                if (!email) {
                    Swal.showValidationMessage('Email is required');
                    return false;
                }

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    Swal.showValidationMessage('Please enter a valid email address');
                    return false;
                }

                if (!role) {
                    Swal.showValidationMessage('Role is required');
                    return false;
                }

                // Validate role assignment permission
                if (!allowedRoles.includes(role)) {
                    Swal.showValidationMessage(`You don't have permission to assign the role "${role}"`);
                    return false;
                }

                // Prevent role escalation: Check if user is trying to change to a higher role
                const roleOrder = {
                    'Administrator': 1,
                    'CEO': 2,
                    'Manager': 3,
                    'Staff': 4,
                    'Workmate': 5,
                };

                const currentUserRoleLevel = roleOrder[currentUserRole] || 999;
                const newRoleLevel = roleOrder[role] || 999;
                const currentUserRoleLevel_beingEdited = roleOrder[user.role] || 999;

                // Prevent changing to a role higher than current user's role
                if (newRoleLevel < currentUserRoleLevel) {
                    Swal.showValidationMessage(`You cannot assign a role higher than your own (${currentUserRole})`);
                    return false;
                }

                // Prevent changing a user who has a higher role than current user
                if (currentUserRoleLevel_beingEdited < currentUserRoleLevel) {
                    Swal.showValidationMessage(`You cannot modify users with a higher role than yours (${user.role})`);
                    return false;
                }

                // Normalize phone number
                let normalizedPhone = null;
                if (phone) {
                    const digits = phone.replace(/[^0-9]/g, '');
                    if (digits) {
                        normalizedPhone = digits.startsWith('0') ? digits : '0' + digits;
                    }
                }

                // Format date of birth
                const formattedDob = dob || null;

                return {
                    username: user.username,
                    full_name: fullName,
                    email: email,
                    role: role,
                    phone_number: normalizedPhone,
                    date_of_birth: formattedDob,
                    gender: gender || null,
                    bio_graphy: bio || null,
                };
            },
        });

        if (result.isConfirmed && result.value) {
            // Show loading
            Swal.fire({
                title: 'Updating user...',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            // Update user
            const updateResponse = await fetch(`${apiBase}/api/users/update.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(result.value),
                credentials: 'same-origin',
            });

            const updateData = await updateResponse.json();

            if (!updateData.success) {
                throw new Error(updateData.message || 'Failed to update user');
            }

            // Show success
            Swal.fire({
                icon: 'success',
                title: 'User Updated',
                text: `User "${user.username}" has been updated successfully.`,
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: sweetalertNeutralConfirmBlueClasses,
                },
            });

            // Reload users table (trigger custom event)
            window.dispatchEvent(new CustomEvent('adminUserUpdated'));
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load or update user. Please try again.',
            confirmButtonText: 'OK',
            customClass: {
                confirmButton: sweetalertNeutralConfirmBlueClasses,
            },
        });
    }
}

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

// ============================================================================
// ADMIN USER CREATION MODAL (Flowbite)
// ============================================================================

let adminModalOnConfirm = null;
let adminModalValidationError = null;

/**
 * Initialize Flowbite admin modal
 */
function initAdminModal() {
    // Create modal HTML if it doesn't exist
    if (!document.getElementById('adminCreateUserModal')) {
        const modalHTML = `
            <!-- Create User Modal Backdrop -->
            <div id="adminModalBackdrop" class="hidden fixed inset-0 bg-white/60 backdrop-blur-[2px] z-40 transition-opacity"></div>
            <!-- Create User Modal -->
            <div id="adminCreateUserModal" tabindex="-1" aria-hidden="true" class="hidden fixed inset-0 z-50 overflow-y-auto overflow-x-hidden p-3 sm:p-4">
               <div class="relative w-full max-w-lg mx-auto sm:ml-auto sm:mr-52 md:mr-[28rem] my-auto max-h-[calc(100vh-1.5rem)]">
                    <div class="relative bg-white rounded-lg shadow-xl border border-gray-200 p-4 sm:p-5">
                        <div class="flex justify-between items-center pb-3 mb-3 rounded-t border-b border-gray-200 sm:mb-4">
                            <h3 class="text-lg font-semibold text-gray-900">Create New User</h3>
                            <button type="button" id="adminModalCloseBtn" class="text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center cursor-pointer transition-colors">
                                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                                <span class="sr-only">Close modal</span>
                            </button>
                        </div>
                        <!-- Modal body -->
                        <form id="adminCreateUserForm" action="#">
                            <div id="adminModalValidationError" class="hidden mb-3 p-3 text-sm text-red-800 bg-red-50 rounded-lg border border-red-200"></div>
                            <div class="grid gap-3 mb-4 sm:grid-cols-2">
                                <div class="sm:col-span-2">
                                    <label for="admin-username" class="block mb-1.5 text-sm font-medium text-gray-900">Username <span class="text-red-500">*</span></label>
                                    <input type="text" name="username" id="admin-username" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-[#224796] focus:border-[#224796] block w-full p-2.5" placeholder="e.g., jdoe" required>
                                </div>
                                <div class="sm:col-span-2">
                                    <label for="admin-full-name" class="block mb-1.5 text-sm font-medium text-gray-900">Full Name <span class="text-red-500">*</span></label>
                                    <input type="text" name="full-name" id="admin-full-name" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-[#224796] focus:border-[#224796] block w-full p-2.5" placeholder="e.g., John Doe" required>
                                </div>
                                <div class="sm:col-span-2">
                                    <label for="admin-email" class="block mb-1.5 text-sm font-medium text-gray-900">Email <span class="text-red-500">*</span></label>
                                    <input type="email" name="email" id="admin-email" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-[#224796] focus:border-[#224796] block w-full p-2.5" placeholder="e.g., john.doe@example.com" required>
                                </div>
                                <div>
                                    <label for="admin-role" class="block mb-1.5 text-sm font-medium text-gray-900">Role <span class="text-red-500">*</span></label>
                                    <select id="admin-role" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-[#224796] focus:border-[#224796] block w-full p-2.5 cursor-pointer" required>
                                        <option value="">Select role...</option>
                                        <option value="Administrator">Administrator</option>
                                        <option value="CEO">CEO</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Workmate">Workmate</option>
                                        <option value="Staff">Staff</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="admin-phone" class="block mb-1.5 text-sm font-medium text-gray-900">Phone Number</label>
                                    <div class="flex rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#224796] focus-within:border-[#224796]">
                                        <span class="inline-flex items-center px-3 text-sm font-medium text-gray-600 bg-gray-50 border-r border-gray-300 select-none">+64</span>
                                        <input type="tel" name="phone" id="admin-phone" inputmode="tel" class="bg-transparent border-0 text-gray-900 text-sm rounded-lg focus:ring-0 focus:outline-none block w-full p-2.5" placeholder="9XXXXXXXX">
                                    </div>
                                </div>
                                <div>
                                    <label for="admin-dob" class="block mb-1.5 text-sm font-medium text-gray-900">Date of Birth</label>
                                    <input type="date" name="dob" id="admin-dob" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-[#224796] focus:border-[#224796] block w-full p-2.5">
                                </div>
                                <div>
                                    <label for="admin-gender" class="block mb-1.5 text-sm font-medium text-gray-900">Gender</label>
                                    <select id="admin-gender" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-[#224796] focus:border-[#224796] block w-full p-2.5 cursor-pointer">
                                        <option value="">Select gender...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div class="sm:col-span-2">
                                    <label for="admin-bio" class="block mb-1.5 text-sm font-medium text-gray-900">Biography</label>
                                    <textarea id="admin-bio" rows="3" class="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#224796] focus:border-[#224796]" placeholder="Brief description about the user..."></textarea>
                                </div>
                                <div class="sm:col-span-2">
                                    <div class="w-full rounded-lg border border-amber-200 bg-amber-50 p-2.5">
                                        <p class="text-xs font-medium text-amber-800">
                                            <strong>Default Password:</strong> ${DEFAULT_PASSWORD}
                                        </p>
                                        <p class="text-xs text-amber-700 mt-1">
                                            User will be prompted to change password on first login.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 sm:space-x-4">
                                <button type="submit" class="text-white inline-flex items-center justify-center bg-[#224796] hover:bg-[#163473] focus:ring-4 focus:outline-none focus:ring-[#224796]/50 font-medium rounded-lg text-sm px-5 py-2.5 cursor-pointer transition-colors">
                                    <svg class="mr-1 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                                    </svg>
                                    Create User
                                </button>
                                <button type="button" id="adminModalCancelBtn" class="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-[#224796] focus:z-10 focus:ring-4 focus:ring-gray-100 cursor-pointer transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup event listeners
        const modal = document.getElementById('adminCreateUserModal');
        const backdrop = document.getElementById('adminModalBackdrop');
        const closeBtn = document.getElementById('adminModalCloseBtn');
        const cancelBtn = document.getElementById('adminModalCancelBtn');
        const form = document.getElementById('adminCreateUserForm');
        const phoneInput = document.getElementById('admin-phone');

        // Close modal handlers
        const closeModal = () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex', 'items-center', 'justify-end');
            modal.setAttribute('aria-hidden', 'true');
            if (backdrop) {
                backdrop.classList.add('hidden');
            }
            document.body.classList.remove('overflow-hidden');
            adminModalOnConfirm = null;
            adminModalValidationError = null;
        };

        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);
        
        // Close on backdrop click
        if (backdrop) {
            backdrop.addEventListener('click', closeModal);
        }

        // Close on ESC key press (global handler)
        const handleGlobalEscKey = (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleGlobalEscKey);

        // Phone normalization on blur
        phoneInput?.addEventListener('blur', () => {
            let value = phoneInput.value || '';
            let digits = value.replace(/[^0-9]/g, '');
            if (digits.startsWith('0')) {
                digits = digits.slice(1);
            }
            phoneInput.value = digits;
        });

        // Form submission
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAdminFormSubmit();
        });
    }
}

/**
 * Handle admin form submission
 */
function handleAdminFormSubmit() {
    const username = document.getElementById('admin-username')?.value?.trim();
    const fullName = document.getElementById('admin-full-name')?.value?.trim();
    const email = document.getElementById('admin-email')?.value?.trim();
    const role = document.getElementById('admin-role')?.value;
    const phone = document.getElementById('admin-phone')?.value?.trim() || null;
    const dob = document.getElementById('admin-dob')?.value || null;
    const gender = document.getElementById('admin-gender')?.value || null;
    const bio = document.getElementById('admin-bio')?.value?.trim() || null;
    const errorEl = document.getElementById('adminModalValidationError');

    // Validation
    let errorMessage = null;

    if (!username || username.length < 3) {
        errorMessage = 'Username must be at least 3 characters';
    } else if (!fullName || fullName.length < 2) {
        errorMessage = 'Full name is required';
    } else {
        const emailLower = (email || '').toLowerCase();
        const basicEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower);
        if (!emailLower || !basicEmailValid) {
            errorMessage = 'Valid email address is required';
        } else {
            const domain = emailLower.split('@')[1] || '';
            const tempDomains = [
                'tempmail.com',
                'tempmail.net',
                'yopmail.com',
                '10minutemail.com',
                'mailinator.com',
                'guerrillamail.com',
            ];
            if (tempDomains.some((d) => domain === d || domain.endsWith(`.${d}`))) {
                errorMessage = 'Temporary email addresses are not allowed. Please use your real email.';
            }
        }
    }

    if (!role) {
        errorMessage = 'Role is required';
    }

    if (errorMessage) {
        if (errorEl) {
            errorEl.textContent = errorMessage;
            errorEl.classList.remove('hidden');
        }
        return;
    }

    // Hide error
    if (errorEl) {
        errorEl.classList.add('hidden');
    }

    // Normalize phone number
    let normalizedPhone = null;
    if (phone) {
        let digits = phone.replace(/[^0-9]/g, '');
        if (digits.startsWith('0')) {
            digits = digits.slice(1);
        }
        normalizedPhone = digits || null;
    }

    // Format date of birth
    let formattedDob = null;
    if (dob) {
        const date = new Date(dob);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        formattedDob = `${month}/${day}/${year}`;
    }

    const userData = {
        username,
        full_name: fullName,
        email,
        role,
        phone_number: normalizedPhone,
        date_of_birth: formattedDob,
        gender,
        bio_graphy: bio,
    };

    // Close modal
    const modal = document.getElementById('adminCreateUserModal');
    const backdrop = document.getElementById('adminModalBackdrop');
    modal.classList.add('hidden');
    modal.classList.remove('flex', 'items-center', 'justify-end');
    modal.setAttribute('aria-hidden', 'true');
    if (backdrop) {
        backdrop.classList.add('hidden');
    }
    document.body.classList.remove('overflow-hidden');

    // Call callback
    if (adminModalOnConfirm) {
        adminModalOnConfirm(userData);
    }
}

/**
 * Show admin user creation modal (Flowbite)
 * @param {Function} onConfirm Callback when user is created
 */
export function showAdminCreateUserModal(onConfirm) {
    initAdminModal();
    adminModalOnConfirm = onConfirm;

    const modal = document.getElementById('adminCreateUserModal');
    const backdrop = document.getElementById('adminModalBackdrop');
    const form = document.getElementById('adminCreateUserForm');
    const errorEl = document.getElementById('adminModalValidationError');

    // Reset form
    form?.reset();
    if (errorEl) {
        errorEl.classList.add('hidden');
    }

    // Show backdrop and modal
    if (backdrop) {
        backdrop.classList.remove('hidden');
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex', 'items-center', 'justify-end');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');

    // ESC key handler is already set up in initAdminModal()
    // It will automatically close the modal when ESC is pressed

    // Focus first input
    setTimeout(() => {
        document.getElementById('admin-username')?.focus();
    }, 100);
}


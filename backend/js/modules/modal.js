/**
 * Custom Tailwind CSS Modal Component
 * Replaces SweetAlert2 with modern Tailwind CSS modals
 */

import Swal from 'sweetalert2';
import { printVoucher } from './voucher.js';

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
                            ${allRoles.map(function (role) {
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
 * Show Disbursement Voucher modal (compact, scrollable). Moves #voucher-app from #voucherFormTemplate into modal.
 * Call closeVoucherModal() to close and return the form to the template.
 */
export function showVoucherModal() {
    const template = document.getElementById('voucherFormTemplate');
    const app = document.getElementById('voucher-app');
    if (!template || !app) return;

    initModalContainer();
    const container = document.getElementById('customModalContainer');

    const modalHTML = `
        <div id="voucherModalContent" class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div class="flex items-center justify-between shrink-0 px-4 py-3 border-b border-slate-200 bg-slate-50">
                <h3 class="text-lg font-bold text-slate-900">Disbursement Voucher</h3>
                <div class="flex items-center gap-2">
                    <div class="relative group inline-block">
                        <button type="button" id="voucherModalInsert" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium hover:bg-emerald-600 hover:text-white hover:font-bold transition-colors cursor-pointer">
                            Insert
                        </button>
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 w-max max-w-[200px] px-2.5 py-1.5 mb-2 bg-slate-900/90 backdrop-blur-sm text-white text-xs text-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 whitespace-normal border border-slate-700/50 shadow-xl">
                            E-Insert nimo ang voucher data sa System
                        </div>
                    </div>
                    <div class="relative group inline-block">
                        <button type="button" id="voucherModalPrint" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#224796] text-white text-sm font-medium hover:bg-[#163473] transition-colors cursor-pointer">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            Print
                        </button>
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 w-max max-w-[200px] px-2.5 py-1.5 mb-2 bg-slate-900/90 backdrop-blur-sm text-white text-xs text-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 whitespace-normal border border-slate-700/50 shadow-xl">
                            E-Print ni niya nga voucher
                        </div>
                    </div>
                    <button type="button" id="voucherModalClose" class="p-2 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer" aria-label="Close">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>
            <div id="voucherModalBody" class="flex-1 overflow-y-auto min-h-0 p-3 md:p-4">
            </div>
        </div>
    `;

    container.innerHTML = modalHTML;
    const body = document.getElementById('voucherModalBody');
    if (body) {
        app.classList.add('in-modal');
        body.appendChild(app);
    }
    const toolbarRow = app.querySelector('.voucher-toolbar-row');
    if (toolbarRow) toolbarRow.classList.add('hidden');

    container.style.display = 'flex';

    const closeBtn = document.getElementById('voucherModalClose');
    const closeVoucher = () => {
        const voucherApp = document.getElementById('voucher-app');
        voucherApp?.classList.remove('in-modal');
        const toolbarRow = voucherApp?.querySelector('.voucher-toolbar-row');
        if (toolbarRow) toolbarRow.classList.remove('hidden');
        if (voucherApp && voucherApp.parentElement?.id === 'voucherModalBody') {
            template.appendChild(voucherApp);
        }
        container.style.display = 'none';
        container.innerHTML = '';
        const aiBtn = document.getElementById('aiChatButton');
        if (aiBtn) aiBtn.style.display = 'inline-flex';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeVoucher);
    const printBtn = document.getElementById('voucherModalPrint');
    if (printBtn) printBtn.addEventListener('click', printVoucher);

    const insertBtn = document.getElementById('voucherModalInsert');
    if (insertBtn) {
        insertBtn.addEventListener('click', async () => {
            const dvNo = document.getElementById('voucherDvNo')?.value || '';
            const dvDate = document.getElementById('voucherDate')?.value || '';
            let payee = document.getElementById('voucherPayee')?.value || '';
            const payeeEtAl = document.getElementById('voucherPayeeEtAl')?.value || '';
            if (payeeEtAl) payee = (payee + ' ' + payeeEtAl).trim();
            const particulars = document.getElementById('voucherParticulars')?.value || '';
            const checkAmountRaw = document.getElementById('voucherAmountInput')?.value || '';
            const checkAmount = parseFloat(checkAmountRaw.replace(/[^0-9.-]/g, '')) || 0;
            const checkNo = document.getElementById('voucherCheckNo')?.value || '';

            const dateObj = dvDate ? new Date(dvDate) : new Date();
            const year = dateObj.getFullYear() || new Date().getFullYear();

            if (!dvNo || !payee || checkAmount <= 0) {
                showWarning('Missing Fields', 'Please ensure DV No., Payee, and Check Amount are filled before inserting.');
                return;
            }

            const payload = {
                year: year,
                glCode: '1000',
                dvDate: dvDate || new Date().toISOString().split('T')[0],
                dvNo: dvNo,
                requestedBy: payee,
                payee: payee,
                checkAmount: checkAmount,
                particulars: particulars,
                checkNo: checkNo,
                fileDate: new Date().toISOString().split('T')[0],
                mooe: 0,
                spf: 0,
                mcpFacility: 0,
                konsultaFacility: 0,
                konsultaPf: 0,
            };

            closeVoucher();

            Swal.fire({
                title: 'Inserting Data...',
                text: 'Please wait...',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const basePath = window.location.pathname.includes('/frontend/')
                    ? window.location.pathname.split('/frontend/')[0]
                    : '';

                const response = await fetch(`${basePath}/api/itemized/create.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                await fetch(`${basePath}/api/monthly-expenses/sync-from-itemized.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ year: year })
                });

                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'Voucher data has been successfully inserted to Itemized Transactions.',
                        confirmButtonText: 'OK',
                        customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses }
                    }).then(() => {
                        if (window.location.pathname.includes('itemized')) {
                            window.location.reload();
                        }
                    });
                } else {
                    throw new Error(data.message || 'Unknown error');
                }
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.message || 'Failed to insert voucher data.',
                    confirmButtonText: 'OK',
                    customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses }
                });
            }
        });
    }

    container.addEventListener('click', (e) => { if (e.target === container) closeVoucher(); });

    const aiBtn = document.getElementById('aiChatButton');
    if (aiBtn) aiBtn.style.display = 'none';
    container.addEventListener('click', (e) => { if (e.target === container) closeVoucher(); });
}

/**
 * Close voucher modal and return #voucher-app to #voucherFormTemplate.
 */
export function closeVoucherModal() {
    const template = document.getElementById('voucherFormTemplate');
    const app = document.getElementById('voucher-app');
    const container = document.getElementById('customModalContainer');
    if (app && app.parentElement && app.parentElement.id === 'voucherModalBody' && template) {
        template.appendChild(app);
    }
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
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

// ============================================================================
// DAILY TRANSACTIONS MODAL FUNCTIONS
// ============================================================================
// These functions are specifically for Daily Transactions (Budget) page
// Shows modal with transaction details

/**
 * Show daily transaction view modal (read-only, wider, 3 columns)
 * @param {Object} transaction - Transaction data object
 */
export async function showDailyTransactionViewModal(transaction) {
    if (!transaction) return;

    const formatCurrency = (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? '₱0.00' : '₱' + num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const defaultData = {
        glCode: transaction.glCode || '1000',
        dvDate: transaction.dvDate || '',
        dvNo: transaction.dvNo || 'MOOE2025-01-0000',
        requestedBy: transaction.requestedBy || '',
        checkAmount: transaction.checkAmount || 0,
        payee: transaction.payee || '',
        particulars: transaction.particulars || '',
        checkNo: transaction.checkNo || '',
        remarks: transaction.remarks || '',
        fileDate: transaction.fileDate || '',
        mooe: transaction.mooe || 0,
        spf: transaction.spf || 0,
        mcpFacility: transaction.mcpFacility || 0,
        konsultaFacility: transaction.konsultaFacility || 0,
        konsultaPf: transaction.konsultaPf || 0
    };

    await Swal.fire({
        title: '',
        html: `
            <div class="relative text-left font-sans text-slate-600">

                <button id="modal-close-x" class="absolute -top-2 -right-2 p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-full transition-colors cursor-pointer z-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div class="mb-5 pr-8">
                    <h3 class="text-lg font-bold text-slate-800">Transaction Details</h3>
                    <p class="text-xs text-slate-400">View the financial breakdown and narrative.</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

                    <!-- Left Column: Primary Details (col-span 7) -->
                    <div class="lg:col-span-7 space-y-3">
                        
                        <!-- DV & GL Info -->
                        <div class="grid grid-cols-2 gap-2">
                            <div class="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                                <label class="text-[9px] uppercase font-black text-slate-400 block mb-0.5 tracking-widest">DV NO.</label>
                                <div class="font-mono text-xs font-bold text-slate-700">${escapeHtml(defaultData.dvNo)}</div>
                            </div>
                            <div class="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                                <label class="text-[9px] uppercase font-black text-slate-400 block mb-0.5 tracking-widest">G/L Code</label>
                                <div class="font-mono text-xs font-bold text-slate-800">${escapeHtml(defaultData.glCode)}</div>
                            </div>
                        </div>

                        <!-- Payee & Remarks Row -->
                        <div class="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between gap-3">
                            <div class="flex items-center gap-2.5 overflow-hidden">
                                <div class="p-1.5 bg-slate-100 rounded-lg text-slate-500 shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <div class="overflow-hidden">
                                    <label class="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">Payee</label>
                                    <div class="text-xs font-bold text-slate-800 truncate leading-tight">${escapeHtml(defaultData.payee)}</div>
                                </div>
                            </div>
                            <!-- Remarks Tag -->
                            <div class="shrink-0">
                                ${defaultData.remarks === 'PROCESS'
                ? '<span class="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider">PROCESS</span>'
                : defaultData.remarks === 'CANCEL'
                    ? '<span class="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-wider">CANCEL</span>'
                    : '<span class="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-400 text-[9px] font-bold uppercase">NO TAG</span>'
            }
                            </div>
                        </div>

                        <!-- Particulars Box -->
                        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-[100px] flex flex-col">
                            <label class="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1.5 block">PARTICULARS</label>
                            <div class="text-[11px] text-slate-600 leading-relaxed overflow-y-auto custom-scrollbar flex-1 max-h-[120px]">
                                ${escapeHtml(defaultData.particulars) || '<span class="italic text-slate-400">No particulars provided.</span>'}
                            </div>
                        </div>

                        <!-- Date & Requester -->
                        <div class="grid grid-cols-2 gap-2">
                            <div class="p-2 border border-slate-100 rounded-xl bg-white shadow-sm">
                                <label class="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">DV DATE</label>
                                <div class="text-[11px] font-semibold text-slate-700 mt-0.5">${escapeHtml(defaultData.dvDate) || '-'}</div>
                            </div>
                             <div class="p-2 border border-slate-100 rounded-xl bg-white shadow-sm">
                                <label class="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">REQUESTED BY</label>
                                <div class="text-[11px] font-semibold text-slate-700 mt-0.5 truncate" title="${escapeHtml(defaultData.requestedBy)}">${escapeHtml(defaultData.requestedBy) || '-'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Financial Analysis (col-span 5) -->
                    <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                        
                        <!-- Amount Header -->
                        <div class="bg-slate-900 p-3.5 text-center relative overflow-hidden shrink-0">
                            <div class="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12"></div>
                            <div class="relative z-10">
                                <div class="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Check Amount</div>
                                <div class="text-2xl font-black text-white tracking-tight">
                                    ${formatCurrency(defaultData.checkAmount)}
                                </div>
                            </div>
                        </div>

                        <div class="p-3.5 flex flex-col justify-center flex-grow">
                            <div class="flex items-center gap-2 mb-4 justify-center">
                                <div class="h-[1px] w-4 bg-slate-200"></div>
                                <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Allocations</h4>
                                <div class="h-[1px] w-4 bg-slate-200"></div>
                            </div>
                            
                            <div class="space-y-2">
                                <div class="flex justify-between items-center py-1 border-b border-slate-100 border-dashed last:border-0">
                                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MOOE</span>
                                    <span class="text-[10px] font-black text-slate-700 font-mono">${formatCurrency(defaultData.mooe)}</span>
                                </div>

                                <div class="flex justify-between items-center py-1 border-b border-slate-100 border-dashed last:border-0">
                                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SPF</span>
                                    <span class="text-[10px] font-black text-slate-700 font-mono">${formatCurrency(defaultData.spf)}</span>
                                </div>

                                <div class="flex justify-between items-center py-1 border-b border-slate-100 border-dashed last:border-0">
                                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MCP FAC.</span>
                                    <span class="text-[10px] font-black text-slate-700 font-mono">${formatCurrency(defaultData.mcpFacility)}</span>
                                </div>

                                <div class="flex justify-between items-center py-1 border-b border-slate-100 border-dashed last:border-0">
                                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">KON. FAC.</span>
                                    <span class="text-[10px] font-black text-slate-700 font-mono">${formatCurrency(defaultData.konsultaFacility)}</span>
                                </div>

                                <div class="flex justify-between items-center p-2 rounded-xl bg-emerald-50 border border-emerald-100 mt-3 group transition-all hover:bg-emerald-100/50">
                                    <span class="text-[10px] font-black text-emerald-700 uppercase tracking-widest">KONSULTA PF</span>
                                    <span class="text-[11px] font-black text-emerald-800 font-mono">${formatCurrency(defaultData.konsultaPf)}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Footer indicator -->
                        <div class="bg-slate-50 p-2 text-center border-t border-slate-100">
                             <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-slate-200 shadow-sm">
                                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verified Record</span>
                             </div>
                        </div>
                    </div>
                </div>

            </div>
        `,
        // Configuration
        width: 'auto',
        showConfirmButton: false,

        customClass: {
            /* !max-w-3xl: Increases width to 768px (Standard Tablet/Laptop size).
               If you want it even wider, try !max-w-4xl (896px).
            */
            popup: '!rounded-2xl !shadow-2xl !border !border-slate-100 !max-w-4xl !w-full !p-0',

            htmlContainer: '!m-0 !p-5 !overflow-visible',
        },
        // bind the close action manually once the modal is injected into the DOM
        didOpen: () => {
            const closeBtn = document.getElementById('modal-close-x');

            if (closeBtn) {

                closeBtn.addEventListener('click', () => {

                    Swal.close();

                });

            }

        },

        buttonsStyling: false,

    });

}

/**
 * Show daily transaction edit modal (editable, compact 3-column)
 * @param {Object} transaction - Transaction data object (null for new)
 * @param {Function} onSave - Callback when save is clicked
 */
export async function showDailyTransactionEditModal(transaction = null, onSave = null) {
    const isEdit = !!transaction?.id;
    let isAddAllocationMode = false;
    const today = new Date().toISOString().split('T')[0];

    // Default values for form fields
    const defaultData = {
        id: transaction?.id || null,
        glCode: transaction?.glCode || '1000',
        dvDate: transaction?.dvDate || today,
        dvNo: transaction?.dvNo || 'MOOE2025-01-0000',
        requestedBy: transaction?.requestedBy || '',
        checkAmount: transaction?.checkAmount || '',
        payee: transaction?.payee || '',
        particulars: transaction?.particulars || '',
        checkNo: transaction?.checkNo || '',
        remarks: transaction?.remarks || '',
        fileDate: transaction?.fileDate || today,
        mooe: transaction?.mooe || '',
        spf: transaction?.spf || '',
        mcpFacility: transaction?.mcpFacility || '',
        konsultaFacility: transaction?.konsultaFacility || '',
        konsultaPf: transaction?.konsultaPf || ''
    };

    const result = await Swal.fire({
        title: '',
        html: `
            <div class="relative text-left font-sans text-slate-600">
                <button id="edit-modal-close-x" class="absolute -top-2 -right-2 p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-full transition-colors cursor-pointer z-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div class="mb-4 pr-8">
                    <h3 class="text-lg font-bold text-slate-800">${isEdit ? 'Update Transaction' : 'ADD DATA'}</h3>
                    <p class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">City Health Office Management</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                    
                    <div class="space-y-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <div class="flex items-center gap-2 pb-1.5 border-b border-slate-200/60">
                            <div class="w-1 h-3 bg-slate-800 rounded-full"></div>
                            <h3 class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Origin</h3>
                        </div>
                        <div class="space-y-2">
                            <div class="space-y-0.5">
                                <label class="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">Account Title <span class="text-rose-500">*</span></label>
                                <div class="relative">
                                    <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                                    </span>
                                    <input type="hidden" id="modal-gl-code-hidden" value="${escapeHtml(defaultData.glCode)}">
                                    <input type="text" id="modal-gl-code" value="" placeholder="Search Account Title..." autocomplete="off"
                                        class="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none">
                                    <div id="modal-gl-code-suggestions" class="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl hidden">
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-0.5">
                                <label class="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">DV NO. <span class="text-rose-500">*</span></label>
                                <input type="text" id="modal-dv-no" value="${escapeHtml(defaultData.dvNo)}" 
                                    class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all outline-none font-mono">
                            </div>
                            <div class="space-y-0.5">
                                <label class="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">DV DATE <span class="text-rose-500">*</span></label>
                                <input type="date" id="modal-dv-date" value="${defaultData.dvDate}" 
                                    class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-200 outline-none text-slate-700">
                            </div>
                            <div class="space-y-0.5">
                                <label class="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">File Date</label>
                                <input type="date" id="modal-file-date" value="${defaultData.fileDate}" 
                                    class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-200 outline-none text-slate-700">
                            </div>
                        </div>
                    </div>

                    <div class="space-y-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div class="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                            <div class="w-1 h-3 bg-slate-800 rounded-full"></div>
                            <h3 class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Party Details</h3>
                        </div>
                        <div class="space-y-2">
                            <div class="space-y-0.5">
                                <label class="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">Payee <span class="text-rose-500">*</span></label>
                                <div class="relative">
                                    <input type="text" id="modal-payee" value="${escapeHtml(defaultData.payee)}" placeholder="Entity or Person"
                                        class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white transition-all outline-none">
                                    <div id="modal-payee-suggestions" class="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg hidden"></div>
                                </div>
                            </div>
                            <div class="space-y-0.5">
                                <label class="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">Requested by <span class="text-rose-500">*</span></label>
                                <div class="relative">
                                    <input type="text" id="modal-requested-by" value="${escapeHtml(defaultData.requestedBy)}" placeholder="Requester Name"
                                        class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white transition-all outline-none">
                                    <div id="modal-requestedBy-suggestions" class="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg hidden"></div>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div class="space-y-0.5">
                                    <label class="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">Check Amount <span class="text-rose-500">*</span></label>
                                    <div class="relative">
                                        <span class="absolute left-2.5 top-1.5 text-slate-400 text-[10px] font-bold">₱</span>
                                        <input type="number" step="0.01" id="modal-check-amount" value="${escapeHtml(defaultData.checkAmount)}" 
                                            class="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-800 outline-none">
                                    </div>
                                </div>
                                <div class="space-y-0.5">
                                    <label class="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">CHECK NO.</label>
                                    <input type="text" id="modal-check-no" value="${escapeHtml(defaultData.checkNo)}" placeholder="000000"
                                        class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono outline-none">
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div class="space-y-0.5">
                                    <label class="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">PARTICULARS</label>
                                    <textarea id="modal-particulars" rows="2" placeholder="Description..."
                                        class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs transition-all outline-none resize-none custom-scrollbar focus:bg-white">${escapeHtml(defaultData.particulars)}</textarea>
                                </div>
                                <div class="space-y-0.5">
                                    <label class="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">REMARKS</label>
                                    <select id="modal-remarks" 
                                        class="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold transition-all outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer font-sans appearance-none shadow-sm
                                        ${defaultData.remarks === 'PROCESS' ? 'bg-emerald-50 text-emerald-700' : defaultData.remarks === 'CANCEL' ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-700'}">
                                        <option value="" class="text-slate-500 font-medium">None</option>
                                        <option value="PROCESS" ${defaultData.remarks === 'PROCESS' ? 'selected' : ''} class="text-emerald-600 font-bold bg-emerald-50">PROCESS</option>
                                        <option value="CANCEL" ${defaultData.remarks === 'CANCEL' ? 'selected' : ''} class="text-rose-600 font-bold bg-rose-50">CANCEL</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="modal-allocation-section" class="space-y-3 bg-emerald-50/20 p-3 rounded-xl border border-emerald-100/50 h-full transition-all">
                        <div class="flex items-center gap-2 pb-1.5 border-b border-emerald-200/30">
                            <div class="w-1.5 h-3 bg-emerald-500 rounded-full"></div>
                            <h3 class="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Allocation</h3>
                            ${isEdit ? `
                            <button type="button" id="modal-add-allocation-btn" title="ADD DATA" class="ml-auto p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-100/80 hover:text-emerald-700 transition-colors cursor-pointer" aria-label="ADD DATA">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                            ` : ''}
                        </div>
                        <div class="space-y-2">
                            <div class="space-y-0.5">
                                <label class="text-[8px] font-bold text-emerald-600/70 uppercase tracking-wider ml-1">MOOE</label>
                                <input type="number" step="0.01" id="modal-mooe" value="${escapeHtml(defaultData.mooe)}" placeholder="0.00" 
                                    class="w-full px-3 py-1 bg-white border border-emerald-100 rounded-lg text-xs font-mono outline-none">
                            </div>
                            <div class="space-y-0.5">
                                <label class="text-[8px] font-bold text-emerald-600/70 uppercase tracking-wider ml-1">SPF</label>
                                <input type="number" step="0.01" id="modal-spf" value="${escapeHtml(defaultData.spf)}" placeholder="0.00" 
                                    class="w-full px-3 py-1 bg-white border border-emerald-100 rounded-lg text-xs font-mono outline-none">
                            </div>
                            <div class="space-y-0.5">
                                <label class="text-[8px] font-bold text-emerald-600/70 uppercase tracking-wider ml-1">MCP FACILITY</label>
                                <input type="number" step="0.01" id="modal-mcp-facility" value="${escapeHtml(defaultData.mcpFacility)}" placeholder="0.00" 
                                    class="w-full px-3 py-1 bg-white border border-emerald-100 rounded-lg text-xs font-mono outline-none">
                            </div>
                            <div class="space-y-0.5">
                                <label class="text-[8px] font-bold text-emerald-600/70 uppercase tracking-wider ml-1">KONSULTA FACILITY</label>
                                <input type="number" step="0.01" id="modal-konsulta-facility" value="${escapeHtml(defaultData.konsultaFacility)}" placeholder="0.00" 
                                    class="w-full px-3 py-1 bg-white border border-emerald-100 rounded-lg text-xs font-mono outline-none">
                            </div>
                            <div class="space-y-0.5 pt-1">
                                <label class="text-[8px] font-black text-emerald-600 uppercase tracking-wider ml-1">KONSULTA PF</label>
                                <div class="p-1 bg-emerald-100/50 rounded-lg border border-emerald-200">
                                    <input type="number" step="0.01" id="modal-konsulta-pf" value="${escapeHtml(defaultData.konsultaPf)}" placeholder="0.00" 
                                        class="w-full bg-transparent text-xs font-black text-emerald-700 outline-none text-center">
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="mt-4 bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-xl shadow-lg border border-slate-700">
                    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div class="text-center sm:text-left">
                            <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Check Amount</p>
                            <p class="text-lg font-black text-white" id="summary-check-amount">₱0.00</p>
                        </div>
                        <div class="text-center sm:text-left">
                             <p class="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mb-0.5">Total Allocated</p>
                             <p class="text-lg font-bold text-emerald-400" id="modal-total-distributed">₱0.00</p>
                        </div>
                        <div class="text-center sm:text-right">
                             <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5" id="modal-balance-label">Remaining Balance</p>
                             <div class="flex items-center gap-2">
                                <p class="text-lg font-bold text-white transition-all duration-300" id="modal-unallocated-amount">₱0.00</p>
                                <span id="modal-status-badge" class="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-all duration-300 bg-slate-700 text-slate-400">Ready</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        width: 'auto',
        showCancelButton: true,
        confirmButtonText: isEdit ? 'Update Changes' : 'ADD DATA',
        cancelButtonText: 'Discard',
        customClass: {
            popup: '!rounded-2xl !shadow-2xl !border !border-slate-100 !max-w-4xl !w-full !p-0',
            htmlContainer: '!m-0 !p-5 !overflow-visible',
            actions: '!mt-0 !w-full !px-5 !pb-5 !justify-end !gap-2',
            confirmButton: '!bg-emerald-50 hover:!bg-emerald-100 !text-emerald-600 hover:!text-emerald-700 !font-bold !py-2.5 !px-6 !rounded-lg !shadow-none !uppercase !text-[10px] !tracking-widest !transition-all !cursor-pointer',
            cancelButton: '!bg-rose-50 hover:!bg-rose-100 !text-rose-500 hover:!text-rose-700 !font-bold !py-2.5 !px-6 !rounded-lg !shadow-none !uppercase !text-[10px] !tracking-widest !transition-all !cursor-pointer',
        },
        buttonsStyling: false,
        didOpen: () => {
            const closeBtn = document.getElementById('edit-modal-close-x');
            if (closeBtn) closeBtn.addEventListener('click', () => Swal.close());

            const checkNoInput = document.getElementById('modal-check-no');
            if (checkNoInput) {
                const errP = document.createElement('p');
                errP.id = 'check-no-error';
                errP.className = 'text-[10px] text-rose-500 hidden mt-1 ml-1';
                checkNoInput.parentElement.appendChild(errP);

                const checkDuplicate = async () => {
                    const val = checkNoInput.value.trim();
                    if (!val || val === defaultData.checkNo) {
                        errP.classList.add('hidden');
                        checkNoInput.classList.remove('border-rose-500', 'bg-rose-50');
                        return;
                    }
                    try {
                        const path = window.location.pathname || '/';
                        const apiBase = path.substring(0, path.indexOf('/frontend/') !== -1 ? path.indexOf('/frontend/') : path.lastIndexOf('/')) || '';

                        const res = await fetch(`${apiBase}/api/itemized/check-duplicate-checkno.php?checkNo=${encodeURIComponent(val)}`);
                        const data = await res.json();
                        if (data.exists) {
                            errP.textContent = 'There is an already duplicated data with this Check No.';
                            errP.classList.remove('hidden');
                            checkNoInput.classList.add('border-rose-500', 'bg-rose-50');
                        } else {
                            errP.classList.add('hidden');
                            checkNoInput.classList.remove('border-rose-500', 'bg-rose-50');
                        }
                    } catch (e) {
                        console.error('Error checking duplicate check no', e);
                    }
                };

                checkNoInput.addEventListener('blur', checkDuplicate);
                checkNoInput.addEventListener('input', () => {
                    errP.classList.add('hidden');
                    checkNoInput.classList.remove('border-rose-500', 'bg-rose-50');
                });
            }

            const addAllocBtn = document.getElementById('modal-add-allocation-btn');
            const allocSection = document.getElementById('modal-allocation-section');
            const allocIds = ['modal-mooe', 'modal-spf', 'modal-mcp-facility', 'modal-konsulta-facility', 'modal-konsulta-pf'];
            if (addAllocBtn && allocSection && isEdit) {
                addAllocBtn.addEventListener('click', () => {
                    isAddAllocationMode = true;
                    allocSection.classList.add('ring-2', 'ring-emerald-400', 'ring-offset-1', 'bg-emerald-100/30');
                    allocIds.forEach((id) => {
                        const el = document.getElementById(id);
                        if (el) {
                            el.value = '0.00';
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    });
                });
            }

            const path = window.location.pathname || '/';
            const apiBase = path.substring(0, path.indexOf('/frontend/') !== -1 ? path.indexOf('/frontend/') : path.lastIndexOf('/')) || '';
            const glInput = document.getElementById('modal-gl-code');
            const glSuggestions = document.getElementById('modal-gl-code-suggestions');
            const payeeInput = document.getElementById('modal-payee');
            const payeeSuggestions = document.getElementById('modal-payee-suggestions');
            const requestedByInput = document.getElementById('modal-requested-by');
            const requestedBySuggestions = document.getElementById('modal-requestedBy-suggestions');

            let cachedPartySuggestions = null;

            const esc = (s) => String(s)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            const suggestionsYear = transaction?._year || new Date().getFullYear();

            const ensurePartySuggestionsLoaded = async () => {
                if (cachedPartySuggestions) return cachedPartySuggestions;
                try {
                    const res = await fetch(`${apiBase}/api/itemized/suggestions.php?year=${suggestionsYear}`, { credentials: 'same-origin' });
                    const data = await res.json();
                    if (!data.success) {
                        cachedPartySuggestions = { requestedBy: [], payee: [], glByRequestedBy: {} };
                        return cachedPartySuggestions;
                    }
                    cachedPartySuggestions = {
                        requestedBy: Array.isArray(data.requestedBy) ? data.requestedBy : [],
                        payee: Array.isArray(data.payee) ? data.payee : [],
                        glByRequestedBy: (data.glByRequestedBy && typeof data.glByRequestedBy === 'object') ? data.glByRequestedBy : {},
                    };
                } catch {
                    cachedPartySuggestions = { requestedBy: [], payee: [], glByRequestedBy: {} };
                }
                return cachedPartySuggestions;
            };

            const staticCodeNameList = [
                { id: 1, code: "1000", name: "Travelling Expense" },
                { id: 2, code: "1001", name: "a. BEDs Technical Review" },
                { id: 3, code: "1002", name: "b. Budget Call" },
                { id: 4, code: "1003", name: "c. Management Conference" },
                { id: 5, code: "1004", name: "d. Budget Hearing/budget cycle" },
                { id: 6, code: "1005", name: "e. MOH SENDING AGENCY PER PROGRAM" },
                { id: 7, code: "100500", name: "Oral Health Program" },
                { id: 8, code: "100600", name: "Non-Communicable Disease Cluster" },
                { id: 9, code: "100601", name: "Lifestyle Related Diseases Control and Prevention Program" },
                { id: 10, code: "100602", name: "Chronic Obstructive Pulmonary Disease" },
                { id: 11, code: "100603", name: "Cancer Prevention Program" },
                { id: 12, code: "100604", name: "Visual Health (Prevention of Blindness) Program" },
                { id: 13, code: "100605", name: "Dangerous Drug Abuse Prevention Treatment Program (DDAPTP)" },
                { id: 14, code: "100606", name: "NATIONAL TUBERCULOSIS PROGRAM (TB)" },
                { id: 15, code: "100700", name: "Infectious Disease Prevention & Control Program" },
                { id: 16, code: "100701", name: "AIDS /STI Prevention and Control Program" },
                { id: 17, code: "100702", name: "Dengue Prevention and Control Program" },
                { id: 18, code: "100703", name: "Malaria Elimination Program" },
                { id: 19, code: "100704", name: "Water and Sanitation Hygiene (WASH)" },
                { id: 20, code: "100705", name: "Soil Transmitted Helminthiasis Control Program" },
                { id: 21, code: "100706", name: "Emerging and Re-Emerging Disease Program" },
                { id: 22, code: "100707", name: "Leprosy and Skin Disease Control Program" },
                { id: 23, code: "100708", name: "Rabies Prevention and Control Program" },
                { id: 24, code: "100709", name: "Epidemiology and Surveillance" },
                { id: 25, code: "100800", name: "Family Health Cluster Program" },
                { id: 26, code: "100801", name: "Safe Motherhood Program" },
                { id: 27, code: "100802", name: "FAMILY PLANNING PROGRAM" },
                { id: 28, code: "100803", name: "Essential Newborn Care Program" },
                { id: 29, code: "100804", name: "MATERNAL PROGRAM" },
                { id: 30, code: "100900", name: "Bangsamoro Immunization Program (BIP)" },
                { id: 31, code: "1001000", name: "Mental Health and Psychosocial Support Program" },
                { id: 32, code: "1002000", name: "Nutrition and Development Program (ECCD, MNS, PIMAM, & OPT)" },
                { id: 33, code: "1003000", name: "Population and Development Program" },
                { id: 34, code: "1003001", name: "Adolescent Health and Development Program" },
                { id: 35, code: "1003002", name: "Women and Child Protection Program" },
                { id: 36, code: "1003003", name: "Senior Citizen Program" },
                { id: 37, code: "1003004", name: "Health and Wellness Program for Persons with Disabilities" },
                { id: 38, code: "1004000", name: "Bangsamoro Voluntary Blood Services Program (BVBSP)" },
                { id: 39, code: "1005000", name: "Health Promotion Program" },
                { id: 40, code: "1006000", name: "LGU Health Scorecard" },
                { id: 41, code: "1007000", name: "PUBLIC HEALTH PHARMACISTS" },
                { id: 42, code: "1008000", name: "UHC technical orientation on the Special Health Fund for BARMM and Collaborative Learning" },
                { id: 43, code: "1009000", name: "NATIONAL HEALTH FACILITY REGISTRY (NHFR)" },
                { id: 44, code: "200200", name: "GAD PLANNING & BUDGETING WORKSHOP" },
                { id: 45, code: "200201", name: "G. Entrance Conference" },
                { id: 46, code: "200202", name: "H. Exit Conference" },
                { id: 47, code: "200203", name: "I. SUBMIT REPORT COTABATO/OTHERS COTABATO MATTER" },
                { id: 48, code: "200204", name: "F. OTHERS AGENCY REQUEST FOR PARTICIPANTS" },
                { id: 49, code: "3000", name: "Training and Scholarship Expense" },
                { id: 50, code: "4000", name: "Supplies and Materials Expenses" },
                { id: 51, code: "3001-0", name: "Office Supplies Expenses" },
                { id: 52, code: "3001-1", name: "CROWN PAPER & STATIONERIES SUPPLY" },
                { id: 53, code: "3001-2", name: "ICT Office Supplies Expenses" },
                { id: 54, code: "3001-3", name: "ILIGAN DATAVISION SALES CENTER" },
                { id: 55, code: "3001-4", name: "Drugs and Medicines Expenses" },
                { id: 56, code: "3001-5", name: "ROHAISA PHARMACY" },
                { id: 57, code: "3001-6", name: "JB PHARMA AND DISTRIBUTOR" },
                { id: 58, code: "3001-7", name: "Medical, Dental and Laboratory Supplies Expenses" },
                { id: 59, code: "3001-8", name: "MEDBAY ENTERPRISES" },
                { id: 60, code: "3001-9", name: "Fuel, Oil and Lubricants Expenses" },
                { id: 61, code: "3001-10", name: "SJS GASOLINE STATION" },
                { id: 62, code: "3001-11", name: "FOODS AND SNACK MEALS" },
                { id: 63, code: "3001-12", name: "ALEXANDRIA CAFÉ AND HOTEL" },
                { id: 64, code: "3001-13", name: "Other Supplies and Materials Expenses-CASH ADVANCES PROGRAM" }
            ].sort((a, b) => {
                let numA = parseFloat(a.code.replace('-', '.'));
                let numB = parseFloat(b.code.replace('-', '.'));
                return numA - numB;
            });

            // Set initial Account Title from G/L Code
            const currentGlCode = defaultData.glCode;
            const initialMatch = staticCodeNameList.find(i => i.code === currentGlCode);
            if (initialMatch && glInput) {
                glInput.value = initialMatch.name;
            } else if (glInput) {
                glInput.value = currentGlCode; // Fallback to code if title not found
            }


            const bindSuggestionDropdown = (inputEl, dropdownEl, sourceKey, onSelect) => {
                if (!inputEl || !dropdownEl) return;

                const hide = () => {
                    dropdownEl.classList.add('hidden');
                };

                const showFiltered = async () => {
                    const all = await ensurePartySuggestionsLoaded();
                    const list = all[sourceKey] || [];
                    const q = (inputEl.value || '').toLowerCase().trim();

                    const filteredDB = q
                        ? list.filter((name) => String(name).toLowerCase().includes(q))
                        : list;

                    const filteredStatic = staticCodeNameList.filter(item =>
                        !q || item.code.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
                    );

                    if (!filteredDB.length && !filteredStatic.length) {
                        dropdownEl.innerHTML = `<div class="px-3 py-2 text-xs text-slate-400 border border-slate-100 bg-slate-50 rounded-lg">No previous entries yet</div>`;
                        dropdownEl.classList.remove('hidden');
                        return;
                    }

                    let html = '';

                    if (filteredStatic.length > 0) {
                        html += `<div class="px-3 py-1.5 bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest sticky top-0">Predefined Entries</div>`;

                        let currentParent = null;
                        let lastParentOutputId = null;
                        const outputGroups = [];

                        // 1. Determine natural parents and their children
                        staticCodeNameList.forEach(item => {
                            const isLettered = /^[a-z]\.\s/i.test(item.name);
                            const isNumericSub = !item.code.endsWith('00');
                            const isSub = isLettered || isNumericSub;

                            if (!isSub) {
                                currentParent = { ...item, children: [] };
                                outputGroups.push(currentParent);
                            } else if (currentParent) {
                                currentParent.children.push(item);
                            } else {
                                // Fallback for orphaned sub-items
                                currentParent = { ...item, children: [] };
                                outputGroups.push(currentParent);
                            }
                        });

                        // 2. Filter groups based on search (show parent if parent matches OR any child matches)
                        outputGroups.forEach(group => {
                            const parentMatches = !q || group.code.toLowerCase().includes(q) || group.name.toLowerCase().includes(q);
                            const matchingChildren = group.children.filter(child =>
                                !q || child.code.toLowerCase().includes(q) || child.name.toLowerCase().includes(q)
                            );

                            if (parentMatches || matchingChildren.length > 0) {
                                // Output Parent Header
                                html += `<div class="px-3 py-2 bg-slate-50/80 border-b border-slate-100 flex flex-col gap-0.5 group suggestion-static cursor-pointer hover:bg-slate-100" data-code="${esc(group.code)}" data-name="${esc(group.name)}">
                                    <div class="text-[9px] font-black text-[#224796] uppercase tracking-tighter opacity-70">Category: ${esc(group.code)}</div>
                                    <div class="text-xs font-bold text-slate-800 group-hover:text-[#224796] transition-colors">${esc(group.name)}</div>
                                </div>`;

                                // Output Matching Children
                                matchingChildren.forEach(child => {
                                    html += `<div class="pl-8 pr-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 cursor-pointer flex flex-col gap-0.5 group suggestion-static" data-code="${esc(child.code)}" data-name="${esc(child.name)}">
                                        <div class="flex items-center gap-1.5">
                                            <div class="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-[#224796]"></div>
                                            <div class="text-[10px] font-bold text-slate-500 group-hover:text-[#224796]">${esc(child.code)}</div>
                                        </div>
                                        <div class="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">${esc(child.name)}</div>
                                    </div>`;
                                });
                            }
                        });
                    }

                    if (filteredDB.length > 0) {
                        html += `<div class="px-3 py-1.5 bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest sticky top-0">Previous Entries</div>`;
                        html += filteredDB.map(name =>
                            `<div class="px-3 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#224796] border-b border-slate-100 last:border-b-0 cursor-pointer suggestion-db" data-name="${esc(name)}">${esc(name)}</div>`
                        ).join('');
                    }

                    dropdownEl.innerHTML = html;
                    dropdownEl.classList.remove('hidden');

                    dropdownEl.querySelectorAll('.suggestion-static').forEach((child) => {
                        child.addEventListener('click', () => {
                            const code = child.getAttribute('data-code');
                            const name = child.getAttribute('data-name');
                            // Automaticaly remove leading letters/labels like "a. ", "b. "
                            const cleanName = name.replace(/^[a-zA-Z]\.\s+/, '');
                            inputEl.value = cleanName;
                            if (glInput) glInput.value = code;
                            hide();
                            if (typeof onSelect === 'function') onSelect(cleanName, code);
                            inputEl.focus();
                        });
                    });

                    dropdownEl.querySelectorAll('.suggestion-db').forEach((child) => {
                        child.addEventListener('click', () => {
                            const name = child.getAttribute('data-name');
                            inputEl.value = name;
                            hide();
                            if (typeof onSelect === 'function') onSelect(name, null);
                            inputEl.focus();
                        });
                    });
                };

                inputEl.addEventListener('focus', showFiltered);
                inputEl.addEventListener('input', showFiltered);
                inputEl.addEventListener('blur', () => {
                    setTimeout(hide, 200);
                });
            };

            bindSuggestionDropdown(payeeInput, payeeSuggestions, 'payee');
            bindSuggestionDropdown(requestedByInput, requestedBySuggestions, 'requestedBy', (val) => {
                const all = cachedPartySuggestions;
                if (glInput && all?.glByRequestedBy?.[val]) glInput.value = all.glByRequestedBy[val];
            });

            ensurePartySuggestionsLoaded().then((all) => {
                const rb = requestedByInput?.value?.trim();
                if (rb && all?.glByRequestedBy?.[rb] && glInput) glInput.value = all.glByRequestedBy[rb];
            });
            const showGlSuggestions = (q) => {
                if (!glSuggestions) return;
                fetch(`${apiBase}/api/account-titles/search.php?q=${encodeURIComponent(q || '')}`)
                    .then(r => r.json())
                    .then(res => {
                        if (!res.success || !res.data) return;
                        const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        glSuggestions.innerHTML = res.data.map(item => {
                            const gl = esc(item.gl_code || '');
                            const title = esc(item.account_title || '');
                            return `<div class="px-3 py-2 hover:bg-slate-100 cursor-pointer text-xs text-slate-700 border-b border-slate-100 last:border-b-0 flex flex-col gap-0.5" data-gl="${gl}">
                                <div class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Code: ${gl}</div>
                                <div class="font-bold text-slate-800 title-text">${title}</div>
                            </div>`;
                        }).join('');
                        glSuggestions.classList.remove('hidden');
                        glSuggestions.querySelectorAll('[data-gl]').forEach(el => {
                            el.addEventListener('click', () => {
                                const glValue = el.dataset.gl || '';
                                const titleValue = el.querySelector('.title-text')?.textContent || glValue;
                                
                                const hiddenGl = document.getElementById('modal-gl-code-hidden');
                                if (hiddenGl) hiddenGl.value = glValue;
                                if (glInput) glInput.value = titleValue;
                                
                                glSuggestions.classList.add('hidden');
                            });
                        });
                    })
                    .catch(() => { glSuggestions.classList.add('hidden'); });
            };
            let glDebounce;
            if (glInput) {
                glInput.addEventListener('input', () => {
                    clearTimeout(glDebounce);
                    glDebounce = setTimeout(() => showGlSuggestions(glInput.value.trim()), 150);
                });
                glInput.addEventListener('focus', () => showGlSuggestions(glInput.value.trim()));
            }
            document.addEventListener('click', (e) => {
                if (glSuggestions && !glSuggestions.contains(e.target) && e.target !== glInput) glSuggestions.classList.add('hidden');
            });

            const checkAmountInput = document.getElementById('modal-check-amount');
            const mooeInput = document.getElementById('modal-mooe');
            const spfInput = document.getElementById('modal-spf');
            const mcpInput = document.getElementById('modal-mcp-facility');
            const konsultaFacInput = document.getElementById('modal-konsulta-facility');
            const konsultaPfInput = document.getElementById('modal-konsulta-pf');

            const summaryCheckAmountEl = document.getElementById('summary-check-amount');
            const totalDistEl = document.getElementById('modal-total-distributed');
            const unallocatedEl = document.getElementById('modal-unallocated-amount');
            const balanceLabelEl = document.getElementById('modal-balance-label');
            const statusBadgeEl = document.getElementById('modal-status-badge');

            const updateSummary = () => {
                const checkAmount = parseFloat(checkAmountInput?.value) || 0;
                const mooe = parseFloat(mooeInput?.value) || 0;
                const spf = parseFloat(spfInput?.value) || 0;
                const mcp = parseFloat(mcpInput?.value) || 0;
                const kFac = parseFloat(konsultaFacInput?.value) || 0;
                const kPf = parseFloat(konsultaPfInput?.value) || 0;

                const totalDist = mooe + spf + mcp + kFac + kPf;
                const balance = checkAmount - totalDist;

                summaryCheckAmountEl.textContent = '₱' + checkAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 });
                totalDistEl.textContent = '₱' + totalDist.toLocaleString('en-PH', { minimumFractionDigits: 2 });
                unallocatedEl.textContent = '₱' + Math.abs(balance).toLocaleString('en-PH', { minimumFractionDigits: 2 });

                // ANIMATION EFFECT LOGIC
                if (checkAmount > 0 && Math.abs(balance) < 0.01) {
                    // Balanced Status
                    balanceLabelEl.textContent = 'Status';
                    unallocatedEl.className = 'text-lg font-black text-emerald-400 scale-110 transition-transform duration-300';
                    statusBadgeEl.textContent = 'Balanced';
                    statusBadgeEl.className = 'px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-bounce';
                } else if (balance > 0) {
                    // Under-allocated
                    balanceLabelEl.textContent = 'Remaining Balance';
                    unallocatedEl.className = 'text-lg font-bold text-white';
                    statusBadgeEl.textContent = 'Incomplete';
                    statusBadgeEl.className = 'px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/20';
                } else if (balance < 0) {
                    // Over-allocated
                    balanceLabelEl.textContent = 'Excess Distribution';
                    unallocatedEl.className = 'text-lg font-bold text-rose-400';
                    statusBadgeEl.textContent = 'Over Limit';
                    statusBadgeEl.className = 'px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/20';
                } else {
                    // Empty/Default
                    balanceLabelEl.textContent = 'Remaining Balance';
                    unallocatedEl.className = 'text-lg font-bold text-slate-500';
                    statusBadgeEl.textContent = 'Ready';
                    statusBadgeEl.className = 'px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-slate-700 text-slate-400';
                }
            };

            // Bind listeners to all inputs
            [checkAmountInput, mooeInput, spfInput, mcpInput, konsultaFacInput, konsultaPfInput].forEach(input => {
                input?.addEventListener('input', updateSummary);
            });

            const remarksSelect = document.getElementById('modal-remarks');
            if (remarksSelect) {
                const updateRemarksStyle = () => {
                    const val = remarksSelect.value;
                    remarksSelect.classList.remove('bg-emerald-50', 'text-emerald-700', 'bg-rose-50', 'text-rose-700', 'bg-slate-50', 'text-slate-700');
                    if (val === 'PROCESS') {
                        remarksSelect.classList.add('bg-emerald-50', 'text-emerald-700');
                    } else if (val === 'CANCEL') {
                        remarksSelect.classList.add('bg-rose-50', 'text-rose-700');
                    } else {
                        remarksSelect.classList.add('bg-slate-50', 'text-slate-700');
                    }
                };
                remarksSelect.addEventListener('change', updateRemarksStyle);
            }

            updateSummary();
        },
        preConfirm: () => {
            const data = {
                id: defaultData.id,
                glCode: document.getElementById('modal-gl-code-hidden')?.value.trim(),
                dvDate: document.getElementById('modal-dv-date')?.value,
                dvNo: document.getElementById('modal-dv-no')?.value.trim(),
                requestedBy: document.getElementById('modal-requested-by')?.value.trim(),
                checkAmount: document.getElementById('modal-check-amount')?.value.trim(),
                payee: document.getElementById('modal-payee')?.value.trim(),
                particulars: document.getElementById('modal-particulars')?.value.trim(),
                checkNo: document.getElementById('modal-check-no')?.value.trim(),
                remarks: document.getElementById('modal-remarks')?.value.trim(),
                fileDate: document.getElementById('modal-file-date')?.value,
                mooe: document.getElementById('modal-mooe')?.value.trim(),
                spf: document.getElementById('modal-spf')?.value.trim(),
                mcpFacility: document.getElementById('modal-mcp-facility')?.value.trim(),
                konsultaFacility: document.getElementById('modal-konsulta-facility')?.value.trim(),
                konsultaPf: document.getElementById('modal-konsulta-pf')?.value.trim(),
                addAllocationMode: isAddAllocationMode
            };

            if (!data.glCode) return Swal.showValidationMessage('G/L Code is required');
            if (!data.dvDate) return Swal.showValidationMessage('Voucher Date is required');
            if (!data.dvNo) return Swal.showValidationMessage('Voucher Number is required');
            if (!data.payee) return Swal.showValidationMessage('Payee Name is required');
            if (!data.requestedBy) return Swal.showValidationMessage('Requested By is required');
            if (!data.checkAmount && !data.addAllocationMode) return Swal.showValidationMessage('Total Amount is required');

            return data;
        }
    });

    if (result.isConfirmed && result.value && onSave) {
        onSave(result.value);
    }
}

/**
 * Show high-end Export Configuration Modal
 * @param {Object} options - Configuration options
 * @param {Object} options.currentFilters - Current filter state
 * @param {Array} options.columns - Available columns to toggle
 * @param {Array} options.sources - Available data sources
 * @param {Function} options.onApply - Callback when "Generate" is clicked
 * @param {Function} options.onSourceChange - Callback when Source is changed
 */
/**
 * Show high-end Export Configuration Modal
 */
export function showExportConfigModal({ currentFilters, columns, sources, onApply, onSourceChange }) {
    const filters = { ...currentFilters };
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let y = currentYear + 1; y >= 2018; y--) years.push(y);

    Swal.fire({
        title: 'Export Configuration',
        html: `
            <div class="text-left space-y-6">
                <!-- Data Source & Year Section -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Data Source</label>
                        <select id="config-source" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#224796] cursor-pointer font-semibold text-[#224796]">
                            ${sources.map(s => `<option value="${s.value}" ${filters.source === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Fiscal Year</label>
                        <select id="config-year" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#224796] cursor-pointer font-semibold text-emerald-600">
                            ${years.map(y => `<option value="${y}" ${Number(filters.year) === y ? 'selected' : ''}>${y}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <!-- Search & Sort Section -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="md:col-span-2">
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Search Data</label>
                        <div class="relative">
                            <input type="text" id="config-search" class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#224796] transition-all" placeholder="Keywords..." value="${filters.search || ''}">
                            <svg class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Sort Order</label>
                        <select id="config-sortBy" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#224796] cursor-pointer">
                            <option value="none" ${filters.sortBy === 'none' ? 'selected' : ''}>Default</option>
                            <option value="name" ${filters.sortBy === 'name' ? 'selected' : ''}>A-Z</option>
                            <option value="id" ${filters.sortBy === 'id' ? 'selected' : ''}>ID</option>
                        </select>
                    </div>
                </div>

                <!-- Column visibility -->
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Columns to Include</label>
                        <button type="button" id="reset-cols" class="text-[10px] font-bold text-[#224796] hover:underline uppercase cursor-pointer">Select All</button>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 nano-grid max-h-48 overflow-y-auto pr-2">
                        ${columns.map(col => `
                            <label class="flex items-center p-2 rounded-lg border border-slate-100 bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors">
                                <div class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="${col.id}" class="sr-only peer col-toggle" ${filters.columns.includes(col.id) ? 'checked' : ''}>
                                    <div class="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#224796]"></div>
                                </div>
                                <span class="ml-2 text-[10px] font-bold text-slate-600 truncate" title="${col.label}">${col.label}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
        `,
        confirmButtonText: 'Apply & Generate',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#224796',
        width: '42rem',
        customClass: {
            popup: 'rounded-2xl shadow-2xl border border-slate-200',
            title: 'text-xl font-bold text-slate-900 border-b border-slate-100 pb-4',
            htmlContainer: 'px-6 py-4',
            confirmButton: 'rounded-lg px-8 py-2.5 text-sm font-bold order-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md cursor-pointer',
            cancelButton: 'rounded-lg px-6 py-2.5 text-sm font-medium order-1 bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-md cursor-pointer',
            actions: 'flex items-center gap-3 pt-2'
        },
        buttonsStyling: false,
        didOpen: () => {
            const popup = Swal.getPopup();
            const sourceSelect = popup.querySelector('#config-source');
            if (sourceSelect && onSourceChange) {
                sourceSelect.addEventListener('change', (e) => onSourceChange(e.target.value));
            }
            popup.querySelector('#reset-cols').onclick = () => {
                popup.querySelectorAll('.col-toggle').forEach(box => box.checked = true);
            };
        },
        preConfirm: () => {
            const popup = Swal.getPopup();
            const selectedCols = Array.from(popup.querySelectorAll('.col-toggle:checked')).map(b => b.value);
            if (selectedCols.length === 0) {
                Swal.showValidationMessage('Select at least one column');
                return false;
            }
            return {
                ...filters,
                source: popup.querySelector('#config-source').value,
                year: popup.querySelector('#config-year').value,
                search: popup.querySelector('#config-search').value.trim(),
                sortBy: popup.querySelector('#config-sortBy').value,
                columns: selectedCols
            };
        }
    }).then(result => {
        if (result.isConfirmed) onApply(result.value);
    });
}

import Swal from 'sweetalert2';
import { showAdminCreateUserModal } from './modules/modal.js';
import { createUser, validateUserData } from './modules/user-management.js';
import {
    sweetalertActionsLeftAlignedClasses,
    sweetalertHtmlLeftAlignedClasses,
    sweetalertNeutralConfirmBlueClasses,
    sweetalertPopupBaseClasses,
    sweetalertPrimaryConfirmClasses,
    sweetalertSecondaryCancelClasses,
} from './modules/modal.js';

// State
let currentPage = 1;
const rowsPerPage = 10;
let users = [];

/**
 * Render users table
 */
function renderTable() {
    const tbody = document.getElementById('adminUsersTableBody');
    const summaryEl = document.getElementById('adminUsersPaginationSummary');

    if (!tbody || !summaryEl) return;

    const total = users.length;
    const totalPages = total > 0 ? Math.ceil(total / rowsPerPage) : 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, total);
    const visibleUsers = users.slice(startIndex, endIndex);

    tbody.innerHTML = visibleUsers
        .map((user, index) => {
            const isStriped = index % 2 === 1;
            const createdDate = user.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                  })
                : '-';

            return `
                <tr class="${isStriped ? 'bg-slate-50' : 'bg-white'} hover:bg-slate-100 transition-colors">
                    <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm font-medium text-slate-900">
                        ${user.username}
                    </td>
                    <td class="px-4 py-2 text-xs md:text-sm text-slate-700">
                        ${user.full_name}
                    </td>
                    <td class="px-4 py-2 text-xs md:text-sm text-slate-700">
                        ${user.email}
                    </td>
                    <td class="px-4 py-2 text-xs md:text-sm">
                        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.role === 'Administrator'
                                ? 'bg-purple-100 text-purple-800'
                                : user.role === 'CEO'
                                ? 'bg-blue-100 text-blue-800'
                                : user.role === 'Manager'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-800'
                        }">
                            ${user.role}
                        </span>
                    </td>
                    <td class="px-4 py-2 text-xs md:text-sm text-slate-600">
                        ${createdDate}
                    </td>
                    <td class="px-4 py-2 text-center">
                        <button
                            type="button"
                            class="edit-user-btn inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                            title="Edit user"
                            data-username="${user.username}"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                    </td>
                </tr>
            `;
        })
        .join('');

    if (total === 0) {
        summaryEl.textContent = 'Showing 0 to 0 of 0 entries';
    } else {
        summaryEl.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${total} entries`;
    }

    renderPagination(total, totalPages);
}

/**
 * Render pagination
 */
function renderPagination(total, totalPages) {
    const prevBtn = document.getElementById('adminUsersPrevPage');
    const nextBtn = document.getElementById('adminUsersNextPage');
    const numbersContainer = document.getElementById('adminUsersPageNumbers');

    if (!prevBtn || !nextBtn || !numbersContainer) return;

    prevBtn.disabled = currentPage <= 1 || total === 0;
    nextBtn.disabled = currentPage >= totalPages || total === 0;

    numbersContainer.innerHTML = '';

    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let page = startPage; page <= endPage; page += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = String(page);
        button.className = [
            'inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium md:px-2.5 md:py-1 md:text-xs',
            'cursor-pointer transition-colors',
            page === currentPage
                ? 'bg-[#224796] text-white border border-[#224796]'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100',
        ].join(' ');

        button.addEventListener('click', () => {
            if (page === currentPage) return;
            currentPage = page;
            renderTable();
        });

        numbersContainer.appendChild(button);
    }
}

/**
 * Get API base path
 */
function getApiBasePath() {
    // Get base path from current location
    const path = window.location.pathname;
    // Remove /frontend/pages/... or similar paths
    const basePath = path.substring(0, path.indexOf('/frontend/') !== -1 ? path.indexOf('/frontend/') : path.lastIndexOf('/'));
    return basePath || '';
}

/**
 * Load users from API
 */
async function loadUsers() {
    try {
        const apiBase = getApiBasePath();
        const response = await fetch(`${apiBase}/api/users/list.php`);
        if (!response.ok) {
            throw new Error('Failed to load users');
        }
        const data = await response.json();
        users = data.users || [];
        renderTable();
    } catch (error) {
        console.error('Error loading users:', error);
        users = [];
        renderTable();
    }
}

/**
 * Handle add user button click
 */
function handleAddUserClick() {
    showAdminCreateUserModal(async (userData) => {
        try {
            // Validate data
            const validation = validateUserData(userData);
            if (!validation.valid) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: validation.errors.join(', '),
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: sweetalertNeutralConfirmBlueClasses,
                    },
                });
                return;
            }

            // Show loading
            Swal.fire({
                title: 'Creating user...',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            // Create user
            const result = await createUser(userData);

            // Close loading and show success
            Swal.fire({
                icon: 'success',
                title: 'User created',
                text: `User "${userData.username}" has been created successfully.`,
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: sweetalertNeutralConfirmBlueClasses,
                },
            });

            // Reload users
            await loadUsers();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to create user. Please try again.',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: sweetalertNeutralConfirmBlueClasses,
                },
            });
        }
    });
}

/**
 * Handle edit user button click
 */
function handleEditUserClick(username) {
    import('./modules/modal.js').then(({ showAdminEditUserModal }) => {
        showAdminEditUserModal(username);
    });
}

/**
 * Bind events
 */
function bindEvents() {
    const addBtn = document.getElementById('adminAddUserBtn');
    const prevBtn = document.getElementById('adminUsersPrevPage');
    const nextBtn = document.getElementById('adminUsersNextPage');

    if (addBtn) {
        addBtn.addEventListener('click', handleAddUserClick);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage <= 1) return;
            currentPage -= 1;
            renderTable();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = users.length > 0 ? Math.ceil(users.length / rowsPerPage) : 1;
            if (currentPage >= totalPages) return;
            currentPage += 1;
            renderTable();
        });
    }

    // Use event delegation for edit buttons (since they're dynamically created)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.edit-user-btn')) {
            const btn = e.target.closest('.edit-user-btn');
            const username = btn.getAttribute('data-username');
            if (username) {
                handleEditUserClick(username);
            }
        }
    });
}

/**
 * Initialize admin page
 */
export function init() {
    const table = document.getElementById('adminUsersTable');
    if (!table) return;

    bindEvents();
    loadUsers();

    // Listen for user update event to reload table
    window.addEventListener('adminUserUpdated', () => {
        loadUsers();
    });
}

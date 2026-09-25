import Swal from 'sweetalert2';
import { showAdminCreateUserDrawer, showAdminEditUserDrawer } from './modules/drawer.js';
import { renderSmartPagination } from './modules/pagination.js';
import { createUser, updateUser, validateUserData } from './modules/user-management.js';
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
let rowsPerPage = 10;
let users = [];
let allUsers = [];
let adminCount = 0;

/**
 * Render users table
 */
function renderTable() {
    const tbody = document.getElementById('adminUsersTableBody');
    const summaryEl = document.getElementById('adminUsersPaginationSummary');
    if (!tbody || !summaryEl) return;
    const total = users.length;
    const totalPages = total > 0 ? Math.ceil(total / rowsPerPage) : 1;
    currentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const visibleUsers = users.slice(startIndex, startIndex + rowsPerPage);
    tbody.innerHTML = visibleUsers.map((user, index) => {
        const createdDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';
        const roleClass = user.role === 'Administrator' ? 'bg-purple-100 text-purple-800' : user.role === 'CEO' ? 'bg-blue-100 text-blue-800' : user.role === 'Manager' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800';
        const roleLocked = user.role === 'Administrator' && adminCount <= 1;
        const roleControl = `<select class="admin-role-select rounded-full border-0 px-2.5 py-1 text-xs font-medium ${roleClass}" data-username="${user.username}" ${roleLocked ? 'disabled title="The only Administrator cannot be demoted"' : ''}><option ${user.role === 'Administrator' ? 'selected' : ''}>Administrator</option><option ${user.role === 'CEO' ? 'selected' : ''}>CEO</option><option ${user.role === 'Manager' ? 'selected' : ''}>Manager</option><option ${user.role === 'Workmate' ? 'selected' : ''}>Workmate</option><option ${user.role === 'Staff' ? 'selected' : ''}>Staff</option></select>`;
        return `<tr class="${index % 2 ? 'bg-slate-50' : 'bg-white'} hover:bg-cyan-50 transition-colors"><td class="p-4"><input type="checkbox" class="admin-user-checkbox h-4 w-4 rounded border-slate-300 text-cyan-600" value="${user.id}"></td><th scope="row" class="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">${user.full_name}<div class="text-xs font-normal text-slate-500">${user.username}</div></th><td class="px-4 py-3">${user.username}</td><td class="px-4 py-3">${user.email}</td><td class="px-4 py-3">${roleControl}</td><td class="px-4 py-3">${createdDate}</td><td class="px-4 py-3"><button type="button" class="edit-user-btn font-medium text-cyan-700 hover:underline" data-username="${user.username}">Edit user</button></td></tr>`;
    }).join('');
    summaryEl.innerHTML = `${total ? `Showing ${startIndex + 1} to` : 'Showing 0 to'} <select id="adminUsersPageSize" class="mx-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-cyan-500 focus:ring-cyan-500" aria-label="Users per page"><option value="10" ${rowsPerPage === 10 ? 'selected' : ''}>10</option><option value="25" ${rowsPerPage === 25 ? 'selected' : ''}>25</option><option value="50" ${rowsPerPage === 50 ? 'selected' : ''}>50</option><option value="100" ${rowsPerPage === 100 ? 'selected' : ''}>100</option><option value="${Math.max(total, 1)}" ${rowsPerPage === Math.max(total, 1) && rowsPerPage !== 10 ? 'selected' : ''}>All</option></select> ${total ? `of ${total} entries` : 'of 0 entries'}`;
    document.getElementById('adminUsersPageSize')?.addEventListener('change', (event) => {
        rowsPerPage = Number(event.target.value) || 10;
        currentPage = 1;
        renderTable();
    });
    renderPagination(total, totalPages);
}
// START: renderPagination - Render pagination buttons, jump input, and navigation controls
function renderPagination(total, totalPages) {
    const prevBtn = document.getElementById('adminUsersPrevPage');
    const nextBtn = document.getElementById('adminUsersNextPage');
    const numbersContainer = document.getElementById('adminUsersPageNumbers');

    renderSmartPagination({
        container: numbersContainer,
        prevBtn,
        nextBtn,
        currentPage,
        totalPages,
        total,
        onPageChange: (newPage) => {
            currentPage = newPage;
            renderTable();
        },
    });
}
// END: renderPagination

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
        allUsers = data.users || [];
        adminCount = allUsers.filter((user) => user.role === 'Administrator').length;
        users = [...allUsers];
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
    showAdminCreateUserDrawer(async (userData) => {
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
    showAdminEditUserDrawer(username, async (userData) => {
        try {
            await updateUser(userData);
            await loadUsers();
            Swal.fire({ icon: 'success', title: 'User updated', text: `User "${userData.username}" has been updated.`, confirmButtonText: 'OK', customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses } });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Update failed', text: error.message || 'Unable to update user.', confirmButtonText: 'OK', customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses } });
        }
    }).catch((error) => Swal.fire({ icon: 'error', title: 'Unable to load user', text: error.message, confirmButtonText: 'OK', customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses } }));
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

    document.getElementById('adminUsersSearch')?.addEventListener('input', (event) => {
        const query = event.target.value.trim().toLowerCase();
        const originalUsers = allUsers;
        users = query ? originalUsers.filter((user) => [user.full_name, user.username, user.email, user.role].some((value) => String(value || '').toLowerCase().includes(query))) : originalUsers;
        currentPage = 1;
        renderTable();
    });
    document.getElementById('adminUsersSelectAll')?.addEventListener('change', (event) => {
        document.querySelectorAll('.admin-user-checkbox').forEach((checkbox) => { checkbox.checked = event.target.checked; });
    });

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

    document.addEventListener('change', async (event) => {
        const roleSelect = event.target.closest('.admin-role-select');
        if (!roleSelect) return;
        const target = allUsers.find((user) => user.username === roleSelect.dataset.username);
        if (!target) return;
        try {
            await updateUser({ username: target.username, fullName: target.full_name, email: target.email, role: roleSelect.value });
            await loadUsers();
        } catch (error) {
            roleSelect.value = target.role;
            Swal.fire({ icon: 'error', title: 'Role not updated', text: error.message, confirmButtonText: 'OK', customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses } });
        }
    });
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











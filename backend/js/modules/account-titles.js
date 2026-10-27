import Swal from 'sweetalert2';
import { showAccountTitlesCreateDrawer, showAccountTitlesEditDrawer } from './drawer.js';
import { showStackedToast } from './toast.js';
import { renderSmartPagination } from './pagination.js';

// ============================================================================
// OOP SERVICES
// ============================================================================

// START: AccountTitlesService - Parent base class for Account Titles data operations
export class AccountTitlesService {
    /**
     * Resolve base API URL from current window location
     */
    static getApiBasePath() {
        const path = window.location.pathname || '';
        const idx = path.indexOf('/frontend/');
        return idx !== -1 ? path.substring(0, idx) : path.substring(0, path.lastIndexOf('/')) || '';
    }

    /**
     * Fetch list of all account titles
     */
    static async fetchAll() {
        const apiBase = this.getApiBasePath();
        const response = await fetch(`${apiBase}/api/account-titles/list.php`, {
            credentials: 'same-origin'
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to fetch account titles');
        }
        return result.data || [];
    }

    /**
     * Fetch list of fund categories from database
     */
    static async fetchCategories() {
        const apiBase = this.getApiBasePath();
        const response = await fetch(`${apiBase}/api/account-titles/categories.php`, {
            credentials: 'same-origin'
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to fetch categories');
        }
        return result.data || [];
    }
}
// END: AccountTitlesService

// START: AccountTitleValidator - Subchild helper for G/L code and Account Title input validation
export class AccountTitleValidator {
    /**
     * G/L Code must be numbers only (0-9)
     */
    static validateGlCode(glCode) {
        if (!glCode || !String(glCode).trim()) {
            return { valid: false, message: 'G/L Code is required' };
        }
        const isNumeric = /^\d+$/.test(String(glCode).trim());
        return {
            valid: isNumeric,
            message: isNumeric ? '' : 'G/L Code must be numbers only (no text or letters allowed).'
        };
    }

    /**
     * Account Title must be letters and text only (no numbers allowed)
     */
    static validateAccountTitle(title) {
        if (!title || !String(title).trim()) {
            return { valid: false, message: 'Account Title is required' };
        }
        const hasNumber = /\d/.test(String(title));
        return {
            valid: !hasNumber,
            message: hasNumber ? 'Account Title must contain letters only (numbers are not allowed).' : ''
        };
    }
}
// END: AccountTitleValidator

// START: AccountTitlesManager - Subchild class extending AccountTitlesService for CRUD operations
export class AccountTitlesManager extends AccountTitlesService {
    /**
     * Create a new account title
     */
    static async create(payload) {
        const apiBase = this.getApiBasePath();
        const response = await fetch(`${apiBase}/api/account-titles/create.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to create account title');
        }
        return result;
    }

    /**
     * Update an existing account title
     */
    static async update(payload) {
        const apiBase = this.getApiBasePath();
        const response = await fetch(`${apiBase}/api/account-titles/update.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to update account title');
        }
        return result;
    }

    /**
     * Delete an account title
     */
    static async delete(id) {
        const apiBase = this.getApiBasePath();
        const response = await fetch(`${apiBase}/api/account-titles/delete.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ id })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to delete account title');
        }
        return result;
    }
}
// END: AccountTitlesManager

// ============================================================================
// PAGE CONTROLLER & TABLE INTERACTION
// ============================================================================

// State
let accountTitles = [];
let categoriesList = [];
let selectedCategoryFilter = 'all'; // 'all' or category code
let categoryPillSearchTerm = '';
let currentPage = 1;
let rowsPerPage = 10;
let searchTerm = '';
let sortDirection = 'asc'; // 'asc' or 'desc'

// Category badges style helper
const CATEGORY_COLORS = {
    'mooe': 'bg-blue-50 text-blue-700 border-blue-200',
    'sp-philhealth': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'sp-ntp': 'bg-amber-50 text-amber-700 border-amber-200',
    'sp-mcp': 'bg-purple-50 text-purple-700 border-purple-200',
    'sp-konsulta': 'bg-rose-50 text-rose-700 border-rose-200'
};

// START: getFilteredAndSortedRows - Filter and sort account titles rows
function getFilteredAndSortedRows() {
    const term = searchTerm.trim().toLowerCase();
    let filtered = accountTitles;

    // Filter by Category Pill
    if (selectedCategoryFilter && selectedCategoryFilter !== 'all') {
        filtered = filtered.filter((item) => {
            const cat = (item.category || 'mooe').toLowerCase();
            return cat === selectedCategoryFilter.toLowerCase();
        });
    }

    // Filter by Search Input
    if (term) {
        filtered = filtered.filter((item) => {
            const gl = String(item.gl_code || '').toLowerCase();
            const title = String(item.account_title || '').toLowerCase();
            const cat = String(item.category || '').toLowerCase();
            return gl.includes(term) || title.includes(term) || cat.includes(term);
        });
    }

    return [...filtered].sort((a, b) => {
        const glA = String(a.gl_code || '');
        const glB = String(b.gl_code || '');
        return sortDirection === 'asc'
            ? glA.localeCompare(glB, undefined, { numeric: true })
            : glB.localeCompare(glA, undefined, { numeric: true });
    });
}
// END: getFilteredAndSortedRows

// START: renderCategoryPills - Renders horizontal clickable text buttons for category filtering
function renderCategoryPills() {
    const container = document.getElementById('accountTitlesCategoryPillsContainer');
    if (!container) return;

    const term = categoryPillSearchTerm.trim().toLowerCase();

    // Start with "All Funds"
    const allOptions = [
        { code: 'all', name: 'All Funds' },
        ...categoriesList
    ];

    const filtered = allOptions.filter(cat => 
        cat.name.toLowerCase().includes(term) || cat.code.toLowerCase().includes(term)
    );

    if (filtered.length === 0) {
        container.innerHTML = `<span class="text-xs text-slate-400 py-1">No matching category pills</span>`;
        return;
    }

    container.innerHTML = filtered.map(cat => {
        const isSelected = selectedCategoryFilter === cat.code;
        return `
            <button type="button"
                    data-category-code="${cat.code}"
                    class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        isSelected 
                            ? 'bg-[#224796] text-white shadow-xs font-bold ring-2 ring-[#224796]/30' 
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }">
                <span>${cat.name}</span>
                ${isSelected ? '<svg class="w-3.5 h-3.5 text-blue-200" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' : ''}
            </button>
        `;
    }).join('');

    // Update active badge in toggle button
    const badge = document.getElementById('accountTitlesCategoryActiveBadge');
    if (badge) {
        if (selectedCategoryFilter && selectedCategoryFilter !== 'all') {
            badge.classList.remove('hidden');
            const found = categoriesList.find(c => c.code === selectedCategoryFilter);
            badge.textContent = found ? found.name : '1';
        } else {
            badge.classList.add('hidden');
        }
    }
}
// END: renderCategoryPills

// START: renderSkeletonTable - Render Flowbite skeleton pulse rows while loading
function renderSkeletonTable(count = 5) {
    const tbody = document.getElementById('accountTitlesTableBody');
    if (!tbody) return;

    tbody.innerHTML = Array.from({ length: count }, (_, index) => `
        <tr class="${index % 2 === 1 ? 'bg-slate-50' : 'bg-white'} animate-pulse" role="status">
            <td class="whitespace-nowrap px-4 py-3">
                <div class="h-2.5 bg-slate-200 rounded-full w-8"></div>
            </td>
            <td class="whitespace-nowrap px-4 py-3">
                <div class="h-2.5 bg-slate-200 rounded-full w-24"></div>
            </td>
            <td class="px-4 py-3">
                <div class="h-2.5 bg-slate-200 rounded-full w-64 md:w-96 mb-1.5"></div>
            </td>
            <td class="whitespace-nowrap px-4 py-3">
                <div class="h-5 bg-slate-200 rounded-full w-20"></div>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-center">
                <div class="h-7 w-7 bg-slate-200 rounded-lg mx-auto"></div>
            </td>
        </tr>
    `).join('');
}
// END: renderSkeletonTable

// START: updateSortDirectionUI - Update sort direction button icons and aria-labels for toolbar & table header
function updateSortDirectionUI() {
    const btn = document.getElementById('accountTitlesSortDirection');
    const icon = document.getElementById('accountTitlesSortDirectionIcon');
    const glHeaderSortIcon = document.getElementById('accountTitlesGlSortIcon');

    if (sortDirection === 'asc') {
        if (icon) {
            icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>';
        }
        if (btn) {
            btn.title = 'Ascending order (Click for Descending)';
            btn.setAttribute('aria-label', 'Ascending order (Click for Descending)');
        }
        if (glHeaderSortIcon) {
            glHeaderSortIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>';
        }
    } else {
        if (icon) {
            icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>';
        }
        if (btn) {
            btn.title = 'Descending order (Click for Ascending)';
            btn.setAttribute('aria-label', 'Descending order (Click for Ascending)');
        }
        if (glHeaderSortIcon) {
            glHeaderSortIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>';
        }
    }
}
// END: updateSortDirectionUI

// START: renderPagination - Update pagination numbers, prev/next buttons, and summary with page size dropdown
function renderPagination(total, totalPages) {
    const prevBtn = document.getElementById('accountTitlesPrevPage');
    const nextBtn = document.getElementById('accountTitlesNextPage');
    const numbersContainer = document.getElementById('accountTitlesPageNumbers');

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
        }
    });
}
// END: renderPagination

// START: renderTable - Renders the account titles table rows, actions, and summary with dropdown list
function renderTable() {
    const tbody = document.getElementById('accountTitlesTableBody');
    const summaryEl = document.getElementById('accountTitlesPaginationSummary');
    if (!tbody || !summaryEl) return;

    const rows = getFilteredAndSortedRows();
    const total = rows.length;
    const effectiveRowsPerPage = rowsPerPage > 0 ? rowsPerPage : 10;
    const totalPages = total > 0 ? Math.ceil(total / effectiveRowsPerPage) : 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * effectiveRowsPerPage;
    const endIndex = Math.min(startIndex + effectiveRowsPerPage, total);
    const visibleRows = rows.slice(startIndex, endIndex);

    if (visibleRows.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">
                    No account titles found. Click "Add Account" to create one.
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = visibleRows.map((row, index) => {
            const isStriped = index % 2 === 1;
            const rowNumber = startIndex + index + 1;
            const catCode = row.category || 'mooe';
            const catObj = categoriesList.find(c => c.code === catCode);
            const catName = catObj ? catObj.name : (catCode === 'mooe' ? 'MOOE' : catCode);
            const colorClass = CATEGORY_COLORS[catCode] || 'bg-slate-100 text-slate-700 border-slate-200';

            return `
                <tr class="${isStriped ? 'bg-slate-50' : 'bg-white'} hover:bg-slate-100 transition-colors" data-row-id="${row.id}">
                    <td class="whitespace-nowrap px-4 py-3 text-xs md:text-sm font-semibold text-slate-400">
                        ${rowNumber}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3 text-xs md:text-sm font-bold text-slate-900 font-mono">
                        ${row.gl_code}
                    </td>
                    <td class="px-4 py-3 text-xs md:text-sm font-semibold text-slate-800">
                        ${row.account_title}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${colorClass}">
                            ${catName}
                        </span>
                    </td>
                    <td class="whitespace-nowrap px-4 py-3 text-center">
                        <div class="inline-flex items-center gap-1.5">
                            <button
                                type="button"
                                class="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors shadow-xs"
                                data-action="edit-account"
                                data-id="${row.id}"
                                title="Edit Account Title"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L13 13l-4 1 1-4 6.5-6.5z" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                class="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white p-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer transition-colors shadow-xs"
                                data-action="delete-account"
                                data-id="${row.id}"
                                title="Delete Account Title"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Build pagination summary: If total > 10, provide page size dropdown
    if (total <= 10) {
        summaryEl.textContent = total > 0
            ? `Showing 1 to ${total} of ${total} entries`
            : 'Showing 0 to 0 of 0 entries';
    } else {
        // Build option steps starting at 10, then increments of 5 up to total
        const pageOptions = [10];
        for (let opt = 15; opt < total; opt += 5) {
            pageOptions.push(opt);
        }
        if (!pageOptions.includes(total)) {
            pageOptions.push(total);
        }

        const optionsHtml = pageOptions.map((opt) => {
            const isSelected = rowsPerPage === opt || (opt === total && rowsPerPage >= total);
            const label = opt === total ? `All (${total})` : String(opt);
            return `<option value="${opt}" ${isSelected ? 'selected' : ''}>${label}</option>`;
        }).join('');

        summaryEl.innerHTML = `
            <span>Showing ${startIndex + 1} to</span>
            <select id="accountTitlesPageSizeSelect" class="mx-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800 cursor-pointer hover:border-slate-400 focus:border-[#224796] focus:ring-1 focus:ring-[#224796] outline-hidden shadow-2xs" aria-label="Entries per page">
                ${optionsHtml}
            </select>
            <span>of ${total} entries</span>
        `;

        document.getElementById('accountTitlesPageSizeSelect')?.addEventListener('change', (e) => {
            rowsPerPage = Number(e.target.value) || 10;
            currentPage = 1;
            renderTable();
        });
    }

    renderPagination(total, totalPages);
}
// END: renderTable

// START: loadAccountTitlesData - Fetch account titles & categories from API and refresh table
export async function loadAccountTitlesData() {
    renderSkeletonTable();
    try {
        const [titles, categories] = await Promise.all([
            AccountTitlesManager.fetchAll(),
            AccountTitlesService.fetchCategories().catch((e) => {
                console.warn('Failed to fetch categories, falling back:', e);
                return [
                    { code: 'mooe', name: 'MOOE' },
                    { code: 'sp-philhealth', name: 'PhilHealth' },
                    { code: 'sp-ntp', name: 'SPF NTP' },
                    { code: 'sp-mcp', name: 'MCP Facility' },
                    { code: 'sp-konsulta', name: 'Konsulta' }
                ];
            })
        ]);

        accountTitles = titles;
        categoriesList = categories;
        renderCategoryPills();
        renderTable();
    } catch (error) {
        console.error('Error loading account titles:', error);
        showStackedToast(error.message || 'Failed to load account titles', 'error');
        const tbody = document.getElementById('accountTitlesTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-sm text-rose-500">
                        Failed to load data. Please refresh the page.
                    </td>
                </tr>
            `;
        }
    }
}
// END: loadAccountTitlesData

// START: handleAddAccountTitle - Handles opening Flowbite drawer for adding an account title
function handleAddAccountTitle() {
    showAccountTitlesCreateDrawer({
        onConfirm: async (formData) => {
            try {
                await AccountTitlesManager.create(formData);
                showStackedToast('Account title created successfully', 'success');
                await loadAccountTitlesData();
            } catch (err) {
                showStackedToast(err.message || 'Failed to create account title', 'error');
            }
        }
    });
}
// END: handleAddAccountTitle

// START: handleEditAccountTitle - Handles opening Flowbite drawer for editing an account title
function handleEditAccountTitle(id) {
    const item = accountTitles.find((row) => String(row.id) === String(id));
    if (!item) {
        showStackedToast('Account title not found', 'error');
        return;
    }

    showAccountTitlesEditDrawer({
        accountTitle: item,
        onConfirm: async (formData) => {
            try {
                await AccountTitlesManager.update(formData);
                showStackedToast('Account title updated successfully', 'success');
                await loadAccountTitlesData();
            } catch (err) {
                showStackedToast(err.message || 'Failed to update account title', 'error');
            }
        }
    });
}
// END: handleEditAccountTitle

// START: handleDeleteAccountTitle - Prompt confirmation and delete account title
async function handleDeleteAccountTitle(id) {
    const item = accountTitles.find((row) => String(row.id) === String(id));
    if (!item) return;

    const confirmResult = await Swal.fire({
        title: 'Delete Account Title?',
        text: `Are you sure you want to delete "${item.account_title}" (${item.gl_code})?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'Cancel',
        customClass: {
            popup: 'rounded-2xl shadow-2xl border border-slate-200 p-6',
            confirmButton: 'inline-flex items-center justify-center rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 cursor-pointer transition-colors',
            cancelButton: 'inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors',
            actions: 'flex items-center justify-end gap-3 mt-4'
        },
        buttonsStyling: false
    });

    if (confirmResult.isConfirmed) {
        try {
            await AccountTitlesManager.delete(id);
            showStackedToast('Account title deleted successfully', 'success');
            await loadAccountTitlesData();
        } catch (err) {
            showStackedToast(err.message || 'Failed to delete account title', 'error');
        }
    }
}
// END: handleDeleteAccountTitle

// START: toggleGlSortDirection - Toggles G/L Code sorting direction (asc/desc) and recalibrates view
function toggleGlSortDirection() {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    updateSortDirectionUI();
    currentPage = 1;
    renderTable();
}
// END: toggleGlSortDirection

// START: bindEvents - Binds all button clicks, search input, pagination next/prev, and table actions
function bindEvents() {
    const searchInput = document.getElementById('accountTitlesSearch');
    const addBtn = document.getElementById('accountTitlesAddBtn');
    const sortDirectionBtn = document.getElementById('accountTitlesSortDirection');
    const glHeaderSortBtn = document.getElementById('accountTitlesGlCodeHeaderSort');
    const prevBtn = document.getElementById('accountTitlesPrevPage');
    const nextBtn = document.getElementById('accountTitlesNextPage');
    const tbody = document.getElementById('accountTitlesTableBody');

    // Category filter elements
    const filterToggleBtn = document.getElementById('accountTitlesCategoryFilterToggleBtn');
    const filterPanel = document.getElementById('accountTitlesCategoryFilterPanel');
    const filterIcon = document.getElementById('accountTitlesCategoryFilterIcon');
    const pillsContainer = document.getElementById('accountTitlesCategoryPillsContainer');
    const categorySearchInput = document.getElementById('accountTitlesCategorySearchInput');

    if (filterToggleBtn && filterPanel) {
        filterToggleBtn.addEventListener('click', () => {
            const isHidden = filterPanel.classList.contains('hidden');
            if (isHidden) {
                filterPanel.classList.remove('hidden');
                filterToggleBtn.setAttribute('aria-expanded', 'true');
                filterToggleBtn.classList.add('bg-blue-50', 'border-blue-300', 'text-blue-700');
                if (filterIcon) filterIcon.classList.add('rotate-180', 'text-blue-600');
                setTimeout(() => categorySearchInput?.focus(), 50);
            } else {
                filterPanel.classList.add('hidden');
                filterToggleBtn.setAttribute('aria-expanded', 'false');
                filterToggleBtn.classList.remove('bg-blue-50', 'border-blue-300', 'text-blue-700');
                if (filterIcon) filterIcon.classList.remove('rotate-180', 'text-blue-600');
            }
        });
    }

    if (pillsContainer) {
        pillsContainer.addEventListener('click', (e) => {
            const pillBtn = e.target.closest('button[data-category-code]');
            if (pillBtn) {
                const code = pillBtn.dataset.categoryCode;
                selectedCategoryFilter = code;
                renderCategoryPills();
                currentPage = 1;
                renderTable();
            }
        });
    }

    if (categorySearchInput) {
        categorySearchInput.addEventListener('input', (e) => {
            categoryPillSearchTerm = e.target.value || '';
            renderCategoryPills();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value || '';
            currentPage = 1;
            renderTable();
        });
    }

    if (addBtn) {
        addBtn.addEventListener('click', handleAddAccountTitle);
    }

    if (sortDirectionBtn) {
        sortDirectionBtn.addEventListener('click', toggleGlSortDirection);
    }

    if (glHeaderSortBtn) {
        glHeaderSortBtn.addEventListener('click', toggleGlSortDirection);
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
            const rows = getFilteredAndSortedRows();
            const effectiveRowsPerPage = rowsPerPage > 0 ? rowsPerPage : 10;
            const totalPages = rows.length > 0 ? Math.ceil(rows.length / effectiveRowsPerPage) : 1;
            if (currentPage >= totalPages) return;
            currentPage += 1;
            renderTable();
        });
    }

    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const editBtn = e.target.closest('[data-action="edit-account"]');
            if (editBtn) {
                const id = editBtn.dataset.id;
                handleEditAccountTitle(id);
                return;
            }

            const deleteBtn = e.target.closest('[data-action="delete-account"]');
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                handleDeleteAccountTitle(id);
            }
        });
    }
}
// END: bindEvents

// START: init - Entry point for account-titles page module
export function init() {
    updateSortDirectionUI();
    bindEvents();
    loadAccountTitlesData();
}
// END: init

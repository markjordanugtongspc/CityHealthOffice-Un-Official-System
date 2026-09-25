import Swal from 'sweetalert2';
import { initInlineEdit } from './modules/inline-edit.js';
import {
    sweetalertActionsLeftAlignedClasses,
    sweetalertHtmlLeftAlignedClasses,
    sweetalertNeutralConfirmBlueClasses,
    sweetalertPopupBaseClasses,
    sweetalertPrimaryConfirmClasses,
    sweetalertSecondaryCancelClasses,
} from './modules/modal.js';
import { showBudgetCreateDrawer, showBudgetEditDrawer, showBudgetCalculateDrawer } from './modules/drawer.js';
import { showStackedToast } from './modules/toast.js';
import { renderSmartPagination } from './modules/pagination.js';

// Budget data model (will be loaded from database)
let budgetRows = [];

// State
let currentPage = 1;
let rowsPerPage = 10;
let sortField = '';
let sortDirection = 'asc'; // 'asc' = lowest first (accordion down default), 'desc' = highest first (accordion up)
let searchTerm = '';
let selectedYear = new Date().getFullYear();

// Active animations map for cell rolling counters
const activeBudgetAnimations = new Map();

// Formatters
const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

// START: getApiBasePath - Calculate the base API path from current window pathname
function getApiBasePath() {
    const path = window.location.pathname || '';
    const idx = path.indexOf('/frontend/');
    return idx !== -1 ? path.substring(0, idx) : path.substring(0, path.lastIndexOf('/')) || '';
}
// END: getApiBasePath

// START: getCurrentYearFromGlobal - Resolve current system year from window or calendar
function getCurrentYearFromGlobal() {
    if (typeof window !== 'undefined' && typeof window.appCurrentYear === 'number') {
        return window.appCurrentYear;
    }
    return new Date().getFullYear();
}
// END: getCurrentYearFromGlobal

// START: getFilteredAndSortedRows - Filter and sort rows based on search term, sortField, and sortDirection
function getFilteredAndSortedRows() {
    const trimmed = searchTerm.trim().toLowerCase();

    let filtered = budgetRows;
    if (trimmed) {
        filtered = budgetRows.filter((row) => {
            const gl = String(row.glCode || '').toLowerCase();
            const title = String(row.accountTitle || '').toLowerCase();
            return gl.includes(trimmed) || title.includes(trimmed);
        });
    }

    // Default sort: if no explicit sort field chosen, sort by G/L Code using sortDirection
    if (!sortField) {
        return [...filtered].sort((a, b) => {
            const aGl = String(a.glCode || '');
            const bGl = String(b.glCode || '');
            if (sortDirection === 'asc') {
                return aGl.localeCompare(bGl, undefined, { numeric: true });
            }
            return bGl.localeCompare(aGl, undefined, { numeric: true });
        });
    }

    const sorted = [...filtered].sort((a, b) => {
        const aVal = Number(a[sortField]) || 0;
        const bVal = Number(b[sortField]) || 0;

        if (sortDirection === 'asc') {
            return aVal - bVal; // Lowest first
        }
        return bVal - aVal; // Highest first
    });

    return sorted;
}
// END: getFilteredAndSortedRows

// START: formatCurrency - Format numeric values into PHP currency string
function formatCurrency(value) {
    return currencyFormatter.format(value || 0);
}
// END: formatCurrency

// START: formatPercent - Format numeric values into signed percentage string
function formatPercent(value) {
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value || 0);
    return `${sign}${percentFormatter.format(abs)}%`;
}
// END: formatPercent

// START: renderSkeletonTable - Render Flowbite skeleton loading state inside table body
function renderSkeletonTable(rowsCount = 5) {
    const tbody = document.getElementById('budgetTableBody');
    if (!tbody) return;

    const count = Math.min(Math.max(rowsCount, 3), 10);
    const skeletonRows = Array.from({ length: count }, (_, index) => `
        <tr class="${index % 2 === 1 ? 'bg-slate-50' : 'bg-white'} animate-pulse" role="status">
            <td class="whitespace-nowrap px-4 py-3">
                <div class="h-2.5 bg-slate-200 rounded-full w-20"></div>
            </td>
            <td class="px-4 py-3">
                <div class="h-2.5 bg-slate-200 rounded-full w-48 md:w-60 mb-2"></div>
                <div class="w-32 h-2 bg-slate-200 rounded-full"></div>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right">
                <div class="h-2.5 bg-slate-200 rounded-full w-16 ml-auto"></div>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right">
                <div class="h-2.5 bg-slate-200 rounded-full w-20 ml-auto"></div>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right">
                <div class="h-2.5 bg-slate-200 rounded-full w-20 ml-auto"></div>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right">
                <div class="h-2.5 bg-slate-200 rounded-full w-12 ml-auto"></div>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-center">
                <div class="h-7 w-7 bg-slate-200 rounded-lg mx-auto"></div>
            </td>
        </tr>
    `).join('');

    tbody.innerHTML = `
        ${skeletonRows}
        <tr class="sr-only"><td colspan="7"><span role="status">Loading...</span></td></tr>
    `;
}
// END: renderSkeletonTable

// START: cancelAllBudgetAnimations - Cancel all ongoing number rolling animations
function cancelAllBudgetAnimations() {
    activeBudgetAnimations.forEach((frameId) => {
        cancelAnimationFrame(frameId);
    });
    activeBudgetAnimations.clear();
}
// END: cancelAllBudgetAnimations

// START: animateRollingElement - Animate rolling counter for numeric and percent table cells
function animateRollingElement(el, targetValue, formatType = 'currency', duration = 800) {
    if (!el) return;
    const finalNumeric = Number(targetValue);
    if (!Number.isFinite(finalNumeric)) return;

    if (activeBudgetAnimations.has(el)) {
        cancelAnimationFrame(activeBudgetAnimations.get(el));
        activeBudgetAnimations.delete(el);
    }

    const start = performance.now();
    const startValue = 0;

    const step = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo easing matching charts.js counter
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = startValue + (finalNumeric - startValue) * ease;

        if (formatType === 'currency') {
            el.textContent = formatCurrency(currentVal);
        } else if (formatType === 'percent') {
            el.textContent = formatPercent(currentVal);
        } else {
            el.textContent = String(Math.round(currentVal));
        }

        if (progress < 1) {
            const frameId = requestAnimationFrame(step);
            activeBudgetAnimations.set(el, frameId);
        } else {
            if (formatType === 'currency') {
                el.textContent = formatCurrency(finalNumeric);
            } else if (formatType === 'percent') {
                el.textContent = formatPercent(finalNumeric);
            }
            activeBudgetAnimations.delete(el);
        }
    };

    const initialFrame = requestAnimationFrame(step);
    activeBudgetAnimations.set(el, initialFrame);
}
// END: animateRollingElement

// START: updateSortDirectionUI - Update sort direction button icon, title, and aria label
function updateSortDirectionUI() {
    const sortDirectionBtn = document.getElementById('budgetSortDirection');
    const sortDirectionIcon = document.getElementById('budgetSortDirectionIcon');
    if (!sortDirectionBtn || !sortDirectionIcon) return;

    if (sortDirection === 'asc') {
        // Accordion down = Lowest budget / Ascending
        sortDirectionIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>';
        sortDirectionBtn.title = 'Lowest first (Click for Highest)';
        sortDirectionBtn.setAttribute('aria-label', 'Lowest first (Click for Highest)');
    } else {
        // Accordion up = Highest budget / Descending
        sortDirectionIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>';
        sortDirectionBtn.title = 'Highest first (Click for Lowest)';
        sortDirectionBtn.setAttribute('aria-label', 'Highest first (Click for Lowest)');
    }
}
// END: updateSortDirectionUI

// START: renderTable - Render budget table rows, rolling numbers, and entries per page pagination
function renderTable() {
    const tbody = document.getElementById('budgetTableBody');
    const summaryEl = document.getElementById('budgetPaginationSummary');

    if (!tbody || !summaryEl) return;

    cancelAllBudgetAnimations();

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
                <td colspan="7" class="px-4 py-8 text-center text-sm text-slate-500">
                    No budget entries found.
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = visibleRows
            .map((row, index) => {
                const isStriped = index % 2 === 1;
                const actual = Number(row.actual) || 0;
                const budget = Number(row.budget) || 0;

                // Treat rows with no budget as "no inputs" for Remaining
                const hasBudget = budget > 0;
                const remainingRaw = Number(row.remainingAmount);
                const remainingAmount = hasBudget
                    ? (Number.isFinite(remainingRaw) ? remainingRaw : budget - actual)
                    : 0;

                const remainingClass = !hasBudget
                    ? 'text-slate-400'
                    : remainingAmount < 0
                        ? 'text-red-600'
                        : remainingAmount > 0
                            ? 'text-emerald-600'
                            : 'text-slate-700';

                return `
                    <tr class="${isStriped ? 'bg-slate-50' : 'bg-white'} hover:bg-slate-100 transition-colors" data-row-index="${index}" data-gl-code="${row.glCode}" data-row-id="${row.id ?? ''}">
                        <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm font-medium text-slate-900">
                            ${row.glCode}
                        </td>
                        <td class="px-4 py-2 text-xs md:text-sm text-slate-700" data-editable="accountTitle" data-type="text" data-value="${row.accountTitle}">
                            ${row.accountTitle}
                        </td>
                        <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm text-right font-money font-medium text-slate-700">
                            ${formatCurrency(row.actual)}
                        </td>
                        <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm text-right font-money font-semibold text-slate-900">
                            <span data-animate="currency" data-value="${budget}">${formatCurrency(0)}</span>
                        </td>
                        <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm text-right font-money font-semibold ${remainingClass}">
                            ${hasBudget ? `<span data-animate="currency" data-value="${remainingAmount}">${formatCurrency(0)}</span>` : '-'}
                        </td>
                        <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm text-right font-money font-semibold ${remainingClass}">
                            ${hasBudget ? `<span data-animate="percent" data-value="${row.remainingPercent || 0}">${formatPercent(0)}</span>` : '-'}
                        </td>
                        <td class="whitespace-nowrap px-4 py-2 text-center">
                            <button
                                type="button"
                                class="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors"
                                data-action="edit-row"
                                data-row-id="${row.id ?? ''}"
                                title="Edit entry"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L13 13l-4 1 1-4 6.5-6.5z" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                `;
            })
            .join('');

        // Trigger rolling counter animations on rendered cells
        tbody.querySelectorAll('[data-animate]').forEach((cell) => {
            const type = cell.getAttribute('data-animate');
            const val = cell.getAttribute('data-value');
            animateRollingElement(cell, val, type, 700);
        });
    }

    // Render pagination summary with entries per page dropdown matching admin page
    summaryEl.innerHTML = `${total ? `Showing ${startIndex + 1} to ${endIndex}` : 'Showing 0 to 0'} <select id="budgetPageSize" class="mx-1 cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-cyan-500 focus:ring-cyan-500" aria-label="Entries per page"><option value="10" ${rowsPerPage === 10 ? 'selected' : ''}>10</option><option value="25" ${rowsPerPage === 25 ? 'selected' : ''}>25</option><option value="50" ${rowsPerPage === 50 ? 'selected' : ''}>50</option><option value="100" ${rowsPerPage === 100 ? 'selected' : ''}>100</option><option value="${Math.max(total, 1)}" ${rowsPerPage === Math.max(total, 1) && rowsPerPage !== 10 && rowsPerPage !== 25 && rowsPerPage !== 50 && rowsPerPage !== 100 ? 'selected' : ''}>All</option></select> ${total ? `of ${total} entries` : 'of 0 entries'}`;

    document.getElementById('budgetPageSize')?.addEventListener('change', (event) => {
        rowsPerPage = Number(event.target.value) || 10;
        currentPage = 1;
        renderTable();
    });

    renderPagination(total, totalPages);

    // Bind edit buttons
    tbody.querySelectorAll('button[data-action="edit-row"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const rowId = btn.getAttribute('data-row-id');
            const rowData = budgetRows.find((r) => String(r.id) === String(rowId));
            if (rowData) {
                openBudgetEditDrawer(rowData);
            }
        });
    });
}
// END: renderTable

// START: parseCurrencyInput - Extract float numeric value from user currency input string
function parseCurrencyInput(raw) {
    if (!raw) return 0;
    const cleaned = String(raw).replace(/[^0-9.-]/g, '').replace(/,/g, '');
    const num = parseFloat(cleaned);
    return Number.isNaN(num) ? 0 : num;
}
// END: parseCurrencyInput

// START: formatPlainCurrencyNumber - Format plain number with commas and 2 decimals for input fields
function formatPlainCurrencyNumber(value) {
    const num = parseFloat(value || 0);
    return num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
// END: formatPlainCurrencyNumber

// START: openBudgetEditDrawer - Open budget drawer for editing budget entry
function openBudgetEditDrawer(row) {
    const previousState = {
        id: row.id,
        glCode: row.glCode,
        accountTitle: row.accountTitle,
        actual: row.actual,
        budget: row.budget,
    };

    showBudgetEditDrawer(row, {
        onConfirm: async ({ id, glCode, accountTitle, actual, budget }) => {
            const apiBase = getApiBasePath();
            try {
                const res = await fetch(`${apiBase}/api/budget/update.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        id: id || row.id,
                        glCode: glCode || row.glCode,
                        accountTitle: accountTitle || row.accountTitle,
                        actual: actual,
                        budget: budget,
                    }),
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.message || 'Failed to update entry');

                // Update local row
                row.glCode = glCode || row.glCode;
                row.accountTitle = accountTitle || row.accountTitle;
                row.actual = actual;
                row.budget = budget;
                const remaining = calculateRemaining(row.actual, row.budget);
                row.remainingAmount = remaining.remainingAmount;
                row.remainingPercent = remaining.remainingPercent;

                await loadBudgetData();
                renderTable();

                showStackedToast({
                    title: 'Budget entry updated successfully.',
                    type: 'success',
                    cachePayload: previousState,
                    duration: 5000,
                    onUndo: async () => {
                        try {
                            const rollbackRes = await fetch(`${apiBase}/api/budget/update.php`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'same-origin',
                                body: JSON.stringify(previousState),
                            });
                            const rollbackData = await rollbackRes.json();
                            if (rollbackData.success) {
                                row.glCode = previousState.glCode;
                                row.accountTitle = previousState.accountTitle;
                                row.actual = previousState.actual;
                                row.budget = previousState.budget;
                                const rollRem = calculateRemaining(row.actual, row.budget);
                                row.remainingAmount = rollRem.remainingAmount;
                                row.remainingPercent = rollRem.remainingPercent;
                                await loadBudgetData();
                                renderTable();
                            }
                        } catch (revertErr) {
                            console.error('Failed to revert budget edit:', revertErr);
                        }
                    },
                });
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.message || 'Failed to save changes',
                    confirmButtonText: 'OK',
                    customClass: { confirmButton: `${sweetalertNeutralConfirmBlueClasses} cursor-pointer` },
                });
            }
        }
    });
}
// END: openBudgetEditDrawer

// START: renderPagination - Render pagination buttons, jump input, and navigation controls
function renderPagination(total, totalPages) {
    const prevBtn = document.getElementById('budgetPrevPage');
    const nextBtn = document.getElementById('budgetNextPage');
    const numbersContainer = document.getElementById('budgetPageNumbers');

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

// Realistic Mock Budget Data matching City Health Office chart allocations and master accounts
const MOCK_BUDGET_DATA = [
    { id: 1, glCode: '5-02-03-010', accountTitle: 'Office Supplies Expenses', actual: 2980000, budget: 5000000, remainingAmount: 2020000, remainingPercent: 40.40 },
    { id: 2, glCode: '5-02-03-070', accountTitle: 'Drugs and Medicines Expenses', actual: 74500000, budget: 120000000, remainingAmount: 45500000, remainingPercent: 37.92 },
    { id: 3, glCode: '5-02-03-080', accountTitle: 'Medical, Dental and Laboratory Supplies Expenses', actual: 42500000, budget: 85000000, remainingAmount: 42500000, remainingPercent: 50.00 },
    { id: 4, glCode: '5-02-03-990', accountTitle: 'Other Supplies and Materials Expenses', actual: 3420000, budget: 8000000, remainingAmount: 4580000, remainingPercent: 57.25 },
    { id: 5, glCode: '5-02-04-010', accountTitle: 'Water Expenses', actual: 1250000, budget: 3000000, remainingAmount: 1750000, remainingPercent: 58.33 },
    { id: 6, glCode: '5-02-04-020', accountTitle: 'Electricity Expenses', actual: 3850000, budget: 7500000, remainingAmount: 3650000, remainingPercent: 48.67 },
    { id: 7, glCode: '5-02-05-020', accountTitle: 'Telephone Expenses', actual: 480000, budget: 1200000, remainingAmount: 720000, remainingPercent: 60.00 },
    { id: 8, glCode: '5-02-05-030', accountTitle: 'Internet Subscription Expenses', actual: 620000, budget: 1500000, remainingAmount: 880000, remainingPercent: 58.67 },
    { id: 9, glCode: '5-02-11-030', accountTitle: 'Consultancy Services', actual: 1800000, budget: 4500000, remainingAmount: 2700000, remainingPercent: 60.00 },
    { id: 10, glCode: '5-02-11-990', accountTitle: 'Other Professional Services', actual: 3100000, budget: 6500000, remainingAmount: 3400000, remainingPercent: 52.31 },
    { id: 11, glCode: '5-02-12-020', accountTitle: 'Janitorial Services', actual: 2150000, budget: 4800000, remainingAmount: 2650000, remainingPercent: 55.21 },
    { id: 12, glCode: '5-02-12-030', accountTitle: 'Security Services', actual: 2890000, budget: 6000000, remainingAmount: 3110000, remainingPercent: 51.83 },
    { id: 13, glCode: '5-02-13-040', accountTitle: 'Repairs and Maintenance - Buildings and Other Structures', actual: 4650000, budget: 10000000, remainingAmount: 5350000, remainingPercent: 53.50 },
    { id: 14, glCode: '5-02-13-050', accountTitle: 'Repairs and Maintenance - Machinery and Equipment', actual: 3120000, budget: 7500000, remainingAmount: 4380000, remainingPercent: 58.40 },
    { id: 15, glCode: '5-02-13-060', accountTitle: 'Repairs and Maintenance - Transportation Equipment', actual: 1850000, budget: 4250000, remainingAmount: 2400000, remainingPercent: 56.47 },
    { id: 16, glCode: '5-02-99-030', accountTitle: 'Representation Expenses', actual: 950000, budget: 2500000, remainingAmount: 1550000, remainingPercent: 62.00 },
    { id: 17, glCode: '5-02-99-990', accountTitle: 'Other Maintenance and Operating Expenses (MOOE)', actual: 8200000, budget: 18000000, remainingAmount: 9800000, remainingPercent: 54.44 },
    { id: 18, glCode: '1-07-05-010', accountTitle: 'Medical Equipment Outlay', actual: 12500000, budget: 35000000, remainingAmount: 22500000, remainingPercent: 64.29 }
];

// START: loadBudgetData - Fetch budget entries from API or mock figures with skeleton loading
async function loadBudgetData() {
    renderSkeletonTable(rowsPerPage || 10);
    const apiBase = getApiBasePath();
    try {
        const res = await fetch(`${apiBase}/api/budget/list.php?year=${selectedYear || getCurrentYearFromGlobal()}`, { credentials: 'same-origin' });
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            budgetRows = data.data.map((r) => ({
                id: r.id,
                glCode: r.gl_code || r.glCode,
                accountTitle: r.account_title || r.accountTitle,
                actual: Number(r.actual) || 0,
                budget: Number(r.budget) || 0,
                remainingAmount: Number(r.remainingAmount ?? r.remaining_amount ?? 0),
                remainingPercent: Number(r.remainingPercent ?? r.remaining_percent ?? 0),
            }));
        } else {
            budgetRows = MOCK_BUDGET_DATA.map((item) => ({ ...item }));
        }
    } catch {
        budgetRows = MOCK_BUDGET_DATA.map((item) => ({ ...item }));
    }
}
// END: loadBudgetData

// START: calculateRemaining - Calculate remaining budget amount and percentage
function calculateRemaining(actual, budget) {
    const remainingAmount = budget - actual;
    const remainingPercent = budget !== 0 ? (remainingAmount / budget) * 100 : 0;
    return { remainingAmount, remainingPercent };
}
// END: calculateRemaining

// START: handleAddClick - Open drawer to add a new budget entry
function handleAddClick() {
    const year = selectedYear || getCurrentYearFromGlobal();

    showBudgetCreateDrawer({
        year,
        onConfirm: async ({ glCode, accountTitle, actual, budget }) => {
            const apiBase = getApiBasePath();
            try {
                const res = await fetch(`${apiBase}/api/budget/create.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        year: selectedYear || getCurrentYearFromGlobal(),
                        glCode,
                        accountTitle,
                        actual: actual || 0,
                        budget,
                    }),
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.message || 'Failed to create entry');
                await loadBudgetData();
                currentPage = 1;
                renderTable();
                Swal.fire({
                    icon: 'success',
                    title: 'Entry added',
                    text: 'Budget entry has been added successfully.',
                    confirmButtonText: 'OK',
                    customClass: { confirmButton: `${sweetalertNeutralConfirmBlueClasses} cursor-pointer` },
                });
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.message || 'Failed to create entry',
                    confirmButtonText: 'OK',
                    customClass: { confirmButton: `${sweetalertNeutralConfirmBlueClasses} cursor-pointer` },
                });
            }
        },
    });
}
// END: handleAddClick

// START: handleCalculateClick - Calculate overall totals, preview CSV, and open calculation drawer
function handleCalculateClick() {
    const year = selectedYear || getCurrentYearFromGlobal();
    const { csvString, totals } = buildCsvAndTotals();

    showBudgetCalculateDrawer({
        year,
        csvString,
        totals,
    });
}
// END: handleCalculateClick

// START: bindEvents - Bind input search, sorting, sort direction toggles, and buttons
function bindEvents() {
    const searchInput = document.getElementById('budgetSearch');
    const sortSelect = document.getElementById('budgetSort');
    const sortDirectionBtn = document.getElementById('budgetSortDirection');
    const prevBtn = document.getElementById('budgetPrevPage');
    const nextBtn = document.getElementById('budgetNextPage');
    const calculateBtn = document.getElementById('budgetCalculateBtn');
    const addBtn = document.getElementById('budgetAddBtn');

    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const target = event.target;
            searchTerm = target.value || '';
            currentPage = 1;
            renderTable();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (event) => {
            const target = event.target;
            sortField = target.value || '';
            currentPage = 1;
            renderTable();
        });
    }

    if (sortDirectionBtn) {
        sortDirectionBtn.addEventListener('click', () => {
            // Toggle between asc (lowest first / accordion down) and desc (highest first / accordion up)
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            updateSortDirectionUI();
            currentPage = 1;
            renderTable();
        });
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

    if (calculateBtn) {
        calculateBtn.addEventListener('click', handleCalculateClick);
    }

    if (addBtn) {
        addBtn.addEventListener('click', handleAddClick);
    }
}
// END: bindEvents

// START: buildCsvAndTotals - Build CSV text representation and compute summary totals
function buildCsvAndTotals() {
    let totalActual = 0;
    let totalBudget = 0;
    let totalRemaining = 0;

    const header = ['G/L Code', 'Account Title', 'Actual', 'Budget', 'Remaining ₱', 'Remaining %'];
    const lines = [header.join(',')];

    budgetRows.forEach((row) => {
        const actual = Number(row.actual) || 0;
        const budget = Number(row.budget) || 0;
        const hasBudget = budget > 0;
        const remaining = Number(row.remainingAmount);
        const normalizedRemaining = hasBudget
            ? (Number.isFinite(remaining) ? remaining : (budget - actual) || 0)
            : 0;

        // Only include rows with a meaningful budget in totals
        if (hasBudget) {
            totalActual += actual;
            totalBudget += budget;
            totalRemaining += normalizedRemaining;
        }

        const csvRow = [
            `"${row.glCode}"`,
            `"${row.accountTitle.replace(/"/g, '""')}"`,
            formatCurrency(actual).replace('₱', 'PHP '),
            formatCurrency(budget).replace('₱', 'PHP '),
            // For CSV, keep remaining numeric for rows with budget, otherwise mark as '-'
            (hasBudget
                ? formatCurrency(normalizedRemaining).replace('₱', 'PHP ')
                : '-'),
            hasBudget ? formatPercent(row.remainingPercent || 0) : '-',
        ];

        lines.push(csvRow.join(','));
    });

    const overallRemainingPercent =
        totalBudget !== 0 ? (totalRemaining / totalBudget) * 100 : 0;

    const csvString = lines.join('\n');

    return {
        csvString,
        totals: {
            totalActual,
            totalBudget,
            totalRemaining,
            overallRemainingPercent,
        },
    };
}
// END: buildCsvAndTotals

// START: renderYearSelector - Populate and handle year dropdown options
function renderYearSelector() {
    const yearSelect = document.getElementById('budgetYear');
    if (!yearSelect) return;

    const currentYear = getCurrentYearFromGlobal();
    selectedYear = currentYear;

    // Generate years (current year ± 5 years)
    yearSelect.innerHTML = '';
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        option.selected = year === currentYear;
        yearSelect.appendChild(option);
    }

    yearSelect.addEventListener('change', async (e) => {
        selectedYear = parseInt(e.target.value);
        const headerYear = document.getElementById('budgetCurrentYear');
        const inlineYear = document.getElementById('budgetCurrentYearInline');
        if (headerYear) headerYear.textContent = String(selectedYear);
        if (inlineYear) inlineYear.textContent = String(selectedYear);
        await loadBudgetData();
        renderTable();
    });
}
// END: renderYearSelector

// START: applyYearBindings - Bind current year values to header & inline labels
function applyYearBindings() {
    const year = getCurrentYearFromGlobal();
    selectedYear = year;

    const headerYear = document.getElementById('budgetCurrentYear');
    const inlineYear = document.getElementById('budgetCurrentYearInline');

    if (headerYear) {
        headerYear.textContent = String(year);
    }
    if (inlineYear) {
        inlineYear.textContent = String(year);
    }
}
// END: applyYearBindings

// START: initInlineEditing - Initialize inline editing support for editable table cells
function initInlineEditing() {
    const editableCells = document.querySelectorAll('#budgetTableBody [data-editable]');

    editableCells.forEach((cell) => {
        const row = cell.closest('tr');
        const rowId = row?.getAttribute('data-row-id');
        const glCode = row?.getAttribute('data-gl-code') || '';
        const fieldName = cell.getAttribute('data-editable');
        const fieldType = cell.getAttribute('data-type') || 'text';

        const rowData = budgetRows.find((r) => (r.id && String(r.id) === rowId) || r.glCode === glCode);
        if (!rowData) return;

        initInlineEdit(cell, {
            type: fieldType,
            rowData: rowData,
            fieldName: fieldName,
            onSave: async (newValue, oldValue, rowData, fieldName) => {
                const previousVal = oldValue;
                if (fieldName === 'accountTitle') {
                    rowData.accountTitle = newValue;
                } else if (fieldName === 'budget') {
                    rowData.budget = parseFloat(newValue) || 0;
                    const remaining = calculateRemaining(rowData.actual, rowData.budget);
                    rowData.remainingAmount = remaining.remainingAmount;
                    rowData.remainingPercent = remaining.remainingPercent;
                } else return;

                const apiBase = getApiBasePath();
                try {
                    const body = fieldName === 'accountTitle' ? { id: rowData.id, accountTitle: newValue } : { id: rowData.id, budget: rowData.budget };
                    const res = await fetch(`${apiBase}/api/budget/update.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'same-origin',
                        body: JSON.stringify(body),
                    });
                    const data = await res.json();
                    if (!data.success) throw new Error(data.message);
                    await loadBudgetData();
                    renderTable();

                    showStackedToast({
                        title: 'Budget entry updated successfully.',
                        type: 'success',
                        cachePayload: { id: rowData.id, fieldName, previousVal },
                        duration: 5000,
                        onUndo: async () => {
                            try {
                                const revertBody = fieldName === 'accountTitle' ? { id: rowData.id, accountTitle: previousVal } : { id: rowData.id, budget: parseFloat(previousVal) || 0 };
                                const rollbackRes = await fetch(`${apiBase}/api/budget/update.php`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'same-origin',
                                    body: JSON.stringify(revertBody),
                                });
                                const rollbackData = await rollbackRes.json();
                                if (rollbackData.success) {
                                    if (fieldName === 'accountTitle') {
                                        rowData.accountTitle = previousVal;
                                    } else {
                                        rowData.budget = parseFloat(previousVal) || 0;
                                        const rollRem = calculateRemaining(rowData.actual, rowData.budget);
                                        rowData.remainingAmount = rollRem.remainingAmount;
                                        rowData.remainingPercent = rollRem.remainingPercent;
                                    }
                                    await loadBudgetData();
                                    renderTable();
                                }
                            } catch (revertErr) {
                                console.error('Failed to undo inline edit:', revertErr);
                            }
                        },
                    });
                } catch (err) {
                    rowData.accountTitle = fieldName === 'accountTitle' ? oldValue : rowData.accountTitle;
                    rowData.budget = fieldName === 'budget' ? (parseFloat(oldValue) || 0) : rowData.budget;
                    rowData.remainingAmount = rowData.budget - rowData.actual;
                    rowData.remainingPercent = rowData.budget !== 0 ? (rowData.remainingAmount / rowData.budget) * 100 : 0;
                    renderTable();
                }
            },
            onCancel: () => {}
        });
    });
}
// END: initInlineEditing

// START: init - Entry point for initializing budget page logic and event listeners
export async function init() {
    const table = document.getElementById('budgetTable');
    if (!table) return;

    if (typeof window !== 'undefined') {
        window.budgetRows = budgetRows;
    }

    applyYearBindings();
    renderYearSelector();
    updateSortDirectionUI();
    bindEvents();
    renderSkeletonTable(rowsPerPage || 10);
    await loadBudgetData();
    renderTable();
}
// END: init

// START: getBudgetData - Export getter function for accessing current budget dataset
export function getBudgetData() {
    return budgetRows;
}
// END: getBudgetData

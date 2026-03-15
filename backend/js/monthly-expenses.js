import Swal from 'sweetalert2';
import { showMonthlyExpensesDrawer } from './modules/drawer.js';
import { initInlineEdit } from './modules/inline-edit.js';
import {
    sweetalertActionsLeftAlignedClasses,
    sweetalertHtmlLeftAlignedClasses,
    sweetalertHtmlScrollableClasses,
    sweetalertNeutralCancelSlateClasses,
    sweetalertNeutralConfirmBlueClasses,
    sweetalertPopupBaseClasses,
    sweetalertPopupScrollableBaseClasses,
    sweetalertPrimaryConfirmClasses,
    sweetalertSecondaryCancelClasses,
} from './modules/modal.js';

// Monthly expenses data model (will be loaded from database)
let monthlyExpensesRows = [];

// State
let currentPage = 1;
const rowsPerPage = 10;
let searchTerm = '';
let selectedAccountTitle = '';
let selectedYear = new Date().getFullYear();

// Month names for display
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Month keys for data
const monthKeys = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
];

// Formatters
const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function getApiBasePath() {
    const path = window.location.pathname || '/';
    const idx = path.indexOf('/frontend/');
    return idx !== -1 ? path.substring(0, idx) : path.substring(0, path.lastIndexOf('/')) || '';
}

function getCurrentYearFromGlobal() {
    if (typeof window !== 'undefined' && typeof window.appCurrentYear === 'number') {
        return window.appCurrentYear;
    }
    return new Date().getFullYear();
}

async function triggerSyncFromItemized() {
    const apiBase = getApiBasePath();
    const year = selectedYear || getCurrentYearFromGlobal();
    try {
        await fetch(`${apiBase}/api/monthly-expenses/sync-from-itemized.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ year }),
        });
    } catch { /* ignore */ }
}

async function loadMonthlyExpensesData() {
    const apiBase = getApiBasePath();
    try {
        await triggerSyncFromItemized();
        const res = await fetch(`${apiBase}/api/monthly-expenses/list.php?year=${selectedYear || getCurrentYearFromGlobal()}`, { credentials: 'same-origin' });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
            monthlyExpensesRows = data.data;
        } else {
            monthlyExpensesRows = [];
        }
    } catch {
        monthlyExpensesRows = [];
    }
}

function formatCurrency(value) {
    if (value === null || value === undefined || value === '' || isNaN(value)) {
        return '₱0.00';
    }
    return currencyFormatter.format(value || 0);
}

function getFilteredRows() {
    const trimmed = searchTerm.trim().toLowerCase();
    let filtered = monthlyExpensesRows;

    // Filter by search term (Account Title or G/L Code)
    if (trimmed) {
        filtered = monthlyExpensesRows.filter((row) => {
            const gl = String(row.glCode || '').toLowerCase();
            const title = String(row.accountTitle || '').toLowerCase();
            return gl.includes(trimmed) || title.includes(trimmed);
        });
    }

    // Filter by selected account title
    if (selectedAccountTitle) {
        filtered = filtered.filter((row) => {
            return row.accountTitle === selectedAccountTitle;
        });
    }

    return filtered;
}

function calculateTotal(row) {
    const total = monthKeys.reduce((sum, month) => {
        return sum + (row.months[month] || 0);
    }, 0);
    return total;
}

function generateMiniChart(row) {
    const values = monthKeys.map(month => row.months[month] || 0);
    const maxValue = Math.max(...values, 1);
    const height = 40;
    
    const points = values.map((val, idx) => {
        const x = (idx / (values.length - 1)) * 100;
        const y = height - (val / maxValue) * height;
        return `${x},${y}`;
    }).join(' ');

    return `
        <svg class="w-full h-10" viewBox="0 0 100 ${height}" preserveAspectRatio="none">
            <polyline
                points="${points}"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                class="text-blue-500"
            />
        </svg>
    `;
}

function renderTable() {
    const tbody = document.getElementById('monthlyExpensesTableBody');
    const summaryEl = document.getElementById('monthlyExpensesPaginationSummary');

    if (!tbody || !summaryEl) return;

    const rows = getFilteredRows();
    const total = rows.length;
    const totalPages = total > 0 ? Math.ceil(total / rowsPerPage) : 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, total);
    const visibleRows = rows.slice(startIndex, endIndex);

    tbody.innerHTML = visibleRows
        .map((row, index) => {
            const isStriped = index % 2 === 1;

            return `
                <tr class="${isStriped ? 'bg-slate-50' : 'bg-white'} hover:bg-slate-100 transition-colors" data-row-index="${index}" data-gl-code="${row.glCode}" data-row-id="${row.id ?? ''}">
                    <td class="whitespace-nowrap px-3 py-2 text-xs md:text-sm font-medium text-slate-900 w-[80px] min-w-[80px]">
                        ${row.glCode}
                    </td>
                    <td class="px-3 py-2 text-xs md:text-sm text-slate-700 min-w-[200px]" data-editable="accountTitle" data-type="text" data-value="${row.accountTitle}">
                        ${row.accountTitle}
                    </td>
                    ${monthKeys.map(month => {
                        const value = row.months[month] || 0;
                        return `
                            <td class="whitespace-nowrap px-3 py-2 text-xs md:text-sm text-right text-slate-700" data-editable="month" data-month="${month}" data-type="currency" data-value="${value}">
                                ${value > 0 ? formatCurrency(value) : '-'}
                            </td>
                        `;
                    }).join('')}
                    <td class="px-3 py-2 text-center">
                        ${generateMiniChart(row)}
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
    
    // Initialize inline editing for editable cells
    initInlineEditing();
}

function renderPagination(total, totalPages) {
    const prevBtn = document.getElementById('monthlyExpensesPrevPage');
    const nextBtn = document.getElementById('monthlyExpensesNextPage');
    const numbersContainer = document.getElementById('monthlyExpensesPageNumbers');

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

function renderAccountTitleFilters() {
    const container = document.getElementById('accountTitleFilters');
    if (!container) return;

    // Get unique account titles
    const accountTitles = [...new Set(monthlyExpensesRows.map(row => row.accountTitle))].sort();
    
    container.innerHTML = '';

    // Add "All" option
    const allButton = document.createElement('button');
    allButton.type = 'button';
    allButton.textContent = 'All';
    allButton.className = `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
        selectedAccountTitle === ''
            ? 'bg-emerald-600 text-white'
            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
    }`;
    allButton.addEventListener('click', () => {
        selectedAccountTitle = '';
        currentPage = 1;
        renderAccountTitleFilters();
        renderTable();
    });
    container.appendChild(allButton);

    // Add account title buttons
    accountTitles.forEach(title => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = title.length > 30 ? title.substring(0, 30) + '...' : title;
        button.title = title;
        button.className = `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
            selectedAccountTitle === title
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
        }`;
        button.addEventListener('click', () => {
            selectedAccountTitle = title;
            currentPage = 1;
            renderAccountTitleFilters();
            renderTable();
        });
        container.appendChild(button);
    });
}

function renderYearSelector() {
    const yearSelect = document.getElementById('monthlyExpensesYear');
    if (!yearSelect) return;

    const currentYear = getCurrentYearFromGlobal();
    if (typeof selectedYear !== 'number' || selectedYear < 2000) selectedYear = currentYear;

    // Generate years (current year ± 5 years)
    yearSelect.innerHTML = '';
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        option.selected = year === selectedYear;
        yearSelect.appendChild(option);
    }

    yearSelect.addEventListener('change', async (e) => {
        selectedYear = parseInt(e.target.value);
        const yearDisplay = document.getElementById('monthlyExpensesCurrentYear');
        if (yearDisplay) yearDisplay.textContent = String(selectedYear);
        await loadMonthlyExpensesData();
        renderTable();
    });
}

function handleAddClick() {
    const year = selectedYear;

    showMonthlyExpensesDrawer({
        year,
        onConfirm: async ({ glCode, accountTitle, months }) => {
            const apiBase = getApiBasePath();
            try {
                const res = await fetch(`${apiBase}/api/monthly-expenses/create.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        year: selectedYear || getCurrentYearFromGlobal(),
                        glCode,
                        accountTitle,
                        months,
                    }),
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.message);
                await loadMonthlyExpensesData();
                currentPage = 1;
                renderTable();
                renderAccountTitleFilters();
                Swal.fire({
                    icon: 'success',
                    title: 'Entry added',
                    text: 'Monthly expense entry has been added successfully.',
                    confirmButtonText: 'OK',
                    customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses },
                });
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.message || 'Failed to create entry',
                    confirmButtonText: 'OK',
                    customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses },
                });
            }
        },
    });
}

function handleCalculateClick() {
    const year = selectedYear || getCurrentYearFromGlobal();
    
    // Get all unique account titles for the category dropdown
    const allAccountTitles = [...new Set(monthlyExpensesRows.map(row => row.accountTitle))].sort();
    
    // Generate category selection HTML
    const categoryHTML = `
        <div class="space-y-3 text-left text-sm">
            <div class="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label class="text-sm font-medium text-slate-700 whitespace-nowrap">Category</label>
                <select
                    id="swal-calculate-category"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796] cursor-pointer"
                >
                    <option value="all">All</option>
                    ${allAccountTitles.map(title => `<option value="${title}">${title}</option>`).join('')}
                </select>
            </div>
        </div>
    `;

    Swal.fire({
        title: `Calculate Monthly Expenses (${year})`,
        html: categoryHTML,
        width: 'auto',
        padding: '1rem',
        showCancelButton: true,
        confirmButtonText: 'Calculate',
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        customClass: {
            popup: sweetalertPopupBaseClasses,
            htmlContainer: sweetalertHtmlLeftAlignedClasses,
            confirmButton: sweetalertSecondaryCancelClasses,
            cancelButton: sweetalertNeutralCancelSlateClasses,
            actions: sweetalertActionsLeftAlignedClasses,
        },
        preConfirm: () => {
            const categorySelect = document.getElementById('swal-calculate-category');
            const selectedCategory = categorySelect ? categorySelect.value : 'all';
            
            // Filter rows based on selected category
            let rowsToCalculate = monthlyExpensesRows;
            if (selectedCategory !== 'all') {
                rowsToCalculate = monthlyExpensesRows.filter(row => row.accountTitle === selectedCategory);
            }

            // Calculate totals for each month
            const monthTotals = {};
            monthKeys.forEach(monthKey => {
                monthTotals[monthKey] = rowsToCalculate.reduce((sum, row) => {
                    return sum + (row.months[monthKey] || 0);
                }, 0);
            });

            // Calculate grand total
            const grandTotal = Object.values(monthTotals).reduce((sum, val) => sum + val, 0);

            // Generate results table HTML
            const resultsHTML = `
                <div class="space-y-3 text-left text-sm">
                    <div class="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p class="text-xs font-medium text-slate-600 mb-1">Category</p>
                        <p class="text-sm font-semibold text-slate-900">${selectedCategory === 'all' ? 'All Categories' : selectedCategory}</p>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-slate-200 text-sm">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Month</th>
                                    <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Amount</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-slate-100">
                                ${monthNames.map((month, index) => {
                                    const monthKey = monthKeys[index];
                                    const value = monthTotals[monthKey] || 0;
                                    return `
                                        <tr class="hover:bg-slate-50">
                                            <td class="px-3 py-2 text-sm font-medium text-slate-900">${month}</td>
                                            <td class="px-3 py-2 text-sm text-right text-slate-700">${value > 0 ? formatCurrency(value) : '-'}</td>
                                        </tr>
                                    `;
                                }).join('')}
                                <tr class="bg-slate-100 font-semibold">
                                    <td class="px-3 py-2 text-sm font-bold text-slate-900">TOTAL</td>
                                    <td class="px-3 py-2 text-sm text-right font-bold text-slate-900">${formatCurrency(grandTotal)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            // Show results in a new modal
            return Swal.fire({
                title: `Calculation Results (${year})`,
                html: resultsHTML,
                width: 'auto',
                padding: '1rem',
                confirmButtonText: 'Close',
                focusConfirm: false,
                customClass: {
                    popup: sweetalertPopupBaseClasses,
                    htmlContainer: sweetalertHtmlLeftAlignedClasses,
                    confirmButton: sweetalertNeutralConfirmBlueClasses,
                },
            });
        },
    });
}

function bindEvents() {
    const searchInput = document.getElementById('monthlyExpensesSearch');
    const prevBtn = document.getElementById('monthlyExpensesPrevPage');
    const nextBtn = document.getElementById('monthlyExpensesNextPage');
    const calculateBtn = document.getElementById('monthlyExpensesCalculateBtn');
    const addBtn = document.getElementById('monthlyExpensesAddBtn');

    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const target = event.target;
            searchTerm = target.value || '';
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
            const rows = getFilteredRows();
            const totalPages = rows.length > 0 ? Math.ceil(rows.length / rowsPerPage) : 1;
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

function applyYearBindings() {
    const year = getCurrentYearFromGlobal();
    selectedYear = year;

    const headerYear = document.getElementById('monthlyExpensesCurrentYear');
    if (headerYear) {
        headerYear.textContent = String(year);
    }
}

/**
 * Initialize inline editing for table cells
 */
function initInlineEditing() {
    const editableCells = document.querySelectorAll('#monthlyExpensesTableBody [data-editable]');
    
    editableCells.forEach(cell => {
        const row = cell.closest('tr');
        const rowId = row?.getAttribute('data-row-id');
        const glCode = row?.getAttribute('data-gl-code') || '';
        const fieldName = cell.getAttribute('data-editable');
        const fieldType = cell.getAttribute('data-type') || 'text';
        const monthKey = cell.getAttribute('data-month') || '';

        const rowData = monthlyExpensesRows.find(r => (r.id && String(r.id) === rowId) || r.glCode === glCode);
        if (!rowData) return;

        initInlineEdit(cell, {
            type: fieldType,
            rowData: rowData,
            fieldName: fieldName,
            onSave: async (newValue, oldValue, rowData, fieldName) => {
                if (fieldName === 'accountTitle') {
                    rowData.accountTitle = newValue;
                } else if (fieldName === 'month' && monthKey) {
                    rowData.months[monthKey] = parseFloat(newValue) || 0;
                    rowData.total = calculateTotal(rowData);
                } else return;

                const apiBase = getApiBasePath();
                const year = selectedYear || getCurrentYearFromGlobal();
                try {
                    if (!rowData.id) {
                        const res = await fetch(`${apiBase}/api/monthly-expenses/create.php`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'same-origin',
                            body: JSON.stringify({
                                year,
                                glCode: rowData.glCode,
                                accountTitle: rowData.accountTitle,
                                months: rowData.months,
                            }),
                        });
                        const data = await res.json();
                        if (!data.success) throw new Error(data.message);
                    } else {
                        const body = fieldName === 'accountTitle'
                            ? { id: rowData.id, accountTitle: newValue }
                            : { id: rowData.id, months: { ...rowData.months } };
                        const res = await fetch(`${apiBase}/api/monthly-expenses/update.php`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'same-origin',
                            body: JSON.stringify(body),
                        });
                        const data = await res.json();
                        if (!data.success) throw new Error(data.message);
                    }
                    await loadMonthlyExpensesData();
                } catch (err) {
                    if (fieldName === 'accountTitle') rowData.accountTitle = oldValue;
                    else if (monthKey) rowData.months[monthKey] = parseFloat(oldValue) || 0;
                    rowData.total = calculateTotal(rowData);
                }
                renderTable();
            },
            onCancel: () => {}
        });
    });
}

export async function init() {
    const table = document.getElementById('monthlyExpensesTable');
    if (!table) return;

    if (typeof window !== 'undefined') {
        window.monthlyExpensesRows = monthlyExpensesRows;
    }

    applyYearBindings();
    renderYearSelector();
    renderAccountTitleFilters();
    bindEvents();
    await loadMonthlyExpensesData();
    renderTable();
}

// Export getter function for accessing monthly expenses data
export function getMonthlyExpensesData() {
    return monthlyExpensesRows;
}

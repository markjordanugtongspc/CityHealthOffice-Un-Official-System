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

// Budget data model (will be loaded from database)
let budgetRows = [];

// State
let currentPage = 1;
const rowsPerPage = 10;
let sortField = '';
let sortDirection = 'desc';
let searchTerm = '';
let selectedYear = new Date().getFullYear();

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

    // Default sort: always by G/L Code ascending (numeric) when no explicit sort is chosen
    if (!sortField) {
        return [...filtered].sort((a, b) => {
            const aGl = Number(a.glCode) || 0;
            const bGl = Number(b.glCode) || 0;
            return aGl - bGl;
        });
    }

    const sorted = [...filtered].sort((a, b) => {
        const aVal = Number(a[sortField]) || 0;
        const bVal = Number(b[sortField]) || 0;

        if (sortDirection === 'asc') {
            return aVal - bVal;
        }
        return bVal - aVal;
    });

    return sorted;
}

function formatCurrency(value) {
    return currencyFormatter.format(value || 0);
}

function formatPercent(value) {
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value || 0);
    return `${sign}${percentFormatter.format(abs)}%`;
}

function renderTable() {
    const tbody = document.getElementById('budgetTableBody');
    const summaryEl = document.getElementById('budgetPaginationSummary');

    if (!tbody || !summaryEl) return;

    const rows = getFilteredAndSortedRows();
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

            const remainingAmountDisplay = hasBudget ? formatCurrency(remainingAmount) : '-';
            const remainingPercentDisplay = hasBudget ? formatPercent(row.remainingPercent || 0) : '-';

            return `
                <tr class="${isStriped ? 'bg-slate-50' : 'bg-white'} hover:bg-slate-100 transition-colors" data-row-index="${index}" data-gl-code="${row.glCode}" data-row-id="${row.id ?? ''}">
                    <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm font-medium text-slate-900">
                        ${row.glCode}
                    </td>
                    <td class="px-4 py-2 text-xs md:text-sm text-slate-700" data-editable="accountTitle" data-type="text" data-value="${row.accountTitle}">
                        ${row.accountTitle}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm text-right text-slate-700">
                        ${formatCurrency(row.actual)}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm text-right text-slate-700">
                        ${formatCurrency(row.budget)}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm text-right font-semibold ${remainingClass}">
                        ${remainingAmountDisplay}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm text-right font-semibold ${remainingClass}">
                        ${remainingPercentDisplay}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2 text-center">
                        <button
                            type="button"
                            class="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                            data-action="edit-row"
                            data-row-id="${row.id ?? ''}"
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

    if (total === 0) {
        summaryEl.textContent = 'Showing 0 to 0 of 0 entries';
    } else {
        summaryEl.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${total} entries`;
    }

    renderPagination(total, totalPages);

    // Bind edit buttons
    tbody.querySelectorAll('button[data-action="edit-row"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const rowId = btn.getAttribute('data-row-id');
            const rowData = budgetRows.find(r => String(r.id) === String(rowId));
            if (rowData) {
                openBudgetEditModal(rowData);
            }
        });
    });
}

function parseCurrencyInput(raw) {
    if (!raw) return 0;
    const cleaned = String(raw).replace(/[^0-9.-]/g, '').replace(/,/g, '');
    const num = parseFloat(cleaned);
    return Number.isNaN(num) ? 0 : num;
}

function formatPlainCurrencyNumber(value) {
    const num = parseFloat(value || 0);
    return num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function openBudgetEditModal(row) {
    const year = selectedYear || getCurrentYearFromGlobal();

    Swal.fire({
        title: `Edit Budget Entry (${row.glCode})`,
        html: `
            <div class="space-y-4 text-left">
                <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">Account Title</label>
                    <input
                        id="swal-edit-accountTitle"
                        type="text"
                        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796]"
                        value="${row.accountTitle || ''}"
                    />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p class="block text-xs font-medium text-slate-500 mb-1">Actual (₱)</p>
                        <p class="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                            ${formatPlainCurrencyNumber(row.actual)}
                        </p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-500 mb-1">Budget (₱)</label>
                        <input
                            id="swal-edit-budget"
                            type="text"
                            inputmode="decimal"
                            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value="${formatPlainCurrencyNumber(row.budget)}"
                        />
                    </div>
                </div>
            </div>
        `,
        width: '28rem',
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        customClass: {
            popup: sweetalertPopupBaseClasses,
            htmlContainer: sweetalertHtmlLeftAlignedClasses,
            confirmButton: sweetalertPrimaryConfirmClasses,
            cancelButton: sweetalertSecondaryCancelClasses,
            actions: sweetalertActionsLeftAlignedClasses,
        },
        focusConfirm: false,
        didOpen: () => {
            const accountTitleInput = document.getElementById('swal-edit-accountTitle');
            const budgetInput = document.getElementById('swal-edit-budget');
            const attachBlurFormatter = (input) => {
                if (!input) return;
                input.addEventListener('blur', () => {
                    const parsed = parseCurrencyInput(input.value);
                    input.value = formatPlainCurrencyNumber(parsed);
                });
            };
            attachBlurFormatter(budgetInput);
            if (accountTitleInput) {
                accountTitleInput.focus();
                accountTitleInput.selectionStart = accountTitleInput.value.length;
            }
        },
        preConfirm: () => {
            const accountTitle = document.getElementById('swal-edit-accountTitle')?.value?.trim() ?? '';
            const budgetStr = document.getElementById('swal-edit-budget')?.value ?? '';
            const budget = parseCurrencyInput(budgetStr);

            if (!accountTitle) {
                Swal.showValidationMessage('Account Title is required');
                return false;
            }

            // Allow budget to be 0. Only disallow negative values.
            if (budget < 0) {
                Swal.showValidationMessage('Budget cannot be negative');
                return false;
            }

            return { accountTitle, budget };
        },
    }).then(async (result) => {
        if (!result.isConfirmed || !result.value) return;

        const apiBase = getApiBasePath();
        try {
            const res = await fetch(`${apiBase}/api/budget/update.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({
                    id: row.id,
                    accountTitle: result.value.accountTitle,
                    budget: result.value.budget,
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || 'Failed to update entry');

            // Update local row
            row.accountTitle = result.value.accountTitle;
            row.budget = result.value.budget;
            const remaining = calculateRemaining(row.actual, row.budget);
            row.remainingAmount = remaining.remainingAmount;
            row.remainingPercent = remaining.remainingPercent;

            renderTable();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to save changes',
                confirmButtonText: 'OK',
                customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses },
            });
        }
    });
}

function renderPagination(total, totalPages) {
    const prevBtn = document.getElementById('budgetPrevPage');
    const nextBtn = document.getElementById('budgetNextPage');
    const numbersContainer = document.getElementById('budgetPageNumbers');

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

async function loadBudgetData() {
    const apiBase = getApiBasePath();
    try {
        const res = await fetch(`${apiBase}/api/budget/list.php?year=${selectedYear || getCurrentYearFromGlobal()}`, { credentials: 'same-origin' });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
            budgetRows = data.data.map(r => ({
                id: r.id,
                glCode: r.gl_code || r.glCode,
                accountTitle: r.account_title || r.accountTitle,
                actual: r.actual ?? 0,
                budget: r.budget ?? 0,
                remainingAmount: r.remainingAmount ?? r.remaining_amount ?? 0,
                remainingPercent: r.remainingPercent ?? r.remaining_percent ?? 0,
            }));
        } else {
            budgetRows = [];
        }
    } catch {
        budgetRows = [];
    }
}

function calculateRemaining(actual, budget) {
    const remainingAmount = budget - actual;
    const remainingPercent = budget !== 0 ? (remainingAmount / budget) * 100 : 0;
    return { remainingAmount, remainingPercent };
}

function handleAddClick() {
    const year = selectedYear || getCurrentYearFromGlobal();

    Swal.fire({
        title: `Initialize Budget Entry [${year}]`,
        html: `
            <div class="text-left space-y-8 p-1 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <!-- Group 1: Identity -->
                <div class="space-y-4">
                    <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div class="w-2 h-6 bg-[#224796] rounded-full"></div>
                        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">Account Identification</h3>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="space-y-1.5">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">G/L Account Code <span class="text-rose-500">*</span></label>
                            <input type="text" id="swal-glCode" placeholder="e.g. 1011" 
                                class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-[#224796]/10 focus:border-[#224796] transition-all outline-hidden font-mono">
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Account Title <span class="text-slate-400">(optional)</span></label>
                            <div class="relative">
                                <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                                </span>
                                <input type="text" id="swal-accountTitle" placeholder="Type to search (e.g. Trave...)"
                                    autocomplete="off" class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-[#224796]/10 focus:border-[#224796] transition-all outline-hidden">
                                <div id="swal-accountTitle-suggestions" class="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg hidden">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Group 2: Financial Caps -->
                <div class="space-y-4">
                    <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div class="w-2 h-6 bg-emerald-500 rounded-full"></div>
                        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">Financial Allocation</h3>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="space-y-1.5 md:col-span-2">
                            <p class="text-[10px] text-slate-500">Actual is computed from Monthly Expenses</p>
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Budget Allocation (₱) <span class="text-rose-500">*</span></label>
                            <div class="relative">
                                <span class="absolute left-4 top-2.5 text-slate-400 text-sm font-bold">₱</span>
                                <input type="number" step="0.01" id="swal-budget" placeholder="0.00"
                                    class="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-hidden text-[#224796]">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Live Summary Calculation -->
                <div class="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl space-y-4 shadow-xl border border-white/5">
                    <div class="flex items-center gap-2">
                        <div class="w-1.5 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
                        <h3 class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Real-time Utilization Summary</h3>
                    </div>
                    <div class="grid grid-cols-2 gap-8">
                        <div class="space-y-1">
                            <p class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest opacity-80">Remaining Balance</p>
                            <p id="swal-remaining-amount" class="text-2xl font-black text-white tracking-tight">₱0.00</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest opacity-80">Utilization Efficiency</p>
                            <p id="swal-remaining-percent" class="text-2xl font-black text-white tracking-tight">0.00%</p>
                        </div>
                    </div>
                </div>
            </div>
        `,
        width: '42rem',
        showCancelButton: true,
        confirmButtonText: 'Add Entry',
        cancelButtonText: 'Dismiss',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#64748b',
        customClass: {
            popup: `${sweetalertPopupBaseClasses} max-w-2xl rounded-3xl`,
            title: 'text-2xl font-black text-slate-900 mt-6 tracking-tight',
            htmlContainer: sweetalertHtmlLeftAlignedClasses,
            confirmButton: `inline-flex items-center px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:shadow-lg transition-all cursor-pointer m-2`,
            cancelButton: `inline-flex items-center px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all cursor-pointer m-2`,
        },
        buttonsStyling: false,
        focusConfirm: false,
        didOpen: () => {
            const budgetInput = document.getElementById('swal-budget');
            const remainingAmountEl = document.getElementById('swal-remaining-amount');
            const remainingPercentEl = document.getElementById('swal-remaining-percent');
            const accountTitleInput = document.getElementById('swal-accountTitle');
            const suggestionsEl = document.getElementById('swal-accountTitle-suggestions');
            const glCodeInput = document.getElementById('swal-glCode');

            const updateRemaining = () => {
                const actual = 0;
                const budget = parseFloat(budgetInput?.value) || 0;
                const { remainingAmount, remainingPercent } = calculateRemaining(actual, budget);
                remainingAmountEl.textContent = formatCurrency(remainingAmount);
                remainingPercentEl.textContent = formatPercent(remainingPercent);
                remainingAmountEl.className = remainingAmount < 0 ? 'text-2xl font-black text-rose-400 tracking-tight' : 'text-2xl font-black text-white tracking-tight';
                remainingPercentEl.className = remainingAmount < 0 ? 'text-2xl font-black text-rose-400 tracking-tight' : 'text-2xl font-black text-white tracking-tight';
            };
            if (budgetInput) budgetInput.addEventListener('input', updateRemaining);

            const apiBase = getApiBasePath();
            const showSuggestions = (q) => {
                if (!suggestionsEl) return;
                fetch(`${apiBase}/api/account-titles/search.php?q=${encodeURIComponent(q || '')}`)
                    .then(r => r.json())
                    .then(res => {
                        if (!res.success || !res.data) return;
                        suggestionsEl.innerHTML = res.data.map(item => {
                            const gl = String(item.gl_code || '');
                            const title = String(item.account_title || '');
                            const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                            return `<div class="px-4 py-2.5 hover:bg-slate-100 cursor-pointer text-sm text-slate-700 border-b border-slate-100 last:border-b-0 transition-colors flex items-center gap-2" data-gl="${esc(gl)}" data-title="${esc(title)}"><svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg><span>${gl} - ${esc(title)}</span></div>`;
                        }).join('');
                        suggestionsEl.classList.remove('hidden');
                        suggestionsEl.querySelectorAll('[data-gl]').forEach(el => {
                            el.addEventListener('click', () => {
                                glCodeInput.value = el.dataset.gl || '';
                                accountTitleInput.value = el.dataset.title || '';
                                suggestionsEl.classList.add('hidden');
                            });
                        });
                    })
                    .catch(() => { suggestionsEl.classList.add('hidden'); });
            };

            let debounceTimer;
            if (accountTitleInput) {
                accountTitleInput.addEventListener('input', () => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => showSuggestions(accountTitleInput.value.trim()), 150);
                });
                accountTitleInput.addEventListener('focus', () => {
                    if (accountTitleInput.value.trim()) showSuggestions(accountTitleInput.value.trim());
                    else showSuggestions('');
                });
            }
            document.addEventListener('click', (e) => {
                if (suggestionsEl && !suggestionsEl.contains(e.target) && e.target !== accountTitleInput) suggestionsEl.classList.add('hidden');
            });
        },
        preConfirm: () => {
            const glCode = document.getElementById('swal-glCode')?.value?.trim();
            const accountTitle = document.getElementById('swal-accountTitle')?.value?.trim();
            const budgetInput = document.getElementById('swal-budget')?.value;
            const budget = parseCurrencyInput(budgetInput);

            if (!glCode) {
                Swal.showValidationMessage('G/L Code is required');
                return false;
            }

            // Budget is allowed to be 0. We only require it to be non-negative.
            if (budget < 0) {
                Swal.showValidationMessage('Budget cannot be negative');
                return false;
            }

            return { glCode, accountTitle: accountTitle || glCode, budget };
        },
    }).then(async (result) => {
        if (result.isConfirmed && result.value) {
            const apiBase = getApiBasePath();
            try {
                const res = await fetch(`${apiBase}/api/budget/create.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        year: selectedYear || getCurrentYearFromGlobal(),
                        glCode: result.value.glCode,
                        accountTitle: result.value.accountTitle,
                        actual: 0,
                        budget: result.value.budget,
                    }),
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.message || 'Failed to create entry');
                await loadBudgetData();
                currentPage = 1;
                renderTable();
                Swal.fire({ icon: 'success', title: 'Entry added', text: 'Budget entry has been added successfully.', confirmButtonText: 'OK', customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses } });
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to create entry', confirmButtonText: 'OK', customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses } });
            }
        }
    });
}

function handleCalculateClick() {
    const year = selectedYear || getCurrentYearFromGlobal();
    const { csvString, totals } = buildCsvAndTotals();

    const html = `
        <div class="space-y-4 text-left text-sm">
            <div class="grid gap-3 rounded-lg bg-slate-50 p-3 md:grid-cols-4">
                <div>
                    <p class="text-xs font-medium text-slate-500">Total Actual</p>
                    <p class="text-sm font-semibold text-slate-900">${formatCurrency(totals.totalActual)}</p>
                </div>
                <div>
                    <p class="text-xs font-medium text-slate-500">Total Budget</p>
                    <p class="text-sm font-semibold text-slate-900">${formatCurrency(totals.totalBudget)}</p>
                </div>
                <div>
                    <p class="text-xs font-medium text-slate-500">Remaining ₱</p>
                    <p class="text-sm font-semibold ${totals.totalRemaining < 0
            ? 'text-red-600'
            : totals.totalRemaining > 0
                ? 'text-emerald-600'
                : 'text-slate-900'
        }">
                        ${formatCurrency(totals.totalRemaining)}
                    </p>
                </div>
                <div>
                    <p class="text-xs font-medium text-slate-500">Remaining %</p>
                    <p class="text-sm font-semibold ${totals.overallRemainingPercent < 0
            ? 'text-red-600'
            : totals.overallRemainingPercent > 0
                ? 'text-emerald-600'
                : 'text-slate-900'
        }">
                        ${formatPercent(totals.overallRemainingPercent)}
                    </p>
                </div>
            </div>
            <div>
                <p class="mb-1 text-xs font-medium text-slate-500">
                    CSV Preview (all rows)
                </p>
                <div class="max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50">
                    <pre class="whitespace-pre text-xs p-3 text-slate-800">${csvString
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')}</pre>
                </div>
            </div>
        </div>
    `;

    Swal.fire({
        title: `Budget Summary (${year})`,
        html,
        width: '60rem',
        confirmButtonText: 'Copy CSV',
        showCancelButton: true,
        cancelButtonText: 'Close',
        focusConfirm: false,
        customClass: {
            popup: sweetalertPopupBaseClasses,
            confirmButton: sweetalertNeutralConfirmBlueClasses,
            cancelButton: sweetalertSecondaryCancelClasses,
        },
        didOpen: () => {
            const popup = Swal.getPopup();
            if (popup) {
                popup.classList.add('!p-0', 'md:!p-0');
            }
        },
        preConfirm: async () => {
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(csvString);
                }
                return true;
            } catch {
                return false;
            }
        },
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: 'success',
                title: 'CSV copied',
                text: 'Budget data has been copied to your clipboard.',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: sweetalertNeutralConfirmBlueClasses,
                },
            });
        }
    });
}

function bindEvents() {
    const searchInput = document.getElementById('budgetSearch');
    const sortSelect = document.getElementById('budgetSort');
    const sortDirectionBtn = document.getElementById('budgetSortDirection');
    const sortDirectionIcon = document.getElementById('budgetSortDirectionIcon');
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

    if (sortDirectionBtn && sortDirectionIcon) {
        sortDirectionBtn.addEventListener('click', () => {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            sortDirectionIcon.style.transform = sortDirection === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)';
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

/**
 * Initialize inline editing for table cells
 */
function initInlineEditing() {
    const editableCells = document.querySelectorAll('#budgetTableBody [data-editable]');

    editableCells.forEach(cell => {
        const row = cell.closest('tr');
        const rowId = row?.getAttribute('data-row-id');
        const glCode = row?.getAttribute('data-gl-code') || '';
        const fieldName = cell.getAttribute('data-editable');
        const fieldType = cell.getAttribute('data-type') || 'text';

        const rowData = budgetRows.find(r => (r.id && String(r.id) === rowId) || r.glCode === glCode);
        if (!rowData) return;

        initInlineEdit(cell, {
            type: fieldType,
            rowData: rowData,
            fieldName: fieldName,
            onSave: async (newValue, oldValue, rowData, fieldName) => {
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
                } catch (err) {
                    rowData.accountTitle = fieldName === 'accountTitle' ? oldValue : rowData.accountTitle;
                    rowData.budget = fieldName === 'budget' ? (parseFloat(oldValue) || 0) : rowData.budget;
                    rowData.remainingAmount = rowData.budget - rowData.actual;
                    rowData.remainingPercent = rowData.budget !== 0 ? (rowData.remainingAmount / rowData.budget) * 100 : 0;
                }
                renderTable();
            },
            onCancel: () => {}
        });
    });
}

export async function init() {
    const table = document.getElementById('budgetTable');
    if (!table) return;

    if (typeof window !== 'undefined') {
        window.budgetRows = budgetRows;
    }

    applyYearBindings();
    renderYearSelector();
    bindEvents();
    await loadBudgetData();
    renderTable();
}

// Export getter function for accessing budget data
export function getBudgetData() {
    return budgetRows;
}

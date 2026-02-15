import Swal from 'sweetalert2';
import { showDailyTransactionViewModal, showDailyTransactionEditModal, showVoucherModal } from './modules/modal.js';
import { getVoucherCookieData } from './modules/voucher.js';
import {
    sweetalertActionsLeftAlignedClasses,
    sweetalertHtmlLeftAlignedClasses,
    sweetalertNeutralConfirmBlueClasses,
    sweetalertPopupBaseClasses,
    sweetalertPrimaryConfirmClasses,
    sweetalertSecondaryCancelClasses,
} from './modules/modal.js';

// Transaction data model (will be loaded from database)
let transactionRows = [];

// State
let currentPage = 1;
const rowsPerPage = 10;
let sortField = '';
let sortDirection = 'desc';
let searchTerm = '';
let requestedByFilter = '';
let payeeFilter = '';
let selectedYear = new Date().getFullYear();

function getApiBasePath() {
    const path = window.location.pathname || '/';
    const idx = path.indexOf('/frontend/');
    return idx !== -1 ? path.substring(0, idx) : path.substring(0, path.lastIndexOf('/')) || '';
}

async function loadItemizedData() {
    const apiBase = getApiBasePath();
    try {
        const res = await fetch(`${apiBase}/api/itemized/list.php?year=${selectedYear}`, { credentials: 'same-origin' });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
            transactionRows = data.data;
        } else {
            transactionRows = [];
        }
    } catch {
        transactionRows = [];
    }
}

async function triggerMonthlySync() {
    const apiBase = getApiBasePath();
    try {
        await fetch(`${apiBase}/api/monthly-expenses/sync-from-itemized.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ year: selectedYear }),
        });
    } catch { /* ignore */ }
}

// Formatters
const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function formatCurrency(value) {
    return currencyFormatter.format(value || 0);
}

function getFilteredAndSortedRows() {
    const trimmed = searchTerm.trim().toLowerCase();

    // Filter out archived transactions
    let filtered = transactionRows.filter(row => !row.archived);

    // Search filter
    if (trimmed) {
        filtered = filtered.filter((row) => {
            const gl = String(row.glCode || '').toLowerCase();
            const dvNo = String(row.dvNo || '').toLowerCase();
            const requestedBy = String(row.requestedBy || '').toLowerCase();
            const payee = String(row.payee || '').toLowerCase();
            return gl.includes(trimmed) || dvNo.includes(trimmed) || requestedBy.includes(trimmed) || payee.includes(trimmed);
        });
    }

    // Category filters
    if (requestedByFilter) {
        filtered = filtered.filter((row) => row.requestedBy === requestedByFilter);
    }
    if (payeeFilter) {
        filtered = filtered.filter((row) => row.payee === payeeFilter);
    }

    if (!sortField) {
        return filtered;
    }

    const sorted = [...filtered].sort((a, b) => {
        let aVal, bVal;

        if (sortField === 'dvDate' || sortField === 'fileDate') {
            aVal = new Date(a[sortField] || 0).getTime();
            bVal = new Date(b[sortField] || 0).getTime();
        } else if (sortField === 'checkAmount' || sortField === 'mooe' || sortField === 'spf') {
            aVal = Number(a[sortField]) || 0;
            bVal = Number(b[sortField]) || 0;
        } else {
            aVal = String(a[sortField] || '').toLowerCase();
            bVal = String(b[sortField] || '').toLowerCase();
        }

        if (sortDirection === 'asc') {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    });

    return sorted;
}

function renderTable() {
    const tbody = document.getElementById('itemizedTableBody');
    const summaryEl = document.getElementById('itemizedPaginationSummary');

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
            const rowId = row.id || `row-${index}`;

            return `
                <tr class="${isStriped ? 'bg-slate-50' : 'bg-white'} hover:bg-slate-100 transition-colors cursor-pointer" data-row-id="${rowId}" data-transaction-index="${index}">
                    <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm font-medium text-slate-900">
                        ${row.glCode || '1000'}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm text-slate-700">
                        ${row.dvDate || ''}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm text-slate-700">
                        ${row.dvNo || 'MOOE2025-01-0000'}
                    </td>
                    <td class="px-4 py-2 text-xs md:text-sm text-slate-700">
                        ${row.requestedBy || ''}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm text-right font-semibold text-slate-900">
                        ${formatCurrency(row.checkAmount || 0)}
                    </td>
                    <td class="px-4 py-2 text-xs md:text-sm text-slate-700">
                        ${row.payee || ''}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm text-center">
                        <div class="flex items-center justify-center gap-2">
                            <button
                                data-action="edit"
                                data-row-id="${rowId}"
                                class="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit"
                                type="button"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button
                                data-action="archive"
                                data-row-id="${rowId}"
                                class="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="Archive"
                                type="button"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                                </svg>
                            </button>
                        </div>
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

    // Add click handlers to rows for view modal
    tbody.querySelectorAll('tr[data-transaction-index]').forEach((tr) => {
        tr.addEventListener('click', (e) => {
            // Don't trigger if clicking action buttons
            if (e.target.closest('button[data-action]')) {
                return;
            }
            const index = parseInt(tr.getAttribute('data-transaction-index'));
            const row = visibleRows[index];
            if (row) {
                showDailyTransactionViewModal(row);
            }
        });
    });

    // Add click handlers for action buttons
    tbody.querySelectorAll('button[data-action="edit"]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tr = btn.closest('tr');
            const index = parseInt(tr.getAttribute('data-transaction-index'));
            const row = visibleRows[index];
            if (row) {
                // Find the full row data from transactionRows to preserve ID
                const fullRow = transactionRows.find(r =>
                    r.id === row.id ||
                    (r.glCode === row.glCode && r.dvNo === row.dvNo)
                ) || row;
                fullRow._year = selectedYear;
                showDailyTransactionEditModal(fullRow, handleSaveTransaction);
            }
        });
    });

    tbody.querySelectorAll('button[data-action="archive"]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const rowId = btn.getAttribute('data-row-id');
            handleArchiveTransaction(rowId);
        });
    });
}

function renderPagination(total, totalPages) {
    const prevBtn = document.getElementById('itemizedPrevPage');
    const nextBtn = document.getElementById('itemizedNextPage');
    const numbersContainer = document.getElementById('itemizedPageNumbers');

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

function getNextDvNoFromRows() {
    const year = selectedYear;
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const prefix = `MOOE${year}-${month}-`;
    const matching = transactionRows
        .filter(r => (r.dvNo || '').startsWith(prefix))
        .map(r => {
            const m = (r.dvNo || '').match(/-(\d+)$/);
            return m ? parseInt(m[1]) : 0;
        });
    const max = matching.length > 0 ? Math.max(...matching) : -1;
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

function handleAddClick() {
    const today = new Date().toISOString().split('T')[0];
    const voucher = getVoucherCookieData();
    const newTransaction = {
        glCode: '1000',
        dvDate: voucher?.dvDate || today,
        dvNo: voucher?.dvNo || getNextDvNoFromRows(),
        requestedBy: voucher?.payee || '',
        checkAmount: voucher?.checkAmount != null ? String(voucher.checkAmount) : '',
        payee: voucher?.payee || '',
        particulars: voucher?.particulars || '',
        checkNo: '',
        fileDate: today,
        mooe: '',
        spf: '',
        mcpFacility: '',
        konsultaFacility: '',
        konsultaPf: ''
    };
    newTransaction._year = selectedYear;
    showDailyTransactionEditModal(newTransaction, handleSaveTransaction);
}

async function handleSaveTransaction(transactionData) {
    if (!transactionData) return;

    const apiBase = getApiBasePath();
    const payload = {
        year: selectedYear,
        glCode: transactionData.glCode,
        dvDate: transactionData.dvDate,
        dvNo: transactionData.dvNo,
        requestedBy: transactionData.requestedBy,
        payee: transactionData.payee,
        checkAmount: transactionData.checkAmount,
        particulars: transactionData.particulars,
        checkNo: transactionData.checkNo,
        fileDate: transactionData.fileDate,
        mooe: transactionData.mooe,
        spf: transactionData.spf,
        mcpFacility: transactionData.mcpFacility,
        konsultaFacility: transactionData.konsultaFacility,
        konsultaPf: transactionData.konsultaPf,
    };

    const isAddAllocation = !!transactionData.addAllocationMode;

    try {
        if (isAddAllocation && transactionData.id) {
            const res = await fetch(`${apiBase}/api/itemized/add-allocation.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
        } else if (transactionData.id && Number(transactionData.id)) {
            const res = await fetch(`${apiBase}/api/itemized/update.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ ...payload, id: transactionData.id }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
        } else {
            const res = await fetch(`${apiBase}/api/itemized/create.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
        }
        await triggerMonthlySync();
        await loadItemizedData();
        currentPage = 1;
        updateFilterDropdowns();
        renderTable();
        const msg = isAddAllocation ? 'Allocation log added' : (transactionData.id ? 'Transaction updated' : 'Transaction added');
        Swal.fire({
            icon: 'success',
            title: msg,
            text: 'Data has been saved successfully.',
            confirmButtonText: 'OK',
            customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses },
        });
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.message || 'Failed to save',
            confirmButtonText: 'OK',
            customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses },
        });
    }
}

function handleArchiveTransaction(rowId) {
    Swal.fire({
        title: 'Archive Transaction?',
        text: 'This transaction will be archived. You can restore it later if needed.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Archive',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#64748b',
        customClass: {
            popup: sweetalertPopupBaseClasses,
            confirmButton: `${sweetalertNeutralConfirmBlueClasses} bg-amber-600 hover:bg-amber-700`,
            cancelButton: sweetalertSecondaryCancelClasses,
        },
    }).then(async (result) => {
        if (result.isConfirmed) {
            const id = parseInt(rowId, 10);
            if (!id || isNaN(id)) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Invalid transaction', confirmButtonText: 'OK', customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses } });
                return;
            }
            const apiBase = getApiBasePath();
            try {
                const res = await fetch(`${apiBase}/api/itemized/archive.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ id }),
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.message);
                await triggerMonthlySync();
                await loadItemizedData();
                currentPage = 1;
                updateFilterDropdowns();
                renderTable();
                Swal.fire({ icon: 'success', title: 'Archived', text: 'Transaction has been archived successfully.', confirmButtonText: 'OK', customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses } });
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to archive', confirmButtonText: 'OK', customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses } });
            }
        }
    });
}



function updateFilterDropdowns() {
    // Get unique Requested By values (excluding archived)
    const requestedByValues = [...new Set(transactionRows.filter(r => !r.archived).map(r => r.requestedBy).filter(Boolean))].sort();
    const requestedBySelect = document.getElementById('itemizedRequestedByFilter');
    if (requestedBySelect) {
        const currentValue = requestedBySelect.value;
        requestedBySelect.innerHTML = '<option value="">All</option>' +
            requestedByValues.map(val => `<option value="${val}" ${val === currentValue ? 'selected' : ''}>${val}</option>`).join('');
    }

    // Get unique Payee values (excluding archived)
    const payeeValues = [...new Set(transactionRows.filter(r => !r.archived).map(r => r.payee).filter(Boolean))].sort();
    const payeeSelect = document.getElementById('itemizedPayeeFilter');
    if (payeeSelect) {
        const currentValue = payeeSelect.value;
        payeeSelect.innerHTML = '<option value="">All</option>' +
            payeeValues.map(val => `<option value="${val}" ${val === currentValue ? 'selected' : ''}>${val}</option>`).join('');
    }
}

function renderYearSelector() {
    const yearSelect = document.getElementById('itemizedYear');
    if (!yearSelect) return;

    const currentYear = typeof window.appCurrentYear === 'number' ? window.appCurrentYear : new Date().getFullYear();
    selectedYear = currentYear;

    yearSelect.innerHTML = '';
    for (let y = currentYear + 2; y >= currentYear - 5; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        opt.selected = y === currentYear;
        yearSelect.appendChild(opt);
    }

    yearSelect.addEventListener('change', async (e) => {
        selectedYear = parseInt(e.target.value);
        await loadItemizedData();
        updateFilterDropdowns();
        renderTable();
    });
}

function bindEvents() {
    const searchInput = document.getElementById('itemizedSearch');
    const prevBtn = document.getElementById('itemizedPrevPage');
    const nextBtn = document.getElementById('itemizedNextPage');
    const addBtn = document.getElementById('itemizedAddBtn');

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
            const rows = getFilteredAndSortedRows();
            const totalPages = rows.length > 0 ? Math.ceil(rows.length / rowsPerPage) : 1;
            if (currentPage >= totalPages) return;
            currentPage += 1;
            renderTable();
        });
    }

    const requestedByFilterEl = document.getElementById('itemizedRequestedByFilter');
    if (requestedByFilterEl) {
        requestedByFilterEl.addEventListener('change', (event) => {
            requestedByFilter = event.target.value || '';
            currentPage = 1;
            renderTable();
        });
    }

    const payeeFilterEl = document.getElementById('itemizedPayeeFilter');
    if (payeeFilterEl) {
        payeeFilterEl.addEventListener('change', (event) => {
            payeeFilter = event.target.value || '';
            currentPage = 1;
            renderTable();
        });
    }

    if (addBtn) {
        addBtn.addEventListener('click', handleAddClick);
    }

    const voucherFloatingBtn = document.getElementById('itemizedVoucherFloatingBtn');
    if (voucherFloatingBtn) voucherFloatingBtn.addEventListener('click', showVoucherModal);


}

export async function init() {
    const table = document.getElementById('itemizedTable');
    if (!table) return;

    if (typeof window !== 'undefined') {
        window.transactionRows = transactionRows;
    }

    renderYearSelector();
    bindEvents();
    await loadItemizedData();
    updateFilterDropdowns();
    renderTable();
}

// Export getter function for accessing transaction data
export function getTransactionData() {
    return transactionRows;
}

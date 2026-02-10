import Swal from 'sweetalert2';
import { showDailyTransactionViewModal, showDailyTransactionEditModal } from './modules/modal.js';
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

// Auto-increment counters
let glCodeCounter = 1000;
let dvNoCounter = 0;

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
                <tr class="${isStriped ? 'bg-slate-50' : 'bg-white'} hover:bg-slate-100 transition-colors" data-row-id="${rowId}" data-transaction-index="${index}">
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

// Generate next G/L Code (auto-increment from 1000)
function getNextGlCode() {
    const maxGlCode = transactionRows.length > 0 
        ? Math.max(...transactionRows.map(r => parseInt(r.glCode) || 1000))
        : 999;
    return String(Math.max(1000, maxGlCode + 1));
}

// Generate next DV NO. (format: MOOE2025-01-####)
function getNextDvNo() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const prefix = `MOOE${year}-${month}-`;
    
    // Find highest counter for this prefix
    const matchingDvNos = transactionRows
        .map(r => r.dvNo || '')
        .filter(no => no.startsWith(prefix))
        .map(no => {
            const match = no.match(/-(\d+)$/);
            return match ? parseInt(match[1]) : 0;
        });
    
    const maxCounter = matchingDvNos.length > 0 ? Math.max(...matchingDvNos) : -1;
    const nextCounter = maxCounter + 1;
    
    return `${prefix}${String(nextCounter).padStart(4, '0')}`;
}

function handleAddClick() {
    // Generate default values with auto-increment
    const today = new Date().toISOString().split('T')[0];
    const newTransaction = {
        glCode: getNextGlCode(),
        dvDate: today,
        dvNo: getNextDvNo(),
        requestedBy: '',
        checkAmount: '',
        payee: '',
        particulars: '',
        checkNo: '',
        fileDate: today,
        mooe: '',
        spf: '',
        mcpFacility: '',
        konsultaFacility: '',
        konsultaPf: ''
    };
    
    showDailyTransactionEditModal(newTransaction, handleSaveTransaction);
}

function handleSaveTransaction(transactionData) {
    if (!transactionData) return;
    
    // Add ID if new
    if (!transactionData.id) {
        transactionData.id = `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Find existing or add new
    const existingIndex = transactionRows.findIndex(r => r.id === transactionData.id);
    if (existingIndex >= 0) {
        transactionRows[existingIndex] = transactionData;
    } else {
        transactionRows.push(transactionData);
    }
    
    currentPage = 1;
    updateFilterDropdowns();
    renderTable();
    
    Swal.fire({
        icon: 'success',
        title: transactionData.id && existingIndex >= 0 ? 'Transaction updated' : 'Transaction added',
        text: 'Transaction has been saved successfully.',
        confirmButtonText: 'OK',
        customClass: {
            confirmButton: sweetalertNeutralConfirmBlueClasses,
        },
    });
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
    }).then((result) => {
        if (result.isConfirmed) {
            const index = transactionRows.findIndex(r => r.id === rowId || (r.id === undefined && `row-${transactionRows.indexOf(r)}` === rowId));
            if (index >= 0) {
                transactionRows[index].archived = true;
                currentPage = 1;
                updateFilterDropdowns();
                renderTable();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Archived',
                    text: 'Transaction has been archived successfully.',
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: sweetalertNeutralConfirmBlueClasses,
                    },
                });
            }
        }
    });
}

function handleExportClick() {
    // Redirect to export page
    const path = window.location.pathname || '/';
    const basePath = path.substring(0, path.indexOf('/frontend/') !== -1 ? path.indexOf('/frontend/') : path.lastIndexOf('/')) || '';
    window.location.href = `${basePath}/frontend/pages/export/`;
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

function initializeSampleData() {
    // Sample data based on the image provided
    if (transactionRows.length === 0) {
        const today = new Date().toISOString().split('T')[0];
        transactionRows.push({
            id: 'trans-sample-1',
            glCode: '1000',
            dvDate: '2026-03-13',
            dvNo: 'MOOE2025-01-0023',
            requestedBy: 'AMELA NORHANIMAH A.S HADJI JAMEL',
            checkAmount: 11400.00,
            payee: 'AMELA NORHANIMAH A.S HADJI JAMEL',
            particulars: 'To cash advance for the per diem and transporation expenses incurred while on official travel to attend the Review and',
            checkNo: '2006405',
            fileDate: today,
            mooe: '',
            spf: '',
            mcpFacility: '',
            konsultaFacility: '',
            konsultaPf: ''
        });
        
        // Update counters
        glCodeCounter = 1001;
        dvNoCounter = 24;
    }
}

function bindEvents() {
    const searchInput = document.getElementById('itemizedSearch');
    const prevBtn = document.getElementById('itemizedPrevPage');
    const nextBtn = document.getElementById('itemizedNextPage');
    const addBtn = document.getElementById('itemizedAddBtn');
    const exportBtn = document.getElementById('itemizedExportBtn');

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

    if (exportBtn) {
        exportBtn.addEventListener('click', handleExportClick);
    }
}

export function init() {
    const table = document.getElementById('itemizedTable');
    if (!table) return;

    // Initialize sample data
    initializeSampleData();

    // Expose transactionRows to window for export module
    if (typeof window !== 'undefined') {
        window.transactionRows = transactionRows;
    }

    bindEvents();
    updateFilterDropdowns();
    renderTable();
}

// Export getter function for accessing transaction data
export function getTransactionData() {
    return transactionRows;
}

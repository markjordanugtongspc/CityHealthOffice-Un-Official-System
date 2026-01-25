import Swal from 'sweetalert2';

// Static budget data model
let budgetRows = [
    {
        glCode: '1000',
        accountTitle: 'Travelling Expense',
        actual: 1908022.0,
        budget: 277439.0,
        remainingAmount: -1630583.0,
        remainingPercent: -587.73,
    },
    {
        glCode: '2000',
        accountTitle: 'Training and Scholarship Expense',
        actual: 0.0,
        budget: 854652.0,
        remainingAmount: 854652.0,
        remainingPercent: 100.0,
    },
    {
        glCode: '3000',
        accountTitle: 'Supplies and Materials Expenses',
        actual: 324335.0,
        budget: 4486186.0,
        remainingAmount: 4161851.0,
        remainingPercent: 92.77,
    },
    {
        glCode: '4000',
        accountTitle: 'Communication Expenses',
        actual: 39200.0,
        budget: 31000.0,
        remainingAmount: -8200.0,
        remainingPercent: -26.45,
    },
    {
        glCode: '5000',
        accountTitle: 'General Services',
        actual: 0.0,
        budget: 78295.0,
        remainingAmount: 78295.0,
        remainingPercent: 100.0,
    },
    {
        glCode: '6000',
        accountTitle: 'Repairs and Maintenance',
        actual: 90160.0,
        budget: 18540.0,
        remainingAmount: -71620.0,
        remainingPercent: -386.3,
    },
    {
        glCode: '7000',
        accountTitle: 'Taxes, Insurance Premiums and Other Fees',
        actual: 0.0,
        budget: 125145.0,
        remainingAmount: 125145.0,
        remainingPercent: 100.0,
    },
    {
        glCode: '8000',
        accountTitle: 'Salaries and Wages - Regular',
        actual: 1500000.0,
        budget: 2000000.0,
        remainingAmount: 500000.0,
        remainingPercent: 25.0,
    },
    {
        glCode: '9000',
        accountTitle: 'Office Equipment Expenses',
        actual: 250000.0,
        budget: 500000.0,
        remainingAmount: 250000.0,
        remainingPercent: 50.0,
    },
    {
        glCode: '10000',
        accountTitle: 'Medical Supplies and Equipment',
        actual: 750000.0,
        budget: 1000000.0,
        remainingAmount: 250000.0,
        remainingPercent: 25.0,
    },
    {
        glCode: '11000',
        accountTitle: 'Utilities - Electricity and Water',
        actual: 450000.0,
        budget: 600000.0,
        remainingAmount: 150000.0,
        remainingPercent: 25.0,
    },
    {
        glCode: '12000',
        accountTitle: 'Professional Services',
        actual: 320000.0,
        budget: 400000.0,
        remainingAmount: 80000.0,
        remainingPercent: 20.0,
    },
];

// State
let currentPage = 1;
const rowsPerPage = 10;
let sortField = '';
let sortDirection = 'desc';
let searchTerm = '';

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

    if (!sortField) {
        return filtered;
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
            const remainingClass =
                row.remainingAmount < 0
                    ? 'text-red-600'
                    : row.remainingAmount > 0
                    ? 'text-emerald-600'
                    : 'text-slate-700';

            return `
                <tr class="${isStriped ? 'bg-slate-50' : 'bg-white'} hover:bg-slate-100 transition-colors">
                    <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm font-medium text-slate-900">
                        ${row.glCode}
                    </td>
                    <td class="px-4 py-2 text-xs md:text-sm text-slate-700">
                        ${row.accountTitle}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm text-right text-slate-700">
                        ${formatCurrency(row.actual)}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm text-right text-slate-700">
                        ${formatCurrency(row.budget)}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm text-right font-semibold ${remainingClass}">
                        ${formatCurrency(row.remainingAmount)}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2 text-xs md:text-sm text-right font-semibold ${remainingClass}">
                        ${formatPercent(row.remainingPercent)}
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
            'inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-medium',
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

function calculateRemaining(actual, budget) {
    const remainingAmount = budget - actual;
    const remainingPercent = budget !== 0 ? (remainingAmount / budget) * 100 : 0;
    return { remainingAmount, remainingPercent };
}

function handleAddClick() {
    const year = getCurrentYearFromGlobal();
    
    Swal.fire({
        title: `Add Budget Entry (${year})`,
        html: `
            <div class="space-y-4 md:space-y-5 text-left">
                <!-- G/L Code Field -->
                <div class="grid grid-cols-[120px_1fr] md:grid-cols-1 gap-2 md:gap-2 items-center">
                    <label class="text-sm font-medium text-slate-700 md:mb-1 whitespace-nowrap">G/L Code</label>
                    <input
                        id="swal-glCode"
                        type="text"
                        placeholder="e.g., 8000"
                        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796] transition-colors"
                    />
                </div>
                
                <!-- Account Title Field -->
                <div class="grid grid-cols-[120px_1fr] md:grid-cols-1 gap-2 md:gap-2 items-center">
                    <label class="text-sm font-medium text-slate-700 md:mb-1 whitespace-nowrap">Account Title</label>
                    <input
                        id="swal-accountTitle"
                        type="text"
                        placeholder="e.g., Office Equipment Expenses"
                        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796] transition-colors"
                    />
                </div>
                
                <!-- Actual Field -->
                <div class="grid grid-cols-[120px_1fr] md:grid-cols-1 gap-2 md:gap-2 items-center">
                    <label class="text-sm font-medium text-slate-700 md:mb-1 whitespace-nowrap">Actual (₱)</label>
                    <input
                        id="swal-actual"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796] transition-colors"
                    />
                </div>
                
                <!-- Budget Field -->
                <div class="grid grid-cols-[120px_1fr] md:grid-cols-1 gap-2 md:gap-2 items-center">
                    <label class="text-sm font-medium text-slate-700 md:mb-1 whitespace-nowrap">Budget (₱)</label>
                    <input
                        id="swal-budget"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796] transition-colors"
                    />
                </div>
                
                <!-- Remaining Summary -->
                <div class="grid grid-cols-[120px_1fr] md:grid-cols-1 gap-2 md:gap-2 items-start">
                    <label class="text-sm font-medium text-slate-700 md:mb-1 whitespace-nowrap pt-2">Summary</label>
                    <div class="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-4 w-full">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-xs font-medium text-slate-500 mb-1.5">Remaining ₱</p>
                                <p id="swal-remaining-amount" class="text-base font-semibold text-slate-900">₱0.00</p>
                            </div>
                            <div>
                                <p class="text-xs font-medium text-slate-500 mb-1.5">Remaining %</p>
                                <p id="swal-remaining-percent" class="text-base font-semibold text-slate-900">0.00%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        width: 'auto',
        padding: '1.5rem',
        showCancelButton: true,
        confirmButtonText: 'Add Entry',
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        customClass: {
            popup: 'rounded-2xl shadow-xl border border-slate-200 max-w-md md:max-w-2xl',
            htmlContainer: 'text-left',
            confirmButton:
                'inline-flex items-center justify-center rounded-lg bg-[#224796] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#163473] focus:outline-none focus:ring-2 focus:ring-[#224796] focus:ring-offset-1 cursor-pointer transition-colors',
            cancelButton:
                'inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1 cursor-pointer transition-colors',
        },
        didOpen: () => {
            const actualInput = document.getElementById('swal-actual');
            const budgetInput = document.getElementById('swal-budget');
            const remainingAmountEl = document.getElementById('swal-remaining-amount');
            const remainingPercentEl = document.getElementById('swal-remaining-percent');

            const updateRemaining = () => {
                const actual = parseFloat(actualInput.value) || 0;
                const budget = parseFloat(budgetInput.value) || 0;
                const { remainingAmount, remainingPercent } = calculateRemaining(actual, budget);
                
                remainingAmountEl.textContent = formatCurrency(remainingAmount);
                remainingAmountEl.className = `text-base font-semibold ${
                    remainingAmount < 0
                        ? 'text-red-600'
                        : remainingAmount > 0
                        ? 'text-emerald-600'
                        : 'text-slate-900'
                }`;
                
                remainingPercentEl.textContent = formatPercent(remainingPercent);
                remainingPercentEl.className = `text-base font-semibold ${
                    remainingPercent < 0
                        ? 'text-red-600'
                        : remainingPercent > 0
                        ? 'text-emerald-600'
                        : 'text-slate-900'
                }`;
            };

            if (actualInput) {
                actualInput.addEventListener('input', updateRemaining);
            }
            if (budgetInput) {
                budgetInput.addEventListener('input', updateRemaining);
            }
        },
        preConfirm: () => {
            const glCode = document.getElementById('swal-glCode')?.value?.trim();
            const accountTitle = document.getElementById('swal-accountTitle')?.value?.trim();
            const actual = parseFloat(document.getElementById('swal-actual')?.value) || 0;
            const budget = parseFloat(document.getElementById('swal-budget')?.value) || 0;

            if (!glCode) {
                Swal.showValidationMessage('G/L Code is required');
                return false;
            }

            if (!accountTitle) {
                Swal.showValidationMessage('Account Title is required');
                return false;
            }

            if (budget <= 0) {
                Swal.showValidationMessage('Budget must be greater than 0');
                return false;
            }

            const { remainingAmount, remainingPercent } = calculateRemaining(actual, budget);

            return {
                glCode,
                accountTitle,
                actual,
                budget,
                remainingAmount,
                remainingPercent,
            };
        },
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            budgetRows.push(result.value);
            currentPage = 1;
            renderTable();
            
            Swal.fire({
                icon: 'success',
                title: 'Entry added',
                text: 'Budget entry has been added successfully.',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton:
                        'inline-flex items-center justify-center rounded-lg bg-[#224796] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#163473] focus:outline-none focus:ring-2 focus:ring-[#224796] focus:ring-offset-1 cursor-pointer transition-colors',
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
        totalActual += row.actual || 0;
        totalBudget += row.budget || 0;
        totalRemaining += row.remainingAmount || 0;

        const csvRow = [
            `"${row.glCode}"`,
            `"${row.accountTitle.replace(/"/g, '""')}"`,
            formatCurrency(row.actual).replace('₱', 'PHP '),
            formatCurrency(row.budget).replace('₱', 'PHP '),
            formatCurrency(row.remainingAmount).replace('₱', 'PHP '),
            formatPercent(row.remainingPercent),
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

function handleCalculateClick() {
    const year = getCurrentYearFromGlobal();
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
                    <p class="text-sm font-semibold ${
                        totals.totalRemaining < 0
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
                    <p class="text-sm font-semibold ${
                        totals.overallRemainingPercent < 0
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
            popup: 'rounded-2xl',
            confirmButton:
                'inline-flex items-center justify-center rounded-lg bg-[#224796] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#163473] focus:outline-none focus:ring-2 focus:ring-[#224796] focus:ring-offset-1 cursor-pointer transition-colors',
            cancelButton:
                'inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1 cursor-pointer transition-colors',
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
                    confirmButton:
                        'inline-flex items-center justify-center rounded-lg bg-[#224796] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#163473] focus:outline-none focus:ring-2 focus:ring-[#224796] focus:ring-offset-1 cursor-pointer transition-colors',
                },
            });
        }
    });
}

function applyYearBindings() {
    const year = getCurrentYearFromGlobal();

    const headerYear = document.getElementById('budgetCurrentYear');
    const inlineYear = document.getElementById('budgetCurrentYearInline');

    if (headerYear) {
        headerYear.textContent = String(year);
    }
    if (inlineYear) {
        inlineYear.textContent = String(year);
    }
}

export function init() {
    const table = document.getElementById('budgetTable');
    if (!table) return;

    // Expose budgetRows to window for export module
    if (typeof window !== 'undefined') {
        window.budgetRows = budgetRows;
    }

    applyYearBindings();
    bindEvents();
    renderTable();
}

// Export getter function for accessing budget data
export function getBudgetData() {
    return budgetRows;
}

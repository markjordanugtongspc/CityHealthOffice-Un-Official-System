import Swal from 'sweetalert2';
import { initInlineEdit } from './modules/inline-edit.js';

// Static monthly expenses data model
// G/L Code will be auto-incremented by backend later
let monthlyExpensesRows = [
    {
        glCode: '1000',
        accountTitle: 'Travelling Expense',
        months: {
            january: 260282.00,
            february: 0,
            march: 0,
            april: 0,
            may: 0,
            june: 0,
            july: 0,
            august: 0,
            september: 0,
            october: 0,
            november: 0,
            december: 0,
        },
        total: 260282.00,
    },
    {
        glCode: '2000',
        accountTitle: 'Training and Scholarship Expense',
        months: {
            january: 0,
            february: 0,
            march: 0,
            april: 0,
            may: 0,
            june: 0,
            july: 0,
            august: 0,
            september: 0,
            october: 0,
            november: 0,
            december: 0,
        },
        total: 0,
    },
    {
        glCode: '3000',
        accountTitle: 'Supplies and Materials Expenses',
        months: {
            january: 867517.00,
            february: 957953.00,
            march: 736909.00,
            april: 345197.61,
            may: 961410.66,
            june: 0,
            july: 0,
            august: 549261.06,
            september: 548381.00,
            october: 0,
            november: 0,
            december: 0,
        },
        total: 4992729.33,
    },
    {
        glCode: '4000',
        accountTitle: 'Communication Expenses',
        months: {
            january: 39200.00,
            february: 0,
            march: 0,
            april: 0,
            may: 0,
            june: 0,
            july: 0,
            august: 0,
            september: 0,
            october: 0,
            november: 0,
            december: 0,
        },
        total: 39200.00,
    },
    {
        glCode: '5000',
        accountTitle: 'General Services',
        months: {
            january: 0,
            february: 0,
            march: 0,
            april: 0,
            may: 0,
            june: 0,
            july: 0,
            august: 0,
            september: 0,
            october: 0,
            november: 0,
            december: 0,
        },
        total: 0,
    },
    {
        glCode: '6000',
        accountTitle: 'Repairs and Maintenance',
        months: {
            january: 90160.00,
            february: 0,
            march: 0,
            april: 0,
            may: 0,
            june: 0,
            july: 0,
            august: 0,
            september: 0,
            october: 0,
            november: 0,
            december: 0,
        },
        total: 90160.00,
    },
    {
        glCode: '7000',
        accountTitle: 'Taxes, Insurance Premiums and Other Fees',
        months: {
            january: 0,
            february: 0,
            march: 0,
            april: 0,
            may: 0,
            june: 0,
            july: 0,
            august: 0,
            september: 0,
            october: 0,
            november: 0,
            december: 0,
        },
        total: 0,
    },
    {
        glCode: '8000',
        accountTitle: 'Advertising Expenses',
        months: {
            january: 0,
            february: 0,
            march: 0,
            april: 0,
            may: 0,
            june: 0,
            july: 0,
            august: 0,
            september: 0,
            october: 0,
            november: 0,
            december: 0,
        },
        total: 0,
    },
];

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

function getCurrentYearFromGlobal() {
    if (typeof window !== 'undefined' && typeof window.appCurrentYear === 'number') {
        return window.appCurrentYear;
    }
    return new Date().getFullYear();
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
                <tr class="${isStriped ? 'bg-slate-50' : 'bg-white'} hover:bg-slate-100 transition-colors" data-row-index="${index}" data-gl-code="${row.glCode}">
                    <td class="whitespace-nowrap px-3 py-2 text-xs md:text-sm font-medium text-slate-900 sticky left-0 bg-inherit z-10">
                        ${row.glCode}
                    </td>
                    <td class="px-3 py-2 text-xs md:text-sm text-slate-700 sticky left-12 bg-inherit z-10 min-w-[200px]" data-editable="accountTitle" data-type="text" data-value="${row.accountTitle}">
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

    yearSelect.addEventListener('change', (e) => {
        selectedYear = parseInt(e.target.value);
        // Update year display
        const yearDisplay = document.getElementById('monthlyExpensesCurrentYear');
        if (yearDisplay) {
            yearDisplay.textContent = String(selectedYear);
        }
        // Re-render table (in future, this would filter by year from backend)
        renderTable();
    });
}

function handleAddClick() {
    const year = selectedYear;
    
    Swal.fire({
        title: `Add Monthly Expense Entry (${year})`,
        html: `
            <div class="space-y-4 md:space-y-5 text-left">
                <!-- G/L Code Field (Note: Will be auto-incremented by backend) -->
                <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    <label class="text-sm font-medium text-slate-700 whitespace-nowrap md:w-32 md:shrink-0">G/L Code</label>
                    <div class="flex-1 w-full">
                        <input
                            id="swal-glCode"
                            type="text"
                            placeholder="Auto-incremented by backend"
                            readonly
                            class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                        />
                        <p class="text-xs text-slate-500 mt-1.5">Note: G/L Code will be auto-incremented by backend</p>
                    </div>
                </div>
                
                <!-- Account Title Field with Autocomplete -->
                <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    <label class="text-sm font-medium text-slate-700 whitespace-nowrap md:w-32 md:shrink-0">Account Title</label>
                    <div class="flex-1 w-full relative">
                        <input
                            id="swal-accountTitle"
                            type="text"
                            placeholder="e.g., Travelling Expense"
                            autocomplete="off"
                            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-8 text-sm text-slate-900 placeholder-slate-400 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796] transition-colors"
                        />
                        <button
                            type="button"
                            id="swal-accountTitle-toggle"
                            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors hidden"
                            title="Show suggestions"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <div id="swal-accountTitle-suggestions" class="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto hidden">
                            <!-- Suggestions will be populated dynamically -->
                        </div>
                    </div>
                </div>
                
                <!-- Monthly Values Grid -->
                <div class="flex flex-col md:flex-row md:items-start gap-2 md:gap-3">
                    <label class="text-sm font-medium text-slate-700 whitespace-nowrap md:w-32 md:shrink-0 md:pt-2">Monthly Values (₱)</label>
                    <div class="flex-1 w-full">
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3 max-h-[320px] md:max-h-[280px] overflow-y-auto pr-2 pb-2">
                            ${monthNames.map((month, index) => {
                                const monthKey = monthKeys[index];
                                return `
                                    <div class="flex flex-col">
                                        <label class="block text-xs font-medium text-slate-600 mb-1.5">${month}</label>
                                        <input
                                            id="swal-${monthKey}"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796] transition-colors"
                                        />
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Total Summary -->
                <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    <label class="text-sm font-medium text-slate-700 whitespace-nowrap md:w-32 md:shrink-0">Total</label>
                    <div class="flex-1 w-full rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-4">
                        <p class="text-xs font-medium text-slate-500 mb-1.5">Total Amount</p>
                        <p id="swal-total-amount" class="text-lg md:text-xl font-semibold text-slate-900">₱0.00</p>
                    </div>
                </div>
            </div>
        `,
        width: '90%',
        maxWidth: '700px',
        padding: '1.5rem',
        showCancelButton: true,
        confirmButtonText: 'Add Entry',
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        customClass: {
            popup: 'rounded-xl shadow-xl border border-slate-200',
            htmlContainer: 'text-left max-h-[85vh] overflow-y-auto',
            confirmButton:
                'inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 cursor-pointer transition-colors',
            cancelButton:
                'inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1 cursor-pointer transition-colors',
        },
        didOpen: () => {
            // TODO: Replace with backend fetch API call when integrating with backend
            // Example: const existingAccounts = await fetch('/api/monthly-expenses/account-titles').then(r => r.json());
            const existingAccountTitles = [...new Set(monthlyExpensesRows.map(row => row.accountTitle))].filter(Boolean);
            
            const accountTitleInput = document.getElementById('swal-accountTitle');
            const suggestionsContainer = document.getElementById('swal-accountTitle-suggestions');
            const toggleButton = document.getElementById('swal-accountTitle-toggle');
            
            // Show/hide toggle button based on existing accounts
            if (existingAccountTitles.length > 0 && toggleButton) {
                toggleButton.classList.remove('hidden');
            }
            
            // Function to auto-fill monthly values from existing data
            const autoFillMonthlyValues = (accountTitle) => {
                // TODO: Replace with backend fetch API call when integrating with backend
                // Example: const existingData = await fetch(`/api/monthly-expenses/by-title/${encodeURIComponent(accountTitle)}`).then(r => r.json());
                const existingRow = monthlyExpensesRows.find(row => row.accountTitle === accountTitle);
                if (existingRow && existingRow.months) {
                    monthKeys.forEach(monthKey => {
                        const input = document.getElementById(`swal-${monthKey}`);
                        if (input && existingRow.months[monthKey] && existingRow.months[monthKey] > 0) {
                            input.value = existingRow.months[monthKey];
                        }
                    });
                    // Update total
                    updateTotal();
                }
            };
            
            // Function to update total
            const updateTotal = () => {
                let total = 0;
                monthKeys.forEach(monthKey => {
                    const input = document.getElementById(`swal-${monthKey}`);
                    if (input) {
                        total += parseFloat(input.value) || 0;
                    }
                });
                const totalEl = document.getElementById('swal-total-amount');
                if (totalEl) {
                    totalEl.textContent = formatCurrency(total);
                }
            };
            
            // Function to filter and show suggestions based on input
            const showSuggestions = (searchTerm = '') => {
                if (!suggestionsContainer) return;
                suggestionsContainer.innerHTML = '';
                
                if (existingAccountTitles.length === 0) {
                    suggestionsContainer.classList.add('hidden');
                    return;
                }
                
                // Filter suggestions based on search term
                const filtered = searchTerm.trim() === '' 
                    ? existingAccountTitles 
                    : existingAccountTitles.filter(title => 
                        title.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                
                if (filtered.length === 0) {
                    suggestionsContainer.classList.add('hidden');
                    return;
                }
                
                suggestionsContainer.classList.remove('hidden');
                
                filtered.forEach(title => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.className = 'px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm text-slate-700 border-b border-slate-100 last:border-b-0 transition-colors';
                    suggestionItem.textContent = title;
                    suggestionItem.addEventListener('click', () => {
                        accountTitleInput.value = title;
                        suggestionsContainer.classList.add('hidden');
                        // Auto-fill monthly values if data exists
                        autoFillMonthlyValues(title);
                    });
                    suggestionsContainer.appendChild(suggestionItem);
                });
            };
            
            // Show suggestions on input (auto-detect as user types)
            if (accountTitleInput) {
                accountTitleInput.addEventListener('input', (e) => {
                    const value = e.target.value.trim();
                    if (value.length > 0 && existingAccountTitles.length > 0) {
                        showSuggestions(value);
                    } else {
                        suggestionsContainer.classList.add('hidden');
                    }
                });
                
                accountTitleInput.addEventListener('focus', () => {
                    if (existingAccountTitles.length > 0 && accountTitleInput.value.trim().length > 0) {
                        showSuggestions(accountTitleInput.value.trim());
                    }
                });
            }
            
            // Toggle suggestions dropdown on button click
            if (toggleButton) {
                toggleButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (suggestionsContainer.classList.contains('hidden')) {
                        showSuggestions(accountTitleInput.value.trim());
                    } else {
                        suggestionsContainer.classList.add('hidden');
                    }
                });
            }
            
            // Close suggestions when clicking outside
            const handleClickOutside = (e) => {
                if (!suggestionsContainer.contains(e.target) && 
                    e.target !== accountTitleInput && 
                    e.target !== toggleButton &&
                    !toggleButton?.contains(e.target)) {
                    suggestionsContainer.classList.add('hidden');
                }
            };
            
            // Use setTimeout to avoid immediate closure on modal open
            setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 100);
            
            // Calculate total when any month input changes
            monthKeys.forEach(monthKey => {
                const input = document.getElementById(`swal-${monthKey}`);
                if (input) {
                    input.addEventListener('input', updateTotal);
                }
            });
        },
        preConfirm: () => {
            const accountTitle = document.getElementById('swal-accountTitle')?.value?.trim();
            const months = {};

            if (!accountTitle) {
                Swal.showValidationMessage('Account Title is required');
                return false;
            }

            // Collect monthly values
            monthKeys.forEach(monthKey => {
                const input = document.getElementById(`swal-${monthKey}`);
                months[monthKey] = parseFloat(input?.value) || 0;
            });

            // Calculate total
            const total = Object.values(months).reduce((sum, val) => sum + val, 0);

            // TODO: Replace with backend POST API call when integrating with backend
            // Example: const response = await fetch('/api/monthly-expenses', { method: 'POST', body: JSON.stringify({ accountTitle, months, year: selectedYear }) });
            // G/L Code will be auto-incremented by backend
            // Generate next G/L Code (temporary - backend will handle this)
            const maxGlCode = monthlyExpensesRows.reduce((max, row) => {
                const code = parseInt(row.glCode) || 0;
                return Math.max(max, code);
            }, 0);
            const nextGlCode = String(maxGlCode + 1000);

            return {
                glCode: nextGlCode, // TODO: Backend will auto-increment this
                accountTitle,
                months,
                total,
            };
        },
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            monthlyExpensesRows.push(result.value);
            currentPage = 1;
            renderTable();
            renderAccountTitleFilters();
            
            Swal.fire({
                icon: 'success',
                title: 'Entry added',
                text: 'Monthly expense entry has been added successfully.',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton:
                        'inline-flex items-center justify-center rounded-lg bg-[#224796] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#163473] focus:outline-none focus:ring-2 focus:ring-[#224796] focus:ring-offset-1 cursor-pointer transition-colors',
                },
            });
        }
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
        width: '90%',
        maxWidth: '500px',
        padding: '1rem',
        showCancelButton: true,
        confirmButtonText: 'Calculate',
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        customClass: {
            popup: 'rounded-xl shadow-xl border border-slate-200',
            htmlContainer: 'text-left',
            confirmButton:
                'inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1 cursor-pointer transition-colors',
            cancelButton:
                'inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1 cursor-pointer transition-colors',
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
                width: '90%',
                maxWidth: '600px',
                padding: '1rem',
                confirmButtonText: 'Close',
                focusConfirm: false,
                customClass: {
                    popup: 'rounded-xl shadow-xl border border-slate-200',
                    htmlContainer: 'text-left',
                    confirmButton:
                        'inline-flex items-center justify-center rounded-lg bg-[#224796] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#163473] focus:outline-none focus:ring-2 focus:ring-[#224796] focus:ring-offset-1 cursor-pointer transition-colors',
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
        const glCode = row?.getAttribute('data-gl-code') || '';
        const fieldName = cell.getAttribute('data-editable');
        const fieldType = cell.getAttribute('data-type') || 'text';
        const monthKey = cell.getAttribute('data-month') || '';
        
        // Find the row data
        const rowData = monthlyExpensesRows.find(r => r.glCode === glCode);
        if (!rowData) return;
        
        initInlineEdit(cell, {
            type: fieldType,
            rowData: rowData,
            fieldName: fieldName,
            onSave: (newValue, oldValue, rowData, fieldName) => {
                // Update the row data
                if (fieldName === 'accountTitle') {
                    rowData.accountTitle = newValue;
                } else if (fieldName === 'month' && monthKey) {
                    rowData.months[monthKey] = parseFloat(newValue) || 0;
                    // Recalculate total
                    rowData.total = calculateTotal(rowData);
                }
                
                // Re-render table to update calculated values
                renderTable();
            },
            onCancel: (originalValue, rowData, fieldName) => {
                // Edit was cancelled, no action needed
            }
        });
    });
}

export function init() {
    const table = document.getElementById('monthlyExpensesTable');
    if (!table) return;

    // Expose monthlyExpensesRows to window for export module
    if (typeof window !== 'undefined') {
        window.monthlyExpensesRows = monthlyExpensesRows;
    }

    applyYearBindings();
    renderYearSelector();
    renderAccountTitleFilters();
    bindEvents();
    renderTable();
}

// Export getter function for accessing monthly expenses data
export function getMonthlyExpensesData() {
    return monthlyExpensesRows;
}

import { showModal, showSuccess, showError, showWarning, showLoading, closeModal } from './modal.js';

// Print functionality - no export data needed

function getCurrentYearFromGlobal() {
    if (typeof window !== 'undefined' && typeof window.appCurrentYear === 'number') {
        return window.appCurrentYear;
    }
    return new Date().getFullYear();
}

/**
 * Format currency value with Philippine Peso symbol
 */
function formatCurrency(value) {
    if (value === null || value === undefined || value === '') {
        return '₱0.00';
    }
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[₱,]/g, '')) : value;
    if (isNaN(numValue)) {
        return String(value);
    }
    const absValue = Math.abs(numValue);
    const formatted = '₱' + absValue.toLocaleString('en-PH', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
    // Add negative sign before peso symbol if value is negative
    return numValue < 0 ? '-' + formatted : formatted;
}

/**
 * Initialize print page functionality
 */
export function init() {
    const dataSourceSelect = document.getElementById('exportDataSource');
    const printBtn = document.getElementById('exportBtn'); // Keep same ID but use for print
    const previewBtn = document.getElementById('previewBtn');
    const previewContainer = document.getElementById('exportPreview');

    if (!dataSourceSelect || !printBtn) {
        return;
    }

    // Load available data sources
    loadDataSources();

    // Handle print button click
    printBtn.addEventListener('click', async () => {
        const dataSource = dataSourceSelect.value;

        if (!dataSource) {
            showError(
                'Missing Information',
                'Please select a data source to print.'
            );
            return;
        }

        // Show loading
        showLoading('Preparing Print...', 'Please wait while we prepare your document for printing.');

        try {
            const data = await getDataSource(dataSource);
            if (!data || data.length === 0) {
                closeModal();
                showWarning(
                    'No Data',
                    'No data available for the selected source.'
                );
                return;
            }

            // Close loading modal
            closeModal();

            // Generate and display print content on current page
            displayPrintContent(data, dataSource);
            
            // Trigger print after a short delay
            setTimeout(() => {
                window.print();
                // After print dialog closes, restore the page
                setTimeout(() => {
                    restorePageContent();
                    showSuccess(
                        'Print Ready!',
                        'Your document has been prepared for printing.'
                    );
                }, 500);
            }, 300);
        } catch (error) {
            console.error('Print error:', error);
            closeModal();
            showError(
                'Print Error',
                error.message || 'An unexpected error occurred while preparing the print.'
            );
        }
    });

    // Handle preview button click
    if (previewBtn) {
        previewBtn.addEventListener('click', async () => {
            const dataSource = dataSourceSelect.value;
            if (!dataSource) {
                showWarning(
                    'Select Data Source',
                    'Please select a data source first.'
                );
                return;
            }

            try {
                const data = await getDataSource(dataSource);
                const previewSection = document.getElementById('exportPreviewSection');
                if (previewContainer) {
                    previewContainer.innerHTML = generateTableHTML(data, dataSource);
                    if (previewSection) {
                        previewSection.classList.remove('hidden');
                    }
                    previewContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } catch (error) {
                console.error('Preview error:', error);
                showError(
                    'Preview Error',
                    error.message || 'An error occurred while generating preview.'
                );
            }
        });
    }

    // Handle close preview button
    const closePreviewBtn = document.getElementById('closePreviewBtn');
    const previewSection = document.getElementById('exportPreviewSection');
    if (closePreviewBtn && previewSection) {
        closePreviewBtn.addEventListener('click', () => {
            previewSection.classList.add('hidden');
        });
    }

    // Set current year in header
    const yearEl = document.getElementById('exportCurrentYear');
    if (yearEl) {
        yearEl.textContent = String(getCurrentYearFromGlobal());
    }
}

/**
 * Load available data sources
 */
function loadDataSources() {
    const sources = [
        { value: 'dashboard', label: 'Dashboard Charts' },
        { value: 'budget', label: 'Budget Data' },
        { value: 'specialFund', label: 'Special Program Fund' },
        { value: 'monthlyExpenses', label: 'Monthly Expenses Summary' }
    ];

    const select = document.getElementById('exportDataSource');
    if (select) {
        sources.forEach(source => {
            const option = document.createElement('option');
            option.value = source.value;
            option.textContent = source.label;
            select.appendChild(option);
        });
    }
}

/**
 * Get data from selected source
 * Returns ALL data (not filtered/paginated)
 */
async function getDataSource(source) {
    switch (source) {
        case 'dashboard':
            // Would get chart data or summary
            return [
                { Metric: 'Total Vouchers', Value: '3,789', Period: getCurrentYearFromGlobal() },
                { Metric: 'Total Transactions', Value: '15,234', Period: getCurrentYearFromGlobal() },
                { Metric: 'Total Expenses', Value: formatCurrency(1250000), Period: getCurrentYearFromGlobal() }
            ];
        case 'budget':
            // Try to get budget data from getter function or window
            let budgetData = null;
            try {
                // Try importing the getter function
                const budgetModule = await import('../budget.js');
                if (budgetModule && typeof budgetModule.getBudgetData === 'function') {
                    budgetData = budgetModule.getBudgetData();
                }
            } catch (error) {
                // If import fails, try window property
                console.log('Could not import budget module, trying window.budgetRows');
            }
            
            // Fallback to window property
            if (!budgetData && window.budgetRows) {
                budgetData = window.budgetRows;
            }
            
            // Map to export format with currency formatting
            if (budgetData && Array.isArray(budgetData) && budgetData.length > 0) {
                return budgetData.map(row => ({
                    'G/L Code': row.glCode || '',
                    'Account Title': row.accountTitle || '',
                    'Actual': formatCurrency(row.actual || 0),
                    'Budget': formatCurrency(row.budget || 0),
                    'Remaining ₱': formatCurrency(row.remainingAmount || 0),
                    'Remaining %': row.remainingPercent || '0%'
                }));
            }
            return [];
        case 'specialFund':
            // Try to get special fund data from getter function or window
            let specialFundData = null;
            try {
                // Try importing the getter function
                const specialFundModule = await import('../specialfund.js');
                if (specialFundModule && typeof specialFundModule.getSpecialFundData === 'function') {
                    specialFundData = specialFundModule.getSpecialFundData();
                }
            } catch (error) {
                // If import fails, try window property
                console.log('Could not import specialfund module, trying window.specialFundRows');
            }
            
            // Fallback to window property
            if (!specialFundData && window.specialFundRows) {
                specialFundData = window.specialFundRows;
            }
            
            // Map to export format with currency formatting
            if (specialFundData && Array.isArray(specialFundData) && specialFundData.length > 0) {
                return specialFundData.map(row => ({
                    'G/L Code': row.glCode || '',
                    'Program': row.program || '',
                    'Type': row.type || '',
                    'Actual': formatCurrency(row.actual || 0),
                    'Budget': formatCurrency(row.budget || 0),
                    'Remaining ₱': formatCurrency(row.remainingAmount || 0),
                    'Remaining %': row.remainingPercent || '0%'
                }));
            }
            return [];
        case 'monthlyExpenses':
            // Try to get monthly expenses data from getter function or window
            let monthlyExpensesData = null;
            try {
                // Try importing the getter function
                const monthlyExpensesModule = await import('../monthly-expenses.js');
                if (monthlyExpensesModule && typeof monthlyExpensesModule.getMonthlyExpensesData === 'function') {
                    monthlyExpensesData = monthlyExpensesModule.getMonthlyExpensesData();
                }
            } catch (error) {
                // If import fails, try window property
                console.log('Could not import monthly-expenses module, trying window.monthlyExpensesRows');
            }
            
            // Fallback to window property
            if (!monthlyExpensesData && window.monthlyExpensesRows) {
                monthlyExpensesData = window.monthlyExpensesRows;
            }
            
            // Map to export format with currency formatting
            if (monthlyExpensesData && Array.isArray(monthlyExpensesData) && monthlyExpensesData.length > 0) {
                return monthlyExpensesData.map(row => {
                    const exportRow = {
                        'G/L Code': row.glCode || '',
                        'Account Title': row.accountTitle || '',
                    };
                    
                    // Add monthly columns
                    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
                    
                    monthKeys.forEach((monthKey, index) => {
                        const value = row.months && row.months[monthKey] ? row.months[monthKey] : 0;
                        exportRow[monthNames[index]] = value > 0 ? formatCurrency(value) : '-';
                    });
                    
                    // Add total
                    exportRow['Total'] = formatCurrency(row.total || 0);
                    
                    return exportRow;
                });
            }
            return [];
        default:
            return [];
    }
}

// Store original page content for restoration
let originalPageContent = null;
let printContainerElement = null;

/**
 * Display print content on current page (hiding everything else)
 */
function displayPrintContent(data, source) {
    // Store original body content
    const body = document.body;
    originalPageContent = body.innerHTML;
    
    // Create print container
    printContainerElement = document.createElement('div');
    printContainerElement.id = 'printContainer';
    printContainerElement.innerHTML = generatePrintHTML(data, source);
    
    // Clear body and add print content
    body.innerHTML = '';
    body.appendChild(printContainerElement);
    
    // Add print-specific styles
    const style = document.createElement('style');
    style.id = 'printStyles';
    style.textContent = `
        body {
            margin: 0;
            padding: 0;
            background: white;
        }
        #printContainer {
            width: 100%;
            margin: 0;
            padding: 0;
        }
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Restore original page content after printing
 */
function restorePageContent() {
    // Simply reload the page to restore everything
    // This ensures all event listeners and modules are properly reinitialized
    window.location.reload();
}

/**
 * Generate HTML for printing with pagination (10 rows per page)
 */
function generatePrintHTML(data, source) {
    if (!data || data.length === 0) {
        return '<p class="text-slate-600">No data available.</p>';
    }

    const headers = Object.keys(data[0]);
    const year = getCurrentYearFromGlobal();
    const logoPath = window.location.origin + '/Project/frontend/images/ch-logo.png';
    const rowsPerPage = 10;
    const totalPages = Math.ceil(data.length / rowsPerPage);
    
    // Split data into pages
    const pages = [];
    for (let i = 0; i < data.length; i += rowsPerPage) {
        pages.push(data.slice(i, i + rowsPerPage));
    }

    // Generate HTML for each page
    const pagesHTML = pages.map((pageData, pageIndex) => {
        const isLastPage = pageIndex === pages.length - 1;
        const isCompact = pageData.length < 10 && isLastPage && totalPages === 1;
        const pageClass = isCompact ? 'print-page compact' : 'print-page full-page';
        
        return `
            <div class="${pageClass}">
                <!-- Header with logos -->
                <div class="print-header">
                    <img src="${logoPath}" alt="City Health Office Logo" onerror="this.style.display='none'" />
                    <div class="print-header-center">
                        <h1>City Health Office</h1>
                        <p>${source.charAt(0).toUpperCase() + source.slice(1)} Report</p>
                        <p class="year">Year: ${year} | Page ${pageIndex + 1} of ${totalPages}</p>
                    </div>
                    <img src="${logoPath}" alt="City Health Office Logo" onerror="this.style.display='none'" />
                </div>

                <!-- Table -->
                <table>
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${pageData.map(row => `
                            <tr>
                                ${headers.map(h => {
                                    const value = row[h];
                                    const isNegative = typeof value === 'string' && value.startsWith('-');
                                    const cellClass = isNegative ? 'currency-negative' : '';
                                    // Remove HTML tags from value for printing
                                    const cellValue = formatCellValueForPrint(value);
                                    return `<td class="${cellClass}">${cellValue}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <!-- Footer with watermark (only on last page) -->
                ${isLastPage ? `
                <div class="print-footer">
                    <p>Generated on ${new Date().toLocaleString()} | City Health Office - Confidential</p>
                    <p class="watermark">© ${year} City Health Office - All Rights Reserved</p>
                </div>
                ` : ''}
            </div>
        `;
    }).join('');

    return `
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                font-size: 12px;
                line-height: 1.5;
                color: #1f2937;
                background: white;
            }
            .print-container {
                width: 100%;
                margin: 0;
                padding: 0;
            }
            .print-page {
                page-break-after: always;
                padding: 20mm;
                display: flex;
                flex-direction: column;
                /* Only use min-height for pages with enough content, otherwise compact */
            }
            .print-page:last-child {
                page-break-after: auto;
            }
            /* Compact layout for pages with fewer rows */
            .print-page.compact {
                min-height: auto;
                height: auto;
            }
            /* Full height for pages with 10 rows */
            .print-page.full-page {
                min-height: 297mm; /* A4 height */
            }
            .print-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #e5e7eb;
                page-break-inside: avoid;
            }
            .print-header img {
                width: 64px;
                height: 64px;
                object-fit: contain;
            }
            .print-header-center {
                flex: 1;
                text-align: center;
            }
            .print-header-center h1 {
                font-size: 24px;
                font-weight: bold;
                color: #111827;
                margin-bottom: 5px;
            }
            .print-header-center p {
                font-size: 14px;
                color: #6b7280;
            }
            .print-header-center .year {
                font-size: 12px;
                color: #9ca3af;
                margin-top: 5px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .print-page.full-page table {
                flex: 1;
            }
            .print-page.compact table {
                flex: 0;
                margin-bottom: 30px;
            }
            thead {
                background-color: #f9fafb;
            }
            th {
                padding: 10px 12px;
                text-align: left;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #374151;
                border-bottom: 2px solid #e5e7eb;
            }
            td {
                padding: 10px 12px;
                font-size: 12px;
                color: #1f2937;
                border-bottom: 1px solid #f3f4f6;
            }
            tbody tr:nth-child(even) {
                background-color: #f9fafb;
            }
            tbody tr {
                page-break-inside: avoid;
            }
            .currency-negative {
                color: #dc2626;
                font-weight: 500;
            }
            .print-footer {
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                page-break-inside: avoid;
            }
            .print-page.full-page .print-footer {
                margin-top: auto;
            }
            .print-page.compact .print-footer {
                margin-top: 30px;
            }
            .print-footer p {
                font-size: 10px;
                color: #6b7280;
                margin-bottom: 5px;
            }
            .print-footer .watermark {
                font-size: 9px;
                color: #d1d5db;
                opacity: 0.5;
                margin-top: 10px;
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                }
                .print-page {
                    padding: 20mm;
                }
            }
            @page {
                margin: 0;
                size: A4;
            }
        </style>
        <div class="print-container">
            ${pagesHTML}
        </div>
    `;
}

/**
 * Format cell value for print (remove HTML tags)
 */
function formatCellValueForPrint(value) {
    if (value === null || value === undefined) {
        return '-';
    }
    
    // If value already contains peso symbol, return as is (strip any HTML)
    if (typeof value === 'string') {
        // Remove HTML tags for plain text printing
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = value;
        return tempDiv.textContent || tempDiv.innerText || value;
    }
    
    // For numbers, format with peso symbol
    if (typeof value === 'number') {
        return formatCurrency(value);
    }
    
    return String(value);
}

/**
 * Generate HTML table from data (for preview)
 */
function generateTableHTML(data, source) {
    if (!data || data.length === 0) {
        return '<p class="text-slate-600">No data available.</p>';
    }

    const headers = Object.keys(data[0]);
    const year = getCurrentYearFromGlobal();
    const logoPath = window.location.origin + '/Project/frontend/images/ch-logo.png'; // Mao ni logo path

    let html = `
        <div class="export-content bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <!-- Header with logos -->
            <div class="flex justify-between items-start mb-6 pb-4 border-b border-slate-200">
                <img src="${logoPath}" alt="City Health Office Logo" class="w-16 h-16 object-contain" />
                <div class="text-center flex-1">
                    <h2 class="text-2xl font-bold text-slate-900 mb-1">City Health Office</h2>
                    <p class="text-sm text-slate-600">${source.charAt(0).toUpperCase() + source.slice(1)} Export</p>
                    <p class="text-xs text-slate-500 mt-1">Year: ${year}</p>
                </div>
                <img src="${logoPath}" alt="City Health Office Logo" class="w-16 h-16 object-contain" />
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200 text-sm">
                    <thead class="bg-slate-50">
                        <tr>
                            ${headers.map(h => `<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-slate-100">
                        ${data.map((row, idx) => `
                            <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">
                                ${headers.map(h => `<td class="px-4 py-3 text-sm text-slate-700">${formatCellValue(row[h])}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Footer with watermark -->
            <div class="mt-6 pt-4 border-t border-slate-200 relative">
                <p class="text-xs text-slate-500 text-center">
                    Generated on ${new Date().toLocaleString()} | City Health Office - Confidential
                </p>
                <p class="text-xs text-slate-300 text-center mt-2 opacity-50">
                    © ${year} City Health Office - All Rights Reserved
                </p>
            </div>
        </div>
    `;

    return html;
}

/**
 * Format cell value for display (HTML preview/PDF)
 */
function formatCellValue(value) {
    if (value === null || value === undefined) {
        return '-';
    }
    
    // If value already contains peso symbol (from formatCurrency), just display it
    if (typeof value === 'string' && value.includes('₱')) {
        // Check if it's a negative value (formatted as "-₱...")
        if (value.startsWith('-')) {
            return `<span class="text-red-600">${value}</span>`;
        }
        return value;
    }
    
    // For numbers, format with peso symbol
    if (typeof value === 'number') {
        const formatted = formatCurrency(value);
        if (value < 0) {
            return `<span class="text-red-600">${formatted}</span>`;
        }
        return formatted;
    }
    
    return String(value);
}

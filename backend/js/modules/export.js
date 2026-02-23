import { showExportConfigModal, showLoading, closeModal, showError, showSuccess } from './modal.js';

/**
 * Premium Export & Report Generator Logic
 * Implementation based on the Export System Implementation Guide
 */

// Global State
let currentData = [];
let filteredData = [];
let currentFilters = {
    source: '',
    search: '',
    year: new Date().getFullYear(),
    sortBy: 'none',
    columns: []
};

// Available Data Sources
const SOURCES = [
    { value: 'dashboard', label: 'Dashboard Charts' },
    { value: 'budget', label: 'Budget Data' },
    { value: 'specialFund', label: 'Special Program Fund' },
    { value: 'monthlyExpenses', label: 'Monthly Expenses Summary' }
];

// Column Definitions Map
const COL_MAP = {
    'id': { label: 'ID', key: 'ID' },
    'metric': { label: 'Metric', key: 'Metric' },
    'value': { label: 'Value', key: 'Value' },
    'period': { label: 'Period', key: 'Period' },
    'glCode': { label: 'G/L Code', key: 'G/L Code' },
    'accountTitle': { label: 'Account Title', key: 'Account Title' },
    'actual': { label: 'Actual', key: 'Actual' },
    'budget': { label: 'Budget', key: 'Budget' },
    'remaining_p': { label: 'Remaining ₱', key: 'Remaining ₱' },
    'remaining_per': { label: 'Remaining %', key: 'Remaining %' },
    'program': { label: 'Program', key: 'Program' },
    'type': { label: 'Type', key: 'Type' },
    'total': { label: 'Total', key: 'Total' }
};

// Helper to get Philipines Timezone String
function getPHTimestamp() {
    return new Intl.DateTimeFormat('en-PH', {
        timeZone: 'Asia/Manila',
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date());
}

/**
 * Initialize the module
 */
export async function init() {
    loadSavedConfig();
    setupEventListeners();

    // Initial data load if source is saved
    if (currentFilters.source) {
        await handleRefreshData(currentFilters.source);
    }
}

/**
 * Persistence: Load from localStorage
 */
function loadSavedConfig() {
    const saved = localStorage.getItem('export_config');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            currentFilters = { ...currentFilters, ...parsed };
        } catch (e) {
            console.error('Failed to parse saved config', e);
        }
    }
}

/**
 * Persistence: Save to localStorage
 */
function saveConfig() {
    localStorage.setItem('export_config', JSON.stringify(currentFilters));
}

/**
 * Setup UI Event Listeners
 */
function setupEventListeners() {
    const configBtn = document.getElementById('configBtn');
    const excelBtn = document.getElementById('exportExcelBtn');
    const printBtn = document.getElementById('exportPrintBtn');

    if (configBtn) configBtn.onclick = () => openConfigModal();

    if (excelBtn) {
        excelBtn.onclick = () => {
            if (filteredData.length === 0) {
                showError('Empty Report', 'No data to export.');
                return;
            }
            exportToExcel();
        };
    }

    if (printBtn) {
        printBtn.onclick = () => {
            if (filteredData.length === 0) {
                showError('Empty Report', 'No data to print.');
                return;
            }
            // Trigger browser print
            window.print();
        };
    }
}

/**
 * Open the configuration modal with dynamic state
 */
function openConfigModal() {
    const allKeys = currentData.length > 0 ? Object.keys(currentData[0]) : [];
    const availableCols = allKeys.map(k => ({ id: k, label: k }));

    showExportConfigModal({
        currentFilters,
        columns: availableCols,
        sources: SOURCES,
        onSourceChange: async (newSource) => {
            currentFilters.source = newSource;
            await handleRefreshData(newSource);
            // Re-open to refresh columns UI
            closeModal();
            openConfigModal();
        },
        onApply: (newFilters) => {
            handleFilterUpdate(newFilters);
        }
    });
}

/**
 * Handle data fetching and initial display
 */
async function handleRefreshData(source) {
    showLoading('Fetching Data...', 'Retrieving ' + source + ' records');
    try {
        const data = await getDataSource(source);
        currentData = data;

        // If switching sources, we might want to reset columns if they don't match
        if (currentData.length > 0) {
            const newKeys = Object.keys(currentData[0]);
            // If saved columns are not in new keys, reset to all
            if (currentFilters.columns.length === 0 || !currentFilters.columns.every(c => newKeys.includes(c))) {
                currentFilters.columns = newKeys;
            }
        }

        closeModal();
        handleFilterUpdate(currentFilters);
    } catch (e) {
        closeModal();
        showError('Fetch Error', e.message);
    }
}

/**
 * Centralized Filter Engine
 */
function handleFilterUpdate(newFilters) {
    currentFilters = { ...newFilters };
    saveConfig();

    // 1. Logic: Filter
    filteredData = currentData.filter(row => {
        // Year filter (if data has year/period)
        const rowYear = row['Year'] || row['Period'] || '';
        const matchesYear = !currentFilters.year || String(rowYear).includes(currentFilters.year);

        // Search
        const searchStr = currentFilters.search.toLowerCase();
        const matchesSearch = !searchStr || Object.values(row).some(v =>
            String(v).toLowerCase().includes(searchStr)
        );

        return matchesYear && matchesSearch;
    });

    // 2. Logic: Sort
    if (currentFilters.sortBy !== 'none') {
        filteredData.sort((a, b) => {
            if (currentFilters.sortBy === 'name') {
                const nameA = a['Account Title'] || a['Program'] || a['Metric'] || a['Payee'] || '';
                const nameB = b['Account Title'] || b['Program'] || b['Metric'] || b['Payee'] || '';
                return String(nameA).localeCompare(String(nameB));
            }
            if (currentFilters.sortBy === 'id') {
                const idA = a['G/L Code'] || a['ID'] || a['DV NO.'] || 0;
                const idB = b['G/L Code'] || b['ID'] || b['DV NO.'] || 0;
                return String(idA).localeCompare(String(idB));
            }
            return 0;
        });
    }

    updateDisplays();
}

/**
 * Update Mirror Displays (Web + Print)
 */
function updateDisplays() {
    const webTableBody = document.getElementById('webTableBody');
    const webTableHeader = document.getElementById('webTableHeader');
    const printTableBody = document.getElementById('printTableBody');
    const printTableHeader = document.getElementById('printTableHeader');
    const recordCount = document.getElementById('previewRecordCount');
    const printTimestamp = document.getElementById('print-timestamp');
    const printTitle = document.getElementById('print-report-title');

    if (!webTableBody) return;

    recordCount.textContent = `${filteredData.length} Records`;

    // Update Print Metadata
    if (printTimestamp) printTimestamp.textContent = getPHTimestamp();
    if (printTitle) {
        const sourceLabel = SOURCES.find(s => s.value === currentFilters.source)?.label || 'Report';
        const displayYear = currentFilters.year || new Date().getFullYear();
        printTitle.textContent = `${sourceLabel} - FY ${displayYear}`;

        // Update the header year display
        const headerYear = document.getElementById('exportCurrentYear');
        if (headerYear) {
            const yearText = headerYear.querySelector('#exportYearText') || headerYear;
            yearText.textContent = displayYear;
        }
    }

    if (filteredData.length === 0) {
        const emptyRow = `<tr><td colspan="100%" class="px-6 py-12 text-center text-slate-500 italic">No records matches your filter parameters.</td></tr>`;
        webTableBody.innerHTML = emptyRow;
        if (printTableBody) printTableBody.innerHTML = emptyRow;
        return;
    }

    // Generate Headers
    const filteredColumns = currentFilters.columns.filter(c => c !== 'Year' && c !== 'Period');
    const headerHTML = generateTableHeader(filteredColumns);
    webTableHeader.innerHTML = headerHTML;
    if (printTableHeader) printTableHeader.innerHTML = headerHTML;

    // Generate Rows
    let rowsHTML = '';
    filteredData.forEach(row => {
        rowsHTML += generateTableRow(row, filteredColumns);
    });

    webTableBody.innerHTML = rowsHTML;
    if (printTableBody) {
        // Force populated print table with darker and consistent borders
        printTableBody.innerHTML = rowsHTML
            .replace(/border-slate-100/g, 'border-slate-400')
            .replace(/border-slate-200/g, 'border-slate-500');
    }

    updateFilterBadges();
}

/**
 * Generate Headers with explicit borders
 */
function generateTableHeader(columns) {
    return `
        <tr class="bg-slate-50 border-b-2 border-slate-300 [print-color-adjust:exact]">
            ${columns.map(colId => {
        const isAmount = colId.toLowerCase().includes('actual') || colId.toLowerCase().includes('budget') ||
            colId.toLowerCase().includes('amount') || colId.toLowerCase().includes('total') ||
            colId.toLowerCase().includes('remaining');
        const isGL = colId.toLowerCase().includes('g/l') || colId.toLowerCase().includes('code');
        const align = isAmount ? 'text-right' : 'text-left';

        // Refined narrower widths for printing to prevent overflow
        let widthClass = '';
        if (isGL) widthClass = 'w-[110px] min-w-[110px] whitespace-nowrap';
        else if (colId.toLowerCase().includes('account title') || colId.toLowerCase().includes('program')) widthClass = 'w-auto min-w-[150px]';
        else widthClass = 'w-[90px] min-w-[90px]';

        return `<th class="border border-slate-300 px-2 py-2.5 ${align} ${widthClass} text-[10px] font-bold uppercase tracking-tight text-slate-800 font-serif overflow-hidden truncate" title="${colId}">${colId}</th>`;
    }).join('')}
        </tr>
    `;
}

/**
 * Generate Row with High-End Color Badges (Tagging) and explicit borders
 */
function generateTableRow(row, columns) {
    return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            ${columns.map(colId => {
        let value = row[colId];
        const isAmount = colId.toLowerCase().includes('actual') || colId.toLowerCase().includes('budget') ||
            colId.toLowerCase().includes('amount') || colId.toLowerCase().includes('total');
        const isRemaining = colId.toLowerCase().includes('remaining');
        const isGL = colId.toLowerCase().includes('g/l') || colId.toLowerCase().includes('code');

        let cellClass = `border border-slate-300 px-2 py-2 text-[10px] font-medium leading-tight ${isAmount || isRemaining ? 'text-right font-mono' : 'text-left text-slate-800'}`;

        if (isGL) cellClass += " whitespace-nowrap w-[110px]";
        else if (colId.toLowerCase().includes('account title') || colId.toLowerCase().includes('program')) cellClass += " w-auto break-words";
        else cellClass += " w-[90px]";

        // DATA TAGGING for Remaining Columns - Force print colors using arbitrary property
        if (isRemaining) {
            const cleanVal = String(value).replace(/[^0-9.-]+/g, "");
            const numVal = parseFloat(cleanVal) || 0;
            let badgeColor = "";

            if (colId.includes('%')) {
                if (numVal >= 50) badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
                else if (numVal >= 15) badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                else badgeColor = "bg-rose-100 text-rose-800 border-rose-200";
            } else {
                if (numVal > 50000) badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
                else if (numVal > 10000) badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                else badgeColor = "bg-rose-100 text-rose-800 border-rose-200";
            }

            value = `<span class="inline-block px-2 py-0.5 rounded text-[10px] font-black border [print-color-adjust:exact] ${badgeColor}">${value}</span>`;
        }

        // Special formatting for IDs/Codes
        if (colId.toLowerCase().includes('id') || colId.toLowerCase().includes('code')) {
            cellClass += " font-mono text-[#224796] font-bold";
        }

        return `<td class="${cellClass}">${value === undefined || value === null ? '-' : value}</td>`;
    }).join('')}
        </tr>
    `;
}

/**
 * Filter Badges Visualization
 */
function updateFilterBadges() {
    const badgeContainer = document.getElementById('activeFilterBadges');
    if (!badgeContainer) return;

    badgeContainer.innerHTML = '';

    const addBadge = (label, val, color = '[#224796]') => {
        if (!val || val === 'none') return;
        const badge = document.createElement('span');
        badge.className = `inline-flex items-center px-2 py-0.5 rounded-md bg-white text-${color} text-[10px] font-black border-2 border-slate-200 shadow-sm ml-2`;
        badge.textContent = `${label}: ${val}`;
        badgeContainer.appendChild(badge);
    };

    addBadge('SOURCE', SOURCES.find(s => s.value === currentFilters.source)?.label);
    addBadge('YEAR', currentFilters.year, 'emerald-600');
    addBadge('SEARCH', currentFilters.search, 'blue-600');
}

/**
 * High-Fidelity Styled Excel Export (XML Template)
 */
function exportToExcel() {
    const filename = `CHO_Report_FY${currentFilters.year}_${Date.now()}.xls`;
    let tableRows = `<tr style="background-color: #0046ad; color: white;">${currentFilters.columns.map(c => `<th>${c}</th>`).join('')}</tr>`;

    filteredData.forEach(row => {
        tableRows += '<tr>' + currentFilters.columns.map(colId => {
            let val = row[colId] || '';
            let style = "border: 1px solid #f1f5f9; padding: 8px;";
            if (String(val).includes('₱')) style += " text-align: right;";
            return `<td style="${style}">${val}</td>`;
        }).join('') + '</tr>';
    });

    const template = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><div style="text-align: center; font-size: 16pt; color: #224796; font-weight: bold;">City Health Office Report - FY ${currentFilters.year}</div><table>${tableRows}</table></body></html>`;
    const blob = new Blob([template], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Export Ready', `Excel report "${filename}" generated successfully.`);
}

/**
 * Data Retrieval Support
 */
async function getDataSource(source) {
    const formatCurrency = (val) => '₱' + Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2 });
    const y = currentFilters.year;

    switch (source) {
        case 'budget':
            return [
                { 'Year': y, 'G/L Code': '5-02-01-010', 'Account Title': 'Traveling Expenses', 'Actual': formatCurrency(25000), 'Budget': formatCurrency(100000), 'Remaining ₱': formatCurrency(75000), 'Remaining %': '75.00%' },
                { 'Year': y, 'G/L Code': '5-02-02-030', 'Account Title': 'Office Supplies', 'Actual': formatCurrency(8000), 'Budget': formatCurrency(10000), 'Remaining ₱': formatCurrency(2000), 'Remaining %': '20.00%' },
                { 'Year': y, 'G/L Code': '5-02-03-010', 'Account Title': 'Medical Supplies', 'Actual': formatCurrency(95000), 'Budget': formatCurrency(100000), 'Remaining ₱': formatCurrency(5000), 'Remaining %': '5.00%' }
            ];
        case 'dashboard':
            return [
                { 'Year': y, 'Period': y, 'Metric': 'Total Vouchers', 'Value': '3,789' },
                { 'Year': y, 'Period': y, 'Metric': 'Total Income', 'Value': formatCurrency(2500000) }
            ];
        case 'specialFund':
            return [
                { 'Year': y, 'G/L Code': '5-02-13-040', 'Program': 'Dengue Control', 'Actual': formatCurrency(500000), 'Budget': formatCurrency(1000000), 'Remaining ₱': formatCurrency(500000), 'Remaining %': '50.00%' }
            ];
        case 'monthlyExpenses':
            return [
                { 'Year': y, 'G/L Code': '5-02-05-010', 'Account Title': 'Postage Services', 'Total': formatCurrency(5000) }
            ];
        default:
            return [];
    }
}

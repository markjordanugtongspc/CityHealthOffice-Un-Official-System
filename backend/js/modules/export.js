import { showExportConfigDrawer } from './drawer.js';
import { showStackedToast } from './toast.js';
import ExcelJS from 'exceljs';

/**
 * Premium Export & Report Generator Logic
 * Powered by Flowbite Right-Side Drawer (id="exportConfigDrawer")
 */

// Global State
let currentData = [];
let filteredData = [];
let cachedOptionsData = {
    categories: [],
    glCodes: [],
    titles: []
};

let currentFilters = {
    source: 'budget',
    search: '',
    year: new Date().getFullYear(),
    category: 'all',
    glCode: '',
    accountTitle: '',
    programTitle: '',
    month: 'all',
    sortBy: 'none',
    columns: []
};

let ApexCharts = null;
const dashboardChartsInstances = {};

const SOURCES = [
    { value: 'dashboard', label: 'Executive Dashboard Charts' },
    { value: 'budget', label: 'Budget Allocation Data' },
    { value: 'fundDownloaded', label: 'Fund Downloaded / Special Fund' },
    { value: 'accountTitles', label: 'Master Chart of Accounts (Account Titles)' },
    { value: 'itemized', label: 'Itemized Transactions' },
    { value: 'monthlyExpenses', label: 'Monthly Expenses Summary' }
];

function getApiBasePath() {
    const path = window.location.pathname || '';
    const idx = path.indexOf('/frontend/');
    return idx !== -1 ? path.substring(0, idx) : path.substring(0, path.lastIndexOf('/')) || '';
}

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
    await preloadFilterOptions();

    // Initial data fetch and preview render on page load
    await executeApplyFilters(currentFilters, false);
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
 * Preload categories, account titles, and GL codes for dropdown search
 */
async function preloadFilterOptions() {
    const base = getApiBasePath();
    try {
        const [catRes, titlesRes] = await Promise.all([
            fetch(`${base}/api/account-titles/categories.php`, { headers: { 'Accept': 'application/json' } }),
            fetch(`${base}/api/account-titles/list.php`, { headers: { 'Accept': 'application/json' } })
        ]);

        const catJson = await catRes.json();
        const titlesJson = await titlesRes.json();

        if (catJson.success && Array.isArray(catJson.data)) {
            cachedOptionsData.categories = catJson.data;
        }

        if (titlesJson.success && Array.isArray(titlesJson.data)) {
            cachedOptionsData.glCodes = titlesJson.data.map(t => ({
                glCode: t.gl_code,
                accountTitle: t.account_title
            }));
            cachedOptionsData.titles = titlesJson.data.map(t => ({
                title: t.account_title,
                glCode: t.gl_code
            }));
        }
    } catch (e) {
        console.warn('Could not preload filter options', e);
    }
}

/**
 * Setup UI Event Listeners
 */
function setupEventListeners() {
    const configBtn = document.getElementById('configBtn');
    const excelBtn = document.getElementById('exportExcelBtn');
    const printBtn = document.getElementById('exportPrintBtn');

    if (configBtn) configBtn.onclick = () => openConfigDrawer();

    if (excelBtn) {
        excelBtn.onclick = () => {
            if (currentFilters.source === 'dashboard') {
                showStackedToast({
                    title: 'For Dashboard, use "Print" to export full visual charts in portrait.',
                    type: 'info'
                });
                return;
            }
            if (filteredData.length === 0) {
                showStackedToast({
                    title: 'No data to export.',
                    type: 'warning'
                });
                return;
            }
            exportToExcel();
        };
    }

    if (printBtn) {
        printBtn.onclick = async () => {
            if (currentFilters.source === 'dashboard') {
                document.body.classList.remove('print-force-landscape');
                await preparePrintDashboardCharts();
            } else {
                // Determine active columns count: if > 5 columns, force landscape mode
                const activeColumns = (currentFilters.columns && currentFilters.columns.length > 0)
                    ? currentFilters.columns
                    : (filteredData.length > 0 ? Object.keys(filteredData[0]) : []);

                if (activeColumns.length > 5) {
                    document.body.classList.add('print-force-landscape');
                } else {
                    document.body.classList.remove('print-force-landscape');
                }
            }

            const cleanPrintClass = () => {
                document.body.classList.remove('print-force-landscape');
                window.removeEventListener('afterprint', cleanPrintClass);
            };
            window.addEventListener('afterprint', cleanPrintClass);

            window.print();
        };
    }
}

/**
 * Open the configuration drawer
 */
function openConfigDrawer() {
    const allKeys = currentData.length > 0 ? Object.keys(currentData[0]) : [];
    const availableCols = allKeys.map(k => ({ id: k, label: k }));

    showExportConfigDrawer({
        currentFilters,
        columns: availableCols,
        sources: SOURCES,
        optionsData: cachedOptionsData,
        onSourceChange: async (newSource) => {
            // Silently fetch column metadata for new source WITHOUT popup modal or closing drawer
            try {
                const sampleData = await getDataSource(newSource, currentFilters.year);
                const newCols = sampleData.length > 0 ? Object.keys(sampleData[0]).map(k => ({ id: k, label: k })) : [];
                const drawerRoot = document.getElementById('exportConfigDrawer');
                if (drawerRoot && typeof drawerRoot._updateColumns === 'function') {
                    drawerRoot._updateColumns(newCols, []);
                }
            } catch (e) {
                console.warn('Could not update columns for new source', e);
            }
        },
        onApply: async (newFilters) => {
            // Preview is ONLY triggered when user clicks the "Apply & Refresh Preview" button!
            await executeApplyFilters(newFilters, true);
        }
    });
}

/**
 * Executes filter update and data fetching
 */
async function executeApplyFilters(newFilters, showToast = false) {
    currentFilters = { ...newFilters };
    saveConfig();

    try {
        const data = await getDataSource(currentFilters.source, currentFilters.year);
        currentData = data;

        if (currentData.length > 0) {
            const newKeys = Object.keys(currentData[0]);
            if (!currentFilters.columns || currentFilters.columns.length === 0 || !currentFilters.columns.every(c => newKeys.includes(c))) {
                currentFilters.columns = newKeys;
            }
        }

        // Apply filters to data
        applyFiltering();

        if (showToast) {
            showStackedToast({
                title: `Loaded ${currentFilters.source === 'dashboard' ? 'Dashboard Charts' : filteredData.length + ' records'} into preview.`,
                type: 'success'
            });
        }
    } catch (e) {
        showStackedToast({
            title: e.message || 'Failed to retrieve data.',
            type: 'error'
        });
    }
}

/**
 * Centralized Filter Engine
 */
function applyFiltering() {
    if (currentFilters.source === 'dashboard') {
        filteredData = currentData;
        updateDisplays();
        renderDashboardVisualCharts(currentFilters.year);
        return;
    }

    filteredData = currentData.filter(row => {
        // Year filter
        const rowYear = row['Year'] || row['Fiscal Year'] || '';
        const matchesYear = !currentFilters.year || !rowYear || String(rowYear).includes(String(currentFilters.year));

        // Category filter
        const rowCat = (row['Category'] || row['category'] || '').toLowerCase();
        const selCat = (currentFilters.category || 'all').toLowerCase();
        const matchesCat = selCat === 'all' || !rowCat || rowCat === selCat || rowCat.includes(selCat);

        // G/L Code filter
        const rowGl = (row['G/L Code'] || row['gl_code'] || '').toLowerCase();
        const selGl = (currentFilters.glCode || '').trim().toLowerCase();
        const matchesGl = !selGl || rowGl.includes(selGl);

        // Account Title / Program Title filter
        const rowTitle = (row['Account Title'] || row['Program / Fund Title'] || row['Program'] || row['Payee'] || '').toLowerCase();
        const selTitle = (currentFilters.accountTitle || currentFilters.programTitle || '').trim().toLowerCase();
        const matchesTitle = !selTitle || rowTitle.includes(selTitle);

        // Month filter
        let matchesMonth = true;
        if (currentFilters.month && currentFilters.month !== 'all') {
            const m = currentFilters.month.toLowerCase();
            if (currentFilters.source === 'fundDownloaded') {
                matchesMonth = true;
            } else if (currentFilters.source === 'itemized') {
                const dvDate = (row['DV Date'] || '').toLowerCase();
                const mIndex = ['january','february','march','april','may','june','july','august','september','october','november','december'].indexOf(m);
                const mPadded = String(mIndex + 1).padStart(2, '0');
                matchesMonth = dvDate.includes(`-${mPadded}-`) || dvDate.includes(m.substring(0, 3));
            }
        }

        // Generic Keywords Search
        const searchStr = (currentFilters.search || '').trim().toLowerCase();
        const matchesSearch = !searchStr || Object.values(row).some(v =>
            String(v).toLowerCase().includes(searchStr)
        );

        return matchesYear && matchesCat && matchesGl && matchesTitle && matchesMonth && matchesSearch;
    });

    // Sort Data
    if (currentFilters.sortBy !== 'none') {
        filteredData.sort((a, b) => {
            if (currentFilters.sortBy === 'name') {
                const nameA = a['Account Title'] || a['Program / Fund Title'] || a['Payee'] || '';
                const nameB = b['Account Title'] || b['Program / Fund Title'] || b['Payee'] || '';
                return String(nameA).localeCompare(String(nameB));
            }
            if (currentFilters.sortBy === 'id') {
                const idA = a['G/L Code'] || a['ID'] || a['DV No.'] || '';
                const idB = b['G/L Code'] || b['ID'] || b['DV No.'] || '';
                return String(idA).localeCompare(String(idB));
            }
            return 0;
        });
    }

    updateDisplays();
}

/**
 * Update Displays (Web Preview + Print Template)
 */
function updateDisplays() {
    const webTableBody = document.getElementById('webTableBody');
    const webTableHeader = document.getElementById('webTableHeader');
    const printTableBody = document.getElementById('printTableBody');
    const printTableHeader = document.getElementById('printTableHeader');
    const recordCount = document.getElementById('previewRecordCount');
    const printTimestamp = document.getElementById('print-timestamp');
    const printTitle = document.getElementById('print-report-title');

    const chartPreviewContainer = document.getElementById('exportDashboardPreviewContainer');
    const tableContainer = document.getElementById('exportTableContainer');
    const printTableContainer = document.getElementById('printTableContainer');
    const printChartsContainer = document.getElementById('printChartsContainer');

    if (!webTableBody) return;

    // Handle Dashboard Charts Source Mode vs Tabular Mode
    if (currentFilters.source === 'dashboard') {
        if (chartPreviewContainer) chartPreviewContainer.classList.remove('hidden');
        if (tableContainer) tableContainer.classList.add('hidden');
        if (printTableContainer) printTableContainer.classList.add('hidden');
        if (printChartsContainer) printChartsContainer.classList.remove('hidden');
        if (recordCount) recordCount.textContent = '4 Visual Charts';
    } else {
        if (chartPreviewContainer) chartPreviewContainer.classList.add('hidden');
        if (tableContainer) tableContainer.classList.remove('hidden');
        if (printTableContainer) printTableContainer.classList.remove('hidden');
        if (printChartsContainer) printChartsContainer.classList.add('hidden');
        if (recordCount) recordCount.textContent = `${filteredData.length} Records`;
    }

    // Update Print Metadata
    if (printTimestamp) printTimestamp.textContent = getPHTimestamp();
    if (printTitle) {
        const sourceLabel = SOURCES.find(s => s.value === currentFilters.source)?.label || 'Report';
        const displayYear = currentFilters.year || new Date().getFullYear();
        let monthSuffix = '';
        if (currentFilters.month && currentFilters.month !== 'all') {
            monthSuffix = ` (${currentFilters.month.toUpperCase()})`;
        }
        printTitle.textContent = `${sourceLabel} - FY ${displayYear}${monthSuffix}`;
    }

    if (currentFilters.source === 'dashboard') {
        updateFilterBadges();
        return;
    }

    if (filteredData.length === 0) {
        const emptyRow = `<tr><td colspan="100%" class="px-6 py-12 text-center text-slate-500 italic">No records match your filter parameters.</td></tr>`;
        webTableBody.innerHTML = emptyRow;
        if (printTableBody) printTableBody.innerHTML = emptyRow;
        updateFilterBadges();
        return;
    }

    let activeColumns = (currentFilters.columns && currentFilters.columns.length > 0)
        ? currentFilters.columns
        : Object.keys(filteredData[0]);

    const headerHTML = generateTableHeader(activeColumns);
    webTableHeader.innerHTML = headerHTML;
    if (printTableHeader) printTableHeader.innerHTML = headerHTML;

    let rowsHTML = '';
    filteredData.forEach(row => {
        rowsHTML += generateTableRow(row, activeColumns);
    });

    webTableBody.innerHTML = rowsHTML;
    if (printTableBody) {
        printTableBody.innerHTML = rowsHTML
            .replace(/border-slate-100/g, 'border-slate-400')
            .replace(/border-slate-200/g, 'border-slate-500');
    }

    updateFilterBadges();
}

/**
 * Render Live Dashboard Charts inside the Export Preview
 */
async function renderDashboardVisualCharts(year = new Date().getFullYear()) {
    if (!ApexCharts) {
        ApexCharts = (await import('apexcharts')).default;
    }

    const yearLabel = document.getElementById('exportCashflowYearLabel');
    if (yearLabel) yearLabel.textContent = `FY ${year}`;

    // 1. Fetch live cashflow numbers
    const base = getApiBasePath();
    let incomeData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let expenseData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    try {
        const res = await fetch(`${base}/api/dashboard/cashflow.php?year=${year}`, {
            headers: { 'Accept': 'application/json' }
        });
        const json = await res.json();
        if (json.success) {
            incomeData = (json.income || []).map(Number);
            expenseData = (json.expenses || []).map(Number);
        }
    } catch (e) {
        console.warn('Could not fetch cashflow', e);
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Helper render chart
    const renderChart = (id, options) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (dashboardChartsInstances[id]) {
            dashboardChartsInstances[id].destroy();
        }
        dashboardChartsInstances[id] = new ApexCharts(el, options);
        dashboardChartsInstances[id].render();
    };

    // A. Cashflow dual line chart
    const cashflowOptions = {
        chart: {
            type: 'area',
            height: 300,
            fontFamily: 'Inter, sans-serif',
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        series: [
            { name: 'Cash In Bank (Deposits)', data: incomeData },
            { name: 'Expenses (Disbursements)', data: expenseData }
        ],
        colors: ['#075985', '#BE123C'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: [3, 3] },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.35,
                opacityTo: 0.05,
                stops: [0, 95, 100]
            }
        },
        xaxis: { categories: months },
        yaxis: {
            labels: {
                formatter: (val) => '₱' + (Number(val) / 1000000).toFixed(1) + 'M'
            }
        },
        legend: { position: 'top', horizontalAlign: 'right' }
    };
    renderChart('moneyCashflowChart', cashflowOptions);

    // B. Remaining Budget Chart
    const remainingOptions = {
        chart: {
            type: 'bar',
            height: 300,
            fontFamily: 'Inter, sans-serif',
            toolbar: { show: false }
        },
        series: [
            { name: 'Allocated Budget', data: [12000000, 10000000, 11500000, 13000000, 14500000, 12000000, 15000000, 16000000, 14000000, 13500000, 15500000, 17000000] },
            { name: 'Disbursed Actual', data: [8000000, 7500000, 9000000, 10500000, 11000000, 9500000, 12000000, 13000000, 11500000, 10000000, 12500000, 14000000] }
        ],
        colors: ['#0284c7', '#f59e0b'],
        plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 3 } },
        dataLabels: { enabled: false },
        xaxis: { categories: months },
        yaxis: {
            labels: { formatter: (val) => '₱' + (Number(val) / 1000000).toFixed(1) + 'M' }
        },
        legend: { position: 'top', horizontalAlign: 'right' }
    };
    renderChart('remainingBudgetChart', remainingOptions);

    // C. Supplies Expense Donut Chart
    const suppliesOptions = {
        chart: {
            type: 'donut',
            height: 300,
            fontFamily: 'Inter, sans-serif'
        },
        series: [44, 25, 19, 12],
        labels: ['Medical Supplies', 'Office Supplies', 'Drugs & Medicines', 'Lab Reagents'],
        colors: ['#2563eb', '#10b981', '#f59e0b', '#ec4899'],
        legend: { position: 'bottom' }
    };
    renderChart('suppliesExpenseChart', suppliesOptions);

    // D. Office Financial Income and Expenses Area
    const officeOptions = {
        chart: {
            type: 'area',
            height: 300,
            fontFamily: 'Inter, sans-serif',
            toolbar: { show: false }
        },
        series: [
            { name: 'Office Allotment', data: [31000000, 40000000, 28000000, 51000000, 42000000, 109000000, 100000000] },
            { name: 'Office Expenditures', data: [11000000, 32000000, 45000000, 32000000, 34000000, 52000000, 41000000] }
        ],
        colors: ['#16a34a', '#dc2626'],
        xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] },
        yaxis: {
            labels: { formatter: (val) => '₱' + (Number(val) / 1000000).toFixed(0) + 'M' }
        },
        legend: { position: 'top', horizontalAlign: 'right' }
    };
    renderChart('officeFinancialChart', officeOptions);
}

/**
 * Prepares chart images for the print template
 */
async function preparePrintDashboardCharts() {
    const printChartsContainer = document.getElementById('printChartsContainer');
    if (!printChartsContainer) return;

    printChartsContainer.innerHTML = '';

    const chartIds = ['moneyCashflowChart', 'remainingBudgetChart', 'suppliesExpenseChart', 'officeFinancialChart'];
    const titles = [
        'CASH IN BANK & DISBURSED EXPENSES (ANNUAL OVERVIEW)',
        'REMAINING BUDGET BALANCE MONITORING',
        'SUPPLIES EXPENSE DISTRIBUTION MIX',
        'OFFICE INCOME AND EXPENDITURES TREND'
    ];

    for (let i = 0; i < chartIds.length; i++) {
        const id = chartIds[i];
        const chartInst = dashboardChartsInstances[id];
        let imgURI = null;

        if (chartInst && typeof chartInst.dataURI === 'function') {
            try {
                const res = await chartInst.dataURI();
                imgURI = res.imgURI;
            } catch (err) {
                console.warn('Could not extract dataURI', err);
            }
        }

        const box = document.createElement('div');
        box.className = 'border border-slate-300 rounded-lg p-4 bg-white break-inside-avoid [print-color-adjust:exact]';
        box.innerHTML = `
            <div class="border-b border-slate-200 pb-2 mb-3 flex items-center justify-between">
                <h3 class="text-xs font-black uppercase text-slate-800 tracking-wider">${titles[i]}</h3>
                <span class="text-[10px] font-mono text-slate-400">FY ${currentFilters.year}</span>
            </div>
            ${imgURI ? `<img src="${imgURI}" class="w-full h-auto max-h-[300px] object-contain" alt="${titles[i]}" />` : `<div class="p-4 text-center text-xs text-slate-400 italic">Chart render active in preview</div>`}
        `;
        printChartsContainer.appendChild(box);
    }
}

/**
 * Generate Headers with explicit borders
 */
function generateTableHeader(columns) {
    return `
        <tr class="bg-slate-50 border-b-2 border-slate-300 [print-color-adjust:exact]">
            ${columns.map(colId => {
                const lower = colId.toLowerCase();
                const isAmount = lower.includes('actual') || lower.includes('budget') ||
                    lower.includes('amount') || lower.includes('total') || lower.includes('spent') ||
                    lower.includes('remaining') || lower.includes('mooe') || lower.includes('spf');
                const isGL = lower.includes('g/l') || lower.includes('code');
                const align = isAmount ? 'text-right' : 'text-left';

                let widthClass = 'w-[90px] min-w-[90px]';
                if (isGL) widthClass = 'w-[110px] min-w-[110px] whitespace-nowrap';
                else if (lower.includes('title') || lower.includes('program') || lower.includes('particulars')) widthClass = 'w-auto min-w-[160px]';

                return `<th class="border border-slate-300 px-2.5 py-2.5 ${align} ${widthClass} text-[10px] font-bold uppercase tracking-tight text-slate-800 font-serif overflow-hidden truncate" title="${colId}">${colId}</th>`;
            }).join('')}
        </tr>
    `;
}

/**
 * Generate Row with High-End Color Badges and explicit borders
 */
function generateTableRow(row, columns) {
    return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            ${columns.map(colId => {
                let value = row[colId];
                const lower = colId.toLowerCase();
                const isAmount = lower.includes('actual') || lower.includes('budget') ||
                    lower.includes('amount') || lower.includes('total') || lower.includes('spent') ||
                    lower.includes('mooe') || lower.includes('spf');
                const isRemaining = lower.includes('remaining');
                const isGL = lower.includes('g/l') || lower.includes('code');

                let cellClass = `border border-slate-300 px-2 py-2 text-[10px] font-medium leading-tight ${isAmount || isRemaining ? 'text-right font-money font-semibold' : 'text-left text-slate-800'}`;

                if (isGL) cellClass += " whitespace-nowrap w-[110px] font-mono text-[#224796] font-bold";
                else if (lower.includes('title') || lower.includes('program') || lower.includes('particulars')) cellClass += " w-auto break-words";
                else cellClass += " w-[90px]";

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
                        else if (numVal > 0) badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                        else badgeColor = "bg-rose-100 text-rose-800 border-rose-200";
                    }

                    value = `<span class="inline-block px-2 py-0.5 rounded text-[10px] font-black border [print-color-adjust:exact] ${badgeColor}">${value}</span>`;
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
        if (!val || val === 'all' || val === 'none') return;
        const badge = document.createElement('span');
        badge.className = `inline-flex items-center px-2 py-0.5 rounded-md bg-white text-${color} text-[10px] font-black border border-slate-200 shadow-2xs mr-2 mb-1`;
        badge.textContent = `${label}: ${val}`;
        badgeContainer.appendChild(badge);
    };

    addBadge('SOURCE', SOURCES.find(s => s.value === currentFilters.source)?.label);
    addBadge('YEAR', currentFilters.year, 'emerald-700');
    if (currentFilters.category && currentFilters.category !== 'all') addBadge('CATEGORY', currentFilters.category.toUpperCase(), 'blue-700');
    if (currentFilters.glCode) addBadge('G/L', currentFilters.glCode, 'indigo-700');
    if (currentFilters.accountTitle) addBadge('TITLE', currentFilters.accountTitle, 'slate-800');
    if (currentFilters.month && currentFilters.month !== 'all') addBadge('MONTH', currentFilters.month.toUpperCase(), 'purple-700');
    if (currentFilters.search) addBadge('SEARCH', currentFilters.search, 'amber-700');
}

/**
 * High-Fidelity Modern XLSX Excel Export with Fill Color Coding, Header Banner, and Certified Footer
 */
async function exportToExcel() {
    const filename = `CHO_Report_FY${currentFilters.year}_${Date.now()}.xlsx`;
    const activeCols = (currentFilters.columns && currentFilters.columns.length > 0)
        ? currentFilters.columns
        : Object.keys(filteredData[0]);

    const sourceLabel = SOURCES.find(s => s.value === currentFilters.source)?.label || 'Report';
    const totalCols = activeCols.length;

    // 1. Create Workbook and Worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'City Health Office - Marawi City';
    workbook.created = new Date();

    const sheetName = sourceLabel.substring(0, 31).replace(/[:\\\/\?\*\[\]]/g, '');
    const ws = workbook.addWorksheet(sheetName, {
        views: [{ showGridLines: true }]
    });

    // 2. Add Top Header Banner (Rows 1-3)
    ws.mergeCells(1, 1, 1, totalCols);
    const titleCell = ws.getCell(1, 1);
    titleCell.value = 'CITY HEALTH OFFICE - ISLAMIC CITY OF MARAWI';
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' } // Deep Navy Blue (#1e3a8a)
    };
    ws.getRow(1).height = 28;

    ws.mergeCells(2, 1, 2, totalCols);
    const subTitleCell = ws.getCell(2, 1);
    let monthSuffix = (currentFilters.month && currentFilters.month !== 'all') ? ` - ${currentFilters.month.toUpperCase()}` : '';
    subTitleCell.value = `${sourceLabel.toUpperCase()} (FY ${currentFilters.year}${monthSuffix})`;
    subTitleCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    subTitleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF224796' } // Brand Royal Blue (#224796)
    };
    ws.getRow(2).height = 22;

    ws.mergeCells(3, 1, 3, totalCols);
    const metaCell = ws.getCell(3, 1);
    metaCell.value = `Republic of the Philippines | BARMM  •  Official System Export Generated: ${getPHTimestamp()}`;
    metaCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF475569' } };
    metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
    metaCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF1F5F9' } // Light slate tint
    };
    ws.getRow(3).height = 18;

    // Blank separator row
    ws.addRow([]);
    ws.getRow(4).height = 10;

    // 3. Add Table Headers (Row 5)
    const headerRow = ws.addRow(activeCols);
    headerRow.height = 26;

    const thinBorder = {
        top: { style: 'thin', color: { argb: 'FF94A3B8' } },
        left: { style: 'thin', color: { argb: 'FF94A3B8' } },
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
        right: { style: 'thin', color: { argb: 'FF94A3B8' } }
    };

    const dataBorder = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };

    headerRow.eachCell((cell, colNumber) => {
        const colTitle = String(cell.value || '').toLowerCase();
        const isNum = colTitle.includes('budget') || colTitle.includes('actual') || colTitle.includes('amount') ||
            colTitle.includes('remaining') || colTitle.includes('total') || colTitle.includes('spent') ||
            colTitle.includes('mooe') || colTitle.includes('spf');

        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = {
            horizontal: isNum ? 'right' : 'left',
            vertical: 'middle'
        };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF224796' } // Brand Navy Blue Table Header
        };
        cell.border = thinBorder;
    });

    // 4. Add Data Rows with High-End Color Coding
    filteredData.forEach((row, rowIdx) => {
        const rowValues = activeCols.map(colId => {
            const raw = row[colId];
            if (raw === null || raw === undefined) return '-';
            return String(raw).replace(/<[^>]*>/g, '').trim();
        });

        const newRow = ws.addRow(rowValues);
        newRow.height = 20;

        const isEven = rowIdx % 2 === 1;

        newRow.eachCell((cell, colNumber) => {
            const colHeader = activeCols[colNumber - 1] || '';
            const lowerHeader = colHeader.toLowerCase();
            const valStr = String(cell.value || '');

            const isAmount = lowerHeader.includes('budget') || lowerHeader.includes('actual') ||
                lowerHeader.includes('amount') || lowerHeader.includes('total') || lowerHeader.includes('spent') ||
                lowerHeader.includes('mooe') || lowerHeader.includes('spf');
            const isRemaining = lowerHeader.includes('remaining');
            const isGL = lowerHeader.includes('g/l') || lowerHeader.includes('code');

            cell.border = dataBorder;
            cell.alignment = {
                horizontal: (isAmount || isRemaining) ? 'right' : 'left',
                vertical: 'middle'
            };

            // Base Zebra Stripe or White
            let cellBgColor = isEven ? 'FFF8FAFC' : 'FFFFFFFF';
            let cellTextColor = 'FF1E293B';
            let isBold = false;

            if (isGL) {
                cellTextColor = 'FF1D4ED8'; // Blue GL
                isBold = true;
            }

            // Fill Color Coding for Remaining ₱ and Remaining % (matching system UI badges)
            if (isRemaining) {
                const cleanVal = valStr.replace(/[^0-9.-]+/g, '');
                const numVal = parseFloat(cleanVal) || 0;
                isBold = true;

                if (lowerHeader.includes('%')) {
                    if (numVal >= 50) {
                        cellBgColor = 'FFD1FAE5'; // Soft Emerald Green
                        cellTextColor = 'FF065F46'; // Dark Emerald
                    } else if (numVal >= 15) {
                        cellBgColor = 'FFFEF3C7'; // Soft Amber Yellow
                        cellTextColor = 'FF92400E'; // Dark Amber
                    } else {
                        cellBgColor = 'FFFFE4E6'; // Soft Rose Red
                        cellTextColor = 'FF9F1239'; // Dark Rose
                    }
                } else {
                    if (numVal > 50000) {
                        cellBgColor = 'FFD1FAE5'; // Soft Emerald Green
                        cellTextColor = 'FF065F46';
                    } else if (numVal > 0) {
                        cellBgColor = 'FFFEF3C7'; // Soft Amber Yellow
                        cellTextColor = 'FF92400E';
                    } else {
                        cellBgColor = 'FFFFE4E6'; // Soft Rose Red
                        cellTextColor = 'FF9F1239';
                    }
                }
            }

            cell.font = {
                name: (isAmount || isRemaining || isGL) ? 'Consolas' : 'Arial',
                size: 9.5,
                bold: isBold,
                color: { argb: cellTextColor }
            };

            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: cellBgColor }
            };
        });
    });

    // 5. Add Bottom Footer Section (Sign-off & Copyright)
    ws.addRow([]); // Blank line
    const lastDataRowNumber = ws.lastRow.number;

    const certRow = ws.addRow(['Certified Correct By:']);
    certRow.getCell(1).font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1E3A8A' } };

    const signRow = ws.addRow(['____________________________________']);
    signRow.getCell(1).font = { name: 'Arial', size: 9, color: { argb: 'FF64748B' } };

    const roleRow = ws.addRow(['Authorized Signature over Printed Name']);
    roleRow.getCell(1).font = { name: 'Arial', size: 8, italic: true, color: { argb: 'FF94A3B8' } };

    // Footer Copyright Row
    ws.addRow([]);
    const footerRowIdx = ws.lastRow.number + 1;
    ws.mergeCells(footerRowIdx, 1, footerRowIdx, totalCols);
    const footCell = ws.getCell(footerRowIdx, 1);
    footCell.value = `© ${new Date().getFullYear()} City Health Office Marawi Management System. All Rights Reserved.`;
    footCell.font = { name: 'Arial', size: 8.5, color: { argb: 'FF64748B' } };
    footCell.alignment = { horizontal: 'center', vertical: 'middle' };
    footCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' }
    };
    ws.getRow(footerRowIdx).height = 18;

    // 6. Calculate dynamic column widths
    activeCols.forEach((col, idx) => {
        let maxLen = col.length;
        filteredData.forEach(row => {
            const rawVal = row[col] ? String(row[col]).replace(/<[^>]*>/g, '').trim() : '';
            if (rawVal.length > maxLen) {
                maxLen = Math.min(rawVal.length, 45);
            }
        });
        ws.getColumn(idx + 1).width = Math.max(maxLen + 4, 14);
    });

    // 7. Write and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showStackedToast({
        title: `Excel report "${filename}" downloaded with custom colors & header!`,
        type: 'success'
    });
}

/**
 * Live Data Retrieval Support from Real System APIs
 */
async function getDataSource(source, targetYear = null) {
    const formatCurrency = (val) => '₱' + Number(val || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const y = targetYear || currentFilters.year || new Date().getFullYear();
    const base = getApiBasePath();

    switch (source) {
        case 'dashboard': {
            // Returns metadata for dashboard
            return [
                { 'Metric': 'Cash In Bank (Deposits)', 'Period': `FY ${y}`, 'Status': 'Live Graphic Data' },
                { 'Metric': 'Remaining Budget Monitoring', 'Period': `FY ${y}`, 'Status': 'Live Graphic Data' },
                { 'Metric': 'Supplies Expense Product Mix', 'Period': `FY ${y}`, 'Status': 'Live Graphic Data' },
                { 'Metric': 'Office Income & Expenses', 'Period': `FY ${y}`, 'Status': 'Live Graphic Data' }
            ];
        }

        case 'budget': {
            const res = await fetch(`${base}/api/budget/list.php?year=${y}`, { headers: { 'Accept': 'application/json' } });
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                return json.data.map(item => ({
                    'G/L Code': item.gl_code || '-',
                    'Account Title': item.account_title || '-',
                    'Category': (item.category || 'mooe').toUpperCase(),
                    'Budget': formatCurrency(item.budget),
                    'Actual': formatCurrency(item.actual),
                    'Remaining ₱': formatCurrency(item.remainingAmount),
                    'Remaining %': (Number(item.remainingPercent) || 0).toFixed(2) + '%'
                }));
            }
            return [];
        }

        case 'fundDownloaded': {
            const res = await fetch(`${base}/api/fund-downloaded/list.php?year=${y}&category=all`, { headers: { 'Accept': 'application/json' } });
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                return json.data.map(item => ({
                    'G/L Code': item.gl_code || '-',
                    'Program / Fund Title': item.program_title || '-',
                    'Category': (item.category || item.category_name || 'MOOE').toUpperCase(),
                    'January': formatCurrency(item.january),
                    'February': formatCurrency(item.february),
                    'March': formatCurrency(item.march),
                    'April': formatCurrency(item.april),
                    'May': formatCurrency(item.may),
                    'June': formatCurrency(item.june),
                    'July': formatCurrency(item.july),
                    'August': formatCurrency(item.august),
                    'September': formatCurrency(item.september),
                    'October': formatCurrency(item.october),
                    'November': formatCurrency(item.november),
                    'December': formatCurrency(item.december),
                    'Total Downloaded': formatCurrency(item.total),
                    'Total Spent': formatCurrency(item.spent),
                    'Remaining Balance': formatCurrency((Number(item.total) || 0) - (Number(item.spent) || 0))
                }));
            }
            return [];
        }

        case 'accountTitles': {
            const res = await fetch(`${base}/api/account-titles/list.php`, { headers: { 'Accept': 'application/json' } });
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                return json.data.map(item => ({
                    'G/L Code': item.gl_code || '-',
                    'Account Title': item.account_title || '-',
                    'Category': (item.category || 'mooe').toUpperCase(),
                    'Created Date': item.created_at ? item.created_at.split(' ')[0] : '-'
                }));
            }
            return [];
        }

        case 'itemized': {
            const res = await fetch(`${base}/api/itemized/list.php?year=${y}`, { headers: { 'Accept': 'application/json' } });
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                return json.data.map(item => ({
                    'DV Date': item.dvDate || '-',
                    'DV No.': item.dvNo || '-',
                    'G/L Code': item.glCode || '-',
                    'Payee': item.payee || '-',
                    'Particulars': item.particulars || '-',
                    'Check No.': item.checkNo || '-',
                    'Check Amount': formatCurrency(item.checkAmount || item.amount || 0),
                    'MOOE': formatCurrency(item.mooe || 0),
                    'SPF': formatCurrency(item.spf || 0),
                    'MCP': formatCurrency(item.mcpFacility || 0),
                    'Konsulta': formatCurrency(item.konsultaFacility || 0)
                }));
            }
            return [];
        }

        case 'monthlyExpenses': {
            const res = await fetch(`${base}/api/monthly-expenses/list.php?year=${y}`, { headers: { 'Accept': 'application/json' } });
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                return json.data.map(item => ({
                    'G/L Code': item.gl_code || '-',
                    'Account Title': item.account_title || '-',
                    'Total Expenses': formatCurrency(item.total)
                }));
            }
            return [];
        }

        default:
            return [];
    }
}

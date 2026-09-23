/** Dashboard financial charts: mock data placeholders until API endpoints are connected. */
let ApexCharts = null;

const charts = {};
const peso = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
});

const STORAGE_KEY = 'cho_cashflow_year';
const SUPPLIES_VIEW_KEY = 'cho_supplies_view';
const REMAINING_YEAR_KEY = 'cho_remaining_budget_year';
const SUPPLIES_YEAR_KEY = 'cho_supplies_year';
const SUPPLIES_MONTH_KEY = 'cho_supplies_month';
const OFFICE_YEAR_KEY = 'cho_office_financial_year';
let suppliesView = localStorage.getItem(SUPPLIES_VIEW_KEY) === 'payment' ? 'payment' : 'category';
let remainingBudgetYear = localStorage.getItem(REMAINING_YEAR_KEY) || '2026';
let suppliesYear = localStorage.getItem(SUPPLIES_YEAR_KEY) || '2026';
let suppliesMonth = localStorage.getItem(SUPPLIES_MONTH_KEY) || 'all';
let officeFinancialYear = localStorage.getItem(OFFICE_YEAR_KEY) || '2026';

const mock = {
    stats: {
        totalBudget: 418750000,
        yearlyBudget: 418750000,
        totalExpenses: 173840000,
        fundDownloaded: 244910000,
    },
    cashflow: {
        2026: {
            cashInBank: [12400000, 9800000, 14850000, 16200000, 13750000, 18450000, 17200000, 19650000, 22100000, 18800000, 24350000, 26750000],
            expenses: [8100000, 6300000, 9000000, 10250000, 8700000, 12000000, 11100000, 13600000, 14900000, 12800000, 16650000, 18350000],
            recordedAt: 'Updated Sep 22, 2026 08:30 AM',
        },
        2025: {
            cashInBank: [10250000, 8900000, 11800000, 13300000, 12750000, 15100000, 16200000, 17400000, 18900000, 17100000, 19800000, 21600000],
            expenses: [6800000, 5900000, 7200000, 8600000, 8200000, 9700000, 10800000, 11600000, 12600000, 11900000, 13900000, 15100000],
            recordedAt: 'Closed Dec 31, 2025 05:00 PM',
        },
        2024: {
            cashInBank: [8800000, 7600000, 9600000, 11200000, 10400000, 12900000, 13800000, 15100000, 16300000, 15400000, 17700000, 19200000],
            expenses: [5200000, 4800000, 6100000, 7300000, 7000000, 8400000, 9300000, 10100000, 11200000, 10700000, 12100000, 13400000],
            recordedAt: 'Closed Dec 31, 2024 05:00 PM',
        },
    },
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    remaining: [28500000, 24000000, 18800000, 15100000, 11900000, 9400000, 7200000, 5200000, 3500000, 2100000, 1100000, 420000],
    supplies: [
        { name: 'Medicines', y: 7450000, color: '#0F766E', method: 'Cheque', recordedAt: 'Sep 21, 2026 02:40 PM' },
        { name: 'Laboratory supplies', y: 4250000, color: '#2563EB', method: 'Cheque', recordedAt: 'Sep 20, 2026 11:10 AM' },
        { name: 'Office supplies', y: 2980000, color: '#F59E0B', method: 'Cash', recordedAt: 'Sep 20, 2026 10:15 AM' },
        { name: 'Medical equipment', y: 3420000, color: '#BE123C', method: 'Cheque', recordedAt: 'Sep 19, 2026 03:25 PM' },
    ],
    offices: [
        { name: 'BTSD MOOE - Income', data: [12500000, 14500000, 16800000, 18100000, 19400000, 22100000, 23900000, 25800000, 27600000, 29100000, 31800000, 34200000] },
        { name: 'BTSD SPF Programs - Expenses', data: [8200000, 9600000, 11100000, 12600000, 13900000, 15100000, 16800000, 18200000, 19700000, 21400000, 23200000, 24900000] },
        { name: 'PhilHealth Konsulta/Yakap/MCP - Income', data: [4800000, 5200000, 6100000, 6900000, 7300000, 8100000, 9200000, 10100000, 11200000, 12100000, 13400000, 14800000] },
        { name: 'CHO Professional Fee Account - Expenses', data: [3100000, 3600000, 4200000, 4700000, 5100000, 5800000, 6400000, 7200000, 7900000, 8600000, 9400000, 10300000] },
    ],
    dv: [
        ['DV-2026-0018', 'City Health Office - BTSD', 'Medical supplies replenishment', 1850000, 'Sep 21, 2026 09:42 AM', 'For review'],
        ['DV-2026-0019', 'CHO Marawi BARMM', 'Konsulta medicines', 2345000, 'Sep 20, 2026 02:16 PM', 'For approval'],
        ['DV-2026-0020', 'CHO Professional Fee Account', 'MCP professional fees', 980000, 'Sep 19, 2026 10:08 AM', 'For review'],
        ['DV-2026-0021', 'City Health Office - BTSD', 'Laboratory reagents', 1265000, 'Sep 18, 2026 04:25 PM', 'For approval'],
        ['DV-2026-0022', 'CHO Marawi BARMM', 'Yakap facility expenses', 3180000, 'Sep 17, 2026 11:31 AM', 'For review'],
        ['DV-2026-0023', 'City Health Office - BTSD', 'Office operating expenses', 745000, 'Sep 16, 2026 08:54 AM', 'For approval'],
    ],
};

const money = value => peso.format(Number(value || 0));
const sum = values => values.reduce((total, value) => total + Number(value || 0), 0);

function compactMoney(value) {
    const numeric = Number(value || 0);
    const amount = Math.abs(numeric);
    const sign = numeric < 0 ? '-' : '';
    const units = [
        { value: 1_000_000_000, suffix: 'B' },
        { value: 1_000_000, suffix: 'M' },
        { value: 1_000, suffix: 'k' },
    ];
    const unit = units.find(item => amount >= item.value);
    if (!unit) return `${sign}\u20B1${amount.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
    const compact = amount / unit.value;
    const digits = compact >= 10 || Number.isInteger(compact) ? 0 : 1;
    return `${sign}\u20B1${compact.toLocaleString('en-PH', { maximumFractionDigits: digits })}${unit.suffix}`;
}

function percentage(value, total) {
    return total > 0 ? (Number(value || 0) / total) * 100 : 0;
}

function yearFactor(year) {
    return ({ 2026: 1, 2025: 0.86, 2024: 0.74 })[String(year)] || 1;
}

function monthFactor(month) {
    if (!month || month === 'all') return 1;
    const index = Math.max(mock.months.indexOf(month), 0);
    return 0.052 + (index * 0.006);
}

function scaleValues(values, factor) {
    return values.map(value => Math.round(Number(value || 0) * factor));
}

function setSelectValue(id, value) {
    const select = document.getElementById(id);
    if (select) select.value = value;
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
    el.classList.remove('is-rolling');
    void el.offsetWidth;
    el.classList.add('is-rolling');
}

// START: Animate Rolling Counter Number Animation
const activeNumberAnimations = new Map();

function animateRollingNumber(id, targetValue, duration = 1200) {
    const el = document.getElementById(id);
    if (!el) return;

    if (activeNumberAnimations.has(id)) {
        cancelAnimationFrame(activeNumberAnimations.get(id));
        activeNumberAnimations.delete(id);
    }

    const start = performance.now();
    const startValue = 0;
    const finalNumeric = Number(targetValue || 0);

    const step = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        // Easing: easeOutExpo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = Math.round(startValue + (finalNumeric - startValue) * ease);

        el.textContent = money(currentVal);

        if (progress < 1) {
            const frameId = requestAnimationFrame(step);
            activeNumberAnimations.set(id, frameId);
        } else {
            el.textContent = money(finalNumeric);
            activeNumberAnimations.delete(id);
            el.classList.remove('is-rolling');
            void el.offsetWidth;
            el.classList.add('is-rolling');
        }
    };

    const initialFrame = requestAnimationFrame(step);
    activeNumberAnimations.set(id, initialFrame);
}
// END: Animate Rolling Counter Number Animation

function render(id, options) {
    const el = document.getElementById(id);
    if (!el || !ApexCharts) return;
    if (charts[id]) charts[id].destroy();
    charts[id] = new ApexCharts(el, options);
    charts[id].render();
}

function baseChart(type, height = 320) {
    return {
        chart: { type, height, fontFamily: 'Inter, sans-serif', toolbar: { show: false }, zoom: { enabled: false } },
        dataLabels: { enabled: false },
        grid: { show: true, borderColor: '#9CA3AF', strokeDashArray: 5, xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
        legend: { labels: { colors: '#0F172A' }, fontWeight: 700 },
        tooltip: {
            theme: 'light',
            shared: false,
            intersect: false,
            x: { show: true },
            y: { formatter: money },
            fixed: { enabled: true, position: 'topRight', offsetX: -12, offsetY: 8 },
        },
    };
}

function activeCashflowYear() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return mock.cashflow[stored] ? stored : Object.keys(mock.cashflow).sort((a, b) => Number(b) - Number(a))[0];
}

function updateYearButtonState(year) {
    document.querySelectorAll('[data-cashflow-year]').forEach((button) => {
        const active = button.dataset.cashflowYear === String(year);
        button.classList.toggle('bg-slate-200', active);
        button.classList.toggle('text-slate-950', active);
        button.classList.toggle('font-black', active);
        button.setAttribute('aria-current', active ? 'true' : 'false');
    });
}

function renderCashflow(year = activeCashflowYear()) {
    const record = mock.cashflow[year] || mock.cashflow[activeCashflowYear()];
    const options = baseChart('area', 330);
    options.series = [
        { name: 'Cash In Bank (Deposits)', data: record.cashInBank },
        { name: 'Expenses (Disbursements)', data: record.expenses },
    ];
    options.colors = ['#075985', '#BE123C'];
    options.legend = {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        floating: false,
        offsetX: -18,
        offsetY: 0,
        fontSize: '14px',
        fontWeight: 800,
        labels: { colors: '#0F172A' },
        markers: { width: 13, height: 13, radius: 13 },
        itemMargin: { horizontal: 12, vertical: 4 },
    };
    options.grid = {
        ...options.grid,
        padding: { left: 12, right: 34, top: 4, bottom: 8 },
    };
    options.stroke = { curve: 'smooth', width: 4 };
    options.markers = { size: 4, strokeColors: '#FFFFFF', strokeWidth: 2, hover: { size: 6 } };
    options.fill = { type: 'gradient', gradient: { shadeIntensity: 0.55, opacityFrom: 0.70, opacityTo: 0.20, stops: [0, 80, 100] } };
    options.xaxis = { categories: mock.months, labels: { style: { colors: '#0F172A', fontWeight: 700 } }, axisBorder: { show: true, color: '#475569' }, axisTicks: { show: true, color: '#475569' }, tooltip: { enabled: false } };
    options.yaxis = { labels: { style: { colors: '#0F172A', fontWeight: 700 }, formatter: money } };
    options.responsive = [
        {
            breakpoint: 640,
            options: {
                chart: { height: 340 },
                plotOptions: { pie: { customScale: 0.88, offsetX: 0 } },
                legend: { position: 'bottom', horizontalAlign: 'center', floating: false, offsetX: 0, offsetY: 0 },
            },
        },
    ];
    options.tooltip = {
        theme: 'light',
        shared: false,
        intersect: false,
        fixed: { enabled: true, position: 'topRight', offsetX: -12, offsetY: 8 },
        x: { show: true },
        y: { formatter: (value, { seriesIndex, dataPointIndex }) => `${money(value)} ${seriesIndex === 0 ? 'deposit balance' : 'expense recorded'} on ${mock.months[dataPointIndex]} ${year}` },
        custom({ series, seriesIndex, dataPointIndex, w }) {
            const name = w.globals.seriesNames[seriesIndex];
            return `<div class="px-3 py-2 text-sm text-slate-900"><div class="font-bold">${mock.months[dataPointIndex]} ${year}</div><div>${name}: <span class="font-black">${money(series[seriesIndex][dataPointIndex])}</span></div><div class="mt-1 text-xs text-slate-600">${record.recordedAt}</div></div>`;
        },
    };
    setText('cashflowDataStatusLabel', year);
    animateRollingNumber('cashflowIncomeTotal', sum(record.cashInBank));
    animateRollingNumber('cashflowExpenseTotal', sum(record.expenses));
    updateYearButtonState(year);
    render('moneyCashflowChart', options);
}

function setupCashflowDropdown() {
    const button = document.getElementById('cashflowDataStatus');
    const dropdown = document.getElementById('cashflowPeriodDropdown');
    if (!button || !dropdown || button.dataset.cashflowReady === 'true') return;
    button.dataset.cashflowReady = 'true';
    button.addEventListener('click', (event) => { event.stopPropagation(); dropdown.classList.toggle('hidden'); });
    document.addEventListener('click', (event) => {
        if (!button.contains(event.target) && !dropdown.contains(event.target)) dropdown.classList.add('hidden');
    });
    dropdown.querySelectorAll('[data-cashflow-year]').forEach((item) => {
        item.addEventListener('click', () => {
            const year = item.dataset.cashflowYear;
            localStorage.setItem(STORAGE_KEY, year);
            dropdown.classList.add('hidden');
            renderCashflow(year);
            renderSupplies();
        });
    });
}

function renderStats() {
    animateRollingNumber('dashboardTotalIncome', mock.stats.totalBudget);
    animateRollingNumber('dashboardYearlyIncome', mock.stats.yearlyBudget);
    animateRollingNumber('dashboardTotalExpenses', mock.stats.totalExpenses);
    animateRollingNumber('dashboardFundDownloadedTotal', mock.stats.fundDownloaded);
}

function renderRemainingBudget() {
    const factor = yearFactor(remainingBudgetYear);
    const data = scaleValues(mock.remaining, factor);
    const options = baseChart('bar', 320);
    options.series = [{ name: `Remaining budget ${remainingBudgetYear}`, data }];
    options.plotOptions = { bar: { borderRadius: 3, columnWidth: '54%', distributed: true } };
    options.colors = ['#059669', '#10B981', '#CA8A04', '#F59E0B', '#F97316', '#EA580C', '#DC2626', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D', '#7F1D1D'];
    options.xaxis = { categories: mock.months, labels: { style: { colors: '#0F172A', fontWeight: 700 } } };
    options.yaxis = { labels: { style: { colors: '#0F172A', fontWeight: 700 }, formatter: money } };
    options.responsive = [
        {
            breakpoint: 640,
            options: {
                chart: { height: 340 },
                plotOptions: { pie: { customScale: 0.88, offsetX: 0 } },
                legend: { position: 'bottom', horizontalAlign: 'center', floating: false, offsetX: 0, offsetY: 0 },
            },
        },
    ];
    options.tooltip = { theme: 'light', shared: false, intersect: false, fixed: { enabled: true, position: 'topRight', offsetX: -12, offsetY: 8 }, y: { formatter: (value, { dataPointIndex }) => `${money(value)} remaining as of ${mock.months[dataPointIndex]} ${remainingBudgetYear}` } };
    setSelectValue('remainingBudgetYear', remainingBudgetYear);
    render('remainingBudgetChart', options);
}

function filteredSupplies() {
    const factor = yearFactor(suppliesYear) * monthFactor(suppliesMonth);
    return mock.supplies.map(item => ({
        ...item,
        y: Math.round(item.y * factor),
        recordedAt: suppliesMonth === 'all' ? `${suppliesYear} full-year mock data` : `${suppliesMonth} ${suppliesYear} mock data`,
    }));
}

function groupedSuppliesByPayment() {
    const groups = filteredSupplies().reduce((items, item) => {
        items[item.method] = (items[item.method] || 0) + item.y;
        return items;
    }, {});
    return [
        { name: 'Cash purchases', y: groups.Cash || 0, color: '#0F766E', recordedAt: 'Latest cash purchase: Sep 20, 2026 10:15 AM' },
        { name: 'Cheque purchases', y: groups.Cheque || 0, color: '#2563EB', recordedAt: 'Latest cheque purchase: Sep 21, 2026 02:40 PM' },
    ].filter(item => item.y > 0);
}

function updateSuppliesSwitcher() {
    document.querySelectorAll('[data-supplies-view]').forEach((button) => {
        const active = button.dataset.suppliesView === suppliesView;
        button.classList.toggle('bg-white', active);
        button.classList.toggle('text-slate-950', active);
        button.classList.toggle('shadow-sm', active);
        button.classList.toggle('text-slate-700', !active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
}

function suppliesChartItems() {
    return suppliesView === 'payment' ? groupedSuppliesByPayment() : filteredSupplies();
}

// START: Render Supplies Expense Donut Chart with Top-Left Legend and Right-Aligned Pie
function renderSupplies() {
    const year = activeCashflowYear();
    const cashflow = mock.cashflow[suppliesYear] || mock.cashflow[activeCashflowYear()];
    const currentBudget = sum(cashflow.cashInBank);
    const chartItems = suppliesChartItems();
    const suppliesTotal = sum(filteredSupplies().map(item => item.y));
    const chartTotal = sum(chartItems.map(item => item.y));
    const remainingAfterSupplies = Math.max(currentBudget - suppliesTotal, 0);
    const budgetUsedPercent = percentage(suppliesTotal, currentBudget);
    const options = baseChart('donut', 330);

    options.series = chartItems.map(item => item.y);
    options.labels = chartItems.map(item => item.name);
    options.colors = chartItems.map(item => item.color);
    options.stroke = { colors: ['#FFFFFF'], width: 3 };
    options.dataLabels = {
        enabled: true,
        formatter: value => `${Number(value || 0).toFixed(1)}%`,
        style: { fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: 900, colors: ['#FFFFFF'] },
        dropShadow: { enabled: true, top: 1, left: 1, blur: 2, opacity: 0.70 },
    };
    options.states = {
        hover: {
            filter: {
                type: 'lighten',
                value: 0.12,
            },
        },
        active: {
            allowMultipleDataPointsSelection: false,
            filter: {
                type: 'darken',
                value: 0.15,
            },
        },
    };
    options.plotOptions = {
        pie: {
            expandOnClick: true,
            customScale: 0.94,
            offsetX: 114,
            startAngle: -90,
            endAngle: 270,
            donut: {
                size: '60%',
                labels: {
                    show: true,
                    name: { show: true, offsetY: 18, color: '#334155', fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 800 },
                    value: { show: true, offsetY: -12, color: '#0F172A', fontSize: '28px', fontFamily: 'Inter, sans-serif', fontWeight: 900, formatter: compactMoney },
                    total: {
                        show: true,
                        showAlways: true,
                        label: suppliesView === 'payment' ? 'payment mix' : `${budgetUsedPercent.toFixed(1)}% of bank`,
                        color: '#334155',
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 800,
                        formatter: () => compactMoney(suppliesTotal),
                    },
                },
            },
        },
    };
    options.legend = {
        position: 'left',
        horizontalAlign: 'left',
        floating: true,
        offsetX: -16,
        offsetY: -10,
        fontSize: '13px',
        fontWeight: 800,
        labels: { colors: '#0F172A' },
        markers: { width: 13, height: 13, radius: 4 },
        itemMargin: { horizontal: 0, vertical: 7 },
        onItemClick: { toggleDataSeries: true },
        onItemHover: { highlightDataSeries: true },
        formatter: (seriesName, opts) => `${seriesName} (${percentage(opts.w.globals.series[opts.seriesIndex], chartTotal).toFixed(1)}%)`,
    };
    options.responsive = [
        {
            breakpoint: 640,
            options: {
                chart: { height: 350 },
                plotOptions: { pie: { customScale: 0.92, offsetX: 0 } },
                legend: { position: 'bottom', horizontalAlign: 'center', floating: false, offsetX: 0, offsetY: 0 },
            },
        },
    ];
    options.tooltip = {
        theme: 'light',
        shared: false,
        intersect: false,
        fixed: { enabled: true, position: 'topRight', offsetX: -12, offsetY: 8 },
        y: {
            formatter: (value, { seriesIndex }) => {
                const item = chartItems[seriesIndex];
                const percentText = percentage(value, chartTotal).toFixed(1);
                const paymentText = suppliesView === 'payment' ? item.recordedAt : `paid by ${item.method}`;
                return `${money(value)} - ${percentText}% - ${paymentText}`;
            },
        },
        custom({ series, seriesIndex, w }) {
            const value = series[seriesIndex];
            const item = chartItems[seriesIndex];
            const paymentLine = suppliesView === 'payment' ? item.recordedAt : `Payment: ${item.method}`;
            return `<div class="px-3 py-2 text-sm text-slate-900">
                <div class="font-black">${w.globals.labels[seriesIndex]}</div>
                <div>${money(value)} <span class="font-bold">(${percentage(value, chartTotal).toFixed(1)}%)</span></div>
                <div class="mt-1 text-xs text-slate-600">${paymentLine}</div>
                <div class="text-xs text-slate-600">Budget used: ${budgetUsedPercent.toFixed(1)}% of ${money(currentBudget)}</div>
                <div class="text-xs text-slate-600">Remaining after supplies: ${money(remainingAfterSupplies)}</div>
            </div>`;
        },
    };
    render('suppliesExpenseChart', options);
    bindSuppliesLegendInteractions();
    updateSuppliesSwitcher();
}
// END: Render Supplies Expense Donut Chart with Top-Left Legend and Right-Aligned Pie

// START: Bind Supplies Legend Hover and Click Underline Interactions
function bindSuppliesLegendInteractions() {
    requestAnimationFrame(() => {
        const container = document.getElementById('suppliesExpenseChart');
        if (!container) return;
        const legendItems = container.querySelectorAll('.apexcharts-legend-series');
        legendItems.forEach((item) => {
            if (item.dataset.legendBound === 'true') return;
            item.dataset.legendBound = 'true';
            item.addEventListener('click', () => {
                item.classList.toggle('is-active');
            });
        });
    });
}
// END: Bind Supplies Legend Hover and Click Underline Interactions

function setupSuppliesSwitcher() {
    document.querySelectorAll('[data-supplies-view]').forEach((button) => {
        if (button.dataset.suppliesReady === 'true') return;
        button.dataset.suppliesReady = 'true';
        button.addEventListener('click', () => {
            suppliesView = button.dataset.suppliesView === 'payment' ? 'payment' : 'category';
            localStorage.setItem(SUPPLIES_VIEW_KEY, suppliesView);
            renderSupplies();
        });
    });
    updateSuppliesSwitcher();
}
// START: Render Office Income and Expenses Area Chart with Gradient
function renderOffice() {
    const factor = yearFactor(officeFinancialYear);
    const options = baseChart('area', 360);
    options.series = mock.offices.map(item => ({ ...item, data: scaleValues(item.data, factor) }));
    options.colors = ['#1D4ED8', '#DC2626', '#059669', '#7C3AED'];
    options.stroke = { curve: 'smooth', width: 3.5 };
    options.fill = { type: 'gradient', gradient: { shadeIntensity: 0.5, opacityFrom: 0.58, opacityTo: 0.12, stops: [0, 85, 100] } };
    options.markers = { size: 4, strokeColors: '#FFFFFF', strokeWidth: 2, hover: { size: 6 } };
    options.legend = {
        position: 'bottom',
        horizontalAlign: 'center',
        floating: false,
        fontSize: '13px',
        fontWeight: 700,
        labels: { colors: '#0F172A' },
        markers: { width: 12, height: 12, radius: 12 },
        itemMargin: { horizontal: 10, vertical: 4 },
        onItemHover: { highlightDataSeries: true },
    };
    options.xaxis = {
        categories: mock.months,
        labels: { style: { colors: '#0F172A', fontWeight: 700 } },
        axisBorder: { show: true, color: '#475569' },
        axisTicks: { show: true, color: '#475569' },
        tooltip: { enabled: false },
    };
    options.yaxis = { labels: { style: { colors: '#0F172A', fontWeight: 700 }, formatter: money } };
    options.responsive = [
        {
            breakpoint: 640,
            options: {
                chart: { height: 340 },
                legend: { position: 'bottom', horizontalAlign: 'center', floating: false },
            },
        },
    ];
    options.tooltip = {
        theme: 'light',
        shared: false,
        intersect: false,
        fixed: { enabled: true, position: 'topRight', offsetX: -12, offsetY: 8 },
        x: { show: true },
        y: { formatter: (value, { dataPointIndex }) => `${money(value)} recorded in ${mock.months[dataPointIndex]} ${officeFinancialYear}` },
        custom({ series, seriesIndex, dataPointIndex, w }) {
            const name = w.globals.seriesNames[seriesIndex];
            const val = series[seriesIndex][dataPointIndex];
            return `<div class="px-3 py-2 text-sm text-slate-900">
                <div class="font-bold">${mock.months[dataPointIndex]} ${officeFinancialYear}</div>
                <div>${name}: <span class="font-black">${money(val)}</span></div>
                <div class="mt-1 text-xs text-slate-500">Office Financial Record</div>
            </div>`;
        },
    };
    setSelectValue('officeFinancialYear', officeFinancialYear);
    render('officeFinancialChart', options);
}
// END: Render Office Income and Expenses Area Chart with Gradient

function renderPendingDvs() {
    const body = document.getElementById('pendingDvTableBody');
    if (!body) return;
    body.innerHTML = mock.dv.map(([no, payee, purpose, amount, recorded, status]) => `<tr class="hover:bg-slate-50"><td class="whitespace-nowrap px-3 py-3 font-bold text-slate-900">${no}</td><td class="px-3 py-3">${payee}</td><td class="px-3 py-3">${purpose}</td><td class="whitespace-nowrap px-3 py-3 font-bold text-slate-900">${money(amount)}</td><td class="whitespace-nowrap px-3 py-3 text-xs">${recorded}</td><td class="px-3 py-3"><span class="inline-flex rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">${status}</span></td></tr>`).join('');
}

function setupPeriodControls() {
    const remainingSelect = document.getElementById('remainingBudgetYear');
    if (remainingSelect && remainingSelect.dataset.ready !== 'true') {
        remainingSelect.dataset.ready = 'true';
        remainingSelect.value = remainingBudgetYear;
        remainingSelect.addEventListener('change', () => {
            remainingBudgetYear = remainingSelect.value;
            localStorage.setItem(REMAINING_YEAR_KEY, remainingBudgetYear);
            renderRemainingBudget();
        });
    }

    const suppliesYearSelect = document.getElementById('suppliesExpenseYear');
    if (suppliesYearSelect && suppliesYearSelect.dataset.ready !== 'true') {
        suppliesYearSelect.dataset.ready = 'true';
        suppliesYearSelect.value = suppliesYear;
        suppliesYearSelect.addEventListener('change', () => {
            suppliesYear = suppliesYearSelect.value;
            localStorage.setItem(SUPPLIES_YEAR_KEY, suppliesYear);
            renderSupplies();
        });
    }

    const suppliesMonthSelect = document.getElementById('suppliesExpenseMonth');
    if (suppliesMonthSelect && suppliesMonthSelect.dataset.ready !== 'true') {
        suppliesMonthSelect.dataset.ready = 'true';
        suppliesMonthSelect.value = suppliesMonth;
        suppliesMonthSelect.addEventListener('change', () => {
            suppliesMonth = suppliesMonthSelect.value;
            localStorage.setItem(SUPPLIES_MONTH_KEY, suppliesMonth);
            renderSupplies();
        });
    }

    const officeSelect = document.getElementById('officeFinancialYear');
    if (officeSelect && officeSelect.dataset.ready !== 'true') {
        officeSelect.dataset.ready = 'true';
        officeSelect.value = officeFinancialYear;
        officeSelect.addEventListener('change', () => {
            officeFinancialYear = officeSelect.value;
            localStorage.setItem(OFFICE_YEAR_KEY, officeFinancialYear);
            renderOffice();
        });
    }
}
function renderAll() {
    renderStats();
    setupSuppliesSwitcher();
    setupPeriodControls();
    renderCashflow();
    renderRemainingBudget();
    renderSupplies();
    renderOffice();
    renderPendingDvs();
}

export async function init() {
    if (!document.getElementById('moneyCashflowChart')) return;
    await new Promise(resolve => requestAnimationFrame(resolve));
    ApexCharts = (await import('apexcharts')).default;
    setupCashflowDropdown();

    renderAll();
}

window.initPageCharts = () => {
    if (ApexCharts) renderAll();
};

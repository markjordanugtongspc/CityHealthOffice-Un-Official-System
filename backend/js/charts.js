/**
 * Charts module for Dashboard
 * Modern Flowbite Charts implementation using ApexCharts
 */

// Color palette matching brand colors
const colors = {
    primary: '#224796',
    secondary: '#FCF350',
    accent1: '#16A34A',
    accent2: '#DC2626',
    accent3: '#E5E7EB',
    chartColors: [
        '#224796',
        '#FCF350',
        '#16A34A',
        '#3B82F6',
        '#8B5CF6',
        '#EC4899',
        '#F59E0B',
        '#10B981',
        '#EF4444',
        '#6366F1',
        '#14B8A6',
        '#F97316'
    ]
};

let ApexCharts;
const chartInstances = {};

/**
 * Initialize all charts
 */
export async function init() {
    try {
        const apexchartsModule = await import('apexcharts');
        
        if (typeof apexchartsModule.default !== 'undefined') {
            ApexCharts = apexchartsModule.default;
        } else if (typeof apexchartsModule.ApexCharts !== 'undefined') {
            ApexCharts = apexchartsModule.ApexCharts;
        } else if (typeof apexchartsModule === 'function') {
            ApexCharts = apexchartsModule;
        } else {
            ApexCharts = apexchartsModule.default || apexchartsModule;
        }
        
        if (!ApexCharts || typeof ApexCharts !== 'function') {
            console.error('ApexCharts not found or not a constructor');
            return;
        }
        
        const initCharts = () => {
            setTimeout(() => {
                initializeCharts();
            }, 300);
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initCharts);
        } else {
            initCharts();
        }
    } catch (error) {
        console.error('Failed to load ApexCharts:', error);
    }
}

/**
 * Initialize all chart instances
 */
function initializeCharts() {
    if (!ApexCharts) {
        console.error('ApexCharts not loaded');
        return;
    }
    
    // Page 1: Vouchers Charts
    initMonthlyVouchersChart();
    initWeeklyVouchersChart();
    initDailyVouchersChart();
    initYearlyVouchersChart();
    
    // Page 2: Daily Transactions Charts
    initDailyTransactionsChart();
    initTransactionVolumeChart();
    
    // Page 3: Monthly/Weekly Transactions Charts
    initMonthlyTransactionsChart();
    initWeeklyTransactionsChart();
    
    // Page 4: Quarterly Transactions Charts
    initQuarterlyTransactionsChart();
    initQuarterlyComparisonChart();
    
    // Page 5: Expenses Charts
    initExpensesOverviewChart();
    initExpensesCategoryChart();
    
    // Page 6: Fund Downloaded Charts
    initFundDownloadedTimelineChart();
    initFundDownloadedSummaryChart();
}

/**
 * Initialize charts for a specific page
 */
window.initPageCharts = function(pageNumber) {
    if (!ApexCharts) return;
    
    setTimeout(() => {
        switch(pageNumber) {
            case 1:
                initMonthlyVouchersChart();
                initWeeklyVouchersChart();
                initDailyVouchersChart();
                initYearlyVouchersChart();
                break;
            case 2:
                initDailyTransactionsChart();
                initTransactionVolumeChart();
                break;
            case 3:
                initMonthlyTransactionsChart();
                initWeeklyTransactionsChart();
                break;
            case 4:
                initQuarterlyTransactionsChart();
                initQuarterlyComparisonChart();
                break;
            case 5:
                initExpensesOverviewChart();
                initExpensesCategoryChart();
                break;
            case 6:
                initFundDownloadedTimelineChart();
                initFundDownloadedSummaryChart();
                break;
        }
    }, 100);
};

/**
 * Monthly Vouchers Donut Chart - Flowbite Style
 */
function initMonthlyVouchersChart() {
    const chartElement = document.getElementById('monthlyVouchersChart');
    if (!chartElement || !ApexCharts) return;

    // Brand colors
    const brandColor = colors.primary;
    const brandSecondaryColor = colors.secondary;
    const brandTertiaryColor = colors.accent1;

    // Monthly voucher data (current year)
    const monthlyData = {
        'Jan': { value: 285, quarter: 'Q1' },
        'Feb': { value: 312, quarter: 'Q1' },
        'Mar': { value: 298, quarter: 'Q1' },
        'Apr': { value: 345, quarter: 'Q2' },
        'May': { value: 367, quarter: 'Q2' },
        'Jun': { value: 389, quarter: 'Q2' },
        'Jul': { value: 425, quarter: 'Q3' },
        'Aug': { value: 398, quarter: 'Q3' },
        'Sep': { value: 356, quarter: 'Q3' },
        'Oct': { value: 334, quarter: 'Q4' },
        'Nov': { value: 301, quarter: 'Q4' },
        'Dec': { value: 278, quarter: 'Q4' }
    };

    const labels = Object.keys(monthlyData);
    const series = Object.values(monthlyData).map(item => item.value);
    const total = series.reduce((sum, val) => sum + val, 0);

    // Generate colors for 12 months using brand colors
    const generateColors = () => {
        const baseColors = [brandColor, brandSecondaryColor, brandTertiaryColor, '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899'];
        return baseColors.slice(0, 12);
    };

    const getChartOptions = () => {
        return {
            series: series,
            colors: generateColors(),
            chart: {
                height: 320,
                width: "100%",
                type: "donut",
                fontFamily: "inherit",
                toolbar: { show: false }
            },
            stroke: {
                colors: ["transparent"],
                lineCap: ""
            },
            plotOptions: {
                pie: {
                    donut: {
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontFamily: "inherit",
                                offsetY: 20,
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#64748B'
                            },
                            total: {
                                showAlways: true,
                                show: true,
                                label: "Total Vouchers",
                                fontFamily: "inherit",
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#1E293B',
                                formatter: function (w) {
                                    const sum = w.globals.seriesTotals.reduce((a, b) => {
                                        return a + b
                                    }, 0)
                                    return sum.toLocaleString()
                                }
                            },
                            value: {
                                show: true,
                                fontFamily: "inherit",
                                offsetY: -20,
                                fontSize: '20px',
                                fontWeight: 700,
                                color: '#1E293B',
                                formatter: function (value) {
                                    return value.toLocaleString()
                                }
                            }
                        },
                        size: "80%"
                    }
                }
            },
            grid: {
                padding: {
                    top: -2
                }
            },
            labels: labels,
            dataLabels: {
                enabled: false
            },
            legend: {
                position: "bottom",
                fontFamily: "inherit",
                fontSize: '13px',
                fontWeight: 500,
                labels: {
                    colors: '#64748B'
                },
                markers: {
                    width: 10,
                    height: 10,
                    radius: 5
                },
                formatter: function(seriesName, opts) {
                    const value = series[opts.seriesIndex];
                    const percentage = ((value / total) * 100).toFixed(1);
                    return seriesName + ': ' + value.toLocaleString() + ' (' + percentage + '%)';
                }
            },
            tooltip: {
                style: {
                    fontFamily: "inherit",
                    fontSize: '13px'
                },
                y: {
                    formatter: function (value) {
                        const percentage = ((value / total) * 100).toFixed(1);
                        return value.toLocaleString() + ' vouchers (' + percentage + '%)';
                    }
                },
                theme: 'dark',
                fillSeriesColor: true
            },
            responsive: [{
                breakpoint: 1024,
                options: {
                    chart: { height: 300 },
                    plotOptions: {
                        pie: {
                            donut: { size: '75%' }
                        }
                    }
                }
            }, {
                breakpoint: 768,
                options: {
                    chart: { height: 280 },
                    plotOptions: {
                        pie: {
                            donut: { size: '70%' }
                        }
                    }
                }
            }, {
                breakpoint: 640,
                options: {
                    chart: { height: 250 },
                    plotOptions: {
                        pie: {
                            donut: { size: '65%' }
                        }
                    }
                }
            }]
        };
    };

    try {
        if (chartInstances.monthly) {
            chartInstances.monthly.destroy();
        }
        
        const chart = new ApexCharts(chartElement, getChartOptions());
        chartInstances.monthly = chart;
        chart.render();

        // Get all the checkboxes for quarters
        const checkboxes = document.querySelectorAll('#voucher-quarters input[type="checkbox"]');

        // Function to handle the checkbox change event - show/hide months by quarter
        function handleCheckboxChange(event, chart) {
            const checkbox = event.target;
            const quarter = checkbox.value;
            const isChecked = checkbox.checked;
            
            // Get months for this quarter
            const quarterMonths = labels.filter(month => monthlyData[month].quarter === quarter);
            
            // Show or hide series for this quarter's months
            quarterMonths.forEach((month) => {
                const seriesIndex = labels.indexOf(month);
                if (isChecked) {
                    chart.showSeries(month);
                } else {
                    chart.hideSeries(month);
                }
            });
        }

        // Attach the event listener to each checkbox
        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', (event) => handleCheckboxChange(event, chart));
        });
    } catch (error) {
        console.error('Error creating monthly chart:', error);
    }
}

/**
 * Weekly Vouchers Line Chart - Modern Design
 */
function initWeeklyVouchersChart() {
    const chartElement = document.getElementById('weeklyVouchersChart');
    if (!chartElement || !ApexCharts) return;

    const weeklyData = [
        { label: 'W1', value: 78 },
        { label: 'W2', value: 82 },
        { label: 'W3', value: 75 },
        { label: 'W4', value: 89 },
        { label: 'W5', value: 91 },
        { label: 'W6', value: 95 },
        { label: 'W7', value: 88 },
        { label: 'W8', value: 102 }
    ];

    const options = {
        series: [{
            name: 'Vouchers Generated',
            data: weeklyData.map(item => item.value)
        }],
        chart: {
            type: 'area',
            height: 'auto',
            fontFamily: 'inherit',
            toolbar: { show: false },
            zoom: { enabled: false },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                }
            },
            sparkline: { enabled: false }
        },
        colors: [colors.primary],
        stroke: {
            curve: 'smooth',
            width: 3,
            lineCap: 'round'
        },
        markers: {
            size: [5, 5, 5, 5, 5, 5, 5, 7],
            colors: [colors.primary],
            strokeColors: '#ffffff',
            strokeWidth: 3,
            hover: { size: 8 },
            radius: 4
        },
        dataLabels: { enabled: false },
        grid: {
            borderColor: colors.accent3,
            strokeDashArray: 3,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            }
        },
        xaxis: {
            categories: weeklyData.map(item => item.label),
            labels: {
                style: {
                    colors: '#64748B',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    fontWeight: 600
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#64748B',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    fontWeight: 600
                },
                formatter: (val) => val.toString()
            },
            min: 0
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.4,
                gradientToColors: [colors.primary + '30'],
                inverseColors: false,
                opacityFrom: 0.5,
                opacityTo: 0.1,
                stops: [0, 50, 100]
            }
        },
        tooltip: {
            style: { fontSize: '13px', fontFamily: 'inherit' },
            y: { formatter: (val) => val + ' vouchers' },
            theme: 'dark',
            fillSeriesColor: true,
            marker: { show: true }
        },
        responsive: [{
            breakpoint: 1024,
            options: {
                chart: { height: 320 }
            }
        }, {
            breakpoint: 768,
            options: {
                chart: { height: 280 },
                markers: { size: 4 }
            }
        }, {
            breakpoint: 640,
            options: {
                chart: { height: 250 },
                xaxis: { labels: { fontSize: '10px' } },
                yaxis: { labels: { fontSize: '10px' } }
            }
        }]
    };

    try {
        if (chartInstances.weekly) {
            chartInstances.weekly.destroy();
        }
        const chart = new ApexCharts(chartElement, options);
        chartInstances.weekly = chart;
        chart.render();
    } catch (error) {
        console.error('Error creating weekly chart:', error);
    }
}

/**
 * Daily Vouchers Column Chart - Flowbite Style
 */
function initDailyVouchersChart() {
    const chartElement = document.getElementById('dailyVouchersChart');
    if (!chartElement || !ApexCharts) return;

    // Daily voucher data - split into two categories for grouped columns
    const dailyData = [
        { x: 'Mon', y: 18 },
        { x: 'Tue', y: 22 },
        { x: 'Wed', y: 19 },
        { x: 'Thu', y: 25 },
        { x: 'Fri', y: 28 },
        { x: 'Sat', y: 12 },
        { x: 'Sun', y: 8 }
    ];

    // Simulated second series data (e.g., different voucher types)
    const dailyDataSecondary = [
        { x: 'Mon', y: 15 },
        { x: 'Tue', y: 18 },
        { x: 'Wed', y: 16 },
        { x: 'Thu', y: 20 },
        { x: 'Fri', y: 24 },
        { x: 'Sat', y: 10 },
        { x: 'Sun', y: 6 }
    ];

    // Calculate stats
    const total = dailyData.reduce((sum, item) => sum + item.y, 0);
    const average = (total / dailyData.length).toFixed(1);
    const maxDay = dailyData.reduce((max, item) => item.y > max.y ? item : max, dailyData[0]);
    const previousWeekTotal = 115; // Simulated previous week
    const growthPercentage = (((total - previousWeekTotal) / previousWeekTotal) * 100).toFixed(1);

    // Update stats in HTML
    const totalElement = document.getElementById('dailyTotalVouchers');
    const growthElement = document.getElementById('dailyGrowthPercentage');
    const peakDayElement = document.getElementById('dailyPeakDay');
    const averageElement = document.getElementById('dailyAverage');

    if (totalElement) totalElement.textContent = total.toString();
    if (growthElement) growthElement.textContent = `${growthPercentage > 0 ? '+' : ''}${growthPercentage}%`;
    if (peakDayElement) peakDayElement.textContent = maxDay.x;
    if (averageElement) averageElement.textContent = average;

    const options = {
        colors: [colors.primary, colors.secondary],
        series: [
            {
                name: 'Primary Vouchers',
                color: colors.primary,
                data: dailyData
            },
            {
                name: 'Secondary Vouchers',
                color: colors.secondary,
                data: dailyDataSecondary
            }
        ],
        chart: {
            type: 'bar',
            height: '320px',
            fontFamily: 'inherit',
            toolbar: { show: false },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 100
                }
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '70%',
                borderRadiusApplication: 'end',
                borderRadius: 8
            }
        },
        tooltip: {
            shared: true,
            intersect: false,
            style: {
                fontFamily: 'inherit',
                fontSize: '13px'
            },
            y: {
                formatter: (val) => val + ' vouchers'
            },
            theme: 'dark',
            fillSeriesColor: true
        },
        states: {
            hover: {
                filter: {
                    type: 'darken',
                    value: 0.15
                }
            }
        },
        stroke: {
            show: true,
            width: 0,
            colors: ['transparent']
        },
        grid: {
            show: false,
            strokeDashArray: 4,
            padding: {
                left: 2,
                right: 2,
                top: -14
            }
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            show: false
        },
        xaxis: {
            floating: false,
            labels: {
                show: true,
                style: {
                    fontFamily: 'inherit',
                    fontSize: '12px',
                    fontWeight: 500,
                    colors: '#64748B'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            show: false
        },
        fill: {
            opacity: 1
        },
        responsive: [{
            breakpoint: 1024,
            options: {
                chart: { height: '300px' }
            }
        }, {
            breakpoint: 768,
            options: {
                chart: { height: '280px' },
                plotOptions: { bar: { columnWidth: '65%' } }
            }
        }, {
            breakpoint: 640,
            options: {
                chart: { height: '250px' },
                plotOptions: { bar: { columnWidth: '60%' } },
                xaxis: { labels: { fontSize: '11px' } }
            }
        }]
    };

    try {
        if (chartInstances.daily) {
            chartInstances.daily.destroy();
        }
        const chart = new ApexCharts(chartElement, options);
        chartInstances.daily = chart;
        chart.render();
    } catch (error) {
        console.error('Error creating daily chart:', error);
    }
}

/**
 * Yearly Vouchers Chart (2016-2026) - Modern Design
 */
function initYearlyVouchersChart() {
    const chartElement = document.getElementById('yearlyVouchersChart');
    if (!chartElement || !ApexCharts) return;

    const yearlyData = [
        { year: '2016', value: 1845 },
        { year: '2017', value: 1923 },
        { year: '2018', value: 2108 },
        { year: '2019', value: 2287 },
        { year: '2020', value: 2156 },
        { year: '2021', value: 2345 },
        { year: '2022', value: 2678 },
        { year: '2023', value: 2891 },
        { year: '2024', value: 3124 },
        { year: '2025', value: 3456 },
        { year: '2026', value: 3789 }
    ];

    const currentYear = yearlyData[yearlyData.length - 1];
    const isCurrentYear = (year) => year === currentYear.year;

    const options = {
        series: [{
            name: 'Vouchers Generated',
            data: yearlyData.map(item => item.value)
        }],
        chart: {
            type: 'bar',
            height: 'auto',
            fontFamily: 'inherit',
            toolbar: { show: false },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 1000,
                animateGradually: {
                    enabled: true,
                    delay: 100
                }
            }
        },
        colors: yearlyData.map((item, index) => {
            if (isCurrentYear(item.year)) {
                return colors.primary;
            }
            return index % 2 === 0 ? colors.primary : colors.secondary;
        }),
        plotOptions: {
            bar: {
                borderRadius: 8,
                columnWidth: '60%',
                distributed: true,
                dataLabels: { position: 'top' },
                borderRadiusApplication: 'end',
                horizontal: false
            }
        },
        dataLabels: {
            enabled: true,
            offsetY: -25,
            style: {
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'inherit',
                colors: ['#1E293B']
            },
            formatter: (val) => val.toLocaleString(),
            dropShadow: {
                enabled: true,
                top: 1,
                left: 1,
                blur: 1,
                opacity: 0.2
            }
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['#fff']
        },
        grid: {
            borderColor: colors.accent3,
            strokeDashArray: 3,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
            padding: { top: 0, right: 0, bottom: 0, left: 0 }
        },
        xaxis: {
            categories: yearlyData.map(item => item.year),
            labels: {
                style: {
                    colors: yearlyData.map(item => 
                        isCurrentYear(item.year) ? colors.primary : '#64748B'
                    ),
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    fontWeight: 600
                },
                rotate: -45,
                rotateAlways: false
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#64748B',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    fontWeight: 600
                },
                formatter: (val) => val.toLocaleString()
            },
            min: 0
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.4,
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 0.9,
                stops: [0, 50, 100]
            }
        },
        tooltip: {
            style: { fontSize: '13px', fontFamily: 'inherit' },
            y: { formatter: (val) => val.toLocaleString() + ' vouchers' },
            theme: 'dark',
            fillSeriesColor: true
        },
        states: {
            hover: {
                filter: {
                    type: 'darken',
                    value: 0.1
                }
            }
        },
        responsive: [{
            breakpoint: 1024,
            options: {
                chart: { height: 350 },
                plotOptions: { bar: { columnWidth: '65%' } },
                xaxis: { labels: { rotate: -45, fontSize: '11px' } }
            }
        }, {
            breakpoint: 768,
            options: {
                chart: { height: 320 },
                plotOptions: { bar: { columnWidth: '60%' } },
                dataLabels: { offsetY: -20, fontSize: '11px' },
                xaxis: { labels: { rotate: -45, fontSize: '10px' } }
            }
        }, {
            breakpoint: 640,
            options: {
                chart: { height: 280 },
                plotOptions: { bar: { columnWidth: '55%' } },
                dataLabels: { offsetY: -18, fontSize: '10px' },
                xaxis: { labels: { rotate: -45, fontSize: '9px' } },
                yaxis: { labels: { fontSize: '10px' } }
            }
        }]
    };

    try {
        if (chartInstances.yearly) {
            chartInstances.yearly.destroy();
        }
        const chart = new ApexCharts(chartElement, options);
        chartInstances.yearly = chart;
        chart.render();
    } catch (error) {
        console.error('Error creating yearly chart:', error);
    }
}

/**
 * Daily Transactions Line Chart
 */
function initDailyTransactionsChart() {
    const chartElement = document.getElementById('dailyTransactionsChart');
    if (!chartElement || !ApexCharts) return;

    const dailyData = Array.from({ length: 30 }, (_, i) => ({
        x: `Day ${i + 1}`,
        y: Math.floor(Math.random() * 500) + 100
    }));

    const options = {
        series: [{ name: 'Transactions', data: dailyData.map(d => d.y) }],
        colors: [colors.primary],
        chart: {
            type: 'line',
            height: '350px',
            fontFamily: 'inherit',
            toolbar: { show: false },
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: { categories: dailyData.map(d => d.x), labels: { style: { colors: '#64748B', fontSize: '12px' } } },
        yaxis: { labels: { style: { colors: '#64748B', fontSize: '12px' } } },
        grid: { borderColor: '#E2E8F0', strokeDashArray: 4 },
        tooltip: { theme: 'dark', style: { fontSize: '13px', fontFamily: 'inherit' } },
        dataLabels: { enabled: false },
        legend: { show: false },
        responsive: [{
            breakpoint: 768,
            options: { chart: { height: 300 } }
        }]
    };

    try {
        if (chartInstances.dailyTransactions) chartInstances.dailyTransactions.destroy();
        const chart = new ApexCharts(chartElement, options);
        chartInstances.dailyTransactions = chart;
        chart.render();
    } catch (error) {
        console.error('Error creating daily transactions chart:', error);
    }
}

/**
 * Transaction Volume Chart
 */
function initTransactionVolumeChart() {
    const chartElement = document.getElementById('transactionVolumeChart');
    if (!chartElement || !ApexCharts) return;

    const volumeData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000) + 200);

    const options = {
        series: [{ name: 'Volume', data: volumeData }],
        colors: [colors.secondary],
        chart: {
            type: 'area',
            height: '350px',
            fontFamily: 'inherit',
            toolbar: { show: false },
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: { categories: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`), labels: { style: { colors: '#64748B', fontSize: '12px' } } },
        yaxis: { labels: { style: { colors: '#64748B', fontSize: '12px' } } },
        grid: { borderColor: '#E2E8F0', strokeDashArray: 4 },
        tooltip: { theme: 'dark', style: { fontSize: '13px', fontFamily: 'inherit' } },
        dataLabels: { enabled: false },
        legend: { show: false },
        responsive: [{
            breakpoint: 768,
            options: { chart: { height: 300 } }
        }]
    };

    try {
        if (chartInstances.transactionVolume) chartInstances.transactionVolume.destroy();
        const chart = new ApexCharts(chartElement, options);
        chartInstances.transactionVolume = chart;
        chart.render();
    } catch (error) {
        console.error('Error creating transaction volume chart:', error);
    }
}

/**
 * Monthly Transactions Chart
 */
function initMonthlyTransactionsChart() {
    const chartElement = document.getElementById('monthlyTransactionsChart');
    if (!chartElement || !ApexCharts) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map(() => Math.floor(Math.random() * 5000) + 2000);

    const options = {
        series: [{ name: 'Transactions', data: monthlyData }],
        colors: [colors.primary],
        chart: {
            type: 'bar',
            height: '350px',
            fontFamily: 'inherit',
            toolbar: { show: false },
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        plotOptions: { bar: { borderRadius: 8, columnWidth: '60%' } },
        xaxis: { categories: months, labels: { style: { colors: '#64748B', fontSize: '12px' } } },
        yaxis: { labels: { style: { colors: '#64748B', fontSize: '12px' } } },
        grid: { borderColor: '#E2E8F0', strokeDashArray: 4 },
        tooltip: { theme: 'dark', style: { fontSize: '13px', fontFamily: 'inherit' } },
        dataLabels: { enabled: false },
        legend: { show: false },
        responsive: [{
            breakpoint: 768,
            options: { chart: { height: 300 } }
        }]
    };

    try {
        if (chartInstances.monthlyTransactions) chartInstances.monthlyTransactions.destroy();
        const chart = new ApexCharts(chartElement, options);
        chartInstances.monthlyTransactions = chart;
        chart.render();
    } catch (error) {
        console.error('Error creating monthly transactions chart:', error);
    }
}

/**
 * Weekly Transactions Chart
 */
function initWeeklyTransactionsChart() {
    const chartElement = document.getElementById('weeklyTransactionsChart');
    if (!chartElement || !ApexCharts) return;

    const weeks = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);
    const weeklyData = weeks.map(() => Math.floor(Math.random() * 2000) + 500);

    const options = {
        series: [{ name: 'Transactions', data: weeklyData }],
        colors: [colors.secondary],
        chart: {
            type: 'line',
            height: '350px',
            fontFamily: 'inherit',
            toolbar: { show: false },
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } },
        xaxis: { categories: weeks, labels: { style: { colors: '#64748B', fontSize: '12px' } } },
        yaxis: { labels: { style: { colors: '#64748B', fontSize: '12px' } } },
        grid: { borderColor: '#E2E8F0', strokeDashArray: 4 },
        tooltip: { theme: 'dark', style: { fontSize: '13px', fontFamily: 'inherit' } },
        dataLabels: { enabled: false },
        legend: { show: false },
        responsive: [{
            breakpoint: 768,
            options: { chart: { height: 300 } }
        }]
    };

    try {
        if (chartInstances.weeklyTransactions) chartInstances.weeklyTransactions.destroy();
        const chart = new ApexCharts(chartElement, options);
        chartInstances.weeklyTransactions = chart;
        chart.render();
    } catch (error) {
        console.error('Error creating weekly transactions chart:', error);
    }
}

/**
 * Quarterly Transactions Donut Chart
 */
function initQuarterlyTransactionsChart() {
    const chartElement = document.getElementById('quarterlyTransactionsChart');
    if (!chartElement || !ApexCharts) return;

    const options = {
        series: [12500, 15200, 13800, 14500],
        colors: [colors.primary, colors.secondary, colors.accent1, '#3B82F6'],
        chart: {
            height: 320,
            width: "100%",
            type: "donut",
            fontFamily: "inherit",
            toolbar: { show: false }
        },
        stroke: { colors: ["transparent"], lineCap: "" },
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        name: { show: true, fontFamily: "inherit", offsetY: 20, fontSize: '14px', fontWeight: 500, color: '#64748B' },
                        total: {
                            showAlways: true,
                            show: true,
                            label: "Total Transactions",
                            fontFamily: "inherit",
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#1E293B',
                            formatter: function (w) {
                                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                return sum.toLocaleString();
                            }
                        },
                        value: {
                            show: true,
                            fontFamily: "inherit",
                            offsetY: -20,
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#1E293B',
                            formatter: function (value) {
                                return value.toLocaleString();
                            }
                        }
                    },
                    size: "80%"
                }
            }
        },
        labels: ["Q1", "Q2", "Q3", "Q4"],
        dataLabels: { enabled: false },
        legend: {
            position: "bottom",
            fontFamily: "inherit",
            fontSize: '13px',
            fontWeight: 500,
            labels: { colors: '#64748B' }
        },
        tooltip: {
            style: { fontFamily: "inherit", fontSize: '13px' },
            y: { formatter: function (value) { return value.toLocaleString() + " transactions"; } },
            theme: 'dark',
            fillSeriesColor: true
        },
        responsive: [{
            breakpoint: 768,
            options: { chart: { height: 280 }, plotOptions: { pie: { donut: { size: '70%' } } } }
        }]
    };

    try {
        if (chartInstances.quarterlyTransactions) chartInstances.quarterlyTransactions.destroy();
        const chart = new ApexCharts(chartElement, options);
        chartInstances.quarterlyTransactions = chart;
        chart.render();
    } catch (error) {
        console.error('Error creating quarterly transactions chart:', error);
    }
}

/**
 * Quarterly Comparison Chart
 */
function initQuarterlyComparisonChart() {
    const chartElement = document.getElementById('quarterlyComparisonChart');
    if (!chartElement || !ApexCharts) return;

    const options = {
        series: [
            { name: '2024', data: [12500, 15200, 13800, 14500] },
            { name: '2023', data: [11000, 14000, 13000, 13500] }
        ],
        colors: [colors.primary, colors.secondary],
        chart: {
            type: 'bar',
            height: '350px',
            fontFamily: 'inherit',
            toolbar: { show: false },
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        plotOptions: { bar: { borderRadius: 8, columnWidth: '60%' } },
        xaxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4'], labels: { style: { colors: '#64748B', fontSize: '12px' } } },
        yaxis: { labels: { style: { colors: '#64748B', fontSize: '12px' } } },
        grid: { borderColor: '#E2E8F0', strokeDashArray: 4 },
        tooltip: { theme: 'dark', style: { fontSize: '13px', fontFamily: 'inherit' } },
        dataLabels: { enabled: false },
        legend: {
            position: 'top',
            fontFamily: 'inherit',
            fontSize: '13px',
            labels: { colors: '#64748B' }
        },
        responsive: [{
            breakpoint: 768,
            options: { chart: { height: 300 } }
        }]
    };

    try {
        if (chartInstances.quarterlyComparison) chartInstances.quarterlyComparison.destroy();
        const chart = new ApexCharts(chartElement, options);
        chartInstances.quarterlyComparison = chart;
        chart.render();
    } catch (error) {
        console.error('Error creating quarterly comparison chart:', error);
    }
}

/**
 * Expenses Overview Chart
 */
function initExpensesOverviewChart() {
    const chartElement = document.getElementById('expensesOverviewChart');
    if (!chartElement || !ApexCharts) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const expensesData = months.map(() => Math.floor(Math.random() * 50000) + 10000);

    const options = {
        series: [{ name: 'Expenses', data: expensesData }],
        colors: ['#DC2626'],
        chart: {
            type: 'bar',
            height: '350px',
            fontFamily: 'inherit',
            toolbar: { show: false },
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        plotOptions: { bar: { borderRadius: 8, columnWidth: '60%' } },
        xaxis: { categories: months, labels: { style: { colors: '#64748B', fontSize: '12px' } } },
        yaxis: { labels: { style: { colors: '#64748B', fontSize: '12px' }, formatter: (val) => `₱${(val / 1000).toFixed(0)}k` } },
        grid: { borderColor: '#E2E8F0', strokeDashArray: 4 },
        tooltip: {
            theme: 'dark',
            style: { fontSize: '13px', fontFamily: 'inherit' },
            y: { formatter: (val) => `₱${val.toLocaleString()}` }
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        responsive: [{
            breakpoint: 768,
            options: { chart: { height: 300 } }
        }]
    };

    try {
        if (chartInstances.expensesOverview) chartInstances.expensesOverview.destroy();
        const chart = new ApexCharts(chartElement, options);
        chartInstances.expensesOverview = chart;
        chart.render();
    } catch (error) {
        console.error('Error creating expenses overview chart:', error);
    }
}

/**
 * Expenses by Category Donut Chart
 */
function initExpensesCategoryChart() {
    const chartElement = document.getElementById('expensesCategoryChart');
    if (!chartElement || !ApexCharts) return;

    const options = {
        series: [35000, 28000, 22000, 15000, 10000],
        colors: ['#DC2626', '#EF4444', '#F59E0B', '#F97316', '#EC4899'],
        chart: {
            height: 320,
            width: "100%",
            type: "donut",
            fontFamily: "inherit",
            toolbar: { show: false }
        },
        stroke: { colors: ["transparent"], lineCap: "" },
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        name: { show: true, fontFamily: "inherit", offsetY: 20, fontSize: '14px', fontWeight: 500, color: '#64748B' },
                        total: {
                            showAlways: true,
                            show: true,
                            label: "Total Expenses",
                            fontFamily: "inherit",
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#1E293B',
                            formatter: function (w) {
                                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                return '₱' + (sum / 1000).toFixed(0) + 'k';
                            }
                        },
                        value: {
                            show: true,
                            fontFamily: "inherit",
                            offsetY: -20,
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#1E293B',
                            formatter: function (value) {
                                return '₱' + (value / 1000).toFixed(0) + 'k';
                            }
                        }
                    },
                    size: "80%"
                }
            }
        },
        labels: ["Office Supplies", "Utilities", "Travel", "Marketing", "Other"],
        dataLabels: { enabled: false },
        legend: {
            position: "bottom",
            fontFamily: "inherit",
            fontSize: '13px',
            fontWeight: 500,
            labels: { colors: '#64748B' }
        },
        tooltip: {
            style: { fontFamily: "inherit", fontSize: '13px' },
            y: { formatter: function (value) { return '₱' + value.toLocaleString(); } },
            theme: 'dark',
            fillSeriesColor: true
        },
        responsive: [{
            breakpoint: 768,
            options: { chart: { height: 280 }, plotOptions: { pie: { donut: { size: '70%' } } } }
        }]
    };

    try {
        if (chartInstances.expensesCategory) chartInstances.expensesCategory.destroy();
        const chart = new ApexCharts(chartElement, options);
        chartInstances.expensesCategory = chart;
        chart.render();
    } catch (error) {
        console.error('Error creating expenses category chart:', error);
    }
}

/**
 * Fund Downloaded Timeline Chart
 */
function initFundDownloadedTimelineChart() {
    const chartElement = document.getElementById('fundDownloadedTimelineChart');
    if (!chartElement || !ApexCharts) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fundData = months.map(() => Math.floor(Math.random() * 200000) + 50000);

    const options = {
        series: [{ name: 'Fund Downloaded', data: fundData }],
        colors: [colors.accent1],
        chart: {
            type: 'line',
            height: '350px',
            fontFamily: 'inherit',
            toolbar: { show: false },
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } },
        xaxis: { categories: months, labels: { style: { colors: '#64748B', fontSize: '12px' } } },
        yaxis: {
            labels: {
                style: { colors: '#64748B', fontSize: '12px' },
                formatter: (val) => `₱${(val / 1000).toFixed(0)}k`
            }
        },
        grid: { borderColor: '#E2E8F0', strokeDashArray: 4 },
        tooltip: {
            theme: 'dark',
            style: { fontSize: '13px', fontFamily: 'inherit' },
            y: { formatter: (val) => `₱${val.toLocaleString()}` }
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        responsive: [{
            breakpoint: 768,
            options: { chart: { height: 300 } }
        }]
    };

    try {
        if (chartInstances.fundDownloadedTimeline) chartInstances.fundDownloadedTimeline.destroy();
        const chart = new ApexCharts(chartElement, options);
        chartInstances.fundDownloadedTimeline = chart;
        chart.render();
    } catch (error) {
        console.error('Error creating fund downloaded timeline chart:', error);
    }
}

/**
 * Fund Downloaded Summary Chart
 */
function initFundDownloadedSummaryChart() {
    const chartElement = document.getElementById('fundDownloadedSummaryChart');
    if (!chartElement || !ApexCharts) return;

    const periods = ['Q1', 'Q2', 'Q3', 'Q4'];
    const fundData = periods.map(() => Math.floor(Math.random() * 500000) + 200000);

    const options = {
        series: [{ name: 'Fund Downloaded', data: fundData }],
        colors: [colors.secondary],
        chart: {
            type: 'bar',
            height: '350px',
            fontFamily: 'inherit',
            toolbar: { show: false },
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        plotOptions: { bar: { borderRadius: 8, columnWidth: '60%' } },
        xaxis: { categories: periods, labels: { style: { colors: '#64748B', fontSize: '12px' } } },
        yaxis: {
            labels: {
                style: { colors: '#64748B', fontSize: '12px' },
                formatter: (val) => `₱${(val / 1000).toFixed(0)}k`
            }
        },
        grid: { borderColor: '#E2E8F0', strokeDashArray: 4 },
        tooltip: {
            theme: 'dark',
            style: { fontSize: '13px', fontFamily: 'inherit' },
            y: { formatter: (val) => `₱${val.toLocaleString()}` }
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        responsive: [{
            breakpoint: 768,
            options: { chart: { height: 300 } }
        }]
    };

    try {
        if (chartInstances.fundDownloadedSummary) chartInstances.fundDownloadedSummary.destroy();
        const chart = new ApexCharts(chartElement, options);
        chartInstances.fundDownloadedSummary = chart;
        chart.render();
    } catch (error) {
        console.error('Error creating fund downloaded summary chart:', error);
    }
}

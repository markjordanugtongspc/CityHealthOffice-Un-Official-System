<?php
require_once __DIR__ . '/../../../config/vite_helper.php';
require_once __DIR__ . '/../../../config/db.php';
require_once __DIR__ . '/../../../config/session.php';

// Require authentication
requireAuth();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monthly Expenses Summary - City Health Office</title>

    <!-- Vite Assets -->
    <?php vite('backend/js/main.js'); ?>

</head>
<body class="app-shell min-h-screen flex flex-col bg-slate-100">
    <?php require_once __DIR__ . '/../../components/page-loader.php'; ?>
    <?php require_once __DIR__ . '/../../components/sidebar.php'; ?>

    <!-- Main Content Container (Expandable and Scrollable) -->
    <div id="spaContentContainer" class="main-content ml-0 w-full max-w-full lg:w-auto lg:ml-80! lg:group-[.sidebar-collapsed]/body:!ml-[4.5rem] min-h-screen transition-all duration-300 flex-1 flex flex-col overflow-hidden!">
            <!-- Content Area (Scrollable) -->
            <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-10 md:pb-12 lg:pb-16">
            <!-- Top Header (Clean Title Only) -->
            <section class="mb-5">
                <div class="flex items-start gap-3">
                    <img src="<?php echo htmlspecialchars(getImagePath('frontend/images/actualBudgets.svg')); ?>" alt="" aria-hidden="true" class="mt-0.5 h-10 w-10 shrink-0 object-contain">
                    <div>
                        <h1 class="text-2xl font-bold uppercase tracking-tight text-slate-900">Monthly Expenses Summary</h1>
                        <p class="mt-1 max-w-3xl text-sm text-slate-600">Track and manage monthly expenses, account allocations, and annual trends for <span id="monthlyExpensesCurrentYear" class="font-semibold text-slate-900"></span>.</p>
                    </div>
                </div>
            </section>

            <!-- Flowbite Carousel of Dynamic Account Title Cards with Action Bar Below -->
            <section class="mb-6 relative" id="monthlyAccountCarouselSection">
                <div id="monthlyExpensesCarousel" class="relative w-full overflow-hidden" data-carousel="static">
                    <!-- Carousel wrapper -->
                    <div id="monthlyCarouselTrack" class="relative min-h-[190px] sm:min-h-[185px] py-1 overflow-hidden rounded-xl">
                        <!-- Dynamic slides rendered by monthly-expenses.js -->
                    </div>

                    <!-- Slider Indicators (Clickable dots) -->
                    <div id="monthlyCarouselIndicators" class="flex justify-center items-center gap-2 mt-3">
                        <!-- Indicators populated dynamically -->
                    </div>
                </div>

                <!-- Action Controls Row (Placed below the carousel cards) -->
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
                    <!-- Left: Medium-sized Year Selector with Centered Year, Keyboard Typing & Up/Down Steppers -->
                    <div class="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-xs w-fit">
                        <span class="text-xs font-bold uppercase tracking-wide text-slate-500 shrink-0">Year:</span>
                        <div class="relative flex items-center">
                            <input
                                id="monthlyExpensesYear"
                                type="number"
                                min="2000"
                                max="2099"
                                step="1"
                                class="w-16 text-center text-sm font-bold text-slate-900 bg-transparent border-0 focus:ring-0 p-0 font-mono tracking-wide [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-pointer focus:cursor-text"
                                placeholder="YYYY"
                            />
                            <div class="flex flex-col gap-0.5 ml-1.5 border-l border-slate-200 pl-1.5">
                                <button id="monthlyExpensesYearUp" type="button" class="text-slate-400 hover:text-slate-700 active:text-slate-900 transition-colors p-0.5 rounded cursor-pointer" title="Next Year" aria-label="Next Year">
                                    <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"/></svg>
                                </button>
                                <button id="monthlyExpensesYearDown" type="button" class="text-slate-400 hover:text-slate-700 active:text-slate-900 transition-colors p-0.5 rounded cursor-pointer" title="Previous Year" aria-label="Previous Year">
                                    <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Action Buttons -->
                    <div class="flex items-center justify-end gap-3 shrink-0">
                        <button id="monthlyExpensesCalculateBtn" type="button" class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-orange-500 bg-transparent px-3.5 py-2.5 text-sm font-semibold text-orange-500 hover:bg-orange-500 hover:text-white active:bg-orange-600 active:text-white focus:ring-4 focus:ring-orange-200 shadow-xs transition-all duration-200">
                            <svg class="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 2H20C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2ZM5 4V20H19V4H5ZM7 6H17V10H7V6ZM7 12H9V14H7V12ZM7 16H9V18H7V16ZM11 12H13V14H11V12ZM11 16H13V18H11V16ZM15 12H17V18H15V12Z"></path></svg>Calculate
                        </button>
                        <button id="monthlyExpensesAddBtn" type="button" class="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg bg-emerald-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-600 active:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-all duration-200">
                            <svg class="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"/></svg>Add Entry
                        </button>
                    </div>
                </div>
            </section>

            <!-- Merged Unified Section: Search, Filters & Monthly Expenses Table -->
            <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs mb-8">
                <!-- Search & Filter Header -->
                <div class="flex flex-col gap-4 border-b border-slate-200 p-4 md:p-5">
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 class="text-lg font-semibold text-slate-900">Monthly Expense Entries</h2>
                            <p class="mt-0.5 text-sm text-slate-500">Breakdown of disbursed and actual expenses per account across all 12 calendar months.</p>
                        </div>
                        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <label for="monthlyExpensesSearch" class="sr-only">Search monthly expenses</label>
                            <div class="relative min-w-0 sm:w-80">
                                <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"/>
                                </svg>
                                <input id="monthlyExpensesSearch" type="search" placeholder="Search by G/L code or account..." class="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796]">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Table Content -->
                <div class="w-full overflow-x-auto">
                    <table id="monthlyExpensesTable" class="min-w-full divide-y divide-slate-200 text-xs">
                        <thead class="bg-[#224796] text-xs uppercase tracking-wider text-white">
                            <tr>
                                <th scope="col" class="px-2.5 py-3 text-left font-bold uppercase tracking-wider text-white whitespace-nowrap w-[70px] min-w-[70px]">
                                    G/L Code
                                </th>
                                <th scope="col" class="px-2.5 py-3 text-left font-bold uppercase tracking-wider text-white min-w-[170px]">
                                    Account Title
                                </th>
                                <th scope="col" class="px-2 py-3 text-center font-bold uppercase tracking-wider text-white whitespace-nowrap">
                                    Jan
                                </th>
                                <th scope="col" class="px-2 py-3 text-center font-bold uppercase tracking-wider text-white whitespace-nowrap">
                                    Feb
                                </th>
                                <th scope="col" class="px-2 py-3 text-center font-bold uppercase tracking-wider text-white whitespace-nowrap">
                                    Mar
                                </th>
                                <th scope="col" class="px-2 py-3 text-center font-bold uppercase tracking-wider text-white whitespace-nowrap">
                                    Apr
                                </th>
                                <th scope="col" class="px-2 py-3 text-center font-bold uppercase tracking-wider text-white whitespace-nowrap">
                                    May
                                </th>
                                <th scope="col" class="px-2 py-3 text-center font-bold uppercase tracking-wider text-white whitespace-nowrap">
                                    Jun
                                </th>
                                <th scope="col" class="px-2 py-3 text-center font-bold uppercase tracking-wider text-white whitespace-nowrap">
                                    Jul
                                </th>
                                <th scope="col" class="px-2 py-3 text-center font-bold uppercase tracking-wider text-white whitespace-nowrap">
                                    Aug
                                </th>
                                <th scope="col" class="px-2 py-3 text-center font-bold uppercase tracking-wider text-white whitespace-nowrap">
                                    Sep
                                </th>
                                <th scope="col" class="px-2 py-3 text-center font-bold uppercase tracking-wider text-white whitespace-nowrap">
                                    Oct
                                </th>
                                <th scope="col" class="px-2 py-3 text-center font-bold uppercase tracking-wider text-white whitespace-nowrap">
                                    Nov
                                </th>
                                <th scope="col" class="px-2 py-3 text-center font-bold uppercase tracking-wider text-white whitespace-nowrap">
                                    Dec
                                </th>
                                <th scope="col" class="px-2 py-3 text-center font-bold uppercase tracking-wider text-white whitespace-nowrap w-16">
                                    Trend
                                </th>
                            </tr>
                        </thead>
                        <tbody id="monthlyExpensesTableBody" class="divide-y divide-slate-100 bg-white">
                            <!-- Rows rendered by monthly-expenses.js -->
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
                    <p class="text-xs md:text-sm text-slate-600" id="monthlyExpensesPaginationSummary">
                        Showing 0 to 0 of 0 entries
                    </p>
                    <div class="flex items-center justify-end gap-2">
                        <button
                            id="monthlyExpensesPrevPage"
                            type="button"
                            class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer transition-colors md:px-2 md:py-1 md:text-xs"
                        >
                            Prev
                        </button>
                        <div id="monthlyExpensesPageNumbers" class="flex items-center gap-1 text-sm md:text-xs">
                            <!-- Page buttons rendered by monthly-expenses.js -->
                        </div>
                        <button
                            id="monthlyExpensesNextPage"
                            type="button"
                            class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer transition-colors md:px-2 md:py-1 md:text-xs"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </section>
            <?php $footerSpacingClass = 'mt-8'; require_once __DIR__ . '/../../components/components.php'; ?>
        </main>
    </div>

</body>
</html>

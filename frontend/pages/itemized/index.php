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
    <title>Itemized Daily Expenses - City Health Office</title>

    <!-- Vite Assets -->
    <?php vite('backend/js/main.js'); ?>
</head>
<body class="app-shell min-h-screen flex flex-col bg-slate-100">
    <!-- Floating: Generate Voucher (ticket icon) -->
    <button type="button" id="itemizedVoucherFloatingBtn" aria-label="Generate Disbursement Voucher"
        class="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#224796] text-white shadow-lg hover:bg-[#163473] hover:shadow-xl transition-all cursor-pointer">
        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
            viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18.5 12A2.5 2.5 0 0 1 21 9.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v2.5a2.5 2.5 0 0 1 0 5V17a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        </svg>
    </button>

    <?php require_once __DIR__ . '/../../components/page-loader.php'; ?>
    <?php require_once __DIR__ . '/../../components/sidebar.php'; ?>

    <!-- Main Content Container (Expandable and Scrollable) -->
    <div id="spaContentContainer" class="main-content ml-0 w-full max-w-full lg:w-auto lg:ml-80! lg:group-[.sidebar-collapsed]/body:!ml-[4.5rem] min-h-screen transition-all duration-300 flex-1 flex flex-col overflow-hidden!">
        <!-- Content Area (Scrollable) -->
        <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-10 md:pb-12 lg:pb-16">
            <!-- Top Header (Clean Title Only matching monthly-expenses) -->
            <section class="mb-5">
                <div class="flex items-start gap-3">
                    <img src="<?php echo htmlspecialchars(getImagePath('frontend/images/actualBudgets.svg')); ?>" alt="" aria-hidden="true" class="mt-0.5 h-10 w-10 shrink-0 object-contain">
                    <div>
                        <h1 class="text-2xl font-bold uppercase tracking-tight text-slate-900">Itemized Daily Expenses</h1>
                        <p class="mt-1 max-w-3xl text-sm text-slate-600">Track and manage everyday personalized daily expenses by individual payee for <span id="itemizedExpensesCurrentMonthYear" class="font-semibold text-slate-900"></span>.</p>
                    </div>
                </div>
            </section>

            <!-- Flowbite Carousel of Dynamic Daily Week Cards with Action Controls Below -->
            <section class="mb-6 relative" id="itemizedWeekCarouselSection">


                <div id="itemizedExpensesCarousel" class="relative w-full overflow-hidden" data-carousel="static">
                    <!-- Carousel wrapper -->
                    <div id="itemizedCarouselTrack" class="relative min-h-[175px] sm:min-h-[170px] py-1 overflow-hidden rounded-xl">
                        <!-- Dynamic week slides rendered by itemized.js -->
                    </div>

                    <!-- Slider Indicators (Clickable week pills) -->
                    <div id="itemizedCarouselIndicators" class="flex flex-wrap justify-center items-center gap-1.5 mt-3">
                        <!-- Week indicators populated dynamically -->
                    </div>
                </div>

                <!-- Action Controls Row (Placed below the carousel cards) -->
                <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mt-4">
                    <!-- Left: Month Selector & Year Stepper & Payee Filter -->
                    <div class="flex flex-wrap items-center gap-2.5">
                        <!-- Month Selector -->
                        <div class="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 shadow-2xs">
                            <span class="text-xs font-bold uppercase tracking-wide text-slate-500 shrink-0">Month:</span>
                            <select id="itemizedMonth" class="text-xs sm:text-sm font-bold text-slate-900 bg-transparent border-0 focus:ring-0 p-0 cursor-pointer pr-4">
                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                        </div>

                        <!-- Year Stepper matching monthly-expenses -->
                        <div class="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 shadow-2xs w-fit">
                            <span class="text-xs font-bold uppercase tracking-wide text-slate-500 shrink-0">Year:</span>
                            <div class="relative flex items-center">
                                <input
                                    id="itemizedYear"
                                    type="number"
                                    min="2000"
                                    max="2099"
                                    step="1"
                                    class="w-16 text-center text-sm font-bold text-slate-900 bg-transparent border-0 focus:ring-0 p-0 font-mono tracking-wide [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-pointer focus:cursor-text"
                                    placeholder="YYYY"
                                />
                                <div class="flex flex-col gap-0.5 ml-1.5 border-l border-slate-200 pl-1.5">
                                    <button id="itemizedYearUp" type="button" class="text-slate-400 hover:text-slate-700 active:text-slate-900 transition-colors p-0.5 rounded cursor-pointer" title="Next Year" aria-label="Next Year">
                                        <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"/></svg>
                                    </button>
                                    <button id="itemizedYearDown" type="button" class="text-slate-400 hover:text-slate-700 active:text-slate-900 transition-colors p-0.5 rounded cursor-pointer" title="Previous Year" aria-label="Previous Year">
                                        <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Payee Selector with New Payee button -->
                        <div class="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 shadow-2xs">
                            <span class="text-xs font-bold uppercase tracking-wide text-slate-500 shrink-0">Payee:</span>
                            <select id="itemizedPayeeFilter" class="text-xs sm:text-sm font-semibold text-slate-900 bg-transparent border-0 focus:ring-0 p-0 cursor-pointer max-w-[150px] sm:max-w-[200px] truncate">
                                <option value="">All Individuals</option>
                            </select>
                        </div>
                    </div>

                    <!-- Right: Action Buttons -->
                    <div class="flex items-center justify-end gap-2.5 shrink-0">
                        <button id="itemizedAddPayeeQuickBtn" type="button" class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-blue-600 bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:ring-4 focus:ring-blue-100 shadow-2xs transition-all duration-200">
                            <svg class="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>New Payee
                        </button>
                        <button id="itemizedAddBtn" type="button" class="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-2xs hover:bg-emerald-700 active:bg-emerald-800 focus:ring-4 focus:ring-emerald-200 transition-all duration-200">
                            <svg class="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"/></svg>Add Daily Entry
                        </button>
                    </div>
                </div>
            </section>

            <!-- Merged Unified Section: Search, Filters & Daily Expenses Table (Fully matching monthly-expenses) -->
            <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs mb-8">
                <!-- Search & Filter Header -->
                <div class="flex flex-col gap-4 border-b border-slate-200 p-4 md:p-5">
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div class="flex items-center gap-2">
                                <h2 class="text-lg font-semibold text-slate-900">Daily Expense Transactions</h2>
                                <span id="itemizedTableDayFilterBadge" class="hidden inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    <span id="itemizedTableDayFilterText">Filtered by Day</span>
                                    <button type="button" id="itemizedClearDayFilterBtn" class="ml-1 text-amber-800 hover:text-amber-950 cursor-pointer" title="Clear day filter">&times;</button>
                                </span>
                            </div>
                            <p class="mt-0.5 text-sm text-slate-500">Everyday individual itemized transactions, vouchers, check numbers, and accounts.</p>
                        </div>
                        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <label for="itemizedSearch" class="sr-only">Search daily expenses</label>
                            <div class="relative min-w-0 sm:w-80">
                                <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"/>
                                </svg>
                                <input id="itemizedSearch" type="search" placeholder="Search by G/L code, payee, DV no..." class="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796]">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Table Content matching monthly-expenses layout -->
                <div class="w-full overflow-x-auto">
                    <table id="itemizedTable" class="min-w-full divide-y divide-slate-200 text-xs">
                        <thead class="bg-[#224796] text-xs uppercase tracking-wider text-white">
                            <tr>
                                <th scope="col" class="px-3 py-3 text-left font-bold uppercase tracking-wider text-white whitespace-nowrap min-w-[105px]">
                                    Date
                                </th>
                                <th scope="col" class="px-3 py-3 text-left font-bold uppercase tracking-wider text-white whitespace-nowrap min-w-[100px]">
                                    DV No.
                                </th>
                                <th scope="col" class="px-2.5 py-3 text-left font-bold uppercase tracking-wider text-white whitespace-nowrap min-w-[90px]">
                                    Check No.
                                </th>
                                <th scope="col" class="px-3 py-3 text-left font-bold uppercase tracking-wider text-white min-w-[150px]">
                                    Individual / Payee
                                </th>
                                <th scope="col" class="px-3 py-3 text-left font-bold uppercase tracking-wider text-white min-w-[180px]">
                                    Account Title
                                </th>
                                <th scope="col" class="px-3 py-3 text-right font-bold uppercase tracking-wider text-white whitespace-nowrap min-w-[110px]">
                                    Amount
                                </th>
                                <th scope="col" class="px-3 py-3 text-left font-bold uppercase tracking-wider text-white min-w-[160px]">
                                    Particulars / Remarks
                                </th>
                                <th scope="col" class="px-3 py-3 text-center font-bold uppercase tracking-wider text-white whitespace-nowrap w-24">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody id="itemizedTableBody" class="divide-y divide-slate-100 bg-white">
                            <!-- Rows rendered by itemized.js -->
                        </tbody>
                    </table>
                </div>

                <!-- Pagination matching monthly-expenses -->
                <div class="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
                    <p class="text-xs md:text-sm text-slate-600" id="itemizedPaginationSummary">
                        Showing 0 to 0 of 0 entries
                    </p>
                    <div class="flex items-center justify-end gap-2">
                        <button
                            id="itemizedPrevPage"
                            type="button"
                            class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer transition-colors md:px-2 md:py-1 md:text-xs"
                        >
                            Prev
                        </button>
                        <div id="itemizedPageNumbers" class="flex items-center gap-1 text-sm md:text-xs">
                            <!-- Page buttons rendered by itemized.js -->
                        </div>
                        <button
                            id="itemizedNextPage"
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

    <!-- Hidden voucher form template -->
    <div id="voucherFormTemplate" class="hidden" aria-hidden="true">
        <?php require_once __DIR__ . '/../../components/generateVoucher.php'; ?>
    </div>
</body>
</html>
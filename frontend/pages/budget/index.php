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
    <title>Budget - City Health Office</title>

    <!-- Vite Assets -->
    <?php vite('backend/js/main.js'); ?>

</head>

<body class="app-shell min-h-screen flex flex-col bg-slate-100">
    <?php require_once __DIR__ . '/../../components/page-loader.php'; ?>
    <?php require_once __DIR__ . '/../../components/sidebar.php'; ?>

    <!-- Main Content Container (Expandable and Scrollable) -->
    <div id="spaContentContainer"
        class="main-content ml-0 w-full max-w-full lg:w-auto lg:ml-80! lg:group-[.sidebar-collapsed]/body:!ml-[4.5rem] min-h-screen transition-all duration-300 flex-1 flex flex-col overflow-hidden!">
        <!-- Header -->
        <!-- Content Area (Scrollable) -->
        <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-10 md:pb-12 lg:pb-16">
            <!-- Intro section -->
            <section class="mb-6">
                <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6">
                    <h2 class="text-xl md:text-2xl font-semibold text-slate-900 mb-2 text-balance">
                        Actual vs Budget Year-to-Date
                    </h2>
                    <p class="text-sm md:text-base text-slate-600">
                        This view compares the City Health Office&apos;s actual expenses against the approved budget for
                        <span id="budgetCurrentYearInline" class="font-semibold text-slate-900"></span>.
                        It highlights remaining funds in pesos and percentage to help you quickly identify overspending
                        and
                        underutilized allocations across G/L accounts.
                    </p>
                </div>
            </section>

            <!-- Filters & Actions -->
            <section class="mb-4">
                <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-5">
                    <div class="flex flex-col md:flex-row gap-4 md:items-center md:justify-between md:flex-wrap">
                        <!-- Search -->
                        <div class="w-full md:flex-1">
                            <label for="budgetSearch" class="block text-xs font-medium text-slate-500 mb-1">
                                Search by G/L Code or Account Title
                            </label>
                            <div class="relative">
                                <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                                    </svg>
                                </span>
                                <input id="budgetSearch" type="text" placeholder="Search accounts..."
                                    class="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796]" />
                            </div>
                        </div>

                        <!-- Right controls -->
                        <div class="flex flex-col sm:flex-row gap-3 md:gap-4 md:items-center sm:flex-wrap">
                            <div class="flex items-center gap-3">
                                <label for="budgetYear" class="text-sm font-medium text-slate-700 whitespace-nowrap">
                                    Year
                                </label>
                                <select id="budgetYear"
                                    class="rounded-lg border border-slate-300 bg-white py-2.5 px-4 text-sm text-slate-900 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796] cursor-pointer">
                                    <!-- Options populated by JavaScript -->
                                </select>
                            </div>
                            <div class="flex items-center gap-3">
                                <label for="budgetSort" class="text-sm font-medium text-slate-700 whitespace-nowrap">
                                    Sort by
                                </label>
                                <select id="budgetSort"
                                    class="rounded-lg border border-slate-300 bg-white py-2.5 px-4 text-sm text-slate-900 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796] cursor-pointer">
                                    <option value="">None</option>
                                    <option value="actual">Actual</option>
                                    <option value="budget">Budget</option>
                                    <option value="remainingAmount">Remaining ₱</option>
                                    <option value="remainingPercent">Remaining %</option>
                                </select>
                                <button id="budgetSortDirection" type="button"
                                    class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors">
                                    <svg id="budgetSortDirectionIcon" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 15l7-7 7 7" />
                                    </svg>
                                </button>
                            </div>

                            <div class="flex flex-wrap items-center gap-3">
                                <button id="budgetAddBtn" type="button"
                                    class="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold uppercase tracking-widest text-white shadow-sm hover:bg-emerald-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 cursor-pointer transition-all">
                                    <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Entry
                                </button>
                                <button id="budgetCalculateBtn" type="button"
                                    class="inline-flex items-center justify-center rounded-lg bg-[#224796] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#163473] focus:outline-none focus:ring-2 focus:ring-[#224796] focus:ring-offset-1 cursor-pointer transition-colors">
                                    <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 7h6M9 11h6m-9 4h.01M15 15h.01M5 5h14v14H5z" />
                                    </svg>
                                    Calculate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Table -->
            <section>
                <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table id="budgetTable" class="min-w-full divide-y divide-slate-200 text-sm">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th scope="col"
                                        class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        G/L Code
                                    </th>
                                    <th scope="col"
                                        class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Account Title
                                    </th>
                                    <th scope="col"
                                        class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Actual
                                    </th>
                                    <th scope="col"
                                        class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Budget
                                    </th>
                                    <th scope="col"
                                        class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Remaining ₱
                                    </th>
                                    <th scope="col"
                                        class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Remaining %
                                    </th>
                                    <th scope="col"
                                        class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="budgetTableBody" class="divide-y divide-slate-100 bg-white">
                                <!-- Rows rendered by budget.js -->
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div
                        class="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
                        <p class="text-xs md:text-sm text-slate-600" id="budgetPaginationSummary">
                            Showing 0 to 0 of 0 entries
                        </p>
                        <div class="flex items-center justify-end gap-2">
                            <button id="budgetPrevPage" type="button"
                                class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer transition-colors md:px-2 md:py-1 md:text-xs">
                                Prev
                            </button>
                            <div id="budgetPageNumbers" class="flex items-center gap-1 text-sm md:text-xs">
                                <!-- Page buttons rendered by budget.js -->
                            </div>
                            <button id="budgetNextPage" type="button"
                                class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer transition-colors md:px-2 md:py-1 md:text-xs">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>

</body>

</html>
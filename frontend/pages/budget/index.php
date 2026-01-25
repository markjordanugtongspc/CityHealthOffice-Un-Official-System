<?php
require_once __DIR__ . '/../../../config/vite.php';
require_once __DIR__ . '/../../../config/db.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Budget - City Health Office</title>

    <!-- Vite Assets -->
    <?= Vite::assets('backend/js/main.js') ?>

</head>
<body class="min-h-screen flex flex-col bg-slate-100">
    <?php require_once __DIR__ . '/../../components/sidebar.php'; ?>

    <!-- Main Content Container (Expandable and Scrollable) -->
    <div id="spaContentContainer" class="main-content ml-64 min-h-screen transition-all duration-300 flex-1 flex flex-col">
            <!-- Header -->
            <header class="flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3">
                <div class="flex items-center space-x-3">
                    <!-- Mobile Hamburger Toggle (visible only on mobile) -->
                    <button id="sidebarToggleHeader" type="button" class="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                        <span class="sr-only">Toggle sidebar</span>
                        <!-- Hamburger Icon (default) -->
                        <svg id="headerHamburgerIcon" class="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                        <!-- Close Icon (shown when sidebar is open) -->
                        <svg id="headerCloseIcon" class="w-6 h-6 text-slate-700 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    <div>
                        <h1 class="text-xl font-bold text-slate-900">YTD Budget Summary</h1>
                        <h3 class="text-sm text-slate-600">Actual vs Budget overview for <span id="budgetCurrentYear" class="font-semibold text-slate-900"></span></h3>
                    </div>
                </div>

                <!-- User Menu -->
                <div class="relative">
                    <button id="userMenuButton" class="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                        <div class="w-10 h-10 bg-[#224796] rounded-full flex items-center justify-center">
                            <span class="text-white font-semibold text-sm">A</span>
                        </div>
                        <div class="hidden md:block text-left">
                            <p class="text-sm font-medium text-slate-900">admin</p>
                            <p class="text-xs text-slate-500">Administrator</p>
                        </div>
                        <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>

                    <!-- Dropdown Menu -->
                    <div id="userDropdown" class="hidden absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-slate-100 py-2 z-50">
                        <a id="profileBtn" href="#" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition">
                            <div class="flex items-center space-x-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                <span>Profile</span>
                            </div>
                        </a>
                        <a id="settingsBtn" href="#" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition">
                            <div class="flex items-center space-x-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                <span>Settings</span>
                            </div>
                        </a>
                        <hr class="my-1 border-slate-100">
                        <a id="changeUserBtn" href="../../../index.php" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition">
                            <div class="flex items-center space-x-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                </svg>
                                <span>Change User</span>
                            </div>
                        </a>
                    </div>
                </div>
            </header>

            <!-- Content Area (Scrollable) -->
            <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
                <!-- Intro section -->
                <section class="mb-6">
                    <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6">
                        <h2 class="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
                            Actual vs Budget Year-to-Date
                        </h2>
                        <p class="text-sm md:text-base text-slate-600">
                            This view compares the City Health Office&apos;s actual expenses against the approved budget for
                            <span id="budgetCurrentYearInline" class="font-semibold text-slate-900"></span>.
                            It highlights remaining funds in pesos and percentage to help you quickly identify overspending and
                            underutilized allocations across G/L accounts.
                        </p>
                    </div>
                </section>

                <!-- Filters & Actions -->
                <section class="mb-4">
                    <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-5">
                        <div class="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                            <!-- Search -->
                            <div class="w-full md:flex-1">
                                <label for="budgetSearch" class="block text-xs font-medium text-slate-500 mb-1">
                                    Search by G/L Code or Account Title
                                </label>
                                <div class="relative">
                                    <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                                        </svg>
                                    </span>
                                    <input
                                        id="budgetSearch"
                                        type="text"
                                        placeholder="Search accounts..."
                                        class="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796]"
                                    />
                                </div>
                            </div>

                            <!-- Right controls -->
                            <div class="flex flex-col sm:flex-row gap-3 md:gap-4 md:items-center">
                                <div class="flex items-center gap-3">
                                    <label for="budgetSort" class="text-sm font-medium text-slate-700 whitespace-nowrap">
                                        Sort by
                                    </label>
                                    <select
                                        id="budgetSort"
                                        class="rounded-lg border border-slate-300 bg-white py-2.5 px-4 text-sm text-slate-900 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796] cursor-pointer"
                                    >
                                        <option value="">None</option>
                                        <option value="actual">Actual</option>
                                        <option value="budget">Budget</option>
                                        <option value="remainingAmount">Remaining ₱</option>
                                        <option value="remainingPercent">Remaining %</option>
                                    </select>
                                    <button
                                        id="budgetSortDirection"
                                        type="button"
                                        class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                                    >
                                        <svg id="budgetSortDirectionIcon" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                                        </svg>
                                    </button>
                                </div>

                                <div class="flex items-center gap-3">
                                    <button
                                        id="budgetAddBtn"
                                        type="button"
                                        class="inline-flex items-center justify-center rounded-lg border border-emerald-600 bg-white px-4 py-2.5 text-sm font-medium text-emerald-600 shadow-sm hover:bg-emerald-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-1 cursor-pointer transition-colors"
                                    >
                                        <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add
                                    </button>
                                    <button
                                        id="budgetCalculateBtn"
                                        type="button"
                                        class="inline-flex items-center justify-center rounded-lg bg-[#224796] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#163473] focus:outline-none focus:ring-2 focus:ring-[#224796] focus:ring-offset-1 cursor-pointer transition-colors"
                                    >
                                        <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6M9 11h6m-9 4h.01M15 15h.01M5 5h14v14H5z" />
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
                                        <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            G/L Code
                                        </th>
                                        <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            Account Title
                                        </th>
                                        <th scope="col" class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            Actual
                                        </th>
                                        <th scope="col" class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            Budget
                                        </th>
                                        <th scope="col" class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            Remaining ₱
                                        </th>
                                        <th scope="col" class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            Remaining %
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="budgetTableBody" class="divide-y divide-slate-100 bg-white">
                                    <!-- Rows rendered by budget.js -->
                                </tbody>
                            </table>
                        </div>

                        <!-- Pagination -->
                        <div class="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
                            <p class="text-xs text-slate-600" id="budgetPaginationSummary">
                                Showing 0 to 0 of 0 entries
                            </p>
                            <div class="flex items-center justify-end gap-1">
                                <button
                                    id="budgetPrevPage"
                                    type="button"
                                    class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer transition-colors"
                                >
                                    Prev
                                </button>
                                <div id="budgetPageNumbers" class="flex items-center gap-1 text-xs">
                                    <!-- Page buttons rendered by budget.js -->
                                </div>
                                <button
                                    id="budgetNextPage"
                                    type="button"
                                    class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer transition-colors"
                                >
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


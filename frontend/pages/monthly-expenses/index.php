<?php
require_once __DIR__ . '/../../../config/vite.php';
require_once __DIR__ . '/../../../config/db.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monthly Expenses Summary - City Health Office</title>

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
                        <h1 class="text-xl font-bold text-slate-900">Monthly Expenses Summary</h1>
                        <h3 class="text-sm text-slate-600">Monthly expenses overview for <span id="monthlyExpensesCurrentYear" class="font-semibold text-slate-900"></span></h3>
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
                <!-- Header Section with Standard Graphics -->
                <section class="mb-6">
                    <div class="relative bg-gradient-to-br from-[#224796] to-[#163473] rounded-2xl shadow-xl overflow-hidden">
                        <!-- Static Background Pattern -->
                        <div class="absolute inset-0 opacity-10">
                            <div class="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
                            <div class="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
                        </div>
                        
                        <!-- Content -->
                        <div class="relative z-10 p-6 md:p-8 lg:p-10">
                            <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                <!-- Left: Title and Description -->
                                <div class="flex-1">
                                    <div class="flex items-center gap-3 mb-3">
                                        <div class="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                                            <svg class="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                            </svg>
                                        </div>
                                        <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                                            Monthly Expenses Summary
                                        </h2>
                                    </div>
                                    <p class="text-white/90 text-sm md:text-base ml-14 md:ml-16">
                                        Track and manage your monthly financial expenses with detailed insights
                                    </p>
                                </div>
                                
                                <!-- Right: Standard Graphics -->
                                <div class="flex items-center gap-4 lg:gap-6">
                                    <!-- Chart Icon -->
                                    <div class="hidden md:flex flex-col items-center gap-2 p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
                                        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        <span class="text-xs text-white/80 font-medium">Analytics</span>
                                    </div>
                                    
                                    <!-- Expense Icon -->
                                    <div class="hidden md:flex flex-col items-center gap-2 p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
                                        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        <span class="text-xs text-white/80 font-medium">Expenses</span>
                                    </div>
                                    
                                    <!-- Standard Decorative Bars -->
                                    <div class="flex flex-col gap-2">
                                        <div class="flex gap-2">
                                            <div class="w-3 h-8 bg-white/30 rounded-full"></div>
                                            <div class="w-3 h-6 bg-white/40 rounded-full"></div>
                                            <div class="w-3 h-10 bg-white/25 rounded-full"></div>
                                        </div>
                                        <div class="flex gap-2 ml-2">
                                            <div class="w-3 h-6 bg-white/35 rounded-full"></div>
                                            <div class="w-3 h-8 bg-white/30 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Bottom Accent Line -->
                        <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    </div>
                </section>

                <!-- Filters & Actions -->
                <section class="mb-4">
                    <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-5">
                        <!-- Account Title Filter -->
                        <div class="mb-4">
                            <label class="block text-xs font-medium text-slate-500 mb-2">
                                Account Title
                            </label>
                            <div id="accountTitleFilters" class="flex flex-wrap gap-2">
                                <!-- Account title filters populated by JavaScript -->
                            </div>
                        </div>

                        <div class="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                            <!-- Search -->
                            <div class="w-full md:flex-1">
                                <label for="monthlyExpensesSearch" class="block text-xs font-medium text-slate-500 mb-1">
                                    Search by Account Title or G/L Code
                                </label>
                                <div class="relative">
                                    <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                                        </svg>
                                    </span>
                                    <input
                                        id="monthlyExpensesSearch"
                                        type="text"
                                        placeholder="Search accounts..."
                                        class="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796]"
                                    />
                                </div>
                            </div>

                            <!-- Right controls -->
                            <div class="flex flex-col sm:flex-row gap-3 md:gap-4 md:items-center">
                                <div class="flex items-center gap-3">
                                    <label for="monthlyExpensesYear" class="text-sm font-medium text-slate-700 whitespace-nowrap">
                                        Year
                                    </label>
                                    <select
                                        id="monthlyExpensesYear"
                                        class="rounded-lg border border-slate-300 bg-white py-2.5 px-4 text-sm text-slate-900 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796] cursor-pointer"
                                    >
                                        <!-- Options populated by JavaScript -->
                                    </select>
                                </div>
                                <div class="flex items-center gap-3">
                                    <button
                                        id="monthlyExpensesAddBtn"
                                        type="button"
                                        class="inline-flex items-center justify-center rounded-lg border border-emerald-600 bg-white px-4 py-2.5 text-sm font-medium text-emerald-600 shadow-sm hover:bg-emerald-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-1 cursor-pointer transition-colors"
                                    >
                                        <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add
                                    </button>
                                    <button
                                        id="monthlyExpensesCalculateBtn"
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
                            <table id="monthlyExpensesTable" class="min-w-full divide-y divide-slate-200 text-sm">
                                <thead class="bg-slate-50">
                                    <tr>
                                        <th scope="col" class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 sticky left-0 bg-slate-50 z-10">
                                            G/L Code
                                        </th>
                                        <th scope="col" class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 sticky left-12 bg-slate-50 z-10">
                                            Account Title
                                        </th>
                                        <th scope="col" class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            January
                                        </th>
                                        <th scope="col" class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            February
                                        </th>
                                        <th scope="col" class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            March
                                        </th>
                                        <th scope="col" class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            April
                                        </th>
                                        <th scope="col" class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            May
                                        </th>
                                        <th scope="col" class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            June
                                        </th>
                                        <th scope="col" class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            July
                                        </th>
                                        <th scope="col" class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            August
                                        </th>
                                        <th scope="col" class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            September
                                        </th>
                                        <th scope="col" class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            October
                                        </th>
                                        <th scope="col" class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            November
                                        </th>
                                        <th scope="col" class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            December
                                        </th>
                                        <th scope="col" class="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 w-16">
                                            <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
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
                            <p class="text-xs text-slate-600" id="monthlyExpensesPaginationSummary">
                                Showing 0 to 0 of 0 entries
                            </p>
                            <div class="flex items-center justify-end gap-1">
                                <button
                                    id="monthlyExpensesPrevPage"
                                    type="button"
                                    class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer transition-colors"
                                >
                                    Prev
                                </button>
                                <div id="monthlyExpensesPageNumbers" class="flex items-center gap-1 text-xs">
                                    <!-- Page buttons rendered by monthly-expenses.js -->
                                </div>
                                <button
                                    id="monthlyExpensesNextPage"
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

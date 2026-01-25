<?php
require_once __DIR__ . '/../../../config/vite.php';
require_once __DIR__ . '/../../../config/db.php';
// TODO: Add session check for authentication
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - City Health Office</title>

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
                        <h1 class="text-xl font-bold text-slate-900">Dashboard</h1>
                        <h3 class="text-sm text-slate-600">Welcome back, admin</h3>
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
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Stats Card 1 -->
                    <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:scale-105 hover:shadow-lg transition-transform duration-300">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <p class="text-3xl font-bold text-slate-900 mb-2">1,234</p>
                                <p class="text-sm text-slate-600">Total Patients</p>
                            </div>
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-[#224796]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <!-- Stats Card 2 -->
                    <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:scale-105 hover:shadow-lg transition-transform duration-300">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <p class="text-3xl font-bold text-slate-900 mb-2">567</p>
                                <p class="text-sm text-slate-600">Appointments</p>
                            </div>
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <!-- Stats Card 3 -->
                    <a href="../budget/index.php" class="block bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:scale-105 hover:shadow-lg transition-transform duration-300 cursor-pointer">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <p class="text-3xl font-bold text-slate-900 mb-2">89</p>
                                <p class="text-sm text-slate-600">YTD Budget Summarys</p>
                            </div>
                            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-[#FCF350]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                        </div>
                    </a>
                </div>

                <!-- Charts Section with Pagination -->
                <div class="mt-6">
                    <!-- Pagination Navigation -->
                    <div class="mb-6 bg-white border border-slate-200 rounded-xl shadow-sm p-3 md:p-4">
                        <!-- Mobile: Dropdown Select -->
                        <div class="md:hidden relative">
                            <select id="chart-page-select" class="w-full px-4 py-3 text-sm font-medium rounded-lg border-2 border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#224796] focus:border-[#224796] cursor-pointer transition-all appearance-none pr-10 shadow-sm hover:border-slate-400">
                                <option value="1">Vouchers</option>
                                <option value="2">Daily Transactions</option>
                                <option value="3">Monthly/Weekly Transactions</option>
                                <option value="4">Quarterly Transactions</option>
                                <option value="5">Expenses</option>
                                <option value="6">Fund Downloaded</option>
                            </select>
                            <!-- Custom Dropdown Arrow -->
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </div>
                        
                        <!-- Desktop: Button Navigation -->
                        <div class="hidden md:flex items-center justify-center flex-wrap gap-2">
                            <button data-page="1" class="chart-page-btn px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer bg-[#224796] text-white hover:bg-[#163473] whitespace-nowrap">
                                Vouchers
                            </button>
                            <button data-page="2" class="chart-page-btn px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer text-slate-700 hover:bg-slate-100 whitespace-nowrap">
                                Daily Transactions
                            </button>
                            <button data-page="3" class="chart-page-btn px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer text-slate-700 hover:bg-slate-100 whitespace-nowrap">
                                Monthly/Weekly Transactions
                            </button>
                            <button data-page="4" class="chart-page-btn px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer text-slate-700 hover:bg-slate-100 whitespace-nowrap">
                                Quarterly Transactions
                            </button>
                            <button data-page="5" class="chart-page-btn px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer text-slate-700 hover:bg-slate-100 whitespace-nowrap">
                                Expenses
                            </button>
                            <button data-page="6" class="chart-page-btn px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer text-slate-700 hover:bg-slate-100 whitespace-nowrap">
                                Fund Downloaded
                            </button>
                        </div>
                    </div>

                    <!-- Page 1: Vouchers Charts -->
                    <div id="chart-page-1" class="chart-page grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Monthly Vouchers Donut Chart -->
                    <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6">
                        <div class="flex justify-between mb-3">
                            <div class="flex justify-center items-center">
                                <h5 class="text-xl font-semibold text-slate-900 me-1">Monthly Vouchers</h5>
                                <svg data-popover-target="vouchers-info" data-popover-placement="bottom" class="w-4 h-4 text-slate-500 hover:text-slate-900 cursor-pointer ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.529 9.988a2.502 2.502 0 1 1 5 .191A2.441 2.441 0 0 1 12 12.582V14m-.01 3.008H12M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                                </svg>
                                <div data-popover id="vouchers-info" role="tooltip" class="absolute z-10 p-3 invisible inline-block text-sm text-slate-600 transition-opacity duration-300 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 w-72">
                                    <div>
                                        <h3 class="font-semibold text-slate-900 mb-2">Monthly Vouchers - Overview</h3>
                                        <p class="mb-4">This chart displays the distribution of vouchers generated each month throughout the current year. The data is organized by quarters (Q1-Q4) to help you understand seasonal trends and patterns in voucher generation.</p>
                                        <h3 class="font-semibold text-slate-900 mb-2">Quarter Filtering</h3>
                                        <p class="mb-4">Use the checkboxes below to filter vouchers by quarter. Toggle Q1, Q2, Q3, or Q4 to show or hide months within each quarter period.</p>
                                        <a href="#" class="flex items-center font-medium text-[#224796] hover:underline cursor-pointer">
                                            Read more
                                            <svg class="w-4 h-4 ms-1 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
                                            </svg>
                                        </a>
                                    </div>
                                    <div data-popper-arrow></div>
                                </div>
                            </div>
                            <div>
                                <button type="button" data-tooltip-target="download-tooltip" data-tooltip-placement="bottom" class="hidden sm:inline-flex items-center justify-center text-slate-500 hover:text-slate-900 bg-transparent box-border border border-transparent hover:bg-slate-100 focus:ring-4 focus:ring-slate-200 font-medium leading-5 rounded-lg text-sm w-9 h-9 focus:outline-none cursor-pointer transition-colors">
                                    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2m-8 1V4m0 12-4-4m4 4 4-4"/>
                                    </svg>
                                    <span class="sr-only">Download data</span>
                                </button>
                                <div id="download-tooltip" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-slate-900 rounded-lg shadow-lg opacity-0 tooltip">
                                    Download CSV
                                    <div class="tooltip-arrow" data-popper-arrow></div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div class="flex flex-wrap gap-4" id="voucher-quarters">
                                <div class="flex items-center">
                                    <input id="q1" type="checkbox" value="Q1" class="w-4 h-4 border border-slate-300 rounded bg-slate-50 focus:ring-2 focus:ring-[#224796] cursor-pointer" checked>
                                    <label for="q1" class="select-none ms-2 text-sm font-medium text-slate-900 cursor-pointer">Q1 (Jan-Mar)</label>
                                </div>
                                <div class="flex items-center">
                                    <input id="q2" type="checkbox" value="Q2" class="w-4 h-4 border border-slate-300 rounded bg-slate-50 focus:ring-2 focus:ring-[#224796] cursor-pointer" checked>
                                    <label for="q2" class="select-none ms-2 text-sm font-medium text-slate-900 cursor-pointer">Q2 (Apr-Jun)</label>
                                </div>
                                <div class="flex items-center">
                                    <input id="q3" type="checkbox" value="Q3" class="w-4 h-4 border border-slate-300 rounded bg-slate-50 focus:ring-2 focus:ring-[#224796] cursor-pointer" checked>
                                    <label for="q3" class="select-none ms-2 text-sm font-medium text-slate-900 cursor-pointer">Q3 (Jul-Sep)</label>
                                </div>
                                <div class="flex items-center">
                                    <input id="q4" type="checkbox" value="Q4" class="w-4 h-4 border border-slate-300 rounded bg-slate-50 focus:ring-2 focus:ring-[#224796] cursor-pointer" checked>
                                    <label for="q4" class="select-none ms-2 text-sm font-medium text-slate-900 cursor-pointer">Q4 (Oct-Dec)</label>
                                </div>
                            </div>
                        </div>

                        <!-- Donut Chart -->
                        <div class="py-6" id="monthlyVouchersChart"></div>

                        <div class="grid grid-cols-1 items-center border-slate-200 border-t justify-between">
                            <div class="flex justify-between items-center pt-4 md:pt-6">
                                <button id="dropdownLastDaysMonthlyButton" data-dropdown-toggle="LastDaysMonthlydropdown" data-dropdown-placement="bottom" class="text-sm font-medium text-slate-600 hover:text-slate-900 text-center inline-flex items-center cursor-pointer transition-colors" type="button">
                                    This Year
                                    <svg class="w-4 h-4 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
                                    </svg>
                                </button>
                                <div id="LastDaysMonthlydropdown" class="z-10 hidden bg-white border border-slate-200 rounded-lg shadow-lg w-44">
                                    <ul class="p-2 text-sm text-slate-600 font-medium" aria-labelledby="dropdownLastDaysMonthlyButton">
                                        <li>
                                            <a href="#" class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">This Year</a>
                                        </li>
                                        <li>
                                            <a href="#" class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Last Year</a>
                                        </li>
                                        <li>
                                            <a href="#" class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Last 2 Years</a>
                                        </li>
                                        <li>
                                            <a href="#" class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">All Time</a>
                                        </li>
                                    </ul>
                                </div>
                                <a href="#" class="inline-flex items-center text-[#224796] bg-transparent box-border border border-transparent hover:bg-slate-100 focus:ring-4 focus:ring-slate-200 font-medium leading-5 rounded-lg text-sm px-3 py-2 focus:outline-none cursor-pointer transition-colors">
                                    Vouchers analysis
                                    <svg class="w-4 h-4 ms-1.5 -me-0.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Weekly Vouchers Line Chart -->
                    <div class="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200/50 backdrop-blur-sm group">
                        <div class="flex items-center justify-between mb-6">
                            <div>
                                <h3 class="text-xl font-bold text-slate-900 mb-1">Weekly Vouchers</h3>
                                <p class="text-sm text-slate-500">Last 8 weeks trend</p>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#224796] to-[#163473] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                                </svg>
                            </div>
                        </div>
                        <div id="weeklyVouchersChart" class="chart-container"></div>
                    </div>

                    <!-- Daily Vouchers Column Chart -->
                    <div class="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-6 border border-slate-200/50 backdrop-blur-sm group">
                        <div class="flex justify-between pb-4 mb-4 border-b border-slate-200">
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-gradient-to-br from-[#FCF350] to-[#E5D800] border border-slate-200 flex items-center justify-center rounded-full me-3 shadow-md">
                                    <svg class="w-7 h-7 text-slate-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3.05A2.5 2.5 0 1 1 9 5.5M19.5 17h.5a1 1 0 0 0 1-1 3 3 0 0 0-3-3h-1m0-3.05a2.5 2.5 0 1 0-2-4.45m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3 1 1 0 0 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h5 class="text-2xl font-semibold text-slate-900" id="dailyTotalVouchers">132</h5>
                                    <p class="text-sm text-slate-500">Vouchers generated this week</p>
                                </div>
                            </div>
                            <div>
                                <span class="inline-flex items-center bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-1.5 py-0.5 rounded cursor-pointer">
                                    <svg class="w-4 h-4 me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v13m0-13 4 4m-4-4-4 4"/>
                                    </svg>
                                    <span id="dailyGrowthPercentage">+15.2%</span>
                                </span>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 mb-4">
                            <dl class="flex items-center">
                                <dt class="text-slate-500 text-sm font-normal me-1">Peak day:</dt>
                                <dd class="text-slate-900 text-sm font-semibold" id="dailyPeakDay">Friday</dd>
                            </dl>
                            <dl class="flex items-center justify-end">
                                <dt class="text-slate-500 text-sm font-normal me-1">Average:</dt>
                                <dd class="text-slate-900 text-sm font-semibold" id="dailyAverage">18.9</dd>
                            </dl>
                        </div>
                        
                        <div id="dailyVouchersChart" class="chart-container"></div>
                        
                        <div class="grid grid-cols-1 items-center border-slate-200 border-t justify-between mt-4">
                            <div class="flex justify-between items-center pt-4 md:pt-6">
                                <button id="dropdownLastDaysButton" data-dropdown-toggle="LastDaysdropdown" data-dropdown-placement="bottom" class="text-sm font-medium text-slate-600 hover:text-slate-900 text-center inline-flex items-center cursor-pointer transition-colors" type="button">
                                    Last 7 days
                                    <svg class="w-4 h-4 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
                                    </svg>
                                </button>
                                <div id="LastDaysdropdown" class="z-10 hidden bg-white border border-slate-200 rounded-lg shadow-lg w-44">
                                    <ul class="p-2 text-sm text-slate-600 font-medium" aria-labelledby="dropdownLastDaysButton">
                                        <li>
                                            <a href="#" class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Yesterday</a>
                                        </li>
                                        <li>
                                            <a href="#" class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Today</a>
                                        </li>
                                        <li>
                                            <a href="#" class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Last 7 days</a>
                                        </li>
                                        <li>
                                            <a href="#" class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Last 30 days</a>
                                        </li>
                                        <li>
                                            <a href="#" class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Last 90 days</a>
                                        </li>
                                    </ul>
                                </div>
                                <a href="#" class="inline-flex items-center text-[#224796] bg-transparent box-border border border-transparent hover:bg-slate-100 focus:ring-4 focus:ring-slate-200 font-medium leading-5 rounded-lg text-sm px-3 py-2 focus:outline-none cursor-pointer transition-colors">
                                    Vouchers Report
                                    <svg class="w-4 h-4 ms-1.5 -me-0.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Yearly Chart 2016-2026 -->
                    <div class="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200/50 backdrop-blur-sm group">
                        <div class="flex items-center justify-between mb-6">
                            <div>
                                <h3 class="text-xl font-bold text-slate-900 mb-1">Yearly Overview</h3>
                                <p class="text-sm text-slate-500">Historical data from 2016-2026</p>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#224796] to-[#163473] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                            </div>
                        </div>
                        <div id="yearlyVouchersChart" class="chart-container"></div>
                    </div>
                    </div>

                    <!-- Page 2: Daily Transactions Charts -->
                    <div id="chart-page-2" class="chart-page hidden">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Daily Transactions Line Chart -->
                        <div class="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200/50 backdrop-blur-sm group">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="text-xl font-bold text-slate-900 mb-1">Daily Transactions</h3>
                                    <p class="text-sm text-slate-500">Last 30 days overview</p>
                                </div>
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#224796] to-[#163473] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                </div>
                            </div>
                            <div id="dailyTransactionsChart" class="chart-container"></div>
                        </div>

                        <!-- Transaction Volume Chart -->
                        <div class="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200/50 backdrop-blur-sm group">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="text-xl font-bold text-slate-900 mb-1">Transaction Volume</h3>
                                    <p class="text-sm text-slate-500">Daily transaction count</p>
                                </div>
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FCF350] to-[#E5D800] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg class="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                    </svg>
                                </div>
                            </div>
                            <div id="transactionVolumeChart" class="chart-container"></div>
                        </div>
                        </div>
                    </div>

                    <!-- Page 3: Monthly/Weekly Transactions Charts -->
                    <div id="chart-page-3" class="chart-page hidden">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Monthly Transactions Chart -->
                        <div class="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200/50 backdrop-blur-sm group">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="text-xl font-bold text-slate-900 mb-1">Monthly Transactions</h3>
                                    <p class="text-sm text-slate-500">Current year monthly data</p>
                                </div>
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#224796] to-[#163473] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                            </div>
                            <div id="monthlyTransactionsChart" class="chart-container"></div>
                        </div>

                        <!-- Weekly Transactions Chart -->
                        <div class="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200/50 backdrop-blur-sm group">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="text-xl font-bold text-slate-900 mb-1">Weekly Transactions</h3>
                                    <p class="text-sm text-slate-500">Last 12 weeks trend</p>
                                </div>
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FCF350] to-[#E5D800] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg class="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                                    </svg>
                                </div>
                            </div>
                            <div id="weeklyTransactionsChart" class="chart-container"></div>
                        </div>
                        </div>
                    </div>

                    <!-- Page 4: Quarterly Transactions Charts -->
                    <div id="chart-page-4" class="chart-page hidden">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Quarterly Transactions Donut Chart -->
                        <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6">
                            <div class="flex justify-between mb-3">
                                <div class="flex justify-center items-center">
                                    <h5 class="text-xl font-semibold text-slate-900 me-1">Quarterly Transactions</h5>
                                </div>
                            </div>
                            <div class="py-6" id="quarterlyTransactionsChart"></div>
                        </div>

                        <!-- Quarterly Comparison Chart -->
                        <div class="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200/50 backdrop-blur-sm group">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="text-xl font-bold text-slate-900 mb-1">Quarterly Comparison</h3>
                                    <p class="text-sm text-slate-500">Year-over-year analysis</p>
                                </div>
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#224796] to-[#163473] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                </div>
                            </div>
                            <div id="quarterlyComparisonChart" class="chart-container"></div>
                        </div>
                        </div>
                    </div>

                    <!-- Page 5: Expenses Charts -->
                    <div id="chart-page-5" class="chart-page hidden">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Expenses Overview Chart -->
                        <div class="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200/50 backdrop-blur-sm group">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="text-xl font-bold text-slate-900 mb-1">Expenses Overview</h3>
                                    <p class="text-sm text-slate-500">Monthly expenses breakdown</p>
                                </div>
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#DC2626] to-[#B91C1C] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                </div>
                            </div>
                            <div id="expensesOverviewChart" class="chart-container"></div>
                        </div>

                        <!-- Expenses by Category Chart -->
                        <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6">
                            <div class="flex justify-between mb-3">
                                <div class="flex justify-center items-center">
                                    <h5 class="text-xl font-semibold text-slate-900 me-1">Expenses by Category</h5>
                                </div>
                            </div>
                            <div class="py-6" id="expensesCategoryChart"></div>
                        </div>
                        </div>
                    </div>

                    <!-- Page 6: Fund Downloaded Charts -->
                    <div id="chart-page-6" class="chart-page hidden">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Fund Downloaded Timeline -->
                        <div class="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200/50 backdrop-blur-sm group">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="text-xl font-bold text-slate-900 mb-1">Fund Downloaded Timeline</h3>
                                    <p class="text-sm text-slate-500">Monthly fund downloads</p>
                                </div>
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                    </svg>
                                </div>
                            </div>
                            <div id="fundDownloadedTimelineChart" class="chart-container"></div>
                        </div>

                        <!-- Fund Downloaded Summary -->
                        <div class="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200/50 backdrop-blur-sm group">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="text-xl font-bold text-slate-900 mb-1">Fund Downloaded Summary</h3>
                                    <p class="text-sm text-slate-500">Total funds by period</p>
                                </div>
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FCF350] to-[#E5D800] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg class="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                </div>
                            </div>
                            <div id="fundDownloadedSummaryChart" class="chart-container"></div>
                        </div>
                        </div>
                    </div>
                </div>
            </main>
    </div>

</body>
</html>

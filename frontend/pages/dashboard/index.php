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
    <title>Dashboard - City Health Office</title>

    <!-- Vite Assets -->
    <?php vite('backend/js/main.js'); ?>

</head>

<body class="app-shell min-h-screen flex flex-col bg-[#f8fafc]">
    <?php require_once __DIR__ . '/../../components/page-loader.php'; ?>
    <?php require_once __DIR__ . '/../../components/sidebar.php'; ?>

    <!-- Main Content Container (Expandable and Scrollable) -->
    <div id="spaContentContainer"
        class="main-content ml-0 w-full max-w-full lg:w-auto lg:ml-80! lg:group-[.sidebar-collapsed]/body:!ml-[4.5rem] min-h-screen transition-all duration-300 flex-1 flex flex-col overflow-hidden!">
        <!-- Header -->
        <header class="flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3">
            <div class="flex items-center space-x-3">
                <!-- Mobile Hamburger Toggle (visible only on mobile) -->
                <button id="sidebarToggleHeader" type="button"
                    class="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                    <span class="sr-only">Toggle sidebar</span>
                    <!-- Hamburger Icon (default) -->
                    <svg id="headerHamburgerIcon" class="w-6 h-6 text-slate-700" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                    <!-- Close Icon (shown when sidebar is open) -->
                    <svg id="headerCloseIcon" class="w-6 h-6 text-slate-700 hidden" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                        </path>
                    </svg>
                </button>
                <div>
                    <h1 class="text-xl font-bold text-slate-900">Dashboard</h1>
                    <h3 id="dashboardWelcomeText" class="text-sm text-slate-600">Welcome back, <span
                            class="user-full-name font-semibold text-[#224796]">...</span></h3>
                </div>
            </div>

            <!-- User Menu -->
            <div class="relative">
                <button id="userMenuButton"
                    class="flex items-center space-x-3 p-1 rounded-full hover:bg-slate-100/80 border border-slate-200/40 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-blue-900/5 bg-white/50 backdrop-blur-sm">
                    <div class="w-11 h-11 bg-linear-to-br from-[#224796] via-[#1e3a8a] to-[#1e40af] rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(34,71,150,0.3)] group-hover:scale-105 transition-all duration-500 ring-2 ring-white/80">
                        <span id="userInitial" class="text-white font-black text-sm tracking-widest drop-shadow-md">...</span>
                    </div>
                    <div class="hidden md:block text-left px-1">
                        <p id="userUsername" class="text-sm font-black text-slate-800 leading-none mb-1 group-hover:text-[#224796] transition-colors">...</p>
                        <p id="userRole" class="text-[9px] font-black text-[#224796] uppercase tracking-[0.1em] bg-blue-50/80 px-2 py-0.5 rounded-full border border-blue-100/50">...</p>
                    </div>
                    <div class="p-1">
                        <svg class="w-4 h-4 text-slate-400 group-hover:text-[#224796] transition-all duration-300 group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </button>

                <!-- Dropdown Menu -->
                <div id="userDropdown"
                    class="hidden absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-slate-100 py-2 z-50">
                    <a id="profileBtn" href="#"
                        class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition">
                        <div class="flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            <span>Profile</span>
                        </div>
                    </a>
                    <a id="settingsBtn" href="../settings/"
                        class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition rounded-lg">
                        <div class="flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                                </path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span>Settings</span>
                        </div>
                    </a>
                    <hr class="my-1 border-slate-100">
                    <a id="changeUserBtn" href="../../../index.php"
                        class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition">
                        <div class="flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                                </path>
                            </svg>
                            <span>Change User</span>
                        </div>
                    </a>
                </div>
            </div>
        </header>

        <!-- Content Area (Scrollable) -->
        <main class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-10 md:pb-12 lg:pb-16">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <!-- Stats Card 1: Total Income -->
                <div
                    class="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(34,71,150,0.12)] p-7 border border-slate-100 hover:border-blue-200/50 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer group relative overflow-hidden bg-linear-to-br from-white to-slate-50/50">
                    <div class="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-1000 blur-3xl"></div>
                    <div class="flex items-start justify-between relative z-10">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-1 h-3 bg-blue-600 rounded-full group-hover:h-5 transition-all duration-500"></div>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Income</p>
                            </div>
                            <h3 class="text-3xl font-black text-slate-900 tracking-tight group-hover:text-[#224796] transition-colors" id="dashboardTotalIncome">₱0</h3>
                            <div class="flex items-center mt-3 text-[10px] font-bold text-emerald-600 bg-emerald-50/80 px-2.5 py-1 rounded-full w-fit border border-emerald-100/50">
                                <svg class="w-2.5 h-2.5 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M5 10l7-7 7 7M12 3v18" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                                <span>12.5% Inc.</span>
                            </div>
                        </div>
                        <div class="w-14 h-14 bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30 group-hover:scale-105 transition-all duration-500 border border-white/20">
                            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                                </path>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Stats Card 2: Total Expenses -->
                <div
                    class="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(220,38,38,0.12)] p-7 border border-slate-100 hover:border-rose-200/50 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer group relative overflow-hidden bg-linear-to-br from-white to-slate-50/50">
                    <div class="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-1000 blur-3xl"></div>
                    <div class="flex items-start justify-between relative z-10">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-1 h-3 bg-rose-500 rounded-full group-hover:h-5 transition-all duration-500"></div>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Expenses</p>
                            </div>
                            <h3 class="text-3xl font-black text-slate-900 tracking-tight group-hover:text-rose-600 transition-colors" id="dashboardTotalExpenses">₱0</h3>
                            <div class="flex items-center mt-3 text-[10px] font-bold text-rose-600 bg-rose-50/80 px-2.5 py-1 rounded-full w-fit border border-rose-100/50">
                                <svg class="w-2.5 h-2.5 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 14l-7 7-7-7M12 21V3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                                <span>4.2% Dec.</span>
                            </div>
                        </div>
                        <div class="w-14 h-14 bg-linear-to-br from-rose-500 to-rose-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-rose-500/30 group-hover:scale-105 transition-all duration-500 border border-white/20">
                            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z">
                                </path>
                            </svg>
                        </div>
                    </div>
                </div>
                <!-- Stats Card 3: Fund Downloaded Summary -->
                <a href="#chart-page-6"
                    class="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(245,158,11,0.12)] p-7 border border-slate-100 hover:border-amber-200/50 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer group relative overflow-hidden block bg-linear-to-br from-white to-slate-50/50">
                    <div class="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-1000 blur-3xl"></div>
                    <div class="flex items-start justify-between relative z-10">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-1 h-3 bg-amber-500 rounded-full group-hover:h-5 transition-all duration-500"></div>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fund Downloaded</p>
                            </div>
                            <h3 class="text-3xl font-black text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors" id="dashboardFundDownloadedTotal">₱0</h3>
                            <div class="flex items-center mt-3 text-[10px] font-bold text-amber-600 bg-amber-50/80 px-2.5 py-1 rounded-full w-fit border border-amber-100/50">
                                <svg class="w-3 h-3 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Updated now</span>
                            </div>
                        </div>
                        <div class="w-14 h-14 bg-linear-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-amber-500/30 group-hover:scale-105 transition-all duration-500 border border-white/20">
                            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6">
                                </path>
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
                        <select id="chart-page-select"
                            class="w-full px-4 py-3 text-sm font-medium rounded-lg border-2 border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#224796] focus:border-[#224796] cursor-pointer transition-all appearance-none pr-10 shadow-sm hover:border-slate-400">
                            <option value="1">Expenses</option>
                            <option value="2">Daily Transactions</option>
                            <option value="3">Monthly/Weekly Transactions</option>
                            <option value="4">Quarterly Transactions</option>
                            <option value="5">Expenses</option>
                            <option value="6">Fund Downloaded</option>
                        </select>
                        <!-- Custom Dropdown Arrow -->
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                    <!-- Desktop: Pill Navigation -->
                    <div class="hidden md:flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/50 shadow-inner">
                        <button data-page="1"
                            class="chart-page-btn px-6 py-2 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-500 cursor-pointer bg-linear-to-br from-[#224796] to-[#1e3a8a] text-white shadow-lg shadow-blue-900/20 whitespace-nowrap active:scale-95">
                            Revenue
                        </button>
                        <button data-page="2"
                            class="chart-page-btn px-6 py-2 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-500 cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-white whitespace-nowrap active:scale-95">
                            Daily
                        </button>
                        <button data-page="3"
                            class="chart-page-btn px-6 py-2 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-500 cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-white whitespace-nowrap active:scale-95">
                            Trends
                        </button>
                        <button data-page="4"
                            class="chart-page-btn px-6 py-2 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-500 cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-white whitespace-nowrap active:scale-95">
                            Quarterly
                        </button>
                    </div>
                </div>

                <!-- Page 1: Vouchers Charts -->
                <div id="chart-page-1" class="chart-page grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 pb-10 min-w-0">
                    <!-- Monthly Vouchers Donut Chart -->
                    <div class="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] p-4 sm:p-6 md:p-8 lg:p-10 relative isolate overflow-visible group/card transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] min-w-0">
                        <div class="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-[#224796] via-blue-500 to-[#FCF350] opacity-90"></div>
                        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 md:mb-10 min-w-0">
                            <div class="min-w-0 pr-2">
                                <h5 class="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-x-2 gap-y-1 group-hover/card:text-[#224796] transition-colors">
                                    Cash In Bank
                                    <svg data-popover-target="vouchers-info" data-popover-placement="bottom"
                                        class="w-5 h-5 text-slate-500 hover:text-slate-900 cursor-pointer ms-1"
                                        aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                        fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M9.529 9.988a2.502 2.502 0 1 1 5 .191A2.441 2.441 0 0 1 12 12.582V14m-.01 3.008H12M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </h5>
                                <p class="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-1 max-w-prose">Monthly cash flow distribution</p>
                            </div>
                            <div class="shrink-0 self-start sm:self-auto">
                                <button type="button" data-tooltip-target="download-tooltip"
                                    data-tooltip-placement="bottom"
                                    class="inline-flex items-center justify-center text-slate-500 hover:text-slate-900 bg-transparent box-border border border-transparent hover:bg-slate-100 focus:ring-4 focus:ring-slate-200 font-medium leading-5 rounded-lg text-sm w-9 h-9 focus:outline-none cursor-pointer transition-colors">
                                    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                        width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2m-8 1V4m0 12-4-4m4 4 4-4" />
                                    </svg>
                                    <span class="sr-only">Download data</span>
                                </button>
                                <div id="download-tooltip" role="tooltip"
                                    class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-slate-900 rounded-lg shadow-lg opacity-0 tooltip">
                                    Download CSV
                                    <div class="tooltip-arrow" data-popper-arrow></div>
                                </div>
                            </div>
                        </div>

                        <div class="mb-4 sm:mb-6 min-w-0">
                            <div class="grid grid-cols-2 min-[400px]:grid-cols-4 gap-x-3 gap-y-2.5 sm:flex sm:flex-wrap sm:gap-x-4 sm:gap-y-2" id="voucher-quarters">
                                <div class="flex items-center min-w-0">
                                    <input id="q1" type="checkbox" value="Q1"
                                        class="w-4 h-4 shrink-0 border border-slate-300 rounded bg-slate-50 focus:ring-2 focus:ring-[#224796] cursor-pointer"
                                        checked>
                                    <label for="q1"
                                        class="select-none ms-2 text-xs sm:text-sm font-medium text-slate-900 cursor-pointer leading-snug">Q1 (Jan-Mar)</label>
                                </div>
                                <div class="flex items-center min-w-0">
                                    <input id="q2" type="checkbox" value="Q2"
                                        class="w-4 h-4 shrink-0 border border-slate-300 rounded bg-slate-50 focus:ring-2 focus:ring-[#224796] cursor-pointer"
                                        checked>
                                    <label for="q2"
                                        class="select-none ms-2 text-xs sm:text-sm font-medium text-slate-900 cursor-pointer leading-snug">Q2 (Apr-Jun)</label>
                                </div>
                                <div class="flex items-center min-w-0">
                                    <input id="q3" type="checkbox" value="Q3"
                                        class="w-4 h-4 shrink-0 border border-slate-300 rounded bg-slate-50 focus:ring-2 focus:ring-[#224796] cursor-pointer"
                                        checked>
                                    <label for="q3"
                                        class="select-none ms-2 text-xs sm:text-sm font-medium text-slate-900 cursor-pointer leading-snug">Q3 (Jul-Sep)</label>
                                </div>
                                <div class="flex items-center min-w-0">
                                    <input id="q4" type="checkbox" value="Q4"
                                        class="w-4 h-4 shrink-0 border border-slate-300 rounded bg-slate-50 focus:ring-2 focus:ring-[#224796] cursor-pointer"
                                        checked>
                                    <label for="q4"
                                        class="select-none ms-2 text-xs sm:text-sm font-medium text-slate-900 cursor-pointer leading-snug">Q4 (Oct-Dec)</label>
                                </div>
                            </div>
                        </div>

                        <!-- Chart: no overflow clip; xl center track is wider (minmax) so donut is not squeezed -->
                        <div class="grid w-full min-w-0 gap-5 sm:gap-6 justify-items-center overflow-visible xl:grid-cols-[minmax(0,0.9fr)_minmax(14rem,1.45fr)_minmax(0,0.9fr)] xl:items-center xl:justify-items-stretch xl:gap-4 2xl:gap-6 py-3 sm:py-4 md:py-6 relative">
                            <div id="monthlyVouchersLegendLeft" class="hidden xl:flex flex-col gap-2 min-w-0 min-h-0 xl:col-start-1 xl:row-start-1 xl:max-w-[13rem] xl:justify-self-end xl:w-full"></div>

                            <div
                                class="w-full min-w-0 min-h-0 flex flex-col items-center justify-center overflow-visible max-w-[min(94vw,18rem)] min-[360px]:max-w-[min(92vw,19rem)] sm:max-w-[21rem] md:max-w-[24rem] lg:max-w-[27rem] xl:col-start-2 xl:row-start-1 xl:mx-auto xl:w-full xl:max-w-none 2xl:max-w-[36rem] 2xl:mx-auto"
                                data-cash-chart-wrap>
                                <div id="monthlyVouchersSkeleton"
                                     role="status"
                                     class="space-y-3 sm:space-y-4 animate-pulse w-full flex flex-col items-center">
                                    <div class="h-3 bg-neutral-quaternary rounded-full w-28 sm:w-40 mx-auto mb-2"></div>
                                    <div class="h-3 bg-neutral-quaternary rounded-full w-20 sm:w-24 mx-auto mb-3 sm:mb-4"></div>
                                    <div class="flex items-center justify-center px-1 w-full">
                                        <div class="aspect-square w-[min(100%,13.5rem)] max-h-52 sm:w-48 sm:h-48 sm:max-h-none md:w-56 md:h-56 lg:w-60 lg:h-60 rounded-full border-[6px] sm:border-[10px] border-neutral-quaternary/80"></div>
                                    </div>
                                    <div class="flex flex-wrap justify-center gap-2 sm:gap-3 pt-2 sm:pt-3">
                                        <span class="h-2 w-14 sm:w-16 bg-neutral-quaternary rounded-full"></span>
                                        <span class="h-2 w-20 bg-neutral-quaternary rounded-full"></span>
                                        <span class="h-2 w-12 sm:w-14 bg-neutral-quaternary rounded-full"></span>
                                        <span class="h-2 w-20 sm:w-24 bg-neutral-quaternary rounded-full"></span>
                                    </div>
                                    <span class="sr-only">Loading chart...</span>
                                </div>

                                <div class="hidden w-full min-w-0 max-w-full overflow-visible flex justify-center [&_.apexcharts-canvas]:mx-auto [&_.apexcharts-svg]:overflow-visible" id="monthlyVouchersChart"></div>
                            </div>

                            <div id="monthlyVouchersLegendRight"
                                class="hidden xl:flex flex-col gap-2 min-w-0 items-end text-right xl:col-start-3 xl:row-start-1 xl:max-w-[13rem] xl:justify-self-start xl:w-full"></div>

                            <div id="monthlyVouchersLegendMobile"
                                class="grid xl:hidden grid-cols-1 min-[380px]:grid-cols-2 gap-x-3 gap-y-2 sm:gap-4 w-full min-w-0 col-span-full"></div>
                        </div>

                        <!-- Footer with Year and Category Dropdowns -->
                        <div
                            class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between pt-4 border-t border-slate-200 min-w-0">
                            <!-- Year Dropdown (Left Side) -->
                            <div class="relative inline-flex w-full min-w-0 sm:w-auto sm:max-w-[50%]">
                                <button id="cashYearButton" data-dropdown-toggle="cashYearDropdown"
                                    data-dropdown-placement="top-start"
                                    class="w-full sm:w-auto justify-start sm:justify-center text-sm font-medium text-slate-600 hover:text-slate-900 text-center inline-flex items-center cursor-pointer transition-colors"
                                    type="button">
                                    2026 (This Year)
                                    <svg class="w-4 h-4 ms-1.5 rotate-180" aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                        viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="2" d="m19 9-7 7-7-7" />
                                    </svg>
                                </button>
                                <div id="cashYearDropdown"
                                    class="absolute left-0 bottom-full mb-2 z-999 hidden bg-white border border-slate-200 rounded-lg shadow-xl w-44 ring-1 ring-slate-200">
                                    <ul class="p-2 text-sm text-slate-600 font-medium" aria-labelledby="cashYearButton">
                                        <li><a href="#" data-year="2018"
                                                class="block px-3 py-2 hover:bg-slate-100 rounded cursor-pointer">2018</a>
                                        </li>
                                        <li><a href="#" data-year="2019"
                                                class="block px-3 py-2 hover:bg-slate-100 rounded cursor-pointer">2019</a>
                                        </li>
                                        <li><a href="#" data-year="2020"
                                                class="block px-3 py-2 hover:bg-slate-100 rounded cursor-pointer">2020</a>
                                        </li>
                                        <li><a href="#" data-year="2021"
                                                class="block px-3 py-2 hover:bg-slate-100 rounded cursor-pointer">2021</a>
                                        </li>
                                        <li><a href="#" data-year="2022"
                                                class="block px-3 py-2 hover:bg-slate-100 rounded cursor-pointer">2022</a>
                                        </li>
                                        <li><a href="#" data-year="2023"
                                                class="block px-3 py-2 hover:bg-slate-100 rounded cursor-pointer">2023</a>
                                        </li>
                                        <li><a href="#" data-year="2024"
                                                class="block px-3 py-2 hover:bg-slate-100 rounded cursor-pointer">2024</a>
                                        </li>
                                        <li><a href="#" data-year="2025"
                                                class="block px-3 py-2 hover:bg-slate-100 rounded cursor-pointer">2025</a>
                                        </li>
                                        <li><a href="#" data-year="2026"
                                                class="block px-3 py-2 hover:bg-slate-100 rounded cursor-pointer">2026
                                                (This Year)</a></li>
                                    </ul>
                                </div>
                            </div>

                            <!-- Category Dropdowns (Right Side) -->
                            <div class="flex items-stretch sm:items-center gap-2 flex-wrap w-full sm:w-auto justify-stretch sm:justify-end min-w-0">
                                <!-- Main Category Dropdown -->
                                <div class="relative inline-flex w-full min-w-0 sm:w-fit">
                                    <button id="cashCategoryButton" data-dropdown-toggle="cashCategoryDropdown"
                                        data-dropdown-placement="top-end"
                                        class="w-full sm:w-auto justify-center text-sm font-medium text-[#224796] hover:text-[#163473] text-center inline-flex items-center cursor-pointer transition-colors bg-[#224796]/5 border border-[#224796]/10 hover:bg-[#224796]/10 focus:ring-4 focus:ring-slate-200 rounded-lg px-3 py-2 focus:outline-none"
                                        type="button">
                                        All Categories
                                        <svg class="w-4 h-4 ms-1.5 rotate-180" aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                            viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                                stroke-width="2" d="m19 9-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <div id="cashCategoryDropdown"
                                        class="absolute right-0 bottom-full mb-2 z-999 hidden bg-white border border-slate-200 rounded-lg shadow-xl w-52 ring-1 ring-slate-200">
                                        <ul class="p-2 text-sm text-slate-600 font-medium">
                                            <li><a href="#" data-category="all"
                                                    class="block px-3 py-2 hover:bg-slate-100 rounded cursor-pointer">All
                                                    Categories</a></li>
                                            <li><a href="#" data-category="MOOE"
                                                    class="block px-3 py-2 hover:bg-slate-100 rounded cursor-pointer border-b border-slate-100 mb-1 pb-2">MOOE</a>
                                            </li>

                                            <!-- PHM Nested Parent -->
                                            <li>
                                                <button type="button" id="phmNestedButton" data-dropdown-toggle="phmNestedDropdown"
                                                    data-dropdown-placement="left-start"
                                                    class="flex items-center justify-between w-full px-3 py-2 hover:bg-slate-100 rounded text-left group cursor-pointer">
                                                    <span>PHM (PhilHealth)</span>
                                                    <svg class="w-3 h-3 text-slate-400 group-hover:text-slate-900"
                                                        aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                                        fill="none" viewBox="0 0 10 6">
                                                        <path stroke="currentColor" stroke-linecap="round"
                                                            stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                                                    </svg>
                                                </button>
                                                <div id="phmNestedDropdown"
                                                    class="z-1000 hidden bg-white divide-y divide-slate-100 rounded-lg shadow-xl border border-slate-200 w-48">
                                                    <ul class="p-2 text-sm text-slate-600">
                                                        <li><a href="#" data-phm-subtype="PHM - Konsulta"
                                                                class="block px-3 py-2 hover:bg-slate-100 rounded">PHM -
                                                                Konsulta</a></li>
                                                        <li><a href="#" data-phm-subtype="PHM - SPF"
                                                                class="block px-3 py-2 hover:bg-slate-100 rounded">PHM -
                                                                SPF</a></li>
                                                    </ul>
                                                </div>
                                            </li>

                                            <!-- PHIC Nested Parent -->
                                            <li>
                                                <button type="button" id="phicNestedButton" data-dropdown-toggle="phicNestedDropdown"
                                                    data-dropdown-placement="left-start"
                                                    class="flex items-center justify-between w-full px-3 py-2 hover:bg-slate-100 rounded text-left group cursor-pointer">
                                                    <span>PHIC (Claims)</span>
                                                    <svg class="w-3 h-3 text-slate-400 group-hover:text-slate-900"
                                                        aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                                        fill="none" viewBox="0 0 10 6">
                                                        <path stroke="currentColor" stroke-linecap="round"
                                                            stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                                                    </svg>
                                                </button>
                                                <div id="phicNestedDropdown"
                                                    class="z-1000 hidden bg-white divide-y divide-slate-100 rounded-lg shadow-xl border border-slate-200 w-48">
                                                    <ul class="p-2 text-sm text-slate-600">
                                                        <li><a href="#" data-phic-subtype="PHIC - PF"
                                                                class="block px-3 py-2 hover:bg-slate-100 rounded">PHIC
                                                                - PF</a></li>
                                                        <li><a href="#" data-phic-subtype="PHIC - Facility"
                                                                class="block px-3 py-2 hover:bg-slate-100 rounded">PHIC
                                                                - Facility</a></li>
                                                    </ul>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Fund Downloaded Timeline -->
                    <div
                        class="bg-linear-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-6 border border-slate-200/50 backdrop-blur-sm group overflow-hidden">
                        <div class="flex items-center justify-between mb-6">
                            <div>
                                <h3 class="text-xl font-bold text-slate-900 mb-1">Fund Downloaded Timeline</h3>
                                <p class="text-sm text-slate-500">Monthly fund downloads</p>
                            </div>
                            <div
                                class="w-12 h-12 rounded-xl bg-linear-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                            </div>
                        </div>
                        <div id="fundDownloadedTimelineChart" class="chart-container"></div>
                    </div>

                    <!-- Fund Downloaded Summary -->
                    <div
                        class="bg-linear-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-6 border border-slate-200/50 backdrop-blur-sm group overflow-hidden">
                        <div class="flex items-center justify-between mb-6">
                            <div>
                                <h3 class="text-xl font-bold text-slate-900 mb-1">Fund Downloaded Summary</h3>
                                <p class="text-sm text-slate-500">Total funds by period</p>
                            </div>
                            <div
                                class="w-12 h-12 rounded-xl bg-linear-to-br from-[#FCF350] to-[#E5D800] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <svg class="w-6 h-6 text-slate-900" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                                    </path>
                                </svg>
                            </div>
                        </div>
                        <div id="fundDownloadedSummaryChart" class="chart-container"></div>
                    </div>

                    <!-- Daily Vouchers Column Chart -->
                    <div
                        class="bg-white rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_-15px_rgba(252,243,80,0.12)] transition-all duration-500 p-8 border border-slate-50 group/daily relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-[#FCF350] via-yellow-400 to-amber-500 opacity-90"></div>
                        <div class="flex justify-between pb-8 mb-8 border-b border-slate-100">
                            <div class="flex items-center">
                                <div
                                    class="w-16 h-16 bg-linear-to-br from-[#FCF350] to-[#E5D800] border border-white/50 flex items-center justify-center rounded-[1.25rem] me-4 shadow-[0_10px_25px_rgba(252,243,80,0.3)] group-hover/daily:rotate-3 transition-transform duration-500">
                                    <svg class="w-9 h-9 text-slate-900 drop-shadow-sm" aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                        viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-width="2.5"
                                            d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3.05A2.5 2.5 0 1 1 9 5.5M19.5 17h.5a1 1 0 0 0 1-1 3 3 0 0 0-3-3h-1m0-3.05a2.5 2.5 0 1 0-2-4.45m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3 1 1 0 0 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
                                    </svg>
                                </div>
                                <div>
                                    <h5 class="text-3xl font-black text-slate-900 tracking-tight"
                                        id="dailyTotalVouchers">132</h5>
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Generated this week</p>
                                </div>
                            </div>
                            <div>
                                <span
                                    class="inline-flex items-center bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-black px-3 py-1.5 rounded-full shadow-sm">
                                    <svg class="w-3.5 h-3.5 me-1 animate-bounce" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                        width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="3" d="M12 6v13m0-13 4 4m-4-4-4 4" />
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
                            <div class="flex flex-wrap items-center justify-between gap-3 pt-4 md:pt-6">
                                <div class="relative inline-flex w-fit">
                                    <button id="dropdownLastDaysButton" data-dropdown-toggle="LastDaysdropdown"
                                        data-dropdown-placement="bottom"
                                        class="text-sm font-medium text-slate-600 hover:text-slate-900 text-center inline-flex items-center cursor-pointer transition-colors"
                                        type="button">
                                        Last 7 days
                                        <svg class="w-4 h-4 ms-1.5" aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                            viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                                stroke-width="2" d="m19 9-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <div id="LastDaysdropdown"
                                        class="absolute left-0 top-full mt-2 z-999 hidden bg-white border border-slate-200 rounded-lg shadow-xl w-44 ring-1 ring-slate-200">
                                        <ul class="p-2 text-sm text-slate-600 font-medium"
                                            aria-labelledby="dropdownLastDaysButton">
                                            <li>
                                                <a href="#"
                                                    class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Yesterday</a>
                                            </li>
                                            <li>
                                                <a href="#"
                                                    class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Today</a>
                                            </li>
                                            <li>
                                                <a href="#"
                                                    class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Last
                                                    7 days</a>
                                            </li>
                                            <li>
                                                <a href="#"
                                                    class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Last
                                                    30 days</a>
                                            </li>
                                            <li>
                                                <a href="#"
                                                    class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Last
                                                    90 days</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <a href="#"
                                    class="inline-flex items-center text-[#224796] bg-transparent box-border border border-transparent hover:bg-slate-100 focus:ring-4 focus:ring-slate-200 font-medium leading-5 rounded-lg text-sm px-3 py-2 focus:outline-none cursor-pointer transition-colors ms-auto">
                                    Vouchers Report
                                    <svg class="w-4 h-4 ms-1.5 -me-0.5 rtl:rotate-180" aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                        viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Weekly Vouchers Line Chart -->
                    <div
                        class="bg-white rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_-15px_rgba(34,71,150,0.12)] transition-all duration-500 p-8 border border-slate-50 group/chart relative overflow-hidden">
                         <div class="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-[#224796] via-indigo-500 to-blue-400 opacity-90"></div>
                        <div class="flex items-center justify-between mb-8">
                            <div>
                                <h3 class="text-2xl font-black text-slate-900 mb-1 group-hover/chart:text-[#224796] transition-colors">Weekly Vouchers</h3>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Activity trend analysis</p>
                            </div>
                            <div
                                class="w-14 h-14 rounded-2xl bg-linear-to-br from-[#224796] to-indigo-800 flex items-center justify-center shadow-[0_10px_25px_rgba(34,71,150,0.25)] group-hover/chart:scale-110 group-hover/chart:rotate-3 transition-all duration-500 border border-white/20">
                                <svg class="w-8 h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"
                                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z">
                                    </path>
                                </svg>
                            </div>
                        </div>
                        <div id="weeklyVouchersChart" class="chart-container min-h-[300px]"></div>
                    </div>

                    <!-- Yearly Chart 2016-2026 -->
                    <div
                        class="bg-white border border-slate-50 rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] p-8 md:p-10 relative isolate overflow-hidden group/yearly transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.15)]">
                        <div class="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-90"></div>
                        <div class="flex items-center justify-between mb-10">
                            <div>
                                <h3 class="text-3xl font-black text-slate-900 tracking-tight group-hover/yearly:text-emerald-600 transition-colors">Yearly Overview</h3>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Historical data archives 2016-2026</p>
                            </div>
                            <div
                                class="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-[0_10px_25px_rgba(16,185,129,0.25)] group-hover/yearly:scale-110 group-hover/yearly:-rotate-3 transition-all duration-500 border border-white/20">
                                <svg class="w-9 h-9 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                                    </path>
                                </svg>
                            </div>
                        </div>
                        <div id="yearlyVouchersChart" class="chart-container min-h-[320px]"></div>
                    </div>
                </div>

                <!-- Page 2: Daily Transactions Charts (Pie + Expenses) -->
                <div id="chart-page-2" class="chart-page hidden pb-4">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <!-- Daily Transactions Pie -->
                        <div class="bg-white border border-slate-200 rounded-2xl shadow-lg p-4 md:p-6">
                            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between w-full">
                                <div class="flex flex-col gap-1.5">
                                    <div class="flex items-center mb-1">
                                        <h5 class="text-xl font-semibold text-slate-900 me-1">Daily Transactions (Pie)
                                        </h5>
                                        <svg data-popover-target="daily-transactions-info"
                                            data-popover-placement="bottom"
                                            class="w-4 h-4 text-slate-500 hover:text-slate-900 cursor-pointer ms-1"
                                            aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M9.529 9.988a2.502 2.502 0 1 1 5 .191A2.441 2.441 0 0 1 12 12.582V14m-.01 3.008H12M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <div data-popover id="daily-transactions-info" role="tooltip"
                                            class="absolute z-10 p-3 invisible inline-block text-sm text-slate-600 transition-opacity duration-300 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 w-72">
                                            <div>
                                                <h3 class="font-semibold text-slate-900 mb-2">Daily Transactions
                                                    Breakdown</h3>
                                                <p class="mb-4">This pie chart shows how today's transactions are
                                                    distributed across key funding sources (MOOE, PhilHealth, Special
                                                    Program Fund). It will later be driven by the detailed itemized
                                                    records.</p>
                                            </div>
                                            <div data-popper-arrow></div>
                                        </div>
                                    </div>
                                    <p class="text-sm text-slate-500">Today&rsquo;s transactions by funding source</p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <button id="dailyTransactionsDateButton"
                                        data-dropdown-toggle="dailyTransactionsDateDropdown"
                                        data-dropdown-placement="bottom-end" type="button"
                                        class="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-transparent border border-slate-200 hover:bg-slate-100 focus:ring-4 focus:ring-slate-200 rounded-lg px-3 py-2 focus:outline-none cursor-pointer transition-colors">
                                        Today
                                        <svg class="w-4 h-4 ms-1.5" aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                            viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                                stroke-width="2" d="m19 9-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <div id="dailyTransactionsDateDropdown"
                                        class="z-10 hidden bg-white border border-slate-200 rounded-lg shadow-lg w-44">
                                        <ul class="p-2 text-sm text-slate-600 font-medium"
                                            aria-labelledby="dailyTransactionsDateButton">
                                            <li>
                                                <a href="#"
                                                    class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Today</a>
                                            </li>
                                            <li>
                                                <a href="#"
                                                    class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Last
                                                    7 days</a>
                                            </li>
                                            <li>
                                                <a href="#"
                                                    class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Last
                                                    30 days</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <!-- Pie Chart -->
                            <div class="py-6" id="dailyTransactionsPieChart"></div>

                            <div class="grid grid-cols-1 items-center border-slate-200 border-t justify-between mt-4">
                                <div class="flex justify-between items-center pt-4 md:pt-6">
                                    <button id="dailyTransactionsRangeButton"
                                        data-dropdown-toggle="dailyTransactionsRangeDropdown"
                                        data-dropdown-placement="bottom"
                                        class="text-sm font-medium text-slate-600 hover:text-slate-900 text-center inline-flex items-center cursor-pointer transition-colors"
                                        type="button">
                                        Last 7 days
                                        <svg class="w-4 h-4 ms-1.5" aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                            viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                                stroke-width="2" d="m19 9-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <div id="dailyTransactionsRangeDropdown"
                                        class="z-10 hidden bg-white border border-slate-200 rounded-lg shadow-lg w-44">
                                        <ul class="p-2 text-sm text-slate-600 font-medium"
                                            aria-labelledby="dailyTransactionsRangeButton">
                                            <li>
                                                <a href="#"
                                                    class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Today</a>
                                            </li>
                                            <li>
                                                <a href="#"
                                                    class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Last
                                                    7 days</a>
                                            </li>
                                            <li>
                                                <a href="#"
                                                    class="inline-flex items-center w-full p-2 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer transition-colors">Last
                                                    30 days</a>
                                            </li>
                                        </ul>
                                    </div>
                                    <a href="#"
                                        class="inline-flex items-center text-[#224796] bg-transparent box-border border border-transparent hover:bg-slate-100 focus:ring-4 focus:ring-slate-200 font-medium leading-5 rounded-lg text-sm px-3 py-2 focus:outline-none cursor-pointer transition-colors">
                                        Transactions Report
                                        <svg class="w-4 h-4 ms-1.5 -me-0.5 rtl:rotate-180" aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                            viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                                stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Expenses Overview Chart (right of pie on large screens) -->
                        <div
                            class="bg-linear-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-6 border border-slate-200/50 backdrop-blur-sm group overflow-hidden">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="text-xl font-bold text-slate-900 mb-1">Expenses Overview</h3>
                                    <p class="text-sm text-slate-500">Monthly expenses breakdown</p>
                                </div>
                                <div
                                    class="w-12 h-12 rounded-xl bg-linear-to-br from-[#DC2626] to-[#B91C1C] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                            <div id="expensesOverviewChart" class="chart-container"></div>
                        </div>

                        <!-- Expenses by Category Chart (full width below) -->
                        <div
                            class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 overflow-hidden lg:col-span-2">
                            <div class="flex justify-between mb-3">
                                <div class="flex justify-center items-center">
                                    <h5 class="text-xl font-semibold text-slate-900 me-1">Expenses by Category</h5>
                                </div>
                            </div>
                            <div class="py-6" id="expensesCategoryChart"></div>
                        </div>
                    </div>
                </div>

                <!-- Page 3: Monthly/Weekly Transactions Charts -->
                <div id="chart-page-3" class="chart-page hidden pb-4">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <!-- Monthly Transactions Chart -->
                        <div
                            class="bg-linear-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-6 border border-slate-200/50 backdrop-blur-sm group overflow-hidden">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="text-xl font-bold text-slate-900 mb-1">Monthly Transactions</h3>
                                    <p class="text-sm text-slate-500">Current year monthly data</p>
                                </div>
                                <div
                                    class="w-12 h-12 rounded-xl bg-linear-to-br from-[#224796] to-[#163473] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                            <div id="monthlyTransactionsChart" class="chart-container"></div>
                        </div>

                        <!-- Weekly Transactions Chart -->
                        <div
                            class="bg-linear-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-6 border border-slate-200/50 backdrop-blur-sm group overflow-hidden">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="text-xl font-bold text-slate-900 mb-1">Weekly Transactions</h3>
                                    <p class="text-sm text-slate-500">Last 12 weeks trend</p>
                                </div>
                                <div
                                    class="w-12 h-12 rounded-xl bg-linear-to-br from-[#FCF350] to-[#E5D800] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg class="w-6 h-6 text-slate-900" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                            <div id="weeklyTransactionsChart" class="chart-container"></div>
                        </div>
                    </div>
                </div>

                <!-- Page 4: Quarterly Transactions Charts -->
                <div id="chart-page-4" class="chart-page hidden pb-4">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <!-- Quarterly Transactions Donut Chart -->
                        <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 overflow-hidden">
                            <div class="flex justify-between mb-3">
                                <div class="flex justify-center items-center">
                                    <h5 class="text-xl font-semibold text-slate-900 me-1">Quarterly Transactions</h5>
                                </div>
                            </div>
                            <div class="py-6" id="quarterlyTransactionsChart"></div>
                        </div>

                        <!-- Quarterly Comparison Chart -->
                        <div
                            class="bg-linear-to-br from-white via-slate-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-6 border border-slate-200/50 backdrop-blur-sm group overflow-hidden">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="text-xl font-bold text-slate-900 mb-1">Quarterly Comparison</h3>
                                    <p class="text-sm text-slate-500">Year-over-year analysis</p>
                                </div>
                                <div
                                    class="w-12 h-12 rounded-xl bg-linear-to-br from-[#224796] to-[#163473] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                            <div id="quarterlyComparisonChart" class="chart-container"></div>
                        </div>
                    </div>
                </div>

                <!-- Page 5: Expenses Charts (moved notice) -->
                <div id="chart-page-5" class="chart-page hidden pb-4">
                    <div
                        class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 text-sm text-slate-600">
                        Expenses charts are now shown under the
                        <span class="font-semibold text-slate-900">Daily Transactions</span>
                        tab for a combined view with the pie chart.
                    </div>
                </div>

                <!-- Note: Originally Page 6 went here, now it's been integrated into Page 1. -->
            </div>
    </div>
    </main>
    </div>

</body>

</html>
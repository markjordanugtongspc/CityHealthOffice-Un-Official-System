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
        <!-- Content Area (Scrollable) -->
        <main class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-10 md:pb-12 lg:pb-16">
            <!-- Stats Cards Grid (Rectangular Box Design with Watermark SVG Icons) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
                <!-- Stats Card 1: TOTAL BUDGET (Blue) -->
                <div class="relative overflow-hidden bg-blue-600 text-white p-4 pt-3.5 sm:p-5 sm:pt-4 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
                    <!-- Background Watermark Icon: Philippine Peso -->
                    <div class="absolute -right-5 -bottom-5 w-36 h-36 opacity-15 pointer-events-none transform -rotate-12 select-none flex items-center justify-center">
                        <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <!-- Base Peso P shape -->
                            <path d="M7 4h7a4.5 4.5 0 0 1 0 9H7V4z" />
                            <path d="M7 13v7" />
                            <!-- Double Horizontal Bars for Philippine Peso -->
                            <line x1="4" y1="7.5" x2="16" y2="7.5" />
                            <line x1="4" y1="10.5" x2="16" y2="10.5" />
                        </svg>
                    </div>

                    <!-- Top Row: Card Index -->
                    <div class="flex items-center justify-end relative z-10 mb-0.5">
                        <span class="text-xs sm:text-sm font-black tracking-widest text-white/70 font-mono">01</span>
                    </div>

                    <!-- Card Body: Label & Value -->
                    <div class="relative z-10 -mt-2.5 mb-2.5">
                        <p class="text-xs font-extrabold uppercase tracking-wider text-blue-100">TOTAL BUDGET</p>
                        <h3 class="financial-amount financial-amount-hover text-2xl sm:text-3xl font-bold group-hover:font-black text-white mt-0.5 block origin-left truncate tabular-nums transition-[font-weight,transform,opacity] duration-200" id="dashboardTotalIncome">PHP 0</h3>
                    </div>

                    <!-- Footer Row -->
                    <div class="relative z-10 flex items-center justify-between text-[11px] font-bold text-white/80 pt-2 border-t border-white/15">
                        <span class="text-amber-300">Approved allocation</span>
                        <div class="flex items-center gap-1">
                            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7 7 7M12 3v18" />
                            </svg>
                            <span>Allocated</span>
                        </div>
                    </div>
                </div>

                <!-- Stats Card 2: YEARLY BUDGET (Teal/Dark Emerald) -->
                <div class="relative overflow-hidden bg-teal-700 text-white p-4 pt-3.5 sm:p-5 sm:pt-4 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
                    <!-- Background Watermark Icon: Stocks & Trend with Philippine Peso -->
                    <div class="absolute -right-6 -bottom-6 w-36 h-36 opacity-15 pointer-events-none transform -rotate-12 select-none">
                        <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <!-- Trend line & bars -->
                            <path d="M4 15v4m3-6v6M6 8.5 10.5 5 14 7.5 18 4m0 0h-3.5M18 4v3" />
                            <!-- Circular coin badge -->
                            <circle cx="15" cy="15" r="5" />
                                <!-- Philippine Peso center glyph -->
                            <path d="M13.2 12.8h2.3a1.5 1.5 0 0 1 0 3h-2.3v2.2" stroke-width="1.6" />
                            <line x1="12.2" y1="14.1" x2="16.6" y2="14.1" stroke-width="1.4" />
                            <line x1="12.2" y1="15.4" x2="16.6" y2="15.4" stroke-width="1.4" />
                        </svg>
                    </div>

                    <!-- Top Row: Card Index -->
                    <div class="flex items-center justify-end relative z-10 mb-0.5">
                        <span class="text-xs sm:text-sm font-black tracking-widest text-white/70 font-mono">02</span>
                    </div>

                    <!-- Card Body: Label & Value -->
                    <div class="relative z-10 -mt-2.5 mb-2.5">
                        <p class="text-xs font-extrabold uppercase tracking-wider text-teal-100">YEARLY BUDGET</p>
                        <h3 class="financial-amount financial-amount-hover text-2xl sm:text-3xl font-bold group-hover:font-black text-white mt-0.5 block origin-left truncate tabular-nums transition-[font-weight,transform,opacity] duration-200" id="dashboardYearlyIncome">PHP 0</h3>
                    </div>

                    <!-- Footer Row -->
                    <div class="relative z-10 flex items-center justify-between text-[11px] font-bold text-white/80 pt-2 border-t border-white/15">
                        <span class="text-emerald-300">Annual allocation</span>
                        <div class="flex items-center gap-1">
                            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Disbursed</span>
                        </div>
                    </div>
                </div>

                <!-- Stats Card 3: TOTAL EXPENSES (Warm Amber/Orange) -->
                <div class="relative overflow-hidden bg-amber-600 text-white p-4 pt-3.5 sm:p-5 sm:pt-4 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
                    <!-- Background Watermark Icon: Expenses with Philippine Peso -->
                    <div class="absolute -right-6 -bottom-6 w-36 h-36 opacity-15 pointer-events-none transform -rotate-12 select-none">
                        <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor">
                            <g>
                                <path d="m11.828 17.343c-.066 0-.133-.013-.198-.041-3.116-1.347-5.13-4.41-5.13-7.802 0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5c0 2.831-1.403 5.467-3.754 7.052-.228.154-.539.094-.694-.135-.154-.229-.094-.54.135-.694 2.074-1.399 3.313-3.725 3.313-6.223 0-4.136-3.364-7.5-7.5-7.5s-7.5 3.364-7.5 7.5c0 2.993 1.777 5.695 4.526 6.884.254.11.37.404.261.657-.081.189-.266.302-.459.302z"/>
                                <path d="m11 21c-.128 0-.256-.049-.354-.146l-10-10c-.195-.195-.195-.512 0-.707s.512-.195.707 0l9.647 9.646 3.646-3.646c.195-.195.512-.195.707 0l3.5 3.5c.195.195.195.512 0 .707s-.512.195-.707 0l-3.146-3.147-3.646 3.646c-.098.098-.226.147-.354.147z"/>
                                <path d="m21 23h-5c-.202 0-.385-.122-.462-.309-.078-.187-.035-.402.108-.545l5-5c.143-.144.357-.187.545-.108.187.077.309.26.309.462v5c0 .276-.224.5-.5.5zm-3.793-1h3.293v-3.293z"/>
                                <!-- Philippine Peso center glyph -->
                                <path d="M12.8 6.5h2.8c1.3 0 2.4.9 2.4 2.2s-1.1 2.2-2.4 2.2h-1.8v2.6h-1V6.5zm1 3.5h1.8c.8 0 1.4-.5 1.4-1.3s-.6-1.3-1.4-1.3h-1.8V10z"/>
                                <rect x="11.8" y="7.8" width="5.4" height="0.8" rx="0.4"/>
                                <rect x="11.8" y="9.5" width="5.4" height="0.8" rx="0.4"/>
                            </g>
                        </svg>
                    </div>

                    <!-- Top Row: Card Index -->
                    <div class="flex items-center justify-end relative z-10 mb-0.5">
                        <span class="text-xs sm:text-sm font-black tracking-widest text-white/70 font-mono">03</span>
                    </div>

                    <!-- Card Body: Label & Value -->
                    <div class="relative z-10 -mt-2.5 mb-2.5">
                        <p class="text-xs font-extrabold uppercase tracking-wider text-amber-100">TOTAL EXPENSES</p>
                        <h3 class="financial-amount financial-amount-hover text-2xl sm:text-3xl font-bold group-hover:font-black text-white mt-0.5 block origin-left truncate tabular-nums transition-[font-weight,transform,opacity] duration-200" id="dashboardTotalExpenses">PHP 0</h3>
                    </div>

                    <!-- Footer Row -->
                    <div class="relative z-10 flex items-center justify-between text-[11px] font-bold text-white/80 pt-2 border-t border-white/15">
                        <span class="text-amber-200">Current Spent</span>
                        <div class="flex items-center gap-1">
                            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="2 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l2 2" />
                            </svg>
                            <span>Processing</span>
                        </div>
                    </div>
                </div>

                <!-- Stats Card 4: FUND DOWNLOADED (Deep Crimson/Rose) -->
                <a class="relative overflow-hidden bg-rose-700 text-white p-4 pt-3.5 sm:p-5 sm:pt-4 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between block">
                    <!-- Background Watermark Icon: Balance Scale (Tilted, Scaled Large, Translucent) -->
                    <div class="absolute -right-6 -bottom-6 w-36 h-36 opacity-15 pointer-events-none transform -rotate-12 select-none">
                        <svg class="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                    </div>

                    <!-- Top Row: Card Index -->
                    <div class="flex items-center justify-end relative z-10 mb-0.5">
                        <span class="text-xs sm:text-sm font-black tracking-widest text-white/70 font-mono">04</span>
                    </div>

                    <!-- Card Body: Label & Value -->
                    <div class="relative z-10 -mt-2.5 mb-2.5">
                        <p class="text-xs font-extrabold uppercase tracking-wider text-rose-100">FUND DOWNLOADED</p>
                        <h3 class="financial-amount financial-amount-hover text-2xl sm:text-3xl font-bold group-hover:font-black text-white mt-0.5 block origin-left truncate tabular-nums transition-[font-weight,transform,opacity] duration-200" id="dashboardFundDownloadedTotal">PHP 0</h3>
                    </div>

                    <!-- Footer Row -->
                    <div class="relative z-10 flex items-center justify-between text-[11px] font-bold text-white/80 pt-2 border-t border-white/15">
                        <span class="text-rose-200">Remaining</span>
                        <div class="flex items-center gap-1">
                            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7-7-7" />
                            </svg>
                            <span>Balance</span>
                        </div>
                    </div>
                </a>
            </div>

            <!-- Charts Section -->
            <div class="mt-6">
                <!-- Page 1: Cashflow charts -->
                <div id="chart-page-1" class="chart-page grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 pb-10 min-w-0">
                    <!-- Cash In Bank and Expenses dual-line chart -->
                    <div class="bg-white rounded-xl shadow-[0_2px_10px_rgba(15,23,42,0.14)] p-4 sm:p-6 md:p-8 relative isolate overflow-visible min-w-0 w-full lg:col-span-2">

                        <div class="mb-4">
                            <div class="flex items-start justify-between gap-3">
                                <div>
                                    <h5 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">CASH IN BANK</h5>
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mt-1">Monthly bank deposits and expenses</p>
                                </div>
                                <div class="relative shrink-0">
                                    <button id="cashflowDataStatus" type="button" class="inline-flex w-32 max-w-full items-center justify-between gap-1.5 border border-slate-500 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400">
                                        <span class="inline-flex min-w-0 items-center gap-1.5">
                                            <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                            <span id="cashflowDataStatusLabel">2026</span>
                                        </span>
                                        <svg class="h-4 w-4 shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" /></svg>
                                    </button>
                                    <div id="cashflowPeriodDropdown" class="absolute right-0 top-full z-50 mt-1 hidden w-32 max-w-[calc(100vw-2rem)] border border-slate-500 bg-white p-1.5 shadow-lg">
                                        <div>
                                            <p class="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-700">Year</p>
                                            <div class="space-y-1">
                                                <button type="button" data-cashflow-year="2026" class="block w-full px-2 py-1.5 text-left text-sm text-slate-800 hover:bg-slate-100">2026</button>
                                                <button type="button" data-cashflow-year="2025" class="block w-full px-2 py-1.5 text-left text-sm text-slate-800 hover:bg-slate-100">2025</button>
                                                <button type="button" data-cashflow-year="2024" class="block w-full px-2 py-1.5 text-left text-sm text-slate-800 hover:bg-slate-100">2024</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:max-w-[46rem]">
                                <div class="group flex items-center gap-3 border-b border-slate-300 pb-3">
                                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 24 24" aria-hidden="true"><title>Bank</title><path fill="currentColor" d="m21.49 7.13l-9-5a.99.99 0 0 0-.97 0l-9.01 5C2.19 7.31 2 7.64 2 8v3c0 .55.45 1 1 1h2v4H3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h18c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1h-2v-4h2c.55 0 1-.45 1-1V8a1 1 0 0 0-.51-.87M7 12h2v4H7zm6 0v4h-2v-4zm7 6v2H4v-2zm-3-2h-2v-4h2zm3-6H4V8.59l8-4.44l8 4.44z"/><path fill="currentColor" d="M12 6a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3"/></svg>
                                    </div>
                                    <div class="min-w-0">
                                        <p id="cashflowIncomeTotal" class="financial-amount financial-amount-hover block origin-left truncate text-2xl font-bold group-hover:font-black text-sky-800 tabular-nums transition-[font-weight,transform,opacity] duration-300 ease-out">PHP 0</p>
                                        <p class="text-xs font-bold uppercase tracking-wide text-slate-700">CASH IN BANK</p>
                                    </div>
                                </div>
                                <div class="group flex items-center gap-3 border-b border-slate-300 pb-3">
                                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-800">
                                        <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M13.5295 8.35186C12.9571 8.75995 12.2566 9 11.5 9C9.567 9 8 7.433 8 5.5C8 3.567 9.567 2 11.5 2C12.753 2 13.8522 2.65842 14.4705 3.64814M6 20.0872H8.61029C8.95063 20.0872 9.28888 20.1277 9.61881 20.2086L12.3769 20.8789C12.9753 21.0247 13.5988 21.0388 14.2035 20.9214L17.253 20.3281C18.0585 20.1712 18.7996 19.7854 19.3803 19.2205L21.5379 17.1217C22.154 16.5234 22.154 15.5524 21.5379 14.9531C20.9832 14.4134 20.1047 14.3527 19.4771 14.8103L16.9626 16.6449C16.6025 16.9081 16.1643 17.0498 15.7137 17.0498H13.2855L14.8311 17.0498C15.7022 17.0498 16.4079 16.3633 16.4079 15.5159V15.2091C16.4079 14.5055 15.9156 13.892 15.2141 13.7219L12.8286 13.1417C12.4404 13.0476 12.0428 13 11.6431 13C10.6783 13 8.93189 13.7988 8.93189 13.7988L6 15.0249M20 6.5C20 8.433 18.433 10 16.5 10C14.567 10 13 8.433 13 6.5C13 4.567 14.567 3 16.5 3C18.433 3 20 4.567 20 6.5ZM2 14.6L2 20.4C2 20.9601 2 21.2401 2.10899 21.454C2.20487 21.6422 2.35785 21.7951 2.54601 21.891C2.75992 22 3.03995 22 3.6 22H4.4C4.96005 22 5.24008 22 5.45399 21.891C5.64215 21.7951 5.79513 21.6422 5.89101 21.454C6 21.2401 6 20.9601 6 20.4V14.6C6 14.0399 6 13.7599 5.89101 13.546C5.79513 13.3578 5.64215 13.2049 5.45399 13.109C5.24005 13 4.96005 13 4.4 13L3.6 13C3.03995 13 2.75995 13 2.54601 13.109C2.35785 13.2049 2.20487 13.3578 2.10899 13.546C2 13.7599 2 14.0399 2 14.6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                    </div>
                                    <div class="min-w-0">
                                        <p id="cashflowExpenseTotal" class="financial-amount financial-amount-hover block origin-left truncate text-2xl font-bold group-hover:font-black text-rose-800 tabular-nums transition-[font-weight,transform,opacity] duration-300 ease-out">PHP 0</p>
                                        <p class="text-xs font-bold uppercase tracking-wide text-slate-700">EXPENSES</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="moneyCashflowChart" class="cashflow-chart-surface rounded-lg min-h-[18rem] w-full"></div>
                    </div>
                    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="remainingBudgetTitle">
                        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h3 id="remainingBudgetTitle" class="text-xl font-black text-slate-900">REMAINING BUDGET</h3>
                                <p class="text-sm text-slate-600">Monthly balance monitoring by program.</p>
                            </div>
                            <select id="remainingBudgetYear" class="w-32 border border-slate-500 bg-white px-3 py-2 text-xs font-black text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400">
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                            </select>
                        </div>
                        <div id="remainingBudgetChart" class="min-h-[18rem] w-full"></div>
                    </section>

                    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="suppliesExpenseTitle">
                        <div class="mb-4 flex flex-col gap-3">
                            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h3 id="suppliesExpenseTitle" class="text-xl font-black text-slate-900">SUPPLIES EXPENSE</h3>
                                    <p class="text-sm text-slate-600">Product categories and payment method mix.</p>
                                </div>
                                <div class="inline-flex w-fit shrink-0 border border-slate-300 bg-slate-50 p-1" role="group" aria-label="Supplies expense chart view">
                                    <button type="button" data-supplies-view="category" class="supplies-view-btn px-3 py-1.5 text-xs font-black uppercase tracking-wide text-slate-700 hover:bg-white cursor-pointer">Products</button>
                                    <button type="button" data-supplies-view="payment" class="supplies-view-btn px-3 py-1.5 text-xs font-black uppercase tracking-wide text-slate-700 hover:bg-white cursor-pointer">Cash/Cheque</button>
                                </div>
                            </div>
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <div class="relative">
                                    <svg class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-700" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 7V3M16 7V3M3 11H21M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                    <select id="suppliesExpenseMonth" class="h-8 w-40 border border-slate-500 bg-white pl-8 pr-6 text-xs font-black text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:w-44 cursor-pointer">
                                        <option value="all">All months</option>
                                        <option value="Jan">Jan</option>
                                        <option value="Feb">Feb</option>
                                        <option value="Mar">Mar</option>
                                        <option value="Apr">Apr</option>
                                        <option value="May">May</option>
                                        <option value="Jun">Jun</option>
                                        <option value="Jul">Jul</option>
                                        <option value="Aug">Aug</option>
                                        <option value="Sep">Sep</option>
                                        <option value="Oct">Oct</option>
                                        <option value="Nov">Nov</option>
                                        <option value="Dec">Dec</option>
                                    </select>
                                </div>
                                <div class="relative">
                                    <svg class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-700" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 20.3854 4.63803 20.673C5.27976 22 6.11984 22 7.8 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                    <select id="suppliesExpenseYear" class="h-8 w-32 border border-slate-500 bg-white pl-8 pr-6 text-xs font-black text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer">
                                        <option value="2026">2026</option>
                                        <option value="2025">2025</option>
                                        <option value="2024">2024</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div id="suppliesExpenseChart" class="min-h-[20rem] w-full"></div>
                    </section>

                    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2" aria-labelledby="officeExpenseTitle">
                        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h3 id="officeExpenseTitle" class="text-xl font-black text-slate-900">OFFICE INCOME AND EXPENSES</h3>
                                <p class="text-sm text-slate-600">City Health Office - Marawi City (BTSD) and PhilHealth programs.</p>
                            </div>
                            <select id="officeFinancialYear" class="w-32 border border-slate-500 bg-white px-3 py-2 text-xs font-black text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400">
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                            </select>
                        </div>
                        <div id="officeFinancialChart" class="min-h-[20rem] w-full"></div>
                    </section>

                    <!-- Pending Disbursement Vouchers -->
                    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2" aria-labelledby="pendingDvTitle">
                        <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 id="pendingDvTitle" class="text-xl font-black text-slate-900">PENDING DV&apos;S</h3>
                                <p class="text-sm text-slate-600">Disbursement vouchers awaiting review and approval.</p>
                            </div>
                            <span class="inline-flex w-fit items-center rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">6 FOR ACTION</span>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full min-w-[680px] text-left text-sm text-slate-700">
                                <thead class="border-y border-slate-300 bg-slate-50 text-xs uppercase tracking-wide text-slate-800">
                                    <tr>
                                        <th class="px-3 py-3">DV No.</th>
                                        <th class="px-3 py-3">Payee / Office</th>
                                        <th class="px-3 py-3">Purpose</th>
                                        <th class="px-3 py-3">Amount</th>
                                        <th class="px-3 py-3">Recorded</th>
                                        <th class="px-3 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody id="pendingDvTableBody" class="divide-y divide-slate-200"></tbody>
                            </table>
                        </div>
                        <div class="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
                            <p class="text-xs text-slate-500" id="pendingDvPaginationSummary">Showing 1 to 6 of 6 entries</p>
                            <div class="flex items-center justify-end gap-2">
                                <button id="pendingDvPrevPage" type="button" class="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">Prev</button>
                                <div id="pendingDvPageNumbers" class="flex items-center gap-1"></div>
                                <button id="pendingDvNextPage" type="button" class="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
                <?php require_once __DIR__ . '/../../components/components.php'; ?>
        </main>
    </div>

</body>

</html>
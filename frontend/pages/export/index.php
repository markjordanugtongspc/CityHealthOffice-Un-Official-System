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
    <title>Print Reports - City Health Office</title>

    <!-- Vite Assets -->
    <?php vite('backend/js/main.js'); ?>

</head>

<body class="app-shell min-h-screen flex flex-col bg-slate-100 print:block print:h-auto print:min-h-0 print:bg-white">
    <?php require_once __DIR__ . '/../../components/page-loader.php'; ?>
    <?php require_once __DIR__ . '/../../components/sidebar.php'; ?>

    <!-- Main Content Container (Expandable and Scrollable) -->
    <div id="spaContentContainer"
        class="main-content ml-0 w-full max-w-full lg:w-auto lg:ml-80! lg:group-[.sidebar-collapsed]/body:!ml-[4.5rem] min-h-screen transition-all duration-300 flex-1 flex flex-col print:hidden overflow-hidden!">
        <!-- Header -->
        <header
            class="sticky top-0 z-40 flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 print:hidden">
            <div class="flex items-center space-x-3">
                <!-- Mobile Hamburger Toggle (visible only on mobile) -->
                <button id="sidebarToggleHeader" type="button"
                    class="relative z-50 lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
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
                    <h1 class="text-xl font-bold text-slate-900 text-balance">Print Reports</h1>
                    <h3 class="text-sm text-slate-600 text-balance">Print data and reports for <span id="exportCurrentYear"
                            class="relative inline-block font-black text-slate-900 cursor-pointer group transition-all duration-300 hover:text-[#224796]">
                            <span
                                class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#224796] transition-all duration-300 group-hover:w-full"></span>
                            <span id="exportYearText"></span>
                        </span></h3>
                </div>
            </div>

            <!-- User Menu -->
            <div class="relative">
                <button id="userMenuButton"
                    class="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                    <div class="w-10 h-10 bg-[#224796] rounded-full flex items-center justify-center">
                        <span id="userInitial" class="text-white font-semibold text-sm">...</span>
                    </div>
                    <div class="hidden md:block text-left">
                        <p id="userUsername" class="text-sm font-medium text-slate-900">...</p>
                        <p id="userRole" class="text-xs text-slate-500">...</p>
                    </div>
                    <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
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
                    <a id="settingsBtn" href="#"
                        class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition">
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
        <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 print:hidden">
            <!-- Intro section -->
            <section class="mb-6">
                <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6">
                    <h2 class="text-xl md:text-2xl font-semibold text-slate-900 mb-2 text-balance">
                        Print Reports
                    </h2>
                    <p class="text-sm md:text-base text-slate-600">
                        Print data and reports from various sources. Select your data source, preview the content, and
                        print your document.
                    </p>
                </div>
            </section>

            <!-- Print Configuration -->
            <section class="mb-6 invisible-on-print">
                <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 class="text-lg font-semibold text-slate-900 text-balance">Report Generator</h3>
                            <p class="text-sm text-slate-500 text-balance">Generate, preview and export professional reports</p>
                        </div>

                        <div class="flex flex-wrap items-center gap-2">
                            <div class="relative group inline-block">
                                <button id="configBtn" type="button"
                                    class="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4">
                                        </path>
                                    </svg>
                                    Configure
                                </button>
                                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] sm:max-w-[200px] px-2.5 py-1.5 bg-slate-900/90 backdrop-blur-sm text-white text-xs text-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-xl border border-slate-700/50 whitespace-normal">
                                    E-Configure ang settings sa export
                                </div>
                            </div>
                            
                            <div class="relative group inline-block">
                                <button id="exportExcelBtn" type="button"
                                    class="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all shadow-md cursor-pointer">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                        </path>
                                    </svg>
                                    Excel
                                </button>
                                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] sm:max-w-[200px] px-2.5 py-1.5 bg-slate-900/90 backdrop-blur-sm text-white text-xs text-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-xl border border-slate-700/50 whitespace-normal">
                                    E-Export into Excel File
                                </div>
                            </div>

                            <div class="relative group inline-block">
                                <button id="exportPrintBtn" type="button"
                                    class="inline-flex items-center px-4 py-2 bg-[#224796] text-white rounded-lg text-sm font-medium hover:bg-[#163473] transition-all shadow-md cursor-pointer">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z">
                                        </path>
                                    </svg>
                                    Print
                                </button>
                                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] sm:max-w-[200px] px-2.5 py-1.5 bg-slate-900/90 backdrop-blur-sm text-white text-xs text-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-xl border border-slate-700/50 whitespace-normal">
                                    E-Print ni niya nga voucher
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="activeFilterBadges" class="mt-4 flex flex-wrap gap-2">
                        <!-- Filter badges will be injected here -->
                    </div>
                </div>
            </section>

            <!-- Live Preview (Web) -->
            <section class="mb-6 invisible-on-print">
                <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Live Web Preview</h3>
                        <span id="previewRecordCount"
                            class="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">0
                            Records</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table id="webTable" class="min-w-full divide-y divide-slate-200">
                            <thead id="webTableHeader"></thead>
                            <tbody id="webTableBody" class="bg-white divide-y divide-slate-100">
                                <tr>
                                    <td colspan="100%" class="px-6 py-12 text-center text-slate-500 italic">
                                        Select a data source to begin previewing...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <!-- Professional Print Template -->
    <?php require_once __DIR__ . '/../../components/exportTemplate.php'; ?>

</body>

</html>
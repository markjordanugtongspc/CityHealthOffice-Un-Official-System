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
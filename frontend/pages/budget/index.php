<?php
require_once __DIR__ . '/../../../config/vite_helper.php';
require_once __DIR__ . '/../../../config/db.php';
require_once __DIR__ . '/../../../config/session.php';
requireAuth();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Budget - City Health Office</title>
    <?php vite('backend/js/main.js'); ?>
</head>
<body class="app-shell min-h-screen flex flex-col bg-slate-100">
    <?php require_once __DIR__ . '/../../components/page-loader.php'; ?>
    <?php require_once __DIR__ . '/../../components/sidebar.php'; ?>

    <div id="spaContentContainer" class="main-content ml-0 w-full max-w-full lg:w-auto lg:ml-80! lg:group-[.sidebar-collapsed]/body:!ml-[4.5rem] min-h-screen transition-all duration-300 flex-1 flex flex-col overflow-hidden!">
        <main class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
            <section class="mb-6">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div class="flex items-start gap-3">
                        <img src="<?php echo htmlspecialchars(getImagePath('frontend/images/actualBudgets.svg')); ?>" alt="" aria-hidden="true" class="mt-0.5 h-10 w-10 shrink-0 object-contain">
                        <div>
                            <h1 class="text-2xl font-bold uppercase tracking-tight text-slate-900">Actual vs Budget Year-to-Date</h1>
                            <p class="mt-1 max-w-3xl text-sm text-slate-600">Review approved allocations, actual spending, and remaining balances for <span id="budgetCurrentYearInline" class="font-semibold text-slate-900"></span>.</p>
                        </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                        <div class="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Year</span>
                            <select id="budgetYear" class="cursor-pointer border-0 bg-transparent py-0 pl-1 pr-7 text-sm font-bold text-slate-900 focus:ring-0"></select>
                        </div>
                        <button id="budgetCalculateBtn" type="button" class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-orange-500 bg-transparent px-3.5 py-2 text-sm font-semibold text-orange-500 hover:bg-orange-500 hover:text-white active:bg-orange-600 active:text-white focus:ring-4 focus:ring-orange-200 shadow-sm transition-all duration-200">
                            <svg class="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 2H20C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2ZM5 4V20H19V4H5ZM7 6H17V10H7V6ZM7 12H9V14H7V12ZM7 16H9V18H7V16ZM11 12H13V14H11V12ZM11 16H13V18H11V16ZM15 12H17V18H15V12Z"></path></svg>Calculate
                        </button>
                        <button id="budgetAddBtn" type="button" class="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 active:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-all duration-200">
                            <svg class="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"/></svg>Add Entry
                        </button>
                    </div>
                </div>
            </section>

            <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div class="flex flex-col gap-4 border-b border-slate-200 p-4 md:p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 class="text-lg font-semibold text-slate-900">Budget Entries</h2>
                        <p class="mt-1 text-sm text-slate-500">Manage account allocations and compare them with recorded expenses.</p>
                    </div>
                    <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <label for="budgetSearch" class="sr-only">Search budget entries</label>
                        <div class="relative min-w-0 sm:w-64">
                            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"/></svg>
                            <input id="budgetSearch" type="search" placeholder="Search accounts..." class="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:ring-cyan-600">
                        </div>
                        <label for="budgetSort" class="sr-only">Sort budget entries</label>
                        <select id="budgetSort" class="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-cyan-600 focus:ring-cyan-600">
                            <option value="">Sort: Default</option>
                            <option value="actual">Actual</option>
                            <option value="budget">Budget</option>
                            <option value="remainingAmount">Remaining</option>
                            <option value="remainingPercent">Remaining %</option>
                        </select>
                        <button id="budgetSortDirection" type="button" title="Lowest first (Click for Highest)" class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Toggle sort direction">
                            <svg id="budgetSortDirectionIcon" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                        </button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table id="budgetTable" class="w-full min-w-[900px] text-left text-sm text-slate-600">
                        <thead class="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th class="px-4 py-3 font-medium">G/L Code</th>
                                <th class="px-4 py-3 font-medium">Account Title</th>
                                <th class="px-4 py-3 text-right font-medium">Actual</th>
                                <th class="px-4 py-3 text-right font-medium">Budget</th>
                                <th class="px-4 py-3 text-right font-medium">Remaining #</th>
                                <th class="px-4 py-3 text-right font-medium">Remaining %</th>
                                <th class="px-4 py-3 text-center font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody id="budgetTableBody" class="divide-y divide-slate-100 bg-white">
                            <!-- Flowbite Loading Skeleton Rows -->
                            <?php for ($i = 0; $i < 5; $i++): ?>
                            <tr class="<?php echo $i % 2 === 1 ? 'bg-slate-50' : 'bg-white'; ?> animate-pulse" role="status">
                                <td class="whitespace-nowrap px-4 py-3">
                                    <div class="h-2.5 bg-slate-200 rounded-full w-20"></div>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="h-2.5 bg-slate-200 rounded-full w-48 md:w-60 mb-2"></div>
                                    <div class="w-32 h-2 bg-slate-200 rounded-full"></div>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-right">
                                    <div class="h-2.5 bg-slate-200 rounded-full w-16 ml-auto"></div>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-right">
                                    <div class="h-2.5 bg-slate-200 rounded-full w-20 ml-auto"></div>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-right">
                                    <div class="h-2.5 bg-slate-200 rounded-full w-20 ml-auto"></div>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-right">
                                    <div class="h-2.5 bg-slate-200 rounded-full w-12 ml-auto"></div>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-center">
                                    <div class="h-7 w-7 bg-slate-200 rounded-lg mx-auto"></div>
                                </td>
                            </tr>
                            <?php endfor; ?>
                            <tr class="sr-only">
                                <td colspan="7"><span role="status">Loading...</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
                    <p id="budgetPaginationSummary" class="text-xs text-slate-500">Showing 0 to 0 of 0 entries</p>
                    <div class="flex items-center justify-end gap-2">
                        <button id="budgetPrevPage" type="button" class="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">Prev</button>
                        <div id="budgetPageNumbers" class="flex items-center gap-1"></div>
                        <button id="budgetNextPage" type="button" class="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
                    </div>
                </div>
            </section>
            <?php $footerSpacingClass = 'mt-8'; require_once __DIR__ . '/../../components/components.php'; ?>
        </main>
    </div>
</body>
</html>
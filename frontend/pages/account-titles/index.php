<?php
require_once __DIR__ . '/../../../config/vite_helper.php';
require_once __DIR__ . '/../../../config/db.php';
require_once __DIR__ . '/../../../config/session.php';
requireAuth();
$currentUser = getCurrentUser();
if (!in_array($currentUser['role'], ['Administrator', 'CEO', 'Manager'])) {
    header('Location: ../dashboard/');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Titles - City Health Office</title>
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
                        <div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                            <svg class="h-6 w-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 9h6m-6 3h6m-6 3h6M6.996 9h.01m-.01 3h.01m-.01 3h.01M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>
                            </svg>
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold uppercase tracking-tight text-slate-900">Account Titles Directory</h1>
                            <p class="mt-1 max-w-3xl text-sm text-slate-600">Modify, re-order, and manage master G/L account titles and chart of accounts.</p>
                        </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                        <button id="accountTitlesAddBtn" type="button" class="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 active:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-all duration-200">
                            <svg class="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"/></svg>Add Account
                        </button>
                    </div>
                </div>
            </section>

            <section class="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div class="flex flex-col gap-4 border-b border-slate-200 p-4 md:p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 class="text-lg font-semibold text-slate-900">Account List</h2>
                        <p class="mt-1 text-sm text-slate-500">View and update system G/L codes and descriptive titles.</p>
                    </div>
                    <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <label for="accountTitlesSearch" class="sr-only">Search accounts</label>
                        <div class="relative min-w-0 sm:w-64">
                            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"/></svg>
                            <input id="accountTitlesSearch" type="search" placeholder="Search accounts..." class="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:ring-cyan-600">
                        </div>
                        <button id="accountTitlesSortDirection" type="button" title="Ascending order (Click for Descending)" class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Toggle sort direction">
                            <svg id="accountTitlesSortDirectionIcon" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                        </button>
                        <button id="accountTitlesCategoryFilterToggleBtn" type="button" title="Filter by Fund Category" class="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all shadow-xs" aria-label="Filter by category" aria-expanded="false">
                            <svg id="accountTitlesCategoryFilterIcon" class="h-4 w-4 text-slate-600 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span class="hidden sm:inline">Category</span>
                            <span id="accountTitlesCategoryActiveBadge" class="hidden ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white">1</span>
                        </button>
                    </div>
                </div>

                <!-- Expandable Horizontal Searchable and Clickable Multiple Text Buttons (Categories) -->
                <div id="accountTitlesCategoryFilterPanel" class="hidden border-b border-slate-100 bg-slate-50/70 p-3 sm:px-5 transition-all duration-200">
                    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div id="accountTitlesCategoryPillsContainer" class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                            <!-- Populated dynamically via JS from DB -->
                        </div>
                        <div class="relative w-full sm:w-48 shrink-0">
                            <input id="accountTitlesCategorySearchInput" type="text" placeholder="Filter pills..." class="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-7 pr-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs">
                            <svg class="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"/></svg>
                        </div>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table id="accountTitlesTable" class="w-full text-left text-sm text-slate-600">
                        <thead class="bg-[#224796] text-xs uppercase tracking-wider text-white">
                            <tr>
                                <th class="w-16 px-4 py-3.5 font-bold tracking-wider text-white">#</th>
                                <th class="w-48 px-4 py-3.5 font-bold tracking-wider text-white">
                                    <button type="button" id="accountTitlesGlCodeHeaderSort" class="group inline-flex items-center gap-1.5 font-bold tracking-wider text-white hover:text-blue-100 cursor-pointer select-none focus:outline-hidden" title="Click to toggle G/L Code sorting (Lowest / Highest)">
                                        <span>G/L Code</span>
                                        <span id="accountTitlesGlSortIconWrap" class="inline-flex items-center justify-center rounded-sm p-0.5 group-hover:bg-white/10 transition-colors">
                                            <svg id="accountTitlesGlSortIcon" class="h-4 w-4 text-blue-200 group-hover:text-white transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </span>
                                    </button>
                                </th>
                                <th class="px-4 py-3.5 font-bold tracking-wider text-white">Account Title</th>
                                <th class="w-36 px-4 py-3.5 font-bold tracking-wider text-white">Category</th>
                                <th class="w-32 px-4 py-3.5 text-center font-bold tracking-wider text-white">Action</th>
                            </tr>
                        </thead>
                        <tbody id="accountTitlesTableBody" class="divide-y divide-slate-100 bg-white">
                            <!-- Flowbite Skeleton Pulse Rows Placeholder -->
                            <?php for ($i = 0; $i < 5; $i++): ?>
                            <tr class="<?php echo $i % 2 === 1 ? 'bg-slate-50' : 'bg-white'; ?> animate-pulse" role="status">
                                <td class="whitespace-nowrap px-4 py-3">
                                    <div class="h-2.5 bg-slate-200 rounded-full w-8"></div>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3">
                                    <div class="h-2.5 bg-slate-200 rounded-full w-24"></div>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="h-2.5 bg-slate-200 rounded-full w-64 md:w-96 mb-1.5"></div>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3">
                                    <div class="h-5 bg-slate-200 rounded-full w-20"></div>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-center">
                                    <div class="h-7 w-7 bg-slate-200 rounded-lg mx-auto"></div>
                                </td>
                            </tr>
                            <?php endfor; ?>
                        </tbody>
                    </table>
                </div>

                <div class="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
                    <p id="accountTitlesPaginationSummary" class="text-xs text-slate-500">Showing 0 to 0 of 0 entries</p>
                    <div class="flex items-center justify-end gap-2">
                        <button id="accountTitlesPrevPage" type="button" class="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">Prev</button>
                        <div id="accountTitlesPageNumbers" class="flex items-center gap-1"></div>
                        <button id="accountTitlesNextPage" type="button" class="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
                    </div>
                </div>
            </section>

            <?php $footerSpacingClass = 'mt-8'; require_once __DIR__ . '/../../components/components.php'; ?>
        </main>
    </div>
</body>
</html>

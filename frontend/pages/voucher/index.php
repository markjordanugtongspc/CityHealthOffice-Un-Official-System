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
    <title>Generate Voucher - City Health Office</title>
    <?php vite('backend/js/main.js'); ?>
</head>
<body class="app-shell page-voucher min-h-screen flex flex-col bg-slate-100 print:block print:h-auto print:min-h-0 print:bg-white">
    <?php require_once __DIR__ . '/../../components/page-loader.php'; ?>
    <?php require_once __DIR__ . '/../../components/sidebar.php'; ?>

    <div id="spaContentContainer" class="main-content ml-0 w-full max-w-full lg:w-auto lg:ml-80! lg:group-[.sidebar-collapsed]/body:!ml-[4.5rem] min-h-screen transition-all duration-300 flex-1 flex flex-col overflow-hidden!">
        <header class="sticky top-0 z-40 flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 print:hidden">
            <div class="flex items-center space-x-3">
                <button id="sidebarToggleHeader" type="button" class="relative z-50 lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                    <span class="sr-only">Toggle sidebar</span>
                    <svg id="headerHamburgerIcon" class="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    <svg id="headerCloseIcon" class="w-6 h-6 text-slate-700 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div>
                    <h1 class="text-xl font-bold text-slate-900 text-balance">Generate Disbursement Voucher</h1>
                    <h3 class="text-sm text-slate-600 text-balance">Fill and print DV in one page</h3>
                </div>
            </div>
            <div class="relative">
                <button id="userMenuButton" class="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                    <div class="w-10 h-10 bg-[#224796] rounded-full flex items-center justify-center"><span id="userInitial" class="text-white font-semibold text-sm">...</span></div>
                    <div class="hidden md:block text-left">
                        <p id="userUsername" class="text-sm font-medium text-slate-900">...</p>
                        <p id="userRole" class="text-xs text-slate-500">...</p>
                    </div>
                    <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div id="userDropdown" class="hidden absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-slate-100 py-2 z-50">
                    <a id="profileBtn" href="#" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition">Profile</a>
                    <a id="settingsBtn" href="#" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition">Settings</a>
                    <hr class="my-1 border-slate-100">
                    <a id="changeUserBtn" href="../../../index.php" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition">Change User</a>
                </div>
            </div>
        </header>

        <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
            <?php require_once __DIR__ . '/../../components/generateVoucher.php'; ?>
        </main>
    </div>
</body>
</html>

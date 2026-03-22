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
    <title>Settings - City Health Office</title>
    <?php vite('backend/js/main.js'); ?>
</head>

<body class="app-shell min-h-screen flex flex-col bg-[#f8fafc]">
    <?php require_once __DIR__ . '/../../components/page-loader.php'; ?>
    <?php require_once __DIR__ . '/../../components/sidebar.php'; ?>

    <div id="spaContentContainer"
        class="main-content ml-0 w-full max-w-full lg:w-auto lg:ml-80! lg:group-[.sidebar-collapsed]/body:!ml-[4.5rem] min-h-screen transition-all duration-300 flex-1 flex flex-col overflow-hidden!">
        <header class="flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3">
            <div class="flex items-center space-x-3">
                <button id="sidebarToggleHeader" type="button"
                    class="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                    <span class="sr-only">Toggle sidebar</span>
                    <svg id="headerHamburgerIcon" class="w-6 h-6 text-slate-700" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                    <svg id="headerCloseIcon" class="w-6 h-6 text-slate-700 hidden" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                        </path>
                    </svg>
                </button>
                <div>
                    <h1 class="text-xl font-bold text-slate-900 text-balance">Settings</h1>
                    <h3 class="text-sm text-slate-600 text-balance">Account, data, and app preferences</h3>
                </div>
            </div>

            <div class="relative">
                <button id="userMenuButton"
                    class="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                    <div
                        class="w-10 h-10 bg-linear-to-br from-[#224796] to-[#163473] rounded-full flex items-center justify-center shadow-md">
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

        <main id="pageMain" class="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 md:p-6 lg:p-8 xl:px-10 pb-10 md:pb-12 lg:pb-16 w-full min-w-0 max-w-none">
            <div id="settingsPageRoot" class="w-full min-w-0 max-w-none">
                <?php require_once __DIR__ . '/../../components/settings-content.php'; ?>
            </div>
        </main>
    </div>
</body>

</html>

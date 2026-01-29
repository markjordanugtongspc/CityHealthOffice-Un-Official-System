<?php
require_once __DIR__ . '/../../../config/vite_helper.php';
require_once __DIR__ . '/../../../config/db.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About - City Health Office</title>

    <!-- Vite Assets -->
    <?php vite('backend/js/main.js'); ?>
</head>
<body class="app-shell min-h-screen flex flex-col bg-slate-100">
    <?php require_once __DIR__ . '/../../components/page-loader.php'; ?>
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
                    <h1 class="text-xl font-bold text-slate-900">About</h1>
                    <h3 class="text-sm text-slate-600">Developer information</h3>
                </div>
            </div>
        </header>

        <!-- Content Area (Scrollable) -->
        <main id="pageMain" class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
            <!-- Keep empty for now (Flowbite template will be inserted later) -->
            <div id="aboutPageRoot"></div>
        </main>
    </div>
</body>
</html>


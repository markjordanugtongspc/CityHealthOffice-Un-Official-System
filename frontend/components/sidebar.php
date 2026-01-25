<?php
/**
 * Sidebar Navigation Component
 * 
 * Reusable sidebar component with collapsible functionality
 * Uses Tailwind CSS for responsive design
 * 
 * Usage: require_once __DIR__ . '/../../components/sidebar.php';
 */
?>
<!-- Mobile Backdrop Overlay (visible when sidebar is open on mobile) -->
<div id="mobileBackdrop" class="fixed inset-0 bg-black/60 z-30 opacity-0 invisible transition-all duration-300 ease-in-out pointer-events-none lg:hidden backdrop-blur-sm"></div>

<!-- Sidebar Navigation -->
<aside id="sidebar" class="fixed left-0 top-0 z-50 h-screen w-[75vw] max-w-[320px] lg:w-64 bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out transform -translate-x-full lg:translate-x-0" aria-label="Sidebar">
    <!-- Logo & Brand Section -->
    <div class="p-4 border-b border-white/10 flex flex-col shrink-0">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 overflow-hidden">
                <!-- Logo (shrinks when collapsed) -->
                <div class="sidebar-logo w-12 h-12 lg:w-12 lg:h-12 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-lg shrink-0 transition-all duration-300">
                    <img src="../../images/ch-logo.png" alt="City Health Office Logo" class="w-full h-full object-contain rounded-full transition-all duration-300">
                </div>
                <!-- Brand Text (hidden when collapsed) -->
                <div class="sidebar-text transition-all duration-300 ease-in-out">
                    <h1 class="text-base font-bold text-white whitespace-nowrap leading-tight">City Health Office</h1>
                    <p class="text-xs text-white/80 leading-tight mt-0.5">Health Management</p>
                </div>
            </div>
            
            <!-- Close Button (Mobile - visible when sidebar is open) -->
            <button id="sidebarCloseMobile" class="shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer lg:hidden" title="Close Sidebar">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            
            <!-- Toggle Button (Desktop - visible when expanded) -->
            <button id="sidebarToggleDesktop" class="shrink-0 p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer hidden lg:flex" title="Collapse Sidebar">
                <svg id="sidebarToggleIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-white transition-transform duration-200">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
        </div>

        <!-- Expand Sidebar Button (visible when collapsed, directly below logo - not below separator) -->
        <div id="sidebarToggleCollapsedWrapper" class="w-full flex justify-center items-center transition-all duration-300 ease-in-out hidden mt-3">
            <button id="sidebarToggleCollapsed" class="shrink-0 p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer relative group" title="Expand Sidebar">
                <svg id="sidebarToggleIconCollapsed" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-white transition-transform duration-200">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                <span class="tooltip absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 pointer-events-none transition-opacity duration-200 z-50">Expand Sidebar</span>
            </button>
        </div>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 px-3 py-3 space-y-1 overflow-y-auto overflow-x-hidden lg:overflow-y-auto">
        <ul class="space-y-1">
            <!-- Dashboard -->
            <li>
                <a href="../dashboard/" data-tooltip="Dashboard" class="nav-item nav-link flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all group relative w-full cursor-pointer touch-manipulation">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    <span class="sidebar-text text-sm whitespace-nowrap flex-1 text-left nav-text">Dashboard</span>
                </a>
            </li>

            <!-- YTD Budget Summary (Dropdown) -->
            <li>
                <button type="button" data-tooltip="YTD Budget Summary" class="nav-item nav-dropdown-trigger flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all group relative w-full cursor-pointer touch-manipulation" data-dropdown="budget-dropdown">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <rect x="3" y="7" width="18" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"></rect>
                        <path d="M16 3v4M8 3v4M3 11h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M7 15h.01M12 15h.01M17 15h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                    <span class="sidebar-text text-sm whitespace-nowrap flex-1 text-left nav-text">YTD Budget Summary</span>
                    <svg class="dropdown-arrow sidebar-text w-4 h-4 transition-transform duration-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <!-- Dropdown Content -->
                <div id="budget-dropdown" class="dropdown-content overflow-hidden transition-all duration-300 max-h-0 opacity-0 mt-1">
                    <a href="../budget/" data-tooltip="Actual vs Budget YTD" class="nav-item nav-subitem flex items-center gap-2.5 px-3 py-2 ml-6 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer touch-manipulation">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <span class="sidebar-text text-sm whitespace-nowrap nav-text">Actual vs Budget YTD</span>
                    </a>
                    <a href="../specialfund/" data-tooltip="Special Program Fund" class="nav-item nav-subitem flex items-center gap-2.5 px-3 py-2 ml-6 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer touch-manipulation">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <span class="sidebar-text text-sm whitespace-nowrap nav-text">Special Program Fund</span>
                    </a>
                </div>
            </li>

            <!-- Separator -->
            <li class="nav-separator">
                <div class="border-t border-white/10 my-2 transition-all duration-300"></div>
            </li>

            <!-- Expenses (Dropdown) -->
            <li>
                <button type="button" data-tooltip="Expenses" class="nav-item nav-dropdown-trigger flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all group relative w-full cursor-pointer touch-manipulation" data-dropdown="expenses-dropdown">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <rect x="3" y="7" width="18" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"></rect>
                        <path d="M16 3v4M8 3v4M3 11h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                    <span class="sidebar-text text-sm whitespace-nowrap flex-1 text-left nav-text">Expenses</span>
                    <svg class="dropdown-arrow sidebar-text w-4 h-4 transition-transform duration-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <!-- Dropdown Content -->
                <div id="expenses-dropdown" class="dropdown-content overflow-hidden transition-all duration-300 max-h-0 opacity-0 mt-1">
                    <a href="../monthly-expenses/" data-tooltip="Monthly Expenses Summary" class="nav-item nav-subitem flex items-center gap-2.5 px-3 py-2 ml-6 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer touch-manipulation">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 18V9m4 9V5m4 14v-7m4 7v-3"></path>
                        </svg>
                        <span class="sidebar-text text-sm whitespace-nowrap nav-text">Monthly Expenses Summary</span>
                    </a>
                    <a href="#" data-tooltip="Itemized Expenses" class="nav-item nav-subitem flex items-center gap-2.5 px-3 py-2 ml-6 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer touch-manipulation">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path>
                        </svg>
                        <span class="sidebar-text text-sm whitespace-nowrap nav-text">Itemized Expenses</span>
                    </a>
                </div>
            </li>

            <!-- Export -->
            <li>
                <a href="../export/" data-tooltip="Export" class="nav-item nav-link flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all group relative w-full cursor-pointer touch-manipulation">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    <span class="sidebar-text text-sm whitespace-nowrap flex-1 text-left nav-text">Export</span>
                </a>
            </li>
        </ul>
    </nav>

    <!-- Sidebar Footer (Settings, Logout, Version) -->
    <div class="sidebar-footer-section border-t border-white/10 pt-3 mt-auto shrink-0 px-3 pb-3">
        <ul class="space-y-1">
            <!-- Settings -->
            <li>
                <a href="#" data-tooltip="Settings" class="nav-item nav-link flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all group relative w-full cursor-pointer touch-manipulation">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span class="sidebar-text text-sm whitespace-nowrap flex-1 text-left nav-text">Settings</span>
                </a>
            </li>
            <!-- Logout -->
            <li>
                <a href="../../../index.php" data-tooltip="Logout" class="nav-item nav-link flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-red-600/20 active:bg-red-600/30 transition-all group relative w-full cursor-pointer touch-manipulation">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    <span class="sidebar-text text-sm whitespace-nowrap flex-1 text-left nav-text">Logout</span>
                </a>
            </li>
            <!-- Version -->
            <li>
                <div class="sidebar-version text-xs text-white/50 text-center px-2 py-1.5 transition-all duration-300">
                    <p>Version 1.0.0</p>
                </div>
            </li>
        </ul>
    </div>
</aside>

<!-- SPA Content Marker (required for SPA navigation) -->
<div id="spaContentMarker"></div>

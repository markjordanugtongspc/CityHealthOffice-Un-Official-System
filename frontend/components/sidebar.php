<?php
/**
 * Sidebar Navigation Component
 * 
 * Reusable sidebar component with collapsible functionality
 * Uses Tailwind CSS for responsive design
 * 
 * Usage: require_once __DIR__ . '/../../components/sidebar.php';
 */
require_once __DIR__ . '/../../config/image_helper.php';
?>
<!-- Mobile Backdrop Overlay (visible when sidebar is open on mobile) -->
<div id="mobileBackdrop" aria-hidden="true"
    class="fixed inset-0 bg-black/60 z-[55] opacity-0 invisible transition-opacity duration-300 ease-out pointer-events-none lg:hidden backdrop-blur-sm print:hidden">
</div>

<!-- Sidebar Navigation -->
<aside id="sidebar" aria-hidden="true"
    class="fixed left-0 top-0 z-[60] h-dvh lg:h-screen w-[75vw] max-w-[320px] lg:w-80! lg:group-[.sidebar-collapsed]/body:!w-[4.5rem] bg-linear-to-b from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl flex flex-col shadow-[10px_0_50px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out transform -translate-x-full lg:translate-x-0! print:hidden border-r border-white/5 overflow-x-hidden!"
    aria-label="Sidebar">
    <!-- Logo & Brand Section -->
    <div class="p-4! border-b border-white/10 flex flex-col shrink-0 lg:group-[.sidebar-collapsed]/body:!p-3! overflow-hidden!">
        <div class="flex items-center justify-between lg:group-[.sidebar-collapsed]/body:!flex-col lg:group-[.sidebar-collapsed]/body:!gap-3! lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!w-full! overflow-hidden!">
            <div class="flex items-center gap-3! overflow-hidden! lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!w-full! lg:group-[.sidebar-collapsed]/body:!gap-0! transition-all duration-300">
            <!-- Logo (shrinks when collapsed) -->
                <div class="sidebar-logo w-12 h-12 
                            lg:group-[.sidebar-collapsed]/body:w-9 
                            lg:group-[.sidebar-collapsed]/body:h-9 
                            flex rounded-full bg-white items-center justify-center shadow-lg shrink-0 
                            transition-all duration-300 ml-2">
                <img src="<?php echo htmlspecialchars(getImagePath('frontend/images/ch-logo.png')); ?>"
                    alt="City Health Office Logo"
                    class="w-full h-full object-cover rounded-full transition-all duration-300">
                </div>
                <!-- Brand Text (Transitions smoothly) -->
                <div class="sidebar-text transition-all duration-500 ease-in-out lg:group-[.sidebar-collapsed]/body:!w-0 lg:group-[.sidebar-collapsed]/body:!opacity-0 overflow-hidden!">
                    <div class="pl-3! lg:group-[.sidebar-collapsed]/body:!pl-0!">
                        <h1 class="text-[15px]! font-black text-white whitespace-nowrap leading-tight tracking-tight uppercase">City Health Office</h1>
                        <p class="text-[08px]! font-bold text-white/50 leading-tight mt-1 tracking-widest uppercase">Financial Management System</p>
                    </div>
                </div>
            </div>

            <!-- Toggle Button (Desktop - Always visible for state management) -->
            <button id="sidebarToggleDesktop"
                class="shrink-0 p-1.5 hover:bg-white/10 rounded-lg transition-all cursor-pointer hidden lg:flex lg:group-[.sidebar-collapsed]/body:rotate-180!"
                title="Toggle Sidebar">
                <svg id="sidebarToggleIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="2" stroke="currentColor" class="w-5 h-5 text-white transition-transform duration-200">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>

            <!-- Close Button (Mobile Only) -->
            <button id="sidebarCloseMobile"
                class="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-white"
                aria-label="Close Sidebar">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 min-h-0 px-3! pt-3! pb-4! overflow-y-auto overflow-x-hidden! scrollbar-hide">
        <ul class="flex flex-col gap-0">
            <li>
                <a href="../dashboard/" data-tooltip-target="tooltip-dashboard" data-tooltip-placement="right"
                    class="nav-item nav-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 group relative w-full cursor-pointer touch-manipulation border-b border-transparent hover:border-white/5 lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!px-3 lg:group-[.sidebar-collapsed]/body:!gap-0">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-300 group-hover:scale-110 lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                        </path>
                    </svg>
                    <span class="sidebar-text text-[14px] font-bold whitespace-nowrap flex-1 text-left nav-text tracking-wide group-hover:pl-0.5 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden">Dashboard</span>
                </a>
            </li>

            <!-- Admin (Only for Administrator, CEO, Manager) -->
            <li id="adminNavItem" class="hidden">
                <a href="../admin/" data-tooltip-target="tooltip-admin" data-tooltip-placement="right"
                    class="nav-item nav-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 group relative w-full cursor-pointer touch-manipulation border-b border-transparent hover:border-white/5 lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!px-3 lg:group-[.sidebar-collapsed]/body:!gap-0">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-300 group-hover:scale-110 lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z">
                        </path>
                    </svg>
                    <span class="sidebar-text text-[14px] font-bold whitespace-nowrap flex-1 text-left nav-text tracking-wide group-hover:pl-0.5 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden">Admin</span>
                </a>
            </li>

            <!-- Annual Budget Summary (Dropdown) -->
            <li>
                <button type="button" data-tooltip-target="tooltip-budget-summary" data-tooltip-placement="right"
                    class="nav-item nav-dropdown-trigger flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 group relative w-full cursor-pointer touch-manipulation border border-transparent hover:border-white/5 lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!px-0! lg:group-[.sidebar-collapsed]/body:!w-10! lg:group-[.sidebar-collapsed]/body:!h-10! lg:group-[.sidebar-collapsed]/body:!mx-auto!"
                    data-dropdown="budget-dropdown">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <rect x="3" y="7" width="18" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"
                            fill="none"></rect>
                        <path d="M16 3v4M8 3v4M3 11h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round"></path>
                        <path d="M7 15h.01M12 15h.01M17 15h.01" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                    <span class="sidebar-text text-[14px] font-bold whitespace-nowrap flex-1 text-left nav-text tracking-wide group-hover:pl-0.5 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden">Annual Budget Summary</span>
                    <svg class="dropdown-arrow sidebar-text w-4 h-4 transition-transform duration-300 shrink-0 opacity-60 group-hover:opacity-100 lg:group-[.sidebar-collapsed]/body:!hidden"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <!-- Dropdown Content -->
                <div id="budget-dropdown"
                    class="dropdown-content overflow-hidden transition-all duration-300 max-h-0 opacity-0 mt-1 space-y-1 lg:group-[.sidebar-collapsed]/body:!flex lg:group-[.sidebar-collapsed]/body:!flex-col lg:group-[.sidebar-collapsed]/body:!gap-1 lg:group-[.sidebar-collapsed]/body:![max-height:none] lg:group-[.sidebar-collapsed]/body:!opacity-100 lg:group-[.sidebar-collapsed]/body:!mt-0 lg:group-[.sidebar-collapsed]/body:!ml-0 lg:group-[.sidebar-collapsed]/body:!p-0 lg:group-[.sidebar-collapsed]/body:!overflow-visible">
                    <a href="../budget/" data-tooltip-target="tooltip-budget-ytd" data-tooltip-placement="right"
                        class="nav-item nav-subitem flex items-center gap-3 px-4 py-2 ml-10 rounded-lg text-white/50 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200 cursor-pointer touch-manipulation group/sub relative lg:group-[.sidebar-collapsed]/body:!flex lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!items-center lg:group-[.sidebar-collapsed]/body:!p-2.5 lg:group-[.sidebar-collapsed]/body:!m-1 lg:group-[.sidebar-collapsed]/body:!w-10 lg:group-[.sidebar-collapsed]/body:!h-10 lg:group-[.sidebar-collapsed]/body:!rounded-lg lg:group-[.sidebar-collapsed]/body:!mx-auto lg:group-[.sidebar-collapsed]/body:!min-w-[2.5rem]">
                        <svg class="w-4 h-4 shrink-0 transition-transform duration-300 group-hover/sub:scale-110 group-hover/sub:text-white group-[.nav-item-active]/sub:text-emerald-400 lg:group-[.sidebar-collapsed]/body:!w-5 lg:group-[.sidebar-collapsed]/body:!h-5 lg:group-[.sidebar-collapsed]/body:!m-0 hidden lg:group-[.sidebar-collapsed]/body:!block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <div class="absolute left-0 w-1.5 h-1.5 rounded-full bg-white/20 group-hover/sub:bg-white/50 group-[.nav-item-active]/sub:bg-emerald-400 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden"></div>
                        <span class="sidebar-text text-sm font-medium whitespace-nowrap nav-text tracking-wide lg:group-[.sidebar-collapsed]/body:!hidden">Actual vs Budget YTD</span>
                    </a>
                    <a href="../specialfund/" data-tooltip-target="tooltip-budget-special" data-tooltip-placement="right"
                        class="nav-item nav-subitem flex items-center gap-3 px-4 py-2 ml-10 rounded-lg text-white/50 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200 cursor-pointer touch-manipulation group/sub relative lg:group-[.sidebar-collapsed]/body:!flex lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!items-center lg:group-[.sidebar-collapsed]/body:!p-2.5 lg:group-[.sidebar-collapsed]/body:!m-1 lg:group-[.sidebar-collapsed]/body:!w-10 lg:group-[.sidebar-collapsed]/body:!h-10 lg:group-[.sidebar-collapsed]/body:!rounded-lg lg:group-[.sidebar-collapsed]/body:!mx-auto lg:group-[.sidebar-collapsed]/body:!min-w-[2.5rem]">
                        <svg class="w-4 h-4 shrink-0 transition-transform duration-300 group-hover/sub:scale-110 group-hover/sub:text-white group-[.nav-item-active]/sub:text-emerald-400 lg:group-[.sidebar-collapsed]/body:!w-5 lg:group-[.sidebar-collapsed]/body:!h-5 lg:group-[.sidebar-collapsed]/body:!m-0 hidden lg:group-[.sidebar-collapsed]/body:!block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <div class="absolute left-0 w-1.5 h-1.5 rounded-full bg-white/20 group-hover/sub:bg-white/50 group-[.nav-item-active]/sub:bg-emerald-400 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden"></div>
                        <span class="sidebar-text text-sm font-medium whitespace-nowrap nav-text tracking-wide lg:group-[.sidebar-collapsed]/body:!hidden">Special Program Fund</span>
                    </a>
                </div>
            </li>

            <!-- Separator -->
            <li class="nav-separator lg:group-[.sidebar-collapsed]/body:!block lg:group-[.sidebar-collapsed]/body:!mx-auto lg:group-[.sidebar-collapsed]/body:!w-8">
                <div class="border-t border-white/10 my-1 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:![border-color:rgba(255,255,255,0.1)] lg:group-[.sidebar-collapsed]/body:!my-2 lg:group-[.sidebar-collapsed]/body:!w-8"></div>
            </li>

            <!-- Expenses (Dropdown) -->
            <li>
                <button type="button" data-tooltip-target="tooltip-expenses" data-tooltip-placement="right"
                    class="nav-item nav-dropdown-trigger flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 group relative w-full cursor-pointer touch-manipulation border border-transparent hover:border-white/5 lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!px-0! lg:group-[.sidebar-collapsed]/body:!w-10! lg:group-[.sidebar-collapsed]/body:!h-10! lg:group-[.sidebar-collapsed]/body:!mx-auto!"
                    data-dropdown="expenses-dropdown">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <rect x="3" y="7" width="18" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"
                            fill="none"></rect>
                        <path d="M16 3v4M8 3v4M3 11h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round"></path>
                    </svg>
                    <span class="sidebar-text text-[14px] font-bold whitespace-nowrap flex-1 text-left nav-text tracking-wide group-hover:pl-0.5 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden">Expenses</span>
                    <svg class="dropdown-arrow sidebar-text w-4 h-4 transition-transform duration-300 shrink-0 opacity-60 group-hover:opacity-100 lg:group-[.sidebar-collapsed]/body:!hidden"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <!-- Dropdown Content -->
                <div id="expenses-dropdown"
                    class="dropdown-content overflow-hidden transition-all duration-300 max-h-0 opacity-0 mt-1 space-y-1 lg:group-[.sidebar-collapsed]/body:!flex lg:group-[.sidebar-collapsed]/body:!flex-col lg:group-[.sidebar-collapsed]/body:!gap-1 lg:group-[.sidebar-collapsed]/body:![max-height:none] lg:group-[.sidebar-collapsed]/body:!opacity-100 lg:group-[.sidebar-collapsed]/body:!mt-0 lg:group-[.sidebar-collapsed]/body:!ml-0 lg:group-[.sidebar-collapsed]/body:!p-0 lg:group-[.sidebar-collapsed]/body:!overflow-visible">
                    <a href="../monthly-expenses/" data-tooltip-target="tooltip-expenses-monthly" data-tooltip-placement="right"
                        class="nav-item nav-subitem flex items-center gap-3 px-4 py-2 ml-10 rounded-lg text-white/50 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200 cursor-pointer touch-manipulation group/sub relative lg:group-[.sidebar-collapsed]/body:!flex lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!items-center lg:group-[.sidebar-collapsed]/body:!p-2.5 lg:group-[.sidebar-collapsed]/body:!m-1 lg:group-[.sidebar-collapsed]/body:!w-10 lg:group-[.sidebar-collapsed]/body:!h-10 lg:group-[.sidebar-collapsed]/body:!rounded-lg lg:group-[.sidebar-collapsed]/body:!mx-auto lg:group-[.sidebar-collapsed]/body:!min-w-[2.5rem]">
                        <svg class="w-4 h-4 shrink-0 transition-transform duration-300 group-hover/sub:scale-110 group-hover/sub:text-white group-[.nav-item-active]/sub:text-emerald-400 lg:group-[.sidebar-collapsed]/body:!w-5 lg:group-[.sidebar-collapsed]/body:!h-5 lg:group-[.sidebar-collapsed]/body:!m-0 hidden lg:group-[.sidebar-collapsed]/body:!block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 18V9m4 9V5m4 14v-7m4 7v-3"></path>
                        </svg>
                        <div class="absolute left-0 w-1.5 h-1.5 rounded-full bg-white/20 group-hover/sub:bg-white/50 group-[.nav-item-active]/sub:bg-emerald-400 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden"></div>
                        <span class="sidebar-text text-sm font-medium whitespace-nowrap nav-text tracking-wide lg:group-[.sidebar-collapsed]/body:!hidden">Monthly Expenses Summary</span>
                    </a>
                    <a href="../itemized/" data-tooltip-target="tooltip-expenses-itemized" data-tooltip-placement="right"
                        class="nav-item nav-subitem flex items-center gap-3 px-4 py-2 ml-10 rounded-lg text-white/50 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200 cursor-pointer touch-manipulation group/sub relative lg:group-[.sidebar-collapsed]/body:!flex lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!items-center lg:group-[.sidebar-collapsed]/body:!p-2.5 lg:group-[.sidebar-collapsed]/body:!m-1 lg:group-[.sidebar-collapsed]/body:!w-10 lg:group-[.sidebar-collapsed]/body:!h-10 lg:group-[.sidebar-collapsed]/body:!rounded-lg lg:group-[.sidebar-collapsed]/body:!mx-auto lg:group-[.sidebar-collapsed]/body:!min-w-[2.5rem]">
                        <svg class="w-4 h-4 shrink-0 transition-transform duration-300 group-hover/sub:scale-110 group-hover/sub:text-white group-[.nav-item-active]/sub:text-emerald-400 lg:group-[.sidebar-collapsed]/body:!w-5 lg:group-[.sidebar-collapsed]/body:!h-5 lg:group-[.sidebar-collapsed]/body:!m-0 hidden lg:group-[.sidebar-collapsed]/body:!block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path>
                        </svg>
                        <div class="absolute left-0 w-1.5 h-1.5 rounded-full bg-white/20 group-hover/sub:bg-white/50 group-[.nav-item-active]/sub:bg-emerald-400 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden"></div>
                        <span class="sidebar-text text-sm font-medium whitespace-nowrap nav-text tracking-wide lg:group-[.sidebar-collapsed]/body:!hidden">Itemized Daily Transactions</span>
                    </a>
                    <a href="../specialfund/" data-tooltip-target="tooltip-expenses-special" data-tooltip-placement="right"
                        class="nav-item nav-subitem flex items-center gap-3 px-4 py-2 ml-10 rounded-lg text-white/50 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200 cursor-pointer touch-manipulation group/sub relative lg:group-[.sidebar-collapsed]/body:!flex lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!items-center lg:group-[.sidebar-collapsed]/body:!p-2.5 lg:group-[.sidebar-collapsed]/body:!m-1 lg:group-[.sidebar-collapsed]/body:!w-10 lg:group-[.sidebar-collapsed]/body:!h-10 lg:group-[.sidebar-collapsed]/body:!rounded-lg lg:group-[.sidebar-collapsed]/body:!mx-auto lg:group-[.sidebar-collapsed]/body:!min-w-[2.5rem]">
                        <svg class="w-4 h-4 shrink-0 transition-transform duration-300 group-hover/sub:scale-110 group-hover/sub:text-white group-[.nav-item-active]/sub:text-emerald-400 lg:group-[.sidebar-collapsed]/body:!w-5 lg:group-[.sidebar-collapsed]/body:!h-5 lg:group-[.sidebar-collapsed]/body:!m-0 hidden lg:group-[.sidebar-collapsed]/body:!block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                        <div class="absolute left-0 w-1.5 h-1.5 rounded-full bg-white/20 group-hover/sub:bg-white/50 group-[.nav-item-active]/sub:bg-emerald-400 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden"></div>
                        <span class="sidebar-text text-sm font-medium whitespace-nowrap nav-text tracking-wide lg:group-[.sidebar-collapsed]/body:!hidden">Special Program</span>
                    </a>
                </div>
            </li>

            <!-- Export -->
            <li>
                <a href="../export/" data-tooltip-target="tooltip-export" data-tooltip-placement="right"
                    class="nav-item nav-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 group relative w-full cursor-pointer touch-manipulation border-b border-transparent hover:border-white/5 lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!px-3 lg:group-[.sidebar-collapsed]/body:!gap-0">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-300 group-hover:scale-110 lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z">
                        </path>
                    </svg>
                    <span class="sidebar-text text-[14px] font-bold whitespace-nowrap flex-1 text-left nav-text tracking-wide group-hover:pl-0.5 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden">Export</span>
                </a>
            </li>
        </ul>
    </nav>

    <!-- Sidebar Footer (Settings, Logout, Version) -->
    <div
        class="sidebar-footer-section border-t border-white/10 pt-3 mt-auto shrink-0 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <ul class="space-y-1">
            <!-- Settings -->
            <li>
                <a href="#" data-tooltip-target="tooltip-settings" data-tooltip-placement="right"
                    class="nav-item nav-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all duration-300 group relative w-full cursor-pointer touch-manipulation border border-transparent hover:border-white/5 lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!px-3 lg:group-[.sidebar-collapsed]/body:!gap-0">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-300 group-hover:scale-110 lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                        </path>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span class="sidebar-text text-sm font-semibold whitespace-nowrap flex-1 text-left nav-text tracking-wide group-hover:pl-0.5 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden">Settings</span>
                </a>
            </li>
            <!-- About -->
            <li>
                <a href="../about/" data-tooltip-target="tooltip-about" data-tooltip-placement="right"
                    class="nav-item nav-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all duration-300 group relative w-full cursor-pointer touch-manipulation border-b border-transparent hover:border-white/5 lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!px-3 lg:group-[.sidebar-collapsed]/body:!gap-0">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-300 group-hover:scale-110 lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 13V7m0 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
                    </svg>
                    <span class="sidebar-text text-sm font-semibold whitespace-nowrap flex-1 text-left nav-text tracking-wide group-hover:pl-0.5 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden">About</span>
                </a>
            </li>
            <!-- Logout -->
            <li>
                <a href="../../../" data-tooltip-target="tooltip-logout" data-tooltip-placement="right"
                    class="nav-item nav-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/90 hover:text-white hover:bg-red-600/10 active:bg-red-600/20 transition-all duration-300 group relative w-full cursor-pointer touch-manipulation border border-transparent hover:border-red-600/10 lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!px-3 lg:group-[.sidebar-collapsed]/body:!gap-0">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                        </path>
                    </svg>
                    <span class="sidebar-text text-sm font-medium whitespace-nowrap flex-1 text-left nav-text tracking-wide group-hover:pl-0.5 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden">Logout</span>
                </a>
            </li>
            <!-- Version -->
            <li>
                <div class="sidebar-version text-xs text-white/50 text-center px-2 py-1.5 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden">
                    <p>Version 1.0.7</p>
                </div>
            </li>
        </ul>
    </div>
</aside>

<!-- Flowbite Tooltips (Visible only in collapsed state) -->
<div id="tooltip-dashboard" role="tooltip" class="absolute z-[100] invisible inline-block px-3 py-2 text-xs font-bold text-white transition-opacity duration-300 bg-slate-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 lg:group-[:not(.sidebar-collapsed)]/body:!hidden tracking-widest uppercase border border-white/20 backdrop-blur-md">
    Dashboard
    <div class="tooltip-arrow" data-popper-arrow></div>
</div>

<div id="tooltip-admin" role="tooltip" class="absolute z-[100] invisible inline-block px-3 py-2 text-xs font-bold text-white transition-opacity duration-300 bg-slate-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 lg:group-[:not(.sidebar-collapsed)]/body:!hidden tracking-widest uppercase border border-white/20 backdrop-blur-md">
    Admin
    <div class="tooltip-arrow" data-popper-arrow></div>
</div>

<div id="tooltip-budget-summary" role="tooltip" class="absolute z-[100] invisible inline-block px-3 py-2 text-xs font-bold text-white transition-opacity duration-300 bg-slate-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 lg:group-[:not(.sidebar-collapsed)]/body:!hidden tracking-widest uppercase border border-white/20 backdrop-blur-md">
    Budget Summary
    <div class="tooltip-arrow" data-popper-arrow></div>
</div>

<div id="tooltip-budget-ytd" role="tooltip" class="absolute z-[100] invisible inline-block px-3 py-2 text-xs font-bold text-white transition-opacity duration-300 bg-slate-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 lg:group-[:not(.sidebar-collapsed)]/body:!hidden tracking-widest uppercase border border-white/20 backdrop-blur-md">
    Actual vs Budget YTD
    <div class="tooltip-arrow" data-popper-arrow></div>
</div>

<div id="tooltip-budget-special" role="tooltip" class="absolute z-[100] invisible inline-block px-3 py-2 text-xs font-bold text-white transition-opacity duration-300 bg-slate-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 lg:group-[:not(.sidebar-collapsed)]/body:!hidden tracking-widest uppercase border border-white/20 backdrop-blur-md">
    Special Program Fund
    <div class="tooltip-arrow" data-popper-arrow></div>
</div>

<div id="tooltip-expenses" role="tooltip" class="absolute z-[100] invisible inline-block px-3 py-2 text-xs font-bold text-white transition-opacity duration-300 bg-slate-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 lg:group-[:not(.sidebar-collapsed)]/body:!hidden tracking-widest uppercase border border-white/20 backdrop-blur-md">
    Expenses
    <div class="tooltip-arrow" data-popper-arrow></div>
</div>

<div id="tooltip-expenses-monthly" role="tooltip" class="absolute z-[100] invisible inline-block px-3 py-2 text-xs font-bold text-white transition-opacity duration-300 bg-slate-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 lg:group-[:not(.sidebar-collapsed)]/body:!hidden tracking-widest uppercase border border-white/20 backdrop-blur-md">
    Monthly Expenses
    <div class="tooltip-arrow" data-popper-arrow></div>
</div>

<div id="tooltip-expenses-itemized" role="tooltip" class="absolute z-[100] invisible inline-block px-3 py-2 text-xs font-bold text-white transition-opacity duration-300 bg-slate-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 lg:group-[:not(.sidebar-collapsed)]/body:!hidden tracking-widest uppercase border border-white/20 backdrop-blur-md">
    Itemized Daily Transactions
    <div class="tooltip-arrow" data-popper-arrow></div>
</div>

<div id="tooltip-expenses-special" role="tooltip" class="absolute z-[100] invisible inline-block px-3 py-2 text-xs font-bold text-white transition-opacity duration-300 bg-slate-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 lg:group-[:not(.sidebar-collapsed)]/body:!hidden tracking-widest uppercase border border-white/20 backdrop-blur-md">
    Special Program
    <div class="tooltip-arrow" data-popper-arrow></div>
</div>

<div id="tooltip-export" role="tooltip" class="absolute z-[100] invisible inline-block px-3 py-2 text-xs font-bold text-white transition-opacity duration-300 bg-slate-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 lg:group-[:not(.sidebar-collapsed)]/body:!hidden tracking-widest uppercase border border-white/20 backdrop-blur-md">
    Export
    <div class="tooltip-arrow" data-popper-arrow></div>
</div>

<div id="tooltip-settings" role="tooltip" class="absolute z-[100] invisible inline-block px-3 py-2 text-xs font-bold text-white transition-opacity duration-300 bg-slate-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 lg:group-[:not(.sidebar-collapsed)]/body:!hidden tracking-widest uppercase border border-white/20 backdrop-blur-md">
    Settings
    <div class="tooltip-arrow" data-popper-arrow></div>
</div>

<div id="tooltip-about" role="tooltip" class="absolute z-[100] invisible inline-block px-3 py-2 text-xs font-bold text-white transition-opacity duration-300 bg-slate-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 lg:group-[:not(.sidebar-collapsed)]/body:!hidden tracking-widest uppercase border border-white/20 backdrop-blur-md">
    About
    <div class="tooltip-arrow" data-popper-arrow></div>
</div>

<div id="tooltip-logout" role="tooltip" class="absolute z-[100] invisible inline-block px-3 py-2 text-xs font-bold text-white transition-opacity duration-300 bg-slate-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 lg:group-[:not(.sidebar-collapsed)]/body:!hidden tracking-widest uppercase border border-white/20 backdrop-blur-md">
    Logout
    <div class="tooltip-arrow" data-popper-arrow></div>
</div>

<!-- SPA Content Marker (required for SPA navigation) -->
<div id="spaContentMarker"></div>
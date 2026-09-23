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
    class="fixed left-0 top-0 z-[60] h-dvh lg:h-screen w-[75vw] max-w-[320px] lg:w-80! lg:group-[.sidebar-collapsed]/body:!w-[4.5rem] bg-linear-to-b from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl flex flex-col shadow-[10px_0_50px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out transform -translate-x-full lg:translate-x-0! print:hidden border-r border-white/5 overflow-visible!"
    aria-label="Sidebar">
    <!-- Logo & Brand Section -->
    <div class="p-4! border-b border-white/10 flex flex-col shrink-0 lg:group-[.sidebar-collapsed]/body:!p-3! overflow-visible!">
        <div class="flex items-center justify-between lg:group-[.sidebar-collapsed]/body:!flex-col lg:group-[.sidebar-collapsed]/body:!gap-3! lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!w-full! overflow-visible!">
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
            <button id="sidebarToggleDesktop" type="button"
                class="group absolute cursor-pointer -right-3.5 top-3.5 z-[70] hidden h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-slate-800/95 text-gray-400 shadow-md transition-all hover:bg-slate-700 hover:text-white hover:scale-105 active:scale-95 lg:flex"
                title="Toggle Sidebar" aria-label="Toggle Sidebar" aria-expanded="true">
                <!-- Expanded State: Static (Collapse action) -->
                <svg class="toggle-icon toggle-expanded-static h-5 w-5 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.99994 10 7 11.9999l1.99994 2M12 5v14M5 4h14c.5523 0 1 .44772 1 1v14c0 .5523-.4477 1-1 1H5c-.55228 0-1-.4477-1-1V5c0-.55228.44772-1 1-1Z"/>
                </svg>
                <!-- Expanded State: Hover / Active (Collapse action) -->
                <svg class="toggle-icon toggle-expanded-active h-5 w-5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 21h6c1.1046 0 2-.8954 2-2V5c0-1.10457-.8954-2-2-2h-6v18Z"/>
                    <path fill-rule="evenodd" d="M11 3H5c-1.10457 0-2 .89543-2 2v14c0 1.1046.89543 2 2 2h6V3Zm-2.29295 7.7071c.39052-.3905.39052-1.02368 0-1.41421-.39053-.39052-1.02369-.39052-1.41421 0L5.29289 11.2928c-.39052.3906-.39052 1.0237 0 1.4142l1.99995 2c.39052.3905 1.02368 0 1.41421 0 .39052-.3905.39052-1.0237 0-1.4142l-1.29284-1.2929 1.29284-1.2928Z" clip-rule="evenodd"/>
                </svg>
                <!-- Collapsed State: Static (Expand action) -->
                <svg class="toggle-icon toggle-collapsed-static h-5 w-5 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7 10 1.99994 1.9999-1.99994 2M12 5v14M5 4h14c.5523 0 1 .44772 1 1v14c0 .5523-.4477 1-1 1H5c-.55228 0-1-.44772-1-1V5c0-.55228.44772-1 1-1Z"/>
                </svg>
                <!-- Collapsed State: Hover / Active (Expand action) -->
                <svg class="toggle-icon toggle-collapsed-active h-5 w-5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 21h6c1.1046 0 2-.8954 2-2V5c0-1.10457-.8954-2-2-2h-6v18Z"/>
                    <path fill-rule="evenodd" d="M11 3H5c-1.10457 0-2 .89543-2 2v14c0 1.1046.89543 2 2 2h6V3Zm-5.70711 7.7071c-.39052-.3905-.39052-1.02368 0-1.41421.39053-.39052 1.02369-.39052 1.41422 0l1.99994 1.99991c.39052.3906.39052 1.0237 0 1.4142l-1.99994 2c-.39053.3905-1.02369.3905-1.41422 0-.39052-.3905-.39052-1.0237 0-1.4142l1.29284-1.2929-1.29284-1.2928Z" clip-rule="evenodd"/>
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
                    <svg class="w-5 h-5 shrink-0 transition-all duration-300 group-hover:hidden group-active:hidden group-[.nav-item-active]:hidden lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6.025A7.5 7.5 0 1 0 17.975 14H10V6.025Z"/>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 3c-.169 0-.334.014-.5.025V11h7.975c.011-.166.025-.331.025-.5A7.5 7.5 0 0 0 13.5 3Z"/>
                    </svg>
                    <svg class="hidden w-5 h-5 shrink-0 transition-all duration-300 group-hover:block group-active:block group-[.nav-item-active]:block lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13.5 2c-.178 0-.356.013-.492.022l-.074.005a1 1 0 0 0-.934.998V11a1 1 0 0 0 1 1h7.975a1 1 0 0 0 .998-.934l.005-.074A7.04 7.04 0 0 0 22 10.5 8.5 8.5 0 0 0 13.5 2Z"/>
                        <path d="M11 6.025a1 1 0 0 0-1.065-.998 8.5 8.5 0 1 0 9.038 9.039A1 1 0 0 0 17.975 13H11V6.025Z"/>
                    </svg>
                    <span class="sidebar-text text-[14px] font-bold whitespace-nowrap flex-1 text-left nav-text tracking-wide group-hover:pl-0.5 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden">Dashboard</span>
                </a>
            </li>

            <!-- Admin (Only for Administrator, CEO, Manager) -->
            <li id="adminNavItem" class="hidden">
                <a href="../admin/" data-tooltip-target="tooltip-admin" data-tooltip-placement="right"
                    class="nav-item nav-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 group relative w-full cursor-pointer touch-manipulation border-b border-transparent hover:border-white/5 lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!px-3 lg:group-[.sidebar-collapsed]/body:!gap-0">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-300 group-hover:hidden group-active:hidden group-[.nav-item-active]:hidden lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M18.063 16.563q.437-.438.437-1.063t-.437-1.062T17 14t-1.062.438T15.5 15.5t.438 1.063T17 17t1.063-.437M17 20q.775 0 1.425-.363t1.05-.962q-.55-.325-1.175-.5T17 18t-1.3.175t-1.175.5q.4.6 1.05.963T17 20m-5 2q-3.475-.875-5.738-3.988T4 11.1V5l8-3l8 3v5.675q-.475-.2-.975-.363T18 10.076V6.4l-6-2.25L6 6.4v4.7q0 1.175.313 2.35t.875 2.238T8.55 17.65t1.775 1.5q.275.8.725 1.525t1.025 1.3q-.025 0-.037.013T12 22m5 0q-2.075 0-3.537-1.463T12 17t1.463-3.537T17 12t3.538 1.463T22 17t-1.463 3.538T17 22m-5-10.35"/>
                    </svg>
                    <svg class="hidden w-5 h-5 shrink-0 transition-all duration-300 group-hover:block group-active:block group-[.nav-item-active]:block lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M17 11c.34 0 .67.04 1 .09V6.27L10.5 3L3 6.27v4.91c0 4.54 3.2 8.79 7.5 9.82c.55-.13 1.08-.32 1.6-.55c-.69-.98-1.1-2.17-1.1-3.45c0-3.31 2.69-6 6-6"/>
                        <path fill="currentColor" d="M17 13c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4s-1.79-4-4-4m0 1.38c.62 0 1.12.51 1.12 1.12s-.51 1.12-1.12 1.12s-1.12-.51-1.12-1.12s.5-1.12 1.12-1.12m0 5.37c-.93 0-1.74-.46-2.24-1.17c.05-.72 1.51-1.08 2.24-1.08s2.19.36 2.24 1.08c-.5.71-1.31 1.17-2.24 1.17"/>
                    </svg>
                    <span class="sidebar-text text-[14px] font-bold whitespace-nowrap flex-1 text-left nav-text tracking-wide group-hover:pl-0.5 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden">User Management</span>
                </a>
            </li>

            <!-- Annual Budget Summary (Dropdown) -->
            <li>
                <button id="dropdownBudgetSummaryButton" type="button"
                    data-dropdown="budget-dropdown"
                    data-tooltip-target="tooltip-budget-summary"
                    data-tooltip-placement="right"
                    class="nav-item nav-dropdown-trigger active flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 group relative w-full cursor-pointer touch-manipulation border border-transparent hover:border-white/5 lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!px-0! lg:group-[.sidebar-collapsed]/body:!w-10! lg:group-[.sidebar-collapsed]/body:!h-10! lg:group-[.sidebar-collapsed]/body:!mx-auto!"
                    aria-expanded="true">
                    <img src="<?php echo htmlspecialchars(getImagePath('frontend/images/annual.svg')); ?>" alt="" aria-hidden="true"
                        class="w-4.5 h-4.5 shrink-0 transition-all duration-300 group-hover:hidden group-active:hidden group-[.nav-item-active]:hidden lg:group-[.sidebar-collapsed]/body:!m-0">
                    <img src="<?php echo htmlspecialchars(getImagePath('frontend/images/annual1.svg')); ?>" alt="" aria-hidden="true"
                        class="hidden w-4.5 h-4.5 shrink-0 transition-all duration-300 group-hover:block group-active:block group-[.nav-item-active]:block lg:group-[.sidebar-collapsed]/body:!m-0">
                    <span class="sidebar-text text-[14px] font-bold whitespace-nowrap flex-1 text-left nav-text tracking-wide group-hover:pl-0.5 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden">Annual Budget Summary</span>
                    <svg class="dropdown-arrow sidebar-text w-4 h-4 transition-transform duration-300 shrink-0 opacity-60 group-hover:opacity-100 lg:group-[.sidebar-collapsed]/body:!hidden"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <!-- Dropdown Content -->
                <div id="budget-dropdown"
                    class="dropdown-content show overflow-hidden transition-all duration-300 mt-1 space-y-1 lg:group-[.sidebar-collapsed]/body:!hidden">
                    <a href="../budget/" data-tooltip-target="tooltip-budget-ytd" data-tooltip-placement="right"
                        class="nav-item nav-subitem flex items-center gap-3 px-4 py-2 ml-8 rounded-lg text-white/50 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200 cursor-pointer touch-manipulation group/sub relative">
                        <svg class="w-4 h-4 shrink-0 transition-transform duration-300 group-hover/sub:scale-110 group-hover/sub:text-white group-[.nav-item-active]/sub:text-emerald-400 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <span class="sidebar-text text-sm font-medium whitespace-nowrap nav-text tracking-wide">Actual vs Budget YTD</span>
                    </a>
                    <a href="../specialfund/" data-tooltip-target="tooltip-budget-special" data-tooltip-placement="right"
                        class="nav-item nav-subitem flex items-center gap-3 px-4 py-2 ml-8 rounded-lg text-white/50 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200 cursor-pointer touch-manipulation group/sub relative">
                        <svg class="w-4 h-4 shrink-0 transition-transform duration-300 group-hover/sub:scale-110 group-hover/sub:text-white group-[.nav-item-active]/sub:text-emerald-400 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <span class="sidebar-text text-sm font-medium whitespace-nowrap nav-text tracking-wide">Special Program Fund</span>
                    </a>
                </div>
            </li>

            <!-- Separator -->
            <li class="nav-separator lg:group-[.sidebar-collapsed]/body:!hidden lg:group-[.sidebar-collapsed]/body:!mx-auto lg:group-[.sidebar-collapsed]/body:!w-8">
                <div class="border-t border-white/10 my-1 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:![border-color:rgba(255,255,255,0.1)] lg:group-[.sidebar-collapsed]/body:!my-2 lg:group-[.sidebar-collapsed]/body:!w-8"></div>
            </li>

            <!-- Expenses (Dropdown) -->
            <li>
                <button id="dropdownExpensesButton" type="button"
                    data-dropdown="expenses-dropdown"
                    data-tooltip-target="tooltip-expenses"
                    data-tooltip-placement="right"
                    class="nav-item nav-dropdown-trigger flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 group relative w-full cursor-pointer touch-manipulation border border-transparent hover:border-white/5 lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!px-0! lg:group-[.sidebar-collapsed]/body:!w-10! lg:group-[.sidebar-collapsed]/body:!h-10! lg:group-[.sidebar-collapsed]/body:!mx-auto!"
                    aria-expanded="false">
                    <img src="<?php echo htmlspecialchars(getImagePath('frontend/images/cost.svg')); ?>" alt="" aria-hidden="true"
                        class="w-5 h-5 shrink-0 transition-all duration-300 group-hover:hidden group-active:hidden group-[.nav-item-active]:hidden lg:group-[.sidebar-collapsed]/body:!m-0">
                    <img src="<?php echo htmlspecialchars(getImagePath('frontend/images/cost1.svg')); ?>" alt="" aria-hidden="true"
                        class="hidden w-5 h-5 shrink-0 transition-all duration-300 group-hover:block group-active:block group-[.nav-item-active]:block lg:group-[.sidebar-collapsed]/body:!m-0">
                    <span class="sidebar-text text-[14px] font-bold whitespace-nowrap flex-1 text-left nav-text tracking-wide group-hover:pl-0.5 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden">Expenses</span>
                    <svg class="dropdown-arrow sidebar-text w-4 h-4 transition-transform duration-300 shrink-0 opacity-60 group-hover:opacity-100 lg:group-[.sidebar-collapsed]/body:!hidden"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <!-- Dropdown Content -->
                <div id="expenses-dropdown"
                    class="dropdown-content overflow-hidden transition-all duration-300 mt-1 space-y-1 lg:group-[.sidebar-collapsed]/body:!hidden">
                    <a href="../monthly-expenses/" data-tooltip-target="tooltip-expenses-monthly" data-tooltip-placement="right"
                        class="nav-item nav-subitem flex items-center gap-3 px-4 py-2 ml-8 rounded-lg text-white/50 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200 cursor-pointer touch-manipulation group/sub relative">
                        <svg class="w-4 h-4 shrink-0 transition-transform duration-300 group-hover/sub:scale-110 group-hover/sub:text-white group-[.nav-item-active]/sub:text-emerald-400 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 18V9m4 9V5m4 14v-7m4 7v-3"></path>
                        </svg>
                        <span class="sidebar-text text-sm font-medium whitespace-nowrap nav-text tracking-wide">Monthly Expenses Summary</span>
                    </a>
                    <a href="../itemized/" data-tooltip-target="tooltip-expenses-itemized" data-tooltip-placement="right"
                        class="nav-item nav-subitem flex items-center gap-3 px-4 py-2 ml-8 rounded-lg text-white/50 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200 cursor-pointer touch-manipulation group/sub relative">
                        <svg class="w-4 h-4 shrink-0 transition-transform duration-300 group-hover/sub:scale-110 group-hover/sub:text-white group-[.nav-item-active]/sub:text-emerald-400 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path>
                        </svg>
                        <span class="sidebar-text text-sm font-medium whitespace-nowrap nav-text tracking-wide">Itemized Daily Transactions</span>
                    </a>
                    <a href="../specialfund/" data-tooltip-target="tooltip-expenses-special" data-tooltip-placement="right"
                        class="nav-item nav-subitem flex items-center gap-3 px-4 py-2 ml-8 rounded-lg text-white/50 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200 cursor-pointer touch-manipulation group/sub relative">
                        <svg class="w-4 h-4 shrink-0 transition-transform duration-300 group-hover/sub:scale-110 group-hover/sub:text-white group-[.nav-item-active]/sub:text-emerald-400 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                        <span class="sidebar-text text-sm font-medium whitespace-nowrap nav-text tracking-wide">Special Program</span>
                    </a>
                </div>
            </li>

            <!-- Export -->
            <li>
                <a href="../export/" data-tooltip-target="tooltip-export" data-tooltip-placement="right"
                    class="nav-item nav-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 group relative w-full cursor-pointer touch-manipulation border-b border-transparent hover:border-white/5 lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!px-3 lg:group-[.sidebar-collapsed]/body:!gap-0">
                                        <svg class="w-6 h-6 shrink-0 transition-all duration-300 group-hover:hidden group-active:hidden group-[.nav-item-active]:hidden lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M16.444 18H19a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2.556M17 11V5a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v6h10ZM7 15h10v4a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-4Z"/>
                    </svg>
                    <svg class="hidden w-6 h-6 shrink-0 transition-all duration-300 group-hover:block group-active:block group-[.nav-item-active]:block lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" d="M8 3a2 2 0 0 0-2 2v3h12V5a2 2 0 0 0-2-2H8Zm-3 7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1v-4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4h1a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5Zm4 11a1 1 0 0 1-1-1v-4h8v4a1 1 0 0 1-1 1H9Z" clip-rule="evenodd"/>
                    </svg><span class="sidebar-text text-[14px] font-bold whitespace-nowrap flex-1 text-left nav-text tracking-wide group-hover:pl-0.5 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden">Export</span>
                </a>
            </li>
        </ul>
    </nav>

    <!-- Sidebar Footer (Settings, Logout, Version) -->
    <div
        class="sidebar-footer-section border-t border-white/10 pt-3 mt-auto shrink-0 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <ul class="space-y-1">
            <!-- Settings (same nav-item / border-b pattern as main links so setActiveNavState matches) -->
            <li>
                <a href="../settings/" data-tooltip-target="tooltip-settings" data-tooltip-placement="right"
                    class="nav-item nav-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 group relative w-full cursor-pointer touch-manipulation border-b border-transparent hover:border-white/5 lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!px-3 lg:group-[.sidebar-collapsed]/body:!gap-0">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-300 group-hover:scale-110 lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                        </path>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span class="sidebar-text text-[14px] font-bold whitespace-nowrap flex-1 text-left nav-text tracking-wide group-hover:pl-0.5 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden">Settings</span>
                </a>
            </li>
            <!-- About -->
            <li>
                <a href="../about/" data-tooltip-target="tooltip-about" data-tooltip-placement="right"
                    class="nav-item nav-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 group relative w-full cursor-pointer touch-manipulation border-b border-transparent hover:border-white/5 lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!px-3 lg:group-[.sidebar-collapsed]/body:!gap-0">
                    <svg class="w-5 h-5 shrink-0 transition-all duration-300 group-hover:scale-110 lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 13V7m0 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
                    </svg>
                    <span class="sidebar-text text-[14px] font-bold whitespace-nowrap flex-1 text-left nav-text tracking-wide group-hover:pl-0.5 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!hidden">About</span>
                </a>
            </li>
            <!-- Logout -->
            <li>
                <a href="../../../" data-tooltip-target="tooltip-logout" data-tooltip-placement="right"
                    class="nav-item nav-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/90 hover:text-white hover:bg-red-600/10 active:bg-red-600/20 transition-all duration-300 group relative w-full cursor-pointer touch-manipulation border border-transparent hover:border-red-600/10 lg:group-[.sidebar-collapsed]/body:!justify-center lg:group-[.sidebar-collapsed]/body:!px-3 lg:group-[.sidebar-collapsed]/body:!gap-0">
                    <svg class="w-5 h-5 text-rose-400 shrink-0 transition-all duration-300 lg:group-[.sidebar-collapsed]/body:!m-0" aria-hidden="true"
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
                    <p>Version <?php echo htmlspecialchars(function_exists('appVersion') ? appVersion() : '3.0.0', ENT_QUOTES, 'UTF-8'); ?></p>
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
    User Management
    <div class="tooltip-arrow" data-popper-arrow></div>
</div>

<!-- Multi-dropdown for Annual Budget Summary in Collapsed Rail -->
<div id="tooltip-budget-summary" role="tooltip" class="sidebar-multidropdown-tooltip absolute z-[9999] invisible inline-block p-2 text-xs font-bold text-white transition-opacity duration-300 bg-slate-900/95 rounded-xl shadow-2xl opacity-0 tooltip dark:bg-gray-800 lg:group-[:not(.sidebar-collapsed)]/body:!hidden border border-white/20 backdrop-blur-xl min-w-[220px] pointer-events-auto">
    <div class="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white/50 border-b border-white/10 mb-1">
        Annual Budget Summary
    </div>
    <ul class="flex flex-col gap-1 p-0 m-0 list-none" aria-labelledby="dropdownBudgetSummaryButton">
        <li>
            <a href="../budget/" class="nav-subitem-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all text-xs font-semibold cursor-pointer group/link">
                <span class="w-2 h-2 rounded-full border border-white/50 bg-transparent group-hover/link:border-emerald-400 group-hover/link:bg-emerald-400 transition-colors"></span>
                <span>Actual vs Budget YTD</span>
            </a>
        </li>
        <li>
            <a href="../specialfund/" class="nav-subitem-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all text-xs font-semibold cursor-pointer group/link">
                <span class="w-2 h-2 rounded-full border border-white/50 bg-transparent group-hover/link:border-emerald-400 group-hover/link:bg-emerald-400 transition-colors"></span>
                <span>Special Program Fund</span>
            </a>
        </li>
    </ul>
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

<!-- Multi-dropdown for Expenses in Collapsed Rail -->
<div id="tooltip-expenses" role="tooltip" class="sidebar-multidropdown-tooltip absolute z-[9999] invisible inline-block p-2 text-xs font-bold text-white transition-opacity duration-300 bg-slate-900/95 rounded-xl shadow-2xl opacity-0 tooltip dark:bg-gray-800 lg:group-[:not(.sidebar-collapsed)]/body:!hidden border border-white/20 backdrop-blur-xl min-w-[240px] pointer-events-auto">
    <div class="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white/50 border-b border-white/10 mb-1">
        Expenses
    </div>
    <ul class="flex flex-col gap-1 p-0 m-0 list-none" aria-labelledby="dropdownExpensesButton">
        <li>
            <a href="../monthly-expenses/" class="nav-subitem-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all text-xs font-semibold cursor-pointer group/link">
                <span class="w-2 h-2 rounded-full border border-white/50 bg-transparent group-hover/link:border-emerald-400 group-hover/link:bg-emerald-400 transition-colors"></span>
                <span>Monthly Expenses Summary</span>
            </a>
        </li>
        <li>
            <a href="../itemized/" class="nav-subitem-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all text-xs font-semibold cursor-pointer group/link">
                <span class="w-2 h-2 rounded-full border border-white/50 bg-transparent group-hover/link:border-emerald-400 group-hover/link:bg-emerald-400 transition-colors"></span>
                <span>Itemized Daily Transactions</span>
            </a>
        </li>
        <li>
            <a href="../specialfund/" class="nav-subitem-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all text-xs font-semibold cursor-pointer group/link">
                <span class="w-2 h-2 rounded-full border border-white/50 bg-transparent group-hover/link:border-emerald-400 group-hover/link:bg-emerald-400 transition-colors"></span>
                <span>Special Program</span>
            </a>
        </li>
    </ul>
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

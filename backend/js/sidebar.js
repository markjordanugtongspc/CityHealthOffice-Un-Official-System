/**
 * Advanced Sidebar Navigation Module
 * 
 * Handles sidebar collapse/expand, Flowbite dropdowns, and state persistence
 * Uses advanced JavaScript patterns for maintainability and performance
 * 
 * Features:
 * - Collapsible sidebar with smooth animations
 * - Native Flowbite hover and click dropdowns for collapsed state
 * - Dropdown menu functionality with state persistence
 * - Normal page navigation (standard href links)
 * - Responsive design for mobile and desktop
 * - Active link highlighting
 * 
 * @module sidebar
 */

import { initDropdowns as initFlowbiteDropdowns } from 'flowbite';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Navigation State Manager
 * Handles persistence of sidebar and dropdown states using localStorage and cookies
 */
const NavigationState = {
    sidebarCollapsed: false,
    openDropdowns: ['budget-dropdown', 'expenses-dropdown'],

    // START: saveNavigationState - Saves current sidebar and dropdown states to localStorage and cookie preferences
    save() {
        try {
            const stateData = {
                sidebar: this.sidebarCollapsed,
                dropdowns: this.openDropdowns
            };
            localStorage.setItem('navState', JSON.stringify(stateData));
            document.cookie = `cho_nav_state=${encodeURIComponent(JSON.stringify(stateData))}; path=/; max-age=31536000; SameSite=Lax`;
        } catch (error) {
            console.warn('Failed to save navigation state:', error);
        }
    },
    // END: saveNavigationState

    // START: loadNavigationState - Loads saved sidebar and dropdown preferences from localStorage or initializes defaults
    load() {
        try {
            const saved = localStorage.getItem('navState');
            if (saved) {
                const state = JSON.parse(saved);
                this.sidebarCollapsed = state.sidebar || false;
                this.openDropdowns = Array.isArray(state.dropdowns) ? state.dropdowns : ['budget-dropdown', 'expenses-dropdown'];
            } else {
                // Check cookie fallback
                const match = document.cookie.match(/(?:^|; )cho_nav_state=([^;]*)/);
                if (match && match[1]) {
                    const state = JSON.parse(decodeURIComponent(match[1]));
                    this.sidebarCollapsed = state.sidebar || false;
                    this.openDropdowns = Array.isArray(state.dropdowns) ? state.dropdowns : ['budget-dropdown', 'expenses-dropdown'];
                } else {
                    // Default state: sidebar expanded, Annual Budget Summary and Expenses dropdowns open
                    this.sidebarCollapsed = false;
                    this.openDropdowns = ['budget-dropdown', 'expenses-dropdown'];
                    this.save();
                }
            }
        } catch (error) {
            console.warn('Failed to load navigation state:', error);
            this.sidebarCollapsed = false;
            this.openDropdowns = ['budget-dropdown', 'expenses-dropdown'];
        }
    }
    // END: loadNavigationState
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// START: getMainContent - Retrieves the main content container element for layout adjustments
function getMainContent() {
    return document.getElementById('spaContentContainer') ||
        document.querySelector('.main-content') ||
        document.querySelector('main') ||
        document.querySelector('.ml-64');
}
// END: getMainContent

// START: debounce - Debounces function execution to optimize rapid window resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
// END: debounce

// ============================================================================
// SIDEBAR TOGGLE FUNCTIONALITY
// ============================================================================

// START: notifyChartLayoutSettled - Dispatches resize event so responsive charts and layouts recalibrate
function notifyChartLayoutSettled() {
    window.dispatchEvent(new Event('resize'));
}
// END: notifyChartLayoutSettled

// START: adjustContentMargin - Handles responsive layout adjustments based on sidebar state
function adjustContentMargin() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = getMainContent();

    if (!sidebar || !mainContent) return;

    if (window.innerWidth < 1024) {
        mainContent.style.marginLeft = '';
        mainContent.style.width = '';
    }
}
// END: adjustContentMargin

// START: initSidebarToggle - Initializes sidebar toggle handlers and desktop/mobile responsiveness
function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
    const sidebarToggleCollapsed = document.getElementById('sidebarToggleCollapsed');
    const sidebarToggleHeader = document.getElementById('sidebarToggleHeader');
    const sidebarCloseMobile = document.getElementById('sidebarCloseMobile');

    if (!sidebar) return;

    // Restore saved state on page load (Desktop only - >= 1024px)
    NavigationState.load();

    // Ensure the body has the group/body class for tailwind variants
    document.body.classList.add('group/body');

    // Only apply collapsed state on desktop (>= 1024px)
    if (window.innerWidth >= 1024) {
        sidebar.removeAttribute('aria-hidden');
        if (NavigationState.sidebarCollapsed) {
            document.body.classList.add('sidebar-collapsed');
            sidebar.classList.add('collapsed');
        }
    } else if (window.innerWidth < 1024) {
        // On mobile, ensure sidebar is not collapsed and starts hidden
        document.body.classList.remove('sidebar-collapsed');
        sidebar.classList.remove('collapsed');
        sidebar.classList.remove('translate-x-0');
        sidebar.classList.add('-translate-x-full');
        sidebar.style.visibility = 'hidden';
        sidebar.setAttribute('aria-hidden', 'true');
    }

    // Initial margin adjustment
    adjustContentMargin();
    requestAnimationFrame(() => notifyChartLayoutSettled());

    // START: toggleSidebar - Toggles sidebar collapse on desktop or slide-over drawer on mobile
    function toggleSidebar() {
        const isMobile = window.innerWidth < 1024;
        const mobileBackdrop = document.getElementById('mobileBackdrop');

        if (isMobile) {
            const isOpen = sidebar.classList.contains('translate-x-0');

            if (isOpen) {
                sidebar.classList.remove('translate-x-0');
                sidebar.classList.add('-translate-x-full');
                document.body.classList.remove('overflow-hidden');
                if (mobileBackdrop) {
                    mobileBackdrop.classList.remove('opacity-100', 'visible', 'pointer-events-auto');
                    mobileBackdrop.classList.add('opacity-0', 'invisible', 'pointer-events-none');
                }
                sidebar.style.visibility = 'hidden';
                updateHeaderToggleIcon(false);
            } else {
                sidebar.style.visibility = 'visible';
                sidebar.classList.remove('-translate-x-full');
                sidebar.classList.add('translate-x-0');
                document.body.classList.add('overflow-hidden');
                if (mobileBackdrop) {
                    mobileBackdrop.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
                    mobileBackdrop.classList.add('opacity-100', 'visible', 'pointer-events-auto');
                }
                updateHeaderToggleIcon(true);
            }
        } else {
            // Desktop: Toggle collapse/expand on BOTH sidebar and body
            sidebar.classList.toggle('collapsed');
            document.body.classList.toggle('sidebar-collapsed');
            
            const isCollapsed = sidebar.classList.contains('collapsed');

            // Save state
            NavigationState.sidebarCollapsed = isCollapsed;
            NavigationState.save();
            
            // Re-initialize Flowbite dropdowns on state change
            if (typeof initFlowbiteDropdowns === 'function') {
                initFlowbiteDropdowns();
            }

            window.setTimeout(notifyChartLayoutSettled, 350);
        }
    }
    // END: toggleSidebar

    // START: updateHeaderToggleIcon - Updates mobile header hamburger/close toggle icon based on state
    function updateHeaderToggleIcon(isOpen) {
        const headerToggle = document.getElementById('sidebarToggleHeader');
        if (!headerToggle) return;

        const hamburgerIcon = headerToggle.querySelector('#headerHamburgerIcon');
        const closeIcon = headerToggle.querySelector('#headerCloseIcon');

        if (isOpen) {
            if (hamburgerIcon) hamburgerIcon.classList.add('hidden');
            if (closeIcon) closeIcon.classList.remove('hidden');
        } else {
            if (hamburgerIcon) hamburgerIcon.classList.remove('hidden');
            if (closeIcon) closeIcon.classList.add('hidden');
        }
    }
    // END: updateHeaderToggleIcon

    // Desktop toggle buttons
    if (sidebarToggleDesktop) {
        sidebarToggleDesktop.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
        });
    }

    if (sidebarToggleCollapsed) {
        sidebarToggleCollapsed.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
        });
    }

    // Header toggle button (mobile hamburger)
    if (sidebarToggleHeader) {
        sidebarToggleHeader.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
        });
    }

    // Mobile close button (inside sidebar)
    if (sidebarCloseMobile) {
        sidebarCloseMobile.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.innerWidth < 1024) {
                toggleSidebar();
            }
        });
    }

    // Close sidebar when clicking backdrop (mobile only)
    const mobileBackdrop = document.getElementById('mobileBackdrop');
    if (mobileBackdrop) {
        mobileBackdrop.addEventListener('click', () => {
            if (window.innerWidth < 1024 && sidebar.classList.contains('translate-x-0')) {
                toggleSidebar();
            }
        });
    }

    // Close sidebar on mobile when clicking outside or on navigation link
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 1024) {
            const isNavLink = e.target.closest('.nav-link, .nav-subitem');
            const isCloseButton = e.target.closest('#sidebarCloseMobile');
            const isOutside = sidebar && !sidebar.contains(e.target) &&
                sidebarToggleHeader && !sidebarToggleHeader.contains(e.target) &&
                mobileBackdrop && !mobileBackdrop.contains(e.target);

            if (isOutside || isNavLink || isCloseButton) {
                if (sidebar.classList.contains('translate-x-0')) {
                    toggleSidebar();
                }
            }
        }
    });

    // Handle window resize (combines both mobile and desktop adjustments)
    const handleResize = debounce(() => {
        adjustContentMargin();

        if (window.innerWidth >= 1024) {
            sidebar.classList.remove('translate-x-0');
            sidebar.removeAttribute('aria-hidden');
            sidebar.style.visibility = '';
            document.body.classList.remove('overflow-hidden');
            if (mobileBackdrop) {
                mobileBackdrop.classList.remove('opacity-100', 'visible', 'pointer-events-auto');
                mobileBackdrop.classList.add('opacity-0', 'invisible', 'pointer-events-none');
                mobileBackdrop.setAttribute('aria-hidden', 'true');
            }
            updateHeaderToggleIcon(false);
        }
    }, 150);

    window.addEventListener('resize', handleResize);
}
// END: initSidebarToggle

// ============================================================================
// DROPDOWN FUNCTIONALITY
// ============================================================================

// START: initDropdowns - Initializes dropdown accordion for expanded sidebar & Flowbite for collapsed
function initDropdowns() {
    const dropdownTriggers = document.querySelectorAll('.nav-dropdown-trigger');

    // Initialize Flowbite dropdowns for collapsed flyouts
    if (typeof initFlowbiteDropdowns === 'function') {
        initFlowbiteDropdowns();
    }

    // START: saveDropdownStates - Persists current active dropdown ids into NavigationState and storage
    function saveDropdownStates() {
        const openDropdowns = [];
        document.querySelectorAll('.nav-dropdown-trigger.active').forEach(trigger => {
            const dropdownId = trigger.getAttribute('data-dropdown');
            if (dropdownId) {
                openDropdowns.push(dropdownId);
            }
        });
        NavigationState.openDropdowns = openDropdowns;
        NavigationState.save();
    }
    // END: saveDropdownStates

    // START: toggleDropdown - Toggles inline accordion dropdown open/close state in expanded sidebar
    function toggleDropdown(trigger) {
        const dropdownId = trigger.getAttribute('data-dropdown');
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        const isActive = trigger.classList.contains('active');

        // Toggle state
        if (isActive) {
            trigger.classList.remove('active');
            dropdown.classList.remove('show');
            trigger.setAttribute('aria-expanded', 'false');
        } else {
            trigger.classList.add('active');
            dropdown.classList.add('show');
            trigger.setAttribute('aria-expanded', 'true');
        }

        saveDropdownStates();
    }
    // END: toggleDropdown

    // Add click handlers to all dropdown triggers (expanded mode accordion)
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const isCollapsed = sidebar && (sidebar.classList.contains('collapsed') || document.body.classList.contains('sidebar-collapsed'));

            if (isCollapsed) {
                // When collapsed, Flowbite handles dropdown popovers on right
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            toggleDropdown(trigger);
        });
    });

    // Auto-open dropdown if child link is active
    const currentPage = window.location.pathname;
    document.querySelectorAll('.nav-subitem, .nav-subitem-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPage.includes(href.replace(/^\.\.\//, '').replace(/^\.\//, ''))) {
            const dropdown = link.closest('.dropdown-content');
            if (dropdown) {
                const trigger = document.querySelector(`[data-dropdown="${dropdown.id}"]`);
                if (trigger) {
                    trigger.classList.add('active');
                    dropdown.classList.add('show');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            }
        }
    });

    // Restore saved dropdown states
    if (NavigationState.openDropdowns.length > 0) {
        NavigationState.openDropdowns.forEach(dropdownId => {
            const dropdown = document.getElementById(dropdownId);
            const trigger = document.querySelector(`[data-dropdown="${dropdownId}"]`);
            if (dropdown && trigger) {
                trigger.classList.add('active');
                dropdown.classList.add('show');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    } else {
        dropdownTriggers.forEach(trigger => {
            const dropdownId = trigger.getAttribute('data-dropdown');
            const dropdown = document.getElementById(dropdownId);
            if (dropdown && !NavigationState.openDropdowns.includes(dropdownId)) {
                trigger.classList.remove('active');
                dropdown.classList.remove('show');
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
    }
}
// END: initDropdowns

// ============================================================================
// NAVIGATION LINK HANDLING
// ============================================================================

// START: setActiveNavState - Matches active URL to highlight current navigation item and parent dropdown
function setActiveNavState() {
    const currentPath = window.location.pathname;
    const currentPathNormalized = currentPath.replace(/\/$/, '').replace(/\/index\.php$/, '');
    const navItems = document.querySelectorAll('.nav-item[href], .nav-subitem-link[href]');

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (!href || href === '#') return;

        // Normalize href
        const normalizedHref = href.replace(/^\.\//, '').replace(/^\.\.\//, '').replace(/\/$/, '').replace(/\/index\.php$/, '');

        // Check if current path matches
        let isActive = false;

        if (normalizedHref.includes('dashboard')) {
            isActive = currentPathNormalized.includes('dashboard') || currentPathNormalized === '' || currentPathNormalized === '/';
        } else if (normalizedHref.includes('specialfund')) {
            isActive = currentPathNormalized.includes('specialfund');
        } else if (normalizedHref.includes('fund-downloaded')) {
            isActive = currentPathNormalized.includes('fund-downloaded');
        } else if (normalizedHref.includes('budget')) {
            isActive = currentPathNormalized.includes('budget') && !currentPathNormalized.includes('fund-downloaded');
        } else if (normalizedHref.includes('monthly-expenses')) {
            isActive = currentPathNormalized.includes('monthly-expenses');
        } else if (normalizedHref.includes('itemized')) {
            isActive = currentPathNormalized.includes('itemized');
        } else if (normalizedHref.includes('export')) {
            isActive = currentPathNormalized.includes('export');
        } else if (normalizedHref.includes('settings')) {
            isActive = currentPathNormalized.includes('/settings') || currentPathNormalized.endsWith('settings');
        } else if (normalizedHref.includes('admin')) {
            isActive = currentPathNormalized.includes('admin');
        } else {
            isActive = currentPathNormalized.includes(normalizedHref) || currentPath.includes(normalizedHref);
        }

        // Apply active class styling
        if (isActive) {
            item.classList.remove(
                'text-white/80', 'text-white/70', 'text-white/60', 'text-white/50',
                'border-transparent'
            );
            item.classList.add('text-white', 'font-extrabold', 'nav-item-active');

            if (!item.classList.contains('nav-subitem') && !item.classList.contains('nav-subitem-link') && !item.classList.contains('nav-dropdown-trigger')) {
                item.classList.add('border-b-2', '!border-emerald-400');
            } else if (item.classList.contains('nav-subitem-link')) {
                item.classList.add('bg-white/10');
            }

        } else {
            item.classList.remove(
                'text-white', 'font-extrabold', 'border-b-2', '!border-emerald-400', 'nav-item-active',
                'bg-white/10', 'text-white/60', 'text-white/70', 'text-white/50'
            );
            item.classList.add('text-white/80', 'border-transparent');
        }
    });

    // Handle parent dropdown triggers without giving them rectangular active borders
    document.querySelectorAll('.dropdown-content, #flowbite-dropdown-budget, #flowbite-dropdown-expenses').forEach(dropdown => {
        const hasActiveChild = dropdown.querySelector('.nav-item-active, .font-extrabold');
        let trigger = null;
        if (dropdown.id.includes('budget')) {
            trigger = document.getElementById('dropdownBudgetSummaryButton');
        } else if (dropdown.id.includes('expenses')) {
            trigger = document.getElementById('dropdownExpensesButton');
        } else if (dropdown.id) {
            trigger = document.querySelector(`[data-dropdown="${dropdown.id}"]`);
        }

        if (trigger) {
            trigger.classList.remove('border-b-2', '!border-emerald-400', 'bg-white/10', 'border');
            if (hasActiveChild) {
                trigger.classList.remove('text-white/70', 'text-white/60', 'text-white/50', 'border-transparent');
                trigger.classList.add('text-white', 'font-bold', 'nav-item-active');
            } else if (!trigger.classList.contains('active')) {
                trigger.classList.remove('font-extrabold', 'font-bold', 'nav-item-active');
                trigger.classList.add('text-white/70', 'border-transparent');
            }
        }
    });
}
// END: setActiveNavState

// START: setActiveLink - Applies active styling to a specific link element
function setActiveLink(link) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove(
            'text-white', 'font-extrabold', 'border-b-2', '!border-emerald-400', 'nav-item-active',
            'text-white/60', 'text-white/70', 'text-white/50'
        );
        item.classList.add('text-white/80', 'border-transparent');
    });

    if (link) {
        link.classList.remove(
            'text-white/80', 'text-white/70', 'text-white/60', 'text-white/50', 'border-transparent'
        );
        link.classList.add('text-white', 'font-extrabold', 'nav-item-active');
        if (!link.classList.contains('nav-subitem') && !link.classList.contains('nav-subitem-link')) {
            link.classList.add('border-b-2', '!border-emerald-400');
        }
    }
}
// END: setActiveLink

// START: initNavigationLinks - Initializes navigation link state on page load
function initNavigationLinks() {
    setActiveNavState();
}
// END: initNavigationLinks

// ============================================================================
// MAIN INITIALIZATION
// ============================================================================

// START: reinitializeSidebarFeatures - Re-runs sidebar initializers after dynamic content updates
function reinitializeSidebarFeatures() {
    initDropdowns();
    initNavigationLinks();
    setActiveNavState();
    adjustContentMargin();
}
// END: reinitializeSidebarFeatures

// START: checkAdminAccess - Verifies user role and conditionally displays administrative navigation items
async function checkAdminAccess() {
    try {
        const path = window.location.pathname || '/';
        let apiBase = '';

        if (path.includes('/frontend/')) {
            const idx = path.indexOf('/frontend/');
            apiBase = path.substring(0, idx);
        } else if (path.includes('/index.php')) {
            const idx = path.indexOf('/index.php');
            apiBase = path.substring(0, idx);
        } else if (path !== '/' && path.endsWith('/')) {
            apiBase = path.slice(0, -1);
        }

        const response = await fetch(`${apiBase}/api/auth/current-user.php`, {
            credentials: 'same-origin'
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
                const allowedRoles = ['Administrator', 'CEO', 'Manager'];
                const adminNavItem = document.getElementById('adminNavItem');
                const adminSectionHeader = document.getElementById('adminSectionHeader');
                const adminSeparator = document.getElementById('adminSeparator');
                const isAllowed = allowedRoles.includes(data.user.role);

                if (adminNavItem) {
                    if (isAllowed) {
                        adminNavItem.classList.remove('hidden');
                    } else {
                        adminNavItem.classList.add('hidden');
                    }
                }
                if (adminSectionHeader) {
                    if (isAllowed) {
                        adminSectionHeader.classList.remove('hidden');
                    } else {
                        adminSectionHeader.classList.add('hidden');
                    }
                }
                if (adminSeparator) {
                    if (isAllowed) {
                        adminSeparator.classList.remove('hidden');
                    } else {
                        adminSeparator.classList.add('hidden');
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error checking admin access:', error);
    }
}
// END: checkAdminAccess

// START: initSidebar - Main initializer that bootstraps all sidebar functionality and state restoration
export function initSidebar() {
    // Load saved state
    NavigationState.load();

    // Initialize all features
    initSidebarToggle();
    initDropdowns();
    initNavigationLinks();
    setActiveNavState();

    // Check admin access and show/hide admin link
    checkAdminAccess();

    // Initial content margin adjustment
    adjustContentMargin();
}
// END: initSidebar

// Export utility functions for use in other modules
export {
    setActiveLink,
    getMainContent,
    NavigationState,
    adjustContentMargin,
    initDropdowns,
    initNavigationLinks,
    setActiveNavState,
    reinitializeSidebarFeatures
};

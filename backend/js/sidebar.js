/**
 * Advanced Sidebar Navigation Module
 * 
 * Handles sidebar collapse/expand, dropdowns, and state persistence
 * Uses advanced JavaScript patterns for maintainability and performance
 * 
 * Features:
 * - Collapsible sidebar with smooth animations
 * - Dropdown menu functionality with state persistence
 * - Normal page navigation (standard href links)
 * - Responsive design for mobile and desktop
 * - Tooltip support for collapsed state
 * - Active link highlighting
 * 
 * @module sidebar
 */

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Navigation State Manager
 * Handles persistence of sidebar and dropdown states using localStorage
 * 
 * To update navigation items in the future:
 * 1. Modify the HTML in frontend/components/sidebar.php
 * 2. Update the active link detection logic in setActiveNavState()
 * 3. Add new dropdown handlers in initDropdowns() if needed
 */
const NavigationState = {
    sidebarCollapsed: false,
    openDropdowns: [],

    /**
     * Save current navigation state to localStorage
     * Called automatically on state changes
     */
    save() {
        try {
            localStorage.setItem('navState', JSON.stringify({
                sidebar: this.sidebarCollapsed,
                dropdowns: this.openDropdowns
            }));
        } catch (error) {
            console.warn('Failed to save navigation state:', error);
        }
    },

    /**
     * Load saved navigation state from localStorage
     * Called on page initialization
     */
    load() {
        try {
            const saved = localStorage.getItem('navState');
            if (saved) {
                const state = JSON.parse(saved);
                this.sidebarCollapsed = state.sidebar || false;
                this.openDropdowns = state.dropdowns || [];
            }
        } catch (error) {
            console.warn('Failed to load navigation state:', error);
            // Reset to defaults on error
            this.sidebarCollapsed = false;
            this.openDropdowns = [];
        }
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get main content element for margin adjustments
 * Supports multiple content container patterns
 * 
 * @returns {HTMLElement|null} Main content element
 */
function getMainContent() {
    return document.getElementById('spaContentContainer') ||
        document.querySelector('.main-content') ||
        document.querySelector('main') ||
        document.querySelector('.ml-64');
}

/**
 * Debounce function for performance optimization
 * Prevents excessive function calls during rapid events
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
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

// ============================================================================
// NAVIGATION SYSTEM (Normal Page Navigation)
// ============================================================================

// Note: SPA navigation has been removed. All links now use standard href navigation.
// This ensures proper page loads and data initialization.

// ============================================================================
// SIDEBAR TOGGLE FUNCTIONALITY
// ============================================================================

/**
 * Adjust main content margin based on sidebar state
 * Called after sidebar toggle and on page load
 */
/**
 * Adjust main content margin based on sidebar state
 * This is now primarily handled via Tailwind classes in index.php
 * but we keep this as a secondary check if needed.
 */
function adjustContentMargin() {
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    const mainContent = getMainContent();

    if (!sidebar || !mainContent) return;

    // We no longer manually set inline styles for margins on desktop
    // as it is now handled by group-variants on the body.
    // However, for mobile we might still need some checks.
    
    if (window.innerWidth < 1024) {
        mainContent.style.marginLeft = '';
        mainContent.style.width = '';
    }
}

/**
 * Initialize sidebar toggle functionality
 * Handles collapse/expand with state persistence
 * 
 * To modify toggle behavior:
 * 1. Update the collapsed width in adjustContentMargin() (currently 4.5rem)
 * 2. Update expanded width in adjustContentMargin() (currently 16rem)
 * 3. Modify CSS classes in sidebar.php if needed
 */
function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
    const sidebarToggleCollapsed = document.getElementById('sidebarToggleCollapsed');
    const sidebarToggleCollapsedWrapper = document.getElementById('sidebarToggleCollapsedWrapper');
    const sidebarToggleHeader = document.getElementById('sidebarToggleHeader'); // Hamburger in header

    if (!sidebar) return;

    // Restore saved state on page load (Desktop only - >= 1024px)
    NavigationState.load();

    // Ensure the body has the group/body class for tailwind variants
    document.body.classList.add('group/body');

    // Only apply collapsed state on desktop (>= 1024px)
    if (window.innerWidth >= 1024 && NavigationState.sidebarCollapsed) {
        document.body.classList.add('sidebar-collapsed');
        sidebar.classList.add('collapsed');
    } else if (window.innerWidth < 1024) {
        // On mobile, ensure sidebar is not collapsed and starts hidden
        document.body.classList.remove('sidebar-collapsed');
        sidebar.classList.remove('collapsed');
        sidebar.classList.remove('translate-x-0');
        sidebar.classList.add('-translate-x-full');
        sidebar.style.visibility = 'hidden';
    }


    // Initial margin adjustment
    adjustContentMargin();

    /**
     * Unified toggle sidebar function for both mobile and desktop
     * Mobile (< 1024px): Toggles sidebar visibility (slide in/out)
     * Desktop (>= 1024px): Toggles collapse/expand state
     */
    function toggleSidebar() {
        const isMobile = window.innerWidth < 1024;
        const mobileBackdrop = document.getElementById('mobileBackdrop');

        if (isMobile) {
            // Mobile toggle logic remains the same
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
        }
    }

    /**
     * Update header toggle icon (hamburger/close)
     * @param {boolean} isOpen - Whether sidebar is open
     */
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

            // Close if clicking outside, on nav link, or on close button
            if (isOutside || isNavLink || isCloseButton) {
                if (sidebar.classList.contains('translate-x-0')) {
                    toggleSidebar();
                }
            }
        }
    });

    // Handle window resize (combines both mobile and desktop adjustments)
    const handleResize = debounce(() => {
        // Adjust content margin for desktop
        adjustContentMargin();

        // Close mobile sidebar if switching to desktop
        if (window.innerWidth >= 1024) {
            sidebar.classList.remove('translate-x-0');
            sidebar.classList.add('-translate-x-full');
            document.body.classList.remove('overflow-hidden');
            if (mobileBackdrop) {
                mobileBackdrop.classList.remove('opacity-100', 'visible', 'pointer-events-auto');
                mobileBackdrop.classList.add('opacity-0', 'invisible', 'pointer-events-none');
                mobileBackdrop.setAttribute('aria-hidden', 'true');
            }
            // Reset header toggle icon
            updateHeaderToggleIcon(false);
        }
    }, 150);

    window.addEventListener('resize', handleResize);
}

// ============================================================================
// DROPDOWN FUNCTIONALITY
// ============================================================================

/**
 * Initialize dropdown menu functionality
 * Handles open/close with state persistence
 * 
 * To add new dropdowns:
 * 1. Add dropdown button with class "nav-dropdown-trigger" and data-dropdown="your-dropdown-id"
 * 2. Add dropdown content div with id="your-dropdown-id" and class "dropdown-content"
 * 3. The system will automatically handle it
 */
function initDropdowns() {
    const dropdownTriggers = document.querySelectorAll('.nav-dropdown-trigger');

    /**
     * Save current dropdown states to localStorage
     */
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

    /**
     * Toggle dropdown open/close state
     * @param {HTMLElement} trigger - Dropdown trigger button
     */
    function toggleDropdown(trigger) {
        const dropdownId = trigger.getAttribute('data-dropdown');
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        const isActive = trigger.classList.contains('active');

        // Toggle state
        if (isActive) {
            trigger.classList.remove('active');
            dropdown.classList.remove('show');
        } else {
            trigger.classList.add('active');
            dropdown.classList.add('show');
        }

        saveDropdownStates();
    }

    // Add click handlers to all dropdown triggers
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Don't toggle dropdowns when sidebar is collapsed (they're always visible as icons)
            const sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('collapsed')) {
                return;
            }

            toggleDropdown(trigger);
        });
    });

    // Auto-open dropdown if child link is active
    const currentPage = window.location.pathname;
    document.querySelectorAll('.nav-subitem').forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPage.includes(href.replace(/^\.\.\//, '').replace(/^\.\//, ''))) {
            const dropdown = link.closest('.dropdown-content');
            if (dropdown) {
                const trigger = document.querySelector(`[data-dropdown="${dropdown.id}"]`);
                if (trigger) {
                    trigger.classList.add('active');
                    dropdown.classList.add('show');
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
            }
        });
    }
}

// ============================================================================
// NAVIGATION LINK HANDLING
// ============================================================================

/**
 * Set active link styling based on current page
 * Updates visual state of navigation items
 * 
 * To update active link detection:
 * 1. Modify the path matching logic in setActiveNavState()
 * 2. Add new page patterns as needed
 */
function setActiveNavState() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item[href]');

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (!href || href === '#') return;

        // Normalize href
        const normalizedHref = href.replace(/^\.\//, '').replace(/^\.\.\//, '').replace(/\/$/, '').replace(/\/index\.php$/, '');
        const currentPathNormalized = currentPath.replace(/\/$/, '').replace(/\/index\.php$/, '');

        // Check if current path matches
        let isActive = false;

        if (normalizedHref.includes('dashboard')) {
            isActive = currentPathNormalized.includes('dashboard') || currentPathNormalized === '' || currentPathNormalized === '/';
        } else if (normalizedHref.includes('budget')) {
            isActive = currentPathNormalized.includes('budget');
        } else if (normalizedHref.includes('specialfund')) {
            isActive = currentPathNormalized.includes('specialfund');
        } else if (normalizedHref.includes('export')) {
            isActive = currentPathNormalized.includes('export');
        } else if (normalizedHref.includes('settings')) {
            isActive = currentPathNormalized.includes('/settings') || currentPathNormalized.endsWith('settings');
        } else {
            isActive = currentPathNormalized.includes(normalizedHref) || currentPath.includes(normalizedHref);
        }

        // Same active treatment for all .nav-item[href] (main nav + footer Settings/About)
        if (isActive) {
            item.classList.remove(
                'text-white/80', 'text-white/70', 'text-white/60', 'text-white/50',
                'border-transparent'
            );
            item.classList.add('text-white', 'font-extrabold', 'border-b-2', '!border-emerald-400', 'nav-item-active');
        } else {
            item.classList.remove(
                'text-white', 'font-extrabold', 'border-b-2', '!border-emerald-400', 'nav-item-active',
                'text-white/60', 'text-white/70', 'text-white/50'
            );
            item.classList.add('text-white/80', 'border-transparent');
        }
    });
}

/**
 * Set active link styling for a specific link
 * Used during navigation
 * 
 * @param {HTMLElement} link - Navigation link element
 */
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
        link.classList.add('text-white', 'font-extrabold', 'border-b-2', '!border-emerald-400', 'nav-item-active');
    }
}

/**
 * Initialize navigation links
 * Uses normal page navigation (no SPA)
 * 
 * To modify navigation behavior:
 * 1. Links use standard href navigation
 * 2. Active link styling is set on page load
 */
function initNavigationLinks() {
    // Set active link on page load
    setActiveNavState();

    // Allow normal navigation - no preventDefault
    // Links will use standard href navigation
    // No click handlers needed - browser handles navigation naturally
}

// ============================================================================
// TOOLTIP FUNCTIONALITY
// ============================================================================

/**
 * Initialize tooltips for collapsed sidebar state
 * Shows tooltips on hover when sidebar is collapsed
 * 
 * Tooltips are automatically shown/hidden based on sidebar state
 */
function initTooltips() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const tooltipElements = document.querySelectorAll('[data-tooltip]');

    tooltipElements.forEach(element => {
        const tooltipText = element.getAttribute('data-tooltip');
        if (!tooltipText) return;

        // Create tooltip element if it doesn't exist
        if (!element.querySelector('.tooltip')) {
            const tooltip = document.createElement('span');
            tooltip.className = 'tooltip absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 pointer-events-none transition-opacity duration-200 z-50';
            tooltip.textContent = tooltipText;
            element.appendChild(tooltip);
        }
    });

    // Show/hide tooltips on hover when collapsed
    const handleTooltip = (e) => {
        const isCollapsed = sidebar.classList.contains('collapsed');
        const tooltip = e.currentTarget.querySelector('.tooltip');

        if (tooltip && isCollapsed) {
            if (e.type === 'mouseenter') {
                tooltip.style.opacity = '1';
            } else {
                tooltip.style.opacity = '0';
            }
        }
    };

    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', handleTooltip);
        element.addEventListener('mouseleave', handleTooltip);
    });
}

// ============================================================================
// MAIN INITIALIZATION
// ============================================================================

/**
 * Initialize all sidebar functionality
 * Main entry point for sidebar module
 * 
 * Call this function in your main.js or page initialization
 * 
 * To extend functionality:
 * 1. Add new init functions above
 * 2. Call them in this function
 * 3. Update comments as needed
 */
/**
 * Re-initialize sidebar features
 * Called on page load to set up all functionality
 */
function reinitializeSidebarFeatures() {
    // Re-initialize dropdowns
    initDropdowns();

    // Re-initialize tooltips
    initTooltips();

    // Re-initialize navigation links
    initNavigationLinks();

    // Set active navigation state
    setActiveNavState();

    // Adjust content margin
    adjustContentMargin();
}

/**
 * Check user role and show/hide admin link
 */
async function checkAdminAccess() {
    try {
        // Get the base path from the current URL
        const path = window.location.pathname || '/';

        // Extract base path before /frontend/ or /index.php
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

                if (adminNavItem) {
                    if (allowedRoles.includes(data.user.role)) {
                        adminNavItem.classList.remove('hidden');
                    } else {
                        adminNavItem.classList.add('hidden');
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error checking admin access:', error);
    }
}

export function initSidebar() {
    // Load saved state
    NavigationState.load();

    // Initialize all features
    initSidebarToggle();
    initDropdowns();
    initNavigationLinks();
    initTooltips();
    setActiveNavState();

    // Check admin access and show/hide admin link
    checkAdminAccess();

    // Initial content margin adjustment
    adjustContentMargin();
}

// Export utility functions for use in other modules
export {
    setActiveLink,
    getMainContent,
    NavigationState,
    adjustContentMargin,
    initDropdowns,
    initNavigationLinks,
    initTooltips,
    setActiveNavState
};

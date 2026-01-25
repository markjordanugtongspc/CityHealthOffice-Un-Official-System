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
function adjustContentMargin() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = getMainContent();
    
    if (!sidebar || !mainContent) return;
    
    const isCollapsed = sidebar.classList.contains('collapsed');
    const isMobile = window.innerWidth < 1024;
    
    // Remove Tailwind margin classes that might conflict
    mainContent.classList.remove('ml-64', 'ml-18', 'ml-0');
    
    // Add transition classes if not present
    if (!mainContent.classList.contains('transition-all')) {
        mainContent.classList.add('transition-all', 'duration-300');
    }
    
    // Adjust margin based on state using inline style for reliable override
    if (isMobile) {
        // Mobile: No margin, full width
        mainContent.style.marginLeft = '0';
        mainContent.style.width = '100%';
    } else if (isCollapsed) {
        // Desktop collapsed: 4.5rem margin
        mainContent.style.marginLeft = '4.5rem'; // 72px - collapsed width
        mainContent.style.width = 'calc(100% - 4.5rem)';
    } else {
        // Desktop expanded: 16rem margin
        mainContent.style.marginLeft = '16rem'; // 256px - expanded width
        mainContent.style.width = 'calc(100% - 16rem)';
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
    const sidebarCloseMobile = document.getElementById('sidebarCloseMobile'); // Close button in mobile sidebar

    if (!sidebar) return;

    // Restore saved state on page load (Desktop only - >= 1024px)
    NavigationState.load();
    
    // Only apply collapsed state on desktop (>= 1024px)
    if (window.innerWidth >= 1024 && NavigationState.sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        if (sidebarToggleCollapsedWrapper) {
            sidebarToggleCollapsedWrapper.classList.remove('hidden');
            sidebarToggleCollapsedWrapper.classList.add('flex');
        }
        if (sidebarToggleDesktop) {
            sidebarToggleDesktop.classList.add('hidden');
        }
        
        // When collapsed on load, hide dropdown triggers and show all dropdown items as icons
        document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
            trigger.style.display = 'none';
        });
        document.querySelectorAll('.dropdown-content').forEach(dropdown => {
            dropdown.classList.add('show');
            dropdown.style.display = 'flex';
            dropdown.style.flexDirection = 'column';
            dropdown.style.gap = '0.25rem';
            dropdown.style.marginLeft = '0';
            dropdown.style.marginTop = '0';
        });
        // Ensure dropdown items are centered and show only icons
        document.querySelectorAll('.dropdown-content .nav-subitem').forEach(item => {
            item.style.marginLeft = 'auto';
            item.style.marginRight = 'auto';
            item.style.justifyContent = 'center';
        });
    } else if (window.innerWidth < 1024) {
        // On mobile, ensure sidebar is not collapsed and starts hidden
        sidebar.classList.remove('collapsed');
        sidebar.classList.remove('sidebar-open');
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
            // Mobile: Toggle sidebar visibility
            const isOpen = sidebar.classList.contains('sidebar-open');
            
            if (isOpen) {
                // Close sidebar
                sidebar.classList.remove('sidebar-open');
                document.body.classList.remove('sidebar-open');
                if (mobileBackdrop) {
                    mobileBackdrop.classList.remove('visible');
                }
                // Update header toggle icon
                updateHeaderToggleIcon(false);
            } else {
                // Open sidebar
                sidebar.classList.add('sidebar-open');
                document.body.classList.add('sidebar-open');
                if (mobileBackdrop) {
                    mobileBackdrop.classList.add('visible');
                }
                // Update header toggle icon
                updateHeaderToggleIcon(true);
            }
        } else {
            // Desktop: Toggle collapse/expand
            sidebar.classList.toggle('collapsed');
            const isCollapsed = sidebar.classList.contains('collapsed');
            
            // Save state
            NavigationState.sidebarCollapsed = isCollapsed;
            NavigationState.save();
            
            // Adjust content margin
            adjustContentMargin();
            
            // Toggle button visibility
            if (isCollapsed) {
                if (sidebarToggleDesktop) sidebarToggleDesktop.classList.add('hidden');
                if (sidebarToggleCollapsedWrapper) {
                    sidebarToggleCollapsedWrapper.classList.remove('hidden');
                    sidebarToggleCollapsedWrapper.classList.add('flex');
                }
                
                // When collapsed, hide dropdown triggers and show all dropdown items as icons
                document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
                    trigger.style.display = 'none';
                });
                document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                    dropdown.classList.add('show');
                    dropdown.style.display = 'flex';
                    dropdown.style.flexDirection = 'column';
                    dropdown.style.gap = '0.25rem';
                    dropdown.style.marginLeft = '0';
                    dropdown.style.marginTop = '0';
                });
                document.querySelectorAll('.dropdown-content .nav-subitem').forEach(item => {
                    item.style.marginLeft = 'auto';
                    item.style.marginRight = 'auto';
                    item.style.justifyContent = 'center';
                });
            } else {
                if (sidebarToggleDesktop) sidebarToggleDesktop.classList.remove('hidden');
                if (sidebarToggleCollapsedWrapper) {
                    sidebarToggleCollapsedWrapper.classList.add('hidden');
                    sidebarToggleCollapsedWrapper.classList.remove('flex');
                }
                
                // When expanded, show dropdown triggers and restore normal dropdown behavior
                document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
                    trigger.style.display = '';
                });
                document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                    dropdown.style.display = '';
                    dropdown.style.flexDirection = '';
                    dropdown.style.gap = '';
                    dropdown.style.marginLeft = '';
                    dropdown.style.marginTop = '';
                    
                    const trigger = document.querySelector(`[data-dropdown="${dropdown.id}"]`);
                    if (trigger && trigger.classList.contains('active')) {
                        dropdown.classList.add('show');
                    } else {
                        dropdown.classList.remove('show');
                    }
                });
                document.querySelectorAll('.dropdown-content .nav-subitem').forEach(item => {
                    item.style.marginLeft = '';
                    item.style.marginRight = '';
                    item.style.justifyContent = '';
                });
            }
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
            if (window.innerWidth < 1024 && sidebar.classList.contains('sidebar-open')) {
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
                if (sidebar.classList.contains('sidebar-open')) {
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
            sidebar.classList.remove('sidebar-open');
            document.body.classList.remove('sidebar-open');
            if (mobileBackdrop) {
                mobileBackdrop.classList.remove('visible');
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
        } else {
            isActive = currentPathNormalized.includes(normalizedHref) || currentPath.includes(normalizedHref);
        }
        
        // Update styling
        if (isActive) {
            item.classList.remove('text-white/80');
            item.classList.add('bg-white/20', 'text-white');
        } else {
            item.classList.remove('bg-white/20', 'text-white');
            item.classList.add('text-white/80');
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
        item.classList.remove('bg-white/20', 'text-white');
        item.classList.add('text-white/80');
    });
    
    if (link) {
        link.classList.remove('text-white/80');
        link.classList.add('bg-white/20', 'text-white');
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

export function initSidebar() {
    // Load saved state
    NavigationState.load();
    
    // Initialize all features
    initSidebarToggle();
    initDropdowns();
    initNavigationLinks();
    initTooltips();
    setActiveNavState();
    
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

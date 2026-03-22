/**
 * Dashboard UI functionality
 * Handles user dropdown menu and displays current user info
 */

import { loadUserInfo } from './modules/user-info.js';

const SETTINGS_DROPDOWN_ACTIVE = [
    'bg-[#224796]/10',
    'text-[#224796]',
    'font-semibold',
    'ring-1',
    'ring-inset',
    'ring-[#224796]/25',
    'rounded-lg',
];

/**
 * Highlight Settings in the header user menu when on the settings page.
 */
export function syncUserDropdownSettingsActive() {
    const link = document.getElementById('settingsBtn');
    if (!link) return;
    const path = (window.location.pathname || '').replace(/\/index\.php$/i, '');
    const onSettings = /\/settings\/?$/i.test(path) || path.includes('/settings/');
    SETTINGS_DROPDOWN_ACTIVE.forEach((c) => link.classList.remove(c));
    link.removeAttribute('aria-current');
    if (onSettings) {
        SETTINGS_DROPDOWN_ACTIVE.forEach((c) => link.classList.add(c));
        link.setAttribute('aria-current', 'page');
    }
}

/**
 * Initialize dashboard functionality
 */
export function init() {
    // Load and display user info
    loadUserInfo();

    const userMenuButton = document.getElementById('userMenuButton');
    const userDropdown = document.getElementById('userDropdown');

    // User dropdown toggle
    if (userMenuButton && userDropdown) {
        userMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }

    // Daily chart dropdown toggle
    const dropdownLastDaysButton = document.getElementById('dropdownLastDaysButton');
    const LastDaysdropdown = document.getElementById('LastDaysdropdown');
    
    if (dropdownLastDaysButton && LastDaysdropdown) {
        dropdownLastDaysButton.addEventListener('click', (e) => {
            e.stopPropagation();
            LastDaysdropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdownLastDaysButton.contains(e.target) && !LastDaysdropdown.contains(e.target)) {
                LastDaysdropdown.classList.add('hidden');
            }
        });
    }

    // Monthly chart dropdown toggle
    const dropdownLastDaysMonthlyButton = document.getElementById('dropdownLastDaysMonthlyButton');
    const LastDaysMonthlydropdown = document.getElementById('LastDaysMonthlydropdown');
    
    if (dropdownLastDaysMonthlyButton && LastDaysMonthlydropdown) {
        dropdownLastDaysMonthlyButton.addEventListener('click', (e) => {
            e.stopPropagation();
            LastDaysMonthlydropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdownLastDaysMonthlyButton.contains(e.target) && !LastDaysMonthlydropdown.contains(e.target)) {
                LastDaysMonthlydropdown.classList.add('hidden');
            }
        });
    }

    // Handle menu item clicks
    const profileBtn = document.getElementById('profileBtn');
    const changeUserBtn = document.getElementById('changeUserBtn');

    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            // TODO: Navigate to profile page
            console.log('Profile clicked');
            userDropdown.classList.add('hidden');
        });
    }

    if (changeUserBtn) {
        changeUserBtn.addEventListener('click', (e) => {
            // Allow default href navigation, just close dropdown
            userDropdown.classList.add('hidden');
        });
    }

    syncUserDropdownSettingsActive();

    // Chart pagination functionality
    const chartPageButtons = document.querySelectorAll('.chart-page-btn');
    const chartPageSelect = document.getElementById('chart-page-select');
    const chartPages = document.querySelectorAll('.chart-page');

    // Function to switch chart page
    function switchChartPage(targetPage) {
        const pageNumber = parseInt(targetPage);
        
        // Hide all pages
        chartPages.forEach(page => {
            page.classList.add('hidden');
        });
        
        // Show target page
        const targetPageElement = document.getElementById(`chart-page-${pageNumber}`);
        if (targetPageElement) {
            targetPageElement.classList.remove('hidden');
        }
        
        // Update button styles (desktop)
        chartPageButtons.forEach(btn => {
            btn.classList.remove('bg-linear-to-br', 'from-[#224796]', 'to-[#1e3a8a]', 'text-white', 'shadow-[0_4px_15px_rgba(34,71,150,0.3)]', 'hover:shadow-[0_8px_25px_rgba(34,71,150,0.4)]');
            btn.classList.add('text-slate-500', 'hover:text-slate-900', 'hover:bg-white/70');
        });
        
        // Update active button (desktop)
        const activeButton = document.querySelector(`.chart-page-btn[data-page="${pageNumber}"]`);
        if (activeButton) {
            activeButton.classList.remove('text-slate-500', 'hover:text-slate-900', 'hover:bg-white/70');
            activeButton.classList.add('bg-linear-to-br', 'from-[#224796]', 'to-[#1e3a8a]', 'text-white', 'shadow-[0_4px_15px_rgba(34,71,150,0.3)]', 'hover:shadow-[0_8px_25px_rgba(34,71,150,0.4)]');
        }
        
        // Update select dropdown (mobile)
        if (chartPageSelect) {
            chartPageSelect.value = pageNumber.toString();
        }
        
        // Initialize charts for the new page
        if (typeof window.initPageCharts === 'function') {
            window.initPageCharts(pageNumber);
        }
    }

    // Desktop button click handlers
    if (chartPageButtons.length > 0) {
        chartPageButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const targetPage = button.getAttribute('data-page');
                switchChartPage(targetPage);
            });
        });
    }

    // Mobile select dropdown handler
    if (chartPageSelect) {
        chartPageSelect.addEventListener('change', (e) => {
            switchChartPage(e.target.value);
        });
    }
}

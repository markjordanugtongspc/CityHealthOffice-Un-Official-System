/**
 * Dashboard UI functionality
 * Handles user dropdown menu and displays current user info
 */

import { loadUserInfo } from './modules/user-info.js';

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
    const settingsBtn = document.getElementById('settingsBtn');
    const changeUserBtn = document.getElementById('changeUserBtn');

    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            // TODO: Navigate to profile page
            console.log('Profile clicked');
            userDropdown.classList.add('hidden');
        });
    }

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // TODO: Navigate to settings page
            console.log('Settings clicked');
            userDropdown.classList.add('hidden');
        });
    }

    if (changeUserBtn) {
        changeUserBtn.addEventListener('click', (e) => {
            // Allow default href navigation, just close dropdown
            userDropdown.classList.add('hidden');
        });
    }

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
            btn.classList.remove('bg-[#224796]', 'text-white', 'hover:bg-[#163473]');
            btn.classList.add('text-slate-700', 'hover:bg-slate-100');
        });
        
        // Update active button (desktop)
        const activeButton = document.querySelector(`.chart-page-btn[data-page="${pageNumber}"]`);
        if (activeButton) {
            activeButton.classList.remove('text-slate-700', 'hover:bg-slate-100');
            activeButton.classList.add('bg-[#224796]', 'text-white', 'hover:bg-[#163473]');
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

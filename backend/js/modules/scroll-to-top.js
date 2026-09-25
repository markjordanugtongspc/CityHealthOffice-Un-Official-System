/**
 * START: Floating "Scroll to top" button (mobile/desktop)
 * Displays only when scrolled down, and on budget page only if user selects 25+ entries or page is long enough.
 */

function getScrollContainer() {
    return document.getElementById('pageMain') || document.querySelector('main');
}

export function init() {
    // Only attach once
    if (document.getElementById('scrollToTopBtn')) return;

    const container = getScrollContainer();
    if (!container) return;

    const btn = document.createElement('button');
    btn.id = 'scrollToTopBtn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.className =
        'fixed animate-bounce duration-100 ease-in-out bottom-6 right-6 z-[1001] hidden items-center justify-center rounded-full bg-[#224796] text-white shadow-xl ring-1 ring-black/10 transition hover:bg-[#163473] focus:outline-none focus:ring-4 focus:ring-[#224796]/30 cursor-pointer w-13 h-13 transition-all duration-300';

    btn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"></path>
        </svg>
    `;

    document.body.appendChild(btn);

    const threshold = 160;

    const updateVisibility = () => {
        // If on budget page, verify if page size allows scroll-to-top (>= 25 rows)
        const isBudgetPage = (window.location.pathname || '').includes('/budget');
        if (isBudgetPage) {
            const pageSizeSelect = document.getElementById('budgetPageSize');
            const pageSize = pageSizeSelect ? parseInt(pageSizeSelect.value, 10) : 10;
            if (pageSize < 25) {
                btn.classList.add('hidden');
                btn.classList.remove('flex');
                return;
            }
        }

        // Check if a toast or drawer is temporarily suppressing the button
        if (btn.dataset.suppressed === 'true') {
            btn.classList.add('hidden');
            btn.classList.remove('flex');
            return;
        }

        const top = container.scrollTop;
        if (top > threshold) {
            btn.classList.remove('hidden');
            btn.classList.add('flex');
        } else {
            btn.classList.add('hidden');
            btn.classList.remove('flex');
        }
    };

    btn.addEventListener('click', () => {
        container.scrollTo({ top: 0, behavior: 'smooth' });
    });

    container.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility, { passive: true });
    
    // Listen for page size change events
    document.addEventListener('change', (e) => {
        if (e.target && e.target.id === 'budgetPageSize') {
            setTimeout(updateVisibility, 100);
        }
    });

    // Expose global update trigger for other modules
    window.updateScrollToTopVisibility = updateVisibility;
    updateVisibility();
}
// END: Floating "Scroll to top" button


/**
 * START: Smart Table Pagination Component
 * Renders unified pagination controls with leading page buttons (1, 2, 3), 
 * interactive jump-to-page input box with max page indicator, and trailing page buttons (e.g. 99, 100).
 */

// START: createPageButton - Create a single page navigation button with Tailwind styling
function createPageButton(page, currentPage, onPageChange) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(page);
    button.setAttribute('aria-label', `Go to page ${page}`);
    button.className = [
        'inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium md:px-2.5 md:py-1 md:text-xs',
        'cursor-pointer transition-all duration-150 shadow-2xs',
        page === currentPage
            ? 'bg-[#224796] text-white border border-[#224796] font-bold shadow-xs'
            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 hover:border-slate-400',
    ].join(' ');

    button.addEventListener('click', () => {
        if (page === currentPage) return;
        onPageChange(page);
    });

    return button;
}
// END: createPageButton

// START: renderSmartPagination - Main rendering function for interactive table pagination
export function renderSmartPagination({
    container,
    prevBtn,
    nextBtn,
    currentPage,
    totalPages,
    total,
    onPageChange,
}) {
    if (!container) return;

    // Update Previous button state
    if (prevBtn) {
        const canPrev = currentPage > 1 && total > 0;
        prevBtn.disabled = !canPrev;
        prevBtn.classList.toggle('cursor-pointer', canPrev);
        prevBtn.classList.toggle('cursor-not-allowed', !canPrev);
    }

    // Update Next button state
    if (nextBtn) {
        const canNext = currentPage < totalPages && total > 0;
        nextBtn.disabled = !canNext;
        nextBtn.classList.toggle('cursor-pointer', canNext);
        nextBtn.classList.toggle('cursor-not-allowed', !canNext);
    }

    container.innerHTML = '';
    if (total === 0 || totalPages <= 0) return;

    // For 6 or fewer total pages, render standard full button list
    if (totalPages <= 6) {
        for (let page = 1; page <= totalPages; page++) {
            container.appendChild(createPageButton(page, currentPage, onPageChange));
        }
        return;
    }

    // For > 6 pages, render: Leading buttons (1, 2, 3) -> Jump Input -> Trailing buttons (totalPages - 1, totalPages)
    const leadingPages = [1, 2, 3];
    const trailingPages = [totalPages - 1, totalPages];

    // 1. Leading buttons
    leadingPages.forEach((page) => {
        container.appendChild(createPageButton(page, currentPage, onPageChange));
    });

    // 2. Jump input wrapper
    const jumpWrapper = document.createElement('div');
    jumpWrapper.className = 'flex items-center gap-1 mx-1 shrink-0';

    const isCurrentInMiddle = currentPage > 3 && currentPage < totalPages - 1;

    const jumpInput = document.createElement('input');
    jumpInput.type = 'number';
    jumpInput.min = '1';
    jumpInput.max = String(totalPages);
    jumpInput.value = String(currentPage);
    jumpInput.title = 'Jump to page number (Press Enter)';
    jumpInput.setAttribute('aria-label', `Jump to page (1-${totalPages})`);
    jumpInput.className = [
        'pagination-jump-input w-14 h-8 px-1 text-center text-xs font-bold rounded-lg border transition-all shadow-2xs',
        isCurrentInMiddle
            ? 'border-[#224796] ring-2 ring-[#224796]/20 bg-blue-50 text-[#224796]'
            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 focus:border-[#224796] focus:ring-2 focus:ring-[#224796]/20',
    ].join(' ');

    const handleJump = () => {
        let val = parseInt(jumpInput.value, 10);
        if (Number.isNaN(val)) {
            jumpInput.value = String(currentPage);
            return;
        }
        val = Math.max(1, Math.min(val, totalPages));
        jumpInput.value = String(val);
        if (val !== currentPage) {
            onPageChange(val);
        }
    };

    jumpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleJump();
        }
    });

    jumpInput.addEventListener('change', handleJump);

    const maxLabel = document.createElement('span');
    maxLabel.className = 'text-[11px] font-semibold text-slate-400 select-none';
    maxLabel.textContent = `/ ${totalPages}`;

    jumpWrapper.appendChild(jumpInput);
    jumpWrapper.appendChild(maxLabel);
    container.appendChild(jumpWrapper);

    // 3. Trailing buttons
    trailingPages.forEach((page) => {
        container.appendChild(createPageButton(page, currentPage, onPageChange));
    });
}
// END: renderSmartPagination

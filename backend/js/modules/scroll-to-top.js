/**
 * Floating "Scroll to top" button (mobile/desktop)
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
        'fixed animate-bounce duration-100 ease-in-out bottom-6 right-6 z-[1000] hidden items-center justify-center rounded-full bg-[#224796] text-white shadow-lg ring-1 ring-black/10 transition hover:bg-[#163473] focus:outline-none focus:ring-4 focus:ring-[#224796]/30 cursor-pointer w-12 h-12';

    btn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
        </svg>
    `;

    document.body.appendChild(btn);

    const threshold = 180;

    const updateVisibility = () => {
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
    updateVisibility();
}


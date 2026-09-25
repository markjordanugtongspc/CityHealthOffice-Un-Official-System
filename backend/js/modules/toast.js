/**
 * START: Stacked Toast Notification Manager with Circular Cooldown and Undo Functionality
 * Manages stacked toast cards at bottom-right of the screen.
 * Supports round-cooldown animation (5s), clickable undo action, and temporary cache/sessionStorage backup.
 */

const TOAST_CONTAINER_ID = 'cho-stacked-toast-container';
const TOAST_DURATION = 5000; // 5 seconds cooldown

function ensureToastContainer() {
    let container = document.getElementById(TOAST_CONTAINER_ID);
    if (!container) {
        container = document.createElement('div');
        container.id = TOAST_CONTAINER_ID;
        // Positioned at bottom-right with high z-index and flex column-reverse for natural stacking
        container.className = 'fixed bottom-6 right-6 z-[1050] flex flex-col gap-3 pointer-events-none max-w-md w-full sm:w-auto transition-all duration-300';
        document.body.appendChild(container);
    }
    return container;
}

function suppressScrollToTop(suppress = true) {
    const btn = document.getElementById('scrollToTopBtn');
    if (btn) {
        btn.dataset.suppressed = suppress ? 'true' : 'false';
        if (typeof window.updateScrollToTopVisibility === 'function') {
            window.updateScrollToTopVisibility();
        } else if (suppress) {
            btn.classList.add('hidden');
            btn.classList.remove('flex');
        }
    }
}

/**
 * Show a modern stacked toast notification with optional Undo callback
 * @param {Object} options
 * @param {string} options.title - Toast message title/text
 * @param {string} options.type - 'success' | 'error' | 'info' | 'warning'
 * @param {Function} [options.onUndo] - Async/Sync callback to execute when Undo button is clicked
 * @param {number} [options.duration] - Cooldown duration in ms (default: 5000)
 * @param {Object} [options.cachePayload] - Data to backup in sessionStorage until cooldown completes
 */
export function showStackedToast(options = {}) {
    const {
        title = 'Budget entry updated successfully.',
        type = 'success',
        onUndo = null,
        duration = TOAST_DURATION,
        cachePayload = null,
    } = options;

    const container = ensureToastContainer();
    suppressScrollToTop(true);

    const toastId = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

    // Save temporary backup in sessionStorage if cachePayload provided
    if (cachePayload) {
        try {
            sessionStorage.setItem(`toast_undo_${toastId}`, JSON.stringify(cachePayload));
        } catch (e) {
            console.warn('Unable to cache toast payload:', e);
        }
    }

    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = 'pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_15px_35px_-5px_rgba(15,23,42,0.18),0_0_0_1px_rgba(15,23,42,0.08)] border border-slate-100 p-4 sm:p-4.5 flex items-center justify-between gap-4 transition-all duration-300 transform translate-y-4 opacity-0 scale-95 hover:shadow-2xl min-w-[320px] sm:min-w-[400px] max-w-full';

    // SVG icon depending on type
    let iconHtml = `
        <div class="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 shrink-0">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
        </div>
    `;

    if (type === 'error') {
        iconHtml = `
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-rose-50 text-rose-500 shrink-0">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </div>
        `;
    }

    const undoButtonHtml = onUndo ? `
        <button type="button"
                data-action="undo"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-[#224796] hover:text-[#163473] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0 border border-slate-200 shadow-2xs">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 10h10a5 5 0 015 5v2m-15-7l4-4m-4 4l4 4"/>
            </svg>
            <span>Undo</span>
        </button>
    ` : '';

    // Circular timer indicator with countdown SVG stroke
    const radius = 11;
    const circumference = 2 * Math.PI * radius;

    toast.innerHTML = `
        <div class="flex items-center gap-3.5 min-w-0">
            ${iconHtml}
            <div class="min-w-0">
                <p class="text-sm sm:text-base font-semibold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">
                    ${title}
                </p>
            </div>
        </div>
        <div class="flex items-center gap-2.5 shrink-0 ml-2">
            ${undoButtonHtml}
            <!-- Circular countdown animation SVG -->
            <div class="relative flex items-center justify-center w-7 h-7 shrink-0" title="Auto-closing in 5s">
                <svg class="w-7 h-7 transform -rotate-90" viewBox="0 0 28 28">
                    <circle cx="14" cy="14" r="${radius}" stroke="#e2e8f0" stroke-width="2.5" fill="transparent"/>
                    <circle id="${toastId}-circle" cx="14" cy="14" r="${radius}" stroke="#10b981" stroke-width="2.5" fill="transparent"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="0"
                            stroke-linecap="round"
                            style="transition: stroke-dashoffset ${duration}ms linear;"/>
                </svg>
                <button type="button"
                        data-action="close"
                        class="absolute inset-0 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer text-xs rounded-full">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>
    `;

    container.appendChild(toast);

    // Slide and fade in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0', 'scale-95');
        toast.classList.add('translate-y-0', 'opacity-100', 'scale-100');

        // Start circle stroke animation
        const circle = document.getElementById(`${toastId}-circle`);
        if (circle) {
            circle.style.strokeDashoffset = String(circumference);
        }
    });

    let isDismissed = false;
    const dismiss = () => {
        if (isDismissed) return;
        isDismissed = true;
        clearTimeout(timer);

        // Delete cache entry if exists
        try {
            sessionStorage.removeItem(`toast_undo_${toastId}`);
        } catch (e) {}

        toast.classList.remove('translate-y-0', 'opacity-100', 'scale-100');
        toast.classList.add('translate-y-4', 'opacity-0', 'scale-95');

        setTimeout(() => {
            toast.remove();
            if (container.children.length === 0) {
                suppressScrollToTop(false);
            }
        }, 300);
    };

    // Auto dismiss after duration
    const timer = setTimeout(dismiss, duration);

    // Bind Close Button
    toast.querySelector('[data-action="close"]')?.addEventListener('click', () => {
        dismiss();
    });

    // Bind Undo Button
    toast.querySelector('[data-action="undo"]')?.addEventListener('click', async () => {
        clearTimeout(timer);
        dismiss();
        if (typeof onUndo === 'function') {
            try {
                await onUndo();
            } catch (err) {
                console.error('Failed to undo changes:', err);
            }
        }
    });
}
// END: Stacked Toast Notification Manager

import Swal from 'sweetalert2';
import { showMonthlyExpensesDrawer } from './modules/drawer.js';
import { renderSmartPagination } from './modules/pagination.js';
import { initInlineEdit } from './modules/inline-edit.js';
import {
    sweetalertActionsLeftAlignedClasses,
    sweetalertHtmlLeftAlignedClasses,
    sweetalertHtmlScrollableClasses,
    sweetalertNeutralCancelSlateClasses,
    sweetalertNeutralConfirmBlueClasses,
    sweetalertPopupBaseClasses,
    sweetalertPopupScrollableBaseClasses,
    sweetalertPrimaryConfirmClasses,
    sweetalertSecondaryCancelClasses,
} from './modules/modal.js';

// Monthly expenses data model (will be loaded from database)
let monthlyExpensesRows = [];

// State
let currentPage = 1;
const rowsPerPage = 12;
let searchTerm = '';
let selectedAccountTitle = '';
let selectedYear = new Date().getFullYear();

// Month names for display
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Month keys for data
const monthKeys = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
];

// Formatters
const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function getApiBasePath() {
    const path = window.location.pathname || '/';
    const idx = path.indexOf('/frontend/');
    return idx !== -1 ? path.substring(0, idx) : path.substring(0, path.lastIndexOf('/')) || '';
}

function getCurrentYearFromGlobal() {
    if (typeof window !== 'undefined' && typeof window.appCurrentYear === 'number') {
        return window.appCurrentYear;
    }
    return new Date().getFullYear();
}

async function triggerSyncFromItemized() {
    const apiBase = getApiBasePath();
    const year = selectedYear || getCurrentYearFromGlobal();
    try {
        await fetch(`${apiBase}/api/monthly-expenses/sync-from-itemized.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ year }),
        });
    } catch { /* ignore */ }
}

async function loadMonthlyExpensesData() {
    const apiBase = getApiBasePath();
    try {
        await triggerSyncFromItemized();
        const res = await fetch(`${apiBase}/api/monthly-expenses/list.php?year=${selectedYear || getCurrentYearFromGlobal()}`, { credentials: 'same-origin' });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
            monthlyExpensesRows = data.data;
        } else {
            monthlyExpensesRows = [];
        }
    } catch {
        monthlyExpensesRows = [];
    }
}

function formatCurrency(value) {
    if (value === null || value === undefined || value === '' || isNaN(value)) {
        return '₱0.00';
    }
    return currencyFormatter.format(value || 0);
}

function getFilteredRows() {
    const trimmed = searchTerm.trim().toLowerCase();
    let filtered = monthlyExpensesRows;

    // Filter by search term (Account Title or G/L Code)
    if (trimmed) {
        filtered = monthlyExpensesRows.filter((row) => {
            const gl = String(row.glCode || '').toLowerCase();
            const title = String(row.accountTitle || '').toLowerCase();
            return gl.includes(trimmed) || title.includes(trimmed);
        });
    }

    // Filter by selected account title
    if (selectedAccountTitle) {
        filtered = filtered.filter((row) => {
            return row.accountTitle === selectedAccountTitle;
        });
    }

    return filtered;
}

function calculateTotal(row) {
    const total = monthKeys.reduce((sum, month) => {
        return sum + (row.months[month] || 0);
    }, 0);
    return total;
}

// START: Dynamic Carousel Rendering for Account Titles
let currentCarouselSlide = 0;
let carouselTouchStartX = 0;
let carouselTouchEndX = 0;
let carouselDragActive = false;

function renderAccountCardsCarousel() {
    const track = document.getElementById('monthlyCarouselTrack');
    const indicators = document.getElementById('monthlyCarouselIndicators');
    const section = document.getElementById('monthlyAccountCarouselSection');
    if (!track || !indicators || !section) return;

    // Get active rows filtered by search term and selected account title
    const activeRows = getFilteredRows();
    if (!activeRows.length) {
        section.classList.add('hidden');
        return;
    }
    section.classList.remove('hidden');

    // Group accounts into slides of 4 cards each
    const cardsPerSlide = 4;
    const slides = [];
    for (let i = 0; i < activeRows.length; i += cardsPerSlide) {
        slides.push(activeRows.slice(i, i + cardsPerSlide));
    }

    if (currentCarouselSlide >= slides.length) {
        currentCarouselSlide = 0;
    }

    // Dynamic rich colors palette for distinct account cards across all carousel slides
    const cardThemes = [
        { bg: 'bg-[#1e40af]', text: 'text-blue-100', footer: 'text-amber-300', icon: 'peso' },       // Deep Navy/Blue
        { bg: 'bg-[#0f766e]', text: 'text-teal-100', footer: 'text-emerald-300', icon: 'trend' },    // Forest Teal
        { bg: 'bg-[#d97706]', text: 'text-amber-100', footer: 'text-yellow-200', icon: 'expenses' }, // Vibrant Amber
        { bg: 'bg-[#be123c]', text: 'text-rose-100', footer: 'text-rose-200', icon: 'scale' },       // Deep Rose
        { bg: 'bg-[#4338ca]', text: 'text-indigo-100', footer: 'text-indigo-200', icon: 'peso' },    // Royal Indigo
        { bg: 'bg-[#047857]', text: 'text-emerald-100', footer: 'text-emerald-200', icon: 'trend' },// Emerald Green
        { bg: 'bg-[#7c2d12]', text: 'text-orange-100', footer: 'text-amber-200', icon: 'expenses' }, // Rich Sienna/Rust
        { bg: 'bg-[#6d28d9]', text: 'text-purple-100', footer: 'text-purple-200', icon: 'scale' },   // Deep Violet
        { bg: 'bg-[#0369a1]', text: 'text-sky-100', footer: 'text-sky-200', icon: 'peso' },          // Sky Blue
        { bg: 'bg-[#0e7490]', text: 'text-cyan-100', footer: 'text-cyan-200', icon: 'trend' },       // Cyan Teal
        { bg: 'bg-[#9d174d]', text: 'text-pink-100', footer: 'text-pink-200', icon: 'expenses' },    // Crimson Pink
        { bg: 'bg-[#334155]', text: 'text-slate-100', footer: 'text-emerald-300', icon: 'scale' }    // Slate Indigo
    ];

    const getWatermarkSvg = (type) => {
        if (type === 'peso') {
            return `
                <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 4h7a4.5 4.5 0 0 1 0 9H7V4z" />
                    <path d="M7 13v7" />
                    <line x1="4" y1="7.5" x2="16" y2="7.5" />
                    <line x1="4" y1="10.5" x2="16" y2="10.5" />
                </svg>
            `;
        }
        if (type === 'trend') {
            return `
                <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 15v4m3-6v6M6 8.5 10.5 5 14 7.5 18 4m0 0h-3.5M18 4v3" />
                    <circle cx="15" cy="15" r="5" />
                    <path d="M13.2 12.8h2.3a1.5 1.5 0 0 1 0 3h-2.3v2.2" stroke-width="1.6" />
                    <line x1="12.2" y1="14.1" x2="16.6" y2="14.1" stroke-width="1.4" />
                    <line x1="12.2" y1="15.4" x2="16.6" y2="15.4" stroke-width="1.4" />
                </svg>
            `;
        }
        if (type === 'scale') {
            return `
                <svg class="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
            `;
        }
        return `
            <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor">
                <g>
                    <path d="m11.828 17.343c-.066 0-.133-.013-.198-.041-3.116-1.347-5.13-4.41-5.13-7.802 0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5c0 2.831-1.403 5.467-3.754 7.052-.228.154-.539.094-.694-.135-.154-.229-.094-.54.135-.694 2.074-1.399 3.313-3.725 3.313-6.223 0-4.136-3.364-7.5-7.5-7.5s-7.5 3.364-7.5 7.5c0 2.993 1.777 5.695 4.526 6.884.254.11.37.404.261.657-.081.189-.266.302-.459.302z"/>
                    <path d="m11 21c-.128 0-.256-.049-.354-.146l-10-10c-.195-.195-.195-.512 0-.707s.512-.195.707 0l9.647 9.646 3.646-3.646c.195-.195.512-.195.707 0l3.5 3.5c.195.195.195.512 0 .707s-.512.195-.707 0l-3.146-3.147-3.646 3.646c-.098.098-.226.147-.354.147z"/>
                    <path d="m21 23h-5c-.202 0-.385-.122-.462-.309-.078-.187-.035-.402.108-.545l5-5c.143-.144.357-.187.545-.108.187.077.309.26.309.462v5c0 .276-.224.5-.5.5zm-3.793-1h3.293v-3.293z"/>
                </g>
            </svg>
        `;
    };

    track.innerHTML = slides.map((group, slideIdx) => {
        const isCurrent = slideIdx === currentCarouselSlide;
        return `
            <div class="carousel-slide duration-500 ease-in-out ${isCurrent ? 'block opacity-100' : 'hidden opacity-0'} transition-opacity" data-slide-index="${slideIdx}">
                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
                    ${group.map((row, cardIdx) => {
                        const totalSpent = calculateTotal(row);
                        const globalCardIdx = slideIdx * cardsPerSlide + cardIdx;
                        const theme = cardThemes[globalCardIdx % cardThemes.length];
                        const displayIndex = String(globalCardIdx + 1).padStart(2, '0');
                        return `
                            <div class="relative overflow-hidden ${theme.bg} text-white p-5 pt-4 sm:p-6 sm:pt-5 min-h-[175px] sm:min-h-[170px] shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between cursor-pointer select-none" data-card-gl="${row.glCode}">
                                <!-- Background Watermark Icon -->
                                <div class="absolute -right-5 -bottom-5 w-40 h-40 opacity-15 pointer-events-none transform -rotate-12 select-none flex items-center justify-center">
                                    ${getWatermarkSvg(theme.icon)}
                                </div>

                                <!-- Top Row: Card Index -->
                                <div class="flex items-center justify-end relative z-10 mb-1">
                                    <span class="text-xs sm:text-sm font-black tracking-widest text-white/70 font-mono">${displayIndex}</span>
                                </div>

                                <!-- Card Body: Label & Value -->
                                <div class="relative z-10 -mt-2 mb-3">
                                    <div class="relative inline-block max-w-full">
                                        <p class="text-xs font-black uppercase tracking-wider ${theme.text} truncate cursor-help" data-account-tooltip="TOTAL ${row.accountTitle}">TOTAL ${row.accountTitle}</p>
                                    </div>
                                    <h3 class="financial-amount financial-amount-hover text-2xl sm:text-3xl font-bold group-hover:font-black text-white mt-1 block origin-left truncate tabular-nums transition-[font-weight,transform,opacity] duration-200" data-rolling-value="${totalSpent}">
                                        ${formatCurrency(0)}
                                    </h3>
                                </div>

                                <!-- Footer Row -->
                                <div class="relative z-10 flex items-center justify-between text-[11px] font-bold text-white/80 pt-2.5 border-t border-white/15">
                                    <span class="${theme.footer}">Annual allocation</span>
                                    <div class="flex items-center gap-1">
                                        <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l2 2" />
                                        </svg>
                                        <span>JAN - DEC</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');

    // Indicators rendering
    if (slides.length > 1) {
        indicators.innerHTML = slides.map((_, idx) => `
            <button type="button" class="w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentCarouselSlide ? 'bg-[#224796] w-6' : 'bg-slate-300 hover:bg-slate-400'}" aria-label="Slide ${idx + 1}" data-slide-to="${idx}"></button>
        `).join('');

        indicators.querySelectorAll('[data-slide-to]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const targetSlide = parseInt(btn.getAttribute('data-slide-to') || '0', 10);
                goToCarouselSlide(targetSlide);
            });
        });
    } else {
        indicators.innerHTML = '';
    }

    setupCarouselTouchDrag(track, slides.length);
    animateActiveSlideCounters();
    setupAccountCardTooltips();
}

const activeCardAnimations = new Map();

function animateRollingElement(el, targetValue, duration = 800) {
    if (!el) return;

    if (activeCardAnimations.has(el)) {
        cancelAnimationFrame(activeCardAnimations.get(el));
        activeCardAnimations.delete(el);
    }

    const start = performance.now();
    const startValue = 0;
    const finalNumeric = Number(targetValue || 0);

    const step = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = startValue + (finalNumeric - startValue) * ease;

        el.textContent = formatCurrency(currentVal);

        if (progress < 1) {
            const frameId = requestAnimationFrame(step);
            activeCardAnimations.set(el, frameId);
        } else {
            el.textContent = formatCurrency(finalNumeric);
            activeCardAnimations.delete(el);
        }
    };

    const initialFrame = requestAnimationFrame(step);
    activeCardAnimations.set(el, initialFrame);
}

function animateActiveSlideCounters() {
    const track = document.getElementById('monthlyCarouselTrack');
    if (!track) return;

    const activeSlide = track.querySelector(`.carousel-slide[data-slide-index="${currentCarouselSlide}"]`);
    if (!activeSlide) return;

    activeSlide.querySelectorAll('[data-rolling-value]').forEach((el) => {
        const targetVal = parseFloat(el.getAttribute('data-rolling-value') || '0');
        animateRollingElement(el, targetVal);
    });
}

function goToCarouselSlide(index) {
    const track = document.getElementById('monthlyCarouselTrack');
    const indicators = document.getElementById('monthlyCarouselIndicators');
    if (!track) return;

    const slides = track.querySelectorAll('.carousel-slide');
    if (!slides.length) return;

    currentCarouselSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, idx) => {
        if (idx === currentCarouselSlide) {
            slide.classList.remove('hidden', 'opacity-0');
            slide.classList.add('block', 'opacity-100');
        } else {
            slide.classList.add('hidden', 'opacity-0');
            slide.classList.remove('block', 'opacity-100');
        }
    });

    if (indicators) {
        const dots = indicators.querySelectorAll('button');
        dots.forEach((dot, idx) => {
            if (idx === currentCarouselSlide) {
                dot.className = 'w-6 h-2.5 rounded-full bg-[#224796] transition-all duration-300 cursor-pointer';
            } else {
                dot.className = 'w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-all duration-300 cursor-pointer';
            }
        });
    }

    animateActiveSlideCounters();
    setupAccountCardTooltips();
}

let cardTooltipEl = null;

function setupAccountCardTooltips() {
    if (!cardTooltipEl) {
        cardTooltipEl = document.createElement('div');
        cardTooltipEl.id = 'dynamicCardAccountTooltip';
        cardTooltipEl.className = 'pointer-events-none fixed z-[99999] hidden max-w-xs whitespace-normal rounded-lg bg-slate-900/95 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-white shadow-2xl border border-slate-700/80 leading-snug transition-opacity duration-150';
        document.body.appendChild(cardTooltipEl);
    }

    const items = document.querySelectorAll('[data-account-tooltip]');
    items.forEach((item) => {
        if (item.dataset.tooltipBound) return;
        item.dataset.tooltipBound = 'true';

        item.addEventListener('mouseenter', (e) => {
            const text = item.getAttribute('data-account-tooltip');
            if (!text || !cardTooltipEl) return;
            cardTooltipEl.textContent = text;
            cardTooltipEl.classList.remove('hidden');
            cardTooltipEl.style.opacity = '1';
            positionTooltip(e);
        });

        item.addEventListener('mousemove', (e) => {
            positionTooltip(e);
        });

        item.addEventListener('mouseleave', () => {
            if (cardTooltipEl) {
                cardTooltipEl.classList.add('hidden');
                cardTooltipEl.style.opacity = '0';
            }
        });
    });

    function positionTooltip(e) {
        if (!cardTooltipEl || cardTooltipEl.classList.contains('hidden')) return;

        const offset = 14;
        const tooltipWidth = cardTooltipEl.offsetWidth || 180;
        const tooltipHeight = cardTooltipEl.offsetHeight || 36;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Default top-right of cursor
        let x = e.clientX + offset;
        let y = e.clientY - tooltipHeight - offset;

        // Reverse to left if it exceeds the right edge
        if (x + tooltipWidth > viewportWidth - 10) {
            x = e.clientX - tooltipWidth - offset;
        }

        // Reverse to bottom if it exceeds the top edge
        if (y < 10) {
            y = e.clientY + offset;
        }

        cardTooltipEl.style.left = `${Math.max(10, x)}px`;
        cardTooltipEl.style.top = `${Math.max(10, y)}px`;
    }
}

function setupCarouselTouchDrag(track, totalSlides) {
    if (totalSlides <= 1 || track.dataset.dragBound === 'true') return;
    track.dataset.dragBound = 'true';

    // Touch events for mobile/tablets
    track.addEventListener('touchstart', (e) => {
        carouselTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        carouselTouchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, { passive: true });

    // Mouse drag events for desktop
    track.addEventListener('mousedown', (e) => {
        carouselDragActive = true;
        carouselTouchStartX = e.screenX;
        track.classList.add('cursor-grabbing');
    });

    track.addEventListener('mouseup', (e) => {
        if (!carouselDragActive) return;
        carouselDragActive = false;
        carouselTouchEndX = e.screenX;
        track.classList.remove('cursor-grabbing');
        handleSwipeGesture();
    });

    track.addEventListener('mouseleave', () => {
        carouselDragActive = false;
        track.classList.remove('cursor-grabbing');
    });

    function handleSwipeGesture() {
        const diff = carouselTouchEndX - carouselTouchStartX;
        if (Math.abs(diff) > 45) {
            if (diff < 0) {
                // Drag left -> Next slide
                goToCarouselSlide(currentCarouselSlide + 1);
            } else {
                // Drag right -> Prev slide
                goToCarouselSlide(currentCarouselSlide - 1);
            }
        }
    }
}
// END: Dynamic Carousel Rendering for Account Titles

function generateMiniChart(row) {
    const values = monthKeys.map(month => row.months[month] || 0);
    const maxValue = Math.max(...values, 1);
    const height = 24;
    
    const points = values.map((val, idx) => {
        const x = (idx / (values.length - 1)) * 100;
        const y = height - (val / maxValue) * (height - 4) - 2;
        return `${x},${y}`;
    }).join(' ');

    return `
        <div class="w-14 h-6 mx-auto flex items-center justify-center">
            <svg class="w-full h-full" viewBox="0 0 100 ${height}" preserveAspectRatio="none">
                <polyline
                    points="${points}"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-blue-600"
                />
            </svg>
        </div>
    `;
}

// START: renderSkeletonTable - Render Flowbite skeleton loading state inside table body
function renderSkeletonTable(rowsCount = 12) {
    const tbody = document.getElementById('monthlyExpensesTableBody');
    if (!tbody) return;

    const count = Math.min(Math.max(rowsCount, 3), 12);
    const skeletonRows = Array.from({ length: count }, (_, index) => `
        <tr class="${index % 2 === 1 ? 'bg-slate-50' : 'bg-white'} animate-pulse" role="status">
            <!-- G/L Code Skeleton -->
            <td class="whitespace-nowrap px-2.5 py-2.5 w-[70px] min-w-[70px]">
                <div class="h-2.5 bg-slate-200 rounded-full w-14"></div>
            </td>
            <!-- Account Title Skeleton -->
            <td class="px-2.5 py-2.5 min-w-[170px]">
                <div class="h-2.5 bg-slate-200 rounded-full w-36 sm:w-44"></div>
            </td>
            <!-- 12 Months Numbers (Rolling Skeletons) -->
            ${Array.from({ length: 12 }, () => `
                <td class="whitespace-nowrap px-2 py-2.5 text-right">
                    <div class="h-2.5 bg-slate-200 rounded-full w-14 ml-auto"></div>
                </td>
            `).join('')}
            <!-- Trend Mini-Chart Skeleton -->
            <td class="px-2 py-2 text-center whitespace-nowrap w-16">
                <div class="h-5 w-12 bg-slate-200 rounded-sm mx-auto"></div>
            </td>
        </tr>
    `).join('');

    tbody.innerHTML = skeletonRows;
}
// END: renderSkeletonTable

const activeTableCellAnimations = new Map();

function animateTableRollingNumber(el, targetValue, duration = 800) {
    if (!el) return;

    if (activeTableCellAnimations.has(el)) {
        cancelAnimationFrame(activeTableCellAnimations.get(el));
        activeTableCellAnimations.delete(el);
    }

    const start = performance.now();
    const startValue = 0;
    const finalNumeric = Number(targetValue || 0);

    const step = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = startValue + (finalNumeric - startValue) * ease;

        el.textContent = currentVal > 0 ? formatCurrency(currentVal) : '-';

        if (progress < 1) {
            const frameId = requestAnimationFrame(step);
            activeTableCellAnimations.set(el, frameId);
        } else {
            el.textContent = finalNumeric > 0 ? formatCurrency(finalNumeric) : '-';
            activeTableCellAnimations.delete(el);
        }
    };

    const initialFrame = requestAnimationFrame(step);
    activeTableCellAnimations.set(el, initialFrame);
}

function animateTableNumberCells() {
    const tbody = document.getElementById('monthlyExpensesTableBody');
    if (!tbody) return;

    tbody.querySelectorAll('[data-cell-rolling-value]').forEach((el) => {
        const val = parseFloat(el.getAttribute('data-cell-rolling-value') || '0');
        if (val > 0) {
            animateTableRollingNumber(el, val);
        } else {
            el.textContent = '-';
        }
    });
}

function renderTable() {
    const tbody = document.getElementById('monthlyExpensesTableBody');
    const summaryEl = document.getElementById('monthlyExpensesPaginationSummary');

    if (!tbody || !summaryEl) return;

    const rows = getFilteredRows();
    const total = rows.length;
    const totalPages = total > 0 ? Math.ceil(total / rowsPerPage) : 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, total);
    const visibleRows = rows.slice(startIndex, endIndex);

    tbody.innerHTML = visibleRows
        .map((row, index) => {
            const isStriped = index % 2 === 1;

            return `
                <tr class="${isStriped ? 'bg-slate-50' : 'bg-white'} hover:bg-slate-100/80 transition-colors" data-row-index="${index}" data-gl-code="${row.glCode}" data-row-id="${row.id ?? ''}">
                    <td class="whitespace-nowrap px-2.5 py-2.5 text-xs font-bold text-slate-900 w-[70px] min-w-[70px]">
                        ${row.glCode}
                    </td>
                    <td class="px-2.5 py-2.5 text-xs font-semibold text-slate-900 min-w-[170px]" data-editable="accountTitle" data-type="text" data-value="${row.accountTitle}">
                        <span class="underline decoration-slate-300 decoration-1 underline-offset-3 hover:decoration-[#224796] hover:text-[#224796] transition-colors cursor-pointer" title="${row.accountTitle}">
                            ${row.accountTitle}
                        </span>
                    </td>
                    ${monthKeys.map(month => {
                        const value = row.months[month] || 0;
                        return `
                            <td class="whitespace-nowrap px-2 py-2.5 text-[11px] sm:text-xs text-right font-money text-slate-700 tabular-nums" data-editable="month" data-month="${month}" data-type="currency" data-value="${value}" data-cell-rolling-value="${value}">
                                ${value > 0 ? formatCurrency(0) : '-'}
                            </td>
                        `;
                    }).join('')}
                    <td class="px-2 py-2 text-center whitespace-nowrap w-16">
                        ${generateMiniChart(row)}
                    </td>
                </tr>
            `;
        })
        .join('');

    if (total === 0) {
        summaryEl.textContent = 'Showing 0 to 0 of 0 entries';
    } else {
        summaryEl.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${total} entries`;
    }

    renderPagination(total, totalPages);
    renderAccountCardsCarousel();
    animateTableNumberCells();
    
    // Initialize inline editing for editable cells
    initInlineEditing();
}

// START: renderPagination - Render pagination buttons, jump input, and navigation controls
function renderPagination(total, totalPages) {
    const prevBtn = document.getElementById('monthlyExpensesPrevPage');
    const nextBtn = document.getElementById('monthlyExpensesNextPage');
    const numbersContainer = document.getElementById('monthlyExpensesPageNumbers');

    renderSmartPagination({
        container: numbersContainer,
        prevBtn,
        nextBtn,
        currentPage,
        totalPages,
        total,
        onPageChange: (newPage) => {
            currentPage = newPage;
            renderTable();
        },
    });
}
// END: renderPagination

function renderAccountTitleFilters() {
    const container = document.getElementById('accountTitleFilters');
    if (!container) return;

    // Get unique account titles
    const accountTitles = [...new Set(monthlyExpensesRows.map(row => row.accountTitle))].sort();
    
    container.innerHTML = '';

    // Add "All" option
    const allButton = document.createElement('button');
    allButton.type = 'button';
    allButton.textContent = 'All';
    allButton.className = `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
        selectedAccountTitle === ''
            ? 'bg-emerald-600 text-white'
            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
    }`;
    allButton.addEventListener('click', () => {
        selectedAccountTitle = '';
        currentPage = 1;
        renderAccountTitleFilters();
        renderTable();
    });
    container.appendChild(allButton);

    // Add account title buttons
    accountTitles.forEach(title => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = title.length > 30 ? title.substring(0, 30) + '...' : title;
        button.title = title;
        button.className = `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
            selectedAccountTitle === title
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
        }`;
        button.addEventListener('click', () => {
            selectedAccountTitle = title;
            currentPage = 1;
            renderAccountTitleFilters();
            renderTable();
        });
        container.appendChild(button);
    });
}

function renderYearSelector() {
    const yearInput = document.getElementById('monthlyExpensesYear');
    const yearUpBtn = document.getElementById('monthlyExpensesYearUp');
    const yearDownBtn = document.getElementById('monthlyExpensesYearDown');
    if (!yearInput) return;

    const currentYear = getCurrentYearFromGlobal();
    if (typeof selectedYear !== 'number' || selectedYear < 2000) selectedYear = currentYear;

    yearInput.value = selectedYear;

    const applySelectedYear = async (newYear) => {
        let val = parseInt(newYear, 10);
        if (isNaN(val) || val < 1990 || val > 2100) {
            val = selectedYear;
        }
        if (val === selectedYear && yearInput.value === String(val)) return;

        selectedYear = val;
        yearInput.value = selectedYear;

        const yearDisplay = document.getElementById('monthlyExpensesCurrentYear');
        if (yearDisplay) yearDisplay.textContent = String(selectedYear);

        renderSkeletonTable();
        await loadMonthlyExpensesData();
        renderTable();
    };

    // Keyboard support: change on blur or press Enter / Arrow keys
    yearInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            yearInput.blur();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            applySelectedYear(selectedYear + 1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            applySelectedYear(selectedYear - 1);
        }
    });

    // Mouse wheel scroll support over the year input
    yearInput.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            applySelectedYear(selectedYear + 1);
        } else if (e.deltaY > 0) {
            applySelectedYear(selectedYear - 1);
        }
    }, { passive: false });

    yearInput.addEventListener('change', () => {
        applySelectedYear(yearInput.value);
    });

    if (yearUpBtn && !yearUpBtn.dataset.bound) {
        yearUpBtn.dataset.bound = 'true';
        yearUpBtn.addEventListener('click', () => {
            applySelectedYear(selectedYear + 1);
        });
    }

    if (yearDownBtn && !yearDownBtn.dataset.bound) {
        yearDownBtn.dataset.bound = 'true';
        yearDownBtn.addEventListener('click', () => {
            applySelectedYear(selectedYear - 1);
        });
    }
}

function handleAddClick() {
    const year = selectedYear;

    showMonthlyExpensesDrawer({
        year,
        onConfirm: async ({ glCode, accountTitle, months }) => {
            const apiBase = getApiBasePath();
            try {
                const res = await fetch(`${apiBase}/api/monthly-expenses/create.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        year: selectedYear || getCurrentYearFromGlobal(),
                        glCode,
                        accountTitle,
                        months,
                    }),
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.message);
                await loadMonthlyExpensesData();
                currentPage = 1;
                renderTable();
                renderAccountTitleFilters();
                Swal.fire({
                    icon: 'success',
                    title: 'Entry added',
                    text: 'Monthly expense entry has been added successfully.',
                    confirmButtonText: 'OK',
                    customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses },
                });
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.message || 'Failed to create entry',
                    confirmButtonText: 'OK',
                    customClass: { confirmButton: sweetalertNeutralConfirmBlueClasses },
                });
            }
        },
    });
}

function handleCalculateClick() {
    const year = selectedYear || getCurrentYearFromGlobal();
    
    // Get all unique account titles for the category dropdown
    const allAccountTitles = [...new Set(monthlyExpensesRows.map(row => row.accountTitle))].sort();
    
    // Generate category selection HTML
    const categoryHTML = `
        <div class="space-y-3 text-left text-sm">
            <div class="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label class="text-sm font-medium text-slate-700 whitespace-nowrap">Category</label>
                <select
                    id="swal-calculate-category"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796] cursor-pointer"
                >
                    <option value="all">All</option>
                    ${allAccountTitles.map(title => `<option value="${title}">${title}</option>`).join('')}
                </select>
            </div>
        </div>
    `;

    Swal.fire({
        title: `Calculate Monthly Expenses (${year})`,
        html: categoryHTML,
        width: 'auto',
        padding: '1rem',
        showCancelButton: true,
        confirmButtonText: 'Calculate',
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        customClass: {
            popup: sweetalertPopupBaseClasses,
            htmlContainer: sweetalertHtmlLeftAlignedClasses,
            confirmButton: sweetalertSecondaryCancelClasses,
            cancelButton: sweetalertNeutralCancelSlateClasses,
            actions: sweetalertActionsLeftAlignedClasses,
        },
        preConfirm: () => {
            const categorySelect = document.getElementById('swal-calculate-category');
            const selectedCategory = categorySelect ? categorySelect.value : 'all';
            
            // Filter rows based on selected category
            let rowsToCalculate = monthlyExpensesRows;
            if (selectedCategory !== 'all') {
                rowsToCalculate = monthlyExpensesRows.filter(row => row.accountTitle === selectedCategory);
            }

            // Calculate totals for each month
            const monthTotals = {};
            monthKeys.forEach(monthKey => {
                monthTotals[monthKey] = rowsToCalculate.reduce((sum, row) => {
                    return sum + (row.months[monthKey] || 0);
                }, 0);
            });

            // Calculate grand total
            const grandTotal = Object.values(monthTotals).reduce((sum, val) => sum + val, 0);

            // Generate results table HTML
            const resultsHTML = `
                <div class="space-y-3 text-left text-sm">
                    <div class="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p class="text-xs font-medium text-slate-600 mb-1">Category</p>
                        <p class="text-sm font-semibold text-slate-900">${selectedCategory === 'all' ? 'All Categories' : selectedCategory}</p>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-slate-200 text-sm">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Month</th>
                                    <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Amount</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-slate-100">
                                ${monthNames.map((month, index) => {
                                    const monthKey = monthKeys[index];
                                    const value = monthTotals[monthKey] || 0;
                                    return `
                                        <tr class="hover:bg-slate-50">
                                            <td class="px-3 py-2 text-sm font-medium text-slate-900">${month}</td>
                                            <td class="px-3 py-2 text-sm text-right font-money text-slate-700">${value > 0 ? formatCurrency(value) : '-'}</td>
                                        </tr>
                                    `;
                                }).join('')}
                                <tr class="bg-slate-100 font-semibold">
                                    <td class="px-3 py-2 text-sm font-bold text-slate-900">TOTAL</td>
                                    <td class="px-3 py-2 text-sm text-right font-money font-bold text-slate-900">${formatCurrency(grandTotal)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            // Show results in a new modal
            return Swal.fire({
                title: `Calculation Results (${year})`,
                html: resultsHTML,
                width: 'auto',
                padding: '1rem',
                confirmButtonText: 'Close',
                focusConfirm: false,
                customClass: {
                    popup: sweetalertPopupBaseClasses,
                    htmlContainer: sweetalertHtmlLeftAlignedClasses,
                    confirmButton: sweetalertNeutralConfirmBlueClasses,
                },
            });
        },
    });
}

function bindEvents() {
    const searchInput = document.getElementById('monthlyExpensesSearch');
    const prevBtn = document.getElementById('monthlyExpensesPrevPage');
    const nextBtn = document.getElementById('monthlyExpensesNextPage');
    const calculateBtn = document.getElementById('monthlyExpensesCalculateBtn');
    const addBtn = document.getElementById('monthlyExpensesAddBtn');

    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const target = event.target;
            searchTerm = target.value || '';
            currentPage = 1;
            renderTable();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage <= 1) return;
            currentPage -= 1;
            renderTable();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const rows = getFilteredRows();
            const totalPages = rows.length > 0 ? Math.ceil(rows.length / rowsPerPage) : 1;
            if (currentPage >= totalPages) return;
            currentPage += 1;
            renderTable();
        });
    }

    if (calculateBtn) {
        calculateBtn.addEventListener('click', handleCalculateClick);
    }

    if (addBtn) {
        addBtn.addEventListener('click', handleAddClick);
    }
}

function applyYearBindings() {
    const year = getCurrentYearFromGlobal();
    selectedYear = year;

    const headerYear = document.getElementById('monthlyExpensesCurrentYear');
    if (headerYear) {
        headerYear.textContent = String(year);
    }
}

/**
 * Initialize inline editing for table cells
 */
function initInlineEditing() {
    const editableCells = document.querySelectorAll('#monthlyExpensesTableBody [data-editable]');
    
    editableCells.forEach(cell => {
        const row = cell.closest('tr');
        const rowId = row?.getAttribute('data-row-id');
        const glCode = row?.getAttribute('data-gl-code') || '';
        const fieldName = cell.getAttribute('data-editable');
        const fieldType = cell.getAttribute('data-type') || 'text';
        const monthKey = cell.getAttribute('data-month') || '';

        const rowData = monthlyExpensesRows.find(r => (r.id && String(r.id) === rowId) || r.glCode === glCode);
        if (!rowData) return;

        initInlineEdit(cell, {
            type: fieldType,
            rowData: rowData,
            fieldName: fieldName,
            onSave: async (newValue, oldValue, rowData, fieldName) => {
                if (fieldName === 'accountTitle') {
                    rowData.accountTitle = newValue;
                } else if (fieldName === 'month' && monthKey) {
                    rowData.months[monthKey] = parseFloat(newValue) || 0;
                    rowData.total = calculateTotal(rowData);
                } else return;

                const apiBase = getApiBasePath();
                const year = selectedYear || getCurrentYearFromGlobal();
                try {
                    if (!rowData.id) {
                        const res = await fetch(`${apiBase}/api/monthly-expenses/create.php`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'same-origin',
                            body: JSON.stringify({
                                year,
                                glCode: rowData.glCode,
                                accountTitle: rowData.accountTitle,
                                months: rowData.months,
                            }),
                        });
                        const data = await res.json();
                        if (!data.success) throw new Error(data.message);
                    } else {
                        const body = fieldName === 'accountTitle'
                            ? { id: rowData.id, accountTitle: newValue }
                            : { id: rowData.id, months: { ...rowData.months } };
                        const res = await fetch(`${apiBase}/api/monthly-expenses/update.php`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'same-origin',
                            body: JSON.stringify(body),
                        });
                        const data = await res.json();
                        if (!data.success) throw new Error(data.message);
                    }
                    await loadMonthlyExpensesData();
                } catch (err) {
                    if (fieldName === 'accountTitle') rowData.accountTitle = oldValue;
                    else if (monthKey) rowData.months[monthKey] = parseFloat(oldValue) || 0;
                    rowData.total = calculateTotal(rowData);
                }
                renderTable();
            },
            onCancel: () => {}
        });
    });
}

export async function init() {
    const table = document.getElementById('monthlyExpensesTable');
    if (!table) return;

    if (typeof window !== 'undefined') {
        window.monthlyExpensesRows = monthlyExpensesRows;
    }

    applyYearBindings();
    renderYearSelector();
    renderAccountTitleFilters();
    bindEvents();
    renderSkeletonTable();
    await loadMonthlyExpensesData();
    renderTable();
}

// Export getter function for accessing monthly expenses data
export function getMonthlyExpensesData() {
    return monthlyExpensesRows;
}

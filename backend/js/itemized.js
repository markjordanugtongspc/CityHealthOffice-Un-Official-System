import Swal from 'sweetalert2';
import { showItemizedCreateDrawer, showItemizedEditDrawer } from './modules/drawer.js';
import { renderSmartPagination } from './modules/pagination.js';
import { showVoucherModal } from './modules/modal.js';
import {
    sweetalertActionsLeftAlignedClasses,
    sweetalertHtmlLeftAlignedClasses,
    sweetalertPopupBaseClasses,
    sweetalertPrimaryConfirmClasses,
    sweetalertSecondaryCancelClasses,
} from './modules/modal.js';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================
let transactionRows = [];
let dailyTotalsMap = {};
let payeesList = [];

let selectedYear = new Date().getFullYear();
let selectedMonth = new Date().getMonth() + 1; // 1 to 12
let selectedPayee = '';
let selectedDate = ''; // 'YYYY-MM-DD' filter
let searchTerm = '';
let currentPage = 1;
const rowsPerPage = 12;

let currentCarouselSlide = 0;
let weeksInMonth = [];

// Formatters
const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const dayShortNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const dayFullNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// START: getApiBasePath - Computes the base API path for AJAX calls
function getApiBasePath() {
    const path = window.location.pathname || '/';
    const idx = path.indexOf('/frontend/');
    return idx !== -1 ? path.substring(0, idx) : path.substring(0, path.lastIndexOf('/')) || '';
}
// END: getApiBasePath

// START: formatCurrency - Formats number into PHP currency string
function formatCurrency(value) {
    if (value === null || value === undefined || value === '' || isNaN(value)) {
        return '₱0.00';
    }
    return currencyFormatter.format(value || 0);
}
// END: formatCurrency

// START: getTodayDateString - Returns current date in YYYY-MM-DD format
function getTodayDateString() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
// END: getTodayDateString

// ============================================================================
// DATA FETCHING & SYNC
// ============================================================================

// START: loadItemizedData - Fetches daily transactions from backend API
async function loadItemizedData() {
    const apiBase = getApiBasePath();
    const params = new URLSearchParams({
        year: selectedYear,
        month: selectedMonth
    });
    if (selectedPayee) {
        params.append('payee', selectedPayee);
    }

    try {
        const res = await fetch(`${apiBase}/api/itemized/list.php?${params.toString()}`, { credentials: 'same-origin' });
        const data = await res.json();
        if (data.success) {
            transactionRows = Array.isArray(data.data) ? data.data : [];
            dailyTotalsMap = data.dailyTotals || {};
            if (Array.isArray(data.payees)) {
                payeesList = data.payees;
                updatePayeeFilterOptions();
            }
        } else {
            transactionRows = [];
            dailyTotalsMap = {};
        }
    } catch (e) {
        console.error('Failed to load itemized transactions:', e);
        transactionRows = [];
        dailyTotalsMap = {};
    }
}
// END: loadItemizedData

// START: updatePayeeFilterOptions - Populates the Payee selector with distinct payees
function updatePayeeFilterOptions() {
    const select = document.getElementById('itemizedPayeeFilter');
    if (!select) return;

    const currentVal = selectedPayee;
    select.innerHTML = '<option value="">All Individuals</option>' +
        payeesList.map(p => `<option value="${p}">${p}</option>`).join('');

    if (currentVal && payeesList.includes(currentVal)) {
        select.value = currentVal;
    } else {
        select.value = '';
        selectedPayee = '';
    }
}
// END: updatePayeeFilterOptions

// ============================================================================
// WEEKS & DAILY CARDS CAROUSEL
// ============================================================================

// START: calculateAllMonthDays - Generates all days of the selected month
function calculateAllMonthDays(year, month) {
    const daysCount = new Date(year, month, 0).getDate();
    const days = [];
    const todayStr = getTodayDateString();

    for (let day = 1; day <= daysCount; day++) {
        const dObj = new Date(year, month - 1, day);
        const dayOfWeek = dObj.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateStr === todayStr;

        days.push({
            dayNumber: day,
            dateStr,
            dayOfWeek,
            dayShort: dayShortNames[dayOfWeek],
            dayFull: dayFullNames[dayOfWeek],
            isToday
        });
    }

    return days;
}
// END: calculateAllMonthDays

// START: animateRollingElement - Performs smooth numerical rolling animation
function animateRollingElement(el, targetValue, duration = 800) {
    if (!el) return;
    const startTime = performance.now();
    const startValue = 0;
    const finalNumeric = Number(targetValue || 0);

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentValue = startValue + (finalNumeric - startValue) * ease;

        el.textContent = formatCurrency(currentValue);

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            el.textContent = formatCurrency(finalNumeric);
        }
    }

    requestAnimationFrame(step);
}
// END: animateRollingElement

// START: animateTableRollingNumber - Animates rolling numbers in table cells
function animateTableRollingNumber(el, targetValue, duration = 700) {
    if (!el) return;
    const startTime = performance.now();
    const startValue = 0;
    const finalNumeric = Number(targetValue || 0);

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentValue = startValue + (finalNumeric - startValue) * ease;

        el.textContent = formatCurrency(currentValue);

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            el.textContent = formatCurrency(finalNumeric);
        }
    }

    requestAnimationFrame(step);
}
// END: animateTableRollingNumber

// START: animateTableNumberCells - Animates table amount cells
function animateTableNumberCells() {
    const tbody = document.getElementById('itemizedTableBody');
    if (!tbody) return;

    tbody.querySelectorAll('[data-cell-rolling-value]').forEach((el) => {
        const val = parseFloat(el.getAttribute('data-cell-rolling-value') || '0');
        if (val > 0) {
            animateTableRollingNumber(el, val);
        } else {
            el.textContent = formatCurrency(0);
        }
    });
}
// END: animateTableNumberCells

// START: triggerCarouselRollingAnimation - Animates all number counters in active carousel slide
function triggerCarouselRollingAnimation() {
    const track = document.getElementById('itemizedCarouselTrack');
    if (!track) return;

    const activeSlide = track.querySelector(`.carousel-slide[data-slide-index="${currentCarouselSlide}"]`);
    if (!activeSlide) return;

    activeSlide.querySelectorAll('[data-rolling-value]').forEach((el) => {
        const targetVal = parseFloat(el.getAttribute('data-rolling-value') || '0');
        animateRollingElement(el, targetVal);
    });
}
// END: triggerCarouselRollingAnimation

// Carousel dragging state variables
let carouselTouchStartX = 0;
let carouselTouchEndX = 0;
let carouselDragActive = false;

// START: setupCarouselTouchDrag - Attaches touch and mouse drag gestures to carousel track
function setupCarouselTouchDrag(track, totalSlides) {
    if (totalSlides <= 1 || track.dataset.dragBound === 'true') return;
    track.dataset.dragBound = 'true';

    // Touch events for mobile/tablet
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
        if (Math.abs(diff) > 40) {
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
// END: setupCarouselTouchDrag

// START: renderWeekCarousel - Renders 4 cards per slide in a slidable carousel
function renderWeekCarousel() {
    const track = document.getElementById('itemizedCarouselTrack');
    const indicators = document.getElementById('itemizedCarouselIndicators');
    if (!track || !indicators) return;

    const allDays = calculateAllMonthDays(selectedYear, selectedMonth);
    if (!allDays.length) {
        track.innerHTML = '<div class="p-6 text-center text-slate-500">No days available for this month.</div>';
        indicators.innerHTML = '';
        return;
    }

    // 4 cards per slide
    const cardsPerSlide = 4;
    const slides = [];
    for (let i = 0; i < allDays.length; i += cardsPerSlide) {
        slides.push(allDays.slice(i, i + cardsPerSlide));
    }

    // Default to slide containing today if current slide is 0
    const todaySlideIdx = slides.findIndex(slide => slide.some(d => d.isToday));
    if (todaySlideIdx !== -1 && currentCarouselSlide === 0) {
        currentCarouselSlide = todaySlideIdx;
    } else if (currentCarouselSlide >= slides.length) {
        currentCarouselSlide = 0;
    }

    // Dynamic rich colors palette matching monthly-expenses
    const cardThemes = [
        { bg: 'bg-[#1e40af]', text: 'text-blue-100', footer: 'text-amber-300', icon: 'peso' },       // Deep Navy/Blue
        { bg: 'bg-[#0f766e]', text: 'text-teal-100', footer: 'text-emerald-300', icon: 'trend' },    // Forest Teal
        { bg: 'bg-[#d97706]', text: 'text-amber-100', footer: 'text-yellow-200', icon: 'expenses' }, // Vibrant Amber
        { bg: 'bg-[#be123c]', text: 'text-rose-100', footer: 'text-rose-200', icon: 'scale' },       // Deep Rose
        { bg: 'bg-[#4338ca]', text: 'text-indigo-100', footer: 'text-indigo-200', icon: 'peso' },    // Royal Indigo
        { bg: 'bg-[#047857]', text: 'text-emerald-100', footer: 'text-emerald-200', icon: 'trend' },// Emerald Green
        { bg: 'bg-[#7c2d12]', text: 'text-orange-100', footer: 'text-amber-200', icon: 'expenses' }, // Rich Sienna/Rust
        { bg: 'bg-[#6d28d9]', text: 'text-purple-100', footer: 'text-purple-200', icon: 'scale' },   // Deep Violet
    ];

    const getWatermarkSvg = (type) => {
        if (type === 'peso') {
            return `<svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h7a4.5 4.5 0 0 1 0 9H7V4z"/><path d="M7 13v7"/><line x1="4" y1="7.5" x2="16" y2="7.5"/><line x1="4" y1="10.5" x2="16" y2="10.5"/></svg>`;
        }
        if (type === 'trend') {
            return `<svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15v4m3-6v6M6 8.5 10.5 5 14 7.5 18 4m0 0h-3.5M18 4v3"/><circle cx="15" cy="15" r="5"/><path d="M13.2 12.8h2.3a1.5 1.5 0 0 1 0 3h-2.3v2.2" stroke-width="1.6"/><line x1="12.2" y1="14.1" x2="16.6" y2="14.1" stroke-width="1.4"/><line x1="12.2" y1="15.4" x2="16.6" y2="15.4" stroke-width="1.4"/></svg>`;
        }
        return `<svg class="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>`;
    };

    // Render slides with 4 cards per slide
    track.innerHTML = slides.map((group, slideIdx) => {
        const isCurrent = slideIdx === currentCarouselSlide;

        return `
            <div class="carousel-slide duration-500 ease-in-out ${isCurrent ? 'block opacity-100' : 'hidden opacity-0'} transition-opacity" data-slide-index="${slideIdx}">
                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
                    ${group.map((day, cardIdx) => {
                        const globalCardIdx = slideIdx * cardsPerSlide + cardIdx;
                        const theme = cardThemes[globalCardIdx % cardThemes.length];
                        const dayTotal = dailyTotalsMap[day.dateStr] || 0;
                        const dayTxCount = transactionRows.filter(r => r.date === day.dateStr).length;
                        const isSelected = selectedDate === day.dateStr;
                        const cardHighlight = day.isToday
                            ? 'ring-3 ring-amber-300 ring-offset-2 ring-offset-slate-900 shadow-xl'
                            : (isSelected ? 'ring-3 ring-white ring-offset-2 ring-offset-blue-600 shadow-xl' : 'shadow-md');

                        return `
                            <div class="relative overflow-hidden ${theme.bg} text-white p-5 pt-4 sm:p-6 sm:pt-5 min-h-[175px] sm:min-h-[170px] shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between cursor-pointer select-none rounded-xl ${cardHighlight}"
                                 data-card-date="${day.dateStr}"
                                 title="Click to view transactions for ${day.dayFull}, ${monthNames[selectedMonth - 1]} ${day.dayNumber}">
                                <!-- Background Watermark Icon -->
                                <div class="absolute -right-5 -bottom-5 w-40 h-40 opacity-15 pointer-events-none transform -rotate-12 select-none flex items-center justify-center">
                                    ${getWatermarkSvg(theme.icon)}
                                </div>

                                <!-- Top Row: Day Abbrev & Today Badge -->
                                <div class="flex items-center justify-between relative z-10 mb-1">
                                    <span class="text-xs sm:text-sm font-black tracking-widest text-white/70 font-mono">${day.dayShort} • ${String(day.dayNumber).padStart(2, '0')}</span>
                                    ${day.isToday ? `
                                        <span class="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase text-slate-900 shadow-2xs">
                                            TODAY
                                        </span>
                                    ` : (isSelected ? `
                                        <span class="inline-flex items-center rounded-full bg-white text-blue-900 px-2 py-0.5 text-[10px] font-black uppercase shadow-2xs">
                                            FILTERED
                                        </span>
                                    ` : '')}
                                </div>

                                <!-- Card Body: Date Label & Rolling Amount -->
                                <div class="relative z-10 -mt-2 mb-3">
                                    <div class="relative inline-block max-w-full">
                                        <p class="text-xs font-black uppercase tracking-wider ${theme.text} truncate">
                                            ${day.dayFull}, ${monthNames[selectedMonth - 1].substring(0, 3)} ${day.dayNumber}
                                        </p>
                                    </div>
                                    <h3 class="financial-amount financial-amount-hover text-2xl sm:text-3xl font-bold group-hover:font-black text-white mt-1 block origin-left truncate tabular-nums transition-[font-weight,transform,opacity] duration-200"
                                        data-rolling-value="${dayTotal}">
                                        ${formatCurrency(0)}
                                    </h3>
                                </div>

                                <!-- Footer Row: Daily Total & Transaction Count -->
                                <div class="relative z-10 flex items-center justify-between text-[11px] font-bold text-white/80 pt-2.5 border-t border-white/15">
                                    <span class="${theme.footer}">Daily expenses</span>
                                    <div class="flex items-center gap-1">
                                        <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l2 2" />
                                        </svg>
                                        <span>${dayTxCount} ${dayTxCount === 1 ? 'entry' : 'entries'}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');

    // Render clickable dot indicators matching monthly-expenses
    indicators.innerHTML = slides.map((_, idx) => {
        const isActive = idx === currentCarouselSlide;
        return `
            <button type="button"
                    class="${isActive ? 'w-6 h-2.5 rounded-full bg-[#224796]' : 'w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-slate-400'} transition-all duration-300 cursor-pointer"
                    data-slide-to="${idx}"
                    aria-label="Slide ${idx + 1}">
            </button>
        `;
    }).join('');

    // Attach click events on dot indicators
    indicators.querySelectorAll('[data-slide-to]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-slide-to') || '0', 10);
            goToCarouselSlide(idx);
        });
    });

    // Attach click events on day cards
    track.querySelectorAll('[data-card-date]').forEach((card) => {
        card.addEventListener('click', (e) => {
            const dateStr = e.currentTarget.getAttribute('data-card-date');
            if (selectedDate === dateStr) {
                selectedDate = '';
            } else {
                selectedDate = dateStr;
            }
            updateDayFilterBadge();
            renderTable();
            renderWeekCarousel();
        });
    });

    // Enable touch/mouse slidable swipe gestures via cursor-pointer
    setupCarouselTouchDrag(track, slides.length);

    triggerCarouselRollingAnimation();
}
// END: renderWeekCarousel

// START: goToCarouselSlide - Transitions carousel to target slide with dot styling
function goToCarouselSlide(index) {
    const track = document.getElementById('itemizedCarouselTrack');
    const indicators = document.getElementById('itemizedCarouselIndicators');
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

    // Update dot indicators matching monthly-expenses
    if (indicators) {
        indicators.querySelectorAll('[data-slide-to]').forEach((btn, idx) => {
            if (idx === currentCarouselSlide) {
                btn.className = 'w-6 h-2.5 rounded-full bg-[#224796] transition-all duration-300 cursor-pointer';
            } else {
                btn.className = 'w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-all duration-300 cursor-pointer';
            }
        });
    }

    triggerCarouselRollingAnimation();
}
// END: goToCarouselSlide

// START: updateDayFilterBadge - Updates the filter badge on table header
function updateDayFilterBadge() {
    const badge = document.getElementById('itemizedTableDayFilterBadge');
    const textEl = document.getElementById('itemizedTableDayFilterText');
    if (!badge || !textEl) return;

    if (selectedDate) {
        const parts = selectedDate.split('-');
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const dayStr = dayFullNames[dateObj.getDay()];
        textEl.textContent = `Filtered: ${dayStr}, ${monthNames[parseInt(parts[1]) - 1].substring(0, 3)} ${parseInt(parts[2])}`;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}
// END: updateDayFilterBadge

// ============================================================================
// TABLE RENDERING & ACTIONS
// ============================================================================

// START: getFilteredRows - Filters transaction rows by search term, payee, and date
function getFilteredRows() {
    let rows = [...transactionRows];

    // Filter by specific day if card clicked
    if (selectedDate) {
        rows = rows.filter(r => r.date === selectedDate);
    }

    // Filter by payee
    if (selectedPayee) {
        rows = rows.filter(r => r.payee === selectedPayee);
    }

    // Filter by search
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        rows = rows.filter(r => {
            const gl = String(r.glCode || '').toLowerCase();
            const title = String(r.accountTitle || '').toLowerCase();
            const payee = String(r.payee || '').toLowerCase();
            const dv = String(r.dvNo || '').toLowerCase();
            const chk = String(r.checkNo || '').toLowerCase();
            const desc = String(r.description || '').toLowerCase();
            return gl.includes(term) || title.includes(term) || payee.includes(term) || dv.includes(term) || chk.includes(term) || desc.includes(term);
        });
    }

    return rows;
}
// END: getFilteredRows

// START: renderTable - Renders transaction rows with monthly-expenses table styling
function renderTable() {
    const tbody = document.getElementById('itemizedTableBody');
    const summaryEl = document.getElementById('itemizedPaginationSummary');
    const prevBtn = document.getElementById('itemizedPrevPage');
    const nextBtn = document.getElementById('itemizedNextPage');
    const numbersContainer = document.getElementById('itemizedPageNumbers');
    if (!tbody) return;

    const filtered = getFilteredRows();
    const totalEntries = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, totalEntries);
    const pageRows = filtered.slice(startIdx, endIdx);

    if (summaryEl) {
        summaryEl.textContent = totalEntries > 0
            ? `Showing ${startIdx + 1} to ${endIdx} of ${totalEntries} entries`
            : 'Showing 0 to 0 of 0 entries';
    }

    if (!pageRows.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-10 text-slate-500 font-medium">
                    <div class="flex flex-col items-center justify-center gap-2">
                        <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        <p class="text-sm">No daily expense entries found.</p>
                        <button type="button" id="itemizedEmptyAddBtn" class="mt-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer">
                            + Record your first daily expense
                        </button>
                    </div>
                </td>
            </tr>
        `;
        document.getElementById('itemizedEmptyAddBtn')?.addEventListener('click', () => {
            showItemizedCreateDrawer({
                date: selectedDate || getTodayDateString(),
                payee: selectedPayee,
                onConfirm: handleTransactionSave
            });
        });
    } else {
        tbody.innerHTML = pageRows.map((r, idx) => {
            const isZebra = idx % 2 === 1;
            const parts = (r.date || '').split('-');
            let dateLabel = r.date;
            if (parts.length === 3) {
                const dObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                dateLabel = `${dayShortNames[dObj.getDay()]}, ${monthNames[parseInt(parts[1]) - 1].substring(0, 3)} ${parseInt(parts[2])}`;
            }

            return `
                <tr class="${isZebra ? 'bg-slate-50/60' : 'bg-white'} hover:bg-blue-50/40 transition-colors">
                    <!-- Date -->
                    <td class="whitespace-nowrap px-3 py-3 text-slate-900 font-medium">
                        <div class="flex items-center gap-1.5">
                            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 font-mono">
                                ${parts[2] || '01'}
                            </span>
                            <span class="text-xs font-semibold text-slate-800">${dateLabel}</span>
                        </div>
                    </td>

                    <!-- DV No. -->
                    <td class="whitespace-nowrap px-3 py-3 font-mono text-xs font-bold text-[#224796]">
                        ${r.dvNo || '—'}
                    </td>

                    <!-- Check No. -->
                    <td class="whitespace-nowrap px-2.5 py-3 font-mono text-xs text-slate-600">
                        ${r.checkNo || '—'}
                    </td>

                    <!-- Payee / Individual -->
                    <td class="px-3 py-3">
                        <div class="flex items-center gap-2">
                            <div class="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black shrink-0">
                                ${(r.payee || 'P').charAt(0).toUpperCase()}
                            </div>
                            <span class="font-bold text-slate-900 text-xs truncate max-w-[170px]" title="${r.payee}">
                                ${r.payee}
                            </span>
                        </div>
                    </td>

                    <!-- Account Title -->
                    <td class="px-3 py-3">
                        <div class="max-w-[220px]">
                            <span class="inline-block text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded mr-1">
                                ${r.glCode || '—'}
                            </span>
                            <span class="text-xs font-semibold text-slate-800 truncate" title="${r.accountTitle || r.glCode}">
                                ${r.accountTitle || r.glCode || '—'}
                            </span>
                        </div>
                    </td>

                    <!-- Amount with Rolling Number Animation -->
                    <td class="whitespace-nowrap px-3 py-3 text-right font-mono font-bold text-slate-900 text-xs tabular-nums"
                        data-cell-rolling-value="${r.amount || 0}">
                        ${formatCurrency(0)}
                    </td>

                    <!-- Particulars -->
                    <td class="px-3 py-3 text-xs text-slate-600 max-w-[200px] truncate" title="${r.description}">
                        ${r.description || '—'}
                    </td>

                    <!-- Action -->
                    <td class="whitespace-nowrap px-3 py-3 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button type="button"
                                    class="p-1 rounded-md text-blue-600 hover:bg-blue-50 hover:text-blue-800 cursor-pointer transition-colors"
                                    data-action="edit"
                                    data-id="${r.id}"
                                    title="Edit entry"
                                    aria-label="Edit entry">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            </button>
                            <button type="button"
                                    class="p-1 rounded-md text-rose-500 hover:bg-rose-50 hover:text-rose-700 cursor-pointer transition-colors"
                                    data-action="delete"
                                    data-id="${r.id}"
                                    title="Delete entry"
                                    aria-label="Delete entry">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Attach action handlers
        tbody.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
                const item = transactionRows.find(t => t.id === id);
                if (item) {
                    showItemizedEditDrawer({
                        transaction: item,
                        onConfirm: handleTransactionSave
                    });
                }
            });
        });

        tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
                handleTransactionDelete(id);
            });
        });

        // Trigger rolling number animation on table amount cells
        animateTableNumberCells();
    }

    // Pagination controls
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }

    if (numbersContainer) {
        renderSmartPagination(numbersContainer, currentPage, totalPages, (p) => {
            currentPage = p;
            renderTable();
        });
    }
}
// END: renderTable

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

// START: handleTransactionSave - Saves created or edited transaction via API
async function handleTransactionSave(payload) {
    const apiBase = getApiBasePath();
    const isEdit = Boolean(payload.id);
    const endpoint = isEdit ? `${apiBase}/api/itemized/update.php` : `${apiBase}/api/itemized/create.php`;

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (!res.ok || !result.success) {
            throw new Error(result.message || 'Operation failed');
        }

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: isEdit ? 'Daily expense updated!' : 'Daily expense recorded!',
            showConfirmButton: false,
            timer: 2500,
            customClass: { popup: sweetalertPopupBaseClasses }
        });

        await loadItemizedData();
        renderWeekCarousel();
        renderTable();
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Error Saving Transaction',
            text: err.message,
            customClass: {
                popup: sweetalertPopupBaseClasses,
                confirmButton: sweetalertPrimaryConfirmClasses
            }
        });
    }
}
// END: handleTransactionSave

// START: handleTransactionDelete - Confirms and deletes a transaction entry
async function handleTransactionDelete(id) {
    const item = transactionRows.find(t => t.id === id);
    const payeeName = item ? item.payee : 'this transaction';

    const confirm = await Swal.fire({
        title: 'Delete Daily Expense?',
        text: `Are you sure you want to remove the expense record for "${payeeName}"? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete Entry',
        cancelButtonText: 'Cancel',
        customClass: {
            popup: sweetalertPopupBaseClasses,
            actions: sweetalertActionsLeftAlignedClasses,
            confirmButton: 'bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg px-4 py-2 cursor-pointer',
            cancelButton: sweetalertSecondaryCancelClasses
        }
    });

    if (!confirm.isConfirmed) return;

    const apiBase = getApiBasePath();
    try {
        const res = await fetch(`${apiBase}/api/itemized/delete.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ id })
        });
        const result = await res.json();
        if (!res.ok || !result.success) {
            throw new Error(result.message || 'Failed to delete transaction');
        }

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Transaction deleted',
            showConfirmButton: false,
            timer: 2000,
            customClass: { popup: sweetalertPopupBaseClasses }
        });

        await loadItemizedData();
        renderWeekCarousel();
        renderTable();
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: err.message,
            customClass: {
                popup: sweetalertPopupBaseClasses,
                confirmButton: sweetalertPrimaryConfirmClasses
            }
        });
    }
}
// END: handleTransactionDelete

// START: handleAddNewPayeeQuick - Prompts user to enter new payee and launches create drawer
async function handleAddNewPayeeQuick() {
    const { value: newPayee } = await Swal.fire({
        title: 'New Individual / Payee',
        text: 'Enter the individual or payee name to record daily expenses for:',
        input: 'text',
        inputPlaceholder: 'e.g. Dr. Juan Dela Cruz',
        showCancelButton: true,
        confirmButtonText: 'Continue to Entry',
        cancelButtonText: 'Cancel',
        customClass: {
            popup: sweetalertPopupBaseClasses,
            input: 'w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm font-semibold text-slate-900',
            confirmButton: sweetalertPrimaryConfirmClasses,
            cancelButton: sweetalertSecondaryCancelClasses
        },
        inputValidator: (val) => {
            if (!val || !val.trim()) {
                return 'Please enter a payee name';
            }
        }
    });

    if (newPayee && newPayee.trim()) {
        const trimmed = newPayee.trim();
        // Immediately open drawer with this payee pre-filled
        showItemizedCreateDrawer({
            date: selectedDate || getTodayDateString(),
            payee: trimmed,
            onConfirm: handleTransactionSave
        });
    }
}
// END: handleAddNewPayeeQuick

// ============================================================================
// INITIALIZATION & EVENT LISTENERS
// ============================================================================

// START: updateHeaderDateDisplay - Updates the Month & Year title in header
function updateHeaderDateDisplay() {
    const el = document.getElementById('itemizedExpensesCurrentMonthYear');
    if (el) {
        el.textContent = `${monthNames[selectedMonth - 1]} ${selectedYear}`;
    }
}
// END: updateHeaderDateDisplay

// START: initItemizedPage - Initializes all DOM listeners and loads initial dataset
export async function initItemizedPage() {
    updateHeaderDateDisplay();

    // Month Selector
    const monthSelect = document.getElementById('itemizedMonth');
    if (monthSelect) {
        monthSelect.value = String(selectedMonth);
        monthSelect.addEventListener('change', async (e) => {
            selectedMonth = parseInt(e.target.value, 10);
            selectedDate = ''; // reset day filter
            currentCarouselSlide = 0;
            updateHeaderDateDisplay();
            updateDayFilterBadge();
            await loadItemizedData();
            renderWeekCarousel();
            renderTable();
        });
    }

    // Year Input & Steppers
    const yearInput = document.getElementById('itemizedYear');
    const yearUp = document.getElementById('itemizedYearUp');
    const yearDown = document.getElementById('itemizedYearDown');

    if (yearInput) {
        yearInput.value = selectedYear;
        yearInput.addEventListener('change', async (e) => {
            const val = parseInt(e.target.value, 10);
            if (val >= 2000 && val <= 2099) {
                selectedYear = val;
                selectedDate = '';
                currentCarouselSlide = 0;
                updateHeaderDateDisplay();
                updateDayFilterBadge();
                await loadItemizedData();
                renderWeekCarousel();
                renderTable();
            }
        });
    }

    if (yearUp) {
        yearUp.addEventListener('click', async () => {
            selectedYear++;
            if (yearInput) yearInput.value = selectedYear;
            selectedDate = '';
            currentCarouselSlide = 0;
            updateHeaderDateDisplay();
            updateDayFilterBadge();
            await loadItemizedData();
            renderWeekCarousel();
            renderTable();
        });
    }

    if (yearDown) {
        yearDown.addEventListener('click', async () => {
            selectedYear--;
            if (yearInput) yearInput.value = selectedYear;
            selectedDate = '';
            currentCarouselSlide = 0;
            updateHeaderDateDisplay();
            updateDayFilterBadge();
            await loadItemizedData();
            renderWeekCarousel();
            renderTable();
        });
    }

    // Payee Filter Select
    const payeeSelect = document.getElementById('itemizedPayeeFilter');
    if (payeeSelect) {
        payeeSelect.addEventListener('change', async (e) => {
            selectedPayee = e.target.value;
            currentPage = 1;
            await loadItemizedData();
            renderWeekCarousel();
            renderTable();
        });
    }

    // Quick Add Payee Button
    const addPayeeQuickBtn = document.getElementById('itemizedAddPayeeQuickBtn');
    if (addPayeeQuickBtn) {
        addPayeeQuickBtn.addEventListener('click', handleAddNewPayeeQuick);
    }

    // Add Entry Button
    const addBtn = document.getElementById('itemizedAddBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            showItemizedCreateDrawer({
                date: selectedDate || getTodayDateString(),
                payee: selectedPayee,
                onConfirm: handleTransactionSave
            });
        });
    }

    // Clear Day Filter Button
    const clearDayFilterBtn = document.getElementById('itemizedClearDayFilterBtn');
    if (clearDayFilterBtn) {
        clearDayFilterBtn.addEventListener('click', () => {
            selectedDate = '';
            updateDayFilterBadge();
            renderWeekCarousel();
            renderTable();
        });
    }

    // Search Input
    const searchInput = document.getElementById('itemizedSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.trim();
            currentPage = 1;
            renderTable();
        });
    }

    // Pagination buttons
    const prevBtn = document.getElementById('itemizedPrevPage');
    const nextBtn = document.getElementById('itemizedNextPage');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const filtered = getFilteredRows();
            const totalPages = Math.ceil(filtered.length / rowsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
    }

    // Floating Voucher Button
    const voucherFloatingBtn = document.getElementById('itemizedVoucherFloatingBtn');
    if (voucherFloatingBtn) {
        voucherFloatingBtn.addEventListener('click', () => {
            showVoucherModal();
        });
    }

    // Initial Load
    await loadItemizedData();
    renderWeekCarousel();
    renderTable();
}
// END: initItemizedPage

// START: init - Default route loader init export
export async function init() {
    await initItemizedPage();
}
// END: init

// Auto-run if on itemized page
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.location.pathname.includes('itemized')) {
                initItemizedPage();
            }
        });
    } else {
        if (window.location.pathname.includes('itemized')) {
            initItemizedPage();
        }
    }
}

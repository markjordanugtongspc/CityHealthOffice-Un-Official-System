import { showFundDownloadedDrawer, showFundDownloadedCalculateDrawer } from './modules/drawer.js';
import { renderSmartPagination } from './modules/pagination.js';
import { initInlineEdit } from './modules/inline-edit.js';
import { showStackedToast } from './modules/toast.js';

// Fund Downloaded data model
let fundDownloadedRows = [];

// State
let currentPage = 1;
const rowsPerPage = 12;
let searchTerm = '';
let selectedCategory = 'all';
let selectedYear = new Date().getFullYear();

// Month names and keys
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

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

async function loadFundDownloadedData() {
    const apiBase = getApiBasePath();
    const year = selectedYear || getCurrentYearFromGlobal();
    try {
        const catQuery = selectedCategory !== 'all' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
        const res = await fetch(`${apiBase}/api/fund-downloaded/list.php?year=${year}${catQuery}`, { credentials: 'same-origin' });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
            fundDownloadedRows = data.data;
        } else {
            console.error('Failed to load fund-downloaded list:', data);
            fundDownloadedRows = [];
        }
    } catch (err) {
        console.error('Error fetching fund-downloaded list:', err);
        fundDownloadedRows = [];
    }
}

function formatCurrency(value) {
    if (value === null || value === undefined || value === '' || isNaN(value)) {
        return '₱0.00';
    }
    return currencyFormatter.format(value || 0);
}

function getCategoryBadge(cat) {
    switch (cat) {
        case 'mooe':
            return '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">MOOE</span>';
        case 'sp-philhealth':
            return '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">PhilHealth</span>';
        case 'sp-ntp':
            return '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">SPF NTP</span>';
        case 'sp-mcp':
            return '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">MCP</span>';
        case 'sp-konsulta':
            return '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Konsulta</span>';
        default:
            return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">${escapeHtml(cat)}</span>`;
    }
}

function getFilteredRows() {
    const trimmed = searchTerm.trim().toLowerCase();
    let filtered = fundDownloadedRows;

    if (trimmed) {
        filtered = fundDownloadedRows.filter((row) => {
            const gl = String(row.glCode || '').toLowerCase();
            const title = String(row.programTitle || '').toLowerCase();
            const cat = String(row.category || '').toLowerCase();
            return gl.includes(trimmed) || title.includes(trimmed) || cat.includes(trimmed);
        });
    }

    if (selectedCategory && selectedCategory !== 'all') {
        filtered = filtered.filter((row) => row.category === selectedCategory);
    }

    return filtered;
}

function calculateTotal(row) {
    return monthKeys.reduce((sum, month) => sum + (Number(row.months?.[month]) || 0), 0);
}

function renderTable() {
    const tbody = document.getElementById('fundDownloadedTableBody');
    const summaryEl = document.getElementById('fundDownloadedPaginationSummary');
    if (!tbody) return;

    const filtered = getFilteredRows();
    const totalEntries = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));

    if (currentPage > totalPages) currentPage = totalPages;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalEntries);
    const paginatedRows = filtered.slice(startIndex, endIndex);

    if (summaryEl) {
        if (totalEntries === 0) {
            summaryEl.textContent = 'Showing 0 to 0 of 0 entries';
        } else {
            summaryEl.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalEntries} entries`;
        }
    }

    if (paginatedRows.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="17" class="px-6 py-12 text-center text-slate-500">
                    <div class="flex flex-col items-center justify-center gap-2">
                        <svg class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                        </svg>
                        <p class="text-sm font-medium">No downloaded fund entries found</p>
                        <p class="text-xs text-slate-400">Try adjusting your filters or click "Add Fund" to record new allocations.</p>
                    </div>
                </td>
            </tr>
        `;
        renderPaginationControls(totalPages);
        return;
    }

    tbody.innerHTML = paginatedRows.map((row) => {
        const total = calculateTotal(row);
        const spent = Number(row.spent) || 0;
        const remaining = Math.max(0, total - spent);

        const monthCells = monthKeys.map((m) => {
            const val = row.months?.[m] ?? 0;
            const displayVal = val > 0 ? formatCurrency(val).replace('₱', '') : '-';
            const tooltipText = val > 0 ? 'Double-click to edit amount' : 'Double-click to add amount';
            return `
                <td class="relative px-2 py-3 text-right font-mono text-xs tabular-nums text-slate-700 hover:bg-rose-50/50 hover:text-[#224796] cursor-pointer transition-colors select-none"
                    data-editable="true"
                    data-id="${row.id}"
                    data-field="${m}"
                    data-raw="${val}"
                    title="${tooltipText}">
                    ${displayVal}
                </td>
            `;
        }).join('');

        const safeTitle = escapeHtml(row.programTitle || '');
        const safeGl = escapeHtml(row.glCode || '');

        return `
            <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                <td class="px-2.5 py-3 whitespace-nowrap">
                    ${getCategoryBadge(row.category)}
                </td>
                <td class="px-2.5 py-3 font-mono text-xs font-bold text-[#224796] whitespace-nowrap">
                    ${safeGl}
                </td>
                <td class="px-2.5 py-3 font-medium text-slate-900 max-w-[240px]">
                    <span class="inline-block truncate max-w-full underline decoration-slate-300 underline-offset-4 cursor-default font-semibold" title="${safeTitle}">
                        ${safeTitle}
                    </span>
                </td>
                ${monthCells}
                <td class="px-2.5 py-3 text-right font-mono text-xs font-bold text-[#224796] tabular-nums whitespace-nowrap">
                    ${formatCurrency(total)}
                </td>
                <td class="px-2.5 py-3 text-right font-mono text-xs font-bold ${remaining > 0 ? 'text-emerald-600' : 'text-slate-500'} tabular-nums whitespace-nowrap">
                    ${formatCurrency(remaining)}
                </td>
            </tr>
        `;
    }).join('');

    renderPaginationControls(totalPages);
    attachInlineEdit();
}

function attachInlineEdit() {
    const tableBody = document.getElementById('fundDownloadedTableBody');
    if (!tableBody) return;

    tableBody.querySelectorAll('[data-editable="true"]').forEach((cell) => {
        cell.addEventListener('dblclick', function () {
            if (this.querySelector('input')) return;

            const id = this.dataset.id;
            const field = this.dataset.field;
            const raw = parseFloat(this.dataset.raw) || 0;

            const originalHtml = this.innerHTML;
            const input = document.createElement('input');
            input.type = 'text';
            input.inputMode = 'decimal';
            const initialFormatted = raw > 0 ? formatNumberWithCommas(raw) : '';
            input.value = initialFormatted;
            input.className = 'px-2 py-1 text-right font-mono text-xs font-bold bg-white border-2 border-[#224796] rounded-md focus:outline-none focus:ring-2 focus:ring-[#224796]/20 text-slate-900 shadow-lg absolute right-1 top-1/2 -translate-y-1/2 z-30 transition-all';
            input.placeholder = '0.00';

            // Auto-expand input width dynamically based on content length
            const adjustWidth = () => {
                const len = Math.max(input.value.length || 0, input.placeholder.length || 4, 6);
                input.style.width = `${Math.min(220, Math.max(76, len * 9 + 24))}px`;
            };

            adjustWidth();

            input.addEventListener('input', (e) => {
                let val = e.target.value.replace(/[^0-9.]/g, '');
                const parts = val.split('.');
                if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                if (parts[0]) parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                e.target.value = parts.join('.');
                adjustWidth();
            });

            this.style.position = 'relative';
            this.innerHTML = '';
            this.appendChild(input);
            input.focus();
            input.select();

            let committed = false;
            const commit = async () => {
                if (committed) return;
                committed = true;

                const cleanVal = parseFloat(input.value.replace(/,/g, '')) || 0;
                this.innerHTML = cleanVal > 0 ? formatCurrency(cleanVal).replace('₱', '') : '-';
                this.dataset.raw = cleanVal;
                this.setAttribute('title', cleanVal > 0 ? 'Double-click to edit amount' : 'Double-click to add amount');

                // Update in memory
                const row = fundDownloadedRows.find((r) => String(r.id) === String(id));
                if (row) {
                    if (!row.months) row.months = {};
                    row.months[field] = cleanVal;
                    row.total = calculateTotal(row);
                }

                // Send to API
                try {
                    const apiBase = getApiBasePath();
                    await fetch(`${apiBase}/api/fund-downloaded/update.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'same-origin',
                        body: JSON.stringify({ id: Number(id), field, value: cleanVal }),
                    });
                } catch (e) {
                    console.error('Failed to update fund cell:', e);
                }

                renderCarousel();
                renderTable();
            };

            input.addEventListener('blur', commit);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    input.blur();
                } else if (e.key === 'Escape') {
                    committed = true;
                    this.innerHTML = originalHtml;
                }
            });
        });
    });
}

function formatNumberWithCommas(num) {
    if (!num && num !== 0) return '';
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

function renderPaginationControls(totalPages) {
    const pageNumbersEl = document.getElementById('fundDownloadedPageNumbers');
    const prevBtn = document.getElementById('fundDownloadedPrevPage');
    const nextBtn = document.getElementById('fundDownloadedNextPage');

    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        };
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        };
    }

    if (pageNumbersEl) {
        renderSmartPagination(pageNumbersEl, currentPage, totalPages, (page) => {
            currentPage = page;
            renderTable();
        });
    }
}

// START: Dynamic Carousel Rendering for Month Summary Cards
let currentCarouselSlide = 0;
let carouselTouchStartX = 0;
let carouselTouchEndX = 0;
let carouselDragActive = false;

// 12 distinct custom color themes for the months carousel with 12 100% UNIQUE healthcare & financial watermarks
const monthCardThemes = [
    { bg: 'bg-[#1e40af]', text: 'text-blue-100', footer: 'text-amber-300', icon: 'peso' },         // Jan (01) - Philippine Peso
    { bg: 'bg-[#0f766e]', text: 'text-teal-100', footer: 'text-emerald-300', icon: 'heartbeat' },  // Feb (02) - Health Pulse / ECG
    { bg: 'bg-[#d97706]', text: 'text-amber-100', footer: 'text-yellow-200', icon: 'shield' },     // Mar (03) - Medical Shield / Health Security
    { bg: 'bg-[#be123c]', text: 'text-rose-100', footer: 'text-rose-200', icon: 'hospital' },     // Apr (04) - Hospital / Clinic Facility
    { bg: 'bg-[#4338ca]', text: 'text-indigo-100', footer: 'text-indigo-200', icon: 'building' },  // May (05) - City Hall / Government Institution
    { bg: 'bg-[#047857]', text: 'text-emerald-100', footer: 'text-emerald-200', icon: 'trend' },  // Jun (06) - Trend Analytics / Performance
    { bg: 'bg-[#7c2d12]', text: 'text-orange-100', footer: 'text-amber-200', icon: 'stethoscope' },// Jul (07) - Medical Stethoscope
    { bg: 'bg-[#6d28d9]', text: 'text-purple-100', footer: 'text-purple-200', icon: 'scale' },     // Aug (08) - Scales of Balance
    { bg: 'bg-[#0369a1]', text: 'text-sky-100', footer: 'text-sky-200', icon: 'clipboard' },      // Sep (09) - Program Checklist / Audit
    { bg: 'bg-[#0e7490]', text: 'text-cyan-100', footer: 'text-cyan-200', icon: 'firstaid' },      // Oct (10) - First Aid Kit / Emergency Medical
    { bg: 'bg-[#9d174d]', text: 'text-pink-100', footer: 'text-pink-200', icon: 'vault' },        // Nov (11) - Secure Vault / Allocated Fund
    { bg: 'bg-[#334155]', text: 'text-slate-100', footer: 'text-emerald-300', icon: 'calendar' }   // Dec (12) - Annual Calendar / Year-End
];

const getWatermarkSvg = (type) => {
    switch (type) {
        case 'peso':
            return `
                <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 4h7a4.5 4.5 0 0 1 0 9H7V4z" />
                    <path d="M7 13v7" />
                    <line x1="4" y1="7.5" x2="16" y2="7.5" />
                    <line x1="4" y1="10.5" x2="16" y2="10.5" />
                </svg>
            `;
        case 'heartbeat':
            return `
                <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
            `;
        case 'shield':
            return `
                <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <line x1="12" y1="8" x2="12" y2="14" />
                    <line x1="9" y1="11" x2="15" y2="11" />
                </svg>
            `;
        case 'hospital':
            return `
                <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 21h18" />
                    <path d="M5 21V7l8-4v18" />
                    <path d="M19 21V11l-6-4" />
                    <path d="M9 10h2" />
                    <path d="M10 9v2" />
                </svg>
            `;
        case 'building':
            return `
                <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
                    <path d="M2 20h20" />
                    <path d="M14 12v.01" />
                    <path d="M14 16v.01" />
                    <path d="M14 8v.01" />
                    <path d="M10 12v.01" />
                    <path d="M10 16v.01" />
                    <path d="M10 8v.01" />
                </svg>
            `;
        case 'trend':
            return `
                <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 15v4m3-6v6M6 8.5 10.5 5 14 7.5 18 4m0 0h-3.5M18 4v3" />
                    <circle cx="15" cy="15" r="5" />
                    <path d="M13.2 12.8h2.3a1.5 1.5 0 0 1 0 3h-2.3v2.2" stroke-width="1.6" />
                    <line x1="12.2" y1="14.1" x2="16.6" y2="14.1" stroke-width="1.4" />
                    <line x1="12.2" y1="15.4" x2="16.6" y2="15.4" stroke-width="1.4" />
                </svg>
            `;
        case 'stethoscope':
            return `
                <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
                    <path d="M9 12.5v3.5a4 4 0 0 0 4 4h1a4 4 0 0 0 4-4v-1.5" />
                    <circle cx="18" cy="14" r="2" />
                </svg>
            `;
        case 'scale':
            return `
                <svg class="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
            `;
        case 'clipboard':
            return `
                <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    <path d="m9 14 2 2 4-4" />
                </svg>
            `;
        case 'firstaid':
            return `
                <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="6" width="20" height="15" rx="3" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="12" y1="10.5" x2="12" y2="16.5" />
                    <line x1="9" y1="13.5" x2="15" y2="13.5" />
                </svg>
            `;
        case 'vault':
            return `
                <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="12" cy="12" r="4" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
            `;
        case 'calendar':
            return `
                <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            `;
        default:
            return `
                <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 4h7a4.5 4.5 0 0 1 0 9H7V4z" />
                    <path d="M7 13v7" />
                    <line x1="4" y1="7.5" x2="16" y2="7.5" />
                    <line x1="4" y1="10.5" x2="16" y2="10.5" />
                </svg>
            `;
    }
};

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
    const track = document.getElementById('fundDownloadedCarouselTrack');
    if (!track) return;

    const activeSlide = track.querySelector(`.carousel-slide[data-slide-index="${currentCarouselSlide}"]`);
    if (!activeSlide) return;

    activeSlide.querySelectorAll('[data-rolling-value]').forEach((el) => {
        const targetVal = parseFloat(el.getAttribute('data-rolling-value') || '0');
        animateRollingElement(el, targetVal);
    });
}

function goToCarouselSlide(index) {
    const track = document.getElementById('fundDownloadedCarouselTrack');
    const indicators = document.getElementById('fundDownloadedCarouselIndicators');
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

function renderCarousel() {
    const track = document.getElementById('fundDownloadedCarouselTrack');
    const indicators = document.getElementById('fundDownloadedCarouselIndicators');
    const section = document.getElementById('fundDownloadedCarouselSection');
    if (!track || !indicators) return;

    // Aggregate month sums across filtered rows
    const filtered = getFilteredRows();
    const monthTotals = monthKeys.map((k) =>
        filtered.reduce((sum, r) => sum + (Number(r.months?.[k]) || 0), 0)
    );

    // Group into 3 slides of 4 months each
    const slides = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11]
    ];

    if (currentCarouselSlide >= slides.length) {
        currentCarouselSlide = 0;
    }

    track.innerHTML = slides.map((slideMonths, slideIndex) => {
        const isCurrent = slideIndex === currentCarouselSlide;
        const cardsHtml = slideMonths.map((mIdx) => {
            const mName = monthNames[mIdx];
            const theme = monthCardThemes[mIdx];
            const total = monthTotals[mIdx];
            const displayIndex = String(mIdx + 1).padStart(2, '0');

            return `
                <div class="relative overflow-hidden ${theme.bg} text-white p-5 pt-4 sm:p-6 sm:pt-5 min-h-[175px] sm:min-h-[170px] shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between cursor-grab active:cursor-grabbing select-none">
                    <!-- Background Watermark Icon -->
                    <div class="absolute -right-5 -bottom-5 w-40 h-40 opacity-15 pointer-events-none transform -rotate-12 select-none flex items-center justify-center">
                        ${getWatermarkSvg(theme.icon)}
                    </div>

                    <!-- Top Row: Card Index & Draggable Indicator -->
                    <div class="flex items-center justify-between relative z-10 mb-1">
                        <div class="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity text-[10px] tracking-wider font-semibold uppercase text-white/80">
                            <svg class="w-3 h-3 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                            <span>Swipe</span>
                        </div>
                        <span class="text-xs sm:text-sm font-black tracking-widest text-white/70 font-mono">${displayIndex}</span>
                    </div>

                    <!-- Card Body: Label & Value -->
                    <div class="relative z-10 -mt-2 mb-3">
                        <p class="text-xs font-black uppercase tracking-wider ${theme.text} truncate">TOTAL ${mName}</p>
                        <h3 class="financial-amount financial-amount-hover text-2xl sm:text-3xl font-bold group-hover:font-black text-white mt-1 block origin-left truncate tabular-nums transition-[font-weight,transform,opacity] duration-200" data-rolling-value="${total}">
                            ${formatCurrency(0)}
                        </h3>
                    </div>

                    <!-- Footer Row -->
                    <div class="relative z-10 flex items-center justify-between text-[11px] font-bold text-white/80 pt-2.5 border-t border-white/15">
                        <span class="${theme.footer}">Monthly Downloaded</span>
                        <div class="flex items-center gap-1">
                            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l2 2" />
                            </svg>
                            <span class="uppercase">${mName.substring(0, 3)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="carousel-slide duration-500 ease-in-out ${isCurrent ? 'block opacity-100' : 'hidden opacity-0'} transition-opacity" data-slide-index="${slideIndex}">
                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
                    ${cardsHtml}
                </div>
            </div>
        `;
    }).join('');

    if (indicators) {
        indicators.innerHTML = slides.map((_, idx) => `
            <button type="button" class="w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentCarouselSlide ? 'bg-[#224796] w-6' : 'bg-slate-300 hover:bg-slate-400'}" aria-label="Slide ${idx + 1}" data-slide-to="${idx}"></button>
        `).join('');

        indicators.querySelectorAll('[data-slide-to]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const targetSlide = parseInt(btn.getAttribute('data-slide-to') || '0', 10);
                goToCarouselSlide(targetSlide);
            });
        });
    }

    setupCarouselTouchDrag(track, slides.length);
    animateActiveSlideCounters();
}
// END: Dynamic Carousel Rendering for Month Summary Cards

function setupYearControls() {
    const yearInput = document.getElementById('fundDownloadedYear');
    const yearUp = document.getElementById('fundDownloadedYearUp');
    const yearDown = document.getElementById('fundDownloadedYearDown');
    const headerYear = document.getElementById('fundDownloadedCurrentYear');

    if (yearInput) {
        yearInput.value = selectedYear;
        if (headerYear) headerYear.textContent = selectedYear;

        const updateYear = async (newYear) => {
            if (newYear < 2000 || newYear > 2099) return;
            selectedYear = newYear;
            yearInput.value = selectedYear;
            if (headerYear) headerYear.textContent = selectedYear;
            await loadFundDownloadedData();
            currentPage = 1;
            renderCarousel();
            renderTable();
        };

        yearInput.addEventListener('change', () => updateYear(parseInt(yearInput.value, 10) || new Date().getFullYear()));
        yearInput.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) updateYear(selectedYear + 1);
            else updateYear(selectedYear - 1);
        }, { passive: false });

        if (yearUp) yearUp.addEventListener('click', () => updateYear(selectedYear + 1));
        if (yearDown) yearDown.addEventListener('click', () => updateYear(selectedYear - 1));
    }
}

function setupFiltersAndActions() {
    const searchInput = document.getElementById('fundDownloadedSearch');
    const categoryFilter = document.getElementById('fundDownloadedCategoryFilter');
    const addBtn = document.getElementById('fundDownloadedAddBtn');
    const calculateBtn = document.getElementById('fundDownloadedCalculateBtn');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchTerm = searchInput.value;
            currentPage = 1;
            renderCarousel();
            renderTable();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            selectedCategory = categoryFilter.value;
            currentPage = 1;
            renderCarousel();
            renderTable();
        });
    }

    if (addBtn) {
        const handleAddEntry = () => {
            showFundDownloadedDrawer({
                year: selectedYear,
                onConfirm: async (entryData) => {
                    const apiBase = getApiBasePath();
                    try {
                        const res = await fetch(`${apiBase}/api/fund-downloaded/create.php`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'same-origin',
                            body: JSON.stringify({
                                year: selectedYear,
                                category: entryData.category,
                                glCode: entryData.glCode,
                                programTitle: entryData.programTitle,
                                months: entryData.months,
                            }),
                        });
                        const data = await res.json();
                        if (data.success && data.id) {
                            const newEntryId = data.id;
                            await loadFundDownloadedData();
                            renderCarousel();
                            renderTable();

                            // Show 5-second stacked toast with Undo at bottom-right
                            let undone = false;
                            showStackedToast({
                                title: 'Fund entry added successfully.',
                                type: 'success',
                                duration: 5000,
                                cachePayload: { id: newEntryId, entryData },
                                onUndo: async () => {
                                    undone = true;
                                    try {
                                        // Delete from database
                                        await fetch(`${apiBase}/api/fund-downloaded/delete.php`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            credentials: 'same-origin',
                                            body: JSON.stringify({ id: newEntryId }),
                                        });

                                        await loadFundDownloadedData();
                                        renderCarousel();
                                        renderTable();

                                        // Reopen drawer with their information intact
                                        showFundDownloadedDrawer({
                                            year: selectedYear,
                                            onConfirm: entryData.clearCache ? handleAddEntryConfirm : null,
                                            reopenWithData: entryData
                                        });
                                    } catch (err) {
                                        console.error('Failed to undo fund entry:', err);
                                    }
                                }
                            });

                            // If not undone after 5 seconds, clear the temporary draft cache automatically
                            setTimeout(() => {
                                if (!undone && typeof entryData.clearCache === 'function') {
                                    entryData.clearCache();
                                }
                            }, 5200);
                        }
                    } catch (e) {
                        console.error('Failed to create fund entry:', e);
                    }
                },
            });
        };

        const handleAddEntryConfirm = (entryData) => {
            addBtn.click();
        };

        addBtn.addEventListener('click', handleAddEntry);
    }

    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            const filtered = getFilteredRows();
            let totalDownloaded = 0;
            let totalSpent = 0;

            const header = ['Category', 'G/L Code', 'Program Title', ...monthNames, 'Total Downloaded', 'Spent', 'Remaining'];
            const lines = [header.join(',')];

            filtered.forEach((r) => {
                const tot = calculateTotal(r);
                const sp = Number(r.spent) || 0;
                const rem = Math.max(0, tot - sp);
                totalDownloaded += tot;
                totalSpent += sp;

                const monthVals = monthKeys.map((k) => formatCurrency(r.months?.[k] || 0).replace('₱', 'PHP '));
                const rowCsv = [
                    `"${r.category || ''}"`,
                    `"${r.glCode || ''}"`,
                    `"${(r.programTitle || '').replace(/"/g, '""')}"`,
                    ...monthVals,
                    formatCurrency(tot).replace('₱', 'PHP '),
                    formatCurrency(sp).replace('₱', 'PHP '),
                    formatCurrency(rem).replace('₱', 'PHP '),
                ];
                lines.push(rowCsv.join(','));
            });

            const totalRemaining = Math.max(0, totalDownloaded - totalSpent);
            const utilizationRate = totalDownloaded > 0 ? (totalSpent / totalDownloaded) * 100 : 0;

            showFundDownloadedCalculateDrawer({
                year: selectedYear,
                csvString: lines.join('\n'),
                totals: {
                    totalDownloaded,
                    totalSpent,
                    totalRemaining,
                    utilizationRate,
                },
            });
        });
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export async function init() {
    if (!document.getElementById('fundDownloadedTable')) return;
    setupYearControls();
    setupFiltersAndActions();
    await loadFundDownloadedData();
    renderCarousel();
    renderTable();
}

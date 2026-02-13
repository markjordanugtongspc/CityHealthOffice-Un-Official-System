/**
 * Disbursement Voucher: Fund dropdown+search, DV No auto-format, Particulars from date, Amount Due, print.
 */

/**
 * Print the disbursement voucher (only #voucher-print-area). Call from Print button or modal.
 * Isolates #voucher-print-area via print-only CSS and cleans up on afterprint.
 */
export function printVoucher() {
    const printArea = document.getElementById('voucher-print-area');
    if (!printArea) {
        console.warn('Voucher print area not found');
        window.print();
        return;
    }

    const style = document.createElement('style');
    style.id = 'voucher-print-style';
    style.textContent = `
        @media print {
            @page { margin: 0.5cm; size: A4; }
            body * { visibility: hidden !important; }
            #voucher-print-area, #voucher-print-area * { visibility: visible !important; }
            #voucher-print-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0.5cm !important;
                background: white !important;
                page-break-inside: avoid;
            }
            .print\\:hidden { display: none !important; }
        }
    `;
    document.head.appendChild(style);

    const cleanup = () => {
        style.remove();
        window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    window.print();
}

const FUND_OPTIONS = [
    { code: 'MOOE', label: 'MOOE' },
    { code: 'PHIC', label: 'PHIC' },
    { code: 'SPF', label: 'SPF PROGRAM' }
];

const STORAGE_KEY_PREFIX = 'voucher_dv_seq_';

function getCurrentYear() {
    return new Date().getFullYear();
}

function getCurrentMonth() {
    return String(new Date().getMonth() + 1).padStart(2, '0');
}

function getStorageKey(fundCode, year, month) {
    return `${STORAGE_KEY_PREFIX}${fundCode}_${year}_${month}`;
}

function getNextSequence(fundCode, year, month) {
    const key = getStorageKey(fundCode, year, month);
    const raw = localStorage.getItem(key);
    const next = (parseInt(raw, 10) || 0) + 1;
    localStorage.setItem(key, String(next));
    return String(next).padStart(4, '0');
}

function buildDvNo(fundCode, year, month, seq) {
    const y = year || getCurrentYear();
    const m = month || getCurrentMonth();
    const s = (seq !== undefined && seq !== '') ? String(seq).padStart(4, '0') : getNextSequence(fundCode, y, m);
    return `${fundCode}${y}-${m}-${s}`;
}

function parseCurrencyInput(raw) {
    if (raw === undefined || raw === null) return 0;
    const cleaned = String(raw).replace(/[^0-9.-]/g, '').replace(/,/g, '');
    const num = parseFloat(cleaned);
    return Number.isNaN(num) ? 0 : num;
}

function formatCurrencyDisplay(value) {
    const num = parseFloat(value) || 0;
    return num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCurrencyInput(value) {
    const num = parseFloat(value) || 0;
    return num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function getMonthName(monthNum) {
    const d = new Date(2000, monthNum - 1, 1);
    return d.toLocaleString('en-PH', { month: 'long' });
}

function particularsFromDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    if (Number.isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const lastDay = getDaysInMonth(year, month);
    const monthName = getMonthName(month);
    return `${monthName} 1-${lastDay}, ${year}`;
}

const PARTICULARS_TEMPLATE = 'Cash advance payment for the TEV such as perdiem, transportation and miscellaneous expenses incurred to attend the BUDGET CYCLE MANAGEMENT (BCM) CONSULTATION WORKSHOP held on <DATE> at General Santos as per supporting papers hereto attached, or in amount of';

export function init() {
    const app = document.getElementById('voucher-app');
    if (!app) return;

    const fundInput = document.getElementById('voucherFund');
    const fundToggle = document.getElementById('voucherFundToggle');
    const fundSuggestions = document.getElementById('voucherFundSuggestions');
    const iconNormal = document.getElementById('voucherFundIconNormal');
    const iconHover = document.getElementById('voucherFundIconHover');
    const dvNoInput = document.getElementById('voucherDvNo');
    const dateInput = document.getElementById('voucherDate');
    const particularsInput = document.getElementById('voucherParticulars');
    const amountInput = document.getElementById('voucherAmountInput');
    const amountDueEl = document.getElementById('voucherAmountDue');
    const debitEl = document.getElementById('voucherDebit');
    const creditEl = document.getElementById('voucherCredit');
    const printBtn = document.getElementById('voucherPrintBtn');
    const printArea = document.getElementById('voucher-print-area');

    if (!fundInput || !dvNoInput || !dateInput || !particularsInput || !amountInput || !amountDueEl) return;

    const today = new Date().toISOString().split('T')[0];
    if (!dateInput.value) dateInput.value = today;
    const receiptDateInput = document.getElementById('voucherReceiptDate');
    if (receiptDateInput && !receiptDateInput.value) receiptDateInput.value = today;
    if (!fundInput.value) {
        fundInput.value = 'MOOE';
        fundInput.dataset.code = 'MOOE';
    }
    if (!dvNoInput.value) dvNoInput.value = buildDvNo(getFundCode(), getCurrentYear(), getCurrentMonth(), undefined);

    // ----- Fund dropdown + search -----
    function renderFundSuggestions(filter) {
        const q = (filter || '').toLowerCase().trim();
        const list = q
            ? FUND_OPTIONS.filter(o => o.code.toLowerCase().includes(q) || o.label.toLowerCase().includes(q))
            : [...FUND_OPTIONS];
        fundSuggestions.innerHTML = list
            .map(o => `<div class="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm font-medium text-slate-800" data-code="${o.code}" data-label="${o.label}">${o.label}</div>`)
            .join('') || '<div class="px-3 py-2 text-sm text-slate-500">No match</div>';
        fundSuggestions.classList.remove('hidden');
        if (iconNormal) iconNormal.classList.add('hidden');
        if (iconHover) iconHover.classList.remove('hidden');
    }

    function hideFundSuggestions() {
        fundSuggestions.classList.add('hidden');
        if (iconNormal) iconNormal.classList.remove('hidden');
        if (iconHover) iconHover.classList.add('hidden');
    }

    function selectFund(code, label) {
        fundInput.value = label;
        fundInput.dataset.code = code;
        hideFundSuggestions();
        updateDvNoFromFund();
    }

    fundInput.addEventListener('focus', () => renderFundSuggestions(fundInput.value));
    fundInput.addEventListener('input', () => renderFundSuggestions(fundInput.value));
    fundInput.addEventListener('blur', () => setTimeout(hideFundSuggestions, 150));

    fundSuggestions.addEventListener('mousedown', (e) => {
        const row = e.target.closest('[data-code]');
        if (row) {
            e.preventDefault();
            selectFund(row.dataset.code, row.dataset.label);
        }
    });

    if (fundToggle) {
        fundToggle.addEventListener('mouseenter', () => {
            if (iconNormal) iconNormal.classList.add('hidden');
            if (iconHover) iconHover.classList.remove('hidden');
        });
        fundToggle.addEventListener('mouseleave', () => {
            if (fundSuggestions.classList.contains('hidden')) {
                if (iconNormal) iconNormal.classList.remove('hidden');
                if (iconHover) iconHover.classList.add('hidden');
            }
        });
        fundToggle.addEventListener('click', (e) => {
            e.preventDefault();
            if (fundSuggestions.classList.contains('hidden')) {
                renderFundSuggestions(fundInput.value);
                fundInput.focus();
            } else {
                hideFundSuggestions();
            }
        });
    }

    // ----- DV No: auto from Fund + year + month + sequence (editable) -----
    function getFundCode() {
        const code = fundInput.dataset.code;
        if (code) return code;
        const val = (fundInput.value || '').trim().toUpperCase();
        const found = FUND_OPTIONS.find(o => o.code === val || o.label.toUpperCase() === val);
        return found ? found.code : (val || 'MOOE');
    }

    function updateDvNoFromFund() {
        const code = getFundCode();
        const year = getCurrentYear();
        const month = getCurrentMonth();
        const newDv = buildDvNo(code, year, month, undefined);
        if (dvNoInput && (!dvNoInput.value || /^[A-Z]+\d{4}-\d{2}-\d{4}$/.test(dvNoInput.value))) {
            dvNoInput.value = newDv;
        }
    }

    fundInput.addEventListener('blur', () => updateDvNoFromFund());

    // ----- Date -> Particulars: replace only the date part (<...> or "Month 1-N, Year"); rest static, editable -----
    function syncParticularsFromDate() {
        const d = dateInput.value;
        const dateRange = particularsFromDate(d);
        if (!dateRange) return;
        const current = particularsInput.value || '';
        const open = current.indexOf('<');
        const close = current.indexOf('>');
        if (open !== -1 && close > open) {
            particularsInput.value = current.slice(0, open + 1) + dateRange + current.slice(close);
            return;
        }
        const existingDateMatch = current.match(/[A-Za-z]+\s+1-\d{1,2},\s*\d{4}/);
        if (existingDateMatch && current.trim().length > 0) {
            particularsInput.value = current.replace(/[A-Za-z]+\s+1-\d{1,2},\s*\d{4}/, dateRange);
            return;
        }
        if (!current.trim()) {
            particularsInput.value = PARTICULARS_TEMPLATE.replace('<DATE>', dateRange);
        }
    }

    dateInput.addEventListener('change', syncParticularsFromDate);
    dateInput.addEventListener('blur', syncParticularsFromDate);
    if (dateInput.value) syncParticularsFromDate();

    // ----- Mode of Payment: toggle Others input, hide/show other checkboxes -----
    const modeMds = document.getElementById('voucherModeMds');
    const modeCommercial = document.getElementById('voucherModeCommercial');
    const modeAda = document.getElementById('voucherModeAda');
    const modeOthersLabel = document.getElementById('voucherModeOthersLabel');
    const modeOthersCheck = document.getElementById('voucherModeOthersCheck');
    const modeOthersInput = document.getElementById('voucherModeOthers');
    const modeContainer = document.getElementById('voucherModeContainer');

    function toggleModeOfPayment() {
        if (!modeOthersCheck || !modeOthersInput || !modeContainer) return;
        const isOthersChecked = modeOthersCheck.checked;
        if (isOthersChecked) {
            if (modeMds) modeMds.classList.add('hidden');
            if (modeCommercial) modeCommercial.classList.add('hidden');
            if (modeAda) modeAda.classList.add('hidden');
            modeOthersInput.classList.remove('hidden');
            modeContainer.classList.remove('flex-wrap');
            modeContainer.classList.add('flex', 'items-center', 'justify-start');
        } else {
            if (modeMds) modeMds.classList.remove('hidden');
            if (modeCommercial) modeCommercial.classList.remove('hidden');
            if (modeAda) modeAda.classList.remove('hidden');
            modeOthersInput.classList.add('hidden');
            modeContainer.classList.add('flex-wrap');
        }
    }

    if (modeOthersCheck) {
        modeOthersCheck.addEventListener('change', toggleModeOfPayment);
    }

    // ----- Amount: currency format + Amount Due + Debit/Credit -----
    function syncAmountDisplay() {
        const num = parseCurrencyInput(amountInput.value);
        const formatted = formatCurrencyDisplay(num);
        amountDueEl.textContent = formatted;
        if (debitEl) {
            const amountSpan = debitEl.querySelector('span.float-right');
            if (amountSpan) {
                amountSpan.textContent = formatted;
            } else {
                debitEl.innerHTML = '<span>₱</span> <span class="float-right">' + formatted + '</span>';
            }
        }
        if (creditEl) creditEl.textContent = '₱ ' + formatted;
    }

    amountInput.addEventListener('input', syncAmountDisplay);
    amountInput.addEventListener('blur', () => {
        const num = parseCurrencyInput(amountInput.value);
        amountInput.value = formatCurrencyInput(num);
        syncAmountDisplay();
    });
    syncAmountDisplay();

    // ----- Print: single page (uses shared printVoucher) -----
    if (printBtn) {
        printBtn.addEventListener('click', printVoucher);
    }
}

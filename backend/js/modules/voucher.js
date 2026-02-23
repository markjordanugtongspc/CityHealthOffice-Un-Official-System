/**
 * Disbursement Voucher: Fund dropdown+search, DV No auto-format, Particulars from date, Amount Due, print.
 */

/**
 * Print generateVoucher.php #voucher-print-area (lines 23-397) entirely.
 * Opens a dedicated print window so main page CSS cannot hide the content.
 */
export function printVoucher() {
    const printArea = document.getElementById('voucher-print-area');
    if (!printArea) {
        window.print();
        return;
    }

    const clone = printArea.cloneNode(true);
    // cloneNode does NOT copy input/textarea values — sync from original
    printArea.querySelectorAll('input, textarea').forEach((orig) => {
        const id = orig.id;
        if (!id) return;
        const copy = clone.querySelector(`#${id}`);
        if (copy) {
            if ('value' in copy) copy.value = orig.value;
            if (orig.type === 'checkbox') copy.checked = orig.checked;
        }
    });
    clone.querySelectorAll('img[src]').forEach((img) => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
            img.setAttribute('src', new URL(src, window.location.href).href);
        }
    });

    // Collect stylesheets: prod has link tags; dev has CSS via Vite JS - load style.css from Vite
    let styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'))
        .map((l) => `<link rel="stylesheet" href="${l.href}">`)
        .join('');
    if (!styleLinks) {
        const viteScript = document.querySelector('script[type="module"][src*="5173"], script[type="module"][src*="backend/js/main"]');
        const viteOrigin = viteScript ? new URL(viteScript.src).origin : window.location.origin;
        styleLinks = `<link rel="stylesheet" href="${viteOrigin}/frontend/style.css">`;
    }

    const printWin = window.open('', '_blank');
    if (!printWin) {
        window.print();
        return;
    }

    // Write minimal document with guaranteed Legal print rules
    printWin.document.write(`
<!DOCTYPE html>
<html lang="en" class="voucher-print-window">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Disbursement Voucher - Print</title>
${styleLinks}
<style>
    @media print { 
        @page { size: legal portrait !important; margin: 0 !important; } 
    }
    body.voucher-print-window { background: white !important; margin: 0 !important; padding: 0 !important; }
    .print-hidden, .voucher-toolbar-row { display: none !important; }
</style>
</head>
<body class="voucher-print-window">${clone.outerHTML}</body>
</html>`);
    printWin.document.close();

    let printed = false;
    const doPrint = () => {
        if (printed) return;
        printed = true;
        printWin.focus();
        printWin.print();
        printWin.onafterprint = () => printWin.close();
    };

    printWin.onload = doPrint;
    setTimeout(doPrint, 600);
}

const FUND_OPTIONS = [
    { code: 'MOOE', label: 'MOOE' },
    { code: 'PHIC', label: 'PHIC' },
    { code: 'SPF', label: 'SPF PROGRAM' }
];

const STORAGE_KEY_PREFIX = 'voucher_dv_seq_';
const VOUCHER_COOKIE_NAME = 'voucher_form';
const VOUCHER_COOKIE_DAYS = 30;

/** Cookie helpers for voucher form persistence */
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};path=/;expires=${d.toUTCString()};SameSite=Lax`;
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Save voucher form inputs to client cookie.
 */
export function saveVoucherToCookie() {
    const app = document.getElementById('voucher-app');
    if (!app) return;
    const data = {};
    const textIds = ['voucherFund', 'voucherDvNo', 'voucherDate', 'voucherModeOthers', 'voucherPayee', 'voucherPayeeEtAl', 'voucherTin', 'voucherCafoa', 'voucherAddress', 'voucherRespCenter', 'voucherParticulars', 'voucherAmountInput', 'voucherCertifiedDate', 'voucherApprovedDate', 'voucherCheckNo', 'voucherReceiptDate', 'voucherBankAccount', 'voucherReceiptSignatureDate', 'voucherReceiptPrintedName', 'voucherOfficialReceipt'];
    textIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el && 'value' in el) data[id] = String(el.value || '');
    });
    const fundEl = document.getElementById('voucherFund');
    if (fundEl?.dataset?.code) data.fundCode = fundEl.dataset.code;
    const modeMds = document.querySelector('#voucherModeMds input');
    const modeCommercial = document.querySelector('#voucherModeCommercial input');
    const modeAda = document.querySelector('#voucherModeAda input');
    const modeOthersCheck = document.getElementById('voucherModeOthersCheck');
    if (modeMds) data.modeMds = modeMds.checked;
    if (modeCommercial) data.modeCommercial = modeCommercial.checked;
    if (modeAda) data.modeAda = modeAda.checked;
    if (modeOthersCheck) data.modeOthers = modeOthersCheck.checked;
    try {
        const json = JSON.stringify(data);
        if (json.length < 3500) setCookie(VOUCHER_COOKIE_NAME, json, VOUCHER_COOKIE_DAYS);
    } catch (_) { }
}

/**
 * Get voucher cookie data as object (no DOM). For merging into modal/add forms.
 * @returns {{ dvNo?: string, dvDate?: string, payee?: string, particulars?: string, checkAmount?: string } | null}
 */
export function getVoucherCookieData() {
    const raw = getCookie(VOUCHER_COOKIE_NAME);
    if (!raw) return null;
    try {
        const data = JSON.parse(raw);
        if (typeof data !== 'object') return null;
        const payee = [data.voucherPayee, data.voucherPayeeEtAl].filter(Boolean).join(' ').trim() || undefined;
        const amount = (data.voucherAmountInput || '').replace(/[^0-9.-]/g, '').replace(/,/g, '');
        return {
            dvNo: data.voucherDvNo || undefined,
            dvDate: data.voucherDate || undefined,
            payee: payee || undefined,
            particulars: data.voucherParticulars || undefined,
            checkAmount: amount ? parseFloat(amount) : undefined
        };
    } catch (_) {
        return null;
    }
}

/**
 * Load voucher form inputs from client cookie. Returns true if data was restored.
 */
export function loadVoucherFromCookie() {
    const raw = getCookie(VOUCHER_COOKIE_NAME);
    if (!raw) return false;
    try {
        const data = JSON.parse(raw);
        if (typeof data !== 'object') return false;
        const textIds = ['voucherFund', 'voucherDvNo', 'voucherDate', 'voucherModeOthers', 'voucherPayee', 'voucherPayeeEtAl', 'voucherTin', 'voucherCafoa', 'voucherAddress', 'voucherRespCenter', 'voucherParticulars', 'voucherAmountInput', 'voucherCertifiedDate', 'voucherApprovedDate', 'voucherCheckNo', 'voucherReceiptDate', 'voucherBankAccount', 'voucherReceiptSignatureDate', 'voucherReceiptPrintedName', 'voucherOfficialReceipt'];
        textIds.forEach((id) => {
            if (data[id] === undefined) return;
            const el = document.getElementById(id);
            if (el && 'value' in el) el.value = data[id];
        });
        const fundEl = document.getElementById('voucherFund');
        if (fundEl && data.fundCode) fundEl.dataset.code = data.fundCode;
        const modeMds = document.querySelector('#voucherModeMds input');
        const modeCommercial = document.querySelector('#voucherModeCommercial input');
        const modeAda = document.querySelector('#voucherModeAda input');
        const modeOthersCheck = document.getElementById('voucherModeOthersCheck');
        if (modeMds && data.modeMds !== undefined) modeMds.checked = data.modeMds;
        if (modeCommercial && data.modeCommercial !== undefined) modeCommercial.checked = data.modeCommercial;
        if (modeAda && data.modeAda !== undefined) modeAda.checked = data.modeAda;
        if (modeOthersCheck && data.modeOthers !== undefined) modeOthersCheck.checked = data.modeOthers;
        return true;
    } catch (_) {
        return false;
    }
}

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

    const loaded = loadVoucherFromCookie();
    const today = new Date().toISOString().split('T')[0];
    if (!loaded) {
        if (!dateInput.value) dateInput.value = today;
        const receiptDateInput = document.getElementById('voucherReceiptDate');
        if (receiptDateInput && !receiptDateInput.value) receiptDateInput.value = today;
        if (!fundInput.value) {
            fundInput.value = 'MOOE';
            fundInput.dataset.code = 'MOOE';
        }
        if (!dvNoInput.value) dvNoInput.value = buildDvNo(getFundCode(), getCurrentYear(), getCurrentMonth(), undefined);
    } else {
        const receiptDateInput = document.getElementById('voucherReceiptDate');
        if (receiptDateInput && !receiptDateInput.value) receiptDateInput.value = today;
        if (!fundInput.dataset?.code) fundInput.dataset.code = getFundCode();
    }

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
    if (loaded) toggleModeOfPayment();

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

    // ----- Cookie persistence: save on input/change (debounced) -----
    let saveTimeout;
    const debouncedSave = () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveVoucherToCookie, 300);
    };
    const saveIds = ['voucherFund', 'voucherDvNo', 'voucherDate', 'voucherModeOthers', 'voucherPayee', 'voucherPayeeEtAl', 'voucherTin', 'voucherCafoa', 'voucherAddress', 'voucherRespCenter', 'voucherParticulars', 'voucherAmountInput', 'voucherCertifiedDate', 'voucherApprovedDate', 'voucherCheckNo', 'voucherReceiptDate', 'voucherBankAccount', 'voucherReceiptSignatureDate', 'voucherReceiptPrintedName', 'voucherOfficialReceipt'];
    saveIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', debouncedSave);
            el.addEventListener('change', debouncedSave);
            el.addEventListener('blur', debouncedSave);
        }
    });
    const modeCheckboxes = [document.querySelector('#voucherModeMds input'), document.querySelector('#voucherModeCommercial input'), document.querySelector('#voucherModeAda input'), document.getElementById('voucherModeOthersCheck')];
    modeCheckboxes.filter(Boolean).forEach((el) => el.addEventListener('change', debouncedSave));
}

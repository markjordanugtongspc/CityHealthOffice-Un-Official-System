/**
 * START: Number Input Auto-Formatter Module
 * Formats numeric and currency inputs automatically with commas (e.g. 1000 -> 1,000).
 * Preserves cursor position during typing and provides parsing helper functions.
 */

// START: formatWithCommas - Formats raw numeric string into comma-separated thousands string
export function formatWithCommas(val) {
    if (val === null || val === undefined) return '';
    let str = String(val).trim();
    if (!str) return '';

    const isNegative = str.startsWith('-');
    str = str.replace(/[^0-9.]/g, '');

    const parts = str.split('.');
    const intRaw = parts[0] || '';
    const formattedInt = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    let result = formattedInt;
    if (parts.length > 1) {
        result += '.' + parts.slice(1).join('').slice(0, 2);
    }
    return (isNegative && result ? '-' : '') + result;
}
// END: formatWithCommas

// START: parseFormattedNumber - Parses comma-separated number string into float number
export function parseFormattedNumber(val) {
    if (val === null || val === undefined) return 0;
    const cleaned = String(val).replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return Number.isNaN(num) ? 0 : num;
}
// END: parseFormattedNumber

// START: attachNumberFormatter - Attaches live auto-formatting with comma separation to input element
export function attachNumberFormatter(inputEl) {
    if (!inputEl || inputEl.dataset.hasNumberFormatter === 'true') return;
    inputEl.dataset.hasNumberFormatter = 'true';

    // Switch type to text to support comma rendering while preserving decimal keypad on mobile
    inputEl.type = 'text';
    inputEl.inputMode = 'decimal';

    const handleInput = () => {
        const oldVal = inputEl.value;
        const oldCursor = inputEl.selectionStart || 0;

        // Count how many raw digits/dots were before the cursor
        const rawBeforeCursor = oldVal.slice(0, oldCursor).replace(/[^0-9.]/g, '').length;

        const formatted = formatWithCommas(oldVal);
        inputEl.value = formatted;

        // Restore cursor position relative to raw characters
        let newCursor = 0;
        let rawCount = 0;
        for (let i = 0; i < formatted.length; i++) {
            if (rawCount >= rawBeforeCursor) break;
            if (/[0-9.]/.test(formatted[i])) {
                rawCount++;
            }
            newCursor = i + 1;
        }

        inputEl.setSelectionRange(newCursor, newCursor);
    };

    inputEl.addEventListener('input', handleInput);

    // Initial formatting if input has value
    if (inputEl.value) {
        inputEl.value = formatWithCommas(inputEl.value);
    }
}
// END: attachNumberFormatter

// START: initAllNumberInputs - Initializes number formatter on all inputs within a container or matching selector
export function initAllNumberInputs(container = document) {
    if (!container) return;
    const inputs = container.querySelectorAll(
        'input[data-format-number], input[data-currency-input], input.formatted-number-input'
    );
    inputs.forEach((input) => attachNumberFormatter(input));
}
// END: initAllNumberInputs

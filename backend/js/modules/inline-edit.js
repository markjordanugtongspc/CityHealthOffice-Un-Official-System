/**
 * Inline Edit Module
 * Handles click-and-hold-to-edit functionality for table cells
 * Requires 2-second hold to activate edit mode
 */

import Swal from 'sweetalert2';

// Configuration
const HOLD_DURATION = 2000; // 2 seconds in milliseconds

/**
 * Initialize inline editing for a table cell
 * @param {HTMLElement} cell - The table cell element
 * @param {Object} options - Configuration options
 * @param {Function} options.onSave - Callback when value is saved (receives newValue, oldValue, rowData)
 * @param {Function} options.onCancel - Callback when edit is cancelled
 * @param {string} options.type - Input type: 'text', 'number', 'currency'
 * @param {Object} options.rowData - Data object for the row (for passing to callbacks)
 * @param {string} options.fieldName - Name of the field being edited
 */
export function initInlineEdit(cell, options = {}) {
    const {
        onSave,
        onCancel,
        type = 'text',
        rowData = {},
        fieldName = ''
    } = options;

    let holdTimer = null;
    let isEditing = false;
    let originalValue = '';
    let inputElement = null;

    // Check if value is empty (helper function)
    const checkIfEmpty = (value, fieldType, displayValue) => {
        // Primary check: if display shows "-" or is empty, it's definitely empty
        if (!displayValue || displayValue.trim() === '' || displayValue === '-') return true;
        
        // For text fields, if text is empty or just "-", it's empty
        if (fieldType === 'text') {
            if (!displayValue || displayValue.trim() === '' || displayValue === '-') return true;
            return false;
        }
        
        // For currency/number fields
        if (fieldType === 'currency' || fieldType === 'number') {
            // If display shows "-", it's empty (no data)
            if (displayValue === '-') return true;
            // Check raw value - if it's null, undefined, or empty string, it's empty
            if (value === null || value === undefined || String(value).trim() === '') return true;
            // If value is 0, it's still a valid value (not empty) - allow editing
            // Only prevent if display explicitly shows "-"
        }
        
        return false;
    };
    
    // Show tooltip for empty values
    const showEmptyTooltip = (targetCell) => {
        // Remove existing tooltip if any
        const existingTooltip = document.querySelector('.empty-edit-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'empty-edit-tooltip absolute z-50 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none';
        tooltip.textContent = 'Empty, add data';
        
        // Position tooltip
        const rect = targetCell.getBoundingClientRect();
        tooltip.style.top = `${rect.top - 35}px`;
        tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
        tooltip.style.transform = 'translateX(-50%)';
        
        document.body.appendChild(tooltip);
        
        // Remove tooltip after 2 seconds
        setTimeout(() => {
            tooltip.remove();
        }, 2000);
    };

    // Check if cell is empty initially
    const initialDataValue = cell.getAttribute('data-value');
    const initialDisplayValue = cell.textContent.trim();
    const isInitiallyEmpty = checkIfEmpty(initialDataValue !== null ? initialDataValue : initialDisplayValue, type, initialDisplayValue);
    
    // Add visual indicator that cell is editable (only if not empty)
    if (!isInitiallyEmpty) {
        cell.classList.add('cursor-pointer', 'select-none', 'relative');
        cell.setAttribute('title', 'Hold for 2 seconds to edit');
    } else {
        cell.classList.add('cursor-not-allowed', 'relative');
        cell.setAttribute('title', 'Empty, add data');
    }

    // Mouse/Touch down - start hold timer
    const handleStart = (e) => {
        if (isEditing) return;
        
        e.preventDefault();
        originalValue = cell.textContent.trim();
        
        // Check data-value attribute first (raw value), then fallback to displayed text
        const dataValue = cell.getAttribute('data-value');
        const isEmpty = checkIfEmpty(dataValue !== null ? dataValue : originalValue, type, originalValue);
        
        if (isEmpty) {
            // Show tooltip for empty values immediately (no hold required)
            showEmptyTooltip(cell);
            return;
        }
        
        holdTimer = setTimeout(() => {
            activateEditMode();
        }, HOLD_DURATION);
    };
    
    // Also show tooltip on click for empty cells (no hold needed)
    const handleClick = (e) => {
        if (isEditing) return;
        
        originalValue = cell.textContent.trim();
        const dataValue = cell.getAttribute('data-value');
        const isEmpty = checkIfEmpty(dataValue !== null ? dataValue : originalValue, type, originalValue);
        
        if (isEmpty) {
            e.preventDefault();
            showEmptyTooltip(cell);
        }
    };

    // Mouse/Touch up - cancel hold timer
    const handleEnd = (e) => {
        if (isEditing) return;
        
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
    };

    // Activate edit mode
    const activateEditMode = () => {
        if (isEditing) return;
        
        isEditing = true;
        originalValue = cell.textContent.trim();
        
        // Create input element
        inputElement = document.createElement('input');
        inputElement.type = type === 'currency' || type === 'number' ? 'number' : 'text';
        inputElement.step = type === 'currency' ? '0.01' : '1';
        inputElement.min = type === 'currency' || type === 'number' ? '0' : undefined;
        
        // Extract numeric value if currency
        let inputValue = originalValue;
        if (type === 'currency') {
            // Remove currency symbols and commas
            inputValue = originalValue.replace(/[₱,]/g, '').trim() || '0';
        }
        
        inputElement.value = inputValue;
        inputElement.className = 'w-full px-2 py-1 text-sm border-2 border-[#224796] rounded focus:outline-none focus:ring-2 focus:ring-[#224796]';
        
        // Replace cell content
        cell.innerHTML = '';
        cell.appendChild(inputElement);
        inputElement.focus();
        inputElement.select();
        
        // Handle save (Enter key)
        const handleSave = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        };
        
        inputElement.addEventListener('keydown', handleSave);
        
        // Handle blur (click outside) - save on blur
        inputElement.addEventListener('blur', () => {
            // Small delay to allow Enter/Escape to fire first
            setTimeout(() => {
                if (isEditing && inputElement) {
                    saveEdit();
                }
            }, 100);
        });
    };

    // Save the edit
    const saveEdit = () => {
        if (!isEditing || !inputElement) return;
        
        const newValue = inputElement.value.trim();
        const hasChanged = newValue !== originalValue;
        
        // Restore cell content
        cell.innerHTML = '';
        
        if (hasChanged && newValue !== '') {
            // Format the value based on type
            let displayValue = newValue;
            if (type === 'currency') {
                const numValue = parseFloat(newValue) || 0;
                displayValue = formatCurrency(numValue);
            } else if (type === 'number') {
                const numValue = parseFloat(newValue) || 0;
                displayValue = String(numValue);
            }
            
            cell.textContent = displayValue;
            
            // Call onSave callback
            if (onSave) {
                onSave(newValue, originalValue, rowData, fieldName);
            }
            
            // Show success toast
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Successfully saved',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                customClass: {
                    popup: 'rounded-lg shadow-lg',
                },
            });
        } else {
            // No change or empty - restore original
            if (type === 'currency') {
                const numValue = parseFloat(originalValue.replace(/[₱,]/g, '')) || 0;
                cell.textContent = formatCurrency(numValue);
            } else {
                cell.textContent = originalValue;
            }
            
            if (hasChanged && newValue === '') {
                // Show warning if trying to save empty
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'warning',
                    title: 'Cannot save empty value',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    customClass: {
                        popup: 'rounded-lg shadow-lg',
                    },
                });
            }
        }
        
        // Cleanup
        isEditing = false;
        inputElement = null;
        holdTimer = null;
    };

    // Cancel the edit
    const cancelEdit = () => {
        if (!isEditing) return;
        
        // Restore original value
        cell.innerHTML = '';
        if (type === 'currency') {
            const numValue = parseFloat(originalValue.replace(/[₱,]/g, '')) || 0;
            cell.textContent = formatCurrency(numValue);
        } else {
            cell.textContent = originalValue;
        }
        
        // Call onCancel callback
        if (onCancel) {
            onCancel(originalValue, rowData, fieldName);
        }
        
        // Show cancel toast (light red)
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Edit cancelled',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            customClass: {
                popup: 'rounded-lg shadow-lg bg-red-50 border border-red-200',
                icon: 'text-red-400',
                title: 'text-red-600',
            },
            iconColor: '#f87171',
        });
        
        // Cleanup
        isEditing = false;
        inputElement = null;
        holdTimer = null;
    };

    // Attach event listeners
    cell.addEventListener('mousedown', handleStart);
    cell.addEventListener('mouseup', handleEnd);
    cell.addEventListener('mouseleave', handleEnd);
    cell.addEventListener('click', handleClick);
    cell.addEventListener('touchstart', handleStart, { passive: false });
    cell.addEventListener('touchend', handleEnd);
    cell.addEventListener('touchcancel', handleEnd);
}

/**
 * Format currency value
 */
function formatCurrency(value) {
    return `₱${parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Initialize inline editing for multiple cells in a table
 * @param {string} selector - CSS selector for editable cells
 * @param {Object} options - Configuration options
 */
export function initInlineEditForTable(selector, options = {}) {
    const cells = document.querySelectorAll(selector);
    cells.forEach(cell => {
        initInlineEdit(cell, options);
    });
}

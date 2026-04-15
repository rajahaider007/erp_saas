/**
 * Sales Module Calculation Utilities
 * Handles line item and header total calculations
 */

/**
 * Calculate line item total
 * @param {Object} lineItem - Line item object
 * @returns {Object} Calculated amounts
 */
export const calculateLineItem = (lineItem) => {
    const {
        quantity = 0,
        unit_price = 0,
        discount_type = 0,
        discount_amount = 0,
    } = lineItem;

    // Calculate discount based on type
    let discountAmt = discount_amount;
    if (discount_type > 0) {
        // discount_type is percentage
        const subtotal = quantity * unit_price;
        discountAmt = (subtotal * discount_type) / 100;
    }

    // Calculate amounts
    const subtotal = quantity * unit_price;
    const line_amount_untaxed = Math.max(0, subtotal - discountAmt);
    const tax_amount = 0; // TODO: implement tax calculation
    const line_amount_total = line_amount_untaxed + tax_amount;

    return {
        discount_amount: Math.round(discountAmt * 100) / 100,
        line_amount_untaxed: Math.round(line_amount_untaxed * 100) / 100,
        tax_amount: Math.round(tax_amount * 100) / 100,
        line_amount_total: Math.round(line_amount_total * 100) / 100,
    };
};

/**
 * Calculate header totals from line items
 * @param {Array} lineItems - Array of line items
 * @returns {Object} Header totals
 */
export const calculateHeaderTotals = (lineItems = []) => {
    let amount_untaxed = 0;
    let amount_tax = 0;

    lineItems.forEach((item) => {
        const calculated = calculateLineItem(item);
        amount_untaxed += calculated.line_amount_untaxed;
        amount_tax += calculated.tax_amount;
    });

    const amount_total = amount_untaxed + amount_tax;

    return {
        amount_untaxed: Math.round(amount_untaxed * 100) / 100,
        amount_tax: Math.round(amount_tax * 100) / 100,
        amount_total: Math.round(amount_total * 100) / 100,
    };
};

/**
 * Format currency value
 * @param {Number} value - Value to format
 * @param {String} currency - Currency code (PKR, USD, etc)
 * @returns {String} Formatted currency
 */
export const formatCurrency = (value, currency = 'PKR') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

/**
 * Format number with 2 decimal places
 * @param {Number} value - Value to format
 * @returns {String} Formatted number
 */
export const formatNumber = (value) => {
    return (Math.round(value * 100) / 100).toFixed(2);
};

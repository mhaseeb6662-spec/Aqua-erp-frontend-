/**
 * Shared UAE Currency (AED) Formatter for Aqua Fishing Academy ERP.
 * Standard format: "AED 1,250.00" or compact "AED 25K"
 */

export const DEFAULT_CURRENCY = 'AED';
export const DEFAULT_LOCALE = 'en-AE';

/**
 * Formats a numeric amount with AED prefix and commas.
 * @param {number|string} amount - The amount to format
 * @param {object} options - Options: { decimals: 2, compact: false, showSymbol: true }
 * @returns {string} e.g. "AED 1,250.00", "AED 25,000", "AED 1.2M"
 */
export function formatAED(amount, options = {}) {
  const num = Number(amount) || 0;
  const { decimals = 2, compact = false, showSymbol = true } = options;

  let formatted = '';
  if (compact) {
    if (Math.abs(num) >= 1_000_000) {
      formatted = (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (Math.abs(num) >= 1_000) {
      formatted = (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else {
      formatted = num.toLocaleString(DEFAULT_LOCALE, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      });
    }
  } else {
    formatted = num.toLocaleString(DEFAULT_LOCALE, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  return showSymbol ? `AED ${formatted}` : formatted;
}

/**
 * Formats full standard amount without decimals if whole number, or with decimals.
 */
export function formatCurrency(amount, decimals = 2) {
  return formatAED(amount, { decimals });
}

export default formatAED;

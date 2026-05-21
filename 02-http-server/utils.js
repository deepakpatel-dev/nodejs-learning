/**
 * Returns the current date as a formatted string (e.g. "May 14, 2026")
 */
function getCurrentDate() {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a number as a USD currency string (e.g. "$99.99")
 * @param {number} amount
 * @param {string} [currency='USD']
 */
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

module.exports = { getCurrentDate, formatCurrency };

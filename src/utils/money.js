export function roundToCents(amount) {
  // Use integer cents to avoid floating point drift.
  return Math.round((Number(amount) || 0) * 100) / 100;
}

export function toCents(amount) {
  return Math.round((Number(amount) || 0) * 100);
}

export function fromCents(cents) {
  return (Number(cents) || 0) / 100;
}

export function formatMoney(amount, currency = 'USD') {
  // Minimal formatting without Intl dependency quirks across environments.
  const n = roundToCents(amount);
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n).toFixed(2);
  return currency === 'USD' ? `${sign}$${abs}` : `${sign}${abs} ${currency}`;
}


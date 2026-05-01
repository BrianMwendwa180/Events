import { toCents, fromCents } from './money';

export function getConfiguredTaxRate() {
  const raw = import.meta.env.VITE_TAX_RATE;
  const rate = Number(raw);
  if (!Number.isFinite(rate) || rate < 0) return 0;
  return rate;
}

export function computeTaxAmount(taxableAmount, taxRate) {
  const taxableCents = toCents(taxableAmount);
  const rate = Number(taxRate) || 0;
  if (taxableCents <= 0 || rate <= 0) return 0;
  // Rounded to nearest cent.
  return fromCents(Math.round(taxableCents * rate));
}


// All checkout math runs in the smallest currency unit (cents for CAD and USD), as whole
// numbers, so the total shown on the page is exactly the total that is charged.

/** Currencies written without decimals (used on pricing pages; payments are CAD or USD). */
const ZERO_DECIMAL = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
])

/** Three-decimal currencies. Their amounts are rounded to end in 0. */
const THREE_DECIMAL = new Set(['BHD', 'JOD', 'KWD', 'OMR', 'TND'])

export function currencyExponent(currency: string): number {
  const code = currency.toUpperCase()
  if (ZERO_DECIMAL.has(code)) return 0
  if (THREE_DECIMAL.has(code)) return 3
  return 2
}

/** Rounds an amount in minor units to a valid value for this currency. */
export function roundMinor(minor: number, currency: string): number {
  const step = currencyExponent(currency) === 3 ? 10 : 1
  return Math.round(minor / step) * step
}

/** 19.99 USD → 1999. */
export function toMinor(amount: number, currency: string): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0
  return roundMinor(Math.round(amount * 10 ** currencyExponent(currency)), currency)
}

/** 1999 USD → 19.99. */
export function fromMinor(minor: number, currency: string): number {
  return minor / 10 ** currencyExponent(currency)
}

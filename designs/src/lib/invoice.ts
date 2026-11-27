// The link between a checkout on this site and its payment at Helcim is the invoice number:
// every payment for a checkout is made against the same Helcim invoice, so "has this been
// paid?" can always be answered by asking Helcim, with nothing extra to store here.
//
// Used by the browser and by the payment functions (payments/), so it must stay dependency-free.

export const INVOICE_PREFIX = 'ORD-'

/**
 * The Helcim invoice number for a checkout. Helcim matches invoice numbers without regard to
 * upper or lower case, so the id is upper-cased; 14 characters of it are plenty to stay unique.
 */
export function invoiceNumberFor(checkoutId: string): string {
  return `${INVOICE_PREFIX}${checkoutId.slice(0, 14).toUpperCase()}`
}

export function sameInvoice(a: unknown, b: unknown): boolean {
  return typeof a === 'string' && typeof b === 'string' && a.trim().toUpperCase() === b.trim().toUpperCase()
}

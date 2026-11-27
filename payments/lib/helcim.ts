import type { Checkout } from '../../designs/src/types'
import { checkoutTotals, formatRate, type CheckoutTotals } from '../../designs/src/lib/checkout'
import { sameInvoice } from '../../designs/src/lib/invoice'
import { fromMinor } from '../../designs/src/lib/money'

// Everything that talks to Helcim (https://devdocs.helcim.com). Three calls are used:
//
//   POST /helcim-pay/initialize      opens a payment for an amount; Helcim's own window then
//                                    collects the card, so card details never touch this site
//   GET  /card-transactions          what has been paid, looked up by invoice number
//   GET  /invoices                   whether the checkout's invoice already exists at Helcim
//
// Each checkout has one Helcim invoice (see designs/src/lib/invoice.ts). Helcim is the only
// record of payments: nothing about a payment is stored on this side.

const HELCIM_API = 'https://api.helcim.com/v2'

export interface HelcimAccess {
  token: string
  base: string
}

/** Access to Helcim with HELCIM_API_TOKEN, or null when payments are not set up. */
export function helcimFromEnv(): HelcimAccess | null {
  const token = (process.env.HELCIM_API_TOKEN ?? '').trim()
  if (!token) return null
  // HELCIM_API_URL exists only so the tests can point at a stand-in for Helcim.
  return { token, base: (process.env.HELCIM_API_URL || HELCIM_API).replace(/\/+$/, '') }
}

export class HelcimError extends Error {
  readonly status: number
  readonly errors: string[]
  constructor(status: number, errors: string[]) {
    super(errors.join(' ') || `Helcim answered ${status}`)
    this.status = status
    this.errors = errors
  }
}

/** Helcim reports problems as { errors: [...] }, { errors: {...} } or { errors: "..." }. */
function errorsFrom(body: unknown, fallback: string): string[] {
  const errors = (body as { errors?: unknown } | null)?.errors
  const flat = (value: unknown): string[] =>
    typeof value === 'string'
      ? [value]
      : Array.isArray(value)
        ? value.flatMap(flat)
        : value && typeof value === 'object'
          ? Object.entries(value).flatMap(([key, v]) => flat(v).map((text) => (/^\d+$/.test(key) ? text : `${key}: ${text}`)))
          : []
  const list = flat(errors)
    .map((text) => text.trim())
    .filter(Boolean)
  return list.length > 0 ? list.slice(0, 6) : [fallback.replace(/\s+/g, ' ').trim().slice(0, 200)].filter(Boolean)
}

async function request<T>(access: HelcimAccess, method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${access.base}${path}`, {
      method,
      headers: {
        'api-token': access.token,
        accept: 'application/json',
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    })
  } catch {
    throw new HelcimError(0, ['Could not reach Helcim.'])
  }
  const text = await res.text().catch(() => '')
  let parsed: unknown = null
  try {
    parsed = text ? JSON.parse(text) : null
  } catch {
    /* not JSON: handled below */
  }
  if (!res.ok) throw new HelcimError(res.status, errorsFrom(parsed, text))
  return parsed as T
}

/** Helcim returns lists as a plain array; tolerate a wrapper just in case. */
function listFrom<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body as T[]
  const inner = (body as { data?: unknown } | null)?.data
  return Array.isArray(inner) ? (inner as T[]) : []
}

export interface HelcimTransaction {
  transactionId?: number | string
  dateCreated?: string
  status?: string
  type?: string
  amount?: number | string
  currency?: string
  invoiceNumber?: string
}

export interface HelcimInvoice {
  invoiceId?: number | string
  invoiceNumber?: string
  status?: string
}

export function listTransactions(
  access: HelcimAccess,
  filter: { invoiceNumber?: string; dateFrom?: string; limit?: number; page?: number },
): Promise<HelcimTransaction[]> {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(filter)) if (value !== undefined && value !== '') query.set(key, String(value))
  return request<unknown>(access, 'GET', `/card-transactions?${query}`).then(listFrom<HelcimTransaction>)
}

export async function getTransaction(access: HelcimAccess, id: string): Promise<HelcimTransaction | null> {
  try {
    const body = await request<unknown>(access, 'GET', `/card-transactions/${encodeURIComponent(id)}`)
    return body && typeof body === 'object' && !Array.isArray(body) ? (body as HelcimTransaction) : (listFrom<HelcimTransaction>(body)[0] ?? null)
  } catch (error) {
    if (error instanceof HelcimError && error.status === 404) return null
    throw error
  }
}

export async function findInvoice(access: HelcimAccess, invoiceNumber: string): Promise<HelcimInvoice | null> {
  const body = await request<unknown>(access, 'GET', `/invoices?${new URLSearchParams({ invoiceNumber })}`)
  return listFrom<HelcimInvoice>(body).find((invoice) => sameInvoice(invoice.invoiceNumber, invoiceNumber)) ?? null
}

// ---------------------------------------------------------------------------
// Opening a payment
// ---------------------------------------------------------------------------

/** Helcim takes amounts in dollars with two decimals. */
const dollars = (minor: number, currency: string) => Number(fromMinor(minor, currency).toFixed(2))

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)

interface LineItem {
  sku: string
  description: string
  quantity: number
  price: number
  total: number
}

/**
 * The order as invoice lines. Their totals add up to exactly what is charged (Helcim requires
 * that), so shipping and tax are lines too. Helcim allows 20 lines; longer orders become one.
 */
export function invoiceLines(checkout: Checkout, totals: CheckoutTotals): LineItem[] {
  const currency = checkout.currency
  const lines: LineItem[] = totals.lines
    .filter((line) => line.unitMinor > 0)
    .map((line, index) => ({
      sku: `ITEM-${index + 1}`,
      description: clip(line.item.name || 'Item', 120),
      quantity: line.item.quantity,
      price: dollars(line.unitMinor, currency),
      total: dollars(line.lineMinor, currency),
    }))
  if (totals.shippingMinor > 0) {
    const amount = dollars(totals.shippingMinor, currency)
    lines.push({ sku: 'SHIPPING', description: 'Shipping & handling', quantity: 1, price: amount, total: amount })
  }
  if (totals.taxMinor > 0) {
    const amount = dollars(totals.taxMinor, currency)
    lines.push({ sku: 'TAX', description: `Tax (${formatRate(checkout.taxRate)}%)`, quantity: 1, price: amount, total: amount })
  }
  if (lines.length <= 20) return lines
  const amount = dollars(totals.totalMinor, currency)
  return [{ sku: 'ORDER', description: clip(checkout.title || 'Order', 120), quantity: 1, price: amount, total: amount }]
}

/** Makes Helcim's payment window match the site: dark, with the site's blue and round buttons. */
const STYLING = { appearance: 'dark', brandColor: '2997FF', cornerRadius: 'pill', ctaButtonText: 'pay' }

export interface Session {
  checkoutToken: string
}

function isRejection(error: unknown): boolean {
  return error instanceof HelcimError && (error.status === 400 || error.status === 409 || error.status === 422)
}

/**
 * Asks Helcim to open a payment for this order, tied to the order's invoice.
 *
 * Prices come from the order as stored in the database, never from the browser, so a buyer
 * cannot change what they are charged.
 *
 * Helcim creates the invoice the first time and reuses it afterwards. Its documentation leaves
 * a few details open (for instance exactly when a new invoice starts to exist), so rather than
 * guess, this tries the most likely form first and falls back when Helcim says no:
 *   1. with the window styling,  2. without it,  3. the other way of naming the invoice.
 * Every form charges the same amount against the same invoice number.
 */
export async function openPayment(access: HelcimAccess, checkout: Checkout, invoiceNumber: string, invoiceExists: boolean): Promise<Session> {
  const totals = checkoutTotals(checkout)
  const base = {
    paymentType: 'purchase',
    amount: dollars(totals.totalMinor, checkout.currency),
    currency: checkout.currency,
    confirmationScreen: false,
  }
  const existing = { invoiceNumber }
  const fresh = { invoiceRequest: { invoiceNumber, lineItems: invoiceLines(checkout, totals) } }
  const [first, second] = invoiceExists ? [existing, fresh] : [fresh, existing]

  const attempts = [
    { ...base, ...first, customStyling: STYLING },
    { ...base, ...first },
    { ...base, ...second },
  ]
  let lastError: unknown
  for (const body of attempts) {
    try {
      const session = await request<{ checkoutToken?: unknown }>(access, 'POST', '/helcim-pay/initialize', body)
      if (typeof session?.checkoutToken === 'string' && session.checkoutToken) return { checkoutToken: session.checkoutToken }
      lastError = new HelcimError(502, ['Helcim did not return a payment window.'])
    } catch (error) {
      lastError = error
      // Only "Helcim did not accept this request" is worth trying differently.
      if (!isRejection(error)) throw error
    }
  }
  throw lastError
}

// ---------------------------------------------------------------------------
// Has it been paid?
// ---------------------------------------------------------------------------

export interface PaymentRecord {
  state: 'paid'
  amount: number
  currency: string
  paidAt: string
}

function zoneOffsetMinutes(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs))
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return (Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'), part('second')) - utcMs) / 60000
}

/** Helcim reports times in Mountain Time ("2026-02-04 11:40:21"). Returns the same moment as an ISO string. */
export function helcimDate(value: unknown): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(String(value ?? ''))
  if (!m) return ''
  const [year, month, day, hour, minute, second] = m.slice(1).map((n) => Number(n ?? 0))
  const asIfUtc = Date.UTC(year, month - 1, day, hour, minute, second)
  return new Date(asIfUtc - zoneOffsetMinutes(asIfUtc, 'America/Edmonton') * 60000).toISOString()
}

const cents = (list: HelcimTransaction[]) => list.reduce((sum, t) => sum + Math.round(Math.abs(Number(t.amount)) * 100 || 0), 0)

/**
 * The payment for one invoice, worked out from Helcim's transactions: approved charges minus
 * approved refunds. Transactions for any other invoice are ignored, which is what ties a
 * payment to one checkout and to nothing else.
 */
export function paymentFor(transactions: HelcimTransaction[], invoiceNumber: string): PaymentRecord | null {
  const mine = transactions.filter(
    (t) => sameInvoice(t.invoiceNumber, invoiceNumber) && String(t.status ?? '').toUpperCase() === 'APPROVED',
  )
  const kind = (t: HelcimTransaction) => String(t.type ?? '').toLowerCase()
  const charged = mine.filter((t) => ['purchase', 'capture'].includes(kind(t)))
  if (charged.length === 0) return null
  const returned = mine.filter((t) => ['refund', 'reverse'].includes(kind(t)))
  const net = cents(charged) - cents(returned)
  if (net <= 0) return null
  const dates = charged.map((t) => helcimDate(t.dateCreated)).filter(Boolean).sort()
  return {
    state: 'paid',
    amount: net / 100,
    currency: String(charged[0].currency ?? '').toUpperCase(),
    paidAt: dates[dates.length - 1] ?? '',
  }
}

// ---------------------------------------------------------------------------
// Errors people can act on
// ---------------------------------------------------------------------------

export interface Failure {
  status: number
  error: string
  code: string
}

export function describeHelcimError(error: unknown): Failure {
  if (error instanceof HelcimError) {
    if (error.status === 401) {
      return {
        status: 503,
        code: 'helcim_auth',
        error: 'Helcim rejected the API token. Check HELCIM_API_TOKEN in your Netlify environment variables.',
      }
    }
    if (error.status === 403) {
      return {
        status: 503,
        code: 'helcim_permission',
        error:
          'The Helcim API token is not allowed to do this. In Helcim, open the token’s access settings and give it “Positive Transaction” for transaction processing and “Read and Write” for general.',
      }
    }
    if (error.status === 429) {
      return { status: 429, code: 'helcim_rate_limit', error: 'Too many payment requests right now. Try again in a moment.' }
    }
    if (error.status === 0 || error.status >= 500) {
      return { status: 502, code: 'helcim_unavailable', error: 'Could not reach Helcim. Try again in a moment.' }
    }
    return {
      status: 400,
      code: 'helcim_invalid',
      error: clip(`Helcim could not start this payment: ${error.errors.join(' ') || `error ${error.status}`}`, 400),
    }
  }
  return { status: 500, code: 'error', error: 'The payment service hit an error. Try again in a moment.' }
}

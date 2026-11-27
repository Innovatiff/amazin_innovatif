import { checkoutTotals } from '../../designs/src/lib/checkout'
import { PAYMENT_CURRENCIES } from '../../designs/src/lib/currencies'
import { INVOICE_PREFIX, invoiceNumberFor } from '../../designs/src/lib/invoice'
import { normalizeCheckout } from '../../designs/src/lib/normalize'
import { verifyManager, type VerifiedManager } from './firebase-auth'
import { getCheckout } from './firestore'
import {
  describeHelcimError,
  findInvoice,
  getTransaction,
  helcimFromEnv,
  listTransactions,
  openPayment,
  paymentFor,
  type HelcimAccess,
  type HelcimTransaction,
  type PaymentRecord,
} from './helcim'
import { DOC_ID, TRANSACTION_ID, fail, json, withCors, type Handler } from './http'

/** Everything a handler touches outside its own logic, so the tests can swap it out. */
export interface Deps {
  helcim(): HelcimAccess | null
  getCheckout(id: string): Promise<Record<string, unknown> | null>
  verifyManager(req: Request): Promise<VerifiedManager | null>
}

export const defaultDeps: Deps = { helcim: helcimFromEnv, getCheckout, verifyManager }

const message = (error: unknown) => (error instanceof Error ? error.message : String(error))

/** POST { id } → { checkoutToken } that opens Helcim's payment window for that order. */
export function createCheckoutHandler(deps: Deps = defaultDeps): Handler {
  return withCors(async (req) => {
    if (req.method !== 'POST') return fail(405, 'Use POST.')
    const body = (await req.json().catch(() => null)) as { id?: unknown } | null
    const id = typeof body?.id === 'string' ? body.id : ''
    if (!DOC_ID.test(id)) return fail(400, 'Invalid checkout id.', 'bad_request')

    const helcim = deps.helcim()
    if (!helcim) return fail(503, 'Online payment isn’t switched on yet.', 'not_configured')

    let raw: Record<string, unknown> | null
    try {
      raw = await deps.getCheckout(id)
    } catch (error) {
      console.error('checkout-create: could not read the order', message(error))
      return fail(502, 'This order could not be loaded. Try again in a moment.', 'store_unavailable')
    }
    if (!raw) return fail(404, 'This order does not exist or has been deleted.', 'not_found')

    const checkout = normalizeCheckout(raw, {
      id,
      createdAt: String(raw.createdAt ?? ''),
      updatedAt: String(raw.updatedAt ?? ''),
    })
    if (checkout.markedPaidAt) return fail(409, 'This order has already been paid.', 'already_paid')
    if (checkoutTotals(checkout).totalMinor <= 0) return fail(400, 'This order has nothing to pay.', 'empty')
    if (!PAYMENT_CURRENCIES.includes(checkout.currency)) {
      return fail(400, `Card payments are taken in CAD or USD, and this order is in ${checkout.currency}.`, 'currency')
    }

    const invoiceNumber = invoiceNumberFor(id)

    try {
      if (paymentFor(await listTransactions(helcim, { invoiceNumber }), invoiceNumber)) {
        return fail(409, 'This order has already been paid.', 'already_paid')
      }
    } catch (error) {
      // This only guards against paying twice; never block a payment on it.
      console.warn('checkout-create: payment lookup failed', message(error))
    }

    let invoiceExists = false
    try {
      invoiceExists = Boolean(await findInvoice(helcim, invoiceNumber))
    } catch (error) {
      // openPayment tries both ways of naming the invoice, so not knowing is fine.
      console.warn('checkout-create: invoice lookup failed', message(error))
    }

    try {
      const session = await openPayment(helcim, checkout, invoiceNumber, invoiceExists)
      return json({ checkoutToken: session.checkoutToken, invoiceNumber })
    } catch (error) {
      console.error('checkout-create: Helcim refused the payment', message(error))
      const failure = describeHelcimError(error)
      return fail(failure.status, failure.error, failure.code)
    }
  })
}

/**
 * GET ?id=…[&transaction=…] → whether an order has been paid, according to Helcim.
 * Public, and it never returns personal data: only paid or not, the amount and the date.
 */
export function createStatusHandler(deps: Deps = defaultDeps): Handler {
  return withCors(async (req) => {
    if (req.method !== 'GET') return fail(405, 'Use GET.')
    const params = new URL(req.url).searchParams
    const id = params.get('id') ?? ''
    const transactionId = params.get('transaction') ?? ''
    if (!DOC_ID.test(id)) return fail(400, 'Invalid checkout id.', 'bad_request')

    const helcim = deps.helcim()
    if (!helcim) return json({ configured: false, state: 'unknown' })

    const invoiceNumber = invoiceNumberFor(id)
    try {
      const listed = await listTransactions(helcim, { invoiceNumber })
      let payment = paymentFor(listed, invoiceNumber)
      // Straight after paying, the page names the transaction, because Helcim's list can take a
      // moment to include it: until it does, look that one up directly. It only counts if it is
      // for this invoice. Once the list has it, the list decides — it also knows about refunds.
      const known = listed.some((transaction) => String(transaction.transactionId) === transactionId)
      if (!payment && !known && TRANSACTION_ID.test(transactionId)) {
        const transaction = await getTransaction(helcim, transactionId)
        payment = transaction ? paymentFor([transaction], invoiceNumber) : null
      }
      return json(payment ? { configured: true, ...payment } : { configured: true, state: 'unpaid' })
    } catch (error) {
      console.error('checkout-status: Helcim error', message(error))
      const failure = describeHelcimError(error)
      return json({ configured: true, state: 'unknown', error: failure.error, code: failure.code })
    }
  })
}

const DAY = 24 * 60 * 60 * 1000
const PAGE = 1000

/** GET with a manager's sign-in token → every paid checkout of the last 13 months, by invoice number. */
export function createPaymentsHandler(deps: Deps = defaultDeps): Handler {
  return withCors(async (req) => {
    if (req.method !== 'GET') return fail(405, 'Use GET.')
    const manager = await deps.verifyManager(req)
    if (!manager) return fail(401, 'Sign in to the manager portal to see payments.', 'unauthorized')

    const helcim = deps.helcim()
    if (!helcim) return json({ configured: false, payments: {} })

    try {
      const dateFrom = new Date(Date.now() - 400 * DAY).toISOString().slice(0, 10)
      const byInvoice = new Map<string, HelcimTransaction[]>()
      for (let page = 1; page <= 5; page++) {
        const batch = await listTransactions(helcim, { dateFrom, limit: PAGE, page })
        for (const transaction of batch) {
          const number = String(transaction.invoiceNumber ?? '').trim().toUpperCase()
          if (!number.startsWith(INVOICE_PREFIX)) continue
          byInvoice.set(number, [...(byInvoice.get(number) ?? []), transaction])
        }
        if (batch.length < PAGE) break
      }
      const payments: Record<string, Omit<PaymentRecord, 'state'>> = {}
      for (const [number, transactions] of byInvoice) {
        const payment = paymentFor(transactions, number)
        if (payment) payments[number] = { amount: payment.amount, currency: payment.currency, paidAt: payment.paidAt }
      }
      return json({ configured: true, payments })
    } catch (error) {
      console.error('checkout-payments: Helcim error', message(error))
      const failure = describeHelcimError(error)
      return fail(failure.status, failure.error, failure.code)
    }
  })
}

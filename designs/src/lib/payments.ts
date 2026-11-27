import { getIdToken } from './auth'

// Card payments run through Helcim. The browser never sees the Helcim API token and never
// decides what is charged: it sends only the checkout's id to the payment function
// (payments/ in this repository), which reads the order from the database, asks Helcim to open
// a payment for that amount, and later asks Helcim whether it was paid.

/** The payment function, on the site's own address (see "rewrites" in firebase.json). */
const API = '/api'
const HELCIM_SCRIPT = 'https://secure.helcim.app/helcim-pay/services/start.js'

export type PaymentState = 'paid' | 'unpaid' | 'unknown'

export interface PaymentStatus {
  /** False until the payment function has been published with a Helcim API token. */
  configured: boolean
  state: PaymentState
  amount?: number
  currency?: string
  paidAt?: string
  /** True when the owner marked the order as paid by hand. */
  manual?: boolean
  error?: string
  code?: string
}

export interface PaidInfo {
  amount: number
  currency: string
  paidAt: string
}

export class PaymentError extends Error {
  readonly code?: string
  constructor(message: string, code?: string) {
    super(message)
    this.code = code
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API}/${path}`, { ...init, headers: { accept: 'application/json', ...(init?.headers ?? {}) } })
  } catch {
    throw new PaymentError('Could not reach the payment service. Check your connection and try again.', 'network')
  }
  if (!(res.headers.get('content-type') ?? '').includes('application/json')) {
    // The function always answers in JSON. "Not found" in any other form means it has not been
    // published yet (see "Card payments" in the README).
    if (res.status === 404 || res.status === 403) throw new PaymentError('Online payment isn’t switched on yet.', 'not_configured')
    throw new PaymentError('The payment service did not answer as expected. Try again in a moment.', 'unavailable')
  }
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    throw new PaymentError(
      typeof body.error === 'string' ? body.error : `Payment request failed (${res.status}).`,
      typeof body.code === 'string' ? body.code : undefined,
    )
  }
  return body as T
}

declare global {
  interface Window {
    appendHelcimPayIframe?: (checkoutToken: string, allowExit?: boolean) => void
    removeHelcimPayIframe?: () => void
  }
}

let helcimScript: Promise<void> | null = null

/** Loads Helcim's payment-window script the first time someone presses Pay. */
function loadHelcim(): Promise<void> {
  if (typeof window.appendHelcimPayIframe === 'function') return Promise.resolve()
  helcimScript ??= new Promise<void>((resolve, reject) => {
    const failed = () => {
      helcimScript = null
      script.remove()
      reject(new PaymentError('The secure payment window could not be loaded. Check your connection and try again.', 'script'))
    }
    const script = document.createElement('script')
    script.src = HELCIM_SCRIPT
    script.async = true
    script.onload = () => (typeof window.appendHelcimPayIframe === 'function' ? resolve() : failed())
    script.onerror = failed
    document.head.append(script)
  })
  return helcimScript
}

function parsed(value: unknown): unknown {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}

/**
 * Finds the transaction id in whatever shape Helcim's window reports a success: the message can
 * arrive as text or as an object, with the transaction one or two levels down.
 */
export function transactionIdFrom(message: unknown): string {
  let value = parsed(message)
  for (let depth = 0; depth < 4 && value && typeof value === 'object'; depth++) {
    const record = value as Record<string, unknown>
    const id = record.transactionId
    if ((typeof id === 'string' || typeof id === 'number') && /^\d{1,20}$/.test(String(id))) return String(id)
    value = parsed(record.data)
  }
  return ''
}

function declineMessage(message: unknown): string {
  const text = typeof message === 'string' ? message.replace(/^HelcimPay\.js transaction failed\s*-\s*/i, '').trim() : ''
  // Helcim's own wording is shown when it is short and readable; otherwise a plain sentence.
  return text && text.length <= 160 && !/[{}<>]/.test(text)
    ? `The payment did not go through: ${text.replace(/\.$/, '')}. You have not been charged.`
    : 'The payment did not go through. You have not been charged. Check the card details or try another card.'
}

export type PaymentOutcome = { result: 'paid'; transactionId: string } | { result: 'closed' }

/**
 * Opens Helcim's secure payment window for the order and waits until the buyer pays, is declined
 * or closes it. "paid" here only means Helcim's window said so; the page then confirms it with
 * the payment function (see fetchPaymentStatus), which asks Helcim directly.
 */
export async function startPayment(checkoutId: string): Promise<PaymentOutcome> {
  const { checkoutToken } = await call<{ checkoutToken: string }>('checkout-create', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: checkoutId }),
  })
  if (typeof checkoutToken !== 'string' || !/^[A-Za-z0-9_-]{6,200}$/.test(checkoutToken)) {
    throw new PaymentError('The payment could not be started. Try again in a moment.', 'bad_token')
  }
  await loadHelcim()

  return new Promise<PaymentOutcome>((resolve, reject) => {
    const eventName = `helcim-pay-js-${checkoutToken}`
    const finish = (settle: () => void) => {
      window.removeEventListener('message', onMessage)
      try {
        window.removeHelcimPayIframe?.()
      } catch {
        /* the window is already gone */
      }
      settle()
    }
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { eventName?: unknown; eventStatus?: unknown; eventMessage?: unknown } | null
      if (!data || typeof data !== 'object' || data.eventName !== eventName) return
      if (data.eventStatus === 'SUCCESS') {
        const transactionId = transactionIdFrom(data.eventMessage)
        finish(() => resolve({ result: 'paid', transactionId }))
      } else if (data.eventStatus === 'ABORTED') {
        finish(() => reject(new PaymentError(declineMessage(data.eventMessage), 'declined')))
      } else if (data.eventStatus === 'HIDE') {
        finish(() => resolve({ result: 'closed' }))
      }
    }
    window.addEventListener('message', onMessage)
    try {
      window.appendHelcimPayIframe!(checkoutToken, true)
    } catch {
      finish(() => reject(new PaymentError('The secure payment window could not be opened. Try again in a moment.', 'open')))
    }
  })
}

/** Asks the payment function (and so Helcim) whether a checkout has been paid. */
export async function fetchPaymentStatus(checkoutId: string, transactionId?: string | null): Promise<PaymentStatus> {
  const query = new URLSearchParams({ id: checkoutId })
  if (transactionId) query.set('transaction', transactionId)
  try {
    return await call<PaymentStatus>(`checkout-status?${query}`)
  } catch (error) {
    const e = error as PaymentError
    if (e.code === 'not_configured') return { configured: false, state: 'unknown' }
    return { configured: true, state: 'unknown', error: e.message, code: e.code }
  }
}

/** Managers only: every paid checkout, keyed by its Helcim invoice number (see invoice.ts). */
export async function fetchPaidInvoices(): Promise<Record<string, PaidInfo>> {
  const token = await getIdToken()
  if (!token) return {}
  const body = await call<{ payments?: Record<string, PaidInfo> }>('checkout-payments', {
    headers: { authorization: `Bearer ${token}` },
  })
  return body.payments ?? {}
}

// Remember which Helcim transaction paid an order in this browser, so the page can confirm it
// straight away after a refresh instead of waiting for Helcim's list to catch up.
const transactionKey = (id: string) => `innovatif:paid-transaction:${id}`

export function rememberPaidTransaction(checkoutId: string, transactionId: string) {
  try {
    localStorage.setItem(transactionKey(checkoutId), transactionId)
  } catch {
    /* optional */
  }
}

export function recallPaidTransaction(checkoutId: string): string | null {
  try {
    const value = localStorage.getItem(transactionKey(checkoutId))
    return value && /^\d{1,20}$/.test(value) ? value : null
  } catch {
    return null
  }
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Checkout, Delivery, DeliveryAddress } from '../types'
import { useAuth } from '../lib/auth'
import { countryName } from '../lib/countries'
import { db } from '../lib/db'
import { formatDate, formatMoney } from '../lib/format'
import { deliveryProblem, normalizeDelivery } from '../lib/normalize'
import {
  PaymentError,
  fetchPaymentStatus,
  recallPaidTransaction,
  rememberPaidTransaction,
  startPayment,
  type PaymentStatus,
} from '../lib/payments'
import { HOME, checkoutEditPath, checkoutPath, clientLink } from '../lib/routes'
import { SITE_NAME } from '../lib/site'
import { CheckoutPage, type DeliveryError } from '../components/CheckoutPage'
import { Menu } from '../components/Menu'
import { Splash } from '../components/Splash'
import {
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  EditIcon,
  LinkIcon,
  MoreIcon,
  PrintIcon,
  TrashIcon,
} from '../components/icons'

function StatusPill({ status }: { status: PaymentStatus | null }) {
  if (!status) return null
  if (status.state === 'paid') {
    return (
      <span className="pill pill-dark">
        Paid{status.amount ? ` · ${formatMoney(status.amount, status.currency || 'CAD')}` : ''}
        {status.manual ? ' · marked by hand' : ''}
      </span>
    )
  }
  if (!status.configured) {
    return (
      <span className="pill pill-gray" title="Follow “Card payments (Helcim)” in the README to switch payments on">
        Card payments not set up
      </span>
    )
  }
  if (status.code === 'helcim_auth') return <span className="pill pill-danger">Helcim rejected the API token</span>
  if (status.state === 'unknown') return status.error ? <span className="pill pill-gray">Payment status unavailable</span> : null
  return <span className="pill pill-gray">Awaiting payment</span>
}

const EMPTY_ADDRESS: DeliveryAddress = {
  name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
}

function deliveryLine(d: Delivery): string {
  const place = [d.city, d.region, d.postalCode].filter(Boolean).join(' ')
  return [d.name, d.line1, d.line2, place, countryName(d.country), d.phone].filter(Boolean).join(', ')
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

export default function CheckoutView() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const present = params.get('present') === '1'
  const owner = Boolean(user?.manager) && !present

  const [checkout, setCheckout] = useState<Checkout | null>(null)
  const [error, setError] = useState('')
  /** What Helcim says about this order. */
  const [remote, setRemote] = useState<PaymentStatus | null>(null)
  const [paying, setPaying] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [payError, setPayError] = useState('')
  const [notice, setNotice] = useState<'success' | 'canceled' | null>(null)
  const [address, setAddress] = useState<DeliveryAddress>(EMPTY_ADDRESS)
  const [addressError, setAddressError] = useState<DeliveryError | null>(null)
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    let alive = true
    setCheckout(null)
    setError('')
    db.checkouts
      .get(id)
      .then((c) => {
        if (!alive) return
        if (!c) setError('This checkout does not exist or has been deleted.')
        else {
          setCheckout(c)
          // One country to ship to: no need to make the client pick it.
          if (c.shipCountries.length === 1) setAddress((a) => ({ ...a, country: c.shipCountries[0] }))
        }
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Could not load this checkout.'))
    return () => {
      alive = false
    }
  }, [id])

  const loadStatus = useCallback(async () => {
    setRemote(await fetchPaymentStatus(id, recallPaidTransaction(id)))
  }, [id])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  // Delivery addresses are private: only a manager can read them.
  useEffect(() => {
    if (!owner || !checkout?.collectShipping) return
    let alive = true
    db.deliveries
      .list(id)
      .then((list) => alive && setDeliveries(list))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [owner, checkout?.collectShipping, id, remote?.state])

  useEffect(() => {
    document.title = checkout ? `${checkout.title} — Checkout` : `Checkout — ${SITE_NAME}`
    return () => {
      document.title = SITE_NAME
    }
  }, [checkout])

  // A mark made by hand counts as paid whatever Helcim says.
  const status = useMemo<PaymentStatus | null>(() => {
    if (checkout?.markedPaidAt) {
      return { configured: remote?.configured ?? true, state: 'paid', paidAt: checkout.markedPaidAt, manual: true }
    }
    return remote
  }, [checkout?.markedPaidAt, remote])

  const showToast = (message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2600)
  }

  /** Helcim's window said "paid": ask Helcim itself, a few times if its records need a moment. */
  const confirmPayment = async (transactionId: string): Promise<PaymentStatus> => {
    let latest: PaymentStatus = { configured: true, state: 'unknown' }
    for (let attempt = 0; attempt < 6; attempt++) {
      latest = await fetchPaymentStatus(id, transactionId || null)
      if (latest.state === 'paid') break
      await wait(1500)
    }
    return latest
  }

  const pay = async () => {
    if (paying || !checkout) return
    setPayError('')
    setNotice(null)

    let delivery: DeliveryAddress | null = null
    if (checkout.collectShipping) {
      delivery = normalizeDelivery(address)
      const problem = deliveryProblem(delivery, checkout.shipCountries)
      setAddressError(problem)
      if (problem) {
        document.getElementById(`d-${problem.field}`)?.focus()
        return
      }
    }

    setPaying(true)
    try {
      if (delivery) await db.deliveries.add(id, delivery)
      const outcome = await startPayment(id)
      if (outcome.result === 'closed') {
        setNotice('canceled')
        return
      }
      if (outcome.transactionId) rememberPaidTransaction(id, outcome.transactionId)
      setConfirming(true)
      const confirmed = await confirmPayment(outcome.transactionId)
      setRemote(confirmed)
      if (confirmed.state === 'paid') setNotice('success')
      else {
        setPayError(
          'Your payment went through, but this page could not confirm it yet. Please don’t pay again: refresh in a minute, or contact us.',
        )
      }
    } catch (e) {
      const err = e as PaymentError
      setPayError(err.message || 'The payment could not be started.')
      if (err.code === 'already_paid') void loadStatus()
    } finally {
      setPaying(false)
      setConfirming(false)
    }
  }

  const copyLink = async () => {
    const url = clientLink(checkoutPath(id))
    try {
      await navigator.clipboard.writeText(url)
      showToast('Client link copied')
    } catch {
      window.prompt('Copy this link', url)
    }
  }

  const duplicate = async () => {
    try {
      const copy = await db.checkouts.duplicate(id)
      navigate(checkoutEditPath(copy.id))
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not duplicate the checkout.')
    }
  }

  const markPaid = async (paid: boolean) => {
    if (!checkout) return
    try {
      await db.markPaid(id, paid)
      setCheckout({ ...checkout, markedPaidAt: paid ? new Date().toISOString() : '' })
      showToast(paid ? 'Marked as paid' : 'Paid mark removed')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not update the checkout.')
    }
  }

  const remove = async () => {
    if (!checkout) return
    const warning = status?.state === 'paid' && !status.manual ? ' It has been paid; the payment stays in your Helcim account.' : ''
    if (!window.confirm(`Delete “${checkout.title}”?${warning} This cannot be undone.`)) return
    try {
      await db.checkouts.remove(id)
      navigate(HOME)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not delete the checkout.')
    }
  }

  if (error) {
    return (
      <main className="message-page">
        <h1>Checkout not found</h1>
        <p>{error}</p>
        {owner && (
          <Link to={HOME} className="btn btn-dark">
            Back to all pages
          </Link>
        )}
      </main>
    )
  }

  const paidByCard = remote?.state === 'paid'

  return (
    <>
      {owner && (
        <section className="toolbar no-print" aria-label="Manage this checkout">
          <div className="toolbar-inner">
            <Link to={HOME} className="btn btn-ghost" aria-label="All pages">
              <ArrowLeftIcon size={16} />
              <span className="btn-label">All pages</span>
            </Link>
            <StatusPill status={status} />
            <div className="toolbar-actions">
              <button type="button" className="btn btn-ghost" onClick={() => window.print()} title="Print or save as PDF" aria-label="Print / PDF">
                <PrintIcon size={16} />
                <span className="btn-label">Print / PDF</span>
              </button>
              <button type="button" className="btn" onClick={copyLink} title="Copy a link for your client" aria-label="Copy client link">
                <LinkIcon size={16} />
                <span className="btn-label">Copy client link</span>
              </button>
              <Menu label={<MoreIcon size={16} />} ariaLabel="More actions">
                {!paidByCard &&
                  (checkout?.markedPaidAt ? (
                    <button type="button" className="menu-item" role="menuitem" onClick={() => markPaid(false)}>
                      <CheckIcon size={16} />
                      Remove the paid mark
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="menu-item"
                      role="menuitem"
                      onClick={() => markPaid(true)}
                      title="For cash, e-transfer or a payment taken outside this page"
                    >
                      <CheckIcon size={16} />
                      Mark as paid
                    </button>
                  ))}
                <button type="button" className="menu-item" role="menuitem" onClick={duplicate}>
                  <CopyIcon size={16} />
                  Duplicate checkout
                </button>
                <button type="button" className="menu-item menu-item-danger" role="menuitem" onClick={remove}>
                  <TrashIcon size={16} />
                  Delete checkout
                </button>
              </Menu>
              <Link to={checkoutEditPath(id)} className="btn btn-dark">
                <EditIcon size={16} />
                Edit
              </Link>
            </div>
          </div>
          {remote?.error && <div className="toolbar-note">{remote.error}</div>}
          {deliveries.length > 0 && (
            <div className="toolbar-note toolbar-delivery">
              <strong>Deliver to:</strong> {deliveryLine(deliveries[0])}
              {deliveries[0].createdAt && <span> · entered {formatDate(deliveries[0].createdAt)}</span>}
            </div>
          )}
        </section>
      )}

      {checkout ? (
        <CheckoutPage
          checkout={checkout}
          status={status}
          paying={paying}
          confirming={confirming}
          payError={payError}
          notice={notice}
          onPay={pay}
          delivery={{
            address,
            error: addressError,
            onChange: (patch) => {
              setAddress((a) => ({ ...a, ...patch }))
              setAddressError(null)
            },
          }}
        />
      ) : (
        <Splash />
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  )
}

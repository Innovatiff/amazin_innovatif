import type { ReactNode } from 'react'
import type { CheckoutInput, DeliveryAddress } from '../types'
import { checkoutTotals, formatRate, type CheckoutLine } from '../lib/checkout'
import { countryName } from '../lib/countries'
import { formatDate, formatMoney, hasCents, parseContact, parseDescription, pluralize, websiteHref } from '../lib/format'
import { Illustration } from '../lib/illustrations'
import { fromMinor } from '../lib/money'
import type { PaymentStatus } from '../lib/payments'
import { Img } from './Img'
import { CardIcon, CheckCircleIcon, CheckIcon, LockIcon, TruckIcon } from './icons'
import { Wordmark } from './Wordmark'

export interface DeliveryError {
  field: keyof DeliveryAddress
  message: string
}

/** The delivery-address form's state, owned by the page that shows the checkout. */
export interface DeliveryForm {
  address: DeliveryAddress
  error: DeliveryError | null
  onChange(patch: Partial<DeliveryAddress>): void
}

export interface CheckoutPageProps {
  checkout: CheckoutInput & { id?: string; updatedAt?: string }
  /** Rendered inside the editor: the pay button does nothing. */
  preview?: boolean
  /** Payment state (from Helcim, or marked by hand); null while loading. */
  status?: PaymentStatus | null
  paying?: boolean
  /** The buyer has paid in Helcim's window and the page is confirming it. */
  confirming?: boolean
  payError?: string
  notice?: 'success' | 'canceled' | null
  onPay?: () => void
  delivery?: DeliveryForm
}

type Fmt = (amount: number) => string

function ItemRow({ line, currency, fmt }: { line: CheckoutLine; currency: string; fmt: Fmt }) {
  const { item } = line
  const { paragraphs, bullets } = parseDescription(item.description)
  const unit = fromMinor(line.unitMinor, currency)
  const listUnit = fromMinor(line.listUnitMinor, currency)
  const onSale = line.listUnitMinor > line.unitMinor
  const pct = onSale ? Math.round(((line.listUnitMinor - line.unitMinor) / line.listUnitMinor) * 100) : 0
  return (
    <li className="co-item">
      <div className="co-item-art">
        {item.image ? (
          <Img src={item.image} className="co-item-img" alt={item.name} />
        ) : (
          <div className="artboard artboard-light">
            <Illustration k={item.illustration} size={64} />
          </div>
        )}
      </div>
      <div className="co-item-main">
        <h3>{item.name || 'Untitled product'}</h3>
        {paragraphs.map((p, i) => (
          <p className="co-item-desc" key={i}>
            {p}
          </p>
        ))}
        {bullets.length > 0 && (
          <ul className="checks">
            {bullets.map((b, i) => (
              <li key={i}>
                <CheckIcon size={15} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
        {onSale && (
          <div className="co-item-save">
            <span>
              List price: <s>{fmt(listUnit)}</s>
            </span>
            <span className="pill pill-blue">
              {line.unitMinor === 0 ? 'Free' : `Save ${fmt(listUnit - unit)} (${pct}%)`}
            </span>
          </div>
        )}
        <div className="co-item-meta">
          <span className="co-qty">Qty: {item.quantity}</span>
          {item.quantity > 1 && <span>{fmt(unit)} each</span>}
        </div>
      </div>
      <div className="co-item-price">{line.unitMinor === 0 ? 'Free' : fmt(fromMinor(line.lineMinor, currency))}</div>
    </li>
  )
}

const ADDRESS_FIELDS: { field: keyof DeliveryAddress; label: string; autoComplete: string; optional?: boolean; wide?: boolean }[] = [
  { field: 'name', label: 'Full name', autoComplete: 'name', wide: true },
  { field: 'line1', label: 'Street address', autoComplete: 'address-line1', wide: true },
  { field: 'line2', label: 'Apartment, suite, unit', autoComplete: 'address-line2', optional: true, wide: true },
  { field: 'city', label: 'Town or city', autoComplete: 'address-level2' },
  { field: 'region', label: 'Province or state', autoComplete: 'address-level1', optional: true },
  { field: 'postalCode', label: 'Postal or ZIP code', autoComplete: 'postal-code' },
  { field: 'phone', label: 'Phone', autoComplete: 'tel', optional: true },
]

/** Where to send the order. Shown only when the seller asked for a delivery address. */
function AddressFields({ form, countries }: { form: DeliveryForm; countries: string[] }) {
  const { address, error, onChange } = form
  return (
    <div className="co-address">
      {ADDRESS_FIELDS.map(({ field, label, autoComplete, optional, wide }) => (
        <label className={`co-field${wide ? ' co-field-wide' : ''}`} key={field} htmlFor={`d-${field}`}>
          <span>
            {label}
            {optional && <small> optional</small>}
          </span>
          <input
            id={`d-${field}`}
            className="input"
            type={field === 'phone' ? 'tel' : 'text'}
            autoComplete={autoComplete}
            value={address[field]}
            onChange={(e) => onChange({ [field]: e.target.value })}
            aria-invalid={error?.field === field || undefined}
          />
        </label>
      ))}
      <label className="co-field" htmlFor="d-country">
        <span>Country</span>
        <select
          id="d-country"
          className="input"
          autoComplete="country"
          value={address.country}
          onChange={(e) => onChange({ country: e.target.value })}
          aria-invalid={error?.field === 'country' || undefined}
        >
          {countries.length !== 1 && <option value="">Choose…</option>}
          {countries.map((code) => (
            <option value={code} key={code}>
              {countryName(code)}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p className="co-pay-error co-field-wide" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}

function SellerLine({ seller, contact }: { seller: string; contact: string }) {
  const parts = contact
    .split(/\s*(?:·|\||\n|,)\s*/)
    .map((p) => p.trim())
    .filter(Boolean)
  const nodes: ReactNode[] = []
  parts.forEach((part, i) => {
    const { email, website } = parseContact(part)
    let node: ReactNode = part
    if (email && part === email) node = <a href={`mailto:${email}`}>{email}</a>
    else if (website && part === website)
      node = (
        <a href={websiteHref(website)} target="_blank" rel="noreferrer">
          {website}
        </a>
      )
    nodes.push(<span key={i}>{node}</span>)
  })
  return (
    <p className="co-seller">
      {seller && (
        <span>
          Sold by <strong>{seller}</strong>
        </span>
      )}
      {nodes}
    </p>
  )
}

interface PayAreaProps {
  total: number
  fmt: Fmt
  status?: PaymentStatus | null
  paying?: boolean
  confirming?: boolean
  payError?: string
  preview?: boolean
  seller: string
  onPay?: () => void
}

function PayArea({ total, fmt, status, paying, confirming, payError, preview, seller, onPay }: PayAreaProps) {
  if (status?.state === 'paid') {
    return (
      <div className="co-paid" role="status">
        <CheckCircleIcon size={30} />
        <div>
          <strong>Paid</strong>
          <span>
            {fmt(status.amount ?? total)}
            {status.paidAt ? ` on ${formatDate(status.paidAt)}` : ''}
            {status.manual ? ' · confirmed by the seller' : ''}
          </span>
        </div>
      </div>
    )
  }
  const unavailable = !preview && status != null && !status.configured
  return (
    <div className="co-pay">
      <button
        type="button"
        className="btn btn-blue co-pay-btn"
        onClick={preview ? undefined : onPay}
        disabled={!preview && (paying || unavailable)}
        tabIndex={preview ? -1 : undefined}
      >
        <LockIcon size={18} />
        {confirming ? 'Confirming your payment…' : paying ? 'Opening secure payment…' : `Pay ${fmt(total)}`}
      </button>
      {unavailable ? (
        <p className="co-pay-note">
          Online payment isn't switched on yet. Contact {seller || 'the seller'} to complete this order.
        </p>
      ) : (
        <p className="co-pay-note">You’ll pay by card in a secure payment window run by Helcim, our payment processor.</p>
      )}
      {payError && (
        <p className="co-pay-error" role="alert">
          {payError}
        </p>
      )}
    </div>
  )
}

export function CheckoutPage({
  checkout,
  preview = false,
  status,
  paying,
  confirming,
  payError,
  notice,
  onPay,
  delivery,
}: CheckoutPageProps) {
  const currency = checkout.currency || 'CAD'
  const t = checkoutTotals(checkout)
  const exact = [t.total, t.shipping, t.tax, ...t.lines.map((l) => fromMinor(l.unitMinor, currency))].some(hasCents)
  const fmt: Fmt = (n) => formatMoney(n, currency, exact)
  const seller = checkout.preparedBy
  const paid = status?.state === 'paid'
  const unavailable = !preview && status != null && !status.configured
  const askAddress = checkout.collectShipping && !preview && !paid && Boolean(delivery)
  const shipTo = checkout.shipCountries.slice(0, 6).map(countryName).join(', ')
  const showShipping = t.shippingMinor > 0 || checkout.collectShipping

  // Inside the editor this is only a picture of the page: no second "banner" and "main" there.
  const Head = preview ? 'div' : 'header'
  const Main = preview ? 'div' : 'main'

  return (
    <div className={`co${preview ? ' co-preview' : ''}`}>
      <Head className="co-head">
        <div className="co-head-inner">
          <Wordmark to={null} tone="light" size="lg" label={seller || undefined} />
          <div className="co-head-title">
            Checkout <span>({pluralize(t.itemCount, 'item')})</span>
          </div>
          <div className="co-head-secure">
            <LockIcon size={16} />
            <span>Secure checkout</span>
          </div>
        </div>
      </Head>

      {notice === 'success' && paid && (
        <div className="co-banner co-banner-success" role="status">
          <div className="co-banner-inner">
            <CheckCircleIcon size={24} />
            <div>
              <strong>Thank you! Your order is placed.</strong>
              <span>
                We received your payment of {fmt(status?.amount ?? t.total)}
                {checkout.reference ? `. Order reference ${checkout.reference}` : ''}.
              </span>
            </div>
          </div>
        </div>
      )}
      {notice === 'canceled' && !paid && (
        <div className="co-banner" role="status">
          <div className="co-banner-inner">
            <LockIcon size={20} />
            <div>
              <strong>Payment canceled.</strong>
              <span>You have not been charged. You can pay whenever you're ready.</span>
            </div>
          </div>
        </div>
      )}

      <Main className="co-main">
        <div className="co-left">
          <div className="co-intro">
            <h1>{checkout.title || 'Untitled checkout'}</h1>
            {(checkout.client || checkout.reference) && (
              <p>
                {checkout.client && (
                  <>
                    Order for <strong>{checkout.client}</strong>
                  </>
                )}
                {checkout.client && checkout.reference && <span aria-hidden="true"> · </span>}
                {checkout.reference && <span className="co-ref">Ref {checkout.reference}</span>}
              </p>
            )}
          </div>

          <section className="co-card">
            <header className="co-step">
              <span className="co-step-n">1</span>
              <h2>Review items</h2>
              <span className="co-step-meta">{pluralize(t.itemCount, 'item')}</span>
            </header>
            {t.lines.length === 0 ? (
              <p className="co-empty">No products yet.</p>
            ) : (
              <ul className="co-items">
                {t.lines.map((line) => (
                  <ItemRow key={line.item.id} line={line} currency={currency} fmt={fmt} />
                ))}
              </ul>
            )}
          </section>

          <section className="co-card">
            <header className="co-step">
              <span className="co-step-n">2</span>
              <h2>{checkout.collectShipping ? 'Delivery & payment' : 'Payment'}</h2>
            </header>
            <div className="co-info-list">
              {checkout.collectShipping && (
                <div className="co-info">
                  <span className="co-info-icon">
                    <TruckIcon size={20} />
                  </span>
                  <div>
                    <strong>Delivery address</strong>
                    <p>
                      {paid ? 'We have your delivery address.' : preview ? 'The client fills in their address here before paying.' : 'Tell us where to send your order.'}
                      {shipTo && ` We ship to ${shipTo}${checkout.shipCountries.length > 6 ? ' and more' : ''}.`}
                    </p>
                    {askAddress && delivery && <AddressFields form={delivery} countries={checkout.shipCountries} />}
                  </div>
                </div>
              )}
              <div className="co-info">
                <span className="co-info-icon">
                  <CardIcon size={20} />
                </span>
                <div>
                  <strong>Pay securely by card</strong>
                  <p>Credit and debit cards, in a secure payment window run by Helcim.</p>
                </div>
              </div>
              <div className="co-info">
                <span className="co-info-icon">
                  <LockIcon size={20} />
                </span>
                <div>
                  <strong>Your details stay private</strong>
                  <p>Card details go straight to Helcim and are never stored on this site.</p>
                </div>
              </div>
            </div>
          </section>

          {checkout.notes && (
            <section className="co-card co-notes">
              <h2>Notes &amp; terms</h2>
              <p>{checkout.notes}</p>
            </section>
          )}

          {(seller || checkout.contact) && <SellerLine seller={seller} contact={checkout.contact} />}
        </div>

        <aside className="co-right" aria-label="Order summary">
          <div className="co-summary">
            <PayArea
              total={t.total}
              fmt={fmt}
              status={status}
              paying={paying}
              confirming={confirming}
              payError={payError}
              preview={preview}
              seller={seller}
              onPay={onPay}
            />
            <h2>Order summary</h2>
            <dl className="co-rows">
              <div>
                <dt>Items ({t.itemCount}):</dt>
                <dd>{fmt(t.subtotal)}</dd>
              </div>
              {showShipping && (
                <div>
                  <dt>Shipping &amp; handling:</dt>
                  <dd>{t.shippingMinor > 0 ? fmt(t.shipping) : 'Free'}</dd>
                </div>
              )}
              {t.taxMinor > 0 && (
                <>
                  <div className="co-row-rule">
                    <dt>Total before tax:</dt>
                    <dd>{fmt(t.beforeTax)}</dd>
                  </div>
                  <div>
                    <dt>Estimated tax ({formatRate(checkout.taxRate)}%):</dt>
                    <dd>{fmt(t.tax)}</dd>
                  </div>
                </>
              )}
            </dl>
            <div className="co-total">
              <span>Order total</span>
              <strong>{fmt(t.total)}</strong>
            </div>
            {t.savingsMinor > 0 && (
              <div className="co-savings">
                <CheckIcon size={16} />
                <span>
                  You save {fmt(t.savings)} ({t.savingsPct}%) compared with list prices
                </span>
              </div>
            )}
          </div>
          <p className="co-trust">
            <LockIcon size={14} />
            Payments are processed securely by Helcim
          </p>
        </aside>
      </Main>

      {!preview && (
        <section className="co-mobilebar no-print" aria-label="Order total and payment">
          <div className="co-mobilebar-total">
            <span>Order total</span>
            <strong>{fmt(t.total)}</strong>
          </div>
          {paid ? (
            <span className="pill pill-blue co-mobilebar-paid">
              <CheckIcon size={14} /> Paid
            </span>
          ) : (
            <button type="button" className="btn btn-blue" onClick={onPay} disabled={paying || unavailable}>
              <LockIcon size={16} />
              {confirming ? 'Confirming…' : paying ? 'Opening…' : 'Pay now'}
            </button>
          )}
        </section>
      )}
    </div>
  )
}

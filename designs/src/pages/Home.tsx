import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Checkout, Page } from '../types'
import { useAuth } from '../lib/auth'
import { db } from '../lib/db'
import { pluralize } from '../lib/format'
import { seedCheckout, seedPage } from '../lib/normalize'
import { invoiceNumberFor } from '../lib/invoice'
import { fetchPaidInvoices, type PaidInfo } from '../lib/payments'
import { NEW_CHECKOUT, NEW_QUOTE, PORTAL } from '../lib/routes'
import { SITE_NAME } from '../lib/site'
import { Menu } from '../components/Menu'
import { CheckoutCard, PageCard } from '../components/PageCard'
import { LogoMark } from '../components/Logo'
import { CartIcon, CloseIcon, LogoutIcon, PlusIcon, SearchIcon, TagIcon } from '../components/icons'

type Entry = { kind: 'page'; doc: Page } | { kind: 'checkout'; doc: Checkout }

function haystack(entry: Entry): string {
  const d = entry.doc
  const names = entry.kind === 'page' ? entry.doc.services.map((s) => s.name) : entry.doc.items.map((i) => i.name)
  const kind = entry.kind === 'page' ? 'pricing page proposal' : 'checkout order'
  return [d.title, d.client, d.reference, kind, ...names].join(' ').toLowerCase()
}

function matches(entry: Entry, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const text = haystack(entry)
  return words.every((w) => text.includes(w))
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  return Boolean(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable))
}

/** An icon from the website's own icon file, so the bar matches the portal exactly. */
function PortalIcon({ name }: { name: string }) {
  return (
    <svg className="portalbar-icon" aria-hidden="true" focusable="false">
      <use href={`/assets/icons.svg#${name}`} />
    </svg>
  )
}

function NewMenu() {
  return (
    <Menu
      buttonClassName="btn btn-dark"
      label={
        <>
          <PlusIcon size={16} />
          New page
        </>
      }
    >
      <Link to={NEW_QUOTE} className="menu-item menu-item-rich" role="menuitem">
        <TagIcon size={18} />
        <span>
          <strong>Pricing page</strong>
          <small>Your price next to the market price</small>
        </span>
      </Link>
      <Link to={NEW_CHECKOUT} className="menu-item menu-item-rich" role="menuitem">
        <CartIcon size={18} />
        <span>
          <strong>Checkout</strong>
          <small>Products, quantities and card payment</small>
        </span>
      </Link>
    </Menu>
  )
}

export default function Home() {
  const { user, signOut } = useAuth()
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [paid, setPaid] = useState<Record<string, PaidInfo>>({})
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [seeding, setSeeding] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = () =>
    Promise.all([db.pages.list(), db.checkouts.list()]).then(([pages, checkouts]) => {
      const all: Entry[] = [
        ...pages.map((doc): Entry => ({ kind: 'page', doc })),
        ...checkouts.map((doc): Entry => ({ kind: 'checkout', doc })),
      ]
      return all.sort((a, b) => b.doc.updatedAt.localeCompare(a.doc.updatedAt))
    })

  useEffect(() => {
    document.title = `Designs — ${SITE_NAME}`
    let alive = true
    load()
      .then((list) => alive && setEntries(list))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Could not load your pages.'))
    // Payment badges are a bonus: never block the list on the payment service.
    fetchPaidInvoices()
      .then((map) => alive && setPaid(map))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '/' && !isTypingTarget(event.target) && !event.metaKey && !event.ctrlKey) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const filtered = useMemo(() => (entries ?? []).filter((e) => matches(e, query)), [entries, query])

  const addExamples = async () => {
    setSeeding(true)
    setError('')
    try {
      await db.pages.create(seedPage())
      await db.checkouts.create(seedCheckout())
      setEntries(await load())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the examples.')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <>
      {/* The same bar as the manager portal, so Messages, Booking leads and Designs read as one place. */}
      <header className="portalbar">
        <a className="portalbar-brand" href="/" aria-label={`${SITE_NAME} — open the website`}>
          <LogoMark size={22} />
          <span>{SITE_NAME}</span>
        </a>
        <nav className="portalbar-tabs" aria-label="Manager portal">
          <a className="portalbar-tab" href={PORTAL}>
            <PortalIcon name="tray" />
            <span>Messages</span>
          </a>
          <a className="portalbar-tab" href={`${PORTAL}#bookings`}>
            <PortalIcon name="calendar-check" />
            <span className="portalbar-full">Booking leads</span>
            <span className="portalbar-short">Bookings</span>
          </a>
          <span className="portalbar-tab" aria-current="page">
            <PortalIcon name="palette" />
            <span>Designs</span>
          </span>
        </nav>
        <div className="portalbar-user">
          <span className="portalbar-email">{user?.email}</span>
          <button type="button" className="btn btn-sm" onClick={() => signOut()} title="Sign out">
            <LogoutIcon size={15} />
            <span className="btn-label">Sign out</span>
          </button>
        </div>
      </header>

      <main className="home">
        <div className="home-head">
          <div>
            <h1>Designs</h1>
            <p>Pricing pages and checkouts you send to clients.</p>
          </div>
          <NewMenu />
        </div>
        <div className="search-wrap">
          <label className="search">
            <SearchIcon size={20} />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, clients or products"
              aria-label="Search pages"
              autoComplete="off"
            />
            {query ? (
              <button type="button" className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">
                <CloseIcon size={16} />
              </button>
            ) : (
              <kbd>/</kbd>
            )}
          </label>
          {entries && entries.length > 0 && (
            <p className="search-count">
              {query
                ? `${filtered.length} of ${pluralize(entries.length, 'page')}`
                : `${pluralize(entries.length, 'page')} · newest first`}
            </p>
          )}
        </div>

        {error && (
          <div className="notice notice-error" role="alert">
            {error}
          </div>
        )}

        {entries === null && !error && (
          <div className="grid" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div className="card card-skeleton" key={i} />
            ))}
          </div>
        )}

        {entries && entries.length === 0 && (
          <div className="empty">
            <h2>No pages yet</h2>
            <p>Create a pricing page or a checkout for a client, or add examples to see how finished ones look.</p>
            <div className="empty-actions">
              <Link to={NEW_QUOTE} className="btn btn-dark btn-lg">
                <TagIcon size={16} />
                New pricing page
              </Link>
              <Link to={NEW_CHECKOUT} className="btn btn-dark btn-lg">
                <CartIcon size={16} />
                New checkout
              </Link>
              <button type="button" className="btn btn-lg" onClick={addExamples} disabled={seeding}>
                {seeding ? 'Adding…' : 'Add examples'}
              </button>
            </div>
          </div>
        )}

        {entries && entries.length > 0 && filtered.length === 0 && (
          <div className="empty">
            <p>No pages match “{query}”.</p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="grid">
            {filtered.map((entry) =>
              entry.kind === 'page' ? (
                <PageCard key={`p-${entry.doc.id}`} page={entry.doc} />
              ) : (
                <CheckoutCard key={`c-${entry.doc.id}`} checkout={entry.doc} paid={paid[invoiceNumberFor(entry.doc.id)]} />
              ),
            )}
          </div>
        )}
      </main>
    </>
  )
}

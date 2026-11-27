import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Page } from '../types'
import { useAuth } from '../lib/auth'
import { db } from '../lib/db'
import { Menu } from '../components/Menu'
import { Proposal } from '../components/Proposal'
import { ArrowLeftIcon, CloseIcon, CopyIcon, EditIcon, ExpandIcon, LinkIcon, MoreIcon, PrintIcon, TrashIcon } from '../components/icons'
import { Splash } from '../components/Splash'
import { HOME, clientLink, quoteEditPath, quotePath } from '../lib/routes'
import { SITE_NAME } from '../lib/site'

export default function PageView() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { user } = useAuth()
  const present = params.get('present') === '1'
  const owner = Boolean(user?.manager)

  const [page, setPage] = useState<Page | null>(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    let alive = true
    setPage(null)
    setError('')
    db.pages.get(id)
      .then((p) => {
        if (!alive) return
        if (!p) setError('This page does not exist or has been deleted.')
        else setPage(p)
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Could not load this page.'))
    return () => {
      alive = false
    }
  }, [id])

  useEffect(() => {
    document.title = page ? `${page.title} — ${SITE_NAME}` : SITE_NAME
    return () => {
      document.title = SITE_NAME
    }
  }, [page])

  useEffect(() => {
    document.body.classList.toggle('presenting', present)
    return () => document.body.classList.remove('presenting')
  }, [present])

  useEffect(() => {
    if (!present || !owner) return
    const leave = () => setParams({}, { replace: true })
    const onFullscreen = () => {
      if (!document.fullscreenElement) leave()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') leave()
    }
    document.addEventListener('fullscreenchange', onFullscreen)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreen)
      document.removeEventListener('keydown', onKey)
    }
  }, [present, owner, setParams])

  const showToast = (message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2400)
  }

  const startPresent = async () => {
    setParams({ present: '1' })
    try {
      await document.documentElement.requestFullscreen?.()
    } catch {
      /* fullscreen is optional */
    }
  }

  const exitPresent = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch {
        /* ignore */
      }
    }
    setParams({}, { replace: true })
  }

  const copyLink = async () => {
    // Clients never see the toolbar: it only appears for a signed-in manager.
    const url = clientLink(quotePath(id))
    try {
      await navigator.clipboard.writeText(url)
      showToast('Client link copied')
    } catch {
      window.prompt('Copy this link', url)
    }
  }

  const duplicate = async () => {
    try {
      const copy = await db.pages.duplicate(id)
      navigate(quoteEditPath(copy.id))
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not duplicate the page.')
    }
  }

  const remove = async () => {
    if (!page) return
    if (!window.confirm(`Delete “${page.title}”? This cannot be undone.`)) return
    try {
      await db.pages.remove(id)
      navigate(HOME)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not delete the page.')
    }
  }

  if (error) {
    return (
      <main className="message-page">
        <h1>Page not found</h1>
        <p>{error}</p>
        <Link to={HOME} className="btn btn-dark">
          Back to all pages
        </Link>
      </main>
    )
  }

  return (
    <>
      {owner && !present && (
        <section className="toolbar no-print" aria-label="Manage this page">
          <div className="toolbar-inner">
            <Link to={HOME} className="btn btn-ghost" aria-label="All pages">
              <ArrowLeftIcon size={16} />
              <span className="btn-label">All pages</span>
            </Link>
            <div className="toolbar-actions">
              <button type="button" className="btn btn-ghost toolbar-wide" onClick={startPresent} title="Present full screen" aria-label="Present">
                <ExpandIcon size={16} />
                <span className="btn-label">Present</span>
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => window.print()} title="Print or save as PDF" aria-label="Print / PDF">
                <PrintIcon size={16} />
                <span className="btn-label">Print / PDF</span>
              </button>
              <button type="button" className="btn" onClick={copyLink} title="Copy a link for your client" aria-label="Copy client link">
                <LinkIcon size={16} />
                <span className="btn-label">Copy client link</span>
              </button>
              <Menu label={<MoreIcon size={16} />} ariaLabel="More actions">
                <button type="button" className="menu-item" role="menuitem" onClick={duplicate}>
                  <CopyIcon size={16} />
                  Duplicate page
                </button>
                <button type="button" className="menu-item menu-item-danger" role="menuitem" onClick={remove}>
                  <TrashIcon size={16} />
                  Delete page
                </button>
              </Menu>
              <Link to={quoteEditPath(id)} className="btn btn-dark">
                <EditIcon size={16} />
                Edit
              </Link>
            </div>
          </div>
        </section>
      )}

      {page ? (
        <Proposal page={page} />
      ) : (
        <Splash />
      )}

      {present && owner && (
        <button type="button" className="present-exit no-print" onClick={exitPresent}>
          <CloseIcon size={14} />
          Exit · Esc
        </button>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  )
}

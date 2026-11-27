import { Suspense, lazy, useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { HOME, NEW_CHECKOUT, NEW_QUOTE, PORTAL } from './lib/routes'
import CheckoutView from './pages/CheckoutView'
import PageView from './pages/PageView'
import { Splash } from './components/Splash'

// The manager's screens are loaded only when a manager opens them, so the pages clients
// open (a quote or a checkout) stay small and fast.
const Home = lazy(() => import('./pages/Home'))
const Editor = lazy(() => import('./pages/Editor'))
const CheckoutEditor = lazy(() => import('./pages/CheckoutEditor'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/**
 * Manager-only screens. Signing in happens in the manager portal, so anyone who is not signed
 * in is sent there and brought back afterwards.
 */
function Gate({ children }: { children: ReactNode }) {
  const { loading, user, signOut } = useAuth()
  const { pathname } = useLocation()
  const signedOut = !loading && !user

  useEffect(() => {
    if (signedOut) window.location.replace(`${PORTAL}?next=${encodeURIComponent(pathname)}`)
  }, [signedOut, pathname])

  if (loading || !user) return <Splash />
  if (!user.manager) {
    return (
      <main className="message-page">
        <h1>This account can’t manage pages</h1>
        <p>
          {user.email ?? 'This account'} is signed in but isn’t on the managers list. Open the manager portal to see how to
          add it, or sign in with a different account.
        </p>
        <div className="message-actions">
          <a href={PORTAL} className="btn btn-dark">
            Open the manager portal
          </a>
          <button type="button" className="btn" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </main>
    )
  }
  return <>{children}</>
}

const gated = (element: ReactNode) => <Gate>{element}</Gate>

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Suspense fallback={<Splash />}>
      <Routes>
        <Route path={HOME} element={gated(<Home />)} />
        <Route path={NEW_QUOTE} element={gated(<Editor />)} />
        <Route path={NEW_CHECKOUT} element={gated(<CheckoutEditor />)} />
        {/* What clients open. A signed-in manager sees the same page with a toolbar on top. */}
        <Route path="/quote/:id" element={<PageView />} />
        <Route path="/checkout/:id" element={<CheckoutView />} />
        <Route path="/quote/:id/edit" element={gated(<Editor />)} />
        <Route path="/checkout/:id/edit" element={gated(<CheckoutEditor />)} />
        <Route path="*" element={<Navigate to={HOME} replace />} />
      </Routes>
      </Suspense>
    </AuthProvider>
  )
}

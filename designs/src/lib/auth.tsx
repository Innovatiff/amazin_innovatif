import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore/lite'
import { auth, firestore } from './firebase'

// Sign-in is the manager portal's sign-in. This app never shows a password form of its own:
// it reads who is signed in (the session is shared with /portal) and whether that account is
// on the "managers" list, exactly as the portal does.

export interface AuthUser {
  uid: string
  email: string | null
  /** Listed in the "managers" collection, so allowed to create and edit pages. */
  manager: boolean
}

/** Firebase ID token for the manager-only payment function. */
export function getIdToken(): Promise<string | null> {
  return auth.currentUser ? auth.currentUser.getIdToken().catch(() => null) : Promise.resolve(null)
}

interface AuthContextValue {
  loading: boolean
  user: AuthUser | null
  signOut(): Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ loading: boolean; user: AuthUser | null }>({ loading: true, user: null })

  useEffect(() => {
    let turn = 0
    return onAuthStateChanged(auth, (user) => {
      const mine = ++turn
      if (!user) {
        setState({ loading: false, user: null })
        return
      }
      getDoc(doc(firestore, 'managers', user.uid))
        .then(
          (snapshot) => snapshot.exists(),
          () => false,
        )
        .then((manager) => {
          if (mine === turn) setState({ loading: false, user: { uid: user.uid, email: user.email, manager } })
        })
    })
  }, [])

  const value = useMemo<AuthContextValue>(() => ({ ...state, signOut: () => firebaseSignOut(auth) }), [state])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}

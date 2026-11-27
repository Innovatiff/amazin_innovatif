import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
// The "lite" Firestore is enough here (read, add, change, delete — no live updates) and
// keeps the page that clients open small.
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore/lite'
import { EMULATORS, LOCAL, firebaseConfig } from './site'

// Same Firebase project and same sign-in as the manager portal, so signing in at /portal
// also signs you in here (and the other way round).
export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const firestore = getFirestore(app)

if (LOCAL) {
  connectFirestoreEmulator(firestore, EMULATORS.firestore[0], EMULATORS.firestore[1])
  connectAuthEmulator(auth, EMULATORS.auth, { disableWarnings: true })
}

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore/lite'
import type { DeliveryAddress } from '../types'
import type { Backend } from './db'
import { firestore } from './firebase'

function friendly(error: unknown): Error {
  const code = (error as { code?: string })?.code ?? ''
  const message = error instanceof Error ? error.message : String(error)
  if (code === 'permission-denied') {
    return new Error('You don’t have permission to do that. Sign in to the manager portal with a manager account and try again.')
  }
  if (code === 'unavailable') return new Error('Cannot reach the database. Check your internet connection and try again.')
  if (code === 'resource-exhausted') return new Error('The database has reached today’s limit. Try again later.')
  return error instanceof Error ? error : new Error(message)
}

async function run<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work()
  } catch (error) {
    throw friendly(error)
  }
}

/** Firestore timestamps and ISO strings alike → ISO string. */
function toISO(value: unknown): string {
  if (typeof value === 'string') return value
  const date = (value as { toDate?: () => Date } | null)?.toDate?.()
  return date instanceof Date ? date.toISOString() : ''
}

export const firestoreBackend: Backend = {
  list: (name) =>
    run(async () => {
      const snapshot = await getDocs(query(collection(firestore, name), orderBy('updatedAt', 'desc')))
      return snapshot.docs.map((d) => ({ id: d.id, data: d.data() }))
    }),

  get: (name, id) =>
    run(async () => {
      const snapshot = await getDoc(doc(firestore, name, id))
      return snapshot.exists() ? { id: snapshot.id, data: snapshot.data() } : null
    }),

  create: (name, data) => run(async () => (await addDoc(collection(firestore, name), data)).id),

  set: (name, id, data) => run(() => setDoc(doc(firestore, name, id), data)),

  patch: (name, id, data) => run(() => updateDoc(doc(firestore, name, id), data)),

  remove: (name, id) =>
    run(async () => {
      if (name === 'checkouts') {
        // Firestore keeps what is inside a deleted document; clients' addresses must not be left behind.
        const addresses = await getDocs(query(collection(firestore, 'checkouts', id, 'deliveries'), limit(200)))
        await Promise.all(addresses.docs.map((d) => deleteDoc(d.ref)))
      }
      await deleteDoc(doc(firestore, name, id))
    }),

  uploadImage: (dataUrl) =>
    run(async () => {
      const ref = await addDoc(collection(firestore, 'images'), { dataUrl, createdAt: new Date().toISOString() })
      return `img:${ref.id}`
    }),

  getImage: (id) =>
    run(async () => {
      const snapshot = await getDoc(doc(firestore, 'images', id))
      const data = snapshot.exists() ? snapshot.data() : null
      return data && typeof data.dataUrl === 'string' ? data.dataUrl : null
    }),

  addDelivery: (checkoutId, address) =>
    run(async () => {
      await addDoc(collection(firestore, 'checkouts', checkoutId, 'deliveries'), { ...address, createdAt: serverTimestamp() })
    }),

  listDeliveries: (checkoutId) =>
    run(async () => {
      const snapshot = await getDocs(
        query(collection(firestore, 'checkouts', checkoutId, 'deliveries'), orderBy('createdAt', 'desc'), limit(5)),
      )
      return snapshot.docs.map((d) => {
        const data = d.data() as Partial<DeliveryAddress> & { createdAt?: unknown }
        return { id: d.id, data: { ...data, createdAt: toISO(data.createdAt) } }
      })
    }),
}

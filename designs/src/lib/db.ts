import type { Checkout, CheckoutInput, Delivery, DeliveryAddress, Page, PageInput } from '../types'
import { firestoreBackend } from './db.firestore'
import { normalizeCheckout, normalizeCheckoutInput, normalizeDelivery, normalizeInput, normalizePage } from './normalize'

export type CollectionName = 'pages' | 'checkouts'

export interface StoredDoc {
  id: string
  data: Record<string, unknown>
}

/** Storage primitives (Firestore, in the same project as the manager portal). */
export interface Backend {
  list(collection: CollectionName): Promise<StoredDoc[]>
  get(collection: CollectionName, id: string): Promise<StoredDoc | null>
  create(collection: CollectionName, data: Record<string, unknown>): Promise<string>
  set(collection: CollectionName, id: string, data: Record<string, unknown>): Promise<void>
  /** Changes only the given fields. */
  patch(collection: CollectionName, id: string, data: Record<string, unknown>): Promise<void>
  remove(collection: CollectionName, id: string): Promise<void>
  /** Stores an image data URL and returns a reference such as `img:abc123`. */
  uploadImage(dataUrl: string): Promise<string>
  getImage(id: string): Promise<string | null>
  /** Saves a client's delivery address for a checkout. Anyone with the link may add one; only managers can read them. */
  addDelivery(checkoutId: string, address: DeliveryAddress): Promise<void>
  /** Newest first. Managers only. */
  listDeliveries(checkoutId: string): Promise<StoredDoc[]>
}

const backend: Promise<Backend> = Promise.resolve(firestoreBackend)

interface Meta {
  id: string
  createdAt: string
  updatedAt: string
}

function metaOf(doc: StoredDoc): Meta {
  const createdAt = typeof doc.data.createdAt === 'string' ? doc.data.createdAt : ''
  const updatedAt = typeof doc.data.updatedAt === 'string' ? doc.data.updatedAt : createdAt
  return { id: doc.id, createdAt, updatedAt }
}

export interface Repo<T extends Meta & { title: string }, I> {
  list(): Promise<T[]>
  get(id: string): Promise<T | null>
  create(input: I): Promise<T>
  update(id: string, input: I, createdAt: string): Promise<T>
  remove(id: string): Promise<void>
  duplicate(id: string): Promise<T>
}

function repo<T extends Meta & { title: string }, I extends object>(
  collection: CollectionName,
  toInput: (raw: unknown) => I,
  toDoc: (raw: unknown, meta: Meta) => T,
): Repo<T, I> {
  const nowISO = () => new Date().toISOString()

  const create = async (input: I): Promise<T> => {
    const b = await backend
    const now = nowISO()
    const data = toInput(input)
    const id = await b.create(collection, { ...data, createdAt: now, updatedAt: now })
    return toDoc(data, { id, createdAt: now, updatedAt: now })
  }

  const get = async (id: string): Promise<T | null> => {
    const doc = await (await backend).get(collection, id)
    return doc ? toDoc(doc.data, metaOf(doc)) : null
  }

  return {
    async list() {
      const docs = await (await backend).list(collection)
      return docs.map((d) => toDoc(d.data, metaOf(d))).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    },
    get,
    create,
    async update(id, input, createdAt) {
      const b = await backend
      const now = nowISO()
      const data = toInput(input)
      const created = createdAt || now
      await b.set(collection, id, { ...data, createdAt: created, updatedAt: now })
      return toDoc(data, { id, createdAt: created, updatedAt: now })
    },
    async remove(id) {
      await (await backend).remove(collection, id)
    },
    async duplicate(id) {
      const source = await get(id)
      if (!source) throw new Error('This page no longer exists.')
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = source
      return create(toInput({ ...rest, title: `${source.title} (copy)` }))
    },
  }
}

export const db = {
  pages: repo<Page, PageInput>('pages', normalizeInput, normalizePage),
  checkouts: repo<Checkout, CheckoutInput>('checkouts', normalizeCheckoutInput, normalizeCheckout),
  uploadImage: (dataUrl: string) => backend.then((b) => b.uploadImage(dataUrl)),
  getImage: (id: string) => backend.then((b) => b.getImage(id)),

  /** Marks a checkout as paid by hand (or clears the mark) without touching anything else in it. */
  markPaid: (checkoutId: string, paid: boolean) =>
    backend.then((b) => b.patch('checkouts', checkoutId, { markedPaidAt: paid ? new Date().toISOString() : '' })),

  deliveries: {
    add: (checkoutId: string, address: DeliveryAddress) => backend.then((b) => b.addDelivery(checkoutId, normalizeDelivery(address))),
    list: (checkoutId: string): Promise<Delivery[]> =>
      backend.then((b) => b.listDeliveries(checkoutId)).then((docs) =>
        docs.map((d) => ({
          ...normalizeDelivery(d.data),
          id: d.id,
          createdAt: typeof d.data.createdAt === 'string' ? d.data.createdAt : '',
        })),
      ),
  },
}

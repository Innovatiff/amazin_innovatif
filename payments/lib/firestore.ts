import site from '../../src/_data/site.js'

// Reads documents through the Firestore REST API. A checkout allows anyone to "get" it by id
// (that is how a client opens their link — see firestore.rules), so no service account or
// other secret is needed here.

interface Value {
  stringValue?: string
  integerValue?: string
  doubleValue?: number
  booleanValue?: boolean
  nullValue?: null
  timestampValue?: string
  arrayValue?: { values?: Value[] }
  mapValue?: { fields?: Record<string, Value> }
}

export function decodeValue(value: Value): unknown {
  if ('stringValue' in value) return value.stringValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return value.doubleValue
  if ('booleanValue' in value) return value.booleanValue
  if ('timestampValue' in value) return value.timestampValue
  if ('arrayValue' in value) return (value.arrayValue?.values ?? []).map(decodeValue)
  if ('mapValue' in value) return decodeFields(value.mapValue?.fields)
  return null
}

export function decodeFields(fields: Record<string, Value> | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(fields ?? {})) out[key] = decodeValue(value)
  return out
}

/** On a developer's computer (and in the tests) the local Firebase emulator stands in for the real database. */
const emulator = () => (process.env.FIRESTORE_EMULATOR_HOST ?? '').trim()

export function projectId(): string {
  return emulator() ? process.env.GCLOUD_PROJECT || 'demo-innovatif' : site.firebase.projectId
}

function documentUrl(path: string): string {
  const host = emulator()
  const root = host ? `http://${host}/v1` : 'https://firestore.googleapis.com/v1'
  const key = host ? '' : `?key=${encodeURIComponent(site.firebase.apiKey)}`
  return `${root}/projects/${projectId()}/databases/(default)/documents/${path}${key}`
}

export async function getCheckout(id: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(documentUrl(`checkouts/${encodeURIComponent(id)}`), { headers: { accept: 'application/json' } })
  if (res.status === 404) return null
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Firestore read failed (${res.status}): ${detail.slice(0, 300)}`)
  }
  const body = (await res.json()) as { fields?: Record<string, Value> }
  return decodeFields(body.fields)
}

/**
 * Is this signed-in account on the managers list? Asked as the user: the security rules let a
 * manager read their own entry in "managers" and nobody else's, so a 200 means yes.
 */
export async function isManager(uid: string, idToken: string): Promise<boolean> {
  const res = await fetch(documentUrl(`managers/${encodeURIComponent(uid)}`), {
    headers: { accept: 'application/json', authorization: `Bearer ${idToken}` },
  })
  return res.ok
}

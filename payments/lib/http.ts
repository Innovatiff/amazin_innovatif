/** Firestore auto IDs: letters and digits only. */
export const DOC_ID = /^[A-Za-z0-9]{1,64}$/
/** Helcim transaction ids are whole numbers. */
export const TRANSACTION_ID = /^\d{1,20}$/

export type Handler = (req: Request) => Promise<Response>

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

export function fail(status: number, error: string, code?: string): Response {
  return json(code ? { error, code } : { error }, status)
}

/**
 * The website (on Firebase Hosting) and these functions (on Netlify) live at different
 * addresses, so the browser needs permission to call across. Nothing here relies on cookies:
 * the public endpoints are public by design and the manager endpoint needs a sign-in token in
 * the request itself, so any origin may call.
 */
export function withCors(handler: Handler): Handler {
  const headers = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type',
    'access-control-max-age': '86400',
  }
  return async (req) => {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })
    const res = await handler(req)
    for (const [name, value] of Object.entries(headers)) res.headers.set(name, value)
    return res
  }
}

import { fail, type Handler } from './http'

// Firebase hands a function an Express-style request and response. The handlers in this
// folder speak the web's own Request and Response instead (which is what lets the tests call
// them directly), so this file translates between the two.

/** The parts of the incoming request that are used. */
export interface Incoming {
  method: string
  url?: string
  originalUrl?: string
  headers: Record<string, string | string[] | undefined>
  /** The body exactly as it arrived (Firebase provides it). */
  rawBody?: Uint8Array
}

/** The parts of the outgoing response that are used. */
export interface Outgoing {
  status(code: number): unknown
  setHeader(name: string, value: string): unknown
  send(body: string): unknown
}

const FORWARDED = ['authorization', 'content-type', 'accept']

function toRequest(req: Incoming, url: URL): Request {
  const headers = new Headers()
  for (const name of FORWARDED) {
    const value = req.headers[name]
    if (typeof value === 'string') headers.set(name, value)
  }
  const method = req.method.toUpperCase()
  const hasBody = method !== 'GET' && method !== 'HEAD' && req.rawBody != null && req.rawBody.length > 0
  // Everything sent here is JSON text.
  return new Request(url, { method, headers, body: hasBody ? new TextDecoder().decode(req.rawBody) : undefined })
}

/**
 * One function serves every payment address. The last part of the address picks the handler:
 * https://<the site>/api/checkout-status  →  "checkout-status".
 */
export function createApi(routes: Record<string, Handler>) {
  return async (req: Incoming, res: Outgoing): Promise<void> => {
    let response: Response
    try {
      // Only the path and the query matter; the host is whatever the visitor used.
      const url = new URL(req.originalUrl || req.url || '/', 'https://payments.invalid')
      const name = url.pathname.split('/').filter(Boolean).pop() ?? ''
      const handler = Object.hasOwn(routes, name) ? routes[name] : null
      response = handler ? await handler(toRequest(req, url)) : fail(404, 'There is nothing at this address.', 'unknown_address')
    } catch (error) {
      console.error('payments: unexpected error', error instanceof Error ? error.message : String(error))
      response = fail(500, 'The payment service hit an error. Try again in a moment.', 'error')
    }
    res.status(response.status)
    response.headers.forEach((value, name) => res.setHeader(name, value))
    res.send(await response.text())
  }
}

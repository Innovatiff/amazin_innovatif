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

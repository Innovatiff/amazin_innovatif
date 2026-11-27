// Every address the Designs screens use, in one place.
//
//   /portal/designs            the list (managers only)
//   /quote/<id>                a pricing page, as the client sees it
//   /checkout/<id>             a checkout, as the client sees it
//
// firebase.json sends all of these to the same small app.

export const PORTAL = '/portal'
export const HOME = '/portal/designs'
export const NEW_QUOTE = `${HOME}/new`
export const NEW_CHECKOUT = `${HOME}/new/checkout`

export const quotePath = (id: string) => `/quote/${id}`
export const quoteEditPath = (id: string) => `/quote/${id}/edit`
export const checkoutPath = (id: string) => `/checkout/${id}`
export const checkoutEditPath = (id: string) => `/checkout/${id}/edit`

/** The full link to send to a client. */
export const clientLink = (path: string) => `${window.location.origin}${path}`

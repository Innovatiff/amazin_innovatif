import { createPaymentsHandler } from '../lib/handlers'

// GET /.netlify/functions/checkout-payments  (manager sign-in token)  →  every paid checkout
export default createPaymentsHandler()

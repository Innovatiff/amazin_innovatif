import { createCheckoutHandler } from '../lib/handlers'

// POST /.netlify/functions/checkout-create  { id }  →  { checkoutToken } for Helcim's payment window
export default createCheckoutHandler()

import { createStatusHandler } from '../lib/handlers'

// GET /.netlify/functions/checkout-status?id=…  →  { state: "paid" | "unpaid" | "unknown", … }
export default createStatusHandler()

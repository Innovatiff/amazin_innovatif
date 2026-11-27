import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { createApi } from './lib/adapter'
import { createCheckoutHandler, createPaymentsHandler, createStatusHandler } from './lib/handlers'

// The payment service behind the checkouts, as one Firebase function.
//
// Firebase Hosting sends https://<the site>/api/… here (see "rewrites" in firebase.json), so
// the pages call their own address and nothing else:
//
//   POST /api/checkout-create     { id }  →  opens Helcim's payment window for that order
//   GET  /api/checkout-status     ?id=…   →  has that order been paid?
//   GET  /api/checkout-payments           →  every paid order (signed-in managers only)
//
// The Helcim API token never leaves Google's servers. It is kept in Secret Manager, not in
// this repository; set or replace it with
//
//   npx firebase functions:secrets:set HELCIM_API_TOKEN
//
// At run time Firebase puts it in process.env.HELCIM_API_TOKEN, which lib/helcim.ts reads.
const HELCIM_API_TOKEN = defineSecret('HELCIM_API_TOKEN')

const api = createApi({
  'checkout-create': createCheckoutHandler(),
  'checkout-status': createStatusHandler(),
  'checkout-payments': createPaymentsHandler(),
})

export const payments = onRequest(
  {
    region: 'us-central1', // the same region as the rewrite in firebase.json
    secrets: [HELCIM_API_TOKEN],
    invoker: 'public', // clients are not signed in; each handler checks what it needs to
    memory: '256MiB',
    timeoutSeconds: 30,
    maxInstances: 5, // plenty for a checkout, and a ceiling on what a flood of requests could cost
  },
  (req, res) => api(req, res),
)

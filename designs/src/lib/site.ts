// Everything the Designs screens need to know about the business comes from the same
// file as the rest of the website: src/_data/site.js. Change it there, not here.
import site from '../../../src/_data/site.js'

/** True on your own computer, where the site talks to the local Firebase emulators. */
export const LOCAL = typeof location !== 'undefined' && ['localhost', '127.0.0.1'].includes(location.hostname)

export const SITE_NAME: string = site.name

export const firebaseConfig = LOCAL ? { ...site.firebase, projectId: 'demo-innovatif' } : site.firebase

export const EMULATORS = { firestore: ['127.0.0.1', 8085] as const, auth: 'http://127.0.0.1:9099' }

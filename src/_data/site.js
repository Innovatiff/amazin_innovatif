/**
 * Everything about the business that appears across the site lives here.
 * Change a value, run `npm run build` (or just `npm run deploy`) and every
 * page, button and link picks it up.
 */
export default {
  name: 'Innovatif',
  legalName: 'Innovatif Developments',
  tagline: 'Print, websites, online booking and custom software for business.',

  // ── Contact details ────────────────────────────────────────────────────
  // While `phone` or `whatsapp` are empty, the Call / WhatsApp buttons are
  // left out and visitors are pointed to the message form instead, so the
  // site never shows a number that does not work.
  phone: '', //          full international number, e.g. '+15555550123'
  phoneDisplay: '', //   how it should read on the page, e.g. '(555) 555-0123'
  whatsapp: '', //       digits only with country code, e.g. '15555550123'
  email: '', //          public contact email (optional)
  address: '', //        street address or service area (optional)
  hours: '', //          e.g. 'Mon–Sat, 9 am – 6 pm' (optional)

  // The small round WhatsApp button that floats in the corner of every page
  // (it only appears once `whatsapp` above is filled in). Set to false to hide it.
  whatsappBubble: true,

  // Public web address, without a trailing slash, e.g. 'https://www.example.com'.
  // Used for share previews and the sitemap. Optional until the domain is live.
  url: '',

  // Stripe link for the $97 deposit that reserves a booking-system spot.
  depositLink: 'https://buy.stripe.com/aFa9AVdvEeWifgigOZasg0i',
  depositAmount: '$97',

  // Firebase web configuration (safe to publish — access is controlled by
  // firestore.rules, not by keeping these values secret).
  firebase: {
    apiKey: 'AIzaSyA8otaxHEu8AaYRrTvT9fmXqLPxv1-PJfA',
    authDomain: 'innovatif-f5cd1.firebaseapp.com',
    projectId: 'innovatif-f5cd1',
    storageBucket: 'innovatif-f5cd1.firebasestorage.app',
    messagingSenderId: '60075428113',
    appId: '1:60075428113:web:7a97f8fb8cb9ac2fd324b0',
  },
  firebaseSdkVersion: '13.4.0',

  year: new Date().getFullYear(),

  nav: [
    { label: 'Printing', href: '/printing', key: 'printing' },
    { label: 'Websites', href: '/websites', key: 'websites' },
    { label: 'Booking system', href: '/booking', key: 'booking' },
    { label: 'Software', href: '/software', key: 'software' },
    { label: 'Contact', href: '/contact', key: 'contact' },
  ],

  // The services a visitor can pick in the message form. `value` is what the
  // manager portal shows and filters by.
  enquiries: [
    { value: 'Printing', label: 'Printing & marketing' },
    { value: 'Websites', label: 'A website' },
    { value: 'Booking system', label: 'Online booking system' },
    { value: 'Software', label: 'Custom software' },
    { value: 'Design', label: 'Logo or graphic design' },
    { value: 'Other', label: 'Something else' },
  ],
};

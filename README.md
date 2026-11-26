# Innovatif website

The Innovatif site: printing, websites, the booking system, custom software, a
message form on every page, and a private **manager portal** where those
messages arrive. It runs on Firebase — Hosting for the site, Firestore for the
messages, Authentication for the portal login.

| Page | Address | What it is |
| --- | --- | --- |
| Home | `/` | Everything Innovatif does, at a glance |
| Printing | `/printing` | 54 products with photos, ~90 more listed. No prices — call, WhatsApp or message |
| Websites | `/websites` | Two plans: $49.99 and $99.99 (best offer) |
| Booking system | `/booking` | Starter / Pro / Elite with setup fees and the full comparison |
| Software | `/software` | POS, restaurant ordering, AI receptionist and more — call or message for pricing |
| Contact | `/contact` | Call, WhatsApp, or the message form |
| Get started | `/get-started` | The five-step booking-system form, with the deposit link |
| Manager portal | `/portal` | Sign in to read and manage messages and booking leads |

## First-time setup

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
```

### 1. Add your phone and WhatsApp number

Open `src/_data/site.js` and fill in `phone`, `phoneDisplay` and `whatsapp`
(plus `email`, `address`, `hours` and `url` if you want them shown). Until the
numbers are filled in, the Call and WhatsApp buttons stay hidden and visitors
are sent to the message form instead.

### 2. Turn on the portal login (once, in the Firebase console)

Open the [Firebase console](https://console.firebase.google.com) → project
**innovatif-f5cd1**.

1. **Authentication → Sign-in method** → enable **Email/Password**.
2. **Authentication → Users → Add user** → enter the email and password you
   want to sign in with. Copy the **User UID** it shows.
3. **Firestore Database → Start collection** → collection ID `managers` →
   document ID = the User UID you copied → add a field `email` with your email.
4. Recommended: **Authentication → Settings → User actions** → untick
   *Enable create (sign-up)*, so nobody else can create accounts.

Only accounts listed in `managers` can read anything. To add another manager,
repeat steps 2 and 3. (If someone signs in without being on the list, the
portal shows them their ID so you can add it.)

### 3. Publish

```bash
npx firebase login
```

```bash
npm run deploy
```

This builds the site, uploads it to Firebase Hosting and publishes the
security rules in `firestore.rules`.

> **Check before the first deploy:** publishing replaces the Firestore rules
> currently on the project. The new rules cover the `Contact`, `Bookings` and
> `managers` collections and close everything else. If this Firebase project
> stores other data, add rules for it first — or publish only the site with
> `npm run deploy:site`.

### 4. Point the deposit link back to the new form

In Stripe, set the deposit payment link's "after payment" address to
`https://YOUR-DOMAIN/get-started?payment=success`. (The old `/form.html`
address still forwards there.)

## How a message travels

1. A visitor presses **Get a quote** / **Send a message** on any page and fills
   in the form. Product buttons pre-fill what they are asking about.
2. The message is saved in Firestore, in the `Contact` collection. Visitors can
   only add a message — they can never read anyone's.
3. It appears in `/portal` straight away, without refreshing. There you can
   call, WhatsApp or email the customer in one tap, mark it *In progress* /
   *Done* / *Archived*, keep private notes, export the list, or delete it.

Booking-system requests from `/get-started` work the same way and appear under
**Booking leads**.

## Changing things

| To change… | Edit |
| --- | --- |
| Phone, WhatsApp, email, address, hours | `src/_data/site.js` |
| Website and booking prices, plan features, FAQs | `src/_data/plans.js` |
| Print products and categories | `src/_data/print.js` |
| Software products | `src/_data/software.js` |
| Home page sections | `src/_data/home.js` and `src/index.njk` |
| Colors, fonts, spacing | `src/assets/css/site.css` |

**Add a product photo:** put the full-size pictures in a folder, then

```bash
npm run images -- path/to/folder print
```

and add the product to `src/_data/print.js` using the picture's file name as
its `id`. (Use `software`, `web`, `booking` or `general` instead of `print` for
other sections.)

After any change, run `npm run deploy` again.

## Working on it locally

```bash
npm run dev
```

Opens the site at http://localhost:8080 and rebuilds as you edit. To also try
the message form and the portal locally, without touching the live database:

```bash
npm run emulators
```

Then open http://localhost:5000 (the emulator dashboard at
http://localhost:4000 lets you create a test user and its `managers` entry).
This needs Java installed.

## Checks

```bash
npm test
```

Runs 23 checks on the security rules (visitors can only send, strangers see
nothing, managers can only change status and notes).

```bash
npm run test:e2e
```

Drives a real browser through the whole flow — sending messages, the booking
form, signing in to the portal, reading, updating and deleting. The first time,
run `npx playwright install chromium`.

## What's in the folders

```
src/            The site's source: pages (.njk), data, styles, scripts, images
  _data/        Prices, products and contact details
  assets/img/   The photos, already sized for the web
public/         The built site (created by `npm run build`; not kept in git)
firestore.rules Who can read and write what
firebase.json   Hosting settings: clean addresses, old-page redirects, security headers
tests/          The checks described above
scripts/        Helpers for adding photos and icons
legacy/         The previous site, kept for reference — safe to delete
```

## Good to know

- **Spam:** the form ignores obvious bots and the rules reject anything that is
  not shaped like a real message. If spam ever becomes a problem, turn on
  Firebase **App Check** for Firestore.
- **Email alerts:** new messages show up live in the portal (with an optional
  sound — the bell button). Getting an email for each one needs a Cloud
  Function or the *Trigger Email* extension, which require the paid Blaze plan.
- **Photos:** the product photos are illustrations of what Innovatif makes; the
  brands in them are made-up examples. Swap in photos of real jobs whenever you
  have them.

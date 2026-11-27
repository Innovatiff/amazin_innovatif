# Amazing Innovatif website

The Amazing Innovatif site: printing, websites, the booking system, custom software, a
message form on every page, and a private **manager portal** where those
messages arrive — and where you build **pricing pages and checkouts** to send
to clients (the part that used to be the separate *Innovatif Designs* site).
It all runs on Firebase — Hosting for the site, Firestore for the data,
Authentication for the portal login, and one small function for card payments,
which go through **Helcim**.

| Page | Address | What it is |
| --- | --- | --- |
| Home | `/` | Everything the business does, at a glance |
| Printing | `/printing` | 54 products with photos, ~90 more listed. No prices — call, WhatsApp or message |
| Websites | `/websites` | Two plans: $49.99 and $99.99 (best offer) |
| Booking system | `/booking` | Starter / Pro / Elite with setup fees and the full comparison |
| Software | `/software` | POS, restaurant ordering, AI receptionist and more — call or message for pricing |
| Contact | `/contact` | Call, WhatsApp, or the message form |
| Get started | `/get-started` | The five-step booking-system form, with the deposit link |
| Manager portal | `/portal` | Sign in to read and manage messages and booking leads |
| Designs | `/portal/designs` | The portal's third tab: build pricing pages and checkouts for clients |
| A client's pricing page | `/quote/…` | What a client sees when they open a pricing-page link |
| A client's checkout | `/checkout/…` | The order, the delivery address and the card payment |

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

Once `whatsapp` is filled in, a small round WhatsApp button also floats in the
corner of every page. To hide it, set `whatsappBubble: false` in the same file.

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
portal shows them their ID so you can add it.) The same sign-in opens
**Designs** — there is no second account to create.

### 3. Publish

```bash
npx firebase login
```

```bash
npm run deploy:site
```

This builds the site, uploads it to Firebase Hosting and publishes the
security rules in `firestore.rules`. It works on Firebase's free plan.

Once card payments are set up (step 5) use `npm run deploy` instead: it
publishes the same two things **and** the payment function.

> **Check before the first deploy:** publishing replaces the Firestore rules
> currently on the project. The new rules cover `Contact`, `Bookings`,
> `managers`, and the three collections Designs uses (`pages`, `checkouts`,
> `images`), and close everything else. If this Firebase project stores other
> data, add rules for it first. (Designs needs the rules published at least
> once.)

### 4. Point the deposit link back to the new form

In Stripe, set the deposit payment link's "after payment" address to
`https://YOUR-DOMAIN/get-started?payment=success`. (The old `/form.html`
address still forwards there.)

### 5. Card payments on checkouts (Helcim)

Optional until you want clients to pay online — see
[Card payments (Helcim)](#card-payments-helcim) below. Until it is done,
checkouts still work as an order summary: the pay button tells the client that
online payment isn't switched on yet, and you can mark an order as paid by hand.

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

## Designs: pricing pages and checkouts

Sign in at `/portal` and open the **Designs** tab (or go straight to
`/portal/designs`). **New page** offers two kinds:

- **Pricing page** — your price next to what the market charges, service by
  service, with the saving worked out. Good for proposals. *Present* shows it
  full screen; *Print / PDF* gives a paper version.
- **Checkout** — products with quantities, a shipping fee, tax, and an optional
  delivery address. The client pays by card on the page.

Both editors show a live preview as you type. When you save, press **Copy
client link** and send that link to your client — it is the only thing they
need. Clients never sign in, and a link only opens its own page: nobody can
list your other pages.

What you see for a checkout:

- **Awaiting payment / Paid** on the checkout and on its card in the list. The
  paid state comes from Helcim itself, not from the client's browser.
- **Deliver to:** the address the client typed in, when you asked for one.
  Only managers can read it.
- **⋯ → Mark as paid** for cash, e-transfer or anything paid outside the page
  (and *Remove the paid mark* to undo it).

Everything is stored in the same Firebase project as the messages: `pages`,
`checkouts` (with each order's `deliveries`) and `images` (pictures you upload
are shrunk in the browser first). Pages made on the old Innovatif Designs site
are not copied over automatically.

## Card payments (Helcim)

A checkout's **Pay** button opens Helcim's own secure payment window on top of
the page. Card details go straight to Helcim and never touch this site.

The Helcim API token must stay secret, so it cannot live in the pages. One
small Firebase function (`payments/`) keeps it and talks to Helcim; the pages
reach it at `/api/…` on the site's own address. Nothing outside Firebase and
Helcim is involved.

### 1. Put the Firebase project on the Blaze plan

Firebase only runs functions on its pay-as-you-go plan. In the
[Firebase console](https://console.firebase.google.com) → project
**innovatif-f5cd1** → **Upgrade** → **Blaze**, and add a billing account.

Everything the site already uses stays free, and a function this small sits
inside the free monthly allowance, so expect a bill of zero or a few cents.
The upgrade screen offers a budget alert — set one for peace of mind.

### 2. Create the token in Helcim

1. Sign in to Helcim → **All Tools → Integrations → API Access Configuration**
   → **New API Access**.
2. Name it (for example "Website checkouts") and set the access restrictions:
   **General: Read & Write**, **Transaction Processing: Positive Transaction**.
   Settings can stay at *No Access*.
3. Tick the box saying the token is used for a **HelcimPay.js** checkout and
   list every address your checkouts open on, for example `https://innovatif.ca`,
   `https://www.innovatif.ca` and `https://innovatif-f5cd1.web.app`. Helcim's
   window does not open on an address that is not on this list.
4. Create it and copy the **API token**. Treat it like a password: never put it
   in this repository, in `site.js`, or in a chat or email.

### 3. Give the token to Firebase

```bash
npx firebase functions:secrets:set HELCIM_API_TOKEN
```

Paste the token when it asks for a value (nothing shows as you paste) and
press Enter. It is kept in Google's Secret Manager — not in this repository
and not on your computer. To replace the token later, run the same command
again and publish again.

### 4. Publish

```bash
npm run deploy
```

Use this command, not the `firebase deploy --only functions` that the previous
step suggests: the site has to be published together with the function so that
`/api` leads to it. The first time takes a few minutes while Firebase switches
on the Google services it needs. If it asks how many days to keep old
container images, press Enter to accept its suggestion.

### 5. Try it once with a real card

Make a checkout for a dollar, open its client link in a private window and pay
it. It should say **Paid** on the page and in Designs, and appear in Helcim as
an invoice numbered `ORD-…`. Refund it in Helcim and the checkout goes back to
*Awaiting payment*.

> **Do this test before sending a checkout to a client.** Opening a payment
> and looking payments up have been checked against the live Helcim; a real
> card going through has not. The automatic tests here use a stand-in for
> Helcim.

If something is off, open the checkout while signed in as a manager — the label
at the top says what: *Card payments not set up* (the function has not been
published — steps 1, 3 and 4), *Helcim rejected the API token* (wrong or
deleted token — step 3), or a line explaining what Helcim refused. The
function's own log is in the Firebase console under **Functions → payments →
Logs**.

Good to know:

- **Prices cannot be tampered with.** The amount is worked out by the function
  from the saved checkout, never taken from the browser.
- **One checkout, one payment.** Each checkout is one Helcim invoice. Once it
  is paid, the pay button is gone and a second payment is refused.
- **Currencies:** checkouts can be in CAD or USD — whichever your Helcim
  account accepts.
- **Refunds, receipts and payouts** are handled in your Helcim account.

## Changing things

| To change… | Edit |
| --- | --- |
| The business name (logo, page titles, headings) | `name` in `src/_data/site.js` |
| Phone, WhatsApp, email, address, hours | `src/_data/site.js` |
| Website and booking prices, plan features, FAQs | `src/_data/plans.js` |
| Print products and categories | `src/_data/print.js` |
| Software products | `src/_data/software.js` |
| Home page sections | `src/_data/home.js` and `src/index.njk` |
| Headlines and wording on a page | that page's file in `src/` (e.g. `src/printing.njk`) |
| Colors, type sizes, spacing, backgrounds | the list of settings at the top of `src/assets/css/site.css` |
| The look of pricing pages and checkouts | `designs/src/styles.css` (its colors mirror `site.css`) |
| The seller name pre-filled on new pages and checkouts | `name` in `src/_data/site.js` |

**Add a product photo:** put the full-size pictures in a folder, then

```bash
npm run images -- path/to/folder print
```

and add the product to `src/_data/print.js` using the picture's file name as
its `id`. (Use `software`, `web`, `booking` or `general` instead of `print` for
other sections.)

After any change, run `npm run deploy` again (or `npm run deploy:site` if card
payments are not set up).

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
This needs Java installed. Designs works there too, on test data.

The payment function runs there too, behind `/api`, exactly as online. With no
Helcim token on your computer it answers "payments are not set up", which is
what the checkout then shows. Helcim's window itself needs a live `https://`
address that is on your token's list, so a real payment can only be tried on
the published site.

## Checks

```bash
npm test
```

Runs 33 checks on the security rules (visitors can only send, strangers see
nothing, managers can only change status and notes, a client can open their
own page but never list pages or read a delivery address) and 26 checks on the
payment function, against a stand-in for Helcim: the amount charged, declined
cards, refunds, paying twice, a wrong token, who may see the list of payments.

```bash
npm run test:e2e
```

Drives a real browser through the whole flow — sending messages, the booking
form, signing in to the portal, reading, updating and deleting. In Designs it
builds a checkout and a pricing page, opens them as a client, is refused
without a delivery address, has a card declined, pays, and checks the manager
sees it paid with the address. It also scrolls the printing page with a real
mouse wheel and finger drags, uses the category chips, opens the phone menu
halfway down a page, and checks that nothing is wider than a small phone's
screen. The first time, run `npx playwright install chromium`.

## What's in the folders

```
src/            The site's source: pages (.njk), data, styles, scripts, images
  _data/        Prices, products and contact details
  assets/img/   The photos, already sized for the web
designs/        Designs: the pricing-page and checkout screens (React), built into public/studio/
payments/       The payment function that talks to Helcim (a Firebase function behind /api)
public/         The built site (created by `npm run build`; not kept in git)
firestore.rules Who can read and write what
firebase.json   Hosting settings (clean addresses, old-page redirects, security headers) and the function
tests/          The checks described above
scripts/        Helpers for adding photos and icons, and for bundling the payment function
legacy/         The previous site, kept for reference — safe to delete
```

## Good to know

- **Spam:** the form ignores obvious bots and the rules reject anything that is
  not shaped like a real message. If spam ever becomes a problem, turn on
  Firebase **App Check** for Firestore.
- **Email alerts:** new messages show up live in the portal (with an optional
  sound — the bell button). Getting an email for each one needs a Cloud
  Function or the *Trigger Email* extension, which require the paid Blaze plan.
- **Photos:** the product photos are illustrations of what the business makes; the
  brands in them are made-up examples. Swap in photos of real jobs whenever you
  have them.

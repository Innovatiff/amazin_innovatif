// End-to-end check of the whole message flow, in a real browser, against the
// local Firebase emulators:
//
//   visitor sends a message on the site  →  it is stored in Firestore
//   →  a manager signs in to the portal  →  reads it, updates it, deletes it.
//
// Run with `npm run test:e2e` (needs Java for the emulators and a Playwright
// browser: `npx playwright install chromium`). Nothing here touches the live
// project — everything runs under the offline "demo-innovatif" project.
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import site from '../src/_data/site.js';
import { startPayments } from '../scripts/payments-dev.mjs';
import { FAKE_TOKEN, startFakeHelcim } from './fake-helcim.mjs';

const SITE = 'http://127.0.0.1:5000';
const FIRESTORE = 'http://127.0.0.1:8085';
const AUTH = 'http://127.0.0.1:9099';
const PROJECT = 'demo-innovatif';
const DOCS = `${FIRESTORE}/v1/projects/${PROJECT}/databases/(default)/documents`;
const ADMIN = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };
const SHOTS = process.env.SHOTS; // optional folder for screenshots

const MANAGER = { email: 'owner@example.com', password: 'correct-horse-battery' };
const STRANGER = { email: 'someone@example.com', password: 'another-password-123' };

/* ── Emulator helpers (admin access, test set-up only) ──────────────────── */

const plain = (value) => {
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('timestampValue' in value) return new Date(value.timestampValue);
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(plain);
  if ('nullValue' in value) return null;
  return value;
};

async function docs(collection) {
  const response = await fetch(`${DOCS}/${collection}?pageSize=200`, { headers: ADMIN });
  const body = await response.json();
  return (body.documents ?? []).map((entry) => ({
    id: entry.name.split('/').pop(),
    ...Object.fromEntries(Object.entries(entry.fields ?? {}).map(([key, value]) => [key, plain(value)])),
  }));
}

async function signUp({ email, password }) {
  const response = await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const body = await response.json();
  assert.ok(body.localId, `could not create ${email}: ${JSON.stringify(body)}`);
  return body.localId;
}

async function reset() {
  await fetch(`${FIRESTORE}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
  const uid = await signUp(MANAGER);
  await signUp(STRANGER);
  // The one step done in the Firebase console in real life: add the manager.
  await fetch(`${DOCS}/managers/${uid}`, { method: 'PATCH', headers: ADMIN, body: JSON.stringify({ fields: { email: { stringValue: MANAGER.email } } }) });
}

/* ── Tiny test runner ───────────────────────────────────────────────────── */

const results = [];
async function step(name, run) {
  try {
    await run();
    results.push([true, name]);
    console.log(`  ✓ ${name}`);
  } catch (error) {
    results.push([false, name]);
    console.log(`  ✗ ${name}\n      ${String(error.message).split('\n').join('\n      ')}`);
  }
}

const problems = []; // browser console errors, CSP violations, failed requests
function watch(page, label) {
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`${label}: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`${label}: ${error.message}`));
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().startsWith(SITE)) problems.push(`${label}: ${response.status()} ${response.url()}`);
  });
}

// Wait until the page has stopped moving (smooth scrolling takes a moment),
// then say where it stopped.
async function settled(target) {
  let last = -1;
  for (let i = 0; i < 60; i++) {
    const y = await target.evaluate(() => Math.round(window.scrollY));
    if (y === last) return y;
    last = y;
    await target.waitForTimeout(150);
  }
  return last;
}

// Where a printing category ended up on screen after jumping to it.
const categoryOnScreen = (target, hash) => target.evaluate((hash) => {
  const bar = document.querySelector('.cat-nav').getBoundingClientRect();
  const row = document.querySelector('.cat-nav__list').getBoundingClientRect();
  const active = document.querySelector('.cat-nav__link.is-active');
  const chip = active?.getBoundingClientRect();
  return {
    barBottom: Math.round(bar.bottom),
    headingTop: Math.round(document.querySelector(`${hash} h2`).getBoundingClientRect().top),
    active: active?.hash,
    chipInView: Boolean(chip) && chip.left >= row.left - 1 && chip.right <= row.right + 1,
  };
}, hash);

async function shot(page, name) {
  if (!SHOTS) return;
  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: `${SHOTS}/${name}.png` });
}

/* ── The run ────────────────────────────────────────────────────────────── */

await reset();

// Card payments: the real payment functions (payments/), run on this computer and
// pointed at a stand-in for Helcim, so the whole pay flow is exercised with no real
// account and no real money. They read orders from the Firestore emulator, as the
// site does here. (FIRESTORE_EMULATOR_HOST etc. are set by `firebase emulators:exec`.)
const helcim = await startFakeHelcim({ port: 8788 });
process.env.HELCIM_API_TOKEN = FAKE_TOKEN;
process.env.HELCIM_API_URL = helcim.url;
const payments = await startPayments({ port: 8787, quiet: true });

// What Helcim's payment window does, without the window: it is told a token, the
// buyer pays (or is declined, or closes it), and it reports back with a message.
const HELCIM_WINDOW = `
  window.appendHelcimPayIframe = (checkoutToken) => {
    const frame = document.createElement('div');
    frame.id = 'helcimPayIframe';
    frame.textContent = 'Stand-in payment window';
    document.body.append(frame);
    const eventName = 'helcim-pay-js-' + checkoutToken;
    const outcome = window.__helcimOutcome || 'approve';
    setTimeout(async () => {
      if (outcome === 'close') return window.postMessage({ eventName, eventStatus: 'HIDE', eventMessage: '' }, '*');
      const transaction = await window.__fakeHelcimPay(checkoutToken, outcome === 'decline');
      if (outcome === 'decline') return window.postMessage({ eventName, eventStatus: 'ABORTED', eventMessage: 'HelcimPay.js transaction failed - Transaction declined' }, '*');
      window.postMessage({ eventName, eventStatus: 'SUCCESS', eventMessage: JSON.stringify({ status: 200, data: { data: transaction, hash: 'not-checked-in-the-browser' } }) }, '*');
    }, 120);
  };
  window.removeHelcimPayIframe = () => document.getElementById('helcimPayIframe')?.remove();
`;
async function withHelcimWindow(target) {
  await target.exposeFunction('__fakeHelcimPay', (checkoutToken, declined) => helcim.pay({ checkoutToken, declined }));
  await target.route('https://secure.helcim.app/helcim-pay/services/start.js', (route) =>
    route.fulfill({ status: 200, contentType: 'text/javascript', body: HELCIM_WINDOW }));
}

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch(proxy ? { proxy: { server: proxy, bypass: '127.0.0.1,localhost' } } : {});
const scale = Number(process.env.SCALE || 1); // SCALE=2 for sharper screenshots
const context = await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: scale });
const page = await context.newPage();
watch(page, 'site');
await page.route('https://buy.stripe.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Payment page (stub)</h1>' }));

console.log('\nPublic site');

await step('every page loads without browser errors', async () => {
  for (const path of ['/', '/printing', '/websites', '/booking', '/software', '/contact', '/get-started']) {
    const response = await page.goto(SITE + path, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, `${path} returned ${response.status()}`);
    assert.ok((await page.title()).includes(site.name), `${path}: the tab title “${await page.title()}” does not include “${site.name}”`);
    assert.equal((await page.locator('.site-header .brand__name').innerText()).trim(), site.name, `${path}: wrong name next to the logo`);
    assert.ok(response.headers()['content-security-policy'], `${path} is missing its security headers`);
  }
  assert.deepEqual(problems, []);
});

await step('old page addresses redirect to the new pages', async () => {
  for (const [from, to] of [['/pricing.html', '/booking'], ['/printed.html', '/printing'], ['/website.html', '/websites'], ['/home.html', '/'], ['/contact-sales.html', '/contact'], ['/software.html', '/software']]) {
    await page.goto(SITE + from, { waitUntil: 'domcontentloaded' });
    assert.equal(new URL(page.url()).pathname, to, `${from} went to ${page.url()}`);
  }
});

await step('an unknown address shows the 404 page', async () => {
  const response = await page.goto(`${SITE}/no-such-page`, { waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 404);
  await page.getByRole('heading', { name: 'We couldn’t find that page' }).waitFor();
  problems.length = 0; // the 404 status above is expected
});

await step('printing shows no prices', async () => {
  await page.goto(`${SITE}/printing`, { waitUntil: 'domcontentloaded' });
  const text = await page.locator('main').innerText();
  assert.ok(!/\$\s?\d/.test(text), 'found a price on the printing page');
  assert.ok((await page.locator('.product').count()) >= 50, 'expected at least 50 print products');
});

await step('the printing page scrolls freely and its category chips work', async () => {
  await page.goto(`${SITE}/printing`, { waitUntil: 'networkidle' });
  // A real mouse wheel, down through several categories. Nothing may push back.
  await page.mouse.move(640, 430);
  for (let i = 0; i < 20; i++) {
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(100);
  }
  const wheeled = await settled(page);
  assert.ok(wheeled >= 5900, `wheel-scrolling 6000px only moved the page ${wheeled}px`);

  // Each chip takes you to its category and lights up.
  for (const hash of ['#marketing', '#apparel', '#promo']) {
    const chip = await page.locator(`.cat-nav__link[href="${hash}"]`).boundingBox();
    await page.mouse.click(chip.x + chip.width / 2, chip.y + chip.height / 2);
    await settled(page);
    await page.waitForTimeout(300);
    const seen = await categoryOnScreen(page, hash);
    assert.ok(seen.headingTop >= seen.barBottom && seen.headingTop < 430,
      `${hash}: its heading is ${seen.headingTop}px down the screen (the category bar ends at ${seen.barBottom}px)`);
    assert.equal(seen.active, hash, `${hash}: the highlighted chip is ${seen.active}`);
  }

  // Keyboard focus landing in the sticky header must not move the page.
  const before = await settled(page);
  await page.evaluate(() => document.querySelector('.site-nav__link').focus());
  await page.waitForTimeout(700);
  assert.equal(await settled(page), before, 'focusing a link in the header moved the page');
});

await step('website and booking prices are shown', async () => {
  await page.goto(`${SITE}/websites`, { waitUntil: 'domcontentloaded' });
  const websites = await page.locator('#plans').innerText();
  assert.ok(websites.includes('$49.99') && websites.includes('$99.99') && /best offer/i.test(websites));
  await page.goto(`${SITE}/booking`, { waitUntil: 'domcontentloaded' });
  const booking = await page.locator('#pricing').innerText();
  for (const price of ['$149', '$299', '$499', '$497', '$997', '$1,997']) assert.ok(booking.includes(price), `missing ${price}`);
});

await step('“Get a quote” on a product opens the form already filled in', async () => {
  await page.goto(`${SITE}/printing`, { waitUntil: 'networkidle' });
  await page.locator('#business-cards [data-quote]').click();
  await page.locator('#quote-dialog[open]').waitFor();
  assert.equal(await page.locator('#q-product').inputValue(), 'Business cards');
  assert.equal(await page.locator('#q-enquiry').inputValue(), 'Printing');
  await shot(page, 'quote-dialog');
});

await step('the form explains what is missing instead of sending', async () => {
  await page.locator('#quote-dialog [data-submit]').click();
  await page.locator('#quote-dialog .field__error').first().waitFor();
  assert.equal((await docs('Contact')).length, 0);
});

await step('a visitor’s message is saved to Firestore', async () => {
  await page.locator('#q-name').fill('Maria Lopez');
  await page.locator('#q-phone').fill('555 555 0100');
  await page.locator('#q-message').fill('I need 500 business cards by Friday.\nMatte finish, rounded corners.');
  await page.locator('#quote-dialog input[name="preferredContact"][value="WhatsApp"]').check();
  await page.waitForTimeout(1600); // people take longer than bots to fill a form
  await page.locator('#quote-dialog [data-submit]').click();
  await page.locator('#quote-dialog [data-form-done]').getByText('Message received').waitFor();
  await shot(page, 'quote-sent');
  const [saved] = await docs('Contact');
  assert.equal(saved.name, 'Maria Lopez');
  assert.equal(saved.phone, '555 555 0100');
  assert.equal(saved.enquiry, 'Printing');
  assert.equal(saved.product, 'Business cards');
  assert.equal(saved.preferredContact, 'WhatsApp');
  assert.equal(saved.status, 'New');
  assert.equal(saved.page, '/printing');
  assert.ok(saved.createdAt instanceof Date && Date.now() - saved.createdAt.getTime() < 60000);
});

await step('opening the form again after sending starts a fresh message', async () => {
  await page.locator('#quote-dialog [data-dialog-close]').click();
  await page.locator('#flyers [data-quote]').click();
  await page.locator('#quote-dialog[open] #q-name').waitFor();
  assert.equal(await page.locator('#q-name').inputValue(), '');
  assert.equal(await page.locator('#q-product').inputValue(), 'Flyers');
  assert.equal(await page.locator('#quote-dialog [data-form-done]').isVisible(), false);
  await page.keyboard.press('Escape');
  await page.locator('#quote-dialog').waitFor({ state: 'hidden' });
});

await step('the contact page form works with only an email address', async () => {
  await page.goto(`${SITE}/contact`, { waitUntil: 'networkidle' });
  await page.locator('#c-name').fill('Sam Carter');
  await page.locator('#c-email').fill('sam@example.com');
  await page.locator('#c-enquiry').selectOption('Software');
  await page.locator('#c-message').fill('We need a POS for about 40,000 products.');
  await page.waitForTimeout(1600);
  await page.locator('#message [data-submit]').click();
  await page.locator('#message [data-form-done]').getByText('Message received').waitFor();
  const saved = (await docs('Contact')).find((entry) => entry.name === 'Sam Carter');
  assert.equal(saved.email, 'sam@example.com');
  assert.equal(saved.enquiry, 'Software');
});

await step('a bot that fills the hidden field is ignored', async () => {
  await page.goto(`${SITE}/contact`, { waitUntil: 'networkidle' });
  await page.locator('#c-name').fill('Spam Bot');
  await page.locator('#c-email').fill('bot@example.com');
  await page.locator('#c-enquiry').selectOption('Other');
  await page.locator('#c-message').fill('Buy cheap things');
  await page.locator('#c-website').evaluate((input) => (input.value = 'http://spam.example'));
  await page.waitForTimeout(1600);
  await page.locator('#message [data-submit]').click();
  await page.locator('#message [data-form-done]').waitFor();
  assert.ok(!(await docs('Contact')).some((entry) => entry.name === 'Spam Bot'));
});

console.log('\nBooking system form');

async function fillBooking(name, choice) {
  await page.goto(`${SITE}/get-started?plan=Pro`, { waitUntil: 'networkidle' });
  await page.locator('#b-fullName').fill(name);
  await page.locator('#b-phone').fill('555 555 0177');
  await page.locator('#b-email').fill('lead@example.com');
  await page.locator('[data-next]').click();
  await page.locator('#b-businessName').fill('Carter Mobile Detailing');
  await page.locator('#b-businessType').selectOption('Other');
  await page.locator('#b-businessTypeSpecific').fill('Boat detailing');
  await page.locator('#b-city').fill('Springfield');
  await page.locator('input[name="websiteStatus"]').first().check();
  await page.locator('[data-next]').click();
  assert.ok(await page.locator('input[name="plan"][value="Pro"]').isChecked(), 'plan from the link was not preselected');
  await page.locator('[data-next]').click();
  await page.locator('input[name="mainGoal"]').first().check();
  await page.locator('input[name="bookingProblem"]').nth(1).check();
  await page.locator('[data-next]').click();
  await page.locator(`input[name="reservationChoice"][value="${choice}"]`).check();
  await page.waitForTimeout(1200);
  await page.locator('[data-next]').click();
}

await step('a booking request without a deposit is saved', async () => {
  await fillBooking('Nora Not-Yet', 'Not yet');
  await page.getByText('Thank you. We received your request.').waitFor();
  const saved = (await docs('Bookings')).find((entry) => entry.fullName === 'Nora Not-Yet');
  assert.equal(saved.status, 'New');
  assert.equal(saved.plan, 'Pro');
  assert.equal(saved.businessType, 'Boat detailing');
  assert.equal(saved.paymentRequired, false);
  assert.equal(saved.mainGoal.length, 1);
});

await step('reserving a spot saves the lead, then goes to the payment page', async () => {
  await fillBooking('Rita Reserve', 'Reserve my spot');
  await page.waitForURL('https://buy.stripe.com/**');
  const saved = (await docs('Bookings')).find((entry) => entry.fullName === 'Rita Reserve');
  assert.equal(saved.status, 'Pending Payment');
  assert.equal(saved.paymentRequired, true);
});

await step('returning from payment (old address included) records the deposit', async () => {
  await page.goto(`${SITE}/form.html?payment=success`);
  await page.waitForURL(`${SITE}/get-started`);
  await page.getByText('Thank you. We received your request.').waitFor();
  await assert.doesNotReject(async () => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const paid = (await docs('Bookings')).find((entry) => entry.status === 'Paid - New Booking');
      if (paid) return assert.ok(paid.pendingId, 'paid record does not point at the pending one');
      await page.waitForTimeout(250);
    }
    throw new Error('no paid booking was recorded');
  });
});

console.log('\nManager portal');

const portal = await context.newPage();
watch(portal, 'portal');
problems.length = 0;

await step('the portal asks for a sign-in and rejects a wrong password', async () => {
  await portal.goto(`${SITE}/portal`, { waitUntil: 'networkidle' });
  await portal.locator('[data-view="signin"]').waitFor();
  await shot(portal, 'portal-signin');
  assert.deepEqual(problems, [], 'the portal page itself should load cleanly');
  await portal.locator('#p-email').fill(MANAGER.email);
  await portal.locator('#p-password').fill('wrong-password');
  await portal.locator('[data-signin-button]').click();
  await portal.locator('[data-auth-error]').getByText('don’t match').waitFor();
  problems.length = 0; // the failed sign-in logs an expected 400
});

await step('a signed-in account that is not a manager sees nothing', async () => {
  await portal.locator('#p-email').fill(STRANGER.email);
  await portal.locator('#p-password').fill(STRANGER.password);
  await portal.locator('[data-signin-button]').click();
  await portal.locator('[data-view="denied"]').waitFor();
  assert.ok((await portal.locator('[data-denied-uid]').innerText()).length > 10);
  assert.equal(await portal.locator('.item').count(), 0);
  await portal.locator('[data-view="denied"] [data-signout]').click();
  await portal.locator('[data-view="signin"]').waitFor();
});

await step('the manager signs in and sees every message', async () => {
  await portal.locator('#p-email').fill(MANAGER.email);
  await portal.locator('#p-password').fill(MANAGER.password);
  await portal.locator('[data-signin-button]').click();
  await portal.locator('[data-view="app"]').waitFor();
  await portal.locator('.item').first().waitFor();
  assert.equal(await portal.locator('.item').count(), 2);
  assert.equal(await portal.locator('[data-count="Contact"]').innerText(), '2');
  await shot(portal, 'portal-inbox');
});

await step('opening a message shows it in full with reply shortcuts', async () => {
  await portal.locator('.item', { hasText: 'Maria Lopez' }).click();
  await portal.locator('.detail__message').getByText('500 business cards by Friday').waitFor();
  const whatsapp = await portal.locator('.detail__reply a', { hasText: 'WhatsApp' }).getAttribute('href');
  assert.ok(whatsapp.startsWith('https://wa.me/5555550100?text='), whatsapp);
  assert.equal(await portal.locator('.detail__reply a', { hasText: 'Call' }).getAttribute('href'), 'tel:5555550100');
  await shot(portal, 'portal-message');
});

await step('status and notes are saved', async () => {
  await portal.locator('.segmented button', { hasText: 'In progress' }).click();
  await portal.locator('[data-notes]').fill('Called back, sending quote Monday.');
  await portal.getByRole('button', { name: 'Save notes' }).click();
  await portal.locator('[data-toast]').getByText('Notes saved').waitFor();
  const saved = (await docs('Contact')).find((entry) => entry.name === 'Maria Lopez');
  assert.equal(saved.status, 'In progress');
  assert.equal(saved.notes, 'Called back, sending quote Monday.');
  assert.equal(saved.handledBy, MANAGER.email);
  assert.equal(saved.message, 'I need 500 business cards by Friday.\nMatte finish, rounded corners.');
});

await step('a new message appears in the portal without refreshing', async () => {
  await page.goto(`${SITE}/software`, { waitUntil: 'networkidle' });
  await page.locator('#ai-receptionist [data-quote]').click();
  await page.locator('#q-name').fill('Live Larry');
  await page.locator('#q-email').fill('larry@example.com');
  await page.locator('#q-message').fill('How much is the AI receptionist?');
  await page.waitForTimeout(1600);
  await page.locator('#quote-dialog [data-submit]').click();
  await page.locator('#quote-dialog [data-form-done]').waitFor();
  await portal.locator('.item', { hasText: 'Live Larry' }).waitFor({ timeout: 10000 });
  await portal.locator('[data-toast]').getByText('New message from Live Larry').waitFor();
});

await step('messages typed by visitors can never run as code in the portal', async () => {
  await page.goto(`${SITE}/contact`, { waitUntil: 'networkidle' });
  await page.locator('#c-name').fill('<img src=x onerror=window.hacked=1>');
  await page.locator('#c-email').fill('x@example.com');
  await page.locator('#c-enquiry').selectOption('Other');
  await page.locator('#c-message').fill('<script>window.hacked=1</script><b>bold</b>');
  await page.waitForTimeout(1600);
  await page.locator('#message [data-submit]').click();
  await page.locator('#message [data-form-done]').waitFor();
  await portal.locator('.item', { hasText: '<img src=x' }).click();
  await portal.locator('.detail__message').getByText('<script>window.hacked=1</script><b>bold</b>').waitFor();
  assert.equal(await portal.evaluate(() => window.hacked), undefined);
  assert.equal(await portal.locator('.pane--detail img, .pane--detail b').count(), 0);
});

await step('booking leads are listed once each, with their payment state', async () => {
  await portal.locator('[data-tab="Bookings"]').click();
  await portal.locator('.item').first().waitFor();
  assert.equal(await portal.locator('.item').count(), 2); // the paid lead replaces its "pending" copy
  await portal.locator('.item', { hasText: 'Rita Reserve' }).click();
  await portal.getByText('Deposit reported paid — check your Stripe account').waitFor();
  await shot(portal, 'portal-lead');
});

await step('a manager can delete a message', async () => {
  await portal.locator('[data-tab="Contact"]').click();
  await portal.locator('.item', { hasText: 'Sam Carter' }).click();
  portal.once('dialog', (dialog) => dialog.accept());
  await portal.getByRole('button', { name: 'Delete permanently' }).click();
  await portal.locator('[data-toast]').getByText('Deleted').waitFor();
  assert.ok(!(await docs('Contact')).some((entry) => entry.name === 'Sam Carter'));
});

await step('signing out closes the inbox', async () => {
  await portal.locator('.app__user [data-signout]').click();
  await portal.locator('[data-view="signin"]').waitFor();
  assert.equal(await portal.locator('.item').count(), 0);
});

console.log('\nDesigns (pricing pages and checkouts)');

// 2 × 89.00 + 650.00 = 828.00; 13% tax = 107.64; shipping 15.00 → 950.64
const ORDER_TOTAL = '$950.64';
let checkoutUrl = '';
let checkoutId = '';
let quoteUrl = '';
const client = await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: scale });
await withHelcimWindow(client);
const buyer = await client.newPage();
watch(buyer, 'checkout');

await step('opening Designs signed out leads to the portal sign-in, then straight back', async () => {
  await portal.goto(`${SITE}/portal/designs`, { waitUntil: 'networkidle' });
  await portal.waitForURL(/\/portal\?next=/);
  await portal.locator('#p-email').fill(MANAGER.email);
  await portal.locator('#p-password').fill(MANAGER.password);
  await portal.locator('[data-signin-button]').click();
  await portal.waitForURL(`${SITE}/portal/designs`);
  await portal.getByRole('heading', { name: 'Designs', level: 1 }).waitFor();
  // The same bar as the portal, with a way back to the inbox.
  assert.equal(await portal.locator('.portalbar-tab[aria-current="page"]').innerText(), 'Designs');
  assert.equal(await portal.locator('.portalbar-tab', { hasText: 'Messages' }).getAttribute('href'), '/portal');
  await shot(portal, 'designs-home-empty');
});

await step('the portal has a Designs tab', async () => {
  // (The inbox keeps a live connection open, so there is no "network is quiet" moment to wait for.)
  await portal.goto(`${SITE}/portal`, { waitUntil: 'domcontentloaded' });
  await portal.locator('[data-view="app"]').waitFor();
  await portal.locator('a.tab', { hasText: 'Designs' }).click();
  await portal.waitForURL(`${SITE}/portal/designs`);
  await portal.getByRole('heading', { name: 'Designs', level: 1 }).waitFor();
});

await step('a manager builds a checkout and gets a link for the client', async () => {
  await portal.getByRole('button', { name: 'New page' }).click();
  await portal.getByRole('menuitem', { name: /Checkout/ }).click();
  await portal.waitForURL(`${SITE}/portal/designs/new/checkout`);
  await portal.locator('#k-title').fill('Brand launch kit');
  await portal.locator('#k-client').fill('Aurora Coffee Co.');
  assert.equal(await portal.locator('#k-currency').inputValue(), 'CAD', 'new checkouts should start in Canadian dollars');
  assert.deepEqual(await portal.locator('#k-currency option').allInnerTexts(), ['CAD', 'USD'], 'only the currencies Helcim charges in');
  await portal.locator('[id$="-name"]').first().fill('Logo design package');
  await portal.locator('[id$="-price"]').first().fill('650');
  await portal.locator('[id$="-list"]').first().fill('900');
  await portal.locator('#k-add-item').click();
  await portal.locator('[id$="-name"]').nth(1).fill('Premium business cards (box of 250)');
  await portal.locator('[id$="-qty"]').nth(1).fill('2');
  await portal.locator('[id$="-price"]').nth(1).fill('89');
  await portal.locator('#k-shipping').fill('15');
  await portal.locator('#k-tax').fill('13');
  await portal.getByText('Ask for a delivery address').click();
  await portal.locator('#k-countries').fill('CA, US');
  await shot(portal, 'designs-checkout-editor');
  await portal.locator('button[type="submit"]').click();
  await portal.waitForURL(/\/checkout\/[A-Za-z0-9]+$/);
  checkoutUrl = portal.url();
  checkoutId = checkoutUrl.split('/').pop();
  await portal.locator('.co-total', { hasText: ORDER_TOTAL }).waitFor();
  // The manager sees the client's page with a toolbar above it.
  await portal.locator('.toolbar .pill', { hasText: 'Awaiting payment' }).waitFor();
  const [saved] = await docs('checkouts');
  assert.equal(saved.title, 'Brand launch kit');
  assert.equal(saved.currency, 'CAD');
});

await step('the client opens the link: the order, the total, and nothing of the manager’s', async () => {
  await buyer.goto(checkoutUrl, { waitUntil: 'networkidle' });
  await buyer.locator('.co-total', { hasText: ORDER_TOTAL }).waitFor();
  assert.equal(await buyer.locator('.toolbar').count(), 0, 'a client must not see the manager toolbar');
  assert.equal(await buyer.locator('.portalbar').count(), 0);
  assert.ok((await buyer.locator('.co-pay-btn').innerText()).includes(ORDER_TOTAL));
  const text = await buyer.locator('main').innerText();
  for (const expected of ['Logo design package', 'Premium business cards (box of 250)', 'Qty: 2', 'Helcim']) assert.ok(text.includes(expected), `missing “${expected}”`);
  assert.ok(!/stripe/i.test(await buyer.locator('body').innerText()), 'Stripe is still mentioned');
  await shot(buyer, 'checkout-client');
});

await step('paying needs a delivery address first', async () => {
  await buyer.locator('.co-pay-btn').click();
  await buyer.locator('.co-address [role="alert"]', { hasText: 'name of the person' }).waitFor();
  assert.equal(helcim.state.requests.length, 0, 'no payment may be opened before the address is complete');
  await buyer.locator('#d-name').fill('Maria Lopez');
  await buyer.locator('#d-line1').fill('12 King Street West');
  await buyer.locator('#d-city').fill('Toronto');
  await buyer.locator('#d-region').fill('ON');
  await buyer.locator('#d-postalCode').fill('M5H 1A1');
  await buyer.locator('#d-country').selectOption('CA');
});

await step('a declined card, or closing the window, leaves the order unpaid', async () => {
  await buyer.evaluate(() => { window.__helcimOutcome = 'decline'; });
  await buyer.locator('.co-pay-btn').click();
  await buyer.locator('.co-pay-error', { hasText: 'did not go through' }).waitFor();
  assert.equal(await buyer.locator('#helcimPayIframe').count(), 0, 'the payment window should be closed again');
  await buyer.evaluate(() => { window.__helcimOutcome = 'close'; });
  await buyer.locator('.co-pay-btn').click();
  await buyer.getByText('Payment canceled.').waitFor();
  assert.equal(await buyer.locator('.co-paid').count(), 0);
});

await step('the client pays in Helcim’s window and sees the order as paid', async () => {
  await buyer.evaluate(() => { window.__helcimOutcome = 'approve'; });
  await buyer.locator('.co-pay-btn').click();
  await buyer.getByText('Thank you! Your order is placed.').waitFor();
  await buyer.locator('.co-paid', { hasText: 'Paid' }).waitFor();
  assert.equal(await buyer.locator('.co-pay-btn').count(), 0, 'the pay button should be gone');
  // What Helcim was asked to charge comes from the stored order, to the cent.
  const sent = helcim.state.requests.at(-1);
  assert.equal(helcim.state.requests[0].amount, 950.64);
  assert.equal(sent.currency, 'CAD');
  assert.equal(helcim.state.invoices.size, 1, 'three attempts, one invoice');
  await shot(buyer, 'checkout-paid');
});

await step('after a refresh the order is still paid, and cannot be paid twice', async () => {
  await buyer.reload({ waitUntil: 'networkidle' });
  await buyer.locator('.co-paid', { hasText: 'Paid' }).waitFor();
  assert.equal(await buyer.locator('.co-pay-btn').count(), 0);
  const again = await fetch('http://127.0.0.1:8787/.netlify/functions/checkout-create', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: checkoutId }),
  });
  assert.equal(again.status, 409);
});

await step('the manager sees it paid, with the delivery address the client entered', async () => {
  await portal.reload({ waitUntil: 'networkidle' });
  // (How the amount is written follows the viewer's own language settings: "$950.64" or "CA$950.64".)
  await portal.locator('.toolbar .pill', { hasText: /^Paid · \D*950\.64$/ }).waitFor();
  const delivery = await portal.locator('.toolbar-delivery').innerText();
  for (const part of ['Maria Lopez', '12 King Street West', 'Toronto', 'M5H 1A1', 'Canada']) assert.ok(delivery.includes(part), `delivery line is missing “${part}”: ${delivery}`);
  await shot(portal, 'checkout-manager-paid');
  await portal.locator('.toolbar a', { hasText: 'All pages' }).click();
  await portal.locator('.card', { hasText: 'Brand launch kit' }).locator('.pill', { hasText: 'Paid' }).waitFor();
  await shot(portal, 'designs-home');
});

await step('a client cannot read delivery addresses or the list of pages', async () => {
  assert.deepEqual(problems, [], 'nothing should have gone wrong up to here');
  const result = await buyer.evaluate(async (id) => {
    const base = 'http://127.0.0.1:8085/v1/projects/demo-innovatif/databases/(default)/documents';
    const statuses = [];
    for (const path of [`checkouts/${id}/deliveries`, 'checkouts', 'pages', 'images']) statuses.push((await fetch(`${base}/${path}`)).status);
    statuses.push((await fetch(`${base}/checkouts/${id}`)).status); // their own checkout, by its address: allowed
    return statuses;
  }, checkoutId);
  assert.deepEqual(result, [403, 403, 403, 403, 200]);
  problems.length = 0; // the four refusals above are the point of this check
});

await step('a manager can mark a checkout as paid by hand (cash or e-transfer)', async () => {
  await portal.locator('.card', { hasText: 'Brand launch kit' }).click();
  await portal.getByRole('button', { name: 'More actions' }).click();
  await portal.getByRole('menuitem', { name: 'Duplicate checkout' }).click();
  await portal.waitForURL(/\/checkout\/[A-Za-z0-9]+\/edit$/);
  await portal.locator('#k-title').fill('Cash order');
  await portal.locator('button[type="submit"]').click();
  await portal.waitForURL(/\/checkout\/[A-Za-z0-9]+$/);
  const cashUrl = portal.url();
  await portal.locator('.toolbar .pill', { hasText: 'Awaiting payment' }).waitFor();
  await portal.getByRole('button', { name: 'More actions' }).click();
  await portal.getByRole('menuitem', { name: 'Mark as paid' }).click();
  await portal.locator('.toolbar .pill', { hasText: 'marked by hand' }).waitFor();
  // The client sees it paid and is not offered the pay button; the payment functions agree.
  await buyer.goto(cashUrl, { waitUntil: 'networkidle' });
  await buyer.locator('.co-paid', { hasText: 'Paid' }).waitFor();
  assert.equal(await buyer.locator('.co-pay-btn').count(), 0);
  const refused = await fetch('http://127.0.0.1:8787/.netlify/functions/checkout-create', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: cashUrl.split('/').pop() }),
  });
  assert.equal(refused.status, 409);
});

await step('a manager builds a pricing page and the client can open it', async () => {
  await portal.goto(`${SITE}/portal/designs/new`, { waitUntil: 'networkidle' });
  await portal.locator('#f-title').fill('Website and print package');
  await portal.locator('#f-client').fill('North Build');
  await portal.locator('[id$="-name"]').first().fill('Five-page website');
  await portal.locator('[id$="-price"]').first().fill('1200');
  await portal.locator('[id$="-market"]').first().fill('2500');
  await shot(portal, 'designs-quote-editor');
  await portal.locator('button[type="submit"]').click();
  await portal.waitForURL(/\/quote\/[A-Za-z0-9]+$/);
  quoteUrl = portal.url();
  await buyer.goto(quoteUrl, { waitUntil: 'networkidle' });
  await buyer.getByRole('heading', { name: 'Website and print package' }).waitFor();
  assert.equal(await buyer.locator('.toolbar').count(), 0);
  const text = await buyer.locator('body').innerText();
  for (const expected of ['Five-page website', '1,200', '2,500', site.name]) assert.ok(text.includes(expected), `missing “${expected}”`);
  await shot(buyer, 'quote-client');
});

// How wide the page really is. (A phone zooms out to fit a page that is too wide,
// so the page has to be measured against the phone, not against its own window.)
const pageWidth = (target) => target.evaluate(() => document.documentElement.scrollWidth);

await step('what the client opens fits a phone screen', async () => {
  for (const width of [390, 320]) {
    const phone = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: scale });
    const mobile = await phone.newPage();
    watch(mobile, `client pages at ${width}px`);
    await mobile.goto(checkoutUrl, { waitUntil: 'networkidle' });
    await mobile.locator('.co-total', { hasText: ORDER_TOTAL }).waitFor();
    assert.ok(await pageWidth(mobile) <= width, `the checkout is ${await pageWidth(mobile)}px wide on a ${width}px phone`);
    if (width === 390) await shot(mobile, 'checkout-phone');
    await mobile.goto(quoteUrl, { waitUntil: 'networkidle' });
    await mobile.getByRole('heading', { name: 'Website and print package' }).waitFor();
    assert.ok(await pageWidth(mobile) <= width, `the pricing page is ${await pageWidth(mobile)}px wide on a ${width}px phone`);
    if (width === 390) await shot(mobile, 'quote-phone');
    await phone.close();
  }
});

await step('the manager’s screens fit a phone too', async () => {
  const signedIn = await context.storageState({ indexedDB: true });
  for (const width of [390, 320]) {
    const phone = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, storageState: signedIn });
    const mobile = await phone.newPage();
    watch(mobile, `manager screens at ${width}px`);
    for (const [path, ready] of [
      ['/portal/designs', '.card'],
      [new URL(checkoutUrl).pathname, '.toolbar .pill'],
      [new URL(quoteUrl).pathname, '.toolbar'],
      [`${new URL(checkoutUrl).pathname}/edit`, '#k-title'],
      [`${new URL(quoteUrl).pathname}/edit`, '#f-title'],
      ['/portal', '.tabs'],
    ]) {
      await mobile.goto(SITE + path, { waitUntil: 'domcontentloaded' });
      await mobile.locator(ready).first().waitFor();
      await mobile.waitForTimeout(300);
      assert.ok(await pageWidth(mobile) <= width, `${path} is ${await pageWidth(mobile)}px wide on a ${width}px phone`);
    }
    if (width === 390) {
      await mobile.goto(SITE + new URL(checkoutUrl).pathname, { waitUntil: 'domcontentloaded' });
      await mobile.locator('.toolbar .pill').waitFor();
      await shot(mobile, 'checkout-manager-phone');
    }
    await phone.close();
  }
});

await step('only the Designs addresses are allowed to load Helcim', async () => {
  const policy = async (path) => (await fetch(SITE + path)).headers.get('content-security-policy') ?? '';
  for (const path of ['/portal/designs', `/checkout/${checkoutId}`, '/quote/anything']) {
    assert.ok((await policy(path)).includes('https://secure.helcim.app'), `${path} cannot load Helcim’s payment window`);
  }
  for (const path of ['/', '/printing', '/portal']) assert.ok(!(await policy(path)).includes('helcim'), `${path} should keep the site’s strict policy`);
});

await step('no browser errors or blocked requests along the way', async () => {
  assert.deepEqual(problems, []);
});

console.log('\nPhone');

await step('on a phone, the printing page scrolls by touch and its chips work', async () => {
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobile = await phone.newPage();
  const touch = await phone.newCDPSession(mobile);
  // A finger dragged across the screen, sent as real touch events.
  const drag = async (from, to) => {
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] });
    for (let i = 1; i <= 12; i++) {
      await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + ((to.x - from.x) * i) / 12, y: from.y + ((to.y - from.y) * i) / 12 }] });
      await mobile.waitForTimeout(16);
    }
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  await mobile.goto(`${SITE}/printing`, { waitUntil: 'networkidle' });

  // Six drags up the screen, through several categories: every one must count.
  let at = 0;
  for (let i = 1; i <= 6; i++) {
    await drag({ x: 195, y: 700 }, { x: 195, y: 160 });
    const now = await settled(mobile);
    assert.ok(now - at >= 400, `finger drag ${i} (540px) only moved the page ${now - at}px`);
    at = now;
  }

  // The chip row slides sideways under a finger without moving the page.
  await mobile.evaluate(() => window.scrollTo({ top: 1000, behavior: 'instant' }));
  await mobile.waitForTimeout(600);
  const bar = await mobile.locator('.cat-nav').boundingBox();
  const rowBefore = await mobile.evaluate(() => document.querySelector('.cat-nav__list').scrollLeft);
  await drag({ x: 330, y: bar.y + bar.height / 2 }, { x: 70, y: bar.y + bar.height / 2 });
  await mobile.waitForTimeout(700);
  const rowAfter = await mobile.evaluate(() => document.querySelector('.cat-nav__list').scrollLeft);
  assert.ok(rowAfter - rowBefore > 100, `the chip row did not slide sideways (moved ${Math.round(rowAfter - rowBefore)}px)`);
  assert.equal(await settled(mobile), 1000, 'sliding the chip row moved the page');

  // Tapping a chip that is on screen takes you to that category.
  const target = await mobile.evaluate(() => {
    for (const link of document.querySelectorAll('.cat-nav__link:not(.is-active)')) {
      const box = link.getBoundingClientRect();
      const x = box.left + box.width / 2;
      if (x > 40 && x < window.innerWidth - 40) return { hash: link.hash, x, y: box.top + box.height / 2 };
    }
    return null;
  });
  assert.ok(target, 'no chip on screen to tap');
  await mobile.touchscreen.tap(target.x, target.y);
  await settled(mobile);
  await mobile.waitForTimeout(500);
  const seen = await categoryOnScreen(mobile, target.hash);
  assert.ok(seen.headingTop >= seen.barBottom && seen.headingTop < 500,
    `${target.hash}: its heading is ${seen.headingTop}px down the screen (the category bar ends at ${seen.barBottom}px)`);
  assert.equal(seen.active, target.hash, `${target.hash}: the highlighted chip is ${seen.active}`);
  assert.ok(seen.chipInView, 'the highlighted chip is not visible in the row');
  await phone.close();
});

await step('nothing is wider than the screen on a small phone', async () => {
  const small = await browser.newContext({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true });
  const tiny = await small.newPage();
  for (const path of ['/', '/printing', '/websites', '/booking', '/software', '/contact', '/get-started', '/portal']) {
    await tiny.goto(SITE + path, { waitUntil: 'networkidle' });
    if (path === '/booking') await tiny.locator('details.compare > summary').click(); // the widest thing on the site
    const width = await tiny.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(width <= 320, `${path} is ${width}px wide on a 320px screen`);
  }
  await small.close();
});

await step('the menu and message form work at phone size', async () => {
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobile = await phone.newPage();
  await mobile.goto(SITE, { waitUntil: 'networkidle' });
  assert.ok(await pageWidth(mobile) <= 390, 'page scrolls sideways');
  // People open the menu halfway down a page, so test it there — with a real
  // tap, because a scripted click would scroll the page itself first.
  await mobile.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }));
  const toggle = await mobile.locator('[data-nav-toggle]').boundingBox();
  await mobile.touchscreen.tap(toggle.x + toggle.width / 2, toggle.y + toggle.height / 2);
  await mobile.locator('#site-nav.is-open').getByRole('link', { name: 'Contact' }).waitFor();
  await mobile.waitForTimeout(400); // let the menu finish sliding in
  const menu = await mobile.locator('#site-nav').boundingBox();
  assert.ok(menu.y >= 0 && menu.y < 80 && menu.height > 700 && menu.width === 390,
    `menu should fill the screen, got ${menu.width}×${menu.height} at ${menu.y}px from the top`);
  assert.equal(await mobile.evaluate(() => Math.round(window.scrollY)), 1500, 'opening the menu moved the page');
  await shot(mobile, 'mobile-menu');
  await mobile.locator('#site-nav').getByRole('link', { name: 'Printing' }).click();
  await mobile.waitForURL(`${SITE}/printing`);
  // Nothing asking for a quote may stay pinned to the screen while scrolling.
  const pinned = await mobile.evaluate(() => [...document.querySelectorAll('[data-quote]')]
    .filter((el) => el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }))
    .filter((el) => {
      for (let node = el; node && node !== document.body; node = node.parentElement) {
        if (['fixed', 'sticky'].includes(getComputedStyle(node).position)) return true;
      }
      return false;
    })
    .map((el) => el.textContent.trim()));
  assert.deepEqual(pinned, [], 'a quote button is pinned to the phone screen');
  await mobile.locator('.page-hero [data-quote]').click();
  await mobile.locator('#quote-dialog[open]').waitFor();
  await shot(mobile, 'mobile-form');
  await phone.close();
});

await browser.close();
await payments.close();
await helcim.close();

const failed = results.filter(([ok]) => !ok);
console.log(`\n${results.length - failed.length} of ${results.length} checks passed.`);
if (failed.length) {
  console.log(`Failed:\n${failed.map(([, name]) => `  - ${name}`).join('\n')}`);
  process.exit(1);
}

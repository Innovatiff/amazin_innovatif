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

async function shot(page, name) {
  if (!SHOTS) return;
  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: `${SHOTS}/${name}.png` });
}

/* ── The run ────────────────────────────────────────────────────────────── */

await reset();

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
    assert.ok((await page.title()).includes('Innovatif'), `${path} has no title`);
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

await step('no browser errors or blocked requests along the way', async () => {
  assert.deepEqual(problems, []);
});

console.log('\nPhone');

await step('the menu and message form work at phone size', async () => {
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobile = await phone.newPage();
  await mobile.goto(SITE, { waitUntil: 'networkidle' });
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'page scrolls sideways');
  await mobile.locator('[data-nav-toggle]').click();
  await mobile.locator('#site-nav.is-open').getByRole('link', { name: 'Contact' }).waitFor();
  await mobile.waitForTimeout(400); // let the menu finish sliding in
  const menu = await mobile.locator('#site-nav').boundingBox();
  assert.ok(menu.height > 700 && menu.width === 390, `menu should fill the screen, got ${menu.width}×${menu.height}`);
  await shot(mobile, 'mobile-menu');
  await mobile.locator('#site-nav').getByRole('link', { name: 'Printing' }).click();
  await mobile.waitForURL(`${SITE}/printing`);
  await mobile.locator('.dock [data-quote]').click();
  await mobile.locator('#quote-dialog[open]').waitFor();
  await shot(mobile, 'mobile-form');
  await phone.close();
});

await browser.close();

const failed = results.filter(([ok]) => !ok);
console.log(`\n${results.length - failed.length} of ${results.length} checks passed.`);
if (failed.length) {
  console.log(`Failed:\n${failed.map(([, name]) => `  - ${name}`).join('\n')}`);
  process.exit(1);
}

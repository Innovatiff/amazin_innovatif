// Checks the payment functions (payments/) against a stand-in for Helcim.
//
//   npm run test:payments
//
// What matters most here: a buyer can never change what they are charged, a payment
// only ever counts for the checkout it was made for, and nobody pays twice.
import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, test } from 'node:test';
import { loadHandlers } from '../scripts/payments-dev.mjs';
import { FAKE_TOKEN, startFakeHelcim } from './fake-helcim.mjs';

const ORDER_ID = 'Ab3dEfGh1jKlMn0pQr5t';
const OTHER_ID = 'Zy9xWvUt8sRqPo7nMl6k';

/** A checkout as it is stored in Firestore: 2 × 89.00 + 650.00 + 15.00 shipping + 13% tax on the items. */
const order = (overrides = {}) => ({
  title: 'Brand launch kit',
  client: 'Aurora Coffee Co.',
  currency: 'CAD',
  items: [
    { id: 'a', name: 'Logo design package', description: '', quantity: 1, price: 650, listPrice: 900 },
    { id: 'b', name: 'Premium business cards', description: '', quantity: 2, price: 89, listPrice: 129 },
    { id: 'c', name: 'Free sticker sheet', description: '', quantity: 1, price: 0, listPrice: 20 },
  ],
  shipping: 15,
  taxRate: 13,
  createdAt: '2026-11-26T12:00:00.000Z',
  updatedAt: '2026-11-26T12:00:00.000Z',
  ...overrides,
});
// 650 + 178 = 828.00; tax 107.64; shipping 15.00 → 950.64
const ORDER_TOTAL = 950.64;

let lib;
let helcim;
let store; // id → stored checkout
let managers; // tokens that belong to managers

const deps = () => ({
  helcim: () => (process.env.HELCIM_API_TOKEN ? lib.helcimFromEnv() : null),
  getCheckout: async (id) => store.get(id) ?? null,
  verifyManager: async (req) => {
    const token = /^Bearer (.+)$/.exec(req.headers.get('authorization') ?? '')?.[1];
    return managers.has(token) ? { uid: 'manager-1', email: 'owner@example.com' } : null;
  },
});

const create = (id, init = {}) =>
  lib.createCheckoutHandler(deps())(
    new Request('http://payments.test/checkout-create', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }), ...init }),
  );
const status = (query) => lib.createStatusHandler(deps())(new Request(`http://payments.test/checkout-status?${new URLSearchParams(query)}`));
const payments = (token) =>
  lib.createPaymentsHandler(deps())(new Request('http://payments.test/checkout-payments', { headers: token ? { authorization: `Bearer ${token}` } : {} }));

before(async () => {
  helcim = await startFakeHelcim({ port: 8791 });
  lib = await loadHandlers();
});
after(() => helcim.close());
beforeEach(() => {
  helcim.reset();
  store = new Map([[ORDER_ID, order()], [OTHER_ID, order({ title: 'Other order' })]]);
  managers = new Set(['manager-token']);
  process.env.HELCIM_API_TOKEN = FAKE_TOKEN;
  process.env.HELCIM_API_URL = helcim.url;
});

describe('opening a payment', () => {
  test('charges the total worked out from the stored order, against that order’s invoice', async () => {
    const res = await create(ORDER_ID);
    const body = await res.json();
    assert.equal(res.status, 200, JSON.stringify(body));
    assert.match(body.checkoutToken, /^tok/);
    assert.equal(body.invoiceNumber, lib.invoiceNumberFor(ORDER_ID));
    assert.equal(body.secretToken, undefined, 'the secret token must never reach the browser');

    const sent = helcim.state.requests.at(-1);
    assert.equal(sent.paymentType, 'purchase');
    assert.equal(sent.amount, ORDER_TOTAL);
    assert.equal(sent.currency, 'CAD');
    assert.equal(sent.invoiceRequest.invoiceNumber, lib.invoiceNumberFor(ORDER_ID));
    assert.deepEqual(
      sent.invoiceRequest.lineItems.map((line) => [line.sku, line.quantity, line.price, line.total]),
      [['ITEM-1', 1, 650, 650], ['ITEM-2', 2, 89, 178], ['SHIPPING', 1, 15, 15], ['TAX', 1, 107.64, 107.64]],
      'free items are left off; shipping and tax are lines so the invoice adds up to the charge',
    );
  });

  test('ignores any amount or price sent by the browser', async () => {
    const res = await lib.createCheckoutHandler(deps())(
      new Request('http://payments.test/checkout-create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: ORDER_ID, amount: 1, total: 1, currency: 'USD', items: [{ price: 0.01, quantity: 1 }] }),
      }),
    );
    assert.equal(res.status, 200);
    assert.equal(helcim.state.requests.at(-1).amount, ORDER_TOTAL);
    assert.equal(helcim.state.requests.at(-1).currency, 'CAD');
  });

  test('reuses the invoice when the buyer opens the payment window again', async () => {
    assert.equal((await create(ORDER_ID)).status, 200);
    assert.equal((await create(ORDER_ID)).status, 200);
    const second = helcim.state.requests.at(-1);
    assert.equal(second.invoiceNumber, lib.invoiceNumberFor(ORDER_ID));
    assert.equal(second.invoiceRequest, undefined);
    assert.equal(helcim.state.invoices.size, 1, 'one invoice per checkout, however many attempts');
  });

  test('still opens the payment when Helcim will not accept the window styling', async () => {
    helcim.state.options.rejectStyling = true;
    const res = await create(ORDER_ID);
    assert.equal(res.status, 200, JSON.stringify(await res.clone().json()));
    assert.equal(helcim.state.requests.at(-1).customStyling, undefined);
    assert.equal(helcim.state.requests.at(-1).amount, ORDER_TOTAL);
  });

  test('still opens the payment when the token may not look invoices up', async () => {
    helcim.state.options.forbidInvoices = true;
    assert.equal((await create(ORDER_ID)).status, 200);
    // Second time the invoice exists but cannot be looked up: the fallback names it directly.
    const res = await create(ORDER_ID);
    assert.equal(res.status, 200, JSON.stringify(await res.clone().json()));
    assert.equal(helcim.state.requests.at(-1).invoiceNumber, lib.invoiceNumberFor(ORDER_ID));
    assert.equal(helcim.state.invoices.size, 1);
  });

  test('an order with more than 20 lines becomes a single invoice line for the same total', async () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: `i${i}`, name: `Item ${i + 1}`, quantity: 1, price: 10, listPrice: 0 }));
    store.set(ORDER_ID, order({ items, shipping: 0, taxRate: 0 }));
    assert.equal((await create(ORDER_ID)).status, 200);
    const sent = helcim.state.requests.at(-1);
    assert.equal(sent.amount, 250);
    assert.deepEqual(sent.invoiceRequest.lineItems.map((line) => [line.sku, line.total]), [['ORDER', 250]]);
  });

  test('refuses orders that cannot be charged', async () => {
    const check = async (id, expectedStatus, expectedCode) => {
      const res = await create(id);
      assert.equal(res.status, expectedStatus);
      assert.equal((await res.json()).code, expectedCode);
    };
    await check('does-not-exist', 400, 'bad_request'); // hyphens are not part of an id
    await check('Missing0000000000000', 404, 'not_found');
    store.set(ORDER_ID, order({ items: [{ id: 'a', name: 'Gift', quantity: 1, price: 0, listPrice: 30 }], shipping: 0 }));
    await check(ORDER_ID, 400, 'empty');
    store.set(ORDER_ID, order({ currency: 'EUR' }));
    await check(ORDER_ID, 400, 'currency');
    assert.equal(helcim.state.requests.length, 0, 'none of these should have reached Helcim');
  });

  test('says payments are not set up when there is no API token', async () => {
    delete process.env.HELCIM_API_TOKEN;
    const res = await create(ORDER_ID);
    assert.equal(res.status, 503);
    assert.equal((await res.json()).code, 'not_configured');
    assert.deepEqual(await (await status({ id: ORDER_ID })).json(), { configured: false, state: 'unknown' });
  });

  test('explains a rejected API token in words the owner can act on', async () => {
    process.env.HELCIM_API_TOKEN = 'wrong-token';
    const res = await create(ORDER_ID);
    const body = await res.json();
    assert.equal(res.status, 503);
    assert.equal(body.code, 'helcim_auth');
    assert.match(body.error, /HELCIM_API_TOKEN/);
    const state = await (await status({ id: ORDER_ID })).json();
    assert.equal(state.state, 'unknown');
    assert.equal(state.code, 'helcim_auth');
  });

  test('passes on Helcim’s own words when it rejects the order', async () => {
    helcim.state.options.failInitialize = 400;
    const res = await create(ORDER_ID);
    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.code, 'helcim_invalid');
    assert.match(body.error, /Service unavailable/);
  });

  test('answers the browser’s permission check, so the site can call from another address', async () => {
    const res = await lib.createCheckoutHandler(deps())(new Request('http://payments.test/checkout-create', { method: 'OPTIONS' }));
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), '*');
    assert.match(res.headers.get('access-control-allow-headers'), /authorization/);
    assert.equal((await create(ORDER_ID)).headers.get('access-control-allow-origin'), '*');
  });
});

describe('knowing what has been paid', () => {
  const payFor = async (id) => {
    const { checkoutToken } = await (await create(id)).json();
    return helcim.pay({ checkoutToken });
  };

  test('an order is unpaid until Helcim has an approved payment for its invoice', async () => {
    assert.deepEqual(await (await status({ id: ORDER_ID })).json(), { configured: true, state: 'unpaid' });
    const { checkoutToken } = await (await create(ORDER_ID)).json();
    helcim.pay({ checkoutToken, declined: true });
    assert.equal((await (await status({ id: ORDER_ID })).json()).state, 'unpaid', 'a declined card is not a payment');
    const paid = helcim.pay({ checkoutToken });
    const body = await (await status({ id: ORDER_ID })).json();
    assert.equal(body.state, 'paid');
    assert.equal(body.amount, ORDER_TOTAL);
    assert.equal(body.currency, 'CAD');
    assert.ok(Math.abs(new Date(body.paidAt) - Date.now()) < 5000, `paidAt should be now, got ${body.paidAt}`);
    assert.equal((await (await status({ id: ORDER_ID, transaction: String(paid.transactionId) })).json()).state, 'paid');
  });

  test('a payment only counts for the checkout it was made for', async () => {
    const paid = await payFor(OTHER_ID);
    // A buyer of ORDER_ID pointing at someone else's transaction gets nowhere.
    const body = await (await status({ id: ORDER_ID, transaction: String(paid.transactionId) })).json();
    assert.equal(body.state, 'unpaid');
    assert.equal((await (await status({ id: OTHER_ID })).json()).state, 'paid');
  });

  test('refuses a second payment for an order that is already paid', async () => {
    await payFor(ORDER_ID);
    const res = await create(ORDER_ID);
    assert.equal(res.status, 409);
    assert.equal((await res.json()).code, 'already_paid');
  });

  test('refuses a card payment for an order the owner marked as paid by hand', async () => {
    store.set(ORDER_ID, order({ markedPaidAt: '2026-11-26T18:30:00.000Z' }));
    const res = await create(ORDER_ID);
    assert.equal(res.status, 409);
    assert.equal(helcim.state.requests.length, 0);
  });

  test('a full refund makes the order unpaid again', async () => {
    const paid = await payFor(ORDER_ID);
    helcim.refund(paid.transactionId);
    assert.equal((await (await status({ id: ORDER_ID })).json()).state, 'unpaid');
    // …also for the buyer, whose browser still remembers the payment it made.
    assert.equal((await (await status({ id: ORDER_ID, transaction: String(paid.transactionId) })).json()).state, 'unpaid');
  });

  test('a payment made seconds ago counts even before Helcim’s list shows it', async () => {
    const paid = await payFor(ORDER_ID);
    helcim.state.options.listIsBehind = true;
    assert.equal((await (await status({ id: ORDER_ID })).json()).state, 'unpaid');
    const body = await (await status({ id: ORDER_ID, transaction: String(paid.transactionId) })).json();
    assert.equal(body.state, 'paid');
    assert.equal(body.amount, ORDER_TOTAL);
  });

  test('only a signed-in manager can list payments', async () => {
    await payFor(ORDER_ID);
    assert.equal((await payments()).status, 401);
    assert.equal((await payments('someone-else')).status, 401);
    const res = await payments('manager-token');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(Object.keys(body.payments), [lib.invoiceNumberFor(ORDER_ID)]);
    assert.equal(body.payments[lib.invoiceNumberFor(ORDER_ID)].amount, ORDER_TOTAL);
  });

  test('payments taken in Helcim for anything else are left out of the list', async () => {
    helcim.state.transactions.push({ transactionId: 1, status: 'APPROVED', type: 'purchase', amount: 40, currency: 'CAD', invoiceNumber: 'INV100101', dateCreated: '2026-02-04 11:40:21' });
    assert.deepEqual((await (await payments('manager-token')).json()).payments, {});
  });
});

describe('small things that are easy to get wrong', () => {
  test('Helcim’s Mountain Time dates become the right moment, summer and winter', () => {
    assert.equal(lib.helcimDate('2026-02-04 11:40:21'), '2026-02-04T18:40:21.000Z');
    assert.equal(lib.helcimDate('2026-07-04 11:40:21'), '2026-07-04T17:40:21.000Z');
    assert.equal(lib.helcimDate('not a date'), '');
  });

  test('invoice numbers ignore upper and lower case, as Helcim does', () => {
    const transactions = [{ status: 'approved', type: 'Purchase', amount: '12.50', currency: 'cad', invoiceNumber: 'ord-ab3defgh1jklmn', dateCreated: '2026-02-04 11:40:21' }];
    const payment = lib.paymentFor(transactions, lib.invoiceNumberFor(ORDER_ID));
    assert.deepEqual(payment, { state: 'paid', amount: 12.5, currency: 'CAD', paidAt: '2026-02-04T18:40:21.000Z' });
  });

  test('money is sent to Helcim in dollars with exact cents', () => {
    const tricky = order({ items: [{ id: 'a', name: 'Thing', quantity: 3, price: 0.1, listPrice: 0 }, { id: 'b', name: 'Other', quantity: 1, price: 19.99, listPrice: 0 }], shipping: 0.2, taxRate: 8.25 });
    const totals = lib.checkoutTotals({ ...tricky, shipping: 0.2 });
    const lines = lib.invoiceLines({ ...tricky, id: ORDER_ID }, totals);
    const sum = lines.reduce((total, line) => total + Math.round(line.total * 100), 0);
    assert.equal(sum, totals.totalMinor, 'the invoice lines add up to the charge, to the cent');
    assert.ok(lines.every((line) => Number.isInteger(Math.round(line.total * 100)) && String(line.total).split('.')[1]?.length !== 3));
  });
});

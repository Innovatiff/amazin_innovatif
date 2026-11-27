// A stand-in for Helcim's API, for the tests only. It behaves the way Helcim's
// documentation describes (https://devdocs.helcim.com): payments are opened with
// POST /v2/helcim-pay/initialize, and paid transactions are found by invoice number.
//
// Nothing here is ever used by the live site.
import { createServer } from 'node:http';

export const FAKE_TOKEN = 'test-helcim-token';
/** Where the browser test runs it; the payment function is told this address (see run-e2e.mjs). */
export const FAKE_PORT = 8788;

/** Helcim reports times in Mountain Time, as "YYYY-MM-DD HH:MM:SS". */
function mountainTime(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Edmonton', hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(date);
  const part = (type) => parts.find((p) => p.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')} ${part('hour')}:${part('minute')}:${part('second')}`;
}

export async function startFakeHelcim({ port = 8788 } = {}) {
  const state = {
    invoices: new Map(), //   invoiceNumber (upper case) → { invoiceId, invoiceNumber, status, amount, lineItems }
    sessions: new Map(), //   checkoutToken → { amount, currency, invoiceNumber }
    transactions: [], //      what GET /card-transactions returns
    requests: [], //          every initialize body, for the tests to inspect
    /** Switches that make the fake stricter, to exercise the fallbacks. */
    options: { rejectStyling: false, forbidInvoices: false, failInitialize: 0, listIsBehind: false },
    nextId: 44158000,
  };

  const reply = (res, status, body) => {
    res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' });
    res.end(JSON.stringify(body));
  };
  const errors = (res, status, ...list) => reply(res, status, { errors: list });
  const sameNumber = (a, b) => String(a ?? '').trim().toUpperCase() === String(b ?? '').trim().toUpperCase();

  function initialize(body, res) {
    state.requests.push(body);
    if (state.options.failInitialize) return errors(res, state.options.failInitialize, 'Service unavailable');
    if (body.paymentType !== 'purchase') return errors(res, 400, 'paymentType is required');
    if (typeof body.amount !== 'number' || !(body.amount > 0)) return errors(res, 400, 'amount must be a positive number');
    if (Math.round(body.amount * 100) !== body.amount * 100 && Math.abs(Math.round(body.amount * 100) - body.amount * 100) > 1e-6) {
      return errors(res, 400, 'amount must have at most two decimals');
    }
    if (!['CAD', 'USD'].includes(body.currency)) return errors(res, 400, 'currency must be CAD or USD');
    if (state.options.rejectStyling && body.customStyling) return errors(res, 400, 'customStyling: unknown field');

    let invoiceNumber;
    if (body.invoiceRequest) {
      const request = body.invoiceRequest;
      const lines = Array.isArray(request.lineItems) ? request.lineItems : [];
      if (lines.length === 0 || lines.length > 20) return errors(res, 400, 'invoiceRequest.lineItems: between 1 and 20 line items are required');
      for (const line of lines) {
        if (!line.sku || !line.description || !(line.quantity > 0) || typeof line.price !== 'number' || typeof line.total !== 'number') {
          return errors(res, 400, 'invoiceRequest.lineItems: sku, description, quantity, price and total are required');
        }
        if (Math.round(line.price * line.quantity * 100) !== Math.round(line.total * 100)) return errors(res, 400, 'line item total does not match price × quantity');
      }
      const total = lines.reduce((sum, line) => sum + Math.round(line.total * 100), 0);
      if (total !== Math.round(body.amount * 100)) return errors(res, 400, 'The amount must equal the total of the invoice line items');
      invoiceNumber = String(request.invoiceNumber || `INV${state.nextId++}`);
      if (state.invoices.has(invoiceNumber.toUpperCase())) return errors(res, 400, `Invoice number ${invoiceNumber} already exists`);
      state.invoices.set(invoiceNumber.toUpperCase(), { invoiceId: state.nextId++, invoiceNumber, status: 'DUE', amount: body.amount, lineItems: lines });
    } else if (body.invoiceNumber) {
      const invoice = state.invoices.get(String(body.invoiceNumber).toUpperCase());
      if (!invoice) return errors(res, 400, `Invoice ${body.invoiceNumber} not found`);
      invoiceNumber = invoice.invoiceNumber;
    } else {
      invoiceNumber = `INV${state.nextId++}`;
      state.invoices.set(invoiceNumber, { invoiceId: state.nextId++, invoiceNumber, status: 'DUE', amount: body.amount, lineItems: [] });
    }

    const checkoutToken = `tok${(state.nextId++).toString(36)}${Math.random().toString(36).slice(2, 12)}`;
    state.sessions.set(checkoutToken, { amount: body.amount, currency: body.currency, invoiceNumber });
    reply(res, 200, { checkoutToken, secretToken: `sec${Math.random().toString(36).slice(2, 14)}` });
  }

  /** What Helcim's payment window does when a card is approved (or declined). */
  function pay({ checkoutToken, declined = false }) {
    const session = state.sessions.get(checkoutToken);
    if (!session) return null;
    const transaction = {
      transactionId: state.nextId++,
      dateCreated: mountainTime(),
      cardBatchId: 6005228,
      status: declined ? 'DECLINED' : 'APPROVED',
      user: 'Helcim System',
      type: 'purchase',
      amount: session.amount,
      currency: session.currency,
      avsResponse: 'X',
      cvvResponse: 'M',
      cardType: 'MC',
      approvalCode: declined ? '' : 'T3E3ST',
      cardToken: 'LFEY40ReTNOXkBu0y9LDDA',
      cardNumber: '5454545454',
      cardHolderName: 'Helcim Test',
      customerCode: 'CST65559',
      invoiceNumber: session.invoiceNumber,
      warning: '',
    };
    state.transactions.unshift(transaction);
    if (!declined) {
      state.sessions.delete(checkoutToken); // an approved payment uses the token up
      const invoice = state.invoices.get(session.invoiceNumber.toUpperCase());
      if (invoice) invoice.status = 'PAID';
    }
    return transaction;
  }

  function refund(transactionId) {
    const original = state.transactions.find((t) => String(t.transactionId) === String(transactionId));
    if (!original) return null;
    const transaction = { ...original, transactionId: state.nextId++, type: 'refund', dateCreated: mountainTime() };
    state.transactions.unshift(transaction);
    return transaction;
  }

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    if (req.method === 'OPTIONS') return reply(res, 204, {});
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    let body = {};
    try { body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}; } catch { return errors(res, 400, 'Invalid JSON'); }

    // What the stand-in payment window (in the browser test) calls.
    if (url.pathname === '/fake/pay' && req.method === 'POST') {
      const transaction = pay(body);
      return transaction ? reply(res, 200, transaction) : errors(res, 404, 'Unknown or used checkout token');
    }

    if (!url.pathname.startsWith('/v2/')) return errors(res, 404, 'Not found');
    if (req.headers['api-token'] !== FAKE_TOKEN) return errors(res, 401, 'Unauthorized');

    if (url.pathname === '/v2/helcim-pay/initialize' && req.method === 'POST') return initialize(body, res);

    if (url.pathname === '/v2/invoices' && req.method === 'GET') {
      if (state.options.forbidInvoices) return errors(res, 403, 'Forbidden');
      const wanted = url.searchParams.get('invoiceNumber');
      const all = [...state.invoices.values()];
      return reply(res, 200, wanted ? all.filter((invoice) => sameNumber(invoice.invoiceNumber, wanted)) : all.slice(0, 100));
    }

    if (url.pathname === '/v2/card-transactions' && req.method === 'GET') {
      const wanted = url.searchParams.get('invoiceNumber');
      const limit = Math.min(Number(url.searchParams.get('limit')) || 1000, 1000);
      const page = Math.max(Number(url.searchParams.get('page')) || 1, 1);
      // Helcim's list can be a moment behind a payment that has only just been made.
      const list = state.options.listIsBehind ? [] : state.transactions.filter((t) => !wanted || sameNumber(t.invoiceNumber, wanted));
      return reply(res, 200, list.slice((page - 1) * limit, page * limit));
    }

    const one = /^\/v2\/card-transactions\/(\d+)$/.exec(url.pathname);
    if (one && req.method === 'GET') {
      const transaction = state.transactions.find((t) => String(t.transactionId) === one[1]);
      // The real Helcim answers 400, not 404, for an id it does not know.
      return transaction ? reply(res, 200, transaction) : errors(res, 400, `Failed to retrieve card transaction #${one[1]}.`);
    }

    errors(res, 404, 'Not found');
  });

  await new Promise((resolve, reject) => server.once('error', reject).listen(port, '127.0.0.1', resolve));
  return {
    url: `http://127.0.0.1:${port}/v2`,
    origin: `http://127.0.0.1:${port}`,
    state,
    pay,
    refund,
    reset() {
      state.invoices.clear(); state.sessions.clear(); state.transactions.length = 0; state.requests.length = 0;
      Object.assign(state.options, { rejectStyling: false, forbidInvoices: false, failInitialize: 0, listIsBehind: false });
    },
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

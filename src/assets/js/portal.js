// Manager portal — sign in, then read and manage website messages ("Contact")
// and booking-system leads ("Bookings") live from Firestore.
//
// Who may get in is decided by firestore.rules: only accounts with a document
// in the "managers" collection can read anything. This file is just the screen.
import { SITE, FIREBASE_SDK, firebaseConfig, LOCAL, EMULATORS } from './config.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const ICONS = $('[data-icons]').dataset.icons;
const PAGE = 200;

/* ── Tiny DOM helpers ───────────────────────────────────────────────────────
   Everything a visitor typed is inserted as text, never as HTML, so a message
   can't inject markup or scripts into the manager's screen. */

function h(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    if (key === 'class') element.className = value;
    else if (key === 'dataset') Object.assign(element.dataset, value);
    else if (key.startsWith('on')) element.addEventListener(key.slice(2), value);
    else element.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    element.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return element;
}

// Replace an element's content, skipping anything null or false.
function fill(element, ...children) {
  element.replaceChildren(...children.flat(Infinity).filter((child) => child != null && child !== false));
}

function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `${ICONS}#${name}`);
  svg.append(use);
  return svg;
}

function view(name) {
  for (const element of $$('[data-view]')) element.hidden = element.dataset.view !== name;
}

let toastTimer;
function toast(message) {
  const element = $('[data-toast]');
  element.textContent = message;
  element.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (element.hidden = true), 4500);
}

/* ── Firebase ───────────────────────────────────────────────────────────── */

let auth, db, A, F;
try {
  const [appModule, authModule, firestoreModule] = await Promise.all([
    import(`${FIREBASE_SDK}/firebase-app.js`),
    import(`${FIREBASE_SDK}/firebase-auth.js`),
    import(`${FIREBASE_SDK}/firebase-firestore.js`),
  ]);
  A = authModule;
  F = firestoreModule;
  const app = appModule.initializeApp(firebaseConfig);
  auth = A.getAuth(app);
  db = F.getFirestore(app);
  if (LOCAL) {
    A.connectAuthEmulator(auth, EMULATORS.auth, { disableWarnings: true });
    F.connectFirestoreEmulator(db, ...EMULATORS.firestore);
  }
} catch (error) {
  console.error(error);
  view('signin');
  const box = $('[data-auth-error]');
  box.textContent = 'The portal couldn’t load. Check your internet connection and refresh the page.';
  box.hidden = false;
  throw error;
}

/* ── State ──────────────────────────────────────────────────────────────── */

const state = {
  user: null,
  tab: 'Contact',
  filter: 'open',
  search: '',
  selected: null, // { tab, id }
  limit: { Contact: PAGE, Bookings: PAGE },
  docs: { Contact: [], Bookings: [] },
  ready: { Contact: false, Bookings: false },
  stop: { Contact: null, Bookings: null },
  alerts: localStorage.getItem('innovatif:alerts') === '1',
};

const STAGES = [
  ['new', 'New'],
  ['progress', 'In progress'],
  ['done', 'Done'],
  ['archived', 'Archived'],
];
const STAGE_STATUS = { new: 'New', progress: 'In progress', done: 'Done', archived: 'Archived' };

// "Pending Payment" and "Paid - New Booking" come from the booking form and
// still need attention, so they count as new.
function stageOf(item) {
  const status = String(item.status || 'New').toLowerCase();
  if (status === 'in progress') return 'progress';
  if (status === 'done') return 'done';
  if (status === 'archived') return 'archived';
  return 'new';
}

const text = (value) => (value == null ? '' : String(value));
const list = (value) => (Array.isArray(value) ? value.map(text).filter(Boolean) : value ? [text(value)] : []);

function normalize(tab, snapshot) {
  const d = snapshot.data();
  const created = d.createdAt?.toDate?.() ?? null;
  const base = {
    id: snapshot.id,
    tab,
    created,
    status: text(d.status) || 'New',
    notes: text(d.notes),
    read: Boolean(d.readAt),
    phone: text(d.phone),
    email: text(d.email),
    source: text(d.source),
  };
  if (tab === 'Contact') {
    return {
      ...base,
      name: text(d.name) || 'No name',
      service: text(d.enquiry),
      product: text(d.product),
      message: text(d.message),
      preferred: text(d.preferredContact),
      page: text(d.page),
    };
  }
  return {
    ...base,
    name: text(d.fullName) || 'No name',
    business: text(d.businessName),
    businessType: text(d.businessType),
    city: text(d.city),
    websiteStatus: text(d.websiteStatus),
    plan: text(d.plan),
    goals: list(d.mainGoal),
    problems: list(d.bookingProblem),
    reservation: text(d.reservationChoice),
    payment: text(d.paymentStatus),
    pendingId: text(d.pendingId),
  };
}

// A lead that paid its deposit is saved a second time as "Paid"; hide the
// earlier "Pending Payment" copy so each lead appears once.
function visibleDocs(tab) {
  const docs = state.docs[tab];
  if (tab !== 'Bookings') return docs;
  const superseded = new Set(docs.map((item) => item.pendingId).filter(Boolean));
  return docs.filter((item) => !superseded.has(item.id));
}

/* ── Formatting ─────────────────────────────────────────────────────────── */

const fullDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const shortDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

function ago(date) {
  if (!date) return '';
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d`;
  return shortDate.format(date);
}

const digits = (value) => text(value).replace(/\D/g, '');

function telLink(phone) {
  const number = digits(phone);
  if (number.length < 7) return null;
  return `tel:${text(phone).trim().startsWith('+') ? '+' : ''}${number}`;
}

function whatsappLink(item) {
  let number = digits(item.phone);
  if (number.length < 7) return null;
  // A 10-digit number typed without a country code, for a business whose own
  // number starts with 1 (US/Canada): add the 1 so WhatsApp can find it.
  const own = digits(SITE.whatsapp || SITE.phone);
  if (number.length === 10 && own.length === 11 && own.startsWith('1')) number = `1${number}`;
  const first = item.name.split(' ')[0];
  const about = item.product || item.service || (item.tab === 'Bookings' ? 'your booking system' : 'your enquiry');
  const hello = `Hi ${first}, this is ${SITE.name}. Thanks for your message about ${about}.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(hello)}`;
}

function mailLink(item) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(item.email)) return null;
  const subject = `Your enquiry with ${SITE.name}`;
  const body = `Hi ${item.name.split(' ')[0]},\n\n`;
  const address = item.email.replace(/[?&#%]/g, (character) => encodeURIComponent(character));
  return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/* ── Rendering: list ────────────────────────────────────────────────────── */

function matches(item) {
  const stage = stageOf(item);
  if (state.filter === 'open' && !(stage === 'new' || stage === 'progress')) return false;
  if (!['open', 'all'].includes(state.filter) && stage !== state.filter) return false;
  if (!state.search) return true;
  const haystack = [item.name, item.phone, item.email, item.service, item.product, item.message, item.business, item.city, item.plan, item.notes]
    .join(' ')
    .toLowerCase();
  return state.search.split(/\s+/).every((word) => haystack.includes(word));
}

function statusLabel(item) {
  const stage = stageOf(item);
  if (stage !== 'new') return STAGE_STATUS[stage];
  if (/pending payment/i.test(item.status)) return 'Deposit not finished';
  if (/paid/i.test(item.status)) return 'Deposit reported paid';
  return 'New';
}

function renderCounts() {
  for (const tab of ['Contact', 'Bookings']) {
    const fresh = visibleDocs(tab).filter((item) => stageOf(item) === 'new').length;
    const badge = $(`[data-count="${tab}"]`);
    badge.textContent = fresh;
    badge.hidden = fresh === 0;
  }
  const docs = visibleDocs(state.tab);
  const counts = { all: docs.length, open: 0, new: 0, progress: 0, done: 0, archived: 0 };
  for (const item of docs) {
    const stage = stageOf(item);
    counts[stage] += 1;
    if (stage === 'new' || stage === 'progress') counts.open += 1;
  }
  for (const [key, value] of Object.entries(counts)) $(`[data-stat="${key}"]`).textContent = value;

  const waiting = ['Contact', 'Bookings'].reduce((sum, tab) => sum + visibleDocs(tab).filter((item) => stageOf(item) === 'new').length, 0);
  document.title = `${waiting ? `(${waiting}) ` : ''}Manager portal — ${SITE.name}`;
}

function renderList() {
  const container = $('[data-list]');
  const items = visibleDocs(state.tab).filter(matches);
  container.replaceChildren();

  if (!state.ready[state.tab]) {
    container.append(h('li', { class: 'list__note' }, 'Loading…'));
  } else if (!items.length) {
    const nothing = state.search || state.filter !== 'open' ? 'Nothing matches this filter.' : state.tab === 'Contact' ? 'No open messages. When someone writes to you on the website, it appears here.' : 'No open booking leads yet.';
    container.append(h('li', { class: 'list__note' }, nothing));
  }

  for (const item of items) {
    const stage = stageOf(item);
    const selected = state.selected?.tab === item.tab && state.selected.id === item.id;
    const tag = item.tab === 'Contact' ? item.service : item.plan && `${item.plan} plan`;
    const preview = item.tab === 'Contact' ? [item.product, item.message].filter(Boolean).join(' — ') : [item.business, item.businessType, item.city].filter(Boolean).join(' · ');
    container.append(
      h('li', {},
        h('button', {
            type: 'button',
            class: `item${stage === 'new' && !item.read ? ' is-unread' : ''}${selected ? ' is-selected' : ''}`,
            'aria-current': selected ? 'true' : null,
            onclick: () => select(item),
          },
          h('span', { class: 'item__top' }, h('strong', {}, item.name), h('time', { title: item.created ? fullDate.format(item.created) : '' }, ago(item.created))),
          h('span', { class: 'item__meta' }, tag && h('span', { class: 'pill' }, tag), h('span', { class: `pill pill--${stage}` }, statusLabel(item))),
          h('span', { class: 'item__preview' }, preview || 'No details'),
        ),
      ),
    );
  }

  $('[data-more]').hidden = state.docs[state.tab].length < state.limit[state.tab];
  renderCounts();
}

/* ── Rendering: detail ──────────────────────────────────────────────────── */

function field(label, value) {
  const values = list(value);
  if (!values.length) return null;
  return h('div', { class: 'fact' }, h('dt', {}, label), h('dd', {}, values.length > 1 ? h('ul', {}, values.map((entry) => h('li', {}, entry))) : values[0]));
}

function currentItem() {
  if (!state.selected) return null;
  return state.docs[state.selected.tab].find((item) => item.id === state.selected.id) ?? null;
}

function renderDetail({ keepNotes = false } = {}) {
  const pane = $('[data-detail]');
  const item = currentItem();
  const draft = keepNotes ? $('[data-notes]', pane)?.value : undefined;

  if (!item) {
    state.selected = null;
    document.body.classList.remove('is-reading');
    fill(pane, h('div', { class: 'empty' }, icon('tray'), h('p', {}, state.tab === 'Contact' ? 'Select a message to read it.' : 'Select a lead to see the details.')));
    return;
  }

  const stage = stageOf(item);
  const call = telLink(item.phone);
  const whatsapp = whatsappLink(item);
  const mail = mailLink(item);
  const notes = h('textarea', { rows: '4', maxlength: '4000', placeholder: 'Only you and other managers can see these notes.', dataset: { notes: '' } });
  notes.value = draft ?? item.notes;

  fill(
    pane,
    h('header', { class: 'detail__head' },
      h('button', { type: 'button', class: 'icon-button detail__back', 'aria-label': 'Back to the list', onclick: closeDetail }, icon('arrow-left')),
      h('div', {},
        h('h2', {}, item.name),
        h('p', {}, item.created ? fullDate.format(item.created) : 'Date unknown', item.tab === 'Bookings' && item.business ? ` · ${item.business}` : ''),
      ),
    ),

    h('div', { class: 'detail__reply' },
      call && h('a', { class: 'btn btn--outline btn--sm', href: call }, icon('phone-fill'), h('span', {}, 'Call')),
      whatsapp && h('a', { class: 'btn btn--whatsapp btn--sm', href: whatsapp, target: '_blank', rel: 'noopener' }, icon('whatsapp-logo-fill'), h('span', {}, 'WhatsApp')),
      mail && h('a', { class: 'btn btn--outline btn--sm', href: mail }, icon('envelope-simple'), h('span', {}, 'Email')),
      !call && !mail && h('p', { class: 'detail__hint' }, 'No contact details were left.'),
    ),

    h('div', { class: 'segmented', role: 'group', 'aria-label': 'Status' },
      STAGES.map(([key, label]) =>
        h('button', { type: 'button', class: stage === key ? 'is-active' : '', 'aria-pressed': String(stage === key), onclick: () => setStage(item, key) }, label),
      ),
    ),
    stage === 'new' && statusLabel(item) !== 'New' && h('p', { class: 'detail__hint' }, `${statusLabel(item)} — check your Stripe account to confirm the payment.`),

    item.tab === 'Contact' && h('section', { class: 'detail__block' }, h('h3', {}, 'Message'), h('p', { class: 'detail__message' }, item.message || '—')),

    h('dl', { class: 'facts' },
      field('Phone', item.phone),
      field('Email', item.email),
      item.tab === 'Contact'
        ? [field('Service', item.service), field('Product or project', item.product), field('Prefers a reply by', item.preferred), field('Sent from page', item.page)]
        : [
            field('Business', item.business),
            field('Type of business', item.businessType),
            field('Town or city', item.city),
            field('Has a website?', item.websiteStatus),
            field('Plan', item.plan),
            field('Reservation', item.reservation),
            field('Payment', item.payment),
            field('Main goals', item.goals),
            field('Booking problems', item.problems),
          ],
    ),

    h('section', { class: 'detail__block' },
      h('h3', {}, 'Private notes'),
      notes,
      h('button', { type: 'button', class: 'btn btn--outline btn--sm', onclick: () => saveNotes(item, notes.value) }, 'Save notes'),
    ),

    h('footer', { class: 'detail__foot' },
      h('button', { type: 'button', class: 'link-button danger', onclick: () => remove(item) }, icon('trash'), 'Delete permanently'),
    ),
  );
}

/* ── Actions ────────────────────────────────────────────────────────────── */

const ref = (item) => F.doc(db, item.tab, item.id);

function explain(error) {
  console.error(error);
  if (error?.code === 'permission-denied') return 'You don’t have permission to do that.';
  if (error?.code === 'unavailable') return 'You appear to be offline. Try again in a moment.';
  return 'That didn’t work. Please try again.';
}

function select(item) {
  state.selected = { tab: item.tab, id: item.id };
  document.body.classList.add('is-reading');
  renderList();
  renderDetail();
  $('[data-detail]').scrollTop = 0;
  if (!item.read) F.updateDoc(ref(item), { readAt: F.serverTimestamp() }).catch((error) => console.error(error));
}

function closeDetail() {
  state.selected = null;
  document.body.classList.remove('is-reading');
  renderList();
  renderDetail();
}

async function setStage(item, stage) {
  try {
    await F.updateDoc(ref(item), { status: STAGE_STATUS[stage], updatedAt: F.serverTimestamp(), handledBy: state.user.email ?? state.user.uid });
    toast(`Marked as ${STAGE_STATUS[stage].toLowerCase()}.`);
  } catch (error) {
    toast(explain(error));
  }
}

async function saveNotes(item, notes) {
  try {
    await F.updateDoc(ref(item), { notes: notes.trim().slice(0, 4000), updatedAt: F.serverTimestamp() });
    toast('Notes saved.');
  } catch (error) {
    toast(explain(error));
  }
}

async function remove(item) {
  if (!confirm(`Delete this ${item.tab === 'Contact' ? 'message' : 'lead'} from ${item.name}? This can’t be undone.`)) return;
  try {
    await F.deleteDoc(ref(item));
    closeDetail();
    toast('Deleted.');
  } catch (error) {
    toast(explain(error));
  }
}

function exportCsv() {
  const items = visibleDocs(state.tab).filter(matches);
  if (!items.length) return toast('There is nothing in this list to export.');
  const columns =
    state.tab === 'Contact'
      ? [['Date', (i) => (i.created ? i.created.toISOString() : '')], ['Status', statusLabel], ['Name', (i) => i.name], ['Phone', (i) => i.phone], ['Email', (i) => i.email], ['Service', (i) => i.service], ['Product', (i) => i.product], ['Message', (i) => i.message], ['Reply by', (i) => i.preferred], ['Notes', (i) => i.notes]]
      : [['Date', (i) => (i.created ? i.created.toISOString() : '')], ['Status', statusLabel], ['Name', (i) => i.name], ['Phone', (i) => i.phone], ['Email', (i) => i.email], ['Business', (i) => i.business], ['Type', (i) => i.businessType], ['City', (i) => i.city], ['Plan', (i) => i.plan], ['Website', (i) => i.websiteStatus], ['Goals', (i) => i.goals.join('; ')], ['Problems', (i) => i.problems.join('; ')], ['Payment', (i) => i.payment], ['Notes', (i) => i.notes]];
  // Quote every cell, and stop spreadsheets treating =, +, - or @ as a formula.
  const cell = (value) => {
    const safe = text(value).replace(/^([=+\-@\t\r])/, "'$1");
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const rows = [columns.map(([title]) => cell(title)).join(','), ...items.map((item) => columns.map(([, get]) => cell(get(item))).join(','))];
  const url = URL.createObjectURL(new Blob([`﻿${rows.join('\r\n')}`], { type: 'text/csv;charset=utf-8' }));
  const link = h('a', { href: url, download: `innovatif-${state.tab === 'Contact' ? 'messages' : 'booking-leads'}-${new Date().toISOString().slice(0, 10)}.csv` });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ── Alerts for new arrivals ────────────────────────────────────────────── */

function beep() {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.frequency.setValueAtTime(1175, context.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.4);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.42);
    oscillator.onended = () => context.close();
  } catch {
    // No audio available — the on-screen notice is enough.
  }
}

function announce(item) {
  const what = item.tab === 'Contact' ? 'New message' : 'New booking lead';
  toast(`${what} from ${item.name}`);
  if (!state.alerts) return;
  beep();
  if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
    new Notification(`${what} — ${SITE.name}`, { body: `${item.name}${item.service ? ` · ${item.service}` : ''}`, tag: item.id });
  }
}

function renderAlertsButton() {
  const button = $('[data-alerts]');
  button.setAttribute('aria-pressed', String(state.alerts));
  button.classList.toggle('is-on', state.alerts);
}

/* ── Live data ──────────────────────────────────────────────────────────── */

function listen(tab) {
  state.stop[tab]?.();
  const query = F.query(F.collection(db, tab), F.orderBy('createdAt', 'desc'), F.limit(state.limit[tab]));
  state.stop[tab] = F.onSnapshot(
    query,
    (snapshot) => {
      const first = !state.ready[tab];
      state.docs[tab] = snapshot.docs.map((entry) => normalize(tab, entry));
      state.ready[tab] = true;
      $('[data-app-error]').hidden = true;
      if (!first) {
        for (const change of snapshot.docChanges()) {
          if (change.type !== 'added') continue;
          const item = normalize(tab, change.doc);
          const recent = !item.created || Date.now() - item.created.getTime() < 5 * 60 * 1000;
          if (recent && stageOf(item) === 'new') announce(item);
        }
      }
      renderList();
      if (state.selected?.tab === tab) renderDetail({ keepNotes: true });
    },
    (error) => {
      console.error(error);
      if (error.code === 'permission-denied') return showDenied(state.user);
      const box = $('[data-app-error]');
      box.textContent = 'We couldn’t reach the database. Check your connection — this page reconnects by itself.';
      box.hidden = false;
    },
  );
}

function stopListening() {
  for (const tab of ['Contact', 'Bookings']) {
    state.stop[tab]?.();
    state.stop[tab] = null;
    state.docs[tab] = [];
    state.ready[tab] = false;
  }
}

/* ── Sign in / out ──────────────────────────────────────────────────────── */

function showDenied(user) {
  stopListening();
  $('[data-denied-email]').textContent = user.email ?? 'this account';
  $('[data-denied-uid]').textContent = user.uid;
  view('denied');
}

async function enter(user) {
  state.user = user;
  view('loading');
  try {
    const manager = await F.getDoc(F.doc(db, 'managers', user.uid));
    if (!manager.exists()) return showDenied(user);
  } catch (error) {
    console.error(error);
    return showDenied(user);
  }
  $('[data-user-email]').textContent = user.email ?? '';
  renderAlertsButton();
  view('app');
  renderList();
  renderDetail();
  listen('Contact');
  listen('Bookings');
}

A.onAuthStateChanged(auth, (user) => {
  if (user) return enter(user);
  state.user = null;
  state.selected = null;
  stopListening();
  // Leave nothing from the inbox behind on a shared computer.
  $('[data-list]').replaceChildren();
  $('[data-detail]').replaceChildren();
  $('[data-search]').value = '';
  state.search = '';
  document.body.classList.remove('is-reading');
  document.title = `Manager portal — ${SITE.name}`;
  view('signin');
});

const signin = $('[data-signin]');
const authError = $('[data-auth-error]');
const authInfo = $('[data-auth-info]');

function authMessage(error) {
  switch (error?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'That email and password don’t match. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes, or reset your password.';
    case 'auth/user-disabled':
      return 'This account has been turned off.';
    case 'auth/network-request-failed':
      return 'No connection. Check your internet and try again.';
    default:
      return 'We couldn’t sign you in. Please try again.';
  }
}

signin.addEventListener('submit', async (event) => {
  event.preventDefault();
  authError.hidden = true;
  authInfo.hidden = true;
  const email = signin.elements.email.value.trim();
  const password = signin.elements.password.value;
  if (!email || !password) {
    authError.textContent = 'Enter your email and password.';
    authError.hidden = false;
    return;
  }
  const button = $('[data-signin-button]');
  button.disabled = true;
  button.textContent = 'Signing in…';
  try {
    await A.signInWithEmailAndPassword(auth, email, password);
    signin.elements.password.value = '';
  } catch (error) {
    console.error(error);
    authError.textContent = authMessage(error);
    authError.hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = 'Sign in';
  }
});

$('[data-reset]').addEventListener('click', async () => {
  authError.hidden = true;
  authInfo.hidden = true;
  const email = signin.elements.email.value.trim();
  if (!email) {
    authError.textContent = 'Type your email above first, then press “Forgot your password?” again.';
    authError.hidden = false;
    signin.elements.email.focus();
    return;
  }
  try {
    await A.sendPasswordResetEmail(auth, email);
  } catch (error) {
    // Say the same thing either way, so this can't be used to test which emails have accounts.
    console.error(error);
  }
  authInfo.textContent = 'If that email has an account, a link to reset the password is on its way.';
  authInfo.hidden = false;
});

for (const button of $$('[data-signout]')) button.addEventListener('click', () => A.signOut(auth));
$('[data-retry]').addEventListener('click', () => state.user && enter(state.user));
$('[data-copy-uid]').addEventListener('click', async () => {
  const uid = $('[data-denied-uid]').textContent;
  try {
    await navigator.clipboard.writeText(uid);
    $('[data-copy-uid] span').textContent = 'Copied';
  } catch {
    getSelection().selectAllChildren($('[data-denied-uid]'));
  }
});

/* ── Toolbar ────────────────────────────────────────────────────────────── */

for (const tab of $$('[data-tab]')) {
  tab.addEventListener('click', () => {
    state.tab = tab.dataset.tab;
    state.selected = null;
    document.body.classList.remove('is-reading');
    for (const other of $$('[data-tab]')) other.setAttribute('aria-selected', String(other === tab));
    renderList();
    renderDetail();
  });
}

for (const filter of $$('[data-filter]')) {
  filter.addEventListener('click', () => {
    state.filter = filter.dataset.filter;
    for (const other of $$('[data-filter]')) other.classList.toggle('is-active', other === filter);
    renderList();
  });
}

$('[data-search]').addEventListener('input', (event) => {
  state.search = event.target.value.trim().toLowerCase();
  renderList();
});

$('[data-more]').addEventListener('click', () => {
  state.limit[state.tab] += PAGE;
  listen(state.tab);
});

$('[data-export]').addEventListener('click', exportCsv);

$('[data-alerts]').addEventListener('click', async () => {
  state.alerts = !state.alerts;
  localStorage.setItem('innovatif:alerts', state.alerts ? '1' : '0');
  renderAlertsButton();
  if (!state.alerts) return toast('Alerts are off.');
  beep();
  if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
  toast('Alerts are on. Keep this tab open to hear new messages arrive.');
});

// Keep the "5 min" style times fresh while the tab stays open.
setInterval(() => state.user && !document.hidden && renderList(), 60000);

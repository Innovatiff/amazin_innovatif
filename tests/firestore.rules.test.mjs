// Proves the Firestore security rules do what the comments in firestore.rules
// say. Run with `npm test` (starts a local Firestore emulator; needs Java).
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, test } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';

let env;
let visitor; // someone browsing the website, not signed in
let stranger; // signed in, but not on the managers list
let manager; // signed in and on the managers list

const message = (extra = {}) => ({
  name: 'Maria Lopez',
  phone: '555 555 0100',
  email: '',
  enquiry: 'Printing',
  product: 'Business cards',
  message: 'I need 500 business cards by Friday.',
  preferredContact: 'WhatsApp',
  page: '/printing',
  status: 'New',
  source: 'Website',
  createdAt: serverTimestamp(),
  ...extra,
});

const lead = (extra = {}) => ({
  fullName: 'Sam Carter',
  phone: '555 555 0101',
  email: 'sam@example.com',
  businessName: 'Carter Mobile Detailing',
  businessType: 'Mobile Detailer',
  businessTypeSpecific: '',
  city: 'Springfield',
  websiteStatus: 'No, I only use social media',
  plan: 'Pro',
  mainGoal: ['Get more bookings'],
  bookingProblem: ['Too many DMs', 'Slow replies'],
  reservationChoice: 'Not yet',
  paymentStatus: 'No payment selected',
  paymentRequired: false,
  status: 'New',
  source: 'Website Form',
  createdAt: serverTimestamp(),
  ...extra,
});

const quote = (extra = {}) => ({
  title: 'Website and print package',
  client: 'North Build',
  currency: 'CAD',
  services: [{ id: 's1', name: 'Five-page website', price: 1200, marketPrice: 2500 }],
  createdAt: '2026-11-26T12:00:00.000Z',
  updatedAt: '2026-11-26T12:00:00.000Z',
  ...extra,
});

const order = (extra = {}) => ({
  title: 'Brand launch kit',
  client: 'Aurora Coffee Co.',
  currency: 'CAD',
  items: [{ id: 'a', name: 'Logo design package', quantity: 1, price: 650, listPrice: 900 }],
  shipping: 15,
  taxRate: 13,
  collectShipping: true,
  shipCountries: ['CA', 'US'],
  markedPaidAt: '',
  createdAt: '2026-11-26T12:00:00.000Z',
  updatedAt: '2026-11-26T12:00:00.000Z',
  ...extra,
});

const address = (extra = {}) => ({
  name: 'Maria Lopez',
  phone: '',
  line1: '12 King Street West',
  line2: '',
  city: 'Toronto',
  region: 'ON',
  postalCode: 'M5H 1A1',
  country: 'CA',
  createdAt: serverTimestamp(),
  ...extra,
});

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-innovatif',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
  visitor = env.unauthenticatedContext().firestore();
  stranger = env.authenticatedContext('stranger', { email: 'someone@example.com' }).firestore();
  manager = env.authenticatedContext('boss', { email: 'owner@example.com' }).firestore();
});

beforeEach(async () => {
  await env.clearFirestore();
  // Seed what would normally be created in the console or by earlier visitors.
  await env.withSecurityRulesDisabled(async (admin) => {
    const db = admin.firestore();
    await setDoc(doc(db, 'managers/boss'), { email: 'owner@example.com' });
    await setDoc(doc(db, 'Contact/m1'), { ...message(), createdAt: Timestamp.now() });
    await setDoc(doc(db, 'Bookings/b1'), { ...lead(), createdAt: Timestamp.now() });
    // Designs: a pricing page, a checkout that ships, one that does not, and a picture.
    await setDoc(doc(db, 'pages/p1'), quote());
    await setDoc(doc(db, 'checkouts/c1'), order({ collectShipping: true }));
    await setDoc(doc(db, 'checkouts/c2'), order({ collectShipping: false }));
    await setDoc(doc(db, 'checkouts/c1/deliveries/d1'), { ...address(), createdAt: Timestamp.now() });
    await setDoc(doc(db, 'images/i1'), { dataUrl: 'data:image/png;base64,AAAA', createdAt: '2026-11-26T12:00:00.000Z' });
  });
});

after(async () => {
  await env?.cleanup();
});

describe('website visitors', () => {
  test('can send a message', async () => {
    await assertSucceeds(addDoc(collection(visitor, 'Contact'), message()));
  });

  test('can send a message with only an email address', async () => {
    const { phone, ...withoutPhone } = message({ email: 'maria@example.com' });
    await assertSucceeds(addDoc(collection(visitor, 'Contact'), withoutPhone));
  });

  test('can still send the old site’s contact form', async () => {
    await assertSucceeds(
      addDoc(collection(visitor, 'Contact'), {
        name: 'James Brown',
        email: 'james@example.com',
        enquiry: 'Plans',
        message: 'Which plan is best for me?',
        status: 'New',
        source: 'Contact Sales Form',
        createdAt: serverTimestamp(),
      }),
    );
  });

  test('cannot read, list, change or delete messages', async () => {
    await assertFails(getDoc(doc(visitor, 'Contact/m1')));
    await assertFails(getDocs(collection(visitor, 'Contact')));
    await assertFails(updateDoc(doc(visitor, 'Contact/m1'), { status: 'Done' }));
    await assertFails(deleteDoc(doc(visitor, 'Contact/m1')));
  });

  test('cannot send a message with no way to reply', async () => {
    await assertFails(addDoc(collection(visitor, 'Contact'), message({ phone: '', email: '' })));
  });

  test('cannot send an empty or oversized message', async () => {
    await assertFails(addDoc(collection(visitor, 'Contact'), message({ message: '' })));
    await assertFails(addDoc(collection(visitor, 'Contact'), message({ message: 'x'.repeat(5001) })));
    await assertFails(addDoc(collection(visitor, 'Contact'), message({ name: 'x'.repeat(101) })));
  });

  test('cannot add fields the form does not have', async () => {
    await assertFails(addDoc(collection(visitor, 'Contact'), message({ notes: 'injected' })));
    await assertFails(addDoc(collection(visitor, 'Contact'), message({ isAdmin: true })));
  });

  test('cannot pre-set a status or fake the date', async () => {
    await assertFails(addDoc(collection(visitor, 'Contact'), message({ status: 'Done' })));
    await assertFails(addDoc(collection(visitor, 'Contact'), message({ createdAt: Timestamp.fromDate(new Date('2020-01-01')) })));
  });

  test('cannot send the wrong kind of data', async () => {
    await assertFails(addDoc(collection(visitor, 'Contact'), message({ name: 12345 })));
    await assertFails(addDoc(collection(visitor, 'Contact'), message({ phone: ['a', 'b'] })));
  });

  test('can send a booking request', async () => {
    await assertSucceeds(addDoc(collection(visitor, 'Bookings'), lead()));
    await assertSucceeds(addDoc(collection(visitor, 'Bookings'), lead({ mainGoal: [], bookingProblem: Array(12).fill('A problem') })));
    await assertSucceeds(addDoc(collection(visitor, 'Bookings'), lead({ status: 'Pending Payment', paymentRequired: true, paymentStatus: 'Redirected to Stripe' })));
    await assertSucceeds(addDoc(collection(visitor, 'Bookings'), lead({ status: 'Paid - New Booking', paymentRequired: true, paymentStatus: 'Paid', pendingId: 'abc123' })));
  });

  test('cannot send a malformed booking request', async () => {
    await assertFails(addDoc(collection(visitor, 'Bookings'), lead({ status: 'Done' })));
    await assertFails(addDoc(collection(visitor, 'Bookings'), lead({ email: '' })));
    await assertFails(addDoc(collection(visitor, 'Bookings'), lead({ mainGoal: 'not a list' })));
    await assertFails(addDoc(collection(visitor, 'Bookings'), lead({ mainGoal: [1, 2, 3] })));
    await assertFails(addDoc(collection(visitor, 'Bookings'), lead({ mainGoal: ['ok', { nested: true }] })));
    await assertFails(addDoc(collection(visitor, 'Bookings'), lead({ bookingProblem: ['x'.repeat(121)] })));
    await assertFails(addDoc(collection(visitor, 'Bookings'), lead({ bookingProblem: Array(13).fill('x') })));
    await assertFails(addDoc(collection(visitor, 'Bookings'), lead({ paymentRequired: 'yes' })));
    await assertFails(addDoc(collection(visitor, 'Bookings'), lead({ extra: 'field' })));
  });

  test('cannot read booking requests', async () => {
    await assertFails(getDoc(doc(visitor, 'Bookings/b1')));
    await assertFails(getDocs(collection(visitor, 'Bookings')));
  });

  test('cannot touch the managers list or anything else', async () => {
    await assertFails(getDoc(doc(visitor, 'managers/boss')));
    await assertFails(setDoc(doc(visitor, 'managers/visitor'), { email: 'me@example.com' }));
    await assertFails(setDoc(doc(visitor, 'settings/site'), { phone: '123' }));
    await assertFails(getDocs(collection(visitor, 'anything')));
  });
});

describe('signed-in accounts that are not managers', () => {
  test('cannot read messages or leads', async () => {
    await assertFails(getDocs(collection(stranger, 'Contact')));
    await assertFails(getDoc(doc(stranger, 'Contact/m1')));
    await assertFails(getDocs(collection(stranger, 'Bookings')));
  });

  test('cannot add themselves to the managers list', async () => {
    await assertFails(setDoc(doc(stranger, 'managers/stranger'), { email: 'someone@example.com' }));
    await assertFails(getDoc(doc(stranger, 'managers/boss')));
    await assertFails(getDocs(collection(stranger, 'managers')));
  });

  test('can check their own (missing) manager entry', async () => {
    const snapshot = await assertSucceeds(getDoc(doc(stranger, 'managers/stranger')));
    if (snapshot.exists()) throw new Error('stranger should not be a manager');
  });
});

describe('managers', () => {
  test('can read and list messages and leads', async () => {
    await assertSucceeds(getDocs(collection(manager, 'Contact')));
    await assertSucceeds(getDoc(doc(manager, 'Contact/m1')));
    await assertSucceeds(getDocs(collection(manager, 'Bookings')));
  });

  test('can update status, notes and read marker', async () => {
    await assertSucceeds(updateDoc(doc(manager, 'Contact/m1'), { status: 'In progress', updatedAt: serverTimestamp(), handledBy: 'owner@example.com' }));
    await assertSucceeds(updateDoc(doc(manager, 'Contact/m1'), { notes: 'Called back, quoting Monday.' }));
    await assertSucceeds(updateDoc(doc(manager, 'Contact/m1'), { readAt: serverTimestamp() }));
    await assertSucceeds(updateDoc(doc(manager, 'Bookings/b1'), { status: 'Done' }));
  });

  test('cannot rewrite what the visitor sent', async () => {
    await assertFails(updateDoc(doc(manager, 'Contact/m1'), { message: 'edited' }));
    await assertFails(updateDoc(doc(manager, 'Contact/m1'), { phone: '000' }));
    await assertFails(updateDoc(doc(manager, 'Bookings/b1'), { plan: 'Elite' }));
  });

  test('can annotate older records with an unknown or missing status', async () => {
    await env.withSecurityRulesDisabled(async (admin) => {
      const db = admin.firestore();
      const { status, ...withoutStatus } = message();
      await setDoc(doc(db, 'Contact/old1'), { ...message(), status: 'Contacted', createdAt: Timestamp.now() });
      await setDoc(doc(db, 'Contact/old2'), { ...withoutStatus, createdAt: Timestamp.now() });
    });
    await assertSucceeds(updateDoc(doc(manager, 'Contact/old1'), { notes: 'From the old system.' }));
    await assertSucceeds(updateDoc(doc(manager, 'Contact/old2'), { readAt: serverTimestamp() }));
    await assertSucceeds(updateDoc(doc(manager, 'Contact/old2'), { status: 'Done' }));
    await assertFails(updateDoc(doc(manager, 'Contact/old1'), { status: 'Pending Payment' }));
  });

  test('cannot set a status that does not exist', async () => {
    await assertFails(updateDoc(doc(manager, 'Contact/m1'), { status: 'Whatever' }));
    await assertFails(updateDoc(doc(manager, 'Contact/m1'), { notes: 'x'.repeat(4001) }));
  });

  test('can delete messages and leads', async () => {
    await assertSucceeds(deleteDoc(doc(manager, 'Contact/m1')));
    await assertSucceeds(deleteDoc(doc(manager, 'Bookings/b1')));
  });

  test('cannot add or remove managers from the website', async () => {
    await assertFails(setDoc(doc(manager, 'managers/friend'), { email: 'friend@example.com' }));
    await assertFails(deleteDoc(doc(manager, 'managers/boss')));
  });
});

describe('designs: pricing pages and checkouts', () => {
  test('anyone with the link can open one page or checkout, and its pictures', async () => {
    await assertSucceeds(getDoc(doc(visitor, 'pages/p1')));
    await assertSucceeds(getDoc(doc(visitor, 'checkouts/c1')));
    await assertSucceeds(getDoc(doc(visitor, 'images/i1')));
  });

  test('nobody but a manager can see the lists', async () => {
    for (const who of [visitor, stranger]) {
      for (const name of ['pages', 'checkouts', 'images']) await assertFails(getDocs(collection(who, name)));
    }
    for (const name of ['pages', 'checkouts', 'images']) await assertSucceeds(getDocs(collection(manager, name)));
  });

  test('visitors and other accounts cannot create, change or delete anything', async () => {
    for (const who of [visitor, stranger]) {
      await assertFails(addDoc(collection(who, 'pages'), quote()));
      await assertFails(addDoc(collection(who, 'checkouts'), order()));
      await assertFails(addDoc(collection(who, 'images'), { dataUrl: 'data:image/png;base64,AAAA' }));
      // The one that matters most: a buyer lowering their own price, or marking it paid.
      await assertFails(updateDoc(doc(who, 'checkouts/c1'), { items: [{ id: 'a', name: 'Logo design package', quantity: 1, price: 1, listPrice: 0 }] }));
      await assertFails(updateDoc(doc(who, 'checkouts/c1'), { markedPaidAt: '2026-11-26T18:30:00.000Z' }));
      await assertFails(updateDoc(doc(who, 'pages/p1'), { title: 'Changed' }));
      await assertFails(deleteDoc(doc(who, 'checkouts/c1')));
      await assertFails(deleteDoc(doc(who, 'pages/p1')));
      await assertFails(deleteDoc(doc(who, 'images/i1')));
    }
  });

  test('managers can create, edit, mark as paid and delete', async () => {
    await assertSucceeds(addDoc(collection(manager, 'pages'), quote()));
    await assertSucceeds(addDoc(collection(manager, 'checkouts'), order()));
    await assertSucceeds(setDoc(doc(manager, 'checkouts/c1'), order({ title: 'Edited' })));
    await assertSucceeds(updateDoc(doc(manager, 'checkouts/c1'), { markedPaidAt: '2026-11-26T18:30:00.000Z' }));
    await assertSucceeds(deleteDoc(doc(manager, 'pages/p1')));
    await assertSucceeds(deleteDoc(doc(manager, 'checkouts/c2')));
  });

  test('managers cannot save something that is not a page or a checkout', async () => {
    await assertFails(addDoc(collection(manager, 'pages'), { title: 'No services' }));
    await assertFails(addDoc(collection(manager, 'checkouts'), { title: 42, items: [] }));
    await assertFails(setDoc(doc(manager, 'checkouts/c1'), { title: 'Items is not a list', items: 'nope' }));
  });

  test('pictures have a size limit and cannot be swapped afterwards', async () => {
    await assertSucceeds(addDoc(collection(manager, 'images'), { dataUrl: 'data:image/png;base64,' + 'A'.repeat(1000) }));
    await assertFails(addDoc(collection(manager, 'images'), { dataUrl: 'A'.repeat(950001) }));
    await assertFails(updateDoc(doc(manager, 'images/i1'), { dataUrl: 'data:image/png;base64,BBBB' }));
    await assertSucceeds(deleteDoc(doc(manager, 'images/i1')));
  });
});

describe('designs: delivery addresses', () => {
  test('a client can add their address to a checkout that asks for one', async () => {
    await assertSucceeds(addDoc(collection(visitor, 'checkouts/c1/deliveries'), address()));
    await assertSucceeds(addDoc(collection(visitor, 'checkouts/c1/deliveries'), address({ phone: '416 555 0100', line2: 'Suite 4' })));
  });

  test('but not to a checkout that does not ask for one, or does not exist', async () => {
    await assertFails(addDoc(collection(visitor, 'checkouts/c2/deliveries'), address()));
    await assertFails(addDoc(collection(visitor, 'checkouts/nothing-here/deliveries'), address()));
  });

  test('an address must be complete, plain text and the right size', async () => {
    const add = (extra) => addDoc(collection(visitor, 'checkouts/c1/deliveries'), address(extra));
    await assertFails(add({ name: '' }));
    await assertFails(add({ line1: '' }));
    await assertFails(add({ city: '' }));
    await assertFails(add({ postalCode: '' }));
    await assertFails(add({ country: 'Canada' }));
    await assertFails(add({ name: 'x'.repeat(121) }));
    await assertFails(add({ line1: ['12 King Street'] }));
    await assertFails(add({ note: 'an extra field' }));
    await assertFails(add({ createdAt: Timestamp.fromDate(new Date('2020-01-01')) }));
  });

  test('only managers can read addresses; nobody can change one', async () => {
    for (const who of [visitor, stranger]) {
      await assertFails(getDoc(doc(who, 'checkouts/c1/deliveries/d1')));
      await assertFails(getDocs(collection(who, 'checkouts/c1/deliveries')));
      await assertFails(deleteDoc(doc(who, 'checkouts/c1/deliveries/d1')));
    }
    await assertSucceeds(getDocs(collection(manager, 'checkouts/c1/deliveries')));
    await assertFails(updateDoc(doc(manager, 'checkouts/c1/deliveries/d1'), { city: 'Ottawa' }));
    await assertFails(updateDoc(doc(visitor, 'checkouts/c1/deliveries/d1'), { city: 'Ottawa' }));
    await assertSucceeds(deleteDoc(doc(manager, 'checkouts/c1/deliveries/d1')));
  });
});

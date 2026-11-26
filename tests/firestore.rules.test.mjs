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

// The five-step "get started" form for the booking system. Answers are saved
// to the "Bookings" collection in Firestore with the same field names the
// business has always used, so old and new leads sit side by side in the portal.
import { SITE } from './config.js';
import { save } from './firebase.js';

const form = document.querySelector('[data-booking-form]');
const $ = (selector) => form.querySelector(selector);
const $$ = (selector) => [...form.querySelectorAll(selector)];

const steps = $$('[data-step]');
const bars = $$('.wizard__progress span');
const back = $('[data-back]');
const nextLabel = $('[data-next-label]');
const next = $('[data-next]');
const status = $('[data-form-status]');
const PENDING_KEY = 'innovatifPendingBooking';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const openedAt = Date.now();
let current = 0;

const text = (name, max = 200) => String(form.elements[name]?.value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
const checked = (name) => $$(`input[name="${name}"]:checked`).map((input) => input.value);

function fail(message, focusTarget) {
  status.textContent = message;
  status.hidden = false;
  focusTarget?.focus();
  return false;
}

function validateStep(index) {
  status.hidden = true;
  if (index === 0) {
    if (text('fullName').length < 2) return fail('Please tell us your name.', form.elements.fullName);
    if (text('phone').replace(/\D/g, '').length < 7) return fail('Please enter a phone number we can reach you on.', form.elements.phone);
    if (!EMAIL.test(text('email'))) return fail('Please enter a valid email address.', form.elements.email);
  }
  if (index === 1) {
    if (!text('businessName')) return fail('What is your business called?', form.elements.businessName);
    if (!text('businessType')) return fail('Please choose your type of business.', form.elements.businessType);
    if (text('businessType') === 'Other' && !text('businessTypeSpecific')) return fail('Tell us what kind of business you run.', form.elements.businessTypeSpecific);
    if (!text('city')) return fail('Which town or city do you serve?', form.elements.city);
    if (!checked('websiteStatus').length) return fail('Let us know whether you already have a website.', $('input[name="websiteStatus"]'));
  }
  if (index === 2 && !checked('plan').length) return fail('Pick a plan, or choose “Not sure”.', $('input[name="plan"]'));
  if (index === 4 && !checked('reservationChoice').length) return fail('Choose how you’d like to continue.', $('input[name="reservationChoice"]'));
  return true;
}

function show(index, { focus = true } = {}) {
  current = index;
  steps.forEach((step, i) => (step.hidden = i !== index));
  bars.forEach((bar, i) => bar.classList.toggle('is-done', i <= index));
  back.hidden = index === 0;
  const last = index === steps.length - 1;
  nextLabel.textContent = !last ? 'Next' : checked('reservationChoice')[0] === 'Reserve my spot' ? `Reserve for ${SITE.depositAmount || 'deposit'}` : 'Send my request';
  $('[data-step-label]').textContent = `Step ${index + 1} of ${steps.length}`;
  status.hidden = true;
  if (focus) steps[index].querySelector('input, select')?.focus({ preventScroll: true });
  if (focus) form.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function collect() {
  const type = text('businessType', 80);
  const specific = type === 'Other' ? text('businessTypeSpecific', 80) : '';
  return {
    fullName: text('fullName', 100),
    phone: text('phone', 40),
    email: text('email', 200).toLowerCase(),
    businessName: text('businessName', 120),
    businessType: specific || type,
    businessTypeSpecific: specific,
    city: text('city', 80),
    websiteStatus: checked('websiteStatus')[0] || '',
    plan: checked('plan')[0] || '',
    mainGoal: checked('mainGoal'),
    bookingProblem: checked('bookingProblem'),
    reservationChoice: checked('reservationChoice')[0] || '',
  };
}

function done() {
  steps.forEach((step) => (step.hidden = true));
  $('[data-wizard-nav]').hidden = true;
  $('.wizard__progress').hidden = true;
  const panel = $('[data-form-done]');
  panel.hidden = false;
  panel.focus();
}

async function submit() {
  const data = collect();
  // Hidden field filled in, or sent impossibly fast: a bot. Pretend it worked.
  if (form.elements.website.value || Date.now() - openedAt < 3000) return done();

  next.disabled = true;
  nextLabel.textContent = 'Sending…';
  try {
    if (data.reservationChoice === 'Reserve my spot') {
      // Save the lead first, so it is never lost if the payment is abandoned.
      const saved = await save('Bookings', {
        ...data,
        paymentRequired: true,
        paymentStatus: 'Redirected to Stripe',
        status: 'Pending Payment',
        source: 'Website Form',
      });
      localStorage.setItem(PENDING_KEY, JSON.stringify({ ...data, pendingId: saved.id }));
      location.href = SITE.depositLink;
      return;
    }
    await save('Bookings', {
      ...data,
      paymentRequired: false,
      paymentStatus: 'No payment selected',
      status: 'New',
      source: 'Website Form',
    });
    done();
  } catch (error) {
    console.error(error);
    fail('Something went wrong and your request was not sent. Please try again.');
    show(current, { focus: false });
    status.hidden = false;
  } finally {
    next.disabled = false;
  }
}

// Coming back from the payment page (…?payment=success): record the deposit.
async function handlePaymentReturn() {
  const params = new URLSearchParams(location.search);
  if (params.get('payment') !== 'success') return false;
  history.replaceState({}, document.title, location.pathname);
  done();
  let pending = null;
  try {
    pending = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null');
  } catch {
    pending = null;
  }
  if (!pending) return true;
  try {
    await save('Bookings', {
      ...pending,
      paymentRequired: true,
      paymentStatus: 'Paid',
      status: 'Paid - New Booking',
      source: 'Website Form',
    });
    localStorage.removeItem(PENDING_KEY);
  } catch (error) {
    console.error(error);
  }
  return true;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validateStep(current)) return;
  if (current < steps.length - 1) show(current + 1);
  else submit();
});

back.addEventListener('click', () => show(Math.max(0, current - 1)));

form.elements.businessType.addEventListener('change', () => {
  const other = form.elements.businessType.value === 'Other';
  $('[data-other-type]').hidden = !other;
  if (!other) form.elements.businessTypeSpecific.value = '';
});

form.addEventListener('change', (event) => {
  if (event.target.name === 'reservationChoice') show(current, { focus: false });
});

if (!(await handlePaymentReturn())) {
  const plan = new URLSearchParams(location.search).get('plan');
  const match = plan && $$('input[name="plan"]').find((input) => input.value.toLowerCase() === plan.toLowerCase());
  if (match) match.checked = true;
  show(0, { focus: false });
}

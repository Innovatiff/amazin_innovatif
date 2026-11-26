// The message form: checks the answers, saves them to Firestore ("Contact"
// collection) and shows a confirmation. The manager portal reads the same
// collection, so every message sent here appears in the inbox.
import { save } from './firebase.js';

const $ = (selector, root = document) => root.querySelector(selector);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (value, max) => String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);

function setError(form, name, message) {
  const input = form.elements[name];
  const field = input?.closest?.('.field');
  if (!field) return;
  let note = $('.field__error', field);
  if (!message) {
    field.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    note?.remove();
    return;
  }
  field.classList.add('is-invalid');
  input.setAttribute('aria-invalid', 'true');
  if (!note) {
    note = document.createElement('span');
    note.className = 'field__error';
    note.id = `${input.id}-error`;
    field.append(note);
    input.setAttribute('aria-describedby', note.id);
  }
  note.textContent = message;
}

function validate(form) {
  const values = {
    name: clean(form.elements.name.value, 100),
    phone: clean(form.elements.phone.value, 40),
    email: clean(form.elements.email.value, 200).toLowerCase(),
    enquiry: clean(form.elements.enquiry.value, 40),
    product: clean(form.elements.product.value, 120),
    message: String(form.elements.message.value ?? '').trim().slice(0, 4000),
    preferredContact: clean(form.elements.preferredContact.value, 20),
  };

  const errors = {};
  if (values.name.length < 2) errors.name = 'Please tell us your name.';
  if (values.email && !EMAIL.test(values.email)) errors.email = 'That email doesn’t look right.';
  if (values.phone && values.phone.replace(/\D/g, '').length < 7) errors.phone = 'That number looks too short.';
  if (!values.enquiry) errors.enquiry = 'Please choose a service.';
  if (values.message.length < 3) errors.message = 'Tell us a little about what you need.';

  const hint = $('[data-contact-hint]', form);
  const noContact = !values.phone && !values.email;
  hint?.classList.toggle('is-invalid', noContact);
  if (noContact) errors.phone = 'Add a phone number or an email so we can reply.';

  for (const name of ['name', 'phone', 'email', 'enquiry', 'message']) setError(form, name, errors[name]);
  return { values, firstError: Object.keys(errors)[0] };
}

// A light brake on accidental double-sends and scripted floods from one browser.
function tooMany() {
  try {
    const hourAgo = Date.now() - 60 * 60 * 1000;
    const sent = JSON.parse(localStorage.getItem('innovatif:sent') || '[]').filter((time) => time > hourAgo);
    if (sent.length >= 5) return true;
    localStorage.setItem('innovatif:sent', JSON.stringify([...sent, Date.now()]));
  } catch {
    // Private browsing without storage: nothing to count, let it through.
  }
  return false;
}

function showDone(form, name) {
  const fields = $('.lead-form__fields', form);
  const done = $('[data-form-done]', form);
  $('[data-done-name]', done).textContent = name ? `, ${name.split(' ')[0]}` : '';
  fields.hidden = true;
  done.hidden = false;
  done.focus({ preventScroll: true });

  $('[data-form-reset]', done).addEventListener(
    'click',
    () => {
      form.reset();
      form.dataset.openedAt = String(Date.now());
      done.hidden = true;
      fields.hidden = false;
      form.elements.name.focus();
    },
    { once: true },
  );
}

export async function submitLead(form) {
  const status = $('[data-form-status]', form);
  const label = $('[data-submit-label]', form);
  status.hidden = true;

  const { values, firstError } = validate(form);
  if (firstError) {
    form.elements[firstError].focus();
    return;
  }

  // Bots fill the hidden field or submit the instant the form appears.
  const filledTrap = Boolean(form.elements.website?.value);
  const tooFast = Date.now() - Number(form.dataset.openedAt || 0) < 1500;
  if (filledTrap || tooFast) {
    showDone(form, values.name);
    return;
  }

  if (tooMany()) {
    status.textContent = 'You’ve sent a few messages already — we’ll reply soon. For anything urgent, please call us.';
    status.hidden = false;
    return;
  }

  const original = label.textContent;
  label.textContent = 'Sending…';
  try {
    await save('Contact', {
      ...values,
      page: location.pathname.slice(0, 120),
      status: 'New',
      source: 'Website',
    });
    showDone(form, values.name);
  } finally {
    label.textContent = original;
  }
}

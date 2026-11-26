// Behaviour shared by every public page: menu, message pop-up, scroll effects.
// Firebase is only downloaded when a visitor actually sends a message.

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/* ── Header ─────────────────────────────────────────────────────────────── */

const header = $('[data-header]');
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

const navToggle = $('[data-nav-toggle]');
const nav = $('#site-nav');
if (navToggle && nav) {
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('has-dialog', open);
  };
  navToggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a, [data-quote]')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      navToggle.focus();
    }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', (query) => query.matches && setOpen(false));
}

/* ── Message pop-up ─────────────────────────────────────────────────────── */

const dialog = $('#quote-dialog');

function openQuote({ service = '', product = '' } = {}) {
  if (!dialog) return;
  const form = $('[data-lead-form]', dialog);
  const done = $('[data-form-done]', form);
  if (!done.hidden) {
    // A message was already sent from this pop-up: start a fresh one.
    form.reset();
    done.hidden = true;
    $('.lead-form__fields', form).hidden = false;
  }
  if (service && form.elements.enquiry) form.elements.enquiry.value = service;
  if (product && form.elements.product) form.elements.product.value = product;
  form.dataset.openedAt = String(Date.now());

  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  document.documentElement.classList.add('has-dialog');
  // Warm up the form code while the visitor starts typing.
  import('./forms.js').catch(() => {});
  (form.elements.name.value ? form.elements.message : form.elements.name).focus({ preventScroll: true });
}

if (dialog) {
  dialog.addEventListener('close', () => document.documentElement.classList.remove('has-dialog'));
  dialog.addEventListener('click', (event) => {
    // A click on the dimmed area around the panel closes it.
    if (event.target === dialog || event.target.closest('[data-dialog-close]')) dialog.close();
  });
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-quote]');
  if (!trigger) return;
  event.preventDefault();
  openQuote({ service: trigger.dataset.service, product: trigger.dataset.product });
});

// /contact?service=Printing&product=Flyers or any page with #quote opens the form.
const params = new URLSearchParams(location.search);
if (location.hash === '#quote' && dialog) {
  openQuote({ service: params.get('service') || '', product: params.get('product') || '' });
}

/* ── Message forms ──────────────────────────────────────────────────────── */

for (const form of $$('[data-lead-form]')) {
  form.dataset.openedAt ??= String(Date.now());
  if (params.get('service') && form.elements.enquiry) form.elements.enquiry.value = params.get('service');
  if (params.get('product') && form.elements.product) form.elements.product.value = params.get('product');

  form.addEventListener('focusin', () => import('./forms.js').catch(() => {}), { once: true });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = $('[data-submit]', form);
    submit.disabled = true;
    try {
      const { submitLead } = await import('./forms.js');
      await submitLead(form);
    } catch (error) {
      console.error(error);
      const status = $('[data-form-status]', form);
      status.textContent = 'We couldn’t send your message. Please check your connection and try again.';
      status.hidden = false;
    } finally {
      submit.disabled = false;
    }
  });
}

/* ── Scroll reveal ──────────────────────────────────────────────────────── */
// Only things that start below the fold are animated, so nothing visible on
// load ever flickers and the page reads fine if this script never runs.

const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (motionOk && 'IntersectionObserver' in window) {
  const targets = $$('.section-head, .door, .tile, .product, .shot, .card, .step, .plan, .mini-plan, .feature, .split, .bento__tile, .cta__inner, .gallery figure, .faq, .trio figure, .callout, .also, .category__head, .page-hero__media, .method, .panel');
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  for (const element of targets) {
    if (element.getBoundingClientRect().top < window.innerHeight * 0.95) continue;
    element.classList.add('reveal');
    observer.observe(element);
  }
}

/* ── Category chips on the printing page ────────────────────────────────── */

const catLinks = $$('.cat-nav__link');
if (catLinks.length && 'IntersectionObserver' in window) {
  const byId = new Map(catLinks.map((link) => [link.hash.slice(1), link]));
  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of catLinks) link.classList.remove('is-active');
        const active = byId.get(entry.target.id);
        if (active) {
          active.classList.add('is-active');
          active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: motionOk ? 'smooth' : 'auto' });
        }
      }
    },
    { rootMargin: '-30% 0px -65% 0px' },
  );
  for (const id of byId.keys()) {
    const section = document.getElementById(id);
    if (section) spy.observe(section);
  }
}

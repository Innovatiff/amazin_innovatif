'use strict';

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

import { getAnalytics, isSupported } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js';

const firebaseConfig = {
  apiKey: 'AIzaSyA8otaxHEu8AaYRrTvT9fmXqLPxv1-PJfA',
  authDomain: 'innovatif-f5cd1.firebaseapp.com',
  projectId: 'innovatif-f5cd1',
  storageBucket: 'innovatif-f5cd1.firebasestorage.app',
  messagingSenderId: '60075428113',
  appId: '1:60075428113:web:7a97f8fb8cb9ac2fd324b0',
  measurementId: 'G-J2KM6WJ3ZW',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/aFa9AVdvEeWifgigOZasg0i';

// ===============================
// FORM ELEMENTS
// ===============================

const slides = [...document.querySelectorAll('.form__layouts--box')];
const nextBtn = document.querySelector('.form__forward');
const backBtn = document.querySelector('.form__back');
const guideBoxes = [...document.querySelectorAll('.form__guide--box')];
const guideLines = [...document.querySelectorAll('.form__guide--line')];

let currentSlide = 0;
let isSubmitting = false;

const formData = {
  fullName: '',
  phone: '',
  email: '',
  businessName: '',
  businessType: '',
  businessTypeSpecific: '',
  city: '',
  websiteStatus: '',
  plan: '',
  mainGoal: [],
  bookingProblem: [],
  reservationChoice: '',
  paymentStatus: '',
  paymentRequired: false,
};

// ===============================
// STEP GROUPS
// ===============================
// step 1 = 4 personal/business intro questions
// step 2 = 3 business questions
// step 3 = plan
// step 4 = goals/problems
// step 5 = reserve spot

const slideSteps = [
  { step: 0, field: 'fullName' },
  { step: 0, field: 'phone' },
  { step: 0, field: 'email' },
  { step: 0, field: 'businessName' },

  { step: 1, field: 'businessType' },
  { step: 1, field: 'city' },
  { step: 1, field: 'websiteStatus' },

  { step: 2, field: 'plan' },

  { step: 3, field: 'mainGoal' },
  { step: 3, field: 'bookingProblem' },

  { step: 4, field: 'reservationChoice' },

  { step: 4, field: 'loading', isSystem: true },
  { step: 4, field: 'success', isSystem: true },
];

const totalRealSlides = slideSteps.filter((slide) => !slide.isSystem).length;

// ===============================
// INITIAL CLEANUP
// ===============================

function setupGuideLines() {
  guideLines.forEach((line) => {
    line.innerHTML = '<span class="form__guide--line-fill"></span>';
  });
}

function removeDefaultActiveStates() {
  document
    .querySelectorAll(
      `
      .form__layouts--box-plans-box-active,
      .form__layouts--box-plans-box-top-opt-active,
      .form__layouts--box-choose-box-active,
      .form__layouts--box-options-box-active,
      .form__layouts--box-options-box-top-opt-active
      `,
    )
    .forEach((el) => {
      el.classList.remove(
        'form__layouts--box-plans-box-active',
        'form__layouts--box-plans-box-top-opt-active',
        'form__layouts--box-choose-box-active',
        'form__layouts--box-options-box-active',
        'form__layouts--box-options-box-top-opt-active',
      );
    });
}

// ===============================
// VALIDATION
// ===============================

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone) {
  return phone.trim().replace(/\D/g, '').length >= 10;
}

function getCurrentInputValue() {
  const slide = slides[currentSlide];
  const input = slide.querySelector('input:not([type="hidden"])');
  const select = slide.querySelector('select');

  if (select && input) {
    return {
      selectValue: select.value.trim(),
      inputValue: input.value.trim(),
    };
  }

  if (input) return input.value.trim();
  if (select) return select.value.trim();

  return '';
}

function isCurrentSlideAnswered() {
  const current = slideSteps[currentSlide];

  if (!current || current.isSystem) return true;

  const value = formData[current.field];

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (current.field === 'email') return isValidEmail(value);
  if (current.field === 'phone') return isValidPhone(value);

  return value && value.trim().length > 0;
}

function updateNextButtonState() {
  const answered = isCurrentSlideAnswered();

  nextBtn.disabled = !answered || isSubmitting;
  nextBtn.classList.toggle('form__forward--disabled', !answered || isSubmitting);
}

// ===============================
// DATA CAPTURE
// ===============================

function getSelectedOptionText(select) {
  return select.options[select.selectedIndex].textContent.trim();
}

async function handleStripeReturn() {
  const params = new URLSearchParams(window.location.search);
  const paymentSuccess = params.get('payment') === 'success';

  if (!paymentSuccess) return;

  const savedBooking = localStorage.getItem('innovatifPendingBooking');

  if (!savedBooking) {
    showSlide(totalRealSlides + 1);
    return;
  }

  const booking = JSON.parse(savedBooking);

  Object.assign(formData, booking);

  await submitForm({
    paymentStatus: 'Paid',
    paymentRequired: true,
    status: 'Paid - New Booking',
  });

  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);
}

function handleBusinessTypeSpecificInput() {
  const businessSlide = slides.find((slide) => slideSteps[slides.indexOf(slide)]?.field === 'businessType');

  if (!businessSlide) return;

  const select = businessSlide.querySelector('select');
  const specificInput = businessSlide.querySelector('.form__layouts--box-input-specific');

  if (!select || !specificInput) return;

  function toggleSpecificInput() {
    const selectedText = getSelectedOptionText(select);
    const shouldShow = selectedText === 'Other';

    specificInput.classList.toggle('form__layouts--box-input-specific--active', shouldShow);

    if (!shouldShow) {
      specificInput.value = '';
    }

    saveCurrentSlideValue();
    updateNextButtonState();
    updateGuide();
  }

  select.addEventListener('change', toggleSpecificInput);

  toggleSpecificInput();
}

function saveCurrentSlideValue() {
  const current = slideSteps[currentSlide];
  if (!current || current.isSystem) return;

  const slide = slides[currentSlide];
  const field = current.field;

  if (field === 'businessType') {
    const select = slide.querySelector('select');
    const input = slide.querySelector('.form__layouts--box-input-specific');

    const selectedText = select ? getSelectedOptionText(select) : '';
    const specificText = input ? input.value.trim() : '';

    formData.businessType = selectedText;
    formData.businessTypeSpecific = selectedText === 'Other' ? specificText : '';

    if (selectedText === 'Other' && specificText) {
      formData.businessType = specificText;
    }

    return;
  }

  const input = slide.querySelector('input');
  const select = slide.querySelector('select');

  if (input) {
    formData[field] = input.value.trim();
    return;
  }

  if (select) {
    formData[field] = getSelectedOptionText(select);
    return;
  }
}

function handleTextInputs() {
  slides.forEach((slide, index) => {
    const inputs = [...slide.querySelectorAll('input')];
    const selects = [...slide.querySelectorAll('select')];

    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        if (index !== currentSlide) return;

        saveCurrentSlideValue();
        updateNextButtonState();
        updateGuide();
      });
    });

    selects.forEach((select) => {
      select.addEventListener('change', () => {
        if (index !== currentSlide) return;

        saveCurrentSlideValue();
        updateNextButtonState();
        updateGuide();
      });

      const field = slideSteps[index]?.field;

      if (field && !formData[field]) {
        formData[field] = getSelectedOptionText(select);
      }
    });
  });
}

// ===============================
// CARD SELECTIONS
// ===============================

function setupSingleChoiceCards({ boxSelector, activeClass, dotSelector, dotActiveClass, field }) {
  const cards = [...document.querySelectorAll(boxSelector)];

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const parentSlide = card.closest('.form__layouts--box');
      const parentIndex = slides.indexOf(parentSlide);

      parentSlide.querySelectorAll(boxSelector).forEach((item) => {
        item.classList.remove(activeClass);

        const dot = item.querySelector(dotSelector);
        if (dot) dot.classList.remove(dotActiveClass);
      });

      card.classList.add(activeClass);

      const dot = card.querySelector(dotSelector);
      if (dot) dot.classList.add(dotActiveClass);

      const titleElement = card.querySelector('[class*="-title"]');

      const selectedText = titleElement ? titleElement.textContent.trim() : card.textContent.trim();

      formData[field] = selectedText.replace(/\s+/g, ' ');

      if (parentIndex === currentSlide) {
        updateNextButtonState();
        updateGuide();
      }
    });
  });
}

function setupMultiChoiceCards() {
  const chooseSlides = slides.filter((slide) => slide.querySelector('.form__layouts--box-choose'));

  chooseSlides.forEach((slide) => {
    const boxes = [...slide.querySelectorAll('.form__layouts--box-choose-box')];
    const slideIndex = slides.indexOf(slide);
    const field = slideSteps[slideIndex]?.field;

    boxes.forEach((box) => {
      box.addEventListener('click', () => {
        const selectedText = box.textContent.trim().replace(/\s+/g, ' ');

        box.classList.toggle('form__layouts--box-choose-box-active');

        if (!Array.isArray(formData[field])) {
          formData[field] = [];
        }

        if (box.classList.contains('form__layouts--box-choose-box-active')) {
          if (!formData[field].includes(selectedText)) {
            formData[field].push(selectedText);
          }
        } else {
          formData[field] = formData[field].filter((item) => item !== selectedText);
        }

        if (slideIndex === currentSlide) {
          updateNextButtonState();
          updateGuide();
        }
      });
    });
  });
}

// ===============================
// GUIDE PROGRESS
// ===============================

function getStepProgress(stepIndex) {
  const realSlidesInStep = slideSteps
    .map((slide, index) => ({ ...slide, index }))
    .filter((slide) => slide.step === stepIndex && !slide.isSystem);

  if (!realSlidesInStep.length) return 0;

  const completed = realSlidesInStep.filter((slide) => {
    if (slide.index < currentSlide) return true;
    if (slide.index === currentSlide && isCurrentSlideAnswered()) return true;
    return false;
  }).length;

  return Math.min((completed / realSlidesInStep.length) * 100, 100);
}

function updateGuide() {
  const currentStep = slideSteps[currentSlide]?.step || 0;

  guideBoxes.forEach((box, index) => {
    box.classList.toggle('form__guide--box-active', index <= currentStep);
  });

  guideLines.forEach((line, index) => {
    const fill = line.querySelector('.form__guide--line-fill');

    if (!fill) return;

    let progress = 0;

    if (index < currentStep) {
      progress = 100;
    }

    if (index === currentStep) {
      progress = getStepProgress(currentStep);
    }

    fill.style.transform = `scaleX(${progress / 100})`;
  });
}

// ===============================
// SLIDE CONTROL
// ===============================

function showSlide(index) {
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('form__layouts--box-active', slideIndex === index);
  });

  currentSlide = index;

  backBtn.disabled = currentSlide === 0 || isSubmitting;
  backBtn.classList.toggle('form__back--disabled', currentSlide === 0 || isSubmitting);

  const current = slideSteps[currentSlide];

  if (current?.isSystem) {
    document.querySelector('.form__btns').style.display = 'none';
  } else {
    document.querySelector('.form__btns').style.display = 'flex';
  }

  updateGuide();
  updateNextButtonState();

  const input = slides[currentSlide].querySelector('input');
  if (input) setTimeout(() => input.focus(), 250);
}

function goNext() {
  if (!isCurrentSlideAnswered() || isSubmitting) return;

  saveCurrentSlideValue();

  const currentField = slideSteps[currentSlide]?.field;

  if (currentField === 'reservationChoice') {
    handleReservationNext();
    return;
  }

  showSlide(currentSlide + 1);
}

async function handleReservationNext() {
  const choseReserve = formData.reservationChoice === 'Reserve my spot';

  if (choseReserve) {
    formData.paymentRequired = true;
    formData.paymentStatus = 'Redirected to Stripe';

    const pendingBooking = {
      ...formData,
      status: 'Pending Payment',
      source: 'Website Form',
    };

    localStorage.setItem('innovatifPendingBooking', JSON.stringify(pendingBooking));

    window.location.href = STRIPE_PAYMENT_LINK;
    return;
  }

  formData.paymentRequired = false;
  formData.paymentStatus = 'No payment selected';

  await submitForm();
}

function goBack() {
  if (currentSlide === 0 || isSubmitting) return;
  showSlide(currentSlide - 1);
}

// ===============================
// FIREBASE SUBMIT
// ===============================

async function submitForm(extraData = {}) {
  isSubmitting = true;

  showSlide(totalRealSlides);

  try {
    await addDoc(collection(db, 'Bookings'), {
      ...formData,
      ...extraData,
      status: extraData.status || 'New',
      source: 'Website Form',
      createdAt: serverTimestamp(),
    });

    localStorage.removeItem('innovatifPendingBooking');

    setTimeout(() => {
      showSlide(totalRealSlides + 1);
    }, 1200);
  } catch (error) {
    console.error('Form submission failed:', error);

    isSubmitting = false;

    alert('Something went wrong. Please try again.');

    showSlide(totalRealSlides - 1);
  }
}

// ===============================
// EVENTS
// ===============================

nextBtn.addEventListener('click', goNext);
backBtn.addEventListener('click', goBack);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const activeTag = document.activeElement.tagName.toLowerCase();

    if (activeTag === 'textarea') return;

    event.preventDefault();
    goNext();
  }
});

// ===============================
// INIT
// ===============================

setupGuideLines();
removeDefaultActiveStates();

setupSingleChoiceCards({
  boxSelector: '.form__layouts--box-plans-box',
  activeClass: 'form__layouts--box-plans-box-active',
  dotSelector: '.form__layouts--box-plans-box-top-opt',
  dotActiveClass: 'form__layouts--box-plans-box-top-opt-active',
  field: 'plan',
});

setupSingleChoiceCards({
  boxSelector: '.form__layouts--box-options-box',
  activeClass: 'form__layouts--box-options-box-active',
  dotSelector: '.form__layouts--box-options-box-top-opt',
  dotActiveClass: 'form__layouts--box-options-box-top-opt-active',
  field: 'reservationChoice',
});

setupMultiChoiceCards();
handleTextInputs();
handleBusinessTypeSpecificInput();

showSlide(0);
handleStripeReturn();

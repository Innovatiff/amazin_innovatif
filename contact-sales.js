'use strict';

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

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

const contactForm = document.querySelector('.contact-sales__right--fill');
const submitBtn = document.querySelector('.contact-sales__right--fill-btn');
const submitBtnText = submitBtn?.querySelector('span');
const formMessage = document.querySelector('.contact-sales__right--fill-text');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function setLoading(isLoading) {
  if (!submitBtn) return;

  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle('contact-sales__right--fill-btn--loading', isLoading);

  if (submitBtnText) {
    submitBtnText.textContent = isLoading ? 'Sending...' : 'Send message';
  }
}

function showMessage(message, type = 'normal') {
  if (!formMessage) return;

  formMessage.textContent = message;
  formMessage.classList.remove(
    'contact-sales__right--fill-text--success',
    'contact-sales__right--fill-text--error',
  );

  if (type === 'success') {
    formMessage.classList.add('contact-sales__right--fill-text--success');
  }

  if (type === 'error') {
    formMessage.classList.add('contact-sales__right--fill-text--error');
  }
}

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);

  const name = formData.get('name')?.trim() || '';
  const email = formData.get('email')?.trim() || '';
  const enquiry = formData.get('enquiry')?.trim() || '';
  const message = formData.get('message')?.trim() || '';

  if (!name || !email || !enquiry || !message) {
    showMessage('Please fill in all fields before sending.', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showMessage('Please enter a valid email address.', 'error');
    return;
  }

  setLoading(true);
  showMessage('Sending your message...', 'normal');

  try {
    await addDoc(collection(db, 'Contact'), {
      name,
      email,
      enquiry,
      message,
      status: 'New',
      source: 'Contact Sales Form',
      createdAt: serverTimestamp(),
    });

    contactForm.reset();

    showMessage('Message sent successfully. We’ll contact you shortly.', 'success');

    setTimeout(() => {
      window.location.href = 'contact-sales-send.html';
    }, 900);
  } catch (error) {
    console.error('Contact form submission failed:', error);

    showMessage('Something went wrong. Please try again.', 'error');
    setLoading(false);
  }
});

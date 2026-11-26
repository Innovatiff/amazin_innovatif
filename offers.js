'use strict';

const offerBtn = document.querySelector('.offer');
const offerPage = document.querySelector('.offer__page');
const closeBtn = document.querySelector('.offer__page--close');
// const main = document.querySelector(".main");

const outsideEvent = () => {};

offerBtn.addEventListener('click', (e) => {
  e.preventDefault();
  offerPage.classList.remove('offer__page--hidden');
  body.classList.add('pointer');
  main.classList.add('blurry');
  footer.classList.add('blurry');
  offerBtn.classList.add('blurry');
});

main.addEventListener('click', () => {
  console.log('clicked me');
  offerPage.classList.add('offer__page--hidden');
  body.classList.remove('pointer');
  main.classList.remove('blurry');
  footer.classList.remove('blurry');
  offerBtn.classList.remove('blurry');
});

closeBtn.addEventListener('click', (e) => {
  e.preventDefault();
  offerPage.classList.add('offer__page--hidden');
  body.classList.remove('pointer');
  main.classList.remove('blurry');
  footer.classList.remove('blurry');
  offerBtn.classList.remove('blurry');
});

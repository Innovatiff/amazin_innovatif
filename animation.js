"strict";

const glow = document.querySelector(".scale__glow");

//Lines
const linesR = document.querySelectorAll(".scale__logo--lines-line-r");
const linesL = document.querySelectorAll(".scale__logo--lines-line-l");

//Lightining
const light = document.querySelectorAll(".scale__logo--lightning");
const light1 = document.querySelector(".scale__logo--lightning-1");
const light2 = document.querySelector(".scale__logo--lightning-2");
const lightMid = document.querySelectorAll(".scale__logo--lightning-mid");
const lightSmall = document.querySelectorAll(".scale__logo--lightning-small");
const lightIcon = document.querySelectorAll(
  ".scale__logo--lightning-small-icon"
);

//logo
const logo = document.querySelector(".scale__logo--logo");
const logoMid = document.querySelector(".scale__logo--logo-mid");
const logoSmall = document.querySelector(".scale__logo--logo-small");
const logoIcon = document.querySelector(".scale__logo--logo-small-icon");
const logoIconSmall = document.querySelector(
  ".scale__logo--logo-small-icon-small"
);
const logoIconSmaller = document.querySelector(
  ".scale__logo--logo-small-icon-smaller"
);

const fast = 500;
const middest = 1000;
const middestFast = 1500;
const mid = 2000;
const slow = 3000;

const short = 4500;
const long = 6000;
const longest = 8000;

const extend = 10000;
const extended = 11000;

setTimeout((e) => {
  logo.classList.add("animate__scale--1");
  logoIcon.classList.add("animate__scale--1");
  light.forEach((l) => {
    l.classList.add("animate__scale--1");
  });
}, fast);

setTimeout((e) => {
  logoMid.classList.add("animate__scale--1");
  lightMid.forEach((l) => {
    l.classList.add("animate__scale--1");
  });
}, mid);

setTimeout((e) => {
  logoSmall.classList.add("animate__scale--1");
  lightSmall.forEach((l) => {
    l.classList.add("animate__scale--1");
  });
}, slow);

setTimeout(function () {
  logoMid.classList.add("animate__shadow");
  lightMid.forEach((l) => {
    l.classList.add("animate__shadow");
  });
  logoSmall.classList.add("animate__shadow");
  lightSmall.forEach((l) => {
    l.classList.add("animate__shadow");
  });
}, short);

setTimeout(function () {
  light1.style.transform = "translateX(20rem)";
  light1.style.opacity = "0";
  light2.style.transform = "translateX(-20rem)";
  light2.style.opacity = "0";
  lightIcon.forEach((e) => {
    e.classList.add("animate__color");
  });
}, long);

setTimeout(function () {
  glow.style.backgroundImage = "linear-gradient( to right,#2b8a3eaa, #343a40)";
  logoIcon.style.backgroundColor = "#2f9e432f";
  logoIconSmall.style.backgroundColor = "#2f9e443d";
  logoIconSmall.style.boxShadowColor = "#2f9e443d";
  logoIconSmaller.style.backgroundColor = "#2f9e43";
  logoIcon.style.transform = "scale(3)";
  logoMid.style.backgroundColor = "#00000000";
  logoSmall.style.backgroundColor = "#00000000";
  logo.style.backgroundColor = "#00000000";
  logoMid.classList.remove("animate__shadow");
  logoSmall.classList.remove("animate__shadow");
}, longest);

setTimeout(() => {}, extend);

setTimeout(() => {}, extended);

////////////////////////////////////////////////////////
///
///
///
// Contact-sales-end
const contactSalesSendContainer = document.querySelector(
  ".contact-sales-send__container"
);
const contactSalesSendBox = document.querySelector("contact-sales-send__box");

setTimeout((e) => {
  document.querySelector(".contact-sales-send__spinner").classList.add("hide");
  document.querySelector(".contact-sales-send__icon").classList.remove("hide");
}, fast);

setTimeout((e) => {
  contactSalesSendContainer.classList.remove("hide");
}, middest);

//////////////////////////////////////////////////////
//
///
///
// Trace
const traceLeftTrackBtnBack = document.querySelector(".trace__left--track");
const traceLeftTrackBtn = document.querySelector(".trace__left--track-btn");
const traceLeftSpinner = document.querySelector(".trace__left--spinner");
const traceLeftBox = document.querySelector(".trace__left--box");

traceLeftTrackBtn.addEventListener("click", function () {
  traceLeftTrackBtnBack.style.opacity = "0";
  setTimeout((e) => {
    traceLeftBox.classList.remove("hide");
  }, middest);

  setTimeout((e) => {
    document.querySelector(".trace__left--content").style.borderColor =
      "#404040";
  }, middestFast);

  setTimeout((e) => {
    document.querySelector(".trace__left--details").classList.remove("hide");
  }, mid);
});

//
//
//
//
//
//

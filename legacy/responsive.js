//Pricing carret
const header = document.querySelector('.header');
// const carretDownLink = document.querySelector(".header__nav--link-down");
// const carret = document.querySelector(".header__nav--carret");
// const carretDownLinkIcon = document.querySelector(".header__nav--link-icon");
// const headerNav = document.querySelector(".header__nav");
// const headerCarretNavLinkBack = document.querySelector(
//   ".header__nav--carret-link-back"
// );
const main = document.querySelector('.main');
const footer = document.querySelector('.footer');
const body = document.querySelector('body');

const headerNavLogsDevices = document.querySelector('.header__nav--logs-devices');
const headerNavLogsDevicesB = document.querySelectorAll('.header__nav--logs-devices-b');
const headerNavLogsDevicesB1 = document.querySelector('.header__nav--logs-devices-b-1');
const headerNavLogsDevicesB2 = document.querySelector('.header__nav--logs-devices-b-2');

// carretDownLink.addEventListener("mouseover", function (e) {
//   carret.classList.remove("hide");
//   carretDownLink.style.backgroundColor = "#171717";
//   carretDownLinkIcon.style.transform = "rotate(-180deg)";
//   carretDownLinkIcon.style.transition = "all 0.2s";
//   main.classList.add("blurry");
//   footer.classList.add("blurry");
// });

// carret.addEventListener("mouseover", function (e) {
//   carret.classList.remove("hide");
//   carretDownLink.style.backgroundColor = "#171717";
//   carretDownLinkIcon.style.transform = "rotate(-180deg)";
//   carretDownLinkIcon.style.transition = "all 0.2s";
//   main.classList.add("blurry");
//   footer.classList.add("blurry");
// });

// carretDownLink.addEventListener("mouseleave", function (e) {
//   carret.classList.add("hide");
//   carretDownLink.style.backgroundColor = "";
//   carretDownLinkIcon.style.transform = "rotate(0deg)";
//   carretDownLinkIcon.style.transition = "all 0.2s 0.2s";
//   main.classList.remove("blurry");
//   footer.classList.remove("blurry");
// });

// carret.addEventListener("mouseleave", function (e) {
//   carret.classList.add("hide");
//   carretDownLink.style.backgroundColor = "";
//   carretDownLinkIcon.style.transform = "rotate(0deg)";
//   carretDownLinkIcon.style.transition = "all 0.2s 0.2s";
//   main.classList.remove("blurry");
//   footer.classList.remove("blurry");
// });

// carret.innerHTML = `<a href="/printed.html" class="header__nav--carret-link">
//               <i class="ph header__nav--carret-link-icon ph-newspaper"></i>
//               <div class="header__nav--carret-link-b">
//                 <span class="header__nav--carret-link-span">
//                   Printed advertisement</span
//                 >
//                 <p
//                   class="header__nav--carret-link-text header__nav--carret-link-text-1"
//                 >
//                   Business cards, flyers, posters, shirts, Invitation cards
//                 </p>
//               </div>
//             </a>

//             <a href="/website.html" class="header__nav--carret-link">
//               <i class="ph header__nav--carret-link-icon ph-browser"></i>
//               <div class="header__nav--carret-link-b">
//                 <span class="header__nav--carret-link-span"
//                   >Website plan</span
//                 >
//                 <p class="header__nav--carret-link-text">
//                   Display your products and services online with ease
//                 </p>
//               </div>
//             </a>

//             <div class="header__nav--carret-link-back">
//               <a href="/web-marketing.html" class="header__nav--carret-link">
//                 <i class="ph header__nav--carret-link-icon ph-storefront"></i>
//                 <div class="header__nav--carret-link-b">
//                   <span class="header__nav--carret-link-span"
//                     >Special website plan</span
//                   >
//                   <p class="header__nav--carret-link-text">
//                     Innovatif First-class support and SEO management
//                   </p>
//                 </div>
//               </a>
//             </div>

//             <div class="header__nav--carret-link-back header__nav--carret-link-back-2">
//               <a href="/package.html" class="header__nav--carret-link">
//                 <i class="ph header__nav--carret-link-icon ph-package"></i>
//                 <div class="header__nav--carret-link-b">
//                   <span class="header__nav--carret-link-span">
//                     Exclusive packages</span
//                   >
//                   <p class="header__nav--carret-link-text">
//                     High-end website, monthly printed advertisement
//                   </p>
//                 </div>
//               </a>
//             </div>`;

// //
// //
// //
// //

if (footer) {
  footer.innerHTML = `      
  <div class="footer__line--top"></div>
        <div class="footer__container">
          <div class="footer__left">
            <div class="footer__logo">
              <div class="footer__logo--logo"></div>
              <span class="footer__logo--company"
                >&copy; 2026 Innovatif developments &mdash; All rights
                reserved.</span
              >
            </div>
          </div>
          <div class="footer__right">
            <a href="home.html" class="footer__links">Home</a>
            <a href="assistants.html" class="footer__links">Assistants</a>
            <a href="contact.html" class="footer__links">Contact</a>
            <a href="designs.html" class="footer__links">Case studies</a>
          </div>
        </div>`;
}

// Phone nav
headerNavLogsDevices.addEventListener('click', function (e) {
  header.classList.toggle('header__height');
  headerNavLogsDevicesB1.classList.toggle('header__nav--logs-devices-1');
  headerNavLogsDevicesB2.classList.toggle('header__nav--logs-devices-2');
  main.classList.toggle('blurry');
  body.classList.toggle('pointer');
  footer.classList.toggle('blurry');
  headerPhonePricing.classList.add('header__phone--pricing-hidden');
  header.classList.remove('header__darker');
  headerPhoneLink.forEach((links) => {
    links.classList.remove('header__phone--pricing-link-darker');
  });
});

//Pricing phone nav
const headerPhonePricing = document.querySelector('.header__phone--pricing');
const headerPhoneLink = document.querySelectorAll('.header__phone--link');

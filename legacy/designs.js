"use strict";
//components
// function desingsHeaderLinkFunction(light, number) {
//   if (!light) {
//     headerNavLinks.forEach((e) => {
//       headerNav.children[number].children[0].style.color = "#0a0a0a";
//       headerNav.children[number].children[0].children[0].style.fontWeight =
//         "600";
//     });
//   } else {
//     headerNavLinks.forEach((e) => {
//       headerNav.children[number].children[0].style.color = "#fafafa";
//       headerNav.children[number].children[0].children[0].style.fontWeight =
//         "500";
//     });
//   }
// }

// Color invertion
// HEADER
// const invertTheme = document.querySelector(".designs__header--links");
// const invertColorsIcon = document.querySelectorAll(".designs__header--icon");

// const body = document.querySelector("body");
// const designsHome = document.querySelector(".designs__home");
// const designsHeaderLogo = document.querySelector(".designs__header--logo");
// const designsHeaderSep = document.querySelector(".designs__header--sep");
// const designsHeaderIcon = document.querySelector(".designs__header--icon");
// const designsHeaderIconLight = document.querySelector(
//   ".designs__header--icon-light"
// );
// const designHeaderInspire = document.querySelector(".designs__header--inspire");
// const designHeaderInspireIcon = document.querySelector(
//   ".designs__header--inspire-icon"
// );
// const designsHeader = document.querySelector(".designs__header");
// const designsHeaderFooter = document.querySelector(".designs__header--footer");
// const designsHeaderFooterLink = document.querySelectorAll(
//   ".designs__header--footer-link"
// );

// invertTheme.addEventListener("click", function (e) {
//   invertColorsIcon.forEach((e) => {
//     e.classList.toggle("designs__header--icon-active");
//   });

//   body.classList.toggle("light__lightest--background");
//   designsHome.classList.toggle("light__lightest--background");
//   designsHeaderLogo.classList.toggle("logo-inverted");
//   designsHeaderSep.classList.toggle("light__grey--background");
//   invertTheme.classList.toggle("light__mid--border");
//   designsHeaderIcon.classList.toggle("light__dark--text");
//   designsHeaderIconLight.classList.toggle("light__grey--background");
//   designsHeaderIconLight.classList.toggle("light__dark--text");
//   designHeaderInspire.classList.toggle("light__mid--border");
//   designHeaderInspire.classList.toggle("light__mid--background");
//   designHeaderInspire.classList.toggle("light__dark--text");
//   designHeaderInspireIcon.classList.toggle("light__mid--background");
//   designHeaderInspireIcon.classList.toggle("light__mid--border");

//   headerNavLinks.forEach((e) => {
//     e.classList.toggle("light__dark--text");
//     e.style.color = "#707070";
//   });

//   headerNavSublinks.forEach((e) => {
//     e.style.color = "#707070";
//   });

//   designsHeader.classList.toggle("light__mid--border");
//   designsHeaderFooter.classList.toggle("light__mid--border");
//   designsHeaderFooterLink.forEach((e) => {
//     e.classList.toggle("light__dark--text");
//   });

//   //
//   //
//   //
//   //
//   //
//   //
//   //
//   //
//   ////// Main page

//   const designsMainPrimaryHeading = document.querySelectorAll(
//     ".designs-main__primary--heading"
//   );
//   const designsMainPrimaryText = document.querySelectorAll(
//     ".designs-main__primary--text"
//   );
//   const designsMainPrimaryHeading2 = document.querySelectorAll(
//     ".designs-main__primary--heading-2"
//   );
//   const designsMainContentBox = document.querySelectorAll(
//     ".designs-main__content--box"
//   );
//   const designsMainContentBoxHeading = document.querySelectorAll(
//     ".designs-main__content--box-heading"
//   );
//   const designsMainContentBoxText = document.querySelectorAll(
//     ".designs-main__content--box-text"
//   );

//   designsMainPrimaryHeading.forEach((e) => {
//     e.classList.toggle("light__lightest--heading");
//   });

//   designsMainPrimaryHeading2.forEach((e) => {
//     e.classList.toggle("light__lightest--heading");
//   });

//   designsMainPrimaryText.forEach((e) => {
//     e.classList.toggle("light__mid--text");
//   });
//   designsMainContentBox.forEach((e) => {
//     e.classList.toggle("light__mid--border");
//     e.classList.toggle("light__dark--background");
//   });

//   designsMainContentBoxHeading.forEach((e) => {
//     e.classList.toggle("light__dark--heading");
//   });

//   designsMainContentBoxText.forEach((e) => {
//     e.classList.toggle("light__dark--text");
//   });
// });

// Utilities

//Header Selectors
const header = document.querySelector(".designs__header");
const headerBack = document.querySelector(".designs__header--back");
const headerNav = document.querySelector(".designs__header--nav");
const headerTopMainHeader = document.querySelector(
  ".designs__header--main-header"
);
const headerFooter = document.querySelector(".designs__header--footer");
const headerNavList = document.querySelectorAll(".designs__header--nav-list");
const headerNavLinks = document.querySelectorAll(".designs__header--nav-links");
const headerNavLinksIcon = document.querySelector(
  ".designs__header--nav-links-icon"
);

const headerNavAllsublinks = document.querySelectorAll(
  ".designs__header--nav-links-allsublinks"
);
const headerNavSublinks = document.querySelectorAll(
  ".designs__header--nav-links-sublinks"
);

// Main section selectors
const body = document.querySelector("body");
const designsMain = document.querySelector(".designs-main");
const designMainSection = document.querySelector(".designs-main__section");

//Phone nav selections
const headerPhone = document.querySelector(".designs__header--phone");
const designsHeaderPhoneBtn = document.querySelector(
  ".designs__header--phone-btn"
);

designsHeaderPhoneBtn.addEventListener("click", function () {
  header.classList.toggle("designs__header--overflow");
  headerBack.classList.toggle("designs__header--back-height");
  headerNav.classList.toggle("designs__header--nav-hidden");
  headerFooter.classList.toggle("designs__header--footer-hidden");
  headerTopMainHeader.classList.toggle("designs__header--main-header-sticky");
  body.classList.toggle("pointer");
});

// Header Link sublink vissibility
headerNavList.forEach((e) => {
  e.addEventListener("click", function (e) {
    const clicked = e.target.closest(".designs__header--nav-links");
    const clickedId = clicked.dataset.id;

    //Selectors
    if (clickedId === "printed") {
      //Sublink vissibility
      document
        .querySelector(".designs__header--nav-links-allsublinks-1")
        .classList.toggle("designs__header--nav-links-allsublinks-hidden");
      // sublink icon rotation
      clicked.children[1].classList.toggle(
        "designs__header--nav-links-icon-active"
      );
    } else if (clickedId === "logos") {
      //Sublink vissibility
      document
        .querySelector(".designs__header--nav-links-allsublinks-2")
        .classList.toggle("designs__header--nav-links-allsublinks-hidden");
      // sublink icon rotation
      clicked.children[1].classList.toggle(
        "designs__header--nav-links-icon-active"
      );
    } else if (clickedId === "website") {
      //Sublink vissibility
      document
        .querySelector(".designs__header--nav-links-allsublinks-3")
        .classList.toggle("designs__header--nav-links-allsublinks-hidden");
      // sublink icon rotation
      clicked.children[1].classList.toggle(
        "designs__header--nav-links-icon-active"
      );
    } else if (clickedId === "updates") {
      //Sublink vissibility
      document
        .querySelector(".designs__header--nav-links-allsublinks-4")
        .classList.toggle("designs__header--nav-links-allsublinks-hidden");
      // sublink icon rotation
      clicked.children[1].classList.toggle(
        "designs__header--nav-links-icon-active"
      );
    }
  });
});

// Header sublink functions
headerNavAllsublinks.forEach((e) => {
  e.addEventListener("click", function (link) {
    const closestLink = link.target.closest(
      ".designs__header--nav-links-sublinks"
    );

    //hide phone nav
    header.classList.remove("designs__header--overflow");
    headerBack.classList.remove("designs__header--back-height");
    headerNav.classList.remove("designs__header--nav-hidden");
    headerFooter.classList.remove("designs__header--footer-hidden");
    headerTopMainHeader.classList.remove("designs__header--main-header-sticky");
    body.classList.remove("pointer");

    // Nav links color changes function
    // Printed advertisement active color
    function headerNavLinkColorAds() {
      headerNavLinks.forEach((e) => {
        e.style.color = "#888";
      });

      headerNav.children[0].children[0].style.color = "#ffffff";
    }

    // Logos active color
    function headerNavLinkColorLogos() {
      headerNavLinks.forEach((e) => {
        e.style.color = "#888";
      });
      headerNav.children[1].children[0].style.color = "#ffffff";
    }

    // Website active color
    function headerNavLinkColorWebsite() {
      headerNavLinks.forEach((e) => {
        e.style.color = "#888";
      });
      headerNav.children[2].children[0].style.color = "#ffffff";
    }

    // Update active color
    function headerNavLinkColorUpdate() {
      headerNavLinks.forEach((e) => {
        e.style.color = "#888";
      });
      headerNav.children[3].children[0].style.color = "#ffffff";
    }

    headerNavSublinks.forEach((e) => {
      e.classList.remove("designs__header--nav-links-sublinks-active");
    });

    // Sublinks active state
    closestLink.classList.add("designs__header--nav-links-sublinks-active");

    // Sublinks main section content and colors list
    if (closestLink.dataset.id === "cards") {
      designMainSection.innerHTML = `<div class="designs-main__content--container">
            <div class="designs-main__content--small-box">
              <img
                src="https://static.vecteezy.com/system/resources/previews/009/010/481/original/modern-professional-business-card-creative-and-simple-business-card-business-card-design-template-corporate-business-card-design-free-free-vector.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://www.ijgraphics.co.uk/wp-content/uploads/2022/10/AdobeStock_503564354-scaled.jpeg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://m.media-amazon.com/images/I/61QpAxjZWCL._AC_UF1000,1000_QL80_.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://shop.printthree.com/wp-content/uploads/2021/06/business-cards-1.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://5.imimg.com/data5/SELLER/Default/2022/1/YH/EX/SP/89077325/115-business-card-500x500.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://static.vecteezy.com/system/resources/previews/006/886/282/original/professional-business-card-design-template-free-vector.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i0.wp.com/graphicsalon.com/wp-content/uploads/2019/04/EPS-Creative-Business-Card-Design-Template-3.jpg?fit=3000%2C2250&ssl=1"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i.graphicmama.com/blog/wp-content/uploads/2021/09/14091819/Free-Business-Card-Templates-05.png"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://static.vecteezy.com/system/resources/thumbnails/000/250/387/small_2x/abstract-stylish-wave-business-card-template-design.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i.pinimg.com/736x/be/b7/f0/beb7f0502a633f56f697e5503e05f360.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://st.depositphotos.com/2485091/54737/v/450/depositphotos_547374250-stock-illustration-golden-wave-business-card-design.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://d2tl9ctlpnidkn.cloudfront.net/printproo/images/opt/product/Business-Cards-Glossy_04520621202303.jpg?v=6544"
                class="designs-main__content--image"
              />
            </div>
          </div>`;
      headerNavLinkColorAds();
    }

    if (closestLink.dataset.id === "flyers") {
      designMainSection.innerHTML = `
                          <div class="designs-main__content--container">
            <div class="designs-main__content--small-box">
              <img
                src="https://img.freepik.com/free-psd/summertime-ocean-waves-poster-template_23-2148539740.jpg?t=st=1721580435~exp=1721584035~hmac=45321a10fac4f6b50be90e48de2bd98416cbe882a0cd8bccb905f19fdfe91de3&w=740"
                class="designs-main__content--image"
              />
            </div>

            <div class="designs-main__content--small-box">
              <img
                src="https://img.freepik.com/free-vector/travel-sale-flyer-template_52683-46904.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://img.freepik.com/premium-vector/business-flyer-design-template_1072284-7.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://img.freepik.com/free-psd/modern-digital-marketing-agency-flyer-template_501970-98.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://mir-s3-cdn-cf.behance.net/project_modules/1400/aa113d98150771.5ed5da2d6f796.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://ksioks.com/wp-content/uploads/2020/02/Corporate-flyer-design-psd-template.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i2.wp.com/www.graphicprime.com/wp-content/uploads/2019/04/Professional-Business-Flyer-Design-4.jpg?fit=1864,2228&ssl=1"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://img.freepik.com/free-vector/vertical-business-flyer-template_23-2148838214.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://store.leanvc.com.my/wp-content/uploads/2021/03/Flyer-Design.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i0.wp.com/graphicmega.com/wp-content/uploads/2019/04/Classic-Professional-Business-Flyer-Design-Template-1.jpg?fit=2512%2C2700&ssl=1"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i.poweredtemplates.com/p/sp/137390/sp_p_slide1.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i.etsystatic.com/28551648/r/il/cabbc6/3697995553/il_570xN.3697995553_r5ix.jpg"
                class="designs-main__content--image"
              />
            </div>
          </div>`;
      headerNavLinkColorAds();
    }

    if (closestLink.dataset.id === "posters") {
      designMainSection.innerHTML = `          <div class="designs-main__content--container">
            <div class="designs-main__content--small-box">
              <img
                src="https://i.pinimg.com/564x/36/08/3e/36083eb96e860b66999f4efa117c10f9.jpg"
                class="designs-main__content--image"
              />
            </div>

            <div class="designs-main__content--small-box">
              <img
                src="https://i.pinimg.com/564x/e5/a3/46/e5a3466655e14bf17dd2055a4618cdab.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i.pinimg.com/564x/7d/a5/30/7da530334e0c7d7a992b95c28d323cb2.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i.pinimg.com/564x/c6/96/32/c69632abfa9e2cd5f65933ed840393d2.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i.pinimg.com/564x/b2/d2/43/b2d243f46d95705e80c256b02fc93b49.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i.pinimg.com/564x/a3/7d/64/a37d6446847f3fbf2af991803e6e480f.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i.pinimg.com/564x/4f/f5/c0/4ff5c03ef8e4a4e3a6ae0ec9895ef234.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i.pinimg.com/564x/d8/31/20/d831203a2e08203bc5041919ae1ebde6.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i.pinimg.com/736x/8f/7e/b5/8f7eb50df65045f98b4c77d4eee20067.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i.pinimg.com/736x/44/8d/73/448d73d0dd5d9796739adbafb794fcdf.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i.pinimg.com/736x/51/0c/59/510c599d5c41763d9a95f604549af327.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://i.pinimg.com/736x/53/11/03/531103d470dc84cea8e88d358a9c049a.jpg"
                class="designs-main__content--image"
              />
            </div>
          </div>`;
      headerNavLinkColorAds();
    }

    if (closestLink.dataset.id === "logo") {
      designMainSection.innerHTML = `          <div class="designs-main__content--container">
            <div class="designs-main__content--small-box">
              <img
                src="https://cdn.dribbble.com/users/59089/screenshots/1962004/media/d2e754b98c06e3d44cddfe7002d8011e.jpg?resize=800x600&vertical=center"
                class="designs-main__content--image"
              />
            </div>

            <div class="designs-main__content--small-box">
              <img
                src="https://cdn.dribbble.com/users/467465/screenshots/1965002/media/853648da4609f35005e94550a6354612.png?resize=800x600&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://cdn.dribbble.com/users/236495/screenshots/1897807/media/261e20ef99bdc6b1878938a5628cd658.png?resize=800x600&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/ee857122430955.56312a3bbc058.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://cdn.dribbble.com/users/58505/screenshots/1897609/media/e6756be653da5dd09b6ec8bbd990fb74.jpg?resize=800x600&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://cdn.dribbble.com/users/59089/screenshots/1913008/media/27db1e31a21e03e6a5541260d9c95904.jpg?resize=800x600&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/cac47726750381.56359e78be2e4.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://cdn.dribbble.com/users/58661/screenshots/1785733/media/42f23e4ad6b85098c6d464dc11d07f8e.png?resize=800x600&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://cdn.dribbble.com/users/631066/screenshots/2001862/media/3af97f0d7584db9a2adab3985d73dba3.png?resize=800x600&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://graphicdesignjunction.com/wp-content/uploads/2015/06/badge_1.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://cdn.dribbble.com/users/229789/screenshots/1977629/media/b1042c82fcab457b019744b317cb7288.png?resize=800x600&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box">
              <img
                src="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/40a6d321298863.562fed8de4de8.jpg"
                class="designs-main__content--image"
              />
            </div>
          </div>`;
      headerNavLinkColorLogos();
    }

    if (closestLink.dataset.id === "restaurant") {
      designMainSection.innerHTML = `          <div class="designs-main__content--container-website">
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/7904402/screenshots/17150253/media/fc2962d35ef822501f39e3c392a68b9b.png?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>

            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/7904402/screenshots/17185366/media/abd887ceb96c189515fdd8d9f1fb64ac.png?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/7904402/screenshots/16928355/media/96850cb2c73d7297daead9761f034b40.png?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/8326797/screenshots/16358777/media/61a53fc56e4e6491909ae5bf2a8d5bda.png?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/8696599/screenshots/18381178/media/7e4415e32521d7958ad6e9692ee6f4fa.png?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/9602921/screenshots/16814445/media/422373eb0e38bd6f6e2bb4c2e84ad357.jpg?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/7904402/screenshots/19194443/media/e655c141848b92269f2e8590d198bf0a.png?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/8267627/screenshots/18527107/media/23706fff269aaeaaf086548832cbf6a4.jpg?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://img.freepik.com/free-psd/mexican-traditional-dishes-restaurant-landing-page_23-2148486808.jpg?t=st=1721607880~exp=1721611480~hmac=60e126a79574e311b999cee3ced887ce0dd58548a0bbac00c38ac5ba82cca647&w=1380"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://img.freepik.com/free-vector/beautiful-vegan-restaurant-landing-page-template_1361-898.jpg?t=st=1721607918~exp=1721611518~hmac=d1a4eb743f65a79ed8a4795d533754d476d29b023402dabcb7343ca17cbc1519&w=740"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://i.pinimg.com/564x/f8/01/1e/f8011eee0a2407d2c2edbc29bf45ab6c.jpg"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://img.freepik.com/free-psd/dynamic-food-restaurant-banner-template_23-2149501874.jpg?t=st=1721608412~exp=1721612012~hmac=06bc28b25a2be881718615958904e6701348ccdf621d589fb69351afd47a6f2c&w=1380"
                class="designs-main__content--image"
              />
            </div>
          </div>`;
      headerNavLinkColorWebsite();
    }

    if (closestLink.dataset.id === "agencies") {
      designMainSection.innerHTML = `          <div class="designs-main__content--container-website">
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/2766945/file/original-518edd824118614f24a9ebb941b531cf.jpg?resize=1024x1024"
                class="designs-main__content--image"
              />
            </div>

            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/8400102/file/original-3881a8c233226093be37635231b6a042.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/13593412/file/original-f0b9435734904f60ab49cca8ffa275f2.jpg?resize=1024x768&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/9748154/screenshots/18360164/media/92a6fb4d8c8f577b3d82b4f4fca0de0c.png?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/14440929/file/original-a639d932815f5d15554b6cc8d590d217.png?resize=1024x730"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/10113087/file/original-bbac44532ccc635fc712fc7ecaa0631d.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/12217092/file/original-6ca4e4b179c1c89bbc3621ad0ae443dc.jpg?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/9645575/screenshots/19805890/media/5fd4815ec6b3195038335939b4540a0c.jpg?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/6003804/file/original-e7cb34b9c05281a93ec8594506abaa4a.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://img.freepik.com/free-vector/marketing-business-landing-page_23-2148881862.jpg?t=st=1721611258~exp=1721614858~hmac=456412f37aa55aacead8b5e02b5af8426734937dbaa7bac0ce0071168b1c3fcb&w=1380"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/14205851/file/original-f1ce3a77a00a95f44922f5868d320cad.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/15274492/file/original-5c6bbb80d616099bfbf16cad088ffcc6.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
          </div>`;
      headerNavLinkColorWebsite();
    }

    if (closestLink.dataset.id === "electronics") {
      designMainSection.innerHTML = `          <div class="designs-main__content--container-website">
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/919822/screenshots/17863434/media/e672fe0c9cefeacc6f8a85d93445c733.jpg?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>

            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/10650437/file/original-4a460ebf3799d9b8bf31f2a3d2e378d2.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/12601679/file/original-ad41b05a60211c3a0ef8beb4aec86785.png?resize=1024x646"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/961257/screenshots/16317118/media/6a900aabcefba5a6cb6e98e688da0ae5.png?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/15500107/file/original-dd5e08acb1e36869543db432fbf3cb12.png?resize=1024x768&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/98265/screenshots/15381538/media/66f06d44e21fed749fb8f7a1fe431e98.jpg?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/890056/screenshots/3747760/media/7280207721460b2069dcc4f04855fb18.jpg?resize=800x600&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/8586038/screenshots/17493444/media/d7ca1c5529cb7c5e9380beed3490c74e.png?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/15210535/file/original-6c65c2a5818285cc8f525558ee9ed875.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/4104229/screenshots/16301497/media/74fc79fbe236b447afa9722a46da8c3c.jpg?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/14786821/file/original-a2edd926676b92c963ae462ee2558444.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/11146516/file/original-17e527729b59cfbcd4654b5cefa8d280.jpg?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
          </div>`;
      headerNavLinkColorWebsite();
    }

    if (closestLink.dataset.id === "design") {
      designMainSection.innerHTML = `          <div class="designs-main__content--container-website">
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/12025023/file/original-be09183cf83ec4a02b7509acc7152d4c.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>

            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/7314688/file/original-764df2b73c74a6588094a23f3bf00cc6.png?resize=752x564"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/2745398/file/original-16cb480f2f5a46058cf4b83ea518556c.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/3226408/file/original-187f37339fd0c2071a58cb151a980116.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/3749508/file/original-029faebc2ba8e35929d80e5edb428d82.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/3491281/file/original-92ba32285cd1d9bcb613c3ab95db1c4e.png?resize=1024x832"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/15482644/file/original-51e81f905911c234a4ce92454dd4f125.jpg?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/970957/screenshots/17461643/media/a2e566662a51e27956af62af9974c842.png?resize=1200x900&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/970957/screenshots/17177334/media/695b8147c6198149738ce0bffb83fe50.png?resize=1200x900&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/970957/screenshots/16308782/media/982756624951a780c160f7a900b5f4a5.png?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/7768628/screenshots/16067798/media/650e2789413766b8daa78e9de75a7dd4.png?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/3685040/file/original-d286abb8d9d027086f15506473c34b86.jpg?resize=1024x683"
                class="designs-main__content--image"
              />
            </div>
          </div>`;
      headerNavLinkColorWebsite();
    }

    if (closestLink.dataset.id === "software") {
      designMainSection.innerHTML = `          <div class="designs-main__content--container-website">
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/7799215/file/original-5ecaee97b692660705c19258ba43d90d.jpg?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>

            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/883826/screenshots/18246056/media/ebb554f56f93843699495b85be944e9a.jpg?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/8900027/file/original-12f1e610923dea4d9240e213bc8a8bc9.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/13652981/file/original-3513a60f73ee5e4bce1d4845372f9a96.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/15454059/file/original-e139549f7271fecd3476e4b50f266839.png?resize=1024x773"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/8341551/file/original-d3fef4c71fad18b96d7d8567de3a84ce.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/5505548/file/original-42b81159a2b64e085d45d9fe5cbff5cf.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/15181452/file/original-39efd9bdac483abe6be4cd08173c2594.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/14307783/file/original-9b3ad3ee54ce9d05be1f1235194a3766.jpg?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/14753327/file/original-0c486e3b0f8bb09e1f341a1ccaaf0072.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/14611329/file/original-db63f1ce5b22b4430df9e1466aaf7f49.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/9147177/screenshots/16609510/media/13bd8e6b30f3cf90a13e57d0f65338da.png?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
          </div>`;
      headerNavLinkColorWebsite();
    }

    if (closestLink.dataset.id === "style") {
      designMainSection.innerHTML = `          <div class="designs-main__content--container-website">
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/12381273/file/original-a74eac413762da8b72fe6c9c2ccd7d03.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>

            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/2738274/file/original-8112d16113feaa5f7356d6c8c5518287.jpg?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/8374815/screenshots/18474526/media/7a370a0808974ebb6c8048c834371f2d.png?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/9684942/screenshots/18064801/media/2a14f88fc9e2f3878fcf9eeb63298cd5.jpg?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/7379414/file/original-efcac22dcfc23ee48b1c277237ae04fd.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/15019886/file/original-795766d29bfc05ab496abbfe7cedb1d2.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/9684942/screenshots/17288122/media/ba65336d6a6cc2563e969e78f2bad749.jpg?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/4165269/file/original-861ef41140e3102469c095f1b68c7715.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/4148125/file/original-f9147b9320df919c781ddef778510ba9.jpg?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/7449214/file/original-ef61142f4734e7147cc3b4002aaea24d.jpg?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/7566934/file/original-64cea23df4c242e21f2a539abb5bf5a4.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/876555/screenshots/16962695/media/001e4fc58b02fe294e9dd1b4ed95814f.png?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
          </div>`;
      headerNavLinkColorWebsite();
    }

    if (closestLink.dataset.id === "lightscale") {
      designMainSection.innerHTML = `          <div class="designs-main__content--container-website">
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/14941931/file/original-ac0d91e43dca1460f072a197d77d783d.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>

            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/3157100/file/original-9218a74c2b3e63694375033c4189bee7.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/11857845/file/original-2ed6a0b8516f37a0e376015f8db2f973.webp?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/15156198/file/original-d7306e3f534f1622fc743c6d2747dbc3.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/6007820/file/original-8ff6f31e5e99df8ff78cd9f36905cc9b.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/13444550/file/original-3d06d0561845e04305901a7843c55882.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/3167559/file/original-65904d78b54096846112d32c6e5755c3.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/6791926/file/original-eba09be7847562ae95b71782ed50f322.jpg?resize=752x632"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/3111859/file/original-973c6efc122ea6ff37f898ecb430ba11.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/4444241/file/original-cb3fe204202ca097aefe85893569727a.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/3266055/file/original-a85d8b6c013b62858e913156d5319487.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/3131684/file/original-82cf065fbc06c900f0f29dc71b19caac.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/9776093/file/original-61ebd422c3ed30f41a8b3ff972439e17.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/9949211/file/original-6cb1f6951ffb3caf188bdfd771fea900.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/3105510/file/original-6a13f3906d7b3ceca5e8f76c296453c1.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/9450865/file/original-c6bf9a62aac14d1defb30825e5751080.png?resize=1024x768"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/userupload/12590807/file/original-6332c48e9de85f8e00a9166896aaebca.jpg?resize=1024x796"
                class="designs-main__content--image"
              />
            </div>
            <div class="designs-main__content--small-box-website">
              <img
                src="https://cdn.dribbble.com/users/963880/screenshots/18238839/media/cee5a317ec85d97a613c00d1d10c65fc.png?resize=1000x750&vertical=center"
                class="designs-main__content--image"
              />
            </div>
          </div>`;
      headerNavLinkColorUpdate();
    }
  });
});

// Designs page
const designsButton = document.querySelector(".designs__header--text");

designsButton.addEventListener("click", function () {
  headerNavSublinks.forEach((e) => {
    e.classList.remove("designs__header--nav-links-sublinks-active");
  });
  headerNavLinks.forEach((e) => {
    e.style.transition = "all 0.2s";
    e.style.color = "#a3a3a3";
  });

  header.classList.remove("designs__header--overflow");
  headerBack.classList.remove("designs__header--back-height");
  headerNav.classList.remove("designs__header--nav-hidden");
  headerFooter.classList.remove("designs__header--footer-hidden");
  headerTopMainHeader.classList.remove("designs__header--main-header-sticky");
  body.classList.remove("pointer");

  designMainSection.innerHTML = `<h2 class="designs-main__primary--heading">
            Welcome to Innovatif designs
          </h2>
          <p
            class="designs-main__primary--text designs-main__primary--text-heading"
          >
            The place to find what you desire about designs, printed
            advertisements, logos and website templates
          </p>
          <div class="designs-main__intro">
            <img
              src="src/img/logo-white-removebg-preview.png"
              class="designs-main__intro--img"
            />
          </div>
          <h3
            class="designs-main__primary--heading-2 designs-main__primary--heading-marto"
          >
            Overview
          </h3>
          <p class="designs-main__primary--text">
Explore the possibilities with Innovatif Designs and see how our innovative approach can transform your vision into reality. We’re excited to partner with you and create designs that not only meet your needs but exceed your expectations.
          </p>
          <div class="designs-main__content">
            <div class="designs-main__content--box">
              <i class="ph ph-eyedropper designs-main__content--box-icon"></i>
              <div class="designs-main__content--box-right">
                <span class="designs-main__content--box-heading"
                  >Countless designs</span
                >
                <span class="designs-main__content--box-text">
                  Various design options for inspiration and customization
                  according to your business guidelines and colors.
                </span>
              </div>
            </div>
            <div class="designs-main__content--box">
              <i class="ph ph-cards designs-main__content--box-icon"></i>
              <div class="designs-main__content--box-right">
                <span class="designs-main__content--box-heading"
                  >Get inspired</span
                >
                <span class="designs-main__content--box-text">
                  Like a design? Contact Innovatif to get your printed
                  advertisement. We'll take care of the rest.
                </span>
              </div>
            </div>
            <div class="designs-main__content--box">
              <i class="ph ph-sketch-logo designs-main__content--box-icon"></i>
              <div class="designs-main__content--box-right">
                <span class="designs-main__content--box-heading"
                  >Get your logo</span
                >
                <span class="designs-main__content--box-text">
                  Logos are crucial for business recognition and growth. With
                  Innovatif, yours exudes professionalism and high value.
                </span>
              </div>
            </div>
            <div class="designs-main__content--box">
              <i class="ph ph-squares-four designs-main__content--box-icon"></i>
              <div class="designs-main__content--box-right">
                <span class="designs-main__content--box-heading"
                  >4 sets logo</span
                >
                <span class="designs-main__content--box-text"
                  >4 versatile logos fit any format: documents, posters,
                  letters, websites, stickers, cards and social media.
                </span>
              </div>
            </div>
            <div class="designs-main__content--box">
              <i class="ph ph-layout designs-main__content--box-icon"></i>
              <div class="designs-main__content--box-right">
                <span class="designs-main__content--box-heading"
                  >Website templates</span
                >
                <span class="designs-main__content--box-text"
                  >Potential websites templates made by the best designers.
                  Layouts and specific components fo uniqueness.
                </span>
              </div>
            </div>
            <div class="designs-main__content--box">
              <i class="ph ph-sparkle designs-main__content--box-icon"></i>
              <div class="designs-main__content--box-right">
                <span class="designs-main__content--box-heading"
                  >Make it yours</span
                >
                <span class="designs-main__content--box-text"
                  >Like a template? Innovatif designers offer innumerable choice
                  of template. You choose, we customize.
                </span>
              </div>
            </div>
          </div>`;
});

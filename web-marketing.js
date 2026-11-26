'use strict';

const navPlanSelect = document.querySelector('.web-marketing__info--nav-select');

const smallContent = document.querySelector('.web-marketing__info--content-small');

const infoNavBtn = document.querySelector('.web-marketing__info--nav-btn');

navPlanSelect.addEventListener('change', function () {
  if (navPlanSelect.value === 'Essential') {
    infoNavBtn.style.backgroundColor = '#262626';
    infoNavBtn.style.borderTop = '0.1rem solid #404040';
    infoNavBtn.href = 'https://buy.stripe.com/aEUg01gmS35T7YIbIK';
    smallContent.innerHTML = `    
                    <div
                  class="web-marketing__info--box web-marketing__info--box-cate"
                >
                  <div class="web-marketing__info--box-left">
                    <h4 class="web-marketing__info--heading">Website</h4>
                    <div class="web-marketing__info--context">
                      <span class="web-marketing__info--cate">UI and UX</span>
                      <span class="web-marketing__info--cate">Responsive</span>
                      <span class="web-marketing__info--cate">Pages</span>
                      <span class="web-marketing__info--cate">Interactive</span>
                      <span class="web-marketing__info--cate">Site map</span>
                      <span class="web-marketing__info--cate">Copywrite</span>
                    </div>
                  </div>
                  <div class="web-marketing__info--box-left">
                    <h4 class="web-marketing__info--heading">SEO</h4>
                    <div class="web-marketing__info--context">
                      <span class="web-marketing__info--cate"
                        >SEO Optimization</span
                      >
                      <span class="web-marketing__info--cate">Deployment</span>
                      <span class="web-marketing__info--cate">Free domain</span>
                      <span class="web-marketing__info--cate"
                        >Promote-software</span
                      >
                      <span class="web-marketing__info--cate"
                        >Deploy assist</span
                      >
                      <span class="web-marketing__info--cate">Indexing</span>

                      <span class="web-marketing__info--cate"
                        >Integrations</span
                      >
                    </div>
                  </div>
                  <div class="web-marketing__info--box-left">
                    <h4 class="web-marketing__info--heading">Features</h4>
                    <div class="web-marketing__info--context">
                      <span class="web-marketing__info--cate"
                        >Real-world features</span
                      >
                      <span class="web-marketing__info--cate"
                        >everyday-optimization</span
                      >
                      <span class="web-marketing__info--cate"
                        >Location management</span
                      >
                      <span class="web-marketing__info--cate"
                        >User friendly</span
                      >
                      <span class="web-marketing__info--cate"
                        >Offbeat design</span
                      >
                      <span class="web-marketing__info--cate"
                        >Special Events</span
                      >
                      <span class="web-marketing__info--cate"
                        >Stock images</span
                      >
                      <span class="web-marketing__info--cate"
                        >Update deployments</span
                      >
                      <span class="web-marketing__info--cate"
                        >Web-security</span
                      >
                      <span class="web-marketing__info--cate"
                        >On-site payments</span
                      >
                      <span class="web-marketing__info--cate"
                        >Exclusive assistant</span
                      >
                      <span class="web-marketing__info--cate"
                        >Exclusive marketing</span
                      >
                    </div>
                  </div>
                  <div class="web-marketing__info--box-left">
                    <h4 class="web-marketing__info--heading">Support</h4>
                    <div class="web-marketing__info--context">
                      <span class="web-marketing__info--cate"
                        >First-class support</span
                      >
                    </div>
                  </div>
                </div>
                <div class="web-marketing__info--box">
                  <div class="web-marketing__info--result">
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text"
                        >up to 4</span
                      >
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span>  -->
                    </div>
                  </div>
                  <div class="web-marketing__info--result mar-top marbo">
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text"
                        >Included</span
                      > -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <!-- <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <!-- <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <!-- <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                  </div>
                  <div class="web-marketing__info--result mar-top marbo">
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text"
                        >1/month</span
                      >
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text"
                        >up to 10</span
                      >
                    </div>
                    <div class="web-marketing__info--result-box">
                      <!-- <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text"
                        >1 per month</span
                      > -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <!-- <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <!-- <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <!-- <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <!-- <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                  </div>
                  <div class="web-marketing__info--result mar-top marbo">
                    <div class="web-marketing__info--result-box">
                      <!-- <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon> -->
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                  </div>
                </div>`;
  } else if (navPlanSelect.value === 'Premium') {
    infoNavBtn.style.backgroundColor = '#262626';
    infoNavBtn.style.borderTop = '0.1rem solid #404040';
    infoNavBtn.href = 'https://buy.stripe.com/5kA3dffiO49XceYbIN';
    smallContent.innerHTML = `<div
                  class="web-marketing__info--box web-marketing__info--box-cate"
                >
                  <div class="web-marketing__info--box-left">
                    <h4 class="web-marketing__info--heading">Website</h4>
                    <div class="web-marketing__info--context">
                      <span class="web-marketing__info--cate">UI and UX</span>
                      <span class="web-marketing__info--cate">Responsive</span>
                      <span class="web-marketing__info--cate">Pages</span>
                      <span class="web-marketing__info--cate">Interactive</span>
                      <span class="web-marketing__info--cate">Site map</span>
                      <span class="web-marketing__info--cate">Copywrite</span>
                    </div>
                  </div>
                  <div class="web-marketing__info--box-left">
                    <h4 class="web-marketing__info--heading">SEO</h4>
                    <div class="web-marketing__info--context">
                      <span class="web-marketing__info--cate"
                        >SEO Optimization</span
                      >
                      <span class="web-marketing__info--cate">Deployment</span>
                      <span class="web-marketing__info--cate">Free domain</span>
                      <span class="web-marketing__info--cate"
                        >Promote-software</span
                      >
                      <span class="web-marketing__info--cate"
                        >Deploy assist</span
                      >
                      <span class="web-marketing__info--cate">Indexing</span>

                      <span class="web-marketing__info--cate"
                        >Integrations</span
                      >
                    </div>
                  </div>
                  <div class="web-marketing__info--box-left">
                    <h4 class="web-marketing__info--heading">Features</h4>
                    <div class="web-marketing__info--context">
                      <span class="web-marketing__info--cate"
                        >Real-world features</span
                      >
                      <span class="web-marketing__info--cate"
                        >everyday-optimization</span
                      >
                      <span class="web-marketing__info--cate"
                        >Location management</span
                      >
                      <span class="web-marketing__info--cate"
                        >User friendly</span
                      >
                      <span class="web-marketing__info--cate"
                        >Offbeat design</span
                      >
                      <span class="web-marketing__info--cate"
                        >Special Events</span
                      >
                      <span class="web-marketing__info--cate"
                        >Stock images</span
                      >
                      <span class="web-marketing__info--cate"
                        >Update deployments</span
                      >
                      <span class="web-marketing__info--cate"
                        >Web-security</span
                      >
                      <span class="web-marketing__info--cate"
                        >On-site payments</span
                      >
                      <span class="web-marketing__info--cate"
                        >Exclusive assistant</span
                      >
                      <span class="web-marketing__info--cate"
                        >Exclusive marketing</span
                      >
                    </div>
                  </div>
                  <div class="web-marketing__info--box-left">
                    <h4 class="web-marketing__info--heading">Support</h4>
                    <div class="web-marketing__info--context">
                      <span class="web-marketing__info--cate"
                        >First-class support</span
                      >
                    </div>
                  </div>
                </div>
                   <div
                  class="web-marketing__info--box web-marketing__info--box-special"
                >
                  <div class="web-marketing__info--result">
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text"
                        >Unlimited</span
                      >
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                  </div>
                  <div class="web-marketing__info--result mar-top marbo">
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <!-- <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                  </div>
                  <div class="web-marketing__info--result mar-top marbo">
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text"
                        >Unlimited</span
                      >
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text"
                        >Unlimited</span
                      >
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text"
                        >5/month</span
                      >
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <!-- <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <!-- <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <!-- <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                  </div>
                  <div class="web-marketing__info--result mar-top marbo">
                    <div class="web-marketing__info--result-box">
                      <!-- <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon> -->
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                  </div>
                </div>`;
  } else if (navPlanSelect.value === 'InnovaVIP') {
    infoNavBtn.style.backgroundColor = '#565656';
    infoNavBtn.style.borderTop = '0.1rem solid #777';
    infoNavBtn.href = 'https://buy.stripe.com/eVa6pr2w249XceYdR0';
    smallContent.innerHTML = `<div
                  class="web-marketing__info--box web-marketing__info--box-cate"
                >
                  <div class="web-marketing__info--box-left">
                    <h4 class="web-marketing__info--heading">Website</h4>
                    <div class="web-marketing__info--context">
                      <span class="web-marketing__info--cate">UI and UX</span>
                      <span class="web-marketing__info--cate">Responsive</span>
                      <span class="web-marketing__info--cate">Pages</span>
                      <span class="web-marketing__info--cate">Interactive</span>
                      <span class="web-marketing__info--cate">Site map</span>
                      <span class="web-marketing__info--cate">Copywrite</span>
                    </div>
                  </div>
                  <div class="web-marketing__info--box-left">
                    <h4 class="web-marketing__info--heading">SEO</h4>
                    <div class="web-marketing__info--context">
                      <span class="web-marketing__info--cate"
                        >SEO Optimization</span
                      >
                      <span class="web-marketing__info--cate">Deployment</span>
                      <span class="web-marketing__info--cate">Free domain</span>
                      <span class="web-marketing__info--cate"
                        >Promote-software</span
                      >
                      <span class="web-marketing__info--cate"
                        >Deploy assist</span
                      >
                      <span class="web-marketing__info--cate">Indexing</span>

                      <span class="web-marketing__info--cate"
                        >Integrations</span
                      >
                    </div>
                  </div>
                  <div class="web-marketing__info--box-left">
                    <h4 class="web-marketing__info--heading">Features</h4>
                    <div class="web-marketing__info--context">
                      <span class="web-marketing__info--cate"
                        >Real-world features</span
                      >
                      <span class="web-marketing__info--cate"
                        >everyday-optimization</span
                      >
                      <span class="web-marketing__info--cate"
                        >Location management</span
                      >
                      <span class="web-marketing__info--cate"
                        >User friendly</span
                      >
                      <span class="web-marketing__info--cate"
                        >Offbeat design</span
                      >
                      <span class="web-marketing__info--cate"
                        >Special Events</span
                      >
                      <span class="web-marketing__info--cate"
                        >Stock images</span
                      >
                      <span class="web-marketing__info--cate"
                        >Update deployments</span
                      >
                      <span class="web-marketing__info--cate"
                        >Web-security</span
                      >
                      <span class="web-marketing__info--cate"
                        >On-site payments</span
                      >
                      <span class="web-marketing__info--cate"
                        >Exclusive assistant</span
                      >
                      <span class="web-marketing__info--cate"
                        >Exclusive marketing</span
                      >
                    </div>
                  </div>
                  <div class="web-marketing__info--box-left">
                    <h4 class="web-marketing__info--heading">Support</h4>
                    <div class="web-marketing__info--context">
                      <span class="web-marketing__info--cate"
                        >First-class support</span
                      >
                    </div>
                  </div>
                </div>
                                <div class="web-marketing__info--box">
                  <div class="web-marketing__info--result">
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text"
                        >Unlimited</span
                      >
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                  </div>
                  <div class="web-marketing__info--result mar-top marbo">
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                  </div>
                  <div class="web-marketing__info--result mar-top marbo">
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text"
                        >Unlimited</span
                      >
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text"
                        >Unlimited</span
                      >
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <span class="web-marketing__info--result-text"
                        >Unlimited</span
                      >
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                  </div>
                  <div class="web-marketing__info--result mar-top marbo">
                    <div class="web-marketing__info--result-box">
                      <ion-icon
                        class="web-marketing__info--result-icon"
                        name="checkmark-outline"
                      ></ion-icon>
                      <!-- <span class="web-marketing__info--result-text">Included</span> -->
                    </div>
                  </div>
                </div>`;
  }
});

/** Content for the home page. Images are "<section>/<name>" under assets/img. */
import plans from './plans.js';

export default {
  // The two scrolling rows under the headline: [image, caption]
  marquee: [
    [
      ['print/business-cards', 'Business cards'], ['print/t-shirts', 'T-shirts'], ['print/vinyl-banners', 'Banners'],
      ['print/die-cut-stickers', 'Stickers'], ['print/posters', 'Posters'], ['print/vehicle-wraps', 'Vehicle wraps'],
      ['print/custom-boxes', 'Packaging'], ['print/caps-hats', 'Caps'], ['print/neon-signs', 'Neon signs'],
      ['print/menus', 'Menus'], ['print/roll-labels', 'Labels'], ['print/window-graphics', 'Window graphics'],
    ],
    [
      ['software/pos', 'Advanced POS'], ['web/flower-shop', 'Websites'], ['booking/booking-phone', 'Online booking'],
      ['software/restaurant-ordering', 'Restaurant ordering'], ['print/hoodies', 'Hoodies'], ['software/ai-receptionist', 'AI receptionist'],
      ['print/flyers', 'Flyers'], ['software/inventory', 'Inventory'], ['print/tote-bags', 'Tote bags'],
      ['software/self-order-kiosk', 'Kiosks'], ['print/mugs', 'Mugs'], ['software/employee-management', 'Staff scheduling'],
    ],
  ],

  // Eight print products for the photo mosaic (the 1st and 6th are shown large).
  mosaic: ['t-shirts', 'business-cards', 'die-cut-stickers', 'posters', 'caps-hats', 'vehicle-wraps', 'custom-boxes', 'neon-signs'],

  why: [
    { icon: 'stack', title: 'Everything in one place', text: 'Your print, website, booking and software come from the same team, so nothing gets lost between suppliers.' },
    { icon: 'palette', title: 'A brand that matches', text: 'The same colors, logo and voice on your cards, your van, your website and your checkout screen.' },
    { icon: 'pen-nib', title: 'Design in-house', text: 'No logo or artwork yet? We design it, then use it across everything we make for you.' },
    { icon: 'receipt', title: 'Clear quotes', text: 'You know the price before any work begins. No hidden extras and no surprises on the invoice.' },
    { icon: 'headset', title: 'Real people', text: 'Call, WhatsApp or message and you talk to someone who knows your project.' },
    { icon: 'rocket-launch', title: 'Built to grow', text: 'Start with business cards or a one-page site, and add booking, ordering or a full system when you’re ready.' },
  ],

  faqs: [
    { q: 'What does Innovatif do?', a: 'We are an agency for businesses. We design and print marketing materials, build websites and online booking systems, and develop custom software such as POS, ordering, inventory and AI receptionist systems.' },
    { q: 'How much does printing cost?', a: 'Print is quoted per job because the price depends on size, material, quantity and finish. Call, WhatsApp or message us with what you need and we will send you a quote.' },
    { q: 'How much is a website?', a: `We have two website plans: ${plans.websites[0].name} at ${plans.websites[0].price}${plans.websites[0].period} and ${plans.websites[1].name} at ${plans.websites[1].price}${plans.websites[1].period}, which is our best offer. The booking system has its own plans starting at ${plans.booking[0].price}${plans.booking[0].period}.` },
    { q: 'How much does software cost?', a: 'Software is priced per project. Tell us what you want it to do and we will give you a clear quote before any work starts.' },
    { q: 'Can you do everything for a new business?', a: 'Yes — that is what we are best at. Logo, business cards, signage, website, booking and the software to run the counter, all matching and all from one team.' },
    { q: 'How do I get started?', a: 'Send us a message from any page, or call or WhatsApp us. Tell us about your business and what you need, and we will take it from there.' },
  ],
};

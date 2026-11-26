/** Content for the home page. Images are "<section>/<name>" under assets/img. */
import plans from './plans.js';
import print from './print.js';

export default {
  // The two scrolling photo rows under the headline: [image, caption]
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

  // The four things Innovatif does, each with the one number worth remembering.
  doors: [
    { accent: 'print', emoji: '🖨️', big: print.total, label: 'print products, designed and printed for you', href: '/printing', link: 'Explore printing' },
    { accent: 'web', emoji: '🌐', big: plans.websites[0].price, label: 'a month for a professional website', href: '/websites', link: 'See the plans' },
    { accent: 'booking', emoji: '📅', big: '7 days', label: 'to a live online booking system', href: '/booking', link: 'See how it works' },
    { accent: 'software', emoji: '⚙️', big: '100,000+', label: 'products handled by our advanced POS', href: '/software', link: 'Explore software' },
  ],

  // Eight print products for the photo mosaic (the 1st and 6th are shown large).
  mosaic: ['t-shirts', 'business-cards', 'die-cut-stickers', 'posters', 'caps-hats', 'vehicle-wraps', 'custom-boxes', 'neon-signs'],

  why: [
    { emoji: '🤝', title: 'Everything in one place', text: 'Print, website, booking and software from the same team — nothing gets lost between suppliers.' },
    { emoji: '🎨', title: 'A brand that matches', text: 'The same colors, logo and voice on your cards, your van, your website and your checkout screen.' },
    { emoji: '🧾', title: 'Clear quotes, no surprises', text: 'You know the price before any work begins. No hidden extras on the invoice.' },
  ],

  steps: [
    { image: 'general/chat-support', alt: 'A customer asking for a quote by message', title: 'Tell us what you need', text: 'Send a message or give us a call. A rough idea is enough — we’ll ask the right questions.' },
    { image: 'general/design-studio', alt: 'A designer working on a brand identity', title: 'We quote, design and build', text: 'A clear price first. Then a proof or preview for you to approve before anything is final.' },
    { image: 'general/order-pickup', alt: 'A finished order being handed to a customer', title: 'Collect it or go live', text: 'Pick up your order or watch your site go live. We’re still here when you need changes.' },
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

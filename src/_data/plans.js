/**
 * Prices and plan details for websites and the booking system.
 * Edit the numbers or feature lists here and rebuild — the pricing cards,
 * comparison table and the "get started" form all read from this file.
 */
export default {
  websites: [
    {
      id: 'starter',
      name: 'Starter',
      price: '$49.99',
      period: '/month',
      tagline: 'A stunning one-page website',
      ready: 'Ready in 1–2 days',
      features: [
        'Custom one-page design',
        'Looks great on phones, tablets and desktops',
        'Your colors, fonts and photos',
        'Click-to-call and message buttons',
        'Location map and opening hours',
        'Hosting included',
      ],
      bestFor: 'New businesses and anyone who needs to be online, fast.',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$99.99',
      period: '/month',
      tagline: 'A website built to win customers',
      ready: 'Ready in 2–3 days',
      best: true,
      features: [
        'Everything in Starter',
        'Professional copywriting that sells',
        'Premium design that keeps visitors focused',
        'Contact form straight to your inbox',
        'Reviews, QR code and live map add-ons',
        'Set up to be found on search engines',
        'Priority support',
      ],
      bestFor: 'Businesses that want their website to bring in real enquiries.',
    },
  ],

  websiteExtras: [
    { emoji: '📱', title: 'Mobile first', text: 'Most of your visitors are on a phone. Every site is designed there first.' },
    { emoji: '⚡', title: 'Fast to load', text: 'Lightweight pages and optimized images, so nobody leaves before it opens.' },
    { emoji: '🔎', title: 'Built to be found', text: 'Clean structure, titles and descriptions that search engines understand.' },
    { emoji: '🎯', title: 'Made to convert', text: 'Call, WhatsApp and message buttons exactly where customers look for them.' },
    { emoji: '🎨', title: 'On brand', text: 'Your colors, logo and voice — and if you don’t have a logo yet, we design one.' },
    { emoji: '🛡️', title: 'Looked after', text: 'We host it and keep it running. Need a change? Just message us.' },
  ],

  websiteAddons: ['Direct message', 'Click-to-call', 'Live map', 'QR code', 'Customer reviews', 'Photo gallery', 'Live translation', 'Online booking', 'Online ordering', 'Custom domain'],

  websiteFaqs: [
    { q: 'What’s the difference between Starter and Pro?', a: 'Starter is a beautiful one-page site that gets you online quickly. Pro adds professional copywriting, a premium design, a contact form and add-ons such as reviews, a QR code and a live map — it’s built to turn visitors into enquiries, which is why it’s our best offer.' },
    { q: 'How fast can my website be ready?', a: 'Starter sites are typically ready in 1–2 days and Pro sites in 2–3 days, once we have your business details and photos.' },
    { q: 'What do you need from me?', a: 'Your business name, what you offer, contact details, opening hours and any photos or logo you have. If you don’t have a logo or photos, we can help with that too.' },
    { q: 'Do I need to know anything technical?', a: 'No. We design, build and host it. When you want something changed, you message us.' },
    { q: 'Can I add online booking or ordering later?', a: 'Yes. Your site can grow into our booking system or a full ordering system whenever you’re ready.' },
    { q: 'What if I already have a website?', a: 'We can rebuild it, refresh it or move it over. Send us the link and we’ll tell you what we’d improve.' },
  ],

  // ── Booking system ───────────────────────────────────────────────────────
  booking: [
    {
      id: 'starter',
      name: 'Starter',
      price: '$149',
      period: '/month',
      setup: '$497',
      tagline: 'Simple online booking',
      features: ['One-page website', 'Booking form', 'Automated email confirmations', 'Basic business dashboard', 'QR code booking link', 'Contact buttons', 'Basic support', 'Hosting included'],
      bestFor: 'New businesses, solo service providers and very small local businesses.',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$299',
      period: '/month',
      setup: '$997',
      tagline: 'Advanced booking system',
      best: true,
      features: ['Full custom business website', 'Online booking system', 'New booking alerts', 'Business dashboard', 'Mobile stats page', 'Review request system', 'QR code booking link', 'Google Business Profile help', 'Social media launch kit', 'Monthly support and updates'],
      bestFor: 'Mobile detailers, cleaners, barbers, beauty services, home services and appointment-based businesses.',
    },
    {
      id: 'elite',
      name: 'Elite',
      price: '$499',
      period: '/month',
      setup: '$1,997',
      tagline: 'Full premium system',
      features: ['Branded mobile app experience', 'Loyalty or rewards system', 'Referral system', 'Monthly promo updates', 'More automation', 'Priority support', '2 custom promo landing pages', 'Advanced dashboard features', 'Full social media templates'],
      bestFor: 'Established businesses, high-ticket services, businesses with staff and anyone who wants a more premium system.',
    },
  ],

  // true = included, false = not included, text = included with a note.
  bookingCompare: [
    {
      group: 'Website',
      rows: [
        ['Custom website', true, true, true],
        ['Mobile-friendly design', true, true, true],
        ['Contact buttons', true, true, true],
        ['Pages included', 'One page', 'Up to 4', 'Unlimited'],
        ['Custom domain setup', true, true, true],
        ['Professional UI/UX', true, true, true],
      ],
    },
    {
      group: 'Booking system',
      rows: [
        ['Online booking form', true, true, true],
        ['Customer booking requests', true, true, true],
        ['Service selection', true, true, true],
        ['Date / time request', true, true, true],
        ['Customer notes', true, true, true],
        ['Booking confirmation page', true, true, true],
        ['Automated customer emails', true, true, true],
        ['Business booking alerts', true, true, true],
      ],
    },
    {
      group: 'Dashboard',
      rows: [
        ['Business dashboard', 'Basic', true, true],
        ['View new bookings', true, true, true],
        ['Pending bookings', true, true, true],
        ['Completed bookings', true, true, true],
        ['Cancelled bookings', true, true, true],
        ['Customer details', true, true, true],
        ['Booking notes', true, true, true],
        ['Payment status', false, true, true],
        ['Job status tracking', false, true, true],
      ],
    },
    {
      group: 'Mobile stats page',
      rows: [
        ['Phone-friendly stats page', true, true, true],
        ['Total bookings', true, true, true],
        ['Bookings today', true, true, true],
        ['Bookings this month', false, true, true],
        ['Estimated revenue', false, true, true],
        ['Top services', false, true, true],
        ['Repeat customers', false, true, true],
        ['Advanced stats', false, false, true],
      ],
    },
    {
      group: 'Growth tools',
      rows: [
        ['Review request system', false, true, true],
        ['QR code booking link', true, true, true],
        ['Google Business Profile help', false, true, true],
        ['Social media launch kit', false, true, true],
        ['Social media templates', false, true, true],
        ['Customer follow-up', false, true, true],
        ['Customer reactivation campaign', false, true, true],
        ['Referral system', false, false, true],
        ['Loyalty / rewards system', false, false, true],
      ],
    },
    {
      group: 'Support',
      rows: [
        ['Monthly support', 'Basic', true, 'Priority'],
        ['Small monthly updates', '1 / month', '3 / month', 'Unlimited'],
        ['Website changes', 'Basic', true, 'Priority'],
        ['Dashboard updates', false, true, true],
        ['Priority support', false, false, true],
      ],
    },
    {
      group: 'Launch',
      rows: [
        ['7-day launch', true, true, true],
        ['Launch guarantee', true, true, true],
        ['Setup assistance', true, true, true],
        ['Personalized setup', false, true, true],
        ['Premium setup', false, false, true],
      ],
    },
  ],

  bookingProblems: [
    { emoji: '💬', title: 'DMs everywhere', text: 'Messages buried in Instagram, Facebook and texts.' },
    { emoji: '⏳', title: 'Slow replies', text: 'You’re busy working when new leads come in.' },
    { emoji: '🏷️', title: 'No clear pricing', text: 'Customers can’t see your services or what they cost.' },
    { emoji: '🚪', title: 'Missed opportunities', text: 'Interested customers leave before they book.' },
    { emoji: '📉', title: 'No tracking', text: 'No simple way to manage bookings and leads.' },
    { emoji: '👋', title: 'No follow-up', text: 'Repeat customers quietly slip away.' },
  ],

  bookingIncluded: [
    { emoji: '🌐', title: 'Professional website', text: 'A clean, professional website that makes your business look trusted and ready to book.' },
    { emoji: '📅', title: 'Online booking system', text: 'Customers request appointments anytime, without waiting for replies or sending endless messages.' },
    { emoji: '✉️', title: 'Automated emails', text: 'Customers receive professional booking confirmations with all the important details, automatically.' },
    { emoji: '🔔', title: 'Booking alerts', text: 'Get notified when a new customer books, so you never miss an opportunity.' },
    { emoji: '📊', title: 'Business dashboard', text: 'Manage bookings, customers, job status and important details in one simple place.' },
    { emoji: '📱', title: 'Mobile stats page', text: 'Check bookings, completed jobs and estimated revenue from your phone.' },
    { emoji: '⭐', title: 'Review requests', text: 'Collect reviews after completed jobs and build more trust with future customers.' },
    { emoji: '📲', title: 'QR code booking link', text: 'Send people straight to your booking page from flyers, business cards, vehicles or social media.' },
    { emoji: '📍', title: 'Google profile help', text: 'Improve your online presence so more local customers can find and trust your business.' },
    { emoji: '📣', title: 'Social media launch kit', text: 'Announce your new booking system with ready-to-use posts designed to get attention.' },
    { emoji: '🎧', title: 'Monthly support', text: 'Ongoing help, updates and small changes so your system keeps working smoothly.' },
    { emoji: '🖼️', title: 'Social media templates', text: 'Simple branded templates to promote services, offers, reviews and booking reminders.' },
  ],

  bookingSteps: [
    { title: 'Send your business info', text: 'Send your services, prices, photos, hours, contact details and anything customers need to know.' },
    { title: 'We build your system', text: 'We create your website, booking form, automated emails, dashboard and mobile stats page.' },
    { title: 'Launch and get booked', text: 'Your customers get one simple link to view, trust and book your business from their phone.' },
  ],

  bookingFaqs: [
    { q: 'How does this help my business get more bookings?', a: 'We make it easier for customers to choose you. Instead of sending messages back and forth, they can see your services, prices, reviews and booking form in one simple place.' },
    { q: 'How fast can my website and booking system be ready?', a: 'Once we receive your business information, we can have your system ready in 7 days.' },
    { q: 'What do I need to send you to get started?', a: 'Your business name, services, prices, photos, hours, contact details and any social media or Google Business links you already have.' },
    { q: 'Do I need to know anything about technology?', a: 'No. We build everything for you. You get a simple system that is easy to use from your phone or computer.' },
    { q: 'What happens when a customer books?', a: 'The customer submits a booking request, receives an automatic confirmation email, and you receive a booking alert with their details.' },
    { q: 'Can I see my bookings from my phone?', a: 'Yes. You get a mobile-friendly dashboard where you can check bookings, pending requests, completed jobs, cancelled bookings and important business numbers.' },
    { q: 'Can this work for my type of business?', a: 'Yes. It is built for local service businesses like cleaners, detailers, barbers, beauty services, home services, appointment-based businesses and more.' },
    { q: 'Do I get support after launch?', a: 'Yes. Monthly support is included, so you can request small updates, changes and help when needed.' },
    { q: 'Is this just a website?', a: 'No. It is a complete booking system: your website, booking form, email confirmations, business dashboard, mobile stats page, review requests, QR code and launch support.' },
    { q: 'What if I already have a website?', a: 'We can improve your current setup or create a better booking system that helps turn more visitors into customers.' },
    { q: 'Can customers book anytime?', a: 'Yes. Customers can send booking requests anytime from their phone, even when you are busy working or unavailable to reply.' },
    { q: 'What makes this different from just using Instagram or Facebook?', a: 'Instagram and Facebook are good for attention, but they are not booking systems. This gives customers one professional link where they can see everything and book faster.' },
    { q: 'What if I do not have professional photos?', a: 'That is okay. We can start with the photos you have and improve the website over time as you get better images.' },
    { q: 'How do I get started?', a: 'Click “Get started”. Tell us about your business, and we will check availability in your category and town and contact you with the next steps.' },
  ],

  // Options in the "get started" form — the same answers the business has
  // always collected, so existing booking leads keep the same shape.
  bookingForm: {
    businessTypes: ['Cleaner', 'Mobile Detailer', 'Barber', 'Beauty Service', 'Home Service', 'Appointment-Based Business', 'Other'],
    websiteStatus: ['No, I only use social media', 'Yes, but it needs improvement', 'Yes, and I want to add booking', 'Not sure'],
    goals: ['Get more bookings', 'Look more professional', 'Stop losing customers in DMs', 'Track bookings better', 'Collect more reviews', 'Make booking easier for customers'],
    problems: ['Too many DMs', 'Slow replies', 'No clear booking process', 'No website', 'No dashboard', 'Customers ask questions but don’t book', 'I’m not getting enough leads'],
  },
};

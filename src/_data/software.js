/**
 * The software page. `flagship` are the big feature rows, `more` the photo
 * grid underneath, `also` the plain list at the end. Software is priced per
 * project, so there are no prices here — every card leads to call or message.
 */
export default {
  flagship: [
    {
      id: 'pos',
      short: 'Advanced POS',
      name: 'Advanced POS',
      icon: 'cash-register',
      badge: '100,000+ products',
      lead: 'A point of sale that stays fast however big your catalog gets.',
      text: 'Built for busy counters and serious inventories. Ring up sales in seconds, keep stock accurate across every register and see exactly how the day went — with room for 100,000+ products.',
      points: ['Handles 100,000+ products', 'Barcode scanning & instant search', 'Stock updates with every sale', 'Multiple registers & locations', 'Discounts, returns & gift cards', 'Staff logins & end-of-day reports'],
    },
    {
      id: 'restaurant-ordering',
      short: 'Restaurant ordering',
      name: 'Restaurant ordering system',
      icon: 'fork-knife',
      badge: 'Dine-in · Pickup · Delivery',
      lead: 'Take orders online, at the table and at the counter — all in one system.',
      text: 'Customers order from their phone, the kitchen sees it instantly and nobody has to shout across the pass. Your menu, your branding, your customers.',
      points: ['Online ordering for pickup & delivery', 'QR code ordering at the table', 'Kitchen display screens', 'Menus, modifiers & combos', 'Order-ready notifications', 'Sales & best-seller reports'],
    },
    {
      id: 'ai-receptionist',
      short: 'AI receptionist',
      name: 'AI receptionist',
      icon: 'robot',
      badge: 'Answers 24/7',
      lead: 'Never miss a call again — even after hours or when you’re with a customer.',
      text: 'An AI receptionist trained on your business answers calls and messages, handles the common questions, books appointments and passes the important ones straight to you.',
      points: ['Answers calls & messages around the clock', 'Books and reschedules appointments', 'Knows your services, prices & hours', 'Takes messages and sends you a summary', 'Hands over to a person when needed', 'Sounds like your business, not a robot'],
    },
    {
      id: 'custom-software',
      short: 'Tailored software',
      name: 'Tailored-to-your-needs software',
      icon: 'code',
      badge: 'Built around you',
      lead: 'When off-the-shelf doesn’t fit, we build exactly what your business needs.',
      text: 'Tell us how you work today and where it hurts. We design and build software around your process — not the other way round — and stay with you after launch.',
      points: ['Designed around your workflow', 'Web, mobile & desktop', 'Connects to the tools you already use', 'Replaces spreadsheets & paper', 'Grows with your business', 'Ongoing support & updates'],
    },
    {
      id: 'employee-management',
      short: 'Employee management',
      name: 'Employee management software',
      icon: 'users-three',
      badge: 'Schedules · Time clock',
      lead: 'Schedules, time tracking and staff records without the paperwork.',
      text: 'Build the schedule in minutes, let staff clock in from a tablet or phone and have hours ready for payroll without chasing anyone.',
      points: ['Shift scheduling & swaps', 'Clock in / out & timesheets', 'Time-off requests', 'Roles & permissions', 'Payroll-ready hour reports', 'Staff access from their phone'],
    },
    {
      id: 'inventory',
      short: 'Inventory software',
      name: 'Inventory software',
      icon: 'barcode',
      badge: 'Real-time stock',
      lead: 'Know what you have, where it is and when to reorder.',
      text: 'Scan stock in and out, get warned before you run low and see every location in one place — so you stop losing sales to empty shelves.',
      points: ['Barcode scanning', 'Low-stock alerts', 'Multiple locations & warehouses', 'Suppliers & purchase orders', 'Stock counts & adjustments', 'Movement & valuation reports'],
    },
  ],

  more: [
    { id: 'kitchen-display', name: 'Kitchen display systems', icon: 'cooking-pot', text: 'Replace paper tickets with live order screens, timers and status by station.' },
    { id: 'self-order-kiosk', name: 'Self-order kiosks', icon: 'cursor-click', text: 'Let customers order and pay on a touchscreen and keep the queue moving.' },
    { id: 'digital-menu-boards', name: 'Digital menu boards', icon: 'monitor', text: 'Update prices, photos and specials on every screen from one place.' },
    { id: 'crm', name: 'CRM & customer management', icon: 'address-book', text: 'Track every lead, quote and customer conversation from first contact to repeat sale.' },
    { id: 'invoicing', name: 'Invoicing & billing', icon: 'receipt', text: 'Create quotes and invoices, take payments and see who still owes you.' },
    { id: 'delivery-tracking', name: 'Delivery & dispatch', icon: 'truck', text: 'Assign drivers, follow orders on a live map and keep customers updated.' },
    { id: 'loyalty-rewards', name: 'Loyalty & rewards', icon: 'gift', text: 'Digital stamp cards, points and offers that give customers a reason to return.' },
    { id: 'ecommerce', name: 'Online stores', icon: 'shopping-cart', text: 'Sell online with product pages, checkout, order management and shipping labels.' },
    { id: 'mobile-apps', name: 'Mobile apps', icon: 'device-mobile', text: 'Your own branded app for bookings, orders, memberships or your team.' },
    { id: 'analytics', name: 'Dashboards & reporting', icon: 'chart-line-up', text: 'See sales, orders and customers in one live view instead of five spreadsheets.' },
    { id: 'ai-chatbot', name: 'AI chatbots & automation', icon: 'chats-circle', text: 'Answer website and WhatsApp questions instantly and automate the repetitive work.' },
    { id: 'field-service', name: 'Field service management', icon: 'wrench', text: 'Work orders, checklists, routes and sign-off for technicians on the road.' },
  ],

  also: [
    'Table reservations & waitlists', 'Appointment scheduling', 'Customer portals', 'Memberships & subscriptions', 'Queue management',
    'Quotes & estimates', 'Payroll & time tracking', 'Fleet tracking', 'Warehouse management', 'Supplier & purchase orders',
    'School & course management', 'Clinic & patient records', 'Salon & spa software', 'Gym management', 'Property & rental management',
    'Ticketing & events', 'Help desk & support tickets', 'Document automation', 'Payment integrations', 'Accounting integrations',
    'API & system integrations', 'Data migration', 'Barcode & label printing', 'Multi-location management', 'Internal tools & admin panels',
  ],

  industries: ['Retail', 'Restaurants & cafés', 'Salons & barbers', 'Auto services', 'Home services', 'Health & wellness', 'Gyms & studios', 'Wholesale & distribution', 'Real estate', 'Education', 'Hospitality', 'Professional services'],

  steps: [
    { title: 'We listen first', text: 'A short call to understand how you work today and what’s slowing you down.', icon: 'headset' },
    { title: 'A clear plan and quote', text: 'You get the scope, timeline and price in writing before any work begins.', icon: 'note-pencil' },
    { title: 'Built with you', text: 'You see it take shape and try it early, so the finished system fits how you actually work.', icon: 'code' },
    { title: 'Launch and support', text: 'We set it up, train your team and stay on hand for updates and questions.', icon: 'rocket-launch' },
  ],

  faqs: [
    { q: 'How much does software cost?', a: 'It depends on what you need, how many people will use it and what it has to connect to. Call or message us with a short description and we’ll give you a clear quote — no obligation.' },
    { q: 'Can the POS really handle 100,000+ products?', a: 'Yes. It is built for large catalogs, so searching, scanning and ringing up stay fast as your product list grows.' },
    { q: 'Can you work with the hardware and tools I already have?', a: 'In most cases, yes. Tell us what you use today — tills, scanners, printers, accounting or booking tools — and we’ll confirm what can be connected.' },
    { q: 'How long does a project take?', a: 'Smaller systems can be ready in weeks; larger custom builds take longer. You’ll get a timeline with your quote, before you commit to anything.' },
    { q: 'What happens after launch?', a: 'We stay with you. Training, fixes, updates and new features are part of how we work, not an afterthought.' },
    { q: 'I’m not sure what I need. Can you help me figure it out?', a: 'That’s the best place to start. Describe the problem in your own words and we’ll suggest the simplest thing that solves it.' },
  ],
};

/**
 * The printing catalog. Each category becomes a section on /printing and
 * each product a card with its photo.
 *
 * To add a product: drop its photo through `npm run images -- <folder> print`,
 * then add an entry here with the same `id` as the image file name.
 * Products are quoted individually, so there are no prices in this file.
 */
const print = {
  categories: [
    {
      id: 'cards-stationery',
      emoji: '📇',
      title: 'Business cards & stationery',
      short: 'Cards & stationery',
      icon: 'identification-card',
      intro: 'The everyday pieces that make a business look established, from the first handshake to the final invoice.',
      products: [
        {
          id: 'business-cards',
          name: 'Business cards',
          text: 'Standard, square or rounded-corner cards on stocks that feel as good as they look.',
          options: ['Matte, gloss or soft-touch', 'Foil & spot UV', 'Extra-thick stocks'],
        },
        {
          id: 'stationery',
          name: 'Letterheads & envelopes',
          text: 'Matching letterheads, envelopes, compliment slips and notepads for a consistent brand.',
          options: ['Matching sets', 'Printed both sides', 'Custom sizes'],
        },
        {
          id: 'presentation-folders',
          name: 'Presentation folders',
          text: 'Pocket folders that keep quotes, proposals and brochures together and on brand.',
          options: ['Card slots', 'Gloss or matte lamination', 'Foil stamping'],
        },
        {
          id: 'invoice-books',
          name: 'Invoice & receipt books',
          text: 'Carbonless duplicate and triplicate forms, numbered and bound for the job site or counter.',
          options: ['2- or 3-part forms', 'Sequential numbering', 'Pads or bound books'],
        },
        {
          id: 'id-badges-lanyards',
          name: 'ID badges & lanyards',
          text: 'Staff ID cards, name badges and printed lanyards for teams and events.',
          options: ['PVC cards', 'Badge reels', 'Printed lanyards'],
        },
        {
          id: 'gift-loyalty-cards',
          name: 'Gift & loyalty cards',
          text: 'Plastic gift cards, punch cards and membership cards that bring customers back.',
          options: ['Plastic or card stock', 'Card holders', 'Numbering & barcodes'],
        },
      ],
      more: ['Appointment cards', 'Compliment slips', 'Notepads', 'Name tags', 'Certificates', 'Rubber stamps', 'Mailing labels', 'Envelopes in every size'],
    },
    {
      id: 'marketing',
      emoji: '📣',
      title: 'Flyers, brochures & marketing print',
      short: 'Marketing print',
      icon: 'megaphone',
      intro: 'Put your offer in people’s hands, on their doors and on the wall — printed sharp, in any quantity.',
      products: [
        {
          id: 'flyers',
          name: 'Flyers',
          text: 'Bold flyers for promotions, openings and events, from a handful to tens of thousands.',
          options: ['Any size', 'Gloss or matte', 'One or two sides'],
        },
        {
          id: 'brochures',
          name: 'Brochures',
          text: 'Bi-fold, tri-fold and gate-fold brochures that explain what you do at a glance.',
          options: ['Multiple folds', 'Premium papers', 'Design available'],
        },
        {
          id: 'postcards',
          name: 'Postcards & direct mail',
          text: 'Thick, glossy postcards made to land in a mailbox and stay on the fridge.',
          options: ['Mail-ready layouts', 'Rounded corners', 'UV coating'],
        },
        {
          id: 'door-hangers',
          name: 'Door hangers',
          text: 'Reach a whole neighborhood door by door with die-cut hangers that can’t be missed.',
          options: ['Die-cut shapes', 'Tear-off coupons', 'Heavy card stock'],
        },
        {
          id: 'posters',
          name: 'Posters',
          text: 'Vivid posters for windows, walls and events, from letter size up to large format.',
          options: ['Small to oversize', 'Satin or gloss', 'Mounted or framed'],
        },
        {
          id: 'booklets-catalogs',
          name: 'Booklets & catalogs',
          text: 'Stapled, perfect-bound or spiral booklets for products, programs and price guides.',
          options: ['Saddle-stitch or perfect bound', 'Custom page counts', 'Cover upgrades'],
        },
        {
          id: 'menus',
          name: 'Menus',
          text: 'Dine-in, takeout and drinks menus that are easy to read and built to last.',
          options: ['Laminated or wipe-clean', 'Folded takeout menus', 'Matching table tents'],
        },
        {
          id: 'table-tents',
          name: 'Table tents',
          text: 'Promote specials right where customers decide — on the table and at the counter.',
          options: ['Self-standing', 'Double-sided', 'Any quantity'],
        },
        {
          id: 'calendars',
          name: 'Calendars',
          text: 'Wall and desk calendars that keep your name in front of customers all year.',
          options: ['Wall or desk', 'Your photos', 'Branded footer'],
        },
        {
          id: 'invitations',
          name: 'Invitations & cards',
          text: 'Wedding suites, event invitations, thank-you and greeting cards with a premium finish.',
          options: ['Foil & embossing', 'Lined envelopes', 'RSVP sets'],
        },
        {
          id: 'tickets-wristbands',
          name: 'Tickets & wristbands',
          text: 'Numbered tickets, perforated stubs and event wristbands ready for the door.',
          options: ['Perforated stubs', 'Sequential numbering', 'Neon wristbands'],
        },
      ],
      more: ['Rack cards', 'Bookmarks', 'Newsletters', 'Coupons & vouchers', 'Gift certificates', 'Event programs', 'Greeting cards', 'Thank-you cards', 'Placemats', 'Magazines', 'Annual reports', 'Funeral programs'],
    },
    {
      id: 'signs',
      emoji: '🚩',
      title: 'Signs, banners & large format',
      short: 'Signs & banners',
      icon: 'signpost',
      intro: 'Be seen from across the street. Indoor and outdoor signage for storefronts, vehicles, events and job sites.',
      products: [
        {
          id: 'vinyl-banners',
          name: 'Vinyl banners',
          text: 'Weather-ready banners with hems and grommets for openings, sales and events.',
          options: ['Indoor & outdoor', 'Hems & grommets', 'Any size'],
        },
        {
          id: 'rollup-banners',
          name: 'Roll-up banners',
          text: 'Retractable banner stands that set up in seconds for lobbies, shows and pop-ups.',
          options: ['Stand included', 'Carry case', 'Replaceable prints'],
        },
        {
          id: 'yard-signs',
          name: 'Yard signs',
          text: 'Corrugated lawn signs for real estate, contractors, campaigns and events.',
          options: ['Stakes included', 'Single or double sided', 'Bulk runs'],
        },
        {
          id: 'a-frame-signs',
          name: 'A-frame sidewalk signs',
          text: 'Stop foot traffic with a sturdy sidewalk sign and swappable printed panels.',
          options: ['Swappable inserts', 'Weatherproof', 'Double sided'],
        },
        {
          id: 'window-graphics',
          name: 'Window graphics',
          text: 'Full-color window vinyl, frosted film and door lettering for your storefront.',
          options: ['Full-color vinyl', 'Frosted film', 'Hours lettering'],
        },
        {
          id: 'vehicle-wraps',
          name: 'Vehicle wraps & decals',
          text: 'Turn your van, truck or car into advertising that works wherever you drive.',
          options: ['Full or partial wraps', 'Door decals', 'Car magnets'],
        },
        {
          id: 'wall-murals',
          name: 'Wall murals',
          text: 'Custom printed wallcoverings that transform shops, offices, gyms and restaurants.',
          options: ['Any wall size', 'Removable options', 'Matte or satin finish'],
        },
        {
          id: 'floor-graphics',
          name: 'Floor graphics',
          text: 'Non-slip floor decals for directions, promotions and branding underfoot.',
          options: ['Non-slip laminate', 'Custom shapes', 'Indoor & outdoor'],
        },
        {
          id: 'feather-flags',
          name: 'Feather flags',
          text: 'Tall, moving flags that pull attention from the road straight to your door.',
          options: ['Pole & base kits', 'Single or double sided', 'Multiple heights'],
        },
        {
          id: 'backdrops',
          name: 'Backdrops & step-and-repeats',
          text: 'Photo-ready media walls and event backdrops for launches, galas and parties.',
          options: ['Stand included', 'Fabric or vinyl', 'Custom sizes'],
        },
        {
          id: 'trade-show-displays',
          name: 'Trade show displays',
          text: 'Pop-up walls, table covers and counters that make a booth look like a brand.',
          options: ['Pop-up walls', 'Fitted table covers', 'Branded counters'],
        },
        {
          id: 'office-signs',
          name: 'Office & lobby signs',
          text: 'Dimensional lettering, acrylic and metal signs for reception areas and doors.',
          options: ['Acrylic & metal', 'Dimensional letters', 'Door & room signs'],
        },
        {
          id: 'neon-signs',
          name: 'LED neon signs',
          text: 'Custom LED neon in your lettering or logo — a centerpiece customers photograph.',
          options: ['Your text or logo', 'Color choices', 'Wall-mount ready'],
        },
        {
          id: 'canvas-prints',
          name: 'Canvas & photo prints',
          text: 'Gallery-wrapped canvas, framed prints and photo enlargements for any wall.',
          options: ['Gallery wrap', 'Framed prints', 'Large sizes'],
        },
      ],
      more: ['Mesh banners', 'Pole banners', 'Foam board signs', 'PVC & aluminum signs', 'Acrylic signs', 'Real estate signs', 'Parking & safety signs', 'Car magnets', 'Perforated window film', 'Light box prints', 'Billboards', 'Construction hoarding', 'Pop-up tents', 'Wayfinding signs', 'Menu boards', 'Table covers'],
    },
    {
      id: 'stickers',
      emoji: '🏷️',
      title: 'Stickers, labels & vinyl',
      short: 'Stickers & labels',
      icon: 'sticker',
      intro: 'Stick your brand on products, packaging, windows and gear with cuts and finishes made for the job.',
      products: [
        {
          id: 'die-cut-stickers',
          name: 'Die-cut stickers',
          text: 'Durable vinyl stickers cut to the exact shape of your logo or artwork.',
          options: ['Any shape', 'Waterproof vinyl', 'Holographic & clear'],
        },
        {
          id: 'roll-labels',
          name: 'Product labels',
          text: 'Roll labels for jars, bottles, boxes and bags that make products shelf-ready.',
          options: ['On rolls or sheets', 'Paper, vinyl or clear', 'Foil accents'],
        },
        {
          id: 'sticker-sheets',
          name: 'Sticker sheets',
          text: 'Kiss-cut sheets packed with stickers — great for giveaways, kids and merch.',
          options: ['Kiss-cut', 'Multiple designs per sheet', 'Custom sheet sizes'],
        },
        {
          id: 'vinyl-lettering',
          name: 'Vinyl lettering & decals',
          text: 'Clean cut-vinyl lettering for doors, windows, walls, vehicles and equipment.',
          options: ['Opening hours', 'Logos & graphics', 'Many colors'],
        },
        {
          id: 'dtf-transfers',
          name: 'DTF & heat transfers',
          text: 'Full-color transfers ready to press onto shirts, hoodies, bags and more.',
          options: ['Full color', 'Gang sheets', 'Ready to press'],
        },
      ],
      more: ['Bumper stickers', 'Clear stickers', 'Holographic stickers', 'Window clings', 'Wall decals', 'Barcode & QR labels', 'Warning & safety labels', 'Bottle & jar labels', 'Address labels', 'Tamper-evident seals', 'Static clings', 'Helmet & equipment decals'],
    },
    {
      id: 'apparel',
      emoji: '👕',
      title: 'Custom apparel',
      short: 'Apparel',
      icon: 't-shirt',
      intro: 'Shirts, uniforms and merch printed or embroidered with your brand — for your team, your customers or your event.',
      products: [
        {
          id: 't-shirts',
          name: 'T-shirts',
          text: 'Soft, durable tees printed with your logo or design, in every size and color.',
          options: ['Screen print or DTF', 'All sizes', 'No design? We’ll make one'],
        },
        {
          id: 'hoodies',
          name: 'Hoodies & sweatshirts',
          text: 'Heavyweight hoodies and crewnecks your team and customers will actually wear.',
          options: ['Printed or embroidered', 'Pullover or zip', 'Front, back & sleeves'],
        },
        {
          id: 'polos-uniforms',
          name: 'Polos & uniforms',
          text: 'Embroidered polos and work shirts that make your whole team look the part.',
          options: ['Embroidered logos', 'Staff names', 'Matching sets'],
        },
        {
          id: 'caps-hats',
          name: 'Caps & hats',
          text: 'Baseball caps, truckers and beanies finished with flat or raised 3D embroidery.',
          options: ['3D embroidery', 'Truckers & snapbacks', 'Beanies'],
        },
        {
          id: 'aprons',
          name: 'Aprons',
          text: 'Branded aprons for cafés, restaurants, salons, barbers and makers.',
          options: ['Embroidered or printed', 'Bib or waist', 'Durable fabrics'],
        },
        {
          id: 'jerseys',
          name: 'Team jerseys',
          text: 'Fully custom jerseys with names and numbers for teams, leagues and schools.',
          options: ['Names & numbers', 'Full sublimation', 'Any sport'],
        },
        {
          id: 'workwear',
          name: 'Workwear & safety vests',
          text: 'Hi-vis vests, jackets and hard-hat decals so your crew is safe and recognizable.',
          options: ['Hi-vis vests', 'Jackets & coveralls', 'Hard-hat decals'],
        },
        {
          id: 'tote-bags',
          name: 'Tote bags',
          text: 'Reusable printed totes that carry your brand all over town.',
          options: ['Cotton or canvas', 'Full-color print', 'Bulk orders'],
        },
      ],
      more: ['Jackets', 'Beanies', 'Long sleeves', 'Tank tops', 'Kids & baby wear', 'Sweatpants', 'Bandanas', 'Socks', 'Patches', 'Embroidery', 'Screen printing', 'Sublimation'],
    },
    {
      id: 'packaging',
      emoji: '📦',
      title: 'Packaging',
      short: 'Packaging',
      icon: 'package',
      intro: 'Make the unboxing part of the product. Branded packaging for retail, food, e-commerce and gifts.',
      products: [
        {
          id: 'custom-boxes',
          name: 'Custom boxes',
          text: 'Mailer boxes, product boxes and shipping cartons printed inside and out.',
          options: ['Mailer & product boxes', 'Inside printing', 'Custom sizes'],
        },
        {
          id: 'paper-bags',
          name: 'Shopping bags',
          text: 'Paper and boutique bags with rope or ribbon handles and your logo front and center.',
          options: ['Kraft or laminated', 'Rope & ribbon handles', 'Foil logos'],
        },
        {
          id: 'food-packaging',
          name: 'Food packaging',
          text: 'Takeout bags, boxes, cups, sleeves and wraps that make every order look like yours.',
          options: ['Bags & boxes', 'Cups & sleeves', 'Greaseproof wraps'],
        },
        {
          id: 'hang-tags',
          name: 'Hang tags & labels',
          text: 'Swing tags and woven labels that finish clothing and handmade products properly.',
          options: ['Thick textured stocks', 'Foil & embossing', 'Woven labels'],
        },
        {
          id: 'packaging-extras',
          name: 'Tissue, tape & inserts',
          text: 'Branded tissue paper, packing tape, thank-you cards and sticker seals.',
          options: ['Printed tissue', 'Branded tape', 'Thank-you cards'],
        },
      ],
      more: ['Mailer bags', 'Stand-up pouches', 'Pizza boxes', 'Bakery boxes', 'Cup sleeves', 'Bottle neck tags', 'Belly bands', 'Gift boxes', 'Product sleeves', 'Printed ribbon'],
    },
    {
      id: 'promo',
      emoji: '🎁',
      title: 'Promotional products',
      short: 'Promo products',
      icon: 'gift',
      intro: 'Useful things with your name on them — for giveaways, staff gifts, trade shows and loyal customers.',
      products: [
        {
          id: 'mugs',
          name: 'Mugs',
          text: 'Ceramic, enamel and travel mugs printed with your logo or artwork.',
          options: ['Ceramic & enamel', 'Full-wrap printing', 'Gift boxes'],
        },
        {
          id: 'bottles-tumblers',
          name: 'Bottles & tumblers',
          text: 'Insulated bottles, tumblers and shakers, printed or laser engraved.',
          options: ['Laser engraving', 'Full-color print', 'Many colors'],
        },
        {
          id: 'pens',
          name: 'Pens',
          text: 'The giveaway that never goes out of style — printed pens in your colors.',
          options: ['Barrel printing', 'Metal or plastic', 'Bulk quantities'],
        },
        {
          id: 'keychains-pins',
          name: 'Keychains, pins & magnets',
          text: 'Acrylic and metal keychains, button badges, enamel pins and fridge magnets.',
          options: ['Custom shapes', 'Buttons & enamel pins', 'Fridge magnets'],
        },
        {
          id: 'notebooks',
          name: 'Notebooks & journals',
          text: 'Hardcover and spiral notebooks with debossed, foil or full-color covers.',
          options: ['Debossed or foil', 'Hardcover or spiral', 'Matching pens'],
        },
      ],
      more: ['Mouse pads', 'Coasters', 'USB drives', 'Phone grips', 'Umbrellas', 'Drawstring bags', 'Stress balls', 'Air fresheners', 'Bottle openers', 'Power banks', 'Lighters', 'Can coolers', 'Awards & trophies', 'Plaques', 'Lunch bags', 'Lanyards'],
    },
  ],

  // Shown on the home page marquee and highlights.
  featured: [
    'business-cards', 't-shirts', 'vinyl-banners', 'die-cut-stickers', 'posters', 'vehicle-wraps',
    'custom-boxes', 'caps-hats', 'neon-signs', 'roll-labels', 'menus', 'tote-bags',
  ],

  steps: [
    { title: 'Tell us what you need', text: 'Call, WhatsApp or send a message with the product, quantity and deadline. A rough idea is enough to start.', image: 'general/chat-support', icon: 'chat-circle-text' },
    { title: 'Approve your proof', text: 'Send us your artwork or let us design it. You see a proof and sign off before anything is printed.', image: 'general/design-studio', icon: 'pen-nib' },
    { title: 'We print and finish', text: 'Your job is printed, cut, pressed or stitched and checked before it leaves the shop.', image: 'general/large-format-printer', icon: 'printer' },
    { title: 'Ready to collect', text: 'We let you know the moment your order is finished — checked, packed and ready to use.', image: 'general/order-pickup', icon: 'package' },
  ],

  faqs: [
    { q: 'Why are there no prices on the printing pages?', a: 'Print pricing depends on size, material, quantity and finish, so a fixed list would be wrong more often than right. Tell us what you need and we will send you an exact quote.' },
    { q: 'I don’t have a design. Can you make one?', a: 'Yes. We design logos, flyers, signs, shirts and everything else we print. If you have a rough idea, a photo or a competitor you like, that is enough to get started.' },
    { q: 'What files should I send?', a: 'A PDF, AI, EPS or high-resolution PNG is ideal. If you only have a photo or a low-quality logo, send it anyway — we can usually rebuild it.' },
    { q: 'How fast can I get my order?', a: 'It depends on the product and quantity. Tell us your deadline when you get in touch and we will confirm what is possible before you order.' },
    { q: 'Is there a minimum order?', a: 'Most products can be ordered in small quantities, and the price per piece drops as the quantity goes up. Ask us and we will quote a few options.' },
    { q: 'Can you print something that is not on this page?', a: 'Almost certainly. This page shows our most requested products, but if it can be printed, cut, engraved or embroidered, ask us.' },
  ],
};

// Look a product up by its id from any template: print.byId['business-cards']
print.byId = Object.fromEntries(
  print.categories.flatMap((category) => category.products.map((product) => [product.id, { ...product, category: category.id }])),
);

// How many products the page names in total, rounded down to the nearest ten ("140+").
const named = print.categories.reduce((sum, category) => sum + category.products.length + category.more.length, 0);
print.total = `${Math.floor(named / 10) * 10}+`;

// Product names for the scrolling line on the home page.
print.ticker = ['Business cards', 'Flyers', 'Posters', 'Banners', 'T-shirts', 'Hoodies', 'Stickers', 'Labels', 'Vinyl', 'Signs', 'Vehicle wraps', 'Menus', 'Packaging', 'Caps', 'Mugs', 'Tote bags', 'Brochures', 'Neon signs'];

export default print;

#!/usr/bin/env node
/**
 * Builds src/assets/icons.svg — one sprite holding every icon the site uses.
 * Icons come from Phosphor Icons (MIT licence). To add one, put its name in
 * the list below (names as on phosphoricons.com) and run:
 *
 *   node scripts/build-icons.mjs
 *
 * Then use it in a template with {{ ui.icon('name') }}.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const phosphor = path.join(root, 'node_modules', '@phosphor-icons', 'core');

// name            -> regular weight
// name:fill       -> filled weight (id becomes "name-fill")
const icons = `
arrow-right arrow-left arrow-up-right caret-down caret-right check check-circle:fill x plus list
phone phone:fill whatsapp-logo whatsapp-logo:fill chat-circle-text chat-circle-text:fill chats-circle
envelope-simple paper-plane-tilt map-pin clock star:fill sparkle:fill lightning shield-check
printer browser calendar-check code storefront fork-knife robot headset users-three package
barcode chart-line-up receipt device-mobile shopping-cart truck gift monitor wrench cash-register
identification-card t-shirt sticker signpost palette megaphone tag pen-nib image rocket-launch
handshake globe qr-code squares-four cursor-click question timer layout magic-wand translate
credit-card chart-bar key flag-banner stack files cooking-pot address-book user user-circle
users note-pencil trash copy download-simple funnel bell sign-out lock-simple tray gear eye
magnifying-glass warning-circle info circle:fill dots-three-vertical calendar-blank arrow-clockwise
google-logo instagram-logo share-network cube database plugs-connected gauge heart lifebuoy
ruler scissors paint-brush frame-corners bag notebook coffee x-circle link-simple building-office
`.split(/\s+/).filter(Boolean);

const symbols = [];
for (const entry of icons) {
  const [name, weight = 'regular'] = entry.split(':');
  const file = weight === 'regular' ? `${name}.svg` : `${name}-${weight}.svg`;
  const svg = await readFile(path.join(phosphor, 'assets', weight, file), 'utf8');
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
  const id = weight === 'regular' ? name : `${name}-${weight}`;
  symbols.push(`<symbol id="${id}" viewBox="0 0 256 256">${inner}</symbol>`);
}

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n${symbols.join('\n')}\n</svg>\n`;
const out = path.join(root, 'src', 'assets', 'icons.svg');
await writeFile(out, sprite);
console.log(`Wrote ${symbols.length} icons to src/assets/icons.svg (${(sprite.length / 1024).toFixed(1)} KB)`);

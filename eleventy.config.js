import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Eleventy turns the templates in src/ into the plain static site in public/,
 * which is the folder Firebase Hosting serves.
 */
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addPassthroughCopy({ 'src/static': '/' });
  eleventyConfig.addWatchTarget('src/assets/');

  // /assets/css/site.css -> /assets/css/site.css?v=3f2a9c1b, so browsers can
  // cache CSS and JS for a long time and still pick up every change.
  const hashes = new Map();
  eleventyConfig.addFilter('bust', (url) => {
    if (!hashes.has(url)) {
      let hash = 'dev';
      try {
        const file = readFileSync(path.join('src', url));
        hash = createHash('sha1').update(file).digest('hex').slice(0, 8);
      } catch {
        // generated files (config.js) have no source file to hash
      }
      hashes.set(url, hash);
    }
    return `${url}?v=${hashes.get(url)}`;
  });
  eleventyConfig.on('eleventy.before', () => hashes.clear());

  // "Business cards" -> "business-cards"
  eleventyConfig.addFilter('slug', (text) =>
    String(text)
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
  );

  // WhatsApp click-to-chat link with a pre-written first message.
  eleventyConfig.addFilter('whatsapp', (number, text) => {
    const digits = String(number || '').replace(/\D/g, '');
    if (!digits) return '';
    return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  });

  eleventyConfig.addFilter('tel', (number) => `tel:${String(number || '').replace(/[^\d+]/g, '')}`);
  eleventyConfig.addFilter('json', (value) => JSON.stringify(value));
  eleventyConfig.addFilter('limit', (list, count) => list.slice(0, count));

  return {
    dir: { input: 'src', output: 'public', includes: '_includes', data: '_data' },
    templateFormats: ['njk'],
    htmlTemplateEngine: 'njk',
  };
}

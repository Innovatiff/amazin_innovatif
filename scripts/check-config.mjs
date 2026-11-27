#!/usr/bin/env node
/**
 * Runs before every build and stops it, with an explanation, when a setting in
 * src/_data/site.js would leave the checkouts quietly broken once published.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import site from '../src/_data/site.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];

const paymentsUrl = String(site.paymentsUrl || '').trim();
if (paymentsUrl) {
  let address = null;
  try {
    address = new URL(paymentsUrl);
  } catch {
    problems.push(`paymentsUrl ("${paymentsUrl}") is not a web address. It should look like 'https://your-site.netlify.app'.`);
  }
  if (address && address.protocol !== 'https:') {
    problems.push(`paymentsUrl must start with https:// (it is "${paymentsUrl}").`);
  } else if (address && (address.pathname !== '/' || address.search || address.hash)) {
    problems.push(`paymentsUrl should be only the address of the Netlify site, with nothing after it. Use '${address.origin}'.`);
  } else if (address) {
    // The browser only lets the checkout call addresses that firebase.json names.
    const firebase = JSON.parse(await readFile(path.join(root, 'firebase.json'), 'utf8'));
    const policy = firebase.hosting.headers
      .filter((entry) => entry.source === '/@(quote|checkout)/**')
      .flatMap((entry) => entry.headers)
      .find((header) => header.key === 'Content-Security-Policy')?.value ?? '';
    const allowed = (policy.split(';').find((part) => part.trim().startsWith('connect-src')) ?? '').split(/\s+/);
    const covered = allowed.some((entry) => entry === address.origin || (entry.startsWith('https://*.') && address.hostname.endsWith(entry.slice('https://*'.length))));
    if (!covered) {
      problems.push(
        `paymentsUrl is ${address.origin}, but browsers are only allowed to call *.netlify.app from the checkout.\n` +
          `    Open firebase.json, find every "connect-src" that mentions https://*.netlify.app, and add ${address.origin} next to it.`,
      );
    }
  }
}

if (problems.length > 0) {
  console.error('\nThe site was not built, because of a setting in src/_data/site.js:\n');
  for (const problem of problems) console.error(`  • ${problem}\n`);
  process.exit(1);
}

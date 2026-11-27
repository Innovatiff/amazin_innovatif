#!/usr/bin/env node
/**
 * Bundles the payment function (payments/, written in TypeScript) into the one
 * file Firebase runs: payments/dist/index.js. It runs as part of `npm run build`
 * and again before every deploy, so there is never a reason to run it by hand.
 *
 * The tests use loadHandlers() to call the same code directly, without Firebase.
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shared = { bundle: true, platform: 'node', target: 'node22', logLevel: 'warning' };

/** What gets deployed. Firebase's own packages stay outside the bundle: Firebase installs them. */
export async function buildPayments() {
  const outfile = path.join(root, 'payments', 'dist', 'index.js');
  await build({
    ...shared,
    entryPoints: [path.join(root, 'payments', 'index.ts')],
    outfile,
    format: 'cjs',
    external: ['firebase-functions', 'firebase-functions/*', 'firebase-admin', 'firebase-admin/*'],
  });
  return outfile;
}

/** For the tests: the handlers on their own, loaded straight into Node. */
export async function loadHandlers() {
  const outfile = path.join(root, '.cache', 'payments', 'handlers.mjs');
  await mkdir(path.dirname(outfile), { recursive: true });
  await build({ ...shared, entryPoints: [path.join(root, 'payments', 'lib', 'index.ts')], outfile, format: 'esm' });
  // A fresh address each time, so a rebuild is never served from Node's module cache.
  return import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outfile = await buildPayments();
  console.log(`Payment function bundled into ${path.relative(root, outfile)}`);
}

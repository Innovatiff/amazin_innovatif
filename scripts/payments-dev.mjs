#!/usr/bin/env node
/**
 * Runs the payment functions on this computer, at http://127.0.0.1:8787, the way
 * Netlify runs them online. The site uses this address automatically when it is
 * opened from localhost (see designs/src/lib/site.ts).
 *
 *   npm run payments
 *
 * Without HELCIM_API_TOKEN in the environment the functions answer "payments are
 * not set up", exactly as the live ones would. The tests start this server
 * themselves, pointed at a stand-in for Helcim.
 */
import { createServer } from 'node:http';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundle = path.join(root, '.cache', 'payments', 'handlers.mjs');

/** Bundles payments/lib (TypeScript) into one file Node can load, and loads it. */
export async function loadHandlers() {
  await mkdir(path.dirname(bundle), { recursive: true });
  await build({
    entryPoints: [path.join(root, 'payments', 'lib', 'index.ts')],
    outfile: bundle,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    logLevel: 'warning',
  });
  // A fresh address each time, so a rebuild is never served from Node's module cache.
  return import(`${pathToFileURL(bundle).href}?t=${Date.now()}`);
}

/** Starts the functions under /.netlify/functions/<name>, like Netlify does. */
export async function startPayments({ port = 8787, quiet = false } = {}) {
  const lib = await loadHandlers();
  const handlers = {
    'checkout-create': lib.createCheckoutHandler(),
    'checkout-status': lib.createStatusHandler(),
    'checkout-payments': lib.createPaymentsHandler(),
  };

  const server = createServer(async (incoming, outgoing) => {
    try {
      const url = new URL(incoming.url ?? '/', `http://${incoming.headers.host ?? `127.0.0.1:${port}`}`);
      const handler = handlers[url.pathname.replace(/^\/\.netlify\/functions\//, '')];
      if (!handler) {
        outgoing.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
        return;
      }
      const chunks = [];
      for await (const chunk of incoming) chunks.push(chunk);
      const hasBody = !['GET', 'HEAD'].includes(incoming.method ?? 'GET') && chunks.length > 0;
      const response = await handler(
        new Request(url, { method: incoming.method, headers: incoming.headers, body: hasBody ? Buffer.concat(chunks) : undefined }),
      );
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      outgoing.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      console.error(error);
      outgoing.writeHead(500, { 'content-type': 'text/plain' }).end('The payment functions crashed.');
    }
  });

  await new Promise((resolve, reject) => server.once('error', reject).listen(port, '127.0.0.1', resolve));
  if (!quiet) {
    console.log(`Payment functions running at http://127.0.0.1:${port}/.netlify/functions/`);
    console.log(process.env.HELCIM_API_TOKEN ? 'HELCIM_API_TOKEN is set.' : 'HELCIM_API_TOKEN is not set: payments will report "not set up".');
  }
  return { lib, close: () => new Promise((resolve) => server.close(resolve)) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await startPayments({ port: Number(process.env.PORT) || 8787 });
}

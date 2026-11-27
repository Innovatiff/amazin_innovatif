// Starts the Firebase emulators and runs the browser test (e2e.mjs) inside them.
//
//   npm run test:e2e
//
// The payment function runs in the Functions emulator. Before it starts, it is told to
// talk to the tests' stand-in for Helcim instead of the real Helcim, with a made-up token.
// That has to be decided here: the function inherits its settings from the emulators, and
// the emulators inherit theirs from this script.
import { spawn } from 'node:child_process';
import { FAKE_PORT, FAKE_TOKEN } from './fake-helcim.mjs';

const env = {
  ...process.env,
  HELCIM_API_TOKEN: FAKE_TOKEN,
  HELCIM_API_URL: `http://127.0.0.1:${FAKE_PORT}/v2`,
};

// Behind a network proxy, the Firebase tools would send even the emulators' traffic to each
// other (all on this computer) through that proxy, where it fails. The emulators need no
// proxy; the test's browser still does, so it is handed over under another name.
const PROXY_NAMES = ['HTTPS_PROXY', 'https_proxy', 'HTTP_PROXY', 'http_proxy'];
const proxy = PROXY_NAMES.map((name) => process.env[name]).find(Boolean);
if (proxy) {
  env.E2E_BROWSER_PROXY = proxy;
  for (const name of PROXY_NAMES) delete env[name];
}

const child = spawn('npx firebase emulators:exec --project demo-innovatif "node tests/e2e.mjs"', { shell: true, stdio: 'inherit', env });
child.on('exit', (code) => process.exit(code ?? 1));

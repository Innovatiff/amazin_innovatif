import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import site from '../src/_data/site.js'

// The "Designs" part of the manager portal (quotes and checkouts) is a small React app.
// It is built into public/studio/ next to the rest of the site; firebase.json sends
// /portal/designs, /quote/… and /checkout/… to it.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/studio/',
  publicDir: false,
  plugins: [
    react(),
    {
      name: 'site-name',
      transformIndexHtml: (html) => html.replaceAll('__SITE_NAME__', site.name),
    },
  ],
  server: { port: 5173 },
  build: {
    outDir: '../public/studio',
    emptyOutDir: true,
    // The Firebase SDK is one large, cacheable chunk; that is expected.
    chunkSizeWarningLimit: 800,
  },
})

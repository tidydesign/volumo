import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const root = import.meta.dirname
const prototypesDir = resolve(root, 'prototypes')

// Every prototypes/<name>/index.html becomes its own page at /prototypes/<name>/.
// Folders starting with "_" (like _template) are skipped.
const prototypes = Object.fromEntries(
  readdirSync(prototypesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
    .map((entry) => [entry.name, resolve(prototypesDir, entry.name, 'index.html')])
    .filter(([, file]) => existsSync(file)),
)

// Short URLs: /<name> serves prototypes/<name>/ (same as the rewrite in vercel.json).
const shortUrls = {
  name: 'prototype-short-urls',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const match = req.url.match(/^\/([\w-]+)\/?(\?.*)?$/)
      if (match && match[1] in prototypes) req.url = `/prototypes/${match[1]}/${match[2] ?? ''}`
      next()
    })
  },
}

export default defineConfig({
  plugins: [shortUrls],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        ...prototypes,
      },
    },
  },
})

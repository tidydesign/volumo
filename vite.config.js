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

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        ...prototypes,
      },
    },
  },
})

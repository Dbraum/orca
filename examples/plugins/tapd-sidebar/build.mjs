import { cp, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { build } from 'esbuild'

const source = import.meta.dirname
const output = process.argv[2] ? resolve(process.argv[2]) : resolve(source, 'dist')
if (output === source) {
  throw new Error('Choose a separate directory for the installable plugin.')
}

await mkdir(output, { recursive: true })
await Promise.all([
  cp(resolve(source, 'orca-plugin.json'), resolve(output, 'orca-plugin.json')),
  cp(resolve(source, 'README.md'), resolve(output, 'README.md')),
  cp(resolve(source, 'panel'), resolve(output, 'panel'), { recursive: true }),
  build({
    entryPoints: [resolve(source, 'worker/main.ts')],
    outfile: resolve(output, 'worker.mjs'),
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    minify: true,
    legalComments: 'eof'
  })
])
console.log(output)

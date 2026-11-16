// Builds the trial into one self-contained page: dist/index.html.
// One file is easy to publish anywhere, including as a Claude artifact.
// With --relay, writes dist-cloudflare/index.html instead, which connects through
// our own relay (worker/relay.ts) at /ws/ on the same host.
import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const result = await build({
  entryPoints: [join(root, 'src/main.ts')],
  bundle: true,
  format: 'iife',
  target: 'es2022',
  minify: true,
  write: false,
  legalComments: 'none',
});

const script = result.outputFiles[0].text.replaceAll('</script', '<\\/script');
const styles = await readFile(join(root, 'src/styles.css'), 'utf8');
const template = await readFile(join(root, 'src/index.html'), 'utf8');
const relay = process.argv.includes('--relay');
const outDir = relay ? 'dist-cloudflare' : 'dist';
let html = template.replace('/*__STYLES__*/', () => styles).replace('/*__SCRIPT__*/', () => script);
if (relay) html = html.replace('<meta charset="utf-8" />', '<meta charset="utf-8" />\n    <meta name="lace-relay" content="/ws/" />');

await mkdir(join(root, outDir), { recursive: true });
await writeFile(join(root, outDir, 'index.html'), html);
console.log(`Built ${outDir}/index.html (${(html.length / 1024).toFixed(1)} KB)`);

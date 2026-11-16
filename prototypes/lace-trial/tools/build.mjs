// Builds the trial into one self-contained page: dist/index.html.
// One file is easy to publish anywhere, including as a Claude artifact.
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
const html = template.replace('/*__STYLES__*/', () => styles).replace('/*__SCRIPT__*/', () => script);

await mkdir(join(root, 'dist'), { recursive: true });
await writeFile(join(root, 'dist/index.html'), html);
console.log(`Built dist/index.html (${(html.length / 1024).toFixed(1)} KB)`);

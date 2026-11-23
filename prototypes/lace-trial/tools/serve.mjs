// Serves dist/ for local testing. Open the printed address in two tabs to play both sides.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT ?? 5173);

createServer(async (req, res) => {
  try {
    const body = await readFile(join(root, 'index.html'));
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(500).end('Run "npm run build" first.');
  }
  void req;
}).listen(port, () => console.log(`Lace trial on http://localhost:${port}`));

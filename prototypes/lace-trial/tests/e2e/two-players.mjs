// Plays all three trial levels with two phone-sized pages in one browser (local transport),
// and saves screenshots to test-output/. Run "npm run build" first.
// Set CHROME_PATH to use an installed Chrome instead of Playwright's own browser.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = join(root, 'test-output');
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const context = await browser.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, hasTouch: true });
const url = pathToFileURL(join(root, 'dist/index.html')).href;
const [host, guest] = [await context.newPage(), await context.newPage()];
for (const page of [host, guest]) {
  page.on('pageerror', (e) => {
    console.error('Page error:', e.message);
    process.exitCode = 1;
  });
  await page.goto(url);
}

const LEVEL_SIZES = [
  [5, 5],
  [5, 6],
  [5, 7],
];

/** Taps a hole using the same layout maths as the board view. */
async function tapHole(page, levelIndex, x, y) {
  const [cols, rows] = LEVEL_SIZES[levelIndex];
  const box = await page.locator('canvas.board').boundingBox();
  const margin = 1.1;
  const cell = Math.min(box.width / (cols - 1 + margin * 2), box.height / (rows - 1 + margin * 2));
  const ox = (box.width - (cols - 1) * cell) / 2;
  const oy = (box.height - (rows - 1) * cell) / 2;
  await page.mouse.click(box.x + ox + x * cell, box.y + oy + y * cell);
  await page.waitForTimeout(120);
}

const shot = (page, name) => page.screenshot({ path: join(out, `${name}.png`) });
const expectText = async (page, selector, text) => {
  await page.locator(selector, { hasText: text }).first().waitFor({ timeout: 5000 });
};

// Lobby.
await shot(host, '00-lobby');
await host.getByRole('button', { name: 'Start a game' }).click();
const code = (await host.locator('.code-display').textContent()).trim();
await shot(host, '01-waiting');
await guest.locator('.code-input').fill(code);
await guest.getByRole('button', { name: 'Join' }).click();
await expectText(host, '.role-badge', 'You are the Pin');
await expectText(guest, '.role-badge', 'You are the Bobbin');

// Level 1: host is the Pin, guest the Bobbin.
await guest.getByRole('button', { name: 'Point' }).click();
await tapHole(guest, 0, 1, 1);
await host.waitForTimeout(300);
await shot(host, '10-level1-pin-sees-ping');
await shot(guest, '11-level1-bobbin-view');
await tapHole(guest, 0, 4, 1); // a wrong move first: not in line
await expectText(guest, '.notice', 'straight lines');
await tapHole(host, 0, 1, 1);
await tapHole(guest, 0, 1, 1);
await tapHole(guest, 0, 4, 1);
await expectText(host, '.overlay h2', 'Lace made');
await shot(guest, '12-level1-solved');
await host.getByRole('button', { name: 'Next level' }).click();

// Level 2: roles swap.
await expectText(host, '.role-badge', 'You are the Bobbin');
await expectText(guest, '.role-badge', 'You are the Pin');
for (const [x, y] of [
  [0, 3],
  [2, 3],
  [2, 1],
]) {
  await tapHole(guest, 1, x, y);
}
for (const [x, y] of [
  [0, 3],
  [2, 3],
  [2, 1],
  [4, 1],
]) {
  await tapHole(host, 1, x, y);
}
await expectText(guest, '.overlay h2', 'Lace made');
await guest.getByRole('button', { name: 'Next level' }).click();

// Level 3: two pins, reused.
await expectText(host, '.role-badge', 'You are the Pin');
await tapHole(host, 2, 0, 4);
await tapHole(host, 2, 2, 4);
await tapHole(host, 2, 2, 2); // no pins left
await expectText(host, '.notice', 'No pins left');
await shot(host, '30-level3-no-pins-left');
await tapHole(guest, 2, 0, 4);
await tapHole(guest, 2, 2, 4);
await tapHole(host, 2, 0, 4); // take out the pin behind
await tapHole(host, 2, 2, 2);
await tapHole(guest, 2, 2, 2);
await tapHole(guest, 2, 4, 2);
await tapHole(host, 2, 2, 4);
await tapHole(host, 2, 4, 2);
await shot(guest, '31-level3-bobbin-before-last-run');
await tapHole(guest, 2, 4, 0);
await expectText(host, '.overlay h2', 'Trial complete');
await shot(host, '32-trial-complete');

await browser.close();
console.log(process.exitCode ? 'E2E finished with page errors' : 'E2E passed: all three levels solved by two players');

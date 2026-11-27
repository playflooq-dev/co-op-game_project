// Checks the Sound Lab page the way it is used: opened by double-click (file://), in Edge or Chrome without a window.
//   node tools/check.mjs [folder]      (default: this sfx-lab folder; give the unzipped sound-lab folder to check the zip)
// It checks that every sound file loads and plays, that favourites, "not good" and notes are still there after a
// reload, that copy, download and import work, and that the game music starts. It saves pictures at phone and laptop
// size in tools/_shots/. Needs Node 22 or newer.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), LAB = resolve(process.argv[2] || join(HERE, '..'));
const URL0 = pathToFileURL(join(LAB, 'index.html')).href, SHOTS = join(HERE, '_shots'), PORT = 9500 + Math.floor(Math.random() * 400);
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((b) => existsSync(b));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
setTimeout(() => { console.log('FAIL the check took longer than 4 minutes'); try { br.kill(); } catch (e) {} process.exit(1); }, 240000).unref();
let fails = 0; const check = (name, ok, info = '') => { if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${info !== '' ? '   [' + info + ']' : ''}`); return ok; };
const dir = mkdtempSync(join(tmpdir(), 'lab-')), dl = mkdtempSync(join(tmpdir(), 'lab-dl-'));
const br = spawn(exe, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${dir}`, '--window-size=1280,800', '--no-first-run', '--mute-audio', '--autoplay-policy=no-user-gesture-required', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
try {
  let tabs; for (let i = 0; i < 50 && !tabs; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); } catch (e) { await wait(200); } }
  const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl); await new Promise((r) => { ws.onopen = r; });
  let id = 0; const pend = new Map(); ws.onmessage = (m) => { const d = JSON.parse(m.data); if (pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
  const send = (method, params = {}) => new Promise((r) => { const n = ++id; pend.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
  const js = async (e) => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.result && r.result.exceptionDetails) return 'ERROR ' + JSON.stringify(r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description); return r.result && r.result.result ? r.result.result.value : undefined; };
  const open = async () => { await send('Page.navigate', { url: URL0 }); await wait(1200); };
  const shot = async (name, w, h, mobile) => { await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile }); await wait(500); const r = await send('Page.captureScreenshot', { format: 'png' }); mkdirSync(SHOTS, { recursive: true }); writeFileSync(join(SHOTS, name), Buffer.from(r.result.data, 'base64')); };
  await send('Page.enable'); await send('Runtime.enable'); await send('DOM.enable');
  await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dl });
  await open();
  const info = await js(`({ n: SOUND_LAB.scenarios.length, files: SOUND_LAB.scenarios.flatMap((s) => s.takes.filter((t) => t.file && t.status !== 'silent').map((t) => t.file)), cards: document.querySelectorAll('.card').length, credit: document.getElementById('credit').textContent })`);
  check('the page opens from the file, with every scenario as a card', info.cards === info.n && info.n > 0, `${info.cards} cards`);
  check('the credit line is shown', /ElevenLabs \(elevenlabs\.io\), free plan, private testing only/.test(info.credit));
  // every file: load it and play it for a moment
  const res = await js(`(async () => { const bad = []; for (const f of ${JSON.stringify(info.files)}) { const ok = await new Promise((r) => { const a = new Audio(f); a.muted = true; const t = setTimeout(() => r(false), 8000); a.oncanplaythrough = () => { a.play().then(() => { clearTimeout(t); setTimeout(() => { a.pause(); r(a.currentTime > 0); }, 150); }, () => { clearTimeout(t); r(false); }); }; a.onerror = () => { clearTimeout(t); r(false); }; }); if (!ok) bad.push(f); } return bad; })()`);
  check(`every sound file loads and plays (${info.files.length} files)`, Array.isArray(res) && res.length === 0, Array.isArray(res) ? res.slice(0, 5).join(', ') : res);
  // a button: tap to play, tap again to stop
  await js(`document.querySelector('.play:not([disabled])').click()`); await wait(400);
  check('tapping a version plays it', await js(`!!(player.audio && !player.audio.paused && player.btn.classList.contains('on'))`));
  await js(`document.querySelector('.play.on').click()`); await wait(200);
  check('tapping it again stops it', await js(`!player.audio && !document.querySelector('.play.on')`));
  await js(`document.querySelector('.card .btn').click()`); await wait(400);
  check('"Play all" plays the versions one after another', await js(`!!player.queue && !!player.audio`)); await js('stop(); player.queue = null');
  // picks: favourite, not good, notes; then reload
  const first = await js(`([...document.querySelectorAll('.card')].find((c) => c.querySelectorAll('.play:not([disabled])').length === 3) || {}).dataset?.id || null`);
  check('a sound with all three versions to test the picks on', !!first, first);
  if (!first) throw new Error('no sound has three versions yet: the picks cannot be tested');
  await js(`(() => { const c = document.querySelector('.card[data-id="${first}"]'); c.querySelectorAll('.mini.fav')[1].click(); })()`);
  await js(`(() => { const c = document.querySelector('.card[data-id="${first}"]'); c.querySelectorAll('.mini.fav')[0].click(); c.querySelectorAll('.mini.no')[2].click(); const t = c.querySelector('textarea'); t.value = 'too loud at the end'; t.dispatchEvent(new Event('input')); })()`);
  check('only one favourite per sound (choosing A replaces B)', await js(`picks['${first}'].favourite === 'A' && document.querySelectorAll('.card[data-id="${first}"] .mini.fav[aria-pressed=true]').length === 1`));
  await js(`document.getElementById('who').value = 'Tester'; document.getElementById('who').dispatchEvent(new Event('input'))`);
  await open();
  check('after a reload the favourite, the "not good" mark and the note are still there', await js(`(() => { const c = document.querySelector('.card[data-id="${first}"]'); return c.querySelectorAll('.mini.fav')[0].getAttribute('aria-pressed') === 'true' && c.querySelectorAll('.mini.no')[2].getAttribute('aria-pressed') === 'true' && c.querySelector('textarea').value === 'too loud at the end'; })()`));
  check('the progress shows one picked', (await js(`document.getElementById('count').textContent`)).startsWith('1 of'));
  await js(`document.querySelector('[data-filter=done]').click()`);
  check('"Picked" shows only the picked sound', await js(`document.querySelectorAll('.card').length === 1`));
  await js(`document.querySelector('[data-filter=open]').click()`);
  check('"Not picked yet" shows the others', await js(`document.querySelectorAll('.card').length === SOUND_LAB.scenarios.length - 1`));
  await js(`document.querySelector('[data-filter=all]').click()`);
  // copy
  // (a browser without a window has no clipboard: what the page hands to it is caught instead)
  await js(`window.__clip = null; try { Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (t) => { window.__clip = t; } }, configurable: true }); } catch (e) {}`);
  await js(`document.getElementById('copy').click()`); await wait(400);
  const clip = await js(`window.__clip || 'nothing copied'`);
  check('"Copy my picks" copies the picks', /"favourite": "A"/.test(clip || '') && /"who": "Tester"/.test(clip), String(clip).slice(0, 60));
  // download
  await js(`document.getElementById('download').click()`); let file = null;
  for (let i = 0; i < 20 && !file; i++) { await wait(250); file = readdirSync(dl).find((f) => f.endsWith('.json')); }
  const got = file ? JSON.parse(readFileSync(join(dl, file), 'utf8')) : null;
  check('"Download my picks" saves a picks file', got && got.lab === 'sound-lab' && got.picks[first].favourite === 'A' && got.picks[first].rejected.includes('C') && got.picks[first].notes === 'too loud at the end', file || 'no file');
  // import: the same file, as if from the client
  if (got) { got.who = 'Client'; got.picks[first].favourite = 'B'; writeFileSync(join(dl, 'client.json'), JSON.stringify(got)); }
  const doc = await send('DOM.getDocument'); const q = await send('DOM.querySelector', { nodeId: doc.result.root.nodeId, selector: '#importFile' });
  await send('DOM.setFileInputFiles', { nodeId: q.result.nodeId, files: [join(dl, 'client.json')] }); await wait(800);
  check('"Import picks" shows the other person\'s picks on the cards', await js(`(() => { const o = document.querySelector('.card[data-id="${first}"] .others'); return !!o && /Client/.test(o.textContent) && /★ B/.test(o.textContent); })()`));
  check('my own picks are unchanged by the import', await js(`picks['${first}'].favourite === 'A'`));
  // music
  await js(`document.getElementById('music').click()`); await wait(1500);
  check('"Play over game music" plays the game\'s music', await js(`!!(music.audio && !music.audio.paused && music.audio.currentTime > 0)`), await js(`music.audio ? music.audio.src.split('/').slice(-2).join('/') : 'none'`));
  await js(`document.getElementById('music').click()`);
  // pictures
  await shot('lab-laptop.png', 1280, 800, false); await shot('lab-phone.png', 390, 844, true);
  check('at phone size nothing is wider than the screen', await js(`document.documentElement.scrollWidth <= innerWidth + 1`), await js(`document.documentElement.scrollWidth + ' / ' + innerWidth`));
  ws.close();
} catch (e) { fails++; console.log('FAIL ' + (e.stack || e)); }
br.kill(); await wait(500); for (const d of [dir, dl]) { try { rmSync(d, { recursive: true, force: true }); } catch (e) { /* still held */ } }
console.log(fails ? `FAILED ${fails}` : 'PASSED');

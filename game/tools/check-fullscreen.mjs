// Checks full screen with real taps: a script inside a page cannot ask for full screen (the browser only allows it
// straight after a real tap), so this drives Edge or Chrome from outside, through its debugging port, pretending to
// be a phone (a touch screen, held sideways). It checks that:
//   - the start screen asks for full screen on the tap, and gets it
//   - the game opens inside the frame, and full screen stays on from the map into a level
//   - after leaving full screen, the small button shows on the map, and a tap on it brings full screen back
// Needs Node 22 or newer. Start the dev server first (python tools/dev_server.py 8780), then, from the game folder:
//   node tools/check-fullscreen.mjs [width height]       (default 844 390, a phone held sideways)
//   node tools/check-fullscreen.mjs 1920 1080 desktop    a computer: the play button only starts the game
//   node tools/check-fullscreen.mjs 844 390 iphone       a touch screen without full screen for pages, as on an iPhone
// Set SHOT=<folder> to save a picture of the map with the full-screen button.
// It prints one line per check and ends with PASSED or FAILED. It does not prove what a real phone does: a real
// Android phone, iPhone and iPad still have to be tried by hand.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const W = +process.argv[2] || 844, H = +process.argv[3] || 390, DESK = process.argv[4] === 'desktop', IPHONE = process.argv[4] === 'iphone', PORT = 9300 + Math.floor(Math.random() * 600), BASE = process.env.BASE || 'http://127.0.0.1:8780/'; // (BASE=https://<address>/ checks a version on the web)
const BROWSERS = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const exe = BROWSERS.find((b) => existsSync(b));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const check = (name, ok, info = '') => { if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${info !== '' ? '   [' + info + ']' : ''}`); return ok; };

const dir = mkdtempSync(join(tmpdir(), 'fs-check-'));
const browser = spawn(exe, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${dir}`, `--window-size=${W},${H}`, '--no-first-run', '--mute-audio', 'about:blank'], { stdio: 'ignore' });
try {
  let tabs = null; for (let i = 0; i < 50 && !tabs; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); } catch (e) { await wait(200); } }
  const tab = tabs.find((t) => t.type === 'page');
  const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise((r) => { ws.onopen = r; });
  let id = 0; const pending = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
  const send = (method, params = {}) => new Promise((r) => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
  const js = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r.result && r.result.result ? r.result.result.value : undefined; };
  const until = async (expr, max = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < max) { if (await js(`(() => { try { return !!(${expr}); } catch (e) { return false; } })()`)) return true; await wait(150); } return false; };
  const click = async (x, y) => { for (const type of ['mousePressed', 'mouseReleased']) { await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, pointerType: 'mouse' }); await wait(60); } };
  // a finger: touch down, wait, lift. A phone only counts it as the player's own when the finger is lifted, so this
  // catches code that asks for full screen too early (on touch down). On a computer, a mouse click.
  const tap = async (x, y) => { if (DESK) return click(x, y); await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); await wait(90); await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await wait(120); };
  const inner = `document.getElementById('game').contentWindow`;
  const fsOn = `!!(document.fullscreenElement || document.webkitFullscreenElement)`;

  // Does this browser grant full screen at all? Headless Edge and Chrome refuse it for every page. Then a stand-in is
  // used: it acts like full screen (fullscreenElement, fullscreenchange, exitFullscreen), but only when asked straight
  // after a real tap (navigator.userActivation), as a real browser would. What it cannot show is the screen itself
  // changing size, and the browser's own bars going away.
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url: 'data:text/html,<p>probe</p>' }); await wait(500);
  await js(`window.r = 'none'; addEventListener('pointerdown', () => document.documentElement.requestFullscreen().then(() => { r = 'granted'; document.exitFullscreen(); }, (e) => { r = String(e); }))`);
  await click(20, 20); await wait(600);
  const real = (await js('r')) === 'granted';
  console.log(real ? '     this browser grants full screen: the checks use the real thing' : `     this browser refuses full screen to every page (${await js('r')}): the checks use a stand-in that needs a real tap`);
  if (IPHONE) await send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { // as on an iPhone: no full screen for web pages
    for (const k of ['fullscreenEnabled', 'webkitFullscreenEnabled']) Object.defineProperty(Document.prototype, k, { get: () => false, configurable: true });
    Element.prototype.requestFullscreen = undefined; Element.prototype.webkitRequestFullscreen = undefined; try { sessionStorage.asked = ''; } catch (e) {} })();` });
  else if (!real) await send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { if (window !== top) return; let on = null; const fire = () => document.dispatchEvent(new Event('fullscreenchange'));
    Object.defineProperty(Document.prototype, 'fullscreenElement', { get: () => on, configurable: true });
    Object.defineProperty(Document.prototype, 'fullscreenEnabled', { get: () => true, configurable: true });
    Element.prototype.requestFullscreen = function () { if (!navigator.userActivation.isActive) return Promise.reject(new TypeError('not straight after a tap')); on = this; window.__asked = (window.__asked || 0) + 1; try { sessionStorage.asked = 1; } catch (e) {} setTimeout(fire); return Promise.resolve(); };
    Document.prototype.exitFullscreen = function () { on = null; setTimeout(fire); return Promise.resolve(); }; })();` });
  if (!DESK) await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenOrientation: W > H ? { type: 'landscapePrimary', angle: 90 } : { type: 'portraitPrimary', angle: 0 } });
  if (!DESK) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  // a player who has finished the house, so that the game opens the map
  await send('Page.navigate', { url: BASE + 'map.html?reset=1' }); await until(`typeof CHAPTER !== 'undefined'`);
  await js(`CHAPTER.mark('house')`);
  await send('Page.navigate', { url: BASE + 'index.html' });
  check(`the start screen at ${W}x${H}, ${DESK ? 'as a computer' : 'as a touch screen'}`, await until(`typeof START !== 'undefined' && typeof sibs !== 'undefined'`));
  if (DESK || IPHONE) {
    check(DESK ? 'on a computer the frame is not used' : 'a touch screen without full screen: the frame is not used', !(await js('USE_FRAME')) && (await js('TOUCH')) === IPHONE && !(await js('FS.can')) === IPHONE);
    await tap(W / 2, H / 2);
    check(DESK ? 'a click goes straight on to the map with every level open' : 'a tap goes straight on to the map with every level open: the browser bar stays', await until(`location.pathname.replace(/\.html$/, '').endsWith('/map') && location.search === '?unlock=all'`));
    check('and full screen was never asked for', !(await js(`sessionStorage.asked`)) && !(await js(fsOn)));
    throw 'done';
  }
  check('it knows it is on a touch screen, where full screen exists, so it will use the frame', await js(`TOUCH && FS.can && USE_FRAME`), await js(`JSON.stringify({ touch: TOUCH, can: FS.can })`));
  check('not in full screen before the tap', !(await js(fsOn)));
  await tap(W / 2, H / 2); await wait(300);
  check('a real tap: full screen is on', await until(fsOn, 5000));
  check('the screen is held sideways where the browser allows it (here: reported, not required)', true, await js(`screen.orientation ? screen.orientation.type : 'no screen.orientation'`));
  check('the game opens inside the frame, at the map with every level open', await until(`document.getElementById('game') && ${inner}.location.pathname.replace(/\.html$/, '').endsWith('/map') && ${inner}.location.search === '?unlock=all' && ${inner}.eval('[0, 1, 2, 3].every(playable)') && ${inner}.eval('typeof MAP !== "undefined" && MAP.mode === "idle"')`));
  check('the full-screen button is hidden while in full screen', await js(`document.getElementById('fs').hidden`));
  await js(`${inner}.focus()`);
  if (H > W) { // held upright: the map asks for the phone to be turned (its picture covers it). Turn it, as a player would.
    check('held upright, the map shows the "turn your phone" picture', await js(`${inner}.getComputedStyle(${inner}.document.getElementById('turn')).display !== 'none'`));
    await send('Emulation.setDeviceMetricsOverride', { width: H, height: W, deviceScaleFactor: 2, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
    check('turned sideways, the picture goes away', await until(`${inner}.getComputedStyle(${inner}.document.getElementById('turn')).display === 'none'`)); await wait(600);
  }
  const stop = await js(`(() => { const w = ${inner}, s = w.eval('stops()')[3], k = w.eval('S / DPR'); return { x: s.x * k, y: s.y * k }; })()`);
  await tap(stop.x, stop.y); // a finger on the canal's stop, which a new player could not play yet
  check('a tap on any stop plays it: the canal opens', await until(`${inner}.location.pathname.replace(/\.html$/, '').endsWith('/canal')`), JSON.stringify(stop));
  check('full screen stays on in the level', await until(`${inner}.document.readyState === 'complete'`) && await js(fsOn));
  await js(`document.exitFullscreen()`); await wait(500);
  check('full screen left (as with the back gesture): the level goes on', !(await js(fsOn)) && await js(`${inner}.location.pathname.replace(/\.html$/, '').endsWith('/canal') && document.getElementById('fs').hidden`));
  await js(`${inner}.location.href = 'map.html?unlock=all'`);
  check('back on the map, out of full screen: the small button shows', await until(`!document.getElementById('fs').hidden && ${inner}.eval('typeof MAP !== "undefined"')`));
  const box = await js(`(() => { const r = document.getElementById('fs').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await tap(box.x, box.y);
  check('a tap on it: full screen again, and the button hides', await until(fsOn, 5000) && await until(`document.getElementById('fs').hidden`));
  check('the map is still there', await js(`${inner}.location.pathname.replace(/\.html$/, '').endsWith('/map')`));
  if (process.env.SHOT) { await js(`document.exitFullscreen()`); await wait(1500); const r = await send('Page.captureScreenshot', { format: 'png' }); const { writeFileSync } = await import('node:fs'); writeFileSync(join(process.env.SHOT, `map-button-${W}x${H}.png`), Buffer.from(r.result.data, 'base64')); console.log('     picture saved: map-button-' + W + 'x' + H + '.png'); }
  ws.close();
} catch (e) { if (e !== 'done') { fails++; console.log('FAIL ' + (e.stack || e)); } }
browser.kill(); await wait(500); try { rmSync(dir, { recursive: true, force: true }); } catch (e) { /* the browser may still hold it */ }
console.log(fails ? `FAILED ${fails}` : 'PASSED');


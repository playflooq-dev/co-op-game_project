'use strict';
// The start screen (index.html): the two siblings on the forest path, and one big round play button. No words.
// A tap, a click or any key starts the game. In this order, and each step gives up quietly if the browser refuses:
//   1. the sound is woken (browsers only allow sound after a tap), with a small chime
//   2. on a phone or tablet that allows it (Android browsers, iPad): full screen for the whole page
//   3. there too: the screen is held sideways (screen.orientation.lock), where the browser allows that
//   4. the game goes on: for now the map with every level open (OPEN_ALL_LEVELS below); otherwise the house the
//      first time, the chapter map once a game has been started
// Browsers leave full screen whenever a new page opens, and every level is its own page. So when full screen is
// used, this page stays open as a frame around the game, and the map and the levels open inside it (an iframe that
// fills the screen). A computer, an iPhone (which does not allow full screen for web pages) or any browser without
// full screen simply goes on to the next page, exactly as before.
// While the game runs in that frame, the chapter map tells this page that it is showing (shared/chaptermap.js). If
// full screen has been left (the back gesture, for example), a small full-screen button then shows in the map's top
// left corner; a tap on it goes back to full screen.
// FOR TESTING: index.html#frame uses the frame on a computer too (to check it without a phone); #normal: see below.
const game = { sparks: [], queue: [], bubble: null, objective: '' }; let camX = 0; // what shared/stage.js expects of a page
const START = { t: 0, going: false, goT: 0, press: 0 };
const sibs = [makePlayer('sister', 0, 0, 1), makePlayer('brother', 0, 0, -1)];
const FS = (() => { // the full-screen calls, with Safari's older names as a fallback
  const el = document.documentElement, d = document;
  const can = !!((d.fullscreenEnabled || d.webkitFullscreenEnabled) && (el.requestFullscreen || el.webkitRequestFullscreen));
  return {
    can,
    on: () => !!(d.fullscreenElement || d.webkitFullscreenElement),
    ask() { // returns a promise that never rejects; true when full screen was granted
      try {
        const r = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : el.webkitRequestFullscreen();
        return Promise.resolve(r).then(() => true, () => false);
      } catch (e) { return Promise.resolve(false); }
    },
    sideways() { try { const o = screen.orientation; if (o && o.lock) o.lock('landscape').catch(() => {}); } catch (e) { /* not allowed here */ } },
  };
})();
// a phone or tablet: the main pointer is a finger. On a computer the game never asks for full screen.
const TOUCH = (() => { try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } })();
const USE_FRAME = FS.can && (TOUCH || /frame/.test(location.hash));

// ---------- the scenery, made once (the same art as the forest)
const P = (() => {
  const r = rng(424242), rnd = (a, b) => a + r() * (b - a), one = (a) => a[Math.floor(r() * a.length)];
  const L = { clouds: [], mtn: [], far: [], mid: [], near: [] };
  for (let i = 0; i < 6; i++) L.clouds.push({ x: rnd(0, 3000), y: rnd(90, 320), s: rnd(0.6, 1.2), sp: one(SP.clouds) });
  for (let x = -300; x < 4200; x += rnd(300, 480)) L.mtn.push({ sp: one(SP.mountainsBack), x, y: 760, s: rnd(0.72, 0.98), f: r() < 0.5 ? -1 : 1 });
  for (let x = -100; x < 4200; x += rnd(260, 440)) L.mtn.push({ sp: one(SP.mountainsFront), x, y: 765, s: rnd(0.45, 0.66), f: r() < 0.5 ? -1 : 1 });
  for (let x = -200; x < 4200; x += rnd(45, 95)) L.far.push({ sp: one(SP.farPinesBack), x, y: rnd(742, 752), s: rnd(0.5, 0.78), f: r() < 0.5 ? -1 : 1 });
  for (let x = -200; x < 4200; x += rnd(60, 130)) L.far.push({ sp: one(SP.farPinesFront), x, y: rnd(760, 775), s: rnd(0.55, 0.9), f: r() < 0.5 ? -1 : 1 });
  for (let x = -200; x < 4200; x += rnd(95, 185)) { const k = r(); L.mid.push({ sp: one(k < 0.5 ? SP.trees : k < 0.68 ? SP.blossomTrees : k < 0.84 ? SP.pines : SP.bushes), x, y: rnd(786, 802), s: rnd(0.6, 0.9), f: r() < 0.5 ? -1 : 1 }); }
  for (let x = -100; x < 4200; x += rnd(140, 300)) { const k = r(); L.near.push({ sp: one(k < 0.45 ? SP.flowers : k < 0.8 ? SP.bushes : SP.rocks), x, y: 848, s: rnd(0.7, 1), f: r() < 0.5 ? -1 : 1 }); }
  return L;
})();
const sway = (x) => Math.sin(x * 0.004) * 10;
function drawScene(c, t) {
  c.fillStyle = lg(c, 0, 0, 0, 780, '#e6d3a6', '#f3e4bd', '#f9eecf', '#fcf3dc'); c.fillRect(0, 0, VW, VH);
  c.fillStyle = rg(c, VW * 0.8, 30, 820, 'rgba(255,250,222,1)', 'rgba(255,244,200,.6)', 'rgba(255,244,200,0)'); c.fillRect(0, 0, VW, VH);
  for (const cl of P.clouds) { const span = 3400, x = ((cl.x + t * 8) % span + span) % span - 400; if (x < VW + 400) putFast(c, cl.sp, x, cl.y, cl.s); }
  const off = Math.max(0, (2400 - VW) / 2); // (the middle of the scenery stays in the middle of any screen)
  const draw = (list) => { for (const o of list) { const x = o.x - off; if (x < -700 || x > VW + 700) continue; c.save(); c.translate(x, o.y); c.scale(o.f, 1); putFast(c, o.sp, 0, 0, o.s); c.restore(); } };
  draw(P.mtn); c.fillStyle = lg(c, 0, 470, 0, 760, rgba('#fbf2da', 0), rgba('#fbf2da', 0.9)); c.fillRect(0, 470, VW, 300);
  c.fillStyle = lg(c, 0, 730, 0, 800, '#b4cdaa', '#a2c29a'); c.fillRect(0, 734, VW, 400); draw(P.far);
  c.fillStyle = lg(c, 0, 600, 0, 800, rgba(MIST, 0), rgba(MIST, 0.55)); c.fillRect(0, 600, VW, 210);
  c.beginPath(); c.moveTo(0, VH); for (let x = 0; x <= VW + 40; x += 40) c.lineTo(x, 772 + sway(x)); c.lineTo(VW + 40, VH); c.fillStyle = lg(c, 0, 760, 0, 860, '#a8ca78', '#8db562'); c.fill();
  draw(P.mid);
  c.beginPath(); c.moveTo(0, VH); for (let x = 0; x <= VW + 40; x += 40) c.lineTo(x, 840 + sway(x + 300) * 0.5); c.lineTo(VW + 40, VH); c.fillStyle = lg(c, 0, 830, 0, VH, '#a6ca66', '#8bb357', '#6b9648', '#507a3c'); c.fill();
  c.beginPath(); c.moveTo(0, 900); for (let x = 0; x <= Math.ceil((VW + 40) / 40) * 40; x += 40) c.lineTo(x, 900 + Math.sin(x * 0.003) * 8); for (let x = Math.ceil((VW + 40) / 40) * 40; x >= 0; x -= 40) c.lineTo(x, 990 + Math.sin(x * 0.003) * 8); c.closePath(); c.fillStyle = lg(c, 0, 900, 0, 990, '#e2c98f', '#efdba6', '#dcc186'); c.fill();
  draw(P.near);
}
// the play button: a big round button with a triangle, breathing gently; it sinks a little when pressed
const fit = () => clamp(VW / 1500, 0.55, 1); // on a narrow screen (a phone held upright) the button and the siblings come closer together
const button = () => ({ x: VW / 2, y: 520 - 50 * fit(), r: 150 * fit() });
function drawButton(c, t) {
  const b = button(), k = (1 + Math.sin(t * 2.6) * 0.035) * (1 - START.press * 0.08) * fit();
  c.save(); c.translate(b.x, b.y); c.scale(k, k); b.r = 150;
  for (let i = 0; i < 2; i++) { const u = (t * 0.5 + i * 0.5) % 1; c.beginPath(); circ(c, 0, 0, b.r + 16 + u * 70); c.strokeStyle = `rgba(255,246,210,${0.5 * (1 - u)})`; c.lineWidth = 8; c.stroke(); } // rings that ripple out
  soft(c, 0, b.r + 26, b.r * 0.8, 18, '#2a1a0e', 0.3);
  c.beginPath(); circ(c, 0, 8, b.r); c.fillStyle = '#4f7a34'; c.fill();
  c.beginPath(); circ(c, 0, 0, b.r); c.fillStyle = rg(c, -40, -50, b.r * 1.4, '#9fca6a', '#7aa84e', '#5f8c3c'); c.fill(); c.strokeStyle = INK; c.lineWidth = 7; c.stroke();
  c.beginPath(); c.ellipse(-30, -70, 70, 30, -0.4, 0, TAU); c.fillStyle = 'rgba(255,255,240,.22)'; c.fill();
  c.beginPath(); c.moveTo(-38, -62); c.lineTo(64, 0); c.lineTo(-38, 62); c.closePath(); c.lineJoin = 'round'; c.fillStyle = '#fffbf0'; c.fill(); c.strokeStyle = INK; c.lineWidth = 6; c.stroke();
  c.restore();
}

// ---------- starting
let frame = null, onMap = false;
// FOR THE TRIALS WITH THE CLIENT (asked for on 2026-11-27): the play button opens the map with every level open
// (map.html?unlock=all, the test view: it saves nothing). Set OPEN_ALL_LEVELS to false for the real game: then a new
// player goes to the house and a returning one to the map, as before. (index.html#normal does that for one visit.)
const OPEN_ALL_LEVELS = true;
const nextPage = () => {
  if (OPEN_ALL_LEVELS && !/normal/.test(location.hash)) return 'map.html?unlock=all';
  let started = false; try { started = CHAPTER.started(); } catch (e) { started = false; } return started ? 'map.html' : 'house.html';
};
function go() {
  if (START.going) return; START.going = true; START.press = 1;
  try { wakeSound(); sfx('good'); } catch (e) { /* no sound here: the levels wake it again on their first tap */ }
  for (const p of sibs) p.cheer = CHEER;
  if (!USE_FRAME) { setTimeout(() => location.assign(nextPage()), 450); return; } // a computer, an iPhone, or no full screen: no frame
  FS.ask().then((ok) => { if (ok) FS.sideways(); }); // (asked at once: browsers only allow it straight after the tap)
  setTimeout(openFrame, 350);
}
function openFrame() {
  frame = document.createElement('iframe');
  frame.id = 'game'; frame.title = 'Treasure Hunt'; frame.allow = 'fullscreen; autoplay';
  frame.src = nextPage(); document.body.appendChild(frame);
  frame.addEventListener('load', () => { // a new page in the frame: it is the map only if the map says so
    onMap = false; showFsBtn();
    try { frame.contentWindow.postMessage({ mapAsk: true }, '*'); } catch (e) { /* fine */ }
    try { frame.contentWindow.focus(); } catch (e) { /* the keys still work after a tap */ }
  });
  START.stop = true; // the start screen's drawing stops; the frame covers it
}
addEventListener('keydown', (e) => { if (!e.repeat && e.code !== 'KeyM' && !START.going) go(); });
// A tap anywhere starts (little hands miss buttons). It must be 'click', not 'pointerdown': phones only count a touch
// as the player's own (and so only allow full screen) when the finger is lifted. A pointerdown from a finger is refused.
addEventListener('click', (e) => { if (e.target !== fsBtn && !(fsBtn && fsBtn.contains(e.target))) go(); });

// ---------- the small full-screen button over the map, when the game runs in the frame
const fsBtn = document.getElementById('fs');

function showFsBtn() { if (fsBtn) fsBtn.hidden = !(frame && onMap && FS.can && !FS.on()); }
addEventListener('message', (e) => { if (frame && e.source === frame.contentWindow && e.data && typeof e.data.map === 'boolean') { onMap = e.data.map; showFsBtn(); } });
for (const ev of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(ev, showFsBtn);
if (fsBtn) fsBtn.addEventListener('click', () => { FS.ask().then((ok) => { if (ok) FS.sideways(); showFsBtn(); try { frame.contentWindow.focus(); } catch (e) { /* fine */ } }); });

// ---------- every frame
let last = performance.now();
function frameLoop(now) {
  if (START.stop) return;
  const dt = Math.min(0.05, (now - last) / 1000), t = now / 1000; last = now; START.t += dt; START.press = Math.max(0, START.press - dt * 3);
  const c = ctx, b = button(); c.setTransform(S, 0, 0, S, 0, 0); c.globalAlpha = 1;
  drawScene(c, t);
  const f = fit(); const gap = Math.min(290 * f, VW / 2 - 90); sibs[0].x = b.x - gap; sibs[1].x = b.x + gap; sibs[0].y = sibs[1].y = 945; sibs[0].scale = sibs[1].scale = 0.6 + 0.4 * f; sibs[0].dir = 1; sibs[1].dir = -1; // either side of the button, looking at it
  sibs.forEach((p, i) => animate(p, sibs[1 - i], false, dt));
  for (const p of sibs) drawChar(p, t);
  c.setTransform(S, 0, 0, S, 0, 0); drawButton(c, t);
  if (START.going) { c.fillStyle = `rgba(28,18,10,${Math.min(1, START.t > 0 ? (START.goT += dt) * 2.4 : 0)})`; c.fillRect(0, 0, VW, VH); }
  requestAnimationFrame(frameLoop);
}
addEventListener('resize', resizeScreen); resizeScreen();
requestAnimationFrame((tm) => { last = tm; frameLoop(tm); });

'use strict';
// The play code every level shares: the screen, keyboard and touch input, drawing the characters with their lighting,
// speech bubbles, button hints over heads, the goal card and sparkles.
// A level script (worlds/<world>/level.js) is loaded after this and defines:
//   game     { queue: [], bubble: null, sparks: [], objective: '', objT: 0, ... }   the level's state
//   players  [sister, brother]                                                       made with makePlayer()
//   camX     where the camera's left edge is, in scene units
// and optionally drawCarried(p, k, t) to draw what a character is holding.
// Everything is measured in scene units: the view is always 1080 units tall.
const VH = 1080, HC = 0.92, SPEED = 170, CHEER = 1.1;
const QS = new URLSearchParams(location.search);
const ZOOM = Math.max(1, +QS.get('zoom') || 1); // ?zoom=3 looks closer at the characters
const FORCE = QS.get('face'); // ?face=worried|close|giggle|sleepy|yawn|cheer holds one expression (used by shared/characters/shared.js)
const STAGE = QS.get('stage'); // for testing: jumps ahead in a level (each level lists its stages)
const SKIP = QS.get('skip') || STAGE; // ?skip=1 skips the chapter card and opening chat
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const DPR = Math.min(devicePixelRatio || 1, 2);
const BW = 380, BH = 420, BAX = 190, BAY = 392; // character buffer, in scene units
const mkBuf = () => { const b = document.createElement('canvas'); return { cv: b, c: b.getContext('2d') }; };
const buf = mkBuf(), rim = mkBuf();
let S = 1, VW = 1920, CS = 1;

// ---------- art
function put(c, s, x, y, sc = 1, flip = 1, rot = 0) {
  if (flip === 1 && !rot) { c.drawImage(s.cv, x - s.ax * sc, y - s.ay * sc, s.w * sc, s.h * sc); return; }
  c.save(); c.translate(x, y); if (rot) c.rotate(rot); c.scale(sc * flip, sc); c.drawImage(s.cv, -s.ax, -s.ay, s.w, s.h); c.restore();
}
function texture(c, s) { const p = c.createPattern(s.cv, 'repeat'); p.setTransform(new DOMMatrix().scale(s.w / s.cv.width)); return p; }
const H = (name) => SP[name][0];
// Faster drawing for big pictures that are always drawn at the same size: each picture is resized once to the
// screen's resolution and kept, so every frame is a plain copy instead of a resize. Falls back to put() when zoomed in.
function scaledCopy(s, k) {
  const key = Math.round(k * 100); s._sc = s._sc || new Map();
  let cvs = s._sc.get(key);
  if (!cvs) { cvs = document.createElement('canvas'); cvs.width = Math.max(1, Math.round(s.w * k)); cvs.height = Math.max(1, Math.round(s.h * k)); const g = cvs.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(s.cv, 0, 0, cvs.width, cvs.height); s._sc.set(key, cvs); }
  return cvs;
}
function putFast(c, s, x, y, sc = 1, k = S) { // k: the scale the canvas is painted at (normally the screen's)
  if (ZOOM > 1) { put(c, s, x, y, sc); return; }
  c.drawImage(scaledCopy(s, k * sc), x - s.ax * sc, y - s.ay * sc, s.w * sc, s.h * sc);
}
function textureFast(c, s) { // a repeating texture, resized once to the screen's resolution
  if (ZOOM > 1) return texture(c, s);
  const key = Math.round(S * 100); s._pat = s._pat || new Map();
  let p = s._pat.get(key); if (!p) { p = c.createPattern(scaledCopy(s, S), 'repeat'); p.setTransform(new DOMMatrix().scale(1 / S)); s._pat.set(key, p); }
  return p;
}

// ---------- the two players
const SIBLINGS = {
  sister: { name: 'Sister', col: '#6d7b45', keys: { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS' }, glyph: ['W', 'S'], draw: drawSister, face: FACE_A, stride: 20, headH: 250 },
  brother: { name: 'Brother', col: '#4b78a0', keys: { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' }, glyph: ['↑', '↓'], draw: drawBrother, face: FACE_B, stride: 18, headH: 205 },
};
function makePlayer(who, x, y, dir) {
  return Object.assign({}, SIBLINGS[who], { x, y, dir, phase: 0, m: 0, blink: 2 + Math.random() * 2, ex: newExpr(SIBLINGS[who].face), t: 0, idle: 0, gaze: 'ahead', gazeT: 1, gigT: 1.5, giggle: 0, yawn: 0, yawnT: 4, cheer: 0, climb: null, inside: false, alpha: 1, scale: 1 });
}

// ---------- input
const down = {}, was = {};
addEventListener('keydown', (e) => { down[e.code] = true; if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault(); });
addEventListener('keyup', (e) => { down[e.code] = false; });
addEventListener('blur', () => { for (const k in down) down[k] = false; });
document.querySelectorAll('.pad button').forEach((b) => {
  const k = b.dataset.k;
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); down[k] = true; });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, () => { down[k] = false; }));
});
const hit = (code) => down[code] && !was[code];
function endInput() { for (const c in down) was[c] = down[c]; }

// ---------- talking, goals and sparkles
function say(who, text, dur) { game.queue.push({ who, text, dur: dur || Math.max(2.4, text.length * 0.065) }); }
function sayNow(who, text, dur) { game.queue = []; game.bubble = { who, text, dur: dur || Math.max(2.4, text.length * 0.065), t: 0 }; }
function objective(text) { game.objective = text; game.objT = 0; }
function burst(x, y, n = 8) { for (let k = 0; k < n; k++) game.sparks.push({ x: x + (Math.random() - 0.5) * 140, y: y - Math.random() * 120, vy: -20 - Math.random() * 30, life: 1, r: 7 + Math.random() * 8, rot: Math.random() * 3, d: Math.random() * 0.35 }); }
function star(c, x, y, r, rot, a) { c.save(); c.translate(x, y); c.rotate(rot); c.globalAlpha = a; c.fillStyle = '#fff6c2'; c.beginPath(); for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.moveTo(0, 0); c.quadraticCurveTo(r * 0.22, -r * 0.22, 0, -r); c.quadraticCurveTo(-r * 0.22, -r * 0.22, 0, 0); } c.fill(); c.restore(); }
function updateTalk(dt) {
  if (game.bubble) { game.bubble.t += dt; if (game.bubble.t > game.bubble.dur) game.bubble = null; }
  if (!game.bubble && game.queue.length) { game.bubble = game.queue.shift(); game.bubble.t = 0; }
  for (let i = game.sparks.length - 1; i >= 0; i--) { const s = game.sparks[i]; if (s.d > 0) { s.d -= dt; continue; } s.life -= dt * 1.3; s.y += s.vy * dt; s.rot += dt * 2; if (s.life <= 0) game.sparks.splice(i, 1); }
  game.objT = (game.objT || 0) + dt;
}
function drawSparks(c) { for (const s of game.sparks) if (s.d <= 0) star(c, s.x, s.y, s.r * Math.sin(Math.PI * Math.min(1, s.life * 1.2)), s.rot, Math.min(1, s.life * 2)); }

// ---------- walking: moves a player along x between lo and hi, and animates the legs
function walk(p, dir, lo, hi, dt, speed = SPEED) {
  let moving = false;
  if (dir) { p.dir = dir; const nx = Math.max(lo, Math.min(hi, p.x + dir * speed * dt)); moving = nx !== p.x; p.x = nx; }
  return moving;
}
function animate(p, other, moving, dt) {
  p.m += ((moving ? 1 : 0) - p.m) * Math.min(1, dt * 9);
  if (moving) p.phase += dt * Math.PI * (SPEED / HC) / (2 * p.stride);
  p.cheer = Math.max(0, p.cheer - dt);
  updateExpr(p, other, dt, 5000);
}

// ---------- drawing the characters, with a soft light from the upper right and a bright rim
function lightChar() {
  const c = buf.c, W = buf.cv.width, Hh = buf.cv.height, r = rim.c;
  c.setTransform(1, 0, 0, 1, 0, 0); r.setTransform(1, 0, 0, 1, 0, 0);
  r.globalCompositeOperation = 'copy'; r.drawImage(buf.cv, 0, 0);
  r.globalCompositeOperation = 'source-in'; r.fillStyle = '#fff2c2'; r.fillRect(0, 0, W, Hh);
  r.globalCompositeOperation = 'destination-out'; r.drawImage(buf.cv, -2.4 * CS, 2 * CS);
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = lg(c, W * 0.75, Hh * 0.15, W * 0.3, Hh * 0.95, 'rgba(255,228,170,.12)', 'rgba(255,228,170,0)', 'rgba(60,35,30,.24)'); c.fillRect(0, 0, W, Hh);
  c.globalAlpha = 0.4; c.drawImage(rim.cv, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
}
function drawChar(p, t) {
  const u = 1 - p.cheer / CHEER, hop = p.cheer > 0 ? Math.abs(Math.sin(u * TAU)) * 14 * (1 - u * 0.5) : 0;
  const sx0 = p.x - BAX, sy0 = p.y - BAY - hop, c = buf.c, k = HC * p.scale;
  p.t = t;
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.clearRect(0, 0, buf.cv.width, buf.cv.height);
  c.setTransform(CS * k * p.dir, 0, 0, CS * k, BAX * CS, BAY * CS); c.lineCap = 'round'; c.lineJoin = 'round';
  p.draw(c, p, t);
  lightChar();
  ctx.globalAlpha = p.alpha;
  if (!p.climb && !p.noShadow) soft(ctx, p.x - 3 * p.dir, p.y + 2, 46 - hop, 8, '#2a1a0e', 0.4 - hop * 0.008);
  ctx.drawImage(buf.cv, sx0, sy0, BW, BH);
  if (typeof drawCarried === 'function') drawCarried(p, k, t);
  ctx.globalAlpha = 1;
}
function resizeScreen() {
  cv.width = Math.round(innerWidth * DPR); cv.height = Math.round(innerHeight * DPR);
  cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
  S = cv.height / VH; VW = cv.width / S; CS = Math.min(3, S * ZOOM);
  for (const b of [buf, rim]) { b.cv.width = Math.ceil(BW * CS); b.cv.height = Math.ceil(BH * CS); }
}

// ---------- words on screen
function wrap(c, text, maxW) {
  const words = text.split(' '), lines = []; let line = '';
  for (const w of words) { const tryL = line ? line + ' ' + w : w; if (c.measureText(tryL).width > maxW && line) { lines.push(line); line = w; } else line = tryL; }
  if (line) lines.push(line); return lines;
}
function bubbleAt(c, x, y, text, col, alpha) {
  c.save(); c.globalAlpha = alpha; c.font = '600 19px Georgia, serif';
  const lines = wrap(c, text, 330), w = Math.max(...lines.map((l) => c.measureText(l).width)) + 34, h = lines.length * 25 + 22;
  const bx = Math.max(10 + camX, Math.min(camX + VW - w - 10, x - w / 2)), by = y - h - 18;
  c.fillStyle = 'rgba(40,25,15,.25)'; rrect(c, bx + 3, by + 5, w, h, 16); c.fill();
  c.beginPath(); c.roundRect(bx, by, w, h, 16); c.moveTo(x - 12, by + h - 1); c.lineTo(x, by + h + 16); c.lineTo(x + 12, by + h - 1);
  c.fillStyle = '#fffbf0'; c.fill(); c.strokeStyle = col; c.lineWidth = 3; c.stroke();
  c.fillStyle = '#3a2618'; c.textBaseline = 'top'; lines.forEach((l, i) => c.fillText(l, bx + 17, by + 12 + i * 25));
  c.restore();
}
function hintAt(c, x, y, glyph, text, col) {
  c.save(); c.font = '600 16px Georgia, serif'; const w = c.measureText(text).width + 50, bx = x - w / 2, by = y - 36;
  rrect(c, bx, by, w, 32, 10); c.fillStyle = 'rgba(30,20,12,.72)'; c.fill();
  rrect(c, bx + 5, by + 5, 24, 22, 6); c.fillStyle = col; c.fill(); c.strokeStyle = '#fff6dc'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 14px Georgia, serif'; c.fillText(glyph, bx + 17, by + 17);
  c.textAlign = 'left'; c.font = '600 16px Georgia, serif'; c.fillStyle = '#fff6dc'; c.fillText(text, bx + 36, by + 17);
  c.restore();
}
function parchment(c, x, y, w, h) {
  c.fillStyle = 'rgba(20,12,6,.35)'; rrect(c, x + 6, y + 10, w, h, 12); c.fill();
  c.beginPath(); for (let i = 0; i <= 20; i++) c.lineTo(x + w * i / 20, y + Math.sin(i * 2.3) * 3); for (let i = 0; i <= 14; i++) c.lineTo(x + w + Math.sin(i * 1.7) * 3, y + h * i / 14); for (let i = 20; i >= 0; i--) c.lineTo(x + w * i / 20, y + h + Math.sin(i * 1.9) * 3); for (let i = 14; i >= 0; i--) c.lineTo(x + Math.sin(i * 2.1) * 3, y + h * i / 14); c.closePath();
  c.fillStyle = rg(c, x + w / 2, y + h / 2, w * 0.7, '#f8ebc6', '#efd9a2', '#d9b977'); c.fill(); c.strokeStyle = '#8a6a3a'; c.lineWidth = 2; c.stroke();
}
function drawBubble(c) {
  if (!game.bubble) return;
  const b = game.bubble, p = b.who, a = Math.min(1, b.t * 6, (b.dur - b.t) * 4 + 0.2);
  bubbleAt(c, p.x, p.y - p.headH * HC * p.scale - 6, b.text, p.col, Math.max(0, a));
}
function drawGoal(c, label = 'GOAL') {
  if (!game.objective || game.done) return;
  const x = camX + 24, y = 22; c.save(); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.globalAlpha = Math.min(1, game.objT * 3); c.font = '600 19px Georgia, serif'; const w = c.measureText(game.objective).width + 120;
  rrect(c, x, y, w, 48, 12); fs(c, 'rgba(255,248,230,.94)', '#8a6a3a', 2); c.fillStyle = '#8a5a2a'; c.font = 'italic 700 15px Georgia, serif'; c.fillText(label, x + 18, y + 30);
  c.fillStyle = '#3a2618'; c.font = '600 19px Georgia, serif'; c.fillText(game.objective, x + 76, y + 31);
  if (game.objT < 1.2) { c.globalAlpha = (1.2 - game.objT) * 0.6; rrect(c, x - 4, y - 4, w + 8, 56, 14); c.strokeStyle = '#fff3b8'; c.lineWidth = 4; c.stroke(); }
  c.restore();
}
function chapterCard(c, left, remaining, total, small, title, line) {
  const a = Math.min(1, remaining / 0.8); c.fillStyle = `rgba(28,18,10,${a})`; c.fillRect(left - 10, 0, VW + 20, VH);
  const ta = Math.min(1, (total - remaining) * 1.5) * Math.min(1, remaining / 0.8); c.save(); c.globalAlpha = ta; c.textAlign = 'center'; c.fillStyle = '#e9c98a';
  c.font = 'italic 30px Georgia, serif'; c.fillText(small, left + VW / 2, VH / 2 - 40); c.fillStyle = '#fbf0d4'; c.font = 'italic 700 72px Georgia, serif'; c.fillText(title, left + VW / 2, VH / 2 + 40);
  c.font = 'italic 22px Georgia, serif'; c.fillStyle = '#c9b48a'; c.fillText(line, left + VW / 2, VH / 2 + 100); c.restore();
}

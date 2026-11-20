'use strict';
// The game itself: builds the scene from the loaded art, moves the characters, draws every frame.
// Everything is measured in "scene units": the view is always 1080 units tall, width follows the window.
const VH = 1080, WORLD = 7600, SPEED = 185, CHAR = 1.3, CHEER = 1.1;
const QS = new URLSearchParams(location.search);
const ZOOM = Math.max(1, +QS.get('zoom') || 1); // ?zoom=3 inspects the characters
const FORCE = QS.get('face'); // ?face=worried|close|giggle|sleepy|yawn|cheer holds one expression, for checking the art
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const DPR = Math.min(devicePixelRatio || 1, 2);
const BW = 380, BH = 420, BAX = 190, BAY = 392; // character buffer, in art pixels
const mkBuf = () => { const b = document.createElement('canvas'); return { cv: b, c: b.getContext('2d') }; };
const buf = mkBuf(), rim = mkBuf();
let S = 1, VW = 1920, CS = 1;
function resize() {
  cv.width = Math.round(innerWidth * DPR); cv.height = Math.round(innerHeight * DPR);
  cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
  S = cv.height / VH; VW = cv.width / S; CS = Math.min(3, S * ZOOM);
  for (const b of [buf, rim]) { b.cv.width = Math.ceil(BW * CS); b.cv.height = Math.ceil(BH * CS); }
}
addEventListener('resize', resize); resize();

const pathY = (x) => 938 + Math.sin(x * 0.0017) * 8 + Math.sin(x * 0.0041) * 4;
const grassTop = (x) => 836 + Math.sin(x * 0.005) * 6;
const pathTop = (x) => pathY(x) - 50 + Math.sin(x * 0.013) * 4;
const pathBot = (x) => pathY(x) + 52 + Math.sin(x * 0.009 + 1) * 5;

function put(c, s, x, y, sc = 1, flip = 1, rot = 0) {
  if (flip === 1 && !rot) { c.drawImage(s.cv, x - s.ax * sc, y - s.ay * sc, s.w * sc, s.h * sc); return; }
  c.save(); c.translate(x, y); if (rot) c.rotate(rot); c.scale(sc * flip, sc); c.drawImage(s.cv, -s.ax, -s.ay, s.w, s.h); c.restore();
}

function drawFall(c, x0, t) {
  c.save(); c.translate(x0, 812); c.lineCap = 'round';
  c.fillStyle = lg(c, 0, -34, 0, 50, '#88c2c6', '#b9e2de', '#9fd3d2'); c.beginPath(); c.ellipse(200, 8, 340, 42, 0, 0, TAU); c.ellipse(470, 6, 230, 30, 0, 0, TAU); c.fill();
  c.strokeStyle = '#ffffff'; c.lineWidth = 2.5;
  for (let i = 0; i < 4; i++) { const k = (t * 0.3 + i / 4) % 1; c.globalAlpha = (1 - k) * 0.7; c.beginPath(); c.ellipse(55, 4, 50 + k * 190, 7 + k * 22, 0, 0, TAU); c.stroke(); }
  c.fillStyle = '#fff';
  for (let i = 0; i < 18; i++) { const sx = 120 + ((i * 97) % 520), sy = -14 + ((i * 53) % 40); c.globalAlpha = Math.max(0, Math.sin(t * 2.2 + i * 1.9)) * 0.85; c.fillRect(sx - 9, sy, 18, 2); }
  c.globalAlpha = 1;
  c.fillStyle = lg(c, 0, 0, 110, 0, '#aed8d6', '#e4f6f2', '#c4e7e3'); c.fillRect(0, -236, 110, 236);
  ell(c, 55, -237, 58, 9, '#eefaf7');
  for (let i = 0; i < 11; i++) {
    const lx = 6 + i * 9.8 + Math.sin(i * 7.1) * 2, sp = 240 + (i % 3) * 50, len = 30 + (i % 4) * 14, gap = 84 + (i % 3) * 22, off = (t * sp + i * 61) % gap;
    c.strokeStyle = i % 3 ? '#ffffff' : '#9acccc'; c.globalAlpha = i % 3 ? 0.85 : 0.6; c.lineWidth = i % 2 ? 3 : 4.5; c.beginPath();
    for (let y = -240 - gap + off; y < 0; y += gap) { if (y + len <= -234) continue; c.moveTo(lx, Math.max(-234, y)); c.lineTo(lx, Math.min(-2, y + len)); }
    c.stroke();
  }
  c.globalAlpha = 1;
  for (let i = 0; i < 9; i++) ell(c, -6 + i * 15, -3 + Math.sin(t * 5 + i * 1.3) * 3, 16 + Math.sin(t * 3 + i) * 3, 10, '#ffffff', 0.9);
  soft(c, 55, -20, 150, 60, '#ffffff', 0.35 + Math.sin(t * 1.4) * 0.06);
  for (let i = 0; i < 10; i++) { const k = (t * 0.9 + i * 0.37) % 1, d = (i % 2 ? 1 : -1) * (0.5 + (i % 5) * 0.2); ell(c, 55 + d * k * 90, -6 - Math.sin(k * Math.PI) * (26 + (i % 3) * 12), 2.4, 2.4, '#ffffff', (1 - k) * 0.9); }
  c.restore();
}

// ---------- scenery art: PNG files from the assets folder, loaded by shared/loader.js (the list is worlds/forest/assets/manifest.js)
const spCloud = SP.clouds, spMtnBack = SP.mountainsBack, spMtnFront = SP.mountainsFront, spConFar = SP.farPinesBack, spConFar2 = SP.farPinesFront, spConMid = SP.pines;
const spTree = SP.trees, spTreePink = SP.blossomTrees, spTreeAut = SP.autumnTrees, spBigTree = SP.bigTrees;
const spBush = SP.bushes, spTuft = SP.grass, spFlower = SP.flowers, spShroom = SP.mushrooms, spFernNear = SP.ferns, spRock = SP.rocks;
const spLog = SP.logs, spSign = SP.signpost[0], spFence = SP.fence[0], spFallBack = SP.waterfallCliff[0], spFallFront = SP.waterfallBank[0];
const spFgFern = SP.fgFerns, spFgBroad = SP.fgLeaves, spFgPoppy = SP.fgPoppies[0], spFgRock = SP.fgRocks[0];
const spFog = SP.fog[0], spDapple = SP.lightDapple[0], spShade = SP.shade[0];
// Repeating ground textures. The tile is stretched to its scene size whatever the image resolution.
function texture(s) { const p = ctx.createPattern(s.cv, 'repeat'); p.setTransform(new DOMMatrix().scale(s.w / s.cv.width)); return p; }
const grassPat = texture(SP.grassTexture[0]), pathPat = texture(SP.pathTexture[0]);

// ---------- layers: each holds items placed in its own space, scrolled by parallax p
const layers = [];
function layer(name, p, opts = {}) { const L = { name, p, items: [], ...opts }; layers.push(L); return L; }
const end = (p) => WORLD * p + 4500;
function add(L, sp, x, y, sc = 1, flip = 1, sway = 0) {
  const r = Math.max(sp.ax, sp.w - sp.ax) * sc;
  L.items.push(sway ? { x, r, draw(c, t) { put(c, sp, x, y, sc, flip, Math.sin(t * 1.3 + x * 0.013) * sway); } } : { x, r, draw(c) { put(c, sp, x, y, sc, flip); } });
}
const flipR = () => (R() < 0.5 ? -1 : 1);

const mtn = layer('mountains', 0.1, { after(c, left) { c.fillStyle = lg(c, 0, 470, 0, 760, rgba('#fbf2da', 0), rgba('#fbf2da', 0.9)); c.fillRect(left, 470, VW, 300); } });
for (let x = -300; x < end(0.1); x += rr(300, 480)) add(mtn, pick(spMtnBack), x, 760, rr(0.72, 0.98), flipR());
for (let x = -100; x < end(0.1); x += rr(260, 440)) add(mtn, pick(spMtnFront), x, 765, rr(0.45, 0.66), flipR());

const far = layer('far', 0.25, {
  before(c, left) { c.fillStyle = lg(c, 0, 730, 0, 800, '#b4cdaa', '#a2c29a'); c.fillRect(left, 734, VW, 400); },
  after(c, left) { c.fillStyle = lg(c, 0, 600, 0, 800, rgba(MIST, 0), rgba(MIST, 0.55)); c.fillRect(left, 600, VW, 210); },
});
for (let x = -200; x < end(0.25); x += rr(45, 95)) add(far, pick(spConFar), x, rr(742, 752), rr(0.5, 0.78), flipR());
for (let x = -200; x < end(0.25); x += rr(60, 130)) add(far, pick(spConFar2), x, rr(760, 775), rr(0.55, 0.9), flipR());

const WATERFALLS = []; for (let x = 1250; x < end(0.5); x += rr(2500, 3100)) WATERFALLS.push(x);
const mid = layer('mid', 0.5, {
  before(c, left) {
    const x0 = Math.floor((left - 40) / 40) * 40, x1 = x0 + VW + 120, h = (x) => 772 + Math.sin(x * 0.004) * 18 + Math.sin(x * 0.011) * 7;
    c.beginPath(); c.moveTo(x0, VH); for (let x = x0; x <= x1; x += 40) c.lineTo(x, h(x) - 16 + Math.sin(x * 0.007 + 2) * 10); c.lineTo(x1, VH); c.fillStyle = '#8ab478'; c.fill();
    c.beginPath(); c.moveTo(x0, VH); for (let x = x0; x <= x1; x += 40) c.lineTo(x, h(x)); c.lineTo(x1, VH); c.fillStyle = lg(c, 0, 760, 0, 860, '#a8ca78', '#8db562'); c.fill();
  },
});
for (let x = -200; x < end(0.5); x += rr(85, 175)) {
  if (WATERFALLS.some((w) => x > w - 520 && x < w + 900)) continue;
  const base = rr(786, 802), k = R();
  if (k < 0.42) add(mid, pick(spTree), x, base, rr(0.62, 0.95), flipR());
  else if (k < 0.56) add(mid, pick(spTreePink), x, base, rr(0.55, 0.8), flipR());
  else if (k < 0.64) add(mid, pick(spTreeAut), x, base, rr(0.5, 0.75), flipR());
  else if (k < 0.76) add(mid, pick(spConMid), x, base, rr(0.6, 0.85), flipR());
  else add(mid, pick(spBush), x, base + 12, rr(0.6, 0.95), flipR());
}
for (const wx of WATERFALLS) mid.items.push({ x: wx + 190, r: 650, draw(c, t) { put(c, spFallBack, wx, 812); drawFall(c, wx, t); put(c, spFallFront, wx, 812); } });

const near = layer('near', 0.8);
for (let x = 230, i = 0; x < end(0.8); x += i++ ? rr(900, 1500) : 1790) add(near, pick(spBigTree), x, 832, rr(1.02, 1.1), flipR()); // gap after the first tree keeps the opening view of the waterfall clear
for (let x = 0; x < end(0.8); x += rr(130, 300)) {
  const k = R();
  if (k < 0.2) add(near, pick(spRock), x, 842, rr(0.4, 0.8), flipR());
  else if (k < 0.5) add(near, pick(spFlower), x, 846, rr(0.75, 1.05), flipR(), 0.03);
  else if (k < 0.72) add(near, pick(spBush), x, 850, rr(0.7, 1.05), flipR(), 0.006);
  else if (k < 0.86) add(near, pick(spFernNear), x, 850, rr(0.3, 0.42), flipR(), 0.03);
  else if (k < 0.93) add(near, pick(spLog), x, 846, rr(0.8, 1), flipR());
  else add(near, pick(spTuft), x, 846, rr(1.2, 1.6), flipR(), 0.05);
}

const play = layer('play', 1, {
  before(c, left) {
    const x0 = Math.floor((left - 40) / 30) * 30, x1 = x0 + Math.ceil((VW + 100) / 30) * 30;
    const band = (f0, f1) => { c.beginPath(); for (let x = x0; x <= x1; x += 30) c.lineTo(x, f0(x)); for (let x = x1; x >= x0; x -= 30) c.lineTo(x, f1(x)); c.closePath(); };
    band(grassTop, () => VH + 10); c.fillStyle = lg(c, 0, 830, 0, VH, '#a6ca66', '#8bb357', '#6b9648', '#507a3c'); c.fill(); c.fillStyle = grassPat; c.fill();
    band(grassTop, (x) => grassTop(x) + 9); c.fillStyle = 'rgba(218,238,145,.5)'; c.fill();
    band((x) => pathTop(x) - 5, (x) => pathBot(x) + 6); c.fillStyle = '#b79c64'; c.fill();
    band(pathTop, pathBot); c.fillStyle = lg(c, 0, 880, 0, 1000, '#e2c98f', '#efdba6', '#dcc186'); c.fill(); c.fillStyle = pathPat; c.fill();
    band((x) => pathTop(x) + 16, (x) => pathY(x) + 4); c.fillStyle = 'rgba(255,244,205,.4)'; c.fill();
    c.strokeStyle = 'rgba(150,120,70,.15)'; c.lineWidth = 9; c.lineCap = 'round';
    for (const off of [-14, 24]) { c.beginPath(); for (let x = x0; x <= x1; x += 30) c.lineTo(x, pathY(x) + off + Math.sin(x * 0.02) * 2); c.stroke(); }
    band(pathTop, (x) => pathTop(x) + 7); c.fillStyle = 'rgba(120,95,50,.2)'; c.fill();
  },
});
for (let x = 100; x < WORLD + 300; x += rr(380, 620)) {
  const k = R() < 0.5, sp = k ? spDapple : spShade, y = rr(890, 990), sc = rr(0.9, 1.3), r = sp.w * sc / 2;
  play.items.push(k ? { x, r, draw(c, t) { c.globalAlpha = 0.75 + Math.sin(t * 0.8 + x) * 0.2; put(c, sp, x, y, sc); c.globalAlpha = 1; } } : { x, r, draw(c) { put(c, sp, x, y, sc); } });
}
for (const fx of [900, 2600, 4700, 6300]) add(play, spFence, fx, grassTop(fx) + 24, 0.62);
add(play, spSign, 250, grassTop(250) + 30, 0.86);
for (let x = -60; x < WORLD + 100; x += rr(26, 60)) add(play, pick(spTuft), x, grassTop(x) + rr(10, 30), rr(0.5, 0.85), flipR(), 0.05);
for (let x = 40; x < WORLD + 100; x += rr(140, 380)) {
  const k = R(), y = grassTop(x) + rr(18, 30);
  if (k < 0.6) add(play, pick(spFlower), x, y, rr(0.45, 0.62), flipR(), 0.035);
  else if (k < 0.8) add(play, pick(spShroom), x, y, rr(0.6, 0.9), flipR());
  else add(play, pick(spRock), x, y, rr(0.18, 0.3), flipR());
}
for (let x = -60; x < WORLD + 100; x += rr(30, 70)) add(play, pick(spTuft), x, pathTop(x) + rr(-3, 4), rr(0.4, 0.6), flipR(), 0.05);
for (let x = -60; x < WORLD + 100; x += rr(24, 56)) add(play, pick(spTuft), x, pathBot(x) + rr(3, 12), rr(0.55, 0.85), flipR(), 0.05);
for (let x = -60; x < WORLD + 100; x += rr(50, 120)) {
  const k = R(), y = pathBot(x) + rr(24, 84);
  if (k < 0.62) add(play, pick(spTuft), x, y, rr(0.8, 1.2), flipR(), 0.05);
  else if (k < 0.86) add(play, pick(spFlower), x, y, rr(0.55, 0.8), flipR(), 0.035);
  else if (k < 0.94) add(play, pick(spShroom), x, y, rr(0.8, 1.1), flipR());
  else add(play, pick(spRock), x, y + 4, rr(0.22, 0.36), flipR());
}

const fg = layer('fg', 1.35);
for (let x = 100; x < end(1.35); x += rr(460, 860)) {
  const n = 1 + Math.floor(R() * 3);
  for (let i = 0; i < n; i++) {
    const px = x + i * rr(60, 110), k = R();
    if (px > 240 && px < 900) continue; // keep the opening view of the two characters clear
    if (k < 0.42) add(fg, pick(spFgFern), px, VH + 40, rr(0.75, 1.05), flipR(), 0.04);
    else if (k < 0.7) add(fg, pick(spFgBroad), px, VH + 50, rr(0.75, 1), flipR(), 0.03);
    else if (k < 0.86) add(fg, spFgPoppy, px, VH + 30, rr(0.75, 1), flipR(), 0.035);
    else add(fg, spFgRock, px, VH + 26, rr(0.9, 1.3), flipR());
  }
}

// ---------- characters
// Each character's own facial features, and the starting (neutral) expression.
const players = [
  { x: 420, lane: -8, keys: ['KeyA', 'KeyD'], emote: 'KeyW', dir: 1, phase: 0, m: 0, blink: 2.2, si: 0, stride: 20, hipX: 6, draw: drawSister, face: FACE_A },
  { x: 660, lane: 10, keys: ['ArrowLeft', 'ArrowRight'], emote: 'ArrowUp', dir: 1, phase: 0, m: 0, blink: 3.4, si: 0, stride: 18, hipX: 5, draw: drawBrother, face: FACE_B },
];
for (const p of players) Object.assign(p, { ex: newExpr(p.face), t: 0, idle: 0, gaze: 'ahead', gazeT: 1, gigT: 1.5, giggle: 0, yawn: 0, yawnT: 2, cheer: 0 });
let lanternPos = null;
const dust = [], sparks = [];
function star(c, x, y, r, rot, a) { c.save(); c.translate(x, y); c.rotate(rot); c.globalAlpha = a; c.fillStyle = '#fff6c2'; c.beginPath(); for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.moveTo(0, 0); c.quadraticCurveTo(r * 0.22, -r * 0.22, 0, -r); c.quadraticCurveTo(-r * 0.22, -r * 0.22, 0, 0); } c.fill(); c.restore(); }

// Lighting pass on a finished character: soft form shadow, warm lantern light, and a sunlit rim on the edges facing the sun.
function lightChar(sx0, sy0) {
  const c = buf.c, W = buf.cv.width, H = buf.cv.height, r = rim.c;
  c.setTransform(1, 0, 0, 1, 0, 0); r.setTransform(1, 0, 0, 1, 0, 0);
  r.globalCompositeOperation = 'copy'; r.drawImage(buf.cv, 0, 0);
  r.globalCompositeOperation = 'source-in'; r.fillStyle = '#fff2c2'; r.fillRect(0, 0, W, H);
  r.globalCompositeOperation = 'destination-out'; r.drawImage(buf.cv, -2.6 * CS, 2.2 * CS);
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = lg(c, W * 0.75, H * 0.15, W * 0.3, H * 0.95, 'rgba(255,236,170,.16)', 'rgba(255,236,170,0)', 'rgba(45,35,80,.26)'); c.fillRect(0, 0, W, H);
  if (lanternPos) { const lx = (lanternPos.x - sx0) * CS, ly = (lanternPos.y - sy0) * CS, lr = 230 * CS; c.fillStyle = rg(c, lx, ly, lr, 'rgba(255,200,115,.26)', 'rgba(255,200,115,.09)', 'rgba(255,200,115,0)'); c.fillRect(0, 0, W, H); }
  c.globalAlpha = 0.6; c.drawImage(rim.cv, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
}
function drawChar(p, t, camX) {
  const u = 1 - p.cheer / CHEER, hop = p.cheer > 0 ? Math.abs(Math.sin(u * TAU)) * 16 * (1 - u * 0.5) : 0; // two little hops when cheering
  const y = pathY(p.x) + p.lane, sx0 = p.x - camX - BAX, sy0 = y - BAY - hop, c = buf.c;
  p.t = t;
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.clearRect(0, 0, buf.cv.width, buf.cv.height);
  c.setTransform(CS * CHAR * p.dir, 0, 0, CS * CHAR, BAX * CS, BAY * CS); c.lineCap = 'round'; c.lineJoin = 'round';
  p.lanBuf = null; p.draw(c, p, t);
  lightChar(sx0, sy0);
  soft(ctx, p.x - camX - 4 * p.dir, y + 2, 56 - hop, 10 - hop * 0.15, '#3a2a10', 0.45 - hop * 0.008);
  ctx.drawImage(buf.cv, sx0, sy0, BW, BH);
  if (p.lanBuf) lanternPos = { x: sx0 + p.lanBuf[0] / CS, y: sy0 + p.lanBuf[1] / CS, gy: y, k: p.lanBuf[2] };
}

// ---------- sky, light, wildlife, particles
const clouds = []; for (let i = 0; i < 8; i++) clouds.push({ x: rr(0, 3400), y: rr(80, 340), s: rr(0.6, 1.3), sp: pick(spCloud) });
function drawSky(t, camX) {
  ctx.fillStyle = lg(ctx, 0, 0, 0, 780, '#e6d3a6', '#f3e4bd', '#f9eecf', '#fcf3dc'); ctx.fillRect(0, 0, VW, VH);
  ctx.fillStyle = rg(ctx, VW * 0.8, 30, 820, 'rgba(255,250,222,1)', 'rgba(255,244,200,.6)', 'rgba(255,244,200,0)'); ctx.fillRect(0, 0, VW, VH);
  const span = 3400;
  for (const cl of clouds) { const x = ((cl.x - camX * 0.04 + t * 6) % span + span) % span - 400; if (x < VW + 400) put(ctx, cl.sp, x, cl.y, cl.s); }
  ctx.strokeStyle = 'rgba(95,72,72,.55)'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  for (let f = 0; f < 2; f++) {
    const sp2 = VW + 700, bx = ((t * (22 + f * 9) + f * 900 - camX * 0.06) % sp2 + sp2) % sp2 - 350, by = 170 + f * 110 + Math.sin(t * 0.4 + f) * 20;
    for (let i = 0; i < 4 + f; i++) {
      const x = bx - i * 34 - (i % 2) * 10, y = by + i * 12 * (i % 2 ? 1 : -0.6), fl = Math.sin(t * 7 + i * 1.3 + f) * 7;
      ctx.beginPath(); ctx.moveTo(x - 11, y - fl); ctx.quadraticCurveTo(x - 5, y - 3 - fl * 0.3, x, y); ctx.quadraticCurveTo(x + 5, y - 3 - fl * 0.3, x + 11, y - fl); ctx.stroke();
    }
  }
}
function drawFog(t, camX) {
  const span = Math.max(2400, VW + 1300);
  ctx.globalAlpha = 0.55;
  for (let i = 0; i < 3; i++) put(ctx, spFog, ((i * span / 3 - camX * 0.3 + t * 9) % span + span) % span - 600, 735 + i * 14, 1.3);
  ctx.globalAlpha = 1;
}
function drawRays(t, k) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const ox = VW * 0.84, oy = -160, L = 1500;
  for (let i = 0; i < 6; i++) {
    const a = 1.98 + i * 0.105 + Math.sin(t * 0.2 + i) * 0.01, w = 0.022 + (i % 3) * 0.012, al = (0.07 + 0.03 * Math.sin(t * 0.5 + i * 1.7)) * k;
    ctx.fillStyle = lg(ctx, ox, oy, ox + Math.cos(a) * L, oy + Math.sin(a) * L, `rgba(255,244,205,${al})`, `rgba(255,244,205,${al * 0.7})`, `rgba(255,244,205,${al * 0.4})`, 'rgba(255,244,205,0)');
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.cos(a - w) * L, oy + Math.sin(a - w) * L); ctx.lineTo(ox + Math.cos(a + w) * L, oy + Math.sin(a + w) * L); ctx.fill();
  }
  ctx.restore();
}
const flies = []; for (let i = 0; i < 9; i++) flies.push({ bx: rr(200, WORLD - 200), by: rr(800, 900), ph: rr(0, 6), col: pick([['#f2a53a', '#fbd37a'], ['#7fb2e0', '#d3e8fa'], ['#f4f0e4', '#ffffff'], ['#e9739a', '#f8c1d2']]) });
function drawFlies(c, t, camX) {
  for (const f of flies) {
    const x = f.bx + Math.sin(t * 0.5 + f.ph) * 110 + Math.sin(t * 1.3 + f.ph * 2) * 30 - camX;
    if (x < -40 || x > VW + 40) continue;
    const y = f.by + Math.sin(t * 0.8 + f.ph) * 34 + Math.sin(t * 2.1 + f.ph) * 8, flap = 0.2 + 0.8 * Math.abs(Math.sin(t * 13 + f.ph));
    c.save(); c.translate(x, y); c.rotate(Math.cos(t * 0.5 + f.ph) * 0.4);
    for (const s of [-1, 1]) { c.save(); c.scale(s * flap, 1); ell(c, 6, -4, 7, 6, f.col[0]); ell(c, 5, 4, 5, 4.2, f.col[0]); ell(c, 6.5, -4, 3.4, 3, f.col[1]); c.restore(); }
    ell(c, 0, 0, 1.4, 6, '#3a2a22'); c.restore();
  }
}
const leaves = []; for (let i = 0; i < 18; i++) leaves.push({ x: rr(0, 2600), y: rr(-50, VH), v: rr(25, 55), ph: rr(0, 6), sp: rr(1, 3), col: pick([['#7f9f52', '#a9c676'], ['#c9772f', '#e8a257'], ['#b85c7a', '#dc8fa6'], ['#cf9c3c', '#eac66c'], ['#5c8a4c', '#86b56c']]) });
const motes = []; for (let i = 0; i < 34; i++) motes.push({ x: rr(0, 1), y: rr(0.05, 0.78), ph: rr(0, 6), r: rr(1.4, 3.4) });
function drawParticles(t, dt, dCam) {
  for (const L of leaves) {
    L.y += L.v * dt; L.x += Math.sin(t * 0.9 + L.ph) * 24 * dt - dCam * 1.15;
    if (L.y > VH + 20) { L.y = -20; L.x = rr(0, VW); }
    if (L.x < -40) L.x += VW + 80; if (L.x > VW + 40) L.x -= VW + 80;
    ctx.save(); ctx.translate(L.x, L.y); ctx.rotate(t * L.sp + L.ph); ctx.scale(Math.cos(t * L.sp * 1.3 + L.ph), 1);
    ctx.fillStyle = L.col[0]; leafPath(ctx, 17, 6.5); ctx.fill();
    ctx.fillStyle = L.col[1]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(6.5, -8.5, 0, -17); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,20,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, -16); ctx.stroke(); ctx.restore();
  }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const m of motes) {
    const x = VW * (0.3 + m.x * 0.7) + Math.sin(t * 0.3 + m.ph) * 30, y = VH * m.y + Math.sin(t * 0.5 + m.ph * 2) * 20;
    soft(ctx, x, y, m.r * 3, m.r * 3, '#fff1c0', 0.3 + 0.25 * Math.sin(t * 1.3 + m.ph));
  }
  ctx.restore();
}

// ---------- input
const down = {};
addEventListener('keydown', (e) => { down[e.code] = true; if (e.code.startsWith('Arrow')) e.preventDefault(); });
addEventListener('keyup', (e) => { down[e.code] = false; });
addEventListener('blur', () => { for (const k in down) down[k] = false; });
document.querySelectorAll('.pad button').forEach((b) => {
  const k = b.dataset.k;
  b.addEventListener('pointerdown', () => { down[k] = true; });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, () => { down[k] = false; }));
});

// ---------- loop
let camX = 0, last = performance.now();
function drawLayer(L, t) {
  const left = camX * L.p;
  ctx.save(); ctx.translate(-left, 0);
  if (L.before) L.before(ctx, left, t);
  for (const it of L.items) if (it.x + it.r > left && it.x - it.r < left + VW) it.draw(ctx, t);
  if (L.after) L.after(ctx, left, t);
  ctx.restore();
}
function update(dt) {
  const maxGap = Math.max(260, VW / ZOOM - 300);
  players.forEach((p, i) => {
    const other = players[1 - i], dir = (down[p.keys[1]] ? 1 : 0) - (down[p.keys[0]] ? 1 : 0);
    let moving = dir !== 0;
    if (moving) {
      p.dir = dir;
      let nx = Math.max(90, Math.min(WORLD - 90, p.x + dir * SPEED * dt));
      if (Math.abs(nx - other.x) > maxGap && Math.abs(nx - other.x) > Math.abs(p.x - other.x)) nx = p.x; // stay on screen together
      moving = nx !== p.x; p.x = nx;
    }
    p.m += ((moving ? 1 : 0) - p.m) * Math.min(1, dt * 9);
    if (moving) {
      p.phase += dt * Math.PI * (SPEED / CHAR) / (2 * p.stride); // feet stay planted: cycle speed follows walking speed
      const si = Math.floor(p.phase / Math.PI);
      if (si !== p.si) { p.si = si; for (let k = 0; k < 3; k++) dust.push({ x: p.x + p.dir * CHAR * (p.stride + p.hipX) + rr(-6, 6), y: pathY(p.x) + p.lane + 2, vx: -p.dir * rr(8, 30), vy: -rr(6, 20), life: 1, r: rr(5, 9) }); }
    }
    if (down[p.emote] && p.cheer <= 0) { // cheer: hop, raise an arm, big grin, sparkles
      p.cheer = CHEER;
      for (let k = 0; k < 7; k++) sparks.push({ x: p.x + (Math.random() - 0.5) * 130, y: pathY(p.x) + p.lane - 210 - Math.random() * 140, vy: -20 - Math.random() * 30, life: 1, r: 7 + Math.random() * 8, rot: Math.random() * 3, d: Math.random() * 0.35 });
    }
    p.cheer = Math.max(0, p.cheer - dt);
    updateExpr(p, other, dt, maxGap);
  });
  for (let i = dust.length - 1; i >= 0; i--) { const d = dust[i]; d.life -= dt * 1.8; d.x += d.vx * dt; d.y += d.vy * dt; d.r += dt * 14; if (d.life <= 0) dust.splice(i, 1); }
  for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; if (s.d > 0) { s.d -= dt; continue; } s.life -= dt * 1.3; s.y += s.vy * dt; s.rot += dt * 2; if (s.life <= 0) sparks.splice(i, 1); }
}
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
  update(dt);
  const mid2 = (players[0].x + players[1].x) / 2, prev = camX, target = Math.max(0, Math.min(WORLD - VW, mid2 - VW / 2));
  camX += (target - camX) * Math.min(1, dt * 2.5);
  if (ZOOM > 1) { const k = S * ZOOM, zx = mid2 - camX - VW / (2 * ZOOM), zy = Math.min(VH - VH / ZOOM, 785 - VH / (2 * ZOOM)); ctx.setTransform(k, 0, 0, k, -zx * k, -zy * k); } else ctx.setTransform(S, 0, 0, S, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  drawSky(t, camX);
  for (const L of layers) {
    drawLayer(L, t);
    if (L.name === 'far') { drawFog(t, camX); drawRays(t, 1); }
    if (L.name === 'near') drawRays(t, 0.45);
    if (L.name === 'play') {
      if (lanternPos) soft(ctx, lanternPos.x, lanternPos.gy + 4, 230, 40, '#ffd27a', 0.42);
      for (const p of [...players].sort((a, b) => a.lane - b.lane)) drawChar(p, t, camX);
      for (const d of dust) soft(ctx, d.x - camX, d.y, d.r, d.r * 0.7, '#e2cfa2', d.life * 0.5);
      for (const s of sparks) if (s.d <= 0) star(ctx, s.x - camX, s.y, s.r * Math.sin(Math.PI * Math.min(1, s.life * 1.2)), s.rot, Math.min(1, s.life * 2));
      drawFlies(ctx, t, camX);
      if (lanternPos) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; const r = 200 * lanternPos.k;
        ctx.fillStyle = rg(ctx, lanternPos.x, lanternPos.y, r, 'rgba(255,190,90,.5)', 'rgba(255,170,70,.16)', 'rgba(255,160,60,.05)', 'rgba(255,160,60,0)'); ctx.fillRect(lanternPos.x - r, lanternPos.y - r, r * 2, r * 2); ctx.restore();
      }
    }
  }
  drawParticles(t, dt, camX - prev);
  ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,205,135,.16)'; ctx.fillRect(0, 0, VW, VH); ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = (() => { const v = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.45, VW / 2, VH / 2, VH * 1.15); v.addColorStop(0, 'rgba(60,38,18,0)'); v.addColorStop(1, 'rgba(60,38,18,.34)'); return v; })(); ctx.fillRect(0, 0, VW, VH);
  requestAnimationFrame(frame);
}
// music: starts after the first key press or tap (browsers allow sound only then); M switches it off and on
if (typeof SOUND !== 'undefined') { SOUND.wantMusic = true; SOUND.area = 'forest'; setInterval(() => musicArea('forest'), 500); }
requestAnimationFrame((t) => { last = t; frame(t); });

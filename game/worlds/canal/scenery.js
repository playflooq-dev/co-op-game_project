'use strict';
// The canal quay as scenery: the sky and the far town, the row of houses, the quay, the canal in front of it, the
// side canals that cut across it, and the edge of the forest on the far bank of the river. Nothing in this file can
// be bumped into or used: what the siblings play with is placed by the SECTIONS in settings.js.
// (The way it is painted is the city's street.js; the pictures are the city's and the forest's.)
const FEET = CANAL.feet, BASE = CANAL.facadeBase, HOR = CANAL.horizon, KERB = CANAL.kerb;
let camX = 0;
const W = (name) => SP[name][0];
let VIEW = [0, 1920]; // the part of the quay being painted: the screen, or one strip that is kept
const inView = (a, b) => b > VIEW[0] - 60 && a < VIEW[1] + 60;
const BANK = RIVER[1]; // from here on it is grass: the far bank

// ---------- the sky, the sun and the far skyline
const PARALLAX = [['skylineFar', 0.15, 690], ['skylineNear', 0.35, 830]];
function drawSky(c, t, k = S) {
  const u = clamp01(camX / (CANAL.length - VW));
  c.fillStyle = lg(c, 0, 0, 0, BASE, ...SKY.start.map((s, i) => mixCol(s, SKY.end[i], u))); c.fillRect(camX - 10, 0, VW + 20, VH);
  const sx = camX + VW * SKY.sunX, sy = lerp(360, 600, u);
  c.fillStyle = rg(c, sx, sy, 900, `rgba(255,236,190,${0.75 + u * 0.2})`, 'rgba(255,222,170,.25)', 'rgba(255,222,170,0)'); c.fillRect(camX - 10, 0, VW + 20, VH);
  ell(c, sx, sy, 46, 46, '#fff4d0', 0.9);
  const cl = SP.clouds, off = camX * 0.05 + t * 4; c.globalAlpha = 0.8;
  for (let i = -1; i < 6; i++) { const x = camX + ((i * 520 - off) % 3120 + 3120) % 3120 - 400; putFast(c, cl[(i + 7) % cl.length], x, 90 + (i % 3) * 50, 0.7 + (i % 2) * 0.2, k); }
  c.globalAlpha = 1;
  for (const [name, par, base] of PARALLAX) {
    const arts = SP[name], tw = arts[0].w, o = camX * par, start = Math.floor(o / tw);
    for (let i = start; i * tw - o < VW + tw; i++) putFast(c, arts[((i % arts.length) + arts.length) % arts.length], camX + i * tw - o, base, 1, k);
  }
  c.fillStyle = lg(c, 0, 560, 0, BASE, 'rgba(250,228,200,0)', 'rgba(250,228,200,.35)'); c.fillRect(camX - 10, 0 + 560, VW + 20, BASE - 560);
}

// ---------- a side canal between the houses, running away from the camera
function drawGap(c, x0, x1) {
  if (!inView(x0, x1)) return;
  const cx = (x0 + x1) / 2, hw = 70, k = 0.55, P = (x, y, u) => [x + (cx - x) * u, y + (HOR - y) * u];
  for (const [ex, s] of [[x0, 1], [x1, -1]]) { // the side walls of the houses beside it
    const top = BASE - 600, [bx, by] = P(ex, BASE, k), [tx, ty] = P(ex, top, k);
    c.fillStyle = lg(c, ex, 0, bx, 0, '#7d6670', '#9a8a94'); c.beginPath(); c.moveTo(ex, top); c.lineTo(tx, ty); c.lineTo(bx, by); c.lineTo(ex, BASE); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,230,190,.35)'; c.lineWidth = 2;
    for (let i = 1; i < 6; i++) { const yy = BASE - i * 100, [ax2, ay2] = P(ex, yy, k); c.beginPath(); c.moveTo(ex, yy); c.lineTo(ax2, ay2); c.stroke(); }
    c.fillStyle = 'rgba(255,220,150,.55)'; for (let i = 0; i < 5; i++) for (let j = 1; j < 4; j++) { const u = j * 0.13, [wx, wy] = P(ex, BASE - 70 - i * 100, u), hgt = 40 * (1 - u * 0.9); if ((i + j) % 2) c.fillRect(wx - (s > 0 ? 0 : 8), wy - hgt, 8 * (1 - u), hgt); }
  }
  c.fillStyle = lg(c, 0, HOR, 0, BASE, '#9ab8c8', '#6f9ab0'); c.beginPath(); c.moveTo(x0, BASE); c.lineTo(cx - hw, HOR); c.lineTo(cx + hw, HOR); c.lineTo(x1, BASE); c.closePath(); c.fill();
}

// ---------- the quay, its stone edge, and the canal in front of it
const WATER_COL = ['#6f9ab0', '#4f7f98', '#3f6a82'];
function drawGround(c) {
  const L = VIEW[0] - 20, R2 = VIEW[1] + 20;
  const seg = (s0, s1) => { // a stretch of quay
    if (s1 <= s0) return;
    c.fillStyle = textureFast(c, W('cobbles')); c.fillRect(s0, BASE, s1 - s0, KERB - BASE);
    c.fillStyle = 'rgba(60,40,30,.18)'; c.fillRect(s0, BASE, s1 - s0, 10);
    c.fillStyle = textureFast(c, W('stone')); c.fillRect(s0, KERB, s1 - s0, 34); c.fillStyle = lg(c, 0, KERB, 0, KERB + 34, 'rgba(255,248,230,.35)', 'rgba(20,30,40,.3)'); c.fillRect(s0, KERB, s1 - s0, 34);
    c.fillStyle = 'rgba(40,30,25,.4)'; c.fillRect(s0, KERB + 32, s1 - s0, 3);
  };
  // the canal in front, all along; then the quay on top of it, with gaps where the side canals come through
  c.fillStyle = lg(c, 0, BASE, 0, VH, ...WATER_COL); c.fillRect(L, BASE, Math.min(R2, BANK) - L, VH - BASE + 420);
  let x = L; for (const [a, b] of WATERS) { seg(x, Math.min(a, R2)); x = Math.max(x, b); } seg(x, Math.min(R2, BANK));
  for (const [g0, g1] of WATERS) for (const [ex, s] of [[g0, -1], [g1, 1]]) { if (!inView(ex - 20, ex + 20)) continue; c.fillStyle = textureFast(c, W('stone')); c.fillRect(s < 0 ? ex - 2 : ex - 16, BASE, 18, VH - BASE + 420); c.fillStyle = 'rgba(20,30,40,.35)'; c.fillRect(s < 0 ? ex - 2 : ex - 16, 960, 18, VH - 960 + 420); }
  if (R2 > BANK) { // the far bank: grass, and the path into the forest
    const a = Math.max(L, BANK); c.fillStyle = '#7ea551'; c.fillRect(a, BASE - 4, R2 - a, VH - BASE + 424); c.fillStyle = textureFast(c, SP.grassTexture[0]); c.fillRect(a, BASE - 4, R2 - a, VH - BASE + 424);
    c.fillStyle = 'rgba(224,242,150,.45)'; c.fillRect(a, BASE - 4, R2 - a, 7);
    c.fillStyle = '#b79c64'; c.fillRect(a, FEET - 35, R2 - a, 92); c.fillStyle = textureFast(c, SP.pathTexture[0]); c.fillRect(a, FEET - 30, R2 - a, 82);
    c.fillStyle = 'rgba(255,244,205,.3)'; c.fillRect(a, FEET - 16, R2 - a, 22);
  }
}
function liveWater(c, t) { // glints on the side canals and on the canal in front
  c.lineWidth = 2;
  for (const [g0, g1] of WATERS) {
    if (!inView(g0, g1)) continue; const cx = (g0 + g1) / 2;
    c.strokeStyle = 'rgba(255,255,255,.3)';
    for (let i = 0; i < 6; i++) { const u = i / 6, y = lerp(HOR + 10, BASE - 10, u * u), w2 = lerp(70, (g1 - g0) / 2, u * u) * 0.6; c.beginPath(); c.moveTo(cx - w2 + Math.sin(t + i) * 10, y); c.lineTo(cx - w2 * 0.4 + Math.sin(t + i) * 10, y); c.stroke(); }
  }
  c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 2.5; const hi = Math.min(camX + VW + 60, BANK - 50);
  for (let i = Math.floor((camX - 60) / 210); i * 210 < hi; i++) { const y = 1036 + (((i * 7) % 3) - 1) * 16, xx = i * 210 + ((t * 26 + i * 53) % 150); if (xx < hi) { c.beginPath(); c.moveTo(xx, y); c.quadraticCurveTo(xx + 20, y - 5, xx + 40, y); c.stroke(); } }
}

// ---------- the houses, the lamps, and the forest on the far bank
function drawHouses(c) { for (const [name, x] of HOUSES) { const a = W(name); if (inView(x - a.ax, x - a.ax + a.w)) putFast(c, a, x, BASE); } }
function staticProps(c) {
  for (const [name, x] of PROPS) { const a = W(name); if (inView(x - a.ax, x - a.ax + a.w)) putFast(c, a, x, BASE + 12); }
  if (inView(RIVER[0] - 60, CANAL.length)) {
    FOREST_EDGE.forEach(([kind, x, s], i) => { if (inView(x - 420, x + 420)) putFast(c, SP[kind][(i * 2 + 1) % SP[kind].length], x, BASE + 16, s); });
    for (const px of RIVER) { c.fillStyle = textureFast(c, W('stone')); c.fillRect(px - 26, FEET, 52, VH - FEET + 420); c.fillStyle = 'rgba(20,30,40,.3)'; c.fillRect(px - 26, 980, 52, VH - 980 + 420); } // the bridge's stone piers
  }
}
function drawLampGlow(c) {
  const u = clamp01(camX / (CANAL.length - VW));
  for (const [name, x] of PROPS) if (name === 'streetLamp' && x > camX - 100 && x < camX + VW + 100) soft(c, x, BASE + 12 - 410, 90, 80, '#ffe1a0', 0.12 + u * 0.45);
}

// ---------- painting. Everything that never moves is painted once, in strips, and kept; the sky is painted small and stretched.
const bg = mkBuf(), CHUNK = 640, chunks = new Map(); let chunkS = 0;
function paintStill(c) { for (const [g0, g1] of WATERS) drawGap(c, g0, g1); drawHouses(c); drawGround(c); staticProps(c); }
function quayChunk(i) {
  if (chunkS !== S) { chunks.clear(); chunkS = S; }
  let cvs = chunks.get(i); if (cvs) return cvs;
  cvs = document.createElement('canvas'); cvs.width = Math.ceil(CHUNK * S) + 2; cvs.height = Math.ceil((VH + 420) * S);
  const g = cvs.getContext('2d'); g.setTransform(S, 0, 0, S, -i * CHUNK * S, 0); g.lineCap = 'round'; g.lineJoin = 'round';
  const keep = VIEW; VIEW = [i * CHUNK, (i + 1) * CHUNK]; paintStill(g); VIEW = keep; chunks.set(i, cvs);
  if (chunks.size > 14) { let far = null, fd = -1; for (const k of chunks.keys()) { const d = Math.abs(k - i); if (d > fd) { fd = d; far = k; } } chunks.delete(far); }
  return cvs;
}
function drawQuay(c, t) { // onto the screen, whose scale and scroll are already set
  VIEW = [camX, camX + VW];
  const half = S / 2, bw = Math.ceil(VW * half), bh = Math.ceil(VH * half); if (bg.cv.width !== bw || bg.cv.height !== bh) { bg.cv.width = bw; bg.cv.height = bh; }
  bg.c.setTransform(half, 0, 0, half, -camX * half, 0); drawSky(bg.c, t, half); c.drawImage(bg.cv, camX, 0, bg.cv.width / half, VH);
  for (let i = Math.floor(camX / CHUNK); i * CHUNK < camX + VW; i++) { const ch = quayChunk(i); c.drawImage(ch, i * CHUNK, 0, ch.width / S, ch.height / S); }
}
function drawQuayGlow(c) { // the warm evening light over everything, and darker corners
  c.globalCompositeOperation = 'soft-light'; c.fillStyle = 'rgba(255,205,135,.14)'; c.fillRect(camX - 10, 0, VW + 20, VH + 420); c.globalCompositeOperation = 'source-over';
  const v = c.createRadialGradient(camX + VW / 2, VH / 2, VH * 0.5, camX + VW / 2, VH / 2, VH * 1.2); v.addColorStop(0, 'rgba(50,30,15,0)'); v.addColorStop(1, 'rgba(50,30,15,.3)'); c.fillStyle = v; c.fillRect(camX - 10, 0, VW + 20, VH + 420);
}

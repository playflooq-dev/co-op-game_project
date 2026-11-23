'use strict';
// The park as scenery: a sunny sky, the town far behind, hills and trees, grass, and the path the siblings walk on.
// Nothing in this file can be bumped into or used: what they play with is placed by the SECTIONS in settings.js.
// All the pictures are borrowed: trees, bushes, flowers, grass, fences and clouds from the forest, the far
// skyline, lamps and benches from the city.
const FEET = PARK.feet, PATH = [FEET - 34, FEET + 52], GRASS_TOP = FEET - 92;
let camX = 0;
const W = (name) => SP[name][0];
let VIEW = [0, 1920]; // the part of the path being painted: the screen, or one strip that is kept
const inView = (a, b) => b > VIEW[0] - 60 && a < VIEW[1] + 60;

// ---------- the sky, the town in the distance, the hills and the far trees. These slide slower than the path.
const FAR_TREES = (() => { const rnd = rng(4411), out = []; for (let x = -200; x < PARK.length * 0.6 + 2400; x += 150 + rnd() * 210) out.push({ x, kind: rnd() < 0.25 ? 'blossomTrees' : rnd() < 0.3 ? 'pines' : 'trees', i: Math.floor(rnd() * 9), s: 0.46 + rnd() * 0.2, y: GRASS_TOP + 6 + rnd() * 10 }); return out; })();
function drawSky(c, t, k = S) {
  c.fillStyle = lg(c, 0, 0, 0, GRASS_TOP, '#7db5e8', '#a9d3f0', '#d7ecf4', '#f7f1d6'); c.fillRect(camX - 10, 0, VW + 20, VH);
  const sx = camX + VW * 0.82, sy = 250;
  c.fillStyle = rg(c, sx, sy, 800, 'rgba(255,246,205,.85)', 'rgba(255,236,180,.25)', 'rgba(255,236,180,0)'); c.fillRect(camX - 10, 0, VW + 20, VH); ell(c, sx, sy, 52, 52, '#fffbe6', 0.95);
  const cl = SP.clouds, off = camX * 0.05 + t * 5; c.globalAlpha = 0.9;
  for (let i = -1; i < 6; i++) { const x = camX + ((i * 560 - off) % 3360 + 3360) % 3360 - 420; putFast(c, cl[(i + 7) % cl.length], x, 120 + (i % 3) * 58, 0.75 + (i % 2) * 0.2, k); }
  c.globalAlpha = 0.5; // the town, pale with distance
  for (const [name, par, base, sc] of [['skylineFar', 0.1, GRASS_TOP - 6, 0.62], ['skylineNear', 0.2, GRASS_TOP + 6, 0.5]]) {
    const arts = SP[name], tw = arts[0].w * sc, o = camX * par, start = Math.floor(o / tw);
    for (let i = start; i * tw - o < VW + tw; i++) putFast(c, arts[((i % arts.length) + arts.length) % arts.length], camX + i * tw - o, base, sc, k);
  }
  c.globalAlpha = 1;
  c.fillStyle = lg(c, 0, GRASS_TOP - 260, 0, GRASS_TOP, 'rgba(247,241,214,0)', 'rgba(247,241,214,.7)'); c.fillRect(camX - 10, GRASS_TOP - 260, VW + 20, 262);
  // rolling hills, and a row of trees along them
  const o4 = camX * 0.6, hill = (x) => GRASS_TOP - 26 + Math.sin(x * 0.0031) * 16 + Math.sin(x * 0.0083 + 1) * 7;
  c.beginPath(); c.moveTo(camX - 20, VH); for (let x = camX - 20; x <= camX + VW + 40; x += 40) c.lineTo(x, hill(x - camX + o4 * 0.67)); c.lineTo(camX + VW + 40, VH); c.fillStyle = lg(c, 0, GRASS_TOP - 50, 0, GRASS_TOP + 40, '#b9d88a', '#a3cc74'); c.fill();
  for (const f of FAR_TREES) { const x = camX + f.x - o4; if (x < camX - 260 || x > camX + VW + 260) continue; const arts = SP[f.kind]; putFast(c, arts[f.i % arts.length], x, f.y, f.s, k); }
  c.fillStyle = lg(c, 0, GRASS_TOP - 120, 0, GRASS_TOP + 20, 'rgba(247,241,214,0)', 'rgba(247,241,214,.32)'); c.fillRect(camX - 10, GRASS_TOP - 120, VW + 20, 142);
}

// ---------- everything along the path that never moves: grass, the trees and bushes behind, the path itself
const BACK = (() => { // bushes, flowers and fence runs scattered behind the path, the same every time
  const rnd = rng(9173), out = [];
  for (let x = 60; x < PARK.length; x += 150 + rnd() * 230) { const k = rnd(); out.push({ x, kind: k < 0.5 ? 'bushes' : k < 0.85 ? 'flowers' : 'rocks', i: Math.floor(rnd() * 9), s: k < 0.5 ? 0.6 + rnd() * 0.3 : k < 0.85 ? 0.62 + rnd() * 0.25 : 0.34 + rnd() * 0.16, y: PATH[0] - 6 - rnd() * 22 }); }
  return out;
})();
const FRONT = (() => { const rnd = rng(551), out = []; for (let x = 40; x < PARK.length; x += 110 + rnd() * 190) out.push({ x, kind: rnd() < 0.6 ? 'grass' : 'flowers', i: Math.floor(rnd() * 9), s: 0.8 + rnd() * 0.5, y: PATH[1] + 46 + rnd() * 34 }); return out; })();
function paintStill(c) {
  const L = VIEW[0] - 20, Rr = VIEW[1] + 20, w = Rr - L;
  c.fillStyle = lg(c, 0, GRASS_TOP, 0, VH, '#a9cf68', '#8fb958', '#74a04a', '#5f8a40'); c.fillRect(L, GRASS_TOP, w, VH - GRASS_TOP);
  c.fillStyle = textureFast(c, SP.grassTexture[0]); c.fillRect(L, GRASS_TOP, w, VH - GRASS_TOP);
  c.fillStyle = 'rgba(224,242,150,.5)'; c.fillRect(L, GRASS_TOP, w, 8);
  for (const [kind, x, s] of PARK_TREES) { const arts = SP[kind], a = arts[Math.floor(x / 97) % arts.length]; if (inView(x - 300, x + 300)) { soft(c, x, PATH[0] - 10, 170 * s, 22, '#2a3a1a', 0.22); putFast(c, a, x, PATH[0] - 4, s); } }
  for (const b of BACK) { const arts = SP[b.kind], a = arts[b.i % arts.length]; if (inView(b.x - 200, b.x + 200)) putFast(c, a, b.x, b.y, b.s); }
  // the path: sandy, with a darker edge and a pale middle
  c.fillStyle = '#b79c64'; c.fillRect(L, PATH[0] - 5, w, PATH[1] - PATH[0] + 11);
  c.fillStyle = lg(c, 0, PATH[0], 0, PATH[1], '#e2c98f', '#efdba6', '#dcc186'); c.fillRect(L, PATH[0], w, PATH[1] - PATH[0]);
  c.fillStyle = textureFast(c, SP.pathTexture[0]); c.fillRect(L, PATH[0], w, PATH[1] - PATH[0]);
  c.fillStyle = 'rgba(255,244,205,.38)'; c.fillRect(L, PATH[0] + 14, w, 24);
  c.fillStyle = 'rgba(90,70,40,.14)'; c.fillRect(L, PATH[0], w, 7);
  for (const [name, x] of PARK_PROPS) { const a = W(name); if (inView(x - a.ax, x - a.ax + a.w)) putFast(c, a, x, PATH[0] + 8); }
  if (inView(PARK.exit - 320, PARK.exit + 320)) { soft(c, PARK.exit, PATH[0] + 14, 330, 16, '#2a1a0e', 0.25); putFast(c, W('parkGate'), PARK.exit, PATH[0] + 22); } // the way out
  for (const f of FRONT) { const arts = SP[f.kind], a = arts[f.i % arts.length]; if (inView(f.x - 120, f.x + 120)) putFast(c, a, f.x, f.y, f.s); }
}

// ---------- painting. The still part is painted once, in strips, and kept; the sky is painted small and stretched.
const bg = mkBuf(), CHUNK = 640, chunks = new Map(); let chunkS = 0;
function parkChunk(i) {
  if (chunkS !== S) { chunks.clear(); chunkS = S; }
  let cvs = chunks.get(i); if (cvs) return cvs;
  cvs = document.createElement('canvas'); cvs.width = Math.ceil(CHUNK * S) + 2; cvs.height = Math.ceil((VH - GRASS_TOP + 620) * S);
  const g = cvs.getContext('2d'); g.setTransform(S, 0, 0, S, -i * CHUNK * S, -(GRASS_TOP - 620) * S); g.lineCap = 'round'; g.lineJoin = 'round';
  const keep = VIEW; VIEW = [i * CHUNK, (i + 1) * CHUNK]; paintStill(g); VIEW = keep; chunks.set(i, cvs);
  if (chunks.size > 14) { let far = null, fd = -1; for (const k of chunks.keys()) { const d = Math.abs(k - i); if (d > fd) { fd = d; far = k; } } chunks.delete(far); }
  return cvs;
}
function drawPark(c, t) { // onto the screen, whose scale and scroll are already set
  VIEW = [camX, camX + VW];
  const half = S / 2, bw = Math.ceil(VW * half), bh = Math.ceil(VH * half); if (bg.cv.width !== bw || bg.cv.height !== bh) { bg.cv.width = bw; bg.cv.height = bh; }
  bg.c.setTransform(half, 0, 0, half, -camX * half, 0); drawSky(bg.c, t, half); c.drawImage(bg.cv, camX, 0, bg.cv.width / half, VH);
  for (let i = Math.floor(camX / CHUNK); i * CHUNK < camX + VW; i++) { const ch = parkChunk(i); c.drawImage(ch, i * CHUNK, GRASS_TOP - 620, ch.width / S, ch.height / S); }
}
function drawParkLight(c) { // warm afternoon light over everything, and gently darker corners
  c.globalCompositeOperation = 'soft-light'; c.fillStyle = 'rgba(255,225,150,.12)'; c.fillRect(camX - 10, 0, VW + 20, VH + 400); c.globalCompositeOperation = 'source-over';
  const v = c.createRadialGradient(camX + VW / 2, VH / 2, VH * 0.55, camX + VW / 2, VH / 2, VH * 1.25); v.addColorStop(0, 'rgba(40,50,20,0)'); v.addColorStop(1, 'rgba(40,50,20,.2)'); c.fillStyle = v; c.fillRect(camX - 10, 0, VW + 20, VH + 400);
}

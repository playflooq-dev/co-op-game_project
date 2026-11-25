'use strict';
// The city street as scenery: the sky and skyline, the buildings, pavement and road, the side street, the canal and the
// river, lamps and stalls, bunting, pigeons and drifting leaves. Nothing in this file can be bumped into or used: what
// the siblings play with is placed by the STATIONS in settings.js and run by lab.js. Where things stand is in settings.js.
// (Taken from the first city level's level.js and play.js, without the puzzles.)
const FEET = CITY.feet, BASE = CITY.facadeBase, HOR = CITY.horizon, KERB = CITY.kerb;
let camX = 0;
const W = (name) => SP[name][0];
let VIEW = [0, 1920]; // the part of the street being painted: the screen, or one strip that is kept
const inView = (a, b) => b > VIEW[0] - 60 && a < VIEW[1] + 60;

// ---------- the sky, the sun and the far skyline
const PARALLAX = [['skylineFar', 0.15, 690], ['skylineNear', 0.35, 830]];
function drawSky(c, t, k = S) {
  const u = clamp01(camX / (CITY.length - VW));
  c.fillStyle = lg(c, 0, 0, 0, BASE, ...SKY.start.map((s, i) => mixCol(s, SKY.end[i], u))); c.fillRect(camX - 10, 0, VW + 20, VH);
  const sx = camX + VW * SKY.sunX, sy = lerp(330, 610, u);
  c.fillStyle = rg(c, sx, sy, 900, `rgba(255,236,190,${0.75 + u * 0.2})`, 'rgba(255,222,170,.25)', 'rgba(255,222,170,0)'); c.fillRect(camX - 10, 0, VW + 20, VH);
  ell(c, sx, sy, 46, 46, '#fff4d0', 0.9);
  if (SP.clouds) { const cl = SP.clouds, off = camX * 0.05 + t * 4; c.globalAlpha = 0.8; for (let i = -1; i < 6; i++) { const x = camX + ((i * 520 - off) % 3120 + 3120) % 3120 - 400; putFast(c, cl[(i + 7) % cl.length], x, 90 + (i % 3) * 50, 0.7 + (i % 2) * 0.2, k); } c.globalAlpha = 1; }
  for (const [name, par, base] of PARALLAX) {
    const arts = SP[name], tw = arts[0].w, off = camX * par, start = Math.floor(off / tw);
    for (let i = start; i * tw - off < VW + tw; i++) putFast(c, arts[((i % arts.length) + arts.length) % arts.length], camX + i * tw - off, base, 1, k);
  }
  c.fillStyle = lg(c, 0, 560, 0, BASE, 'rgba(250,228,200,0)', 'rgba(250,228,200,.35)'); c.fillRect(camX - 10, 560, VW + 20, BASE - 560);
}

// ---------- gaps between the buildings: a side street, the canal or the river running away from the camera
const GAPS = [[ROAD[0], ROAD[1], 'road'], [CANAL[0], CANAL[1], 'water'], [RIVER[0], RIVER[1], 'water']];
function drawGap(c, x0, x1, kind) {
  if (!inView(x0, x1)) return;
  const cx = (x0 + x1) / 2, hw = kind === 'road' ? 36 : 70, k = 0.55;
  const P = (x, y, u) => [x + (cx - x) * u, y + (HOR - y) * u];
  for (const [ex, s] of [[x0, 1], [x1, -1]]) { // the side walls of the buildings beside the gap
    const top = BASE - 600, [bx, by] = P(ex, BASE, k), [tx, ty] = P(ex, top, k);
    c.fillStyle = lg(c, ex, 0, bx, 0, '#7d6670', '#9a8a94'); c.beginPath(); c.moveTo(ex, top); c.lineTo(tx, ty); c.lineTo(bx, by); c.lineTo(ex, BASE); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,230,190,.35)'; c.lineWidth = 2;
    for (let i = 1; i < 6; i++) { const yy = BASE - i * 100, [ax2, ay2] = P(ex, yy, k); c.beginPath(); c.moveTo(ex, yy); c.lineTo(ax2, ay2); c.stroke(); }
    c.fillStyle = 'rgba(255,220,150,.55)'; for (let i = 0; i < 5; i++) for (let j = 1; j < 4; j++) { const u = j * 0.13, [wx, wy] = P(ex, BASE - 70 - i * 100, u), hgt = 40 * (1 - u * 0.9); if ((i + j) % 2) c.fillRect(wx - (s > 0 ? 0 : 8), wy - hgt, 8 * (1 - u), hgt); }
  }
  if (kind === 'road') {
    c.fillStyle = textureFast(c, W('road')); c.beginPath(); c.moveTo(x0, BASE); c.lineTo(cx - hw, HOR); c.lineTo(cx + hw, HOR); c.lineTo(x1, BASE); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,240,210,.12)'; c.fill();
    c.strokeStyle = 'rgba(250,240,220,.7)'; c.setLineDash([16, 20]); c.lineWidth = 3; c.beginPath(); c.moveTo(cx, HOR + 4); c.lineTo(cx, BASE); c.stroke(); c.setLineDash([]);
    for (const s of [-1, 1]) { const ex = s < 0 ? x0 : x1; c.fillStyle = '#b9b0a4'; c.beginPath(); c.moveTo(ex, BASE); c.lineTo(ex + s * -22, BASE); c.lineTo(cx + s * hw * 0.8, HOR); c.lineTo(cx + s * hw, HOR); c.closePath(); c.fill(); }
  } else {
    c.fillStyle = lg(c, 0, HOR, 0, BASE, '#9ab8c8', '#6f9ab0'); c.beginPath(); c.moveTo(x0, BASE); c.lineTo(cx - hw, HOR); c.lineTo(cx + hw, HOR); c.lineTo(x1, BASE); c.closePath(); c.fill();
  }
}

// ---------- pavement, kerb and the main road in front
function drawGround(c) {
  const L = VIEW[0] - 20, R2 = VIEW[1] + 20;
  let x = L; const gaps = GAPS.filter((g) => g[1] > L && g[0] < R2).sort((a, b) => a[0] - b[0]);
  const band = (a, b) => {
    if (b <= a) return;
    const park = RIVER[1];
    const seg = (s0, s1, kind) => {
      if (s1 <= s0) return;
      if (kind === 'park') { c.fillStyle = SP.grassTexture ? textureFast(c, SP.grassTexture[0]) : '#7ea551'; c.fillRect(s0, BASE - 4, s1 - s0, 90); c.fillStyle = SP.pathTexture ? textureFast(c, SP.pathTexture[0]) : '#d9c49a'; c.fillRect(s0, FEET - 30, s1 - s0, 60); }
      else { c.fillStyle = textureFast(c, W(kind === 'market' ? 'cobbles' : 'pavement')); c.fillRect(s0, BASE, s1 - s0, KERB - BASE); }
      c.fillStyle = 'rgba(60,40,30,.18)'; c.fillRect(s0, BASE, s1 - s0, 10);
      c.fillStyle = lg(c, 0, KERB, 0, KERB + 14, '#e2dbd0', '#a8a096'); c.fillRect(s0, KERB, s1 - s0, 14);
      c.fillStyle = textureFast(c, W('road')); c.fillRect(s0, KERB + 14, s1 - s0, VH - KERB - 14);
      c.fillStyle = 'rgba(250,240,220,.75)'; for (let dx = Math.ceil(s0 / 120) * 120; dx < s1; dx += 120) c.fillRect(dx, 1052, 60, 5);
    };
    let s = a; const end = Math.min(b, park);
    for (const [m0, m1] of COBBLES) { const u0 = Math.max(s, m0), u1 = Math.min(end, m1); if (u1 > u0) { seg(s, u0, 'pave'); seg(u0, u1, 'market'); s = u1; } }
    seg(s, end, 'pave');
    seg(Math.max(a, park), b, 'park');
  };
  for (const g of gaps) { band(x, g[0]); x = Math.max(x, g[1]); }
  band(x, R2);
  for (const [g0, g1, kind] of gaps) {
    if (kind === 'road') { // the side street meets the main road: a zebra crossing along the pavement line
      c.fillStyle = textureFast(c, W('road')); c.fillRect(g0, BASE, g1 - g0, VH - BASE);
      c.fillStyle = 'rgba(248,244,236,.85)'; for (let zx = g0 + 18; zx < g1 - 30; zx += 48) c.fillRect(zx, BASE + 10, 26, KERB - BASE - 8);
    } else {
      c.fillStyle = lg(c, 0, BASE, 0, VH, '#6f9ab0', '#4f7f98', '#3f6a82'); c.fillRect(g0, BASE, g1 - g0, VH - BASE);
      for (const [ex, s] of [[g0, -1], [g1, 1]]) { c.fillStyle = textureFast(c, W('stone')); c.fillRect(s < 0 ? ex - 2 : ex - 16, BASE, 18, VH - BASE); c.fillStyle = 'rgba(20,30,40,.35)'; c.fillRect(s < 0 ? ex - 2 : ex - 16, 960, 18, VH - 960); }
    }
  }
}
function liveWater(c, t) { // glints on the canal and the river
  for (const [g0, g1, kind] of GAPS) {
    if (kind !== 'water' || !inView(g0, g1)) continue;
    const cx = (g0 + g1) / 2, hw = 70;
    c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const u = i / 6, y = lerp(HOR + 10, BASE - 10, u * u), w2 = lerp(hw, (g1 - g0) / 2, u * u) * 0.6; c.beginPath(); c.moveTo(cx - w2 + Math.sin(t + i) * 10, y); c.lineTo(cx - w2 * 0.4 + Math.sin(t + i) * 10, y); c.stroke(); }
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2.5;
    for (let i = 0; i < 9; i++) { const y = 970 + (i % 4) * 26, xx = g0 + ((i * 173 + t * 30) % (g1 - g0 - 40)); c.beginPath(); c.moveTo(xx, y); c.quadraticCurveTo(xx + 20, y - 5, xx + 40, y); c.stroke(); }
  }
}

// ---------- buildings and the things that stand along the pavement
function drawBuildings(c) {
  for (const [name, x] of BUILDINGS) {
    const a = W(name); if (!inView(x - a.ax, x - a.ax + a.w)) continue;
    if (name === 'warehouse') { // the flour mill has see-through holes for its shutter and arch: the yard shows behind them
      putFast(c, W('courtyard'), x, BASE); putFast(c, W('courtGate'), x + 170, 905, 0.9); putFast(c, a, x, BASE);
      const sw = 200, sh = 240, sx = x - 320 - sw / 2, top = BASE - sh; // the roll-up shutter, shut
      c.fillStyle = lg(c, sx, 0, sx + sw, 0, '#7f8a96', '#a8b2bc', '#8a949e'); c.fillRect(sx, top, sw, sh);
      c.strokeStyle = 'rgba(40,45,55,.45)'; c.lineWidth = 2; for (let y = top + sh - 12; y > top; y -= 12) { c.beginPath(); c.moveTo(sx, y); c.lineTo(sx + sw, y); c.stroke(); }
      c.fillStyle = '#5a646e'; c.fillRect(sx, top + sh - 8, sw, 8);
      continue;
    }
    putFast(c, a, x, BASE);
  }
}
function staticProps(c) {
  for (const [name, x] of PROPS) { const a = W(name); if (inView(x - a.ax, x - a.ax + a.w)) putFast(c, a, x, BASE + 12); }
  if (inView(RIVER[1] - 200, PARK_GATE + 600)) {
    PARK.forEach(([kind, x, s], i) => { if (SP[kind] && inView(x - 300, x + 300)) putFast(c, SP[kind][i % SP[kind].length], x, BASE + 16, s); });
    putFast(c, W('parkGate'), PARK_GATE, BASE + 18);
    for (const px of RIVER) { c.fillStyle = textureFast(c, W('stone')); c.fillRect(px - 26, FEET, 52, VH - FEET); c.fillStyle = 'rgba(20,30,40,.3)'; c.fillRect(px - 26, 980, 52, VH - 980); } // the bridge's stone piers
  }
}
function drawLampGlow(c) {
  const u = clamp01(camX / (CITY.length - VW));
  for (const [name, x] of PROPS) if (name === 'streetLamp' && inView(x - 100, x + 100)) soft(c, x, BASE + 12 - 410, 90, 80, '#ffe1a0', 0.12 + u * 0.45);
}
const FLAG_COLS = ['#d9534a', '#f2c94e', '#6fa8c9', '#fffbf0', '#6d9b45', '#e8728a'];
function drawBunting(c) { // strings of little flags over the street
  for (const [x0, x1, hgt] of BUNTING) {
    if (!inView(x0, x1)) continue;
    const span = 520, y = BASE + 12 - hgt; let k = 0;
    for (let a = x0; a < x1 - 40; a += span) {
      const b = Math.min(x1, a + span), sag = 46 * (b - a) / span, P = (u) => [lerp(a, b, u), y + Math.sin(u * Math.PI) * sag];
      c.strokeStyle = 'rgba(70,50,35,.7)'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i <= 20; i++) c.lineTo(...P(i / 20)); c.stroke();
      const n = Math.round((b - a) / 44);
      for (let i = 0; i < n; i++) { const [fx, fy] = P((i + 0.5) / n), [gx, gy] = P((i + 0.9) / n), [hx2, hy2] = P((i + 0.1) / n); c.beginPath(); c.moveTo(hx2, hy2); c.lineTo(gx, gy); c.lineTo(fx + ((i % 3) - 1) * 2, fy + 30); c.closePath(); fs(c, FLAG_COLS[k++ % FLAG_COLS.length], 'rgba(60,40,30,.45)', 1.2); }
    }
  }
}

// ---------- life along the street: pigeons that fly up when somebody runs through them, and drifting leaves
const FLOCKS = PIGEONS.map(([x, n]) => ({ x, away: 0, birds: Array.from({ length: n }, (_, i) => ({ dx: (i - (n - 1) / 2) * 44 + ((i * 37) % 23) - 11, dy: (i * 53) % 26, ph: i * 1.7, side: i % 2 ? 1 : -1, fx: 0.6 + ((i * 29) % 10) / 10 })) }));
function updatePigeons(dt, people) {
  for (const f of FLOCKS) {
    if (f.away > 0) { f.away -= dt; continue; }
    if (people.some((p) => Math.abs(p.x - f.x) < 170 && p.y > FEET - 60 && Math.abs(p.vx) > 60)) { f.away = 9; snd('flap'); }
  }
}
function drawPigeon(c, x, y, s, dir, flap, peck) {
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  if (flap === null) soft(c, 0, 2, 16, 4, '#2a1a0e', 0.3);
  c.beginPath(); c.moveTo(-15, -6); c.lineTo(-25, -9); c.lineTo(-23, -2); c.closePath(); fs(c, '#6f7d96', '#3a4458', 1.2);
  c.beginPath(); c.ellipse(-2, -9, 14, 9, -0.15, 0, TAU); fs(c, '#93a1ba', '#3a4458', 1.4);
  c.save(); c.translate(10, -17); c.rotate(peck); c.beginPath(); circ(c, 0, 0, 6.5); fs(c, '#7f8fb0', '#3a4458', 1.4); c.beginPath(); c.moveTo(5, -1); c.lineTo(12, 1); c.lineTo(5, 3); c.closePath(); fs(c, '#e2a84a'); ell(c, 1.5, -1.5, 1.4, 1.4, '#1c1a20'); c.restore();
  ell(c, 4, -11, 5, 3, '#8fc7a9', 0.7);
  if (flap === null) { c.beginPath(); c.ellipse(-4, -9, 9, 5.5, -0.2, 0, TAU); fs(c, '#7b89a4', '#3a4458', 1.2); c.strokeStyle = '#c9805a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-2, 0); c.lineTo(-2, 4); c.moveTo(3, 0); c.lineTo(3, 4); c.stroke(); }
  else { c.save(); c.translate(-3, -12); c.rotate(-0.4 + flap * 1.5); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-8, -22, 6, -28); c.quadraticCurveTo(10, -12, 8, 0); c.closePath(); fs(c, '#a9b6cc', '#3a4458', 1.2); c.restore(); }
  c.restore();
}
function drawPigeons(c, t) {
  for (const f of FLOCKS) {
    if (!inView(f.x - 900, f.x + 900)) continue;
    for (const b of f.birds) {
      const hx = f.x + b.dx, hy = FEET + 6 + b.dy;
      if (f.away <= 0) { const step = Math.sin(t * 0.5 + b.ph) * 18, pk = Math.sin(t * 2.2 * b.fx + b.ph); drawPigeon(c, hx + step, hy, 1, Math.cos(t * 0.5 + b.ph) > 0 ? 1 : -1, null, pk > 0.6 ? 0.9 : 0); continue; }
      const gone = 9 - f.away, back = f.away < 1.6;
      const u = back ? ease(1 - f.away / 1.6) : clamp01(gone / 1.7); if (!back && gone > 1.7) continue;
      const k = back ? 1 - u : u, fx = hx + b.side * k * (420 + b.fx * 260), fy = hy - k * (520 + b.fx * 180) - Math.sin(k * Math.PI) * 60;
      c.globalAlpha = 1 - k * 0.5; drawPigeon(c, fx, fy, 1 - k * 0.25, back ? -b.side : b.side, Math.sin(t * 26 + b.ph) * 0.5 + 0.5, 0); c.globalAlpha = 1;
    }
  }
}
const LEAVES = Array.from({ length: 9 }, (_, i) => ({ sx: (i * 0.137 + 0.05) % 1, sp: 26 + (i * 17) % 30, ph: i * 2.3, col: ['#d98a3a', '#e2b84a', '#c9603a', '#9aaa4a'][i % 4], s: 0.7 + (i % 3) * 0.2 }));
function drawLeaves(c, t) {
  for (const l of LEAVES) {
    const span = VW + 200, x = camX + VW + 100 - ((l.sx * span + t * l.sp * 2.2) % span), y = 180 + ((l.ph * 97 + t * l.sp) % 760), sway = Math.sin(t * 1.3 + l.ph) * 30;
    c.save(); c.translate(x + sway, y); c.rotate(t * 1.1 + l.ph + sway * 0.03); c.scale(l.s, l.s * (0.5 + Math.abs(Math.cos(t * 1.7 + l.ph)) * 0.5)); c.globalAlpha = 0.75;
    leafPath(c, 16, 6); fs(c, l.col, 'rgba(90,50,20,.5)', 1); c.restore();
  }
}

// ---------- painting. Everything that never moves is painted once, in strips, and kept; the sky is painted small and stretched.
const bg = mkBuf(), CHUNK = 640, chunks = new Map(); let chunkS = 0;
function paintStill(c) {
  for (const [g0, g1, kind] of GAPS) drawGap(c, g0, g1, kind);
  drawBuildings(c); drawBunting(c); drawGround(c); staticProps(c);
}
function streetChunk(i) {
  if (chunkS !== S) { chunks.clear(); chunkS = S; }
  let cvs = chunks.get(i); if (cvs) return cvs;
  cvs = document.createElement('canvas'); cvs.width = Math.ceil(CHUNK * S) + 2; cvs.height = Math.ceil(VH * S);
  const g = cvs.getContext('2d'); g.setTransform(S, 0, 0, S, -i * CHUNK * S, 0); g.lineCap = 'round'; g.lineJoin = 'round';
  const keep = VIEW; VIEW = [i * CHUNK, (i + 1) * CHUNK];
  paintStill(g);
  VIEW = keep; chunks.set(i, cvs);
  if (chunks.size > 14) { let far = null, fd = -1; for (const k of chunks.keys()) { const d = Math.abs(k - i); if (d > fd) { fd = d; far = k; } } chunks.delete(far); }
  return cvs;
}
function drawStreet(c, t) { // onto the screen, whose scale and scroll are already set
  VIEW = [camX, camX + VW];
  const half = S / 2, bw = Math.ceil(VW * half), bh = Math.ceil(VH * half); if (bg.cv.width !== bw || bg.cv.height !== bh) { bg.cv.width = bw; bg.cv.height = bh; }
  bg.c.setTransform(half, 0, 0, half, -camX * half, 0); drawSky(bg.c, t, half); c.drawImage(bg.cv, camX, 0, bg.cv.width / half, VH);
  for (let i = Math.floor(camX / CHUNK); i * CHUNK < camX + VW; i++) { const ch = streetChunk(i); c.drawImage(ch, i * CHUNK, 0, ch.width / S, VH); }
}
function drawStreetGlow(c) { // the warm evening light over everything, and darker corners
  c.globalCompositeOperation = 'soft-light'; c.fillStyle = 'rgba(255,205,135,.14)'; c.fillRect(camX - 10, 0, VW + 20, VH + 400); c.globalCompositeOperation = 'source-over';
  const v = c.createRadialGradient(camX + VW / 2, VH / 2, VH * 0.5, camX + VW / 2, VH / 2, VH * 1.2); v.addColorStop(0, 'rgba(50,30,15,0)'); v.addColorStop(1, 'rgba(50,30,15,.3)'); c.fillStyle = v; c.fillRect(camX - 10, 0, VW + 20, VH + 400);
}

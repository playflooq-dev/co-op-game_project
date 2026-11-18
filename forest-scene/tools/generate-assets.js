'use strict';
// The drawing code that painted the original PNG files in the assets folder.
// The game does not load this file. It is only used by tools/export.html to (re)create the images.
let GEN_SCALE = 2; // image pixels per scene unit for the sprite being painted
// A sprite is one piece of scenery. (ax, ay) is where its ground point sits inside the image.
function sprite(w, h, ax, ay, fn, o = {}) {
  let s = document.createElement('canvas'); s.width = Math.ceil(w * GEN_SCALE); s.height = Math.ceil(h * GEN_SCALE);
  const c = s.getContext('2d'); c.scale(GEN_SCALE, GEN_SCALE); c.translate(ax, ay); c.lineCap = 'round'; c.lineJoin = 'round'; fn(c);
  // Haze and depth blur are added by the game when it loads the image, so the saved art stays clean. Only "bake" blurs are kept.
  if (o.bake && o.blur) { const b = document.createElement('canvas'); b.width = s.width; b.height = s.height; const bc = b.getContext('2d'); bc.filter = `blur(${o.blur * GEN_SCALE}px)`; bc.drawImage(s, 0, 0); s = b; }
  return { cv: s, w, h, ax, ay };
}

// ---------- palettes: [deep shadow, shadow, base, light, shine]. The sun is upper right.
const GN = ['#27523a', '#3a6e41', '#55904c', '#7fb35c', '#b5d977'];
const GA = ['#2f5a3c', '#437646', '#5c9352', '#86b566', '#b9d987'];
const GB = ['#2c5a4a', '#3d7558', '#56906a', '#7dae7f', '#a8cf98'];
const PK = ['#8f566c', '#b47488', '#d596a6', '#ecbbc5', '#fde3e5'];
const OR = ['#8f431f', '#b9612c', '#dc8743', '#f2ae66', '#fcd893'];
const YL = ['#876c22', '#ad8d36', '#d4b04e', '#ebd07a', '#f9eaac'];

// ---------- foliage
function clusters(n, cx, cy, rx, ry, r0, r1) {
  const a = []; for (let i = 0; i < n; i++) { const an = R() * TAU, d = Math.sqrt(R()); a.push([cx + Math.cos(an) * rx * d, cy + Math.sin(an) * ry * d, rr(r0, r1)]); }
  return a.sort((p, q) => p[1] - q[1]);
}
// Leafy canopy: each clump gets its own shadow side, lit side and a scatter of small leaf marks.
function canopy(c, cl, pal, u = 1) {
  const [deep, dark, main, light, shine] = pal;
  c.fillStyle = deep; c.beginPath(); for (const [x, y, r] of cl) circ(c, x - 4 * u, y + 9 * u, r); c.fill();
  for (const [x, y, r] of cl) {
    const edge = [], n = Math.round(r / (2.2 * u)) + 5;
    for (let i = 0; i < n; i++) edge.push([R() * TAU, rr(5, 9) * u]);
    c.fillStyle = dark; c.beginPath(); circ(c, x, y, r);
    for (const [a, s] of edge) dab(c, x + Math.cos(a) * r * 0.96, y + Math.sin(a) * r * 0.96, s * 1.3, s * 0.75, a + 1.57); c.fill();
    c.fillStyle = main; c.beginPath(); circ(c, x + r * 0.06, y - r * 0.09, r * 0.92);
    for (const [a, s] of edge) if (Math.cos(a) * 0.55 - Math.sin(a) * 0.83 > -0.1) dab(c, x + Math.cos(a) * r * 0.98, y + Math.sin(a) * r * 0.98, s * 1.2, s * 0.7, a + 1.57); c.fill();
    c.globalAlpha = 0.85; c.fillStyle = light; c.beginPath(); circ(c, x + r * 0.2, y - r * 0.28, r * 0.58); c.fill(); c.globalAlpha = 1;
    const dn = Math.round(r * r / (70 * u * u)), bD = [], bL = [], bS = [];
    for (let i = 0; i < dn; i++) {
      const a = R() * TAU, d = Math.sqrt(R()) * 0.92, px = Math.cos(a) * d, py = Math.sin(a) * d, lit = px * 0.55 - py * 0.83;
      const e = [x + px * r, y + py * r, rr(4, 7.5) * u, rr(2, 3.6) * u, R() * 3.14];
      if (lit > 0.45 && R() < 0.5) bS.push(e); else if (lit > 0) bL.push(e); else if (lit < -0.3) bD.push(e);
    }
    for (const [col, b, al] of [[deep, bD, 0.55], [light, bL, 0.9], [shine, bS, 0.9]]) { c.fillStyle = col; c.globalAlpha = al; c.beginPath(); for (const e of b) dab(c, e[0], e[1], e[2], e[3], e[4]); c.fill(); }
    c.globalAlpha = 1;
  }
}
function trunk(c, h, w, lean) {
  c.fillStyle = lg(c, -w, 0, w, 0, '#463022', '#674733', '#8f6a4c'); c.beginPath(); c.moveTo(-w * 1.15, 4); c.quadraticCurveTo(-w * 0.5, -h * 0.08, -w * 0.42 + lean * 0.5, -h * 0.5);
  c.lineTo(lean - w * 0.28, -h); c.lineTo(lean + w * 0.28, -h); c.lineTo(w * 0.42 + lean * 0.5, -h * 0.5); c.quadraticCurveTo(w * 0.5, -h * 0.08, w * 1.15, 4); c.fill();
  c.strokeStyle = '#3a271b'; c.globalAlpha = 0.5; c.lineWidth = Math.max(1.2, w * 0.08);
  for (let i = 0; i < 7; i++) { const bx = rr(-0.3, 0.3) * w, k = rr(0.05, 0.75), l = rr(0.1, 0.22) * h; c.beginPath(); c.moveTo(bx + lean * k, -k * h); c.quadraticCurveTo(bx + 3 + lean * k, -k * h - l / 2, bx + lean * (k + l / h), -k * h - l); c.stroke(); }
  c.globalAlpha = 1;
}
function mkTree(pal, tall, petals) {
  return sprite(470, 560, 235, 520, (c) => {
    const H = rr(370, 430), lean = rr(-18, 18), w = rr(15, 21);
    soft(c, -12, 3, 90, 11, '#234a2c', 0.4);
    c.strokeStyle = '#5b4030'; c.lineWidth = w * 0.5;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(lean * 0.6, -H * 0.45); c.quadraticCurveTo(lean + s * 30, -H * 0.58, lean + s * rr(60, 95), -H * rr(0.68, 0.8)); c.stroke(); }
    trunk(c, H * 0.72, w, lean);
    canopy(c, tall ? clusters(11, lean, -H * 0.7, 78, 118, 44, 64) : clusters(12, lean, -H * 0.7, 125, 82, 46, 68), pal, 1);
    if (petals) for (let i = 0; i < 70; i++) ell(c, lean + rr(-150, 150), -H * 0.7 + rr(-130, 110), rr(1.6, 3), rr(1.6, 3), petals, rr(0.5, 0.95));
    c.fillStyle = '#4f8243'; c.beginPath(); for (let i = 0; i < 9; i++) blade(c, rr(-34, 34), 4, rr(10, 24), rr(-8, 8), rr(2, 3)); c.fill();
  }, { tint: [MIST, 0.08, 0.14] });
}
function mkConifer(pal, o) {
  return sprite(240, 460, 120, 440, (c) => {
    const H = 420, W = rr(150, 200), tiers = 7, ax = rr(-4, 4);
    c.fillStyle = lg(c, -7, 0, 7, 0, '#4a3628', '#7a5a42'); c.fillRect(-7, -H * 0.14, 14, H * 0.14 + 2);
    for (let i = 0; i < tiers; i++) {
      const k = i / tiers, yb = -H * 0.07 - k * H * 0.76, hw = W / 2 * (1 - k * 0.82), ht = H * 0.27 * (1 - k * 0.3), n = Math.max(2, Math.round(hw / 14)), pts = [];
      for (let j = 0; j <= n * 2; j++) { const u = j / (n * 2); pts.push([-hw + u * hw * 2, yb + (j % 2 ? -rr(6, 11) : rr(0, 6)) + Math.abs(u - 0.5) * 14]); }
      const poly = (list, dy) => { c.beginPath(); c.moveTo(ax, yb - ht + dy); for (const p of list) c.lineTo(p[0], p[1] + dy); c.closePath(); c.fill(); };
      if (i) { c.fillStyle = pal[0]; c.globalAlpha = 0.6; poly(pts, 9); c.globalAlpha = 1; }
      c.fillStyle = pal[1]; poly(pts, 0);
      c.fillStyle = pal[2]; poly(pts.slice(n), 0);
      c.fillStyle = pal[3]; c.globalAlpha = 0.55; poly(pts.slice(Math.floor(n * 1.5)), 0); c.globalAlpha = 1;
    }
  }, o);
}
function mkBush(pal, berries) {
  return sprite(270, 200, 135, 178, (c) => {
    soft(c, -6, 2, 105, 12, '#234a2c', 0.4);
    canopy(c, clusters(7, 0, -52, 70, 26, 30, 46), pal, 0.8);
    if (berries) for (let i = 0; i < 16; i++) { const x = rr(-85, 85), y = rr(-95, -20); ell(c, x, y, 3.6, 3.6, berries); ell(c, x + 1, y - 1.2, 1.2, 1.2, '#fff', 0.7); }
    for (const col of ['#3f7139', '#6a9f4e']) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 8; i++) blade(c, rr(-95, 95), 4, rr(12, 28), rr(-8, 8), rr(2, 3)); c.fill(); }
  });
}
function mkTuft(cols, n, hmax) {
  return sprite(100, hmax + 24, 50, hmax + 14, (c) => { for (const col of cols) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < n; i++) blade(c, rr(-24, 24), rr(0, 5), rr(0.45, 1) * hmax, rr(-15, 15), rr(2, 3.6)); c.fill(); } });
}
function mkFlowers(kind, col, col2) {
  return sprite(170, 170, 85, 156, (c) => {
    const st = [], n = 5 + Math.floor(R() * 4);
    for (let i = 0; i < n; i++) st.push([rr(-48, 48), rr(45, 120), rr(-14, 14)]);
    for (const g of ['#3f7139', '#62994c']) { c.fillStyle = g; c.beginPath(); for (let i = 0; i < 9; i++) blade(c, rr(-52, 52), 3, rr(18, 50), rr(-16, 16), rr(2.5, 4.5)); c.fill(); }
    c.strokeStyle = '#477a3c'; c.lineWidth = 2.6;
    for (const [x, h, b] of st) {
      c.beginPath(); c.moveTo(x, 2); c.quadraticCurveTo(x, -h * 0.6, x + b, -h); c.stroke();
      c.save(); c.translate(x + b * 0.3, -h * 0.45); c.rotate(b > 0 ? 1 : -1); c.fillStyle = '#5a9247'; leafPath(c, 14, 4.5); c.fill(); c.restore();
    }
    for (const [x, h, b] of st) {
      c.save(); c.translate(x + b, -h);
      if (kind === 'daisy') { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; dab(c, Math.cos(a) * 7, Math.sin(a) * 7, 6, 3, a); } c.fill(); ell(c, 0, 0, 4.2, 4.2, col2); ell(c, 1, -1, 1.6, 1.6, '#fff', 0.6); }
      else if (kind === 'tulip') {
        c.fillStyle = col; c.beginPath(); c.moveTo(-7, 0); c.quadraticCurveTo(-10, -12, -5, -17); c.lineTo(-2, -11); c.lineTo(0, -19); c.lineTo(2, -11); c.lineTo(5, -17); c.quadraticCurveTo(10, -12, 7, 0); c.quadraticCurveTo(0, 5, -7, 0); c.fill();
        c.fillStyle = col2; c.beginPath(); c.moveTo(0, 2); c.quadraticCurveTo(7, -4, 5, -15); c.quadraticCurveTo(10, -10, 7, 0); c.quadraticCurveTo(4, 3, 0, 2); c.fill();
      } else if (kind === 'spike') { for (let i = 0; i < 7; i++) { const yy = i * 7 - 8, r2 = 2.6 + i * 0.55; ell(c, -r2 * 0.8, yy, r2, r2 * 0.85, col); ell(c, r2 * 0.8, yy + 2, r2, r2 * 0.85, col2); } }
      else { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.4; circ(c, Math.cos(a) * 6, Math.sin(a) * 6, 6.5); } c.fill(); c.fillStyle = col2; c.beginPath(); circ(c, 2.5, -2.5, 5); c.fill(); ell(c, 0, 0, 3.4, 3.4, '#3a2a22'); }
      c.restore();
    }
  });
}
function mkRock(tone, moss, o) {
  return sprite(280, 200, 140, 172, (c) => {
    const s = 100, n = 7, pts = [];
    for (let i = 0; i <= n; i++) { const a = Math.PI + (i / n) * Math.PI; pts.push([Math.cos(a) * s * rr(0.85, 1.1), Math.sin(a) * s * rr(0.55, 0.9), a]); }
    pts[0][1] = 0; pts[n][1] = 0;
    soft(c, -14, 3, 125, 13, '#1f3d28', 0.45);
    const top = [rr(-12, 18), -s * rr(0.3, 0.42)];
    c.fillStyle = lg(c, 0, top[1], 0, 4, tone[1], tone[0]); c.beginPath(); c.moveTo(pts[0][0], 2); c.lineTo(top[0], top[1]); c.lineTo(pts[n][0], 2); c.closePath(); c.fill();
    for (let i = 0; i < n; i++) {
      const a = (pts[i][2] + pts[i + 1][2]) / 2, lit = Math.cos(a) * 0.55 - Math.sin(a) * 0.83;
      c.fillStyle = tone[lit < 0 ? 0 : lit < 0.5 ? 1 : lit < 0.8 ? 2 : 3];
      c.beginPath(); c.moveTo(pts[i][0], pts[i][1]); c.lineTo(pts[i + 1][0], pts[i + 1][1]); c.lineTo(top[0], top[1]); c.closePath(); c.fill(); c.strokeStyle = c.fillStyle; c.lineWidth = 1; c.stroke();
    }
    c.strokeStyle = rgba('#ffffff', 0.28); c.lineWidth = 1.6; c.beginPath(); for (let i = 3; i < n; i++) { c.moveTo(top[0], top[1]); c.lineTo(pts[i][0], pts[i][1]); } c.stroke();
    c.strokeStyle = rgba('#2c2a26', 0.5); c.lineWidth = 1.8; c.beginPath(); c.moveTo(top[0] - 20, top[1] + 14); c.lineTo(top[0] - 30, top[1] + 34); c.lineTo(top[0] - 22, -6); c.moveTo(top[0] + 34, -30); c.lineTo(top[0] + 44, -8); c.stroke();
    for (let i = 0; i < 26; i++) ell(c, rr(-70, 80), rr(-50, -4), rr(1, 2.4), rr(1, 2), i % 2 ? '#3c3a35' : '#e3ddcf', 0.3);
    if (moss) for (const [col, cnt] of [['#3f6b38', 34], ['#5f8f47', 30], ['#8dba5c', 16]]) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < cnt; i++) { const k = rr(0.1, 0.62), a = Math.PI + k * Math.PI, d = rr(0.72, 1) * s; dab(c, Math.cos(a) * d * 0.95, Math.sin(a) * d * 0.68, rr(5, 10), rr(3, 5), R() * 3); } c.fill(); }
    for (const col of ['#3f7139', '#6a9f4e']) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 9; i++) blade(c, (i % 2 ? 1 : -1) * rr(60, 118), 4, rr(12, 30), rr(-9, 9), rr(2, 3.2)); c.fill(); }
  }, o);
}
function mkShroom() {
  return sprite(90, 80, 45, 70, (c) => {
    for (const [dx, h, s] of [[-14, 20, 0.7], [14, 16, 0.6], [0, 30, 1]]) {
      c.fillStyle = lg(c, dx - 5 * s, 0, dx + 5 * s, 0, '#d9c9ac', '#fbf1dc'); rrect(c, dx - 4.5 * s, -h, 9 * s, h + 1, 3 * s); c.fill();
      ell(c, dx, -h + 1, 13 * s, 2.6 * s, '#f1e2c4');
      c.fillStyle = lg(c, dx - 15 * s, 0, dx + 15 * s, 0, '#a2362a', '#e2634b'); c.beginPath(); c.ellipse(dx, -h, 16 * s, 12 * s, 0, Math.PI, 0); c.closePath(); c.fill();
      ell(c, dx - 6 * s, -h - 6 * s, 2.6 * s, 2 * s, '#fff'); ell(c, dx + 5 * s, -h - 4 * s, 2 * s, 1.6 * s, '#fff'); ell(c, dx + 1 * s, -h - 9 * s, 1.6 * s, 1.3 * s, '#fff');
    }
  });
}
function mkLog() {
  return sprite(340, 160, 170, 126, (c) => {
    soft(c, 0, 3, 160, 14, '#1f3d28', 0.45);
    const r = 30, x0 = -130, x1 = 110;
    c.fillStyle = lg(c, 0, -r * 2, 0, 0, '#a07a57', '#6e4b34', '#3f281b'); rrect(c, x0, -r * 2, x1 - x0, r * 2, 14); c.fill();
    for (let i = 0; i < 18; i++) { const y = -rr(4, r * 2 - 4), a = rr(x0 + 6, x1 - 60), l = rr(30, 90); c.strokeStyle = i % 4 ? rgba('#2f1d13', rr(0.3, 0.55)) : rgba('#d2a877', 0.35); c.lineWidth = rr(1.4, 3); c.beginPath(); c.moveTo(a, y); c.quadraticCurveTo(a + l / 2, y + rr(-3, 3), Math.min(x1 - 8, a + l), y); c.stroke(); }
    c.beginPath(); c.ellipse(x1, -r, 15, r, 0, 0, TAU); fs(c, lg(c, x1 - 15, 0, x1 + 15, 0, '#c9a574', '#ead3a4'), '#5a3c28', 3);
    c.strokeStyle = '#a98456'; c.lineWidth = 1.6; for (const k of [0.72, 0.46, 0.2]) { c.beginPath(); c.ellipse(x1, -r, 15 * k, r * k, 0, 0, TAU); c.stroke(); }
    c.strokeStyle = '#5a3c28'; c.lineWidth = 9; c.beginPath(); c.moveTo(-40, -r * 2 + 4); c.lineTo(-52, -r * 2 - 14); c.stroke(); ell(c, -53, -r * 2 - 16, 5, 4, '#d6b383');
    for (const [col, n] of [['#3f6b38', 44], ['#5f8f47', 40], ['#8dba5c', 22]]) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < n; i++) dab(c, rr(x0 + 4, x1 - 30), -r * 2 + rr(-3, 12), rr(5, 10), rr(3, 5), R() * 3); c.fill(); }
    for (const [dx, s] of [[-96, 1], [-80, 0.7]]) { c.fillStyle = '#f1e2c4'; c.fillRect(dx - 2 * s, -r * 2 - 12 * s, 4 * s, 12 * s); c.fillStyle = '#d98a3a'; c.beginPath(); c.ellipse(dx, -r * 2 - 12 * s, 9 * s, 7 * s, 0, Math.PI, 0); c.closePath(); c.fill(); }
    for (const col of ['#3f7139', '#6a9f4e']) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 12; i++) blade(c, rr(x0 - 10, x1 + 20), 5, rr(12, 30), rr(-9, 9), rr(2, 3.2)); c.fill(); }
  });
}
function plank(c, x, y, w, h, dir, text, size) {
  c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rr(-0.05, 0.05));
  const a = w / 2, b = h / 2;
  c.beginPath();
  if (dir > 0) { c.moveTo(-a, -b); c.lineTo(a - 22, -b); c.lineTo(a, 0); c.lineTo(a - 22, b); c.lineTo(-a, b); } else { c.moveTo(a, -b); c.lineTo(-a + 22, -b); c.lineTo(-a, 0); c.lineTo(-a + 22, b); c.lineTo(a, b); }
  c.closePath(); fs(c, lg(c, 0, -b, 0, b, '#cfa677', '#a47a50'), '#5a3c28', 2.5);
  c.strokeStyle = rgba('#6e4b34', 0.3); c.lineWidth = 1.2; c.beginPath(); for (let i = 0; i < 4; i++) { const yy = -b + 6 + i * (h - 12) / 3; c.moveTo(-a + 12, yy); c.quadraticCurveTo(0, yy + rr(-3, 3), a - 14, yy + rr(-2, 2)); } c.stroke();
  const px = -(x + w / 2); ell(c, px, -b + 8, 2.2, 2.2, '#3b2a20'); ell(c, px, b - 8, 2.2, 2.2, '#3b2a20');
  c.fillStyle = '#4a2f1e'; c.font = `italic 600 ${size}px Georgia, serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, -dir * 6, 1);
  c.restore();
}
function mkSign() {
  return sprite(280, 260, 130, 238, (c) => {
    soft(c, -6, 2, 60, 9, '#1f3d28', 0.45);
    c.fillStyle = lg(c, -8, 0, 8, 0, '#56392a', '#99704e'); rrect(c, -8, -204, 16, 206, 3); c.fill();
    c.strokeStyle = rgba('#3b271b', 0.5); c.lineWidth = 1.3; c.beginPath(); for (let i = 0; i < 5; i++) { const x = rr(-5, 5), y = -rr(10, 150); c.moveTo(x, y); c.lineTo(x + rr(-1, 1), y - rr(20, 44)); } c.stroke();
    ell(c, 0, -204, 8, 3, '#b58a62');
    plank(c, -66, -190, 176, 46, 1, 'the trail', 22); plank(c, -88, -130, 132, 36, -1, 'home', 18);
    for (const col of ['#3f7139', '#6a9f4e']) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 9; i++) blade(c, rr(-26, 26), 4, rr(12, 30), rr(-9, 9), rr(2, 3.2)); c.fill(); }
  });
}
function mkFence() {
  return sprite(470, 140, 24, 116, (c) => {
    for (const y of [-72, -40]) { c.save(); c.translate(0, y); c.rotate(rr(-0.012, 0.012)); rrect(c, -14, -6, 448, 12, 3); fs(c, lg(c, 0, -6, 0, 6, '#c6a078', '#96704c'), '#5a3c28', 1.8); c.strokeStyle = rgba('#5a3c28', 0.3); c.lineWidth = 1; c.beginPath(); c.moveTo(0, -1); c.lineTo(420, 1); c.stroke(); c.restore(); }
    for (let i = 0; i < 4; i++) {
      const x = i * 140 + rr(-4, 4), h = rr(86, 98);
      soft(c, x - 4, 2, 26, 6, '#1f3d28', 0.4);
      c.save(); c.translate(x, 0); c.rotate(rr(-0.05, 0.05)); c.fillStyle = lg(c, -7, 0, 7, 0, '#64432f', '#ad845c'); rrect(c, -7, -h, 14, h + 2, 3); c.fill(); ell(c, 0, -h + 1, 7, 2.6, '#c9a57c');
      ell(c, 0, -72, 1.8, 1.8, '#3b2a20'); ell(c, 0, -40, 1.8, 1.8, '#3b2a20'); c.restore();
      for (const col of ['#3f7139', '#6a9f4e']) { c.fillStyle = col; c.beginPath(); for (let j = 0; j < 5; j++) blade(c, x + rr(-16, 16), 4, rr(10, 24), rr(-8, 8), rr(2, 3)); c.fill(); }
    }
  });
}
function mkFern(c0, c1, o) {
  return sprite(660, 430, 330, 400, (c) => {
    const fr = 5 + Math.floor(R() * 3);
    for (let f = 0; f < fr; f++) {
      const ang = (f / (fr - 1) - 0.5) * 1.9 + rr(-0.12, 0.12), len = rr(210, 320) * (1 - Math.abs(ang) * 0.2), curl = ang * rr(0.5, 0.9), seg = 15, pts = [];
      let x = 0, y = 0, a = -Math.PI / 2 + ang * 0.75;
      for (let i = 0; i < seg; i++) { a += curl / seg; x += Math.cos(a) * len / seg; y += Math.sin(a) * len / seg; pts.push([x, y, a]); }
      for (let i = 1; i < seg; i++) {
        const k = i / seg, l = (Math.sin(Math.PI * Math.pow(k, 0.7)) * 0.2 + 0.03) * len;
        for (const s of [-1, 1]) { c.save(); c.translate(pts[i][0], pts[i][1]); c.rotate(pts[i][2] + s * 1.15 + Math.PI / 2); c.fillStyle = s < 0 ? c0 : c1; leafPath(c, l, l * 0.2); c.fill(); c.restore(); }
      }
      c.strokeStyle = c0; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); for (const p of pts) c.lineTo(p[0], p[1]); c.stroke();
    }
  }, o);
}
function mkBroad(c0, c1, o) {
  return sprite(520, 340, 260, 318, (c) => {
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a = (i / (n - 1) - 0.5) * 2 + rr(-0.15, 0.15), len = rr(170, 270) * (1 - Math.abs(a) * 0.2), wd = len * rr(0.2, 0.27);
      c.save(); c.rotate(a); c.fillStyle = c0; leafPath(c, len, wd); c.fill();
      c.fillStyle = c1; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(wd, -len * 0.5, 0, -len); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(10,30,20,.35)'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -len * 0.94);
      for (let v = 0.2; v < 0.9; v += 0.14) { const vw = wd * 0.42 * Math.sin(v * 3.1); c.moveTo(0, -len * v); c.lineTo(vw, -len * (v + 0.09)); c.moveTo(0, -len * v); c.lineTo(-vw, -len * (v + 0.09)); }
      c.stroke(); c.restore();
    }
  }, o);
}
function mkPoppies(o) {
  return sprite(260, 300, 130, 280, (c) => {
    for (const [x, h, b] of [[-50, 150, -20], [10, 220, 14], [56, 170, 26]]) {
      c.strokeStyle = '#2f5a42'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, 6); c.quadraticCurveTo(x, -h * 0.5, x + b, -h); c.stroke();
      c.save(); c.translate(x + b * 0.25, -h * 0.4); c.rotate(b > 0 ? 0.9 : -0.9); c.fillStyle = '#3f6e50'; leafPath(c, 46, 11); c.fill(); c.restore();
      c.fillStyle = '#b8402f'; c.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.3; circ(c, x + b + Math.cos(a) * 14, -h + Math.sin(a) * 14, 15); } c.fill();
      c.fillStyle = '#dd6148'; c.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.3; circ(c, x + b + Math.cos(a) * 12 + 3, -h + Math.sin(a) * 12 - 3, 10); } c.fill();
      ell(c, x + b, -h, 8, 8, '#2c2420'); ell(c, x + b, -h, 3.5, 3.5, '#f0c05a');
    }
  }, o);
}

// ---------- big foreground trees
function branch(c, x0, y0, cx, cy, x1, y1, w0, w1, col, hi) {
  let px = x0, py = y0;
  for (let i = 1; i <= 10; i++) {
    const k = i / 10, q = 1 - k, x = q * q * x0 + 2 * q * k * cx + k * k * x1, y = q * q * y0 + 2 * q * k * cy + k * k * y1, w = w0 + (w1 - w0) * k;
    c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(px, py); c.lineTo(x, y); c.stroke();
    if (hi) { c.strokeStyle = hi; c.lineWidth = w * 0.22; c.beginPath(); c.moveTo(px + 2, py - w * 0.28); c.lineTo(x + 2, y - w * 0.28); c.stroke(); }
    px = x; py = y;
  }
}
function mkBigTree() {
  return sprite(1300, 1030, 650, 915, (c) => {
    const w = rr(125, 160), H = 915, bk = ['#38251a', '#553a29', '#74523a', '#98714f'];
    soft(c, -30, 6, w * 2.3, 26, '#1c3a26', 0.5);
    canopy(c, clusters(9, 0, -720, 460, 90, 90, 130), ['#1f4631', '#285638', '#346a40', '#3f7a46', '#4d8a4e'], 1.8);
    const brs = [[-1, rr(520, 600), rr(380, 470), rr(690, 760), 0.36], [1, rr(560, 650), rr(380, 480), rr(720, 790), 0.32], [-1, rr(700, 760), 250, 860, 0.2], [1, rr(690, 760), 230, 880, 0.2]];
    for (const [s, y0, dx, y1, th] of brs) {
      branch(c, s * w * 0.15, -y0 + 60, s * dx * 0.45, -y0 - 20, s * dx, -y1, w * th, w * th * 0.4, bk[1], s > 0 ? rgba(bk[3], 0.6) : null);
      branch(c, s * dx * 0.55, -(y0 + (y1 - y0) * 0.5), s * dx * 0.7, -y1 - 20, s * dx * 0.78, -y1 - 90, w * th * 0.35, w * th * 0.15, bk[1]);
    }
    for (const [s, len, yy] of [[-1, 1.7, 0], [-1, 1.05, 8], [1, 1.8, 2], [1, 1.1, 9], [1, 0.5, 12], [-1, 0.45, 12]]) {
      c.fillStyle = s > 0 ? lg(c, 0, -60, 0, 14, bk[2], bk[1]) : lg(c, 0, -60, 0, 14, bk[1], bk[0]);
      c.beginPath(); c.moveTo(s * w * 0.32, -150); c.quadraticCurveTo(s * w * 0.5, -30, s * w * len, yy + 4); c.lineTo(s * w * (len - 0.1), yy + 13); c.quadraticCurveTo(s * w * 0.4, 6, s * w * 0.05, yy + 6); c.lineTo(0, -150); c.closePath(); c.fill();
    }
    const tr = () => { c.beginPath(); c.moveTo(-w * 0.6, 6); c.quadraticCurveTo(-w * 0.47, -140, -w * 0.44, -330); c.lineTo(-w * 0.35, -H); c.lineTo(w * 0.35, -H); c.lineTo(w * 0.44, -330); c.quadraticCurveTo(w * 0.47, -140, w * 0.6, 6); c.closePath(); };
    tr(); c.fillStyle = lg(c, -w * 0.55, 0, w * 0.55, 0, bk[0], bk[1], bk[1], bk[2], bk[3]); c.fill();
    c.save(); tr(); c.clip();
    for (let i = 0; i < 64; i++) {
      const bx = rr(-0.55, 0.55) * w, y0 = -rr(0, H), l = rr(50, 180), lit = bx > w * 0.1 && i % 3 === 0;
      c.strokeStyle = lit ? rgba('#c49a6e', rr(0.2, 0.4)) : rgba(bk[0], rr(0.25, 0.6)); c.lineWidth = rr(1.5, 4.5);
      c.beginPath(); c.moveTo(bx, y0); c.bezierCurveTo(bx + rr(-9, 9), y0 - l * 0.33, bx + rr(-9, 9), y0 - l * 0.66, bx + rr(-5, 5), y0 - l); c.stroke();
    }
    c.fillStyle = lg(c, 0, -H, 0, -H + 420, 'rgba(20,35,25,.6)', 'rgba(20,35,25,0)'); c.fillRect(-w, -H, w * 2, 420);
    for (const [col, n] of [['#3f6b38', 70], ['#5f8f47', 60], ['#86b35a', 30]]) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < n; i++) { const k = Math.pow(R(), 1.8); dab(c, rr(-0.62, 0.15) * w, -k * 300 + 4, rr(4, 9), rr(2.5, 5), R() * 3); } c.fill(); }
    c.restore();
    if (R() < 0.8) { const kx = rr(-0.12, 0.16) * w, ky = -rr(330, 470); c.beginPath(); c.ellipse(kx, ky, w * 0.13, w * 0.19, 0.1, 0, TAU); fs(c, bk[2], bk[0], 4); ell(c, kx + 1, ky + 2, w * 0.08, w * 0.13, '#1e130c'); }
    for (let i = 0; i < 3; i++) { const fy = -rr(170, 200) - i * 44, fx = -w * 0.46, fw = 24 - i * 3; ell(c, fx, fy + 3, fw, 7, '#b89462'); c.fillStyle = '#f0dcb4'; c.beginPath(); c.ellipse(fx, fy, fw, 8, 0, Math.PI, 0); c.closePath(); c.fill(); }
    c.strokeStyle = '#35602f'; c.lineWidth = 3; c.beginPath(); const iv = [], ph0 = rr(0, 6);
    for (let y = 0; y <= 560; y += 14) { const x = Math.sin(y * 0.013 + ph0) * w * 0.3 + w * 0.08; iv.push([x, -y]); if (y) c.lineTo(x, -y); else c.moveTo(x, -y); } c.stroke();
    iv.forEach(([x, y], i) => { c.save(); c.translate(x, y); c.rotate((i % 2 ? 1 : -1) * 1.1 + rr(-0.3, 0.3)); c.fillStyle = pick(['#3f7a3c', '#5a9a4a', '#7fb85a']); leafPath(c, rr(13, 20), rr(6, 9)); c.fill(); c.restore(); });
    const front = clusters(17, 0, -800, 500, 95, 85, 135).concat(brs.slice(0, 2).map(([s, , dx, y1]) => [s * dx, -y1 + 10, rr(95, 120)]));
    canopy(c, front.sort((a, b) => a[1] - b[1]), GN, 1.8);
  });
}

// ---------- waterfall: cliff and bridge are a sprite, the water is drawn live every frame
function bridge(c, bx, by, bw) {
  const cx = bx + bw / 2, ar = 118, st = ['#7a695c', '#978473', '#b3a08d', '#cbbba7'];
  const body = () => { c.beginPath(); c.rect(bx, by, bw, 12 - by); c.moveTo(cx + ar, 12); c.lineTo(cx + ar, -30); c.ellipse(cx, -30, ar, ar * 0.95, 0, 0, Math.PI, true); c.lineTo(cx - ar, 12); c.closePath(); };
  c.save(); body(); c.clip('evenodd');
  c.fillStyle = st[1]; c.fillRect(bx, by, bw, 200);
  for (let row = 0, y = by + 22; y < 12; row++, y += 17) for (let x = bx - (row % 2) * 22; x < bx + bw; x += 44) { c.fillStyle = pick(st); c.globalAlpha = rr(0.35, 0.85); rrect(c, x + 1.5, y + 1.5, 41, 14, 3); c.fill(); }
  c.globalAlpha = 1;
  c.fillStyle = lg(c, bx, 0, bx + bw, 0, 'rgba(50,40,45,.3)', 'rgba(50,40,45,.05)', 'rgba(255,240,200,.14)'); c.fillRect(bx, by, bw, 200);
  c.fillStyle = lg(c, 0, by, 0, by + 34, 'rgba(40,30,30,.3)', 'rgba(40,30,30,0)'); c.fillRect(bx, by, bw, 34);
  for (const [col, n] of [['#4d7a40', 40], ['#77a853', 26]]) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < n; i++) dab(c, rr(bx, bx + bw), rr(-20, 12), rr(5, 10), rr(3, 5), R() * 3); c.fill(); }
  c.restore();
  for (let i = 0; i < 15; i++) {
    const a0 = Math.PI + (i / 15) * Math.PI, a1 = Math.PI + ((i + 1) / 15) * Math.PI, r0 = ar, r1 = ar + 22;
    c.beginPath(); c.moveTo(cx + Math.cos(a0) * r0, -30 + Math.sin(a0) * r0 * 0.95); c.lineTo(cx + Math.cos(a0) * r1, -30 + Math.sin(a0) * r1 * 0.95); c.lineTo(cx + Math.cos(a1) * r1, -30 + Math.sin(a1) * r1 * 0.95); c.lineTo(cx + Math.cos(a1) * r0, -30 + Math.sin(a1) * r0 * 0.95); c.closePath();
    fs(c, i > 7 ? pick([st[2], st[3]]) : pick([st[1], st[2]]), st[0], 1.6);
  }
  rrect(c, bx - 12, by - 8, bw + 24, 16, 4); fs(c, lg(c, 0, by - 8, 0, by + 8, st[3], st[1]), st[0], 1.6);
  for (let x = bx - 4; x < bx + bw - 20; x += 46) { rrect(c, x + 4, by - 31, 34, 23, 4); fs(c, pick([st[2], st[3]]), st[0], 1.5); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(x + 7, by - 29, 28, 3); }
  for (let i = 0; i < 6; i++) {
    const vx = rr(bx + 10, bx + bw - 10), vl = rr(30, 95); if (Math.abs(vx - cx) < ar - 10 && vl > 40) continue;
    c.strokeStyle = '#3f6e39'; c.lineWidth = 2; c.beginPath(); c.moveTo(vx, by + 6); c.quadraticCurveTo(vx + rr(-8, 8), by + vl / 2, vx + rr(-6, 6), by + vl); c.stroke();
    for (let y = by + 12; y < by + vl; y += 10) { c.save(); c.translate(vx + rr(-3, 3), y); c.rotate(rr(1.6, 4.6)); c.fillStyle = pick(['#3f7a3c', '#5a9a4a', '#7fb85a']); leafPath(c, 10, 4.5); c.fill(); c.restore(); }
  }
  for (const [col, n] of [['#4d7a40', 26], ['#77a853', 18]]) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < n; i++) dab(c, rr(bx, bx + bw), by - 9 + rr(-3, 3), rr(5, 9), rr(2.5, 4), R() * 0.5); c.fill(); }
}
function mkFallBack() {
  return sprite(1220, 520, 420, 440, (c) => {
    const top = -240, rk = ['#5a5d55', '#7b7e71', '#9b9d8d', '#bcbdab'];
    // far bank mound at the right end of the bridge
    c.fillStyle = lg(c, 0, -190, 0, 20, '#8bb85f', '#6d9b4c'); c.beginPath(); c.moveTo(620, 20); c.quadraticCurveTo(650, -200, 720, -196); c.quadraticCurveTo(790, -150, 800, 20); c.fill();
    canopy(c, clusters(6, 716, -208, 46, 16, 26, 40), GA, 0.8);
    // cliff
    const sil = [[-390, 12], [-345, -118], [-306, -150], [-276, top + 22], [-120, top - 16], [0, top], [118, top + 4], [152, top + 58], [172, -92], [200, 12]];
    c.beginPath(); sil.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fillStyle = lg(c, -390, 0, 200, 0, rk[1], rk[2], rk[2]); c.fill();
    c.save(); c.clip();
    const fac = (pts, col, a) => { c.globalAlpha = a; c.fillStyle = col; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); c.globalAlpha = 1; };
    fac([[-390, 12], [-345, -118], [-306, -150], [-250, -60], [-270, 12]], rk[0], 0.65);
    fac([[-306, -150], [-276, top + 22], [-200, top + 30], [-190, -110], [-250, -60]], rk[1], 0.8);
    fac([[-200, top + 30], [-120, top - 16], [-30, top + 20], [-60, -120], [-190, -110]], rk[3], 0.55);
    fac([[-190, -110], [-60, -120], [-40, 12], [-270, 12], [-250, -60]], rk[2], 0.5);
    fac([[118, top + 4], [152, top + 58], [172, -92], [200, 12], [112, 12]], rk[3], 0.5);
    c.fillStyle = lg(c, 0, -80, 0, 14, 'rgba(40,50,45,0)', 'rgba(40,50,45,.4)'); c.fillRect(-400, -80, 620, 100);
    c.strokeStyle = rgba('#3f423c', 0.55); c.lineWidth = 2.2;
    for (let i = 0; i < 12; i++) { const x = rr(-360, -60), y = rr(top + 40, -10), l = rr(30, 90); c.beginPath(); c.moveTo(x, y); c.lineTo(x + l * 0.5, y + rr(-6, 6)); c.lineTo(x + l, y + rr(-8, 8)); c.stroke(); }
    c.strokeStyle = rgba('#ffffff', 0.22); c.lineWidth = 1.6;
    for (let i = 0; i < 8; i++) { const x = rr(-340, -60), y = rr(top + 40, -20), l = rr(20, 60); c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y + rr(-5, 5)); c.stroke(); }
    c.fillStyle = '#48554f'; c.fillRect(-8, top - 2, 126, 260);
    for (const [col, n] of [['#3f6b38', 40], ['#5f8f47', 34]]) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < n; i++) dab(c, rr(-380, -20), rr(-70, 10), rr(5, 11), rr(3, 5), R() * 3); c.fill(); }
    c.restore();
    // grass cap, overhanging blades, vines
    const cap = () => { c.beginPath(); c.moveTo(-292, top + 30); c.quadraticCurveTo(-200, top - 36, -120, top - 24); c.lineTo(-4, top - 6); c.lineTo(-4, top + 10); c.quadraticCurveTo(-120, top - 2, -200, top + 14); c.quadraticCurveTo(-250, top + 22, -292, top + 30); c.closePath(); };
    cap(); c.fillStyle = lg(c, 0, top - 30, 0, top + 30, '#93c263', '#5f9147'); c.fill();
    c.beginPath(); c.moveTo(114, top - 2); c.quadraticCurveTo(140, top - 8, 158, top + 56); c.lineTo(146, top + 52); c.quadraticCurveTo(134, top + 10, 114, top + 10); c.closePath(); c.fill();
    for (const col of ['#4d7f43', '#7fb357']) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 34; i++) { const x = rr(-285, -8), k = (x + 285) / 277, y = top + 22 - Math.sin(k * 2.2) * 34 + k * 8; blade(c, x, y, -rr(10, 26), rr(-6, 6), rr(2, 3.2)); blade(c, x + 4, y - 12, rr(8, 20), rr(-8, 8), rr(2, 3)); } c.fill(); }
    for (let i = 0; i < 7; i++) {
      const vx = rr(-270, -20), k = (vx + 285) / 277, vy = top + 20 - Math.sin(k * 2.2) * 34 + k * 8, vl = rr(40, 130);
      c.strokeStyle = '#3f6e39'; c.lineWidth = 2; c.beginPath(); c.moveTo(vx, vy); c.quadraticCurveTo(vx + rr(-10, 10), vy + vl / 2, vx + rr(-8, 8), vy + vl); c.stroke();
      for (let y = vy + 8; y < vy + vl; y += 10) { c.save(); c.translate(vx + rr(-4, 4), y); c.rotate(rr(1.6, 4.6)); c.fillStyle = pick(['#3f7a3c', '#5a9a4a', '#7fb85a']); leafPath(c, 11, 5); c.fill(); c.restore(); }
    }
    // growth on top of the cliff and between cliff and bridge
    c.save(); c.translate(-200, top - 22); c.scale(0.42, 0.42); c.strokeStyle = '#5b4030'; trunk(c, 230, 17, 12); canopy(c, clusters(9, 12, -250, 110, 70, 44, 62), GB, 1.4); c.restore();
    canopy(c, clusters(5, -90, top - 34, 46, 12, 20, 30), GA, 0.7);
    canopy(c, clusters(6, 205, -196, 44, 26, 26, 40), GN, 0.8);
    bridge(c, 250, -178, 400);
  }, { tint: [MIST, 0.07, 0.11] });
}
function mkFallFront() {
  return sprite(1220, 200, 420, 150, (c) => {
    for (const [x, y, s] of [[-52, 12, 34], [138, 14, 28], [-110, 16, 22]]) {
      c.fillStyle = lg(c, x - s, 0, x + s, 0, '#5f625a', '#a9ab9b'); c.beginPath(); c.moveTo(x - s, y); c.lineTo(x - s * 0.7, y - s * 0.7); c.lineTo(x - s * 0.1, y - s); c.lineTo(x + s * 0.7, y - s * 0.6); c.lineTo(x + s, y); c.closePath(); c.fill();
      c.fillStyle = '#5f8f47'; c.beginPath(); for (let i = 0; i < 7; i++) dab(c, x + rr(-s * 0.6, s * 0.3), y - s * rr(0.7, 0.95), rr(4, 8), rr(2.5, 4), R()); c.fill();
    }
    for (const [x, y, r] of [[250, 16, 15], [286, 26, 11], [392, 20, 14], [486, 24, 10]]) { ell(c, x, y, r, r * 0.38, '#3f7a4c'); ell(c, x - 1, y - 1, r * 0.8, r * 0.28, '#63a35f'); if (r > 12) { c.fillStyle = '#f6b7c6'; c.beginPath(); for (let i = 0; i < 5; i++) dab(c, x + 4 + Math.cos(i * 1.25) * 3.5, y - 3 + Math.sin(i * 1.25) * 2, 4, 2, i * 1.25); c.fill(); ell(c, x + 4, y - 3, 1.6, 1.4, '#f4d05c'); } }
    for (let i = 0; i < 9; i++) {
      const x = 560 + rr(-30, 40), h = rr(40, 86), b = rr(-10, 12);
      c.strokeStyle = '#4b7d42'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(x, 26); c.quadraticCurveTo(x, 26 - h * 0.6, x + b, 26 - h); c.stroke();
      if (i % 3 === 0) { c.strokeStyle = '#6b4a2e'; c.lineWidth = 6; c.beginPath(); c.moveTo(x + b, 26 - h + 2); c.lineTo(x + b * 1.15, 26 - h - 16); c.stroke(); }
    }
    canopy(c, clusters(6, 690, -40, 70, 22, 30, 46), GA, 0.8);
    canopy(c, clusters(4, 236, -8, 22, 8, 16, 24), GB, 0.6);
  }, { tint: [MIST, 0.07, 0.1] });
}

// ---------- sky pieces
function mkCloud() {
  return sprite(540, 230, 270, 140, (c) => {
    const parts = [], n = 6 + Math.floor(R() * 4);
    for (let i = 0; i < n; i++) { const k = i / (n - 1) - 0.5; parts.push([k * 330, rr(-18, 10) - (0.25 - k * k) * 60, rr(34, 62) * (1 - Math.abs(k) * 0.6)]); }
    c.save(); c.beginPath(); c.rect(-270, -140, 540, 168); c.clip();
    c.fillStyle = '#fffaf0'; c.beginPath(); for (const [x, y, r] of parts) circ(c, x, y, r); c.fill();
    c.globalCompositeOperation = 'source-atop'; c.fillStyle = lg(c, 0, -80, 0, 30, 'rgba(232,196,176,0)', 'rgba(232,196,176,.6)'); c.fillRect(-270, -140, 540, 230);
    c.restore();
  }, { blur: 3, bake: true });
}
function mkMountain(col, lit, shade) {
  return sprite(1040, 580, 520, 560, (c) => {
    const pk = -rr(400, 500), w = rr(360, 460), nL = 5, sil = [];
    for (let i = 0; i <= nL; i++) { const k = i / nL, j = i && i < nL; sil.push([-w + w * k + (j ? rr(-22, 22) : 0), pk * Math.pow(k, 1.15) + (j ? rr(-16, 16) : 0)]); }
    for (let i = 1; i <= nL; i++) { const k = i / nL; sil.push([w * k * rr(0.95, 1.08), pk * Math.pow(1 - k, 1.15) + (i < nL ? rr(-16, 16) : 0)]); }
    const path = (pts) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };
    path(sil); c.fillStyle = lg(c, 0, pk, 0, 0, col, col, rgba(col, 0.25)); c.fill();
    const ridge = [[rr(-30, 10), pk * 0.75], [rr(-60, -10), pk * 0.5], [rr(-40, 30), pk * 0.25], [rr(-80, 0), 0]];
    path(sil.slice(0, nL + 1).concat(ridge)); c.fillStyle = lg(c, 0, pk, 0, 0, shade, rgba(shade, 0.5), rgba(shade, 0)); c.fill();
    path(sil.slice(nL).concat(ridge.slice().reverse())); c.fillStyle = lg(c, 0, pk, 0, 0, lit, rgba(lit, 0.5), rgba(lit, 0)); c.fill();
    for (let i = 0; i < 4; i++) { const k = rr(0.25, 0.8), x = w * k * 0.75, y = pk * (1 - k) * 0.95; path([[x, y + 12], [x + rr(20, 50), y + rr(70, 130)], [x - rr(10, 30), y + rr(90, 150)]]); c.fillStyle = rgba(shade, 0.4); c.fill(); }
  });
}

// ---------- the list of every image to export: group name (used by the game), file name, resolution, how to paint it
// Resolution is image pixels per scene unit: distant, hazy art needs less than art close to the camera.
function generateAll() {
  const out = [];
  const make = (group, name, scale, makers) => makers.forEach((mk, i) => { GEN_SCALE = scale; out.push({ group, file: makers.length > 1 ? `${name}-${i + 1}.png` : `${name}.png`, s: mk(i) }); });
  const times = (n, f) => Array.from({ length: n }, () => f);
  const tile = (fn) => sprite(256, 256, 0, 0, (c) => fn(c, 256));
  make('clouds', 'sky/cloud', 1, times(3, () => mkCloud()));
  make('mountainsBack', 'mountains/back', 1, times(4, () => mkMountain('#e6cdc2', '#f3e2d2', '#d8bcb9')));
  make('mountainsFront', 'mountains/front', 1, times(4, () => mkMountain('#d3b5b5', '#e6cdc4', '#bfa0aa')));
  make('farPinesBack', 'trees/far-pine-back', 1, times(5, () => mkConifer(['#3f6b62', '#5a8a7e', '#74a393', '#93bba6'])));
  make('farPinesFront', 'trees/far-pine-front', 1, times(5, () => mkConifer(['#35604f', '#4d7d63', '#689a78', '#8ab58f'])));
  make('pines', 'trees/pine', 1.5, times(3, () => mkConifer(['#274f3f', '#356a4c', '#4a8559', '#6ea56c'])));
  make('trees', 'trees/tree', 1.5, [() => mkTree(GA, 0), () => mkTree(GA, 1), () => mkTree(GB, 0), () => mkTree(GB, 1), () => mkTree(GA, 0), () => mkTree(GN, 1)]);
  make('blossomTrees', 'trees/blossom-tree', 1.5, [() => mkTree(PK, 0, '#fff5f5'), () => mkTree(PK, 1, '#fff5f5')]);
  make('autumnTrees', 'trees/autumn-tree', 1.5, [() => mkTree(OR, 0), () => mkTree(YL, 1)]);
  make('bigTrees', 'trees/big-tree', 1.5, times(3, () => mkBigTree()));
  make('bushes', 'plants/bush', 2, [() => mkBush(GA), () => mkBush(GB, '#d8443c'), () => mkBush(GN), () => mkBush(OR), () => mkBush(YL), () => mkBush(GA, '#f2d6e0')]);
  make('grass', 'plants/grass', 2, [() => mkTuft(['#4f8243', '#79ac55'], 9, 34), () => mkTuft(['#467a3f', '#6a9f4e'], 11, 46), () => mkTuft(['#5a8f47', '#8dbb5c'], 8, 26), () => mkTuft(['#467a3f', '#82b35a'], 12, 58), () => mkTuft(['#3f7139', '#62994c'], 10, 40)]);
  make('flowers', 'plants/flowers', 2, [() => mkFlowers('daisy', '#ffffff', '#f2c744'), () => mkFlowers('tulip', '#e0574a', '#f08a6a'), () => mkFlowers('spike', '#8a6fc4', '#b59be0'), () => mkFlowers('poppy', '#f0a534', '#f8cf62'), () => mkFlowers('daisy', '#f6b7c6', '#f2c744'), () => mkFlowers('spike', '#e27a9a', '#f4b0c0'), () => mkFlowers('tulip', '#f2c744', '#f8e08a')]);
  make('mushrooms', 'plants/mushrooms', 2, times(2, () => mkShroom()));
  make('ferns', 'plants/fern', 1, [() => mkFern('#3f7a45', '#62a05a'), () => mkFern('#3a7048', '#5a9560')]);
  make('rocks', 'rocks/rock', 2, times(4, (i) => mkRock(['#66625b', '#88827a', '#a8a295', '#c9c3b5'], i !== 2)));
  make('logs', 'props/log', 2, times(2, () => mkLog()));
  make('signpost', 'props/signpost', 2, [() => mkSign()]);
  make('fence', 'props/fence', 2, [() => mkFence()]);
  make('waterfallCliff', 'waterfall/cliff-and-bridge', 1.5, [() => mkFallBack()]);
  make('waterfallBank', 'waterfall/front-bank', 1.5, [() => mkFallFront()]);
  make('fgFerns', 'foreground/fern', 1.5, [() => mkFern('#2e5444', '#467659'), () => mkFern('#2a4f3f', '#3f6e50')]);
  make('fgLeaves', 'foreground/leaves', 1.5, [() => mkBroad('#2f5a42', '#427356'), () => mkBroad('#2a5040', '#3b6a4e')]);
  make('fgPoppies', 'foreground/poppies', 1.5, [() => mkPoppies()]);
  make('fgRocks', 'foreground/rock', 1.5, [() => mkRock(['#4c4a46', '#66625b', '#807a70', '#9a9487'], true)]);
  make('fog', 'effects/fog', 1, [() => sprite(900, 220, 450, 110, (c) => { for (let i = 0; i < 12; i++) soft(c, rr(-330, 330), rr(-40, 40), rr(90, 170), rr(30, 60), '#fff8e6', rr(0.25, 0.5)); })]);
  make('lightDapple', 'effects/light-dapple', 1, [() => sprite(560, 170, 280, 85, (c) => { for (let i = 0; i < 10; i++) soft(c, rr(-200, 200), rr(-45, 45), rr(30, 70), rr(10, 22), '#fff6c4', rr(0.25, 0.5)); })]);
  make('shade', 'effects/shade', 1, [() => sprite(760, 190, 380, 95, (c) => { for (let i = 0; i < 8; i++) soft(c, rr(-250, 250), rr(-45, 45), rr(70, 130), rr(18, 36), '#1f4030', rr(0.14, 0.26)); })]);
  make('grassTexture', 'ground/grass-texture', 2, [() => tile((c, n) => { c.lineCap = 'round'; for (let i = 0; i < 190; i++) { const x = rr(4, n - 4), y = rr(8, n - 2), h = rr(5, 11); c.strokeStyle = i % 2 ? 'rgba(50,95,45,.22)' : 'rgba(200,230,125,.2)'; c.lineWidth = rr(1.2, 2.2); c.beginPath(); c.moveTo(x, y); c.lineTo(x + rr(-3, 3), y - h); c.stroke(); } })]);
  make('pathTexture', 'ground/path-texture', 2, [() => tile((c, n) => { for (let i = 0; i < 150; i++) ell(c, rr(4, n - 4), rr(4, n - 4), rr(1.2, 3.6), rr(0.8, 2), i % 2 ? '#8c6e3c' : '#fff8d7', i % 2 ? 0.22 : 0.4); for (let i = 0; i < 7; i++) { const x = rr(10, n - 10), y = rr(10, n - 10), r = rr(3, 5.5); ell(c, x, y + 1.5, r * 1.2, r * 0.6, '#9c8050', 0.5); ell(c, x, y, r, r * 0.6, '#d9c9a4'); ell(c, x + 1, y - 1, r * 0.4, r * 0.22, '#fff', 0.5); } })]);
  return out;
}

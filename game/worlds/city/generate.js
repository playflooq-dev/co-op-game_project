'use strict';
// Drawing code that painted the City art in worlds/city/assets/.
// The game does not load this file. tools/export.html?world=city uses it to (re)create the images.
// Uses helpers from shared/helpers.js, worlds/forest/generate.js (sprite) and worlds/house/generate.js (piece, knob, books, plankRect).

const INK = '#3a2618';           // outline colour
const GLASS = ['#9fb9cc', '#cfdde4', '#eef2ec'];
// A building front: (0, 0) is the middle of where it meets the pavement; it is drawn upward (negative y).
function front(w, h, fn) { return sprite(w + 60, h + 60, w / 2 + 30, h + 40, fn); } // 30 extra each side for roof overhangs

// ---------- walls
function bricks(c, x, y, w, h, base, seed = 1) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = base; c.fillRect(x, y, w, h);
  const bh = 11, bw = 27;
  for (let r = 0, yy = y; yy < y + h; yy += bh, r++) {
    for (let xx = x - (r % 2 ? bw / 2 : 0); xx < x + w; xx += bw) {
      const v = rr(-0.08, 0.08); c.fillStyle = v > 0 ? `rgba(255,235,210,${v})` : `rgba(60,25,15,${-v})`; c.fillRect(xx + 1, yy + 1, bw - 2, bh - 2);
    }
    c.fillStyle = 'rgba(240,225,205,.35)'; c.fillRect(x, yy, w, 1.4);
  }
  c.fillStyle = 'rgba(240,225,205,.22)';
  for (let r = 0, yy = y; yy < y + h; yy += bh, r++) for (let xx = x - (r % 2 ? bw / 2 : 0); xx < x + w; xx += bw) c.fillRect(xx, yy, 1.4, bh);
  c.restore();
}
function stucco(c, x, y, w, h, base) {
  c.fillStyle = lg(c, x, 0, x + w, 0, base, base); c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(90,60,40,.05)'; for (let i = 0; i < w * h / 160; i++) c.fillRect(x + rr(0, w), y + rr(0, h), rr(1, 3), rr(1, 3));
  c.strokeStyle = 'rgba(90,60,40,.12)'; c.lineWidth = 1.2; for (let yy = y + 90; yy < y + h; yy += 90) { c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy); c.stroke(); }
}
function wall(c, x, y, w, h, spec) { if (spec.brick) bricks(c, x, y, w, h, spec.col); else stucco(c, x, y, w, h, spec.col); }
// light from the upper right: a lit right edge, a shaded left edge, darker near the ground
function wallLight(c, x, y, w, h) {
  c.fillStyle = lg(c, x, 0, x + w, 0, 'rgba(40,20,20,.22)', 'rgba(40,20,20,0) ', 'rgba(255,230,190,0)', 'rgba(255,230,190,.16)'); c.fillRect(x, y, w, h);
  c.fillStyle = lg(c, 0, y, 0, y + h, 'rgba(255,236,200,.1)', 'rgba(255,236,200,0)', 'rgba(40,20,20,.18)'); c.fillRect(x, y, w, h);
}
function ledge(c, x, y, w, h, col) { rrect(c, x, y, w, h, 2); fs(c, lg(c, 0, y, 0, y + h, '#fffaf0', col), 'rgba(58,38,24,.55)', 1.5); c.fillStyle = 'rgba(40,25,15,.18)'; c.fillRect(x + 2, y + h, w - 4, 5); }

// ---------- windows and doors
function glassPane(c, x, y, w, h, lit) {
  c.fillStyle = lit ? lg(c, 0, y, 0, y + h, '#ffe6a6', '#ffcf7a', '#f2b45e') : lg(c, 0, y, 0, y + h, ...GLASS); c.fillRect(x, y, w, h);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = 'rgba(255,255,255,.35)';
  c.beginPath(); c.moveTo(x + w * 0.15, y + h); c.lineTo(x + w * 0.55, y); c.lineTo(x + w * 0.72, y); c.lineTo(x + w * 0.32, y + h); c.fill(); c.restore();
}
function windowAt(c, cx, y, w, h, o = {}) {
  const x = cx - w / 2, fr = o.frame || '#f6efe0';
  if (o.surround) { rrect(c, x - 9, y - 9, w + 18, h + 18, o.arch ? w / 2 + 9 : 3); fs(c, o.surround, 'rgba(58,38,24,.5)', 1.5); }
  c.save(); if (o.arch) { c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(cx, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); c.clip(); }
  glassPane(c, x, y, w, h, o.lit);
  if (o.curtain) { for (const s of [-1, 1]) { c.fillStyle = o.curtain; c.beginPath(); const ex = s < 0 ? x : x + w; c.moveTo(ex, y); c.quadraticCurveTo(ex - s * w * 0.32, y + h * 0.4, ex - s * w * 0.18, y + h); c.lineTo(ex, y + h); c.fill(); c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(ex - s * w * 0.1, y + 4); c.lineTo(ex - s * w * 0.1, y + h - 4); c.stroke(); } }
  if (o.plant) { const px = cx + w * 0.22; c.fillStyle = '#b5603c'; c.fillRect(px - 7, y + h - 16, 14, 14); for (let i = 0; i < 5; i++) { c.save(); c.translate(px, y + h - 15); c.rotate(-1 + i * 0.5); c.fillStyle = i % 2 ? '#5f9a46' : '#7fb35c'; leafPath(c, 15, 5); c.fill(); c.restore(); } }
  c.restore();
  c.strokeStyle = fr; c.lineWidth = 5;
  if (o.arch) { c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(cx, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); c.stroke(); }
  else c.strokeRect(x, y, w, h);
  c.lineWidth = 3.5; c.beginPath(); c.moveTo(cx, y + (o.arch ? 2 : 0)); c.lineTo(cx, y + h); c.moveTo(x, y + h * 0.48); c.lineTo(x + w, y + h * 0.48); c.stroke();
  c.strokeStyle = 'rgba(58,38,24,.45)'; c.lineWidth = 1.2; if (!o.arch) c.strokeRect(x - 2.5, y - 2.5, w + 5, h + 5);
  ledge(c, x - 8, y + h, w + 16, 8, o.sill || '#e2d6bc');
  if (o.box) { // flower box
    rrect(c, x - 2, y + h - 12, w + 4, 14, 3); fs(c, o.box, INK, 1.4);
    for (let i = 0; i < 9; i++) { const fx = x + 4 + i * (w - 8) / 8; c.save(); c.translate(fx, y + h - 12); c.rotate(rr(-0.4, 0.4)); c.fillStyle = '#5f9a46'; leafPath(c, 12, 4); c.fill(); c.restore(); ell(c, fx + rr(-3, 3), y + h - 20 + rr(-4, 2), 4, 4, pick(['#e8594f', '#f2c14e', '#f6f0e8', '#d77fb0'])); }
  }
  if (o.shutters) for (const s of [-1, 1]) { const sx = s < 0 ? x - 4 - w * 0.36 : x + w + 4; rrect(c, sx, y, w * 0.36, h, 2); fs(c, o.shutters, INK, 1.4); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1.2; for (let yy = y + 6; yy < y + h - 4; yy += 7) { c.beginPath(); c.moveTo(sx + 3, yy); c.lineTo(sx + w * 0.36 - 3, yy); c.stroke(); } }
}
function doorAt(c, cx, w, h, col, o = {}) {
  const x = cx - w / 2, y = -h;
  if (o.steps) for (let i = 0; i < 2; i++) { rrect(c, x - 14 - i * 8, -8 + i * 8 - 8, w + 28 + i * 16, 9, 2); fs(c, '#d8cfc0', '#7a6e60', 1.2); }
  rrect(c, x - 10, y - 12 - (o.fan ? w / 2 : 0), w + 20, h + 12 + (o.fan ? w / 2 : 0), 3); fs(c, o.surround || '#efe6d4', 'rgba(58,38,24,.55)', 1.6);
  if (o.fan) { c.save(); c.beginPath(); c.moveTo(x, y); c.arc(cx, y, w / 2, Math.PI, 0); c.closePath(); c.clip(); glassPane(c, x, y - w / 2, w, w / 2, false); c.restore(); c.strokeStyle = '#efe6d4'; c.lineWidth = 2; for (let i = 1; i < 5; i++) { const a = Math.PI + i * Math.PI / 5; c.beginPath(); c.moveTo(cx, y); c.lineTo(cx + Math.cos(a) * w / 2, y + Math.sin(a) * w / 2); c.stroke(); } }
  rrect(c, x, y, w, h, 2); fs(c, lg(c, x, 0, x + w, 0, col[0], col[1]), INK, 2);
  for (const [py, ph] of [[y + 12, h * 0.38], [y + h * 0.5, h * 0.42]]) for (const px of [x + 8, x + w / 2 + 4]) { rrect(c, px, py, w / 2 - 12, ph, 2); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1.6; c.stroke(); c.strokeStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(px + 1, py + ph); c.lineTo(px + w / 2 - 13, py + ph); c.stroke(); }
  knob(c, x + w - 12, y + h * 0.55, 4.5);
  if (o.letter) { rrect(c, cx - 14, y + h * 0.44, 28, 7, 2); fs(c, '#d9b55c', '#6a4f14', 1.2); }
  if (o.number) { c.fillStyle = '#f6efe0'; c.font = 'italic 700 16px Georgia, serif'; c.textAlign = 'center'; c.fillText(o.number, cx, y - 2 - (o.fan ? w / 2 + 2 : 0)); }
}
function awning(c, x, y, w, cols, drop = 46) {
  const n = Math.round(w / 34), sw = w / n;
  for (let i = 0; i < n; i++) { c.fillStyle = cols[i % 2]; c.beginPath(); c.moveTo(x + i * sw, y); c.lineTo(x + (i + 1) * sw, y); c.lineTo(x + (i + 1) * sw + 6, y + drop); c.lineTo(x + i * sw + 6, y + drop); c.fill(); }
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x, y, w + 6, 8);
  for (let i = 0; i < n; i++) { c.fillStyle = cols[i % 2]; c.beginPath(); c.moveTo(x + i * sw + 6, y + drop); c.quadraticCurveTo(x + i * sw + 6 + sw / 2, y + drop + 16, x + (i + 1) * sw + 6, y + drop); c.fill(); }
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w + 6, y + drop); c.stroke();
  c.fillStyle = 'rgba(30,15,10,.2)'; c.beginPath(); c.moveTo(x, y + drop + 8); c.lineTo(x + w, y + drop + 8); c.lineTo(x + w, y + drop + 34); c.lineTo(x, y + drop + 34); c.fill();
}
function signBoard(c, x, y, w, h, text, bg, fg = '#f6e7c4') {
  rrect(c, x, y, w, h, 4); fs(c, lg(c, 0, y, 0, y + h, bg, shade(bg, -0.25)), INK, 2);
  rrect(c, x + 5, y + 5, w - 10, h - 10, 3); c.strokeStyle = rgba(fg, 0.6); c.lineWidth = 1.5; c.stroke();
  c.fillStyle = fg; c.font = `italic 700 ${Math.round(h * 0.58)}px Georgia, serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, x + w / 2, y + h / 2 + 2); c.textBaseline = 'alphabetic';
}
function shade(hex, k) { const n = parseInt(hex.slice(1), 16), f = (v) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join(''); }
// a big shop window with things on show
function shopWindow(c, x, y, w, h, wares) {
  rrect(c, x - 6, y - 6, w + 12, h + 12, 3); fs(c, '#4a3020', INK, 2);
  c.fillStyle = lg(c, 0, y, 0, y + h, '#5a4a3e', '#3a2c22'); c.fillRect(x, y, w, h);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); soft(c, x + w / 2, y + h * 0.3, w * 0.6, h * 0.5, '#ffe2a0', 0.45); wares(c, x, y, w, h);
  c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.moveTo(x + w * 0.1, y + h); c.lineTo(x + w * 0.35, y); c.lineTo(x + w * 0.45, y); c.lineTo(x + w * 0.2, y + h); c.fill(); c.restore();
  c.strokeStyle = '#4a3020'; c.lineWidth = 4; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.stroke();
  ledge(c, x - 10, y + h + 6, w + 20, 10, '#d8cbb0'); c.fillStyle = '#5a3a26'; c.fillRect(x - 6, y + h + 16, w + 12, -y - h - 16);
}
// ---------- what the shops sell
function loaf(c, x, y, s, col = '#c98a42') { c.beginPath(); c.ellipse(x, y, 18 * s, 10 * s, 0, Math.PI, 0); c.lineTo(x + 18 * s, y); c.closePath(); fs(c, lg(c, 0, y - 10 * s, 0, y, '#e8b46a', col), '#7a4a1a', 1.2); c.strokeStyle = '#f6d8a0'; c.lineWidth = 1.5; for (const d of [-8, 0, 8]) { c.beginPath(); c.moveTo(x + d * s - 3, y - 7 * s); c.lineTo(x + d * s + 3, y - 3 * s); c.stroke(); } }
function cake(c, x, y, s) { rrect(c, x - 16 * s, y - 22 * s, 32 * s, 22 * s, 4); fs(c, '#f6d6e0', '#9a5a6a', 1.2); c.fillStyle = '#fff7f0'; c.fillRect(x - 16 * s, y - 22 * s, 32 * s, 5 * s); ell(c, x, y - 26 * s, 4 * s, 4 * s, '#d8343e'); c.fillStyle = '#e8e2d8'; c.fillRect(x - 20 * s, y, 40 * s, 3); }
function fruitPile(c, x, y, w, col) { for (let r = 0; r < 3; r++) for (let i = 0; i < 5 - r; i++) { const fx = x - w / 2 + (i + r * 0.5 + 0.5) * w / 5, fy = y - 7 - r * 10; c.beginPath(); circ(c, fx, fy, 7); fs(c, rg(c, fx - 2, fy - 2, 9, shade(col, 0.4), col, shade(col, -0.3)), shade(col, -0.45), 1); } }
function crate(c, x, y, w, h) { rrect(c, x - w / 2, y - h, w, h, 2); fs(c, lg(c, 0, y - h, 0, y, '#d4a36a', '#a8743f'), INK, 1.6); c.strokeStyle = 'rgba(90,50,20,.5)'; c.lineWidth = 1.4; for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(x - w / 2, y - h * i / 3); c.lineTo(x + w / 2, y - h * i / 3); c.stroke(); } }
function cup(c, x, y, s, col) { c.beginPath(); c.moveTo(x - 9 * s, y - 14 * s); c.lineTo(x + 9 * s, y - 14 * s); c.lineTo(x + 7 * s, y); c.lineTo(x - 7 * s, y); c.closePath(); fs(c, col, INK, 1.2); c.beginPath(); c.arc(x + 10 * s, y - 8 * s, 4 * s, -1.4, 1.4); c.strokeStyle = INK; c.lineWidth = 1.5; c.stroke(); c.fillStyle = '#efe6d4'; c.fillRect(x - 13 * s, y, 26 * s, 3); }

// ---------- roofs
function gableRoof(c, w, top, col, chimney = true) {
  if (chimney) { bricks(c, w * 0.18, top - 92, 40, 70, '#9a4a36'); c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(w * 0.18, top - 92, 40, 70); rrect(c, w * 0.18 - 6, top - 100, 52, 12, 2); fs(c, '#8b8577', '#4c4a44', 1.5); for (const dx of [12, 28]) { rrect(c, w * 0.18 + dx - 5, top - 112, 10, 14, 2); fs(c, '#b5603c', INK, 1.2); } }
  c.beginPath(); c.moveTo(-w / 2 - 16, top + 4); c.lineTo(0, top - w * 0.3); c.lineTo(w / 2 + 16, top + 4); c.closePath();
  c.fillStyle = col; c.fill(); c.save(); c.clip();
  for (let yy = top - w * 0.3; yy < top + 6; yy += 13) { for (let xx = -w / 2 - 20 + ((yy / 13) % 2 ? 9 : 0); xx < w / 2 + 20; xx += 18) { c.beginPath(); c.arc(xx + 9, yy + 10, 9, 0, Math.PI); c.strokeStyle = 'rgba(40,15,10,.3)'; c.lineWidth = 1.5; c.stroke(); } }
  c.fillStyle = lg(c, -w / 2, 0, w / 2, 0, 'rgba(40,15,10,.2)', 'rgba(255,220,180,.12)'); c.fillRect(-w / 2 - 20, top - w * 0.3, w + 40, w * 0.3 + 10); c.restore();
  c.lineWidth = 9; c.strokeStyle = INK; c.beginPath(); c.moveTo(-w / 2 - 20, top + 6); c.lineTo(0, top - w * 0.3 - 4); c.lineTo(w / 2 + 20, top + 6); c.stroke(); c.lineWidth = 5; c.strokeStyle = '#f2ead7'; c.stroke();
}
function parapet(c, w, top, col, trim) {
  ledge(c, -w / 2 - 8, top - 14, w + 16, 14, trim);
  c.fillStyle = col; c.fillRect(-w / 2 + 2, top - 40, w - 4, 26); c.fillStyle = 'rgba(40,20,10,.12)'; c.fillRect(-w / 2 + 2, top - 40, w - 4, 26);
  ledge(c, -w / 2 - 4, top - 46, w + 8, 8, trim);
  for (let x = -w / 2 + 22; x < w / 2 - 10; x += 38) { rrect(c, x, top - 36, 14, 18, 2); c.fillStyle = 'rgba(40,20,10,.18)'; c.fill(); }
}
function mansard(c, w, top, col) {
  c.beginPath(); c.moveTo(-w / 2 - 10, top); c.lineTo(-w / 2 + 26, top - 96); c.lineTo(w / 2 - 26, top - 96); c.lineTo(w / 2 + 10, top); c.closePath(); fs(c, lg(c, 0, top - 96, 0, top, '#5b6474', '#3e4554'), INK, 2);
  c.save(); c.clip(); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1.2; for (let yy = top - 90; yy < top; yy += 10) { c.beginPath(); c.moveTo(-w, yy); c.lineTo(w, yy); c.stroke(); } c.restore();
  for (const dx of [-w * 0.24, w * 0.24]) { rrect(c, dx - 30, top - 86, 60, 70, 4); fs(c, col, INK, 1.8); windowAt(c, dx, top - 72, 36, 46, { frame: '#f6efe0' }); c.beginPath(); c.moveTo(dx - 36, top - 84); c.lineTo(dx, top - 108); c.lineTo(dx + 36, top - 84); c.closePath(); fs(c, '#4b5262', INK, 1.8); }
  ledge(c, -w / 2 - 12, top - 4, w + 24, 10, '#e2d6bc');
}

// ---------- building fronts
// spec: w, floors (heights, ground floor first), wall { col, brick }, trim, roof, ground(c, w, gh), upper: { cols, win }
function building(spec) {
  const w = spec.w, H0 = spec.floors.reduce((a, b) => a + b, 0), top = -H0;
  return front(w, H0 + 130, (c) => {
    if (spec.roof === 'gable') gableRoof(c, w, top, spec.roofCol || '#9a4632', spec.chimney !== false);
    wall(c, -w / 2, top, w, H0, spec.wall);
    // stone corners
    for (const ex of [-w / 2, w / 2 - 18]) { c.fillStyle = rgba('#f0e6d2', spec.wall.brick ? 0.5 : 0.25); for (let y = top; y < 0; y += 26) c.fillRect(ex + (Math.floor((y - top) / 26) % 2 ? 0 : 3), y, 15, 22); }
    let y = 0;
    for (let f = 1; f < spec.floors.length; f++) {
      y -= spec.floors[f - 1]; const fh = spec.floors[f], n = spec.upper.cols;
      ledge(c, -w / 2, y - 4, w, 8, spec.trim);
      for (let i = 0; i < n; i++) { const cx = -w / 2 + w * (i + 0.5) / n; windowAt(c, cx, y - fh + 26, spec.upper.ww || 62, fh - 62, Object.assign({ lit: R() < 0.18, curtain: pick(['#c9503f', '#e9c46a', '#7aa5c4', '#f2ead7', '#8fae6a']) }, spec.upper.win || {}, { box: spec.upper.win && spec.upper.win.box && R() < 0.75 ? spec.upper.win.box : null })); }
      if (spec.balcony && f > 1) { c.fillStyle = '#3c3a40'; c.fillRect(-w / 2 + 20, y - 34, w - 40, 5); for (let x = -w / 2 + 24; x < w / 2 - 20; x += 12) c.fillRect(x, y - 34, 2.5, 34); c.fillRect(-w / 2 + 16, y - 2, w - 32, 6); }
    }
    wallLight(c, -w / 2, top, w, H0);
    if (spec.roof === 'parapet') parapet(c, w, top, spec.wall.col, spec.trim);
    if (spec.roof === 'mansard') mansard(c, w, top, spec.wall.col);
    if (spec.roof === 'cornice') { ledge(c, -w / 2 - 12, top - 16, w + 24, 16, spec.trim); for (let x = -w / 2; x < w / 2; x += 22) { rrect(c, x, top, 12, 10, 2); fs(c, spec.trim, 'rgba(58,38,24,.4)', 1); } }
    c.save(); spec.ground(c, w, spec.floors[0]); c.restore();
    c.fillStyle = lg(c, 0, -26, 0, 0, 'rgba(40,25,15,0)', 'rgba(40,25,15,.25)'); c.fillRect(-w / 2, -26, w, 26);
    c.strokeStyle = 'rgba(40,20,10,.5)'; c.lineWidth = 2; c.strokeRect(-w / 2, top, w, H0);
    if (spec.extra) spec.extra(c, w, top);
  });
}
function homeFront() {
  return building({ w: 500, floors: [280, 250], wall: { col: '#b4573f', brick: true }, trim: '#efe6d4', roof: 'gable', roofCol: '#a24a35', upper: { cols: 2, ww: 90, win: { box: '#5d8a4a', curtain: '#e9a68a' } },
    ground: (c, w) => {
      windowAt(c, -120, -230, 110, 150, { box: '#5d8a4a', curtain: '#e9a68a', sill: '#efe6d4' });
      doorAt(c, 90, 96, 196, ['#2f7a73', '#3f948a'], { fan: true, steps: true, letter: true, number: '12' });
      for (const s of [-1, 1]) { c.beginPath(); circ(c, 90 + s * 76, -150, 8); fs(c, '#4a4a4a', '#222', 1.5); soft(c, 90 + s * 76, -150, 16, 16, '#ffe9b0', 0.4); }
    },
    extra: (c, w, top) => { c.beginPath(); circ(c, 0, top - 70, 26); c.save(); c.clip(); glassPane(c, -26, top - 96, 52, 52, false); c.restore(); c.beginPath(); circ(c, 0, top - 70, 26); c.lineWidth = 6; c.strokeStyle = '#f2ead7'; c.stroke(); c.lineWidth = 2.5; c.strokeStyle = INK; c.beginPath(); c.moveTo(-26, top - 70); c.lineTo(26, top - 70); c.moveTo(0, top - 96); c.lineTo(0, top - 44); c.stroke(); },
  });
}
const townhouseCream = () => building({ w: 420, floors: [240, 210, 200], wall: { col: '#efe1c4' }, trim: '#fbf5e8', roof: 'parapet', upper: { cols: 2, ww: 78, win: { box: '#8a5a3a', shutters: '#6f94b8' } },
  ground: (c) => { windowAt(c, -90, -200, 100, 130, { curtain: '#f2ead7', plant: true }); doorAt(c, 90, 84, 180, ['#3f5f86', '#5579a3'], { fan: true, steps: true, letter: true, number: '27' }); } });
const townhouseBrick = () => building({ w: 440, floors: [250, 220, 200], wall: { col: '#a8553f', brick: true }, trim: '#f2ead7', roof: 'mansard', upper: { cols: 3, ww: 64, win: { surround: '#e8dcc4', box: '#4a6a3a' } },
  ground: (c) => { doorAt(c, -110, 84, 186, ['#2f6a44', '#3f8a58'], { fan: true, steps: true, letter: true, number: '8' }); windowAt(c, 70, -210, 150, 140, { surround: '#e8dcc4', curtain: '#c9503f' }); } });
function shopFront(sign, signCol, awn, wares, doorCol) {
  return (c, w, gh) => {
    const sx = -w / 2 + 26, sw = w - 160;
    signBoard(c, -w / 2 + 14, -gh + 8, w - 28, 52, sign, signCol);
    shopWindow(c, sx, -gh + 108, sw, gh - 170, wares);
    doorAt(c, w / 2 - 66, 74, 176, doorCol || ['#5a3a26', '#7a5236']);
    awning(c, -w / 2 + 10, -gh + 64, w - 26, awn);
  };
}
const grocer = () => building({ w: 440, floors: [270, 210, 190], wall: { col: '#b9774f', brick: true }, trim: '#f2ead7', roof: 'cornice', upper: { cols: 3, ww: 66, win: { box: '#4a6a3a' } },
  ground: shopFront('Grocer', '#3f6e4a', ['#4f8a52', '#f6f0e0'], (c, x, y, w, h) => { for (let i = 0; i < 4; i++) { crate(c, x + 34 + i * (w - 60) / 3, y + h, 54, 30); fruitPile(c, x + 34 + i * (w - 60) / 3, y + h - 30, 52, ['#e8594f', '#f2b24e', '#8fbf4a', '#f2d24e'][i]); } }) });
const cornerShop = () => building({ w: 310, floors: [260, 200, 190], wall: { col: '#e7b8a8' }, trim: '#fbf5e8', roof: 'parapet', upper: { cols: 2, ww: 62, win: { curtain: '#7aa5c4' } },
  ground: shopFront('News', '#8a3a3a', ['#c9503f', '#f6f0e0'], (c, x, y, w, h) => { for (let i = 0; i < 6; i++) { rrect(c, x + 10 + i * (w - 20) / 6, y + 20 + (i % 2) * 14, (w - 30) / 6, 46, 2); fs(c, pick(['#f6efe0', '#e9c46a', '#7aa5c4', '#e8a0a0']), INK, 1); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + 14 + i * (w - 20) / 6, y + 28 + (i % 2) * 14, (w - 40) / 6, 4); } c.fillStyle = '#c9503f'; c.fillRect(x + 6, y + h - 26, w - 12, 20); }) });
const cafe = () => building({ w: 460, floors: [260, 220, 190], wall: { col: '#c9d3b0' }, trim: '#fbf5e8', roof: 'cornice', upper: { cols: 3, ww: 70, win: { box: '#b5603c', shutters: '#5d7a4a' } },
  ground: shopFront('Café', '#7a2f2f', ['#8a2f2f', '#f6ead6'], (c, x, y, w, h) => { for (let i = 0; i < 5; i++) cup(c, x + 30 + i * (w - 60) / 4, y + h - 8, 1.2, pick(['#f6efe0', '#e9c46a', '#7aa5c4'])); for (let i = 0; i < 3; i++) cake(c, x + 50 + i * (w - 100) / 2, y + h * 0.48, 1); c.fillStyle = '#e8e2d8'; c.fillRect(x, y + h * 0.48, w, 4); }) });
const bakery = () => building({ w: 460, floors: [260, 220, 190], wall: { col: '#c08a5e', brick: true }, trim: '#f6efe0', roof: 'gable', roofCol: '#7a5a4a', chimney: true, upper: { cols: 3, ww: 66, win: { box: '#5d8a4a' } },
  ground: shopFront('Bakery', '#3f5f86', ['#3f6f9f', '#f6f0e0'], (c, x, y, w, h) => { for (let r = 0; r < 2; r++) { c.fillStyle = '#e8e2d8'; c.fillRect(x, y + 40 + r * 52, w, 4); for (let i = 0; i < 6; i++) loaf(c, x + 26 + i * (w - 50) / 5, y + 40 + r * 52, 0.9, r ? '#b5783a' : '#c98a42'); } cake(c, x + w / 2, y + h - 4, 1.2); }) });
const bookshop = () => building({ w: 420, floors: [260, 210, 200], wall: { col: '#b8c4cc' }, trim: '#f6f0e4', roof: 'mansard', upper: { cols: 2, ww: 78, win: { shutters: '#3f5f86', box: '#8a5a3a' } },
  ground: shopFront('Books', '#2f4a5a', ['#3f5f6f', '#efe6d4'], (c, x, y, w, h) => { for (let r = 0; r < 3; r++) { c.fillStyle = '#7a5236'; c.fillRect(x, y + 36 + r * 34, w, 4); books(c, x + 4, x + w - 4, y + 36 + r * 34, 28); } }) });
const apartment = () => building({ w: 520, floors: [230, 180, 180, 180, 170], wall: { col: '#8a5a4a', brick: true }, trim: '#ece2cc', roof: 'parapet', balcony: true, upper: { cols: 4, ww: 58, win: { surround: '#d8cbb0' } },
  ground: (c) => {
    doorAt(c, 0, 110, 190, ['#3a3a44', '#55555f'], { surround: '#d8cbb0' });
    c.fillStyle = '#3c3a40'; c.fillRect(-90, -214, 180, 10); for (const s of [-1, 1]) { c.save(); c.translate(s * 86, -204); c.strokeStyle = '#3c3a40'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(-s * 30, -40); c.stroke(); c.restore(); }
    signBoard(c, -60, -248, 120, 30, 'Rose Court', '#4a3a3a');
    for (const s of [-1, 1]) windowAt(c, s * 170, -190, 100, 120, { surround: '#d8cbb0', curtain: '#e9c46a' });
  } });
function warehouse() {
  // The alley building. Its shutter opening and archway are see-through: the game draws the courtyard behind them.
  const w = 1060, gh = 300, H0 = 640;
  return front(w, H0 + 60, (c) => {
    wall(c, -w / 2, -H0, w, H0, { col: '#9c5b45', brick: true });
    ledge(c, -w / 2, -gh - 4, w, 10, '#e2d6bc');
    for (let i = 0; i < 6; i++) { const cx = -w / 2 + w * (i + 0.5) / 6; windowAt(c, cx, -H0 + 70, 96, 200, { arch: true, surround: '#e2d6bc', lit: R() < 0.2 }); }
    rrect(c, -w * 0.3, -H0 + 10, w * 0.6, 40, 4); fs(c, '#f2ead7', INK, 2); c.fillStyle = '#6a3a2a'; c.font = 'italic 700 26px Georgia, serif'; c.textAlign = 'center'; c.fillText('BAKER & SONS   FLOUR MILL', 0, -H0 + 38);
    wallLight(c, -w / 2, -H0, w, H0);
    // shutter opening (x 2990 in the street, 320 left of this building's middle) and the archway (x 3740)
    const sx = -320, sw = 200, sh = 240, ax = 430, aw = 130, ah = 236;
    rrect(c, sx - sw / 2 - 16, -sh - 18, sw + 32, sh + 18, 3); fs(c, '#d8cbb0', INK, 2);
    c.clearRect(sx - sw / 2, -sh, sw, sh);
    c.fillStyle = '#5a5a60'; c.fillRect(sx - sw / 2 - 6, -sh - 30, sw + 12, 24); c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(sx - sw / 2 - 6, -sh - 30, sw + 12, 24);
    signBoard(c, sx - 80, -sh - 74, 160, 34, 'Deliveries', '#4a4a52');
    c.beginPath(); c.moveTo(ax - aw / 2 - 16, 0); c.lineTo(ax - aw / 2 - 16, -ah + aw / 2); c.arc(ax, -ah + aw / 2, aw / 2 + 16, Math.PI, 0); c.lineTo(ax + aw / 2 + 16, 0); c.closePath(); fs(c, '#d8cbb0', INK, 2);
    c.save(); c.beginPath(); c.moveTo(ax - aw / 2, 0); c.lineTo(ax - aw / 2, -ah + aw / 2); c.arc(ax, -ah + aw / 2, aw / 2, Math.PI, 0); c.lineTo(ax + aw / 2, 0); c.closePath(); c.globalCompositeOperation = 'destination-out'; c.fill(); c.restore();
    signBoard(c, ax - 90, -ah - 66, 180, 32, "Baker's Alley", '#2f4a5a');
    for (const wx of [-30, 160]) windowAt(c, wx, -230, 90, 140, { surround: '#e2d6bc' });
    c.fillStyle = lg(c, 0, -26, 0, 0, 'rgba(40,25,15,0)', 'rgba(40,25,15,.25)'); c.fillRect(-w / 2, -26, w, 26);
    c.strokeStyle = 'rgba(40,20,10,.5)'; c.lineWidth = 2; c.strokeRect(-w / 2, -H0, w, H0);
  });
}
function courtyard() {
  // What is behind the warehouse front: a cobbled yard with walls, bins and washing. Same size and ground point as the warehouse.
  const w = 1060, H0 = 640;
  return front(w, H0 + 60, (c) => {
    c.fillStyle = lg(c, 0, -H0, 0, 0, '#c9d6dc', '#f4e2bd'); c.fillRect(-w / 2, -H0, w, H0);
    bricks(c, -w / 2, -H0 + 120, w, H0 - 120, '#8a5a4a'); c.fillStyle = 'rgba(30,20,25,.35)'; c.fillRect(-w / 2, -H0 + 120, w, H0 - 120);
    for (let i = 0; i < 5; i++) windowAt(c, -w / 2 + 120 + i * 210, -H0 + 170, 70, 110, { lit: R() < 0.4, curtain: '#c9a06a' });
    c.strokeStyle = '#5a5a60'; c.lineWidth = 6; c.beginPath(); c.moveTo(-60, -H0 + 120); c.lineTo(-60, 0); c.stroke();
    // washing line
    c.strokeStyle = '#efe6d4'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-w / 2 + 40, -330); c.quadraticCurveTo(-120, -290, 200, -330); c.stroke();
    for (const [x, col, kind] of [[-380, '#c9503f', 0], [-300, '#7aa5c4', 1], [-220, '#e9c46a', 0], [-130, '#f2ead7', 2], [-40, '#8fae6a', 1], [60, '#d77fb0', 0]]) {
      const y = -330 + Math.sin((x + 420) / 600 * Math.PI) * 36; c.fillStyle = col; c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1.2;
      if (kind === 0) { c.beginPath(); c.moveTo(x - 20, y); c.lineTo(x + 20, y); c.lineTo(x + 26, y + 16); c.lineTo(x + 16, y + 18); c.lineTo(x + 16, y + 50); c.lineTo(x - 16, y + 50); c.lineTo(x - 16, y + 18); c.lineTo(x - 26, y + 16); c.closePath(); c.fill(); c.stroke(); }
      else if (kind === 1) { c.beginPath(); c.moveTo(x - 16, y); c.lineTo(x + 16, y); c.lineTo(x + 18, y + 52); c.lineTo(x + 3, y + 52); c.lineTo(x, y + 18); c.lineTo(x - 3, y + 52); c.lineTo(x - 18, y + 52); c.closePath(); c.fill(); c.stroke(); }
      else { c.fillRect(x - 24, y, 48, 34); c.strokeRect(x - 24, y, 48, 34); }
      c.fillStyle = '#c99a69'; c.fillRect(x - 12, y - 4, 4, 8); c.fillRect(x + 8, y - 4, 4, 8);
    }
    // cobbles
    c.fillStyle = '#8a8178'; c.fillRect(-w / 2, -40, w, 40); for (let y = -38; y < 0; y += 9) for (let x = -w / 2 + ((y / 9) % 2 ? 6 : 0); x < w / 2; x += 14) { rrect(c, x, y, 12, 7, 3); c.fillStyle = rgba(pick(['#a59a8e', '#968b80', '#b2a89c']), 1); c.fill(); }
    // bins and crates
    for (const bx of [-200, -150]) { rrect(c, bx - 22, -110, 44, 72, 4); fs(c, lg(c, bx - 22, 0, bx + 22, 0, '#4a6a52', '#5f8a68'), INK, 1.8); rrect(c, bx - 25, -118, 50, 10, 3); fs(c, '#3e5a46', INK, 1.5); }
    crate(c, 300, -36, 70, 56); crate(c, 330, -92, 56, 46); crate(c, 250, -36, 40, 36);
    c.save(); c.translate(170, -46); ell(c, 0, 0, 24, 9, '#5a4a3e'); ell(c, -18, -6, 9, 8, '#5a4a3e'); c.fillStyle = '#5a4a3e'; c.beginPath(); c.moveTo(-24, -12); c.lineTo(-22, -20); c.lineTo(-17, -13); c.moveTo(-15, -13); c.lineTo(-11, -20); c.lineTo(-10, -11); c.fill(); c.restore(); // sleeping cat
    c.fillStyle = 'rgba(20,10,10,.25)'; c.fillRect(-w / 2, -H0, w, H0);
  });
}
function courtGate() {
  // the iron gate across the courtyard; the gap under it is big enough for the brother only
  return piece(110, 250, (c) => {
    for (const s of [-1, 1]) { rrect(c, s * 55 - 7, -250, 14, 250, 2); fs(c, '#4a4a52', '#1c1c22', 1.5); c.beginPath(); circ(c, s * 55, -256, 9); fs(c, '#5a5a62', '#1c1c22', 1.5); }
    c.strokeStyle = '#2c2c34'; c.lineWidth = 5; c.beginPath(); c.moveTo(-50, -230); c.lineTo(50, -230); c.moveTo(-50, -100); c.lineTo(50, -100); c.stroke();
    c.lineWidth = 4; for (let x = -40; x <= 40; x += 16) { c.beginPath(); c.moveTo(x, -238); c.lineTo(x, -76); c.stroke(); c.fillStyle = '#2c2c34'; c.beginPath(); c.moveTo(x - 5, -238); c.lineTo(x, -250); c.lineTo(x + 5, -238); c.fill(); }
    c.strokeStyle = '#d9b55c'; c.lineWidth = 2; c.beginPath(); c.arc(0, -165, 18, 0, TAU); c.stroke();
  }, 20);
}

// ---------- the street
function pavementTile() { return tileArt(240, (c, n) => {
  c.fillStyle = '#c4bbb0'; c.fillRect(0, 0, n, n);
  for (let y = 0, r = 0; y < n; y += 60, r++) for (let x = (r % 2) * 60; x < n + 60; x += 120) { c.fillStyle = rgba(pick(['#cbc3b8', '#bfb6aa', '#c8c0b4']), 1); c.fillRect(x + 2, y + 2, 116, 56); }
  c.strokeStyle = 'rgba(90,80,72,.35)'; c.lineWidth = 2; for (let y = 0; y <= n; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(n, y); c.stroke(); }
  c.fillStyle = 'rgba(80,70,60,.08)'; for (let i = 0; i < 300; i++) c.fillRect(rr(0, n), rr(0, n), 2, 2);
}); }
function roadTile() { return tileArt(200, (c, n) => {
  c.fillStyle = '#56535c'; c.fillRect(0, 0, n, n);
  for (let i = 0; i < 1400; i++) { c.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.08)'; c.fillRect(rr(0, n), rr(0, n), rr(1, 3), rr(1, 3)); }
}); }
function cobbleTile() { return tileArt(160, (c, n) => {
  c.fillStyle = '#8f857a'; c.fillRect(0, 0, n, n);
  for (let y = 0, r = 0; y < n; y += 20, r++) for (let x = (r % 2) * 14; x < n + 28; x += 28) { rrect(c, x + 2, y + 2, 24, 16, 6); c.fillStyle = pick(['#b0a596', '#a3988a', '#bbb1a2', '#9c9184']); c.fill(); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x + 6, y + 4, 12, 3); }
}); }
function quayStoneTile() { return tileArt(200, (c, n) => {
  c.fillStyle = '#8f8a80'; c.fillRect(0, 0, n, n);
  for (let y = 0, r = 0; y < n; y += 40, r++) for (let x = (r % 2) * 50; x < n + 100; x += 100) { rrect(c, x + 2, y + 2, 96, 36, 4); c.fillStyle = pick(['#a39d92', '#9a9489', '#aaa498']); c.fill(); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x + 2, y + 30, 96, 8); }
}); }
function skyline(w, h, seed, near) {
  return sprite(w, h, 0, h, (c) => {
    let x = 0; const body = near ? ['#a495a6', '#978a9e', '#ab9a9e', '#8f8299'] : ['#cdbfc8', '#c2b4c2', '#c8bccb'];
    while (x < w) {
      const bw = rr(near ? 90 : 60, near ? 190 : 140), bh = rr(near ? 0.4 : 0.35, 0.95) * h, top = -bh;
      c.fillStyle = pick(body); c.fillRect(x, top, Math.min(bw, w - x), bh);
      if (R() < 0.3) { c.fillRect(x + bw * 0.25, top - 18, bw * 0.3, 18); }
      if (R() < 0.2) { c.fillStyle = shade(body[0], -0.1); c.beginPath(); c.moveTo(x, top); c.lineTo(x + bw / 2, top - 50); c.lineTo(x + bw, top); c.fill(); }
      if (R() < 0.15) { c.strokeStyle = body[1]; c.lineWidth = 3; c.beginPath(); c.moveTo(x + bw * 0.6, top); c.lineTo(x + bw * 0.6, top - 60); c.stroke(); }
      const gx = near ? 22 : 15, gy = near ? 30 : 22;
      for (let yy = top + 16; yy < -14; yy += gy) for (let xx = x + 10; xx < x + bw - 12 && xx < w - 8; xx += gx) { c.fillStyle = R() < (near ? 0.28 : 0.12) ? (near ? '#ffe3a0' : 'rgba(255,236,190,.7)') : (near ? 'rgba(70,58,80,.32)' : 'rgba(255,255,255,.16)'); c.fillRect(xx, yy, near ? 9 : 6, near ? 13 : 9); }
      c.fillStyle = 'rgba(255,225,190,.16)'; c.fillRect(x + bw - 6, top, 6, bh);
      x += bw + (R() < 0.25 ? rr(4, 20) : 0);
    }
  });
}
const streetLamp = () => piece(70, 430, (c) => {
  ell(c, 0, -2, 22, 5, 'rgba(0,0,0,.25)');
  rrect(c, -12, -40, 24, 40, 3); fs(c, '#3c3a40', '#1c1a20', 1.5); c.fillStyle = '#3c3a40'; c.fillRect(-5, -380, 10, 345);
  c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(1, -378, 2.5, 340);
  rrect(c, -18, -392, 36, 14, 3); fs(c, '#3c3a40', '#1c1a20', 1.5);
  c.beginPath(); c.moveTo(-22, -392); c.lineTo(-15, -425); c.lineTo(15, -425); c.lineTo(22, -392); c.closePath(); fs(c, 'rgba(255,240,190,.85)', '#1c1a20', 2);
  c.beginPath(); c.moveTo(-18, -425); c.lineTo(0, -438); c.lineTo(18, -425); c.closePath(); fs(c, '#3c3a40', '#1c1a20', 1.5);
}, 20);
const bench = () => piece(200, 90, (c) => {
  ell(c, 0, -2, 100, 7, 'rgba(0,0,0,.2)');
  for (const s of [-1, 1]) { c.strokeStyle = '#2c2c34'; c.lineWidth = 6; c.beginPath(); c.moveTo(s * 86, 0); c.lineTo(s * 80, -46); c.lineTo(s * 84, -86); c.stroke(); }
  for (const [y, h] of [[-50, 10], [-38, 10], [-84, 10], [-70, 10]]) plankRect(c, -96, y, 192, h, 2, true, 0);
});
const bin = () => piece(60, 110, (c) => { ell(c, 0, -2, 30, 5, 'rgba(0,0,0,.22)'); rrect(c, -24, -96, 48, 96, 6); fs(c, lg(c, -24, 0, 24, 0, '#3f5f52', '#5f8a72'), INK, 2); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-18, -84, 36, 6); rrect(c, -28, -104, 56, 12, 4); fs(c, '#3a5248', INK, 1.6); });
const postbox = () => piece(70, 160, (c) => { ell(c, 0, -2, 34, 6, 'rgba(0,0,0,.22)'); rrect(c, -26, -150, 52, 150, [26, 26, 4, 4]); fs(c, lg(c, -26, 0, 26, 0, '#a8231e', '#d8443a'), '#4a0e0a', 2); rrect(c, -16, -112, 32, 6, 2); fs(c, '#2a0a08'); rrect(c, -14, -90, 28, 22, 3); fs(c, '#f2ead7', '#4a0e0a', 1.2); c.fillStyle = '#e9c45c'; c.font = '700 9px Georgia, serif'; c.textAlign = 'center'; c.fillText('POST', 0, -126); rrect(c, -30, -8, 60, 8, 2); fs(c, '#4a0e0a'); });
const hydrant = () => piece(50, 80, (c) => { ell(c, 0, -2, 22, 4, 'rgba(0,0,0,.22)'); rrect(c, -14, -64, 28, 64, 5); fs(c, lg(c, -14, 0, 14, 0, '#c9a02e', '#f2c94e'), '#6a4f14', 1.8); c.beginPath(); c.arc(0, -64, 14, Math.PI, 0); fs(c, '#d9b23e', '#6a4f14', 1.8); for (const s of [-1, 1]) { rrect(c, s * 14 - (s > 0 ? 0 : 9), -46, 9, 12, 2); fs(c, '#d9b23e', '#6a4f14', 1.4); } rrect(c, -18, -6, 36, 6, 2); fs(c, '#b48a24', '#6a4f14', 1.2); });
function stall(cloth, goods) {
  return piece(290, 300, (c) => {
    ell(c, 0, -2, 150, 9, 'rgba(0,0,0,.22)');
    for (const s of [-1, 1]) { c.fillStyle = '#7a5236'; c.fillRect(s * 128 - 4, -260, 8, 260); }
    plankRect(c, -140, -120, 280, 16, 2, true, 0); c.fillStyle = lg(c, 0, -104, 0, 0, '#a2744b', '#7c5436'); c.fillRect(-134, -104, 268, 104); c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(-134, -104, 268, 104);
    c.fillStyle = cloth[0]; c.beginPath(); c.moveTo(-140, -104); for (let i = 0; i <= 10; i++) c.lineTo(-140 + i * 28, -104 + (i % 2 ? 30 : 22)); c.lineTo(140, -104); c.fill();
    goods(c);
    awning(c, -150, -296, 290, cloth, 44);
  }, 26);
}
const stallFruit = () => stall(['#c9503f', '#f6f0e0'], (c) => { for (let i = 0; i < 4; i++) { crate(c, -105 + i * 70, -120, 62, 26); fruitPile(c, -105 + i * 70, -146, 56, ['#e8594f', '#f2b24e', '#8fbf4a', '#b05ab0'][i]); } });
const stallFlowers = () => stall(['#d77fb0', '#f6f0e0'], (c) => { for (let i = 0; i < 6; i++) { const x = -110 + i * 44; rrect(c, x - 16, -150, 32, 30, 3); fs(c, '#7a8a9a', INK, 1.4); for (let k = 0; k < 7; k++) { const fx = x + rr(-14, 14), fy = -158 - rr(0, 30); c.strokeStyle = '#4f7f45'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, -150); c.lineTo(fx, fy); c.stroke(); ell(c, fx, fy, 6, 6, pick(['#e8594f', '#f2c14e', '#f6f0e8', '#d77fb0', '#9a7ad0'])); ell(c, fx, fy, 2, 2, '#f2d24e'); } } });
const stallFish = () => stall(['#3f6f9f', '#f6f0e0'], (c) => { c.fillStyle = '#dfe8ec'; c.fillRect(-130, -136, 260, 16); for (let i = 0; i < 7; i++) { const x = -110 + i * 36; c.save(); c.translate(x, -138); c.rotate(-0.15 + (i % 2) * 0.3); c.beginPath(); c.ellipse(0, 0, 16, 6, 0, 0, TAU); fs(c, lg(c, 0, -6, 0, 6, '#c8d4dc', '#7f98a8'), '#4a5a68', 1.2); c.beginPath(); c.moveTo(14, 0); c.lineTo(22, -6); c.lineTo(22, 6); c.closePath(); fs(c, '#8fa4b2', '#4a5a68', 1); ell(c, -10, -1, 1.6, 1.6, '#222'); c.restore(); } for (let i = 0; i < 6; i++) ell(c, -120 + i * 48, -126, 6, 3, '#f6f0e8', 0.8); });
const crates = () => piece(160, 120, (c) => { ell(c, 0, -2, 80, 7, 'rgba(0,0,0,.2)'); crate(c, -36, 0, 72, 56); crate(c, 38, 0, 70, 50); crate(c, -10, -56, 66, 50); fruitPile(c, -10, -106, 56, '#f2b24e'); });
const busShelter = () => piece(420, 300, (c) => {
  ell(c, 0, -2, 210, 9, 'rgba(0,0,0,.2)');
  for (const x of [-196, 196]) { c.fillStyle = '#3c3a40'; c.fillRect(x - 5, -270, 10, 270); }
  c.fillStyle = 'rgba(200,225,235,.35)'; c.fillRect(-190, -250, 380, 200); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; c.strokeRect(-190, -250, 380, 200);
  c.fillStyle = 'rgba(255,255,255,.25)'; for (const x of [-150, 30]) { c.beginPath(); c.moveTo(x, -50); c.lineTo(x + 50, -250); c.lineTo(x + 80, -250); c.lineTo(x + 30, -50); c.fill(); }
  rrect(c, -214, -296, 428, 30, 6); fs(c, lg(c, 0, -296, 0, -266, '#5a7a9a', '#3f5a78'), INK, 2);
  c.fillStyle = '#f6efe0'; c.font = 'italic 700 18px Georgia, serif'; c.textAlign = 'center'; c.fillText('Bus Stop', 0, -275);
  plankRect(c, -120, -78, 240, 12, 2, true, 0); for (const s of [-1, 1]) { c.fillStyle = '#3c3a40'; c.fillRect(s * 100 - 3, -66, 6, 66); }
});
const busStopSign = () => piece(80, 330, (c) => { ell(c, 0, -2, 22, 5, 'rgba(0,0,0,.22)'); c.fillStyle = '#3c3a40'; c.fillRect(-4, -300, 8, 300); c.beginPath(); circ(c, 0, -300, 30); fs(c, '#c9503f', INK, 2); c.beginPath(); circ(c, 0, -300, 22); fs(c, '#f6efe0'); c.fillStyle = '#c9503f'; c.font = '700 16px Georgia, serif'; c.textAlign = 'center'; c.fillText('BUS', 0, -294); });
const routeBoard = () => piece(150, 330, (c) => { ell(c, 0, -2, 60, 6, 'rgba(0,0,0,.22)'); for (const s of [-1, 1]) { c.fillStyle = '#3c3a40'; c.fillRect(s * 58 - 4, -300, 8, 300); } rrect(c, -72, -310, 144, 170, 6); fs(c, '#3f5a78', INK, 2); rrect(c, -62, -300, 124, 150, 4); fs(c, '#f6efe0'); c.strokeStyle = '#555'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-52, -280 + i * 32); c.bezierCurveTo(-10, -290 + i * 40, 10, -200 - i * 20, 52, -250 + ((i * 2) % 4) * 26); c.stroke(); } c.fillStyle = '#3f5a78'; c.font = 'italic 700 13px Georgia, serif'; c.textAlign = 'center'; c.fillText('Routes', 0, -128); });
const trafficLight = () => piece(80, 420, (c) => { ell(c, 0, -2, 22, 5, 'rgba(0,0,0,.22)'); c.fillStyle = '#2c2c34'; c.fillRect(-5, -300, 10, 300); rrect(c, -22, -410, 44, 116, 8); fs(c, lg(c, -22, 0, 22, 0, '#2c2c34', '#44444e'), '#111', 2); for (let i = 0; i < 3; i++) { c.beginPath(); circ(c, 0, -390 + i * 36, 13); fs(c, '#1a1a1e', '#000', 1.5); c.beginPath(); c.arc(0, -396 + i * 36, 16, Math.PI * 1.05, Math.PI * 1.95); c.strokeStyle = '#2c2c34'; c.lineWidth = 4; c.stroke(); } });
const crossingPole = () => piece(70, 260, (c) => { ell(c, 0, -2, 20, 5, 'rgba(0,0,0,.22)'); c.fillStyle = '#2c2c34'; c.fillRect(-4, -250, 8, 250); rrect(c, -20, -250, 40, 70, 6); fs(c, lg(c, -20, 0, 20, 0, '#c9a02e', '#f2c94e'), '#6a4f14', 2); rrect(c, -13, -170, 26, 50, 5); fs(c, '#2c2c34', '#111', 1.6); });
const barrier = () => piece(220, 130, (c) => { for (const s of [-1, 1]) { c.fillStyle = '#5a5a60'; c.fillRect(s * 96 - 4, -110, 8, 110); rrect(c, s * 96 - 16, -6, 32, 6, 2); fs(c, '#3c3a40'); } for (const y of [-110, -60]) { rrect(c, -110, y, 220, 26, 3); fs(c, '#f6f0e8', INK, 1.6); c.save(); c.beginPath(); c.rect(-110, y, 220, 26); c.clip(); c.fillStyle = '#d8343e'; for (let x = -130; x < 120; x += 40) { c.beginPath(); c.moveTo(x, y + 26); c.lineTo(x + 20, y); c.lineTo(x + 40, y); c.lineTo(x + 20, y + 26); c.fill(); } c.restore(); } c.beginPath(); circ(c, 0, -122, 8); fs(c, '#ffb03a', '#6a4014', 1.5); });
const cone = () => piece(60, 80, (c) => { c.beginPath(); c.moveTo(-8, -76); c.lineTo(8, -76); c.lineTo(22, -6); c.lineTo(-22, -6); c.closePath(); fs(c, lg(c, -22, 0, 22, 0, '#d8541e', '#ff8a3a'), '#6a2a0a', 1.6); c.fillStyle = '#f6f0e8'; c.fillRect(-13, -50, 26, 10); rrect(c, -28, -8, 56, 8, 2); fs(c, '#c9481a', '#6a2a0a', 1.4); });
const closedSign = () => piece(200, 260, (c) => { for (const s of [-1, 1]) { c.fillStyle = '#5a5a60'; c.fillRect(s * 70 - 3, -160, 6, 160); } rrect(c, -95, -250, 190, 120, 6); fs(c, '#f2c94e', INK, 2.5); c.fillStyle = INK; c.font = '700 22px Georgia, serif'; c.textAlign = 'center'; c.fillText('PAVEMENT', 0, -214); c.fillText('CLOSED', 0, -188); c.font = 'italic 600 15px Georgia, serif'; c.fillText("use Baker's Alley ←", 0, -152); });
const digger = () => piece(300, 230, (c) => {
  ell(c, 0, -2, 140, 9, 'rgba(0,0,0,.22)');
  rrect(c, -120, -40, 210, 36, 16); fs(c, '#2c2c34', '#111', 2); for (let x = -100; x < 80; x += 30) { c.beginPath(); circ(c, x, -22, 10); fs(c, '#5a5a60', '#111', 1.5); }
  rrect(c, -110, -110, 160, 72, 8); fs(c, lg(c, 0, -110, 0, -38, '#f2c94e', '#d8a02e'), '#6a4f14', 2);
  rrect(c, -90, -190, 90, 84, 8); fs(c, '#f2c94e', '#6a4f14', 2); glassPane(c, -80, -180, 70, 56, false); c.strokeStyle = '#6a4f14'; c.lineWidth = 2; c.strokeRect(-80, -180, 70, 56);
  c.strokeStyle = '#d8a02e'; c.lineWidth = 16; c.beginPath(); c.moveTo(40, -90); c.lineTo(110, -170); c.lineTo(150, -60); c.stroke(); c.strokeStyle = '#6a4f14'; c.lineWidth = 2; c.stroke();
  c.beginPath(); c.moveTo(136, -70); c.lineTo(170, -60); c.lineTo(160, -24); c.lineTo(128, -40); c.closePath(); fs(c, '#8a8a92', '#2c2c34', 2);
});
function carFront(col) {
  return piece(300, 230, (c) => {
    ell(c, 0, -2, 140, 12, 'rgba(0,0,0,.3)');
    for (const s of [-1, 1]) { rrect(c, s * 105 - 22, -40, 44, 40, 8); fs(c, '#1c1c22', '#000', 1.5); }
    c.beginPath(); c.moveTo(-82, -200); c.quadraticCurveTo(0, -214, 82, -200); c.lineTo(104, -130); c.lineTo(-104, -130); c.closePath(); fs(c, lg(c, 0, -214, 0, -130, shade(col, 0.2), col), shade(col, -0.5), 2);
    c.beginPath(); c.moveTo(-74, -190); c.quadraticCurveTo(0, -200, 74, -190); c.lineTo(92, -136); c.lineTo(-92, -136); c.closePath(); fs(c, lg(c, 0, -200, 0, -136, '#cfe0ea', '#7f9aac'), '#2c3a44', 1.5);
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-50, -136); c.lineTo(-20, -192); c.lineTo(0, -192); c.lineTo(-30, -136); c.fill();
    rrect(c, -132, -136, 264, 100, 20); fs(c, lg(c, 0, -136, 0, -36, shade(col, 0.15), col, shade(col, -0.25)), shade(col, -0.5), 2.2);
    for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 92, -96, 24, 16, 0, 0, TAU); fs(c, rg(c, s * 92, -98, 24, '#fffbe6', '#ffe9a6', '#c9a04a'), '#5a4a2a', 1.8); rrect(c, s * 124 - 8, -118, 16, 10, 3); fs(c, '#ffb03a', '#6a4014', 1); }
    rrect(c, -48, -110, 96, 34, 8); fs(c, '#2c2c34', '#111', 1.6); c.strokeStyle = '#8a8a92'; c.lineWidth = 2; for (let x = -40; x <= 40; x += 10) { c.beginPath(); c.moveTo(x, -106); c.lineTo(x, -80); c.stroke(); }
    rrect(c, -36, -66, 72, 18, 3); fs(c, '#f6efe0', '#2c2c34', 1.4); c.fillStyle = '#2c2c34'; c.font = '700 12px Georgia, serif'; c.textAlign = 'center'; c.fillText('CITY ' + Math.floor(rr(10, 99)), 0, -53);
    rrect(c, -136, -44, 272, 16, 6); fs(c, '#8a8a92', '#2c2c34', 1.6);
    for (const s of [-1, 1]) { rrect(c, s * 128 - 10, -170, 20, 14, 4); fs(c, col, shade(col, -0.5), 1.4); }
  });
}
function busSide() {
  // The bus, seen from the side and facing right. The game draws the number and the destination on it, and the siblings in its windows.
  return sprite(860, 360, 430, 340, (c) => {
    ell(c, 0, -4, 400, 14, 'rgba(0,0,0,.3)');
    rrect(c, -410, -330, 820, 296, 26); fs(c, lg(c, 0, -330, 0, -34, '#e2584a', '#c9402f', '#a8302a'), '#4a0e0a', 3);
    c.fillStyle = '#f6efe0'; c.fillRect(-410, -150, 820, 22); c.fillStyle = '#e9c45c'; c.fillRect(-410, -128, 820, 6);
    // windows: semi-transparent so the siblings show through
    for (let i = 0; i < 6; i++) { const x = -360 + i * 112; c.save(); rrect(c, x, -290, 92, 110, 8); c.globalCompositeOperation = 'destination-out'; c.fill(); c.restore(); rrect(c, x, -290, 92, 110, 8); c.fillStyle = 'rgba(160,200,215,.35)'; c.fill(); c.strokeStyle = '#4a0e0a'; c.lineWidth = 3; c.stroke(); c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.moveTo(x + 10, -184); c.lineTo(x + 40, -286); c.lineTo(x + 56, -286); c.lineTo(x + 26, -184); c.fill(); }
    // the door (the siblings get on here) and the driver's windscreen
    rrect(c, 300, -290, 84, 250, 6); fs(c, 'rgba(160,200,215,.55)', '#4a0e0a', 3); c.strokeStyle = '#4a0e0a'; c.lineWidth = 2; c.beginPath(); c.moveTo(342, -290); c.lineTo(342, -40); c.stroke();
    rrect(c, 392, -300, 18, 150, 6); fs(c, 'rgba(160,200,215,.7)', '#4a0e0a', 2);
    rrect(c, -380, -322, 300, 26, 5); fs(c, '#1c1c22', '#000', 1.5); // destination screen (text drawn by the game)
    for (const x of [-270, 250]) { c.beginPath(); circ(c, x, -36, 44); fs(c, '#1c1c22', '#000', 2); c.beginPath(); circ(c, x, -36, 20); fs(c, '#8a8a92', '#2c2c34', 2); c.beginPath(); c.arc(x, -36, 52, Math.PI, 0); c.strokeStyle = '#4a0e0a'; c.lineWidth = 4; c.stroke(); }
    c.beginPath(); c.ellipse(404, -80, 8, 14, 0, 0, TAU); fs(c, '#fffbe6', '#5a4a2a', 1.5);
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(-400, -324, 800, 8);
  });
}
const ferry = () => sprite(300, 110, 150, 30, (c) => {
  // The ferry's deck top is the ground point, so the siblings stand on it.
  c.beginPath(); c.moveTo(-150, 0); c.lineTo(150, 0); c.lineTo(132, 56); c.lineTo(-132, 56); c.closePath(); fs(c, lg(c, 0, 0, 0, 56, '#5a7a9a', '#3f5a78'), INK, 2.5);
  c.fillStyle = '#f6efe0'; c.fillRect(-146, 12, 292, 8); for (let i = 0; i < 5; i++) { c.beginPath(); circ(c, -110 + i * 55, 36, 8); fs(c, '#f6efe0', INK, 1.4); c.beginPath(); circ(c, -110 + i * 55, 36, 4); fs(c, '#d8343e'); }
  plankRect(c, -150, -10, 300, 12, 2, true, 0);
  for (const s of [-1, 1]) { rrect(c, s * 140 - 6, -40, 12, 32, 3); fs(c, '#7a5236', INK, 1.5); c.beginPath(); circ(c, s * 140, -42, 7); fs(c, '#a2744b', INK, 1.4); }
  c.strokeStyle = '#d8c9a0'; c.lineWidth = 3; c.beginPath(); c.moveTo(-140, -30); c.quadraticCurveTo(0, -14, 140, -30); c.stroke();
}, );
const callButton = () => piece(60, 150, (c) => { ell(c, 0, -2, 18, 4, 'rgba(0,0,0,.22)'); c.fillStyle = '#2c2c34'; c.fillRect(-4, -110, 8, 110); rrect(c, -22, -150, 44, 50, 6); fs(c, lg(c, -22, 0, 22, 0, '#3f5a78', '#5a7a9a'), INK, 2); c.fillStyle = '#f6efe0'; c.font = '700 10px Georgia, serif'; c.textAlign = 'center'; c.fillText('FERRY', 0, -138); });
function bridgeDeck() {
  // The lift bridge, lying flat. Its ground point is the left end of the walking surface (the hinge).
  return sprite(820, 140, 10, 90, (c) => {
    c.fillStyle = lg(c, 0, 0, 0, 40, '#7a5236', '#5a3a26'); c.fillRect(0, 0, 800, 40); c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(0, 0, 800, 40);
    c.fillStyle = '#4a4a52'; c.fillRect(0, 40, 800, 10); for (let x = 20; x < 800; x += 60) { c.beginPath(); c.moveTo(x, 50); c.lineTo(x + 30, 50); c.lineTo(x + 15, 36); c.fill(); }
    plankRect(c, 0, -6, 800, 8, 1, true, 0);
    c.strokeStyle = '#2c2c34'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -80); c.lineTo(800, -80); c.moveTo(0, -46); c.lineTo(800, -46); c.stroke();
    c.lineWidth = 3; for (let x = 0; x <= 800; x += 25) { c.beginPath(); c.moveTo(x, -80); c.lineTo(x, -4); c.stroke(); }
    for (const x of [0, 400, 800]) { rrect(c, x - 6, -88, 12, 84, 2); fs(c, '#3c3a40', '#111', 1.4); }
  });
}
const bridgeHut = () => piece(220, 300, (c) => {
  ell(c, 0, -2, 110, 7, 'rgba(0,0,0,.22)');
  bricks(c, -100, -230, 200, 230, '#7a6a5e'); c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(-100, -230, 200, 230);
  c.beginPath(); c.moveTo(-118, -226); c.lineTo(0, -296); c.lineTo(118, -226); c.closePath(); fs(c, lg(c, 0, -296, 0, -226, '#4f6a7a', '#3a4f5e'), INK, 2);
  windowAt(c, 40, -200, 70, 70, { lit: true });
  // the small door: only the brother fits
  rrect(c, -78, -112, 60, 112, [30, 30, 2, 2]); fs(c, lg(c, -78, 0, -18, 0, '#3f5a78', '#5a7a9a'), INK, 2); knob(c, -28, -56, 4);
  signBoard(c, -70, -160, 140, 30, 'Bridge Control', '#2f4a5a');
});
const powerPost = () => piece(90, 440, (c) => {
  ell(c, 0, -2, 22, 5, 'rgba(0,0,0,.22)'); c.fillStyle = '#5a5a60'; c.fillRect(-6, -420, 12, 420); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(1, -418, 2.5, 416);
  rrect(c, -30, -420, 60, 80, 6); fs(c, lg(c, -30, 0, 30, 0, '#8a8a92', '#b2b2ba'), INK, 2);
  c.fillStyle = '#f2c94e'; c.beginPath(); c.moveTo(0, -410); c.lineTo(-14, -384); c.lineTo(14, -384); c.closePath(); c.fill(); c.fillStyle = INK; c.font = '700 14px Georgia, serif'; c.textAlign = 'center'; c.fillText('!', 0, -388);
  c.fillStyle = INK; c.font = '700 10px Georgia, serif'; c.fillText('POWER', 0, -350);
}, 20);
const parkGate = () => piece(560, 520, (c) => {
  for (const s of [-1, 1]) { bricks(c, s * 230 - 30, -380, 60, 380, '#8a6a5a'); c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(s * 230 - 30, -380, 60, 380); ledge(c, s * 230 - 38, -392, 76, 14, '#e2d6bc'); c.beginPath(); circ(c, s * 230, -408, 16); fs(c, '#e2d6bc', INK, 1.6); }
  c.strokeStyle = '#2c2c34'; c.lineWidth = 8; c.beginPath(); c.arc(0, -330, 200, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
  rrect(c, -150, -470, 300, 56, 8); fs(c, lg(c, 0, -470, 0, -414, '#3f6e4a', '#2f5a3a'), INK, 2.5);
  c.fillStyle = '#f6e7c4'; c.font = 'italic 700 34px Georgia, serif'; c.textAlign = 'center'; c.fillText('Forest Park', 0, -430);
  c.strokeStyle = '#2c2c34'; c.lineWidth = 4; for (let x = -180; x <= 180; x += 20) { if (Math.abs(x) < 120) continue; c.beginPath(); c.moveTo(x, -360 + Math.abs(x) * 0.2); c.lineTo(x, 0); c.stroke(); }
  for (let i = 0; i < 14; i++) { const a = Math.PI * (1.1 + i * 0.058); c.save(); c.translate(Math.cos(a) * 200, -330 + Math.sin(a) * 200); c.rotate(a); c.fillStyle = i % 2 ? '#5f9a46' : '#7fb35c'; leafPath(c, 20, 7); c.fill(); c.restore(); if (i % 3 === 0) ell(c, Math.cos(a) * 200, -330 + Math.sin(a) * 200, 5, 5, '#f2c14e'); }
});
const planter = () => piece(120, 70, (c) => { rrect(c, -50, -56, 100, 56, 6); fs(c, lg(c, -50, 0, 50, 0, '#8a7a6a', '#b2a292'), INK, 2); ledge(c, -56, -62, 112, 10, '#d8cbb0'); });

// ---------- the metro
const metroEntrance = () => piece(380, 340, (c) => {
  ell(c, 0, -2, 160, 9, 'rgba(0,0,0,.25)');
  // the stairwell going down, seen through railings
  c.fillStyle = '#2a2630'; c.fillRect(-124, -84, 248, 84);
  for (let i = 0; i < 7; i++) { c.fillStyle = shade('#a39d92', -i * 0.11); c.fillRect(-124 + i * 7, -84 + i * 12, 248 - i * 14, 8); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-124 + i * 7, -76 + i * 12, 248 - i * 14, 4); }
  c.fillStyle = lg(c, 0, -84, 0, 0, 'rgba(255,230,170,.0)', 'rgba(255,220,150,.25)'); c.fillRect(-124, -84, 248, 84);
  c.strokeStyle = '#2f4a3a'; c.lineWidth = 6; c.beginPath(); c.moveTo(-134, -92); c.lineTo(134, -92); c.stroke();
  c.lineWidth = 3; for (let x = -128; x <= 128; x += 16) { c.beginPath(); c.moveTo(x, -92); c.lineTo(x, 0); c.stroke(); }
  c.strokeStyle = '#d9b55c'; c.lineWidth = 1.6; c.beginPath(); for (let x = -120; x <= 120; x += 16) { c.moveTo(x, -60); c.arc(x + 8, -60, 8, Math.PI, 0); } c.stroke();
  for (const s of [-1, 1]) { c.fillStyle = '#2f4a3a'; c.fillRect(s * 136 - 6, -128, 12, 128); c.beginPath(); circ(c, s * 136, -132, 8); fs(c, '#d9b55c', '#5a4214', 1.2); }
  c.strokeStyle = '#2f4a3a'; c.lineWidth = 7; c.beginPath(); c.moveTo(-136, -126); c.quadraticCurveTo(0, -214, 136, -126); c.stroke();
  rrect(c, -86, -232, 172, 44, 10); fs(c, lg(c, 0, -232, 0, -188, '#d8483a', '#a8302a'), '#4a0e0a', 2.5);
  c.fillStyle = '#fff6e8'; c.font = '700 26px Georgia, serif'; c.textAlign = 'center'; c.fillText('METRO', 0, -201);
  c.fillStyle = '#3c3a40'; c.fillRect(-176, -300, 8, 300);
  c.beginPath(); circ(c, -172, -300, 28); fs(c, '#c9402f', INK, 2); c.beginPath(); circ(c, -172, -300, 18); fs(c, '#fff6e8'); c.fillStyle = '#c9402f'; c.font = '700 22px Georgia, serif'; c.fillText('M', -172, -292);
});
const metroSign = () => piece(220, 260, (c) => { for (const s of [-1, 1]) { c.fillStyle = '#5a5a60'; c.fillRect(s * 76 - 3, -160, 6, 160); } rrect(c, -104, -254, 208, 126, 6); fs(c, '#f2c94e', INK, 2.5); c.fillStyle = INK; c.font = '700 22px Georgia, serif'; c.textAlign = 'center'; c.fillText('STREET', 0, -218); c.fillText('CLOSED', 0, -192); c.font = 'italic 600 16px Georgia, serif'; c.fillText('please use the Metro', 0, -158); c.beginPath(); circ(c, 72, -150, 10); fs(c, '#c9402f'); c.fillStyle = '#fff'; c.font = '700 11px Georgia, serif'; c.fillText('M', 72, -146); });
function trainCar(col) {
  // One metro carriage, seen from the side. Its windows are see-through so the siblings show inside.
  return sprite(900, 360, 450, 340, (c) => {
    ell(c, 0, -2, 420, 12, 'rgba(0,0,0,.35)');
    rrect(c, -440, -322, 880, 300, 28); fs(c, lg(c, 0, -322, 0, -22, '#eef1f3', '#cfd5da', '#a9b2ba'), '#3a4048', 3);
    c.fillStyle = col; c.fillRect(-440, -128, 880, 28); c.fillStyle = shade(col, 0.35); c.fillRect(-440, -100, 880, 6);
    c.fillStyle = shade(col, -0.2); c.fillRect(-440, -322 + 22, 880, 10);
    const hole = (x, y, w, h) => { c.save(); rrect(c, x, y, w, h, 8); c.globalCompositeOperation = 'destination-out'; c.fill(); c.restore(); rrect(c, x, y, w, h, 8); c.fillStyle = 'rgba(170,200,215,.32)'; c.fill(); c.strokeStyle = '#3a4048'; c.lineWidth = 3; c.stroke(); c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.moveTo(x + 10, y + h); c.lineTo(x + w * 0.4, y); c.lineTo(x + w * 0.55, y); c.lineTo(x + 25, y + h); c.fill(); };
    for (const x of [-420, -150, 30, 300]) hole(x, -282, 120, 120);
    for (const dx of [-220, 220]) {
      rrect(c, dx - 52, -290, 104, 262, 6); fs(c, lg(c, dx - 52, 0, dx + 52, 0, '#d8dde1', '#b8c0c6'), '#3a4048', 2.5);
      for (const s of [-1, 1]) hole(dx + s * 26 - 18, -270, 36, 110);
      c.strokeStyle = '#3a4048'; c.lineWidth = 2; c.beginPath(); c.moveTo(dx, -290); c.lineTo(dx, -28); c.stroke();
      c.fillStyle = col; c.fillRect(dx - 52, -128, 104, 28);
    }
    for (const x of [-330, -240, 240, 330]) { c.beginPath(); circ(c, x, -18, 26); fs(c, '#1c1c22', '#000', 2); c.beginPath(); circ(c, x, -18, 11); fs(c, '#8a8a92', '#2c2c34', 1.5); }
    rrect(c, -380, -30, 200, 14, 4); fs(c, '#4a4e56'); rrect(c, 180, -30, 200, 14, 4); fs(c, '#4a4e56');
    for (const x of [-300, 0, 300]) { rrect(c, x - 40, -334, 80, 14, 4); fs(c, '#8a929a', '#3a4048', 1.5); }
  });
}
const metroTile = () => tileArt(120, (c, n) => {
  c.fillStyle = '#d9d2c2'; c.fillRect(0, 0, n, n);
  for (let y = 0, r = 0; y < n; y += 20, r++) for (let x = (r % 2) * 20; x < n + 40; x += 40) { rrect(c, x + 1.5, y + 1.5, 37, 17, 2); c.fillStyle = pick(['#f4efe2', '#efe9da', '#f7f2e6']); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(x + 4, y + 3, 14, 2); }
});
const pillar = () => piece(90, 560, (c) => {
  c.fillStyle = lg(c, -36, 0, 36, 0, '#c9c2b2', '#efe9da', '#bdb6a6'); c.fillRect(-36, -540, 72, 540); c.strokeStyle = 'rgba(90,80,70,.4)'; c.lineWidth = 1.5;
  for (let y = -530; y < 0; y += 20) { c.beginPath(); c.moveTo(-36, y); c.lineTo(36, y); c.stroke(); }
  rrect(c, -46, -560, 92, 26, 4); fs(c, '#a39d92', INK, 1.5); rrect(c, -44, -20, 88, 20, 3); fs(c, '#8f8a80', INK, 1.5);
});

// ---------- the list of every city image: group name (used by the game), file name, resolution, how to paint it
function generateCity() {
  const out = [];
  const make = (group, name, scale, mk) => { GEN_SCALE = scale; out.push({ group, file: name + '.png', s: mk() }); };
  // backgrounds and ground
  make('skylineFar', 'background/skyline-far-1', 1, () => skyline(1800, 560, 1, false)); make('skylineFar', 'background/skyline-far-2', 1, () => skyline(1800, 560, 2, false));
  make('skylineNear', 'background/skyline-near-1', 1.2, () => skyline(1600, 600, 3, true)); make('skylineNear', 'background/skyline-near-2', 1.2, () => skyline(1600, 600, 4, true));
  make('pavement', 'ground/pavement', 2, pavementTile); make('road', 'ground/road', 2, roadTile); make('cobbles', 'ground/cobbles', 2, cobbleTile); make('stone', 'ground/stone-wall', 2, quayStoneTile);
  // building fronts
  make('homeFront', 'buildings/home-front', 1.6, homeFront); make('townhouseCream', 'buildings/townhouse-cream', 1.6, townhouseCream);
  make('townhouseBrick', 'buildings/townhouse-brick', 1.6, townhouseBrick); make('grocer', 'buildings/grocer', 1.6, grocer); make('cornerShop', 'buildings/corner-shop', 1.6, cornerShop);
  make('cafe', 'buildings/cafe', 1.6, cafe); make('bakery', 'buildings/bakery', 1.6, bakery); make('bookshop', 'buildings/bookshop', 1.6, bookshop); make('apartment', 'buildings/apartment', 1.6, apartment);
  make('warehouse', 'buildings/warehouse', 1.4, warehouse); make('courtyard', 'buildings/courtyard', 1.4, courtyard); make('courtGate', 'buildings/courtyard-gate', 2, courtGate);
  // street things
  make('streetLamp', 'street/street-lamp', 2, streetLamp); make('bench', 'street/bench', 2, bench); make('bin', 'street/bin', 2, bin); make('postbox', 'street/postbox', 2, postbox); make('hydrant', 'street/hydrant', 2, hydrant);
  make('planter', 'street/planter', 2, planter); make('busShelter', 'street/bus-shelter', 2, busShelter); make('busStopSign', 'street/bus-stop-sign', 2, busStopSign); make('routeBoard', 'street/route-board', 2, routeBoard);
  make('trafficLight', 'street/traffic-light', 2, trafficLight); make('crossingPole', 'street/crossing-button', 2, crossingPole);
  make('barrier', 'street/roadworks-barrier', 2, barrier); make('cone', 'street/cone', 2, cone); make('closedSign', 'street/pavement-closed-sign', 2, closedSign); make('digger', 'street/digger', 2, digger);
  // market
  make('stallFruit', 'market/stall-fruit', 2, stallFruit); make('stallFlowers', 'market/stall-flowers', 2, stallFlowers); make('stallFish', 'market/stall-fish', 2, stallFish); make('crates', 'market/crates', 2, crates);
  // vehicles
  make('car', 'vehicles/car-red', 2, () => carFront('#c9402f')); make('car', 'vehicles/car-blue', 2, () => carFront('#3f6f9f')); make('car', 'vehicles/car-yellow', 2, () => carFront('#e9b23c')); make('car', 'vehicles/car-green', 2, () => carFront('#4f8a5a'));
  make('bus', 'vehicles/bus', 1.6, busSide);
  // canal and river
  make('ferry', 'water/ferry', 2, ferry); make('callButton', 'water/ferry-button', 2, callButton);
  make('bridgeDeck', 'water/bridge-deck', 1.6, bridgeDeck); make('bridgeHut', 'water/bridge-hut', 2, bridgeHut); make('powerPost', 'water/power-post', 2, powerPost);
  make('parkGate', 'park/park-gate', 1.6, parkGate);
  // the metro
  make('metroEntrance', 'metro/metro-entrance', 2, metroEntrance); make('metroSign', 'metro/street-closed-sign', 2, metroSign);
  make('trainBlue', 'metro/train-blue', 1.6, () => trainCar('#3f6f9f')); make('trainGreen', 'metro/train-green', 1.6, () => trainCar('#4f8a5a'));
  make('metroTile', 'metro/wall-tiles', 2, metroTile); make('pillar', 'metro/pillar', 2, pillar);
  return out;
}

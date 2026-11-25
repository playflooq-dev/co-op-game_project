'use strict';
// Drawing code that painted the Level 1 house art in assets/house/.
// The game does not load this file. tools/export.html?set=house uses it to (re)create the images.
// Needs js/helpers.js and tools/generate-assets.js loaded first (sprite, canopy, palettes).

const WD = ['#3a2416', '#5b3b25', '#7c5436', '#a2744b', '#c79a69']; // wood, deep shadow to light
const OUT = '#3a2618'; // outline colour used on furniture
// A piece of furniture: (0, 0) is the middle of where it touches the floor; it is drawn upward (negative y).
function piece(w, h, fn, pad = 26) { return sprite(w + pad * 2, h + pad + 16, w / 2 + pad, h + pad, fn); }
function tileArt(n, fn) { return sprite(n, n, 0, 0, (c) => fn(c, n)); }
function floorShadow(c, w) { soft(c, 0, 2, w * 0.58, 10, '#2a1a0e', 0.38); }
function grain(c, x, y, w, h, n, col = WD[0]) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.strokeStyle = col; c.lineWidth = 1.2;
  for (let i = 0; i < n; i++) { const yy = y + rr(2, h - 2), x0 = x + rr(-20, w * 0.5); c.globalAlpha = rr(0.18, 0.4); c.beginPath(); c.moveTo(x0, yy); c.bezierCurveTo(x0 + w * 0.2, yy + rr(-3, 3), x0 + w * 0.4, yy + rr(-3, 3), x0 + rr(w * 0.4, w * 0.9), yy + rr(-2, 2)); c.stroke(); }
  c.restore(); c.globalAlpha = 1;
}
function vgrain(c, x, y, w, h, n, col = WD[0]) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.strokeStyle = col; c.lineWidth = 1.2;
  for (let i = 0; i < n; i++) { const xx = x + rr(2, w - 2), y0 = y + rr(-20, h * 0.5); c.globalAlpha = rr(0.18, 0.4); c.beginPath(); c.moveTo(xx, y0); c.bezierCurveTo(xx + rr(-3, 3), y0 + h * 0.2, xx + rr(-3, 3), y0 + h * 0.4, xx + rr(-2, 2), y0 + rr(h * 0.4, h * 0.9)); c.stroke(); }
  c.restore(); c.globalAlpha = 1;
}
// A wooden board with light from the upper right, an outline and grain.
function plankRect(c, x, y, w, h, r = 3, horiz = true, shade = 0) {
  rrect(c, x, y, w, h, r); fs(c, horiz ? lg(c, 0, y, 0, y + h, WD[4 - shade], WD[3 - shade]) : lg(c, x, 0, x + w, 0, WD[2 - Math.min(shade, 2)], WD[3 - shade], WD[4 - shade]), OUT, 2);
  if (horiz) grain(c, x, y, w, h, Math.max(2, Math.round(w * h / 900))); else vgrain(c, x, y, w, h, Math.max(2, Math.round(w * h / 900)));
}
function knob(c, x, y, r = 4.5, col = '#d9b55c') { c.beginPath(); circ(c, x, y, r); fs(c, rg(c, x - r * 0.3, y - r * 0.3, r * 1.4, '#fff3c4', col, '#8a6a22'), '#5a4214', 1.2); }
const BOOK_COLS = ['#a8473b', '#3f6f8f', '#5f8a4b', '#c99a3c', '#7a4f7d', '#2f5a5a', '#b9683a', '#e0c79a', '#456a3a', '#8c3a3a'];
function books(c, x0, x1, yb, hmax) {
  let x = x0;
  while (x < x1 - 8) {
    const w = Math.min(x1 - x, rr(9, 19)), h = rr(0.68, 1) * hmax, col = pick(BOOK_COLS), lean = R() < 0.1 && x + w + 18 < x1;
    c.save(); c.translate(x, yb); if (lean) c.rotate(-0.22);
    rrect(c, 0, -h, w, h, 1.5); fs(c, col, OUT, 1.3); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(w * 0.6, -h, w * 0.4, h);
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(1.5, -h + 2, 2, h - 4);
    c.fillStyle = rgba('#f1d58a', 0.85); c.fillRect(1, -h + h * 0.18, w - 2, 2.2); c.fillRect(1, -h * 0.25, w - 2, 2.2);
    c.restore(); x += w + (lean ? 16 : rr(0, 1.5));
  }
}
function fabricFolds(c, x0, y0, x1, y1, n, col, a = 0.35) {
  c.strokeStyle = col; c.lineWidth = 2; c.globalAlpha = a;
  for (let i = 1; i < n; i++) { const x = x0 + (x1 - x0) * i / n + rr(-4, 4); c.beginPath(); c.moveTo(x, y0 + rr(4, 14)); c.quadraticCurveTo(x + rr(-6, 6), (y0 + y1) / 2, x + rr(-4, 4), y1 - 2); c.stroke(); }
  c.globalAlpha = 1;
}

// ---------- wall, floor and outside textures (repeating tiles)
function mkWallpaper(base, stripe, motif) {
  return tileArt(160, (c, n) => {
    c.fillStyle = base; c.fillRect(0, 0, n, n);
    if (stripe) { c.fillStyle = stripe; for (let x = 0; x < n; x += 40) c.fillRect(x + 6, 0, 12, n); c.fillStyle = rgba('#ffffff', 0.25); for (let x = 0; x < n; x += 40) c.fillRect(x + 24, 0, 2, n); }
    for (const [x, y] of [[40, 40], [120, 120]]) motif(c, x, y);
    c.fillStyle = rgba('#7a5a3a', 0.05); for (let i = 0; i < 120; i++) c.fillRect(rr(0, n), rr(0, n), 2, 2);
  });
}
function sprig(c, x, y, col, berry) {
  c.strokeStyle = col; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y + 12); c.quadraticCurveTo(x + 2, y, x - 1, y - 12); c.stroke();
  for (const [dy, s] of [[6, 1], [-1, -1], [-7, 1]]) { c.save(); c.translate(x, y + dy); c.rotate(s * 1.0); c.fillStyle = col; leafPath(c, 9, 3.4); c.fill(); c.restore(); }
  if (berry) ell(c, x - 1, y - 13, 2.6, 2.6, berry);
}
function starMotif(c, x, y, col, r = 7) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); } c.closePath(); c.fill(); }
const wallKitchen = () => mkWallpaper('#f4e4bf', '#eedaae', (c, x, y) => { sprig(c, x, y, '#8fae6a', '#e0a23a'); ell(c, x + 40, y + 40, 2, 2, '#d9b77a'); });
const wallLiving = () => mkWallpaper('#cdd8b1', '#c1cea3', (c, x, y) => { c.fillStyle = rgba('#fbf4dc', 0.7); c.beginPath(); c.moveTo(x, y - 9); c.lineTo(x + 6, y); c.lineTo(x, y + 9); c.lineTo(x - 6, y); c.closePath(); c.fill(); });
const wallBedroom = () => mkWallpaper('#cadbe8', null, (c, x, y) => { starMotif(c, x, y, '#f7edc6', 8); starMotif(c, x + 40, y - 30, '#f7edc6', 4); ell(c, x - 25, y + 30, 2.5, 2.5, '#f7edc6'); ell(c, x + 30, y + 25, 1.8, 1.8, '#ffffff'); });
const wallStudy = () => mkWallpaper('#e3caa0', '#dcc092', (c, x, y) => { c.strokeStyle = rgba('#a9824e', 0.5); c.lineWidth = 1.6; c.beginPath(); c.arc(x, y, 9, 0, TAU); c.moveTo(x, y - 15); c.lineTo(x, y + 15); c.moveTo(x - 15, y); c.lineTo(x + 15, y); c.stroke(); ell(c, x, y, 2.5, 2.5, '#b48c55'); });
const floorTile = () => tileArt(256, (c, n) => {
  c.fillStyle = WD[3]; c.fillRect(0, 0, n, n);
  for (let row = 0; row < n / 32; row++) for (let x = -(row % 2) * 90; x < n; x += 180) {
    const y = row * 32, col = pick([WD[3], WD[4], '#b5885b', '#9b6e45']);
    c.fillStyle = lg(c, 0, y, 0, y + 32, col, WD[2]); c.fillRect(x + 1, y + 1, 178, 30);
    grain(c, x + 1, y + 1, 178, 30, 4, WD[1]);
    c.fillStyle = WD[0]; c.fillRect(x, y, 1.5, 32); c.fillRect(x, y, 180, 1.5);
    c.fillStyle = rgba('#fff2d0', 0.25); c.fillRect(x + 2, y + 2, 176, 2);
  }
});
const brickTile = () => tileArt(160, (c, n) => {
  c.fillStyle = '#d8c3a3'; c.fillRect(0, 0, n, n);
  for (let row = 0; row < n / 20; row++) for (let x = -(row % 2) * 20; x < n; x += 40) {
    const col = pick(['#c2785a', '#b5694d', '#cc8565', '#a85f45']);
    rrect(c, x + 2, row * 20 + 2, 36, 16, 3); c.fillStyle = lg(c, 0, row * 20, 0, row * 20 + 20, col, '#8f4f38'); c.fill();
    c.fillStyle = rgba('#ffffff', 0.12); c.fillRect(x + 4, row * 20 + 3, 30, 2);
  }
});
const roofTile = () => tileArt(160, (c, n) => {
  c.fillStyle = '#6e3b2b'; c.fillRect(0, 0, n, n);
  for (let row = 0; row < n / 20; row++) for (let x = -(row % 2) * 16; x < n + 32; x += 32) {
    const y = row * 20, col = pick(['#a5543c', '#97492f', '#b4604a', '#8a4330']);
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + 32, y); c.lineTo(x + 32, y + 14); c.quadraticCurveTo(x + 16, y + 26, x, y + 14); c.closePath();
    fs(c, lg(c, 0, y, 0, y + 24, col, '#6a3324'), '#4c2318', 1.2);
    c.strokeStyle = rgba('#f0b08a', 0.3); c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 4, y + 3); c.lineTo(x + 26, y + 3); c.stroke();
  }
});
const stoneTile = () => tileArt(160, (c, n) => {
  c.fillStyle = '#8b8577'; c.fillRect(0, 0, n, n);
  for (let row = 0; row < 4; row++) for (let x = -(row % 2) * 30; x < n; x += 60) {
    rrect(c, x + 3, row * 40 + 3, 54, 34, 9); fs(c, lg(c, 0, row * 40, 0, row * 40 + 40, pick(['#b3ab99', '#a59d8b', '#bdb5a3']), '#857d6d'), '#5d574c', 1.4);
    c.fillStyle = rgba('#ffffff', 0.15); c.fillRect(x + 10, row * 40 + 7, 30, 3);
  }
});

// ---------- kitchen
function mkFridge() {
  return piece(150, 320, (c) => {
    floorShadow(c, 150); const x = -75, y = -320;
    rrect(c, x, y, 150, 314, [44, 44, 10, 10]); fs(c, lg(c, x, 0, x + 150, 0, '#7db6a9', '#a5d6c9', '#c3e8dd'), OUT, 2.5);
    c.strokeStyle = '#5c8f83'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x + 4, y + 110); c.lineTo(x + 146, y + 110); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.35)'; rrect(c, x + 12, y + 18, 9, 84, 4); c.fill(); rrect(c, x + 12, y + 122, 9, 170, 4); c.fill();
    for (const [hy, hh] of [[y + 40, 50], [y + 128, 90]]) { rrect(c, x + 124, hy, 10, hh, 5); fs(c, lg(c, x + 124, 0, x + 134, 0, '#eef2f2', '#9aa5a8'), '#5a6468', 1.4); }
    rrect(c, x + 58, y + 12, 34, 9, 4); fs(c, '#d9dfe0', '#7d878a', 1.2);
    for (const fx of [x + 16, x + 124]) { rrect(c, fx, -8, 14, 10, 3); fs(c, '#4a4440', null); }
    // parents' note held by a heart magnet
    c.save(); c.translate(x + 62, y + 150); c.rotate(-0.06); rrect(c, -30, 0, 60, 74, 2); fs(c, '#fffdf2', '#c9bfa3', 1.2);
    c.strokeStyle = '#7b8bb0'; c.lineWidth = 1.3; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-22, 14 + i * 9); c.lineTo(22 - (i === 5 ? 18 : rr(0, 8)), 14 + i * 9); c.stroke(); }
    c.fillStyle = '#d84a4a'; c.beginPath(); c.moveTo(0, 6); c.bezierCurveTo(-12, -4, -6, -12, 0, -5); c.bezierCurveTo(6, -12, 12, -4, 0, 6); c.fill(); c.restore();
    // a kid's drawing and two magnets
    c.save(); c.translate(x + 92, y + 222); c.rotate(0.08); rrect(c, -26, 0, 52, 44, 2); fs(c, '#ffffff', '#c9bfa3', 1.1);
    ell(c, 14, 10, 7, 7, '#f2c341'); c.strokeStyle = '#3e7bbf'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-16, 38); c.lineTo(-16, 26); c.moveTo(-6, 38); c.lineTo(-6, 28); c.stroke(); ell(c, -16, 22, 4, 4, '#3e7bbf'); ell(c, -6, 24, 3.4, 3.4, '#5a9a4a');
    c.fillStyle = '#5a9a4a'; c.fillRect(-26, 38, 52, 6); c.restore();
    ell(c, x + 28, y + 60, 6, 6, '#f2c341'); ell(c, x + 104, y + 74, 5, 5, '#5aa0d8');
  });
}
function mkCounter() {
  return piece(340, 300, (c) => {
    floorShadow(c, 340); const x = -170;
    // tiled splashback
    for (let ty = -300; ty < -182; ty += 24) for (let tx = x; tx < x + 340; tx += 24) { rrect(c, tx + 1, ty + 1, 22, 22, 3); c.fillStyle = ((tx - x) / 24 + (ty + 300) / 24) % 2 ? '#e8efe9' : '#bcd7d0'; c.fill(); }
    c.strokeStyle = 'rgba(80,110,100,.35)'; c.lineWidth = 1; c.strokeRect(x, -300, 340, 118);
    // cabinets
    plankRect(c, x, -172, 340, 172, 4, false, 1);
    for (let i = 0; i < 2; i++) { const dx = x + 10 + i * 82; rrect(c, dx, -160, 76, 146, 5); fs(c, lg(c, dx, 0, dx + 76, 0, WD[3], WD[4]), OUT, 1.6); rrect(c, dx + 10, -148, 56, 122, 4); c.strokeStyle = rgba(WD[1], 0.6); c.lineWidth = 1.6; c.stroke(); knob(c, dx + (i ? 10 : 66), -96); }
    // oven
    const ox = x + 182; rrect(c, ox, -162, 148, 150, 6); fs(c, lg(c, ox, 0, ox + 148, 0, '#e9e1cf', '#fbf6ea'), '#6b6458', 2);
    rrect(c, ox + 18, -128, 112, 74, 8); fs(c, lg(c, 0, -128, 0, -54, '#3a3230', '#6a4a36'), '#2a2422', 2); soft(c, ox + 74, -80, 40, 14, '#ffb35a', 0.5);
    rrect(c, ox + 22, -146, 104, 9, 4); fs(c, '#c9c2b2', '#6b6458', 1.2);
    for (let i = 0; i < 4; i++) { c.beginPath(); circ(c, ox + 28 + i * 31, -151, 6); fs(c, '#3a3633', '#1c1a18', 1); }
    // worktop
    rrect(c, x - 8, -184, 356, 16, 4); fs(c, lg(c, 0, -184, 0, -168, '#f2ece0', '#cfc6b4'), '#6b6458', 2);
    // sink with tap
    rrect(c, x + 40, -186, 110, 8, 3); fs(c, '#b9c3c6', '#5a6468', 1.4);
    c.strokeStyle = '#8b979b'; c.lineWidth = 6; c.beginPath(); c.moveTo(x + 120, -186); c.lineTo(x + 120, -236); c.quadraticCurveTo(x + 120, -250, x + 104, -248); c.lineTo(x + 96, -242); c.stroke();
    c.strokeStyle = '#d6dfe2'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 118, -190); c.lineTo(x + 118, -236); c.stroke();
    // copper pot and kettle on the stove top
    const px = ox + 44; rrect(c, px - 30, -230, 60, 46, [6, 6, 12, 12]); fs(c, lg(c, px - 30, 0, px + 30, 0, '#8a4a2a', '#e09a62', '#b9683a'), '#5a2e18', 2);
    rrect(c, px - 34, -236, 68, 9, 4); fs(c, '#c27a48', '#5a2e18', 1.6); c.strokeStyle = '#5a2e18'; c.lineWidth = 5; c.beginPath(); c.moveTo(px + 34, -222); c.lineTo(px + 58, -228); c.stroke();
    const kx = ox + 112; c.beginPath(); c.ellipse(kx, -208, 26, 24, 0, 0, TAU); fs(c, lg(c, kx - 26, 0, kx + 26, 0, '#c9473c', '#f07d5e'), '#7a2420', 2);
    c.beginPath(); c.arc(kx, -232, 14, Math.PI, 0); c.strokeStyle = '#3a2a22'; c.lineWidth = 4; c.stroke(); c.strokeStyle = '#7a2420'; c.lineWidth = 6; c.beginPath(); c.moveTo(kx - 22, -206); c.lineTo(kx - 38, -222); c.stroke();
    ell(c, kx + 6, -216, 6, 4, '#ffffff', 0.45);
    // fruit bowl
    rrect(c, x + 6, -200, 30, 14, [2, 2, 10, 10]); fs(c, '#e9dcc2', '#8a7a5a', 1.2); ell(c, x + 14, -204, 7, 7, '#d8443c'); ell(c, x + 26, -205, 7, 7, '#e8b23a'); ell(c, x + 20, -210, 6, 6, '#7fb35c');
  });
}
function mkWallShelf() {
  return piece(240, 120, (c) => {
    for (const bx of [-96, 96]) { c.beginPath(); c.moveTo(bx - 6, -16); c.lineTo(bx + 6, -16); c.lineTo(bx + 6, 18); c.closePath(); fs(c, WD[2], OUT, 1.5); }
    // jars
    const jars = [['#e5c66a', 34], ['#c4683a', 44], ['#e9e1d0', 38], ['#7a4f2e', 30]];
    jars.forEach(([col, h], i) => { const jx = -100 + i * 40; rrect(c, jx, -16 - h, 30, h, 6); fs(c, 'rgba(220,240,240,.5)', '#6b7a7d', 1.4); rrect(c, jx + 3, -16 - h * 0.75, 24, h * 0.75 - 2, 4); c.fillStyle = col; c.fill(); rrect(c, jx - 1, -20 - h, 32, 7, 2); fs(c, '#b5884e', OUT, 1.2); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(jx + 5, -12 - h, 3, h - 10); });
    // pot plant with trailing ivy
    rrect(c, 66, -48, 38, 34, [4, 4, 10, 10]); fs(c, lg(c, 66, 0, 104, 0, '#b8643f', '#d9865a'), '#6a3324', 1.6);
    canopy(c, clusters(4, 85, -62, 14, 6, 10, 14), GA, 0.45);
    c.strokeStyle = '#3f6e39'; c.lineWidth = 1.6; for (const [vx, vl] of [[72, 70], [98, 50]]) { c.beginPath(); c.moveTo(vx, -20); c.quadraticCurveTo(vx + 6, -20 + vl / 2, vx - 2, -20 + vl); c.stroke(); for (let y = -12; y < -20 + vl; y += 9) { c.save(); c.translate(vx + rr(-3, 3), y); c.rotate(rr(1.6, 4.6)); c.fillStyle = pick(['#3f7a3c', '#5a9a4a', '#7fb85a']); leafPath(c, 9, 4); c.fill(); c.restore(); } }
    plankRect(c, -120, -18, 240, 12, 3);
    // mugs on hooks
    for (const mx of [-60, -20, 20]) { c.strokeStyle = '#8a7a5a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(mx, -6); c.lineTo(mx, 2); c.stroke(); rrect(c, mx - 9, 2, 18, 18, [2, 2, 6, 6]); fs(c, pick(['#e9e1d0', '#9fc6d8', '#e9a68a']), '#6b6458', 1.3); c.beginPath(); c.arc(mx + 10, 11, 5, -1.4, 1.4); c.stroke(); }
  });
}
function mkWallClock() {
  return piece(80, 80, (c) => {
    c.beginPath(); circ(c, 0, -40, 36); fs(c, lg(c, -36, 0, 36, 0, WD[2], WD[4]), OUT, 2.2);
    c.beginPath(); circ(c, 0, -40, 28); fs(c, '#fbf5e4', '#8a7a5a', 1.4);
    c.fillStyle = '#5a4a3a'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.fillRect(Math.cos(a) * 23 - 1, -40 + Math.sin(a) * 23 - 1, 2.4, 2.4); }
    c.strokeStyle = '#3a2a22'; c.lineCap = 'round'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -40); c.lineTo(10, -52); c.moveTo(0, -40); c.lineTo(0, -60); c.stroke(); ell(c, 0, -40, 3, 3, '#3a2a22');
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-10, -54, 10, 5, -0.6, 0, TAU); c.fill();
  });
}
function mkWindow(curtain, curtainDark) {
  // Glass is left see-through: the game paints the outdoor view behind it. Glass area: x -78..78, y -224..-16.
  return piece(260, 262, (c) => {
    rrect(c, -95, -240, 190, 240, 6); c.lineWidth = 16; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 12; c.strokeStyle = '#f2ead7'; c.stroke();
    c.fillStyle = 'rgba(225,240,255,.12)'; c.fillRect(-78, -224, 156, 208);
    c.strokeStyle = '#f2ead7'; c.lineWidth = 8; c.beginPath(); c.moveTo(0, -224); c.lineTo(0, -16); c.moveTo(-78, -120); c.lineTo(78, -120); c.stroke();
    c.strokeStyle = 'rgba(70,55,40,.4)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(4, -224); c.lineTo(4, -16); c.moveTo(-78, -116); c.lineTo(78, -116); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 5; c.beginPath(); c.moveTo(-60, -150); c.lineTo(-30, -200); c.moveTo(20, -60); c.lineTo(44, -100); c.stroke();
    rrect(c, -112, -14, 224, 16, 4); fs(c, lg(c, 0, -14, 0, 2, '#fbf6ea', '#d9cfb8'), OUT, 2);
    // curtains with a tie-back
    for (const s of [-1, 1]) {
      c.save(); c.scale(s, 1);
      c.beginPath(); c.moveTo(70, -256); c.lineTo(126, -256); c.quadraticCurveTo(122, -150, 128, -20); c.lineTo(108, -20); c.quadraticCurveTo(84, -110, 104, -132); c.quadraticCurveTo(72, -170, 70, -256); c.closePath();
      fs(c, lg(c, 70, 0, 128, 0, curtainDark, curtain, curtain, curtainDark), rgba('#3a2618', 0.7), 1.8);
      fabricFolds(c, 76, -252, 122, -136, 4, curtainDark, 0.5);
      rrect(c, 92, -142, 30, 10, 4); fs(c, '#e9c45c', '#8a6a22', 1.2);
      c.restore();
    }
    rrect(c, -132, -266, 264, 12, 6); fs(c, lg(c, 0, -266, 0, -254, WD[4], WD[2]), OUT, 1.6); ell(c, -134, -260, 8, 8, WD[3]); ell(c, 134, -260, 8, 8, WD[3]);
  });
}

// ---------- dining corner and hall
function mkTable() {
  return piece(300, 200, (c) => {
    floorShadow(c, 300);
    for (const lx of [-118, 118]) { c.beginPath(); c.moveTo(lx - 9, -132); c.lineTo(lx + 9, -132); c.quadraticCurveTo(lx + 4, -70, lx + 8, -40); c.quadraticCurveTo(lx + 2, -20, lx + 5, 0); c.lineTo(lx - 5, 0); c.quadraticCurveTo(lx - 2, -20, lx - 8, -40); c.quadraticCurveTo(lx - 4, -70, lx - 9, -132); c.closePath(); fs(c, lg(c, lx - 9, 0, lx + 9, 0, WD[1], WD[3]), OUT, 1.8); }
    plankRect(c, -154, -150, 308, 18, 4);
    // tablecloth runner hanging over the front
    c.beginPath(); c.moveTo(-70, -150); c.lineTo(70, -150); c.lineTo(76, -96); c.lineTo(52, -104); c.lineTo(28, -96); c.lineTo(4, -104); c.lineTo(-20, -96); c.lineTo(-44, -104); c.lineTo(-76, -96); c.closePath();
    fs(c, lg(c, 0, -150, 0, -96, '#fbf3e0', '#e8dcc0'), '#b9a882', 1.4);
    c.strokeStyle = '#c9503f'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-72, -112); c.lineTo(72, -112); c.stroke();
    // teapot and cups
    c.beginPath(); c.ellipse(-104, -172, 22, 20, 0, 0, TAU); fs(c, lg(c, -126, 0, -82, 0, '#5a8fb0', '#8fc0dc'), '#2f5a74', 1.8);
    c.strokeStyle = '#2f5a74'; c.lineWidth = 4; c.beginPath(); c.moveTo(-84, -176); c.lineTo(-70, -188); c.moveTo(-126, -178); c.quadraticCurveTo(-138, -172, -124, -160); c.stroke(); ell(c, -104, -194, 8, 4, '#2f5a74');
    for (const cx of [100, 128]) { rrect(c, cx - 10, -168, 20, 16, [2, 2, 7, 7]); fs(c, '#fbf6ea', '#8a7a5a', 1.3); ell(c, cx, -150, 16, 3, '#e9e1d0'); }
  });
}
function mkMap() {
  // the treasure map lying open on the table, tipped toward the viewer
  return piece(130, 40, (c) => {
    c.beginPath(); c.moveTo(-58, -4); c.lineTo(52, -4); c.lineTo(62, -30); c.lineTo(-48, -30); c.closePath(); fs(c, lg(c, 0, -30, 0, -4, '#f3dfae', '#d9bb7c'), '#8a6a3a', 1.6);
    c.strokeStyle = '#8a5a2a'; c.setLineDash([3, 3]); c.lineWidth = 1.6; c.beginPath(); c.moveTo(-40, -10); c.quadraticCurveTo(-10, -26, 12, -14); c.quadraticCurveTo(30, -8, 40, -22); c.stroke(); c.setLineDash([]);
    c.strokeStyle = '#c9302a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(36, -26); c.lineTo(44, -18); c.moveTo(44, -26); c.lineTo(36, -18); c.stroke();
    starMotif(c, -30, -22, '#4f7f3f', 4); starMotif(c, -10, -12, '#4f7f3f', 3.5);
    c.beginPath(); c.ellipse(-58, -17, 6, 14, 0, 0, TAU); fs(c, '#e8cf98', '#8a6a3a', 1.4); c.beginPath(); c.ellipse(62, -17, 6, 14, 0, 0, TAU); fs(c, '#e8cf98', '#8a6a3a', 1.4);
  }, 14);
}
function mkChair() {
  return piece(90, 200, (c) => {
    floorShadow(c, 80);
    for (const lx of [-34, 30]) { rrect(c, lx - 4, -92, 8, 92, 3); fs(c, lg(c, lx - 4, 0, lx + 4, 0, WD[1], WD[3]), OUT, 1.4); }
    rrect(c, -40, -200, 10, 112, 3); fs(c, lg(c, -40, 0, -30, 0, WD[2], WD[4]), OUT, 1.6);
    for (const sy of [-188, -164, -140]) { rrect(c, -36, sy, 16, 10, 3); fs(c, WD[3], OUT, 1.3); }
    plankRect(c, -44, -100, 88, 12, 4);
    rrect(c, -38, -112, 74, 12, 6); fs(c, lg(c, 0, -112, 0, -100, '#d86b52', '#b5503c'), '#6a2a1e', 1.4);
  });
}
function mkFrontDoor() {
  // the door leaf only; it swings open in the game. Door opening: x -75..75, y -290..0.
  return piece(150, 290, (c) => {
    rrect(c, -75, -290, 150, 290, 4); fs(c, lg(c, -75, 0, 75, 0, '#2f6660', '#3f8079', '#4f948c'), '#1f3f3b', 2.5);
    for (const [px, py, pw, ph] of [[-58, -270, 50, 100], [8, -270, 50, 100], [-58, -150, 50, 130], [8, -150, 50, 130]]) {
      rrect(c, px, py, pw, ph, 4); fs(c, lg(c, px, 0, px + pw, 0, '#2a5c56', '#3a7871'), '#1f3f3b', 1.6);
      c.strokeStyle = 'rgba(190,240,225,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(px + pw - 2, py + 3); c.lineTo(px + pw - 2, py + ph - 3); c.stroke();
    }
    c.beginPath(); circ(c, 0, -236, 16); fs(c, 'rgba(200,230,240,.75)', '#c99a3c', 4);
    rrect(c, -22, -176, 44, 8, 2); fs(c, '#d9b55c', '#7a5f24', 1.3);
    rrect(c, 46, -150, 18, 44, 6); fs(c, lg(c, 46, 0, 64, 0, '#e9c45c', '#a8822e'), '#6a4f14', 1.2); knob(c, 55, -138, 7); c.fillStyle = '#2a1e10'; c.beginPath(); c.arc(55, -118, 3, 0, TAU); c.fill(); c.fillRect(54, -118, 2, 7);
  });
}
function mkDoorFrame() {
  return piece(220, 340, (c) => {
    // fanlight above the door (see-through; the game paints the outside behind it)
    c.beginPath(); c.moveTo(-76, -292); c.lineTo(-76, -312); c.arc(0, -312, 76, Math.PI, 0); c.lineTo(76, -292); c.closePath(); c.fillStyle = 'rgba(225,240,255,.15)'; c.fill();
    c.strokeStyle = '#f2ead7'; c.lineWidth = 3.5; c.beginPath(); for (let i = 1; i < 6; i++) { const a = Math.PI + i * Math.PI / 6; c.moveTo(0, -300); c.lineTo(Math.cos(a) * 76, -312 + Math.sin(a) * 76); } c.stroke();
    c.lineWidth = 16; c.strokeStyle = OUT; c.beginPath(); c.moveTo(-86, 0); c.lineTo(-86, -312); c.arc(0, -312, 86, Math.PI, 0); c.lineTo(86, 0); c.stroke();
    c.lineWidth = 11; c.strokeStyle = '#f2ead7'; c.stroke();
    c.strokeStyle = OUT; c.lineWidth = 10; c.beginPath(); c.moveTo(-82, -294); c.lineTo(82, -294); c.stroke(); c.strokeStyle = '#f2ead7'; c.lineWidth = 6; c.stroke();
    rrect(c, -16, -414, 32, 22, 4); fs(c, '#f2ead7', OUT, 1.6);
  });
}
function mkDoorMat() { return piece(170, 14, (c) => { c.beginPath(); c.ellipse(0, -5, 84, 9, 0, 0, TAU); fs(c, lg(c, -84, 0, 84, 0, '#8a6a3a', '#c4a46a', '#8a6a3a'), '#5a4424', 1.4); c.fillStyle = '#5a4424'; c.font = 'italic 700 10px Georgia, serif'; c.textAlign = 'center'; c.fillText('welcome', 0, -2); }, 12); }
function mkCoatRack() {
  return piece(120, 330, (c) => {
    floorShadow(c, 90);
    c.beginPath(); c.moveTo(-40, 0); c.quadraticCurveTo(-10, -16, 0, -40); c.quadraticCurveTo(10, -16, 40, 0); fs(c, WD[2], OUT, 1.6);
    rrect(c, -6, -320, 12, 290, 4); fs(c, lg(c, -6, 0, 6, 0, WD[2], WD[4]), OUT, 1.6); ell(c, 0, -322, 9, 9, WD[3]);
    for (const [hx, hy] of [[-26, -300], [26, -296], [-24, -260], [24, -262]]) { c.strokeStyle = WD[1]; c.lineWidth = 4; c.beginPath(); c.moveTo(0, hy + 6); c.quadraticCurveTo(hx * 0.6, hy, hx, hy - 8); c.stroke(); }
    // a striped scarf and a straw hat
    c.beginPath(); c.moveTo(-24, -262); c.quadraticCurveTo(-40, -200, -30, -150); c.lineTo(-16, -150); c.quadraticCurveTo(-22, -210, -12, -258); c.closePath(); fs(c, '#d9a03a', '#7a5214', 1.4);
    c.strokeStyle = '#b5503c'; c.lineWidth = 3; for (let y = -240; y < -160; y += 16) { c.beginPath(); c.moveTo(-34, y + 6); c.lineTo(-16, y); c.stroke(); }
    c.beginPath(); c.ellipse(26, -292, 34, 8, 0.1, 0, TAU); fs(c, '#e8cf8a', '#8a6a2a', 1.4); c.beginPath(); c.ellipse(26, -300, 18, 14, 0.1, Math.PI, 0); fs(c, '#e8cf8a', '#8a6a2a', 1.4); c.fillStyle = '#c9503f'; c.fillRect(8, -302, 36, 5);
    // yellow umbrella leaning
    c.save(); c.translate(40, 0); c.rotate(-0.12); c.strokeStyle = '#3a2a22'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -4); c.lineTo(0, -150); c.stroke(); c.beginPath(); c.arc(-6, -4, 6, 0, Math.PI); c.stroke();
    c.beginPath(); c.moveTo(0, -150); c.quadraticCurveTo(14, -110, 8, -60); c.lineTo(-8, -60); c.quadraticCurveTo(-14, -110, 0, -150); fs(c, lg(c, -14, 0, 14, 0, '#d9a62a', '#f4cf5a'), '#7a5a14', 1.4); c.restore();
  });
}
function mkPlant() {
  return piece(140, 220, (c) => {
    floorShadow(c, 90);
    for (let i = 0; i < 7; i++) {
      const a = -1.2 + i * 0.4 + rr(-0.1, 0.1), len = rr(110, 160);
      c.save(); c.translate(0, -62); c.rotate(a);
      c.strokeStyle = '#3f6e39'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -len * 0.55); c.stroke();
      c.translate(0, -len * 0.5); c.fillStyle = i % 2 ? '#3f7a3c' : '#559a48'; leafPath(c, len * 0.55, len * 0.2); c.fill();
      c.strokeStyle = 'rgba(20,50,20,.45)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -len * 0.5); for (let k = 0.15; k < 0.9; k += 0.18) { c.moveTo(0, -len * 0.55 * k); c.lineTo(len * 0.12, -len * 0.55 * (k + 0.1)); c.moveTo(0, -len * 0.55 * k); c.lineTo(-len * 0.12, -len * 0.55 * (k + 0.1)); } c.stroke();
      c.restore();
    }
    c.beginPath(); c.moveTo(-36, -70); c.lineTo(36, -70); c.lineTo(28, 0); c.lineTo(-28, 0); c.closePath(); fs(c, lg(c, -36, 0, 36, 0, '#a5543c', '#d98a5f', '#b8643f'), '#5a2a1a', 2);
    rrect(c, -40, -76, 80, 12, 4); fs(c, '#c87650', '#5a2a1a', 1.6);
  });
}
function mkFramedPicture(w, h, paint) {
  return piece(w, h, (c) => {
    rrect(c, -w / 2, -h, w, h, 3); fs(c, lg(c, -w / 2, -h, w / 2, 0, '#e2bf6a', '#a8822e', '#e9c45c'), '#5a4214', 2);
    c.save(); rrect(c, -w / 2 + 12, -h + 12, w - 24, h - 24, 2); c.clip(); paint(c, -w / 2 + 12, -h + 12, w - 24, h - 24); c.restore();
    c.strokeStyle = '#7a5f24'; c.lineWidth = 1.5; c.strokeRect(-w / 2 + 12, -h + 12, w - 24, h - 24);
    c.strokeStyle = 'rgba(80,60,40,.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-w * 0.25, -h); c.lineTo(0, -h - 22); c.lineTo(w * 0.25, -h); c.stroke(); ell(c, 0, -h - 22, 3, 3, '#8a7a5a');
  }, 30);
}
const mkFamilyPortrait = () => mkFramedPicture(160, 120, (c, x, y, w, h) => {
  c.fillStyle = lg(c, 0, y, 0, y + h, '#f4e3b8', '#e8cf98'); c.fillRect(x, y, w, h);
  const person = (px, top, r, body, hair, hat) => { rrect(c, px - r * 1.1, top + r * 1.6, r * 2.2, h, r); c.fillStyle = body; c.fill(); ell(c, px, top + r, r, r, '#f6cba3'); c.fillStyle = hair; c.beginPath(); c.arc(px, top + r * 0.8, r * 1.02, Math.PI, 0); c.fill(); if (hat) { c.fillStyle = hat; c.beginPath(); c.ellipse(px, top + r * 0.3, r * 1.1, r * 0.6, 0, Math.PI, 0); c.fill(); c.fillRect(px, top + r * 0.2, r * 1.5, r * 0.3); } ell(c, px - r * 0.35, top + r * 1.05, 1.4, 1.6, '#2a1810'); ell(c, px + r * 0.35, top + r * 1.05, 1.4, 1.6, '#2a1810'); };
  person(x + w * 0.2, y + 8, 13, '#8a4a6a', '#7a4a2c'); person(x + w * 0.8, y + 4, 14, '#3f5a7a', '#3a2a1e');
  person(x + w * 0.4, y + 28, 10, '#7f8c4f', '#7f8c4f'); person(x + w * 0.62, y + 34, 9, '#4b78a0', '#6b4026', '#34587a');
});
const mkForestPainting = () => mkFramedPicture(200, 130, (c, x, y, w, h) => {
  c.fillStyle = lg(c, 0, y, 0, y + h, '#f3e1b0', '#fbf0d4'); c.fillRect(x, y, w, h); ell(c, x + w * 0.75, y + 24, 14, 14, '#fff3c4');
  c.fillStyle = '#d9b9b4'; c.beginPath(); c.moveTo(x, y + h * 0.7); c.lineTo(x + w * 0.3, y + h * 0.25); c.lineTo(x + w * 0.55, y + h * 0.6); c.lineTo(x + w * 0.75, y + h * 0.35); c.lineTo(x + w, y + h * 0.65); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.fill();
  c.fillStyle = '#8fb26a'; c.fillRect(x, y + h * 0.72, w, h); for (let i = 0; i < 9; i++) { const tx = x + 8 + i * w / 9, th = rr(26, 44); c.fillStyle = pick(['#4f7f5a', '#5f8f62', '#3f6f4f']); c.beginPath(); c.moveTo(tx - 9, y + h * 0.78); c.lineTo(tx, y + h * 0.78 - th); c.lineTo(tx + 9, y + h * 0.78); c.fill(); }
});
const mkWorldMap = () => mkFramedPicture(210, 140, (c, x, y, w, h) => {
  c.fillStyle = lg(c, 0, y, 0, y + h, '#e9d39a', '#d6b877'); c.fillRect(x, y, w, h);
  c.fillStyle = '#a6c08a'; for (const [cx, cy, rx, ry] of [[0.25, 0.4, 0.16, 0.22], [0.55, 0.35, 0.12, 0.18], [0.75, 0.6, 0.14, 0.16], [0.4, 0.75, 0.08, 0.1]]) { c.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; c.lineTo(x + w * (cx + Math.cos(a) * rx * rr(0.7, 1.1)), y + h * (cy + Math.sin(a) * ry * rr(0.7, 1.1))); } c.closePath(); c.fill(); c.strokeStyle = '#7a8a5a'; c.lineWidth = 1; c.stroke(); }
  c.strokeStyle = 'rgba(120,90,50,.35)'; c.lineWidth = 0.8; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(x + w * i / 6, y); c.lineTo(x + w * i / 6, y + h); c.stroke(); }
  starMotif(c, x + w * 0.88, y + h * 0.2, '#8a5a2a', 9);
});

// ---------- stairs and the cupboard under them
// Stairs: (0, 0) is the foot of the first step. They rise 460 over a run of 440, to the right.
const STAIR = { run: 440, rise: 460, steps: 11 };
function mkStairs() {
  return sprite(520, 720, 40, 680, (c) => {
    const n = STAIR.steps, run = STAIR.run / n, rise = STAIR.rise / n;
    // handrail and balusters (behind the steps)
    c.strokeStyle = WD[1]; c.lineWidth = 5;
    for (let i = 0; i < n; i++) { const x = i * run + run * 0.5, y = -(i + 1) * rise; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 168); c.stroke(); c.strokeStyle = WD[3]; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 1.5, y); c.lineTo(x - 1.5, y - 168); c.stroke(); c.strokeStyle = WD[1]; c.lineWidth = 5; }
    c.lineCap = 'round'; c.lineWidth = 14; c.strokeStyle = OUT; c.beginPath(); c.moveTo(-6, -190); c.lineTo(STAIR.run + 10, -STAIR.rise - 182); c.stroke(); c.lineWidth = 10; c.strokeStyle = WD[3]; c.stroke();
    c.lineWidth = 3; c.strokeStyle = WD[4]; c.beginPath(); c.moveTo(-4, -194); c.lineTo(STAIR.run + 8, -STAIR.rise - 186); c.stroke();
    rrect(c, -14, -210, 22, 210, 4); fs(c, lg(c, -14, 0, 8, 0, WD[2], WD[4]), OUT, 2); ell(c, -3, -214, 13, 8, WD[3]); c.beginPath(); circ(c, -3, -222, 9); fs(c, WD[4], OUT, 1.6);
    // stringer and steps
    c.beginPath(); c.moveTo(0, 0); for (let i = 0; i < n; i++) { c.lineTo(i * run, -(i + 1) * rise); c.lineTo((i + 1) * run, -(i + 1) * rise); }
    c.lineTo(STAIR.run, -STAIR.rise + 40); c.lineTo(38, 0); c.closePath(); fs(c, lg(c, 0, 0, STAIR.run, -STAIR.rise, WD[1], WD[2]), OUT, 2.2);
    for (let i = 0; i < n; i++) {
      const x = i * run, y = -(i + 1) * rise;
      rrect(c, x, y + 4, run, rise - 4, 2); fs(c, lg(c, 0, y, 0, y + rise, WD[2], WD[1]), OUT, 1.3);
      rrect(c, x - 3, y - 2, run + 6, 9, 3); fs(c, lg(c, 0, y - 2, 0, y + 7, WD[4], WD[3]), OUT, 1.6);
      c.fillStyle = 'rgba(160,50,40,.85)'; c.fillRect(x + 4, y - 3, run - 2, 4); // stair runner
    }
    c.strokeStyle = rgba(WD[4], 0.6); c.lineWidth = 3; c.beginPath(); c.moveTo(44, -4); c.lineTo(STAIR.run, -STAIR.rise + 44); c.stroke();
  });
}
// The cupboard fills the space under the high end of the stairs. (0, 0) is its bottom-left corner.
// Its outline: (0,0) (0,-148) (260,-420) (260,0). Small door: x 120..210, y -196..0.
const CUP = { w: 260, hL: 148, hR: 420, door: [120, 210, 196] };
function cupboardShape(c) { c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -CUP.hL); c.lineTo(CUP.w, -CUP.hR); c.lineTo(CUP.w, 0); c.closePath(); }
function cupboardDoorPath(c) { const [x0, x1, h] = CUP.door, r = (x1 - x0) / 2; c.beginPath(); c.moveTo(x0, 0); c.lineTo(x0, -h + r); c.arc(x0 + r, -h + r, r, Math.PI, 0); c.lineTo(x1, 0); c.closePath(); }
function mkCupboardPanel() {
  return sprite(300, 460, 20, 440, (c) => {
    c.save(); cupboardShape(c); c.clip();
    for (let x = 0; x < CUP.w; x += 26) { rrect(c, x, -CUP.hR, 26, CUP.hR, 1); fs(c, lg(c, x, 0, x + 26, 0, WD[3], WD[4], WD[3]), rgba(OUT, 0.8), 1.4); vgrain(c, x, -CUP.hR, 26, CUP.hR, 4); }
    c.fillStyle = lg(c, 0, -CUP.hR, 0, 0, 'rgba(40,25,15,.35)', 'rgba(40,25,15,0)'); c.fillRect(0, -CUP.hR, CUP.w, CUP.hR * 0.5);
    c.restore(); cupboardShape(c); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
    rrect(c, -4, -10, CUP.w + 8, 12, 2); fs(c, WD[2], OUT, 1.6);
    // the little door
    cupboardDoorPath(c); fs(c, lg(c, CUP.door[0], 0, CUP.door[1], 0, WD[2], WD[3]), OUT, 2.4);
    c.save(); cupboardDoorPath(c); c.clip(); c.strokeStyle = rgba(OUT, 0.55); c.lineWidth = 1.6; for (let x = CUP.door[0] + 22; x < CUP.door[1]; x += 22) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, -CUP.door[2]); c.stroke(); } c.restore();
    for (const hy of [-160, -40]) { rrect(c, CUP.door[0] - 2, hy, 26, 8, 2); fs(c, '#3a3633', '#1c1a18', 1); }
    knob(c, CUP.door[1] - 16, -96, 5.5);
    // a little painted sign
    c.save(); c.translate((CUP.door[0] + CUP.door[1]) / 2, -150); c.rotate(-0.05); rrect(c, -28, -10, 56, 20, 4); fs(c, '#f2ead7', OUT, 1.4); c.fillStyle = '#5a3a24'; c.font = 'italic 700 11px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('brooms', 0, 1); c.restore();
  });
}
function mkCupboardInside() {
  return sprite(300, 460, 20, 440, (c) => {
    c.save(); cupboardShape(c); c.clip();
    c.fillStyle = lg(c, 0, 0, CUP.w, 0, '#2a1d14', '#3b2a1e', '#2a1d14'); c.fillRect(0, -CUP.hR, CUP.w, CUP.hR);
    for (let x = 0; x < CUP.w; x += 30) { c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, -CUP.hR); c.stroke(); vgrain(c, x, -CUP.hR, 30, CUP.hR, 3, '#1a110b'); }
    // underside of the steps
    c.strokeStyle = '#1a110b'; c.lineWidth = 6; for (let i = 0; i < 7; i++) { const x = i * 40 + 10; c.beginPath(); c.moveTo(x, -CUP.hL - x * 1.045 + 2); c.lineTo(x, -CUP.hL - x * 1.045 + 16); c.stroke(); }
    // floor
    c.fillStyle = '#3a2a1e'; c.fillRect(0, -10, CUP.w, 10);
    // shelf with paint tins
    plankRect(c, 160, -262, 100, 10, 2, true, 2);
    for (const [tx, col] of [[170, '#5a7a9a'], [200, '#9a5a4a'], [230, '#c9a43a']]) { rrect(c, tx, -298, 24, 36, 3); fs(c, lg(c, tx, 0, tx + 24, 0, '#6a6460', '#a8a29c'), '#2a2622', 1.2); c.fillStyle = col; c.fillRect(tx + 2, -288, 20, 14); }
    // broom, mop and bucket
    c.save(); c.translate(236, -4); c.rotate(-0.16); c.fillStyle = WD[3]; c.fillRect(-3, -250, 6, 220); c.beginPath(); c.moveTo(-18, 0); c.lineTo(18, 0); c.lineTo(10, -40); c.lineTo(-10, -40); c.closePath(); fs(c, '#c9a45a', '#6a4f24', 1.4);
    c.strokeStyle = '#8a6a2a'; c.lineWidth = 1; for (let i = -14; i <= 14; i += 4) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i * 0.6, -36); c.stroke(); } c.restore();
    rrect(c, 120, -60, 52, 56, [4, 4, 8, 8]); fs(c, lg(c, 120, 0, 172, 0, '#5f7f8f', '#9fbfcf'), '#2a3a42', 1.6); c.beginPath(); c.arc(146, -60, 24, Math.PI, 0); c.strokeStyle = '#2a3a42'; c.lineWidth = 2; c.stroke();
    // old cardboard box
    rrect(c, 34, -64, 70, 60, 2); fs(c, lg(c, 34, 0, 104, 0, '#a07a4a', '#c49a64'), '#5a4024', 1.6); c.fillStyle = '#d9c9a4'; c.fillRect(56, -64, 26, 60);
    // cobweb in the low corner
    c.strokeStyle = 'rgba(230,230,230,.35)'; c.lineWidth = 1; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(4, -CUP.hL + 4); c.lineTo(4 + 40 * Math.cos(i * 0.35 - 0.2), -CUP.hL + 4 + 40 * Math.sin(i * 0.35 + 0.5)); c.stroke(); } for (let r = 12; r < 40; r += 10) { c.beginPath(); c.arc(4, -CUP.hL + 4, r, -0.2, 1.3); c.stroke(); }
    c.restore();
    cupboardShape(c); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
    // the little door, swung open (seen edge-on at the right of its opening)
    rrect(c, CUP.door[1] - 2, -CUP.door[2] + 4, 16, CUP.door[2] - 4, 3); fs(c, lg(c, CUP.door[1], 0, CUP.door[1] + 16, 0, WD[2], WD[3]), OUT, 2);
  });
}
function mkRailing() {
  return piece(390, 110, (c) => {
    for (let x = -186; x <= 186; x += 24) { rrect(c, x - 3, -96, 6, 96, 2); fs(c, lg(c, x - 3, 0, x + 3, 0, WD[1], WD[3]), OUT, 1.2); }
    for (const px of [-195, 195]) { rrect(c, px - 9, -112, 18, 112, 3); fs(c, lg(c, px - 9, 0, px + 9, 0, WD[2], WD[4]), OUT, 1.6); c.beginPath(); circ(c, px, -118, 9); fs(c, WD[3], OUT, 1.4); }
    plankRect(c, -200, -106, 400, 12, 5);
  });
}

// ---------- the kids' bedroom
function mkBed(quilt, quiltDark, headLeft, deco) {
  return piece(260, 170, (c) => {
    floorShadow(c, 260); const s = headLeft ? 1 : -1;
    c.save(); c.scale(s, 1);
    rrect(c, -132, -168, 22, 168, [8, 8, 2, 2]); fs(c, lg(c, -132, 0, -110, 0, WD[2], WD[4]), OUT, 2); c.beginPath(); circ(c, -121, -172, 10); fs(c, WD[3], OUT, 1.6);
    rrect(c, 108, -110, 22, 110, [6, 6, 2, 2]); fs(c, lg(c, 108, 0, 130, 0, WD[2], WD[4]), OUT, 2); c.beginPath(); circ(c, 119, -114, 9); fs(c, WD[3], OUT, 1.6);
    plankRect(c, -114, -62, 226, 22, 3);
    rrect(c, -112, -96, 222, 36, 10); fs(c, '#f4efe4', '#9a9080', 1.6);
    rrect(c, -106, -122, 66, 34, 14); fs(c, lg(c, 0, -122, 0, -88, '#ffffff', '#e6e0d2'), '#9a9080', 1.6);
    // quilt draped over the front
    c.beginPath(); c.moveTo(-40, -98); c.quadraticCurveTo(30, -110, 112, -96); c.lineTo(116, -30); c.quadraticCurveTo(40, -22, -36, -30); c.closePath(); fs(c, lg(c, 0, -110, 0, -24, quilt, quiltDark), rgba('#2a1e14', 0.8), 2);
    fabricFolds(c, -30, -100, 110, -28, 5, quiltDark, 0.6);
    c.restore();
    deco(c, s);
  });
}
const mkBedSister = () => mkBed('#8fae6a', '#5f8445', true, (c, s) => {
  for (let i = 0; i < 6; i++) { c.save(); c.translate(s * (-10 + i * 22), -70 + (i % 2) * 18); c.rotate(i * 0.7); c.fillStyle = '#d9e8b8'; leafPath(c, 13, 4.5); c.fill(); c.restore(); }
  // plush fox
  c.save(); c.translate(s * -64, -112); c.beginPath(); c.ellipse(0, 6, 15, 12, 0, 0, TAU); fs(c, '#e08a3a', '#7a3e14', 1.4); c.beginPath(); circ(c, 0, -10, 11); fs(c, '#e8964a', '#7a3e14', 1.4);
  for (const ex of [-7, 7]) { c.beginPath(); c.moveTo(ex - 5, -16); c.lineTo(ex, -28); c.lineTo(ex + 5, -16); c.closePath(); fs(c, '#e8964a', '#7a3e14', 1.2); } ell(c, 0, -5, 6, 4, '#fbf0dc'); ell(c, -4, -11, 1.6, 1.8, '#2a1810'); ell(c, 4, -11, 1.6, 1.8, '#2a1810'); c.restore();
});
const mkBedBrother = () => mkBed('#5d89ad', '#3f6585', false, (c, s) => {
  for (let i = 0; i < 6; i++) starMotif(c, s * (-10 + i * 22) * -1 + 0, -68 + (i % 2) * 18, '#f6e2a0', 6);
  // teddy bear
  c.save(); c.translate(s * -64, -112); c.beginPath(); c.ellipse(0, 6, 15, 13, 0, 0, TAU); fs(c, '#a8784a', '#5a3a1e', 1.4); c.beginPath(); circ(c, 0, -11, 11); fs(c, '#b5845a', '#5a3a1e', 1.4);
  for (const ex of [-9, 9]) { c.beginPath(); circ(c, ex, -20, 5); fs(c, '#b5845a', '#5a3a1e', 1.2); } ell(c, 0, -7, 5, 4, '#e8d0a8'); ell(c, -4, -13, 1.6, 1.8, '#2a1810'); ell(c, 4, -13, 1.6, 1.8, '#2a1810'); ell(c, 0, -8, 1.8, 1.4, '#2a1810');
  c.fillStyle = '#c9473c'; c.fillRect(-8, -2, 16, 4); c.restore();
});
function mkToyChest() {
  return piece(160, 140, (c) => {
    floorShadow(c, 150);
    // toys peeking out
    c.save(); c.translate(36, -96); c.rotate(0.5); rrect(c, -4, -60, 8, 70, 2); fs(c, '#c9d0d4', '#5a6468', 1.3); rrect(c, -14, 4, 28, 6, 2); fs(c, '#c99a3c', '#6a4f14', 1.2); c.restore();
    c.beginPath(); circ(c, -36, -100, 18); fs(c, '#d8443c', '#7a2420', 1.6); c.save(); c.beginPath(); circ(c, -36, -100, 18); c.clip(); c.fillStyle = '#ffffff'; c.fillRect(-60, -104, 50, 8); c.restore(); ell(c, -42, -108, 4, 3, '#ffffff', 0.6);
    c.strokeStyle = '#3a2a22'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -94); c.lineTo(4, -132); c.stroke(); c.beginPath(); c.moveTo(4, -130); c.lineTo(26, -112); c.lineTo(4, -106); c.closePath(); fs(c, '#f4f0e4', '#5a4a3a', 1.2);
    plankRect(c, -78, -96, 156, 96, 6, false, 0);
    for (const bx of [-78, 66]) { rrect(c, bx, -96, 12, 96, 2); fs(c, '#8a6a3a', OUT, 1.4); }
    rrect(c, -78, -60, 156, 10, 2); fs(c, '#8a6a3a', OUT, 1.4);
    c.fillStyle = '#c9503f'; c.beginPath(); c.moveTo(0, -36); c.bezierCurveTo(-10, -46, -16, -34, 0, -22); c.bezierCurveTo(16, -34, 10, -46, 0, -36); c.fill();
    rrect(c, -82, -104, 164, 14, 6); fs(c, lg(c, 0, -104, 0, -90, WD[4], WD[3]), OUT, 1.8);
  });
}
function mkKidShelf() {
  return piece(220, 130, (c) => {
    for (const bx of [-90, 90]) { c.beginPath(); c.moveTo(bx - 6, -14); c.lineTo(bx + 6, -14); c.lineTo(bx + 6, 18); c.closePath(); fs(c, WD[2], OUT, 1.5); }
    books(c, -104, -30, -16, 56);
    // toy rocket
    c.save(); c.translate(0, -16); rrect(c, -9, -64, 18, 52, [9, 9, 2, 2]); fs(c, lg(c, -9, 0, 9, 0, '#e9e4d8', '#ffffff'), '#5a4a3a', 1.4); c.beginPath(); circ(c, 0, -44, 5); fs(c, '#7fc0e0', '#2f5a74', 1.2);
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 9, -26); c.lineTo(s * 18, -6); c.lineTo(s * 9, -12); c.closePath(); fs(c, '#d8443c', '#7a2420', 1.2); } c.restore();
    // jar of marbles
    rrect(c, 30, -60, 34, 44, 8); fs(c, 'rgba(220,240,240,.45)', '#6b7a7d', 1.4); for (let i = 0; i < 9; i++) ell(c, 38 + (i % 3) * 9, -24 - Math.floor(i / 3) * 9, 4.2, 4.2, pick(['#d8443c', '#3e7bbf', '#f2c341', '#5a9a4a', '#9b59b6']));
    // little wooden boat
    c.beginPath(); c.moveTo(70, -30); c.lineTo(106, -30); c.lineTo(98, -16); c.lineTo(78, -16); c.closePath(); fs(c, WD[3], OUT, 1.4); c.strokeStyle = OUT; c.lineWidth = 2; c.beginPath(); c.moveTo(88, -30); c.lineTo(88, -66); c.stroke(); c.beginPath(); c.moveTo(90, -64); c.lineTo(106, -36); c.lineTo(90, -36); c.closePath(); fs(c, '#f4f0e4', '#5a4a3a', 1.2);
    plankRect(c, -110, -18, 220, 12, 3);
  });
}
function mkRug(w, cols) {
  return piece(w, 30, (c) => {
    c.beginPath(); c.ellipse(0, -8, w / 2, 14, 0, 0, TAU); fs(c, cols[0], rgba('#2a1e14', 0.6), 1.6);
    c.beginPath(); c.ellipse(0, -8, w / 2 - 14, 9, 0, 0, TAU); c.strokeStyle = cols[1]; c.lineWidth = 4; c.stroke();
    c.beginPath(); c.ellipse(0, -8, w / 2 - 34, 5, 0, 0, TAU); c.strokeStyle = cols[2]; c.lineWidth = 3; c.stroke();
    c.strokeStyle = cols[1]; c.lineWidth = 1.5; for (const s of [-1, 1]) for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(s * (w / 2 - 2), -8 + i * 3); c.lineTo(s * (w / 2 + 8), -8 + i * 3.4); c.stroke(); }
  }, 16);
}

// ---------- Dad's study
function mkBookcase() {
  return piece(220, 290, (c) => {
    floorShadow(c, 220); const x = -110, y = -290;
    rrect(c, x, y, 220, 290, 3); fs(c, lg(c, x, 0, x + 220, 0, WD[1], WD[2]), OUT, 2.4);
    rrect(c, x + 12, y + 12, 196, 270, 2); c.fillStyle = '#2e1e14'; c.fill();
    const shelves = [y + 12, y + 80, y + 148, y + 216, y + 282];
    for (let i = 0; i < 4; i++) { books(c, x + 16, i === 1 ? x + 150 : x + 204, shelves[i + 1] - 2, 60); }
    // vase and a little brass compass on the second shelf
    c.beginPath(); c.moveTo(x + 162, shelves[2] - 2); c.quadraticCurveTo(x + 152, shelves[2] - 30, x + 166, shelves[2] - 48); c.lineTo(x + 182, shelves[2] - 48); c.quadraticCurveTo(x + 196, shelves[2] - 30, x + 186, shelves[2] - 2); c.closePath(); fs(c, lg(c, x + 152, 0, x + 196, 0, '#2f6a8a', '#6fa8c8'), '#1f3f55', 1.4);
    for (const sy of shelves.slice(1)) { rrect(c, x + 10, sy - 2, 200, 10, 2); fs(c, lg(c, 0, sy - 2, 0, sy + 8, WD[4], WD[2]), OUT, 1.4); }
    rrect(c, x - 8, y - 10, 236, 16, 3); fs(c, lg(c, 0, y - 10, 0, y + 6, WD[4], WD[3]), OUT, 2);
    rrect(c, x - 4, -12, 228, 12, 2); fs(c, WD[2], OUT, 1.6);
  });
}
function mkDesk() {
  return piece(270, 200, (c) => {
    floorShadow(c, 270);
    plankRect(c, -130, -116, 90, 116, 3, false, 0); plankRect(c, 76, -116, 54, 116, 3, false, 1);
    for (const dy of [-104, -66, -28]) { rrect(c, -122, dy, 74, 30, 3); fs(c, lg(c, -122, 0, -48, 0, WD[3], WD[4]), OUT, 1.4); knob(c, -85, dy + 15, 3.6); }
    plankRect(c, -138, -130, 276, 16, 4);
    // green banker's lamp
    rrect(c, 70, -140, 40, 10, 3); fs(c, '#c99a3c', '#6a4f14', 1.3); c.strokeStyle = '#c99a3c'; c.lineWidth = 4; c.beginPath(); c.moveTo(90, -140); c.lineTo(90, -186); c.stroke();
    c.beginPath(); c.moveTo(56, -184); c.quadraticCurveTo(90, -206, 124, -184); c.lineTo(118, -176); c.lineTo(62, -176); c.closePath(); fs(c, lg(c, 0, -204, 0, -176, '#3f8a5a', '#1f5a3a'), '#123a24', 1.6);
    soft(c, 90, -168, 40, 12, '#fff2b0', 0.7);
    // globe
    c.strokeStyle = '#c99a3c'; c.lineWidth = 3; c.beginPath(); c.moveTo(-100, -132); c.lineTo(-100, -148); c.stroke(); rrect(c, -116, -136, 32, 6, 3); fs(c, WD[2], OUT, 1.2);
    c.beginPath(); circ(c, -100, -170, 24); fs(c, rg(c, -108, -178, 30, '#9fd0e8', '#4f8fb8'), '#234a66', 1.6);
    c.fillStyle = '#7fb35c'; c.beginPath(); c.ellipse(-106, -176, 9, 12, 0.4, 0, TAU); c.ellipse(-90, -160, 7, 6, 0, 0, TAU); c.fill();
    c.beginPath(); c.arc(-100, -170, 29, -2.3, 0.9); c.strokeStyle = '#c99a3c'; c.lineWidth = 2.5; c.stroke();
    // papers, inkpot and quill
    c.save(); c.translate(-30, -132); c.rotate(-0.04); rrect(c, -30, -4, 60, 5, 1); fs(c, '#fbf6ea', '#a89a7a', 1); c.restore();
    rrect(c, 20, -146, 18, 16, 4); fs(c, '#2a3a4a', '#121a22', 1.2); c.strokeStyle = '#f4f0e4'; c.lineWidth = 2; c.beginPath(); c.moveTo(30, -146); c.quadraticCurveTo(36, -176, 50, -196); c.stroke(); c.fillStyle = '#f4f0e4'; c.save(); c.translate(44, -186); c.rotate(0.6); leafPath(c, 26, 6); c.fill(); c.restore();
  });
}
function mkArmchair() {
  return piece(180, 180, (c) => {
    floorShadow(c, 170);
    for (const lx of [-70, 66]) { rrect(c, lx - 4, -20, 8, 20, 2); fs(c, WD[1], OUT, 1.2); }
    rrect(c, -82, -176, 164, 120, [40, 40, 10, 10]); fs(c, lg(c, -82, 0, 82, 0, '#a8742e', '#d9a03a', '#c48a2e'), '#5a3a10', 2);
    rrect(c, -64, -96, 128, 46, 12); fs(c, lg(c, 0, -96, 0, -50, '#e2ae4a', '#b8862e'), '#5a3a10', 1.8);
    for (const s of [-1, 1]) { rrect(c, s > 0 ? 50 : -90, -120, 40, 100, 16); fs(c, lg(c, 0, -120, 0, -20, '#d9a03a', '#a8742e'), '#5a3a10', 2); }
    rrect(c, -70, -46, 140, 28, 8); fs(c, '#b8862e', '#5a3a10', 1.8);
    rrect(c, -30, -150, 44, 40, 10); fs(c, '#5d89ad', '#2f506e', 1.4); c.strokeStyle = '#f4f0e4'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-26, -130); c.lineTo(10, -130); c.stroke();
  });
}
function mkFloorLamp() {
  return piece(100, 290, (c) => {
    floorShadow(c, 60); c.beginPath(); c.ellipse(0, -4, 26, 6, 0, 0, TAU); fs(c, '#3a3633', '#1c1a18', 1.2);
    c.strokeStyle = '#3a3633'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -6); c.lineTo(0, -220); c.stroke();
    soft(c, 0, -230, 70, 50, '#fff0b8', 0.6);
    c.beginPath(); c.moveTo(-26, -280); c.lineTo(26, -280); c.lineTo(44, -214); c.lineTo(-44, -214); c.closePath(); fs(c, lg(c, -44, 0, 44, 0, '#e8c98a', '#fbe8b8', '#e0bf7a'), '#8a6a2a', 1.8);
    c.strokeStyle = '#c9503f'; c.lineWidth = 3; c.beginPath(); c.moveTo(-42, -222); c.lineTo(42, -222); c.stroke();
  });
}

// ---------- the list of every house image: group name (used by the game), file name, resolution, how to paint it
function generateHouse() {
  const out = [];
  const make = (group, name, scale, mk) => { GEN_SCALE = scale; out.push({ group, file: `house/${name}.png`, s: mk() }); };
  make('wallKitchen', 'wallpaper-kitchen', 2, wallKitchen); make('wallLiving', 'wallpaper-living', 2, wallLiving);
  make('wallBedroom', 'wallpaper-bedroom', 2, wallBedroom); make('wallStudy', 'wallpaper-study', 2, wallStudy);
  make('floor', 'floorboards', 2, floorTile); make('brick', 'outside-brick', 2, brickTile); make('roof', 'roof-tiles', 2, roofTile); make('stone', 'foundation-stone', 2, stoneTile);
  make('fridge', 'fridge', 2, mkFridge); make('counter', 'kitchen-counter', 2, mkCounter); make('wallShelf', 'kitchen-shelf', 2, mkWallShelf); make('wallClock', 'wall-clock', 2, mkWallClock);
  make('windowKitchen', 'window-kitchen', 2, () => mkWindow('#e9a68a', '#c9785a')); make('windowBedroom', 'window-bedroom', 2, () => mkWindow('#9fc0dc', '#6f94b8'));
  make('windowStudy', 'window-study', 2, () => mkWindow('#c9b06a', '#9a8240'));
  make('table', 'dining-table', 2, mkTable); make('map', 'treasure-map', 3, mkMap); make('chair', 'chair', 2, mkChair);
  make('frontDoor', 'front-door', 2, mkFrontDoor); make('doorFrame', 'front-door-frame', 2, mkDoorFrame); make('doorMat', 'door-mat', 2, mkDoorMat);
  make('coatRack', 'coat-rack', 2, mkCoatRack); make('plant', 'house-plant', 2, mkPlant);
  make('familyPortrait', 'family-portrait', 2, mkFamilyPortrait); make('forestPainting', 'forest-painting', 2, mkForestPainting); make('worldMap', 'world-map', 2, mkWorldMap);
  make('stairs', 'stairs', 2, mkStairs); make('cupboard', 'cupboard-closed', 2, mkCupboardPanel); make('cupboardInside', 'cupboard-inside', 2, mkCupboardInside); make('railing', 'stair-railing', 2, mkRailing);
  make('bedSister', 'bed-sister', 2, mkBedSister); make('bedBrother', 'bed-brother', 2, mkBedBrother); make('toyChest', 'toy-chest', 2, mkToyChest); make('kidShelf', 'kids-shelf', 2, mkKidShelf);
  make('rugBedroom', 'rug-bedroom', 2, () => mkRug(320, ['#e9c46a', '#c9503f', '#5d89ad'])); make('rugHall', 'rug-hall', 2, () => mkRug(420, ['#b5503c', '#e9c46a', '#3f6e5a']));
  make('bookcase', 'tall-bookcase', 2, mkBookcase); make('desk', 'desk', 2, mkDesk); make('armchair', 'armchair', 2, mkArmchair); make('floorLamp', 'floor-lamp', 2, mkFloorLamp);
  return out;
}

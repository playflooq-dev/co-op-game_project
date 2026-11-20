'use strict';
// Chapter Two, "Across the City": the things to play with. This file is loaded just before level.js, which runs the level.
// In here: the little pictures (map stamps and stickers), the boost (she lifts him up), stickers, pigeons, leaves and
// bunting, the puppy, the canal boats, Fountain Square (fountain, bell game), the metro piano, the bus request box,
// the bridge controls, hints, and the treasure map. All the numbers are in settings.js.
const snd = (name, k) => { if (typeof sfx === 'function') sfx(name, k); };
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (u) => u * u * (3 - 2 * u);

// ---------- the little pictures
const ICON_COL = { ticket: '#f6c26a', star: '#f2c94e', bell: '#e2b84a', fish: '#6fa8c9', key: '#d9b55c', moon: '#f4e2a0', apple: '#d9534a', boat: '#b5713c', bird: '#7f9fc4', paw: '#a8683a', sock: '#e8728a', drop: '#6fb3d9', note: '#3a2618', heart: '#e8728a' };
const ICON_NAME = { star: 'a star', bell: 'a bell', fish: 'a fish', key: 'a key', moon: 'a moon', apple: 'an apple', boat: 'a boat', bird: 'a bird' };
function drawIcon(c, name, x, y, s = 1) {
  const col = ICON_COL[name], ink = '#3a2618';
  c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath();
  if (name === 'star') { for (let i = 0; i < 10; i++) { const r = i % 2 ? 6.5 : 15, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); fs(c, col, ink, 2); }
  else if (name === 'bell') { c.moveTo(-13, 8); c.quadraticCurveTo(-9, 4, -9, -3); c.quadraticCurveTo(-9, -14, 0, -14); c.quadraticCurveTo(9, -14, 9, -3); c.quadraticCurveTo(9, 4, 13, 8); c.closePath(); fs(c, col, ink, 2); c.beginPath(); circ(c, 0, 11, 3.2); fs(c, ink); }
  else if (name === 'fish') { c.ellipse(-3, 0, 12, 7.5, 0, 0, TAU); c.moveTo(8, 0); c.lineTo(16, -8); c.lineTo(16, 8); c.closePath(); fs(c, col, ink, 2); ell(c, -9, -2, 1.8, 1.8, ink); }
  else if (name === 'key') { circ(c, -8, 0, 7); c.rect(-1, -2.5, 16, 5); c.rect(8, 2, 3, 6); c.rect(12, 2, 3, 4); fs(c, col, ink, 2); ell(c, -8, 0, 2.6, 2.6, '#fffbf0'); }
  else if (name === 'moon') { c.moveTo(5, -14); c.bezierCurveTo(-17, -13, -17, 13, 5, 14); c.bezierCurveTo(-5, 7, -5, -7, 5, -14); c.closePath(); fs(c, col, ink, 2); }
  else if (name === 'apple') { c.moveTo(0, -7); c.bezierCurveTo(-16, -15, -17, 12, -4, 13); c.quadraticCurveTo(0, 11, 4, 13); c.bezierCurveTo(17, 12, 16, -15, 0, -7); c.closePath(); fs(c, col, ink, 2); c.beginPath(); c.moveTo(0, -7); c.quadraticCurveTo(0, -12, 3, -15); c.strokeStyle = ink; c.lineWidth = 2; c.stroke(); c.beginPath(); c.ellipse(7, -12, 5, 2.6, -0.4, 0, TAU); fs(c, '#6d9b45', ink, 1.4); }
  else if (name === 'boat') { c.moveTo(-15, 3); c.lineTo(15, 3); c.lineTo(9, 12); c.lineTo(-9, 12); c.closePath(); fs(c, col, ink, 2); c.beginPath(); c.moveTo(1, -14); c.lineTo(12, 0); c.lineTo(1, 0); c.closePath(); fs(c, '#fffbf0', ink, 2); c.beginPath(); c.moveTo(-2, -12); c.lineTo(-9, 0); c.lineTo(-2, 0); c.closePath(); fs(c, '#e9c98a', ink, 2); }
  else if (name === 'bird') { c.ellipse(-2, 3, 11, 8, 0, 0, TAU); circ(c, 8, -5, 6); c.moveTo(-11, 2); c.lineTo(-18, -3); c.lineTo(-12, 7); c.closePath(); fs(c, col, ink, 2); c.beginPath(); c.moveTo(13, -6); c.lineTo(19, -4); c.lineTo(13, -2); c.closePath(); fs(c, '#e2a84a', ink, 1.4); ell(c, 9, -6, 1.5, 1.5, ink); }
  else if (name === 'paw') { c.ellipse(0, 5, 9, 7.5, 0, 0, TAU); for (const [px, py] of [[-10, -3], [-4, -10], [4, -10], [10, -3]]) circ(c, px, py, 3.6); fs(c, col, ink, 1.6); }
  else if (name === 'sock') { c.moveTo(-6, -14); c.lineTo(5, -14); c.lineTo(5, 2); c.quadraticCurveTo(14, 5, 12, 11); c.quadraticCurveTo(3, 15, -6, 9); c.closePath(); fs(c, col, ink, 2); c.fillStyle = '#fffbf0'; c.fillRect(-5, -11, 9, 3.5); c.fillRect(-5, -5, 9, 3.5); }
  else if (name === 'drop') { c.moveTo(0, -15); c.bezierCurveTo(11, -2, 12, 7, 0, 13); c.bezierCurveTo(-12, 7, -11, -2, 0, -15); fs(c, col, ink, 2); ell(c, -3, 3, 2.2, 3.6, '#fff', 0.7); }
  else if (name === 'note') { c.ellipse(-4, 9, 6.5, 4.8, -0.35, 0, TAU); fs(c, ink); c.beginPath(); c.moveTo(2, 8); c.lineTo(2, -13); c.quadraticCurveTo(12, -10, 11, -2); c.strokeStyle = ink; c.lineWidth = 3; c.stroke(); }
  else if (name === 'ticket') { c.rect(-17, -10, 34, 20); fs(c, '#f6c26a', ink, 2); c.setLineDash([3, 3]); c.beginPath(); c.moveTo(7, -10); c.lineTo(7, 10); c.strokeStyle = ink; c.lineWidth = 1.5; c.stroke(); c.setLineDash([]); c.fillStyle = ink; c.fillRect(-12, -5, 14, 2.5); c.fillRect(-12, 1, 10, 2.5); }
  else if (name === 'heart') { c.moveTo(0, 12); c.bezierCurveTo(-18, -2, -9, -16, 0, -6); c.bezierCurveTo(9, -16, 18, -2, 0, 12); fs(c, col, ink, 2); }
  c.restore();
}

// ---------- pop-up labels, confetti, water drops and hearts
function pop(x, y, text, icon) { game.pops.push({ x, y, t: 0, text, icon }); }
const PARTY_COLS = ['#d9534a', '#f2c94e', '#6fa8c9', '#6d9b45', '#e8728a', '#fffbf0'];
function party(x0, x1, y, n = 70) { for (let i = 0; i < n; i++) game.bits.push({ kind: 'paper', x: lerp(x0, x1, Math.random()), y: y - Math.random() * 160, vx: (Math.random() - 0.5) * 220, vy: -260 - Math.random() * 320, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12, col: PARTY_COLS[i % PARTY_COLS.length], life: 2.6 + Math.random() * 1.6 }); }
function spray(x, y, n = 14, up = 320, wide = 260) { for (let i = 0; i < n; i++) game.bits.push({ kind: 'drop', x: x + (Math.random() - 0.5) * 30, y, vx: (Math.random() - 0.5) * wide, vy: -up * (0.5 + Math.random() * 0.6), life: 0.9 + Math.random() * 0.4 }); }
function hearts(x, y, n = 4) { for (let i = 0; i < n; i++) game.bits.push({ kind: 'heart', x: x + (Math.random() - 0.5) * 60, y: y - Math.random() * 20, vx: (Math.random() - 0.5) * 30, vy: -70 - Math.random() * 50, life: 1.5 + Math.random() * 0.5, d: i * 0.12 }); }
function notes(x, y, n = 2) { for (let i = 0; i < n; i++) game.bits.push({ kind: 'note', x: x + (Math.random() - 0.5) * 80, y, vx: (Math.random() - 0.5) * 40, vy: -90 - Math.random() * 40, life: 1.4, d: i * 0.15 }); }
function updateFx(dt) {
  for (const p of game.pops) p.t += dt; game.pops = game.pops.filter((p) => p.t < 2.8);
  for (const b of game.bits) {
    if (b.d > 0) { b.d -= dt; continue; }
    b.life -= dt; b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.kind === 'paper') { b.vy += 520 * dt; b.vx *= 1 - dt * 0.8; b.vy = Math.min(b.vy, 190); b.rot += b.vr * dt; }
    else if (b.kind === 'drop') b.vy += 900 * dt;
    else b.x += Math.sin(b.life * 6) * 20 * dt;
  }
  game.bits = game.bits.filter((b) => b.life > 0);
}
function drawFx(c) {
  for (const b of game.bits) {
    if (b.d > 0) continue; const a = Math.min(1, b.life * 2);
    if (b.kind === 'paper') { c.save(); c.translate(b.x, b.y); c.rotate(b.rot); c.globalAlpha = a; c.fillStyle = b.col; c.fillRect(-6, -3.5 * Math.cos(b.rot * 2), 12, 7 * Math.cos(b.rot * 2)); c.restore(); }
    else if (b.kind === 'drop') ell(c, b.x, b.y, 4, 5.5, '#bfe2f2', a * 0.9);
    else { c.save(); c.globalAlpha = a; drawIcon(c, b.kind, b.x, b.y, 0.7 + (1.5 - Math.min(1.5, b.life)) * 0.2); c.restore(); }
  }
  for (const p of game.pops) {
    const a = Math.min(1, p.t * 5, (2.8 - p.t) * 2), y = p.y - 50 - ease(Math.min(1, p.t * 1.6)) * 50;
    c.save(); c.globalAlpha = Math.max(0, a); c.font = 'italic 700 20px Georgia, serif';
    const w = c.measureText(p.text).width + (p.icon ? 70 : 32), x = Math.max(camX + 12, Math.min(camX + VW - w - 12, p.x - w / 2));
    c.fillStyle = 'rgba(40,25,15,.25)'; rrect(c, x + 3, y - 19, w, 44, 12); c.fill();
    rrect(c, x, y - 22, w, 44, 12); fs(c, '#fffbf0', '#8a6a3a', 2.5);
    if (p.icon) drawIcon(c, p.icon, x + 30, y, 0.95);
    c.fillStyle = '#3a2618'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(p.text, x + (p.icon ? 54 : 16), y + 1);
    c.restore();
  }
}

// ---------- stickers: little rewards hidden along the way (the list is STICKERS in settings.js)
const stickerDef = (id) => STICKERS.find((s) => s.id === id);
function giveSticker(id, x, y) {
  if (game.stickers.has(id)) return false;
  const s = stickerDef(id); game.stickers.add(id); pop(x, y, 'Sticker: ' + s.name, s.icon); burst(x, y, 10); snd('sticker');
  if (game.stickers.size === STICKERS.length) { say(bro, 'That is every sticker in the city!'); party(camX + 200, camX + VW - 200, 300, 50); }
  return true;
}
function stickerThings() { // the stickers that wait at a spot for the sibling who can reach them
  return STICKERS.filter((s) => s.x && s.who !== 'boost').map((s) => ({ plane: s.plane, x: s.x, r: 70, key: s.key,
    label: () => (game.stickers.has(s.id) ? null : s.label),
    act: (p) => { if ((s.who === 'sis') !== (p === sis)) { snd('no'); sayNow(p, s.no); return; } p.cheer = 0.6; giveSticker(s.id, s.x, p.y - 200); sayNow(p, pick(['A sticker! For the map.', 'Ooh, a sticker!', 'Look what I found!'])); } }));
}
function drawGlints(c, t, plane) { // a twinkle where a sticker is waiting
  for (const s of STICKERS) {
    if (!s.x || s.plane !== plane || game.stickers.has(s.id) || !inView(s.x - 40, s.x + 40)) continue;
    const u = (t * 0.45 + s.x * 0.013) % 1, k = u < 0.3 ? Math.sin(u / 0.3 * Math.PI) : 0;
    if (k > 0) { star(c, s.x, s.y, 16 * k, t * 2, 0.9 * k); soft(c, s.x, s.y, 26, 26, '#fff3b8', 0.4 * k); }
  }
}
function drawStickerHud(c, x, y) {
  const n = game.stickers.size; c.save(); rrect(c, x, y, 176, 40, 10); fs(c, 'rgba(255,248,230,.94)', '#8a6a3a', 2);
  c.fillStyle = '#8a5a2a'; c.font = 'italic 700 15px Georgia, serif'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText('STICKERS', x + 14, y + 26);
  drawIcon(c, 'star', x + 112, y + 20, 0.62); c.fillStyle = '#3a2618'; c.font = '700 17px Georgia, serif'; c.fillText(n + ' / ' + STICKERS.length, x + 128, y + 26); c.restore();
}

// ---------- the boost: the sister lifts her brother onto her shoulders to reach something too high for both
// A boost spot is { plane, x, done(): true when there is nothing left to get, grab(): what happens at the top }.
function boostThing(b) {
  const near = (q) => q.plane === b.plane && Math.abs(q.x - b.x) < 160;
  return { plane: b.plane, x: b.x, r: 85, key: 'up',
    label: (p) => (b.done() || game.boost ? null : near(other(p)) ? (p === sis ? 'Lift your brother up' : 'Climb on her shoulders') : (p === sis ? 'Reach up' : 'Jump for it')),
    act: (p) => {
      if (near(other(p))) { startBoost(b); return; }
      snd('no'); if (p === sis) { p.reachT = 0.7; sayNow(sis, 'Too high, even for me. If I could lift you up there...'); } else { p.cheer = 0.5; sayNow(bro, 'Way too high! I need a lift, sis!'); }
    } };
}
function startBoost(b) {
  game.boost = { b, t: 0, x0: bro.x, grabbed: false }; sis.x = b.x - 10; sis.dir = 1; bro.dir = 1; snd('hop');
  if (!game.saidBoost) { game.saidBoost = true; sayNow(bro, 'Whoa! Hold me steady!'); say(sis, 'Teamwork! We can reach anything like that.'); }
}
function updateBoost(dt) {
  const B = game.boost; if (!B) return; B.t += dt;
  const base = sis.y, top = base - 172 * sis.scale, t = B.t, sx = sis.x + 4;
  sis.reach = t < 1.45; bro.noShadow = true; bro.dir = 1;
  if (t < 0.5) { const u = ease(t / 0.5); bro.x = lerp(B.x0, sx, u); bro.y = lerp(base, top, u) - Math.sin(u * Math.PI) * 46; }
  else if (t < 1.45) { bro.x = sx + Math.sin(t * 9) * 2.5; bro.y = top + Math.sin(t * 7) * 1.5; bro.reach = t > 0.62; if (!B.grabbed && t > 0.98) { B.grabbed = true; B.b.grab(); } }
  else if (t < 1.95) { const u = ease((t - 1.45) / 0.5); bro.reach = false; bro.x = lerp(sx, sx + 88, u); bro.y = lerp(top, base, u) - Math.sin(u * Math.PI) * 52; }
  else { bro.y = base; bro.noShadow = false; sis.reach = false; bro.reach = false; game.boost = null; snd('hop'); }
}

// ---------- pigeons, leaves and bunting: life along the street
const FLOCKS = PIGEONS.map(([x, n]) => ({ x, away: 0, birds: Array.from({ length: n }, (_, i) => ({ dx: (i - (n - 1) / 2) * 44 + ((i * 37) % 23) - 11, dy: (i * 53) % 26, ph: i * 1.7, side: i % 2 ? 1 : -1, fx: 0.6 + ((i * 29) % 10) / 10 })) }));
function updatePigeons(dt) {
  for (const f of FLOCKS) {
    if (f.away > 0) { f.away -= dt; continue; }
    if (players.some((p) => p.plane === 'street' && Math.abs(p.x - f.x) < 170 && p.m > 0.5)) {
      f.away = 9; snd('flap');
      if (!game.saidPigeons) { game.saidPigeons = true; say(bro, 'Shoo, pigeons! Ha ha!'); say(sis, 'Leave them be. They live here too.'); }
    }
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
function drawLeaves(c, t) { // a few leaves drifting by on the breeze
  for (const l of LEAVES) {
    const span = VW + 200, x = camX + VW + 100 - ((l.sx * span + t * l.sp * 2.2) % span), y = 180 + ((l.ph * 97 + t * l.sp) % 760), sway = Math.sin(t * 1.3 + l.ph) * 30;
    c.save(); c.translate(x + sway, y); c.rotate(t * 1.1 + l.ph + sway * 0.03); c.scale(l.s, l.s * (0.5 + Math.abs(Math.cos(t * 1.7 + l.ph)) * 0.5)); c.globalAlpha = 0.75;
    leafPath(c, 16, 6); fs(c, l.col, 'rgba(90,50,20,.5)', 1); c.restore();
  }
}
const FLAG_COLS = ['#d9534a', '#f2c94e', '#6fa8c9', '#fffbf0', '#6d9b45', '#e8728a'];
function drawBunting(c) { // painted once into the street picture
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

// ---------- the flour mill yard: the chain that locks the shutter open, and the odd sock on the washing line
function chainPull(p) {
  if (game.shutterLocked) return;
  if (p === bro) { snd('no'); p.cheer = 0.5; sayNow(bro, "A chain to hold the shutter up! ...I can't reach it."); if (sis.plane === 'street') say(sis, 'Then I should go in first. Come out and hold the button for me!'); return; }
  game.shutterLocked = true; sis.reachT = 0.6; snd('rattle'); snd('clunk'); burst(ALLEY.chain, ALLEY.floor - 250, 6);
  sayNow(sis, 'Got the chain! The shutter is hooked open now.'); if (bro.plane !== 'yard') say(bro, 'Coming in!');
}
function drawYardExtras(c, t) {
  const A2 = ALLEY, x = A2.chain, top = A2.floor - 420, pull = game.shutterLocked ? 34 : 0, hy = A2.floor - 262 + pull;
  c.strokeStyle = '#5a5650'; c.lineWidth = 3; c.setLineDash([7, 5]); c.beginPath(); c.moveTo(x, top); c.lineTo(x, hy - 12); c.stroke(); c.setLineDash([]);
  c.beginPath(); circ(c, x, hy, 12); c.strokeStyle = '#d9b55c'; c.lineWidth = 5; c.stroke(); c.strokeStyle = '#5a4214'; c.lineWidth = 1.2; c.beginPath(); circ(c, x, hy, 14.5); c.stroke();
  if (game.shutterLocked) { c.strokeStyle = '#3c3a40'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 26, hy + 6); c.lineTo(x + 12, hy + 6); c.stroke(); rrect(c, x + 24, hy - 10, 10, 30, 3); fs(c, '#5a5650', '#1c1a20', 1.5); }
  if (!game.stickers.has('sock')) { const [sx, sy] = A2.sock; c.strokeStyle = '#8a6a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx, sy - 22); c.lineTo(sx, sy - 12); c.stroke(); c.save(); c.translate(sx, sy); c.rotate(Math.sin(t * 1.4) * 0.08); drawIcon(c, 'sock', 0, 4, 1.25); c.restore(); }
  drawGlints(c, t, 'yard');
}

// ---------- the market puppy, who has the fourth map piece
function pupSides(st) {
  const d = game.pup;
  return [st.filter((p) => p.x <= d.x).reduce((m, p) => Math.min(m, d.x - p.x), 1e9), st.filter((p) => p.x > d.x).reduce((m, p) => Math.min(m, p.x - d.x), 1e9)];
}
function updatePup(dt) {
  const d = game.pup; d.t += dt; if (d.caught) return;
  const st = players.filter((p) => p.plane === 'street');
  if (!st.some((p) => p.x > PUPPY.area[0] - 450 && p.x < PUPPY.area[1] + 300)) return;
  if (!d.seen) { d.seen = true; snd('bark'); sayNow(bro, 'A puppy! ...hey! It has our map piece!'); say(sis, "It thinks we are playing. Let's get it back."); }
  const [L, Rt] = pupSides(st), [a0, a1] = PUPPY.area, nearest = Math.min(L, Rt);
  if (d.mode === 'trapped') { if (L > PUPPY.trap + 60 || Rt > PUPPY.trap + 60) { d.mode = 'run'; d.dir = L < Rt ? 1 : -1; d.from = null; snd('bark'); } return; }
  if (d.mode === 'hide') { // under a stall: it stays until the brother crawls in, or until everyone has gone away
    d.alone = nearest > 560 ? d.alone + dt : 0;
    if (d.alone > PUPPY.peek) { d.mode = 'sniff'; d.from = d.stall; d.x = d.stall + (d.stall < (a0 + a1) / 2 ? 190 : -190); d.alone = 0; }
    return;
  }
  if (L < PUPPY.trap && Rt < PUPPY.trap) { d.mode = 'trapped'; snd('whine'); if (!d.saidTrap) { d.saidTrap = true; sayNow(sis, 'Got you! Nowhere to run now.'); } return; }
  if (d.dash > 0) { d.dash -= dt; d.x = Math.max(a0, Math.min(a1, d.x + d.dir * PUPPY.speed * 1.25 * dt)); return; }
  let flee = 0;
  if (nearest < PUPPY.scare) flee = L < Rt ? 1 : -1; else if (d.mode === 'run') flee = d.dir;
  if (!flee) { d.mode = 'sniff'; d.x = Math.max(a0, Math.min(a1, d.x + Math.sin(d.t * 0.8) * 14 * dt)); return; }
  if (d.mode !== 'run') { d.ran = 0; snd('bark'); }
  d.mode = 'run'; d.dir = flee; d.ran = (d.ran || 0) + PUPPY.speed * dt;
  const nx = d.x + flee * PUPPY.speed * dt;
  // it dives under the first stall it passes
  const stall = PUPPY.stalls.find((s) => s !== d.from && (s - d.x) * flee >= 0 && (s - nx) * flee <= 0);
  if (stall !== undefined && d.ran > 120) {
    d.mode = 'hide'; d.stall = stall; d.x = stall; d.alone = 0; d.hides = (d.hides || 0) + 1; snd('whine');
    if (d.hides === 1) { sayNow(bro, 'He is hiding under the stall!'); say(sis, 'I can see his tail... but I will never fit under there.'); }
    return;
  }
  if (nx < a0 || nx > a1) { d.dir = -flee; d.dash = 1.1; d.from = null; d.x = Math.max(a0, Math.min(a1, nx)); } // cornered by one sibling: it darts straight past
  else d.x = nx;
}
function flushPup(p) { // the brother crawls under the stall, and the puppy dashes out of the other side
  const d = game.pup, dir = p.x < d.stall ? 1 : -1;
  p.crawl = 0.6; p.x = d.stall + dir * 110; p.dir = dir; snd('bark');
  const waiter = players.find((q) => q !== p && q.plane === 'street' && (q.x - d.stall) * dir > 150 && (q.x - d.stall) * dir < PUPPY.block);
  d.dir = dir; d.from = d.stall; d.ran = 200; d.x = d.stall + dir * 215; d.flushes = (d.flushes || 0) + 1;
  if (waiter) { d.x = dir > 0 ? Math.max(d.x, waiter.x - 95) : Math.min(d.x, waiter.x + 95); d.mode = 'trapped'; snd('whine'); sayNow(waiter, 'Got you! Nowhere to run now.'); return; }
  d.mode = 'run';
  if (d.flushes === 1) { sayNow(bro, 'He shot out of the other side!'); say(sis, 'Then that is where I should be waiting...'); }
  else if (d.flushes === 3) sayNow(sis, 'Wait until I am standing on the other side of the stall, then crawl in!');
}
function stallPeek(p) { if (p === bro) { flushPup(p); return; } snd('whine'); sayNow(sis, pick(['He is right at the back. I cannot reach him under there!', 'Two little eyes, looking at me. Come out, puppy!'])); }
function petPup(p) {
  const d = game.pup;
  if (d.caught) { p.cheer = 0.5; snd('bark'); hearts(d.x, FEET - 70, 5); if (giveSticker('paw', d.x, FEET - 120)) sayNow(p, 'Who is a good boy? You are!'); return; }
  d.caught = true; d.mode = 'happy'; game.pieces.got[3] = true; burst(d.x, FEET - 60, 10); p.cheer = 0.7; snd('piece'); hearts(d.x, FEET - 70, 3);
  sayNow(p, 'Good puppy! Can we have our map piece back?'); say(other(p), `He dropped it! And look: this piece has ${ICON_NAME[SYMBOLS[game.stamps[3]]]} drawn on it.`); say(bro, 'Can we keep him?'); say(sis, 'No! ...but he is very cute.');
}
function drawPupHiding(c, t) { // under a stall: two eyes in the shadow and a wagging tail
  const d = game.pup, x = d.stall, y = BASE + 12; if (!inView(x - 200, x + 200)) return;
  const fur = '#c98a4a', dark = '#7a4a24', cream = '#f6e6c8', peek = Math.sin(t * 2.2) * 3, blink = Math.sin(t * 0.9) > 0.94 ? 0.15 : 1;
  // the gap under the stall's cloth
  c.beginPath(); c.moveTo(x - 86, y + 2); c.lineTo(x - 86, y - 34); c.quadraticCurveTo(x, y - 74, x + 86, y - 34); c.lineTo(x + 86, y + 2); c.closePath(); fs(c, lg(c, 0, y - 70, 0, y, '#3a2416', '#1c120a'), '#2a1a10', 2.5);
  // the tail, wagging out of one side
  c.save(); c.translate(x - 84, y - 8); c.rotate(-0.9 + Math.sin(t * 13) * 0.4); c.lineCap = 'round'; c.strokeStyle = dark; c.lineWidth = 11; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-12, -14, -8, -32); c.stroke(); c.strokeStyle = fur; c.lineWidth = 7; c.stroke(); c.restore();
  // the face peeking out, with the map piece
  c.save(); c.translate(x + 8, y - 24 + peek); c.lineJoin = 'round';
  for (const s of [-1, 1]) { c.save(); c.translate(s * 21, -10); c.rotate(s * 0.5); c.beginPath(); c.ellipse(0, 9, 8, 15, 0, 0, TAU); fs(c, dark, '#4a2a14', 1.6); c.restore(); }
  c.beginPath(); circ(c, 0, 0, 23); fs(c, fur, dark, 2.2);
  c.beginPath(); c.ellipse(0, 10, 13, 10, 0, 0, TAU); fs(c, cream, dark, 1.6); ell(c, 0, 5, 5, 4, '#2a1a10');
  for (const s of [-1, 1]) { ell(c, s * 9, -6, 3.6, 3.6 * blink, '#2a1a10'); ell(c, s * 9 + 1, -7, 1.2, 1.2 * blink, '#fff'); }
  c.save(); c.translate(4, 19); c.rotate(0.25); c.beginPath(); c.moveTo(-15, -6); c.lineTo(-3, -9); c.lineTo(12, -6); c.lineTo(15, 6); c.lineTo(-13, 8); c.closePath(); fs(c, '#f1dfb0', '#8a6a3a', 1.5); c.restore();
  c.restore();
  if (Math.sin(t * 1.7) > 0.6) { c.save(); c.globalAlpha = 0.9; c.fillStyle = '#fffbf0'; c.strokeStyle = dark; c.lineWidth = 3; c.font = 'italic 700 19px Georgia, serif'; c.textAlign = 'center'; c.strokeText('yip!', x + 66, y - 84); c.fillText('yip!', x + 66, y - 84); c.restore(); }
}

// ---------- the canal: little boats tied in a row, the mooring post, and the ferry buttons
const BOAT_COLS = ['#c9534a', '#4f83ad', '#e2b84a', '#5f9a68', '#c97a4a'];
const boatHome = (i) => FERRY.canal[0] + (i + 0.5) * (FERRY.canal[1] - FERRY.canal[0]) / FERRY.boats;
function boatPose(i, t) { // where boat i is: steady in a line when the rope is tight, drifting and rocking when it is slack
  const s = 1 - ease(game.canal.tight);
  return { x: boatHome(i) + Math.sin(t * 0.8 + i * 2.1) * 30 * s, y: FERRY.boatY + Math.sin(t * 1.7 + i * 1.3) * (1.5 + 5 * s), rot: Math.sin(t * 1.3 + i * 1.7) * (0.015 + 0.085 * s) };
}
const nearestBoat = (x) => { let b = 0; for (let i = 1; i < FERRY.boats; i++) if (Math.abs(boatHome(i) - x) < Math.abs(boatHome(b) - x)) b = i; return b; };
function enterBoats(p, x) { p.plane = 'boats'; p.x = x; p.scale = FERRY.depth; p.boat = nearestBoat(x); snd('hop'); if (!game.canal.saidStep) { game.canal.saidStep = true; sayNow(bro, 'Wobbly! Do not let go of that rope!'); } }
function leaveBoats(p, x) { p.plane = 'street'; p.x = x; p.y = FEET; p.scale = 1; p.safeX = x; snd('hop'); }
function boatLimits(p) {
  const [c0, c1] = FERRY.canal;
  if (game.canal.tight >= 0.75) return [c0 + 14, c1 - 14];
  const bx = boatPose(p.boat, game.time).x; return [bx - 52, bx + 52];
}
function canalStep(p, dir) { // stepping on and off the boats, and what happens when it cannot be done
  const cn = game.canal, [c0, c1] = FERRY.canal, fe = game.ferry, tight = cn.tight >= 0.75;
  if (p.plane === 'boats') {
    if (tight) p.boat = nearestBoat(p.x);
    p.y = boatPose(p.boat, game.time).y;
    if (tight && p.x <= c0 + 18 && dir < 0) leaveBoats(p, c0 - 14);
    else if (tight && p.x >= c1 - 18 && dir > 0) { leaveBoats(p, c1 + 14); if (!cn.crossed) { cn.crossed = true; p.cheer = 0.7; snd('good'); sayNow(bro, 'Made it! Dry feet and everything.'); say(sis, 'Well done! Now, can you send that ferry over for me?'); } }
    else if (!tight && cn.wasTight) { snd('creak'); sayNow(bro, pick(['Whoa whoa whoa! Hold the rope tight!', 'Eek! The boats are drifting! Pull the rope!'])); }
    cn.wasTight = tight; return;
  }
  if (p.plane !== 'street' || !dir) return;
  const atNear = dir > 0 && p.x >= c0 - 9 && p.x <= c0 && !(fe.side === 'near' && !fe.moving), atFar = dir < 0 && p.x <= c1 + 9 && p.x >= c1 && !(fe.side === 'far' && !fe.moving);
  if (!atNear && !atFar) return;
  if (p === bro && tight) { enterBoats(p, atNear ? c0 + 20 : c1 - 20); cn.wasTight = true; return; }
  if (cn.nag > 0) return; cn.nag = 6;
  if (p === bro) { snd('no'); sayNow(bro, pick(['The boats are drifting all over the place. I would fall in!', 'If only those boats would keep still...'])); return; }
  if (!cn.splashed) { cn.splashed = true; p.stun = 1; p.x -= 26; snd('splash'); spray(p.x + 60, FERRY.boatY + 20, 18); sayNow(sis, 'Whoa! It tipped right over. These little boats will never hold me.'); say(bro, 'But I am much lighter than you...'); }
  else sayNow(sis, 'Those little boats would sink under me.');
}
function updateCanal(dt) {
  const cn = game.canal, held = players.some((p) => p.holding === 'rope'), was = cn.tight;
  cn.tight = clamp01(cn.tight + (held ? FERRY.tighten : -FERRY.loosen) * dt); cn.nag = Math.max(0, cn.nag - dt);
  if (held && was < 0.05) { snd('creak'); if (!cn.saidRope) { cn.saidRope = true; say(sis, 'The rope pulls all the boats into a line! I can hold it, but I cannot let go.'); } }
  if (was < 0.75 && cn.tight >= 0.75) snd('click');
}
function ropeHold(p) { snd('no'); sayNow(bro, 'There is a ring on the post for the rope, but it is way above my head.'); }
function ferryPress(p, side) {
  const fe = game.ferry;
  if (side === 'near') { snd('spark'); burst(FERRY.buttonNear, BASE - 110, 4); sayNow(p, p === sis ? 'Broken. And the ferry is over on the other side.' : 'Bzzt! This button is broken!'); return; }
  if (fe.moving) { sayNow(p, 'The ferry is already moving.'); return; }
  snd('tap'); burst(FERRY.buttonFar, BASE - 110, 4);
  if (fe.side === 'far') { fe.moving = -1; sayNow(p, either(onFerry) ? 'Off you go!' : 'Ferry coming over! Hop on when it gets there.'); }
  else { fe.moving = 1; sayNow(p, either(onFerry) ? 'Hold on! Bringing you across.' : 'Come back, ferry!'); if (either(onFerry) && !game.saidFerry) { game.saidFerry = true; say(players.find(onFerry), 'Wheee! This is the way to travel.'); } }
}
function ferryLabel(p, side) {
  const fe = game.ferry; if (side === 'near') return game.canal.crossed ? null : 'Press the ferry button';
  if (fe.moving) return null; return fe.side === 'far' ? 'Send the ferry across' : either(onFerry) ? 'Bring the ferry back' : 'Call the ferry back';
}
function drawBoat(c, i, t, front) {
  const b = boatPose(i, t), col = BOAT_COLS[i % BOAT_COLS.length];
  c.save(); c.translate(b.x, b.y); c.rotate(b.rot);
  if (!front) { // the inside of the boat and its far edge
    c.beginPath(); c.moveTo(-80, -22); c.quadraticCurveTo(0, -12, 84, -24); c.lineTo(70, 6); c.lineTo(-66, 6); c.closePath(); fs(c, shade(col, -0.45), '#2a1a10', 2);
    rrect(c, -14, -17, 28, 8, 2); fs(c, '#b5915c', '#5a3e28', 1.5);
  } else { // the near side of the hull, drawn over the feet of anyone standing in it
    c.beginPath(); c.moveTo(-86, -14); c.quadraticCurveTo(0, -2, 90, -16); c.quadraticCurveTo(80, 20, 52, 28); c.lineTo(-48, 28); c.quadraticCurveTo(-76, 20, -86, -14); c.closePath();
    fs(c, lg(c, 0, -14, 0, 28, shade(col, 0.12), shade(col, -0.2)), '#2a1a10', 2.5);
    c.strokeStyle = 'rgba(255,250,235,.85)'; c.lineWidth = 5; c.beginPath(); c.moveTo(-82, -9); c.quadraticCurveTo(0, 3, 86, -11); c.stroke();
    c.strokeStyle = 'rgba(40,25,15,.3)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-74, 6); c.quadraticCurveTo(0, 16, 78, 4); c.stroke();
    c.fillStyle = 'rgba(111,154,176,.55)'; c.fillRect(-96, 17, 196, 16); // the water it sits in
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-92, 17 + Math.sin(t * 2 + i) * 1.5); c.quadraticCurveTo(0, 13, 96, 17 - Math.sin(t * 2 + i) * 1.5); c.stroke();
  }
  c.restore();
}
function drawBoats(c, t) {
  const [c0, c1] = FERRY.canal; if (!inView(c0 - 300, c1 + 300)) return;
  const cn = game.canal, px = FERRY.post, ringY = FEET - 268, s = 1 - ease(cn.tight);
  // the rope: from the ring on the post, through every boat, to the far bank
  const pts = [[px + 6, ringY]]; for (let i = 0; i < FERRY.boats; i++) { const b = boatPose(i, t); pts.push([b.x - 78, b.y - 18], [b.x + 82, b.y - 20]); } pts.push([c1 + 4, FERRY.boatY - 34]);
  for (let i = 0; i < FERRY.boats; i++) drawBoat(c, i, t, false);
  c.strokeStyle = '#8a6f44'; c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i], sag = i % 2 ? 26 * s + 4 : 0; c.quadraticCurveTo((ax + bx) / 2, Math.max(ay, by) + sag * 2, bx, by); } c.stroke();
  for (const p of players) if (p.plane === 'boats') drawSib(p, t);
  for (let i = 0; i < FERRY.boats; i++) drawBoat(c, i, t, true);
  if (!game.stickers.has('boat')) { const b = boatPose(2, t), k = Math.max(0, Math.sin(t * 2.4)); star(c, b.x + 30, b.y - 26, 9 + k * 6, t * 2, 0.5 + k * 0.4); }
}
function drawMooring(c, t) { // the post on the quay with the rope ring high up, and sparks from the broken button
  const [c0, c1] = FERRY.canal; if (!inView(c0 - 300, c1 + 300)) return;
  const px = FERRY.post, top = FEET - 300;
  c.fillStyle = lg(c, px - 9, 0, px + 9, 0, '#8a6844', '#6b4e30', '#4f3820'); rrect(c, px - 9, top, 18, FEET + 14 - top, 4); c.fill(); c.strokeStyle = '#2a1a10'; c.lineWidth = 2; c.stroke();
  rrect(c, px - 12, top - 6, 24, 12, 4); fs(c, '#5a5650', '#1c1a20', 1.5);
  for (const yy of [top + 60, top + 150, top + 240]) { c.fillStyle = 'rgba(30,20,10,.25)'; c.fillRect(px - 9, yy, 18, 3); }
  const held = players.some((p) => p.holding === 'rope'), ry = FEET - 268;
  c.beginPath(); circ(c, px + 6, ry, 11); c.strokeStyle = held ? '#fff3b8' : '#2c2c34'; c.lineWidth = 4.5; c.stroke();
  if (held) soft(c, px + 6, ry, 30, 30, '#fff3b8', 0.5);
  const bx = FERRY.buttonNear; rrect(c, bx - 30, BASE + 12 - 178, 60, 18, 3); fs(c, '#f2c94e', '#3a2618', 1.2); c.fillStyle = '#3a2618'; c.font = '700 9px Georgia, serif'; c.textAlign = 'center'; c.fillText('OUT OF ORDER', bx, BASE + 12 - 165); c.textAlign = 'left';
  if (Math.sin(t * 3.1) > 0.92) { star(c, bx + 8, BASE + 12 - 122, 12, t * 9, 0.9); soft(c, bx + 8, BASE + 12 - 122, 24, 24, '#bfe2ff', 0.5); }
}

// ---------- Fountain Square: the fountain and the bell game
function drawFountain(c, t) {
  const x = SQUARE.fountain, g = BASE + 22; if (!inView(x - 260, x + 260)) return;
  const stone = (x0, x1) => lg(c, x0, 0, x1, 0, '#d8cfc0', '#bdb3a3', '#958b7c');
  const fall = (x0, y0, x1, y1, w, ph) => { // a ribbon of falling water
    c.strokeStyle = 'rgba(214,236,246,.8)'; c.lineWidth = w; c.setLineDash([14, 9]); c.lineDashOffset = -t * 90 - ph; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y0 - 6, x1, y1); c.stroke(); c.setLineDash([]);
    c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = w * 0.35; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y0 - 6, x1, y1); c.stroke();
  };
  soft(c, x, g + 4, 230, 20, '#2a1a0e', 0.3);
  // the basin
  rrect(c, x - 196, g - 58, 392, 58, 12); fs(c, stone(x - 196, x + 196), '#5a5046', 2.5);
  c.fillStyle = 'rgba(60,50,40,.16)'; for (let i = -3; i <= 3; i++) c.fillRect(x + i * 56 - 1, g - 46, 2, 44);
  c.beginPath(); c.ellipse(x, g - 58, 196, 17, 0, 0, TAU); fs(c, '#e6ddce', '#5a5046', 2.5);
  c.beginPath(); c.ellipse(x, g - 58, 176, 12, 0, 0, TAU); fs(c, lg(c, x - 176, 0, x + 176, 0, '#8fc0d6', '#b9dcea', '#7fb2ca'));
  for (let i = 0; i < 4; i++) { const u = (t * 0.5 + i / 4) % 1; c.strokeStyle = `rgba(255,255,255,${0.5 * (1 - u)})`; c.lineWidth = 2; c.beginPath(); c.ellipse(x + (i % 2 ? 78 : -78), g - 58, 14 + u * 44, 2 + u * 5, 0, 0, TAU); c.stroke(); }
  // water falling from the bowl into the basin (behind the column)
  for (const s of [-1, 1]) { fall(x + s * 60, g - 196, x + s * 78, g - 60, 9, s * 7); fall(x + s * 36, g - 194, x + s * 44, g - 60, 6, s * 13); }
  // the column and the bowl
  c.beginPath(); c.moveTo(x - 22, g - 58); c.lineTo(x - 15, g - 190); c.lineTo(x + 15, g - 190); c.lineTo(x + 22, g - 58); c.closePath(); fs(c, stone(x - 22, x + 22), '#5a5046', 2.2);
  c.beginPath(); c.moveTo(x - 96, g - 204); c.quadraticCurveTo(x - 60, g - 170, x - 14, g - 168); c.lineTo(x + 14, g - 168); c.quadraticCurveTo(x + 60, g - 170, x + 96, g - 204); c.closePath(); fs(c, stone(x - 96, x + 96), '#5a5046', 2.2);
  c.beginPath(); c.ellipse(x, g - 204, 96, 10, 0, 0, TAU); fs(c, '#e6ddce', '#5a5046', 2.2); c.beginPath(); c.ellipse(x, g - 204, 84, 6.5, 0, 0, TAU); fs(c, '#a9d2e2');
  // the top: a little stone fish spouting water
  for (const s of [-1, 1]) fall(x + s * 6, g - 318, x + s * 54, g - 208, 5, s * 21);
  c.beginPath(); c.moveTo(x - 11, g - 204); c.lineTo(x - 7, g - 282); c.lineTo(x + 7, g - 282); c.lineTo(x + 11, g - 204); c.closePath(); fs(c, stone(x - 11, x + 11), '#5a5046', 2);
  c.beginPath(); c.ellipse(x, g - 300, 17, 22, 0, 0, TAU); fs(c, stone(x - 17, x + 17), '#5a5046', 2); c.beginPath(); c.moveTo(x - 10, g - 320); c.lineTo(x, g - 340); c.lineTo(x + 10, g - 320); c.closePath(); fs(c, '#cfc6b6', '#5a5046', 2);
  ell(c, x - 6, g - 304, 2.2, 2.2, '#5a5046'); ell(c, x + 6, g - 304, 2.2, 2.2, '#5a5046');
  for (let i = 0; i < 5; i++) { const u = (t * 1.4 + i * 0.2) % 1; ell(c, x + Math.sin(i * 9 + t) * 150, g - 62 - u * 12, 2.5, 2.5, '#fff', 0.6 * (1 - u)); }
}
function fountainPlay(p) {
  const x = SQUARE.splash, wet = other(p);
  snd('splash'); spray(x + 40, BASE - 44, 20, 380, 420);
  if (p === bro) { p.cheer = 0.6; if (wet.plane === 'street' && Math.abs(wet.x - x) < 260) { wet.stun = 0.5; sayNow(sis, pick(['Hey!! You got me all wet!', 'Stop that! ...okay, it is a bit funny.'])); } else sayNow(bro, pick(['Splash! Ha ha!', 'It is freezing!'])); }
  else { p.reachT = 0.5; burst(x + 60, BASE - 80, 5); sayNow(sis, pick(['I wish... we find the treasure. Obviously.', 'The water is so cold and clear.'])); }
}
function strikerUse(p) { // the bell game: start a go, or stop the light
  const k = game.striker;
  if (k.phase === 'idle') { k.phase = 'aim'; k.who = p; k.t = 0; snd('tap'); if (!k.said) { k.said = true; sayNow(p, 'Stop the light as high up as you can. Here goes!'); } return; }
  if (k.phase !== 'aim' || k.who !== p) return;
  k.power = k.pos; k.phase = 'fly'; k.t = 0; k.rang = false; snd('thump'); p.cheer = 0.4;
}
function updateStriker(dt) {
  const k = game.striker; if (k.phase === 'idle') return; k.t += dt;
  if (k.phase === 'aim') { const u = (k.t / SQUARE.period) % 2; k.pos = u < 1 ? u : 2 - u; if (k.t > 9 || Math.abs(k.who.x - SQUARE.striker) > 200) k.phase = 'idle'; return; }
  const up = 0.4; k.puck = k.t < up ? k.power * Math.sin(k.t / up * Math.PI / 2) : k.power * Math.max(0, 1 - Math.pow((k.t - up) / 0.7, 2));
  if (!k.rang && k.t >= up) {
    k.rang = true; const p = k.who, score = Math.round(k.power * 100), o = other(p);
    k.best[p.name] = Math.max(k.best[p.name] || 0, score); pop(SQUARE.striker, FEET - 330, p.name + ': ' + score);
    if (k.power >= SQUARE.ring) { snd('ding'); party(SQUARE.striker - 120, SQUARE.striker + 120, BASE - 380, 36); p.cheer = CHEER; giveSticker('bell', SQUARE.striker, BASE - 300); sayNow(p, pick(['DING! Did you hear that?!', 'Right to the top!'])); }
    else if (k.best[o.name] && score > k.best[o.name]) sayNow(p, pick(['Ha! Beat that!', 'I am winning!']));
    else sayNow(p, k.power > 0.7 ? pick(['So close!', 'Nearly rang it!']) : pick(['Hmm. One more go.', 'That was a baby hit.']));
  }
  if (k.t > up + 0.75) k.phase = 'idle';
}
function drawStriker(c, t) {
  const x = SQUARE.striker, g = BASE + 22, k = game.striker, H0 = 400; if (!inView(x - 160, x + 160)) return;
  soft(c, x, g + 2, 110, 12, '#2a1a0e', 0.3);
  // the pole: a tall painted board with a groove for the puck
  rrect(c, x - 30, g - H0 - 30, 60, H0, 8); fs(c, lg(c, x - 30, 0, x + 30, 0, '#f6efe0', '#e8dcc0'), '#3a2618', 2.5);
  for (let i = 0; i < 10; i++) { c.fillStyle = i % 2 ? '#d9534a' : '#f2c94e'; c.fillRect(x - 27, g - 44 - (i + 1) * 36, 8, 34); c.fillRect(x + 19, g - 44 - (i + 1) * 36, 8, 34); }
  rrect(c, x - 6, g - H0 - 16, 12, H0 - 26, 5); fs(c, '#5a4a3a');
  c.fillStyle = '#3a2618'; c.font = '700 11px Georgia, serif'; c.textAlign = 'center'; for (let i = 1; i <= 4; i++) c.fillText(String(i * 25), x - 17, g - 40 - i * 0.25 * (H0 - 50) + 4);
  const yOf = (u) => g - 50 - u * (H0 - 60);
  if (k.phase === 'aim') { const y = yOf(k.pos); soft(c, x, y, 34, 22, '#fff3b8', 0.9); rrect(c, x - 8, y - 5, 16, 10, 4); fs(c, '#fff8d0', '#d9a520', 1.5); }
  const py = yOf(k.phase === 'fly' ? k.puck : 0); rrect(c, x - 13, py - 7, 26, 14, 4); fs(c, '#c9402f', '#4a0e0a', 2);
  // the bell
  const ring = k.phase === 'fly' && k.rang && k.power >= SQUARE.ring ? Math.sin(t * 40) * 0.12 * Math.max(0, 1 - k.t) : 0;
  c.save(); c.translate(x, g - H0 - 46); c.rotate(ring); drawIcon(c, 'bell', 0, 0, 2.1); c.restore();
  c.strokeStyle = '#3a2618'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, g - H0 - 30); c.lineTo(x, g - H0 - 16); c.stroke();
  // the base with the scores
  rrect(c, x - 84, g - 52, 168, 52, 8); fs(c, lg(c, 0, g - 52, 0, g, '#c9402f', '#9a2a20'), '#3a2618', 2.5);
  rrect(c, x - 74, g - 44, 148, 36, 5); fs(c, '#fffbf0', '#3a2618', 1.2);
  c.fillStyle = '#3a2618'; c.font = '700 12px Georgia, serif';
  c.fillText('Sister ' + (k.best.Sister || '--') + '   Brother ' + (k.best.Brother || '--'), x, g - 22); c.textAlign = 'left';
}

// ---------- the metro piano: there is one on every platform. Two players at once make a duet.
const PIANO_TUNE = [72, 76, 79, 76, 81, 79, 76, 74, 72, 74, 76, 79, 74, 72];
function pianoPlay(p) {
  const pn = game.piano, i = p === sis ? 0 : 1, now = game.time;
  snd('note', PIANO_TUNE[pn.step++ % PIANO_TUNE.length] - (p === sis ? 12 : 0)); notes(METRO.piano + (i ? 40 : -40), BASE - 150, 1); p.playT = 0.35; pn.last[i] = now;
  if (Math.abs(pn.last[0] - pn.last[1]) < 1.2) { pn.duet++; if (pn.duet >= 3 && giveSticker('note', METRO.piano, BASE - 260)) { sis.cheer = bro.cheer = CHEER; sayNow(bro, 'We are a band!'); say(sis, 'Do not give up the treasure hunting just yet.'); } }
  else if (!pn.said) { pn.said = true; sayNow(p, p === sis ? 'It says "play me". All right then.' : 'Plink plonk! Come and play too!'); }
}
function drawPiano(c, t) {
  const x = METRO.piano, g = BASE + 8; if (!inView(x - 160, x + 160)) return;
  soft(c, x, g + 2, 120, 10, '#1c120a', 0.3);
  rrect(c, x - 104, g - 176, 208, 176, 8); fs(c, lg(c, 0, g - 176, 0, g, '#8a5a3a', '#6b4028'), '#2a1a10', 2.5);
  rrect(c, x - 92, g - 164, 184, 62, 5); fs(c, '#7a4c30', 'rgba(42,26,16,.6)', 1.5);
  rrect(c, x - 112, g - 98, 224, 26, 4); fs(c, '#5a3420', '#2a1a10', 2);
  rrect(c, x - 104, g - 94, 208, 15, 2); fs(c, '#fffbf0', '#2a1a10', 1.2);
  c.fillStyle = '#2a1a10'; for (let i = 0; i < 20; i++) { c.fillRect(x - 104 + i * 10.4, g - 94, 1, 15); if (i % 7 !== 2 && i % 7 !== 6) c.fillRect(x - 98 + i * 10.4, g - 94, 6, 9); }
  for (const p of players) if (p.plane === 'metro' && p.playT > 0) soft(c, p.x, g - 86, 34, 14, '#fff3b8', 0.7);
  rrect(c, x - 52, g - 152, 104, 32, 4); fs(c, '#f2c94e', '#3a2618', 1.5); c.fillStyle = '#3a2618'; c.font = 'italic 700 18px Georgia, serif'; c.textAlign = 'center'; c.fillText('Play me!', x, g - 130); c.textAlign = 'left';
  for (const lx of [x - 92, x + 80]) { c.fillStyle = '#4a2c1a'; c.fillRect(lx, g - 72, 12, 72); }
}

// ---------- the bus: pick a number on the request box and that bus comes
const BUS_DOOR = 342; // the bus door, measured from the middle of the bus art
const busNow = () => game.routes[game.bus.cur];
function busDial(p) {
  const b = game.bus; if (b.riders.length || b.state === 'off' || b.arrived) return;
  b.want = (b.want + 1) % BUS.lines.length; b.callT = BUS.call; snd('dial'); burst(BUS.dial, BASE - 250, 3);
  if (b.state === 'arriving' || b.state === 'waiting') { b.state = 'leaving'; b.t = 0; b.ride = false; }
  if (!game.saidDial) { game.saidDial = true; sayNow(p, 'It changes the number. Whichever bus we ask for, comes.'); say(other(p), 'But which number goes to the Old Bridge?'); }
}
function boardBus(p) {
  const b = game.bus; if (b.state !== 'waiting' || b.riders.includes(p)) return;
  if (game.tickets < 2) { snd('no'); sayNow(p, game.tickets ? 'We need a ticket each, and we only have one!' : 'We need a ticket each, and we have none!'); return; }
  b.riders.push(p); p.plane = 'bus'; p.holding = null; snd('hop');
  if (b.riders.length === 1) sayNow(other(p), 'Wait for me!');
  if (b.riders.length === 2) { b.state = 'leaving'; b.t = 0; b.ride = busNow().place === 0; game.panel = null; snd('bus'); }
}
function unboard(p, x) { p.plane = 'street'; p.x = x; p.y = FEET; p.alpha = 1; }
function updateBus(dt) {
  const b = game.bus; b.t -= dt; b.callT -= dt;
  const stopX = BUS.stop - BUS_DOOR;
  if (b.state === 'away') { if (b.want >= 0 && b.callT <= 0 && !b.arrived) { b.cur = b.want; b.state = 'arriving'; b.t = 2.4; b.x0 = camX - 700; b.x = b.x0; snd('bus'); } return; }
  if (b.state === 'arriving') { const u = 1 - Math.max(0, b.t) / 2.4; b.x = lerp(b.x0, stopX, 1 - Math.pow(1 - u, 3)); if (b.t <= 0) { b.state = 'waiting'; b.t = BUS.wait; snd('doors'); if (!game.saidBus) { game.saidBus = true; say(bro, `Bus ${busNow().line}! Is it the right one?`); } } return; }
  if (b.state === 'waiting') { if (b.t <= 0) { b.state = 'leaving'; b.t = 0; b.ride = false; b.callT = 5; } return; }
  if (b.state === 'leaving') {
    if (b.riders.length === 1) { const p = b.riders.pop(); unboard(p, BUS.stop - 30); sayNow(p, "I'm not going without you!"); }
    if (b.ride) { // the right bus: ride along the street to the Old Bridge stop
      const target = BUS.arrive - BUS_DOOR; b.x = Math.min(target, b.x + BUS.rideSpeed * dt * Math.min(1, -b.t * 0.6 + 0.3)); b.t -= dt;
      for (const [i, p] of b.riders.entries()) { p.x = b.x + 22 + i * 112; }
      if (!game.saidRide) { game.saidRide = true; say(bro, 'Wheee! The whole city is going past!'); say(sis, 'Next stop... the Old Bridge!'); }
      if (b.x >= target) { b.riders.forEach((p, i) => unboard(p, BUS.arrive - 40 + i * 90)); b.riders = []; b.ride = false; b.arrived = true; b.state = 'off'; b.t = 0; snd('doors'); say(sis, 'Old Bridge. This is our stop!'); }
      return;
    }
    b.x += (180 + -b.t * 260) * dt; b.t -= dt;
    if (b.riders.length === 2 && b.x > camX + VW + 200 && !game.fade) { // the wrong bus
      const r = busNow(), place = BUS.places[r.place]; game.wrongBuses++;
      game.fade = { t: 0, dur: 4.4, text: `Oh no! Bus ${r.line} goes to the ${place}...`, sub: 'They ride all the way there, and all the way back.', mid: () => { b.riders.forEach((p, i) => unboard(p, BUS.stop - 20 - i * 70)); b.riders = []; b.state = 'away'; b.want = -1; sayNow(bro, 'Wrong bus! Let us look at the route map again.'); } };
    }
    if (b.riders.length === 0 && b.x > camX + VW + 700) b.state = 'away';
  }
  if (b.state === 'off') { b.x += 260 * dt; }
}
function drawBusDial(c, t) {
  const x = BUS.dial, g = BASE + 14, b = game.bus; if (!inView(x - 80, x + 80)) return;
  c.fillStyle = lg(c, x - 5, 0, x + 5, 0, '#6a6a72', '#3c3c44'); c.fillRect(x - 5, g - 250, 10, 250);
  rrect(c, x - 44, g - 330, 88, 100, 8); fs(c, lg(c, 0, g - 330, 0, g - 230, '#3f5a78', '#2c4460'), '#1c2a3a', 2.5);
  c.fillStyle = '#f6efe0'; c.font = 'italic 700 13px Georgia, serif'; c.textAlign = 'center'; c.fillText('BUS', x, g - 312);
  rrect(c, x - 32, g - 302, 64, 42, 5); fs(c, '#1c1c22', '#000', 1.5);
  c.fillStyle = '#ffb03a'; c.font = '700 30px Georgia, serif'; c.textBaseline = 'middle'; c.fillText(b.want < 0 ? '--' : String(game.routes[b.want].line), x, g - 280); c.textBaseline = 'alphabetic';
  c.beginPath(); circ(c, x, g - 244, 8); fs(c, b.callT > 0 || b.state === 'arriving' ? '#ffb03a' : '#c9402f', '#2a0a08', 1.5);
  c.textAlign = 'left';
}

// ---------- the Old Bridge: power, the picture code in the hut, the lever and the safety brake
function powerPost(p) { // the power switch (and later the brake handle) high on the post
  const br = game.bridge;
  if (!br.power) {
    if (p === bro) { snd('no'); p.cheer = 0.4; sayNow(bro, "The switch is way up there. I can't reach it!"); return; }
    br.power = true; sis.reachT = 0.6; snd('clunk'); snd('good'); burst(BRIDGE.power, FEET - 380, 8);
    sayNow(sis, 'Power is on! The little hut has lit up.'); say(bro, 'Then the controls must be in that hut!'); return;
  }
  if (br.jammed && p === bro) { snd('no'); sayNow(bro, 'The brake handle is right at the top of the post. Sis!'); }
}
function hutDoor(p) {
  if (p === sis) { snd('no'); sayNow(sis, "This door is tiny. I'd never fit through."); return; }
  p.plane = 'hut'; p.x = BRIDGE.hut - 48; p.crawl = 0; snd('hop'); const br = game.bridge;
  if (!br.power) sayNow(bro, "It's dark in here. Nothing works without power.");
  else if (!br.solved) { sayNow(bro, 'Four little windows with pictures in them. It wants a code!'); if (!br.saidCode) { br.saidCode = true; say(sis, 'Pictures? There are little pictures on our map pieces...'); } }
}
function hutKeys(p, dt) {
  const br = game.bridge, k = p.keys;
  if (hit(k.down)) { p.plane = 'street'; p.x = BRIDGE.hut - 48; snd('hop'); return; }
  if (br.down) return;
  if (!br.power) { if (hit(k.up) || hit(k.left) || hit(k.right)) { snd('no'); sayNow(bro, 'Nothing happens. No power!'); say(sis, 'Maybe there is a switch somewhere?'); } return; }
  if (!br.solved) {
    if (hit(k.left)) { br.sel = (br.sel + 3) % 4; snd('click'); }
    if (hit(k.right)) { br.sel = (br.sel + 1) % 4; snd('click'); }
    if (hit(k.up)) {
      br.dial[br.sel] = (br.dial[br.sel] + 1) % SYMBOLS.length; br.spin = 0.18; snd('dial');
      if (br.dial.every((v, i) => v === game.stamps[i])) { br.solved = true; snd('great'); burst(BRIDGE.hut, BASE - 330, 12); sayNow(bro, 'Click! The light went green. The lever is unlocked!'); say(sis, 'Then pull it! Hold it down!'); }
    }
    return;
  }
  br.lever = !!down[k.up];
}
function updateBridge(dt) {
  const br = game.bridge; br.spin = Math.max(0, (br.spin || 0) - dt);
  if (bro.plane !== 'hut') br.lever = false;
  if (br.down || !br.solved) return;
  const braking = players.some((p) => p.holding === 'brake');
  if (br.jammed) { // the safety brake has caught: it lets go when the lever and the brake handle are held together
    br.brakeT = br.lever && braking ? br.brakeT + dt : 0;
    if (br.lever && Math.floor(game.time * 2) !== Math.floor((game.time - dt) * 2)) snd('alarm');
    if (br.brakeT > 0.7) { br.jammed = false; br.released = true; snd('clunk'); snd('good'); burst(BRIDGE.power, FEET - 330, 8); sayNow(sis, 'The brake is off! Keep that lever down!'); }
    return;
  }
  if (!br.lever) return;
  const before = br.prog; br.prog = Math.min(1, br.prog + dt / BRIDGE.lower);
  if (Math.floor(br.prog * 14) !== Math.floor(before * 14)) snd('click');
  if (!br.released && br.prog >= BRIDGE.jam) { br.prog = BRIDGE.jam; br.jammed = true; br.brakeT = 0; game.shake = 0.6; snd('clunk'); snd('alarm'); sayNow(bro, 'It stopped! Something is holding the bridge!'); say(sis, 'A red light is flashing on the power post... there is a brake handle up here!'); }
  br.angle = 1.22 * (1 - br.prog);
  if (br.prog >= 1) {
    br.down = true; br.lever = false; game.shake = 0.8; snd('thump'); snd('fanfare'); const mid = (BRIDGE.river[0] + BRIDGE.river[1]) / 2;
    burst(mid, FEET - 60, 14); party(BRIDGE.river[0], BRIDGE.river[1], FEET - 200, 110);
    if (bro.plane === 'hut') { bro.plane = 'street'; bro.x = BRIDGE.hut - 48; }
    sis.cheer = bro.cheer = CHEER; sayNow(sis, 'The bridge is down! We did it!'); say(bro, 'Forest Park, here we come!');
  }
}
function drawBrake(c, t) { // the brake handle and its warning light, on the power post
  if (!inView(BRIDGE.power - 200, BRIDGE.power + 200)) return;
  const br = game.bridge, x = BRIDGE.power - 20, y = BASE + 12 - 330, held = players.some((p) => p.holding === 'brake');
  rrect(c, x - 12, y - 16, 24, 40, 4); fs(c, '#f2c94e', '#3a2618', 1.8); c.fillStyle = '#3a2618'; for (let i = 0; i < 3; i++) c.fillRect(x - 12, y - 10 + i * 12, 24, 4);
  c.save(); c.translate(x, y + 4); c.rotate(held || br.released ? 2.3 : 0.75); c.strokeStyle = '#2c2c34'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -30); c.stroke(); ell(c, 0, -32, 7, 7, '#f2c94e'); c.restore();
  if (br.jammed) { const on = Math.sin(t * 10) > 0; ell(c, x, y - 30, 8, 8, on ? '#ff4a3a' : '#7a2018'); if (on) soft(c, x, y - 30, 40, 40, '#ff4a3a', 0.6); }
}
function drawHutPanel(c, t) { // what the brother sees inside the hut: four picture dials, a lamp and the lever
  const br = game.bridge, w = 540, h = 330, x = Math.max(camX + 20, camX + VW - w - 30), y = 150;
  c.save(); c.fillStyle = 'rgba(20,12,6,.4)'; rrect(c, x + 8, y + 12, w, h, 18); c.fill();
  rrect(c, x, y, w, h, 18); fs(c, lg(c, 0, y, 0, y + h, '#6a5238', '#4a3824'), '#2a1a10', 4);
  rrect(c, x + 14, y + 14, w - 28, h - 28, 10); fs(c, br.power ? lg(c, 0, y, 0, y + h, '#c9a55c', '#a8843e') : '#3a3026', '#2a1a10', 2);
  for (const [sx, sy] of [[28, 28], [w - 28, 28], [28, h - 28], [w - 28, h - 28]]) ell(c, x + sx, y + sy, 5, 5, '#5a4214');
  c.textAlign = 'center'; c.fillStyle = br.power ? '#3a2618' : '#8a7a62'; c.font = 'italic 700 22px Georgia, serif'; c.fillText('BRIDGE CONTROLS', x + w / 2 - 50, y + 52);
  if (!br.power) { c.font = 'italic 600 19px Georgia, serif'; c.fillText('no power', x + w / 2 - 50, y + 170); }
  for (let i = 0; i < 4; i++) {
    const dx = x + 60 + i * 96, dy = y + 150, sel = br.power && !br.solved && br.sel === i;
    rrect(c, dx - 40, dy - 44, 80, 88, 10); fs(c, br.power ? '#fffbf0' : '#4a4034', sel ? '#c9402f' : '#2a1a10', sel ? 5 : 2.5);
    if (sel) { c.fillStyle = '#c9402f'; c.beginPath(); c.moveTo(dx - 10, dy - 54); c.lineTo(dx + 10, dy - 54); c.lineTo(dx, dy - 66 - Math.sin(t * 6) * 3); c.closePath(); c.fill(); }
    if (br.power) { c.save(); rrect(c, dx - 38, dy - 42, 76, 84, 8); c.clip(); drawIcon(c, SYMBOLS[br.dial[i]], dx, dy + (sel ? br.spin * 150 : 0), 2.1); c.restore(); }
    c.fillStyle = br.power ? '#3a2618' : '#8a7a62'; c.font = '700 15px Georgia, serif'; c.fillText(String(i + 1), dx, dy + 66);
  }
  // the lamp and the lever
  const lx = x + w - 78, ok = br.solved, lampCol = !br.power ? '#4a4034' : ok ? '#5adf6a' : '#ff4a3a';
  ell(c, lx, y + 60, 13, 13, '#2a1a10'); ell(c, lx, y + 60, 10, 10, lampCol); if (br.power) soft(c, lx, y + 60, 34, 34, lampCol, 0.45 + Math.sin(t * 5) * 0.15);
  rrect(c, lx - 12, y + 96, 24, 150, 10); fs(c, '#2a1a10');
  const ly = y + 110 + (br.down ? 1 : br.prog) * 120 + (br.lever && br.jammed ? Math.sin(t * 40) * 2 : 0);
  rrect(c, lx - 30, ly - 12, 60, 24, 10); fs(c, ok ? '#c9402f' : '#7a6a5a', '#2a1a10', 2.5);
  c.font = 'italic 700 13px Georgia, serif'; c.fillStyle = '#3a2618'; c.fillText(br.jammed ? 'BRAKE!' : 'lever', lx, y + 270);
  // what the keys do in here
  c.font = '600 16px Georgia, serif'; c.fillStyle = br.power ? '#3a2618' : '#b9a88a';
  c.fillText(!br.power ? '↓ come out' : ok ? 'hold ↑ : pull the lever      ↓ come out' : '← → pick a window     ↑ change the picture     ↓ come out', x + w / 2, y + h - 30);
  c.restore();
}

// ---------- hints: they unlock one by one while the siblings are on the same goal, and are read on the treasure map
const goalHints = (g) => (!g || !g[2] ? [] : typeof g[2] === 'function' ? g[2]() : g[2]);
function hintTier() { const n = goalHints(GOALS[game.goal]).length; return Math.min(n, HINT_TIMES.filter((s) => game.hint.t >= s).length); }
function drawHintChip(c, x, y, t) {
  if (hintTier() <= game.hint.seen || game.done || game.panel) return;
  const w = 372; c.save(); c.globalAlpha = 0.8 + Math.sin(t * 4) * 0.2; rrect(c, x, y, w, 40, 10); fs(c, '#fff3b8', '#8a6a3a', 2);
  c.beginPath(); circ(c, x + 24, y + 18, 9); fs(c, '#f2c94e', '#3a2618', 1.5); c.fillStyle = '#3a2618'; c.fillRect(x + 20, y + 28, 8, 5);
  c.font = 'italic 700 15px Georgia, serif'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText('A hint is ready: open the map (S or ↓)', x + 44, y + 26); c.restore();
}

// ---------- the treasure map: the trail, the four pieces with their pictures, and the hints in the margin
function drawTreasureMap(c, t) {
  const mw = 640, nw = 300, w = mw + nw, h = 470, inHut = bro.plane === 'hut';
  const x = inHut ? Math.max(camX + 16, camX + (VW - 600 - w) / 2) : camX + VW / 2 - w / 2, y = 140; parchment(c, x, y, w, h);
  game.hint.seen = Math.max(game.hint.seen, hintTier());
  c.save(); c.translate(x, y); c.textAlign = 'center';
  c.fillStyle = '#5a3a1e'; c.font = 'italic 700 30px Georgia, serif'; c.fillText('The Treasure Trail', mw / 2, 48);
  const stops = [[150, 345, 'home', 30], [255, 300, 'the city', 30], [380, 255, 'Old Bridge', 30], [480, 180, 'the forest', -20], [575, 285, 'X']]; // x, y, name, how far below the dot the name goes
  c.strokeStyle = '#8a5a2a'; c.lineWidth = 4; c.setLineDash([10, 9]); c.lineDashOffset = -t * 20; c.beginPath(); stops.forEach(([sx, sy], i) => (i ? c.lineTo(sx, sy) : c.moveTo(sx, sy))); c.stroke(); c.setLineDash([]);
  for (const [sx, sy, name, ly] of stops) { if (name === 'X') { c.strokeStyle = '#c9302a'; c.lineWidth = 7; c.beginPath(); c.moveTo(sx - 14, sy - 14); c.lineTo(sx + 14, sy + 14); c.moveTo(sx + 14, sy - 14); c.lineTo(sx - 14, sy + 14); c.stroke(); continue; } ell(c, sx, sy, 9, 9, '#8a5a2a'); c.fillStyle = '#5a3a1e'; c.font = 'italic 17px Georgia, serif'; c.fillText(name, sx, sy + ly); }
  c.fillStyle = '#5a3a1e'; c.font = 'italic 15px Georgia, serif'; c.fillText('"At the Old Bridge, the keeper wants four little pictures: first to fourth."', mw / 2, h - 30);
  // the four pieces: each has a numbered picture stamped in its corner
  const quads = [[0, 0], [mw / 2, 0], [0, h / 2], [mw / 2, h / 2]], corner = [[58, 104], [mw / 2 - 58, 104], [58, h / 2 - 96], [mw / 2 - 58, h / 2 - 96]];
  if (game.pieces.gust) {
    c.strokeStyle = 'rgba(138,106,58,.55)'; c.lineWidth = 2; c.setLineDash([5, 6]); c.beginPath(); c.moveTo(mw / 2, 8); c.lineTo(mw / 2, h - 8); c.moveTo(8, h / 2); c.lineTo(mw - 8, h / 2); c.stroke(); c.setLineDash([]);
    quads.forEach(([qx, qy], i) => {
      if (!game.pieces.got[i]) { c.fillStyle = 'rgba(40,25,15,.82)'; c.fillRect(qx + 4, qy + 4, mw / 2 - 8, h / 2 - 8); c.strokeStyle = '#d9b977'; c.setLineDash([8, 8]); c.lineWidth = 2; c.strokeRect(qx + 10, qy + 10, mw / 2 - 20, h / 2 - 20); c.setLineDash([]); c.fillStyle = '#d9b977'; c.font = 'italic 700 26px Georgia, serif'; c.fillText('missing piece', qx + mw / 4, qy + h / 4 + 10); return; }
      const sx = qx + corner[i][0], sy = qy + corner[i][1];
      c.beginPath(); circ(c, sx, sy, 34); fs(c, 'rgba(255,251,240,.9)', '#a0522d', 3); c.beginPath(); circ(c, sx, sy, 28); c.strokeStyle = 'rgba(160,82,45,.5)'; c.lineWidth = 1.5; c.stroke();
      drawIcon(c, SYMBOLS[game.stamps[i]], sx, sy, 1.45);
      c.beginPath(); circ(c, sx + 30, sy - 28, 13); fs(c, '#a0522d'); c.fillStyle = '#fffbf0'; c.font = '700 16px Georgia, serif'; c.textBaseline = 'middle'; c.fillText(String(i + 1), sx + 30, sy - 27); c.textBaseline = 'alphabetic';
    });
  }
  // the margin: hints for the goal they are on
  c.strokeStyle = 'rgba(138,106,58,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(mw + 8, 26); c.lineTo(mw + 8, h - 26); c.stroke();
  c.textAlign = 'left'; c.fillStyle = '#5a3a1e'; c.font = 'italic 700 24px Georgia, serif'; c.fillText('Hints', mw + 30, 52);
  const hints = goalHints(GOALS[game.goal]), tier = hintTier(); let hy = 86;
  c.font = 'italic 16px Georgia, serif';
  if (!hints.length) { c.fillStyle = '#8a6a3a'; wrap(c, 'Nothing tricky here. Just keep going!', nw - 56).forEach((ln) => { c.fillText(ln, mw + 30, hy); hy += 22; }); }
  hints.forEach((txt, i) => {
    if (i < tier) { c.fillStyle = '#a0522d'; c.font = '700 16px Georgia, serif'; c.fillText((i + 1) + '.', mw + 30, hy); c.fillStyle = '#3a2618'; c.font = 'italic 16px Georgia, serif'; wrap(c, txt, nw - 76).forEach((ln) => { c.fillText(ln, mw + 52, hy); hy += 22; }); hy += 10; }
    else if (i === tier) { const left = Math.max(1, Math.ceil(HINT_TIMES[i] - game.hint.t)); c.fillStyle = '#8a6a3a'; c.font = 'italic 15px Georgia, serif'; wrap(c, (i ? 'Another hint' : 'A hint') + ' appears here in ' + left + ' s, if you want one.', nw - 56).forEach((ln) => { c.fillText(ln, mw + 30, hy); hy += 21; }); }
  });
  c.restore();
}

// ---------- Old Town: bus tickets, the painter's picture game, the ladder on wheels and the water jets, the cafe parasols
function giveTicket(x, y) { game.tickets++; pop(x, y, 'Bus ticket ' + game.tickets + ' of 2', 'ticket'); burst(x, y, 10); snd('piece'); game.hint.t = 0; game.hint.seen = 0; }
function drawTicketHud(c, x, y) {
  c.save(); rrect(c, x, y, 168, 40, 10); fs(c, 'rgba(255,248,230,.94)', '#8a6a3a', 2);
  c.fillStyle = '#8a5a2a'; c.font = 'italic 700 15px Georgia, serif'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText('TICKETS', x + 14, y + 26);
  for (let i = 0; i < 2; i++) { if (i < game.tickets) drawIcon(c, 'ticket', x + 108 + i * 36, y + 20, 0.9); else { rrect(c, x + 94 + i * 36, y + 11, 28, 18, 3); c.strokeStyle = '#b9a07a'; c.setLineDash([3, 3]); c.lineWidth = 1.5; c.stroke(); c.setLineDash([]); } }
  c.restore();
}

// the picture game: four paintings are shown, then turn round; each sibling stands at the one that hides their own picture
function easelRound() {
  const e = game.easel, mix = (a) => a.map((v) => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map((v) => v[1]), spots = mix([0, 1, 2, 3]);
  e.layout = mix(SYMBOLS.map((_, i) => i)).slice(0, 4); e.want = [spots[0], spots[1]]; e.pick = [null, null]; e.phase = 'show'; e.t = 0; e.face = 0;
}
function easelStart(p) {
  const e = game.easel; if (e.phase !== 'idle') return;
  snd('tap'); e.round = 0; easelRound();
}
function easelPick(p, i) {
  const e = game.easel; if (e.phase !== 'pick') return;
  e.pick[p === sis ? 0 : 1] = i; snd('click'); p.reachT = 0.3;
  if (e.pick[0] !== null && e.pick[1] !== null) { e.phase = 'check'; e.t = 0; }
}
function updateEasels(dt) {
  const e = game.easel, O = OLDTOWN; e.t += dt;
  const front = e.phase === 'show' || e.phase === 'wrong' || e.phase === 'right' || e.phase === 'won';
  e.face += ((front ? 1 : 0) - e.face) * Math.min(1, dt * 9);
  if (e.phase === 'show' && e.t > O.show) { e.phase = 'pick'; e.t = 0; snd('click'); if (!e.saidPick) { e.saidPick = true; say(bro, 'They turned round! Which one was which?'); } }
  else if (e.phase === 'check' && e.t > 0.45) {
    if (e.pick[0] === e.want[0] && e.pick[1] === e.want[1]) { e.phase = 'right'; e.t = 0; e.round++; snd('good'); sis.cheer = bro.cheer = 0.6; burst(O.easels[e.want[0]], BASE - 300, 6); burst(O.easels[e.want[1]], BASE - 300, 6); }
    else { e.phase = 'wrong'; e.t = 0; e.pick = [null, null]; snd('no'); sayNow(pick([sis, bro]), pick(['Oops! Not quite. Look again...', 'Wrong painting! Have another look.', 'Hmm, no. Quick, remember them this time!'])); }
  }
  else if (e.phase === 'wrong' && e.t > 2.6) { e.phase = 'pick'; e.t = 0; snd('click'); }
  else if (e.phase === 'right' && e.t > 1.5) {
    if (e.round < O.rounds) { easelRound(); return; }
    e.phase = 'won'; e.won = true; snd('great'); party(O.prize - 160, O.prize + 160, BASE - 200, 40); giveTicket(O.prize, BASE - 110);
    sayNow(bro, 'We won! And the prize is... a bus ticket!'); say(sis, game.tickets >= 2 ? 'That makes two. To the bus stop!' : 'One ticket. We need one more.');
  }
}
function drawEasels(c, t) {
  const O = OLDTOWN, e = game.easel, g = BASE + 20; if (!inView(O.board - 200, O.prize + 200)) return;
  const ink = '#3a2618', wood = '#b5915c', cols = [sis.col, bro.col], shown = e.phase !== 'idle' && e.face > 0.5, sx = Math.max(0.04, Math.abs(2 * e.face - 1));
  // the board that says what to look for
  const bx = O.board, by = g - 380;
  c.strokeStyle = '#6b4e30'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx - 60, g); c.lineTo(bx - 40, by + 150); c.moveTo(bx + 60, g); c.lineTo(bx + 40, by + 150); c.stroke();
  soft(c, bx, g + 2, 90, 9, '#2a1a0e', 0.28);
  rrect(c, bx - 112, by, 224, 164, 10); fs(c, lg(c, 0, by, 0, by + 164, '#8a5a3a', '#6b4028'), ink, 2.5); rrect(c, bx - 100, by + 12, 200, 140, 6); fs(c, '#fffbf0', ink, 1.5);
  c.textAlign = 'center'; c.fillStyle = ink;
  if (e.phase === 'idle') { c.font = 'italic 700 24px Georgia, serif'; c.fillText('Picture game', bx, by + 56); c.font = 'italic 15px Georgia, serif'; c.fillText('Remember the paintings.', bx, by + 88); c.fillText('Win a prize!', bx, by + 110); for (let i = 0; i < 3; i++) drawIcon(c, ['star', 'fish', 'moon'][i], bx - 44 + i * 44, by + 134, 0.55); }
  else if (e.phase === 'show') { c.font = 'italic 700 24px Georgia, serif'; c.fillText('Remember!', bx, by + 70); const u = clamp01(1 - e.t / O.show); rrect(c, bx - 70, by + 96, 140, 14, 7); fs(c, '#e8dcc0', ink, 1.2); rrect(c, bx - 70, by + 96, 140 * u, 14, 7); fs(c, '#d9534a'); }
  else if (e.phase === 'won') { c.font = 'italic 700 26px Georgia, serif'; c.fillText('Well done!', bx, by + 74); drawIcon(c, 'ticket', bx, by + 112, 1.4); }
  else if (e.phase === 'right') { c.font = 'italic 700 24px Georgia, serif'; c.fillStyle = '#4f8a5a'; c.fillText('Right!', bx, by + 70); c.fillStyle = ink; c.font = 'italic 16px Georgia, serif'; c.fillText(e.round + ' of ' + O.rounds, bx, by + 104); }
  else for (let k = 0; k < 2; k++) { // the two pictures to find: hers in her colour, his in his
    const x = bx - 48 + k * 96; rrect(c, x - 38, by + 26, 76, 84, 8); fs(c, '#fffbf0', cols[k], 6); drawIcon(c, SYMBOLS[e.layout[e.want[k]]], x, by + 66, 1.7);
    c.font = '700 14px Georgia, serif'; c.fillStyle = cols[k]; c.fillText(k ? 'Brother' : 'Sister', x, by + 134); c.fillStyle = ink;
  }
  c.textAlign = 'left';
  // the four easels
  O.easels.forEach((x, i) => {
    soft(c, x, g + 2, 60, 8, '#2a1a0e', 0.28);
    c.strokeStyle = '#8a6844'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 44, g); c.lineTo(x - 10, g - 372); c.moveTo(x + 44, g); c.lineTo(x + 10, g - 372); c.moveTo(x, g - 14); c.lineTo(x, g - 372); c.stroke();
    c.fillStyle = '#6b4e30'; c.fillRect(x - 54, g - 240, 108, 8);
    c.save(); c.translate(x, g - 300); c.scale(sx, 1);
    rrect(c, -48, -58, 96, 112, 4);
    if (shown) { fs(c, '#fffbf0', ink, 2.5); rrect(c, -40, -50, 80, 96, 2); c.strokeStyle = 'rgba(138,106,58,.5)'; c.lineWidth = 1.5; c.stroke(); drawIcon(c, SYMBOLS[e.layout[i]], 0, -2, 2.1); }
    else { fs(c, wood, ink, 2.5); c.strokeStyle = 'rgba(58,38,24,.45)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-48, -58); c.lineTo(48, 54); c.moveTo(48, -58); c.lineTo(-48, 54); c.stroke(); if (e.phase === 'idle') { c.fillStyle = 'rgba(58,38,24,.6)'; c.font = 'italic 700 40px Georgia, serif'; c.textAlign = 'center'; c.fillText('?', 0, 12); c.textAlign = 'left'; } }
    c.restore();
    // who chose it, and after a round, whose picture it really was
    for (let k = 0; k < 2; k++) {
      if (e.pick[k] === i) { const px = x + (k ? 30 : -30), py = g - 376; c.beginPath(); circ(c, px, py, 15); fs(c, cols[k], '#fff6dc', 2.5); c.fillStyle = '#fff'; c.font = '700 15px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(k ? 'B' : 'S', px, py + 1); c.textBaseline = 'alphabetic'; c.textAlign = 'left'; }
      if ((e.phase === 'wrong' || e.phase === 'right') && e.want[k] === i) { rrect(c, x - 54 * sx, g - 364, 108 * sx, 124, 6); c.strokeStyle = cols[k]; c.lineWidth = 5; c.stroke(); }
    }
  });
  // the prize box
  const px = O.prize, open = e.phase === 'won';
  soft(c, px, g + 2, 56, 8, '#2a1a0e', 0.3);
  rrect(c, px - 44, g - 46, 88, 46, 6); fs(c, lg(c, 0, g - 46, 0, g, '#b5713c', '#8a4e24'), ink, 2.5); c.fillStyle = '#e2b84a'; c.fillRect(px - 44, g - 30, 88, 6); rrect(c, px - 8, g - 36, 16, 18, 3); fs(c, '#e2b84a', ink, 1.5);
  c.save(); c.translate(px - 44, g - 46); c.rotate(open ? -1.1 : 0); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(44, -34, 88, 0); c.closePath(); fs(c, '#c98a4a', ink, 2.5); c.restore();
  if (open) soft(c, px, g - 60, 60, 40, '#fff3b8', 0.5 + Math.sin(t * 4) * 0.15);
  else { c.fillStyle = '#fffbf0'; c.font = 'italic 700 13px Georgia, serif'; c.textAlign = 'center'; c.fillText('PRIZE', px, g - 54); c.textAlign = 'left'; }
}

// the water jets: each one is quiet, then bubbles, then spouts. jetSafe says how many seconds until it next spouts.
const jetU = (i) => (game.time + i * 1.4) % OLDTOWN.period;
function jetState(i) { const O = OLDTOWN, u = jetU(i), quiet = O.period - O.warn - O.on; return u < quiet ? 'quiet' : u < quiet + O.warn ? 'warn' : 'on'; }
function jetSafe(i) { return jetState(i) === 'on' ? 0 : OLDTOWN.period - OLDTOWN.on - jetU(i); }
function updateOldTown(dt) {
  updateEasels(dt);
  const O = OLDTOWN, ct = game.cart, pr = game.para;
  O.jets.forEach((jx, i) => {
    if (jetState(i) !== 'on') return;
    for (const p of players) if (p.plane === 'street' && p.stun <= 0 && Math.abs(p.x - jx) < 42) {
      p.stun = 0.9; p.x = jx - 110; p.dir = 1; game.soaks++; snd('splash'); spray(jx, FEET - 60, 16, 300, 300);
      sayNow(p, pick(['Pffft! Soaked!', 'Eek! That is COLD!', 'Blub! Right in the face!'])); if (game.soaks === 1) say(other(p), 'Ha ha! It bubbles just before it spouts. Wait for it to stop!');
    }
  });
  // the ladder on wheels: it only rolls while both of them push
  ct.nag = Math.max(0, ct.nag - dt);
  if (!ct.docked) {
    const push = players.filter((p) => p.plane === 'street' && p.stun <= 0 && p.x >= ct.x - 66 && p.x <= ct.x - 40 && down[p.keys.right]);
    if (push.length === 2) {
      const before = ct.x; ct.x = Math.min(O.dock, ct.x + O.cartSpeed * dt);
      if (Math.floor(ct.x / 70) !== Math.floor(before / 70)) snd('creak');
      if (!ct.saidRoll) { ct.saidRoll = true; sayNow(sis, 'It is rolling! Keep pushing... and watch out for the water!'); }
      if (ct.x >= O.dock) { ct.docked = true; snd('clunk'); game.shake = 0.3; sayNow(sis, 'There. It is up against the cafe terrace now.'); if (!pr.got) say(bro, 'Look up! A bus ticket, stuck on that shop sign!'); }
    } else if (push.length === 1 && ct.nag <= 0) { ct.nag = 6; snd('no'); sayNow(push[0], pick(['Hnnngh! It will not budge. Help me push!', 'Too heavy for one. Push with me!'])); }
    else if (!ct.seen && players.some((p) => p.plane === 'street' && Math.abs(p.x - ct.x) < 260)) { ct.seen = true; say(bro, 'A ladder on wheels! It is right in the way.'); }
  }
  // the parasols: one stays open while its handle is held, or while she stands on it
  const on = sis.plane === 'tops' ? paraIndex(sis.x) : -1;
  O.parasols.forEach((_, i) => {
    const held = players.some((p) => p.holding === 'para' + i), was = pr.open[i];
    pr.open[i] = i === on ? 1 : clamp01(pr.open[i] + (held ? 1.5 : -0.8) * dt);
    if (was < 0.9 && pr.open[i] >= 0.9) snd('boing'); if (held && Math.floor(game.time * 5) !== Math.floor((game.time - dt) * 5) && pr.open[i] < 1) snd('click');
  });
}
const paraTop = () => BASE + 16 - 286; // where feet stand on an open parasol
function paraIndex(x) { const xs = OLDTOWN.parasols; let b = 0; for (let i = 1; i < xs.length; i++) if (Math.abs(xs[i] - x) < Math.abs(xs[b] - x)) b = i; return b; }
function paraLimits(p) { // she can walk across the open parasols that touch the one she is on
  const pr = game.para, xs = OLDTOWN.parasols; let a = paraIndex(p.x), b = a;
  while (a > 0 && pr.open[a - 1] >= 0.9) a--; while (b < xs.length - 1 && pr.open[b + 1] >= 0.9) b++;
  return [xs[a] - 84, xs[b] + 84];
}
function ladderClimb(p) {
  const pr = game.para;
  if (p === bro) { snd('no'); p.cheer = 0.4; sayNow(bro, 'I climbed right to the top, and I still cannot reach the parasol. You try, sis!'); return; }
  if (pr.open[0] < 0.9) { snd('no'); sayNow(sis, 'Nothing to step onto up there. If that first parasol was open...'); return; }
  p.plane = 'tops'; p.x = OLDTOWN.parasols[0] - 70; p.y = paraTop(); p.dir = 1; snd('hop');
  if (!pr.saidUp) { pr.saidUp = true; sayNow(sis, 'I am standing on a parasol! Do not let it close... open the next one!'); }
}
function paraDown(p) { p.plane = 'street'; p.y = FEET; snd('hop'); }
function paraTicket(p) { const pr = game.para, [tx, ty] = OLDTOWN.ticket; pr.got = true; p.reachT = 0.6; p.cheer = 0.7; giveTicket(tx, ty + 60); sayNow(sis, game.tickets >= 2 ? 'Got it! Two tickets. To the bus stop!' : 'Got it! One ticket. We need one more.'); }
function drawStreetWorks(c, t) { // the jets, the ladder on wheels, the parasols and the shop sign with the ticket
  const O = OLDTOWN, ct = game.cart, pr = game.para, ink = '#3a2618'; if (!inView(O.cartStart - 300, O.ticket[0] + 300)) return;
  // the jets
  O.jets.forEach((jx, i) => {
    const st = jetState(i), gy = FEET + 12, O2 = OLDTOWN;
    c.beginPath(); c.ellipse(jx, gy, 26, 7, 0, 0, TAU); fs(c, '#8a8478', '#3c3a40', 2); c.beginPath(); c.ellipse(jx, gy, 14, 3.6, 0, 0, TAU); fs(c, '#2c2a30');
    c.beginPath(); c.ellipse(jx, gy + 1, 50, 11, 0, 0, TAU); c.fillStyle = 'rgba(143,192,214,.28)'; c.fill();
    let h = 0; if (st === 'warn') h = 18 + Math.abs(Math.sin(t * 22 + i)) * 26; else if (st === 'on') { const u = (jetU(i) - (O2.period - O2.on)) / O2.on; h = 330 * Math.min(1, u * 6, (1 - u) * 5); }
    if (h > 0) {
      c.lineCap = 'round'; c.strokeStyle = 'rgba(214,236,246,.85)'; c.lineWidth = st === 'on' ? 20 : 9; c.setLineDash([16, 8]); c.lineDashOffset = t * 260; c.beginPath(); c.moveTo(jx, gy - 2); c.lineTo(jx + Math.sin(t * 9 + i) * 3, gy - h); c.stroke(); c.setLineDash([]);
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = st === 'on' ? 7 : 3; c.beginPath(); c.moveTo(jx, gy - 2); c.lineTo(jx, gy - h); c.stroke();
      if (st === 'on') { soft(c, jx, gy - h, 46, 26, '#e6f4fa', 0.8); for (let k = 0; k < 6; k++) { const a = t * 5 + k * 1.05, r = 20 + ((t * 90 + k * 37) % 70); ell(c, jx + Math.cos(a) * r, gy - h + 10 + ((t * 160 + k * 53) % 120), 3.5, 5, '#d6ecf6', 0.75); } }
    }
  });
  // the parasols, each over a little table
  const g = BASE + 16, PCOL = ['#d9534a', '#4f83ad', '#e2b84a'];
  O.parasols.forEach((x, i) => {
    const o = ease(pr.open[i]), w = lerp(15, 102, o), rim = g - 300 + lerp(128, 40, o), held = players.some((p) => p.holding === 'para' + i);
    soft(c, x, g + 2, 60, 8, '#2a1a0e', 0.28);
    c.fillStyle = '#6b4e30'; c.fillRect(x - 4, g - 70, 8, 70); c.beginPath(); c.ellipse(x, g - 72, 52, 9, 0, 0, TAU); fs(c, '#e6ddce', '#5a5046', 2); c.beginPath(); c.ellipse(x, g - 1, 22, 5, 0, 0, TAU); fs(c, '#5a5046');
    c.fillStyle = lg(c, x - 5, 0, x + 5, 0, '#d8cfc0', '#958b7c'); c.fillRect(x - 5, g - 308, 10, 238); c.strokeStyle = '#5a5046'; c.lineWidth = 1.5; c.strokeRect(x - 5, g - 308, 10, 238);
    c.save(); c.translate(x + 7, g - 132); c.rotate(held ? t * 9 : 0.6); c.strokeStyle = '#2c2c34'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(14, 0); c.stroke(); ell(c, 14, 0, 4.5, 4.5, '#c9402f'); c.restore();
    for (let k = 0; k < 6; k++) { const x0 = x - w + 2 * w * k / 6, x1 = x - w + 2 * w * (k + 1) / 6; c.beginPath(); c.moveTo(x, g - 316); c.lineTo(x0, rim); c.quadraticCurveTo((x0 + x1) / 2, rim + 13 * o + 3, x1, rim); c.closePath(); fs(c, k % 2 ? '#fffbf0' : PCOL[i % 3], 'rgba(58,38,24,.55)', 1.5); }
    c.beginPath(); c.moveTo(x - w, rim); c.lineTo(x, g - 316); c.lineTo(x + w, rim); c.strokeStyle = ink; c.lineWidth = 2.5; c.lineJoin = 'round'; c.stroke(); ell(c, x, g - 318, 5, 5, '#e2b84a');
  });
  // the shop sign, and the ticket caught on it
  const [tx, ty] = O.ticket;
  c.strokeStyle = '#2c2c34'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(tx + 84, ty + 12); c.lineTo(tx - 2, ty + 12); c.moveTo(tx + 84, ty + 52); c.quadraticCurveTo(tx + 60, ty + 20, tx + 30, ty + 12); c.stroke();
  c.lineWidth = 2; c.beginPath(); c.moveTo(tx + 40, ty + 12); c.lineTo(tx + 40, ty + 30); c.stroke(); c.beginPath(); circ(c, tx + 40, ty + 58, 28); fs(c, '#fffbf0', ink, 2.5); drawIcon(c, 'bell', tx + 40, ty + 58, 1.15);
  if (!pr.got) { c.save(); c.translate(tx, ty); c.rotate(-0.3 + Math.sin(t * 5) * 0.18); drawIcon(c, 'ticket', 0, 0, 1.25); c.restore(); const k = Math.max(0, Math.sin(t * 2.6)); star(c, tx + 14, ty - 14, 8 + k * 7, t * 2, 0.4 + k * 0.5); }
  if (sis.plane === 'tops') drawSib(sis, t);
  // the ladder on wheels
  const x = ct.x, cg = FEET + 10, spin = ct.x / 16;
  soft(c, x, cg + 3, 80, 9, '#2a1a0e', 0.3);
  c.strokeStyle = '#8a6844'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 30, cg - 30); c.lineTo(x - 6, cg - 262); c.moveTo(x + 44, cg - 30); c.lineTo(x + 20, cg - 262); c.stroke();
  c.lineWidth = 5; for (let k = 1; k <= 6; k++) { const u = k / 7; c.beginPath(); c.moveTo(lerp(x - 30, x - 6, u), lerp(cg - 30, cg - 262, u)); c.lineTo(lerp(x + 44, x + 20, u), lerp(cg - 30, cg - 262, u)); c.stroke(); }
  rrect(c, x - 16, cg - 272, 46, 12, 4); fs(c, '#b5915c', ink, 2);
  rrect(c, x - 62, cg - 38, 124, 16, 5); fs(c, lg(c, 0, cg - 38, 0, cg - 22, '#c9534a', '#9a2a20'), ink, 2.5);
  c.strokeStyle = '#2c2c34'; c.lineWidth = 5; c.beginPath(); c.moveTo(x - 56, cg - 36); c.lineTo(x - 70, cg - 128); c.stroke(); c.lineWidth = 7; c.beginPath(); c.moveTo(x - 78, cg - 128); c.lineTo(x - 62, cg - 128); c.stroke();
  for (const wx of [x - 40, x + 40]) { c.beginPath(); circ(c, wx, cg - 14, 15); fs(c, '#3c3a40', '#1c1a20', 2.5); c.strokeStyle = '#b9b0a4'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(wx + Math.cos(spin) * 11, cg - 14 + Math.sin(spin) * 11); c.lineTo(wx - Math.cos(spin) * 11, cg - 14 - Math.sin(spin) * 11); c.moveTo(wx - Math.sin(spin) * 11, cg - 14 + Math.cos(spin) * 11); c.lineTo(wx + Math.sin(spin) * 11, cg - 14 - Math.cos(spin) * 11); c.stroke(); }
}

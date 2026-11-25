'use strict';
// The chapter map (map.html): a picture of the city with three stops, one for each level of Chapter 1. No words.
//   - a finished stop has a green tick; the next one to play pulses, with an arrow over it; later ones have a padlock
//   - coming from a level that has just been finished (map.html?from=park), its tick pops and the siblings walk on
//     to the next stop
//   - jump (or Enter, or a tap on the stop) starts the stop the siblings stand at; left and right, or a tap, choose
//     any finished stop to play it again
//   - when all three are finished, a card celebrates the end of the chapter (once), and then the mist lifts from the
//     forest on the far side of the river: where Chapter 2 will be. It cannot be played yet (a padlock).
// What is finished comes from shared/chapter.js, which keeps it in the browser. map.html?reset=1 forgets it all.
const game = { sparks: [], queue: [], bubble: null, objective: '' }; let camX = 0; // what shared/stage.js expects of a page
if (QS.get('reset')) CHAPTER.reset();
const LV = CHAPTER.LEVELS, FROM_ID = QS.get('from'), idOf = (id) => LV.findIndex((l) => l.id === id);
const MAP = (() => {
  const s = CHAPTER.state(), all = LV.every((l) => s.done[l.id]), nextI = all ? LV.length - 1 : LV.findIndex((l) => !s.done[l.id]), fromI = idOf(FROM_ID);
  const arriving = fromI >= 0 && s.done[LV[fromI].id];
  return { done: LV.map((l) => !!s.done[l.id]), all, next: nextI, sel: nextI, pos: arriving ? fromI : nextI, target: nextI, pop: arriving ? fromI : -1, popT: arriving ? 0 : 9,
    mode: arriving ? 'arrive' : all && !s.ended ? 'card' : 'idle', t: 0, cardT: 0, tease: s.ended ? 1 : 0, wiggle: 0, going: null, goT: 0, confetti: [] };
})();
const sibs = [makePlayer('sister', 0, 0, 1), makePlayer('brother', 0, 0, 1)];
for (const p of sibs) p.scale = 0.62;
const snd = (name) => { if (typeof sfx === 'function') sfx(name); };

// ---------- where things are on the map (it stretches with the screen)
const stops = () => [{ x: VW * 0.17, y: 610 }, { x: VW * 0.42, y: 470 }, { x: VW * 0.67, y: 610 }, { x: VW * 0.9, y: 470 }]; // park, city, canal, and the forest
const along = (P, u) => { const i = clamp(Math.floor(u), 0, P.length - 2), k = u - i; return { x: lerp(P[i].x, P[i + 1].x, k), y: lerp(P[i].y, P[i + 1].y, k) - Math.sin(k * Math.PI) * 26 }; };
const playable = (i) => i < LV.length && (MAP.done[i] || i === MAP.next);

// ---------- starting a level, choosing one
function start(i) {
  if (MAP.going !== null || !playable(i)) { MAP.wiggle = 0.5; snd('no'); return; }
  MAP.sel = i; MAP.going = i; MAP.goT = 0; snd('good');
}
function confetti(n) { for (let i = 0; i < n; i++) MAP.confetti.push({ x: VW * (0.2 + Math.random() * 0.6), y: 120 + Math.random() * 160, vx: (Math.random() - 0.5) * 260, vy: -80 - Math.random() * 200, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 14, life: 3.4 + Math.random() * 1.6, col: ['#d9534a', '#f2c94e', '#4b86b8', '#6d9b45', '#e8728a', '#fffbf0'][i % 6] }); }
function press() { // jump, Enter, or a tap that is not on a stop
  if (MAP.mode === 'card') { if (MAP.cardT > 1.2) { MAP.mode = 'tease'; MAP.t = 0; CHAPTER.ended(true); snd('wind'); } }
  else if (MAP.mode === 'idle') start(MAP.sel);
}
cv.addEventListener('pointerdown', (e) => {
  const x = e.clientX * DPR / S, y = e.clientY * DPR / S, P = stops();
  if (typeof SOUND !== 'undefined' && SOUND.resume) SOUND.resume();
  if (MAP.mode !== 'idle') { press(); return; }
  const i = P.findIndex((s) => Math.hypot(s.x - x, s.y - y) < 120);
  if (i < 0) return; if (i >= LV.length || !playable(i)) { MAP.wiggle = 0.5; MAP.wigI = i; snd('no'); return; }
  start(i);
});

// ---------- every frame
let last = performance.now();
function update(dt) {
  MAP.t += dt; MAP.popT += dt; MAP.wiggle = Math.max(0, MAP.wiggle - dt);
  const jump = ['KeyW', 'ArrowUp', 'Enter', 'Space'].some((k) => hit(k)), dir = (hit('KeyD') || hit('ArrowRight') ? 1 : 0) - (hit('KeyA') || hit('ArrowLeft') ? 1 : 0);
  if (MAP.mode === 'arrive') { // the tick pops, then they walk on to the next stop
    if (MAP.pop >= 0 && MAP.popT > 0.25 && !MAP.popped) { MAP.popped = true; snd('great'); const s = stops()[MAP.pop]; burst(s.x, s.y - 60, 12); }
    if (MAP.t > 1.3) { const d = MAP.target - MAP.pos; MAP.pos += clamp(d, -dt * 0.55, dt * 0.55); if (Math.abs(d) < 0.001) { MAP.mode = MAP.all && !CHAPTER.ended() ? 'card' : 'idle'; MAP.t = 0; if (MAP.mode === 'card') { snd('fanfare'); confetti(80); } } }
  } else if (MAP.mode === 'card') {
    if (MAP.cardT === 0 && !MAP.confetti.length) { snd('fanfare'); confetti(80); }
    MAP.cardT += dt; if (jump) press();
  } else if (MAP.mode === 'tease') { // the mist lifts from the forest, and they walk a little way towards it
    MAP.tease = Math.min(1, MAP.tease + dt / 2.4); MAP.pos = Math.min(LV.length - 1 + 0.38, MAP.pos + dt * 0.2);
    if (MAP.tease >= 1 && MAP.t > 3.2) { MAP.mode = 'idle'; for (const p of sibs) p.cheer = CHEER; snd('good'); }
  } else if (MAP.going === null) {
    if (dir) { let i = MAP.sel + dir; while (i >= 0 && i < LV.length && !playable(i)) i += dir; if (i >= 0 && i < LV.length) { MAP.sel = i; snd('tap'); } else { MAP.wiggle = 0.5; MAP.wigI = MAP.sel + dir; } }
    if (jump) press();
    MAP.pos += clamp(MAP.sel - MAP.pos, -dt * 1.6, dt * 1.6); // they walk to whichever stop is chosen
  }
  if (MAP.going !== null) { MAP.pos += clamp(MAP.going - MAP.pos, -dt * 2.2, dt * 2.2); MAP.goT += dt; if (MAP.goT > 0.7 && Math.abs(MAP.going - MAP.pos) < 0.01) { const l = LV[MAP.going]; location.href = CHAPTER.address(l, MAP.done[MAP.going]); MAP.goT = -99; } }
  // the two of them, side by side on the path
  const P = stops(), here = along(P, MAP.pos), moving = Math.abs(here.x - (MAP.lastX === undefined ? here.x : MAP.lastX)) > 0.2, way = Math.sign(here.x - (MAP.lastX === undefined ? here.x : MAP.lastX)); MAP.lastX = here.x;
  sibs.forEach((p, i) => { p.x = here.x + (i ? 38 : -38); p.y = here.y + 236; if (way) p.dir = way; else if (MAP.mode === 'idle') p.dir = i ? -1 : 1; animate(p, sibs[1 - i], moving, dt * (moving ? 1.6 : 1)); });
  for (const f of MAP.confetti) { f.life -= dt; f.vy += 420 * dt; f.vx *= 1 - dt * 1.2; f.x += f.vx * dt + Math.sin(f.life * 9 + f.rot) * 40 * dt; f.y += Math.min(f.vy, 170) * dt; f.rot += f.spin * dt; }
  MAP.confetti = MAP.confetti.filter((f) => f.life > 0);
  updateTalk(dt); endInput();
}

// ---------- drawing
function tick(c, x, y, s, a = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = a; c.beginPath(); circ(c, 0, 0, 24); fs(c, '#6d9b45', '#fffbf0', 4); c.strokeStyle = '#fffbf0'; c.lineWidth = 7; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-11, 1); c.lineTo(-3, 9); c.lineTo(12, -8); c.stroke(); c.restore(); }
function padlock(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.arc(0, -8, 10, Math.PI, 0); c.stroke(); rrect(c, -15, -8, 30, 24, 5); fs(c, '#d9b55c', INK, 3); ell(c, 0, 3, 3.5, 3.5, INK); c.restore(); }
function drawPaper(c, t, P) { // the city, drawn like a map on old paper: the park, streets and houses, the canal, the river and the forest
  c.fillStyle = '#2a1c10'; c.fillRect(0, 0, VW, VH);
  const x0 = 46, y0 = 150, w = VW - 92, h = 800; parchment(c, x0, y0, w, h);
  c.save(); c.beginPath(); c.rect(x0 + 6, y0 + 6, w - 12, h - 12); c.clip();
  // streets: pale lines
  c.strokeStyle = 'rgba(138,106,58,.22)'; c.lineWidth = 14; c.lineCap = 'round';
  for (let i = 0; i < 7; i++) { const yy = y0 + 70 + i * 112; c.beginPath(); c.moveTo(VW * 0.28, yy + Math.sin(i) * 14); c.lineTo(VW * 0.8, yy + Math.cos(i) * 18); c.stroke(); }
  for (let i = 0; i < 6; i++) { const xx = VW * (0.3 + i * 0.095); c.beginPath(); c.moveTo(xx + Math.sin(i * 2) * 10, y0 + 30); c.lineTo(xx - Math.cos(i) * 22, y0 + h - 30); c.stroke(); }
  // the park: a green patch with little trees
  c.beginPath(); c.ellipse(P[0].x - 10, P[0].y + 40, VW * 0.15, 250, 0.1, 0, TAU); fs(c, 'rgba(126,165,81,.5)', 'rgba(74,110,50,.5)', 3);
  for (const [dx, dy, k] of [[-150, -120, 1.6], [-70, 150, 1.4], [120, -150, 1.5], [150, 110, 1.7], [-190, 60, 1.3], [40, 210, 1.5]]) drawIcon(c, 'tree', P[0].x + dx * VW / 1920, P[0].y + dy, k);
  // houses around the middle stop
  const rnd = rng(77);
  for (let i = 0; i < 26; i++) { const hx = VW * (0.29 + rnd() * 0.5), hy = y0 + 60 + rnd() * (h - 160), s = 0.8 + rnd() * 0.5; if (P.slice(0, 3).some((p) => Math.hypot(p.x - hx, p.y + 60 - hy) < 190)) continue; c.save(); c.translate(hx, hy); c.scale(s, s); c.beginPath(); c.rect(-16, -6, 32, 24); fs(c, ['#e9c9a0', '#d9a58a', '#cfd6e0', '#e6dcc6'][i % 4], 'rgba(58,38,24,.55)', 2); c.beginPath(); c.moveTo(-20, -6); c.lineTo(0, -24); c.lineTo(20, -6); c.closePath(); fs(c, ['#b0584a', '#6a7890', '#8a6a4a'][i % 3], 'rgba(58,38,24,.55)', 2); c.restore(); }
  // the canal, winding past the third stop, and the river with its bridge
  const water = (pts, wd) => { c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i += 2) c.quadraticCurveTo(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]); c.strokeStyle = 'rgba(63,106,130,.55)'; c.lineWidth = wd + 8; c.stroke(); c.strokeStyle = '#9cc6da'; c.lineWidth = wd; c.stroke(); };
  water([[VW * 0.5, y0 - 20], [VW * 0.56, y0 + 300], [VW * 0.63, P[2].y + 150], [VW * 0.7, P[2].y + 190], [VW * 0.795, P[2].y + 150]], 34);
  const rx = VW * 0.795; water([[rx + 14, y0 - 20], [rx - 26, y0 + 260], [rx, y0 + 420], [rx + 30, y0 + 600], [rx - 6, y0 + h + 20]], 58);
  const by = lerp(P[2].y, P[3].y, 0.55) + 150; c.save(); c.translate(rx, by); c.rotate(-0.12); rrect(c, -62, -15, 124, 30, 6); fs(c, '#c9a36a', INK, 3); c.strokeStyle = INK; c.lineWidth = 2; for (let i = -40; i <= 40; i += 20) { c.beginPath(); c.moveTo(i, -15); c.lineTo(i, 15); c.stroke(); } c.restore();
  // the forest on the far bank: real trees, under a mist until the chapter is finished
  c.fillStyle = 'rgba(126,165,81,.55)'; c.fillRect(rx + 44, y0, VW, h);
  c.save(); c.beginPath(); c.rect(rx + 44, y0, VW, h); c.clip();
  for (let i = 0; i < 11; i++) { const big = i % 3 === 0, arts = big ? SP.bigTrees : SP.trees, fx = rx + 110 + ((i * 97) % Math.max(120, VW - rx - 190)), fy = y0 + 170 + ((i * 211) % (h - 210)); if (Math.hypot(fx - P[3].x, fy - 90 - P[3].y) < 140) continue; putFast(c, arts[i % arts.length], fx, fy, big ? 0.15 : 0.22 + (i % 2) * 0.03); }
  if (MAP.tease < 1) { c.fillStyle = `rgba(243,232,205,${0.86 * (1 - ease(MAP.tease))})`; c.fillRect(rx + 40, y0, VW, h); }
  c.restore();
  c.restore();
}
function drawStops(c, t, P) {
  // the way from stop to stop: dashes, and gold where they have already been
  c.setLineDash([16, 14]); c.lineCap = 'round'; c.lineWidth = 7;
  for (let i = 0; i < P.length - 1; i++) { if (i === P.length - 2 && MAP.tease <= 0) continue; c.strokeStyle = MAP.done[i] && (MAP.done[i + 1] || i + 1 === MAP.next) ? '#b98a2f' : 'rgba(138,106,58,.5)'; c.globalAlpha = i === P.length - 2 ? MAP.tease : 1; c.beginPath(); for (let k = 0; k <= 20; k++) { const q = along(P, i + k / 20); c.lineTo(q.x, q.y + 206); } c.stroke(); }
  c.setLineDash([]); c.globalAlpha = 1;
  P.forEach((s, i) => {
    const forest = i >= LV.length; if (forest && MAP.tease <= 0) return;
    const can = playable(i), isSel = !forest && i === MAP.sel && MAP.mode === 'idle', beat = isSel && MAP.going === null ? 1 + Math.sin(t * 4.5) * 0.05 : 1, wig = MAP.wiggle > 0 && MAP.wigI === i ? Math.sin(MAP.wiggle * 40) * 8 : 0;
    c.save(); c.translate(s.x + wig, s.y); c.scale(beat, beat); c.globalAlpha = forest ? MAP.tease : 1;
    soft(c, 0, 84, 70, 12, '#2a1a0e', 0.25);
    if (isSel) { c.beginPath(); circ(c, 0, 0, 92); c.fillStyle = 'rgba(255,226,122,.55)'; c.fill(); }
    c.beginPath(); circ(c, 0, 0, 76); fs(c, can || forest ? '#fffbf0' : '#e2d6bc', can ? INK : 'rgba(58,38,24,.5)', 6);
    c.globalAlpha *= can ? 1 : forest ? 0.9 : 0.45; drawIcon(c, forest ? 'tree' : LV[i].icon, 0, 2, 3.3); c.restore();
    if (!forest && MAP.done[i]) { const k = i === MAP.pop ? clamp01((MAP.popT - 0.25) / 0.3) : 1; if (k > 0) tick(c, s.x + 56, s.y - 56, (1 + Math.sin(Math.min(1, k) * Math.PI) * 0.5) * (k > 0 ? 1 : 0)); }
    else if (forest || !can) padlock(c, s.x + 56 + wig, s.y - 52, forest ? 1.25 * MAP.tease : 1.1);
    if (isSel && MAP.going === null) { c.save(); c.translate(s.x, s.y - 128 + Math.sin(t * 5) * 9); c.rotate(Math.PI); drawIcon(c, 'up', 0, 0, 1.9, '#6d9b45'); c.restore(); } // "this one": the arrow points at the stop to play
    if (forest && MAP.tease > 0.4) for (let k = 0; k < 4; k++) { const a = t * 1.5 + k * TAU / 4; star(c, s.x + Math.cos(a) * 106, s.y + Math.sin(a) * 96, 12 + Math.sin(t * 5 + k * 2) * 5, t * 2 + k, 0.9 * MAP.tease); }
  });
}
function drawCard(c, t) { // the end of the chapter, in pictures: three ticks, a high five, and an arrow to go on
  const a = Math.min(1, MAP.cardT * 1.6); c.fillStyle = `rgba(28,18,10,${a * 0.72})`; c.fillRect(0, 0, VW, VH);
  c.save(); c.globalAlpha = a; const w = 640, h = 420, x = VW / 2 - w / 2, y = VH / 2 - h / 2 - 20, cx = VW / 2; parchment(c, x, y, w, h);
  const clap = Math.pow(Math.abs(Math.sin(t * 2.6)), 6) * 12;
  for (const [side, col] of [[-1, sibs[0].col], [1, sibs[1].col]]) { c.save(); c.translate(cx + side * (46 - clap), y + 104); c.scale(side, 1); rrect(c, -24, 24, 48, 22, 6); fs(c, col, INK, 3); drawIcon(c, 'hand', 0, 0, 2.6); c.restore(); }
  for (let k = 0; k < 7; k++) star(c, cx + Math.cos(-Math.PI / 2 + (k - 3) * 0.5) * 170, y + 130 + Math.sin(-Math.PI / 2 + (k - 3) * 0.5) * 100, 13 + Math.sin(t * 5 + k * 1.7) * 6, t + k, a * 0.95);
  LV.forEach((l, i) => { const sx = cx + (i - 1) * 150, sy = y + 262, k = clamp01(MAP.cardT * 1.5 - 0.5 - i * 0.35); c.beginPath(); circ(c, sx, sy, 50); fs(c, '#fffbf0', INK, 4.5); drawIcon(c, l.icon, sx, sy + 2, 2.2); if (k > 0) tick(c, sx + 36, sy - 36, 0.8 * (1 + Math.sin(k * Math.PI) * 0.5)); });
  if (MAP.cardT > 1.2) { c.globalAlpha = a * (0.6 + Math.sin(t * 4) * 0.4); drawIcon(c, 'up', cx, y + h - 46, 1.7, '#6d9b45'); }
  c.restore();
}
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000), t = now / 1000; last = now;
  update(dt);
  const c = ctx, P = stops(); c.setTransform(S, 0, 0, S, 0, 0); c.globalAlpha = 1; c.lineJoin = 'round';
  drawPaper(c, t, P); drawStops(c, t, P);
  for (const p of sibs) drawChar(p, t);
  c.setTransform(S, 0, 0, S, 0, 0); drawSparks(c);
  if (MAP.mode === 'card') drawCard(c, t);
  for (const f of MAP.confetti) { c.save(); c.translate(f.x, f.y); c.rotate(f.rot); c.globalAlpha = Math.min(1, f.life * 2); c.fillStyle = f.col; c.fillRect(-8, -5 * Math.cos(f.rot * 1.7), 16, 10 * Math.cos(f.rot * 1.7)); c.restore(); }
  requestAnimationFrame(frame);
}
addEventListener('resize', resizeScreen); resizeScreen();
requestAnimationFrame((tm) => { last = tm; frame(tm); });

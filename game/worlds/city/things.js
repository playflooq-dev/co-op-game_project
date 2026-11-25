'use strict';
// The city's own objects, placed by the STATIONS in settings.js. They work like the kinds in shared/kit.js
// (each is made from one line of settings and gives back update / after / draw / thing), but belong to this world:
//   find      { piece, look: 'sign' | 'drain' | 'windowbox', x, h, who }   where a piece of the torn map landed
//   puppy     { x, h }            sits on a high awning with the last map piece; then hops down and tags along
//   fountain  { x }               to splash in                striker   { x }   the bell game: stop the light high up
//   jet       { x, h, late }      a water jet that gives whoever stands on it a little bounce
//   parasol   { x, h, by, late }  closed until its id comes on, then a step to stand on
//   bridge    { x: [from, to], by: [ids], time }   comes down while every id is held, and then stays down
// The drawing of the puppy, the fountain, the bell game, the jets and the parasols comes from the first city level.

// ---------- the torn map
function drawPiece(c, x, y, rot, pic, s = 1) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(-16, -12); c.lineTo(-4, -15); c.lineTo(9, -11); c.lineTo(17, -14); c.lineTo(15, 2); c.lineTo(18, 13); c.lineTo(2, 15); c.lineTo(-12, 12); c.lineTo(-17, 1); c.closePath();
  fs(c, '#f1dfb0', '#8a6a3a', 1.6);
  if (pic) drawIcon(c, pic, 0, 0, 0.62);
  c.restore();
}
function takePiece(i, p, x, y) {
  const m = game.map; if (m.got[i]) return;
  m.got[i] = true; m.took = { i, x, y, t: 0 }; p.cheer = 0.7; p.reachT = 0.35; snd('piece'); burst(x, y, 10);
  if (m.got.every(Boolean)) snd('great');
}
KIT.find = (world, d, ground) => {
  const x = d.x, y = ground - d.h, i = d.piece, there = () => game.map.landed(i) && !game.map.got[i];
  const thing = { x, y, canUse: (p) => there() && (p.grounded || p.held) && Math.abs(p.x - x) <= 90 && sibReachY(p) <= y + 8 && (!d.who || p.kind === d.who), use(p) { takePiece(i, p, x, y); } };
  return { thing, spot: [x, y], piece: i,
    draw(c, t) {
      if (d.look === 'sign') { // a shop sign on a post: she can reach it
        const px = x + 46, top = y - 96;
        soft(c, px, ground + 8, 30, 6, '#2a1a0e', 0.28);
        c.fillStyle = lg(c, px - 7, 0, px + 7, 0, '#5a5a62', '#3c3a40'); c.fillRect(px - 6, top, 12, ground + 12 - top); c.strokeStyle = '#1c1a20'; c.lineWidth = 2; c.strokeRect(px - 6, top, 12, ground + 12 - top);
        c.fillStyle = KIT_GREEN; c.fillRect(px - 6, y - 14, 12, 16); c.strokeRect(px - 6, y - 14, 12, 16);
        c.strokeStyle = '#2c2c34'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(px, top + 16); c.lineTo(x - 40, top + 16); c.moveTo(px, top + 56); c.quadraticCurveTo(x + 16, top + 40, x - 4, top + 18); c.stroke();
        c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 14, top + 16); c.lineTo(x - 14, top + 34); c.stroke();
        c.save(); c.translate(x - 14, top + 34); c.rotate(Math.sin(t * 1.6) * 0.05); c.beginPath(); circ(c, 0, 36, 36); fs(c, '#fffbf0', INK, 2.5); drawIcon(c, 'apple', 0, 36, 1.5); c.restore();
        if (there()) drawPiece(c, x + 8, y - 4, -0.3 + Math.sin(t * 5) * 0.18, MAP.pictures[i], 1.25);
      } else if (d.look === 'drain') { // a drain by the kerb: only his small hand fits
        const gy = ground + 44;
        rrect(c, x - 46, gy - 12, 92, 30, 6); fs(c, KIT_BLUE, '#1f3a55', 2.2); rrect(c, x - 38, gy - 6, 76, 18, 4); fs(c, '#2c2a30', '#1c1a20', 1.8);
        if (there()) drawPiece(c, x, gy + 3, 0.2, MAP.pictures[i], 0.8);
        c.strokeStyle = '#5a5a62'; c.lineWidth = 4; for (let bx = x - 30; bx <= x + 30; bx += 12) { c.beginPath(); c.moveTo(bx, gy - 6); c.lineTo(bx, gy + 12); c.stroke(); }
      } else { // a window box on a trellis: too high for both
        const px = x + 52;
        soft(c, px, ground + 8, 34, 6, '#2a1a0e', 0.28);
        c.strokeStyle = '#8a6844'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(px - 16, ground + 10); c.lineTo(px - 16, y - 20); c.moveTo(px + 16, ground + 10); c.lineTo(px + 16, y - 20); c.stroke();
        c.lineWidth = 3; c.beginPath(); for (let yy = ground - 30; yy > y; yy -= 56) { c.moveTo(px - 16, yy); c.lineTo(px + 16, yy - 40); c.moveTo(px + 16, yy); c.lineTo(px - 16, yy - 40); } c.stroke();
        c.strokeStyle = '#2c2c34'; c.lineWidth = 5; c.beginPath(); c.moveTo(px - 16, y + 44); c.lineTo(x - 50, y + 44); c.moveTo(px - 16, y + 84); c.lineTo(x - 20, y + 46); c.stroke();
        for (let k = 0; k < 6; k++) { const fx = x - 44 + k * 17; c.strokeStyle = '#4f8a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(fx, y + 20); c.quadraticCurveTo(fx + 3, y + 4, fx + (k % 2 ? 4 : -3), y - 8 - (k % 3) * 5); c.stroke(); ell(c, fx + (k % 2 ? 4 : -3), y - 10 - (k % 3) * 5, 6.5, 6.5, ['#d9534a', '#f2c94e', '#e8728a'][k % 3]); }
        if (there()) drawPiece(c, x, y - 6, 0.25 + Math.sin(t * 5) * 0.15, MAP.pictures[i], 1.25);
        rrect(c, x - 58, y + 16, 108, 30, 5); fs(c, lg(c, 0, y + 16, 0, y + 46, '#b5713c', '#8a4e24'), KIT_EDGE, 2.2);
      }
      if (there()) { const k = Math.max(0, Math.sin(t * 2.6 + x)), gy = d.look === 'drain' ? ground + 40 : y - 8; star(c, x + 16, gy - 12, 9 + k * 7, t * 2, 0.4 + k * 0.5); }
    } };
};

// ---------- the market puppy, with the last map piece
function drawPup(c, x, y, dir, t, run, sit, piece) {
  const ph = t * (run ? 18 : 5), bob = run ? Math.abs(Math.sin(ph)) * 5 : 0, wag = Math.sin(t * (sit ? 16 : 9)) * (sit ? 0.6 : 0.3);
  c.save(); c.translate(x, y + 8 - bob); c.scale(dir * 1.45, 1.45); c.lineCap = 'round'; c.lineJoin = 'round';
  const fur = '#c98a4a', dark = '#7a4a24', cream = '#f6e6c8';
  c.strokeStyle = dark; c.lineWidth = 6;
  for (const [lx, o] of [[-18, 0], [-10, Math.PI], [14, Math.PI * 0.5], [22, Math.PI * 1.5]]) { c.beginPath(); if (sit && lx < 0) { c.moveTo(lx, -14); c.lineTo(lx + 10, -2); } else { const sw = run ? Math.sin(ph + o) * 8 : 0; c.moveTo(lx, -16); c.lineTo(lx + sw, -1); } c.stroke(); }
  c.save(); c.translate(-26, sit ? -16 : -26); c.rotate(-0.9 + wag); c.strokeStyle = fur; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-6, -10, -2, -20); c.stroke(); c.restore();
  c.beginPath(); c.ellipse(0, sit ? -22 : -26, 30, 14, sit ? -0.35 : 0, 0, TAU); fs(c, fur, dark, 2);
  c.beginPath(); c.ellipse(10, sit ? -18 : -22, 12, 8, 0, 0, TAU); c.fillStyle = cream; c.fill();
  const hx = 28, hy = sit ? -46 : -40;
  c.beginPath(); circ(c, hx, hy, 14); fs(c, fur, dark, 2);
  c.beginPath(); c.ellipse(hx + 13, hy + 5, 9, 7, 0, 0, TAU); fs(c, cream, dark, 1.5); ell(c, hx + 21, hy + 2, 3.5, 3, '#2a1a10');
  ell(c, hx + 5, hy - 3, 2.6, 2.6, '#2a1a10'); ell(c, hx + 6, hy - 4, 0.9, 0.9, '#fff');
  c.save(); c.translate(hx - 7, hy - 9); c.rotate(0.5 + (run ? Math.sin(ph) * 0.3 : 0)); c.beginPath(); c.ellipse(0, 8, 6, 11, 0, 0, TAU); fs(c, dark, '#4a2a14', 1.4); c.restore();
  if (sit && !piece) { c.beginPath(); c.ellipse(hx + 16, hy + 12, 3, 5, 0, 0, TAU); c.fillStyle = '#e8728a'; c.fill(); }
  if (piece) { c.save(); c.translate(hx + 20, hy + 9); c.rotate(0.4); c.beginPath(); c.moveTo(-6, -8); c.lineTo(10, -10); c.lineTo(12, 8); c.lineTo(-4, 9); c.closePath(); fs(c, '#f1dfb0', '#8a6a3a', 1.4); c.restore(); }
  c.restore();
}
KIT.puppy = (world, d, ground) => {
  const x = d.x, top = ground - d.h, st = { mode: 'sit', t: 0, x, y: top, dir: -1, bark: 0, hop: 0 };
  const thing = { get x() { return st.mode === 'sit' ? x : st.x; }, y: top + 8, // up on the awning it gives up the map piece; down on the ground it likes to be petted (once, for a sticker)
    canUse: (p) => (st.mode === 'sit' ? (p.grounded || p.held) && Math.abs(p.x - x) <= 95 && sibReachY(p) <= top + 14 : st.mode === 'follow' && !KIT_SIG.petted && p.grounded && Math.abs(p.x - st.x) < 100 && Math.abs(p.y - st.y) < 30),
    use(p) { if (st.mode === 'sit') { st.mode = 'jump'; st.t = 0; st.to = x + (p.x < x ? 150 : -150); takePiece(3, p, x, top - 20); } else { st.hop = 0.35; st.bark = 1.6; p.reachT = 0.3; burst(st.x, st.y - 70, 8); KIT_SIG.petted = [st.x, st.y - 90]; } snd('bark'); } };
  return { state: st, thing,
    after(dt) {
      st.t += dt; st.bark = Math.max(0, st.bark - dt); st.hop = Math.max(0, st.hop - dt);
      const sibs = [MV.sis, MV.bro], near = Math.abs(sibs[0].x - st.x) < Math.abs(sibs[1].x - st.x) ? sibs[0] : sibs[1];
      if (st.mode === 'sit') { // up on the awning: it watches whoever is closest, and yips when somebody jumps for it
        st.dir = near.x < st.x ? -1 : 1;
        if (st.bark <= 0 && sibs.some((p) => !p.gone && Math.abs(p.x - x) < 300 && ((!p.grounded && p.vy < 0) || p.held))) { st.bark = 1.6; st.hop = 0.35; snd('bark'); }
      } else if (st.mode === 'jump') { // it hops down
        const u = Math.min(1, st.t / 0.7); st.x = lerp(x, st.to, u); st.y = lerp(top, ground, u * u) - Math.sin(u * Math.PI) * 70; st.dir = st.to > x ? 1 : -1;
        if (u >= 1) { st.mode = 'follow'; st.y = ground; snd('bark'); }
      } else { // and tags along behind the sister, as far as the end of the market
        const want = clamp(MV.sis.x - 120 * MV.sis.dir, d.x - 900, d.x + (d.far || 640)), gap = want - st.x;
        st.run = Math.abs(gap) > 40; if (st.run) { st.dir = Math.sign(gap); st.x += st.dir * Math.min(Math.abs(gap), 360 * dt); } else st.dir = near.x < st.x ? -1 : 1;
        if (st.bark <= 0 && Math.random() < dt * 0.25) { st.bark = 2.5; st.hop = 0.3; snd('bark'); }
      }
    },
    draw(c, t) {
      // its perch: a tall striped awning on two poles
      c.fillStyle = '#6b4e30'; for (const px of [x - 150, x + 150]) c.fillRect(px - 5, top + 10, 10, ground + 12 - top - 10);
      for (let k = 0; k < 8; k++) { const a = x - 168 + k * 42; c.beginPath(); c.moveTo(a, top + 2); c.lineTo(a + 42, top + 2); c.lineTo(a + 42, top + 34); c.quadraticCurveTo(a + 21, top + 48, a, top + 34); c.closePath(); fs(c, k % 2 ? '#fffbf0' : '#d9534a', 'rgba(58,38,24,.55)', 1.5); }
      rrect(c, x - 172, top - 8, 344, 14, 5); fs(c, '#b03a30', KIT_EDGE, 2.2);
      const hop = st.hop > 0 ? Math.abs(Math.sin(st.hop / 0.35 * Math.PI)) * 16 : 0;
      drawPup(c, st.x, st.y - 8 - hop, st.dir, t, st.mode === 'follow' && st.run, st.mode !== 'jump' && !(st.mode === 'follow' && st.run), st.mode === 'sit');
      if (st.bark > 1.1) { c.save(); c.globalAlpha = Math.min(1, (st.bark - 1.1) * 3); for (const a of [-0.5, 0, 0.5]) { c.strokeStyle = '#fffbf0'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(st.x + st.dir * 70 + Math.sin(a) * 6, st.y - 70 - hop + a * 30); c.lineTo(st.x + st.dir * 92, st.y - 74 - hop + a * 46); c.stroke(); } c.restore(); } // "yip": three little lines
    } };
};

// ---------- Fountain Square: the fountain and the bell game. Nothing here has to be done.
KIT.fountain = (world, d, ground) => {
  const x = d.x, g = ground - 8, st = { wet: 0 };
  const thing = { x, y: ground - 70, canUse: (p) => p.grounded && p.y > ground - 20 && Math.abs(p.x - x) < 250 && Math.abs(p.x - x) > 120, use(p) {
    const o = partner(p), side = Math.sign(p.x - x); p.reachT = 0.4; p.dir = -side; snd('splash'); puff(x + side * 150, g - 70, 14, '#d6ecf6', 3); st.wet = 0.5;
    if (!o.gone && Math.abs(o.x - x) < 330) { o.cheer = 0.7; o.sqv = -3; } p.cheer = 0.5; } };
  return { thing, after(dt) { st.wet = Math.max(0, st.wet - dt); },
    draw(c, t) {
      const stone = (x0, x1) => lg(c, x0, 0, x1, 0, '#d8cfc0', '#bdb3a3', '#958b7c');
      const fall = (x0, y0, x1, y1, w, ph) => { c.strokeStyle = 'rgba(214,236,246,.8)'; c.lineWidth = w; c.setLineDash([14, 9]); c.lineDashOffset = -t * 90 - ph; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y0 - 6, x1, y1); c.stroke(); c.setLineDash([]); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = w * 0.35; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y0 - 6, x1, y1); c.stroke(); };
      soft(c, x, g + 4, 230, 20, '#2a1a0e', 0.3);
      rrect(c, x - 196, g - 58, 392, 58, 12); fs(c, stone(x - 196, x + 196), '#5a5046', 2.5);
      c.fillStyle = 'rgba(60,50,40,.16)'; for (let i = -3; i <= 3; i++) c.fillRect(x + i * 56 - 1, g - 46, 2, 44);
      c.beginPath(); c.ellipse(x, g - 58, 196, 17, 0, 0, TAU); fs(c, '#e6ddce', '#5a5046', 2.5);
      c.beginPath(); c.ellipse(x, g - 58, 176, 12, 0, 0, TAU); fs(c, lg(c, x - 176, 0, x + 176, 0, '#8fc0d6', '#b9dcea', '#7fb2ca'));
      for (let i = 0; i < 4; i++) { const u = (t * 0.5 + i / 4) % 1; c.strokeStyle = `rgba(255,255,255,${0.5 * (1 - u)})`; c.lineWidth = 2; c.beginPath(); c.ellipse(x + (i % 2 ? 78 : -78), g - 58, 14 + u * 44, 2 + u * 5, 0, 0, TAU); c.stroke(); }
      for (const s of [-1, 1]) { fall(x + s * 60, g - 196, x + s * 78, g - 60, 9, s * 7); fall(x + s * 36, g - 194, x + s * 44, g - 60, 6, s * 13); }
      c.beginPath(); c.moveTo(x - 22, g - 58); c.lineTo(x - 15, g - 190); c.lineTo(x + 15, g - 190); c.lineTo(x + 22, g - 58); c.closePath(); fs(c, stone(x - 22, x + 22), '#5a5046', 2.2);
      c.beginPath(); c.moveTo(x - 96, g - 204); c.quadraticCurveTo(x - 60, g - 170, x - 14, g - 168); c.lineTo(x + 14, g - 168); c.quadraticCurveTo(x + 60, g - 170, x + 96, g - 204); c.closePath(); fs(c, stone(x - 96, x + 96), '#5a5046', 2.2);
      c.beginPath(); c.ellipse(x, g - 204, 96, 10, 0, 0, TAU); fs(c, '#e6ddce', '#5a5046', 2.2); c.beginPath(); c.ellipse(x, g - 204, 84, 6.5, 0, 0, TAU); fs(c, '#a9d2e2');
      for (const s of [-1, 1]) fall(x + s * 6, g - 318, x + s * 54, g - 208, 5, s * 21);
      c.beginPath(); c.moveTo(x - 11, g - 204); c.lineTo(x - 7, g - 282); c.lineTo(x + 7, g - 282); c.lineTo(x + 11, g - 204); c.closePath(); fs(c, stone(x - 11, x + 11), '#5a5046', 2);
      c.beginPath(); c.ellipse(x, g - 300, 17, 22, 0, 0, TAU); fs(c, stone(x - 17, x + 17), '#5a5046', 2); c.beginPath(); c.moveTo(x - 10, g - 320); c.lineTo(x, g - 340); c.lineTo(x + 10, g - 320); c.closePath(); fs(c, '#cfc6b6', '#5a5046', 2);
      ell(c, x - 6, g - 304, 2.2, 2.2, '#5a5046'); ell(c, x + 6, g - 304, 2.2, 2.2, '#5a5046');
    } };
};
KIT.striker = (world, d, ground) => { // the bell game: grab starts the light running up and down the pole, grab again stops it
  const x = d.x, g = ground - 8, H0 = 400, k = { phase: 'idle', who: null, t: 0, pos: 0, power: 0, puck: 0, rang: false, best: {} }, period = 1.15, ring = 0.9;
  const thing = { x, y: ground - 70, canUse: (p) => p.grounded && p.y > ground - 20 && Math.abs(p.x - x) < 100 && (k.phase === 'idle' || (k.phase === 'aim' && k.who === p)),
    use(p) { if (k.phase === 'idle') { k.phase = 'aim'; k.who = p; k.t = 0; snd('tap'); } else { k.power = k.pos; k.phase = 'fly'; k.t = 0; k.rang = false; snd('thump'); p.cheer = 0.4; } } };
  return { state: k, thing,
    after(dt) {
      if (k.phase === 'idle') return; k.t += dt;
      if (k.phase === 'aim') { const u = (k.t / period) % 2; k.pos = u < 1 ? u : 2 - u; if (k.t > 9 || Math.abs(k.who.x - x) > 220) k.phase = 'idle'; return; }
      const up = 0.4; k.puck = k.t < up ? k.power * Math.sin(k.t / up * Math.PI / 2) : k.power * Math.max(0, 1 - Math.pow((k.t - up) / 0.7, 2));
      if (!k.rang && k.t >= up) { k.rang = true; const p = k.who, score = Math.round(k.power * 100); k.best[p.who] = Math.max(k.best[p.who] || 0, score); if (k.power >= ring) { snd('ding'); burst(x, g - H0 - 40, 14); p.cheer = CHEER; KIT_SIG.rang = [x, g - H0 - 60]; } }
      if (k.t > up + 0.75) k.phase = 'idle';
    },
    draw(c, t) {
      soft(c, x, g + 2, 110, 12, '#2a1a0e', 0.3);
      rrect(c, x - 30, g - H0 - 30, 60, H0, 8); fs(c, lg(c, x - 30, 0, x + 30, 0, '#f6efe0', '#e8dcc0'), INK, 2.5);
      for (let i = 0; i < 10; i++) { c.fillStyle = i % 2 ? '#d9534a' : '#f2c94e'; c.fillRect(x - 27, g - 44 - (i + 1) * 36, 8, 34); c.fillRect(x + 19, g - 44 - (i + 1) * 36, 8, 34); }
      rrect(c, x - 6, g - H0 - 16, 12, H0 - 26, 5); fs(c, '#5a4a3a');
      const yOf = (u) => g - 50 - u * (H0 - 60);
      if (k.phase === 'aim') { const y = yOf(k.pos); soft(c, x, y, 34, 22, '#fff3b8', 0.9); rrect(c, x - 8, y - 5, 16, 10, 4); fs(c, '#fff8d0', '#d9a520', 1.5); }
      const py = yOf(k.phase === 'fly' ? k.puck : 0); rrect(c, x - 13, py - 7, 26, 14, 4); fs(c, '#c9402f', '#4a0e0a', 2);
      const sw = k.phase === 'fly' && k.rang && k.power >= ring ? Math.sin(t * 40) * 0.12 * Math.max(0, 1 - k.t) : 0;
      c.save(); c.translate(x, g - H0 - 46); c.rotate(sw); drawIcon(c, 'bell', 0, 0, 2.1); c.restore();
      rrect(c, x - 84, g - 52, 168, 52, 8); fs(c, lg(c, 0, g - 52, 0, g, '#c9402f', '#9a2a20'), INK, 2.5); rrect(c, x - 74, g - 44, 148, 36, 5); fs(c, '#fffbf0', INK, 1.2);
      // the best go of each, as a number beside a dot in their colour
      [['sister', MV.sis.col, x - 38], ['brother', MV.bro.col, x + 38]].forEach(([who, col, sx]) => { ell(c, sx - 22, g - 26, 8, 8, col); c.fillStyle = INK; c.font = '700 20px Georgia, serif'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(k.best[who] ? String(k.best[who]) : '·', sx - 8, g - 25); });
      c.textBaseline = 'alphabetic';
    } };
};

// ---------- a water jet in the pavement: quiet, then bubbling, then a spout that bounces whoever is standing on it
KIT.jet = (world, d, ground) => {
  const x = d.x, gy = ground - (d.h || 0), period = 3.8, warn = 0.9, on = 1.1, u = () => (MV.time + (d.late || 0)) % period;
  const state = () => (u() < period - warn - on ? 'quiet' : u() < period - on ? 'warn' : 'on');
  return { after() {
      if (state() !== 'on') return;
      for (const p of [MV.sis, MV.bro]) if (!p.gone && !p.held && p.grounded && Math.abs(p.x - x) < 44 && Math.abs(p.y - gy) < 8) { p.y -= 3; p.vy = -640; p.grounded = false; p.on = null; p.cheer = 0.7; snd('splash'); puff(x, gy - 40, 10, '#d6ecf6', 2); }
    },
    draw(c, t) {
      const st = state(), y = gy + 4;
      c.beginPath(); c.ellipse(x, y, 26, 7, 0, 0, TAU); fs(c, '#8a8478', '#3c3a40', 2); c.beginPath(); c.ellipse(x, y, 14, 3.6, 0, 0, TAU); fs(c, '#2c2a30');
      let h = 0; if (st === 'warn') h = 18 + Math.abs(Math.sin(t * 22)) * 26; else if (st === 'on') { const k = (u() - (period - on)) / on; h = 300 * Math.min(1, k * 6, (1 - k) * 5); }
      if (h > 0) {
        c.lineCap = 'round'; c.strokeStyle = 'rgba(214,236,246,.85)'; c.lineWidth = st === 'on' ? 20 : 9; c.setLineDash([16, 8]); c.lineDashOffset = t * 260; c.beginPath(); c.moveTo(x, y - 2); c.lineTo(x + Math.sin(t * 9) * 3, y - h); c.stroke(); c.setLineDash([]);
        c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = st === 'on' ? 7 : 3; c.beginPath(); c.moveTo(x, y - 2); c.lineTo(x, y - h); c.stroke();
        if (st === 'on') soft(c, x, y - h, 46, 26, '#e6f4fa', 0.8);
      }
    } };
};

// ---------- a cafe parasol: closed until its id comes on, then open, and a step to stand on
KIT.parasol = (world, d, ground) => {
  const x = d.x, y = ground - d.h, w = 104, l = world.ledge(x - w, x + w, y, { off: true }), st = { open: 0, t: 0 }, cols = ['#d9534a', '#4f83ad', '#e2b84a'];
  return { state: st, ledge: l,
    update(dt) {
      const on = kitOn(d.by); if (on) st.t += dt; const before = st.open;
      if (on && st.t > (d.late || 0)) st.open = Math.min(1, st.open + dt / 0.45);
      if (st.open >= 0.9 && before < 0.9) { l.off = false; snd('boing'); puff(x, y, 5); }
    },
    draw(c) {
      const o = ease(st.open), hw = lerp(16, w, o), rim = y + lerp(150, 30, o), g = ground + 8, col = cols[Math.round(d.h / 150) % 3];
      soft(c, x, g + 2, 60, 8, '#2a1a0e', 0.28);
      c.fillStyle = '#6b4e30'; c.fillRect(x - 4, g - 70, 8, 70); c.beginPath(); c.ellipse(x, g - 72, 52, 9, 0, 0, TAU); fs(c, '#e6ddce', '#5a5046', 2); c.beginPath(); c.ellipse(x, g - 1, 22, 5, 0, 0, TAU); fs(c, '#5a5046'); // a little table
      c.fillStyle = lg(c, x - 5, 0, x + 5, 0, '#d8cfc0', '#958b7c'); c.fillRect(x - 5, y, 10, g - 70 - y); c.strokeStyle = '#5a5046'; c.lineWidth = 1.5; c.strokeRect(x - 5, y, 10, g - 70 - y);
      for (let k = 0; k < 6; k++) { const x0 = x - hw + 2 * hw * k / 6, x1 = x - hw + 2 * hw * (k + 1) / 6; c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x0, rim); c.quadraticCurveTo((x0 + x1) / 2, rim + 13 * o + 3, x1, rim); c.closePath(); fs(c, k % 2 ? '#fffbf0' : col, 'rgba(58,38,24,.55)', 1.5); }
      if (o > 0.5) { rrect(c, x - hw, y - KIT_TOP * 0.6, hw * 2, KIT_TOP * 1.5, 6); c.globalAlpha = (o - 0.5) * 2; fs(c, shade(col, 0.35), 'rgba(58,38,24,.6)', 1.8); c.globalAlpha = 1; } // the flat top they stand on
      ell(c, x, y - 14, 5, 5, '#e2b84a');
    } };
};

// ---------- the Old Bridge: it comes down while every id in `by` is held, and stays down once it is there
KIT.bridge = (world, d, ground) => {
  const [r0, r1] = d.x, st = { prog: 0, down: false, held: false }, l = world.ledge(r0 - 12, r1 + 12, ground, { off: true });
  return { state: st, ledge: l,
    update(dt) {
      st.held = !st.down && kitOn(d.by);
      if (st.held) { const before = st.prog; st.prog = Math.min(1, st.prog + dt / (d.time || 2.6)); if (Math.floor(st.prog * 12) !== Math.floor(before * 12)) snd('click');
        if (st.prog >= 1) { st.down = true; l.off = false; snd('thump'); snd('fanfare'); game.shake = 0.8; burst((r0 + r1) / 2, ground - 80, 16); for (const p of [MV.sis, MV.bro]) p.cheer = CHEER; } }
      else if (!st.down) st.prog = Math.max(0, st.prog - dt * 0.25); // let go too soon and it creeps back up
      KIT_SIG.bridge = st.down;
    },
    draw(c) {
      const hut = KIT_AT[d.by[1]]; if (hut) putFast(c, W('bridgeHut'), hut.x + 70, BASE + 12);
      c.save(); c.translate(r0, ground + 2); c.rotate(-1.22 * (1 - ease(st.prog))); put(c, W('bridgeDeck'), 0, 0); c.restore();
    } };
};

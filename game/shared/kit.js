'use strict';
// The object kit: things a world can place for the siblings to play with. Each one is made from a line of settings:
//   kitMake(world, { kind: 'box', x: 2440 }, ground)     ground = the y of the pavement
// and comes back as an object the world keeps: { def, update(dt), after(dt), draw(c, t), drawFront(c, t), thing, body }.
// update runs before world.step, after runs after it; a world calls whichever exist. Positions: x is along the
// street, h is the height above the ground. Needs shared/physics.js, movement.js and icons.js.
//
// Colour language: green means "the sister's job" (heavy, high), blue means "the brother's job" (light, small),
// plain wood is for either of them.
//
// Phase 1 kinds:
//   block   { x: [from, to], h, look: 'stone' | 'wall' | 'boards' }   solid: steps, walls
//   tunnel  { x: [from, to], h, gap }                                  solid with a low way through that only he fits
//   ledge   { x: [from, to], h, look: 'shelf' | 'balcony' }            can be stood on and jumped up through
//   plank   { x: [from, to], h }                                       thin and blue: snaps under anything heavy, comes back
//   box     { x, h }     light, plain wood: either can carry it        crate  { x, h }  heavy, green bands: only she can
//   seesaw  { x, half, blue: 'left' | 'right' }                        her landing on the high end launches what is on the other
//   bell    { x, h }                                                   something to use, hung high
//   star    { x, h }                                                   collected by standing next to it
const KIT = {}, KIT_GREEN = '#6d9b45', KIT_BLUE = '#4b86b8', KIT_EDGE = '#4a2f1a', KIT_STONE = '#5a5046';
function kitMake(world, def, ground) { const f = KIT[def.kind]; if (!f) throw new Error('kit: no such kind "' + def.kind + '"'); return Object.assign({ def }, f(world, def, ground)); }
const KIT_TOP = 9; // how much of a top face shows: the street is seen a little from above

// ---------- stone and boards
function kitStone(c, x0, x1, top, base, seed, cap) {
  const w = x1 - x0, f0 = top + KIT_TOP * 0.8, f1 = base, rnd = rng(seed);
  c.fillStyle = lg(c, 0, f0, 0, f1, '#d2c8b7', '#a69c8b'); c.fillRect(x0, f0, w, f1 - f0);
  for (let y = f0, row = 0; y < f1; y += 34, row++) { // courses of stone, some a shade lighter or darker
    for (let x = x0 - (row % 2 ? 30 : 0) - rnd() * 16; x < x1;) { const sw = 48 + rnd() * 26, a = Math.max(x, x0), b = Math.min(x + sw, x1), k = rnd(); if (b > a && k > 0.45) { c.fillStyle = k > 0.72 ? 'rgba(255,248,230,.16)' : 'rgba(70,58,48,.12)'; c.fillRect(a, y, b - a, Math.min(34, f1 - y)); } x += sw; if (x > x0 + 4 && x < x1 - 4) { c.fillStyle = 'rgba(80,68,58,.4)'; c.fillRect(x - 0.8, y, 1.6, Math.min(34, f1 - y)); } }
    if (row) { c.fillStyle = 'rgba(80,68,58,.4)'; c.fillRect(x0, y - 0.8, w, 1.6); }
  }
  c.fillStyle = lg(c, x0, 0, x1, 0, 'rgba(255,244,220,.2)', 'rgba(255,244,220,0)', 'rgba(50,36,28,.2)'); c.fillRect(x0, f0, w, f1 - f0);
  c.fillStyle = lg(c, 0, f1 - 16, 0, f1, 'rgba(40,28,20,0)', 'rgba(40,28,20,.3)'); c.fillRect(x0, f1 - 16, w, 16);
  c.strokeStyle = KIT_STONE; c.lineWidth = 2.2; c.strokeRect(x0, f0, w, f1 - f0);
  const o = cap || 2; rrect(c, x0 - o, top - KIT_TOP, w + o * 2, KIT_TOP * 1.9, 3); fs(c, lg(c, 0, top - KIT_TOP, 0, top + KIT_TOP, '#efe7d8', '#dcd2c0'), KIT_STONE, 2.2);
}
function kitBoards(c, x0, x1, top, base) {
  const w = x1 - x0, f0 = top + KIT_TOP * 0.8;
  for (let x = x0, i = 0; x < x1 - 1; x += 26, i++) { const b = Math.min(x + 26, x1); c.fillStyle = lg(c, 0, f0, 0, base, i % 2 ? '#c9a36a' : '#bb945c', i % 2 ? '#a8824a' : '#9c7742'); c.fillRect(x, f0, b - x, base - f0); c.fillStyle = 'rgba(74,47,26,.45)'; c.fillRect(x - 0.8, f0, 1.6, base - f0); }
  for (const yy of [f0 + 46, base - 70]) { c.fillStyle = '#8a643a'; c.fillRect(x0, yy, w, 13); c.fillStyle = 'rgba(40,25,15,.3)'; c.fillRect(x0, yy + 13, w, 3); for (let x = x0 + 9; x < x1; x += 26) ell(c, x, yy + 6.5, 2, 2, '#4a2f1a'); }
  c.strokeStyle = KIT_EDGE; c.lineWidth = 2.2; c.strokeRect(x0, f0, w, base - f0);
  rrect(c, x0 - 3, top - KIT_TOP, w + 6, KIT_TOP * 1.9, 3); fs(c, '#dcbb85', KIT_EDGE, 2.2);
}
KIT.block = (world, d, ground) => {
  const [x0, x1] = d.x, top = ground - d.h; world.solid(x0, top, x1, ground);
  return { draw(c) { if (d.look === 'boards') kitBoards(c, x0, x1, top, ground + 12); else kitStone(c, x0, x1, top, ground + 12, x0 * 7 + d.h, d.look === 'wall' ? 7 : 2); } };
};
// a low way through: only the brother fits (he ducks by himself), and a carried box is knocked off
KIT.tunnel = (world, d, ground) => {
  const [x0, x1] = d.x, top = ground - d.h, roof = ground - d.gap; world.solid(x0, top, x1, roof);
  return { draw(c) {
    c.fillStyle = lg(c, 0, roof, 0, ground + 12, '#2c221b', '#4a3b30'); c.fillRect(x0 + 14, roof - 2, x1 - x0 - 28, ground + 12 - roof); // the dark inside
    for (const lx of [x0, x1 - 22]) kitStone(c, lx, lx + 22, roof + 4, ground + 12, lx, 0);                                                 // its two legs, set back
    kitStone(c, x0, x1, top, roof + 2, x0 * 3 + 1, 3);
    c.fillStyle = KIT_BLUE; c.fillRect(x0 + 1, roof - 8, x1 - x0 - 2, 8); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x0 + 1, roof - 8, x1 - x0 - 2, 2.5);
    c.strokeStyle = KIT_STONE; c.lineWidth = 2.2; c.strokeRect(x0 + 1, roof - 8, x1 - x0 - 2, 8);
    for (const ax of [x0 + 26, x1 - 26]) { c.beginPath(); c.moveTo(ax - 13, roof - 44); c.lineTo(ax, roof - 24); c.lineTo(ax + 13, roof - 44); c.strokeStyle = KIT_BLUE; c.lineWidth = 7; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); } // "down here"
  } };
};

// ---------- ledges: a shelf on brackets, a balcony with a railing
KIT.ledge = (world, d, ground) => {
  const [x0, x1] = d.x, y = ground - d.h; world.ledge(x0, x1, y);
  return { draw(c) {
    const w = x1 - x0;
    if (d.look === 'balcony') {
      c.strokeStyle = '#2c2c34'; c.lineCap = 'round'; c.lineWidth = 3.5; c.beginPath(); for (let x = x0 + 14; x <= x1 - 14; x += (w - 28) / Math.round((w - 28) / 26)) { c.moveTo(x, y - 76); c.lineTo(x, y - 4); } c.stroke();
      c.lineWidth = 6; c.beginPath(); c.moveTo(x0 + 6, y - 78); c.lineTo(x1 - 6, y - 78); c.stroke(); for (const px of [x0 + 8, x1 - 8]) ell(c, px, y - 84, 6, 6, '#2c2c34');
      for (const bx of [x0 + 34, x1 - 34]) { c.beginPath(); c.moveTo(bx - 20, y + 20); c.lineTo(bx + 20, y + 20); c.lineTo(bx + 20, y + 34); c.quadraticCurveTo(bx - 6, y + 40, bx - 20, y + 64); c.closePath(); fs(c, lg(c, 0, y + 20, 0, y + 64, '#cfc5b4', '#a69c8b'), KIT_STONE, 2); }
      soft(c, (x0 + x1) / 2, y + 44, w * 0.5, 22, '#2a1a0e', 0.16);
      rrect(c, x0, y + KIT_TOP * 0.7, w, 18, 3); fs(c, lg(c, 0, y, 0, y + 26, '#cfc5b4', '#aaa08f'), KIT_STONE, 2.2);
      rrect(c, x0 - 2, y - KIT_TOP, w + 4, KIT_TOP * 1.8, 3); fs(c, '#ece4d5', KIT_STONE, 2.2);
    } else {
      soft(c, (x0 + x1) / 2, y + 40, w * 0.5, 20, '#2a1a0e', 0.14);
      c.strokeStyle = '#2c2c34'; c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round';
      for (const bx of [x0 + 34, x1 - 34]) { c.beginPath(); c.moveTo(bx + 24, y + 20); c.lineTo(bx - 20, y + 20); c.lineTo(bx - 20, y + 74); c.moveTo(bx - 20, y + 66); c.lineTo(bx + 18, y + 24); c.stroke(); }
      rrect(c, x0, y + KIT_TOP * 0.7, w, 13, 3); fs(c, lg(c, 0, y, 0, y + 20, '#b88d5a', '#96703f'), KIT_EDGE, 2.2);
      rrect(c, x0 - 2, y - KIT_TOP, w + 4, KIT_TOP * 1.8, 3); fs(c, '#dcbb85', KIT_EDGE, 2.2);
      c.strokeStyle = 'rgba(74,47,26,.3)'; c.lineWidth = 1.4; c.beginPath(); for (let x = x0 + 60; x < x1 - 20; x += 64) { c.moveTo(x, y - KIT_TOP + 2); c.lineTo(x - 5, y + KIT_TOP * 0.7); } c.stroke();
    }
  } };
};

// ---------- the thin plank: blue, for light feet only. Anything heavy snaps it; it comes back after a few seconds.
KIT.plank = (world, d, ground) => {
  const [x0, x1] = d.x, y = ground - d.h, l = world.ledge(x0, x1, y), st = { stress: 0, gone: 0, age: 9, creaked: false };
  return { state: st,
    after(dt) {
      st.age += dt;
      if (st.gone > 0) { st.gone -= dt; if (st.gone <= 0) { l.off = false; st.age = 0; snd('pop'); puff((x0 + x1) / 2, y, 6, '#dcecf6', 3); } return; }
      const heavy = world.riders(l).some((r) => world.load(r) >= MOVE.heavy);
      if (heavy && !st.creaked) snd('creak'); st.creaked = heavy;
      st.stress = heavy ? st.stress + dt / MOVE.plankHold : Math.max(0, st.stress - dt * 3);
      if (st.stress >= 1) { l.off = true; st.gone = MOVE.plankBack; st.stress = 0; st.broke = 0; snd('crack'); puff((x0 + x1) / 2, y, 8, '#dcecf6', 4); }
    },
    draw(c, t) {
      const mid = (x0 + x1) / 2, a = x0 - 12, b = x1 + 12;
      const half = (from, to, hinge, drop, alpha) => { // one half of the board, sagging or swinging down from its end
        c.save(); c.globalAlpha = alpha; c.translate(hinge, y); c.rotate(drop * (hinge < mid ? 1 : -1));
        const fx = from - hinge, tx = to - hinge;
        rrect(c, Math.min(fx, tx), KIT_TOP * 0.5, Math.abs(tx - fx), 9, 2); fs(c, lg(c, 0, 0, 0, 14, '#6f9cc0', '#4f7da3'), '#2f506e', 2);
        rrect(c, Math.min(fx, tx), -KIT_TOP * 0.6, Math.abs(tx - fx), KIT_TOP * 1.2, 2); fs(c, '#a9cbe4', '#2f506e', 2);
        c.strokeStyle = 'rgba(47,80,110,.35)'; c.lineWidth = 1.3; c.beginPath(); for (let x = Math.min(fx, tx) + 40; x < Math.max(fx, tx) - 10; x += 52) { c.moveTo(x, -KIT_TOP * 0.6 + 2); c.lineTo(x - 4, KIT_TOP * 0.5); } c.stroke();
        c.restore();
      };
      if (st.gone > 0) { const u = MOVE.plankBack - st.gone; if (u < 0.9) { const k = ease(Math.min(1, u / 0.45)); half(a, mid - 3, a, k * 1.35, 1 - clamp01((u - 0.5) / 0.4)); half(mid + 3, b, b, k * 1.35, 1 - clamp01((u - 0.5) / 0.4)); } }
      else { const sag = st.stress * 0.045 + (st.stress > 0 ? Math.sin(t * 60) * 0.006 : 0), al = clamp01(st.age / 0.25); half(a, mid, a, sag, al); half(mid, b, b, sag, al); if (st.stress > 0.25) { c.strokeStyle = '#2f506e'; c.lineWidth = 2; c.beginPath(); c.moveTo(mid - 5, y - 6 + st.stress * 6); c.lineTo(mid + 2, y + st.stress * 6); c.lineTo(mid - 3, y + 6 + st.stress * 6); c.stroke(); } }
      for (const rx of [x0 + 2, x1 - 2]) { c.strokeStyle = '#8a6f44'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); for (const dx of [-7, 0, 7]) { c.moveTo(rx + dx, y - 7); c.lineTo(rx + dx, y + 13); } c.stroke(); } // rope lashings
    } };
};

// ---------- boxes: the light box (plain wood, either of them) and the heavy crate (green bands, only her)
KIT.box = (world, d, ground) => {
  const heavy = d.kind === 'crate', s = heavy ? 104 : 86, home = { x: d.x, y: ground - (d.h || 0) };
  const b = world.add(makeBody({ x: home.x, y: home.y, w: s, h: s, kind: 'box', heavy, weight: heavy ? MOVE.heavy : 1, platform: true, grounded: true, wobble: 0, ox: 0, oy: 0 }));
  b.draw = (c, t) => {
    const f0 = -s + KIT_TOP * 0.8, f1 = 7, fh = f1 - f0, wood = heavy ? ['#b0875a', '#8a6540', '#c9a070'] : ['#dcb983', '#bf975c', '#edd3a6'];
    c.save(); c.translate(b.x + b.ox, b.y + b.oy); if (b.wobble > 0) c.rotate(Math.sin(t * 42) * 0.035 * (b.wobble / 0.5)); c.lineJoin = 'round';
    rrect(c, -s / 2, f0, s, fh, 5); fs(c, lg(c, 0, f0, 0, f1, wood[0], wood[1]), KIT_EDGE, 2.5);
    c.strokeStyle = 'rgba(74,47,26,.3)'; c.lineWidth = 1.5; c.beginPath(); for (const k of [1 / 3, 2 / 3]) { c.moveTo(-s / 2 + s * k, f0 + 4); c.lineTo(-s / 2 + s * k, f1 - 4); } c.stroke();
    c.strokeStyle = shade(wood[1], -0.18); c.lineWidth = 7; c.strokeRect(-s / 2 + 7, f0 + 7, s - 14, fh - 14);
    if (heavy) { // two green iron bands with rivets, and a weight painted in the middle
      for (const k of [0.2, 0.66]) { const by = f0 + fh * k; c.fillStyle = lg(c, 0, by, 0, by + 14, '#7fae56', '#55803a'); c.fillRect(-s / 2 + 1.5, by, s - 3, 14); c.strokeStyle = '#2f4a1e'; c.lineWidth = 1.6; c.strokeRect(-s / 2 + 1.5, by, s - 3, 14); for (let x = -s / 2 + 12; x < s / 2 - 6; x += 20) ell(c, x, by + 7, 2.2, 2.2, '#dfe8b8'); }
      const wy = f0 + fh * 0.5; c.beginPath(); c.arc(0, wy - 9, 7, Math.PI, 0); c.strokeStyle = '#2f4a1e'; c.lineWidth = 4; c.stroke(); c.beginPath(); c.moveTo(-13, wy - 6); c.lineTo(13, wy - 6); c.lineTo(17, wy + 12); c.lineTo(-17, wy + 12); c.closePath(); fs(c, '#55803a', '#2f4a1e', 2);
    } else { c.beginPath(); c.moveTo(-s / 2 + 10, f1 - 10); c.lineTo(s / 2 - 10, f0 + 10); c.strokeStyle = shade(wood[1], -0.18); c.lineWidth = 7; c.stroke(); }
    c.fillStyle = 'rgba(255,240,205,.2)'; c.fillRect(-s / 2 + 3, f0 + 3, s - 6, 5);
    rrect(c, -s / 2 - 1, -s - KIT_TOP, s + 2, KIT_TOP * 1.9, 4); fs(c, wood[2], KIT_EDGE, 2.2);
    c.strokeStyle = 'rgba(74,47,26,.28)'; c.lineWidth = 1.4; c.beginPath(); for (const k of [1 / 3, 2 / 3]) { c.moveTo(-s / 2 + s * k, -s - KIT_TOP + 2); c.lineTo(-s / 2 + s * k, -s + KIT_TOP * 0.8); } c.stroke();
    c.restore();
  };
  return { body: b,
    after(dt) {
      b.wobble = Math.max(0, b.wobble - dt); const k = Math.max(0, 1 - dt * 20); b.ox *= k; b.oy *= k;
      if (!b.held && b.impact > 150) { snd(heavy ? 'heavy' : 'put'); puff(b.x, b.y, heavy ? 7 : 3); if (heavy && typeof game !== 'undefined') game.shake = Math.max(game.shake || 0, 0.35); }
      if (b.lost || (!b.held && b.y - b.h > MV.bottom)) { b.lost = false; Object.assign(b, { x: home.x, y: home.y - 3, vx: 0, vy: 0, ox: 0, oy: 0, grounded: false, on: null }); snd('pop'); puff(home.x, home.y - s / 2, 8, '#fff6dc', 1.3); } // fell out of the picture: back where it started
    } };
};
KIT.crate = KIT.box;

// ---------- the see-saw. It tips towards the heavier end. Something heavy LANDING on the high end flings whatever
// is lighter on the other end into the air: her landing launches him. He is too light to launch her.
KIT.seesaw = (world, d, ground) => {
  const cx = d.x, half = d.half || 170, py = ground - 56, drop = 46, rest = d.blue === 'left' ? -1 : 1; // blue: which end is his (default the right one)
  const st = { tilt: rest, slam: 0, shake: 0 }; // tilt 1: the right end is down
  const l = world.ledge(cx - half, cx + half, py - drop * st.tilt, { y1: py + drop * st.tilt });
  const side = (r) => (r.x < cx - 12 ? -1 : r.x > cx + 12 ? 1 : 0);
  return { state: st, ledge: l,
    update(dt) { // before the world moves: tip towards the heavier end
      let left = 0, right = 0; for (const r of world.riders(l)) { const s = side(r), w = world.load(r); if (s < 0) left += w; else if (s > 0) right += w; }
      // empty, it settles back with his (blue) end down, so he can always step on and her end is always the high one
      const empty = left + right === 0, want = right > left ? 1 : left > right ? -1 : empty ? rest : st.tilt >= 0 ? 1 : -1, rate = (st.slam > 0 ? 18 : empty ? 2.2 : 5) * dt;
      st.slam = Math.max(0, st.slam - dt); st.shake = Math.max(0, st.shake - dt);
      st.tilt = clamp(st.tilt + clamp(want - st.tilt, -rate, rate), -1, 1);
      l.y = py - drop * st.tilt; l.y1 = py + drop * st.tilt;
    },
    after() { // after the world has moved: did something just land on the high end?
      const riders = world.riders(l);
      for (const r of riders) {
        if (!(r.impact > MOVE.seesawHit)) continue;
        const s = side(r) || (r.x < cx ? -1 : 1), w = world.load(r), up = st.tilt * s < 0.4;
        const others = riders.filter((o) => o !== r && side(o) === -s), wo = others.reduce((sum, o) => sum + world.load(o), 0);
        if (up && others.length && w > wo) {
          const power = clamp((w - wo) / 2, 0.4, 1), v = speedFor(MOVE.seesawRise * broHeight() * power);
          for (const o of others) { o.y -= 3; o.vy = -v; o.vx = 0; o.grounded = false; o.on = null; o.flying = true; o.tossed = true; }
          st.slam = 0.35; snd('plank'); snd('toss'); puff(r.x, r.y, 6); if (typeof game !== 'undefined') game.shake = Math.max(game.shake || 0, 0.4);
        } else if (up && wo >= w) { st.shake = 0.35; snd('creak'); } // too light to move it: it only creaks
        else if (up) { st.slam = 0.2; snd('plank'); }
      }
    },
    draw(c, t) {
      const ang = Math.atan2(l.y1 - l.y, half * 2) + (st.shake > 0 ? Math.sin(t * 50) * 0.02 * (st.shake / 0.35) : 0), L = half + 10;
      soft(c, cx, ground + 6, half * 0.9, 9, '#2a1a0e', 0.25);
      c.beginPath(); c.moveTo(cx - 46, ground + 10); c.lineTo(cx - 9, py + 6); c.lineTo(cx + 9, py + 6); c.lineTo(cx + 46, ground + 10); c.closePath(); fs(c, lg(c, cx - 46, 0, cx + 46, 0, '#d9534a', '#b03a30'), KIT_EDGE, 2.5); // the stand
      c.beginPath(); c.moveTo(cx - 24, ground + 10); c.lineTo(cx, py + 26); c.lineTo(cx + 24, ground + 10); c.closePath(); c.fillStyle = 'rgba(60,20,15,.3)'; c.fill();
      c.save(); c.translate(cx, py); c.rotate(ang); c.lineJoin = 'round';
      rrect(c, -L, KIT_TOP * 0.6, L * 2, 13, 3); fs(c, lg(c, 0, 0, 0, 20, '#b88d5a', '#96703f'), KIT_EDGE, 2.2);
      rrect(c, -L, -KIT_TOP * 0.7, L * 2, KIT_TOP * 1.4, 3); fs(c, '#dcbb85', KIT_EDGE, 2.2);
      for (const [s, col] of [[-rest, KIT_GREEN], [rest, KIT_BLUE]]) { // her end green, his end blue
        const ex = s < 0 ? -L : L - 84; c.fillStyle = col; c.fillRect(ex + 2, -KIT_TOP * 0.7 + 1.5, 82, KIT_TOP * 1.4 - 3); c.fillStyle = shade(col, -0.2); c.fillRect(ex + 2, KIT_TOP * 0.6 + 1.5, 82, 10);
        c.strokeStyle = '#2c2c34'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(s * (L - 96), -4); c.lineTo(s * (L - 96), -30); c.stroke(); ell(c, s * (L - 96), -32, 6, 6, col); // a handle
      }
      c.restore();
      ell(c, cx, py + 8, 7, 7, '#2c2c34'); ell(c, cx - 2, py + 6, 2.2, 2.2, '#8a8a92');
    } };
};

// ---------- a bell hung high: something to use. She reaches it from the ground; he needs a lift or a box.
KIT.bell = (world, d, ground) => {
  const x = d.x, y = ground - d.h, st = { swing: 0, rings: 0 };
  return { state: st,
    thing: { x, y, canUse: (p) => (p.grounded || p.held) && Math.abs(p.x - x) <= MOVE.arm && sibReachY(p) <= y + 8 && p.y > y,
      use(p) { st.swing = 1.2; st.rings++; p.reachT = 0.35; p.dir = Math.sign(x - p.x) || p.dir; snd('bell'); burst(x, y, 7); } },
    after(dt) { st.swing = Math.max(0, st.swing - dt); },
    draw(c, t) {
      const px = x + 46, top = y - 84;
      soft(c, px, ground + 8, 34, 7, '#2a1a0e', 0.28);
      c.fillStyle = lg(c, px - 8, 0, px + 8, 0, '#8a6844', '#6b4e30', '#4f3820'); rrect(c, px - 8, top, 16, ground + 12 - top, 4); c.fill(); c.strokeStyle = KIT_EDGE; c.lineWidth = 2; c.stroke();
      c.fillStyle = KIT_GREEN; c.fillRect(px - 8, y - 20, 16, 16); c.strokeStyle = '#2f4a1e'; c.lineWidth = 1.6; c.strokeRect(px - 8, y - 20, 16, 16); // a green band: her height
      c.strokeStyle = '#2c2c34'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(px, top + 14); c.lineTo(x - 4, top + 14); c.moveTo(px, top + 44); c.lineTo(x + 14, top + 16); c.stroke();
      c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, top + 14); c.lineTo(x, y - 30); c.stroke();
      c.save(); c.translate(x, y - 30); c.rotate(Math.sin(t * 16) * 0.5 * (st.swing / 1.2)); drawIcon(c, 'bell', 0, 30, 2.1); c.restore();
      if (st.swing > 0) soft(c, x, y, 70, 70, '#fff3b8', 0.4 * (st.swing / 1.2));
    } };
};

// ---------- a star to collect: stand next to it (jumping past does not count)
KIT.star = (world, d, ground) => {
  const x = d.x, y = ground - d.h, st = { got: false, t: 0 };
  return { star: st,
    after(dt) {
      if (st.got) { st.t += dt; return; }
      for (const p of [MV.sis, MV.bro]) if (!p.gone && !p.held && p.grounded && Math.abs(p.x - x) < p.w / 2 + 30 && y > p.y - p.h - 20 && y < p.y + 10) { st.got = true; p.cheer = 0.7; snd('star'); burst(x, y, 12); break; }
    },
    draw(c, t) {
      if (st.got) return; const bob = Math.sin(t * 2.4 + x) * 6;
      soft(c, x, y + bob, 48, 48, '#fff3b8', 0.5); c.save(); c.translate(x, y + bob); c.rotate(Math.sin(t * 1.7 + x) * 0.16); drawIcon(c, 'star', 0, 0, 1.7); c.restore();
      star(c, x + 18, y + bob - 18, 9 + Math.sin(t * 5 + x) * 3, t * 2, 0.8);
    } };
};

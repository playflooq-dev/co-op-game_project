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
// Things that switch other things say so by name. A plate or a lever has an id; a gate or a ferry lists the ids it
// listens to in `by`. A gate with two ids opens only while both are on: that is the two-switch door.
//
// The kinds:
//   plate   { x, id, big }            a pad in the pavement. Small and blue: anybody or any box presses it.
//                                     big: true is big and green: only the sister or a heavy crate presses it.
//   gate    { x, h, by: [ids], latch } a shutter that is open only while everything in `by` is on (latch: stays open once up)
//   lever   { x, h, id, hold, who, once, base }   hold: true is on only while the grab key is held; otherwise each use
//                                     flips it (once: true stays on for good)
//   bar     { x, h }                  a height bar: people walk under, a box carried on the head is knocked off.
//                                     It keeps a station's boxes in that station.
//   trap    { x: [from, to], h, by }  a shelf that drops open when its id comes on: what stood on it falls down
//   pulley  { a, b, high, bias: [a, b], gear, catch, rope: { x, h } }   two platforms on one rope: the heavier goes down (what
//                                     is on b, and the pull, count gear times: a block and tackle). Holding
//                                     the rope pulls on b's side with the holder's own weight.
//   boat    { x, w }                  small and blue, floating: sinks gently under anything heavy, comes back up
//   branch  { x: [from, to], h, from: 'left' | 'right' }   like the thin plank, growing out of one side
//   ferry   { x: [dock, dock], by, home }   a raft that crosses while its id is on, and goes home when it is off
//   ladder  { x, h }                  rolled up on a ledge: used from up there it drops, and then the jump key climbs it
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
const KIT_SIG = {}, KIT_AT = {}; // which ids are on right now, and where each id's plate or lever stands (for drawing the cable to its gate)
const kitOn = (ids) => [].concat(ids).every((id) => KIT_SIG[id]);

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
      const heavy = world.heavyOn(l, MOVE.heavy);
      if (heavy && !st.creaked) snd('creak'); st.creaked = heavy;
      st.stress = heavy ? st.stress + dt / MOVE.plankHold : Math.max(0, st.stress - dt * 3);
      if (st.stress >= 1) { l.off = true; st.gone = MOVE.plankBack; st.stress = 0; st.broke = 0; snd('crack'); puff((x0 + x1) / 2, y, 8, '#dcecf6', 4); }
    },
    draw(c, t) {
      if (d.kind === 'branch') { // a branch growing out of one side: it bends, snaps off at the root, and grows back
        const root = d.from === 'right' ? x1 : x0, s = d.from === 'right' ? -1 : 1, len = x1 - x0, u = st.gone > 0 ? MOVE.plankBack - st.gone : -1;
        if (u > 0.9) return;
        c.save(); c.translate(root, y); c.scale(s, 1); c.globalAlpha = u >= 0 ? 1 - clamp01((u - 0.5) / 0.4) : clamp01(st.age / 0.25);
        c.rotate(u >= 0 ? ease(Math.min(1, u / 0.45)) * 1.3 : st.stress * 0.07 + (st.stress > 0 ? Math.sin(t * 60) * 0.008 : 0));
        c.beginPath(); c.moveTo(-6, -11); c.quadraticCurveTo(len * 0.5, -9, len + 6, -4); c.lineTo(len + 6, 5); c.quadraticCurveTo(len * 0.5, 15, -6, 20); c.closePath(); fs(c, lg(c, 0, -10, 0, 18, '#9a7448', '#6b4e30'), KIT_EDGE, 2.2);
        c.strokeStyle = 'rgba(40,25,15,.3)'; c.lineWidth = 1.4; c.beginPath(); for (let x = 30; x < len - 10; x += 46) { c.moveTo(x, -4); c.quadraticCurveTo(x + 14, 2, x + 26, -2); } c.stroke();
        for (const [lx, ly, r] of [[len * 0.35, 20, 0.5], [len * 0.62, 16, 0.2], [len * 0.9, -12, -0.9], [len + 4, 2, -0.2], [len * 0.75, -13, -1.1]]) { c.save(); c.translate(lx, ly); c.rotate(r + 1.57 + Math.sin(t * 2 + lx) * 0.08); leafPath(c, 26, 9); fs(c, '#7fa8c9', '#2f506e', 1.6); c.restore(); } // blue leaves: light feet only
        c.fillStyle = KIT_BLUE; c.fillRect(len * 0.18, -11, 12, 30); c.strokeStyle = '#2f506e'; c.lineWidth = 1.6; c.strokeRect(len * 0.18, -11, 12, 30);
        c.restore(); return;
      }
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

KIT.branch = KIT.plank;

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
      if (b.lost || (!b.held && (b.y - b.h > MV.bottom || (MV.hooks.lost && MV.hooks.lost(b))))) { b.lost = false; Object.assign(b, { x: home.x, y: home.y - 3, vx: 0, vy: 0, ox: 0, oy: 0, grounded: false, on: null }); snd('pop'); puff(home.x, home.y - s / 2, 8, '#fff6dc', 1.3); } // fell out of the picture: back where it started
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
// icon: which picture it is (a star if none). ride: true means the brother can also take it from her shoulders, so
// it can hang where neither reaches alone. when: 'name' has no place at all: it is given when the world sets
// KIT_SIG['name'] (for petting the puppy, ringing the bell...).
KIT.star = (world, d, ground) => {
  const x = d.x || 0, y = ground - (d.h || 0), icon = d.icon || 'star', st = { got: false, t: 0, icon, x, y };
  return { star: st,
    after(dt) {
      if (st.got) { st.t += dt; return; }
      if (d.when) { if (KIT_SIG[d.when]) { st.got = true; st.x = KIT_SIG[d.when][0] || MV.sis.x; st.y = KIT_SIG[d.when][1] || MV.sis.y - 260; snd('star'); burst(st.x, st.y, 12); } return; }
      for (const p of [MV.sis, MV.bro]) if (!p.gone && (p.held ? d.ride && p === MV.bro && MV.duo.state === 'on' : p.grounded) && Math.abs(p.x - x) < p.w / 2 + 30 && y > p.y - p.h - 20 && y < p.y + 10) { st.got = true; p.cheer = 0.7; snd('star'); burst(x, y, 12); break; }
    },
    draw(c, t) {
      if (st.got || d.when) return; const bob = Math.sin(t * 2.4 + x) * 6;
      soft(c, x, y + bob, 48, 48, '#fff3b8', 0.5); c.save(); c.translate(x, y + bob); c.rotate(Math.sin(t * 1.7 + x) * 0.16); c.beginPath(); circ(c, 0, 0, 27); fs(c, '#fffbf0', '#8a6a3a', 2.5); drawIcon(c, icon, 0, 0, 1.25); c.restore();
      star(c, x + 20, y + bob - 20, 9 + Math.sin(t * 5 + x) * 3, t * 2, 0.8);
    } };
};
KIT.sticker = KIT.star;

// ---------- pressure plates. Small and blue: anybody, or any box. Big and green: only the sister or a heavy crate.
KIT.plate = (world, d, ground) => {
  const big = !!d.big, w = d.w || (big ? 170 : 96), x0 = d.x - w / 2, x1 = d.x + w / 2, rise = 9, col = big ? KIT_GREEN : KIT_BLUE;
  const l = world.ledge(x0, x1, ground - rise), st = { on: false, down: 0 };
  KIT_AT[d.id] = { x: d.x, col };
  return { state: st, ledge: l,
    after(dt) {
      const any = world.riders(l).length > 0, on = big ? world.heavyOn(l, MOVE.heavy) : any;
      if (on !== st.on) snd(on ? 'click' : 'tap'); st.on = on; KIT_SIG[d.id] = on;
      st.down += ((on ? 1 : any ? 0.15 : 0) - st.down) * Math.min(1, dt * 16); l.y = ground - rise + st.down * 6; // too light for a green plate: it barely gives
    },
    draw(c) {
      const y = l.y;
      rrect(c, x0 - 9, ground - 3, w + 18, 17, 5); fs(c, '#4a4650', '#1c1a20', 2);
      rrect(c, x0, y + KIT_TOP * 0.5, w, ground + 9 - y - KIT_TOP * 0.5, 4); fs(c, shade(col, -0.32), '#1c1a20', 2);
      rrect(c, x0, y - KIT_TOP * 0.7, w, KIT_TOP * 1.5, 4); fs(c, st.on ? shade(col, 0.3) : col, '#1c1a20', 2);
      c.fillStyle = 'rgba(255,255,255,.35)'; for (let x = x0 + 14; x < x1 - 8; x += 22) c.fillRect(x, y - 2.5, 10, 3);
      if (st.on) soft(c, d.x, y, w * 0.62, 22, '#fff3b8', 0.55);
    } };
};

// ---------- gates: a roll-up shutter that is open only while every id in `by` is on. Coming down it nudges aside
// whatever is in the doorway; nothing is ever trapped or squashed. Two ids make the two-switch door.
KIT.gate = (world, d, ground) => {
  const w = d.w || 44, x0 = d.x - w / 2, x1 = d.x + w / 2, h = d.h || 440, top = ground - h, head = 46, by = [].concat(d.by);
  const s = world.solid(x0, top, x1, ground), st = { open: 0, latched: false, moving: false };
  return { state: st, solid: s,
    update(dt) {
      const want = st.latched || kitOn(by), before = st.open;
      st.open = clamp(st.open + (want ? dt / (d.opens || 0.6) : -dt / (d.closes || 1)), 0, 1);
      if (d.latch && st.open >= 1 && !st.latched) { st.latched = true; snd('good'); burst(d.x, top + 60, 10); }
      const moving = st.open !== before; if (moving && !st.moving) snd('rattle'); if (!moving && st.moving && st.open === 0) snd('clunk'); st.moving = moving;
      s.y1 = lerp(ground, top + head, ease(st.open));
      if (st.open < before) for (const b of world.bodies) {
        if (b.held || b.x + b.w / 2 <= x0 || b.x - b.w / 2 >= x1 || b.y - b.h >= s.y1 || b.y <= s.y0) continue;
        const left = x0 - b.w / 2 - 1, right = x1 + b.w / 2 + 1, near = b.x < d.x ? left : right;
        b.x = world.fits(b, near) ? near : near === left ? right : left; puff(b.x, b.y - b.h, 2);
      }
    },
    draw(c) {
      const bottom = s.y1;
      by.forEach((id, i) => { // a cable along the pavement from each plate or lever, lit while it is on
        const src = KIT_AT[id]; if (!src) return; const yy = ground + 26 + i * 8;
        c.strokeStyle = 'rgba(40,30,20,.35)'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(src.x, yy); c.lineTo(d.x, yy); c.stroke();
        c.strokeStyle = KIT_SIG[id] ? '#ffe27a' : src.col; c.lineWidth = 3; c.setLineDash([12, 9]); c.beginPath(); c.moveTo(src.x, yy); c.lineTo(d.x, yy); c.stroke(); c.setLineDash([]);
      });
      c.fillStyle = '#3c3a40'; c.fillRect(x0 - 10, top + 10, 8, h + 2); c.fillRect(x1 + 2, top + 10, 8, h + 2);
      const sy = top + head - 6;
      c.fillStyle = lg(c, x0, 0, x1, 0, '#8a949e', '#b6bec8', '#7f8a96'); c.fillRect(x0, sy, w, bottom - sy);
      c.strokeStyle = 'rgba(40,45,55,.45)'; c.lineWidth = 2; for (let y = bottom - 14; y > sy; y -= 14) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
      c.strokeStyle = '#2c2c34'; c.lineWidth = 2.2; c.strokeRect(x0, sy, w, bottom - sy); c.fillStyle = '#5a646e'; c.fillRect(x0 - 3, bottom - 10, w + 6, 10); c.strokeRect(x0 - 3, bottom - 10, w + 6, 10);
      rrect(c, x0 - 18, top - 8, w + 36, head + 8, 9); fs(c, lg(c, 0, top - 8, 0, top + head, '#74747c', '#4a4a52'), '#1c1a20', 2.5);
      by.forEach((id, i) => { // one lamp for each thing that has to be on
        const on = st.latched || !!KIT_SIG[id], src = KIT_AT[id], lx = d.x + (i - (by.length - 1) / 2) * 26, ly = top + 18;
        ell(c, lx, ly, 10, 10, '#1c1a20'); ell(c, lx, ly, 7.5, 7.5, on ? '#ffe27a' : shade(src ? src.col : '#888888', -0.25)); if (on) soft(c, lx, ly, 26, 26, '#ffe27a', 0.6);
      });
    } };
};

// ---------- a lever. hold: true is on only while somebody keeps the grab key down at it; otherwise each use flips it.
// High up (above 230) it is the sister's, with a green band; who: 'bro' makes it one only his small hand works, in blue.
KIT.lever = (world, d, ground) => {
  const x = d.x, y = ground - d.h, st = { on: !!d.on, tilt: d.on ? 1 : 0 }, col = d.who === 'bro' ? KIT_BLUE : d.h > 230 ? KIT_GREEN : '#d9a94e';
  KIT_AT[d.id] = { x, col };
  const thing = { x, y, hold: !!d.hold,
    canUse: (p) => (p.grounded || p.held) && Math.abs(p.x - x) <= MOVE.arm && sibReachY(p) <= y + 8 && p.y > y - 6 && (!d.who || p.kind === d.who),
    use(p) { p.reachT = 0.3; p.dir = Math.sign(x - p.x) || p.dir; if (!d.hold) st.on = d.once ? true : !st.on; snd('latch'); } };
  return { state: st, thing,
    after(dt) {
      if (d.hold) st.on = [MV.sis, MV.bro].some((p) => p.holding === thing);
      KIT_SIG[d.id] = st.on; st.tilt += ((st.on ? 1 : 0) - st.tilt) * Math.min(1, dt * 14);
    },
    draw(c) {
      const px = x + 26, ptop = y - 46;
      const pbot = d.base ? ground - d.base : ground + 12; if (!d.base) soft(c, px, ground + 8, 30, 6, '#2a1a0e', 0.28); // base: it stands on a ledge that high
      c.fillStyle = lg(c, px - 7, 0, px + 7, 0, '#8a6844', '#6b4e30', '#4f3820'); rrect(c, px - 7, ptop, 14, pbot - ptop, 4); c.fill(); c.strokeStyle = KIT_EDGE; c.lineWidth = 2; c.stroke();
      rrect(c, x - 20, y - 26, 52, 52, 8); fs(c, lg(c, 0, y - 26, 0, y + 26, '#8a8a92', '#62626a'), '#1c1a20', 2.2);
      rrect(c, x - 20, y - 26, 52, 11, 5); fs(c, col, '#1c1a20', 1.6);
      rrect(c, x - 4, y - 8, 8, 26, 4); fs(c, '#2c2c34');
      c.save(); c.translate(x, y + 12); c.rotate(lerp(-0.85, 0.85, st.tilt)); c.strokeStyle = '#2c2c34'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -38); c.stroke();
      ell(c, 0, -40, 10, 10, '#1c1a20'); ell(c, 0, -40, 8, 8, st.on ? '#ffe27a' : '#c9402f'); c.restore();
      if (st.on) soft(c, x, y - 20, 34, 34, '#ffe27a', 0.45);
    } };
};

// ---------- the pulley lift: two platforms on one rope, a (the one to ride) and b (the counterweight). The heavier
// side goes down; even, they stay. bias adds weight that is always there (a is a little heavier, so it rests at the
// bottom). Holding the rope pulls on b's side with the holder's own weight: she can haul him up, he cannot haul her.
KIT.pulley = (world, d, ground) => {
  const w = d.w || 150, low = d.low || 12, high = d.high, bias = d.bias || [0.5, 0], st = { u: 0, moving: false, pull: 0 };
  const la = world.ledge(d.a - w / 2, d.a + w / 2, ground - low), lb = world.ledge(d.b - w / 2, d.b + w / 2, ground - high);
  const rope = d.rope ? { x: d.rope.x, y: ground - d.rope.h, hold: true,
    canUse: (p) => p.grounded && Math.abs(p.x - d.rope.x) <= MOVE.arm && sibReachY(p) <= ground - d.rope.h + 8 && p.y > ground - d.rope.h,
    use(p) { p.reachT = 0.3; p.dir = Math.sign(d.rope.x - p.x) || p.dir; snd('creak'); } } : null;
  return { state: st, a: la, b: lb, thing: rope,
    update(dt) {
      st.pull = rope ? [MV.sis, MV.bro].reduce((f, p) => f + (p.holding === rope ? p.weight : 0), 0) : 0;
      const wa = world.loadOn(la) + bias[0], wb = (world.loadOn(lb) + st.pull) * (d.gear || 1) + bias[1], up = wb > wa && !(d.catch && world.loadOn(la) === 0), dir = up ? 1 : wa > wb ? -1 : 0, before = st.u; // catch: it will not go up empty
      st.u = clamp(st.u + dir * (d.speed || 150) * dt / (high - low), 0, 1);
      const moving = st.u !== before; if (moving && !st.moving) snd('creak'); if (!moving && st.moving) snd('clunk'); st.moving = moving;
      la.y = ground - lerp(low, high, st.u); lb.y = ground - lerp(high, low, st.u);
    },
    draw(c) {
      const beam = ground - high - 230, xs = [d.a, d.b].concat(rope ? [rope.x] : []), xl = Math.min(...xs) - w / 2 - 34, xr = Math.max(...xs) + (rope ? 40 : w / 2 + 34);
      for (const px of [xl, xr]) { soft(c, px, ground + 8, 34, 7, '#2a1a0e', 0.28); c.fillStyle = lg(c, px - 9, 0, px + 9, 0, '#8a6844', '#6b4e30', '#4f3820'); c.fillRect(px - 9, beam, 18, ground + 12 - beam); c.strokeStyle = KIT_EDGE; c.lineWidth = 2; c.strokeRect(px - 9, beam, 18, ground + 12 - beam); }
      rrect(c, xl - 16, beam - 14, xr - xl + 32, 24, 5); fs(c, lg(c, 0, beam - 14, 0, beam + 10, '#b88d5a', '#8a643a'), KIT_EDGE, 2.2);
      c.strokeStyle = '#8a6f44'; c.lineWidth = 3.5; c.lineCap = 'round';
      for (const [x, l, basket] of [[d.a, la, false], [d.b, lb, true]]) {
        const y = l.y, wy = beam + 34;
        c.strokeStyle = '#8a6f44'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(x, wy); c.lineTo(x, y - 96); c.lineTo(x - w / 2 + 10, y - 4); c.moveTo(x, y - 96); c.lineTo(x + w / 2 - 10, y - 4); c.stroke();
        c.strokeStyle = '#2c2c34'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, beam + 8); c.lineTo(x, wy); c.stroke();
        c.beginPath(); circ(c, x, wy, 18); fs(c, '#5a5a62', '#1c1a20', 2.5); c.save(); c.translate(x, wy); c.rotate(st.u * 9 * (basket ? -1 : 1)); c.strokeStyle = '#b9b9c2'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-12, 0); c.lineTo(12, 0); c.moveTo(0, -12); c.lineTo(0, 12); c.stroke(); c.restore();
        if (basket) { rrect(c, x - w / 2 + 6, y - 34, w - 12, 34, 4); fs(c, '#a8824a', KIT_EDGE, 2); c.strokeStyle = 'rgba(74,47,26,.4)'; c.lineWidth = 1.5; c.beginPath(); for (let bx = x - w / 2 + 30; bx < x + w / 2 - 12; bx += 26) { c.moveTo(bx, y - 32); c.lineTo(bx, y - 2); } c.stroke(); } // the back of the basket
        rrect(c, x - w / 2, y + KIT_TOP * 0.6, w, 14, 3); fs(c, lg(c, 0, y, 0, y + 22, '#b88d5a', '#96703f'), KIT_EDGE, 2.2);
        rrect(c, x - w / 2 - 2, y - KIT_TOP * 0.8, w + 4, KIT_TOP * 1.6, 3); fs(c, '#dcbb85', KIT_EDGE, 2.2);
      }
      if (rope) { // the rope to haul on, with a ring for a handle
        const hy = rope.y + (st.pull ? 34 : 0) + 6;
        c.strokeStyle = '#2c2c34'; c.lineWidth = 5; c.beginPath(); c.moveTo(rope.x, beam + 8); c.lineTo(rope.x, beam + 30); c.stroke(); c.beginPath(); circ(c, rope.x, beam + 34, 12); fs(c, '#5a5a62', '#1c1a20', 2.2);
        c.strokeStyle = '#8a6f44'; c.lineWidth = 4; c.beginPath(); c.moveTo(rope.x, beam + 44); c.lineTo(rope.x, hy - 16); c.stroke();
        c.beginPath(); circ(c, rope.x, hy, 15); c.strokeStyle = '#3a2618'; c.lineWidth = 9; c.stroke(); c.strokeStyle = st.pull ? '#ffe27a' : '#d9a94e'; c.lineWidth = 5.5; c.stroke();
      }
    } };
};

// ---------- a small boat: blue, for light feet. It bobs; under anything heavy it sinks gently and comes back up.
KIT.boat = (world, d, ground) => {
  const w = d.w || 190, x0 = d.x - w / 2, x1 = d.x + w / 2, base = ground + 4, l = world.ledge(x0, x1, base), st = { sink: 0, load: 0, wait: 0, t: d.x * 0.013 };
  return { state: st, ledge: l,
    update(dt) {
      st.t += dt; st.load = world.heavyOn(l, MOVE.heavy) ? st.load + dt : 0;
      if (st.load > 0.12) { if (!st.sink) snd('splash'); st.sink = Math.min(180, st.sink + 240 * dt); st.wait = 2.2; }
      else if (st.wait > 0) st.wait -= dt; else st.sink = Math.max(0, st.sink - 120 * dt);
      l.y = base + st.sink + (st.sink > 0 ? 0 : Math.sin(st.t * 1.7) * 2.5);
    },
    draw(c) {
      c.save(); c.translate(d.x, l.y); c.rotate(Math.sin(st.t * 1.3) * 0.018 + st.sink * 0.0012); c.globalAlpha = 1 - clamp01((st.sink - 70) / 80);
      c.beginPath(); c.moveTo(-w / 2 - 8, -13); c.quadraticCurveTo(0, -5, w / 2 + 8, -13); c.quadraticCurveTo(w / 2 - 2, 24, w / 2 - 36, 31); c.lineTo(-w / 2 + 36, 31); c.quadraticCurveTo(-w / 2 + 2, 24, -w / 2 - 8, -13); c.closePath();
      fs(c, lg(c, 0, -13, 0, 31, '#7fb0d6', '#44709a'), '#1f3a55', 2.5);
      c.strokeStyle = 'rgba(255,250,235,.85)'; c.lineWidth = 5; c.beginPath(); c.moveTo(-w / 2 - 4, -8); c.quadraticCurveTo(0, 0, w / 2 + 4, -8); c.stroke();
      rrect(c, -w / 2 + 16, -7, w - 32, 11, 3); fs(c, '#b9d6ea', '#1f3a55', 1.6);
      c.restore();
    } };
};

// ---------- the ferry: a raft on a cable. While its id is on it crosses to the other dock; off, it goes home.
KIT.ferry = (world, d, ground) => {
  const [xa, xb] = d.x, w = d.w || 210, home = d.home === 0 ? xa : xb, away = d.home === 0 ? xb : xa, y = ground - 15, st = { x: home, moving: false };
  const l = world.ledge(home - w / 2, home + w / 2, y);
  return { state: st, ledge: l,
    update(dt) {
      const target = KIT_SIG[d.by] ? away : home, step = (d.speed || 230) * dt, dx = clamp(target - st.x, -step, step);
      st.x += dx; l.x0 = st.x - w / 2; l.x1 = st.x + w / 2; l.dx = dx;
      if (dx && !st.moving) snd('creak'); if (!dx && st.moving) snd('clunk'); st.moving = !!dx;
    },
    draw(c, t) {
      const x = st.x, cable = y - 250, lo = Math.min(xa, xb) - w / 2 - 26, hi = Math.max(xa, xb) + w / 2 + 26;
      for (const px of [lo, hi]) { c.fillStyle = lg(c, px - 7, 0, px + 7, 0, '#8a6844', '#4f3820'); c.fillRect(px - 7, cable - 14, 14, ground + 12 - cable + 14); c.strokeStyle = KIT_EDGE; c.lineWidth = 2; c.strokeRect(px - 7, cable - 14, 14, ground + 12 - cable + 14); }
      c.strokeStyle = '#3c3a40'; c.lineWidth = 3; c.beginPath(); c.moveTo(lo, cable); c.quadraticCurveTo((lo + hi) / 2, cable + 26, hi, cable); c.stroke();
      const cy = cable + 26 * (1 - Math.pow((x - (lo + hi) / 2) / ((hi - lo) / 2), 2)), bob = Math.sin(t * 1.6) * 1.5;
      c.strokeStyle = '#6b4e30'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, y + bob - 4); c.lineTo(x, cy + 8); c.stroke(); c.beginPath(); circ(c, x, cy + 2, 9); fs(c, '#5a5a62', '#1c1a20', 2);
      c.strokeStyle = '#6b4e30'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); for (const px of [x - w / 2 + 12, x + w / 2 - 12]) { c.moveTo(px, y + bob); c.lineTo(px, y + bob - 58); } c.moveTo(x - w / 2 + 12, y + bob - 54); c.lineTo(x + w / 2 - 12, y + bob - 54); c.stroke();
      rrect(c, x - w / 2 + 10, y + bob + 8, w - 20, 30, 8); fs(c, lg(c, 0, y, 0, y + 40, '#8a5a34', '#5e3b22'), KIT_EDGE, 2.2);
      rrect(c, x - w / 2, y + bob - KIT_TOP * 0.8, w, KIT_TOP * 2, 4); fs(c, '#dcbb85', KIT_EDGE, 2.2);
      c.strokeStyle = 'rgba(74,47,26,.3)'; c.lineWidth = 1.4; c.beginPath(); for (let px = x - w / 2 + 30; px < x + w / 2 - 10; px += 30) { c.moveTo(px, y + bob - 6); c.lineTo(px, y + bob + 10); } c.stroke();
    } };
};

// ---------- a rope ladder, rolled up at the edge of a ledge. Used from up there it drops; then the jump key climbs it.
KIT.ladder = (world, d, ground) => {
  const x = d.x, top = ground - d.h, foot = ground - (d.to || 0), st = { out: d.out ? 1 : 0, going: !!d.out }, lad = { x, top };
  const thing = { x, y: top - 30, canUse: (p) => !st.going && p.grounded && Math.abs(p.y - top) < 8 && Math.abs(p.x - x) <= 90, use(p) { st.going = true; p.reachT = 0.3; p.dir = Math.sign(x - p.x) || p.dir; snd('rattle'); } };
  return { state: st, thing, ladder: (p) => (st.out >= 1 && Math.abs(p.x - x) < 48 && p.y > top + 6 && p.y <= foot + 4 ? lad : null),
    after(dt) { if (st.going && st.out < 1) { st.out = Math.min(1, st.out + dt / 0.6); if (st.out >= 1) snd('clunk'); } },
    draw(c, t) {
      const len = (foot - top - 8) * ease(st.out);
      if (len > 2) {
        c.strokeStyle = '#8a6f44'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); for (const dx of [-17, 17]) { c.moveTo(x + dx, top + 6); c.lineTo(x + dx + Math.sin(t * 1.5) * 1.5, top + 6 + len); } c.stroke();
        for (let y = top + 28; y < top + len; y += 30) { rrect(c, x - 21, y - 4, 42, 8, 3); fs(c, '#c9a36a', KIT_EDGE, 1.6); }
      }
      c.strokeStyle = '#2c2c34'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); for (const dx of [-17, 17]) { c.moveTo(x + dx, top + 10); c.lineTo(x + dx, top - 12); c.lineTo(x + dx + 10, top - 12); } c.stroke(); // the hooks over the edge
      if (st.out < 1) { // still rolled up: a bundle with a blue ribbon, for whoever gets up there
        const k = 1 - st.out; c.save(); c.translate(x, top - 24); c.scale(k, k);
        c.beginPath(); circ(c, 0, 0, 24); fs(c, '#c9a36a', KIT_EDGE, 2.2); c.strokeStyle = '#8a6f44'; c.lineWidth = 3; c.beginPath(); for (let a = 0; a < 13; a += 0.4) { const r = 2 + a * 1.5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.stroke();
        c.fillStyle = KIT_BLUE; c.fillRect(-26, -5, 52, 10); c.strokeStyle = '#1f3a55'; c.lineWidth = 1.6; c.strokeRect(-26, -5, 52, 10); c.restore();
      }
    } };
};

// ---------- a height bar, like the ones at car parks. People walk under it; a box carried on the head does not fit
// and is knocked off. Put one at the end of a station and its boxes stay in that station.
KIT.bar = (world, d, ground) => {
  const h = d.h || 234, w = 30, x0 = d.x - w / 2, x1 = d.x + w / 2, top = ground - h - 30; world.solid(x0, top, x1, ground - h);
  return { draw(c) {
    c.fillStyle = '#3c3a40'; c.fillRect(d.x - 4, top + 6, 8, ground + 12 - top);
    soft(c, d.x, ground + 8, 26, 6, '#2a1a0e', 0.28);
    rrect(c, d.x - 44, top, 88, 30, 6); fs(c, '#fffbf0', '#1c1a20', 2.2);
    c.save(); rrect(c, d.x - 44, top, 88, 30, 6); c.clip(); c.fillStyle = '#d9534a'; for (let x = d.x - 60; x < d.x + 50; x += 30) { c.beginPath(); c.moveTo(x, top + 30); c.lineTo(x + 15, top + 30); c.lineTo(x + 30, top); c.lineTo(x + 15, top); c.closePath(); c.fill(); } c.restore();
    // a little picture: no boxes past here
    const sy = top - 34; c.beginPath(); circ(c, d.x, sy, 24); fs(c, '#fffbf0', '#c9402f', 5); rrect(c, d.x - 11, sy - 10, 22, 20, 3); fs(c, '#c9a36a', KIT_EDGE, 2);
    c.strokeStyle = '#c9402f'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(d.x - 16, sy + 16); c.lineTo(d.x + 16, sy - 16); c.stroke();
  } };
};

// ---------- a trapdoor shelf: it holds whatever stands on it until its id comes on, then swings down and lets it fall
KIT.trap = (world, d, ground) => {
  const [x0, x1] = d.x, y = ground - d.h, l = world.ledge(x0, x1, y), st = { open: 0 };
  return { state: st, ledge: l,
    update(dt) { const on = kitOn(d.by); if (on && !l.off) { l.off = true; snd('clunk'); } st.open = clamp(st.open + (on ? dt / 0.35 : -dt / 0.6), 0, 1); if (!on && st.open === 0) l.off = false; },
    draw(c) {
      const w = x1 - x0;
      c.strokeStyle = '#2c2c34'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0 - 6, y - 150); c.lineTo(x0 - 6, y + 60); c.moveTo(x0 - 6, y - 140); c.lineTo(x1, y - 140); c.stroke(); // a wall crane behind it
      c.lineWidth = 3; c.setLineDash([6, 5]); c.beginPath(); c.moveTo(x1 - 14, y - 140); c.lineTo(x1 - 14, y - 6 + st.open * 60); c.stroke(); c.setLineDash([]);
      c.save(); c.translate(x0, y); c.rotate(ease(st.open) * 1.45);
      rrect(c, 0, KIT_TOP * 0.6, w, 13, 3); fs(c, lg(c, 0, 0, 0, 20, '#b88d5a', '#96703f'), KIT_EDGE, 2.2); rrect(c, -2, -KIT_TOP * 0.8, w + 4, KIT_TOP * 1.7, 3); fs(c, '#dcbb85', KIT_EDGE, 2.2);
      c.restore(); ell(c, x0, y + 4, 7, 7, '#2c2c34');
    } };
};
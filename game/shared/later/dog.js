'use strict';
// SAVED FOR A LATER LEVEL. No page loads this file.
// The friendly dog from the first version of Level 1 (the park). The client found it fun, but too much while players
// are still learning to move, so on 2026-11-24 it was taken out of Level 1 altogether. Nothing here was changed
// except that it no longer hands out a sticker.
//   dog  { x, to }   sits by the path at x until somebody comes close, then tags along behind whoever is nearest, as
//                    far as `to`. It hops up steps and over logs, yips, wags, and likes to be petted (the grab key).
// To use it in a level built on the object kit: add <script src="shared/later/dog.js"></script> to the page after
// shared/kit.js (or put the file name in LOAD.script), then place it with a line of settings:
//   { kind: 'dog', x: 810, to: 3220 }
// It has after(dt) and drawFront(c, t), like the kit's other kinds, and `thing` for the grab key.
// It needs shared/physics.js, movement.js, kit.js and icons.js, and the sound 'bark' from shared/sound.js.
// Its state: state.mode ('wait' or 'follow'), state.pats (how often it was petted).

// The drawing is the city's market puppy, in another coat and with a red collar.
function drawParkDog(c, x, y, dir, t, run, sit, happy) {
  const ph = t * (run ? 18 : 5), bob = run ? Math.abs(Math.sin(ph)) * 5 : 0, wag = Math.sin(t * (sit ? 16 : 9)) * (sit ? 0.6 : 0.3);
  c.save(); c.translate(x, y + 8 - bob); c.scale(dir * 1.5, 1.5); c.lineCap = 'round'; c.lineJoin = 'round';
  const fur = '#f3ead8', dark = '#8a6a48', patch = '#b9834e';
  c.strokeStyle = dark; c.lineWidth = 6;
  for (const [lx, o] of [[-18, 0], [-10, Math.PI], [14, Math.PI * 0.5], [22, Math.PI * 1.5]]) { c.beginPath(); if (sit && lx < 0) { c.moveTo(lx, -14); c.lineTo(lx + 10, -2); } else { const sw = run ? Math.sin(ph + o) * 8 : 0; c.moveTo(lx, -16); c.lineTo(lx + sw, -1); } c.stroke(); }
  c.save(); c.translate(-26, sit ? -16 : -26); c.rotate(-0.9 + wag); c.strokeStyle = patch; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-6, -10, -2, -20); c.stroke(); c.restore();
  c.beginPath(); c.ellipse(0, sit ? -22 : -26, 30, 14, sit ? -0.35 : 0, 0, TAU); fs(c, fur, dark, 2);
  c.beginPath(); c.ellipse(-10, sit ? -24 : -30, 12, 8, 0, 0, TAU); c.fillStyle = patch; c.fill();
  const hx = 28, hy = sit ? -46 : -40;
  c.strokeStyle = '#d9534a'; c.lineWidth = 5; c.beginPath(); c.moveTo(hx - 12, hy + 12); c.lineTo(hx - 1, hy + 15); c.stroke(); ell(c, hx - 5, hy + 17, 2.6, 2.6, '#f2c94e'); // collar and tag
  c.beginPath(); circ(c, hx, hy, 14); fs(c, fur, dark, 2);
  c.beginPath(); c.ellipse(hx + 13, hy + 5, 9, 7, 0, 0, TAU); fs(c, '#fffaf0', dark, 1.5); ell(c, hx + 21, hy + 2, 3.5, 3, '#2a1a10');
  if (happy) { c.strokeStyle = '#2a1a10'; c.lineWidth = 2; c.beginPath(); c.arc(hx + 5, hy - 2, 3, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); } else { ell(c, hx + 5, hy - 3, 2.6, 2.6, '#2a1a10'); ell(c, hx + 6, hy - 4, 0.9, 0.9, '#fff'); }
  c.save(); c.translate(hx - 7, hy - 9); c.rotate(0.5 + (run ? Math.sin(ph) * 0.3 : 0)); c.beginPath(); c.ellipse(0, 8, 6, 11, 0, 0, TAU); fs(c, patch, dark, 1.4); c.restore();
  if (sit || happy) { c.beginPath(); c.ellipse(hx + 16, hy + 12, 3, 5, 0, 0, TAU); c.fillStyle = '#e8728a'; c.fill(); }
  c.restore();
}
KIT.dog = (world, d, ground) => {
  const probe = makeBody({ w: 44, h: 40 }), st = { mode: 'wait', x: d.x, y: ground, dir: 1, t: 0, bark: 0, hop: 0, run: false, pats: 0, happy: 0, bye: false };
  const yip = (hop = 0.35) => { st.bark = 1.6; st.hop = hop; snd('bark'); };
  const thing = { get x() { return st.x; }, get y() { return st.y - 40; },
    canUse: (p) => p.grounded && !p.carry && Math.abs(p.x - st.x) < 130 && Math.abs(p.y - st.y) < 50,
    use(p) { st.mode = 'follow'; st.pats++; st.happy = 1.6; yip(0.5); p.reachT = 0.35; p.dir = Math.sign(st.x - p.x) || p.dir; burst(st.x, st.y - 70, 8); } };
  return { state: st, thing,
    after(dt) {
      st.t += dt; st.bark = Math.max(0, st.bark - dt); st.hop = Math.max(0, st.hop - dt); st.happy = Math.max(0, st.happy - dt);
      const sibs = [MV.sis, MV.bro].filter((p) => !p.gone); if (!sibs.length) return;
      const near = sibs.reduce((a, b) => (Math.abs(a.x - st.x) < Math.abs(b.x - st.x) ? a : b));
      if (st.mode === 'wait') { // it sits by the path until somebody comes close
        st.dir = near.x < st.x ? -1 : 1; st.run = false;
        if (Math.abs(near.x - st.x) < 230) { st.mode = 'follow'; yip(); }
      } else { // and then tags along behind whoever is closest, as far as the first gate
        // It comes up to them from whichever side it is on and stops a step away, so standing still is enough to pet it.
        const side = Math.sign(near.x - st.x) || 1, want = clamp(near.x - side * 95, d.x - 400, d.to), gap = want - st.x;
        st.run = Math.abs(gap) > (st.run ? 12 : 70); if (st.run) { st.dir = Math.sign(gap); st.x += st.dir * Math.min(Math.abs(gap), 390 * dt); } else st.dir = near.x < st.x ? -1 : 1;
        if (!st.bye && st.x >= d.to - 4 && sibs.every((p) => p.x > d.to + 260)) { st.bye = true; yip(); }      // a goodbye yip when they go on without it
        if (st.bye && near.x < d.to) st.bye = false;
        if (st.bark <= 0 && st.run && Math.random() < dt * 0.2) yip(0.3);
      }
      const fl = world.below(probe, st.x, ground - 260).y; st.y += ((fl === Infinity ? ground : fl) - st.y) * Math.min(1, dt * 16); // up the steps, over the fence and the log
    },
    drawFront(c, t) { // in front of the siblings, at the near edge of the path
      const hop = st.hop > 0 ? Math.abs(Math.sin(st.hop / 0.35 * Math.PI)) * 16 : 0, sit = !st.run;
      soft(c, st.x, st.y + 22, 44, 7, '#2a1a0e', 0.22);
      drawParkDog(c, st.x, st.y + 14 - hop, st.dir, t, st.run, sit, st.happy > 0);
      if (st.bark > 1.1) { c.save(); c.globalAlpha = Math.min(1, (st.bark - 1.1) * 3); for (const a of [-0.5, 0, 0.5]) { c.strokeStyle = '#fffbf0'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(st.x + st.dir * 72 + Math.sin(a) * 6, st.y - 56 - hop + a * 30); c.lineTo(st.x + st.dir * 94, st.y - 60 - hop + a * 46); c.stroke(); } c.restore(); }
      if (st.happy > 0.6) for (let k = 0; k < 2; k++) { const u = 1 - (st.happy - 0.6), hx = st.x + (k ? 26 : -22), hy = st.y - 100 - u * 46 - k * 14; c.save(); c.globalAlpha = Math.min(1, st.happy - 0.6) ; drawIcon(c, 'heart', hx, hy, 0.75); c.restore(); }
    } };
};

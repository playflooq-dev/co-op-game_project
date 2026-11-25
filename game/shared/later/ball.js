'use strict';
// SAVED FOR A LATER LEVEL. No page loads this file.
// The beach ball from the first version of Level 1 (the park). The client found it fun, but too much while players
// are still learning to move, so on 2026-11-24 it was taken out of Level 1 altogether. Nothing here was changed.
//   ball  { x }   a ball that rolls and bounces when somebody runs or jumps into it. It stays within a stretch of the
//                 path around x (420 to the left, 260 to the right). It cannot be carried and nothing depends on it.
// To use it in a level built on the object kit: add <script src="shared/later/ball.js"></script> to the page after
// shared/kit.js (or put the file name in LOAD.script), then place it with a line of settings:
//   { kind: 'ball', x: 1620 }
// It has after(dt) and draw(c, t), like the kit's other kinds. It needs shared/movement.js, kit.js and icons.js.

KIT.ball = (world, d, ground) => {
  const r = 30, st = { x: d.x, y: ground - r, vx: 0, vy: 0, rot: 0, rest: 0 }, lo = d.x - 420, hi = d.x + 260;
  return { state: st,
    after(dt) {
      for (const p of [MV.sis, MV.bro]) { // a nudge from whoever runs or jumps into it
        if (p.gone || Math.abs(p.x - st.x) > p.w / 2 + r || st.y + r < p.y - p.h || st.y - r > p.y) continue;
        const push = Math.sign(st.x - p.x) || p.dir;
        if (st.rest <= 0 && (Math.abs(p.vx) > 40 || !p.grounded)) { st.vx = push * (220 + Math.abs(p.vx) * 0.9); st.vy = -360 - Math.random() * 120; st.rest = 0.25; snd('land'); }
      }
      st.rest = Math.max(0, st.rest - dt);
      st.vy += 1900 * dt; st.x += st.vx * dt; st.y += st.vy * dt; st.rot += st.vx * dt / r;
      if (st.y > ground - r) { st.y = ground - r; if (st.vy > 120) { st.vy *= -0.55; puff(st.x, ground, 2); } else st.vy = 0; st.vx *= 1 - Math.min(1, dt * 1.6); }
      if (st.x < lo) { st.x = lo; st.vx = Math.abs(st.vx) * 0.6; } if (st.x > hi) { st.x = hi; st.vx = -Math.abs(st.vx) * 0.6; }
    },
    draw(c) {
      soft(c, st.x, ground + 4, r * (1 - (ground - r - st.y) / 400), 6, '#2a1a0e', 0.28);
      c.save(); c.translate(st.x, st.y); c.rotate(st.rot);
      c.beginPath(); circ(c, 0, 0, r); fs(c, '#fffbf0', INK, 2.5); c.save(); c.clip();
      for (let i = 0; i < 6; i += 2) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r + 2, i * TAU / 6, (i + 1) * TAU / 6); c.closePath(); c.fillStyle = ['#d9534a', '#f2c94e', '#4b86b8'][i / 2]; c.fill(); }
      c.restore(); c.beginPath(); circ(c, 0, 0, r); c.strokeStyle = INK; c.lineWidth = 2.5; c.stroke(); ell(c, 0, 0, 6, 6, '#fffbf0');
      c.restore(); ell(c, st.x - 9, st.y - 11, 7, 5, '#fff', 0.5);
    } };
};

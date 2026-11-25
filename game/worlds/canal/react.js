'use strict';
// Small reactions for the canal: each one answers something a player has just done, and none is on the first screen
// except the gate's wobble as it opens. (The plank's creak and bend are part of the plank itself, in things.js; the
// plates' click, the boxes' thump and the siblings' cheer when a puzzle is solved come with the kit and level.js.)
//   boats      bob as always, and dip and send out a ripple when he steps on
//   gates      wobble as they open
//   the water  a splash and a duck's quack when somebody falls in; the other sibling starts
//   the end    confetti when the Old Bridge is down: the only big celebration, at the end of the chapter
// level.js calls reactUpdate, reactDrawFront, reactSolved and reactSplash if they are there.

// a duck's quack, made by code like the other sounds in shared/sound.js
if (typeof SFX !== 'undefined' && !SFX.quack) SFX.quack = (a) => { for (const at of [0, 0.13]) { tone(a, { f: 560, to: 400, dur: 0.09, vol: 0.09, type: 'sawtooth', at }); noise(a, { f: 1500, kind: 'bandpass', q: 3, dur: 0.06, vol: 0.05, at }); } };

const REACT = { quack: 0, quacks: 0, dips: 0, wobbles: 0, confetti: [] };

// ---------- the small boats dip under light feet
KIT.lightboat = (world, d, ground) => {
  const o = canalBoat(KIT.boat(world, d, ground), world), l = o.ledge, update = o.update, st = o.state; st.dip = 0; st.dv = 0; st.riders = 0;
  o.update = (dt) => {
    update(dt);
    const n = world.riders(l).length; if (n > st.riders && !st.sink) { st.dv += 62; REACT.dips++; snd('drip'); puff(d.x, ground + 14, 4, '#d6ecf6', 2.4); } st.riders = n;
    st.dv += (-150 * st.dip - 11 * st.dv) * dt; st.dip = clamp(st.dip + st.dv * dt, -3, 4.5);
    l.y += st.dip; // (never more than a step down from the quay or the raft)
  };
  return o;
};

// ---------- gates wobble as they open
KIT.lockgate = (world, d, ground) => {
  const o = KIT.gate(world, d, ground), st = o.state, update = o.update, draw = o.draw, top = ground - (d.h || 440); st.wob = 0; st.was = 0;
  o.update = (dt) => { update(dt); if (st.open >= 1 && st.was < 1) { st.wob = 0.5; REACT.wobbles++; } st.was = st.open; st.wob = Math.max(0, st.wob - dt); };
  o.draw = (c, t) => { if (st.wob <= 0) { draw(c, t); return; } c.save(); c.translate(d.x, top); c.rotate(Math.sin(st.wob * 40) * 0.028 * (st.wob / 0.5)); c.translate(-d.x, -top); draw(c, t); c.restore(); };
  return o;
};

// ---------- somebody fell in: a quack a moment after the splash, and the other one starts
function reactSplash(b) {
  if (!b.who) return; // (a box: the splash is enough)
  REACT.quack = 0.28; const o = partner(b); if (o && !o.gone && o.grounded) o.sqv = -3.5;
}
function reactSolved(n) { // the Old Bridge is down: confetti over the river
  if (n !== 6) return; const x = (RIVER[0] + RIVER[1]) / 2;
  for (let i = 0; i < 70; i++) REACT.confetti.push({ x: x + (Math.random() - 0.5) * 1100, y: FEET - 520 - Math.random() * 220, vx: (Math.random() - 0.5) * 260, vy: -120 - Math.random() * 220, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 14, life: 3 + Math.random() * 1.6, col: ['#d9534a', '#f2c94e', '#4b86b8', '#6d9b45', '#e8728a', '#fffbf0'][i % 6] });
}
function reactUpdate(dt) {
  if (REACT.quack > 0) { REACT.quack -= dt; if (REACT.quack <= 0) { REACT.quacks++; snd('quack'); } }
  for (const f of REACT.confetti) { f.life -= dt; f.vy += 520 * dt; f.vx *= 1 - dt * 1.2; f.x += f.vx * dt + Math.sin(f.life * 9 + f.rot) * 40 * dt; f.y += Math.min(f.vy, 190) * dt; f.rot += f.spin * dt; }
  if (REACT.confetti.length && REACT.confetti[0].life <= 0) REACT.confetti = REACT.confetti.filter((f) => f.life > 0);
}
function reactDrawFront(c) {
  for (const f of REACT.confetti) { c.save(); c.translate(f.x, f.y); c.rotate(f.rot); c.globalAlpha = Math.min(1, f.life * 2); c.fillStyle = f.col; c.fillRect(-7, -4 * Math.cos(f.rot * 1.7), 14, 8 * Math.cos(f.rot * 1.7)); c.restore(); }
}

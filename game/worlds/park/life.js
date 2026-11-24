'use strict';
// (The dog of the first version is saved for a later level, in shared/later/dog.js.)
// Everything in the park that only reacts: nothing here is needed to finish the level, it is there so that the easy
// parts are fun to walk through. Small drawings and short sounds only, so that a phone is not slowed down.
//   birds    { x, n, h }          little birds that fly up when somebody jumps or runs close, and come back later
//   flowers  { x: [from, to], n } flowers and grass that bounce when somebody walks through
// and added to the park's own objects in things.js:
//   parkbox  a cat sits on the box and hops off when it is picked up; the box squashes and puffs dust when it lands
//   pond     ducks that paddle about and swim away from a splash
// At the bottom: what the siblings do themselves (cheer when a gate opens, a giggle when he is lifted, her proud look
// when he has the balloon, a wave when they are apart), the glow of the plates and the confetti at the way out.

// a few more sounds, made by code like the others in shared/sound.js
if (typeof SFX !== 'undefined') Object.assign(SFX, {
  giggle: (a) => { for (let i = 0; i < 5; i++) tone(a, { f: 760 + (i % 2) * 150 + i * 30, to: 900 + i * 40, dur: 0.07, vol: 0.07, type: 'sine', at: i * 0.085 }); },
  quack: (a) => { for (const at of [0, 0.13]) { tone(a, { f: 560, to: 400, dur: 0.09, vol: 0.09, type: 'sawtooth', at }); noise(a, { f: 1500, kind: 'bandpass', q: 3, dur: 0.06, vol: 0.05, at }); } },
  meow: (a) => { tone(a, { f: 640, to: 980, dur: 0.16, vol: 0.07, type: 'triangle' }); tone(a, { f: 980, to: 720, dur: 0.24, vol: 0.07, type: 'triangle', at: 0.15 }); },
  chirp: (a) => { for (let i = 0; i < 3; i++) tone(a, { f: 2300 + i * 250, to: 3100, dur: 0.05, vol: 0.05, type: 'sine', at: i * 0.07 }); },
  rustle: (a) => noise(a, { f: 3200, kind: 'highpass', dur: 0.09, vol: 0.035, attack: 0.03 }),
});
const lifeSibs = () => [MV.sis, MV.bro].filter((p) => !p.gone);

// ---------- birds
function drawBird(c, x, y, dir, col, flying, t, peck) {
  c.save(); c.translate(x, y); c.scale(dir * 1.15, 1.15); c.lineJoin = 'round'; c.lineCap = 'round';
  if (!flying) { c.strokeStyle = '#6a4a2a'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-2, -3); c.lineTo(-3, 0); c.moveTo(3, -3); c.lineTo(3, 0); c.stroke(); c.rotate(Math.sin(Math.min(1, peck * 2) * Math.PI) * 0.75); }
  c.beginPath(); c.moveTo(-9, -13); c.lineTo(-22, -18); c.lineTo(-11, -7); c.closePath(); fs(c, shade(col, -0.25), INK, 1.4);                // tail
  c.beginPath(); c.ellipse(0, -11, 13, 10, -0.15, 0, TAU); fs(c, col, INK, 1.6); ell(c, 4, -8, 8, 6, '#fff3dc');                             // body, belly
  c.beginPath(); circ(c, 10, -20, 7.5); fs(c, col, INK, 1.6);                                                                                 // head
  c.beginPath(); c.moveTo(16, -22); c.lineTo(24, -19.5); c.lineTo(16, -17); c.closePath(); fs(c, '#f2a23a', INK, 1.2); ell(c, 12, -21.5, 1.7, 1.7, '#1c120a');
  c.save(); c.translate(-2, -14); c.rotate(flying ? -0.5 + Math.sin(t * 32 + x) * 1.1 : 0.25); c.beginPath(); c.ellipse(-4, flying ? -6 : 2, flying ? 7 : 9, flying ? 13 : 5.5, 0, 0, TAU); fs(c, shade(col, -0.18), INK, 1.4); c.restore(); // wing
  c.restore();
}
KIT.birds = (world, d, ground) => {
  const rnd = rng(Math.round(d.x) * 7 + 3), n = d.n || 3, base = ground - (d.h ? d.h : 40), cols = ['#b08a5c', '#6f9fc4', '#d9705a', '#9aa0aa'];
  const birds = []; for (let i = 0; i < n; i++) { const hx = d.x + (i - (n - 1) / 2) * 48 + (rnd() - 0.5) * 18; birds.push({ hx, hy: base - (d.h ? 0 : rnd() * 12), x: hx, y: 0, vx: 0, vy: 0, mode: 'sit', t: rnd() * 3, next: 1 + rnd() * 3, dir: rnd() < 0.5 ? -1 : 1, col: cols[Math.floor(rnd() * cols.length)], peck: 0 }); }
  for (const b of birds) b.y = b.hy;
  const st = { flown: 0, away: 0 };
  return { state: st, birds,
    after(dt) {
      const sibs = lifeSibs(), sitting = birds.some((b) => b.mode === 'sit');
      const scare = sitting && sibs.find((p) => Math.abs(p.x - d.x) < 340 && ((!p.grounded && !p.held && p.vy < -100) || (Math.abs(p.x - d.x) < 120 && Math.abs(p.vx) > 60)));
      const clear = sibs.every((p) => Math.abs(p.x - d.x) > 560);
      if (scare) { st.flown++; st.away = 5; snd('flap'); snd('chirp'); }
      st.away = Math.max(0, st.away - dt);
      for (const b of birds) {
        b.t += dt; b.peck = Math.max(0, b.peck - dt);
        if (b.mode === 'sit') {
          if (scare) { b.mode = 'fly'; b.dir = Math.sign(b.x - scare.x) || 1; b.vx = b.dir * (110 + Math.random() * 190); b.vy = -(280 + Math.random() * 190); b.t = -Math.random() * 0.14; }
          else if (b.t > b.next) { b.t = 0; b.next = 1.2 + Math.random() * 3; if (Math.random() < 0.35) b.dir = -b.dir; else b.peck = 0.5; } // a peck at the ground, or a look the other way
        } else if (b.mode === 'fly') { if (b.t < 0) continue; b.x += b.vx * dt; b.y += b.vy * dt; b.vy -= 90 * dt; if (b.y < -90) b.mode = 'away'; }
        else if (b.mode === 'away') { if (st.away <= 0 && clear) { b.mode = 'back'; b.t = -Math.random() * 0.8; b.dir = -b.dir; } }
        else if (b.t >= 0) { const u = Math.min(1, b.t / 1.5), e = ease(u); b.x = lerp(b.hx - b.dir * 330, b.hx, e); b.y = lerp(-90, b.hy, e) - Math.sin(u * Math.PI) * 30; if (u >= 1) { b.mode = 'sit'; b.t = 0; } } // gliding back down
      }
    },
    draw(c, t) { for (const b of birds) if (b.mode !== 'away' && !(b.mode === 'back' && b.t < 0)) drawBird(c, b.x, b.y, b.dir, b.col, b.mode !== 'sit', t, b.peck); } };
};

// ---------- flowers and grass that bounce when somebody walks through (forest art, turned about its roots)
KIT.flowers = (world, d, ground) => {
  const rnd = rng(Math.round(d.x[0]) + 17), n = d.n || 5, tufts = [], st = { bounced: 0 };
  for (let i = 0; i < n; i++) { const front = rnd() < 0.5, fl = rnd() < 0.6, arts = SP[fl ? 'flowers' : 'grass'];
    tufts.push({ x: lerp(d.x[0], d.x[1], (i + 0.2 + rnd() * 0.6) / n), art: arts[Math.floor(rnd() * arts.length)], s: fl ? 0.42 + rnd() * 0.14 : 0.72 + rnd() * 0.3, front, fl, y: front ? ground + 54 + rnd() * 8 : ground - 30 + rnd() * 5, a: 0, v: 0, inside: {} }); }
  const show = (c, front, t) => { for (const f of tufts) if (f.front === front && f.x > camX - 90 && f.x < camX + VW + 90) { c.save(); c.translate(f.x, f.y); c.rotate(f.a + Math.sin(t * 1.3 + f.x) * 0.025); c.scale(1, 1 - Math.abs(f.a) * 0.25); putFast(c, f.art, 0, 0, f.s); c.restore(); } };
  return { state: st, tufts,
    after(dt) {
      for (const f of tufts) {
        for (const p of [MV.sis, MV.bro]) {
          const inside = !p.gone && Math.abs(p.x - f.x) < 32 && p.y > ground - 30;
          if (inside && !f.inside[p.who] && (Math.abs(p.vx) > 30 || p.impact > 100)) { f.v += (Math.sign(p.vx) || 1) * 6.5; st.bounced++; snd('rustle'); if (f.fl && Math.random() < 0.6) puff(f.x, f.y - 44, 2, '#ffe0ea', 0.5); }
          f.inside[p.who] = inside;
        }
        f.v += (-130 * f.a - 8 * f.v) * dt; f.a = clamp(f.a + f.v * dt, -0.7, 0.7);
      }
    },
    draw(c, t) { show(c, false, t); }, drawFront(c, t) { show(c, true, t); } };
};

// ---------- the cat on the box. Pick the box up and it hops off; leave the box alone for a bit and it hops back on.
function drawCat(c, x, y, dir, t, walk) {
  const fur = '#f0a35a', dark = '#8a4f24', cream = '#fff1dc';
  c.save(); c.translate(x, y); c.scale(dir * 1.3, 1.3); c.lineCap = 'round'; c.lineJoin = 'round';
  let hx = 4, hy = -40;
  if (walk) {
    const ph = t * 16; c.strokeStyle = dark; c.lineWidth = 5; for (const [lx, o] of [[-12, 0], [-6, Math.PI], [10, Math.PI / 2], [16, Math.PI * 1.5]]) { c.beginPath(); c.moveTo(lx, -12); c.lineTo(lx + Math.sin(ph + o) * 6, -1); c.stroke(); }
    c.strokeStyle = fur; c.lineWidth = 5; c.beginPath(); c.moveTo(-18, -18); c.quadraticCurveTo(-31, -24, -27, -42 + Math.sin(t * 6) * 3); c.stroke();
    c.beginPath(); c.ellipse(0, -19, 21, 10, 0, 0, TAU); fs(c, fur, dark, 2); hx = 21; hy = -29;
  } else {
    c.strokeStyle = fur; c.lineWidth = 5.5; c.beginPath(); c.moveTo(-9, -4); c.quadraticCurveTo(-30, -1, -25, -17 + Math.sin(t * 3) * 5); c.stroke();
    c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(-18, -27, 0, -33); c.quadraticCurveTo(16, -27, 14, 0); c.closePath(); fs(c, fur, dark, 2);
    c.beginPath(); c.ellipse(4, -12, 6, 10, 0, 0, TAU); c.fillStyle = cream; c.fill(); ell(c, 2, -2, 4, 3, cream); ell(c, 10, -2, 4, 3, cream);
  }
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(hx + s * 10, hy - 6); c.lineTo(hx + s * 9, hy - 19); c.lineTo(hx + s * 2, hy - 10); c.closePath(); fs(c, fur, dark, 1.6); }
  c.beginPath(); c.ellipse(hx, hy, 12.5, 11, 0, 0, TAU); fs(c, fur, dark, 2);
  const blink = (t * 0.37 + x * 0.01) % 1 < 0.04;
  c.fillStyle = '#2a1a10'; for (const ex of [hx - 1, hx + 7]) { c.beginPath(); c.ellipse(ex, hy - 1, 1.8, blink ? 0.4 : 2.6, 0, 0, TAU); c.fill(); }
  c.beginPath(); c.moveTo(hx + 1.5, hy + 3); c.lineTo(hx + 4.5, hy + 3); c.lineTo(hx + 3, hy + 5); c.closePath(); c.fillStyle = '#e8728a'; c.fill();
  c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1; c.beginPath(); for (const k of [-1, 1]) { c.moveTo(hx + 7, hy + 4); c.lineTo(hx + 18, hy + 4 + k * 2.5); c.moveTo(hx - 2, hy + 4); c.lineTo(hx - 12, hy + 4 + k * 2.5); } c.stroke();
  c.restore();
}
KIT.parkbox = (world, d, ground) => {
  const o = KIT.box(world, d, ground), b = o.body, drawBox = b.draw, afterBox = o.after;
  const top = () => b.y + b.oy - b.h - KIT_TOP + 2, grass = ground - 34;
  const cat = { mode: 'box', x: b.x, y: top(), dir: -1, t: 0, x0: 0, y0: 0, x1: 0, rest: 0, hops: 0 };
  const st = { sq: 0, sqv: 0, landed: 0, cat };
  b.draw = (c, t) => { c.save(); c.translate(b.x, b.y); c.scale(1 + st.sq * 0.8, 1 - st.sq); c.translate(-b.x, -b.y); drawBox(c, t); c.restore(); }; // squash and stretch
  o.state = st;
  o.after = (dt) => {
    const landed = !b.held && b.impact > 150; afterBox(dt);
    if (landed) { st.sqv = 3.4; st.landed++; puff(b.x, b.y, 7, '#eadcb8', 1.9); }
    st.sqv += (-300 * st.sq - 17 * st.sqv) * dt; st.sq = clamp(st.sq + st.sqv * dt, -0.12, 0.22);
    const sibs = lifeSibs(), stood = sibs.some((p) => p.on === b); cat.t += dt;
    if (cat.mode === 'box') {
      cat.x = b.x + b.ox; cat.y = top();
      if (b.held || stood) { // off it goes, to the side away from whoever came
        const who = b.carrier || sibs.find((p) => p.on === b), side = Math.sign(b.x - who.x) || -who.dir;
        Object.assign(cat, { mode: 'hop', t: 0, x0: cat.x, y0: cat.y, x1: b.x + side * 150, y1: grass, dir: side, hops: cat.hops + 1 }); snd('meow');
      }
    } else if (cat.mode === 'hop' || cat.mode === 'hopup') {
      const u = Math.min(1, cat.t / 0.5); if (cat.mode === 'hopup') { cat.x1 = b.x; cat.y1 = top(); }
      cat.x = lerp(cat.x0, cat.x1, u); cat.y = lerp(cat.y0, cat.y1, u) - Math.sin(u * Math.PI) * 78;
      if (u >= 1) { cat.mode = cat.mode === 'hop' ? 'sit' : 'box'; cat.t = 0; cat.rest = 0; }
    } else { // on the grass: it watches, and when the box has been left alone for a moment it goes back
      const alone = !b.held && b.grounded && !stood && sibs.every((p) => Math.abs(p.x - b.x) > 190 && !p.carry);
      cat.rest = alone ? cat.rest + dt : 0;
      if (cat.mode === 'sit') { const near = sibs[0] && sibs.reduce((a, q) => (Math.abs(a.x - cat.x) < Math.abs(q.x - cat.x) ? a : q)); if (near) cat.dir = near.x < cat.x ? -1 : 1; if (cat.rest > 1.6) cat.mode = 'walk'; }
      else if (!alone) cat.mode = 'sit';
      else { const gap = b.x - cat.x; cat.dir = Math.sign(gap) || 1; if (Math.abs(gap) > 110) cat.x += cat.dir * 250 * dt; else Object.assign(cat, { mode: 'hopup', t: 0, x0: cat.x, y0: cat.y }); }
    }
  };
  o.draw = (c, t) => { if (cat.mode !== 'box') { soft(c, cat.x, grass + 3, 26, 5, '#2a1a0e', 0.2); drawCat(c, cat.x, cat.y, cat.dir, t, cat.mode === 'walk'); } };   // on the grass: behind everybody
  o.drawFront = (c, t) => { if (cat.mode === 'box' && !b.held) drawCat(c, cat.x, cat.y, cat.dir, t, false); };                                                       // on the box: in front of it
  return o;
};

// ---------- ducks on the pond
function drawDuck(c, x, y, dir, t, flee, small) {
  const k = small ? 0.72 : 1;
  c.save(); c.translate(x, y); c.scale(dir * k, k); c.lineJoin = 'round'; c.lineCap = 'round';
  c.strokeStyle = 'rgba(255,255,255,.65)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-26, 5); c.quadraticCurveTo(0, 9, 24, 5); c.stroke();
  c.beginPath(); c.moveTo(-20, -2); c.quadraticCurveTo(-30, -14, -22, -18); c.quadraticCurveTo(-12, -10, 12, -12); c.quadraticCurveTo(22, -8, 18, 2); c.quadraticCurveTo(0, 8, -20, -2); c.closePath(); fs(c, small ? '#f6e08a' : '#fffaf0', '#7a6a4a', 1.8);
  c.save(); c.translate(-4, -7); c.rotate(flee ? -0.7 + Math.sin(t * 34) * 0.7 : 0); c.beginPath(); c.ellipse(-2, 0, 11, 5.5, 0, 0, TAU); fs(c, small ? '#efd070' : '#efe6d2', '#7a6a4a', 1.4); c.restore();
  c.beginPath(); circ(c, 14, -20, 8); fs(c, small ? '#f6e08a' : '#fffaf0', '#7a6a4a', 1.8);
  c.beginPath(); c.moveTo(20, -22); c.lineTo(31, -19 - (flee ? 2 : 0)); c.lineTo(20, -16); c.closePath(); fs(c, '#f2a23a', '#a8641e', 1.3); ell(c, 15.5, -22, 1.7, 1.9, '#1c120a');
  c.restore();
}
const lifePond = KIT.pond;
KIT.pond = (world, d, ground) => {
  const o = lifePond(world, d, ground), P = o.pond, st = o.state, afterPond = o.after, drawPond = o.draw; let seen = 0;
  const ducks = [0, 1, 2].map((i) => ({ x: P.a + 150 + i * ((P.b - P.a - 300) / 2), y: P.cy - 5 + (i % 2) * 9, dir: i % 2 ? 1 : -1, vx: 0, t: i * 1.7, turn: 2 + i * 1.3, flee: 0, small: i === 2 }));
  o.ducks = ducks; st.fled = 0;
  o.after = (dt) => {
    afterPond(dt);
    if (st.n !== seen) { seen = st.n; st.fled++; snd('quack'); for (const k of ducks) { k.flee = 1.5; k.dir = Math.sign(k.x - st.at) || 1; k.vx = k.dir * (240 + Math.random() * 70); } } // away from the splash
    for (const k of ducks) {
      k.t += dt; k.flee = Math.max(0, k.flee - dt);
      if (k.flee > 0) { k.vx *= 1 - Math.min(1, dt * 1.7); if (k.flee > 0.9 && Math.random() < dt * 14) puff(k.x - k.dir * 18, k.y + 4, 1, '#e6f4fa', 0.5); }
      else { if (k.t > k.turn) { k.dir = -k.dir; k.turn = k.t + 3 + Math.random() * 4; } k.vx += (k.dir * 20 - k.vx) * Math.min(1, dt * 2); }
      k.x += k.vx * dt;
      if (k.x < P.a + 80) { k.x = P.a + 80; k.dir = 1; k.vx = Math.abs(k.vx) * 0.4; } if (k.x > P.b - 80) { k.x = P.b - 80; k.dir = -1; k.vx = -Math.abs(k.vx) * 0.4; }
    }
  };
  o.draw = (c, t) => { drawPond(c, t); for (const k of ducks) drawDuck(c, k.x, k.y + Math.sin(t * 2 + k.t) * 1.5, k.dir, t, k.flee > 0.5, k.small); };
  return o;
};

// ---------- what the siblings do themselves, and the little rewards. level.js calls these every frame.
const LIFE = { gates: 0, gateCool: 0, cheers: 0, lifted: false, giggles: 0, proud: 0, proudDone: false, waves: 0, wave: { sister: { t: 0, cool: 2 }, brother: { t: 0, cool: 3.2 } }, plates: new Map(), confetti: [] };
function lifeUpdate(dt) {
  const { sis, bro, duo } = MV, steer = (p, to) => { for (const key in to) p.ex[key] += (to[key] - p.ex[key]) * Math.min(1, dt * 12); };
  // a gate opens: they cheer together
  let opened = 0; for (const o of kit) if (o.def.kind === 'parkgate') opened += o.state.opened || 0;
  LIFE.gateCool = Math.max(0, LIFE.gateCool - dt);
  if (opened > LIFE.gates && LIFE.gateCool <= 0) { LIFE.gateCool = 3; LIFE.cheers++; snd('cheer'); for (const p of lifeSibs()) p.cheer = Math.max(p.cheer, 0.8); }
  LIFE.gates = opened;
  // she lifts him: he giggles
  const on = duo.state === 'on'; if (on && !LIFE.lifted) { bro.giggle = 1.5; LIFE.giggles++; snd('giggle'); } LIFE.lifted = on;
  if (bro.giggle > 0 && duo.state) steer(bro, { happy: 1, mouth: 0.65, brow: 0.5, smile: 1 });
  // he has the balloon: she looks proud (chin up, eyes shut, a big smile, a few stars)
  if (balloon.state.got && !LIFE.proudDone) { LIFE.proudDone = true; LIFE.proud = 3; }
  if (LIFE.proud > 0) { LIFE.proud -= dt; steer(sis, { happy: 1, smile: 1, mouth: 0.25, brow: 0.9, head: -0.13, blush: 1, sweat: 0, tilt: 0 }); if (Math.random() < dt * 5) game.sparks.push({ x: sis.x + (Math.random() - 0.5) * 110, y: sis.y - sis.h - 10 - Math.random() * 60, vy: -30, life: 0.8, r: 7 + Math.random() * 6, rot: Math.random() * 3, d: 0 }); }
  // apart and standing still: a wave to the other one
  const gap = Math.abs(sis.x - bro.x);
  for (const p of [sis, bro]) {
    const w = LIFE.wave[p.who], can = !p.gone && p.grounded && !p.carry && !p.holding && !duo.state && p.cheer <= 0;
    w.cool = Math.max(0, w.cool - dt);
    if (w.t <= 0 && w.cool <= 0 && can && p.idle > 0.9 && gap > 520 && gap < 1500 && !partner(p).gone) { w.t = 1.7; LIFE.waves++; }
    if (w.t > 0) {
      w.t -= dt; if (w.t <= 0 || !can || p.m > 0.5) { w.t = 0; w.cool = 6; continue; }
      p.dir = Math.sign(partner(p).x - p.x) || p.dir; if (Math.sin(w.t * 13) > -0.25) p.reachT = Math.max(p.reachT, 0.09); // the arm goes up and down
      steer(p, { smile: 1, mouth: 0.5, brow: 0.6, sweat: 0, tilt: 0 });
    }
  }
  // plates: a few sparkles when one is pressed
  for (const o of kit) if (o.def.kind === 'plate') { const was = LIFE.plates.get(o); if (o.state.on && !was) burst(o.def.x, FEET - 10, 3); LIFE.plates.set(o, o.state.on); }
  for (const f of LIFE.confetti) { f.life -= dt; f.vy += 520 * dt; f.vx *= 1 - dt * 1.2; f.x += f.vx * dt + Math.sin(f.life * 9 + f.rot) * 40 * dt; f.y += Math.min(f.vy, 190) * dt; f.rot += f.spin * dt; }
  if (LIFE.confetti.length && LIFE.confetti[0].life <= 0) LIFE.confetti = LIFE.confetti.filter((f) => f.life > 0);
}
function lifeSolved(n) { // the way out is open: confetti
  if (n !== 5) return; const x = (MV.sis.x + MV.bro.x) / 2;
  for (let i = 0; i < 46; i++) LIFE.confetti.push({ x: x + (Math.random() - 0.5) * 520, y: FEET - 420 - Math.random() * 160, vx: (Math.random() - 0.5) * 260, vy: -160 - Math.random() * 220, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 14, life: 2.6 + Math.random() * 1.2, col: ['#d9534a', '#f2c94e', '#4b86b8', '#6d9b45', '#e8728a', '#fffbf0'][i % 6] });
}
function lifeDrawFront(c, t) {
  for (const o of kit) if (o.def.kind === 'plate' && o.state.on) soft(c, o.def.x, FEET - 4, 78, 24, '#fff3a0', 0.42 + Math.sin(t * 6) * 0.1); // a pressed plate glows
  for (const f of LIFE.confetti) { c.save(); c.translate(f.x, f.y); c.rotate(f.rot); c.globalAlpha = Math.min(1, f.life * 2); c.fillStyle = f.col; c.fillRect(-7, -4 * Math.cos(f.rot * 1.7), 14, 8 * Math.cos(f.rot * 1.7)); c.restore(); }
}

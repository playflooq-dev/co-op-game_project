'use strict';
// The canal's own objects, placed by the SECTIONS in settings.js. They work like the kinds in shared/kit.js (each is
// made from one line of settings and gives back update / after / draw / thing). Most are a kit object with one thing
// added, so that nothing new has to be learned:
//   thinplank   { x: [from, to], h }        THE NEW IDEA. A thin blue plank: it holds him (and a light box) and bends
//                                           a little. Under her it creaks, bends deep and sends her back. It never breaks.
//   footbridge  { x: [from, to], by }       a sturdy bridge with a green edge. It slides out over the water once its
//                                           id comes on, and stays. Before that only its end shows at the far bank.
//   lightboat   { x, w }                    the kit's small blue boat (react.js makes it dip under him)
//   launcher    { x, half, h, to: [x, h], rise }   the kit's see-saw, standing h above the quay if asked. Whoever it
//                                           flings is carried to the place `to` (x, height), so nobody has to steer.
//   raft        { x: [her dock, home], by } the kit's ferry. Once its lever is pulled it goes over to her side by
//                                           itself, and brings back whoever steps on.
//   dropladder  { x, h, by }                the kit's rope ladder, let down while its id is on (a box on a plate)
//   lockgate    { x, by, any, latch }       the kit's gate (react.js makes it wobble as it opens)
//   ducks       { x: [from, to], n }        ducks on the canal in front of the quay. Only to look at.
//   moored      { x }                       a rowing boat tied up at the quay. Only to look at (brown: not a blue boat).
// The Old Bridge at the end is the city's (worlds/city/things.js, kind `bridge`).

// ---------- the thin plank. Light feet only.
KIT.thinplank = (world, d, ground) => {
  const [x0, x1] = d.x, y = ground - (d.h || 0), mid = (x0 + x1) / 2, l = world.ledge(x0, x1, y);
  const st = { sag: 0, at: mid, load: 0, refused: 0, refuse: null, shake: 0, sprung: 0 };
  const heavyOn = () => world.riders(l).find((r) => r.weight + (r.extra || 0) >= MOVE.heavy);
  return { state: st, ledge: l,
    update(dt) { // before the world moves: anything heavy on it is sent back the way it came
      const r = heavyOn(), f = st.refuse;
      if (r && (!f || f.r !== r)) { // she has just stepped or landed on it
        const dir = r.x < mid ? 1 : -1, edge = dir > 0 ? x0 : x1, depth = (r.x - edge) * dir;
        st.refuse = { r, dir, t: 0.2 }; st.refused++; st.shake = 0.5; snd('creak');
        if (depth > 95) { // she jumped well onto it: it springs her back to the bank
          const back = edge - dir * 70; r.vy = -speedFor(90); r.vx = clamp((back - r.x) / 0.42, -1100, 1100); r.grounded = false; r.on = null; r.flying = true; st.sprung++; snd('pop');
        }
      } else if (f) { // a step back, whatever key is held, until she is off it and a moment longer
        if (r === f.r) f.t = 0.2; else f.t -= dt;
        if (f.t <= 0 || f.r.gone) st.refuse = null; else if (f.r.grounded) f.r.vx = -f.dir * 175;
      }
    },
    after(dt) { // how far it bends: a little under him, a little more with the box, deep under her
      let load = 0, at = st.at; for (const r of world.riders(l)) { const w = world.load(r); if (w > load) { load = w; at = r.x; } }
      const heavy = load >= MOVE.heavy, u = clamp01((at - x0) / (x1 - x0)), want = load ? (heavy ? 30 : 5 + (load - 1) * 6) * (heavy ? 1 : 4 * u * (1 - u)) : 0;
      st.load = load; if (load) st.at = at; st.shake = Math.max(0, st.shake - dt);
      st.sag += (want - st.sag) * Math.min(1, dt * (want > st.sag ? 14 : 7));
      l.y = y + Math.min(11, st.sag); // light feet sink with it a little; it stays a step that can be walked off
    },
    draw(c, t) {
      const off = st.sag + (st.shake > 0 ? Math.sin(t * 46) * 3 * (st.shake / 0.5) : 0), rx = clamp(st.at, x0 + 40, x1 - 40), a = x0 - 12, b = x1 + 12;
      const path = (dy) => { c.beginPath(); c.moveTo(a, y + dy); c.bezierCurveTo(lerp(a, rx, 0.6), y + dy + off, lerp(a, rx, 0.85), y + dy + off, rx, y + dy + off); c.bezierCurveTo(lerp(b, rx, 0.85), y + dy + off, lerp(b, rx, 0.6), y + dy + off, b, y + dy); };
      c.lineCap = 'butt'; c.lineJoin = 'round';
      path(8); c.strokeStyle = '#2f506e'; c.lineWidth = 13; c.stroke(); c.strokeStyle = '#5c8ab0'; c.lineWidth = 9; c.stroke();     // its edge
      path(-1); c.strokeStyle = '#2f506e'; c.lineWidth = 14; c.stroke(); c.strokeStyle = '#a9cbe4'; c.lineWidth = 10; c.stroke();   // its top
      c.strokeStyle = 'rgba(47,80,110,.35)'; c.lineWidth = 1.3; c.beginPath(); for (let x = a + 46; x < b - 20; x += 52) { const k = 1 - Math.min(1, Math.abs(x - rx) / (x < rx ? rx - a : b - rx)); c.moveTo(x, y - 5 + off * k); c.lineTo(x - 4, y + 4 + off * k); } c.stroke();
      c.strokeStyle = '#8a6f44'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); for (const ex of [x0 + 2, x1 - 2]) for (const dx of [-7, 0, 7]) { c.moveTo(ex + dx, y - 8); c.lineTo(ex + dx, y + 13); } c.stroke(); // rope lashings
    } };
};

// ---------- the sturdy bridge that slides out: for her. Green edge: heavy feet are welcome.
KIT.footbridge = (world, d, ground) => {
  const [x0, x1] = d.x, y = ground, len = x1 - x0 + 24, l = world.ledge(x0 - 6, x1 + 6, y, { off: true }), st = { on: false, out: 0 };
  return { state: st, ledge: l,
    update(dt) {
      if (KIT_SIG[d.by] && !st.on) { st.on = true; snd('rattle'); }
      if (st.on && st.out < 1) { st.out = Math.min(1, st.out + dt / 0.9); if (st.out >= 1) { l.off = false; snd('clunk'); puff(x0 + 10, y, 5); } }
    },
    draw(c) {
      const src = KIT_AT[d.by], yy = ground + 26; // a cable along the quay from its plate or lever, lit once it is on
      if (src) { c.strokeStyle = 'rgba(40,30,20,.35)'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(src.x, yy); c.lineTo(x1 + 30, yy); c.stroke(); c.strokeStyle = st.on ? '#ffe27a' : src.col; c.lineWidth = 3; c.setLineDash([12, 9]); c.beginPath(); c.moveTo(src.x, yy); c.lineTo(x1 + 30, yy); c.stroke(); c.setLineDash([]); }
      const w = 34 + (len - 34) * ease(st.out), a = x1 + 12 - w, top = y - 2; // it comes out of the far bank
      c.save(); c.beginPath(); c.rect(x0 - 14, top - 40, x1 - x0 + 28, 120); c.clip();
      rrect(c, a, top + 8, w + 30, 30, 4); fs(c, lg(c, 0, top + 8, 0, top + 38, '#8a5a34', '#5e3b22'), KIT_EDGE, 2.2);
      rrect(c, a, top - 5, w + 30, 15, 3); fs(c, '#dcbb85', KIT_EDGE, 2.2);
      c.fillStyle = KIT_GREEN; c.fillRect(a + 2, top - 3.5, 30, 12); c.strokeStyle = '#2f4a1e'; c.lineWidth = 1.5; c.strokeRect(a + 2, top - 3.5, 30, 12);
      c.strokeStyle = 'rgba(74,47,26,.3)'; c.lineWidth = 1.4; c.beginPath(); for (let x = a + 50; x < a + w + 20; x += 34) { c.moveTo(x, top - 4); c.lineTo(x - 3, top + 9); } c.stroke();
      c.fillStyle = '#2c2c34'; for (let x = a + 44; x < a + w + 10; x += 96) { c.fillRect(x, top + 12, 8, 22); }
      c.restore();
    } };
};

KIT.lightboat = (world, d, ground) => KIT.boat(world, d, ground);
KIT.lockgate = (world, d, ground) => KIT.gate(world, d, ground);

// ---------- the see-saw that sends him somewhere: the kit's see-saw, and a flight that needs no steering
KIT.launcher = (world, d, ground) => {
  const base = ground - (d.h || 0), o = KIT.seesaw(world, d, base), after = o.after, st = o.state, tx = d.to[0], ty = ground - d.to[1];
  st.launches = 0; st.guide = null;
  const timeLeft = (b) => { // how long until he is down at the height of the landing place (the world's own rules, in small steps)
    let y = b.y, vy = b.vy, t = 0; const h = 1 / 120;
    for (let i = 0; i < 480; i++) { const g = world.gravity * (vy > 0 ? world.fallFaster : 1), nv = Math.min(world.maxFall, vy + g * h), ny = y + (vy + nv) / 2 * h; if (nv > 0 && ny >= ty) return t + h * clamp01((ty - y) / Math.max(1, ny - y)); y = ny; vy = nv; t += h; }
    return t;
  };
  o.update = ((update) => (dt) => {
    update(dt);
    const b = st.guide; if (!b) return;
    if (b.grounded || b.gone || b.held || !b.flying) { st.guide = null; return; }
    const left = timeLeft(b); b.vx = left > 0.03 ? clamp((tx - b.x) / left, -1400, 1400) : 0; // carried to the landing place, whatever key is held
  })(o.update);
  o.after = (dt) => {
    const keep = MOVE.seesawRise, was = st.slam; if (d.rise) MOVE.seesawRise = d.rise;
    after(dt); MOVE.seesawRise = keep;
    if (st.slam > was) for (const b of [MV.bro, MV.sis]) if (b.flying && b.tossed && b.vy < 0 && !b.grounded && Math.abs(b.x - d.x) < (d.half || 170) + 40) { st.guide = b; st.launches++; }
  };
  return o;
};

// ---------- the raft: the kit's ferry, which knows by itself when to go and when to come back
KIT.raft = (world, d, ground) => {
  const id = d.by + '_go', o = KIT.ferry(world, Object.assign({}, d, { by: id, home: 1 }), ground + 10), update = o.update, mid = (d.x[0] + d.x[1]) / 2;
  o.update = (dt) => { // called: over to her side while she is still there and nobody is on it; with somebody on it: home
    KIT_SIG[id] = !!KIT_SIG[d.by] && world.riders(o.ledge).length === 0 && !MV.sis.gone && MV.sis.x < mid;
    update(dt);
  };
  return o;
};

// ---------- the rope ladder that comes down while its id is on, and rolls up again when it goes off
KIT.dropladder = (world, d, ground) => {
  const o = KIT.ladder(world, d, ground), st = o.state, after = o.after; delete o.thing; // nobody unrolls this one by hand
  o.after = (dt) => {
    const on = !!KIT_SIG[d.by];
    if (on && !st.going) { st.going = true; snd('rattle'); }
    if (!on && st.out > 0) { st.going = false; st.out = Math.max(0, st.out - dt / 0.6); for (const p of [MV.sis, MV.bro]) if (p.climb && p.climb.x === d.x) { p.climb = null; p.gravity = 1; } } // whoever was on it comes down gently
    after(dt);
  };
  const draw = o.draw; o.draw = (c, t) => { // a cable from its plate, like a gate has
    const src = KIT_AT[d.by], yy = ground + 34; if (src) { const on = !!KIT_SIG[d.by]; c.strokeStyle = 'rgba(40,30,20,.35)'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(src.x, yy); c.lineTo(d.x, yy); c.stroke(); c.strokeStyle = on ? '#ffe27a' : src.col; c.lineWidth = 3; c.setLineDash([12, 9]); c.beginPath(); c.moveTo(src.x, yy); c.lineTo(d.x, yy); c.stroke(); c.setLineDash([]); }
    draw(c, t);
  };
  return o;
};

// ---------- only to look at: ducks on the canal in front, and a rowing boat tied up at the quay
function drawCanalDuck(c, x, y, dir, t, small) {
  const k = small ? 0.72 : 1;
  c.save(); c.translate(x, y); c.scale(dir * k, k); c.lineJoin = 'round'; c.lineCap = 'round';
  c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-26, 5); c.quadraticCurveTo(0, 9, 24, 5); c.stroke();
  c.beginPath(); c.moveTo(-20, -2); c.quadraticCurveTo(-30, -14, -22, -18); c.quadraticCurveTo(-12, -10, 12, -12); c.quadraticCurveTo(22, -8, 18, 2); c.quadraticCurveTo(0, 8, -20, -2); c.closePath(); fs(c, small ? '#f6e08a' : '#fffaf0', '#7a6a4a', 1.8);
  c.beginPath(); c.ellipse(-6, -7, 11, 5.5, 0, 0, TAU); fs(c, small ? '#efd070' : '#efe6d2', '#7a6a4a', 1.4);
  c.beginPath(); circ(c, 14, -20, 8); fs(c, small ? '#f6e08a' : '#fffaf0', '#7a6a4a', 1.8);
  c.beginPath(); c.moveTo(20, -22); c.lineTo(31, -19); c.lineTo(20, -16); c.closePath(); fs(c, '#f2a23a', '#a8641e', 1.3); ell(c, 15.5, -22, 1.7, 1.9, '#1c120a');
  c.restore();
}
KIT.ducks = (world, d, ground) => {
  const [a, b] = d.x, n = d.n || 3, y = CANAL.kerb + 62;
  const ducks = Array.from({ length: n }, (_, i) => ({ x: lerp(a + 40, b - 40, (i + 0.5) / n), y: y + (i % 2) * 12, dir: i % 2 ? 1 : -1, t: i * 1.7, turn: 3 + i * 1.9, small: i === n - 1 }));
  return { ducks,
    after(dt) { for (const k of ducks) { k.t += dt; if (k.t > k.turn) { k.dir = -k.dir; k.turn = k.t + 4 + ((k.x * 7) % 5); } k.x += k.dir * 16 * dt; if (k.x < a) { k.x = a; k.dir = 1; } if (k.x > b) { k.x = b; k.dir = -1; } } },
    drawFront(c, t) { for (const k of ducks) drawCanalDuck(c, k.x, k.y + Math.sin(t * 2 + k.t) * 1.5, k.dir, t, k.small); } };
};
KIT.moored = (world, d, ground) => {
  const x = d.x, y = CANAL.kerb + 58;
  return { drawFront(c, t) {
    const bob = Math.sin(t * 1.4) * 2.5, w = 250;
    c.strokeStyle = '#8a6f44'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 150, CANAL.kerb + 10); c.quadraticCurveTo(x - 140, y + 6, x - w / 2 + 6, y - 14 + bob); c.stroke(); // its rope, to a ring in the quay wall
    ell(c, x - 150, CANAL.kerb + 10, 6, 6, '#2c2c34'); ell(c, x - 150, CANAL.kerb + 10, 3, 3, '#8a8a92');
    c.save(); c.translate(x, y + bob); c.rotate(Math.sin(t * 1.1) * 0.012); c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-w / 2 - 10, -18); c.quadraticCurveTo(0, -8, w / 2 + 14, -22); c.quadraticCurveTo(w / 2 - 6, 22, w / 2 - 44, 28); c.lineTo(-w / 2 + 40, 28); c.quadraticCurveTo(-w / 2 + 2, 20, -w / 2 - 10, -18); c.closePath(); fs(c, lg(c, 0, -18, 0, 28, '#a8743e', '#74491f'), KIT_EDGE, 2.5);
    c.strokeStyle = 'rgba(255,240,205,.6)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-w / 2 - 6, -13); c.quadraticCurveTo(0, -3, w / 2 + 9, -17); c.stroke();
    for (const sx of [-52, 44]) { rrect(c, sx - 26, -12, 52, 9, 3); fs(c, '#dcbb85', KIT_EDGE, 1.6); } // two seats
    c.strokeStyle = '#6b4e30'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-10, -10); c.lineTo(96, -34); c.stroke(); // an oar, laid across
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - w / 2 + 20, y + 30); c.quadraticCurveTo(x, y + 36, x + w / 2 - 20, y + 30); c.stroke();
  } };
};

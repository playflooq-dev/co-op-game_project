'use strict';
// The park's own objects, placed by the SECTIONS in settings.js. They work like the kinds in shared/kit.js (each is
// made from one line of settings and gives back update / after / draw / thing):
//   hurdle    { x, h }               a low wooden fence across the path, to hop over
//   log       { x, h }               a log lying on the path: hop over it, or stand on it
//   puddle    { x, w }               nothing happens in a puddle except a splash
//   ball      { x }                  a ball that rolls and bounces when somebody runs into it
//   parkgate  { x, by, any, latch }  the kit's gate, drawn as a green iron park gate
//   parkbox   { x }                  the kit's light box (life.js puts a cat on it)
//   pond      { x: [from, to] }      a duck pond behind the path, to splash in
//   balloon   { x, h }               a red balloon caught on a branch; whoever reaches it carries it along
// Things that only react (birds, flowers, the cat, the dog, the ducks) are in life.js.
const PARK_GREEN = '#2f6a45', PARK_GREEN_DARK = '#1e4630';

KIT.hurdle = (world, d, ground) => {
  const x = d.x, top = ground - d.h; world.solid(x - 13, top, x + 13, ground);
  return { draw(c) {
    soft(c, x, ground + 8, 54, 8, '#2a1a0e', 0.25);
    c.lineJoin = 'round';
    for (const [dx, back] of [[-30, 1], [-15, 1], [0, 0], [15, 0], [30, 0]]) { // five pickets, drawn a little from the side
      const px = x + dx, py = ground + 10 - (back ? 5 : 0), ph = d.h + 12;
      c.beginPath(); c.moveTo(px - 8, py); c.lineTo(px - 8, py - ph + 9); c.lineTo(px, py - ph - 2); c.lineTo(px + 8, py - ph + 9); c.lineTo(px + 8, py); c.closePath(); fs(c, lg(c, px - 8, 0, px + 8, 0, '#fffaf0', '#e9dfc8'), '#7a6a4a', 2);
    }
    for (const yy of [ground - d.h * 0.62, ground - d.h * 0.2]) { rrect(c, x - 42, yy, 84, 11, 3); fs(c, '#f3ead6', '#7a6a4a', 2); }
  } };
};

KIT.log = (world, d, ground) => {
  const x = d.x, top = ground - d.h, art = SP.logs[0], sc = 0.86; world.solid(x - 132, top, x + 132, ground);
  return { draw(c) { soft(c, x, ground + 10, 160, 12, '#2a1a0e', 0.28); putFast(c, art, x, ground + 24, sc); } };
};

KIT.puddle = (world, d, ground) => {
  const x = d.x, w = d.w || 200, st = { t: 9, wet: {} };
  return { state: st,
    after(dt) {
      st.t += dt;
      for (const p of [MV.sis, MV.bro]) { // a splash on landing in it, and little ones while running through
        const inside = !p.gone && p.grounded && Math.abs(p.x - x) < w / 2 - 10 && Math.abs(p.y - ground) < 4, was = st.wet[p.who];
        if (inside && (!was || (Math.abs(p.vx) > 120 && st.t > 0.22))) { st.t = 0; snd(was ? 'drip' : 'splash'); puff(p.x, ground + 6, was ? 3 : 9, '#d6ecf6', was ? 0.8 : 2); if (!was) p.sqv -= 2; }
        st.wet[p.who] = inside;
      }
    },
    draw(c, t) {
      c.beginPath(); c.ellipse(x, ground + 16, w / 2, 17, 0, 0, TAU); fs(c, lg(c, x - w / 2, 0, x + w / 2, 0, '#8fc0d6', '#bfe0ee', '#86b8d0'), 'rgba(70,110,130,.5)', 2);
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2;
      for (let i = 0; i < 2; i++) { const u = (t * 0.5 + i / 2) % 1; c.globalAlpha = 1 - u; c.beginPath(); c.ellipse(x + (i ? 40 : -46), ground + 16, 10 + u * 32, 2 + u * 6, 0, 0, TAU); c.stroke(); } c.globalAlpha = 1;
    } };
};

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

// the kit's gate, with a park look: green iron bars that slide up into a little roof, and a lamp for each thing
// that opens it (a balloon-shaped one for the balloon)
KIT.parkgate = (world, d, ground) => {
  const g = KIT.gate(world, d, ground), s = g.solid, st = g.state, w = 44, x0 = d.x - w / 2, x1 = d.x + w / 2, h = d.h || 440, top = ground - h, by = [].concat(d.by);
  st.wob = 0; st.was = 0;
  const update = g.update;
  g.update = (dt) => { update(dt); if (st.open >= 1 && st.was < 1) { st.wob = 0.5; st.opened = (st.opened || 0) + 1; } st.was = st.open; st.wob = Math.max(0, st.wob - dt); };
  g.draw = (c, t) => {
    const bottom = s.y1, wob = st.wob > 0 ? Math.sin(st.wob * 40) * 0.03 * (st.wob / 0.5) : 0;
    by.forEach((id, i) => { // a cable along the path from each plate, lit while it is on
      const src = KIT_AT[id]; if (!src) return; const yy = ground + 30 + i * 8, on = st.latched || KIT_SIG[id];
      c.strokeStyle = 'rgba(60,45,25,.3)'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(src.x, yy); c.lineTo(d.x, yy); c.stroke();
      c.strokeStyle = on ? '#fff3a0' : src.col; c.lineWidth = 3; c.setLineDash([12, 9]); c.beginPath(); c.moveTo(src.x, yy); c.lineTo(d.x, yy); c.stroke(); c.setLineDash([]);
    });
    for (const side of [-1, 1]) { // a run of low railing on the grass either side, so it reads as a gate in a fence
      const fy = ground - 30, fx = d.x + side * 36; c.strokeStyle = PARK_GREEN_DARK; c.lineCap = 'round';
      c.lineWidth = 4; for (let i = 0; i <= 6; i++) { const px = fx + side * i * 28; c.beginPath(); c.moveTo(px, fy); c.lineTo(px, fy - 88); c.stroke(); ell(c, px, fy - 93, 4, 5, '#e2b84a'); }
      c.lineWidth = 5; for (const yy of [fy - 20, fy - 72]) { c.beginPath(); c.moveTo(fx, yy); c.lineTo(fx + side * 168, yy); c.stroke(); }
    }
    soft(c, d.x, ground + 8, 56, 8, '#2a1a0e', 0.28);
    c.save(); c.translate(d.x, top); c.rotate(wob); c.translate(-d.x, -top);
    c.fillStyle = PARK_GREEN_DARK; c.fillRect(x0 - 11, top + 14, 9, h); c.fillRect(x1 + 2, top + 14, 9, h);
    c.strokeStyle = PARK_GREEN; c.lineCap = 'round'; c.lineWidth = 7; // the bars
    for (const bx of [x0 + 7, d.x, x1 - 7]) { c.beginPath(); c.moveTo(bx, top + 40); c.lineTo(bx, bottom - 8); c.stroke(); }
    c.lineWidth = 6; for (const yy of [bottom - 26, bottom - 150, bottom - 280]) if (yy > top + 44) { c.beginPath(); c.moveTo(x0, yy); c.lineTo(x1, yy); c.stroke(); }
    c.fillStyle = '#e2b84a'; for (const bx of [x0 + 7, d.x, x1 - 7]) { c.beginPath(); c.moveTo(bx - 6, bottom - 6); c.lineTo(bx, bottom + 6); c.lineTo(bx + 6, bottom - 6); c.closePath(); c.fill(); }
    c.beginPath(); c.moveTo(x0 - 34, top + 44); c.lineTo(x0 - 20, top + 2); c.quadraticCurveTo(d.x, top - 30, x1 + 20, top + 2); c.lineTo(x1 + 34, top + 44); c.closePath(); fs(c, lg(c, 0, top - 20, 0, top + 44, '#4f9a62', PARK_GREEN), PARK_GREEN_DARK, 2.5); // the roof
    by.forEach((id, i) => { // one lamp for each thing that has to be on
      const on = st.latched || !!KIT_SIG[id], src = KIT_AT[id], lx = d.x + (i - (by.length - 1) / 2) * 30, ly = top + 18;
      if (id === 'balloon') { c.beginPath(); c.ellipse(lx, ly - 2, 10, 12, 0, 0, TAU); fs(c, on ? '#ff7a6a' : '#8a3a34', PARK_GREEN_DARK, 2); }
      else { ell(c, lx, ly, 11, 11, PARK_GREEN_DARK); ell(c, lx, ly, 8, 8, on ? '#fff3a0' : shade(src ? src.col : '#888888', -0.2)); }
      if (on) soft(c, lx, ly, 28, 28, '#fff3a0', 0.6);
    });
    c.restore();
  };
  return g;
};
KIT.parkbox = (world, d, ground) => KIT.box(world, d, ground);

// a duck pond on the grass behind the path. Grab at its edge makes a splash.
KIT.pond = (world, d, ground) => {
  const [a, b] = d.x, cx = (a + b) / 2, cy = ground - 66, rx = (b - a) / 2, st = { splash: 0, at: cx, n: 0 };
  const thing = { get x() { return clamp(MV.sis.x, a + 60, b - 60); }, y: ground - 60,
    canUse: (p) => p.grounded && Math.abs(p.y - ground) < 6 && p.x > a + 30 && p.x < b - 30,
    use(p) { st.splash = 0.6; st.at = p.x; st.n++; p.reachT = 0.35; snd('splash'); puff(p.x, cy + 4, 12, '#d6ecf6', 2.4); const o = partner(p); if (!o.gone && Math.abs(o.x - p.x) < 260) { o.cheer = 0.6; o.sqv = -3; } } };
  return { state: st, thing, pond: { a, b, cx, cy, rx },
    after(dt) { st.splash = Math.max(0, st.splash - dt); },
    draw(c, t) {
      c.beginPath(); c.ellipse(cx, cy + 4, rx + 12, 34, 0, 0, TAU); c.fillStyle = '#7a9a4a'; c.fill();
      c.beginPath(); c.ellipse(cx, cy, rx, 28, 0, 0, TAU); fs(c, lg(c, 0, cy - 28, 0, cy + 28, '#9fd0e4', '#6fb0cc'), 'rgba(50,90,110,.5)', 2.5);
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; for (let i = 0; i < 5; i++) { const xx = a + 50 + ((i * 131 + t * 18) % (b - a - 120)), yy = cy - 12 + (i % 3) * 11; c.beginPath(); c.moveTo(xx, yy); c.quadraticCurveTo(xx + 16, yy - 4, xx + 32, yy); c.stroke(); }
      for (const [lx, ly, r] of [[a + 90, cy + 9, 15], [cx + 60, cy - 12, 12], [b - 120, cy + 10, 16]]) { c.beginPath(); c.ellipse(lx, ly, r, r * 0.42, 0, 0.4, TAU - 0.2); c.lineTo(lx, ly); c.closePath(); fs(c, '#6fae5a', '#3f6a34', 1.5); } // lily pads
      for (const rx0 of [a + 8, a + 26, b - 30, b - 12]) { c.strokeStyle = '#5f8a40'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(rx0, cy + 22); c.quadraticCurveTo(rx0 + Math.sin(t * 1.4 + rx0) * 5, cy - 20, rx0 + Math.sin(t * 1.4 + rx0) * 9, cy - 58); c.stroke(); ell(c, rx0 + Math.sin(t * 1.4 + rx0) * 9, cy - 62, 5, 13, '#7a5a34'); } // reeds
      if (st.splash > 0) { const u = 1 - st.splash / 0.6; c.strokeStyle = `rgba(255,255,255,${0.8 * (1 - u)})`; c.lineWidth = 3; c.beginPath(); c.ellipse(st.at, cy + 6, 20 + u * 90, 4 + u * 14, 0, 0, TAU); c.stroke(); }
    } };
};

// a red balloon caught on a branch, too high for either alone. Whoever reaches it carries it along on its string.
KIT.balloon = (world, d, ground) => {
  const x = d.x, y = ground - d.h, st = { got: false, holder: null, x, y, t: 0 };
  KIT_AT.balloon = { x, col: '#d9534a' };
  const thing = { x, y, canUse: (p) => !st.got && (p.grounded || p.held) && Math.abs(p.x - x) <= 90 && sibReachY(p) <= y + 8,
    use(p) { st.got = true; st.holder = p; st.gotAt = MV.time; p.reachT = 0.4; p.cheer = 0.7; KIT_SIG.balloon = true; snd('piece'); burst(x, y, 12); } };
  const give = (p) => { st.got = true; st.holder = p; st.x = p.x; st.y = p.y - p.h - 150; KIT_SIG.balloon = true; };
  return { state: st, thing, give,
    after(dt) {
      st.t += dt; if (!st.got) return;
      const p = st.holder, tx = p.x - p.dir * 18 - p.vx * 0.12, ty = p.y - p.h - 150 + Math.sin(st.t * 2.2) * 10; // it lags behind and tugs
      st.x += (tx - st.x) * Math.min(1, dt * 5); st.y += (ty - st.y) * Math.min(1, dt * 6);
    },
    draw(c, t) {
      // the tree it is caught in: a trunk off to the left, and one long branch
      const tx = x - 150, art = SP.trees[1];
      putFast(c, art, tx, ground - 30, 1.22);
      c.strokeStyle = '#5a3e28'; c.lineWidth = 15; c.lineCap = 'round'; c.beginPath(); c.moveTo(tx + 18, y + 110); c.quadraticCurveTo(x - 70, y + 30, x + 34, y + 44); c.stroke();
      c.strokeStyle = '#7a5a3a'; c.lineWidth = 9; c.stroke();
      for (const [lx, ly, r] of [[x + 40, y + 36, -0.6], [x + 12, y + 30, -1.4], [x - 30, y + 28, -1.9]]) { c.save(); c.translate(lx, ly); c.rotate(r + Math.sin(t * 2 + lx) * 0.1); leafPath(c, 30, 11); fs(c, '#7fb85a', '#3f6a34', 1.6); c.restore(); }
      if (!st.got) { const bob = Math.sin(t * 2) * 4; c.strokeStyle = INK; c.lineWidth = 1.8; c.beginPath(); c.moveTo(x + 4, y + 40); c.quadraticCurveTo(x + 12, y + 22, x + 2, y - 2 + bob); c.stroke(); kitBalloon(c, x, y - 28 + bob, Math.sin(t * 1.6) * 0.08); star(c, x + 26, y - 50, 9 + Math.sin(t * 5) * 3, t * 2, 0.7); }
    },
    drawFront(c, t) { // once somebody has it, it floats over them on its string
      if (!st.got) return; const p = st.holder; if (p.gone) return;
      const hx = p.x + p.dir * 16, hy = p.y - p.h * 0.56, lean = clamp((st.x - p.x) / 200, -0.5, 0.5);
      c.strokeStyle = INK; c.lineWidth = 1.8; c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo((hx + st.x) / 2 + 14, (hy + st.y) / 2 + 30, st.x, st.y + 30); c.stroke();
      kitBalloon(c, st.x, st.y, lean);
    } };
};
function kitBalloon(c, x, y, rot) {
  c.save(); c.translate(x, y + 30); c.rotate(rot); c.translate(0, -30);
  c.beginPath(); c.ellipse(0, 0, 27, 32, 0, 0, TAU); fs(c, rg(c, -8, -10, 40, '#ff8a76', '#d9534a', '#b03a30'), '#6a1e18', 2.2);
  c.beginPath(); c.moveTo(-6, 31); c.lineTo(6, 31); c.lineTo(0, 39); c.closePath(); fs(c, '#d9534a', '#6a1e18', 1.6); ell(c, -10, -13, 6, 9, '#fff', 0.55);
  c.restore();
}

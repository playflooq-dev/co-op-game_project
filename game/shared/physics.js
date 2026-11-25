'use strict';
// A small physics world for side-view play, written for this game (no engine): upright boxes, gravity, floors and
// walls, and tops that can be stood on. Only worlds with jumping load it (the city lab); the house and the forest do not.
// Everything is in scene units and y grows downwards. A body's x is its middle and its y is its feet (its bottom edge).
//
//   const world = makeWorld()
//   world.solid(x0, y0, x1, y1)   a wall or floor: it stops bodies from every side (y0 is its top)
//   world.ledge(x0, x1, y)        a top that can be stood on, but walked past and jumped through from below.
//                                 Give it y1 as well and it slopes: y is the top at x0, y1 the top at x1.
//                                 A ledge may move or tilt: change its numbers (and set dx to how far it moved
//                                 sideways this frame) before world.step, and whatever stands on it is carried along.
//   world.add(makeBody({...}))    something that moves: a sibling, a box. platform: true lets others stand on it.
//                                 held: true takes it out of the world for a while (a box being carried).
//   world.step(dt)                moves everything. Afterwards each body has: grounded, on (what it stands on),
//                                 impact (how fast it landed this frame, else 0), bumped (it hit its head),
//                                 hitSide (-1 or 1 when a wall stopped it).
//   world.load(body), world.loadOn(surface)   weight, counting everything stacked on top
//   world.heavyOn(surface, limit)             true when one single thing in the pile weighs at least limit
// A solid or ledge with off: true is ignored; skip: (body) => true lets some bodies through.

// ---------- small maths helpers, used by every file built on this one
const lerp = (a, b, u) => a + (b - a) * u;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (u) => u * u * (3 - 2 * u);

const ledgeTop = (l, x) => (l.y1 === undefined ? l.y : lerp(l.y, l.y1, clamp01((x - l.x0) / (l.x1 - l.x0))));
function makeBody(o) {
  return Object.assign({ isBody: true, x: 0, y: 0, w: 60, h: 60, vx: 0, vy: 0, weight: 1, extra: 0, kind: 'box', gravity: 1,
    grounded: false, on: null, impact: 0, bumped: false, hitSide: 0, held: false, platform: false, px: 0, py: 0 }, o);
}

function makeWorld(o) {
  const world = Object.assign({
    gravity: 3600,     // units per second, per second
    fallFaster: 1.4,   // falling is this many times quicker than rising
    maxFall: 1500,     // fastest fall
    stepUp: 16,        // a rise this small is simply walked up
    snap: 14,          // a drop this small is walked down without leaving the ground
    solids: [], ledges: [], bodies: [],
  }, o);
  const skip = (s, b) => s.off || (s.skip && s.skip(b));
  const restsOn = (a, b) => { for (let s = a.on, n = 0; s && n < 24; s = s.on, n++) if (s === b) return true; return false; };

  world.solid = (x0, y0, x1, y1, extra) => { const s = Object.assign({ isSolid: true, x0, y0, x1, y1 }, extra); world.solids.push(s); return s; };
  world.ledge = (x0, x1, y, extra) => { const l = Object.assign({ isLedge: true, x0, x1, y }, extra); world.ledges.push(l); return l; };
  world.add = (b) => { world.bodies.push(b); return b; };
  world.remove = (b) => { const i = world.bodies.indexOf(b); if (i >= 0) world.bodies.splice(i, 1); };

  // would this body fit here without being inside a wall?
  world.fits = (b, x = b.x, y = b.y, h = b.h) => {
    const hw = b.w / 2;
    return !world.solids.some((s) => !skip(s, b) && x + hw > s.x0 + 0.5 && x - hw < s.x1 - 0.5 && y > s.y0 + 0.5 && y - h < s.y1 - 0.5);
  };
  // the first thing below a spot that this body could stand on: { y, on }
  world.below = (b, x = b.x, y = b.y) => {
    const hw = b.w / 2, foot = hw * 0.8; let top = Infinity, under = null;
    for (const s of world.solids) if (!skip(s, b) && x + hw > s.x0 + 0.5 && x - hw < s.x1 - 0.5 && s.y0 >= y - 0.5 && s.y0 < top) { top = s.y0; under = s; }
    for (const l of world.ledges) { if (skip(l, b) || x + foot <= l.x0 || x - foot >= l.x1) continue; const ty = ledgeTop(l, x); if (ty >= y - 0.5 && ty < top) { top = ty; under = l; } }
    for (const p of world.bodies) { if (p === b || !p.platform || p.held || restsOn(p, b)) continue; const ty = p.y - p.h; if (x + foot > p.x - p.w / 2 && x - foot < p.x + p.w / 2 && ty >= y - 0.5 && ty < top) { top = ty; under = p; } }
    return { y: top, on: under };
  };
  // weight: a body's own, plus what it carries (extra), plus everything standing on it
  world.riders = (surface) => world.bodies.filter((b) => !b.held && b.on === surface);
  world.load = (b) => world.riders(b).reduce((w, r) => w + world.load(r), b.weight + (b.extra || 0));
  world.loadOn = (surface) => world.riders(surface).reduce((w, r) => w + world.load(r), 0);
  // is one single heavy thing on it (anywhere in the pile)? A pile of light things never counts as heavy.
  world.heavyOn = (surface, limit) => world.riders(surface).some((r) => r.weight + (r.extra || 0) >= limit || world.heavyOn(r, limit));

  function move(b, dt) {
    const hw = b.w / 2, stood = b.grounded;
    // sideways: walls stop it, and a low step is walked up
    let nx = b.x + b.vx * dt;
    if (b.vx) for (const s of world.solids) {
      if (skip(s, b) || b.y <= s.y0 + 0.5 || b.y - b.h >= s.y1 - 0.5) continue;
      if (b.vx > 0 ? !(b.x + hw <= s.x0 + 0.5 && nx + hw > s.x0) : !(b.x - hw >= s.x1 - 0.5 && nx - hw < s.x1)) continue;
      if (stood && b.y - s.y0 <= world.stepUp && world.fits(b, nx, s.y0)) { b.y = s.y0; continue; }
      nx = b.vx > 0 ? s.x0 - hw : s.x1 + hw; b.hitSide = Math.sign(b.vx); b.vx = 0; break;
    }
    b.x = nx;
    // up and down. The height is worked out exactly for steady gravity, so a jump is as high at 30 frames a second as at 144.
    const g = world.gravity * (b.vy > 0 ? world.fallFaster : 1) * b.gravity, y0 = b.y;
    const vy = Math.min(world.maxFall, b.vy + g * dt), ny = y0 + (b.vy + vy) / 2 * dt;
    b.vy = vy;
    if (ny >= y0) { // coming down: land on the highest thing between where the feet were and where they are going
      const foot = hw * 0.8, tol = stood ? world.stepUp : 0.5, reach = ny + (stood ? world.snap : 0);
      let top = Infinity, under = null;
      for (const s of world.solids) if (!skip(s, b) && b.x + hw > s.x0 + 0.5 && b.x - hw < s.x1 - 0.5 && y0 <= s.y0 + 0.5 && reach >= s.y0 && s.y0 < top) { top = s.y0; under = s; }
      for (const l of world.ledges) { if (skip(l, b) || b.x + foot <= l.x0 || b.x - foot >= l.x1) continue; const ty = ledgeTop(l, b.x); if (y0 <= ty + tol && reach >= ty && ty < top) { top = ty; under = l; } }
      for (const p of world.bodies) { if (p === b || !p.platform || p.held || restsOn(p, b)) continue; const ty = p.y - p.h; if (b.x + foot > p.x - p.w / 2 && b.x - foot < p.x + p.w / 2 && y0 <= ty + 0.5 && reach >= ty && ty < top) { top = ty; under = p; } }
      if (under) { if (!stood) b.impact = Math.max(b.impact, vy); b.y = top; b.vy = 0; b.grounded = true; b.on = under; }
      else { b.y = ny; b.grounded = false; b.on = null; }
    } else { // going up: only solids stop a head
      let bottom = -Infinity;
      for (const s of world.solids) if (!skip(s, b) && b.x + hw > s.x0 + 0.5 && b.x - hw < s.x1 - 0.5 && y0 - b.h >= s.y1 - 0.5 && ny - b.h < s.y1 && s.y1 > bottom) bottom = s.y1;
      if (bottom > -Infinity) { b.y = bottom + b.h; b.vy = 0; b.bumped = true; } else b.y = ny;
      b.grounded = false; b.on = null;
    }
  }

  world.step = (dt) => {
    for (const b of world.bodies) { b.px = b.x; b.py = b.y; }
    // lowest first, so whatever is being stood on has already moved when its riders take their turn
    const list = world.bodies.filter((b) => !b.held).sort((a, b) => b.y - a.y);
    for (const b of list) {
      b.impact = 0; b.bumped = false; b.hitSide = 0;
      const on = b.on;
      if (on) { // carried along by what it stands on
        if (on.isBody) { if (on.held || !world.bodies.includes(on)) b.on = null; else { b.x += on.x - on.px; b.y = on.y - on.h; } }
        else if (on.isLedge) { b.x += on.dx || 0; if (on.off || b.x + b.w * 0.4 <= on.x0 || b.x - b.w * 0.4 >= on.x1) b.on = null; else b.y = ledgeTop(on, b.x); }
        else if (on.off) b.on = null;
        if (!b.on) b.grounded = false;
      }
      move(b, dt / 2); move(b, dt / 2);
    }
  };
  return world;
}

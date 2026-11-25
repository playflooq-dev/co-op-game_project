'use strict';
// How the siblings move in a world with jumping (the city lab): walking, jumping, ducking into low gaps, carrying
// boxes, the lift and the toss, and coming back after a fall. Needs shared/physics.js, shared/stage.js and
// shared/sound.js. The house and the forest do not load this file.
//
// A world uses it like this:
//   setupMovement(world, players, hooks)   once. players = [sister, brother], made with makePlayer().
//   moveSiblings(dt, frozen)               every frame, before world.step(dt): reads the keys, sets speeds, grabs, lifts
//   settleSiblings(dt)                     every frame, after world.step(dt): landings, carried things, falls, poses
//   updateMoveFx(dt), drawMoveFx(c)        the dust puffs
//   makeTouchPads(force)                   the on-screen buttons for touch screens
// hooks (all optional):
//   thing(p)       the nearest thing this sibling could use right now ({ use(p), canUse(p) }), or null.
//                  A thing with hold: true works only while the grab key stays down (a lever, a rope).
//   ladder(p)      a ladder this sibling is standing at ({ x, top }), or null: the jump key climbs it
//   lost(p)        true when the sibling has fallen somewhere they must come back from (into water, say)
//   canJoin(p, o)  false when coming back next to the partner would be a short cut
//   canLift()      false where the lift is not to be used yet (a level that teaches it later)
//   highFive()     called when they high-five
// Keys: left and right walk, up jumps, down grabs / puts down / uses / lifts / tosses.

// ---------- every number that shapes how moving feels. Change one, refresh, and try it. (city.html?tune=1 has sliders.)
const MOVE = {
  // ---- jumping
  jumpHeight: 1.1,   // how high a jump goes, in brother-heights (1.1 is about 207 units). It was 1.3 until the first feel test: "a bit too high".
  jumpTime: 0.33,    // seconds from leaving the ground to the top of the jump: smaller feels snappier
  fallFaster: 1.4,   // coming down is this many times quicker than going up (1 = floaty)
  maxFall: 1500,     // the fastest anything falls, in units a second
  coyote: 0.10,      // seconds after walking off an edge in which a jump still works
  buffer: 0.12,      // seconds a jump press is remembered when it comes just before landing
  // ---- walking
  speed: { sister: 285, brother: 310 }, // units a second (the screen is 1080 units tall)
  accel: 2600,       // how quickly they reach full speed on the ground
  brake: 3400,       // how quickly they stop on the ground
  airAccel: 2000,    // steering in the air
  airBrake: 420,     // slowing down in the air with no key held (low = a jump keeps its run-up)
  stride: 1.45,      // running steps are this much longer than the old walking steps
  edge: 44,          // how close to the edge of the screen they can go
  // ---- the two bodies (sizes in units; weight: light things are 1, heavy things 3)
  body: { sister: { w: 58, h: 222, weight: 3 }, brother: { w: 50, h: 178, weight: 1 } },
  reach: { sister: 62, brother: 44 },   // how far above their own head each can reach
  arm: 66,           // how far to the side they can reach for a thing
  crawlHeight: 96,   // how low the brother ducks. He does it by himself when he walks into a gap this low.
  crawlSpeed: 0.55,  // share of his speed while ducking
  // ---- carrying
  grabReach: 36,     // how far from their side a box can be picked up
  crateSpeed: 0.8,   // share of her speed while she carries a heavy crate
  crateJump: 0.55,   // share of her jump height with a heavy crate
  // ---- together
  liftReach: 105,    // how close they must stand for the lift
  liftDelay: 0.12,   // seconds the lift waits, in case the other one presses too: then it is a high five
  liftTime: 0.3,     // seconds he takes to hop up
  liftHeight: 172,   // how high his feet are on her shoulders
  liftWalk: 0.6,     // share of her speed while she carries him
  tossRise: 1.75,    // how far a toss sends him up from her shoulders, in brother-heights
  tossForward: 230,  // and how fast forwards
  toss: true,        // false: no toss in this world yet. Grab while he is up there just sets him down.
  hopOff: 430,       // the little hop when he gets down by himself (take-off speed)
  climbSpeed: 230,   // up a ladder, units a second (hold the jump key)
  // ---- after a fall
  returnTime: 0.7,   // seconds until a sibling who fell out of the picture is back
  // ---- the objects (shared/kit.js)
  heavy: 3,          // this much weight on one pair of feet is "heavy": it presses green plates and breaks thin planks
  seesawRise: 2.95,  // how far the see-saw sends the brother up, in brother-heights, when she lands on the other end
  seesawHit: 320,    // how hard a landing on the see-saw has to be to launch anything (speed, units a second)
  plankHold: 0.28,   // seconds a thin plank holds something heavy before it snaps
  plankBack: 3.5,    // seconds until a snapped plank is back
};
const broHeight = () => SIBLINGS.brother.headH * HC;
const moveGravity = () => 2 * MOVE.jumpHeight * broHeight() / (MOVE.jumpTime * MOVE.jumpTime);
const speedFor = (rise) => Math.sqrt(2 * moveGravity() * rise); // the take-off speed that rises this far

const MV = { world: null, sis: null, bro: null, hooks: {}, duo: { state: null, t: 0 }, pending: null, fx: [], time: 0, bottom: 1500, highFives: 0 };
const snd = (name, k) => { if (typeof sfx === 'function') sfx(name, k); };
// A quick tap can start and end between two frames on a slow device. Presses are noted here as they happen and
// used on the next frame, so a jump or a grab is never lost.
const TAPS = {};
addEventListener('keydown', (e) => { if (!e.repeat) TAPS[e.code] = true; });
const tapped = (code) => !!TAPS[code] || hit(code);
const partner = (p) => (p === MV.sis ? MV.bro : MV.sis);
const sibReachY = (p) => p.y - (p.crawl ? p.h : p.standH + MOVE.reach[p.who]); // the highest point this sibling can touch

// ---------- sounds: more Kenney CC0 recordings (shared/sounds/). Names without a file fall back to a sound made by code.
if (typeof SAMPLES !== 'undefined') Object.assign(SAMPLES, {
  jump: { files: ['cloth1', 'cloth4'], vol: 0.5 },
  land: { files: ['impactSoft_medium_000', 'impactSoft_medium_002'], vol: 0.45 },
  step: { files: ['footstep_concrete_000', 'footstep_concrete_001', 'footstep_concrete_002', 'footstep_concrete_003'], vol: 0.2 },
  pick: { files: ['impactWood_light_000', 'impactWood_light_002'], vol: 0.6 },
  put: { files: ['impactWood_medium_000', 'impactWood_medium_002'], vol: 0.7 },
  heavy: { files: ['impactWood_heavy_001', 'impactWood_heavy_003'], vol: 0.9 },
  strain: { files: ['question_002'], vol: 0.55 },
  toss: { files: ['maximize_001', 'maximize_006'], vol: 0.7 },
  whoops: { files: ['minimize_003'], vol: 0.7 },
  pop: { files: ['pluck_001', 'pluck_002'], vol: 0.95 },
  crack: { files: ['impactPlank_medium_000', 'impactPlank_medium_002'], vol: 0.9 },
  plank: { files: ['impactPlank_medium_001', 'impactPlank_medium_003'], vol: 0.8 },
  star: { files: ['glass_002', 'glass_005'], vol: 0.85 },
  bell: { files: ['impactBell_heavy_002', 'impactBell_heavy_003'], vol: 0.9 },
  clap: { files: ['impactGeneric_light_001', 'impactGeneric_light_003'], vol: 0.95 },
});
if (typeof SFX !== 'undefined') for (const [name, like] of [['jump', 'hop'], ['land', 'thump'], ['pick', 'tap'], ['put', 'clunk'], ['heavy', 'thump'], ['strain', 'no'], ['toss', 'hop'], ['whoops', 'boing'], ['pop', 'boing'], ['crack', 'clunk'], ['plank', 'clunk'], ['star', 'sticker'], ['bell', 'ding'], ['clap', 'good']]) if (!SFX[name]) SFX[name] = SFX[like];

// ---------- dust puffs
function puff(x, y, n = 5, col = '#f6ead0', wide = 1) {
  for (let i = 0; i < n; i++) { const life = 0.4 + Math.random() * 0.3; MV.fx.push({ x: x + (Math.random() - 0.5) * 44 * wide, y: y - Math.random() * 12, vx: (Math.random() - 0.5) * 150 * wide, vy: -15 - Math.random() * 55, r: 8 + Math.random() * 12, life, max: life, col }); }
}
function updateMoveFx(dt) { for (const f of MV.fx) { f.life -= dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= 1 - dt * 3; f.r += dt * 26; } MV.fx = MV.fx.filter((f) => f.life > 0); }
function drawMoveFx(c) { for (const f of MV.fx) soft(c, f.x, f.y, f.r, f.r * 0.8, f.col, 0.55 * (f.life / f.max)); }

// ---------- setting up
function setupMovement(world, players, hooks) {
  MV.world = world; MV.sis = players[0]; MV.bro = players[1]; MV.hooks = hooks || {};
  for (const p of players) {
    const who = p === MV.sis ? 'sister' : 'brother', bd = MOVE.body[who];
    Object.assign(p, { isBody: true, who, kind: who === 'sister' ? 'sis' : 'bro', w: bd.w, h: bd.h, standH: bd.h, weight: bd.weight, extra: 0, gravity: 1,
      vx: 0, vy: 0, grounded: true, wasGrounded: true, on: null, impact: 0, bumped: false, hitSide: 0, held: false, platform: false, px: p.x, py: p.y,
      coyote: 0, jbuf: 0, want: 0, carry: null, crawl: false, flying: false, tossed: false, gone: null, strain: 0, threw: 0, reachT: 0, airT: 0, holding: null, climb: null,
      sq: 0, sqv: 0, sqx: 1, sqy: 1, tilt: 0, noShadow: true, safe: { x: p.x, y: p.y },
      pose: { air: 0, rise: 0, carry: 0, hold: 0, ride: 0, toss: 0, strain: 0, crawl: 0, climb: 0, step: 0, stride: MOVE.stride, t: 0 } });
    world.add(p);
  }
}

// ---------- before the world moves: keys to speeds, jumps and grabs
function moveSiblings(dt, frozen) {
  const { world, sis, bro, duo } = MV;
  world.gravity = moveGravity(); world.fallFaster = MOVE.fallFaster; world.maxFall = MOVE.maxFall;
  if (MV.pending) { MV.pending.t -= dt; if (MV.pending.t <= 0) { const who = MV.pending.who; MV.pending = null; if (canLift()) startLift(); else cheer(who); } }
  for (const p of [sis, bro]) {
    const k = p.keys, busy = frozen || p.gone || duo.state === 'up';
    const dir = busy ? 0 : (down[k.right] ? 1 : 0) - (down[k.left] ? 1 : 0), jump = !busy && tapped(k.up), grab = !busy && tapped(k.down);
    p.strain = Math.max(0, p.strain - dt); p.threw = Math.max(0, p.threw - dt); p.want = dir;
    if (p.gone) continue;
    if (p.holding && (!down[k.down] || !p.holding.canUse(p))) p.holding = null; // a lever or a rope works only while the grab key stays down
    if (p === bro && duo.state) { // on her shoulders: he can look round, hop down, use something up high, or be tossed
      if (dir) p.dir = dir;
      if (duo.state === 'on') { if (jump) hopOff(); else if (grab) grabAction(p); }
      continue;
    }
    const lifting = p === sis && duo.state, heavy = p.carry && p.carry.heavy;
    // a ladder: the jump key climbs it, a step sideways lets go
    if (p.climb) {
      const lad = p.climb;
      if (dir && !down[k.up]) { p.climb = null; p.gravity = 1; }
      else {
        p.gravity = 0; p.vx = (lad.x - p.x) * 10; p.vy = down[k.up] ? -MOVE.climbSpeed : 0; p.grounded = false; p.on = null; p.coyote = 0; p.jbuf = 0;
        if (p.y <= lad.top + 4) { p.y = lad.top; p.vx = 0; p.vy = 0; p.climb = null; p.gravity = 1; } // at the top: onto the ledge
        continue;
      }
    } else if (!p.carry && !lifting && !p.crawl && !p.holding && MV.hooks.ladder && (jump || (down[k.up] && !p.grounded))) {
      const lad = MV.hooks.ladder(p); if (lad && p.y > lad.top + 6) { p.climb = lad; p.jbuf = 0; snd('step'); continue; }
    }
    p.coyote = p.grounded ? MOVE.coyote : p.coyote - dt;
    p.jbuf = jump && !p.holding ? MOVE.buffer : p.jbuf - dt;
    const top = duo.state === 'up' || p.strain > 0 || p.holding ? 0 : MOVE.speed[p.who] * (p.crawl ? MOVE.crawlSpeed : 1) * (heavy ? MOVE.crateSpeed : 1) * (lifting ? MOVE.liftWalk : 1);
    const rate = p.grounded ? (dir ? MOVE.accel : MOVE.brake) : dir ? MOVE.airAccel : p.flying ? 0 : MOVE.airBrake;
    p.vx += clamp(dir * top - p.vx, -rate * dt, rate * dt);
    if (dir) p.dir = dir;
    if (p.jbuf > 0 && p.coyote > 0 && !p.crawl && !lifting && p.strain <= 0) {
      p.vy = -speedFor(MOVE.jumpHeight * broHeight() * (heavy ? MOVE.crateJump : 1)); p.grounded = false; p.on = null; p.coyote = 0; p.jbuf = 0;
      p.sqv = 5; snd('jump'); puff(p.x, p.y, 4);
    }
    if (grab) grabAction(p);
    // both stay in the picture
    const lo = camX + MOVE.edge, hi = camX + VW - MOVE.edge;
    if (p.x < lo) { p.x = lo; if (p.vx < 0) p.vx = 0; }
    if (p.x > hi) { p.x = hi; if (p.vx > 0) p.vx = 0; }
  }
  for (const code in TAPS) delete TAPS[code];
}

// ---------- the grab key: put down, use, pick up, lift, toss, or cheer
function grabAction(p) {
  const { sis, bro, duo, hooks } = MV;
  if (p.carry) { putDown(p); return; }
  if (duo.state === 'on') { const up = p === bro && hooks.thing ? hooks.thing(p) : null; if (up) { up.use(p); if (up.hold) p.holding = up; } else if (MOVE.toss) toss(); else hopOff(); return; }
  if (duo.state) return;
  const th = hooks.thing ? hooks.thing(p) : null;
  if (th) { th.use(p); if (th.hold) p.holding = th; return; }
  const box = p.grounded ? nearBox(p) : null; // only while standing: a jump is no way to reach a box up high
  if (box) { if (box.heavy && p === bro) tooHeavy(p, box); else pickUp(p, box); return; }
  if (canLift()) { // wait a moment: if the other one presses too, they wanted a high five
    if (MV.pending && MV.pending.who !== p) { MV.pending = null; highFive(); } else if (!MV.pending) MV.pending = { who: p, t: MOVE.liftDelay };
    return;
  }
  cheer(p);
}
function cheer(p) {
  const o = partner(p); if (p.cheer > 0) return;
  p.cheer = CHEER; snd('cheer'); burst(p.x, p.y - p.h - 10, 6);
  if (o.cheer > CHEER - 0.5 && Math.abs(o.x - p.x) < 280 && Math.abs(o.y - p.y) < 90) highFive();
}
function highFive() {
  const { sis, bro, hooks } = MV; sis.cheer = bro.cheer = CHEER; MV.highFives++;
  snd('clap'); snd('good'); burst((sis.x + bro.x) / 2, Math.min(sis.y, bro.y) - 250, 14);
  if (sis.x !== bro.x) { sis.dir = Math.sign(bro.x - sis.x); bro.dir = -sis.dir; }
  if (hooks.highFive) hooks.highFive();
}

// ---------- carrying
function nearBox(p) {
  let best = null, bd = 1e9;
  for (const b of MV.world.bodies) {
    if (b.kind !== 'box' || b.held || p.on === b) continue;
    const dx = b.x - p.x, gap = Math.abs(dx) - (p.w + b.w) / 2;
    if (gap > MOVE.grabReach || b.y < p.y - p.h - 6 || b.y - b.h > p.y + 6) continue;
    if (MV.world.bodies.some((o) => !o.held && o.on === b)) continue; // something is standing on it
    const d = Math.abs(dx) + (Math.sign(dx) === p.dir || Math.abs(dx) < 24 ? 0 : 40) - (b.y - b.h < p.y - 100 ? 60 : 0); // the one in front; the top one of a pile
    if (d < bd) { bd = d; best = b; }
  }
  return best;
}
function pickUp(p, b) {
  b.held = true; b.carrier = p; b.on = null; b.grounded = false; b.vx = b.vy = 0; b.fromX = b.x; b.fromY = b.y; b.liftT = 0; b.okX = b.x; b.okY = b.y;
  p.carry = b; p.extra = b.weight; snd('pick');
}
function tooHeavy(p, b) { p.strain = 0.5; p.dir = Math.sign(b.x - p.x) || p.dir; b.wobble = 0.5; snd('strain'); puff(p.x, p.y - p.h, 2, '#bfe2f2', 0.6); }
function putDown(p, where) { // in front of them, on the first thing below; where: [x, y] lets go at that spot instead
  const b = p.carry, world = MV.world; if (!b) return;
  p.carry = null; p.extra = 0; b.held = false; b.carrier = null; b.vx = 0; b.vy = 0; b.grounded = false; b.on = null;
  const vx = b.x, vy = b.y; // where it was drawn: it glides from there to its new place
  if (where) { b.x = where[0]; b.y = where[1]; }
  else {
    const front = p.x + p.dir * ((p.w + b.w) / 2 + 10), from = Math.min(b.y, p.y - p.h + 8);
    b.x = world.fits(b, front, from) ? front : p.x; b.y = from; // against a wall there is no room in front: it goes down where they stand
    const spot = world.below(b, b.x, from - 2);
    if (spot.on && spot.on.isBody) b.x = world.fits(b, spot.on.x, from) ? spot.on.x : b.x; // onto a pile: line it up
    if (spot.y < Infinity) b.y = Math.max(from, spot.y - 36);                             // let go just above where it will land
  }
  b.ox = vx - b.x; b.oy = vy - b.y; b.dropped = true;
}

// ---------- together: the lift, the toss, and getting down
function canLift() {
  const { sis, bro, duo, world, hooks } = MV;
  return !duo.state && (!hooks.canLift || hooks.canLift()) && !sis.gone && !bro.gone && sis.grounded && bro.grounded && !sis.carry && !bro.carry && !bro.crawl
    && Math.abs(sis.x - bro.x) <= MOVE.liftReach && Math.abs(sis.y - bro.y) <= 110 && world.fits(bro, sis.x, sis.y - MOVE.liftHeight, bro.standH);
}
function startLift() {
  const { sis, bro, duo } = MV;
  duo.state = 'up'; duo.t = 0; duo.x0 = bro.x; duo.y0 = bro.y; bro.held = true; bro.vx = bro.vy = 0; bro.on = null; bro.grounded = false; bro.dir = sis.dir; sis.extra = bro.weight; snd('hop');
}
function endRide() { const { sis, bro, duo } = MV; duo.state = null; bro.held = false; bro.grounded = false; bro.on = null; sis.extra = 0; }
function toss() {
  const { sis, bro, duo } = MV; if (duo.state !== 'on') return;
  const d = (down[bro.keys.right] ? 1 : 0) - (down[bro.keys.left] ? 1 : 0) || (down[sis.keys.right] ? 1 : 0) - (down[sis.keys.left] ? 1 : 0) || sis.dir;
  endRide(); bro.vy = -speedFor(MOVE.tossRise * broHeight()); bro.vx = d * MOVE.tossForward; bro.dir = d; bro.flying = true; bro.tossed = true;
  sis.threw = 0.4; sis.sqv = 4; snd('toss'); puff(sis.x, sis.y, 4);
}
function hopOff() { const { bro } = MV, d = bro.dir; endRide(); bro.vy = -MOVE.hopOff; bro.vx = d * 190; snd('jump'); }
function knockOff() { const { sis, bro } = MV; endRide(); bro.vx = -sis.dir * 140; bro.vy = 0; } // no room for him up there: he slides off behind her

// ---------- falling out of the picture, and coming back
function lose(p) {
  const { sis, bro, duo } = MV; if (p.gone) return;
  if (p.carry) { const b = p.carry; p.carry = null; p.extra = 0; b.held = false; b.carrier = null; b.lost = true; }
  if (duo.state) endRide();
  p.gone = { t: 0 }; p.held = true; p.vx = p.vy = 0; p.alpha = 0; p.on = null; p.grounded = false; p.holding = null; p.climb = null; p.gravity = 1; snd('whoops');
}
function comeBack(p) {
  const { world, hooks } = MV, o = partner(p);
  // next to the partner, unless that would be a short cut (the partner is somewhere this one could not have walked to)
  const join = !o.gone && !o.held && o.grounded && o.on && o.on.isSolid && (!hooks.canJoin || hooks.canJoin(p, o));
  let x = p.safe.x, y = p.safe.y;
  if (join) { // behind the partner if that is firm ground, else in front, else on the same spot
    const firm = (sx) => { const fl = world.below(p, sx, o.y - 20); return world.fits(p, sx, o.y, p.standH) && fl.y <= o.y + 20 && fl.on.isSolid && sx > fl.on.x0 + 24 && sx < fl.on.x1 - 24; };
    x = firm(o.x - o.dir * 80) ? o.x - o.dir * 80 : firm(o.x + o.dir * 80) ? o.x + o.dir * 80 : o.x; y = o.y;
  }
  Object.assign(p, { x, y: y - 2, h: p.standH, crawl: false, vx: 0, vy: -300, held: false, grounded: false, on: null, gone: null, alpha: 1, flying: false, tossed: false, sqv: 6 });
  snd('pop'); puff(x, y - p.h / 2, 12, '#fff6dc', 1.4); burst(x, y - p.h - 10, 5);
}

// ---------- after the world has moved: landings, ducking, carried things, falls, and how they look
function settleSiblings(dt) {
  const { world, sis, bro, duo, hooks } = MV; MV.time += dt;
  // the brother ducks by himself when he walks into a gap that is too low to stand in, and stands up when there is room
  if (!bro.held && !bro.gone) {
    if (bro.crawl) { if (world.fits(bro, bro.x - 14, bro.y, bro.standH) && world.fits(bro, bro.x + 14, bro.y, bro.standH)) { bro.crawl = false; bro.h = bro.standH; } }
    else if (bro.grounded && bro.hitSide && bro.want === bro.hitSide && world.fits(bro, bro.x + bro.hitSide * 8, bro.y, MOVE.crawlHeight)) { bro.crawl = true; bro.h = MOVE.crawlHeight; }
  }
  // he rides on her shoulders
  if (duo.state) {
    const sx = sis.x + 4 * sis.dir, sy = sis.y - MOVE.liftHeight * sis.sqy;
    if (duo.state === 'up') { duo.t += dt; const u = Math.min(1, duo.t / MOVE.liftTime), e = ease(u); bro.x = lerp(duo.x0, sx, e); bro.y = lerp(duo.y0, sy, e) - Math.sin(u * Math.PI) * 44; if (u >= 1) duo.state = 'on'; }
    else { bro.x = sx + Math.sin(MV.time * 5.5) * 1.5; bro.y = sy; if (!world.fits(bro, sis.x, sis.y - MOVE.liftHeight, bro.standH)) knockOff(); }
    if (duo.state) { bro.vx = 0; bro.vy = 0; }
  }
  for (const p of [sis, bro]) {
    const o = partner(p), q = p.pose, riding = p === bro && !!duo.state;
    if (p.gone) { p.gone.t += dt; if (p.gone.t >= MOVE.returnTime) comeBack(p); continue; }
    // landing
    if (p.grounded && !p.wasGrounded && !p.held) {
      if (p.impact > 200) { p.sqv -= Math.min(9, p.impact / 150); snd(p.impact > 1150 ? 'thump' : 'land'); puff(p.x, p.y, p.impact > 900 ? 8 : 4); }
      p.flying = false; p.tossed = false;
    }
    p.wasGrounded = p.grounded; p.airT = p.grounded || riding ? 0 : p.airT + dt;
    if (p.grounded && p.on && p.on.isSolid && p.x > p.on.x0 + 24 && p.x < p.on.x1 - 24) p.safe = { x: p.x, y: p.y }; // somewhere to come back to: firm ground, not the very edge
    if (!p.held && (p.y - p.h > MV.bottom || (hooks.lost && hooks.lost(p)))) { lose(p); continue; }
    // squash and stretch: a little spring
    p.sqv += (-320 * p.sq - 24 * p.sqv) * dt; p.sq = clamp(p.sq + p.sqv * dt, -0.3, 0.2);
    const airborne = !p.grounded && !riding && !p.climb;
    const set = (key, target, rate) => { q[key] += (target - q[key]) * Math.min(1, dt * rate); };
    set('climb', p.climb ? 1 : 0, 14); if (p.climb && p.vy < 0) q.step += dt * 10;
    if (p.holding) p.reachT = 0.15;
    set('air', airborne ? 1 : 0, 16); set('rise', p.vy < -60 ? 1 : 0, 12); set('carry', p.carry ? 1 : 0, 16);
    set('hold', p === sis && (duo.state || p.threw > 0) ? 1 : 0, 14); set('ride', riding ? 1 : 0, 12);
    set('toss', p.tossed && airborne ? 1 : 0, 14); set('strain', p.strain > 0 ? 1 : 0, 18); set('crawl', p.crawl ? 1 : 0, 16);
    q.t = MV.time; q.stride = MOVE.stride;
    const heave = q.strain * Math.sin(MV.time * 30) * 0.02;
    p.sqy = (1 + p.sq) * lerp(1, 0.6, q.crawl) * (1 - q.strain * 0.07 + heave); p.sqx = (1 - p.sq * 0.6) * lerp(1, 1.1, q.crawl) * (1 + q.strain * 0.05);
    const lean = airborne ? clamp(p.vx * p.dir / 420, -1, 1) * 0.1 + q.toss * 0.16 : p.m * 0.035 + q.crawl * 0.1 + q.strain * 0.12;
    p.tilt += (lean - p.tilt) * Math.min(1, dt * 10);
    // legs: running steps, and a footstep sound on each one
    const moving = p.grounded && Math.abs(p.vx) > 25;
    p.m += ((moving ? 1 : 0) - p.m) * Math.min(1, dt * 10);
    if (moving) { const before = p.phase; p.phase += dt * Math.PI * (Math.abs(p.vx) / HC) / (2 * p.stride * MOVE.stride); if (Math.floor(before / Math.PI) !== Math.floor(p.phase / Math.PI)) snd('step'); }
    // faces: the usual ones (worried apart, happy together, sleepy, cheer), and a few for the new moves
    p.cheer = Math.max(0, p.cheer - dt);
    updateExpr(p, o, dt, Math.max(900, VW * 0.9));
    const e = p.ex, steer = (to) => { for (const key in to) e[key] += (to[key] - e[key]) * Math.min(1, dt * 12); };
    if (q.toss > 0.3) steer({ happy: 1, smile: 1, mouth: 0.95, brow: 0.9, sweat: 0, tilt: 0 });
    else if (airborne && p.vy > 500 && p.airT > 0.5) steer({ happy: 0, mouth: 0.7, mw: 0.7, brow: 0.9, smile: 0.1, open: p.face.open * 1.15 });
    else if (p.strain > 0) steer({ happy: 0, tilt: 0.9, sweat: 1, mouth: 0.4, smile: -0.4, open: p.face.open * 0.55 });
    else if (riding) steer({ smile: 1, mouth: 0.5, brow: 0.6, sweat: 0, tilt: 0 });
    p.reachT = Math.max(0, p.reachT - dt); if (p.reachT > 0) e.arm += (1 - e.arm) * Math.min(1, dt * 16); // reaching up for something
    // what they carry rides on the head, steadied with both hands
    if (p.carry) {
      const b = p.carry; b.liftT = Math.min(1, b.liftT + dt / 0.16);
      const u = ease(b.liftT), tx = p.x, ty = p.y - (p.h - 8) * (1 + p.sq) + Math.abs(Math.sin(p.phase)) * 3 * p.m;
      b.x = lerp(b.fromX, tx, u); b.y = lerp(b.fromY, ty, u) - Math.sin(b.liftT * Math.PI) * 26;
      if (b.liftT >= 1) { if (world.fits(b, b.x, b.y)) { b.okX = b.x; b.okY = b.y; } else { putDown(p, [b.okX, b.okY]); snd('put'); } } // knocked off by something low
    }
  }
}

// ---------- on-screen buttons for touch: four per player, the sister's on the left edge, the brother's on the right.
// Tall screens (tablets) get two rows of two, so they fit under one thumb each side; short ones (phones) get one row.
// A finger can slide from one button to the next without lifting.
function makeTouchPads(force) {
  if (!(force || (window.matchMedia && matchMedia('(pointer: coarse)').matches))) return null;
  const tall = innerHeight >= 560 || innerHeight > innerWidth, size = tall ? Math.round(clamp(Math.min(innerWidth, innerHeight) * 0.1, 64, 84)) : 64;
  const css = document.createElement('style');
  css.textContent = `.tpad{position:fixed;bottom:max(12px,env(safe-area-inset-bottom));display:grid;grid-template-columns:repeat(${tall ? 2 : 4},${size}px);gap:${tall ? 10 : 8}px;z-index:5;touch-action:none;user-select:none;-webkit-user-select:none}
.tpad.l{left:max(12px,env(safe-area-inset-left))}.tpad.r{right:max(12px,env(safe-area-inset-right))}
.tpad button{width:${size}px;height:${size}px;border-radius:24%;border:3px solid var(--edge);background:var(--fill);padding:0;display:grid;place-items:center;touch-action:none;-webkit-tap-highlight-color:transparent;outline:0}
.tpad button.on{background:var(--lit);transform:scale(.93)}.tpad svg{width:58%;height:58%;pointer-events:none}
.tpad.l{--fill:rgba(96,112,58,.62);--edge:#e3ecc0;--lit:rgba(150,172,92,.95)}.tpad.r{--fill:rgba(62,104,146,.62);--edge:#d3e6f6;--lit:rgba(104,156,204,.95)}
#turn{position:fixed;inset:0;display:none;place-items:center;background:#1c120aee;z-index:9}#turn svg{width:44vw;max-width:260px;animation:turn 2.4s ease-in-out infinite}
@keyframes turn{0%,25%{transform:rotate(0)}60%,100%{transform:rotate(90deg)}}@media (orientation:portrait){body.touch #turn{display:grid}}`;
  document.head.appendChild(css); document.body.classList.add('touch');
  const icon = {
    left: '<svg viewBox="0 0 24 24"><path d="M15.5 4.5 7 12l8.5 7.5z" fill="#fff" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/></svg>',
    right: '<svg viewBox="0 0 24 24"><path d="M8.5 4.5 17 12l-8.5 7.5z" fill="#fff" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M12 3 20.5 12.5h-5V21h-7v-8.5h-5z" fill="#fff" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="#fff"><rect x="5.6" y="5.5" width="3" height="9" rx="1.5"/><rect x="9.3" y="3" width="3" height="11" rx="1.5"/><rect x="13" y="3.6" width="3" height="10.5" rx="1.5"/><rect x="16.7" y="6" width="3" height="8.5" rx="1.5"/><rect x="5.6" y="11" width="14.1" height="10" rx="4.2"/><rect x="2" y="10.6" width="3.3" height="8.4" rx="1.65" transform="rotate(-38 3.6 14.8)"/></svg>',
  };
  // jump sits on the outside edge, where a thumb rests
  const order = { l: tall ? ['up', 'down', 'left', 'right'] : ['left', 'right', 'up', 'down'], r: tall ? ['down', 'up', 'left', 'right'] : ['down', 'up', 'left', 'right'] };
  const pads = [], buttons = [];
  for (const [side, p] of [['l', MV.sis], ['r', MV.bro]]) {
    const pad = document.createElement('div'); pad.className = 'tpad ' + side;
    for (const what of order[side]) { const b = document.createElement('button'); b.type = 'button'; b.dataset.k = p.keys[what]; b.innerHTML = icon[what]; pad.appendChild(b); buttons.push(b); }
    document.body.appendChild(pad); pads.push(pad);
  }
  const turn = document.createElement('div'); turn.id = 'turn'; // "turn me": a phone held upright is too narrow for two
  turn.innerHTML = '<svg viewBox="0 0 60 100"><rect x="8" y="4" width="44" height="92" rx="8" fill="none" stroke="#e9c98a" stroke-width="5"/><circle cx="30" cy="86" r="3.5" fill="#e9c98a"/></svg>';
  document.body.appendChild(turn);
  const held = new Map(); // which button each finger is on
  const under = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY), b = el && el.closest ? el.closest('.tpad button') : null; return b ? b.dataset.k : null; };
  const sync = () => { const on = new Set(held.values()); for (const b of buttons) { const k = b.dataset.k; if (on.has(k) && !down[k]) TAPS[k] = true; down[k] = on.has(k); b.classList.toggle('on', on.has(k)); } };
  addEventListener('pointerdown', (e) => { const k = under(e); if (!k) return; e.preventDefault(); held.set(e.pointerId, k); sync(); }, { passive: false });
  addEventListener('pointermove', (e) => { if (!held.has(e.pointerId)) return; const k = under(e); if (held.get(e.pointerId) !== k) { held.set(e.pointerId, k); sync(); } });
  for (const ev of ['pointerup', 'pointercancel']) addEventListener(ev, (e) => { if (held.delete(e.pointerId)) sync(); });
  addEventListener('contextmenu', (e) => { if (e.target.closest && e.target.closest('.tpad')) e.preventDefault(); });
  return { pads, height: () => Math.max(...pads.map((pad) => innerHeight - pad.getBoundingClientRect().top)) };
}

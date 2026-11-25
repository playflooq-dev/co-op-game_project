'use strict';
// Level 3, the canal: it builds the sections from settings.js, lets the siblings move with shared/movement.js on the
// physics in shared/physics.js, and draws it all over the scenery in scenery.js. The objects come from shared/kit.js,
// the canal's own things.js and the city's things.js (the Old Bridge). (The way a level is run is the same as in the
// park's level.js and the city's lab.js.)
// Useful while testing (add to the address of canal.html):
//   ?section=3  starts at section 3 (1 to 7)                 ?at=2400    starts both siblings at that place
//   ?debug=1    shows what is solid, what is switched on, the section names and the frame rate
//   ?hints=fast the picture hints come ten times sooner      ?tune=1     sliders for the numbers in MOVE
//   ?touch=1    shows the touch buttons on a computer        ?fps=30     draws only that many frames a second
const DEBUG = QS.get('debug'), TUNE = QS.get('tune'), SLOW = +QS.get('fps') || 0;
const FROM = QS.get('section') === null ? 0 : clamp((Math.floor(+QS.get('section')) || 1) - 1, 0, SECTIONS.length - 1), AT = +QS.get('at') || 0;
Object.assign(MOVE, CANAL_MOVE);
let last = performance.now();
const game = { time: 0, chapter: 0, queue: [], bubble: null, sparks: [], objective: '', objT: 0, done: false, endT: 0, exitT: -1, lift: 0, shake: 0, fps: 60, slow: 0,
  section: FROM, entered: SECTIONS.map(() => null), // when each section was first reached (seconds of play)
  solved: {}, solvedAt: {}, splashes: 0, five: false }; // which puzzles are done, and when; how often somebody fell in
game.entered[FROM] = 0;
if (typeof SOUND !== 'undefined') SOUND.wantMusic = true;

// ---------- the world: the quay (none over water), its two ends, and everything the sections place on it
const world = makeWorld();
const begin = AT ? [AT - 50, AT + 50] : SECTIONS[FROM].start;
const players = [makePlayer('sister', begin[0], FEET, 1), makePlayer('brother', begin[1], FEET, -1)];
const [sis, bro] = players;
{ let x = -5000; for (const [a, b] of WATERS) { world.solid(x, FEET, a, FEET + 900); x = b; } world.solid(x, FEET, CANAL.length + 5000, FEET + 900); }
world.solid(-5000, -5000, CANAL.walk[0], FEET); world.solid(CANAL.walk[1], -5000, CANAL.length + 5000, FEET);
const kit = []; SECTIONS.forEach((s, n) => s.things.forEach((d) => kit.push(Object.assign(kitMake(world, d, FEET), { section: n }))));
const kitIn = (n, kind, i = 0) => kit.filter((o) => o.section === n && o.def.kind === kind)[i];
const overWater = (x) => WATERS.some(([a, b]) => x > a && x < b);
setupMovement(world, players, {
  thing: (p) => { let best = null, bd = 1e9; for (const o of kit) if (o.thing && o.thing.canUse(p)) { const d = Math.abs(o.thing.x - p.x); if (d < bd) { bd = d; best = o.thing; } } return best; },
  ladder: (p) => { for (const o of kit) if (o.ladder) { const l = o.ladder(p); if (l) return l; } return null; },
  // in the water: a splash, and back they come (a sibling beside the partner or to their last safe spot, a box to where it started)
  lost: (b) => { if (b.y < FEET + 78 || !overWater(b.x)) return false; game.splashes++; snd('splash'); puff(b.x, FEET + 30, 12, '#d6ecf6', 2.2); if (typeof reactSplash === 'function') reactSplash(b); return true; },
  // a sibling comes back next to the partner only if the partner is on the same level and the same bank: never a short cut
  canJoin: (p, o) => Math.abs(o.y - p.safe.y) < 60 && !WATERS.some(([a, b]) => (p.safe.x < (a + b) / 2) !== (o.x < (a + b) / 2)),
});
MV.bottom = VH + 260;
const pads = makeTouchPads(QS.get('touch'));
const bridge = kitIn(6, 'bridge');
if (FROM > 0 && typeof CHAPTER !== 'undefined') CHAPTER.note('canal', FROM);

function fitScreen() { // on touch screens the quay is drawn higher, so the buttons sit over the canal in front
  resizeScreen();
  game.lift = pads ? clamp(pads.height() * DPR / S - 84, 0, 300) : 0;
}
function cameraTarget() { // the middle of the two; or, while both are inside a section's view, the whole view held still
  const mid = (sis.x + bro.x) / 2, v = SECTIONS[game.section].view;
  const hold = v && VW >= v[1] - v[0] && sis.x > v[0] && sis.x < v[1] && bro.x > v[0] && bro.x < v[1];
  // The picture never moves so far that it would push the one behind along (in Levels 1 and 2 it does): here that
  // could push her off the quay into the water. So whoever runs ahead simply stops at the edge of the picture.
  const want = (hold ? (v[0] + v[1]) / 2 : mid) - VW / 2, lo = Math.min(sis.x, bro.x) - MOVE.edge - 6, hi = Math.max(sis.x, bro.x) + MOVE.edge + 6 - VW;
  return clamp(clamp(want, Math.min(hi, lo), lo), 0, Math.max(0, CANAL.length - VW));
}

// ---------- the puzzles: when each counts as solved (for the jingle, the hints and the test)
const past = (x) => sis.x > x && bro.x > x && !sis.gone && !bro.gone;
const high = (p) => FEET - p.y;
const PUZZLES = {
  0: () => past(kitIn(0, 'lockgate').def.x + 40), 1: () => past(STREAM_A[1] + 40), 2: () => past(BASIN[1] + 40),
  4: () => past(kitIn(4, 'lockgate').def.x + 40), 5: () => past(kitIn(5, 'lockgate').def.x + 40), 6: () => bridge.state.down,
};
function solve(n) { // a short jingle, and they cheer together. (The bridge has its own fanfare.)
  game.solved[n] = true; game.solvedAt[n] = game.time;
  if (n !== 6) { snd('great'); burst((sis.x + bro.x) / 2, Math.min(sis.y, bro.y) - 260, 12); for (const p of players) p.cheer = Math.max(p.cheer, 0.9); }
  if (typeof reactSolved === 'function') reactSolved(n);
}
for (const n in PUZZLES) if (+n < FROM || PUZZLES[n]()) game.solved[n] = true; // starting part-way: what lies behind is done already, without the jingle

// ---------- every frame
function update(dt) {
  const ending = game.exitT >= 0;
  game.time += dt;
  moveSiblings(dt, ending || game.done);
  for (const o of kit) if (o.update) o.update(dt);
  world.step(dt);
  for (const o of kit) if (o.after) o.after(dt);
  settleSiblings(dt);
  if (typeof reactUpdate === 'function') reactUpdate(dt);
  updateMoveFx(dt); updateTalk(dt);
  game.shake = Math.max(0, game.shake - dt * 2.5);
  for (const n in PUZZLES) if (!game.solved[n] && PUZZLES[n]()) solve(+n);
  // which section they are in: the furthest one both have reached
  const back = Math.min(sis.x, bro.x); let n = game.section; while (n + 1 < SECTIONS.length && back >= SECTIONS[n + 1].x[0]) n++;
  if (n !== game.section) { game.section = n; if (game.entered[n] === null) game.entered[n] = game.time; if (typeof CHAPTER !== 'undefined') CHAPTER.note('canal', n); }
  camX += (cameraTarget() - camX) * Math.min(1, dt * 4);
  updateHints(dt); game.goalT = (game.goalT || 0) + dt;
  // the bridge is down and she has walked over to him: a high five
  if (game.solved[6] && !game.five && !ending && past(RIVER[1] + 30) && Math.abs(sis.x - bro.x) < 240 && sis.grounded && bro.grounded) { game.five = true; highFive(); }
  // the end: both on the forest path
  if (game.solved[6] && !ending && players.every((p) => !p.gone && Math.abs(p.x - CANAL.exit) < 130)) { game.exitT = 0; game.finished = game.time; }
  if (ending) { game.exitT += dt; const u = Math.min(1, game.exitT / 1.6); for (const p of players) { p.x += (CANAL.exit - p.x) * Math.min(1, dt * 1.5); p.alpha = 1 - u; } if (game.exitT > 1.8 && !game.done) { game.done = true; snd('great'); if (typeof CHAPTER !== 'undefined') CHAPTER.mark('canal'); } }
  if (game.done) { game.endT += dt; if (game.endT > 1.2 && ['KeyW', 'ArrowUp', 'Enter', 'Space'].some((k) => hit(k) || TAPS[k])) location.href = CANAL.next; }
  if (typeof musicArea === 'function') musicArea(game.section >= 5 ? 'evening' : 'quay');
  endInput();
}

function drawShadow(c, b) { // on whatever is below: smaller and fainter the higher they are
  const fl = world.below(b); if (fl.y === Infinity) return;
  const k = clamp01(1 - (fl.y - b.y) / 560), r = (b.kind === 'box' ? b.w * 0.62 : 46) * (0.55 + 0.45 * k);
  soft(c, b.x - (b.kind === 'box' ? 0 : 3 * b.dir), fl.y + 3, r, 8 * (0.55 + 0.45 * k), '#2a1a0e', 0.1 + 0.3 * k);
}
function drawBadge(c, x, y, icon, col, t) { // a little sign over a head, in place of words
  c.save(); c.translate(x, y + Math.sin(t * 5) * 2.5); c.globalAlpha *= 0.95;
  c.beginPath(); circ(c, 0, 0, 23); fs(c, col, '#fff6dc', 3); drawIcon(c, icon, 0, icon === 'hands' ? 0 : 1, icon === 'hands' ? 1.05 : 0.95); c.restore();
}
function signFor(p) { // what a key would do for this sibling right now: 'hand' (grab: pick up or use) or 'up' (jump: climb), or nothing
  if (p.gone || p.carry || p.holding || p.climb || MV.duo.state === 'up' || !(p.grounded || p.held)) return null;
  if (MV.hooks.thing(p) || (!MV.duo.state && nearBox(p))) return 'hand';
  return !MV.duo.state && MV.hooks.ladder(p) ? 'up' : null; // (no sign for the lift: no puzzle of this level needs it)
}
function drawSigns(c, t) { for (const p of players) { const icon = signFor(p); if (icon) drawBadge(c, p.x, p.y - p.h - 34, icon, p.col, t); } }

// ---------- hints, without words. Each puzzle is a list of steps: whose turn, when the step is done, where the thing
// is, where to stand, and what to show. While the next step stays undone the thing first sparkles, then gets an
// arrow, then a faint ghost of that sibling stands in the right place (HINT_TIMES in settings.js).
const val = (v) => (typeof v === 'function' ? v() : v);
const HINTS = (() => {
  const on = (pl) => players.find((p) => p.on === pl.ledge), other = (p) => (p === sis ? bro : sis), behind = (x) => (sis.x <= bro.x ? (sis.x < x ? sis : bro) : (bro.x < x ? bro : sis));
  const plateStep = (pl, who, done) => ({ who, done, x: pl.def.x, y: FEET - 20, gx: pl.def.x });
  const walk = (x, who = () => behind(x)) => ({ who, done: () => past(x + 40), x, y: FEET - 150, gx: x + 130 });
  // 1: plate and gate
  const pA = kitIn(0, 'plate', 0), pB = kitIn(0, 'plate', 1), g0 = kitIn(0, 'lockgate').def.x;
  // 2: the thin plank
  const fb1 = kitIn(1, 'footbridge'), pT = kitIn(1, 'plate'), midA = (STREAM_A[0] + STREAM_A[1]) / 2;
  // 3: the see-saw and the boats
  const saw3 = kitIn(2, 'launcher'), lev3 = kitIn(2, 'lever'), raft = kitIn(2, 'raft'), over3 = () => bro.x > BASIN[0] + 300 && !bro.gone;
  // 5: the box over the plank
  const box5 = kitIn(4, 'box').body, p5 = kitIn(4, 'plate'), lad5 = kitIn(4, 'dropladder').def, lock = kitIn(4, 'lever'), g5 = kitIn(4, 'lockgate').def.x, shelf5 = kitIn(4, 'ledge').def.h;
  // 6: the see-saw on the ledge
  const box6 = kitIn(5, 'box').body, blk = kitIn(5, 'block').def, saw6 = kitIn(5, 'launcher'), lev6 = kitIn(5, 'lever'), g6 = kitIn(5, 'lockgate').def.x, shelf6 = kitIn(5, 'ledge').def.h;
  const onBlock = (p) => high(p) > blk.h - 20 && p.x > blk.x[0] && p.x < blk.x[1] + 200, step6 = blk.x[0] - 43;
  // 7: the Old Bridge
  const near = kitIn(6, 'lever', 0), far = kitIn(6, 'lever', 1);
  return [
    [ plateStep(pA, () => sis, () => on(pA) || sis.x > g0 || bro.x > g0),
      { who: () => other(on(pA) || sis), done: () => sis.x > g0 + 40 || bro.x > g0 + 40, x: g0, y: FEET - 150, gx: g0 + 130 },
      plateStep(pB, () => (sis.x > g0 ? sis : bro), () => on(pB) || past(g0 + 40)), walk(g0) ],
    [ { who: () => bro, done: () => bro.x > STREAM_A[1] || fb1.state.on, x: midA, y: FEET - 30, gx: STREAM_A[1] + 60 },   // he walks over the plank
      plateStep(pT, () => bro, () => fb1.state.on),                                                                         // and steps on the plate
      { who: () => sis, done: () => past(STREAM_A[1] + 40), x: midA, y: FEET - 30, gx: STREAM_A[1] + 150 } ],               // she walks over the bridge
    [ { who: () => bro, done: () => (bro.on === saw3.ledge && bro.x > saw3.def.x + 30) || over3() || lev3.state.on, x: saw3.def.x + 150, y: FEET - 60, gx: saw3.def.x + 150, gy: 16 }, // he stands on the blue end (its tip is low enough to step onto; anywhere on it can be jumped onto)
      { who: () => sis, icon: 'up', done: () => over3() || lev3.state.on, x: saw3.def.x - 125, y: FEET - 150, gx: saw3.def.x - 125, gy: 100 },                                         // she jumps onto the green end
      { who: () => bro, icon: 'hand', done: () => lev3.state.on, x: lev3.def.x, y: FEET - 150, gx: lev3.def.x - 50 },                                                                 // he pulls the lever
      { who: () => sis, done: () => past(BASIN[1] + 40), x: () => raft.state.x, y: FEET - 70, gx: () => raft.state.x, gy: 15 } ],                                                     // she steps onto the raft
    [],
    [ { who: () => bro, icon: 'hand', done: () => box5.held || box5.x > STREAM_B[0] || p5.state.on, x: () => box5.x, y: () => box5.y - 50, gx: () => box5.x - 84 },                  // he picks up the box
      { who: () => bro, icon: 'hand', carry: true, done: () => p5.state.on, x: p5.def.x, y: FEET - 20, gx: p5.def.x - 90 },                                                          // carries it over the plank onto the plate
      { who: () => sis, icon: 'up', done: () => high(sis) > shelf5 - 20 || lock.state.on, x: lad5.x, y: FEET - 170, gx: lad5.x },                                                    // she climbs the ladder
      { who: () => sis, icon: 'hand', done: () => lock.state.on, x: lock.def.x, y: FEET - lock.def.h, gx: lock.def.x - 40, gy: shelf5 },                                             // and pulls the high lever
      walk(g5) ],
    [ { who: () => box6.carrier || sis, icon: 'hand', carry: () => box6.held, done: () => (!box6.held && box6.grounded && Math.abs(box6.x - step6) < 70) || (onBlock(sis) && onBlock(bro)) || lev6.state.on,
        x: () => (box6.held ? step6 : box6.x), y: () => (box6.held ? FEET - 30 : box6.y - 50), gx: () => (box6.held ? step6 - 100 : box6.x - 84) },                                   // the box goes against the ledge
      { who: () => (onBlock(sis) ? bro : sis), icon: 'up', done: () => (onBlock(sis) && onBlock(bro)) || lev6.state.on, x: blk.x[0] + 90, y: FEET - blk.h - 40, gx: blk.x[0] + 90, gy: blk.h }, // both climb up
      { who: () => bro, done: () => (bro.on === saw6.ledge && bro.x > saw6.def.x + 30) || high(bro) > shelf6 - 30 || lev6.state.on, x: saw6.def.x + 150, y: FEET - blk.h - 60, gx: saw6.def.x + 150, gy: blk.h + 16 },
      { who: () => sis, icon: 'up', done: () => high(bro) > shelf6 - 30 || lev6.state.on, x: saw6.def.x - 125, y: FEET - blk.h - 150, gx: saw6.def.x - 125, gy: blk.h + 100 },
      { who: () => bro, icon: 'hand', done: () => lev6.state.on, x: lev6.def.x, y: FEET - lev6.def.h, gx: lev6.def.x - 50, gy: shelf6 },
      walk(g6) ],
    [ { who: () => bro, done: () => bro.x > RIVER[1] || bridge.state.down, x: RIVER[0] + 100, y: FEET - 50, gx: RIVER[1] + 70 },                                                       // he hops over the boats
      { who: () => sis, icon: 'hand', done: () => bridge.state.down || sis.holding === near.thing, x: near.def.x, y: FEET - near.def.h, gx: near.def.x - 40 },                          // each holds a lever
      { who: () => bro, icon: 'hand', done: () => bridge.state.down, x: far.def.x, y: FEET - far.def.h, gx: far.def.x - 40 },
      { who: () => sis, done: () => false, x: CANAL.exit, y: FEET - 150, gx: CANAL.exit - 40 } ],
  ];
})();
const hint = { key: '', t: 0, step: null, fast: QS.get('hints') === 'fast' ? 10 : 1 };
function updateHints(dt) {
  const steps = HINTS[game.section] || [], i = steps.findIndex((s) => !s.done()), key = game.section + ':' + i;
  if (key !== hint.key) { hint.key = key; hint.t = 0; }
  hint.step = i < 0 || game.exitT >= 0 ? null : steps[i];
  if (hint.step) hint.t += dt * hint.fast;
}
function drawGhost(c, p, s, t) { // a faint copy of a sibling, washed in their colour, breathing in and out and glittering: a picture, not a person
  const x = val(s.gx), y = FEET - (val(s.gy) || 0), fade = 0.42 + 0.16 * Math.sin(t * 2.4), carry = val(s.carry);
  const g = Object.assign(Object.create(p), { x, y, alpha: 0, m: 0, phase: 0, cheer: 0, giggle: 0, sqx: 1, sqy: 1, tilt: 0, scale: 1, dir: s.dir || 1, carry: null,
    ex: Object.assign({}, p.ex, { arm: s.icon === 'hand' && !carry ? 1 : 0, happy: 0, sweat: 0, blinkF: 1 }), pose: Object.assign({}, p.pose, { air: 0, rise: 0, carry: carry ? 1 : 0, hold: 0, ride: 0, toss: 0, strain: 0, crawl: 0, climb: 0, t }) });
  drawChar(g, t); // fills the character buffer without showing it; then the buffer is washed and shown faintly
  const b = buf.c; b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-atop'; b.globalAlpha = 0.6; b.fillStyle = p.col; b.fillRect(0, 0, buf.cv.width, buf.cv.height); b.globalAlpha = 1; b.globalCompositeOperation = 'source-over';
  c.save(); c.globalAlpha = fade; c.drawImage(buf.cv, x - BAX, y - BAY, BW, BH); c.restore();
  if (carry) { c.save(); c.globalAlpha = fade; rrect(c, x - 43, y - p.standH - 82, 86, 86, 6); fs(c, '#dcb983', p.col, 4); c.restore(); }
  c.save(); c.globalAlpha = Math.min(1, fade * 2.2); if (s.icon) drawBadge(c, x, y - p.standH - (carry ? 130 : 40), s.icon, p.col, t); c.restore();
  for (let k = 0; k < 3; k++) star(c, x + Math.cos(t * 2 + k * 2.1) * 70, y - 110 + Math.sin(t * 2.6 + k * 2.1) * 90, 8 + Math.sin(t * 5 + k) * 3, t + k, fade);
}
function drawHintMarks(c, t) {
  const s = hint.step; if (!s) return;
  const x = val(s.x), y = val(s.y), who = s.who(), col = who.col;
  if (hint.t >= HINT_TIMES[0]) for (let k = 0; k < 4; k++) { const a = t * 1.8 + k * TAU / 4, r = 46 + Math.sin(t * 3 + k) * 8; star(c, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7, 11 + Math.sin(t * 6 + k * 2) * 5, t * 2 + k, 0.9); }
  const ghost = hint.t >= HINT_TIMES[2], over = ghost && Math.abs(val(s.gx) - x) < 80; // the arrow moves up out of the ghost's way
  if (hint.t >= HINT_TIMES[1]) { const ay = (over ? FEET - (val(s.gy) || 0) - who.standH - 150 : y - 96) + Math.sin(t * 5) * 10; c.save(); c.translate(x, ay); c.rotate(Math.PI); drawIcon(c, 'up', 0, 0, 1.7, col); c.restore(); }
  if (ghost) drawGhost(c, who, s, t);
}
function drawGoalBubble(c, t) { // the picture bubble: what this part is about. It shows on arriving, and again whenever both stand still for a while.
  const icon = game.solved[game.section] ? (game.section === 6 ? 'tree' : null) : SECTIONS[game.section].goal; if (!icon) return; // (once the bridge is down: on, into the forest)
  if (game.section === 6 && game.solved[6] && !game.treeT) { game.treeT = 1; game.goalT = -2.5; } // the forest picture comes up a moment after the celebration
  game.goalT = game.goalKey === game.section ? game.goalT : 0; game.goalKey = game.section;
  const a = game.goalT < 0 ? 0 : game.goalT < 5 ? Math.min(1, game.goalT * 3, (5 - game.goalT) * 2) : sis.idle > 5 && bro.idle > 5 ? Math.min(1, (Math.min(sis.idle, bro.idle) - 5) * 2) : 0; if (a <= 0) return;
  const x = clamp(sis.x, camX + 90, camX + VW - 90), y = sis.y - sis.standH - (sis.carry ? 214 : 118) + Math.sin(t * 2) * 3;
  c.save(); ell(c, x - 14, y + 62, 7, 7, '#fffbf0', a); ell(c, x - 4, y + 46, 10, 10, '#fffbf0', a); c.globalAlpha = a;
  c.beginPath(); c.ellipse(x, y, 54, 42, 0, 0, TAU); fs(c, '#fffbf0', '#8a6a3a', 3); drawIcon(c, icon, x, y, 1.9); c.restore();
}
function drawEnd(c, t, top) { // the end card, in pictures: a high five, the time on a clock, and an arrow (jump goes on, to the chapter map)
  const a = Math.min(1, game.endT); c.fillStyle = `rgba(28,18,10,${a * 0.75})`; c.fillRect(camX - 10, 0, VW + 20, VH + top + 40);
  c.save(); c.globalAlpha = a; const w = 460, h = 330, x = camX + VW / 2 - w / 2, y = top + (VH - top) / 2 - h / 2 - 40, cx = x + w / 2; parchment(c, x, y, w, h);
  const clap = Math.pow(Math.abs(Math.sin(t * 2.6)), 6) * 10;
  for (const [side, col] of [[-1, sis.col], [1, bro.col]]) { c.save(); c.translate(cx + side * (40 - clap), y + 96); c.scale(side, 1); rrect(c, -22, 22, 44, 20, 6); fs(c, col, INK, 3); drawIcon(c, 'hand', 0, 0, 2.3); c.restore(); }
  for (let k = 0; k < 5; k++) star(c, cx + Math.cos(-Math.PI / 2 + (k - 2) * 0.62) * 118, y + 112 + Math.sin(-Math.PI / 2 + (k - 2) * 0.62) * 84, 12 + Math.sin(t * 5 + k * 1.7) * 5, t + k, a * 0.95);
  const secs = Math.floor(game.finished || game.time), time = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
  c.fillStyle = INK; c.font = '700 38px Georgia, serif'; c.textBaseline = 'middle'; c.textAlign = 'left'; const tw = c.measureText(time).width, lx = cx - (52 + 14 + tw) / 2 + 26;
  c.beginPath(); circ(c, lx, y + 200, 26); fs(c, '#fffbf0', INK, 4); c.strokeStyle = INK; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(lx, y + 184); c.lineTo(lx, y + 200); c.lineTo(lx + 12, y + 207); c.stroke(); c.fillStyle = INK; c.fillText(time, lx + 40, y + 202);
  if (game.endT > 1.2) { c.globalAlpha = a * (0.6 + Math.sin(t * 4) * 0.4); drawIcon(c, 'up', cx, y + h - 52, 1.6, '#6d9b45'); }
  c.restore(); c.textBaseline = 'alphabetic';
}
function drawDebug(c, t, top) {
  c.save(); c.lineWidth = 2;
  c.strokeStyle = 'rgba(255,60,40,.9)'; for (const s of world.solids) if (!s.off && s.x1 > camX - 50 && s.x0 < camX + VW + 50) c.strokeRect(Math.max(s.x0, camX - 40), Math.max(s.y0, -40), Math.min(s.x1, camX + VW + 40) - Math.max(s.x0, camX - 40), Math.min(s.y1, VH + 40) - Math.max(s.y0, -40));
  for (const l of world.ledges) { c.strokeStyle = l.off ? 'rgba(255,220,60,.3)' : 'rgba(255,220,60,.95)'; c.beginPath(); c.moveTo(l.x0, l.y); c.lineTo(l.x1, l.y1 === undefined ? l.y : l.y1); c.stroke(); }
  for (const b of world.bodies) { c.strokeStyle = b.held ? 'rgba(120,255,255,.5)' : b.grounded ? 'rgba(80,255,120,.95)' : 'rgba(255,255,255,.95)'; c.strokeRect(b.x - b.w / 2, b.y - b.h, b.w, b.h); }
  for (const o of kit) if (o.thing) { c.strokeStyle = 'rgba(255,120,255,.9)'; c.beginPath(); circ(c, o.thing.x, o.thing.y, 10); c.stroke(); }
  for (const p of players) { c.strokeStyle = p.col; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(p.x - 40, sibReachY(p)); c.lineTo(p.x + 40, sibReachY(p)); c.stroke(); c.setLineDash([]); }
  c.font = '600 20px monospace'; c.textAlign = 'left'; c.textBaseline = 'top';
  const tag = (s, x, y, col = '#fff6dc') => { c.fillStyle = 'rgba(20,12,6,.78)'; c.fillRect(x, y, c.measureText(s).width + 16, 25); c.fillStyle = col; c.fillText(s, x + 8, y + 3); };
  SECTIONS.forEach((s) => { c.strokeStyle = 'rgba(120,200,255,.8)'; c.setLineDash([14, 10]); c.beginPath(); c.moveTo(s.x[0], 0); c.lineTo(s.x[0], VH); c.stroke(); c.setLineDash([]); tag('section ' + s.name, s.x[0] + 8, top + 150, '#bfe2ff'); });
  for (const id in KIT_AT) tag(id + (KIT_SIG[id] ? ' ON' : ' off'), KIT_AT[id].x - 30, FEET + 66, KIT_SIG[id] ? '#ffe27a' : '#b9b0a4');
  const lines = [`fps ${game.fps.toFixed(0)}   slowest frame ${game.slow.toFixed(0)} ms   cam ${camX.toFixed(0)}   section ${game.section + 1}   solved ${Object.keys(game.solved).map((n) => +n + 1).join(' ') || '-'}   splashes ${game.splashes}   time ${game.time.toFixed(0)} s   hint ${hint.step ? hint.t.toFixed(0) + ' s' : '-'}`,
    ...players.map((p) => `${p.who.padEnd(7)} x ${p.x.toFixed(0).padStart(5)}  y ${high(p).toFixed(0).padStart(4)} up  vx ${p.vx.toFixed(0).padStart(5)} vy ${p.vy.toFixed(0).padStart(5)}  ${p.gone ? 'gone' : p.held ? 'held' : p.grounded ? 'ground' : 'air'}${p.carry ? ' carry' : ''}  on ${p.on ? (p.on.isBody ? 'box' : p.on.isLedge ? 'ledge' : 'solid') : '-'}`),
    `duo ${MV.duo.state || '-'}   jump ${(MOVE.jumpHeight * broHeight()).toFixed(0)} units in ${MOVE.jumpTime}s`];
  lines.forEach((s, i) => tag(s, camX + 250, top + 22 + i * 26));
  c.restore();
}

function frame(now) {
  if (SLOW && now - last < 1000 / SLOW - 3) { requestAnimationFrame(frame); return; } // ?fps=30: draw fewer frames, to feel a slow device
  const ms = now - last, dt = Math.min(0.05, ms / 1000); last = now; const t = now / 1000;
  if (ms > 0 && ms < 1000) { game.fps += (1000 / ms - game.fps) * 0.05; game.slow = Math.max(game.slow * 0.995, ms); }
  update(dt);
  const c = ctx, top = game.lift;
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.textAlign = 'left';
  c.setTransform(S, 0, 0, S, -camX * S, ((game.shake > 0 ? Math.sin(t * 95) * 6 * game.shake : 0) - top) * S);
  drawQuay(c, t); liveWater(c, t);
  for (const o of kit) if (o.draw) o.draw(c, t);
  for (const b of world.bodies) if (!b.held && !b.gone) drawShadow(c, b);
  for (const o of kit) if (o.body && !o.body.held) o.body.draw(c, t);
  for (const p of players) { if (p.gone) continue; drawChar(p, t); if (p.carry) p.carry.draw(c, t); }
  for (const o of kit) if (o.drawFront) o.drawFront(c, t);
  if (typeof reactDrawFront === 'function') reactDrawFront(c, t);
  if (!game.done && game.exitT < 0) drawHintMarks(c, t);
  drawMoveFx(c); drawSparks(c);
  drawLampGlow(c); drawQuayGlow(c);
  if (!game.done) { drawSigns(c, t); drawGoalBubble(c, t); }
  if (DEBUG) drawDebug(c, t, top);
  if (game.done) drawEnd(c, t, top);
  requestAnimationFrame(frame);
}

// ---------- sliders for the feel (?tune=1): a developer's tool, so it uses words
function tunePanel() {
  const rows = [['jumpHeight', 0.8, 2.2, 0.05], ['jumpTime', 0.2, 0.6, 0.01], ['fallFaster', 1, 2.5, 0.05], ['coyote', 0, 0.3, 0.01], ['buffer', 0, 0.3, 0.01],
    ['speed.sister', 150, 450, 5], ['speed.brother', 150, 450, 5], ['accel', 800, 5000, 100], ['brake', 800, 6000, 100], ['airAccel', 400, 4000, 100], ['seesawRise', 1.5, 4, 0.05]];
  const get = (k) => k.split('.').reduce((o, part) => o[part], MOVE), put2 = (k, v) => { const parts = k.split('.'), last2 = parts.pop(); parts.reduce((o, part) => o[part], MOVE)[last2] = v; };
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;right:10px;top:10px;z-index:8;background:#1c120ae6;color:#fff6dc;font:12px/1.5 monospace;padding:10px 12px;border-radius:10px;max-height:94vh;overflow:auto';
  box.innerHTML = '<b>MOVE</b> (shared/movement.js)<br>' + rows.map(([k, lo, hi, st]) => `<label style="display:grid;grid-template-columns:104px 150px 44px;align-items:center;gap:6px">${k}<input type="range" data-k="${k}" min="${lo}" max="${hi}" step="${st}" value="${get(k)}"><span>${get(k)}</span></label>`).join('');
  box.addEventListener('input', (e) => { const k = e.target.dataset.k; if (!k) return; put2(k, +e.target.value); e.target.nextElementSibling.textContent = e.target.value; });
  box.addEventListener('keydown', (e) => e.stopPropagation());
  document.body.appendChild(box);
}

addEventListener('resize', fitScreen); fitScreen();
if (TUNE) tunePanel();
camX = cameraTarget();
requestAnimationFrame((tm) => { last = tm; frame(tm); });

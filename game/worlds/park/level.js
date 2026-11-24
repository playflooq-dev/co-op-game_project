'use strict';
// Level 1, the park: it builds the sections from settings.js, lets the siblings move with shared/movement.js on the
// physics in shared/physics.js, and draws it all over the scenery in scenery.js. The objects come from shared/kit.js
// and the park's own things.js and life.js. (The way a level is run is the same as in the city lab's lab.js.)
// Useful while testing (add to the address of park.html):
//   ?section=3  starts at section 3 (1 to 6)                 ?at=2400    starts both siblings at that place
//   ?debug=1    shows what is solid, which plates are on, the section names and the frame rate
//   ?hints=fast the picture hints come ten times sooner      ?tune=1     sliders for the numbers in MOVE
//   ?touch=1    shows the touch buttons on a computer        ?fps=30     draws only that many frames a second
//   ?zoom=3     looks closer (?look=bro follows the brother)
const DEBUG = QS.get('debug'), TUNE = QS.get('tune'), SLOW = +QS.get('fps') || 0;
const FROM = QS.get('section') === null ? 0 : clamp((Math.floor(+QS.get('section')) || 1) - 1, 0, SECTIONS.length - 1), AT = +QS.get('at') || 0;
Object.assign(MOVE, PARK_MOVE); // Level 1 is a little more forgiving than the lab
let last = performance.now();
const game = { time: 0, chapter: 0, queue: [], bubble: null, sparks: [], objective: '', objT: 0, done: false, endT: 0, exitT: -1, lift: 0, shake: 0, fps: 60, slow: 0,
  section: FROM, entered: SECTIONS.map(() => null), // when each section was first reached (seconds of play)
  solved: {}, solvedAt: {} };                       // which puzzles are done, and when
game.entered[FROM] = 0;
if (typeof SOUND !== 'undefined') SOUND.wantMusic = true;

// ---------- the world: the path, its two ends, and everything the sections place on it
const world = makeWorld();
const begin = AT ? [AT - 50, AT + 50] : SECTIONS[FROM].start;
const players = [makePlayer('sister', begin[0], FEET, 1), makePlayer('brother', begin[1], FEET, -1)];
const [sis, bro] = players;
world.solid(-5000, FEET, PARK.length + 5000, FEET + 900);
world.solid(-5000, -5000, PARK.walk[0], FEET); world.solid(PARK.walk[1], -5000, PARK.length + 5000, FEET);
const kit = []; SECTIONS.forEach((s, n) => s.things.forEach((d) => kit.push(Object.assign(kitMake(world, d, FEET), { section: n }))));
const kitIn = (n, kind, i = 0) => kit.filter((o) => o.section === n && o.def.kind === kind)[i];
setupMovement(world, players, {
  thing: (p) => { let best = null, bd = 1e9; for (const o of kit) if (o.thing && o.thing.canUse(p)) { const d = Math.abs(o.thing.x - p.x); if (d < bd) { bd = d; best = o.thing; } } return best; },
  canJoin: (p, o) => Math.abs(o.y - p.safe.y) < 60,
});
MV.bottom = VH + 260;
const pads = makeTouchPads(QS.get('touch'));
const balloon = kitIn(4, 'balloon'), exitGate = kitIn(5, 'parkgate');
if (FROM > 4) balloon.give(bro); // starting after the balloon tree: he already has it

function fitScreen() { // on touch screens the park is drawn higher, so the buttons sit over the grass in front
  resizeScreen();
  game.lift = pads ? clamp(pads.height() * DPR / S - 84, 0, 300) : 0;
}
function cameraTarget() { // the middle of the two; or, while both are inside a section's view, the whole view held still
  const mid = (sis.x + bro.x) / 2, v = SECTIONS[game.section].view;
  const hold = v && VW >= Math.min(v[1], PARK.length) - v[0] && sis.x > v[0] && sis.x < v[1] && bro.x > v[0] && bro.x < v[1];
  return clamp((hold ? (v[0] + Math.min(v[1], PARK.length)) / 2 : mid) - VW / 2, 0, Math.max(0, PARK.length - VW));
}

// ---------- the puzzles: when each counts as solved (for the little celebration, the hints and the test)
const past = (x) => sis.x > x && bro.x > x;
const gateX = (n) => kitIn(n, 'parkgate').def.x + 40;
const PUZZLES = { 1: () => past(gateX(1)), 2: () => past(gateX(2)), 4: () => balloon.state.got, 5: () => exitGate.state.latched };
function solve(n) { // a happy jingle, and they cheer together
  game.solved[n] = true; game.solvedAt[n] = game.time; snd('great'); burst((sis.x + bro.x) / 2, Math.min(sis.y, bro.y) - 260, 14);
  for (const p of players) p.cheer = Math.max(p.cheer, 0.9);
  if (n === 5) highFive(); // the finale ends with a high five
  if (typeof lifeSolved === 'function') lifeSolved(n);
}
for (const n in PUZZLES) if (PUZZLES[n]()) game.solved[n] = true; // starting part-way (?section=): what lies behind is done already, without the jingle

// ---------- every frame
function update(dt) {
  const ending = game.exitT >= 0;
  game.time += dt;
  moveSiblings(dt, ending || game.done);
  for (const o of kit) if (o.update) o.update(dt);
  world.step(dt);
  for (const o of kit) if (o.after) o.after(dt);
  settleSiblings(dt);
  if (typeof lifeUpdate === 'function') lifeUpdate(dt);
  updateMoveFx(dt); updateTalk(dt);
  game.shake = Math.max(0, game.shake - dt * 2.5);
  for (const n in PUZZLES) if (!game.solved[n] && PUZZLES[n]()) solve(+n);
  // which section they are in: the furthest one both have reached
  const back = Math.min(sis.x, bro.x); let n = game.section; while (n + 1 < SECTIONS.length && back >= SECTIONS[n + 1].x[0]) n++;
  if (n !== game.section) { game.section = n; if (game.entered[n] === null) game.entered[n] = game.time; }
  camX += (cameraTarget() - camX) * Math.min(1, dt * 4);
  updateHints(dt); game.goalT = (game.goalT || 0) + dt;
  // the end: through the last gate, and both at the way out
  if (game.solved[5] && !ending && players.every((p) => !p.gone && Math.abs(p.x - PARK.exit) < 130)) { game.exitT = 0; game.finished = game.time; }
  if (ending) { game.exitT += dt; const u = Math.min(1, game.exitT / 1.6); for (const p of players) { p.x += (PARK.exit - p.x) * Math.min(1, dt * 1.5); p.alpha = 1 - u; } if (game.exitT > 1.8 && !game.done) { game.done = true; snd('fanfare'); } }
  if (game.done) { game.endT += dt; if (game.endT > 1.2 && ['KeyW', 'ArrowUp', 'Enter', 'Space'].some((k) => hit(k))) location.href = PARK.next; }
  if (typeof musicArea === 'function') musicArea('park');
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
function drawSigns(c, t) { // what the grab key would do, shown as a picture: a hand to pick up or use, two hands for the lift
  const duo = MV.duo;
  for (const p of players) {
    if (p.gone || p.carry || p.holding || duo.state === 'up' || !(p.grounded || p.held)) continue;
    const th = MV.hooks.thing(p), headY = p.y - p.h - 34;
    if (duo.state === 'on') { if (p === bro && th) drawBadge(c, p.x, headY, 'hand', p.col, t); continue; }
    const box = th ? null : nearBox(p);
    if (th || box) drawBadge(c, p.x, headY, 'hand', p.col, t);
    else if (p === bro && game.section >= 4 && canLift() && sis.idle > 0.7 && bro.idle > 0.7) drawBadge(c, p.x, headY, 'hands', p.col, t); // the lift: only from the balloon tree on, and once they have stood together for a moment
  }
}

// ---------- hints, without words. Each puzzle is a list of steps: whose turn (either can do most jobs here, so it is
// worked out from where they are), when the step is done, where the thing is, where to stand, and what to show.
// While the next step stays undone the thing first sparkles, then gets an arrow, then a faint ghost of that sibling
// stands in the right place (HINT_TIMES in settings.js). The ghost fades in and out so it is not taken for a person.
const HINTS = (() => {
  const pA = kitIn(1, 'plate', 0), pB = kitIn(1, 'plate', 1), g1 = kitIn(1, 'parkgate').def.x, pC = kitIn(2, 'plate'), g2 = kitIn(2, 'parkgate').def.x, box = kitIn(2, 'parkbox').body;
  const e1 = kitIn(5, 'plate', 0), e2 = kitIn(5, 'plate', 1), bx = balloon.def.x;
  const on = (pl) => players.find((p) => p.on === pl.ledge), other = (p) => (p === sis ? bro : sis), behind = (x) => (sis.x <= bro.x ? (sis.x < x ? sis : bro) : (bro.x < x ? bro : sis));
  const plateStep = (pl, who, done) => ({ who, icon: null, done, x: () => pl.def.x, y: () => FEET - 20, gx: () => pl.def.x });
  return [
    [],
    [ plateStep(pA, () => sis, () => on(pA) || sis.x > g1 || bro.x > g1),                                         // one stands on the plate
      { who: () => other(on(pA) || sis), icon: null, done: () => sis.x > g1 + 40 || bro.x > g1 + 40, x: () => g1, y: () => FEET - 150, gx: () => g1 + 130 }, // the other walks through
      plateStep(pB, () => (sis.x > g1 ? sis : bro), () => on(pB) || past(g1 + 40)),                               // and holds the plate on the far side
      { who: () => behind(g1), icon: null, done: () => past(g1 + 40), x: () => g1, y: () => FEET - 150, gx: () => g1 + 130 } ],
    [ plateStep(pC, () => sis, () => on(pC) || box.on === pC.ledge || sis.x > g2 || bro.x > g2),
      { who: () => other(on(pC) || sis), icon: 'hand', done: () => box.held || box.on === pC.ledge || box.x < g2, x: () => box.x, y: () => box.y - 50, gx: () => box.x - 84 }, // the other fetches the box
      { who: () => box.carrier || other(on(pC) || sis), icon: 'hand', carry: true, done: () => box.on === pC.ledge, x: () => pC.def.x, y: () => FEET - 20, gx: () => pC.def.x + 90, dir: -1 }, // and brings it back onto the plate
      { who: () => behind(g2), icon: null, done: () => past(g2 + 40), x: () => g2, y: () => FEET - 150, gx: () => g2 + 130 } ],
    [],
    [ { who: () => bro, icon: 'hands', done: () => balloon.state.got || MV.duo.state, x: () => bx, y: () => FEET - balloon.def.h, gx: () => bx + 60 },
      { who: () => bro, icon: 'hand', ride: true, done: () => balloon.state.got, x: () => bx, y: () => FEET - balloon.def.h, gx: () => bx } ],
    [ plateStep(e1, () => sis, () => on(e1) || on(e2) || exitGate.state.latched),
      plateStep(e2, () => other(on(e1) || on(e2) || sis), () => exitGate.state.latched, 0),
      { who: () => sis, icon: null, done: () => false, x: () => PARK.exit, y: () => FEET - 150, gx: () => PARK.exit - 40 } ],
  ].map((steps, n) => (n === 5 ? steps.map((s, i) => (i === 1 ? Object.assign(s, { x: () => (on(e1) ? e2 : e1).def.x, gx: () => (on(e1) ? e2 : e1).def.x }) : s)) : steps));
})();
const hint = { key: '', t: 0, step: null, fast: QS.get('hints') === 'fast' ? 10 : 1 };
function updateHints(dt) {
  const steps = HINTS[game.section] || [], i = steps.findIndex((s) => !s.done()), key = game.section + ':' + i;
  if (key !== hint.key) { hint.key = key; hint.t = 0; }
  hint.step = i < 0 || game.exitT >= 0 ? null : steps[i];
  if (hint.step) hint.t += dt * hint.fast;
}
function drawGhost(c, p, s, t) { // a faint copy of a sibling, washed in their colour, breathing in and out
  const x = s.gx(), y = FEET - (s.gy ? s.gy() : 0) - (s.ride ? MOVE.liftHeight : 0), fade = 0.42 + 0.16 * Math.sin(t * 2.4), other = p === sis ? bro : sis;
  const pose = (q, more) => Object.assign({}, q, { air: 0, rise: 0, carry: 0, hold: 0, ride: 0, toss: 0, strain: 0, crawl: 0, climb: 0, t }, more);
  const copy = (who, gx, gy, more, arm) => Object.assign(Object.create(who), { x: gx, y: gy, alpha: 0, m: 0, phase: 0, cheer: 0, giggle: 0, sqx: 1, sqy: 1, tilt: 0, scale: 1, dir: s.dir || 1, carry: null,
    ex: Object.assign({}, who.ex, { arm: arm ? 1 : 0, happy: 0, sweat: 0, blinkF: 1 }), pose: pose(who.pose, more) });
  const show = (who, gx, gy, more, arm) => { // fills the character buffer without showing it; then the buffer is washed and shown faintly
    drawChar(copy(who, gx, gy, more, arm), t);
    const b = buf.c; b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-atop'; b.globalAlpha = 0.6; b.fillStyle = who.col; b.fillRect(0, 0, buf.cv.width, buf.cv.height); b.globalAlpha = 1; b.globalCompositeOperation = 'source-over';
    c.save(); c.globalAlpha = fade; c.drawImage(buf.cv, gx - BAX, gy - BAY, BW, BH); c.restore();
  };
  if (s.ride) show(other, x - 4, FEET, { hold: 1 }, false);                 // the lift: her ghost underneath, holding him up
  show(p, x, y, s.carry ? { carry: 1 } : s.ride ? { ride: 1 } : {}, s.icon === 'hand' && !s.carry);
  if (s.carry) { c.save(); c.globalAlpha = fade; rrect(c, x - 43, y - p.standH - 82, 86, 86, 6); fs(c, '#dcb983', p.col, 4); c.restore(); } // the box on its head
  c.save(); c.globalAlpha = Math.min(1, fade * 2.2); if (s.icon) drawBadge(c, x, y - p.standH - (s.carry ? 130 : 40), s.icon, p.col, t); c.restore();
  for (let k = 0; k < 3; k++) star(c, x + Math.cos(t * 2 + k * 2.1) * 70, y - 110 + Math.sin(t * 2.6 + k * 2.1) * 90, 8 + Math.sin(t * 5 + k) * 3, t + k, fade); // it glitters: a picture, not a person
}
function drawHintMarks(c, t) {
  const s = hint.step; if (!s) return;
  const x = s.x(), y = s.y(), who = s.who(), col = who.col;
  if (hint.t >= HINT_TIMES[0]) for (let k = 0; k < 4; k++) { const a = t * 1.8 + k * TAU / 4, r = 46 + Math.sin(t * 3 + k) * 8; star(c, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7, 11 + Math.sin(t * 6 + k * 2) * 5, t * 2 + k, 0.9); }
  const ghost = hint.t >= HINT_TIMES[2], over = ghost && Math.abs(s.gx() - x) < 80 && !s.ride; // the arrow moves up out of the ghost's way
  if (hint.t >= HINT_TIMES[1]) { const ay = (over ? FEET - who.standH - 150 : y - 96) + Math.sin(t * 5) * 10; c.save(); c.translate(x, ay); c.rotate(Math.PI); drawIcon(c, 'up', 0, 0, 1.7, col); c.restore(); }
  if (ghost) drawGhost(c, who, s, t);
}
function drawGoalBubble(c, t) { // the picture bubble: what this part is about. It shows on arriving, and again whenever both stand still for a while.
  const icon = game.solved[game.section] ? null : SECTIONS[game.section].goal; if (!icon) return;
  game.goalT = game.goalKey === game.section ? game.goalT : 0; game.goalKey = game.section;
  const a = game.goalT < 5 ? Math.min(1, game.goalT * 3, (5 - game.goalT) * 2) : sis.idle > 5 && bro.idle > 5 ? Math.min(1, (Math.min(sis.idle, bro.idle) - 5) * 2) : 0; if (a <= 0) return;
  const x = clamp(sis.x, camX + 90, camX + VW - 90), y = sis.y - sis.standH - (sis.carry ? 214 : 118) + Math.sin(t * 2) * 3;
  c.save(); ell(c, x - 14, y + 62, 7, 7, '#fffbf0', a); ell(c, x - 4, y + 46, 10, 10, '#fffbf0', a); c.globalAlpha = a;
  c.beginPath(); c.ellipse(x, y, 54, 42, 0, 0, TAU); fs(c, '#fffbf0', '#8a6a3a', 3); drawIcon(c, icon, x, y, 1.9); c.restore();
}
function drawEnd(c, t, top) { // the end card, in pictures: a high five, the time on a clock, and an arrow (jump goes on)
  const a = Math.min(1, game.endT); c.fillStyle = `rgba(28,18,10,${a * 0.75})`; c.fillRect(camX - 10, 0, VW + 20, VH + top + 40);
  c.save(); c.globalAlpha = a; const w = 460, h = 330, x = camX + VW / 2 - w / 2, y = top + (VH - top) / 2 - h / 2 - 40, cx = x + w / 2; parchment(c, x, y, w, h);
  const clap = Math.pow(Math.abs(Math.sin(t * 2.6)), 6) * 10; // two hands meeting: hers with a green cuff, his with a blue one
  for (const [side, col] of [[-1, sis.col], [1, bro.col]]) { c.save(); c.translate(cx + side * (40 - clap), y + 96); c.scale(side, 1); rrect(c, -22, 22, 44, 20, 6); fs(c, col, INK, 3); drawIcon(c, 'hand', 0, 0, 2.3); c.restore(); }
  for (let k = 0; k < 5; k++) star(c, cx + Math.cos(-Math.PI / 2 + (k - 2) * 0.62) * 118, y + 112 + Math.sin(-Math.PI / 2 + (k - 2) * 0.62) * 84, 12 + Math.sin(t * 5 + k * 1.7) * 5, t + k, a * 0.95);
  const secs = Math.floor(game.finished || game.time), time = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
  c.fillStyle = INK; c.font = '700 38px Georgia, serif'; c.textBaseline = 'middle'; c.textAlign = 'left'; const tw = c.measureText(time).width, lx = cx - (52 + 14 + tw) / 2 + 26;
  c.beginPath(); circ(c, lx, y + 200, 26); fs(c, '#fffbf0', INK, 4); c.strokeStyle = INK; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(lx, y + 184); c.lineTo(lx, y + 200); c.lineTo(lx + 12, y + 207); c.stroke(); c.fillStyle = INK; c.fillText(time, lx + 40, y + 202);
  if (game.endT > 1.2) { c.globalAlpha = a * (0.6 + Math.sin(t * 4) * 0.4); drawIcon(c, 'up', cx, y + h - 52, 1.6, '#6d9b45'); } // "press jump to go on to the next level"
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
  const lines = [`fps ${game.fps.toFixed(0)}   slowest frame ${game.slow.toFixed(0)} ms   cam ${camX.toFixed(0)}   section ${game.section + 1}   solved ${Object.keys(game.solved).map((n) => +n + 1).join(' ') || '-'}   time ${game.time.toFixed(0)} s   hint ${hint.step ? hint.t.toFixed(0) + ' s' : '-'}`,
    ...players.map((p) => `${p.who.padEnd(7)} x ${p.x.toFixed(0).padStart(5)}  y ${(FEET - p.y).toFixed(0).padStart(4)} up  vx ${p.vx.toFixed(0).padStart(5)} vy ${p.vy.toFixed(0).padStart(5)}  ${p.gone ? 'gone' : p.held ? 'held' : p.grounded ? 'ground' : 'air'}${p.carry ? ' carry' : ''}  on ${p.on ? (p.on.isBody ? 'box' : p.on.isLedge ? 'ledge' : 'solid') : '-'}`),
    `duo ${MV.duo.state || '-'}   jump ${(MOVE.jumpHeight * broHeight()).toFixed(0)} units in ${MOVE.jumpTime}s   coyote ${MOVE.coyote}  buffer ${MOVE.buffer}`];
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
  if (ZOOM > 1) { // a closer look, for checking the drawing
    const k = S * ZOOM, f = QS.get('look') === 'bro' ? bro : sis, zx = f.x - VW / (2 * ZOOM), zy = clamp(f.y - 130 - VH / (2 * ZOOM), 0, VH - VH / ZOOM);
    c.setTransform(k, 0, 0, k, -zx * k, -zy * k); VIEW = [zx, zx + VW / ZOOM]; drawSky(c, t); paintStill(c);
  } else {
    c.setTransform(S, 0, 0, S, -camX * S, ((game.shake > 0 ? Math.sin(t * 95) * 6 * game.shake : 0) - top) * S);
    if (top > 0) { c.fillStyle = '#5f8a40'; c.fillRect(camX - 10, VH - 2, VW + 20, top + 30); }
    drawPark(c, t);
  }
  if (typeof lifeDrawBack === 'function') lifeDrawBack(c, t);
  for (const o of kit) if (o.draw) o.draw(c, t);
  for (const b of world.bodies) if (!b.held && !b.gone) drawShadow(c, b);
  for (const o of kit) if (o.body && !o.body.held) o.body.draw(c, t);
  for (const p of players) { if (p.gone) continue; drawChar(p, t); if (p.carry) p.carry.draw(c, t); }
  for (const o of kit) if (o.drawFront) o.drawFront(c, t);
  if (typeof lifeDrawFront === 'function') lifeDrawFront(c, t);
  if (!game.done && game.exitT < 0) drawHintMarks(c, t);
  drawMoveFx(c); drawSparks(c);
  drawParkLight(c);
  if (ZOOM <= 1) { if (!game.done) { drawSigns(c, t); drawGoalBubble(c, t); } if (DEBUG) drawDebug(c, t, top); if (game.done) drawEnd(c, t, top); }
  requestAnimationFrame(frame);
}

// ---------- sliders for the feel (?tune=1): a developer's tool, so it uses words
function tunePanel() {
  const rows = [['jumpHeight', 0.8, 2.2, 0.05], ['jumpTime', 0.2, 0.6, 0.01], ['fallFaster', 1, 2.5, 0.05], ['coyote', 0, 0.3, 0.01], ['buffer', 0, 0.3, 0.01],
    ['speed.sister', 150, 450, 5], ['speed.brother', 150, 450, 5], ['accel', 800, 5000, 100], ['brake', 800, 6000, 100], ['airAccel', 400, 4000, 100], ['airBrake', 0, 3000, 20], ['liftWalk', 0.2, 1, 0.05], ['stride', 1, 2, 0.05]];
  const get = (k) => k.split('.').reduce((o, part) => o[part], MOVE), put = (k, v) => { const parts = k.split('.'), last2 = parts.pop(); parts.reduce((o, part) => o[part], MOVE)[last2] = v; };
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;right:10px;top:10px;z-index:8;background:#1c120ae6;color:#fff6dc;font:12px/1.5 monospace;padding:10px 12px;border-radius:10px;max-height:94vh;overflow:auto';
  box.innerHTML = '<b>MOVE</b> (park: worlds/park/settings.js)<br>' + rows.map(([k, lo, hi, st]) => `<label style="display:grid;grid-template-columns:104px 150px 44px;align-items:center;gap:6px">${k}<input type="range" data-k="${k}" min="${lo}" max="${hi}" step="${st}" value="${get(k)}"><span>${get(k)}</span></label>`).join('') + '<button style="margin-top:6px">copy the numbers</button> <span id="tuned"></span>';
  box.addEventListener('input', (e) => { const k = e.target.dataset.k; if (!k) return; put(k, +e.target.value); e.target.nextElementSibling.textContent = e.target.value; });
  box.addEventListener('keydown', (e) => e.stopPropagation());
  box.querySelector('button').addEventListener('click', () => { const text = rows.map(([k]) => k + ': ' + get(k)).join(', '); if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {}); box.querySelector('#tuned').textContent = 'copied'; console.log(text); });
  document.body.appendChild(box);
}

addEventListener('resize', fitScreen); fitScreen();
if (TUNE) tunePanel();
camX = cameraTarget();
requestAnimationFrame((tm) => { last = tm; frame(tm); });

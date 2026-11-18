'use strict';
// Chapter Two, "Across the City": the siblings follow the treasure map across town to the Old Bridge and Forest Park.
// One long street, scrolling sideways, and a ride on the metro. All the numbers are in worlds/city/settings.js.
// The shared play code (input, drawing the characters, speech bubbles, hints) is in shared/stage.js.
// Test stages: ?stage=pieces | crossing | alley | yard | market | canal | avenue | metro | platform | ride | bus | bridge | end jumps ahead.
const FEET = CITY.feet, BASE = CITY.facadeBase, HOR = CITY.horizon, KERB = CITY.kerb;
const A = ALLEY, F = FERRY;
let camX = 0, last = performance.now();
const INK = '#3a2618';
function shade(hex, k) { const n = parseInt(hex.slice(1), 16), f = (v) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join(''); }

// ---------- state
const game = {
  time: 0, chapter: SKIP ? 0 : 4.6, objective: '', objT: 0, goal: -1, queue: [], bubble: null, sparks: [], said: new Set(),
  done: false, endT: 0, exitT: -1, panel: null, fade: null, honks: [],
  cross: { phase: 'cars', t: 0 },
  shutter: 0, gateOpen: false, yardReveal: 0,
  ferry: { x: F.canal[0] + F.deck, side: 'near', moving: 0 },
  bus: { state: 'away', t: 2, x: 0, i: 0, riders: [], ride: false, arrived: false },
  bridge: { power: false, angle: 1.22, lowering: false, down: false },
  routes: [],
  pieces: { gust: false, got: [false, false, false, false], fly: [] },
  pup: { x: PUPPY.start, dir: -1, mode: 'sniff', t: 0, dash: 0, caught: false, seen: false },
  metro: { station: METRO.start, train: null, gapT: 3, cyc: 0, ride: null, visited: new Set([METRO.start]) },
  nag: 0,
};
{ // shuffle which bus number goes where (the first place is the Old Bridge)
  const idx = [0, 1, 2, 3]; for (let i = 3; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  game.routes = BUS.lines.map((n, i) => ({ line: n, place: idx[i] }));
  game.busOrder = [...game.routes.keys()].sort(() => Math.random() - 0.5);
  game.mapSeed = Math.floor(Math.random() * 1e6);
}
const players = [makePlayer('sister', 380, FEET, 1), makePlayer('brother', 540, FEET, -1)];
const [sis, bro] = players;
for (const p of players) Object.assign(p, { plane: 'street', stun: 0, safeX: p.x, holding: null, crawl: 0 });
const inMetro = () => sis.plane === 'metro' || sis.plane === 'train';
const piecesGot = () => game.pieces.got.filter(Boolean).length;
const other = (p) => (p === sis ? bro : sis);
const both = (fn) => fn(sis) && fn(bro);
const either = (fn) => fn(sis) || fn(bro);
const lerp = (a, b, u) => a + (b - a) * u;
function mixCol(a, b, u) { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const ch = (s) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, u)); return `rgb(${ch(16)},${ch(8)},${ch(0)})`; }

// ---------- traffic: cars drive out of the side streets toward the camera and across the pavement
const CAR_V = 0.34, STOP_Z = 0.74, GAP_Z = 0.17;
const inWin = (t, a, b) => (a <= b ? t >= a && t < b : t >= a || t < b);
function avenuePhase(i) { // 'go' | 'amber' | 'red' for the cars, and the walk signal
  const tc = game.time % AVENUE.cycle, [a, b] = AVENUE.red[i];
  const car = inWin(tc, a, b) ? 'red' : inWin(tc, (a - AVENUE.amber + AVENUE.cycle) % AVENUE.cycle, a) ? 'amber' : 'go';
  const walkSig = inWin(tc, a + 0.4, b - 1.6) ? 'walk' : inWin(tc, b - 1.6, b) ? 'flash' : 'stop';
  return { car, walk: walkSig };
}
function crossingPhase() { const ph = game.cross.phase; return { car: ph === 'cars' ? 'go' : ph === 'wait' ? (game.cross.t > CROSSING.wait - 1.4 ? 'amber' : 'go') : 'red', walk: ph === 'walk' ? 'walk' : ph === 'flash' ? 'flash' : 'stop' }; }
const ROADS = [
  { x0: CROSSING.road[0], x1: CROSSING.road[1], phase: crossingPhase, gap: CROSSING.gap, cars: [], spawn: 1 },
  { x0: AVENUE.roads[0][0], x1: AVENUE.roads[0][1], phase: () => avenuePhase(0), gap: AVENUE.gap, cars: [], spawn: 0.5 },
  { x0: AVENUE.roads[1][0], x1: AVENUE.roads[1][1], phase: () => avenuePhase(1), gap: AVENUE.gap, cars: [], spawn: 1.5 },
];
const inRoad = (x) => ROADS.some((r) => x > r.x0 + 4 && x < r.x1 - 4);
function updateRoad(r, dt) {
  const ph = r.phase(), stop = ph.car !== 'go';
  r.cars.sort((a, b) => b.z - a.z);
  r.cars.forEach((car, i) => {
    let lim = i ? r.cars[i - 1].z - GAP_Z : 9;
    if (stop && car.z <= STOP_Z + 0.001) lim = Math.min(lim, STOP_Z);
    car.z = Math.min(car.z + CAR_V * dt, Math.max(car.z, lim));
    // a car crossing the pavement bumps anyone in the road back to the kerb they came from
    if (car.z > 0.93 && car.z < 1.07) for (const p of players) {
      if (p.plane !== 'street' || p.stun > 0 || p.x < r.x0 + 26 || p.x > r.x1 - 26) continue;
      p.stun = 0.9; p.x = p.safeX < r.x0 ? r.x0 - 34 : r.x1 + 34; p.dir = p.safeX < r.x0 ? -1 : 1;
      game.honks.push({ x: (r.x0 + r.x1) / 2, y: carY(car.z) - 240, t: 0 });
      sayNow(other(p), pick(['Careful!!', 'Watch out!', 'Look before you cross!']), 2);
      say(p, pick(['Whoa! That was close...', 'Eek! I should wait for the green man.', 'Okay, okay... wait for the signal.']));
    }
  });
  r.cars = r.cars.filter((car) => car.z < 1.5);
  r.spawn -= dt;
  const back = r.cars.reduce((m, car) => Math.min(m, car.z), 9);
  if (r.spawn <= 0 && back > 0.22 && r.cars.length < 6) { r.cars.push({ z: 0, art: Math.floor(Math.random() * SP.car.length) }); r.spawn = rr(r.gap[0], r.gap[1]); }
}
const carScale = (z) => (z <= 1 ? 0.2 + 0.8 * Math.pow(z, 1.6) : 1 + (z - 1) * 1.5);
const carY = (z) => (z <= 1 ? HOR + (FEET + 6 - HOR) * (carScale(z) - 0.2) / 0.8 : FEET + 6 + (z - 1) * 520);

// ---------- where each sibling can walk
function limits(p) {
  if (p.plane === 'yard') {
    let lo = A.inside[0], hi = A.inside[1];
    if (!game.gateOpen) { if (p.x <= A.gate) hi = A.gate - 14; else lo = A.gate + 14; }
    return [lo, hi];
  }
  if (p.plane === 'metro') return METRO.platform;
  let lo = CITY.walk[0], hi = CITY.walk[1];
  const block = (a, b) => { if (p.x <= a) hi = Math.min(hi, a - 6); else if (p.x >= b) lo = Math.max(lo, b + 6); };
  block(A.barrier[0], A.barrier[1]);
  block(METRO.closed[0], METRO.closed[1]);
  if (!game.pup.caught && p.x <= PUPPY.area[1] + 40) hi = Math.min(hi, PUPPY.area[1] + 40); // not without the last map piece
  if (!game.bridge.down) block(BRIDGE.river[0], BRIDGE.river[1]);
  const [c0, c1] = F.canal, fe = game.ferry, dl = fe.x - F.deck + 14, dr = fe.x + F.deck - 14, docked = !fe.moving;
  if (p.x <= c0) hi = Math.min(hi, docked && fe.side === 'near' ? dr : c0 - 6);
  else if (p.x >= c1) lo = Math.max(lo, docked && fe.side === 'far' ? dl : c1 + 6);
  else { if (!(docked && fe.side === 'near')) lo = Math.max(lo, dl); if (!(docked && fe.side === 'far')) hi = Math.min(hi, dr); }
  lo = Math.max(lo, camX + 40); hi = Math.min(hi, camX + VW - 40);
  return [lo, Math.max(lo, hi)];
}
const onFerry = (p) => p.plane === 'street' && p.x > F.canal[0] && p.x < F.canal[1];

// ---------- the alley
function enterYard(p, x) { p.plane = 'yard'; p.x = x; p.y = A.floor; p.scale = A.depth; game.panel = null; }
function leaveYard(p, x) { p.plane = 'street'; p.x = x; p.y = FEET; p.scale = 1; }
function crawlGate(p) {
  if (p === sis) { sayNow(sis, "The gap under the gate is far too small for me."); return; }
  p.crawl = 0.6; p.x = p.x < A.gate ? A.gate + 40 : A.gate - 40;
  if (!game.saidGate) { game.saidGate = true; sayNow(bro, 'I squeezed under! There is a button on this side.'); }
}

// ---------- the ferry
function ferryButton(p, side) {
  const fe = game.ferry;
  if (fe.moving) { sayNow(p, 'The ferry is already moving.'); return; }
  if (either(onFerry) && fe.side === side) {
    fe.moving = side === 'near' ? 1 : -1; burst(fe.x, FEET - 80, 5);
    const rider = players.find(onFerry);
    if (!game.saidFerry) { game.saidFerry = true; say(rider, 'Here I go! Send it back for you when I get there!'); }
  } else if (fe.side === side) { fe.moving = side === 'near' ? 1 : -1; sayNow(p, 'Off it goes... empty.'); }
  else { fe.moving = side === 'near' ? -1 : 1; sayNow(p, 'Come back, ferry!'); }
}

// ---------- the torn map
function updatePieces(dt) {
  const pc = game.pieces;
  if (!pc.gust && game.chapter <= 0 && either((p) => p.plane === 'street' && p.x > PIECES.gust)) {
    pc.gust = true; game.panel = null;
    const from = [sis.x + 20, FEET - 170];
    PIECES.spots.forEach((sp, i) => pc.fly.push({ x0: from[0], y0: from[1], x1: sp.x, y1: sp.y, u: 0, dur: 1.6 + i * 0.35 }));
    pc.fly.push({ x0: from[0], y0: from[1], x1: sis.x + 2200, y1: 300, u: 0, dur: 2.2 }); // the fourth piece flies off towards the market
    sayNow(sis, 'Whoa! The wind!! The map...', 2.2); say(bro, "It's torn! The pieces are blowing everywhere!"); say(sis, 'Quick, find them! Three landed close by.'); say(bro, 'And one blew off towards the market...');
  }
  for (const f of pc.fly) f.u = Math.min(1, f.u + dt / f.dur);
}
const landed = (i) => game.pieces.gust && game.pieces.fly[i] && game.pieces.fly[i].u >= 1;
function takePiece(i, p) {
  game.pieces.got[i] = true; burst(PIECES.spots[i] ? PIECES.spots[i].x : p.x, FEET - 120, 8); p.cheer = 0.6;
  const n = piecesGot();
  sayNow(p, n >= 4 ? 'That is the last one! The map is whole again!' : n === 3 ? 'Got it! Three pieces. The last one went to the market.' : `Got one! That makes ${n}.`);
}
function pieceThing(i) {
  const sp = PIECES.spots[i];
  return { plane: 'street', x: sp.x, r: 70, key: sp.key, label: () => (landed(i) && !game.pieces.got[i] ? sp.label : null),
    act: (p) => (sp.who !== 'both' && (sp.who === 'sis') !== (p === sis) ? sayNow(p, sp.no) : takePiece(i, p)) };
}
function drawPiece(c, x, y, rot, glint, t) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.beginPath(); c.moveTo(-16, -12); c.lineTo(-4, -15); c.lineTo(9, -11); c.lineTo(17, -14); c.lineTo(15, 2); c.lineTo(18, 13); c.lineTo(2, 15); c.lineTo(-12, 12); c.lineTo(-17, 1); c.closePath();
  fs(c, '#f1dfb0', '#8a6a3a', 1.6); c.strokeStyle = '#a0522d'; c.setLineDash([3, 3]); c.lineWidth = 1.4; c.beginPath(); c.moveTo(-10, 6); c.quadraticCurveTo(0, -6, 11, 2); c.stroke(); c.setLineDash([]);
  c.restore();
  if (glint) { star(c, x + 10, y - 12, 11 + Math.sin(t * 5) * 3, t, 0.8); soft(c, x, y, 30, 30, '#fff3b8', 0.35 + Math.sin(t * 4) * 0.15); }
}
function livePieces(c, t) {
  const pc = game.pieces; if (!pc.gust) return;
  pc.fly.forEach((f, i) => {
    if (pc.got[i] || (i === 3 && f.u >= 1)) return;
    if (!inView(Math.min(f.x0, f.x1) - 100, Math.max(f.x0, f.x1) + 100)) return;
    const u = f.u, x = lerp(f.x0, f.x1, u), y = lerp(f.y0, f.y1, u) - Math.sin(u * Math.PI) * 260;
    drawPiece(c, x, y, u < 1 ? u * 9 + i : 0.3 * (i - 1), u >= 1, t);
  });
}

// ---------- the market puppy, who has the fourth piece
function updatePup(dt) {
  const d = game.pup; d.t += dt; if (d.caught) return;
  const st = players.filter((p) => p.plane === 'street');
  if (!st.some((p) => p.x > PUPPY.area[0] - 450 && p.x < PUPPY.area[1] + 300)) return;
  if (!d.seen) { d.seen = true; sayNow(bro, 'A puppy! ...hey! It has our map piece!'); say(sis, 'It thinks we are playing. Let\'s try to catch it.'); }
  const L = st.filter((p) => p.x <= d.x).reduce((m, p) => Math.min(m, d.x - p.x), 1e9);
  const Rt = st.filter((p) => p.x > d.x).reduce((m, p) => Math.min(m, p.x - d.x), 1e9);
  if (L < PUPPY.trap && Rt < PUPPY.trap) { if (d.mode !== 'trapped') { d.mode = 'trapped'; if (!d.saidTrap) { d.saidTrap = true; sayNow(sis, 'Got you! Nowhere to run now.'); } } return; }
  if (d.mode === 'trapped') d.mode = 'sniff';
  const [a0, a1] = PUPPY.area;
  if (d.dash > 0) { d.dash -= dt; d.x = Math.max(a0, Math.min(a1, d.x + d.dir * PUPPY.speed * 1.25 * dt)); return; }
  let flee = 0;
  if (L < PUPPY.scare || Rt < PUPPY.scare) flee = L < Rt ? 1 : -1;
  else if (d.mode === 'run' && Math.min(L, Rt) < PUPPY.calm) flee = d.dir;
  if (flee) {
    d.mode = 'run'; d.dir = flee;
    const nx = d.x + flee * PUPPY.speed * dt;
    if (nx < a0 || nx > a1) { // cornered by one sibling: it darts straight past them
      d.dir = -flee; d.dash = 1.4; d.x = Math.max(a0, Math.min(a1, nx));
      d.dashes = (d.dashes || 0) + 1;
      if (d.dashes === 1) { sayNow(bro, 'It slipped right past!'); say(sis, 'We need to come at it from both sides at once.'); }
      else if (d.dashes === 3) { sayNow(sis, 'One of us waits on the other side, and the other one chases it over!'); }
    } else d.x = nx;
  } else { d.mode = 'sniff'; d.x = Math.max(a0, Math.min(a1, d.x + Math.sin(d.t * 0.8) * 14 * dt)); }
}
function petPup(p) {
  const d = game.pup; d.caught = true; d.mode = 'happy'; game.pieces.got[3] = true; burst(d.x, FEET - 60, 10); p.cheer = 0.7;
  sayNow(p, 'Good puppy! Can we have our map piece back?'); say(other(p), 'It dropped it! The map is whole again!'); say(bro, 'Can we keep him?'); say(sis, 'No! ...but he is very cute.');
}
function drawPup(c, t) {
  const d = game.pup; if (!inView(d.x - 120, d.x + 120)) return;
  const run = d.mode === 'run' || d.dash > 0, sit = d.mode === 'trapped' || d.mode === 'happy', ph = t * (run ? 18 : 5);
  const bob = run ? Math.abs(Math.sin(ph)) * 5 : 0, wag = Math.sin(t * (sit ? 16 : 9)) * (sit ? 0.6 : 0.3);
  c.save(); c.translate(d.x, FEET + 8 - bob); c.scale(d.dir * 1.45, 1.45); c.lineCap = 'round'; c.lineJoin = 'round';
  soft(c, 0, 2 + bob, 40, 7, '#2a1a0e', 0.35);
  const fur = '#c98a4a', dark = '#7a4a24', cream = '#f6e6c8';
  // legs
  c.strokeStyle = dark; c.lineWidth = 6;
  for (const [lx, o] of [[-18, 0], [-10, Math.PI], [14, Math.PI * 0.5], [22, Math.PI * 1.5]]) {
    c.beginPath(); if (sit && lx < 0) { c.moveTo(lx, -14); c.lineTo(lx + 10, -2); } else { const sw = run ? Math.sin(ph + o) * 8 : 0; c.moveTo(lx, -16); c.lineTo(lx + sw, -1); } c.stroke();
  }
  // tail
  c.save(); c.translate(-26, sit ? -16 : -26); c.rotate(-0.9 + wag); c.strokeStyle = fur; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-6, -10, -2, -20); c.stroke(); c.restore();
  // body and head
  c.beginPath(); c.ellipse(0, sit ? -22 : -26, 30, 14, sit ? -0.35 : 0, 0, TAU); fs(c, fur, dark, 2);
  c.beginPath(); c.ellipse(10, sit ? -18 : -22, 12, 8, 0, 0, TAU); c.fillStyle = cream; c.fill();
  const hx = 28, hy = sit ? -46 : -40;
  c.beginPath(); circ(c, hx, hy, 14); fs(c, fur, dark, 2);
  c.beginPath(); c.ellipse(hx + 13, hy + 5, 9, 7, 0, 0, TAU); fs(c, cream, dark, 1.5); ell(c, hx + 21, hy + 2, 3.5, 3, '#2a1a10');
  ell(c, hx + 5, hy - 3, 2.6, 2.6, '#2a1a10'); ell(c, hx + 6, hy - 4, 0.9, 0.9, '#fff');
  c.save(); c.translate(hx - 7, hy - 9); c.rotate(0.5 + (run ? Math.sin(ph) * 0.3 : 0)); c.beginPath(); c.ellipse(0, 8, 6, 11, 0, 0, TAU); fs(c, dark, '#4a2a14', 1.4); c.restore();
  if (sit) { c.beginPath(); c.ellipse(hx + 16, hy + 12, 3, 5, 0, 0, TAU); c.fillStyle = '#e8728a'; c.fill(); }
  if (!d.caught) { c.save(); c.translate(hx + 20, hy + 9); c.rotate(0.4); c.beginPath(); c.moveTo(-6, -8); c.lineTo(10, -10); c.lineTo(12, 8); c.lineTo(-4, 9); c.closePath(); fs(c, '#f1dfb0', '#8a6a3a', 1.4); c.restore(); }
  c.restore();
}

// ---------- the metro
const TRAIN_STOP = 960; // where the middle of the train stops on the platform
const lineArr = (line) => METRO.lines[line];
const terminus = (line, dir) => { const a = lineArr(line); return dir > 0 ? a[a.length - 1] : a[0]; };
const nextStation = (line, dir, st) => { const a = lineArr(line), i = a.indexOf(st) + dir; return i >= 0 && i < a.length ? a[i] : null; };
function serving(st) { const out = []; for (const line in METRO.lines) for (const dir of [1, -1]) if (lineArr(line).includes(st) && nextStation(line, dir, st)) out.push({ line, dir }); return out; }
const DOORS = [-670, -230, 230, 670]; // train doors, measured from the middle of the train
function goDownMetro(p) {
  const o = other(p);
  if (Math.abs(o.x - p.x) > 260 || o.plane !== 'street') { sayNow(p, 'Come on, we go down together!'); return; }
  for (const [i, q] of players.entries()) { q.plane = 'metro'; q.x = METRO.stairs + 140 + i * 80; q.y = FEET; q.stun = 0; }
  game.metro.station = METRO.start; game.metro.gapT = 3; game.panel = null; camX = 0;
  if (!game.saidMetro) { game.saidMetro = true; sayNow(bro, 'The metro! Which train do we take?'); say(sis, 'Let\'s look at the map on the wall.'); }
}
function goUpMetro(p) {
  const m = game.metro;
  if (m.station !== METRO.goal) { sayNow(p, `This is ${m.station}. We want ${METRO.goal}!`); return; }
  for (const [i, q] of players.entries()) { q.plane = 'street'; q.x = METRO.exit + 60 + i * 80; q.y = FEET; q.safeX = q.x; }
  m.train = null; camX = Math.max(0, METRO.exit - VW / 2 + 100);
  sayNow(sis, 'Fresh air! And this is Old Town.');
}
function boardTrain(p) {
  const tr = game.metro.train; if (!tr || tr.state !== 'open' || tr.riders.includes(p)) return;
  tr.riders.push(p); p.plane = 'train'; game.panel = null;
  if (tr.riders.length === 1) sayNow(other(p), 'Wait for me!');
  else { const m = game.metro; m.ride = { line: tr.line, dir: tr.dir, at: m.station, from: m.station, state: 'moving', t: 0 }; m.train = null; m.gapT = METRO.gap; say(sis, `${tr.line} line to ${terminus(tr.line, tr.dir)}. Hold on!`); }
}
function leaveTrain() {
  const m = game.metro, r = m.ride; if (!r) return;
  m.station = r.at; m.visited.add(r.at); m.ride = null;
  for (const [i, q] of players.entries()) { q.plane = 'metro'; q.x = TRAIN_STOP - 230 + i * 70; q.y = FEET; }
  m.train = { line: r.line, dir: r.dir, state: 'out', t: 0, x: TRAIN_STOP, riders: [] }; m.gapT = METRO.gap;
  if (r.at === METRO.goal) { sayNow(bro, 'Old Town! This is it!'); say(sis, 'Up the stairs, then.'); }
  else if (serving(r.at).some((o) => o.line !== r.line)) { sayNow(sis, `${r.at}. We can change trains here.`); }
  else sayNow(bro, pick([`${r.at}? Is this right?`, `Hmm, ${r.at}... let's check the map.`, `${r.at}. I don't think this is our stop.`]));
}
function updateMetro(dt) {
  const m = game.metro;
  if (m.ride) {
    const r = m.ride; r.t += dt;
    if (r.state === 'moving' && r.t > METRO.between) { r.at = nextStation(r.line, r.dir, r.at); r.state = 'stopped'; r.t = 0; }
    else if (r.state === 'stopped') {
      const end = !nextStation(r.line, r.dir, r.at);
      if (end && r.t > 2.2) { leaveTrain(); sayNow(sis, 'End of the line, everybody off.'); }
      else if (!end && r.t > METRO.stop) { r.state = 'moving'; r.t = 0; }
    }
    return;
  }
  if (!inMetro()) return;
  if (!m.train) { m.gapT -= dt; if (m.gapT <= 0) { const opts = serving(m.station), o = opts[m.cyc++ % opts.length]; m.train = { line: o.line, dir: o.dir, state: 'in', t: 0, x: -2400, riders: [] }; } return; }
  const tr = m.train; tr.t += dt;
  if (tr.state === 'in') { const u = Math.min(1, tr.t / 3); tr.x = lerp(-2400, TRAIN_STOP, 1 - Math.pow(1 - u, 3)); if (u >= 1) { tr.state = 'doors'; tr.t = 0; } }
  else if (tr.state === 'doors') { if (tr.t > METRO.board) { tr.state = 'open'; tr.t = 0; } }
  else if (tr.state === 'open') { if (tr.t > METRO.wait) { tr.state = 'out'; tr.t = 0; if (tr.riders.length === 1) { const q = tr.riders.pop(); q.plane = 'metro'; q.x = TRAIN_STOP - 230; sayNow(q, "I'm not going without you!"); } } }
  else if (tr.state === 'out') { tr.x += (80 + tr.t * 600) * dt; if (tr.x > 3000) { m.train = null; m.gapT = METRO.gap; } }
}
const doorThing = (dx) => ({ plane: 'metro', x: TRAIN_STOP + dx, r: 95, key: 'up', label: () => { const tr = game.metro.train; return tr && tr.state === 'open' ? `Get on: ${tr.line} line to ${terminus(tr.line, tr.dir)}` : null; }, act: boardTrain });

// ---------- the bus
const BUS_DOOR = 342; // the bus door, measured from the middle of the bus art
const busNow = () => game.routes[game.busOrder[game.bus.i % game.busOrder.length]];
function boardBus(p) {
  const b = game.bus; if (b.state !== 'waiting' || b.riders.includes(p)) return;
  b.riders.push(p); p.plane = 'bus'; p.holding = null;
  if (b.riders.length === 1) sayNow(other(p), 'Wait for me!');
  if (b.riders.length === 2) { b.state = 'leaving'; b.t = 0; b.ride = busNow().place === 0; game.panel = null; }
}
function unboard(p, x) { p.plane = 'street'; p.x = x; p.y = FEET; p.alpha = 1; }

// ---------- the bridge
function powerSwitch(p) {
  if (game.bridge.power) { sayNow(p, 'The power is already on.'); return; }
  if (p === bro) { sayNow(bro, "The switch is way up there. I can't reach it!"); return; }
  game.bridge.power = true; burst(BRIDGE.power, FEET - 380, 8); p.cheer = 0.6;
  sayNow(sis, 'Power is on! The little hut has lit up.'); say(bro, 'Then the controls must be in that hut!');
}
function hutDoor(p) {
  if (p === sis) { sayNow(sis, "This door is tiny. I'd never fit through."); return; }
  p.plane = 'hut'; p.x = BRIDGE.hut - 48;
  sayNow(bro, game.bridge.power ? 'Levers and buttons! Which one lowers the bridge...' : "It's dark in here. Nothing works without power.");
}
function hutKeys(p) {
  if (hit(p.keys.down)) { p.plane = 'street'; p.x = BRIDGE.hut - 48; return; }
  if (!hit(p.keys.up)) return;
  const br = game.bridge;
  if (br.down || br.lowering) return;
  if (!br.power) { sayNow(bro, 'Nothing happens. No power!'); say(sis, 'Maybe there is a switch somewhere?'); return; }
  br.lowering = true; sayNow(bro, 'This big red button... here goes!'); say(sis, "It's coming down!");
}

// ---------- things the siblings can use. hold: true means keep the button pressed.
const flavour = (s, b) => (p) => sayNow(p, p === sis ? s : b);
const THINGS = [
  ...PIECES.spots.map((sp, i) => pieceThing(i)),
  { plane: 'street', x: CROSSING.button, r: 55, key: 'up', label: () => (game.cross.phase === 'cars' ? 'Press the crossing button' : null), act: (p) => { if (game.pieces.gust && piecesGot() < 3) { sayNow(p, 'Wait! We still need the map pieces on this street.'); return; } game.cross.phase = 'wait'; game.cross.t = 0; burst(CROSSING.button, FEET - 200, 4); sayNow(p, 'Now we wait for the green man.'); } },
  { plane: 'street', x: A.barrier[0] + 70, r: 90, key: 'up', label: () => 'Read the sign', act: flavour('"Pavement closed. Use Baker\'s Alley." That must be the warehouse.', 'Roadworks! I love diggers.') },
  { plane: 'street', x: A.buttonOut, r: 48, key: 'up', hold: 'out', label: () => 'Hold to open the shutter' },
  { plane: 'street', x: A.shutter, r: 80, key: 'up', label: () => (game.shutter > 0.7 ? 'Go into the yard' : null), act: (p) => enterYard(p, A.shutter + 30) },
  { plane: 'street', x: A.out - 20, r: 55, key: 'up', label: () => 'Go into the alley', act: (p) => enterYard(p, A.arch) },
  { plane: 'yard', x: A.shutter, r: 70, key: 'up', label: () => (game.shutter > 0.7 ? 'Go out to the street' : 'The shutter is down'), act: (p) => (game.shutter > 0.7 ? leaveYard(p, A.shutter - 40) : sayNow(p, 'It is shut. Somebody has to hold a button.')) },
  { plane: 'yard', x: A.buttonIn, r: 45, key: 'up', hold: 'in', label: () => 'Hold to open the shutter' },
  { plane: 'yard', x: A.gate, r: 55, key: 'down', label: (p) => (game.gateOpen ? null : p === bro ? 'Crawl under the gate' : 'Squeeze under the gate'), act: crawlGate },
  { plane: 'yard', x: A.gateButton, r: 45, key: 'up', label: (p) => (!game.gateOpen && p.x > A.gate ? 'Open the gate' : null), act: (p) => { game.gateOpen = true; burst(A.gate, A.floor - 150, 8); sayNow(p, 'Click! The gate is open!'); say(other(p), 'Nice one!'); } },
  { plane: 'yard', x: A.arch, r: 60, key: 'up', label: () => 'Go out through the arch', act: (p) => leaveYard(p, A.out) },
  { plane: 'street', x: 4150, r: 90, key: 'up', label: () => 'Look at the fruit', act: flavour('Apples, oranges, plums... I am getting hungry.', 'Those plums look amazing!') },
  { plane: 'street', x: 4470, r: 90, key: 'up', label: () => 'Smell the flowers', act: flavour('Mmm, roses.', 'Achoo!') },
  { plane: 'street', x: 4790, r: 90, key: 'up', label: () => 'Look at the fish', act: flavour('Fresh from the harbour.', 'That one is looking at me!') },
  { plane: 'street', x: F.buttonNear, r: 50, key: 'up', label: () => ferryLabel('near'), act: (p) => ferryButton(p, 'near') },
  { plane: 'street', x: F.buttonFar, r: 50, key: 'up', label: () => ferryLabel('far'), act: (p) => ferryButton(p, 'far') },
  { plane: 'street', x: AVENUE.roads[0][0] - 55, r: 50, key: 'up', label: () => 'Press the crossing button', act: (p) => sayNow(p, p === sis ? 'Out of order. We will have to watch the lights.' : 'It says OUT OF ORDER!') },
  { plane: 'street', get x() { return game.pup.x; }, r: 110, key: 'up', label: () => (game.pup.mode === 'trapped' && !game.pup.caught ? 'Pet the puppy' : null), act: petPup },
  { plane: 'street', x: METRO.entrance, r: 90, key: 'down', label: () => 'Go down to the metro', act: goDownMetro },
  { plane: 'street', x: METRO.closed[0] + 40, r: 90, key: 'up', label: () => 'Read the sign', act: flavour('"Street closed. Please use the Metro." The stairs are just back there.', 'Closed! We have to go underground!') },
  { plane: 'metro', x: METRO.stairs, r: 100, key: 'up', label: () => (game.metro.station === METRO.goal ? 'Go up to the street' : 'Way out'), act: goUpMetro },
  { plane: 'metro', x: 560, r: 120, key: 'up', label: () => 'Read the metro map', act: (p) => openPanel('metro', p) },
  ...DOORS.map(doorThing),
  { plane: 'street', x: BUS.board, r: 70, key: 'up', label: () => 'Read the route map', act: (p) => openPanel('routes', p) },
  { plane: 'street', x: BUS.stop, r: 150, key: 'up', label: () => (game.bus.state === 'waiting' ? 'Get on bus ' + busNow().line : null), act: boardBus },
  { plane: 'street', x: BRIDGE.power, r: 55, key: 'up', label: () => (game.bridge.power ? null : 'Switch on the power'), act: powerSwitch },
  { plane: 'street', x: BRIDGE.hut - 48, r: 48, key: 'down', label: (p) => (game.bridge.down ? null : p === bro ? 'Crawl into the hut' : 'Look in the hut'), act: hutDoor },
];
function ferryLabel(side) { const fe = game.ferry; if (fe.moving) return null; return fe.side === side ? (either(onFerry) ? 'Send the ferry across' : 'Send the ferry back') : 'Call the ferry'; }
function nearThing(p, key) {
  let best = null, bd = 1e9;
  for (const th of THINGS) { if (th.plane !== p.plane || (key && th.key !== key)) continue; const d = Math.abs(p.x - th.x); if (d < th.r && d < bd && th.label(p)) { best = th; bd = d; } }
  return best;
}
function openPanel(kind, p) { if (game.panel && game.panel.kind === kind) { game.panel = null; return; } game.panel = { kind, user: p, x: p.x, t: 0 }; if (kind === 'routes' && !game.saidRoutes) { game.saidRoutes = true; say(other(p), 'Follow the line from the Old Bridge back to its bus number!'); } if (kind === 'metro' && !game.saidMap) { game.saidMap = true; say(other(p), 'We are at Grand Avenue. Old Town is on the green line...'); } }

// ---------- goals, in order
const pastAll = (x) => both((p) => p.plane === 'street' && p.x > x);
const GOALS = [
  [() => true, 'Cross the city to the Old Bridge. Head along the street.'],
  [() => game.pieces.gust, 'The wind tore the map! Find the three pieces on Maple Street.'],
  [() => piecesGot() >= 3, 'Three pieces found! Now press the crossing button and cross on the green man.'],
  [() => pastAll(CROSSING.road[1]), 'Well crossed! Keep following the street.'],
  [() => either((p) => p.x > 2800), 'The pavement is closed. Get into Baker\'s Alley through the shutter.'],
  [() => either((p) => p.plane === 'yard'), 'Get both of you into the yard, then find a way past the gate.'],
  [() => game.gateOpen, 'Out through the archway, back to the street.'],
  [() => pastAll(A.barrier[1]), 'The last map piece blew into the market. Find it!'],
  [() => game.pup.seen, 'Catch the puppy: come at it from both sides at once.'],
  [() => game.pup.caught, 'The map is whole again! On to the canal.'],
  [() => game.pup.caught && either((p) => p.x > F.canal[0] - 200), 'Cross the canal. The buttons send the ferry to the other side.'],
  [() => pastAll(F.canal[1]), 'Cross Grand Avenue. Wait for the green man at each road.'],
  [() => pastAll(AVENUE.roads[1][1]), 'The street ahead is closed. Take the metro: go down the stairs.'],
  [() => inMetro(), 'Take the metro to Old Town. The map on the wall shows the way.'],
  [() => either((p) => p.plane === 'street' && p.x > METRO.closed[1]), 'Old Town! Catch the bus to the Old Bridge. Check the route map first!'],
  [() => game.bus.arrived, 'Lower the Old Bridge.'],
  [() => game.bridge.power && !game.bridge.lowering && !game.bridge.down, 'The power is on. Brother: find the controls in the little hut.'],
  [() => game.bridge.lowering || game.bridge.down, 'Cross the bridge into Forest Park, together.'],
];
function updateGoal() { // jump to the furthest goal that has been reached
  for (let i = GOALS.length - 1; i > game.goal; i--) if (GOALS[i][0]()) { game.goal = i; objective(GOALS[i][1]); break; }
}

// ---------- update
function update(dt) {
  game.time += dt;
  if (game.chapter > 0) { game.chapter -= dt; if (game.chapter <= 0) intro(); }
  // crossing lights
  const cr = game.cross; cr.t += dt;
  if (cr.phase === 'wait' && cr.t > CROSSING.wait) { cr.phase = 'walk'; cr.t = 0; }
  else if (cr.phase === 'walk' && cr.t > CROSSING.walk) { cr.phase = 'flash'; cr.t = 0; }
  else if (cr.phase === 'flash' && cr.t > CROSSING.flash) { cr.phase = 'cars'; cr.t = 0; }
  for (const r of ROADS) updateRoad(r, dt);
  // the shutter rolls up while somebody holds a button
  const held = players.some((p) => p.holding);
  game.shutter = Math.max(0, Math.min(1, game.shutter + (held ? A.raise : -A.drop) * dt));
  game.yardReveal += ((either((p) => p.plane === 'yard') ? 1 : 0) - game.yardReveal) * Math.min(1, dt * 4);
  // the ferry
  const fe = game.ferry;
  if (fe.moving) {
    const target = fe.moving > 0 ? F.canal[1] - F.deck : F.canal[0] + F.deck, dx = Math.sign(target - fe.x) * Math.min(Math.abs(target - fe.x), F.speed * dt);
    for (const p of players) if (onFerry(p)) p.x += dx;
    fe.x += dx; if (Math.abs(target - fe.x) < 0.5) { fe.x = target; fe.side = fe.moving > 0 ? 'far' : 'near'; fe.moving = 0; }
  }
  updateBus(dt); updatePieces(dt); updatePup(dt); updateMetro(dt);
  // the bridge
  const br = game.bridge;
  if (br.lowering) { br.angle = Math.max(0, br.angle - dt * 1.22 / BRIDGE.lower); if (br.angle <= 0) { br.lowering = false; br.down = true; burst((BRIDGE.river[0] + BRIDGE.river[1]) / 2, FEET - 60, 12); if (bro.plane === 'hut') { bro.plane = 'street'; bro.x = BRIDGE.hut - 48; } sayNow(sis, 'The bridge is down! Come on!'); } }
  // the players
  for (const p of players) {
    const k = p.keys, o = other(p); let moving = false;
    p.stun = Math.max(0, p.stun - dt); p.crawl = Math.max(0, p.crawl - dt); p.holding = null;
    if (game.exitT >= 0) { p.x += (BRIDGE.gate - p.x) * Math.min(1, dt * 1.5); p.dir = 1; moving = true; }
    else if (p.plane === 'bus') { /* riding */ }
    else if (p.plane === 'train') { if (game.metro.ride && game.metro.ride.state === 'stopped' && hit(k.down)) leaveTrain(); else if (game.metro.ride && game.metro.ride.state === 'moving' && hit(k.down)) sayNow(p, 'Wait until the train stops!'); }
    else if (p.plane === 'hut') { if (game.chapter <= 0) hutKeys(p); }
    else if (game.chapter <= 0 && !game.fade && p.stun <= 0) {
      const dir = (down[k.right] ? 1 : 0) - (down[k.left] ? 1 : 0), [lo, hi] = limits(p);
      if (p.x < lo) p.x = lo; if (p.x > hi) p.x = hi;
      moving = walk(p, dir, lo, hi, dt, CITY.speed);
      const th = nearThing(p, 'up');
      if (th && th.hold && down[k.up]) p.holding = th.hold;
      if (hit(k.up)) { if (th && !th.hold) th.act(p); else if (!th && p.cheer <= 0) { p.cheer = CHEER; burst(p.x, p.y - 220 * HC, 6); } }
      if (hit(k.down)) { const t2 = nearThing(p, 'down'); if (t2) t2.act(p); else if (p.plane === 'street' || p.plane === 'metro') openPanel(p.plane === 'metro' ? 'metro' : 'treasure', p); }
      if (p.plane === 'street' && !game.pup.caught && down[k.right] && p.x >= PUPPY.area[1] + 30 && game.nag <= 0) { game.nag = 6; sayNow(p, "We can't go on without the last map piece!"); }
    }
    if (p.plane === 'street' && !inRoad(p.x)) p.safeX = p.x;
    animate(p, o, moving, dt);
  }
  game.nag = Math.max(0, game.nag - dt);
  // the siblings talk as they reach places
  CHATTER.forEach(([x, who, words], i) => { if (!game.said.has(i) && either((p) => p.plane === 'street' && p.x >= x)) { game.said.add(i); say(who === 'sis' ? sis : bro, words); } });
  if (game.panel) { game.panel.t += dt; const u = game.panel.user; if (Math.abs(u.x - game.panel.x) > 160 || (u.plane !== 'street' && u.plane !== 'metro')) game.panel = null; }
  if (game.fade) { game.fade.t += dt; if (!game.fade.fired && game.fade.t > game.fade.dur / 2) { game.fade.fired = true; game.fade.mid(); } if (game.fade.t > game.fade.dur) game.fade = null; }
  for (const h of game.honks) h.t += dt; game.honks = game.honks.filter((h) => h.t < 1);
  // both at the park gate: on into the forest
  if (game.bridge.down && game.exitT < 0 && both((p) => p.plane === 'street' && Math.abs(p.x - BRIDGE.gate) < 110)) { game.exitT = 0; game.queue = []; game.bubble = null; }
  if (game.exitT >= 0) { game.exitT += dt; for (const p of players) { const u = Math.min(1, game.exitT / 1.6); p.alpha = 1 - u; p.scale = 1 - u * 0.15; } if (game.exitT > 1.8) game.done = true; }
  if (game.done) { game.endT += dt; if (game.endT > 1.2 && (hit('KeyW') || hit('ArrowUp') || hit('Enter') || hit('Space'))) location.href = 'forest.html'; }
  updateGoal();
  updateTalk(dt);
  endInput();
}
function updateBus(dt) {
  const b = game.bus; b.t -= dt;
  const stopX = BUS.stop - BUS_DOOR, near = Math.abs(sis.x - BUS.stop) < 1400 || Math.abs(bro.x - BUS.stop) < 1400;
  if (b.state === 'away') { if (b.t <= 0 && near && !b.arrived) { b.state = 'arriving'; b.t = 3; b.x0 = camX - 700; b.x = b.x0; } return; }
  if (b.state === 'arriving') { const u = 1 - Math.max(0, b.t) / 3; b.x = lerp(b.x0, stopX, 1 - Math.pow(1 - u, 3)); if (b.t <= 0) { b.state = 'waiting'; b.t = BUS.wait; if (!game.saidBus) { game.saidBus = true; say(bro, 'A bus! Is it the right one?'); } } return; }
  if (b.state === 'waiting') { if (b.t <= 0) { b.state = 'leaving'; b.t = 0; b.ride = false; } return; }
  if (b.state === 'leaving') {
    if (b.riders.length === 1) { const p = b.riders.pop(); unboard(p, BUS.stop - 30); sayNow(p, "I'm not going without you!"); }
    if (b.ride) { // the right bus: ride along the street to the Old Bridge stop
      const target = BUS.arrive - BUS_DOOR; b.x = Math.min(target, b.x + BUS.rideSpeed * dt * Math.min(1, -b.t * 0.6 + 0.3)); b.t -= dt;
      for (const [i, p] of b.riders.entries()) { p.x = b.x + 22 + i * 112; }
      if (!game.saidRide) { game.saidRide = true; say(bro, 'Wheee! The whole city is going past!'); say(sis, 'Next stop... the Old Bridge!'); }
      if (b.x >= target) { b.riders.forEach((p, i) => unboard(p, BUS.arrive - 40 + i * 90)); b.riders = []; b.ride = false; b.arrived = true; b.state = 'off'; b.t = 0; say(sis, 'Old Bridge. This is our stop!'); }
      return;
    }
    b.x += (180 + -b.t * 260) * dt; b.t -= dt;
    if (b.riders.length === 2 && b.x > camX + VW + 200 && !game.fade) { // the wrong bus
      const place = BUS.places[busNow().place];
      game.fade = { t: 0, dur: 4.4, text: `Oh no! Bus ${busNow().line} goes to the ${place}...`, sub: 'They ride all the way there, and all the way back.', mid: () => { b.riders.forEach((p, i) => unboard(p, BUS.stop - 20 - i * 70)); b.riders = []; b.state = 'away'; b.t = BUS.gap; b.i++; sayNow(bro, 'Wrong bus! Let\'s check the route map again.'); } };
    }
    if (b.riders.length === 0 && b.x > camX + VW + 900) { b.state = 'away'; b.t = BUS.gap; b.i++; }
  }
  if (b.state === 'off') { b.x += 260 * dt; }
}
function intro() {
  say(sis, 'Out at last! Now, where does the map say to go?');
  say(bro, 'Right across the city, to the Old Bridge. The forest starts on the other side!');
  say(sis, 'Stay close to me, and we cross roads properly.');
}

// ---------- drawing the street
function liveWater(c, t) {
  for (const [g0, g1, kind] of GAPS) {
    if (kind !== 'water' || !inView(g0, g1)) continue;
    const cx = (g0 + g1) / 2, hw = 70;
    c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const u = i / 6, y = lerp(HOR + 10, BASE - 10, u * u), w2 = lerp(hw, (g1 - g0) / 2, u * u) * 0.6; c.beginPath(); c.moveTo(cx - w2 + Math.sin(t + i) * 10, y); c.lineTo(cx - w2 * 0.4 + Math.sin(t + i) * 10, y); c.stroke(); }
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2.5;
    for (let i = 0; i < 9; i++) { const y = 970 + (i % 4) * 26, xx = g0 + ((i * 173 + t * 30) % (g1 - g0 - 40)); c.beginPath(); c.moveTo(xx, y); c.quadraticCurveTo(xx + 20, y - 5, xx + 40, y); c.stroke(); }
  }
}
const W = (name) => SP[name][0];
let VIEW = [0, 1920]; // the part of the street being painted: the screen, or one cached strip
const inView = (a, b) => b > VIEW[0] - 60 && a < VIEW[1] + 60;
const PARALLAX = [['skylineFar', 0.15, 690, 1], ['skylineNear', 0.35, 830, 1]];
function drawSky(c, t, k = S) {
  const u = Math.max(0, Math.min(1, camX / (CITY.length - VW)));
  c.fillStyle = lg(c, 0, 0, 0, BASE, ...SKY.start.map((s, i) => mixCol(s, SKY.end[i], u))); c.fillRect(camX - 10, 0, VW + 20, VH);
  const sx = camX + VW * SKY.sunX, sy = lerp(330, 610, u);
  c.fillStyle = rg(c, sx, sy, 900, `rgba(255,236,190,${0.75 + u * 0.2})`, 'rgba(255,222,170,.25)', 'rgba(255,222,170,0)'); c.fillRect(camX - 10, 0, VW + 20, VH);
  ell(c, sx, sy, 46, 46, '#fff4d0', 0.9);
  if (SP.clouds) { const cl = SP.clouds, off = camX * 0.05 + t * 4; c.globalAlpha = 0.8; for (let i = -1; i < 6; i++) { const x = camX + ((i * 520 - off) % 3120 + 3120) % 3120 - 400; putFast(c, cl[(i + 7) % cl.length], x, 90 + (i % 3) * 50, 0.7 + (i % 2) * 0.2, k); } c.globalAlpha = 1; }
  for (const [name, par, base] of PARALLAX) {
    const arts = SP[name], tw = arts[0].w, off = camX * par, start = Math.floor(off / tw);
    for (let i = start; i * tw - off < VW + tw; i++) putFast(c, arts[((i % arts.length) + arts.length) % arts.length], camX + i * tw - off, base, 1, k);
  }
  c.fillStyle = lg(c, 0, 560, 0, BASE, 'rgba(250,228,200,0)', 'rgba(250,228,200,.35)'); c.fillRect(camX - 10, 560, VW + 20, BASE - 560);
}
// a side street, the canal or the river running away from the camera between the buildings
function drawGap(c, x0, x1, kind) {
  if (!inView(x0, x1)) return;
  const cx = (x0 + x1) / 2, hw = kind === 'road' ? 36 : 70, k = 0.55;
  const P = (x, y, u) => [x + (cx - x) * u, y + (HOR - y) * u];
  // the side walls of the buildings beside the gap
  for (const [ex, s] of [[x0, 1], [x1, -1]]) {
    const top = BASE - 600, [bx, by] = P(ex, BASE, k), [tx, ty] = P(ex, top, k);
    c.fillStyle = lg(c, ex, 0, bx, 0, '#7d6670', '#9a8a94'); c.beginPath(); c.moveTo(ex, top); c.lineTo(tx, ty); c.lineTo(bx, by); c.lineTo(ex, BASE); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,230,190,.35)'; c.lineWidth = 2;
    for (let i = 1; i < 6; i++) { const yy = BASE - i * 100, [ax2, ay2] = P(ex, yy, k); c.beginPath(); c.moveTo(ex, yy); c.lineTo(ax2, ay2); c.stroke(); }
    c.fillStyle = 'rgba(255,220,150,.55)'; for (let i = 0; i < 5; i++) for (let j = 1; j < 4; j++) { const u = j * 0.13, [wx, wy] = P(ex, BASE - 70 - i * 100, u), hgt = 40 * (1 - u * 0.9); if ((i + j) % 2) c.fillRect(wx - (s > 0 ? 0 : 8), wy - hgt, 8 * (1 - u), hgt); }
  }
  if (kind === 'road') {
    c.fillStyle = textureFast(c, W('road')); c.beginPath(); c.moveTo(x0, BASE); c.lineTo(cx - hw, HOR); c.lineTo(cx + hw, HOR); c.lineTo(x1, BASE); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,240,210,.12)'; c.fill();
    c.strokeStyle = 'rgba(250,240,220,.7)'; c.setLineDash([16, 20]); c.lineWidth = 3; c.beginPath(); c.moveTo(cx, HOR + 4); c.lineTo(cx, BASE); c.stroke(); c.setLineDash([]);
    // pavements along the side street
    for (const s of [-1, 1]) { const ex = s < 0 ? x0 : x1; c.fillStyle = '#b9b0a4'; c.beginPath(); c.moveTo(ex, BASE); c.lineTo(ex + s * -22, BASE); c.lineTo(cx + s * hw * 0.8, HOR); c.lineTo(cx + s * hw, HOR); c.closePath(); c.fill(); }
  } else {
    c.fillStyle = lg(c, 0, HOR, 0, BASE, '#9ab8c8', '#6f9ab0'); c.beginPath(); c.moveTo(x0, BASE); c.lineTo(cx - hw, HOR); c.lineTo(cx + hw, HOR); c.lineTo(x1, BASE); c.closePath(); c.fill();
  }
}
const GAPS = [[CROSSING.road[0], CROSSING.road[1], 'road'], [AVENUE.roads[0][0], AVENUE.roads[0][1], 'road'], [AVENUE.roads[1][0], AVENUE.roads[1][1], 'road'], [F.canal[0], F.canal[1], 'water'], [BRIDGE.river[0], BRIDGE.river[1], 'water']];
const MARKET = [3960, 5240];
function drawGround(c) {
  const L = VIEW[0] - 20, R2 = VIEW[1] + 20;
  // pavement and the main road in front, with gaps for the side streets and water
  let x = L; const gaps = GAPS.filter((g) => g[1] > L && g[0] < R2).sort((a, b) => a[0] - b[0]);
  const band = (a, b) => {
    if (b <= a) return;
    const park = BRIDGE.river[1];
    const seg = (s0, s1, kind) => {
      if (s1 <= s0) return;
      if (kind === 'park') { c.fillStyle = SP.grassTexture ? textureFast(c, SP.grassTexture[0]) : '#7ea551'; c.fillRect(s0, BASE - 4, s1 - s0, 90); c.fillStyle = SP.pathTexture ? textureFast(c, SP.pathTexture[0]) : '#d9c49a'; c.fillRect(s0, FEET - 30, s1 - s0, 60); }
      else { c.fillStyle = textureFast(c, W(kind === 'market' ? 'cobbles' : 'pavement')); c.fillRect(s0, BASE, s1 - s0, KERB - BASE); }
      c.fillStyle = 'rgba(60,40,30,.18)'; c.fillRect(s0, BASE, s1 - s0, 10);
      c.fillStyle = lg(c, 0, KERB, 0, KERB + 14, '#e2dbd0', '#a8a096'); c.fillRect(s0, KERB, s1 - s0, 14);
      c.fillStyle = textureFast(c, W('road')); c.fillRect(s0, KERB + 14, s1 - s0, VH - KERB - 14);
      c.fillStyle = 'rgba(250,240,220,.75)'; for (let dx = Math.ceil(s0 / 120) * 120; dx < s1; dx += 120) c.fillRect(dx, 1052, 60, 5);
    };
    const m0 = Math.max(a, MARKET[0]), m1 = Math.min(b, MARKET[1]);
    if (m1 > m0) { seg(a, m0, 'pave'); seg(m0, m1, 'market'); seg(m1, Math.min(b, park), 'pave'); } else seg(a, Math.min(b, park), 'pave');
    seg(Math.max(a, park), b, 'park');
  };
  for (const g of gaps) { band(x, g[0]); x = Math.max(x, g[1]); }
  band(x, R2);
  for (const [g0, g1, kind] of gaps) {
    if (kind === 'road') {
      c.fillStyle = textureFast(c, W('road')); c.fillRect(g0, BASE, g1 - g0, VH - BASE);
      c.fillStyle = 'rgba(248,244,236,.85)'; for (let zx = g0 + 18; zx < g1 - 30; zx += 48) c.fillRect(zx, BASE + 10, 26, KERB - BASE - 8);
      const sy = carY(STOP_Z), sw = lerp(36, (g1 - g0) / 2, (carScale(STOP_Z) - 0.2) / 0.8); c.fillStyle = 'rgba(248,244,236,.8)'; c.fillRect((g0 + g1) / 2 - sw, sy - 3, sw * 2, 5);
    } else {
      c.fillStyle = lg(c, 0, BASE, 0, VH, '#6f9ab0', '#4f7f98', '#3f6a82'); c.fillRect(g0, BASE, g1 - g0, VH - BASE);
      for (const [ex, s] of [[g0, -1], [g1, 1]]) { c.fillStyle = textureFast(c, W('stone')); c.fillRect(s < 0 ? ex - 2 : ex - 16, BASE, 18, VH - BASE); c.fillStyle = 'rgba(20,30,40,.35)'; c.fillRect(s < 0 ? ex - 2 : ex - 16, 960, 18, VH - 960); }
    }
  }
}
function drawBuildings(c) {
  for (const [name, x] of BUILDINGS) {
    if (name === 'warehouse') continue;
    const a = W(name); if (!inView(x - a.ax, x - a.ax + a.w)) continue; putFast(c, a, x, BASE);
  }
}
function drawWarehouse(c, t) {
  const wx = BUILDINGS.find((b) => b[0] === 'warehouse')[1], a = W('warehouse'); if (!inView(wx - a.ax, wx - a.ax + a.w)) return;
  putFast(c, W('courtyard'), wx, BASE);
  // buttons on the courtyard walls, and the gate
  wallButton(c, A.buttonIn, A.floor - 130, players.some((p) => p.holding === 'in'), 0.8);
  wallButton(c, A.gateButton, A.floor - 130, game.gateOpen, 0.8, '#3f8a4a');
  if (game.gateOpen) { c.save(); c.translate(A.gate + 50, A.floor); c.scale(0.18, A.depth); put(c, W('courtGate'), 0, 0); c.restore(); }
  else putFast(c, W('courtGate'), A.gate, A.floor, A.depth);
  for (const p of players) if (p.plane === 'yard') drawSib(p, t);
  c.save(); c.globalAlpha = 1 - 0.88 * game.yardReveal; putFast(c, a, wx, BASE);
  // the roll-up shutter
  const sw = 200, sh = 240, open = game.shutter, vis = sh * (1 - open), sx = A.shutter - sw / 2, top = BASE - sh;
  c.fillStyle = lg(c, sx, 0, sx + sw, 0, '#7f8a96', '#a8b2bc', '#8a949e'); c.fillRect(sx, top, sw, vis);
  c.strokeStyle = 'rgba(40,45,55,.45)'; c.lineWidth = 2; for (let y = top + vis - 12; y > top; y -= 12) { c.beginPath(); c.moveTo(sx, y); c.lineTo(sx + sw, y); c.stroke(); }
  if (vis > 4) { c.fillStyle = '#5a646e'; c.fillRect(sx, top + vis - 8, sw, 8); rrect(c, A.shutter - 18, top + vis - 16, 36, 8, 3); fs(c, '#d9b55c', '#5a4214', 1.2); }
  c.restore();
  wallButton(c, A.buttonOut, BASE - 130, players.some((p) => p.holding === 'out'), 1);
}
function wallButton(c, x, y, lit, s = 1, col = '#c9402f') {
  c.save(); c.translate(x, y); c.scale(s, s); rrect(c, -18, -26, 36, 52, 6); fs(c, lg(c, -18, 0, 18, 0, '#8a8a92', '#b2b2ba'), INK, 2);
  c.beginPath(); circ(c, 0, lit ? 2 : 0, 11); fs(c, lit ? shade(col, 0.3) : col, '#2a0a08', 2); if (lit) soft(c, 0, 0, 30, 30, '#fff3b8', 0.6); c.restore();
}
function drawRoadworks(c) {
  const [b0, b1] = A.barrier; if (!inView(b0 - 100, b1 + 100)) return;
  c.fillStyle = lg(c, 0, BASE, 0, KERB, '#7a5a3e', '#5a3e28'); c.fillRect(b0 + 20, BASE + 6, b1 - b0 - 40, KERB - BASE - 10);
  putFast(c, W('digger'), 3470, BASE + 30, 0.9);
  for (let x = b0 + 110; x < b1; x += 230) putFast(c, W('barrier'), x, FEET + 30);
  putFast(c, W('cone'), b0 - 10, FEET + 34); putFast(c, W('cone'), b1 + 10, FEET + 34); putFast(c, W('closedSign'), A.barrier[0] + 70, BASE + 12);
}
function signalMan(c, x, y, state, t) {
  rrect(c, x - 13, y, 26, 36, 4); fs(c, '#1c1c22', '#000', 1.2);
  const on = state === 'walk' || (state === 'flash' && Math.sin(t * 12) > 0), col = state === 'stop' ? '#ff4a3a' : '#5adf6a';
  if (state !== 'stop' && !on) return;
  c.save(); c.translate(x, y + 18); c.fillStyle = col; c.strokeStyle = col; c.lineWidth = 2.6; c.lineCap = 'round';
  ell(c, 0, -11, 3.2, 3.2, col); c.beginPath(); if (state === 'stop') { c.moveTo(0, -7); c.lineTo(0, 4); c.moveTo(-5, -4); c.lineTo(0, -6); c.lineTo(5, -4); c.moveTo(0, 4); c.lineTo(-3, 12); c.moveTo(0, 4); c.lineTo(3, 12); }
  else { c.moveTo(1, -7); c.lineTo(-1, 3); c.moveTo(-6, -2); c.lineTo(1, -6); c.lineTo(6, -1); c.moveTo(-1, 3); c.lineTo(-6, 12); c.moveTo(-1, 3); c.lineTo(5, 11); }
  c.stroke(); soft(c, 0, 0, 22, 22, col, 0.35); c.restore();
}
function staticTraffic(c) {
  if (inView(CROSSING.road[0] - 100, CROSSING.road[1] + 100)) { putFast(c, W('crossingPole'), CROSSING.button, BASE + 12); putFast(c, W('trafficLight'), CROSSING.road[1] + 46, BASE + 12); }
  if (inView(AVENUE.roads[0][0] - 100, AVENUE.roads[1][1] + 100)) {
    const mid = (AVENUE.island[0] + AVENUE.island[1]) / 2, pole = AVENUE.roads[0][0] - 55;
    putFast(c, W('planter'), mid, BASE + 14); if (SP.bushes) putFast(c, SP.bushes[1 % SP.bushes.length], mid, BASE - 30, 0.6);
    putFast(c, W('crossingPole'), pole, BASE + 12); rrect(c, pole - 22, BASE + 12 - 176, 44, 16, 2); fs(c, '#f2c94e', INK, 1); c.fillStyle = INK; c.font = '700 7px Georgia, serif'; c.textAlign = 'center'; c.fillText('OUT OF ORDER', pole, BASE + 12 - 165); c.textAlign = 'left';
    putFast(c, W('crossingPole'), AVENUE.island[1] - 30, BASE + 12);
    putFast(c, W('trafficLight'), AVENUE.roads[0][1] + 36, BASE + 12); putFast(c, W('trafficLight'), AVENUE.roads[1][1] + 46, BASE + 12);
  }
}
function carLamp(c, x, state) {
  [['#ff4a3a', 'red'], ['#ffb03a', 'amber'], ['#5adf6a', 'go']].forEach(([col, st], i) => { if (state !== st) return; const y = BASE + 12 - 390 + i * 36; ell(c, x, y, 11, 11, col); soft(c, x, y, 34, 34, col, 0.5); });
}
function liveTraffic(c, t) {
  if (inView(CROSSING.road[0] - 100, CROSSING.road[1] + 100)) {
    const cp = crossingPhase(); signalMan(c, CROSSING.button, BASE + 12 - 244, cp.walk, t);
    const waitOn = game.cross.phase === 'wait'; rrect(c, CROSSING.button - 11, BASE + 12 - 166, 22, 12, 2); fs(c, waitOn ? '#ffb03a' : '#3a3a40'); c.fillStyle = waitOn ? '#3a1a00' : '#777'; c.font = '700 8px Georgia, serif'; c.textAlign = 'center'; c.fillText('WAIT', CROSSING.button, BASE + 12 - 157); c.textAlign = 'left';
    carLamp(c, CROSSING.road[1] + 46, cp.car);
  }
  if (inView(AVENUE.roads[0][0] - 100, AVENUE.roads[1][1] + 100)) {
    const p0 = avenuePhase(0), p1 = avenuePhase(1);
    signalMan(c, AVENUE.roads[0][0] - 55, BASE + 12 - 244, p0.walk, t); signalMan(c, AVENUE.island[1] - 30, BASE + 12 - 244, p1.walk, t);
    carLamp(c, AVENUE.roads[0][1] + 36, p0.car); carLamp(c, AVENUE.roads[1][1] + 46, p1.car);
  }
}
function drawCars(c, front) {
  for (const r of ROADS) {
    if (!inView(r.x0 - 200, r.x1 + 200)) continue;
    const cx = (r.x0 + r.x1) / 2;
    for (const car of [...r.cars].sort((a, b) => a.z - b.z)) { if ((car.z >= 1) !== front) continue; put(c, SP.car[car.art], cx, carY(car.z), carScale(car.z) * 0.9); }
  }
}
function staticProps(c) {
  for (const [name, x] of PROPS) { const a = W(name); if (inView(x - a.ax, x - a.ax + a.w)) putFast(c, a, x, BASE + 12); }
  if (SP.trees) TREES.forEach(([x, s], i) => { if (!inView(x - 200, x + 200)) return; putFast(c, SP.trees[i % SP.trees.length], x, BASE - 34, s); putFast(c, W('planter'), x, BASE + 14); });
  if (inView(BUS.board - 100, BUS.board + 100)) putFast(c, W('routeBoard'), BUS.board, BASE + 12);
  if (inView(F.canal[0] - 200, F.canal[1] + 200)) for (const bx of [F.buttonNear, F.buttonFar]) putFast(c, W('callButton'), bx, BASE + 12);
  if (inView(BRIDGE.power - 200, BRIDGE.gate + 600)) {
    PARK.forEach(([kind, x, s], i) => { if (SP[kind] && inView(x - 300, x + 300)) putFast(c, SP[kind][i % SP[kind].length], x, BASE + 16, s); });
    putFast(c, W('parkGate'), BRIDGE.gate, BASE + 18); putFast(c, W('powerPost'), BRIDGE.power, BASE + 12); putFast(c, W('bridgeHut'), BRIDGE.hut, BASE + 12);
    for (const px of BRIDGE.river) { c.fillStyle = textureFast(c, W('stone')); c.fillRect(px - 26, FEET, 52, VH - FEET); c.fillStyle = 'rgba(20,30,40,.3)'; c.fillRect(px - 26, 980, 52, VH - 980); }
  }
}
function liveProps(c, t) {
  const fe = game.ferry;
  if (inView(F.canal[0] - 200, F.canal[1] + 200)) {
    for (const bx of [F.buttonNear, F.buttonFar]) ell(c, bx, BASE + 12 - 118, 7, 7, fe.moving ? '#ffb03a' : '#5adf6a');
    c.strokeStyle = 'rgba(60,50,40,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(F.canal[0], FEET - 10); c.quadraticCurveTo(fe.x - 200, FEET + 30, fe.x - F.deck, FEET - 20); c.moveTo(fe.x + F.deck, FEET - 20); c.quadraticCurveTo(fe.x + 200, FEET + 30, F.canal[1], FEET - 10); c.stroke();
    putFast(c, W('ferry'), fe.x, FEET + Math.sin(t * 1.6) * 1.5);
  }
  if (inView(BRIDGE.power - 200, BRIDGE.river[1] + 200)) {
    const br = game.bridge, lx = BRIDGE.power, ly = BASE + 12 - 372;
    c.save(); c.translate(lx + 18, ly); c.rotate(br.power ? -0.9 : 0.9); c.strokeStyle = '#2c2c34'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -26); c.stroke(); ell(c, 0, -28, 6, 6, '#c9402f'); c.restore();
    if (br.power) { soft(c, lx, ly - 30, 30, 30, '#fff3b8', 0.5 + Math.sin(t * 6) * 0.2); soft(c, BRIDGE.hut + 40, BASE + 12 - 165, 60, 50, '#ffe2a0', 0.55); }
    c.save(); c.translate(BRIDGE.river[0], FEET + 2); c.rotate(-br.angle); put(c, W('bridgeDeck'), 0, 0); c.restore();
  }
}
function staticMetro(c) {
  for (const x of [METRO.entrance, METRO.exit]) if (inView(x - 250, x + 250)) putFast(c, W('metroEntrance'), x, BASE + 14);
  for (const [x, s] of [[METRO.closed[0], 1], [METRO.closed[1], -1]]) if (inView(x - 300, x + 300)) {
    c.fillStyle = lg(c, 0, BASE, 0, KERB, '#7a5a3e', '#5a3e28'); c.fillRect(s > 0 ? x + 20 : x - 420, BASE + 6, 400, KERB - BASE - 10);
    for (let i = 0; i < 3; i++) putFast(c, W('barrier'), x + s * (110 + i * 230), FEET + 30);
    putFast(c, W('metroSign'), x + s * 40, BASE + 12); putFast(c, W('cone'), x - s * 10, FEET + 34);
  }
  if (inView(PIECES.spots[1].x - 60, PIECES.spots[1].x + 60)) { const gx = PIECES.spots[1].x; rrect(c, gx - 34, KERB - 4, 68, 16, 3); fs(c, '#3c3a40', '#1c1a20', 1.5); c.strokeStyle = '#1c1a20'; c.lineWidth = 3; for (let x = gx - 28; x <= gx + 28; x += 8) { c.beginPath(); c.moveTo(x, KERB - 2); c.lineTo(x, KERB + 10); c.stroke(); } }
}
function drawLampGlow(c, t) {
  const u = Math.max(0, Math.min(1, camX / (CITY.length - VW)));
  for (const [name, x] of PROPS) if (name === 'streetLamp' && inView(x - 100, x + 100)) soft(c, x, BASE + 12 - 410, 90, 80, '#ffe1a0', 0.12 + u * 0.45);
}
function drawSib(p, t) {
  if (p.crawl > 0) { const s = p.scale; p.scale = s * (1 - Math.sin(p.crawl / 0.6 * Math.PI) * 0.25); drawChar(p, t); p.scale = s; return; }
  drawChar(p, t);
}
function drawBus(c, t) {
  const b = game.bus; if (b.state === 'away' || !inView(b.x - 450, b.x + 450)) return;
  const y = 1064;
  for (const [i, p] of b.riders.entries()) { const keep = p.y; p.y = y - 58; p.x = b.x + 22 + i * 112; p.noShadow = true; drawChar(p, t); p.y = keep; p.noShadow = false; }
  putFast(c, W('bus'), b.x, y);
  const r = busNow(); c.save(); c.fillStyle = '#ffb03a'; c.font = '700 18px Georgia, serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
  c.fillText(b.state === 'off' ? 'Not in service' : `${r.line}   ${BUS.places[r.place]}`, b.x - 368, y - 309); c.restore();
  // siblings standing behind the bus show through it faintly
  for (const p of players) if (p.plane === 'street' && Math.abs(p.x - b.x) < 440) { const a = p.alpha; p.alpha = a * 0.5; drawChar(p, t); p.alpha = a; }
}

// ---------- the metro, drawn when the siblings are underground
const PLAT_W = 1920; // the platform scene is this wide
function stationBoard(c, x, y, name, col) { // an enamel name board with the line colour along its edge
  c.font = 'italic 700 26px Georgia, serif'; const w = Math.max(240, c.measureText(name).width + 90), h = 64;
  c.fillStyle = 'rgba(40,30,20,.25)'; rrect(c, x - w / 2 + 4, y - h / 2 + 6, w, h, 10); c.fill();
  rrect(c, x - w / 2, y - h / 2, w, h, 10); fs(c, col, '#1c2a3a', 2.5); rrect(c, x - w / 2 + 8, y - h / 2 + 8, w - 16, h - 16, 6); fs(c, '#f6efe0', 'rgba(28,42,58,.5)', 1.5);
  c.beginPath(); circ(c, x - w / 2 + 34, y, 15); fs(c, '#c9402f', '#4a0e0a', 1.5); c.fillStyle = '#fff'; c.font = '700 15px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('M', x - w / 2 + 34, y + 1);
  c.fillStyle = '#1c2a3a'; c.font = 'italic 700 26px Georgia, serif'; c.fillText(name, x + 16, y + 2); c.textBaseline = 'alphabetic'; c.textAlign = 'left';
}
function drawPlatform(c, t) {
  const m = game.metro, st = m.station, cols = serving(st).map((o) => METRO.colours[o.line]).filter((v, i, a) => a.indexOf(v) === i);
  const L = camX - 20, Rr = camX + VW + 20;
  c.fillStyle = textureFast(c, W('metroTile')); c.fillRect(L, 0, Rr - L, BASE);
  c.fillStyle = lg(c, 0, 0, 0, 160, '#3a3a44', '#55555f'); c.fillRect(L, 0, Rr - L, 140);
  for (let x = Math.floor(L / 320) * 320 + 100; x < Rr; x += 320) { rrect(c, x, 120, 140, 14, 4); fs(c, '#fffbe8'); soft(c, x + 70, 150, 160, 80, '#fff4d0', 0.35); }
  cols.forEach((col, i) => { c.fillStyle = col; c.fillRect(L, 610 + i * 34, Rr - L, 26); });
  c.fillStyle = 'rgba(40,30,20,.1)'; c.fillRect(L, BASE - 40, Rr - L, 40);
  for (const x of [380, 1140, 1760]) stationBoard(c, x, 470, st, cols[0] || '#3f5a78');
  // the line map on the wall
  rrect(c, 430, 250, 260, 170, 8); fs(c, '#2c2c34', '#111', 3); rrect(c, 442, 262, 236, 146, 4); fs(c, '#f6efe0');
  c.strokeStyle = METRO.colours.Blue; c.lineWidth = 6; c.beginPath(); c.moveTo(456, 330); c.lineTo(664, 330); c.stroke();
  c.strokeStyle = METRO.colours.Green; c.beginPath(); c.moveTo(560, 276); c.lineTo(560, 396); c.stroke();
  c.fillStyle = '#2c2c34'; c.font = 'italic 700 14px Georgia, serif'; c.textAlign = 'center'; c.fillText('Metro map', 560, 425); c.textAlign = 'left';
  // stairs up and the way out sign
  c.fillStyle = '#8a8478'; for (let i = 0; i < 9; i++) c.fillRect(-60 + i * 22, BASE - 60 - i * 40, 230 - i * 22, 40);
  c.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 9; i++) c.fillRect(-60 + i * 22, BASE - 24 - i * 40, 230 - i * 22, 4);
  c.strokeStyle = '#2c2c34'; c.lineWidth = 5; c.beginPath(); c.moveTo(220, BASE - 110); c.lineTo(-40, BASE - 470); c.stroke();
  rrect(c, 40, 190, 170, 46, 6); fs(c, st === METRO.goal ? '#3f8a4a' : '#2f4a3a', '#111', 2); c.fillStyle = '#fff'; c.font = '700 22px Georgia, serif'; c.textAlign = 'center'; c.fillText('Way out ↑', 125, 221); c.textAlign = 'left';
  // the "next train" sign
  const tr = m.train, opts = serving(st), nx = opts[m.cyc % opts.length];
  rrect(c, 820, 170, 380, 70, 6); fs(c, '#1c1c22', '#000', 3);
  c.fillStyle = '#ffb03a'; c.font = '700 20px Georgia, serif'; c.textAlign = 'center';
  const sign = tr ? `${tr.line} line to ${terminus(tr.line, tr.dir)}` : `Next: ${nx.line} line to ${terminus(nx.line, nx.dir)}`;
  const sub = tr ? ({ in: 'arriving', doors: 'arriving', open: 'doors open - all aboard', out: 'departing' })[tr.state] : `in ${Math.max(0, Math.ceil(m.gapT))} s`;
  c.fillText(sign, 1010, 200); c.font = '600 15px Georgia, serif'; c.fillText(sub, 1010, 225); c.textAlign = 'left';
  for (const x of [770, 1560]) putFast(c, W('pillar'), x, BASE + 4);
  for (const x of [620, 1340]) putFast(c, W('bench'), x, BASE + 10);
  // platform, yellow line and the track
  c.fillStyle = lg(c, 0, BASE, 0, KERB, '#b9b2a6', '#a39c90'); c.fillRect(L, BASE, Rr - L, KERB - BASE);
  c.fillStyle = '#f2c94e'; c.fillRect(L, KERB - 18, Rr - L, 8);
  c.fillStyle = '#5a5650'; c.fillRect(L, KERB, Rr - L, 10);
  c.fillStyle = lg(c, 0, KERB + 10, 0, VH, '#2c2a30', '#1c1a20'); c.fillRect(L, KERB + 10, Rr - L, VH - KERB - 10);
  c.fillStyle = '#4a4038'; for (let x = Math.floor(L / 60) * 60; x < Rr; x += 60) c.fillRect(x, 1046, 34, 12);
  c.fillStyle = '#9a9aa2'; c.fillRect(L, 1040, Rr - L, 5); c.fillRect(L, 1062, Rr - L, 5);
}
function drawTrain(c, t, tr) {
  const y = 1074, art = W(tr.line === 'Blue' ? 'trainBlue' : 'trainGreen');
  for (const [i, q] of tr.riders.entries()) { q.y = y - 70; q.x = tr.x - 230 + i * 120; q.noShadow = true; drawChar(q, t); q.y = FEET; q.noShadow = false; }
  for (const dx of [-450, 450]) {
    putFast(c, art, tr.x + dx, y);
    rrect(c, tr.x + dx - 160, y - 314, 320, 22, 4); fs(c, '#1c1c22');
    c.fillStyle = '#ffb03a'; c.font = '700 15px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(`${tr.line} line · to ${terminus(tr.line, tr.dir)}`, tr.x + dx, y - 302); c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    if (tr.state === 'open') for (const d of [-220, 220]) { c.fillStyle = 'rgba(255,240,200,.35)'; c.fillRect(tr.x + dx + d - 50, y - 288, 100, 258); }
  }
  for (const q of players) if (q.plane === 'metro' && Math.abs(q.x - tr.x) < 900) { const a = q.alpha; q.alpha = a * 0.5; drawChar(q, t); q.alpha = a; }
}
function drawMetro(c, t) {
  drawPlatform(c, t);
  const tr = game.metro.train;
  for (const q of players) if (q.plane === 'metro') drawSib(q, t);
  if (tr) drawTrain(c, t, tr);
}
function drawRide(c, t) {
  const r = game.metro.ride, moving = r.state === 'moving', col = METRO.colours[r.line], L = camX - 20, Rr = camX + VW + 20, sway = moving ? Math.sin(t * 7) * 2 : 0;
  // inside the carriage
  c.fillStyle = lg(c, 0, 0, 0, VH, '#e8e4da', '#d4cfc2'); c.fillRect(L, 0, Rr - L, VH);
  c.fillStyle = '#c9c4b6'; c.fillRect(L, 0, Rr - L, 90);
  for (let x = Math.floor(L / 420) * 420; x < Rr; x += 420) {
    const wx = x + 60, wy = 300 + sway, ww = 300, wh = 300;
    c.save(); rrect(c, wx, wy, ww, wh, 22); c.clip();
    if (moving) { c.fillStyle = '#1c1a22'; c.fillRect(wx, wy, ww, wh); for (let i = 0; i < 5; i++) { const lx = wx + ((i * 97 - t * 2400) % 600 + 600) % 600 - 150; c.fillStyle = 'rgba(255,220,150,.55)'; c.fillRect(lx, wy + 60 + i * 40, 120, 4); } }
    else { c.fillStyle = textureFast(c, W('metroTile')); c.fillRect(wx, wy, ww, wh); c.fillStyle = col; c.fillRect(wx, wy + 200, ww, 24); stationBoard(c, wx + ww / 2, wy + 110, r.at, col); }
    c.restore(); rrect(c, wx, wy, ww, wh, 22); c.strokeStyle = '#8a8478'; c.lineWidth = 10; c.stroke();
  }
  c.fillStyle = col; c.fillRect(L, 640, Rr - L, 20);
  for (let x = Math.floor(L / 420) * 420; x < Rr; x += 420) { rrect(c, x + 40, 690, 340, 90, 14); fs(c, lg(c, 0, 690, 0, 780, shade(col, 0.2), shade(col, -0.2)), '#2c2c34', 2); rrect(c, x + 30, 780, 360, 30, 6); fs(c, '#6a6458'); }
  c.fillStyle = lg(c, 0, 810, 0, VH, '#9a958a', '#7a756a'); c.fillRect(L, 810, Rr - L, VH - 810);
  for (let x = Math.floor(L / 420) * 420 + 10; x < Rr; x += 420) { c.fillStyle = '#e2b84a'; c.fillRect(x, 90, 12, 820); }
  // the line diagram over the windows
  const arr = lineArr(r.line), n = arr.length, dx0 = camX + 160, dx1 = camX + VW - 160, sx = (i) => lerp(dx0, dx1, r.dir > 0 ? i / (n - 1) : 1 - i / (n - 1));
  c.strokeStyle = col; c.lineWidth = 10; c.beginPath(); c.moveTo(dx0, 190); c.lineTo(dx1, 190); c.stroke();
  arr.forEach((name, i) => { const x = sx(i); c.beginPath(); circ(c, x, 190, 13); fs(c, '#fff', col, 4); c.fillStyle = '#2c2c34'; c.font = (name === r.at ? '700 ' : '600 ') + '17px Georgia, serif'; c.textAlign = 'center'; c.fillText(name, x, 230); });
  const i0 = arr.indexOf(r.at), pos = moving ? lerp(sx(i0), sx(i0 + r.dir), Math.min(1, r.t / METRO.between)) : sx(i0);
  c.beginPath(); circ(c, pos, 190, 9); fs(c, '#c9402f', '#fff', 3); soft(c, pos, 190, 26, 26, '#c9402f', 0.4);
  c.fillStyle = '#2c2c34'; c.font = 'italic 700 20px Georgia, serif'; c.fillText(`${r.line} line to ${terminus(r.line, r.dir)}`, camX + VW / 2, 140); c.textAlign = 'left';
  // the siblings, standing
  players.forEach((q, i) => { q.x = camX + VW / 2 - 110 + i * 150; q.y = FEET + 10; q.dir = i ? -1 : 1; drawChar(q, t); });
  // what is happening
  c.save(); c.textAlign = 'center';
  const nextName = nextStation(r.line, r.dir, r.at);
  if (moving) { rrect(c, camX + VW / 2 - 260, 250, 520, 48, 10); fs(c, 'rgba(28,28,34,.85)'); c.fillStyle = '#ffb03a'; c.font = '700 22px Georgia, serif'; c.fillText(`Next stop: ${nextName}`, camX + VW / 2, 282); }
  else {
    rrect(c, camX + VW / 2 - 300, 250, 600, 48, 10); fs(c, 'rgba(28,28,34,.85)'); c.fillStyle = '#ffb03a'; c.font = '700 22px Georgia, serif';
    const change = serving(r.at).some((o) => o.line !== r.line) ? '  ·  change here for the ' + serving(r.at).find((o) => o.line !== r.line).line + ' line' : '';
    c.fillText(`This is ${r.at}${change}`, camX + VW / 2, 282);
    if (nextName) for (const q of players) hintAt(c, q.x, q.y - q.headH * HC - 14, q.glyph[1], 'Get off here', q.col);
  }
  c.restore();
}

// ---------- panels: the treasure map and the bus route map
function drawRouteMap(c, t) {
  const w = 820, h = 520, x = camX + VW / 2 - w / 2, y = 130, rnd = rng(game.mapSeed);
  c.save(); c.fillStyle = 'rgba(20,12,6,.4)'; rrect(c, x + 8, y + 12, w, h, 18); c.fill();
  rrect(c, x, y, w, h, 18); fs(c, '#3f5a78', '#1c2a3a', 4); rrect(c, x + 18, y + 64, w - 36, h - 82, 10); fs(c, '#f6efe0');
  c.fillStyle = '#f6efe0'; c.font = 'italic 700 30px Georgia, serif'; c.textAlign = 'center'; c.fillText('City Bus Routes', x + w / 2, y + 44);
  const ly = (i) => y + 120 + i * 105, lx = x + 110, rx = x + w - 150;
  c.fillStyle = '#3f5a78'; c.font = 'italic 600 15px Georgia, serif'; c.fillText('You are here', lx, y + 88);
  // the lines: all drawn the same, so you have to follow them with your finger
  const paths = game.routes.map((r, i) => { const y0 = ly(i), y1 = ly(r.place), m1 = y + 110 + rnd() * 330, m2 = y + 110 + rnd() * 330; return [y0, y1, m1, m2]; });
  for (const pass of [0, 1]) for (const [y0, y1, m1, m2] of paths) {
    c.beginPath(); c.moveTo(lx + 40, y0); c.bezierCurveTo(lx + 220, m1, rx - 220, m2, rx - 40, y1);
    c.strokeStyle = pass ? '#4a4a55' : '#f6efe0'; c.lineWidth = pass ? 6 : 14; c.stroke();
  }
  game.routes.forEach((r, i) => { c.beginPath(); circ(c, lx, ly(i), 30); fs(c, '#c9402f', '#4a0e0a', 3); c.fillStyle = '#fff'; c.font = '700 24px Georgia, serif'; c.textBaseline = 'middle'; c.fillText(r.line, lx, ly(i) + 1); c.textBaseline = 'alphabetic'; });
  BUS.places.forEach((pl, i) => { rrect(c, rx - 36, ly(i) - 26, 170, 52, 10); fs(c, i === 0 ? '#fff3b8' : '#e8e2d4', '#3f5a78', 2.5); c.fillStyle = '#2a3a4a'; c.font = '600 19px Georgia, serif'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(pl, rx - 20, ly(i) + 1); c.textBaseline = 'alphabetic'; c.textAlign = 'center'; });
  c.restore();
}
function drawMetroMap(c, t) {
  const w = 900, h = 620, x = camX + VW / 2 - w / 2, y = 90;
  c.save(); c.fillStyle = 'rgba(20,12,6,.4)'; rrect(c, x + 8, y + 12, w, h, 18); c.fill();
  rrect(c, x, y, w, h, 18); fs(c, '#2c2c34', '#111', 4); rrect(c, x + 18, y + 64, w - 36, h - 82, 10); fs(c, '#f6efe0');
  c.fillStyle = '#f6efe0'; c.font = 'italic 700 30px Georgia, serif'; c.textAlign = 'center'; c.fillText('City Metro', x + w / 2, y + 44);
  const B = lineArr('Blue'), G = lineArr('Green'), cx = x + 470, cy = y + 260;
  const bx = (i) => x + 110 + i * 170, gy = (i) => y + 125 + i * 130; // Central is Blue[2] and Green[1]
  c.lineCap = 'round';
  c.strokeStyle = METRO.colours.Blue; c.lineWidth = 14; c.beginPath(); c.moveTo(bx(0), cy); c.lineTo(bx(B.length - 1), cy); c.stroke();
  c.strokeStyle = METRO.colours.Green; c.beginPath(); c.moveTo(bx(2), gy(0)); c.lineTo(bx(2), gy(G.length - 1)); c.stroke();
  const stationAt = (name) => { const bi = B.indexOf(name), gi = G.indexOf(name); return bi >= 0 ? [bx(bi), cy] : [bx(2), gy(gi)]; };
  for (const name of new Set([...B, ...G])) {
    const [sx, sy] = stationAt(name), interchange = B.includes(name) && G.includes(name), here = name === game.metro.station;
    c.beginPath(); circ(c, sx, sy, interchange ? 18 : 12); fs(c, '#fff', '#2c2c34', 4);
    c.fillStyle = '#2c2c34'; c.font = (here || name === METRO.goal ? '700 ' : '600 ') + '18px Georgia, serif';
    const below = B.includes(name) && !interchange, lx = below ? sx : sx + 30, ly2 = below ? sy + 40 : interchange ? sy - 26 : sy + 6;
    c.textAlign = below ? 'center' : 'left'; c.fillText(name, lx, ly2);
    if (name === METRO.goal) { c.font = 'italic 600 14px Georgia, serif'; c.fillStyle = '#8a5a2a'; c.fillText('buses to the Old Bridge', lx, ly2 + 20); }
    if (here) { c.fillStyle = '#c9402f'; c.beginPath(); c.moveTo(sx, sy - 22); c.lineTo(sx - 12, sy - 44); c.lineTo(sx + 12, sy - 44); c.closePath(); c.fill(); c.font = 'italic 700 15px Georgia, serif'; c.textAlign = 'center'; c.fillText('You are here', sx, sy - 52); }
  }
  c.textAlign = 'left'; c.fillStyle = '#2c2c34'; c.font = '600 16px Georgia, serif';
  rrect(c, x + 40, y + 92, 14, 14, 3); fs(c, METRO.colours.Blue); c.fillStyle = '#2c2c34'; c.fillText('Blue line', x + 62, y + 104);
  rrect(c, x + 40, y + 118, 14, 14, 3); fs(c, METRO.colours.Green); c.fillStyle = '#2c2c34'; c.fillText('Green line', x + 62, y + 130);
  c.fillText('Big circle: change trains here', x + 590, y + h - 48);
  c.restore();
}
function drawTreasureMap(c, t) {
  const w = 760, h = 440, x = camX + VW / 2 - w / 2, y = 150; parchment(c, x, y, w, h);
  c.save(); c.translate(x, y); c.textAlign = 'center';
  c.fillStyle = '#5a3a1e'; c.font = 'italic 700 32px Georgia, serif'; c.fillText('The Treasure Trail', w / 2, 50);
  const stops = [[90, 340, 'home'], [240, 300, 'the city'], [420, 260, 'Old Bridge'], [560, 200, 'the forest'], [660, 300, 'X']];
  c.strokeStyle = '#8a5a2a'; c.lineWidth = 4; c.setLineDash([10, 9]); c.lineDashOffset = -t * 20; c.beginPath(); stops.forEach(([sx, sy], i) => (i ? c.lineTo(sx, sy) : c.moveTo(sx, sy))); c.stroke(); c.setLineDash([]);
  for (const [sx, sy, name] of stops) { if (name === 'X') { c.strokeStyle = '#c9302a'; c.lineWidth = 7; c.beginPath(); c.moveTo(sx - 14, sy - 14); c.lineTo(sx + 14, sy + 14); c.moveTo(sx + 14, sy - 14); c.lineTo(sx - 14, sy + 14); c.stroke(); continue; } ell(c, sx, sy, 9, 9, '#8a5a2a'); c.fillStyle = '#5a3a1e'; c.font = 'italic 18px Georgia, serif'; c.fillText(name, sx, sy + 34); }
  c.fillStyle = '#5a3a1e'; c.font = 'italic 17px Georgia, serif'; c.fillText('"Cross the city to the Old Bridge. Beyond it, the forest trail begins."', w / 2, h - 40);
  if (game.pieces.gust) [[0, 0], [w / 2, 0], [0, h / 2], [w / 2, h / 2]].forEach(([qx, qy], i) => {
    if (game.pieces.got[i]) return;
    c.fillStyle = 'rgba(40,25,15,.82)'; c.fillRect(qx + 4, qy + 4, w / 2 - 8, h / 2 - 8); c.strokeStyle = '#d9b977'; c.setLineDash([8, 8]); c.lineWidth = 2; c.strokeRect(qx + 10, qy + 10, w / 2 - 20, h / 2 - 20); c.setLineDash([]);
    c.fillStyle = '#d9b977'; c.font = 'italic 700 28px Georgia, serif'; c.fillText('missing piece', qx + w / 4, qy + h / 4 + 10);
  });
  c.restore();
}

// ---------- hints, cards and the frame
function drawUI(c, t) {
  for (const p of players) {
    if (game.exitT >= 0 || game.chapter > 0 || p.plane === 'bus' || p.plane === 'train' || (game.bubble && game.bubble.who === p)) continue;
    if (p.plane === 'hut') { const hx = BRIDGE.hut - 30; hintAt(c, hx, BASE - 330, p.glyph[0], game.bridge.power ? 'Lower the bridge' : 'Press the buttons', p.col); hintAt(c, hx, BASE - 290, p.glyph[1], 'Come out', p.col); continue; }
    const th = nearThing(p, null); if (!th) continue;
    hintAt(c, p.x, p.y - p.headH * HC * p.scale - 14, p.glyph[th.key === 'up' ? 0 : 1], th.label(p), p.col);
  }
  for (const h of game.honks) { c.save(); c.globalAlpha = 1 - h.t; c.fillStyle = '#fff3b8'; c.strokeStyle = '#4a0e0a'; c.lineWidth = 5; c.font = 'italic 900 44px Georgia, serif'; c.textAlign = 'center'; c.strokeText('HONK!', h.x, h.y - h.t * 40); c.fillText('HONK!', h.x, h.y - h.t * 40); c.restore(); }
  drawBubble(c);
  if (game.panel) { c.save(); c.globalAlpha = Math.min(1, game.panel.t * 5); ({ routes: drawRouteMap, metro: drawMetroMap, treasure: drawTreasureMap })[game.panel.kind](c, t); c.restore(); }
  drawGoal(c);
  if (game.pieces.gust && piecesGot() < 4 && !game.done) {
    const x = camX + 24, y = 78; c.save(); rrect(c, x, y, 250, 40, 10); fs(c, 'rgba(255,248,230,.94)', '#8a6a3a', 2);
    c.fillStyle = '#8a5a2a'; c.font = 'italic 700 15px Georgia, serif'; c.fillText('MAP PIECES', x + 14, y + 26);
    game.pieces.got.forEach((g, i) => { if (g) drawPiece(c, x + 140 + i * 28, y + 20, 0.2 * (i - 1), false, 0); else { rrect(c, x + 128 + i * 28, y + 9, 24, 22, 3); c.strokeStyle = '#b9a07a'; c.setLineDash([3, 3]); c.lineWidth = 1.5; c.stroke(); c.setLineDash([]); } });
    c.restore();
  }
}
function drawCards(c, t) {
  if (game.chapter > 0) chapterCard(c, camX, game.chapter, 4.6, 'Chapter Two', 'Across the City', 'The map leads to the Old Bridge, on the far side of town...');
  if (game.fade) {
    const f = game.fade, a = Math.min(1, f.t / 0.6, (f.dur - f.t) / 0.6); c.fillStyle = `rgba(28,18,10,${a * 0.92})`; c.fillRect(camX - 10, 0, VW + 20, VH);
    c.save(); c.globalAlpha = a; c.textAlign = 'center'; c.fillStyle = '#fbf0d4'; c.font = 'italic 700 40px Georgia, serif'; c.fillText(f.text, camX + VW / 2, VH / 2 - 10); c.fillStyle = '#c9b48a'; c.font = 'italic 22px Georgia, serif'; c.fillText(f.sub, camX + VW / 2, VH / 2 + 40); c.restore();
  }
  if (game.done) {
    const a = Math.min(1, game.endT); c.fillStyle = `rgba(28,18,10,${a * 0.8})`; c.fillRect(camX - 10, 0, VW + 20, VH);
    c.save(); c.globalAlpha = a; const w = 760, h = 330, x = camX + VW / 2 - w / 2, y = VH / 2 - h / 2; parchment(c, x, y, w, h); c.textAlign = 'center';
    c.fillStyle = '#8a5a2a'; c.font = 'italic 24px Georgia, serif'; c.fillText('Chapter Two complete', x + w / 2, y + 62);
    c.fillStyle = '#3a2618'; c.font = 'italic 700 52px Georgia, serif'; c.fillText('Across the City', x + w / 2, y + 128);
    c.font = 'italic 21px Georgia, serif'; c.fillText('Over the Old Bridge and through the gates of Forest Park.', x + w / 2, y + 182); c.fillText('The treasure trail goes on into the forest...', x + w / 2, y + 212);
    if (game.endT > 1.2) { c.globalAlpha = a * (0.6 + Math.sin(t * 4) * 0.4); c.fillStyle = '#6d7b45'; c.font = '700 21px Georgia, serif'; c.fillText('Press W or ↑ to follow the trail', x + w / 2, y + 276); }
    c.restore();
  }
}
const bg = mkBuf(), CHUNK = 640, chunks = new Map(); let chunkS = 0;
function streetChunk(i) {
  if (chunkS !== S) { chunks.clear(); chunkS = S; }
  let cvs = chunks.get(i); if (cvs) return cvs;
  cvs = document.createElement('canvas'); cvs.width = Math.ceil(CHUNK * S) + 2; cvs.height = Math.ceil(VH * S);
  const g = cvs.getContext('2d'); g.setTransform(S, 0, 0, S, -i * CHUNK * S, 0); g.lineCap = 'round'; g.lineJoin = 'round';
  const keep = VIEW; VIEW = [i * CHUNK, (i + 1) * CHUNK];
  paintStill(g);
  VIEW = keep; chunks.set(i, cvs);
  if (chunks.size > 14) { let far = null, fd = -1; for (const k of chunks.keys()) { const d = Math.abs(k - i); if (d > fd) { fd = d; far = k; } } chunks.delete(far); }
  return cvs;
}
function paintStill(c) { // everything along the street that never moves
  for (const [g0, g1, kind] of GAPS) drawGap(c, g0, g1, kind);
  drawBuildings(c); drawGround(c); staticTraffic(c); staticProps(c); staticMetro(c);
}
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
  update(dt);
  const b = game.bus, onBus = b.ride && b.riders.length === 2;
  if (inMetro()) { // underground: the platform scene or the ride
    const mm = game.metro.ride ? PLAT_W / 2 : (sis.x + bro.x) / 2, tgt = VW >= PLAT_W ? (PLAT_W - VW) / 2 : Math.max(0, Math.min(PLAT_W - VW, mm - VW / 2));
    camX = game.metro.ride ? tgt : camX + (tgt - camX) * Math.min(1, dt * 3);
    ctx.setTransform(S, 0, 0, S, -camX * S, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.textAlign = 'left';
    VIEW = [camX, camX + VW];
    if (game.metro.ride) drawRide(ctx, t); else drawMetro(ctx, t);
    drawSparks(ctx);
    const v2 = ctx.createRadialGradient(camX + VW / 2, VH / 2, VH * 0.5, camX + VW / 2, VH / 2, VH * 1.2); v2.addColorStop(0, 'rgba(30,20,15,0)'); v2.addColorStop(1, 'rgba(30,20,15,.35)'); ctx.fillStyle = v2; ctx.fillRect(camX - 10, 0, VW + 20, VH);
    drawUI(ctx, t); drawCards(ctx, t);
    requestAnimationFrame(frame); return;
  }
  const vis = players.filter((p) => p.plane !== 'bus'), mid = onBus ? b.x + 300 : vis.length ? vis.reduce((s, p) => s + p.x, 0) / vis.length : BUS.stop;
  const target = Math.max(0, Math.min(CITY.length - VW, mid - VW / 2));
  camX += (target - camX) * Math.min(1, dt * (onBus ? 6 : 3));
  if (ZOOM > 1) { const k = S * ZOOM, zx = mid - VW / (2 * ZOOM), zy = Math.max(0, Math.min(VH - VH / ZOOM, FEET - 140 - VH / (2 * ZOOM))); ctx.setTransform(k, 0, 0, k, -zx * k, -zy * k); }
  else ctx.setTransform(S, 0, 0, S, -camX * S, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.textAlign = 'left';
  if (ZOOM > 1) { VIEW = [camX, camX + VW / ZOOM]; drawSky(ctx, t); paintStill(ctx); }
  else {
    VIEW = [camX, camX + VW];
    // the soft sky and far skyline are painted at half resolution, then stretched
    const half = S / 2, bw = Math.ceil(VW * half), bh = Math.ceil(VH * half); if (bg.cv.width !== bw || bg.cv.height !== bh) { bg.cv.width = bw; bg.cv.height = bh; }
    bg.c.setTransform(half, 0, 0, half, -camX * half, 0); drawSky(bg.c, t, half); ctx.drawImage(bg.cv, camX, 0, bg.cv.width / half, VH);
    for (let i = Math.floor(camX / CHUNK); i * CHUNK < camX + VW; i++) { const ch = streetChunk(i); ctx.drawImage(ch, i * CHUNK, 0, ch.width / S, VH); }
  }
  drawWarehouse(ctx, t); drawRoadworks(ctx); liveWater(ctx, t); liveTraffic(ctx, t); liveProps(ctx, t);
  drawCars(ctx, false); drawPup(ctx, t);
  for (const p of players) if (p.plane === 'street') drawSib(p, t);
  livePieces(ctx, t);
  drawCars(ctx, true);
  drawBus(ctx, t);
  drawLampGlow(ctx, t); drawSparks(ctx);
  ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,205,135,.14)'; ctx.fillRect(camX - 10, 0, VW + 20, VH); ctx.globalCompositeOperation = 'source-over';
  const v = ctx.createRadialGradient(camX + VW / 2, VH / 2, VH * 0.5, camX + VW / 2, VH / 2, VH * 1.2); v.addColorStop(0, 'rgba(50,30,15,0)'); v.addColorStop(1, 'rgba(50,30,15,.3)'); ctx.fillStyle = v; ctx.fillRect(camX - 10, 0, VW + 20, VH);
  drawUI(ctx, t); drawCards(ctx, t);
  requestAnimationFrame(frame);
}
addEventListener('resize', resizeScreen); resizeScreen();

// ---------- test shortcuts (?stage=...) and start
const place = (x1, x2) => { sis.x = x1; bro.x = x2; for (const p of players) p.safeX = p.x; camX = Math.max(0, (x1 + x2) / 2 - VW / 2); };
const allPieces = (n = 4) => { const pc = game.pieces; pc.gust = true; pc.fly = [0, 1, 2, 3].map(() => ({ u: 1, x0: 0, y0: 0, x1: 0, y1: 0, dur: 1 })); PIECES.spots.forEach((sp, i) => { pc.fly[i].x1 = sp.x; pc.fly[i].y1 = sp.y; }); for (let i = 0; i < n; i++) pc.got[i] = true; if (n >= 4) game.pup.caught = true, game.pup.mode = 'happy'; };
if (STAGE === 'pieces') { place(700, 780); allPieces(0); }
if (STAGE === 'crossing') { place(1700, 1760); allPieces(3); }
if (STAGE === 'alley') { place(2700, 2800); allPieces(3); }
if (STAGE === 'yard') { place(2860, 2960); allPieces(3); game.shutter = 1; enterYard(bro, 3100); }
if (STAGE === 'market') { place(3900, 3960); allPieces(3); game.gateOpen = true; }
if (STAGE === 'canal') { place(5000, 5100); allPieces(); game.gateOpen = true; }
if (STAGE === 'avenue') { place(6700, 6780); allPieces(); game.gateOpen = true; }
if (STAGE === 'metro') { place(8150, 8230); allPieces(); game.gateOpen = true; }
if (STAGE === 'platform') { place(8250, 8330); allPieces(); game.gateOpen = true; goDownMetro(sis); }
if (STAGE === 'ride') { place(8250, 8330); allPieces(); game.gateOpen = true; goDownMetro(sis); for (const q of players) q.plane = 'train'; game.metro.ride = { line: 'Blue', dir: 1, at: 'Grand Avenue', from: 'Grand Avenue', state: 'moving', t: 1 }; }
if (STAGE === 'bus') { place(14300, 14380); allPieces(); game.gateOpen = true; }
if (STAGE === 'bridge' || STAGE === 'end') { place(17250, 17350); allPieces(); game.gateOpen = true; game.bus.arrived = true; game.bus.state = 'off'; game.bus.x = 1e6; }
if (STAGE === 'end') { game.bridge.down = true; game.bridge.angle = 0; place(18900, 18980); }
if (QS.get('panel')) openPanel(QS.get('panel'), sis);
if (SKIP) intro();
requestAnimationFrame((tm) => { last = tm; frame(tm); });

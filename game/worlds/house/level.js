'use strict';
// Level 1, "Home Alone": the siblings are locked in the house and must find the spare key to get out.
// Sister (hooded traveller) is tall: she can reach Dad's box on top of the bookcase.
// Brother is small: only he fits in the dark cupboard under the stairs, where he switches on the light and finds the box code.
// The shared play code is in shared/stage.js; the layout numbers are in worlds/house/settings.js.
// Test stages: ?stage=cupboard | bulb | lock | door | open | end jumps ahead in the puzzle.
const CLIMB_TIME = 1.7;
const bake = mkBuf();
const BAKE_X0 = -380, BAKE_X1 = 2300; // the still parts of the scene are painted once into "bake", wide enough for very wide screens
let BS = 1;

// ---------- painting the still parts once
// The city outside: an evening skyline in three layers, with lit windows
const hash = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
const CITY = [
  { base: 0, h: [230, 470], w: [60, 130], body: ['#cdbfc8', '#c2b4c2'], lit: 0.12, litCol: 'rgba(255,236,190,.55)', dark: 'rgba(255,255,255,.14)', haze: 'rgba(240,214,196,.35)' },
  { base: 30, h: [150, 360], w: [70, 150], body: ['#a495a6', '#978a9e', '#ab9a9e'], lit: 0.3, litCol: '#ffe3a0', dark: 'rgba(70,58,80,.35)', haze: 'rgba(240,210,190,.22)' },
  { base: 80, h: [110, 290], w: [90, 170], body: ['#7d6670', '#6f6478', '#87706a', '#6a5e6e'], lit: 0.42, litCol: '#ffd987', dark: 'rgba(40,30,45,.45)', haze: null },
];
function cityLayer(c, L, li, x0, x1, base, sc) {
  let x = x0 - 120 * sc, i = 0;
  while (x < x1 + 40 * sc) {
    const id = li * 1000 + i++, bw = (L.w[0] + hash(id, 1) * (L.w[1] - L.w[0])) * sc, bh = (L.h[0] + hash(id, 2) * (L.h[1] - L.h[0])) * sc, top = base - bh;
    c.fillStyle = L.body[Math.floor(hash(id, 3) * L.body.length)]; c.fillRect(x, top, bw, bh + 2);
    c.fillStyle = 'rgba(255,225,190,.18)'; c.fillRect(x + bw - 6 * sc, top, 6 * sc, bh); // sunlit edge
    c.fillStyle = 'rgba(30,20,40,.18)'; c.fillRect(x, top, 5 * sc, bh);
    const roof = hash(id, 4);
    if (roof < 0.25) { c.fillStyle = L.body[0]; c.fillRect(x + bw * 0.2, top - 16 * sc, bw * 0.3, 16 * sc); }
    else if (roof < 0.4) { c.strokeStyle = L.body[1] || L.body[0]; c.lineWidth = 2 * sc; c.beginPath(); c.moveTo(x + bw * 0.6, top); c.lineTo(x + bw * 0.6, top - 40 * sc); c.stroke(); }
    else if (roof < 0.5 && li % 3 === 2) { const tx = x + bw * 0.55; c.fillStyle = '#5a4a52'; c.fillRect(tx, top - 30 * sc, 26 * sc, 22 * sc); c.fillRect(tx + 3 * sc, top - 8 * sc, 3 * sc, 8 * sc); c.fillRect(tx + 20 * sc, top - 8 * sc, 3 * sc, 8 * sc); c.beginPath(); c.moveTo(tx - 2 * sc, top - 30 * sc); c.lineTo(tx + 13 * sc, top - 40 * sc); c.lineTo(tx + 28 * sc, top - 30 * sc); c.fill(); }
    // windows
    const far = li % 3 === 0, gx = (far ? 16 : 22) * sc, gy = (far ? 22 : 30) * sc, ww = (far ? 7 : 10) * sc, wh = (far ? 10 : 14) * sc;
    const cols = Math.max(1, Math.floor((bw - 12 * sc) / gx)), off = (bw - cols * gx) / 2 + (gx - ww) / 2;
    for (let r = 0, y = top + 18 * sc; y + wh < base - 14 * sc; y += gy, r++) for (let k = 0; k < cols; k++) {
      const on = hash(id * 31 + r, k + 7) < L.lit; c.fillStyle = on ? L.litCol : L.dark; c.fillRect(x + off + k * gx, y, ww, wh);
    }
    x += bw + (hash(id, 5) < 0.3 ? 8 * sc : 0);
  }
  if (L.haze) { c.fillStyle = L.haze; c.fillRect(x0 - 200, base - 600 * sc, x1 - x0 + 400, 600 * sc + 4); }
}
function citySky(c, x0, y0, x1, y1) {
  c.fillStyle = lg(c, 0, y0, 0, y1, '#9fb4d4', '#d6c3c6', '#f2cfa8', '#f8dfb6'); c.fillRect(x0, y0, x1 - x0, y1 - y0);
}
function outsideView(c, x0, y0, x1, y1, groundY) {
  const sc = (y1 - y0) / 640;
  citySky(c, x0, y0, x1, y1);
  c.fillStyle = rg(c, x1, groundY - 40 * sc, (x1 - x0) * 1.1, 'rgba(255,236,190,.8)', 'rgba(255,236,190,0)'); c.fillRect(x0, y0, x1 - x0, y1 - y0);
  CITY.forEach((L, li) => cityLayer(c, L, li + 3, x0, x1, groundY + (L.base - 80) * sc, sc));
  c.fillStyle = lg(c, 0, groundY, 0, y1, '#b7aea6', '#958c84'); c.fillRect(x0, groundY, x1 - x0, y1 - groundY);
}
function room(c, r) {
  const fl = FLOOR[r.f], ce = CEIL[r.f];
  c.fillStyle = texture(c, H(r.wp)); c.fillRect(r.x0, ce, r.x1 - r.x0, fl - ce);
  // wainscot panels and rail
  const wy = fl - 118; c.fillStyle = lg(c, 0, wy, 0, fl, '#a2744b', '#7c5436'); c.fillRect(r.x0, wy, r.x1 - r.x0, 118);
  for (let x = r.x0 + 14; x < r.x1 - 60; x += 92) { rrect(c, x, wy + 18, 76, 74, 4); c.strokeStyle = 'rgba(58,36,22,.55)'; c.lineWidth = 2; c.stroke(); c.strokeStyle = 'rgba(230,190,140,.35)'; c.beginPath(); c.moveTo(x + 2, wy + 20); c.lineTo(x + 74, wy + 20); c.stroke(); }
  rrect(c, r.x0, wy - 8, r.x1 - r.x0, 12, 2); fs(c, lg(c, 0, wy - 8, 0, wy + 4, '#c99a69', '#8f6644'), '#3a2618', 1.5);
  // crown moulding and shadow under the ceiling
  c.fillStyle = lg(c, 0, ce, 0, ce + 90, 'rgba(60,38,20,.35)', 'rgba(60,38,20,0)'); c.fillRect(r.x0, ce, r.x1 - r.x0, 90);
  rrect(c, r.x0, ce, r.x1 - r.x0, 14, 2); fs(c, lg(c, 0, ce, 0, ce + 14, '#fbf6ea', '#d9cfb8'), '#8a7a5a', 1.4);
  // darker corners where the room meets the walls
  for (const [ex, dx] of [[r.x0, 1], [r.x1, -1]]) { c.fillStyle = lg(c, ex, 0, ex + dx * 70, 0, 'rgba(50,30,15,.28)', 'rgba(50,30,15,0)'); c.fillRect(dx > 0 ? ex : ex - 70, ce, 70, fl - ce); }
  // floor
  c.fillStyle = texture(c, H('floor')); c.fillRect(r.x0, fl - 14, r.x1 - r.x0, 28);
  c.fillStyle = lg(c, 0, fl - 14, 0, fl + 14, 'rgba(255,235,190,.18)', 'rgba(40,25,10,.25)'); c.fillRect(r.x0, fl - 14, r.x1 - r.x0, 28);
}
function partition(c, x, f) {
  const fl = FLOOR[f], ce = CEIL[f], top = fl - 300;
  c.fillStyle = lg(c, x - 14, 0, x + 14, 0, '#d9ccb0', '#f2ead7', '#d9ccb0'); c.fillRect(x - 14, ce, 28, top - ce);
  c.strokeStyle = '#8a7a5a'; c.lineWidth = 1.5; c.strokeRect(x - 14, ce, 28, top - ce);
  for (const s of [-1, 1]) { rrect(c, x + s * 14 - (s > 0 ? 0 : 10), top, 10, fl - top, 2); fs(c, lg(c, 0, 0, 10, 0, '#c99a69', '#8f6644'), '#3a2618', 1.5); }
  rrect(c, x - 26, top - 10, 52, 14, 3); fs(c, lg(c, 0, top - 10, 0, top + 4, '#d4a978', '#8f6644'), '#3a2618', 1.6);
}
function paintBake() {
  const c = bake.c;
  c.setTransform(BS, 0, 0, BS, -BAKE_X0 * BS, 0); c.lineCap = 'round'; c.lineJoin = 'round';
  // evening sky, the city skyline and the street around the house
  citySky(c, BAKE_X0, 0, BAKE_X1, VH);
  c.fillStyle = rg(c, 1750, 760, 1000, 'rgba(255,232,180,.95)', 'rgba(255,222,170,.4)', 'rgba(255,222,170,0)'); c.fillRect(BAKE_X0, 0, BAKE_X1 - BAKE_X0, VH);
  c.globalAlpha = 0.8; [[-200, 120, 0.9], [420, 70, 0.7], [1180, 110, 0.8], [2000, 60, 1]].forEach(([x, y, s], i) => put(c, SP.clouds[i % SP.clouds.length], x, y, s)); c.globalAlpha = 1;
  CITY.forEach((L, li) => cityLayer(c, L, li, BAKE_X0, BAKE_X1, 905 + L.base, 1));
  // pavement, kerb and road
  c.fillStyle = lg(c, 0, 985, 0, VH, '#c2b9ae', '#a9a095', '#8f877e'); c.fillRect(BAKE_X0, 985, BAKE_X1 - BAKE_X0, VH - 985);
  c.strokeStyle = 'rgba(90,80,72,.35)'; c.lineWidth = 2; c.beginPath(); for (let x = BAKE_X0; x < BAKE_X1; x += 64) { c.moveTo(x, 1000); c.lineTo(x - 14, 1042); } c.stroke();
  c.fillStyle = '#d6cec2'; c.fillRect(BAKE_X0, 1042, BAKE_X1 - BAKE_X0, 8); c.fillStyle = lg(c, 0, 1050, 0, VH, '#5c5862', '#45424b'); c.fillRect(BAKE_X0, 1050, BAKE_X1 - BAKE_X0, VH - 1050);
  // little front garden hedges and street lamps
  for (const [x, i] of [[-40, 0], [1950, 3], [2120, 1]]) put(c, SP.bushes[i % SP.bushes.length], x, 1004, 0.7);
  for (const x of [-250, 2060, 2260]) {
    c.fillStyle = '#3c3a40'; c.fillRect(x - 5, 790, 10, 252); c.fillRect(x - 12, 1030, 24, 12);
    c.beginPath(); c.moveTo(x, 792); c.quadraticCurveTo(x, 770, x + 28, 770); c.strokeStyle = '#3c3a40'; c.lineWidth = 6; c.stroke();
    rrect(c, x + 18, 770, 24, 16, 4); fs(c, '#3c3a40', '#24222a', 1.5); c.beginPath(); c.ellipse(x + 30, 790, 9, 6, 0, 0, TAU); c.fillStyle = '#ffe9b0'; c.fill();
    soft(c, x + 30, 795, 70, 60, '#ffe1a0', 0.5);
  }
  // roof with chimney (the smoke is drawn live)
  c.fillStyle = texture(c, H('brick')); c.fillRect(1418, 46, 64, 110); c.strokeStyle = '#4c2318'; c.lineWidth = 2; c.strokeRect(1418, 46, 64, 110);
  rrect(c, 1408, 36, 84, 16, 3); fs(c, '#8b8577', '#4c4a44', 2);
  const roof = () => { c.beginPath(); c.moveTo(24, 206); c.lineTo(960, 22); c.lineTo(1896, 206); c.closePath(); };
  roof(); c.fillStyle = texture(c, H('roof')); c.fill(); c.fillStyle = lg(c, 0, 22, 0, 206, 'rgba(255,220,180,.12)', 'rgba(40,15,10,.25)'); c.fill();
  c.lineWidth = 14; c.strokeStyle = '#3a2618'; c.beginPath(); c.moveTo(18, 210); c.lineTo(960, 18); c.lineTo(1902, 210); c.stroke(); c.lineWidth = 9; c.strokeStyle = '#f2ead7'; c.stroke();
  c.beginPath(); circ(c, 960, 128, 36); c.save(); c.clip(); outsideView(c, 920, 90, 1000, 170, 166); c.restore(); c.beginPath(); circ(c, 960, 128, 36); c.lineWidth = 9; c.strokeStyle = '#f2ead7'; c.stroke(); c.lineWidth = 3; c.strokeStyle = '#3a2618'; c.beginPath(); c.moveTo(924, 128); c.lineTo(996, 128); c.moveTo(960, 92); c.lineTo(960, 164); c.stroke();
  // rooms
  c.fillStyle = '#4a2f1e'; c.fillRect(80, 190, 1800, 810);
  for (const r of ROOMS) room(c, r);
  // windows show the city
  for (const [art, x, y, s] of WINDOWS) { c.save(); c.beginPath(); c.rect(x - 78 * s, y - 224 * s, 156 * s, 208 * s); c.clip(); outsideView(c, x - 80 * s, y - 226 * s, x + 80 * s, y - 14 * s, y - 40 * s); c.restore(); }
  // the front doorway and fanlight show the city too (the door itself is drawn live, it opens)
  c.save(); c.beginPath(); c.rect(DOOR_X - 78, FLOOR[0] - 292, 156, 294); c.moveTo(DOOR_X + 78, FLOOR[0] - 312); c.arc(DOOR_X, FLOOR[0] - 312, 78, 0, Math.PI, true); c.clip();
  outsideView(c, DOOR_X - 80, FLOOR[0] - 392, DOOR_X + 80, FLOOR[0] + 2, FLOOR[0] - 70);
  c.fillStyle = lg(c, 0, FLOOR[0] - 60, 0, FLOOR[0], '#b7aea6', '#cfc6ba'); c.beginPath(); c.moveTo(DOOR_X - 30, FLOOR[0] - 60); c.lineTo(DOOR_X + 30, FLOOR[0] - 60); c.lineTo(DOOR_X + 78, FLOOR[0]); c.lineTo(DOOR_X - 78, FLOOR[0]); c.fill(); c.restore();
  for (const [art, x, y, s] of WINDOWS) put(c, H(art), x, y, s);
  partition(c, 760, 0); partition(c, 880, 1);
  for (const [art, x, y, s, f] of FURNITURE) put(c, H(art), x, y, s, f || 1);
  put(c, H('doorFrame'), DOOR_X, FLOOR[0] + 2);
  // floor between the storeys, seen cut through, and the stone foundation
  c.fillStyle = lg(c, 0, 542, 0, 572, '#5b3b25', '#3a2416'); c.fillRect(80, 542, 1800, 30);
  for (let x = 100; x < 1860; x += 120) { rrect(c, x, 546, 22, 22, 2); fs(c, '#7c5436', '#2a180c', 1.2); }
  c.fillStyle = texture(c, H('stone')); c.fillRect(70, 1002, 1820, 80); c.fillStyle = 'rgba(30,20,10,.25)'; c.fillRect(70, 1002, 1820, 8);
  // the outer walls, cut through
  for (const x of [80, 1850]) { c.fillStyle = texture(c, H('brick')); c.fillRect(x, 190, 30, 812); c.strokeStyle = '#3a2618'; c.lineWidth = 2.5; c.strokeRect(x, 190, 30, 812); }
  c.fillStyle = '#3a2618'; c.fillRect(80, 186, 1800, 14);
}

// ---------- the parts that change
const game = {
  t0: 0, chapter: SKIP ? 0 : 4.2, objective: '', box: 'shelf', keyHolder: -1, codeSeen: false, codeT: 0,
  doorOpen: 0, doorOpening: false, exitT: -1, done: false, endT: 0, panel: null, lock: null,
  code: [], smoke: [], sparks: [], queue: [], bubble: null, bulb: false, bulbT: 0,
};
{ const pool = [0, 1, 2, 3, 4, 5]; for (let i = 0; i < 3; i++) game.code.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]); }
const snd = (name, k) => { if (typeof sfx === 'function') sfx(name, k); }; // sounds, from shared/sound.js
if (typeof SOUND !== 'undefined') { SOUND.wantMusic = true; SOUND.area = 'home'; }
const players = [makePlayer('sister', 900, FLOOR[0], 1), makePlayer('brother', 1060, FLOOR[0], -1)];
for (const p of players) p.floor = 0;
const [sis, bro] = players;


// Things the siblings can use. key: which button ('up' or 'down'). Each returns a label for the on-screen hint, or null.
const flavour = (s, b) => (p) => { snd('tap'); sayNow(p, p === sis ? s : b); };
const THINGS = [
  { f: 0, x: 200, r: 95, key: 'up', label: () => 'Read the note', act: (p) => openPanel('note', p, 200) },
  { f: 0, x: 960, r: 110, key: 'up', label: () => 'Look at the map', act: (p) => openPanel('map', p, 960) },
  { f: 0, x: 440, r: 100, key: 'up', label: () => 'Search the kitchen', act: flavour('Just biscuits and teabags. No key in here.', 'Biscuits! ...but no key.') },
  { f: 0, x: 1592, r: 55, key: 'up', label: () => 'Search the coats', act: flavour("Mum's coat is gone, and her keys with it.", 'Only Dad\'s old hat. No key.') },
  { f: 0, x: STAIRS.x0, r: 60, key: 'up', label: () => 'Go upstairs', act: (p) => startClimb(p, 1) },
  { f: 1, x: STAIRS.x1, r: 60, key: 'down', label: () => 'Go downstairs', act: (p) => startClimb(p, -1) },
  { f: 0, x: CUP_DOOR, r: 58, key: 'down', label: (p) => (p === bro ? 'Crawl inside' : 'Look inside'), act: (p) => enterCupboard(p) },
  { f: 0, x: DOOR_X, r: 80, key: 'up', label: (p) => (game.doorOpen >= 1 ? null : game.keyHolder === players.indexOf(p) ? 'Unlock the door' : 'Try the door'), act: (p) => useDoor(p) },
  { f: 1, x: BOOKCASE_X, r: 95, key: 'up', label: (p) => (game.box === 'shelf' ? 'Reach for the box' : game.box === 'held' && p === sis ? 'Open the box' : 'Look at the books'), act: (p) => (game.box === 'held' && p === sis ? openLock(p) : useBookcase(p)) },
  { f: 1, x: 1030, r: 110, key: 'up', label: () => "Search Dad's desk", act: flavour('Bills, a globe and a feather pen. No key.', 'A globe! I wish we were going round the world.') },
  { f: 1, x: 470, r: 75, key: 'up', label: () => 'Search the toy chest', act: flavour('Your old toys. Still no key.', 'My sword! Not now... we need that key.') },
  { f: 1, x: 255, r: 105, key: 'up', label: () => 'Check the bed', act: flavour('My bed. Nothing under the pillow.', "Your bed. Can't see a key.") },
  { f: 1, x: 690, r: 105, key: 'up', label: () => 'Check the bed', act: flavour('Your bed is a mess!', 'My bed! Mr. Bear has not seen the key.') },
];
function nearThing(p, key) {
  let best = null, bd = 1e9;
  for (const th of THINGS) { if (th.f !== p.floor || (key && th.key !== key)) continue; const d = Math.abs(p.x - th.x); if (d < th.r && d < bd && th.label(p)) { best = th; bd = d; } }
  return best;
}

function openPanel(kind, p, x) {
  if (game.panel && game.panel.kind === kind) { game.panel = null; return; }
  game.panel = { kind, user: p, x, t: 0 }; snd('paper');
  if (kind === 'map' && !game.sawMap) { game.sawMap = true; say(bro, 'First across the city... then past the falling water, under the old oak. That is where the X is!'); }
  if (kind === 'note' && !game.readNote) { game.readNote = true; say(sis, '"Don\'t touch Dad\'s secret box"... so there IS a secret box!'); say(bro, 'Bet the spare key is in it!'); }
}
function startClimb(p, dir) { p.climb = { dir, t: 0, step: -1 }; game.panel = null; }
function enterCupboard(p) {
  if (p === sis) { snd('no'); sayNow(sis, "It's tiny! I'm way too big to fit in there."); return; }
  snd('creak'); snd('hop'); p.inside = true; p.x = CUP_DOOR - 20; p.dir = -1;
  if (!game.cupboardSeen) { game.cupboardSeen = true; sayNow(bro, "It's so dark in here! There must be a light somewhere..."); }
}
const nearCord = (p) => p.inside && !game.bulb && Math.abs(p.x - BULB.x) < 42;
function pullCord(p) { game.bulb = true; game.bulbT = 0; p.cheer = 0.4; snd('click'); snd('spark'); sayNow(p, 'Click! Light!'); }
function leaveCupboard(p) { snd('creak'); p.inside = false; p.x = CUP_DOOR; p.dir = 1; }
function useBookcase(p) {
  if (game.box !== 'shelf') { flavour("Dad's books. Very serious.", 'So many books. No pictures.')(p); return; }
  if (p === bro) { snd('no'); sayNow(bro, "There's a box up there, but it's way too high for me!"); return; }
  game.box = 'held'; p.cheer = 0.5; snd('piece'); burst(BOOKCASE_X, BOX_Y + 20, 5);
  sayNow(sis, "Dad's secret box! It's locked with a picture code.");
  if (game.codeSeen) say(bro, 'I know the code! I saw it in the cupboard!');
  else say(sis, 'The code must be written down somewhere... somewhere hidden.');
  objective(game.codeSeen ? 'Open the box: Brother, tell Sister the three pictures.' : 'Find the box code. It is hidden somewhere dark.');
}
function useDoor(p) {
  const i = players.indexOf(p);
  if (game.keyHolder === i) { snd('latch'); snd('door'); snd('great'); game.keyHolder = -1; game.doorOpening = true; sayNow(p, 'Click! It opened!'); say(bro, 'Treasure hunt, here we come!'); objective('Go outside together.'); burst(DOOR_X, FLOOR[0] - 150, 10); return; }
  snd('rattle');
  if (game.keyHolder >= 0) sayNow(p, 'Locked. ' + players[game.keyHolder].name + ' has the key!');
  else sayNow(p, p === sis ? 'Locked tight. We need the spare key.' : "It won't budge! We need the key.");
}

// ---------- the code lock on Dad's box
function openLock(p) { game.lock = { user: p, sel: 1, vals: [0, 0, 0], solved: -1 }; game.panel = null; snd('click'); }
function lockInput(p, dt) {
  const L = game.lock, k = p.keys;
  if (L.solved >= 0) { L.solved += dt; if (L.solved > 1.6) finishLock(p); return; }
  if (hit(k.left)) { L.sel = Math.max(0, L.sel - 1); snd('click'); }
  if (hit(k.right)) { L.sel = Math.min(3, L.sel + 1); snd('click'); }
  if (L.sel === 0) { if (hit(k.up) || hit(k.down)) game.lock = null; return; }
  if (hit(k.up)) { L.vals[L.sel - 1] = (L.vals[L.sel - 1] + 1) % 6; snd('dial'); }
  if (hit(k.down)) { L.vals[L.sel - 1] = (L.vals[L.sel - 1] + 5) % 6; snd('dial'); }
  if (L.vals.every((v, i) => v === game.code[i])) { L.solved = 0; burst(p.x, p.y - 200, 10); snd('clunk'); snd('good'); }
}
function finishLock(p) {
  game.lock = null; game.box = 'open'; game.keyHolder = players.indexOf(p); snd('piece');
  sayNow(p, 'The spare key! We did it!'); say(p === sis ? bro : sis, "Quick, to the front door!");
  objective('Unlock the front door.');
}

// ---------- update
function update(dt) {
  if (game.chapter > 0) { game.chapter -= dt; if (game.chapter <= 0) intro(); }
  for (const [i, p] of players.entries()) {
    const k = p.keys, other = players[1 - i];
    let moving = false;
    if (game.exitT >= 0) { p.x += (DOOR_X - p.x) * Math.min(1, dt * 2); p.dir = DOOR_X > p.x ? 1 : -1; moving = true; }
    else if (game.lock && game.lock.user === p) lockInput(p, dt);
    else if (p.climb) {
      const c2 = p.climb; c2.t += dt / CLIMB_TIME; const u = Math.min(1, c2.t), s = c2.dir > 0 ? u : 1 - u;
      p.x = STAIRS.x0 + (STAIRS.x1 - STAIRS.x0) * s; p.y = STAIRS.y0 + (STAIRS.y1 - STAIRS.y0) * s; p.dir = c2.dir; moving = true;
      { const st = Math.min(7, Math.floor(u * 8)); if (st !== c2.step) { c2.step = st; snd('stair'); } } // a footstep on each stair
      if (u >= 1) { p.floor = c2.dir > 0 ? 1 : 0; p.y = FLOOR[p.floor]; p.climb = null; }
    } else if (game.chapter <= 0) {
      const dir = (down[k.right] ? 1 : 0) - (down[k.left] ? 1 : 0);
      if (dir) {
        p.dir = dir; const lo = p.inside ? CUP_IN[0] : WALK[0], hi = p.inside ? CUP_IN[1] : WALK[1];
        const nx = Math.max(lo, Math.min(hi, p.x + dir * SPEED * dt)); moving = nx !== p.x; p.x = nx;
      }
      if (hit(k.up)) {
        const th = nearThing(p, 'up');
        if (nearCord(p)) pullCord(p);
        else if (p.inside) leaveCupboard(p);
        else if (th) th.act(p);
        else if (game.box === 'held' && p === sis) openLock(p);
        else if (p.cheer <= 0) { p.cheer = CHEER; snd('cheer'); burst(p.x, p.y - 220 * HC, 6); }
      }
      if (hit(k.down) && !p.inside) { const th = nearThing(p, 'down'); if (th) th.act(p); }
    }
    p.m += ((moving ? 1 : 0) - p.m) * Math.min(1, dt * 9);
    if (moving) p.phase += dt * Math.PI * (SPEED / HC) / (2 * p.stride);
    p.cheer = Math.max(0, p.cheer - dt);
    updateExpr(p, other, dt, 5000);
  }
  // the brother spots the chalk code once the cupboard light is on
  if (game.bulb) game.bulbT += dt;
  if (bro.inside && !game.codeSeen && game.bulb && game.bulbT > 0.6) {
    game.codeT += dt;
    if (game.codeT > 0.5) {
      game.codeSeen = true; snd('good'); sayNow(bro, 'Chalk pictures on the wall! Three of them... it must be the box code!');
      objective(game.box === 'held' ? 'Open the box: Brother, tell Sister the three pictures.' : 'Brother knows the code. Sister: get the box from the top of the bookcase.');
    }
  }
  if (game.panel) { game.panel.t += dt; const u = game.panel.user; if (Math.abs(u.x - game.panel.x) > 150 || u.climb || u.floor !== 0) game.panel = null; }
  if (game.doorOpening) { game.doorOpen = Math.min(1, game.doorOpen + dt / 1.3); if (game.doorOpen >= 1) game.doorOpening = false; }
  // both siblings at the open door: out they go
  if (game.doorOpen >= 1 && game.exitT < 0) {
    const at = players.map((p) => p.floor === 0 && !p.climb && Math.abs(p.x - DOOR_X) < 70);
    if (at[0] && at[1]) { game.exitT = 0; game.bubble = null; game.queue = []; }
    else if ((at[0] || at[1]) && !game.waitSaid) { game.waitSaid = true; const w = at[0] ? sis : bro; sayNow(w, w === sis ? 'Come on, little bro!' : 'Hurry up, sis!'); }
  }
  if (game.exitT >= 0) { game.exitT += dt; for (const p of players) { const u = Math.min(1, game.exitT / 1.4); p.alpha = 1 - u; p.scale = 1 - u * 0.18; } if (game.exitT > 1.6 && !game.done) { game.done = true; snd('fanfare'); } }
  if (game.done) { if (!game.saved) { game.saved = true; if (typeof CHAPTER !== 'undefined') CHAPTER.mark('house'); } // the chapter map (map.html) shows it as finished and opens the park
    game.endT += dt; if (game.endT > 1.2 && (hit('KeyW') || hit('ArrowUp') || hit('Enter') || hit('Space'))) location.href = 'map.html?from=house'; }
  if (typeof musicArea === 'function') musicArea('home');
  updateTalk(dt);
  // chimney smoke
  if (Math.random() < dt * 2.2) game.smoke.push({ x: 1450, y: 40, r: 10, life: 1, vx: -8 - Math.random() * 10 });
  for (let i = game.smoke.length - 1; i >= 0; i--) { const s = game.smoke[i]; s.life -= dt * 0.25; s.y -= 22 * dt; s.x += s.vx * dt; s.r += 9 * dt; if (s.life <= 0) game.smoke.splice(i, 1); }
  endInput();
}
function intro() {
  say(sis, 'Mum and Dad went to town... and they locked us in.');
  say(bro, 'But look! The treasure map is right here on the table!');
  say(sis, "We can't go anywhere. The front door is locked.");
  say(bro, 'Dad keeps a spare key hidden somewhere. Let\'s find it!');
  objective('Find the spare key to the front door.');
}

// ---------- drawing
const SYM_COL = { leaf: '#5f9a46', star: '#e3b23c', moon: '#8a9ad8', sun: '#e8873a', heart: '#d84a5a', fish: '#3f8fb8' };
function symbol(c, kind, x, y, r, col, chalk) {
  c.save(); c.translate(x, y); c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
  if (kind === 'leaf') { c.moveTo(0, r); c.quadraticCurveTo(r * 1.1, 0, 0, -r); c.quadraticCurveTo(-r * 1.1, 0, 0, r); c.moveTo(0, r * 1.2); c.lineTo(0, -r * 0.7); }
  else if (kind === 'star') { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; c.lineTo(Math.cos(a) * q, Math.sin(a) * q); } c.closePath(); }
  else if (kind === 'moon') { c.arc(0, 0, r, 0.5, TAU - 0.5); c.arc(r * 0.45, 0, r * 0.72, TAU - 0.9, 0.9, true); c.closePath(); }
  else if (kind === 'sun') { c.moveTo(r * 0.55, 0); c.arc(0, 0, r * 0.55, 0, TAU); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.moveTo(Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.75); c.lineTo(Math.cos(a) * r * 1.05, Math.sin(a) * r * 1.05); } }
  else if (kind === 'heart') { c.moveTo(0, r * 0.9); c.bezierCurveTo(-r * 1.3, -r * 0.1, -r * 0.6, -r * 1.1, 0, -r * 0.35); c.bezierCurveTo(r * 0.6, -r * 1.1, r * 1.3, -r * 0.1, 0, r * 0.9); }
  else { c.moveTo(-r, 0); c.quadraticCurveTo(-r * 0.2, -r * 0.8, r * 0.6, 0); c.quadraticCurveTo(-r * 0.2, r * 0.8, -r, 0); c.moveTo(r * 0.5, 0); c.lineTo(r * 1.05, -r * 0.5); c.lineTo(r * 1.05, r * 0.5); c.closePath(); }
  if (chalk) { c.strokeStyle = 'rgba(245,242,230,.92)'; c.lineWidth = r * 0.16; c.stroke(); c.globalAlpha = 0.35; c.lineWidth = r * 0.3; c.stroke(); }
  else { c.fillStyle = col; if (kind === 'sun') { c.strokeStyle = col; c.lineWidth = r * 0.18; c.stroke(); ell(c, 0, 0, r * 0.55, r * 0.55, col); } else { c.fill(); c.strokeStyle = 'rgba(40,25,15,.6)'; c.lineWidth = 1.6; c.stroke(); } }
  c.restore();
}
function drawBox(c, x, y, s, open) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (open) { c.save(); c.translate(-26, -36); c.rotate(-1.1); rrect(c, 0, -14, 52, 14, 4); fs(c, lg(c, 0, -14, 0, 0, '#a2744b', '#7c5436'), '#3a2618', 1.8); c.restore(); soft(c, 0, -40, 40, 30, '#fff3b8', 0.7); }
  rrect(c, -27, -36, 54, 36, 4); fs(c, lg(c, 0, -36, 0, 0, '#a2744b', '#6e4a30'), '#3a2618', 2);
  if (!open) { rrect(c, -29, -44, 58, 12, 4); fs(c, lg(c, 0, -44, 0, -32, '#c79a69', '#8f6644'), '#3a2618', 1.8); }
  for (const cx of [-27, 21]) { c.fillStyle = '#d9b55c'; c.fillRect(cx, -36, 6, 36); }
  if (!open) { rrect(c, -9, -30, 18, 16, 3); fs(c, lg(c, -9, 0, 9, 0, '#e9c45c', '#a8822e'), '#5a4214', 1.4); c.beginPath(); c.arc(0, -30, 6, Math.PI, 0); c.strokeStyle = '#8a9095'; c.lineWidth = 3; c.stroke(); }
  c.restore();
}
function drawKey(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.rotate(-0.5 + Math.sin(t * 3) * 0.08); c.scale(s, s);
  soft(c, 0, 0, 30, 30, '#fff3b8', 0.55 + Math.sin(t * 5) * 0.15);
  c.beginPath(); circ(c, -12, 0, 8); fs(c, lg(c, -20, 0, -4, 0, '#f6d77a', '#c99a3c'), '#6a4f14', 1.6); c.fillStyle = '#6a4f14'; c.beginPath(); c.arc(-12, 0, 3, 0, TAU); c.fill();
  rrect(c, -4, -2.5, 24, 5, 2); fs(c, '#e9c45c', '#6a4f14', 1.2); c.fillStyle = '#e9c45c'; c.fillRect(12, 2, 4, 6); c.fillRect(17, 2, 3, 4);
  c.restore();
}
function drawDoor(c, t) {
  const k = game.doorOpen, kx = 1 - k * 0.88;
  if (k > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = k; c.fillStyle = lg(c, DOOR_X, FLOOR[0] - 290, DOOR_X - 300, FLOOR[0], 'rgba(255,240,190,.35)', 'rgba(255,240,190,0)'); c.beginPath(); c.moveTo(DOOR_X - 75, FLOOR[0] - 290); c.lineTo(DOOR_X + 75, FLOOR[0] - 290); c.lineTo(DOOR_X + 40, FLOOR[0]); c.lineTo(DOOR_X - 360, FLOOR[0] + 6); c.closePath(); c.fill(); c.restore(); }
  c.save(); c.translate(DOOR_X - 75 + 75 * kx, FLOOR[0]); c.scale(kx, 1); put(c, H('frontDoor'), 0, 0); if (k > 0) { c.fillStyle = `rgba(20,30,28,${k * 0.45})`; c.fillRect(-75, -290, 150, 290); } c.restore();
}
function drawCupboard(c, t) {
  if (!bro.inside) { put(c, H('cupboard'), CUP_X, FLOOR[0]); return; }
  put(c, H('cupboardInside'), CUP_X, FLOOR[0]);
  // chalk code on the back wall
  if (game.bulb) { c.save(); c.translate(0, 0); c.font = 'italic 700 15px Georgia, serif'; c.fillStyle = 'rgba(245,242,230,.85)'; c.textAlign = 'center'; c.fillText('box code', CODE_X[1], CODE_Y - 32);
  game.code.forEach((s, i) => symbol(c, SYMBOLS[s], CODE_X[i], CODE_Y, 12, null, true));
  c.strokeStyle = 'rgba(245,242,230,.7)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(CODE_X[0] - 22, CODE_Y + 26); c.lineTo(CODE_X[2] + 22, CODE_Y + 24); c.stroke(); c.restore(); }
  // the hanging bulb and its pull cord
  const on = game.bulb, sway = Math.sin(t * 1.6) * 2 + (on ? Math.sin(game.bulbT * 9) * Math.max(0, 1 - game.bulbT) * 8 : 0);
  c.strokeStyle = '#2a2420'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(BULB.x, BULB.top); c.lineTo(BULB.x + sway * 0.4, BULB.y - 14); c.stroke();
  const bx = BULB.x + sway * 0.5;
  rrect(c, bx - 6, BULB.y - 16, 12, 9, 2); fs(c, '#5a5048', '#1c1815', 1.2);
  c.beginPath(); c.ellipse(bx, BULB.y, 10, 12, 0, 0, TAU); fs(c, on ? rg(c, bx, BULB.y, 12, '#fffbe6', '#ffe9a6', '#f6c45a') : 'rgba(200,205,210,.55)', on ? '#c9902e' : '#6a6e72', 1.4);
  c.strokeStyle = '#d8cfb8'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(bx + 5, BULB.y - 10); c.lineTo(bx + 6 + sway, BULB.cord); c.stroke();
  const knobX = bx + 6 + sway;
  drawChar(bro, t);
  // darkness: almost black until the bulb is on, then lit around the bulb
  c.save(); c.translate(CUP_X, FLOOR[0]); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -148); c.lineTo(260, -420); c.lineTo(260, 0); c.closePath(); c.restore();
  if (on) c.fillStyle = rg(c, bx, BULB.y, 300, 'rgba(10,7,16,0)', 'rgba(10,7,16,.05)', 'rgba(10,7,16,.35)', 'rgba(10,7,16,.7)');
  else c.fillStyle = rg(c, CUP_DOOR + 10, FLOOR[0] - 20, 120, 'rgba(10,7,16,.6)', 'rgba(10,7,16,.94)', 'rgba(10,7,16,.985)');
  c.fill();
  // the knob on the cord catches a little light, so it can be found in the dark
  c.beginPath(); circ(c, knobX, BULB.cord + 4, 4.5); fs(c, '#e9c45c', '#6a4f14', 1.2);
  if (!on) soft(c, knobX, BULB.cord + 4, 12, 12, '#fff3b8', 0.45 + Math.sin(t * 3) * 0.2);
  if (on) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rg(c, bx, BULB.y, 220, 'rgba(255,214,140,.32)', 'rgba(255,200,120,.1)', 'rgba(255,200,120,0)'); c.fillRect(bx - 220, BULB.y - 220, 440, 440); c.restore(); }
}
// what the sister carries (shared/stage.js calls this after drawing each character)
function drawCarried(p, k, t) {
  if (p === sis && (game.box === 'held' || (game.lock && game.lock.solved >= 0))) drawBox(ctx, p.x + p.dir * 34 * k, p.y - 108 * k, 0.9 * k, false);
  if (game.keyHolder === players.indexOf(p)) drawKey(ctx, p.x + p.dir * 46 * k, p.y - 118 * k, k, t);
}
function sunbeams(t) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [, x, y, s] of WINDOWS) {
    const fl = y > 600 ? FLOOR[0] : FLOOR[1], a = 0.06 + Math.sin(t * 0.6 + x) * 0.015;
    ctx.fillStyle = lg(ctx, x, y - 200 * s, x - 260, fl, `rgba(255,236,180,${a})`, 'rgba(255,236,180,0)');
    ctx.beginPath(); ctx.moveTo(x - 70 * s, y - 210 * s); ctx.lineTo(x + 70 * s, y - 210 * s); ctx.lineTo(x - 60, fl); ctx.lineTo(x - 300, fl); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function drawNotePanel(c) {
  const w = 520, h = 400, x = camX + VW / 2 - w / 2, y = 200;
  parchment(c, x, y, w, h);
  c.fillStyle = '#d84a4a'; c.beginPath(); c.moveTo(x + w / 2, y + 14); c.bezierCurveTo(x + w / 2 - 16, y, x + w / 2 - 8, y - 12, x + w / 2, y - 3); c.bezierCurveTo(x + w / 2 + 8, y - 12, x + w / 2 + 16, y, x + w / 2, y + 14); c.fill();
  c.fillStyle = '#3a3a6a'; c.font = 'italic 24px Georgia, serif'; c.textBaseline = 'top';
  const lines = ['Dear kids,', '', 'We have gone to town and will be', 'back by sunset. Stay inside and be good!', 'The front door is locked.', '', 'Love, Mum & Dad', '', "P.S. Don't touch Dad's secret box!"];
  lines.forEach((l, i) => c.fillText(l, x + 40, y + 34 + i * 34));
}
function drawMapPanel(c, t) {
  const w = 760, h = 470, x = camX + VW / 2 - w / 2, y = 150;
  parchment(c, x, y, w, h);
  c.save(); c.translate(x, y);
  c.fillStyle = '#5a3a1e'; c.font = 'italic 700 34px Georgia, serif'; c.textAlign = 'center'; c.fillText('The Treasure Trail', w / 2, 52);
  // river, mountains, forest, path
  c.strokeStyle = '#6fa8c8'; c.lineWidth = 10; c.beginPath(); c.moveTo(430, 470); c.bezierCurveTo(470, 380, 400, 300, 470, 230); c.bezierCurveTo(510, 190, 500, 140, 560, 100); c.stroke();
  for (const [mx, my, s] of [[560, 150, 1], [630, 130, 1.2], [700, 160, 0.9]]) { c.fillStyle = '#c9a98a'; c.beginPath(); c.moveTo(mx - 40 * s, my + 30 * s); c.lineTo(mx, my - 40 * s); c.lineTo(mx + 40 * s, my + 30 * s); c.fill(); c.fillStyle = '#f4ead4'; c.beginPath(); c.moveTo(mx - 12 * s, my - 20 * s); c.lineTo(mx, my - 40 * s); c.lineTo(mx + 12 * s, my - 20 * s); c.fill(); }
  for (let i = 0; i < 16; i++) { const tx = 180 + (i % 8) * 34 + (i > 7 ? 16 : 0), ty = 250 + (i > 7 ? 40 : 0); c.fillStyle = i % 3 ? '#5f8f52' : '#4f7f45'; c.beginPath(); c.moveTo(tx - 14, ty + 18); c.lineTo(tx, ty - 22); c.lineTo(tx + 14, ty + 18); c.fill(); }
  c.fillStyle = '#7fb3cc'; c.fillRect(470, 205, 22, 46); c.fillStyle = '#a28d7c'; c.fillRect(500, 220, 60, 10); // waterfall and bridge
  c.fillStyle = '#5a7a3a'; c.beginPath(); circ(c, 620, 300, 34); c.fill(); c.fillStyle = '#6e4b34'; c.fillRect(613, 310, 14, 40); c.fillStyle = '#5a3a1e'; c.font = 'italic 18px Georgia, serif'; c.fillText('old oak', 620, 372);
  // the city, just beyond home
  for (const [bx, bw, bh, col] of [[196, 22, 46, '#9a8ea6'], [220, 18, 62, '#7f7392'], [240, 26, 38, '#a99aa2'], [268, 16, 54, '#8a7e98'], [286, 22, 30, '#9a8ea6']]) { c.fillStyle = col; c.fillRect(bx, 424 - bh, bw, bh); c.fillStyle = '#f4dc8e'; for (let wy = 424 - bh + 6; wy < 418; wy += 9) for (let wx = bx + 4; wx < bx + bw - 4; wx += 7) c.fillRect(wx, wy, 3, 4); }
  c.fillStyle = '#5a3a1e'; c.font = 'italic 18px Georgia, serif'; c.fillText('city', 244, 446);
  // our house
  c.fillStyle = '#c2785a'; c.fillRect(70, 380, 60, 40); c.fillStyle = '#8a4330'; c.beginPath(); c.moveTo(60, 382); c.lineTo(100, 348); c.lineTo(140, 382); c.fill(); c.fillStyle = '#5a3a1e'; c.fillText('home', 100, 444);
  c.strokeStyle = '#8a5a2a'; c.lineWidth = 4; c.setLineDash([10, 9]); c.lineDashOffset = -t * 20; c.beginPath(); c.moveTo(140, 400); c.bezierCurveTo(250, 420, 300, 330, 380, 330); c.bezierCurveTo(460, 330, 470, 260, 520, 240); c.bezierCurveTo(580, 230, 600, 280, 660, 330); c.stroke(); c.setLineDash([]);
  c.strokeStyle = '#c9302a'; c.lineWidth = 7; c.beginPath(); c.moveTo(650, 320); c.lineTo(676, 346); c.moveTo(676, 320); c.lineTo(650, 346); c.stroke();
  // compass
  c.translate(110, 150); c.strokeStyle = '#8a6a3a'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 34, 0, TAU); c.stroke(); c.fillStyle = '#8a6a3a'; c.beginPath(); c.moveTo(0, -30); c.lineTo(7, 0); c.lineTo(0, 30); c.lineTo(-7, 0); c.closePath(); c.fill(); c.font = '700 14px Georgia, serif'; c.fillText('N', 0, -40);
  c.restore();
}
function drawLockPanel(c, t) {
  const L = game.lock, w = 640, h = 330, x = camX + VW / 2 - w / 2, y = 170;
  c.save(); c.fillStyle = 'rgba(20,12,6,.4)'; rrect(c, x + 6, y + 10, w, h, 18); c.fill();
  rrect(c, x, y, w, h, 18); fs(c, lg(c, 0, y, 0, y + h, '#a2744b', '#6e4a30'), '#3a2618', 4);
  rrect(c, x + 14, y + 14, w - 28, h - 28, 12); c.strokeStyle = 'rgba(240,200,140,.4)'; c.lineWidth = 2; c.stroke();
  c.fillStyle = '#f6e7c4'; c.font = 'italic 700 28px Georgia, serif'; c.textAlign = 'center'; c.fillText("Dad's secret box", x + w / 2, y + 52);
  for (let i = 0; i < 3; i++) {
    const dx = x + 210 + i * 120, dy = y + 160, sel = L.sel === i + 1, ok = L.solved >= 0;
    rrect(c, dx - 46, dy - 62, 92, 124, 14); fs(c, lg(c, 0, dy - 62, 0, dy + 62, '#f6e7c4', '#e0c58a'), sel ? '#fff3b8' : '#5a4214', sel ? 5 : 3);
    if (ok) soft(c, dx, dy, 60, 60, '#fff3b8', 0.6);
    symbol(c, SYMBOLS[L.vals[i]], dx, dy, 30, SYM_COL[SYMBOLS[L.vals[i]]], false);
    if (sel && !ok) { c.fillStyle = '#fff3b8'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(dx - 12, dy + s * 72); c.lineTo(dx + 12, dy + s * 72); c.lineTo(dx, dy + s * 86); c.closePath(); c.fill(); } }
  }
  rrect(c, x + 40, y + 132, 90, 56, 10); fs(c, L.sel === 0 ? '#c9503f' : '#8a3a2a', L.sel === 0 ? '#fff3b8' : '#3a1a10', L.sel === 0 ? 4 : 2);
  c.fillStyle = '#fff6dc'; c.font = '700 18px Georgia, serif'; c.fillText('Close', x + 85, y + 167);
  c.font = '17px Georgia, serif'; c.fillStyle = '#f6e7c4';
  c.fillText(L.solved >= 0 ? 'Click! The lid pops open...' : 'A / D pick a dial    W / S turn it', x + w / 2, y + h - 28);
  c.restore();
}
function drawUI(c, t) {
  // hints over each sibling's head
  for (const p of players) {
    if (p.climb || game.exitT >= 0 || (game.lock && game.lock.user === p) || p.alpha < 1 || game.chapter > 0) continue;
    if (game.bubble && game.bubble.who === p) continue;
    const hy = p.y - p.headH * HC - 14;
    let th = nearThing(p, null), text = th && th.label(p), glyph = th && p.glyph[th.key === 'up' ? 0 : 1];
    if (nearCord(p)) { text = 'Pull the light cord'; glyph = p.glyph[0]; }
    else if (p.inside) { text = 'Climb out'; glyph = p.glyph[0]; }
    else if (!th && game.box === 'held' && p === sis) { text = 'Open the box'; glyph = p.glyph[0]; }
    if (text) hintAt(c, p.x, hy, glyph, text, p.col);
  }
  drawBubble(c);
  if (game.panel) { c.save(); c.globalAlpha = Math.min(1, game.panel.t * 5); (game.panel.kind === 'map' ? drawMapPanel : drawNotePanel)(c, t); c.restore(); }
  if (game.lock) drawLockPanel(c, t);
  drawGoal(c);
}
function drawCards(c, t) {
  if (game.chapter > 0) chapterCard(c, camX, game.chapter, 4.2, 'Chapter One', 'Home Alone', 'Mum and Dad are out. The door is locked. And there is a treasure map on the table...');
  if (game.done) {
    const a = Math.min(1, game.endT / 1); c.fillStyle = `rgba(28,18,10,${a * 0.8})`; c.fillRect(camX - 10, 0, VW + 20, VH);
    c.globalAlpha = a; const w = 720, h = 330, x = camX + VW / 2 - w / 2, y = VH / 2 - h / 2; parchment(c, x, y, w, h); c.textAlign = 'center';
    c.fillStyle = '#8a5a2a'; c.font = 'italic 24px Georgia, serif'; c.fillText('Chapter One complete', x + w / 2, y + 62);
    c.fillStyle = '#3a2618'; c.font = 'italic 700 52px Georgia, serif'; c.fillText('Home Alone', x + w / 2, y + 128);
    c.font = 'italic 21px Georgia, serif'; c.fillText('Map in hand, the two of them step out into the busy city.', x + w / 2, y + 182); c.fillText('The treasure trail leads right across the city...', x + w / 2, y + 212);
    if (game.endT > 1.2) { c.globalAlpha = a * (0.6 + Math.sin(t * 4) * 0.4); c.fillStyle = '#6d7b45'; c.font = '700 21px Georgia, serif'; c.fillText('Press W or ↑ to go on', x + w / 2, y + 276); }
    c.globalAlpha = 1; c.textAlign = 'left';
  }
}

// ---------- the frame loop
let camX = 0, last = performance.now();
function resize() {
  resizeScreen();
  BS = Math.min(S * Math.min(ZOOM, 2), 2); bake.cv.width = Math.ceil((BAKE_X1 - BAKE_X0) * BS); bake.cv.height = Math.ceil(VH * BS); paintBake();
}
addEventListener('resize', resize); resize();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
  update(dt);
  const mid = (sis.x + bro.x) / 2;
  const target = VW >= WORLD ? (WORLD - VW) / 2 : Math.max(0, Math.min(WORLD - VW, mid - VW / 2));
  camX += (target - camX) * Math.min(1, dt * 3);
  if (ZOOM > 1) { const k = S * ZOOM, my = (sis.y + bro.y) / 2 - 120, zx = mid - VW / (2 * ZOOM), zy = Math.max(0, Math.min(VH - VH / ZOOM, my - VH / (2 * ZOOM))); ctx.setTransform(k, 0, 0, k, -zx * k, -zy * k); camX = zx; }
  else ctx.setTransform(S, 0, 0, S, -camX * S, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(bake.cv, BAKE_X0, 0, BAKE_X1 - BAKE_X0, VH);
  for (const s of game.smoke) soft(ctx, s.x, s.y, s.r, s.r, '#f4efe4', s.life * 0.55);
  if (game.box === 'shelf') drawBox(ctx, BOOKCASE_X - 40, BOX_Y, 1, false);
  else if (game.box === 'open') drawBox(ctx, 1612, FLOOR[1] - 4, 0.85, true);
  drawDoor(ctx, t);
  drawCupboard(ctx, t);
  sunbeams(t);
  for (const p of players) if (!(p === bro && p.inside)) drawChar(p, t);
  drawSparks(ctx);
  ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,205,135,.14)'; ctx.fillRect(camX - 10, 0, VW + 20, VH); ctx.globalCompositeOperation = 'source-over';
  const v = ctx.createRadialGradient(camX + VW / 2, VH / 2, VH * 0.5, camX + VW / 2, VH / 2, VH * 1.2); v.addColorStop(0, 'rgba(50,30,15,0)'); v.addColorStop(1, 'rgba(50,30,15,.3)'); ctx.fillStyle = v; ctx.fillRect(camX - 10, 0, VW + 20, VH);
  drawUI(ctx, t); drawCards(ctx, t);
  requestAnimationFrame(frame);
}

// ---------- test shortcuts (?stage=...) and start
if (STAGE === 'cupboard') { bro.x = CUP_DOOR; enterCupboard(bro); bro.x = 1440; bro.dir = 1; sis.x = 1250; objective('Find the spare key to the front door.'); }
if (STAGE === 'bulb') { bro.x = CUP_DOOR; enterCupboard(bro); bro.x = BULB.x + 10; game.bulb = true; game.bulbT = 3; sis.x = 1250; }
if (STAGE === 'lock') { sis.floor = 1; sis.y = FLOOR[1]; sis.x = 1600; game.box = 'held'; game.codeSeen = true; bro.x = 1000; openLock(sis); game.lock.vals = [game.code[0], 0, 0]; objective('Open the box: Brother, tell Sister the three pictures.'); }
if (STAGE === 'door' || STAGE === 'open' || STAGE === 'end') { game.box = 'open'; game.keyHolder = 0; sis.x = DOOR_X - 90; bro.x = DOOR_X - 220; objective('Unlock the front door.'); }
if (STAGE === 'open' || STAGE === 'end') { game.keyHolder = -1; game.doorOpen = 1; objective('Go outside together.'); }
if (STAGE === 'end') { game.done = true; game.endT = 5; for (const p of players) p.alpha = 0; }
if (QS.get('panel')) openPanel(QS.get('panel'), sis, sis.x);
if (SKIP && !STAGE) intro();
requestAnimationFrame((t) => { last = t; frame(t); });

'use strict';
// The city lab: the test level that runs the city now (see LAB_PLAN.md). It builds the stations from settings.js,
// lets the siblings move with shared/movement.js on the physics in shared/physics.js, and draws it all over the
// scenery in street.js. The objects come from shared/kit.js and, for the city's own, things.js.
// Useful while testing (add to the address of city.html):
//   ?station=3  starts at station 3 (0 to 7)                ?at=2400   starts both siblings at that place
//   ?debug=1    shows what is solid, which plates and levers are on, the station names and the frame rate
//   ?tune=1     shows sliders for the numbers in MOVE (shared/movement.js)
//   ?touch=1    shows the touch buttons on a computer        ?fps=30    draws only that many frames a second
//   ?zoom=3     looks closer (?look=bro follows the brother)
const DEBUG = QS.get('debug'), TUNE = QS.get('tune'), SLOW = +QS.get('fps') || 0;
const FROM = QS.get('station') === null ? 0 : clamp(Math.floor(+QS.get('station')) || 0, 0, STATIONS.length - 1), AT = +QS.get('at') || 0;
let last = performance.now();
const game = { time: 0, chapter: 0, queue: [], bubble: null, sparks: [], objective: '', objT: 0, done: false, endT: 0, exitT: -1, lift: 0, shake: 0, fps: 60, slow: 0,
  station: FROM, entered: STATIONS.map(() => null), // when each station was first reached (seconds of play)
  // the torn map: after the gust, three pieces land where the settings put them; the puppy has the fourth
  map: { gust: FROM > 0, t: FROM > 0 ? 99 : 0, from: [0, 0], got: [FROM > 0, FROM > 0, FROM > 0, FROM > 2], took: null, landed(i) { return this.gust && this.t > 1.5 + i * 0.3; } } };
game.entered[FROM] = 0;
if (typeof SOUND !== 'undefined') SOUND.wantMusic = true;

// ---------- the world: the pavement (none over water), the two ends of the street, and everything the stations place
const world = makeWorld();
const begin = AT ? [AT - 50, AT + 50] : STATIONS[FROM].start;
const players = [makePlayer('sister', begin[0], FEET, 1), makePlayer('brother', begin[1], FEET, -1)];
const [sis, bro] = players;
const WATER = GAPS.filter((g) => g[2] === 'water');
{ let x = -5000; for (const [a, b] of WATER) { world.solid(x, FEET, a, FEET + 900); x = b; } world.solid(x, FEET, CITY.length + 5000, FEET + 900); }
world.solid(-5000, -5000, CITY.walk[0], FEET); world.solid(CITY.walk[1], -5000, CITY.length + 5000, FEET);
const kit = []; STATIONS.forEach((s, n) => s.things.forEach((d) => kit.push(Object.assign(kitMake(world, d, FEET), { station: n }))));
const overWater = (x) => WATER.some(([a, b]) => x > a && x < b);
setupMovement(world, players, {
  // the nearest thing this sibling could use right now
  thing: (p) => { let best = null, bd = 1e9; for (const o of kit) if (o.thing && o.thing.canUse(p)) { const d = Math.abs(o.thing.x - p.x); if (d < bd) { bd = d; best = o.thing; } } return best; },
  ladder: (p) => { for (const o of kit) if (o.ladder) { const l = o.ladder(p); if (l) return l; } return null; },
  // in the water: a splash, and back they come (siblings beside the partner or to their last safe spot, boxes to where they started)
  lost: (b) => { if (b.y < FEET + 78 || !overWater(b.x)) return false; snd('splash'); puff(b.x, FEET + 30, 12, '#d6ecf6', 2.2); return true; },
  // after a fall, a sibling comes back next to the partner only if the partner is on the same level and the same bank
  canJoin: (p, o) => Math.abs(o.y - p.safe.y) < 60 && !WATER.some(([a, b]) => (p.safe.x < (a + b) / 2) !== (o.x < (a + b) / 2)),
});
MV.bottom = VH + 260;
const pads = makeTouchPads(QS.get('touch'));
const starsGot = () => kit.filter((o) => o.star && o.star.got).length, starsAll = kit.filter((o) => o.star).length;
const piecesGot = () => game.map.got.filter(Boolean).length;

function fitScreen() { // on touch screens the street is drawn higher, so the buttons sit over the road
  resizeScreen();
  game.lift = pads ? clamp(pads.height() * DPR / S - 84, 0, 300) : 0;
}
function cameraTarget() { // the middle of the two; or, while both are inside a station's view, the whole view held still
  const mid = (sis.x + bro.x) / 2, v = STATIONS[game.station].view;
  const hold = v && VW >= v[1] - v[0] && sis.x > v[0] && sis.x < v[1] && bro.x > v[0] && bro.x < v[1];
  return clamp((hold ? (v[0] + v[1]) / 2 : mid) - VW / 2, 0, Math.max(0, CITY.length - VW));
}

// ---------- every frame
function update(dt) {
  const m = game.map, ending = game.exitT >= 0;
  game.time += dt;
  // the gust that tears the map: three pieces fly to their places, the fourth sails off towards the market
  if (!m.gust && (sis.x > MAP.gust || bro.x > MAP.gust)) { m.gust = true; m.t = 0; m.from = [sis.x + 20, sis.y - 190]; snd('wind'); for (const p of players) p.sqv = -3; }
  if (m.gust) m.t += dt; if (m.took) { m.took.t += dt; if (m.took.t > 1.4) m.took = null; }
  KIT_SIG.map3 = m.got[0] && m.got[1] && m.got[2]; KIT_SIG.map4 = m.got[3];
  moveSiblings(dt, ending || game.done);
  for (const o of kit) if (o.update) o.update(dt);
  world.step(dt);
  for (const o of kit) if (o.after) o.after(dt);
  settleSiblings(dt);
  updatePigeons(dt, players.filter((p) => !p.gone && p.grounded));
  updateMoveFx(dt); updateTalk(dt);
  game.shake = Math.max(0, game.shake - dt * 2.5);
  // which station they are in: the furthest one both have reached
  const back = Math.min(sis.x, bro.x); let n = game.station; while (n + 1 < STATIONS.length && back >= STATIONS[n + 1].x[0]) n++;
  if (n !== game.station) { game.station = n; if (game.entered[n] === null) game.entered[n] = game.time; }
  camX += (cameraTarget() - camX) * Math.min(1, dt * 4);
  // the end: over the bridge and both at the park gate
  if (KIT_SIG.bridge && !ending && players.every((p) => !p.gone && Math.abs(p.x - PARK_GATE) < 120)) { game.exitT = 0; game.finished = game.time; }
  if (ending) { game.exitT += dt; const u = Math.min(1, game.exitT / 1.6); for (const p of players) { p.x += (PARK_GATE - p.x) * Math.min(1, dt * 1.5); p.alpha = 1 - u; } if (game.exitT > 1.8 && !game.done) { game.done = true; snd('great'); } }
  if (game.done) { game.endT += dt; if (game.endT > 1.2 && ['KeyW', 'ArrowUp', 'Enter', 'Space'].some((k) => hit(k) || TAPS[k])) location.href = 'forest.html'; }
  if (typeof musicArea === 'function') musicArea(game.station >= 5 ? 'evening' : 'street');
  endInput();
}

function drawShadow(c, b) { // on whatever is below: smaller and fainter the higher they are
  const fl = world.below(b); if (fl.y === Infinity || fl.y > FEET + 40) return;
  const k = clamp01(1 - (fl.y - b.y) / 560), r = (b.kind === 'box' ? b.w * 0.62 : 46) * (0.55 + 0.45 * k);
  soft(c, b.x - (b.kind === 'box' ? 0 : 3 * b.dir), fl.y + 3, r, 8 * (0.55 + 0.45 * k), '#2a1a0e', 0.1 + 0.3 * k);
}
function drawBadge(c, x, y, icon, col, t) { // a little sign over a head, in place of words
  c.save(); c.translate(x, y + Math.sin(t * 5) * 2.5); c.globalAlpha = 0.95;
  c.beginPath(); circ(c, 0, 0, 23); fs(c, col, '#fff6dc', 3); drawIcon(c, icon, 0, icon === 'hands' ? 0 : 1, icon === 'hands' ? 1.05 : 0.95); c.restore();
}
function drawHints(c, t) { // what the grab key would do, shown as a picture: a hand to pick up or use, two hands for the lift
  const duo = MV.duo;
  for (const p of players) {
    if (p.gone || p.carry || p.holding || p.climb || duo.state === 'up' || !(p.grounded || p.held)) continue;
    const th = MV.hooks.thing(p), headY = p.y - p.h - 34;
    if (duo.state === 'on') { if (p === bro && th) drawBadge(c, p.x, headY, 'hand', p.col, t); continue; }
    const box = th ? null : nearBox(p);
    if (th || (box && !(box.heavy && p === bro))) drawBadge(c, p.x, headY, 'hand', p.col, t);
    else if (!box && p === bro && canLift() && sis.idle > 0.7 && bro.idle > 0.7) drawBadge(c, p.x, headY, 'hands', p.col, t); // only once they have stood together for a moment
  }
}
function drawFlyingPieces(c, t) { // the torn pieces on the wind, and a piece hopping up to the corner of the screen when it is found
  const m = game.map; if (!m.gust) return;
  const spots = kit.filter((o) => o.spot).sort((a, b) => a.piece - b.piece).map((o) => o.spot).concat([[m.from[0] + 1900, 240]]);
  spots.forEach(([x, y], i) => { if (m.landed(i) || m.t <= 0) return; const u = clamp01(m.t / (1.5 + i * 0.3)); drawPiece(c, lerp(m.from[0], x, u), lerp(m.from[1], y, u) - Math.sin(u * Math.PI) * 260, u * 9 + i, MAP.pictures[i], 1.2); });
  if (m.took) { const u = ease(clamp01(m.took.t / 0.9)); drawPiece(c, lerp(m.took.x, camX + 60 + m.took.i * 44, u), lerp(m.took.y, game.lift + 110, u) - Math.sin(u * Math.PI) * 120, u * 6, MAP.pictures[m.took.i], lerp(1.6, 1, u)); }
}
function drawHud(c, top) { // pictures only: the map pieces found, and the stars
  const x = camX + 22, m = game.map;
  c.save(); rrect(c, x, top + 20, 26 + starsAll * 42, 52, 14); fs(c, 'rgba(255,248,230,.9)', '#8a6a3a', 2);
  kit.filter((o) => o.star).forEach((o, i) => { c.globalAlpha = o.star.got ? 1 : 0.22; const pop = o.star.got ? 1 + Math.max(0, 0.5 - o.star.t) * 0.9 : 1; drawIcon(c, 'star', x + 34 + i * 42, top + 47, 1.05 * pop); });
  c.globalAlpha = 1;
  if (m.gust && m.t > 1) { // four places for the pieces of the map
    rrect(c, x, top + 82, 204, 56, 14); fs(c, 'rgba(255,248,230,.9)', '#8a6a3a', 2);
    m.got.forEach((g, i) => { const px = x + 38 + i * 44, py = top + 110; if (g && !(m.took && m.took.i === i)) drawPiece(c, px, py, 0.15 * (i - 1.5), MAP.pictures[i], 1); else if (!g) { rrect(c, px - 15, py - 14, 30, 28, 4); c.strokeStyle = '#b9a07a'; c.setLineDash([4, 4]); c.lineWidth = 2; c.stroke(); c.setLineDash([]); } });
  }
  c.restore();
}
function drawEnd(c, t, top) { // the end card: pictures and numbers only
  const a = Math.min(1, game.endT); c.fillStyle = `rgba(28,18,10,${a * 0.8})`; c.fillRect(camX - 10, 0, VW + 20, VH + top + 40);
  c.save(); c.globalAlpha = a; const w = 620, h = 330, x = camX + VW / 2 - w / 2, y = top + (VH - top) / 2 - h / 2 - 40; parchment(c, x, y, w, h);
  game.map.got.forEach((g, i) => drawPiece(c, x + w / 2 - 99 + i * 66, y + 78, 0.12 * (i - 1.5), MAP.pictures[i], 1.7));
  const secs = Math.floor(game.finished || game.time), time = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
  c.fillStyle = INK; c.font = '700 44px Georgia, serif'; c.textBaseline = 'middle'; c.textAlign = 'left';
  drawIcon(c, 'star', x + 120, y + 190, 2.2); c.fillText(starsGot() + ' / ' + starsAll, x + 166, y + 192);
  c.beginPath(); circ(c, x + 370, y + 190, 30); fs(c, '#fffbf0', INK, 4); c.strokeStyle = INK; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 370, y + 172); c.lineTo(x + 370, y + 190); c.lineTo(x + 383, y + 198); c.stroke(); c.fillText(time, x + 414, y + 192);
  if (game.endT > 1.2) { c.globalAlpha = a * (0.6 + Math.sin(t * 4) * 0.4); drawIcon(c, 'up', x + w / 2, y + h - 48, 1.5, '#6d9b45'); } // "press jump to go on"
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
  STATIONS.forEach((s, n) => { c.strokeStyle = 'rgba(120,200,255,.8)'; c.setLineDash([14, 10]); c.beginPath(); c.moveTo(s.x[0], 0); c.lineTo(s.x[0], VH); c.stroke(); c.setLineDash([]); tag('station ' + s.name, s.x[0] + 8, top + 150, '#bfe2ff'); });
  for (const id in KIT_AT) tag(id + (KIT_SIG[id] ? ' ON' : ' off'), KIT_AT[id].x - 30, FEET + 60, KIT_SIG[id] ? '#ffe27a' : '#b9b0a4');
  const lines = [`fps ${game.fps.toFixed(0)}   slowest frame ${game.slow.toFixed(0)} ms   cam ${camX.toFixed(0)}   station ${game.station}   map ${piecesGot()}/4   stars ${starsGot()}/${starsAll}   time ${game.time.toFixed(0)} s`,
    ...players.map((p) => `${p.who.padEnd(7)} x ${p.x.toFixed(0).padStart(5)}  y ${(FEET - p.y).toFixed(0).padStart(4)} up  vx ${p.vx.toFixed(0).padStart(5)} vy ${p.vy.toFixed(0).padStart(5)}  ${p.gone ? 'gone' : p.held ? 'held' : p.climb ? 'climb' : p.grounded ? 'ground' : 'air'}${p.crawl ? ' crawl' : ''}${p.carry ? ' carry' : ''}${p.holding ? ' holding' : ''}  on ${p.on ? (p.on.isBody ? 'box' : p.on.isLedge ? 'ledge' : 'solid') : '-'}  load ${world.load(p)}`),
    `duo ${MV.duo.state || '-'}   jump ${(MOVE.jumpHeight * broHeight()).toFixed(0)} units in ${MOVE.jumpTime}s   gravity ${moveGravity().toFixed(0)}`];
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
    if (top > 0) { c.fillStyle = textureFast(c, W('road')); c.fillRect(camX - 10, VH - 2, VW + 20, top + 30); }
    drawStreet(c, t);
  }
  liveWater(c, t); drawPigeons(c, t);
  for (const o of kit) if (o.draw) o.draw(c, t);
  for (const b of world.bodies) if (!b.held && !b.gone) drawShadow(c, b);
  for (const o of kit) if (o.body && !o.body.held) o.body.draw(c, t);
  for (const p of players) { if (p.gone) continue; drawChar(p, t); if (p.carry) p.carry.draw(c, t); }
  for (const o of kit) if (o.drawFront) o.drawFront(c, t);
  for (const [a, b] of WATER) if (inView(a, b)) { // the near water, in front of whatever is sinking into it
    c.fillStyle = lg(c, 0, FEET + 26, 0, VH + top, 'rgba(111,154,176,.55)', 'rgba(63,106,130,.96)'); c.fillRect(a + 16, FEET + 26, b - a - 32, VH + top - FEET);
    c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 2.5; for (let i = 0; i < 7; i++) { const xx = a + 30 + ((i * 139 + t * 26) % (b - a - 100)), yy = FEET + 34 + (i % 3) * 22; c.beginPath(); c.moveTo(xx, yy); c.quadraticCurveTo(xx + 18, yy - 5, xx + 36, yy); c.stroke(); }
  }
  drawFlyingPieces(c, t);
  drawLampGlow(c); drawLeaves(c, t); drawMoveFx(c); drawSparks(c);
  drawStreetGlow(c);
  if (ZOOM <= 1) { if (!game.done) { drawHints(c, t); drawHud(c, top); } if (DEBUG) drawDebug(c, t, top); if (game.done) drawEnd(c, t, top); }
  requestAnimationFrame(frame);
}

// ---------- sliders for the feel (?tune=1): a developer's tool, so it uses words
function tunePanel() {
  const rows = [['jumpHeight', 0.8, 2.2, 0.05], ['jumpTime', 0.2, 0.6, 0.01], ['fallFaster', 1, 2.5, 0.05], ['coyote', 0, 0.3, 0.01], ['buffer', 0, 0.3, 0.01],
    ['speed.sister', 150, 450, 5], ['speed.brother', 150, 450, 5], ['accel', 800, 5000, 100], ['brake', 800, 6000, 100], ['airAccel', 400, 4000, 100], ['airBrake', 0, 3000, 20],
    ['liftWalk', 0.2, 1, 0.05], ['tossRise', 1, 3, 0.05], ['tossForward', 0, 450, 10], ['seesawRise', 1.5, 4, 0.05], ['crateJump', 0, 1, 0.05], ['climbSpeed', 100, 500, 10], ['stride', 1, 2, 0.05]];
  const get = (k) => k.split('.').reduce((o, part) => o[part], MOVE), put = (k, v) => { const parts = k.split('.'), last2 = parts.pop(); parts.reduce((o, part) => o[part], MOVE)[last2] = v; };
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;right:10px;top:10px;z-index:8;background:#1c120ae6;color:#fff6dc;font:12px/1.5 monospace;padding:10px 12px;border-radius:10px;max-height:94vh;overflow:auto';
  box.innerHTML = '<b>MOVE</b> (shared/movement.js)<br>' + rows.map(([k, lo, hi, st]) => `<label style="display:grid;grid-template-columns:104px 150px 44px;align-items:center;gap:6px">${k}<input type="range" data-k="${k}" min="${lo}" max="${hi}" step="${st}" value="${get(k)}"><span>${get(k)}</span></label>`).join('') + '<button style="margin-top:6px">copy the numbers</button> <span id="tuned"></span>';
  box.addEventListener('input', (e) => { const k = e.target.dataset.k; if (!k) return; put(k, +e.target.value); e.target.nextElementSibling.textContent = e.target.value; });
  box.addEventListener('keydown', (e) => e.stopPropagation());
  box.querySelector('button').addEventListener('click', () => { const text = rows.map(([k]) => k + ': ' + get(k)).join(', '); if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {}); box.querySelector('#tuned').textContent = 'copied'; console.log(text); });
  document.body.appendChild(box);
}

addEventListener('resize', fitScreen); fitScreen();
if (TUNE) tunePanel();
camX = cameraTarget();
requestAnimationFrame((tm) => { last = tm; frame(tm); });

'use strict';
// Learning to move, without words. For somebody who has never seen the game and does not know which keys do what.
// Each player's keys are shown as big pictures next to their own sibling, in that sibling's colour (green for her,
// blue for him), one move at a time:
//   1. walking: the left key and the right key, one on each side. Each fades once that player has walked that way.
//   2. jumping: the jump key over the head, once the walking is done. It fades with the first jump.
//      Later, in section 1 only, it comes back for a moment whenever somebody stands stuck in front of a step.
//   3. the grab key: not before it is needed. It shows over whoever stands where grab would do something for the
//      first time (the box in section 3; for the other one perhaps the pond, or the lift), and once more when the box
//      is carried to the plate, for putting it down.
// A player who stands still for a few seconds with a picture showing gets a faint ghost of their own sibling that
// shows the move. On touch screens there are no keys: that player's on-screen button pulses instead, and the picture
// by the sibling is a small copy of that button. Buttons for moves that have not come up yet are faint (they work).
// On a computer the row of keys at the bottom of the page fills up as each move is learned.
// The numbers are LEARN_SET in settings.js. level.js calls learnUpdate, learnGhosts, learnDraw and learnShows.
const LEARN = {}, LEARN_COL = { sister: '#6d9b45', brother: '#4b86b8' };
const LEARN_GLYPH = { KeyA: 'A', KeyD: 'D', KeyW: 'W', KeyS: 'S', ArrowLeft: -Math.PI / 2, ArrowRight: Math.PI / 2, ArrowUp: 0, ArrowDown: Math.PI };
let learnPads = null, learnSeen = '';

function learnStart() {
  const known = FROM > 0 || AT > 0, late = FROM >= 3; // starting part-way (?section=): the moves before it count as known
  for (const p of players) LEARN[p.who] = { stage: known ? 2 : 0, left: 0, right: 0, x: p.x, y: p.y, wasDown: true, stuck: null, stuckDir: 1, block: 0, wait: 0, demo: 'walk', demoDir: 1,
    a: { left: 0, right: 0, jump: 0, grab: 0 }, on: { left: false, right: false, jump: false, grab: false }, shown: null, sign: 'hand', grab: late, put: late, met: late, jumps: 0 };
  if (pads) { // the on-screen buttons: one that pulses, and faint ones for later
    const css = document.createElement('style');
    css.textContent = `@keyframes learnpulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,246,194,0)}50%{transform:scale(1.12);box-shadow:0 0 0 9px rgba(255,246,194,.6)}}
.tpad button{transition:opacity .5s}.tpad button.later{opacity:.34}.tpad button.pulse{animation:learnpulse 1.25s ease-in-out infinite;border-color:#fff6c2}.tpad button.pulse.on{animation:none}`;
    document.head.appendChild(css); learnPads = {}; for (const b of document.querySelectorAll('.tpad button')) learnPads[b.dataset.k] = b;
  }
}

// ---------- every frame: what each player has done, and which pictures show
function learnUpdate(dt) {
  if (!LEARN.sister) learnStart();
  const plate = kitIn(2, 'plate'), first = SECTIONS[0].x[1] - 100, quiet = game.done || game.exitT >= 0;
  for (const p of players) {
    const L = LEARN[p.who], k = p.keys, dx = p.x - L.x, away = p.gone || p.held;
    L.x = p.x; L.y += (p.y - L.y) * Math.min(1, dt * 9);
    if (p.want && Math.sign(dx) === p.want && Math.abs(dx) < 60) L[p.want < 0 ? 'left' : 'right'] += Math.abs(dx); // walked that way with their own key
    const jumped = !p.grounded && !p.held && p.vy < -200 && L.wasDown; L.wasDown = p.grounded; if (jumped) L.jumps++;
    // stuck in front of a step: pushing against it, or standing where they were stopped
    const push = p.grounded && p.want && p.hitSide === p.want && p.x < first && (p.want > 0 || p.x > PARK.walk[0] + 120);
    L.block = push ? L.block + dt : 0;
    if (L.block > 0.25) { L.stuck = p.x; L.stuckDir = p.want; }
    if (L.stuck !== null && (jumped || Math.abs(p.x - L.stuck) > 50)) L.stuck = null;
    const before = L.stage;
    if (L.stage === 0 && ((L.right >= LEARN_SET.walked && (L.left >= LEARN_SET.walked || L.right >= LEARN_SET.enough)) || L.stuck !== null)) L.stage = 1;
    else if (L.stage === 1 && jumped && L.a.jump > 0.3) L.stage = 2;
    // the grab key: where it would do something for the first time, and once more to put the box down
    if (L.shown === 'pick' && (hit(k.down) || p.carry)) L.grab = true;
    if (L.shown === 'put' && (hit(k.down) || !p.carry)) L.put = true;
    const sign = away && !p.held ? null : signFor(p);
    L.shown = quiet ? null : p.carry ? (!L.put && plate && Math.abs(p.x - plate.def.x) < 150 ? 'put' : null) : !L.grab && sign ? 'pick' : null;
    if (L.shown) { L.met = true; L.sign = sign || 'hand'; }
    // which pictures show
    const was = L.on, on = { left: L.stage === 0 && L.left < LEARN_SET.walked, right: L.stage === 0 && L.right < LEARN_SET.walked,
      jump: L.stage === 1 || (L.stage === 2 && L.stuck !== null && !L.shown), grab: !!L.shown };
    if (quiet || (away && !on.grab)) on.left = on.right = on.jump = false;
    if (quiet) on.grab = false;
    for (const key in on) L.a[key] = clamp01(L.a[key] + (on[key] ? dt * 3 : -dt * 2.4));
    // standing still with a picture showing: after a few seconds a ghost shows the move
    const still = p.grounded && Math.abs(p.vx) < 12, show = on.left || on.right || on.jump;
    if (L.stage !== before || on.jump !== was.jump || !show || !still) L.wait = 0; else L.wait += dt;
    L.demo = on.jump ? 'jump' : 'walk'; L.demoDir = on.jump ? (L.stuck !== null ? L.stuckDir : 0) : on.right ? 1 : -1;
    L.on = on;
  }
  // the buttons and the row of keys follow
  const seen = players.map((p) => { const L = LEARN[p.who]; return [L.stage, +L.on.left, +L.on.right, +L.on.jump, +L.on.grab, +L.met, +(L.grab || L.put)].join(''); }).join(' ');
  if (seen !== learnSeen) { learnSeen = seen; learnShowKeys(); }
}
function learnShowKeys() {
  const hud = document.getElementById('hud');
  for (const p of players) {
    const L = LEARN[p.who], k = p.keys;
    if (learnPads) for (const [what, code] of [['left', k.left], ['right', k.right], ['jump', k.up], ['grab', k.down]]) {
      const b = learnPads[code]; if (!b) continue;
      b.classList.toggle('pulse', L.on[what]); b.classList.toggle('later', what === 'jump' ? L.stage === 0 : what === 'grab' ? !(L.met || L.grab) : false);
    }
    const box = hud && hud.querySelector(p === sis ? '.s' : '.b'); if (!box) continue; // the row of keys at the bottom: each part comes on when it has been learned
    const parts = { walk: L.stage > 0, jump: L.stage > 1, grab: L.grab || L.put }; let any = false;
    for (const key in parts) { const el = box.querySelector('.k-' + key); if (el) el.classList.toggle('on', parts[key]); any = any || parts[key]; }
    box.classList.toggle('on', any);
  }
}
const learnShows = (p) => !!(LEARN[p.who] && LEARN[p.who].a.grab > 0.2); // level.js leaves its little hand sign out while the key itself is shown

// ---------- the ghost: a faint copy of their own sibling walks off, or jumps, and comes back to do it again
function learnGhost(c, p, x, y, fade, t, o) {
  if (fade <= 0.02) return;
  const g = Object.assign(Object.create(p), { x, y, alpha: 0, m: o.m || 0, phase: o.phase || 0, cheer: 0, giggle: 0, sqx: 1, sqy: 1, tilt: o.tilt || 0, scale: 1, dir: o.dir || p.dir, carry: null,
    ex: Object.assign({}, p.ex, { arm: 0, sweat: 0, blinkF: 1 }), pose: Object.assign({}, p.pose, { air: o.air || 0, rise: o.rise || 0, carry: 0, hold: 0, ride: 0, toss: 0, strain: 0, crawl: 0, climb: 0, t }) });
  drawChar(g, t); // fills the character buffer without showing it; then the buffer is washed in their colour and shown faintly
  const b = buf.c; b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-atop'; b.globalAlpha = 0.6; b.fillStyle = p.col; b.fillRect(0, 0, buf.cv.width, buf.cv.height); b.globalAlpha = 1; b.globalCompositeOperation = 'source-over';
  c.save(); c.globalAlpha = fade; c.drawImage(buf.cv, x - BAX, y - BAY, BW, BH); c.restore();
  for (let k = 0; k < 2; k++) star(c, x + Math.cos(t * 2 + k * 3.1) * 64, y - 120 + Math.sin(t * 2.6 + k * 3.1) * 80, 8 + Math.sin(t * 5 + k) * 3, t + k, fade); // it glitters: a picture, not a person
}
function learnGhosts(c, t) {
  for (const p of players) {
    const L = LEARN[p.who]; if (!L || L.wait < LEARN_SET.ghost || p.gone || p.held) continue;
    const tt = L.wait - LEARN_SET.ghost, come = clamp01(tt / 0.5);
    if (L.demo === 'walk') { // a few steps that way, fading out
      const u = (tt % 1.8) / 1.8, d = L.demoDir;
      learnGhost(c, p, p.x + d * (26 + 210 * u), p.y, come * 0.7 * Math.pow(Math.sin(Math.PI * u), 0.6), t, { dir: d, m: 1, phase: u * 10 });
    } else { // a jump: on the spot, or up onto the step they are stuck at
      const u = (tt % 2) / 2, v = Math.min(1, u / 0.42), d = L.demoDir, tx = p.x + d * 120, fl = d ? MV.world.below(p, tx, p.y - 320).y : p.y, ty = fl === Infinity ? p.y : fl;
      const x = lerp(p.x, tx, v), y = lerp(p.y, ty, v) - 4 * v * (1 - v) * MOVE.jumpHeight * broHeight() * 0.8;
      const fade = v < 1 ? Math.min(1, v * 5) : d ? clamp01(1 - (u - 0.42) / 0.4) : clamp01(1 - (u - 0.42) / 0.12); // after landing it stands a moment (on the step), then goes
      learnGhost(c, p, x, y, come * 0.7 * fade, t, { dir: d || p.dir, air: v < 1 ? 1 : 0, rise: v < 0.5 ? 1 : 0 });
    }
  }
}

// ---------- the pictures: a key with its letter (or, on touch screens, a copy of the button), and what it does
function learnKey(c, x, y, what, p, a, t, sign) {
  if (a <= 0.01) return;
  const L = LEARN[p.who], col = LEARN_COL[p.who], code = p.keys[what === 'jump' ? 'up' : what === 'grab' ? 'down' : what], glyph = LEARN_GLYPH[code];
  const going = !L.on[what], beat = Math.sin(t * 4.4), k = learnSize() * (going ? 1 + (1 - a) * 0.5 : 0.8 + a * 0.2 + beat * 0.03); // it grows a little as it goes
  const ang = what === 'left' ? -Math.PI / 2 : what === 'right' ? Math.PI / 2 : 0, nudge = going ? 0 : (0.5 + 0.5 * beat) * 9;
  c.save(); c.translate(x, y); c.scale(k, k); c.globalAlpha = a; c.lineJoin = 'round'; c.lineCap = 'round';
  if (pads) { // the button, as it looks under their thumb, moving the way it sends them
    c.translate(Math.sin(ang) * nudge, what === 'jump' ? -nudge : 0);
    rrect(c, -36, -36, 72, 72, 17); fs(c, col, '#fffbf0', 4);
    if (what === 'grab') drawIcon(c, sign === 'hands' ? 'hands' : 'hand', 0, 2, sign === 'hands' ? 1.7 : 1.5, '#ffffff');
    else { c.rotate(ang); c.beginPath(); if (what === 'jump') { c.moveTo(0, -22); c.lineTo(21, 2); c.lineTo(9, 2); c.lineTo(9, 22); c.lineTo(-9, 22); c.lineTo(-9, 2); c.lineTo(-21, 2); } else { c.moveTo(0, -17); c.lineTo(19, 13); c.lineTo(-19, 13); } c.closePath(); fs(c, '#ffffff', '#ffffff', 3); }
    c.restore(); return;
  }
  // what the key does, on its outer side: an arrow in their colour, or a hand
  if (what === 'grab') { c.save(); c.translate(0, -74 - nudge * 0.5); c.beginPath(); circ(c, 0, 0, 30); fs(c, col, '#fffbf0', 3.5); drawIcon(c, sign === 'hands' ? 'hands' : 'hand', 0, sign === 'hands' ? 0 : 1, sign === 'hands' ? 1.35 : 1.2); c.restore(); }
  else { c.save(); c.rotate(ang); c.translate(0, -70 - nudge); drawIcon(c, 'up', 0, 0, 1.75, col); c.restore(); }
  // the key: a frame in their colour, a pale top, and its letter or arrow
  rrect(c, -39, -37, 78, 82, 17); fs(c, shade(col, -0.28), INK, 3); rrect(c, -39, -39, 78, 76, 17); fs(c, col, INK, 3);
  rrect(c, -29, -31, 58, 56, 11); fs(c, '#fffbf0', 'rgba(58,38,24,.4)', 2);
  if (typeof glyph === 'string') { c.fillStyle = INK; c.font = '700 38px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(glyph, 0, -1); }
  else { c.translate(0, -3); c.rotate(glyph); c.strokeStyle = INK; c.lineWidth = 6.5; c.beginPath(); c.moveTo(0, 15); c.lineTo(0, -14); c.moveTo(-12, -3); c.lineTo(0, -15); c.lineTo(12, -3); c.stroke(); }
  c.restore(); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
}
function learnSize() { // bigger on small screens, so that a picture is never smaller than a fingertip
  const px = innerHeight / VH; return pads ? clamp(46 / (72 * px), 1.15, 1.75) : clamp(44 / (78 * px), 1, 1.6);
}
const learnOver = (p) => (LEARN[p.who] ? Math.max(LEARN[p.who].a.jump, LEARN[p.who].a.grab) : 0); // how much a key picture shows over this head (level.js fades the thought bubble by it)
function learnDraw(c, t) {
  for (const p of players) {
    const L = LEARN[p.who]; if (!L || p.gone) continue;
    const big = learnSize(), lo = camX + 50 * big, hi = camX + VW - 50 * big, side = p === sis ? 110 + 44 * big : 70, out = (pads ? 76 : 90) + 40 * big; // hers a row higher than his, so that the two never cover each other
    const sx = clamp(p.x, lo + (pads ? out : out + 70 * big), hi - (pads ? out : out + 70 * big));
    learnKey(c, sx - out, L.y - side, 'left', p, L.a.left, t);
    learnKey(c, sx + out, L.y - side, 'right', p, L.a.right, t);
    const top = L.y - p.h - (p.carry ? 150 : 56) - 40 * big, gap = Math.abs(sis.x - bro.x), apart = gap < 110 * big ? (p === sis ? -1 : 1) * (55 * big - gap / 2) : 0; // side by side: hers a little to the left, his to the right
    learnKey(c, clamp(p.x + apart, lo, hi), Math.max(top, 150), 'jump', p, L.a.jump, t);
    learnKey(c, clamp(p.x + apart, lo, hi), Math.max(top, 190), 'grab', p, L.a.grab, t, L.sign);
  }
}

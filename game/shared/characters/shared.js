'use strict';
// Parts both characters share: legs, arms, faces and the expression logic.
// Each character keeps its own look in its own file next to this one.
const newExpr = (o) => ({ open: o.open, happy: 0, smile: 0.55, mouth: 0, mw: 1, brow: 0, tilt: 0, lx: 1.2, ly: 0.2, blush: 0.55, sweat: 0, head: 0, arm: 0, blinkF: 1 });

function limb(c, q, w, col, edge) {
  c.beginPath(); c.moveTo(q[0], q[1]); c.quadraticCurveTo(q[2], q[3], q[4], q[5]);
  c.strokeStyle = edge; c.lineWidth = w + 3; c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.stroke();
}
// Where a foot is in the walk cycle: planted and sliding back for half of it, lifted and swinging forward for the rest.
function legPose(ph, m, A, lift, stand) {
  const u = ((ph / TAU) % 1 + 1) % 1; let x, l = 0, rot = 0;
  if (u < 0.5) x = A * (1 - 4 * u);
  else { const s = (u - 0.5) * 2; x = -A + 2 * A * (0.5 - 0.5 * Math.cos(Math.PI * s)); l = Math.sin(Math.PI * s) * lift; rot = Math.sin(TAU * s) * 0.5; }
  return { x: stand + (x - stand) * m, l: l * m, rot: rot * m };
}
// Two-bone leg: the knee position is solved from where the hip and the foot are.
function drawLeg(c, hx, hy, pose, L, k) {
  const tx = hx + pose.x, ty = -12.5 - pose.l, dx = tx - hx, dy = ty - hy, d = Math.min(Math.hypot(dx, dy), L * 2 - 0.3), a = Math.atan2(dy, dx), b = Math.acos(d / (2 * L));
  const kx = hx + Math.cos(a - b) * L, ky = hy + Math.sin(a - b) * L, fx = kx + Math.cos(a + b) * L, fy = ky + Math.sin(a + b) * L;
  c.beginPath(); c.moveTo(hx, hy - 4); c.lineTo(kx, ky); c.lineTo(fx, fy - 4);
  c.strokeStyle = k.edge; c.lineWidth = 19.5; c.stroke(); c.strokeStyle = k.pants; c.lineWidth = 16.5; c.stroke();
  c.strokeStyle = k.edge; c.globalAlpha = 0.45; c.lineWidth = 1.6; c.beginPath(); c.moveTo(kx - 5, ky + 1); c.quadraticCurveTo(kx, ky + 3.5, kx + 6, ky); c.stroke(); c.globalAlpha = 1;
  c.save(); c.translate(fx, fy); c.rotate(pose.rot);
  c.beginPath(); c.moveTo(-9.5, -13); c.lineTo(9, -13); c.lineTo(10, -2); c.quadraticCurveTo(25, -2, 26, 7); c.lineTo(26, 9.5); c.lineTo(-10.5, 9.5); c.closePath(); fs(c, lg(c, 0, -13, 0, 10, k.cuff, k.boot), k.bootEdge, 2);
  rrect(c, -12, 8.5, 39.5, 4.5, 2); c.fillStyle = k.sole; c.fill();
  rrect(c, -11.5, -18, 22.5, 9, 4); fs(c, k.cuff, k.bootEdge, 1.8);
  c.strokeStyle = 'rgba(255,235,200,.3)'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(4, -6); c.lineTo(9.5, -6); c.moveTo(5, -2.5); c.lineTo(11, -2.5); c.stroke();
  ell(c, 18, 3, 4.5, 2.2, '#ffffff', 0.22);
  c.restore();
}
// ---------- poses a world can ask for
// A world where the siblings jump and carry (the city lab) gives each of them p.pose: a few numbers from 0 to 1.
// Worlds that leave p.pose unset (the house, the forest) draw exactly as they always did.
//   air     off the ground                         rise    going up (0 = coming down)
//   carry   both arms up, steadying a box on the head
//   hold    the sister holding her brother up on her shoulders
//   ride    the brother balancing up there          toss    flying after a toss or a see-saw launch
//   strain  heaving at something too heavy          stride  longer steps for running (1 = the walking step)
//   climb   going up a ladder (step counts the rungs)
function poseStride(p) { return (p.pose && p.pose.stride) || 1; }
function poseFlow(p, m) { const q = p.pose; return q ? Math.max(m, q.air * 0.8, q.toss) : m; } // how far capes and scarves stream out
function poseLift(p) { const q = p.pose; return q ? q.air * (1 - q.rise) * 44 : 0; }            // a cape flies up on the way down
function poseLeg(p, front, walk) {
  const q = p.pose; if (!q) return walk;
  let out = walk;
  const to = (x, l, rot, k) => { if (k > 0.001) out = { x: out.x + (x - out.x) * k, l: out.l + (l - out.l) * k, rot: out.rot + (rot - out.rot) * k }; };
  to(front ? 6 + 8 * q.rise : -9 + 2 * q.rise, front ? 7 + 15 * q.rise : 13 - 9 * q.rise, front ? 0.15 - 0.4 * q.rise : 0.55, q.air); // a knee up going up, legs loose coming down
  to(front ? -6 : -16, front ? 5 : 14, 0.6, q.toss);   // tossed: legs trailing
  to(front ? 5 : -5, 0, 0, q.ride);                    // on her shoulders: feet together
  to(front ? 13 : -13, 0, 0, q.strain);                // heaving: feet planted wide
  if (q.climb) to(4, 9 + Math.sin((q.step || 0) + (front ? 0 : Math.PI)) * 9, 0, q.climb); // up a ladder: one foot, then the other
  return out;
}
function poseArm(p, front, th) { // th is the arm's angle: 0 hangs down, a quarter turn points ahead, a half turn points straight up
  const q = p.pose; if (!q) return th;
  const t = q.t || 0, flap = Math.sin(t * 17 + (front ? 0 : 1.3)) * 0.22, to = (a, k) => { if (k > 0.001) th += (a - th) * k; };
  to(front ? 2.45 - 0.55 * q.rise + flap * (1 - q.rise) : -2.2 + 3.6 * q.rise - flap * (1 - q.rise), q.air);  // "hup" going up, arms out coming down
  to(front ? 2.2 + flap * 0.5 : -2.5 - flap * 0.5, q.toss);                        // wheee: arms flung wide
  to(front ? 1.55 + Math.sin(t * 5) * 0.28 : -1.55 + Math.sin(t * 5) * 0.28, q.ride); // arms out, wobbling for balance
  to(front ? 2.6 : 3.62, q.hold);
  to(front ? 2.48 : 3.72, q.carry);                                                  // one hand in front of the load, one behind: the face stays clear
  to(front ? 0.8 : 0.55, q.strain);
  if (q.climb) to(2.35 + Math.sin((q.step || 0) + (front ? Math.PI : 0)) * 0.45, q.climb); // hand over hand
  return th;
}

// ---------- faces and expressions
// Each character has its own features. An expression is a handful of numbers (eye openness, smile, brow tilt...)
// that glide toward a target chosen from what is happening in the game, so faces change smoothly.
function headPath(c, fx, fy, r) { // a soft head shape: fuller front cheek, chin a little forward
  c.beginPath(); c.moveTo(fx - r * 0.98, fy - r * 0.1);
  c.bezierCurveTo(fx - r, fy - r * 0.75, fx - r * 0.55, fy - r * 1.02, fx, fy - r);
  c.bezierCurveTo(fx + r * 0.6, fy - r, fx + r * 1.02, fy - r * 0.6, fx + r, fy - r * 0.02);
  c.bezierCurveTo(fx + r, fy + r * 0.5, fx + r * 0.72, fy + r * 0.98, fx + r * 0.18, fy + r * 1.04);
  c.bezierCurveTo(fx - r * 0.45, fy + r * 1.06, fx - r * 0.95, fy + r * 0.6, fx - r * 0.98, fy - r * 0.1); c.closePath();
}
function drawEye(c, x, y, k, e, o) {
  const rx = 6.6 * k, ry = 8.2 * k, open = e.open * e.blinkF;
  c.lineCap = 'round';
  if (e.happy > 0.5) { // closed, smiling eyes
    c.strokeStyle = o.lash; c.lineWidth = 2.7 * k; c.beginPath(); c.moveTo(x - rx, y + 2.5 * k); c.quadraticCurveTo(x, y - 7 * k, x + rx, y + 2.5 * k); c.stroke(); return;
  }
  if (open < 0.18) { // shut
    c.strokeStyle = o.lash; c.lineWidth = 2.5 * k; c.beginPath(); c.moveTo(x - rx, y + 1 * k); c.quadraticCurveTo(x, y + 5 * k, x + rx, y + 1 * k); c.stroke();
    if (o.flick) { c.lineWidth = 1.5 * k; c.beginPath(); c.moveTo(x - rx, y + 1 * k); c.lineTo(x - rx - 2.6 * k, y + 2.6 * k); c.moveTo(x - rx * 0.5, y + 3.2 * k); c.lineTo(x - rx * 0.7, y + 5.6 * k); c.stroke(); }
    return;
  }
  const h = ry * Math.min(1.12, open), cy = y + (ry - h) * 0.35;
  c.save(); c.beginPath(); c.ellipse(x, cy, rx, h, 0, 0, TAU); c.fillStyle = '#fffaf2'; c.fill(); c.clip();
  const ix = x + e.lx * k, iy = y + 0.8 * k + e.ly * k, ir = 5.7 * k;
  c.beginPath(); c.arc(ix, iy, ir, 0, TAU); c.fillStyle = lg(c, 0, iy - ir, 0, iy + ir, o.iris[0], o.iris[1], o.iris[2]); c.fill(); c.strokeStyle = o.iris[0]; c.lineWidth = 1.3 * k; c.stroke();
  ell(c, ix, iy + 0.3 * k, 2.7 * k, 3.1 * k, '#150c08');
  c.fillStyle = 'rgba(45,20,20,.24)'; c.fillRect(x - rx, cy - h - 1, rx * 2, h * 0.55);
  ell(c, ix + 2.1 * k, iy - 2.7 * k, 2.3 * k, 2.3 * k, '#fff'); ell(c, ix - 2.3 * k, iy + 2.7 * k, 1.1 * k, 1.1 * k, '#fff', 0.85);
  c.restore();
  c.strokeStyle = o.lash; c.lineWidth = 2.6 * k; c.beginPath(); c.ellipse(x, cy, rx, h, 0, Math.PI * 1.02, Math.PI * 1.98); c.stroke();
  if (o.flick) { c.lineWidth = 1.7 * k; c.beginPath(); c.moveTo(x - rx, cy - h * 0.08); c.lineTo(x - rx - 2.8 * k, cy - h * 0.42); c.moveTo(x - rx * 0.86, cy - h * 0.5); c.lineTo(x - rx * 1.12, cy - h * 0.86); c.stroke(); }
  c.globalAlpha = 0.35; c.lineWidth = 1.2 * k; c.beginPath(); c.ellipse(x, cy, rx * 0.82, h, 0, Math.PI * 0.22, Math.PI * 0.78); c.stroke(); c.globalAlpha = 1;
}
function drawMouth(c, mx, my, e, o) {
  const w = 6.8 * e.mw, sm = e.smile, op = Math.max(0, e.mouth), cy = my - sm * 2.2;
  c.lineCap = 'round';
  if (op < 0.12) { c.strokeStyle = '#8a3b2e'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(mx - w, cy); c.quadraticCurveTo(mx, cy + sm * 7.5, mx + w, cy); c.stroke(); }
  else {
    const dep = 2.5 + op * 7.5 + Math.max(0, sm) * 1.5;
    const lips = () => { c.beginPath(); c.moveTo(mx - w, cy); c.quadraticCurveTo(mx, cy + sm * 2.2, mx + w, cy); c.bezierCurveTo(mx + w * 1.05, cy + dep * 1.3, mx - w * 1.05, cy + dep * 1.3, mx - w, cy); c.closePath(); };
    lips(); c.fillStyle = '#6e2420'; c.fill(); c.save(); c.clip();
    ell(c, mx, cy + dep * 1.05, w * 0.7, dep * 0.4, '#e0605a');
    if (op > 0.3 && sm > 0.2) { c.fillStyle = '#fffaf0'; c.fillRect(mx - w, cy - 2, w * 2, 3.4 + sm * 1.4); if (o.gap) { c.fillStyle = '#6e2420'; c.fillRect(mx - 0.8, cy - 2, 1.6, 6); } }
    c.restore(); lips(); c.strokeStyle = '#7a2e24'; c.lineWidth = 1.8; c.stroke();
  }
  if (sm > 0.5) { c.strokeStyle = 'rgba(170,90,70,.55)'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(mx - w - 2.4, cy - 2.2); c.quadraticCurveTo(mx - w - 3.4, cy, mx - w - 1.6, cy + 1.6); c.moveTo(mx + w + 2.2, cy - 2.2); c.quadraticCurveTo(mx + w + 3.2, cy, mx + w + 1.4, cy + 1.6); c.stroke(); }
}
// Skin, cheeks, eyes, nose and mouth. Hair goes on top of this, then drawFaceTop adds the brows over the hair.
function drawFace(c, p, fx, fy, r) {
  const e = p.ex, o = p.face;
  headPath(c, fx, fy, r); c.fillStyle = rg(c, fx + r * 0.3, fy - r * 0.15, r * 1.25, '#fddfbe', '#f7cda6', '#e6ae86'); c.fill(); c.strokeStyle = '#bf845f'; c.lineWidth = 1.7; c.stroke();
  c.save(); c.clip();
  c.fillStyle = lg(c, 0, fy - r, 0, fy - r * 0.05, 'rgba(160,85,55,.42)', 'rgba(160,85,55,0)'); c.fillRect(fx - r, fy - r, r * 2, r); // shade under hair or hood
  c.fillStyle = rg(c, fx - r * 0.9, fy + r * 0.9, r * 1.1, 'rgba(170,95,70,.4)', 'rgba(170,95,70,0)'); c.fillRect(fx - r - 2, fy - 4, r * 1.4, r + 8); // jaw away from the sun
  for (const [dx, s] of [[-14, 1], [23, 0.8]]) { c.fillStyle = rg(c, fx + dx, fy + 14, 11 * s, `rgba(242,110,100,${0.62 * e.blush})`, 'rgba(242,110,100,0)'); c.fillRect(fx + dx - 12, fy + 2, 24, 24); }
  c.strokeStyle = `rgba(214,84,80,${0.5 * e.blush})`; c.lineWidth = 1.2; c.beginPath(); for (const dx of [-18, -14.5, -11]) { c.moveTo(fx + dx, fy + 16.5); c.lineTo(fx + dx + 2, fy + 12.5); } c.stroke();
  if (o.freckles) { c.fillStyle = 'rgba(180,105,70,.6)'; for (const [dx, dy] of [[-17, 9.5], [-12, 8.5], [-14.5, 11.5], [6, 10], [21, 9.5], [25, 11.5]]) { c.beginPath(); c.arc(fx + dx, fy + dy, 0.9, 0, TAU); c.fill(); } }
  c.restore();
  drawEye(c, fx - 5, fy + 3, 1, e, o); drawEye(c, fx + 16, fy + 3, 0.88, e, o);
  c.strokeStyle = 'rgba(190,120,90,.9)'; c.lineWidth = 1.7; c.beginPath(); c.moveTo(fx + 9.5, fy + 9); c.quadraticCurveTo(fx + 12.5, fy + 11, fx + 9.8, fy + 12.8); c.stroke(); ell(c, fx + 9.6, fy + 8.6, 1.2, 1, '#fff', 0.5);
  if (o.plaster) { c.save(); c.translate(fx + 8.5, fy + 10.5); c.rotate(-0.22); rrect(c, -8.5, -2.7, 17, 5.4, 2.2); fs(c, '#fbf0da', '#c9a67c', 1); c.fillStyle = '#ead6b0'; c.fillRect(-2.6, -2.7, 5.2, 5.4); c.restore(); }
  drawMouth(c, fx + 7.5, fy + 18.5, e, o);
}
function drawFaceTop(c, p, fx, fy) {
  const e = p.ex, o = p.face;
  c.strokeStyle = o.brow; c.lineWidth = o.browW; c.lineCap = 'round';
  for (const [bx, s, w] of [[fx - 5, 1, 7], [fx + 16, -1, 6]]) { // s points toward the nose: that is the brow's inner end
    const by = fy - 8.5 - e.brow * 3.4;
    c.beginPath(); c.moveTo(bx - s * w, by + 2.4 + e.tilt * 1.6); c.quadraticCurveTo(bx - s * 1.5, by - 3.2, bx + s * w, by + 1.4 - e.tilt * 3.6); c.stroke();
  }
  if (e.sweat > 0.05) {
    const sx = fx - 21, sy = fy - 6 + ((p.t * 12) % 14);
    c.globalAlpha = e.sweat * 0.95; c.beginPath(); c.moveTo(sx, sy - 7); c.quadraticCurveTo(sx + 5, sy + 1, sx, sy + 3.4); c.quadraticCurveTo(sx - 5, sy + 1, sx, sy - 7); fs(c, '#c9ecf8', '#7fb6d0', 1); ell(c, sx - 1.2, sy, 1, 1.4, '#fff', e.sweat); c.globalAlpha = 1;
  }
}
function updateExpr(p, other, dt, maxGap) {
  const e = p.ex, o = p.face, gap = Math.abs(other.x - p.x), ahead = Math.sign(other.x - p.x) === p.dir, moving = p.m > 0.5;
  p.idle = moving || p.cheer > 0 ? 0 : p.idle + dt;
  p.gazeT -= dt; if (p.gazeT < 0) { p.gazeT = 1.2 + Math.random() * 2.6; const k = Math.random(); p.gaze = k < 0.5 ? 'partner' : k < 0.78 ? 'ahead' : 'up'; }
  let far = gap > maxGap * 0.72, close = gap < 200 && !moving && other.m < 0.5, sleepy = p.idle > 9 && !close && !far, cheer = p.cheer > 0;
  if (FORCE) { far = FORCE === 'worried'; close = FORCE === 'close' || FORCE === 'giggle'; sleepy = FORCE === 'sleepy' || FORCE === 'yawn'; cheer = FORCE === 'cheer'; }
  const T = { open: o.open, happy: 0, smile: 0.55, mouth: 0, mw: 1, brow: 0, tilt: 0, lx: 1.2, ly: 0.2, blush: 0.55, sweat: 0, head: 0, arm: 0 };
  const g = far || close ? 'partner' : moving ? 'ahead' : p.gaze;
  if (g === 'partner') { T.lx = ahead ? 2.3 : -2.5; T.ly = 0.3; if (!ahead) T.head = -0.06; }
  else if (g === 'up') { T.lx = 1; T.ly = -2; T.brow = 0.45; T.head = -0.07; }
  if (moving) { T.smile = 0.85; T.mouth = 0.4; T.brow = 0.3; }
  if (far) { T.tilt = 0.95; T.smile = -0.5; T.mouth = 0.22; T.mw = 0.7; T.open = o.open * 1.1; T.sweat = 1; T.brow = 0.55; T.blush = 0.3; } // partner is far away: worried
  else if (close) { // standing together: happy, with the odd giggle
    T.smile = 1; T.blush = 1; T.mouth = 0.28;
    p.gigT -= dt; if (p.gigT < 0) { p.giggle = 0.9; p.gigT = 3 + Math.random() * 4; }
    if (p.giggle > 0 || FORCE === 'giggle') { T.happy = 1; T.mouth = 0.65; T.brow = 0.5; }
  } else if (sleepy) { // left standing for a while: drowsy, yawning now and then
    T.open = o.open * 0.5; T.brow = -0.35; T.smile = 0.3; T.head = 0.07; T.lx = 0.6; T.ly = 1.2;
    p.yawnT -= dt; if (p.yawnT < 0) { p.yawn = 1.8; p.yawnT = 6 + Math.random() * 4; }
    if (p.yawn > 0 || FORCE === 'yawn') { const env = FORCE === 'yawn' ? 1 : Math.sin(Math.PI * (1 - p.yawn / 1.8)); T.mouth = env; T.mw = 0.62; T.smile = 0; T.open = o.open * (0.5 - env * 0.45); T.brow = env * 0.7; T.head = -0.08 * env; }
  }
  if (cheer) { T.happy = 1; T.smile = 1; T.mouth = 0.95; T.mw = 1.1; T.brow = 0.9; T.blush = 1; T.head = -0.1; T.arm = 1; T.tilt = 0; T.sweat = 0; T.open = o.open; }
  p.giggle = Math.max(0, p.giggle - dt); p.yawn = Math.max(0, p.yawn - dt);
  for (const k in T) e[k] += (T[k] - e[k]) * Math.min(1, dt * (k === 'happy' ? 20 : k === 'lx' || k === 'ly' ? 14 : 9));
  p.blink -= dt; if (p.blink < 0) p.blink = 2.2 + Math.random() * 3.5;
  e.blinkF = p.blink < 0.16 ? Math.abs(p.blink - 0.08) / 0.08 : 1;
}

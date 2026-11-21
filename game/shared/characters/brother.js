'use strict';
// The brother: blue tunic, red cape and scarf, blue cap with a feather, empty hands. Drawn facing right; the game flips it.
// FACE_B holds this character's facial features (eye colours, brows, plaster, tooth gap).
const FACE_B = { iris: ['#4a2410', '#a5622a', '#eaa94e'], lash: '#2a1810', flick: false, brow: '#3f2416', browW: 3.5, open: 1.06, plaster: true, gap: true };

function drawBrother(c, p, t) {
  const m = p.m, ph = p.phase, sw = Math.cos(ph) * m, ar = p.ex.arm, bob = -Math.abs(Math.sin(ph)) * 3 * m + (p.giggle > 0 ? Math.sin(t * 34) * 1.2 : 0), br = Math.sin(t * 2.3 + 1) * (1 - m);
  const hipY = -53 + bob, top = hipY - 60 - br, hem = hipY + 15, headY = top - 35;
  const B0 = '#2f506e', B1 = '#4b78a0', B2 = '#6a9ac2', RD0 = '#7c2420', RD1 = '#b5382f', RD2 = '#d8523f', RD3 = '#ef7a5e';
  const H0 = '#3f2416', H1 = '#6b4026', H2 = '#8e5a36', H3 = '#b47a4c';
  const legA = { pants: '#45507a', edge: '#262d4a', boot: '#7a4d31', bootEdge: '#40261a', cuff: '#96694a', sole: '#2e1c14' };
  const legB = { pants: '#373f63', edge: '#20263f', boot: '#633e28', bootEdge: '#352016', cuff: '#7a553b', sole: '#24160f' };
  // cape
  const fm = poseFlow(p, m), fl = 16 + fm * 28, outer = [-24 - fl, hipY + 32 - fl * 0.4 - poseLift(p)], inner = [-10, hipY + 30], edge = [];
  for (let i = 0; i <= 5; i++) { const k = i / 5; edge.push([outer[0] + (inner[0] - outer[0]) * k, outer[1] + (inner[1] - outer[1]) * k + Math.sin(t * 6.5 - i * 1.1) * (1.5 + fm * 4) + Math.sin(k * Math.PI * 3) * 2.5]); }
  c.beginPath(); c.moveTo(6, top + 3); c.quadraticCurveTo(-22 - fl * 0.55, top + 22, edge[0][0], edge[0][1]); for (const e of edge) c.lineTo(e[0], e[1]); c.quadraticCurveTo(-4, hipY - 6, 8, top + 5); c.closePath();
  fs(c, lg(c, outer[0], 0, 10, 0, RD1, RD2), RD0, 2.2);
  c.lineWidth = 2; for (const [i, a] of [[1, 0.4], [2, 0.3], [4, 0.35]]) { c.strokeStyle = rgba(RD0, a); c.beginPath(); c.moveTo(0, top + 10); c.quadraticCurveTo(edge[i][0] * 0.6 - 4, top + 40, edge[i][0], edge[i][1] - 2); c.stroke(); }
  c.strokeStyle = rgba(RD3, 0.6); c.lineWidth = 2.5; c.beginPath(); c.moveTo(-2, top + 8); c.quadraticCurveTo(-20 - fl * 0.5, top + 26, edge[0][0] + 4, edge[0][1] - 8); c.stroke();
  c.beginPath(); edge.forEach((e, i) => (i ? c.lineTo(e[0], e[1] - 2) : c.moveTo(e[0], e[1] - 2))); c.strokeStyle = '#e9c45c'; c.lineWidth = 3; c.stroke();
  // far arm
  { const th = poseArm(p, 0, sw * 0.65 * (1 - ar) - ar * (2.2 + Math.sin(t * 14) * 0.3)), sx = -5, sy = top + 12, hx = sx + Math.sin(th) * 38, hy = sy + Math.cos(th) * 38; // cheering waves this arm
    limb(c, [sx, sy, (sx + hx) / 2 - 4, (sy + hy) / 2, hx, hy], 14, B1, B0);
    limb(c, [sx + (hx - sx) * 0.62, sy + (hy - sy) * 0.62, sx + (hx - sx) * 0.75, sy + (hy - sy) * 0.75, sx + (hx - sx) * 0.9, sy + (hy - sy) * 0.9], 14.5, '#6e4830', '#40281a');
    c.beginPath(); circ(c, hx, hy + 2, 6.5); fs(c, '#e0ae88', '#b07a58', 1.5); }
  const st = poseStride(p);
  drawLeg(c, -5, hipY, poseLeg(p, 0, legPose(ph + Math.PI, m, 18 * st, 8 * st, -5)), 22, legB);
  drawLeg(c, 5, hipY, poseLeg(p, 1, legPose(ph, m, 18 * st, 8 * st, 4)), 22, legA);
  // tunic
  const hs = -sw * 3.5;
  const tunic = () => { c.beginPath(); c.moveTo(-19, top + 2); c.quadraticCurveTo(0, top - 3, 19, top + 2); c.quadraticCurveTo(25, top + 34, 29 + hs, hem); c.quadraticCurveTo(hs, hem + 8, -29 + hs, hem); c.quadraticCurveTo(-25, top + 34, -19, top + 2); c.closePath(); };
  tunic(); fs(c, lg(c, -28, 0, 28, 0, B1, B1, B2), B0, 2.2);
  c.save(); tunic(); c.clip();
  c.fillStyle = rgba('#223c55', 0.35); c.beginPath(); c.moveTo(-32, top); c.lineTo(-9, top); c.quadraticCurveTo(-13, top + 40, -15 + hs, hem + 10); c.lineTo(-36, hem + 10); c.fill();
  c.strokeStyle = '#efe3bd'; c.lineWidth = 6; c.beginPath(); c.moveTo(29 + hs, hem - 1); c.quadraticCurveTo(hs, hem + 7, -29 + hs, hem - 1); c.stroke();
  c.strokeStyle = rgba('#223c55', 0.4); c.lineWidth = 1.8; c.beginPath(); c.moveTo(-3, hipY - 2); c.quadraticCurveTo(-5, hipY + 6, -6 + hs, hem - 5); c.moveTo(18, hipY - 2); c.quadraticCurveTo(20, hipY + 6, 20 + hs, hem - 5); c.stroke();
  c.strokeStyle = rgba('#b9dcf2', 0.5); c.lineWidth = 3; c.beginPath(); c.moveTo(20, top + 10); c.quadraticCurveTo(25, top + 34, 27 + hs, hem - 8); c.stroke();
  c.restore();
  c.beginPath(); c.moveTo(1, top + 8); c.lineTo(9, top + 23); c.lineTo(17, top + 8); c.strokeStyle = '#efe3bd'; c.lineWidth = 3; c.stroke();
  c.strokeStyle = '#3e5f7c'; c.lineWidth = 1.3; c.beginPath(); for (let i = 0; i < 2; i++) { c.moveTo(6, top + 28 + i * 6); c.lineTo(12, top + 31 + i * 6); c.moveTo(12, top + 28 + i * 6); c.lineTo(6, top + 31 + i * 6); } c.stroke();
  c.lineCap = 'butt'; c.beginPath(); c.moveTo(-26, hipY - 9); c.quadraticCurveTo(0, hipY - 4, 27, hipY - 9); c.strokeStyle = '#3e2414'; c.lineWidth = 11; c.stroke(); c.strokeStyle = '#7a4d2e'; c.lineWidth = 8; c.stroke(); c.lineCap = 'round';
  rrect(c, 7, hipY - 13.5, 12, 13, 2.5); fs(c, '#e9c45c', '#8a6a22', 1.4); rrect(c, 10, hipY - 10.5, 6, 7, 1.5); c.fillStyle = '#7a4d2e'; c.fill();
  const pb = Math.sin(ph * 2) * 1.5 * m; rrect(c, -24, hipY - 6 + pb, 16, 18, 5); fs(c, lg(c, -24, 0, -8, 0, '#8a5a34', '#a8744a'), '#3e2414', 1.8);
  c.beginPath(); c.moveTo(-24, hipY + 1 + pb); c.quadraticCurveTo(-16, hipY + 6 + pb, -8, hipY + 1 + pb); c.strokeStyle = '#3e2414'; c.lineWidth = 1.6; c.stroke(); ell(c, -16, hipY + 5 + pb, 2, 2, '#e9c45c');
  // scarf
  for (const [dy, ln, pw] of [[6, 30, 0], [11, 22, 1.3]]) {
    const ex = -14 - ln * (0.45 + fm * 0.75), ey = top + dy + ln * (0.75 - fm * 0.6) + Math.sin(t * 7 + pw) * (1 + fm * 4);
    c.beginPath(); c.moveTo(-10, top + 3); c.quadraticCurveTo((ex - 10) / 2, top + dy - 4 + (ey - top) * 0.2, ex, ey); c.strokeStyle = RD0; c.lineWidth = 9.5; c.stroke(); c.strokeStyle = dy > 8 ? RD1 : RD2; c.lineWidth = 6.5; c.stroke();
  }
  c.beginPath(); c.ellipse(3, top + 3, 23, 10, -0.05, 0, TAU); fs(c, lg(c, -20, 0, 26, 0, RD1, RD2), RD0, 2);
  c.strokeStyle = rgba(RD0, 0.5); c.lineWidth = 1.6; c.beginPath(); c.moveTo(-12, top + 1); c.quadraticCurveTo(2, top + 8, 20, top + 2); c.stroke();
  c.beginPath(); circ(c, -13, top + 4, 6); fs(c, RD1, RD0, 1.6);
  // head and hair
  c.save(); c.translate(4, top + 4); c.rotate(Math.sin(ph * 2 + 0.5) * 0.025 * m + Math.sin(t * 1.2 + 2) * 0.012 + p.ex.head); c.translate(-4, -(top + 4));
  const poly = (pts) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, headY + y) : c.moveTo(x, headY + y))); c.closePath(); };
  const hb = Math.sin(ph * 2 - 0.7) * 2 * m; // hair bounce
  // short hair: a tuft at the nape, and a fringe that peeks out from under the cap
  poly([[-20, 26], [-30, 18 + hb * 0.5], [-25, 11], [-33, 5 + hb * 0.5], [-27, -2], [-10, -6], [0, 20]]);
  fs(c, H1, H0, 2);
  c.beginPath(); c.ellipse(-15, headY + 9, 7, 8.5, 0, 0, TAU); fs(c, '#eebc94', '#c48a66', 1.5); ell(c, -15, headY + 9.5, 3, 4.5, '#d99e7c');
  drawFace(c, p, 7, headY + 5, 31);
  poly([[-24, -6], [0, -22], [38, -16], [34, -4], [29, -12], [23, -4], [17, -12], [10, -5], [3, -12], [-5, -3], [-10, -10], [-17, 10], [-21, -1]]);
  fs(c, lg(c, -30, 0, 40, 0, H1, H2), H0, 1.8);
  c.strokeStyle = H3; c.lineWidth = 1.6; c.globalAlpha = 0.85; c.beginPath();
  for (const [x0, y0, x1, y1] of [[-3, -12, -5, -5], [10, -13, 10, -7], [23, -12, 23, -6], [-19, -3, -17, 7]]) { c.moveTo(x0, headY + y0); c.lineTo(x1, headY + y1); }
  c.stroke(); c.globalAlpha = 1;
  // cap: soft crown with panel seams, a band, a short brim, a button on top and a red feather tucked into the band
  const K0 = '#22384f', K1 = '#34587a', K2 = '#4c7aa2', K3 = '#86aed0';
  const crown = () => { c.beginPath(); c.moveTo(-29, headY - 1); c.bezierCurveTo(-40, headY - 30, -12, headY - 47, 12, headY - 43); c.bezierCurveTo(30, headY - 40, 44, headY - 28, 41, headY - 12); c.quadraticCurveTo(12, headY - 17, -8, headY - 9); c.quadraticCurveTo(-20, headY - 5, -29, headY - 1); c.closePath(); };
  crown(); fs(c, lg(c, -34, headY - 10, 40, headY - 40, K1, K1, K2), K0, 2.2);
  c.save(); crown(); c.clip();
  c.fillStyle = rgba('#16283a', 0.35); c.beginPath(); c.ellipse(-24, headY - 12, 20, 30, 0.3, 0, TAU); c.fill();
  soft(c, 20, headY - 34, 22, 12, K3, 0.6);
  c.strokeStyle = rgba(K0, 0.55); c.lineWidth = 1.5; c.beginPath();
  for (const [ex, ey] of [[-22, -6], [-2, -12], [22, -15], [38, -16]]) { c.moveTo(10, headY - 43); c.quadraticCurveTo((10 + ex) / 2 + (ex - 10) * 0.18, headY + (-43 + ey) / 2 - 6, ex, headY + ey); }
  c.stroke(); c.restore();
  c.save(); c.translate(-15, headY - 8); c.rotate(-0.7 + Math.sin(ph * 2 - 1) * 0.12 * m + Math.sin(t * 1.4) * 0.03 - m * 0.2);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(9, -16, 1, -36); c.quadraticCurveTo(-8, -18, 0, 0); fs(c, lg(c, -6, 0, 7, 0, RD1, RD3), RD0, 1.5);
  c.strokeStyle = RD0; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, -2); c.quadraticCurveTo(2, -16, 1, -33); c.moveTo(1, -12); c.lineTo(5, -17); c.moveTo(1, -20); c.lineTo(-4, -24); c.stroke(); c.restore();
  c.beginPath(); c.moveTo(40, headY - 13); c.quadraticCurveTo(12, headY - 18, -8, headY - 10); c.quadraticCurveTo(-20, headY - 6, -28, headY - 2); c.strokeStyle = K0; c.lineWidth = 6.5; c.stroke(); c.strokeStyle = '#2b4866'; c.lineWidth = 4; c.stroke();
  c.beginPath(); circ(c, 10, headY - 44, 3.6); fs(c, K2, K0, 1.5);
  c.beginPath(); c.moveTo(24, headY - 16); c.quadraticCurveTo(46, headY - 17, 58, headY - 5); c.quadraticCurveTo(44, headY - 9, 27, headY - 9.5); c.closePath(); fs(c, lg(c, 24, 0, 58, 0, K1, K0), K0, 2);
  c.strokeStyle = rgba(K3, 0.7); c.lineWidth = 1.6; c.beginPath(); c.moveTo(28, headY - 15); c.quadraticCurveTo(44, headY - 15.5, 53, headY - 8); c.stroke();
  c.beginPath(); circ(c, 26, headY - 26, 3); fs(c, '#e9c45c', '#8a6a22', 1.2);
  drawFaceTop(c, p, 7, headY + 5);
  c.restore();
  // front arm, swinging freely (cheering throws it up in the air)
  { const th = poseArm(p, 1, -sw * 0.65 * (1 - ar) + ar * (2.55 + Math.sin(t * 14 + 1) * 0.18)), sx = 8, sy = top + 12, hx = sx + Math.sin(th) * 38, hy = sy + Math.cos(th) * 38, bend = 5 * (1 - ar);
    limb(c, [sx, sy, (sx + hx) / 2 + bend, (sy + hy) / 2, hx, hy], 14.5, B2, B0);
    limb(c, [sx + (hx - sx) * 0.62, sy + (hy - sy) * 0.62, sx + (hx - sx) * 0.75, sy + (hy - sy) * 0.75, sx + (hx - sx) * 0.9, sy + (hy - sy) * 0.9], 15, '#8a5a34', '#40281a');
    c.beginPath(); circ(c, hx, hy + 2, 7.5); fs(c, '#f6cfa9', '#b9825e', 1.5); }
}

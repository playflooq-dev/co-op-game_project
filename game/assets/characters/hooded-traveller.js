'use strict';
// The hooded traveller: green coat, backpack with bedroll, empty hands. Drawn facing right; the game flips it.
// FACE_A holds this character's facial features (eye colours, brows, freckles).
const FACE_A = { iris: ['#2f4a22', '#6c9a40', '#b9d86c'], lash: '#2a1810', flick: true, brow: '#4a2f20', browW: 2.7, open: 0.92, freckles: true };

function drawHooded(c, p, t) {
  const m = p.m, ph = p.phase, sw = Math.cos(ph) * m, ar = p.ex.arm, bob = -Math.abs(Math.sin(ph)) * 3.2 * m + (p.giggle > 0 ? Math.sin(t * 34) * 1.2 : 0), br = Math.sin(t * 2.1) * 1.1 * (1 - m);
  const hipY = -60 + bob, top = hipY - 78 - br, hem = hipY + 13, headY = top - 38;
  const G0 = '#55633a', G1 = '#6d7b45', G2 = '#8a9856', G3 = '#a3b06a';
  const legA = { pants: '#3b4a6a', edge: '#232d45', boot: '#74492f', bootEdge: '#40261a', cuff: '#8f6243', sole: '#2e1c14' };
  const legB = { pants: '#2f3b57', edge: '#1e2740', boot: '#5e3b27', bootEdge: '#352016', cuff: '#754f36', sole: '#24160f' };
  // far arm
  { const th = sw * 0.6, sx = -6, sy = top + 13, hx = sx + Math.sin(th) * 44, hy = sy + Math.cos(th) * 44;
    limb(c, [sx, sy, (sx + hx) / 2 - 5, (sy + hy) / 2, hx, hy], 16, G1, G0);
    c.beginPath(); circ(c, hx, hy + 3, 7); fs(c, '#e0ae88', '#b07a58', 1.5); }
  // backpack, bedroll and tin cup
  c.save(); c.translate(-46, top + 40); c.rotate(-Math.sin(ph * 2) * 0.025 * m); c.translate(46, -(top + 40));
  c.beginPath(); circ(c, -47, top - 12, 22); fs(c, lg(c, -69, 0, -25, 0, '#b08a52', '#dbb775'), '#75552c', 2);
  c.strokeStyle = '#8f6d3c'; c.lineWidth = 2.2; c.beginPath(); for (let a = 0; a < 15; a += 0.3) { const r = 2 + a * 1.2, x = -47 + Math.cos(a) * r, y = top - 12 + Math.sin(a) * r; if (a) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke();
  for (const dx of [-58, -37]) { rrect(c, dx - 3, top - 34, 6, 46, 2); fs(c, '#5b3721', '#33200f', 1.2); }
  rrect(c, -72, top + 6, 48, 78, 13); fs(c, lg(c, -72, 0, -24, 0, '#6b4127', '#93603a'), '#3e2414', 2.2);
  rrect(c, -78, top + 46, 30, 32, 8); fs(c, lg(c, -78, 0, -48, 0, '#7a4a2c', '#a36c42'), '#3e2414', 2);
  c.beginPath(); c.moveTo(-78, top + 57); c.quadraticCurveTo(-63, top + 64, -48, top + 57); c.strokeStyle = '#3e2414'; c.lineWidth = 1.8; c.stroke(); ell(c, -63, top + 63, 2.4, 2.4, '#e2c26a');
  rrect(c, -75, top + 2, 54, 30, 12); fs(c, lg(c, 0, top, 0, top + 32, '#a06a40', '#7a4a2c'), '#3e2414', 2.2);
  c.setLineDash([3.5, 3.5]); c.strokeStyle = '#e0c592'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(-70, top + 26); c.lineTo(-27, top + 26); c.stroke(); c.setLineDash([]);
  rrect(c, -53, top + 4, 9, 40, 3); fs(c, '#55331e', '#33200f', 1.2); rrect(c, -55.5, top + 33, 14, 10, 2.5); c.strokeStyle = '#e2c26a'; c.lineWidth = 2.4; c.stroke();
  c.save(); c.translate(-76, top + 40); c.rotate(Math.sin(ph * 2 + 1) * 0.3 * m + Math.sin(t * 1.5) * 0.04 + m * 0.25);
  c.strokeStyle = '#4a3a2a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 9); c.stroke();
  rrect(c, -8, 9, 15, 15, 3); fs(c, lg(c, -8, 0, 7, 0, '#8e989e', '#d5dde0'), '#5a6268', 1.4); c.beginPath(); c.arc(-9, 16, 4.5, Math.PI * 0.5, Math.PI * 1.5); c.strokeStyle = '#5a6268'; c.lineWidth = 2; c.stroke(); c.restore();
  c.restore();
  // legs
  drawLeg(c, -6, hipY, legPose(ph + Math.PI, m, 20, 9, -6), 25, legB);
  drawLeg(c, 6, hipY, legPose(ph, m, 20, 9, 4), 25, legA);
  // coat
  const hs = -sw * 5;
  const coat = () => { c.beginPath(); c.moveTo(-22, top + 2); c.quadraticCurveTo(0, top - 4, 22, top + 2); c.quadraticCurveTo(31, top + 40, 37 + hs, hem); c.quadraticCurveTo(18 + hs, hem + 9, hs * 0.6, hem + 4); c.quadraticCurveTo(-18 + hs, hem + 10, -37 + hs, hem); c.quadraticCurveTo(-31, top + 40, -22, top + 2); c.closePath(); };
  coat(); fs(c, lg(c, -36, 0, 36, 0, G1, G1, G2), G0, 2.2);
  c.save(); coat(); c.clip();
  c.fillStyle = rgba('#3f4a2a', 0.35); c.beginPath(); c.moveTo(-40, top); c.lineTo(-12, top); c.quadraticCurveTo(-18, top + 50, -22 + hs, hem + 12); c.lineTo(-44, hem + 12); c.fill();
  c.strokeStyle = G0; c.lineWidth = 7; c.globalAlpha = 0.55; c.beginPath(); c.moveTo(37 + hs, hem - 1); c.quadraticCurveTo(18 + hs, hem + 8, hs * 0.6, hem + 3); c.quadraticCurveTo(-18 + hs, hem + 9, -37 + hs, hem - 1); c.stroke(); c.globalAlpha = 1;
  c.strokeStyle = rgba('#3f4a2a', 0.4); c.lineWidth = 2; c.beginPath(); c.moveTo(-2, top + 44); c.quadraticCurveTo(-6, top + 70, -8 + hs, hem - 4); c.moveTo(24, top + 50); c.quadraticCurveTo(27, top + 74, 27 + hs, hem - 6); c.stroke();
  c.strokeStyle = rgba('#c5d08a', 0.5); c.lineWidth = 3; c.beginPath(); c.moveTo(24, top + 12); c.quadraticCurveTo(31, top + 44, 35 + hs, hem - 6); c.stroke();
  c.restore();
  c.strokeStyle = G0; c.lineWidth = 1.8; c.beginPath(); c.moveTo(13, top + 4); c.quadraticCurveTo(15, top + 50, 14 + hs * 0.6, hem + 4); c.stroke();
  for (let i = 0; i < 3; i++) for (const bx of [5, 21]) { const by = top + 26 + i * 15; c.beginPath(); circ(c, bx, by, 3.2); fs(c, '#f1e4bb', '#8f7d4c', 1.2); ell(c, bx + 0.8, by - 0.9, 1.1, 1.1, '#fff'); }
  rrect(c, -14, top + 58, 18, 15, 4); c.strokeStyle = G0; c.lineWidth = 1.8; c.stroke(); c.beginPath(); c.moveTo(-15, top + 63); c.lineTo(5, top + 63); c.stroke();
  c.beginPath(); c.moveTo(-14, top + 1); c.quadraticCurveTo(-2, top + 26, -17, top + 52); c.strokeStyle = '#4a2a18'; c.lineWidth = 8.5; c.stroke(); c.strokeStyle = '#7e4c2c'; c.lineWidth = 6; c.stroke();
  rrect(c, -13, top + 22, 9, 7, 2); fs(c, '#d9b65c', '#7a5f24', 1.2);
  // head
  c.save(); c.translate(4, top + 6); c.rotate(Math.sin(ph * 2 + 0.6) * 0.022 * m + Math.sin(t * 1.1) * 0.012 + p.ex.head); c.translate(-4, -(top + 6));
  const tip = Math.sin(ph * 2 - 0.9) * 5 * m + Math.sin(t * 1.3) * 1.2 - m * 6;
  c.beginPath(); c.ellipse(4, top + 3, 27, 11, -0.08, 0, TAU); fs(c, G1, G0, 2);
  c.beginPath(); c.moveTo(-42, headY + 34); c.bezierCurveTo(-62, headY, -52, headY - 46, -14, headY - 58);
  c.quadraticCurveTo(-30 + tip * 0.4, headY - 66, -40 + tip, headY - 80); c.quadraticCurveTo(-8 + tip * 0.3, headY - 76, 20, headY - 56);
  c.bezierCurveTo(50, headY - 40, 56, headY, 44, headY + 28); c.quadraticCurveTo(0, headY + 50, -42, headY + 34); c.closePath();
  fs(c, lg(c, -50, 0, 50, 0, G1, G1, G2), G0, 2.2);
  c.strokeStyle = rgba('#3f4a2a', 0.45); c.lineWidth = 1.8; c.beginPath(); c.moveTo(-32 + tip * 0.6, headY - 70); c.quadraticCurveTo(-36, headY - 20, -31, headY + 30); c.stroke();
  c.beginPath(); circ(c, 12, headY + 6, 37); c.fillStyle = '#39432a'; c.fill();
  drawFace(c, p, 14, headY + 8, 31);
  c.beginPath(); c.moveTo(-17, headY + 6); c.arc(14, headY + 8, 31.5, Math.PI * 1.06, Math.PI * 1.94);
  c.quadraticCurveTo(38, headY - 4, 33, headY + 5); c.quadraticCurveTo(30, headY - 6, 22, headY + 1); c.quadraticCurveTo(18, headY - 9, 9, headY + 2); c.quadraticCurveTo(5, headY - 8, -4, headY + 4); c.quadraticCurveTo(-8, headY - 4, -17, headY + 6); c.closePath();
  fs(c, lg(c, -17, 0, 45, 0, '#4f3222', '#6b4530'), '#38221a', 1.5);
  c.strokeStyle = '#8a5c3e'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(2, headY - 16); c.quadraticCurveTo(-2, headY - 8, -3, headY + 1); c.moveTo(16, headY - 20); c.quadraticCurveTo(13, headY - 10, 10, headY - 1); c.moveTo(30, headY - 15); c.quadraticCurveTo(28, headY - 8, 23, headY - 1); c.stroke();
  // locks of hair framing the face
  c.beginPath(); c.moveTo(-17, headY + 4); c.quadraticCurveTo(-23, headY + 20, -14, headY + 31); c.quadraticCurveTo(-13, headY + 17, -9, headY + 3); c.closePath(); fs(c, '#553624', '#38221a', 1.4);
  c.beginPath(); c.moveTo(41, headY + 2); c.quadraticCurveTo(47, headY + 15, 42, headY + 26); c.quadraticCurveTo(40, headY + 14, 36, headY + 3); c.closePath(); fs(c, '#6b4530', '#38221a', 1.4);
  c.beginPath(); c.arc(12, headY + 6, 38.5, -Math.PI * 0.97, Math.PI * 0.58); c.strokeStyle = G0; c.lineWidth = 9.5; c.stroke(); c.strokeStyle = G3; c.lineWidth = 6.5; c.stroke();
  drawFaceTop(c, p, 14, headY + 8);
  c.restore();
  c.save(); c.translate(15, top + 7); c.rotate(-0.5); c.beginPath(); c.moveTo(0, 5); c.quadraticCurveTo(6, 0, 0, -7); c.quadraticCurveTo(-6, 0, 0, 5); fs(c, '#e2c26a', '#8a6a22', 1.2); c.strokeStyle = '#8a6a22'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 4); c.lineTo(0, -5); c.stroke(); c.restore(); // leaf brooch
  for (const [dx, ln, pw] of [[17, 20, 0], [25, 16, 0.8]]) { const s2 = Math.sin(ph * 2 + pw) * 3 * m - m * 3; c.strokeStyle = '#d8c9a0'; c.lineWidth = 2; c.beginPath(); c.moveTo(dx, top + 10); c.quadraticCurveTo(dx + s2 * 0.4, top + 10 + ln * 0.6, dx + s2, top + 10 + ln); c.stroke(); ell(c, dx + s2, top + 12 + ln, 2.6, 3.4, '#8f7d4c'); }
  // front arm, swinging freely (cheering throws it up in the air)
  const th = -sw * 0.6 * (1 - ar) + ar * (2.55 + Math.sin(t * 14) * 0.18), sx = 12, sy = top + 14, hx = sx + Math.sin(th) * 46, hy = sy + Math.cos(th) * 46;
  const bend = 6 * (1 - ar); // a slight bend at the elbow
  limb(c, [sx, sy, (sx + hx) / 2 + bend, (sy + hy) / 2, hx, hy], 17, G2, G0);
  { const k = 0.84, cx = sx + (hx - sx) * k, cy = sy + (hy - sy) * k; c.save(); c.translate(cx, cy); c.rotate(Math.atan2(hy - sy, hx - sx) - Math.PI / 2); c.beginPath(); c.moveTo(-9, -5); c.lineTo(9, -5); c.lineTo(11, 5); c.lineTo(-11, 5); c.closePath(); fs(c, G3, G0, 1.8); c.restore(); }
  c.beginPath(); circ(c, hx, hy + 3, 8); fs(c, '#f6cfa9', '#b9825e', 1.5);
}

'use strict';
// Little pictures drawn by code: the stamps and stickers, and the signs that stand in for words (a hand for "grab",
// two hands for "lift", an arrow for "jump"). drawIcon(c, name, x, y, size) draws one, about 34 units across at size 1.
// Also two colour helpers the drawing code shares. Loaded by worlds built on the lab kit (the city).
const INK = '#3a2618';
function shade(hex, k) { // k below 0 darkens, above 0 lightens
  const n = parseInt(hex.slice(1), 16), f = (v) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('');
}
function mixCol(a, b, u) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), ch = (s) => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * u);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

const ICON_COL = { ticket: '#f6c26a', star: '#f2c94e', bell: '#e2b84a', fish: '#6fa8c9', key: '#d9b55c', moon: '#f4e2a0', apple: '#d9534a', boat: '#b5713c', bird: '#7f9fc4', paw: '#a8683a', sock: '#e8728a', drop: '#6fb3d9', note: '#3a2618', heart: '#e8728a', hand: '#fbe3c4', hands: '#fbe3c4', up: '#fffbf0' };
function drawIcon(c, name, x, y, s = 1, col = ICON_COL[name]) {
  const ink = INK;
  c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath();
  if (name === 'star') { for (let i = 0; i < 10; i++) { const r = i % 2 ? 6.5 : 15, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); fs(c, col, ink, 2); }
  else if (name === 'bell') { c.moveTo(-13, 8); c.quadraticCurveTo(-9, 4, -9, -3); c.quadraticCurveTo(-9, -14, 0, -14); c.quadraticCurveTo(9, -14, 9, -3); c.quadraticCurveTo(9, 4, 13, 8); c.closePath(); fs(c, col, ink, 2); c.beginPath(); circ(c, 0, 11, 3.2); fs(c, ink); }
  else if (name === 'fish') { c.ellipse(-3, 0, 12, 7.5, 0, 0, TAU); c.moveTo(8, 0); c.lineTo(16, -8); c.lineTo(16, 8); c.closePath(); fs(c, col, ink, 2); ell(c, -9, -2, 1.8, 1.8, ink); }
  else if (name === 'key') { circ(c, -8, 0, 7); c.rect(-1, -2.5, 16, 5); c.rect(8, 2, 3, 6); c.rect(12, 2, 3, 4); fs(c, col, ink, 2); ell(c, -8, 0, 2.6, 2.6, '#fffbf0'); }
  else if (name === 'moon') { c.moveTo(5, -14); c.bezierCurveTo(-17, -13, -17, 13, 5, 14); c.bezierCurveTo(-5, 7, -5, -7, 5, -14); c.closePath(); fs(c, col, ink, 2); }
  else if (name === 'apple') { c.moveTo(0, -7); c.bezierCurveTo(-16, -15, -17, 12, -4, 13); c.quadraticCurveTo(0, 11, 4, 13); c.bezierCurveTo(17, 12, 16, -15, 0, -7); c.closePath(); fs(c, col, ink, 2); c.beginPath(); c.moveTo(0, -7); c.quadraticCurveTo(0, -12, 3, -15); c.strokeStyle = ink; c.lineWidth = 2; c.stroke(); c.beginPath(); c.ellipse(7, -12, 5, 2.6, -0.4, 0, TAU); fs(c, '#6d9b45', ink, 1.4); }
  else if (name === 'boat') { c.moveTo(-15, 3); c.lineTo(15, 3); c.lineTo(9, 12); c.lineTo(-9, 12); c.closePath(); fs(c, col, ink, 2); c.beginPath(); c.moveTo(1, -14); c.lineTo(12, 0); c.lineTo(1, 0); c.closePath(); fs(c, '#fffbf0', ink, 2); c.beginPath(); c.moveTo(-2, -12); c.lineTo(-9, 0); c.lineTo(-2, 0); c.closePath(); fs(c, '#e9c98a', ink, 2); }
  else if (name === 'bird') { c.ellipse(-2, 3, 11, 8, 0, 0, TAU); circ(c, 8, -5, 6); c.moveTo(-11, 2); c.lineTo(-18, -3); c.lineTo(-12, 7); c.closePath(); fs(c, col, ink, 2); c.beginPath(); c.moveTo(13, -6); c.lineTo(19, -4); c.lineTo(13, -2); c.closePath(); fs(c, '#e2a84a', ink, 1.4); ell(c, 9, -6, 1.5, 1.5, ink); }
  else if (name === 'paw') { c.ellipse(0, 5, 9, 7.5, 0, 0, TAU); for (const [px, py] of [[-10, -3], [-4, -10], [4, -10], [10, -3]]) circ(c, px, py, 3.6); fs(c, col, ink, 1.6); }
  else if (name === 'sock') { c.moveTo(-6, -14); c.lineTo(5, -14); c.lineTo(5, 2); c.quadraticCurveTo(14, 5, 12, 11); c.quadraticCurveTo(3, 15, -6, 9); c.closePath(); fs(c, col, ink, 2); c.fillStyle = '#fffbf0'; c.fillRect(-5, -11, 9, 3.5); c.fillRect(-5, -5, 9, 3.5); }
  else if (name === 'drop') { c.moveTo(0, -15); c.bezierCurveTo(11, -2, 12, 7, 0, 13); c.bezierCurveTo(-12, 7, -11, -2, 0, -15); fs(c, col, ink, 2); ell(c, -3, 3, 2.2, 3.6, '#fff', 0.7); }
  else if (name === 'note') { c.ellipse(-4, 9, 6.5, 4.8, -0.35, 0, TAU); fs(c, ink); c.beginPath(); c.moveTo(2, 8); c.lineTo(2, -13); c.quadraticCurveTo(12, -10, 11, -2); c.strokeStyle = ink; c.lineWidth = 3; c.stroke(); }
  else if (name === 'ticket') { c.rect(-17, -10, 34, 20); fs(c, '#f6c26a', ink, 2); c.setLineDash([3, 3]); c.beginPath(); c.moveTo(7, -10); c.lineTo(7, 10); c.strokeStyle = ink; c.lineWidth = 1.5; c.stroke(); c.setLineDash([]); c.fillStyle = ink; c.fillRect(-12, -5, 14, 2.5); c.fillRect(-12, 1, 10, 2.5); }
  else if (name === 'heart') { c.moveTo(0, 12); c.bezierCurveTo(-18, -2, -9, -16, 0, -6); c.bezierCurveTo(9, -16, 18, -2, 0, 12); fs(c, col, ink, 2); }
  else if (name === 'hand') { // an open hand: "grab" or "use"
    for (const [fx, top] of [[-8.5, -11], [-3, -15], [2.5, -14], [8, -10]]) { rrect(c, fx - 2.7, top, 5.4, 17, 2.7); fs(c, col, ink, 1.8); }
    c.save(); c.translate(-10.5, 4); c.rotate(-0.85); rrect(c, -2.9, -10, 5.8, 13, 2.9); fs(c, col, ink, 1.8); c.restore();
    rrect(c, -11.5, -2, 22.5, 16, 6.5); fs(c, col, ink, 1.8); c.fillStyle = col; c.fillRect(-9.6, -3.4, 18.6, 3.6);
  }
  else if (name === 'hands') { c.restore(); drawIcon(c, 'hand', x - 9 * s, y + 1 * s, s * 0.72, col); c.save(); c.translate(x + 9 * s, y + 1 * s); c.scale(-1, 1); drawIcon(c, 'hand', 0, 0, s * 0.72, col); } // two hands: "lift"
  else if (name === 'piece') { c.moveTo(-16, -12); c.lineTo(-4, -15); c.lineTo(9, -11); c.lineTo(17, -14); c.lineTo(15, 2); c.lineTo(18, 13); c.lineTo(2, 15); c.lineTo(-12, 12); c.lineTo(-17, 1); c.closePath(); fs(c, '#f1dfb0', '#8a6a3a', 2); c.strokeStyle = '#a0522d'; c.setLineDash([3, 3]); c.lineWidth = 1.6; c.beginPath(); c.moveTo(-10, 6); c.quadraticCurveTo(0, -6, 11, 2); c.stroke(); c.setLineDash([]); } // a piece of the map
  else if (name === 'crate') { rrect(c, -14, -15, 28, 24, 3); fs(c, '#b0875a', ink, 2); c.fillStyle = '#6d9b45'; c.fillRect(-14, -10, 28, 5); c.fillRect(-14, 1, 28, 5); rrect(c, -18, 10, 36, 6, 3); fs(c, '#6d9b45', ink, 1.6); } // the heavy crate on the green plate
  else if (name === 'ladder') { c.strokeStyle = ink; c.lineWidth = 5; c.moveTo(-8, -16); c.lineTo(-8, 16); c.moveTo(8, -16); c.lineTo(8, 16); c.stroke(); c.strokeStyle = '#c9a36a'; c.lineWidth = 2.5; c.stroke(); c.strokeStyle = ink; c.lineWidth = 3; c.beginPath(); for (const yy of [-10, -2, 6, 14]) { c.moveTo(-8, yy); c.lineTo(8, yy); } c.stroke(); }
  else if (name === 'lift') { c.strokeStyle = ink; c.lineWidth = 2.5; c.moveTo(-11, 8); c.lineTo(0, -8); c.lineTo(11, 8); c.stroke(); rrect(c, -15, 8, 30, 7, 2); fs(c, '#dcbb85', ink, 2); c.beginPath(); c.moveTo(0, -17); c.lineTo(7, -9); c.lineTo(-7, -9); c.closePath(); fs(c, '#6d9b45', ink, 1.6); } // a platform on ropes, going up
  else if (name === 'parasol') { c.moveTo(-17, 0); c.quadraticCurveTo(0, -24, 17, 0); c.closePath(); fs(c, '#d9534a', ink, 2); c.beginPath(); c.moveTo(-6, 0); c.quadraticCurveTo(0, -18, 6, 0); c.closePath(); fs(c, '#fffbf0', ink, 1.2); c.strokeStyle = ink; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 16); c.stroke(); }
  else if (name === 'bridge') { c.strokeStyle = ink; c.lineWidth = 9; c.moveTo(-17, 6); c.quadraticCurveTo(0, -12, 17, 6); c.stroke(); c.strokeStyle = '#c9a36a'; c.lineWidth = 5; c.stroke(); c.fillStyle = '#6fb3d9'; c.fillRect(-17, 11, 34, 5); c.strokeStyle = ink; c.lineWidth = 1.5; c.strokeRect(-17, 11, 34, 5); }
  else if (name === 'tree') { c.rect(-3, 4, 6, 12); fs(c, '#8a6844', ink, 2); c.beginPath(); circ(c, 0, -5, 12); circ(c, -8, 1, 8); circ(c, 8, 1, 8); fs(c, '#6d9b45', ink, 2); c.beginPath(); circ(c, 0, -4, 10); c.fillStyle = '#6d9b45'; c.fill(); } // Forest Park
  else if (name === 'gate') { c.strokeStyle = ink; c.lineWidth = 3; for (const gx of [-12, -4, 4, 12]) { c.moveTo(gx, -10); c.lineTo(gx, 14); } c.stroke(); c.beginPath(); c.moveTo(-16, -6); c.quadraticCurveTo(0, -20, 16, -6); c.lineTo(16, -1); c.quadraticCurveTo(0, -15, -16, -1); c.closePath(); fs(c, '#6d9b45', ink, 2); rrect(c, -16, 6, 32, 5, 2); fs(c, '#6d9b45', ink, 1.6); } // a park gate
  else if (name === 'balloon') { c.ellipse(0, -5, 11, 13, 0, 0, TAU); fs(c, '#d9534a', ink, 2); c.beginPath(); c.moveTo(-3, 8); c.lineTo(3, 8); c.lineTo(0, 12); c.closePath(); fs(c, '#d9534a', ink, 1.5); c.beginPath(); c.moveTo(0, 12); c.quadraticCurveTo(5, 15, 0, 19); c.strokeStyle = ink; c.lineWidth = 1.6; c.stroke(); ell(c, -4, -10, 3, 4.5, '#fff', 0.6); }
  else if (name === 'exit') { c.moveTo(-15, 15); c.lineTo(-15, -4); c.quadraticCurveTo(0, -24, 15, -4); c.lineTo(15, 15); c.lineTo(9, 15); c.lineTo(9, -2); c.quadraticCurveTo(0, -14, -9, -2); c.lineTo(-9, 15); c.closePath(); fs(c, '#6d9b45', ink, 2); c.beginPath(); c.moveTo(-5, 6); c.lineTo(3, 6); c.lineTo(3, 2); c.lineTo(9, 8); c.lineTo(3, 14); c.lineTo(3, 10); c.lineTo(-5, 10); c.closePath(); fs(c, '#f2c94e', ink, 1.5); } // the way out
  else if (name === 'up') { c.moveTo(0, -14); c.lineTo(12, 0); c.lineTo(5, 0); c.lineTo(5, 13); c.lineTo(-5, 13); c.lineTo(-5, 0); c.lineTo(-12, 0); c.closePath(); fs(c, col, ink, 2); } // an arrow: "jump"
  c.restore();
}

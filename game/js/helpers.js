'use strict';
// Small drawing helpers shared by the game, the character files and the asset generator.
const TAU = Math.PI * 2, MIST = '#f6ead0';
function rng(seed) { return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R = rng(20261117);
const rr = (a, b) => a + R() * (b - a);
const pick = (a) => a[Math.floor(R() * a.length)];
function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function circ(c, x, y, r) { c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); }
function dab(c, x, y, rx, ry, rot) { c.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot)); c.ellipse(x, y, rx, ry, rot, 0, TAU); }
function ell(c, x, y, rx, ry, col, a = 1) { c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill(); c.globalAlpha = 1; }
function rrect(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function fs(c, fill, edge, lw = 2) { c.fillStyle = fill; c.fill(); if (edge) { c.strokeStyle = edge; c.lineWidth = lw; c.stroke(); } }
function leafPath(c, len, wid) { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(wid, -len * 0.5, 0, -len); c.quadraticCurveTo(-wid, -len * 0.5, 0, 0); }
function blade(c, x, y, h, bend, w) { c.moveTo(x - w, y); c.quadraticCurveTo(x - w * 0.4 + bend * 0.3, y - h * 0.6, x + bend, y - h); c.quadraticCurveTo(x + w * 0.6 + bend * 0.35, y - h * 0.5, x + w, y); }
function lg(c, x0, y0, x1, y1, ...stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; }
function rg(c, x, y, r, ...stops) { const g = c.createRadialGradient(x, y, 0, x, y, r); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; }
function soft(c, x, y, rx, ry, col, a) { c.save(); c.translate(x, y); c.scale(1, ry / rx); c.fillStyle = rg(c, 0, 0, rx, rgba(col, a), rgba(col, 0)); c.beginPath(); c.arc(0, 0, rx, 0, TAU); c.fill(); c.restore(); }

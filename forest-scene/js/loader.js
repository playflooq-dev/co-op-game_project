'use strict';
// Loads every image listed in assets/manifest.js, adds the depth effects, then starts the game (js/scene.js).
addEventListener('error', (e) => { const h = document.getElementById('load'); if (h && e.message) { h.style.opacity = 1; h.style.display = 'grid'; h.textContent = 'Error: ' + e.message + ' (' + String(e.filename).split('/').pop() + ' line ' + e.lineno + ')'; } });

// Depth effects the game adds on top of the clean art, per asset group:
// tint = [colour, strength at the top of the image, strength at the bottom], blur = softness in scene units.
// Far things get pale haze; things right in front of the camera get darker and slightly out of focus.
const DEPTH = {
  farPinesBack: { tint: [MIST, 0.42, 0.62] }, farPinesFront: { tint: [MIST, 0.24, 0.44] },
  pines: { tint: [MIST, 0.08, 0.14] }, trees: { tint: [MIST, 0.08, 0.14] }, blossomTrees: { tint: [MIST, 0.08, 0.14] }, autumnTrees: { tint: [MIST, 0.08, 0.14] },
  waterfallCliff: { tint: [MIST, 0.07, 0.11] }, waterfallBank: { tint: [MIST, 0.07, 0.1] },
  fgFerns: { blur: 2.4, tint: ['#10281f', 0.22, 0.5] }, fgLeaves: { blur: 2.4, tint: ['#10281f', 0.22, 0.5] },
  fgPoppies: { blur: 2.2, tint: ['#10281f', 0.1, 0.4] }, fgRocks: { blur: 2.2, tint: ['#10281f', 0.2, 0.45] },
};

// SP holds the loaded art: SP.trees is a list of sprites, one per file in that group of the manifest.
// A sprite is { cv: the image, w/h: its size in scene units, ax/ay: where its ground point is }.
const SP = {};
function prepare(img, a, fx) {
  if (!fx) return { cv: img, w: a.w, h: a.h, ax: a.ax, ay: a.ay };
  let s = document.createElement('canvas'); s.width = img.naturalWidth; s.height = img.naturalHeight;
  const c = s.getContext('2d'); c.drawImage(img, 0, 0);
  if (fx.tint) { c.globalCompositeOperation = 'source-atop'; c.fillStyle = lg(c, 0, 0, 0, s.height, rgba(fx.tint[0], fx.tint[1]), rgba(fx.tint[0], fx.tint[2])); c.fillRect(0, 0, s.width, s.height); }
  if (fx.blur) { const b = document.createElement('canvas'); b.width = s.width; b.height = s.height; const bc = b.getContext('2d'); bc.filter = `blur(${fx.blur * s.width / a.w}px)`; bc.drawImage(s, 0, 0); s = b; }
  return { cv: s, w: a.w, h: a.h, ax: a.ax, ay: a.ay };
}
(function loadAssets() {
  const box = document.getElementById('load'), jobs = [], failed = [];
  for (const group in ASSETS) { SP[group] = []; ASSETS[group].forEach((a, i) => jobs.push({ group, i, a })); }
  let done = 0;
  const step = () => {
    done++; box.textContent = 'Forest Trail · loading art ' + done + ' / ' + jobs.length;
    if (done < jobs.length) return;
    if (failed.length) { box.textContent = 'Could not load: assets/' + failed.join(', assets/') + '. Check the file name and the entry in assets/manifest.js.'; return; }
    const s = document.createElement('script'); s.src = 'js/scene.js';
    s.onload = () => { box.style.opacity = 0; setTimeout(() => { box.style.display = 'none'; }, 700); };
    document.body.appendChild(s);
  };
  for (const j of jobs) {
    const img = new Image();
    img.onload = () => { SP[j.group][j.i] = prepare(img, j.a, DEPTH[j.group]); step(); };
    img.onerror = () => { failed.push(j.a.file); step(); };
    img.src = 'assets/' + j.a.file;
  }
})();

'use strict';
// Loads the art a page asks for, adds any depth effects, then starts that page's world script.
// Each page sets LOAD before this file:
//   LOAD = { title, script, sets: [{ assets: HOUSE_ASSETS, base: 'worlds/house/assets/' },
//                                  { assets: FOREST_ASSETS, base: 'worlds/forest/assets/', only: ['clouds'], depth: FOREST_DEPTH }] }
// 'only' borrows just some groups from another world, so art can be shared between worlds without copying files.
addEventListener('error', (e) => { const h = document.getElementById('load'); if (h && e.message) { h.style.opacity = 1; h.style.display = 'grid'; h.textContent = 'Error: ' + e.message + ' (' + String(e.filename).split('/').pop() + ' line ' + e.lineno + ')'; } });

// Depth effects a world can ask for, per asset group (see worlds/forest/settings.js):
// tint = [colour, strength at the top of the image, strength at the bottom], blur = softness in scene units.

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
const LOADING = LOAD;
(function loadAssets() {
  const box = document.getElementById('load'), jobs = [], failed = [];
  for (const set of LOADING.sets) for (const group in set.assets) {
    if (set.only && !set.only.includes(group)) continue;
    SP[group] = []; set.assets[group].forEach((a, i) => jobs.push({ group, i, a, base: set.base, fx: set.depth && set.depth[group] }));
  }
  let done = 0;
  const step = () => {
    done++; box.textContent = LOADING.title + ' · loading art ' + done + ' / ' + jobs.length;
    if (done < jobs.length) return;
    if (failed.length) { box.textContent = 'Could not load: ' + failed.join(', ') + '. Check the file name and the entry in its manifest.js.'; return; }
    const s = document.createElement('script'); s.src = LOADING.script;
    s.onload = () => { box.style.opacity = 0; setTimeout(() => { box.style.display = 'none'; }, 700); };
    document.body.appendChild(s);
  };
  for (const j of jobs) {
    const img = new Image();
    img.onload = () => { SP[j.group][j.i] = prepare(img, j.a, j.fx); step(); };
    img.onerror = () => { failed.push(j.base + j.a.file); step(); };
    img.src = j.base + j.a.file;
  }
})();

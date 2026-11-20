'use strict';
// Sounds made by code: there are no sound files. Any world can load this file and call sfx('name').
//   sfx('tap')            plays one of the sounds in SFX below
//   music(true / false)   starts or stops the background music
//   musicArea('street')   says which piece of music fits where the players are (see PIECES_OF_MUSIC below)
//   M on the keyboard     switches all sound off and on
// Browsers only allow sound after the first key press or tap, so nothing plays before that.
const SOUND = { on: true, vol: 0.5, musicLevel: 0.3, fileLevel: 0.3, ctx: null, out: null, tune: null, bus: null, area: null };

function audio() {
  if (SOUND.ctx) return SOUND.ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    const a = new AC(), out = a.createGain(), squash = a.createDynamicsCompressor();
    out.gain.value = SOUND.vol; out.connect(squash); squash.connect(a.destination);
    SOUND.ctx = a; SOUND.out = out;
  } catch (e) { SOUND.ctx = null; }
  return SOUND.ctx;
}
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// one note: f = pitch (Hz), to = pitch it slides to, type = wave shape, at = seconds from now, dur = length, vol = loudness
function tone(a, o) {
  const t0 = a.currentTime + (o.at || 0), dur = o.dur || 0.2, osc = a.createOscillator(), g = a.createGain();
  osc.type = o.type || 'triangle'; osc.frequency.setValueAtTime(o.f, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
  const v = o.vol || 0.2, att = o.attack || 0.008;
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + att); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g); g.connect(o.out || SOUND.out); osc.start(t0); osc.stop(t0 + dur + 0.05);
}
// a puff of hiss, shaped by a filter: f = filter pitch, to = pitch it sweeps to, kind = lowpass | highpass | bandpass
let hiss = null;
function noise(a, o) {
  if (!hiss) { hiss = a.createBuffer(1, a.sampleRate, a.sampleRate); const d = hiss.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const t0 = a.currentTime + (o.at || 0), dur = o.dur || 0.2, src = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  src.buffer = hiss; src.loop = true; fl.type = o.kind || 'lowpass'; fl.Q.value = o.q || 1; fl.frequency.setValueAtTime(o.f || 800, t0);
  if (o.to) fl.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
  const v = o.vol || 0.2;
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + (o.attack || 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(fl); fl.connect(g); g.connect(SOUND.out); src.start(t0); src.stop(t0 + dur + 0.05);
}
const chime = (a, notes, step, o = {}) => notes.forEach((n, i) => tone(a, { f: hz(n), at: i * step, dur: o.dur || 0.35, vol: o.vol || 0.16, type: o.type || 'triangle' }));

const SFX = {
  paper: (a) => { noise(a, { f: 2500, to: 5000, kind: 'highpass', dur: 0.18, vol: 0.12, attack: 0.03 }); noise(a, { f: 3500, kind: 'bandpass', q: 2, dur: 0.1, vol: 0.06, at: 0.12 }); },
  steps: (a) => { for (let i = 0; i < 4; i++) tone(a, { f: 150 - i * 8, to: 90, dur: 0.08, vol: 0.09, type: 'sine', at: i * 0.17 }); },
  tap: (a) => tone(a, { f: 620, to: 880, dur: 0.07, vol: 0.14 }),
  click: (a) => noise(a, { f: 2400, kind: 'bandpass', q: 4, dur: 0.04, vol: 0.2 }),
  no: (a) => { tone(a, { f: 240, to: 190, dur: 0.12, vol: 0.13 }); tone(a, { f: 200, to: 160, dur: 0.14, vol: 0.13, at: 0.13 }); },
  good: (a) => chime(a, [72, 76, 79], 0.07),
  great: (a) => { chime(a, [72, 76, 79, 84], 0.08, { dur: 0.5 }); chime(a, [88, 91], 0.1, { dur: 0.7, vol: 0.07, type: 'sine' }); },
  fanfare: (a) => { chime(a, [67, 72, 76, 79, 76, 79, 84], 0.13, { dur: 0.6, vol: 0.17 }); chime(a, [48, 55, 60], 0.3, { dur: 1.1, vol: 0.12, type: 'sine' }); },
  piece: (a) => { noise(a, { f: 3000, kind: 'highpass', dur: 0.12, vol: 0.1 }); chime(a, [76, 81], 0.08, { dur: 0.4 }); },
  sticker: (a) => { tone(a, { f: 880, to: 1760, dur: 0.16, vol: 0.12, type: 'sine' }); chime(a, [84, 88, 91], 0.06, { dur: 0.5, vol: 0.12, type: 'sine' }); },
  hop: (a) => tone(a, { f: 280, to: 560, dur: 0.1, vol: 0.12, type: 'sine' }),
  boing: (a) => tone(a, { f: 180, to: 420, dur: 0.22, vol: 0.15, type: 'sine' }),
  honk: (a) => { for (const f of [349, 440]) tone(a, { f, dur: 0.38, vol: 0.11, type: 'sawtooth', attack: 0.02 }); },
  bark: (a) => { for (const at of [0, 0.16]) { tone(a, { f: 520, to: 300, dur: 0.09, vol: 0.14, type: 'sawtooth', at }); noise(a, { f: 1200, kind: 'bandpass', dur: 0.07, vol: 0.08, at }); } },
  whine: (a) => tone(a, { f: 900, to: 1300, dur: 0.3, vol: 0.06, type: 'sine' }),
  wind: (a) => noise(a, { f: 300, to: 1500, kind: 'bandpass', q: 0.8, dur: 1.6, vol: 0.2, attack: 0.5 }),
  splash: (a) => { noise(a, { f: 1800, to: 300, dur: 0.45, vol: 0.25 }); tone(a, { f: 300, to: 90, dur: 0.25, vol: 0.1, type: 'sine' }); },
  drip: (a) => tone(a, { f: 1400, to: 700, dur: 0.08, vol: 0.08, type: 'sine' }),
  ding: (a) => { tone(a, { f: 1318, dur: 1.4, vol: 0.2, type: 'sine' }); tone(a, { f: 2637, dur: 0.9, vol: 0.06, type: 'sine' }); tone(a, { f: 1976, dur: 1.1, vol: 0.05, type: 'sine' }); },
  thump: (a) => { tone(a, { f: 110, to: 50, dur: 0.16, vol: 0.3, type: 'sine' }); noise(a, { f: 500, dur: 0.07, vol: 0.18 }); },
  clunk: (a) => { tone(a, { f: 90, to: 60, dur: 0.2, vol: 0.28, type: 'sine' }); noise(a, { f: 900, kind: 'bandpass', dur: 0.09, vol: 0.2 }); },
  creak: (a) => tone(a, { f: 190, to: 260, dur: 0.3, vol: 0.05, type: 'sawtooth', attack: 0.08 }),
  rattle: (a) => { for (let i = 0; i < 5; i++) noise(a, { f: 1800, kind: 'bandpass', q: 3, dur: 0.035, vol: 0.12, at: i * 0.05 }); },
  flap: (a) => { for (let i = 0; i < 7; i++) noise(a, { f: 700 + i * 90, kind: 'bandpass', q: 1.5, dur: 0.06, vol: 0.12, at: i * 0.07 }); },
  train: (a) => { noise(a, { f: 120, to: 420, dur: 2.6, vol: 0.3, attack: 1.2 }); tone(a, { f: 70, to: 110, dur: 2.4, vol: 0.1, type: 'sawtooth', attack: 1 }); },
  doors: (a) => chime(a, [81, 77], 0.22, { dur: 0.45, vol: 0.13, type: 'sine' }),
  bus: (a) => { noise(a, { f: 160, to: 320, dur: 1.4, vol: 0.22, attack: 0.5 }); tone(a, { f: 80, to: 130, dur: 1.3, vol: 0.08, type: 'sawtooth', attack: 0.4 }); },
  spark: (a) => { for (let i = 0; i < 3; i++) noise(a, { f: 4000, kind: 'highpass', dur: 0.03, vol: 0.12, at: i * 0.06 }); },
  dial: (a) => { noise(a, { f: 1600, kind: 'bandpass', q: 5, dur: 0.03, vol: 0.2 }); tone(a, { f: 500, dur: 0.05, vol: 0.06 }); },
  alarm: (a) => { for (const at of [0, 0.25]) tone(a, { f: 740, dur: 0.16, vol: 0.09, type: 'square', at }); },
  cheer: (a) => chime(a, [79, 84], 0.07, { dur: 0.22, vol: 0.09 }),
  note: (a, k) => { tone(a, { f: hz(k || 72), dur: 0.7, vol: 0.2 }); tone(a, { f: hz((k || 72) + 12), dur: 0.4, vol: 0.05, type: 'sine' }); },
};
// Recorded sounds (shared/sounds/, from Kenney's free CC0 packs). Where a sound has files here, they are played instead
// of the sound made by code above; one of the files is picked at random. vol balances them against each other.
// If a file will not play (an old browser, a missing file), the sound made by code is used instead.
const SOUND_FILES_BASE = 'shared/sounds/';
const SAMPLES = {
  tap: { files: ["select_001", "select_002"], vol: 0.83 },
  click: { files: ["click_001", "select_007"], vol: 0.85 },
  dial: { files: ["select_008", "click_001"], vol: 1.0 },
  no: { files: ["error_008", "error_004"], vol: 1.0 },
  good: { files: ["confirmation_001", "confirmation_003"], vol: 0.65 },
  great: { files: ["confirmation_002", "confirmation_004"], vol: 0.65 },
  piece: { files: ["glass_004"], vol: 0.94 },
  sticker: { files: ["glass_001", "glass_004"], vol: 1.0 },
  cheer: { files: ["maximize_003", "maximize_007"], vol: 0.95 },
  paper: { files: ["bookFlip1", "bookFlip3"], vol: 1.0 },
  steps: { files: ["footstep_wood_000", "footstep_wood_001", "footstep_wood_002", "footstep_wood_003"], vol: 0.57, repeat: 4, gap: 0.17 },
  stair: { files: ["footstep00", "footstep01", "footstep03", "footstep07", "footstep_wood_001", "footstep_wood_003"], vol: 1.0 }, // one step on a wooden stair
  creak: { files: ["creak1", "creak3"], vol: 1.0 },
  hop: { files: ["cloth2", "cloth3"], vol: 1.0 },
  clunk: { files: ["impactWood_heavy_000", "impactWood_heavy_002"], vol: 0.95 },
  thump: { files: ["impactSoft_heavy_000", "impactSoft_heavy_001"], vol: 0.82 },
  rattle: { files: ["impactMetal_light_000", "impactMetal_light_001"], vol: 1.0 },
  latch: { files: ["metalLatch"], vol: 1.0 },
  door: { files: ["doorOpen_1"], vol: 1.0 },
  ding: { files: ["impactBell_heavy_000", "impactBell_heavy_001"], vol: 1.0 },
  spark: { files: ["glitch_002"], vol: 0.72 },
};
function playSample(name) {
  const smp = SAMPLES[name]; if (!smp) return false;
  const ok = smp.files.filter((f) => !(SOUND.badSamples || {})[f]); if (!ok.length) return false;
  for (let r = 0; r < (smp.repeat || 1); r++) {
    const file = ok[Math.floor(Math.random() * ok.length)], pool = (SOUND.pool = SOUND.pool || {})[file] = (SOUND.pool[file] || []);
    let el = pool.find((e) => e.paused || e.ended);
    if (!el && pool.length < 4) { el = new Audio(SOUND_FILES_BASE + file + '.ogg'); el.preload = 'auto'; el.addEventListener('error', () => { (SOUND.badSamples = SOUND.badSamples || {})[file] = true; }); pool.push(el); }
    if (!el) continue;
    const go = () => { el.volume = Math.min(1, smp.vol * SOUND.vol * 1.5); try { el.currentTime = 0; } catch (e) {} el.play().catch(() => {}); };
    if (r) setTimeout(go, r * (smp.gap || 0.15) * 1000); else go();
  }
  return true;
}
function sfx(name, k) {
  if (!SOUND.on) return;
  try { if (playSample(name)) return; } catch (e) {}
  const a = audio(); if (!a || a.state !== 'running') return;
  try { if (SFX[name]) SFX[name](a, k); } catch (e) { /* a sound is never worth stopping the game for */ }
}
// load the recorded sounds early, so the first time each is used it plays straight away
addEventListener('load', () => { for (const k in SAMPLES) for (const f of SAMPLES[k].files) { const pool = (SOUND.pool = SOUND.pool || {})[f] = SOUND.pool[f] || []; if (!pool.length) { const el = new Audio(SOUND_FILES_BASE + f + '.ogg'); el.preload = 'auto'; el.addEventListener('error', () => { (SOUND.badSamples = SOUND.badSamples || {})[f] = true; }); pool.push(el); } } });

// ---------- the music: calm pieces made by code, one for each kind of place, played by soft instruments in a little
// echo (reverb). A world says which piece fits where it is with musicArea('name'); the pieces cross-fade.
// Any piece can be swapped for a music file: list it in MUSIC_FILES (see worlds/README.md), e.g.
//   const MUSIC_FILES = { street: 'worlds/city/assets/music/quaint-town.mp3' };
// If the file is missing or will not play, the piece made by code is used instead.
//
// A piece: step = seconds per step, bar = steps in a bar, chords = [root note, 'maj' | 'min' | 'maj7' | 'min7'] per bar,
// melody = one note per step (0 = rest) played by the lead instrument, arp = which chord note the harp plays on each
// step of a bar (-1 = nothing; 3 and up go an octave higher). Notes are MIDI numbers: 60 is middle C.
const CHORD = { maj: [0, 4, 7], min: [0, 3, 7], maj7: [0, 4, 7, 11], min7: [0, 3, 7, 10] };
const PIECES_OF_MUSIC = {
  home: { // "Home Alone": a warm, slow lullaby for the house, music box and harp in G major.
    step: 0.36, bar: 8, lead: 'box', arp: [0, -1, 2, -1, 1, -1, 2, -1],
    chords: [[43, 'maj'], [40, 'min'], [48, 'maj'], [50, 'maj'], [43, 'maj'], [48, 'maj'], [45, 'min'], [50, 'maj'],
      [48, 'maj'], [43, 'maj'], [45, 'min'], [40, 'min'], [48, 'maj'], [43, 'maj'], [50, 'maj'], [43, 'maj']],
    melody: [71, 0, 74, 0, 79, 0, 74, 0, 76, 0, 0, 74, 71, 0, 0, 0, 72, 0, 76, 0, 79, 0, 76, 72, 74, 0, 0, 0, 69, 0, 0, 0,
      71, 0, 74, 0, 76, 0, 74, 71, 72, 0, 0, 76, 79, 0, 0, 0, 76, 0, 72, 0, 69, 0, 72, 0, 74, 0, 0, 0, 0, 0, 0, 0,
      79, 0, 0, 76, 72, 0, 76, 0, 74, 0, 0, 0, 71, 0, 0, 0, 72, 0, 76, 0, 81, 0, 79, 76, 79, 0, 0, 0, 76, 0, 0, 0,
      76, 0, 79, 0, 84, 0, 79, 0, 79, 0, 0, 76, 74, 0, 0, 0, 69, 0, 72, 0, 74, 0, 78, 0, 79, 0, 0, 0, 0, 0, 0, 0],
  },
  street: { // "Maple Street": the city by day. A slow music box over harp, in C major.
    step: 0.32, bar: 8, lead: 'box', arp: [0, -1, 1, -1, 2, -1, 1, -1],
    chords: [[48, 'maj'], [45, 'min'], [41, 'maj'], [43, 'maj'], [48, 'maj'], [40, 'min'], [41, 'maj'], [43, 'maj'],
      [45, 'min'], [41, 'maj'], [48, 'maj'], [43, 'maj'], [41, 'maj'], [48, 'maj'], [38, 'min'], [43, 'maj']],
    melody: [76, 0, 79, 0, 84, 0, 79, 0, 81, 0, 0, 79, 76, 0, 0, 0, 77, 0, 81, 0, 84, 0, 81, 79, 79, 0, 0, 0, 74, 0, 0, 0,
      76, 0, 79, 0, 81, 0, 79, 76, 79, 0, 0, 76, 71, 0, 0, 0, 72, 0, 74, 0, 76, 0, 81, 0, 79, 0, 0, 0, 0, 0, 0, 0,
      84, 0, 0, 81, 79, 0, 76, 0, 77, 0, 0, 0, 81, 0, 0, 0, 79, 0, 76, 0, 72, 0, 76, 0, 74, 0, 0, 0, 0, 0, 79, 0,
      81, 0, 84, 0, 81, 0, 77, 0, 79, 0, 0, 0, 76, 0, 0, 0, 74, 0, 77, 0, 81, 0, 77, 74, 71, 0, 74, 0, 79, 0, 0, 0],
  },
  under: { // "Underground": the metro. Slow bells and a soft pad, in A minor.
    step: 0.4, bar: 8, lead: 'bell', arp: [0, -1, -1, 2, -1, -1, 4, -1],
    chords: [[45, 'min7'], [41, 'maj7'], [48, 'maj'], [43, 'maj'], [45, 'min7'], [41, 'maj7'], [43, 'maj'], [43, 'maj']],
    melody: [76, 0, 0, 0, 0, 0, 72, 0, 77, 0, 0, 0, 76, 0, 0, 0, 79, 0, 0, 0, 0, 0, 76, 0, 74, 0, 0, 0, 0, 0, 0, 0,
      72, 0, 0, 0, 0, 0, 76, 0, 81, 0, 0, 0, 79, 0, 0, 0, 74, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  evening: { // "Old Town Evening": a gentle waltz for the sunset streets, in F major, with a soft flute.
    step: 0.25, bar: 6, lead: 'flute', arp: [0, 1, 2, 4, 2, 1],
    chords: [[41, 'maj'], [38, 'min'], [46, 'maj'], [48, 'maj'], [41, 'maj'], [45, 'min'], [46, 'maj'], [48, 'maj'],
      [41, 'maj'], [46, 'maj'], [41, 'maj'], [48, 'maj'], [38, 'min'], [46, 'maj'], [48, 'maj'], [41, 'maj']],
    melody: [72, 0, 0, 0, 69, 0, 74, 0, 0, 0, 72, 0, 70, 0, 72, 0, 74, 0, 72, 0, 0, 0, 0, 0,
      77, 0, 0, 0, 76, 0, 74, 0, 0, 0, 72, 0, 70, 0, 74, 0, 72, 0, 67, 0, 0, 0, 0, 0,
      69, 0, 72, 0, 77, 0, 77, 0, 0, 0, 74, 0, 72, 0, 0, 0, 69, 0, 67, 0, 69, 0, 70, 0,
      69, 0, 0, 0, 74, 0, 74, 0, 72, 0, 70, 0, 72, 0, 0, 0, 76, 0, 77, 0, 0, 0, 0, 0],
  },
};

// the soft instruments. Each plays one note: f = pitch, at = start time, dur = length, v = loudness, out = where it goes
function instrument(a, kind, f, at, dur, v, out) {
  const g = a.createGain(); g.connect(out);
  const osc = (type, freq, det = 0) => { const o = a.createOscillator(); o.type = type; o.frequency.value = freq; o.detune.value = det; return o; };
  const env = (attack, hold, release) => { g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(v, at + attack); g.gain.setValueAtTime(v, at + attack + hold); g.gain.exponentialRampToValueAtTime(0.0001, at + attack + hold + release); return attack + hold + release; };
  let parts = [], end;
  if (kind === 'box') { // music box: a pure tone with a faint high shimmer, dying away
    end = env(0.005, 0, 1.6); const s = a.createGain(); s.gain.value = 0.18; s.connect(g); const hi = osc('sine', f * 4); hi.connect(s); parts = [osc('sine', f), hi];
    parts[0].connect(g);
  } else if (kind === 'bell') {
    end = env(0.01, 0, 2.8); const s = a.createGain(); s.gain.value = 0.25; s.connect(g); const p2 = osc('sine', f * 2.76); p2.connect(s); const p1 = osc('sine', f); p1.connect(g); parts = [p1, p2];
  } else if (kind === 'flute') { // soft attack, gentle wobble
    end = env(0.09, Math.max(0.05, dur - 0.1), 0.45); const lfo = osc('sine', 4.8), depth = a.createGain(); depth.gain.value = f * 0.006; lfo.connect(depth);
    const p1 = osc('sine', f), p2 = osc('triangle', f, 4), mix = a.createGain(); mix.gain.value = 0.35; depth.connect(p1.frequency); depth.connect(p2.frequency); p1.connect(g); p2.connect(mix); mix.connect(g); parts = [p1, p2, lfo];
  } else if (kind === 'harp') { // plucked: bright at first, then mellow
    end = env(0.004, 0, 1.4); const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, at); lp.frequency.exponentialRampToValueAtTime(700, at + 0.6); lp.connect(g);
    const p = osc('triangle', f); p.connect(lp); parts = [p];
  } else if (kind === 'pad') { // a warm held chord note
    end = env(Math.min(1.2, dur * 0.4), Math.max(0, dur * 0.5), 1.6); const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 850; lp.Q.value = 0.3; lp.connect(g);
    parts = [osc('sawtooth', f, -7), osc('sawtooth', f, 7)]; parts.forEach((p) => p.connect(lp));
  } else { // bass: a round low note
    end = env(0.03, dur * 0.3, dur * 0.9 + 0.4); const p = osc('sine', f); p.connect(g); const s = a.createGain(); s.gain.value = 0.2; s.connect(g); const o2 = osc('triangle', f * 2); o2.connect(s); parts = [p, o2];
  }
  for (const p of parts) { p.start(at); p.stop(at + end + 0.05); }
}
// a little room for the music to ring in: a reverb made from fading noise
function musicBus(a) {
  if (SOUND.bus) return SOUND.bus;
  const bus = a.createGain(), dry = a.createGain(), wet = a.createGain(), verb = a.createConvolver(), len = Math.floor(a.sampleRate * 3.2);
  const ir = a.createBuffer(2, len, a.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  verb.buffer = ir; dry.gain.value = 0.75; wet.gain.value = 0.42; bus.gain.value = SOUND.musicLevel; // musicLevel: how loud the music is next to the sounds
  bus.connect(dry); bus.connect(verb); verb.connect(wet); dry.connect(SOUND.out); wet.connect(SOUND.out);
  SOUND.bus = bus; return bus;
}
// plays one step of a piece into out, at time at
function playStep(a, pc, i, at, out) {
  const n = pc.melody.length, s = i % n, b = Math.floor(s / pc.bar), inBar = s % pc.bar, [root, kind] = pc.chords[b % pc.chords.length], tones = CHORD[kind];
  const note = (k) => root + 12 + tones[k % tones.length] + 12 * Math.floor(k / tones.length); // chord note k, from the octave above the root
  if (pc.melody[s]) instrument(a, pc.lead, hz(pc.melody[s]), at, pc.step * 2.5, pc.lead === 'flute' ? 0.16 : pc.lead === 'bell' ? 0.12 : 0.17, out);
  const k = pc.arp[inBar]; if (k >= 0) instrument(a, 'harp', hz(note(k)), at, pc.step, 0.075, out);
  if (inBar === 0) {
    instrument(a, 'bass', hz(root - 12 < 33 ? root : root - 12), at, pc.step * pc.bar, 0.2, out);
    for (const t of tones.slice(0, 3)) instrument(a, 'pad', hz(root + 12 + t), at, pc.step * pc.bar, 0.018, out);
  }
}
// a music file in place of a piece, if one is listed and it plays
function musicFile(name) { // { file, vol } or null
  const m = typeof MUSIC_FILES !== 'undefined' && MUSIC_FILES[name] && !(SOUND.badFiles || {})[name] ? MUSIC_FILES[name] : null;
  return !m ? null : typeof m === 'string' ? { file: m, vol: 1 } : m;
}
function startPiece(a, name) {
  const gain = a.createGain(); gain.gain.setValueAtTime(0.0001, a.currentTime); gain.gain.linearRampToValueAtTime(1, a.currentTime + 2.5); gain.connect(musicBus(a));
  const st = { name, gain, step: 0, next: a.currentTime + 0.25 }, file = musicFile(name);
  if (file) {
    const el = new Audio(file.file); el.loop = true; el.volume = 0; st.el = el; const target = () => (SOUND.on && !document.hidden ? Math.min(1, SOUND.fileLevel * (file.vol || 1)) : 0);
    el.addEventListener('error', () => { (SOUND.badFiles = SOUND.badFiles || {})[name] = true; if (SOUND.tune === st) { stopPiece(st); SOUND.tune = null; musicArea(name, true); } });
    el.play().catch(() => {});
    st.timer = setInterval(() => { const t = target(); el.volume = t > el.volume ? Math.min(t, el.volume + 0.015) : Math.max(t, el.volume - 0.05); }, 60); // fade in, and quiet while the page is in the background
    return st;
  }
  const pc = PIECES_OF_MUSIC[name] || PIECES_OF_MUSIC.street;
  st.timer = setInterval(() => { // keeps about half a second of notes lined up ahead
    if (a.state !== 'running' || document.hidden) { st.next = a.currentTime + 0.25; return; } // quiet while the page is in the background
    while (st.next < a.currentTime + 0.6) { try { playStep(a, pc, st.step, st.next, gain); } catch (e) {} st.step++; st.next += pc.step; }
  }, 120);
  return st;
}
function stopPiece(st) { // fade out over two seconds, then stop
  clearInterval(st.timer);
  if (st.el) { const el = st.el, f = setInterval(() => { el.volume = Math.max(0, el.volume - 0.03); if (el.volume <= 0) { clearInterval(f); el.pause(); } }, 60); return; }
  const a = SOUND.ctx; try { st.gain.gain.cancelScheduledValues(a.currentTime); st.gain.gain.setValueAtTime(st.gain.gain.value, a.currentTime); st.gain.gain.linearRampToValueAtTime(0.0001, a.currentTime + 2); } catch (e) {}
  setTimeout(() => st.gain.disconnect(), 4500);
}
// which piece should play here: called by the world as the siblings move (cheap to call every frame)
function musicArea(name, force) {
  SOUND.area = name;
  if (!SOUND.on || !SOUND.wantMusic) return;
  const a = SOUND.ctx; if (!a || a.state !== 'running') return;
  if (SOUND.tune && SOUND.tune.name === name && !force) return;
  if (SOUND.tune) stopPiece(SOUND.tune);
  SOUND.tune = startPiece(a, name);
}
function music(on) {
  if (SOUND.tune) { stopPiece(SOUND.tune); SOUND.tune = null; }
  if (on && SOUND.on && audio()) musicArea(SOUND.area || 'street', true);
}
// sound can only start after a key press or tap; M switches everything off and on
function wakeSound(e) {
  if (e && e.code === 'KeyM') { SOUND.on = !SOUND.on; if (SOUND.out) SOUND.out.gain.value = SOUND.on ? SOUND.vol : 0; if (!SOUND.on) music(false); else if (SOUND.wantMusic) music(true); return; }
  const a = audio(); if (!a) return;
  if (a.state === 'suspended') a.resume().then(() => { if (SOUND.on && SOUND.wantMusic && !SOUND.tune) music(true); });
  else if (SOUND.on && SOUND.wantMusic && !SOUND.tune) music(true);
}
addEventListener('keydown', wakeSound); addEventListener('pointerdown', wakeSound);

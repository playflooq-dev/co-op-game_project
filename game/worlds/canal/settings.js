'use strict';
// Settings for the Canal: Level 3, the last level of Chapter 1 (see PROGRESSION.md). Change a number here and refresh.
// Positions are in scene units: the screen is always 1080 units tall, and the quay runs left to right along x.
// What runs it: level.js (the level), scenery.js (sky, houses, the quay, the water), things.js (the canal's own
// objects), react.js (small reactions) and, shared with other worlds, shared/kit.js (boxes, plates, gates, levers, the
// see-saw, boats, the ladder), shared/movement.js, shared/physics.js and shared/chapter.js (the chapter and the save).
// The canal has no art of its own: houses, lamps, the bridge and its hut are the city's, the trees are the forest's.
//
// THE ONE NEW IDEA: light-only surfaces. Thin blue planks and small blue boats hold the brother (and a light box).
// Under the sister they creak, bend and sink, and send her back to where she came from. She can never cross one.
// Everything else is known from Levels 1 and 2: walking, jumping, plates and gates, carrying a light box, the lift,
// levers and the see-saw. No toss, no pulley and no heavy crate in this level.

const CANAL = {
  length: 12900,          // how long the whole quay is
  walk: [150, 12700],     // furthest left and right the siblings can walk
  feet: 935,              // where feet stand on the quay
  facadeBase: 905,        // where the houses meet the quay
  kerb: 990,              // the edge of the quay; the canal is in front of it
  horizon: 655,           // where the side canals disappear into the distance
  exit: 12450,            // the forest path on the far bank: the level and the chapter end when both are there
  next: 'map.html?from=canal', // where the end card leads on to (the chapter map)
};

// How moving feels: as in Level 2 (shared/movement.js), except that there is no toss. Level 3 uses only the tools in
// the list above, and a toss would be a way round the see-saw in section 6.
const CANAL_MOVE = { toss: false };

// Hints, as pictures, as in Level 2: after this many seconds without the next step, a sparkle, then an arrow, then a
// ghost of the sibling whose turn it is. canal.html?hints=fast makes them come ten times sooner, for checking.
const HINT_TIMES = [20, 40, 60];

// The sky goes from late afternoon to sunset along the quay.
const SKY = { start: ['#86a6d2', '#c6cfd8', '#f3dcb8', '#f9e3bd'], end: ['#6c78b4', '#c896ae', '#f2b486', '#f9d49c'], sunX: 0.85 };

// ---------- water across the quay: [from, to]. Nobody can walk here; falling in is a splash, and a moment later that
// sibling is back on the bank. Streams are too wide to jump (a jump carries about 190).
const STREAM_A = [2300, 2640];    // section 2: the first thin plank
const BASIN = [4040, 4950];       // section 3: the boats and the raft
const STREAM_B = [7500, 7840];    // section 5: the plank he carries the box over
const RIVER = [10900, 11700];     // section 7: the Old Bridge (the bridge picture is 820 wide)
const WATERS = [STREAM_A, BASIN, STREAM_B, RIVER];

// ---------- THE SECTIONS, left to right. Each line in `things` places one object: kinds from shared/kit.js (block,
// ledge, box, plate, lever, boat, bar), the canal's own from things.js (thinplank, footbridge, lightboat, launcher,
// raft, dropladder, lockgate, ducks, moored) and the city's Old Bridge (bridge). x is the place along the quay
// ([from, to] for long things), h the height above it. `view` is the stretch the camera holds still on while both
// are inside it; `goal` is the picture in the thought bubble. canal.html?section=3 starts at section 3.
// For scale: a jump rises about 207 and carries about 190; he is about 180 tall and she about 220; she reaches about
// 280 up, he about 220. Things can only be used with feet on something, never in a jump.
const SECTIONS = [
  { name: '1 Warm-up: plate and gate', goal: 'gate', x: [150, 1800], start: [360, 500], view: [170, 1780], things: [
    // known from Level 1, and nothing else on the first screen: the gate is open while somebody stands on either
    // plate. One holds it, the other walks through and holds it from the far side.
    { kind: 'plate', id: 'w1', x: 900 }, { kind: 'lockgate', x: 1250, by: ['w1', 'w2'], any: true }, { kind: 'plate', id: 'w2', x: 1600 },
  ] },
  { name: '2 Teach: the thin plank', goal: 'plank', x: [1800, 3300], start: [1880, 1970], view: [1820, 3280], things: [
    // the new idea, alone: a thin blue plank over a stream. It holds him. Under her it creaks and bends, and she steps
    // back. On the far side is a plate: one step on it and a sturdy bridge slides out for her, and stays.
    { kind: 'footbridge', x: STREAM_A, by: 't1' },
    { kind: 'thinplank', x: [STREAM_A[0] - 12, STREAM_A[1] + 12] },
    { kind: 'plate', id: 't1', x: 2900 },
  ] },
  { name: '3 Practise: the see-saw and the boats', goal: 'boat', x: [3300, 5400], start: [3380, 3470], view: [3560, 5200], things: [
    // see-saw + light-only. The first boat is a step from the quay, the middle one is too far to jump to. He stands on
    // the blue end of the see-saw, she jumps onto the green end, and he flies over to the middle boat. From there he
    // hops over the raft to the far quay and pulls the lever: the raft goes over and fetches her.
    { kind: 'launcher', x: 3820, half: 170, to: [4625, -4], rise: 2.3 },
    { kind: 'lightboat', x: 4135, w: 170 }, { kind: 'lightboat', x: 4625, w: 170 },
    { kind: 'raft', x: [BASIN[0] + 109, 4840], by: 'r3' }, { kind: 'lever', id: 'r3', x: 5070, h: 150, once: true },
  ] },
  { name: '4 A calm moment', x: [5400, 6600], start: [5480, 5570], view: [5420, 6580], things: [
    // nothing has to be done here, and nothing can be used: ducks on the canal and a boat tied up at the quay
    { kind: 'moored', x: 5900 }, { kind: 'ducks', x: [6150, 6500], n: 3 },
  ] },
  { name: '5 Twist: the box over the plank', goal: 'ladder', x: [6600, 8400], start: [6680, 6770], view: [6750, 8390], things: [
    // carry + plate + light-only. He carries the light box over the thin plank (it bends a little more) and puts it
    // on the plate. That lets the ladder down on her side. She climbs up to the high green lever, which only she
    // can reach: it slides the lock bridge out over the stream and opens the lock gate, for both.
    { kind: 'box', x: 6900 },
    { kind: 'ledge', look: 'balcony', x: [7050, 7330], h: 330 }, { kind: 'dropladder', x: 7090, h: 330, by: 'p5' },
    { kind: 'lever', id: 'lock', x: 7250, h: 600, base: 330, once: true },
    { kind: 'footbridge', x: STREAM_B, by: 'lock' },
    { kind: 'thinplank', x: [STREAM_B[0] - 12, STREAM_B[1] + 12] },
    { kind: 'plate', id: 'p5', x: 8000 }, { kind: 'lockgate', x: 8250, by: ['lock'], latch: true },
    { kind: 'bar', x: 8340 },
  ] },
  { name: '6 Bonus: the see-saw on the ledge', goal: 'seesaw', x: [8400, 10100], start: [8480, 8570], view: [8500, 10000], things: [
    // known tools only: carry + see-saw. The ledge is too high to jump onto, so the box goes against it as a step.
    // Both climb up; he stands on the blue end, she jumps onto the green end, and he flies up to the high shelf,
    // where the lever opens the way to the bridge.
    { kind: 'box', x: 8620 },
    { kind: 'block', x: [8840, 9480], h: 230 },
    // No dead end: a low step on the far side. Whoever hops down there before the lever is pulled can climb back up.
    // (It is no way round the puzzle: the far side can only be reached over the top, and the shelf is far too high from it.)
    { kind: 'block', x: [9480, 9600], h: 115 },
    { kind: 'launcher', x: 9190, half: 170, h: 230, to: [9450, 560], rise: 2.0 },
    { kind: 'ledge', look: 'balcony', x: [9350, 9620], h: 560 }, { kind: 'lever', id: 'way', x: 9530, h: 690, base: 560, once: true },
    { kind: 'lockgate', x: 9800, by: ['way'], latch: true },
    { kind: 'bar', x: 9900 },
  ] },
  { name: '7 The Old Bridge: the end of Chapter 1', goal: 'bridge', x: [10100, 12700], start: [10180, 10270], view: [10560, 12000], things: [
    // two levers on opposite banks, held at the same time, bring the bridge down. Only he can get to the far one:
    // over the small boats. Then she walks over the bridge to him: a high five, and the forest is ahead.
    { kind: 'lightboat', x: 11000, w: 170 }, { kind: 'lightboat', x: 11200, w: 170 }, { kind: 'lightboat', x: 11400, w: 170 }, { kind: 'lightboat', x: 11600, w: 170 },
    { kind: 'bridge', x: RIVER, by: ['near', 'far'], time: 2.6 },
    { kind: 'lever', id: 'near', hold: true, x: 10700, h: 250 }, { kind: 'lever', id: 'far', hold: true, x: 11900, h: 80, who: 'bro' },
  ] },
];

// ---------- scenery (nothing here can be bumped into or used)
// The houses, left to right, between the waters: [art, x of its middle]. The art names are groups in the city's
// assets/manifest.js. fillQuay(from, to, [names]) lines houses up edge to edge, taking turns through the names.
function fillQuay(from, to, names) {
  const out = []; let x = from, i = 0;
  while (x < to - 150) { const n = names[i++ % names.length], w = CITY_ASSETS[n][0].w - 60; out.push([n, x + w / 2]); x += w; }
  return out;
}
const HOUSES = [
  ...fillQuay(-240, STREAM_A[0], ['townhouseBrick', 'townhouseCream', 'bookshop', 'apartment', 'townhouseBrick']),
  ...fillQuay(STREAM_A[1] - 30, BASIN[0], ['townhouseCream', 'cafe', 'townhouseBrick', 'apartment']),
  ...fillQuay(BASIN[1] - 30, STREAM_B[0], ['bakery', 'townhouseCream', 'apartment', 'townhouseBrick', 'bookshop', 'townhouseCream', 'cafe', 'townhouseBrick']),
  ...fillQuay(STREAM_B[1] - 30, RIVER[0] - 40, ['townhouseCream', 'apartment', 'townhouseBrick', 'cornerShop', 'townhouseCream', 'bookshop', 'townhouseBrick', 'apartment', 'cafe']),
];
// Small things along the quay, only to look at: [art, x]. None on the first screen, and no bench next to anything
// that is jumped onto.
const PROPS = [
  ['streetLamp', 2080], ['streetLamp', 3520], ['streetLamp', 5300], ['bench', 5640], ['streetLamp', 6560],
  ['streetLamp', 8440], ['streetLamp', 10400],
];
// The far bank of the river is the edge of the forest, where Chapter 2 begins: [kind, x, scale] (forest art).
// (The big trees are drawn full size: their picture ends in a straight edge at the top, which must stay above the screen.)
const FOREST_EDGE = [
  ['trees', 11790, 0.8], ['bushes', 12010, 0.85], ['trees', 12150, 0.95], ['bigTrees', 12330, 1], ['bushes', 12480, 0.9],
  ['trees', 12620, 1], ['bigTrees', 12800, 1.05], ['trees', 12930, 0.9],
];

// Music: the canal borrows the city's evening piece (CC0, see worlds/city/assets/music/CREDITS.txt).
const MUSIC_FILES = {
  quay: { file: 'worlds/city/assets/music/quaint-town.mp3', vol: 0.58 },
  evening: { file: 'worlds/city/assets/music/magic-town.mp3', vol: 0.45 },
};

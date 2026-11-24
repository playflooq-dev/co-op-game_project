'use strict';
// Settings for the Park: Level 1, the gentle first level (see PROGRESSION.md). Change a number here and refresh.
// Positions are in scene units: the screen is always 1080 units tall, and the path runs left to right along x.
// What runs it: level.js (the level), scenery.js (sky, town, trees, grass and path), things.js (the park's own
// objects), life.js (everything that reacts: birds, flowers, the cat, the ducks) and, shared with other
// worlds, shared/kit.js (boxes, plates, gates), shared/movement.js and shared/physics.js.
// The park has no art of its own: it borrows from the forest (trees, bushes, flowers, grass, logs, clouds) and from
// the city (the far skyline, lamps, benches, the park gate).

const PARK = {
  length: 9950,          // how long the whole path is
  walk: [150, 9700],     // furthest left and right the siblings can walk
  feet: 935,             // where feet stand on the path
  exit: 9560,            // the park gate at the far end: the level ends when both are there
  next: 'city.html',     // where the end card leads on to (the city lab, until there is a Level 2)
};

// How moving feels in Level 1: a little more forgiving than the lab. These replace the same numbers in MOVE
// (shared/movement.js) on this page only; every other number is as there. park.html?tune=1 has sliders.
const PARK_MOVE = {
  jumpHeight: 1.2,   // a jump rises 1.2 brother-heights (about 226 units); the lab has 1.1
  jumpTime: 0.35,    // seconds to the top of the jump
  coyote: 0.15,      // seconds after walking off an edge in which a jump still works (the lab has 0.10)
  buffer: 0.17,      // seconds a jump press is remembered before landing (the lab has 0.12)
  toss: false,       // no toss in Level 1: grab while he is on her shoulders just sets him down
};

// Hints, as pictures: when the next step of a puzzle stays undone this many seconds, first the right thing sparkles,
// then an arrow points at it, then a faint ghost of the sibling whose turn it is shows where to stand.
// Earlier than in the lab (20, 40, 60). park.html?hints=fast makes them come ten times sooner, for checking.
const HINT_TIMES = [10, 20, 35];

// ---------- THE SECTIONS, left to right. Level 1 may only use: walking, jumping, small blue plates, gates, one light
// box, and the lift. Each line in `things` places one object: kinds from shared/kit.js (block, plate, bar),
// the park's own from things.js (hurdle, log, puddle, parkgate, parkbox, pond, balloon) and the ones that only
// react from life.js (birds, flowers). x is the place along the path ([from, to] for long
// things), h the height above the path. `view` is the stretch the camera holds still on while both are inside it;
// `goal` is the picture in the thought bubble. park.html?section=3 starts at section 3.
// There is nothing to collect in Level 1 (the three stickers were taken out on 2026-11-24; the kit still has them),
// and no dog and no ball (saved for a later level in shared/later/).
// For scale: a jump rises about 226; he is 188 tall and she 222; she reaches 284 up (370 standing on a box), he 232,
// and 404 from her shoulders. Things can be taken from 8 below, and only with feet on something, not in a jump.
const SECTIONS = [
  { name: '1 Learn to move', x: [150, 3300], start: [360, 500], things: [
    // nothing to solve: two small steps up and down, a low fence, a puddle and a log to hop over
    { kind: 'block', x: [1000, 1100], h: 55 }, { kind: 'block', x: [1100, 1290], h: 110 }, { kind: 'block', x: [1290, 1390], h: 55 },
    { kind: 'hurdle', x: 1900, h: 82 },
    { kind: 'puddle', x: 2260, w: 210 },
    { kind: 'log', x: 2640, h: 84 },
    // birds; flowers that bounce
    { kind: 'birds', x: 950, n: 3 }, { kind: 'birds', x: 2450, n: 2 },
    { kind: 'flowers', x: [520, 960], n: 5 }, { kind: 'flowers', x: [1420, 1570], n: 2 }, { kind: 'flowers', x: [2820, 3260], n: 5 },
  ] },
  { name: '2 Plate and gate (teach)', goal: 'gate', x: [3300, 4700], start: [3380, 3470], view: [3320, 4680], things: [
    // the gate is open while somebody stands on either plate: one holds it, the other walks through and holds it
    // from the far side. The plates are far enough from the gate that nobody can step off and dash through.
    { kind: 'plate', id: 'a', x: 3640 }, { kind: 'parkgate', x: 4010, by: ['a', 'b'], any: true }, { kind: 'plate', id: 'b', x: 4380 },
    { kind: 'birds', x: 4210, n: 2 }, { kind: 'flowers', x: [4470, 4690], n: 3 },
  ] },
  { name: '3 Box on plate (practise)', goal: 'gate', x: [4700, 6100], start: [4780, 4870], view: [4720, 6080], things: [
    // this time there is no plate on the far side, but there is a box: one holds the gate, the other fetches the
    // box and brings it back onto the plate. A box can do a person's job. The bar keeps the box in this section.
    { kind: 'plate', id: 'c', x: 5010 }, { kind: 'parkgate', x: 5400, by: ['c'] }, { kind: 'parkbox', x: 5730 },
    { kind: 'bar', x: 6030 }, { kind: 'birds', x: 5560, n: 2 },
  ] },
  { name: '4 The pond (a calm moment)', x: [6100, 7300], start: [6180, 6270], view: [6120, 7280], things: [
    // nothing has to be done here: grab at the pond makes a splash
    { kind: 'pond', x: [6420, 7000] },
    { kind: 'flowers', x: [6130, 6400], n: 4 }, { kind: 'flowers', x: [7020, 7290], n: 4 }, { kind: 'birds', x: 7080, n: 3 },
  ] },
  { name: '5 The balloon (twist: the lift)', goal: 'balloon', x: [7300, 8500], start: [7380, 7470], view: [7320, 8480], things: [
    // a red balloon is caught on a branch, too high for either: she lifts him and he takes it.
    // The little gate after the tree opens for whoever brings a balloon.
    { kind: 'balloon', x: 7840, h: 392 }, { kind: 'parkgate', x: 8250, by: ['balloon'], latch: true },
    { kind: 'flowers', x: [7480, 7700], n: 3 },
  ] },
  { name: '6 The way out (together)', goal: 'exit', x: [8500, 9700], start: [8580, 8670], view: [8520, 9900], things: [
    // two plates side by side: both at once, and the gate stays open
    { kind: 'plate', id: 'e1', x: 8860 }, { kind: 'plate', id: 'e2', x: 9000 }, { kind: 'parkgate', x: 9190, by: ['e1', 'e2'], latch: true, last: true },
    { kind: 'flowers', x: [8540, 8780], n: 3 }, { kind: 'birds', x: 9420, n: 3 },
  ] },
];

// ---------- scenery (nothing here can be bumped into): [art, x, scale]. The art names are groups in the forest's
// and the city's assets/manifest.js. Trees and bushes stand behind the path; lamps and benches beside it.
const PARK_TREES = [
  ['blossomTrees', 250, 0.9], ['trees', 760, 1], ['trees', 1480, 0.92], ['blossomTrees', 2060, 0.86], ['trees', 2900, 1], ['trees', 3480, 0.9],
  ['blossomTrees', 4560, 0.94], ['trees', 5180, 0.88], ['trees', 5960, 1], ['blossomTrees', 6240, 0.82], ['trees', 7160, 0.95],
  ['trees', 8640, 0.92], ['blossomTrees', 9120, 0.88], ['trees', 9820, 1],
];
const PARK_PROPS = [
  ['streetLamp', 620], ['bench', 2040], ['streetLamp', 3180], ['bench', 4560], ['streetLamp', 5200], ['streetLamp', 6140],
  ['bench', 7130], ['streetLamp', 7290], ['streetLamp', 8730],
];

// Music: the park borrows the city's daytime piece (CC0, see worlds/city/assets/music/CREDITS.txt).
const MUSIC_FILES = { park: { file: 'worlds/city/assets/music/quaint-town.mp3', vol: 0.55 } };

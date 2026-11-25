'use strict';
// Settings for the Park: Level 1, the gentle first level (see PROGRESSION.md). Change a number here and refresh.
// Positions are in scene units: the screen is always 1080 units tall, and the path runs left to right along x.
// What runs it: level.js (the level), learn.js (the keys shown as pictures while players learn to move), scenery.js
// (sky, town, trees, grass and path), things.js (the park's own objects), life.js (everything that reacts: birds, flowers, the cat, the ducks) and, shared with other
// worlds, shared/kit.js (boxes, plates, gates), shared/movement.js and shared/physics.js.
// The park has no art of its own: it borrows from the forest (trees, bushes, flowers, grass, logs, clouds) and from
// the city (the far skyline, lamps, benches, the park gate).

const PARK = {
  length: 11150,         // how long the whole path is
  walk: [150, 10900],    // furthest left and right the siblings can walk
  feet: 935,             // where feet stand on the path
  exit: 10760,           // the park gate at the far end: the level ends when both are there
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

// Learning the keys (learn.js). Each player's keys are shown as big pictures next to their own sibling, one move at a
// time: first walking (left and right), then jumping; the grab key only where it is first needed. A picture fades
// once that player has done the move.
const LEARN_SET = {
  walked: 45,   // how far somebody must walk one way with their own key before that key's picture fades
  enough: 480,  // walked this far to the right without ever going left: the jump is shown anyway
  ghost: 4,     // seconds a player stands still with a picture showing before a ghost of their sibling shows the move
  liftFrom: 2,  // the lift works from this section on (2 = from the first puzzle). Not in section 1: there, two
                // players trying their keys side by side would end up on each other's shoulders without knowing why.
};

// ---------- THE SECTIONS, left to right. Level 1 may only use: walking, jumping, small blue plates, gates, one light
// box, and the lift. Each line in `things` places one object: kinds from shared/kit.js (block, plate, bar),
// the park's own from things.js (log, parkgate, parkbox, pond, balloon; hurdle and puddle are there too but not
// placed) and the ones that only react from life.js (birds, flowers). x is the place along the path ([from, to] for long
// things), h the height above the path. `view` is the stretch the camera holds still on while both are inside it;
// `goal` is the picture in the thought bubble. park.html?section=3 starts at section 3.
// There is nothing to collect in Level 1 (the three stickers were taken out on 2026-11-24; the kit still has them),
// and no dog and no ball (saved for a later level in shared/later/).
// For scale: a jump rises about 226; he is 188 tall and she 222; she reaches 284 up (370 standing on a box), he 232,
// and 404 from her shoulders. Things can be taken from 8 below, and only with feet on something, not in a jump.
const SECTIONS = [
  { name: '1 Learn to move', x: [150, 4500], start: [560, 940], things: [
    // Only the two of them, a long flat path, and their keys shown as pictures. Nothing to solve, nothing to collect,
    // nobody else about, nowhere to fall. In order: a long flat stretch to walk on (and to try the jump), one very
    // low step, a flat stretch, three low steps up and down, a flat stretch, one low log, and a last flat stretch
    // before the first puzzle. Each step and the log need a jump, so nobody reaches the first puzzle without having
    // walked and jumped. (learn.js shows the keys; the numbers for it are in LEARN_SET above.)
    { kind: 'block', x: [1700, 2000], h: 44 },
    { kind: 'block', x: [2500, 2620], h: 44 }, { kind: 'block', x: [2620, 2820], h: 88 }, { kind: 'block', x: [2820, 2940], h: 44 },
    { kind: 'log', x: 3560, h: 84 },
  ] },
  { name: '2 Plate and gate (teach)', goal: 'gate', x: [4500, 5900], start: [4580, 4670], view: [4520, 5880], things: [
    // the gate is open while somebody stands on either plate: one holds it, the other walks through and holds it
    // from the far side. The plates are far enough from the gate that nobody can step off and dash through.
    { kind: 'plate', id: 'a', x: 4840 }, { kind: 'parkgate', x: 5210, by: ['a', 'b'], any: true }, { kind: 'plate', id: 'b', x: 5580 },
    { kind: 'birds', x: 5410, n: 2 }, { kind: 'flowers', x: [5670, 5890], n: 3 },
  ] },
  { name: '3 Box on plate (practise)', goal: 'gate', x: [5900, 7300], start: [5980, 6070], view: [5920, 7280], things: [
    // this time there is no plate on the far side, but there is a box: one holds the gate, the other fetches the
    // box and brings it back onto the plate. A box can do a person's job. The bar keeps the box in this section.
    // This is the first place the grab key is needed: its picture shows over whoever stands at the box.
    { kind: 'plate', id: 'c', x: 6210 }, { kind: 'parkgate', x: 6600, by: ['c'] }, { kind: 'parkbox', x: 6930 },
    { kind: 'bar', x: 7230 }, { kind: 'birds', x: 6760, n: 2 },
  ] },
  { name: '4 The pond (a calm moment)', x: [7300, 8500], start: [7380, 7470], view: [7320, 8480], things: [
    // nothing has to be done here: grab at the pond makes a splash
    { kind: 'pond', x: [7620, 8200] },
    { kind: 'flowers', x: [7330, 7600], n: 4 }, { kind: 'flowers', x: [8220, 8490], n: 4 }, { kind: 'birds', x: 8280, n: 3 },
  ] },
  { name: '5 The balloon (twist: the lift)', goal: 'balloon', x: [8500, 9700], start: [8580, 8670], view: [8520, 9680], things: [
    // a red balloon is caught on a branch, too high for either: she lifts him and he takes it.
    // The little gate after the tree opens for whoever brings a balloon.
    { kind: 'balloon', x: 9040, h: 392 }, { kind: 'parkgate', x: 9450, by: ['balloon'], latch: true },
    { kind: 'flowers', x: [8680, 8900], n: 3 },
  ] },
  { name: '6 The way out (together)', goal: 'exit', x: [9700, 10900], start: [9780, 9870], view: [9720, 11100], things: [
    // two plates side by side: both at once, and the gate stays open
    { kind: 'plate', id: 'e1', x: 10060 }, { kind: 'plate', id: 'e2', x: 10200 }, { kind: 'parkgate', x: 10390, by: ['e1', 'e2'], latch: true, last: true },
    { kind: 'flowers', x: [9740, 9980], n: 3 }, { kind: 'birds', x: 10620, n: 3 },
  ] },
];

// ---------- scenery (nothing here can be bumped into): [art, x, scale]. The art names are groups in the forest's
// and the city's assets/manifest.js. Trees and bushes stand behind the path; lamps and benches beside it.
const PARK_TREES = [
  ['blossomTrees', 250, 0.9], ['trees', 760, 1], ['trees', 1480, 0.92], ['blossomTrees', 2060, 0.86], ['trees', 2900, 1], ['blossomTrees', 3540, 0.9], ['trees', 4120, 0.95], ['trees', 4680, 0.9],
  ['blossomTrees', 5760, 0.94], ['trees', 6380, 0.88], ['trees', 7160, 1], ['blossomTrees', 7440, 0.82], ['trees', 8360, 0.95],
  ['trees', 9840, 0.92], ['blossomTrees', 10320, 0.88], ['trees', 11020, 1],
];
// (No bench in section 1: a bench looks like something to jump onto, and it is only a picture.)
const PARK_PROPS = [
  ['streetLamp', 300], ['streetLamp', 2250], ['streetLamp', 4380], ['bench', 5760], ['streetLamp', 6400], ['streetLamp', 7340],
  ['bench', 8330], ['streetLamp', 8490], ['streetLamp', 9930],
];

// Music: the park borrows the city's daytime piece (CC0, see worlds/city/assets/music/CREDITS.txt).
const MUSIC_FILES = { park: { file: 'worlds/city/assets/music/quaint-town.mp3', vol: 0.55 } };

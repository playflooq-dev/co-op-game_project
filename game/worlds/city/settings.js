'use strict';
// Settings for the City world. Change a number here and refresh the game.
// Positions are in scene units: the screen is always 1080 units tall, and the street runs left to right along x.
// The art is in worlds/city/assets/ (list: assets/manifest.js).
//
// THE CITY IS A TEST LEVEL ("the lab", see LAB_PLAN.md): a row of stations, each trying one idea with the new movement.
// Everything here may change. What runs it: lab.js (the level), street.js (the scenery), things.js (the city's own
// objects: map pieces, the puppy, the fountain, parasols, the bridge) and, shared with other worlds, shared/kit.js
// (boxes, plates, gates, the see-saw, the lift...), shared/movement.js and shared/physics.js.
// For scale: a jump rises about 207, the brother is about 180 tall and the sister about 220; she can reach about 280
// up, he about 220, and about 390 from her shoulders. A toss sends him about 500 up.

const CITY = {
  length: 16700,          // how long the whole street is
  walk: [150, 16480],     // furthest left and right the siblings can walk
  feet: 935,              // where feet stand on the pavement
  facadeBase: 905,        // where the buildings meet the pavement
  kerb: 990,              // edge of the pavement; the main road is in front of it
  horizon: 655,           // where the side street, the canal and the river disappear into the distance
};

// The sky slowly turns from afternoon to sunset as the siblings travel along the street.
const SKY = {
  start: ['#8fb2d8', '#c9d6dc', '#f4e2bd', '#f9e9c6'],   // top to horizon, at the start of the street
  end: ['#6f7fb8', '#c79bb0', '#f2b98a', '#f9d7a0'],     // top to horizon, at the end of the street
  sunX: 0.85,                                             // where the sun glow is, as a share of the screen width
};

// ---------- scenery (nothing here can be bumped into)
const ROAD = [1900, 2320];     // a side street, with a zebra crossing along the pavement
const CANAL = [9300, 10200];   // water: no pavement here
const RIVER = [15000, 15800];  // water, under the Old Bridge; Forest Park is on the far bank
const PARK_GATE = 16180;       // the gate of Forest Park, where the chapter ends

// The buildings, left to right: [art, x of its middle]. The art names are groups in assets/manifest.js.
// fillStreet(from, to, [names]) lines buildings up edge to edge between two points, taking turns through the names.
function fillStreet(from, to, names) {
  const out = []; let x = from, i = 0;
  while (x < to - 150) { const n = names[i++ % names.length], w = CITY_ASSETS[n][0].w - 60; out.push([n, x + w / 2]); x += w; }
  return out;
}
const BUILDINGS = [
  ...fillStreet(-240, ROAD[0], ['townhouseCream', 'homeFront', 'townhouseBrick', 'grocer', 'cornerShop']),
  // the flour mill ('warehouse') lands at about 4030 to 5090, behind station 1
  ...fillStreet(ROAD[1] - 30, CANAL[0], ['cafe', 'grocer', 'townhouseCream', 'bookshop', 'warehouse', 'bakery', 'townhouseBrick', 'apartment', 'cafe', 'townhouseCream', 'grocer', 'bookshop', 'apartment', 'bakery']),
  ...fillStreet(CANAL[1] - 30, RIVER[0] - 40, ['townhouseBrick', 'cornerShop', 'cafe', 'townhouseCream', 'bakery', 'apartment', 'bookshop', 'grocer', 'townhouseBrick', 'cafe', 'townhouseCream']),
];
// Small things along the pavement, only to look at: [art, x].
const PROPS = [
  ['streetLamp', 240], ['streetLamp', 1100], ['streetLamp', 2440], ['streetLamp', 3560], ['streetLamp', 5010],
  ['stallFruit', 5420], ['stallFlowers', 5880], ['stallFish', 6330], ['streetLamp', 6780],
  ['streetLamp', 9180], ['streetLamp', 10390], ['streetLamp', 12440], ['streetLamp', 14150], ['streetLamp', 16000],
];
const PARK = [ // Forest Park on the far side of the river: borrowed forest trees and bushes, [kind, x, scale]
  ['trees', 15880, 0.75], ['bushes', 15980, 0.8], ['trees', 16060, 0.85], ['bigTrees', 16420, 0.62], ['bushes', 16330, 0.9], ['trees', 16560, 0.8],
];
const COBBLES = [[5100, 6700], [6900, 9100]];             // stretches paved with cobbles: the market and Fountain Square
const BUNTING = [[5100, 6700, 470], [6900, 7900, 430]];   // strings of little flags over the street: [from, to, height above the pavement]
const PIGEONS = [[430, 4], [7450, 6], [12560, 5]];        // flocks that fly up when somebody runs through them: [x, how many]

// ---------- the torn map. Soon after station 0 begins a gust of wind tears the treasure map into four pieces.
// Three land on things in station 0; the puppy in the market has the fourth. Each piece has a little picture.
const MAP = {
  gust: 2420,                                  // where the wind blows the map apart
  pictures: ['star', 'fish', 'moon', 'apple'], // the picture on each piece
};

// ---------- THE STATIONS, left to right. Each tries one idea, fits on one screen, and needs both siblings.
// `things` places objects: kinds from shared/kit.js (block, ledge, box, crate, plate, gate, lever, seesaw, pulley,
// boat, ferry, ladder, branch, plank, tunnel, bar, trap, star) and the city's own from things.js (find, puppy,
// fountain, striker, jet, parasol, bridge). x is the place along the street ([from, to] for long things), h the
// height above the pavement. `view` is the stretch the camera holds still on while both are inside it.
// city.html?station=3 starts at station 3.
const STATIONS = [
  { name: '0 Maple Street: jump, carry, and the torn map', x: [150, 3700], start: [380, 540], view: [2400, 3720], things: [
    // learn to jump: small steps and a low wall
    { kind: 'block', x: [640, 740], h: 62 }, { kind: 'block', x: [740, 920], h: 124 }, { kind: 'block', x: [920, 1020], h: 62 },
    { kind: 'block', look: 'wall', x: [1210, 1250], h: 150 },
    // learn to carry: a light box, and a shelf that is too high to jump to without it
    { kind: 'box', x: 1420 }, { kind: 'ledge', look: 'shelf', x: [1560, 1760], h: 255 }, { kind: 'star', x: 1660, h: 325 },
    { kind: 'bar', x: 1850 },
    // the torn map: one piece on a shop sign (she reaches it), one in a drain (only his hand fits),
    // one in a window box (too high for both: she lifts him up). The gate opens when all three are found.
    { kind: 'find', piece: 0, look: 'sign', x: 2700, h: 262 },
    { kind: 'find', piece: 1, look: 'drain', x: 3020, h: 6, who: 'bro' },
    { kind: 'find', piece: 2, look: 'windowbox', x: 3360, h: 352 },
    { kind: 'gate', x: 3650, by: ['map3'] },
  ] },
  { name: '1 The flour mill: plate and gate', x: [3700, 4900], start: [3760, 3840], view: [3720, 4900], things: [
    // the shutter needs the big green plate held down. The heavy crate would do it, but it is up on the hoist:
    // only his small hand fits the release in the low hatch. Down it comes; she carries it onto the plate.
    { kind: 'lever', id: 'hoist', x: 3930, h: 70, who: 'bro', once: true },
    { kind: 'trap', x: [4020, 4190], h: 262, by: 'hoist' }, { kind: 'crate', x: 4105, h: 262 },
    { kind: 'plate', id: 'mill', big: true, x: 4480 }, { kind: 'gate', x: 4700, by: ['mill'] },
  ] },
  { name: '2 The market: a box as a step', x: [4900, 6760], start: [4960, 5040], view: [5080, 6480], things: [
    // the puppy sits on a high awning with the last map piece. Too high even from her shoulders:
    // bring the light box, both step onto it, and then she lifts him.
    { kind: 'box', x: 5230 }, { kind: 'puppy', x: 5880, h: 432 },
    { kind: 'gate', x: 6640, by: ['map4'] }, { kind: 'bar', x: 6560 },
  ] },
  { name: '3 Fountain Square: the see-saw', x: [6760, 9120], start: [6840, 6920], view: [7800, 9000], things: [
    // nothing has to be done at the fountain or the bell game: they are there to play with
    { kind: 'fountain', x: 7230 }, { kind: 'striker', x: 7580 },
    // a wall with a balcony over it. She jumps onto the green end of the see-saw and he flies up to the balcony;
    // up there he lets the rope ladder down for her. They walk over the wall and hop down on the far side.
    { kind: 'seesaw', x: 8090, half: 170 },
    { kind: 'block', look: 'wall', x: [8560, 8640], h: 520 }, { kind: 'ledge', look: 'balcony', x: [8180, 8800], h: 520 },
    { kind: 'ladder', x: 8470, h: 520 }, { kind: 'star', x: 8700, h: 590 },
  ] },
  { name: '4 The canal: light feet only', x: [9120, 10440], start: [9160, 9230], view: [9130, 10420], things: [
    // the small blue boats hold him and sink under her. He crosses, and his lever on the far bank sends the ferry for her.
    { kind: 'boat', x: 9417 }, { kind: 'boat', x: 9639 }, { kind: 'boat', x: 9861 }, { kind: 'boat', x: 10083 },
    { kind: 'ferry', x: [9409, 10091], by: 'ferry', home: 1 }, { kind: 'lever', id: 'ferry', x: 10280, h: 150 },
  ] },
  { name: '5 Old Town: the pulley lift', x: [10440, 12420], start: [10500, 10570], view: [10520, 11720], things: [
    // the street goes on up on the terrace. He stands on the lift; she hauls on the rope and up he goes. On the high
    // ledge are boxes: two of them on the other platform are enough (it has a block and tackle) to lift her.
    { kind: 'pulley', a: 11290, b: 10760, w: 160, high: 520, bias: [0.5, 0], gear: 2, catch: true, rope: { x: 10640, h: 170 } },
    { kind: 'ledge', look: 'shelf', x: [10850, 11200], h: 520 },
    { kind: 'box', x: 10990, h: 520 }, { kind: 'box', x: 11075, h: 520 }, { kind: 'box', x: 11160, h: 520 },
    { kind: 'block', x: [11380, 12050], h: 520 },
    // on the terrace, for fun: two water jets
    { kind: 'jet', x: 11640, h: 520 }, { kind: 'jet', x: 11850, h: 520, late: 1.6 },
    { kind: 'block', x: [12050, 12140], h: 390 }, { kind: 'block', x: [12140, 12230], h: 260 }, { kind: 'block', x: [12230, 12320], h: 130 },
    { kind: 'bar', x: 12380 },
  ] },
  { name: '6 The cafe: boost and toss', x: [12420, 14000], start: [12480, 12560], view: [12560, 13900], things: [
    // a wall in the way, and three closed parasols. The crank is on a high shelf: she tosses him up, he winds it,
    // and the parasols open into steps over the wall.
    { kind: 'ledge', look: 'shelf', x: [12700, 12860], h: 440 }, { kind: 'lever', id: 'crank', x: 12770, h: 560, base: 440, once: true },
    { kind: 'parasol', x: 13050, h: 160, by: 'crank' }, { kind: 'parasol', x: 13260, h: 310, by: 'crank', late: 0.35 }, { kind: 'parasol', x: 13470, h: 460, by: 'crank', late: 0.7 },
    { kind: 'block', look: 'wall', x: [13600, 13690], h: 520 }, { kind: 'star', x: 13645, h: 590 },
  ] },
  { name: '7 The Old Bridge: two levers at once', x: [14000, 16480], start: [14080, 14160], view: [14250, 15850], things: [
    // the bridge comes down only while both levers are held: hers high on the post, his low in the little hut door
    { kind: 'bridge', x: RIVER, by: ['post', 'hut'], time: 2.6 },
    { kind: 'lever', id: 'post', hold: true, x: 14380, h: 250 }, { kind: 'lever', id: 'hut', hold: true, x: 14800, h: 80, who: 'bro' },
  ] },
];

// Music files, one for each kind of place (see worlds/README.md). vol balances them; all are CC0 (assets/music/CREDITS.txt).
const MUSIC_FILES = {
  street: { file: 'worlds/city/assets/music/quaint-town.mp3', vol: 0.62 },     // the city by day
  under: { file: 'worlds/city/assets/music/hot-springs-town.mp3', vol: 0.8 },  // was the metro; not used by the lab
  evening: { file: 'worlds/city/assets/music/magic-town.mp3', vol: 0.45 },     // Old Town and the Old Bridge
};

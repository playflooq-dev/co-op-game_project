'use strict';
// Settings for the City world (Chapter Two, "Across the City"). Change a number here and refresh the game.
// Positions are in scene units: the screen is always 1080 units tall, and the street runs left to right along x.
// The art is in worlds/city/assets/ (list: assets/manifest.js).
//
// SINCE 2026-11-21 THE CITY IS A TEST LEVEL ("the lab", see LAB_PLAN.md). What runs now is worlds/city/lab.js over the
// scenery in worlds/city/street.js, and what it places is the LAB block near the end of this file. The puzzle blocks
// below (PIECES to BRIDGE, STICKERS, hints, chatter) belong to the first city level (level.js and play.js, no longer
// loaded) and stay only until the stations are rebuilt; the scenery uses a few of their positions.
//
// The journey, left to right: Maple Street (map pieces, crossing) - the flour mill yard - the market (the puppy) - the canal
// (boats and ferry) - Fountain Square - down into the metro ... up again in Old Town (picture game, ladder and jets, parasols)
// - the bus - the Old Bridge - Forest Park.
// The part of the street between Fountain Square and Old Town is never walked: the metro skips it.

const CITY = {
  length: 19500,          // how long the whole street is
  walk: [150, 19200],     // furthest left and right the siblings can walk
  feet: 935,              // where feet stand on the pavement
  facadeBase: 905,        // where the buildings meet the pavement
  kerb: 990,              // edge of the pavement; the main road is in front of it
  horizon: 655,           // where side streets, the canal and the river disappear into the distance
  speed: 205,             // walking speed
};

// The sky slowly turns from afternoon to sunset as the siblings travel along the street.
const SKY = {
  start: ['#8fb2d8', '#c9d6dc', '#f4e2bd', '#f9e9c6'],   // top to horizon, at the start of the street
  end: ['#6f7fb8', '#c79bb0', '#f2b98a', '#f9d7a0'],     // top to horizon, at the end of the street
  sunX: 0.85,                                             // where the sun glow is, as a share of the screen width
};

// The buildings along the street, left to right: [art, x of its middle]. The art names are groups in assets/manifest.js.
// Leave gaps where the side street, the canal and the river are.
// fillStreet(from, to, [names]) lines up buildings edge to edge between two points, taking turns through the names.
function fillStreet(from, to, names) {
  const out = []; let x = from, i = 0;
  while (x < to - 150) { const n = names[i++ % names.length], w = CITY_ASSETS[n][0].w - 60; out.push([n, x + w / 2]); x += w; }
  return out;
}
const BUILDINGS = [
  ['townhouseCream', 0], ['homeFront', 460], ['townhouseBrick', 930], ['grocer', 1370], ['cornerShop', 1745],
  // the crossing is at 1900..2320
  ['cafe', 2550], ['warehouse', 3310], // the warehouse is the flour mill: shutter, yard and arch
  ['bakery', 4070], ['townhouseCream', 4510], ['apartment', 4980],
  // the canal is at 5240..6140
  ['townhouseBrick', 6360], ['cornerShop', 6735],
  // Fountain Square is at 6890..7930, then the metro entrance; the street is closed after it
  ...fillStreet(6890, 9800, ['bookshop', 'townhouseCream', 'cafe', 'apartment', 'bakery', 'townhouseBrick', 'grocer']),
  // ... the metro skips from here to Old Town ...
  ...fillStreet(11080, 13300, ['cafe', 'townhouseCream', 'bakery', 'townhouseBrick', 'grocer']), // Old Town square: the picture game
  ...fillStreet(13300, 17620, ['bookshop', 'townhouseBrick', 'bakery', 'apartment', 'cafe', 'townhouseCream', 'grocer', 'cornerShop', 'townhouseBrick', 'apartment']),
  // the river is at 17820..18620, and Forest Park is on the far bank
];

// Small things along the pavement: [art, x]. The art names are groups in assets/manifest.js.
const PROPS = [
  ['streetLamp', 240], ['bench', 700], ['postbox', 1150], ['streetLamp', 1560], ['hydrant', 1790],
  ['streetLamp', 2420], ['bin', 2700],
  ['streetLamp', 3900], ['stallFruit', 4150], ['stallFlowers', 4470], ['stallFish', 4790], ['crates', 5050],
  ['streetLamp', 6290], ['bench', 6500], ['hydrant', 6820],
  ['streetLamp', 6930], ['bench', 7130], ['bench', 7960], ['streetLamp', 8080], ['bin', 8180],
  // Old Town
  ['streetLamp', 11850], ['streetLamp', 12170], ['streetLamp', 13215], ['bench', 14500], ['busShelter', 14760], ['streetLamp', 15100], ['postbox', 15400], ['streetLamp', 15700],
  ['bench', 16000], ['streetLamp', 16300], ['hydrant', 16600], ['streetLamp', 16900], ['busStopSign', 17100], ['streetLamp', 17400],
  ['streetLamp', 18720], ['bench', 18840],
];
const TREES = [ // street trees in planters, borrowed from the forest world: [x, scale]
  [1270, 0.4], [2640, 0.42], [6440, 0.4], [12130, 0.42], [15550, 0.4], [16450, 0.42],
];
const PARK = [ // Forest Park on the far side of the river: borrowed forest trees and bushes, [kind, x, scale]
  ['trees', 18700, 0.75], ['bushes', 18800, 0.8], ['trees', 18900, 0.85], ['bigTrees', 19250, 0.62], ['bushes', 19160, 0.9], ['trees', 19400, 0.8],
];
const COBBLES = [[3960, 5240], [6890, 7930]];           // stretches paved with cobbles: the market and Fountain Square
const BUNTING = [[3900, 5200, 470], [6930, 8080, 430]]; // strings of little flags over the street: [from, to, height above the pavement]
const PIGEONS = [[590, 4], [7160, 6], [12190, 5]];      // flocks of pigeons that fly up when somebody walks through them: [x, how many]

// ---------- the puzzles, in the order the siblings meet them

// The little pictures. Four of them are stamped on the map pieces (a different four every game), and they are
// the code for the bridge controls at the end. The others are on stickers.
const SYMBOLS = ['star', 'bell', 'fish', 'key', 'moon', 'apple', 'boat', 'bird'];

// 0. The torn map. Soon after setting off, a gust of wind tears the treasure map into four pieces.
// Three land on Maple Street; the fourth is carried off by a puppy in the market.
// who: 'sis' (only she can reach it), 'bro' (only he can), or 'boost' (too high for both: she lifts him up).
const PIECES = {
  gust: 820,      // where the wind blows the map apart
  spots: [
    { x: 1370, y: 655, who: 'sis', key: 'up', label: 'Grab the map piece', no: "It's on the shop sign. Way too high for me!" },        // on the grocer's sign
    { x: 760, y: 1000, who: 'bro', key: 'down', label: 'Fish it out of the drain', no: 'My fingers are too big for the drain grate.' }, // in the drain by the kerb
    { x: 1077, y: 604, who: 'boost' },                                                                                              // in a window box, one floor up
  ],
};

// 1. Maple Street crossing: press the button, wait for the green man, cross before the cars come back.
const CROSSING = {
  road: [1900, 2320], button: 1835, name: 'Maple Street',
  wait: 1.8,     // seconds from pressing the button until the cars stop
  walk: 8,       // seconds of green man
  flash: 3,      // seconds the green man flashes before the cars go again
  gap: [2.4, 4.6], // seconds between cars while the cars have green
};

// 2. The flour mill yard: the pavement is closed for roadworks, so the siblings go through the yard.
// The shutter only stays up while the button outside is held. Inside, a chain locks it open, but the chain is high
// up, so the sister has to go in first. Then the brother crawls under the yard gate and opens it from the far side.
const ALLEY = {
  barrier: [3100, 3790],  // where the roadworks block the pavement
  shutter: 2990,          // the roll-up shutter in the mill front
  buttonOut: 2860,        // the shutter button outside on the wall
  chain: 3120,            // the chain inside the yard that locks the shutter open (only the sister can reach it)
  inside: [2900, 3790],   // how far they can walk inside the yard
  gate: 3480,             // the yard gate (only the brother fits through the gap under it)
  gateButton: 3560,       // the gate's release button, on the far side of the gate
  arch: 3740,             // the archway back out to the street, past the roadworks
  out: 3830,              // where they come out on the street
  floor: 905,             // where feet stand inside the yard (a little further back than the pavement)
  depth: 0.9,             // how big the siblings look inside the yard
  raise: 1.15,            // how fast the shutter rolls up while the button is held (share per second)
  drop: 0.55,             // how fast it rolls back down
  sock: [3190, 618],      // the odd sock on the washing line (a sticker: she lifts him up to it)
};

// 3. The market puppy has the last map piece. It runs from whoever is closest and hides under a market stall,
// where only the brother fits. When he crawls in, it dashes out of the other side: if the sister is waiting
// there, it stops. (Coming at it from both sides in the open works too.)
const PUPPY = {
  start: 4560,                // where it waits
  area: [3990, 5060],         // where it runs around (the market)
  stalls: [4150, 4470, 4790], // the stalls it can hide under
  speed: 310,                 // faster than the siblings
  scare: 270,                 // how close someone can get before it runs
  trap: 240,                  // it gives up when a sibling is this close on BOTH sides
  block: 430,                 // how near the far side of a stall the sister must wait to stop it
  peek: 7,                    // seconds it stays hidden with nobody near before it comes out again
};

// 4. The canal. The ferry is on the far side and the button on this side is broken. A row of little boats is
// tied across the water: the sister holds the rope tight at the mooring post (the ring is high up), the brother
// steps across the boats (they would sink under her), and he sends the ferry back for her.
const FERRY = {
  canal: [5240, 6140], buttonNear: 5165, buttonFar: 6215,
  post: 5224,           // the mooring post with the rope ring
  deck: 125,            // half the length of the ferry's deck
  speed: 235,           // how fast the ferry crosses
  boats: 5,             // how many little boats
  boatY: 906,           // where feet stand on the boats (a little further back than the pavement)
  depth: 0.92,          // how big the brother looks on the boats
  tighten: 1.7,         // how fast the rope pulls tight while held (share per second)
  loosen: 0.75,         // how fast it goes slack again
};

// 5. Fountain Square: a place to rest and play. Nothing here has to be done to go on.
const SQUARE = {
  area: [6890, 7930], name: 'Fountain Square',
  fountain: 7420,       // the fountain (a sticker sits on top: she lifts him up to it)
  splash: 7290,         // where they can reach into the water
  striker: 7730,        // the bell game: stop the light as high as you can
  period: 1.15,         // seconds the light takes to run up and down the pole
  ring: 0.9,            // how high the light has to be stopped to ring the bell (share of the pole)
};

// 6. The metro. The street past the square is closed, so they go underground. The goal is Old Town:
// Blue line towards Harbour, change at Central, Green line towards Riverside, get off at Old Town.
const METRO = {
  entrance: 8330,            // the stairs down, just past Fountain Square
  closed: [8560, 11700],     // the street is closed from here to here (Old Town side)
  exit: 12000,               // the stairs up in Old Town
  start: 'Fountain Square', goal: 'Old Town',
  lines: {
    Blue: ['Market Square', 'Fountain Square', 'Central', 'Museum', 'Harbour'],
    Green: ['City Zoo', 'Central', 'Old Town', 'Riverside'],
  },
  colours: { Blue: '#3f6f9f', Green: '#4f8a5a' },
  platform: [170, 1760],     // how far they can walk along the platform
  stairs: 120,               // the stairs up from the platform (left end)
  piano: 1380,               // the "play me" piano on every platform
  board: 1.2,                // seconds after a train arrives before its doors open (time to read its sign)
  wait: 7,                   // seconds a train waits with its doors open
  gap: 2,                    // seconds between trains
  between: 2.6,              // seconds the train takes between two stations
  stop: 4.5,                 // seconds it stops at each station on the way
};

// 7. Old Town. The bus needs a ticket each, and the two tickets are won in three little puzzles on the way to the stop:
// - The painter's picture game. Four paintings are shown, then turn round. The board shows one picture for each
//   sibling, and each stands at the painting that hides their own picture. Three rounds win the first ticket.
// - The ladder on wheels blocks the pavement. It only rolls when both push, and three water jets in the pavement
//   spout in turn: anyone caught is soaked and pushed back a little.
// - The cafe parasols. The other ticket is caught on a shop sign. Only the sister can step from the ladder onto a
//   parasol; the brother winds each parasol open for her. A parasol stays open while she stands on it.
const OLDTOWN = {
  board: 12330,                         // the picture game board (press here to start)
  easels: [12480, 12620, 12760, 12900], // the four paintings
  prize: 12995,                         // the prize box
  rounds: 3,                            // rounds to win
  show: 3.2,                            // seconds the paintings can be looked at before they turn round
  cartStart: 13130,                     // where the ladder on wheels stands at first
  cartSpeed: 120,                       // how fast it rolls when both push
  jets: [13300, 13480, 13660],          // the water jets in the pavement
  period: 4.2,                          // seconds for one round of a jet: quiet, bubbling, spouting
  warn: 0.9,                            // seconds it bubbles before it spouts
  on: 1.3,                              // seconds it spouts
  dock: 13800,                          // where the ladder stops, beside the first parasol
  parasols: [13900, 14080, 14260],      // the cafe parasols
  ticket: [14352, 392],                 // the second ticket, caught on the shop sign
};

// 8. The bus stop in Old Town: the route map shows which bus goes to the Old Bridge. The numbers are shuffled every game.
// The siblings pick a number on the request box, and that bus comes.
const BUS = {
  stop: 14800,               // where the bus door stops
  board: 14620,              // the route map board
  dial: 15020,               // the request box: press to change the bus number
  lines: [3, 7, 12, 21],     // bus numbers
  places: ['Old Bridge', 'City Zoo', 'Harbour', 'Station'], // where the lines go; the first one is where the siblings need to go
  call: 1.3,                 // seconds after the last press before the bus sets off for the stop
  wait: 10,                  // seconds a bus waits at the stop
  arrive: 17100,             // where the right bus drops them off
  rideSpeed: 520,            // how fast the bus drives on the ride
};

// 9. The Old Bridge: a lift bridge. The sister switches the power on (the switch is high up), the brother crawls
// into the little control hut. The controls want a code: the four pictures on the map pieces, in order.
// Then he holds the lever. Halfway down the safety brake catches, and she has to hold the brake handle
// (high on the power post) while he holds the lever.
const BRIDGE = {
  power: 17500,           // the power switch and the brake handle, on the tall post
  hut: 17680,             // the control hut door
  river: [17820, 18620],  // the river; the bridge lifts from the left bank
  lower: 4.2,             // seconds of holding the lever to bring the bridge all the way down
  jam: 0.5,               // how far down the brake catches (share of the way)
  gate: 19040,            // the gate of Forest Park, where the chapter ends
};

// Stickers: little rewards hidden along the way. None is needed to finish the chapter.
// Those with x are found at a spot: who 'sis' (reach up), 'bro' (small hands, crawling) or 'boost' (she lifts him).
// The others are given for doing something: petting the puppy, ringing the bell, playing the piano together...
const STICKERS = [
  { id: 'bench', icon: 'star', name: 'Lucky star', plane: 'street', x: 700, y: 905, who: 'bro', key: 'down', label: 'Look under the bench', no: 'Something is shining under the bench, but I cannot get down there.' },
  { id: 'awning', icon: 'apple', name: 'Red apple', plane: 'street', x: 1745, y: 668, who: 'sis', key: 'up', label: 'Feel along the shop sign', no: 'Something is stuck up on the shop sign. Too high for me!' },
  { id: 'sock', icon: 'sock', name: 'Odd sock', plane: 'yard', x: ALLEY.sock[0], y: ALLEY.sock[1], who: 'boost' },
  { id: 'paw', icon: 'paw', name: 'Puppy friend' },          // pet the puppy once more after catching it
  { id: 'boat', icon: 'boat', name: 'Little boat' },         // the brother looks into the middle boat
  { id: 'drop', icon: 'drop', name: 'Fountain drop', plane: 'street', x: SQUARE.fountain, y: 566, who: 'boost' },
  { id: 'bell', icon: 'bell', name: 'Ding!' },               // ring the bell in the bell game
  { id: 'note', icon: 'note', name: 'Duet' },                // both play the piano at the same time
];

// Hints. Each goal has up to three, from a nudge to the answer. They unlock one by one after this many seconds
// on the same goal, and are read on the treasure map (S or the down arrow with nothing nearby).
const HINT_TIMES = [25, 55, 90];

// Things the siblings say when one of them first reaches a spot: [x, who ('sis' or 'bro'), words].
const CHATTER = [
  [500, 'bro', 'The map says: cross the city to the Old Bridge. That is miles!'],
  [500, 'sis', 'Then we had better get walking.'],
  [2700, 'bro', 'Mmm... something smells like cinnamon buns.'],
  [4060, 'sis', 'The market! Stay close, it gets busy here.'],
  [6350, 'bro', 'My feet are getting tired...'],
  [6360, 'sis', 'Fountain Square is just ahead. We can rest there.'],
  [6960, 'bro', 'A fountain! And look, a bell game!'],
  [6970, 'sis', 'Five minutes. Then we take the metro.'],
  [12200, 'bro', 'Old Town! It looks so old... and so pretty.'],
  [12210, 'sis', 'Now we need a bus to the Old Bridge. And a ticket each!'],
  [17350, 'bro', 'There it is! The Old Bridge!'],
  [17360, 'sis', "It's lifted up... how do we get it down?"],
];

// ---------- THE LAB (branch lab/city-v2, from 2026-11-21). The city is now a test level: see LAB_PLAN.md.
// The puzzle settings above belong to the first city level, which is no longer loaded; they go when the stations are
// rebuilt. For now only the scenery numbers at the top are used (the street, buildings, props, sky), plus this block.
//
// Phase 1 is one test street for trying the new movement. Every line in `things` places one object from the kit
// (shared/kit.js): x is the place along the street ([from, to] for long things), h the height above the pavement.
// For scale: a jump rises about 207, the brother is about 180 tall and the sister about 220.
const LAB = {
  street: [150, 8000],   // how far the siblings can walk
  plain: [150, 8300],    // along here the street is kept empty: of the usual street things only lamps are drawn
  start: [380, 540],     // where the sister and the brother begin
  things: [
    // jump: steps up, a thin blue plank that only holds light feet, steps down again
    { kind: 'block', x: [640, 740], h: 62 }, { kind: 'block', x: [740, 840], h: 124 }, { kind: 'block', x: [840, 1010], h: 186 },
    { kind: 'plank', x: [1010, 1290], h: 186 }, { kind: 'star', x: 1150, h: 256 },
    { kind: 'block', x: [1290, 1460], h: 186 }, { kind: 'block', x: [1460, 1560], h: 124 }, { kind: 'block', x: [1560, 1660], h: 62 },
    // a low wall to hop over
    { kind: 'block', look: 'wall', x: [1765, 1805], h: 150 },
    // carry: two light boxes and a heavy crate; a shelf too high to jump to without a box; a bell only she can reach from the ground
    { kind: 'box', x: 2440 }, { kind: 'box', x: 2560 }, { kind: 'crate', x: 2700 },
    { kind: 'ledge', look: 'shelf', x: [2800, 3000], h: 255 }, { kind: 'star', x: 2900, h: 325 },
    { kind: 'bell', x: 3110, h: 262 },
    // together: a balcony for the lift and toss, then a see-saw with a higher balcony over his end
    { kind: 'ledge', look: 'balcony', x: [3250, 3500], h: 440 }, { kind: 'star', x: 3375, h: 510 },
    { kind: 'seesaw', x: 3780, half: 170 },
    { kind: 'ledge', look: 'balcony', x: [3870, 4090], h: 520 }, { kind: 'star', x: 3990, h: 590 },
    // small: a low tunnel. He ducks through (the star is inside); she hops over the top.
    { kind: 'tunnel', x: [4180, 4330], h: 180, gap: 124 }, { kind: 'star', x: 4255, h: 60 },

    // ---- Phase 2: the object kit, one of each, to try before the stations are built.
    // plates and gates: the big green plate needs her or the heavy crate, the small blue one anybody or a box.
    // A gate is open only while its plate is pressed, so leave something on the plate to get both of you through.
    { kind: 'crate', x: 4480 }, { kind: 'plate', id: 'green', big: true, x: 4660 }, { kind: 'gate', x: 4840, by: ['green'] },
    { kind: 'box', x: 4915 }, { kind: 'plate', id: 'blue', x: 5010 }, { kind: 'gate', x: 5130, by: ['blue'] },
    // light-only on the water (the canal runs from 5240 to 6140): four small boats hold him and sink under her.
    // On the far bank a lever sends the ferry over and brings it back.
    { kind: 'boat', x: 5357 }, { kind: 'boat', x: 5579 }, { kind: 'boat', x: 5801 }, { kind: 'boat', x: 6023 },
    { kind: 'ferry', x: [5349, 6031], by: 'ferry', home: 1 }, { kind: 'lever', id: 'ferry', x: 6215, h: 150 }, { kind: 'star', x: 6290, h: 70 },
    // the pulley lift: she hauls on the rope and he rides up. Up there are three boxes: he loads them on the
    // other platform and steps on himself, and that is heavy enough to lift her.
    { kind: 'pulley', a: 6470, b: 6990, high: 380, bias: [0.5, 0], rope: { x: 7110, h: 170 } },
    { kind: 'ledge', look: 'balcony', x: [6560, 6900], h: 380 }, { kind: 'star', x: 6600, h: 450 },
    { kind: 'box', x: 6690, h: 380 }, { kind: 'box', x: 6775, h: 380 }, { kind: 'box', x: 6850, h: 380 },
    // the rope ladder: toss him up, he lets it down for her. Past it a branch that only holds him.
    { kind: 'ledge', look: 'balcony', x: [7230, 7480], h: 440 }, { kind: 'ladder', x: 7262, h: 440 },
    { kind: 'branch', x: [7480, 7640], h: 440, from: 'left' }, { kind: 'star', x: 7600, h: 510 },
    // the two-switch door: both levers have to be held at the same moment (one high, for her; one low). Then it stays open.
    { kind: 'lever', id: 'left', hold: true, x: 7700, h: 250 }, { kind: 'lever', id: 'right', hold: true, x: 7800, h: 120 },
    { kind: 'gate', x: 7880, by: ['left', 'right'], latch: true }, { kind: 'star', x: 7945, h: 70 },
    { kind: 'block', look: 'boards', x: [8000, 8060], h: 400 },
  ],
};

// Music files, one for each kind of place (see worlds/README.md). vol balances them; all are CC0 (assets/music/CREDITS.txt).
const MUSIC_FILES = {
  street: { file: 'worlds/city/assets/music/quaint-town.mp3', vol: 0.62 },     // the city by day
  under: { file: 'worlds/city/assets/music/hot-springs-town.mp3', vol: 0.8 },  // the metro
  evening: { file: 'worlds/city/assets/music/magic-town.mp3', vol: 0.45 },     // Old Town and the Old Bridge
};

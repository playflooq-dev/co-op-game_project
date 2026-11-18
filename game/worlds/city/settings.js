'use strict';
// Settings for the City world (Chapter Two, "Across the City"). Change a number here and refresh the game.
// Positions are in scene units: the screen is always 1080 units tall, and the street runs left to right along x.
// The art is in worlds/city/assets/ (list: assets/manifest.js); the code that runs the level is worlds/city/level.js.
//
// The journey, left to right: Maple Street (map pieces, crossing) - Baker's Alley - the market (the puppy) - the canal ferry
// - Grand Avenue - down into the metro at Grand Avenue station ... up again in Old Town - the bus - the Old Bridge - Forest Park.
// The part of the street between Grand Avenue and Old Town is never walked: the metro skips it.

const CITY = {
  length: 19500,          // how long the whole street is
  walk: [150, 19200],     // furthest left and right the siblings can walk
  feet: 935,              // where feet stand on the pavement
  facadeBase: 905,        // where the buildings meet the pavement
  kerb: 990,              // edge of the pavement; the main road is in front of it
  horizon: 655,           // where side streets, the canal and the river disappear into the distance
  speed: 170,             // walking speed
};

// The sky slowly turns from afternoon to sunset as the siblings travel along the street.
const SKY = {
  start: ['#8fb2d8', '#c9d6dc', '#f4e2bd', '#f9e9c6'],   // top to horizon, at the start of the street
  end: ['#6f7fb8', '#c79bb0', '#f2b98a', '#f9d7a0'],     // top to horizon, at the end of the street
  sunX: 0.85,                                             // where the sun glow is, as a share of the screen width
};

// The buildings along the street, left to right: [art, x of its middle]. The art names are groups in assets/manifest.js.
// Leave gaps where side streets, the alley, the canal and the river are.
// fillStreet(from, to, [names]) lines up buildings edge to edge between two points, taking turns through the names.
function fillStreet(from, to, names) {
  const out = []; let x = from, i = 0;
  while (x < to - 150) { const n = names[i++ % names.length], w = CITY_ASSETS[n][0].w - 60; out.push([n, x + w / 2]); x += w; }
  return out;
}
const BUILDINGS = [
  ['townhouseCream', 0], ['homeFront', 460], ['townhouseBrick', 930], ['grocer', 1370], ['cornerShop', 1745],
  // the first crossing is at 1900..2320
  ['cafe', 2550], ['warehouse', 3310], // the warehouse is the alley building: shutter, courtyard and arch
  ['bakery', 4070], ['townhouseCream', 4510], ['apartment', 4980],
  // the canal is at 5240..6140
  ['townhouseBrick', 6360], ['cornerShop', 6735],
  // the avenue is at 6890..7930
  ['apartment', 8190], ['cafe', 8680], ['townhouseCream', 9120], ['grocer', 9550],
  // ... the metro skips from here to Old Town ...
  ...fillStreet(13300, 17620, ['bookshop', 'townhouseBrick', 'bakery', 'apartment', 'cafe', 'townhouseCream', 'grocer', 'cornerShop', 'townhouseBrick', 'apartment']),
  // the river is at 17820..18620, and Forest Park is on the far bank
];

// Small things along the pavement: [art, x]. The art names are groups in assets/manifest.js.
const PROPS = [
  ['streetLamp', 240], ['bench', 700], ['postbox', 1150], ['streetLamp', 1560], ['hydrant', 1790],
  ['streetLamp', 2420], ['bin', 2700],
  ['streetLamp', 3900], ['stallFruit', 4150], ['stallFlowers', 4470], ['stallFish', 4790], ['crates', 5050],
  ['streetLamp', 6290], ['bench', 6500], ['hydrant', 6820],
  ['streetLamp', 8010], ['bin', 8180],
  // Old Town
  ['streetLamp', 14050], ['bench', 14500], ['busShelter', 14760], ['streetLamp', 15100], ['postbox', 15400], ['streetLamp', 15700],
  ['bench', 16000], ['streetLamp', 16300], ['hydrant', 16600], ['streetLamp', 16900], ['busStopSign', 17100], ['streetLamp', 17400],
  ['streetLamp', 18720], ['bench', 18840],
];
const TREES = [ // street trees in planters, borrowed from the forest world: [x, scale]
  [1270, 0.4], [2640, 0.42], [6440, 0.4], [14300, 0.42], [15550, 0.4], [16450, 0.42],
];
const PARK = [ // Forest Park on the far side of the river: borrowed forest trees and bushes, [kind, x, scale]
  ['trees', 18700, 0.75], ['bushes', 18800, 0.8], ['trees', 18900, 0.85], ['bigTrees', 19250, 0.62], ['bushes', 19160, 0.9], ['trees', 19400, 0.8],
];

// ---------- the puzzles, in the order the siblings meet them

// 0. The torn map. Soon after setting off, a gust of wind tears the treasure map into four pieces.
// Three land on Maple Street; the fourth is carried off by a puppy in the market.
// who: 'sis' (only she can reach it), 'bro' (only he can), or 'both'.
const PIECES = {
  gust: 820,      // where the wind blows the map apart
  spots: [
    { x: 1370, y: 655, who: 'sis', key: 'up', label: 'Grab the map piece', no: "It's on the shop awning. Way too high for me!" },     // on the grocer's awning
    { x: 760, y: 1000, who: 'bro', key: 'down', label: 'Fish it out of the drain', no: 'My fingers are too big for the drain grate.' }, // in the drain by the kerb
    { x: 1270, y: 845, who: 'both', key: 'up', label: 'Search the planter' },                                                      // in the tree planter
  ],
};
// The market puppy has the last piece. It runs from whoever comes near, and only stops when one sibling
// is close on each side of it.
const PUPPY = {
  start: 4560,           // where it waits
  area: [3990, 5060],    // where it runs around (the market)
  speed: 250,            // faster than the siblings (170)
  scare: 280,            // how close someone can get before it runs
  calm: 460,             // how far it runs before it stops again
  trap: 240,             // it gives up when a sibling is this close on BOTH sides
};

// 1. Maple Street crossing: press the button, wait for the green man, cross before the cars come back.
const CROSSING = {
  road: [1900, 2320], button: 1835, name: 'Maple Street',
  wait: 2.5,     // seconds from pressing the button until the cars stop
  walk: 8,       // seconds of green man
  flash: 3,      // seconds the green man flashes before the cars go again
  gap: [2.4, 4.6], // seconds between cars while the cars have green
};

// 2. Baker's Alley: the pavement is closed for roadworks, so the siblings go through the warehouse courtyard.
const ALLEY = {
  barrier: [3100, 3790],  // where the roadworks block the pavement
  shutter: 2990,          // the roll-up shutter in the warehouse front
  buttonOut: 2860,        // the shutter button outside on the wall
  buttonIn: 3120,         // the shutter button inside the courtyard
  inside: [2900, 3790],   // how far they can walk inside the courtyard
  gate: 3480,             // the courtyard gate (only the brother fits through the gap under it)
  gateButton: 3560,       // the gate's release button, on the far side of the gate
  arch: 3740,             // the archway back out to the street, past the roadworks
  out: 3830,              // where they come out on the street
  floor: 905,             // where feet stand inside the courtyard (a little further back than the pavement)
  depth: 0.9,             // how big the siblings look inside the courtyard
  raise: 0.75,            // how fast the shutter rolls up while the button is held (share per second)
  drop: 0.45,             // how fast it rolls back down
};

// 3. The canal ferry: a button on each side sends the ferry to the other side. Nobody can press a button from the ferry.
const FERRY = {
  canal: [5240, 6140], buttonNear: 5165, buttonFar: 6215,
  deck: 125,            // half the length of the ferry's deck
  speed: 105,           // how fast the ferry crosses
};

// 4. The avenue: two roads with a traffic island, and lights that change by themselves (the button is broken).
const AVENUE = {
  roads: [[6890, 7310], [7510, 7930]], island: [7310, 7510], name: 'Grand Avenue',
  cycle: 17,                 // seconds for a full round of the lights
  red: [[10, 16], [2, 8]],   // when in each round each road's cars have red (from, to seconds)
  amber: 1.6,                // seconds of amber before red
  gap: [1.5, 3.2],           // seconds between cars while they have green
};

// 5. The metro. The street past Grand Avenue is closed, so they go underground. The goal is Old Town:
// Blue line towards Harbour, change at Central, Green line towards Riverside, get off at Old Town.
const METRO = {
  entrance: 8330,            // the stairs down, just past Grand Avenue
  closed: [8560, 13900],     // the street is closed from here (Grand Avenue side) to here (Old Town side)
  exit: 14200,               // the stairs up in Old Town
  start: 'Grand Avenue', goal: 'Old Town',
  lines: {
    Blue: ['Market Square', 'Grand Avenue', 'Central', 'Museum', 'Harbour'],
    Green: ['City Zoo', 'Central', 'Old Town', 'Riverside'],
  },
  colours: { Blue: '#3f6f9f', Green: '#4f8a5a' },
  platform: [170, 1760],     // how far they can walk along the platform
  stairs: 120,               // the stairs up from the platform (left end)
  board: 2,                  // seconds after a train arrives before its doors open (time to read its sign)
  wait: 8,                   // seconds a train waits with its doors open
  gap: 4,                    // seconds between trains
  between: 4,                // seconds the train takes between two stations
  stop: 6,                   // seconds it stops at each station on the way
};

// 6. The bus stop in Old Town: the route map shows which bus goes to the Old Bridge. The numbers are shuffled every game.
const BUS = {
  stop: 14800,               // where the bus door stops
  board: 14620,              // the route map board
  lines: [3, 7, 12, 21],     // bus numbers
  places: ['Old Bridge', 'City Zoo', 'Harbour', 'Station'], // where the lines go; the first one is where the siblings need to go
  wait: 8,                   // seconds a bus waits at the stop
  gap: 5,                    // seconds between buses
  arrive: 17100,             // where the right bus drops them off
  rideSpeed: 420,            // how fast the bus drives on the ride
};

// 7. The Old Bridge: a lift bridge. The sister switches the power on (the switch is high up),
// the brother crawls into the little control hut and lowers the bridge.
const BRIDGE = {
  power: 17500,           // the power switch on its tall post
  hut: 17680,             // the control hut door
  river: [17820, 18620],  // the river; the bridge lifts from the left bank
  lower: 4.5,             // seconds the bridge takes to come down
  gate: 19040,            // the gate of Forest Park, where the chapter ends
};

// Things the siblings say when one of them first reaches a spot: [x, who ('sis' or 'bro'), words].
const CHATTER = [
  [500, 'bro', 'The map says: cross the city to the Old Bridge. That is miles!'],
  [500, 'sis', 'Then we had better get walking.'],
  [2700, 'bro', 'Mmm... something smells like cinnamon buns.'],
  [4060, 'sis', 'The market! Stay close, it gets busy here.'],
  [6350, 'bro', 'My feet are getting tired...'],
  [6360, 'sis', 'Grand Avenue is next. Then we can take the metro.'],
  [8050, 'sis', 'Phew! Grand Avenue is the busiest road in the whole city.'],
  [14400, 'bro', 'Old Town! It looks so old... and so pretty.'],
  [14410, 'sis', 'Now we need a bus to the Old Bridge.'],
  [17350, 'bro', 'There it is! The Old Bridge!'],
  [17360, 'sis', "It's lifted up... how do we get it down?"],
];

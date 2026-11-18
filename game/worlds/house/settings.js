'use strict';
// Settings for the House world (Chapter One): where everything is, in scene units. The house is 1920 wide.
// Change a number here and refresh to move things. The art is in worlds/house/assets/.
const WORLD = 1920;
const FLOOR = [988, 528];             // where feet stand: 0 = ground floor, 1 = upstairs
const CEIL = [570, 200];
const WALK = [150, 1812];
const STAIRS = { x0: 1120, y0: 988, x1: 1560, y1: 528 };
const CUP_X = 1300, CUP_DOOR = 1465, CUP_IN = [1352, 1445];
const BULB = { x: 1400, top: 732, y: 768, cord: 838 }; // the light inside the cupboard, pulled on by a cord
const DOOR_X = 1745, BOOKCASE_X = 1720, BOX_Y = 230;
const CODE_X = [1480, 1511, 1542], CODE_Y = 832; // chalked high on the cupboard's back wall, under the shelf
const SYMBOLS = ['leaf', 'star', 'moon', 'sun', 'heart', 'fish'];
const ROOMS = [ // wallpaper per room
  { f: 0, x0: 110, x1: 760, wp: 'wallKitchen' }, { f: 0, x0: 760, x1: 1850, wp: 'wallLiving' },
  { f: 1, x0: 110, x1: 880, wp: 'wallBedroom' }, { f: 1, x0: 880, x1: 1850, wp: 'wallStudy' },
];
const WINDOWS = [ // [art, x, sill y, scale]
  ['windowKitchen', 668, 860, 0.78], ['windowBedroom', 470, 400, 0.7], ['windowStudy', 1360, 380, 0.7],
];
const FURNITURE = [ // [art, x, y, scale, flip] drawn in this order
  ['familyPortrait', 880, 760, 0.85], ['wallClock', 1040, 722, 0.9], ['wallShelf', 440, 700, 0.9],
  ['rugHall', 960, 996, 1], ['fridge', 200, 990, 1], ['counter', 440, 990, 1],
  ['stairs', STAIRS.x0, STAIRS.y0, 1], ['chair', 842, 990, 1, 1], ['table', 960, 990, 1], ['chair', 1078, 990, 1, -1], ['map', 962, 842, 1],
  ['coatRack', 1592, 990, 1], ['doorMat', DOOR_X, 996, 1],
  ['forestPainting', 255, 336, 0.7], ['kidShelf', 690, 334, 0.85], ['worldMap', 1030, 318, 0.8],
  ['rugBedroom', 470, 534, 1], ['bedSister', 255, 530, 1], ['toyChest', 470, 530, 1], ['bedBrother', 690, 530, 1],
  ['railing', 1360, 530, 1], ['floorLamp', 1180, 530, 0.9], ['desk', 1030, 530, 1], ['armchair', 1262, 532, 0.85], ['bookcase', BOOKCASE_X, 530, 1],
];


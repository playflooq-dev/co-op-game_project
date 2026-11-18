// Every image the City world (Chapter Two) loads, in groups. Where a group has several files, the game picks between them.
//   file    the image, inside this folder
//   w, h    how big it is drawn, in scene units (the screen is always 1080 units tall)
//   ax, ay  the point of the image that is placed on the ground, measured from its top-left corner in scene units
// A replacement image can be any resolution; keep the same proportions (w : h) or update w, h, ax, ay to match.
const CITY_ASSETS = {
  skylineFar: [
    { file: 'background/skyline-far-1.png', w: 1800, h: 560, ax: 0, ay: 560 },
    { file: 'background/skyline-far-2.png', w: 1800, h: 560, ax: 0, ay: 560 },
  ],
  skylineNear: [
    { file: 'background/skyline-near-1.png', w: 1600, h: 600, ax: 0, ay: 600 },
    { file: 'background/skyline-near-2.png', w: 1600, h: 600, ax: 0, ay: 600 },
  ],
  pavement: [
    { file: 'ground/pavement.png', w: 240, h: 240, ax: 0, ay: 0 },
  ],
  road: [
    { file: 'ground/road.png', w: 200, h: 200, ax: 0, ay: 0 },
  ],
  cobbles: [
    { file: 'ground/cobbles.png', w: 160, h: 160, ax: 0, ay: 0 },
  ],
  stone: [
    { file: 'ground/stone-wall.png', w: 200, h: 200, ax: 0, ay: 0 },
  ],
  homeFront: [
    { file: 'buildings/home-front.png', w: 560, h: 720, ax: 280, ay: 700 },
  ],
  townhouseCream: [
    { file: 'buildings/townhouse-cream.png', w: 480, h: 840, ax: 240, ay: 820 },
  ],
  townhouseBrick: [
    { file: 'buildings/townhouse-brick.png', w: 500, h: 860, ax: 250, ay: 840 },
  ],
  grocer: [
    { file: 'buildings/grocer.png', w: 500, h: 860, ax: 250, ay: 840 },
  ],
  cornerShop: [
    { file: 'buildings/corner-shop.png', w: 370, h: 840, ax: 185, ay: 820 },
  ],
  cafe: [
    { file: 'buildings/cafe.png', w: 520, h: 860, ax: 260, ay: 840 },
  ],
  bakery: [
    { file: 'buildings/bakery.png', w: 520, h: 860, ax: 260, ay: 840 },
  ],
  bookshop: [
    { file: 'buildings/bookshop.png', w: 480, h: 860, ax: 240, ay: 840 },
  ],
  apartment: [
    { file: 'buildings/apartment.png', w: 580, h: 1130, ax: 290, ay: 1110 },
  ],
  warehouse: [
    { file: 'buildings/warehouse.png', w: 1120, h: 760, ax: 560, ay: 740 },
  ],
  courtyard: [
    { file: 'buildings/courtyard.png', w: 1120, h: 760, ax: 560, ay: 740 },
  ],
  courtGate: [
    { file: 'buildings/courtyard-gate.png', w: 150, h: 286, ax: 75, ay: 270 },
  ],
  streetLamp: [
    { file: 'street/street-lamp.png', w: 110, h: 466, ax: 55, ay: 450 },
  ],
  bench: [
    { file: 'street/bench.png', w: 252, h: 132, ax: 126, ay: 116 },
  ],
  bin: [
    { file: 'street/bin.png', w: 112, h: 152, ax: 56, ay: 136 },
  ],
  postbox: [
    { file: 'street/postbox.png', w: 122, h: 202, ax: 61, ay: 186 },
  ],
  hydrant: [
    { file: 'street/hydrant.png', w: 102, h: 122, ax: 51, ay: 106 },
  ],
  planter: [
    { file: 'street/planter.png', w: 172, h: 112, ax: 86, ay: 96 },
  ],
  busShelter: [
    { file: 'street/bus-shelter.png', w: 472, h: 342, ax: 236, ay: 326 },
  ],
  busStopSign: [
    { file: 'street/bus-stop-sign.png', w: 132, h: 372, ax: 66, ay: 356 },
  ],
  routeBoard: [
    { file: 'street/route-board.png', w: 202, h: 372, ax: 101, ay: 356 },
  ],
  trafficLight: [
    { file: 'street/traffic-light.png', w: 132, h: 462, ax: 66, ay: 446 },
  ],
  crossingPole: [
    { file: 'street/crossing-button.png', w: 122, h: 302, ax: 61, ay: 286 },
  ],
  barrier: [
    { file: 'street/roadworks-barrier.png', w: 272, h: 172, ax: 136, ay: 156 },
  ],
  cone: [
    { file: 'street/cone.png', w: 112, h: 122, ax: 56, ay: 106 },
  ],
  closedSign: [
    { file: 'street/pavement-closed-sign.png', w: 252, h: 302, ax: 126, ay: 286 },
  ],
  digger: [
    { file: 'street/digger.png', w: 352, h: 272, ax: 176, ay: 256 },
  ],
  stallFruit: [
    { file: 'market/stall-fruit.png', w: 342, h: 342, ax: 171, ay: 326 },
  ],
  stallFlowers: [
    { file: 'market/stall-flowers.png', w: 342, h: 342, ax: 171, ay: 326 },
  ],
  stallFish: [
    { file: 'market/stall-fish.png', w: 342, h: 342, ax: 171, ay: 326 },
  ],
  crates: [
    { file: 'market/crates.png', w: 212, h: 162, ax: 106, ay: 146 },
  ],
  car: [
    { file: 'vehicles/car-red.png', w: 352, h: 272, ax: 176, ay: 256 },
    { file: 'vehicles/car-blue.png', w: 352, h: 272, ax: 176, ay: 256 },
    { file: 'vehicles/car-yellow.png', w: 352, h: 272, ax: 176, ay: 256 },
    { file: 'vehicles/car-green.png', w: 352, h: 272, ax: 176, ay: 256 },
  ],
  bus: [
    { file: 'vehicles/bus.png', w: 860, h: 360, ax: 430, ay: 340 },
  ],
  ferry: [
    { file: 'water/ferry.png', w: 300, h: 110, ax: 150, ay: 30 },
  ],
  callButton: [
    { file: 'water/ferry-button.png', w: 112, h: 192, ax: 56, ay: 176 },
  ],
  bridgeDeck: [
    { file: 'water/bridge-deck.png', w: 820, h: 140, ax: 10, ay: 90 },
  ],
  bridgeHut: [
    { file: 'water/bridge-hut.png', w: 272, h: 342, ax: 136, ay: 326 },
  ],
  powerPost: [
    { file: 'water/power-post.png', w: 130, h: 476, ax: 65, ay: 460 },
  ],
  parkGate: [
    { file: 'park/park-gate.png', w: 612, h: 562, ax: 306, ay: 546 },
  ],
  metroEntrance: [
    { file: 'metro/metro-entrance.png', w: 432, h: 382, ax: 216, ay: 366 },
  ],
  metroSign: [
    { file: 'metro/street-closed-sign.png', w: 272, h: 302, ax: 136, ay: 286 },
  ],
  trainBlue: [
    { file: 'metro/train-blue.png', w: 900, h: 360, ax: 450, ay: 340 },
  ],
  trainGreen: [
    { file: 'metro/train-green.png', w: 900, h: 360, ax: 450, ay: 340 },
  ],
  metroTile: [
    { file: 'metro/wall-tiles.png', w: 120, h: 120, ax: 0, ay: 0 },
  ],
  pillar: [
    { file: 'metro/pillar.png', w: 142, h: 602, ax: 71, ay: 586 },
  ],
};

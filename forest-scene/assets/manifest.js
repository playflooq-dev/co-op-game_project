// Every image the game loads, in groups. The game picks at random within a group, so a group can hold as many variants as you like.
//   file    the image, inside the assets folder
//   w, h    how big it is drawn, in scene units (the screen is always 1080 units tall)
//   ax, ay  the point of the image that is placed on the ground, measured from its top-left corner in scene units
// A replacement image can be any resolution; keep the same proportions (w : h) or update w, h, ax, ay to match.
const ASSETS = {
  clouds: [
    { file: 'sky/cloud-1.png', w: 540, h: 230, ax: 270, ay: 140 },
    { file: 'sky/cloud-2.png', w: 540, h: 230, ax: 270, ay: 140 },
    { file: 'sky/cloud-3.png', w: 540, h: 230, ax: 270, ay: 140 },
  ],
  mountainsBack: [
    { file: 'mountains/back-1.png', w: 1040, h: 580, ax: 520, ay: 560 },
    { file: 'mountains/back-2.png', w: 1040, h: 580, ax: 520, ay: 560 },
    { file: 'mountains/back-3.png', w: 1040, h: 580, ax: 520, ay: 560 },
    { file: 'mountains/back-4.png', w: 1040, h: 580, ax: 520, ay: 560 },
  ],
  mountainsFront: [
    { file: 'mountains/front-1.png', w: 1040, h: 580, ax: 520, ay: 560 },
    { file: 'mountains/front-2.png', w: 1040, h: 580, ax: 520, ay: 560 },
    { file: 'mountains/front-3.png', w: 1040, h: 580, ax: 520, ay: 560 },
    { file: 'mountains/front-4.png', w: 1040, h: 580, ax: 520, ay: 560 },
  ],
  farPinesBack: [
    { file: 'trees/far-pine-back-1.png', w: 240, h: 460, ax: 120, ay: 440 },
    { file: 'trees/far-pine-back-2.png', w: 240, h: 460, ax: 120, ay: 440 },
    { file: 'trees/far-pine-back-3.png', w: 240, h: 460, ax: 120, ay: 440 },
    { file: 'trees/far-pine-back-4.png', w: 240, h: 460, ax: 120, ay: 440 },
    { file: 'trees/far-pine-back-5.png', w: 240, h: 460, ax: 120, ay: 440 },
  ],
  farPinesFront: [
    { file: 'trees/far-pine-front-1.png', w: 240, h: 460, ax: 120, ay: 440 },
    { file: 'trees/far-pine-front-2.png', w: 240, h: 460, ax: 120, ay: 440 },
    { file: 'trees/far-pine-front-3.png', w: 240, h: 460, ax: 120, ay: 440 },
    { file: 'trees/far-pine-front-4.png', w: 240, h: 460, ax: 120, ay: 440 },
    { file: 'trees/far-pine-front-5.png', w: 240, h: 460, ax: 120, ay: 440 },
  ],
  pines: [
    { file: 'trees/pine-1.png', w: 240, h: 460, ax: 120, ay: 440 },
    { file: 'trees/pine-2.png', w: 240, h: 460, ax: 120, ay: 440 },
    { file: 'trees/pine-3.png', w: 240, h: 460, ax: 120, ay: 440 },
  ],
  trees: [
    { file: 'trees/tree-1.png', w: 470, h: 560, ax: 235, ay: 520 },
    { file: 'trees/tree-2.png', w: 470, h: 560, ax: 235, ay: 520 },
    { file: 'trees/tree-3.png', w: 470, h: 560, ax: 235, ay: 520 },
    { file: 'trees/tree-4.png', w: 470, h: 560, ax: 235, ay: 520 },
    { file: 'trees/tree-5.png', w: 470, h: 560, ax: 235, ay: 520 },
    { file: 'trees/tree-6.png', w: 470, h: 560, ax: 235, ay: 520 },
  ],
  blossomTrees: [
    { file: 'trees/blossom-tree-1.png', w: 470, h: 560, ax: 235, ay: 520 },
    { file: 'trees/blossom-tree-2.png', w: 470, h: 560, ax: 235, ay: 520 },
  ],
  autumnTrees: [
    { file: 'trees/autumn-tree-1.png', w: 470, h: 560, ax: 235, ay: 520 },
    { file: 'trees/autumn-tree-2.png', w: 470, h: 560, ax: 235, ay: 520 },
  ],
  bigTrees: [
    { file: 'trees/big-tree-1.png', w: 1300, h: 1030, ax: 650, ay: 915 },
    { file: 'trees/big-tree-2.png', w: 1300, h: 1030, ax: 650, ay: 915 },
    { file: 'trees/big-tree-3.png', w: 1300, h: 1030, ax: 650, ay: 915 },
  ],
  bushes: [
    { file: 'plants/bush-1.png', w: 270, h: 200, ax: 135, ay: 178 },
    { file: 'plants/bush-2.png', w: 270, h: 200, ax: 135, ay: 178 },
    { file: 'plants/bush-3.png', w: 270, h: 200, ax: 135, ay: 178 },
    { file: 'plants/bush-4.png', w: 270, h: 200, ax: 135, ay: 178 },
    { file: 'plants/bush-5.png', w: 270, h: 200, ax: 135, ay: 178 },
    { file: 'plants/bush-6.png', w: 270, h: 200, ax: 135, ay: 178 },
  ],
  grass: [
    { file: 'plants/grass-1.png', w: 100, h: 58, ax: 50, ay: 48 },
    { file: 'plants/grass-2.png', w: 100, h: 70, ax: 50, ay: 60 },
    { file: 'plants/grass-3.png', w: 100, h: 50, ax: 50, ay: 40 },
    { file: 'plants/grass-4.png', w: 100, h: 82, ax: 50, ay: 72 },
    { file: 'plants/grass-5.png', w: 100, h: 64, ax: 50, ay: 54 },
  ],
  flowers: [
    { file: 'plants/flowers-1.png', w: 170, h: 170, ax: 85, ay: 156 },
    { file: 'plants/flowers-2.png', w: 170, h: 170, ax: 85, ay: 156 },
    { file: 'plants/flowers-3.png', w: 170, h: 170, ax: 85, ay: 156 },
    { file: 'plants/flowers-4.png', w: 170, h: 170, ax: 85, ay: 156 },
    { file: 'plants/flowers-5.png', w: 170, h: 170, ax: 85, ay: 156 },
    { file: 'plants/flowers-6.png', w: 170, h: 170, ax: 85, ay: 156 },
    { file: 'plants/flowers-7.png', w: 170, h: 170, ax: 85, ay: 156 },
  ],
  mushrooms: [
    { file: 'plants/mushrooms-1.png', w: 90, h: 80, ax: 45, ay: 70 },
    { file: 'plants/mushrooms-2.png', w: 90, h: 80, ax: 45, ay: 70 },
  ],
  ferns: [
    { file: 'plants/fern-1.png', w: 660, h: 430, ax: 330, ay: 400 },
    { file: 'plants/fern-2.png', w: 660, h: 430, ax: 330, ay: 400 },
  ],
  rocks: [
    { file: 'rocks/rock-1.png', w: 280, h: 200, ax: 140, ay: 172 },
    { file: 'rocks/rock-2.png', w: 280, h: 200, ax: 140, ay: 172 },
    { file: 'rocks/rock-3.png', w: 280, h: 200, ax: 140, ay: 172 },
    { file: 'rocks/rock-4.png', w: 280, h: 200, ax: 140, ay: 172 },
  ],
  logs: [
    { file: 'props/log-1.png', w: 340, h: 160, ax: 170, ay: 126 },
    { file: 'props/log-2.png', w: 340, h: 160, ax: 170, ay: 126 },
  ],
  signpost: [
    { file: 'props/signpost.png', w: 280, h: 260, ax: 130, ay: 238 },
  ],
  fence: [
    { file: 'props/fence.png', w: 470, h: 140, ax: 24, ay: 116 },
  ],
  waterfallCliff: [
    { file: 'waterfall/cliff-and-bridge.png', w: 1220, h: 520, ax: 420, ay: 440 },
  ],
  waterfallBank: [
    { file: 'waterfall/front-bank.png', w: 1220, h: 200, ax: 420, ay: 150 },
  ],
  fgFerns: [
    { file: 'foreground/fern-1.png', w: 660, h: 430, ax: 330, ay: 400 },
    { file: 'foreground/fern-2.png', w: 660, h: 430, ax: 330, ay: 400 },
  ],
  fgLeaves: [
    { file: 'foreground/leaves-1.png', w: 520, h: 340, ax: 260, ay: 318 },
    { file: 'foreground/leaves-2.png', w: 520, h: 340, ax: 260, ay: 318 },
  ],
  fgPoppies: [
    { file: 'foreground/poppies.png', w: 260, h: 300, ax: 130, ay: 280 },
  ],
  fgRocks: [
    { file: 'foreground/rock.png', w: 280, h: 200, ax: 140, ay: 172 },
  ],
  fog: [
    { file: 'effects/fog.png', w: 900, h: 220, ax: 450, ay: 110 },
  ],
  lightDapple: [
    { file: 'effects/light-dapple.png', w: 560, h: 170, ax: 280, ay: 85 },
  ],
  shade: [
    { file: 'effects/shade.png', w: 760, h: 190, ax: 380, ay: 95 },
  ],
  grassTexture: [
    { file: 'ground/grass-texture.png', w: 256, h: 256, ax: 0, ay: 0 },
  ],
  pathTexture: [
    { file: 'ground/path-texture.png', w: 256, h: 256, ax: 0, ay: 0 },
  ],
};

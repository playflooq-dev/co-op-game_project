'use strict';
// Settings for the Forest world that live outside its art and code.
// Depth effects the loader adds on top of the clean art, per asset group:
// tint = [colour, strength at the top of the image, strength at the bottom], blur = softness in scene units.
// Far things get pale haze; things right in front of the camera get darker and slightly out of focus.
const FOREST_DEPTH = {
  farPinesBack: { tint: [MIST, 0.42, 0.62] }, farPinesFront: { tint: [MIST, 0.24, 0.44] },
  pines: { tint: [MIST, 0.08, 0.14] }, trees: { tint: [MIST, 0.08, 0.14] }, blossomTrees: { tint: [MIST, 0.08, 0.14] }, autumnTrees: { tint: [MIST, 0.08, 0.14] },
  waterfallCliff: { tint: [MIST, 0.07, 0.11] }, waterfallBank: { tint: [MIST, 0.07, 0.1] },
  fgFerns: { blur: 2.4, tint: ['#10281f', 0.22, 0.5] }, fgLeaves: { blur: 2.4, tint: ['#10281f', 0.22, 0.5] },
  fgPoppies: { blur: 2.2, tint: ['#10281f', 0.1, 0.4] }, fgRocks: { blur: 2.2, tint: ['#10281f', 0.2, 0.45] },
};

// Music file for the forest (see worlds/README.md). CC0: assets/music/CREDITS.txt.
const MUSIC_FILES = { forest: { file: 'worlds/forest/assets/music/fort-fairy.mp3', vol: 1 } };

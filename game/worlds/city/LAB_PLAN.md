# City lab plan (branch `lab/city-v2`)

The city is now a test level. This page says how it is being rebuilt. It was written on 2026-11-21, before Phase 1,
from the checkpoint `checkpoint-2026-11-20-city-music` (`level-2/city` had no newer commits).

## Physics approach

A small physics module written for this game, `game/shared/physics.js`. No engine: Phaser would replace the renderer,
the approved character drawing and the "double-click the HTML file" rule, for a game that needs only boxes and gravity.

- **Bodies** are upright boxes (the siblings, light boxes, heavy crates). They never rotate.
- **Solids** are walls and floors. **Ledges** are tops that can be stood on but walked and jumped through from below
  (balconies, planks, the see-saw, lifts, boats, and the tops of boxes). Ledges can slope and move, and carry what
  stands on them.
- Every body knows what it stands on and how much weight is on it. Plates, light-only planks, the see-saw and the
  pulley all read that one number: sister 3, heavy crate 3, brother 1, light box 1.
- Jumps use exact maths for constant gravity, so the height is the same at any frame rate.
- How the siblings move (walk, jump, coyote time, jump buffer, carry, lift, toss, coming back after a fall) is in
  `game/shared/movement.js`. Every number that shapes the feel is in one object there, `MOVE`.
  `city.html?tune=1` shows sliders for them.

## Files

| File | Change |
|---|---|
| `shared/physics.js` | New. The physics world. |
| `shared/movement.js` | New. Sibling movement, the `MOVE` settings, touch buttons. |
| `shared/kit.js` | New. The objects (Phase 1: boxes, crate, thin plank, see-saw, ledges, bell; Phase 2: the rest). |
| `shared/icons.js` | New. Little pictures (moved out of the old `city/play.js`). |
| `shared/characters/*.js` | New poses (jump, fall, carry, lifted, tossed). Used only when a world sets `p.pose`. |
| `shared/stage.js` | `drawChar` can squash, stretch and lean a character. Used only when a world asks. |
| `shared/sound.js`, `shared/sounds/` | Untouched code. A few more Kenney CC0 files; the lab adds them to the list itself. |
| `worlds/city/street.js` | New. The street scenery (sky, buildings, pavement, water), taken from the old `level.js`. |
| `worlds/city/lab.js` | New. Runs the lab: builds the stations from settings, camera, drawing, `?debug=1`. |
| `worlds/city/settings.js` | New `LAB` block: where every block and object stands. Old puzzle blocks go in Phase 3. |
| `worlds/city/level.js`, `play.js` | Not loaded any more. Kept until Phase 3, then deleted (art worth keeping moves over). |
| `city.html`, `tools/snap-city.html`, `tools/playtest-city.*` | New script list, new controls, lab tests. |
| `tools/check-characters.html` | New. Prints a fingerprint of the characters as the house and forest draw them. |
| House, forest | No files changed. They do not load the new files. |

## Risky, or different from the brief

1. **Shared character code changes.** The house and forest must look the same. I check this with a fingerprint of
   24 fixed character drawings taken before the change (`a2a2276`) and after (`tools/check-characters.html`), plus
   the house play test.
2. **"Falling returns you next to your partner" can break puzzles.** If she falls in the canal while he is on the far
   bank, that rule carries her across for free. So: a faller returns next to the partner only when the partner stands
   on the same side and level; otherwise to the faller's own last safe spot. Still within one second, with a puff.
3. **Reach can be cheated with boxes.** "She reaches high things" is real height now, so he can stand on a box.
   Stations must keep boxes away from sister-only things. Phase 5 checks every station for this.
4. **Controls differ from the house.** In the house W / Up is "use"; in the lab W / Up is jump and S / Down is grab.
   That stays until the new movement is approved or dropped.
5. **A phone held upright (390 x 844) is too narrow** for two characters side by side. Touch play is landscape; an
   upright phone shows a "turn me" picture.
6. **Touch buttons cover the bottom corners.** On touch screens the street is drawn higher, so the buttons sit over
   the road and not over the pavement.
7. **Carrying:** a carried box sits on the head, steadied with both hands, because the characters' arms are short.
   Boxes can be stood on but are walked past, not bumped into, so nobody gets stuck behind one.
8. **Scripted tests** replace the old `playtest-city.js` step by step; the old one cannot play the new level.

## Phases

0. Branch, this plan. 1. Movement and abilities in one test street, then stop for a feel test. 2. Object kit.
3. Stations. 4. No reading. 5. Tests. 6. Docs and checkpoint tag. Each phase is one commit, listed in `CHECKPOINTS.md`.

**Phase 1 is done (2026-11-21) and waits for a feel test.** Found while building it:
- A quick tap could fall between two frames on a slow device and be lost. Jump and grab presses are now remembered
  until the next frame. The test passes at full speed and at a forced 30 and 20 frames a second.
- The see-saw settles with the blue end down when nobody is on it, so his end is always the low one.
- Things are used, and stars collected, only while standing (or riding on her shoulders), never in mid-jump:
  otherwise a jump is a way round "too high for him".

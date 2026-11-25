# City lab plan (branch `lab/city-v2`)

**Status (2026-11-25): historical.** This is the plan and the record of how the city was rebuilt as a test level in
November 2026. That level was approved as **Level 2** on 2026-11-25. The stations it describes are still the level,
except that the stickers and the torn map were taken out. For the level as it is now, see `game/README.txt` and
[PROGRESSION.md](../../../PROGRESSION.md); for what is decided, [DECISIONS.md](../../../DECISIONS.md).

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

**Feel test, 2026-11-21:** "jump height is a bit too high", the rest feels good. The jump went from 1.3 to 1.1
brother-heights (245 to 207 units), with a slightly shorter jump time so it does not turn floaty.

**Phase 2 is done (2026-11-21).** The kit (`shared/kit.js`) now also has: small blue and big green plates, gates,
levers (held or flipped), the two-switch door (a gate that listens to two levers), the pulley lift with a rope to
haul on, small boats, a branch, a ferry and a rope ladder. One of each stands on the test street after the tunnel.
- "Heavy" means one single heavy thing (her, or the crate). A pile of light boxes never presses a green plate or
  breaks a plank, so piling boxes is not a way round her job.
- A gate coming down nudges aside whatever is in the doorway. Nothing is trapped, and nobody can prop it open.
- Holding the rope pulls with the holder's own weight, so she can haul him up and he cannot haul her.
- The ferry was not in the brief's list, but the canal station needs one, and the test street needed a way across.
- Ladders are climbed with the jump key held; there is still no "down" key, people just hop off.

**Phase 3 is done (2026-11-21).** The street was laid out again as eight stations (`STATIONS` in `settings.js`); the
first level's `level.js` and `play.js` are deleted, and its puppy, fountain, bell game, jets and parasols live on in
`things.js`. Where the brief and the "both are needed" rule pulled apart, I chose the rule:
- **Station 1.** As written, she could do it alone. Now the crate hangs on a hoist and only his hand fits the
  release hatch.
- **Station 2.** She stands on the box and lifts him from there; he may start from the ground beside it.
- **Station 5.** The lift goes up to 520, above a toss, so the rope is the only way up. The counterweight has a
  block and tackle: two boxes lift her, and he stays up top to load them. The lift will not go up empty.
- **Station 6.** One crank on a high shelf opens all three parasols, which then stay open as steps.
- **Station 7.** Her lever is high, his is in the low hut door, 420 apart: nobody can hold both.
- A **height bar** ends every station that has boxes: a box on a head is knocked off, so boxes cannot be carried
  on to help with a later station.
- Cut, as the brief says: the crossing, the metro (not kept as a ride), the bus, every code. Also cut: the ladder
  on wheels. Kept for fun: the water jets (on the terrace), the fountain, the pigeons and the bell game.

**Phase 4 is done (2026-11-21).** Nothing in the city needs reading now.
- The goal is a picture in a thought bubble over the sister (each station has one in `settings.js`); it shows on
  arriving and again when both stand still for a while.
- Hints are pictures too. Each station is a list of steps in `lab.js` (`HINTS`): whose job, where, what to press.
  When the next step stays undone for 20 s the right thing sparkles, after 40 s an arrow in that sibling's colour
  points at it, after 60 s a faint ghost of that sibling stands in the right place with the sign for the key.
  `city.html?hints=fast` makes them come ten times sooner.
- Signs over heads: a hand (grab or use), two hands (the lift), an arrow (climb).
- No stickers since 2026-11-24. There were eight, none needed (a key, a bird, a drop, a sock, a paw, a bell, a boat,
  a note). The client found, on Level 1, that collecting confuses more than it adds, and asked for them to go here
  too; they come back once the base game is set. Their places are in the git history (commit `4d44558`). The two
  shelves they sat on (Maple Street, over the fish stall) are still there. The end card shows a high five and the time.
- No torn map since 2026-11-25 (the user: "only puzzles are good"). The gust, the flying pieces, the box of pieces
  and the map on the end card are gone. The puzzles stay: the three places at Maple Street are lamps with a cable to
  the gate (green hers, blue his, plain for the lift), and the puppy is helped down from the awning.
- Words that remain: the shop names painted on the building art, the loading line, the debug and tuning views.

**Phase 5 is done (2026-11-21).** Two scripted tests, both in `tools/playtest-city.js`:
- `tools/playtest-city.html` plays the whole city with real key presses, both siblings, 56 checks. It passes at full
  speed, at a forced 20 frames a second and at tablet size. The script, which never hesitates, takes about 150
  seconds: station 0 30 s, 1 10 s, 2 16 s, 3 20 s, 4 13 s, 5 30 s, 6 15 s, 7 18 s. Children will take several times that.
- `tools/playtest-city.html?solo=1` tries 29 short cuts, one sibling at a time while the other stands still:
  jumping and grabbing at things out of reach, carrying a box past a height bar, dashing through a gate, hauling
  an empty lift, holding one bridge lever. It found one that worked: at the flour mill she could stand on the green
  plate herself and dash through the shutter before it came down. The plate now stands further from the shutter.
- Small screens: at 1024 x 768 and 844 x 390 the touch buttons sit over the road, the pavement and everything on it
  stay clear, and the tallest station (the lift) still fits. Held upright (390 x 844) the game asks to be turned.

**Not tested:** a real tablet or phone (only those screen sizes on this computer, where it draws 110 to 220 frames a
second; `city.html?fps=30` and `?fps=20` show it stays playable when slow); real fingers on the buttons; the sounds
by ear; and above all real children. A script only finds the short cuts somebody thought of.

**Phase 6 is done (2026-11-21).** `game/README.txt` and `game/worlds/README.md` describe the lab and how to place
objects; `OPEN_QUESTIONS.md` has what to learn at each station; `DECISIONS.md` lists what is proposed, with nothing
approved. The git tag is `checkpoint-2026-11-lab-city-v2`. Not done: lighter music files for the web (optional).

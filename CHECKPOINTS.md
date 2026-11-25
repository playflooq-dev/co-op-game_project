# Checkpoints

A checkpoint is a saved point in the project's history (a git tag) that the game can be rolled back to if later changes
go wrong. The newest is at the top. Every commit so far is listed below the checkpoints.

## Checkpoints

| Checkpoint (git tag) | Date | What it holds |
|---|---|---|
| `checkpoint-2026-11-chapter-1` | 2026-11-25 | Chapter 1 complete as a draft, on the branch `level-3/canal`: Level 3 "The Canal" (`game/canal.html`: thin planks and small boats that only hold the brother, combined with known tools, seven sections, the chapter's ending at the Old Bridge), the picture-only chapter map (`game/map.html`) with a save in the browser, `game/index.html` starting the chapter, the review in `game/worlds/canal/REVIEW.md`, and the tests. Levels 1 and 2 are as at the checkpoint below, plus the city without stickers and the link to the map. Level 3 and the chapter flow are not approved yet. Not on the live site. |
| `checkpoint-2026-11-level-1-plain` | 2026-11-24 | Level 1, the park, made plain after the client's feedback, on the branch `level-1/plain`: no stickers, no dog and no ball (the dog and the ball are saved in `game/shared/later/`); an opening that is only about learning to move, with each player's keys shown as pictures next to their own sibling, one move at a time; the first-time player review in `game/worlds/park/REVIEW.md`. The four puzzles are as at the checkpoint below. Nothing in it is approved yet. Not on the live site. |
| `checkpoint-2026-11-level-1-gentle` | 2026-11-23 | Level 1, the park, on the branch `level-1/gentle`: a gentle first level of about five minutes (learn to move, four very small puzzles, a calm moment, a finale together), the progression rules in `PROGRESSION.md`, the reactions (dog, cat, birds, ducks, flowers), and its two scripted tests. `game/index.html` opens the park; the house is `game/house.html`. The city lab and the forest are as at the checkpoint below. Nothing in it is approved yet. Not on the live site. |
| `checkpoint-2026-11-lab-city-v2` | 2026-11-21 | The city lab, on the branch `lab/city-v2`: the city as a test level of eight stations for children of 5 to 10, with jumping, carrying, the lift and the toss, an object kit, picture hints and no reading. Nothing in it is approved yet. The house and the forest are as at the checkpoint below. Not on the live site. |
| `checkpoint-2026-11-20-city-music` | 2026-11-20 | Chapter Two rebuilt to be fun (new puzzles, Old Town, hints, stickers), recorded CC0 music and sound effects in every chapter, and the puzzle-design research. Same as the live site at https://forest-trail-d56.pages.dev on 2026-11-20. |
| `checkpoint-2026-11-18-forest-trail` | 2026-11-18 | The approved Forest Trail scene: the art style and the two characters. |

### How to go back to a checkpoint

Ask Claude, or run these in `co-op-game_project`:

- See a checkpoint without changing anything: `git switch --detach checkpoint-2026-11-20-city-music` (go back with
  `git switch level-3/canal` for the newest work, `git switch level-1/plain` for Levels 1 and 2 without Level 3 and the
  chapter map, `git switch level-1/gentle` for the first version of the park (with
  the stickers, the dog and the ball), `git switch lab/city-v2` for the lab without the park, or
  `git switch level-2/city` for the branch without either).
- Start new work from a checkpoint: `git switch -c my-new-branch checkpoint-2026-11-20-city-music`.

## Every commit so far

Commits from `aa38627` on are on the branch `lab/city-v2`, where the city is rebuilt as a test level (the plan is in
`game/worlds/city/LAB_PLAN.md`). Commits from `23e48ce` on are on the branch `level-1/gentle`, which starts from the
lab and adds a gentle first level, the park (the rules it follows are in `PROGRESSION.md`). Commits from `17d66aa` on
are on the branch `level-1/plain`, which starts from there and makes Level 1 plain. Commits from `772a0c3` on are on
the branch `level-3/canal`, which starts from `level-1/plain` and adds Level 3 and the chapter. The small commits that
only add a row to this table are not listed.

| Commit | Date | What changed |
|---|---|---|
| `5885a21` | 2026-11-25 | Level 3, Step 5: the documents (README files, PROGRESSION.md with the "Combinations" rules, proposals I to L in DECISIONS.md, "Level 3 and Chapter 1 flow: waiting for feedback" in OPEN_QUESTIONS.md). The checkpoint `checkpoint-2026-11-chapter-1` is on the commit after this one. |
| `3affc2e` | 2026-11-25 | Level 3, Step 4: the first-time player review (`game/worlds/canal/REVIEW.md`, 19 items) and the tests. Applied: the picture no longer pushes the sibling who stays behind (at tablet width it had pushed her into the river), see-saw hints at the tip of the blue end, the high lever a little lower, a tree in the thought bubble once the bridge is down. |
| `7c96cd2` | 2026-11-25 | Level 3, Step 3: one chapter. `game/shared/chapter.js` (the three levels and the save in the browser), `game/map.html` (a picture-only chapter map with ticks, padlocks, replay, a chapter card and the forest as a tease), each level's end card leading to the map, `game/index.html` opening Level 1 the first time and the map afterwards. In the park and the city only this connection changed. |
| `74891ec` | 2026-11-25 | Level 3, Step 2: small reactions (boats dip, gates wobble, a quack after a splash, confetti at the bridge). And a loophole closed: she could cross by jumping the instant her feet touched a plank or a boat. |
| `772a0c3` | 2026-11-25 | Level 3, Step 1: the canal. A new world in `game/worlds/canal/` with the page `game/canal.html`: seven sections built on one new idea, light-only surfaces, combined with known tools. Its own objects wrap kit objects; all art is borrowed from the city and the forest. Two scripted tests. |
| `75278d1` | 2026-11-24 | No stickers in the city lab either: its eight stickers, the sticker box at the top left and the count on the end card are gone (the end card shows the map and the time). The stations and the map pieces are unchanged. This is after the checkpoint `checkpoint-2026-11-level-1-plain`. |
| `49f4e48` | 2026-11-24 | Level 1 plain, Step 5: tests and documents. The park passes its play-through at computer, tablet and phone sizes and its solo test (37 checks); the city lab, the house and the forest are unchanged. The checkpoint `checkpoint-2026-11-level-1-plain` is on the commit after this one. |
| `bb55c0a` | 2026-11-24 | Level 1 plain, Step 4: the first-time player review, `game/worlds/park/REVIEW.md`: every thing in the level that could distract or need explaining, with a recommendation for each (29 items). Only what the opening clearly needed was applied. |
| `571fddd` | 2026-11-24 | Level 1 plain, Step 3: the opening is only about learning to move. Each player's keys are shown as big pictures next to their own sibling, one move at a time (walk, then jump; grab only at the first box); a ghost shows the move to a player who stands still; on touch screens the button pulses. A longer, plainer path with a few very low steps and one log. No lift in section 1. The puzzles are unchanged. |
| `adf246d` | 2026-11-24 | Level 1 plain, Step 2: the dog and the ball are out of Level 1. Their code is saved, unchanged, in `game/shared/later/`. |
| `17d66aa` | 2026-11-24 | Level 1 plain, Step 1: the three stickers are out of Level 1, with the sticker box at the top left and the count on the end card. The end card shows a high five and the time. |
| `387936d` | 2026-11-23 | Level 1, Phase 5: the documents (README files, "Level 1 (the park): waiting for feedback" in OPEN_QUESTIONS.md, proposals G and H in DECISIONS.md). The checkpoint `checkpoint-2026-11-level-1-gentle` is on the commit after this one. |
| `e19d026` | 2026-11-23 | Level 1, Phase 4: `game/index.html` opens the park and the house moved to `game/house.html`. Two scripted tests for the park: a play-through with the time per section, and a solo test (34 checks; no puzzle can be finished by one sibling alone). The measured times are in `PROGRESSION.md`. |
| `f3dfad8` | 2026-11-23 | Level 1, Phase 3: the park reacts. Birds, bouncing flowers, a cat on the box, ducks, a dog that tags along; the siblings cheer, giggle, look proud and wave; plates glow, the box squashes, confetti at the way out. |
| `173ad1d` | 2026-11-23 | Level 1, Phase 2: the park. A new world in `game/worlds/park/` with the page `game/park.html`: six gentle sections (learn to move, plate and gate, box on plate, the pond, the balloon and the lift, the way out together), built from forest and city art. Easier jumping and earlier hints than the lab. Shared code got two switchable additions (no toss; a gate that opens for either of two plates) and three icons. |
| `23e48ce` | 2026-11-23 | Level 1, Phase 1: `PROGRESSION.md`, the rules for how levels grow (one new mechanic a level, teach, practise, twist) and the planned levels. |
| `fc106c7` | 2026-11-21 | City lab, Phase 6: the documents (README files, the city lab's open questions, the proposals in DECISIONS.md). The checkpoint `checkpoint-2026-11-lab-city-v2` is on the commit after this one. |
| `3fe28fe` | 2026-11-21 | City lab, Phase 5: testing. A second scripted test tries 29 ways one sibling might finish a station alone; it found one (dashing through the mill shutter), now closed. Results for the play-through, small screens and what could not be tested are in `LAB_PLAN.md`. |
| `5832a3b` | 2026-11-21 | City lab, Phase 4: no reading. A picture bubble for the goal, picture hints (sparkle, arrow, ghost of the right sibling), signs over heads, eight stickers in the new stations, an end card of pictures and numbers. |
| `4560d60` | 2026-11-21 | City lab, Phase 3: the city rebuilt as eight test stations (Maple Street and the torn map, the flour mill, the market puppy, the see-saw at Fountain Square, the canal, the pulley lift in Old Town, the cafe parasols, the Old Bridge). The first level's code is deleted; the crossing, metro, bus and all codes are cut. `city.html?station=N` starts at a station. The scripted test plays the whole city. |
| `fcf8dd9` | 2026-11-21 | City lab, Phase 2: the object kit. Small blue and big green plates, gates, levers, the two-switch door, the pulley lift, small boats, a branch, a ferry and a rope ladder, with one of each on the test street. The jump is lower (207 units, was 245) after the first feel test. The scripted test has 87 checks. |
| `aa38627` | 2026-11-21 | City lab, Phase 1: new movement on one test street. Jumping (the same height every time, coyote time, jump buffer), carrying light boxes and the heavy crate, the lift and the toss, the brother ducking into low gaps by himself, a thin plank, a see-saw, touch buttons. New shared files for physics, movement, objects and icons; the house and the forest are unchanged. Waiting for a feel test before Phase 2. |
| `841c738` | 2026-11-20 | Music and sound: recorded CC0 music for each place (house: Apple Cider; city: Quaint Town, Hot Springs Town, Magic Town; forest: Fort Fairy), Kenney CC0 sound effects, footsteps on the stairs, quieter music. |
| `7e53d40` | 2026-11-20 | Chapter Two rebuilt: the boost, chain and gate yard, puppy under the stalls, canal boats and ferry, Fountain Square with the bell game, metro piano, Old Town (picture game, ladder on wheels and water jets, parasols, bus tickets), bus request box, bridge picture code and brake; hints on the map, stickers, end card. |
| `61d4661` | 2026-11-20 | Research: how side-scrolling and co-op story games handle puzzles, with notes on Pepelo 2, and the puzzle options report. |
| `7362aba` | 2026-11-18 | Chapter Two (the city), first draft, and every world split into its own folder. |
| `952e6db` | 2026-11-18 | Chapter One: the house escape. |
| `24ea1b4` | 2026-11-18 | Merge of the approved Forest Trail scene into main. |
| `f385b39` | 2026-11-18 | The Forest Trail scene and the art decisions (checkpoint `checkpoint-2026-11-18-forest-trail`). |
| `0e9845c` | 2026-11-15 | Old prototype code removed; design documents started. |
| `b11f1e2` | 2026-11-15 | The first prototype (an online wave-survival game, later removed). |

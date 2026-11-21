# Checkpoints

A checkpoint is a saved point in the project's history (a git tag) that the game can be rolled back to if later changes
go wrong. The newest is at the top. Every commit so far is listed below the checkpoints.

## Checkpoints

| Checkpoint (git tag) | Date | What it holds |
|---|---|---|
| `checkpoint-2026-11-20-city-music` | 2026-11-20 | Chapter Two rebuilt to be fun (new puzzles, Old Town, hints, stickers), recorded CC0 music and sound effects in every chapter, and the puzzle-design research. Same as the live site at https://forest-trail-d56.pages.dev on 2026-11-20. |
| `checkpoint-2026-11-18-forest-trail` | 2026-11-18 | The approved Forest Trail scene: the art style and the two characters. |

### How to go back to a checkpoint

Ask Claude, or run these in `co-op-game_project`:

- See a checkpoint without changing anything: `git switch --detach checkpoint-2026-11-20-city-music` (go back with
  `git switch level-2/city`).
- Start new work from a checkpoint: `git switch -c my-new-branch checkpoint-2026-11-20-city-music`.

## Every commit so far

Commits from `aa38627` on are on the branch `lab/city-v2`, where the city is rebuilt as a test level (the plan is in
`game/worlds/city/LAB_PLAN.md`). The small commits that only add a row to this table are not listed.

| Commit | Date | What changed |
|---|---|---|
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

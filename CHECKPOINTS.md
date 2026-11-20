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

| Commit | Date | What changed |
|---|---|---|
| (this checkpoint) | 2026-11-20 | Music and sound: recorded CC0 music for each place (house: Apple Cider; city: Quaint Town, Hot Springs Town, Magic Town; forest: Fort Fairy), Kenney CC0 sound effects, footsteps on the stairs, quieter music. |
| (this checkpoint) | 2026-11-20 | Chapter Two rebuilt: the boost, chain and gate yard, puppy under the stalls, canal boats and ferry, Fountain Square with the bell game, metro piano, Old Town (picture game, ladder on wheels and water jets, parasols, bus tickets), bus request box, bridge picture code and brake; hints on the map, stickers, end card. |
| (this checkpoint) | 2026-11-20 | Research: how side-scrolling and co-op story games handle puzzles, with notes on Pepelo 2, and the puzzle options report. |
| `7362aba` | 2026-11-18 | Chapter Two (the city), first draft, and every world split into its own folder. |
| `952e6db` | 2026-11-18 | Chapter One: the house escape. |
| `24ea1b4` | 2026-11-18 | Merge of the approved Forest Trail scene into main. |
| `f385b39` | 2026-11-18 | The Forest Trail scene and the art decisions (checkpoint `checkpoint-2026-11-18-forest-trail`). |
| `0e9845c` | 2026-11-15 | Old prototype code removed; design documents started. |
| `b11f1e2` | 2026-11-15 | The first prototype (an online wave-survival game, later removed). |

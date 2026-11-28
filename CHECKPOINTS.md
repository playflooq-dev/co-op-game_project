# Checkpoints

A checkpoint is a saved version of the whole project (a git tag) that can be looked at again, or gone back to, if a
later change goes wrong. The newest is at the top. Below the checkpoints is a list of every change so far.

## Checkpoints

| Checkpoint (git tag) | Date | What it holds | Where to play it |
|---|---|---|---|
| `checkpoint-2026-11-28-sound-lab` | 2026-11-28 | The Sound Lab (`sfx-lab/`): 252 sounds made with ElevenLabs for 84 sounds the game needs, and the page for choosing favourites; also `game/tools/make-sounds.py`. **Private: on this computer only, not on GitHub, not on the web** (ElevenLabs free plan). The game is unchanged since `checkpoint-2026-11-27-tap-to-play`. | (none: private) |
| `checkpoint-2026-11-27-tap-to-play` | 2026-11-27 | **Approved.** Tap to play: a picture-only start screen; full screen on phones and tablets that allow it (Android, iPad), kept from level to level; a full-screen button on the map; the game can be added to a phone's home screen. For the trials with the client, the play button opens the map with every level open. On `main`. | https://tap-to-play.forest-trail-d56.pages.dev |
| `checkpoint-2026-11-27-house-first` | 2026-11-27 | **Approved.** Chapter 1 with the house as the first stop on the map (house, park, city, canal, then the locked forest), older saves kept, and the test links (`?unlock=all`, `?level=...`). On `main`. | https://map-house.forest-trail-d56.pages.dev |
| `checkpoint-2026-11-25-chapter-1-approved` | 2026-11-25 | **Chapter 1, approved.** The park (Level 1), the city to the Old Bridge (Level 2) and the canal (Level 3), with the picture map between them and progress saved in the browser. Two dead ends removed, the torn map taken out of the city, the log in the park fixed. All documents brought up to date. It is on `main`: the approved work of every branch was merged there on this day. | https://chapter-1.forest-trail-d56.pages.dev (the same game) |
| `checkpoint-2026-11-chapter-1` | 2026-11-25 | Chapter 1 as first finished, on the branch `level-3/canal`, before the first plays by hand: Level 3 "The Canal", the chapter map and the save, `game/index.html` starting the chapter. It still has the dead end in the canal's section 6, the dead end at Fountain Square, and the torn map in the city. | (none: its address now shows the approved version) |
| `checkpoint-2026-11-level-1-plain` | 2026-11-24 | Level 1, the park, made plain after the client's feedback, on the branch `level-1/plain`: no stickers, no dog and no ball; an opening that is only about learning to move, with each player's keys shown as pictures; the first-time player review. The city still has its stickers and its map here. | https://level-1-plain.forest-trail-d56.pages.dev |
| `checkpoint-2026-11-level-1-gentle` | 2026-11-23 | The first version of the park, on the branch `level-1/gentle`: learn to move, four very small puzzles, a calm moment, with stickers, a dog and a ball. Also the progression rules in `PROGRESSION.md`. `game/index.html` opens the park; the house moved to `game/house.html`. | https://level-1-gentle.forest-trail-d56.pages.dev |
| `checkpoint-2026-11-lab-city-v2` | 2026-11-21 | The city rebuilt as a test level, "the city lab", on the branch `lab/city-v2`: eight stations with jumping, carrying, the lift and the toss, an object kit, picture hints and no reading. This became Level 2. | https://lab-city-v2.forest-trail-d56.pages.dev |
| `checkpoint-2026-11-20-city-music` | 2026-11-20 | The older game: the house level and the first city level (road crossings, the metro, buses, codes), with recorded music and sound effects, and the puzzle-design research. | https://forest-trail-d56.pages.dev (the main address; it matched this checkpoint on 2026-11-20 and has not been changed since) |
| `checkpoint-2026-11-18-forest-trail` | 2026-11-18 | The approved Forest Trail scene: the art style and the two characters. | (part of every later version: `forest.html`) |

The web addresses are on Cloudflare Pages. Each was uploaded by hand from the checkpoint beside it; nothing uploads by
itself. The main address still shows the older game: whether it should show Chapter 1 is an open question.

**The Sound Lab is private (merged into `main` on this computer on 2026-11-28, at the user's request).** `sfx-lab/` is a
page for listening to new sound effects made with ElevenLabs and choosing favourites. They come from ElevenLabs' free
plan, for private testing only, and the GitHub repository is public: **pushing `main` now would publish them.** So
`main` has not been pushed since this merge; it waits for the user's decision. The game itself does not use these
sounds.

## How to go back to a checkpoint

Ask Claude, or run these in the `co-op-game_project` folder. None of them deletes anything.

**Look at a checkpoint without changing anything**

    git switch --detach checkpoint-2026-11-20-city-music

Now the folder holds that version: open `game/index.html` to play it. To come back to the newest approved version:

    git switch main

**Start new work from a checkpoint**

    git switch -c my-new-branch checkpoint-2026-11-27-tap-to-play

This makes a new branch that starts at that version. The checkpoint itself and `main` stay as they are.

**Undo a bad change without losing history**

    git revert <commit>

This adds a new change that takes the bad one out again. Both stay in the history, so nothing is lost and it can be
undone in turn. Find the commit's short name in the table below, or with `git log --oneline`. To undo a whole merged
branch, use the merge commit's name with `git revert -m 1 <merge commit>`.

**Do not use** `git reset --hard` or a forced push (`git push --force`): they throw history away, on this computer
or on GitHub.

## Every commit so far

`main` holds everything. Until 2026-11-25 the work was done on branches, each starting from the one before; on that
day they were merged into `main` in order. The branches still exist: `level-1/house-escape`, `level-2/city`,
`lab/city-v2`, `level-1/gentle`, `level-1/plain`, `level-3/canal`, `fix/map-house-and-test-unlock` and `feature/tap-to-play` (both
merged on 2026-11-27), and `feature/elevenlabs-sounds` and `sound/sfx-lab` (merged on 2026-11-28, not on GitHub). The small commits that only add a row to this
table are not listed.

| Commit | Date | What changed |
|---|---|---|
| `0af7265` | 2026-11-28 | Merge of `sound/sfx-lab` into `main`: the Sound Lab, private. The checkpoint `checkpoint-2026-11-28-sound-lab` is on this commit. Not pushed. |
| `d8a47bf`, `d8fd6bc`, `f490dba` | 2026-11-27 | *On the branch `sound/sfx-lab`.* The Sound Lab: the list of 84 sounds and the generator, the page and its check, and the 252 sounds with their log and documents. |
| `82a78e3` | 2026-11-28 | Merge of `feature/elevenlabs-sounds` into `main`: `game/tools/make-sounds.py`, a small tool for trying ElevenLabs sounds (commit `fad68ea`). |
| `695e0a3` | 2026-11-27 | Merge of `feature/tap-to-play` into `main`: Tap to play, approved this day. The checkpoint `checkpoint-2026-11-27-tap-to-play` is on this commit. |
| `bc62c77` | 2026-11-27 | The approval recorded: decision 42 in DECISIONS.md, and the status pages brought up to date. |
| `6e9f464` | 2026-11-27 | *On the branch `feature/tap-to-play`.* The full-screen check can run against a version on the web. |
| `47721c8` | 2026-11-27 | *On the branch `feature/tap-to-play`.* After the first try on a phone: full screen now works on phones (it is asked for when the finger is lifted, not when it touches); the play button opens the map with every level open (for the trials with the client); a tap in the first second after a page opens is no longer lost on any page; the game can be added to a phone's home screen (an icon, `manifest.webmanifest`), which on an iPhone is the way to play without the browser bar. The full-screen check now taps with a finger. |
| `ced6e7f` | 2026-11-27 | *On the branch `feature/tap-to-play`.* The documents for Tap to play: "Playing on phones and tablets" in `game/README.txt`, the start screen in `game/worlds/README.md`, proposal P in DECISIONS.md, real-device testing in OPEN_QUESTIONS.md, PROJECT_STATUS.md. |
| `0488e7b` | 2026-11-27 | *On the branch `feature/tap-to-play`.* Tap to play: a picture-only start screen in `index.html`; on phones and tablets that allow it, full screen and sideways after the tap, with the game inside the start page so that full screen lasts; a full-screen button on the map. Test links skip it. New tests `tools/playtest-start.html` and `tools/check-fullscreen.mjs`. |
| `2663c66` | 2026-11-27 | Merge of `fix/map-house-and-test-unlock` into `main`: the house as the first stop on the map, and the test links, approved this day. The checkpoint `checkpoint-2026-11-27-house-first` is on this commit. |
| `6c98c4f` | 2026-11-27 | The approval recorded: decisions 40 and 41 in DECISIONS.md, parts of decisions 33 and 38 marked replaced, and the status pages brought up to date. |
| `a082dbd` | 2026-11-27 | *On the branch `fix/map-house-and-test-unlock`.* The documents for the change below: the test links in `game/README.txt`, the house as first stop in the README files and PROJECT_STATUS.md, proposals N and O in DECISIONS.md, and the review the house now needs in OPEN_QUESTIONS.md and PROGRESSION.md. The TEST badge made readable on a phone. |
| `4af16ad` | 2026-11-27 | *On the branch `fix/map-house-and-test-unlock`.* The chapter map shows the house as its first stop, before the park; new players start at the house, and its end card leads to the map. Older saves are kept and not sent back. Test links: `?unlock=all` (every level open, a TEST badge, nothing saved) and `?level=house`, `park`, `seesaw`, `canal`. The map's stops shrink on a narrow screen. The chapter test rewritten (70 checks). |
| `b19e950` | 2026-11-25 | `CLAUDE.md`: the standing rules for every work session (read the documents first, a branch per task, keep the documents true, merge and tag when a version is approved, never rewrite history). |
| `f037436` | 2026-11-25 | Merge of `level-3/canal` into `main`: the canal (Level 3), the chapter map and save, the fixes and the updated documents. The checkpoint `checkpoint-2026-11-25-chapter-1-approved` is on this commit. |
| `0a4abf6` | 2026-11-25 | Merge of `level-1/plain` into `main`: the plain park (Level 1), and the city without stickers. |
| `ab7a86e` | 2026-11-25 | Merge of `level-1/gentle` into `main`: the first version of the park, and the progression rules. |
| `61606cc` | 2026-11-25 | Merge of `lab/city-v2` into `main`: the city rebuilt with jumping and the object kit (now Level 2). |
| `9b44329` | 2026-11-25 | Merge of `level-2/city` into `main`: the first city level, with music and sound. |
| `bd6ac8c` | 2026-11-25 | Merge of `level-1/house-escape` into `main`: the house level, "Home Alone". |
| `2106bab` | 2026-11-25 | The documents brought up to date after Chapter 1 was approved: decisions 25 to 39 in DECISIONS.md and the older decisions they replaced, OPEN_QUESTIONS.md rewritten, PROGRESSION.md with the three built levels, the README files, a status line on the per-level files, and the new PROJECT_STATUS.md. No game code changed. |
| `daac1d1` | 2026-11-25 | After the first play by hand: two dead ends removed (a low step on the far side of the ledge in the canal's section 6; a ladder that is always down on the far side of the wall at Fountain Square in the city), and the brother can no longer hop off her shoulders into a wall (shared movement code). The solo tests try each. This is after the checkpoint `checkpoint-2026-11-chapter-1`. |
| `fd3db18` | 2026-11-25 | The torn map is out of the city (no gust, no pieces, no box of pieces; the three places at Maple Street are lamps with cables to the gate, and the puppy is helped down). And the log in the park is drawn where it is stood on: the siblings no longer stand in the air above it. |
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

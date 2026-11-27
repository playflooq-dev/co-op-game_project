# Approved Decisions

Things we have agreed on and build from. An item is only moved here once it is approved.
Open items live in [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md). Where the game stands today is in
[PROJECT_STATUS.md](PROJECT_STATUS.md).

Decisions keep their numbers for good. When a decision is replaced by a later one it is not deleted: it stays in
its table, marked **Replaced**, so the history can be followed.

## Core concept

| # | Decision | Notes |
|---|---|---|
| 1 | **Genre: co-op puzzle game** | Chosen over action, survival and party games. |
| 2 | **Exactly 2 characters, played together** | There are always two siblings on screen and every puzzle needs both. *The original note, "made to play with a friend or partner", was **replaced on 2026-11-25 by decision 25** (who the game is for).* |
| 3 | ~~Online multiplayer~~ | *Players on their own devices, connected over the internet.* **Replaced on 2026-11-25 by decision 26**: both players share one screen. Whether the game is ever played online is an open question. |
| 4 | **Split abilities** | Each sibling can do different things, so both are needed to solve puzzles. The abilities are in decision 28. |
| 5 | **Split information** | Each player knows or sees things the other does not. **Not used in Chapter 1**: on one shared screen, with children of 5 to 10, there are no hidden clues and no codes. Whether it returns is an open question. |
| 25 | **Who the game is for** (approved 2026-11-25) | Parents playing with children of about 5 to 10, two children playing together, or one player controlling both siblings. It is released for a mixed audience: families, children and adults together, not children alone. |
| 26 | **Two players on one screen** (approved 2026-11-25) | Both play on the same device: one keyboard (the sister on A, D, W, S; the brother on the arrow keys), or one tablet or phone held sideways with four touch buttons each. One player can also play both siblings. |

## Art and characters

The approved look is the **Forest Trail** scene in [game/forest.html](game/forest.html). (The folder was called
`forest-scene/` until 2026-11-18.)

| # | Decision | Notes |
|---|---|---|
| 6 | **Art style: 2D storybook illustration** | Warm and cozy: soft sunlight, layered depth with haze in the distance, detailed trees, flowers and props. |
| 7 | **The two characters** | The **hooded traveller** (green hooded coat, backpack with bedroll, green eyes, freckles) and the **lantern bearer** (blue cap with a red feather, blue tunic, red cape and scarf, plaster on the nose). Neither carries anything in their hands (staff and lantern removed 2026-11-18). |
| 8 | **Expressive characters** | Faces react to the game: worried when the other one is far away, happy and giggling when together, sleepy when idle, a cheer. |
| 9 | **Art kept as separate assets** | Scenery is one file per item, so any piece can be redrawn or replaced later. See [game/worlds/README.md](game/worlds/README.md). |
| 14 | **Each world is kept separate** | Every world (park, city, canal, house, forest, and later ones) has its own folder in `game/worlds/` with its own art, settings and code, so one world can change without touching the others. Art that suits more than one world is borrowed from the world that owns it, not copied. The characters and the shared play code live in `game/shared/`. |
| 24 | **Sound** | Recorded CC0 music for each place and recorded CC0 sound effects (Kenney), chosen 2026-11-19. M switches all sound off and on. A few sounds with no good recording (barks, splashes, quacks) are made by code. |

## Story and levels

| # | Decision | Notes |
|---|---|---|
| 10 | **The two characters are brother and sister** | The hooded traveller is the **older sister** (taller, calm, careful). The lantern bearer is the **younger brother** (small, curious, quick). |
| 11 | ~~How the story starts: home alone~~ | *The siblings are locked in the house; a treasure map is on the kitchen table; getting out is the first puzzle and the hunt leads into the city.* **Replaced on 2026-11-25 by decision 33**: the game now starts in the park. How the story begins, and whether there is a treasure map at all, is an open question. |
| 12 | ~~Level 1 is a side cutaway of the house~~ | *Two floors, walking and stairs, no jumping.* **Replaced on 2026-11-25 by decision 34** (Level 1 is the park). The house level is kept, unchanged, at [game/house.html](game/house.html); its future is an open question. |
| 13 | ~~Level 1 puzzle: the hidden spare key~~ | *He finds a code chalked in the cupboard, she opens Dad's box with it.* **Replaced on 2026-11-25 by decisions 31 and 34**: no puzzle needs reading, and Level 1 is the park. |
| 15 | ~~Level 2 is the city, 15 to 20 minutes~~ | *The first city level, rebuilt on 2026-11-19 with road crossings, the metro, buses and codes.* **Replaced on 2026-11-25 by decision 35**. That older level is kept at the git tag `checkpoint-2026-11-20-city-music`. |
| 33 | **Chapter 1 is three levels in the city** (approved 2026-11-25) | Level 1 the park, Level 2 the city (the see-saw level, which ends at the Old Bridge), Level 3 the canal. After each level comes the chapter map (decision 38). Chapter 2 will be the forest. *Partly **replaced on 2026-11-27 by decision 40**: the house now stands in front of the park on the map.* |
| 40 | **The house is the first stop of the chapter** (approved 2026-11-27) | The chapter map shows: the house ("Home Alone", [game/house.html](game/house.html)), the park, the city (the see-saw level), the canal, then the locked forest. New players start at the house; its end card leads to the map with the park open. The chapter's ending comes after all four. Progress saved before this is kept: those players are not sent back, and the house is simply open for them to play. This replaces, in part, decision 33 (three levels, the game starting in the park) and decision 38 (what the map shows first). The house itself was not changed: it still has no jump, a code puzzle and words to read, so it does not yet meet decisions 27, 31 and 32 and has to be reviewed before release ([OPEN_QUESTIONS.md](OPEN_QUESTIONS.md), "The house comes first"). |
| 34 | **Level 1 is the park** (approved 2026-11-25) | [game/park.html](game/park.html). An extremely plain first level for somebody who has never seen the game: first only learning to walk and jump, with each player's keys shown as pictures next to their own sibling, one move at a time; then four very small puzzles (plate and gate, box on plate, the lift for a balloon, two plates at once) with a calm moment at a pond. Only walking, jumping, small plates, gates, one light box and the lift. About 5 minutes. |
| 35 | **Level 2 is the city, to the Old Bridge** (approved 2026-11-25) | [game/city.html](game/city.html), the see-saw level. Eight stations, each one idea on one screen: jump and carry and three lamps; the heavy crate and the green plate; a box as a step; the see-saw; small boats and a ferry; the pulley lift; the toss; two levers at once at the Old Bridge. About 10 minutes. It was built on 2026-11-21 as a test level ("the city lab") and is still called that in some file names. |
| 36 | **Level 3 is the canal, and its one new idea is light-only surfaces** (approved 2026-11-25) | [game/canal.html](game/canal.html). Thin blue planks and small blue boats hold the brother and a light box. Under the sister a plank creaks, bends and sends her back; a boat sinks. She can never cross one. Taught alone first, then used in combinations (decision 37). Seven sections, ending the chapter at the Old Bridge with the forest on the far bank. No toss, no pulley and no heavy crate in this level. About 8 minutes. |

## How the game plays

Decisions 16 to 24 were agreed on 2026-11-19, from the research in
[reports/Puzzle design in story platformers.md](reports/Puzzle%20design%20in%20story%20platformers.md), for the first city
level. Decisions 27 to 39 were approved on 2026-11-25, after the playtests of the city, the park and the canal.

| # | Decision | Notes |
|---|---|---|
| 16 | ~~The siblings' abilities: tall, and small and light~~ | *She is tall and reaches high things; he is small and light and fits through gaps.* **Replaced on 2026-11-25 by decision 28**, a longer list. One part stays: the abilities are the same for the whole game, and each level adds new things in the world, not new powers. |
| 17 | ~~No jumping. She can lift him up instead~~ | **Replaced on 2026-11-25 by decision 27**: both jump. The lift stays. |
| 18 | **Every puzzle needs both of them** | No puzzle can be finished by one sibling alone, and neither one only waits: where one holds something, the other is doing something. Each level has a scripted test that tries every short cut with one sibling alone. |
| 19 | ~~The goal says what to do, in words; hints are sentences on the treasure map~~ | **Replaced on 2026-11-25 by decision 31**: pictures, not words. One part stays: the goal says what, not how; working out how is the puzzle. |
| 20 | **Failing is quick, gentle and funny** | No lives and no game over. *The examples from the first city level (a car honks, a wrong bus) went with that level;* how it works now is in decision 27. |
| 21 | ~~The treasure map is the key object~~ | *It showed the goal, held the hints, and its four pieces carried the code for the bridge.* **Replaced on 2026-11-25 by decision 31**. The torn map and its pieces were taken out of Level 2 on 2026-11-25: only the puzzles are left. |
| 22 | **Answers change every game** | The way to solve a puzzle stays the same, but values (codes, numbers) are shuffled. **Not used in Chapter 1**: there are no codes. Whether it returns is an open question. |
| 23 | **Places to rest and play** | Each level has a calm place where nothing has to be done (the pond in the park, Fountain Square in the city, the ducks and the rowing boat at the canal). *The second half of this decision, eight hidden stickers, was **replaced on 2026-11-25 by decision 39**.* |
| 27 | **Movement: jumping, with no death pits** (approved 2026-11-25) | Both siblings walk and jump. A jump is always the same height (1.1 brother-heights; 1.2 in Level 1), with a little forgiveness at edges and just before landing. Light boxes can be carried by either, the heavy crate only by her. She lifts him onto her shoulders; in Level 2 she can also toss him up from there. Weight matters: she is heavy, he is light. No lives, no game over, no fall damage, no timed jumps over hazards. Whoever falls into water or out of the picture is back within a second, with a splash. No dead ends: wherever somebody can get to, they can get back from. |
| 28 | **What each sibling can do** (approved 2026-11-25) | The table below. The same for the whole game. |
| 29 | **The object kit** (approved 2026-11-25) | Puzzles are built from a small set of objects placed by settings, in `game/shared/kit.js`: light box, heavy crate, small blue and big green plates, gates, levers, see-saw, pulley lift, thin planks, small boats, a ferry, a rope ladder, a height bar that keeps boxes in their own part of a level. A level adds its own objects on top (the canal: a sliding footbridge, a raft that fetches her by itself). |
| 30 | **The colour language** (approved 2026-11-25) | Green means the sister's job (heavy or high). Blue means the brother's job (light or small). Plain wood is for either. |
| 31 | **Pictures instead of words: nothing needs reading** (approved 2026-11-25) | The goal of each part is a picture in a thought bubble. Hints are pictures: the thing to use sparkles, then an arrow points at it, then a faint, glittering ghost of the right sibling shows the move (after 10, 20 and 35 seconds in Level 1; 20, 40 and 60 in Levels 2 and 3). A small sign over a head shows what the grab key would do. End cards and the chapter map are pictures and numbers. Words remain only on the shop signs painted into the art, the loading line, and the developer views. |
| 32 | **The progression rules** (approved 2026-11-25) | [PROGRESSION.md](PROGRESSION.md): a slow, soft curve. Level 1 starts with moving only; one new idea per level; every idea is taught, practised, then given a twist; a calm moment after each harder puzzle; a new level starts easier than the last one ended; every level ends with both at once. |
| 37 | **Levels feel like progress by combining known tools** (approved 2026-11-25) | From Level 3 on: combinations of tools the players already know, at most two steps, both visible on one screen, with at most the level's one new idea in them. The rules and the ideas not used yet are in [PROGRESSION.md](PROGRESSION.md), "Combinations". |
| 38 | **A chapter map and a local save** (approved 2026-11-25) | After each level's end card comes a picture-only map of the city, [game/map.html](game/map.html), with a stop for each level: a tick on finished stops, a padlock on later ones, the siblings walking on to the next. Any finished stop can be played again. After Level 3 a card celebrates the end of the chapter, and the forest appears across the river with a padlock. The browser remembers, on that device only, which levels are finished and how far into an unfinished one the players got: no accounts, no personal data, nothing sent anywhere. [game/index.html](game/index.html) opens Level 1 the first time and the map afterwards. *Partly **replaced on 2026-11-27 by decision 40**: the map has a stop for the house as well, and `index.html` opens the house the first time.* |
| 39 | **Stickers, the dog and the ball are saved for later levels** (approved 2026-11-25) | Nothing is collected in Chapter 1, and there is no dog and no ball. The client found that collecting confuses more than it adds, and that the dog and the ball are fun but too much while players are learning. The sticker object stays in the kit (`game/shared/kit.js`); the dog and the ball are kept in `game/shared/later/`. When and how they come back is an open question. |
| 41 | **Test links** (approved 2026-11-27) | For testing only: `index.html?unlock=all` shows the map with every level open and a small TEST badge, and saves nothing; `index.html?level=house`, `park`, `seesaw` or `canal` opens that level at once. Players without these see no difference. The links are listed in [game/README.txt](game/README.txt), "For testing". |

What each sibling can do (decision 28):

| | Sister (tall, strong, heavy; green) | Brother (small, light; blue) |
|---|---|---|
| Walk and jump | Yes | Yes, a little faster |
| Carry | Light boxes and the heavy crate | Light boxes only |
| Weight | Presses the big green plates. Thin planks bend and send her back; small boats sink under her | Walks on thin planks and small boats |
| Size | Reaches high levers and signs | Ducks into low gaps by himself; his hand fits small hatches and drains |
| Together | Lifts him onto her shoulders; in Level 2, tosses him up from there | Rides on her shoulders and reaches higher still |
| See-saw | Her landing sends him flying | Too light to send her anywhere |

## Proposed (not approved)

Ideas that are built or written down but that nobody has approved yet.

| | Proposal | Notes |
|---|---|---|
| F | **Stations** (proposed 2026-11-21) | A level is a row of stations or sections, each one idea on one screen, one to two minutes, with a scripted check that one sibling cannot finish it alone. All three levels are built this way; it has not been approved as a rule for later chapters. |
| P | **Tap to play, and full screen on phones and tablets** (asked for by the user and built on 2026-11-27; waiting for approval) | `index.html` opens with a picture-only start screen (the siblings and one big play button). The tap starts the sound and, on phones and tablets that allow it (Android, iPad), full screen held sideways; on an iPhone and on a computer the game simply starts. In full screen the game runs inside the start page, so that full screen lasts from level to level; a small button on the map brings it back if it was left. Test links skip the start screen. On the branch `feature/tap-to-play`. |
| M | **Open points from the level reviews** (2026-11-24 and 2026-11-25) | The first-time player reviews list things to decide in the park ([game/worlds/park/REVIEW.md](game/worlds/park/REVIEW.md)) and the canal ([game/worlds/canal/REVIEW.md](game/worlds/canal/REVIEW.md)): for example the cat on the box, the birds inside two puzzles, the edge of the picture stopping whoever runs ahead, and that Levels 2 and 3 both use small boats and the Old Bridge. They are gathered in [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md). |

## Decision log

| Date | Decision |
|---|---|
| 2026-11-15 | Online co-op chosen. |
| 2026-11-15 | Puzzle genre for exactly 2 players chosen. |
| 2026-11-15 | Puzzles combine split abilities and split information. |
| 2026-11-15 | Earlier prototypes removed. The design is settled here before any building starts. |
| 2026-11-18 | Forest Trail scene approved as the graphics and characters for the game (decisions 6 to 9). |
| 2026-11-18 | Story start and Level 1 chosen: brother and sister, home alone, escape the house with the hidden spare key (decisions 10 to 13). |
| 2026-11-18 | Client feedback on Level 1: the siblings carry nothing (no staff, no lantern), and Level 2 is the city (decisions 7, 11, 13 updated). |
| 2026-11-18 | Level 2 is a side-scrolling city level of 15 to 20 minutes, and every world is kept in its own folder (decisions 14 and 15). |
| 2026-11-19 | Client feedback on Level 2: the look is right, but it was no fun to play. Researched how similar games handle puzzles, agreed the play rules in decisions 16 to 24, and rebuilt the city level on them. |
| 2026-11-21 | New audience: parents with children of about 5 to 10, and two children together. The city became a test level ("the lab") with jumping, carrying, the lift, the toss and an object kit. Nothing was approved yet. |
| 2026-11-23 | Client feedback on the lab: far too difficult as a first level; what matters most is a slow, soft curve. The progression rules were written (`PROGRESSION.md`) and a gentle Level 1, the park, was built. Proposed, not yet approved. |
| 2026-11-24 | Client feedback on the park: the stickers confuse more than they add, and the dog and the ball are fun but too much while players are learning the controls. Agreed direction: Level 1 is an extremely plain, simple and intuitive intro. Stickers, dog and ball taken out; the opening shows each player's keys as pictures, one move at a time. The city's eight stickers taken out as well. |
| 2026-11-25 | Level 3 "The Canal", the chapter map and the local save built. After the first plays: two dead ends removed (one in the canal, one in the city), the brother can no longer end up inside a wall, the torn map taken out of the city, the log in the park drawn where it is stood on. |
| 2026-11-25 | **Approved by the user and the client: Chapter 1** (the park, the city, the canal) and everything it is built on. New decisions 25 to 39: the audience, two players on one screen, the movement, the abilities, the object kit, the colour language, pictures instead of words, the progression rules, the three levels, light-only surfaces, combinations, the chapter map and local save, and stickers, dog and ball saved for later. Replaced: decisions 3, 11, 12, 13, 15, 16, 17, 19 and 21, and parts of 2, 20 and 23. Not used in Chapter 1: decisions 5 and 22. |
| 2026-11-27 | The user asked for the house to be the first stop on the chapter map, before the park, and for test links (`?unlock=all`, `?level=...`). Built on the branch `fix/map-house-and-test-unlock`; proposals N and O; waiting for approval. The house's own rules (reading, no jump, a code) were not changed and are an open question. |
| 2026-11-27 | **Approved by the user:** the house as the first stop of the chapter and the test links, after being put on a preview web address to try. New decisions 40 and 41; parts of decisions 33 and 38 replaced. The review the house needs stays an open question. |
| 2026-11-27 | The user asked for a "Tap to play" start screen with full screen on phones and tablets. Built on the branch `feature/tap-to-play`; proposal P; waiting for approval. |

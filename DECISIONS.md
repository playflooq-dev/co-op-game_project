# Approved Decisions

Things we have agreed on and will build from. Only move an item here once it is approved.
Open items live in [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md).

## Core concept

| # | Decision | Notes |
|---|---|---|
| 1 | **Genre: co-op puzzle game** | Chosen over action, survival and party games. |
| 2 | **Exactly 2 players** | Made to play with a friend or partner. |
| 3 | **Online multiplayer** | Players are on their own devices and connect over the internet. |
| 4 | **Split abilities** | Each player can do different things, so both are needed to solve puzzles. |
| 5 | **Split information** | Each player knows or sees things the other doesn't, so they have to communicate. |

## Art and characters

The approved look is the **Forest Trail** scene in [game/forest.html](game/forest.html), or the public copy at
https://forest-trail-d56.pages.dev. (The folder was called `forest-scene/` until 2026-11-18.)

| # | Decision | Notes |
|---|---|---|
| 6 | **Art style: 2D storybook illustration** | Warm, cozy forest look: soft sunlight, layered depth with haze in the distance, detailed leafy trees, flowers and props. |
| 7 | **The two characters** | The **hooded traveller** (green hooded coat, backpack with bedroll, green eyes, freckles) and the **lantern bearer** (blue cap with a red feather, blue tunic, red cape and scarf, plaster on the nose). Neither carries anything in their hands (staff and lantern removed 2026-11-18). |
| 8 | **Expressive characters** | Faces react to the game: worried when the partner is far away, happy and giggling when together, sleepy when idle, a cheer emote. |
| 9 | **Art kept as separate assets** | Scenery is one file per item, so any piece can be redrawn or replaced later, for example with painted art. See `game/worlds/README.md`. |
| 14 | **Each world is kept separate** | Every world (house, city, forest, and later ones) has its own folder in `game/worlds/` with its own art, settings and code, so one world can change without touching the others. Art that suits more than one world is borrowed from the world that owns it, not copied. The characters and the shared play code live in `game/shared/`. |

## Story and levels

Chapter One, "Home Alone", is [game/house.html](game/house.html) (it was `game/index.html` until 2026-11-23, when that
page became the door to the proposed Level 1 below). Chapter Two, "Across the City", was [game/city.html](game/city.html)
until 2026-11-21; that page is now the test level described under "Proposed" below, and the level decided here is kept
at the git tag `checkpoint-2026-11-20-city-music`.

| # | Decision | Notes |
|---|---|---|
| 10 | **The two characters are brother and sister** | The hooded traveller is the **older sister** (taller, calm, careful). The lantern bearer is the **younger brother** (small, curious, quick). |
| 11 | **How the story starts** | The siblings are home alone and locked in while their parents are in town. A treasure map is already on the kitchen table when the game begins. Getting out of the house is the first puzzle; the treasure hunt then leads into the **city**, which is Level 2. The view outside the house is the city. |
| 12 | **Level 1 is a side cutaway of the house** | Two floors, like a dollhouse with the front wall removed, in the approved art style. Walking and stairs, no jumping. |
| 13 | **Level 1 puzzle: the hidden spare key** | The front door is locked. Only the sister can reach Dad's locked box on top of the tall bookcase. Only the brother fits in the dark cupboard under the stairs, where he pulls the cord of a light bulb and finds the box code chalked on the wall. He tells her the code, she opens the box, and the spare key inside opens the door. |
| 15 | **Level 2 is the city** | A side-scrolling journey across the city, like the Forest Trail, aimed at 15 to 20 minutes. Rebuilt on 2026-11-19 after the first draft was "no fun to play": see "How the game plays" below and [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md). Playable in [game/city.html](game/city.html). |

## How the game plays

Agreed on 2026-11-19, from the research in [reports/Puzzle design in story platformers.md](reports/Puzzle%20design%20in%20story%20platformers.md).
Chapter Two is the first chapter built this way.

| # | Decision | Notes |
|---|---|---|
| 16 | **The siblings' abilities stay the same all game** | She is tall and reaches high things; he is small and light and fits through gaps. Each chapter adds new things in the world (the city: buttons, boats, a ferry, trains) instead of new powers. |
| 17 | **No jumping. She can lift him up instead** | Where something is too high for both, they stand under it and she lifts him onto her shoulders (the "boost"). |
| 18 | **Every puzzle needs both of them** | No puzzle can be finished by one sibling alone, and neither one only waits: where one holds something, the other is doing something. The second road crossing was removed because it was only waiting. |
| 19 | **The goal says what to do, not how** | Working out how is the puzzle. Hints for the current goal appear on the treasure map one at a time (after 25, 55 and 90 seconds), from a nudge to the answer. |
| 20 | **Failing is quick, gentle and funny** | No lives and no game over. A car honks and bumps a sibling back to the kerb; a wrong bus or train costs a little time; a boat that is not held steady just cannot be walked on. |
| 21 | **The treasure map is the key object** | It shows the goal, holds the hints, and its four pieces each carry a little picture. The four pictures are the code for the bridge at the end of Chapter Two. |
| 22 | **Answers change every game** | The way to solve a puzzle stays the same, but the values change: the map pictures and the bus numbers are shuffled each game. |
| 23 | **Places to rest and play, and stickers** | Each chapter has a calm place with toys that do not have to be used (Fountain Square: the fountain, the bell game). Eight hidden stickers reward looking around; none is needed to finish. |
| 24 | **Sound** | Recorded CC0 music for each place (house, city streets, metro, Old Town, forest) and recorded CC0 sound effects (Kenney), chosen 2026-11-19 after the music made by code was "not good enough". The pieces cross-fade between places; M switches all sound off and on. Code-made sounds remain only as a fallback and for sounds with no good recording (barks, honks, splashes). |

## Proposed (testing in the city lab)

**None of this is approved.** Since 2026-11-21 the city ([game/city.html](game/city.html)) is a test level, "the lab",
for a new audience: parents playing with children of about 5 to 10, two children together, or one player with both
characters. The ideas below are being tried there and will be approved, changed or dropped after playtests with
children. What we want to learn is in [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md), "The city lab".
Proposals G and H were added on 2026-11-23 and are tried in the park, the gentle Level 1
([game/park.html](game/park.html)); what to watch for there is in OPEN_QUESTIONS.md, "Level 1 (the park)".

| | Proposal | Notes |
|---|---|---|
| A | **Jumping, with no death pits** | Both siblings walk and jump. The jump is always the same height (now 1.1 brother-heights, lowered once after a first feel test), with a little forgiveness at edges and before landing. No lives, no game over, no fall damage, no timed jumps over hazards. Whoever falls out of the picture or into water is back within a second, with a splash or a puff. |
| B | **The new abilities** (table below) | Carrying, weight and size, and three moves together: the lift, the toss and the see-saw. |
| C | **An object kit** | Puzzles are built from a small set of objects placed by settings: light box, heavy crate, small blue and big green plates, gates, levers, a two-switch door, see-saw, pulley lift, thin planks, small boats and branches, a ferry, a rope ladder, a height bar. |
| D | **A colour language** | Green means the sister's job (heavy or high). Blue means the brother's job (light or small). Plain wood is for either. |
| E | **Pictures instead of words** | Nothing needs reading. The goal is a picture in a thought bubble. Hints are pictures: the right thing sparkles after about 20 seconds, an arrow points at it after 40, a faint ghost of the right sibling shows the move after 60. Signs over heads are a hand, two hands or an arrow. The end card is pictures and numbers. |
| F | **Stations** | A chapter is a row of stations, each one idea on one screen, one to two minutes, needing both siblings, with a way of checking by script that one sibling cannot finish it alone. |
| G | **A slow, soft curve** (proposed 2026-11-23) | The rules in [PROGRESSION.md](PROGRESSION.md), written after the client found the lab far too difficult as a first level: the first one to two minutes are moving only; one new idea per level; every idea is met three times (teach, practise, twist); a calm moment after each harder puzzle; levels grow from about 5 to about 15 minutes; a new level starts easier than the last one ended; every level ends with both at once and a high five. Easy parts are kept interesting by things that react, not by harder puzzles. The planned levels are listed there too. |
| H | **Level 1 is the park** (proposed 2026-11-23) | [game/park.html](game/park.html), which [game/index.html](game/index.html) now opens: learn to move, plate and gate, box on plate, the pond, the balloon and the lift, the way out together. About five minutes. Only walking, jumping, small plates, gates, one light box and the lift; no toss. A slightly more forgiving jump than the lab and earlier hints (10, 20, 35 seconds). It borrows all its art from the forest and the city. Waiting for feedback: see [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md), "Level 1 (the park)". |

The proposed abilities:

| | Sister (tall, strong, heavy) | Brother (small, light) |
|---|---|---|
| Walk and jump | Yes | Yes |
| Carry | Heavy crates and light boxes | Light boxes only |
| Weight | Presses the big green plates; thin planks, small boats and branches give way under her | Walks on thin planks, small boats and branches |
| Size | Reaches high levers and signs | Ducks into low gaps by himself (no crawl button); his hand fits small hatches and drains |
| Together | Lifts him onto her shoulders; from there tosses him up to a ledge | Rides on her shoulders and reaches higher still |
| See-saw | Her landing sends him flying | Too light to send her anywhere |

**If these are approved, earlier decisions change:**
- **12** (Level 1 is a side cutaway of the house: "walking and stairs, no jumping") and **13** (the hidden spare key,
  solved by reading a chalked code): the house would need jumping, and a puzzle without reading.
- **16** (the siblings' abilities stay the same all game): the abilities table above replaces "tall" and "small and
  light" with a longer list; they would still stay fixed for the whole game.
- **17** (no jumping; she lifts him instead): jumping comes in. The lift stays, and the toss is added.
- **19** (the goal says what to do in words, and hints are sentences on the treasure map): pictures replace both.

- **11 to 13** again, if G and H are approved: the game would start in the park, not in the house, and the story's
  beginning (home alone, the map on the kitchen table) would need a new place. The house is kept, unchanged, at
  [game/house.html](game/house.html).

Decisions 5 (split information) and 21 to 22 (the map pictures as a code that changes every game) are also not used
in the lab: with children of 5 to 10 on one screen there are no codes. Whether they return for older players is open.

## Decision log

| Date | Decision |
|---|---|
| 2026-11-15 | Online co-op chosen. |
| 2026-11-15 | Puzzle genre for exactly 2 players chosen. |
| 2026-11-15 | Puzzles combine split abilities and split information. |
| 2026-11-15 | Earlier prototypes removed. The design is settled here before any building starts. |
| 2026-11-18 | Forest Trail scene approved as the graphics and characters for the game (decisions 6 to 9). |
| 2026-11-18 | Story start and Level 1 chosen: brother and sister, home alone, escape the house with the hidden spare key (decisions 10 to 13). |
| 2026-11-18 | Client feedback on Level 1: the siblings carry nothing (no staff, no lantern; the cupboard got a pull-cord light), and Level 2 is the city, so the house now looks out on a city (decisions 7, 11, 13 updated). |
| 2026-11-18 | Level 2 is a side-scrolling city level of 15 to 20 minutes, and every world is kept in its own folder (decisions 14 and 15). |
| 2026-11-19 | Client feedback on Level 2: the look is right, but it was no fun to play. Researched how similar games handle puzzles, agreed the play rules in decisions 16 to 24, and rebuilt the city level on them. |
| 2026-11-21 | New audience: parents with children of about 5 to 10, and two children together. The city became a test level ("the lab") on the branch `lab/city-v2`. Nothing was approved; the ideas being tried are listed under "Proposed (testing in the city lab)". |
| 2026-11-23 | Client feedback on the lab: far too difficult as a first level; what matters most is a slow, soft curve. Proposed, not approved: the progression rules in `PROGRESSION.md` and a gentle Level 1, the park, on the branch `level-1/gentle` (proposals G and H). The lab stays as a test level. |

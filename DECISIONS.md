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

Chapter One, "Home Alone", is [game/index.html](game/index.html). Chapter Two, "Across the City", is [game/city.html](game/city.html).

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

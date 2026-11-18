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
| 9 | **Art kept as separate assets** | Scenery is one file per item in `game/assets/` so any piece can be redrawn or replaced later, for example with painted art. See `game/assets/README.md`. |

## Story and the first level

Playable in [game/index.html](game/index.html) (Chapter One, "Home Alone").

| # | Decision | Notes |
|---|---|---|
| 10 | **The two characters are brother and sister** | The hooded traveller is the **older sister** (taller, calm, careful). The lantern bearer is the **younger brother** (small, curious, quick). |
| 11 | **How the story starts** | The siblings are home alone and locked in while their parents are in town. A treasure map is already on the kitchen table when the game begins. Getting out of the house is the first puzzle; the treasure hunt then leads into the **city**, which is Level 2. The view outside the house is the city. |
| 12 | **Level 1 is a side cutaway of the house** | Two floors, like a dollhouse with the front wall removed, in the approved art style. Walking and stairs, no jumping. |
| 13 | **Level 1 puzzle: the hidden spare key** | The front door is locked. Only the sister can reach Dad's locked box on top of the tall bookcase. Only the brother fits in the dark cupboard under the stairs, where he pulls the cord of a light bulb and finds the box code chalked on the wall. He tells her the code, she opens the box, and the spare key inside opens the door. |

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

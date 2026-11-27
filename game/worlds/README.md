# The worlds

Each place in the game is a **world** with its own folder. A world can be changed without touching the others.

| Folder | Chapter | Page |
|---|---|---|
| `park/` | **Level 1**, "The Park": the plain first level (see "The park" below). Approved 2026-11-25. | `park.html` |
| `city/` | **Level 2**, the city: the see-saw level, eight stations to the Old Bridge (see "The city" below). It began as a test level, "the city lab", and its files still carry that name: the lab and Level 2 are the same world. Approved 2026-11-25. | `city.html` |
| `canal/` | **Level 3**, "The Canal": light-only planks and boats, and combinations (see "The canal" below). Approved 2026-11-25. | `canal.html` |
| `house/` | "Home Alone", the first level ever built, and since 2026-11-27 the first stop of Chapter 1, in front of the park (approved 2026-11-27). It still plays the old way (walking only, words on the screen, a code) and has to be reviewed before release: see OPEN_QUESTIONS.md. | `house.html` |
| `forest/` | The Forest Trail: the approved art scene. Chapter 2 will be built here. | `forest.html` |

`index.html` starts Chapter 1 (the house the first time, the chapter map `map.html` afterwards). The levels and
the map are tied together by `../shared/chapter.js`: see "The chapter" below.

Every world folder has the same parts:

| File | What it is |
|---|---|
| `assets/` | The world's pictures, one PNG per item, in sub-folders. |
| `assets/manifest.js` | The list of those pictures: size and ground point of each one. |
| `settings.js` | The numbers you may want to change: where things are, how fast things move, timings. Change a number, refresh, and see it. |
| `level.js` (park, canal, house), `lab.js` (city), `scene.js` (forest) | The code that runs the world. |
| `street.js`, `things.js` (city) | The city's scenery, and the city's own objects: see "The city" below. |
| `scenery.js`, `things.js`, `life.js` (park) | The park's scenery, its own objects, and everything that only reacts: see "The park" below. The park has no `assets/` folder: all its pictures are borrowed. |
| `generate.js` | The drawing code that painted the PNGs. The game does not use it; see "Repainting" below. |

What worlds share is in `../shared/`:

- `shared/characters/`: the sister (`sister.js`) and the brother (`brother.js`), drawn live by code because they walk,
  blink and change expression, plus `shared.js` (legs, faces, expressions, and the poses for jumping and carrying).
  The `*-preview.png` files are only pictures for reference.
- `shared/stage.js`: the play code the house and the city use (the screen, keys, drawing a character with its light).
- `shared/sound.js`: the sounds and the music. A world that loads it can call `sfx('name')` for a sound and
  `musicArea('name')` to say which piece of music fits where the players are.
- `shared/sounds/`: recorded sound effects (Kenney, CC0; see `CREDITS.txt` there). The `SAMPLES` list in
  `shared/sound.js` says which files each sound uses and how loud; `shared/movement.js` adds the ones for jumping
  and carrying. Sounds without files are made by code.
- Only for worlds with jumping (the park, the city and the canal). The house and the forest do not load these.
  - `shared/physics.js`: gravity, floors and walls, things to stand on, weight.
  - `shared/movement.js`: how the siblings walk, jump, carry, lift and toss. Every number that shapes the feel is in
    `MOVE` at the top of it.
  - `shared/kit.js`: the object kit: boxes, plates, gates, levers, the see-saw, the lift and so on.
  - `shared/icons.js`: the little pictures used in place of words.
- `shared/later/`: things saved for a later level (the dog and the ball that were in the first version of the park).
  No page loads them; each file says at the top how to use it.
## Music

Every world plays music files from its own `assets/music/` folder, listed in `MUSIC_FILES` at the end of its
`settings.js` with a volume each. All of them are CC0 (free, no credit needed); `CREDITS.txt` in each music folder
says where each came from.

| Where | Piece | File |
|---|---|---|
| The house | `home` | `house/assets/music/apple-cider.mp3` ("Apple Cider") |
| The park | `park` | borrows `city/assets/music/quaint-town.mp3` ("Quaint Town") |
| City streets | `street` | `city/assets/music/quaint-town.mp3` ("Quaint Town") |
| (was the metro; not used by the lab) | `under` | `city/assets/music/hot-springs-town.mp3` ("Hot Springs Town") |
| Old Town and the Old Bridge | `evening` | `city/assets/music/magic-town.mp3` ("Magic Town") |
| The forest | `forest` | `forest/assets/music/fort-fairy.mp3` ("Fort Fairy") |

The music fades from one piece to the next as the siblings move between places, and M switches all sound off and on.
To change a piece, put another MP3 in that folder and change its line in `MUSIC_FILES` (use only music whose licence
allows it in a game). If a file is missing or will not play, a calm piece made by code (in `shared/sound.js`) plays
instead. `tools/music-test.html` plays those made-by-code pieces.

## Borrowing art between worlds

A world can use another world's pictures without copying them. Each page lists the art it loads. For example,
`city.html` loads all of `worlds/city/assets/` plus the clouds, trees, bushes, grass and path from the forest:

```js
{ assets: FOREST_ASSETS, base: 'worlds/forest/assets/', only: ['clouds', 'trees', 'bigTrees', 'bushes', 'grassTexture', 'pathTexture'] }
```

So if you replace a forest tree, the street trees in the city change too. To give the city its own trees instead, add
them to `worlds/city/assets/` and take `trees` off that list.

The park goes furthest: it has no pictures of its own. `park.html` borrows trees, bushes, flowers, grass, rocks, logs
and clouds from the forest, and the far skyline, the lamp, the bench and the park gate from the city.

## Replacing a picture

1. Make your new picture as a **PNG with a transparent background**.
2. Keep the **same proportions** (width : height) as the file you are replacing. Any resolution works; the game
   stretches it to the right size.
3. Keep the **ground in the same place** inside the picture: for a building, the bottom edge is where it meets the
   pavement; for a tree, the base of the trunk.
4. Save it over the old file with the **same name**, then refresh the game.

If your picture has different proportions, or its ground point is elsewhere, change its line in that world's
`manifest.js`: `w` and `h` are the size it is drawn at, and `ax`, `ay` say where the ground point is, measured from the
picture's top-left corner. All four are in scene units, where the whole screen is 1080 units tall.

To add more variety, add another file to a group in `manifest.js` (for example a fifth car in `car`). Where the game
picks between pictures of a group, it will start using it.

## The park (`park/`)

Level 1 since 2026-11-23, approved on 2026-11-25: a plain first level built to the rules in
[PROGRESSION.md](../../PROGRESSION.md). It may only use walking, jumping, small blue plates, gates, one light box
and the lift. On 2026-11-24 it was made plainer after the client's feedback: nothing to collect, no dog and no ball,
and an opening that is only about learning to move.

| File | What it holds |
|---|---|
| `settings.js` | The six `SECTIONS` (every object, one line each), the trees, lamps and benches, how the jump feels in this level (`PARK_MOVE`), when hints appear (`HINT_TIMES`: 10, 20 and 35 seconds), and the numbers for learning the keys (`LEARN_SET`). |
| `level.js` | Runs the level: builds the sections, the camera, when a puzzle counts as solved, the hints (`HINTS`), the end card. |
| `learn.js` | Learning to move without words: each player's keys as big pictures next to their own sibling, one move at a time (walk, jump, and grab where it is first needed), the ghost that shows a move to a player who stands still, the pulsing touch buttons, and the row of keys at the bottom that fills up as moves are learned. |
| `scenery.js` | Draws what cannot be touched: sky, the town far away, hills, trees, grass, the path, the park gate at the end. |
| `things.js` | The park's own objects (table below). |
| `life.js` | Everything that only reacts: birds, bouncing flowers, the cat on the box, the ducks, and what the siblings do themselves (cheer, giggle, the proud look, the wave). Taking a line out of `settings.js` removes that animal; nothing depends on them. None of it is in section 1. |
| `REVIEW.md` | The first-time player review of 2026-11-24: every thing in the level that could distract, look usable or need explaining, with a recommendation for each, and which ones were applied. |

Objects are placed exactly as in the city (see "Placing objects" below): one line in a section's `things` list.
`x` is the place along the path, `h` the height above it. Besides the kit's `block`, `plate` and `bar`, the park has:

| Kind | Settings | What it is |
|---|---|---|
| `log` | `x, h` | A log lying on the path: hop over it or stand on it. `h` is where feet stand; the picture is scaled so that the top of its bark is exactly there, and the solid part is as long as the bark. |
| `parkgate` | `x, by: [ids], any, latch` | The kit's gate, drawn as a green iron park gate. `any: true` opens for any one of its plates (the kit's gate needs all of them). `by: ['balloon']` opens for whoever carries the balloon. |
| `parkbox` | `x` | The kit's light box, with a cat on it; it squashes and puffs dust when it lands. |
| `pond` | `x: [from, to]` | A duck pond behind the path. Grab makes a splash; the ducks swim away from it. |
| `balloon` | `x, h` | A balloon caught on a branch. Whoever reaches it carries it along. At `h: 392` only he can reach it, from her shoulders. |
| `birds` | `x, n, h` | A few birds that fly up when somebody jumps or runs close, and come back. |
| `flowers` | `x: [from, to], n` | Flowers and grass that bounce when walked through. |
| `hurdle` | `x, h` | A low white fence across the path, to hop over. Not placed since 2026-11-24. |
| `puddle` | `x, w` | Splashes. Nothing else happens. Not placed since 2026-11-24. |

Not in the park any more, and kept for later:
- The **dog** and the **ball** are in `shared/later/dog.js` and `shared/later/ball.js`. No page loads them; each file
  says at the top how to put it into a level (one script line and one line of settings).
- **Stickers** are still a kind in the object kit (`sticker` in `shared/kit.js`), but since 2026-11-24 no level
  places one, and neither the park's nor the city's level code draws a sticker box or counts them. To bring
  collecting back, a level needs the box at the top left and the row on the end card again as well.

Section 1 follows three rules of its own (see rule 1 in PROGRESSION.md): only `block` and `log` are placed there, none
higher than 90; nothing in it can be used, picked up or collected; and the lift is off (`LEARN_SET.liftFrom`).

Two rules keep a puzzle from being finished by one sibling alone, and `tools/playtest-park.html?solo=1` checks them:
a plate is at least 300 from its gate (nobody can step off and dash through), and a `bar` keeps the box in its own
section. Things can only be taken with feet on something, never in a jump.

How the moves feel in the park is `PARK_MOVE` in `park/settings.js`: a slightly higher jump than the lab, more
forgiveness at edges and before landing, and no toss. `park.html?tune=1` has sliders.

## The canal (`canal/`)

Level 3 since 2026-11-25, the last level of Chapter 1, approved the same day: built to the rules in
[PROGRESSION.md](../../PROGRESSION.md) ("Combinations"). Its one new idea is light-only surfaces; everything
else is known from the park and the city. It has no art of its own: the houses, lamps, bench and the Old Bridge are
the city's, the trees on the far bank the forest's.

| File | What it holds |
|---|---|
| `settings.js` | The seven `SECTIONS` (every object, one line each), where the water is (`WATERS`), the houses and lamps, the forest edge, hint times (as in the city: 20, 40 and 60 seconds), and `CANAL_MOVE` (no toss). |
| `level.js` | Runs the level: builds the sections, the camera, when a puzzle counts as solved, the hints (`HINTS`), the end card. |
| `scenery.js` | Draws what cannot be touched: sky, the far town, the row of houses, the quay, the canal in front, the side canals, the forest on the far bank. |
| `things.js` | The canal's own objects (table below). Most are a kit object with one thing added. |
| `react.js` | Small reactions: boats dip, gates wobble, a quack after a splash, confetti when the bridge comes down. |
| `REVIEW.md` | The first-time player review of 2026-11-25, with what was applied and what waits for a decision. |

Objects are placed as in the park and the city: one line in a section's `things` list. Besides the kit's `block`,
`ledge`, `box`, `plate`, `lever` and `bar`, and the city's `bridge`, the canal has:

| Kind | Settings | What it is |
|---|---|---|
| `thinplank` | `x: [from, to], h` | The new idea. A thin blue plank: holds him and a light box, and bends a little (more with the box). Under her it creaks, bends deep and walks her back; a jump onto it springs her back to the bank she last stood on. It never breaks. |
| `footbridge` | `x: [from, to], by` | A sturdy bridge with a green edge. It slides out over the water once its id comes on, and stays. |
| `lightboat` | `x, w` | The kit's small blue boat. It dips under him; under her it sinks, and she cannot jump off it. |
| `launcher` | `x, half, h, to: [x, h], rise` | The kit's see-saw (standing `h` above the quay if asked). Whoever it flings is carried to the place `to`, so nobody has to steer. `rise` is how high, in brother-heights. |
| `raft` | `x: [her dock, home], by` | The kit's ferry. Once its lever is pulled it goes over to her side by itself, and brings back whoever steps on. |
| `dropladder` | `x, h, by` | The kit's rope ladder, let down while its id is on and rolled up again when it goes off. |
| `lockgate` | `x, by, any, latch` | The kit's gate; it wobbles as it opens. |
| `ducks` | `x: [from, to], n` | Ducks on the canal in front of the quay. Only to look at. |
| `moored` | `x` | A brown rowing boat tied up at the quay. Only to look at (blue would say "his boat"). |

Rules that keep it fair, all checked by `tools/playtest-canal.html?solo=1`:
- A stream is at least 340 wide and the gap to the middle boat 320: a jump carries about 190.
- Nobody too heavy can jump off a light-only surface, not even in the moment of landing on it.
- The high lever in section 5 is out of his reach, and the high shelf in section 6 out of reach of a jump, a lift, or
  a second jump off the see-saw. There is no toss in this level.
- A `bar` keeps each box in its own section.
- After a splash a sibling comes back next to the other one only if both are on the same bank.
- No dead ends: wherever somebody can get to, they can get back from, or the way on is already open for both. A drop
  that cannot be jumped back up gets a low step (the far side of the ledge in section 6). The same was done in the
  city: a ladder that is always down on the far side of the wall at Fountain Square. When adding a wall, a ledge or
  a one-way drop to any level, ask what happens if one sibling, or both, go over it too early.

## The chapter (`../shared/chapter.js`, `../shared/chaptermap.js`, `../map.html`)

Chapter 1 is the house, then three levels: the park, the city, the canal. `shared/chapter.js` lists them in order
(`CHAPTER.LEVELS`: id, page, the picture for its stop, the names it answers to in a test link, and how to open it
part-way) and keeps what the browser remembers. Each level's page loads it, calls `CHAPTER.note(id, n)` when a new
section is reached and `CHAPTER.mark(id)` when its end card comes up, and its end card leads to `map.html?from=<id>`.
(The house has no sections, so it only calls `mark`.) `shared/chaptermap.js` draws the map. To add a level to a
chapter: one line in `CHAPTER.LEVELS`, those two calls in its level code, its end card's address, and a place for
its stop in `STOP_X` and `STOP_Y` in `shared/chaptermap.js`.

- **A level put in front of older saves.** The house was added on 2026-11-27, in front of levels that players had
  already finished. Its line in `CHAPTER.LEVELS` has `added: true`: a save that has already finished, or started, a
  later level is not sent back to it. On the map such a level is open to play, with no padlock and no tick, and
  `CHAPTER.next()` passes over it.
- **The first stop is always open**, whatever is saved.
- **The test view.** `map.html?unlock=all` makes every level's stop playable (`UNLOCK` in `shared/chaptermap.js`)
  and draws a TEST badge. It changes only what the map shows: it never writes to the save, and it does not show or
  record the chapter's ending. Levels started from it start from their beginning.
- **Test links.** `index.html?level=<name>` opens a level at once: `CHAPTER.find(name)` looks the name up in each
  level's `names` (`house`, `park`, `seesaw` or `city`, `canal`). The rest of the address is passed on.
- **Narrow screens.** The stops, the path and the siblings are drawn smaller when the picture is narrow (`mapK()`),
  so that five stops fit on a phone.

## The start screen (`../index.html`, `../shared/start.js`)

Since 2026-11-27 (approved the same day) `index.html` shows a start screen before the game: the two siblings on a
forest path, drawn with the forest's art (`only:` in its `LOAD`), and one big round play button. A tap, a click or
any key (not M) starts the game. `shared/start.js`, in order, each step giving up quietly if refused:

1. wakes the sound (`wakeSound()` and a chime from `shared/sound.js`);
2. on a touch screen (`(pointer: coarse)`) whose browser allows full screen (`FS.can`: the Fullscreen API, or
   Safari's `webkit` names), asks for full screen for the whole page;
3. then asks for the screen to be held sideways (`screen.orientation.lock('landscape')`);
4. goes on: **for now** to `map.html?unlock=all`, the map with every level open (`OPEN_ALL_LEVELS = true` at the
   top of `shared/start.js`, for the trials with the client; `index.html#normal` ignores it). With it set to `false`:
   `house.html` the first time, `map.html` once a game has been started.

The start uses `click`, not `pointerdown`: a phone only counts a touch as the player's own, and so only allows full
screen, once the finger is lifted. (The first version used `pointerdown` and never went full screen on a phone.) The
loading cover (`#load`) on every page lets taps through (`pointer-events: none`), so that a tap in the first second
is not lost.

**Home screen.** `manifest.webmanifest` and `icon.png` (with the `apple-mobile-web-app-*` tags in `index.html` and
`map.html`) let the game be added to a phone's home screen, from where it opens without the browser's bar
(`"display": "fullscreen"`, held sideways). On an iPhone this is the only way to play without the bar.

**Why a frame.** Browsers leave full screen whenever a new page opens, and every level is its own page. So when full
screen is used (`USE_FRAME`), `index.html` stays open and the game opens inside it, in an iframe that fills the screen
(`#game`, with `allow="fullscreen; autoplay"`). The levels and the map do not know: they change pages inside the
frame as before. On a computer, an iPhone or any browser without full screen, `index.html` simply goes on to the next
page, and nothing else changes.

**The full-screen button.** The map says when it is showing (`postMessage({ map: true })` at the end of
`shared/chaptermap.js`; the frame asks again after every page change). When the map is showing and the page is not in
full screen, the start page shows a small button (`#fs`, top left, 44 by 44 pixels) over it; a tap asks for full
screen again. It is the start page's own button, so the tap counts as the player's tap there.

`index.html` with anything after `?` (the test links, the park's options) skips the start screen. `index.html#frame`
uses the frame on a computer too, for testing.

## The city (`city/`)

**Level 2** of Chapter 1, the see-saw level, approved on 2026-11-25: a row of eight stations that each bring one idea
(jumping and carrying, the heavy crate, a box as a step, the see-saw, small boats and a ferry, the pulley lift, the
toss, two levers at once). It was built on 2026-11-21 as a test level, "the city lab", which is why its main file is
`lab.js`; the lab and Level 2 are the same thing. How it was built is told in [city/LAB_PLAN.md](city/LAB_PLAN.md)
(historical). The level that was here before, with road crossings and the metro, is kept at the git tag
`checkpoint-2026-11-20-city-music`.

| File | What it holds |
|---|---|
| `settings.js` | The street (buildings, lamps, stalls, where the water is) and the `STATIONS`: every object, one line each. |
| `lab.js` | Runs the level: builds the stations, the camera, the hints (`HINTS`), the end card. |
| `street.js` | Draws the scenery: sky, skyline, buildings, pavement, the side street, canal and river, pigeons, leaves. |
| `things.js` | The city's own objects: the three lamps, the puppy, the fountain, the bell game, water jets, parasols, the bridge. |

The art folders: `assets/background/` (the far skyline), `ground/` (pavement, road, cobbles, canal stone),
`buildings/` (the fronts along the street; the flour mill is `warehouse.png` with see-through holes, and
`courtyard.png` shows through them), `street/` (lamps and other street things; only the lamp is placed now),
`market/` (the stalls), `water/` (the bridge deck and hut are used; the ferry is now drawn by code), `park/` (the
Forest Park gate), and `vehicles/`, `metro/` (cars, bus, trains: not used by the lab, kept for later).

### Placing objects

Open `city/settings.js` and find `STATIONS`. Each station has a list called `things`; each line in it places one
object. `x` is the place along the street (the screen is 1080 units tall; a station is about 1200 to 1400 wide),
`h` the height above the pavement. Add a line, refresh the page, and it is there.

```js
{ kind: 'box', x: 5230 },                                  // a light box on the pavement
{ kind: 'ledge', look: 'shelf', x: [1560, 1760], h: 255 }, // a shelf 255 up, from 1560 to 1760
{ kind: 'plate', id: 'mill', big: true, x: 4350 },         // a big green plate called "mill"
{ kind: 'gate', x: 4700, by: ['mill'] },                   // a shutter that is open while "mill" is pressed
```

A plate or a lever has a name (`id`); a gate, a ferry, a trapdoor or a parasol lists the names it listens to (`by`).
A gate that listens to two names opens only while both are on. That is all the wiring there is.

For scale: a jump rises about 207; he is about 180 tall and she about 220; she reaches about 280 up, he about 220,
and about 390 from her shoulders; a toss sends him about 500 up. `city.html?debug=1` shows what is solid and which
names are on.

| Kind | Settings | What it is |
|---|---|---|
| `block` | `x: [from, to], h, look: 'stone'/'wall'/'boards'` | Solid: a step, a wall. |
| `ledge` | `x: [from, to], h, look: 'shelf'/'balcony'` | Can be stood on, and jumped up through from below. |
| `box`, `crate` | `x, h` | The light box (plain wood: either carries it) and the heavy crate (green bands: only she does). |
| `bar` | `x` | A height bar. People walk under; a box on a head is knocked off. Ends a station that has boxes. |
| `plate` | `x, id, big` | Small and blue: anybody or any box presses it. `big: true`, green: only she or the crate. |
| `gate` | `x, h, by: [ids], latch` | A shutter open while everything in `by` is on. `latch: true` stays open once up. |
| `lever` | `x, h, id, hold, once, who, base` | `hold`: on only while grab is held. `once`: stays on. `who: 'bro'`: only his small hand. Above 230 only she reaches it. |
| `seesaw` | `x, half, blue: 'left'/'right'` | Her landing on the high (green) end sends him up from the blue end. |
| `pulley` | `a, b, high, bias, gear, catch, rope: {x, h}` | The lift: two platforms on one rope, the heavier goes down. Holding the rope pulls with the holder's weight. |
| `plank`, `branch`, `boat` | `x: [from, to], h` / `x` | Blue, for light feet: they give way under her or the crate, and come back after a few seconds. |
| `ferry` | `x: [dock, dock], by, home` | A raft that crosses while its name is on. |
| `ladder` | `x, h` | Rolled up on a ledge; used from up there it drops, and then jump climbs it. |
| `trap` | `x: [from, to], h, by` | A shelf that swings open and drops what is on it. |
| `tunnel` | `x: [from, to], h, gap` | A low way through that only he fits. |
| `sticker` | `x, h, icon, ride, when` | An extra to collect. `ride: true` can be taken from her shoulders. Not placed anywhere since 2026-11-24. |
| `find`, `puppy`, `fountain`, `striker`, `jet`, `parasol`, `bridge` | see `things.js` | The city's own: a lamp to switch on (it was a piece of a torn map until 2026-11-25), the puppy, the fountain, the bell game, a water jet, a parasol, the bridge. |

The colour language is built into the kit: green things are the sister's job (heavy or high), blue things the
brother's (light or small), plain wood is for either.

How the moves feel (jump height, running speed, the toss, the see-saw) is `MOVE` at the top of `shared/movement.js`;
`city.html?tune=1` has sliders for it. When hints appear is `HINT_TIMES` in `city/settings.js`.
## The house (`house/`)

| Kind | Files in `house/assets/` |
|---|---|
| Repeating tiles | `wallpaper-kitchen.png`, `wallpaper-living.png`, `wallpaper-bedroom.png`, `wallpaper-study.png`, `floorboards.png`, `outside-brick.png`, `roof-tiles.png`, `foundation-stone.png` |
| Kitchen | `fridge.png`, `kitchen-counter.png`, `kitchen-shelf.png`, `window-kitchen.png` |
| Hall and dining | `dining-table.png`, `chair.png`, `treasure-map.png`, `family-portrait.png`, `wall-clock.png`, `rug-hall.png`, `coat-rack.png`, `front-door.png`, `front-door-frame.png`, `door-mat.png` |
| Stairs | `stairs.png`, `stair-railing.png`, `cupboard-closed.png`, `cupboard-inside.png` |
| Kids' bedroom | `bed-sister.png`, `bed-brother.png`, `toy-chest.png`, `kids-shelf.png`, `rug-bedroom.png`, `forest-painting.png`, `window-bedroom.png` |
| Dad's study | `tall-bookcase.png`, `desk.png`, `armchair.png`, `floor-lamp.png`, `world-map.png`, `window-study.png` |
| Spare | `house-plant.png` (made but not placed yet) |

The **windows**, **front door frame** and **roof window** have see-through glass: the game paints the city behind them.
Keep the glass transparent in replacement art. The **cupboard** pictures must keep their exact shape, because they fit
under the stairs (the outline is `CUP` in `house/generate.js`). Room layout and furniture positions are in
`house/settings.js`. The clouds and bushes outside the house are borrowed from the forest.

Drawn by code in `house/level.js`: the city outside, Dad's box, the key, the chalk code, the light bulb and the darkness
in the cupboard, the chimney smoke, and the map and note pop-ups.

## The forest (`forest/`)

| Folder | What it holds |
|---|---|
| `sky/` | Clouds |
| `mountains/` | Far mountain ranges |
| `trees/` | Every tree: the huge ones near the camera, ordinary, blossom, autumn and pine trees, and far pines |
| `plants/` | Bushes, grass, flowers, mushrooms, ferns |
| `rocks/`, `props/` | Rocks; the signpost, fence and logs |
| `waterfall/` | The waterfall cliff and the bank in front of it |
| `foreground/` | Plants right in front of the camera |
| `ground/` | Grass and path textures |
| `effects/` | Fog, light dapple, shade |

When the forest art loads, the game adds pale haze to far-away things and darkens and slightly blurs the foreground,
so draw replacements clean and in full colour. Those effects are set in `forest/settings.js`.

## Repainting and testing (the `tools` folder)

These need the small local server: run `python tools/dev_server.py` in the `game` folder, then open the addresses below
at `http://127.0.0.1:8780/`.

- `tools/export.html?world=city` (or `house`, `forest`) paints that world's pictures again from its `generate.js`.
  It **overwrites the PNGs and the manifest**, so do not run it after you have put your own art in, unless you want the
  originals back. `?world=characters` redoes the character reference pictures.
- `tools/sheet.html?world=city` shows all of a world's pictures on one page, and `tools/snap-city.html?station=...`
  sends a picture of the game to the server log (used for checking without a browser window); `tools/snap-house.html`
  and `tools/snap-forest.html` do the same for the house and the forest. Add `&run=...` with a line of JavaScript
  to set the scene up first.
- `tools/playtest-house.html?skip=1` plays the house from start to finish with simulated key presses and reports
  PLAY PASSED or PLAY FAILED.
- `tools/playtest-park.html` plays Level 1 with both siblings (just under two minutes), checks that the keys are
  shown one move at a time in section 1 and that there is no sticker, dog or ball, and reports the time each section took; `?section=4` starts it at section 4. `tools/playtest-park.html?solo=1` lets one sibling try every puzzle
  alone and passes when no short cut works. Run both after changing a section. `tools/snap-park.html?section=...`
  sends a picture of the park to the server log.
- `tools/playtest-canal.html` plays Level 3 (about a minute and three quarters) and reports the time each section took;
  `?solo=1` tries every short cut with one sibling alone (45 checks). `tools/snap-canal.html?section=...` sends a
  picture. `tools/playtest-chapter.html` checks the chapter: what `index.html` opens, the map's stops, the save,
  saves from before the house was added, the test view and the test links (70 checks).
  `tools/snap-map.html?done=house,park` sends a picture of the map in a chosen state (`&unlock=all` for the test
  view).
- `tools/playtest-city.html` does the same for the city (all eight stations, about three minutes) and reports the time
  each station took. `tools/playtest-city.html?solo=1` is the other test: it tries the ways one sibling might finish a
  station alone, and passes when none of them works. Run both after changing a station.
- `tools/playtest-start.html` checks the start screen (25 checks): it shows and waits, saves nothing, a key or a
  click goes on to the house or the map, M does not start the game, every test link skips it, and the full-screen
  frame (`#frame`) still works when full screen is refused, with its button showing on the map only.
- `tools/check-fullscreen.mjs` checks full screen with real taps, driving Edge or Chrome from outside (a script inside
  a page cannot ask for full screen). Needs Node 22 or newer and the dev server: `node tools/check-fullscreen.mjs 844
  390` (a phone held sideways), `390 844`, `1024 768`, `1920 1080 desktop`, `844 390 iphone`. It taps with a finger
  (touch down, then lift), so it catches full screen being asked for too early. Headless browsers refuse full screen
  to every page, so there it uses a stand-in that also needs a real tap; it cannot show what a real phone does.
- `tools/check-characters.html` reports a fingerprint of the two characters as the house and the forest draw them. It
  must stay the same after a change to `shared/characters/` or `shared/stage.js`.
- The pages take options for jumping ahead: the house has `?stage=cupboard`, `bulb`, `lock`, `door`, `open` and `end`;
  the city has `?station=0` to `7`; the park has `?section=1` to `6`.
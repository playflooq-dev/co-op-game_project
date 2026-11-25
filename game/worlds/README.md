# The worlds

Each place in the game is a **world** with its own folder. A world can be changed without touching the others.

| Folder | Chapter | Page |
|---|---|---|
| `house/` | Chapter One, "Home Alone" | `index.html` |
| `city/` | Chapter Two, "Across the City" | `city.html` |
| `forest/` | The Forest Trail (the next chapter will be built here) | `forest.html` |

Every world folder has the same parts:

| File | What it is |
|---|---|
| `assets/` | The world's pictures, one PNG per item, in sub-folders. |
| `assets/manifest.js` | The list of those pictures: size and ground point of each one. |
| `settings.js` | The numbers you may want to change: where things are, how fast things move, timings, and what the siblings say. Change a number, refresh, and see it. |
| `level.js` (`scene.js` for the forest) | The code that runs the world. |
| `play.js` (city only) | The things to play with in that world: see "The city" below. |
| `generate.js` | The drawing code that painted the PNGs. The game does not use it; see "Repainting" below. |

What all worlds share is in `../shared/`:

- `shared/characters/`: the sister (`sister.js`) and the brother (`brother.js`), drawn live by code because they walk,
  blink and change expression, plus `shared.js` (legs, faces, expressions). The `*-preview.png` files are only pictures
  for reference.
- `shared/stage.js`: the play code every chapter uses (controls, speech bubbles, hints, the goal card).
- `shared/sound.js`: the sounds and the music. A world that loads it can call `sfx('name')` for a sound and
  `musicArea('name')` to say which piece of music fits where the players are.
- `shared/sounds/`: recorded sound effects (Kenney, CC0; see `CREDITS.txt` there). The `SAMPLES` list in
  `shared/sound.js` says which files each sound uses and how loud. Sounds without files there are made by code.

## Music

Every world plays music files from its own `assets/music/` folder, listed in `MUSIC_FILES` at the end of its
`settings.js` with a volume each. All of them are CC0 (free, no credit needed); `CREDITS.txt` in each music folder
says where each came from.

| Where | Piece | File |
|---|---|---|
| The house | `home` | `house/assets/music/apple-cider.mp3` ("Apple Cider") |
| City streets | `street` | `city/assets/music/quaint-town.mp3` ("Quaint Town") |
| The metro | `under` | `city/assets/music/hot-springs-town.mp3` ("Hot Springs Town") |
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

## The city (`city/`)

| Folder | What it holds |
|---|---|
| `assets/background/` | The far skyline, in two layers that move at different speeds. |
| `assets/ground/` | Repeating textures: pavement, road, market cobbles, the stone of the canal walls. |
| `assets/buildings/` | The building fronts along the street, the flour mill (`warehouse.png`, with see-through holes for the shutter and the arch), the yard behind it (`courtyard.png`) and the yard gate. |
| `assets/street/` | Lamps, benches, bins, postbox, hydrant, planters, bus shelter, bus stop sign, route board, traffic lights, the crossing button, the roadworks. |
| `assets/market/` | The fruit, flower and fish stalls, and crates. |
| `assets/vehicles/` | The cars (seen from the front, coming out of side streets) and the bus (seen from the side; its windows are see-through so the siblings show inside). |
| `assets/water/` | The canal ferry and its buttons, the lift bridge, the bridge control hut and the power switch post. |
| `assets/park/` | The Forest Park gate. |
| `assets/metro/` | The metro entrance, the "street closed" sign, the trains (blue and green line), the station wall tiles and pillars. |

`settings.js` holds where every building and prop stands along the street, and one block of numbers for each puzzle:
where the torn map pieces land, the yard, how fast and shy the puppy is and which stalls it hides under, the boats and
the ferry, Fountain Square and the bell game, the metro lines and train timings, Old Town (`OLDTOWN`: the picture game,
the ladder on wheels and its water jets, the parasols), the bus numbers and places, the bridge.
It also holds the list of stickers (`STICKERS`), the pictures used for the map pieces and the bridge code (`SYMBOLS`),
when hints unlock (`HINT_TIMES`), where the bunting, cobbles and pigeons are, how the sky changes towards sunset, and
the things the siblings say on the way. `fillStreet()` lines up buildings along a stretch of street automatically.

Two things change every game: which bus number goes where, and which four pictures are on the map pieces (they are
the code for the bridge controls).

The code is in two files. `level.js` runs the level: the street, the traffic, the metro, the goals and their hints
(`GOALS`), and the list of everything the siblings can use (`THINGS`). `play.js` holds the things to play with: the
boost (she lifts him up), stickers, the puppy, the canal boats, the fountain and the bell game, the metro piano, the bus
request box, the bridge controls, the hints and the treasure map, and the three Old Town puzzles (picture game, ladder on
wheels and water jets, parasols).

Drawn by code, not pictures: the sky, the side street and the water running into the distance, the roll-up shutter and
its chain, the traffic light colours and the green and red man, the buttons, the map pieces and their little pictures,
the puppy, the pigeons, the bunting, the little boats and the mooring post, the fountain, the bell game, the piano,
the easels and their paintings, the prize box, the water jets, the ladder on wheels, the parasols, the bus request box, the bridge control panel, the station platform and the inside of the train, the station name
boards, the route map, the metro map, the treasure map, and the words on the bus and the trains.

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
- `tools/sheet.html?world=city` shows all of a world's pictures on one page, and `tools/snap-city.html?stage=...`
  sends a picture of the game to the server log (used for checking without a browser window); `tools/snap-house.html`
  and `tools/snap-forest.html` do the same for the house and the forest. Add `&run=...` with a
  line of JavaScript to set the scene up first.
- `tools/playtest-house.html?skip=1` and `tools/playtest-city.html?skip=1` play a chapter from start to finish with
  simulated key presses and report PLAY PASSED or PLAY FAILED (the city one takes a few minutes).
- Every chapter page takes `?stage=...` to jump ahead for checking: the city has `pieces`, `crossing`, `alley`, `yard`,
  `market`, `canal`, `square`, `metro`, `platform`, `ride`, `oldtown`, `cart`, `parasols`, `bus`, `bridge`, `code`, `lower` and `end`; the house has `cupboard`, `bulb`, `lock`, `door`, `open` and `end`.

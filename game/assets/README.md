# Forest Trail assets

All the art the game uses lives in this folder. Change a file here, refresh the game, and you see the change.

## What is in each folder

| Folder | What it holds | Files |
|---|---|---|
| `sky/` | Clouds | `cloud-1..3.png` |
| `mountains/` | Far mountain ranges | `back-1..4.png`, `front-1..4.png` |
| `trees/` | Every tree | `big-tree-1..3.png` (the huge ones near the camera), `tree-1..6.png`, `blossom-tree-1..2.png`, `autumn-tree-1..2.png`, `pine-1..3.png`, `far-pine-back-1..5.png`, `far-pine-front-1..5.png` |
| `plants/` | Small plants | `bush-1..6.png`, `grass-1..5.png`, `flowers-1..7.png`, `mushrooms-1..2.png`, `fern-1..2.png` |
| `rocks/` | Rocks | `rock-1..4.png` |
| `props/` | Man-made things | `signpost.png`, `fence.png`, `log-1..2.png` |
| `waterfall/` | The waterfall landmark | `cliff-and-bridge.png` (behind the water), `front-bank.png` (rocks, lily pads and reeds in front of it) |
| `foreground/` | Plants right in front of the camera | `fern-1..2.png`, `leaves-1..2.png`, `poppies.png`, `rock.png` |
| `ground/` | Repeating ground textures | `grass-texture.png`, `path-texture.png` |
| `effects/` | Soft light and mist | `fog.png`, `light-dapple.png`, `shade.png` |
| `characters/` | The two characters | see "Characters" below |

`manifest.js` is the list of every forest image, with its size and ground point.

### The house (Chapter One)

`house/` holds the art for the house level, with its own list in `house/manifest.js`:

| Kind | Files |
|---|---|
| Repeating tiles | `wallpaper-kitchen.png`, `wallpaper-living.png`, `wallpaper-bedroom.png`, `wallpaper-study.png`, `floorboards.png`, `outside-brick.png`, `roof-tiles.png`, `foundation-stone.png` |
| Kitchen | `fridge.png`, `kitchen-counter.png`, `kitchen-shelf.png`, `window-kitchen.png` |
| Hall and dining | `dining-table.png`, `chair.png`, `treasure-map.png`, `family-portrait.png`, `wall-clock.png`, `rug-hall.png`, `coat-rack.png`, `front-door.png`, `front-door-frame.png`, `door-mat.png` |
| Stairs | `stairs.png`, `stair-railing.png`, `cupboard-closed.png`, `cupboard-inside.png` |
| Kids' bedroom | `bed-sister.png`, `bed-brother.png`, `toy-chest.png`, `kids-shelf.png`, `rug-bedroom.png`, `forest-painting.png`, `window-bedroom.png` |
| Dad's study | `tall-bookcase.png`, `desk.png`, `armchair.png`, `floor-lamp.png`, `world-map.png`, `window-study.png` |
| Spare | `house-plant.png` (made but not placed yet) |

The **windows**, **front door frame** and **roof window** have see-through glass: the game paints the city
behind them. Keep the glass transparent in replacement art.

The **cupboard** pictures must keep their exact shape, because they fit under the stairs. The stairs rise 460 units
over 440 units, and the cupboard's outline is in `tools/generate-house.js` (look for `CUP`).

Drawn by code in `js/house.js`, not image files: the city skyline outside, Dad's box, the key, the chalk code, the light bulb and the darkness in the
cupboard, the chimney smoke, and the chat bubbles, goal card and map and note pop-ups.

## Replacing an image

1. Make your new image as a **PNG with a transparent background**.
2. Keep the **same proportions** (width : height) as the file you are replacing. Any resolution works; the game stretches it to the right size.
3. Keep the **ground in the same place** inside the picture. For example, in `tree-1.png` the base of the trunk sits near the bottom middle, with a little empty space under it.
4. Save it over the old file with the **same name**, then refresh the game.

If your art has different proportions, or its ground point is somewhere else, the numbers for that file in `manifest.js` need to change:
`w` and `h` are the size it is drawn at, and `ax`, `ay` say where the ground point is, measured from the image's top-left corner.
All four are in scene units, where the whole screen is 1080 units tall.

## Adding more variety

The game picks at random inside each group. To add a seventh tree, save `trees/tree-7.png` and add one line for it
to the `trees` group in `manifest.js`. Removing a line removes that variant.

## What the game adds for you

Draw your art clean and in full colour. When the game loads it, it adds:

- pale haze on far-away trees and on the waterfall cliff, so they sit back in the distance;
- darkening and a slight blur on everything in `foreground/`, so it looks close to the camera.

These settings are in `js/loader.js` under `DEPTH`.

## Characters

The characters are not pictures. They are drawn live by code, because they walk, blink and change expression:

- `characters/hooded-traveller.js`: the sister's look and colours.
- `characters/lantern-bearer.js`: the brother's look and colours (the file kept its old name; he no longer carries a lantern).
- `characters/shared.js`: legs, faces and expressions that both share.
- `characters/*-preview.png`: reference pictures only. The game does not load them.

Colours are the `#rrggbb` values near the top of each drawing function, so recolouring is a small edit.
Replacing a character with your own drawn art is possible, but it needs the character supplied as separate parts
(head, body, each arm and leg, and the face pieces) so the game can still animate it.

## Not image files

A few things are drawn by code in `js/scene.js` because they move or stretch: the sky colours, the grass and path shapes,
the falling water, sun rays, birds, butterflies and falling leaves.

## The `tools` folder

The PNGs here were painted by code in `tools/generate-assets.js` (forest) and `tools/generate-house.js` (house).
Opening `tools/export.html` through `python tools/dev_server.py` paints the forest art again, and
`tools/export.html?set=house` paints the house art again. Both **overwrite the images and the manifest**,
so do not run them after you have put your own art in, unless you want the originals back.

`tools/playtest.html?skip=1` (also through the dev server) plays Chapter One from start to finish with
simulated key presses and reports PLAY PASSED or PLAY FAILED, which is a quick check after changes.

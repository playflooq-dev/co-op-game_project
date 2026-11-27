# Project status

*Last updated: 2026-11-27.* One page on where the game is. Everything here is checked against the game itself.

## Where the game is now

**Chapter 1 is approved and playable**, now with the house in front of it (approved 2026-11-27). It is a 2-player co-op puzzle game in a warm storybook style, for parents
playing with children of about 5 to 10, two children together, or one player controlling both characters. The two
characters are an older sister (tall, strong, heavy; green) and a younger brother (small, light; blue). Every puzzle
needs both of them. Nobody can lose or get stuck, and in the three levels below nothing needs reading (the house is
the exception: see below).

Chapter 1 starts in the house and goes on with three levels in the city, which take a little over 20 minutes (the
house has not been timed):

| Level | Place | What players learn | Length |
|---|---|---|---|
| 1 | The park | How to move (the keys are shown as pictures, one move at a time), then four very small puzzles: a plate that opens a gate, a box that holds the plate, the sister lifting the brother, two plates at once | about 5 minutes |
| 2 | The city, to the Old Bridge | Eight short stations, each with one idea: carrying, the heavy crate, a box as a step, the see-saw, small boats and a ferry, a pulley lift, the toss, two levers at once | about 10 minutes |
| 3 | The canal | Thin planks and small boats that hold only the brother, combined with what the first two levels taught. It ends the chapter at the Old Bridge, with the forest ahead | about 8 minutes |

**In front of them (approved 2026-11-27):**

- **The house comes first.** The picture map has the house, "Home Alone", as its first stop, before the park:
  house, park, city (the see-saw level), canal, and then the forest, which stays locked. New players start at the
  house, and the park opens when they leave it. Players who had already finished levels keep everything: they are
  not sent back, and the house is simply open for them to play.
- **The house itself was not changed.** It is the oldest level and still has no jumping, a code to work out, and
  words that must be read. Because it is now the first thing players see, it has to be reviewed before release
  ([OPEN_QUESTIONS.md](OPEN_QUESTIONS.md), "The house comes first").
- **Test links**, so that any level can be opened at once without playing up to it. They are listed under "How to
  play it" below.

**Tap to play (approved 2026-11-27; on the web at https://tap-to-play.forest-trail-d56.pages.dev).** The game now opens with a start
screen: the sister and the brother on a forest path, and one big round play button, with no words. On an Android
phone or tablet, or an iPad, the tap also switches the game to full screen, held sideways; if players leave full
screen, a small button on the map brings it back. An iPhone does not allow full screen for web pages, so there the
game simply starts, with the browser bar still showing; added to the home screen ("Add to Home Screen" in Safari), it
opens without the bar. On a computer the button only starts the game. **For the trials with the client, the play
button opens the map with every level open**, so any level can be chosen; this is a switch to turn off before release.

Between the levels is a **picture map** of the city: finished levels get a tick, the next one is marked, and any
finished level can be played again. The game **remembers progress** on the device (no account, no personal data).

It runs in a web browser on a computer (two players on one keyboard), and on a tablet or phone held sideways (touch
buttons for each player).

## How to play it

- **On the web:** https://map-house.forest-trail-d56.pages.dev (the approved version as of 2026-11-27). The older
  address https://chapter-1.forest-trail-d56.pages.dev still shows the version of 2026-11-25, without the house on
  the map.
- **From the project folder:** double-click `game/index.html`. No installation, no internet needed.
- **Test links** (players never see them). Add the ending to the web address above,
  or to the address of `game/index.html`:

  | Link | What it does |
  |---|---|
  | `index.html?unlock=all` | The map with every level open to play, and a small TEST badge. The forest stays locked. It saves nothing. |
  | `index.html?level=house` | Straight into the house |
  | `index.html?level=park` | Straight into Level 1, the park |
  | `index.html?level=seesaw` | Straight into Level 2, the see-saw level (the city) |
  | `index.html?level=canal` | Straight into Level 3, the canal |
  | `index.html?reset=1` | The map as a new player sees it: everything remembered is forgotten |
- The controls and everything else a player needs are in [game/README.txt](game/README.txt).

## What has been checked, and what has not

- **Checked by script:** each level is played from start to finish by a test that presses the keys, at computer,
  tablet and phone sizes; a second test tries every short cut with one sibling alone and confirms that no puzzle can
  be solved by one player. All of these pass.
- **Checked by hand:** the chapter has been played through on a computer, and the problems found that way were fixed.
- **The map with the house, and the test links (2026-11-27):** checked by script (70 checks: a new player, each
  level unlocking the next, older saves, the test view saving nothing, every test link) and by pictures at computer,
  tablet and phone sizes. Not yet played by hand.
- **Tap to play (2026-11-27):** checked by script on a computer pretending to be a phone (upright and sideways), a
  tablet, an iPhone and a computer, with real taps. Full screen itself could not be shown: browsers without a
  window refuse it, so a stand-in was used. Not yet tried on a real Android phone, iPhone or iPad.
- **Not checked yet:** children of 5 to 10 playing it; a real tablet or phone; one person playing both characters;
  the sound, by ear. The lengths above are estimates until real players are timed.

## What is next

Nothing is scheduled yet. The open points, in a sensible order:

1. **Watch real players** (children with a parent, two children) and time them. This will show whether the levels are
   the right difficulty and length.
2. **Small decisions left in the three levels**, for example a cat sitting on a box that has to be picked up, and
   that Levels 2 and 3 both end at the same bridge.
3. **The house, now the first level.** It has to be reviewed against the rules the other levels follow (nothing
   needs reading, jumping, one small idea at a time), and rebuilt or simplified if it does not fit.
4. **The story.** What the siblings are looking for, and how that is shown without words, is open.
5. **Chapter 2, the forest.** The look is approved; the levels are not designed yet.
6. **Releasing it:** how the game is paid for, where it is published, and which version the main web address shows.

All of these are written out in [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md).

## The other documents

| Document | What it is |
|---|---|
| [DECISIONS.md](DECISIONS.md) | Everything that is approved, with dates, and the older decisions it replaced |
| [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) | Everything still to decide |
| [PROGRESSION.md](PROGRESSION.md) | The rules for how levels get harder, and how each level measures up |
| [CHECKPOINTS.md](CHECKPOINTS.md) | Saved versions of the game that can be gone back to, and every change so far |
| [game/README.txt](game/README.txt) | How to open and play the game, the controls, and the options for testing |
| [game/worlds/README.md](game/worlds/README.md) | For whoever changes the game: how each level is put together, and how to change art and objects |
| [CLAUDE.md](CLAUDE.md) | The standing rules for work sessions on this project |

## How it is built (in one paragraph)

A plain web page per level, with no installation and no build step: opening the HTML file is enough. The characters
are drawn by code so that they can move and change expression; the scenery is one picture file per item, so any piece
can be replaced. Music and sound effects are free recordings (CC0). Each level has its own folder; what levels share
(the characters, the movement, the puzzle objects, the chapter map) is in one shared folder. The code is on GitHub at
`playflooq-dev/co-op-game_project`.

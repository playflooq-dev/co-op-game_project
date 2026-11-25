# Project status

*Last updated: 2026-11-25.* One page on where the game is. Everything here is checked against the game itself.

## Where the game is now

**Chapter 1 is approved and playable.** It is a 2-player co-op puzzle game in a warm storybook style, for parents
playing with children of about 5 to 10, two children together, or one player controlling both characters. The two
characters are an older sister (tall, strong, heavy; green) and a younger brother (small, light; blue). Every puzzle
needs both of them. Nothing in the game needs reading, and nobody can lose or get stuck.

Chapter 1 has three levels, all in the city, and takes a little over 20 minutes:

| Level | Place | What players learn | Length |
|---|---|---|---|
| 1 | The park | How to move (the keys are shown as pictures, one move at a time), then four very small puzzles: a plate that opens a gate, a box that holds the plate, the sister lifting the brother, two plates at once | about 5 minutes |
| 2 | The city, to the Old Bridge | Eight short stations, each with one idea: carrying, the heavy crate, a box as a step, the see-saw, small boats and a ferry, a pulley lift, the toss, two levers at once | about 10 minutes |
| 3 | The canal | Thin planks and small boats that hold only the brother, combined with what the first two levels taught. It ends the chapter at the Old Bridge, with the forest ahead | about 8 minutes |

Between the levels is a **picture map** of the city: finished levels get a tick, the next one is marked, and any
finished level can be played again. The game **remembers progress** on the device (no account, no personal data).

It runs in a web browser on a computer (two players on one keyboard), and on a tablet or phone held sideways (touch
buttons for each player).

## How to play it

- **On the web:** https://chapter-1.forest-trail-d56.pages.dev (the approved version as of 2026-11-25).
- **From the project folder:** double-click `game/index.html`. No installation, no internet needed.
- The controls and everything else a player needs are in [game/README.txt](game/README.txt).

## What has been checked, and what has not

- **Checked by script:** each level is played from start to finish by a test that presses the keys, at computer,
  tablet and phone sizes; a second test tries every short cut with one sibling alone and confirms that no puzzle can
  be solved by one player. All of these pass.
- **Checked by hand:** the chapter has been played through on a computer, and the problems found that way were fixed.
- **Not checked yet:** children of 5 to 10 playing it; a real tablet or phone; one person playing both characters;
  the sound, by ear. The lengths above are estimates until real players are timed.

## What is next

Nothing is scheduled yet. The open points, in a sensible order:

1. **Watch real players** (children with a parent, two children) and time them. This will show whether the levels are
   the right difficulty and length.
2. **Small decisions left in the three levels**, for example a cat sitting on a box that has to be picked up, and
   that Levels 2 and 3 both end at the same bridge.
3. **The story.** The game now starts in the park; how the story begins, and what the siblings are looking for, is
   open. So is the future of the old house level.
4. **Chapter 2, the forest.** The look is approved; the levels are not designed yet.
5. **Releasing it:** how the game is paid for, where it is published, and which version the main web address shows.

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

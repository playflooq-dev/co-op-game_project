# Open Questions & Concepts

Things still to decide. When one is agreed, move it to [DECISIONS.md](DECISIONS.md) and
delete it here. Options marked *(suggested)* are only suggestions and not approved.

## 1. Theme and characters
The look and the two characters are decided (see [DECISIONS.md](DECISIONS.md), decisions 6 to 9).
Still open:
- Names and personalities for the hooded traveller and the lantern bearer.
- Is there a story, or just a series of puzzles?

## 2. How the game looks and moves
- **Top-down grid** (one tile per step, like a board) *(suggested)*: calm, suits thinking
  puzzles, and is easy to keep in sync online.
- **Side view with jumping** (like Fireboy and Watergirl): more action and timing, but harder
  to build and to sync online.
- The approved art is a 2D side-on scene (decision 6). Whether puzzles are played in that side
  view, and whether there is jumping, is still to decide.

## 3. Split abilities: what can each player do?
- Walk on different surfaces (light/shadow, fire/water)
- One is strong (pushes or carries things), the other is small (fits through gaps)
- One can jump or fly, the other can build bridges or move platforms
- One controls the world (rotates rooms, flips switches), the other walks through it
- Should the abilities stay the same for the whole game, or grow and change?

## 4. Split information: what is hidden, and from whom?
- Each player can't see their own traps, but the partner can.
- Guide and walker: one sees the full map, the other moves through fog.
- Codes and symbols: one player sees the clue, the other has the lock.
- Timing: one player sees when platforms or doors will change.
- Should both players have the same amount of hidden information, or should one be the main
  "guide"?

## 5. Communication
- Will players mostly talk by voice (in the same room or on a call)?
- In-game tools: pings (click a spot to highlight it), emotes, quick messages, text chat?

## 6. Failing and difficulty
- What happens on a mistake: full level restart, checkpoint, or a gentler penalty?
- Should each level teach one new idea before combining them?
- Hints for when players are stuck?

## 7. Scope and platforms
- How many levels in the first playable version? (Maybe 5–10.)
- Online only, or also two players on one computer?
- Desktop browser only, or phones/tablets too?
- How do players find each other: room code, invite link, or both?

## 8. Technology (decide after the design)
- Browser game (TypeScript + small Node.js server) *(suggested)*, or a game engine such as
  Godot or Unity?
- Where to host the server so friends can join from anywhere?

## Reference: research so far
Games worth looking at for ideas:
- **Split information:** Keep Talking and Nobody Explodes, We Were Here
- **Split abilities:** Fireboy and Watergirl (browser), It Takes Two, Split Fiction, Unravel Two
- **Both players needed:** Portal 2 co-op, Isoflat (browser)

Design lessons from the research:
- Deciding who knows what, and when, is the main tool for making players talk.
- Different roles let players with different skill levels enjoy playing together.
- Design for exactly two players from the start rather than adding co-op later.

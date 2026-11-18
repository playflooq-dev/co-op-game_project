# Open Questions & Concepts

Things still to decide. When one is agreed, move it to [DECISIONS.md](DECISIONS.md) and
delete it here. Options marked *(suggested)* are only suggestions and not approved.

## 1. Theme and characters
The look, the characters (an older sister and a younger brother) and how the story starts are decided
(see [DECISIONS.md](DECISIONS.md), decisions 6 to 13). Still open:
- The siblings' names. In the game they are called "Sister" and "Brother" for now.
- Where the hunt goes after the city and the forest (the map shows a waterfall and an old oak), and what the treasure is.

## 1b. Chapter Two (the city): waiting for feedback
Playable in `game/city.html`, aimed at 15 to 20 minutes. In order:
0. **The torn map**: the wind tears the treasure map. One piece lands high on a shop awning (only the sister reaches),
   one in a drain (only the brother's fingers fit), one in a planter.
1. **Maple Street crossing**: press the button, wait for the green man, cross before the cars come back.
2. **Baker's Alley**: the pavement is closed, so one sibling holds the shutter button for the other; the brother crawls
   under the courtyard gate and opens it from the other side.
3. **The market puppy**: a puppy has the last map piece and is faster than both; it only stops when one sibling is
   close on each side of it.
4. **The canal ferry**: a button on each side sends the ferry across; nobody can press one from the ferry, so it takes
   a send, a return and a call to get both over.
5. **Grand Avenue**: two roads with an island; the button is broken, so they read the lights and cross one road at a time.
6. **The metro**: the street is closed, so they go underground. The wall map shows the way: Blue line towards Harbour,
   change at Central, Green line to Old Town. Wrong trains take them to wrong stations, and the end of a line throws
   everyone off.
7. **The bus in Old Town**: a route map with tangled lines shows which bus goes to the Old Bridge (shuffled every game).
8. **The Old Bridge**: the sister switches the power on high up; the brother crawls into the control hut to lower it.

Still open:
- **Length.** The scripted test plays it in about 5 minutes with instant decisions (and one wrong train and one wrong
  bus on purpose). First-time players reading, exploring and working out each puzzle should take around three times as
  long, which is in the 15 to 20 minute range, but this needs a real play test to confirm.
- Should a car bump stay gentle (back to the kerb), or cost more?
- Should the siblings meet people in the city (shopkeepers, a crossing warden)?

## 2. How the game looks and moves
- **Top-down grid** (one tile per step, like a board) *(suggested)*: calm, suits thinking
  puzzles, and is easy to keep in sync online.
- **Side view with jumping** (like Fireboy and Watergirl): more action and timing, but harder
  to build and to sync online.
- The approved art is a 2D side-on scene (decision 6), and Level 1 is a side view with no jumping
  (decision 12). Whether later levels keep the same rules is still to decide.
- Level 1 currently runs with both players on one keyboard and one screen, so each can see the
  other's clues. True split information (decision 5) needs the online version, where the box code
  would only appear on the brother's screen.

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

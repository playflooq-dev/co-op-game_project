# Open Questions & Concepts

Things still to decide. When one is agreed, move it to [DECISIONS.md](DECISIONS.md) and
delete it here. Options marked *(suggested)* are only suggestions and not approved.

## 1. Theme and characters
The look, the characters (an older sister and a younger brother) and how the story starts are decided
(see [DECISIONS.md](DECISIONS.md), decisions 6 to 13). Still open:
- The siblings' names. In the game they are called "Sister" and "Brother" for now.
- Where the hunt goes after the city and the forest (the map shows a waterfall and an old oak), and what the treasure is.

## 1b. Chapter Two (the city): rebuilt, waiting for feedback
Playable in `game/city.html`, aimed at 15 to 20 minutes. Rebuilt on 2026-11-19 on decisions 16 to 24. In order:
0. **The torn map**: the wind tears the treasure map. One piece lands on a shop sign (only the sister reaches), one in a
   drain (only the brother's hand fits), one in a window box (too high for both: she lifts him up). Each piece has a
   little picture on it.
1. **Maple Street crossing**: press the button, wait for the green man. The only road crossing left.
2. **The flour mill yard**: the shutter only stays up while the button outside is held. The chain that locks it open is
   inside and high up, so the sister has to go in first. Then the brother crawls under the gate and opens it.
3. **The market puppy**: it has the last map piece and hides under a stall. The sister waits on one side, the brother
   crawls in from the other.
4. **The canal**: the sister holds the rope that pulls the little boats into a line; the brother walks across them and
   sends the ferry back for her.
5. **Fountain Square**: a rest. A fountain to splash in, pigeons, and a bell game the siblings can play against each other.
6. **The metro**: as before (Blue line towards Harbour, change at Central, Green line to Old Town), with shorter waits
   and a piano on the platform.
7. **Old Town** (added 2026-11-19, patterns from Pepelo 2): the bus needs a ticket each.
   - *The picture game*: four paintings are shown and turn round; each sibling stands at the one hiding their picture.
   - *The ladder on wheels*: it only rolls when both push, past three water jets that spout in turn.
   - *The parasols*: the brother winds each one open, the sister steps across them to a ticket on a shop sign.
8. **The bus**: trace the tangled route map, then ask for that bus number at the stop (shuffled every game).
9. **The Old Bridge**: the sister switches the power on; the brother sets the four map pictures on the controls in the
   hut while she reads them from the map; he holds the lever and she holds the brake handle at the same time.

Still open:
- **Is it fun now?** This needs a real play test with two people. The scripted test plays it in under 5 minutes with
  instant decisions and collects all eight stickers.
- **Split screens.** Both players still share one screen, so each can see the other's clues. When the game goes online,
  the map pictures should show only on the sister's screen and the bridge dials only on the brother's.
- **Talking without voice.** Pings ("look here") and picture stickers ("wait", "go", "yes", "no") were recommended by the
  research for the online game. They are not built: on one keyboard the players sit together.
- Music and sounds: recorded CC0 tracks since 2026-11-19 (A New Town, Quaint Town, Hot Springs Town, Magic Town, Fort
  Fairy; Kenney sound effects). Do they suit each place, and are the volumes right?
- Should the siblings meet people in the city (shopkeepers, a ferryman)?

## 2. How the game looks and moves
- **Top-down grid** (one tile per step, like a board) *(suggested)*: calm, suits thinking
  puzzles, and is easy to keep in sync online.
- Decided: a side view with no jumping; the sister can lift the brother up instead (decisions 12 and 17).
- Level 1 currently runs with both players on one keyboard and one screen, so each can see the
  other's clues. True split information (decision 5) needs the online version, where the box code
  would only appear on the brother's screen.

## 3. Split abilities: what can each player do?
- Walk on different surfaces (light/shadow, fire/water)
- One is strong (pushes or carries things), the other is small (fits through gaps)
- One can jump or fly, the other can build bridges or move platforms
- One controls the world (rotates rooms, flips switches), the other walks through it
- Decided: the abilities stay the same for the whole game (decision 16).

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
- Decided: mistakes are gentle and there is no game over (decision 20); hints unlock on the treasure map (decision 19).
- Should each level teach one new idea before combining them? (Chapter Two does: reach, small, then the lift.)

## 7. Scope and platforms
- How many levels in the first playable version? (The research suggests about five chapters of 15 to 20 minutes.)
- Online only, or also two players on one computer?
- Desktop browser only, or phones/tablets too?
- How do players find each other: room code, invite link, or both?

## 8. Technology (decide after the design)
- Browser game (TypeScript + small Node.js server) *(suggested)*, or a game engine such as
  Godot or Unity?
- Where to host the server so friends can join from anywhere?

## Reference: research so far
The full research report is in [reports/Puzzle design in story platformers.md](reports/Puzzle%20design%20in%20story%20platformers.md).
Games worth looking at for ideas:
- **Split information:** Keep Talking and Nobody Explodes, We Were Here
- **Split abilities:** Fireboy and Watergirl (browser), It Takes Two, Split Fiction, Unravel Two
- **Both players needed:** Portal 2 co-op, Isoflat (browser)

Design lessons from the research:
- Deciding who knows what, and when, is the main tool for making players talk.
- Different roles let players with different skill levels enjoy playing together.
- Design for exactly two players from the start rather than adding co-op later.

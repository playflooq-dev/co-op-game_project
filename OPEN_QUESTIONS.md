# Open Questions & Concepts

Things still to decide. When one is agreed, move it to [DECISIONS.md](DECISIONS.md) and
delete it here. Options marked *(suggested)* are only suggestions and not approved.

## 1. Theme and characters
The look, the characters (an older sister and a younger brother) and how the story starts are decided
(see [DECISIONS.md](DECISIONS.md), decisions 6 to 13). Still open:
- The siblings' names. In the game they are called "Sister" and "Brother" for now.
- Where the hunt goes after the city and the forest (the map shows a waterfall and an old oak), and what the treasure is.

## 1b. Chapter Two (the city): the first version
**This level is no longer in `game/city.html`**: since 2026-11-21 that page is the city lab (see 1c). The version
described here is kept at the git tag `checkpoint-2026-11-20-city-music` and on the live site as it was that day.
It was aimed at 15 to 20 minutes and rebuilt on 2026-11-19 on decisions 16 to 24. In order:
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

## 1c. The city lab

Since 2026-11-21 `game/city.html` is no longer the level described in 1b (that one is kept at the git tag
`checkpoint-2026-11-20-city-music`). It is a test level for children of about 5 to 10 playing with a parent or with
each other: eight stations, each one idea. Nothing in it is approved (see "Proposed" in [DECISIONS.md](DECISIONS.md)).
How to open a station, and the controls, are in `game/README.txt`.

**For every station, watch for:** how long it takes; whether they solve it before any hint, after the sparkle (20 s),
the arrow (40 s) or the ghost (60 s); whether both children are busy or one only waits; whether they talk to each
other; and where they laugh. Try each with a parent and a child, two children, and one player alone.

| Station | The idea | What we want to learn |
|---|---|---|
| 0 Maple Street, first half | Jump and carry | Is the jump comfortable at this height (it was lowered once)? Do they find "grab" for the box without being told? Do they understand that the bar with the crossed-out box means boxes stay behind? |
| 0 Maple Street, the torn map | Her reach, his small hand, the lift | Do they see from the green band and the blue drain whose piece is whose? Do they discover the lift by themselves, and how: by accident, or from the two-hands sign? Is pressing grab twice (lift, then take) clear? |
| 1 The flour mill | Plate and gate | Do they connect the big green plate with the heavy green crate, and the lit cable with the shutter? Does a five-year-old understand why standing on the plate herself is not enough? Is the low hatch for him noticed? |
| 2 The market | A box as a step | Do they think of the box before the hint? Is "she stands on the box, then lifts him" one step too many for the youngest? Do they like the puppy, and do they find that it can be petted? |
| 3 Fountain Square | The see-saw | Do they find the see-saw at all with the fountain and the bell game beside it, or do the toys distract (and is that bad)? Is being launched fun or frightening? Does he find the rolled-up ladder? Is "hold jump to climb" found without help? |
| 4 The canal | Light feet only | Is her sinking funny, or does it feel like failing? Do they understand after one try that the blue boats are his? Is the lever on the far bank found, and that it works twice (send, bring back)? Is she bored while he crosses? |
| 5 Old Town | The pulley lift | The hardest station. Do they understand that she must stay on the rope while he rides? That she then stands on the lift while he loads boxes? Is two boxes the right number? How many need the ghost here? |
| 6 The cafe | Boost and toss | Do they use the toss on purpose by now? Is aiming it at the shelf fiddly? Are the parasol steps easy to climb, or do small children fall off and get cross? |
| 7 The Old Bridge | Two levers at once | Do they understand "at the same time", and do they hold on long enough (about three seconds)? Does it feel like an ending? |

**Questions about the whole lab**
- Is the colour language (green hers, blue his, plain wood either) noticed by children, or only by adults?
- Are the picture hints understood? Does the ghost help, or is it mistaken for a third character?
- Are 20, 40 and 60 seconds the right waits? (They are `HINT_TIMES` in `game/worlds/city/settings.js`.)
- Does one player alone, with both hands, manage every station? The bridge and the lift need two keys held at once.
- On a tablet held by two people: are four buttons each reachable, and is the picture big enough?
- (The lab's eight stickers were taken out on 2026-11-24; see "Saved for a later level" below.)
- Is the brother's part as much fun as the sister's? He is carried, tossed and launched; she does more of the lifting.
- The first city level had the siblings talking in speech bubbles. The lab has no words at all. Do we miss their voices?
- If the lab is approved, the house (reading a chalked code, no jumping) no longer fits. Rebuild it the same way?

**Not built in the lab:** the metro ride between stations (cut, it could return as a calm ride with no choices), the
ladder on wheels, split screens and pings for playing online, lighter music files for the web.

## 1d. Level 1: waiting for feedback on difficulty

The park was built on 2026-11-23 (branch `level-1/gentle`) after the client found the city lab far too difficult as
a first level. The client played it and said on 2026-11-24:
- the stickers confuse more than they add (they come back later, once the base game is set);
- the dog and the ball are fun, but too much in the first 15 seconds, while players are still learning the controls;
- because of them the difficulty could not be judged: even this level felt difficult.

Agreed direction: **Level 1 is an extremely plain, simple and intuitive intro**, for somebody who has never seen the
game and does not know how to move. So on 2026-11-24 (branch `level-1/plain`) the stickers, the dog and the ball
were taken out, and the opening became only about learning to move: each player's keys are shown as pictures next to
their own sibling, one move at a time. **The four puzzles and their tuning are unchanged**, so that the client can
now judge their difficulty. Nothing is approved (see "Proposed" in [DECISIONS.md](DECISIONS.md)). The controls and
how to open one section are in `game/README.txt`.

**The question for this round: is it easy enough, and where is it not?** While somebody plays for the first time,
watch for:
- **The first minute.** Do they find their own keys from the pictures next to the siblings? Do they need the ghost
  that shows the move (it comes after four seconds of standing still)? On a tablet: do they see that the pulsing
  button belongs to the picture?
- **Where do they stand still for more than 10 seconds** once the puzzles begin? Note the section, and which hint got
  them going again: the sparkle (10 s), the arrow (20 s) or the ghost (35 s).
- **Does anybody only wait?** Each puzzle is built so that both walk and both do something.

| Section | What we want to learn |
|---|---|
| 1 Learn to move | Is the long plain path welcome, or too long and too empty? Is one move at a time the right pace? Is the jump comfortable? Does it matter that whoever runs ahead is stopped at the edge of the screen? |
| 2 Plate and gate | Do they connect the plate, the lit cable and the gate without help? Does the second one think of the plate on the far side, or does the first stay stuck behind the gate? |
| 3 Box on plate | The one harder step. Do they see that the box can hold the plate? Is the grab key found from its picture at the box, and "the same key puts it down" at the plate? Does the cat on the box help or get in the way? |
| 4 The pond | Do they look for a puzzle here? Is a calm moment after the harder puzzle felt as a rest? |
| 5 The balloon | Do they discover the lift by themselves, from the two-hands sign, or only from the ghost? Is "grab to be lifted, grab again to take it" clear? |
| 6 The way out | Do they understand "both at the same time" at once? Does the confetti and the high five feel like an ending? |

**Waiting for your decision:** [game/worlds/park/REVIEW.md](game/worlds/park/REVIEW.md) lists every thing in the level
that could distract a first-time player, with a recommendation for each. Only what was clearly needed in the opening
was applied. The five to decide first: the cat on the box, the birds inside the two gate puzzles, whether the lift
should stay off until the balloon tree, the edge of the screen stopping whoever runs ahead, and the pond.

**Questions about the whole level**
- How long does it take? The script needs just under two minutes without thinking; my guess for first-time players
  is five to seven minutes.
- Is it too easy for a ten-year-old, and does that matter in a first level?
- Section 3 puts the box behind the gate, so that one sibling cannot do it alone. Is that one step too many for the
  very first box? The simpler version (box and plate on the same side) could be solved by one child.
- Does one player alone, with both hands, manage the level? Only the last plates need both at once.
- Is the end card understood without words (two hands, a clock, an arrow to go on)? Should the time go too?
- After the park the game goes on to the city lab, which is much harder. That jump is known and stays until Level 2
  (the see-saw) is built. For a test of Level 1, stop at the end card.

**Saved for a later level (2026-11-24).** The client found the dog and the ball fun, but too much while players are
still learning the controls, so they are not in Level 1 at all any more. Their code and drawings are kept, unchanged,
in `game/shared/later/dog.js` and `game/shared/later/ball.js`; no page loads them. Each file says at the top how to
put it into a level (one script line and one line of settings). Open: which level gets them back, and whether the
dog should then do something for a puzzle or stay a friend that only tags along. The stickers (taken out of Level 1
the same day, and out of the city lab too) stay in the object kit, `shared/kit.js`, and come back once the base game
is set. Open for then: what collecting is for, and how to show it without it looking like a task.

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

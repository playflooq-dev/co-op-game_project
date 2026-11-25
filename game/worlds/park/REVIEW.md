# Level 1, the park: first-time player review (2026-11-24)

I went through the whole level as somebody who has never seen the game and does not know how to move, and looked at
every thing that is drawn, moves, makes a sound or reacts. For each one: could it distract, look like something to
use, look like a puzzle, or need explaining? And what I recommend: **keep**, **tone down**, **move later** or
**remove**.

**How it was done.** From the code (every object the level places and everything that draws or plays a sound), from
pictures of every stretch of the path at three screen sizes, and from the scripted play-through. Not with real
children: where I write "could", that is a guess to check when the client plays.

**What was applied.** Only what was clearly needed to keep the opening (section 1) plain. Those rows say
**Applied**. Everything else is left as it was, for you to decide; nothing in the puzzles was changed. Each row has a
number, so you can answer with a list ("do 14, 17 and 24").

## The five I would decide first

| # | What | Why it matters for judging difficulty |
|---|---|---|
| 17 | **The cat on the box** (section 3) | It sits on the one thing that has to be picked up, in the hardest puzzle of the level. I recommend taking it off the box. |
| 14, 18 | **The birds inside the two gate puzzles** (sections 2 and 3) | They sit exactly where the second player has to walk, and fly up with a noise. I recommend removing these two flocks and keeping the ones at the pond and at the way out. |
| 9 | **The lift before it is taught** | It is off in section 1 now. In sections 2 to 4 it still works although nobody has been shown it. I recommend keeping it off until the balloon tree. |
| 8 | **The edge of the screen stops whoever runs ahead** | Nothing shows why. With two children this will happen in the first minute. I recommend a small picture that points back to the other sibling. |
| 21 | **The pond** | A place with a hand sign but no task. Children may search it for a puzzle. I recommend keeping it and watching. |

## Everywhere in the level

| # | What it is and where | Could it distract, look usable, look like a puzzle, need explaining? | Recommendation |
|---|---|---|---|
| 1 | **Key pictures next to each sibling** (new): walking keys, then the jump key, later the grab key. On touch screens a copy of the button, and the button itself pulses. | This is the explaining. One move at a time, in the sibling's colour, gone once done. | **Keep.** Watch whether children connect the picture with their own keys. |
| 2 | **Ghost that shows the move** (new): after four seconds of standing still with a key picture showing. | In the city lab a ghost was taken for a third child. This one comes out of the player's own sibling, glitters and fades. | **Keep.** Watch. |
| 3 | **Row of keys at the bottom** (computers only). | It used to show all four keys of both players from the first second, the grab key included. | **Applied:** each part appears only once that player has learned it. |
| 4 | **The M key with a loudspeaker** at the bottom (sound off and on). | The only thing left on the first screen that is not about moving. Small, and nobody needs it. | **Keep.** Could move to a corner. |
| 5 | **Music and footstep, jump and landing sounds.** They start with the first key press or tap. | No. The landing thump and dust puff make jumping feel right. | **Keep.** |
| 6 | **Background**: sky, sun, drifting clouds, the pale town, hills, trees, bushes, rocks, lamps, and flowers that do not move. | Nothing here can be touched and nothing reacts. Some bushes have red berries, which a child could take for something to pick. | **Keep.** |
| 7 | **The siblings' faces**: happy when close, a worried look when far apart, sleepy and yawning after nine seconds of standing still. | A yawn while a child is still thinking, or a worried look at the one who waits, could feel like "hurry up". | **Keep.** Tone down in section 1 if the client feels pushed. |
| 8 | **The edge of the screen.** Both siblings always stay in the picture, so whoever runs ahead is stopped at the edge. The left end of the park also stops them, a little before the edge. | Needs explaining: the sibling just stops and nothing shows why. A first-time player may think the game is stuck. | **Tone down:** when somebody pushes against the edge, show a small picture pointing back to the other one; put a fence or hedge at the left end. Not applied: it is new design, not a removal. |
| 9 | **The lift** (grab while standing next to each other: she takes him on her shoulders). It is taught at the balloon tree, section 5. | Two players trying their keys side by side ended up on each other's shoulders without knowing why or how to get down. | **Applied for section 1:** no lift there. **Move later** for sections 2 to 4 as well (one number, `liftFrom` in `settings.js`): I left those as they were, because discovering the lift early makes the balloon easier and you asked for the puzzles not to change. |
| 10 | **Grab with nothing to grab**: that sibling cheers (a hop, a few sparkles, a sound). Both at once: a high five. | It reacts to a key that has not been shown yet. The sparkles could look like "I found something". | **Keep.** Every key does something friendly. Tone down the sparkles if it confuses. |
| 11 | **The wave**: when the two are apart and standing still, they wave to each other. | Friendly, and it gives the one who waits on a plate something to do. In section 1 it could read as "come here". | **Keep.** |
| 12 | **Picture hints in the puzzles**: a thought bubble with the goal, then a sparkle (10 s), an arrow (20 s), a ghost (35 s). The little hand sign over a head where grab would work. | These are the help. The thought bubble now makes room when a key picture shows over her head. | **Keep.** Unchanged. |

## Section 1: learn to move

| # | What it is and where | Could it distract, look usable, look like a puzzle, need explaining? | Recommendation |
|---|---|---|---|
| 13a | **The path**: a long flat stretch, one very low step, a flat stretch, three low steps up and down, a flat stretch, one low log, a last flat stretch. | No. Nothing to fall off, nothing to solve. Each step needs a jump, so nobody reaches the first puzzle without having walked and jumped. | **Applied** (Step 3). The section is more than a third longer than before. |
| 13b | **The low white fence** that was in the path. | A fourth kind of thing to jump, and a fence says "do not pass". | **Applied: removed** from section 1. Its code stays in `things.js`. |
| 13c | **The puddle.** | Water in a game usually means danger, so a new player may try not to touch it. It also splashed, a reaction that leads nowhere. | **Applied: removed** from section 1. It could come back at the pond (item 21), where splashing belongs. Its code stays. |
| 13d | **Two flocks of birds** in section 1. | They flew up with flapping and chirping exactly when somebody jumped near them: a distraction at the moment of learning to jump. And the brief says nobody else is about. | **Applied: removed** from section 1. |
| 13e | **Three patches of flowers and grass that bounce** when walked through, with a rustle and a puff of petals. | They looked like something had been touched or collected. | **Applied: removed** from section 1. The flowers that do not move are still there, so it looks the same. |
| 13f | **A bench** beside the path. | Right after learning to jump onto low steps, a bench looks like one more thing to jump onto, and it is only a picture. | **Applied: removed** from section 1. |
| 13g | **The log** has leaves and small mushrooms on it. | Could be taken for something to pick. Low risk. | **Keep.** |

## Section 2: plate and gate

| # | What it is and where | Could it distract, look usable, look like a puzzle, need explaining? | Recommendation |
|---|---|---|---|
| 14 | **Two birds** on the grass between the gate and the far plate. | They sit where the second player must go, in the first puzzle anybody meets. They fly up with a noise when approached. A child may think the birds are the point. | **Remove** here (or move to the pond). Not applied. |
| 15 | **The plates, the cable to the gate, the gate's lamps**: a plate glows and sparkles when stood on, the cable lights up, the gate slides up, the siblings cheer. | These are the puzzle and its answer. The cable is the best clue in the level. | **Keep.** |
| 16 | **A patch of bouncing flowers and a bench** after the far plate. | After the puzzle, so no harm. | **Keep.** |

## Section 3: box on plate

| # | What it is and where | Could it distract, look usable, look like a puzzle, need explaining? | Recommendation |
|---|---|---|---|
| 17 | **The cat on the box.** It meows and hops off when the box is picked up, watches, and goes back when the box is left alone. | It sits on the one thing that must be picked up. It may draw the eye to the box (good), or make a child not want to disturb it, or look like the goal. It is also another character in the middle of the hardest puzzle. | **Remove** from the box, or **move later** (a cat on the pond bench would be harmless). Not applied: it is inside a puzzle. |
| 18 | **Two birds** between the gate and the box. | As item 14. | **Remove** here. Not applied. |
| 19 | **The grab key picture** over whoever stands at the box (new), and again at the plate for putting the box down. | This is the first place grab is needed, so it is the first place it is shown. | **Keep.** Watch whether "the same key puts it down" is understood. |
| 20 | **The red and white bar with a crossed-out box**, after the gate. A box carried under it is knocked off. | A sign that needs explaining, and losing the box there is a surprise. But it is past the puzzle, and without it the box could be carried to the balloon tree and used as a step. | **Keep.** If it confuses: a low arch the box visibly does not fit under. |

## Section 4: the pond

| # | What it is and where | Could it distract, look usable, look like a puzzle, need explaining? | Recommendation |
|---|---|---|---|
| 21 | **The pond**: grab anywhere along it makes a splash, the other sibling hops, the ducks swim away quacking. The hand sign shows all along the bank. | A place with a hand sign and no goal picture: children may search it for a puzzle. On the other hand nothing can go wrong, and it is where the second player usually meets the grab key (the first learned it at the box). | **Keep.** Watch. If they search: show the hand sign only near the middle. |
| 22 | **Three ducks, three birds by the bench, two patches of bouncing flowers.** | A calm place between two puzzles is the right place for them. | **Keep.** |

## Section 5: the balloon

| # | What it is and where | Could it distract, look usable, look like a puzzle, need explaining? | Recommendation |
|---|---|---|---|
| 23 | **The red balloon in the tree** with a small twinkle; the thought bubble shows a balloon; a two-hands sign over him when they stand together; the little gate with a red lamp and a red cable from the tree. | These are the puzzle. The red lamp and red cable tie the balloon to the gate. | **Keep.** |
| 24 | **His giggle when lifted, her proud look with a few stars** once he has the balloon; the balloon then floats along on its string. | Rewards, after the deed. | **Keep.** |

## Section 6: the way out, and the end

| # | What it is and where | Could it distract, look usable, look like a puzzle, need explaining? | Recommendation |
|---|---|---|---|
| 25 | **Two plates, the gate with two lamps, confetti, a high five.** | The puzzle and its reward. | **Keep.** |
| 26 | **Three birds** between the last gate and the big arch. | The puzzle is done by then. | **Keep.** |
| 27 | **The big arch says "Forest Park"** in letters (the picture is borrowed from the city). | The only words in the level. Nobody has to read them. | **Keep** for now. Later: an arch with a picture in place of the words. |
| 28 | **The end card**: two hands meeting, a clock with the time, an arrow. | The sticker count is gone (Step 1). A time can read as a score: "be faster next time". | **Keep**, as the brief asks. If the client wants no pressure at all, drop the time as well. |
| 29 | **After the end card the game goes on to the city lab**, which is far harder. | A first-time player falls off a cliff of difficulty there. | Known. It stays until there is a Level 2. For the client's test, stop at the end card. |

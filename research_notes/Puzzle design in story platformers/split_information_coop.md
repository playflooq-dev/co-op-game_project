# Split-Information (Asymmetric) Two-Player Co-op Puzzle Games: Patterns, Examples, Communication, Story

Scope note: these notes cover two-player games where each player sees or knows things the other does not. They are current to November 2026. Release years come from the cited sources. Where a claim rests only on a search-result snippet (the page itself could not be fetched or was truncated), the note says "(snippet)". Read those as lower-confidence.

Games covered, with release years:
- **BOKURA** (Tokoronyori, supported by Kodansha). Steam Early Access 13 Feb 2023, full release 9 Aug 2023. 2D side view, online, two machines. — [Steam](https://store.steampowered.com/app/1801110)
- **BOKURA: planet**, a standalone follow-up. PC (Steam), 25 Apr 2025. — [Automaton West](https://automaton-media.com/en/wp-json/wp/v2/posts/46973)
- **The Past Within** (Rusty Lake). 2 Nov 2022 on Android, iOS, macOS and Windows; Switch 6 Jul 2023. — [Wikipedia](https://en.wikipedia.org/wiki/The_Past_Within)
- **We Were Here** series (Total Mayhem Games):
  - *We Were Here* (2017)
  - *Too* (2018)
  - *Together* (2019)
  - *Forever* (2022 PC; 2023 consoles; the series' first crossplay)
  - *Expeditions: The FriendShip* (14 Sep 2023)
  - *Tomorrow* (scheduled Oct 2026; mixed early Steam reviews)
  - — [Wikipedia](https://en.wikipedia.org/wiki/We_Were_Here_(video_game))
- **Keep Talking and Nobody Explodes**, "KTANE" (Steel Crate Games). Gear VR 2015, then many platforms; non-VR console update 2018; mobile 2019. — [Wikipedia](https://en.wikipedia.org/wiki/Keep_Talking_and_Nobody_Explodes)
- **Tick Tock: A Tale for Two** (itch page under "othertales"). PC, Switch and mobile. — [itch.io](https://othertales.itch.io/tick-tock-a-tale-for-two); [The Escape Roomer](https://theescaperoomer.com/tick-tock-a-tale-for-two/)
- **Operation: Tango** (Clever Plays). Agent and Hacker roles. — [Wikipedia](https://en.wikipedia.org/wiki/Operation:_Tango) (snippet)
- **Eleven Puzzles** games:
  - *Unboxing the Mind of a Cryptic Killer* (2021 original; a web game page exists)
  - *Unboxing the Cryptic Killer* (Steam revamp, reviewed June 2023)
  - *Parallel Experiment* (reviewed June 2025)
  - Each player plays on their own device: PC, Mac, phone or tablet. — [Room Escape Artist](https://roomescapeartist.com/2023/06/19/eleven-puzzles-unboxing-cryptic-killer-hivemind-review/); [Use a Potion](https://www.useapotion.com/2025/06/parallel-experiment-pc-review/); [Eleven Puzzles web games](https://eleven-puzzles-website.pages.dev/web-games/unboxing-the-mind-of-a-cryptic-killer) (snippet)
- **Big Walk** (House House / Panic). 4 Aug 2026, rated Everyone. For 2 to 12 players, with puzzles sized for groups of 2, 3 or 4+. — [Game Informer](https://gameinformer.com/review/big-walk/a-walk-to-remember)
- **Spaceteam** (Henry Smith, mobile). The classic "instructions on your screen, controls on mine" design. — [Wikipedia](https://en.wikipedia.org/wiki/Spaceteam) (snippet)
- **Escape Academy** (2022). A useful counter-example: each player sees the partner's view. — [The Sixth Axis](https://www.thesixthaxis.com/?p=398998) (snippet)
- **Lost in Play** (Happy Juice Games, Aug 2022). It is **single-player**, so it has no split information. It matters only as a sibling-imagination tone reference. — [Wireframe](https://wireframe.raspberrypi.com/articles/dive-into-a-world-of-pure-imagination-with-point-and-click-adventure-lost-in) (snippet)

---

## 1. What kinds of information are split, and what do concrete puzzles look like?

### Takeaway
There are roughly nine recurring ways to split information:
1. **The same world drawn differently** (BOKURA).
2. **The same place at two times** (The Past Within, Tick Tock).
3. **Reference vs. device**, where one player has the "manual" and the other the machine (KTANE, the We Were Here "dictionary" puzzles).
4. **Instructions vs. controls** (Spaceteam).
5. **Overseer vs. runner**, guiding someone through hazards they can't see (FriendShip obstacle course, Big Walk helmet).
6. **Shared board, different tile sets**, where each move limits the partner's options (FriendShip tiles).
7. **Spot-the-difference** across two screens (BOKURA symbol gate).
8. **Story text only one player can read** (BOKURA house dialogue).
9. **Different abilities that reveal different things** (BOKURA's head removal and cloning; Agent/Hacker).

The strongest designs make the split two-way. Each side holds half the answer, rather than one side holding the whole answer.

### Cited Findings

**Design framework (academic)**
- Harris, Hancock and Scott group co-op asymmetries into two kinds:
  - Mechanical asymmetries: **ability, challenge, interface, information, investment, goal/responsibility**.
  - **Directional dependence**: *mirrored*, *unidirectional* or *bidirectional*.
  - — [Frontiers in VR review citing Harris et al.](https://www.frontiersin.org/journals/virtual-reality/articles/10.3389/frvir.2021.694660/pdf) (snippet)
- Their 2015 CHI PLAY study, "Beam Me 'Round, Scotty!", names the characteristic dynamics as directional dependence, synchronicity, necessity, leadership and primacy. A later CHI 2019 paper reports that asymmetric co-op may enhance perceived connectedness, social engagement, immersion and comfort with controls. — [U. Waterloo Touchlab](https://uwaterloo.ca/touchlab/node/19); [UWSpace thesis](https://uwspace.uwaterloo.ca/handle/10012/14710) (snippets)

**BOKURA (2023): the same world, drawn differently**
- Player 1 sees a warm natural world with anthropomorphic animals (a bear and a duck in coats in autumn woods). Player 2 sees a cold, metallic world of robots. — [SUPERJUMP](https://superjumpmagazine.com/bokura-review)
- The developer's own example: one player sees an object as a rope, the other sees a "moveable box". Players must talk to work out what differs, then exchange information to fill the gaps. — [Automaton West interview](https://automaton-media.com/en/wp-json/wp/v2/posts/35252)
- The Steam page says interactive objects "may also move differently for each player". — [Steam](https://store.steampowered.com/app/1801110)
- **Water crossing:** the animal-world player stopped at water, unable to cross without drowning. The robot-world player simply walked across, so each had to guide the other through their own obstacles. — [GameLuster](https://gameluster.com/early-access-review-bokura-sorry-ive-got-no-head/)
- **Head removal:** the robot player can detach their head. Their screen then follows only the head, so the partner had to help guide the headless body across the level. — [GameLuster](https://gameluster.com/early-access-review-bokura-sorry-ive-got-no-head/)
- **Self-cloning:** the animal-side player could clone themselves and control two characters. — [GameLuster](https://gameluster.com/early-access-review-bokura-sorry-ive-got-no-head/)
- **Symbol gate (spot-the-difference):**
  - Nine symbols sit in three rows above buttons, and three presses open the gate.
  - Each row has one symbol that differs between the two screens.
  - The reviewer found it "nearly impossible without describing everything on screen". — [GameLuster](https://gameluster.com/early-access-review-bokura-sorry-ive-got-no-head/)
  - Steam players' advice: go through the symbols one at a time to find the odd one out, then put a box on that button. Symbols used in a previous puzzle are excluded. — [Steam discussion](https://steamcommunity.com/app/1801110/discussions/0/3777994239409722853)
- **Story text only one can read:** only the robot-side friend could enter one house, so she read its dialogue aloud to the partner. — [GameLuster](https://gameluster.com/early-access-review-bokura-sorry-ive-got-no-head/)
- **Split audio:** the soundtrack reportedly differs for each player. — [GameLuster](https://gameluster.com/early-access-review-bokura-sorry-ive-got-no-head/)
- **BOKURA: planet (2025) adds split *objectives*:** each player gets different objectives and stories, which they hide from each other over voice chat. — [Automaton West](https://automaton-media.com/en/wp-json/wp/v2/posts/46973)

**The Past Within (2022): the same place at two times, plus a mechanical box between them**
- Two versions of Rose: 1926 ("The Past") and 1984 ("The Future"). There is no real time travel, only communication. — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/303/the-past-within)
- **Two presentation modes:**
  - 1926 player: a 2D room (locked dresser, closet, coal stove, Albert's coffin), turned in 90-degree steps.
  - 1984 player: a fixed 3D view of a mechanical box they can orbit and zoom.
  - **At the midpoint the styles swap**, which keeps play fresh.
  - — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/303/the-past-within)
- **Box transfer:** items placed in the 1926 box are sent to 1984. The 1984 side has a CRT display. The 1926 side has a paper roll of instructions, e.g. "Person in The Future places black cube in C-9. Communicate code." — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/303/the-past-within)
- **Example puzzles:**
  - One player has a diagram of switch directions and relays it while the other sets the switchboard.
  - Codes and letters are relayed into devices.
  - Players count across the teeth of Albert's corpse to wiggle the right ones in order.
  - — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/303/the-past-within)
- **Symbol relay with feedback:**
  - Past-side symbols are fixed in place (e.g. a stained-glass window). The Future player has the same symbols on the cube and can move them.
  - The Past player says the order. The Future player's resulting feedback then unlocks something in the Past room.
  - — [JumpDashRoll](https://www.jumpdashroll.com/article/the-past-within-review)
- Neither player can see or interact with the other's puzzles. Clues in one period affect puzzles in the other, and Future actions affect the Past. — [Wikipedia](https://en.wikipedia.org/wiki/The_Past_Within)

**Keep Talking and Nobody Explodes (2015): reference vs. device**
- The Defuser sees the bomb but not the manual. Experts have the manual but cannot see the bomb. — [Wikipedia](https://en.wikipedia.org/wiki/Keep_Talking_and_Nobody_Explodes)
- **Bomb structure:**
  - A bomb holds several largely independent modules, some multi-stage.
  - "Needy" modules need periodic attention.
  - Some rules depend on bomb-wide features: serial number, batteries, strikes so far.
  - Experts may need the Defuser to identify which of several maze maps applies.
  - — [Wikipedia](https://en.wikipedia.org/wiki/Keep_Talking_and_Nobody_Explodes)
- **Hard-to-say content by design:** some modules use glyphs that are hard to describe, homophones, verbal tics or common words. — [Wikipedia](https://en.wikipedia.org/wiki/Keep_Talking_and_Nobody_Explodes)
- Ben Kane: both sides need unique, interesting information to exchange. "It starts with balance." — [Game Developer](https://gamedeveloper.com/design/finding-the-fun-in-bomb-defusal-with-i-keep-talking-and-nobody-explodes-i-)

**We Were Here series (2017–2026): separated rooms, walkie-talkie**
- Two players in different rooms who cannot see each other. Each has a walkie-talkie. — [Wikipedia](https://en.wikipedia.org/wiki/We_Were_Here_(video_game))
- Designers describe players "talking each other through puzzles only one of them can see". — [Game Developer, Road to the IGF](https://www.gamedeveloper.com/game-platforms/road-to-the-igf-total-mayhem-games-i-we-were-here-i-)
- **Puzzle families the studio names:** describing symbols, guiding someone through a maze, mimicking sounds, pronouncing silly words. — [Xbox Wire, Jan 2023](https://news.xbox.com/en-us/?p=190237)
- **Forever's creature-sound puzzle:** one player holds the "dictionary". The other mimics sounds to communicate with a creature. — [Xbox Wire](https://news.xbox.com/en-us/?p=190237)
- Some puzzles give one player a "more theoretical role" and the other a "more practical role" (Lucia de Visser). — [Premortem](https://premortem.games/2022/05/31/total-mayhem-games-are-masters-of-the-asymmetrical-puzzler/)
- In Forever, some controls are side-locked: one player can move only the square knobs, the partner only the circle knobs. — [Sirus Gaming guide](https://sirusgaming.com/we-were-here-forever-walkthrough-puzzle-solutions/) (snippet)

**We Were Here Expeditions: The FriendShip (2023): three puzzles, three split types**
- **Puppet (description → action, timed):** in separate rooms, one player describes a wooden puppet's pose and the other works out which button to press. — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/596/we-were-here-expeditions-the-friendship)
- **Tile (shared board, different tile sets):**
  - The players are split by a wall. Each picks from three tiles: one gets solid-coloured tiles, the other patterned tiles in the same colours.
  - They place tiles on their own hex boards, which "connect in a way the players must figure out".
  - Each placement limits the partner's options. Points come from the largest group of each colour.
  - — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/596/we-were-here-expeditions-the-friendship)
- **Trust course (overseer vs. runner):** the runner is "drugged" and can't trust their own vision, so they rely on the overseer's directions. — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/596/we-were-here-expeditions-the-friendship)

**Spaceteam: instructions vs. controls**
- Each player's screen shows a different part of the ship. One player's instructions appear on another's device, so everyone reads their prompt aloud and listens for the one that matches their own controls. — [Wikipedia](https://en.wikipedia.org/wiki/Spaceteam); [Episodic Content Mag](https://episodiccontentmag.com/2016/01/29/everybodyshake2/) (snippets)

**Tick Tock: A Tale for Two: half the picture each**
- Each player sees "half of what you need to see". Story sentences float on screen, and their meaning only becomes clear alongside what the partner sees. — [The Escape Roomer](https://theescaperoomer.com/tick-tock-a-tale-for-two/)
- Puzzles include Morse code, something that looks like Morse but isn't, directional puzzles, a hard pattern puzzle (~20% of playtime) and a time-travel mechanic. — [The Escape Roomer](https://theescaperoomer.com/tick-tock-a-tale-for-two/)

**Eleven Puzzles games: each device holds a subset**
- Players "each see a subset of the information". Some puzzles "require players to coordinate operating on-screen controls". — [Room Escape Artist](https://roomescapeartist.com/2023/06/19/eleven-puzzles-unboxing-cryptic-killer-hivemind-review/)
- Some puzzles can be solved individually but produce information the other player needs. — [Room Escape Artist](https://roomescapeartist.com/2023/06/19/eleven-puzzles-unboxing-cryptic-killer-hivemind-review/)
- Each level ends in a 4-digit lock, with each of four sub-puzzles supplying one digit. — [Room Escape Artist](https://roomescapeartist.com/2023/06/19/eleven-puzzles-unboxing-cryptic-killer-hivemind-review/)
- Parallel Experiment puzzle examples:
  - tricking a parrot into revealing a light pattern
  - an elevator code hidden in paintings
  - mixing cocktails
  - a top-down maze
  - a gear tile puzzle
  - Clues "only make sense when pieced together across both screens". — [Use a Potion](https://www.useapotion.com/2025/06/parallel-experiment-pc-review/)

**Operation: Tango: Agent vs. Hacker**
- "What they see isn't always what you see". — [Clever Plays devlog](https://clever-plays.itch.io/operation-tango/devlog/204773/play-together-apart-in-operationtango)
- A standout puzzle is a multi-tiered bomb that "requires a lot of observation and explanation". — [Gamepressure](https://www.gamepressure.com/editorials/reviews/operation-tango-review-a-stylish-spy-co-op/zb41f) (snippet)

**Big Walk (2026): sensory handicaps instead of separate screens**
- One player wears a giant helmet that muffles their voice and blocks their vision, and teammates shout directions. — [Game Informer](https://gameinformer.com/review/big-walk/a-walk-to-remember)
- Soundproof rooms force nonverbal communication. — [Game Informer](https://gameinformer.com/review/big-walk/a-walk-to-remember)
- Other puzzles:
  - describing pictures so they can be put in order
  - mirroring poses without voice
  - recreating a tune for others to identify
  - symbol blocks answered with nods or head shakes
  - — [Game Informer](https://gameinformer.com/review/big-walk/a-walk-to-remember); [Press Start](https://press-start.com.au/reviews/ps5-reviews/2026/08/03/big-walk-review-the-best-kind-of-lost/) (snippet)

**Counter-example: Escape Academy (2022)**
- In co-op you can see your friend's view on your own screen at all times. So the split becomes a division of labour: one reads the clue, the other works the input. A reviewer called this "screen cheating". — [The Sixth Axis](https://www.thesixthaxis.com/?p=398998); [Digital Trends](https://qa2.www.digitaltrends.com/gaming/escape-academy-review-xbox-pc) (snippets)

**Small online prototypes exploring the same idea**
- *Duality*: top-down, each player sees a different version of a shared world. — [itch.io](https://henriwil.itch.io/duality) (snippet)
- *Split*: each player sees the world slightly differently. — [itch.io](https://jessevlstrs.itch.io/split) (snippet)

### Inferences
- A taxonomy for this game, mapped to the sister/brother pair:
  - **Height-split information:** the sister sees what's on high shelves, rooftops and treetops. The brother sees what's under floors, inside gaps and behind small vents.
  - **Same scene, different reading:** the "rope vs. box" idea, e.g. a city poster that reads as a code to one and a picture to the other.
  - **Map vs. walker:** the treasure map shown on only one screen at a time.
  - **Story text only one can read:** a note found in a gap that the brother reads aloud.
- The Escape Academy counter-example suggests that showing the partner's view, even in a corner, collapses the split. Because each device renders different content, the server can and should withhold the partner's private information.
- The "difference between screens" puzzle is cheap to build in a networked 2D game: render a slightly different sprite per client. But BOKURA players found a nine-symbol version close to impossible. For kids, keep the comparison sets small and the symbols easy to name.

### Gaps
- **It Takes Two (2021) / Split Fiction (2025):** I found no confirmed puzzle where each player's screen shows different *information*. Search summaries describe ability asymmetry and timing puzzles that rely on watching the partner's half of a shared split screen. No specific split-information puzzle could be verified, so the "Hazelight moments" angle remains open.
- **Cyber Agent:** I found no evidence of such a two-player split-information game in the asymmetric co-op searches. **Escape Simulator** co-op and **Unrailed** were not investigated (shared-world co-op).
- I could not fetch puzzle specifics for the original We Were Here (2017) or for We Were Here Too and Together.
- I could not confirm Tick Tock's exact release year or Operation: Tango's release date from fetched pages.

---

## 2. How do games teach "your partner sees something you don't"?

### Takeaway
Games teach the split in one of three ways:
- **Surprise reveal through conversation:** BOKURA hides the split and lets players discover it mid-chat ("what sheep?").
- **Story-justified separation from the first minute:** We Were Here's explorers split up in a castle; The Past Within's 1926/1984 letter-and-box setup.
- **Explicit in-world instructions or a tutorial puzzle:** The Past Within's paper roll literally says "Communicate code"; The FriendShip uses an opening tutorial puzzle; Eleven Puzzles signposts connecting pieces.

### Cited Findings
- **BOKURA's reveal is discovery-based.**
  - The friend first remarked on a "futuristic" look, which the reviewer dismissed.
  - The mismatch became clear mid-dialogue, when the reviewer offered to voice "the sheep character" and the friend asked "what sheep?"
  - — [GameLuster](https://gameluster.com/early-access-review-bokura-sorry-ive-got-no-head/)
- Many BOKURA players report a surprised reaction on first seeing that their worlds differ, even players who never finish. The developer at first hid the concept in marketing, pitching an emotional "two boys running away" story. He revealed it in a video at INDIE Live Expo a few months before launch, which boosted wishlists. — [Automaton West interview](https://automaton-media.com/en/wp-json/wp/v2/posts/35252)
- SUPERJUMP describes no explicit tutorial in BOKURA. The puzzles are simply "easy-to-understand" and built around talking each one through. — [SUPERJUMP](https://superjumpmagazine.com/bokura-review)
- **Story-justified separation:** in the We Were Here premise, two explorers are separated in a mysterious castle with a walkie-talkie as their only tool. — [Premortem](https://premortem.games/2022/05/31/total-mayhem-games-are-masters-of-the-asymmetrical-puzzler/)
- In IGF framing, one player is trapped in a hidden part of the castle while the other searches the halls. — [Game Developer](https://www.gamedeveloper.com/game-platforms/road-to-the-igf-total-mayhem-games-i-we-were-here-i-)
- **The Past Within:** Albert's letter tells 1926 Rose he built a device to contact the future. The paper roll gives literal instructions such as "Person in The Future places black cube in C-9. Communicate code." — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/303/the-past-within)
- **The FriendShip:** an opening puzzle serves as a tutorial, and "no prior knowledge is needed". — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/596/we-were-here-expeditions-the-friendship)
- **Unboxing the Cryptic Killer:** reviewers praised "clear signposting of connecting pieces", meaning the game shows which elements link across screens. — [Room Escape Artist](https://roomescapeartist.com/2023/06/19/eleven-puzzles-unboxing-cryptic-killer-hivemind-review/)

### Inferences
- For a family audience, combine the BOKURA-style "wow, you see something different" moment with a gentle explicit nudge. Example: the house's first locked door shows a number pad to one sibling and the matching note to the other, and a grown-up line in the story says "Tell your brother what you see."
- Make the first reveal low-stakes and funny (the "what sheep?" pattern) rather than a hard puzzle.

### Gaps
- I found no source describing KTANE's first-bomb tutorial or how its manual introduces the Expert role. I found no developer statement on how The Past Within's onboarding was tested.

---

## 3. How do the puzzles escalate?

### Takeaway
Escalation levers seen across these games:
- **More steps**, e.g. multi-stage modules and four sub-puzzles feeding one lock.
- **Role reversal and then alternation** (The FriendShip puppet: rounds 1–5 one describer, 6–10 reversed, 11–15 alternating every step).
- **Shrinking timers.**
- **Removing a sense:** fixed paths, then moving platforms, then fake bridges, then obstacles the runner can't see at all.
- **Presentation swaps mid-game** (The Past Within).
- **New abilities** that change how levels are approached (BOKURA).
- **Adaptive pressure** that adds disruptions only when players are doing well (KTANE).

### Cited Findings
- **FriendShip puppet puzzle:**
  - Up to 15 rounds, with less time each round.
  - Rounds 1–5 have one describer, 6–10 reverse roles, 11–15 alternate every step.
  - — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/596/we-were-here-expeditions-the-friendship)
- **FriendShip trust course:** plank paths and lighthouse buttons first, then drop-away and moving platforms, then fake bridges, and finally obstacles the runner can't see at all (total reliance on the overseer). — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/596/we-were-here-expeditions-the-friendship)
- **KTANE adaptive pacing:**
  - A hidden pacing system tracks how well players are doing. When they do well it adds disruptions (an unexpected alarm, the lights going out).
  - The aim is to avoid a "death spiral" while still producing close finishes.
  - — [Game Developer](https://gamedeveloper.com/design/finding-the-fun-in-bomb-defusal-with-i-keep-talking-and-nobody-explodes-i-)
- KTANE's predefined levels set module count, time limit and strike limit by skill group. Distractions include flickering lights and alarm clocks. Many modules are multi-stage, and needy modules interrupt. — [Wikipedia](https://en.wikipedia.org/wiki/Keep_Talking_and_Nobody_Explodes)
- **BOKURA:** difficulty "builds steadily, and new abilities keep changing how each level is approached". Most levels balance input, but the final level breaks that balance. — [GameLuster](https://gameluster.com/early-access-review-bokura-sorry-ive-got-no-head/)
- SUPERJUMP calls BOKURA's challenges "increasingly complex" and says a solution was never far away. — [SUPERJUMP](https://superjumpmagazine.com/bokura-review)
- **The Past Within** has no clear difficulty curve. The puzzles grow stranger rather than harder, and the midpoint swap of 2D/3D roles keeps them from feeling repetitive. — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/303/the-past-within)
- **Two-way exchange as escalation (The Past Within):** the Past player gives an order, the Future player enters it, and the Future feedback unlocks the next Past step. — [JumpDashRoll](https://www.jumpdashroll.com/article/the-past-within-review)
- **Many-to-one aggregation (Eleven Puzzles):** each level's 4-digit lock gathers one digit from each of four sub-puzzles. — [Room Escape Artist](https://roomescapeartist.com/2023/06/19/eleven-puzzles-unboxing-cryptic-killer-hivemind-review/)
- **Big Walk:** solving the small "gourd" puzzles unlocks secondary puzzles. Completing those reveals new island features that recontextualise existing areas. — [Game Informer](https://gameinformer.com/review/big-walk/a-walk-to-remember)

### Inferences
- A natural three-act curve for house → city → forest:
  - **House:** one-way relays (sister reads, brother acts).
  - **City:** reversals (brother reads, sister acts) and then two-way exchanges, where each holds half a code.
  - **Forest (waterfall/oak):** simultaneous or timed coordination and an "overseer guides a walker who can't see" finale.
- Adaptive pressure (KTANE) is a gentler alternative to hard timers for kids. Add a playful complication only when the pair is cruising, rather than punishing slow pairs.

### Gaps
- I found no published difficulty curves or playtest metrics, such as solve times per puzzle, from any of these studios.

---

## 4. How do they keep both players active (avoid "one reads, one does everything")?

### Takeaway
Developers name balance as the hardest problem. The working techniques are:
- Give **both** sides unique information (not reader + doer).
- **Swap roles mid-puzzle or mid-game.**
- Use **shared boards where each move constrains the partner.**
- Add **side-locked controls**, so each player physically operates part of the device.
- Have **individually solvable sub-puzzles whose output feeds the other player.**

Failures documented: one player waiting while the other searches; one-sided final levels; puzzles one player can brute-force alone.

### Cited Findings
- **We Were Here:** balance was the hardest problem. Stressing both players while keeping puzzles difficult "resulted in some less action-packed moments for one of the players". — [Game Developer, Road to the IGF](https://www.gamedeveloper.com/game-platforms/road-to-the-igf-total-mayhem-games-i-we-were-here-i-)
- Total Mayhem designs puzzles to need input from both players. — [Premortem](https://premortem.games/2022/05/31/total-mayhem-games-are-masters-of-the-asymmetrical-puzzler/)
- Their rule: "if it doesn't get you talking, whispering, laughing or yelling then it shouldn't be in our games." Players should get stuck only when they fail to cooperate, not because a puzzle is unclear. — [Xbox Wire](https://news.xbox.com/en-us/?p=190237)
- **KTANE:** "It starts with balance". Both sides need unique, interesting information. Each role has a distinct job, so neither player is idle. — [Game Developer](https://gamedeveloper.com/design/finding-the-fun-in-bomb-defusal-with-i-keep-talking-and-nobody-explodes-i-)
- **Role swaps:**
  - FriendShip puppet: rounds 6–10 reverse roles, rounds 11–15 alternate every step. — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/596/we-were-here-expeditions-the-friendship)
  - We Were Here Forever: at one point players can swap sides and tackle a device in the other role. — [PC Gamer](https://pcgamer.com/so-far-co-op-puzzle-game-we-were-here-forever-is-the-best-in-the-series) (snippet)
  - Forever's 100% achievements require playing both sides of every asymmetric puzzle, which means two playthroughs with swapped roles. — [Sirus Gaming](https://sirusgaming.com/we-were-here-forever-walkthrough-puzzle-solutions/) (snippet)
- **Constraining moves:** in the FriendShip tile puzzle, each placement limits the partner's options. — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/596/we-were-here-expeditions-the-friendship)
- **Side-locked controls:** in Forever, only square knobs can be moved by you and circle knobs by your partner. — [Sirus Gaming](https://sirusgaming.com/we-were-here-forever-walkthrough-puzzle-solutions/) (snippet)
- **Joint input (Eleven Puzzles):** some puzzles need both players operating on-screen controls together. Individually solvable puzzles produce information for the other. — [Room Escape Artist](https://roomescapeartist.com/2023/06/19/eleven-puzzles-unboxing-cryptic-killer-hivemind-review/)
- **Failure cases:**
  - *The Past Within* "sometimes drags when one player waits for the other to find clues". — [JumpDashRoll](https://www.jumpdashroll.com/article/the-past-within-review)
  - Some Past Within puzzles "can be brute-forced by one player". — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/303/the-past-within)
  - BOKURA's final level kept one player's head parked on a button while the partner guided her body. It took ~2 hours of a 7-hour run and left her "with little control". — [GameLuster](https://gameluster.com/early-access-review-bokura-sorry-ive-got-no-head/)
- **Abilities plus information:** in BOKURA, both players move and act. The split is world-appearance *plus* different traversal (one drowns in water the other walks across), so each guides the other. — [GameLuster](https://gameluster.com/early-access-review-bokura-sorry-ive-got-no-head/)
- **Spaceteam:** everyone both reads instructions *and* operates controls, because instructions land on the wrong player's screen. — [Wikipedia](https://en.wikipedia.org/wiki/Spaceteam) (snippet)
- **Escape Academy** shows the opposite: with shared visibility, players settle into one reading clues and the other working inputs ("screen cheating"). — [The Sixth Axis](https://www.thesixthaxis.com/?p=398998) (snippet)

### Inferences
- For siblings with different abilities, pair **ability asymmetry with information asymmetry in opposite directions**. The sister can *see* the high code but only the brother can *reach* the keypad in the vent, and vice versa. Neither is ever just a reader.
- Build in a Spaceteam-style crossover: the instruction for the sister's lever appears on the brother's screen.
- Avoid BOKURA's long one-player-parked finale. If one sibling must hold a switch, give them a parallel task, e.g. spotting hazards for the other.
- Each puzzle should have at least one action on each side, or the reading side should get a small decision (choose which of three clues to share).

### Gaps
- No source quantified how often players complain about idle time, or how studios measured idle time in playtests.

---

## 5. How do they handle quiet players, kids, different skill levels? What communication tools exist?

### Takeaway
Most split-information games **ship no in-game communication at all**: BOKURA, The Past Within, Tick Tock and the Eleven Puzzles games all assume an outside call. The We Were Here games use an in-game, one-at-a-time walkie-talkie as a deliberate constraint. Richer tool sets are rare:
- Big Walk: proximity voice, radios, whiteboards, gestures.
- Eleven Puzzles: a "draw-on" feature and a hint lightbulb.
- Escape Academy: pinned clues.

Kids can enjoy the "reader bosses the doer" dynamic (KTANE). But verbal-heavy puzzles defeat young children (a BOKURA parent with an elementary-school child found it too hard).

### Cited Findings

**Communication tools**
- **BOKURA** has no built-in communication. The Steam page tells players to use another method, such as a call. — [Steam](https://store.steampowered.com/app/1801110)
- **The Past Within** players talk by voice chat, in the same room, or by phone. The official Discord can match players without a partner. It needs no internet connection. — [JumpDashRoll](https://www.jumpdashroll.com/article/the-past-within-review); [Wikipedia](https://en.wikipedia.org/wiki/The_Past_Within)
- **Eleven Puzzles:** a separate voice channel (phone/Discord) is required. The game has autosave and a "draw-on" feature, and laptop + Android cross-device sync "worked flawlessly". — [Room Escape Artist](https://roomescapeartist.com/2023/06/19/eleven-puzzles-unboxing-cryptic-killer-hivemind-review/)
- An Eleven Puzzles hint is a lightbulb icon with a confirmation screen before the hint appears. — [Review the Room](https://www.reviewtheroom.co.uk/?p=4040) (snippet)
- **We Were Here: The FriendShip:** in-game radios with push-to-talk, but only one person can speak at a time. The reviewer used third-party voice chat instead. — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/596/we-were-here-expeditions-the-friendship)
- A walkie-talkie that works on a "one talks, one listens" basis. — [Xbox Tavern](https://www.xboxtavern.com/we-were-here-expeditions-the-friendship-review) (snippet)
- A We Were Here Forever review lists "walkie-talkies get to be tiresome" as a downside. — [The Sixth Axis](https://www.thesixthaxis.com/?p=437414) (snippet)
- Total Mayhem prototyped with real walkie-talkies and people in locked rooms before writing code. — [Game Developer](https://www.gamedeveloper.com/game-platforms/road-to-the-igf-total-mayhem-games-i-we-were-here-i-)
- They also locked testers in separate classrooms with winter coats and walkie-talkies. — [GamesRadar](https://www.gamesradar.com/how-a-team-of-dutch-escape-artists-is-charting-its-future-by-tackling-the-mayhem-in-its-past) (snippet)
- **Big Walk (2026):**
  - Proximity voice chat whose volume drops with distance. — [Game Informer](https://gameinformer.com/review/big-walk/a-walk-to-remember)
  - It echoes in tunnels and cuts out when players wander too far. — [Press Start](https://press-start.com.au/reviews/ps5-reviews/2026/08/03/big-walk-review-the-best-kind-of-lost/) (snippet)
  - Walkie-talkies and radios for distance; whiteboards as a nonverbal tool ("really clever" but less effective than radios); gestures such as raising arms, pointing and waving. — [Game Informer](https://gameinformer.com/review/big-walk/a-walk-to-remember)
  - The review mentions no text chat, pings or emotes. — [Game Informer](https://gameinformer.com/review/big-walk/a-walk-to-remember)
  - Players reportedly found the voice chat too quiet, with no separate volume slider. — [Vaporlens summary](https://vaporlens.app/app/1478500/big_walk) (snippet; aggregator)
- **Escape Academy:** players can pin a clue to the screen, which makes cipher puzzles easier to share without paper. — search summary of reviews (snippet; see [Digital Trends](https://qa2.www.digitaltrends.com/gaming/escape-academy-review-xbox-pc))
- **Operation: Tango** requires voice. Its accessibility tags list colour-blind friendly, subtitles and configurable controls. — [Wikipedia](https://en.wikipedia.org/wiki/Operation:_Tango) (snippet); [Clever Plays devlog](https://clever-plays.itch.io/operation-tango/devlog/204773/play-together-apart-in-operationtango)
- **KTANE:** the manual is free to view or print at bombmanual.com in multiple languages, so any extra person can join as an Expert. — [KTANE press kit](https://keeptalkinggame.com/press-kit-mobile) (snippet); [bombmanual.com](https://www.bombmanual.com/print/KeepTalkingAndNobodyExplodes-BombDefusalManual-v1.pdf)

**Kids, families and skill gaps**
- **KTANE:** kids enjoyed "bossing" their parents around, and parents enjoyed playing with their kids, which widened the audience. — [Game Developer](https://gamedeveloper.com/design/finding-the-fun-in-bomb-defusal-with-i-keep-talking-and-nobody-explodes-i-)
- KTANE uses simple, deliberate inputs so the challenge is decisions, not dexterity, and failures feel like the team's conversation mistakes rather than personal ones. — [Game Developer](https://gamedeveloper.com/design/finding-the-fun-in-bomb-defusal-with-i-keep-talking-and-nobody-explodes-i-)
- **BOKURA:**
  - Some challenges can only be solved by sharing thoughts and reaching agreement, which is hard for players who struggle to put things into words.
  - A parent playing with an elementary-school child found it too hard.
  - — [Automaton West interview](https://automaton-media.com/en/wp-json/wp/v2/posts/35252)
- **The FriendShip:** only the first puppet round is required. Later failures just end that section, with a bronze/silver/gold ticket, so less patient players can move on. — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/596/we-were-here-expeditions-the-friendship)
- Reviewers call The FriendShip's puzzles "more accessible" than the main series. — search summary (snippet; see [OpenCritic](https://opencritic.com/game/15514/we-were-here-expeditions-the-friendship/user-reviews))
- **Skill differences:** in Parallel Experiment, the partner breezed through a maze while the reviewer handled a gear puzzle that stumped the partner, so varied puzzle types share out "expertise". — [Use a Potion](https://www.useapotion.com/2025/06/parallel-experiment-pc-review/)
- **KTANE ambiguity:** the font made a capital O look like zero, so capital Os were removed from serials. A wire rule failed to say whether "second" counted from the top or the bottom. Kane: "The rules have to be totally unambiguous." — [Game Developer](https://gamedeveloper.com/design/finding-the-fun-in-bomb-defusal-with-i-keep-talking-and-nobody-explodes-i-)

### Inferences
- A browser game can't assume Discord, especially for kids, so build communication in:
  - **Pings** (tap to place a marker that appears on the partner's screen *in their version of the world*).
  - A small set of **picture emotes / stickers** (star, arrow, question mark, "wait", "yes/no").
  - A shared **sketch pad** that is a story object (the sister's notebook).
  - Optional voice.
- Big Walk and The FriendShip show that limited channels (one-at-a-time radio, whiteboard, gestures) can themselves be puzzles. For kids, keep this as a light flavour rather than a hard rule.
- Design symbols to be *nameable*: a fox, a key, a moon, not abstract glyphs. Avoid look-alike pairs (O/0, b/d).
- Make spatial words unambiguous across the two views. A shared side view helps, because "left" and "right" agree.
- Offer an opt-out or medal structure like The FriendShip's, so a mismatched pair can finish the story.

### Gaps
- I found no source on how any of these games handles non-speaking or deaf players. I found no text-chat, ping or emote system in the split-information games, and no studio statement on designing for children specifically (beyond KTANE's anecdote).

---

## 6. How do they randomise answers so players can't look them up or replay from memory?

### Takeaway
Approaches range from none (BOKURA, a fixed design with community walkthroughs) to:
- **Path variants chosen at the start** (The Past Within's Bee/Butterfly changes the solutions).
- **Randomised puzzle values per playthrough** (some We Were Here Forever challenges).
- **Procedural generation against a fixed rulebook** (KTANE: the manual is static and public, but each bomb's modules and serial/battery details are generated, so answers differ each time).
- **Score-attack replay** (The FriendShip medals).

KTANE's weakness is that experts eventually memorise the rules.

### Cited Findings
- **KTANE:** bombs are procedurally generated. The final game's defusal rules are static, although a framework exists for mixing rules in future versions. — [Wikipedia](https://en.wikipedia.org/wiki/Keep_Talking_and_Nobody_Explodes)
- KTANE's rules depend on per-bomb features (serial number, batteries, strikes), so the same manual gives different answers on each bomb. — [Wikipedia](https://en.wikipedia.org/wiki/Keep_Talking_and_Nobody_Explodes)
- A player argues the game eventually becomes too easy once experts learn the rules. — [Steam discussion](https://steamcommunity.com/app/341800/discussions/0/451850020337793863) (snippet; player opinion)
- Ars Technica noted that some modules become a chore once learned. — [Wikipedia](https://en.wikipedia.org/wiki/Keep_Talking_and_Nobody_Explodes)
- **The Past Within:** at the start, players choose Butterfly or Bee. This changes the puzzle solutions, so a second run is different, and players swap Past/Future roles on the replay. — [JumpDashRoll](https://www.jumpdashroll.com/article/the-past-within-review)
- Another reviewer says the Bee/Butterfly choice changes the patterns but not the narrative or puzzle types, and felt little urge to replay. — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/303/the-past-within)
- Pocket Gamer criticised its replay value. — [Wikipedia](https://en.wikipedia.org/wiki/The_Past_Within)
- **We Were Here Forever:** a walkthrough notes some challenges are randomised and its screenshots are examples, not solutions. — [Steamah](https://steamah.com/?p=86847) (snippet)
- **The FriendShip:** replay is through bronze/silver/gold tickets. Players can shred a ticket to replay a section for a better result. — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/596/we-were-here-expeditions-the-friendship)
- Wikipedia describes The FriendShip as adding replayable puzzles with medals and being less narrative-focused. — [Wikipedia](https://en.wikipedia.org/wiki/We_Were_Here_(video_game))
- **BOKURA:** solutions are shared openly in community threads (e.g. the symbol-gate fix), which suggests fixed solutions. — [Steam discussion](https://steamcommunity.com/app/1801110/discussions/0/3777994239409722853)

### Inferences
- In a networked browser game, the server can generate per-session values from a seed and send each client only its half:
  - door codes
  - which symbol differs
  - which shelf holds the key
  - the order of lanterns
- This gives KTANE-style "same rule, new answer" without any extra art.
- A combination fits a story game: **fixed puzzle logic** (so the story beats stay authored) with **randomised values** (so walkthroughs give the method, not the answer).
- Role swap on replay (The Past Within) is less available here, because the sister and brother have different bodies. A replay could instead randomise which sibling receives which half of each clue.

### Gaps
- No source explains how We Were Here's randomisation is seeded or which puzzles randomise. No developer statement explains why BOKURA or Rusty Lake chose fixed or two-variant solutions.

---

## 7. How is split information used for story?

### Takeaway
The split is usually *justified by* the story:
- separated explorers
- two timelines connected by a device
- two boys whose shared trauma splits their perception

It is sometimes *used as* story: text only one player can read, each player's world mirroring their character, hidden personal objectives, and moral choices the pair must agree on. Critics often praise the mechanic but call the plot thin, which suggests the split carries more of the emotional weight than the cutscenes do.

### Cited Findings

**BOKURA**
- Two childhood friends from different backgrounds plan to run away and blow up the mayor's statue with fireworks. They find a dead deer, pass out, and wake in an alternate universe where their views of the world split. — [GameLuster](https://gameluster.com/early-access-review-bokura-sorry-ive-got-no-head/); [SUPERJUMP](https://superjumpmagazine.com/bokura-review)
- The story later turns dark. The reviewer's (animal) side becomes gory, e.g. a head pulled from a spine. — [GameLuster](https://gameluster.com/early-access-review-bokura-sorry-ive-got-no-head/)
- Critical choices lead the journey in different directions. — [Steam](https://store.steampowered.com/app/1801110)
- Screen text "Who would you choose? Dad/Mom." appears on the robotic landscape. — [SUPERJUMP](https://superjumpmagazine.com/bokura-review)
- The developer's aim: players enjoy the game, then are "forced to make difficult moral decisions". — [Automaton West interview](https://automaton-media.com/en/wp-json/wp/v2/posts/35252)
- Steam's tagline idea: even though what you see and experience is "the same", you can never understand how the other feels. — [search summary of Steam listing](https://store.steampowered.com/app/1801110) (snippet)
- The marketing hid the mechanic and sold the "Stand By Me"-style runaway story first. — [Automaton West interview](https://automaton-media.com/en/wp-json/wp/v2/posts/35252)

**BOKURA: planet**
- Players get different objectives and stories that they hide from each other. Players can push each other off cliffs at any time. The developer wants players to "fight even more" and says hidden tensions surfacing is "like a story unfolding before you". — [Automaton West](https://automaton-media.com/en/wp-json/wp/v2/posts/46973)
- In the original, close friends grew frustrated when they had to follow the partner's orders. — [Automaton West](https://automaton-media.com/en/wp-json/wp/v2/posts/46973)

**The Past Within**
- The two timelines are the plot:
  - Albert Vanderboom's letter tells 1926 Rose his death may be reversible.
  - The Past player prepares the room and later gathers flesh, blood and bone from his corpse.
  - These are sent through the box to the Future for his rebirth.
  - — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/303/the-past-within); [JumpDashRoll](https://www.jumpdashroll.com/article/the-past-within-review)
- Its art splits warm 1926 colours from cool 1984 blues and greys. — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/303/the-past-within)
- Criticisms: the narrative is thin, the dual-time concept is underused, and the ending is confusing. — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/303/the-past-within)
- The plot isn't compelling without series lore, and talking with a partner reduces Rusty Lake's usual solitary eeriness. — [JumpDashRoll](https://www.jumpdashroll.com/article/the-past-within-review)

**We Were Here**
- The story came after the prototype proved fun: a dark castle in a snowy area, inspired partly by the real Castle Rock in Antarctica. Each puzzle is tested to see whether it fits the story and area. — [Premortem](https://premortem.games/2022/05/31/total-mayhem-games-are-masters-of-the-asymmetrical-puzzler/)
- In Forever, the creature gave the "translation" mechanic a purpose in the story. Puzzles are placed in world and story only after the core idea is proven. — [Xbox Wire](https://news.xbox.com/en-us/?p=190237)
- Series lore: a king, a demon's contract, a scheming Jester, two princesses left behind. Critics often call the stories weak. — [Wikipedia](https://en.wikipedia.org/wiki/We_Were_Here_(video_game))
- The FriendShip's story is a pirate captain testing whether the two can cooperate, with a "muted sense of foreboding". Its themes are teamwork, trust and clear communication. — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/596/we-were-here-expeditions-the-friendship)

**Tick Tock and Eleven Puzzles**
- **Tick Tock:** story sentences on screen only make sense combined with the partner's view. The game is set in clockmaker Amalie Ravn's eerie clockwork world, and its twist ending was praised. — [The Escape Roomer](https://theescaperoomer.com/tick-tock-a-tale-for-two/)
- Reviewers found Tick Tock's story intriguing but not essential. — search summary (snippet; see [Nintendo Life](https://www.nintendolife.com/reviews/switch-eshop/tick_tock_a_tale_for_two))
- **Parallel Experiment:** two detectives, Ally Abernathy and Steven "Old Dog" Kowalski, and players **alternate dialogue choices**, most notably in a good cop / bad cop interrogation. — [Use a Potion](https://www.useapotion.com/2025/06/parallel-experiment-pc-review/)
- **Unboxing the Cryptic Killer:** the story is light, mainly a frame, and later cutscenes were added to fix weak characters. — [Room Escape Artist](https://roomescapeartist.com/2023/06/19/eleven-puzzles-unboxing-cryptic-killer-hivemind-review/)

**Lost in Play (single-player)**
- The designers wanted it to "feel like two siblings playing a game" of make-believe, and avoided a standard narrative structure. The siblings were based on a co-founder's children. — [Wireframe](https://wireframe.raspberrypi.com/articles/dive-into-a-world-of-pure-imagination-with-point-and-click-adventure-lost-in) (snippet)

### Inferences
- Story uses that fit a family treasure-map game:
  - **Each sibling's view expresses character.** The tall, older sister notices practical, grown-up details (signs, labels, clocks). The small brother sees the imaginative or hidden layer (faces in tree bark, chalk marks, animal tracks), like BOKURA's two worlds, softened.
  - **The treasure map shows different marks to each sibling.** The secret is only readable when they combine what they see, and the final reveal at the old oak needs both halves.
  - **Story text only one can read**, delivered aloud by the other (BOKURA's house). This turns reading lore into a shared bedtime-story moment.
  - **A "past layer" in the forest** (old carvings the brother sees under moss) echoing The Past Within's two timelines without needing time travel.
- BOKURA: planet's hidden objectives and push-to-sabotage are explicitly designed to create conflict. That runs against a family-friendly pillar, so borrow the *gentle* version: small surprises each sibling discovers and chooses when to share.
- Critics repeatedly call these stories thin. The emotional payoff tends to come from the *act of communicating* (trust courses, guiding a blind partner) rather than cutscenes, so story beats can be built as communication moments.

### Gaps
- I found no details of BOKURA's branching endings, and no developer explanation of how the Dad/Mom choice uses the split views.
- I found no Rusty Lake interview specifically on The Past Within's narrative design. A Kotaku chat was found, but its content was unavailable.

---

## 8. What do players and developers say works or frustrates?

### Takeaway
**What works:**
- the "aha" of discovering you see different things
- puzzles that make people talk, laugh and yell
- unambiguous rules
- tight, short sessions of 2–4 hours

**What frustrates:**
- describing dense visual clutter
- one-sided waiting
- tiresome talk-channel limits
- networking and progress-loss bugs
- thin stories
- partners who can't communicate

Every game in this list stresses that it depends on the partner.

### Cited Findings

**Developer lessons**
- "The fun really lives between players." The team realised they were designing a communication party game, not a bomb game. — [Game Developer (KTANE)](https://gamedeveloper.com/design/finding-the-fun-in-bomb-defusal-with-i-keep-talking-and-nobody-explodes-i-)
- Watching and listening to players revealed problems they never reported. The ambiguity issues were caught only by "eavesdropping on them". — [Game Developer (KTANE)](https://gamedeveloper.com/design/finding-the-fun-in-bomb-defusal-with-i-keep-talking-and-nobody-explodes-i-)
- Players who must guess either fail and feel cheated or succeed and feel unsatisfied. — [Game Developer (KTANE)](https://gamedeveloper.com/design/finding-the-fun-in-bomb-defusal-with-i-keep-talking-and-nobody-explodes-i-)
- The main challenge is "predicting how players would communicate the challenges using only their voice". — [Game Developer (We Were Here, IGF)](https://www.gamedeveloper.com/game-platforms/road-to-the-igf-total-mayhem-games-i-we-were-here-i-)
- **Iteration example (Forever's creature puzzle):** a beatboxing/rhythm-matching prototype was too hard, so the team switched to organic sounds plus a creature, and added translation last. Final tuning of questions, answers, dictionary, controls and challenge took many attempts. — [Xbox Wire](https://news.xbox.com/en-us/?p=190237)
- **Total Mayhem's tools:** cardboard, board-game parts, storyboards, diagrams, mini-films, in-engine prototypes and origami models. The developers play every puzzle weekly, and focus-group feedback sets the next iteration. — [Xbox Wire](https://news.xbox.com/en-us/?p=190237); [Premortem](https://premortem.games/2022/05/31/total-mayhem-games-are-masters-of-the-asymmetrical-puzzler/)
- A studio interview (unfetchable, the site has closed) reportedly says the team makes puzzles "extra hard" to describe on purpose. — [Xbox Addict](https://xboxaddict.com/Article/433/We-Were-Here-Forever-Interview-with-Developers-at-Total-Mayhem-Games.html) (snippet only; unverified)
- The Past Within began as a single-player design with puzzles inside and outside a 3D box. Playtesting led the team to partition the puzzles so each set was self-contained. — [Wikipedia](https://en.wikipedia.org/wiki/The_Past_Within)

**Player and critic praise**
- **BOKURA:** Steam is "Very Positive", 94% of 4,869 English reviews, with recent reviews at 78%. — [Steam](https://store.steampowered.com/app/1801110)
- BOKURA sold 600,000 copies against a target of 100,000. A viral TikTok by KnZPlay boosted sales, and localisation grew from 4 to 20 languages. — [Automaton West interview](https://automaton-media.com/en/wp-json/wp/v2/posts/35252)
- Reviewers credit "constant communication" and the "original way both players receive different information". — search summary of reviews (snippet; see [OpenCritic](https://opencritic.com/game/15385/bokura/reviews?page=1))
- SUPERJUMP sees BOKURA's short 3–4 hour length as a strength, since it can be finished in one or two sessions. — [SUPERJUMP](https://superjumpmagazine.com/bokura-review)
- **The Past Within:** Eurogamer said the teamwork "conjures something memorable and unique". RPS called it "a satisfying couple of hours of good communication". It was nominated for best innovation and best game design at the 2023 Dutch Game Awards. — [Wikipedia](https://en.wikipedia.org/wiki/The_Past_Within)
- **The FriendShip:** an Adventure Game Hotspot score of 90%, praised for varied puzzles. Others call it short (~2 hours, three main puzzles). — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/596/we-were-here-expeditions-the-friendship); [PlayStation LifeStyle](https://www.playstationlifestyle.net/review/891396-we-were-here-expeditions-the-friendship-review-ps5/) (snippet)
- **Big Walk:** proximity chat "far from a gimmick", communication working "as much like a mechanic as running and jumping". The game earned a Game Informer 9/10 Must Play. — [Game Informer](https://gameinformer.com/review/big-walk/a-walk-to-remember); search summary (snippet)

**Frustrations**
- **BOKURA:**
  - Some puzzles were hard to solve without describing the entire screen.
  - Trial and error and long waits in the final level needed extra autosaves.
  - Repetitive sci-fi alarms led the friend to mute the game.
  - The forest side was vibrant while the robot side was "drab and monochrome", a visual imbalance between the two players' experiences.
  - — [GameLuster](https://gameluster.com/early-access-review-bokura-sorry-ive-got-no-head/)
- BOKURA players got stuck after misplacing the headless body, with "no way to progress or rewind". — [Steam discussion](https://steamcommunity.com/app/1801110/discussions/0/3777994239409722853)
- Critics noted small physics issues, and player summaries mention problems that lead to lost progress. — search summary (snippet; see [Vaporlens](https://vaporlens.app/app/1801110/bokura))
- The Switch version of BOKURA was called "quite a trial due to lag and design issues". — [Siliconera tag page](https://www.siliconera.com/tag/tokoronyori/) (snippet)
- A review says BOKURA is not recommended without a good co-op partner and voice chat. — search summary (snippet)
- **BOKURA length conflict:** Steam and SUPERJUMP say 3–4 hours, GameLuster's pair took ~7 hours. — [Steam](https://store.steampowered.com/app/1801110); [SUPERJUMP](https://superjumpmagazine.com/bokura-review); [GameLuster](https://gameluster.com/early-access-review-bokura-sorry-ive-got-no-head/)
- **The Past Within:** some 2D imagery is unclear and hard to identify. — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/303/the-past-within)
- **We Were Here:** walkie-talkies "get to be tiresome". — [The Sixth Axis](https://www.thesixthaxis.com/?p=437414) (snippet)
- Critics generally fault the series for short length, weak stories and uneven puzzle balance. — [Wikipedia](https://en.wikipedia.org/wiki/We_Were_Here_(video_game))
- **Operation: Tango:** basic puzzles are often repeated and less engaging. Jeuxvideo.com criticised repetitiveness and unclear objectives later on. — [Wikipedia](https://en.wikipedia.org/wiki/Operation:_Tango); search summary (snippets)
- **Eleven Puzzles:** items not clearly marked as clickable; repetitive path-drawing and counting. — [Room Escape Artist](https://roomescapeartist.com/2023/06/19/eleven-puzzles-unboxing-cryptic-killer-hivemind-review/)
- Parallel Experiment's side-scrolling and top-down sections feel "slow and clunky". — [Use a Potion](https://www.useapotion.com/2025/06/parallel-experiment-pc-review/)
- Store-page feedback on Parallel Experiment mentions a character-select bug and desync. — search summary (snippet)
- Escape Academy reviewers noted multiplayer desync. — search summary (snippet)
- **Tick Tock:** players needed notetaking. — [Bonus Stage](https://www.bonusstage.co.uk/archives/140406) (snippet)
- One pair found Tick Tock's puzzles fairly easy and finished in 80 minutes without hints. — [The Escape Roomer](https://theescaperoomer.com/tick-tock-a-tale-for-two/)

### Inferences
- For a browser game on two devices, **state sync and recovery** matter as much as puzzle design. Several of these games draw desync and progress-loss complaints. Puzzles need a reset or rewind, especially where one player can strand the other (BOKURA's head/body case).
- **Give both siblings equally beautiful views.** BOKURA's "drab" robot side was a real complaint, and a storybook game should make both perspectives delightful.
- **Test by eavesdropping on real pairs**, including parent+child and sibling pairs. KTANE and Total Mayhem both found that problems only show up in listened-to conversation. Both studios prototyped on paper or with real walkie-talkies before coding.
- **Keep visual clutter low on the "describe it" screens** (BOKURA's describe-everything complaint, The Past Within's unclear 2D images). Clear silhouettes and nameable objects suit both the warm storybook art and kid players.

### Gaps
- I found no aggregated data on which puzzle types players rate highest across games. I found no postmortem on network architecture for split-view co-op (how BOKURA or Eleven Puzzles sync two different views).

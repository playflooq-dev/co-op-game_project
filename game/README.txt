TREASURE HUNT - game prototype
==============================

HOW TO OPEN
Double-click index.html. It opens in your web browser with the start screen: the sister and the
brother on a forest path, and one big round play button (no words). A tap, a click or any key
starts the game.
FOR NOW (for the trials with the client, asked for on 2026-11-27) the play button opens the
chapter map with every level open, so any level can be chosen and played; the forest stays
locked. This is the test view (map.html?unlock=all): it saves nothing. For the real game, set
OPEN_ALL_LEVELS to false in shared/start.js: then the button starts Chapter 1 with the house the
first time, and the chapter map after that. (index.html#normal does that for one visit.)
No installation and no internet connection are needed.
Use an up-to-date Chrome, Edge, Firefox or Safari.

PLAYING ON PHONES AND TABLETS (since 2026-11-27)
Hold the phone or tablet sideways and tap the play button.
(The first version did not go full screen on phones: it asked as soon as a finger touched the
screen, and phones only allow it once the finger is lifted. Fixed on 2026-11-27.)
  Android phones and tablets, and iPads: the game goes full screen after the tap, and tries to
    stay sideways. If full screen is left (for example with the back gesture), the game goes on
    as before; a small full-screen button then shows in the top left corner of the chapter map,
    and a tap on it goes back to full screen.
  iPhone: Safari does not allow web pages to go full screen, so the browser's bar stays. The game
    starts and plays normally. To play without the bar: in Safari tap Share, then "Add to Home
    Screen", and open the game from its icon (a green play button). It then opens without the
    browser's bar. The same works on Android and iPad.
  On a computer the play button only starts the game: it never asks for full screen.
In full screen, the start screen stays open around the game, so the address in the browser stays
index.html while the map and the levels are played. Reloading the page goes back to the start
screen; one more tap goes on from where the players were.

CHAPTER 1: THE HOUSE, THEN THREE LEVELS IN THE CITY
The order on the map: the house, the park, the city (the see-saw level), the canal. After them
comes the forest, which is locked: Chapter 2 is not built yet.
Opening  house.html   "Home Alone" (the first stop since 2026-11-27): the two are locked in at
                      home and find the spare key. It is the oldest level and still plays the
                      older way: no jumping, a code to work out, and some reading. It has to be
                      looked at again before the game is released (see OPEN_QUESTIONS.md).
Level 1  park.html    The park: learning to move, then four very small puzzles. About 5 minutes.
Level 2  city.html    Across the city to the Old Bridge: eight stations (carrying, the lift, the
                      see-saw, boats, the pulley, the toss). About 10 minutes.
Level 3  canal.html   The canal (since 2026-11-25): thin planks and small boats that only hold the
                      brother, combined with what the first two levels taught. About 8 minutes.
                      It ends the chapter at the Old Bridge, with the forest on the far bank.
Each level's end card leads to the chapter map, and the map leads to the next level.
Chapter 1 (the park, the city, the canal) was approved on 2026-11-25. The house as its first stop
was added and approved on 2026-11-27.

CONTROLS (the same in the park, the city and the canal; the house has its own older controls,
described in the last part of this file)
Two players on one keyboard, or one player with both hands:
  Sister:   A / D walk     W jump     S grab
  Brother:  Left / Right walk     Up jump     Down grab
  M switches the sound off and on. Jump, held at a ladder, climbs it.
On a tablet or phone, held sideways: each player has four buttons in their bottom corner, the
sister's on the left and the brother's on the right (two to walk, one to jump, one to grab).
On the chapter map: jump, Enter or a tap starts a level; left and right choose one.
Nobody has to know the keys beforehand: Level 1 shows them as pictures, one move at a time.

WHAT EACH SIBLING CAN DO
The sister is tall, strong and heavy (her colour is green). She reaches high levers, carries the
heavy crate as well as light boxes, presses the big green plates, lifts the brother onto her
shoulders, and her jump onto a see-saw sends him flying. Thin planks and small boats do not
hold her.
The brother is small and light (his colour is blue). He walks on thin planks and small boats,
ducks into low gaps, his hand fits small hatches and drains, and from her shoulders he reaches
higher than either alone.
Every puzzle needs both of them. Nobody can get hurt, lose, or get stuck.

FOR TESTING: THE TEST LINKS (since 2026-11-27)
Players never see these. Each is index.html with something added after it. On the web, put the
same ending after the game's address, for example https://<address>/index.html?unlock=all
All of them skip the start screen, so testing stays quick. (The sound then starts with the first
key or tap in the level.)
  index.html?unlock=all     The map with every level open to play, also the ones not finished yet,
                            so any level can be tapped and played at once. The forest stays
                            locked. A small TEST badge shows in the top right corner. Unlocking
                            saves nothing: the saved progress is exactly as it was. (Playing a
                            level from there counts like any other play: finishing it marks it
                            finished.) A level started from this map starts from its beginning.
  index.html?level=house    Straight into the house, without the map.        (opens house.html)
  index.html?level=park     Straight into Level 1, the park.                 (opens park.html)
  index.html?level=seesaw   Straight into Level 2, the see-saw level.        (opens city.html)
  index.html?level=canal    Straight into Level 3, the canal.                (opens canal.html)
  index.html?reset=1        The map, with everything that was remembered forgotten: what a new
                            player sees. (Use it after testing, to start clean.)
More can be added with "&" and is passed on to the level: index.html?level=canal&section=4
The pages can also be opened directly: map.html?unlock=all, house.html, park.html, city.html,
canal.html.
  index.html#frame          The start screen, using the full-screen frame on a computer too, to
                            try on a computer what a phone or tablet does.

ADDRESS OPTIONS FOR TESTING (add to the address of a level page)
  park.html?section=3     start at section 3 of the park (1 to 6)
  city.html?station=5     start at station 5 of the city (0 to 7)
  canal.html?section=3    start at section 3 of the canal (1 to 7)
  ?debug=1                show what is solid, what is switched on, the frame rate
  ?hints=fast             the picture hints come ten times sooner
  ?touch=1                show the touch buttons on a computer
  ?fps=30                 draw only 30 frames a second, to feel a slow device
  ?tune=1                 sliders for how the jump and the running feel
  map.html?reset=1        forget what has been played
  map.html?unlock=all     the test view of the map (see the test links above)
  house.html?stage=end    the house at its end card (also: cupboard, bulb, lock, door, open)
They can be joined with "&": canal.html?section=5&debug=1

THE PAGES
index.html    Starts the game: the house the first time, the chapter map once a game has been
              started. It also takes the test links (see FOR TESTING above).
map.html      The chapter map, in pictures: four stops on a map of the city. From the left: the
              house, standing by itself (a house); the park (a tree); the city (a see-saw); the
              canal (a boat). A dashed path joins them. A finished stop has a green tick, the next
              one to play pulses under an arrow, later ones have a padlock.
              Jump, Enter or a tap starts the stop the siblings stand at; left and right, or a tap,
              choose any finished stop to play it again. After the last level a card celebrates
              the end of the chapter, and then the mist lifts from the forest across the river:
              where Chapter 2 will be (it has a padlock).
              Progress saved before the house was added (2026-11-27) is kept: those players are
              not sent back. For them the house is simply open to play, without a tick.
              On a narrow screen the stops are drawn smaller, so that all of them fit.
house.html    THE OPENING, "Home Alone", the first level ever built: the brother and sister are
              locked in the house and must find the spare key. It plays the older way: walking
              only, words on the screen, a code to work out. Its end card now leads to the map,
              with the park open. Nothing else in it was changed. See the last part of this file.
park.html     LEVEL 1, "The Park". Made for somebody who has never seen the game: first only
              learning to walk and jump, with the keys shown as pictures, then four very small
              puzzles. Nothing in it needs reading and there is nothing to collect.
city.html     LEVEL 2, the city: the see-saw level. Eight stations, each one idea (jumping and
              carrying, the heavy crate, a box as a step, the see-saw, boats, the pulley, the
              toss). It ends at the Old Bridge. It was built on 2026-11-21 as a test level and is
              still called "the city lab" in some file names: the lab and Level 2 are the same page.
canal.html    LEVEL 3, "The Canal". See its own part below.

OTHER PAGES (not part of Chapter 1)
forest.html   The Forest Trail: the approved art scene. Chapter 2 will be built here.

WHAT IS REMEMBERED
The browser keeps, on this device only, which of the levels are finished, how far into an
unfinished level the players got, and whether the chapter's ending has been shown. Nothing else:
no names, no accounts, and nothing is sent anywhere. In a private window, or if the browser will
not store anything, the game simply starts from the beginning each time.
map.html?reset=1 forgets everything. The test view (map.html?unlock=all) saves nothing.

The park, the city and the canal play the new way: jumping, pictures in place of words. The house
and the forest still play the old way: walking, no jumping, and words on the screen.
How the levels are meant to get harder, one small step at a time, is in PROGRESSION.md (one folder up).
What follows is in four parts: the park, the canal, the city, then the house and the forest.

LEVEL 1: THE PARK
=================

CONTROLS (two players on one keyboard, or one player with both hands)
Sister:   A / D walk     W jump     S grab
Brother:  Left / Right walk     Up jump     Down grab
M switches the sound off and on.

Nobody has to know these beforehand. The game shows them, one move at a time:
- At the start each sibling has their own two walking keys next to them, as big pictures in their
  colour (green for her, blue for him). A picture fades once that player has walked that way.
- Then the jump key shows over the head, and fades with the first jump. If somebody later stands
  stuck in front of a step, it comes back for a moment.
- A player who stands still for four seconds with a picture showing sees a faint, glittering ghost
  of their own sibling do the move.
- The grab key is shown only where it is first needed: over whoever stands at the box (section 3),
  and once more at the plate, for putting the box down. A player who has not used it by then is
  shown it at the pond or under the balloon.
- The row of keys at the bottom of the screen starts empty and fills up as each move is learned.
These pictures and timings are in worlds/park/learn.js and LEARN_SET in worlds/park/settings.js.

"Grab" does whatever fits where they stand:
- next to the box: pick it up. Again: put it down in front.
- next to something to use (the balloon, the pond): use it.
- next to each other, with nothing else in reach: she lifts him onto her shoulders.
  Grab again, or jump: he gets down. (There is no toss in Level 1, and no lift in section 1.)
- both at the same moment: a high five.
A little sign over a head shows what grab would do: a hand (pick up or use), and from the balloon
tree on, two hands (the lift).

On a tablet or phone, hold it sideways. Each player gets four buttons in their bottom corner:
the sister's on the left, the brother's on the right. There the button to press pulses, the picture
next to the sibling is a small copy of that button, and buttons for later moves are faint at first.

Nobody can get hurt or lose. There is nothing to fall into and nothing to fall off.

THE SECTIONS
1  Learn to move. No puzzle, nobody else about, nothing to collect: a long flat path, one very low
   step, three low steps up and down, one low log. Each needs a jump, so nobody reaches the first
   puzzle without having walked and jumped. If one player is still practising, the other can wait.
2  Plate and gate. The gate is open while somebody stands on a blue plate. One holds it open,
   the other walks through and holds the plate on the far side, and the first one follows.
3  Box on plate. This gate has only one plate, but there is a box behind it. One holds the plate,
   the other fetches the box and puts it on the plate. A box can do a person's job.
4  The pond. A calm moment: nothing has to be done. Grab at the pond makes a splash.
5  The balloon. A red balloon is caught in a tree, too high for either. She lifts him, he takes
   it, and the little gate opens for whoever carries a balloon.
6  The way out. Two plates side by side: both stand on one at the same time, the gate opens for
   good, confetti, a high five. Walk to the big park gate together to finish.
The card at the end shows a high five and the time. Jump goes on to the chapter map, and from
there to Level 2, the city.

STUCK?
A thought bubble over the sister shows a picture of what the section is about (a gate, the
balloon, the way out). If the next step is not done for a while, the thing to use starts to
sparkle (after about 10 seconds), then an arrow points at it (20 seconds), then a faint, glittering
ghost of a sibling shows where to stand and what to do (35 seconds). The ghost is green for her
and blue for him. These times are HINT_TIMES in worlds/park/settings.js.

THINGS THAT REACT (none is needed, and none is in section 1)
Birds fly up when somebody jumps or runs close, and come back. Some flowers and grass bounce when
walked through. A cat sits on the box; it hops off when the box is picked up and goes back when it
is left alone. The ducks swim away from a splash. The siblings cheer when a gate opens, he giggles
when lifted, she looks proud when he has the balloon, and they wave to each other when apart and
standing still.

TAKEN OUT ON 2026-11-24
The three stickers (they confused more than they added; they come back once the base game is set;
the city lab's eight went the same day),
and the dog and the ball (fun, but too much while learning to move; their code is saved for a
later level in shared/later/). worlds/park/REVIEW.md goes through everything else in the level
that could distract a first-time player, with a recommendation for each.

FOR TESTING (add to the address; index.html passes these on)
park.html?section=3    starts at section 3 (1 to 6)
park.html?debug=1      shows what is solid, which plates are on, the section names, the frame rate
park.html?tune=1       sliders for how the jump and the running feel
park.html?hints=fast   the hints come ten times sooner
park.html?touch=1      shows the touch buttons on a computer
park.html?fps=30       draws only 30 frames a second, to feel a slow device
They can be joined with "&": park.html?section=5&debug=1


LEVEL 3: THE CANAL
==================

CONTROLS (the same keys as in the park and the city)
Sister:   A / D walk     W jump     S grab
Brother:  Left / Right walk     Up jump     Down grab
M switches the sound off and on. Jump, held at a ladder, climbs it.
On a tablet or phone, hold it sideways: each player gets four buttons in their bottom corner.

THE ONE NEW IDEA: LIGHT FEET ONLY
Thin blue planks and small blue boats hold the brother, and a light box. Under the sister a plank
creaks, bends and walks her back to her bank; a boat sinks under her. She can never cross one.
Everything else is known from Levels 1 and 2: plates and gates, carrying a light box, the lift,
levers and the see-saw. There is no toss, no pulley and no heavy crate in this level.

Nobody can get hurt or lose. Falling into the water is a splash and a duck's quack; a moment later
that sibling is back: next to the other one if both are on the same bank, otherwise on the bank
they came from.

THE SECTIONS
1  Warm-up. Plate and gate, as in the park: one holds the gate open, the other walks through and
   holds it from the far side. Nothing else is on the first screen.
2  The thin plank. He walks over the stream on it. On the far side he steps on a plate, and a
   sturdy bridge slides out for her and stays.
3  The see-saw and the boats. The middle boat is too far to jump to. He stands on the blue end of
   the see-saw, she jumps onto the green end, and he flies over to it (no steering needed). He goes
   on over the raft to the far quay and pulls the lever: the raft fetches her by itself.
4  A calm moment. Ducks, and a rowing boat tied up at the quay. Nothing has to be done.
5  The box over the plank. He carries the light box over a thin plank and puts it on the plate.
   That lets a ladder down on her side. She climbs up to the high green lever, which slides the
   lock bridge out and opens the lock gate, for both.
6  The see-saw on the ledge. The ledge is too high to jump onto: the box goes against it as a
   step. Up there he stands on the blue end, she jumps onto the green end, and he flies up to
   the high shelf, where a lever opens the way to the bridge.
7  The Old Bridge. He walks over the small boats to the far bank. Each holds a lever, one on
   each bank, at the same time: the bridge comes down. She walks over to him: a high five, and
   the forest is ahead.
The card at the end shows a high five and the time. Jump goes on to the chapter map.

STUCK?
As in the city: a thought bubble shows a picture of what the section is about; then the thing to
use sparkles (after about 20 seconds), an arrow points at it (40 seconds), and a faint, glittering
ghost of a sibling shows where to stand (60 seconds). These times are HINT_TIMES in
worlds/canal/settings.js.

FOR TESTING (add to the address)
canal.html?section=3   starts at section 3 (1 to 7)
canal.html?debug=1     shows what is solid, what is switched on, the section names, the frame rate
canal.html?hints=fast  the hints come ten times sooner
canal.html?touch=1     shows the touch buttons on a computer
canal.html?fps=30      draws only 30 frames a second, to feel a slow device
canal.html?tune=1      sliders for how the jump and the running feel
map.html?reset=1       forgets what has been played
worlds/canal/REVIEW.md is the first-time player review of this level.


LEVEL 2: THE CITY
=================
(The see-saw level. Built as a test level, "the city lab"; approved as Level 2 on 2026-11-25.)

CONTROLS (the same keys as in the park; the lab adds the toss, levers and ladders)
Sister:   A / D walk     W jump     S grab
Brother:  Left / Right walk     Up jump     Down grab
The keys are shown as pictures at the bottom of the screen. M switches the sound off and on.

"Grab" does whatever fits where they stand:
- next to a box: pick it up. Again: put it down in front (on a pile, it goes on top).
- next to something to use (a lever, a lamp, a bell): use it. Some levers and the rope
  only work while the key is held down.
- next to each other, with nothing else in reach: she lifts him onto her shoulders.
  Grab again: she tosses him up and forwards. Jump while he is up there: he hops down.
- both at the same moment: a high five.
Jump, held at a rope ladder, climbs it.
A little sign over a head shows what grab would do: a hand (pick up or use), two hands (the lift),
an arrow (climb).

On a tablet or phone, hold it sideways. Each player gets four buttons in their bottom corner:
the sister's on the left, the brother's on the right.

WHAT EACH OF THEM CAN DO
                Sister (tall, strong, heavy)             Brother (small, light)
Walk and jump   yes                                      yes, a little faster
Carry           light boxes and the heavy crate          light boxes only
Weight          presses the big green plates;            walks on thin planks, small boats
                thin planks, small boats and             and branches
                branches give way under her
Size            reaches high levers and signs            ducks into low gaps by himself;
                                                         his hand fits small hatches and drains
Together        lifts him onto her shoulders,            rides up there and reaches higher still;
                and tosses him up to a ledge             is tossed
See-saw         her landing sends him flying             too light to send her anywhere

Colours say whose job a thing is: GREEN is the sister's (heavy or high), BLUE is the brother's
(light or small), plain wood is for either.

Nobody can get hurt or lose. A fall into water is a splash, and a moment later that sibling is
back on the bank.

THE STATIONS
Each is one idea on one screen, and needs both of them.
0  Maple Street. Steps and a low wall to jump; a box to carry, and a shelf it helps to reach.
   Then three lamps to switch on, each with a cable to the gate: one on a shop sign (she reaches
   it), one in a drain (only his hand fits), one in a window box (too high for both: she lifts
   him). The gate opens when all three are lit.
1  The flour mill. The shutter stays open only while the big green plate is held down. The heavy
   crate would do it, but it is up on the hoist: he works the low hatch that lets it down, and
   she carries it onto the plate.
2  The market. The puppy is up on a high awning and cannot get down. Bring the box under it; she
   stands on the box and lifts him, and he helps it down. That opens the market gate.
3  Fountain Square. He stands on the blue end of the see-saw, she jumps onto the green end, and
   he flies up to the balcony. Up there he lets the rope ladder down for her. The fountain and
   the bell game are only there to play with.
4  The canal. The small blue boats hold him and sink under her. He crosses, and his lever on the
   far bank sends the ferry over for her (and brings it back).
5  Old Town. He stands on the lift; she holds the rope ring and hauls him up. Up there he puts
   two boxes on the other platform, and that lifts her. On the terrace two water jets give a bounce.
6  The cafe. She tosses him onto the high shelf, he turns the crank, and the three parasols open
   into steps over the wall.
7  The Old Bridge. She holds the high lever, he holds the low one in the hut door, both at once,
   and the bridge comes down. Over it is the gate of Forest Park.

STUCK?
A thought bubble over the sister shows a picture of what the station is about. If nothing
happens for a while, the thing to use next starts to sparkle (after about 20 seconds), then an
arrow points at it (40 seconds), then a faint ghost of the sibling whose job it is shows where
to stand and what to press (60 seconds). The ghost is green for her and blue for him.

NOTHING TO COLLECT
The eight stickers that were hidden along the way were taken out on 2026-11-24, as in Level 1
(collecting confused more than it added; it comes back once the base game is set). The torn map
went on 2026-11-25: no gust of wind, no pieces flying about, no box of pieces at the top left.
Only the puzzles are left (the three lamps, the puppy).
The card at the end shows a high five and the time.
Jump goes on to the chapter map, and from there to Level 3, the canal.

FOR TESTING (add to the address)
city.html?station=5    starts at station 5 (0 to 7)
city.html?debug=1      shows what is solid, what is switched on, the station names, the frame rate
city.html?tune=1       sliders for how the jump and the running feel
city.html?hints=fast   the hints come ten times sooner
city.html?touch=1      shows the touch buttons on a computer
city.html?fps=30       draws only 30 frames a second, to feel a slow device
They can be joined with "&": city.html?station=3&debug=1


THE HOUSE AND THE FOREST
========================

CONTROLS (two players on one keyboard)
Sister:   A / D walk     W use, climb up     S go down, look in
Brother:  Left / Right walk     Up use, climb up     Down go down, crawl in
In the forest: A / D and W to cheer; Left / Right and Up to cheer.
Pressing W or Up with nothing nearby makes that character cheer. Cheer together for a high five.
A hint over each character's head shows what they can do where they stand.
On a phone or tablet, on-screen buttons appear instead.

The sister is tall: she reaches things that are high up.
The brother is small: he fits through small doors and gaps.

HOW THE HOUSE PUZZLE WORKS (spoiler)
He finds the box code in the dark cupboard under the stairs; she gets Dad's box from the tall
bookcase; the spare key inside opens the front door.


SOUND
Every page has music, and the park, the house and the city have sound effects. They are free CC0
recordings (see the CREDITS.txt files in the music and sounds folders); the park borrows the
city's daytime music. A few animal sounds are made by code.
Browsers only allow sound after the first key press or tap.

WHAT IS IN THE FOLDER
index.html, map.html, park.html, city.html, canal.html, house.html, forest.html
               the pages; open index.html to start
worlds/        one folder per world (park, city, canal, house, forest): its art, its settings and its
               code. worlds/park/REVIEW.md is the first-time player review of Level 1. worlds/README.md explains how to change or replace any of it, and how to
               place objects in the park and the city. worlds/city/LAB_PLAN.md is the story of
               the city lab.
shared/        what more than one world uses: the two characters, the sounds, and for worlds with
               jumping the physics, the movement and the object kit; chapter.js and chaptermap.js
               (the chapter, what is remembered, and the map). shared/later/ holds things
               saved for a later level (the dog, the ball); no page loads them.
tools/         developer tools used to create the artwork and test the game; not needed to play

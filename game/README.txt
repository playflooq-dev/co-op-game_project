TREASURE HUNT - game prototype
==============================

HOW TO OPEN
Double-click index.html. It opens in your web browser and starts Level 1, the park.
No installation and no internet connection are needed.
Use an up-to-date Chrome, Edge, Firefox or Safari.

THE PAGES
index.html    Starts the game: it passes straight on to park.html.
park.html     LEVEL 1, "The Park" (since 2026-11-23; made plainer on 2026-11-24). A gentle first level
              of about five minutes for parents playing with children of about 5 to 10, or two
              children together. It is made for somebody who has never seen the game: first only
              learning to walk and jump, with the keys shown as pictures, then four very small
              puzzles. Nothing in it needs reading and there is nothing to collect.
              It is waiting for feedback on difficulty and is not approved yet.
              Its end card leads on to the city.
city.html     The city. Since 2026-11-21 it is a TEST LEVEL ("the lab"): eight stations that each
              try one idea with new movement (jumping, carrying, the lift and the toss). It was found
              far too hard as a first level; it stays as the place where ideas are tried.
              It ends at Forest Park.
house.html    "Home Alone" (this was index.html until 2026-11-23): the brother and sister are locked
              in the house and must find the spare key. Getting out leads on to the city.
forest.html   The Forest Trail (the first art scene; a later chapter will be built here).

The park and the city lab play the new way: jumping, pictures in place of words. The house and the
forest still play the old way: walking, no jumping, and words on the screen.
How the levels are meant to get harder, one small step at a time, is in PROGRESSION.md (one folder up).
What follows is in three parts: the park, the city lab, then the house and the forest.


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
The card at the end shows a high five and the time. Jump goes on to the next level
(for now, the city lab, which is much harder).

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
The three stickers (they confused more than they added; they come back once the base game is set),
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


THE CITY LAB
============

CONTROLS (the same keys as in the park; the lab adds the toss, levers and ladders)
Sister:   A / D walk     W jump     S grab
Brother:  Left / Right walk     Up jump     Down grab
The keys are shown as pictures at the bottom of the screen. M switches the sound off and on.

"Grab" does whatever fits where they stand:
- next to a box: pick it up. Again: put it down in front (on a pile, it goes on top).
- next to something to use (a lever, a map piece, a bell): use it. Some levers and the rope
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
   Then the wind tears the map into four pieces. One lands on a shop sign (she reaches it), one
   in a drain (only his hand fits), one in a window box (too high for both: she lifts him).
   The gate opens when all three are found.
1  The flour mill. The shutter stays open only while the big green plate is held down. The heavy
   crate would do it, but it is up on the hoist: he works the low hatch that lets it down, and
   she carries it onto the plate.
2  The market. The puppy has the last piece, up on a high awning. Bring the box under it; she
   stands on the box and lifts him.
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

STICKERS
Eight stickers are hidden along the way. None is needed. Two can only be reached from her
shoulders, one only he can get to, one is for petting the puppy and one for ringing the bell.
The card at the end shows the map, the stickers found and the time, in pictures and numbers.

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
index.html, park.html, city.html, house.html, forest.html   the pages; open index.html to start
worlds/        one folder per world (park, house, city, forest): its art, its settings and its
               code. worlds/park/REVIEW.md is the first-time player review of Level 1. worlds/README.md explains how to change or replace any of it, and how to
               place objects in the park and the city. worlds/city/LAB_PLAN.md is the story of
               the city lab.
shared/        what more than one world uses: the two characters, the sounds, and for worlds with
               jumping the physics, the movement and the object kit. shared/later/ holds things
               saved for a later level (the dog, the ball); no page loads them.
tools/         developer tools used to create the artwork and test the game; not needed to play

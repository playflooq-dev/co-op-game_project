TREASURE HUNT - game prototype
==============================

HOW TO OPEN
Double-click index.html. It opens in your web browser.
No installation and no internet connection are needed.
Use an up-to-date Chrome, Edge, Firefox or Safari.

THE CHAPTERS
index.html    Chapter One, "Home Alone": the brother and sister are locked in the house
              and must find the spare key. Getting out leads on to Chapter Two.
city.html     Chapter Two, "Across the City": a journey across town to the Old Bridge:
              a torn map, a road crossing, a flour mill yard, a runaway puppy, little boats
              and a ferry, Fountain Square, the metro, Old Town (a picture game, a ladder on
              wheels, cafe parasols), a bus and a lift bridge.
              About 15 to 20 minutes. It ends at Forest Park, which leads on to the forest.
forest.html   The Forest Trail (the first art scene; the next chapter will be built here).

THE CITY IS BEING REBUILT (since 2026-11-21, branch lab/city-v2)
city.html is now a test level, "the lab", for new movement: jumping, carrying, the lift and the toss.
What is written about city.html in the rest of this file describes the first version; it will be
rewritten when the lab is finished. The plan is in worlds/city/LAB_PLAN.md. For now city.html is one
test street with five stars to collect, one for each new ability:

  Sister:   A / D walk     W jump     S grab, put down, use
  Brother:  Left / Right walk     Up jump     Down grab, put down, use
  Grab next to a box picks it up; grab again puts it down. Only the sister can lift the heavy crate
  (green bands). Grab next to each other, with nothing else in reach: she lifts him onto her shoulders.
  Grab again: she tosses him up. Jump while he is up there: he hops down. Both grab at once: a high five.
  The brother ducks into low gaps by himself. The thin blue plank holds only him. On the see-saw, he
  stands on the blue end and she jumps onto the green end.
  On a tablet or phone, hold it sideways: each player gets four buttons in their bottom corner.

  Past the tunnel the street goes on with one of each new object (the "kit"), to try before the
  stations are built (city.html?at=4500 starts there):
  - Plates and gates. The big green plate needs her or the heavy crate; the small blue one anybody or a
    box. A gate is open only while its plate is pressed, so leave something on the plate.
  - The canal. The small blue boats hold him and sink under her. On the far bank his lever sends the
    ferry over for her, and brings it back.
  - The pulley lift. She holds grab on the rope ring and he rides up. Up there are three boxes: he puts
    them on the other platform and steps on as well, and that lifts her.
  - The rope ladder. Toss him onto the balcony, he presses grab at the bundle, and she climbs by holding
    jump. The branch beside it holds only him.
  - The two-switch door. Both levers must be held (keep grab down) at the same moment.

  Add to the address to help with testing:
  city.html?tune=1    sliders for how the jump and the running feel (the numbers are MOVE in shared/movement.js)
  city.html?debug=1   shows what is solid and the frame rate        city.html?at=3300   starts further along
  city.html?touch=1   shows the touch buttons on a computer         city.html?fps=30    runs like a slow device

CONTROLS (two players on one keyboard; the house and the forest)
Sister:   A / D walk     W use, hold     S crawl, look in, read the map
Brother:  Left / Right walk     Up use, hold     Down crawl, look in, read the map
Pressing W or Up with nothing nearby makes that character cheer. Cheer together for a high five.
A hint over each character's head shows what they can do where they stand.
On a phone or tablet, on-screen buttons appear instead.
Every chapter has music, and the house and the city have sound effects. M switches the sound off and on.
The music and sounds are free CC0 recordings (see the CREDITS.txt files in the music and sounds folders).
Browsers only allow sound after the first key press or tap.

WHAT EACH OF THEM CAN DO
The sister is tall: she reaches things that are high up.
The brother is small: he fits through small doors and gaps, and he is light.
Together: when something is too high for both, they stand under it and she lifts him up.

STUCK? (Chapter Two)
The card at the top says what to do next, but not how. If the same goal stays up for a while,
hints appear on the treasure map, one at a time, from a small nudge to the answer.
Open the map with S or Down when nothing else is nearby.

STICKERS (Chapter Two)
Eight stickers are hidden along the way. None is needed to finish. Some need the sister,
some the brother, some both. The end card shows how many were found, the time, and the
scores in the bell game.

HOW THE PUZZLES WORK (spoilers)
Chapter One: he finds the box code in the dark cupboard, she gets Dad's box from the bookcase.
Chapter Two:
- The wind tears the map into four pieces. One is on a shop sign (she reaches it), one in a
  drain (his hand fits), one in a window box (she lifts him up). Each piece has a little
  picture on it; the pictures change every game.
- Maple Street: press the button, wait for the green man.
- The flour mill yard: the shutter only stays up while the button outside is held. The chain
  that locks it open is inside, high up, so she must go in first. Then he crawls under the
  yard gate and opens it from the other side.
- The puppy has the fourth piece. It hides under a market stall. She waits on one side,
  he crawls in from the other, and it runs out to her.
- The canal: she holds the rope ring on the mooring post, which pulls the little boats into
  a line. He walks across them (they would sink under her) and sends the ferry back for her.
- Fountain Square: a place to play. Splash in the fountain, try the bell game.
- The metro: Blue line towards Harbour, change at Central, Green line to Old Town.
- Old Town: the bus needs a ticket each.
  The picture game: four paintings are shown, then turn round. The board shows one picture
  for each of them; each stands at the painting that hides their own picture. Three rounds
  win a ticket.
  The ladder on wheels is in the way and only rolls when both push. Three water jets spout in
  turn; they bubble first. Anyone caught is soaked and pushed back a little.
  The parasols: the other ticket is on a shop sign. She climbs the ladder (he cannot reach
  from it), and he winds each parasol open so she can step from one to the next.
- The bus: trace the line on the route map from "Old Bridge" back to its number, set that
  number on the blue box by the stop, and get on together. (Shuffled every game.)
- The Old Bridge: she switches on the power, he crawls into the hut. The controls want the
  four pictures from the map pieces, in order: she reads them from the map, he sets them.
  Then he holds the lever. Halfway down the brake catches: she holds the brake handle on
  the power post while he holds the lever.

WHAT IS IN THE FOLDER
index.html, city.html, forest.html   the chapters; open index.html to start
worlds/        one folder per world (house, city, forest): its art, its settings and its code.
               worlds/README.md explains how to change or replace any of it.
shared/        what every world uses: the two characters, the shared play code and the sounds
tools/         developer tools used to create the artwork and test the game; not needed to play

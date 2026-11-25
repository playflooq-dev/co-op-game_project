# How the game gets harder

Written on 2026-11-23, after the client played the city lab and found it far too difficult as a first level.
The most important thing is a **slow, soft curve**: players need time to learn to move before they are asked to
solve anything, and each level is only a little harder than the one before. Easy parts are kept interesting with
things that react and are fun to touch, not with harder puzzles.

Changed on 2026-11-24, after the client played the first version of Level 1: the opening of Level 1 is kept
**extremely plain**. Things that react, other characters and things to collect made even that level feel difficult,
so they come only after players can move, and collecting comes back only once the base game is set (rule 1).

These rules are **proposed, not approved** (see [DECISIONS.md](DECISIONS.md), "Proposed"). Every level is built to
them and checked against them.

## The rules

1. **Level 1 starts with moving only, and nothing else.** It is built for somebody who has never seen the game and
   does not know which keys do what. The first part has no puzzle, nobody but the two siblings and nothing to
   collect: a long, safe, flat path with a few very low steps. Each player's keys are shown as pictures next to
   their own sibling, one move at a time (walk, then jump), and a picture goes once that player has done the move.
   A key is shown only where it is first needed (grab: at the first box). New challenges and special things to
   play with come only after both players have walked and jumped.
2. **One new idea per level, never two.** A level may use everything from earlier levels, but it teaches one thing.
   (Level 1 is the exception that every first level needs: it teaches moving, and then four very small ideas.)
3. **Every new idea is met three times.**
   - *Teach:* alone, with nothing else in sight, and impossible to get wrong.
   - *Practise:* a little harder, or together with something already known.
   - *Twist:* a small surprise that uses it in a way they did not expect.
4. **Easy, hard, easy.** After each harder puzzle comes a calm, fun moment: a ride, a toy, a sticker, a funny
   reaction. Nothing has to be done there.
5. **Levels grow slowly**, from about 5 minutes to about 15.
6. **A new level starts easier than the last one ended.** Its first puzzle is easier than the previous level's
   last puzzle.
7. **Every level ends together.** The finale needs both at the same moment (two plates or two levers held at
   once), and ends with a high five.

Rules from earlier that still hold: nothing needs reading; nobody can lose, die or get stuck; every puzzle needs
both siblings, and neither one only waits.

## The levels

| Level | Place | The new idea | Puzzles | Length |
|---|---|---|---|---|
| 1 | The park | Walk, jump, small plate and gate, carry one light box, the lift | 4 tiny ones | about 5 min |
| 2 | The city, to the Old Bridge | The see-saw level, as built: the former test level, with eight stations (see the note below) | 8 stations | about 10 min |
| 3 | The canal | Light-only planks and boats, combined with known tools | 6, and a calm moment | about 8 min |
| 4 | (not chosen) | The heavy crate and the big green plate | 5 to 6 | about 10 min |
| 5 | (not chosen) | The pulley lift | 6 | about 12 min |
| 6 | (not chosen) | The toss | 6 to 7 | about 12 min |
| 7 and on | (not chosen) | No new tools: new combinations | 7 or more | about 15 min |

What a level may use: its own new idea and everything from the levels before it. Level 1 therefore has no see-saw,
no light-only surfaces, no pulley, no toss, no heavy crate, no green plate, and no puzzle with two steps.

The city lab (`game/city.html`) is not one of these levels. It is the test bench where the tools were built, and
it stays as it is. For now the park's end card leads on to it, until Level 2 exists.

**Chapter 1** is Levels 1 to 3, all in the city: the park, the city to the Old Bridge, the canal. Level 3 is the
chapter's last level; Chapter 2 is the forest. (Proposed on 2026-11-25; see DECISIONS.md.)

**A note on Level 2.** On 2026-11-25 the user named the city level that ends at the Old Bridge
(`game/city.html`) as the approved Level 2. It was built as a test bench before these rules were written, so it
does not follow them: it has eight stations and several new ideas (the heavy crate, the see-saw, small boats and a
ferry, the pulley, the toss). Two of the later levels' planned ideas are therefore already met in it, and the table
above no longer matches rows 4 to 6 exactly. Level 3 is built to the rules, and counts only on what the brief lists
as known: walking, jumping, plates and gates, carrying a light box, the lift, levers and the see-saw.

## Combinations

From Level 3 on, a level feels like progress less through new tools than through **combining tools the players
already know**. The rules for a combination:
- **At most two steps**, and both visible on one screen. (Carry the box over the plank, then she climbs the ladder
  it lets down. Not: carry, then lift, then launch.)
- **A combination uses known tools plus, at most, the level's one new idea.** Level 3: see-saw + light-only;
  carry + plate + light-only; and one made of known tools alone (carry + see-saw), which should feel like "we have
  got good at this".
- **Teach the new idea alone first**, with nothing combined, before any combination uses it.
- **Each combination is only a little longer than the puzzle before it.** The scripted play-through shows this as
  times that rise gently, with the calm moment as the dip.
- Every combination still needs both siblings, and neither one only waits.

Combination ideas not used yet, for later levels:
- **Lift onto a boat roof.** She lifts him onto the roof of a moored boat; he unties it, and it drifts over to her.
- **Balloon on the see-saw.** He holds the low end down; she jumps to the high end and grabs a balloon.

## Level 1, the park, against the rules

| Section | What happens | Which rule |
|---|---|---|
| 1 Learn to move | A long flat path with a few very low steps and one low log. Only the two siblings, and their keys shown as pictures, one move at a time. No puzzle, nothing to collect. | 1 |
| 2 Plate and gate | *Teach.* A plate opens the gate while someone stands on it. One holds, one walks through and holds the plate on the far side. | 3 |
| 3 Box on plate | *Practise.* This time there is no plate on the far side, but there is a box. A box can do a person's job. | 3 |
| 4 The pond | A calm moment: ducks to splash at. Nothing has to be done. | 4 |
| 5 The balloon | *Twist.* A balloon is caught in a tree, too high for either. She lifts him. | 3 |
| 6 The way out | Two plates side by side, both at once, a high five. | 7 |

The plate is the idea that is met three times (alone, with a box, two at once). The lift is met once here, as the
surprise; it comes back in every later level.

## How to check a level against these rules

- **By script.** Each level has a scripted play-through that reports the time for each section, and a second test
  that tries to finish every puzzle with one sibling alone. The script never hesitates, so its times are a floor:
  what matters is that each puzzle takes only a little longer than the one before.
- **By watching children of 5 to 10.** Where do they stand still for more than ten seconds? Where do they laugh?
  Does anybody only wait? Which hint (sparkle, arrow, ghost) did each puzzle need? A puzzle that needs the ghost
  for most children is too hard for where it stands, and moves to a later level.

## Level 1, measured (2026-11-24, the plain version)

From the scripted play-through, `game/tools/playtest-park.html`. The script walks straight to each thing and never
stops to think, so real players will take longer: my guess is three to four times as long, which has to be checked
with players.

| Section | Script | What it shows |
|---|---|---|
| 1 Learn to move | 47 s | No puzzle and no hint. The script waits about 14 of these seconds on purpose, to see the ghosts appear; walking it straight through takes about half a minute. For a first-time player, one to two minutes (rule 1). |
| 2 Plate and gate (teach) | 14 s | The easiest puzzle comes first. |
| 3 Box on plate (practise) | 21 s | The longest: the one harder step of the level. |
| 4 The pond | 9 s | Nothing to solve after the harder one (rule 4). |
| 5 The balloon (twist) | 10 s | Short again. |
| 6 The way out | 10 s | The easiest of all, and both at once (rule 7). |
| Whole level | 110 s | About 5 to 7 minutes for players (rule 5). The city lab takes the same script 153 s. |

The five puzzle sections take exactly as long as in the first version (2026-11-23: 14, 21, 9, 10 and 10 s): the
puzzles and their tuning were not touched. Only section 1 changed (it was 23 s, with a dog, a ball, a puddle and a
fence in it).

So the order is easy, harder, calm, easy, easy. The second test (`?solo=1`) lets one sibling try every puzzle alone,
with every short cut I could think of (37 checks); none works, and nobody gets through section 1 without jumping. In
every puzzle both siblings walk and both do something (rule: neither one only waits).

## Level 3, the canal, against the rules

| Section | What happens | Which rule |
|---|---|---|
| 1 Warm-up | Plate and gate, known from Level 1. Nothing else on the first screen. | 6 |
| 2 The thin plank | *Teach.* The new idea alone: it holds him, it sends her back. A plate brings a sturdy bridge for her. | 3 |
| 3 The see-saw and the boats | *Practise.* See-saw + light-only: she launches him to the middle boat; his lever sends the raft for her. | 3, combinations |
| 4 A calm moment | Ducks and a rowing boat. Nothing has to be done. | 4 |
| 5 The box over the plank | *Twist.* Carry + plate + light-only: the box on the plate lets her ladder down; her lever opens the lock. | 3, combinations |
| 6 The see-saw on the ledge | Known tools only: carry + see-saw. The box is a step up; she launches him to the high lever. | combinations |
| 7 The Old Bridge | Two levers on opposite banks, at once; he gets to his over the small boats. A high five; the forest ahead. | 7 |

## Level 3, measured (2026-11-25)

From the scripted play-through, `game/tools/playtest-canal.html`. As before, real players will take several times
as long: my guess is seven to nine minutes, which has to be checked with players.

| Section | Script | What it shows |
|---|---|---|
| 1 Warm-up | 11 s | Easier than Level 2's last puzzle (the Old Bridge there takes the same script 18 s): rule 6. |
| 2 The thin plank (teach) | 14 s | A little more, and it includes her trying the plank once. |
| 3 The see-saw and the boats (practise) | 18 s | The first combination. |
| 4 A calm moment | 9 s | The dip (rule 4). |
| 5 The box over the plank (twist) | 17 s | About as long as section 3. |
| 6 The see-saw on the ledge | 16 s | No longer than the one before: known tools only. |
| 7 The Old Bridge | 21 s | The longest, but nearly half of it is the walk over the bridge and on to the forest path. |
| Whole level | 104 s | The park takes the script 110 s, the city 153 s. |

So the times rise gently (11, 14, 18), dip (9), and stay level through the combinations (17, 16) to the finale (21).
The solo test (`?solo=1`, 45 checks) confirms that no puzzle can be finished by one sibling alone, that the sister
can never cross a light-only surface (walking, jumping onto it, jumping again the moment she lands, hopping from boat
to boat, or carrying him), and that the brother cannot reach the bonus lever without her see-saw launch.

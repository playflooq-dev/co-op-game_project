# Open Questions & Concepts

Things still to decide. When one is agreed, move it to [DECISIONS.md](DECISIONS.md) and
delete it here. Options marked *(suggested)* are only suggestions and not approved.

Every idea here has to follow the originality rules in DECISIONS.md: it comes from real
crafts, places and materials, never from other games, and never from the first things an AI
would suggest.

## 1. Theme and characters
- **Leading direction, still open to challenge:** "two players make the world they walk on."
  Each world is a real craft, the characters become its tools, and the craft's making
  process is the puzzle.
- Which crafts? Each one needs real references gathered first.
- What exactly are the two characters in each craft, and how does each become a tool?
- Is there a story, or just a series of puzzles?

## 2. How the game looks and moves
- Gameplay is on a flat 2D plane. Which view on that plane?
  - **Top-down grid** (one tile per step) *(suggested)*: calm, suits thinking puzzles, and
    is easy to keep in sync online.
  - **Side view**: more timing, but harder to build and to sync online.
- How does the 2.5D scene frame the flat play area on a small phone screen?

## 3. Split abilities
- In each craft, which player makes or reveals the path, and which one uses it?
- Do the roles stay fixed, swap between levels, or swap within a level?

## 4. Split information
- How much does each player see that the other doesn't? It should stay light for people who
  don't usually play games.
- Should both players have the same amount of hidden information, or should one lead?

## 5. Communication
- Will players mostly talk by voice (same room or a call)?
- In-game tools: pings (tap a spot to highlight it), simple gestures, quick messages?

## 6. Failing and difficulty
- What happens on a mistake: full level restart, checkpoint, or a gentler penalty?
- Should each level teach one new idea before combining them?
- Hints for when players are stuck?

## 7. Scope
- How many of the roughly 50 levels go in the first playable version? (Maybe 5 to 10.)
- How do players find each other: room code, invite link, or both?

## 8. Technology
- Language and tools around three.js: TypeScript with a small Node.js server *(suggested)*.
- Where to host the server so friends can join from anywhere? This is needed early, because
  the game is online from the start.
- What does the thin online layer send, so it is easy to move to the client's shared
  multiplayer system later?
- App-store versions later: nothing to decide yet, but avoid choices that block wrapping
  the web app.

## Removed from the earlier draft
Character ideas such as Sun & Moon, fire and water, or a robot and a ghost, and the list of
other games used as references, were removed because they break the originality rules.

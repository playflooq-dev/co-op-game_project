# CLAUDE.md

Context for any Claude session working on this repo. Read it fully before starting.

## The project

A two-player co-op puzzle game for phones, made for a client whose name stays confidential.
Never write the client's name anywhere in this repo.

- **Audience:** people who don't usually play games, such as couples and friends. Short sessions, simple touch buttons.
- **Players:** exactly 2, each on their own phone, playing together online.
- **Platform:** a web app in the phone browser, online from the start, at 30 fps or more. App-store versions may come later; avoid choices that block wrapping the web app.
- **Size:** about 50 short levels across 5 or 6 worlds, starting very easy.
- **Core rule:** no puzzle can be solved alone. One player makes or reveals the path, the other uses it.
- **Co-op style:** split abilities (each player can do different things) plus light split information (each sees something the other doesn't). Keep the hidden information light: the audience is not used to games.
- **Online layer:** keep it thin and separate. The client plans one shared multiplayer system later, so the game must only depend on a small send/receive interface that a new adapter can fill.
- **Look:** calm, readable, small palette. 2.5D scenes in three.js, with gameplay on a flat 2D plane (a grid).

## Originality rules (most important to the client)

- Every world, art style and mechanic comes from real life: crafts, places and materials. Never from other games.
- Drop anything an AI would suggest first, such as stained glass, glowing silhouettes, lanterns, mirror worlds, or fire and water as plain opposites.
- Never invent references. Every craft fact must come from a real source you have checked.
- Weaving looms, origami and pottery are ruled out as too obvious. Bamboo scaffolding is ruled out because of the November 2025 Wang Fuk Court fire in Hong Kong.

## Decided so far

- **Characters:** the players are the craft's tools, and each character's powers are what that real tool does. Other framings (materials, forces of a process, matching pairs) stay open for later.
- **Leading direction:** "two players make the world they walk on." Each world is a real craft, and the craft's making process is the puzzle.
- **Core loop (proposed, testing in the trial):** the Maker shapes the path but can't cross the level; the Walker crosses but can't change it. Tools swap every level. No timers early on; tap to place, tap to step.
- **Avoid** mechanics where both players must act at the same moment: network delay makes them unfair online and they go against "calm."
- **First world:** lace, with the Pin and the Bobbin.
- **Candidate later worlds:** canal locks (Windlass and Boat), thatching (Yealm and Thatcher), hand papermaking (Mould and Coucher), ropewalk (Hook and Top), ice harvest (Plow and Pole). Spares: surveying chain, Guerande salt marshes.

Full records: `DECISIONS.md` and `OPEN_QUESTIONS.md` (pull request #1). Move an item to DECISIONS.md only once the user approves it.

## How each world is made (the client's pipeline)

1. Gather real references for the craft.
2. Take the co-op mechanic from the craft's making process.
3. Fable 5.2 builds the scene in three.js as 2.5D and reviews its own screenshots for at least three passes.
4. Opus 5.5 gives a second review.
5. Check the scene on a real phone.
6. Add the two-phone connection.
7. Add the puzzles.

## Engineering rules

- Trial levels may be rough. The real game must have a well-defined architecture, reusable components and a neat, clean file structure, so it can scale to many worlds.
- Keep layers that only depend downwards, as in the trial:
  - `core/`: pure game logic and level data, no browser code;
  - `session/`: two-player sync, independent of the network;
  - `net/`: one small adapter per way of connecting;
  - `ui/`: screens and drawing, which only turn input into actions.
- Validate everything that arrives from the other phone.
- Write tests for rules and sync. Check visual work with phone-sized screenshots.

## Working with the user

- Describe big ideas before building them.
- Ask when something is unclear.
- Never use em dashes in anything you write: code, docs, commits or replies.
- Commit on a branch and open a pull request. Don't push to main.

## Current status (2026-11-16)

- **Pull request #1** (`docs/sync-with-brief`) brings DECISIONS.md and OPEN_QUESTIONS.md in line with the brief. Not merged yet.
- **Pull request #2** (`trial/lace-world`) has the lace trial in `prototypes/lace-trial/`. See its README for how to play, run and test it, and for the deliberate trial shortcuts.
- The trial is published as a Claude artifact using the artifact `room` capability, so two phones can play from one link: https://claude.ai/artifact/NLuiwE87U8azScRNSRbRT8
- **Open problem:** the user could not connect two phones on the published page. The most likely cause is that the page checked for the artifact host only once at start-up and fell back to one-browser mode.
- **Next step:** a fix was started but not finished, tested or pushed. It waits for the host, shows a clear error instead of the silent fallback, and adds a live connection line on the waiting screens. If it isn't on the branch, redo it:
  1. Change `net/connect.ts`, `net/room-transport.ts`, `net/transport.ts`, `main.ts` and `ui/lobby-screens.ts`.
  2. Run `npm run typecheck`, `npm test`, `npm run build` and `npm run test:e2e`.
  3. Republish `dist/index.html` to the artifact above.
  4. Ask the user what the lobby and waiting screens say on each phone.
- **After the trial works:** playtest with real non-gamer pairs, then write the lace world's full design and rebuild it properly on the clean architecture with three.js.

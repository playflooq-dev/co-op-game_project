# Lace trial: the Pin and the Bobbin

A rough, playable trial of the lace world: three levels for two players on two phones.
It exists to test whether the core idea is fun. It is not the final game and has no final art.

## How it plays

- One player is **the Pin**, the other **the Bobbin**. The tools swap every level.
- The Bobbin sees the lace pattern. The Pin sees only the holes in the pattern card.
- The Pin places pins (tap a hole) and takes them out again (tap a pin).
- The Bobbin lays the thread in straight lines (tap a hole in line with the thread).
  The thread can only turn where a pin is waiting.
- Either player can tap **Point**, then a hole, to show it on the partner's phone.

| Level | Idea it teaches |
|---|---|
| 1. One corner | One pin, one turn. Point, pin, lay. |
| 2. Zigzag | Three pins, three turns. Agree on the order. |
| 3. Not enough pins | Two pins, four turns. Take pins out behind the thread and reuse them. |

## Running it

```sh
npm install        # esbuild, typescript, playwright (dev only)
npm test           # rules and online-session unit tests
npm run typecheck
npm run build      # writes dist/index.html, one self-contained page
npm run serve      # http://localhost:5173, open it in two tabs to play both sides
npm run test:e2e   # two phone-sized pages play all three levels, screenshots in test-output/
```

For two phones, the built page is published as a Claude artifact with the `room`
capability, which carries the game between phones with no server of our own.

### On Cloudflare (no claude.ai sign-in needed)

```sh
npm run dev:cloudflare   # the real Worker locally, on http://localhost:8787
npm run deploy           # builds dist-cloudflare/ and deploys with Wrangler
```

One Worker (`worker/relay.ts`) serves the page and relays messages between the two
devices of a game, one Durable Object per game code. The Cloudflare build carries a
`lace-relay` meta tag, which makes the page connect through `net/websocket-transport.ts`.
The relay understands nothing about the game; each device's session validates every message.

## Structure

```
src/
  core/        Pure game logic, no browser code. Shared by every part of the game.
    types.ts       Points, roles, levels, game state, actions
    grid.ts        Grid and path helpers
    lace-rules.ts  The rule set: applyAction(state, action, role) and input checks
    levels.ts      The three trial levels as data
    roles.ts       Which seat plays which tool on each level
  session/     Two-player sync, independent of any network.
    protocol.ts    Messages between phones, with validation
    session.ts     Host and guest sessions
  net/         The thin online layer. One small adapter per way of connecting.
    transport.ts       The interface the game needs: send and receive messages
    room-transport.ts  Claude artifact room (used for the phone trial)
    websocket-transport.ts  Our own relay on Cloudflare (worker/relay.ts)
    local-transport.ts Two tabs of one browser (development)
    connect.ts         Picks the best available transport
  ui/          Screens and drawing. Turns taps into actions, never changes state itself.
    board-view.ts      Canvas drawing of the pattern card and hit-testing
    game-screen.ts     HUD, buttons and the level-complete card
    lobby-screens.ts   Start, join, waiting
    dom.ts, theme.ts   Small helpers and the palette
  main.ts      Wires a session to the screens
  index.html, styles.css
tools/         build.mjs (one-file build), serve.mjs (local server)
tests/         Unit tests and the two-player end-to-end script
```

The layers only depend downwards: `ui` and `session` use `core`, `session` uses the
`net` interface, and `core` uses nothing. This is the shape the full game should keep.

## Shortcuts taken for the trial

These are deliberate and should be replaced in the real build:

- **Drawing:** flat canvas shapes instead of the planned three.js 2.5D scene and real art.
- **Online:** the phone that starts the game holds the true state and checks every move.
  Both phones receive the full state, so the pattern is hidden from the Pin only on screen.
  The real game should hold state on a server and send each phone only what it may see.
- **Transport:** the artifact `room` only works for people signed in to claude.ai with access
  to the artifact. The real game needs its own server or the client's multiplayer system,
  added as one more adapter in `net/`.
- **Levels:** only straight runs on a square grid. Real torchon lace also uses diagonals.

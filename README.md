# Co-op Survival

An online co-op, top-down wave-survival game for 1–4 players, played in the browser.

Team up, shoot the enemies that pour in from the edges of the arena, and revive downed
teammates by standing next to them. Each wave is bigger than the last, and waves scale
with the size of your team. The game ends when everyone is down.

## Running it

Requires Node.js 20+.

```bash
npm install
npm start
```

Open http://localhost:3000 in a browser. Other players on your network can join at
`http://<your-ip>:3000`. Set `PORT` to use a different port.

For development, `npm run dev` restarts the server when server code changes (re-run
`npm run build:client` after editing client code).

## Controls

| Action | Input |
|---|---|
| Move | WASD / arrow keys |
| Aim | Mouse |
| Shoot | Left click (hold) |
| Start / restart | Click or Enter in the lobby / game-over screen |
| Revive teammate | Stand inside their dashed circle |

## Project layout

```
src/shared/protocol.ts   Constants and message types shared by server and client
src/server/game.ts       Authoritative game simulation (players, enemies, waves, revives)
src/server/index.ts      HTTP static server + WebSocket server, 30 Hz tick loop
src/client/main.ts       Browser client: input, networking, canvas rendering
public/index.html        Page shell (client is bundled to public/bundle.js)
```

The server is authoritative: clients send only their input, and the server simulates
the game and broadcasts a state snapshot every tick.

## Enemies

| Enemy | Colour | Notes |
|---|---|---|
| Grunt | Red | Standard enemy |
| Runner | Yellow | Fast and fragile, from wave 2 |
| Brute | Purple | Slow, tanky, hits hard, from wave 3 |

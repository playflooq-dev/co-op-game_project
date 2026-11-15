import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";
import { WebSocketServer, WebSocket } from "ws";
import { Game } from "./game.js";
import { TICK_RATE, type ClientMessage, type ServerMessage } from "../shared/protocol.js";

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = resolve(process.cwd(), "public");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".map": "application/json",
};

// Serve the static client from public/.
const server = createServer(async (req, res) => {
  let urlPath: string;
  try {
    urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
  } catch {
    res.writeHead(400).end();
    return;
  }
  const filePath = normalize(join(PUBLIC_DIR, urlPath === "/" ? "index.html" : urlPath));
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(filePath);
    res.writeHead(200, { "Content-Type": MIME[extname(filePath)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
});

const game = new Game();
const sockets = new Map<WebSocket, string>();
const wss = new WebSocketServer({ server, path: "/ws" });

const send = (ws: WebSocket, msg: ServerMessage) => {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
};

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }
    const id = sockets.get(ws);
    if (msg.type === "join" && !id) {
      if (game.isFull()) {
        send(ws, { type: "full" });
        ws.close();
        return;
      }
      const newId = randomUUID();
      sockets.set(ws, newId);
      game.addPlayer(newId, String(msg.name ?? ""));
      send(ws, { type: "welcome", id: newId });
      console.log(`+ ${msg.name} joined (${game.playerCount} players)`);
    } else if (msg.type === "input" && id) {
      game.setInput(id, msg.input);
    } else if (msg.type === "start" && id) {
      game.requestStart();
    }
  });

  ws.on("close", () => {
    const id = sockets.get(ws);
    if (id) {
      game.removePlayer(id);
      sockets.delete(ws);
      console.log(`- player left (${game.playerCount} players)`);
    }
  });
});

// Fixed-step simulation loop; broadcast a snapshot every tick.
const dt = 1 / TICK_RATE;
setInterval(() => {
  game.update(dt);
  if (sockets.size === 0) return;
  const payload = JSON.stringify({ type: "state", state: game.snapshot() } satisfies ServerMessage);
  for (const ws of sockets.keys()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(payload);
  }
}, 1000 / TICK_RATE);

server.listen(PORT, () => {
  console.log(`Co-op game server running at http://localhost:${PORT}`);
});

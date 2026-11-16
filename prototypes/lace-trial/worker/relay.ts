// The Cloudflare Worker for the trial: serves the built page (static assets) and relays
// messages between the two devices of a game. It understands nothing about the game:
// the session layer on each device validates every message, as it does over any transport.
import { DurableObject } from 'cloudflare:workers';

interface Env {
  ROOMS: DurableObjectNamespace<GameRoom>;
}

/** A game is two devices; a few extra sockets allow a reload to overlap the old one closing. */
const MAX_SOCKETS = 4;
/** Session messages are small JSON; anything bigger is not ours. */
const MAX_MESSAGE_CHARS = 8 * 1024;
const ROOM_PATH = /^\/ws\/([a-z0-9][a-z0-9-]{0,47})$/;

/** One small relay per game code. Uses hibernating WebSockets, so an idle game costs nothing. */
export class GameRoom extends DurableObject<Env> {
  override async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('Expected a WebSocket', { status: 426 });
    }
    if (this.ctx.getWebSockets().length >= MAX_SOCKETS) {
      return new Response('This game is busy', { status: 503 });
    }
    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  override webSocketMessage(sender: WebSocket, message: string | ArrayBuffer): void {
    if (typeof message !== 'string' || message.length > MAX_MESSAGE_CHARS) return;
    for (const socket of this.ctx.getWebSockets()) {
      if (socket === sender) continue;
      try {
        socket.send(message);
      } catch {
        // A socket that is closing; the other device's session resends what matters.
      }
    }
  }

  override webSocketClose(socket: WebSocket, code: number, reason: string): void {
    try {
      socket.close(code, reason);
    } catch {
      // Already closed.
    }
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    // Static files are served before the Worker runs, so only /ws/... and unknown paths reach here.
    const match = ROOM_PATH.exec(new URL(request.url).pathname);
    if (!match?.[1]) return new Response('Not found', { status: 404 });
    return env.ROOMS.get(env.ROOMS.idFromName(match[1])).fetch(request);
  },
} satisfies ExportedHandler<Env>;

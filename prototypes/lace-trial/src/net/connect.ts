import { createLocalTransport } from './local-transport.ts';
import { createRoomTransport, type RoomCapability } from './room-transport.ts';
import type { Transport } from './transport.ts';
import { createWebSocketTransport, relayUrl } from './websocket-transport.ts';

/**
 * - `relay`: deployed with our own relay (Cloudflare); the page carries a `lace-relay` meta tag.
 * - `room`: published as a Claude artifact; devices connect through the shared room.
 * - `unavailable`: inside a Claude page that can't reach the room (for example signed out).
 * - `local`: plain page with no Claude host, such as `npm run serve`; tabs of one browser only.
 */
export type TransportKind = 'relay' | 'room' | 'unavailable' | 'local';

interface ClaudeHost {
  use?: (name: string) => Promise<unknown>;
}

let roomCapability: Promise<RoomCapability | null> | null = null;

const claudeHost = (): ClaudeHost | undefined => (globalThis as { claude?: ClaudeHost }).claude;

/** The relay path baked into the page by `npm run build:cloudflare`, or null. */
function relayBase(): string | null {
  const meta = globalThis.document?.querySelector('meta[name="lace-relay"]');
  return meta?.getAttribute('content') || null;
}

/**
 * Asks the page host for the artifact `room` capability, once. Inside the claude.ai viewer the
 * host is there before any script runs and answers within a few seconds (null after 10 s if not).
 */
function getRoomCapability(): Promise<RoomCapability | null> {
  if (!roomCapability) {
    const host = claudeHost();
    roomCapability =
      typeof host?.use === 'function'
        ? host.use('room').then((room) => (room ? (room as RoomCapability) : null)).catch(() => null)
        : Promise.resolve(null);
  }
  return roomCapability;
}

/** Finds out early how games will connect, so the start screen can say so. */
export async function detectTransportKind(): Promise<TransportKind> {
  if (relayBase()) return 'relay';
  if (await getRoomCapability()) return 'room';
  return typeof claudeHost()?.use === 'function' ? 'unavailable' : 'local';
}

/**
 * Opens the transport for a game code. When the shared room exists it is always used, and a
 * failure to join throws a ConnectError instead of quietly dropping to one-browser mode.
 */
export async function openTransport(code: string): Promise<{ transport: Transport; kind: TransportKind }> {
  const gameName = `lace-${code.toLowerCase()}`;
  const relay = relayBase();
  if (relay) return { transport: await createWebSocketTransport(relayUrl(relay, gameName)), kind: 'relay' };
  const room = await getRoomCapability();
  if (room) return { transport: await createRoomTransport(room, gameName), kind: 'room' };
  return { transport: createLocalTransport(gameName), kind: await detectTransportKind() };
}

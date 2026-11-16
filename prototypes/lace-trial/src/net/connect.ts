import { createLocalTransport } from './local-transport.ts';
import { createRoomTransport, type RoomCapability } from './room-transport.ts';
import type { Transport } from './transport.ts';

export type TransportKind = 'room' | 'local';

let roomCapability: Promise<RoomCapability | null> | null = null;

/** Asks the page host for the artifact `room` capability once. Null outside a published artifact. */
function getRoomCapability(): Promise<RoomCapability | null> {
  if (!roomCapability) {
    const host = (globalThis as { claude?: { use?: (name: string) => Promise<unknown> } }).claude;
    roomCapability =
      typeof host?.use === 'function'
        ? host.use('room').then((room) => (room ? (room as RoomCapability) : null)).catch(() => null)
        : Promise.resolve(null);
  }
  return roomCapability;
}

/** Finds out early which transport games will use, so the lobby can say so. */
export async function detectTransportKind(): Promise<TransportKind> {
  return (await getRoomCapability()) ? 'room' : 'local';
}

/** Opens the best available transport for a game code. */
export async function openTransport(code: string): Promise<{ transport: Transport; kind: TransportKind }> {
  const gameName = `lace-${code.toLowerCase()}`;
  const room = await getRoomCapability();
  if (room) {
    try {
      return { transport: await createRoomTransport(room, gameName), kind: 'room' };
    } catch {
      // Fall through to the local transport so the page still works in one browser.
    }
  }
  return { transport: createLocalTransport(gameName), kind: 'local' };
}

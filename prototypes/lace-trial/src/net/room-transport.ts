import type { Transport } from './transport.ts';

/** The small part of the Claude artifact `room` capability this adapter uses. */
interface RoomMessage {
  readonly data?: unknown;
  readonly sameTab: boolean;
}
interface NamedRoom {
  emit(topic: string, data?: unknown): Promise<void>;
  on(topic: string, handler: (message: RoomMessage) => void): () => void;
  leave(): Promise<void>;
}
export interface RoomCapability {
  join(name: string): Promise<NamedRoom>;
}

const TOPIC = 'game';

/**
 * Carries the game through a published Claude artifact, so two phones can play
 * from one shared link with no server of our own. Used for the trial only.
 */
export async function createRoomTransport(room: RoomCapability, gameName: string): Promise<Transport> {
  const named = await room.join(gameName);
  const handlers = new Set<(message: unknown) => void>();
  const unsubscribe = named.on(TOPIC, (message) => {
    if (message.sameTab) return;
    for (const handler of handlers) handler(message.data);
  });
  return {
    send(message) {
      named.emit(TOPIC, message).catch(() => {
        // Dropped messages are expected; the session resends what matters.
      });
    },
    onMessage(handler) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    close() {
      handlers.clear();
      unsubscribe();
      named.leave().catch(() => {});
    },
  };
}

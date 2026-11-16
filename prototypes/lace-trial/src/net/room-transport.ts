import { ConnectError, type Transport } from './transport.ts';

/** The small part of the Claude artifact `room` capability this adapter uses. */
type Unsubscribe = () => void;
type OnError = (error: { code: string; message: string }) => void;
interface RoomMessage {
  readonly data?: unknown;
  readonly sameTab: boolean;
  readonly kind: string;
}
interface NamedRoom {
  emit(topic: string, data?: unknown): Promise<void>;
  on(topic: string, handler: (message: RoomMessage) => void, onError?: OnError): Unsubscribe;
  connected(): boolean;
  onConnection(handler: (connected: boolean) => void, onError?: OnError): Unsubscribe;
  leave(): Promise<void>;
}
export interface RoomCapability {
  join(name: string): Promise<NamedRoom>;
  connected(): boolean;
  onConnection(handler: (connected: boolean) => void, onError?: OnError): Unsubscribe;
}

export interface RoomTransportOptions {
  /** How long to wait for the shared room to come up before giving up. */
  readonly connectTimeoutMs?: number;
  /** How many times to try joining the game's room. */
  readonly joinAttempts?: number;
}

const TOPIC = 'game';
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const errorCode = (error: unknown): string =>
  typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : 'unknown';

/**
 * Resolves once the room is connected. The room starts disconnected on every page load and
 * normally connects within a second; joining before that can be refused.
 */
function waitForConnection(room: RoomCapability, timeoutMs: number): Promise<void> {
  if (room.connected()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let off: Unsubscribe = () => {};
    const finish = (error?: ConnectError) => {
      clearTimeout(timer);
      queueMicrotask(() => off());
      if (error) reject(error);
      else resolve();
    };
    const timer = setTimeout(() => finish(new ConnectError('no-connection', 'timed out')), timeoutMs);
    off = room.onConnection(
      (connected) => {
        if (connected) finish();
      },
      (error) => finish(new ConnectError(error.code === 'not_granted' ? 'not-permitted' : 'no-connection', error.code)),
    );
  });
}

/**
 * Carries the game through a published Claude artifact, so two devices can play
 * from one shared link with no server of our own. Used for the trial only.
 * Never falls back silently: if it can't join, it throws a ConnectError the screens explain.
 */
export async function createRoomTransport(
  room: RoomCapability,
  gameName: string,
  options: RoomTransportOptions = {},
): Promise<Transport> {
  const { connectTimeoutMs = 15000, joinAttempts = 4 } = options;
  let named: NamedRoom | null = null;
  let lastCode = 'unknown';
  for (let attempt = 1; attempt <= joinAttempts && !named; attempt++) {
    await waitForConnection(room, connectTimeoutMs);
    try {
      named = await room.join(gameName);
    } catch (error) {
      lastCode = errorCode(error);
      if (lastCode === 'not_permitted' || lastCode === 'not_granted' || lastCode === 'revoked') {
        throw new ConnectError('not-permitted', lastCode);
      }
      if (attempt < joinAttempts) await sleep(800 * attempt);
    }
  }
  if (!named) throw new ConnectError('join-failed', lastCode);
  const joined = named;

  const handlers = new Set<(message: unknown) => void>();
  const connectionHandlers = new Set<(connected: boolean) => void>();
  const unsubscribe = joined.on(
    TOPIC,
    (message) => {
      // Our own echo, or not a person (the publishing Claude session can be in the room).
      if (message.sameTab || message.kind !== 'viewer') return;
      for (const handler of handlers) handler(message.data);
    },
    () => connectionHandlers.forEach((handler) => handler(false)),
  );
  const offConnection = joined.onConnection((connected) => connectionHandlers.forEach((handler) => handler(connected)));

  return {
    send(message) {
      joined.emit(TOPIC, message).catch(() => {
        // Dropped messages are expected; the session resends what matters.
      });
    },
    onMessage(handler) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    onConnection(handler) {
      connectionHandlers.add(handler);
      queueMicrotask(() => handler(joined.connected()));
      return () => connectionHandlers.delete(handler);
    },
    close() {
      handlers.clear();
      connectionHandlers.clear();
      unsubscribe();
      offConnection();
      joined.leave().catch(() => {});
    },
  };
}

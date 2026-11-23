/**
 * The whole online layer the game depends on: send a plain JSON message to the other phone,
 * and hear the other phone's messages. Anything that can do this can carry the game,
 * so the client's planned shared multiplayer system only needs one new adapter.
 *
 * Delivery is not guaranteed and messages may arrive more than once.
 * The session layer copes with both.
 */
export interface Transport {
  /** Sends to every other page in the same game. Never echoes back to the sender. */
  send(message: unknown): void;
  /** Hears messages from other pages. Data is untrusted and must be validated. */
  onMessage(handler: (message: unknown) => void): () => void;
  /**
   * Optional live connection state, for the screens to show. Fires once soon after
   * registering, then on every change. Adapters that can't lose their link may leave it out.
   */
  onConnection?(handler: (connected: boolean) => void): () => void;
  close(): void;
}

/** Why a transport could not be opened. Shown to the player as a plain sentence. */
export type ConnectFailure = 'no-connection' | 'not-permitted' | 'join-failed';

export class ConnectError extends Error {
  readonly failure: ConnectFailure;
  constructor(failure: ConnectFailure, detail?: string) {
    super(detail ? `${failure}: ${detail}` : failure);
    this.failure = failure;
  }
}

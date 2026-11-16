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
  close(): void;
}

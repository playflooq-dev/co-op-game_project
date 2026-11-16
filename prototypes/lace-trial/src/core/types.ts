/** A hole on the pattern card, in grid units. x grows right, y grows down. */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/** The two tools. Each player is one tool per level, and the tools swap every level. */
export type Role = 'pin' | 'bobbin';

/** Seat 0 started the game, seat 1 joined it. */
export type Seat = 0 | 1;

export interface LevelDef {
  readonly id: string;
  readonly title: string;
  readonly cols: number;
  readonly rows: number;
  /** Corner points of the lace pattern from start to end, joined by straight runs. */
  readonly pattern: readonly Point[];
  /** How many pins the Pin player has for this level. */
  readonly pins: number;
  /** One short instruction per tool, shown on that player's phone. */
  readonly hints: Readonly<Record<Role, string>>;
}

/** A short "look here" signal from one player to the other. */
export interface Ping {
  readonly at: Point;
  readonly by: Role;
  readonly id: number;
}

/** Everything both phones need to agree on. Plain data so it can travel over any transport. */
export interface GameState {
  readonly levelIndex: number;
  readonly pins: readonly Point[];
  /** The laid thread as visited holes, starting at the pattern's first point. */
  readonly thread: readonly Point[];
  readonly solved: boolean;
  readonly ping: Ping | null;
  /** Goes up by one with every accepted action. */
  readonly revision: number;
}

export type Action =
  | { readonly type: 'place-pin'; readonly at: Point }
  | { readonly type: 'remove-pin'; readonly at: Point }
  | { readonly type: 'move-thread'; readonly to: Point }
  | { readonly type: 'undo-thread' }
  | { readonly type: 'ping'; readonly at: Point }
  | { readonly type: 'restart-level' }
  | { readonly type: 'next-level' }
  | { readonly type: 'restart-trial' };

export type ActionResult =
  | { readonly ok: true; readonly state: GameState }
  | { readonly ok: false; readonly reason: string };

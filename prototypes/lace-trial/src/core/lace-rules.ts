import { containsPoint, inGrid, isPoint, pathsEqual, samePoint, straightDirection } from './grid.ts';
import type { Action, ActionResult, GameState, LevelDef, Point, Role } from './types.ts';

/** Friendly refusal messages, shown on the phone of the player who tried the move. */
export const REASONS = {
  notYourTool: "That's your partner's job.",
  finished: 'This piece is finished.',
  notFinished: 'Finish this piece first.',
  lastLevel: 'That was the last trial level.',
  outside: 'That is off the card.',
  noPinsLeft: 'No pins left. Take one out behind the thread to use it again.',
  pinAlreadyThere: 'There is already a pin there.',
  noPinThere: 'There is no pin there.',
  threadResting: 'The thread is waiting at this pin. It has to move on first.',
  notInLine: 'The thread runs in straight lines. Tap a hole in line with it.',
  doubleBack: "The thread can't double back on itself.",
  needsPin: 'To turn here, the thread needs a pin. Ask your partner.',
  nothingToUndo: 'Nothing to undo yet.',
  unknown: "That move isn't possible.",
} as const;

export function createInitialState(levels: readonly LevelDef[], levelIndex = 0, revision = 0): GameState {
  const level = levelAt(levels, levelIndex);
  return {
    levelIndex,
    pins: [],
    thread: [level.pattern[0] as Point],
    solved: false,
    ping: null,
    revision,
  };
}

export function levelAt(levels: readonly LevelDef[], index: number): LevelDef {
  const level = levels[index];
  if (!level) throw new Error(`No level at index ${index}`);
  return level;
}

export function threadHead(state: GameState): Point {
  return state.thread[state.thread.length - 1] as Point;
}

/** Direction of the last laid run, or null before the first move. */
function lastDirection(state: GameState): Point | null {
  const head = state.thread[state.thread.length - 1];
  const prev = state.thread[state.thread.length - 2];
  return head && prev ? straightDirection(prev, head) : null;
}

/** Why the thread can't go from its head in direction `dir`, or null if it can. */
function turnBlocker(state: GameState, dir: Point): string | null {
  const last = lastDirection(state);
  if (!last || samePoint(last, dir)) return null;
  if (last.x === -dir.x && last.y === -dir.y) return REASONS.doubleBack;
  return containsPoint(state.pins, threadHead(state)) ? null : REASONS.needsPin;
}

/** Holes the Bobbin can move the thread to right now. Used to guide new players. */
export function reachableHoles(state: GameState, level: LevelDef): Point[] {
  if (state.solved) return [];
  const head = threadHead(state);
  const out: Point[] = [];
  const dirs: Point[] = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  for (const dir of dirs) {
    if (turnBlocker(state, dir)) continue;
    for (let p = { x: head.x + dir.x, y: head.y + dir.y }; inGrid(p, level.cols, level.rows); p = { x: p.x + dir.x, y: p.y + dir.y }) {
      out.push(p);
    }
  }
  return out;
}

function next(state: GameState, changes: Partial<GameState>): ActionResult {
  return { ok: true, state: { ...state, ...changes, revision: state.revision + 1 } };
}

function refuse(reason: string): ActionResult {
  return { ok: false, reason };
}

/**
 * The whole rule set. Pure: same input, same output, no side effects.
 * `role` is the tool of the player who asked for the action.
 */
export function applyAction(state: GameState, action: Action, role: Role, levels: readonly LevelDef[]): ActionResult {
  const level = levelAt(levels, state.levelIndex);

  switch (action.type) {
    case 'ping':
      if (!inGrid(action.at, level.cols, level.rows)) return refuse(REASONS.outside);
      return next(state, { ping: { at: action.at, by: role, id: state.revision + 1 } });

    case 'restart-level':
      return { ok: true, state: createInitialState(levels, state.levelIndex, state.revision + 1) };

    case 'restart-trial':
      return { ok: true, state: createInitialState(levels, 0, state.revision + 1) };

    case 'next-level':
      if (!state.solved) return refuse(REASONS.notFinished);
      if (state.levelIndex + 1 >= levels.length) return refuse(REASONS.lastLevel);
      return { ok: true, state: createInitialState(levels, state.levelIndex + 1, state.revision + 1) };

    case 'place-pin': {
      if (role !== 'pin') return refuse(REASONS.notYourTool);
      if (state.solved) return refuse(REASONS.finished);
      if (!inGrid(action.at, level.cols, level.rows)) return refuse(REASONS.outside);
      if (containsPoint(state.pins, action.at)) return refuse(REASONS.pinAlreadyThere);
      if (state.pins.length >= level.pins) return refuse(REASONS.noPinsLeft);
      return next(state, { pins: [...state.pins, action.at] });
    }

    case 'remove-pin': {
      if (role !== 'pin') return refuse(REASONS.notYourTool);
      if (state.solved) return refuse(REASONS.finished);
      if (!containsPoint(state.pins, action.at)) return refuse(REASONS.noPinThere);
      if (samePoint(threadHead(state), action.at) && state.thread.length > 1) return refuse(REASONS.threadResting);
      return next(state, { pins: state.pins.filter((p) => !samePoint(p, action.at)) });
    }

    case 'move-thread': {
      if (role !== 'bobbin') return refuse(REASONS.notYourTool);
      if (state.solved) return refuse(REASONS.finished);
      if (!inGrid(action.to, level.cols, level.rows)) return refuse(REASONS.outside);
      const dir = straightDirection(threadHead(state), action.to);
      if (!dir) return refuse(REASONS.notInLine);
      const blocker = turnBlocker(state, dir);
      if (blocker) return refuse(blocker);
      const thread = [...state.thread, action.to];
      return next(state, { thread, solved: pathsEqual(thread, level.pattern) });
    }

    case 'undo-thread': {
      if (role !== 'bobbin') return refuse(REASONS.notYourTool);
      if (state.solved) return refuse(REASONS.finished);
      if (state.thread.length <= 1) return refuse(REASONS.nothingToUndo);
      return next(state, { thread: state.thread.slice(0, -1) });
    }

    default:
      return refuse(REASONS.unknown);
  }
}

/** Checks data from the other phone before trusting it as an action. */
export function isAction(value: unknown): value is Action {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  switch (v.type) {
    case 'place-pin':
    case 'remove-pin':
    case 'ping':
      return isPoint(v.at);
    case 'move-thread':
      return isPoint(v.to);
    case 'undo-thread':
    case 'restart-level':
    case 'next-level':
    case 'restart-trial':
      return true;
    default:
      return false;
  }
}

/** Checks data from the other phone before trusting it as a game state. */
export function isGameState(value: unknown, levels: readonly LevelDef[]): value is GameState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    Number.isInteger(v.levelIndex) &&
    (v.levelIndex as number) >= 0 &&
    (v.levelIndex as number) < levels.length &&
    Array.isArray(v.pins) &&
    v.pins.every(isPoint) &&
    Array.isArray(v.thread) &&
    v.thread.length > 0 &&
    v.thread.every(isPoint) &&
    typeof v.solved === 'boolean' &&
    Number.isInteger(v.revision) &&
    (v.ping === null || (typeof v.ping === 'object' && isPoint((v.ping as Record<string, unknown>).at)))
  );
}

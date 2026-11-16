import { isAction, isGameState } from '../core/lace-rules.ts';
import type { Action, GameState, LevelDef } from '../core/types.ts';

/**
 * Messages between the two phones. The phone that started the game (the host)
 * owns the true game state; the other phone sends requests and shows what it is told.
 */
export type Message =
  | { readonly kind: 'hello'; readonly client: string }
  | { readonly kind: 'welcome'; readonly to: string }
  | { readonly kind: 'full'; readonly to: string }
  | { readonly kind: 'state'; readonly epoch: string; readonly state: GameState }
  | { readonly kind: 'action'; readonly client: string; readonly actionId: string; readonly action: Action }
  | { readonly kind: 'rejected'; readonly to: string; readonly actionId: string; readonly reason: string };

const isText = (v: unknown, max = 64): v is string => typeof v === 'string' && v.length > 0 && v.length <= max;

/** Turns untrusted data into a message, or null if it isn't one. */
export function parseMessage(raw: unknown, levels: readonly LevelDef[]): Message | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const m = raw as Record<string, unknown>;
  switch (m.kind) {
    case 'hello':
      return isText(m.client) ? { kind: 'hello', client: m.client } : null;
    case 'welcome':
    case 'full':
      return isText(m.to) ? { kind: m.kind, to: m.to } : null;
    case 'state':
      return isText(m.epoch) && isGameState(m.state, levels) ? { kind: 'state', epoch: m.epoch, state: m.state } : null;
    case 'action':
      return isText(m.client) && isText(m.actionId) && isAction(m.action)
        ? { kind: 'action', client: m.client, actionId: m.actionId, action: m.action }
        : null;
    case 'rejected':
      return isText(m.to) && isText(m.actionId) && isText(m.reason, 200)
        ? { kind: 'rejected', to: m.to, actionId: m.actionId, reason: m.reason }
        : null;
    default:
      return null;
  }
}

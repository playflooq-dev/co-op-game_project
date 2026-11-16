import { applyAction, createInitialState } from '../core/lace-rules.ts';
import { roleFor } from '../core/roles.ts';
import type { Action, GameState, LevelDef, Seat } from '../core/types.ts';
import type { Transport } from '../net/transport.ts';
import { parseMessage, type Message } from './protocol.ts';

export type SessionStatus = 'waiting-for-partner' | 'joining' | 'playing' | 'game-full';

export interface SessionSnapshot {
  readonly seat: Seat;
  readonly status: SessionStatus;
  readonly state: GameState | null;
  readonly partnerOnline: boolean;
}

/** One phone's view of a two-player game. The UI reads snapshots and sends actions; nothing else. */
export interface Session {
  snapshot(): SessionSnapshot;
  act(action: Action): void;
  onChange(handler: () => void): () => void;
  onNotice(handler: (text: string) => void): () => void;
  dispose(): void;
}

export interface SessionOptions {
  readonly transport: Transport;
  readonly levels: readonly LevelDef[];
  readonly heartbeatMs?: number;
  readonly partnerTimeoutMs?: number;
  readonly resendMs?: number;
}

const randomId = (): string => Math.random().toString(36).slice(2, 12);

/** Small helper for change and notice listeners. */
function emitter<T>() {
  const handlers = new Set<(value: T) => void>();
  return {
    on(handler: (value: T) => void) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    emit(value: T) {
      for (const handler of handlers) handler(value);
    },
  };
}

/**
 * The phone that started the game. It owns the true state, checks every request
 * against the rules, and repeats the state regularly so dropped messages heal.
 */
export function createHostSession(options: SessionOptions): Session {
  const { transport, levels, heartbeatMs = 2000, partnerTimeoutMs = 7000 } = options;
  const epoch = randomId();
  const changes = emitter<void>();
  const notices = emitter<string>();
  const handledActions: string[] = [];
  let state = createInitialState(levels);
  let guest: string | null = null;
  let guestSeenAt = 0;
  let partnerOnline = false;

  const send = (message: Message) => transport.send(message);
  const broadcast = () => send({ kind: 'state', epoch, state });

  const refreshPartner = () => {
    const online = guest !== null && Date.now() - guestSeenAt < partnerTimeoutMs;
    if (online !== partnerOnline) {
      partnerOnline = online;
      changes.emit();
    }
  };

  const unsubscribe = transport.onMessage((raw) => {
    const message = parseMessage(raw, levels);
    if (!message) return;
    if (message.kind === 'hello') {
      if (guest !== null && guest !== message.client) {
        send({ kind: 'full', to: message.client });
        return;
      }
      guest = message.client;
      guestSeenAt = Date.now();
      send({ kind: 'welcome', to: message.client });
      broadcast();
      refreshPartner();
      changes.emit();
    } else if (message.kind === 'action') {
      if (message.client !== guest) return;
      guestSeenAt = Date.now();
      if (handledActions.includes(message.actionId)) {
        broadcast();
        return;
      }
      handledActions.push(message.actionId);
      if (handledActions.length > 200) handledActions.shift();
      const result = applyAction(state, message.action, roleFor(1, state.levelIndex), levels);
      if (result.ok) {
        state = result.state;
        broadcast();
        changes.emit();
      } else {
        send({ kind: 'rejected', to: message.client, actionId: message.actionId, reason: result.reason });
      }
    }
  });

  const heartbeat = setInterval(() => {
    if (guest !== null) broadcast();
    refreshPartner();
  }, heartbeatMs);

  return {
    snapshot: () => ({
      seat: 0,
      status: guest === null ? 'waiting-for-partner' : 'playing',
      state,
      partnerOnline,
    }),
    act(action) {
      const result = applyAction(state, action, roleFor(0, state.levelIndex), levels);
      if (!result.ok) {
        notices.emit(result.reason);
        return;
      }
      state = result.state;
      broadcast();
      changes.emit();
    },
    onChange: (handler) => changes.on(() => handler()),
    onNotice: (handler) => notices.on(handler),
    dispose() {
      clearInterval(heartbeat);
      unsubscribe();
      transport.close();
    },
  };
}

/**
 * The phone that joined. It checks a request locally first for instant feedback,
 * then asks the host, resending a few times if the reply doesn't come.
 */
export function createGuestSession(options: SessionOptions): Session {
  const { transport, levels, heartbeatMs = 2000, partnerTimeoutMs = 7000, resendMs = 1500 } = options;
  const client = randomId();
  const changes = emitter<void>();
  const notices = emitter<string>();
  let epoch: string | null = null;
  let state: GameState | null = null;
  let welcomed = false;
  let full = false;
  let hostSeenAt = 0;
  let partnerOnline = false;
  const pending = new Map<string, ReturnType<typeof setTimeout>>();

  const send = (message: Message) => transport.send(message);
  const sayHello = () => send({ kind: 'hello', client });

  const refreshPartner = () => {
    const online = Date.now() - hostSeenAt < partnerTimeoutMs;
    if (online !== partnerOnline) {
      partnerOnline = online;
      changes.emit();
    }
  };

  const clearPending = (actionId?: string) => {
    for (const [id, timer] of pending) {
      if (actionId === undefined || id === actionId) {
        clearTimeout(timer);
        pending.delete(id);
      }
    }
  };

  const unsubscribe = transport.onMessage((raw) => {
    const message = parseMessage(raw, levels);
    if (!message) return;
    if (message.kind === 'welcome' && message.to === client) {
      welcomed = true;
      changes.emit();
    } else if (message.kind === 'full' && message.to === client) {
      full = true;
      changes.emit();
    } else if (message.kind === 'rejected' && message.to === client) {
      clearPending(message.actionId);
      notices.emit(message.reason);
    } else if (message.kind === 'state') {
      if (!welcomed) return;
      hostSeenAt = Date.now();
      const isNewer = epoch !== message.epoch || state === null || message.state.revision > state.revision;
      if (isNewer) {
        epoch = message.epoch;
        state = message.state;
        clearPending();
        changes.emit();
      }
      refreshPartner();
    }
  });

  sayHello();
  const heartbeat = setInterval(() => {
    if (!full) sayHello();
    refreshPartner();
  }, heartbeatMs);

  const sendAction = (actionId: string, action: Action, triesLeft: number) => {
    send({ kind: 'action', client, actionId, action });
    pending.set(
      actionId,
      setTimeout(() => {
        pending.delete(actionId);
        if (triesLeft > 1) sendAction(actionId, action, triesLeft - 1);
        else notices.emit('The connection is slow. Try that again.');
      }, resendMs),
    );
  };

  return {
    snapshot: () => ({
      seat: 1,
      status: full ? 'game-full' : welcomed && state ? 'playing' : 'joining',
      state,
      partnerOnline,
    }),
    act(action) {
      if (!state) return;
      const preview = applyAction(state, action, roleFor(1, state.levelIndex), levels);
      if (!preview.ok) {
        notices.emit(preview.reason);
        return;
      }
      sendAction(randomId(), action, 3);
    },
    onChange: (handler) => changes.on(() => handler()),
    onNotice: (handler) => notices.on(handler),
    dispose() {
      clearInterval(heartbeat);
      clearPending();
      unsubscribe();
      transport.close();
    },
  };
}

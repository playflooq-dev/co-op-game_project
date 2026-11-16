import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LACE_LEVELS } from '../src/core/levels.ts';
import { createGuestSession, createHostSession, type Session } from '../src/session/session.ts';
import type { Transport } from '../src/net/transport.ts';

/** An in-memory network: every endpoint hears every other endpoint. Like a shared room. */
function createHub() {
  const endpoints = new Set<{ handlers: Set<(m: unknown) => void> }>();
  const control = { dropNextFrom: null as Transport | null };
  const connect = (): Transport => {
    const self = { handlers: new Set<(m: unknown) => void>() };
    endpoints.add(self);
    const transport: Transport = {
      send(message) {
        if (control.dropNextFrom === transport) {
          control.dropNextFrom = null;
          return;
        }
        const copy = JSON.parse(JSON.stringify(message));
        queueMicrotask(() => {
          for (const e of endpoints) if (e !== self) e.handlers.forEach((h) => h(copy));
        });
      },
      onMessage(handler) {
        self.handlers.add(handler);
        return () => self.handlers.delete(handler);
      },
      close() {
        endpoints.delete(self);
      },
    };
    return transport;
  };
  return { connect, control };
}

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

async function until(check: () => boolean, ms = 2000) {
  const end = Date.now() + ms;
  while (!check()) {
    if (Date.now() > end) throw new Error('timed out');
    await tick(5);
  }
}

function pair() {
  const hub = createHub();
  const host = createHostSession({ transport: hub.connect(), levels: LACE_LEVELS, heartbeatMs: 50 });
  const guestTransport = hub.connect();
  const guest = createGuestSession({ transport: guestTransport, levels: LACE_LEVELS, heartbeatMs: 50, resendMs: 60 });
  return { hub, host, guest, guestTransport };
}

const done = (...sessions: Session[]) => sessions.forEach((s) => s.dispose());

test('the guest joins and both phones see the same state', async () => {
  const { host, guest } = pair();
  await until(() => guest.snapshot().status === 'playing');
  assert.equal(host.snapshot().status, 'playing');
  assert.deepEqual(guest.snapshot().state, host.snapshot().state);
  done(host, guest);
});

test('level 1 can be solved with the host as Pin and the guest as Bobbin', async () => {
  const { host, guest } = pair();
  await until(() => guest.snapshot().status === 'playing');
  host.act({ type: 'place-pin', at: { x: 1, y: 1 } });
  await until(() => guest.snapshot().state?.pins.length === 1);
  guest.act({ type: 'move-thread', to: { x: 1, y: 1 } });
  await until(() => host.snapshot().state?.thread.length === 2);
  guest.act({ type: 'move-thread', to: { x: 4, y: 1 } });
  await until(() => guest.snapshot().state?.solved === true);
  assert.equal(host.snapshot().state?.solved, true);
  done(host, guest);
});

test('a lost request is resent, and a wrong-tool request is refused on the guest', async () => {
  const { host, guest, hub, guestTransport } = pair();
  await until(() => guest.snapshot().status === 'playing');
  const notices: string[] = [];
  guest.onNotice((n) => notices.push(n));
  guest.act({ type: 'place-pin', at: { x: 1, y: 1 } });
  assert.equal(notices.length, 1);
  hub.control.dropNextFrom = guestTransport;
  guest.act({ type: 'move-thread', to: { x: 1, y: 2 } });
  await until(() => host.snapshot().state?.thread.length === 2);
  done(host, guest);
});

test('a third phone is told the game is full', async () => {
  const { hub, host, guest } = pair();
  await until(() => guest.snapshot().status === 'playing');
  const extra = createGuestSession({ transport: hub.connect(), levels: LACE_LEVELS, heartbeatMs: 50 });
  await until(() => extra.snapshot().status === 'game-full');
  assert.equal(guest.snapshot().status, 'playing');
  done(host, guest, extra);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRoomTransport, type RoomCapability } from '../src/net/room-transport.ts';
import { ConnectError } from '../src/net/transport.ts';

/**
 * A stand-in for the artifact `room` capability that behaves like the real one where it
 * matters: it starts disconnected, refuses joins until it connects, and echoes to the sender.
 */
function fakeRoom(options: { connectAfterMs?: number; failJoins?: number; joinError?: string } = {}) {
  const { connectAfterMs = 30, failJoins = 0, joinError = 'upstream_error' } = options;
  let connected = false;
  let joinsLeftToFail = failJoins;
  let joinCalls = 0;
  const connectionHandlers = new Set<(c: boolean) => void>();
  const topicHandlers = new Set<(m: { data?: unknown; sameTab: boolean; kind: string }) => void>();
  const timer = setTimeout(() => {
    connected = true;
    connectionHandlers.forEach((h) => h(true));
  }, connectAfterMs);

  const room: RoomCapability = {
    connected: () => connected,
    onConnection(handler) {
      connectionHandlers.add(handler);
      queueMicrotask(() => handler(connected));
      return () => connectionHandlers.delete(handler);
    },
    async join() {
      joinCalls++;
      if (!connected) throw { code: 'upstream_error', message: 'not connected yet' };
      if (joinsLeftToFail > 0) {
        joinsLeftToFail--;
        throw { code: joinError, message: 'refused' };
      }
      return {
        async emit(_topic: string, data?: unknown) {
          topicHandlers.forEach((h) => h({ data, sameTab: true, kind: 'viewer' }));
        },
        on(_topic: string, handler: (m: { data?: unknown; sameTab: boolean; kind: string }) => void) {
          topicHandlers.add(handler);
          return () => topicHandlers.delete(handler);
        },
        connected: () => connected,
        onConnection(handler: (c: boolean) => void) {
          connectionHandlers.add(handler);
          return () => connectionHandlers.delete(handler);
        },
        async leave() {},
      };
    },
  };
  /** Delivers a message as if another device sent it. */
  const deliver = (data: unknown, kind = 'viewer') => topicHandlers.forEach((h) => h({ data, sameTab: false, kind }));
  return { room, deliver, joinCalls: () => joinCalls, stop: () => clearTimeout(timer) };
}

test('waits for the room to connect before joining, instead of failing', async () => {
  const fake = fakeRoom({ connectAfterMs: 50 });
  const transport = await createRoomTransport(fake.room, 'lace-abcd');
  assert.equal(fake.joinCalls(), 1, 'joined once, after the room connected');
  transport.close();
  fake.stop();
});

test('retries a join that fails for a moment', async () => {
  const fake = fakeRoom({ connectAfterMs: 0, failJoins: 2 });
  const transport = await createRoomTransport(fake.room, 'lace-abcd');
  assert.equal(fake.joinCalls(), 3);
  transport.close();
  fake.stop();
});

test('gives a clear error, not a silent fallback, when joining keeps failing', async () => {
  const fake = fakeRoom({ connectAfterMs: 0, failJoins: 99 });
  await assert.rejects(createRoomTransport(fake.room, 'lace-abcd', { joinAttempts: 2 }), (error) => {
    assert.ok(error instanceof ConnectError);
    assert.equal(error.failure, 'join-failed');
    return true;
  });
  fake.stop();
});

test('stops at once when the viewer is not permitted', async () => {
  const fake = fakeRoom({ connectAfterMs: 0, failJoins: 99, joinError: 'not_permitted' });
  await assert.rejects(createRoomTransport(fake.room, 'lace-abcd'), (error) => {
    assert.ok(error instanceof ConnectError);
    assert.equal(error.failure, 'not-permitted');
    return true;
  });
  assert.equal(fake.joinCalls(), 1);
  fake.stop();
});

test('reports a room that never connects', async () => {
  const fake = fakeRoom({ connectAfterMs: 10_000 });
  await assert.rejects(createRoomTransport(fake.room, 'lace-abcd', { connectTimeoutMs: 50 }), (error) => {
    assert.ok(error instanceof ConnectError);
    assert.equal(error.failure, 'no-connection');
    return true;
  });
  fake.stop();
});

test('passes on messages from the other device, but not its own echo or an agent', async () => {
  const fake = fakeRoom({ connectAfterMs: 0 });
  const transport = await createRoomTransport(fake.room, 'lace-abcd');
  const heard: unknown[] = [];
  transport.onMessage((m) => heard.push(m));
  transport.send({ kind: 'hello', client: 'me' }); // comes back as our own echo
  fake.deliver({ kind: 'hello', client: 'partner' });
  fake.deliver({ kind: 'hello', client: 'bot' }, 'agent');
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(heard, [{ kind: 'hello', client: 'partner' }]);
  transport.close();
  fake.stop();
});

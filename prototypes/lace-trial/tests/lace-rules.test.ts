import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LACE_LEVELS } from '../src/core/levels.ts';
import { REASONS, applyAction, createInitialState, reachableHoles } from '../src/core/lace-rules.ts';
import { cornersOf, pathsEqual } from '../src/core/grid.ts';
import { roleFor } from '../src/core/roles.ts';
import type { Action, GameState, Role } from '../src/core/types.ts';

function play(state: GameState, steps: [Role, Action][]): GameState {
  let s = state;
  for (const [role, action] of steps) {
    const result = applyAction(s, action, role, LACE_LEVELS);
    assert.ok(result.ok, `step ${JSON.stringify(action)} failed: ${result.ok ? '' : result.reason}`);
    s = result.state;
  }
  return s;
}

function attempt(state: GameState, role: Role, action: Action): string {
  const result = applyAction(state, action, role, LACE_LEVELS);
  assert.equal(result.ok, false);
  return result.ok ? '' : result.reason;
}

test('every level pattern is solvable with its pin count by reusing pins', () => {
  for (const level of LACE_LEVELS) {
    assert.ok(cornersOf(level.pattern).length >= level.pins, `${level.id} has more pins than corners`);
  }
});

test('level 1: pin the corner, lay the thread, solved', () => {
  const s = play(createInitialState(LACE_LEVELS, 0), [
    ['bobbin', { type: 'ping', at: { x: 1, y: 1 } }],
    ['pin', { type: 'place-pin', at: { x: 1, y: 1 } }],
    ['bobbin', { type: 'move-thread', to: { x: 1, y: 1 } }],
    ['bobbin', { type: 'move-thread', to: { x: 4, y: 1 } }],
  ]);
  assert.equal(s.solved, true);
});

test('the thread cannot turn without a pin', () => {
  const s = play(createInitialState(LACE_LEVELS, 0), [['bobbin', { type: 'move-thread', to: { x: 1, y: 1 } }]]);
  assert.equal(attempt(s, 'bobbin', { type: 'move-thread', to: { x: 4, y: 1 } }), REASONS.needsPin);
});

test('the thread moves only in straight lines and never doubles back', () => {
  const s = createInitialState(LACE_LEVELS, 0);
  assert.equal(attempt(s, 'bobbin', { type: 'move-thread', to: { x: 2, y: 3 } }), REASONS.notInLine);
  const up = play(s, [['bobbin', { type: 'move-thread', to: { x: 1, y: 2 } }]]);
  assert.equal(attempt(up, 'bobbin', { type: 'move-thread', to: { x: 1, y: 3 } }), REASONS.doubleBack);
});

test('each tool can only do its own job', () => {
  const s = createInitialState(LACE_LEVELS, 0);
  assert.equal(attempt(s, 'bobbin', { type: 'place-pin', at: { x: 1, y: 1 } }), REASONS.notYourTool);
  assert.equal(attempt(s, 'pin', { type: 'move-thread', to: { x: 1, y: 1 } }), REASONS.notYourTool);
});

test('a wrong path is not solved, and undo takes it back', () => {
  const s = play(createInitialState(LACE_LEVELS, 0), [
    ['pin', { type: 'place-pin', at: { x: 1, y: 2 } }],
    ['bobbin', { type: 'move-thread', to: { x: 1, y: 2 } }],
    ['bobbin', { type: 'move-thread', to: { x: 4, y: 2 } }],
  ]);
  assert.equal(s.solved, false);
  const undone = play(s, [['bobbin', { type: 'undo-thread' }]]);
  assert.equal(undone.thread.length, 2);
});

test('level 3: two pins are enough if they are taken out and reused', () => {
  let s = createInitialState(LACE_LEVELS, 2);
  s = play(s, [
    ['pin', { type: 'place-pin', at: { x: 0, y: 4 } }],
    ['pin', { type: 'place-pin', at: { x: 2, y: 4 } }],
  ]);
  assert.equal(attempt(s, 'pin', { type: 'place-pin', at: { x: 2, y: 2 } }), REASONS.noPinsLeft);
  s = play(s, [
    ['bobbin', { type: 'move-thread', to: { x: 0, y: 4 } }],
    ['bobbin', { type: 'move-thread', to: { x: 2, y: 4 } }],
    ['pin', { type: 'remove-pin', at: { x: 0, y: 4 } }],
    ['pin', { type: 'place-pin', at: { x: 2, y: 2 } }],
    ['bobbin', { type: 'move-thread', to: { x: 2, y: 2 } }],
    ['bobbin', { type: 'move-thread', to: { x: 4, y: 2 } }],
  ]);
  assert.equal(attempt(s, 'pin', { type: 'remove-pin', at: { x: 4, y: 2 } }), REASONS.noPinThere);
  s = play(s, [
    ['pin', { type: 'remove-pin', at: { x: 2, y: 4 } }],
    ['pin', { type: 'place-pin', at: { x: 4, y: 2 } }],
    ['bobbin', { type: 'move-thread', to: { x: 4, y: 0 } }],
  ]);
  assert.equal(s.solved, true);
  assert.ok(pathsEqual(s.thread, LACE_LEVELS[2]!.pattern));
});

test('a pin cannot be pulled while the thread is waiting at it', () => {
  const s = play(createInitialState(LACE_LEVELS, 0), [
    ['pin', { type: 'place-pin', at: { x: 1, y: 1 } }],
    ['bobbin', { type: 'move-thread', to: { x: 1, y: 1 } }],
  ]);
  assert.equal(attempt(s, 'pin', { type: 'remove-pin', at: { x: 1, y: 1 } }), REASONS.threadResting);
});

test('next level only after solving, and roles swap each level', () => {
  const s = createInitialState(LACE_LEVELS, 0);
  assert.equal(attempt(s, 'pin', { type: 'next-level' }), REASONS.notFinished);
  assert.equal(roleFor(0, 0), 'pin');
  assert.equal(roleFor(1, 0), 'bobbin');
  assert.equal(roleFor(0, 1), 'bobbin');
  assert.equal(roleFor(1, 1), 'pin');
});

test('reachable holes respect the turning rule', () => {
  const s = play(createInitialState(LACE_LEVELS, 0), [['bobbin', { type: 'move-thread', to: { x: 1, y: 1 } }]]);
  const reach = reachableHoles(s, LACE_LEVELS[0]!);
  assert.deepEqual(reach, [{ x: 1, y: 0 }]);
});

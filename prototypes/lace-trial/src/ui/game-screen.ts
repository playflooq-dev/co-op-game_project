import { containsPoint } from '../core/grid.ts';
import { levelAt, reachableHoles } from '../core/lace-rules.ts';
import { ROLE_NAMES, roleFor } from '../core/roles.ts';
import type { Action, LevelDef, Point } from '../core/types.ts';
import type { SessionSnapshot } from '../session/session.ts';
import { createBoardView } from './board-view.ts';
import { h } from './dom.ts';

export interface GameScreen {
  readonly element: HTMLElement;
  update(snapshot: SessionSnapshot): void;
  showNotice(text: string): void;
  destroy(): void;
}

/**
 * One phone's game view: who you are, your hint, the board, and your buttons.
 * It never changes the game itself; it only turns taps into actions.
 */
export function createGameScreen(levels: readonly LevelDef[], act: (action: Action) => void): GameScreen {
  const levelLabel = h('div', { className: 'level-label' });
  const roleBadge = h('div', { className: 'role-badge' });
  const hint = h('p', { className: 'hint' });
  const canvas = h('canvas', { className: 'board', ariaLabel: 'Lace pattern card' });
  const status = h('div', { className: 'status' });
  const notice = h('div', { className: 'notice', ariaLabel: 'Message' });
  const pointButton = h('button', { className: 'btn', text: 'Point' });
  const undoButton = h('button', { className: 'btn', text: 'Undo' });
  const restartButton = h('button', { className: 'btn btn-quiet', text: 'Restart' });
  const overlayTitle = h('h2');
  const overlayText = h('p');
  const overlayButton = h('button', { className: 'btn btn-primary' });
  const overlay = h('div', { className: 'overlay hidden' }, [h('div', { className: 'overlay-card' }, [overlayTitle, overlayText, overlayButton])]);

  const element = h('div', { className: 'game' }, [
    h('header', { className: 'hud' }, [levelLabel, roleBadge, hint]),
    h('div', { className: 'board-wrap' }, [canvas]),
    notice,
    status,
    h('nav', { className: 'controls' }, [pointButton, undoButton, restartButton]),
    overlay,
  ]);

  const board = createBoardView(canvas);
  let snapshot: SessionSnapshot | null = null;
  let pointing = false;
  let noticeTimer: ReturnType<typeof setTimeout> | undefined;

  const setPointing = (on: boolean) => {
    pointing = on;
    pointButton.classList.toggle('active', on);
    pointButton.textContent = on ? 'Tap a hole' : 'Point';
  };

  board.onTap((hole: Point) => {
    const state = snapshot?.state;
    if (!snapshot || !state || state.solved) return;
    if (pointing) {
      setPointing(false);
      act({ type: 'ping', at: hole });
      return;
    }
    const role = roleFor(snapshot.seat, state.levelIndex);
    if (role === 'pin') {
      act(containsPoint(state.pins, hole) ? { type: 'remove-pin', at: hole } : { type: 'place-pin', at: hole });
    } else {
      act({ type: 'move-thread', to: hole });
    }
  });

  pointButton.addEventListener('click', () => setPointing(!pointing));
  undoButton.addEventListener('click', () => act({ type: 'undo-thread' }));
  restartButton.addEventListener('click', () => act({ type: 'restart-level' }));
  overlayButton.addEventListener('click', () => {
    const state = snapshot?.state;
    if (!state) return;
    act(state.levelIndex + 1 < levels.length ? { type: 'next-level' } : { type: 'restart-trial' });
  });

  return {
    element,
    update(next) {
      snapshot = next;
      const state = next.state;
      if (!state) return;
      const level = levelAt(levels, state.levelIndex);
      const role = roleFor(next.seat, state.levelIndex);

      levelLabel.textContent = `Level ${state.levelIndex + 1} of ${levels.length}: ${level.title}`;
      roleBadge.textContent = `You are ${ROLE_NAMES[role]}`;
      roleBadge.className = `role-badge role-${role}`;
      hint.textContent = level.hints[role];
      undoButton.hidden = role !== 'bobbin';

      const pinsLeft = level.pins - state.pins.length;
      const partner = next.partnerOnline ? 'Partner connected' : 'Waiting for your partner';
      status.textContent = role === 'pin' ? `Pins left: ${pinsLeft}  ·  ${partner}` : partner;
      status.classList.toggle('offline', !next.partnerOnline);

      board.setModel({ level, state, role, reachable: role === 'bobbin' ? reachableHoles(state, level) : [] });

      const isLast = state.levelIndex + 1 >= levels.length;
      overlay.classList.toggle('hidden', !state.solved);
      if (state.solved) {
        setPointing(false);
        overlayTitle.textContent = isLast ? 'Trial complete' : 'Lace made';
        overlayText.textContent = isLast
          ? 'You finished all three trial levels together.'
          : 'Nicely done. On the next level you swap tools.';
        overlayButton.textContent = isLast ? 'Play again' : 'Next level';
      }
    },
    showNotice(text) {
      notice.textContent = text;
      notice.classList.add('visible');
      clearTimeout(noticeTimer);
      noticeTimer = setTimeout(() => notice.classList.remove('visible'), 3200);
    },
    destroy() {
      clearTimeout(noticeTimer);
      board.destroy();
    },
  };
}

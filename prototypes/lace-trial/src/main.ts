import { LACE_LEVELS } from './core/levels.ts';
import { detectTransportKind, openTransport } from './net/connect.ts';
import { createGuestSession, createHostSession, type Session } from './session/session.ts';
import { clear, h } from './ui/dom.ts';
import { createGameScreen, type GameScreen } from './ui/game-screen.ts';
import { MODE_NOTES, createJoiningScreen, createLobbyScreen, createMessageScreen, createWaitingScreen } from './ui/lobby-screens.ts';

const CODE_LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function newCode(): string {
  return Array.from({ length: 4 }, () => CODE_LETTERS[Math.floor(Math.random() * CODE_LETTERS.length)]).join('');
}

/** Wires a session to the screens and keeps exactly one screen on show. */
function startApp(root: HTMLElement) {
  let session: Session | null = null;
  let game: GameScreen | null = null;
  const modeNote = h('p', { className: 'small mode-note', text: MODE_NOTES.checking });
  void detectTransportKind().then((kind) => {
    modeNote.textContent = MODE_NOTES[kind];
    modeNote.dataset.mode = kind;
  });
  let detach: (() => void)[] = [];

  const show = (element: HTMLElement) => {
    clear(root);
    root.append(element);
  };

  const leave = () => {
    detach.forEach((off) => off());
    detach = [];
    game?.destroy();
    game = null;
    session?.dispose();
    session = null;
    showLobby();
  };

  const render = (code: string) => {
    if (!session) return;
    const snapshot = session.snapshot();
    switch (snapshot.status) {
      case 'waiting-for-partner':
        show(createWaitingScreen(code, leave));
        return;
      case 'joining':
        if (!root.querySelector('.waiting')) show(createJoiningScreen(code, leave));
        return;
      case 'game-full':
        show(createMessageScreen('That game already has two players.', leave));
        return;
      case 'playing': {
        if (!game) {
          game = createGameScreen(LACE_LEVELS, (action) => session?.act(action));
          show(game.element);
        }
        game.update(snapshot);
      }
    }
  };

  const begin = async (code: string, asHost: boolean) => {
    const { transport } = await openTransport(code);
    const options = { transport, levels: LACE_LEVELS };
    session = asHost ? createHostSession(options) : createGuestSession(options);
    detach.push(session.onChange(() => render(code)));
    detach.push(session.onNotice((text) => game?.showNotice(text)));
    render(code);
  };

  function showLobby() {
    show(
      createLobbyScreen(
        {
          onStart: () => void begin(newCode(), true),
          onJoin: (code) => void begin(code, false),
        },
        modeNote,
      ),
    );
  }

  showLobby();
}

const root = document.getElementById('app');
if (root) startApp(root);

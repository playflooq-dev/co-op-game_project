import { LACE_LEVELS } from './core/levels.ts';
import { detectTransportKind, openTransport, type TransportKind } from './net/connect.ts';
import { ConnectError, type ConnectFailure } from './net/transport.ts';
import { createGuestSession, createHostSession, type Session } from './session/session.ts';
import { clear, h } from './ui/dom.ts';
import { createGameScreen, type GameScreen } from './ui/game-screen.ts';
import {
  MODE_NOTES,
  createConnectFailedScreen,
  createConnectingScreen,
  createJoiningScreen,
  createLobbyScreen,
  createMessageScreen,
  createWaitingScreen,
} from './ui/lobby-screens.ts';

const CODE_LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** A brief drop is normal (the room refreshes its link now and then); only report one that lasts. */
const DISCONNECT_GRACE_MS = 2000;

const FAILURE_TEXT: Readonly<Record<ConnectFailure, string>> = {
  'no-connection': "Couldn't connect. Check your internet connection, then try again.",
  'not-permitted':
    "This account isn't allowed to play on this page. Ask the person who shared the link to give you access, then try again.",
  'join-failed': "Couldn't join the game. Wait a moment and try again.",
};

const LINK_TEXT: Readonly<Record<TransportKind, string>> = {
  relay: 'Connected to the game server.',
  room: 'Connected to the shared room.',
  unavailable: 'Shared play is not available here: this browser only.',
  local: 'Local test mode: tabs of this browser only.',
};

function newCode(): string {
  return Array.from({ length: 4 }, () => CODE_LETTERS[Math.floor(Math.random() * CODE_LETTERS.length)]).join('');
}

/** Wires a session to the screens and keeps exactly one screen on show. */
function startApp(root: HTMLElement) {
  let session: Session | null = null;
  let game: GameScreen | null = null;
  let attempt = 0; // bumped on every start, join or leave, so a stale connection attempt is dropped
  const modeNote = h('p', { className: 'small mode-note', text: MODE_NOTES.checking });
  const connectionLine = h('p', { className: 'small connection-line' });
  void detectTransportKind().then((kind) => {
    modeNote.textContent = MODE_NOTES[kind];
    modeNote.dataset.mode = kind;
  });
  let detach: (() => void)[] = [];

  const show = (element: HTMLElement) => {
    clear(root);
    root.append(element);
  };

  const teardown = () => {
    attempt++;
    detach.forEach((off) => off());
    detach = [];
    game?.destroy();
    game = null;
    session?.dispose();
    session = null;
  };

  const leave = () => {
    teardown();
    showLobby();
  };

  const render = (code: string) => {
    if (!session) return;
    const snapshot = session.snapshot();
    switch (snapshot.status) {
      case 'waiting-for-partner':
        if (!root.querySelector('.waiting-host')) {
          const screen = createWaitingScreen(code, connectionLine, leave);
          screen.classList.add('waiting-host');
          show(screen);
        }
        return;
      case 'joining':
        if (!root.querySelector('.waiting-guest')) {
          const screen = createJoiningScreen(code, connectionLine, leave);
          screen.classList.add('waiting-guest');
          show(screen);
        }
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

  /** Keeps the connection line on the waiting screens current. */
  const watchConnection = (kind: TransportKind, onConnection?: (handler: (connected: boolean) => void) => () => void) => {
    if (!onConnection) {
      connectionLine.textContent = LINK_TEXT[kind];
      connectionLine.dataset.state = 'local';
      return;
    }
    let graceTimer: ReturnType<typeof setTimeout> | undefined;
    const set = (text: string, state: string) => {
      connectionLine.textContent = text;
      connectionLine.dataset.state = state;
    };
    set('Connecting...', 'connecting');
    const off = onConnection((connected) => {
      clearTimeout(graceTimer);
      if (connected) set(LINK_TEXT[kind], 'connected');
      else graceTimer = setTimeout(() => set('Connection lost. Reconnecting...', 'lost'), DISCONNECT_GRACE_MS);
    });
    detach.push(() => {
      clearTimeout(graceTimer);
      off();
    });
  };

  const begin = async (code: string, asHost: boolean) => {
    teardown();
    const mine = attempt;
    show(createConnectingScreen(code, asHost, leave));
    let opened: Awaited<ReturnType<typeof openTransport>>;
    try {
      opened = await openTransport(code);
    } catch (error) {
      if (mine !== attempt) return;
      const failure: ConnectFailure = error instanceof ConnectError ? error.failure : 'join-failed';
      console.warn('Could not connect:', error);
      show(createConnectFailedScreen(FAILURE_TEXT[failure], () => void begin(code, asHost), leave));
      return;
    }
    if (mine !== attempt) {
      opened.transport.close(); // the player cancelled while we were connecting
      return;
    }
    watchConnection(opened.kind, opened.transport.onConnection?.bind(opened.transport));
    const options = { transport: opened.transport, levels: LACE_LEVELS };
    const current = asHost ? createHostSession(options) : createGuestSession(options);
    session = current;
    detach.push(current.onChange(() => render(code)));
    detach.push(current.onNotice((text) => game?.showNotice(text)));
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

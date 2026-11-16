import { h } from './dom.ts';

export interface LobbyHandlers {
  onStart(): void;
  onJoin(code: string): void;
}

/** The first screen: start a game or join one with a code. */
export function createLobbyScreen(handlers: LobbyHandlers, modeNote: HTMLElement): HTMLElement {
  const input = h('input', { className: 'code-input', placeholder: 'CODE', maxLength: 4, ariaLabel: 'Game code' });
  input.setAttribute('autocapitalize', 'characters');
  input.setAttribute('autocomplete', 'off');
  input.addEventListener('input', () => {
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });
  const join = () => {
    if (input.value.length === 4) handlers.onJoin(input.value);
    else input.focus();
  };
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') join();
  });

  return h('div', { className: 'screen lobby' }, [
    h('h1', { text: 'Lace' }),
    h('p', { className: 'subtitle', text: 'The Pin and the Bobbin  ·  trial' }),
    h('p', { text: 'Two players, two devices: phones or computers. One of you starts a game and shares the code with the other.' }),
    h('button', { className: 'btn btn-primary', text: 'Start a game', onClick: () => handlers.onStart() }),
    h('div', { className: 'join-row' }, [input, h('button', { className: 'btn', text: 'Join', onClick: join })]),
    modeNote,
  ]);
}

export const MODE_NOTES = {
  checking: 'Getting ready...',
  room: 'Ready to play on two devices: phone or computer.',
  unavailable:
    "Shared play isn't available on this page right now, so games only work between tabs of this browser. Make sure you are signed in to claude.ai and opened the shared link, then reload.",
  local: 'Local test mode: open this page in two tabs of one browser to play both sides.',
} as const;

/** Shown while a device connects to the shared room. */
export function createConnectingScreen(code: string, asHost: boolean, onCancel: () => void): HTMLElement {
  return h('div', { className: 'screen waiting' }, [
    h('p', { text: asHost ? 'Setting up your game...' : `Connecting to game ${code}...` }),
    h('p', { className: 'small', text: 'This usually takes a second or two.' }),
    h('button', { className: 'btn btn-quiet', text: 'Cancel', onClick: onCancel }),
  ]);
}

/** Shown when a device could not connect. Retry keeps the same code. */
export function createConnectFailedScreen(text: string, onRetry: () => void, onBack: () => void): HTMLElement {
  return h('div', { className: 'screen waiting' }, [
    h('p', { text }),
    h('button', { className: 'btn btn-primary', text: 'Try again', onClick: onRetry }),
    h('button', { className: 'btn btn-quiet', text: 'Back', onClick: onBack }),
  ]);
}

/** Shown to the player who started, until their partner arrives. */
export function createWaitingScreen(code: string, connection: HTMLElement, onCancel: () => void): HTMLElement {
  return h('div', { className: 'screen waiting' }, [
    h('p', { text: 'Your game code' }),
    h('div', { className: 'code-display', text: code }),
    h('p', { text: 'Ask your partner to open this same link on their phone or computer, tap Join and type in the code.' }),
    h('p', { className: 'small', text: 'Waiting for your partner to join.' }),
    connection,
    h('button', { className: 'btn btn-quiet', text: 'Cancel', onClick: onCancel }),
  ]);
}

/** Shown to the joining player while the host answers. */
export function createJoiningScreen(code: string, connection: HTMLElement, onCancel: () => void): HTMLElement {
  const slowHint = h('p', { className: 'small hidden', text: "Still looking. Check the code, and that your partner's game is open." });
  setTimeout(() => slowHint.classList.remove('hidden'), 8000);
  return h('div', { className: 'screen waiting' }, [
    h('p', { text: `Joining game ${code}` }),
    slowHint,
    connection,
    h('button', { className: 'btn btn-quiet', text: 'Cancel', onClick: onCancel }),
  ]);
}

export function createMessageScreen(text: string, onBack: () => void): HTMLElement {
  return h('div', { className: 'screen waiting' }, [
    h('p', { text }),
    h('button', { className: 'btn', text: 'Back', onClick: onBack }),
  ]);
}

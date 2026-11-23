import { ConnectError, type Transport } from './transport.ts';

export interface WebSocketTransportOptions {
  /** How long the first connection may take before giving up. */
  readonly connectTimeoutMs?: number;
  /** Longest wait between reconnect attempts after the link drops. */
  readonly maxRetryMs?: number;
}

/**
 * Carries the game through our own relay (worker/relay.ts on Cloudflare): every message
 * goes to the other devices in the same game. Reconnects by itself if the link drops;
 * anything sent while disconnected is dropped, which the session layer already copes with.
 */
export function createWebSocketTransport(url: string, options: WebSocketTransportOptions = {}): Promise<Transport> {
  const { connectTimeoutMs = 10000, maxRetryMs = 8000 } = options;
  const handlers = new Set<(message: unknown) => void>();
  const connectionHandlers = new Set<(connected: boolean) => void>();
  let socket: WebSocket | null = null;
  let connected = false;
  let closed = false;
  let retries = 0;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;

  const setConnected = (value: boolean) => {
    if (value === connected) return;
    connected = value;
    connectionHandlers.forEach((handler) => handler(value));
  };

  const transport: Transport = {
    send(message) {
      if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
    },
    onMessage(handler) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    onConnection(handler) {
      connectionHandlers.add(handler);
      queueMicrotask(() => handler(connected));
      return () => connectionHandlers.delete(handler);
    },
    close() {
      closed = true;
      clearTimeout(retryTimer);
      handlers.clear();
      connectionHandlers.clear();
      socket?.close(1000, 'left');
    },
  };

  return new Promise((resolve, reject) => {
    let settled = false;
    const firstTimeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      transport.close();
      reject(new ConnectError('no-connection', 'timed out'));
    }, connectTimeoutMs);

    const open = () => {
      const ws = new WebSocket(url);
      socket = ws;
      ws.onopen = () => {
        retries = 0;
        setConnected(true);
        if (!settled) {
          settled = true;
          clearTimeout(firstTimeout);
          resolve(transport);
        }
      };
      ws.onmessage = (event) => {
        if (typeof event.data !== 'string') return;
        let message: unknown;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }
        handlers.forEach((handler) => handler(message));
      };
      ws.onclose = () => {
        if (socket !== ws) return;
        setConnected(false);
        if (closed) return;
        // Back off a little more each time, up to maxRetryMs.
        const wait = Math.min(maxRetryMs, 500 * 2 ** retries++);
        retryTimer = setTimeout(open, wait);
      };
    };
    open();
  });
}

/** The relay address for a game, on the same host that served the page. */
export function relayUrl(base: string, gameName: string): string {
  const url = new URL(base, location.href);
  url.protocol = url.protocol === 'http:' ? 'ws:' : 'wss:';
  url.pathname = `${url.pathname.replace(/\/$/, '')}/${encodeURIComponent(gameName)}`;
  url.search = '';
  url.hash = '';
  return url.href;
}

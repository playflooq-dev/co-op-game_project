import type { Transport } from './transport.ts';

/**
 * Connects tabs of the same browser on one computer. For development only:
 * open the trial in two tabs to play both sides without any network.
 */
export function createLocalTransport(gameName: string): Transport {
  const channel = new BroadcastChannel(`lace-trial:${gameName}`);
  const handlers = new Set<(message: unknown) => void>();
  channel.onmessage = (event: MessageEvent) => {
    for (const handler of handlers) handler(event.data);
  };
  return {
    send(message) {
      channel.postMessage(message);
    },
    onMessage(handler) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    close() {
      handlers.clear();
      channel.close();
    },
  };
}

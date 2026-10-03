import { useEffect, useRef } from 'react';

/**
 * Manages one reconnecting WebSocket connection.
 *
 * getUrl        - a full ws(s):// URL, OR a function returning one (called
 *                  fresh on every connect attempt — use a function when the
 *                  URL depends on something that can change between
 *                  attempts, like a token read from localStorage). Return
 *                  null/undefined to mean "nothing to connect to yet."
 * handlers       - { onOpen(), onMessage(event), onError(event) }
 * options        - {
 *     enabled: boolean (default true) — whether to connect at all
 *     backoff: 'exponential' (default) | 'fixed'
 *     fixedDelay: ms, used when backoff === 'fixed' (default 3000)
 *     maxDelay: ms cap for exponential backoff (default 15000)
 *     shouldReconnect: () => boolean — checked on every close, default always true
 *     restartKey: any — changing this tears down and fully reconnects,
 *                 resetting the backoff counter (e.g. a new order/booking id)
 *   }
 *
 * Handles the dev-mode "closed before connection established" console
 * warning by waiting for open before closing on cleanup.
 */
export default function useLiveSocket(getUrl, handlers = {}, options = {}) {
  const {
    enabled = true,
    backoff = 'exponential',
    fixedDelay = 3000,
    maxDelay = 15000,
    shouldReconnect = () => true,
    restartKey,
  } = options;

  const getUrlRef = useRef(getUrl);
  const onOpenRef = useRef(handlers.onOpen);
  const onMessageRef = useRef(handlers.onMessage);
  const onErrorRef = useRef(handlers.onError);
  const shouldReconnectRef = useRef(shouldReconnect);
  getUrlRef.current = getUrl;
  onOpenRef.current = handlers.onOpen;
  onMessageRef.current = handlers.onMessage;
  onErrorRef.current = handlers.onError;
  shouldReconnectRef.current = shouldReconnect;

  useEffect(() => {
    if (!enabled) return;

    let ws;
    let reconnectTimer;
    let attempts = 0;

    const connect = () => {
      const url = typeof getUrlRef.current === 'function' ? getUrlRef.current() : getUrlRef.current;
      if (!url) return;

      ws = new WebSocket(url);

      ws.onopen = () => { attempts = 0; onOpenRef.current?.(); };
      ws.onmessage = (event) => onMessageRef.current?.(event);
      ws.onerror = (event) => onErrorRef.current?.(event);

      ws.onclose = () => {
        if (!shouldReconnectRef.current()) return;
        attempts += 1;
        const delay = backoff === 'fixed' ? fixedDelay : Math.min(1000 * Math.pow(1.5, attempts), maxDelay);
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        if (ws.readyState === WebSocket.CONNECTING) ws.onopen = () => ws.close();
        else ws.close();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, backoff, fixedDelay, maxDelay, restartKey]);
}

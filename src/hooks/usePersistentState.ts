import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

const PREFIX = 'rally-tools:v1:';
const DEBOUNCE_MS = 300;

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined; // storage unavailable (private browsing…) or corrupted JSON
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / storage blocked: the tool keeps working without persistence */
  }
}

/**
 * Persistent state in localStorage (`rally-tools:v1:<name>`).
 * - `sanitize` receives the stored (unknown) value and returns a valid state: anything
 *   corrupted or obsolete falls back to the defaults.
 * - Writes debounced by 300 ms, forced on page change / tab close.
 * - `reset()` clears the key and restores the defaults.
 * The app is 100% client-side (no SSR): the initial read is therefore synchronous, with no hydration mismatch.
 */
export function usePersistentState<T>(
  name: string,
  makeDefaults: () => T,
  sanitize: (stored: unknown, defaults: T) => T,
): [T, (update: T | ((prev: T) => T)) => void, () => void] {
  const key = PREFIX + name;
  const [state, setState] = useState<T>(() => {
    const defaults = makeDefaults();
    const stored = read(key);
    return stored === undefined ? defaults : sanitize(stored, defaults);
  });

  const latest = useRef(state);
  latest.current = state;
  const dirty = useRef(false);
  const skipNext = useRef(true); // do not rewrite the state read on mount

  const flush = useCallback(() => {
    if (dirty.current) {
      write(key, latest.current);
      dirty.current = false;
    }
  }, [key]);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    dirty.current = true;
    const id = window.setTimeout(flush, DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [state, flush]);

  useEffect(() => {
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush(); // route change before the debounce ends
    };
  }, [flush]);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    dirty.current = false;
    skipNext.current = true;
    setState(makeDefaults());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [state, setState, reset];
}

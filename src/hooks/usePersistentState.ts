import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

const PREFIX = 'rally-tools:v1:';
const DEBOUNCE_MS = 300;

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined; // stockage indisponible (navigation privée…) ou JSON corrompu
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / stockage bloqué : l'outil continue de fonctionner sans persistance */
  }
}

/**
 * État persistant dans localStorage (`rally-tools:v1:<name>`).
 * - `sanitize` reçoit la valeur stockée (inconnue) et renvoie un état valide : tout ce qui est
 *   corrompu ou obsolète retombe sur les valeurs par défaut.
 * - Écriture différée de 300 ms, forcée au changement de page / fermeture de l'onglet.
 * - `reset()` efface la clé et remet les valeurs par défaut.
 * L'app est 100 % côté client (pas de SSR) : la lecture initiale est donc synchrone, sans écart d'hydratation.
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
  const skipNext = useRef(true); // ne pas réécrire l'état lu au montage

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
      flush(); // changement de route avant la fin du debounce
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

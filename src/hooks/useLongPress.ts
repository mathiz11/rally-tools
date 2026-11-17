import { useCallback, useEffect, useRef } from 'preact/hooks';
import type { TargetedMouseEvent, TargetedPointerEvent } from 'preact';

interface Options {
  /** Délai avant répétition (ms). */
  delay?: number;
  /** Intervalle de répétition (ms). */
  interval?: number;
}

/**
 * Appui long = répétition (400 ms puis toutes les 80 ms), clic simple = un pas.
 * Clavier : Entrée / Espace déclenchent `click` (detail = 0), géré à part pour éviter le double pas.
 */
export function useLongPress(action: () => void, { delay = 400, interval = 80 }: Options = {}) {
  const act = useRef(action);
  act.current = action;
  const timeout = useRef<number | undefined>(undefined);
  const repeat = useRef<number | undefined>(undefined);

  const stop = useCallback(() => {
    window.clearTimeout(timeout.current);
    window.clearInterval(repeat.current);
  }, []);
  useEffect(() => stop, [stop]);

  const step = () => {
    act.current();
    // Retour haptique léger, sans effet si non supporté ou si l'utilisateur réduit les animations.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate?.(10);
  };

  return {
    onPointerDown(e: TargetedPointerEvent<HTMLButtonElement>) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault(); // garde le focus (et le clavier ouvert) sur le champ en cours de saisie
      stop();
      step();
      timeout.current = window.setTimeout(() => {
        repeat.current = window.setInterval(step, interval);
      }, delay);
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onContextMenu: (e: Event) => e.preventDefault(),
    onClick(e: TargetedMouseEvent<HTMLButtonElement>) {
      if (e.detail === 0) step(); // activation clavier uniquement
    },
  };
}

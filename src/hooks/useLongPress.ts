import { useCallback, useEffect, useRef } from 'preact/hooks';
import type { TargetedMouseEvent, TargetedPointerEvent } from 'preact';

interface Options {
  /** Delay before repeating (ms). */
  delay?: number;
  /** Repeat interval (ms). */
  interval?: number;
}

/**
 * Long press = repeat (400 ms, then every 80 ms), single click = one step.
 * Keyboard: Enter / Space trigger `click` (detail = 0), handled separately to avoid a double step.
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
    // Light haptic feedback, no effect if unsupported or if the user reduces motion.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate?.(10);
  };

  return {
    onPointerDown(e: TargetedPointerEvent<HTMLButtonElement>) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault(); // keeps focus (and the keyboard open) on the field being edited
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
      if (e.detail === 0) step(); // keyboard activation only
    },
  };
}

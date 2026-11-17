import { useState } from 'preact/hooks';
import type { TargetedEvent, TargetedFocusEvent } from 'preact';
import { parseDecimal } from '../../lib/calculators';
import { rawFr } from '../../lib/format';

/**
 * Decimal field as a « real text field » (inputmode decimal): accepts 14,2 and 14.2, never overwrites
 * the input in progress (« 14, » stays « 14, »), shows the formatted value when unfocused.
 * Empty = null; negative clamped to 0.
 */
export function useDecimalInput(
  value: number | null,
  commit: (v: number | null) => void,
  format: (v: number) => string,
) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState('');

  // The typed text stays displayed as long as it matches the value; otherwise (−/+ step, reset) we resync.
  const inSync = (parseDecimal(text) ?? 0) === (value ?? 0);
  const shown = focused ? (inSync ? text : rawFr(value)) : value === null ? '' : format(value);

  return {
    value: shown,
    onFocus(e: TargetedFocusEvent<HTMLInputElement>) {
      const el = e.currentTarget;
      setText(rawFr(value));
      setFocused(true);
      requestAnimationFrame(() => el.select());
    },
    onBlur() {
      setFocused(false);
    },
    onInput(e: TargetedEvent<HTMLInputElement, Event>) {
      const t = e.currentTarget.value;
      setText(t);
      const n = parseDecimal(t);
      commit(n === null ? null : Math.max(0, n));
    },
  };
}

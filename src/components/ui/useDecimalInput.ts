import { useState } from 'preact/hooks';
import type { TargetedEvent, TargetedFocusEvent } from 'preact';
import { parseDecimal } from '../../lib/calculators';
import { rawFr } from '../../lib/format';

/**
 * Champ décimal « vrai champ texte » (inputmode decimal) : accepte 14,2 et 14.2, n'écrase jamais
 * la saisie en cours (« 14, » reste « 14, »), affiche la valeur formatée hors focus.
 * Vide = null ; négatif ramené à 0.
 */
export function useDecimalInput(
  value: number | null,
  commit: (v: number | null) => void,
  format: (v: number) => string,
) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState('');

  // La saisie reste affichée tant qu'elle correspond à la valeur ; sinon (pas −/+, reset) on resynchronise.
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

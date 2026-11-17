import { useLongPress } from '../../hooks/useLongPress';
import { roundTo } from '../../lib/format';
import { Icon } from './Icon';
import { Marker, type MarkerKind } from './Marker';
import { useDecimalInput } from './useDecimalInput';
import styles from './StepperRow.module.css';

interface StepperRowProps {
  id: string;
  label: string;
  marker: MarkerKind;
  /** Equivalence shown to the right of the label (e.g. « ≈ 20 L/100 km »). */
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  step: number;
  decimals: number;
  format: (v: number) => string;
  decreaseLabel: string;
  increaseLabel: string;
}

/** Label + [ − ] [ editable value ] [ + ]: a single control per row, 72 × 60 px targets. */
export function StepperRow({
  id,
  label,
  marker,
  hint,
  value,
  onChange,
  step,
  decimals,
  format,
  decreaseLabel,
  increaseLabel,
}: StepperRowProps) {
  const move = (dir: 1 | -1) => onChange(Math.max(0, roundTo(value + dir * step, decimals)));
  const dec = useLongPress(() => move(-1));
  const inc = useLongPress(() => move(1));
  const input = useDecimalInput(value, (v) => onChange(v ?? 0), format);

  return (
    <div class={styles.row}>
      <div class={styles.labels}>
        <label for={id} class={styles.label}>
          <Marker kind={marker} />
          {label}
        </label>
        {hint && <span class={`num ${styles.hint}`}>{hint}</span>}
      </div>
      <div class={styles.controls}>
        <button type="button" class={styles.btn} aria-label={decreaseLabel} {...dec}>
          <Icon name="minus" size={26} stroke={2.6} />
        </button>
        <input
          id={id}
          class={`num ${styles.input}`}
          type="text"
          inputMode="decimal"
          enterKeyHint="done"
          autocomplete="off"
          spellcheck={false}
          {...input}
        />
        <button type="button" class={styles.btn} aria-label={increaseLabel} {...inc}>
          <Icon name="plus" size={26} stroke={2.6} />
        </button>
      </div>
    </div>
  );
}

import type { ComponentChildren } from 'preact';
import { rawFr } from '../../lib/format';
import { useDecimalInput } from './useDecimalInput';
import styles from './Field.module.css';

interface FieldProps {
  id: string;
  label: ComponentChildren;
  /** Label detail, in `--text-3`. */
  labelNote?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  unit?: string;
  inputMode?: 'decimal' | 'numeric';
  /** Help text under the field. */
  hint?: ComponentChildren;
  /** Error: orange border + message under the field (never blocking). */
  error?: string;
  /** Label for screen readers only (e.g. fields of a roadbook row). */
  hideLabel?: boolean;
  placeholder?: string;
  format?: (v: number) => string;
}

export function Field({
  id,
  label,
  labelNote,
  value,
  onChange,
  unit,
  inputMode = 'decimal',
  hint,
  error,
  hideLabel,
  placeholder,
  format = rawFr,
}: FieldProps) {
  const input = useDecimalInput(value, onChange, format as (v: number) => string);
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div class={styles.field}>
      <label for={id} class={hideLabel ? 'visually-hidden' : styles.label}>
        {label}
        {labelNote && <span class={styles.note}> {labelNote}</span>}
      </label>
      <div class={`${styles.box} ${error ? styles.invalid : ''}`}>
        <input
          id={id}
          class={`num ${styles.input}`}
          type="text"
          inputMode={inputMode}
          enterKeyHint="done"
          autocomplete="off"
          autocapitalize="off"
          spellcheck={false}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...input}
        />
        {unit && (
          <span class={`num ${styles.unit}`} aria-hidden="true">
            {unit}
          </span>
        )}
      </div>
      {error ? (
        <p id={`${id}-err`} class={styles.error}>
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} class={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

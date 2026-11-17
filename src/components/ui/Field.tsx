import type { ComponentChildren } from 'preact';
import { rawFr } from '../../lib/format';
import { useDecimalInput } from './useDecimalInput';
import styles from './Field.module.css';

interface FieldProps {
  id: string;
  label: ComponentChildren;
  /** Précision du libellé, en `--text-3`. */
  labelNote?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  unit?: string;
  inputMode?: 'decimal' | 'numeric';
  /** Aide sous le champ. */
  hint?: ComponentChildren;
  /** Erreur : bordure orange + message sous le champ (jamais bloquant). */
  error?: string;
  /** Libellé uniquement pour les lecteurs d'écran (ex. champs d'une ligne du roadbook). */
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

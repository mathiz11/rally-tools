import styles from './ResultBar.module.css';

interface ResultBarProps {
  /** « À embarquer · marge 10 % » eyebrow */
  eyebrow: string;
  /** Already formatted value, or « — ». */
  value: string;
  unit: string;
  /** Secondary info on the right. */
  side?: { value: string; caption: string };
}

/** The result is the hero: a single yellow number, always visible, announced to screen readers. */
export function ResultBar({ eyebrow, value, unit, side }: ResultBarProps) {
  return (
    <div class={styles.bar} aria-live="polite" aria-atomic="true">
      <div class={styles.main}>
        <p class={`num ${styles.eyebrow}`}>{eyebrow}</p>
        <p class={styles.line}>
          <span class={`num ${styles.value}`}>{value}</span>
          <span class={styles.unit}>{unit}</span>
        </p>
      </div>
      {side && (
        <div class={styles.side}>
          <span class={`num ${styles.sideValue}`}>{side.value}</span>
          <span class={`num ${styles.sideCaption}`}>{side.caption}</span>
        </div>
      )}
    </div>
  );
}

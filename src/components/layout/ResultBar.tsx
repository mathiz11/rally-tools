import styles from './ResultBar.module.css';

interface ResultBarProps {
  /** « À embarquer · marge 10 % » */
  eyebrow: string;
  /** Valeur déjà formatée, ou « — ». */
  value: string;
  unit: string;
  /** Info secondaire à droite. */
  side?: { value: string; caption: string };
}

/** Le résultat est le héros : un seul chiffre jaune, toujours visible, annoncé aux lecteurs d'écran. */
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

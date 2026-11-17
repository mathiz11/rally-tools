import styles from './Chip.module.css';

/** Puce « LIAISON 1 » / « ES 1 » : couleur + libellé, jamais la couleur seule. */
export function Chip({ kind, children }: { kind: 'link' | 'stage'; children: string }) {
  return <span class={`num ${styles.chip} ${styles[kind]}`}>{children}</span>;
}

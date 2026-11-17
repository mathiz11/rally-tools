import styles from './Chip.module.css';

/** « LIAISON 1 » / « ES 1 » chip: color + label, never color alone. */
export function Chip({ kind, children }: { kind: 'link' | 'stage'; children: string }) {
  return <span class={`num ${styles.chip} ${styles[kind]}`}>{children}</span>;
}

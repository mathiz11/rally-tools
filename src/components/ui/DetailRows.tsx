import type { ComponentChildren } from 'preact';
import { Marker, type MarkerKind } from './Marker';
import styles from './DetailRows.module.css';

export interface DetailRow {
  label: string;
  marker?: MarkerKind;
  /** Right-aligned values (e.g. [« 55,0 km », « 11,00 L »]). */
  values: string[];
  strong?: boolean;
}

export function DetailRows({ rows }: { rows: DetailRow[] }) {
  return (
    <dl class={styles.list}>
      {rows.map((r) => (
        <div key={r.label} class={`${styles.row} ${r.strong ? styles.strong : ''}`}>
          <dt class={styles.label}>
            {r.marker && <Marker kind={r.marker} />}
            {r.label}
          </dt>
          <dd class={`num ${styles.values}`}>
            {r.values.map((v, i) => (
              <span key={i}>{v}</span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Formula shown in small print under a detail (the « honest » principle). */
export function Formula({ children }: { children: ComponentChildren }) {
  return <p class={`num ${styles.formula}`}>{children}</p>;
}

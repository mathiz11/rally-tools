import { fr } from '../../../lib/format';
import { Card } from '../../ui/Card';
import { Formula } from '../../ui/DetailRows';
import styles from './SpeedTable.module.css';

interface Props {
  rows: { rpm: number; kmh: number | null }[];
  currentRpm: number;
  overallRatio: number | null;
}

export function SpeedTable({ rows, currentRpm, overallRatio }: Props) {
  const max = Math.max(0, ...rows.map((r) => r.kmh ?? 0));
  return (
    <Card title="Par régime" aside={`rapport global ${overallRatio === null ? '—' : fr(overallRatio, 3)}`}>
      <ol class={styles.table}>
        {rows.map((r) => {
          const current = Math.abs(r.rpm - currentRpm) <= 500;
          const high = r.rpm >= 10000;
          const width = r.kmh !== null && max > 0 ? (r.kmh / max) * 100 : 0;
          return (
            <li key={r.rpm} class={`${styles.row} ${current ? styles.current : ''} ${high ? styles.high : ''}`}>
              <span class={`num ${styles.rpm}`}>{fr(r.rpm, 0)}</span>
              <span class={styles.track} aria-hidden="true">
                <span class={styles.fill} style={{ width: `${width}%` }} />
              </span>
              <span class={`num ${styles.kmh}`}>{r.kmh === null ? '—' : fr(r.kmh, 1)}</span>
            </li>
          );
        })}
      </ol>
      <p class={`num ${styles.legend}`}>tr/min · km/h</p>
      <Formula>v [km/h] = tr/min × (Z1/Z2) × (Z3/Z4) × (Ø − écrasement) × π × 6e-5</Formula>
    </Card>
  );
}

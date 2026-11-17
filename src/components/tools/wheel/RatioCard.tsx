import { fr } from '../../../lib/format';
import { Card } from '../../ui/Card';
import { Field } from '../../ui/Field';
import styles from './Pair.module.css';

interface Props {
  title: string;
  ratio: number | null;
  ratioLabel: string;
  a: { id: string; label: string; value: number; onChange: (v: number) => void };
  b: { id: string; label: string; value: number; onChange: (v: number) => void; error?: string };
}

/** Two tooth counts (driving | driven) on one row, ratio in the card header. */
export function RatioCard({ title, ratio, ratioLabel, a, b }: Props) {
  return (
    <Card title={title} aside={`${ratioLabel} = ${ratio === null ? '—' : fr(ratio, 3)}`}>
      <div class={styles.pair}>
        <Field id={a.id} label={a.label} value={a.value} onChange={(v) => a.onChange(v ?? 0)} inputMode="numeric" unit="dents" />
        <Field
          id={b.id}
          label={b.label}
          value={b.value}
          onChange={(v) => b.onChange(v ?? 0)}
          inputMode="numeric"
          unit="dents"
          error={b.error}
        />
      </div>
    </Card>
  );
}

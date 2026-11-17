import { fr } from '../../../lib/format';
import { Card } from '../../ui/Card';
import { Field } from '../../ui/Field';
import styles from './Pair.module.css';

interface Props {
  diameter: number;
  crush: number;
  usefulMm: number;
  circumferenceM: number;
  onDiameter: (v: number) => void;
  onCrush: (v: number) => void;
}

export function WheelCard({ diameter, crush, usefulMm, circumferenceM, onDiameter, onCrush }: Props) {
  return (
    <Card title="Roue">
      <div class={styles.pair}>
        <Field
          id="diametre"
          label="Diamètre roue"
          labelNote="mm"
          value={diameter}
          onChange={(v) => onDiameter(v ?? 0)}
          hint="Pneu monté"
        />
        <Field
          id="ecrasement"
          label="Écrasement"
          labelNote="mm"
          value={crush}
          onChange={(v) => onCrush(v ?? 0)}
          hint="En charge"
        />
      </div>
      {usefulMm > 0 ? (
        <p class="num" style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-3)' }}>
          Diamètre utile = {fr(usefulMm, 0)} mm · circonférence {fr(circumferenceM, 3)} m
        </p>
      ) : (
        <p class="num" style={{ fontSize: 'var(--fs-micro)', color: 'var(--stage)' }}>
          Le diamètre doit dépasser l'écrasement.
        </p>
      )}
    </Card>
  );
}

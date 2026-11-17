import { Card } from '../../ui/Card';
import { StepperRow } from '../../ui/StepperRow';
import styles from './RpmCard.module.css';

const MIN = 1000;
const MAX = 12000;

interface Props {
  rpm: number;
  onChange: (rpm: number) => void;
}

export function RpmCard({ rpm, onChange }: Props) {
  return (
    <Card title="Régime moteur">
      <StepperRow
        id="regime"
        label="Régime"
        marker="accent"
        hint="tr/min"
        value={rpm}
        onChange={onChange}
        step={100}
        decimals={0}
        format={(v) => String(v)}
        decreaseLabel="Diminuer le régime de 100 tr/min"
        increaseLabel="Augmenter le régime de 100 tr/min"
      />
      <div class={styles.slider}>
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={100}
          value={Math.min(MAX, Math.max(MIN, rpm))}
          onInput={(e) => onChange(Number(e.currentTarget.value))}
          aria-label="Régime moteur, curseur de 1 000 à 12 000 tr/min"
        />
        <div class={`num ${styles.scale}`} aria-hidden="true">
          <span>1 000</span>
          <span>12 000</span>
        </div>
      </div>
    </Card>
  );
}

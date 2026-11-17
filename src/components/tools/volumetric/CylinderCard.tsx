import { Card } from '../../ui/Card';
import { Field } from '../../ui/Field';
import { Segmented } from '../../ui/Segmented';
import { CYLINDER_OPTIONS } from './volumetricState';
import styles from './Volumetric.module.css';

interface Props {
  bore: number;
  stroke: number;
  cylinders: number;
  onBore: (v: number) => void;
  onStroke: (v: number) => void;
  onCylinders: (v: number) => void;
}

export function CylinderCard({ bore, stroke, cylinders, onBore, onStroke, onCylinders }: Props) {
  return (
    <Card title="Cylindre">
      <div class={styles.pair}>
        <Field id="alesage" label="Alésage" labelNote="mm" value={bore} onChange={(v) => onBore(v ?? 0)} />
        <Field id="course" label="Course" labelNote="mm" value={stroke} onChange={(v) => onStroke(v ?? 0)} />
      </div>
      <div class={styles.group}>
        <p class={styles.groupLabel}>Nombre de cylindres</p>
        <Segmented
          label="Nombre de cylindres"
          options={CYLINDER_OPTIONS.map((n) => ({ value: n, label: String(n) }))}
          value={cylinders}
          onChange={onCylinders}
        />
      </div>
    </Card>
  );
}

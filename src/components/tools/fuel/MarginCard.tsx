import { Card } from '../../ui/Card';
import { Segmented } from '../../ui/Segmented';
import { MARGINS } from './fuelState';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function MarginCard({ value, onChange }: Props) {
  return (
    <Card title="Marge de sécurité">
      <Segmented
        label="Marge de sécurité en pourcentage"
        options={MARGINS.map((m) => ({ value: m, label: `${m} %` }))}
        value={value}
        onChange={onChange}
      />
    </Card>
  );
}

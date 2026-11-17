import { Card } from '../../ui/Card';
import { Field } from '../../ui/Field';

interface Props {
  chamber: number | null;
  onChange: (v: number | null) => void;
}

export function ChamberCard({ chamber, onChange }: Props) {
  return (
    <Card title="Chambre" aside="optionnel">
      <Field
        id="chambre"
        label="Volume de chambre"
        labelNote="cm³ par cylindre"
        value={chamber}
        onChange={onChange}
        unit="cm³"
        placeholder="—"
        hint="Renseigné : donne le rapport volumétrique."
      />
    </Card>
  );
}

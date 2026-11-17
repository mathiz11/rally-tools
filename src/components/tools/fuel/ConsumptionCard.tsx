import { Card } from '../../ui/Card';
import { StepperRow } from '../../ui/StepperRow';
import { fr, frMax } from '../../../lib/format';

interface Props {
  link: number;
  stage: number;
  onLink: (v: number) => void;
  onStage: (v: number) => void;
}

const per100 = (v: number) => `≈ ${frMax(v * 100, 1)} L/100 km`;
const conso = (v: number) => fr(v, 2);

export function ConsumptionCard({ link, stage, onLink, onStage }: Props) {
  return (
    <Card title="Consommations">
      <StepperRow
        id="conso-liaison"
        label="Liaison"
        marker="link"
        hint={per100(link)}
        value={link}
        onChange={onLink}
        step={0.01}
        decimals={2}
        format={conso}
        decreaseLabel="Diminuer la consommation en liaison"
        increaseLabel="Augmenter la consommation en liaison"
      />
      <StepperRow
        id="conso-speciale"
        label="Spéciale"
        marker="stage"
        hint={per100(stage)}
        value={stage}
        onChange={onStage}
        step={0.01}
        decimals={2}
        format={conso}
        decreaseLabel="Diminuer la consommation en spéciale"
        increaseLabel="Augmenter la consommation en spéciale"
      />
    </Card>
  );
}

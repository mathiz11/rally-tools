import type { DisplacementResult } from '../../../lib/calculators';
import { fr } from '../../../lib/format';
import { Card } from '../../ui/Card';
import { DetailRows, Formula } from '../../ui/DetailRows';
import { CylinderDiagram } from './CylinderDiagram';
import styles from './Volumetric.module.css';

interface Props {
  result: DisplacementResult;
  bore: number;
  stroke: number;
}

const SHAPE_LABEL = { 'super-carré': 'Super-carré', carré: 'Carré', 'longue course': 'Longue course' } as const;

export function DisplacementDetail({ result, bore, stroke }: Props) {
  return (
    <Card title="Détail">
      <div class={styles.diagram}>
        <CylinderDiagram bore={bore} stroke={stroke} />
      </div>
      <DetailRows
        rows={[
          { label: 'Cylindrée unitaire', values: [`${fr(result.unitCc, 1)} cm³`] },
          { label: 'Section piston', values: [`${fr(result.pistonAreaCm2, 2)} cm²`] },
          { label: 'Cylindrée totale', strong: true, values: [`${fr(result.totalLiters, 2)} L`] },
          {
            label: 'Course / alésage',
            values: [
              result.strokeBoreRatio === null ? '—' : fr(result.strokeBoreRatio, 2),
              result.engineShape ? SHAPE_LABEL[result.engineShape] : '',
            ].filter(Boolean),
          },
        ]}
      />
      <Formula>V unitaire = π × alésage² / 4 × course / 1 000 · ε = (V unitaire + V chambre) / V chambre</Formula>
    </Card>
  );
}

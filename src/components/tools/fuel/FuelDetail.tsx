import type { FuelResult } from '../../../lib/calculators';
import { fr } from '../../../lib/format';
import { Card } from '../../ui/Card';
import { DetailRows, Formula } from '../../ui/DetailRows';
import styles from './FuelDetail.module.css';

export function FuelDetail({ result, margin }: { result: FuelResult; margin: number }) {
  const linkShare = result.liters > 0 ? (result.linkLiters / result.liters) * 100 : 0;
  const stageShare = result.liters > 0 ? 100 - linkShare : 0;

  return (
    <Card title="Détail">
      <div
        class={styles.bar}
        role="img"
        aria-label={`Répartition de l'essence : liaisons ${fr(linkShare, 0)} %, spéciales ${fr(stageShare, 0)} %`}
      >
        <span class={styles.link} style={{ width: `${linkShare}%` }} />
        <span class={styles.stage} style={{ width: `${stageShare}%` }} />
      </div>
      <DetailRows
        rows={[
          { label: 'Liaisons', marker: 'link', values: [`${fr(result.linkKm, 1)} km`, `${fr(result.linkLiters, 2)} L`] },
          { label: 'Spéciales', marker: 'stage', values: [`${fr(result.stageKm, 1)} km`, `${fr(result.stageLiters, 2)} L`] },
          { label: `Marge ${margin} %`, values: [`+${fr(result.marginLiters, 2)} L`] },
          { label: 'Total sans marge', strong: true, values: [`${fr(result.liters, 2)} L`] },
        ]}
      />
      <Formula>L = Σ km liaison × conso liaison + Σ km ES × conso ES, puis × (1 + marge). Arrondi au litre supérieur.</Formula>
    </Card>
  );
}

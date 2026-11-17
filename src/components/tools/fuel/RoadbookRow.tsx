import type { FuelSegment } from '../../../lib/calculators';
import { fr } from '../../../lib/format';
import { Chip } from '../../ui/Chip';
import { Field } from '../../ui/Field';
import { Icon } from '../../ui/Icon';
import { Marker } from '../../ui/Marker';
import styles from './Roadbook.module.css';

interface Props {
  segment: FuelSegment;
  label: string;
  liters: number;
  onKm: (km: number | null) => void;
  onInsertLink: () => void;
  onRemoveLink: () => void;
  onRemoveStage: () => void;
}

/** Une ligne du roadbook : puce + litres · champ km · une seule action (+ / corbeille). */
export function RoadbookRow({ segment, label, liters, onKm, onInsertLink, onRemoveLink, onRemoveStage }: Props) {
  const isStage = segment.kind === 'stage';
  return (
    <li class={styles.row}>
      <span class={styles.rail}>
        <Marker kind={isStage ? 'stage' : 'link'} />
      </span>
      <div class={styles.line}>
        <div class={styles.meta}>
          <Chip kind={isStage ? 'stage' : 'link'}>{label}</Chip>
          <span class={`num ${styles.liters}`}>{fr(liters, 2)} L</span>
        </div>
        <Field
          id={`km-${segment.id}`}
          label={`Distance ${label}`}
          labelNote="en km"
          hideLabel
          value={segment.km}
          onChange={onKm}
          unit="km"
          placeholder="0"
        />
        {isStage ? (
          <button type="button" class={styles.action} onClick={onRemoveStage} aria-label={`Supprimer ${label} et la liaison suivante`}>
            <Icon name="trash" size={22} />
          </button>
        ) : segment.optional ? (
          <button type="button" class={styles.action} onClick={onRemoveLink} aria-label={`Supprimer ${label}`}>
            <Icon name="trash" size={22} />
          </button>
        ) : (
          <button type="button" class={`${styles.action} ${styles.dashed}`} onClick={onInsertLink} aria-label={`Ajouter une liaison après ${label}`}>
            <Icon name="plus" size={22} stroke={2.4} />
          </button>
        )}
      </div>
    </li>
  );
}

import {
  addStage,
  insertLink,
  removeLink,
  removeStage,
  segmentLabels,
  type FuelResult,
  type FuelSegment,
} from '../../../lib/calculators';
import { fr } from '../../../lib/format';
import { Card } from '../../ui/Card';
import { Icon } from '../../ui/Icon';
import { Marker } from '../../ui/Marker';
import { RoadbookRow } from './RoadbookRow';
import styles from './Roadbook.module.css';

interface Props {
  segments: FuelSegment[];
  result: FuelResult;
  onChange: (segments: FuelSegment[]) => void;
}

export function Roadbook({ segments, result, onChange }: Props) {
  const labels = segmentLabels(segments);
  const stageCount = segments.filter((s) => s.kind === 'stage').length;

  return (
    <Card title="Roadbook" aside={`${stageCount} ES · ${fr(result.totalKm, 1)} km`}>
      <ol class={styles.list}>
        <li class={styles.row}>
          <span class={styles.rail}>
            <Marker kind="start" />
          </span>
          <p class={styles.terminal}>Départ</p>
        </li>
        {segments.map((s, i) => (
          <RoadbookRow
            key={s.id}
            segment={s}
            label={labels[i] ?? ''}
            liters={result.perSegment[i] ?? 0}
            onKm={(km) => onChange(segments.map((x) => (x.id === s.id ? { ...x, km } : x)))}
            onInsertLink={() => onChange(insertLink(segments, s.id))}
            onRemoveLink={() => onChange(removeLink(segments, s.id))}
            onRemoveStage={() => onChange(removeStage(segments, s.id))}
          />
        ))}
        <li class={styles.row}>
          <span class={styles.rail}>
            <Marker kind="finish" />
          </span>
          <p class={styles.terminal}>Arrivée</p>
        </li>
      </ol>
      <button type="button" class={styles.add} onClick={() => onChange(addStage(segments))}>
        <Icon name="plus" size={22} stroke={2.8} />
        Ajouter une spéciale
      </button>
    </Card>
  );
}

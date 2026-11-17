import { useMemo } from 'preact/hooks';
import { usePersistentState } from '../hooks/usePersistentState';
import { computeDisplacement } from '../lib/calculators';
import { fr } from '../lib/format';
import { AppShell } from '../components/layout/AppShell';
import { ResultBar } from '../components/layout/ResultBar';
import { ToolHeader } from '../components/layout/ToolHeader';
import { ChamberCard } from '../components/tools/volumetric/ChamberCard';
import { CylinderCard } from '../components/tools/volumetric/CylinderCard';
import { DisplacementDetail } from '../components/tools/volumetric/DisplacementDetail';
import { makeVolumetricDefaults, sanitizeVolumetric } from '../components/tools/volumetric/volumetricState';

export function Volumetric() {
  const [s, setState, reset] = usePersistentState('volumetric', makeVolumetricDefaults, sanitizeVolumetric);
  const set = (patch: Partial<typeof s>) => setState((prev) => ({ ...prev, ...patch }));

  const result = useMemo(
    () => computeDisplacement({ boreMm: s.bore, strokeMm: s.stroke, cylinders: s.cylinders, chamberCc: s.chamber }),
    [s],
  );

  return (
    <AppShell
      header={<ToolHeader eyebrow="Outil 03" title="Volumétrique" onReset={reset} />}
      result={
        <ResultBar
          eyebrow={`Cylindrée · ${s.cylinders} cyl.`}
          value={fr(result.totalCc, 0)}
          unit="cm³"
          side={{
            value: result.compressionRatio === null ? '—' : `${fr(result.compressionRatio, 1)} : 1`,
            caption: 'Rapport volumétrique',
          }}
        />
      }
    >
      <CylinderCard
        bore={s.bore}
        stroke={s.stroke}
        cylinders={s.cylinders}
        onBore={(bore) => set({ bore })}
        onStroke={(stroke) => set({ stroke })}
        onCylinders={(cylinders) => set({ cylinders })}
      />
      <ChamberCard chamber={s.chamber} onChange={(chamber) => set({ chamber })} />
      <DisplacementDetail result={result} bore={s.bore} stroke={s.stroke} />
    </AppShell>
  );
}

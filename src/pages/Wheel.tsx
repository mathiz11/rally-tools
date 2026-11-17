import { useMemo } from 'preact/hooks';
import { usePersistentState } from '../hooks/usePersistentState';
import { computeWheelSpeed, wheelSpeedTable } from '../lib/calculators';
import { fr } from '../lib/format';
import { AppShell } from '../components/layout/AppShell';
import { ResultBar } from '../components/layout/ResultBar';
import { ToolHeader } from '../components/layout/ToolHeader';
import { RatioCard } from '../components/tools/wheel/RatioCard';
import { RpmCard } from '../components/tools/wheel/RpmCard';
import { SpeedTable } from '../components/tools/wheel/SpeedTable';
import { WheelCard } from '../components/tools/wheel/WheelCard';
import { makeWheelDefaults, sanitizeWheel } from '../components/tools/wheel/wheelState';

export function Wheel() {
  const [s, setState, reset] = usePersistentState('wheel', makeWheelDefaults, sanitizeWheel);
  const set = (patch: Partial<typeof s>) => setState((prev) => ({ ...prev, ...patch }));

  const { result, table } = useMemo(() => {
    const base = { z1: s.z1, z2: s.z2, z3: s.z3, z4: s.z4, wheelDiameterMm: s.diameter, tyreCrushMm: s.crush };
    return {
      result: computeWheelSpeed({ ...base, rpm: s.rpm }),
      table: wheelSpeedTable(base),
    };
  }, [s]);

  return (
    <AppShell
      header={<ToolHeader eyebrow="Outil 02" title="Vitesse roue" onReset={reset} />}
      result={
        <ResultBar
          eyebrow={`À ${fr(s.rpm, 0)} tr/min`}
          value={result.kmh === null ? '—' : fr(result.kmh, 1)}
          unit="km/h"
          side={{ value: result.kmhPer1000Rpm === null ? '—' : fr(result.kmhPer1000Rpm, 1), caption: 'km/h par 1 000 tr' }}
        />
      }
    >
      <RpmCard rpm={s.rpm} onChange={(rpm) => set({ rpm })} />
      <RatioCard
        title="Boîte · rapport engagé"
        ratioLabel="Z1/Z2"
        ratio={result.gearRatio}
        a={{ id: 'z1', label: 'Z1 · pignon menant', value: s.z1, onChange: (z1) => set({ z1 }) }}
        b={{
          id: 'z2',
          label: 'Z2 · pignon mené',
          value: s.z2,
          onChange: (z2) => set({ z2 }),
          error: s.z2 === 0 ? 'Z2 ne peut pas être 0' : undefined,
        }}
      />
      <RatioCard
        title="Pont · couple final"
        ratioLabel="Z3/Z4"
        ratio={result.finalRatio}
        a={{ id: 'z3', label: 'Z3 · pignon d\'attaque', value: s.z3, onChange: (z3) => set({ z3 }) }}
        b={{
          id: 'z4',
          label: 'Z4 · couronne',
          value: s.z4,
          onChange: (z4) => set({ z4 }),
          error: s.z4 === 0 ? 'Z4 ne peut pas être 0' : undefined,
        }}
      />
      <WheelCard
        diameter={s.diameter}
        crush={s.crush}
        usefulMm={result.usefulDiameterMm}
        circumferenceM={result.circumferenceM}
        onDiameter={(diameter) => set({ diameter })}
        onCrush={(crush) => set({ crush })}
      />
      <SpeedTable rows={table} currentRpm={s.rpm} overallRatio={result.overallRatio} />
    </AppShell>
  );
}

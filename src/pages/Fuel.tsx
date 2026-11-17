import { useMemo } from 'preact/hooks';
import { usePersistentState } from '../hooks/usePersistentState';
import { computeFuel } from '../lib/calculators';
import { fr } from '../lib/format';
import { AppShell } from '../components/layout/AppShell';
import { ResultBar } from '../components/layout/ResultBar';
import { ToolHeader } from '../components/layout/ToolHeader';
import { ConsumptionCard } from '../components/tools/fuel/ConsumptionCard';
import { FuelDetail } from '../components/tools/fuel/FuelDetail';
import { MarginCard } from '../components/tools/fuel/MarginCard';
import { Roadbook } from '../components/tools/fuel/Roadbook';
import { makeFuelDefaults, sanitizeFuel } from '../components/tools/fuel/fuelState';

export function Fuel() {
  const [state, setState, reset] = usePersistentState('fuel', makeFuelDefaults, sanitizeFuel);

  const result = useMemo(
    () =>
      computeFuel({
        linkConsumption: state.link,
        stageConsumption: state.stage,
        segments: state.segments,
        marginPercent: state.margin,
      }),
    [state],
  );

  return (
    <AppShell
      header={<ToolHeader eyebrow="Outil 01" title="Essence" onReset={reset} />}
      result={
        <ResultBar
          eyebrow={`À embarquer · marge ${state.margin} %`}
          value={fr(result.litersWithMargin, 1)}
          unit="L"
          side={{ value: `${result.litersRoundedUp} L`, caption: 'Arrondi' }}
        />
      }
    >
      <ConsumptionCard
        link={state.link}
        stage={state.stage}
        onLink={(link) => setState((s) => ({ ...s, link }))}
        onStage={(stage) => setState((s) => ({ ...s, stage }))}
      />
      <Roadbook segments={state.segments} result={result} onChange={(segments) => setState((s) => ({ ...s, segments }))} />
      <MarginCard value={state.margin} onChange={(margin) => setState((s) => ({ ...s, margin }))} />
      <FuelDetail result={result} margin={state.margin} />
    </AppShell>
  );
}

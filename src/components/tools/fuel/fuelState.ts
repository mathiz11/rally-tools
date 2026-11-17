import { buildSegments, type FuelSegment } from '../../../lib/calculators';

export interface FuelState {
  /** L/km on links. */
  link: number;
  /** L/km on special stages. */
  stage: number;
  /** Safety margin, %. */
  margin: number;
  segments: FuelSegment[];
}

export const MARGINS = [0, 5, 10, 15] as const;

/** Spec default values: 0.20 / 0.60 L/km, 10 % margin, roadbook pre-filled with 2 special stages. */
export const makeFuelDefaults = (): FuelState => ({
  link: 0.2,
  stage: 0.6,
  margin: 10,
  segments: buildSegments(2),
});

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;

function isSegment(v: unknown): v is FuelSegment {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.id === 'string' &&
    (s.kind === 'liaison' || s.kind === 'stage') &&
    (s.km === null || isNum(s.km)) &&
    (s.optional === undefined || typeof s.optional === 'boolean')
  );
}

/** Validates the state read back from localStorage; any inconsistency falls back to the defaults. */
export function sanitizeFuel(stored: unknown, defaults: FuelState): FuelState {
  if (typeof stored !== 'object' || stored === null) return defaults;
  const s = stored as Record<string, unknown>;
  const segments = Array.isArray(s.segments) && s.segments.length > 0 && s.segments.every(isSegment) ? s.segments : null;
  return {
    link: isNum(s.link) ? s.link : defaults.link,
    stage: isNum(s.stage) ? s.stage : defaults.stage,
    margin: isNum(s.margin) ? s.margin : defaults.margin,
    segments: segments ?? defaults.segments,
  };
}

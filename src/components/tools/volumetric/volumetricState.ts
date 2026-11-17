export const CYLINDER_OPTIONS = [1, 2, 3, 4, 5, 6, 8] as const;

export interface VolumetricState {
  bore: number;
  stroke: number;
  cylinders: number;
  /** Volume de chambre par cylindre, cm³ ; null = non renseigné (pas de rapport volumétrique). */
  chamber: number | null;
}

export const makeVolumetricDefaults = (): VolumetricState => ({ bore: 86, stroke: 86, cylinders: 4, chamber: 50 });

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;

export function sanitizeVolumetric(stored: unknown, defaults: VolumetricState): VolumetricState {
  if (typeof stored !== 'object' || stored === null) return defaults;
  const s = stored as Record<string, unknown>;
  const cyl = (CYLINDER_OPTIONS as readonly number[]).includes(s.cylinders as number) ? (s.cylinders as number) : defaults.cylinders;
  return {
    bore: isNum(s.bore) ? s.bore : defaults.bore,
    stroke: isNum(s.stroke) ? s.stroke : defaults.stroke,
    cylinders: cyl,
    chamber: s.chamber === null || isNum(s.chamber) ? (s.chamber as number | null) : defaults.chamber,
  };
}

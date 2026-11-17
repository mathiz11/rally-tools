/**
 * Rally Tools — pure calculation functions (no UI dependency).
 * Source of truth for the formulas: see TOOLS_SPEC.md.
 * All functions accept already-parsed numbers (see parseDecimal).
 */

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

/** Parses a FR or EN user input ("14,2", "14.2", " 14 ") → number | null. */
export function parseDecimal(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  const s = raw.trim().replace(/\s/g, '').replace(',', '.');
  if (s === '' || s === '.' || s === '-') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Formats a number in French style (decimal comma, narrow no-break space for thousands). */
export function formatFr(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/* ------------------------------------------------------------------ */
/* 01 — Fuel                                                           */
/* ------------------------------------------------------------------ */

export type SegmentKind = 'liaison' | 'stage';

export interface FuelSegment {
  id: string;
  kind: SegmentKind;
  /** Distance in km. null = empty field (counted as 0). */
  km: number | null;
  /** true = link added manually (removable). */
  optional?: boolean;
}

export interface FuelInput {
  /** Consumption on links, L/km (e.g. 0.20 = 20 L/100 km). */
  linkConsumption: number;
  /** Consumption on special stages, L/km (e.g. 0.60). */
  stageConsumption: number;
  segments: FuelSegment[];
  /** Safety margin in % (0, 5, 10, 15…). */
  marginPercent: number;
}

export interface FuelResult {
  linkKm: number;
  stageKm: number;
  totalKm: number;
  linkLiters: number;
  stageLiters: number;
  /** Total without margin. */
  liters: number;
  marginLiters: number;
  /** Total with margin — the value displayed large. */
  litersWithMargin: number;
  /** Rounded up to the next liter — « recommended rounding ». */
  litersRoundedUp: number;
  /** Liters per segment, same order as the input. */
  perSegment: number[];
}

/**
 * Builds the default roadbook: Link, SS, Link, SS, …, Link.
 * stages = 0 → a single link. Keeps the km of the existing mandatory segments (by rank).
 * Optional links are removed when the number of special stages changes.
 */
export function buildSegments(
  stages: number,
  previous: FuelSegment[] = [],
  makeId: () => string = () => Math.random().toString(36).slice(2, 10),
): FuelSegment[] {
  const n = Math.max(0, Math.floor(stages));
  const mandatory = previous.filter((s) => !s.optional);
  const prevLinks = mandatory.filter((s) => s.kind === 'liaison');
  const prevStages = mandatory.filter((s) => s.kind === 'stage');
  const out: FuelSegment[] = [];
  for (let i = 0; i <= n; i++) {
    out.push({ id: makeId(), kind: 'liaison', km: prevLinks[i]?.km ?? null });
    if (i < n) out.push({ id: makeId(), kind: 'stage', km: prevStages[i]?.km ?? null });
  }
  return out;
}

/* ---- Roadbook editing (mobile UI: no « number of special stages » stepper) ---- */

/** Adds an SS + the link that follows it at the end of the roadbook. */
export function addStage(
  segments: FuelSegment[],
  makeId: () => string = () => Math.random().toString(36).slice(2, 10),
): FuelSegment[] {
  if (segments.length === 0) return buildSegments(1, [], makeId);
  return [
    ...segments,
    { id: makeId(), kind: 'stage', km: null },
    { id: makeId(), kind: 'liaison', km: null },
  ];
}

/**
 * Removes the SS `stageId` and the mandatory link that immediately follows it
 * (optional links are never inserted directly after an SS).
 */
export function removeStage(segments: FuelSegment[], stageId: string): FuelSegment[] {
  const i = segments.findIndex((s) => s.id === stageId && s.kind === 'stage');
  if (i === -1) return segments;
  const next = segments[i + 1];
  const count = next && next.kind === 'liaison' && !next.optional ? 2 : 1;
  return [...segments.slice(0, i), ...segments.slice(i + count)];
}

/** Inserts an optional link right after the segment `afterId`. */
export function insertLink(
  segments: FuelSegment[],
  afterId: string,
  makeId: () => string = () => Math.random().toString(36).slice(2, 10),
): FuelSegment[] {
  const i = segments.findIndex((s) => s.id === afterId);
  if (i === -1) return segments;
  return [
    ...segments.slice(0, i + 1),
    { id: makeId(), kind: 'liaison', km: null, optional: true },
    ...segments.slice(i + 1),
  ];
}

/** Removes an optional link (mandatory links cannot be removed). */
export function removeLink(segments: FuelSegment[], linkId: string): FuelSegment[] {
  return segments.filter((s) => !(s.id === linkId && s.kind === 'liaison' && s.optional));
}

/** Displayed labels: « Liaison n » / « ES n », numbered separately in order. */
export function segmentLabels(segments: FuelSegment[]): string[] {
  let l = 0;
  let e = 0;
  return segments.map((s) => (s.kind === 'stage' ? `ES ${++e}` : `Liaison ${++l}`));
}

export function computeFuel(input: FuelInput): FuelResult {
  const cl = Math.max(0, input.linkConsumption);
  const cs = Math.max(0, input.stageConsumption);
  let linkKm = 0;
  let stageKm = 0;
  const perSegment = input.segments.map((s) => {
    const km = s.km !== null && s.km > 0 ? s.km : 0;
    if (s.kind === 'stage') {
      stageKm += km;
      return km * cs;
    }
    linkKm += km;
    return km * cl;
  });
  const linkLiters = linkKm * cl;
  const stageLiters = stageKm * cs;
  const liters = linkLiters + stageLiters;
  const marginLiters = (liters * Math.max(0, input.marginPercent)) / 100;
  const litersWithMargin = liters + marginLiters;
  return {
    linkKm,
    stageKm,
    totalKm: linkKm + stageKm,
    linkLiters,
    stageLiters,
    liters,
    marginLiters,
    litersWithMargin,
    // epsilon so that a floating-point 27.000000001 does not become 28
    litersRoundedUp: Math.max(0, Math.ceil(litersWithMargin - 1e-9)),
    perSegment,
  };
}

/* ------------------------------------------------------------------ */
/* 02 — Wheel speed                                                    */
/* ------------------------------------------------------------------ */

export interface WheelInput {
  /** Engine speed, rpm. */
  rpm: number;
  /** Gearbox: driving gear / driven gear (engaged ratio). */
  z1: number;
  z2: number;
  /** Final drive: pinion / crown wheel. */
  z3: number;
  z4: number;
  /** Wheel diameter (mounted tyre), mm. */
  wheelDiameterMm: number;
  /** Tyre squash under load, mm. Historical default: 20. */
  tyreCrushMm?: number;
}

export interface WheelResult {
  /** null if an input makes the calculation impossible (Z2 or Z4 = 0, effective diameter ≤ 0). */
  kmh: number | null;
  gearRatio: number | null; // Z1/Z2
  finalRatio: number | null; // Z3/Z4
  overallRatio: number | null; // (Z1/Z2)·(Z3/Z4)
  reduction: number | null; // 1 / overallRatio, ex. 5.68 : 1
  usefulDiameterMm: number;
  circumferenceM: number;
  kmhPer1000Rpm: number | null;
}

/**
 * v [km/h] = rpm × (Z1/Z2) × (Z3/Z4) × (Ø − squash)[mm] × π × 6e-5
 * (6e-5 = 60 min/h ÷ 1,000,000 mm/km)
 * Same formula as the existing site; the squash (hard-coded 20 mm) becomes a parameter.
 */
export function computeWheelSpeed(input: WheelInput): WheelResult {
  const crush = input.tyreCrushMm ?? 20;
  const useful = input.wheelDiameterMm - crush;
  const circumferenceM = (Math.max(0, useful) * Math.PI) / 1000;
  const gearRatio = input.z2 > 0 ? input.z1 / input.z2 : null;
  const finalRatio = input.z4 > 0 ? input.z3 / input.z4 : null;
  const overallRatio = gearRatio !== null && finalRatio !== null ? gearRatio * finalRatio : null;
  const valid = overallRatio !== null && overallRatio > 0 && useful > 0;
  const speedAt = (rpm: number) => (valid ? rpm * overallRatio! * useful * Math.PI * 6e-5 : null);
  return {
    kmh: valid && input.rpm >= 0 ? speedAt(input.rpm) : null,
    gearRatio,
    finalRatio,
    overallRatio,
    reduction: overallRatio && overallRatio > 0 ? 1 / overallRatio : null,
    usefulDiameterMm: useful,
    circumferenceM,
    kmhPer1000Rpm: speedAt(1000),
  };
}

/** Speed/rpm table displayed under the result (default 4,000 → 11,000 rpm). */
export function wheelSpeedTable(
  input: Omit<WheelInput, 'rpm'>,
  rpms: number[] = [4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000],
): { rpm: number; kmh: number | null }[] {
  return rpms.map((rpm) => ({ rpm, kmh: computeWheelSpeed({ ...input, rpm }).kmh }));
}

/* ------------------------------------------------------------------ */
/* 03 — Volumetric                                                     */
/* ------------------------------------------------------------------ */

export interface DisplacementInput {
  /** Bore, mm. */
  boreMm: number;
  /** Stroke, mm. */
  strokeMm: number;
  cylinders: number;
  /** Chamber volume per cylinder, cm³ (optional → no compression ratio). */
  chamberCc?: number | null;
}

export interface DisplacementResult {
  pistonAreaCm2: number;
  unitCc: number;
  totalCc: number;
  totalLiters: number;
  /** stroke / bore */
  strokeBoreRatio: number | null;
  engineShape: 'super-carré' | 'carré' | 'longue course' | null;
  /** (Vu + Vc) / Vc — null if no chamber volume. */
  compressionRatio: number | null;
}

/**
 * V unit [cm³] = π × bore² / 4 × stroke / 1000  (mm³ → cm³)
 * Fixes the existing site's bug, which computed π × √d / 4 × h (√ instead of ²).
 */
export function computeDisplacement(input: DisplacementInput): DisplacementResult {
  const bore = Math.max(0, input.boreMm);
  const stroke = Math.max(0, input.strokeMm);
  const cyl = Math.max(1, Math.floor(input.cylinders));
  const areaMm2 = (Math.PI * bore * bore) / 4;
  const unitCc = (areaMm2 * stroke) / 1000;
  const totalCc = unitCc * cyl;
  const ratio = bore > 0 ? stroke / bore : null;
  const shape =
    ratio === null ? null : ratio < 0.95 ? 'super-carré' : ratio <= 1.05 ? 'carré' : 'longue course';
  const vc = input.chamberCc ?? null;
  return {
    pistonAreaCm2: areaMm2 / 100,
    unitCc,
    totalCc,
    totalLiters: totalCc / 1000,
    strokeBoreRatio: ratio,
    engineShape: shape,
    compressionRatio: vc !== null && vc > 0 && unitCc > 0 ? (unitCc + vc) / vc : null,
  };
}

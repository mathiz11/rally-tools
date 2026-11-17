/**
 * Rally Tools — fonctions de calcul pures (aucune dépendance UI).
 * Source de vérité des formules : voir TOOLS_SPEC.md.
 * Toutes les fonctions acceptent des nombres déjà parsés (voir parseDecimal).
 */

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

/** Parse une saisie utilisateur FR ou EN ("14,2", "14.2", " 14 ") → number | null. */
export function parseDecimal(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  const s = raw.trim().replace(/\s/g, '').replace(',', '.');
  if (s === '' || s === '.' || s === '-') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Formate un nombre en français (virgule décimale, espace fine insécable pour les milliers). */
export function formatFr(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/* ------------------------------------------------------------------ */
/* 01 — Essence                                                        */
/* ------------------------------------------------------------------ */

export type SegmentKind = 'liaison' | 'stage';

export interface FuelSegment {
  id: string;
  kind: SegmentKind;
  /** Distance en km. null = champ vide (compté 0). */
  km: number | null;
  /** true = liaison ajoutée manuellement (supprimable). */
  optional?: boolean;
}

export interface FuelInput {
  /** Consommation en liaison, L/km (ex. 0.20 = 20 L/100 km). */
  linkConsumption: number;
  /** Consommation en spéciale, L/km (ex. 0.60). */
  stageConsumption: number;
  segments: FuelSegment[];
  /** Marge de sécurité en % (0, 5, 10, 15…). */
  marginPercent: number;
}

export interface FuelResult {
  linkKm: number;
  stageKm: number;
  totalKm: number;
  linkLiters: number;
  stageLiters: number;
  /** Total sans marge. */
  liters: number;
  marginLiters: number;
  /** Total avec marge — valeur affichée en grand. */
  litersWithMargin: number;
  /** Arrondi au litre supérieur — « arrondi conseillé ». */
  litersRoundedUp: number;
  /** Litres par segment, même ordre que l'entrée. */
  perSegment: number[];
}

/**
 * Construit le roadbook par défaut : Liaison, ES, Liaison, ES, …, Liaison.
 * stages = 0 → une seule liaison. Conserve les km des segments obligatoires existants (par rang).
 * Les liaisons optionnelles sont supprimées quand le nombre de spéciales change.
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

/* ---- Édition du roadbook (UI mobile : pas de stepper « nombre de spéciales ») ---- */

/** Ajoute une ES + la liaison qui la suit en fin de roadbook. */
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
 * Supprime l'ES `stageId` et la liaison obligatoire qui la suit immédiatement
 * (les liaisons optionnelles ne sont jamais insérées directement après une ES).
 */
export function removeStage(segments: FuelSegment[], stageId: string): FuelSegment[] {
  const i = segments.findIndex((s) => s.id === stageId && s.kind === 'stage');
  if (i === -1) return segments;
  const next = segments[i + 1];
  const count = next && next.kind === 'liaison' && !next.optional ? 2 : 1;
  return [...segments.slice(0, i), ...segments.slice(i + count)];
}

/** Insère une liaison optionnelle juste après le segment `afterId`. */
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

/** Supprime une liaison optionnelle (les liaisons obligatoires ne sont pas supprimables). */
export function removeLink(segments: FuelSegment[], linkId: string): FuelSegment[] {
  return segments.filter((s) => !(s.id === linkId && s.kind === 'liaison' && s.optional));
}

/** Libellés affichés : « Liaison n » / « ES n », numérotés séparément dans l'ordre. */
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
    // epsilon pour éviter qu'un 27.000000001 flottant ne devienne 28
    litersRoundedUp: Math.max(0, Math.ceil(litersWithMargin - 1e-9)),
    perSegment,
  };
}

/* ------------------------------------------------------------------ */
/* 02 — Vitesse roue                                                   */
/* ------------------------------------------------------------------ */

export interface WheelInput {
  /** Régime moteur, tr/min. */
  rpm: number;
  /** Boîte : pignon menant / pignon mené (rapport engagé). */
  z1: number;
  z2: number;
  /** Pont : pignon d'attaque / couronne (couple final). */
  z3: number;
  z4: number;
  /** Diamètre de roue (pneu monté), mm. */
  wheelDiameterMm: number;
  /** Écrasement du pneu en charge, mm. Défaut historique : 20. */
  tyreCrushMm?: number;
}

export interface WheelResult {
  /** null si une entrée rend le calcul impossible (Z2 ou Z4 = 0, diamètre utile ≤ 0). */
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
 * v [km/h] = rpm × (Z1/Z2) × (Z3/Z4) × (Ø − écrasement)[mm] × π × 6e-5
 * (6e-5 = 60 min/h ÷ 1 000 000 mm/km)
 * Formule identique à l'existant, l'écrasement (20 mm codé en dur) devient un paramètre.
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

/** Table vitesse/régime affichée sous le résultat (par défaut 4 000 → 11 000 tr/min). */
export function wheelSpeedTable(
  input: Omit<WheelInput, 'rpm'>,
  rpms: number[] = [4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000],
): { rpm: number; kmh: number | null }[] {
  return rpms.map((rpm) => ({ rpm, kmh: computeWheelSpeed({ ...input, rpm }).kmh }));
}

/* ------------------------------------------------------------------ */
/* 03 — Volumétrique                                                   */
/* ------------------------------------------------------------------ */

export interface DisplacementInput {
  /** Alésage, mm. */
  boreMm: number;
  /** Course, mm. */
  strokeMm: number;
  cylinders: number;
  /** Volume de chambre par cylindre, cm³ (optionnel → pas de rapport volumétrique). */
  chamberCc?: number | null;
}

export interface DisplacementResult {
  pistonAreaCm2: number;
  unitCc: number;
  totalCc: number;
  totalLiters: number;
  /** course / alésage */
  strokeBoreRatio: number | null;
  engineShape: 'super-carré' | 'carré' | 'longue course' | null;
  /** (Vu + Vc) / Vc — null si pas de volume de chambre. */
  compressionRatio: number | null;
}

/**
 * V unitaire [cm³] = π × alésage² / 4 × course / 1000  (mm³ → cm³)
 * Corrige le bug de l'existant, qui calculait π × √d / 4 × h (√ au lieu de ²).
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

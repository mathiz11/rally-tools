import { describe, expect, it } from 'vitest';
import {
  addStage,
  buildSegments,
  insertLink,
  removeLink,
  removeStage,
  segmentLabels,
  computeDisplacement,
  computeFuel,
  computeWheelSpeed,
  parseDecimal,
  wheelSpeedTable,
} from './calculators';

describe('parseDecimal', () => {
  it('accepts comma and dot', () => {
    expect(parseDecimal('14,2')).toBe(14.2);
    expect(parseDecimal('14.2')).toBe(14.2);
    expect(parseDecimal(' 1 250 ')).toBe(1250);
  });
  it('returns null for empty or invalid input', () => {
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('abc')).toBeNull();
    expect(parseDecimal(undefined)).toBeNull();
  });
});

describe('Fuel', () => {
  let i = 0;
  const id = () => `s${i++}`;

  it('builds alternating Link/SS with one more link than special stages', () => {
    const segs = buildSegments(2, [], id);
    expect(segs.map((s) => s.kind)).toEqual(['liaison', 'stage', 'liaison', 'stage', 'liaison']);
    expect(buildSegments(0, [], id).map((s) => s.kind)).toEqual(['liaison']);
  });

  it('keeps existing km when adding a special stage and removes optional links', () => {
    const base = buildSegments(1, [], id);
    base[0].km = 10;
    base[1].km = 5;
    base[2].km = 7;
    const withOpt = [...base.slice(0, 1), { id: id(), kind: 'liaison' as const, km: 3, optional: true }, ...base.slice(1)];
    const next = buildSegments(2, withOpt, id);
    expect(next.map((s) => s.km)).toEqual([10, 5, 7, null, null]);
  });

  it('mockup example: 24.56 L, 27.016 L with 10 %, rounded 28 L', () => {
    const segments = buildSegments(2, [], id);
    [12, 8.4, 25, 14.2, 18].forEach((km, k) => (segments[k].km = km));
    const r = computeFuel({ linkConsumption: 0.2, stageConsumption: 0.6, segments, marginPercent: 10 });
    expect(r.linkKm).toBeCloseTo(55, 6);
    expect(r.stageKm).toBeCloseTo(22.6, 6);
    expect(r.linkLiters).toBeCloseTo(11, 6);
    expect(r.stageLiters).toBeCloseTo(13.56, 6);
    expect(r.liters).toBeCloseTo(24.56, 6);
    expect(r.litersWithMargin).toBeCloseTo(27.016, 6);
    expect(r.litersRoundedUp).toBe(28);
    expect(r.perSegment[1]).toBeCloseTo(5.04, 6);
  });

  it('adding / removing SSs and optional links', () => {
    let segs = buildSegments(1, [], id); // L ES L
    segs = addStage(segs, id); // L ES L ES L
    expect(segs.map((s) => s.kind)).toEqual(['liaison', 'stage', 'liaison', 'stage', 'liaison']);
    segs = insertLink(segs, segs[0].id, id); // L Lopt ES L ES L
    expect(segmentLabels(segs)).toEqual(['Liaison 1', 'Liaison 2', 'ES 1', 'Liaison 3', 'ES 2', 'Liaison 4']);
    const es1 = segs[2].id;
    segs = removeStage(segs, es1); // L Lopt ES L
    expect(segs.map((s) => s.kind)).toEqual(['liaison', 'liaison', 'stage', 'liaison']);
    segs = removeLink(segs, segs[0].id); // mandatory link: unchanged
    expect(segs).toHaveLength(4);
    segs = removeLink(segs, segs[1].id); // optional: removed
    expect(segs.map((s) => s.kind)).toEqual(['liaison', 'stage', 'liaison']);
    expect(addStage([], id).map((s) => s.kind)).toEqual(['liaison', 'stage', 'liaison']);
  });

  it('empty fields count as 0', () => {
    const r = computeFuel({ linkConsumption: 0.2, stageConsumption: 0.6, segments: buildSegments(1, [], id), marginPercent: 0 });
    expect(r.liters).toBe(0);
    expect(r.litersRoundedUp).toBe(0);
  });
});

describe('Wheel speed', () => {
  const defaults = { rpm: 9600, z1: 20, z2: 25, z3: 11, z4: 50, wheelDiameterMm: 650, tyreCrushMm: 20 };

  it('historical default values → 200.64 km/h (same as the existing site, displayed 200.6)', () => {
    const r = computeWheelSpeed(defaults);
    expect(Number(r.kmh!.toFixed(2))).toBe(200.64);
    expect(r.overallRatio).toBeCloseTo(0.176, 6);
    expect(r.kmhPer1000Rpm!).toBeCloseTo(20.9, 1);
    expect(r.circumferenceM).toBeCloseTo(1.979, 3);
  });

  it('default squash = 20 mm', () => {
    const { tyreCrushMm, ...rest } = defaults;
    expect(computeWheelSpeed(rest).kmh).toBeCloseTo(computeWheelSpeed(defaults).kmh!, 9);
  });

  it('Z2 or Z4 at 0 → null result, not Infinity', () => {
    expect(computeWheelSpeed({ ...defaults, z2: 0 }).kmh).toBeNull();
    expect(computeWheelSpeed({ ...defaults, z4: 0 }).kmh).toBeNull();
  });

  it('per-rpm table', () => {
    const t = wheelSpeedTable(defaults);
    expect(t).toHaveLength(8);
    expect(t[0].rpm).toBe(4000);
    expect(t[7].kmh!).toBeGreaterThan(t[0].kmh!);
  });
});

describe('Volumetric', () => {
  it('86 × 86 mm, 4 cylinders → ≈ 1,998 cm³', () => {
    const r = computeDisplacement({ boreMm: 86, strokeMm: 86, cylinders: 4 });
    expect(r.unitCc).toBeCloseTo(499.56, 2);
    expect(Math.round(r.totalCc)).toBe(1998);
    expect(r.engineShape).toBe('carré');
    expect(r.compressionRatio).toBeNull();
  });

  it('compression ratio with a 50 cm³ chamber ≈ 10.99 : 1', () => {
    const r = computeDisplacement({ boreMm: 86, strokeMm: 86, cylinders: 4, chamberCc: 50 });
    expect(r.compressionRatio!).toBeCloseTo(10.99, 2);
  });

  it('engine shape', () => {
    expect(computeDisplacement({ boreMm: 90, strokeMm: 80, cylinders: 4 }).engineShape).toBe('super-carré');
    expect(computeDisplacement({ boreMm: 80, strokeMm: 90, cylinders: 4 }).engineShape).toBe('longue course');
  });
});

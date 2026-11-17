import { describe, expect, it } from 'vitest';
import { fr, frMax, rawFr, roundTo } from './format';

describe('format', () => {
  it('fr: decimal comma, never -0 or NaN', () => {
    expect(fr(27.016, 1)).toBe('27,0');
    expect(fr(-0, 1)).toBe('0,0');
    expect(fr(-0.01, 1)).toBe('0,0');
    expect(fr(Number.NaN, 1)).toBe('—');
    expect(fr(Infinity, 1)).toBe('—');
  });

  it('fr: no-break space for thousands', () => {
    expect(fr(1998, 0).replace(/\s/g, ' ')).toBe('1 998');
  });

  it('frMax: no useless zeros', () => {
    expect(frMax(20, 1)).toBe('20');
    expect(frMax(22.5, 1)).toBe('22,5');
    expect(frMax(0, 1)).toBe('0');
  });

  it('rawFr and roundTo', () => {
    expect(rawFr(14.2)).toBe('14,2');
    expect(rawFr(null)).toBe('');
    expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
  });
});

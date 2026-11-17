import { formatFr } from './calculators';

/** formatFr that never displays « -0 » or « -0,0 ». */
export function fr(value: number, decimals: number): string {
  const s = formatFr(value, decimals);
  return /^[-−]0(,0+)?$/.test(s) ? s.slice(1) : s;
}

/** FR number with at most `maxDecimals` decimals (no useless zeros): 20 → « 20 », 22.5 → « 22,5 ». */
export function frMax(value: number, maxDecimals: number): string {
  if (!Number.isFinite(value)) return '—';
  const s = value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: maxDecimals });
  return /^[-−]0$/.test(s) ? '0' : s;
}

/** « Raw » editable value: 14.2 → « 14,2 » (FR separator, no thousands spaces). */
export function rawFr(value: number | null): string {
  return value === null ? '' : String(value).replace('.', ',');
}

/** Rounds to `decimals` decimals (avoids 0.1 + 0.2 = 0.30000000000000004 in the steppers). */
export function roundTo(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

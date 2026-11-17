import { formatFr } from './calculators';

/** formatFr sans jamais afficher « -0 » ni « -0,0 ». */
export function fr(value: number, decimals: number): string {
  const s = formatFr(value, decimals);
  return /^[-−]0(,0+)?$/.test(s) ? s.slice(1) : s;
}

/** Nombre FR avec au plus `maxDecimals` décimales (pas de zéros inutiles) : 20 → « 20 », 22,5 → « 22,5 ». */
export function frMax(value: number, maxDecimals: number): string {
  if (!Number.isFinite(value)) return '—';
  const s = value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: maxDecimals });
  return /^[-−]0$/.test(s) ? '0' : s;
}

/** Valeur éditable « brute » : 14.2 → « 14,2 » (séparateur FR, sans espaces de milliers). */
export function rawFr(value: number | null): string {
  return value === null ? '' : String(value).replace('.', ',');
}

/** Arrondit à `decimals` décimales (évite 0,1 + 0,2 = 0,30000000000000004 dans les steppers). */
export function roundTo(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

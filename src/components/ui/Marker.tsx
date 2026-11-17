import styles from './Marker.module.css';

export type MarkerKind = 'link' | 'stage' | 'accent' | 'start' | 'finish';

/** Color-code marker: link = steel circle, special stage = orange square (color + shape, never color alone). */
export function Marker({ kind }: { kind: MarkerKind }) {
  return <span class={`${styles.marker} ${styles[kind]}`} aria-hidden="true" />;
}

import styles from './Marker.module.css';

export type MarkerKind = 'link' | 'stage' | 'accent' | 'start' | 'finish';

/** Pastille de code couleur : liaison = rond acier, spéciale = carré orange (couleur + forme, jamais la couleur seule). */
export function Marker({ kind }: { kind: MarkerKind }) {
  return <span class={`${styles.marker} ${styles[kind]}`} aria-hidden="true" />;
}

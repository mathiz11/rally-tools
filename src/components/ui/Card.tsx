import type { ComponentChildren } from 'preact';
import styles from './Card.module.css';

interface CardProps {
  title: string;
  /** Texte mono à droite du titre (compteur, rapport…). */
  aside?: ComponentChildren;
  children: ComponentChildren;
}

export function Card({ title, aside, children }: CardProps) {
  return (
    <section class={styles.card}>
      <header class={styles.head}>
        <h2 class={styles.title}>{title}</h2>
        {aside !== undefined && <span class={`num ${styles.aside}`}>{aside}</span>}
      </header>
      {children}
    </section>
  );
}

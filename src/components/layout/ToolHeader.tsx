import { Link } from '../../router';
import { Icon } from '../ui/Icon';
import styles from './ToolHeader.module.css';

interface ToolHeaderProps {
  /** « OUTIL 01 » */
  eyebrow: string;
  title: string;
  onReset: () => void;
}

export function ToolHeader({ eyebrow, title, onReset }: ToolHeaderProps) {
  return (
    <header class={styles.header}>
      <Link href="/" class={styles.icon} aria-label="Retour à l'accueil">
        <Icon name="back" size={24} stroke={2.4} />
      </Link>
      <div class={styles.titles}>
        <p class={`num ${styles.eyebrow}`}>{eyebrow}</p>
        <h1 class={styles.title}>{title}</h1>
      </div>
      <button type="button" class={`${styles.icon} ${styles.bordered}`} onClick={onReset} aria-label="Réinitialiser les valeurs par défaut">
        <Icon name="refresh" size={20} stroke={2.2} />
      </button>
    </header>
  );
}

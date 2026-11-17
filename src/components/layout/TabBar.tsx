import { Link, usePath } from '../../router';
import { Icon, type IconName } from '../ui/Icon';
import styles from './TabBar.module.css';

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Accueil', icon: 'home' },
  { href: '/essence', label: 'Essence', icon: 'fuel' },
  { href: '/vitesse-roue', label: 'Vitesse', icon: 'gauge' },
  { href: '/volumetrique', label: 'Volume', icon: 'piston' },
];

export function TabBar() {
  const path = usePath();
  return (
    <nav class={styles.bar} aria-label="Outils">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} class={styles.tab} aria-current={t.href === path ? 'page' : undefined}>
          <Icon name={t.icon} size={22} stroke={t.href === path ? 2.2 : 1.8} />
          <span class={styles.label}>{t.label}</span>
        </Link>
      ))}
    </nav>
  );
}

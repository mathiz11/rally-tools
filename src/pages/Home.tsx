import { AppShell } from '../components/layout/AppShell';
import { Icon, type IconName } from '../components/ui/Icon';
import { Link } from '../router';
import styles from './Home.module.css';

const TOOLS: { href: string; plate: string; title: string; text: string; icon: IconName }[] = [
  { href: '/essence', plate: 'Outil 01', title: 'Essence', text: "Litres à embarquer, marge comprise", icon: 'fuel' },
  { href: '/vitesse-roue', plate: 'Outil 02', title: 'Vitesse roue', text: 'km/h selon régime et rapports', icon: 'gauge' },
  { href: '/volumetrique', plate: 'Outil 03', title: 'Volumétrique', text: 'Cylindrée et rapport volumétrique', icon: 'piston' },
];

export function Home() {
  return (
    <AppShell
      header={
        <header class={styles.header}>
          <img src="/favicon.svg" alt="" width="32" height="32" class={styles.logo} />
          <p class={styles.brand}>Rally Tools</p>
        </header>
      }
    >
      <section class={styles.hero}>
        <h1 class={styles.h1}>
          Les calculs
          <br />
          du <span class={styles.accent}>copilote</span>
        </h1>
        <p class={styles.lead}>Essence, vitesse roue, cylindrée. Pensé pour le bord de la spéciale : une main, gros boutons, résultat en direct.</p>
      </section>

      <nav class={styles.tools} aria-label="Outils">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} class={styles.tool}>
            <span class={styles.toolIcon}>
              <Icon name={t.icon} size={26} />
            </span>
            <span class={styles.toolText}>
              <span class={`num ${styles.plate}`}>{t.plate}</span>
              <span class={styles.toolTitle}>{t.title}</span>
              <span class={styles.toolDesc}>{t.text}</span>
            </span>
            <Icon name="chevron" size={22} stroke={2.2} />
          </Link>
        ))}
      </nav>

      <p class={`num ${styles.foot}`}>Fonctionne hors ligne · valeurs mémorisées sur cet appareil</p>
    </AppShell>
  );
}

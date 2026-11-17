import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { TabBar } from './TabBar';
import styles from './AppShell.module.css';

interface AppShellProps {
  header: ComponentChildren;
  /** ResultBar collante, au-dessus de la TabBar (écrans d'outil). */
  result?: ComponentChildren;
  children: ComponentChildren;
}

/**
 * Colonne mobile unique (max 560 px, centrée sur desktop) :
 * damier 6 px · header collant · zone scrollable · ResultBar · TabBar.
 */
export function AppShell({ header, result, children }: AppShellProps) {
  const scroller = useRef<HTMLElement>(null);

  // Clavier ouvert : garde le champ en cours de saisie visible au centre de la zone scrollable.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onFocus = (e: FocusEvent) => {
      const t = e.target;
      if (t instanceof HTMLInputElement && t.type === 'text') {
        window.setTimeout(() => t.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250);
      }
    };
    el.addEventListener('focusin', onFocus);
    return () => el.removeEventListener('focusin', onFocus);
  }, []);

  return (
    <div class={styles.app}>
      <div class={`checker ${styles.strip}`} aria-hidden="true" />
      {header}
      <main class={styles.scroll} ref={scroller}>
        {children}
      </main>
      {result}
      <TabBar />
    </div>
  );
}

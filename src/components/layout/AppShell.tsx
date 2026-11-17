import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { TabBar } from './TabBar';
import styles from './AppShell.module.css';

interface AppShellProps {
  header: ComponentChildren;
  /** Sticky ResultBar, above the TabBar (tool screens). */
  result?: ComponentChildren;
  children: ComponentChildren;
}

/**
 * Single mobile column (max 560 px, centered on desktop):
 * 6 px checkerboard · sticky header · scrollable area · ResultBar · TabBar.
 */
export function AppShell({ header, result, children }: AppShellProps) {
  const scroller = useRef<HTMLElement>(null);

  // Keyboard open: keeps the field being edited visible at the center of the scrollable area.
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

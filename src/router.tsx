import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { LEGACY_REDIRECTS, ROUTES } from './routes';

const NAV_EVENT = 'rally:navigate';

/** Chemin normalisé (sans slash final) ; applique les redirections des anciennes URL. */
function currentPath(): string {
  const raw = location.pathname.replace(/\/+$/, '') || '/';
  const target = LEGACY_REDIRECTS[raw];
  if (target) {
    history.replaceState(null, '', target);
    return target;
  }
  return raw;
}

export function navigate(href: string) {
  if (href === location.pathname) return;
  history.pushState(null, '', href);
  window.dispatchEvent(new Event(NAV_EVENT));
}

export function usePath(): string {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const sync = () => setPath(currentPath());
    window.addEventListener('popstate', sync);
    window.addEventListener(NAV_EVENT, sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener(NAV_EVENT, sync);
    };
  }, []);
  // Titre et description alignés sur la route (les pages HTML statiques les portent déjà au premier chargement).
  useEffect(() => {
    const meta = ROUTES.find((r) => r.path === path);
    if (!meta) return;
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
  }, [path]);
  return path;
}

interface LinkProps {
  href: string;
  class?: string;
  children?: ComponentChildren;
  'aria-label'?: string;
  'aria-current'?: 'page';
}

/** <a href> réel (clic droit, nouvel onglet OK) avec navigation sans rechargement au clic simple. */
export function Link({ href, ...rest }: LinkProps) {
  return (
    <a
      {...rest}
      href={href}
      onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(href);
      }}
    />
  );
}

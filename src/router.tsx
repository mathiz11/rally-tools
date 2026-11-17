import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { LEGACY_REDIRECTS, ROUTES } from './routes';

const NAV_EVENT = 'rally:navigate';

/** Normalized path (no trailing slash); applies the legacy URL redirects. */
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
  // Title and description aligned with the route (the static HTML pages already carry them on first load).
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

/** Real <a href> (right-click and new tab work) with reload-free navigation on a plain click. */
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

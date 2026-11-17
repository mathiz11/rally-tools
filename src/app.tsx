import type { ComponentType } from 'preact';
import { useEffect } from 'preact/hooks';
import { Fuel } from './pages/Fuel';
import { Home } from './pages/Home';
import { Volumetric } from './pages/Volumetric';
import { Wheel } from './pages/Wheel';
import { navigate, usePath } from './router';

const PAGES: Record<string, ComponentType> = {
  '/': Home,
  '/essence': Fuel,
  '/vitesse-roue': Wheel,
  '/volumetrique': Volumetric,
};

export function App() {
  const path = usePath();
  const Page = PAGES[path];

  // URL inconnue : retour à l'accueil.
  useEffect(() => {
    if (!Page) navigate('/');
  }, [Page]);

  return Page ? <Page key={path} /> : null;
}

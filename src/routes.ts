/**
 * Source unique des routes : utilisée par le routeur, la TabBar et le build
 * (pages HTML par route avec leur <title>/<meta description>, précache hors-ligne).
 */
export interface RouteMeta {
  path: string;
  title: string;
  description: string;
}

export const ROUTES: RouteMeta[] = [
  {
    path: '/',
    title: 'Rally Tools — Calculateurs pour le rallye',
    description: 'Essence à embarquer, vitesse roue et cylindrée : trois calculateurs de rallye pensés pour le téléphone, utilisables hors ligne.',
  },
  {
    path: '/essence',
    title: "Calculateur d'essence — Rally Tools",
    description: "Calculez l'essence à embarquer pour un rallye : liaisons, spéciales, consommations et marge de sécurité.",
  },
  {
    path: '/vitesse-roue',
    title: 'Vitesse roue — Rally Tools',
    description: 'Vitesse à la roue selon le régime moteur, les rapports de boîte et de pont et le diamètre de roue.',
  },
  {
    path: '/volumetrique',
    title: 'Cylindrée et rapport volumétrique — Rally Tools',
    description: "Cylindrée unitaire et totale, rapport volumétrique et forme du moteur à partir de l'alésage et de la course.",
  },
];

/** Anciennes URL (Next.js) → nouvelles. Dupliqué dans vercel.json (redirections 308). */
export const LEGACY_REDIRECTS: Record<string, string> = {
  '/tools/fuel': '/essence',
  '/tools/wheel': '/vitesse-roue',
  '/tools/volumetric': '/volumetrique',
};

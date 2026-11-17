# Rally Tools

Calculateurs pour le rallye, pensés pour le téléphone au bord d'une spéciale : **essence à embarquer**, **vitesse roue**, **cylindrée / rapport volumétrique**. Résultat en direct, valeurs mémorisées sur l'appareil, utilisable hors ligne.

Spécifications d'origine (design system, formules, brief) : [`docs/`](docs).

## Stack

| | |
|---|---|
| Build | Vite 8, site 100 % statique |
| UI | Preact (≈ 4 Ko), TypeScript strict |
| Styles | CSS Modules + `src/styles/tokens.css` (source de vérité du design) |
| Polices | `@fontsource` (Barlow, Barlow Condensed, JetBrains Mono), auto-hébergées |
| Tests | Vitest sur les fonctions de calcul |
| Hors ligne | Service worker généré au build (aucune dépendance) |

Dépendances d'exécution : `preact` uniquement.

## Commandes

```bash
npm install
npm run dev        # http://localhost:5173 — à tester en mode appareil, 390 × 844
npm test           # vitest : formules + formatage
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + build dans dist/
npm run preview    # sert dist/ (nécessaire pour tester le service worker)
```

## Structure

```
src/
  lib/calculators.ts   formules pures (aucune UI) — la seule source des calculs
  lib/format.ts        formatage FR (jamais NaN / -0)
  hooks/               usePersistentState (localStorage), useLongPress (steppers)
  components/ui/       Card, Field, StepperRow, Segmented, DetailRows…
  components/layout/   AppShell, ToolHeader, TabBar, ResultBar
  components/tools/    cartes propres à chaque outil + état par défaut/validation
  pages/               Home, Fuel, Wheel, Volumetric (câblent état → calcul → UI)
  routes.ts            routes, titres, descriptions, anciennes URL
scripts/
  vite-plugin-pwa.ts   au build : une page HTML par route + sw.js (précache)
```

**L'UI ne contient aucune formule** : les pages appellent `computeFuel`, `computeWheelSpeed`, `computeDisplacement`.

## Ajouter un outil

1. Fonction pure + tests dans `src/lib/calculators.ts`.
2. Dossier `src/components/tools/<outil>/` (état par défaut + `sanitize…`, cartes).
3. Page dans `src/pages/`, entrée dans `PAGES` (`src/app.tsx`), dans `ROUTES` (`src/routes.ts`) et dans `TABS` (`TabBar.tsx`).
4. Ligne de redirection dans `vercel.json` si l'outil remplace une ancienne URL.

## Déploiement

```bash
git remote add origin git@github.com:<compte>/rally-tools.git
git push -u origin main
```

Puis sur Vercel : **Add New → Project → importer le dépôt**. Le preset *Vite* est détecté (`vercel.json` fixe aussi build et sortie), rien à configurer. Chaque push sur `main` redéploie ; les autres branches donnent des aperçus.

`vercel.json` gère les URL propres (`/essence`), les redirections 308 `/tools/*` → nouvelles routes, le cache immuable des assets et le non-cache de `sw.js`.

Pour remplacer l'ancien site (même projet Vercel) : connecter ce dépôt au projet existant `rally-tools` et changer le *Framework Preset* en Vite.

## Choix à connaître

- **Persistance** : `localStorage`, clés `rally-tools:v1:fuel|wheel|volumetric`, écriture différée de 300 ms. Lecture synchrone au montage : l'app n'a pas de rendu serveur, donc pas d'écart d'hydratation. Un état corrompu retombe sur les valeurs par défaut. Pour changer le format stocké, passer en `v2`.
- **Roadbook** : pré-rempli avec 2 spéciales (structure) mais **kilomètres vides**. Les valeurs de la maquette (12 / 8,4 / 25 / 14,2 / 18 km → 27,0 L) sont le cas de test.
- **Volumétrique** : volume de chambre à 50 cm³ par défaut, comme la maquette mobile, pour afficher 11,0 : 1.
- **Hors ligne** : tout le build est précaché à l'installation du service worker ; une nouvelle version s'active au rechargement suivant.
- **Pages par route** : le build duplique `index.html` en `essence.html`… avec le bon `<title>` et la bonne description (partages, SEO) ; le contenu reste rendu côté client.

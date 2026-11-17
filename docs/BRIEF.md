# Rally Tools — Brief de refonte pour l'agent de code

> Lis ce fichier en premier, puis `DESIGN_SYSTEM.md`, `TOOLS_SPEC.md` et `tokens.css`. `src/lib/calculators.ts` est prêt à copier.

## Contexte

Rally Tools (https://rally-tools.vercel.app, auteur Mathis ENJOLRAS) est un petit site d'outils de calcul pour le rallye automobile : **essence à embarquer**, **vitesse roue**, **calcul volumétrique**. Il tourne aujourd'hui sur Next.js (pages router) + Semantic UI React + Formik/Yup, avec un design générique (bandeau taupe, formulaires bruts, résultats en modale).

Objectif : **refonte visuelle et UX complète**, même périmètre fonctionnel, avec les améliorations décrites dans `TOOLS_SPEC.md`.

> **MOBILE FIRST — priorité absolue.** Le site est utilisé au bord des spéciales, sur téléphone, souvent d'une main, au soleil, parfois avec des gants. On conçoit et on teste d'abord à **375–390 px**. Le desktop n'est **pas** une version enrichie : c'est le même écran, centré (voir `DESIGN_SYSTEM.md` §4).

Maquettes de référence : canvas Design « Rally Tools — refonte ».
- **Référence principale** — rangée « Mobile first » : *Accueil — mobile*, *Essence — mobile*, *Vitesse roue — mobile*, *Volumétrique — mobile* (les 3 outils sont interactifs : bouton Play), *Styleguide*.
- Référence secondaire — rangée « Desktop » : utile pour la direction visuelle uniquement ; la mise en page 2 colonnes n'est **pas** à reproduire.

## Fichiers fournis

| Fichier | Rôle |
|---|---|
| `README.md` | Ce brief : stack, architecture, tâches, critères d'acceptation |
| `DESIGN_SYSTEM.md` | Direction artistique, couleurs, typo, composants, règles mobile et a11y |
| `tokens.css` | Variables CSS + reset/base à importer globalement |
| `TOOLS_SPEC.md` | Comportement exact de chaque outil, formules, valeurs par défaut, cas de test |
| `src/lib/calculators.ts` | Fonctions de calcul pures, typées, prêtes à l'emploi |
| `src/lib/calculators.test.ts` | Tests Vitest (14 tests, tous verts) |

## Stack cible

- **Next.js 15, App Router, TypeScript strict.** Mettre à jour le repo existant (pas de nouveau repo).
- **Supprimer** `semantic-ui-react`, `semantic-ui-css`, `formik`, `yup` : le formulaire est trop simple pour justifier ces dépendances.
- Styles : **CSS Modules + `tokens.css`** (pas de Tailwind, pas de lib UI). Polices via `next/font/google`.
- État : `useState`/`useReducer` locaux + un hook `usePersistentState(key, defaults)` (localStorage, lecture après montage, debounce 300 ms).
- Tests : Vitest pour `calculators.ts` ; Playwright facultatif pour un smoke test par page.
- Toutes les pages sont statiques (SSG), déployées sur Vercel comme aujourd'hui.

## Arborescence proposée

```
app/
  layout.tsx            # polices, <html lang="fr">, viewport (width=device-width, viewport-fit=cover), AppShell
  globals.css           # @import tokens.css
  page.tsx              # Accueil
  essence/page.tsx
  vitesse-roue/page.tsx
  volumetrique/page.tsx
components/
  layout/AppShell.tsx   # header outil + zone scrollable + ResultBar + TabBar (colonne max 560 px)
  layout/ToolHeader.tsx  TabBar.tsx  ResultBar.tsx  CheckerStrip.tsx
  ui/Button.tsx  Field.tsx  StepperRow.tsx  Segmented.tsx  Card.tsx  Plate.tsx  Icon.tsx
  tools/fuel/ConsumptionCard.tsx  Roadbook.tsx  RoadbookRow.tsx  MarginCard.tsx  FuelDetail.tsx
  tools/wheel/RpmCard.tsx  RatioCard.tsx  WheelCard.tsx  SpeedTable.tsx
  tools/volumetric/CylinderCard.tsx  ChamberCard.tsx  DisplacementDetail.tsx  CylinderDiagram.tsx
hooks/
  usePersistentState.ts  useLongPress.ts
lib/
  calculators.ts  calculators.test.ts
```

## Routes

| Nouvelle route | Ancienne (redirection 308 dans `next.config`) |
|---|---|
| `/` | — |
| `/essence` | `/tools/fuel` |
| `/vitesse-roue` | `/tools/wheel` |
| `/volumetrique` | `/tools/volumetric` |

Metadata par page (`title` : « Calculateur d'essence — Rally Tools », etc.) + description courte. Favicon : plaque jaune « RT ».

## Ordre de travail

Tout se développe et se vérifie **dans un viewport de 390 × 844** (DevTools, mode appareil) avant de regarder le desktop.

1. Nettoyer les dépendances, passer en App Router + TS, importer `tokens.css`, brancher les polices.
2. Copier `lib/calculators.ts` + tests, lancer `vitest` → vert.
3. Composants `ui/` d'après `DESIGN_SYSTEM.md` §5 (et l'artboard Styleguide).
4. `AppShell` mobile : header outil, zone scrollable, **ResultBar** jaune collante, **TabBar** à 4 onglets, safe-areas iOS.
5. Accueil mobile (hero court, 3 lignes-outils, tab bar).
6. Essence mobile → Vitesse roue mobile → Volumétrique mobile, fidèles aux artboards mobiles.
7. Persistance, reset, redirections, metadata, manifest PWA (icône « RT », `display: standalone`, thème `#0B0C0E`).
8. Desktop (≥ 768 px) : uniquement centrer la colonne et ajuster les marges (§4 du design system). Rien de plus.
9. Passe a11y + tests sur vrais téléphones (iOS Safari, Chrome Android) + Lighthouse mobile.

## Critères d'acceptation

- [ ] Rendu fidèle aux **artboards mobiles** (couleurs, typo, espacements, états focus/actif/pressé).
- [ ] Toutes les cibles tactiles ≥ 48 px ; boutons − / + de 72 × 60 px, **jamais plusieurs steppers sur une même ligne**.
- [ ] Clavier numérique natif à l'ouverture de chaque champ (`inputmode="decimal"` ou `"numeric"`) ; pas de zoom iOS au focus (font-size ≥ 16 px).
- [ ] La ResultBar ne masque jamais le champ en cours de saisie (scroll-padding-bottom = hauteur ResultBar + TabBar).
- [ ] Aucun bouton « Calculer » ni modale : résultats en direct.
- [ ] Les cas de test de `TOOLS_SPEC.md` s'affichent à l'identique dans l'UI (27,0 L / 28 L ; 200,6 km/h ; 1 998 cm³ / 11,0 : 1).
- [ ] Saisie `14,2` et `14.2` acceptée partout ; jamais `NaN`, `Infinity` ou `-0` à l'écran.
- [ ] Ajouter/supprimer une spéciale conserve les km saisis ; ajouter/supprimer une liaison optionnelle fonctionne.
- [ ] Valeurs mémorisées après rechargement ; reset fonctionnel.
- [ ] Pas de scroll horizontal à 360 px ; desktop = même colonne centrée, sans régression.
- [ ] Clavier : tout atteignable, focus jaune visible ; `aria-live` sur les résultats ; Lighthouse **mobile** a11y ≥ 95, perf ≥ 90.
- [ ] Anciennes URL `/tools/*` redirigées.
- [ ] `vitest` vert, `tsc --noEmit` et lint propres.

## Décisions validées par Mathis

1. **Volumétrique** : la formule existante `π × √d / 4 × h` était un bug. On calcule la cylindrée (π × alésage² / 4 × course × cylindres) + le rapport volumétrique optionnel. Voir `TOOLS_SPEC.md` §03.
2. **Libellés Z1–Z4** : boîte (menant / mené), pont (attaque / couronne). L'écrasement de 20 mm devient un champ éditable.
3. **Mobile first** : le desktop est secondaire.

## Nouveautés à garder

- **Marge de sécurité essence** (0 / 5 / 10 / 15 %, défaut 10 %).
- **Roadbook pré-rempli** avec 2 spéciales.
- Le nombre de spéciales se gère **dans le roadbook** (« Ajouter une spéciale » + corbeille) au lieu d'un stepper.

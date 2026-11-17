# Rally Tools — Spécification fonctionnelle des outils

Formules et logique extraites du code en production (bundles Next.js de rally-tools.vercel.app, novembre 2026), puis réécrites. Implémentation de référence testée : `src/lib/calculators.ts` (+ `calculators.test.ts`, 14 tests verts). **L'UI ne doit contenir aucune formule** : elle appelle ces fonctions.

Comportements communs aux 3 outils :

- Calcul **en direct** à chaque saisie (pas de bouton « Calculer », plus de modale « Résultat / Quitter »).
- Champs vides = 0 ou résultat « — » ; jamais d'erreur bloquante, jamais `NaN` / `Infinity` à l'écran.
- Saisie décimale FR et EN acceptée (`14,2` et `14.2`) via `parseDecimal()`.
- Affichage via `formatFr()`.
- **Persistance locale** : l'état de chaque outil est sauvegardé dans `localStorage` (`rally-tools:v1:fuel`, `…:wheel`, `…:volumetric`), relu après le montage (pas pendant le SSR, pour éviter les écarts d'hydratation). Debounce 300 ms. Bouton « Réinitialiser » / « Valeurs par défaut » = efface la clé et remet les défauts.
- Lien partageable (optionnel, P2) : sérialiser l'état dans les query params.

---

## 01 — Essence (`/essence`, ancien `/tools/fuel`)

### Existant
- Steppers : conso liaison (défaut 0,2, pas 0,01), conso spéciale (0,6, pas 0,01), nombre de spéciales (0, pas 1).
- Bouton chevron (désactivé si une valeur = 0) qui génère la liste : Liaison, Spéciale, Liaison, …, Liaison. Bouton « + » sur une liaison obligatoire pour insérer une liaison optionnelle, corbeille pour la retirer.
- Submit « Calculer » → `Σ(km liaison × conso liaison) + Σ(km spéciale × conso spéciale)`, affiché « X L ».

### Nouveau comportement
Écran mobile, de haut en bas (artboard *Essence — mobile*) :

| Bloc | Détail |
|---|---|
| Carte « Consommations » | Deux **StepperRow** pleine largeur, l'une sous l'autre (jamais côte à côte) : **Liaison** (L/km, défaut **0,20**, aide « ≈ 20 L/100 km ») puis **Spéciale** (défaut **0,60**). Pas 0,01, min 0, appui long = défilement, valeur tapable directement. |
| Carte « Roadbook » | Pré-rempli avec **2 spéciales** (`buildSegments(2)`) : Départ → Liaison 1 → ES 1 → Liaison 2 → ES 2 → Liaison 3 → Arrivée. Compteur « n ES · total km » dans l'en-tête. |
| Ligne | Puce + litres de la ligne, champ km (pas libre, décimal), une action : « + » sur liaison obligatoire (`insertLink`), corbeille sur liaison optionnelle (`removeLink`), corbeille sur ES (`removeStage` : retire l'ES **et** la liaison suivante). |
| « + Ajouter une spéciale » | Bouton pleine largeur sous l'arrivée (`addStage`) : ajoute ES + liaison en fin de roadbook. **Remplace le stepper « nombre de spéciales »** de l'existant (et son bouton chevron). |
| Carte « Marge de sécurité » | **Nouveau.** Segmenté 0 / 5 / 10 / 15 %, défaut 10 %. |
| Carte « Détail » | Barre de répartition, liaisons (km, L), spéciales (km, L), marge (+ L), total sans marge (2 déc.). |
| ResultBar | « À embarquer · marge 10 % » → total **avec marge** (1 déc.) ; à droite « Arrondi N L » (litre supérieur). |

Numérotation : liaisons et ES numérotées séparément dans l'ordre d'apparition (`segmentLabels`) ; une liaison ajoutée décale les suivantes. Supprimer toutes les ES laisse au moins une liaison.

### Formule
```
L = Σ km_liaison × conso_liaison + Σ km_ES × conso_ES
L_marge = L × (1 + marge/100)
arrondi = ceil(L_marge)
```
Cas de test (maquette) : conso 0,20 / 0,60, km [12, 8,4, 25, 14,2, 18], marge 10 % → 24,56 L, **27,0 L**, arrondi **28 L**.

---

## 02 — Vitesse roue (`/vitesse-roue`, ancien `/tools/wheel`)

### Existant
Formulaire Formik (tous champs requis) : Vitesse moteur 9600, Z1 20, Z2 25, Z3 11, Z4 50, Diamètre roue 650 → modale « X km/h ».
```
v = speed × (z1/z2) × (z3/z4) × (diameter − 20) × π × 6e-5
```

### Nouveau comportement
| Champ | Unité | Défaut | Note UI |
|---|---|---|---|
| Régime moteur | tr/min | 9600 | **StepperRow** (− / + de 100, appui long, valeur tapable) + **slider** pleine largeur 1 000 → 12 000, synchronisés |
| Z1 · pignon menant | dents | 20 | groupe « Boîte · rapport engagé », affiche Z1/Z2 = 0,800 |
| Z2 · pignon mené | dents | 25 | |
| Z3 · pignon d'attaque | dents | 11 | groupe « Pont · couple final », affiche Z3/Z4 = 0,220 |
| Z4 · couronne | dents | 50 | |
| Diamètre roue | mm | 650 | pneu monté |
| Écrasement | mm | **20** | **nouveau champ** : c'était le `− 20` codé en dur. Aide : « Diamètre utile = … mm » |

> Libellés Z1–Z4 (boîte menant / mené, pont attaque / couronne) validés par Mathis.

Écran mobile : cartes Régime → Boîte (Z1 | Z2 sur une ligne, ratio dans l'en-tête) → Pont (Z3 | Z4) → Roue (Ø | écrasement, diamètre utile et circonférence en aide) → Par régime (table 4 000 → 11 000, ligne du régime courant ± 500 en jaune, rapport global dans l'en-tête, formule).
ResultBar : « À 9 600 tr/min » → vitesse (1 déc.) km/h ; à droite km/h pour 1 000 tr/min.
Z2 ou Z4 = 0, ou diamètre utile ≤ 0 → « — » (la fonction renvoie `null`).

Cas de test : défauts → **200,64 km/h** (affiché 200,6), rapport global 0,176, ≈ 20,9 km/h / 1 000 tr/min.

---

## 03 — Volumétrique (`/volumetrique`, ancien `/tools/volumetric`)

### Existant — bug confirmé
Champs « Diamètre roue » et « Hauteur », résultat en « cc » :
```
π × √diameter / 4 × height      ← racine carrée au lieu du carré
```
Avec 86 / 86 cela donne ≈ 626 « cc », ce qui ne correspond à aucun volume physique. Le libellé « Diamètre roue » est vraisemblablement un copier-coller de l'outil 02.

### Nouveau comportement (cylindrée moteur — validé)
| Champ | Unité | Défaut |
|---|---|---|
| Alésage | mm | 86 |
| Course | mm | 86 |
| Nombre de cylindres | segmenté 1·2·3·4·5·6·8 | 4 |
| Volume de chambre (optionnel) | cm³ par cylindre | 50 dans la maquette, vide par défaut en prod |

```
V_unitaire [cm³] = π × alésage² / 4 × course / 1000
V_totale = V_unitaire × cylindres
ε (rapport volumétrique) = (V_unitaire + V_chambre) / V_chambre
course/alésage < 0,95 → super-carré · 0,95–1,05 → carré · > 1,05 → longue course
```
Écran mobile : carte Cylindre (alésage | course, cylindres en segmenté 4 colonnes : 1·2·3·4 / 5·6·8) → carte Chambre (optionnel) → carte Détail (petit schéma SVG + unitaire 1 déc., section piston cm² 2 déc., litres 2 déc., course/alésage + forme moteur) → formule.
ResultBar : « Cylindrée · 4 cyl. » → total cm³ (0 déc.) ; à droite rapport volumétrique « 11,0 : 1 » ou « — ».

Cas de test : 86 × 86 × 4 → **1 998 cm³** (499,6 unitaire) ; chambre 50 cm³ → **11,0 : 1**.

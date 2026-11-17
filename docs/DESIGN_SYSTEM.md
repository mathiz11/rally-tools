# Rally Tools — Design system « Roadbook » (mobile first)

Direction : **l'univers du copilote de rallye**. Fond asphalte sombre, jaune rallye pour tout ce qui compte (résultat, action, focus), deux couleurs de code pour distinguer **liaisons** (acier) et **spéciales** (orange), typo condensée italique façon plaque de rallye, chiffres en mono façon chrono.

**Contexte d'usage qui dicte tout : un téléphone, au bord d'une spéciale, en plein soleil, souvent à une main, parfois avec des gants.**

Tokens : `tokens.css` (source de vérité). Maquettes : canvas Design « Rally Tools — refonte ». Les artboards **mobiles** font référence ; les artboards desktop ne servent qu'à la direction visuelle.

---

## 1. Principes

1. **Mobile first, mobile only.** Chaque écran est conçu pour 360–430 px. Le desktop réutilise exactement le même écran, centré.
2. **Le résultat est le héros.** Un seul chiffre jaune par outil, **toujours visible** dans la ResultBar collante en bas, au-dessus de la tab bar.
3. **En direct.** Pas de bouton « Calculer », pas de modale.
4. **Gros doigts.** Cibles ≥ 48 px (les − / + font 72 × 60). **Une seule commande par ligne** pour les steppers : jamais 3 steppers côte à côte.
5. **Une main.** Les actions fréquentes (− / +, ajout de spéciale, onglets, résultat) sont dans la moitié basse ou en pleine largeur.
6. **Code couleur constant.** Liaison = `--link` + rond, Spéciale = `--stage` + carré. Couleur + forme : jamais la couleur seule.
7. **Honnête.** Formule affichée en petit sous chaque détail.

## 2. Couleurs

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#0B0C0E` | Fond de page, fond des champs |
| `--surface` | `#131519` | Cartes, tab bar |
| `--surface-2` | `#1C1F25` | Boutons − / +, puces liaison, piste des barres |
| `--line` | `#2A2E36` | Bordures de carte, séparateurs, rail du roadbook |
| `--line-strong` | `#3A3F49` | Bordure de champ et de bouton |
| `--text` | `#F2F0EA` | Texte principal |
| `--text-2` | `#C9CCD2` | Labels de champ, texte secondaire |
| `--text-3` | `#9AA0AA` | Unités, aides, eyebrows (≥ 7:1 sur `--bg`) |
| `--accent` | `#FFC81E` | ResultBar, état actif, focus, onglet actif, logo |
| `--stage` | `#FF6A2B` | Spéciales (ES), bouton « Ajouter une spéciale » |
| `--link` | `#8FA3B8` | Liaisons |

Texte sur jaune ou orange = `#0B0C0E`. Pas de dégradés décoratifs, pas d'ombres (sauf l'anneau de focus). Motifs : **damier** (bande de 6 px en haut d'écran, marqueur « Arrivée ») et **shift-lights** (accueil desktop uniquement).

Le thème sombre est volontaire (lisibilité et batterie). Si les tests au soleil montrent un manque de lisibilité, prévoir plus tard un thème clair à fort contraste. Ce n'est pas dans le périmètre actuel.

## 3. Typographie

| Rôle | Police | Graisse / style | Taille mobile | Notes |
|---|---|---|---|---|
| Hero accueil | Barlow Condensed | 800 italic, uppercase | 52 | line-height 0.9 |
| Titre d'écran (header) | Barlow Condensed | 800 italic, uppercase | 26 | eyebrow « OUTIL 0x » mono 10 au-dessus |
| Titre de carte | Barlow Condensed | 700, uppercase | 20 | letter-spacing 0.06em |
| Label de réglage | Barlow Condensed | 700, uppercase | 18 | avec pastille couleur |
| Label de champ | Barlow | 600 | 14 | précision en 400 `--text-3` |
| Valeur saisie | JetBrains Mono | 700 | 22–28 | **≥ 16 px obligatoire** (sinon zoom iOS au focus) |
| Chiffre ResultBar | JetBrains Mono | 700 | 36 | |
| Aides, unités | JetBrains Mono / Barlow | 400–500 | 12–13 | |

Polices via `next/font/google`, `display: swap`, sous-ensemble `latin`. Nombres toujours formatés en `fr-FR` (`formatFr()`).

## 4. Layout

### AppShell (tous les écrans d'outil)
```
┌ damier 6 px ───────────────────────┐
│ ←  OUTIL 01 / ESSENCE          ⟲  │  header 60 px, collant
├────────────────────────────────────┤
│                                    │
│  cartes empilées, gap 16,          │  zone scrollable
│  padding 16                        │  scroll-padding-bottom = ResultBar + TabBar
│                                    │
├────────────────────────────────────┤
│ ▇ ResultBar jaune  27,0 L | 28 L ▇ │  collante, marge 0 12 10
├────────────────────────────────────┤
│  Accueil  Essence  Vitesse  Volume │  TabBar 58 px + env(safe-area-inset-bottom)
└────────────────────────────────────┘
```
- Implémentation : `height: 100dvh`, colonne flex ; header et barres `flex-shrink: 0`, contenu `overflow-y: auto`.
- **Desktop (≥ 768 px)** : la même colonne en `max-width: 560px; margin-inline: auto`. Fond `--bg` autour. TabBar et ResultBar restent en bas de la colonne. **Pas de 2 colonnes, pas de panneau latéral.**
- Accueil : header logo, hero court, 3 lignes-outils pleine largeur (76 px), tab bar.

## 5. Composants

### StepperRow (remplace les steppers en ligne)
Utilisé pour les consommations (Essence) et le régime (Vitesse roue).
```
● LIAISON                 ≈ 20 L/100 km
┌──────┐ ┌──────────────────┐ ┌──────┐
│  −   │ │      0,20        │ │  +   │   60 px de haut
└──────┘ └──────────────────┘ └──────┘
  72 px        flexible         72 px
```
- Ligne de label : pastille + label Condensed 18 uppercase à gauche, équivalence mono 12 `--text-3` à droite.
- Grille `72px 1fr 72px`, gap 8, hauteur **60 px**, rayon 14.
- Boutons : fond `--surface-2`, bordure `--line-strong`, icône 26 px stroke 2.6. État pressé : fond `--line`, `scale(.97)`.
- **Valeur = vrai champ éditable** (`inputmode="decimal"`, centré, mono 700 28 px) : on peut taper directement 0,23 sans appuyer 3 fois.
- **Appui long** : répétition après 400 ms, toutes les 80 ms ; un clic simple = un pas. `touch-action: manipulation`, `user-select: none` sur les boutons.
- Une StepperRow par ligne. Plusieurs lignes dans une même carte, séparées de 18 px.
- Pas : conso 0,01 L/km ; régime 100 tr/min.

### Champ
- `<input type="text" inputmode="decimal|numeric">` + `<label>` (visible ou `.visually-hidden`). Parsing via `parseDecimal()`.
- Hauteur 56–60 px, fond `--bg`, bordure `--line-strong`, rayon 12, mono 700 22–26 px. Unité en suffixe à droite (mono 12–13 `--text-3`) ou dans le label (« Alésage mm »).
- Deux champs maximum par ligne (Z1/Z2, Z3/Z4, Ø/écrasement, alésage/course).
- Focus : bordure `--accent` + `box-shadow: 0 0 0 3px var(--focus-ring)`.
- Vide = 0 ou « — » ; erreur (Z2 = 0, etc.) = bordure `--stage` + aide sous le champ. Jamais bloquant.

### Contrôle segmenté
Boutons `aria-pressed`, **52 px** de haut, rayon 12, mono 700 16–18 px, grille 4 colonnes (débordement sur 2 lignes si plus de 4 options, ex. cylindres 1·2·3·4 / 5·6·8). Actif : fond `--accent`, texte `--on-accent`.

### Roadbook (Essence)
- Grille `20px 1fr`. Rail 2 px `--line`. Marqueurs : Départ (rond creux), Liaison (rond `--link`), ES (carré `--stage`), Arrivée (damier).
- Ligne : colonne de 78 px avec la puce (« LIAISON 1 » / « ES 1 », mono 700 11 px) et les litres de la ligne en dessous (mono 12 `--text-3`), puis le champ km (56 px, flexible), puis **une** action de 48 × 56 :
  - liaison obligatoire → « + » en pointillés (insère une liaison optionnelle après),
  - liaison optionnelle → corbeille,
  - ES → corbeille (supprime l'ES **et** la liaison qui la suit).
- Sous l'arrivée : bouton pleine largeur **« + Ajouter une spéciale »** (60 px, bordure 2 px pointillée `--stage`, texte `--stage` Condensed 800 20 px) qui ajoute ES + liaison en fin de liste.
- En-tête de carte : « Roadbook » + compteur mono « 2 ES · 77,6 km ».

### ResultBar
Fond `--accent`, texte `--on-accent`, rayon 14, padding 12×16, `aria-live="polite"`.
Gauche : eyebrow mono 11 uppercase (« À EMBARQUER · MARGE 10 % ») + valeur mono 700 36 px + unité Condensed. Droite : info secondaire (arrondi 28 L / km/h pour 1 000 tr / rapport volumétrique).
Toujours visible. Le détail complet est dans la dernière carte de l'écran.

### TabBar
4 onglets (Accueil, Essence, Vitesse, Volume), icône 22 + label Condensed 13 uppercase, zone ≥ 52 px. Actif : `--accent` + `aria-current="page"`. Fond `--surface`, bordure haute `--line`, `padding-bottom: max(22px, env(safe-area-inset-bottom))`.

### Header d'outil
Retour (44 × 44) vers l'accueil, eyebrow « OUTIL 0x » + titre, bouton reset (44 × 44, bordure) à droite avec `aria-label`.

### Carte
Fond `--surface`, bordure `--line`, rayon 16, padding 16, titre Condensed 700 20 uppercase.

### Table vitesse / régime
Grille `60px 1fr 56px`, barre 10 px, ligne du régime courant (± 500) en `--accent`, régimes ≥ 10 000 en `--stage`.

## 6. Détails mobiles indispensables

- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, `theme-color` `#0B0C0E`.
- `100dvh` (pas `100vh`) ; safe-areas iOS en haut et en bas.
- Clavier ouvert : la ResultBar peut rester visible (la zone scrollable se réduit) ; garantir que le champ focus reste visible (`scrollIntoView({ block: 'center' })` au focus si nécessaire).
- `-webkit-tap-highlight-color: transparent` + état pressé visible pour compenser.
- Retour haptique léger au pas du stepper si `navigator.vibrate` existe (10 ms). Optionnel, désactivable.
- PWA : manifest + icône, utilisable hors réseau (les spéciales sont souvent en zone blanche) : précache des 4 pages.

## 7. Iconographie

SVG inline au trait (stroke 1.8–2.6, `currentColor`, extrémités arrondies), 18–26 px : pompe à essence, compteur, piston, flèche retour, refresh, plus, moins, corbeille, maison. Décoratives → `aria-hidden="true"`. Pas d'emoji.

## 8. Accessibilité (bloquant)

- Contraste ≥ 4.5:1 (toutes les paires du tableau passent ; `--placeholder` réservé aux placeholders).
- Vrais `<button>`, `<a href>`, `<input>` + `<label>`. `aria-label` sur tous les boutons icône (« Diminuer la consommation en liaison »…).
- `aria-live="polite"` sur la ResultBar, `aria-pressed` sur les segments.
- Focus visible jaune, navigation clavier complète (utile aussi sur tablette avec clavier).
- `prefers-reduced-motion` respecté ; `lang="fr"`.

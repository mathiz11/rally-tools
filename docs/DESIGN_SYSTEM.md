# Rally Tools — "Roadbook" design system (mobile first)

Direction: **the rally co-driver's world**. Dark asphalt background, rally yellow for everything that matters (result, action, focus), two color codes to tell **links** (steel) from **special stages** (orange), condensed italic type like a rally plate, mono digits like a stopwatch.

**Usage context that dictates everything: a phone, at the side of a special stage, in full sun, often one-handed, sometimes with gloves.**

Tokens: `tokens.css` (source of truth). Mockups: Design canvas "Rally Tools — refonte". The **mobile** artboards are the reference; the desktop artboards are for visual direction only.

---

## 1. Principles

1. **Mobile first, mobile only.** Every screen is designed for 360–430 px. Desktop reuses exactly the same screen, centered.
2. **The result is the hero.** One single yellow number per tool, **always visible** in the sticky ResultBar at the bottom, above the tab bar.
3. **Live.** No « Calculer » button, no modal.
4. **Big fingers.** Targets ≥ 48 px (− / + are 72 × 60). **One single control per row** for steppers: never 3 steppers side by side.
5. **One hand.** Frequent actions (− / +, add a special stage, tabs, result) are in the lower half or full width.
6. **Consistent color code.** Link = `--link` + circle, Special stage = `--stage` + square. Color + shape: never color alone.
7. **Honest.** Formula displayed in small print under each detail.

## 2. Colors

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#0B0C0E` | Page background, field background |
| `--surface` | `#131519` | Cards, tab bar |
| `--surface-2` | `#1C1F25` | − / + buttons, link chips, bar tracks |
| `--line` | `#2A2E36` | Card borders, separators, roadbook rail |
| `--line-strong` | `#3A3F49` | Field and button border |
| `--text` | `#F2F0EA` | Main text |
| `--text-2` | `#C9CCD2` | Field labels, secondary text |
| `--text-3` | `#9AA0AA` | Units, help text, eyebrows (≥ 7:1 on `--bg`) |
| `--accent` | `#FFC81E` | ResultBar, active state, focus, active tab, logo |
| `--stage` | `#FF6A2B` | Special stages (SS), « Ajouter une spéciale » button |
| `--link` | `#8FA3B8` | Links |

Text on yellow or orange = `#0B0C0E`. No decorative gradients, no shadows (except the focus ring). Patterns: **checkerboard** (6 px strip at the top of the screen, « Arrivée » marker) and **shift-lights** (desktop home only).

The dark theme is deliberate (readability and battery). If sun tests show a lack of readability, plan a high-contrast light theme later. It is not in the current scope.

## 3. Typography

| Role | Font | Weight / style | Mobile size | Notes |
|---|---|---|---|---|
| Home hero | Barlow Condensed | 800 italic, uppercase | 52 | line-height 0.9 |
| Screen title (header) | Barlow Condensed | 800 italic, uppercase | 26 | mono 10 « OUTIL 0x » eyebrow above |
| Card title | Barlow Condensed | 700, uppercase | 20 | letter-spacing 0.06em |
| Setting label | Barlow Condensed | 700, uppercase | 18 | with a color dot |
| Field label | Barlow | 600 | 14 | detail in 400 `--text-3` |
| Entered value | JetBrains Mono | 700 | 22–28 | **≥ 16 px mandatory** (otherwise iOS zooms on focus) |
| ResultBar number | JetBrains Mono | 700 | 36 | |
| Help text, units | JetBrains Mono / Barlow | 400–500 | 12–13 | |

Fonts via `next/font/google`, `display: swap`, `latin` subset. Numbers always formatted in `fr-FR` (`formatFr()`).

## 4. Layout

### AppShell (all tool screens)
```
┌ checkerboard 6 px ─────────────────┐
│ ←  OUTIL 01 / ESSENCE          ⟲  │  header 60 px, sticky
├────────────────────────────────────┤
│                                    │
│  stacked cards, gap 16,            │  scrollable area
│  padding 16                        │  scroll-padding-bottom = ResultBar + TabBar
│                                    │
├────────────────────────────────────┤
│ ▇ yellow ResultBar 27,0 L | 28 L ▇ │  sticky, margin 0 12 10
├────────────────────────────────────┤
│  Accueil  Essence  Vitesse  Volume │  TabBar 58 px + env(safe-area-inset-bottom)
└────────────────────────────────────┘
```
- Implementation: `height: 100dvh`, flex column; header and bars `flex-shrink: 0`, content `overflow-y: auto`.
- **Desktop (≥ 768 px)**: the same column with `max-width: 560px; margin-inline: auto`. `--bg` background around it. TabBar and ResultBar stay at the bottom of the column. **No 2 columns, no side panel.**
- Home: logo header, short hero, 3 full-width tool rows (76 px), tab bar.

## 5. Components

### StepperRow (replaces inline steppers)
Used for consumptions (Fuel) and engine speed (Wheel speed).
```
● LIAISON                 ≈ 20 L/100 km
┌──────┐ ┌──────────────────┐ ┌──────┐
│  −   │ │      0,20        │ │  +   │   60 px high
└──────┘ └──────────────────┘ └──────┘
  72 px        flexible         72 px
```
- Label row: dot + Condensed 18 uppercase label on the left, mono 12 `--text-3` equivalence on the right.
- Grid `72px 1fr 72px`, gap 8, height **60 px**, radius 14.
- Buttons: `--surface-2` background, `--line-strong` border, 26 px icon stroke 2.6. Pressed state: `--line` background, `scale(.97)`.
- **Value = real editable field** (`inputmode="decimal"`, centered, mono 700 28 px): you can type 0,23 directly instead of pressing 3 times.
- **Long press**: repeat after 400 ms, every 80 ms; a single click = one step. `touch-action: manipulation`, `user-select: none` on the buttons.
- One StepperRow per line. Several rows in the same card, separated by 18 px.
- Step: consumption 0.01 L/km; engine speed 100 rpm.

### Field
- `<input type="text" inputmode="decimal|numeric">` + `<label>` (visible or `.visually-hidden`). Parsing via `parseDecimal()`.
- Height 56–60 px, `--bg` background, `--line-strong` border, radius 12, mono 700 22–26 px. Unit as a right-hand suffix (mono 12–13 `--text-3`) or in the label (« Alésage mm »).
- Two fields maximum per row (Z1/Z2, Z3/Z4, Ø/squash, bore/stroke).
- Focus: `--accent` border + `box-shadow: 0 0 0 3px var(--focus-ring)`.
- Empty = 0 or « — »; error (Z2 = 0, etc.) = `--stage` border + help text under the field. Never blocking.

### Segmented control
`aria-pressed` buttons, **52 px** high, radius 12, mono 700 16–18 px, 4-column grid (overflow onto 2 rows if more than 4 options, e.g. cylinders 1·2·3·4 / 5·6·8). Active: `--accent` background, `--on-accent` text.

### Roadbook (Fuel)
- Grid `20px 1fr`. 2 px `--line` rail. Markers: Start (hollow circle), Link (`--link` circle), SS (`--stage` square), Finish (checkerboard).
- Row: 78 px column with the chip (« LIAISON 1 » / « ES 1 », mono 700 11 px) and the row's liters below (mono 12 `--text-3`), then the km field (56 px, flexible), then **one** 48 × 56 action:
  - mandatory link → dotted « + » (inserts an optional link after it),
  - optional link → trash,
  - SS → trash (removes the SS **and** the link that follows it).
- Below the finish: full-width **« + Ajouter une spéciale »** button (60 px, 2 px dotted `--stage` border, `--stage` text Condensed 800 20 px) that adds SS + link at the end of the list.
- Card header: « Roadbook » + mono counter « 2 ES · 77,6 km ».

### ResultBar
`--accent` background, `--on-accent` text, radius 14, padding 12×16, `aria-live="polite"`.
Left: mono 11 uppercase eyebrow (« À EMBARQUER · MARGE 10 % ») + mono 700 36 px value + Condensed unit. Right: secondary info (rounded 28 L / km/h per 1,000 rpm / compression ratio).
Always visible. The full detail is in the last card of the screen.

### TabBar
4 tabs (Accueil, Essence, Vitesse, Volume), 22 icon + Condensed 13 uppercase label, target ≥ 52 px. Active: `--accent` + `aria-current="page"`. `--surface` background, `--line` top border, `padding-bottom: max(22px, env(safe-area-inset-bottom))`.

### Tool header
Back button (44 × 44) to the home, « OUTIL 0x » eyebrow + title, reset button (44 × 44, bordered) on the right with `aria-label`.

### Card
`--surface` background, `--line` border, radius 16, padding 16, Condensed 700 20 uppercase title.

### Speed / rpm table
Grid `60px 1fr 56px`, 10 px bar, current rpm row (± 500) in `--accent`, rpm ≥ 10,000 in `--stage`.

## 6. Essential mobile details

- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, `theme-color` `#0B0C0E`.
- `100dvh` (not `100vh`); iOS safe areas at top and bottom.
- Keyboard open: the ResultBar may stay visible (the scrollable area shrinks); make sure the focused field stays visible (`scrollIntoView({ block: 'center' })` on focus if needed).
- `-webkit-tap-highlight-color: transparent` + visible pressed state to compensate.
- Light haptic feedback on stepper step if `navigator.vibrate` exists (10 ms). Optional, can be disabled.
- PWA: manifest + icon, usable offline (special stages are often in dead zones): precache of the 4 pages.

## 7. Iconography

Inline line SVGs (stroke 1.8–2.6, `currentColor`, rounded caps), 18–26 px: fuel pump, speedometer, piston, back arrow, refresh, plus, minus, trash, home. Decorative → `aria-hidden="true"`. No emoji.

## 8. Accessibility (blocking)

- Contrast ≥ 4.5:1 (all pairs in the table pass; `--placeholder` reserved for placeholders).
- Real `<button>`, `<a href>`, `<input>` + `<label>`. `aria-label` on all icon buttons (« Diminuer la consommation en liaison »…).
- `aria-live="polite"` on the ResultBar, `aria-pressed` on segments.
- Visible yellow focus, full keyboard navigation (also useful on a tablet with a keyboard).
- `prefers-reduced-motion` respected; `lang="fr"`.

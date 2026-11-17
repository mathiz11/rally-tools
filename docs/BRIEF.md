# Rally Tools — Redesign brief for the coding agent

> Read this file first, then `DESIGN_SYSTEM.md`, `TOOLS_SPEC.md` and `tokens.css`. `src/lib/calculators.ts` is ready to copy.

## Context

Rally Tools (https://rally-tools.vercel.app, author Mathis ENJOLRAS) is a small site of calculation tools for car rallying: **fuel to carry**, **wheel speed**, **volumetric calculation**. It currently runs on Next.js (pages router) + Semantic UI React + Formik/Yup, with a generic design (taupe banner, raw forms, results in a modal).

Goal: **complete visual and UX redesign**, same functional scope, with the improvements described in `TOOLS_SPEC.md`.

> **MOBILE FIRST — absolute priority.** The site is used at the side of special stages, on a phone, often with one hand, in the sun, sometimes with gloves. Design and test first at **375–390 px**. Desktop is **not** an enriched version: it is the same screen, centered (see `DESIGN_SYSTEM.md` §4).

Reference mockups: Design canvas "Rally Tools — refonte".
- **Primary reference** — "Mobile first" row: *Accueil — mobile*, *Essence — mobile*, *Vitesse roue — mobile*, *Volumétrique — mobile* (the 3 tools are interactive: Play button), *Styleguide*.
- Secondary reference — "Desktop" row: useful for visual direction only; the 2-column layout is **not** to be reproduced.

## Provided files

| File | Role |
|---|---|
| `README.md` | This brief: stack, architecture, tasks, acceptance criteria |
| `DESIGN_SYSTEM.md` | Art direction, colors, typography, components, mobile and a11y rules |
| `tokens.css` | CSS variables + reset/base to import globally |
| `TOOLS_SPEC.md` | Exact behavior of each tool, formulas, default values, test cases |
| `src/lib/calculators.ts` | Pure, typed calculation functions, ready to use |
| `src/lib/calculators.test.ts` | Vitest tests (14 tests, all green) |

## Target stack

- **Next.js 15, App Router, strict TypeScript.** Update the existing repo (no new repo).
- **Remove** `semantic-ui-react`, `semantic-ui-css`, `formik`, `yup`: the form is too simple to justify these dependencies.
- Styles: **CSS Modules + `tokens.css`** (no Tailwind, no UI lib). Fonts via `next/font/google`.
- State: local `useState`/`useReducer` + a `usePersistentState(key, defaults)` hook (localStorage, read after mount, 300 ms debounce).
- Tests: Vitest for `calculators.ts`; Playwright optional for one smoke test per page.
- All pages are static (SSG), deployed on Vercel as today.

## Proposed file tree

```
app/
  layout.tsx            # fonts, <html lang="fr">, viewport (width=device-width, viewport-fit=cover), AppShell
  globals.css           # @import tokens.css
  page.tsx              # Home
  essence/page.tsx
  vitesse-roue/page.tsx
  volumetrique/page.tsx
components/
  layout/AppShell.tsx   # tool header + scrollable area + ResultBar + TabBar (max 560 px column)
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

| New route | Old (308 redirect in `next.config`) |
|---|---|
| `/` | — |
| `/essence` | `/tools/fuel` |
| `/vitesse-roue` | `/tools/wheel` |
| `/volumetrique` | `/tools/volumetric` |

Per-page metadata (`title`: « Calculateur d'essence — Rally Tools », etc.) + short description. Favicon: yellow "RT" plate.

## Work order

Everything is developed and checked **in a 390 × 844 viewport** (DevTools, device mode) before looking at desktop.

1. Clean up dependencies, switch to App Router + TS, import `tokens.css`, wire up the fonts.
2. Copy `lib/calculators.ts` + tests, run `vitest` → green.
3. `ui/` components from `DESIGN_SYSTEM.md` §5 (and the Styleguide artboard).
4. Mobile `AppShell`: tool header, scrollable area, sticky yellow **ResultBar**, 4-tab **TabBar**, iOS safe areas.
5. Mobile home (short hero, 3 tool rows, tab bar).
6. Mobile Fuel → Wheel speed → Volumetric, faithful to the mobile artboards.
7. Persistence, reset, redirects, metadata, PWA manifest ("RT" icon, `display: standalone`, theme `#0B0C0E`).
8. Desktop (≥ 768 px): only center the column and adjust margins (§4 of the design system). Nothing more.
9. a11y pass + tests on real phones (iOS Safari, Chrome Android) + mobile Lighthouse.

## Acceptance criteria

- [ ] Rendering faithful to the **mobile artboards** (colors, typography, spacing, focus/active/pressed states).
- [ ] All touch targets ≥ 48 px; − / + buttons 72 × 60 px, **never several steppers on the same row**.
- [ ] Native numeric keyboard when opening each field (`inputmode="decimal"` or `"numeric"`); no iOS zoom on focus (font-size ≥ 16 px).
- [ ] The ResultBar never hides the field being edited (scroll-padding-bottom = ResultBar + TabBar height).
- [ ] No « Calculer » button or modal: live results.
- [ ] The test cases in `TOOLS_SPEC.md` display identically in the UI (27.0 L / 28 L; 200.6 km/h; 1,998 cm³ / 11.0 : 1).
- [ ] Input `14,2` and `14.2` accepted everywhere; never `NaN`, `Infinity` or `-0` on screen.
- [ ] Adding/removing a special stage keeps the entered km; adding/removing an optional link works.
- [ ] Values remembered after reload; reset works.
- [ ] No horizontal scroll at 360 px; desktop = same centered column, no regression.
- [ ] Keyboard: everything reachable, visible yellow focus; `aria-live` on results; **mobile** Lighthouse a11y ≥ 95, perf ≥ 90.
- [ ] Old `/tools/*` URLs redirected.
- [ ] `vitest` green, `tsc --noEmit` and lint clean.

## Decisions approved by Mathis

1. **Volumetric**: the existing formula `π × √d / 4 × h` was a bug. We compute displacement (π × bore² / 4 × stroke × cylinders) + the optional compression ratio. See `TOOLS_SPEC.md` §03.
2. **Z1–Z4 labels**: gearbox (driving / driven), final drive (pinion / crown wheel). The 20 mm tyre squash becomes an editable field.
3. **Mobile first**: desktop is secondary.

## New features to keep

- **Fuel safety margin** (0 / 5 / 10 / 15 %, default 10 %).
- **Roadbook pre-filled** with 2 special stages.
- The number of special stages is managed **in the roadbook** (« Ajouter une spéciale » + trash) instead of a stepper.

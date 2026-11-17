# Rally Tools

Calculators for rallying, designed for a phone at the side of a special stage: **fuel to carry**, **wheel speed**, **displacement / compression ratio**. Live results, values remembered on the device, works offline.

The app UI is in French (labels quoted in the docs, such as « Calculer » or « Ajouter une spéciale », are literal UI strings). Code, comments and documentation are in English.

Original specifications (design system, formulas, brief): [`docs/`](docs).

## Stack

| | |
|---|---|
| Build | Vite 8, 100% static site |
| UI | Preact (≈ 4 KB), strict TypeScript |
| Styles | CSS Modules + `src/styles/tokens.css` (design source of truth) |
| Fonts | `@fontsource` (Barlow, Barlow Condensed, JetBrains Mono), self-hosted |
| Tests | Vitest on the calculation functions |
| Offline | Service worker generated at build time (no dependency) |

Runtime dependencies: `preact` only.

## Commands

```bash
npm install
npm run dev        # http://localhost:5173 — test in device mode, 390 × 844
npm test           # vitest: formulas + formatting
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + build into dist/
npm run preview    # serves dist/ (required to test the service worker)
```

## Structure

```
src/
  lib/calculators.ts   pure formulas (no UI) — the only source of calculations
  lib/format.ts        FR formatting (never NaN / -0)
  hooks/               usePersistentState (localStorage), useLongPress (steppers)
  components/ui/       Card, Field, StepperRow, Segmented, DetailRows…
  components/layout/   AppShell, ToolHeader, TabBar, ResultBar
  components/tools/    per-tool cards + default state/validation
  pages/               Home, Fuel, Wheel, Volumetric (wire state → calculation → UI)
  routes.ts            routes, titles, descriptions, legacy URLs
scripts/
  vite-plugin-pwa.ts   at build time: one HTML page per route + sw.js (precache)
```

**The UI contains no formulas**: pages call `computeFuel`, `computeWheelSpeed`, `computeDisplacement`.

## Adding a tool

1. Pure function + tests in `src/lib/calculators.ts`.
2. Folder `src/components/tools/<tool>/` (default state + `sanitize…`, cards).
3. Page in `src/pages/`, entry in `PAGES` (`src/app.tsx`), in `ROUTES` (`src/routes.ts`) and in `TABS` (`TabBar.tsx`).
4. Redirect line in `vercel.json` if the tool replaces a legacy URL.

## Deployment

```bash
git remote add origin git@github.com:<account>/rally-tools.git
git push -u origin main
```

Then on Vercel: **Add New → Project → import the repository**. The *Vite* preset is detected (`vercel.json` also sets build and output), nothing to configure. Every push to `main` redeploys; other branches get previews.

`vercel.json` handles clean URLs (`/essence`), the 308 redirects `/tools/*` → new routes, immutable caching of assets and no caching of `sw.js`.

To replace the old site (same Vercel project): connect this repository to the existing `rally-tools` project and switch the *Framework Preset* to Vite.

## Things to know

- **Persistence**: `localStorage`, keys `rally-tools:v1:fuel|wheel|volumetric`, writes debounced by 300 ms. Synchronous read on mount: the app has no server rendering, so there is no hydration mismatch. A corrupted state falls back to the defaults. To change the stored format, move to `v2`.
- **Roadbook**: pre-filled with 2 special stages (structure) but **empty kilometres**. The values from the mockup (12 / 8.4 / 25 / 14.2 / 18 km → 27.0 L) are the test case.
- **Volumetric**: chamber volume defaults to 50 cm³, as in the mobile mockup, to display 11.0 : 1.
- **Offline**: the whole build is precached when the service worker installs; a new version activates on the next reload.
- **One page per route**: the build duplicates `index.html` into `essence.html`… with the right `<title>` and description (sharing, SEO); the content is still rendered client-side.

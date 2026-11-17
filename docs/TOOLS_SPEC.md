# Rally Tools — Functional specification of the tools

Formulas and logic extracted from the production code (Next.js bundles of rally-tools.vercel.app, November 2026), then rewritten. Tested reference implementation: `src/lib/calculators.ts` (+ `calculators.test.ts`, 14 tests green). **The UI must contain no formulas**: it calls these functions.

Behaviors common to the 3 tools:

- **Live** calculation on every input (no « Calculer » button, no more « Résultat / Quitter » modal).
- Empty fields = 0 or result « — »; never a blocking error, never `NaN` / `Infinity` on screen.
- FR and EN decimal input accepted (`14,2` and `14.2`) via `parseDecimal()`.
- Display via `formatFr()`.
- **Local persistence**: each tool's state is saved in `localStorage` (`rally-tools:v1:fuel`, `…:wheel`, `…:volumetric`), read after mount (not during SSR, to avoid hydration mismatches). 300 ms debounce. « Réinitialiser » / « Valeurs par défaut » button = clears the key and restores the defaults.
- Shareable link (optional, P2): serialize the state into query params.

---

## 01 — Fuel (`/essence`, formerly `/tools/fuel`)

### Existing
- Steppers: link consumption (default 0.2, step 0.01), special-stage consumption (0.6, step 0.01), number of special stages (0, step 1).
- Chevron button (disabled if a value = 0) that generates the list: Link, Special, Link, …, Link. « + » button on a mandatory link to insert an optional link, trash to remove it.
- « Calculer » submit → `Σ(link km × link consumption) + Σ(special km × special consumption)`, displayed as « X L ».

### New behavior
Mobile screen, top to bottom (artboard *Essence — mobile*):

| Block | Detail |
|---|---|
| « Consommations » card | Two full-width **StepperRows**, one below the other (never side by side): **Liaison** (L/km, default **0.20**, help « ≈ 20 L/100 km ») then **Spéciale** (default **0.60**). Step 0.01, min 0, long press = auto-repeat, value directly typeable. |
| « Roadbook » card | Pre-filled with **2 special stages** (`buildSegments(2)`): Start → Link 1 → SS 1 → Link 2 → SS 2 → Link 3 → Finish. Counter « n ES · total km » in the header. |
| Row | Chip + liters for the row, km field (free step, decimal), one action: « + » on a mandatory link (`insertLink`), trash on an optional link (`removeLink`), trash on an SS (`removeStage`: removes the SS **and** the following link). |
| « + Ajouter une spéciale » | Full-width button below the finish (`addStage`): adds SS + link at the end of the roadbook. **Replaces the « number of special stages » stepper** of the existing site (and its chevron button). |
| « Marge de sécurité » card | **New.** Segmented 0 / 5 / 10 / 15 %, default 10 %. |
| « Détail » card | Breakdown bar, links (km, L), special stages (km, L), margin (+ L), total without margin (2 decimals). |
| ResultBar | « À embarquer · marge 10 % » → total **with margin** (1 decimal); on the right « Arrondi N L » (rounded up to the next liter). |

Numbering: links and SSs are numbered separately in order of appearance (`segmentLabels`); an added link shifts the following ones. Removing all SSs leaves at least one link.

### Formula
```
L = Σ km_link × consumption_link + Σ km_SS × consumption_SS
L_margin = L × (1 + margin/100)
rounded = ceil(L_margin)
```
Test case (mockup): consumption 0.20 / 0.60, km [12, 8.4, 25, 14.2, 18], margin 10 % → 24.56 L, **27.0 L**, rounded **28 L**.

---

## 02 — Wheel speed (`/vitesse-roue`, formerly `/tools/wheel`)

### Existing
Formik form (all fields required): Engine speed 9600, Z1 20, Z2 25, Z3 11, Z4 50, Wheel diameter 650 → modal « X km/h ».
```
v = speed × (z1/z2) × (z3/z4) × (diameter − 20) × π × 6e-5
```

### New behavior
| Field | Unit | Default | UI note |
|---|---|---|---|
| Engine speed (Régime moteur) | rpm | 9600 | **StepperRow** (− / + by 100, long press, typeable value) + full-width **slider** 1,000 → 12,000, synchronized |
| Z1 · driving gear | teeth | 20 | « Boîte · rapport engagé » group, shows Z1/Z2 = 0.800 |
| Z2 · driven gear | teeth | 25 | |
| Z3 · pinion | teeth | 11 | « Pont · couple final » group, shows Z3/Z4 = 0.220 |
| Z4 · crown wheel | teeth | 50 | |
| Wheel diameter | mm | 650 | mounted tyre |
| Squash (Écrasement) | mm | **20** | **new field**: this was the hard-coded `− 20`. Help: « Diamètre utile = … mm » |

> Z1–Z4 labels (gearbox driving / driven, final drive pinion / crown wheel) approved by Mathis.

Mobile screen: cards Engine speed → Gearbox (Z1 | Z2 on one row, ratio in the header) → Final drive (Z3 | Z4) → Wheel (Ø | squash, effective diameter and circumference as help) → Per rpm (table 4,000 → 11,000, current rpm row ± 500 in yellow, overall ratio in the header, formula).
ResultBar: « À 9 600 tr/min » → speed (1 decimal) km/h; on the right km/h per 1,000 rpm.
Z2 or Z4 = 0, or effective diameter ≤ 0 → « — » (the function returns `null`).

Test case: defaults → **200.64 km/h** (displayed 200.6), overall ratio 0.176, ≈ 20.9 km/h per 1,000 rpm.

---

## 03 — Volumetric (`/volumetrique`, formerly `/tools/volumetric`)

### Existing — confirmed bug
Fields « Diamètre roue » and « Hauteur », result in « cc »:
```
π × √diameter / 4 × height      ← square root instead of square
```
With 86 / 86 this gives ≈ 626 « cc », which matches no physical volume. The « Diamètre roue » label is probably a copy-paste from tool 02.

### New behavior (engine displacement — approved)
| Field | Unit | Default |
|---|---|---|
| Bore (Alésage) | mm | 86 |
| Stroke (Course) | mm | 86 |
| Number of cylinders | segmented 1·2·3·4·5·6·8 | 4 |
| Chamber volume (optional) | cm³ per cylinder | 50 in the mockup, empty by default in prod |

```
V_unit [cm³] = π × bore² / 4 × stroke / 1000
V_total = V_unit × cylinders
ε (compression ratio) = (V_unit + V_chamber) / V_chamber
stroke/bore < 0.95 → oversquare · 0.95–1.05 → square · > 1.05 → long stroke
```
Mobile screen: Cylinder card (bore | stroke, cylinders as 4-column segmented: 1·2·3·4 / 5·6·8) → Chamber card (optional) → Detail card (small SVG diagram + unit volume 1 decimal, piston area cm² 2 decimals, liters 2 decimals, stroke/bore + engine shape) → formula.
ResultBar: « Cylindrée · 4 cyl. » → total cm³ (0 decimals); on the right compression ratio « 11,0 : 1 » or « — ».

Test case: 86 × 86 × 4 → **1,998 cm³** (499.6 per cylinder); chamber 50 cm³ → **11.0 : 1**.

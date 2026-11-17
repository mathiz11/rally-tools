export interface WheelState {
  rpm: number;
  z1: number;
  z2: number;
  z3: number;
  z4: number;
  /** Wheel diameter (mounted tyre), mm. */
  diameter: number;
  /** Tyre squash, mm (the historical « − 20 »). */
  crush: number;
}

export const makeWheelDefaults = (): WheelState => ({
  rpm: 9600,
  z1: 20,
  z2: 25,
  z3: 11,
  z4: 50,
  diameter: 650,
  crush: 20,
});

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;

export function sanitizeWheel(stored: unknown, defaults: WheelState): WheelState {
  if (typeof stored !== 'object' || stored === null) return defaults;
  const s = stored as Record<string, unknown>;
  const pick = (k: keyof WheelState) => (isNum(s[k]) ? (s[k] as number) : defaults[k]);
  return {
    rpm: pick('rpm'),
    z1: pick('z1'),
    z2: pick('z2'),
    z3: pick('z3'),
    z4: pick('z4'),
    diameter: pick('diameter'),
    crush: pick('crush'),
  };
}

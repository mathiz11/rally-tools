import type { SVGAttributes } from 'preact';

const PATHS = {
  back: 'M15 5l-7 7 7 7',
  chevron: 'M9 5l7 7-7 7',
  refresh: 'M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3',
  home: 'M4 11l8-7 8 7M6 10v10h12V10',
  fuel: 'M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h14M5 10h10M15 8h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3',
  gauge: 'M3.5 17a8.5 8.5 0 1 1 17 0M12 17l4.5-5.5',
  piston: 'M6 4h12v10H6zM6 8h12M12 14v4M10 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'name' | 'stroke'> {
  name: IconName;
  size?: number;
  stroke?: number;
}

/** Icônes SVG au trait, décoratives (aria-hidden) : le libellé est porté par le bouton. */
export function Icon({ name, size = 22, stroke = 1.8, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={stroke}
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

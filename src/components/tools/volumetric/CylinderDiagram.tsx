import { frMax } from '../../../lib/format';

interface Props {
  bore: number;
  stroke: number;
}

/** Cylinder diagram: the height follows the stroke/bore ratio (clamped to stay readable). */
export function CylinderDiagram({ bore, stroke }: Props) {
  const ratio = bore > 0 ? stroke / bore : 1;
  const w = 64;
  const h = Math.min(92, Math.max(40, w * ratio));
  const x = 20;
  const y = 26;
  return (
    <svg viewBox="0 0 150 130" width="150" height="130" role="img" aria-label={`Cylindre : alésage ${frMax(bore, 1)} mm, course ${frMax(stroke, 1)} mm`}>
      <g fill="none" stroke="var(--text-3)" stroke-width="1.5" stroke-linecap="round">
        {/* bore */}
        <path d={`M${x} 14h${w}M${x} 10v8M${x + w} 10v8`} />
        {/* stroke */}
        <path d={`M${x + w + 16} ${y}v${h}M${x + w + 12} ${y}h8M${x + w + 12} ${y + h}h8`} />
      </g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="var(--line-strong)" stroke-width="2" rx="3" />
      <path d={`M${x} ${y + 12}h${w}`} stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3" />
      <rect x={x + 2} y={y + h - 14} width={w - 4} height="12" fill="var(--accent)" rx="2" />
      <g class="num" font-family="var(--font-mono)" font-size="11" fill="var(--text-3)">
        <text x={x + w / 2} y="9" text-anchor="middle">
          Ø {frMax(bore, 1)}
        </text>
        <text x={x + w + 26} y={y + h / 2 + 4}>
          {frMax(stroke, 1)}
        </text>
      </g>
    </svg>
  );
}

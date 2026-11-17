import styles from './Segmented.module.css';

interface SegmentedProps<T extends number | string> {
  /** Group name for screen readers. */
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
}

/** Segmented control: aria-pressed buttons, 52 px, wraps onto several rows beyond `columns`. */
export function Segmented<T extends number | string>({ label, options, value, onChange, columns = 4 }: SegmentedProps<T>) {
  return (
    <div class={styles.group} role="group" aria-label={label} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          class={`num ${styles.seg}`}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

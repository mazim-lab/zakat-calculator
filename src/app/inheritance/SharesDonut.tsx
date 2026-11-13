// Dependency-free SVG donut chart for the estate distribution.
// Works as a server or client component (no hooks). Colors come from the
// design tokens via CSS variables, so the chart follows light and dark mode.
import { formatPercent, formatUSD } from "@/lib/inheritance/fraction";

export interface DonutSlice {
  name: string;
  value: number;
  share: number;
  fraction: string;
}

/** Token palette: identity and status hues, then their lighter -border tokens. */
export const DONUT_COLORS = [
  "var(--indigo)",
  "var(--cyan)",
  "var(--fuchsia)",
  "var(--success)",
  "var(--warning)",
  "var(--neutral-mix)",
  "var(--indigo-border)",
  "var(--cyan-border)",
  "var(--fuchsia-border)",
  "var(--success-border)",
  "var(--warning-border)",
  "var(--border-strong)",
];

export function colorFor(index: number): string {
  return DONUT_COLORS[index % DONUT_COLORS.length];
}

export function SharesDonut({ data, title = "Estate distribution" }: { data: DonutSlice[]; title?: string }) {
  const total = data.reduce((sum, d) => sum + d.share, 0);
  const summary =
    `${title}: ` + data.map((d) => `${d.name} ${d.fraction} (${formatPercent(d.share)}), ${formatUSD(d.value)}`).join("; ") + ".";

  // Each slice is a circle stroke with a dash of its percentage (pathLength=100).
  // This draws a 100% slice correctly, which an arc path cannot.
  const gap = data.length > 1 ? 0.4 : 0;
  const pcts = data.map((d) => (total > 0 ? (d.share / total) * 100 : 0));
  const starts = pcts.map((_, i) => pcts.slice(0, i).reduce((a, b) => a + b, 0));
  const slices = data.map((d, i) => {
    const pct = pcts[i];
    const offset = starts[i];
    const dash = Math.max(0, pct - gap);
    const el = (
      <circle
        key={i}
        cx="60"
        cy="60"
        r="44"
        fill="none"
        stroke={colorFor(i)}
        strokeWidth="22"
        pathLength={100}
        strokeDasharray={`${dash} ${100 - dash}`}
        strokeDashoffset={-offset}
        transform="rotate(-90 60 60)"
      />
    );
    return el;
  });

  return (
    <div className="grid gap-6 sm:grid-cols-[210px_1fr] sm:items-center">
      <svg viewBox="0 0 120 120" width="210" height="210" role="img" aria-label={summary} className="mx-auto max-w-full h-auto">
        <circle cx="60" cy="60" r="44" fill="none" stroke="var(--surface)" strokeWidth="22" />
        {slices}
      </svg>
      <ul className="list-none p-0 m-0 grid gap-2" aria-label={`${title} legend`}>
        {data.map((d, i) => (
          <li key={i} className="flex items-start gap-3 text-[17px]">
            <span
              aria-hidden="true"
              className="mt-1.5 inline-block w-3.5 h-3.5 shrink-0 [mask:var(--star-fill)_center/contain_no-repeat] [-webkit-mask:var(--star-fill)_center/contain_no-repeat]"
              style={{ background: colorFor(i) }}
            />
            <span className="flex-1 min-w-0 text-text">{d.name}</span>
            <span className="num text-text-2 whitespace-nowrap ui">
              {d.fraction} · {formatPercent(d.share)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

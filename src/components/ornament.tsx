// Geometric ornament for the Islamic Hisab identity. Every shape here is built
// from one construction: the khatam, an eight-point star made of two squares
// turned 45 degrees against each other. Colours come from the design tokens.
import type { ReactNode } from "react";

/** Khatam outline in a 28 x 28 box (outer radius 13.5). */
export const STAR_28 =
  "M14 .5l3.95 3.95h5.6v5.6L27.5 14l-3.95 3.95v5.6h-5.6L14 27.5l-3.95-3.95h-5.6v-5.6L.5 14l3.95-3.95v-5.6h5.6Z";

/** The logo mark: a khatam with one of its eight kites set apart (one eighth, a share). */
export function StarMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className} focusable="false">
      <path
        fill="var(--mark-star, var(--indigo))"
        d="M32 1l9.08 9.08h12.84v12.84L63 32l-9.08 9.08v12.84H41.08L32 63l-9.08-9.08H10.08V41.08L1 32l9.08-9.08V10.08h12.84Z"
      />
      <path
        fill="var(--mark-share, var(--cyan))"
        stroke="var(--mark-gap, var(--bg))"
        strokeWidth="2.4"
        strokeLinejoin="round"
        d="M32 32 22.92 10.08 32 1l9.08 9.08Z"
      />
      <path fill="var(--mark-gap, var(--bg))" d="m33.91 27.38 2.71 2.71v3.82l-2.71 2.71h-3.82l-2.71-2.71v-3.82l2.71-2.71Z" />
    </svg>
  );
}

/** A numbered khatam, used for step markers and ordered lists (like a manuscript's rosette markers). */
export function Rosette({
  n,
  state = "todo",
  size = 34,
}: {
  n: ReactNode;
  state?: "todo" | "current" | "done";
  size?: number;
}) {
  return (
    <span className={`rosette rosette-${state}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 28 28" width={size} height={size}>
        <path d={STAR_28} />
      </svg>
      <span className="rosette-n num">{n}</span>
    </span>
  );
}

/** Horizontal divider: a double rule (jadwal) broken by a small khatam. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`ornament ${className}`} aria-hidden="true">
      <span className="ornament-rule" />
      <svg viewBox="0 0 28 28" width="16" height="16">
        <path d={STAR_28} />
      </svg>
      <span className="ornament-rule" />
    </div>
  );
}

/**
 * A niche: a frame whose head is a four-centred pointed arch, as in Persian and
 * Timurid iwans and prayer-niche panels. Used to hold a result or a welcome.
 * The default head has a fixed height and stretches in width (a broad, low
 * iwan arch); the tall variant keeps its proportions.
 */
export function Niche({
  children,
  className = "",
  label,
  tall = false,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
  tall?: boolean;
}) {
  const d = tall
    ? "M0 46V30C0 18 12 12 30 8.5 40 6.5 46 4 50 0c4 4 10 6.5 20 8.5 18 3.5 30 9.5 30 21.5v16"
    : "M0 84V56C0 36 16 26 34 19 42 16 47 10 50 1c3 9 8 15 16 18 18 7 34 17 34 37v28";
  return (
    <div className={`niche ${tall ? "niche-tall" : ""} ${className}`} role={label ? "group" : undefined} aria-label={label}>
      <svg className="niche-arch" viewBox={tall ? "0 0 100 46" : "0 0 100 84"} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path className="niche-fill" d={d + "Z"} />
        <path className="niche-line" vectorEffect="non-scaling-stroke" d={d} />
      </svg>
      <span className="niche-apex" aria-hidden="true">
        <svg viewBox="0 0 28 28" width="14" height="14">
          <path d={STAR_28} />
        </svg>
      </span>
      <div className="niche-body">{children}</div>
    </div>
  );
}

/** A cartouche with pointed ends and a double rule, holding a short title (for example a tool's Arabic name). */
export function Cartouche({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`cartouche ${className}`}>
      <svg viewBox="0 0 200 92" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path
          d="M3 46 26 3h148l23 43-23 43H26Z"
          fill="var(--hue-bg)"
          stroke="var(--hue-border)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M14 46 31 10h138l17 36-17 36H31Z"
          fill="none"
          stroke="var(--hue-border)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}

/** Step track for the guided calculators: a row of rosettes on a thread, with the step name. */
export function Stepper({ labels, current, label = "Progress" }: { labels: string[]; current: number; label?: string }) {
  return (
    <div className="stepper">
      <p className="stepper-caption">
        <span className="text-text-2">
          Step <span className="num">{current + 1}</span> of <span className="num">{labels.length}</span>
        </span>
        <span className="stepper-name">{labels[current]}</span>
      </p>
      <ol className="stepper-track" aria-label={label}>
        {labels.map((l, i) => {
          const state = i === current ? "current" : i < current ? "done" : "todo";
          return (
            <li
              key={l}
              aria-label={`Step ${i + 1} of ${labels.length}: ${l}${state === "done" ? " (completed)" : ""}`}
              aria-current={state === "current" ? "step" : undefined}
            >
              <Rosette n={i + 1} state={state} size={30} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

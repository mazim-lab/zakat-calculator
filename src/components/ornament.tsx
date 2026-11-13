// Geometric ornament for the Islamic Hisab identity. Every shape here is built
// from one construction: the khatam, an eight-point star made of two squares
// turned 45 degrees against each other. Colours come from the design tokens.
import type { ReactNode } from "react";

/** Khatam outline in a 28 x 28 box (outer radius 13.5). */
export const STAR_28 =
  "M14 .5l3.95 3.95h5.6v5.6L27.5 14l-3.95 3.95v5.6h-5.6L14 27.5l-3.95-3.95h-5.6v-5.6L.5 14l3.95-3.95v-5.6h5.6Z";

/**
 * The logo mark: a khatam divided into eight equal kites (each exactly one eighth
 * of the star's area), with the upper-right kite drawn apart, as a share is set
 * apart from an estate. True cut-outs, so it works on any background and in one
 * colour. Geometry is generated in design-reviews/identity-2026-11/brand-assets.py.
 */
export const MARK_BODY =
  "M32 1 22.92 10.08H10.08v12.84L1 32l9.08 9.08v12.84h12.84L32 63l9.08-9.08h12.84V41.08L63 32l-8.09-8.09-25.31 10.49 10.49-25.31Z";
export const MARK_SHARE = "M34.42 29.58 54.92 21.09V9.08H42.91Z";

export function StarMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className} focusable="false">
      <path fill="var(--mark-star, var(--indigo))" d={MARK_BODY} />
      <path fill="var(--mark-share, var(--cyan))" d={MARK_SHARE} />
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
 * Timurid iwans and niche panels. Used to hold a result or a welcome.
 *
 * Construction (in a 200-unit span): each side is two circular arcs that meet
 * tangentially, a tight haunch arc (radius 36, swept 55 degrees from the
 * springing line) and a long upper arc (radius 300) whose centre lies beyond the
 * midline, so the two upper arcs meet at a point. Every part is convex; there is
 * no reverse curve, so it never reads as an ogee, onion or dome. The head always
 * scales uniformly (aspect ratio fixed), never stretched.
 */
const ARCH_H = 70.72;
const ARCH_D = "M0 70.72A36 36 0 0 1 15.35 41.23A300 300 0 0 1 100 0A300 300 0 0 1 184.65 41.23A36 36 0 0 1 200 70.72";

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
  return (
    <div className={`niche ${tall ? "niche-tall" : ""} ${className}`} role={label ? "group" : undefined} aria-label={label}>
      <svg className="niche-arch" viewBox={`0 0 200 ${ARCH_H}`} aria-hidden="true" focusable="false">
        <path className="niche-fill" d={ARCH_D + "Z"} />
        <path className="niche-line" vectorEffect="non-scaling-stroke" d={ARCH_D} />
      </svg>
      <span className="niche-apex" aria-hidden="true">
        <svg viewBox="0 0 28 28" width="14" height="14">
          <path d={STAR_28} />
        </svg>
      </span>
      <div className="niche-body">
        <div className="niche-content">{children}</div>
      </div>
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

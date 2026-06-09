import * as React from "react";
import { cn } from "@/lib/utils";

export interface ScoreDialProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** 0-100. Clamped internally. */
  value: number;
  /** Small caption rendered under the big number. */
  label?: string;
  /** Stroke color of the progress arc. Defaults to the dashboard accent. */
  accent?: string;
  /**
   * Glow color for the arc's drop-shadow. Defaults to `accent`.
   * Pass a rarity color to make the bloom match the tier.
   */
  glow?: string;
  /** Outer pixel size of the square SVG. */
  size?: number;
  /** Use the display (Cinzel) font for the big number. */
  display?: boolean;
}

/**
 * Standalone SVG circular progress dial. Two concentric <circle>s: a faint
 * track and a foreground arc whose length is `value`% of the circumference.
 * Pure/presentational — safe in a server component.
 *
 * The <svg> is `overflow-visible` (via the `.dial-svg` class in globals.css)
 * so the arc's glow bloom is NOT hard-clipped at the viewport edge. Make sure
 * no ancestor clips it with `overflow-hidden`.
 */
export function ScoreDial({
  value,
  label,
  accent = "var(--accent)",
  glow,
  size = 180,
  display = false,
  className,
  ...props
}: ScoreDialProps) {
  const pct = Math.max(0, Math.min(100, value));
  const stroke = Math.max(6, Math.round(size * 0.06));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;
  const center = size / 2;
  const glowColor = glow ?? accent;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Score ${Math.round(pct)} out of 100${label ? `, ${label}` : ""}`}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="dial-svg -rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-white/[0.07]"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
          style={{
            filter: `drop-shadow(0 0 ${Math.round(
              size * 0.05,
            )}px color-mix(in srgb, ${glowColor} calc(60% * var(--glow)), transparent))`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={cn(
            "leading-none tracking-tight text-white tabular-nums",
            display ? "font-[family-name:var(--font-display)] font-bold" : "font-semibold",
          )}
          style={{ fontSize: size * (display ? 0.36 : 0.28) }}
        >
          {Math.round(pct)}
        </span>
        {label ? (
          <span
            className="mt-1 font-medium uppercase tracking-wider"
            style={{ fontSize: size * 0.085, color: glowColor }}
          >
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

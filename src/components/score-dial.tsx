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
  /** Outer pixel size of the square SVG. */
  size?: number;
}

/**
 * Standalone SVG circular progress dial. Two concentric <circle>s: a faint
 * track and a foreground arc whose length is `value`% of the circumference.
 * Pure/presentational — safe in a server component.
 */
export function ScoreDial({
  value,
  label,
  accent = "var(--accent)",
  size = 180,
  className,
  ...props
}: ScoreDialProps) {
  const pct = Math.max(0, Math.min(100, value));
  const stroke = Math.max(6, Math.round(size * 0.07));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;
  const center = size / 2;

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
        className="-rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-white/10"
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
          style={{ filter: "drop-shadow(0 0 6px color-mix(in srgb, var(--accent) 45%, transparent))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="font-semibold leading-none tracking-tight text-white"
          style={{ fontSize: size * 0.28 }}
        >
          {Math.round(pct)}
        </span>
        {label ? (
          <span
            className="mt-1 font-medium uppercase tracking-wider"
            style={{ fontSize: size * 0.085, color: accent }}
          >
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

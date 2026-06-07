import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Progress value, 0-100. Clamped internally. */
  value?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const pct = Math.max(0, Math.min(100, value));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-white/10",
          className,
        )}
        {...props}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: "var(--accent)" }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };

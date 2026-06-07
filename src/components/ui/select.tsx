import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

/**
 * Styled wrapper around the native <select>. Options are passed through as
 * children: <Select><option value="us">US</option>...</Select>.
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-9 text-sm text-white shadow-sm transition-colors",
            "focus-visible:outline-none focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[&>option]:bg-[#14171c] [&>option]:text-white",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/50"
          aria-hidden="true"
        />
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
